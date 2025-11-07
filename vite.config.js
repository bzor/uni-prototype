import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'host',
    assetsDir: 'assets',
    emptyOutDir: false, // Preserve index.html and other files in /host
    lib: {
      entry: resolve(__dirname, 'mic-audio-to-text.js'),
      name: 'MicAudioToText',
      fileName: () => 'mic-audio-to-text.js',
      formats: ['es'],
    },
    rollupOptions: {
      output: {
        format: 'es',
        entryFileNames: 'mic-audio-to-text.js',
        assetFileNames: 'assets/[name].[ext]',
      },
      external: [], // Bundle all dependencies including @google/genai
    },
  },
});

