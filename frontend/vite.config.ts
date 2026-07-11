import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/auth': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/users': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/teams': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/rounds': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/submissions': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/prizes': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/scores': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/tracks': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/rankings': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/audit-logs': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/hackathon-events': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/criteria': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/team-members': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/tournaments': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})