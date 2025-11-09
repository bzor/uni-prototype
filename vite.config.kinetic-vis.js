import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'host',
    assetsDir: 'assets',
    emptyOutDir: false, // Preserve index.html and other files in /host
    lib: {
      entry: resolve(__dirname, 'kinetic-vis-bundle.js'),
      name: 'KineticVis',
      fileName: () => 'kinetic-vis.js',
      formats: ['es'],
    },
    rollupOptions: {
      output: {
        format: 'es',
        entryFileNames: 'kinetic-vis.js',
        assetFileNames: 'assets/[name].[ext]',
      },
      external: [], // Bundle all dependencies (none for kinetic-vis, but keep consistent)
    },
  },
});

