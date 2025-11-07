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
    ], this.TWO_PI = Math.PI * 2, this.EMPTY_ARRAY = [], this.fontString = '10px "Courier New", Courier, monospace', this.strokeStyleBlack = "rgba(0, 0, 0, 0.1)", this.fillStyleBlack = "black", this.fillStyleGray = "#555555", this.bgFillStyle = "#dadfe0", this.faceDataLines = [], this.sortedExpressions = [], this.exprStringParts = [], this.lastKnownFaces = [], this.sensitivitySlider = null, this.sensitivitySliderContainer = null, this.skeletonSensitivitySlider = null, this.skeletonSensitivitySliderContainer = null;
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
    }), this.resizeObserver.observe(this.container), this.waitForVideoAndStart();
  }
  createSensitivitySlider() {
    const t = document.createElement("div");
    t.style.position = "absolute", t.style.bottom = "10px", t.style.left = "10px", t.style.zIndex = "10", t.style.pointerEvents = "auto", t.style.display = "flex", t.style.alignItems = "center", t.style.gap = "8px", t.style.fontSize = "10px", t.style.fontFamily = '"Courier New", Courier, monospace', t.style.color = "black";
    const a = document.createElement("span");
    a.textContent = "FACE:", a.style.userSelect = "none", a.style.textTransform = "uppercase", this.sensitivitySlider = document.createElement("input"), this.sensitivitySlider.type = "range", this.sensitivitySlider.min = "0", this.sensitivitySlider.max = "1", this.sensitivitySlider.step = "0.01", this.sensitivitySlider.value = "0.3", this.sensitivitySlider.style.width = "120px", this.sensitivitySlider.style.height = "3px", this.sensitivitySlider.style.cursor = "pointer", this.sensitivitySlider.style.accentColor = "black";
    const s = document.createElement("style");
    s.textContent = `
			input[type="range"] {
				-webkit-appearance: none;
				appearance: none;
				background: transparent;
			}
			input[type="range"]::-webkit-slider-track {
				background: #333333;
				height: 3px;
			}
			input[type="range"]::-webkit-slider-thumb {
				-webkit-appearance: none;
				appearance: none;
				background: black;
				width: 6px;
				height: 6px;
				border-radius: 50%;
				cursor: pointer;
			}
			input[type="range"]::-moz-range-track {
				background: #333333;
				height: 3px;
			}
			input[type="range"]::-moz-range-thumb {
				background: black;
				width: 6px;
				height: 6px;
				border-radius: 50%;
				border: none;
				cursor: pointer;
			}
		`, document.head.appendChild(s);
    const n = document.createElement("span");
    n.style.minWidth = "30px", n.style.textAlign = "right", n.textContent = "0.30", n.style.textTransform = "uppercase", this.sensitivitySlider.addEventListener("input", (i) => {
      const r = parseFloat(i.target.value);
      n.textContent = r.toFixed(2), this.cam && this.cam.face && this.cam.face.setSensitivity(r);
    }), t.appendChild(a), t.appendChild(this.sensitivitySlider), t.appendChild(n), this.sensitivitySliderContainer = t, this.container.appendChild(t), this.cam && this.cam.face && this.cam.face.setSensitivity(0.3);
  }
  createSkeletonSensitivitySlider() {
    const t = document.createElement("div");
    t.style.position = "absolute", t.style.bottom = "30px", t.style.left = "10px", t.style.zIndex = "10", t.style.pointerEvents = "auto", t.style.display = "flex", t.style.alignItems = "center", t.style.gap = "8px", t.style.fontSize = "10px", t.style.fontFamily = '"Courier New", Courier, monospace', t.style.color = "black";
    const a = document.createElement("span");
    a.textContent = "SKEL:", a.style.userSelect = "none", a.style.textTransform = "uppercase", this.skeletonSensitivitySlider = document.createElement("input"), this.skeletonSensitivitySlider.type = "range", this.skeletonSensitivitySlider.min = "0", this.skeletonSensitivitySlider.max = "1", this.skeletonSensitivitySlider.step = "0.01", this.skeletonSensitivitySlider.value = "0.3", this.skeletonSensitivitySlider.style.width = "120px", this.skeletonSensitivitySlider.style.height = "3px", this.skeletonSensitivitySlider.style.cursor = "pointer", this.skeletonSensitivitySlider.style.accentColor = "black";
    const s = document.createElement("span");
    s.style.minWidth = "30px", s.style.textAlign = "right", s.textContent = "0.30", s.style.textTransform = "uppercase", this.skeletonSensitivitySlider.addEventListener("input", (n) => {
      const i = parseFloat(n.target.value);
      s.textContent = i.toFixed(2), this.cam && this.cam.skeletal && this.cam.skeletal.setSensitivity(i);
    }), t.appendChild(a), t.appendChild(this.skeletonSensitivitySlider), t.appendChild(s), this.skeletonSensitivitySliderContainer = t, this.container.appendChild(t), this.cam && this.cam.skeletal && this.cam.skeletal.setSensitivity(0.3);
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
    const t = this.canvasWidth, a = this.canvasHeight;
    this.ctx.fillStyle = this.bgFillStyle, this.ctx.fillRect(0, 0, t, a);
    const s = this.video.videoWidth, n = this.video.videoHeight;
    if (this.drawWidth === 0 || this.videoWidth !== s || this.videoHeight !== n) {
      this.videoWidth = s, this.videoHeight = n, this.videoWidthInv = 1 / s, this.videoHeightInv = 1 / n, this.videoAspect = s * this.videoHeightInv;
      const p = t / a;
      this.videoAspect > p ? (this.drawHeight = a, this.drawWidth = this.drawHeight * this.videoAspect, this.offsetX = (t - this.drawWidth) * 0.5, this.offsetY = 0) : (this.drawWidth = t, this.drawHeight = this.drawWidth / this.videoAspect, this.offsetX = 0, this.offsetY = (a - this.drawHeight) * 0.5);
    }
    const i = this.drawWidth, r = this.drawHeight, h = this.offsetX, e = this.offsetY, d = this.videoWidthInv, g = this.videoHeightInv;
    this.ctx.save(), this.ctx.translate(t, 0), this.ctx.scale(-1, 1), this.video.readyState === this.video.HAVE_ENOUGH_DATA && (this.ctx.save(), this.ctx.globalAlpha = 0.2, this.ctx.drawImage(
      this.video,
      h,
      e,
      i,
      r
    ), this.ctx.restore());
    const u = this.cam ? this.cam.getCurrentFaces() : this.EMPTY_ARRAY, C = u && u.length > 0 ? u : this.lastKnownFaces;
    if (u && u.length > 0) {
      const p = u.length;
      this.lastKnownFaces.length = 0;
      for (let m = 0; m < p; m++) {
        const o = u[m], c = {
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
          const l = o.landmarks.length;
          c.landmarks = new Array(l);
          for (let v = 0; v < l; v++) {
            const y = o.landmarks[v];
            c.landmarks[v] = { x: y.x, y: y.y };
          }
        }
        if (o.expressions) {
          c.expressions = {};
          for (const l in o.expressions)
            o.expressions.hasOwnProperty(l) && (c.expressions[l] = o.expressions[l]);
        }
        this.lastKnownFaces.push(c);
      }
    }
    if (C && C.length > 0) {
      this.ctx.globalAlpha = 1, this.ctx.strokeStyle = this.strokeStyleBlack, this.ctx.lineWidth = 2;
      for (let p = 0, m = C.length; p < m; p++) {
        const o = C[p], c = o.boundingBox;
        if (c) {
          const l = h + c.x * d * i, v = e + c.y * g * r, y = c.width * d * i, f = c.height * g * r;
          this.ctx.strokeRect(l, v, y, f);
          const x = o.landmarks;
          if (x && x.length > 0) {
            this.ctx.fillStyle = this.fillStyleBlack, this.ctx.globalAlpha = 0.6;
            for (let k = 0, b = x.length; k < b; k++) {
              const w = x[k], F = h + w.x * d * i, A = e + w.y * g * r;
              this.ctx.beginPath(), this.ctx.arc(F, A, 2, 0, this.TWO_PI), this.ctx.fill();
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
      const m = this.bodyConnections, o = 3, c = o + 1;
      for (let l = 0, v = m.length; l < v; l++) {
        const y = m[l], f = y[0], x = y[1];
        if (f < p && x < p) {
          const k = S[f], b = S[x], w = this.cam.getSkeletalLandmarkVisibility(f), F = this.cam.getSkeletalLandmarkVisibility(x);
          if (w > 0.5 && F > 0.5) {
            const A = h + k.x * i, W = e + k.y * r, I = h + b.x * i, P = e + b.y * r, z = I - A, T = P - W;
            for (let E = 1; E <= o; E++) {
              const H = E / c, V = A + z * H, D = W + T * H;
              this.ctx.globalAlpha = 0.4, this.ctx.beginPath(), this.ctx.arc(V, D, 1.8, 0, this.TWO_PI), this.ctx.fill();
            }
          }
        }
      }
      for (let l = 0; l < p; l++) {
        if (l <= 10 || l >= 23) continue;
        const v = S[l], y = this.cam.getSkeletalLandmarkVisibility(l);
        if (y < 0.3) continue;
        const f = h + v.x * i, x = e + v.y * r;
        this.ctx.globalAlpha = y < 0.6 ? 0.6 : y, this.ctx.fillStyle = this.fillStyleGray, this.ctx.beginPath(), this.ctx.arc(f, x, 4, 0, this.TWO_PI), this.ctx.fill();
      }
      this.ctx.globalAlpha = 1;
    }
    this.ctx.restore(), this.drawFaceDataReadout();
  }
  drawFaceDataReadout() {
    if (!this.ctx || !this.canvas) return;
    const t = this.cam ? this.cam.getCurrentFaces() : this.EMPTY_ARRAY, a = t && t.length > 0 ? t : this.lastKnownFaces;
    if (!a || a.length === 0) return;
    this.ctx.save(), this.ctx.font = this.fontString, this.ctx.textBaseline = "top", this.ctx.textAlign = "left";
    const s = 8, n = 14, i = this.faceDataLines;
    i.length = 0;
    for (let e = 0, d = a.length; e < d; e++)
      this.formatFaceData(a[e], e, i);
    let r = 0;
    for (let e = 0, d = i.length; e < d; e++) {
      const g = this.ctx.measureText(i[e]);
      g.width > r && (r = g.width);
    }
    i.length * n + s * 2, this.ctx.fillStyle = this.fillStyleBlack;
    let h = s + 2;
    for (let e = 0, d = i.length; e < d; e++)
      this.ctx.fillText(i[e], s + 4, h), h += n;
    this.ctx.restore();
  }
  formatFaceData(t, a, s) {
    if (s.push(`FACE ${a + 1}`.toUpperCase()), t.age !== null && t.gender !== null && s.push(`Age: ${Math.round(t.age)} | ${t.gender}`.toUpperCase()), t.dominantExpression) {
      const n = t.dominantExpression.toUpperCase(), i = t.expressions[t.dominantExpression];
      s.push(`Expr: ${n} (${(i * 100).toFixed(0)}%)`.toUpperCase());
    }
    if (t.expressions) {
      const n = this.sortedExpressions;
      n.length = 0;
      const i = t.expressions;
      for (const h in i)
        i.hasOwnProperty(h) && n.push([h, i[h]]);
      n.sort((h, e) => e[1] - h[1]);
      const r = Math.min(3, n.length);
      if (r > 0) {
        const h = this.exprStringParts;
        h.length = 0;
        for (let e = 0; e < r; e++) {
          const [d, g] = n[e];
          h.push(`${d.substring(0, 3).toUpperCase()}:${(g * 100).toFixed(0)}`);
        }
        s.push(`  ${h.join(" ")}`.toUpperCase());
      }
    }
    s.push("");
  }
  disconnect() {
    this.isVisualizing = !1, this.animationFrameId && (cancelAnimationFrame(this.animationFrameId), this.animationFrameId = null), this.resizeObserver && (this.resizeObserver.disconnect(), this.resizeObserver = null), this.canvas && this.container && this.canvas.parentNode === this.container && this.container.removeChild(this.canvas), this.sensitivitySliderContainer && this.sensitivitySliderContainer.parentNode && this.sensitivitySliderContainer.parentNode.removeChild(this.sensitivitySliderContainer), this.sensitivitySlider = null, this.sensitivitySliderContainer = null, this.skeletonSensitivitySliderContainer && this.skeletonSensitivitySliderContainer.parentNode && this.skeletonSensitivitySliderContainer.parentNode.removeChild(this.skeletonSensitivitySliderContainer), this.skeletonSensitivitySlider = null, this.skeletonSensitivitySliderContainer = null, this.canvas = null, this.ctx = null, this.video = null, this.drawWidth = 0, this.drawHeight = 0, this.offsetX = 0, this.offsetY = 0, this.videoAspect = 0, this.videoWidth = 0, this.videoHeight = 0, this.videoWidthInv = 0, this.videoHeightInv = 0, this.canvasWidth = 0, this.canvasHeight = 0, this.faceDataLines.length = 0, this.sortedExpressions.length = 0, this.exprStringParts.length = 0, this.lastKnownFaces.length = 0;
  }
}
export {
  O as CamVis
};
