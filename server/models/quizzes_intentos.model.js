import db from '../db.js';

export const getQuizById = async (id) => {
  const [rows] = await db.query('SELECT * FROM actividades WHERE id = ? AND tipo = "quiz" LIMIT 1', [id]);
  return rows[0] || null;
};

export const listQuizzes = async ({ visible = true } = {}) => {
  const clauses = ['tipo = "quiz"', 'activo = 1'];
  if (visible) {
    clauses.push('(visible_desde IS NULL OR visible_desde <= NOW())');
    clauses.push('(visible_hasta IS NULL OR visible_hasta >= NOW())');
  }
  const sql = `SELECT * FROM actividades WHERE ${clauses.join(' AND ')} ORDER BY fecha_limite ASC, id DESC`;
  const [rows] = await db.query(sql);
  return rows;
};

export const listIntentosQuizEstudiante = async (id_quiz, id_estudiante) => {
  const [rows] = await db.query('SELECT * FROM quizzes_intentos WHERE id_quiz = ? AND id_estudiante = ? ORDER BY id DESC', [id_quiz, id_estudiante]);
  return rows;
};

export const contarIntentosQuizEstudiante = async (id_quiz, id_estudiante) => {
  const [rows] = await db.query('SELECT COUNT(*) as total FROM quizzes_intentos WHERE id_quiz = ? AND id_estudiante = ?', [id_quiz, id_estudiante]);
  return rows[0]?.total || 0;
};

export const crearIntentoQuiz = async ({ id_quiz, id_estudiante, puntaje, tiempo_segundos, total_preguntas, correctas }) => {
  // Obtener siguiente número de intento
  const totalPrevios = await contarIntentosQuizEstudiante(id_quiz, id_estudiante);
  const intent_number = totalPrevios + 1;
  const sql = `INSERT INTO quizzes_intentos (id_quiz, id_estudiante, puntaje, intent_number, tiempo_segundos, total_preguntas, correctas) VALUES (?,?,?,?,?,?,?)`;
  const [res] = await db.query(sql, [id_quiz, id_estudiante, puntaje, intent_number, tiempo_segundos || null, total_preguntas || null, correctas || null]);
  const [rows] = await db.query('SELECT * FROM quizzes_intentos WHERE id = ?', [res.insertId]);
  return rows[0];
};

export const resumenQuizzesEstudiante = async (id_estudiante) => {
  // Para cada quiz visible, mostrar último intento (puntaje), mejor puntaje y total intentos
  const [rows] = await db.query(`
    SELECT q.*, 
      (SELECT qi.puntaje FROM quizzes_intentos qi WHERE qi.id_quiz = q.id AND qi.id_estudiante = ? ORDER BY qi.id DESC LIMIT 1) AS ultimo_puntaje,
      (SELECT MAX(qi.puntaje) FROM quizzes_intentos qi WHERE qi.id_quiz = q.id AND qi.id_estudiante = ?) AS mejor_puntaje,
      (SELECT COUNT(*) FROM quizzes_intentos qi WHERE qi.id_quiz = q.id AND qi.id_estudiante = ?) AS total_intentos
    FROM actividades q
    WHERE q.tipo = 'quiz' AND q.activo = 1
    ORDER BY q.fecha_limite ASC, q.id DESC
  `, [id_estudiante, id_estudiante, id_estudiante]);
  return rows;
};
