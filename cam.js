// Gemini Live Cam Module - Handles WebSocket connection, video processing, and response handling
import { GoogleGenAI, Modality } from '@google/genai';
import { CamSkeletal } from './cam-skeletal.js';
import { CamFace } from './cam-face.js';

export class Cam {
	constructor() {
		// State
		this.client = null;
		this.session = null;
		this.video = null;
		this.mediaStream = null;
		this.canvas = null;
		this.ctx = null;
		this.faceProcessingInterval = null;
		this.isRecording = false;
		this.setupComplete = false;
		this.accumulatedTextParts = []; // Use array instead of string concatenation
		this.currentTurnActive = false;
		this.eventTarget = new EventTarget();

		// Face recognition module
		this.face = null;

		// Skeletal tracking module
		this.skeletal = null;

		// Config
		this.framesPerTurn = 1; // Send immediately when frame is captured
		this.frameCount = 0; // Counter for frames sent
		this.pendingFrames = []; // Buffer frames before sending
		this.model = 'gemini-live-2.5-flash-preview';
		this.cooldownMs = 2000; // 1 second cooldown between frame sends
		this.lastFrameSendTime = 0; // Timestamp of last frame send
		this.verboseLogging = false; // Verbose logging flag

		// Stored config for delayed connection
		this.pendingApiKey = null;
		this.pendingHttpOptions = null;

		// Cached regex patterns (compiled once, reused)
		this.regexPatterns = {
			jsonExtract: /\{[\s\S]*\}/,
			transcript: /Transcript:\s*(.+?)(?:\n|Analysis:|Emoji:|$)/is,
			analysis: /Analysis:\s*(.+?)(?:\n\s*Emoji:|$)/is,
			tone: /Tone:\s*(.+?)(?:\n\s*Emoji:|$)/is,
			emoji: /Emoji:\s*([^\s\n]+)/i,
			emojiFallback: /[\u{1F300}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}]/u,
			transcriptRemove: /Transcript:.*?(?=Analysis:|Emoji:|$)/is,
			toneRemove: /Transcript:.*?(?=Tone:|Emoji:|$)/is,
			emojiRemove: /Emoji:\s*.*/i
		};

		// Reusable array to avoid allocation
		this.reusablePartsArray = [];
	}

	async init(config) {
		const { apiKey, httpOptions } = config;
		const isEphemeralToken = apiKey.startsWith('auth_tokens/');

		// Ephemeral tokens require v1alpha, regular keys can use v1beta
		const apiVersion = isEphemeralToken
			? 'v1alpha'  // Ephemeral tokens MUST use v1alpha
			: (httpOptions?.apiVersion || 'v1beta');  // Regular keys default to v1beta

		if (this.verboseLogging) {
			console.log(`[CAM] API Version: ${apiVersion}`);
		}

		// Build httpOptions with correct API version
		const finalHttpOptions = {
			...httpOptions,
			apiVersion: apiVersion
		};

		// Warn if ephemeral token used without v1alpha
		if (isEphemeralToken && apiVersion !== 'v1alpha') {
			if (this.verboseLogging) {
				console.warn('[CAM] Warning: Ephemeral tokens require v1alpha API version');
			}
		}

		// Store config but don't connect yet - wait for explicit start() call
		this.pendingApiKey = apiKey;
		this.pendingHttpOptions = finalHttpOptions;
		if (this.verboseLogging) {
			console.log('[CAM] Config stored. Call start() to connect to Gemini API.');
		}

		// Create canvas for video frame capture (needed for visualization and later for Gemini)
		this.canvas = document.createElement('canvas');
		this.ctx = this.canvas.getContext('2d');

		// Initialize face recognition module immediately (doesn't require Gemini API)
		this.face = new CamFace();
		this.face.init(this);

		// Listen for face change events - trigger frame send
		this.addEventListener('facechanged', (event) => {
			this.handleChangeEvent('face');
		});

		// Listen for skeleton change events - trigger frame send
		this.addEventListener('skeletonchanged', (event) => {
			this.handleChangeEvent('skeleton');
		});

		// Start webcam and WAIT for it to complete before returning
		await this.startWebcam();
	}

	start() {
		if (!this.pendingApiKey) {
			if (this.verboseLogging) {
				console.warn('[CAM] No pending config. Call init() first.');
			}
			return;
		}
		this.connect(this.pendingApiKey, this.pendingHttpOptions);
	}

	async connect(apiKey, httpOptions) {
		try {
			// Face module, webcam, and canvas are already initialized in init() for visualization
			// Initialize client with httpOptions for API version configuration
			this.client = new GoogleGenAI({
				apiKey: apiKey,
				httpOptions: httpOptions
			});

			// Prepare config
			// Note: responseSchema is NOT supported by Gemini Live API (see GitHub issue #1572)
			// Use explicit JSON format instructions instead
			const config = {
				responseModalities: [Modality.TEXT],
				systemInstruction: {
					parts: [{
						text: `You are a real-time visual analyzer named Uni. When you see video frames, describe what you observe and provide analysis.

CRITICAL: You MUST respond with ONLY valid JSON. No text before or after. No markdown. No code blocks. Just the raw JSON object.

Required JSON format (EXACTLY these fields, nothing else):
{
  "transcript": "concise description of what you see in the frame, highlighting number of people, style of dress, colors",
  "analysis": "brief content analysis of people only (not environment) 1-2 sentences about the actions, expressions or poses",
  "sentiment": "very short sentiment analysis of the visual content",
  "tone": "a concise description of the mood or atmosphere",
  "emoji": "single emoji representing the visual content or emotion",
  "confidence": 0.85
}

Example response:
{"transcript": "A person sitting at a desk looking at a computer", "analysis": "Someone appears focused and engaged in work, likely in an office or study environment", "sentiment": "neutral", "tone": "Professional and concentrated atmosphere", "emoji": "💻", "confidence": 0.9}

Remember: Return ONLY the JSON object. No other text.`
					}]
				}
			};
			if (this.verboseLogging) {
				console.log('[CAM.GEMINI] Config:', config);
				console.log('[CAM.GEMINI] Response modalities:', config.responseModalities);
			}

			// Connect to Gemini Live
			this.session = await this.client.live.connect({
				model: this.model,
				callbacks: {
					onopen: () => {
						if (this.verboseLogging) {
							console.log('[CAM.GEMINI] Connected to Gemini Live');
						}

						// Save API key to localStorage on successful connection
						if (apiKey) {
							localStorage.setItem('apiKey', apiKey);
							if (this.verboseLogging) {
								console.log('[STORAGE] Saved API key to localStorage');
							}
						}

						// Wait for video to be ready before enabling recording
						this.waitForVideoReady().then(() => {
							this.setupComplete = true;
							if (this.verboseLogging) {
								console.log('[CAM] SETUP COMPLETE');
							}
							// Webcam is already started in init() for visualization
							// Enable recording - frames will be sent on face/skeleton change events
							if (this.video) {
								this.isRecording = true;
								if (this.verboseLogging) {
									console.log('[CAM] Ready to send frames to Gemini on face/skeleton changes');
								}
							} else {
								// Race condition: video disappeared after waitForVideoReady() succeeded
								console.error('[CAM] RACE CONDITION: NO VIDEO after waitForVideoReady() succeeded', {
									videoExists: !!this.video,
									setupComplete: this.setupComplete,
									mediaStreamExists: !!this.mediaStream
								});
							}
						}).catch((error) => {
							console.error('[CAM] RACE CONDITION: Error waiting for video:', error.message, {
								error: error,
								videoExists: !!this.video,
								mediaStreamExists: !!this.mediaStream,
								setupComplete: this.setupComplete
							});
						});
					},
					onmessage: async (message) => {
						if (this.verboseLogging) {
							console.log('[CAM.GEMINI] Message received:', message);
						}
						this.handleGeminiResponse(message);
					},
					onerror: (error) => {
						console.error('[CAM.GEMINI] Error:', error);
					},
					onclose: (event) => {
						if (this.verboseLogging) {
							console.log('[CAM.GEMINI] Connection closed:', event);
							console.log('[CAM.GEMINI] Close reason:', event.reason);
						}
						// Stop recording immediately when connection closes
						this.isRecording = false;
						// Only disconnect if we actually had a successful connection
						if (this.setupComplete) {
							this.disconnect();
						}
					}
				},
				config: config
			});

		} catch (error) {
			console.error('Connection error:', error);
		}
	}


	async startWebcam() {
		try {
			if (this.verboseLogging) {
				console.log('[CAM] Requesting webcam access...');
			}
			this.mediaStream = await navigator.mediaDevices.getUserMedia({
				video: {
					width: { ideal: 1280 },
					height: { ideal: 720 },
					facingMode: 'user'
				}
			});

			if (this.verboseLogging) {
				console.log('[CAM] Webcam access granted');
			}

			// Create video element for processing
			this.video = document.createElement('video');
			this.video.srcObject = this.mediaStream;
			this.video.playsInline = true;
			this.video.muted = true;

			// Wait for video metadata to load before getting dimensions
			await new Promise((resolve) => {
				this.video.onloadedmetadata = () => {
					// Set canvas dimensions to match video
					this.canvas.width = this.video.videoWidth || 1280;
					this.canvas.height = this.video.videoHeight || 720;
					if (this.verboseLogging) {
						console.log('[CAM] Video dimensions:', this.canvas.width, 'x', this.canvas.height);
					}
					resolve();
				};
			});

			await this.video.play();

			// Initialize skeletal tracking module
			this.skeletal = new CamSkeletal();
			this.skeletal.init(this);

			// Start face processing loop for visualization (independent of Gemini API)
			this.startFaceProcessingLoop();

			// Note: Don't start sending frames to Gemini here - that happens in connect() onopen callback
			// This is just for visualization, so we don't set isRecording or call captureAndSendFrames()
			if (this.verboseLogging) {
				console.log('[CAM] Webcam started for visualization');
			}
		} catch (error) {
			console.error('[CAM] Error:', error);
		}
	}

	startFaceProcessingLoop() {
		// Process faces continuously for visualization (independent of Gemini API)
		const processFaces = () => {
			if (this.face && this.face.faceRecognitionReady && this.video && this.canvas) {
				// Draw video frame to canvas for face detection
				if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
					this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
					// Process faces (async, don't wait)
					this.face.processFaces().catch(err => {
						console.error('[FACE] Error in face processing:', err);
					});
				}
			}
			// Continue processing at ~10fps for visualization
			this.faceProcessingInterval = setTimeout(processFaces, 100);
		};
		processFaces();
	}

	// Handle change events from face or skeleton modules
	handleChangeEvent(source) {
		if (this.verboseLogging) {
			console.log(`[CAM] ${source.toUpperCase()} change event received`);
		}

		if (!this.isRecording || !this.setupComplete || !this.session || !this.video) {
			if (this.verboseLogging) {
				console.log(`[CAM] ${source.toUpperCase()} change ignored - not ready (isRecording: ${this.isRecording}, setupComplete: ${this.setupComplete}, session: ${!!this.session}, video: ${!!this.video})`);
			}
			return;
		}

		// Check cooldown
		const now = Date.now();
		const timeSinceLastSend = now - this.lastFrameSendTime;
		if (timeSinceLastSend < this.cooldownMs) {
			if (this.verboseLogging) {
				const remainingMs = this.cooldownMs - timeSinceLastSend;
				console.log(`[CAM] ${source.toUpperCase()} change ignored - cooldown active (${remainingMs.toFixed(0)}ms remaining)`);
			}
			return;
		}

		// Send frame
		if (this.verboseLogging) {
			console.log("IS RECORDING: " + this.isRecording);
			console.log(`[CAM] ${source.toUpperCase()} change triggered frame send`);
		}
		this.captureAndSendFrame();
	}

	captureAndSendFrame() {
		if (!this.isRecording || !this.setupComplete || !this.session || !this.video) {
			return;
		}

		// Check if video is ready
		if (this.video.readyState === this.video.HAVE_ENOUGH_DATA &&
			this.video.videoWidth > 0 && this.video.videoHeight > 0) {

			// Draw current video frame to canvas
			this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

			// Process faces in the frame (async, don't wait)
			if (this.face && this.face.faceRecognitionReady) {
				this.face.processFaces().catch(err => {
					console.error('[FACE] Error in face processing:', err);
				});
			}

			// Convert canvas to base64 JPEG
			try {
				const imageData = this.canvas.toDataURL('image/jpeg', 0.85);
				// Remove data URL prefix (data:image/jpeg;base64,) - optimize by finding comma index
				const commaIndex = imageData.indexOf(',');
				const base64Data = commaIndex >= 0 ? imageData.substring(commaIndex + 1) : imageData;

				this.frameCount++;
				// Create new object (API requires separate objects, can't reuse)
				this.pendingFrames.push({
					inlineData: {
						data: base64Data,
						mimeType: 'image/jpeg'
					}
				});

				// After collecting enough frames, send them via sendClientContent
				if (this.frameCount >= this.framesPerTurn) {
					try {
						// Send frames as Content with inlineData parts
						this.session.sendClientContent({
							turns: [{
								role: 'user',
								parts: this.pendingFrames
							}],
							turnComplete: true
						});

						// Emit frame sent event for visualizers
						this.eventTarget.dispatchEvent(new CustomEvent('framesent'));

						// Update last send time for cooldown
						this.lastFrameSendTime = Date.now();

						// Reuse array by clearing instead of recreating
						this.pendingFrames.length = 0;
						this.frameCount = 0;
					} catch (error) {
						console.error('[CAM] Error sending frames:', error);
						// Reuse array by clearing instead of recreating
						this.pendingFrames.length = 0;
						this.frameCount = 0;
						// Stop sending if there's an error
						if (error.message && error.message.includes('CLOSED')) {
							this.isRecording = false;
						}
					}
				}
			} catch (error) {
				console.error('[CAM] Error sending video frame:', error);
				// Stop sending if there's an error
				if (error.message && error.message.includes('CLOSED')) {
					this.isRecording = false;
				}
			}
		}
	}


	handleGeminiResponse(message) {
		if (this.verboseLogging) {
			console.log(message);
		}
		try {
			if (this.verboseLogging) {
				console.log('[CAM.GEMINI] Processing message:', message);
				if (message.serverContent) {
					console.log('[CAM.GEMINI] serverContent:', message.serverContent);
				}
			}

			// Handle interruption
			const interrupted = message.serverContent?.interrupted;
			if (interrupted && this.verboseLogging) {
				console.log('[CAM.GEMINI] User interrupted');
			}

			// Handle text responses
			if (message.serverContent?.modelTurn) {
				if (!this.currentTurnActive) {
					this.currentTurnActive = true;
					if (this.verboseLogging) {
						console.log('[CAM.GEMINI] Model turn started');
					}
				}

				const parts = message.serverContent.modelTurn.parts;
				if (this.verboseLogging) {
					console.log('[CAM.GEMINI] Parts:', parts);
				}
				if (parts && parts.length > 0) {
					// Accumulate text from this streaming chunk (use array to avoid string concatenation GC)
					for (const part of parts) {
						if (this.verboseLogging) {
							console.log('[CAM.GEMINI] Part:', part, 'Has text:', !!part.text, 'Has audio:', !!part.inlineData);
						}
						if (part.text) {
							if (this.verboseLogging) {
								console.log('[CAM.GEMINI] Found text:', part.text);
							}
							this.accumulatedTextParts.push(part.text);
						}
						// With TEXT modality, we should consistently get text responses
					}
				}
			}

			// Check for turn complete - Gemini finished responding
			if (message.serverContent?.turnComplete) {
				this.currentTurnActive = false;

				// Join accumulated text parts (single allocation instead of multiple concatenations)
				const accumulatedText = this.accumulatedTextParts.length > 0
					? this.accumulatedTextParts.join('')
					: '';

				if (this.verboseLogging) {
					console.log('[CAM.GEMINI] Turn complete - processing full response');
					console.log('[CAM.GEMINI] Accumulated text so far:', accumulatedText);
				}

				// Process text response
				if (accumulatedText && accumulatedText.trim().length > 0) {
					const responseData = this.parseResponse(accumulatedText);

					if (responseData) {
						const { transcript, analysis, tone, emoji, confidence, sentiment } = responseData;

						// Add to transcript log with analysis
						if (transcript && analysis) {
							this.emitPercept({ transcript, analysis, tone, emoji, sentiment, confidence });
						}
					}
				} else {
					if (this.verboseLogging) {
						console.log('[CAM.GEMINI] Turn complete but no text received');
					}
				}

				// Reset for next turn (reuse array by clearing, don't recreate)
				this.accumulatedTextParts.length = 0;
			}

		} catch (error) {
			console.error('[CAM.GEMINI] Error processing response:', error, 'Message:', message);
			this.accumulatedTextParts.length = 0;
			this.currentTurnActive = false;
		}
	}

	// Parse response - normalize Gemini's actual response format
	// Handles variations: transcription vs transcript, nested analysis objects, etc.
	parseResponse(text) {
		// Cache trimmed text to avoid multiple trim() calls
		const trimmedText = text.trim();

		try {
			// Try to parse as JSON first
			let jsonData;
			try {
				jsonData = JSON.parse(trimmedText);
			} catch (e) {
				// Not valid JSON, try to extract JSON from text if wrapped (use cached regex)
				const jsonMatch = text.match(this.regexPatterns.jsonExtract);
				if (jsonMatch) {
					jsonData = JSON.parse(jsonMatch[0]);
				} else {
					throw new Error('No JSON found');
				}
			}

			// Normalize the response to our expected format
			// Handle field name variations
			const transcript = jsonData.transcript || jsonData.transcription || null;

			// Handle analysis - could be string or nested object
			let analysis = null;
			if (typeof jsonData.analysis === 'string') {
				analysis = jsonData.analysis;
			} else if (typeof jsonData.analysis === 'object' && jsonData.analysis !== null) {
				// Nested analysis object - extract the most relevant field
				const analysisObj = jsonData.analysis;
				if (analysisObj.uni_personal_reaction) {
					analysis = analysisObj.uni_personal_reaction;
				} else if (analysisObj.response_suggestion) {
					analysis = analysisObj.response_suggestion;
				} else {
					// Build from components (reuse array to avoid allocation)
					this.reusablePartsArray.length = 0;
					if (analysisObj.sentiment?.overall) this.reusablePartsArray.push(`Sentiment: ${analysisObj.sentiment.overall}`);
					if (analysisObj.tone) this.reusablePartsArray.push(`Tone: ${analysisObj.tone}`);
					if (analysisObj.emotion_detected) this.reusablePartsArray.push(`Emotion: ${analysisObj.emotion_detected}`);
					analysis = this.reusablePartsArray.length > 0
						? this.reusablePartsArray.join('. ')
						: JSON.stringify(analysisObj);
				}
			}

			// Extract all fields - handle both string and nested sentiment
			let sentiment = null;
			if (typeof jsonData.sentiment === 'string') {
				sentiment = jsonData.sentiment;
			} else if (jsonData.sentiment?.overall) {
				sentiment = jsonData.sentiment.overall;
			} else if (jsonData.analysis?.sentiment?.overall) {
				sentiment = jsonData.analysis.sentiment.overall;
			}

			// Extract all fields - handle both string and nested tone
			let tone = null;
			if (typeof jsonData.tone === 'string') {
				tone = jsonData.tone;
			} else if (jsonData.tone?.overall) {
				tone = jsonData.tone.overall;
			} else if (jsonData.analysis?.tone?.overall) {
				tone = jsonData.analysis.tone.overall;
			}

			// Extract emoji
			const emoji = jsonData.emoji || null;

			// Extract confidence - handle string or number
			let confidence = jsonData.confidence;
			if (typeof confidence === 'string') {
				confidence = parseFloat(confidence);
			}
			if (isNaN(confidence) || confidence === null || confidence === undefined) {
				confidence = null;
			}

			// Build normalized response
			const normalized = {
				transcript,
				analysis,
				sentiment,
				tone,
				emoji: emoji || '💬',
				confidence
			};

			if (transcript || analysis) {
				return normalized;
			}
		} catch (e) {
			// JSON parsing failed, fall through to regex extraction
			if (this.verboseLogging) {
				console.log('[CAM.GEMINI] JSON parse failed, using regex fallback:', e.message);
			}
		}

		// Fallback to regex extraction for unstructured responses
		const transcript = this.extractTranscript(text);
		const analysis = this.extractAnalysis(text);
		const tone = this.extractTone(text);
		const emoji = this.extractEmoji(text);

		if (transcript || analysis) {
			return { transcript, analysis, emoji };
		}

		return null;
	}

	extractTranscript(text) {
		// Try to extract transcript from "Transcript: X" pattern (use cached regex)
		const transcriptMatch = text.match(this.regexPatterns.transcript);
		if (transcriptMatch && transcriptMatch[1]) {
			return transcriptMatch[1].trim();
		}
		return null;
	}

	extractAnalysis(text) {
		// Try to extract analysis from "Analysis: X" pattern (use cached regex)
		const analysisMatch = text.match(this.regexPatterns.analysis);
		if (analysisMatch && analysisMatch[1]) {
			return analysisMatch[1].trim();
		}
		// Fallback: if no Analysis: tag, return everything except Transcript and Emoji (use cached regex)
		return text.replace(this.regexPatterns.transcriptRemove, '')
			.replace(this.regexPatterns.emojiRemove, '')
			.trim();
	}

	extractTone(text) {
		// Try to extract tone from "Tone: X" pattern (use cached regex)
		const toneMatch = text.match(this.regexPatterns.tone);
		if (toneMatch && toneMatch[1]) {
			return toneMatch[1].trim();
		}
		// Fallback: if no Tone: tag, return everything except Transcript and Emoji (use cached regex)
		return text.replace(this.regexPatterns.toneRemove, '')
			.replace(this.regexPatterns.emojiRemove, '')
			.trim();
	}

	extractEmoji(text) {
		// Try to extract emoji from "Emoji: X" pattern (use cached regex)
		const emojiMatch = text.match(this.regexPatterns.emoji);
		if (emojiMatch && emojiMatch[1]) {
			if (this.verboseLogging) {
				console.log('[EMOJI] Matched from pattern:', emojiMatch[1]);
			}
			// Take only the first few characters which should be the emoji
			return emojiMatch[1].substring(0, 2);
		}

		// Fallback: extract any emoji from the text using comprehensive regex (use cached regex)
		const match = text.match(this.regexPatterns.emojiFallback);
		if (match) {
			return match[0];
		}

		return '💬';
	}

	emitPercept(percept) {
		this.eventTarget.dispatchEvent(new CustomEvent('percept', { detail: percept }))
	}

	addEventListener(eventTag, event) {
		this.eventTarget.addEventListener(eventTag, event);
	}

	removeEventListener(eventTag, event) {
		this.eventTarget.removeEventListener(eventTag, event);
	}

	// Getter methods for visualizer access
	getCurrentFaces() {
		return this.face ? this.face.getCurrentFaces() : [];
	}

	getKnownFaces() {
		return this.face ? this.face.getKnownFaces() : [];
	}

	getFaceData(faceHash) {
		return this.face ? this.face.getFaceData(faceHash) : null;
	}

	// Getter methods for skeletal data
	getCurrentPoseLandmarks() {
		return this.skeletal ? this.skeletal.getCurrentPoseLandmarks() : null;
	}

	getSkeletalLandmarkVisibility(index) {
		return this.skeletal ? this.skeletal.getLandmarkVisibility(index) : 1.0;
	}

	// Set verbose logging flag
	setVerboseLogging(enabled) {
		this.verboseLogging = enabled;
	}

	// Wait for video to be ready before enabling recording
	async waitForVideoReady() {
		const maxWaitTime = 5000; // 5 seconds max wait
		const checkInterval = 100; // Check every 100ms
		const startTime = Date.now();

		console.log('[CAM] Waiting for video to be ready...', {
			videoExists: !!this.video,
			videoReadyState: this.video?.readyState,
			videoWidth: this.video?.videoWidth,
			videoHeight: this.video?.videoHeight
		});

		while (Date.now() - startTime < maxWaitTime) {
			if (this.video && 
				this.video.readyState >= this.video.HAVE_METADATA &&
				this.video.videoWidth > 0 && 
				this.video.videoHeight > 0) {
				if (this.verboseLogging) {
					console.log('[CAM] Video is ready');
				}
				return;
			}
			await new Promise(resolve => setTimeout(resolve, checkInterval));
		}

		// Race condition detected - log detailed state
		const elapsed = Date.now() - startTime;
		console.error('[CAM] RACE CONDITION: Video not ready within timeout period', {
			elapsedMs: elapsed,
			videoExists: !!this.video,
			videoReadyState: this.video?.readyState,
			videoWidth: this.video?.videoWidth,
			videoHeight: this.video?.videoHeight,
			mediaStreamExists: !!this.mediaStream,
			mediaStreamActive: this.mediaStream?.active,
			setupComplete: this.setupComplete,
			isRecording: this.isRecording
		});

		throw new Error('Video not ready within timeout period');
	}

	disconnect() {
		// Stop face processing loop
		if (this.faceProcessingInterval) {
			clearTimeout(this.faceProcessingInterval);
			this.faceProcessingInterval = null;
		}

		// Stop webcam
		if (this.mediaStream) {
			this.mediaStream.getTracks().forEach(track => track.stop());
			this.mediaStream = null;
		}

		// Stop video element
		if (this.video) {
			this.video.pause();
			this.video.srcObject = null;
			this.video = null;
		}

		// Clear canvas
		if (this.canvas) {
			this.canvas = null;
			this.ctx = null;
		}

		// Close session
		if (this.session) {
			this.session.close();
			this.session = null;
		}

		// Clear client
		this.client = null;

		// Disconnect face module
		if (this.face) {
			this.face.disconnect();
			this.face = null;
		}

		// Disconnect skeletal module
		if (this.skeletal) {
			this.skeletal.disconnect();
			this.skeletal = null;
		}

		// Reset state
		this.isRecording = false;
		this.setupComplete = false;
		this.accumulatedTextParts.length = 0;
		this.currentTurnActive = false;
		this.frameCount = 0;
		this.pendingFrames.length = 0;
		this.lastFrameSendTime = 0;
	}
}
