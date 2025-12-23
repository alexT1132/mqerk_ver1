import db from '../db.js';

export const ensureChatTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      sender_role ENUM('estudiante', 'admin', 'asesor', 'sistema') NOT NULL,
      message TEXT,
      type ENUM('text', 'image', 'file') DEFAULT 'text',
      category ENUM('general', 'support', 'academic') DEFAULT 'general',
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_student (student_id),
      INDEX idx_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
    await db.query(query);

    // Agregar columna category si no existe (migración)
    try {
        await db.query(`ALTER TABLE chat_messages ADD COLUMN category ENUM('general', 'support', 'academic') DEFAULT 'general' AFTER type`);
    } catch (e) {
        // Ignorar si ya existe
    }

    console.log('[DB] Tabla chat_messages asegurada.');
};

export const saveMessage = async ({ student_id, sender_role, message, type = 'text', category = 'general' }) => {
    const [result] = await db.query(
        `INSERT INTO chat_messages (student_id, sender_role, message, type, category) VALUES (?, ?, ?, ?, ?)`,
        [student_id, sender_role, message, type, category]
    );
    return { id: result.insertId, student_id, sender_role, message, type, category, created_at: new Date() };
};

export const getHistory = async (student_id, limit = 50) => {
    const [rows] = await db.query(
        `SELECT * FROM chat_messages WHERE student_id = ? ORDER BY created_at DESC LIMIT ?`,
        [student_id, limit]
    );
    return rows.reverse();
};

export const markAsRead = async (student_id, role_reader) => {
    // Si el lector es estudiante, marca como leídos los mensajes de admin/asesor/sistema
    // Si el lector es admin/asesor, marca como leídos los mensajes de estudiante
    const targetRole = role_reader === 'estudiante' ? ['admin', 'asesor', 'sistema'] : ['estudiante'];

    const rolesPlaceholder = targetRole.map(() => '?').join(',');

    await db.query(
        `UPDATE chat_messages SET is_read = TRUE 
     WHERE student_id = ? AND sender_role IN (${rolesPlaceholder}) AND is_read = FALSE`,
        [student_id, ...targetRole]
    );
};
