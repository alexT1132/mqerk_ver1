import db from '../db.js';
import { randomUUID } from 'crypto';

// Preguntas
export const listPreguntasQuiz = async (id_quiz) => {
  const [rows] = await db.query('SELECT * FROM quizzes_preguntas WHERE id_quiz = ? AND activa = 1 ORDER BY orden ASC, id ASC', [id_quiz]);
  return rows;
};

export const listOpcionesPregunta = async (id_pregunta) => {
  const [rows] = await db.query('SELECT * FROM quizzes_preguntas_opciones WHERE id_pregunta = ? ORDER BY id ASC', [id_pregunta]);
  return rows;
};

export const getPreguntaById = async (id) => {
  const [rows] = await db.query('SELECT * FROM quizzes_preguntas WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
};

// Sesiones
export const crearSesion = async ({ id_quiz, id_estudiante, intento_num, tiempo_limite_seg }) => {
  const id = randomUUID();
  await db.query('INSERT INTO quizzes_sesiones (id, id_quiz, id_estudiante, intento_num, tiempo_limite_seg) VALUES (?,?,?,?,?)', [id, id_quiz, id_estudiante, intento_num, tiempo_limite_seg || null]);
  const [rows] = await db.query('SELECT * FROM quizzes_sesiones WHERE id = ?', [id]);
  return rows[0];
};

export const getSesion = async (id_sesion) => {
  const [rows] = await db.query('SELECT * FROM quizzes_sesiones WHERE id = ? LIMIT 1', [id_sesion]);
  return rows[0] || null;
};

export const agregarRespuesta = async ({ id_sesion, id_pregunta, id_opcion, valor_texto, tiempo_ms }) => {
  await db.query('INSERT INTO quizzes_sesiones_respuestas (id_sesion, id_pregunta, id_opcion, valor_texto, tiempo_ms) VALUES (?,?,?,?,?)', [id_sesion, id_pregunta, id_opcion || null, valor_texto || null, tiempo_ms || null]);
};

export const listRespuestasSesion = async (id_sesion) => {
  const [rows] = await db.query('SELECT * FROM quizzes_sesiones_respuestas WHERE id_sesion = ? ORDER BY id ASC', [id_sesion]);
  return rows;
};

export const finalizarSesion = async ({ sesion, preguntas }) => {
  // Calcular correctas: para opcion_multiple / verdadero_falso: opción marcada y es_correcta=1
  // multi_respuesta: todas las correctas seleccionadas y ninguna incorrecta seleccionada.
  const [respuestas] = await db.query('SELECT * FROM quizzes_sesiones_respuestas WHERE id_sesion = ?', [sesion.id]);
  const preguntaMap = new Map();
  preguntas.forEach(p => preguntaMap.set(p.id, p));
  const [opciones] = await db.query('SELECT o.*, p.tipo FROM quizzes_preguntas_opciones o JOIN quizzes_preguntas p ON p.id = o.id_pregunta WHERE p.id_quiz = ?', [sesion.id_quiz]);
  const opcionesByPregunta = opciones.reduce((acc, o) => { (acc[o.id_pregunta] = acc[o.id_pregunta] || []).push(o); return acc; }, {});

  let correctas = 0; let total = 0; let puntosAcumulados = 0; let puntosTotales = 0;
  for (const p of preguntas) {
    total += 1; puntosTotales += p.puntos || 1;
    const resps = respuestas.filter(r => r.id_pregunta === p.id);
    const opts = opcionesByPregunta[p.id] || [];
    const correctOpts = opts.filter(o => o.es_correcta === 1).map(o => o.id);
    const marked = resps.map(r => r.id_opcion).filter(Boolean);
    let esCorrecta = false;
    if (p.tipo === 'multi_respuesta') {
      // Deben coincidir conjuntos exactamente
      esCorrecta = marked.length === correctOpts.length && marked.every(id => correctOpts.includes(id));
    } else if (p.tipo === 'opcion_multiple' || p.tipo === 'verdadero_falso') {
      esCorrecta = marked.length === 1 && correctOpts.includes(marked[0]);
    }
    if (esCorrecta) { correctas += 1; puntosAcumulados += (p.puntos || 1); }
    // Actualizar flag correcta en cada respuesta de la pregunta
    const flag = esCorrecta ? 1 : 0;
    await db.query('UPDATE quizzes_sesiones_respuestas SET correcta = ? WHERE id_sesion = ? AND id_pregunta = ?', [flag, sesion.id, p.id]);
  }
  const puntaje = puntosTotales > 0 ? Math.round((puntosAcumulados / puntosTotales) * 100) : 0;
  await db.query('UPDATE quizzes_sesiones SET estado = "finalizado", finished_at = NOW() WHERE id = ?', [sesion.id]);
  return { correctas, total_preguntas: total, puntaje };
};
