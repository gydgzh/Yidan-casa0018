# 本地 AI 执行方案 v2（可复制粘贴给本地 AI）

> **核心 pivot 已完成**：不再训表情分类，改做"ARKit / MediaPipe → 虚拟人动捕 + 自训 1D-CNN 动作识别 → 触发动画"。
> 这一版加入了 **§9 动作识别训练管线** 和 **§10 评测/Ablation**，这两节是 CASA0018 的 DL 评分核心。
>
> **执行原则**：
> 1. **每一步跑完贴 verify 输出再进下一步**。
> 2. 报错就停，把对应 log 末尾 80 行贴回，不要 try-except 绕过去。
> 3. 时间预算：Phase A+B+C ≈ 60 分钟；§9 训练 ≈ 30 分钟；§10 评测 ≈ 30 分钟。

## 0. 仓库总览（已更新）

```
DLLLL1/
├── ios_mocap/                         # iOS Swift 端（ARKit → WebSocket）
│   └── FaceMocap/{App, ContentView, Session}.swift + Info.plist.snippet
├── relay_server/                      # Node.js WebSocket 转发
│   ├── package.json
│   └── server.js
├── web_avatar/                        # Three.js + @pixiv/three-vrm 渲染端 (主)
│   ├── package.json   ← 需要加 @tensorflow/tfjs，见 §9.5
│   ├── vite.config.js
│   ├── index.html     ← 已加 action HUD
│   └── src/
│       ├── main.js          ← 已接入 actionInference + animations
│       ├── arkitToVrm.js
│       ├── oneEuroFilter.js
│       ├── animations.js    ← NEW（粒子/特效）
│       └── actionInference.js ← NEW（TFJS 滑窗推理）
├── web_browser_fallback/              # 没有 iPhone 时的备选（MediaPipe in browser）
│   └── index.html
├── action_recognition/                # NEW：DL 训练模块（CASA0018 评分核心）
│   ├── README.md
│   ├── ACTION_LABELS.md
│   ├── requirements.txt
│   ├── lib_dataset.py
│   ├── generate_synthetic.py
│   ├── train.py
│   ├── export_tfjs.py
│   ├── eval_realtime.py
│   ├── record_session.html  ← 浏览器录数据页
│   └── split_jsonl.py
├── scripts/download_assets.sh
├── docs/{LOCAL_AGENT_RUN_PLAN_CN.md  ← 本文件
│        REPORT_REVIEW_CN.md}
└── AAAther/                           # 归档
    └── old_emotion_recognition_2026-04-26/
```

## 1. 一次性环境准备（Mac 上跑）

```bash
# Node.js ≥ 18
node -v || brew install node
# Python 3.10+
python3 -V || brew install python@3.10

# 关键资源:虚拟人 + MediaPipe 模型
cd /Users/yimisheng/Desktop/AAAucl-2025/T2_1_ucl/casa0018DeepLearning/DLLLL1
bash scripts/download_assets.sh
```

**验收**：
```bash
ls -lh web_avatar/public/models/avatar.vrm        # ~14MB
ls -lh web_browser_fallback/public/face_landmarker.task  # ~3MB
```

---

## 2. 阶段 A：浏览器 fallback 跑通最小闭环（15 分钟）

**目的**：不依赖 iPhone，先验证 *渲染管线 + WebSocket + VRM 表情驱动* 全部对。

```bash
# 终端 1：relay
cd DLLLL1/relay_server && npm install && npm start

# 终端 2：web avatar 渲染端
cd DLLLL1/web_avatar && npm install && npm run dev
# → 浏览器打开 http://localhost:5173,应能看到虚拟人静止站立。

# 终端 3：browser fallback（MediaPipe 当 sender）
cd DLLLL1/web_browser_fallback
npx --yes serve -l 8000
# → 另开浏览器 http://localhost:8000,点 "Start camera + MediaPipe"
```

**验收**：5173 那一页虚拟人开始跟着摄像头里的脸说话、眨眼、转头。
- HUD 显示 `blendshapes:52`、`fps:25-30`。
- relay 控制台打 `senders=1 viewers=1 forwarded=N (~30 Hz)`。
- HUD 还显示 `action: model not loaded`（因为 §9 还没做）—— 正常，跳过。

**E1 数据**：浏览器 dev tool Network → ws → 帧间时间打印；录 30 秒视频（同时录 sender + avatar 窗口）。

---

## 3. 阶段 B：iPhone ARKit 替换 sender（主路径）

1. Xcode 新建 iOS App（SwiftUI / Swift 5），工程名 `FaceMocap`。
2. 把 `ios_mocap/FaceMocap/*.swift` 三个文件**替换/添加**到工程 target。
3. 打开 `Info.plist`，把 `Info.plist.snippet` 里的 4 个 key 加进去（NSCameraUsageDescription / NSLocalNetworkUsageDescription / NSBonjourServices / UIRequiredDeviceCapabilities=arkit）。
4. 在 `FaceMocapApp.swift` 顶部把 `kRelayURL` 的 IP 改成 Mac 的 LAN IP：
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
5. USB 连 iPhone 15 → Xcode → Run。第一次跑要在 iPhone 上信任开发者：
   设置 → 通用 → VPN 与设备管理 → 信任你的 Apple ID。
6. App 启动时 relay 控制台应打印 `senders=1`。

**验收**：5173 那一页换为 ARKit 数据驱动（关掉 fallback 的 sender 浏览器），动作精度立刻上升。

**E2 数据**：录同样动作的 30 秒，与 E1 对比。

---

## 4. 阶段 C：One-Euro Filter（已经在代码里）

HUD 顶部 "One-Euro 平滑" 复选框默认开。切换 on/off 各录 10 秒，统计 `eyeBlinkLeft` / `jawOpen` 通道方差变化 → E3。

---

## 5. 阶段 D：鲁棒性 + 用户测试（可选，加分项）

- E4：换光照（白光 / 暖光 / 暗光）、戴眼镜、侧脸，记 tracking-loss 时长占比。
- E5：3–5 名同学试，Likert 1–5 评分"虚拟人是否像我"。

---

## 6. 旧的表情识别工程怎么办

报告里要写"为什么 pivot"，但**不再投入工时**。已经归档在 `AAAther/old_emotion_recognition_2026-04-26/`。

---

## 7. 给本地 AI 的硬要求

- ❌ 不要再训 FER+/CK+ 表情分类器。
- ❌ 不要自己重训 ARKit / MediaPipe 的 blendshape 回归 —— 系统/Google 已经训好了。
- ✅ 跑 §2、§3、§4 的实验，采延迟 / 抖动 / 用户评分。
- ✅ **跑 §9 训自己的 1D-CNN 动作识别（这是 CASA0018 的 DL 贡献核心）**。
- ✅ §10 跑 ablation 与端到端评测。

---

## 8. 最低交付清单

- [ ] 录屏：浏览器 MediaPipe 驱动虚拟人（15–30 秒）。
- [ ] 录屏：iPhone ARKit 驱动同一虚拟人（15–30 秒）。
- [ ] 录屏：动作识别触发动画的 demo（笑→💕，眨眼→✨，吐舌→😜，至少 3 类）。
- [ ] 数据：E1 vs E2 端到端延迟柱状图（均值 + 标准差）。
- [ ] 数据：开/关 One-Euro 的抖动方差对比（E3）。
- [ ] 数据：动作识别 8 类混淆矩阵 + per-class precision/recall（E6）。
- [ ] 修订后的报告（按 `REPORT_REVIEW_CN.md` 改完）。
- [ ] GitHub 仓库链接，完整可复现。

---

## ★ 9. 动作识别训练管线（CASA0018 DL 评分核心，30 分钟）

> 这一节是评分关键：**自训的 1D-CNN，输入 30 帧 ARKit 命名 blendshape，输出 8 类动作**。
> Apple/Google 没替你做这一层 → 这就是你的 DL 贡献。

### 9.1 装依赖（一次性）

```bash
cd DLLLL1/action_recognition
pip install -r requirements.txt --break-system-packages
```

**验收**：
```bash
python -c "import tensorflow as tf, tensorflowjs; print(tf.__version__, tensorflowjs.__version__)"
# 应该看到类似 "2.15.0 4.17.0"
```

如果 `tensorflow-macos` 装失败 → 改装 `pip install tensorflow==2.15.* --break-system-packages`，
M2 GPU 加速没了但能跑（每 epoch 慢 3-5×）。

### 9.2 用合成数据先跑通管线（5 分钟）

```bash
cd DLLLL1/action_recognition
python generate_synthetic.py --per-class 75
# 看到 8 类 ×75 = 600 个 session 写到 sample_dataset/
python lib_dataset.py
# 应打印 X=(N, 30, 52) y=(N,) 类别分布表
python train.py
# 40 epochs（实际跑 EarlyStopping 通常 15-25），test_acc 应 ≥ 0.95
```

**验收**：
```bash
cat artifacts/training_metrics.json | python -m json.tool | head -10
ls -lh artifacts/   # action_model.h5 + class_names.json + 两张 PNG
```
- `test_accuracy` ≥ 0.95（合成数据简单，应该接近 1.0）→ ✅ 管线通了
- 如果 < 0.85 → 数据/loss/lr 配错了，贴 `train.py` 末尾输出回来诊断
- 如果连 import tensorflow 都失败 → 贴 `pip list | grep -i tens` 回来

### 9.3 转成 TFJS 给 web_avatar（30 秒）

```bash
python export_tfjs.py
# → ../web_avatar/public/models/action_model/model.json + bin
```

**验收**：
```bash
ls -lh ../web_avatar/public/models/action_model/
# 应有: model.json + group1-shard1of1.bin + class_names.json + training_metrics.json
```

### 9.4 浏览器实测（5 分钟）

```bash
cd ../web_avatar
npm install @tensorflow/tfjs        # 第一次需要装
npm run dev                          # http://localhost:5173
```

打开 5173，看 HUD：
- `action: <类名>` 应该开始跳变（合成模型在真人脸上准确率不高，但**应该有数字在变**）
- 故意做"smile_big" 应能偶尔触发 `💕` 粒子

**这一步只是验证管线对了，准确率会很低。下一步换真实数据重训。**

### 9.5 录真实数据（15-20 分钟）

```bash
# 终端启动一个静态服务器供 record_session.html
cd DLLLL1/action_recognition
npx --yes serve -l 8001
# 浏览器打开 http://localhost:8001/record_session.html
```

操作流程（按 `ACTION_LABELS.md` 的指引）：
1. 点 "Start camera + MediaPipe" → 等 status 变 ready
2. 选 label = `neutral` → 按空格录一段（2 秒） → 重复 10 次
3. label = `wink_left` → 录 10 段
4. ... 8 类各 10 段（总 80 段，约 5 分钟）
5. 点 "③ 下载已录的全部" → 拿到 `sessions_yidan_<ts>.json`

```bash
python split_jsonl.py ~/Downloads/sessions_yidan_*.json data/
# 拆成 data/<label>/*.json
```

**验收**：
```bash
find data -name "*.json" | wc -l   # 应 ≥ 80
ls data/                            # 应看到 8 个子目录
```

### 9.6 重训 + 重导（5 分钟）

```bash
python train.py --data data/ --epochs 60
python export_tfjs.py
```

**验收**：
- `test_accuracy` 期望 ≥ 0.85（自录数据小，过拟合风险，0.85 已经很好）
- 期望 ≥ 0.92（如果做了 cross-subject + 充足样本）
- 如果 < 0.7 → 大概率是某些类只录了 < 5 段或动作做得不像，看 `confusion_matrix.png` 找混淆类

### 9.7 Ablation 表（写在报告 §4.3）

至少跑 3 组对比，把 `training_metrics.json` 里 test_accuracy 抄进表：

| 实验 | window | stride | Conv1D 深度 | 备注 |
|---|---|---|---|---|
| A1 | 30 | 10 | 32-64-64 | 默认 |
| A2 | 45 | 10 | 32-64-64 | 长窗口 |
| A3 | 30 | 5  | 32-64-64 | 密 stride |
| A4 | 30 | 10 | 16-32   | 更小模型 |

跑法：`python train.py --window 45 --stride 10`，artifacts 会被覆盖，跑前重命名旧的。

---

## ★ 10. 端到端评测（30 分钟）

### 10.1 端到端延迟（E2 + E3 的扩展）

在 `web_browser_fallback/index.html` 的 sender payload 里加 `client_send_ts`，
在 `web_avatar/src/main.js` 收到时算 `recv_ts - client_send_ts` → 打印每 30 帧的 P50/P95。
（这一步是可选的代码改动，本地 AI 自己加 5 行 console.log 即可）

预期：本地 LAN < 80ms，跨 WiFi < 150ms。

### 10.2 动作识别误触发率（E6）

在 `web_avatar` 跑 30 秒"做表情" + 30 秒"安静坐着"。
- HUD `last triggered` 历史记下来。
- 安静坐着期间触发次数 / 30 秒 = 误触发率（FPR）。期望 < 0.5 次/分钟。

### 10.3 实时打印（终端版，便于截图进报告）

```bash
cd action_recognition
pip install websocket-client --break-system-packages
python eval_realtime.py
# 启动 fallback 或 iPhone sender,做表情看终端实时打印
```

---

## 11. 报告 §4 必填表格

按本仓 `docs/REPORT_REVIEW_CN.md` 的结构改 §1-§3。新增 §4.3：

| 编号 | 实验 | 评价指标 | 期望 | 实测 |
|---|---|---|---|---|
| E1 | 浏览器 MediaPipe → Three.js 跑通 | 端到端延迟、丢帧率 | <150ms, <5% | ___ |
| E2 | iPhone ARKit → WS → 浏览器 vs E1 | 延迟、抖动 std dev | E2 < E1 | ___ |
| E3 | 加 One-Euro Filter | jitter ↓ % | ≥30% | ___ |
| E4 | 不同光照/戴眼镜/侧脸 | tracking-loss 占比 | <20% | ___ |
| E5 | 3-5 同学 Likert | 平均分 | ≥3.8/5 | ___ |
| **E6** | **动作识别 8 类 test acc + FPR** | macro F1, FPR | F1 ≥ .85, FPR < 0.5/min | ___ |
| **E7** | **Ablation 4 组（窗口/深度）** | test acc 表 | A1 是冠军 | ___ |

---

## 12. 跑完后把这些贴回给 Claude（远程）

```bash
cd DLLLL1
echo "=== action_recognition/artifacts/training_metrics.json ==="
cat action_recognition/artifacts/training_metrics.json
echo
echo "=== TFJS 模型文件 ==="
ls -lh web_avatar/public/models/action_model/
echo
echo "=== 真实数据集统计 ==="
find action_recognition/data -name "*.json" 2>/dev/null | xargs -I{} dirname {} | sort | uniq -c
echo
echo "=== 端到端延迟 / 误触发率（手动从浏览器/终端读） ==="
echo "  E2 lan latency P50/P95: ___ / ___ ms"
echo "  E6 误触发率:            ___ 次/分钟"
echo
echo "=== Ablation 4 组 ==="
echo "  A1 window=30 stride=10 deep=32-64-64: test_acc=___"
echo "  A2 window=45 stride=10 deep=32-64-64: test_acc=___"
echo "  A3 window=30 stride=5  deep=32-64-64: test_acc=___"
echo "  A4 window=30 stride=10 deep=16-32:    test_acc=___"
```

Claude 远程拿到这些后会：
1. 把数字回填到 `docs/REPORT_REVIEW_CN.md` §4 的表格 + §6 的草稿
2. 写 §4.3 Ablation 段落（解释为什么 A1 是冠军）
3. 写 §5 Critical Reflection（哪些动作识别准、哪些经常误触发、为什么）

---

## 附：常见问题速查

| 症状 | 大概率原因 | 解决 |
|---|---|---|
| 5173 加载不出 avatar | `avatar.vrm` 没下载 | 跑 `bash scripts/download_assets.sh` |
| HUD `relay: error` 不停重连 | relay 没起 / 端口被占 | 终端 1 重启 relay，或换 PORT=8766 |
| iPhone app 起来后 relay 不增 senders | iPhone 跟 Mac 不在同一 WiFi / IP 写错 | `ifconfig` 重看 IP，App 内 RELAY_URL 改 |
| iPhone 第一次启动崩溃 | Local Network 权限没给 | 设置 → FaceMocap → 本地网络 → 打开 |
| `npm install` 卡住 | 国内网/代理 | `npm config set registry https://registry.npmmirror.com` |
| `pip install tensorflow-macos` 失败 | Intel Mac 或 Python 3.11 | 改 `pip install tensorflow==2.15.*` |
| TFJS `loadLayersModel` 404 | model.json 没拷过去 | 跑 `python export_tfjs.py` |
| 浏览器 `action: model not loaded` | 同上 | 同上 |
| 训练 test_acc < 0.5 | 数据混了/loss 不收敛 | 贴最后 30 行 train log 回来 |
