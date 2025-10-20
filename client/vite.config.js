import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server:{
    host: true,
    port: 5001,
    // Proxy para evitar que fetch('/api/...') devuelva index.html del dev server (causando '<!doctype' en JSON)
    proxy: {
      '/api': {
        target: 'http://localhost:1002',
        changeOrigin: true,
        secure: false,
      },
      // Permitir abrir PDFs y otros archivos servidos por Express (evita 404 del dev server de Vite)
      '/public': {
        target: 'http://localhost:1002',
        changeOrigin: true,
        secure: false,
      },
      '/comprobantes': {
        target: 'http://localhost:1002',
        changeOrigin: true,
        secure: false,
      },
      '/contratos': {
        target: 'http://localhost:1002',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:1002',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  preview: {
    host: true, // permite acceder vía LAN al modo preview (build)
    port: 4173,
    strictPort: true
  }
})