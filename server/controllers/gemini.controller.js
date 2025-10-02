import fetch from 'node-fetch';

// Simple helper to redact API key in logs
const redact = (s = '') => (typeof s === 'string' && s.length > 8 ? s.slice(0, 4) + '...' + s.slice(-2) : '(unset)');

// POST /api/ai/gemini/generate
// Body: { contents, generationConfig, safetySettings, model }
export const geminiGenerate = async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY missing on server' });
    }

    const {
      contents,
      generationConfig = { temperature: 0.7, maxOutputTokens: 1500 },
      safetySettings = [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
      ],
      model = 'gemini-2.0-flash'
    } = req.body || {};

    if (!Array.isArray(contents) || contents.length === 0) {
      return res.status(400).json({ error: 'contents is required' });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

    // Optional: small local timeout
    const ac = new AbortController();
    const timeout = setTimeout(() => ac.abort(), 30000);
    let response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({ contents, generationConfig, safetySettings }),
        signal: ac.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      // Avoid leaking key
      console.error('[Gemini] Error', response.status, data?.error?.message || data); 
      return res.status(response.status).json({ error: data?.error?.message || 'Gemini error', status: response.status, raw: data });
    }
    res.json(data);
  } catch (e) {
    if (e.name === 'AbortError') return res.status(504).json({ error: 'Upstream timeout' });
    console.error('[Gemini] Proxy failure:', e?.message);
    res.status(500).json({ error: 'Internal error' });
  }
};

// GET /api/ai/gemini/models
export const geminiListModels = async (_req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY missing on server' });
    }
    const url = 'https://generativelanguage.googleapis.com/v1beta/models';
    const response = await fetch(url, {
      headers: { 'x-goog-api-key': apiKey }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error('[Gemini] Models error', response.status, data?.error?.message || data);
      return res.status(response.status).json({ error: data?.error?.message || 'Gemini error', status: response.status, raw: data });
    }
    res.json(data);
  } catch (e) {
    console.error('[Gemini] Models failure:', e?.message);
    res.status(500).json({ error: 'Internal error' });
  }
};
