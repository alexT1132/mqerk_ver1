import api from './axios';

// Student-side
export const createAreaRequest = (payload) => api.post('/student/area-requests', payload);
export const listMyAreaRequests = (params) => api.get('/student/area-requests', { params });
export const listMyAreaPermissions = (params) => api.get('/student/area-permissions', { params });

// Advisor-side
export const listAreaRequests = (params) => api.get('/advisor/area-requests', { params });
export const approveAreaRequest = (id) => api.post(`/advisor/area-requests/${id}/approve`);
export const denyAreaRequest = (id, payload) => api.post(`/advisor/area-requests/${id}/deny`, payload || {});

export default {
  createAreaRequest,
  listMyAreaRequests,
  listMyAreaPermissions,
  listAreaRequests,
  approveAreaRequest,
  denyAreaRequest,
};
