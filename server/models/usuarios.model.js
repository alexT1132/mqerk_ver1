import db from "../db.js";

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
  const [result] = await db.query('UPDATE usuarios SET contraseña = ?, password_changed_at = CURRENT_TIMESTAMP WHERE id = ?', [hashedPassword, id]);
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