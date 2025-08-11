import db from '../db.js'; // ya no ejecutes connectDB()

// Crear datos del alumno
export const createEstudiante = async (data) => {
  const sql = 'INSERT INTO estudiantes (nombre, apellidos, email, foto, grupo, comunidad1, comunidad2, telefono, fecha_nacimiento, nombre_tutor, tel_tutor, academico1, academico2, semestre, alergia, alergia2, discapacidad1, discapacidad2, orientacion, universidades1, universidades2, postulacion, comentario1, comentario2, curso, plan, anio, folio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const values = [
    data.nombre, 
    data.apellidos, 
    data.email, 
    data.foto, 
    data.grupo,
    data.comunidad1, 
    data.comunidad2, 
  data.telefono, 
  data.fecha_nacimiento,
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

// Obtener un estudiante por folio
export const getEstudianteByFolio = async (folio) => {
  const [rows] = await db.query('SELECT * FROM estudiantes WHERE folio = ? LIMIT 1', [folio]);
  return rows[0] || null;
};

// Actualizar un estudiante
export const updateComprobante = async (id, data) => {
  const sql = `
    UPDATE estudiantes 
    SET verificacion = ?
    WHERE id = ?;
  `;

  const values = [data.verificacion, id];

  try {
    const [result] = await db.query(sql, values);
    return result; // Puedes devolver result para saber cuántas filas se actualizaron
  } catch (error) {
    console.error("Error al actualizar estudiante:", error);
    throw error;
  }
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

export const getGruposConCantidad = async (curso) => {
    const [rows] = await db.query(`
        SELECT grupo, COUNT(*) AS cantidad_estudiantes
        FROM estudiantes
        WHERE curso = ?
        GROUP BY grupo
    `, [curso]);
    return rows;
};

// Actualizar estudiante con campos parciales
export const updateEstudiante = async (id, data) => {
  // Construir SET dinámico
  const keys = Object.keys(data);
  if (keys.length === 0) return { affectedRows: 0 };
  const setClause = keys.map(k => `\`${k}\` = ?`).join(', ');
  const values = keys.map(k => data[k]);
  const sql = `UPDATE estudiantes SET ${setClause} WHERE id = ?`;
  const [result] = await db.query(sql, [...values, id]);
  return result;
};

// Obtener el último folio por prefijo (e.g., 'MEEAU25')
export const getLastFolioByPrefix = async (prefix) => {
  try {
    const like = `${prefix}-%`;
    const [rows] = await db.query('SELECT folio FROM estudiantes WHERE folio LIKE ? ORDER BY folio DESC LIMIT 1', [like]);
    return rows.length ? rows[0].folio : null;
  } catch (error) {
    console.error('ERROR EN MODELO getLastFolioByPrefix:', error);
    throw error;
  }
};

// Obtener el mayor folio numérico por curso y año (secuencial por combinación curso+anio)
export const getMaxFolioByCourseYear = async (curso, anio) => {
  try {
    const [rows] = await db.query('SELECT MAX(folio) AS max_folio FROM estudiantes WHERE curso = ? AND anio = ?', [curso, anio]);
    const max = rows && rows.length ? rows[0].max_folio : null;
    return max == null ? null : Number(max);
  } catch (error) {
    console.error('ERROR EN MODELO getMaxFolioByCourseYear:', error);
    throw error;
  }
};