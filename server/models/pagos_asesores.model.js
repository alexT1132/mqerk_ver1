import db from '../db.js';

// Campos base: id, asesor_preregistro_id (FK), asesor_nombre (cache), tipo_servicio (curso|asesoria|otro),
// id_pago_ref (opcional referencia a ingreso u otra tabla), servicio_detalle, monto_base, horas_trabajadas,
// honorarios_comision, ingreso_final, fecha_pago, metodo_pago, nota, status, created_at, updated_at

export async function list({ asesor_id, from, to, status } = {}) {
  const where = [];
  const params = [];
  if (asesor_id) { where.push('p.asesor_preregistro_id = ?'); params.push(asesor_id); }
  if (from) { where.push('p.fecha_pago >= ?'); params.push(from); }
  if (to) { where.push('p.fecha_pago <= ?'); params.push(to); }
  if (status) { where.push('p.status = ?'); params.push(status); }
  const sql = `SELECT p.* FROM pagos_asesores p ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY p.fecha_pago DESC, p.id DESC`;
  const [rows] = await db.query(sql, params);
  return rows;
}

export async function create(data) {
  const {
    asesor_preregistro_id = null,
    asesor_nombre = null,
    tipo_servicio,
    servicio_detalle = null,
    id_pago_ref = null,
    monto_base = 0,
    horas_trabajadas = null,
    honorarios_comision = 0,
    ingreso_final = 0,
    fecha_pago,
    metodo_pago = null,
    nota = null,
    status = 'Pagado'
  } = data || {};
  const sql = `INSERT INTO pagos_asesores (asesor_preregistro_id, asesor_nombre, tipo_servicio, servicio_detalle, id_pago_ref, monto_base, horas_trabajadas, honorarios_comision, ingreso_final, fecha_pago, metodo_pago, nota, status)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`;
  const params = [asesor_preregistro_id, asesor_nombre, tipo_servicio, servicio_detalle, id_pago_ref, monto_base, horas_trabajadas, honorarios_comision, ingreso_final, fecha_pago, metodo_pago, nota, status];
  const [res] = await db.query(sql, params);
  const [rows] = await db.query('SELECT * FROM pagos_asesores WHERE id=? LIMIT 1', [res.insertId]);
  return rows[0];
}

export async function update(id, updates) {
  const allowed = ['asesor_preregistro_id','asesor_nombre','tipo_servicio','servicio_detalle','id_pago_ref','monto_base','horas_trabajadas','honorarios_comision','ingreso_final','fecha_pago','metodo_pago','nota','status'];
  const fields = []; const values = [];
  for (const k of allowed) {
    if (Object.prototype.hasOwnProperty.call(updates, k)) { fields.push(`${k}=?`); values.push(updates[k]); }
  }
  if (!fields.length) return null;
  values.push(id);
  await db.query(`UPDATE pagos_asesores SET ${fields.join(', ')}, updated_at=CURRENT_TIMESTAMP WHERE id=?`, values);
  const [rows] = await db.query('SELECT * FROM pagos_asesores WHERE id=? LIMIT 1', [id]);
  return rows[0]||null;
}

export async function remove(id){
  const [res] = await db.query('DELETE FROM pagos_asesores WHERE id=?', [id]);
  return res.affectedRows > 0;
}

export async function getById(id){
  const [rows] = await db.query('SELECT * FROM pagos_asesores WHERE id=? LIMIT 1', [id]);
  return rows[0]||null;
}
