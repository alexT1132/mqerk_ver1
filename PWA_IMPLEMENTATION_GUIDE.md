# 📱 Guía de Implementación PWA - MQerk Academy

> **Estado**: Pendiente de implementación  
> **Prioridad**: Media  
> **Tiempo estimado**: 4-6 horas  
> **Última actualización**: 22 de diciembre de 2025

---

## 📋 Índice

1. [¿Qué es una PWA?](#qué-es-una-pwa)
2. [Beneficios para MQerk Academy](#beneficios-para-mqerk-academy)
3. [Requisitos Previos](#requisitos-previos)
4. [Pasos de Implementación](#pasos-de-implementación)
5. [Archivos a Crear](#archivos-a-crear)
6. [Configuración](#configuración)
7. [Testing y Validación](#testing-y-validación)
8. [Deployment](#deployment)
9. [Mantenimiento](#mantenimiento)

---

## 🎯 ¿Qué es una PWA?

Una **Progressive Web App** combina lo mejor de las aplicaciones web y móviles:

- ✅ **Instalable**: Los usuarios pueden instalarla en sus dispositivos sin pasar por tiendas de apps
- ✅ **Offline**: Funciona sin conexión a Internet usando Service Workers
- ✅ **Rápida**: Carga instantánea gracias al caché inteligente
- ✅ **Notificaciones Push**: Envío de recordatorios y alertas
- ✅ **Experiencia Nativa**: Se ve y se siente como una app nativa
- ✅ **Actualización Automática**: Sin necesidad de descargar actualizaciones manualmente

---

## 🚀 Beneficios para MQerk Academy

### Para Estudiantes
- 📱 Acceso rápido desde la pantalla de inicio
- 📚 Revisar materiales sin conexión a Internet
- 🔔 Recibir notificaciones de nuevos quizzes y actividades
- ⚡ Carga instantánea de la aplicación
- 💾 Menor consumo de datos móviles

### Para Asesores
- 📊 Acceso rápido a estadísticas de estudiantes
- 📝 Crear contenido incluso sin conexión
- 🔔 Alertas de entregas de estudiantes
- 🎯 Mayor engagement con la plataforma

### Para la Academia
- 📈 Mayor retención de usuarios
- 💰 Reducción de costos de infraestructura (menos peticiones al servidor)
- 🌐 Alcance multiplataforma (Android, iOS, Desktop)
- 📊 Mejor posicionamiento en búsquedas (Google favorece PWAs)

---

## ⚙️ Requisitos Previos

- [x] Node.js instalado
- [x] Proyecto React con Vite funcionando
- [ ] Logo de la academia en formato PNG
- [ ] Certificado SSL (HTTPS) para producción
- [ ] Dominio configurado

---

## 📝 Pasos de Implementación

### Fase 1: Configuración Básica (2 horas)

#### 1.1 Instalar Dependencias

```bash
cd client
npm install -D vite-plugin-pwa
```

#### 1.2 Crear Manifest

**Archivo**: `client/public/manifest.json`

```json
{
  "name": "MQerk Academy - Preparación Universitaria",
  "short_name": "MQerk",
  "description": "Plataforma educativa para preparación de exámenes de admisión universitaria",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0B5ED7",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/desktop-1.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "/screenshots/mobile-1.png",
      "sizes": "540x720",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ],
  "categories": ["education", "productivity"],
  "shortcuts": [
    {
      "name": "Dashboard",
      "short_name": "Dashboard",
      "description": "Ir al panel principal",
      "url": "/alumno/dashboard",
      "icons": [{ "src": "/icons/dashboard-96x96.png", "sizes": "96x96" }]
    },
    {
      "name": "Quizzes",
      "short_name": "Quizzes",
      "description": "Ver quizzes disponibles",
      "url": "/alumno/actividades",
      "icons": [{ "src": "/icons/quiz-96x96.png", "sizes": "96x96" }]
    },
    {
      "name": "Simulaciones",
      "short_name": "Simulaciones",
      "description": "Realizar simulaciones",
      "url": "/alumno/simulaciones",
      "icons": [{ "src": "/icons/sim-96x96.png", "sizes": "96x96" }]
    }
  ]
}
```

#### 1.3 Crear Service Worker

**Archivo**: `client/public/sw.js`

```javascript
const CACHE_NAME = 'mqerk-academy-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html'
];

// Instalación - cachear recursos esenciales
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cacheando recursos esenciales');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activación - limpiar cachés antiguos
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch - estrategia Network First con fallback a caché
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Solo cachear respuestas exitosas
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Si falla la red, usar caché
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              console.log('[SW] Sirviendo desde caché:', event.request.url);
              return response;
            }
            // Página offline de respaldo para navegación
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
          });
      })
  );
});

// Sincronización en segundo plano (opcional)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-quizzes') {
    event.waitUntil(syncQuizzes());
  }
});

async function syncQuizzes() {
  // Lógica para sincronizar quizzes pendientes cuando vuelva la conexión
  console.log('[SW] Sincronizando quizzes pendientes...');
}
```

#### 1.4 Crear Página Offline

**Archivo**: `client/public/offline.html`

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sin conexión - MQerk Academy</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
      padding: 20px;
    }
    .container {
      max-width: 500px;
      animation: fadeIn 0.5s ease-in;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .icon {
      font-size: 5rem;
      margin-bottom: 1rem;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    h1 {
      font-size: 2rem;
      margin-bottom: 1rem;
      font-weight: 700;
    }
    p {
      font-size: 1.1rem;
      opacity: 0.95;
      line-height: 1.6;
      margin-bottom: 2rem;
    }
    button {
      padding: 14px 32px;
      font-size: 1rem;
      background: white;
      color: #667eea;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.3);
    }
    button:active {
      transform: translateY(0);
    }
    .tips {
      margin-top: 2rem;
      padding: 1.5rem;
      background: rgba(255,255,255,0.1);
      border-radius: 12px;
      backdrop-filter: blur(10px);
    }
    .tips h3 {
      font-size: 1.2rem;
      margin-bottom: 0.5rem;
    }
    .tips ul {
      list-style: none;
      text-align: left;
      font-size: 0.95rem;
      opacity: 0.9;
    }
    .tips li {
      margin: 0.5rem 0;
      padding-left: 1.5rem;
      position: relative;
    }
    .tips li:before {
      content: "✓";
      position: absolute;
      left: 0;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">📡</div>
    <h1>Sin conexión a Internet</h1>
    <p>
      No podemos conectarnos al servidor en este momento. 
      Por favor, verifica tu conexión e intenta nuevamente.
    </p>
    <button onclick="window.location.reload()">
      🔄 Reintentar conexión
    </button>
    
    <div class="tips">
      <h3>💡 Mientras tanto...</h3>
      <ul>
        <li>Verifica que tu WiFi o datos móviles estén activos</li>
        <li>Algunos contenidos pueden estar disponibles sin conexión</li>
        <li>Tus respuestas se guardarán cuando vuelvas a conectarte</li>
      </ul>
    </div>
  </div>
  
  <script>
    // Detectar cuando vuelve la conexión
    window.addEventListener('online', () => {
      window.location.reload();
    });
  </script>
</body>
</html>
```

---

### Fase 2: Integración con React (1 hora)

#### 2.1 Registrar Service Worker

**Archivo**: `client/src/registerSW.js`

```javascript
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registrado:', registration.scope);
          
          // Verificar actualizaciones cada hora
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);
        })
        .catch((error) => {
          console.error('❌ Error al registrar Service Worker:', error);
        });
    });
  }
}

export function checkForUpdates() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Nueva versión disponible
            const shouldUpdate = confirm(
              '🎉 Nueva versión de MQerk Academy disponible. ¿Actualizar ahora?'
            );
            if (shouldUpdate) {
              window.location.reload();
            }
          }
        });
      });
    });
  }
}

export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error('Error al desregistrar Service Worker:', error);
      });
  }
}
```

#### 2.2 Modificar main.jsx

**Archivo**: `client/src/main.jsx`

```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { registerServiceWorker, checkForUpdates } from './registerSW'

// Registrar Service Worker en producción
if (import.meta.env.PROD) {
  registerServiceWorker();
  checkForUpdates();
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

#### 2.3 Componente de Instalación

**Archivo**: `client/src/components/shared/InstallPWA.jsx`

```jsx
import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // No mostrar si ya fue rechazado antes
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setShowInstall(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('✅ PWA instalada exitosamente');
    } else {
      console.log('❌ Usuario rechazó la instalación');
    }
    
    setDeferredPrompt(null);
    setShowInstall(false);
  };

  const handleDismiss = () => {
    setShowInstall(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showInstall) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-xl shadow-2xl max-w-sm z-50 animate-slide-up">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-white/80 hover:text-white transition"
        aria-label="Cerrar"
      >
        <X size={20} />
      </button>
      
      <div className="flex items-start gap-3 pr-6">
        <div className="bg-white/20 p-2 rounded-lg">
          <Download size={24} />
        </div>
        <div>
          <h3 className="font-bold text-lg mb-1">
            Instalar MQerk Academy
          </h3>
          <p className="text-sm text-white/90 mb-3">
            Accede más rápido y úsala sin conexión a Internet
          </p>
          <button
            onClick={handleInstall}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-all hover:scale-105"
          >
            Instalar ahora
          </button>
        </div>
      </div>
    </div>
  );
}
```

#### 2.4 Agregar a App.jsx

```jsx
import InstallPWA from './components/shared/InstallPWA';

// Dentro del return, antes del cierre final:
export default function App(){
  return (
    <AsesorProvider>
      {/* ... resto del código ... */}
      <InstallPWA />
    </AsesorProvider>
  )
}
```

---

### Fase 3: Configuración de Vite (30 min)

#### 3.1 Actualizar vite.config.js

**Archivo**: `client/vite.config.js`

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.png'],
      manifest: false, // Usamos el manifest.json manual
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 año
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https?:\/\/localhost:1002\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 5 // 5 minutos
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 días
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: false // Desactivar en desarrollo
      }
    })
  ],
  server: {
    port: 5173,
    host: true
  }
})
```

#### 3.2 Actualizar index.html

**Archivo**: `client/index.html`

Agregar en el `<head>`:

```html
<!-- PWA Meta Tags -->
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#0B5ED7">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="MQerk">

<!-- iOS Icons -->
<link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png">
<link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png">
<link rel="apple-touch-icon" sizes="120x120" href="/icons/icon-120x120.png">

<!-- Favicon -->
<link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png">

<!-- Descripción para SEO y PWA -->
<meta name="description" content="Plataforma educativa para preparación de exámenes de admisión universitaria">
<meta name="keywords" content="educación, examen admisión, universidad, preparación, MQerk">
```

---

### Fase 4: Generación de Iconos (30 min)

#### 4.1 Tamaños Necesarios

Crear iconos en los siguientes tamaños (en `client/public/icons/`):

- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- `icon-144x144.png`
- `icon-152x152.png`
- `icon-192x192.png`
- `icon-384x384.png`
- `icon-512x512.png`
- `favicon-16x16.png`
- `favicon-32x32.png`

#### 4.2 Herramientas Recomendadas

1. **PWA Asset Generator**: https://www.pwabuilder.com/imageGenerator
2. **RealFaviconGenerator**: https://realfavicongenerator.net/
3. **Favicon.io**: https://favicon.io/

**Proceso**:
1. Subir logo de MQerk Academy (mínimo 512x512px)
2. Generar todos los tamaños
3. Descargar y colocar en `client/public/icons/`

---

## 🧪 Testing y Validación

### 1. Build de Producción

```bash
cd client
npm run build
npm run preview
```

### 2. Chrome DevTools

1. Abrir DevTools (F12)
2. Ir a pestaña **"Application"**
3. Verificar:
   - **Manifest**: Debe aparecer correctamente
   - **Service Workers**: Estado "activated"
   - **Cache Storage**: Verificar recursos cacheados

### 3. Lighthouse Audit

1. DevTools → Lighthouse
2. Seleccionar "Progressive Web App"
3. Click en "Generate report"
4. **Meta**: Obtener score > 90/100

### 4. Prueba de Instalación

**Desktop**:
- Chrome: Icono de instalación en barra de direcciones
- Edge: Menú → Apps → Instalar

**Mobile**:
- Chrome Android: Menú → "Instalar app"
- Safari iOS: Compartir → "Añadir a pantalla de inicio"

### 5. Prueba Offline

1. Instalar la app
2. DevTools → Network → Offline
3. Navegar por la app
4. Verificar que funcione sin conexión

---

## 🚀 Deployment

### Configuración de Servidor (Producción)

#### 1. HTTPS Obligatorio

Las PWAs **requieren HTTPS** (excepto localhost). Configurar:

- Certificado SSL (Let's Encrypt gratuito)
- Redirigir HTTP → HTTPS

#### 2. Headers HTTP

Configurar en el servidor web (nginx/apache):

```nginx
# Service Worker debe servirse con estos headers
location /sw.js {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Pragma "no-cache";
    add_header Expires "0";
}

# Manifest
location /manifest.json {
    add_header Content-Type "application/manifest+json";
}
```

#### 3. Build Optimizado

```bash
cd client
npm run build

# Los archivos estarán en client/dist/
# Subir a servidor de producción
```

---

## 🔔 Notificaciones Push (Fase Futura)

### Configuración Backend

**Archivo**: `server/controllers/notifications.controller.js`

```javascript
import webpush from 'web-push';

// Configurar VAPID keys
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY
};

webpush.setVapidDetails(
  'mailto:admin@mqerk.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

export async function sendPushNotification(subscription, payload) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    console.log('✅ Notificación enviada');
  } catch (error) {
    console.error('❌ Error enviando notificación:', error);
  }
}
```

### Generar VAPID Keys

```bash
npm install -g web-push
web-push generate-vapid-keys
```

---

## 📊 Métricas y Analytics

### Eventos a Trackear

```javascript
// Instalación de PWA
window.addEventListener('appinstalled', () => {
  console.log('PWA instalada');
  // Enviar evento a Google Analytics
  gtag('event', 'pwa_install', {
    event_category: 'engagement',
    event_label: 'PWA Installation'
  });
});

// Uso offline
window.addEventListener('offline', () => {
  console.log('App offline');
});

window.addEventListener('online', () => {
  console.log('App online nuevamente');
});
```

---

## 🔧 Mantenimiento

### Actualización de Versión

Cada vez que se actualice la app:

1. Cambiar versión en `sw.js`:
```javascript
const CACHE_NAME = 'mqerk-academy-v1.0.1'; // Incrementar versión
```

2. Build y deploy
3. Los usuarios recibirán notificación de actualización automáticamente

### Debugging

```javascript
// Ver estado del Service Worker
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers:', registrations);
});

// Ver caché
caches.keys().then(keys => {
  console.log('Cachés disponibles:', keys);
});
```

---

## ✅ Checklist de Implementación

### Preparación
- [ ] Instalar `vite-plugin-pwa`
- [ ] Generar iconos (72px - 512px)
- [ ] Crear logo para splash screen
- [ ] Tomar screenshots de la app

### Archivos a Crear
- [ ] `client/public/manifest.json`
- [ ] `client/public/sw.js`
- [ ] `client/public/offline.html`
- [ ] `client/src/registerSW.js`
- [ ] `client/src/components/shared/InstallPWA.jsx`

### Configuración
- [ ] Actualizar `vite.config.js`
- [ ] Actualizar `index.html` con meta tags
- [ ] Modificar `main.jsx` para registrar SW
- [ ] Agregar `InstallPWA` a `App.jsx`

### Testing
- [ ] Build de producción funcional
- [ ] Lighthouse score > 90
- [ ] Instalación en desktop funciona
- [ ] Instalación en móvil funciona
- [ ] Modo offline funciona
- [ ] Caché funciona correctamente

### Deployment
- [ ] HTTPS configurado
- [ ] Headers HTTP correctos
- [ ] Build subido a producción
- [ ] Prueba en dispositivos reales

---

## 📚 Recursos Adicionales

- [PWA Builder](https://www.pwabuilder.com/)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [MDN - Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Google PWA Checklist](https://web.dev/pwa-checklist/)
- [Can I Use - Service Workers](https://caniuse.com/serviceworkers)

---

## 🐛 Troubleshooting

### Problema: Service Worker no se registra

**Solución**:
- Verificar que estés en HTTPS (o localhost)
- Revisar consola del navegador
- Verificar que `sw.js` esté en `/public/`

### Problema: Caché no se actualiza

**Solución**:
- Incrementar versión en `CACHE_NAME`
- Limpiar caché manualmente en DevTools
- Desregistrar SW y volver a registrar

### Problema: No aparece prompt de instalación

**Solución**:
- Verificar que el manifest sea válido
- Asegurarse de tener HTTPS
- Verificar que todos los iconos existan
- Revisar que `display: "standalone"` esté en manifest

---

## 📝 Notas Finales

- **Prioridad**: Media - Implementar después de funcionalidades core
- **Impacto**: Alto - Mejora significativa en UX y engagement
- **Complejidad**: Media - Requiere conocimientos de Service Workers
- **Tiempo**: 4-6 horas para implementación completa
- **Mantenimiento**: Bajo - Solo actualizar versión en releases

---

**Última actualización**: 22 de diciembre de 2025  
**Autor**: Equipo de Desarrollo MQerk Academy  
**Versión del documento**: 1.0
