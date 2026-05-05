// 把 ARKit 的 52 个 blendshape 名映射到 @pixiv/three-vrm 的 ExpressionPreset / 自定义表情。
//
// 思路:
//  - VRM 0.x / 1.0 标配只有少量 preset(happy / sad / angry / blink / aa / ih / ou / ee / oh / blinkL / blinkR / lookUp / lookDown / lookLeft / lookRight)。
//  - 直接逐个对齐 52 个 ARKit 名是不现实的(VRM 不一定全都有)。
//  - 实战上我们映射"重要的 + 视觉上最显著的"那一组,其余忽略。视觉差距很小但代码可读性高。
//
// 参考:
//   - VRM 1.0 Expressions: https://github.com/vrm-c/vrm-specification/tree/master/specification/VRMC_vrm-1.0
//   - three-vrm VRMExpressionPresetName 枚举
//
// 如果 VRM 的 expressionManager 上某个 preset 不存在,setValue 会被 three-vrm 静默忽略,所以安全。

export const ARKIT_KEYS = [
  // upper face
  "browDownLeft","browDownRight","browInnerUp","browOuterUpLeft","browOuterUpRight",
  "eyeBlinkLeft","eyeBlinkRight","eyeLookDownLeft","eyeLookDownRight",
  "eyeLookInLeft","eyeLookInRight","eyeLookOutLeft","eyeLookOutRight",
  "eyeLookUpLeft","eyeLookUpRight","eyeSquintLeft","eyeSquintRight",
  "eyeWideLeft","eyeWideRight",
  // mid face
  "cheekPuff","cheekSquintLeft","cheekSquintRight","noseSneerLeft","noseSneerRight",
  // mouth + jaw
  "jawForward","jawLeft","jawOpen","jawRight",
  "mouthClose","mouthDimpleLeft","mouthDimpleRight","mouthFrownLeft","mouthFrownRight",
  "mouthFunnel","mouthLeft","mouthLowerDownLeft","mouthLowerDownRight",
  "mouthPressLeft","mouthPressRight","mouthPucker","mouthRight",
  "mouthRollLower","mouthRollUpper","mouthShrugLower","mouthShrugUpper",
  "mouthSmileLeft","mouthSmileRight","mouthStretchLeft","mouthStretchRight",
  "mouthUpperUpLeft","mouthUpperUpRight",
  // tongue (ARKit 52nd)
  "tongueOut"
];

/**
 * 把 ARKit blendshapes 字典翻译成一组 VRM expressionManager.setValue 调用。
 * @param {VRM} vrm
 * @param {Record<string, number>} bs  ARKit 名 → [0,1]
 */
export function applyArkitToVRM(vrm, bs) {
  const em = vrm.expressionManager;
  if (!em) return;

  // ---- 嘴形 (viseme) ----
  // jawOpen 同时驱动 "aa";puckered 驱动 "ou";stretched 驱动 "ih"。
  const jawOpen   = bs.jawOpen      ?? 0;
  const pucker    = bs.mouthPucker  ?? 0;
  const funnel    = bs.mouthFunnel  ?? 0;
  const smileL    = bs.mouthSmileLeft  ?? 0;
  const smileR    = bs.mouthSmileRight ?? 0;
  const frownL    = bs.mouthFrownLeft  ?? 0;
  const frownR    = bs.mouthFrownRight ?? 0;
  const stretchL  = bs.mouthStretchLeft  ?? 0;
  const stretchR  = bs.mouthStretchRight ?? 0;
  const upperUpL  = bs.mouthUpperUpLeft  ?? 0;
  const upperUpR  = bs.mouthUpperUpRight ?? 0;

  em.setValue("aa",  clamp(jawOpen * 1.2));
  em.setValue("oh",  clamp(funnel * 1.0));
  em.setValue("ou",  clamp(pucker * 1.0));
  em.setValue("ih",  clamp(((stretchL + stretchR) * 0.5) * 1.0));
  em.setValue("ee",  clamp(((smileL + smileR) * 0.5) * 0.6));

  // ---- 眨眼 ----
  em.setValue("blinkLeft",  clamp(bs.eyeBlinkLeft  ?? 0));
  em.setValue("blinkRight", clamp(bs.eyeBlinkRight ?? 0));

  // ---- 视线(VRM lookAt 也可以,但用 expression 更稳) ----
  const lookUp    = avg(bs.eyeLookUpLeft,    bs.eyeLookUpRight);
  const lookDown  = avg(bs.eyeLookDownLeft,  bs.eyeLookDownRight);
  const lookLeft  = avg(bs.eyeLookOutLeft,   bs.eyeLookInRight);   // 注意 in/out 的左右镜像
  const lookRight = avg(bs.eyeLookInLeft,    bs.eyeLookOutRight);
  em.setValue("lookUp",    clamp(lookUp));
  em.setValue("lookDown",  clamp(lookDown));
  em.setValue("lookLeft",  clamp(lookLeft));
  em.setValue("lookRight", clamp(lookRight));

  // ---- 情绪 ----
  // happy = 微笑 - 皱眉
  // sad   = 皱眉 + 眉内挑
  // angry = browDown + noseSneer
  // surprised = browInnerUp + eyeWide
  const happy = clamp((smileL + smileR) * 0.5 - (frownL + frownR) * 0.4);
  const sad   = clamp((frownL + frownR) * 0.5 + (bs.browInnerUp ?? 0) * 0.4);
  const angry = clamp(((bs.browDownLeft ?? 0) + (bs.browDownRight ?? 0)) * 0.5
                    + ((bs.noseSneerLeft ?? 0) + (bs.noseSneerRight ?? 0)) * 0.3);
  const surprised = clamp((bs.browInnerUp ?? 0) * 0.7
                        + ((bs.eyeWideLeft ?? 0) + (bs.eyeWideRight ?? 0)) * 0.5);

  em.setValue("happy",     happy);
  em.setValue("sad",       sad);
  em.setValue("angry",     angry);
  em.setValue("surprised", surprised);
  // VRM 1.0 spec 用 "Surprised";three-vrm 兼容大小写,两个都试一下。
  em.setValue("relaxed",   1 - Math.max(happy, sad, angry, surprised));

  em.update?.();
}

function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
function avg(a = 0, b = 0) { return ((a || 0) + (b || 0)) * 0.5; }
