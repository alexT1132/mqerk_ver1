import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Permitir ajustar HMR cuando se accede desde túneles o LAN
const HMR_HOST = process.env.VITE_HMR_HOST || undefined;
const HMR_PORT = process.env.VITE_HMR_PORT ? Number(process.env.VITE_HMR_PORT) : undefined;
const HMR_PROTOCOL = process.env.VITE_HMR_PROTOCOL || undefined;
const HMR_CLIENT_PORT = process.env.VITE_HMR_CLIENT_PORT ? Number(process.env.VITE_HMR_CLIENT_PORT) : undefined;

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  define: {
    global: 'globalThis',
  },
  server:{
    host: true,
    port: 5002,
    strictPort: false, // permite que cambie de puerto si 5173 está ocupado
    // Permitir acceso desde dominios de túneles (loca.lt cambia el subdominio en cada sesión)
    allowedHosts: ['.loca.lt'],
    // HMR: solo sobreescribimos si hay variables de entorno; de lo contrario Vite autodetecta
    ...(HMR_HOST || HMR_PORT || HMR_PROTOCOL || HMR_CLIENT_PORT ? {
      hmr: {
        ...(HMR_PROTOCOL ? { protocol: HMR_PROTOCOL } : {}),
        ...(HMR_HOST ? { host: HMR_HOST } : {}),
        ...(HMR_PORT ? { port: HMR_PORT } : {}),
        ...(HMR_CLIENT_PORT ? { clientPort: HMR_CLIENT_PORT } : {}),
      }
    } : {}),
    // Proxy para evitar que fetch('/api/...') devuelva index.html del dev server (causando '<!doctype' en JSON)
    proxy: {
      '/api': {
        target: 'http://localhost:1002',
        changeOrigin: true,
        secure: false,
      },
      // Proxy de WebSocket de notificaciones hacia el backend
      '/ws': {
        target: 'http://localhost:1002',
        changeOrigin: true,
        secure: false,
        ws: true
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