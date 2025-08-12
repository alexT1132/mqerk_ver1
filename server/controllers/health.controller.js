import { pingDb } from '../db.js';

export const health = async (req, res) => {
  const out = { ok: true, db: { ok: false, error: null } };
  try {
    await pingDb();
    out.db.ok = true;
  } catch (e) {
    out.ok = false;
    out.db.ok = false;
    out.db.error = e?.message || 'db error';
  }
  res.status(out.ok ? 200 : 500).json(out);
};
