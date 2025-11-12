# uni-prototype

## Setup

Before running the application, create a `config.js` file from the example:

```bash
cp config.example.js config.js
```

Then edit `config.js` and add your Google Gemini API key. The `config.js` file is gitignored and will not be committed to the repository.

## Development

```bash
npm run dev
```
Start the development server. Press spacebar to enable Gemini Live API calls.

## Build

```bash
npm run build
```
Build the application. Outputs standalone `mic-audio-to-text.js` module to `/host` directory.

```bash
npm run build:host
```
Build all modules with dependencies bundled. Outputs `cam`, `cam-vis`, `mic`, `mic-vis`, `lighting-vis`, and `kinetic-vis` modules to the `/host` directory.

### Individual Module Builds

Build individual modules with dependencies bundled:

```bash
npm run build:cam
```
Builds `cam.js`, `cam-face.js`, and `cam-skeletal.js` with all dependencies to `host/cam.js`.

```bash
npm run build:mic
```
Builds `mic-audio-to-text.js` with all dependencies to `host/mic-audio-to-text.js`.

```bash
npm run build:cam-vis
```
Builds `cam-vis.js` with all dependencies to `host/cam-vis.js`.

```bash
npm run build:mic-vis
```
Builds `mic-vis.js` with all dependencies to `host/mic-vis.js`.

```bash
npm run build:lighting-vis
```
Builds `lighting-vis.js` with all dependencies to `host/lighting-vis.js`.

```bash
npm run build:kinetic-vis
```
Builds `kinetic-vis.js` with all dependencies to `host/kinetic-vis.js`.

## Preview

```bash
npm run preview
```
Preview the built application.

## Host

```bash
npm run host
```
Serve the standalone host version from `/host` directory.

## Deploy

```bash
npm run deploy
```
Build and deploy the application.
