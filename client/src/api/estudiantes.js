import axios from "./axios.js";

export const CreateRequest = estudiante => axios.post('/estudiantes', estudiante);

export const getEstudiantesRequest = () => axios.get('/estudiantes');

export const registerRequest = user => axios.post('/register', user);

export const loginRequest = user => axios.post(`/login`, user);

export const verifyTokenRequest = () => axios.get('/verify');

export const getFolioRequest = () => axios.get('/folio');