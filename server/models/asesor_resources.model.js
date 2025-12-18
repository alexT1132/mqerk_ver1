import db from '../db.js';

/**
 * Modelo para recursos educativos de asesores
 * Permite a los asesores subir, organizar y gestionar sus materiales educativos
 */
export async function listByAsesor(asesorUserId) {
  const [rows] = await db.query(
    `SELECT id, asesor_user_id, title, description, resource_type, file_path, file_name, file_size, file_type, link_url, tags, created_at, updated_at 
     FROM asesor_resources 
     WHERE asesor_user_id = ? 
     ORDER BY created_at DESC`,
    [asesorUserId]
  );
  return rows;
}

export async function getById(resourceId, asesorUserId) {
  const [rows] = await db.query(
    `SELECT id, asesor_user_id, title, description, resource_type, file_path, file_name, file_size, file_type, link_url, tags, created_at, updated_at 
     FROM asesor_resources 
     WHERE id = ? AND asesor_user_id = ?`,
    [resourceId, asesorUserId]
  );
  return rows[0] || null;
}

export async function create(asesorUserId, { title, description, resource_type, file_path, file_name, file_size, file_type, link_url, tags }) {
  const tagsJson = tags && Array.isArray(tags) ? JSON.stringify(tags) : (tags || null);
  const [res] = await db.query(
    `INSERT INTO asesor_resources (asesor_user_id, title, description, resource_type, file_path, file_name, file_size, file_type, link_url, tags) 
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [asesorUserId, title, description || null, resource_type || 'file', file_path || null, file_name || null, file_size || null, file_type || null, link_url || null, tagsJson]
  );
  return { 
    id: res.insertId, 
    asesor_user_id: asesorUserId, 
    title, 
    description, 
    resource_type: resource_type || 'file',
    file_path, 
    file_name, 
    file_size, 
    file_type, 
    link_url,
    tags 
  };
}

export async function update(resourceId, asesorUserId, payload) {
  const fields = [];
  const params = [];
  if (payload.title !== undefined) { fields.push('title = ?'); params.push(payload.title); }
  if (payload.description !== undefined) { fields.push('description = ?'); params.push(payload.description || null); }
  if (payload.tags !== undefined) { 
    fields.push('tags = ?'); 
    params.push(payload.tags && Array.isArray(payload.tags) ? JSON.stringify(payload.tags) : (payload.tags || null)); 
  }
  if (fields.length === 0) return null;
  params.push(resourceId, asesorUserId);
  const [res] = await db.query(
    `UPDATE asesor_resources SET ${fields.join(', ')} WHERE id = ? AND asesor_user_id = ?`,
    params
  );
  return res.affectedRows > 0;
}

export async function remove(resourceId, asesorUserId) {
  const [res] = await db.query(
    'DELETE FROM asesor_resources WHERE id = ? AND asesor_user_id = ?',
    [resourceId, asesorUserId]
  );
  return res.affectedRows > 0;
}

/**
 * Inicializar tabla si no existe
 */
export async function ensureTable() {
  const sql = `CREATE TABLE IF NOT EXISTS asesor_resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asesor_user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    resource_type ENUM('file', 'link') NOT NULL DEFAULT 'file',
    file_path VARCHAR(500) NULL,
    file_name VARCHAR(255) NULL,
    file_size BIGINT NULL,
    file_type VARCHAR(100) NULL,
    link_url VARCHAR(1000) NULL,
    tags JSON NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_asesor_created (asesor_user_id, created_at),
    INDEX idx_asesor_type (asesor_user_id, file_type),
    INDEX idx_asesor_resource_type (asesor_user_id, resource_type),
    FULLTEXT INDEX idx_search (title, description),
    FOREIGN KEY (asesor_user_id) REFERENCES usuarios(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;
  
  await db.query(sql);
}

