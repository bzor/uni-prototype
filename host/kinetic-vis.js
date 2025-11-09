class g {
  constructor() {
    this.canvas = null, this.ctx = null, this.container = null, this.isVisualizing = !1, this.resizeObserver = null, this.animationFrameId = null, this.canvasWidth = 0, this.canvasHeight = 0, this.TWO_PI = Math.PI * 2, this.bgFillStyle = "#dadfe0", this.patternOptions = ["IDLE", "HAPPY_BOUNCE", "SLOW_SWAY", "JIGGLE"], this.pattern = "IDLE";
  }
  resizeCanvas() {
    if (!this.canvas || !this.container) return;
    const t = this.container.getBoundingClientRect();
    this.canvas.width = t.width || 800, this.canvas.height = t.height || 500, this.canvasWidth = this.canvas.width, this.canvasHeight = this.canvas.height;
  }
  init(t) {
    if (!t.container) {
      console.log("KineticVis error: must pass container DOM element");
      return;
    }
    this.container = t.container, this.canvas = document.createElement("canvas"), this.canvas.style.width = "100%", this.canvas.style.height = "100%", this.canvas.style.display = "block", this.container.appendChild(this.canvas), this.ctx = this.canvas.getContext("2d"), this.resizeCanvas(), this.resizeObserver = new ResizeObserver(() => {
      this.resizeCanvas();
    }), this.resizeObserver.observe(this.container), this.startDrawing();
  }
  startDrawing() {
    if (this.isVisualizing) return;
    this.isVisualizing = !0;
    const t = () => {
      this.isVisualizing && (this.draw(), this.animationFrameId = requestAnimationFrame(t));
    };
    t();
  }
  draw() {
    if (!this.ctx || !this.canvas) return;
    const t = this.canvasWidth, n = this.canvasHeight;
    this.ctx.fillStyle = this.bgFillStyle, this.ctx.fillRect(0, 0, t, n);
    const s = t * 0.5, e = n * 0.5, i = Math.min(t, n) * 0.15, a = i * 1.5, h = Date.now() * 1e-3;
    switch (this.pattern) {
      case "IDLE":
        this.drawIdle(s, e, i, a, h);
        break;
      case "HAPPY_BOUNCE":
        this.drawHappyBounce(s, e, i, a, h);
        break;
      case "SLOW_SWAY":
        this.drawSlowSway(s, e, i, a, h);
        break;
      case "JIGGLE":
        this.drawJiggle(s, e, i, a, h);
        break;
      default:
        this.drawIdle(s, e, i, a, h);
    }
  }
  drawIdle(t, n, s, e, i) {
    this.ctx.fillStyle = "rgba(100, 150, 200, 0.8)", this.ctx.strokeStyle = "rgba(50, 100, 150, 0.9)", this.ctx.lineWidth = 2, this.ctx.beginPath(), this.ctx.ellipse(t, n, s, e, 0, 0, this.TWO_PI), this.ctx.fill();
  }
  drawHappyBounce(t, n, s, e, i) {
    const a = Math.abs(Math.sin(i * 2)), c = -Math.pow(a, 0.7) * (e * 0.3), r = n + c, o = 1 - a * 0.2, l = 1 + a * 0.1;
    this.ctx.fillStyle = "rgba(100, 200, 150, 0.8)", this.ctx.strokeStyle = "rgba(50, 150, 100, 0.9)", this.ctx.lineWidth = 2, this.ctx.beginPath(), this.ctx.ellipse(t, r, s * o, e * l, 0, 0, this.TWO_PI), this.ctx.fill();
  }
  drawSlowSway(t, n, s, e, i) {
    const a = Math.sin(i * 0.8), h = s * 0.4, c = t + a * h, r = a * 0.2;
    this.ctx.fillStyle = "rgba(150, 150, 200, 0.8)", this.ctx.strokeStyle = "rgba(100, 100, 150, 0.9)", this.ctx.lineWidth = 2, this.ctx.beginPath(), this.ctx.ellipse(c, n, s, e, r, 0, this.TWO_PI), this.ctx.fill();
  }
  drawJiggle(t, n, s, e, i) {
    const a = (Math.sin(i * 8) + Math.sin(i * 11) * 0.5) * s * 0.15, h = (Math.cos(i * 7) + Math.cos(i * 13) * 0.5) * e * 0.15, c = (Math.sin(i * 9) + Math.sin(i * 12) * 0.3) * 0.3, r = t + a, o = n + h, l = 1 + Math.sin(i * 10) * 0.1;
    this.ctx.fillStyle = "rgba(200, 150, 100, 0.8)", this.ctx.strokeStyle = "rgba(150, 100, 50, 0.9)", this.ctx.lineWidth = 2, this.ctx.beginPath(), this.ctx.ellipse(r, o, s * l, e * l, c, 0, this.TWO_PI), this.ctx.fill();
  }
  disconnect() {
    this.isVisualizing = !1, this.animationFrameId && (cancelAnimationFrame(this.animationFrameId), this.animationFrameId = null), this.resizeObserver && (this.resizeObserver.disconnect(), this.resizeObserver = null), this.canvas && this.container && this.canvas.parentNode === this.container && this.container.removeChild(this.canvas), this.canvas = null, this.ctx = null, this.canvasWidth = 0, this.canvasHeight = 0;
  }
  setPattern(t) {
    t !== void 0 && this.patternOptions.includes(t) && (this.pattern = t);
  }
}
export {
  g as KineticVis
};
