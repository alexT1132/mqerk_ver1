import api from './axios';

// QUIZZES (compatibilidad): mantener estos nombres apuntando a /quizzes para no romper secciones existentes
export const listPreguntasQuiz = async (quizId) => api.get(`/quizzes/${quizId}/preguntas`);
export const crearSesionQuiz = async (quizId, payload) => api.post(`/quizzes/${quizId}/sesiones`, payload);
export const enviarRespuestasSesion = async (sesionId, respuestas) => api.post(`/quizzes/sesiones/${sesionId}/respuestas`, { respuestas });
// Permite enviar payload opcional con metadatos (e.g., elapsed_ms, started_at, finished_at)
export const finalizarSesionQuiz = async (sesionId, payload) => api.post(`/quizzes/sesiones/${sesionId}/finalizar`, payload);

// SIMULACIONES (backend separado) - usar estos nuevos nombres en el módulo de Simulaciones
export const listPreguntasSimulacion = async (simId) => api.get(`/simulaciones/${simId}/preguntas`);
export const crearSesionSimulacion = async (simId, payload) => api.post(`/simulaciones/${simId}/sesiones`, payload);
export const enviarRespuestasSesionSimulacion = async (sesionId, respuestas) => api.post(`/simulaciones/sesiones/${sesionId}/respuestas`, { respuestas });
export const finalizarSesionSimulacion = async (sesionId, payload) => api.post(`/simulaciones/sesiones/${sesionId}/finalizar`, payload);

// Wrappers específicos de simulaciones (lista/resumen/intentos)
export const listSimulaciones = async (params = {}) => api.get('/simulaciones', { params });
export const resumenSimulacionesEstudiante = async (id_estudiante) => api.get(`/simulaciones/estudiante/${id_estudiante}/resumen`);
export const listIntentosSimulacionEstudiante = async (id_simulacion, id_estudiante) => api.get(`/simulaciones/${id_simulacion}/intentos/${id_estudiante}`);

// CRUD para asesores/admin
export const createSimulacion = async (payload) => api.post('/simulaciones', payload);
export const updateSimulacion = async (id, payload) => api.put(`/simulaciones/${id}`, payload);
export const deleteSimulacion = async (id) => api.delete(`/simulaciones/${id}`);
export const getSimulacion = async (id) => api.get(`/simulaciones/${id}`);
export const getSimulacionFull = async (id) => api.get(`/simulaciones/${id}/full`);
export const getSimulacionIntentoReview = async (id_simulacion, id_estudiante, intentoNum) => api.get(`/simulaciones/${id_simulacion}/review/${id_estudiante}`, { params: intentoNum ? { intento: intentoNum } : {} });

export default {
  // quizzes compat
  listPreguntasQuiz,
  crearSesionQuiz,
  enviarRespuestasSesion,
  finalizarSesionQuiz,
  // simulaciones
  listPreguntasSimulacion,
  crearSesionSimulacion,
  enviarRespuestasSesionSimulacion,
  finalizarSesionSimulacion,
  listSimulaciones,
  resumenSimulacionesEstudiante,
  listIntentosSimulacionEstudiante
  ,
  // admin
  createSimulacion,
  updateSimulacion,
  deleteSimulacion,
  getSimulacion,
  getSimulacionFull
  ,getSimulacionIntentoReview
};