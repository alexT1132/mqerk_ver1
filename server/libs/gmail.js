import { google } from 'googleapis';

export function getOAuth2Client() {
  // Sanitize to avoid accidental quotes or spaces from OS env
  const dequote = (v) => (v || '').toString().trim().replace(/^['"]|['"]$/g, '');
  const clientId = dequote(process.env.GOOGLE_CLIENT_ID);
  const clientSecret = dequote(process.env.GOOGLE_CLIENT_SECRET);
  const redirectUri = dequote(process.env.GOOGLE_REDIRECT_URI) || 'http://localhost:1002/api/admin/gmail/oauth2/callback';
  if (!clientId || !clientSecret) throw new Error('Gmail OAuth: faltan GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET en variables de entorno');
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function getGmailClient(tokens) {
  const oAuth2Client = getOAuth2Client();
  oAuth2Client.setCredentials(tokens);
  return google.gmail({ version: 'v1', auth: oAuth2Client });
}

export function generateAuthUrl() {
  const oAuth2Client = getOAuth2Client();
  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send'
  ];
  return oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
  });
}

export async function getTokensFromCode(code) {
  const oAuth2Client = getOAuth2Client();
  const { tokens } = await oAuth2Client.getToken(code);
  return tokens; // contains refresh_token (first consent), access_token, expiry_date
}
