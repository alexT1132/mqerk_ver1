import db from '../db.js';

export const createSubmission = async (data) => {
  const sql = `INSERT INTO feedback_submissions (id_task, id_estudiante, archivo, original_nombre, mime_type, tamano, puntos, version, replaced_by) VALUES (?,?,?,?,?,?,?,?,NULL)`;
  const values = [data.id_task, data.id_estudiante, data.archivo, data.original_nombre || null, data.mime_type || null, data.tamano || null, data.puntos || 10, data.version || 1];
  const [res] = await db.query(sql, values);
  return res.insertId;
};

export const getLatestSubmission = async (id_task, id_estudiante) => {
  const [rows] = await db.query(`SELECT * FROM feedback_submissions WHERE id_task = ? AND id_estudiante = ? AND replaced_by IS NULL ORDER BY created_at DESC LIMIT 1`, [id_task, id_estudiante]);
  return rows[0] || null;
};

export const listSubmissionsByTask = async (id_task, { limit = 50, offset = 0 }) => {
  const [rows] = await db.query(`SELECT * FROM feedback_submissions WHERE id_task = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`, [id_task, Number(limit), Number(offset)]);
  return rows;
};

export const listSubmissionsByStudent = async (id_estudiante, { limit = 100, offset = 0 }) => {
  const [rows] = await db.query(`SELECT * FROM feedback_submissions WHERE id_estudiante = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`, [id_estudiante, Number(limit), Number(offset)]);
  return rows;
};

export const versionSubmission = async (idPrev, newData) => {
  // Marcar anterior como reemplazada
  await db.query('UPDATE feedback_submissions SET replaced_by = ? WHERE id = ?', [null, idPrev]);
  // Insertar nuevo (simple, la app podría mejorar tracking de replaced_by luego si se requiere)
  return createSubmission({ ...newData, version: (newData.version || 1) + 1 });
};

export const updateSubmissionGrade = async (id, puntos) => {
  const [res] = await db.query('UPDATE feedback_submissions SET puntos = ? WHERE id = ?', [puntos, id]);
  return res;
};

export const getSubmissionById = async (id) => {
  const [rows] = await db.query('SELECT * FROM feedback_submissions WHERE id = ?', [id]);
  return rows[0] || null;
};
