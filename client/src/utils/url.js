

export const getApiOrigin = () => {
  try {
    let envApi;
    try {
      // Vite exposes import.meta.env
      envApi = import.meta && import.meta.env && import.meta.env.VITE_API_URL;
    } catch (_) {
      envApi = undefined;
    }
    // Si se define VITE_API_URL (completa), úsala como origen
    if (envApi) return envApi.replace(/\/api\/?$/i, '');

    // En entorno de navegador, usar el mismo origen actual para que actúe el proxy de Vite
    if (typeof window !== 'undefined' && window.location && window.location.origin) {
      return window.location.origin;
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
export const buildApiUrl = (path='') => {
  const base = getApiBase();
  if(!path) return base;
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
  s = s.replace(/^([A-Za-z]:)?\/+/,'/');
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
