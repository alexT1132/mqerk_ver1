import db from '../db.js';

/**
 * Obtener el asesor_user_id desde el id_estudiante
 * Busca el asesor que tiene asignado el grupo del estudiante
 */
export const getAsesorUserIdByEstudianteId = async (id_estudiante) => {
  // Obtener grupo del estudiante
  const [estRows] = await db.query(
    'SELECT grupo FROM estudiantes WHERE id = ? LIMIT 1',
    [id_estudiante]
  );
  if (!estRows.length || !estRows[0].grupo) return null;
  
  const grupo = estRows[0].grupo;
  
  // Buscar perfil de asesor con ese grupo (puede estar en grupo_asesor o grupos_asesor)
  const [perfilRows] = await db.query(
    `SELECT usuario_id FROM asesor_perfiles 
     WHERE (grupo_asesor = ? OR JSON_CONTAINS(JSON_EXTRACT(grupos_asesor, '$'), JSON_QUOTE(?))) 
     AND usuario_id IS NOT NULL 
     LIMIT 1`,
    [grupo, grupo]
  );
  
  return perfilRows.length ? perfilRows[0].usuario_id : null;
};

/**
 * Crear una notificación para un asesor
 * @param {Object} n - Objeto con propiedades: asesor_user_id, type, title, message, action_url, metadata
 */
export const createNotification = async (n) => {
  const [res] = await db.query(
    `INSERT INTO asesor_notifications (asesor_user_id, type, title, message, action_url, metadata) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      n.asesor_user_id, 
      n.type || 'other', 
      n.title, 
      n.message, 
      n.action_url || null, 
      n.metadata ? JSON.stringify(n.metadata) : null
    ]
  );
  return res.insertId;
};

/**
 * Crear múltiples notificaciones de una vez
 */
export const bulkCreateNotifications = async (list = []) => {
  if (!list.length) return { affectedRows: 0, firstInsertId: null };
  const placeholders = list.map(() => '(?,?,?,?,?,?)').join(',');
  const values = [];
  for (const n of list) {
    values.push(
      n.asesor_user_id,
      n.type || 'other',
      n.title,
      n.message,
      n.action_url || null,
      n.metadata ? JSON.stringify(n.metadata) : null
    );
  }
  const [res] = await db.query(
    `INSERT INTO asesor_notifications (asesor_user_id, type, title, message, action_url, metadata) 
     VALUES ${placeholders}`,
    values
  );
  return { affectedRows: res.affectedRows, firstInsertId: res.insertId };
};

/**
 * Listar notificaciones de un asesor
 */
export const listNotifications = async (asesor_user_id, { limit = 50, offset = 0 } = {}) => {
  const [rows] = await db.query(
    `SELECT id, asesor_user_id, type, title, message, action_url, metadata, is_read, created_at
     FROM asesor_notifications
     WHERE asesor_user_id = ?
     ORDER BY id DESC
     LIMIT ? OFFSET ?`,
    [asesor_user_id, Number(limit), Number(offset)]
  );
  // Parsear metadata JSON
  for (const r of rows) {
    if (r.metadata && typeof r.metadata === 'string') {
      try { r.metadata = JSON.parse(r.metadata); } catch { r.metadata = null; }
    }
  }
  return rows;
};

/**
 * Contar notificaciones no leídas de un asesor
 */
export const countUnread = async (asesor_user_id) => {
  const [rows] = await db.query(
    `SELECT COUNT(*) as count FROM asesor_notifications WHERE asesor_user_id = ? AND is_read = 0`,
    [asesor_user_id]
  );
  return rows[0]?.count || 0;
};

/**
 * Marcar notificación como leída/no leída
 */
export const markRead = async (id, asesor_user_id, read = true) => {
  const [res] = await db.query(
    `UPDATE asesor_notifications SET is_read = ? WHERE id = ? AND asesor_user_id = ?`,
    [read ? 1 : 0, id, asesor_user_id]
  );
  return res.affectedRows > 0;
};

/**
 * Marcar todas las notificaciones como leídas
 */
export const markAllRead = async (asesor_user_id) => {
  const [res] = await db.query(
    `UPDATE asesor_notifications SET is_read = 1 WHERE asesor_user_id = ? AND is_read = 0`,
    [asesor_user_id]
  );
  return res.affectedRows;
};

/**
 * Eliminar una notificación
 */
export const deleteNotification = async (id, asesor_user_id) => {
  const [res] = await db.query(
    `DELETE FROM asesor_notifications WHERE id = ? AND asesor_user_id = ?`,
    [id, asesor_user_id]
  );
  return res.affectedRows > 0;
};

/**
 * Eliminar todas las notificaciones leídas
 */
export const deleteRead = async (asesor_user_id) => {
  const [res] = await db.query(
    `DELETE FROM asesor_notifications WHERE asesor_user_id = ? AND is_read = 1`,
    [asesor_user_id]
  );
  return res.affectedRows;
};

