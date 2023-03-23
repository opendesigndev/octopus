// vite.config.js
import fs from 'fs/promises'
import { builtinModules } from 'module'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const pkg = JSON.parse((await fs.readFile('./package.json')).toString())
const deps = Object.keys(pkg.dependencies)

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(dirname(fileURLToPath(new URL(import.meta.url))), 'src/index-web.ts'),
      name: 'OctopusAI',
      fileName: () => `web.mjs`,
      formats: ['es'],
    },
    commonjsOptions: { include: [/node_modules/, /@opendesign\/octopus-common/] },
    outDir: 'release',
    emptyOutDir: false,
    rollupOptions: {
      external: [...deps, ...builtinModules, '@opendesign/illustrator-parser-pdfcpu/wasm_context'],
    },
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
