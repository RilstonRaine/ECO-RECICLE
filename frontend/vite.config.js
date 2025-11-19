// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    }
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      // Encaminha chamadas do front para o backend Node (http://localhost:3000)
      '/auth':         { target: 'http://localhost:3000', changeOrigin: true },
      '/usuarios':     { target: 'http://localhost:3000', changeOrigin: true },
      '/descartes':    { target: 'http://localhost:3000', changeOrigin: true },
      '/recompensas':  { target: 'http://localhost:3000', changeOrigin: true },
      '/notificacoes': { target: 'http://localhost:3000', changeOrigin: true },
    }
  }
})
