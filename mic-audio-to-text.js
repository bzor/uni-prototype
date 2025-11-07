// Gemini Live Audio Module - Handles WebSocket connection, audio processing, and response handling
import { GoogleGenAI, Modality } from '@google/genai';

export class MicAudioToText {
	constructor() {
		// State
		this.client = null;
		this.session = null;
		this.inputAudioContext = null;
		this.mediaStream = null;
		this.audioProcessor = null;
		this.isRecording = false;
		this.setupComplete = false;
		this.accumulatedText = '';
		this.currentTurnActive = false;
		this.eventTarget = new EventTarget();

		// Config
		this.inputSampleRate = 16000;
		this.model = 'gemini-live-2.5-flash-preview';
		this.verboseLogging = false; // Verbose logging flag
		
		// Stored config for delayed connection
		this.pendingApiKey = null;
		this.pendingHttpOptions = null;
	}

	init(config) {
		const { apiKey, httpOptions } = config;
		const isEphemeralToken = apiKey.startsWith('auth_tokens/');
		
		// Ephemeral tokens require v1alpha, regular keys can use v1beta
		const apiVersion = isEphemeralToken 
			? 'v1alpha'  // Ephemeral tokens MUST use v1alpha
			: (httpOptions?.apiVersion || 'v1beta');  // Regular keys default to v1beta

		if (this.verboseLogging) {
			console.log(`[MIC] API Version: ${apiVersion}`);
		}
		
		// Build httpOptions with correct API version
		const finalHttpOptions = {
			...httpOptions,
			apiVersion: apiVersion
		};
		
		// Warn if ephemeral token used without v1alpha
		if (isEphemeralToken && apiVersion !== 'v1alpha') {
			if (this.verboseLogging) {
				console.warn('[MIC] Warning: Ephemeral tokens require v1alpha API version');
			}
		}
		
		// Store config but don't connect yet - wait for explicit start() call
		this.pendingApiKey = apiKey;
		this.pendingHttpOptions = finalHttpOptions;
		if (this.verboseLogging) {
			console.log('[MIC] Config stored. Call start() to connect to Gemini API.');
		}
		
		// Start microphone immediately for visualization (doesn't require Gemini API)
		this.startMicrophone();
	}

	start() {
		if (!this.pendingApiKey) {
			if (this.verboseLogging) {
				console.warn('[MIC] No pending config. Call init() first.');
			}
			return;
		}
		this.connect(this.pendingApiKey, this.pendingHttpOptions);
	}

	async connect(apiKey, httpOptions) {
		try {
			// Initialize client with httpOptions for API version configuration
			this.client = new GoogleGenAI({
				apiKey: apiKey,
				httpOptions: httpOptions
			});

			// Initialize audio context
			this.inputAudioContext = new (window.AudioContext || window.webkitAudioContext)({
				sampleRate: this.inputSampleRate
			});

			// Prepare config
			// Note: responseSchema is NOT supported by Gemini Live API (see GitHub issue #1572)
			// Use explicit JSON format instructions instead
			const config = {
				responseModalities: [Modality.TEXT],
				systemInstruction: {
					parts: [{
						text: `You are a real-time speech analyzer named Uni. When you hear audio input, transcribe it and provide analysis. Audio will only every be English, do not interpret speech as anything but English.

CRITICAL: You MUST respond with ONLY valid JSON. No text before or after. No markdown. No code blocks. Just the raw JSON object.

Required JSON format (EXACTLY these fields, nothing else):
{
  "transcript": "exact transcription",
  "analysis": "brief content analysis in 1-2 sentences",
  "sentiment": "very short sentiment analysis",
  "tone": "a concise description of the tone of voice",
  "emoji": "single emoji of emotional content",
  "confidence": 0.85
}

Example response:
{"transcript": "Hello there", "analysis": "A friendly greeting, initiating a conversation", "sentiment": "positive", "tone": "A warm male tone of voice", emoji": "👋", "confidence": 0.9}

Remember: Return ONLY the JSON object. No other text.`
					}]
				}
			};
			if (this.verboseLogging) {
				console.log('[GEMINI] Config:', config);
				console.log('[GEMINI] Response modalities:', config.responseModalities);
			}

			// Connect to Gemini Live
			this.session = await this.client.live.connect({
				model: this.model,
				callbacks: {
					onopen: () => {
						if (this.verboseLogging) {
							console.log('[GEMINI] Connected to Gemini Live');
						}

						// Save API key to localStorage on successful connection
						if (apiKey) {
							localStorage.setItem('apiKey', apiKey);
							if (this.verboseLogging) {
								console.log('[STORAGE] Saved API key to localStorage');
							}
						}

						// Wait for session to fully initialize
						// The SDK needs time to process the initial connection
						setTimeout(() => {
							this.setupComplete = true;
							// Microphone is already started in init() for visualization
							// Just enable recording/sending to Gemini
							if (this.mediaStream && this.inputAudioContext) {
								this.isRecording = true;
								if (this.verboseLogging) {
									console.log('[MIC] Ready to send audio to Gemini');
								}
							}
						}, 500);
					},
					onmessage: async (message) => {
						if (this.verboseLogging) {
							console.log('[GEMINI] Message received:', message);
						}
						this.handleGeminiResponse(message);
					},
					onerror: (error) => {
						console.error('[GEMINI] Error:', error);
					},
					onclose: (event) => {
						if (this.verboseLogging) {
							console.log('[GEMINI] Connection closed:', event);
							console.log('[GEMINI] Close reason:', event.reason);
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

	async startMicrophone() {
		try {
			// Ensure audio context exists and is not closed
			if (!this.inputAudioContext || this.inputAudioContext.state === 'closed') {
				console.error('[MIC] AudioContext is closed or null, recreating...');
				this.inputAudioContext = new (window.AudioContext || window.webkitAudioContext)({
					sampleRate: this.inputSampleRate
				});
			}

			if (this.verboseLogging) {
				console.log('[MIC] Requesting microphone access...');
			}
			this.mediaStream = await navigator.mediaDevices.getUserMedia({
				audio: {
					channelCount: 1,
					sampleRate: this.inputSampleRate,
					echoCancellation: true,
					noiseSuppression: true
				}
			});

			if (this.verboseLogging) {
				console.log('[MIC] Microphone access granted');
			}
			if (this.inputAudioContext.state === 'suspended') {
				await this.inputAudioContext.resume();
			}
			if (this.verboseLogging) {
				console.log('[MIC] AudioContext created, sample rate:', this.inputAudioContext.sampleRate);
			}

			const source = this.inputAudioContext.createMediaStreamSource(this.mediaStream);

			// Use ScriptProcessorNode for audio processing (matching Google example)
			const bufferSize = 256;
			this.audioProcessor = this.inputAudioContext.createScriptProcessor(bufferSize, 1, 1);

			this.audioProcessor.onaudioprocess = (audioProcessingEvent) => {
				if (!this.isRecording || !this.setupComplete || !this.session) return;

				const inputBuffer = audioProcessingEvent.inputBuffer;
				const pcmData = inputBuffer.getChannelData(0);

				// Send audio data to Gemini using the session
				try {
					const audioData = this.createBlob(pcmData);
					// Use 'media' property - SDK expects this format
					this.session.sendRealtimeInput({ media: audioData });
				} catch (error) {
					console.error('[AUDIO] Error sending audio chunk:', error);
					// Stop sending if there's an error
					if (error.message && error.message.includes('CLOSED')) {
						this.isRecording = false;
					}
				}
			};

			source.connect(this.audioProcessor);
			this.audioProcessor.connect(this.inputAudioContext.destination);

			this.isRecording = true;
			if (this.verboseLogging) {
				console.log('[MIC] Recording started');
			}
		} catch (error) {
			console.error('[MIC] Error:', error);
		}
	}

	// Encode bytes to base64
	encode(bytes) {
		const binary = String.fromCharCode.apply(null, bytes);
		return btoa(binary);
	}

	// Create blob from PCM data
	// Returns an object with data (base64) and mimeType, NOT a Blob object
	createBlob(pcmData) {
		const length = pcmData.length;
		const int16 = new Int16Array(length);
		for (let i = 0; i < length; i++) {
			// Convert float32 -1 to 1 to int16 -32768 to 32767
			int16[i] = pcmData[i] * 32768;
		}

		return {
			data: this.encode(new Uint8Array(int16.buffer)),
			mimeType: 'audio/pcm;rate=16000',
		};
	}

	handleGeminiResponse(message) {
		if (this.verboseLogging) {
			console.log('[GEMINI] Message:', message);
		}
		try {
			if (this.verboseLogging) {
				console.log('[GEMINI] Processing message:', message);
				if (message.serverContent) {
					console.log('[GEMINI] serverContent:', message.serverContent);
				}
			}

			// Handle interruption
			const interrupted = message.serverContent?.interrupted;
			if (interrupted && this.verboseLogging) {
				console.log('[GEMINI] User interrupted');
			}

			// Handle text responses
			if (message.serverContent?.modelTurn) {
				if (!this.currentTurnActive) {
					this.currentTurnActive = true;
					if (this.verboseLogging) {
						console.log('[GEMINI] Model turn started');
					}
				}

				const parts = message.serverContent.modelTurn.parts;
				if (this.verboseLogging) {
					console.log('[GEMINI] Parts:', parts);
				}
				if (parts && parts.length > 0) {
					// Accumulate text from this streaming chunk
					for (const part of parts) {
						if (this.verboseLogging) {
							console.log('[GEMINI] Part:', part, 'Has text:', !!part.text, 'Has audio:', !!part.inlineData);
						}
						if (part.text) {
							if (this.verboseLogging) {
								console.log('[GEMINI] Found text:', part.text);
							}
							this.accumulatedText += part.text;
						}
						// With TEXT modality, we should consistently get text responses
					}
				}
			}

			// Check for turn complete - Gemini finished responding
			if (message.serverContent?.turnComplete) {
				if (this.verboseLogging) {
					console.log('[GEMINI] Turn complete - processing full response');
					console.log('[GEMINI] Accumulated text so far:', this.accumulatedText);
				}
				this.currentTurnActive = false;

				// Process text response
				if (this.accumulatedText && this.accumulatedText.trim().length > 0) {
					const responseData = this.parseResponse(this.accumulatedText);

					if (responseData) {
						const { transcript, analysis, tone, emoji, confidence, sentiment } = responseData;

						// Add to transcript log with analysis
						if (transcript && analysis) {
							this.emitPercept({ transcript, analysis, tone, emoji, sentiment, confidence });
						}
					}

					// Reset for next turn
					this.accumulatedText = '';
				} else {
					if (this.verboseLogging) {
						console.log('[GEMINI] Turn complete but no text received');
					}
				}
			}

		} catch (error) {
			console.error('[GEMINI] Error processing response:', error, 'Message:', message);
			this.accumulatedText = '';
			this.currentTurnActive = false;
		}
	}

	// Parse response - normalize Gemini's actual response format
	// Handles variations: transcription vs transcript, nested analysis objects, etc.
	parseResponse(text) {
		try {
			// Try to parse as JSON first
			let jsonData;
			try {
				jsonData = JSON.parse(text.trim());
			} catch (e) {
				// Not valid JSON, try to extract JSON from text if wrapped
				const jsonMatch = text.match(/\{[\s\S]*\}/);
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
					// Build from components
					const parts = [];
					if (analysisObj.sentiment?.overall) parts.push(`Sentiment: ${analysisObj.sentiment.overall}`);
					if (analysisObj.tone) parts.push(`Tone: ${analysisObj.tone}`);
					if (analysisObj.emotion_detected) parts.push(`Emotion: ${analysisObj.emotion_detected}`);
					analysis = parts.join('. ') || JSON.stringify(analysisObj);
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
				console.log('[GEMINI] JSON parse failed, using regex fallback:', e.message);
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
		// Try to extract transcript from "Transcript: X" pattern
		const transcriptMatch = text.match(/Transcript:\s*(.+?)(?:\n|Analysis:|Emoji:|$)/is);
		if (transcriptMatch && transcriptMatch[1]) {
			return transcriptMatch[1].trim();
		}
		return null;
	}

	extractAnalysis(text) {
		// Try to extract analysis from "Analysis: X" pattern
		const analysisMatch = text.match(/Analysis:\s*(.+?)(?:\n\s*Emoji:|$)/is);
		if (analysisMatch && analysisMatch[1]) {
			return analysisMatch[1].trim();
		}
		// Fallback: if no Analysis: tag, return everything except Transcript and Emoji
		return text.replace(/Transcript:.*?(?=Analysis:|Emoji:|$)/is, '')
			.replace(/Emoji:\s*.*/i, '')
			.trim();
	}

	extractTone(text) {
		// Try to extract analysis from "Analysis: X" pattern
		const toneMatch = text.match(/Tone:\s*(.+?)(?:\n\s*Emoji:|$)/is);
		if (toneMatch && toneMatch[1]) {
			return toneMatch[1].trim();
		}
		// Fallback: if no Analysis: tag, return everything except Transcript and Emoji
		return text.replace(/Transcript:.*?(?=Tone:|Emoji:|$)/is, '')
			.replace(/Emoji:\s*.*/i, '')
			.trim();
	}	

	extractEmoji(text) {
		// Try to extract emoji from "Emoji: X" pattern
		// Look for the pattern and capture multiple characters to handle multi-codepoint emojis
		const emojiMatch = text.match(/Emoji:\s*([^\s\n]+)/i);
		if (emojiMatch && emojiMatch[1]) {
			if (this.verboseLogging) {
				console.log('[EMOJI] Matched from pattern:', emojiMatch[1]);
			}
			// Take only the first few characters which should be the emoji
			return emojiMatch[1].substring(0, 2);
		}

		// Fallback: extract any emoji from the text using comprehensive regex
		const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}]/u;
		const match = text.match(emojiRegex);
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

	// Set verbose logging flag
	setVerboseLogging(enabled) {
		this.verboseLogging = enabled;
	}

	disconnect() {
		/*
		// Stop microphone
		if (this.mediaStream) {
			this.mediaStream.getTracks().forEach(track => track.stop());
			this.mediaStream = null;
		}

		// Close audio context
		if (this.inputAudioContext) {
			this.inputAudioContext.close();
			this.inputAudioContext = null;
		}

		// Clear processor
		if (this.audioProcessor) {
			this.audioProcessor.disconnect();
			this.audioProcessor = null;
		}
		*/

		// Close session
		if (this.session) {
			this.session.close();
			this.session = null;
		}

		// Clear client
		this.client = null;

		// Reset state
		this.isRecording = false;
		this.setupComplete = false;
		this.accumulatedText = '';
		this.currentTurnActive = false;
	}
}
