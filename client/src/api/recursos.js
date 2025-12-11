import axios from './axios.js';

/**
 * API para recursos educativos
 */

// ========== RECURSOS DEL ASESOR ==========
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

// ========== RECURSOS DE ALUMNOS ==========
// Listar todos los recursos de alumnos (visibles para todos)
export const listRecursosAlumnos = () => axios.get('/student-resources');

// Obtener un recurso de alumno por ID
export const getRecursoAlumno = (id) => axios.get(`/student-resources/${id}`);

// Crear nuevo recurso de alumno (con archivo)
export const createRecursoAlumno = (formData) => 
  axios.post('/student-resources', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

// Actualizar recurso de alumno
export const updateRecursoAlumno = (id, data) => 
  axios.put(`/student-resources/${id}`, data);

// Eliminar recurso de alumno
export const deleteRecursoAlumno = (id) => 
  axios.delete(`/student-resources/${id}`);

// Descargar recurso de alumno
export const downloadRecursoAlumno = (id) => 
  axios.get(`/student-resources/${id}/download`, {
    responseType: 'blob'
  });

// ========== RECURSOS DEL ADMINISTRADOR ==========
// Listar todos los recursos del administrador (visibles para todos los asesores)
export const listRecursosAdmin = () => axios.get('/admin-resources');

// Obtener un recurso del admin por ID
export const getRecursoAdmin = (id) => axios.get(`/admin-resources/${id}`);

// Crear nuevo recurso del admin (con archivo) - solo admin
export const createRecursoAdmin = (formData) => 
  axios.post('/admin-resources', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

// Actualizar recurso del admin - solo admin
export const updateRecursoAdmin = (id, data) => 
  axios.put(`/admin-resources/${id}`, data);

// Eliminar recurso del admin - solo admin
export const deleteRecursoAdmin = (id) => 
  axios.delete(`/admin-resources/${id}`);

// Descargar recurso del admin
export const downloadRecursoAdmin = (id) => 
  axios.get(`/admin-resources/${id}/download`, {
    responseType: 'blob'
  });

// ========== RECURSOS DEL ASESOR (PARA ESTUDIANTES) ==========
// Listar recursos del asesor del estudiante
export const listRecursosAsesor = () => axios.get('/estudiantes/recursos/asesor');

// Descargar recurso del asesor
export const downloadRecursoAsesor = (id) => 
  axios.get(`/estudiantes/recursos/asesor/${id}/download`, {
    responseType: 'blob'
  });

