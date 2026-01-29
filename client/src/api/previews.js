import axios from "./axios.js";

export const ObtenerPreviewRequest = (id) => axios.get(`/previews/${id}`);

export const createPreviewRequest = (preview) => axios.post('/previews', preview);

export const updatePreviewRequest = (id, preview) => axios.put(`/previews/${id}`, preview);

export const deletePreviewRequest = (id) => axios.delete(`/previews/${id}`);

// Obtener preview por course_id
export const getPreviewByCourseRequest = (courseId) => axios.get(`/previews/by-course/${courseId}`);