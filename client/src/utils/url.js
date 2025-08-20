// Robust helpers to build absolute URLs for backend-served static files

export const getApiOrigin = () => {
  try {
    const host = (typeof window !== 'undefined' && window.location && window.location.hostname)
      ? window.location.hostname
      : 'localhost';
    let envApi;
    try {
      // Vite exposes import.meta.env
      envApi = import.meta && import.meta.env && import.meta.env.VITE_API_URL;
    } catch (_) {
      envApi = undefined;
    }
    const base = envApi || `http://${host}:1002/api`;
    return base.replace(/\/api\/?$/i, '');
  } catch (_) {
    return 'http://localhost:1002';
  }
};

export const buildStaticUrl = (p) => {
  if (!p) return null;
  let s = String(p).trim();
  if (!s) return null;
  // Already absolute
  if (/^https?:\/\//i.test(s)) return s;
  // Normalize slashes and strip Windows drive prefixes
  s = s.replace(/\\+/g, '/');
  s = s.replace(/^([A-Za-z]:)?\/+/,'/');
  // Ensure leading slash
  if (!s.startsWith('/')) s = '/' + s;
  const origin = getApiOrigin();
  return `${origin}${s}`;
};

export default buildStaticUrl;
