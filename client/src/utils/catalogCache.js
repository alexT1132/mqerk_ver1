// Simple sessionStorage cache for áreas/módulos catálogo
// Version bump this if the data shape changes
const CATALOG_CACHE_VERSION = 'v1';
const CACHE_KEY = `areasCatalog:${CATALOG_CACHE_VERSION}`;
const MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes TTL

export function getCachedAreasCatalog() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (!parsed.timestamp || Date.now() - parsed.timestamp > MAX_AGE_MS) {
      return { data: parsed.data, stale: true };
    }
    return { data: parsed.data, stale: false };
  } catch { return null; }
}

export function setCachedAreasCatalog(data) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }));
  } catch { /* ignore quota */ }
}

export function clearAreasCatalogCache() {
  if (typeof window === 'undefined') return;
  try { sessionStorage.removeItem(CACHE_KEY); } catch {}
}

export const AREAS_CATALOG_CACHE = {
  get: getCachedAreasCatalog,
  set: setCachedAreasCatalog,
  clear: clearAreasCatalogCache,
  key: CACHE_KEY,
  ttlMs: MAX_AGE_MS,
};
