import { buildAnalytics } from '../models/quizzes_analytics.model.js';

// GET /quizzes/:id/analitica/:id_estudiante
export const getQuizAnalytics = async (req, res) => {
  try {
    const { id, id_estudiante } = req.params;
    if(!id_estudiante) return res.status(400).json({ message:'id_estudiante requerido'});
    const analytics = await buildAnalytics({ id_quiz: id, id_estudiante });
    if(!analytics) return res.status(404).json({ message:'Quiz no encontrado'});
    res.json({ data: analytics });
  } catch(e){
    console.error('getQuizAnalytics', e); res.status(500).json({ message:'Error interno'});
  }
};
