// Servicio aislado para generación de preguntas con IA (Gemini)
// No modifica ni depende del geminiService existente

const PROXY_ENDPOINT = '/api/ai/gemini/generate';
const MODEL = (import.meta?.env?.VITE_GEMINI_MODEL) || 'gemini-2.0-flash';
const TIMEOUT = 30000;
const COOLDOWN_MS = Number(import.meta?.env?.VITE_IA_COOLDOWN_MS || 45000);
const COOLDOWN_KEY = 'ia_cooldown_until';

// Utilidad interna de timeout
const withTimeout = (ms) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return { controller, clear: () => clearTimeout(id) };
};

// Cooldown helpers (persisted)
export const getCooldownRemainingMs = () => {
  try {
    const v = Number(localStorage.getItem(COOLDOWN_KEY) || 0);
    const rem = v - Date.now();
    return rem > 0 ? rem : 0;
  } catch {
    return 0;
  }
};
const startCooldown = () => {
  try { localStorage.setItem(COOLDOWN_KEY, String(Date.now() + COOLDOWN_MS)); } catch {}
};

// Parseo robusto de JSON incrustado en texto
const extractJson = (src) => {
  let t = String(src || '').trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence && fence[1]) t = fence[1].trim();
  const firstBrace = t.indexOf('{');
  if (firstBrace >= 0) {
    let depth = 0, inStr = false, esc = false, end = -1;
    for (let i = firstBrace; i < t.length; i++) {
      const ch = t[i];
      if (inStr) { if (!esc && ch === '"') inStr = false; esc = (!esc && ch === '\\'); continue; }
      if (ch === '"') { inStr = true; esc = false; continue; }
      if (ch === '{') depth++;
      if (ch === '}') depth--;
      if (depth === 0) { end = i; break; }
    }
    if (end !== -1) t = t.slice(firstBrace, end + 1);
  }
  t = t.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/,\s*(\}|\])/g, '$1');
  return JSON.parse(t);
};

// Utilidad: mapear áreas conocidas a lineamientos específicos
const canonArea = (raw) => String(raw || '').trim().toLowerCase();
const areaHints = (area) => {
  const a = canonArea(area);
  if (!a) return { tag: null, directrices: null };
  if (/mate|álgebra|algebra|aritm|geom/.test(a)) {
    return { tag: 'matematica', directrices: (
      '- Favorece cálculo, fracciones, proporciones, ecuaciones simples, porcentajes, regla de tres.\n' +
      '- Evita constantes avanzadas; números enteros/decimales sencillos.\n' +
      '- Las preguntas deben poder resolverse sin calculadora en < 1 minuto.'
    )};
  }
  if (/español|lengua|comunica|lectura|comprensión|gramática/.test(a)) {
    return { tag: 'espanol', directrices: (
      '- Incluye ortografía básica, sinónimos/antónimos, comprensión de lectura corta, clases de palabras.\n' +
      '- Evita tecnicismos; prioriza claridad y contexto.'
    )};
  }
  if (/física|fisica/.test(a)) {
    return { tag: 'fisica', directrices: (
      '- Cinemática básica, unidades SI, fuerzas simples, energía.\n' +
      '- Evita fórmulas no vistas; usa magnitudes realistas.'
    )};
  }
  if (/quím|quim/.test(a)) {
    return { tag: 'quimica', directrices: (
      '- Propiedades de la materia, cambios de estado, mezclas y compuestos comunes, tabla periódica básica.'
    )};
  }
  if (/biolog/.test(a)) {
    return { tag: 'biologia', directrices: (
      '- Célula, tejidos, sistemas del cuerpo, ecosistemas, genética básica.'
    )};
  }
  if (/historia|geograf/.test(a)) {
    return { tag: 'ciencias_sociales', directrices: (
      '- Hechos y periodos clave, ubicación geográfica, causas y consecuencias simples.'
    )};
  }
  if (/razonamiento.*(verbal|lect|leng)/.test(a)) {
    return { tag: 'razonamiento_verbal', directrices: (
      '- Analogías, relaciones de palabras, inferencias de enunciados cortos.'
    )};
  }
  if (/razonamiento.*(mate|num|lóg|log)/.test(a)) {
    return { tag: 'razonamiento_matematico', directrices: (
      '- Series numéricas, patrones, problemas lógicos breves.'
    )};
  }
  return { tag: 'general', directrices: null };
};

// Distribución recomendada por tipo según área
const distribucionTipos = (cantidad, tag) => {
  const n = Math.max(1, Number(cantidad) || 5);
  const clamp = (x) => Math.max(0, Math.min(n, Math.floor(x)));
  let multi = Math.round(n * 0.6), tf = Math.round(n * 0.2), short = n - multi - tf;
  if (tag === 'matematica' || tag === 'razonamiento_matematico') {
    multi = Math.round(n * 0.7); tf = Math.round(n * 0.1); short = n - multi - tf;
  } else if (tag === 'espanol' || tag === 'razonamiento_verbal') {
    multi = Math.round(n * 0.5); tf = Math.round(n * 0.2); short = n - multi - tf;
  }
  // Ajuste final por límites
  multi = clamp(multi); tf = clamp(tf); short = clamp(n - multi - tf);
  return { multi, tf, short };
};

// Normalización al contrato del builder, con enforcement de distribución y limpieza
const normalizarPreguntas = (arr, cantidad, dist = null) => {
  const seen = new Set();
  const ensureUniqueText = (t, idx) => {
    let base = String(t || '').trim() || `Pregunta ${idx+1}`;
    let out = base, k = 2;
    while (seen.has(out.toLowerCase())) { out = `${base} (${k++})`; }
    seen.add(out.toLowerCase());
    return out;
  };

  const norm = (Array.isArray(arr) ? arr : []).map((q, i) => {
    const type = String(q.type || '').toLowerCase();
    const points = Number(q.points || 1) || 1;
    if (type === 'multi') {
      let options = Array.isArray(q.options) ? q.options.map(o => ({ text: String(o.text || ''), correct: !!o.correct })) : [];
      // Garantizar 4 opciones y exactamente 1 correcta
      // 1) Normalizar textos
      options = options.map((o, j) => ({ text: o.text || `Opción ${j+1}`, correct: !!o.correct }));
      // 2) Si hay más de 4, truncar; si menos, completar hasta 4
      if (options.length > 4) options = options.slice(0,4);
      const baseLen = options.length;
      for (let k = baseLen; k < 4; k++) options.push({ text: `Opción ${k+1}`, correct: false });
      // 3) Asegurar exactamente una correcta
      const idxCorrect = options.findIndex(o => o.correct);
      if (idxCorrect === -1) {
        options[0].correct = true;
      } else {
        options = options.map((o, j) => ({ ...o, correct: j === idxCorrect }));
      }
      return { order: i + 1, text: ensureUniqueText(q.text, i), type: 'multi', points, options };
    } else if (type === 'tf' || type === 'verdadero_falso') {
      const ans = String(q.answer || '').toLowerCase() === 'false' ? 'false' : 'true';
      return { order: i + 1, text: ensureUniqueText(q.text, i), type: 'tf', points, answer: ans };
    } else {
      return { order: i + 1, text: ensureUniqueText(q.text, i), type: 'short', points, answer: String(q.answer || '') };
    }
  });
  // Aplicar distribución si se especificó
  let out = norm.slice(0, cantidad);
  if (dist && typeof dist === 'object') {
    const need = { multi: dist.multi|0, tf: dist.tf|0, short: dist.short|0 };
    const have = { multi: 0, tf: 0, short: 0 };
    out.forEach(q => { if (have[q.type] != null) have[q.type]++; });
    // Si sobran de un tipo y faltan de otro, convertir los excedentes del final
    const convert = (from, to) => {
      while (have[from] > need[from] && have[to] < need[to]) {
        const idx = out.lastIndexOf(out.slice().reverse().find(q => q.type === from));
        if (idx < 0) break;
        const q = out[idx];
        if (to === 'tf') { out[idx] = { ...q, type: 'tf', answer: 'true', options: undefined }; }
        else if (to === 'short') { out[idx] = { ...q, type: 'short', answer: q.answer || '' , options: undefined }; }
        else { // to multi
          const baseOpts = [
            { text: 'Opción 1', correct: true },
            { text: 'Opción 2', correct: false },
            { text: 'Opción 3', correct: false },
            { text: 'Opción 4', correct: false },
          ];
          out[idx] = { ...q, type: 'multi', options: baseOpts, answer: undefined };
        }
        have[from]--; have[to]++;
      }
    };
    convert('short','multi'); convert('tf','multi');
    convert('multi','tf'); convert('short','tf');
    convert('tf','short'); convert('multi','short');
  }

  while (out.length < cantidad) out.push({ order: out.length + 1, text: 'Pregunta adicional', type: 'short', points: 1, answer: '' });
  return out.map((q, idx) => ({ ...q, order: idx + 1 }));
};

/**
 * Generar preguntas para simulador con IA
 * @param {Object} opts
 * @param {string} [opts.tema] - Tema general o título. Opcional si se especifican "temas" o "area".
 * @param {number} opts.cantidad
 * @param {string} [opts.area]
 * @param {string} [opts.nivel]
 * @param {('general'|'temas')} [opts.modo] - 'general' para cubrir el área/tema global; 'temas' para enfocarse en una lista.
 * @param {string[]|string} [opts.temas] - Lista de temas/ramas específicos (o string separado por comas).
 * @returns {Promise<Array>} preguntas normalizadas
 */
export async function generarPreguntasIA({ tema, cantidad = 5, area = undefined, nivel = 'intermedio', modo = 'general', temas = undefined }){
  // Normalizar temas a array si se provee como string
  let temasList = Array.isArray(temas) ? temas : (typeof temas === 'string' ? temas.split(',').map(s=>s.trim()).filter(Boolean) : []);
  // Validación flexible: requiere al menos uno de tema | area | temas
  if (!tema && !area && (!temasList || temasList.length === 0)) {
    throw new Error('Se requiere al menos un "tema", o "area", o lista de "temas".');
  }
  // Bloqueo si está en cooldown
  const rem = getCooldownRemainingMs();
  if (rem > 0) {
    const err = new Error(`En enfriamiento ${Math.ceil(rem/1000)}s por límite de cuota.`);
    // adjuntar metadatos para que la UI pueda decidir
    err.code = 'COOLDOWN';
    err.remainingMs = rem;
    throw err;
  }
  // Preparar guía según área
  const { tag, directrices } = areaHints(area);
  const dist = distribucionTipos(cantidad, tag);
  const tiposDesc = 'opción múltiple (1 correcta), verdadero/falso, respuesta corta';
  const temaEfectivo = String(tema || area || (temasList[0] || 'Contenido del módulo')).trim();
  const areaLine = area ? `\nÁrea o módulo: ${area}.` : '';
  const dirLine = directrices ? `\nLineamientos específicos del área:\n${directrices}` : '';
  const distLine = `\nDistribución EXACTA por tipo: ${dist.multi} multi, ${dist.tf} tf, ${dist.short} short.`;
  const modoLine = (modo === 'temas' && temasList.length)
    ? `\nEnfoque por TEMAS específicos: ${temasList.map(t=>`"${t}"`).join(', ')}. Distribuye las preguntas entre estos temas de forma equilibrada.`
    : `\nCobertura GENERAL del tema/área indicada.`;

  const prompt = `Genera preguntas tipo examen en español (es-MX).${areaLine}
Tema principal: "${temaEfectivo}".
Nivel: ${nivel}. Tipos permitidos: ${tiposDesc}.${distLine}${modoLine}${dirLine}

Requisitos estrictos:
- EXACTAMENTE ${cantidad} preguntas.
- Opción múltiple: 4 opciones, UNA sola correcta ("correct": true solo en una).
- Verdadero/falso: usar "answer": "true" | "false".
- Respuesta corta: "answer" con texto breve y objetivo (sin explicaciones).
- Enunciados breves, claros, sin ambigüedades ni chistes. Evita dependencias de imágenes.

Devuelve SOLO JSON con este esquema:
{
  "preguntas": [
    { "type": "multi", "text": "...", "points": 1, "options": [
        {"text": "...", "correct": true}, {"text": "...", "correct": false}, {"text": "...", "correct": false}, {"text": "...", "correct": false}
    ]},
    { "type": "tf", "text": "...", "points": 1, "answer": "true" },
    { "type": "short", "text": "...", "points": 1, "answer": "..." }
  ]
}`;

  const { controller, clear } = withTimeout(TIMEOUT);
  try {
    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.6, maxOutputTokens: Math.max(1200, cantidad * 45), response_mime_type: 'application/json' },
      model: MODEL
    };
    const resp = await fetch(PROXY_ENDPOINT, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: controller.signal
    });
    clear();
    if (!resp.ok) {
      const status = resp.status;
      const err = await resp.json().catch(() => ({}));
      if (status === 429) {
        // iniciar cooldown y propagar error
        startCooldown();
        const e = new Error('429: Límite de cuota de IA alcanzado. Intenta nuevamente más tarde.');
        e.code = 'RATE_LIMIT';
        throw e;
      }
      throw new Error(err?.error || `Error IA ${status}`);
    }
    const data = await resp.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const parsed = extractJson(text);
    const arr = Array.isArray(parsed?.preguntas) ? parsed.preguntas : [];
    return normalizarPreguntas(arr, cantidad, dist);
  } catch (e) {
    clear();
    throw e;
  }
}
