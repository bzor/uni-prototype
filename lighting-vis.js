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
		this.patternOptions = ["IDLE", "SMOOTH_WAVES", "CIRCULSAR_PULSE", "HECTIC_NOISE"];
		//-1 to 1
		this.speed = 0.4;
		this.color = 0xff00ff;
		this.pattern = "IDLE";
		
		// Transition state
		this.transitionDuration = 1000; // milliseconds
		this.transitionStartTime = null;
		this.prevColor = this.color;
		this.prevPattern = this.pattern;
		this.prevSpeed = this.speed;
		this.isTransitioning = false;
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
		
		// Check if we're transitioning
		let transitionProgress = 0;
		if (this.isTransitioning && this.transitionStartTime !== null) {
			const elapsed = Date.now() - this.transitionStartTime;
			transitionProgress = Math.min(1, elapsed / this.transitionDuration);
			
			// Ease-in-out function for smooth transition
			transitionProgress = transitionProgress < 0.5
				? 2 * transitionProgress * transitionProgress
				: 1 - Math.pow(-2 * transitionProgress + 2, 2) / 2;
			
			if (transitionProgress >= 1) {
				this.isTransitioning = false;
				this.transitionStartTime = null;
			}
		}
		
		// Keep speed constant during transition to avoid frequency jumps
		// Only apply new speed after transition completes
		const currentSpeed = this.isTransitioning ? this.prevSpeed : this.speed;
		const time = Date.now() * 0.001 * currentSpeed;
		
		// Interpolate color
		const prevR = (this.prevColor >> 16) & 0xff;
		const prevG = (this.prevColor >> 8) & 0xff;
		const prevB = this.prevColor & 0xff;
		const currR = (this.color >> 16) & 0xff;
		const currG = (this.color >> 8) & 0xff;
		const currB = this.color & 0xff;
		
		const r = this.isTransitioning
			? Math.round(prevR + (currR - prevR) * transitionProgress)
			: currR;
		const g = this.isTransitioning
			? Math.round(prevG + (currG - prevG) * transitionProgress)
			: currG;
		const b = this.isTransitioning
			? Math.round(prevB + (currB - prevB) * transitionProgress)
			: currB;
		
		// Handle pattern transition by blending between patterns
		if (this.isTransitioning && this.prevPattern !== this.pattern) {
			this.drawPatternBlend(
				this.prevPattern, this.pattern,
				prevR, prevG, prevB, currR, currG, currB,
				gridSize, cellSize, offsetX, offsetY, time,
				transitionProgress
			);
		} else {
			// Route to pattern-specific drawing function
			switch (this.pattern) {
				case "IDLE":
					this.drawIdle(r, g, b, gridSize, cellSize, offsetX, offsetY, time);
					break;
				case "SMOOTH_WAVES":
					this.drawSmoothWaves(r, g, b, gridSize, cellSize, offsetX, offsetY, time);
					break;
				case "CIRCULSAR_PULSE":
					this.drawCircularPulse(r, g, b, gridSize, cellSize, offsetX, offsetY, time);
					break;
				case "HECTIC_NOISE":
					this.drawHecticNoise(r, g, b, gridSize, cellSize, offsetX, offsetY, time);
					break;
				default:
					this.drawIdle(r, g, b, gridSize, cellSize, offsetX, offsetY, time);
			}
		}
	}
	
	drawPatternBlend(prevPattern, currPattern, prevR, prevG, prevB, currR, currG, currB,
		gridSize, cellSize, offsetX, offsetY, time, blendFactor) {
		// Draw both patterns and blend them
		// Use a temporary canvas or draw with adjusted alpha
		// For simplicity, we'll draw the old pattern with reduced alpha, then the new pattern
		
		// Draw previous pattern with fade-out
		const prevAlpha = 1 - blendFactor;
		if (prevAlpha > 0.01) {
			this.ctx.globalAlpha = prevAlpha;
			switch (prevPattern) {
				case "IDLE":
					this.drawIdle(prevR, prevG, prevB, gridSize, cellSize, offsetX, offsetY, time);
					break;
				case "SMOOTH_WAVES":
					this.drawSmoothWaves(prevR, prevG, prevB, gridSize, cellSize, offsetX, offsetY, time);
					break;
				case "CIRCULSAR_PULSE":
					this.drawCircularPulse(prevR, prevG, prevB, gridSize, cellSize, offsetX, offsetY, time);
					break;
				case "HECTIC_NOISE":
					this.drawHecticNoise(prevR, prevG, prevB, gridSize, cellSize, offsetX, offsetY, time);
					break;
			}
		}
		
		// Draw current pattern with fade-in
		const currAlpha = blendFactor;
		if (currAlpha > 0.01) {
			this.ctx.globalAlpha = currAlpha;
			switch (currPattern) {
				case "IDLE":
					this.drawIdle(currR, currG, currB, gridSize, cellSize, offsetX, offsetY, time);
					break;
				case "SMOOTH_WAVES":
					this.drawSmoothWaves(currR, currG, currB, gridSize, cellSize, offsetX, offsetY, time);
					break;
				case "CIRCULSAR_PULSE":
					this.drawCircularPulse(currR, currG, currB, gridSize, cellSize, offsetX, offsetY, time);
					break;
				case "HECTIC_NOISE":
					this.drawHecticNoise(currR, currG, currB, gridSize, cellSize, offsetX, offsetY, time);
					break;
			}
		}
		
		// Reset global alpha
		this.ctx.globalAlpha = 1.0;
	}

	drawIdle(r, g, b, gridSize, cellSize, offsetX, offsetY, time) {
		// Static or minimal animation - just shows the color with slight breathing
		for (let row = 0; row < gridSize; row++) {
			for (let col = 0; col < gridSize; col++) {
				const x = offsetX + (col + 0.5) * cellSize;
				const y = offsetY + (row + 0.5) * cellSize;
				
				// Very subtle animation - slow breathing effect
				const radius = cellSize * 0.35;
				const alpha = 0.6 + Math.sin(time * 0.3) * 0.1;
				
				this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
				this.ctx.beginPath();
				this.ctx.arc(x, y, radius, 0, this.TWO_PI);
				this.ctx.fill();
			}
		}
	}

	drawSmoothWaves(r, g, b, gridSize, cellSize, offsetX, offsetY, time) {
		// Smooth wave patterns propagating across the grid
		for (let row = 0; row < gridSize; row++) {
			for (let col = 0; col < gridSize; col++) {
				const x = offsetX + (col + 0.5) * cellSize;
				const y = offsetY + (row + 0.5) * cellSize;
				
				// Create smooth wave patterns using sine waves
				const wave1 = Math.sin(time * 2 + col * 0.2);
				const wave2 = Math.sin(time * 1.5 + row * 0.2);
				const wave3 = Math.sin(time * 1.8 + (row + col) * 0.15);
				
				// Combine waves for smooth, flowing effect
				const waveValue = (wave1 + wave2 + wave3) / 3;
				
				const radius = Math.max(0.1, (cellSize * 0.25) + waveValue * (cellSize * 0.15));
				const alpha = 0.5 + waveValue * 0.4;
				
				this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
				this.ctx.beginPath();
				this.ctx.arc(x, y, radius, 0, this.TWO_PI);
				this.ctx.fill();
			}
		}
	}

	drawCircularPulse(r, g, b, gridSize, cellSize, offsetX, offsetY, time) {
		// Pulses radiating from the center in circular patterns
		const centerX = gridSize * 0.5;
		const centerY = gridSize * 0.5;
		
		for (let row = 0; row < gridSize; row++) {
			for (let col = 0; col < gridSize; col++) {
				const x = offsetX + (col + 0.5) * cellSize;
				const y = offsetY + (row + 0.5) * cellSize;
				
				// Calculate distance from center
				const dx = col - centerX;
				const dy = row - centerY;
				const dist = Math.sqrt(dx * dx + dy * dy);
				
				// Create circular pulse waves
				const pulse = Math.sin(time * 3 - dist * 0.3);
				const pulse2 = Math.sin(time * 2.5 - dist * 0.25);
				
				// Combine pulses for richer effect
				const pulseValue = (pulse + pulse2) / 2;
				
				const radius = Math.max(0.1, (cellSize * 0.2) + pulseValue * (cellSize * 0.2));
				const alpha = 0.4 + pulseValue * 0.5;
				
				this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
				this.ctx.beginPath();
				this.ctx.arc(x, y, radius, 0, this.TWO_PI);
				this.ctx.fill();
			}
		}
	}

	drawHecticNoise(r, g, b, gridSize, cellSize, offsetX, offsetY, time) {
		// Chaotic, noisy, random-looking patterns
		for (let row = 0; row < gridSize; row++) {
			for (let col = 0; col < gridSize; col++) {
				const x = offsetX + (col + 0.5) * cellSize;
				const y = offsetY + (row + 0.5) * cellSize;
				
				// Create chaotic noise using multiple sine waves with different frequencies
				const noise1 = Math.sin(time * 5 + row * 0.7 + col * 0.3);
				const noise2 = Math.sin(time * 7 + row * 0.4 + col * 0.8);
				const noise3 = Math.sin(time * 11 + row * 0.9 + col * 0.2);
				const noise4 = Math.sin(time * 13 + row * 0.3 + col * 0.6);
				
				// Combine with some randomness based on position
				const posHash = (row * 17 + col * 23) % 100 / 100;
				const noiseValue = (noise1 + noise2 * 0.7 + noise3 * 0.5 + noise4 * 0.3) / 2.5;
				const chaoticValue = noiseValue + (posHash - 0.5) * 0.3;
				
				const radius = Math.max(0.1, (cellSize * 0.2) + chaoticValue * (cellSize * 0.25));
				const alpha = 0.3 + Math.abs(chaoticValue) * 0.6;
				
				this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
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

	setAnimation(color, pattern, speed) {
		// Store previous values for transition
		if (color !== undefined && color !== this.color) {
			this.prevColor = this.color;
			this.color = color;
			this.isTransitioning = true;
		}
		if (pattern !== undefined && pattern !== this.pattern) {
			this.prevPattern = this.pattern;
			this.pattern = pattern;
			this.isTransitioning = true;
		}
		// Speed changes are applied immediately after visual transition completes
		// Store it but don't trigger visual transition
		if (speed !== undefined && speed !== this.speed) {
			this.prevSpeed = this.speed;
			this.speed = speed;
			// Only start transition if we don't already have one for color/pattern
			if (!this.isTransitioning) {
				this.isTransitioning = true;
			}
		}
		
		// Start transition timer
		if (this.isTransitioning) {
			this.transitionStartTime = Date.now();
		}
	}
}

