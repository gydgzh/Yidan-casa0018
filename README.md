# DLLLL1 — Face Mocap → Virtual Avatar (CASA0018 Deep Learning)

> **三层架构**：连续动捕（ARKit / MediaPipe，**复用预训练**）
> + **离散动作识别**（自训 1D-CNN，**CASA0018 的 DL 贡献点**）
> + **触发动画**（Three.js 粒子 / 特效）。
>
> 旧的 FER+/CK+ 表情分类工作归档在 `AAAther/old_emotion_recognition_2026-04-26/`。

## 架构

```
[iPhone ARKit / 浏览器 MediaPipe]      pretrained,不训
        │
        ▼  52-d blendshape @ 30 Hz
[ relay_server ]   Node WebSocket fan-out
        │
        ▼
[ web_avatar (Three.js + VRM) ]
   ├── arkitToVrm.js        ← 连续 blendshape → VRM 嘴形 / 眨眼 / 视线
   ├── oneEuroFilter.js     ← Casiez 2012 去抖
   ├── actionInference.js   ← 30 帧滑窗 → TFJS 1D-CNN → 8 类动作   ★ DL 贡献点
   └── animations.js        ← 动作触发粒子 / 特效
```

## 快速开始（4 步）

```bash
# 1) 下虚拟人模型 + MediaPipe blendshape 模型（一次性）
bash scripts/download_assets.sh

# 2) 安装 + 启动 relay
cd relay_server && npm install && npm start

# 3) 训练动作识别模型（先用合成数据跑通，再换真实录制数据）
cd ../action_recognition
pip install -r requirements.txt --break-system-packages
python generate_synthetic.py             # 600 个合成 session（sanity check 用）
python train.py                          # → artifacts/action_model.h5
python export_tfjs.py                    # → ../web_avatar/public/models/action_model/

# 4) 启动渲染端 + 摄像头 sender
cd ../web_avatar && npm install && npm run dev          # http://localhost:5173
cd ../web_browser_fallback && npx --yes serve -l 8000   # http://localhost:8000
```

文档入口：
- 报告修改建议：[`docs/REPORT_REVIEW_CN.md`](docs/REPORT_REVIEW_CN.md)
- 完整执行方案：[`docs/LOCAL_AGENT_RUN_PLAN_CN.md`](docs/LOCAL_AGENT_RUN_PLAN_CN.md)
- 动作识别模块：[`action_recognition/README.md`](action_recognition/README.md)
- 动作类语义：[`action_recognition/ACTION_LABELS.md`](action_recognition/ACTION_LABELS.md)

## 数据 / 模型来源（全部公开合法可见）

| 资源 | 来源 | 许可 |
|---|---|---|
| `avatar.vrm` | [madjin/vrm-samples](https://github.com/madjin/vrm-samples) | CC0 风格 |
| `face_landmarker.task` | [Google AI Edge MediaPipe Face Landmarker v2](https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker) | Apache-2.0 |
| ARKit `ARFaceAnchor` | Apple iOS / iPadOS 系统 API | 系统 SDK |
| `@pixiv/three-vrm` | [pixiv/three-vrm](https://github.com/pixiv/three-vrm) | MIT |
| `three.js` | [mrdoob/three.js](https://github.com/mrdoob/three.js) | MIT |
| `@tensorflow/tfjs` | [tensorflow/tfjs](https://github.com/tensorflow/tfjs) | Apache-2.0 |
| **训练数据** | 自录（`record_session.html` 用 MediaPipe 出 52-d 序列）+ 合成 sanity check | 自有 |

## DL 贡献点（CASA0018 评分对应）

| 项目 | 内容 | 体现在 |
|---|---|---|
| **数据采集** | 浏览器 MediaPipe 录每类 ≥10 段 × 8 类，可加 cross-subject | `action_recognition/record_session.html` |
| **模型设计** | 1D-CNN（~30k 参数）on (30, 52) blendshape 序列 | `action_recognition/train.py` |
| **超参 ablation** | 窗长 / stride / Conv1D 深度 / dropout | run plan §9.4 |
| **量化部署** | Keras → TFJS layers，部署在 web_avatar 浏览器 | `action_recognition/export_tfjs.py` |
| **真机评测** | 端到端延迟、动作触发准确率、误触发率 | run plan §10 |

## 为什么不"全部从头训一个 blendshape 回归模型"？

ARKit 的 52 个 blendshape 已经由 Apple 在亿级面孔数据上训练好，
MediaPipe Face Landmarker v2 在 Google 内部数据上训练好，
**精度都远超你能用 16GB M2 Mac 在两周内训出来的任何 baseline**。
所以连续动捕这一层 **复用预训练**，把工程量留给：
1. **动作识别小模型**（这一块就是真正自训的 DL 模型 → CASA0018 评分核心）；
2. **集成**（WebSocket schema、ARKit↔VRM 命名映射）；
3. **平滑**（One-Euro Filter）；
4. **评测**（端到端延迟、抖动、用户主观评分）。

这就是 CASA0018 想看的"用对工具 + 设计实验 + 诚实复盘"的项目结构。
