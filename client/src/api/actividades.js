import api from './axios';

// Endpoints para actividades (single submission)
export const listActividades = (params={}) => api.get('/actividades', { params });
export const getActividad = (id) => api.get(`/actividades/${id}`);
export const resumenActividadesEstudiante = (id_estudiante) => api.get(`/actividades/estudiante/${id_estudiante}/resumen`);
export const getEntregaActual = (id_actividad, id_estudiante) => api.get(`/actividades/${id_actividad}/entregas/${id_estudiante}`);
export const crearOReemplazarEntrega = (id_actividad, formData) => api.post(`/actividades/${id_actividad}/entregas`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const agregarEntrega = (id_actividad, formData) => api.post(`/actividades/${id_actividad}/entregas/agregar`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const calificarEntrega = (id_entrega, data) => api.put(`/actividades/entregas/${id_entrega}/calificar`, data);
export const listEntregasActividad = (id_actividad, params={}) => api.get(`/actividades/${id_actividad}/entregas`, { params });
export const listEntregasEstudiante = (id_estudiante, params={}) => api.get(`/actividades/entregas/estudiante/${id_estudiante}`, { params });
// Archivos múltiples de una entrega
export const listArchivosEntrega = (entregaId) => api.get(`/actividades/entregas/${entregaId}/archivos`);
export const addArchivoEntrega = (entregaId, formData) => api.post(`/actividades/entregas/${entregaId}/archivos`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteArchivoEntrega = (entregaId, archivoId) => api.delete(`/actividades/entregas/${entregaId}/archivos/${archivoId}`);
// Crear / actualizar actividades (asesor)
export const createActividad = (data) => {
	if (data instanceof FormData) {
		return api.post('/actividades', data, { headers: { 'Content-Type': 'multipart/form-data' } });
	}
	return api.post('/actividades', data);
};
export const updateActividad = (id, data) => {
	if (data instanceof FormData) {
		return api.put(`/actividades/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
	}
	return api.put(`/actividades/${id}`, data);
};
