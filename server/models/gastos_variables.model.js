import db from '../db.js';

// Ensure calendar_event_id column exists (idempotent best-effort)
let __ensured = false;
async function ensureCalendarColumn() {
  if (__ensured) return;
  try {
    await db.query("ALTER TABLE gastos_variables ADD COLUMN IF NOT EXISTS calendar_event_id INT NULL AFTER estatus");
  } catch (e) {
    try {
      // Fallback for MySQL that doesn't support IF NOT EXISTS in ADD COLUMN
      const [cols] = await db.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'gastos_variables'");
      const names = new Set(cols.map(c=>c.COLUMN_NAME));
      if (!names.has('calendar_event_id')) {
        await db.query('ALTER TABLE gastos_variables ADD COLUMN calendar_event_id INT NULL');
      }
    } catch (_) { /* noop */ }
  }
  __ensured = true;
}

export async function list({ metodo, estatus } = {}) {
  await ensureCalendarColumn().catch(()=>{});
  const where = [];
  const params = [];
  if (metodo) { where.push('metodo = ?'); params.push(metodo); }
  if (estatus) { where.push('estatus = ?'); params.push(estatus); }
  const sql = `SELECT * FROM gastos_variables ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY id DESC`;
  const [rows] = await db.query(sql, params);
  return rows;
}

export async function create(data) {
  await ensureCalendarColumn().catch(()=>{});
  const { unidades=1, producto, descripcion=null, entidad=null, valor_unitario=0, metodo='Efectivo', importe=0, estatus='Pendiente', calendar_event_id=null } = data || {};
  const sql = `INSERT INTO gastos_variables (unidades, producto, descripcion, entidad, valor_unitario, metodo, importe, estatus, calendar_event_id)
               VALUES (?,?,?,?,?,?,?,?,?)`;
  const params = [unidades, producto, descripcion, entidad, valor_unitario, metodo, importe, estatus, calendar_event_id];
  const [res] = await db.query(sql, params);
  const [rows] = await db.query('SELECT * FROM gastos_variables WHERE id=? LIMIT 1', [res.insertId]);
  return rows[0];
}

export async function getById(id) {
  const [rows] = await db.query('SELECT * FROM gastos_variables WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

export async function getByCalendarEventId(calendarEventId) {
  if (!calendarEventId) return null;
  await ensureCalendarColumn().catch(()=>{});
  const [rows] = await db.query('SELECT * FROM gastos_variables WHERE calendar_event_id = ? LIMIT 1', [calendarEventId]);
  return rows[0] || null;
}

export async function update(id, updates) {
  await ensureCalendarColumn().catch(()=>{});
  const allowed = ['unidades','producto','descripcion','entidad','valor_unitario','metodo','importe','estatus','calendar_event_id'];
  const fields = [];
  const values = [];
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(updates, key)) { fields.push(`${key} = ?`); values.push(updates[key]); }
  }
  if (!fields.length) return null;
  values.push(id);
  await db.query(`UPDATE gastos_variables SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);
  const [rows] = await db.query('SELECT * FROM gastos_variables WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

export async function remove(id) {
  const [res] = await db.query('DELETE FROM gastos_variables WHERE id = ?', [id]);
  return res.affectedRows > 0;
}
