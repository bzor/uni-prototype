// MediaPipe skeletal tracking module for Cam
import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export class CamSkeletal {
	constructor() {
		this.cam = null;
		this.poseLandmarker = null;
		this.isProcessing = false;
		this.animationFrameId = null;
		this.debugLogged = false;
		
		// Smoothing state for temporal smoothing
		this.smoothedPoseLandmarks = null;
		// Smoothing factor: 0 = no smoothing (jittery), 1 = infinite smoothing (very laggy)
		// Recommended range: 0.5-0.8. Default 0.7 provides good balance.
		this.smoothingFactor = 0.7;
		
		// Current pose data
		this.currentPoseLandmarks = null;
		this.currentVisibility = null;
		
		// Skeleton change tracking
		this.sensitivity = 0.3; // 0.0 = low sensitivity (large changes), 1.0 = high sensitivity (small changes)
		this.previousPoseData = null; // Store previous frame's pose data for comparison
		this.MAX_CHANGE_THRESHOLD = 0.05; // Maximum change threshold (when sensitivity = 0)
		this.MIN_CHANGE_THRESHOLD = 0.002; // Minimum change threshold (when sensitivity = 1)
		this.changeScoreHistory = []; // Store recent change scores for smoothing (circular buffer)
		this.changeScoreHistoryIndex = 0; // Current index in circular buffer
		this.changeScoreHistoryCount = 0; // Number of valid entries in buffer
		this.CHANGE_SCORE_HISTORY_SIZE = 20; // Number of frames to average (more for skeletal due to higher frame rate)
		
		// Reusable arrays/objects to avoid allocations
		this.reusableSmoothedLandmarks = []; // Reusable array for smoothed landmarks
		this.reusablePreviousPoseData = []; // Reusable array for previous pose data
		
		// Constants
		this.UPPER_BODY_INDICES = [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]; // shoulders, elbows, wrists
		
		// Reusable event detail object
		this.reusableEventDetail = {
			changeScore: 0,
			threshold: 0,
			sensitivity: 0
		};
	}

	init(cam) {
		if (!cam) {
			console.log("CamSkeletal error: must pass cam reference");
			return;
		}
		
		this.cam = cam;
		this.setupMediaPipe();
	}

	async setupMediaPipe() {
		try {
			// Wait for video to be available from Cam (video is created asynchronously)
			if (!this.cam.video) {
				// Poll for video availability
				const checkVideo = setInterval(() => {
					if (this.cam.video && this.cam.video.readyState >= this.cam.video.HAVE_METADATA) {
						clearInterval(checkVideo);
						this.initializePoseLandmarker();
					}
				}, 100);
				
				// Timeout after 10 seconds
				setTimeout(() => {
					clearInterval(checkVideo);
					if (!this.cam.video) {
						console.error('[CamSkeletal] Video not available after timeout');
					}
				}, 10000);
				return;
			}
			
			await this.initializePoseLandmarker();
		} catch (error) {
			console.error('[CamSkeletal] Error setting up MediaPipe:', error);
		}
	}

	async initializePoseLandmarker() {
		if (!this.cam.video) {
			console.error('[CamSkeletal] Video not available');
			return;
		}

		try {
			// Initialize MediaPipe Solutions Pose Landmarker
			const vision = await FilesetResolver.forVisionTasks(
				'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
			);

			// Configure PoseLandmarker with smoothing options
			this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
				baseOptions: {
					modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task`,
					delegate: 'GPU'
				},
				runningMode: 'VIDEO',
				numPoses: 1,
				minPoseDetectionConfidence: 0.5,
				minPosePresenceConfidence: 0.5,
				minTrackingConfidence: 0.5
			});

			if (this.cam?.verboseLogging) {
				console.log('[CamSkeletal] MediaPipe Pose Landmarker initialized successfully');
				console.log('[CamSkeletal] Video dimensions:', this.cam.video.videoWidth, 'x', this.cam.video.videoHeight);
			}

			this.isProcessing = true;
			this.startProcessing();
		} catch (error) {
			console.error('[CamSkeletal] Error initializing Pose Landmarker:', error);
		}
	}

	startProcessing() {
		if (!this.isProcessing) return;
		const processLoop = () => {
			if (!this.isProcessing) return;
			this.processFrame();
			this.animationFrameId = requestAnimationFrame(processLoop);
		};
		processLoop();
	}

	processFrame() {
		if (!this.isProcessing || !this.cam.video || !this.poseLandmarker) return;

		// Check if video is ready and has valid dimensions
		if (this.cam.video.readyState === this.cam.video.HAVE_ENOUGH_DATA && 
		    this.cam.video.videoWidth > 0 && this.cam.video.videoHeight > 0) {
			try {
				const startTimeMs = performance.now();
				
				// Detect pose
				const results = this.poseLandmarker.detectForVideo(this.cam.video, startTimeMs);

				// Debug: log what's available in results (every frame until we see landmarks)
				if (!this.debugLogged || (!results.landmarks || results.landmarks.length === 0)) {
					if (this.cam?.verboseLogging) {
						console.log('[CamSkeletal] Results object keys:', Object.keys(results));
						console.log('[CamSkeletal] landmarks:', results.landmarks?.length);
						console.log('[CamSkeletal] Video being processed:', {
							width: this.cam.video.videoWidth,
							height: this.cam.video.videoHeight,
							readyState: this.cam.video.readyState
						});
					}
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

				// Apply temporal smoothing to reduce jitter
				this.currentPoseLandmarks = this.smoothLandmarks(rawPoseLandmarks, this.smoothedPoseLandmarks);
				
				// Check for skeleton changes and fire skeletonchanged event
				this.checkSkeletonChange();
				
				// Update smoothed state for next frame
				this.smoothedPoseLandmarks = this.currentPoseLandmarks;
			} catch (error) {
				if (!this.debugLogged) {
					console.error('[CamSkeletal] Error detecting pose:', error);
					this.debugLogged = true;
				}
			}
		}
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
		const alpha = 1.0 - this.smoothingFactor;
		const landmarkCount = currentLandmarks.length;
		
		// Reuse array and objects to avoid allocations (but create new array to avoid reference issues)
		const smoothed = new Array(landmarkCount);
		const reusable = this.reusableSmoothedLandmarks;
		
		// Ensure reusable pool has enough objects
		while (reusable.length < landmarkCount) {
			reusable.push({ x: 0, y: 0, z: 0, visibility: 1.0 });
		}
		
		for (let i = 0; i < landmarkCount; i++) {
			const current = currentLandmarks[i];
			const previous = previousLandmarks[i];
			// Reuse object from pool but create new array entry (to avoid reference issues)
			const smoothedLandmark = reusable[i];
			
			smoothedLandmark.x = previous.x * this.smoothingFactor + current.x * alpha;
			smoothedLandmark.y = previous.y * this.smoothingFactor + current.y * alpha;
			smoothedLandmark.z = previous.z !== undefined && current.z !== undefined 
				? previous.z * this.smoothingFactor + current.z * alpha 
				: current.z;
			smoothedLandmark.visibility = current.visibility !== undefined ? current.visibility : 1.0;
			
			// Create new object for array (must be unique per frame to avoid reference issues)
			smoothed[i] = {
				x: smoothedLandmark.x,
				y: smoothedLandmark.y,
				z: smoothedLandmark.z,
				visibility: smoothedLandmark.visibility
			};
		}
		
		return smoothed;
	}

	getLandmarkVisibility(index) {
		// MediaPipe Solutions may have visibility in the landmark object or separate array
		if (this.currentPoseLandmarks && this.currentPoseLandmarks[index]) {
			const landmark = this.currentPoseLandmarks[index];
			if (landmark.visibility !== undefined) {
				return landmark.visibility;
			}
			if (this.currentVisibility && this.currentVisibility[index] !== undefined) {
				return this.currentVisibility[index];
			}
		}
		return 1.0;
	}

	getCurrentPoseLandmarks() {
		return this.currentPoseLandmarks;
	}

	getCurrentVisibility() {
		return this.currentVisibility;
	}

	// Set sensitivity (0.0 to 1.0)
	setSensitivity(value) {
		this.sensitivity = Math.max(0.0, Math.min(1.0, value));
	}

	// Calculate change score between two pose states
	// Returns a value representing the magnitude of skeleton movement
	calculateSkeletonChange(previousPose, currentPose) {
		if (!previousPose || !currentPose) return 1.0; // New pose or lost pose = maximum change
		if (previousPose.length !== currentPose.length) return 1.0; // Different landmark count = maximum change
		
		// Calculate average movement across all visible landmarks
		// Focus on upper body landmarks (11-22) for more meaningful movement detection
		const upperBodyIndices = this.UPPER_BODY_INDICES;
		
		let totalMovement = 0.0;
		let visibleCount = 0;
		
		for (let i = 0, len = upperBodyIndices.length; i < len; i++) {
			const idx = upperBodyIndices[i];
			if (idx >= previousPose.length || idx >= currentPose.length) continue;
			
			const prev = previousPose[idx];
			const curr = currentPose[idx];
			
			// Only consider visible landmarks
			const prevVis = prev.visibility !== undefined ? prev.visibility : 1.0;
			const currVis = curr.visibility !== undefined ? curr.visibility : 1.0;
			
			if (prevVis > 0.3 && currVis > 0.3) {
				// Calculate normalized distance (MediaPipe coordinates are normalized 0-1)
				const dx = curr.x - prev.x;
				const dy = curr.y - prev.y;
				const distance = Math.sqrt(dx * dx + dy * dy);
				totalMovement += distance;
				visibleCount++;
			}
		}
		
		// Average movement across visible landmarks
		if (visibleCount === 0) return 0.0;
		
		const avgMovement = totalMovement / visibleCount;
		// Return raw movement score (no scaling)
		return avgMovement;
	}

	// Get current change threshold based on sensitivity
	getChangeThreshold() {
		// Low sensitivity (0.0) = high threshold (MAX_CHANGE_THRESHOLD)
		// High sensitivity (1.0) = low threshold (MIN_CHANGE_THRESHOLD)
		return this.MAX_CHANGE_THRESHOLD - (this.sensitivity * (this.MAX_CHANGE_THRESHOLD - this.MIN_CHANGE_THRESHOLD));
	}

	// Check for skeleton changes and fire event if threshold exceeded
	checkSkeletonChange() {
		if (!this.cam || !this.cam.eventTarget) return;
		
		const eventTarget = this.cam.eventTarget;
		
		// Compare with previous pose data
		if (this.previousPoseData !== null && this.currentPoseLandmarks !== null) {
			const rawChangeScore = this.calculateSkeletonChange(this.previousPoseData, this.currentPoseLandmarks);
			
			// Smooth change score over recent frames using circular buffer (avoid shift() O(n) operation)
			const history = this.changeScoreHistory;
			const historySize = this.CHANGE_SCORE_HISTORY_SIZE;
			const idx = this.changeScoreHistoryIndex;
			
			// Initialize buffer if needed
			if (history.length < historySize) {
				history.length = historySize;
				for (let i = 0; i < historySize; i++) {
					history[i] = 0;
				}
			}
			
			// Write to circular buffer
			history[idx] = rawChangeScore;
			this.changeScoreHistoryIndex = (idx + 1) % historySize;
			
			// Update count (only increases until buffer is full)
			if (this.changeScoreHistoryCount < historySize) {
				this.changeScoreHistoryCount++;
			}
			
			// Calculate average change score (only over valid entries)
			// Handle circular buffer correctly - iterate in chronological order
			let avgChangeScore = 0;
			const count = this.changeScoreHistoryCount;
			if (count === historySize) {
				// Buffer is full - iterate from current index (oldest) to end, then wrap to start
				for (let i = 0; i < count; i++) {
					const actualIdx = (idx + i) % historySize;
					avgChangeScore += history[actualIdx];
				}
			} else {
				// Buffer not full - iterate from start
				for (let i = 0; i < count; i++) {
					avgChangeScore += history[i];
				}
			}
			avgChangeScore /= count;
			
			const threshold = this.getChangeThreshold();
			
			if (avgChangeScore >= threshold) {
				// Reuse event detail object to avoid allocation
				const detail = this.reusableEventDetail;
				detail.changeScore = avgChangeScore;
				detail.threshold = threshold;
				detail.sensitivity = this.sensitivity;
				
				eventTarget.dispatchEvent(new CustomEvent('skeletonchanged', {
					detail: detail
				}));
			}
		}
		
		// Store current pose as previous for next comparison
		// Deep copy to avoid reference issues (reuse objects where possible)
		if (this.currentPoseLandmarks !== null) {
			const landmarkCount = this.currentPoseLandmarks.length;
			const reusable = this.reusablePreviousPoseData;
			
			// Ensure reusable pool has enough objects
			while (reusable.length < landmarkCount) {
				reusable.push({ x: 0, y: 0, z: undefined, visibility: 1.0 });
			}
			
			// Create new array but reuse objects from pool
			const previousPose = new Array(landmarkCount);
			for (let i = 0; i < landmarkCount; i++) {
				const src = this.currentPoseLandmarks[i];
				const dst = reusable[i];
				
				dst.x = src.x;
				dst.y = src.y;
				dst.z = src.z !== undefined ? src.z : undefined;
				dst.visibility = src.visibility !== undefined ? src.visibility : 1.0;
				
				// Create new object for array (must be unique to avoid reference issues)
				previousPose[i] = {
					x: dst.x,
					y: dst.y,
					z: dst.z,
					visibility: dst.visibility
				};
			}
			
			this.previousPoseData = previousPose;
		} else {
			// No pose detected - clear previous data
			this.previousPoseData = null;
		}
	}

	disconnect() {
		this.isProcessing = false;

		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}

		if (this.poseLandmarker) {
			this.poseLandmarker.close();
			this.poseLandmarker = null;
		}

		this.currentPoseLandmarks = null;
		this.currentVisibility = null;
		this.smoothedPoseLandmarks = null;
		// Clear skeleton change tracking
		this.previousPoseData = null;
		this.changeScoreHistory.length = 0;
		this.changeScoreHistoryIndex = 0;
		this.changeScoreHistoryCount = 0;
		// Clear reusable arrays
		this.reusableSmoothedLandmarks.length = 0;
		this.reusablePreviousPoseData.length = 0;
	}
}

