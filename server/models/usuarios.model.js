import db from "../db.js";

// Ensure security-related columns exist on startup (idempotent on MySQL 8+)
async function ensureSecurityColumns() {
  try {
    await db.query(`
      ALTER TABLE usuarios
        ADD COLUMN IF NOT EXISTS must_change TINYINT(1) NOT NULL DEFAULT 1 AFTER contraseña,
        ADD COLUMN IF NOT EXISTS last_login_at DATETIME NULL AFTER must_change,
        ADD COLUMN IF NOT EXISTS password_changed_at DATETIME NULL AFTER last_login_at,
        ADD COLUMN IF NOT EXISTS failed_attempts INT NOT NULL DEFAULT 0 AFTER password_changed_at,
        ADD COLUMN IF NOT EXISTS locked_until DATETIME NULL AFTER failed_attempts
    `);
  } catch (e) {
    // Best-effort; if IF NOT EXISTS is unsupported, ignore at runtime
    try {
      // Fallback: attempt adding columns individually
      await db.query(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS must_change TINYINT(1) NOT NULL DEFAULT 1 AFTER contraseña`);
      await db.query(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS last_login_at DATETIME NULL AFTER must_change`);
      await db.query(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS password_changed_at DATETIME NULL AFTER last_login_at`);
      await db.query(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS failed_attempts INT NOT NULL DEFAULT 0 AFTER password_changed_at`);
      await db.query(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS locked_until DATETIME NULL AFTER failed_attempts`);
    } catch (_e) { /* noop */ }
  }
}

ensureSecurityColumns().catch(() => {});

// Obtener todos los usuarios
export const ObtenerUsuarios = (callback) => {
  const sql = 'SELECT * FROM usuarios;';
  db.query(sql, callback);
};

// Crear usuario generico (estudiante o admin)
export const createUsuario = async (data) => {
  const sql = 'INSERT INTO usuarios (usuario, contraseña, role, id_estudiante) VALUES (?, ?, ?, ?)';
  const values = [ data.usuario, data.contraseña, data.role || 'admin', data.id_estudiante || null ];
  const [result] = await db.query(sql, values);
  return result;
};

export const getUsuarioPorusername = async (username) => {
  const sql = 'SELECT * FROM usuarios WHERE usuario = ?';
  const [rows] = await db.query(sql, [username]);
  return rows[0];
};

// Nota: el email único para admin se valida en admin_profiles

// Obtener un solo usuario por id
export const getUsuarioPorid = async (id) => {
  const [rows] = await db.query('SELECT * FROM usuarios WHERE id = ?', [id]);
  return rows[0]; 
};

export const getUsuarioPorEstudianteId = async (id_estudiante) => {
  const [rows] = await db.query('SELECT * FROM usuarios WHERE id_estudiante = ? LIMIT 1', [id_estudiante]);
  return rows[0] || null;
};

export const updatePassword = async (id, hashedPassword) => {
  const [result] = await db.query('UPDATE usuarios SET contraseña = ?, password_changed_at = CURRENT_TIMESTAMP, must_change = 0 WHERE id = ?', [hashedPassword, id]);
  return result;
};

// Actualizar username por id de usuario
export const updateUsername = async (id, nuevoUsuario) => {
  const [result] = await db.query('UPDATE usuarios SET usuario = ? WHERE id = ?', [nuevoUsuario, id]);
  return result;
};

// Actualizar username buscando por id_estudiante vinculado
export const updateUsernameByEstudianteId = async (id_estudiante, nuevoUsuario) => {
  const [result] = await db.query('UPDATE usuarios SET usuario = ? WHERE id_estudiante = ? LIMIT 1', [nuevoUsuario, id_estudiante]);
  return result;
};

// Marcar logout (dummy no-op compatible con controlador)
export const marcarComoLogout = async (_id, cb) => {
  // En caso de querer registrar sesiones, implementar aquí.
  if (typeof cb === 'function') cb(null);
  return { ok: true };
};

export const countAdmins = async () => {
  const [rows] = await db.query("SELECT COUNT(*) AS total FROM usuarios WHERE role = 'admin'");
  return rows[0]?.total || 0;
};

// Security helpers
export const resetLoginSecurity = async (id) => {
  const [res] = await db.query(
    'UPDATE usuarios SET failed_attempts = 0, locked_until = NULL, last_login_at = CURRENT_TIMESTAMP WHERE id = ?',
    [id]
  );
  return res;
};

export const registerFailedAttempt = async (id) => {
  const [res] = await db.query('UPDATE usuarios SET failed_attempts = failed_attempts + 1 WHERE id = ?', [id]);
  return res;
};

export const lockUserUntil = async (id, minutes) => {
  const mins = Math.max(1, Math.min(120, Number(minutes) || 15));
  const [res] = await db.query('UPDATE usuarios SET locked_until = DATE_ADD(NOW(), INTERVAL ? MINUTE) WHERE id = ?', [mins, id]);
  return res;
};