import api from './axios';

export const getGmailAuthUrl = async () => {
  const { data } = await api.get('/admin/gmail/auth-url');
  return data?.url;
};

export const listGmailInbox = async () => {
  const { data } = await api.get('/admin/gmail/inbox');
  return data?.data || [];
};

export const sendGmail = async ({ to, subject, text }) => {
  const { data } = await api.post('/admin/gmail/send', { to, subject, text });
  return data?.ok;
};

export const getGmailStatus = async () => {
  const { data } = await api.get('/admin/gmail/status');
  return data; // { ok, linked, email }
};

// Simple diagnostics to verify server-side env is correctly loaded
export const getGmailEnvCheck = async () => {
  try {
    const { data } = await api.get('/admin/gmail/env-check');
    return data; // { ok, hasId, hasSecret, maskedClientId, redirectUri }
  } catch (e) {
    return { ok: false };
  }
};
