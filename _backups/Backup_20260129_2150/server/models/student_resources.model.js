import db from '../db.js';

/**
 * Modelo para recursos educativos subidos por alumnos
 * Estos recursos son visibles para todos los alumnos
 */
export async function listAll() {
  const [rows] = await db.query(
    `SELECT sr.id, sr.estudiante_id, sr.title, sr.description, sr.file_path, sr.file_name, sr.file_size, sr.file_type, sr.tags, sr.created_at, sr.updated_at,
            e.nombre AS estudiante_nombre, e.apellidos AS estudiante_apellidos
     FROM student_resources sr
     INNER JOIN estudiantes e ON e.id = sr.estudiante_id
     ORDER BY sr.created_at DESC`
  );
  return rows;
}

export async function listByEstudiante(estudianteId) {
  const [rows] = await db.query(
    `SELECT id, estudiante_id, title, description, file_path, file_name, file_size, file_type, tags, created_at, updated_at 
     FROM student_resources 
     WHERE estudiante_id = ? 
     ORDER BY created_at DESC`,
    [estudianteId]
  );
  return rows;
}

export async function getById(resourceId) {
  const [rows] = await db.query(
    `SELECT sr.id, sr.estudiante_id, sr.title, sr.description, sr.file_path, sr.file_name, sr.file_size, sr.file_type, sr.tags, sr.created_at, sr.updated_at,
            e.nombre AS estudiante_nombre, e.apellidos AS estudiante_apellidos
     FROM student_resources sr
     INNER JOIN estudiantes e ON e.id = sr.estudiante_id
     WHERE sr.id = ?`,
    [resourceId]
  );
  return rows[0] || null;
}

export async function create(estudianteId, { title, description, file_path, file_name, file_size, file_type, tags }) {
  const tagsJson = tags && Array.isArray(tags) ? JSON.stringify(tags) : (tags || null);
  const [res] = await db.query(
    `INSERT INTO student_resources (estudiante_id, title, description, file_path, file_name, file_size, file_type, tags) 
     VALUES (?,?,?,?,?,?,?,?)`,
    [estudianteId, title, description || null, file_path, file_name, file_size, file_type, tagsJson]
  );
  return { 
    id: res.insertId, 
    estudiante_id: estudianteId, 
    title, 
    description, 
    file_path, 
    file_name, 
    file_size, 
    file_type, 
    tags 
  };
}

export async function update(resourceId, estudianteId, payload) {
  const fields = [];
  const params = [];
  if (payload.title !== undefined) { fields.push('title = ?'); params.push(payload.title); }
  if (payload.description !== undefined) { fields.push('description = ?'); params.push(payload.description || null); }
  if (payload.tags !== undefined) { 
    fields.push('tags = ?'); 
    params.push(payload.tags && Array.isArray(payload.tags) ? JSON.stringify(payload.tags) : (payload.tags || null)); 
  }
  if (fields.length === 0) return null;
  params.push(resourceId, estudianteId);
  const [res] = await db.query(
    `UPDATE student_resources SET ${fields.join(', ')} WHERE id = ? AND estudiante_id = ?`,
    params
  );
  return res.affectedRows > 0;
}

export async function remove(resourceId, estudianteId) {
  const [res] = await db.query(
    'DELETE FROM student_resources WHERE id = ? AND estudiante_id = ?',
    [resourceId, estudianteId]
  );
  return res.affectedRows > 0;
}

/**
 * Inicializar tabla si no existe
 */
export async function ensureTable() {
  const sql = `CREATE TABLE IF NOT EXISTS student_resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    tags JSON NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_estudiante_created (estudiante_id, created_at),
    INDEX idx_estudiante_type (estudiante_id, file_type),
    FULLTEXT INDEX idx_search (title, description),
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;
  
  await db.query(sql);
}

