import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'host',
    assetsDir: 'assets',
    emptyOutDir: false, // Preserve index.html and other files in /host
    lib: {
      entry: resolve(__dirname, 'cam-vis.js'),
      name: 'CamVis',
      fileName: () => 'cam-vis.js',
      formats: ['es'],
    },
    rollupOptions: {
      output: {
        format: 'es',
        entryFileNames: 'cam-vis.js',
        assetFileNames: 'assets/[name].[ext]',
      },
      external: [], // Bundle all dependencies (none for cam-vis, but keep consistent)
    },
  },
});

