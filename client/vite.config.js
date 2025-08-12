import { defineConfig } from 'vite'
import React from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [
    tailwindcss(),
    React(),
  ],
  server: {
    host: '192.168.0.12', // Permite acceso desde otras direcciones IP
    port: 5000,      // Cambia el puerto si lo necesitas
},
});