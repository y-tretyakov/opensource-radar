import { defineConfig } from 'vite'

export default defineConfig({
  base: '/opensource-radar/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
