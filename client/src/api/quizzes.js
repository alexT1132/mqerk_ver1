// Usa el instance centralizado que ya resuelve host dinámico y puerto 1002
import api from './axios';

export const listQuizzes = async () => api.get('/quizzes');
export const getQuiz = async (id) => api.get(`/quizzes/${id}`);
export const crearIntentoQuiz = async (id, payload) => api.post(`/quizzes/${id}/intentos`, payload);
export const listIntentosQuizEstudiante = async (id, id_estudiante) => api.get(`/quizzes/${id}/intentos/${id_estudiante}`);
export const resumenQuizzesEstudiante = async (id_estudiante) => api.get(`/quizzes/estudiante/${id_estudiante}/resumen`);

export default {
  listQuizzes,
  getQuiz,
  crearIntentoQuiz,
  listIntentosQuizEstudiante,
  resumenQuizzesEstudiante
};
