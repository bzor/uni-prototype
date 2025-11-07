// Gemini Live Audio Module - Handles WebSocket connection, audio processing, and audio playback
import { GoogleGenAI, Modality } from '@google/genai';

export class MicAudioToAudio {
	constructor() {
		// State
		this.client = null;
		this.session = null;
		this.inputAudioContext = null;
		this.outputAudioContext = null;
		this.outputNode = null;
		this.mediaStream = null;
		this.audioProcessor = null;
		this.isRecording = false;
		this.setupComplete = false;
		this.nextStartTime = 0;
		this.sources = new Set();
		this.eventTarget = new EventTarget();
		this.debugPanel = null;
		this.debugVisible = false;

		// Audio effects state
		this.effectsChain = null; // Will be set up in connect()
		this.pitchShift = 1.0; // 1.0 = normal, >1.0 = higher, <1.0 = lower
		this.reverbEnabled = false;
		this.reverbConvolver = null;
		this.reverbDryGain = null;
		this.reverbWetGain = null;
		this.delayEnabled = false;
		this.delayNode = null;
		this.delayFeedbackGain = null;
		this.flangerEnabled = false;
		this.flangerDelay = null;
		this.flangerOscillator = null;
		this.flangerBaseDelay = null;
		this.flangerGain = null;
		this.flangerFeedbackGain = null;
		this.flangerDryGain = null;
		this.flangerWetGain = null;
		this.volumeGain = null;

		// Config
		this.inputSampleRate = 16000;
		this.outputSampleRate = 24000;
		this.model = 'gemini-2.5-flash-native-audio-preview-09-2025';
	}

	init(config) {
		const { apiKey, httpOptions } = config;
		const isEphemeralToken = apiKey.startsWith('auth_tokens/');
		
		// Ephemeral tokens require v1alpha, regular keys can use v1beta
		const apiVersion = isEphemeralToken 
			? 'v1alpha'  // Ephemeral tokens MUST use v1alpha
			: (httpOptions?.apiVersion || 'v1beta');  // Regular keys default to v1beta

		console.log(`[MIC] API Version: ${apiVersion}`);
		
		// Build httpOptions with correct API version
		const finalHttpOptions = {
			...httpOptions,
			apiVersion: apiVersion
		};
		
		// Warn if ephemeral token used without v1alpha
		if (isEphemeralToken && apiVersion !== 'v1alpha') {
			console.warn('[MIC] Warning: Ephemeral tokens require v1alpha API version');
		}
		
		this.connect(apiKey, finalHttpOptions);
	}

	async connect(apiKey, httpOptions) {
		try {
			// Initialize client with httpOptions for API version configuration
			this.client = new GoogleGenAI({
				apiKey: apiKey,
				httpOptions: httpOptions
			});

			// Initialize audio contexts
			this.inputAudioContext = new (window.AudioContext || window.webkitAudioContext)({
				sampleRate: this.inputSampleRate
			});

			this.outputAudioContext = new (window.AudioContext || window.webkitAudioContext)({
				sampleRate: this.outputSampleRate
			});

			// Initialize output node and connect to destination
			this.outputNode = this.outputAudioContext.createGain();
			this.outputNode.connect(this.outputAudioContext.destination);
			
			// Initialize effects chain
			this.setupEffectsChain();

			// Create debug panel
			this.createDebugPanel();

			// Apply distortion settings to make speech unrecognizable but maintain cadence
			// Pitch: slightly raised to alter voice character
			this.setPitch(1.8);
			// Reverb: moderate room reverb to blur/distort
			this.setReverb(true, 0.4, 0.4, 1.0);
			// Delay: short delay with low feedback for texture
			this.setDelay(true, 0.1, 0.6);
			// Flanger: moderate modulation for movement/distortion
			this.setFlanger(true, 0.8, 0.005, 0.1, 0.6);

			// Initialize audio scheduling - ensure audio context is running for low latency
			if (this.outputAudioContext.state === 'suspended') {
				this.outputAudioContext.resume();
			}
			this.nextStartTime = this.outputAudioContext.currentTime;

			// Prepare config for audio responses
			// Note: Native audio preview model only supports AUDIO modality, not TEXT
			const config = {
				responseModalities: [Modality.AUDIO],
				speechConfig: {
					voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Orus' } }
				}
			};

			console.log('[GEMINI] Config:', config);
			console.log('[GEMINI] Response modalities:', config.responseModalities);

			// Connect to Gemini Live
			this.session = await this.client.live.connect({
				model: this.model,
				callbacks: {
					onopen: () => {
						console.log('[GEMINI] Connected to Gemini Live');

						// Save API key to localStorage on successful connection
						if (apiKey) {
							localStorage.setItem('apiKey', apiKey);
							console.log('[STORAGE] Saved API key to localStorage');
						}

						// Wait for session to fully initialize before starting mic
						setTimeout(() => {
							this.setupComplete = true;
							// Start microphone
							this.startMicrophone();
						}, 500);
					},
					onmessage: async (message) => {
						await this.handleGeminiResponse(message);
					},
					onerror: (error) => {
						console.error('[GEMINI] Error:', error);
					},
					onclose: (event) => {
						console.log('[GEMINI] Connection closed:', event);
						console.log('[GEMINI] Close reason:', event.reason);
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

			console.log('[MIC] Requesting microphone access...');
			this.mediaStream = await navigator.mediaDevices.getUserMedia({
				audio: {
					channelCount: 1,
					sampleRate: this.inputSampleRate,
					echoCancellation: true,
					noiseSuppression: true
				}
			});

			console.log('[MIC] Microphone access granted');
			if (this.inputAudioContext.state === 'suspended') {
				await this.inputAudioContext.resume();
			}
			console.log('[MIC] AudioContext created, sample rate:', this.inputAudioContext.sampleRate);

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
			console.log('[MIC] Recording started');
		} catch (error) {
			console.error('[MIC] Error:', error);
		}
	}

	// Decode base64 to Uint8Array
	decode(base64) {
		const binaryString = atob(base64);
		const len = binaryString.length;
		const bytes = new Uint8Array(len);
		for (let i = 0; i < len; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}
		return bytes;
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

	// Decode audio data from base64 to AudioBuffer
	async decodeAudioData(data, ctx, sampleRate, numChannels) {
		const buffer = ctx.createBuffer(
			numChannels,
			data.length / 2 / numChannels,
			sampleRate
		);

		const dataInt16 = new Int16Array(data.buffer);
		const l = dataInt16.length;
		const dataFloat32 = new Float32Array(l);
		for (let i = 0; i < l; i++) {
			dataFloat32[i] = dataInt16[i] / 32768.0;
		}

		// Extract interleaved channels
		if (numChannels === 1) {
			buffer.copyToChannel(dataFloat32, 0);
		} else {
			for (let i = 0; i < numChannels; i++) {
				const channel = dataFloat32.filter(
					(_, index) => index % numChannels === i
				);
				buffer.copyToChannel(channel, i);
			}
		}

		return buffer;
	}

	// Setup audio effects chain
	setupEffectsChain() {
		console.log('[EFFECTS] Setting up effects chain');

		this.setPitch(1.8);

		// Create volume gain node
		this.volumeGain = this.outputAudioContext.createGain();
		this.volumeGain.gain.value = 1.0;

		// Create reverb dry/wet mix
		this.reverbDryGain = this.outputAudioContext.createGain();
		this.reverbWetGain = this.outputAudioContext.createGain();
		this.reverbDryGain.gain.value = 0.2;
		this.reverbWetGain.gain.value = 0.8;

		// Create reverb convolver (will be initialized when enabled)
		this.reverbConvolver = this.outputAudioContext.createConvolver();
		// Create a proper passthrough impulse response (dirac delta at sample 0)
		// Use a small buffer (128 samples) with a spike at sample 0 for clean passthrough
		const dryImpulse = this.outputAudioContext.createBuffer(2, 128, this.outputAudioContext.sampleRate);
		const impulseL = dryImpulse.getChannelData(0);
		const impulseR = dryImpulse.getChannelData(1);
		impulseL[0] = 1.0; // Dirac delta at sample 0
		impulseR[0] = 1.0;
		this.reverbConvolver.buffer = dryImpulse;

		// Create delay node with feedback
		this.delayNode = this.outputAudioContext.createDelay(1.0);
		this.delayNode.delayTime.value = 0.2; // Use tiny delay instead of 0 for better compatibility
		this.delayFeedbackGain = this.outputAudioContext.createGain();
		this.delayFeedbackGain.gain.value = 0.6;

		// Create flanger nodes
		this.flangerDelay = this.outputAudioContext.createDelay(0.02); // Max 20ms delay for flanger
		this.flangerDelay.delayTime.value = 0.005; // Base delay ~5ms
		this.flangerOscillator = this.outputAudioContext.createOscillator();
		this.flangerOscillator.frequency.value = 0.5; // LFO rate (Hz)
		this.flangerOscillator.type = 'sine';
		// Create constant source for base delay and gain for modulation depth
		this.flangerBaseDelay = this.outputAudioContext.createConstantSource();
		this.flangerBaseDelay.offset.value = 0.005; // Base delay ~5ms
		this.flangerGain = this.outputAudioContext.createGain();
		this.flangerGain.gain.value = 0.005; // Modulation depth (~5ms)
		this.flangerFeedbackGain = this.outputAudioContext.createGain();
		this.flangerFeedbackGain.gain.value = 0;
		this.flangerDryGain = this.outputAudioContext.createGain();
		this.flangerDryGain.gain.value = 1.0;
		this.flangerWetGain = this.outputAudioContext.createGain();
		this.flangerWetGain.gain.value = 0.0;

		// Connect flanger LFO to delay time modulation
		// Base delay + modulated signal
		this.flangerBaseDelay.connect(this.flangerDelay.delayTime);
		this.flangerOscillator.connect(this.flangerGain);
		this.flangerGain.connect(this.flangerDelay.delayTime); // Adds to base delay
		this.flangerBaseDelay.start(0); // Start constant source
		this.flangerOscillator.start(0); // Start LFO

		// Connect effects chain: volume -> reverb dry/wet -> delay -> flanger -> output
		this.volumeGain.connect(this.reverbDryGain);
		this.volumeGain.connect(this.reverbConvolver);
		this.reverbConvolver.connect(this.reverbWetGain);
		
		// Mix reverb dry and wet
		this.reverbDryGain.connect(this.delayNode);
		this.reverbWetGain.connect(this.delayNode);
		
		// Delay with feedback
		this.delayNode.connect(this.delayFeedbackGain);
		this.delayFeedbackGain.connect(this.delayNode); // Feedback loop
		
		// Flanger: split signal into dry and wet (delayed) paths
		this.delayNode.connect(this.flangerDryGain);
		this.delayNode.connect(this.flangerDelay);
		this.flangerDelay.connect(this.flangerFeedbackGain);
		this.flangerFeedbackGain.connect(this.flangerDelay); // Feedback loop
		this.flangerDelay.connect(this.flangerWetGain);
		
		// Mix flanger dry and wet
		this.flangerDryGain.connect(this.outputNode);
		this.flangerWetGain.connect(this.outputNode);
	}

	// Connect audio source through effects chain
	connectThroughEffects(source) {
		if (!this.volumeGain) {
			console.error('[EFFECTS] Volume gain not initialized!');
			// Fallback: connect directly to output
			source.connect(this.outputNode);
			return;
		}
		source.connect(this.volumeGain);
		console.log('[EFFECTS] Audio source connected through effects chain');
	}

	// Set pitch shift (1.0 = normal, 2.0 = octave up, 0.5 = octave down)
	setPitch(pitch) {
		this.pitchShift = Math.max(0.25, Math.min(4.0, pitch)); // Clamp between 0.25 and 4.0
		console.log('[EFFECTS] Pitch set to:', this.pitchShift);
	}

	// Set volume (0.0 to 1.0)
	setVolume(volume) {
		if (this.volumeGain) {
			this.volumeGain.gain.value = Math.max(0.0, Math.min(1.0, volume));
			console.log('[EFFECTS] Volume set to:', volume);
		}
	}

	// Generate reverb impulse response
	generateReverbImpulse(seconds, decay, reverse = false) {
		const length = this.outputAudioContext.sampleRate * seconds;
		const impulse = this.outputAudioContext.createBuffer(2, length, this.outputAudioContext.sampleRate);
		const impulseL = impulse.getChannelData(0);
		const impulseR = impulse.getChannelData(1);

		for (let i = 0; i < length; i++) {
			const n = reverse ? length - i : i;
			impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
			impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
		}

		return impulse;
	}

	// Enable/disable reverb with dry/wet mix (wetMix 0.0 to 1.0)
	setReverb(enabled, roomSize = 2.0, decay = 2.0, wetMix = 0.3) {
		this.reverbEnabled = enabled;
		if (this.reverbConvolver && this.reverbDryGain && this.reverbWetGain) {
			if (enabled) {
				const impulse = this.generateReverbImpulse(roomSize, decay);
				this.reverbConvolver.buffer = impulse;
				this.reverbDryGain.gain.value = 1.0 - wetMix;
				this.reverbWetGain.gain.value = wetMix;
				console.log('[EFFECTS] Reverb enabled, roomSize:', roomSize, 'decay:', decay, 'wetMix:', wetMix);
			} else {
				// Create a dry impulse (no reverb) - passthrough
				const dryImpulse = this.outputAudioContext.createBuffer(2, 128, this.outputAudioContext.sampleRate);
				const impulseL = dryImpulse.getChannelData(0);
				const impulseR = dryImpulse.getChannelData(1);
				impulseL[0] = 1.0;
				impulseR[0] = 1.0;
				this.reverbConvolver.buffer = dryImpulse;
				this.reverbDryGain.gain.value = 1.0;
				this.reverbWetGain.gain.value = 0.0;
				console.log('[EFFECTS] Reverb disabled');
			}
		}
	}

	// Set delay effect (time in seconds, feedback 0.0 to 1.0)
	setDelay(enabled, delayTime = 0.3, feedback = 0.3) {
		this.delayEnabled = enabled;
		if (this.delayNode && this.delayFeedbackGain) {
			if (enabled) {
				this.delayNode.delayTime.value = Math.max(0.001, Math.min(1.0, delayTime)); // Min 0.001 for compatibility
				this.delayFeedbackGain.gain.value = Math.max(0.0, Math.min(0.95, feedback)); // Max 0.95 to prevent oscillation
				console.log('[EFFECTS] Delay enabled, time:', delayTime, 'feedback:', feedback);
			} else {
				this.delayNode.delayTime.value = 0.001; // Use tiny delay instead of 0
				this.delayFeedbackGain.gain.value = 0;
				console.log('[EFFECTS] Delay disabled');
			}
		}
	}

	// Set flanger effect (speed in Hz, depth in seconds, feedback 0.0 to 1.0, wetMix 0.0 to 1.0)
	setFlanger(enabled, speed = 0.5, depth = 0.005, feedback = 0.3, wetMix = 0.5) {
		this.flangerEnabled = enabled;
		if (this.flangerOscillator && this.flangerBaseDelay && this.flangerGain && this.flangerDelay && 
		    this.flangerDryGain && this.flangerWetGain && this.flangerFeedbackGain) {
			if (enabled) {
				// Set LFO speed
				this.flangerOscillator.frequency.value = Math.max(0.1, Math.min(10.0, speed));
				// Set base delay (center of modulation)
				this.flangerBaseDelay.offset.value = Math.max(0.001, Math.min(0.01, depth));
				// Set modulation depth
				this.flangerGain.gain.value = Math.max(0.001, Math.min(0.01, depth));
				// Set feedback
				this.flangerFeedbackGain.gain.value = Math.max(0.0, Math.min(0.95, feedback));
				// Set dry/wet mix
				this.flangerDryGain.gain.value = 1.0 - wetMix;
				this.flangerWetGain.gain.value = wetMix;
				console.log('[EFFECTS] Flanger enabled, speed:', speed, 'depth:', depth, 'feedback:', feedback, 'wetMix:', wetMix);
			} else {
				// Disable flanger by setting wet mix to 0
				this.flangerDryGain.gain.value = 1.0;
				this.flangerWetGain.gain.value = 0.0;
				this.flangerFeedbackGain.gain.value = 0;
				console.log('[EFFECTS] Flanger disabled');
			}
		}
	}

	async handleGeminiResponse(message) {
		try {
			// Handle interruption - stop all playing audio
			const interrupted = message.serverContent?.interrupted;
			if (interrupted) {
				console.log('[GEMINI] User interrupted - stopping all audio');
				for (const source of this.sources.values()) {
					source.stop();
					this.sources.delete(source);
				}
				this.nextStartTime = 0;
			}

			// Handle audio responses
			if (message.serverContent?.modelTurn) {
				const parts = message.serverContent.modelTurn.parts;
				if (parts && parts.length > 0) {
					for (const part of parts) {
						const audio = part.inlineData;
						if (audio) {
							// Decode audio data
							const audioData = this.decode(audio.data);
							const audioBuffer = await this.decodeAudioData(
								audioData,
								this.outputAudioContext,
								this.outputSampleRate,
								1 // mono channel
							);

							// Create and schedule audio source
							const source = this.outputAudioContext.createBufferSource();
							source.buffer = audioBuffer;
							
							// Apply pitch shift via playbackRate
							source.playbackRate.value = this.pitchShift;
							
							// Connect through effects chain
							this.connectThroughEffects(source);
							
							source.addEventListener('ended', () => {
								this.sources.delete(source);
							});

							// Calculate start time - play immediately or queue if there's overlap
							const adjustedDuration = audioBuffer.duration / this.pitchShift;
							const currentTime = this.outputAudioContext.currentTime;
							
							// If nextStartTime is in the past or very close, use current time for low latency
							// Otherwise queue sequentially to avoid overlap
							if (this.nextStartTime <= currentTime + 0.01) {
								this.nextStartTime = currentTime;
							}
							
							source.start(this.nextStartTime);
							this.nextStartTime = this.nextStartTime + adjustedDuration;
							this.sources.add(source);

							console.log('[AUDIO] Playing audio chunk, duration:', audioBuffer.duration, 'start:', this.nextStartTime);
						}
					}
				}
			}
		} catch (error) {
			console.error('[GEMINI] Error processing response:', error, 'Message:', message);
		}
	}

	disconnect() {
		// Stop all playing audio sources
		for (const source of this.sources.values()) {
			source.stop();
			this.sources.delete(source);
		}

		// Stop microphone
		if (this.mediaStream) {
			this.mediaStream.getTracks().forEach(track => track.stop());
			this.mediaStream = null;
		}

		// Disconnect audio processor
		if (this.audioProcessor) {
			this.audioProcessor.disconnect();
			this.audioProcessor = null;
		}

		// Close audio contexts
		if (this.inputAudioContext) {
			this.inputAudioContext.close();
			this.inputAudioContext = null;
		}

		// Clean up effects
		if (this.volumeGain) {
			this.volumeGain.disconnect();
			this.volumeGain = null;
		}
		if (this.reverbDryGain) {
			this.reverbDryGain.disconnect();
			this.reverbDryGain = null;
		}
		if (this.reverbWetGain) {
			this.reverbWetGain.disconnect();
			this.reverbWetGain = null;
		}
		if (this.reverbConvolver) {
			this.reverbConvolver.disconnect();
			this.reverbConvolver = null;
		}
		if (this.delayNode) {
			this.delayNode.disconnect();
			this.delayNode = null;
		}
		if (this.delayFeedbackGain) {
			this.delayFeedbackGain.disconnect();
			this.delayFeedbackGain = null;
		}
		if (this.flangerOscillator) {
			this.flangerOscillator.stop();
			this.flangerOscillator.disconnect();
			this.flangerOscillator = null;
		}
		if (this.flangerBaseDelay) {
			this.flangerBaseDelay.stop();
			this.flangerBaseDelay.disconnect();
			this.flangerBaseDelay = null;
		}
		if (this.flangerGain) {
			this.flangerGain.disconnect();
			this.flangerGain = null;
		}
		if (this.flangerDelay) {
			this.flangerDelay.disconnect();
			this.flangerDelay = null;
		}
		if (this.flangerFeedbackGain) {
			this.flangerFeedbackGain.disconnect();
			this.flangerFeedbackGain = null;
		}
		if (this.flangerDryGain) {
			this.flangerDryGain.disconnect();
			this.flangerDryGain = null;
		}
		if (this.flangerWetGain) {
			this.flangerWetGain.disconnect();
			this.flangerWetGain = null;
		}

		if (this.outputAudioContext) {
			this.outputAudioContext.close();
			this.outputAudioContext = null;
		}

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
		this.nextStartTime = 0;
		this.outputNode = null;
	}

	addEventListener(eventTag, event) {
		// Stub for future event handling
		this.eventTarget.addEventListener(eventTag, event);
	}

	removeEventListener(eventTag, event) {
		// Stub for future event handling
		this.eventTarget.removeEventListener(eventTag, event);
	}

	// Create debug panel with sliders for effects
	createDebugPanel() {
		// Create container
		this.debugPanel = document.createElement('div');
		this.debugPanel.id = 'mic-audio-debug-panel';
		this.debugPanel.style.cssText = `
			position: fixed;
			top: 10px;
			right: 10px;
			background: rgba(0, 0, 0, 0.8);
			border: 1px solid rgba(255, 255, 255, 0.3);
			border-radius: 8px;
			padding: 15px;
			font-family: 'Courier New', monospace;
			font-size: 11px;
			color: #fff;
			z-index: 10000;
			display: none;
			min-width: 250px;
		`;

		// Create title
		const title = document.createElement('div');
		title.textContent = 'Audio Effects Debug';
		title.style.cssText = 'font-weight: bold; margin-bottom: 10px; font-size: 12px;';
		this.debugPanel.appendChild(title);

		// Pitch slider
		const pitchContainer = this.createSlider('Pitch', 0.25, 4.0, 1.8, 0.01, (value) => {
			this.setPitch(value);
		});
		this.debugPanel.appendChild(pitchContainer);

		// Reverb sliders
		const reverbEnabledContainer = this.createCheckbox('Reverb Enabled', true, (checked) => {
			const roomSize = parseFloat(document.getElementById('reverb-room').value);
			const decay = parseFloat(document.getElementById('reverb-decay').value);
			const wetMix = parseFloat(document.getElementById('reverb-wet').value);
			this.setReverb(checked, roomSize, decay, wetMix);
		}, 'reverb-enabled');
		this.debugPanel.appendChild(reverbEnabledContainer);

		const reverbRoomContainer = this.createSlider('Reverb Room', 0.1, 5.0, 0.4, 0.1, (value) => {
			const enabled = document.getElementById('reverb-enabled').checked;
			const decay = parseFloat(document.getElementById('reverb-decay').value);
			const wetMix = parseFloat(document.getElementById('reverb-wet').value);
			this.setReverb(enabled, value, decay, wetMix);
		}, 'reverb-room');
		this.debugPanel.appendChild(reverbRoomContainer);

		const reverbDecayContainer = this.createSlider('Reverb Decay', 0.1, 5.0, 0.4, 0.1, (value) => {
			const enabled = document.getElementById('reverb-enabled').checked;
			const roomSize = parseFloat(document.getElementById('reverb-room').value);
			const wetMix = parseFloat(document.getElementById('reverb-wet').value);
			this.setReverb(enabled, roomSize, value, wetMix);
		}, 'reverb-decay');
		this.debugPanel.appendChild(reverbDecayContainer);

		const reverbWetContainer = this.createSlider('Reverb Wet', 0.0, 1.0, 1.0, 0.01, (value) => {
			const enabled = document.getElementById('reverb-enabled').checked;
			const roomSize = parseFloat(document.getElementById('reverb-room').value);
			const decay = parseFloat(document.getElementById('reverb-decay').value);
			this.setReverb(enabled, roomSize, decay, value);
		}, 'reverb-wet');
		this.debugPanel.appendChild(reverbWetContainer);

		// Delay sliders
		const delayEnabledContainer = this.createCheckbox('Delay Enabled', true, (checked) => {
			const delayTime = parseFloat(document.getElementById('delay-time').value);
			const feedback = parseFloat(document.getElementById('delay-feedback').value);
			this.setDelay(checked, delayTime, feedback);
		}, 'delay-enabled');
		this.debugPanel.appendChild(delayEnabledContainer);

		const delayTimeContainer = this.createSlider('Delay Time', 0.001, 1.0, 0.1, 0.01, (value) => {
			const enabled = document.getElementById('delay-enabled').checked;
			const feedback = parseFloat(document.getElementById('delay-feedback').value);
			this.setDelay(enabled, value, feedback);
		}, 'delay-time');
		this.debugPanel.appendChild(delayTimeContainer);

		const delayFeedbackContainer = this.createSlider('Delay Feedback', 0.0, 0.95, 0.6, 0.01, (value) => {
			const enabled = document.getElementById('delay-enabled').checked;
			const delayTime = parseFloat(document.getElementById('delay-time').value);
			this.setDelay(enabled, delayTime, value);
		}, 'delay-feedback');
		this.debugPanel.appendChild(delayFeedbackContainer);

		// Flanger sliders
		const flangerEnabledContainer = this.createCheckbox('Flanger Enabled', true, (checked) => {
			const speed = parseFloat(document.getElementById('flanger-speed').value);
			const depth = parseFloat(document.getElementById('flanger-depth').value);
			const feedback = parseFloat(document.getElementById('flanger-feedback').value);
			const wetMix = parseFloat(document.getElementById('flanger-wet').value);
			this.setFlanger(checked, speed, depth, feedback, wetMix);
		}, 'flanger-enabled');
		this.debugPanel.appendChild(flangerEnabledContainer);

		const flangerSpeedContainer = this.createSlider('Flanger Speed', 0.1, 10.0, 0.8, 0.1, (value) => {
			const enabled = document.getElementById('flanger-enabled').checked;
			const depth = parseFloat(document.getElementById('flanger-depth').value);
			const feedback = parseFloat(document.getElementById('flanger-feedback').value);
			const wetMix = parseFloat(document.getElementById('flanger-wet').value);
			this.setFlanger(enabled, value, depth, feedback, wetMix);
		}, 'flanger-speed');
		this.debugPanel.appendChild(flangerSpeedContainer);

		const flangerDepthContainer = this.createSlider('Flanger Depth', 0.001, 0.01, 0.005, 0.001, (value) => {
			const enabled = document.getElementById('flanger-enabled').checked;
			const speed = parseFloat(document.getElementById('flanger-speed').value);
			const feedback = parseFloat(document.getElementById('flanger-feedback').value);
			const wetMix = parseFloat(document.getElementById('flanger-wet').value);
			this.setFlanger(enabled, speed, value, feedback, wetMix);
		}, 'flanger-depth');
		this.debugPanel.appendChild(flangerDepthContainer);

		const flangerFeedbackContainer = this.createSlider('Flanger Feedback', 0.0, 0.95, 0.1, 0.01, (value) => {
			const enabled = document.getElementById('flanger-enabled').checked;
			const speed = parseFloat(document.getElementById('flanger-speed').value);
			const depth = parseFloat(document.getElementById('flanger-depth').value);
			const wetMix = parseFloat(document.getElementById('flanger-wet').value);
			this.setFlanger(enabled, speed, depth, value, wetMix);
		}, 'flanger-feedback');
		this.debugPanel.appendChild(flangerFeedbackContainer);

		const flangerWetContainer = this.createSlider('Flanger Wet', 0.0, 1.0, 0.6, 0.01, (value) => {
			const enabled = document.getElementById('flanger-enabled').checked;
			const speed = parseFloat(document.getElementById('flanger-speed').value);
			const depth = parseFloat(document.getElementById('flanger-depth').value);
			const feedback = parseFloat(document.getElementById('flanger-feedback').value);
			this.setFlanger(enabled, speed, depth, feedback, value);
		}, 'flanger-wet');
		this.debugPanel.appendChild(flangerWetContainer);

		// Append to body
		document.body.appendChild(this.debugPanel);

		// Keyboard listener for 'd' key
		document.addEventListener('keydown', (event) => {
			if (event.key === 'd' || event.key === 'D') {
				this.toggleDebugPanel();
			}
		});
	}

	createSlider(label, min, max, value, step, onChange, id = null) {
		const container = document.createElement('div');
		container.style.cssText = 'margin-bottom: 8px;';

		const labelElem = document.createElement('label');
		labelElem.textContent = label + ':';
		labelElem.style.cssText = 'display: block; margin-bottom: 2px; font-size: 10px;';
		container.appendChild(labelElem);

		const sliderContainer = document.createElement('div');
		sliderContainer.style.cssText = 'display: flex; align-items: center; gap: 8px;';

		const slider = document.createElement('input');
		slider.type = 'range';
		slider.min = min;
		slider.max = max;
		slider.value = value;
		slider.step = step;
		if (id) slider.id = id;
		slider.style.cssText = `
			flex: 1;
			height: 2px;
			background: #333;
			outline: none;
			-webkit-appearance: none;
			appearance: none;
		`;
		
		// Webkit/Chrome slider styling
		slider.style.setProperty('--webkit-slider-thumb', '#555');
		slider.addEventListener('input', (e) => {
			const val = parseFloat(e.target.value);
			valueDisplay.textContent = val.toFixed(step < 1 ? 3 : 0);
			onChange(val);
		});
		
		// Add CSS for slider styling via style tag if not exists
		if (!document.getElementById('mic-audio-slider-styles')) {
			const style = document.createElement('style');
			style.id = 'mic-audio-slider-styles';
			style.textContent = `
				#mic-audio-debug-panel input[type="range"] {
					height: 2px;
					background: #333;
					outline: none;
					-webkit-appearance: none;
					appearance: none;
				}
				#mic-audio-debug-panel input[type="range"]::-webkit-slider-thumb {
					-webkit-appearance: none;
					appearance: none;
					width: 8px;
					height: 8px;
					background: #555;
					border-radius: 50%;
					cursor: pointer;
				}
				#mic-audio-debug-panel input[type="range"]::-webkit-slider-runnable-track {
					height: 2px;
					background: #333;
				}
				#mic-audio-debug-panel input[type="range"]::-moz-range-thumb {
					width: 8px;
					height: 8px;
					background: #555;
					border: none;
					border-radius: 50%;
					cursor: pointer;
				}
				#mic-audio-debug-panel input[type="range"]::-moz-range-track {
					height: 2px;
					background: #333;
				}
			`;
			document.head.appendChild(style);
		}
		
		sliderContainer.appendChild(slider);

		const valueDisplay = document.createElement('span');
		valueDisplay.textContent = value.toFixed(step < 1 ? 3 : 0);
		valueDisplay.style.cssText = 'min-width: 40px; text-align: right; font-size: 10px;';
		sliderContainer.appendChild(valueDisplay);

		container.appendChild(sliderContainer);
		return container;
	}

	createCheckbox(label, checked, onChange, id = null) {
		const container = document.createElement('div');
		container.style.cssText = 'margin-bottom: 8px; display: flex; align-items: center; gap: 8px;';

		const checkbox = document.createElement('input');
		checkbox.type = 'checkbox';
		checkbox.checked = checked;
		if (id) checkbox.id = id;
		checkbox.style.cssText = `
			width: 12px;
			height: 12px;
			background: #333;
			border: 1px solid #555;
			cursor: pointer;
			-webkit-appearance: none;
			appearance: none;
			position: relative;
		`;
		checkbox.addEventListener('change', (e) => {
			onChange(e.target.checked);
		});
		
		// Add checkbox styling to the style tag
		if (!document.getElementById('mic-audio-checkbox-styles')) {
			const style = document.createElement('style');
			style.id = 'mic-audio-checkbox-styles';
			style.textContent = `
				#mic-audio-debug-panel input[type="checkbox"] {
					width: 12px;
					height: 12px;
					background: #333;
					border: 1px solid #555;
					cursor: pointer;
					-webkit-appearance: none;
					appearance: none;
					position: relative;
				}
				#mic-audio-debug-panel input[type="checkbox"]:checked {
					background: #555;
				}
				#mic-audio-debug-panel input[type="checkbox"]:checked::after {
					content: '';
					position: absolute;
					left: 3px;
					top: 1px;
					width: 4px;
					height: 7px;
					border: solid #fff;
					border-width: 0 2px 2px 0;
					transform: rotate(45deg);
				}
			`;
			document.head.appendChild(style);
		}
		
		container.appendChild(checkbox);

		const labelElem = document.createElement('label');
		labelElem.textContent = label;
		labelElem.style.cssText = 'font-size: 10px; cursor: pointer;';
		labelElem.addEventListener('click', () => {
			checkbox.click();
		});
		container.appendChild(labelElem);

		return container;
	}

	toggleDebugPanel() {
		this.debugVisible = !this.debugVisible;
		if (this.debugPanel) {
			this.debugPanel.style.display = this.debugVisible ? 'block' : 'none';
		}
	}
}
