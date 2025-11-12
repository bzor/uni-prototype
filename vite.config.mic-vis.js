import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'host',
    assetsDir: 'assets',
    emptyOutDir: false, // Preserve index.html and other files in /host
    lib: {
      entry: resolve(__dirname, 'mic-vis.js'),
      name: 'MicVis',
      fileName: () => 'mic-vis.js',
      formats: ['es'],
    },
    rollupOptions: {
      output: {
        format: 'es',
        entryFileNames: 'mic-vis.js',
        assetFileNames: 'assets/[name].[ext]',
      },
      external: [], // Bundle all dependencies (none for mic-vis, but keep consistent)
    },
  },
});

