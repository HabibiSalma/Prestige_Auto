import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite config — minimal setup for React + the dev server on port 5173.
 * We also enable strictPort so the URL stays the same across restarts
 * (important for the CORS allow-list and Sanctum stateful domains).
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
})
