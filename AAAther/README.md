# AAAther — Archive

这个目录是**已废弃方向**的归档区，里面的东西不参与构建，你随时可以删。

## LOCAL_AGENT_RUN_PLAN_CN_v1_backup.md

旧版执行手册（pivot 之前那一稿，没有 §9 动作识别训练这一节）。
v2 版（当前生效的）在 `docs/LOCAL_AGENT_RUN_PLAN_CN.md`。
保留 v1 仅作为变更历史参考，可删。

## old_emotion_recognition_2026-04-26/
原计划是用 FER+/CK+ 数据集训练 7 类 CNN 分类器,然后用 argmax 输出去切换虚拟人表情。
2026-04-26 复盘后发现该方向无法满足"实时连续动捕"目标(详见
[`../docs/REPORT_REVIEW_CN.md`](../docs/REPORT_REVIEW_CN.md) §2),正式 pivot 到 ARKit / MediaPipe blendshape 方案。

如果你之前在桌面 / Downloads 里有以下东西,请把它们 `mv` 到这个子目录下:
- FER2013 / FER+ / CK+ 原始数据
- 训练 checkpoint (.h5 / .pb)
- 旧的 ExpressionMirror Core ML iOS 工程
- 旧报告 draft .md
- 训练日志 / TensorBoard 记录

保留这些是为了在最终报告里展示"为什么旧方向行不通"的对比证据,**不再投入新工时**。
