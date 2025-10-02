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

// Formularios dinámicos de pruebas (WAIS, Matemática)
export const generarFormularioTest = (preregistroId, tipo) => axios.get(`/asesores/tests/${preregistroId}/form/${encodeURIComponent(tipo)}`);
export const calificarFormularioTest = (preregistroId, tipo, entries) => axios.post(`/asesores/tests/${preregistroId}/form/${encodeURIComponent(tipo)}/grade`, { entries });
