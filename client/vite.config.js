// vite.config.js
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss({
      // ¡ESTO ES LO CRUCIAL PARA QUE EL DISEÑO FUNCIONE!
      // Le dice a Tailwind dónde buscar tus clases CSS.
      content: [
        "./index.html", // Si tienes un index.html que usa clases de Tailwind
        "./src/**/*.{js,ts,jsx,tsx}", // Escanea todos los archivos JS, TS, JSX, TSX dentro de la carpeta src
      ],
      // Configuración personalizada para mejor responsividad
      theme: {
        extend: {
          screens: {
            'xs': '475px',      // Extra small devices
            'sm': '640px',      // Small devices
            'md': '768px',      // Medium devices
            'lg': '1024px',     // Large devices
            'xl': '1280px',     // Extra large devices
            '2xl': '1536px',    // 2x Extra large devices
          },
          fontSize: {
            'xxs': ['0.625rem', { lineHeight: '0.75rem' }],   // 10px
          },
          spacing: {
            '18': '4.5rem',
            '88': '22rem',
          },
          animation: {
            'fade-in': 'fadeIn 0.5s ease-in-out',
            'bounce-gentle': 'bounceGentle 2s infinite',
          },
          keyframes: {
            fadeIn: {
              '0%': { opacity: '0' },
              '100%': { opacity: '1' },
            },
            bounceGentle: {
              '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
              '40%': { transform: 'translateY(-5px)' },
              '60%': { transform: 'translateY(-3px)' },
            },
          },
        },
      },
    }),
  ],
  server: {
    // Habilitamos host: true para permitir acceso desde la red local
    // Esto permitirá que tus compañeros accedan usando tu IP local
    host: true,      // Permite acceso desde cualquier IP de la red
    port: 5000,      // Mantenemos el puerto 5000
  },
});
