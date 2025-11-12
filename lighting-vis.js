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
		this.bgFillStyle = '#1a1a1a';
		this.patternOptions = ["IDLE", "SMOOTH_WAVES", "CIRCULSAR_PULSE", "HECTIC_NOISE"];
		
		// Current displayed state (what's actually shown)
		this.currentSpeed = 0.4;
		this.currentColor = 0xcdcdcd;
		this.currentPattern = "IDLE";
		
		// Target state (what we're transitioning to)
		this.targetSpeed = 0.4;
		this.targetColor = 0xcdcdcd;
		this.targetPattern = "IDLE";
		
		// Transition state - blend factor smoothly moves from 0 to 1
		this.transitionDuration = 1000; // milliseconds
		this.transitionStartTime = null;
		this.blendFactor = 0; // 0 = current, 1 = target
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
		this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);

		// Draw 16x16 grid of circles in a square (5/6 of canvas height)
		const gridSize = 16;
		const gridSide = canvasHeight * 0.9;
		const cellSize = gridSide / gridSize;
		const offsetX = (canvasWidth - gridSide) * 0.5;
		const offsetY = (canvasHeight - gridSide) * 0.5;
		
		// Update blend factor smoothly
		if (this.transitionStartTime !== null) {
			const elapsed = Date.now() - this.transitionStartTime;
			let rawProgress = Math.min(1, elapsed / this.transitionDuration);
			
			// Ease-in-out function for smooth transition
			rawProgress = rawProgress < 0.5
				? 2 * rawProgress * rawProgress
				: 1 - Math.pow(-2 * rawProgress + 2, 2) / 2;
			
			this.blendFactor = rawProgress;
			
			// When transition completes, snap current to target and reset
			if (rawProgress >= 1) {
				this.currentSpeed = this.targetSpeed;
				this.currentColor = this.targetColor;
				this.currentPattern = this.targetPattern;
				this.blendFactor = 0;
				this.transitionStartTime = null;
			}
		}
		
		// Calculate time for both current and target states
		// Both patterns run continuously, we just blend their outputs
		const now = Date.now() * 0.001;
		const currentTime = now * this.currentSpeed;
		const targetTime = now * this.targetSpeed;
		
		// Always blend between current and target states
		// Both patterns are always running, we just interpolate their outputs
		this.drawBlendedPatterns(
			this.currentPattern, this.targetPattern,
			this.currentColor, this.targetColor,
			currentTime, targetTime,
			gridSize, cellSize, offsetX, offsetY,
			this.blendFactor
		);
	}
	
	drawBlendedPatterns(currentPattern, targetPattern, currentColor, targetColor,
		currentTime, targetTime, gridSize, cellSize, offsetX, offsetY, blendFactor) {
		// Both patterns run continuously with their own time values
		// We blend their outputs smoothly - no phase discontinuities
		
		// Extract color components
		const currR = (currentColor >> 16) & 0xff;
		const currG = (currentColor >> 8) & 0xff;
		const currB = currentColor & 0xff;
		const targR = (targetColor >> 16) & 0xff;
		const targG = (targetColor >> 8) & 0xff;
		const targB = targetColor & 0xff;
		
		// Interpolate color
		const r = Math.round(currR + (targR - currR) * blendFactor);
		const g = Math.round(currG + (targG - currG) * blendFactor);
		const b = Math.round(currB + (targB - currB) * blendFactor);
		
		// Calculate visual properties for both patterns and interpolate
		const centerX = gridSize * 0.5;
		const centerY = gridSize * 0.5;
		
		for (let row = 0; row < gridSize; row++) {
			for (let col = 0; col < gridSize; col++) {
				const x = offsetX + (col + 0.5) * cellSize;
				const y = offsetY + (row + 0.5) * cellSize;
				
				// Calculate values for current pattern (using currentTime)
				const currentValues = this.calculatePatternValues(
					currentPattern, row, col, centerX, centerY, cellSize, currentTime
				);
				
				// Calculate values for target pattern (using targetTime)
				const targetValues = this.calculatePatternValues(
					targetPattern, row, col, centerX, centerY, cellSize, targetTime
				);
				
				// Interpolate radius and alpha
				const radius = currentValues.radius + (targetValues.radius - currentValues.radius) * blendFactor;
				const alpha = currentValues.alpha + (targetValues.alpha - currentValues.alpha) * blendFactor;
				
				// Draw with interpolated values
				this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
				this.ctx.beginPath();
				this.ctx.arc(x, y, radius, 0, this.TWO_PI);
				this.ctx.fill();
			}
		}
	}
	
	calculatePatternValues(pattern, row, col, centerX, centerY, cellSize, time) {
		// Calculate radius and alpha for a specific pattern at a specific time
		let radius = 0;
		let alpha = 0;
		
		switch (pattern) {
			case "IDLE": {
				radius = cellSize * 0.3 + Math.sin(time * 1.2) * 0.2;
				alpha = 0.6 + Math.sin(time * 0.3) * 0.1;
				break;
			}
			case "SMOOTH_WAVES": {
				const wave1 = Math.sin(time * 2 + col * 0.2);
				const wave2 = Math.sin(time * 1.5 + row * 0.2);
				const wave3 = Math.sin(time * 1.8 + (row + col) * 0.15);
				const waveValue = (wave1 + wave2 + wave3) / 3;
				radius = Math.max(0.1, (cellSize * 0.2) + waveValue * (cellSize * 0.3));
				alpha = 0.5 + waveValue * 0.4;
				break;
			}
			case "CIRCULSAR_PULSE": {
				const dx = col - centerX;
				const dy = row - centerY;
				const dist = Math.sqrt(dx * dx + dy * dy);
				const pulse = Math.sin(time * 3 - dist * 0.3);
				const pulse2 = Math.sin(time * 2.5 - dist * 0.25);
				const pulseValue = (pulse + pulse2) / 2;
				radius = Math.max(0.1, (cellSize * 0.2) + pulseValue * (cellSize * 0.2));
				alpha = 0.4 + pulseValue * 0.5;
				break;
			}
			case "HECTIC_NOISE": {
				const noise1 = Math.sin(time * 5 + row * 0.7 + col * 0.3);
				const noise2 = Math.sin(time * 7 + row * 0.4 + col * 0.8);
				const noise3 = Math.sin(time * 11 + row * 0.9 + col * 0.2);
				const noise4 = Math.sin(time * 13 + row * 0.3 + col * 0.6);
				const posHash = (row * 17 + col * 23) % 100 / 100;
				const noiseValue = (noise1 + noise2 * 0.7 + noise3 * 0.5 + noise4 * 0.3) / 2.5;
				const chaoticValue = noiseValue + (posHash - 0.5) * 0.3;
				radius = Math.max(0.1, (cellSize * 0.15) + chaoticValue * (cellSize * 0.35));
				alpha = 0.3 + Math.abs(chaoticValue) * 0.6;
				break;
			}
		}
		
		return { radius, alpha };
	}

	drawIdle(r, g, b, gridSize, cellSize, offsetX, offsetY, time) {
		// Static or minimal animation - just shows the color with slight breathing
		for (let row = 0; row < gridSize; row++) {
			for (let col = 0; col < gridSize; col++) {
				const x = offsetX + (col + 0.5) * cellSize;
				const y = offsetY + (row + 0.5) * cellSize;
				
				// Very subtle animation - slow breathing effect
				const radius = cellSize * 0.3 + Math.sin(time * 1.2) * 0.2;
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
				
				const radius = Math.max(0.1, (cellSize * 0.2) + waveValue * (cellSize * 0.3));
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
				
				const radius = Math.max(0.1, (cellSize * 0.15) + chaoticValue * (cellSize * 0.35));
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
		// Update target values - these are what we're transitioning towards
		let needsTransition = false;
		
		if (color !== undefined && color !== this.targetColor) {
			this.targetColor = color;
			needsTransition = true;
		}
		if (pattern !== undefined && pattern !== this.targetPattern) {
			this.targetPattern = pattern;
			needsTransition = true;
		}
		if (speed !== undefined && speed !== this.targetSpeed) {
			this.targetSpeed = speed;
			needsTransition = true;
		}
		
		// If we're already transitioning and target changed, continue from current blend
		// If we're not transitioning and target changed, start a new transition
		if (needsTransition && this.transitionStartTime === null) {
			// New transition - start from current state
			this.transitionStartTime = Date.now();
			this.blendFactor = 0;
		}
		// If already transitioning, just update targets and let it continue
	}
}

