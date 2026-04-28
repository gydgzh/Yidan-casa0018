# 本地 AI 执行方案(可复制粘贴)

> 给本地 AI 看的:**不要再训表情分类模型**,改做"ARKit / MediaPipe → 虚拟人动捕"。
> 训练?**几乎没有训练**。所有重活都用预训练好的 Apple ARKit + Google MediaPipe,
> 我们要做的是**集成 + 实时管线 + 调参 + 评测**。
> 全部代码已经在 DLLLL1 仓库里(本文档同级目录)。

## 0. 仓库总览
```
DLLLL1/
├── ios_mocap/                # iOS Swift 端(ARKit → WebSocket)
│   └── FaceMocap/
│       ├── FaceMocapApp.swift
│       ├── ContentView.swift
│       ├── FaceMocapSession.swift
│       └── Info.plist.snippet
├── relay_server/             # Node.js WebSocket 转发
│   ├── package.json
│   └── server.js
├── web_avatar/               # Three.js + @pixiv/three-vrm 渲染端 (主)
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/{main.js, arkitToVrm.js, oneEuroFilter.js}
├── web_browser_fallback/     # 没有 iPhone 时的备选(MediaPipe in browser)
│   └── index.html
├── scripts/
│   └── download_assets.sh    # 下虚拟人 .vrm 和 MediaPipe 模型
├── docs/
│   ├── REPORT_REVIEW_CN.md   # 旧报告修改建议
│   └── LOCAL_AGENT_RUN_PLAN_CN.md  ← 本文件
└── AAAther/                  # 旧表情识别相关将归档于此(可手动移)
```

## 1. 一次性环境准备(Mac 上跑)
```bash
# Node.js ≥ 18(已装就跳过)
node -v || brew install node

# 关键资源:虚拟人 + MediaPipe 模型
cd /Users/yimisheng/Desktop/AAAucl-2025/T2_1_ucl/casa0018DeepLearning/DLLLL1
bash scripts/download_assets.sh
# 成功后会看到:
#   web_avatar/public/models/avatar.vrm                (~14MB,fem_vroid 或 masc_vroid)
#   web_browser_fallback/public/face_landmarker.task   (~3MB)
```

> **数据集说明:** 这条新路线**不需要训练数据集**。
> 用到的资源全部公开合法可见:
> - `madjin/vrm-samples` (GitHub,VRoid 官方导出样例)
> - Google MediaPipe `face_landmarker.task` (Apache-2.0,Google AI Edge 官方 CDN)
> - Apple ARKit (操作系统 API,使用合法)
>
> 如果你之前希望用"数据集训练动捕模型",请记住 — 业界标准是
> **复用预训练模型**(ARKit/MediaPipe),而不是自己重练。
> 自己练需要 4D scan rig(几十万美元)或 LRS3 / VOCASET(只有口型)。

## 2. 阶段 A:浏览器 fallback 跑通最小闭环(15 分钟,优先做这步)
**目的:** 不依赖 iPhone,先验证 *渲染管线 + WebSocket + VRM 表情驱动* 全部对。

```bash
# 终端 1:relay
cd DLLLL1/relay_server && npm install && npm start

# 终端 2:web avatar 渲染端
cd DLLLL1/web_avatar && npm install && npm run dev
# → 浏览器打开 http://localhost:5173,应能看到虚拟人静止站立。

# 终端 3:browser fallback(MediaPipe 当 sender)
cd DLLLL1/web_browser_fallback
npx --yes serve -l 8000
# → 另开浏览器 http://localhost:8000,点 "Start camera + MediaPipe"
```
**预期:** 5173 那一页虚拟人开始跟着摄像头里的脸说话、眨眼、转头。

**E1 实验数据采集:**
- 浏览器开发者工具 → Network → 看 ws 帧率应稳定 25–30 Hz。
- HUD 显示 `blendshapes:52` 才算正常。
- 录一段 30 秒视频(同时录摄像头预览 + 虚拟人窗口),用作报告 §4 E1。

## 3. 阶段 B:iPhone ARKit 替换 sender(主路径)
1. 用 Xcode 新建 iOS App(SwiftUI / Swift 5),工程名 FaceMocap。
2. 把 `ios_mocap/FaceMocap/*.swift` 三个文件**替换/添加**到工程 target。
3. 打开 `Info.plist`,把 `Info.plist.snippet` 里的 4 个 key 加进去。
4. 在 `FaceMocapApp.swift` 顶部把 `kRelayURL` 的 IP 改成 Mac 的 LAN IP:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   # 看到类似 192.168.1.123/24,就用这个
   ```
5. 用 USB 连 iPhone,Xcode → Run 到真机(iPhone X 或更新)。
6. App 启动时:relay 控制台应打印 `senders=1`,
   原来跑着的 `web_avatar` 直接切换为 ARKit 数据,虚拟人精度立刻上升。

**E2 实验数据采集:** 同 E1 录一段同样动作的视频,与 E1 对比延迟和抖动。

## 4. 阶段 C:加 One-Euro Filter(已经在代码里)
- HUD 顶部有"One-Euro 平滑"复选框,默认开。
- 切换 on/off 各录 10 秒,统计 `eyeBlinkLeft` / `jawOpen` 这种通道的方差变化。
- 这就是 E3。

## 5. 阶段 D:鲁棒性 + 用户测试(可选,加分项)
- E4:换光照(白光 / 暖光 / 暗光)、戴眼镜、侧脸,记 `tracking-loss` 时间占比。
- E5:3–5 个同学试,Likert 1–5 评分"虚拟人是否像我"。

## 6. 旧的表情识别工程怎么办
报告评审需要,但**不再投入工时**。两种做法:
1. **保留并归档**(推荐):全部移进 `AAAther/old_emotion_recognition_2026-04-26/`,
   README 标注 "Deprecated direction; kept for methodology comparison."
2. **删除**:从 git 里 `rm -rf` 掉,只在 commit message 里说一句 pivot 原因。

如果你之前在 `~/Desktop/...` 里有 FER+/CK+ 的下载文件、训练 ckpt、等等,
直接 `mv` 到 `AAAther/old_emotion_recognition_2026-04-26/data/` 即可,
本仓库已经替你建好这个空目录。

## 7. 给本地 AI 的硬要求(避免你又跑偏)
- ❌ **不要**再开 TensorFlow / PyTorch 训练。
- ❌ **不要**去优化 FER+ 准确率。
- ❌ **不要**自己训新的 blendshape 回归模型 — Apple 和 Google 的开源 / 系统 API
       已经在大规模数据上训好。
- ✅ **要**做的是:跑通 §2、§3、§4 的实验,采集延迟 / 抖动 / 用户评分数据,
       把 §5 的鲁棒性测试做掉。
- ✅ 如果某一步报错,先看 `relay_server` 的控制台和浏览器 console,
       80% 的问题是 WebSocket IP 没改、虚拟人 .vrm 没下载、或者 iOS Local Network 权限没给。

## 8. 最低交付清单(对应 CASA0018 项目报告)
- [ ] 录屏:浏览器 MediaPipe 驱动虚拟人(15–30 秒)。
- [ ] 录屏:iPhone ARKit 驱动同一虚拟人(15–30 秒)。
- [ ] 数据:E1 vs E2 端到端延迟柱状图(均值 + 标准差)。
- [ ] 数据:开/关 One-Euro 的抖动方差对比(E3)。
- [ ] 修订后的报告(按 `REPORT_REVIEW_CN.md` 改完)。
- [ ] GitHub 仓库链接,完整可复现。
