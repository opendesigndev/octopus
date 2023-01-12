import reactRefresh from '@vitejs/plugin-react-refresh'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vitejs.dev/config/
export default defineConfig({
  root: './src/ui',
  plugins: [reactRefresh(), viteSingleFile()],
  build: {
    target: 'ES2020',
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 100000000,
    cssCodeSplit: false,
    brotliSize: false,
    outDir: '../../dist',
    rollupOptions: {
      inlineDynamicImports: true,
      output: {
        manualChunks: () => 'everything.js',
      },
    },
  },
})
