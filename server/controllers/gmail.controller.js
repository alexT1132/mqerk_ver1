import { generateAuthUrl, getTokensFromCode, getGmailClient, getOAuth2Client } from '../libs/gmail.js';
import { getGmailTokens, saveGmailTokens } from '../models/admin_config.model.js';

// Mantenemos un pequeño cache en memoria, pero la fuente de verdad es DB
let TOKENS_CACHE = null; // { access_token, refresh_token, expiry_date }

export const gmailAuthUrl = async (req, res) => {
  try {
    const url = generateAuthUrl();
    res.json({ ok: true, url });
  } catch (e) {
    console.error('gmailAuthUrl', e);
    res.status(500).json({ ok: false, message: 'Error generando URL de autorización' });
  }
};

export const gmailOAuthCallback = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).send('Falta parámetro code');
    const tokens = await getTokensFromCode(code);
    TOKENS_CACHE = tokens;
    // Obtener email del perfil para mostrar en UI (opcional)
    try {
      const auth = getOAuth2Client();
      auth.setCredentials(tokens);
      const gmail = getGmailClient(tokens);
      // El endpoint de perfil en Gmail API no es directo; omitimos el email y guardamos tokens
      await saveGmailTokens({
        email: null,
        refresh_token: tokens.refresh_token || null,
        access_token: tokens.access_token || null,
        expiry_date: tokens.expiry_date || null,
      });
    } catch {}
    return res.send('Autorización exitosa. Ya puedes cerrar esta pestaña y volver a la app.');
  } catch (e) {
    console.error('gmailOAuthCallback', e);
    res.status(500).send('Error en el callback de OAuth2');
  }
};

export const gmailListInbox = async (req, res) => {
  try {
    // Obtener tokens desde cache o DB
    if (!TOKENS_CACHE) TOKENS_CACHE = await getGmailTokens();
    const tokens = TOKENS_CACHE;
    if (!tokens || (!tokens.access_token && !tokens.refresh_token)) {
      return res.status(400).json({ ok: false, message: 'Vincula Gmail primero (OAuth)' });
    }
    // Refrescar si es necesario
    if (tokens.refresh_token) {
      try {
        const auth = getOAuth2Client();
        auth.setCredentials({ refresh_token: tokens.refresh_token });
        const refreshed = await auth.getAccessToken();
        if (refreshed?.token) {
          tokens.access_token = refreshed.token;
          // Google no siempre devuelve nueva expiry; conservamos la previa si existe
          await saveGmailTokens({ access_token: tokens.access_token });
        }
      } catch {}
    }
    const gmail = getGmailClient(tokens);
    const { data } = await gmail.users.messages.list({ userId: 'me', q: '', maxResults: 10, labelIds: ['INBOX'] });
    const messages = data.messages || [];
    const detailed = [];
    for (const m of messages) {
      const { data: msg } = await gmail.users.messages.get({ userId: 'me', id: m.id, format: 'metadata', metadataHeaders: ['From','To','Subject','Date'] });
      const headers = Object.fromEntries((msg.payload?.headers || []).map(h => [h.name, h.value]));
      detailed.push({
        id: msg.id,
        de: headers.From || '',
        para: headers.To || '',
        asunto: headers.Subject || '(sin asunto)',
        fecha: headers.Date || '',
        mensaje: (msg.snippet || '').trim(),
        leido: (msg.labelIds || []).includes('UNREAD') ? false : true,
        tipo: 'recibido',
        etiqueta: 'gmail'
      });
    }
    res.json({ ok: true, data: detailed });
  } catch (e) {
    console.error('gmailListInbox', e);
    res.status(500).json({ ok: false, message: 'Error listando Gmail' });
  }
};

export const gmailSend = async (req, res) => {
  try {
    if (!TOKENS_CACHE) TOKENS_CACHE = await getGmailTokens();
    const tokens = TOKENS_CACHE;
    if (!tokens || (!tokens.access_token && !tokens.refresh_token)) {
      return res.status(400).json({ ok: false, message: 'Vincula Gmail primero (OAuth)' });
    }
    // Refrescar si es necesario
    if (tokens.refresh_token) {
      try {
        const auth = getOAuth2Client();
        auth.setCredentials({ refresh_token: tokens.refresh_token });
        const refreshed = await auth.getAccessToken();
        if (refreshed?.token) {
          tokens.access_token = refreshed.token;
          await saveGmailTokens({ access_token: tokens.access_token });
        }
      } catch {}
    }
    const { to, subject, text } = req.body;
    if (!to || !subject || !text) return res.status(400).json({ ok: false, message: 'to, subject y text son requeridos' });
    const gmail = getGmailClient(tokens);
    const message = [
      `To: ${to}`,
      'Content-Type: text/plain; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${subject}`,
      '',
      text,
    ].join('\n');
    const encodedMessage = Buffer.from(message, 'utf-8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    await gmail.users.messages.send({ userId: 'me', requestBody: { raw: encodedMessage } });
    res.json({ ok: true });
  } catch (e) {
    console.error('gmailSend', e);
    res.status(500).json({ ok: false, message: 'Error enviando correo Gmail' });
  }
};

export const gmailStatus = async (req, res) => {
  try {
    if (!TOKENS_CACHE) TOKENS_CACHE = await getGmailTokens();
    const t = TOKENS_CACHE;
    const linked = !!(t && (t.refresh_token || t.access_token));
    return res.json({ ok: true, linked, email: t?.email || null });
  } catch (e) {
    return res.status(500).json({ ok: false, linked: false });
  }
};
