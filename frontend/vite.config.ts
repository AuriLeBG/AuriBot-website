import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    // Avoid CORS in dev: proxy API calls to the backend container.
    proxy: {
      '^/(health|api/|login|signup|post-comment|get-comments|get-recent-comments)': {
        target: 'http://backend:8080',
        changeOrigin: true,
      },
    },
  },
})
