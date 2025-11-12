import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'host',
    assetsDir: 'assets',
    emptyOutDir: false, // Preserve index.html and other files in /host
    lib: {
      entry: resolve(__dirname, 'lighting-vis.js'),
      name: 'LightingVis',
      fileName: () => 'lighting-vis.js',
      formats: ['es'],
    },
    rollupOptions: {
      output: {
        format: 'es',
        entryFileNames: 'lighting-vis.js',
        assetFileNames: 'assets/[name].[ext]',
      },
      external: [], // Bundle all dependencies (none for lighting-vis, but keep consistent)
    },
  },
});

