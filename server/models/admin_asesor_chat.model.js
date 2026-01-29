import db from '../db.js';

/**
 * Mensajes 1:1 por asesor (admin(s) <-> un asesor).
 * Se indexa por asesor_user_id para consultar el hilo.
 */
export const ensureAdminAsesorChatTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS admin_asesor_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      asesor_user_id INT NOT NULL,
      sender_user_id INT NOT NULL,
      sender_role ENUM('admin','asesor') NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_asesor (asesor_user_id),
      INDEX idx_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
  await db.query(query);
};

export const saveAdminAsesorMessage = async ({ asesor_user_id, sender_user_id, sender_role, message }) => {
  const clean = String(message || '').trim();
  if (!clean) throw new Error('Message is required');
  const [result] = await db.query(
    `INSERT INTO admin_asesor_messages (asesor_user_id, sender_user_id, sender_role, message) VALUES (?, ?, ?, ?)`,
    [Number(asesor_user_id), Number(sender_user_id), String(sender_role).toLowerCase(), clean]
  );
  return {
    id: result.insertId,
    asesor_user_id: Number(asesor_user_id),
    sender_user_id: Number(sender_user_id),
    sender_role: String(sender_role).toLowerCase(),
    message: clean,
    created_at: new Date()
  };
};

export const getAdminAsesorHistory = async ({ asesor_user_id, limit = 100, offset = 0 }) => {
  const safeLimit = parseInt(limit) || 100;
  const safeOffset = parseInt(offset) || 0;
  const [rows] = await db.query(
    `SELECT * FROM admin_asesor_messages
     WHERE asesor_user_id = ?
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [Number(asesor_user_id), safeLimit, safeOffset]
  );
  return rows.reverse();
};

