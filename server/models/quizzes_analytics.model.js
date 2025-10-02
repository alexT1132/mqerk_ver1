import db from '../db.js';
import * as Quizzes from './quizzes_intentos.model.js';

export const getAttemptsBasic = async (id_quiz, id_estudiante, limit = 20) => {
  const [rows] = await db.query(
    'SELECT id, puntaje, intent_number, tiempo_segundos, created_at FROM quizzes_intentos WHERE id_quiz = ? AND id_estudiante = ? ORDER BY id DESC LIMIT ?',
    [id_quiz, id_estudiante, Number(limit)]
  );
  return rows;
};

export const getTimeStatsFromSessions = async (id_quiz, id_estudiante) => {
  const [rows] = await db.query(
    `SELECT 
        AVG(TIMESTAMPDIFF(SECOND, created_at, finished_at)) AS avg_tiempo,
        MIN(TIMESTAMPDIFF(SECOND, created_at, finished_at)) AS min_tiempo
      FROM quizzes_sesiones
      WHERE id_quiz = ? AND id_estudiante = ? AND estado = 'finalizado'`,
    [id_quiz, id_estudiante]
  );
  return rows[0] || { avg_tiempo: null, min_tiempo: null };
};

export const getMateriasBreakdown = async (id_quiz, id_estudiante) => {
  // Usa vista si existe
  try {
    const [rows] = await db.query(
      'SELECT * FROM vw_quiz_resumen_materias WHERE id_quiz = ? AND id_estudiante = ? ORDER BY ratio_correctas ASC',
      [id_quiz, id_estudiante]
    );
    return rows.map(r => ({
      id_materia: r.id_materia,
      nombre: r.materia,
      preguntasVistas: r.preguntas_vistas,
      correctas: r.correctas,
      ratio: r.ratio_correctas !== null ? Number((r.ratio_correctas * 100).toFixed(2)) : null
    }));
  } catch(e) {
    return [];
  }
};

export const buildAnalytics = async ({ id_quiz, id_estudiante }) => {
  const quiz = await Quizzes.getQuizById(id_quiz);
  if(!quiz) return null;
  const attempts = await getAttemptsBasic(id_quiz, id_estudiante, 25);
  const total_intentos = attempts.length;
  const ultimo_puntaje = attempts[0]?.puntaje ?? null;
  const mejor_puntaje = attempts.reduce((m,a)=> a.puntaje>m? a.puntaje : m, 0);
  const promedio_puntaje = total_intentos ? attempts.reduce((s,a)=> s + (a.puntaje||0),0)/total_intentos : null;
  const tiempoStats = await getTimeStatsFromSessions(id_quiz, id_estudiante);
  const materias = await getMateriasBreakdown(id_quiz, id_estudiante);
  return {
    quiz: { id: quiz.id, titulo: quiz.titulo, fecha_limite: quiz.fecha_limite, max_intentos: quiz.max_intentos },
    estudiante: { id: id_estudiante },
    stats: {
      total_intentos,
      promedio_puntaje: promedio_puntaje !== null ? Number(promedio_puntaje.toFixed(2)) : null,
      mejor_puntaje: mejor_puntaje || null,
      ultimo_puntaje,
      promedio_tiempo_segundos: tiempoStats.avg_tiempo ? Math.round(tiempoStats.avg_tiempo) : null,
      mejor_tiempo_segundos: tiempoStats.min_tiempo ? Math.round(tiempoStats.min_tiempo) : null
    },
    intentos: attempts.map(a => ({
      id: a.id,
      puntaje: a.puntaje,
      intento: a.intent_number,
      tiempo_segundos: a.tiempo_segundos,
      fecha: a.created_at
    })),
    materias,
    versionAnalitica: 1,
    generated_at: new Date().toISOString()
  };
};
