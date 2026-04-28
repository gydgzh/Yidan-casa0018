# 动作类语义定义

每一类对应录数据时要做的脸部动作。**录数据时按这个顺序，每类录 ~10 段、每段 1 秒**。

| Index | label | 怎么做（录数据指引） | 关键 blendshape |
|---|---|---|---|
| 0 | `neutral` | 放松，正常呼吸看镜头 | 全部 < 0.1 |
| 1 | `wink_left` | 闭左眼，右眼睁开 | `eyeBlinkLeft` ≥ 0.7 且 `eyeBlinkRight` ≤ 0.2 |
| 2 | `wink_right` | 闭右眼，左眼睁开 | `eyeBlinkRight` ≥ 0.7 且 `eyeBlinkLeft` ≤ 0.2 |
| 3 | `smile_big` | 用力笑，露牙 | `mouthSmileLeft` + `mouthSmileRight` ≥ 1.2 |
| 4 | `surprise` | 眉毛挑高 + 眼睛睁大 + 嘴张 O | `browInnerUp` ≥ 0.5, `eyeWideLeft+Right` ≥ 0.6, `jawOpen` ≥ 0.3 |
| 5 | `frown` | 撇嘴 + 皱眉 | `mouthFrownLeft+Right` ≥ 0.6, `browDownLeft+Right` ≥ 0.5 |
| 6 | `mouth_o` | 嘴噘成 O 形（说"哦"） | `mouthFunnel` ≥ 0.5 或 `mouthPucker` ≥ 0.6 |
| 7 | `tongue_out` | 吐舌头 | `tongueOut` ≥ 0.6 |

## 动画映射（在 `web_avatar/src/animations.js` 实现）

| label | 视觉效果 |
|---|---|
| `neutral` | 不触发 |
| `wink_left` | 左眼上方蓝色 ✨ 粒子（300ms） |
| `wink_right` | 右眼上方蓝色 ✨ 粒子（300ms） |
| `smile_big` | 头顶心形粒子上飘（800ms） |
| `surprise` | 头顶弹出 ❓ 文字 sprite（500ms） |
| `frown` | 头顶滴落 💧 雨滴（500ms） |
| `mouth_o` | 嘴前同心圆声波 ⌒（持续，停止动作就消失） |
| `tongue_out` | 头顶 "😜" 文字 sprite（800ms） |

## 录数据预算

8 类 × 10 段 × 1 秒 = **80 秒原始数据**，加上准备/休息约 5 分钟即可。
30Hz × 80 秒 = 2400 帧；按 30 帧窗口 + stride 10 滑窗 → 约 240 个训练样本，够小模型起步。
建议每个 subject 录 1 次，3 个不同人录一下能涨鲁棒性 & 报告里写 cross-subject 评测。
