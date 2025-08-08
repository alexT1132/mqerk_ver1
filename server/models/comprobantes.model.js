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
        SELECT estudiantes.folio, estudiantes.nombre, estudiantes.apellidos, estudiantes.verificacion, comprobantes.comprobante, comprobantes.importe, comprobantes.metodo, comprobantes.created_at 
        FROM comprobantes 
        INNER JOIN estudiantes 
        ON comprobantes.id_estudiante = estudiantes.id 
        WHERE estudiantes.grupo = ?
        AND estudiantes.curso = ?
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
    SET importe = ?, metodo = ?, created_at = NOW()
    WHERE id_estudiante = ?
  `;
  const [result] = await db.query(sql, [importe, metodo, id]);
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