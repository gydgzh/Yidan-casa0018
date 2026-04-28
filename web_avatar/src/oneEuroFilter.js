// One-Euro Filter (Casiez 2012). 实时低延迟去抖。
//
// 用法:
//   const f = new OneEuro({ minCutoff: 1.0, beta: 0.05 });
//   const y = f.filter(x, tNow);          // tNow 单位:秒
//
// 直觉:速度小→强滤波,速度大→弱滤波。比 EMA 在快速动作时更跟手。

export class OneEuro {
  constructor({ minCutoff = 1.0, beta = 0.05, dCutoff = 1.0 } = {}) {
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
    this.x = null;
    this.dx = 0;
    this.t = null;
  }
  _alpha(cutoff, dt) {
    const tau = 1 / (2 * Math.PI * cutoff);
    return 1 / (1 + tau / dt);
  }
  filter(value, t) {
    if (this.t === null) { this.t = t; this.x = value; return value; }
    const dt = Math.max(t - this.t, 1e-6);
    const dxRaw = (value - this.x) / dt;
    const aD = this._alpha(this.dCutoff, dt);
    this.dx = aD * dxRaw + (1 - aD) * this.dx;
    const cutoff = this.minCutoff + this.beta * Math.abs(this.dx);
    const a = this._alpha(cutoff, dt);
    const y = a * value + (1 - a) * this.x;
    this.x = y; this.t = t;
    return y;
  }
}
