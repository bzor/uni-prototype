// Realtime visualizer of mic input

export class MicVis {
	constructor() {
		this.canvas = null;
		this.ctx = null;
		this.analyser = null;
		this.audioSource = null;
		this.dataArray = null;
		this.dataArrayHistory = null;
		this.animationFrameId = null;
		this.isVisualizing = false;
		this.resizeObserver = null;
		this.lastTime = 0;
		this.fftSize = 32;
		this.historyLength = 64;
	}

	resizeCanvas() {
		if (!this.canvas || !this.container) return;
		const rect = this.container.getBoundingClientRect();
		this.canvas.width = rect.width || 800;
		this.canvas.height = rect.height || 500;
		this.canvasCenter = { x: this.canvas.width * 0.5, y: this.canvas.height * 0.5 };
	}

	init(config) {
		if (!config.mic) {
			console.log("MicVis error: must pass mic reference");
			return;
		}

		if (!config.container) {
			console.log("MicVis error: must pass container DOM element");
			return;
		}

		this.mic = config.mic;
		this.container = config.container;

		// Create canvas element
		this.canvas = document.createElement('canvas');
		this.canvas.style.width = '100%';
		this.canvas.style.height = '100%';
		this.canvas.style.display = 'block';
		this.container.appendChild(this.canvas);
		this.ctx = this.canvas.getContext('2d');
		this.resizeCanvas();

		// Handle window resize
		this.resizeObserver = new ResizeObserver(() => {
			this.resizeCanvas();
		});
		this.resizeObserver.observe(this.container);

		// Wait for mic to be ready, then set up audio analysis
		this.setupAudioAnalysis();
	}

	setupAudioAnalysis() {
		// Check if mic has AudioContext and MediaStream ready
		const checkReady = () => {
			if (this.mic.inputAudioContext && this.mic.mediaStream && this.mic.inputAudioContext.state !== 'closed') {
				this.connectAudioAnalysis();
			} else {
				// Wait a bit and check again
				setTimeout(checkReady, 100);
			}
		};
		checkReady();
	}

	connectAudioAnalysis() {
		try {
			const audioContext = this.mic.inputAudioContext;
			const mediaStream = this.mic.mediaStream;

			// Create analyser node
			this.analyser = audioContext.createAnalyser();
			this.analyser.fftSize = this.fftSize;
			this.analyser.smoothingTimeConstant = 0.5;

			const bufferLength = this.analyser.frequencyBinCount;
			console.log("fft buffer length: " + this.analyser.frequencyBinCount);
			this.dataArray = new Uint8Array(bufferLength);
			this.dataArrayHistory = new Uint8Array(bufferLength * this.historyLength);

			// Create a new source from the media stream (doesn't interfere with existing processing)
			this.audioSource = audioContext.createMediaStreamSource(mediaStream);
			this.audioSource.connect(this.analyser);

			// Start visualization loop
			this.startVisualization();
		} catch (error) {
			console.error('[MicVis] Error setting up audio analysis:', error);
		}
	}

	startVisualization() {
		if (this.isVisualizing) return;
		this.isVisualizing = true;
		this.draw(0);
	}

	stopVisualization() {
		this.isVisualizing = false;
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}
	}

	draw(time) {
		if (!this.isVisualizing || !this.analyser || !this.ctx) return;

		const deltaTime = Math.min((time - this.lastTime) * 0.001, 0.1);
		this.lastTime = time;

		this.animationFrameId = requestAnimationFrame((time) => this.draw(time));

		//fill frequency buffer
		this.analyser.getByteFrequencyData(this.dataArray);

		this.ctx.fillStyle = '#1a1a1a';
		this.ctx.globalCompositeOperation = "source-over";
		this.ctx.globalAlpha = 1.0;
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		this.ctx.globalAlpha = 0.5;
		this.ctx.globalCompositeOperation = "overlay";

		/*
		const average = this.dataArray.reduce((a, b) => a + b, 0) / this.dataArray.length;
		const volumeHeight = average * this.canvas.height * 0.005;
		const hue = 0;
		this.ctx.fillRect(this.canvasCenter.x, this.canvasCenter.y, 5, volumeHeight);
		*/

		const outerBorder = 6;
		const barXSpacer = 8;
		const barCountX = this.historyLength;
		const barCountY = this.dataArray.length;
		const visHeight = this.canvas.height * 0.5 - outerBorder * 2.0;

		for (let i = 0; i < barCountY; i++) {
			const ty = i / (barCountY - 1);

			for (let j = 0; j < barCountX; j++) {
				const tx = j / (barCountX - 1);
				const yMax = ty * visHeight * this.easeInOutSine(1.0 - tx);
				const data = (this.dataArrayHistory[i + j * this.dataArray.length] / 255);

				let x = barXSpacer + this.canvasCenter.x + j * barXSpacer;
				let y = this.canvasCenter.y + yMax;
				const w = data * barXSpacer * 2.0;
				const h = data * barXSpacer * 4.0;
				const hw = w * 0.5;
				const hh = h * 0.5;

				this.ctx.fillStyle = this.heatMapColor(ty);
				this.ctx.fillRect(x - hw, y - hh, w, h);

				y = this.canvasCenter.y - yMax;
				this.ctx.fillRect(x - hw, y - hh, w, h);

				x = this.canvasCenter.x - j * barXSpacer;
				this.ctx.fillRect(x - hw, y - hh, w, h);

				x = this.canvasCenter.x - j * barXSpacer;
				y = this.canvasCenter.y + yMax;
				this.ctx.fillRect(x - hw, y - hh, w, h);
			}

		}

		//
		const l = this.dataArrayHistory.length - this.dataArray.length;
		for (let i = l; i >= 0; --i) {
			this.dataArrayHistory[i + this.dataArray.length] = this.dataArrayHistory[i];
		}
		for (let i = 0; i < this.dataArray.length; i++) {
			this.dataArrayHistory[i] = this.dataArray[i];
		}

		// Draw overall volume indicator at top
		/*
		const average = this.dataArray.reduce((a, b) => a + b, 0) / this.dataArray.length;
		const volumeHeight = (average / 255) * this.canvas.height * 0.1;
		this.ctx.fillStyle = 'rgba(255, 255, 255, 1)';
		this.ctx.fillRect(0, 0, this.canvas.width, volumeHeight);
		*/
	}

	easeInOutSine(t) {
		return ((Math.cos(Math.PI * t) - 1) / 2);
	}

	heatMapColor(t) {
		// t: 0.0 -> light yellow (almost white), 0.5 -> red, 1.0 -> blue
		let r, g, b;
		
		if (t < 0.5) {
			// Interpolate from light yellow (255, 255, 240) to red (255, 0, 0)
			const localT = t * 2.0; // 0 to 1 in this segment
			r = 255;
			g = Math.floor(255 * (1.0 - localT));
			b = Math.floor(240 * (1.0 - localT));
		} else {
			// Interpolate from red (255, 0, 0) to blue (0, 0, 255)
			const localT = (t - 0.5) * 2.0; // 0 to 1 in this segment
			r = Math.floor(255 * (1.0 - localT));
			g = 0;
			b = Math.floor(255 * localT);
		}
		
		return `rgb(${r}, ${g}, ${b})`;
	}

	disconnect() {
		this.stopVisualization();

		if (this.resizeObserver) {
			this.resizeObserver.disconnect();
			this.resizeObserver = null;
		}

		if (this.audioSource) {
			this.audioSource.disconnect();
			this.audioSource = null;
		}

		if (this.analyser) {
			this.analyser.disconnect();
			this.analyser = null;
		}

		if (this.canvas && this.container && this.canvas.parentNode === this.container) {
			this.container.removeChild(this.canvas);
		}

		this.canvas = null;
		this.ctx = null;
		this.dataArray = null;
	}
}