import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'host',
    assetsDir: 'assets',
    emptyOutDir: false, // Preserve index.html and other files in /host
    lib: {
      entry: resolve(__dirname, 'cam-bundle.js'),
      name: 'Cam',
      fileName: () => 'cam.js',
      formats: ['es'],
    },
    rollupOptions: {
      output: {
        format: 'es',
        entryFileNames: 'cam.js',
        assetFileNames: 'assets/[name].[ext]',
      },
      external: [], // Bundle all dependencies including @google/genai, @mediapipe/tasks-vision, face-api.js
    },
  },
});

