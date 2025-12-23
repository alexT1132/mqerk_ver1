

export const getApiOrigin = () => {
  try {
    let envApi;
    try {
      // Vite exposes import.meta.env
      envApi = import.meta && import.meta.env && import.meta.env.VITE_API_URL;
    } catch (_) {
      envApi = undefined;
    }

    // Detectar si estamos en el navegador y "dónde" estamos realmente
    const inBrowser = typeof window !== 'undefined' && window.location;
    const currentHostname = inBrowser ? (window.location.hostname || 'localhost') : 'localhost';
    const isLocalhost = currentHostname === 'localhost' || currentHostname === '127.0.0.1';

    // Si se define VITE_API_URL, normalmente la usamos.
    // PERO: Si VITE_API_URL dice "localhost" y nosotros NO estamos en localhost (ej: estamos en 192.168.1.50),
    // entonces IGNORAMOS la variable de entorno y usamos la lógica dinámica.
    // Esto arregla el error común donde se deja .env con localhost y se intenta probar en red.
    if (envApi) {
      const cleanEnv = envApi.replace(/\/api\/?$/i, '');
      if (!isLocalhost && (cleanEnv.includes('localhost') || cleanEnv.includes('127.0.0.1'))) {
        console.warn('[API] Ignorando VITE_API_URL (localhost) porque estamos accediendo vía IP:', currentHostname);
        // Fallthrough to dynamic logic
      } else {
        return cleanEnv;
      }
    }

    // En desarrollo (o si falló la env var arriba), usar el hostname actual pero con el puerto del backend (1002)
    // Esto asume que si sirves el frontend en X.X.X.X, el backend también está en X.X.X.X
    if (inBrowser) {
      // Preservar protocolo (http/https)
      const protocol = window.location.protocol || 'http:';
      return `${protocol}//${currentHostname}:1002`;
    }

    // Fallback seguro para herramientas fuera del navegador
    return 'http://localhost:1002';
  } catch (_) {
    return 'http://localhost:1002';
  }
};

// Returns base API URL including /api
export const getApiBase = () => {
  const origin = getApiOrigin();
  return `${origin}/api`;
};

// Helper to build full endpoint paths safely
export const buildApiUrl = (path = '') => {
  const base = getApiBase();
  if (!path) return base;
  return `${base}${path.startsWith('/') ? path : '/' + path}`;
};

export const buildStaticUrl = (p) => {
  if (!p) return null;
  let s = String(p).trim();
  if (!s) return null;

  // Si ya es una URL absoluta, la devolvemos tal cual (esto está bien)
  if (/^https?:\/\//i.test(s)) return s;

  // Normalizamos la ruta para que siempre use '/' (esto también está bien)
  s = s.replace(/\\+/g, '/');
  s = s.replace(/^([A-Za-z]:)?\/+/, '/');
  if (!s.startsWith('/')) s = '/' + s;

  // --- Desarrollo: devolver siempre rutas relativas para evitar Mixed Content cuando se usa túnel HTTPS ---
  if (import.meta.env.DEV) {
    return s;
  }

  // En producción, sí construimos la URL completa como antes.
  const origin = getApiOrigin();
  return `${origin}${s}`;
};

export default buildStaticUrl;
