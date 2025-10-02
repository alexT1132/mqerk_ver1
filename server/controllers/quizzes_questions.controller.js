import * as QQ from '../models/quizzes_questions.model.js';
import * as Quizzes from '../models/quizzes_intentos.model.js';

// Lista completa (preguntas + opciones) de un quiz (sin marcar correctas en la respuesta pública)
export const listPreguntasQuiz = async (req, res) => {
  try {
    const { id } = req.params; // id quiz
    const quiz = await Quizzes.getQuizById(id);
    if (!quiz || !quiz.activo) return res.status(404).json({ message: 'Quiz no encontrado' });
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

// Crear sesión (inicio de intento aún no contabilizado en quizzes_intentos hasta finalizar)
export const crearSesionQuiz = async (req, res) => {
  try {
    const { id } = req.params; // quiz
    const { id_estudiante } = req.body;
    if(!id_estudiante) return res.status(400).json({ message:'id_estudiante requerido'});
    const quiz = await Quizzes.getQuizById(id);
    if(!quiz || !quiz.activo) return res.status(404).json({ message:'Quiz no encontrado'});
    // determinar número de intento proyectado
    const totalPrevios = await Quizzes.contarIntentosQuizEstudiante(id, id_estudiante);
    if (quiz.max_intentos && totalPrevios >= quiz.max_intentos) {
      return res.status(400).json({ message:'Max intentos alcanzado'});
    }
    const sesion = await QQ.crearSesion({ id_quiz: id, id_estudiante, intento_num: totalPrevios + 1, tiempo_limite_seg: quiz.tiempo_limite_seg || null });
    res.status(201).json({ data: sesion });
  } catch(e){ console.error('crearSesionQuiz', e); res.status(500).json({ message:'Error interno'}); }
};

// Registrar respuestas (batch) - id_sesion path param
export const registrarRespuestasSesion = async (req, res) => {
  try {
    const { id_sesion } = req.params;
    const { respuestas } = req.body; // [{id_pregunta, id_opcion, tiempo_ms}]
    if(!Array.isArray(respuestas)) return res.status(400).json({ message:'respuestas debe ser array'});
    const sesion = await QQ.getSesion(id_sesion);
    if(!sesion || sesion.estado !== 'en_progreso') return res.status(404).json({ message:'Sesión no válida'});
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
    const preguntas = await QQ.listPreguntasQuiz(sesion.id_quiz);
    const resultado = await QQ.finalizarSesion({ sesion, preguntas });
    // Calcular duración aproximada (segundos) usando timestamps de la sesión
    let tiempo_segundos = null;
    try {
      const created = new Date(sesion.created_at);
      const finished = new Date(); // finalizado ahora; finished_at aún no re-leído
      tiempo_segundos = Math.max(1, Math.round((finished - created)/1000));
    } catch { /* ignore */ }
    // Insertar intento definitivo con tiempo
    await Quizzes.crearIntentoQuiz({ id_quiz: sesion.id_quiz, id_estudiante: sesion.id_estudiante, puntaje: resultado.puntaje, tiempo_segundos, total_preguntas: resultado.total_preguntas, correctas: resultado.correctas });
    res.json({ data: { sesion: { id: sesion.id, estado: 'finalizado' }, ...resultado } });
  } catch(e){ console.error('finalizarSesionQuiz', e); res.status(500).json({ message:'Error interno'}); }
};
