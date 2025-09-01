import { generateAuthUrl, getTokensFromCode, getGmailClient, getOAuth2Client } from '../libs/gmail.js';
import { getGmailTokens, saveGmailTokens, clearGmailTokens } from '../models/admin_config.model.js';

// Mantenemos un pequeño cache en memoria, pero la fuente de verdad es DB
let TOKENS_CACHE = null; // { access_token, refresh_token, expiry_date }

// Helper: check minimal env configuration to avoid throwing inside libs
function isGmailEnvConfigured() {
  const dequote = (v) => (v || '').toString().trim().replace(/^['"]|['"]$/g, '');
  const id = dequote(process.env.GOOGLE_CLIENT_ID);
  const secret = dequote(process.env.GOOGLE_CLIENT_SECRET);
  return !!(id && secret);
}

export const gmailAuthUrl = async (req, res) => {
  try {
    if (!isGmailEnvConfigured()) {
      return res.status(400).json({ ok: false, message: 'Gmail no está configurado en el servidor (faltan GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET)' });
    }
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
    if (!isGmailEnvConfigured()) {
      return res.status(400).json({ ok: false, message: 'Gmail no está configurado en el servidor (faltan GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET)' });
    }
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
      } catch (err) {
        // Refresh falló probablemente por invalid_grant => forzar re-vinculación limpia
        try { await clearGmailTokens(); } catch {}
        TOKENS_CACHE = null;
        return res.status(401).json({ ok: false, message: 'Autorización Gmail inválida o expirada. Vuelve a vincular tu cuenta.' });
      }
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
    // Intenta mapear errores comunes a respuestas más claras
    const status = e?.response?.status || e?.code;
    const msg = e?.message || e?.response?.data?.error || 'Error listando Gmail';
    console.error('gmailListInbox', msg);
    // Invalid or insufficient auth => pedir re-vinculación
    if (status === 401 || status === 403 || /invalid_grant|unauthorized|insufficient/i.test(msg)) {
      try { await clearGmailTokens(); } catch {}
      TOKENS_CACHE = null;
      return res.status(401).json({ ok: false, message: 'No autorizado en Gmail. Vuelve a vincular tu cuenta.' });
    }
    // Errores de red conocidos
    if (/ENOTFOUND|ECONNREFUSED|EAI_AGAIN|network/i.test(String(status) + ' ' + msg)) {
      return res.status(502).json({ ok: false, message: 'No se pudo contactar al servicio de Gmail (red).' });
    }
    res.status(500).json({ ok: false, message: 'Error listando Gmail' });
  }
};

export const gmailSend = async (req, res) => {
  try {
    if (!isGmailEnvConfigured()) {
      return res.status(400).json({ ok: false, message: 'Gmail no está configurado en el servidor (faltan GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET)' });
    }
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
      } catch (err) {
        try { await clearGmailTokens(); } catch {}
        TOKENS_CACHE = null;
        return res.status(401).json({ ok: false, message: 'Autorización Gmail inválida o expirada. Vuelve a vincular tu cuenta.' });
      }
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
    const status = e?.response?.status || e?.code;
    const msg = e?.message || e?.response?.data?.error || 'Error enviando Gmail';
    console.error('gmailSend', msg);
    if (status === 401 || status === 403 || /invalid_grant|unauthorized|insufficient/i.test(msg)) {
      try { await clearGmailTokens(); } catch {}
      TOKENS_CACHE = null;
      return res.status(401).json({ ok: false, message: 'No autorizado en Gmail. Vuelve a vincular tu cuenta.' });
    }
    res.status(500).json({ ok: false, message: 'Error enviando correo Gmail' });
  }
};

export const gmailStatus = async (req, res) => {
  try {
    if (!TOKENS_CACHE) TOKENS_CACHE = await getGmailTokens();
    const t = TOKENS_CACHE;
    const linked = !!(t && (t.refresh_token || t.access_token));
  const envOk = isGmailEnvConfigured();
  return res.json({ ok: true, linked, email: t?.email || null, envOk });
  } catch (e) {
  const envOk = isGmailEnvConfigured();
  return res.status(500).json({ ok: false, linked: false, envOk });
  }
};
