# Veil 视频大纲 (中文版 · v3 · 对齐 v4.3 代码 · 8 类动作)

> **限时**: 3 分钟以内 (180 秒硬上限)
> **评分**: Clarity 10% + Technical 10% + Build 10% = 30%
> **受众**: *general audience* (blog / open day),不是 ML 专业听众
> **风格参考**: Tether (Group 4) 的视频 — 真实 demo + 实拍 + 数据 callout
> **关键事实** (报告里全部一致):
> - 8 类动作: neutral / wink_left / wink_right / smile_big / surprise / frown / mouth_o / tongue_out
> - test_acc = 0.9905,macro-F1 = 0.9903
> - 模型 32,168 参数,TF.js shard ≈ 128 KB
> - 封包 233 字节 / 帧 = 1B sender + 8B header + 16B head quat + 208B blendshape
> - 带宽 5.6 KB/s @ 24 Hz (Zoom 720p 的 0.37%)
> - 端到端延迟 P50 ≈ 33 ms
> **录制路径**: ① 屏幕录 (OBS / QuickTime) ② 摄像头脸部小窗 (PIP) ③ iMovie / DaVinci 后期合成

---

## 整体结构 (6 个 Beat)

```
0:00 ─┬─ HOOK              15s   钩子 (一句问题 + 视觉冲击)
0:15 ─┼─ PROBLEM           30s   为什么要做 (Zoom 疲劳 + 隐私)
0:45 ─┼─ DEMO              45s   双浏览器实时配对 + 8 类表情同步
1:30 ─┼─ TECHNICAL         60s   数据 → 模型 → 部署 → 结果
2:30 ─┼─ REFLECTION        20s   学到什么 + 局限
2:50 ─┴─ CTA / SIGN-OFF    10s   GitHub 链接 + 一句愿景
3:00       END                   3 分钟整,严禁超时
```

每秒钟都要有事情发生。剪辑节奏: **平均每镜头 ≤ 4 秒**。

---

## Beat 1 · HOOK (0:00–0:15 · 15 秒)

### 画面
- **[镜头 1 · 0:00–0:05]** 全屏 Zoom 通话画面 (用 Pexels "video call" 关键词的 stock 视频,或自己另一台设备拍 Zoom 截屏)。**画外音不响**,镜头中人在尴尬地盯自己脸。
- **[镜头 2 · 0:05–0:10]** 摄像头突然被一只手盖住 (隐私手势),屏幕变黑。**这一帧要 *干净一帧到位*,不要犹豫**。
- **[镜头 3 · 0:10–0:15]** 黑屏中 Veil logo 淡入,3D avatar 旋转出现 + 跟着我笑。

### 旁白
> "We've all done this. Camera on, camera off, hide. There has to be a third way."
> (我们都干过这事 — 开摄像头、关摄像头、躲。应该有第三条路。)

### 屏上文字 (lower-third 大字)
| 时间 | 文字 |
|---|---|
| 0:00 | `55% of communication is non-verbal — and 100% of it leaks your face` |
| 0:10 | `What if your expressions could travel without your face?` |

[**截图 V-1 · Veil logo 静帧**] — 你 mobile_avatar.html 顶栏的 "VEIL" 紫色字 + 一个 avatar 头像,作为转场用的 vector。

---

## Beat 2 · PROBLEM (0:15–0:45 · 30 秒)

### 画面切换 (~每 5–7 秒一镜头)
- **[镜头 4 · 0:15–0:20]** 数据可视化: "Mehrabian 55% rule" pie chart 动画 (浮 in 三块: 55% body language / 38% tone / 7% words)。建议用 D3 / Recharts / Keynote magic-move。
- **[镜头 5 · 0:20–0:25]** 一行文字 typewriter 动画: `Zoom: 1,500 KB/s · Veil: 5.6 KB/s · 0.37%`
- **[镜头 6 · 0:25–0:32]** 新闻标题剪辑: "Zoom Fatigue is Real" / "64% of remote workers turn off camera for privacy"(IPSOS 2023 数字)。
- **[镜头 7 · 0:32–0:40]** 切到我 (主讲人脸),坐桌前直视摄像头。**≤ 8 秒**。
- **[镜头 8 · 0:40–0:45]** 切到屏幕 — 展示 Veil 启动页 hero ([截图 V-2])。

### 旁白
> "Mehrabian showed in 1971 that more than half of what we *say* is actually our face. So when we keep cameras on, we leak everything — environment, mood, fatigue. (pause) Veil's question is simple: can we keep the *expression* and drop the *pixels*?"
> (Mehrabian 1971 年证明,我们说出口的话里超过一半其实是脸传达的。所以摄像头开着的时候,我们泄露的是一切 — 环境、心情、疲惫。Veil 的问题很简单: 能不能留下表情,丢掉像素?)

### 屏上文字
| 时间 | 文字 |
|---|---|
| 0:18 | `55% non-verbal · 38% tone · 7% words` |
| 0:23 | `Zoom: 1,500 KB/s · Veil: 5.6 KB/s · 0.37%` |
| 0:32 | `64% of remote workers turn off camera for privacy` (→ IPSOS 2023) |
| 0:42 | `Veil — keep the expression, drop the pixels` |

### 录制要点
- 镜头 4 的 pie chart 用 magic-move 比"飞入飞出"显贵。
- 镜头 7 直视摄像头 ≤ 8 秒,不要演讲腔。
- 数字是钩子,**不要念全句,屏幕上要打出来**。

[**截图 V-2 · 启动页 hero**] — `http://localhost:8080/mobile_avatar.html?local=1` 加载完成那一帧,VEIL logo + "Be together, stay private" + 那 3 步引导卡。**你截一下**。

---

## Beat 3 · DEMO (0:45–1:30 · 45 秒) ★ 这一节决定 Quality of Build 10 分

### 画面 — 这是整支视频的核心
**录制要求**: 屏幕录用 **60 fps + 1080p+** OBS scene 同时录 Chrome + Safari + 我的脸 (画中画 200×200)。

- **[镜头 9 · 0:45–0:55]** 屏幕分屏: 左 Chrome 右 Safari,两个都打开 mobile_avatar.html。我演示在两个窗口分别填名字 / room code (*同一个 room code*),分别选不同 avatar (左 *Mira* GLB 右 *V-1* VRM)。
- **[镜头 10 · 0:55–1:05]** 两个窗口都点 "Allow camera & enter room",顶部 pill **从 waiting 变 paired** (绿)。**这一帧要慢放 0.5×**。
- **[镜头 11 · 1:05–1:25]** 我做出 **5 个动作**,两个窗口里两个 avatar **同步跟着动**。每个动作 3-4 秒:
  - smile_big (1:05–1:09)
  - surprise (1:09–1:13)
  - wink_left (1:13–1:17)
  - mouth_o (1:17–1:21)
  - tongue_out (1:21–1:25)
- **[镜头 12 · 1:25–1:28]** 双方同时 smile_big → 中央爆出 💞 mood-sync emoji 动画。
- **[镜头 13 · 1:28–1:30]** 镜头特写底部 `~5.5 KB/s` bandwidth pill,后期加红圈 + arrow 指。

### 旁白
> "Two browsers. Same room code. Different avatars. (pause) Watch — when I smile, my avatar smiles. Wink, surprise, mouth-O, tongue-out — eight discrete actions, recognised entirely in the browser. When my partner smiles too — that little burst is mood sync, fired only when both ends agree. And the bandwidth — five-point-six kilobytes per second. Two-hundred-fifty times less than a Zoom call."
> (两个浏览器,同一个房间码,不同的化身。看 — 我笑,我的化身就笑。挤眼、惊讶、张嘴 O、吐舌 — 8 个离散动作,完全在浏览器里识别。当我的搭档也笑 — 中间这个爆发就是 mood sync,只在双方都同意时触发。带宽 — 每秒 5.6 KB,比 Zoom 少 250 倍。)

### 屏上文字 (callout)
| 时间 | 文字 | 位置 |
|---|---|---|
| 0:48 | `Two browsers · same room code · different avatars` | 底部 |
| 0:58 | `← paired in <2s →` | 顶部 pill 旁边 |
| 1:05 | `8 actions · recognised in-browser by 1D-CNN` | 上方 |
| 1:18 | `MediaPipe → 52d → 1D-CNN → action label` | 底部 |
| 1:25 | `mood-sync 💞 fired (both happy ≥ 1s)` | 中央 |
| 1:28 | `Zoom: 1,500 KB/s · Veil: 5.6 KB/s` | 底部 |

### 录制要点 (*Build 10 分的关键*)
1. **必须是真实双窗口实时配对**,不要后期合成。评分老师从画面流畅度看得出。
2. mood-sync 那一帧要预先彩排过 — 真实情况下两人需要同时笑,可能要重录几遍才能对齐。
3. bandwidth pill 那一刻**镜头 zoom in** 到 5.6 KB/s 这几个字,后期加红圈 + arrow。
4. **5 个动作**全做齐 — 这是把视频从"我训了一个二分类"升级成"我训了一个 8 分类"的关键差异点,直接对应 Technical 10 分。

### 截图清单
- [**截图 V-3 · Demo 主截图**] — 双浏览器并排 paired 状态。这一张做缩略图也用得上。
- [**截图 V-4 · 5 个动作合成**] — 9-cell grid: 第 1 列我的脸 5 行,第 2 列左 avatar 5 行,第 3 列右 avatar 5 行。证明**模型真的能识别 8 类**而不是只笑一种。
- [**截图 V-5 · mood-sync 💞 触发瞬间**]。
- [**截图 V-6 · 5.6 KB/s bandwidth pill 特写**]。

---

## Beat 4 · TECHNICAL OVERVIEW (1:30–2:30 · 60 秒) ★ 这一节决定 Technical 10 分

### Sub-beat 4.1 (1:30–1:42 · 12s) 数据 + 管线
**[镜头 14 · 1:30–1:42]** 切到 **[Fig 2 数据管线图]** 全屏,逐 stage 高亮:
`Camera Frame → 468 Landmarks → 52 Blendshapes → 30-frame Window → 1D-CNN → 8-way softmax`。每 stage 高亮 ~2 秒。

**旁白**:
> "MediaPipe extracts four-hundred-sixty-eight facial landmarks per frame, condensed into fifty-two ARKit blendshapes — the same vocabulary Animoji uses. Thirty frames stack into a one-second window, fed to the network."

**屏上文字**: `468 → 52 in 22 ms · all on-device`

### Sub-beat 4.2 (1:42–1:54 · 12s) 模型架构
**[镜头 15 · 1:42–1:54]** 切到 **[Fig 3 1D-CNN 架构图]**。逐层 reveal: Conv → BN → Conv → BN → Conv → BN → GAP → Dropout → Dense(8, softmax)。

**旁白**:
> "A small 1D CNN — thirty-two thousand parameters, three milliseconds per inference. Trained on six hundred synthetic sessions across eight action classes."

**屏上文字**:
- 1:45 `1D-CNN · 32,168 params · 8 classes`
- 1:50 `TF.js shard: 128 KB · inference: 2.8 ms`

### Sub-beat 4.3 (1:54–2:10 · 16s) 训练 + 结果
**[镜头 16 · 1:54–2:02]** 切到 **[Fig 4 训练曲线]**,loss 单调下降 + acc 上升动画 (用 `artifacts/training_history.png`)。
**[镜头 17 · 2:02–2:10]** 切到 **[Fig 5 混淆矩阵]** heatmap (用 `artifacts/confusion_matrix.png`),对角线 312 / 315 全亮。

**旁白**:
> "Test accuracy: ninety-nine point oh five percent on three hundred fifteen windows. (pause) But honest disclosure — the split is by window, not by actor. On real strangers it drops to about eighty-four. Generalisation is where edge AI gets honest."
> (测试准确率 99.05%,基于 315 个窗口。但坦白说 — 这是按窗口切分,不是按人。在真正陌生人身上掉到 ~84%。泛化才是 edge AI 真正诚实的地方。)

**屏上文字**:
- 2:00 `Test acc: 99.05% · macro-F1: 0.9903 · 315 windows`
- 2:07 `wild-test on strangers: ~84% — generalisation gap`

### Sub-beat 4.4 (2:10–2:30 · 20s) 部署 + 多用户协议
**[镜头 18 · 2:10–2:18]** 切到 **[Fig 1 三层架构图]**,红色虚线圈出"本地"区域 + 绿色虚线圈出"穿网区域"。
**[镜头 19 · 2:18–2:25]** 切到 Chrome DevTools → Network → WS 那栏,看到一行 `233 bytes` 的 binary frame。
**[镜头 20 · 2:25–2:30]** 屏幕回到双 avatar 实时画面。

**旁白**:
> "Each frame travels as two-hundred-thirty-three bytes — header, head pose quaternion, fifty-two floats. No pixels ever leave the device. The relay never sees a face."
> (每一帧只有 233 字节 — 包头、头部姿态四元数、52 个浮点。像素从不离开设备。中继服务永远看不到一张脸。)

**屏上文字**:
- 2:15 `Per-frame packet: 1B sender + 8B header + 16B quat + 208B blendshapes = 233B`
- 2:23 `Zero pixels uploaded — by design`

[**截图 V-7 · DevTools Network WS 面板**] — Chrome DevTools → Network → WS,看到 233 bytes 的 binary frame 那一行。**你截一下**。

### Sub-beat 4 录制要点
- 5 张图 (架构 1 + 数据管线 2 + 模型 3 + 训练曲线 4 + 混淆矩阵 5) **事先做好高分辨率 PNG**,后期用 Keynote magic-move 切换。
- 不要用整张 PowerPoint,用全屏 PNG + 标注 overlay。
- 旁白节奏每 sub-beat *不超过 12-16 秒*,留 2-3 秒缓冲。

---

## Beat 5 · REFLECTION (2:30–2:50 · 20 秒)

### 画面
- **[镜头 21 · 2:30–2:40]** 切到我本人镜头 (直视),手势自然。背景: 桌面有 Mac + 开发者氛围 (笔记本、咖啡)。
- **[镜头 22 · 2:40–2:50]** 切到一段 *frown 误判为 wink_left* 的实际混淆样本视频 (我自己录的反面案例),屏幕上叠红框 + "misclassified" 文字。

### 旁白
> "Two honest limitations. One — the test split was by window, not by person; my real cross-subject score is closer to eighty-four. Two — ARKit's fifty-two blendshapes don't have an 'anger' channel, so frown and angry collapse together. Both are fixable — but they're real."
> (两个诚实的局限。一 — 测试切分是按窗口而不是按人,真正的跨人测试分数更接近 84%。二 — ARKit 的 52 个 blendshape 里没有"愤怒"通道,所以 frown 和 angry 会塌成同一个。两个都能修 — 但它们真实存在。)

### 屏上文字
- 2:32 `Limitation 1: by-window split — cross-subject ≈ 84%`
- 2:42 `Limitation 2: 'anger' has no native blendshape channel`

### 录制要点
- 这一节是 mark scheme 看 *clarity of presentation* 的地方 — **承认局限会加分**,不要吹。
- 如果时间紧,这一段可以省到 15 秒 (20 → 15),把多出来的 5 秒并到 Beat 3 Demo。

[**截图 V-8 · frown → wink_left 误判录屏静帧**] — 我面部明显皱眉,但 avatar 显示左眼挤眼,旁边 confidence vector 显示 wink_left:0.51 / frown:0.47。**你需要彩排录这段反面 case**。

---

## Beat 6 · CTA / SIGN-OFF (2:50–3:00 · 10 秒)

### 画面
- **[镜头 23 · 2:50–2:58]** 全屏 logo 动画 + 三行 CTA。
- **[镜头 24 · 2:58–3:00]** 暗场 + Veil 单字 logo 收尾。

### 屏上文字 (大字)
```
Veil — be together, stay private
github.com/<user>/Veil
CASA0018 · UCL · 2025
```

### 旁白
> "Veil. Be together, stay private. Code's on GitHub."

---

# 录制 + 后期 checklist

## 录制
- [ ] OBS 双场景: Scene A = 双浏览器 + 我脸 PIP; Scene B = 全屏 PPT/图
- [ ] 1080p / 60fps / H.264 / AAC 48kHz
- [ ] **环境光从前打** (避免 MediaPipe 在我脸上掉点)
- [ ] 麦克风用 Mac 自带 + iPhone 备份 (怕一台坏)
- [ ] 录之前**先把脚本逐字念一遍**,然后再做 demo,**声画分轨**录
- [ ] **Beat 3 demo 至少录 3 take** — 挑配对最快、5 个动作最准、mood-sync 最干净的那条
- [ ] 录前先 `localStorage.clear()` 清掉旧 avatar 设置,避免演示时窗口自动跳到旧选择

## 后期 (iMovie / Resolve / FCPX 任选)
- [ ] 把每个 beat 的镜头放到对应轨道,先对时长再对内容
- [ ] **加屏上文字** (lower-third + 大字 callout) — *没有屏字 clarity 拿不到 8/10*
- [ ] BGM 极轻 (–25 dB),不要有人声 / 歌词 / 强节拍 干扰旁白
- [ ] 旁白录完后用 **Audacity 降噪 + compressor** 让音量统一
- [ ] 最后渲染前**关声音播一遍**,看是否仅看画面就能 follow story (clarity 评分点)
- [ ] 检查时长 ≤ 180 秒 严格遵守 — **超时直接扣 clarity 分**

## 上传
- [ ] YouTube unlisted 或 UCL OneDrive 共享链接
- [ ] 视频描述里贴: GitHub link + Veil 一句 tagline + CASA0018 标签
- [ ] **GitHub README 里嵌一个视频 thumbnail 链接** — Build 项 +1 pt 点

---

# 评分项映射 (每个 beat 命中哪个评分点)

| Beat | 时长 | Clarity 10% | Technical 10% | Build 10% |
|---|---:|:---:|:---:|:---:|
| 1 Hook | 15s | ✓✓ | – | – |
| 2 Problem | 30s | ✓✓ | – | – |
| 3 **Demo** | 45s | ✓ | ✓ | **✓✓✓** |
| 4 **Technical** | 60s | ✓ | **✓✓✓** | ✓ |
| 5 Reflection | 20s | ✓✓ | ✓ | – |
| 6 CTA | 10s | ✓ | – | – |

如果时间紧迫只能砍 1 个 beat: **保留 3 + 4,牺牲 2** — 视频开头多 5 秒 hook 直接进 demo。

---

# 截图 / 图清单 (视频专用,跟报告不重复)

| 编号 | 内容 | 来源 | 操作 |
|---|---|---|---|
| **截图 V-1** | Veil logo 静帧 (转场用) | mobile_avatar.html 顶栏 | 你截 |
| **截图 V-2** | 启动页 hero | 启动页加载完那一帧 | 你截 |
| **截图 V-3** | Demo 双浏览器 paired | OBS scene A | 你录视频时定格 |
| **截图 V-4** | 5 个动作合成 grid (我脸 + 左 avatar + 右 avatar) | OBS 多 take | 后期合成 |
| **截图 V-5** | mood-sync 💞 触发瞬间 | OBS 同时笑 take | 你录 |
| **截图 V-6** | 5.6 KB/s bandwidth pill 特写 | 底部 pill 区域 | 后期 zoom in |
| **截图 V-7** | DevTools Network WS 233 bytes | Chrome DevTools | 你截 |
| **截图 V-8** | frown → wink_left 误判反面 case | 故意做模糊表情 | 你彩排录 |
| **Fig 1** (复用报告) | 三层架构图 | draw.io | 复用 |
| **Fig 2** (复用报告) | 数据管线图 | draw.io | 复用 |
| **Fig 3** (复用报告) | 1D-CNN 架构 | Netron | 复用 |
| **Fig 4** (复用报告) | 训练曲线 | `artifacts/training_history.png` | 复用 |
| **Fig 5** (复用报告) | 混淆矩阵 | `artifacts/confusion_matrix.png` | 复用 |

---

# 一句话录制顺序建议

> **先把 Beat 3 Demo 录通顺** (双浏览器配对 + 5 个动作 + mood-sync 三件事),其它 beat 都好补;Demo 砸了整支视频就废一半分。

---

# Beat 3 demo 的彩排 checklist (录之前过 5 遍)

1. **配对 ≤ 2 秒**: 两个窗口同时点 Go,Pill 在 2 秒内变绿。如果你的相机授权慢,先把两窗口都 Allow 一次摄像头让 Chrome / Safari 记住。
2. **8 类动作的可识别度** (录之前自己测一遍每个动作 confidence ≥ 0.5):
   - smile_big — 嘴角咧到耳朵,牙齿露出来
   - surprise — 眉毛上扬 + 嘴张开 (不是 mouth_o)
   - wink_left — 单独闭左眼,右眼睁 (注意 MediaPipe 视角是镜像)
   - wink_right — 单独闭右眼
   - mouth_o — 嘴撅成圆形 ("oh")
   - tongue_out — 伸舌头 (这是最显眼的,一定要录)
   - frown — 眉头紧锁 + 嘴角下垂
   - neutral — 静止 (用来做对照)
3. **mood-sync 触发**: 两人**同时**做 smile_big,保持 ≥ 1 秒,中央会出 💞。如果第一次没触发,看看双方 confidence 都 ≥ 0.5 (代码 `CONF_THRESHOLD = 0.5`)。
4. **bandwidth pill 显示**: 顶部 pill 旁边的 `~5.5 KB/s` 是底部 stats bar 计算的。录的时候**别让网络抖动让数字飘到 7+**,可以提前重启 relay。
5. **录 3 take 留备**: 第 1 take 试错,第 2/3 take 正式。


---

# 视频引用图汇总 / Figures referenced in this video

![图 / Fig 1 · 系统架构 / system architecture](/sessions/amazing-zealous-cerf/mnt/DLLLL1/docs/figures/fig_architecture.png)

![图 / Fig 2 · 数据管线 / data pipeline](/sessions/amazing-zealous-cerf/mnt/DLLLL1/docs/figures/fig_pipeline.png)

![图 / Fig 3 · 1D-CNN 架构 / 1D-CNN architecture](/sessions/amazing-zealous-cerf/mnt/DLLLL1/docs/figures/fig_model.png)

![图 / Fig 4 · 训练曲线 / training history](/sessions/amazing-zealous-cerf/mnt/DLLLL1/action_recognition/artifacts/training_history.png)

![图 / Fig 5 · 混淆矩阵 / confusion matrix](/sessions/amazing-zealous-cerf/mnt/DLLLL1/docs/figures/fig_confusion_matrix.png)

![图 / Fig 6 · 类级 P/R/F1 / per-class P/R/F1](/sessions/amazing-zealous-cerf/mnt/DLLLL1/docs/figures/fig_per_class_metrics.png)

![图 / Fig 7 · 消融对比 / ablation](/sessions/amazing-zealous-cerf/mnt/DLLLL1/docs/figures/fig_ablation.png)

![图 / Fig 8 · 端到端延迟 / end-to-end latency](/sessions/amazing-zealous-cerf/mnt/DLLLL1/docs/figures/fig_latency.png)

![图 / Fig 9 · 带宽对比 / bandwidth comparison](/sessions/amazing-zealous-cerf/mnt/DLLLL1/docs/figures/fig_bandwidth.png)

![图 / Fig 10 · 封包结构 / packet anatomy](/sessions/amazing-zealous-cerf/mnt/DLLLL1/docs/figures/fig_packet.png)

![图 / Fig 11 · 数据集平衡 / dataset class balance](/sessions/amazing-zealous-cerf/mnt/DLLLL1/docs/figures/fig_dataset_balance.png)

