import db from '../db.js'; // ya no ejecutes connectDB()

// Asegurar columna 'estatus' en estudiantes (Activo|Suspendido)
export const ensureEstatusColumn = async () => {
  try {
    const [rows] = await db.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'estudiantes' AND COLUMN_NAME = 'estatus'`
    );
    if (!rows || rows.length === 0) {
      await db.query(`ALTER TABLE estudiantes ADD COLUMN estatus ENUM('Activo','Suspendido') NOT NULL DEFAULT 'Activo' AFTER plan`);
    }
  } catch (e) {
    console.error('ensureEstatusColumn error:', e?.message);
  }
};

// Crear datos del alumno
export const createEstudiante = async (data) => {
  const sql = 'INSERT INTO estudiantes (nombre, apellidos, email, foto, grupo, comunidad1, comunidad2, telefono, fecha_nacimiento, nombre_tutor, tel_tutor, academico1, academico2, semestre, alergia, alergia2, discapacidad1, discapacidad2, orientacion, universidades1, universidades2, postulacion, modalidad, comentario1, comentario2, curso, turno, plan, academia, anio, folio, asesor) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
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
  data.modalidad,
    data.comentario1, 
    data.comentario2, 
  data.curso, 
  data.turno,
  data.plan, 
  data.academia,
    data.anio, 
  data.folio,
  data.asesor
  ];
  const [result] = await db.query(sql, values);
  return result;
};

// Obtener todos los usuarios
export const ObtenerUsuarios = (callback) => {
  const sql = 'SELECT * FROM estudiantes';
  // Bridge promise-based pool to callback signature
  db.query(sql)
    .then(([rows]) => callback(null, rows))
    .catch((err) => callback(err));
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

// Obtener un estudiante por folio_formateado
export const getEstudianteByFolioFormateado = async (folioFormateado) => {
  const [rows] = await db.query('SELECT * FROM estudiantes WHERE folio_formateado = ? LIMIT 1', [folioFormateado]);
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
  db.query(sql, [id])
    .then(([result]) => callback(null, result))
    .catch((err) => callback(err));
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

export const getGruposConCantidad = async (curso, status = 'aprobados') => {
  const st = String(status || 'aprobados').toLowerCase();
  if (st === 'todos') {
    // Todos los estudiantes del curso por grupo (independiente del estado)
    const [rows] = await db.query(
      `
        SELECT e.grupo AS grupo, COUNT(*) AS cantidad_estudiantes
        FROM estudiantes e
        LEFT JOIN soft_deletes sd ON sd.id_estudiante = e.id
        WHERE e.curso = ?
          AND sd.id IS NULL
        GROUP BY e.grupo
      `,
      [curso]
    );
    return rows;
  }

  if (st === 'pendientes') {
    const [rows] = await db.query(
      `
        SELECT e.grupo AS grupo, COUNT(*) AS cantidad_estudiantes
        FROM estudiantes e
        LEFT JOIN soft_deletes sd ON sd.id_estudiante = e.id
        WHERE e.curso = ?
          AND e.verificacion = 1
          AND sd.id IS NULL
        GROUP BY e.grupo
      `,
      [curso]
    );
    return rows;
  }

  if (st === 'rechazados') {
    const [rows] = await db.query(
      `
        SELECT e.grupo AS grupo, COUNT(*) AS cantidad_estudiantes
        FROM estudiantes e
        LEFT JOIN soft_deletes sd ON sd.id_estudiante = e.id
        WHERE e.curso = ?
          AND e.verificacion = 3
          AND sd.id IS NULL
        GROUP BY e.grupo
      `,
      [curso]
    );
    return rows;
  }

  // 'aprobados' por defecto: alineado con getApprovedStudents
  const [rows] = await db.query(
    `
      SELECT e.grupo AS grupo, COUNT(DISTINCT e.id) AS cantidad_estudiantes
      FROM estudiantes e
      INNER JOIN (
        SELECT id_estudiante, MAX(created_at) AS latest
        FROM comprobantes
        WHERE importe IS NOT NULL
        GROUP BY id_estudiante
      ) lp ON lp.id_estudiante = e.id
      INNER JOIN comprobantes c 
        ON c.id_estudiante = lp.id_estudiante AND c.created_at = lp.latest
      LEFT JOIN soft_deletes sd ON sd.id_estudiante = e.id
      WHERE e.curso = ?
        AND e.verificacion = 2
        AND sd.id IS NULL
      GROUP BY e.grupo
    `,
    [curso]
  );
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