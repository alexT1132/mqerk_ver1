import * as Quizzes from '../models/quizzes_intentos.model.js';
import * as Estudiantes from '../models/estudiantes.model.js';

export const listQuizzes = async (req, res) => {
  try { const rows = await Quizzes.listQuizzes(); res.json({ data: rows }); }
  catch(e){ console.error('listQuizzes', e); res.status(500).json({ message:'Error interno'}); }
};

export const getQuiz = async (req, res) => {
  try { const quiz = await Quizzes.getQuizById(req.params.id); if(!quiz) return res.status(404).json({ message:'No encontrado'}); res.json({ data: quiz }); }
  catch(e){ console.error('getQuiz', e); res.status(500).json({ message:'Error interno'}); }
};

export const crearIntentoQuiz = async (req, res) => {
  try {
    const { id } = req.params; const { id_estudiante, puntaje, tiempo_segundos, total_preguntas, correctas } = req.body;
    if(!id_estudiante) return res.status(400).json({ message:'id_estudiante requerido'});
    const quiz = await Quizzes.getQuizById(id); if(!quiz || !quiz.activo) return res.status(404).json({ message:'Quiz no encontrado'});
    const est = await Estudiantes.getEstudianteById(id_estudiante); if(!est) return res.status(404).json({ message:'Estudiante no encontrado'});
    // Limitar intentos
    if(quiz.max_intentos){
      const total = await Quizzes.contarIntentosQuizEstudiante(id, id_estudiante);
      if(total >= quiz.max_intentos) return res.status(400).json({ message:'Max intentos alcanzado'});
    }
    const intento = await Quizzes.crearIntentoQuiz({ id_quiz:id, id_estudiante, puntaje: puntaje ?? 0, tiempo_segundos, total_preguntas, correctas });
    res.status(201).json({ data: intento });
  } catch(e){ console.error('crearIntentoQuiz', e); res.status(500).json({ message:'Error interno'}); }
};

export const listIntentosQuizEstudiante = async (req, res) => {
  try { const rows = await Quizzes.listIntentosQuizEstudiante(req.params.id, req.params.id_estudiante); res.json({ data: rows }); }
  catch(e){ console.error('listIntentosQuizEstudiante', e); res.status(500).json({ message:'Error interno'}); }
};

export const resumenQuizzesEstudiante = async (req, res) => {
  try { const rows = await Quizzes.resumenQuizzesEstudiante(req.params.id_estudiante); res.json({ data: rows }); }
  catch(e){ console.error('resumenQuizzesEstudiante', e); res.status(500).json({ message:'Error interno'}); }
};
