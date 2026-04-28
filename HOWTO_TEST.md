# 怎么测才对 — 给本地 AI 的清单

## 你刚才看到的不是 bug，是测试模式

URL 里 `?nocam=1&cube=1&debug=1` 三个参数：
- `nocam=1` 主动**关掉摄像头**和 MediaPipe → HUD 自然显示 `cam:off · mp:off`
- `cube=1` 主动**用简易代理头**而不加载真 GLB → HUD 显示 `avatar:proxy`
- `debug=1` 自动展开屏上日志

这个组合是用来**单独验证 Three.js 渲染本身工作不工作**的。你看到了带眼睛眉毛嘴的球状代理头 = 这层验证已通过 ✅。同时 `action: ok` 说明你自训的 LSTM 模型也成功加载 ✅。

新版我加了一个橙色顶部横幅"TEST MODE"，下次再用测试参数会清楚地标出来。

## 三步把它跑成真的（按顺序做）

### 第 1 步：确认 `models/avatar.glb` 真在仓库里
```bash
cd ~/Yidan-casa0018
ls -lh models/avatar.glb 2>/dev/null
# 期望：显示一个 ~10MB 的文件
# 没有这个文件 → 第 2 步先跑
```

### 第 2 步：下合法头像（如果上面 ls 没文件）
```bash
cd ~/Yidan-casa0018
SRC="$HOME/Library/Application Support/Claude/local-agent-mode-sessions"
SRC="$(find "$SRC" -name download_avatar.sh -print -quit | xargs dirname)"
cp "$SRC/download_avatar.sh" .
cp "$SRC/mobile_avatar.html" .   # 新版带 TEST MODE 横幅
chmod +x download_avatar.sh

bash download_avatar.sh                # 默认 brunette（女性写实）
# 不喜欢可以换：
#   AVATAR=blonde bash download_avatar.sh
#   AVATAR=asian  bash download_avatar.sh

ls -lh models/avatar.glb               # 应该 ~10MB
file models/avatar.glb                 # 应该说 "data" 或 "GLB"
xxd -l 4 models/avatar.glb             # 头 4 字节应该是 "glTF"

git add models/avatar.glb mobile_avatar.html
git commit -m "add MIT TalkingHead avatar.glb + test-mode banner"
git push
```

### 第 3 步：用正确 URL 测试（去掉所有 flag）

**Mac Chrome 上先验证：**
```
https://gydgzh.github.io/Yidan-casa0018/mobile_avatar.html
```
点 "允许摄像头并开始" → 应该看到：
- 顶部 **没有** 橙色 TEST MODE 横幅
- HUD 全绿：`cam: ok · mp: ok · avatar: ok · action: ok`
- 中间一个写实女角色，跟着你脸动（嘴张闭、眨眼、转头都跟得上）
- 右下角小窗：你的真实脸
- 做夸张表情触发屏幕中央 emoji + 粒子

**iPhone Safari 上一样的 URL 即可。**

### 如果 Mac 上 OK 了但 iPhone 上不行
通常两个原因：
| 现象 | 修法 |
|---|---|
| 不弹摄像头权限 / 黑屏 | iPhone 设置 → Safari → 摄像头 = "询问"；并清掉这个域历史权限 |
| MediaPipe 报错 / 卡很久 | iPhone 必须 iOS 16.4+，importmap 才支持 |
| 头像加载特别慢 | jsdelivr 偶尔抽风。这就是为啥要把 GLB 落本地仓库（第 2 步） |

## 我都 push 完了还是 `avatar: proxy` 怎么办？

按这个顺序排查（每一步 30 秒）：

### A. 确认 GitHub Pages 真发布了
```bash
curl -sI https://gydgzh.github.io/Yidan-casa0018/models/avatar.glb | head -3
# 应该看到：HTTP/2 200
# 看到 404 → GitHub Pages 还没缓存好，等 1-2 分钟再试；或仓库里 models/avatar.glb 没 push 上
```

### B. 确认文件不是空 / 不是 LFS pointer
```bash
curl -sI https://gydgzh.github.io/Yidan-casa0018/models/avatar.glb \
  | grep -i content-length
# 应该 ~10MB（约 10000000）
# 如果只有几百字节 → 文件被 git-lfs 当指针存了，跑：
#    git lfs uninstall
#    git rm --cached models/avatar.glb
#    git add models/avatar.glb && git commit --amend && git push -f
```

### C. 强制刷新（绕浏览器缓存）
- iPhone Safari：长按刷新按钮 → "重新载入页面而不使用内容拦截器"，或直接关 tab 重开
- Chrome：Cmd+Shift+R

### D. 看屏上日志
URL 加 `?debug=1`，日志会出现：
```
[..:..:..] trying: ./models/avatar.glb
[..:..:..]   failed: <具体原因>
[..:..:..] trying: https://cdn.jsdelivr.net/gh/met4citizen/...
```
看具体哪一步失败。

## 我看了 GitHub 上还有别的虚拟人项目可以参考吗？

| 项目 | 协议 | 头像类型 | ARKit 52 morph | 适不适合你 |
|---|---|---|---|---|
| **met4citizen/TalkingHead** | MIT | 写实 brunette/blonde/asian | ✅ 完整 | **当前选的，最合适** |
| pixiv/three-vrm samples | CC0 | 二次元 | ❌ 没 ARKit 命名 | 风格不符你要求 |
| Khronos glTF-Sample-Models | 各异 | 大多非人类 | ❌ | 不合适 |
| Microsoft Rocketbox | MIT | 写实多样 | ❌ FBX 格式无 morph | 要转格式 + 加 morph，太麻烦 |
| Ready Player Me | 商业可用 | 写实定制 | ✅ | 备选，需要 RPM 注册定制 |
| iSchoolofAI/A-Frame-Avatar | MIT | 简易 | ❌ | 不合适 |

→ TalkingHead 已经是当前免费方案里**最贴合你需求**的（写实、女性、ARKit 完整、MIT、单文件 GLB）。我已经把它接进 `download_avatar.sh`。

如果跑完 A-D 还黑，把屏上日志的截图 + Chrome devtools Network 标签里 avatar.glb 那一行的状态码截图发我，我看完再给具体修法。
