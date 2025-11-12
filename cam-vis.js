// Realtime visualizer of cam input

export class CamVis {
	constructor() {
		this.canvas = null;
		this.ctx = null;
		this.cam = null;
		this.video = null; // Reference to cam.video
		this.isVisualizing = false;
		this.resizeObserver = null;
		this.animationFrameId = null;
		
		// Cached values for drawing (recalculated on resize)
		this.drawWidth = 0;
		this.drawHeight = 0;
		this.offsetX = 0;
		this.offsetY = 0;
		this.videoAspect = 0;
		
		// Cached video dimensions (recalculated when aspect changes)
		this.videoWidth = 0;
		this.videoHeight = 0;
		this.videoWidthInv = 0; // 1 / videoWidth for faster division
		this.videoHeightInv = 0; // 1 / videoHeight for faster division
		
		// Cached canvas dimensions (recalculated on resize)
		this.canvasWidth = 0;
		this.canvasHeight = 0;
		
		// Constants for drawing
		this.bodyConnections = [
			[11, 12], // shoulders
			[11, 13], [13, 15], [15, 17], [15, 19], [15, 21], // Left arm
			[17, 19], [19, 21], // Left finger connections
			[12, 14], [14, 16], [16, 18], [16, 20], [16, 22], // Right arm
			[18, 20], [20, 22] // Right finger connections
		];
		
		// Constants
		this.TWO_PI = Math.PI * 2;
		this.EMPTY_ARRAY = []; // Reusable empty array to avoid allocations
		
		// Cached style strings
		this.fontString = '10px "Courier New", Courier, monospace';
		this.strokeStyleBlack = 'rgba(0, 0, 0, 0.1)';
		this.fillStyleBlack = 'white';
		this.fillStyleGray = '#cdcdcd';
		this.bgFillStyle = '#1a1a1a';
		
		// Reusable arrays for face data formatting (cleared each frame)
		this.faceDataLines = [];
		this.sortedExpressions = []; // Reusable array for sorting expressions
		this.exprStringParts = []; // Reusable array for expression string building
		
		// Store last known face data to hold position when tracking is lost
		this.lastKnownFaces = [];
		
		// Sensitivity sliders
		this.sensitivitySlider = null;
		this.sensitivitySliderContainer = null;
		this.skeletonSensitivitySlider = null;
		this.skeletonSensitivitySliderContainer = null;
		
		// Video alpha animation
		this.videoAlpha = 0.1; // Base faded state
		this.fadeStartTime = 0;
		this.fadeDuration = 1000; // 1 second fade duration
		this.fadeAnimationFrameId = null;
	}

	resizeCanvas() {
		if (!this.canvas || !this.container) return;
		const rect = this.container.getBoundingClientRect();
		this.canvas.width = rect.width || 800;
		this.canvas.height = rect.height || 500;
		this.canvasWidth = this.canvas.width;
		this.canvasHeight = this.canvas.height;
		// Invalidate cached draw dimensions - will be recalculated in draw()
		this.drawWidth = 0;
	}

	init(config) {
		if (!config.cam) {
			console.log("CamVis error: must pass cam reference");
			return;
		}

		if (!config.container) {
			console.log("CamVis error: must pass container DOM element");
			return;
		}

		this.cam = config.cam;
		this.video = this.cam.video; // Reference to video from Cam
		this.container = config.container;

		// Create canvas element
		this.canvas = document.createElement('canvas');
		this.canvas.style.width = '100%';
		this.canvas.style.height = '100%';
		this.canvas.style.display = 'block';
		this.container.appendChild(this.canvas);
		this.ctx = this.canvas.getContext('2d');
		this.resizeCanvas();
		
		// Create sensitivity sliders
		this.createSensitivitySlider();
		this.createSkeletonSensitivitySlider();

		// Handle window resize
		this.resizeObserver = new ResizeObserver(() => {
			this.resizeCanvas();
			this.updateSliderPosition();
		});
		this.resizeObserver.observe(this.container);

		// Listen for frame sent events to trigger flash animation
		if (this.cam) {
			this.cam.addEventListener('framesent', () => {
				this.flashVideoAlpha();
			});
		}

		// Wait for video to be available, then start drawing
		this.waitForVideoAndStart();
	}

	createSensitivitySlider() {
		// Create slider container
		const sliderContainer = document.createElement('div');
		sliderContainer.style.position = 'absolute';
		sliderContainer.style.bottom = '10px';
		sliderContainer.style.left = '10px';
		sliderContainer.style.zIndex = '10';
		sliderContainer.style.pointerEvents = 'auto';
		sliderContainer.style.display = 'flex';
		sliderContainer.style.alignItems = 'center';
		sliderContainer.style.gap = '8px';
		sliderContainer.style.fontSize = '10px';
		sliderContainer.style.fontFamily = '"Courier New", Courier, monospace';
		sliderContainer.style.color = '#cdcdcd';
		
		// Create label
		const label = document.createElement('span');
		label.textContent = 'FACE:';
		label.style.userSelect = 'none';
		label.style.textTransform = 'uppercase';
		
		// Create slider
		this.sensitivitySlider = document.createElement('input');
		this.sensitivitySlider.type = 'range';
		this.sensitivitySlider.min = '0';
		this.sensitivitySlider.max = '1';
		this.sensitivitySlider.step = '0.01';
		this.sensitivitySlider.value = '0.3';
		this.sensitivitySlider.style.width = '120px';
		this.sensitivitySlider.style.height = '3px';
		this.sensitivitySlider.style.cursor = 'pointer';
		this.sensitivitySlider.style.accentColor = '#cdcdcd';
		
		// Style slider track and thumb with CSS
		const style = document.createElement('style');
		style.textContent = `
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
		`;
		document.head.appendChild(style);
		
		// Create value display
		const valueDisplay = document.createElement('span');
		valueDisplay.style.minWidth = '30px';
		valueDisplay.style.textAlign = 'right';
		valueDisplay.textContent = '0.30';
		valueDisplay.style.textTransform = 'uppercase';
		
		// Update value display on slider change
		this.sensitivitySlider.addEventListener('input', (e) => {
			const value = parseFloat(e.target.value);
			valueDisplay.textContent = value.toFixed(2);
			
			// Update sensitivity in cam-face module
			if (this.cam && this.cam.face) {
				this.cam.face.setSensitivity(value);
			}
		});
		
		// Assemble slider
		sliderContainer.appendChild(label);
		sliderContainer.appendChild(this.sensitivitySlider);
		sliderContainer.appendChild(valueDisplay);
		
		// Store container reference
		this.sensitivitySliderContainer = sliderContainer;
		
		// Add to container
		this.container.appendChild(sliderContainer);
		
		// Set initial sensitivity
		if (this.cam && this.cam.face) {
			this.cam.face.setSensitivity(0.3);
		}
	}

	createSkeletonSensitivitySlider() {
		// Create slider container
		const sliderContainer = document.createElement('div');
		sliderContainer.style.position = 'absolute';
		sliderContainer.style.bottom = '30px'; // Above face slider (which is at 10px)
		sliderContainer.style.left = '10px';
		sliderContainer.style.zIndex = '10';
		sliderContainer.style.pointerEvents = 'auto';
		sliderContainer.style.display = 'flex';
		sliderContainer.style.alignItems = 'center';
		sliderContainer.style.gap = '8px';
		sliderContainer.style.fontSize = '10px';
		sliderContainer.style.fontFamily = '"Courier New", Courier, monospace';
		sliderContainer.style.color = '#cdcdcd';
		
		// Create label
		const label = document.createElement('span');
		label.textContent = 'SKEL:';
		label.style.userSelect = 'none';
		label.style.textTransform = 'uppercase';
		
		// Create slider
		this.skeletonSensitivitySlider = document.createElement('input');
		this.skeletonSensitivitySlider.type = 'range';
		this.skeletonSensitivitySlider.min = '0';
		this.skeletonSensitivitySlider.max = '1';
		this.skeletonSensitivitySlider.step = '0.01';
		this.skeletonSensitivitySlider.value = '0.3';
		this.skeletonSensitivitySlider.style.width = '120px';
		this.skeletonSensitivitySlider.style.height = '3px';
		this.skeletonSensitivitySlider.style.cursor = 'pointer';
		this.skeletonSensitivitySlider.style.accentColor = '#cdcdcd';
		
		// Create value display
		const valueDisplay = document.createElement('span');
		valueDisplay.style.minWidth = '30px';
		valueDisplay.style.textAlign = 'right';
		valueDisplay.textContent = '0.30';
		valueDisplay.style.textTransform = 'uppercase';
		
		// Update value display on slider change
		this.skeletonSensitivitySlider.addEventListener('input', (e) => {
			const value = parseFloat(e.target.value);
			valueDisplay.textContent = value.toFixed(2);
			
			// Update sensitivity in cam-skeletal module
			if (this.cam && this.cam.skeletal) {
				this.cam.skeletal.setSensitivity(value);
			}
		});
		
		// Assemble slider
		sliderContainer.appendChild(label);
		sliderContainer.appendChild(this.skeletonSensitivitySlider);
		sliderContainer.appendChild(valueDisplay);
		
		// Store container reference
		this.skeletonSensitivitySliderContainer = sliderContainer;
		
		// Add to container
		this.container.appendChild(sliderContainer);
		
		// Set initial sensitivity
		if (this.cam && this.cam.skeletal) {
			this.cam.skeletal.setSensitivity(0.3);
		}
	}

	updateSliderPosition() {
		// Slider position is relative to container, so it should auto-update
		// This method can be extended if needed for more complex positioning
	}

	waitForVideoAndStart() {
		// Poll for video availability (video is created asynchronously in Cam)
		const checkVideo = setInterval(() => {
			// Update video reference in case it wasn't available initially
			if (this.cam && this.cam.video) {
				this.video = this.cam.video;
			}
			
			if (this.video && this.video.readyState >= this.video.HAVE_METADATA) {
				clearInterval(checkVideo);
				this.isVisualizing = true;
				setTimeout(() => {
					this.startDrawing();
				}, 500);
			}
		}, 100);
		
		// Timeout after 10 seconds
		setTimeout(() => {
			clearInterval(checkVideo);
			if (!this.video) {
				console.error('[CamVis] Video not available after timeout');
			}
		}, 10000);
	}


	startDrawing() {
		if (!this.isVisualizing) return;
		const drawLoop = () => {
			if (!this.isVisualizing) return;
			this.draw();
			this.animationFrameId = requestAnimationFrame(drawLoop);
		};
		drawLoop();
	}

	draw() {
		if (!this.ctx || !this.canvas || !this.video) return;

		// Cache canvas dimensions
		const canvasWidth = this.canvasWidth;
		const canvasHeight = this.canvasHeight;

		// Clear canvas
		this.ctx.fillStyle = this.bgFillStyle;
		this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);

		// Cache video dimensions
		const videoWidth = this.video.videoWidth;
		const videoHeight = this.video.videoHeight;

		// Calculate video scaling (cache and only recalculate when needed)
		if (this.drawWidth === 0 || this.videoWidth !== videoWidth || this.videoHeight !== videoHeight) {
			// Update cached video dimensions
			this.videoWidth = videoWidth;
			this.videoHeight = videoHeight;
			this.videoWidthInv = 1.0 / videoWidth;
			this.videoHeightInv = 1.0 / videoHeight;
			this.videoAspect = videoWidth * this.videoHeightInv;
			const canvasAspect = canvasWidth / canvasHeight;

			if (this.videoAspect > canvasAspect) {
				this.drawHeight = canvasHeight;
				this.drawWidth = this.drawHeight * this.videoAspect;
				this.offsetX = (canvasWidth - this.drawWidth) * 0.5;
				this.offsetY = 0;
			} else {
				this.drawWidth = canvasWidth;
				this.drawHeight = this.drawWidth / this.videoAspect;
				this.offsetX = 0;
				this.offsetY = (canvasHeight - this.drawHeight) * 0.5;
			}
		}

		const drawWidth = this.drawWidth;
		const drawHeight = this.drawHeight;
		const offsetX = this.offsetX;
		const offsetY = this.offsetY;
		const videoWidthInv = this.videoWidthInv;
		const videoHeightInv = this.videoHeightInv;

		// Mirror video and visualizations (but not text readouts)
		this.ctx.save();
		// Flip horizontally around canvas center
		this.ctx.translate(canvasWidth, 0);
		this.ctx.scale(-1, 1);

		// Draw webcam feed at reduced opacity in background (mirrored)
		if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
			this.ctx.save();
			this.ctx.globalAlpha = this.videoAlpha;
			this.ctx.drawImage(
				this.video,
				offsetX,
				offsetY,
				drawWidth,
				drawHeight
			);
			this.ctx.restore();
		}

		// Draw faces (if detected) (mirrored)
		// Get face data from Cam
		const currentFaces = this.cam ? this.cam.getCurrentFaces() : this.EMPTY_ARRAY;
		
		// Update last known faces if we have current faces, otherwise use last known
		const facesToDraw = (currentFaces && currentFaces.length > 0) ? currentFaces : this.lastKnownFaces;
		
		// Deep copy current faces to lastKnownFaces when they exist (for persistence)
		if (currentFaces && currentFaces.length > 0) {
			const faceCount = currentFaces.length;
			
			// Clear and rebuild lastKnownFaces array
			this.lastKnownFaces.length = 0;
			for (let i = 0; i < faceCount; i++) {
				const face = currentFaces[i];
				
				// Create new face object (must be unique per face)
				const copiedFace = {
					boundingBox: {
						x: face.boundingBox.x,
						y: face.boundingBox.y,
						width: face.boundingBox.width,
						height: face.boundingBox.height
					},
					landmarks: null,
					expressions: null,
					dominantExpression: face.dominantExpression,
					age: face.age,
					gender: face.gender
				};
				
				// Copy landmarks (avoid .map() allocation by manual copy)
				if (face.landmarks && face.landmarks.length > 0) {
					const landmarkCount = face.landmarks.length;
					copiedFace.landmarks = new Array(landmarkCount);
					for (let j = 0; j < landmarkCount; j++) {
						const srcLandmark = face.landmarks[j];
						copiedFace.landmarks[j] = { x: srcLandmark.x, y: srcLandmark.y };
					}
				}
				
				// Copy expressions (create new object but copy properties directly)
				if (face.expressions) {
					copiedFace.expressions = {};
					for (const key in face.expressions) {
						if (face.expressions.hasOwnProperty(key)) {
							copiedFace.expressions[key] = face.expressions[key];
						}
					}
				}
				
				this.lastKnownFaces.push(copiedFace);
			}
		}
		
		if (facesToDraw && facesToDraw.length > 0) {
			this.ctx.globalAlpha = 1.0;
			this.ctx.strokeStyle = this.strokeStyleBlack;
			this.ctx.lineWidth = 2;
			
			for (let i = 0, len = facesToDraw.length; i < len; i++) {
				const face = facesToDraw[i];
				const box = face.boundingBox;
				if (box) {
					// Draw bounding box (coordinates are relative to video, need to scale)
					// Use multiplication instead of division for better performance
					const x = offsetX + box.x * videoWidthInv * drawWidth;
					const y = offsetY + box.y * videoHeightInv * drawHeight;
					const w = box.width * videoWidthInv * drawWidth;
					const h = box.height * videoHeightInv * drawHeight;
					
					this.ctx.strokeRect(x, y, w, h);
					
					// Draw face landmarks if available
					const landmarks = face.landmarks;
					if (landmarks && landmarks.length > 0) {
						this.ctx.fillStyle = this.fillStyleBlack;
						this.ctx.globalAlpha = 0.6;
						for (let j = 0, landmarkLen = landmarks.length; j < landmarkLen; j++) {
							const landmark = landmarks[j];
							const lx = offsetX + landmark.x * videoWidthInv * drawWidth;
							const ly = offsetY + landmark.y * videoHeightInv * drawHeight;
							this.ctx.beginPath();
							this.ctx.arc(lx, ly, 2, 0, this.TWO_PI);
							this.ctx.fill();
						}
						this.ctx.globalAlpha = 1.0;
					}
				}
			}
		}

		// Draw skeleton on top (if pose detected) (mirrored)
		// Get pose data from Cam's skeletal module
		const currentPoseLandmarks = this.cam ? this.cam.getCurrentPoseLandmarks() : null;
		if (currentPoseLandmarks && currentPoseLandmarks.length > 0) {
			const poseLen = currentPoseLandmarks.length;
			// Reset opacity for skeleton drawing
			this.ctx.globalAlpha = 1.0;
			this.ctx.fillStyle = this.fillStyleGray;

			// Draw interpolated dots between landmarks (no lines)
			const connections = this.bodyConnections;
			const numDots = 3; // Number of interpolated dots between landmarks
			const numDotsPlus1 = numDots + 1; // Pre-calculate for division
			for (let i = 0, connLen = connections.length; i < connLen; i++) {
				const conn = connections[i];
				const start = conn[0];
				const end = conn[1];
				if (start < poseLen && end < poseLen) {
					const startLandmark = currentPoseLandmarks[start];
					const endLandmark = currentPoseLandmarks[end];

					// Check visibility
					const startVisible = this.cam.getSkeletalLandmarkVisibility(start);
					const endVisible = this.cam.getSkeletalLandmarkVisibility(end);
					if (startVisible > 0.5 && endVisible > 0.5) {
						const x1 = offsetX + startLandmark.x * drawWidth;
						const y1 = offsetY + startLandmark.y * drawHeight;
						const x2 = offsetX + endLandmark.x * drawWidth;
						const y2 = offsetY + endLandmark.y * drawHeight;
						const dx = x2 - x1;
						const dy = y2 - y1;

						// Draw interpolated dots between start and end
						for (let j = 1; j <= numDots; j++) {
							const t = j / numDotsPlus1; // Interpolation factor (0 to 1, excluding endpoints)
							const x = x1 + dx * t;
							const y = y1 + dy * t;
							
							// Smaller dots for interpolated points
							this.ctx.globalAlpha = 0.4;
							this.ctx.beginPath();
							this.ctx.arc(x, y, 1.8, 0, this.TWO_PI);
							this.ctx.fill();
						}
					}
				}
			}

			// Draw main landmarks as smaller dots
			for (let i = 0; i < poseLen; i++) {
				// Skip face landmarks (0-10) - focus on body only
				if (i <= 10) continue;

				// Skip lower body landmarks (23-32: hips, legs, feet) - only track waist up
				if (i >= 23) continue;

				const landmark = currentPoseLandmarks[i];
				const visibility = this.cam.getSkeletalLandmarkVisibility(i);

				// Skip if not visible enough
				if (visibility < 0.3) continue;

				const x = offsetX + landmark.x * drawWidth;
				const y = offsetY + landmark.y * drawHeight;

				// Draw landmark dots
				this.ctx.globalAlpha = visibility < 0.6 ? 0.6 : visibility;
				this.ctx.fillStyle = this.fillStyleGray;
				this.ctx.beginPath();
				this.ctx.arc(x, y, 4, 0, this.TWO_PI);
				this.ctx.fill();
			}

			// Reset opacity
			this.ctx.globalAlpha = 1.0;
		}

		// Restore context (end mirroring)
		this.ctx.restore();
		
		// Draw face data readout in top-left corner (not mirrored)
		this.drawFaceDataReadout();
	}

	drawFaceDataReadout() {
		if (!this.ctx || !this.canvas) return;
		
		const currentFaces = this.cam ? this.cam.getCurrentFaces() : this.EMPTY_ARRAY;
		// Use last known faces if current faces are not available
		const facesToDraw = (currentFaces && currentFaces.length > 0) ? currentFaces : this.lastKnownFaces;
		if (!facesToDraw || facesToDraw.length === 0) return;
		
		// Use monospaced font for data readout
		this.ctx.save();
		this.ctx.font = this.fontString;
		this.ctx.textBaseline = 'top';
		this.ctx.textAlign = 'left';
		
		// Background for readability
		const padding = 8;
		const lineHeight = 14;
		const maxWidth = 280;
		
		// Clear and reuse lines array
		const lines = this.faceDataLines;
		lines.length = 0;
		
		// Build lines array
		for (let i = 0, len = facesToDraw.length; i < len; i++) {
			this.formatFaceData(facesToDraw[i], i, lines);
		}
		
		// Measure text width
		let maxTextWidth = 0;
		for (let i = 0, len = lines.length; i < len; i++) {
			const metrics = this.ctx.measureText(lines[i]);
			if (metrics.width > maxTextWidth) maxTextWidth = metrics.width;
		}
		
		const boxWidth = Math.min(maxTextWidth + padding * 2, maxWidth);
		const boxHeight = lines.length * lineHeight + padding * 2;
				
		// Draw text
		this.ctx.fillStyle = this.fillStyleBlack;
		let y = padding + 2;
		
		for (let i = 0, len = lines.length; i < len; i++) {
			this.ctx.fillText(lines[i], padding + 4, y);
			y += lineHeight;
		}
		
		this.ctx.restore();
	}

	formatFaceData(face, index, lines) {
		// Append to existing lines array to avoid creating new arrays
		lines.push(`FACE ${index + 1}`.toUpperCase());
		
		if (face.age !== null && face.gender !== null) {
			lines.push(`Age: ${Math.round(face.age)} | ${face.gender}`.toUpperCase());
		}
		
		if (face.dominantExpression) {
			const expr = face.dominantExpression.toUpperCase();
			const confidence = face.expressions[face.dominantExpression];
			lines.push(`Expr: ${expr} (${(confidence * 100).toFixed(0)}%)`.toUpperCase());
		}
		
		if (face.expressions) {
			// Show top 3 expressions - manually sort to avoid Object.entries() and map()
			const tempArr = this.sortedExpressions;
			tempArr.length = 0;
			
			// Build array of [name, value] pairs manually
			const expressions = face.expressions;
			for (const name in expressions) {
				if (expressions.hasOwnProperty(name)) {
					tempArr.push([name, expressions[name]]);
				}
			}
			
			// Sort by value descending
			tempArr.sort((a, b) => b[1] - a[1]);
			
			// Build expression string using array join (top 3) - avoid string concatenation GC
			const maxExprs = Math.min(3, tempArr.length);
			if (maxExprs > 0) {
				const exprParts = this.exprStringParts;
				exprParts.length = 0;
				for (let i = 0; i < maxExprs; i++) {
					const [name, val] = tempArr[i];
					exprParts.push(`${name.substring(0, 3).toUpperCase()}:${(val * 100).toFixed(0)}`);
				}
				lines.push(`  ${exprParts.join(' ')}`.toUpperCase());
			}
		}
		
		lines.push(''); // Empty line between faces
	}


	flashVideoAlpha() {
		// Cancel any existing fade animation
		if (this.fadeAnimationFrameId) {
			cancelAnimationFrame(this.fadeAnimationFrameId);
			this.fadeAnimationFrameId = null;
		}

		// Flash to full opacity immediately
		this.videoAlpha = 1.0;
		this.fadeStartTime = Date.now();

		// Start fade animation
		const fadeLoop = () => {
			const elapsed = Date.now() - this.fadeStartTime;
			const progress = Math.min(elapsed / this.fadeDuration, 1.0);

			// Ease-out fade: start at 1.0, fade to 0.2
			this.videoAlpha = 1.0 - (progress * (1.0 - 0.2));

			if (progress < 1.0) {
				this.fadeAnimationFrameId = requestAnimationFrame(fadeLoop);
			} else {
				// Ensure we end at exactly 0.2
				this.videoAlpha = 0.2;
				this.fadeAnimationFrameId = null;
			}
		};

		this.fadeAnimationFrameId = requestAnimationFrame(fadeLoop);
	}

	disconnect() {
		this.isVisualizing = false;

		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}

		if (this.fadeAnimationFrameId) {
			cancelAnimationFrame(this.fadeAnimationFrameId);
			this.fadeAnimationFrameId = null;
		}

		if (this.resizeObserver) {
			this.resizeObserver.disconnect();
			this.resizeObserver = null;
		}

		if (this.canvas && this.container && this.canvas.parentNode === this.container) {
			this.container.removeChild(this.canvas);
		}

		// Remove sensitivity sliders
		if (this.sensitivitySliderContainer && this.sensitivitySliderContainer.parentNode) {
			this.sensitivitySliderContainer.parentNode.removeChild(this.sensitivitySliderContainer);
		}
		this.sensitivitySlider = null;
		this.sensitivitySliderContainer = null;
		
		if (this.skeletonSensitivitySliderContainer && this.skeletonSensitivitySliderContainer.parentNode) {
			this.skeletonSensitivitySliderContainer.parentNode.removeChild(this.skeletonSensitivitySliderContainer);
		}
		this.skeletonSensitivitySlider = null;
		this.skeletonSensitivitySliderContainer = null;

		this.canvas = null;
		this.ctx = null;
		this.video = null;
		this.drawWidth = 0;
		this.drawHeight = 0;
		this.offsetX = 0;
		this.offsetY = 0;
		this.videoAspect = 0;
		this.videoWidth = 0;
		this.videoHeight = 0;
		this.videoWidthInv = 0;
		this.videoHeightInv = 0;
		this.canvasWidth = 0;
		this.canvasHeight = 0;
		// Clear reusable arrays
		this.faceDataLines.length = 0;
		this.sortedExpressions.length = 0;
		this.exprStringParts.length = 0;
		this.lastKnownFaces.length = 0;
	}
}