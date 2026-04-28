// CASA0018 Face Mocap → GLB Avatar (renderer)
//
// 支持两种数据输入：
// 1. WebSocket (远程调试)
// 2. iOS Native Bridge (WKWebView JS Bridge)
//
// 模型支持：VRM (.vrm) 或 GLB with ARKit morphTargets (.glb)

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import { OneEuro } from "./oneEuroFilter.js";
import { ARKIT_KEYS, applyArkitToVRM } from "./arkitToVrm.js";
import { applyArkitToGLB, findFaceMesh, checkARKitSupport } from "./arkitToGltf.js";
import { EffectManager } from "./animations.js";
import { ActionRecognizer } from "./actionInference.js";
import "./nativeBridge.js";

// ---------- 配置 ----------
// 检测是否在 iOS WKWebView 中
const isIOSWebView = () => {
  return window.webkit && window.webkit.messageHandlers;
};

const USE_NATIVE_BRIDGE = isIOSWebView() || (window.isNativeApp && window.isNativeApp());
const RELAY_URL = `ws://${location.hostname || "localhost"}:8765`;
const MODEL_PATH = "./models/avatar.vrm";
const IS_GLB = MODEL_PATH.endsWith('.glb');

// ---------- DOM ----------
const $ws     = document.getElementById("ws");
const $fps    = document.getElementById("fps");
const $bs     = document.getElementById("bs");
const $warn   = document.getElementById("warn");
const $smooth = document.getElementById("smooth");
const $head   = document.getElementById("head");
const $actLbl = document.getElementById("actLbl");
const $actCnf = document.getElementById("actCnf");
const $actOn  = document.getElementById("actOn");
const $actEvt = document.getElementById("actEvt");

// ---------- THREE 基本 ----------
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("c"), antialias: true, alpha: false });
renderer.setPixelRatio(window.devicePixelRatio);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1c20);

const camera = new THREE.PerspectiveCamera(28, 1, 0.05, 100);
camera.position.set(0, 1.4, 1.2);
camera.lookAt(0, 1.4, 0);

scene.add(new THREE.HemisphereLight(0xffffff, 0x444466, 1.2));
const dir = new THREE.DirectionalLight(0xffffff, 1.5); dir.position.set(1, 2, 1.5); scene.add(dir);

window.addEventListener("resize", resize);
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
}
resize();

// ---------- 模型加载 ----------
let currentVRM = null;
let currentGLB = null;
let faceMesh = null;
let isGLB = false;

const loader = new GLTFLoader();
loader.register((parser) => new VRMLoaderPlugin(parser));

console.log("[Main] Loading model from:", MODEL_PATH);
loader.load(MODEL_PATH, (gltf) => {
  console.log("[Main] GLTF loaded, userData:", gltf.userData);
  // 检测是 VRM 还是普通 GLB
  if (gltf.userData.vrm) {
    // VRM 模型
    const vrm = gltf.userData.vrm;
    VRMUtils.rotateVRM0(vrm);
    scene.add(vrm.scene);
    currentVRM = vrm;
    isGLB = false;
    console.log("[Main] VRM model loaded:", vrm.meta?.name || "unnamed");
    if ($warn) $warn.textContent = "VRM loaded: " + (vrm.meta?.name || "unnamed");
  } else {
    // GLB 模型 (Ready Player Me 等)
    const model = gltf.scene;
    scene.add(model);
    currentGLB = model;
    isGLB = true;
    
    // 查找面部 mesh
    faceMesh = findFaceMesh(model);
    if (faceMesh) {
      console.log("[Main] GLB face mesh found:", faceMesh.name);
      const support = checkARKitSupport(model);
      console.log("[Main] ARKit support:", support);
    } else {
      console.warn("[Main] No morph targets found in GLB");
    }
    
    // 调整模型位置和大小
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const scale = 1.6 / size.y; // 调整到约 1.6m 身高
    model.scale.setScalar(scale);
    model.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
  }
  
  resize();
}, undefined, (e) => {
  console.error("[Main] Model load failed:", e);
  console.error("[Main] Attempted path:", MODEL_PATH);
  if ($warn) {
    $warn.textContent = "模型加载失败: " + e.message + " (path: " + MODEL_PATH + ")";
    $warn.style.color = "#f85149";
  }
});

// ---------- 数据接收 ----------
const euro = new OneEuro({ minCutoff: 0.3, beta: 0.05 });
const actRec = new ActionRecognizer({ inferEveryNFrames: 5, threshold: 0.50, voteSize: 2 });
const effects = new EffectManager(scene);

let lastBlendshapes = {};
let lastMatrix = null;

// 处理 ARKit 数据
function processARKitData(data) {
  const blendshapes = data.blendshapes || {};
  const matrix = data.transform || data.head;
  
  // 平滑滤波
  const smooth = parseFloat($smooth?.value ?? 0.5);
  const filtered = {};
  for (const k of ARKIT_KEYS) {
    const v = blendshapes[k] ?? 0;
    const prev = lastBlendshapes[k] ?? 0;
    filtered[k] = prev + (v - prev) * smooth;
  }
  lastBlendshapes = filtered;
  
  // 应用到模型
  if (isGLB && faceMesh) {
    // GLB 模式
    applyArkitToGLB(filtered, faceMesh, { intensity: 1.0 });
    if (currentGLB && matrix) {
      applyArkitToGLB.applyHeadTransform?.(matrix, currentGLB, { smooth });
    }
  } else if (currentVRM) {
    // VRM 模式
    applyArkitToVRM(filtered, currentVRM);
    if (matrix && currentVRM.humanoid) {
      const head = currentVRM.humanoid.getNormalizedBoneNode("head");
      if (head) {
        const m = new THREE.Matrix4();
        m.set(
          matrix[0][0], matrix[0][1], matrix[0][2], matrix[0][3],
          matrix[1][0], matrix[1][1], matrix[1][2], matrix[1][3],
          matrix[2][0], matrix[2][1], matrix[2][2], matrix[2][3],
          matrix[3][0], matrix[3][1], matrix[3][2], matrix[3][3]
        );
        const pos = new THREE.Vector3();
        const quat = new THREE.Quaternion();
        const scale = new THREE.Vector3();
        m.decompose(pos, quat, scale);
        head.position.lerp(pos, smooth);
        head.quaternion.slerp(quat, smooth);
      }
    }
  }
  
  // 动作识别
  const feats = ARKIT_KEYS.map(k => filtered[k] ?? 0);
  const action = actRec.push(feats);
  if (action && $actLbl) {
    $actLbl.textContent = action.label;
    $actCnf.textContent = (action.confidence * 100).toFixed(0) + "%";
    $actOn.textContent = action.onset ? "NEW" : "hold";
    effects.trigger(action.label, action.onset);
    if (action.onset && $actEvt) {
      $actEvt.textContent = `${action.label} @ ${Date.now() % 100000}`;
    }
  }
  
  // UI 更新
  if ($bs) {
    const top = Object.entries(filtered)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([k, v]) => `${k}=${v.toFixed(2)}`)
      .join(" ");
    $bs.textContent = top;
  }
  if ($head && matrix) {
    $head.textContent = matrix.map(r => r.map(x => x.toFixed(2)).join(",")).join("; ");
  }
}

// ---------- 输入源选择 ----------

// 1. Native Bridge (iOS App 内)
if (USE_NATIVE_BRIDGE) {
  console.log("[Main] Using native bridge mode");
  if ($ws) $ws.textContent = "NATIVE";
  
  // 监听来自 iOS 的数据
  window.addEventListener('arkitData', (e) => {
    processARKitData(e.detail);
  });
  
  // 兼容回调方式
  window.onARKitData = processARKitData;
} else {
  // 2. WebSocket (浏览器调试)
  console.log("[Main] Using WebSocket mode:", RELAY_URL);
  if ($ws) $ws.textContent = "CONNECTING...";
  
  const ws = new WebSocket(RELAY_URL);
  ws.binaryType = "arraybuffer";
  
  let lastTs = performance.now();
  let frameCount = 0;
  
  ws.onopen = () => { if ($ws) $ws.textContent = "OPEN"; };
  ws.onclose = () => { if ($ws) $ws.textContent = "CLOSED"; };
  ws.onerror = (e) => { if ($ws) $ws.textContent = "ERROR"; console.error(e); };
  
  ws.onmessage = (ev) => {
    const now = performance.now();
    frameCount++;
    if (now - lastTs >= 1000) {
      if ($fps) $fps.textContent = frameCount + " fps";
      frameCount = 0;
      lastTs = now;
    }
    
    try {
      const data = JSON.parse(ev.data);
      processARKitData(data);
    } catch (e) {
      console.error("[Main] Parse error:", e);
    }
  };
}

// ---------- 渲染循环 ----------
function animate() {
  requestAnimationFrame(animate);
  effects.tick();
  if (currentVRM) currentVRM.update(performance.now() / 1000);
  renderer.render(scene, camera);
}
animate();

console.log("[Main] Renderer initialized. Mode:", USE_NATIVE_BRIDGE ? "Native Bridge" : "WebSocket");
