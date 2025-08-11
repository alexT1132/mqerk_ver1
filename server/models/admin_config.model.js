import db from '../db.js';

async function ensureTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS admin_config (
      id INT PRIMARY KEY DEFAULT 1,
      sesion_maxima INT DEFAULT 480,
      intentos_login INT DEFAULT 3,
      cambio_password_obligatorio INT DEFAULT 90,
      autenticacion_dos_factor TINYINT(1) DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;
  await db.query(sql);
  await db.query('INSERT IGNORE INTO admin_config (id) VALUES (1)');
}

ensureTable().catch(() => {});

export const getConfig = async () => {
  const [rows] = await db.query('SELECT * FROM admin_config WHERE id = 1 LIMIT 1');
  return rows[0] || null;
};

export const updateConfig = async ({ sesion_maxima, intentos_login, cambio_password_obligatorio, autenticacion_dos_factor }) => {
  const fields = [];
  const values = [];
  if (Number.isInteger(sesion_maxima)) { fields.push('sesion_maxima = ?'); values.push(sesion_maxima); }
  if (Number.isInteger(intentos_login)) { fields.push('intentos_login = ?'); values.push(intentos_login); }
  if (Number.isInteger(cambio_password_obligatorio)) { fields.push('cambio_password_obligatorio = ?'); values.push(cambio_password_obligatorio); }
  if (typeof autenticacion_dos_factor === 'boolean' || autenticacion_dos_factor === 0 || autenticacion_dos_factor === 1) {
    const v = (autenticacion_dos_factor === true || autenticacion_dos_factor === 1) ? 1 : 0;
    fields.push('autenticacion_dos_factor = ?'); values.push(v);
  }
  if (!fields.length) return { affectedRows: 0 };
  const sql = `UPDATE admin_config SET ${fields.join(', ')} WHERE id = 1`;
  const [result] = await db.query(sql, values);
  return result;
};
