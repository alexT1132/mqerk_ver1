import api from './axios';

// API feedback extendida con soporte de grupos para actividades
export const listTasks = (params={}) => api.get('/feedback/tasks', { params });
export const createTask = (data) => {
	if (data instanceof FormData) {
		return api.post('/feedback/tasks', data, { headers: { 'Content-Type': 'multipart/form-data' } });
	}
	return api.post('/feedback/tasks', data);
};
export const updateTask = (id, data) => {
	if (data instanceof FormData) {
		return api.put(`/feedback/tasks/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
	}
	return api.put(`/feedback/tasks/${id}`, data);
};
export const createSubmission = (formData) => api.post('/feedback/submissions', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const listSubmissionsByStudent = (id_estudiante, params={}) => api.get(`/feedback/submissions/student/${id_estudiante}`, { params });
export const listSubmissionsByTask = (id_task, params={}) => api.get(`/feedback/submissions/task/${id_task}`, { params });
export const updateSubmissionGrade = (id, puntos) => api.put(`/feedback/submissions/${id}/grade`, { puntos });
export const cancelSubmissionApi = (id) => api.delete(`/feedback/submissions/${id}`);
