import db from '../db.js';

export async function getIngresos({ from, to, metodo, estatus, origen } = {}) {
  const where = [];
  const params = [];
  if (from) { where.push('i.fecha >= ?'); params.push(from); }
  if (to) { where.push('i.fecha <= ?'); params.push(to); }
  if (metodo) { where.push('i.metodo = ?'); params.push(metodo); }
  if (estatus) { where.push('i.estatus = ?'); params.push(estatus); }
  if (origen === 'manual') { where.push('i.comprobante_id IS NULL'); }
  if (origen === 'externo') { where.push('i.comprobante_id IS NOT NULL'); }
  const sql = `
    SELECT i.*, e.nombre AS estudiante_nombre, e.apellidos AS estudiante_apellidos
    FROM ingresos i
    LEFT JOIN estudiantes e ON e.id = i.estudiante_id
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY i.fecha DESC, i.id DESC`;
  const [rows] = await db.query(sql, params);
  return rows;
}

export async function createIngreso(data) {
  const {
    estudiante_id = null,
    alumno_nombre = null,
    asesor_preregistro_id = null,
    asesor_nombre = null,
    curso,
    fecha,
    hora = null,
    metodo,
    importe,
    estatus = 'Pagado',
    comprobante_id = null,
    notas = null,
    descripcion = null,
    calendar_event_id = null,
  } = data || {};
  const sql = `INSERT INTO ingresos (estudiante_id, alumno_nombre, asesor_preregistro_id, asesor_nombre, curso, fecha, hora, metodo, importe, estatus, comprobante_id, notas, descripcion, calendar_event_id)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
  const params = [estudiante_id, alumno_nombre, asesor_preregistro_id, asesor_nombre, curso, fecha, hora, metodo, importe, estatus, comprobante_id, notas, descripcion, calendar_event_id];
  const [res] = await db.query(sql, params);
  const [rows] = await db.query('SELECT * FROM ingresos WHERE id=? LIMIT 1', [res.insertId]);
  return rows[0];
}

export async function getAggregates({ by = 'month', from, to } = {}) {
  // by: 'day' | 'month' | 'year'
  const groupExpr = by === 'day' ? 'DATE(fecha)' : by === 'year' ? 'DATE_FORMAT(fecha, "%Y")' : 'DATE_FORMAT(fecha, "%Y-%m")';
  const where = [];
  const params = [];
  if (from) { where.push('fecha >= ?'); params.push(from); }
  if (to) { where.push('fecha <= ?'); params.push(to); }
  const sql = `SELECT ${groupExpr} AS label, SUM(importe) AS total
               FROM ingresos
               ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
               GROUP BY label
               ORDER BY label`;
  const [rows] = await db.query(sql, params);
  return rows.map(r => ({ label: r.label, total: Number(r.total || 0) }));
}

export async function updateIngreso(id, updates) {
  const allowed = ['alumno_nombre','asesor_preregistro_id','asesor_nombre','curso','fecha','hora','metodo','importe','estatus','notas','descripcion','calendar_event_id'];
  const fields = [];
  const values = [];
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(updates, key)) {
      fields.push(`${key} = ?`);
      values.push(updates[key]);
    }
  }
  if (!fields.length) return null;
  values.push(id);
  await db.query(`UPDATE ingresos SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);
  const [rows] = await db.query('SELECT * FROM ingresos WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}
// borrar un dato 
export async function getIngresoById(id) {
  const [rows] = await db.query('SELECT * FROM ingresos WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

export async function deleteIngreso(id) {
  const [res] = await db.query('DELETE FROM ingresos WHERE id = ?', [id]);
  return res.affectedRows > 0;
}

// Verifica si existe un ingreso vinculado a un calendar_event_id dado
export async function getIngresoByCalendarEventId(eventId) {
  const [rows] = await db.query('SELECT * FROM ingresos WHERE calendar_event_id = ? LIMIT 1', [eventId]);
  return rows[0] || null;
}

// Obtener ingresos (asesorías) asignadas a un asesor específico
export async function getIngresosByAsesor(asesorPreregistroId, { from, to } = {}) {
  const where = ['i.asesor_preregistro_id = ?'];
  const params = [asesorPreregistroId];
  
  if (from) { where.push('i.fecha >= ?'); params.push(from); }
  if (to) { where.push('i.fecha <= ?'); params.push(to); }
  
  const sql = `
    SELECT i.*, e.nombre AS estudiante_nombre, e.apellidos AS estudiante_apellidos
    FROM ingresos i
    LEFT JOIN estudiantes e ON e.id = i.estudiante_id
    WHERE ${where.join(' AND ')}
    ORDER BY i.fecha ASC, i.hora ASC`;
  const [rows] = await db.query(sql, params);
  return rows;
}
