import db from '../db.js';

async function ensureTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS admin_config (
      id INT PRIMARY KEY DEFAULT 1,
      sesion_maxima INT DEFAULT 480,
      intentos_login INT DEFAULT 3,
      cambio_password_obligatorio INT DEFAULT 90,
      autenticacion_dos_factor TINYINT(1) DEFAULT 0,
      -- Campos de configuración general
      nombre_institucion VARCHAR(255) NULL,
      email_administrativo VARCHAR(255) NULL,
      telefono_contacto VARCHAR(50) NULL,
      direccion TEXT NULL,
      sitio_web VARCHAR(255) NULL,
      horario_atencion VARCHAR(100) NULL,
  -- Integración Gmail
  gmail_email VARCHAR(255) NULL,
  gmail_refresh_token TEXT NULL,
  gmail_access_token TEXT NULL,
  gmail_expiry BIGINT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;
  await db.query(sql);
  await db.query('INSERT IGNORE INTO admin_config (id) VALUES (1)');

  // Asegurar columnas (si venimos de una versión anterior)
  // MySQL 8+: ADD COLUMN IF NOT EXISTS
  try {
    await db.query(`ALTER TABLE admin_config ADD COLUMN IF NOT EXISTS nombre_institucion VARCHAR(255) NULL`);
    await db.query(`ALTER TABLE admin_config ADD COLUMN IF NOT EXISTS email_administrativo VARCHAR(255) NULL`);
    await db.query(`ALTER TABLE admin_config ADD COLUMN IF NOT EXISTS telefono_contacto VARCHAR(50) NULL`);
    await db.query(`ALTER TABLE admin_config ADD COLUMN IF NOT EXISTS direccion TEXT NULL`);
    await db.query(`ALTER TABLE admin_config ADD COLUMN IF NOT EXISTS sitio_web VARCHAR(255) NULL`);
    await db.query(`ALTER TABLE admin_config ADD COLUMN IF NOT EXISTS horario_atencion VARCHAR(100) NULL`);
  await db.query(`ALTER TABLE admin_config ADD COLUMN IF NOT EXISTS gmail_email VARCHAR(255) NULL`);
  await db.query(`ALTER TABLE admin_config ADD COLUMN IF NOT EXISTS gmail_refresh_token TEXT NULL`);
  await db.query(`ALTER TABLE admin_config ADD COLUMN IF NOT EXISTS gmail_access_token TEXT NULL`);
  await db.query(`ALTER TABLE admin_config ADD COLUMN IF NOT EXISTS gmail_expiry BIGINT NULL`);
  } catch {}
}

ensureTable().catch(() => {});

export const getConfig = async () => {
  const [rows] = await db.query('SELECT * FROM admin_config WHERE id = 1 LIMIT 1');
  return rows[0] || null;
};

export const updateConfig = async ({ sesion_maxima, intentos_login, cambio_password_obligatorio, autenticacion_dos_factor, nombre_institucion, email_administrativo, telefono_contacto, direccion, sitio_web, horario_atencion }) => {
  const fields = [];
  const values = [];
  if (Number.isInteger(sesion_maxima)) { fields.push('sesion_maxima = ?'); values.push(sesion_maxima); }
  if (Number.isInteger(intentos_login)) { fields.push('intentos_login = ?'); values.push(intentos_login); }
  if (Number.isInteger(cambio_password_obligatorio)) { fields.push('cambio_password_obligatorio = ?'); values.push(cambio_password_obligatorio); }
  if (typeof autenticacion_dos_factor === 'boolean' || autenticacion_dos_factor === 0 || autenticacion_dos_factor === 1) {
    const v = (autenticacion_dos_factor === true || autenticacion_dos_factor === 1) ? 1 : 0;
    fields.push('autenticacion_dos_factor = ?'); values.push(v);
  }
  if (typeof nombre_institucion === 'string') { fields.push('nombre_institucion = ?'); values.push(nombre_institucion.trim()); }
  if (typeof email_administrativo === 'string') { fields.push('email_administrativo = ?'); values.push(email_administrativo.trim()); }
  if (typeof telefono_contacto === 'string') { fields.push('telefono_contacto = ?'); values.push(telefono_contacto.trim()); }
  if (typeof direccion === 'string') { fields.push('direccion = ?'); values.push(direccion.trim()); }
  if (typeof sitio_web === 'string') { fields.push('sitio_web = ?'); values.push(sitio_web.trim()); }
  if (typeof horario_atencion === 'string') { fields.push('horario_atencion = ?'); values.push(horario_atencion.trim()); }
  if (!fields.length) return { affectedRows: 0 };
  const sql = `UPDATE admin_config SET ${fields.join(', ')} WHERE id = 1`;
  const [result] = await db.query(sql, values);
  return result;
};

export const getGmailTokens = async () => {
  const [rows] = await db.query('SELECT gmail_email, gmail_refresh_token, gmail_access_token, gmail_expiry FROM admin_config WHERE id = 1 LIMIT 1');
  const r = rows[0] || null;
  if (!r) return null;
  return {
    email: r.gmail_email || null,
    refresh_token: r.gmail_refresh_token || null,
    access_token: r.gmail_access_token || null,
    expiry_date: r.gmail_expiry || null,
  };
};

export const saveGmailTokens = async ({ email, refresh_token, access_token, expiry_date }) => {
  const fields = [];
  const values = [];
  if (typeof email === 'string') { fields.push('gmail_email = ?'); values.push(email); }
  if (typeof refresh_token === 'string') { fields.push('gmail_refresh_token = ?'); values.push(refresh_token); }
  if (typeof access_token === 'string') { fields.push('gmail_access_token = ?'); values.push(access_token); }
  if (typeof expiry_date === 'number') { fields.push('gmail_expiry = ?'); values.push(expiry_date); }
  if (!fields.length) return { affectedRows: 0 };
  const sql = `UPDATE admin_config SET ${fields.join(', ')} WHERE id = 1`;
  const [res] = await db.query(sql, values);
  return res;
};

export const clearGmailTokens = async () => {
  const sql = `UPDATE admin_config SET gmail_email = NULL, gmail_refresh_token = NULL, gmail_access_token = NULL, gmail_expiry = NULL WHERE id = 1`;
  const [res] = await db.query(sql);
  return res;
};
