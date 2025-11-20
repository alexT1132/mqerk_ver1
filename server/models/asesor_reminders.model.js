import db from '../db.js';

/**
 * Modelo para recordatorios personales de asesores
 * Solo visibles para el asesor que los creó
 */
export async function listByAsesor(asesorUserId) {
  const [rows] = await db.query(
    `SELECT id, asesor_user_id, title, description, DATE_FORMAT(date, "%Y-%m-%d") as date, time, category, priority, created_at, updated_at 
     FROM asesor_reminders 
     WHERE asesor_user_id = ? 
     ORDER BY date ASC, time ASC, id ASC`,
    [asesorUserId]
  );
  return rows;
}

export async function create(asesorUserId, { title, description, date, time, category, priority }) {
  const [res] = await db.query(
    `INSERT INTO asesor_reminders (asesor_user_id, title, description, date, time, category, priority) 
     VALUES (?,?,?,?,?,?,?)`,
    [asesorUserId, title, description || null, date, time || null, category || 'recordatorio', priority || 'blue']
  );
  return { id: res.insertId, asesor_user_id: asesorUserId, title, description, date, time, category, priority };
}

export async function update(reminderId, asesorUserId, payload) {
  const fields = [];
  const params = [];
  if (payload.title !== undefined) { fields.push('title = ?'); params.push(payload.title); }
  if (payload.description !== undefined) { fields.push('description = ?'); params.push(payload.description); }
  if (payload.date !== undefined) { fields.push('date = ?'); params.push(payload.date); }
  if (payload.time !== undefined) { fields.push('time = ?'); params.push(payload.time); }
  if (payload.category !== undefined) { fields.push('category = ?'); params.push(payload.category); }
  if (payload.priority !== undefined) { fields.push('priority = ?'); params.push(payload.priority); }
  if (fields.length === 0) return null;
  params.push(reminderId, asesorUserId);
  const [res] = await db.query(
    `UPDATE asesor_reminders SET ${fields.join(', ')} WHERE id = ? AND asesor_user_id = ?`,
    params
  );
  return res.affectedRows > 0;
}

export async function remove(reminderId, asesorUserId) {
  const [res] = await db.query(
    'DELETE FROM asesor_reminders WHERE id = ? AND asesor_user_id = ?',
    [reminderId, asesorUserId]
  );
  return res.affectedRows > 0;
}

/**
 * Inicializar tabla si no existe
 */
export async function ensureTable() {
  const sql = `CREATE TABLE IF NOT EXISTS asesor_reminders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asesor_user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    date DATE NOT NULL,
    time TIME NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'recordatorio',
    priority VARCHAR(50) NOT NULL DEFAULT 'blue',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_asesor_date (asesor_user_id, date),
    FOREIGN KEY (asesor_user_id) REFERENCES usuarios(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;
  
  await db.query(sql);
}

