// Helper to build WebSocket URL for notifications in a robust, configurable way
// Order of precedence:
// 1. Explicit env var: VITE_WS_NOTIFICATIONS_URL (full ws:// or wss:// URL)
// 2. Derive from VITE_API_URL (switch http->ws, https->wss, strip trailing /api)
// 3. Fallback to current hostname + default backend port 1002
import { getApiOrigin } from './url.js';

export function getWsNotificationsUrl() {
  try {
    const override = import.meta?.env?.VITE_WS_NOTIFICATIONS_URL;
    if (override) return override.trim().replace(/\/$/, '');

    const origin = getApiOrigin(); // e.g. http://localhost:1002
    const u = new URL(origin);
    u.protocol = (u.protocol === 'https:') ? 'wss:' : 'ws:';
    u.pathname = '/ws/notifications';
    u.hash = '';
    return u.toString();
  } catch (e) {
    const host = (typeof window !== 'undefined' && window.location && window.location.hostname) || 'localhost';
    const proto = (typeof window !== 'undefined' && window.location && window.location.protocol === 'https:') ? 'wss' : 'ws';
    return `${proto}://${host}:1002/ws/notifications`;
  }
}

// Simple health probe for the backend before opening the WS to avoid instant "connection refused" noise
export async function waitForBackendHealth(timeoutMs = 4000) {
  const start = Date.now();
  const origin = getApiOrigin();
  const url = `${origin.replace(/\/$/, '')}/api/health`;
  while (Date.now() - start < timeoutMs) {
    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 1500);
      const res = await fetch(url, { credentials: 'include', signal: ctrl.signal });
      clearTimeout(tid);
      if (res.ok) return true;
    } catch (_) { /* ignore */ }
    await new Promise(r => setTimeout(r, 500));
  }
  return false;
}
