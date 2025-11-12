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
		this.bgFillStyle = '#1a1a1a';
		this.patternOptions = ["IDLE", "HAPPY_BOUNCE", "SLOW_SWAY", "JIGGLE"];
		this.pattern = "IDLE";
		this.targetPattern = "IDLE";
		
		// Interpolation state
		this.interpolationProgress = 1.0; // 0 = current, 1 = target
		this.interpolationSpeed = 2.0; // units per second
		this.lastFrameTime = null;
		
		// Colors array (will be set in init)
		this.colors = null;
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

		// Set colors array (fillColor, strokeColor for each pattern)
		this.colors = config.colors || [
			{ fill: '#3846ff', stroke: '#3846ff' }, // IDLE
			{ fill: 'rgba(100, 200, 150, 0.8)', stroke: 'rgba(50, 150, 100, 0.9)' }, // HAPPY_BOUNCE
			{ fill: '#f275c5', stroke: '#f275c5' }, // SLOW_SWAY
			{ fill: '#fda834', stroke: 'rgba(150, 100, 50, 0.9)' }  // JIGGLE
		];

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
		this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);

		const baseCenterX = canvasWidth * 0.5;
		const baseCenterY = canvasHeight * 0.5;
		const baseRadiusX = Math.min(canvasWidth, canvasHeight) * 0.15;
		const baseRadiusY = baseRadiusX * 1.5; // Tall ellipse
		const time = Date.now() * 0.001;

		// Update interpolation progress with actual frame timing
		const currentTime = performance.now() * 0.001;
		if (this.lastFrameTime === null) {
			this.lastFrameTime = currentTime;
		}
		const deltaTime = currentTime - this.lastFrameTime;
		this.lastFrameTime = currentTime;

		if (this.pattern !== this.targetPattern) {
			this.interpolationProgress += this.interpolationSpeed * deltaTime;
			if (this.interpolationProgress >= 1.0) {
				this.interpolationProgress = 1.0;
				this.pattern = this.targetPattern;
			}
		}

		// Calculate states for all patterns
		const currentState = this.getPatternState(this.pattern, baseCenterX, baseCenterY, baseRadiusX, baseRadiusY, time);
		const targetState = this.getPatternState(this.targetPattern, baseCenterX, baseCenterY, baseRadiusX, baseRadiusY, time);

		// Interpolate between states
		const t = this.interpolationProgress;
		const state = this.interpolateStates(currentState, targetState, t);

		// Draw interpolated state
		this.drawState(state);
	}

	getPatternState(pattern, centerX, centerY, radiusX, radiusY, time) {
		const patternIndex = this.patternOptions.indexOf(pattern);
		const color = this.colors && this.colors[patternIndex] 
			? this.colors[patternIndex] 
			: { fill: 'rgba(100, 150, 200, 0.8)', stroke: 'rgba(50, 100, 150, 0.9)' };

		switch (pattern) {
			case "IDLE":
				return {
					x: centerX,
					y: centerY,
					radiusX: radiusX,
					radiusY: radiusY,
					rotation: 0,
					fillColor: color.fill,
					strokeColor: color.stroke
				};
			case "HAPPY_BOUNCE":
				const bounce = Math.abs(Math.sin(time * 2));
				const elasticBounce = Math.pow(bounce, 0.7);
				const bounceOffset = -elasticBounce * (radiusY * 0.3);
				const squash = 1 - (bounce * 0.2);
				const stretchY = 1 + (bounce * 0.1);
				return {
					x: centerX,
					y: centerY + bounceOffset,
					radiusX: radiusX * squash,
					radiusY: radiusY * stretchY,
					rotation: 0,
					fillColor: color.fill,
					strokeColor: color.stroke
				};
			case "SLOW_SWAY":
				const sway = Math.sin(time * 0.8);
				const swayAmount = radiusX * 0.4;
				const rotation = sway * 0.2;
				return {
					x: centerX + sway * swayAmount,
					y: centerY,
					radiusX: radiusX,
					radiusY: radiusY,
					rotation: rotation,
					fillColor: color.fill,
					strokeColor: color.stroke
				};
			case "JIGGLE":
				const timeMult = 0.4;
				const jiggleX = (Math.sin(time * 8 * timeMult) + Math.sin(time * 11 * timeMult) * 0.5) * radiusX * 0.15;
				const jiggleY = (Math.cos(time * 7 * timeMult) + Math.cos(time * 13 * timeMult) * 0.5) * radiusY * 0.15;
				const jiggleRot = (Math.sin(time * 9 * timeMult) + Math.sin(time * 12 * timeMult) * 0.3) * 0.3;
				const sizeVariation = 1 + Math.sin(time * 10) * 0.1;
				return {
					x: centerX + jiggleX,
					y: centerY + jiggleY,
					radiusX: radiusX * sizeVariation,
					radiusY: radiusY * sizeVariation,
					rotation: jiggleRot,
					fillColor: color.fill,
					strokeColor: color.stroke
				};
			default:
				return {
					x: centerX,
					y: centerY,
					radiusX: radiusX,
					radiusY: radiusY,
					rotation: 0,
					fillColor: color.fill,
					strokeColor: color.stroke
				};
		}
	}

	parseColor(colorString) {
		// Try rgba/rgb format first
		const rgbaMatch = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
		if (rgbaMatch) {
			return {
				r: parseInt(rgbaMatch[1]),
				g: parseInt(rgbaMatch[2]),
				b: parseInt(rgbaMatch[3]),
				a: parseFloat(rgbaMatch[4] || '1.0')
			};
		}
		
		// Try hex format (#RGB or #RRGGBB)
		const hexMatch = colorString.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
		if (hexMatch) {
			let hex = hexMatch[1];
			// Expand short hex (#RGB -> #RRGGBB)
			if (hex.length === 3) {
				hex = hex.split('').map(c => c + c).join('');
			}
			return {
				r: parseInt(hex.substring(0, 2), 16),
				g: parseInt(hex.substring(2, 4), 16),
				b: parseInt(hex.substring(4, 6), 16),
				a: 1.0
			};
		}
		
		// Default fallback
		return { r: 100, g: 150, b: 200, a: 0.8 };
	}

	interpolateRgba(color1, color2, t) {
		const c1 = this.parseColor(color1);
		const c2 = this.parseColor(color2);
		return `rgba(${Math.round(c1.r + (c2.r - c1.r) * t)}, ${Math.round(c1.g + (c2.g - c1.g) * t)}, ${Math.round(c1.b + (c2.b - c1.b) * t)}, ${c1.a + (c2.a - c1.a) * t})`;
	}

	interpolateStates(state1, state2, t) {
		return {
			x: state1.x + (state2.x - state1.x) * t,
			y: state1.y + (state2.y - state1.y) * t,
			radiusX: state1.radiusX + (state2.radiusX - state1.radiusX) * t,
			radiusY: state1.radiusY + (state2.radiusY - state1.radiusY) * t,
			rotation: state1.rotation + (state2.rotation - state1.rotation) * t,
			fillColor: this.interpolateRgba(state1.fillColor, state2.fillColor, t),
			strokeColor: this.interpolateRgba(state1.strokeColor, state2.strokeColor, t)
		};
	}

	drawState(state) {
		this.ctx.fillStyle = state.fillColor;
		this.ctx.strokeStyle = state.strokeColor;
		this.ctx.lineWidth = 2;

		this.ctx.globalAlpha = 1.0;
		this.ctx.beginPath();
		this.ctx.ellipse(state.x, state.y, state.radiusX, state.radiusY, state.rotation, 0, this.TWO_PI);
		this.ctx.fill();
		this.ctx.globalAlpha = 0.6;
		this.ctx.beginPath();
		this.ctx.ellipse(state.x, state.y, state.radiusX * 1.1, state.radiusY * 1.1, state.rotation, 0, this.TWO_PI);
		this.ctx.stroke();
		this.ctx.globalAlpha = 0.1;
		this.ctx.beginPath();
		this.ctx.ellipse(state.x, state.y, state.radiusX * 1.2, state.radiusY * 1.2, state.rotation, 0, this.TWO_PI);
		this.ctx.stroke();
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
		this.lastFrameTime = null;
	}

	setPattern(pattern) {
		if (pattern !== undefined && this.patternOptions.includes(pattern)) {
			if (this.targetPattern !== pattern) {
				// Reset interpolation when changing to a new pattern
				this.interpolationProgress = 0.0;
				this.targetPattern = pattern;
			}
		}
	}
}

