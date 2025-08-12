import axios from "./axios.js";

export const registerRequest = user => axios.post(`/register`, user);

export const adminRegisterRequest = (formData) => axios.post('/admin/register', formData, {
	headers: { 'Content-Type': 'multipart/form-data' }
});

export const getBootstrapStatus = () => axios.get('/admin/bootstrap-status');

export const adminBootstrapRegister = (formData) => axios.post('/admin/register-bootstrap', formData, {
	headers: { 'Content-Type': 'multipart/form-data' }
});

export const loginRequest = user => axios.post(`/login`, user);

export const verifyTokenRequest = () => axios.get('/verify');

export const logoutRequest = () => axios.post('/logout');

// Admin profile APIs
export const getAdminProfileRequest = () => axios.get('/admin/profile');
export const updateAdminProfileRequest = (data) => axios.put('/admin/profile', data);
export const updateAdminPhotoRequest = (file) => {
	const formData = new FormData();
	formData.append('foto', file);
	return axios.put('/admin/profile/foto', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

// Seguridad admin
export const changeAdminPasswordRequest = (data) => axios.put('/admin/change-password', data);
export const softDeleteAdminSelfRequest = (data) => axios.post('/admin/soft-delete', data);
// Admin security configuration
export const getAdminConfigRequest = () => axios.get('/admin/config');
export const updateAdminConfigRequest = (data) => axios.put('/admin/config', data);

// Admin dashboard metrics (includes pagosPendientes)
export const getAdminDashboardMetricsRequest = () => axios.get('/admin/dashboard/metrics');