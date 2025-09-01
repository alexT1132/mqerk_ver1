import api from './axios';

export const listReminders = () => api.get('/student/reminders');
export const createReminder = (payload) => api.post('/student/reminders', payload);
export const updateReminder = (id, payload) => api.put(`/student/reminders/${id}`, payload);
export const deleteReminder = (id) => api.delete(`/student/reminders/${id}`);
