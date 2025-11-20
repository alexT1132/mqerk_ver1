import { pingDb } from '../db.js';

export const health = async (req, res) => {
  // Siempre devolver 200 para que el health check no bloquee el WebSocket
  // El frontend puede decidir si abrir el WS basándose en ok: false
  const out = { ok: true, db: { ok: false, error: null }, timestamp: new Date().toISOString() };
  try {
    await pingDb();
    out.db.ok = true;
    return res.status(200).json(out);
  } catch (e) {
    // Si hay un error de DB, marcar como no saludable pero aún devolver 200
    out.ok = false;
    out.db.ok = false;
    out.db.error = e?.message || String(e) || 'db error';
    // Log del error pero no exponer detalles sensibles
    console.error('[health] DB check failed:', e?.code || e?.errno || 'unknown', e?.message || String(e));
    // Devolver 200 siempre para que el health check no bloquee el WebSocket
    // El frontend puede decidir si abrir el WS basándose en ok: false
    return res.status(200).json(out);
  }
};
