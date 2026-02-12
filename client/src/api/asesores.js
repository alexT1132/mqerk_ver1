import axios from './axios.js';

// Obtener preregistro (datos básicos)
export const getPreRegistro = (id) => axios.get(`/asesores/preregistro/${id}`);
// Actualizar preregistro
export const updatePreRegistro = (id, data) => axios.put(`/asesores/preregistro/${id}`, data);
// Obtener perfil completo
export const getPerfil = (preregistroId) => axios.get(`/asesores/perfil/${preregistroId}`);
// Guardar/crear o update perfil
export const savePerfil = (preregistroId, data) => axios.post(`/asesores/perfil/${preregistroId}`, data);
// Subir documentos (FormData con campos de archivo)
export const uploadPerfilDocs = (preregistroId, formData) => axios.post(`/asesores/perfil/${preregistroId}/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
// Finalizar proceso
export const finalizarProceso = (preregistroId) => axios.post(`/asesores/finalizar/${preregistroId}`);
// Estudiantes del asesor autenticado (aprobados)
// Acepta opcionalmente { grupo } para filtrar por un grupo específico del asesor
export const getMisEstudiantes = (params) => axios.get('/asesores/mis-estudiantes', { params });
// Grupos del asesor autenticado con cantidad de estudiantes
export const getMisGrupos = () => axios.get('/asesores/mis-grupos');

// Formularios dinámicos de pruebas (WAIS, Matemática)
export const generarFormularioTest = (preregistroId, tipo) => axios.get(`/asesores/tests/${preregistroId}/form/${encodeURIComponent(tipo)}`);
export const calificarFormularioTest = (preregistroId, tipo, entries) => axios.post(`/asesores/tests/${preregistroId}/form/${encodeURIComponent(tipo)}/grade`, { entries });

// Admin: resetear contraseña de un asesor sin requerir la actual
export const resetPasswordAsesorAdmin = (payload) => axios.post('/admin/asesores/reset-password', payload);

// Recordatorios personales del asesor
export const listRemindersPersonal = () => axios.get('/asesores/reminders/personal');
export const createReminderPersonal = (data) => axios.post('/asesores/reminders/personal', data);
export const updateReminderPersonal = (id, data) => axios.put(`/asesores/reminders/personal/${id}`, data);
export const deleteReminderPersonal = (id) => axios.delete(`/asesores/reminders/personal/${id}`);

// Recordatorios para estudiantes
export const createReminderForStudents = (data) => axios.post('/asesores/reminders/students', data);
export const listRemindersForStudents = () => axios.get('/asesores/reminders/students');
export const deleteReminderForStudents = (id) => axios.delete(`/asesores/reminders/students/${id}`);

// Pagos del asesor
export const getMisPagos = (params) => axios.get('/asesores/mis-pagos', { params });

// Configuraciones del asesor autenticado
export const getMiPerfil = () => axios.get('/asesores/mi-perfil');
export const updateMiPerfil = (data) => axios.put('/asesores/mi-perfil', data);
export const updateMiFoto = (formData) => axios.put('/asesores/mi-perfil/foto', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// Notificaciones del asesor autenticado
export const getNotifications = (params) => axios.get('/asesores/notifications', { params });
export const getUnreadCount = () => axios.get('/asesores/notifications/unread-count');
export const markNotificationRead = (id) => axios.put(`/asesores/notifications/${id}/read`);
export const markNotificationUnread = (id) => axios.put(`/asesores/notifications/${id}/unread`);
export const markAllNotificationsRead = () => axios.put('/asesores/notifications/mark-all-read');
export const deleteNotification = (id) => axios.delete(`/asesores/notifications/${id}`);
export const deleteReadNotifications = () => axios.delete('/asesores/notifications/delete-read');
