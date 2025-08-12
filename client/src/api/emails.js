import api from './axios';

export const getAdminEmails = async (folder = 'inbox') => {
  const { data } = await api.get(`/admin/emails`, { params: { folder } });
  return data?.data || [];
};

export const sendAdminEmail = async ({ recipient, subject, body, etiqueta }) => {
  const { data } = await api.post(`/admin/emails/send`, { recipient, subject, body, etiqueta });
  return data?.data || null;
};

export const markEmailRead = async (id) => {
  await api.put(`/admin/emails/${id}/read`);
  return true;
};

export const deleteAdminEmail = async (id) => {
  await api.delete(`/admin/emails/${id}`);
  return true;
};
