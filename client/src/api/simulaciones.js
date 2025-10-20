import api from './axios';

export const listPreguntasQuiz = async (quizId) => api.get(`/quizzes/${quizId}/preguntas`);
export const crearSesionQuiz = async (quizId, payload) => api.post(`/quizzes/${quizId}/sesiones`, payload);
export const enviarRespuestasSesion = async (sesionId, respuestas) => api.post(`/quizzes/sesiones/${sesionId}/respuestas`, { respuestas });
export const finalizarSesionQuiz = async (sesionId) => api.post(`/quizzes/sesiones/${sesionId}/finalizar`);

export default {
  listPreguntasQuiz,
  crearSesionQuiz,
  enviarRespuestasSesion,
  finalizarSesionQuiz
};