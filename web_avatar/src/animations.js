// 8 类动作触发的视觉特效。
// 每个 effect 是一个 spawn(scene, vrm) 函数，自带生命周期（spawn → tick → 自我清理）。
// 不依赖外部库；纯 Three.js 的 Sprites + 简单粒子。

import * as THREE from "three";

// ---------- 工具 ----------

function makeTextSprite(text, { color = "#ffffff", size = 64, bg = "rgba(0,0,0,0)" } = {}) {
  const c = document.createElement("canvas");
  const px = 256;
  c.width = px; c.height = px;
  const ctx = c.getContext("2d");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, px, px);
  ctx.fillStyle = color;
  ctx.font = `bold ${size}px ui-monospace, system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, px / 2, px / 2);
  const tex = new THREE.CanvasTexture(c);
  tex.minFilter = THREE.LinearFilter;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  return new THREE.Sprite(mat);
}

function getHeadWorldPos(vrm) {
  const head = vrm?.humanoid?.getNormalizedBoneNode("head");
  if (!head) return new THREE.Vector3(0, 1.5, 0);
  const p = new THREE.Vector3();
  head.getWorldPosition(p);
  return p;
}

// ---------- 一个简易的 effect 管理器 ----------

export class EffectManager {
  constructor(scene) {
    this.scene = scene;
    this.active = [];           // [{ obj, expireAt, tick }]
    this.lastTriggerByKey = {}; // 防抖：同一动作冷却
    this.cooldownMs = 500;
  }

  trigger(label, vrm) {
    const now = performance.now();
    if ((now - (this.lastTriggerByKey[label] || 0)) < this.cooldownMs) return false;
    const fn = EFFECTS[label];
    if (!fn) return false;
    this.lastTriggerByKey[label] = now;
    fn(this, vrm);
    return true;
  }

  /** 注册一个挂在 scene 里的对象，dur 毫秒后自动 remove。可选 tick(dt) 每帧调用。*/
  add(obj, durMs, tick = null) {
    this.scene.add(obj);
    this.active.push({ obj, expireAt: performance.now() + durMs, tick });
  }

  update(dt) {
    const now = performance.now();
    for (let i = this.active.length - 1; i >= 0; i--) {
      const a = this.active[i];
      if (a.tick) a.tick(dt);
      if (now >= a.expireAt) {
        this.scene.remove(a.obj);
        a.obj.material?.map?.dispose?.();
        a.obj.material?.dispose?.();
        a.obj.geometry?.dispose?.();
        this.active.splice(i, 1);
      }
    }
  }
}

// ---------- 各类动作的具体效果 ----------

function effectSparkleEye(mgr, vrm, side /* "left" | "right" */) {
  const head = getHeadWorldPos(vrm);
  // 双侧偏移；x 在头部世界系大致 ±0.06m
  const dx = (side === "left") ? -0.06 : 0.06;
  for (let i = 0; i < 6; i++) {
    const sp = makeTextSprite("✨", { color: "#9bd1ff", size: 80 });
    sp.scale.setScalar(0.08);
    sp.position.set(head.x + dx + (Math.random() - 0.5) * 0.04,
                    head.y + 0.04 + Math.random() * 0.05,
                    head.z + 0.05);
    const dur = 500 + Math.random() * 200;
    const v = new THREE.Vector3((Math.random() - 0.5) * 0.05,
                                0.10 + Math.random() * 0.05, 0);
    mgr.add(sp, dur, (dt) => {
      sp.position.addScaledVector(v, dt);
      sp.material.opacity = Math.max(0, sp.material.opacity - dt * 1.5);
    });
  }
}

function effectHeartParticles(mgr, vrm) {
  const head = getHeadWorldPos(vrm);
  for (let i = 0; i < 10; i++) {
    const sp = makeTextSprite("💕", { size: 96 });
    sp.scale.setScalar(0.12);
    sp.position.set(head.x + (Math.random() - 0.5) * 0.15,
                    head.y + 0.10,
                    head.z + 0.05);
    const dur = 800 + Math.random() * 300;
    const v = new THREE.Vector3((Math.random() - 0.5) * 0.04,
                                0.15 + Math.random() * 0.05, 0);
    mgr.add(sp, dur, (dt) => {
      sp.position.addScaledVector(v, dt);
      sp.material.opacity = Math.max(0, sp.material.opacity - dt * 1.0);
    });
  }
}

function effectQuestionPop(mgr, vrm) {
  const head = getHeadWorldPos(vrm);
  const sp = makeTextSprite("❓", { color: "#ffd166", size: 120 });
  sp.scale.setScalar(0.001);
  sp.position.set(head.x, head.y + 0.18, head.z + 0.05);
  const dur = 700;
  const t0 = performance.now();
  mgr.add(sp, dur, () => {
    const t = (performance.now() - t0) / dur;
    const s = (t < 0.3) ? 0.18 * (t / 0.3)
            : (t < 0.7) ? 0.18
            : 0.18 * (1 - (t - 0.7) / 0.3);
    sp.scale.setScalar(s);
    sp.material.opacity = (t < 0.7) ? 1.0 : Math.max(0, 1 - (t - 0.7) / 0.3);
  });
}

function effectRain(mgr, vrm) {
  const head = getHeadWorldPos(vrm);
  for (let i = 0; i < 8; i++) {
    const sp = makeTextSprite("💧", { size: 80 });
    sp.scale.setScalar(0.07);
    sp.position.set(head.x + (Math.random() - 0.5) * 0.18,
                    head.y + 0.12 + Math.random() * 0.05,
                    head.z + 0.05);
    const dur = 600 + Math.random() * 200;
    const v = new THREE.Vector3(0, -0.30 - Math.random() * 0.10, 0);
    mgr.add(sp, dur, (dt) => {
      sp.position.addScaledVector(v, dt);
      sp.material.opacity = Math.max(0, sp.material.opacity - dt * 1.2);
    });
  }
}

function effectSoundwave(mgr, vrm) {
  const head = getHeadWorldPos(vrm);
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.02, 0.025, 32),
        new THREE.MeshBasicMaterial({ color: 0x66ccff, transparent: true, opacity: 0.8,
                                      side: THREE.DoubleSide, depthTest: false })
      );
      ring.position.set(head.x, head.y - 0.04, head.z + 0.05);
      ring.lookAt(0, ring.position.y, 5); // 朝向相机
      const dur = 700;
      const t0 = performance.now();
      mgr.add(ring, dur, () => {
        const t = (performance.now() - t0) / dur;
        ring.scale.setScalar(1 + t * 6);
        ring.material.opacity = 0.8 * (1 - t);
      });
    }, i * 100);
  }
}

function effectTongue(mgr, vrm) {
  const head = getHeadWorldPos(vrm);
  const sp = makeTextSprite("😜", { size: 96 });
  sp.scale.setScalar(0.001);
  sp.position.set(head.x, head.y + 0.20, head.z + 0.05);
  const dur = 800;
  const t0 = performance.now();
  mgr.add(sp, dur, () => {
    const t = (performance.now() - t0) / dur;
    const s = (t < 0.25) ? 0.16 * (t / 0.25)
            : 0.16 * (1 + 0.10 * Math.sin(t * 16));
    sp.scale.setScalar(s);
    sp.material.opacity = (t < 0.7) ? 1 : Math.max(0, 1 - (t - 0.7) / 0.3);
  });
}

const EFFECTS = {
  neutral:    () => {},
  wink_left:  (mgr, vrm) => effectSparkleEye(mgr, vrm, "left"),
  wink_right: (mgr, vrm) => effectSparkleEye(mgr, vrm, "right"),
  smile_big:  effectHeartParticles,
  surprise:   effectQuestionPop,
  frown:      effectRain,
  mouth_o:    effectSoundwave,
  tongue_out: effectTongue,
};
