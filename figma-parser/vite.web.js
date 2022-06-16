// vite.config.js
import path from 'path'

import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'scripts/test-web.ts'),
      name: 'FigmaParser',
      fileName: (format) => `figma-parser-web.${format}.js`,
      formats: ['umd'],
    },
    commonjsOptions: { include: [] },
    outDir: 'dist',
    emptyOutDir: false,
    minify: 'none',
  },
  resolve: {
    mainFields: ['module'],
  },
})