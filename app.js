//import { CamTick } from './cam-tick.js';
import { MicAudioToAudio } from './mic-audio-to-audio.js';
import { Cam } from './cam.js';
import { CamVis } from './cam-vis.js';
import { MicAudioToText } from './mic-audio-to-text.js';
import { MicVis } from './mic-vis.js';
import { LightingVis } from './lighting-vis.js';
import { KineticVis } from './kinetic-vis.js';

const API_KEY = 'AIzaSyCp0Kwq06iQviKP81vfQLZAhouLCPU0eGk';

const camOutput = document.getElementById('cam-output');
const micOutput = document.getElementById('mic-output');
const micVisContainer = document.getElementById('mic-vis-inner');
const camVisContainer = document.getElementById('cam-vis-inner');
const lightingContainer = document.getElementById('lighting');
const kineticContainer = document.getElementById('kinetic');

const addPerceptEntry = (container, json) => {
	const entry = document.createElement('div');
	entry.className = 'json-entry';
	entry.textContent = JSON.stringify(json, null, 2);
	container.insertBefore(entry, container.firstChild);
	container.parentElement.scrollTop = 0;
};

const initModule = (module, outputContainer) => {
	module.addEventListener('percept', (event) => {
		addPerceptEntry(outputContainer, event.detail);
	});

	module.addEventListener('error', (event) => {
		console.error('Error:', event.detail);
	});

	module.init({ apiKey: API_KEY });
};

//const mic = new MicAudioToAudio();
const cam = new Cam();
const mic = new MicAudioToText();
const micVis = new MicVis();
const camVis = new CamVis();
const lightingVis = new LightingVis();
const kineticVis = new KineticVis();

// Enable verbose logging
//cam.setVerboseLogging(true);
//mic.setVerboseLogging(true);

initModule(cam, camOutput);
initModule(mic, micOutput);
camVis.init({ cam, container: camVisContainer });
micVis.init({ mic, container: micVisContainer });
lightingVis.init({ container: lightingContainer });
kineticVis.init({ container: kineticContainer });

//keys
document.addEventListener('keydown', (event) => {
	if (event.code === 'Space' || event.key === ' ') {
		event.preventDefault();
		// Toggle: if connected, disconnect; if not connected, start
		if (mic.session) {
			mic.disconnect();
			cam.disconnect();
			console.log('[APP] Disconnected from Gemini API');
		} else {
			mic.start();
			cam.start();
			console.log('[APP] Connecting to Gemini API...');
		}
	}
});

//test lighting and kinetics
const testLightingAnimation = () => {
	const delay = 3000 + Math.random() * 2000; // 3-5 seconds
	setTimeout(() => {
		const randomColor = Math.floor(Math.random() * 0xffffff);
		const randomSpeed = (Math.random() * 2) - 1; // -1 to 1
		const randomLightingPattern = lightingVis.patternOptions[Math.floor(Math.random() * lightingVis.patternOptions.length)];
		const randomKineticPattern = kineticVis.patternOptions[Math.floor(Math.random() * kineticVis.patternOptions.length)];
		
		//console.log(`[TEST] Setting lighting animation: color=0x${randomColor.toString(16)}, speed=${randomSpeed.toFixed(2)}, pattern=${randomLightingPattern}, kineticPattern=${randomKineticPattern}`);
		lightingVis.setAnimation(randomColor, randomLightingPattern, randomSpeed);
		kineticVis.setPatternStr("JIGGLE");
		
		// Continue the loop
		testLightingAnimation();
	}, delay);
};

testLightingAnimation();