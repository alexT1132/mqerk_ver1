import db from '../db.js';

export const getNoteBySubmissionId = async (id_submission) => {
  const [rows] = await db.query('SELECT * FROM feedback_submission_notes WHERE id_submission = ? LIMIT 1', [id_submission]);
  return rows[0] || null;
};

export const upsertNote = async ({ id_submission, id_asesor = null, nota }) => {
  // Insertar o actualizar la nota por id_submission (única)
  const [res] = await db.query(
    `INSERT INTO feedback_submission_notes (id_submission, id_asesor, nota)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE id_asesor = VALUES(id_asesor), nota = VALUES(nota)`,
    [id_submission, id_asesor, nota]
  );
  // Si insertId es 0, fue update. Retornar el registro actual.
  const [rows] = await db.query('SELECT * FROM feedback_submission_notes WHERE id_submission = ? LIMIT 1', [id_submission]);
  return rows[0] || null;
};
