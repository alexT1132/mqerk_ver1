import axios from "./axios.js";

export const ObtenerCursosRequest = () => axios.get('/cursos');

export const ObtenerCursoRequest = (id) => axios.get(`/cursos/${id}`);

export const createCursoRequest = (curso) => axios.post('/cursos', curso);

export const updateCursoRequest = (id, curso) => axios.put(`/cursos/${id}`, curso);

export const deleteCursoRequest = (id) => axios.delete(`/cursos/${id}`);