import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base: './' keeps the build portable (GitHub Pages sub-path, any static host).
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
