import db from '../db.js'; // ya no ejecutes connectDB()

// Crear datos del alumno
export const createEstudiante = async (data) => {
  const sql = 'INSERT INTO estudiantes (nombre, apellidos, email, foto, comunidad1, comunidad2, telefono, nombre_tutor, tel_tutor, academico1, academico2, semestre, alergia, alergia2, discapacidad1, discapacidad2, orientacion, universidades1, universidades2, postulacion, comentario1, comentario2, curso, plan, anio, folio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const values = [
    data.nombre, 
    data.apellidos, 
    data.email, 
    data.foto, 
    data.comunidad1, 
    data.comunidad2, 
    data.telefono, 
    data.nombre_tutor, 
    data.tel_tutor, 
    data.academico1, 
    data.academico2, 
    data.semestre, 
    data.alergia, 
    data.alergia2, 
    data.discapacidad1, 
    data.discapacidad2, 
    data.orientacion, 
    data.universidades1, 
    data.universidades2, 
    data.postulacion, 
    data.comentario1, 
    data.comentario2, 
    data.curso, 
    data.plan, 
    data.anio, 
    data.folio
  ];
  const [result] = await db.query(sql, values);
  return result;
};

// Obtener todos los usuarios
export const ObtenerUsuarios = (callback) => {
  const sql = 'SELECT * FROM estudiantes';
  db.query(sql, callback);
};

// Obtener un solo usuario por ID
export const getEstudianteById = async (id) => {
  const [rows] = await db.query('SELECT * FROM estudiantes WHERE id = ?', [id]);
  return rows[0]; // solo uno
};

// Actualizar un usuario
export const updateUsuario = (id, data, callback) => {
  const sql = 'UPDATE estudiantes SET nombre = ?, email = ?, rol = ? WHERE id = ?';
  const values = [data.nombre, data.email, data.rol, id];
  db.query(sql, values, callback);
};

// Eliminar un usuario
export const deleteUsuario = (id, callback) => {
  const sql = 'DELETE FROM estudiantes WHERE id = ?';
  db.query(sql, [id], callback);
};

export const obtenerUltimoFolio = async () => {
  try {
    const [rows] = await db.query('SELECT folio FROM estudiantes ORDER BY created_at DESC LIMIT 1');
    return rows.length > 0 ? rows[0].folio : null;
  } catch (error) {
    console.error('ERROR EN MODELO obtenerUltimoFolio:', error);
    throw error;
  }
};