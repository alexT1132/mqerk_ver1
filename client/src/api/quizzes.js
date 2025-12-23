// Usa el instance centralizado que ya resuelve host dinámico y puerto 1002
import api from './axios';

export const listQuizzes = async (params = {}) => api.get('/quizzes', { params });
export const createQuiz = async (payload) => api.post('/quizzes', payload);
export const getQuiz = async (id) => api.get(`/quizzes/${id}`);
export const getQuizFull = async (id) => api.get(`/quizzes/${id}/full`);
export const updateQuiz = async (id, payload) => api.put(`/quizzes/${id}`, payload);
export const deleteQuiz = async (id) => api.delete(`/quizzes/${id}`);
export const crearIntentoQuiz = async (id, payload) => api.post(`/quizzes/${id}/intentos`, payload);
export const listIntentosQuizEstudiante = async (id, id_estudiante) => api.get(`/quizzes/${id}/intentos/${id_estudiante}`);
export const resumenQuizzesEstudiante = async (id_estudiante) => api.get(`/quizzes/estudiante/${id_estudiante}/resumen`);
export const getQuizIntentoReview = async (id_quiz, id_estudiante, intentoNum) => api.get(`/quizzes/${id_quiz}/review/${id_estudiante}`, { params: intentoNum ? { intento: intentoNum } : {} });
export const getQuizAnalytics = async (id_quiz, id_estudiante) => api.get(`/quizzes/${id_quiz}/analitica/${id_estudiante}`);
export const getQuizEstudiantesEstado = async (id_quiz) => api.get(`/quizzes/${id_quiz}/estudiantes-estado`);

export default {
  listQuizzes,
  createQuiz,
  getQuiz,
  getQuizFull,
  updateQuiz,
  deleteQuiz,
  crearIntentoQuiz,
  listIntentosQuizEstudiante,
  resumenQuizzesEstudiante,
  getQuizIntentoReview
};
