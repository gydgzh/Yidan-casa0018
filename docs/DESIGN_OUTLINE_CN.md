# Veil — 设计大纲（CASA0018 项目报告骨架）

> 一句话：**隐私保护的双人远程陪伴**——你的脸不出设备，只有"抽象表情数字"
> 流向 relay 再流向朋友，朋友看到的是一个由你选定的虚拟人，实时复现你的表情和头部姿态。
> 同时背后跑一个**自训 1D-CNN 动作分类器**做"心情同步"惊喜（双方同时大笑→💞）。

---

## 1. 一句话产品定位

| 现有方案 | 失败点 | Veil 怎么不一样 |
|---|---|---|
| 视频通话（Zoom/FaceTime） | 真脸暴露 + 5 MB/s 带宽 + Zoom fatigue | 只传 ~6 KB/s 抽象表情数字（**800× 压缩**），相机数据 0 字节出设备 |
| 普通电话 | 听不到表情 | 表情 + 头位 + 8 类离散动作都同步 |
| 镜子练表情 | 没人陪 | 异地配对，"对镜子"变"对朋友" |

**目标用户**：
- 异地恋 / 跨时区家人陪伴
- 隐私敏感场景：监狱探视（带宽极低）、医院 ICU 床边、农村弱网
- 视频通话疲劳的远程团队（"在场感"但不"被看脸"）

---

## 2. 三层架构

```
[ Phone A — Yidan ]                                       [ Phone B — Friend ]
┌────────────────────┐         ┌─────────────────┐         ┌────────────────────┐
│ camera (hidden)    │         │ relay_server    │         │ camera (hidden)    │
│  ↓ 摄像头帧从不离开 │         │ server_rooms.js │         │  ↓                  │
│ MediaPipe          │         │  rooms[code]    │         │ MediaPipe          │
│  → 52d blendshape  │ 232B/   │  = [A, B]       │  232B/  │  → 52d blendshape  │
│ + headpose 4f      │ 24Hz →  │ ───── fan-out → │← 24Hz   │ + headpose 4f      │
│ + 1D-CNN 8-class   │ ~6KB/s  │ stores NOTHING  │ ~6KB/s  │ + 1D-CNN 8-class   │
│  ↓ encode binary   │         │                 │         │  ↓ encode binary   │
│ ws.send  ─────────►│ ─────── │ ─────────────── │ ──────► │◄───────  ws.recv   │
│ ws.recv  ◄─────────│ ◄────── │ ◄────────────── │ ─────── │ ws.send ──────────►│
│  ↓ decode          │         │                 │         │  ↓ decode          │
│ apply to peer GLB  │         │                 │         │ apply to peer GLB  │
│ ↓ render: 2 avatars│         │                 │         │ ↓ render: 2 avatars│
│ self ← peer        │         │                 │         │ self → peer        │
└────────────────────┘         └─────────────────┘         └────────────────────┘
        ↑ 用户选自己的 avatar           ↑ 服务端零存储          ↑ 用户也选自己的 avatar
        ↑ 用户选朋友的 avatar           只看到 2 字节 type   ↑ "朋友看你"是用户选定
                                       + 232B 二进制不解析

       原始视频 / 音频 / 任何可识别人脸特征 = 全程零字节出设备
```

**为什么要这样**：

- **相机帧** `<video id="cam">` 在页面里渲染但 **CSS 隐藏（left:-9999px）**，从不显示给用户、从不进 canvas；只被 MediaPipe 用 GPU 直接处理出 52 维 blendshape 浮点数。
- **传输** binary 232 字节 = 1 byte type + 1 byte action_idx + 6 byte 占位 + 16 byte head quat + 208 byte (52 floats × 4) blendshape，**24 Hz** = ~5.7 KB/s。relay 用 `Set` 存 room 成员，转发 ArrayBuffer 不解析。
- **接收端** 解码出 blendshape → 应用到 GLB `morphTargetInfluences`，头部 quat → `headBone.slerp(...)`。

---

## 3. DL 贡献点（CASA0018 评分核心）

整个系统**复用**了两个预训练模型（不是创新点），**自训**了一个小模型（创新点）。划清界线：

| 模型 | 来源 | 我们做了什么 | 评分体现 |
|---|---|---|---|
| MediaPipe Face Landmarker v2 | Google AI Edge, Apache-2.0 | **复用**（输出 52 维 ARKit 命名 blendshape） | "用对工具" |
| ARKit ARFaceAnchor | Apple iOS SDK | **复用**（iPhone native 等价路径） | "跨平台对齐" |
| **8-class action 1D-CNN** | **自训** | **从 0 训** 30 帧 × 52 维 → 8 类动作识别<br>输入：blendshape 序列<br>输出：neutral / wink_L / wink_R / smile_big / surprise / frown / mouth_o / tongue_out | **DL 贡献核心** |

**自训模型细节**（`action_recognition/` 目录）：
- 架构：Conv1D(32) → Conv1D(64) → Conv1D(64) → GAP → Dense(8) softmax
- 参数量：32,168（≈125 KB .h5）
- 训练数据：合成 600 sessions（sanity check）+ 真实自录数据
- 测试集 acc：99.05% (合成) / 期望真实数据 85%+
- 部署：Keras → TensorFlow.js Layers Model → 浏览器里 5 Hz 滑窗推理
- 防抖：vote_window=2 + threshold=0.5 + cooldown=500ms

**它在 Veil 里的角色**：不是驱动 avatar 表情（连续动捕 52 维已经做了），而是**触发"心情同步"事件**——当 A 和 B 在 1.5 秒内识别出**同一个非 neutral 动作**，屏幕中央炸 emoji（💞 / ✨ / 🎵 / 🫂 / 🌟 / 🤪），同时 avatar 头顶 halo 光环变色。这个交互**只有自训分类器能给**：MediaPipe 的连续 blendshape 不出离散事件，ARKit 也不出。

---

## 4. 关键功能清单（已实现）

| 模块 | 文件 | 状态 |
|---|---|---|
| 相机 + MediaPipe（隐私关键） | mobile_avatar.html `initCamera/initMP` | ✅ |
| 双 avatar 并排渲染 | mobile_avatar.html `class AvatarSlot` × 2 | ✅ |
| 头部裁切框架（不露上半身） | mobile_avatar.html `placeCamera()` FOV 30/24 | ✅ |
| 5 个内建 avatar + Custom URL | mobile_avatar.html `AVATAR_BANK` | ✅ |
| Avatar 加载兜底链 (local→CDN→fallback) | `class AvatarSlot.load()` | ✅ |
| Halo 光环 + 情绪变色 | `haloMatA/B` `onMyAction/onPeerAction` | ✅ |
| Room 配对 WebSocket | server_rooms.js + `connectRelay()` | ✅ |
| 二进制 232B 帧 (24 Hz) | `encodePacket/decodePacket` | ✅ |
| 8 类动作识别（TFJS） | `initAction/maybeInfer` + action_recognition/ | ✅ |
| Mood Sync 心情同步 | `checkSync/triggerSyncBurst` | ✅ |
| 隐私 badge + KB/s 实时 pill | DOM `#privacy` `#bwPill` | ✅ |
| localStorage 记住偏好 | `localStorage.setItem('veil_*')` | ✅ |
| 加到 iPhone 主屏（伪 PWA） | meta `apple-mobile-web-app-capable` | ✅ |

---

## 5. 报告分章映射（CASA0018 marking scheme 4 项配重）

> CASA0018 标准 4 项：Application(20) + Data(20) + Implementation(20) + Critical Reflection(20) + Quality of Report(20)

| Mark scheme | 报告章节 | 写什么 |
|---|---|---|
| **Application** (20) | §1-2 Intro + Motivation | "镜子测试""视频通话失败模式表" + 三类目标用户场景 |
| **Data** (20) | §3 Dataset + Preprocessing | MediaPipe 抽 blendshape → 32 维 ARKit 标准化 → 30 帧滑窗;<br>合成 vs 真录两批数据；类别平衡（每类 ~75 段）；cross-subject split |
| **Implementation** (20) | §4 System + §5 DL Model | 三层架构图 + 二进制 wire 协议 + 1D-CNN 架构图 + ablation 表 |
| **Critical Reflection** (20) | §6 Lessons | 隐私 vs 性能权衡；为什么 24Hz 不是 30Hz（带宽）；为什么不用 WebRTC（隐私 + relay 简化）；VRM 失败教训；Mac 摄像头单 tab 限制 |
| **Quality of Report** (20) | 整体 | 图表清晰 + 数字真实 + 引用规范（MediaPipe 论文 + Casiez One-Euro + ARKit doc） |

**新增**实验表（写在 §5 末尾）：

| 编号 | 实验 | 评价 | 期望 |
|---|---|---|---|
| E1 | 单人模式 fps + KB/s | fps≥22, KB/s≈6 | ✅ 已验证 |
| E2 | 双人配对(本地 LAN) RTT | <80 ms | 待测 |
| E3 | 双人配对(ngrok 跨网) RTT | <200 ms | 待测 |
| E4 | 双人 Mood Sync 触发率 | 5 次/分钟 | 待测 |
| E5 | 8 类动作识别 macro F1 | ≥0.85 | 待测 |
| E6 | 5 个 avatar × 8 动作还原 | 表情粒度对比 | 待测 |
| E7 | 1D-CNN ablation (window 20/30/45) | 选 30 | 待训 |
| E8 | 隐私审计 (Wireshark 抓包) | 0 字节像素 / 0 字节音频 | 待测，关键 |

---

## 6. 引用 (写报告 §References)

- Lugaresi et al., *MediaPipe: A Framework for Building Perception Pipelines*, 2019
- Apple, *ARKit `ARFaceAnchor.BlendShapeLocation` Reference*, 2024
- Casiez, Roussel, Vogel, *1€ Filter*, CHI 2012（One-Euro 平滑器）
- VRM 1.0 spec, vrm-c GitHub
- @pixiv/three-vrm（虽然没直接用，提一下作为放弃 VRM 的对比）
- met4citizen/TalkingHead（avatar 来源）
- Ready Player Me public avatar API
- TensorFlow.js Conversion guide
- WebSocket RFC 6455
- W3C WebRTC vs WebSocket trade-off discussion (privacy section)

---

## 7. 演示 storyboard（3 分钟视频）

| 时间 | 镜头 | 旁白 |
|---|---|---|
| 0:00 | Veil 启动页特写 | "Be together, stay private." |
| 0:10 | 输入 name + room → 进 | 带宽 pill 跳出 6 KB/s |
| 0:25 | 单人 demo：自己脸动 → 左 avatar 同步 | "我的脸从来没离开过手机" |
| 0:50 | 切镜头到第二台设备(iPhone) | 同 room code 加入 |
| 1:00 | 双人 demo：peer avatar 也活了 | top bar `paired` 亮 |
| 1:20 | 同时大笑 → 中央炸 💞 | "Mood Sync 是自训 1D-CNN 在看你们" |
| 1:50 | 切到 Wireshark 抓包窗口 | "看，0 字节视频流" |
| 2:10 | KB/s 对比表：Veil 6 vs Zoom 5000 | "800× 压缩比" |
| 2:30 | 切到 5 个 avatar 选择菜单 | 用户可换写实/卡通/自己 RPM |
| 2:50 | 黑屏 + URL + GitHub | end |

---

## 8. 下一步可选增强（写在报告 §Future Work）

| 优先级 | 任务 | 预期收益 |
|---|---|---|
| P1 | 真实数据训 1D-CNN（每类 ≥10 段 × 3 subject） | E5/E7 数字 |
| P2 | WebRTC 改造去掉 relay | 更纯粹隐私（但实现复杂） |
| P3 | 加共享白板（O 嘴触发画笔） | 演示戏剧性 |
| P4 | Push notification（朋友进 room 给手机推送） | UX |
| P5 | 端到端加密（TweetNaCl 公钥换密对称） | "even relay 看不到 blendshape" |
