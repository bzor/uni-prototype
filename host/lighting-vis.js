class E {
  constructor() {
    this.canvas = null, this.ctx = null, this.container = null, this.isVisualizing = !1, this.resizeObserver = null, this.animationFrameId = null, this.canvasWidth = 0, this.canvasHeight = 0, this.TWO_PI = Math.PI * 2, this.bgFillStyle = "#1a1a1a", this.patternOptions = ["IDLE", "SMOOTH_WAVES", "CIRCULSAR_PULSE", "HECTIC_NOISE"], this.currentSpeed = 0.4, this.currentColor = 13487565, this.currentPattern = "IDLE", this.targetSpeed = 0.4, this.targetColor = 13487565, this.targetPattern = "IDLE", this.transitionDuration = 1e3, this.transitionStartTime = null, this.blendFactor = 0;
  }
  resizeCanvas() {
    if (!this.canvas || !this.container) return;
    const e = this.container.getBoundingClientRect();
    this.canvas.width = e.width || 800, this.canvas.height = e.height || 500, this.canvasWidth = this.canvas.width, this.canvasHeight = this.canvas.height;
  }
  init(e) {
    if (!e.container) {
      console.log("LightingVis error: must pass container DOM element");
      return;
    }
    this.container = e.container, this.canvas = document.createElement("canvas"), this.canvas.style.width = "100%", this.canvas.style.height = "100%", this.canvas.style.display = "block", this.container.appendChild(this.canvas), this.ctx = this.canvas.getContext("2d"), this.resizeCanvas(), this.resizeObserver = new ResizeObserver(() => {
      this.resizeCanvas();
    }), this.resizeObserver.observe(this.container), this.startDrawing();
  }
  startDrawing() {
    if (this.isVisualizing) return;
    this.isVisualizing = !0;
    const e = () => {
      this.isVisualizing && (this.draw(), this.animationFrameId = requestAnimationFrame(e));
    };
    e();
  }
  draw() {
    if (!this.ctx || !this.canvas) return;
    const e = this.canvasWidth, r = this.canvasHeight;
    this.ctx.fillStyle = this.bgFillStyle, this.ctx.clearRect(0, 0, e, r);
    const h = 16, a = r * 0.9, l = a / h, u = (e - a) * 0.5, c = (r - a) * 0.5;
    if (this.transitionStartTime !== null) {
      const o = Date.now() - this.transitionStartTime;
      let i = Math.min(1, o / this.transitionDuration);
      i = i < 0.5 ? 2 * i * i : 1 - Math.pow(-2 * i + 2, 2) / 2, this.blendFactor = i, i >= 1 && (this.currentSpeed = this.targetSpeed, this.currentColor = this.targetColor, this.currentPattern = this.targetPattern, this.blendFactor = 0, this.transitionStartTime = null);
    }
    const n = Date.now() * 1e-3, s = n * this.currentSpeed, t = n * this.targetSpeed;
    this.drawBlendedPatterns(
      this.currentPattern,
      this.targetPattern,
      this.currentColor,
      this.targetColor,
      s,
      t,
      h,
      l,
      u,
      c,
      this.blendFactor
    );
  }
  drawBlendedPatterns(e, r, h, a, l, u, c, n, s, t, o) {
    const i = h >> 16 & 255, d = h >> 8 & 255, f = h & 255, v = a >> 16 & 255, x = a >> 8 & 255, g = a & 255, M = Math.round(i + (v - i) * o), p = Math.round(d + (x - d) * o), b = Math.round(f + (g - f) * o), w = c * 0.5, I = c * 0.5;
    for (let P = 0; P < c; P++)
      for (let V = 0; V < c; V++) {
        const $ = s + (V + 0.5) * n, m = t + (P + 0.5) * n, O = this.calculatePatternValues(
          e,
          P,
          V,
          w,
          I,
          n,
          l
        ), C = this.calculatePatternValues(
          r,
          P,
          V,
          w,
          I,
          n,
          u
        ), y = O.radius + (C.radius - O.radius) * o, T = O.alpha + (C.alpha - O.alpha) * o;
        this.ctx.fillStyle = `rgba(${M}, ${p}, ${b}, ${T})`, this.ctx.beginPath(), this.ctx.arc($, m, y, 0, this.TWO_PI), this.ctx.fill();
      }
  }
  calculatePatternValues(e, r, h, a, l, u, c) {
    let n = 0, s = 0;
    switch (e) {
      case "IDLE": {
        n = u * 0.3 + Math.sin(c * 1.2) * 0.2, s = 0.6 + Math.sin(c * 0.3) * 0.1;
        break;
      }
      case "SMOOTH_WAVES": {
        const t = Math.sin(c * 2 + h * 0.2), o = Math.sin(c * 1.5 + r * 0.2), i = Math.sin(c * 1.8 + (r + h) * 0.15), d = (t + o + i) / 3;
        n = Math.max(0.1, u * 0.2 + d * (u * 0.3)), s = 0.5 + d * 0.4;
        break;
      }
      case "CIRCULSAR_PULSE": {
        const t = h - a, o = r - l, i = Math.sqrt(t * t + o * o), d = Math.sin(c * 3 - i * 0.3), f = Math.sin(c * 2.5 - i * 0.25), v = (d + f) / 2;
        n = Math.max(0.1, u * 0.2 + v * (u * 0.2)), s = 0.4 + v * 0.5;
        break;
      }
      case "HECTIC_NOISE": {
        const t = Math.sin(c * 5 + r * 0.7 + h * 0.3), o = Math.sin(c * 7 + r * 0.4 + h * 0.8), i = Math.sin(c * 11 + r * 0.9 + h * 0.2), d = Math.sin(c * 13 + r * 0.3 + h * 0.6), f = (r * 17 + h * 23) % 100 / 100, x = (t + o * 0.7 + i * 0.5 + d * 0.3) / 2.5 + (f - 0.5) * 0.3;
        n = Math.max(0.1, u * 0.15 + x * (u * 0.35)), s = 0.3 + Math.abs(x) * 0.6;
        break;
      }
    }
    return { radius: n, alpha: s };
  }
  drawIdle(e, r, h, a, l, u, c, n) {
    for (let s = 0; s < a; s++)
      for (let t = 0; t < a; t++) {
        const o = u + (t + 0.5) * l, i = c + (s + 0.5) * l, d = l * 0.3 + Math.sin(n * 1.2) * 0.2, f = 0.6 + Math.sin(n * 0.3) * 0.1;
        this.ctx.fillStyle = `rgba(${e}, ${r}, ${h}, ${f})`, this.ctx.beginPath(), this.ctx.arc(o, i, d, 0, this.TWO_PI), this.ctx.fill();
      }
  }
  drawSmoothWaves(e, r, h, a, l, u, c, n) {
    for (let s = 0; s < a; s++)
      for (let t = 0; t < a; t++) {
        const o = u + (t + 0.5) * l, i = c + (s + 0.5) * l, d = Math.sin(n * 2 + t * 0.2), f = Math.sin(n * 1.5 + s * 0.2), v = Math.sin(n * 1.8 + (s + t) * 0.15), x = (d + f + v) / 3, g = Math.max(0.1, l * 0.2 + x * (l * 0.3)), M = 0.5 + x * 0.4;
        this.ctx.fillStyle = `rgba(${e}, ${r}, ${h}, ${M})`, this.ctx.beginPath(), this.ctx.arc(o, i, g, 0, this.TWO_PI), this.ctx.fill();
      }
  }
  drawCircularPulse(e, r, h, a, l, u, c, n) {
    const s = a * 0.5, t = a * 0.5;
    for (let o = 0; o < a; o++)
      for (let i = 0; i < a; i++) {
        const d = u + (i + 0.5) * l, f = c + (o + 0.5) * l, v = i - s, x = o - t, g = Math.sqrt(v * v + x * x), M = Math.sin(n * 3 - g * 0.3), p = Math.sin(n * 2.5 - g * 0.25), b = (M + p) / 2, w = Math.max(0.1, l * 0.2 + b * (l * 0.2)), I = 0.4 + b * 0.5;
        this.ctx.fillStyle = `rgba(${e}, ${r}, ${h}, ${I})`, this.ctx.beginPath(), this.ctx.arc(d, f, w, 0, this.TWO_PI), this.ctx.fill();
      }
  }
  drawHecticNoise(e, r, h, a, l, u, c, n) {
    for (let s = 0; s < a; s++)
      for (let t = 0; t < a; t++) {
        const o = u + (t + 0.5) * l, i = c + (s + 0.5) * l, d = Math.sin(n * 5 + s * 0.7 + t * 0.3), f = Math.sin(n * 7 + s * 0.4 + t * 0.8), v = Math.sin(n * 11 + s * 0.9 + t * 0.2), x = Math.sin(n * 13 + s * 0.3 + t * 0.6), g = (s * 17 + t * 23) % 100 / 100, p = (d + f * 0.7 + v * 0.5 + x * 0.3) / 2.5 + (g - 0.5) * 0.3, b = Math.max(0.1, l * 0.15 + p * (l * 0.35)), w = 0.3 + Math.abs(p) * 0.6;
        this.ctx.fillStyle = `rgba(${e}, ${r}, ${h}, ${w})`, this.ctx.beginPath(), this.ctx.arc(o, i, b, 0, this.TWO_PI), this.ctx.fill();
      }
  }
  disconnect() {
    this.isVisualizing = !1, this.animationFrameId && (cancelAnimationFrame(this.animationFrameId), this.animationFrameId = null), this.resizeObserver && (this.resizeObserver.disconnect(), this.resizeObserver = null), this.canvas && this.container && this.canvas.parentNode === this.container && this.container.removeChild(this.canvas), this.canvas = null, this.ctx = null, this.canvasWidth = 0, this.canvasHeight = 0;
  }
  setAnimation(e, r, h) {
    let a = !1;
    e !== void 0 && e !== this.targetColor && (this.targetColor = e, a = !0), r !== void 0 && r !== this.targetPattern && (this.targetPattern = r, a = !0), h !== void 0 && h !== this.targetSpeed && (this.targetSpeed = h, a = !0), a && this.transitionStartTime === null && (this.transitionStartTime = Date.now(), this.blendFactor = 0);
  }
}
export {
  E as LightingVis
};
