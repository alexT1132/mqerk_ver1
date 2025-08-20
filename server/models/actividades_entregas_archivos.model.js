import db from '../db.js';

export const addArchivo = async ({ entrega_id, archivo, original_nombre, mime_type, tamano }) => {
  const sql = `INSERT INTO actividades_entregas_archivos (entrega_id, archivo, original_nombre, mime_type, tamano) VALUES (?,?,?,?,?)`;
  const [res] = await db.query(sql, [entrega_id, archivo, original_nombre, mime_type, tamano]);
  return res.insertId;
};

export const listArchivosEntrega = async (entrega_id) => {
  const [rows] = await db.query('SELECT * FROM actividades_entregas_archivos WHERE entrega_id = ? ORDER BY id ASC', [entrega_id]);
  return rows;
};

export const deleteArchivo = async (id, entrega_id) => {
  const [res] = await db.query('DELETE FROM actividades_entregas_archivos WHERE id = ? AND entrega_id = ? LIMIT 1', [id, entrega_id]);
  return res.affectedRows > 0;
};
