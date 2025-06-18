import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  // Base URL für Deployment (Render = root path)
  base: '/',
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      // Proxy alle API-Aufrufe an das Backend
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      // Proxy alle anderen Endpunkte (außer /api) an das Backend
      '/workouts': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/workoutsWithWeights': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/workout': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/workoutWithWeights': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/OneWorkout': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
