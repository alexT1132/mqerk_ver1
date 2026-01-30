import db from '../db.js'; // ya no ejecutes connectDB()

// Crear comprobante
export const createComprobante = async (data) => {
  const sql = 'INSERT INTO comprobantes (id_estudiante, comprobante) VALUES (?, ?)';
  const values = [
    data.id_estudiante, 
    data.comprobante
  ];
  const [result] = await db.query(sql, values);
  return result;
};

export const getComprobantes = async (grupo, curso) => {
    const [rows] = await db.query(`
        SELECT 
          e.id AS id_estudiante,
          e.folio, 
          e.nombre, 
          e.apellidos, 
          e.verificacion, 
          c.comprobante, 
          c.importe, 
          c.metodo, 
          c.motivo_rechazo AS motivoRechazo,
          c.created_at, 
          c.updated_at 
        FROM comprobantes c
        INNER JOIN estudiantes e
          ON c.id_estudiante = e.id 
        LEFT JOIN soft_deletes sd ON sd.id_estudiante = e.id
        WHERE e.grupo = ?
          AND e.curso = ?
          AND sd.id IS NULL
    `, [grupo, curso]);
    return rows;
};

export const getEstudianteVerificacion = async (folio) => {
  const [rows] = await db.query(`
    SELECT * FROM estudiantes WHERE folio = ?
  `, [folio]);

  if (rows.length > 0) {
    return rows[0];
  } else {
    throw new Error('Estudiante not found');
  }
};

export const actualizarComprobante = async (id, { importe, metodo }) => {
  const sql = `
    UPDATE comprobantes 
    SET importe = ?, metodo = ?, updated_at = NOW()
    WHERE id_estudiante = ?
  `;
  const [result] = await db.query(sql, [importe, metodo, id]);
  return result;
};

// Actualizar comprobante incluyendo motivo de rechazo (se usa al rechazar)
export const actualizarComprobanteRechazo = async (id, { importe, metodo, motivo }) => {
  const sql = `
    UPDATE comprobantes
    SET importe = ?, metodo = ?, motivo_rechazo = ?, updated_at = NOW()
    WHERE id_estudiante = ?
  `;
  const [result] = await db.query(sql, [importe, metodo, motivo, id]);
  return result;
};

export const verificarAcceso = async (id) => {
  const sql = `
    UPDATE estudiantes
    SET verificacion = 2
    WHERE id = ?;
  `;

  const [result] = await db.query(sql, [id]);
  return result;
};