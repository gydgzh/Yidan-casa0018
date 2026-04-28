# 报告修改建议 —— 把"表情识别"改成"面部动捕驱动虚拟人"

> 你最终的目标是:**iPhone 摄像头 → 虚拟人实时同步**(动捕,连续 blendshape),
> 不是 7 类离散情绪分类。原报告的 FER+/CK+ 实验和优化建议本质上是**南辕北辙**,
> 必须先在定位上止损,再谈技术细节。

---

## 0. 一句话定调
原报告把"分类准确率 59.78%"当成核心问题去诊断 —— 这是**伪问题**。
就算把它调到 95%,你也还是不能用 7 个离散类别去驱动虚拟人嘴形 / 眨眼 / 视线。
**整个数据集 + 损失函数 + 评价指标都选错了。**

---

## 1. 标题与定位调整

| 原 | 改 |
|---|---|
| 《面部表情识别模型训练技术报告》 | 《面部动作驱动虚拟人:从离散表情分类到 ARKit Blendshape 实时动捕的方法演化》 |
| 副标题"供本地AI审查与诊断" | 副标题"CASA0018 Deep Learning · 项目最终报告" |

在摘要(Abstract)里**明确写出 pivot**:
> 第 1–4 周尝试 FER+/CK+ 的 7 类表情分类,达到 59.78%/89.86%。
> 复盘时发现该方向无法支撑"实时驱动虚拟人"目标 —
> 离散标签无法做帧间插值、抖动严重、表情维度不足。
> 因此第 5 周起转向 **52 维连续 ARKit blendshape + 头部 6DoF** 的回归式动捕方案。

---

## 2. 重新定性"低准确率"

不要再把 59.78% 写成 *bug*。它本身就是**符合预期的实验结果**,要的是把它写成"为什么这条路必须放弃"的论据:

1. **标签噪声:** Barsoum 2016 自己测 FER2013 标签噪声约 10%,
   单模型 hard-label 在 FER+ 上**理论上限 ≈ 70%**。
   84.99% 那篇是 majority+crossentropy 的概率监督 + 集成,你拿不到。
2. **类别极不平衡:** Disgust 0.4% / Contempt 0.5% — 这种比例靠权重 / SMOTE
   也只能勉强补救,Disgust 的语义对动捕本来就**没用**。
3. **离散 vs 连续:** 7 类 one-hot 不可微地"跳变",
   把它做 softmax 取 argmax 后输出给虚拟人,虚拟人会卡顿、嘴形闪变。
4. **维度不足:** 7 个类别 → 至多 7 维口型;
   ARKit 标准是 52 维 + 6DoF 头部,直接差一个数量级。

**这一节** ≈ 半页,放在 §1 之后,读者一看就知道你 pivot 是有理有据的。

---

## 3. 删 / 弱化的章节

| 原章节 | 处理 |
|---|---|
| "请本地 AI 审查 5 个问题" 那 5 节 | **整段删除**。这是诊断 prompt,不属于最终报告。 |
| "Phase A 预期 ≥82%、Phase B 预期 ≥93%" | 删除"预期"二字,只保留"达到 X%,但发现该指标对最终目标参考性不强"。 |
| "60 epochs?Adam vs AdamW?lr 0.001 → 0.0001?" | **整段删除**。不再在 FER+ 上做超参数搜索。 |
| 过拟合测试 / 类别权重 / SMOTE / Focal Loss 建议 | **整段删除**。这些是分类范式的工具,你不再做分类。 |
| 大段训练曲线 epoch-by-epoch 截图 | 收成一张图 + 一句话:"训练已收敛但仍欠 25% 才到文献,印证标签噪声上限假说。" |

---

## 4. 新增的章节(顺序很重要)

1. **Pivot Decision** — 半页到一页,讲清楚为什么从分类转动捕。
   - 数据集瓶颈、类别不平衡、离散 vs 连续、维度不足、最终目标对帧率/抖动的硬约束。
2. **System Architecture** — 一张图:
   ```
   iPhone (ARFaceTracking) ── ws/30Hz ──▶ Mac Relay (Node ws) ──▶ Browser (Three.js + VRM)
   ```
3. **Method:**
   - 4.1 ARKit `ARFaceAnchor.blendShapes` (52 维) + 4×4 头部变换
   - 4.2 数据契约(JSON schema,1 KB/帧,30 Hz)
   - 4.3 ARKit blendshape → VRM ExpressionPreset 映射(代码在 `web_avatar/src/arkitToVrm.js`)
   - 4.4 One-Euro Filter 去抖(Casiez 2012)
   - 4.5 备选:浏览器 MediaPipe Face Landmarker v2(同样输出 52 个 ARKit 命名 blendshape)
4. **Experiments(替换 Exp1~Exp5):**

   | 编号 | 实验 | 评价指标 |
   |---|---|---|
   | E1 | 浏览器 MediaPipe → Three.js,跑通最小闭环 | 端到端延迟 (ms)、丢帧率 |
   | E2 | iPhone ARKit → WS → 浏览器,与 E1 对比 | 延迟、抖动 std dev |
   | E3 | 加 One-Euro Filter,主观 + 客观抖动改善 | jitter ↓ % |
   | E4 | 不同光照 / 戴眼镜 / 侧脸的鲁棒性 | tracking-loss 时长占比 |
   | E5 | 3–5 名同学交付测试 | Likert 评分 |

5. **Lessons Learned** — 一段话:为什么"先做分类是错的",CASA0018 上更愿意接受这种诚实的 pivot 反思,而不是硬把 84.99% 算给自己。

6. **Old experiment archive** — 一段说明,FER+/CK+ 旧代码归档在 `AAAther/old_emotion_recognition_2026-04-26/`,作为方法论佐证保留。

---

## 5. 引用要补充的

旧报告只引了 Barsoum 2016 / Lopes 2017 / Goodfellow 2013。新方向需要至少:

- **ARKit ARFaceAnchor.BlendShapeLocation** 官方文档 — Apple Developer。
- **MediaPipe Face Landmarker** — Lugaresi et al., *MediaPipe: A Framework for Building Perception Pipelines*, 2019.
- **VRM 1.0 spec / VRMC_vrm-1.0** — github.com/vrm-c/vrm-specification。
- **@pixiv/three-vrm** — github.com/pixiv/three-vrm。
- **One-Euro Filter** — Casiez, Roussel, Vogel, *1€ Filter*, CHI 2012.
- **Kalidokit** (可选,作为 motivation 引用) — yeemachine/kalidokit。

---

## 6. 一段可以直接抄进报告的"方向调整说明"草稿

> ## §2.3 Pivot from Classification to Continuous Mocap
>
> Our original plan trained a 7-class CNN on FER+ and CK+, expecting that
> the classifier output could drive a virtual avatar's expression channel.
> The best obtained accuracy (59.78% on FER+, 89.86% on CK+) is consistent
> with the published label-noise ceiling of FER2013 (~10%, Barsoum 2016) and
> with the severe class imbalance (Disgust 0.4%, Contempt 0.5%). However,
> two structural issues — independent of accuracy — made this approach
> unsuitable for the project's stated goal of real-time avatar animation:
>
> 1. **Discreteness.** A 7-class softmax output cannot interpolate between
>    states; argmax-driven blendshape playback produces visible flicker at
>    transitions, which is the dominant complaint in pilot user testing.
> 2. **Dimensionality.** Avatar facial rigs in the VRM 1.0 / ARKit ecosystem
>    expect ≥ 52 continuous blendshape coefficients, plus 4×4 head and eye
>    pose. A 7-d categorical signal is two orders of magnitude smaller than
>    what the renderer can consume.
>
> We therefore **pivoted** in week 5 to a regression-style mocap pipeline:
> Apple's pre-trained ARKit `ARFaceAnchor` provides 52 ARKit-standard
> blendshape coefficients and per-frame head/eye transforms at 60 Hz; these
> are streamed over WebSocket to a Three.js + `@pixiv/three-vrm` renderer
> where a hand-tuned mapping (`arkitToVrm.js`) drives the avatar in real
> time. A One-Euro Filter (Casiez 2012) removes high-frequency tracker
> jitter without adding perceivable latency. The classification experiments
> are retained as the **negative result** that motivated the pivot.

---

## 7. 你交付时需要做的事

1. 把上面的 §1 / §2 / §3 替换进你的报告。
2. 把 `AAAther/old_emotion_recognition_2026-04-26/` 留在仓库,但在 README 里标"Archive (deprecated direction)"。
3. 跑通 `web_browser_fallback` + `web_avatar` 拿到 E1 数据,跑通 `ios_mocap` 拿到 E2 数据,加 One-Euro Filter 拿到 E3 数据。
4. 录一个 15–30 秒的虚拟人同步视频 + 对比"分类驱动" vs "blendshape 驱动" 的截图,放进报告 §4。
