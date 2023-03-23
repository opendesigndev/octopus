// vite.config.js
import { defineConfig } from 'vite'
export default defineConfig({
  root: './examples/web',
  build: {
    assetsInlineLimit: 0,
    commonjsOptions: { include: [/node_modules/, /@opendesign\/octopus-common/] },
    outDir: './dist',
    emptyOutDir: false,
    // minify: 'none',
  },
  resolve: {
    preserveSymlinks: true,
  },
})
