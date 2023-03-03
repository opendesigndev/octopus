// vite.config.js
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

import { defineConfig } from 'vite'
import topLevelAwait from 'vite-plugin-top-level-await'
import wasm from 'vite-plugin-wasm'

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(dirname(fileURLToPath(new URL(import.meta.url))), 'src/index-web.ts'),
      name: 'OctopusAI',
      fileName: (format) => `octopus-ai-web.${format}.js`,
      formats: ['umd'],
    },
    commonjsOptions: { include: [/node_modules/, /@opendesign\/octopus-common/] },
    outDir: 'examples/web',
    emptyOutDir: false,
    minify: 'none',
  },
  resolve: {
    preserveSymlinks: true,
  },
  plugins: [wasm(), topLevelAwait()],
})
