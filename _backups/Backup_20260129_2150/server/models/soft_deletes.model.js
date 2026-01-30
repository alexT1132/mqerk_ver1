import db from '../db.js';

// Ensure table exists
async function ensureTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS soft_deletes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      id_usuario INT NULL,
      id_estudiante INT NULL,
      reason VARCHAR(255) NULL,
      deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_usuario (id_usuario),
      INDEX idx_estudiante (id_estudiante)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;
  await db.query(sql);
}

// Run ensure on import
ensureTable().catch(() => {});

export const markSoftDelete = async ({ id_usuario = null, id_estudiante = null, reason = null }) => {
  const [result] = await db.query(
    'INSERT INTO soft_deletes (id_usuario, id_estudiante, reason) VALUES (?, ?, ?)',
    [id_usuario, id_estudiante, reason]
  );
  return result;
};

export const getByUsuarioId = async (id_usuario) => {
  const [rows] = await db.query('SELECT * FROM soft_deletes WHERE id_usuario = ? LIMIT 1', [id_usuario]);
  return rows[0] || null;
};

export const getByEstudianteId = async (id_estudiante) => {
  const [rows] = await db.query('SELECT * FROM soft_deletes WHERE id_estudiante = ? LIMIT 1', [id_estudiante]);
  return rows[0] || null;
};

export const createForUsuario = async (id_usuario, reason = null) => {
  return markSoftDelete({ id_usuario, reason });
};
