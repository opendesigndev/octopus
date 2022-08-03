// vite.config.js
import path from 'path'

import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index-web.ts'),
      name: 'OctopusXD',
      fileName: (format) => `octopus-xd-web.${format}.js`,
      formats: ['umd'],
    },
    commonjsOptions: { include: [] },
    outDir: 'example-web',
    emptyOutDir: false,
    // minify: 'none',
  },
  resolve: {
    mainFields: ['module'],
  },
})
