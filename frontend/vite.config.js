import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The PHP API runs on :8000. Proxying "/api" keeps the browser same-origin (no CORS, session cookie just works).
const proxy = { '/api': 'http://127.0.0.1:8000' }

export default defineConfig({
  plugins: [react()],
  server: { proxy },
  preview: { proxy },
})
