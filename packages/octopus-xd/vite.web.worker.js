// vite.config.js
import path from 'path'

import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/web-worker.ts'),
      name: 'OctopusXDWorker',
      fileName: (format) => `octopus-xd-web-worker.${format}.js`,
      formats: ['umd'],
    },
    commonjsOptions: { include: [] },
    outDir: 'examples/web',
    emptyOutDir: false,
    // minify: 'none',
  },
  resolve: {
    mainFields: ['module'],
  },
})