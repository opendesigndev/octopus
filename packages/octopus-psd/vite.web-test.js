// vite.config.js
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(dirname(fileURLToPath(new URL(import.meta.url))), 'src/index-web.ts'),
      name: 'OctopusPSD',
      fileName: (format) => `octopus-psd-web.${format}.js`,
      formats: ['umd'],
    },
    commonjsOptions: { include: [/node_modules/, /@opendesign\/octopus-common/] },
    outDir: 'examples/web',
    emptyOutDir: false,
    // minify: 'none'
  },
  resolve: {
    preserveSymlinks: true,
  },
})
