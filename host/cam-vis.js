class O {
  constructor() {
    this.canvas = null, this.ctx = null, this.cam = null, this.video = null, this.isVisualizing = !1, this.resizeObserver = null, this.animationFrameId = null, this.drawWidth = 0, this.drawHeight = 0, this.offsetX = 0, this.offsetY = 0, this.videoAspect = 0, this.videoWidth = 0, this.videoHeight = 0, this.videoWidthInv = 0, this.videoHeightInv = 0, this.canvasWidth = 0, this.canvasHeight = 0, this.bodyConnections = [
      [11, 12],
      // shoulders
      [11, 13],
      [13, 15],
      [15, 17],
      [15, 19],
      [15, 21],
      // Left arm
      [17, 19],
      [19, 21],
      // Left finger connections
      [12, 14],
      [14, 16],
      [16, 18],
      [16, 20],
      [16, 22],
      // Right arm
      [18, 20],
      [20, 22]
      // Right finger connections
    ], this.TWO_PI = Math.PI * 2, this.EMPTY_ARRAY = [], this.fontString = '10px "Courier New", Courier, monospace', this.strokeStyleBlack = "rgba(0, 0, 0, 0.1)", this.fillStyleBlack = "white", this.fillStyleGray = "#cdcdcd", this.bgFillStyle = "#1a1a1a", this.faceDataLines = [], this.sortedExpressions = [], this.exprStringParts = [], this.lastKnownFaces = [], this.sensitivitySlider = null, this.sensitivitySliderContainer = null, this.skeletonSensitivitySlider = null, this.skeletonSensitivitySliderContainer = null, this.videoAlpha = 0.1, this.fadeStartTime = 0, this.fadeDuration = 1e3, this.fadeAnimationFrameId = null;
  }
  resizeCanvas() {
    if (!this.canvas || !this.container) return;
    const t = this.container.getBoundingClientRect();
    this.canvas.width = t.width || 800, this.canvas.height = t.height || 500, this.canvasWidth = this.canvas.width, this.canvasHeight = this.canvas.height, this.drawWidth = 0;
  }
  init(t) {
    if (!t.cam) {
      console.log("CamVis error: must pass cam reference");
      return;
    }
    if (!t.container) {
      console.log("CamVis error: must pass container DOM element");
      return;
    }
    this.cam = t.cam, this.video = this.cam.video, this.container = t.container, this.canvas = document.createElement("canvas"), this.canvas.style.width = "100%", this.canvas.style.height = "100%", this.canvas.style.display = "block", this.container.appendChild(this.canvas), this.ctx = this.canvas.getContext("2d"), this.resizeCanvas(), this.createSensitivitySlider(), this.createSkeletonSensitivitySlider(), this.resizeObserver = new ResizeObserver(() => {
      this.resizeCanvas(), this.updateSliderPosition();
    }), this.resizeObserver.observe(this.container), this.cam && this.cam.addEventListener("framesent", () => {
      this.flashVideoAlpha();
    }), this.waitForVideoAndStart();
  }
  createSensitivitySlider() {
    const t = document.createElement("div");
    t.style.position = "absolute", t.style.bottom = "10px", t.style.left = "10px", t.style.zIndex = "10", t.style.pointerEvents = "auto", t.style.display = "flex", t.style.alignItems = "center", t.style.gap = "8px", t.style.fontSize = "10px", t.style.fontFamily = '"Courier New", Courier, monospace', t.style.color = "#cdcdcd";
    const n = document.createElement("span");
    n.textContent = "FACE:", n.style.userSelect = "none", n.style.textTransform = "uppercase", this.sensitivitySlider = document.createElement("input"), this.sensitivitySlider.type = "range", this.sensitivitySlider.min = "0", this.sensitivitySlider.max = "1", this.sensitivitySlider.step = "0.01", this.sensitivitySlider.value = "0.3", this.sensitivitySlider.style.width = "120px", this.sensitivitySlider.style.height = "3px", this.sensitivitySlider.style.cursor = "pointer", this.sensitivitySlider.style.accentColor = "#cdcdcd";
    const i = document.createElement("style");
    i.textContent = `
			input[type="range"] {
				-webkit-appearance: none;
				appearance: none;
				background: transparent;
			}
			input[type="range"]::-webkit-slider-track {
				background: #cdcdcd;
				height: 3px;
			}
			input[type="range"]::-webkit-slider-thumb {
				-webkit-appearance: none;
				appearance: none;
				background: #cdcdcd;
				width: 6px;
				height: 6px;
				border-radius: 50%;
				cursor: pointer;
			}
			input[type="range"]::-moz-range-track {
				background: #cdcdcd;
				height: 3px;
			}
			input[type="range"]::-moz-range-thumb {
				background: #cdcdcd;
				width: 6px;
				height: 6px;
				border-radius: 50%;
				border: none;
				cursor: pointer;
			}
		`, document.head.appendChild(i);
    const a = document.createElement("span");
    a.style.minWidth = "30px", a.style.textAlign = "right", a.textContent = "0.30", a.style.textTransform = "uppercase", this.sensitivitySlider.addEventListener("input", (e) => {
      const l = parseFloat(e.target.value);
      a.textContent = l.toFixed(2), this.cam && this.cam.face && this.cam.face.setSensitivity(l);
    }), t.appendChild(n), t.appendChild(this.sensitivitySlider), t.appendChild(a), this.sensitivitySliderContainer = t, this.container.appendChild(t), this.cam && this.cam.face && this.cam.face.setSensitivity(0.3);
  }
  createSkeletonSensitivitySlider() {
    const t = document.createElement("div");
    t.style.position = "absolute", t.style.bottom = "30px", t.style.left = "10px", t.style.zIndex = "10", t.style.pointerEvents = "auto", t.style.display = "flex", t.style.alignItems = "center", t.style.gap = "8px", t.style.fontSize = "10px", t.style.fontFamily = '"Courier New", Courier, monospace', t.style.color = "#cdcdcd";
    const n = document.createElement("span");
    n.textContent = "SKEL:", n.style.userSelect = "none", n.style.textTransform = "uppercase", this.skeletonSensitivitySlider = document.createElement("input"), this.skeletonSensitivitySlider.type = "range", this.skeletonSensitivitySlider.min = "0", this.skeletonSensitivitySlider.max = "1", this.skeletonSensitivitySlider.step = "0.01", this.skeletonSensitivitySlider.value = "0.3", this.skeletonSensitivitySlider.style.width = "120px", this.skeletonSensitivitySlider.style.height = "3px", this.skeletonSensitivitySlider.style.cursor = "pointer", this.skeletonSensitivitySlider.style.accentColor = "#cdcdcd";
    const i = document.createElement("span");
    i.style.minWidth = "30px", i.style.textAlign = "right", i.textContent = "0.30", i.style.textTransform = "uppercase", this.skeletonSensitivitySlider.addEventListener("input", (a) => {
      const e = parseFloat(a.target.value);
      i.textContent = e.toFixed(2), this.cam && this.cam.skeletal && this.cam.skeletal.setSensitivity(e);
    }), t.appendChild(n), t.appendChild(this.skeletonSensitivitySlider), t.appendChild(i), this.skeletonSensitivitySliderContainer = t, this.container.appendChild(t), this.cam && this.cam.skeletal && this.cam.skeletal.setSensitivity(0.3);
  }
  updateSliderPosition() {
  }
  waitForVideoAndStart() {
    const t = setInterval(() => {
      this.cam && this.cam.video && (this.video = this.cam.video), this.video && this.video.readyState >= this.video.HAVE_METADATA && (clearInterval(t), this.isVisualizing = !0, setTimeout(() => {
        this.startDrawing();
      }, 500));
    }, 100);
    setTimeout(() => {
      clearInterval(t), this.video || console.error("[CamVis] Video not available after timeout");
    }, 1e4);
  }
  startDrawing() {
    if (!this.isVisualizing) return;
    const t = () => {
      this.isVisualizing && (this.draw(), this.animationFrameId = requestAnimationFrame(t));
    };
    t();
  }
  draw() {
    if (!this.ctx || !this.canvas || !this.video) return;
    const t = this.canvasWidth, n = this.canvasHeight;
    this.ctx.fillStyle = this.bgFillStyle, this.ctx.clearRect(0, 0, t, n);
    const i = this.video.videoWidth, a = this.video.videoHeight;
    if (this.drawWidth === 0 || this.videoWidth !== i || this.videoHeight !== a) {
      this.videoWidth = i, this.videoHeight = a, this.videoWidthInv = 1 / i, this.videoHeightInv = 1 / a, this.videoAspect = i * this.videoHeightInv;
      const p = t / n;
      this.videoAspect > p ? (this.drawHeight = n, this.drawWidth = this.drawHeight * this.videoAspect, this.offsetX = (t - this.drawWidth) * 0.5, this.offsetY = 0) : (this.drawWidth = t, this.drawHeight = this.drawWidth / this.videoAspect, this.offsetX = 0, this.offsetY = (n - this.drawHeight) * 0.5);
    }
    const e = this.drawWidth, l = this.drawHeight, h = this.offsetX, s = this.offsetY, c = this.videoWidthInv, x = this.videoHeightInv;
    this.ctx.save(), this.ctx.translate(t, 0), this.ctx.scale(-1, 1), this.video.readyState === this.video.HAVE_ENOUGH_DATA && (this.ctx.save(), this.ctx.globalAlpha = this.videoAlpha, this.ctx.drawImage(
      this.video,
      h,
      s,
      e,
      l
    ), this.ctx.restore());
    const g = this.cam ? this.cam.getCurrentFaces() : this.EMPTY_ARRAY, C = g && g.length > 0 ? g : this.lastKnownFaces;
    if (g && g.length > 0) {
      const p = g.length;
      this.lastKnownFaces.length = 0;
      for (let u = 0; u < p; u++) {
        const o = g[u], d = {
          boundingBox: {
            x: o.boundingBox.x,
            y: o.boundingBox.y,
            width: o.boundingBox.width,
            height: o.boundingBox.height
          },
          landmarks: null,
          expressions: null,
          dominantExpression: o.dominantExpression,
          age: o.age,
          gender: o.gender
        };
        if (o.landmarks && o.landmarks.length > 0) {
          const r = o.landmarks.length;
          d.landmarks = new Array(r);
          for (let v = 0; v < r; v++) {
            const m = o.landmarks[v];
            d.landmarks[v] = { x: m.x, y: m.y };
          }
        }
        if (o.expressions) {
          d.expressions = {};
          for (const r in o.expressions)
            o.expressions.hasOwnProperty(r) && (d.expressions[r] = o.expressions[r]);
        }
        this.lastKnownFaces.push(d);
      }
    }
    if (C && C.length > 0) {
      this.ctx.globalAlpha = 1, this.ctx.strokeStyle = this.strokeStyleBlack, this.ctx.lineWidth = 2;
      for (let p = 0, u = C.length; p < u; p++) {
        const o = C[p], d = o.boundingBox;
        if (d) {
          const r = h + d.x * c * e, v = s + d.y * x * l, m = d.width * c * e, f = d.height * x * l;
          this.ctx.strokeRect(r, v, m, f);
          const y = o.landmarks;
          if (y && y.length > 0) {
            this.ctx.fillStyle = this.fillStyleBlack, this.ctx.globalAlpha = 0.6;
            for (let k = 0, w = y.length; k < w; k++) {
              const A = y[k], F = h + A.x * c * e, b = s + A.y * x * l;
              this.ctx.beginPath(), this.ctx.arc(F, b, 2, 0, this.TWO_PI), this.ctx.fill();
            }
            this.ctx.globalAlpha = 1;
          }
        }
      }
    }
    const S = this.cam ? this.cam.getCurrentPoseLandmarks() : null;
    if (S && S.length > 0) {
      const p = S.length;
      this.ctx.globalAlpha = 1, this.ctx.fillStyle = this.fillStyleGray;
      const u = this.bodyConnections, o = 3, d = o + 1;
      for (let r = 0, v = u.length; r < v; r++) {
        const m = u[r], f = m[0], y = m[1];
        if (f < p && y < p) {
          const k = S[f], w = S[y], A = this.cam.getSkeletalLandmarkVisibility(f), F = this.cam.getSkeletalLandmarkVisibility(y);
          if (A > 0.5 && F > 0.5) {
            const b = h + k.x * e, E = s + k.y * l, H = h + w.x * e, T = s + w.y * l, D = H - b, P = T - E;
            for (let I = 1; I <= o; I++) {
              const W = I / d, V = b + D * W, z = E + P * W;
              this.ctx.globalAlpha = 0.4, this.ctx.beginPath(), this.ctx.arc(V, z, 1.8, 0, this.TWO_PI), this.ctx.fill();
            }
          }
        }
      }
      for (let r = 0; r < p; r++) {
        if (r <= 10 || r >= 23) continue;
        const v = S[r], m = this.cam.getSkeletalLandmarkVisibility(r);
        if (m < 0.3) continue;
        const f = h + v.x * e, y = s + v.y * l;
        this.ctx.globalAlpha = m < 0.6 ? 0.6 : m, this.ctx.fillStyle = this.fillStyleGray, this.ctx.beginPath(), this.ctx.arc(f, y, 4, 0, this.TWO_PI), this.ctx.fill();
      }
      this.ctx.globalAlpha = 1;
    }
    this.ctx.restore(), this.drawFaceDataReadout();
  }
  drawFaceDataReadout() {
    if (!this.ctx || !this.canvas) return;
    const t = this.cam ? this.cam.getCurrentFaces() : this.EMPTY_ARRAY, n = t && t.length > 0 ? t : this.lastKnownFaces;
    if (!n || n.length === 0) return;
    this.ctx.save(), this.ctx.font = this.fontString, this.ctx.textBaseline = "top", this.ctx.textAlign = "left";
    const i = 8, a = 14, e = this.faceDataLines;
    e.length = 0;
    for (let s = 0, c = n.length; s < c; s++)
      this.formatFaceData(n[s], s, e);
    let l = 0;
    for (let s = 0, c = e.length; s < c; s++) {
      const x = this.ctx.measureText(e[s]);
      x.width > l && (l = x.width);
    }
    e.length * a + i * 2, this.ctx.fillStyle = this.fillStyleBlack;
    let h = i + 2;
    for (let s = 0, c = e.length; s < c; s++)
      this.ctx.fillText(e[s], i + 4, h), h += a;
    this.ctx.restore();
  }
  formatFaceData(t, n, i) {
    if (i.push(`FACE ${n + 1}`.toUpperCase()), t.age !== null && t.gender !== null && i.push(`Age: ${Math.round(t.age)} | ${t.gender}`.toUpperCase()), t.dominantExpression) {
      const a = t.dominantExpression.toUpperCase(), e = t.expressions[t.dominantExpression];
      i.push(`Expr: ${a} (${(e * 100).toFixed(0)}%)`.toUpperCase());
    }
    if (t.expressions) {
      const a = this.sortedExpressions;
      a.length = 0;
      const e = t.expressions;
      for (const h in e)
        e.hasOwnProperty(h) && a.push([h, e[h]]);
      a.sort((h, s) => s[1] - h[1]);
      const l = Math.min(3, a.length);
      if (l > 0) {
        const h = this.exprStringParts;
        h.length = 0;
        for (let s = 0; s < l; s++) {
          const [c, x] = a[s];
          h.push(`${c.substring(0, 3).toUpperCase()}:${(x * 100).toFixed(0)}`);
        }
        i.push(`  ${h.join(" ")}`.toUpperCase());
      }
    }
    i.push("");
  }
  flashVideoAlpha() {
    this.fadeAnimationFrameId && (cancelAnimationFrame(this.fadeAnimationFrameId), this.fadeAnimationFrameId = null), this.videoAlpha = 1, this.fadeStartTime = Date.now();
    const t = () => {
      const n = Date.now() - this.fadeStartTime, i = Math.min(n / this.fadeDuration, 1);
      this.videoAlpha = 1 - i * (1 - 0.2), i < 1 ? this.fadeAnimationFrameId = requestAnimationFrame(t) : (this.videoAlpha = 0.2, this.fadeAnimationFrameId = null);
    };
    this.fadeAnimationFrameId = requestAnimationFrame(t);
  }
  disconnect() {
    this.isVisualizing = !1, this.animationFrameId && (cancelAnimationFrame(this.animationFrameId), this.animationFrameId = null), this.fadeAnimationFrameId && (cancelAnimationFrame(this.fadeAnimationFrameId), this.fadeAnimationFrameId = null), this.resizeObserver && (this.resizeObserver.disconnect(), this.resizeObserver = null), this.canvas && this.container && this.canvas.parentNode === this.container && this.container.removeChild(this.canvas), this.sensitivitySliderContainer && this.sensitivitySliderContainer.parentNode && this.sensitivitySliderContainer.parentNode.removeChild(this.sensitivitySliderContainer), this.sensitivitySlider = null, this.sensitivitySliderContainer = null, this.skeletonSensitivitySliderContainer && this.skeletonSensitivitySliderContainer.parentNode && this.skeletonSensitivitySliderContainer.parentNode.removeChild(this.skeletonSensitivitySliderContainer), this.skeletonSensitivitySlider = null, this.skeletonSensitivitySliderContainer = null, this.canvas = null, this.ctx = null, this.video = null, this.drawWidth = 0, this.drawHeight = 0, this.offsetX = 0, this.offsetY = 0, this.videoAspect = 0, this.videoWidth = 0, this.videoHeight = 0, this.videoWidthInv = 0, this.videoHeightInv = 0, this.canvasWidth = 0, this.canvasHeight = 0, this.faceDataLines.length = 0, this.sortedExpressions.length = 0, this.exprStringParts.length = 0, this.lastKnownFaces.length = 0;
  }
}
export {
  O as CamVis
};
