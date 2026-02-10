/**
 * Utilidades para construir URLs estáticas
 */

/**
 * Construir URL estática para archivos
 * @param {string} filePath - Ruta del archivo (relativa o absoluta)
 * @returns {string|null} URL completa o null si no hay path
 */
export function buildStaticUrl(filePath) {
  if (!filePath) return null;
  
  const path = String(filePath).trim();
  if (!path) return null;
  
  // Si ya es una URL absoluta, devolverla tal cual
  if (/^https?:\/\//i.test(path)) return path;
  
  // Normalizar separadores de ruta
  let normalized = path.replace(/\\+/g, '/');
  
  // Si no empieza con /, agregarlo
  if (!normalized.startsWith('/')) {
    normalized = '/' + normalized;
  }
  
  // En desarrollo, usar localhost
  const isDev = process.env.NODE_ENV !== 'production';
  const port = process.env.PORT || 1002;
  const host = process.env.HOST || 'localhost';
  const protocol = isDev ? 'http' : (process.env.PROTOCOL || 'http');
  
  // Construir URL base
  const baseUrl = `${protocol}://${host === '0.0.0.0' ? 'localhost' : host}:${port}`;
  
  return `${baseUrl}${normalized}`;
}

export function buildPublicUrl(req, relativePath) {
  const base = `${req.protocol}://${req.get('host')}`;
  return `${base}${relativePath.startsWith('/') ? '' : '/'}${relativePath}`;
}
