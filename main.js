import { MicAudioToText } from './mic-audio-to-text.js';

console.log("[V0.1a]");

//
//Connect UI
//
const connectBtn = document.getElementById('connect-btn');
const apiKeyInput = document.getElementById('apiKey');
let isConnected = false;

const savedApiKey = localStorage.getItem('apiKey');
if (savedApiKey) {
	apiKeyInput.value = savedApiKey;
}

connectBtn.addEventListener('click', () => {
	if (!isConnected) {
		// Connect
		const apiKey = apiKeyInput.value.trim();
		if (!apiKey) {
			return;
		}
		mic.connect(apiKey);
		isConnected = true;
		connectBtn.textContent = 'DISCONNECT';
		connectBtn.classList.remove('disconnected');
		connectBtn.classList.add('connected');
	} else {
		// Disconnect
		isConnected = false;
		mic.disconnect();
		connectBtn.textContent = 'CONNECT';
		connectBtn.classList.remove('connected');
		connectBtn.classList.add('disconnected');
	}
});
connectBtn.classList.add('disconnected');
//

//
//Log
//
let transcriptHistory = [];
let maxTranscriptEntries = 200;
const micLog = document.getElementById('mic-percept-log');
function addToTranscriptLog(e) {
	const transcript = e.detail.transcript;
	const analysis = e.detail.analysis;
	const sentiment = e.detail.sentiment;
	const emoji = e.detail.emoji;
	const timestamp = new Date().toLocaleTimeString();

	const entryDiv = document.createElement('div');
	entryDiv.className = 'log-entry';

	const timestampSpan = document.createElement('div');
	timestampSpan.className = 'log-timestamp';
	timestampSpan.textContent = `[${timestamp}]`;

	const transcriptSpan = document.createElement('div');
	transcriptSpan.className = 'log-transcript';
	transcriptSpan.textContent = `> ${transcript}`;

	const analysisSpan = document.createElement('div');
	analysisSpan.className = 'log-analysis';
	analysisSpan.textContent = `- ${analysis}`;

	const sentimentSpan = document.createElement('div');
	sentimentSpan.className = 'log-sentiment';
	sentimentSpan.textContent = `[sentiment]: ${sentiment}`;

	const emojiSpan = document.createElement('div');
	emojiSpan.className = 'log-emoji';
	emojiSpan.textContent = `[emoji]: ${emoji}`;

	entryDiv.appendChild(timestampSpan);
	entryDiv.appendChild(transcriptSpan);
	entryDiv.appendChild(analysisSpan);
	entryDiv.appendChild(sentimentSpan);
	entryDiv.appendChild(emojiSpan);

	transcriptHistory.push(entryDiv);

	if (transcriptHistory.length > maxTranscriptEntries) {
		const removed = transcriptHistory.shift();
		if (removed && removed.parentNode) {
			removed.parentNode.removeChild(removed);
		}
	}

	micLog.appendChild(entryDiv);
	micLog.scrollTop = micLog.scrollHeight;
}

function clearTranscriptLog() {
	micLog.innerHTML = '';
	transcriptHistory = [];
}


// Initialize modules
const mic = new MicAudioToText();
document.addEventListener('percept', (e) => {addToTranscriptLog(e.detail)});0