// 加载 TFJS 动作识别模型，对每帧 ARKit blendshape 维护一个 30 帧滑窗，
// 周期性推理 → 触发 EffectManager。
//
// 设计要点:
//  - 模型可选(action_model/model.json 不存在就跳过,不挂全站)
//  - 推理频率 = 5 Hz(每 6 帧一次),省 CPU,够用
//  - 输出做 majority-vote 平滑:连续 3 个推理同一类才触发,杜绝抽搐
//  - 加 confidence threshold(默认 0.55)

const MODEL_URL = "/models/action_model/model.json";
const META_URL  = "/models/action_model/class_names.json";

export class ActionRecognizer {
  constructor({ inferEveryNFrames = 6, threshold = 0.55, voteSize = 2 } = {}) {
    this.tf = null;
    this.model = null;
    this.labels = [];
    this.featureOrder = [];
    this.window = 30;
    this.inferEveryNFrames = inferEveryNFrames;
    this.threshold = threshold;
    this.voteSize = voteSize;

    this.buf = [];                  // 30 帧滑窗,Float32Array(52) each
    this.sinceLastInfer = 0;
    this.recentVotes = [];          // 最近 N 次推理 argmax
    this.lastEmitted = null;
    this.ready = false;
    this.disabled = false;
    this.lastConfidence = 0;
    this.lastLabel = "—";
  }

  async init() {
    try {
      // 优先用 npm 装好的本地 @tensorflow/tfjs（package.json 已声明）；
      // 没装时退到 ESM CDN，离线时 disabled。
      try {
        this.tf = await import("@tensorflow/tfjs");
      } catch {
        this.tf = await import("https://esm.sh/@tensorflow/tfjs@4.20.0");
      }
    } catch (e) {
      console.warn("[action] tfjs 加载失败,动作识别禁用:", e);
      this.disabled = true;
      return;
    }
    try {
      const metaResp = await fetch(META_URL);
      if (!metaResp.ok) throw new Error("no class_names.json");
      const meta = await metaResp.json();
      this.labels = meta.labels;
      this.featureOrder = meta.feature_order;
      this.window = meta.window || 30;
    } catch (e) {
      console.warn("[action] class_names.json 不存在 — 还没训练过模型?动作识别禁用。");
      this.disabled = true;
      return;
    }
    try {
      this.model = await this.tf.loadLayersModel(MODEL_URL);
      // warmup
      const z = this.tf.zeros([1, this.window, this.featureOrder.length]);
      this.model.predict(z).dispose();
      z.dispose();
      this.ready = true;
      console.log(`[action] model ready (${this.labels.length} classes, window=${this.window})`);
    } catch (e) {
      console.warn("[action] model.json 加载失败,动作识别禁用:", e);
      this.disabled = true;
    }
  }

  /** 每帧调用：feed 当前 ARKit blendshape 字典；按需触发 onAction(label) 回调。*/
  feed(blendshapes, onAction) {
    if (!this.ready || this.disabled) return;
    // 投到固定特征顺序
    const vec = new Float32Array(this.featureOrder.length);
    for (let i = 0; i < this.featureOrder.length; i++) {
      const v = blendshapes?.[this.featureOrder[i]] ?? 0;
      vec[i] = v < 0 ? 0 : v > 1 ? 1 : v;
    }
    this.buf.push(vec);
    if (this.buf.length > this.window) this.buf.shift();
    if (this.buf.length < this.window) return;

    this.sinceLastInfer++;
    if (this.sinceLastInfer < this.inferEveryNFrames) return;
    this.sinceLastInfer = 0;

    // 拼成 (1, T, F) tensor
    const flat = new Float32Array(this.window * this.featureOrder.length);
    for (let t = 0; t < this.window; t++) flat.set(this.buf[t], t * this.featureOrder.length);
    const x = this.tf.tensor(flat, [1, this.window, this.featureOrder.length]);
    const out = this.model.predict(x);
    const probs = out.dataSync();
    x.dispose(); out.dispose();

    let best = 0;
    for (let i = 1; i < probs.length; i++) if (probs[i] > probs[best]) best = i;
    const conf = probs[best];
    const label = this.labels[best];
    this.lastLabel = label;
    this.lastConfidence = conf;

    if (conf < this.threshold) { this.recentVotes = []; return; }
    this.recentVotes.push(label);
    if (this.recentVotes.length > this.voteSize) this.recentVotes.shift();
    if (this.recentVotes.length === this.voteSize &&
        this.recentVotes.every(v => v === label) &&
        label !== "neutral" &&
        label !== this.lastEmitted) {
      this.lastEmitted = label;
      onAction?.(label, conf);
      // 触发后清票,避免连发
      this.recentVotes = [];
    }
    if (label !== this.lastEmitted) this.lastEmitted = null;
  }
}
