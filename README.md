# uni-prototype

## Development

```bash
npm run dev
```
Start the development server.

## Build

```bash
npm run build
```
Build the application. Outputs standalone `mic-audio-to-text.js` module to `/host` directory.

### Module Builds

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
Builds `cam-vis.js` to `host/cam-vis.js`.

```bash
npm run build:mic-vis
```
Builds `mic-vis.js` to `host/mic-vis.js`.

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
