import axios from "./axios.js";

export const verifyUserRequest = usuario => axios.post('/verifyUser', usuario);

export const registerRequest = user => axios.post('/register', user);

export const getUsersRequest = () => axios.get('/users');

export const loginRequest = user => axios.post(`/login`, user);

export const verifyTokenRequest = () => axios.get('/verify');