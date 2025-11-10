import db from '../db.js';

async function ensureTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS admin_emails (
      id INT AUTO_INCREMENT PRIMARY KEY,
      sender VARCHAR(255) NULL,
      recipient VARCHAR(255) NOT NULL,
      subject VARCHAR(255) NOT NULL,
      body TEXT NOT NULL,
      folder VARCHAR(20) NOT NULL DEFAULT 'sent',
      etiqueta VARCHAR(50) NULL,
      is_read TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP NULL DEFAULT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;
  await db.query(sql);
}

ensureTable().catch(() => {});

export const getByFolder = async (folder = 'inbox') => {
  const [rows] = await db.query(
    `SELECT id, sender AS de, recipient AS para, subject AS asunto, body AS mensaje,
            folder AS tipo, etiqueta, is_read AS leido, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') AS fecha
     FROM admin_emails
     WHERE deleted_at IS NULL AND folder = ?
     ORDER BY created_at DESC`, [folder]
  );
  return rows;
};

export const createEmail = async ({ sender, recipient, subject, body, etiqueta }) => {
  const [result] = await db.query(
    `INSERT INTO admin_emails (sender, recipient, subject, body, folder, etiqueta, is_read)
     VALUES (?, ?, ?, ?, 'sent', ?, 1)`,
    [sender || null, recipient, subject, body, etiqueta || null]
  );
  const [rows] = await db.query(
    `SELECT id, sender AS de, recipient AS para, subject AS asunto, body AS mensaje,
            folder AS tipo, etiqueta, is_read AS leido, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') AS fecha
     FROM admin_emails WHERE id = ?`,
    [result.insertId]
  );
  return rows[0] || null;
};

export const setRead = async (id, read = true) => {
  const v = read ? 1 : 0;
  const [res] = await db.query(`UPDATE admin_emails SET is_read = ? WHERE id = ? AND deleted_at IS NULL`, [v, id]);
  return res.affectedRows > 0;
};

export const removeEmail = async (id) => {
  const [res] = await db.query(`UPDATE admin_emails SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL`, [id]);
  return res.affectedRows > 0;
};
