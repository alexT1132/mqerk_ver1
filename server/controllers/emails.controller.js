import { getByFolder, createEmail, setRead, removeEmail } from '../models/emails.model.js';

export const listAdminEmails = async (req, res) => {
  try {
    const { folder = 'inbox' } = req.query;
    const rows = await getByFolder(folder);
    res.json({ ok: true, data: rows });
  } catch (err) {
    console.error('listAdminEmails error', err);
    res.status(500).json({ ok: false, message: 'Error al obtener emails' });
  }
};

export const sendAdminEmail = async (req, res) => {
  try {
    const { recipient, subject, body, etiqueta } = req.body;
    if (!recipient || !subject || !body) {
      return res.status(400).json({ ok: false, message: 'recipient, subject y body son requeridos' });
    }
    const sender = req.user?.email || 'admin@mqerk.com';
    const saved = await createEmail({ sender, recipient, subject, body, etiqueta });
    res.json({ ok: true, data: saved });
  } catch (err) {
    console.error('sendAdminEmail error', err);
    res.status(500).json({ ok: false, message: 'Error al enviar email' });
  }
};

export const markEmailRead = async (req, res) => {
  try {
    const { id } = req.params;
    const ok = await setRead(id, true);
    if (!ok) return res.status(404).json({ ok: false, message: 'Email no encontrado' });
    res.json({ ok: true });
  } catch (err) {
    console.error('markEmailRead error', err);
    res.status(500).json({ ok: false, message: 'Error al actualizar email' });
  }
};

export const deleteAdminEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const ok = await removeEmail(id);
    if (!ok) return res.status(404).json({ ok: false, message: 'Email no encontrado' });
    res.json({ ok: true });
  } catch (err) {
    console.error('deleteAdminEmail error', err);
    res.status(500).json({ ok: false, message: 'Error al eliminar email' });
  }
};
