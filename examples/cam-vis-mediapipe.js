// Realtime visualizer of cam input
import { PoseLandmarker, FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export class CamVis {
	constructor() {
		this.canvas = null;
		this.ctx = null;
		this.video = null;
		this.mediaStream = null;
		this.isVisualizing = false;
		this.poseLandmarker = null;
		this.faceLandmarker = null;
		this.resizeObserver = null;
		this.currentPoseLandmarks = null;
		this.currentWorldLandmarks = null;
		this.currentFaceLandmarks = null;
		this.currentFaceBlendshapes = null;
		this.currentVisibility = null;
		this.animationFrameId = null;
		this.debugLogged = false;
		this.debugWorldLogged = false;
		this.debugBlendshapesLogged = false;
		
		// Smoothing state for temporal smoothing
		this.smoothedPoseLandmarks = null;
		this.smoothedWorldLandmarks = null;
		this.smoothedFaceLandmarks = null;
		// Smoothing factor: 0 = no smoothing (jittery), 1 = infinite smoothing (very laggy)
		// Recommended range: 0.5-0.8. Default 0.7 provides good balance.
		// Adjust this.smoothingFactor to tune responsiveness vs stability
		this.smoothingFactor = 0.7;
		
		// Cached values for drawing (recalculated on resize)
		this.drawWidth = 0;
		this.drawHeight = 0;
		this.offsetX = 0;
		this.offsetY = 0;
		this.videoAspect = 0;
		
		// Blendshape lookup map for faster access
		this.blendshapeMap = null;
		
		// Constants for drawing
		this.bodyConnections = [
			[11, 12], // shoulders
			[11, 13], [13, 15], [15, 17], [15, 19], [15, 21], // Left arm
			[17, 19], [19, 21], // Left finger connections
			[12, 14], [14, 16], [16, 18], [16, 20], [16, 22], // Right arm
			[18, 20], [20, 22] // Right finger connections
		];
	}

	resizeCanvas() {
		if (!this.canvas || !this.container) return;
		const rect = this.container.getBoundingClientRect();
		this.canvas.width = rect.width || 800;
		this.canvas.height = rect.height || 500;
		this.canvasCenter = { x: this.canvas.width * 0.5, y: this.canvas.height * 0.5 };
		// Invalidate cached draw dimensions - will be recalculated in draw()
		this.drawWidth = 0;
	}

	init(config) {
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

		// Initialize MediaPipe and webcam
		this.setupMediaPipe();
	}

	async setupMediaPipe() {
		try {
			// Request webcam access
			this.mediaStream = await navigator.mediaDevices.getUserMedia({
				video: {
					width: { ideal: 1280 },
					height: { ideal: 720 },
					facingMode: 'user'
				}
			});

			// Create video element (hidden, used for processing)
			this.video = document.createElement('video');
			this.video.srcObject = this.mediaStream;
			this.video.playsInline = true;
			this.video.muted = true;
			await this.video.play();

			// Initialize MediaPipe Solutions Pose Landmarker
			const vision = await FilesetResolver.forVisionTasks(
				'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
			);

			// Configure PoseLandmarker with smoothing options
			// Higher confidence thresholds reduce jitter by filtering out low-confidence detections
			this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
				baseOptions: {
					modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task`,
					delegate: 'GPU'
				},
				runningMode: 'VIDEO',
				numPoses: 1,
				minPoseDetectionConfidence: 0.5,     // Increased from 0.3 for stability
				minPosePresenceConfidence: 0.5,       // Increased from 0.3 for stability
				minTrackingConfidence: 0.5            // Increased from 0.3 - reduces jitter significantly
				// Note: smoothLandmarks may not be available in Tasks Vision API
				// We use our own temporal smoothing instead (see smoothLandmarks method)
			});

			// Initialize MediaPipe Face Landmarker
			this.faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
				baseOptions: {
					modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
					delegate: 'GPU'
				},
				runningMode: 'VIDEO',
				numFaces: 1,
				minFaceDetectionConfidence: 0.5,
				minFacePresenceConfidence: 0.5,
				minTrackingConfidence: 0.5,
				outputFaceBlendshapes: true, // Enable facial expressions
				outputFacialTransformationMatrixes: false // Set to true if you need 3D transform
			});

			console.log('[CamVis] MediaPipe Pose Landmarker initialized successfully');
			console.log('[CamVis] MediaPipe Face Landmarker initialized successfully');
			console.log('[CamVis] Video dimensions:', this.video.videoWidth, 'x', this.video.videoHeight);

			this.isVisualizing = true;

			// Wait a bit for video to be fully ready, then start drawing
			setTimeout(() => {
				this.startDrawing();
			}, 500);
		} catch (error) {
			console.error('[CamVis] Error setting up MediaPipe:', error);
		}
	}

	startDrawing() {
		if (!this.isVisualizing) return;
		const drawLoop = () => {
			if (!this.isVisualizing) return;
			this.processFrame();
			this.draw();
			this.animationFrameId = requestAnimationFrame(drawLoop);
		};
		drawLoop();
	}

	processFrame() {
		if (!this.isVisualizing || !this.video || !this.poseLandmarker || !this.faceLandmarker) return;

		// Check if video is ready and has valid dimensions
		if (this.video.readyState === this.video.HAVE_ENOUGH_DATA && 
		    this.video.videoWidth > 0 && this.video.videoHeight > 0) {
			try {
				const startTimeMs = performance.now();
				
				// Detect pose
				const results = this.poseLandmarker.detectForVideo(this.video, startTimeMs);
				
				// Detect face
				const faceResults = this.faceLandmarker.detectForVideo(this.video, startTimeMs);

				// Debug: log what's available in results (every frame until we see landmarks)
				if (!this.debugLogged || (!results.landmarks || results.landmarks.length === 0)) {
					console.log('[CamVis] Results object keys:', Object.keys(results));
					console.log('[CamVis] landmarks:', results.landmarks?.length);
					console.log('[CamVis] worldLandmarks:', results.worldLandmarks?.length);
					console.log('[CamVis] Video being processed:', {
						width: this.video.videoWidth,
						height: this.video.videoHeight,
						readyState: this.video.readyState
					});
					console.log('[CamVis] All result properties:', {
						landmarks: !!results.landmarks,
						worldLandmarks: !!results.worldLandmarks
					});
					if (results.landmarks && results.landmarks.length > 0) {
						this.debugLogged = true;
					}
				}

				// Extract landmarks (array of poses, we use the first one)
				let rawPoseLandmarks = null;
				if (results.landmarks && results.landmarks.length > 0) {
					rawPoseLandmarks = results.landmarks[0];
				}

				// Extract visibility scores if available
				if (results.visibility && results.visibility.length > 0) {
					this.currentVisibility = results.visibility[0];
				} else {
					this.currentVisibility = null;
				}

				// Extract world landmarks
				let rawWorldLandmarks = null;
				if (results.worldLandmarks && results.worldLandmarks.length > 0) {
					rawWorldLandmarks = results.worldLandmarks[0];
				}

				// Extract face landmarks
				let rawFaceLandmarks = null;
				if (faceResults.faceLandmarks && faceResults.faceLandmarks.length > 0) {
					rawFaceLandmarks = faceResults.faceLandmarks[0]; // 468 landmarks
				}

				// Extract face blendshapes (facial expressions)
				if (faceResults.faceBlendshapes && faceResults.faceBlendshapes.length > 0) {
					const blendshapesObj = faceResults.faceBlendshapes[0];
					// MediaPipe returns an object with 'categories' array
					if (blendshapesObj && blendshapesObj.categories && Array.isArray(blendshapesObj.categories)) {
						this.currentFaceBlendshapes = blendshapesObj.categories;
						
						// Build lookup map for faster access
						if (!this.blendshapeMap) {
							this.blendshapeMap = new Map();
							for (let i = 0; i < blendshapesObj.categories.length; i++) {
								const cat = blendshapesObj.categories[i];
								if (cat && cat.categoryName) {
									this.blendshapeMap.set(cat.categoryName, i);
								}
							}
						}
						
						// Debug: log structure and all category names (only once)
						if (!this.debugBlendshapesLogged && blendshapesObj.categories.length > 0) {
							console.log('[CamVis] First blendshape structure:', blendshapesObj.categories[0]);
							console.log('[CamVis] Sample blendshapes:', blendshapesObj.categories.slice(0, 5));
							// Log all category names to see what's available
							const allCategories = blendshapesObj.categories.map(b => b.categoryName);
							console.log('[CamVis] All available category names:', allCategories);
							// Specifically check for smile and sneer variations
							const smileLike = allCategories.filter(c => c.toLowerCase().includes('smile'));
							const sneerLike = allCategories.filter(c => c.toLowerCase().includes('sneer'));
							console.log('[CamVis] Smile-like categories:', smileLike);
							console.log('[CamVis] Sneer-like categories:', sneerLike);
							this.debugBlendshapesLogged = true;
						}
					} else {
						this.currentFaceBlendshapes = null;
						this.blendshapeMap = null;
					}
				} else {
					this.currentFaceBlendshapes = null;
					this.blendshapeMap = null;
				}

				// Apply temporal smoothing to reduce jitter
				this.currentPoseLandmarks = this.smoothLandmarks(rawPoseLandmarks, this.smoothedPoseLandmarks);
				this.currentWorldLandmarks = this.smoothLandmarks(rawWorldLandmarks, this.smoothedWorldLandmarks);
				this.currentFaceLandmarks = this.smoothLandmarks(rawFaceLandmarks, this.smoothedFaceLandmarks);
				
				// Update smoothed state for next frame
				this.smoothedPoseLandmarks = this.currentPoseLandmarks;
				this.smoothedWorldLandmarks = this.currentWorldLandmarks;
				this.smoothedFaceLandmarks = this.currentFaceLandmarks;
			} catch (error) {
				if (!this.debugLogged) {
					console.error('[CamVis] Error detecting pose:', error);
					this.debugLogged = true;
				}
			}
		} else {
			// Debug: log when video isn't ready
			if (!this.debugLogged) {
				console.log('[CamVis] Video not ready:', {
					readyState: this.video.readyState,
					width: this.video.videoWidth,
					height: this.video.videoHeight,
					HAVE_ENOUGH_DATA: this.video.HAVE_ENOUGH_DATA
				});
			}
		}
	}

	draw() {
		if (!this.ctx || !this.canvas || !this.video) return;

		// Clear canvas
		this.ctx.fillStyle = '#dadfe0';
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		// Calculate video scaling (cache and only recalculate when needed)
		if (this.drawWidth === 0 || this.videoAspect !== (this.video.videoWidth / this.video.videoHeight)) {
			this.videoAspect = this.video.videoWidth / this.video.videoHeight;
			const canvasAspect = this.canvas.width / this.canvas.height;

			if (this.videoAspect > canvasAspect) {
				this.drawHeight = this.canvas.height;
				this.drawWidth = this.drawHeight * this.videoAspect;
				this.offsetX = (this.canvas.width - this.drawWidth) * 0.5;
				this.offsetY = 0;
			} else {
				this.drawWidth = this.canvas.width;
				this.drawHeight = this.drawWidth / this.videoAspect;
				this.offsetX = 0;
				this.offsetY = (this.canvas.height - this.drawHeight) * 0.5;
			}
		}

		const drawWidth = this.drawWidth;
		const drawHeight = this.drawHeight;
		const offsetX = this.offsetX;
		const offsetY = this.offsetY;

		// Mirror video and visualizations (but not text readouts)
		this.ctx.save();
		// Flip horizontally around canvas center
		this.ctx.translate(this.canvas.width, 0);
		this.ctx.scale(-1, 1);

		// Draw webcam feed at reduced opacity in background (mirrored)
		if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
			this.ctx.save();
			this.ctx.globalAlpha = 0.2;
			this.ctx.drawImage(
				this.video,
				offsetX,
				offsetY,
				drawWidth,
				drawHeight
			);
			this.ctx.restore();
		}

		// Draw face landmarks first (if available) - independent of pose detection (mirrored)
		if (this.currentFaceLandmarks && this.currentFaceLandmarks.length > 0) {
			this.drawFaceLandmarks(offsetX, offsetY, drawWidth, drawHeight);
		}

		// Draw skeleton on top (if pose detected) (mirrored)
		if (this.currentPoseLandmarks && this.currentPoseLandmarks.length > 0) {
			// Reset opacity for skeleton drawing
			this.ctx.globalAlpha = 1.0;
			this.ctx.fillStyle = '#555555'; // Dark gray for skeletal markers

			// Draw interpolated dots between landmarks (no lines)
			for (const [start, end] of this.bodyConnections) {
				if (start < this.currentPoseLandmarks.length && end < this.currentPoseLandmarks.length) {
					const startLandmark = this.currentPoseLandmarks[start];
					const endLandmark = this.currentPoseLandmarks[end];

					// Check visibility
					const startVisible = this.getLandmarkVisibility(start);
					const endVisible = this.getLandmarkVisibility(end);
					if (startVisible > 0.5 && endVisible > 0.5) {
						const x1 = offsetX + startLandmark.x * drawWidth;
						const y1 = offsetY + startLandmark.y * drawHeight;
						const x2 = offsetX + endLandmark.x * drawWidth;
						const y2 = offsetY + endLandmark.y * drawHeight;

						// Draw interpolated dots between start and end
						const numDots = 3; // Number of interpolated dots between landmarks
						for (let j = 1; j <= numDots; j++) {
							const t = j / (numDots + 1); // Interpolation factor (0 to 1, excluding endpoints)
							const x = x1 + (x2 - x1) * t;
							const y = y1 + (y2 - y1) * t;
							
							// Smaller dots for interpolated points
							this.ctx.globalAlpha = 0.4;
							this.ctx.beginPath();
							this.ctx.arc(x, y, 1.8, 0, Math.PI * 2); // Increased from 1
							this.ctx.fill();
						}
					}
				}
			}

			// Draw main landmarks as smaller dots
			for (let i = 0; i < this.currentPoseLandmarks.length; i++) {
				const landmark = this.currentPoseLandmarks[i];
				const x = offsetX + landmark.x * drawWidth;
				const y = offsetY + landmark.y * drawHeight;
				const visibility = this.getLandmarkVisibility(i);

				// Skip if not visible enough
				if (visibility < 0.3) continue;

				// Skip face landmarks (0-10) - we use FaceLandmarker for those
				if (i <= 10) continue;

				// Skip lower body landmarks (23-32: hips, legs, feet) - only track waist up
				if (i >= 23) continue;

				// Draw landmark dots
				this.ctx.globalAlpha = Math.max(0.6, visibility);
				this.ctx.fillStyle = '#555555'; // Dark gray
				this.ctx.beginPath();
				this.ctx.arc(x, y, 4, 0, Math.PI * 2); // Increased from 2.5
				this.ctx.fill();
			}

			// Reset opacity
			this.ctx.globalAlpha = 1.0;
		}

		// Restore context (end mirroring)
		this.ctx.restore();

		// Draw facial expression data (NOT mirrored - normal orientation)
		this.drawFaceExpressions();
	}

	smoothLandmarks(currentLandmarks, previousLandmarks) {
		// If no current landmarks, return null
		if (!currentLandmarks || currentLandmarks.length === 0) {
			return null;
		}
		
		// If no previous landmarks, return current (first frame)
		if (!previousLandmarks || previousLandmarks.length === 0) {
			return currentLandmarks;
		}
		
		// If landmark count doesn't match, return current (reset)
		if (currentLandmarks.length !== previousLandmarks.length) {
			return currentLandmarks;
		}
		
		// Apply exponential smoothing (linear interpolation)
		// smoothingFactor: 0 = no smoothing (instant), 1 = infinite smoothing (never changes)
		// Higher smoothingFactor = more smoothing = less jitter but more lag
		const alpha = 1.0 - this.smoothingFactor; // Invert: alpha is how much of current to use
		
		const smoothed = [];
		for (let i = 0; i < currentLandmarks.length; i++) {
			const current = currentLandmarks[i];
			const previous = previousLandmarks[i];
			
			smoothed.push({
				x: previous.x * this.smoothingFactor + current.x * alpha,
				y: previous.y * this.smoothingFactor + current.y * alpha,
				z: previous.z !== undefined && current.z !== undefined 
					? previous.z * this.smoothingFactor + current.z * alpha 
					: current.z,
				visibility: current.visibility !== undefined ? current.visibility : 1.0
			});
		}
		
		return smoothed;
	}

	getLandmarkVisibility(index) {
		// MediaPipe Solutions may have visibility in the landmark object or separate array
		// Try both approaches
		if (this.currentPoseLandmarks && this.currentPoseLandmarks[index]) {
			const landmark = this.currentPoseLandmarks[index];
			// Check if visibility is a property
			if (landmark.visibility !== undefined) {
				return landmark.visibility;
			}
			// Check if there's a separate visibility array (MediaPipe Solutions format)
			if (this.currentVisibility && this.currentVisibility[index] !== undefined) {
				return this.currentVisibility[index];
			}
		}
		// Default to visible if we can't determine
		return 1.0;
	}

	getBlendshapeScore(category) {
		if (!this.currentFaceBlendshapes || !Array.isArray(this.currentFaceBlendshapes)) return 0;
		
		// Use lookup map for faster access
		if (this.blendshapeMap) {
			const index = this.blendshapeMap.get(category);
			if (index !== undefined && index >= 0 && index < this.currentFaceBlendshapes.length) {
				const blendshape = this.currentFaceBlendshapes[index];
				const score = blendshape?.score || 0;
				
				// Debug: log cheekPuff and sneer values to see if they're being detected
				if (category === 'cheekPuff' || category === 'noseSneerLeft' || category === 'noseSneerRight') {
					if (score > 0.01) { // Only log if there's a significant value
						console.log(`[CamVis] ${category}: ${score.toFixed(3)}`);
					}
				}
				
				return score;
			}
			return 0; // Category not found in map
		}
		
		// Fallback to find if map not available
		const blendshape = this.currentFaceBlendshapes.find(b => b && b.categoryName === category);
		const score = blendshape?.score || 0;
		
		// Debug: log cheekPuff and sneer values to see if they're being detected
		if (category === 'cheekPuff' || category === 'noseSneerLeft' || category === 'noseSneerRight') {
			if (score > 0.01) { // Only log if there's a significant value
				console.log(`[CamVis] ${category}: ${score.toFixed(3)}`);
			}
		}
		
		return score;
	}

	drawFaceExpressions() {
		if (!this.currentFaceBlendshapes || !Array.isArray(this.currentFaceBlendshapes)) return;

		this.ctx.save();
		this.ctx.globalAlpha = 0.9;
		this.ctx.fillStyle = '#333333';
		this.ctx.font = '10px monospace';
		this.ctx.textBaseline = 'top';

		const expressions = [
			{ 
				name: 'Smile', 
				getScore: () => {
					// Combine left and right smile values
					const left = this.getBlendshapeScore('mouthSmileLeft');
					const right = this.getBlendshapeScore('mouthSmileRight');
					return Math.max(left, right); // Use the maximum of both
				}
			},
			{ 
				name: 'Frown', 
				getScore: () => {
					// Combine left and right frown values
					const left = this.getBlendshapeScore('mouthFrownLeft');
					const right = this.getBlendshapeScore('mouthFrownRight');
					return Math.max(left, right); // Use the maximum of both
				}
			},
			{ name: 'Mouth Pucker', getScore: () => this.getBlendshapeScore('mouthPucker') },
			{ name: 'Jaw Open', getScore: () => this.getBlendshapeScore('jawOpen') }
		];

		const startX = 10;
		const startY = 10;
		const lineHeight = 14;
		const labelWidth = 90;

		expressions.forEach((expr, index) => {
			const score = expr.getScore();
			const y = startY + index * lineHeight;
			
			// Draw label
			this.ctx.fillStyle = '#555555';
			this.ctx.fillText(expr.name + ':', startX, y);
			
			// Draw value (0.00 format)
			this.ctx.fillStyle = '#333333';
			this.ctx.fillText(score.toFixed(2), startX + labelWidth, y);
		});

		this.ctx.restore();
	}

	drawFaceLandmarks(offsetX, offsetY, drawWidth, drawHeight) {
		if (!this.currentFaceLandmarks || this.currentFaceLandmarks.length === 0) {
			return;
		}

		this.ctx.save();
		this.ctx.globalAlpha = 0.6; // Set once outside loop
		this.ctx.fillStyle = '#666666'; // Dark gray for face landmarks
		
		// Draw all face landmarks as small dots (no connection lines)
		for (let i = 0; i < this.currentFaceLandmarks.length; i++) {
			const landmark = this.currentFaceLandmarks[i];
			const x = offsetX + landmark.x * drawWidth;
			const y = offsetY + landmark.y * drawHeight;
			
			this.ctx.beginPath();
			this.ctx.arc(x, y, 1.5, 0, Math.PI * 2);
			this.ctx.fill();
		}

		this.ctx.restore();
	}

	drawWorldLandmarks(offsetX, offsetY, drawWidth, drawHeight) {
		if (!this.currentWorldLandmarks || !this.currentPoseLandmarks) return;

		// Draw world landmarks as 3D visualization overlay
		// We'll show depth (Z) differences more prominently
		this.ctx.save();
		this.ctx.globalAlpha = 0.8;

		// Find center point (hips) for reference
		const leftHip = this.currentWorldLandmarks[23];
		const rightHip = this.currentWorldLandmarks[24];
		const hipCenterZ = leftHip && rightHip ? (leftHip.z + rightHip.z) / 2 : 0;

		// Draw world landmarks with enhanced Z visualization
		for (let i = 0; i < this.currentWorldLandmarks.length; i++) {
			const worldLandmark = this.currentWorldLandmarks[i];
			const screenLandmark = this.currentPoseLandmarks[i];

			if (!worldLandmark || !screenLandmark || this.getLandmarkVisibility(i) < 0.3) continue;

			const x = offsetX + screenLandmark.x * drawWidth;
			const y = offsetY + screenLandmark.y * drawHeight;

			// Calculate depth relative to hip center (in meters)
			const depthOffset = worldLandmark.z - hipCenterZ;
			
			// Visualize depth with color intensity and size
			// Closer = brighter red, farther = darker blue
			const depthNormalized = Math.max(-0.5, Math.min(0.5, depthOffset));
			const depthIntensity = Math.abs(depthNormalized) * 2;
			
			let depthColor;
			if (depthNormalized > 0) {
				// Forward (toward camera) - red
				depthColor = `rgba(255, ${255 - depthIntensity * 255}, ${255 - depthIntensity * 255}, 0.8)`;
			} else {
				// Backward (away from camera) - blue
				depthColor = `rgba(${255 - depthIntensity * 255}, ${255 - depthIntensity * 255}, 255, 0.8)`;
			}

			// Draw depth indicator ring
			const ringSize = 8 + Math.abs(depthNormalized) * 20;
			this.ctx.strokeStyle = depthColor;
			this.ctx.lineWidth = 2;
			this.ctx.beginPath();
			this.ctx.arc(x, y, ringSize, 0, Math.PI * 2);
			this.ctx.stroke();

			// Draw connecting line to show 3D position if significant depth difference
			if (Math.abs(depthNormalized) > 0.1) {
				const baseX = offsetX + screenLandmark.x * drawWidth;
				const baseY = offsetY + screenLandmark.y * drawHeight;
				const offsetAmount = depthNormalized * 30; // Visual offset for depth
				
				this.ctx.strokeStyle = depthColor;
				this.ctx.lineWidth = 1;
				this.ctx.setLineDash([2, 2]);
				this.ctx.beginPath();
				this.ctx.moveTo(baseX, baseY);
				this.ctx.lineTo(baseX + offsetAmount, baseY);
				this.ctx.stroke();
				this.ctx.setLineDash([]);
			}
		}

		this.ctx.restore();
	}

	disconnect() {
		this.isVisualizing = false;

		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}

		if (this.poseLandmarker) {
			this.poseLandmarker.close();
			this.poseLandmarker = null;
		}

		if (this.faceLandmarker) {
			this.faceLandmarker.close();
			this.faceLandmarker = null;
		}

		if (this.mediaStream) {
			this.mediaStream.getTracks().forEach(track => track.stop());
			this.mediaStream = null;
		}

		if (this.video) {
			this.video.pause();
			this.video.srcObject = null;
			this.video = null;
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
		this.currentPoseLandmarks = null;
		this.currentWorldLandmarks = null;
		this.currentFaceLandmarks = null;
		this.currentFaceBlendshapes = null;
		this.currentVisibility = null;
		this.smoothedPoseLandmarks = null;
		this.smoothedWorldLandmarks = null;
		this.smoothedFaceLandmarks = null;
		this.blendshapeMap = null;
		this.drawWidth = 0;
		this.drawHeight = 0;
		this.offsetX = 0;
		this.offsetY = 0;
		this.videoAspect = 0;
	}
}