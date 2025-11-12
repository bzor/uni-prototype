class k {
  constructor() {
    this.canvas = null, this.ctx = null, this.container = null, this.isVisualizing = !1, this.resizeObserver = null, this.animationFrameId = null, this.canvasWidth = 0, this.canvasHeight = 0, this.TWO_PI = Math.PI * 2, this.bgFillStyle = "#1a1a1a", this.patternOptions = ["IDLE", "HAPPY_BOUNCE", "SLOW_SWAY", "JIGGLE"], this.pattern = "IDLE", this.targetPattern = "IDLE", this.interpolationProgress = 1, this.interpolationSpeed = 2, this.lastFrameTime = null, this.colors = null;
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
    this.container = t.container, this.colors = t.colors || [
      { fill: "#3846ff", stroke: "#3846ff" },
      // IDLE
      { fill: "rgba(100, 200, 150, 0.8)", stroke: "rgba(50, 150, 100, 0.9)" },
      // HAPPY_BOUNCE
      { fill: "#f275c5", stroke: "#f275c5" },
      // SLOW_SWAY
      { fill: "#fda834", stroke: "rgba(150, 100, 50, 0.9)" }
      // JIGGLE
    ], this.canvas = document.createElement("canvas"), this.canvas.style.width = "100%", this.canvas.style.height = "100%", this.canvas.style.display = "block", this.container.appendChild(this.canvas), this.ctx = this.canvas.getContext("2d"), this.resizeCanvas(), this.resizeObserver = new ResizeObserver(() => {
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
    const t = this.canvasWidth, s = this.canvasHeight;
    this.ctx.fillStyle = this.bgFillStyle, this.ctx.clearRect(0, 0, t, s);
    const r = t * 0.5, i = s * 0.5, a = Math.min(t, s) * 0.15, e = a * 1.5, h = Date.now() * 1e-3, n = performance.now() * 1e-3;
    this.lastFrameTime === null && (this.lastFrameTime = n);
    const l = n - this.lastFrameTime;
    this.lastFrameTime = n, this.pattern !== this.targetPattern && (this.interpolationProgress += this.interpolationSpeed * l, this.interpolationProgress >= 1 && (this.interpolationProgress = 1, this.pattern = this.targetPattern));
    const d = this.getPatternState(this.pattern, r, i, a, e, h), c = this.getPatternState(this.targetPattern, r, i, a, e, h), u = this.interpolationProgress, g = this.interpolateStates(d, c, u);
    this.drawState(g);
  }
  getPatternState(t, s, r, i, a, e) {
    const h = this.patternOptions.indexOf(t), n = this.colors && this.colors[h] ? this.colors[h] : { fill: "rgba(100, 150, 200, 0.8)", stroke: "rgba(50, 100, 150, 0.9)" };
    switch (t) {
      case "IDLE":
        return {
          x: s,
          y: r,
          radiusX: i,
          radiusY: a,
          rotation: 0,
          fillColor: n.fill,
          strokeColor: n.stroke
        };
      case "HAPPY_BOUNCE":
        const l = Math.abs(Math.sin(e * 2)), c = -Math.pow(l, 0.7) * (a * 0.3), u = 1 - l * 0.2, g = 1 + l * 0.1;
        return {
          x: s,
          y: r + c,
          radiusX: i * u,
          radiusY: a * g,
          rotation: 0,
          fillColor: n.fill,
          strokeColor: n.stroke
        };
      case "SLOW_SWAY":
        const f = Math.sin(e * 0.8), b = i * 0.4, v = f * 0.2;
        return {
          x: s + f * b,
          y: r,
          radiusX: i,
          radiusY: a,
          rotation: v,
          fillColor: n.fill,
          strokeColor: n.stroke
        };
      case "JIGGLE":
        const o = 0.4, x = (Math.sin(e * 8 * o) + Math.sin(e * 11 * o) * 0.5) * i * 0.15, m = (Math.cos(e * 7 * o) + Math.cos(e * 13 * o) * 0.5) * a * 0.15, C = (Math.sin(e * 9 * o) + Math.sin(e * 12 * o) * 0.3) * 0.3, p = 1 + Math.sin(e * 10) * 0.1;
        return {
          x: s + x,
          y: r + m,
          radiusX: i * p,
          radiusY: a * p,
          rotation: C,
          fillColor: n.fill,
          strokeColor: n.stroke
        };
      default:
        return {
          x: s,
          y: r,
          radiusX: i,
          radiusY: a,
          rotation: 0,
          fillColor: n.fill,
          strokeColor: n.stroke
        };
    }
  }
  parseColor(t) {
    const s = t.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (s)
      return {
        r: parseInt(s[1]),
        g: parseInt(s[2]),
        b: parseInt(s[3]),
        a: parseFloat(s[4] || "1.0")
      };
    const r = t.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
    if (r) {
      let i = r[1];
      return i.length === 3 && (i = i.split("").map((a) => a + a).join("")), {
        r: parseInt(i.substring(0, 2), 16),
        g: parseInt(i.substring(2, 4), 16),
        b: parseInt(i.substring(4, 6), 16),
        a: 1
      };
    }
    return { r: 100, g: 150, b: 200, a: 0.8 };
  }
  interpolateRgba(t, s, r) {
    const i = this.parseColor(t), a = this.parseColor(s);
    return `rgba(${Math.round(i.r + (a.r - i.r) * r)}, ${Math.round(i.g + (a.g - i.g) * r)}, ${Math.round(i.b + (a.b - i.b) * r)}, ${i.a + (a.a - i.a) * r})`;
  }
  interpolateStates(t, s, r) {
    return {
      x: t.x + (s.x - t.x) * r,
      y: t.y + (s.y - t.y) * r,
      radiusX: t.radiusX + (s.radiusX - t.radiusX) * r,
      radiusY: t.radiusY + (s.radiusY - t.radiusY) * r,
      rotation: t.rotation + (s.rotation - t.rotation) * r,
      fillColor: this.interpolateRgba(t.fillColor, s.fillColor, r),
      strokeColor: this.interpolateRgba(t.strokeColor, s.strokeColor, r)
    };
  }
  drawState(t) {
    this.ctx.fillStyle = t.fillColor, this.ctx.strokeStyle = t.strokeColor, this.ctx.lineWidth = 2, this.ctx.globalAlpha = 1, this.ctx.beginPath(), this.ctx.ellipse(t.x, t.y, t.radiusX, t.radiusY, t.rotation, 0, this.TWO_PI), this.ctx.fill(), this.ctx.globalAlpha = 0.6, this.ctx.beginPath(), this.ctx.ellipse(t.x, t.y, t.radiusX * 1.1, t.radiusY * 1.1, t.rotation, 0, this.TWO_PI), this.ctx.stroke(), this.ctx.globalAlpha = 0.1, this.ctx.beginPath(), this.ctx.ellipse(t.x, t.y, t.radiusX * 1.2, t.radiusY * 1.2, t.rotation, 0, this.TWO_PI), this.ctx.stroke();
  }
  disconnect() {
    this.isVisualizing = !1, this.animationFrameId && (cancelAnimationFrame(this.animationFrameId), this.animationFrameId = null), this.resizeObserver && (this.resizeObserver.disconnect(), this.resizeObserver = null), this.canvas && this.container && this.canvas.parentNode === this.container && this.container.removeChild(this.canvas), this.canvas = null, this.ctx = null, this.canvasWidth = 0, this.canvasHeight = 0, this.lastFrameTime = null;
  }
  setPattern(t) {
    t !== void 0 && this.patternOptions.includes(t) && this.targetPattern !== t && (this.interpolationProgress = 0, this.targetPattern = t);
  }
}
export {
  k as KineticVis
};
