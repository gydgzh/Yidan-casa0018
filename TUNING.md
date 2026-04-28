# 灵敏度 + 转头修复 — 给本地 AI 的执行 + 调参指南

## 这次改了什么（不需要重训练）
1. **每个 blendshape 加了 gain（增益）**，默认 1.6×，关键表情（张嘴/笑/挑眉/吐舌）加到 2.0–2.5×。MediaPipe 输出本来就保守，amplify 后表情立刻夸张、灵敏。
2. **加了指数平滑**，避免抖动同时保留响应速度（默认 SMOOTH=0.35）。
3. **重写头骨查找**：先精确匹配 `Head` / `mixamorigHead`，找不到再 fuzzy。同时 HUD 会日志告诉你头骨叫啥名（或者 NONE）。
4. **加了头部旋转坐标轴翻转选项**，万一方向反了用 URL 参数一键翻。
5. **代理头 fallback 也接上了头部旋转**——以前就漏了这段。

## 步骤 1：push 新版到仓库
```bash
SRC="$HOME/Library/Application Support/Claude/local-agent-mode-sessions"
SRC="$(find "$SRC" -name TUNING.md -print -quit | xargs dirname)"

cd ~/Yidan-casa0018
cp "$SRC/mobile_avatar.html" .
cp "$SRC/TUNING.md" .

git add mobile_avatar.html TUNING.md
git commit -m "tuning: gain + smoothing + head rotation fix (URL-tunable)"
git push
```

GitHub Pages 30-60 秒后生效。

## 步骤 2：先用 debug URL 看头骨找到没

```
https://gydgzh.github.io/Yidan-casa0018/mobile_avatar.html?debug=1
```

允许摄像头后看屏左下"日志"按钮里那行：
```
avatar OK · brunette.glb · morphs=N · bones=NN · head=mixamorigHead
```
- `head=mixamorigHead` 或类似带 "Head" 的字 = 找到了 ✅
- `head=NONE` = 没找到，看下面"头骨没找到"那节

## 步骤 3：转头有没有反应？

刷新页面，故意慢慢左右转头。

### 情况 A：头跟着转，方向对 ✅
完成。直接进步骤 4 调灵敏度。

### 情况 B：头跟着转，但方向反了
你向右转，它向左转 → URL 加 `?headflip=y`：
```
https://gydgzh.github.io/Yidan-casa0018/mobile_avatar.html?headflip=y
```
还是错就试 `?headflip=xy`、`?headflip=xyz` 排列组合。找到对的之后，让本地 AI 把这个值写进默认：编辑 `mobile_avatar.html` 找到 `Q.get('headflip') || ''` 改成 `Q.get('headflip') || 'y'`（举例）。

### 情况 C：完全不转
HUD 日志看到 `head=NONE` → 头骨没找到。这是 GLB 内部命名问题。让本地 AI 跑：
```bash
# 在 Mac Chrome devtools console 里粘这段：
const loader = new (await import('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js')).GLTFLoader();
loader.load('https://gydgzh.github.io/Yidan-casa0018/models/avatar.glb', g => {
  const bones = []; g.scene.traverse(o => o.isBone && bones.push(o.name));
  console.log(JSON.stringify(bones, null, 2));
});
```
把列出来的 bone 名截图发我，我再改 regex 适配。

## 步骤 4：调灵敏度（不刷新代码，纯 URL）

| URL 参数 | 含义 | 默认 | 推荐范围 |
|---|---|---|---|
| `gain=1.6` | 全局表情增益 | 1.6 | 1.0–2.5 |
| `smooth=0.35` | 平滑系数 | 0.35 | 0.0–0.6 |
| `headlerp=0.45` | 头部跟随速度 | 0.45 | 0.2–0.8 |
| `headflip=y` | 头部轴翻转 | 无 | x/y/z 任意组合 |

### 三档预设给你直接试

**A · 戏剧化（夸张表情，演示用）**
```
https://gydgzh.github.io/Yidan-casa0018/mobile_avatar.html?gain=2.2&smooth=0.2&headlerp=0.6
```

**B · 自然（默认平衡）**
```
https://gydgzh.github.io/Yidan-casa0018/mobile_avatar.html
```

**C · 稳重（适合长时间录视频）**
```
https://gydgzh.github.io/Yidan-casa0018/mobile_avatar.html?gain=1.3&smooth=0.5&headlerp=0.3
```

挑一个最舒服的之后，让本地 AI 把这组数字写成默认（在 `mobile_avatar.html` 里改 `parseFloat(Q.get('gain')) || 1.6` 那几行的兜底值）。

## 步骤 5：还嫌不灵敏？

不用训练，先做下面这些：

### 5.1 调高单个 blendshape 的 gain
编辑 `mobile_avatar.html` 里 `GAIN_OVERRIDE` 表，比如让笑容更夸张：
```js
const GAIN_OVERRIDE = {
  jawOpen: 2.5,           // 张嘴更明显
  mouthSmileLeft: 2.5,    // 笑得更夸张
  mouthSmileRight: 2.5,
  eyeBlinkLeft: 1.6,      // 眨眼更猛
  eyeBlinkRight: 1.6,
  // ... 加你想增强的
};
```

### 5.2 把 SMOOTH 调到 0
URL `?smooth=0` → 完全不平滑，每帧直接跟随 MediaPipe 输出。会更"灵敏"但可能轻微抖动。

### 5.3 距离 + 光线
- 脸离手机 30–50cm 最佳，太远 MediaPipe 会输出弱
- 正面光，避免逆光（逆光时 landmarker 容易抓不准嘴角眉毛）
- 摘眼镜会更灵敏（眼镜会遮挡 eyeBlink 检测）

## 关于"通过训练能不能解决"

**短答：不需要。**

长答：MediaPipe 的 blendshape 模型已经是预训练好的，重训成本极高（需要带 ARKit-truth 标注的大规模面部视频数据集，没有公开可用的）。"灵敏度不够"99% 是 mapping 问题（gain），不是 detection 问题（model）。所以 gain + smoothing 才是正解。

**如果你坚持要训**，可以做的是：
- 训一个 **calibration 网络**：输入 MediaPipe 52 维 → 输出 ARKit-truth 52 维。用一段你自己的 ARKit App 数据（你之前 iOS 那个 app 不就在送 ARKit blendshape 吗？）+ 同时录 MediaPipe 输出的对偶数据，做 52→52 回归。
- 这能把 MediaPipe 的"保守输出"映射到 ARKit 的"夸张输出"，比手调 gain 准确多了。
- 但这是论文级工作量，CASA0018 课程里 gain 调好就完全够分。

我不推荐这条路，把时间花在 8 类动作识别 + 真实 RAVDESS 数据 + 报告写作上更值。

## 最终验证（成功的样子）
1. 顶部**没有**橙色 TEST MODE 横幅
2. HUD 全绿，fps 25-30
3. 慢慢转头：avatar 头同步转
4. 张大嘴：avatar 嘴明显张大（不再是微张）
5. 大笑：avatar 嘴角上翘明显
6. 挑眉：avatar 眉毛明显抬高
7. 做夸张表情连续 1 秒：触发屏幕中央 emoji + 周围粒子
