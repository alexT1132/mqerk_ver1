import db from '../db.js';

/**
 * Asegurar que la tabla tenga el campo asesor_user_id
 */
export async function ensureTable() {
  try {
    // Verificar si existe la columna asesor_user_id
    const [cols] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'student_reminders' 
        AND COLUMN_NAME = 'asesor_user_id'
    `);

    // Asegurar columnas una por una para tablas existentes
    try {
      await db.query(`ALTER TABLE student_reminders ADD COLUMN asesor_user_id INT NULL`);
      await db.query(`ALTER TABLE student_reminders ADD INDEX idx_asesor_user (asesor_user_id)`);
      await db.query(`ALTER TABLE student_reminders ADD FOREIGN KEY (asesor_user_id) REFERENCES usuarios(id) ON DELETE SET NULL`);
    } catch (e) { /* Ya existe asesor_user_id o error de FK */ }

    try {
      await db.query(`ALTER TABLE student_reminders ADD COLUMN category VARCHAR(50) NOT NULL DEFAULT 'recordatorio'`);
    } catch (e) { /* Ya existe category */ }
  } catch (err) {
    // Si la tabla no existe, crearla
    if (err.code === 'ER_NO_SUCH_TABLE') {
      const sql = `CREATE TABLE IF NOT EXISTS student_reminders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NULL,
        date DATE NOT NULL,
        priority VARCHAR(50) NOT NULL DEFAULT 'blue',
        category VARCHAR(50) NOT NULL DEFAULT 'recordatorio',
        asesor_user_id INT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_student_date (student_id, date),
        INDEX idx_asesor_user (asesor_user_id),
        FOREIGN KEY (student_id) REFERENCES estudiantes(id) ON DELETE CASCADE,
        FOREIGN KEY (asesor_user_id) REFERENCES usuarios(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;
      await db.query(sql);
      console.log('Tabla student_reminders creada con campo asesor_user_id');
    } else {
      console.error('Error asegurando tabla student_reminders:', err);
    }
  }
}

export async function listByStudent(studentId) {
  const [rows] = await db.query(
    'SELECT id, student_id, title, description, DATE_FORMAT(date, "%Y-%m-%d") as date, priority, category, asesor_user_id, created_at, updated_at FROM student_reminders WHERE student_id = ? ORDER BY date ASC, id ASC',
    [studentId]
  );
  return rows;
}

export async function create(studentId, { title, description, date, priority, category = 'recordatorio', asesor_user_id = null }) {
  const [res] = await db.query(
    'INSERT INTO student_reminders (student_id, title, description, date, priority, category, asesor_user_id) VALUES (?,?,?,?,?,?,?)',
    [studentId, title, description || null, date, priority, category, asesor_user_id]
  );
  return { id: res.insertId, student_id: studentId, title, description, date, priority, category, asesor_user_id };
}

/**
 * Crear recordatorios para múltiples estudiantes (masivamente)
 */
export async function createForStudents(studentIds, { title, description, date, priority, category, asesor_user_id }) {
  if (!Array.isArray(studentIds) || studentIds.length === 0) {
    return [];
  }

  const values = studentIds.map(studentId => [
    studentId,
    title,
    description || null,
    date,
    priority || 'blue',
    category || 'recordatorio',
    asesor_user_id
  ]);

  const placeholders = values.map(() => '(?,?,?,?,?,?,?)').join(',');
  const params = values.flat();

  const [res] = await db.query(
    `INSERT INTO student_reminders (student_id, title, description, date, priority, category, asesor_user_id) VALUES ${placeholders}`,
    params
  );

  return { inserted: res.affectedRows, firstId: res.insertId };
}

/**
 * Listar recordatorios creados por un asesor
 */
export async function listByAsesor(asesorUserId) {
  const [rows] = await db.query(
    `SELECT id, student_id, title, description, DATE_FORMAT(date, "%Y-%m-%d") as date, priority, category, asesor_user_id, created_at, updated_at 
     FROM student_reminders 
     WHERE asesor_user_id = ? 
     ORDER BY date ASC, id ASC`,
    [asesorUserId]
  );
  return rows;
}

export async function update(reminderId, studentId, payload) {
  const fields = [];
  const params = [];
  if (payload.title !== undefined) { fields.push('title = ?'); params.push(payload.title); }
  if (payload.description !== undefined) { fields.push('description = ?'); params.push(payload.description); }
  if (payload.date !== undefined) { fields.push('date = ?'); params.push(payload.date); }
  if (payload.priority !== undefined) { fields.push('priority = ?'); params.push(payload.priority); }
  if (fields.length === 0) return null;
  params.push(reminderId, studentId);
  const [res] = await db.query(`UPDATE student_reminders SET ${fields.join(', ')} WHERE id = ? AND student_id = ?`, params);
  return res.affectedRows > 0;
}

export async function remove(reminderId, studentId) {
  const [res] = await db.query('DELETE FROM student_reminders WHERE id = ? AND student_id = ?', [reminderId, studentId]);
  return res.affectedRows > 0;
}

/**
 * Eliminar una difusión masiva por parte del asesor
 */
export async function removeBroadcast(asesorUserId, title, date, description) {
  const [res] = await db.query(
    `DELETE FROM student_reminders 
     WHERE asesor_user_id = ? 
       AND title = ? 
       AND date = ? 
       AND (description = ? OR (description IS NULL AND ? IS NULL))`,
    [asesorUserId, title, date, description, description]
  );
  return res.affectedRows > 0;
}
