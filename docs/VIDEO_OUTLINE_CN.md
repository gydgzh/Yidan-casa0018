# Veil 视频大纲(中文版)

> 限时: **3 分钟以内**(180 秒硬上限)
> 评分: Clarity 10% + Technical 10% + Build 10% = 30%
> 受众: *general audience*(blog / open day),不是 ML 专业听众
> 录制路径建议: ① 屏幕录(OBS / QuickTime)② 摄像头脸部小窗 ③ 后期 iMovie / DaVinci 拼

---

## 整体结构 (5 个 Beat)

```
0:00 ─┬─ HOOK              15s   钩子(单句问题 + 视觉冲击)
0:15 ─┼─ PROBLEM           30s   为什么要做(Zoom 疲劳 + 隐私)
0:45 ─┼─ DEMO              45s   两个浏览器实时配对 + 表情同步
1:30 ─┼─ TECHNICAL         60s   数据 → 模型 → 部署 → 结果
2:30 ─┼─ REFLECTION        20s   学到什么 + 局限
2:50 ─┴─ CTA / SIGN-OFF    10s   GitHub 链接 + 一句立项愿景
3:00       END                   3 分钟整,不能超
```

每秒钟都要有事情发生。剪辑节奏: **平均每镜头 ≤ 4 秒**。

---

## Beat 1: HOOK  (0:00–0:15 · 15 秒)

### 画面
[镜头 1 · 0:00–0:05] 全屏 Zoom 通话画面(可以用我自己的另一台机器拍 Zoom 截屏,或拿 Apple Stock 视频)。**画外音不响**,镜头中人在尴尬地盯自己脸。
[镜头 2 · 0:05–0:10] 摄像头突然被一只手盖住(隐私手势),屏幕变黑。
[镜头 3 · 0:10–0:15] 黑屏中 Veil logo 淡入,3D avatar 旋转出现 + 跟着我笑。

### 旁白(5 秒级别)
> "We've all done this. Camera on, camera off, hide. There has to be a third way."

### 屏上文字 (lower-third)
- 0:00 `55% of communication is non-verbal — and 100% of it leaks your face`
- 0:10 `What if your expressions could travel without your face?`

### 录制要点
- 镜头 1 不要真的拿同事的 Zoom,用一段视频素材(如 Pexels "video call" 关键词)
- 镜头 2 那个手盖摄像头的动作要 *干净一帧到位*,不要犹豫

[截图 V-1: Veil logo 静帧 — 你 mobile_avatar.html 顶栏的 "VEIL" 紫色字 + 一个 avatar 头像,作为转场用的 vector]

---

## Beat 2: PROBLEM  (0:15–0:45 · 30 秒)

### 画面切换 (~每 5 秒一个)
[镜头 4 · 0:15–0:20] 数据可视化: "Mehrabian 55% rule" pie chart 动画(浮 in 三块: 55% body language / 38% tone / 7% words)。
[镜头 5 · 0:20–0:25] 一行文字 "$1.5 Mbps × 8h × 5 days = 27 GB/week of your face uploaded"(用 typewriter 动画)。
[镜头 6 · 0:25–0:30] 新闻标题截图剪辑: "Zoom Fatigue is Real" / "Remote Worker Privacy Concerns Hit 64%"(用 IPSOS 2023 数字)
[镜头 7 · 0:30–0:40] 切到我(主讲人脸),坐在桌前,直视摄像头。
[镜头 8 · 0:40–0:45] 镜头切到屏幕,展示 Veil 启动页(UI hero)。

### 旁白
> "Mehrabian showed in 1971 that more than half of what we *say* is actually our face. So when we keep cameras on, we leak everything — environment, mood, fatigue. (pause) Veil's question is simple: can we keep the *expression* and drop the *pixels*?"

### 屏上文字
- 0:18 `55% non-verbal · 38% tone · 7% words`
- 0:23 `Zoom: 1.5 Mbps · Veil: 6 KB/s · 250× less`
- 0:32 `64% of remote workers turn off camera for privacy`     [→ IPSOS 2023]
- 0:42 `Veil — keep the expression, drop the pixels`

### 录制要点
- 镜头 4 的 pie chart 用 D3 / Recharts / Keynote magic-move 动画
- 镜头 7 直视摄像头的人脸 cut-in 要 ≤ 5 秒,不要演讲腔
- 数字是钩子,不要念全句,**屏幕上要打出来**

[截图 V-2: 启动页 hero — http://localhost:8080/mobile_avatar.html?local=1 加载完成那一帧,VEIL logo + "Be together, stay private" + 那 3 步引导卡。**这张你截一下**]

---

## Beat 3: DEMO  (0:45–1:30 · 45 秒) ★ 这一节决定 Quality of Build 10 分

### 画面 — 这是整支视频的核心,**屏幕录制的画面要清晰**(60fps + 1080p+)
[镜头 9 · 0:45–0:55] 屏幕分屏: 左 Chrome 右 Safari,两个都打开 mobile_avatar.html。我演示在两个窗口分别填名字 / room code(*同一个 room code*),分别选不同 avatar(左 Mira 右 V-1)。
[镜头 10 · 0:55–1:05] 两个窗口都点 "Allow camera & enter room",顶部 pill **从 waiting 变 paired**(绿)。**这一帧要慢放**。
[镜头 11 · 1:05–1:20] 我做出 4 个表情(中性 → 笑 → 惊讶 → 皱眉),两个窗口里两个 avatar **同步跟着动**。每个表情 3-4 秒。
[镜头 12 · 1:20–1:25] 双方同时大笑 → 中央爆出 💞 mood-sync emoji 动画。
[镜头 13 · 1:25–1:30] 镜头特写底部 `~6 KB/s` bandwidth pill(对比 Zoom 1500 KB/s)。

### 旁白
> "Two browsers. Same room code. Different avatars. (pause) Watch — when I smile, my avatar smiles. When my partner smiles too — that little burst is mood sync, fired only when both ends agree. And the bandwidth — six kilobytes per second. Two-hundred-fifty times less than a Zoom call."

### 屏上文字
- 0:48 `Two browsers · same room code · different avatars`
- 1:02 `← paired in <2s →`
- 1:18 `52 floats / 24 Hz = 6 KB/s`
- 1:23 `mood-sync 💞 fired (both happy ≥ 1s)`
- 1:28 `Zoom: 1500 KB/s · Veil: 6 KB/s`

### 录制要点 (*Build 10 分的关键*)
1. **必须是真实双窗口实时配对**,不要后期合成。评分老师从画面流畅度看得出。
2. 屏幕录用 **OBS scene** 同时录 Chrome + Safari + 我的脸(画中画 200×200)。这样他们能看到"左屏 Mira 跟着我的脸"的因果关系。
3. mood-sync 那一帧要预先彩排过 —— 真实情况下两人需要同时笑,可能要重录几遍才能对齐。
4. bandwidth pill 那一刻**镜头 zoom in** 到 6 KB/s 这几个字,后期加红圈 + arrow 指。

[截图 V-3: Demo 主截图 — 两个浏览器并排 paired 状态。这一张做缩略图也用得上。**你截**]
[截图 V-4: mood-sync 💞 触发瞬间。**你截**]
[截图 V-5: 6 KB/s bandwidth pill 特写。**你截**]
[截图 V-6: 我的脸做表情 + avatar 跟动 的双屏对比 —— 至少要捕捉 笑 / 惊讶 两组。**你录视频时定格**]

---

## Beat 4: TECHNICAL OVERVIEW  (1:30–2:30 · 60 秒) ★ 这一节决定 Technical 10 分

### Sub-beat 4.1 (1:30–1:45 · 15s) 数据 + 管线
[镜头 14 · 1:30–1:45] 切到 [图 2 数据管线图] 全屏,逐个高亮每个 stage:
`Camera Frame → 468 Landmarks → 52 Blendshapes → 30-frame Window → 1D-CNN → Emotion`。
每个 stage 高亮 ~2 秒,旁白同步描述。

旁白:
> "MediaPipe extracts 468 landmarks per frame, condensed to 52 ARKit blendshapes — the same expression vocabulary used by Animoji."

屏上文字: `468 → 52 in 22 ms · all on-device`

### Sub-beat 4.2 (1:45–2:00 · 15s) 模型架构
[镜头 15 · 1:45–2:00] 切到 [图 3 1D-CNN 架构图]。逐层 reveal: Conv → Conv → Pool → Dropout → Conv → GAP → Dense → Softmax。

旁白:
> "A small 1D CNN — 32K parameters, 3 ms per inference. Trained on RAVDESS plus six thousand of my own synthetic windows."

屏上文字:
- 1:48 `1D-CNN · 32K params · 4 classes`
- 1:55 `RAVDESS + 6K self-collected windows`

### Sub-beat 4.3 (2:00–2:15 · 15s) 训练 + 结果
[镜头 16 · 2:00–2:08] 切到 [图 4 训练曲线] subplot 4 (v1.0),loss 收敛 + acc 上升动画。
[镜头 17 · 2:08–2:15] 切到 [图 5 混淆矩阵] heatmap,对角线发亮。

旁白:
> "Four ablation runs. Final test accuracy: ninety-nine point oh five percent. (pause) But — on real strangers, only eighty-four. Generalisation is where it gets honest."

屏上文字:
- 2:02 `4 ablation runs · 99.05% test acc`
- 2:11 `wild-test on strangers: 84.2% — generalisation gap`

### Sub-beat 4.4 (2:15–2:30 · 15s) 部署 + 多用户
[镜头 18 · 2:15–2:25] 切到 [图 1 三层架构图],红色虚线圈出"本地"区域 + 绿色虚线圈出"穿网区域"。配合演示包: 抓一帧 WebSocket DevTools 看到 `233 bytes` 二进制包。
[镜头 19 · 2:25–2:30] 屏幕回到双 avatar 实时画面。

旁白:
> "Each frame travels as 233 bytes — a header plus a head-pose quaternion plus those 52 floats. No pixels ever leave the device."

屏上文字:
- 2:18 `Per-frame packet: 8B header + 16B quat + 208B blendshapes = 233 B`
- 2:25 `Zero pixels uploaded — by design`

[截图 V-7: Chrome DevTools → Network → WS 那栏,看到一行 233 bytes 的 binary frame。**你截一下**]

### Sub-beat 4 录制要点
- 4 张图(数据管线 / 架构 / 曲线 / 混淆矩阵)**事先做好高分辨率 PNG**,后期用 Keynote magic-move 切换更专业。
- 不要用整张 PowerPoint,用全屏 PNG + 标注 overlay。
- 旁白节奏每 sub-beat 要 *不超过 12 秒*,留 3 秒缓冲。

---

## Beat 5: REFLECTION  (2:30–2:50 · 20 秒)

### 画面
[镜头 20 · 2:30–2:40] 切到我本人镜头(直视),手势自然。背景: 桌面有 Mac + Arduino + 笔记本(暗示工程师姿态)。
[镜头 21 · 2:40–2:50] 切到一段 *anger 误判为 frown* 的实际混淆样本视频(我自己录的反面案例),屏幕上叠红框 + "misclassified" 文字。

### 旁白
> "Two honest limitations. One — synthetic data taught the model *my* face, not faces. Two — the 52 blendshapes don't have an 'anger' channel; we map it to frown, and confusion happens. Both are fixable — but they're real."

### 屏上文字
- 2:32 `Limitation 1: domain gap — own face ≠ all faces`
- 2:42 `Limitation 2: 'anger' has no native blendshape channel`

### 录制要点
- 这一节是 mark scheme 看 *clarity of presentation* 的地方:**承认局限会加分**,不要吹。
- 如果时间紧,可以省到 15 秒(20 → 15),把多出来的 5 秒并到 Demo 或 CTA。

[截图 V-8: 一段 anger → frown 误判的录屏静帧 — 我面部明显愤怒,但 avatar 显示 frown(嘴角下垂),旁边 confidence vector 显示 frown:0.51 / anger:0.47。**你需要彩排录这段反面 case**]

---

## Beat 6: CTA / SIGN-OFF  (2:50–3:00 · 10 秒)

### 画面
[镜头 22 · 2:50–2:58] 全屏 logo 动画 + 三行 CTA。
[镜头 23 · 2:58–3:00] 暗场 + Veil 单字 logo 收尾。

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
- [ ] **环境光从前打**(避免 MediaPipe 在我脸上掉点)
- [ ] 麦克风用 Mac 自带 + iPhone 备份(怕一台坏)
- [ ] 录的时候**先写好脚本逐字念一遍**,然后再做 demo,声画分轨
- [ ] **demo beat 至少录 3 take**,挑配对最快、表情最准、mood-sync 最干净的那条

## 后期 (iMovie / Resolve / FCPX 任选)
- [ ] 把每个 beat 的镜头放到对应轨道,先对时长再对内容
- [ ] **加屏上文字**(lower-third + 大字 callout)—— *没有屏字 clarity 拿不到 8/10*
- [ ] BGM 极轻 (–25 dB),不要有人声 / 歌词 / 强节拍 干扰旁白
- [ ] 旁白录完后用 **Audacity 降噪 + compressor** 让音量统一
- [ ] 最后渲染前播一遍 **关声音**,看是否仅看画面就能 follow story
- [ ] 检查时长 ≤ 180 秒 严格遵守,**超时直接扣 clarity 分**

## 上传
- [ ] YouTube unlisted 或 UCL OneDrive 共享链接
- [ ] 视频描述里贴: GitHub link + Veil 一句 tagline + CASA0018 标签
- [ ] **GitHub README 里嵌一个视频 thumbnail 链接** —— Build 项 +1pt 点

---

# 评分项映射(每个 beat 命中哪个评分点)

| Beat | 时长 | Clarity 10% | Technical 10% | Build 10% |
|---|---:|:---:|:---:|:---:|
| 1 Hook | 15s | ✓✓ | – | – |
| 2 Problem | 30s | ✓✓ | – | – |
| 3 **Demo** | 45s | ✓ | ✓ | **✓✓✓** |
| 4 **Technical** | 60s | ✓ | **✓✓✓** | ✓ |
| 5 Reflection | 20s | ✓✓ | ✓ | – |
| 6 CTA | 10s | ✓ | – | – |

如果时间紧迫只能砍 1 个 beat: **保留 3 + 4,牺牲 2** —— 视频开头多 5 秒 hook 直接进 demo。

---

# 一句话录制顺序建议

> 先把 **Beat 3 Demo** 录通顺(双浏览器配对 + 表情 + mood-sync 三件事),其它 beat 都好补;Demo 砸了整支视频就废一半分。
