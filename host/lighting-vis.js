class M {
  constructor() {
    this.canvas = null, this.ctx = null, this.container = null, this.isVisualizing = !1, this.resizeObserver = null, this.animationFrameId = null, this.canvasWidth = 0, this.canvasHeight = 0, this.TWO_PI = Math.PI * 2, this.bgFillStyle = "#dadfe0", this.patternOptions = ["IDLE", "SMOOTH_WAVES", "CIRCULSAR_PULSE", "HECTIC_NOISE"], this.speed = 0.4, this.color = 16711935, this.pattern = "IDLE", this.transitionDuration = 1e3, this.transitionStartTime = null, this.prevColor = this.color, this.prevPattern = this.pattern, this.prevSpeed = this.speed, this.isTransitioning = !1;
  }
  resizeCanvas() {
    if (!this.canvas || !this.container) return;
    const n = this.container.getBoundingClientRect();
    this.canvas.width = n.width || 800, this.canvas.height = n.height || 500, this.canvasWidth = this.canvas.width, this.canvasHeight = this.canvas.height;
  }
  init(n) {
    if (!n.container) {
      console.log("LightingVis error: must pass container DOM element");
      return;
    }
    this.container = n.container, this.canvas = document.createElement("canvas"), this.canvas.style.width = "100%", this.canvas.style.height = "100%", this.canvas.style.display = "block", this.container.appendChild(this.canvas), this.ctx = this.canvas.getContext("2d"), this.resizeCanvas(), this.resizeObserver = new ResizeObserver(() => {
      this.resizeCanvas();
    }), this.resizeObserver.observe(this.container), this.startDrawing();
  }
  startDrawing() {
    if (this.isVisualizing) return;
    this.isVisualizing = !0;
    const n = () => {
      this.isVisualizing && (this.draw(), this.animationFrameId = requestAnimationFrame(n));
    };
    n();
  }
  draw() {
    if (!this.ctx || !this.canvas) return;
    const n = this.canvasWidth, u = this.canvasHeight;
    this.ctx.fillStyle = this.bgFillStyle, this.ctx.fillRect(0, 0, n, u);
    const h = 32, o = u * 0.9, i = o / h, l = (n - o) * 0.5, d = (u - o) * 0.5;
    let a = 0;
    if (this.isTransitioning && this.transitionStartTime !== null) {
      const b = Date.now() - this.transitionStartTime;
      a = Math.min(1, b / this.transitionDuration), a = a < 0.5 ? 2 * a * a : 1 - Math.pow(-2 * a + 2, 2) / 2, a >= 1 && (this.isTransitioning = !1, this.transitionStartTime = null);
    }
    const s = this.isTransitioning ? this.prevSpeed : this.speed, t = Date.now() * 1e-3 * s, e = this.prevColor >> 16 & 255, r = this.prevColor >> 8 & 255, c = this.prevColor & 255, v = this.color >> 16 & 255, w = this.color >> 8 & 255, p = this.color & 255, x = this.isTransitioning ? Math.round(e + (v - e) * a) : v, g = this.isTransitioning ? Math.round(r + (w - r) * a) : w, f = this.isTransitioning ? Math.round(c + (p - c) * a) : p;
    if (this.isTransitioning && this.prevPattern !== this.pattern)
      this.drawPatternBlend(
        this.prevPattern,
        this.pattern,
        e,
        r,
        c,
        v,
        w,
        p,
        h,
        i,
        l,
        d,
        t,
        a
      );
    else
      switch (this.pattern) {
        case "IDLE":
          this.drawIdle(x, g, f, h, i, l, d, t);
          break;
        case "SMOOTH_WAVES":
          this.drawSmoothWaves(x, g, f, h, i, l, d, t);
          break;
        case "CIRCULSAR_PULSE":
          this.drawCircularPulse(x, g, f, h, i, l, d, t);
          break;
        case "HECTIC_NOISE":
          this.drawHecticNoise(x, g, f, h, i, l, d, t);
          break;
        default:
          this.drawIdle(x, g, f, h, i, l, d, t);
      }
  }
  drawPatternBlend(n, u, h, o, i, l, d, a, s, t, e, r, c, v) {
    const w = 1 - v;
    if (w > 0.01)
      switch (this.ctx.globalAlpha = w, n) {
        case "IDLE":
          this.drawIdle(h, o, i, s, t, e, r, c);
          break;
        case "SMOOTH_WAVES":
          this.drawSmoothWaves(h, o, i, s, t, e, r, c);
          break;
        case "CIRCULSAR_PULSE":
          this.drawCircularPulse(h, o, i, s, t, e, r, c);
          break;
        case "HECTIC_NOISE":
          this.drawHecticNoise(h, o, i, s, t, e, r, c);
          break;
      }
    const p = v;
    if (p > 0.01)
      switch (this.ctx.globalAlpha = p, u) {
        case "IDLE":
          this.drawIdle(l, d, a, s, t, e, r, c);
          break;
        case "SMOOTH_WAVES":
          this.drawSmoothWaves(l, d, a, s, t, e, r, c);
          break;
        case "CIRCULSAR_PULSE":
          this.drawCircularPulse(l, d, a, s, t, e, r, c);
          break;
        case "HECTIC_NOISE":
          this.drawHecticNoise(l, d, a, s, t, e, r, c);
          break;
      }
    this.ctx.globalAlpha = 1;
  }
  drawIdle(n, u, h, o, i, l, d, a) {
    for (let s = 0; s < o; s++)
      for (let t = 0; t < o; t++) {
        const e = l + (t + 0.5) * i, r = d + (s + 0.5) * i, c = i * 0.35, v = 0.6 + Math.sin(a * 0.3) * 0.1;
        this.ctx.fillStyle = `rgba(${n}, ${u}, ${h}, ${v})`, this.ctx.beginPath(), this.ctx.arc(e, r, c, 0, this.TWO_PI), this.ctx.fill();
      }
  }
  drawSmoothWaves(n, u, h, o, i, l, d, a) {
    for (let s = 0; s < o; s++)
      for (let t = 0; t < o; t++) {
        const e = l + (t + 0.5) * i, r = d + (s + 0.5) * i, c = Math.sin(a * 2 + t * 0.2), v = Math.sin(a * 1.5 + s * 0.2), w = Math.sin(a * 1.8 + (s + t) * 0.15), p = (c + v + w) / 3, x = Math.max(0.1, i * 0.25 + p * (i * 0.15)), g = 0.5 + p * 0.4;
        this.ctx.fillStyle = `rgba(${n}, ${u}, ${h}, ${g})`, this.ctx.beginPath(), this.ctx.arc(e, r, x, 0, this.TWO_PI), this.ctx.fill();
      }
  }
  drawCircularPulse(n, u, h, o, i, l, d, a) {
    const s = o * 0.5, t = o * 0.5;
    for (let e = 0; e < o; e++)
      for (let r = 0; r < o; r++) {
        const c = l + (r + 0.5) * i, v = d + (e + 0.5) * i, w = r - s, p = e - t, x = Math.sqrt(w * w + p * p), g = Math.sin(a * 3 - x * 0.3), f = Math.sin(a * 2.5 - x * 0.25), b = (g + f) / 2, I = Math.max(0.1, i * 0.2 + b * (i * 0.2)), C = 0.4 + b * 0.5;
        this.ctx.fillStyle = `rgba(${n}, ${u}, ${h}, ${C})`, this.ctx.beginPath(), this.ctx.arc(c, v, I, 0, this.TWO_PI), this.ctx.fill();
      }
  }
  drawHecticNoise(n, u, h, o, i, l, d, a) {
    for (let s = 0; s < o; s++)
      for (let t = 0; t < o; t++) {
        const e = l + (t + 0.5) * i, r = d + (s + 0.5) * i, c = Math.sin(a * 5 + s * 0.7 + t * 0.3), v = Math.sin(a * 7 + s * 0.4 + t * 0.8), w = Math.sin(a * 11 + s * 0.9 + t * 0.2), p = Math.sin(a * 13 + s * 0.3 + t * 0.6), x = (s * 17 + t * 23) % 100 / 100, f = (c + v * 0.7 + w * 0.5 + p * 0.3) / 2.5 + (x - 0.5) * 0.3, b = Math.max(0.1, i * 0.2 + f * (i * 0.25)), I = 0.3 + Math.abs(f) * 0.6;
        this.ctx.fillStyle = `rgba(${n}, ${u}, ${h}, ${I})`, this.ctx.beginPath(), this.ctx.arc(e, r, b, 0, this.TWO_PI), this.ctx.fill();
      }
  }
  disconnect() {
    this.isVisualizing = !1, this.animationFrameId && (cancelAnimationFrame(this.animationFrameId), this.animationFrameId = null), this.resizeObserver && (this.resizeObserver.disconnect(), this.resizeObserver = null), this.canvas && this.container && this.canvas.parentNode === this.container && this.container.removeChild(this.canvas), this.canvas = null, this.ctx = null, this.canvasWidth = 0, this.canvasHeight = 0;
  }
  setAnimation(n, u, h) {
    n !== void 0 && n !== this.color && (this.prevColor = this.color, this.color = n, this.isTransitioning = !0), u !== void 0 && u !== this.pattern && (this.prevPattern = this.pattern, this.pattern = u, this.isTransitioning = !0), h !== void 0 && h !== this.speed && (this.prevSpeed = this.speed, this.speed = h, this.isTransitioning || (this.isTransitioning = !0)), this.isTransitioning && (this.transitionStartTime = Date.now());
  }
}
export {
  M as LightingVis
};
