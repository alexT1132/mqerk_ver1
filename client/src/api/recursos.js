import axios from './axios.js';

/**
 * API para recursos educativos del asesor
 */

// Listar todos los recursos del asesor
export const listRecursos = () => axios.get('/asesores/resources');

// Obtener un recurso por ID
export const getRecurso = (id) => axios.get(`/asesores/resources/${id}`);

// Crear nuevo recurso (con archivo)
export const createRecurso = (formData) => 
  axios.post('/asesores/resources', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

// Actualizar recurso (solo metadatos: título, descripción, tags)
export const updateRecurso = (id, data) => 
  axios.put(`/asesores/resources/${id}`, data);

// Eliminar recurso
export const deleteRecurso = (id) => 
  axios.delete(`/asesores/resources/${id}`);

// Descargar recurso
export const downloadRecurso = (id) => 
  axios.get(`/asesores/resources/${id}/download`, {
    responseType: 'blob'
  });

