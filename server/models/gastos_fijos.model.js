import db from '../db.js';

// Ensure optional column plantilla_id exists for idempotency
async function ensurePlantillaColumn() {
  try {
    await db.query("ALTER TABLE gastos_fijos ADD COLUMN IF NOT EXISTS plantilla_id INT NULL AFTER id");
  } catch (e) {
    try {
      const [cols] = await db.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'gastos_fijos'");
      const have = new Set(cols.map(c => c.COLUMN_NAME));
      if (!have.has('plantilla_id')) {
        await db.query('ALTER TABLE gastos_fijos ADD COLUMN plantilla_id INT NULL');
      }
    } catch {}
  }
}

// Ensure frecuencia enum includes Bimestral (forward-compatible)
async function ensureFrecuenciaEnum() {
  try {
    await db.query("ALTER TABLE gastos_fijos MODIFY COLUMN frecuencia ENUM('Diario','Semanal','Quincenal','Mensual','Bimestral','Semestral','Anual') NOT NULL DEFAULT 'Mensual'");
  } catch (_) {}
}

export async function list({ from, to, metodo, estatus, frecuencia } = {}) {
  const where = [];
  const params = [];
  if (from) { where.push('fecha >= ?'); params.push(from); }
  if (to) { where.push('fecha <= ?'); params.push(to); }
  if (metodo) { where.push('metodo = ?'); params.push(metodo); }
  if (estatus) { where.push('estatus = ?'); params.push(estatus); }
  if (frecuencia) { where.push('frecuencia = ?'); params.push(frecuencia); }
  const sql = `SELECT * FROM gastos_fijos ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY fecha DESC, id DESC`;
  const [rows] = await db.query(sql, params);
  return rows;
}

export async function create(data) {
  await Promise.all([ensurePlantillaColumn().catch(()=>{}), ensureFrecuenciaEnum().catch(()=>{})]);
  const { fecha, hora=null, categoria, descripcion=null, proveedor=null, frecuencia='Mensual', metodo='Efectivo', importe=0, estatus='Pendiente', calendar_event_id=null, plantilla_id=null } = data || {};
  const sql = `INSERT INTO gastos_fijos (fecha, hora, categoria, descripcion, proveedor, frecuencia, metodo, importe, estatus, calendar_event_id, plantilla_id)
               VALUES (?,?,?,?,?,?,?,?,?,?,?)`;
  const params = [fecha, hora, categoria, descripcion, proveedor, frecuencia, metodo, importe, estatus, calendar_event_id, plantilla_id];
  const [res] = await db.query(sql, params);
  const [rows] = await db.query('SELECT * FROM gastos_fijos WHERE id=? LIMIT 1', [res.insertId]);
  return rows[0];
}

export async function getById(id) {
  const [rows] = await db.query('SELECT * FROM gastos_fijos WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

export async function getByCalendarEventId(calendarEventId) {
  if (!calendarEventId) return null;
  const [rows] = await db.query('SELECT * FROM gastos_fijos WHERE calendar_event_id = ? LIMIT 1', [calendarEventId]);
  return rows[0] || null;
}

export async function update(id, updates) {
  await Promise.all([ensurePlantillaColumn().catch(()=>{}), ensureFrecuenciaEnum().catch(()=>{})]);
  const allowed = ['fecha','hora','categoria','descripcion','proveedor','frecuencia','metodo','importe','estatus','calendar_event_id','plantilla_id'];
  const fields = [];
  const values = [];
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(updates, key)) { fields.push(`${key} = ?`); values.push(updates[key]); }
  }
  if (!fields.length) return null;
  values.push(id);
  await db.query(`UPDATE gastos_fijos SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);
  const [rows] = await db.query('SELECT * FROM gastos_fijos WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

export async function remove(id) {
  const [res] = await db.query('DELETE FROM gastos_fijos WHERE id = ?', [id]);
  return res.affectedRows > 0;
}

// Idempotency helper: find gasto by plantilla_id and fecha (YYYY-MM-DD)
export async function findByPlantillaAndDate(plantillaId, fecha) {
  if (!plantillaId || !fecha) return null;
  await ensurePlantillaColumn().catch(()=>{});
  const [rows] = await db.query('SELECT * FROM gastos_fijos WHERE plantilla_id = ? AND fecha = ? LIMIT 1', [plantillaId, fecha]);
  return rows[0] || null;
}
