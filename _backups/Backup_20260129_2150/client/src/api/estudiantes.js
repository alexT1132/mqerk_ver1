import { buildApiUrl } from '../utils/url.js';

export async function listEstudiantes() {
  const url = buildApiUrl('/estudiantes');
  const res = await fetch(url, { credentials: 'include', cache: 'no-store' });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || 'Error listando estudiantes');
  // Algunos controladores devuelven { data: [...] }
  return Array.isArray(body) ? body : (body.data || []);
}
import axios from "./axios.js";

export const CreateRequest = estudiante => axios.post('/estudiantes', estudiante);

export const getEstudiantesRequest = () => axios.get('/estudiantes');

export const getEstudianteByIdRequest = (id) => axios.get(`/estudiantes/${id}`);

export const updateEstudianteRequest = (id, data) => axios.put(`/estudiantes/${id}`, data);

export const registerRequest = user => axios.post('/register', user);

export const loginRequest = user => axios.post(`/login`, user);

export const verifyTokenRequest = () => axios.get('/verify');

export const getFolioRequest = (curso, anio) => axios.get(`/folio`, { params: { curso, anio } });

export const getGruposConCantidadRequest = (curso, status = 'aprobados') => axios.get(`/grupos/${curso}`, { params: { status } });

// Configuración del alumno
export const getConfigRequest = (idEstudiante) => axios.get(`/estudiantes/${idEstudiante}/config`);
export const upsertConfigRequest = (idEstudiante, data) => axios.put(`/estudiantes/${idEstudiante}/config`, data);

// Cambio de contraseña (usuario)
export const changePasswordRequest = (idUsuario, data) => axios.put(`/usuarios/${idUsuario}/password`, data);

// Actualizar foto del alumno (multipart)
export const updateFotoEstudianteRequest = (idEstudiante, file) => {
	const formData = new FormData();
	formData.append('foto', file);
	return axios.put(`/estudiantes/${idEstudiante}/foto`, formData, {
		headers: { 'Content-Type': 'multipart/form-data' }
	});
};

// Soft delete de cuenta de alumno
export const softDeleteAlumnoRequest = (idEstudiante, data) => axios.post(`/estudiantes/${idEstudiante}/soft-delete`, data || {});