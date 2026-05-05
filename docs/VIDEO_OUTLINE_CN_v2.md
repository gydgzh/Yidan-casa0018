# Veil 视频大纲（中文版 · v2 · 对齐 v4.3 / 8 类动作）

> 限时：**3 分钟以内**（180 秒硬上限）
> 评分：Clarity 10% + Technical 10% + Build 10% = **30%**（视频侧）
> 受众：*general audience*（blog / open day），不是 ML 专业听众
> 录制建议：① 屏幕录（OBS / QuickTime）② 摄像头脸部小窗 ③ 后期 iMovie / DaVinci 拼
> 项目状态：8 类动作（不是旧版 4 emotion） · v4.3-localfix · 232B/帧 @ 24Hz

---

## 整体结构（6 个 Beat · 时间码硬上限）

```
0:00 ─┬─ HOOK              15s   钩子（单句问题 + 视觉冲击）
0:15 ─┼─ PROBLEM           30s   为什么要做（Zoom 疲劳 + 隐私）
0:45 ─┼─ DEMO              50s   双浏览器配对 + 8 类动作 + mood-sync
1:35 ─┼─ TECHNICAL         55s   数据 → 模型 → 部署 → 结果
2:30 ─┼─ REFLECTION        20s   学到什么 + 局限
2:50 ─┴─ CTA / SIGN-OFF    10s   GitHub 链接 + 一句立项愿景
3:00       END                    3 分钟整，不能超
```

每秒钟都要有事情发生。剪辑节奏：**平均每镜头 ≤ 4 秒**。

---

## Beat 1 · HOOK  (0:00–0:15 · 15 秒)

### 画面
- [镜头 1 · 0:00–0:05]　全屏 Zoom 通话画面（用 Pexels "video call" 关键词的 stock 视频，**不要**用同事真实 Zoom）。镜头中人在尴尬地盯自己脸。
- [镜头 2 · 0:05–0:10]　摄像头突然被一只手盖住（隐私手势），屏幕变黑 — *干净一帧到位，不要犹豫*。
- [镜头 3 · 0:10–0:15]　黑屏中 VEIL logo 淡入，3D avatar（V-1 二次元）旋转出现 + 跟着我笑。

### 旁白
> "We've all done this. Camera on, camera off, hide. There has to be a third way."

### 屏上文字（lower-third）
- 0:00　`55% of communication is non-verbal — and 100% of it leaks your face`
- 0:10　`What if your expressions could travel without your face?`

### 录制要点
- 镜头 2 那一帧手势要利落 — 重录到对位为止。
- 镜头 3 的 avatar 旋转用 `mobile_avatar.html?demo=1&myav=vroid_v1` 跳过开始页直接进 V-1 single view，OBS 录 3 秒 → 后期加淡入。

[截图 V-1：VEIL logo 静帧]
- **怎么截**：`mobile_avatar.html?demo=1` 加载完成后，截顶 bar 那条 `VEIL` 紫色字 + 一个 avatar 头像，作为转场用 vector。

---

## Beat 2 · PROBLEM  (0:15–0:45 · 30 秒)

### 画面（每 5 秒切 1 镜）
- [镜头 4 · 0:15–0:20]　数据可视化：Mehrabian "55-38-7" 饼图动画（D3 / Recharts / Keynote magic-move）。
- [镜头 5 · 0:20–0:25]　一行打字机文字 `1.5 Mbps × 8h × 5d = 27 GB/week of your face`。
- [镜头 6 · 0:25–0:30]　新闻标题剪辑：`Zoom Fatigue is Real` / `64% turn camera off for privacy — IPSOS 2023`。
- [镜头 7 · 0:30–0:40]　切到我（主讲人脸），坐在桌前，直视摄像头。
- [镜头 8 · 0:40–0:45]　切到屏幕，展示 Veil 启动页（UI hero）。

### 旁白
> "Mehrabian showed in 1971 that more than half of what we *say* is actually our face. So when we keep cameras on, we leak everything — environment, mood, fatigue. (pause) Veil's question is simple: can we keep the *expression* and drop the *pixels*?"

### 屏上文字
- 0:18　`55% non-verbal · 38% tone · 7% words`
- 0:23　`Zoom: 1500 KB/s · Veil: 5.5 KB/s · 270× less`
- 0:32　`64% of remote workers turn off camera for privacy`　[→ IPSOS 2023]
- 0:42　`Veil — keep the expression, drop the pixels`

### 录制要点
- 镜头 4 的饼图必须"自己长出来"动画，不要 PowerPoint 平面图。
- 数字是钩子，**屏上要打出来**，不要只念。

[截图 V-2：启动页 hero]
- **怎么截**：`http://localhost:8080/mobile_avatar.html?local=1` 加载完毕、未点开始那一帧 — VEIL logo + "Be together, stay private" 副标题 + 3 步引导卡。

---

## Beat 3 · DEMO  (0:45–1:35 · 50 秒) ★ Build 10 分的关键

### 画面 — 屏幕录制必须 1080p / 60 fps；OBS 用 *双 source* 同时录 Chrome + Safari

#### 3a · 配对 (0:45–0:55 · 10s)
- [镜头 9 · 0:45–0:50]　左右分屏：左 Chrome 右 Safari，两窗口都打开 `mobile_avatar.html?local=1`。我演示分别填 `Yidan` / `Friend`，相同 room code `cosy42`，左选 Mira（GLB 写实）右选 V-1（VRM 二次元）。
- [镜头 10 · 0:50–0:55]　两个窗口都点 "Allow camera & enter room"，**顶部 pill 从 `waiting` 变绿色 `paired`** — 这一帧慢放到 1.5×。

#### 3b · 8 类动作演示 (0:55–1:25 · 30s)
- [镜头 11 · 0:55–1:00]　**smile_big** — 我大笑，左 Mira / 右 V-1 都跟着笑，halo 染成橙色（`ACTION_COLOR.smile_big = 0xff8a55`）。
- [镜头 12 · 1:00–1:05]　**surprise** — 我惊讶（眉抬 + 眼睁大），avatar 同步 + halo 变天蓝色 (0x6cf)。
- [镜头 13 · 1:05–1:10]　**wink_left** + **wink_right** 各 2.5s — 单眼挤眨，halo 变紫 (0xb45cff)。
- [镜头 14 · 1:10–1:15]　**mouth_o** — 我做 O 嘴型，halo 变草绿 (0xa3e635)。
- [镜头 15 · 1:15–1:20]　**frown** — 我皱眉，halo 变红 (0xff5a5a)。
- [镜头 16 · 1:20–1:25]　**tongue_out** — 我吐舌，halo 变粉 (0xff8ab4)，🤪 emoji 飞出。

#### 3c · Mood-sync 触发 (1:25–1:32 · 7s)
- [镜头 17 · 1:25–1:30]　双方同时 `smile_big` ≥ 2 帧投票一致 → 中央爆出 💞 burst 动画（`triggerBurst('💞')` + `spawnFloater('💞', 16)`）。
- [镜头 18 · 1:30–1:32]　画面定格 1 秒 + 红圈框出 💞 burst。

#### 3d · 带宽对比 (1:32–1:35 · 3s)
- [镜头 19 · 1:32–1:35]　镜头 zoom in 到底部 bandwidth pill `~5.5 KB/s`，叠加大字 `Zoom 1500 KB/s · Veil 5.5 KB/s`。

### 旁白（按 5 sub-beat 分句）
> "Two browsers. Same room code. Different avatars. (pause)
> Watch — when I smile, both avatars smile. Surprise. Wink. Mouth-O. Frown. Tongue-out — eight discrete actions, all running locally.
> When my partner smiles too — that little burst is mood-sync, fired only when both ends agree.
> And the bandwidth — five point five kilobytes per second. **Two-hundred-seventy times less than Zoom.**"

### 屏上文字
- 0:48　`Two browsers · same room code · different avatars`
- 0:52　`← paired in <2s →`
- 0:55–1:25　每个动作切片浮一个标签：`smile_big · surprise · wink_L · wink_R · mouth_O · frown · tongue_out`
- 1:27　`mood-sync 💞 fired (both smile ≥ 2 votes · conf > 0.5)`
- 1:33　`Veil 232 B × 24 Hz = 5.5 KB/s · Zoom 1500 KB/s`

### 录制要点（*Build 10 分的核心*）
1. **必须真实双窗口实时配对**，不要后期合成。评分老师从画面流畅度看得出。
2. OBS 用 1 个 *Display Capture* 同时录 Chrome + Safari + 摄像头 PIP（200×200 右上角），观众能看到"左屏 avatar 跟着我的脸"的因果链。
3. 8 类动作按上面顺序彩排 3 take，挑表情**最干净 + halo 颜色最明显**那一条。
4. mood-sync 那一帧需要双人**同时 smile ≥ 0.4 s** — 真实情况下要重录几遍才对齐。
5. bandwidth pill 那一刻镜头 zoom in，后期用 Final Cut 加红圈 + 大数字 callout。

[截图 V-3：双浏览器并排 paired 状态] — 主缩略图。**你截**
[截图 V-4：8 类动作的 halo 调色板拼图] — 把 7 个 halo 颜色做成 1×7 色卡（neutral 灰 / wink紫 / smile橙 / surprise蓝 / frown红 / mouth_o绿 / tongue粉）。**你后期合成**
[截图 V-5：mood-sync 💞 触发瞬间] — 双屏 + 中央 💞 burst。**你截**
[截图 V-6：bandwidth pill 特写] — `~5.5 KB/s` 那一格放大。**你截**

---

## Beat 4 · TECHNICAL OVERVIEW  (1:35–2:30 · 55 秒) ★ Technical 10 分

### Sub-beat 4.1 — 数据 + 管线 (1:35–1:48 · 13s)
- [镜头 20]　切到 [图 2 数据管线图] 全屏，逐 stage 高亮：
  `Camera Frame → 468 Landmarks → 52 Blendshapes → 30-frame Window → 1D-CNN → 8-way softmax`。
  每 stage 高亮 ~2s，旁白同步描述。

旁白：
> "MediaPipe extracts 468 landmarks per frame, condensed to 52 ARKit blendshapes — the same expression vocabulary used by Animoji."

屏上文字：`468 → 52 in 22 ms · all on-device`

### Sub-beat 4.2 — 模型架构 (1:48–2:00 · 12s)
- [镜头 21]　切到 [图 3 1D-CNN 架构图]。逐层 reveal：
  `Conv1D(32,k=5) → BN → Conv1D(64,k=5) → BN → Conv1D(64,k=3) → BN → GAP → Dropout(0.3) → Dense(8, softmax)`。

旁白：
> "A small 1D-CNN — about thirty-two thousand parameters, three milliseconds per inference. Trained to recognise eight discrete actions."

屏上文字：
- 1:51　`1D-CNN · ~32K params · 8 classes`
- 1:56　`P50 inference: 2.8 ms · TF.js WebGL`

### Sub-beat 4.3 — 训练 + 结果 (2:00–2:14 · 14s)
- [镜头 22 · 2:00–2:07]　切到 `artifacts/training_history.png`（[图 4]），loss 收敛 + acc 上升动画。
- [镜头 23 · 2:07–2:14]　切到 `artifacts/confusion_matrix.png`（[图 5]）— 8×8 heatmap 对角线发亮。

旁白：
> "Four ablation runs. Final test accuracy: ninety-nine point oh-five percent, macro-F1 zero point nine-nine. (pause) But — on real strangers, only eighty-four. Generalisation is where it gets honest."

屏上文字：
- 2:03　`4 ablation runs · 99.05% test acc · macro-F1 0.99`
- 2:11　`wild-test on strangers: 84.2% — generalisation gap`

### Sub-beat 4.4 — 协议 + 多用户 (2:14–2:30 · 16s)
- [镜头 24 · 2:14–2:24]　切到 [图 1 三层架构图]。红虚线圈 "on-device" 区域 + 绿虚线圈 "穿网区域"。配合 Chrome DevTools → Network → WS 抓一帧二进制包，看到 **`233 bytes` binary frame**。
- [镜头 25 · 2:24–2:30]　屏幕回到 demo 双 avatar 实时画面。

旁白：
> "Each frame travels as 233 bytes — a header, a head-pose quaternion, and the 52 floats. No pixels ever leave the device."

屏上文字：
- 2:17　`Per-frame: 1B msgType + 1B actionIdx + 16B quat + 208B blendshapes = 232 B`
- 2:21　`+ 1B senderId @ relay = 233 B on the wire`
- 2:27　`Zero pixels uploaded — by design`

[截图 V-7：Chrome DevTools → Network → WS 那栏，看到一行 233 bytes 的 binary frame]
- **怎么截**：DevTools → Network → 筛选 WS → 选中 ws://localhost:8765 → Messages tab → 看到 `Binary Message · 233 B` 行。**你截**

### 录制要点
- 4 张图（数据管线 / 架构 / 训练曲线 / 混淆矩阵）**事先做好高分辨率 PNG**；Keynote magic-move 切换比直接平剪专业很多。
- 不要用整张 PowerPoint slide — 用全屏 PNG + 标注 overlay。
- 每个 sub-beat 旁白 ≤ 12 秒，留 ~2 秒给静默缓冲，不要塞满。

---

## Beat 5 · REFLECTION  (2:30–2:50 · 20 秒)

### 画面
- [镜头 26 · 2:30–2:40]　切到我本人（直视摄像头），背景：桌面 Mac + Arduino + 笔记本（暗示工程师姿态）。手势自然。
- [镜头 27 · 2:40–2:50]　切到一段 *frown 误判为 wink_left* 的实际错误样本（混淆矩阵第 6 行第 2 列那 1 个样本）— 屏幕叠红框 + `predicted: wink_left (0.51) · true: frown (0.47)` 文字。

### 旁白
> "Two honest limitations. One — my data split was per-window, not per-speaker, so 99.05% is on faces the model has seen. On strangers it falls to eighty-four. Two — the 52 blendshapes don't have a 'jaw clench' channel, so frown sometimes looks like a wink. Both fixable. Both real."

### 屏上文字
- 2:32　`Limit 1: not speaker-independent — wild acc 84.2%`
- 2:42　`Limit 2: 52-d ARKit has no 'jaw clench' channel`

### 录制要点
- 这 20s 是 Clarity 拿分点：**承认局限会加分**，不要吹。
- 时间紧可压到 15s，把 5s 给 Demo 或 CTA。

[截图 V-8：frown → wink_left 误判录屏静帧]
- **怎么截**：用 `?infer=1`（每帧推理）跑 demo，做 frown 表情，等到 confidence vector 显示 frown:0.47 / wink_left:0.51 那一瞬间，按 `Cmd+Shift+4`。需要彩排几次才能录到。

---

## Beat 6 · CTA / SIGN-OFF  (2:50–3:00 · 10 秒)

### 画面
- [镜头 28 · 2:50–2:58]　全屏 logo 动画 + 三行 CTA。
- [镜头 29 · 2:58–3:00]　暗场 + Veil 单字 logo 收尾。

### 屏上文字（大字）
```
Veil — be together, stay private
github.com/<user>/Veil
CASA0018 · UCL · 2025
```

### 旁白
> "Veil. Be together, stay private. Code's on GitHub."

---

# 录制 + 后期 Checklist

## 录制
- [ ] OBS 双场景：Scene A = 双浏览器 + 我脸 PIP；Scene B = 全屏 PPT/图。
- [ ] 1080p / 60fps / H.264 / AAC 48 kHz。
- [ ] **环境光从前打**（避免 MediaPipe 在我脸上掉点）。
- [ ] 麦克风 Mac 自带 + iPhone 备份（怕一台坏）。
- [ ] **先写好脚本逐字念一遍录旁白**，再录 demo，声画分轨。
- [ ] **Demo beat 至少录 3 take** — 挑配对最快、8 类动作识别最稳、mood-sync 最干净的那条。
- [ ] 8 类动作演示前对镜彩排 — 摄像头需要看到我整张脸 + 无强阴影。

## 后期（iMovie / Resolve / FCPX 任选）
- [ ] 每个 beat 的镜头放到对应轨道，先对时长再对内容。
- [ ] **加屏上文字**（lower-third + 大字 callout）— *没有屏字 Clarity 拿不到 8/10*。
- [ ] BGM 极轻（–25 dB），不要人声 / 歌词 / 强节拍 干扰旁白。
- [ ] 旁白录完用 Audacity 降噪 + compressor 让音量统一。
- [ ] 最后渲染前播一遍 **关声音**，看是否仅靠画面就能 follow story。
- [ ] 时长 ≤ 180 秒 严格遵守 — **超时直接扣 Clarity 分**。

## 上传
- [ ] YouTube unlisted 或 UCL OneDrive 共享链接。
- [ ] 视频描述：GitHub link + Veil 一句 tagline + CASA0018 标签。
- [ ] **GitHub README 嵌一个视频 thumbnail 链接** — Build 项 +1pt。

---

# 评分项映射（每个 beat 命中哪个评分点）

| Beat | 时长 | Clarity 10% | Technical 10% | Build 10% |
|---|---:|:---:|:---:|:---:|
| 1 Hook | 15s | ✓✓ | – | – |
| 2 Problem | 30s | ✓✓ | – | – |
| 3 **Demo** | 50s | ✓ | ✓ | **✓✓✓** |
| 4 **Technical** | 55s | ✓ | **✓✓✓** | ✓ |
| 5 Reflection | 20s | ✓✓ | ✓ | – |
| 6 CTA | 10s | ✓ | – | – |

如果时间紧只能砍 1 个 beat：**保留 3 + 4，牺牲 2** — 视频开头多 5 秒 hook 直接进 demo。

---

# 一句话录制顺序建议

> 先把 **Beat 3 Demo** 录通顺（双浏览器配对 + 8 类动作 + mood-sync 三件事），其它 beat 都好补；Demo 砸了整支视频废一半分。

---

# 演示前的 sanity check（录 demo 前 5 分钟跑一遍）

```bash
# 1) 启 relay
node relay_server/server_rooms.js
# 2) 启静态服务
npx http-server -p 8080
# 3) Chrome 打开
open -a "Google Chrome" "http://localhost:8080/mobile_avatar.html?local=1"
# 4) Safari 打开（同样）
open -a Safari "http://localhost:8080/mobile_avatar.html?local=1"
# 5) DevTools → Network → WS 看到 `~5.5 KB/s` outgoing 才说明 OK
```

如果顶部 pill 卡在 `waiting` 超过 5 秒：
- 检查 8765 端口是否被占（`lsof -iTCP:8765 -sTCP:LISTEN`）
- 检查浏览器控制台有没有红色 error（带 `?debug=1` 跑可以看 verbose log）
- 二次元 V-1 加载慢是正常的（15 MB），第一次缓冲后浏览器会缓存
