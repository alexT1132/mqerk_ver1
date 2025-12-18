import db from '../db.js';
import { randomUUID } from 'crypto';

// Preguntas
export const listPreguntasQuiz = async (id_quiz) => {
  try {
    const [rows] = await db.query('SELECT * FROM quizzes_preguntas WHERE id_quiz = ? AND activa = 1 ORDER BY orden ASC, id ASC', [id_quiz]);
    return rows;
  } catch (e) {
    if (e?.code === 'ER_BAD_FIELD_ERROR' || e?.errno === 1054) {
      // Fallback: sin columna activa/orden
      const [rows] = await db.query('SELECT * FROM quizzes_preguntas WHERE id_quiz = ? ORDER BY id ASC', [id_quiz]);
      return rows;
    }
    throw e;
  }
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
  // Asegurar que los valores sean del tipo correcto
  const idQuiz = Number(id_quiz);
  const idEstudiante = Number(id_estudiante);
  const intentoNum = Number(intento_num);
  const tiempoLimite = tiempo_limite_seg ? Number(tiempo_limite_seg) : null;

  // Validaciones básicas
  if (!idQuiz || isNaN(idQuiz)) {
    throw new Error('id_quiz debe ser un número válido');
  }
  if (!idEstudiante || isNaN(idEstudiante)) {
    throw new Error('id_estudiante debe ser un número válido');
  }
  if (!intentoNum || isNaN(intentoNum)) {
    throw new Error('intento_num debe ser un número válido');
  }

  try {
    await db.query(
      'INSERT INTO quizzes_sesiones (id, id_quiz, id_estudiante, intento_num, tiempo_limite_seg) VALUES (?,?,?,?,?)',
      [id, idQuiz, idEstudiante, intentoNum, tiempoLimite]
    );
    const [rows] = await db.query('SELECT * FROM quizzes_sesiones WHERE id = ?', [id]);
    return rows[0];
  } catch (e) {
    // Si es un error de foreign key, agregar más contexto
    if (e.code === 'ER_NO_REFERENCED_ROW_2' || e.errno === 1452) {
      console.error('[crearSesion] Error de foreign key al insertar sesión');
      console.error('[crearSesion] id_quiz:', idQuiz, 'id_estudiante:', idEstudiante);
      console.error('[crearSesion] SQL:', e.sql);
      console.error('[crearSesion] Mensaje:', e.sqlMessage);
      // Verificar si el quiz existe
      const [quizCheck] = await db.query('SELECT id FROM quizzes WHERE id = ?', [idQuiz]);
      if (quizCheck.length === 0) {
        throw new Error(`El quiz con id ${idQuiz} no existe en la tabla quizzes`);
      }
      // Verificar si el estudiante existe
      const [estCheck] = await db.query('SELECT id FROM estudiantes WHERE id = ?', [idEstudiante]);
      if (estCheck.length === 0) {
        throw new Error(`El estudiante con id ${idEstudiante} no existe`);
      }
      // Verificar foreign keys
      const [fkRows] = await db.query(`
        SELECT CONSTRAINT_NAME, REFERENCED_TABLE_NAME
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'quizzes_sesiones'
          AND COLUMN_NAME = 'id_quiz'
          AND REFERENCED_TABLE_NAME IS NOT NULL
      `);
      const wrongFk = fkRows.find(fk => fk.REFERENCED_TABLE_NAME === 'actividades');
      if (wrongFk) {
        throw new Error(`Error: Existe una foreign key incorrecta ${wrongFk.CONSTRAINT_NAME} apuntando a actividades. Ejecuta: ALTER TABLE quizzes_sesiones DROP FOREIGN KEY ${wrongFk.CONSTRAINT_NAME}`);
      }
      throw new Error(`Error de foreign key: ${e.sqlMessage}. El quiz y estudiante existen pero hay un problema con las constraints.`);
    }
    throw e;
  }
};

export const getSesion = async (id_sesion) => {
  const [rows] = await db.query('SELECT * FROM quizzes_sesiones WHERE id = ? LIMIT 1', [id_sesion]);
  return rows[0] || null;
};

export const agregarRespuesta = async ({ id_sesion, id_pregunta, id_opcion, valor_texto, tiempo_ms }) => {
  // Obtener información de la pregunta para saber si es respuesta corta
  const [[pregunta]] = await db.query(
    'SELECT tipo, enunciado FROM quizzes_preguntas WHERE id = ? LIMIT 1',
    [id_pregunta]
  );

  const esRespuestaCorta = pregunta?.tipo === 'respuesta_corta';
  const calificacion_status = esRespuestaCorta ? 'pending' : 'graded';

  // Insertar respuesta con estado de calificación
  const [res] = await db.query(
    `INSERT INTO quizzes_sesiones_respuestas 
    (id_sesion, id_pregunta, id_opcion, valor_texto, tiempo_ms, calificacion_status, calificacion_metodo, calificacion_confianza, calificada_at) 
    VALUES (?,?,?,?,?,?,?,?,?)`,
    [id_sesion, id_pregunta, id_opcion || null, valor_texto || null, tiempo_ms || null, calificacion_status, null, null, null]
  );

  // Si es respuesta corta, agregar a cola de calificación
  if (esRespuestaCorta && valor_texto) {
    // Obtener la respuesta esperada (opción correcta)
    const [[opcionCorrecta]] = await db.query(
      'SELECT texto FROM quizzes_preguntas_opciones WHERE id_pregunta = ? AND es_correcta = 1 LIMIT 1',
      [id_pregunta]
    );

    if (opcionCorrecta) {
      // Importar cola de calificación
      const gradingQueue = (await import('../services/gradingQueue.js')).default;

      // Agregar a cola
      gradingQueue.add({
        id_respuesta: res.insertId,
        tipo: 'quiz',
        pregunta: pregunta.enunciado,
        respuesta_esperada: opcionCorrecta.texto,
        respuesta_estudiante: valor_texto
      });

      console.log(`[agregarRespuesta] ✅ Respuesta corta agregada a cola: quiz #${res.insertId}`);
    }
  }
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

  let correctas = 0; 
  let total = 0; 
  let puntosAcumulados = 0; 
  let puntosTotales = 0;
  let puntosCalificados = 0; // Puntos de preguntas que ya fueron calificadas
  
  for (const p of preguntas) {
    total += 1; 
    puntosTotales += p.puntos || 1;
    const resps = respuestas.filter(r => r.id_pregunta === p.id);
    const opts = opcionesByPregunta[p.id] || [];
    const correctOpts = opts.filter(o => o.es_correcta === 1).map(o => o.id);
    const marked = resps.map(r => r.id_opcion).filter(Boolean);
    let esCorrecta = false;
    let fueCalificada = false;
    
    if (p.tipo === 'multi_respuesta') {
      // Deben coincidir conjuntos exactamente
      esCorrecta = marked.length === correctOpts.length && marked.every(id => correctOpts.includes(id));
      fueCalificada = true; // Siempre se puede calificar
    } else if (p.tipo === 'opcion_multiple' || p.tipo === 'verdadero_falso') {
      esCorrecta = marked.length === 1 && correctOpts.includes(marked[0]);
      fueCalificada = true; // Siempre se puede calificar
    } else if (p.tipo === 'respuesta_corta') {
      // Para respuesta corta, verificar si ya fue calificada
      const respuestaCorta = resps.find(r => r.valor_texto);
      if (respuestaCorta) {
        const status = respuestaCorta.calificacion_status || 'pending';
        const confianza = respuestaCorta.calificacion_confianza != null ? Number(respuestaCorta.calificacion_confianza) : null;
        
        if (status === 'graded' || (status === 'manual_review' && confianza != null) || respuestaCorta.correcta === 1) {
          // Ya fue calificada
          fueCalificada = true;
          // Verificar si es correcta
          if (respuestaCorta.correcta === 1) {
            esCorrecta = true;
          } else if (respuestaCorta.calificacion_metodo === 'manual') {
            esCorrecta = confianza === 100;
          } else if (confianza != null) {
            esCorrecta = confianza >= 70;
          }
        }
        // Si está en "pending", no se cuenta (aún no calificada)
      }
      // Si no fue calificada, no contar en el puntaje
      if (!fueCalificada) continue;
    }
    
    // Solo contar puntos si la pregunta fue calificada
    if (fueCalificada) {
      puntosCalificados += p.puntos || 1;
      if (esCorrecta) { 
        correctas += 1; 
        puntosAcumulados += p.puntos || 1; 
      }
      // Actualizar flag correcta en cada respuesta de la pregunta (solo para opción múltiple)
      if (p.tipo !== 'respuesta_corta') {
        const flag = esCorrecta ? 1 : 0;
        await db.query('UPDATE quizzes_sesiones_respuestas SET correcta = ? WHERE id_sesion = ? AND id_pregunta = ?', [flag, sesion.id, p.id]);
      }
    }
  }
  
  // Calcular puntaje: usar solo preguntas calificadas como denominador
  // Si hay preguntas pendientes, el puntaje es parcial
  const puntaje = puntosCalificados > 0 ? Math.round((puntosAcumulados / puntosCalificados) * 100) : 0;
  await db.query('UPDATE quizzes_sesiones SET estado = "finalizado", finished_at = NOW() WHERE id = ?', [sesion.id]);
  return { correctas, total_preguntas: total, puntaje };
};

// === Creación de banco de preguntas ===
export const createPregunta = async ({ id_quiz, orden, enunciado, tipo, puntos, activa = 1 }) => {
  try {
    const sql = 'INSERT INTO quizzes_preguntas (id_quiz, orden, enunciado, tipo, puntos, activa) VALUES (?,?,?,?,?,?)';
    const [res] = await db.query(sql, [id_quiz, orden ?? 1, enunciado, tipo, puntos ?? 1, activa ? 1 : 0]);
    const [rows] = await db.query('SELECT * FROM quizzes_preguntas WHERE id = ?', [res.insertId]);
    return rows[0];
  } catch (e) {
    if (e?.code === 'ER_BAD_FIELD_ERROR' || e?.errno === 1054) {
      // Fallback sin columnas orden/activa
      const sql = 'INSERT INTO quizzes_preguntas (id_quiz, enunciado, tipo, puntos) VALUES (?,?,?,?)';
      const [res] = await db.query(sql, [id_quiz, enunciado, tipo, puntos ?? 1]);
      const [rows] = await db.query('SELECT * FROM quizzes_preguntas WHERE id = ?', [res.insertId]);
      return rows[0];
    }
    // Re-lanzar el error para que el controller lo maneje (especialmente errores de ENUM)
    throw e;
  }
};

export const createOpcion = async ({ id_pregunta, texto, es_correcta = 0, orden }) => {
  try {
    const sql = 'INSERT INTO quizzes_preguntas_opciones (id_pregunta, texto, es_correcta, orden) VALUES (?,?,?,?)';
    const [res] = await db.query(sql, [id_pregunta, texto, es_correcta ? 1 : 0, orden ?? null]);
    const [rows] = await db.query('SELECT * FROM quizzes_preguntas_opciones WHERE id = ?', [res.insertId]);
    return rows[0];
  } catch (e) {
    if (e?.code === 'ER_BAD_FIELD_ERROR' || e?.errno === 1054) {
      // Fallback sin columna orden
      const sql = 'INSERT INTO quizzes_preguntas_opciones (id_pregunta, texto, es_correcta) VALUES (?,?,?)';
      const [res] = await db.query(sql, [id_pregunta, texto, es_correcta ? 1 : 0]);
      const [rows] = await db.query('SELECT * FROM quizzes_preguntas_opciones WHERE id = ?', [res.insertId]);
      return rows[0];
    }
    throw e;
  }
};
