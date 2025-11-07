// Face recognition module for Cam using face-api.js
import * as faceapi from 'face-api.js';

export class CamFace {
	constructor() {
		this.cam = null;
		this.faceApiLoaded = false;
		this.faceRecognitionReady = false;
		this.currentFaces = []; // Current frame's detected faces (for visualizer access)
		
		// Track which optional models are available
		this.hasExpressionModel = false;
		this.hasAgeGenderModel = false;
		
		// Age smoothing - store age history for temporal averaging
		// Use simple array per face index for smoothing (since we don't track identities)
		this.ageHistory = []; // Array of arrays: [faceIndex][{timestamp, age}]
		this.AGE_SMOOTHING_WINDOW_MS = 3000; // Average age over last 3 seconds
		
		// Configure Tiny Face Detector for better stability across pose changes
		// inputSize: 608 gives best accuracy, 416 is good balance, 320 is faster but less accurate
		// scoreThreshold: 0.5 is default, lower = more detections but more false positives
		this.tinyFaceDetectorOptions = new faceapi.TinyFaceDetectorOptions({
			inputSize: 512, // Higher resolution for better accuracy (320, 416, 512, 608)
			scoreThreshold: 0.5 // Detection confidence threshold
		});
		
		// Reusable arrays/objects to avoid allocations
		this.processedFacesArray = []; // Reused for processedFaces
		this.landmarkPositionsArray = []; // Reused for landmark positions
		this.expressionKeys = ['happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised', 'neutral'];
		
		// Face change tracking
		this.sensitivity = 0.3; // 0.0 = low sensitivity (large changes), 1.0 = high sensitivity (small changes)
		this.previousFaceData = null; // Store previous frame's face data for comparison
		this.MAX_CHANGE_THRESHOLD = 0.05; // Maximum change threshold (when sensitivity = 0)
		this.MIN_CHANGE_THRESHOLD = 0.002; // Minimum change threshold (when sensitivity = 1)
		this.changeScoreHistory = []; // Store recent change scores for smoothing
		this.CHANGE_SCORE_HISTORY_SIZE = 5; // Number of frames to average
	}

	async init(cam) {
		if (!cam) {
			console.log("CamFace error: must pass cam reference");
			return;
		}
		
		this.cam = cam;
		await this.loadFaceApiModels();
	}

	async loadFaceApiModels() {
		if (this.faceApiLoaded) return;

		try {
			if (this.cam?.verboseLogging) {
				console.log('[FACE] Loading face-api.js models...');
			}
			
			// Load models from local directory first (fastest), then try CDN fallbacks
			// Models are in public/models/ which Vite serves at /models/
			const CDN_OPTIONS = [
				'/models/', // Local models (served from public/models/ by Vite)
				'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js/weights/', // GitHub-based CDN (works for all models)
				'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/',
				'https://unpkg.com/face-api.js@0.22.2/weights/'
			];

			// Core models (required)
			const CORE_MODELS = [
				{ net: faceapi.nets.tinyFaceDetector, name: 'tinyFaceDetector' },
				{ net: faceapi.nets.faceLandmark68Net, name: 'faceLandmark68Net' }
			];

			// Optional models
			const OPTIONAL_MODELS = [
				{ net: faceapi.nets.faceExpressionNet, name: 'faceExpressionNet', flag: 'hasExpressionModel' },
				{ net: faceapi.nets.ageGenderNet, name: 'ageGenderNet', flag: 'hasAgeGenderModel' }
			];

			// Load core models first
			let coreLoaded = false;
			for (const MODEL_URL of CDN_OPTIONS) {
				try {
					await Promise.all(CORE_MODELS.map(m => m.net.loadFromUri(MODEL_URL)));
					if (this.cam?.verboseLogging) {
						console.log(`[FACE] Core models loaded from: ${MODEL_URL}`);
					}
					coreLoaded = true;
					break;
				} catch (urlError) {
					if (this.cam?.verboseLogging) {
						console.warn(`[FACE] Failed to load core models from ${MODEL_URL}, trying next...`);
					}
					continue;
				}
			}

			if (!coreLoaded) {
				throw new Error('Failed to load core models from all sources');
			}

			this.faceApiLoaded = true;
			this.faceRecognitionReady = true;

			// Try to load optional models (don't fail if they're missing)
			for (const MODEL_URL of CDN_OPTIONS) {
				for (const optionalModel of OPTIONAL_MODELS) {
					if (this[optionalModel.flag]) continue; // Already loaded
					
					try {
						await optionalModel.net.loadFromUri(MODEL_URL);
						this[optionalModel.flag] = true;
						if (this.cam?.verboseLogging) {
							console.log(`[FACE] ${optionalModel.name} loaded from: ${MODEL_URL}`);
						}
					} catch (err) {
						// Silently continue - this model is optional
					}
				}
			}

			// Log which optional models are available
			const availableOptional = OPTIONAL_MODELS
				.filter(m => this[m.flag])
				.map(m => m.name);
			
			if (this.cam?.verboseLogging) {
				if (availableOptional.length > 0) {
					console.log(`[FACE] Optional models loaded: ${availableOptional.join(', ')}`);
				} else {
					console.log('[FACE] Optional models (expressions, age/gender) not available');
				}
			}

		} catch (error) {
			console.error('[FACE] Error loading face-api.js models:', error);
			if (this.cam?.verboseLogging) {
				console.warn('[FACE] Face detection will be disabled. Models need to be downloaded.');
				console.warn('[FACE] Download models from: https://github.com/justadudewhohacks/face-api.js/tree/master/weights');
				console.warn('[FACE] Place them in a /models/ directory or host on a CDN');
			}
		}
	}

	// Calculate smoothed age from history (per face index)
	getSmoothedAge(faceIndex, currentAge, timestamp) {
		if (currentAge === null || currentAge === undefined) return null;
		
		// Get or create age history for this face index
		let history = this.ageHistory[faceIndex];
		if (!history) {
			history = [];
			this.ageHistory[faceIndex] = history;
		}
		
		// Add current age to history
		history.push({ timestamp, age: currentAge });
		
		// Remove entries outside the smoothing window (more efficient than splice)
		const cutoffTime = timestamp - this.AGE_SMOOTHING_WINDOW_MS;
		let validStart = 0;
		const historyLen = history.length;
		for (let i = 0; i < historyLen; i++) {
			if (history[i].timestamp >= cutoffTime) {
				validStart = i;
				break;
			}
		}
		
		// If we need to remove entries, shift array in-place
		if (validStart > 0) {
			const newLen = historyLen - validStart;
			for (let i = 0; i < newLen; i++) {
				history[i] = history[validStart + i];
			}
			history.length = newLen;
		}
		
		// Calculate average age from remaining history
		const finalLen = history.length;
		if (finalLen === 0) return currentAge;
		
		let sum = 0;
		for (let j = 0; j < finalLen; j++) {
			sum += history[j].age;
		}
		return sum / finalLen;
	}

	// Process faces in current frame
	async processFaces() {
		// Cache frequently accessed properties
		const cam = this.cam;
		const video = cam.video;
		const canvas = cam.canvas;
		if (!this.faceRecognitionReady || !video || !canvas) return;

		try {
			// Build detection chain based on available models - use cached options
			let detectionChain = faceapi
				.detectAllFaces(video, this.tinyFaceDetectorOptions)
				.withFaceLandmarks();
			
			// Add optional features if models are available
			if (this.hasExpressionModel) {
				detectionChain = detectionChain.withFaceExpressions();
			}
			if (this.hasAgeGenderModel) {
				detectionChain = detectionChain.withAgeAndGender();
			}
			
			const detections = await detectionChain;

			// Process each detected face - reuse array
			const processedFaces = this.processedFacesArray;
			processedFaces.length = 0;
			const expressionKeys = this.expressionKeys;
			const now = Date.now(); // Cache Date.now() call
			
			for (let i = 0, len = detections.length; i < len; i++) {
				const detection = detections[i];

				// Extract face data for visualizer
				const box = detection.detection.box;
				const landmarks = detection.landmarks;
				
				// Extract expressions (if available) - avoid creating new object if possible
				const detectionExpressions = detection.expressions;
				let expressions = null;
				let dominantExpression = null;
				if (detectionExpressions) {
					expressions = {
						happy: detectionExpressions.happy,
						sad: detectionExpressions.sad,
						angry: detectionExpressions.angry,
						fearful: detectionExpressions.fearful,
						disgusted: detectionExpressions.disgusted,
						surprised: detectionExpressions.surprised,
						neutral: detectionExpressions.neutral
					};
					
					// Get dominant expression - avoid Object.entries() by iterating keys directly
					let maxVal = -1;
					for (let j = 0, keyLen = expressionKeys.length; j < keyLen; j++) {
						const key = expressionKeys[j];
						const val = expressions[key];
						if (val > maxVal) {
							maxVal = val;
							dominantExpression = key;
						}
					}
				}
				
				// Extract age and gender (if available)
				const rawAge = detection.age || null;
				const gender = detection.gender || null;
				// Smooth age over time to reduce jitter (use face index for tracking)
				const age = rawAge !== null ? this.getSmoothedAge(i, rawAge, now) : null;

				// Map landmark positions - reuse array
				const landmarkPositions = landmarks.positions;
				const landmarkArray = this.landmarkPositionsArray;
				landmarkArray.length = 0;
				for (let j = 0, posLen = landmarkPositions.length; j < posLen; j++) {
					const pos = landmarkPositions[j];
					landmarkArray.push({ x: pos.x, y: pos.y });
				}

				processedFaces.push({
					boundingBox: {
						x: box.x,
						y: box.y,
						width: box.width,
						height: box.height
					},
					landmarks: landmarkArray.slice(), // Create copy for this face
					expressions: expressions,
					dominantExpression: dominantExpression,
					age: age,
					gender: gender
				});
			}

			// Check for face changes and fire facechanged event
			const eventTarget = cam.eventTarget;
			if (eventTarget) {
				// Compare with previous face data
				if (this.previousFaceData !== null && processedFaces.length > 0) {
					// For simplicity, compare first face only (most prominent)
					const previousFace = this.previousFaceData.length > 0 ? this.previousFaceData[0] : null;
					const currentFace = processedFaces[0];
					
					if (previousFace && currentFace) {
						const rawChangeScore = this.calculateFaceChange(previousFace, currentFace);
						
						// Smooth change score over recent frames to reduce noise
						this.changeScoreHistory.push(rawChangeScore);
						if (this.changeScoreHistory.length > this.CHANGE_SCORE_HISTORY_SIZE) {
							this.changeScoreHistory.shift();
						}
						
						// Calculate average change score
						let avgChangeScore = 0;
						for (let i = 0, len = this.changeScoreHistory.length; i < len; i++) {
							avgChangeScore += this.changeScoreHistory[i];
						}
						avgChangeScore /= this.changeScoreHistory.length;
						
						const threshold = this.getChangeThreshold();
						
						if (avgChangeScore >= threshold) {
							eventTarget.dispatchEvent(new CustomEvent('facechanged', {
								detail: {
									changeScore: avgChangeScore,
									threshold: threshold,
									previousFace: previousFace,
									currentFace: currentFace
								}
							}));
						}
					}
				}
				
				// Store current faces as previous for next comparison
				// Deep copy to avoid reference issues
				if (processedFaces.length > 0) {
					this.previousFaceData = processedFaces.map(face => ({
						boundingBox: {
							x: face.boundingBox.x,
							y: face.boundingBox.y,
							width: face.boundingBox.width,
							height: face.boundingBox.height
						},
						expressions: face.expressions ? { ...face.expressions } : null,
						dominantExpression: face.dominantExpression
					}));
				} else {
					// No faces detected - clear previous data
					this.previousFaceData = null;
				}
			}

			// Update current faces for visualizer access
			this.currentFaces = processedFaces;

			// Emit event with all detected faces
			if (processedFaces.length > 0 && eventTarget) {
				eventTarget.dispatchEvent(new CustomEvent('facesDetected', {
					detail: { faces: processedFaces }
				}));
			}

		} catch (error) {
			console.error('[FACE] Error processing faces:', error);
		}
	}

	getCurrentFaces() {
		return this.currentFaces;
	}

	// Set sensitivity (0.0 to 1.0)
	setSensitivity(value) {
		this.sensitivity = Math.max(0.0, Math.min(1.0, value));
	}

	// Calculate change score between two face states
	// Returns a value between 0 and 1+ (can exceed 1 for very large changes)
	calculateFaceChange(previousFace, currentFace) {
		if (!previousFace || !currentFace) return 1.0; // New face or lost face = maximum change
		
		let changeScore = 0.0;
		let weightSum = 0.0;
		
		// Position change (bounding box center and size) - weight: 0.4
		const posWeight = 0.4;
		const prevBox = previousFace.boundingBox;
		const currBox = currentFace.boundingBox;
		
		// Calculate center positions
		const prevCenterX = prevBox.x + prevBox.width * 0.5;
		const prevCenterY = prevBox.y + prevBox.height * 0.5;
		const currCenterX = currBox.x + currBox.width * 0.5;
		const currCenterY = currBox.y + currBox.height * 0.5;
		
		// Normalize by face size (larger faces can move more pixels)
		const avgSize = (prevBox.width + prevBox.height + currBox.width + currBox.height) * 0.25;
		if (avgSize > 0) {
			const dx = (currCenterX - prevCenterX) / avgSize;
			const dy = (currCenterY - prevCenterY) / avgSize;
			const positionChange = Math.sqrt(dx * dx + dy * dy);
			changeScore += positionChange * posWeight;
		}
		
		// Size change (scale difference) - weight: 0.2
		const sizeWeight = 0.2;
		const prevArea = prevBox.width * prevBox.height;
		const currArea = currBox.width * currBox.height;
		if (prevArea > 0) {
			const areaRatio = currArea / prevArea;
			const sizeChange = Math.abs(Math.log(areaRatio));
			changeScore += sizeChange * sizeWeight;
		}
		
		weightSum += posWeight + sizeWeight;
		
		// Expression change (if available) - weight: 0.4
		if (previousFace.expressions && currentFace.expressions && this.hasExpressionModel) {
			const exprWeight = 0.4;
			let exprChange = 0.0;
			
			// Calculate sum of absolute differences for all expressions
			for (let i = 0, len = this.expressionKeys.length; i < len; i++) {
				const key = this.expressionKeys[i];
				const prevVal = previousFace.expressions[key] || 0;
				const currVal = currentFace.expressions[key] || 0;
				exprChange += Math.abs(currVal - prevVal);
			}
			
			// Normalize by number of expressions
			exprChange /= this.expressionKeys.length;
			changeScore += exprChange * exprWeight;
			weightSum += exprWeight;
		}
		
		// Normalize by total weight
		if (weightSum > 0) {
			changeScore /= weightSum;
		}
		
		// Return raw change score (no scaling)
		return changeScore;
	}

	// Get current change threshold based on sensitivity
	getChangeThreshold() {
		// Low sensitivity (0.0) = high threshold (MAX_CHANGE_THRESHOLD)
		// High sensitivity (1.0) = low threshold (MIN_CHANGE_THRESHOLD)
		return this.MAX_CHANGE_THRESHOLD - (this.sensitivity * (this.MAX_CHANGE_THRESHOLD - this.MIN_CHANGE_THRESHOLD));
	}

	disconnect() {
		this.faceApiLoaded = false;
		this.faceRecognitionReady = false;
		this.currentFaces = [];
		// Clear reusable arrays
		this.processedFacesArray.length = 0;
		this.landmarkPositionsArray.length = 0;
		// Clear age history (smoothing data doesn't need to persist)
		this.ageHistory = [];
		// Clear face change tracking
		this.previousFaceData = null;
		this.changeScoreHistory = [];
	}
}


