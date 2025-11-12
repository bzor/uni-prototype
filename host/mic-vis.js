class C {
  constructor() {
    this.canvas = null, this.ctx = null, this.analyser = null, this.audioSource = null, this.dataArray = null, this.dataArrayHistory = null, this.animationFrameId = null, this.isVisualizing = !1, this.resizeObserver = null, this.lastTime = 0, this.fftSize = 32, this.historyLength = 64;
  }
  resizeCanvas() {
    if (!this.canvas || !this.container) return;
    const t = this.container.getBoundingClientRect();
    this.canvas.width = t.width || 800, this.canvas.height = t.height || 500, this.canvasCenter = { x: this.canvas.width * 0.5, y: this.canvas.height * 0.5 };
  }
  init(t) {
    if (!t.mic) {
      console.log("MicVis error: must pass mic reference");
      return;
    }
    if (!t.container) {
      console.log("MicVis error: must pass container DOM element");
      return;
    }
    this.mic = t.mic, this.container = t.container, this.canvas = document.createElement("canvas"), this.canvas.style.width = "100%", this.canvas.style.height = "100%", this.canvas.style.display = "block", this.container.appendChild(this.canvas), this.ctx = this.canvas.getContext("2d"), this.resizeCanvas(), this.resizeObserver = new ResizeObserver(() => {
      this.resizeCanvas();
    }), this.resizeObserver.observe(this.container), this.setupAudioAnalysis();
  }
  setupAudioAnalysis() {
    const t = () => {
      this.mic.inputAudioContext && this.mic.mediaStream && this.mic.inputAudioContext.state !== "closed" ? this.connectAudioAnalysis() : setTimeout(t, 100);
    };
    t();
  }
  connectAudioAnalysis() {
    try {
      const t = this.mic.inputAudioContext, e = this.mic.mediaStream;
      this.analyser = t.createAnalyser(), this.analyser.fftSize = this.fftSize, this.analyser.smoothingTimeConstant = 0.5;
      const s = this.analyser.frequencyBinCount;
      console.log("fft buffer length: " + this.analyser.frequencyBinCount), this.dataArray = new Uint8Array(s), this.dataArrayHistory = new Uint8Array(s * this.historyLength), this.audioSource = t.createMediaStreamSource(e), this.audioSource.connect(this.analyser), this.startVisualization();
    } catch (t) {
      console.error("[MicVis] Error setting up audio analysis:", t);
    }
  }
  startVisualization() {
    this.isVisualizing || (this.isVisualizing = !0, this.draw(0));
  }
  stopVisualization() {
    this.isVisualizing = !1, this.animationFrameId && (cancelAnimationFrame(this.animationFrameId), this.animationFrameId = null);
  }
  draw(t) {
    if (!this.isVisualizing || !this.analyser || !this.ctx) return;
    Math.min((t - this.lastTime) * 1e-3, 0.1), this.lastTime = t, this.animationFrameId = requestAnimationFrame((i) => this.draw(i)), this.analyser.getByteFrequencyData(this.dataArray), this.ctx.fillStyle = "#1a1a1a", this.ctx.globalCompositeOperation = "source-over", this.ctx.globalAlpha = 1, this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height), this.ctx.globalAlpha = 0.5, this.ctx.globalCompositeOperation = "overlay";
    const e = 6, s = 8, r = this.historyLength, a = this.dataArray.length, f = this.canvas.height * 0.5 - e * 2;
    for (let i = 0; i < a; i++) {
      const m = i / (a - 1);
      for (let n = 0; n < r; n++) {
        const A = n / (r - 1), d = m * f * this.easeInOutSine(1 - A), v = this.dataArrayHistory[i + n * this.dataArray.length] / 255;
        let h = s + this.canvasCenter.x + n * s, o = this.canvasCenter.y + d;
        const c = v * s * 2, l = v * s * 4, u = c * 0.5, y = l * 0.5;
        this.ctx.fillStyle = this.heatMapColor(m), this.ctx.fillRect(h - u, o - y, c, l), o = this.canvasCenter.y - d, this.ctx.fillRect(h - u, o - y, c, l), h = this.canvasCenter.x - n * s, this.ctx.fillRect(h - u, o - y, c, l), h = this.canvasCenter.x - n * s, o = this.canvasCenter.y + d, this.ctx.fillRect(h - u, o - y, c, l);
      }
    }
    const g = this.dataArrayHistory.length - this.dataArray.length;
    for (let i = g; i >= 0; --i)
      this.dataArrayHistory[i + this.dataArray.length] = this.dataArrayHistory[i];
    for (let i = 0; i < this.dataArray.length; i++)
      this.dataArrayHistory[i] = this.dataArray[i];
  }
  easeInOutSine(t) {
    return (Math.cos(Math.PI * t) - 1) / 2;
  }
  heatMapColor(t) {
    let e, s, r;
    if (t < 0.5) {
      const a = t * 2;
      e = 255, s = Math.floor(255 * (1 - a)), r = Math.floor(240 * (1 - a));
    } else {
      const a = (t - 0.5) * 2;
      e = Math.floor(255 * (1 - a)), s = 0, r = Math.floor(255 * a);
    }
    return `rgb(${e}, ${s}, ${r})`;
  }
  disconnect() {
    this.stopVisualization(), this.resizeObserver && (this.resizeObserver.disconnect(), this.resizeObserver = null), this.audioSource && (this.audioSource.disconnect(), this.audioSource = null), this.analyser && (this.analyser.disconnect(), this.analyser = null), this.canvas && this.container && this.canvas.parentNode === this.container && this.container.removeChild(this.canvas), this.canvas = null, this.ctx = null, this.dataArray = null;
  }
}
export {
  C as MicVis
};
