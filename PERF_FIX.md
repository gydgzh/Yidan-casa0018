# 几秒后 fps 掉到 1 的修复 — 给本地 AI 的执行单

## 你截图里告诉了我两件事

```
fps: 1                                              ← GPU 已挂队
frames: 35                                          ← 只处理 35 帧人脸就卡了
[21:23:58] failed: Invalid typed array length: 103292   ← 仓库里 avatar.glb 损坏
```

→ 不是数据库问题，**是性能 + 文件损坏的双重故障**。

### 故障 1：本地 `models/avatar.glb` 损坏
日志里这一行 `failed: Invalid typed array length: 103292` 是 GLTFLoader 解析失败，说明仓库里那个 .glb 是坏的（不是 10MB 完整文件，而是被 git 当成文本污染过）。所以页面回退到 jsdelivr CDN，每次刷新都得**重下 10MB**。

### 故障 2：fps 爆炸
我之前的代码每个 RAF（桌面 60Hz）都调一次 MediaPipe + 偶尔加 LSTM 推理。MediaPipe 设计用来跑 30 fps，跑 60 fps 时 GPU 队列开始堆积。再加上 TFJS 也用 GPU，几秒钟后两边争 GPU → 整个推理 stall → fps 掉到 1。

## v5 改了什么

| 改动 | 效果 |
|---|---|
| **MediaPipe 限频 30Hz**（默认 `DETECT_HZ=30`） | 去掉 GPU 排队压力；URL `?detecthz=20` 还能更保守 |
| 渲染照样每帧跑（60Hz 平滑插值），detection 单独 30Hz | 视觉流畅 + 计算节省，两者解耦 |
| **复用 `THREE.Matrix4` / `Quaternion` / `Euler` 三个对象** | 之前每帧 new 三次，GC 频繁触发拖慢；现在零分配 |
| **LSTM 推理频率从每 6 帧 → 每 10 帧** | 降低 GPU 共用压力 |
| URL `?nofx=1` 完全关 LSTM | 测试谁是瓶颈用 |
| HUD 多了 `detect: N ms` | 直观看 MediaPipe 单次耗时（健康 < 20ms） |
| `download_avatar.sh` 自动写 `.gitattributes` 标记 .glb 为 binary | 防止 git 损坏二进制文件 |

## 给本地 AI 的执行单（按顺序）

```bash
SRC="$HOME/Library/Application Support/Claude/local-agent-mode-sessions"
SRC="$(find "$SRC" -name PERF_FIX.md -print -quit | xargs dirname)"

cd ~/Yidan-casa0018

# === 1) 拷新版 ===
cp "$SRC/mobile_avatar.html" .
cp "$SRC/download_avatar.sh" .
cp "$SRC/PERF_FIX.md" .
chmod +x download_avatar.sh

# === 2) 重下损坏的 avatar.glb（脚本会自己写 .gitattributes 防止再损坏）===
# 先彻底删掉旧的，从 git 历史里也删
rm -f models/avatar.glb
git rm -f --cached models/avatar.glb 2>/dev/null || true

bash download_avatar.sh
# 输出应该看到：
#   size: ~10000000 bytes (~10 MB)
#   magic OK (glTF)
#   git: tracked as binary OK

# === 3) 提交（注意 .gitattributes 必须和 glb 一起 push）===
git add .gitattributes mobile_avatar.html download_avatar.sh PERF_FIX.md models/avatar.glb
git commit -m "v5: 30Hz throttle + reuse objects + repair binary glb"
git push

# === 4) 验证仓库里 glb 真的是 10MB ===
curl -sI "https://gydgzh.github.io/Yidan-casa0018/models/avatar.glb" \
  | grep -i content-length
# 应该看到约 10000000，不是 103292
```

## push 之后浏览器测试

GitHub Pages 缓存 30-60 秒。打开：

```
https://gydgzh.github.io/Yidan-casa0018/mobile_avatar.html?debug=1
```

允许摄像头后看屏左下"日志"按钮里：

✅ 期望日志：
```
trying: ./models/avatar.glb
avatar OK · avatar.glb · morphs=N · bones=NN · head=mixamorigHead
```
（**第一行就成功**，不再 fallback 到 jsdelivr。）

✅ 期望 HUD：
```
fps: 28-30          ← 5 分钟后还应该是这个数
frames: 持续涨
detect: 5-15 ms      ← MediaPipe 单帧耗时；> 30ms 说明该降频
```

## 如果 5 分钟测试还是会掉 fps

按这个矩阵排查（**每个 URL 独立测一次**）：

| URL | 测什么 | 如果 fps 稳定 → 凶手 |
|---|---|---|
| `?nofx=1` | 关掉 LSTM 动作识别 | LSTM 是瓶颈 → 把 `INFER_EVERY` 调大到 20 |
| `?detecthz=15` | MediaPipe 降到 15Hz | MediaPipe 是瓶颈 → 默认改 15Hz |
| `?nofx=1&detecthz=20` | 都降 | 设备 GPU 弱（旧 iPhone） |

挑出最稳定的一组之后，让本地 AI 把那组数字写进默认（编辑 `parseFloat(Q.get('detecthz')) || 30` 那几行的兜底值）。

## 为什么不需要数据库

数据库是为了**持久化**：保存历史数据、用户配置、训练记录。
你这个场景：
- 摄像头帧 → MediaPipe → blendshape → 头像驱动 → 屏幕
- 全是**实时流**，过去的帧丢了也没意义
- LSTM 也是从 30 帧滑窗预测下一动作，无需历史

→ 0 字节存储需求。fps 掉是 GPU 堵塞，不是 IO 问题。

## 文件损坏的根因（学一下，下次别再发生）

Mac 上 git 默认会对**所有文件**做 LF↔CRLF 行尾转换（如果 `core.autocrlf=input`）。如果一个 .glb 里恰好有 `0x0A`（换行）字节，git 把它当 LF 转成 CRLF（变成 `0x0D 0x0A`），文件就**多了 N 个字节**且偏移全错——GLTFLoader 读 BIN chunk header 说 "下一段 103292 字节"，但实际位置已经偏了 N 字节，typed array 分配失败。

修法就是 `.gitattributes` 里写 `*.glb binary`，新版 download_avatar.sh 自动加。**.gitattributes 必须先于 .glb 提交**，不然太迟了。

## 验证 5 分钟稳定（最终测试）
1. 打开正常 URL（不带任何 flag）
2. 看着相机，**一直坐着，每隔 30 秒做个夸张表情**
3. 5 分钟后看 HUD：
   - `fps`: 28-30（不能掉到 < 20）
   - `detect`: 5-20 ms（不能 > 30ms）
   - `frames`: 大约 5×60×30 = 9000 左右
4. 再做表情：avatar **立即**响应（不能延迟 1 秒以上）

OK 就完事了。这之后真要进一步提速，就是让本地 AI 把 LSTM 量化为 INT8，或者换 WebGPU backend，但 CASA0018 评分里这两步都不必要。
