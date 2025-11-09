// Kinetic visualizer module

export class KineticVis {
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
		this.patternOptions = ["IDLE", "HAPPY_BOUNCE", "SLOW_SWAY", "JIGGLE"];
		this.pattern = "IDLE";
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
			console.log("KineticVis error: must pass container DOM element");
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

		const baseCenterX = canvasWidth * 0.5;
		const baseCenterY = canvasHeight * 0.5;
		const baseRadiusX = Math.min(canvasWidth, canvasHeight) * 0.15;
		const baseRadiusY = baseRadiusX * 1.5; // Tall ellipse
		const time = Date.now() * 0.001;

		// Route to pattern-specific drawing function
		switch (this.pattern) {
			case "IDLE":
				this.drawIdle(baseCenterX, baseCenterY, baseRadiusX, baseRadiusY, time);
				break;
			case "HAPPY_BOUNCE":
				this.drawHappyBounce(baseCenterX, baseCenterY, baseRadiusX, baseRadiusY, time);
				break;
			case "SLOW_SWAY":
				this.drawSlowSway(baseCenterX, baseCenterY, baseRadiusX, baseRadiusY, time);
				break;
			case "JIGGLE":
				this.drawJiggle(baseCenterX, baseCenterY, baseRadiusX, baseRadiusY, time);
				break;
			default:
				this.drawIdle(baseCenterX, baseCenterY, baseRadiusX, baseRadiusY, time);
		}
	}

	drawIdle(centerX, centerY, radiusX, radiusY, time) {
		// Static ellipse with minimal movement
		this.ctx.fillStyle = 'rgba(100, 150, 200, 0.8)';
		this.ctx.strokeStyle = 'rgba(50, 100, 150, 0.9)';
		this.ctx.lineWidth = 2;

		this.ctx.beginPath();
		this.ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, this.TWO_PI);
		this.ctx.fill();
		//this.ctx.stroke();
	}

	drawHappyBounce(centerX, centerY, radiusX, radiusY, time) {
		// Bouncing up and down with elastic effect
		const bounce = Math.abs(Math.sin(time * 2));
		const elasticBounce = Math.pow(bounce, 0.7); // Ease-out effect
		const bounceOffset = -elasticBounce * (radiusY * 0.3);
		
		const y = centerY + bounceOffset;
		
		// Slight squash when hitting bottom
		const squash = 1 - (bounce * 0.2);
		const stretchY = 1 + (bounce * 0.1);
		
		this.ctx.fillStyle = 'rgba(100, 200, 150, 0.8)';
		this.ctx.strokeStyle = 'rgba(50, 150, 100, 0.9)';
		this.ctx.lineWidth = 2;

		this.ctx.beginPath();
		this.ctx.ellipse(centerX, y, radiusX * squash, radiusY * stretchY, 0, 0, this.TWO_PI);
		this.ctx.fill();
	}

	drawSlowSway(centerX, centerY, radiusX, radiusY, time) {
		// Slow side-to-side swaying motion
		const sway = Math.sin(time * 0.8);
		const swayAmount = radiusX * 0.4;
		const x = centerX + sway * swayAmount;
		
		// Slight rotation based on sway
		const rotation = sway * 0.2;

		this.ctx.fillStyle = 'rgba(150, 150, 200, 0.8)';
		this.ctx.strokeStyle = 'rgba(100, 100, 150, 0.9)';
		this.ctx.lineWidth = 2;

		this.ctx.beginPath();
		this.ctx.ellipse(x, centerY, radiusX, radiusY, rotation, 0, this.TWO_PI);
		this.ctx.fill();
	}

	drawJiggle(centerX, centerY, radiusX, radiusY, time) {
		// Fast, chaotic jiggling motion
		const jiggleX = (Math.sin(time * 8) + Math.sin(time * 11) * 0.5) * radiusX * 0.15;
		const jiggleY = (Math.cos(time * 7) + Math.cos(time * 13) * 0.5) * radiusY * 0.15;
		const jiggleRot = (Math.sin(time * 9) + Math.sin(time * 12) * 0.3) * 0.3;
		
		const x = centerX + jiggleX;
		const y = centerY + jiggleY;
		
		// Slight size variation
		const sizeVariation = 1 + Math.sin(time * 10) * 0.1;

		this.ctx.fillStyle = 'rgba(200, 150, 100, 0.8)';
		this.ctx.strokeStyle = 'rgba(150, 100, 50, 0.9)';
		this.ctx.lineWidth = 2;

		this.ctx.beginPath();
		this.ctx.ellipse(x, y, radiusX * sizeVariation, radiusY * sizeVariation, jiggleRot, 0, this.TWO_PI);
		this.ctx.fill();
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

	setPattern(pattern) {
		if (pattern !== undefined && this.patternOptions.includes(pattern)) {
			this.pattern = pattern;
		}
	}
}

