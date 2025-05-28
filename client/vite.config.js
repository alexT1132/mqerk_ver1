import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    host: '192.168.0.2', // Permite acceso desde otras direcciones IP
    port: 5000,      // Cambia el puerto si lo necesitas
},
})