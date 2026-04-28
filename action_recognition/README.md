# action_recognition/ — 动作识别 + 触发动画（DL 贡献点）

> 这个模块是 CASA0018 报告里"自己训练 / 微调的 DL 模型"那一栏。
> 输入：30 帧 ARKit 命名的 52-d blendshape 序列（≈ 1 秒）。
> 输出：8 类离散动作标签 → 在 `web_avatar` 里触发预录视觉动画。

## 8 个动作类（默认）

| label | 触发 avatar 效果 | 说明 |
|---|---|---|
| `neutral` | 无 | 没在做特定动作 |
| `wink_left` | 左眼 ✨ sparkle | 左眼眨 + 右眼睁 |
| `wink_right` | 右眼 ✨ sparkle | 右眼眨 + 左眼睁 |
| `smile_big` | 💕 心形粒子 | 大笑（mouthSmile 同时双侧） |
| `surprise` | ❓ 弹出 | 眉毛上挑 + 眼睛睁大 + 嘴 O |
| `frown` | 💧 雨滴 | 嘴角下拉 + 眉头皱 |
| `mouth_o` | 🔊 声波 | 嘴巴 O 形（说话/唱） |
| `tongue_out` | 😜 调皮文字 | 吐舌头 |

可以改 `ACTION_LABELS.md` 加 / 减类。

## 管线

```
[iPhone ARKit / 浏览器 MediaPipe]
        │
        ▼  (52 个 blendshape 每秒 30 次)
[ relay_server WebSocket ]
        │
        ▼
[ web_avatar/src/main.js ]
   ├── applyArkitToVRM()     ← 连续 blendshape → VRM 嘴形/眨眼
   └── actionInference.js    ← 30 帧滑窗 → TFJS 模型 → 离散动作类
                                                     │
                                                     ▼
                                          animations.js → 触发粒子/特效
```

## 文件

```
action_recognition/
├── README.md                  ← 本文档
├── ACTION_LABELS.md           ← 8 类动作的语义定义
├── requirements.txt           ← TF + tfjs-converter
├── lib_dataset.py             ← 加载 session JSON，组 (N, 30, 52) + 标签
├── generate_synthetic.py      ← 生成 600 条假数据，让训练管线先跑通
├── train.py                   ← 1D-CNN，~30k 参数，存 .h5 + class_names.json
├── export_tfjs.py             ← .h5 → web_avatar/public/models/action_model/
├── eval_realtime.py           ← 终端里实时打印模型预测（订阅 relay）
└── sample_dataset/            ← generate_synthetic.py 生成的 600 条 JSON
```

## 训练数据格式（每个 session 一个 JSON）

```json
{
  "version": 1,
  "label": "wink_left",
  "subject_id": "yidan",
  "fps_target": 30,
  "frames": [
    { "ts": 0.000, "blendshapes": { "jawOpen": 0.02, "eyeBlinkLeft": 0.8, ... } },
    { "ts": 0.033, "blendshapes": { "jawOpen": 0.01, "eyeBlinkLeft": 0.9, ... } },
    ...
  ]
}
```

`record_session.html`（在 `web_browser_fallback/` 同级，复用同一个 MediaPipe 模型）会下载 JSON。
合法的 ARKit 名见 `web_avatar/src/arkitToVrm.js` 里的 `ARKIT_KEYS` 常量。

## 模型

```
Input  (30, 52)
  │
  ├─ Conv1D(32, k=5, padding=causal, relu) + BatchNorm
  ├─ Conv1D(64, k=5, padding=causal, relu) + BatchNorm
  ├─ Conv1D(64, k=3, padding=causal, relu) + BatchNorm
  ├─ GlobalAveragePooling1D
  ├─ Dropout(0.3)
  └─ Dense(num_classes, softmax)
Total params: ~30k     模型体积：~120 KB（.h5），TFJS sharded 后 ~150 KB
```

## 为什么不用 LSTM/Transformer？

- 30 帧 × 52 维输入很小，1D-CNN 已经足够
- TFJS 上 Conv1D 比 LSTM 快 3-5×，移动端浏览器友好
- 报告里写"试过 LSTM 但延迟更高、效果近似"是合理的 ablation

## 端到端步骤

参见 `docs/LOCAL_AGENT_RUN_PLAN_CN.md` §9。
