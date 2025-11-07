// Lighting visualizer module

export class LightingVis {
	constructor() {
		this.canvas = null;
		this.ctx = null;
		this.container = null;
		this.isVisualizing = false;
		this.resizeObserver = null;
		this.animationFrameId = null;
		
		// Cached canvas dimensions (recalculated on resize)
		this.canvasWidth = 0;
		this.canvasHeight = 0;
		
		// Constants
		this.TWO_PI = Math.PI * 2;
		this.bgFillStyle = '#dadfe0';
	}

	resizeCanvas() {
		if (!this.canvas || !this.container) return;
		const rect = this.container.getBoundingClientRect();
		this.canvas.width = rect.width || 800;
		this.canvas.height = rect.height || 500;
		this.canvasWidth = this.canvas.width;
		this.canvasHeight = this.canvas.height;
	}

	init(config) {
		if (!config.container) {
			console.log("LightingVis error: must pass container DOM element");
			return;
		}

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

		// Start drawing loop
		this.startDrawing();
	}

	startDrawing() {
		if (this.isVisualizing) return;
		this.isVisualizing = true;
		const drawLoop = () => {
			if (!this.isVisualizing) return;
			this.draw();
			this.animationFrameId = requestAnimationFrame(drawLoop);
		};
		drawLoop();
	}

	draw() {
		if (!this.ctx || !this.canvas) return;

		const canvasWidth = this.canvasWidth;
		const canvasHeight = this.canvasHeight;

		// Clear canvas
		this.ctx.fillStyle = this.bgFillStyle;
		this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);

		// Draw 32x32 grid of circles in a square (5/6 of canvas height)
		const gridSize = 32;
		const gridSide = canvasHeight * 0.9;
		const cellSize = gridSide / gridSize;
		const offsetX = (canvasWidth - gridSide) * 0.5;
		const offsetY = (canvasHeight - gridSide) * 0.5;
		const time = Date.now() * 0.001; // Time in seconds
		
		for (let row = 0; row < gridSize; row++) {
			for (let col = 0; col < gridSize; col++) {
				const x = offsetX + (col + 0.5) * cellSize;
				const y = offsetY + (row + 0.5) * cellSize;
				
				// Animate radius based on position and time
				const radius = (cellSize * 0.3) + 
					Math.sin(time + row * 0.1 + col * 0.1) * (cellSize * 0.1);
				
				// Vary color based on position
				const hue = (row + col + time * 10) % 360;
				this.ctx.fillStyle = `hsla(${hue}, 70%, 60%, 0.7)`;
				
				this.ctx.beginPath();
				this.ctx.arc(x, y, radius, 0, this.TWO_PI);
				this.ctx.fill();
			}
		}
	}

	disconnect() {
		this.isVisualizing = false;

		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}

		if (this.resizeObserver) {
			this.resizeObserver.disconnect();
			this.resizeObserver = null;
		}

		if (this.canvas && this.container && this.canvas.parentNode === this.container) {
			this.container.removeChild(this.canvas);
		}

		this.canvas = null;
		this.ctx = null;
		this.canvasWidth = 0;
		this.canvasHeight = 0;
	}
}

