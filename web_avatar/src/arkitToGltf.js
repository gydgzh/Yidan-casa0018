// arkitToGltf.js
// 将 ARKit 52 维 blendshape 映射到 GLB/GLTF morphTargetInfluences
// 用于 Ready Player Me 等非 VRM 模型

// ARKit 52 个 blendshape 名称（标准顺序）
export const ARKIT_KEYS = [
  "eyeBlinkLeft", "eyeLookDownLeft", "eyeLookInLeft", "eyeLookOutLeft", "eyeLookUpLeft",
  "eyeSquintLeft", "eyeWideLeft", "eyeBlinkRight", "eyeLookDownRight", "eyeLookInRight",
  "eyeLookOutRight", "eyeLookUpRight", "eyeSquintRight", "eyeWideRight", "jawForward",
  "jawLeft", "jawRight", "jawOpen", "mouthClose", "mouthFunnel", "mouthPucker",
  "mouthLeft", "mouthRight", "mouthSmileLeft", "mouthSmileRight", "mouthFrownLeft",
  "mouthFrownRight", "mouthDimpleLeft", "mouthDimpleRight", "mouthStretchLeft",
  "mouthStretchRight", "mouthRollLower", "mouthRollUpper", "mouthShrugLower",
  "mouthShrugUpper", "mouthPressLeft", "mouthPressRight", "mouthLowerDownLeft",
  "mouthLowerDownRight", "mouthUpperUpLeft", "mouthUpperUpRight", "browDownLeft",
  "browDownRight", "browInnerUp", "browOuterUpLeft", "browOuterUpRight", "cheekPuff",
  "cheekSquintLeft", "cheekSquintRight", "noseSneerLeft", "noseSneerRight", "tongueOut"
];

// RPM (Ready Player Me) morph target 名称映射
// RPM 使用 ARKit 兼容命名，但可能需要微调
const RPM_BLENDSHAPE_MAP = {
  // 直接映射（名称相同）
  "eyeBlinkLeft": "EyeBlinkLeft",
  "eyeBlinkRight": "EyeBlinkRight",
  "eyeWideLeft": "EyeWideLeft",
  "eyeWideRight": "EyeWideRight",
  "jawOpen": "JawOpen",
  "jawForward": "JawForward",
  "jawLeft": "JawLeft",
  "jawRight": "JawRight",
  "mouthClose": "MouthClose",
  "mouthFunnel": "MouthFunnel",
  "mouthPucker": "MouthPucker",
  "mouthLeft": "MouthLeft",
  "mouthRight": "MouthRight",
  "mouthSmileLeft": "MouthSmileLeft",
  "mouthSmileRight": "MouthSmileRight",
  "mouthFrownLeft": "MouthFrownLeft",
  "mouthFrownRight": "MouthFrownRight",
  "mouthDimpleLeft": "MouthDimpleLeft",
  "mouthDimpleRight": "MouthDimpleRight",
  "mouthStretchLeft": "MouthStretchLeft",
  "mouthStretchRight": "MouthStretchRight",
  "mouthRollLower": "MouthRollLower",
  "mouthRollUpper": "MouthRollUpper",
  "mouthShrugLower": "MouthShrugLower",
  "mouthShrugUpper": "MouthShrugUpper",
  "mouthPressLeft": "MouthPressLeft",
  "mouthPressRight": "MouthPressRight",
  "mouthLowerDownLeft": "MouthLowerDownLeft",
  "mouthLowerDownRight": "MouthLowerDownRight",
  "mouthUpperUpLeft": "MouthUpperUpLeft",
  "mouthUpperUpRight": "MouthUpperUpRight",
  "browDownLeft": "BrowDownLeft",
  "browDownRight": "BrowDownRight",
  "browInnerUp": "BrowInnerUp",
  "browOuterUpLeft": "BrowOuterUpLeft",
  "browOuterUpRight": "BrowOuterUpRight",
  "cheekPuff": "CheekPuff",
  "cheekSquintLeft": "CheekSquintLeft",
  "cheekSquintRight": "CheekSquintRight",
  "noseSneerLeft": "NoseSneerLeft",
  "noseSneerRight": "NoseSneerRight",
  "tongueOut": "TongueOut",
  // 眼睛注视方向可能需要特殊处理
  "eyeLookDownLeft": "EyeLookDownLeft",
  "eyeLookInLeft": "EyeLookInLeft",
  "eyeLookOutLeft": "EyeLookOutLeft",
  "eyeLookUpLeft": "EyeLookUpLeft",
  "eyeLookDownRight": "EyeLookDownRight",
  "eyeLookInRight": "EyeLookInRight",
  "eyeLookOutRight": "EyeLookOutRight",
  "eyeLookUpRight": "EyeLookUpRight",
  "eyeSquintLeft": "EyeSquintLeft",
  "eyeSquintRight": "EyeSquintRight"
};

/**
 * 应用 ARKit blendshapes 到 GLB mesh
 * @param {Object} blendshapes - ARKit 52 维 blendshape 值
 * @param {THREE.Mesh} mesh - 包含 morphTargets 的 mesh
 * @param {Object} options - 配置选项
 */
export function applyArkitToGLB(blendshapes, mesh, options = {}) {
  if (!mesh || !mesh.morphTargetDictionary) return;
  
  const intensity = options.intensity ?? 1.0;
  
  // 遍历所有 ARKit blendshapes
  for (const [arkitName, value] of Object.entries(blendshapes)) {
    const rpmName = RPM_BLENDSHAPE_MAP[arkitName];
    if (!rpmName) continue;
    
    // 查找 morph target 索引
    const index = mesh.morphTargetDictionary[rpmName];
    if (index !== undefined) {
      // 应用值（乘以强度）
      mesh.morphTargetInfluences[index] = value * intensity;
    }
  }
}

/**
 * 应用头部变换到 GLB 模型
 * @param {Array} matrix - 4x4 变换矩阵
 * @param {THREE.Object3D} model - 模型根节点
 * @param {Object} options - 配置选项
 */
export function applyHeadTransform(matrix, model, options = {}) {
  if (!model || !matrix) return;
  
  const smooth = options.smooth ?? 0.5;
  
  // 转换为 THREE.Matrix4
  const m = new THREE.Matrix4();
  m.set(
    matrix[0][0], matrix[0][1], matrix[0][2], matrix[0][3],
    matrix[1][0], matrix[1][1], matrix[1][2], matrix[1][3],
    matrix[2][0], matrix[2][1], matrix[2][2], matrix[2][3],
    matrix[3][0], matrix[3][1], matrix[3][2], matrix[3][3]
  );
  
  // 分解为位置、旋转、缩放
  const pos = new THREE.Vector3();
  const quat = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  m.decompose(pos, quat, scale);
  
  // 应用平滑
  if (smooth < 1.0) {
    model.position.lerp(pos, smooth);
    model.quaternion.slerp(quat, smooth);
  } else {
    model.position.copy(pos);
    model.quaternion.copy(quat);
  }
  
  // 限制缩放（防止异常值）
  model.scale.set(1, 1, 1);
}

/**
 * 查找 GLB 中的面部 mesh
 * @param {THREE.Group} model - GLB 模型
 * @returns {THREE.Mesh|null}
 */
export function findFaceMesh(model) {
  let faceMesh = null;
  
  model.traverse((child) => {
    if (child.isMesh && child.morphTargetDictionary) {
      // 优先选择有最多 morph targets 的 mesh
      if (!faceMesh || Object.keys(child.morphTargetDictionary).length > 
          Object.keys(faceMesh.morphTargetDictionary).length) {
        faceMesh = child;
      }
    }
  });
  
  return faceMesh;
}

/**
 * 检查模型是否支持 ARKit blendshapes
 * @param {THREE.Group} model - GLB 模型
 * @returns {Object} - 支持信息
 */
export function checkARKitSupport(model) {
  const faceMesh = findFaceMesh(model);
  if (!faceMesh) {
    return { supported: false, reason: 'No morph targets found' };
  }
  
  const availableShapes = Object.keys(faceMesh.morphTargetDictionary);
  const arkitShapes = ARKIT_KEYS;
  const matched = arkitShapes.filter(name => availableShapes.includes(name));
  
  return {
    supported: matched.length > 0,
    totalMorphTargets: availableShapes.length,
    matchedARKitShapes: matched.length,
    matchRate: matched.length / arkitShapes.length,
    availableShapes: availableShapes.slice(0, 20) // 前20个
  };
}
