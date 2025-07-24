import db from "../db.js";

// Obtener todos los usuarios
export const ObtenerUsuarios = (callback) => {
  const sql = 'SELECT * FROM usuarios;';
  db.query(sql, callback);
};

// Crear puntos de venta
export const createUsuario = async (data) => {
  const sql = 'INSERT INTO usuarios (usuario, contraseña, role, id_estudiante) VALUES (?, ?, ?, ?)';
  const values = [ data.usuario, data.contraseña, data.role, data.id_estudiante ];
  const [result] = await db.query(sql, values);
  return result;
};

// Obtener un solo usuario por Email
export const getUsuarioPorusername = async (username) => {
  const sql = 'SELECT * FROM usuarios WHERE usuario = ?';
  const [rows] = await db.query(sql, [username]);
  return rows[0];
};

// Obtener un solo usuario por id
export const getUsuarioPorid = async (id) => {
  const [rows] = await db.query('SELECT * FROM usuarios WHERE id = ?', [id]);
  return rows[0]; 
};