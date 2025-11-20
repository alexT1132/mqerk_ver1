import * as QQ from '../models/quizzes_questions.model.js';
import * as Quizzes from '../models/quizzes_intentos.model.js';
import * as Access from '../models/student_area_access.model.js';

// Lista completa (preguntas + opciones) de un quiz (sin marcar correctas en la respuesta pública)
export const listPreguntasQuiz = async (req, res) => {
  try {
    const { id } = req.params; // id quiz
    const quiz = await Quizzes.getQuizById(id);
    if (!quiz) return res.status(404).json({ message: 'Quiz no encontrado' });
    // Si existe la columna 'activo' y es 0, bloquear; si no existe o es null/undefined, permitir
    if (Object.prototype.hasOwnProperty.call(quiz, 'activo') && Number(quiz.activo) === 0) {
      return res.status(404).json({ message: 'Quiz no encontrado' });
    }
    const preguntas = await QQ.listPreguntasQuiz(id);
    const safe = [];
    for (const p of preguntas) {
      const opciones = await QQ.listOpcionesPregunta(p.id);
      safe.push({
        id: p.id,
        orden: p.orden,
        enunciado: p.enunciado,
        tipo: p.tipo,
        puntos: p.puntos,
        opciones: opciones.map(o => ({ id: o.id, texto: o.texto })) // ocultamos es_correcta
      });
    }
    res.json({ data: safe });
  } catch (e) {
    console.error('listPreguntasQuiz', e); res.status(500).json({ message: 'Error interno'});
  }
};

// Versión completa para administración: incluye es_correcta y metadatos del quiz
export const getQuizFull = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('[getQuizFull] Buscando quiz ID:', id);
    const quiz = await Quizzes.getQuizById(id);
    if (!quiz) {
      console.log('[getQuizFull] Quiz no encontrado:', id);
      return res.status(404).json({ message: 'Quiz no encontrado' });
    }
    console.log('[getQuizFull] Quiz encontrado:', quiz.titulo);
    const preguntas = await QQ.listPreguntasQuiz(id);
    console.log('[getQuizFull] Preguntas encontradas:', preguntas.length);
    const out = [];
    for (const p of preguntas) {
      const opciones = await QQ.listOpcionesPregunta(p.id);
      out.push({ ...p, opciones });
    }
    return res.json({ data: { quiz, preguntas: out } });
  } catch (e) {
    console.error('[getQuizFull] Error:', { id: req.params?.id, err: e?.message, stack: e?.stack });
    return res.status(500).json({ message: 'Error interno', error: e?.message });
  }
};

// Crear sesión (inicio de intento aún no contabilizado en quizzes_intentos hasta finalizar)
export const crearSesionQuiz = async (req, res) => {
  try {
    const { id } = req.params; // quiz
    const { id_estudiante } = req.body;
    if(!id_estudiante) return res.status(400).json({ message:'id_estudiante requerido'});
    const quiz = await Quizzes.getQuizById(id);
    if(!quiz) return res.status(404).json({ message:'Quiz no encontrado'});
    if (Object.prototype.hasOwnProperty.call(quiz, 'activo') && Number(quiz.activo) === 0) {
      return res.status(404).json({ message:'Quiz no encontrado'});
    }
    // Política más flexible: permitir iniciar sesión aunque no tenga permiso explícito del área.
    // Esto evita bloquear al alumno que entra desde la pestaña de Quizzes.
    // Mantener otras rutas (lista/analytics) con filtros por área, pero no impedir sesionar.
    // if (quiz.id_area) {
    //   try {
    //     const allowed = await Access.hasPermission(id_estudiante, Number(quiz.id_area));
    //     if (!allowed) return res.status(403).json({ message:'Sin permiso para este módulo/área' });
    //   } catch(_e) { return res.status(403).json({ message:'Sin permiso para este módulo/área' }); }
    // }
    // determinar número de intento proyectado
    const totalPrevios = await Quizzes.contarIntentosQuizEstudiante(id, id_estudiante);
    if (quiz.max_intentos && totalPrevios >= quiz.max_intentos) {
      return res.status(400).json({ message:'Max intentos alcanzado'});
    }
    // Convertir minutos a segundos si existe la columna time_limit_min en la actividad (se guarda en actividades)
    const limiteSeg = quiz.time_limit_min ? Number(quiz.time_limit_min) * 60 : null;
    const sesion = await QQ.crearSesion({ id_quiz: id, id_estudiante, intento_num: totalPrevios + 1, tiempo_limite_seg: limiteSeg });
    res.status(201).json({ data: sesion });
  } catch(e){ 
    console.error('crearSesionQuiz', e); 
    // Si es un error de foreign key, dar un mensaje más específico
    if (e.code === 'ER_NO_REFERENCED_ROW_2' || e.errno === 1452) {
      console.error('[crearSesionQuiz] Error de foreign key:', e.sqlMessage);
      console.error('[crearSesionQuiz] Quiz ID:', id, 'Estudiante ID:', id_estudiante);
      // Verificar si el quiz existe en quizzes
      const quizCheck = await Quizzes.getQuizById(id);
      if (!quizCheck) {
        return res.status(404).json({ message: 'Quiz no encontrado en la base de datos' });
      }
      return res.status(500).json({ 
        message: 'Error al crear sesión: problema con la estructura de la base de datos. Contacta al administrador.',
        details: 'El quiz existe pero hay un problema con las foreign keys de la tabla quizzes_sesiones'
      });
    }
    res.status(500).json({ message:'Error interno', details: e.message });
  }
};

// Registrar respuestas (batch) - id_sesion path param
export const registrarRespuestasSesion = async (req, res) => {
  try {
    const { id_sesion } = req.params;
    const { respuestas } = req.body; // [{id_pregunta, id_opcion, tiempo_ms}]
    if(!Array.isArray(respuestas)) return res.status(400).json({ message:'respuestas debe ser array'});
    const sesion = await QQ.getSesion(id_sesion);
    if(!sesion || sesion.estado !== 'en_progreso') return res.status(404).json({ message:'Sesión no válida'});
    // No bloquear por permisos de área en guardado incremental
    for (const r of respuestas) {
      if (!r.id_pregunta) continue; // ignorar inválidas
      await QQ.agregarRespuesta({ id_sesion, id_pregunta: r.id_pregunta, id_opcion: r.id_opcion || null, valor_texto: r.valor_texto, tiempo_ms: r.tiempo_ms });
    }
    res.json({ message:'OK' });
  } catch(e){ console.error('registrarRespuestasSesion', e); res.status(500).json({ message:'Error interno'}); }
};

// Finalizar sesión: corrige, inserta intento en quizzes_intentos y devuelve resultados
export const finalizarSesionQuiz = async (req, res) => {
  try {
    const { id_sesion } = req.params;
    const sesion = await QQ.getSesion(id_sesion);
    if(!sesion || sesion.estado !== 'en_progreso') return res.status(404).json({ message:'Sesión no válida'});
    const quiz = await Quizzes.getQuizById(sesion.id_quiz);
    if(!quiz) return res.status(404).json({ message:'Quiz no encontrado'});
    if (Object.prototype.hasOwnProperty.call(quiz, 'activo') && Number(quiz.activo) === 0) {
      return res.status(404).json({ message:'Quiz no encontrado'});
    }
    // Política más flexible: permitir finalizar sesión y registrar intento aunque no tenga permiso del área
    // if (quiz.id_area) {
    //   try {
    //     const allowed = await Access.hasPermission(sesion.id_estudiante, Number(quiz.id_area));
    //     if (!allowed) return res.status(403).json({ message:'Sin permiso para este módulo/área' });
    //   } catch(_e) { return res.status(403).json({ message:'Sin permiso para este módulo/área' }); }
    // }
    const preguntas = await QQ.listPreguntasQuiz(sesion.id_quiz);
    const resultado = await QQ.finalizarSesion({ sesion, preguntas });
    // Calcular duración del intento (segundos)
    // Preferir payload del cliente (elapsed_ms, started_at, finished_at) y caer al servidor si no viene
    const body = req.body || {};
    let tiempo_segundos = null;
    try {
      const startedAt = body.started_at ? new Date(body.started_at) : (sesion.started_at ? new Date(sesion.started_at) : (sesion.created_at ? new Date(sesion.created_at) : null));
      const finishedAt = body.finished_at ? new Date(body.finished_at) : new Date();
      const elapsedFromBody = Number(body.elapsed_ms);
      let elapsedMs = (!Number.isNaN(elapsedFromBody) && elapsedFromBody > 0) ? elapsedFromBody : (startedAt && finishedAt ? (finishedAt - startedAt) : null);
      if (elapsedMs != null && Number.isFinite(elapsedMs)) {
        tiempo_segundos = Math.max(1, Math.round(elapsedMs / 1000));
      }
    } catch { /* ignore */ }
    // Insertar intento definitivo con tiempo
    try {
      await Quizzes.crearIntentoQuiz({ id_quiz: sesion.id_quiz, id_estudiante: sesion.id_estudiante, puntaje: resultado.puntaje, tiempo_segundos, total_preguntas: resultado.total_preguntas, correctas: resultado.correctas });
    } catch (e) {
      // Si es un error de foreign key, dar un mensaje más específico
      if (e.code === 'ER_NO_REFERENCED_ROW_2' || e.errno === 1452) {
        console.error('[finalizarSesionQuiz] Error de foreign key:', e.message);
        console.error('[finalizarSesionQuiz] Quiz ID:', sesion.id_quiz, 'Estudiante ID:', sesion.id_estudiante);
        return res.status(500).json({ 
          message: 'Error al guardar el intento del quiz: problema de configuración de la base de datos. Contacta a soporte.', 
          details: e.message 
        });
      }
      throw e;
    }
    res.json({ data: { sesion: { id: sesion.id, estado: 'finalizado' }, ...resultado } });
  } catch(e){ 
    console.error('finalizarSesionQuiz', e); 
    const status = e?.response?.status || 500;
    const msg = e?.message || 'Error interno';
    res.status(status).json({ message: msg, ...(e?.details && { details: e.details }) });
  }
};

// Review detallado por intento: devuelve preguntas, opciones (incluye es_correcta),
// selección del alumno y si acertó por pregunta. Si no se pasa ?intento=, usa el último finalizado.
export const getReviewQuizIntento = async (req, res) => {
  try {
    const { id, id_estudiante } = req.params; // quiz, estudiante
    const intentoQuery = req.query?.intento ? Number(req.query.intento) : null;

    // Validaciones básicas
    const quiz = await Quizzes.getQuizById(id);
    if (!quiz) return res.status(404).json({ message: 'Quiz no encontrado' });

    // Resolver sesión finalizada para el intento solicitado (o el más reciente)
    // Usamos la tabla quizzes_sesiones que guarda intento_num
    let sesion = null;
    const db = (await import('../db.js')).default;
    if (intentoQuery && !Number.isNaN(intentoQuery)) {
      const [rows] = await db.query(
        'SELECT * FROM quizzes_sesiones WHERE id_quiz = ? AND id_estudiante = ? AND intento_num = ? AND estado = "finalizado" LIMIT 1',
        [id, id_estudiante, intentoQuery]
      );
      sesion = rows[0] || null;
    } else {
      // Intentar con columnas finished_at/created_at; si no existen, fallback a ordenar por intento_num y por id
      try {
        const [rows] = await db.query(
          'SELECT * FROM quizzes_sesiones WHERE id_quiz = ? AND id_estudiante = ? AND estado = "finalizado" ORDER BY intento_num DESC, finished_at DESC, created_at DESC LIMIT 1',
          [id, id_estudiante]
        );
        sesion = rows[0] || null;
      } catch (e) {
        if (e?.code === 'ER_BAD_FIELD_ERROR' || e?.errno === 1054) {
          try {
            const [rows2] = await db.query(
              'SELECT * FROM quizzes_sesiones WHERE id_quiz = ? AND id_estudiante = ? AND estado = "finalizado" ORDER BY intento_num DESC LIMIT 1',
              [id, id_estudiante]
            );
            sesion = rows2[0] || null;
          } catch {
            const [rows3] = await db.query(
              'SELECT * FROM quizzes_sesiones WHERE id_quiz = ? AND id_estudiante = ? AND estado = "finalizado" ORDER BY id DESC LIMIT 1',
              [id, id_estudiante]
            );
            sesion = rows3[0] || null;
          }
        } else {
          throw e;
        }
      }
    }
    if (!sesion) return res.status(404).json({ message: 'No hay sesión finalizada para mostrar' });

    const intento_num = sesion.intento_num;

    // Cargar banco de preguntas y opciones (incluyendo es_correcta)
    const preguntas = await QQ.listPreguntasQuiz(id);
    const preguntasOut = [];
    for (const p of preguntas) {
      const opciones = await QQ.listOpcionesPregunta(p.id);
      preguntasOut.push({ ...p, opciones });
    }

    // Respuestas de la sesión
    const respuestas = await QQ.listRespuestasSesion(sesion.id);

    // Armar salida pregunta por pregunta
    const detalle = preguntasOut.map((p) => {
      const resps = respuestas.filter((r) => r.id_pregunta === p.id);
      const seleccionadas = resps.map((r) => r.id_opcion).filter(Boolean);
      const valor_texto = resps.find((r) => r.valor_texto)?.valor_texto || null;
      const tiempo_ms = resps.reduce((s, r) => s + (Number(r.tiempo_ms || 0)), 0) || null;
      const correctasIds = (p.opciones || []).filter((o) => o.es_correcta === 1).map((o) => o.id);
      // Flag correcta: usar columna correcta en respuestas si existe, de lo contrario comparar conjuntos
      let correcta = false;
      if (resps.some((r) => r.correcta === 1)) {
        correcta = true;
      } else {
        if (p.tipo === 'multi_respuesta') {
          correcta = seleccionadas.length === correctasIds.length && seleccionadas.every((id) => correctasIds.includes(id));
        } else if (p.tipo === 'opcion_multiple' || p.tipo === 'verdadero_falso') {
          correcta = seleccionadas.length === 1 && correctasIds.includes(seleccionadas[0]);
        }
      }
      return {
        id: p.id,
        orden: p.orden,
        enunciado: p.enunciado,
        tipo: p.tipo,
        puntos: p.puntos,
        opciones: (p.opciones || []).map((o) => ({ id: o.id, texto: o.texto, es_correcta: o.es_correcta })),
        seleccionadas,
        valor_texto,
        correcta,
        tiempo_ms,
      };
    });

    // Resumen del intento (de quizzes_intentos) para ese intento_num
    let resumen = null;
    try {
      const [row] = await db.query(
        'SELECT * FROM quizzes_intentos WHERE id_quiz = ? AND id_estudiante = ? AND intent_number = ? LIMIT 1',
        [id, id_estudiante, intento_num]
      );
      resumen = row[0] || null;
    } catch (e) {
      if (e?.code === 'ER_BAD_FIELD_ERROR' || e?.errno === 1054) {
        // Fallback: si no existe intent_number, tomamos el intento más reciente por id
        const [rows] = await db.query(
          'SELECT * FROM quizzes_intentos WHERE id_quiz = ? AND id_estudiante = ? ORDER BY id DESC LIMIT 1',
          [id, id_estudiante]
        );
        resumen = rows[0] || null;
      }
    }

    res.json({
      data: {
        intento: intento_num,
        sesion: { id: sesion.id, finished_at: sesion.finished_at },
        resumen,
        preguntas: detalle,
      },
    });
  } catch (e) {
    console.error('getReviewQuizIntento', e);
    res.status(500).json({ message: 'Error interno' });
  }
};
