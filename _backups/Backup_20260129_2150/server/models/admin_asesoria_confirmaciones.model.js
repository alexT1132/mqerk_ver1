import db from '../db.js';

/**
 * Crear una solicitud de confirmación de asesoría realizada
 */
export async function createConfirmacion(data) {
  const {
    ingreso_id,
    asesor_user_id,
    asesor_nombre,
    estudiante_id = null,
    alumno_nombre = null,
    curso,
    fecha,
    hora = null,
    observaciones = null,
  } = data;

  const sql = `
    INSERT INTO admin_asesoria_confirmaciones 
    (ingreso_id, asesor_user_id, asesor_nombre, estudiante_id, alumno_nombre, curso, fecha, hora, observaciones)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const [result] = await db.query(sql, [
    ingreso_id,
    asesor_user_id,
    asesor_nombre,
    estudiante_id,
    alumno_nombre,
    curso,
    fecha,
    hora,
    observaciones,
  ]);
  
  return result.insertId;
}

/**
 * Obtener todas las confirmaciones pendientes
 */
export async function getConfirmacionesPendientes() {
  const sql = `
    SELECT * FROM admin_asesoria_confirmaciones
    WHERE estado = 'pendiente'
    ORDER BY created_at DESC
  `;
  
  const [rows] = await db.query(sql);
  return rows;
}

/**
 * Obtener una confirmación por ID
 */
export async function getConfirmacionById(id) {
  const sql = `
    SELECT * FROM admin_asesoria_confirmaciones
    WHERE id = ?
  `;
  
  const [rows] = await db.query(sql, [id]);
  return rows[0] || null;
}

/**
 * Actualizar el estado de una confirmación
 */
export async function updateConfirmacionEstado(id, estado, observaciones = null) {
  const sql = `
    UPDATE admin_asesoria_confirmaciones
    SET estado = ?, observaciones = COALESCE(?, observaciones), updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  
  await db.query(sql, [estado, observaciones, id]);
  return getConfirmacionById(id);
}

/**
 * Contar confirmaciones pendientes
 */
export async function countPendientes() {
  const sql = `
    SELECT COUNT(*) as count
    FROM admin_asesoria_confirmaciones
    WHERE estado = 'pendiente'
  `;
  
  const [rows] = await db.query(sql);
  return rows[0]?.count || 0;
}

