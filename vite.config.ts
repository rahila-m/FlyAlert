import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // During development, requests to /api go to the local Cloudflare Worker
    // (started with `npm run dev:api`). The browser sees a single origin.
    proxy: {
      '/api': 'http://127.0.0.1:8787',
    },
  },
})
