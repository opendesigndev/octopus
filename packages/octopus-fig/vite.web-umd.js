// vite.config.js
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(dirname(fileURLToPath(new URL(import.meta.url))), 'src/index-web.ts'),
      name: 'OctopusFig',
      fileName: () => `web-umd.js`,
      formats: ['umd'],
    },
    commonjsOptions: { include: [/node_modules/, /@opendesign\/octopus-common/] },
    outDir: 'release',
    emptyOutDir: false,
    target: 'es6',
    rollupOptions: {},
    // minify: 'none'
  },
  resolve: {
    preserveSymlinks: true,
  },
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
  ],
})
