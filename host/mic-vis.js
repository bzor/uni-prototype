class p {
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
      const t = this.mic.inputAudioContext, l = this.mic.mediaStream;
      this.analyser = t.createAnalyser(), this.analyser.fftSize = this.fftSize, this.analyser.smoothingTimeConstant = 0.5;
      const s = this.analyser.frequencyBinCount;
      console.log("fft buffer length: " + this.analyser.frequencyBinCount), this.dataArray = new Uint8Array(s), this.dataArrayHistory = new Uint8Array(s * this.historyLength), this.audioSource = t.createMediaStreamSource(l), this.audioSource.connect(this.analyser), this.startVisualization();
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
    Math.min((t - this.lastTime) * 1e-3, 0.1), this.lastTime = t, this.animationFrameId = requestAnimationFrame((i) => this.draw(i)), this.analyser.getByteFrequencyData(this.dataArray), this.ctx.fillStyle = "#dadfe0", this.ctx.globalCompositeOperation = "source-over", this.ctx.globalAlpha = 1, this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height), this.ctx.globalAlpha = 0.5, this.ctx.globalCompositeOperation = "overlay";
    const l = 6, s = 8, d = this.historyLength, y = this.dataArray.length, f = this.canvas.height * 0.5 - l * 2;
    for (let i = 0; i < y; i++) {
      const m = i / (y - 1);
      for (let a = 0; a < d; a++) {
        const g = a / (d - 1), u = m * f * this.easeInOutSine(1 - g), v = this.dataArrayHistory[i + a * this.dataArray.length] / 255;
        let e = s + this.canvasCenter.x + a * s, n = this.canvasCenter.y + u;
        const r = v * s * 2, h = v * s * 4, o = r * 0.5, c = h * 0.5, x = m * 360;
        this.ctx.fillStyle = `hsl(${x}, 100%, 50%)`, this.ctx.fillRect(e - o, n - c, r, h), n = this.canvasCenter.y - u, this.ctx.fillRect(e - o, n - c, r, h), e = this.canvasCenter.x - a * s, this.ctx.fillRect(e - o, n - c, r, h), e = this.canvasCenter.x - a * s, n = this.canvasCenter.y + u, this.ctx.fillRect(e - o, n - c, r, h);
      }
    }
    const A = this.dataArrayHistory.length - this.dataArray.length;
    for (let i = A; i >= 0; --i)
      this.dataArrayHistory[i + this.dataArray.length] = this.dataArrayHistory[i];
    for (let i = 0; i < this.dataArray.length; i++)
      this.dataArrayHistory[i] = this.dataArray[i];
  }
  easeInOutSine(t) {
    return (Math.cos(Math.PI * t) - 1) / 2;
  }
  disconnect() {
    this.stopVisualization(), this.resizeObserver && (this.resizeObserver.disconnect(), this.resizeObserver = null), this.audioSource && (this.audioSource.disconnect(), this.audioSource = null), this.analyser && (this.analyser.disconnect(), this.analyser = null), this.canvas && this.container && this.canvas.parentNode === this.container && this.container.removeChild(this.canvas), this.canvas = null, this.ctx = null, this.dataArray = null;
  }
}
export {
  p as MicVis
};
