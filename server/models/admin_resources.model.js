import db from '../db.js';

/**
 * Modelo para recursos educativos subidos por administrador
 * Estos recursos son visibles para todos los asesores
 */
export async function listAll() {
  const [rows] = await db.query(
    `SELECT ar.id, ar.admin_user_id, ar.title, ar.description, ar.file_path, ar.file_name, ar.file_size, ar.file_type, ar.tags, ar.created_at, ar.updated_at,
            u.usuario AS admin_usuario
     FROM admin_resources ar
     INNER JOIN usuarios u ON u.id = ar.admin_user_id
     ORDER BY ar.created_at DESC`
  );
  return rows;
}

export async function listByAdmin(adminUserId) {
  const [rows] = await db.query(
    `SELECT id, admin_user_id, title, description, file_path, file_name, file_size, file_type, tags, created_at, updated_at 
     FROM admin_resources 
     WHERE admin_user_id = ? 
     ORDER BY created_at DESC`,
    [adminUserId]
  );
  return rows;
}

export async function getById(resourceId) {
  const [rows] = await db.query(
    `SELECT ar.id, ar.admin_user_id, ar.title, ar.description, ar.file_path, ar.file_name, ar.file_size, ar.file_type, ar.tags, ar.created_at, ar.updated_at,
            u.usuario AS admin_usuario
     FROM admin_resources ar
     INNER JOIN usuarios u ON u.id = ar.admin_user_id
     WHERE ar.id = ?`,
    [resourceId]
  );
  return rows[0] || null;
}

export async function create(adminUserId, { title, description, file_path, file_name, file_size, file_type, tags }) {
  const tagsJson = tags && Array.isArray(tags) ? JSON.stringify(tags) : (tags || null);
  const [res] = await db.query(
    `INSERT INTO admin_resources (admin_user_id, title, description, file_path, file_name, file_size, file_type, tags) 
     VALUES (?,?,?,?,?,?,?,?)`,
    [adminUserId, title, description || null, file_path, file_name, file_size, file_type, tagsJson]
  );
  return { 
    id: res.insertId, 
    admin_user_id: adminUserId, 
    title, 
    description, 
    file_path, 
    file_name, 
    file_size, 
    file_type, 
    tags 
  };
}

export async function update(resourceId, adminUserId, payload) {
  const fields = [];
  const params = [];
  if (payload.title !== undefined) { fields.push('title = ?'); params.push(payload.title); }
  if (payload.description !== undefined) { fields.push('description = ?'); params.push(payload.description || null); }
  if (payload.tags !== undefined) { 
    fields.push('tags = ?'); 
    params.push(payload.tags && Array.isArray(payload.tags) ? JSON.stringify(payload.tags) : (payload.tags || null)); 
  }
  if (fields.length === 0) return null;
  params.push(resourceId, adminUserId);
  const [res] = await db.query(
    `UPDATE admin_resources SET ${fields.join(', ')} WHERE id = ? AND admin_user_id = ?`,
    params
  );
  return res.affectedRows > 0;
}

export async function remove(resourceId, adminUserId) {
  const [res] = await db.query(
    'DELETE FROM admin_resources WHERE id = ? AND admin_user_id = ?',
    [resourceId, adminUserId]
  );
  return res.affectedRows > 0;
}

/**
 * Inicializar tabla si no existe
 */
export async function ensureTable() {
  const sql = `CREATE TABLE IF NOT EXISTS admin_resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    tags JSON NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_admin_created (admin_user_id, created_at),
    INDEX idx_admin_type (admin_user_id, file_type),
    FULLTEXT INDEX idx_search (title, description),
    FOREIGN KEY (admin_user_id) REFERENCES usuarios(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;
  
  await db.query(sql);
}

