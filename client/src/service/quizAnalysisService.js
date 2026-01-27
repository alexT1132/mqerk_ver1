// Servicio dedicado para análisis de rendimiento de quizzes con IA (Gemini + Respaldo Groq)
// REFACTORIZADO: Ahora usa el proxy backend en lugar de llamadas directas a Google API

// Configuración del proxy backend (Gemini)
const PROXY_ENDPOINT = '/api/ai/gemini/generate';
// Modelo configurado manualmente (si se especifica, se usa ese directamente)
const QUIZ_AI_MODEL_CONFIGURED = import.meta?.env?.VITE_GEMINI_QUIZ_MODEL || import.meta?.env?.VITE_GEMINI_MODEL || 'gemini-1.5-flash';
// Lista de modelos a probar en orden de preferencia si el configurado falla
const MODELOS_DISPONIBLES = [
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-pro',
];

// --- NUEVA CONFIGURACIÓN: RESPALDO GROQ ---
// Asegúrate de que tu backend tenga esta ruta configurada para manejar peticiones a Groq
const GROQ_PROXY_ENDPOINT = '/api/ai/groq/generate';
const GROQ_MODEL = 'llama3-70b-8192'; // Modelo potente y rápido, buena alternativa a Gemini Pro

// Detectar si se debe usar solo Groq (sin intentar Gemini primero)
const USE_GROQ_ONLY = import.meta?.env?.VITE_USE_GROQ_FOR_ANALYSIS === 'true';

// La IA siempre está "configurada" porque el proxy maneja la API key
export function isQuizIAConfigured() {
  return true; // El proxy backend maneja la autenticación
}

// Normaliza la respuesta del endpoint de Gemini a texto legible
function extractTextFromGemini(respJson) {
  // Estructuras comunes: candidates[0].content.parts[0].text ó promptFeedback
  const text = respJson?.candidates?.[0]?.content?.parts?.[0]?.text
    || respJson?.candidates?.[0]?.content?.parts?.map(p => p?.text).filter(Boolean).join('\n\n')
    || respJson?.text
    || respJson?.output
    || null;
  return text;
}

// Normaliza la respuesta del endpoint de Groq (formato OpenAI)
function extractTextFromGroq(respJson) {
  return respJson?.choices?.[0]?.message?.content || null;
}

/**
 * Ejecuta un análisis resumido de desempeño para un quiz específico.
 */
export async function analyzeQuizPerformance(params) {
  const {
    itemName,
    alumnoNombre,
    totalIntentos,
    mejorPuntaje,
    promedio,
    scores = [],
    fechas = [],
    duraciones = [],
    ultimoPuntaje,
    previoPuntaje,
    deltaUltimoVsAnterior,
    deltaUltimoVsOficial,
    deltaMejorVsOficial,
    practiceCount,
    mejoraDesdePrimero,
    pendienteTendencia,
    desviacionPuntaje,
    promedioDuracion,
    mejorDuracion,
    peorDuracion,
    // Opcionales enriquecidos:
    intentoNumero,
    totalPreguntasIntento,
    correctasIntento,
    incorrectasIntento,
    omitidasIntento,
    incorrectasLista,
    promedioTiempoPregunta,
    totalTiempoIntento,
    // Detalle para explicar incorrectas
    incorrectasDetalle,
    // Errores recurrentes entre intentos
    erroresRecurrentes,
    // Calificación oficial (primer intento)
    oficialPuntaje,
    oficialFecha,
    oficialDuracion,
  } = params || {};

  // Utilidades locales para generación de fallback (INTACTAS)
  const stripMd = (s) => String(s || '')
    .replace(/`{1,3}[^`]*`{1,3}/g, '') // code
    .replace(/\*\*|__/g, '') // bold
    .replace(/\*|_|~~/g, '') // other md marks
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1') // links
    .replace(/#+\s*(.*)/g, '$1') // headings
    .replace(/>\s?/g, '') // blockquotes
    .replace(/\s+/g, ' ') // collapse spaces
    .trim();
  const normalize = (s) => String(s || '')
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
  const truncate = (s, n) => (String(s).length > n ? String(s).slice(0, n - 1).trimEnd() + '…' : String(s));

  const pickMicroTip = (enun) => {
    const t = normalize(enun);
    // Gramática específica: queísmo / dequeísmo
    if (/(queismo|queísmo|dequeismo|dequeísmo)/i.test(t)) {
      return 'Prueba si el verbo o expresión exige "de" (régimen). Sustituye la subordinada por "eso/esto" y verifica: si suena bien sin "de" → evita el dequeísmo; si el verbo pide "de" → evita el queísmo.';
    }
    // Ciencias naturales / Astronomía
    if (/(planeta|sistema solar|mercurio|venus|tierra|marte|jupit|saturno|urano|neptuno|orbita|sol)/i.test(t)) {
      return 'Repasa el orden de los planetas y un rasgo clave de cada uno (Mercurio→Neptuno).';
    }
    // Historia
    if (/(primera guerra mundial|segunda guerra mundial|independenc|revolucion|siglo|año|fecha|periodo|cronolo)/i.test(t)) {
      return 'Construye una línea de tiempo con fechas y hitos; asocia causas y consecuencias.';
    }
    // Matemáticas
    if (/(porcent|fraccion|proporc|ecuacion|polinom|derivad|integral|teorema|pitagoras|angulo|triang|algebra|aritmet)/i.test(t)) {
      return 'Escribe la fórmula/definición clave y reemplaza datos con unidades; valida con un ejemplo simple.';
    }
    // Lectura y comprensión
    if (/(idea principal|infer|argument|autor|parrafo|texto|titulo|resumen|contexto)/i.test(t)) {
      return 'Subraya palabras clave y distingue idea principal de detalles; parafrasea en una línea.';
    }
    // Gramática y ortografía
    if (/(ortograf|acentu|diacri|tilde|puntu|coma|punto y coma|signos|concord|sujeto|verbo|estilo indirecto|discurso indirecto)/i.test(t)) {
      if (/(acentu|diacri|tilde)/i.test(t)) return 'Repasa acentuación diacrítica: tú/tu, él/el, más/mas, sí/si, té/te.';
      if (/(puntu|coma|punto y coma|signos)/i.test(t)) return 'Cuida la puntuación: comas en incisos/listas y evita coma entre sujeto y predicado.';
      if (/(concord|sujeto|verbo)/i.test(t)) return 'Verifica concordancia sujeto–verbo en número y persona.';
      if (/(estilo indirecto|discurso indirecto)/i.test(t)) return 'Ajusta tiempos y pronombres al pasar a estilo indirecto.';
    }
    // Ciencias (química/física/biología)
    if (/(atomo|molecul|tabla periodica|elemento|fuerza|energia|velocidad|aceleracion|celula|adn|mitosis|meiosis|fotosintesis|ecosistema)/i.test(t)) {
      return 'Identifica magnitudes/partes y relaciones; usa unidades correctas y un esquema rápido.';
    }
    return 'Identifica el concepto/regla clave del enunciado antes de elegir la respuesta.';
  };

  const buildExamplesSection = (incorrectasLista) => {
    if (!Array.isArray(incorrectasLista) || incorrectasLista.length === 0) return '';
    const items = incorrectasLista.filter(Boolean).slice(0, 3);
    if (!items.length) return '';
    const bullets = items.map((enunRaw) => {
      const clean = stripMd(enunRaw).replace(/\s+/g, ' ').trim();
      const resumen = truncate(clean, 110);
      const tip = pickMicroTip(clean);
      return `- "${resumen}"\n  Micro-consejo: ${tip}`;
    }).join('\n');
    return `\n\n### Ejemplos breves de preguntas con error\n\n${bullets}`;
  };

  const buildExplainSection = (detail) => {
    if (!Array.isArray(detail) || !detail.length) return '';
    const lines = detail.slice(0, 5).map((q) => {
      const enun = stripMd(q.enunciado || '').trim();
      const sel = (Array.isArray(q.seleccion) ? q.seleccion : []).filter(Boolean).join('; ');
      const cor = (Array.isArray(q.correctas) ? q.correctas : []).filter(Boolean).join('; ');
      const hint = pickMicroTip(enun);
      return `- ${enun}\n  Elegiste: ${sel || '—'}\n  Correcta(s): ${cor || '—'}\n  Breve porqué: ${hint}`;
    }).join('\n');
    return `\n\n### Explicación de preguntas incorrectas\n\n${lines}`;
  };

  // Clasificación simple de tema + recursos abiertos sugeridos
  const classifyTopic = (enun) => {
    const t = normalize(enun);
    if (/(queismo|queísmo)/i.test(t)) return 'queismo';
    if (/(dequeismo|dequeísmo)/i.test(t)) return 'dequeismo';
    if (/(puntu|coma|punto y coma|signos)/i.test(t)) return 'puntuacion';
    if (/(acentu|diacri|tilde)/i.test(t)) return 'acentuacion';
    if (/(concord|sujeto|verbo)/i.test(t)) return 'concordancia';
    if (/(redaccion|cohesion|coherenc|parrafo|oracion|estilo)/i.test(t)) return 'redaccion';
    if (/(porcent|fraccion|proporc|ecuacion|polinom|algebra|aritmet|teorema|pitagoras|angulo|triang)/i.test(t)) return 'matematicas';
    if (/(idea principal|infer|argument|autor|parrafo|texto|titulo|resumen|contexto|comprension)/i.test(t)) return 'lectura';
    if (/(primera guerra mundial|segunda guerra mundial|independenc|revolucion|siglo|año|fecha|periodo|cronolo|historia)/i.test(t)) return 'historia';
    if (/(atomo|molecul|tabla periodica|elemento|fuerza|energia|velocidad|aceleracion|celula|adn|mitosis|meiosis|fotosintesis|ecosistema)/i.test(t)) return 'ciencias';
    if (/(planeta|sistema solar|orbita|sol|mercurio|venus|tierra|marte|jupiter|saturno|urano|neptuno)/i.test(t)) return 'astronomia';
    if (/(gramatic|ortograf)/i.test(t)) return 'gramatica-general';
    return 'general';
  };

  const resourcesFor = (topic) => {
    switch (topic) {
      case 'queismo':
        return [
          { label: 'Queísmo – Wikipedia', url: 'https://es.wikipedia.org/wiki/Que%C3%ADsmo' },
          { label: 'DPD RAE – Queísmo (índice)', url: 'https://www.rae.es/diccionario-panhispanico-de-dudas' },
        ];
      case 'dequeismo':
        return [
          { label: 'Dequeísmo – Wikipedia', url: 'https://es.wikipedia.org/wiki/Deque%C3%ADsmo' },
          { label: 'DPD RAE – Dequeísmo (índice)', url: 'https://www.rae.es/diccionario-panhispanico-de-dudas' },
        ];
      case 'puntuacion':
        return [
          { label: 'Puntuación (Wikipedia)', url: 'https://es.wikipedia.org/wiki/Puntuaci%C3%B3n' },
          { label: 'Ortografía (RAE)', url: 'https://www.rae.es/recursos/ortografia' },
        ];
      case 'acentuacion':
        return [
          { label: 'Tilde diacrítica (Wikipedia)', url: 'https://es.wikipedia.org/wiki/Tilde_diacr%C3%ADtica' },
          { label: 'Ortografía (RAE)', url: 'https://www.rae.es/recursos/ortografia' },
        ];
      case 'concordancia':
        return [
          { label: 'Concordancia gramatical', url: 'https://es.wikipedia.org/wiki/Concordancia_(gram%C3%A1tica)' },
          { label: 'DPD RAE – Concordancia (índice)', url: 'https://www.rae.es/diccionario-panhispanico-de-dudas' },
        ];
      case 'redaccion':
        return [
          { label: 'Redacción (Wikipedia)', url: 'https://es.wikipedia.org/wiki/Redacci%C3%B3n' },
          { label: 'Conectores (Wikipedia)', url: 'https://es.wikipedia.org/wiki/Conector_l%C3%B3gico' },
        ];
      case 'matematicas':
        return [
          { label: 'Khan Academy: Álgebra', url: 'https://es.khanacademy.org/math/algebra' },
          { label: 'Khan Academy: Porcentajes', url: 'https://es.khanacademy.org/math/pre-algebra/percent' },
        ];
      case 'lectura':
        return [
          { label: 'Comprensión de lectura (Wikipedia)', url: 'https://es.wikipedia.org/wiki/Comprensi%C3%B3n_de_lectura' },
          { label: 'Lectura activa: técnicas', url: 'https://es.wikipedia.org/wiki/Lectura' },
        ];
      case 'historia':
        return [
          { label: 'Historia universal (Wikipedia)', url: 'https://es.wikipedia.org/wiki/Historia_universal' },
          { label: 'Línea de tiempo (Wikipedia)', url: 'https://es.wikipedia.org/wiki/L%C3%ADnea_de_tiempo' },
        ];
      case 'ciencias':
        return [
          { label: 'Khan Academy: Física básica', url: 'https://es.khanacademy.org/science/physics' },
          { label: 'Khan Academy: Biología', url: 'https://es.khanacademy.org/science/biology' },
        ];
      case 'astronomia':
        return [
          { label: 'Sistema solar (Wikipedia)', url: 'https://es.wikipedia.org/wiki/Sistema_solar' },
          { label: 'Planetas (Wikipedia)', url: 'https://es.wikipedia.org/wiki/Planeta' },
        ];
      case 'gramatica-general':
        return [
          { label: 'Ortografía (RAE)', url: 'https://www.rae.es/recursos/ortografia' },
          { label: 'DPD (RAE): dudas', url: 'https://www.rae.es/diccionario-panhispanico-de-dudas' },
        ];
      default:
        return [
          { label: 'Khan Academy (español)', url: 'https://es.khanacademy.org/' },
          { label: 'Wikipedia: conceptos básicos', url: 'https://es.wikipedia.org/wiki/Wikipedia:Portada' },
        ];
    }
  };

  const buildRecurringSection = (list) => {
    if (!Array.isArray(list) || !list.length) return '';
    const top = list.slice(0, 5);
    const bullets = top.map((it) => {
      const raw = stripMd(it?.enunciado || '').replace(/\s+/g, ' ').trim();
      if (!raw) return null;
      const resumen = truncate(raw, 120);
      const tip = pickMicroTip(raw);
      const topic = classifyTopic(raw);
      const links = resourcesFor(topic).slice(0, 2).map(r => `[${r.label}](${r.url})`).join(', ');
      const veces = Number(it?.veces || 1);
      return `- "${resumen}" (veces: ${veces})\n  Pista: ${tip}\n  Recursos: ${links}`;
    }).filter(Boolean).join('\n');
    if (!bullets) return '';
    return `\n\n### Errores recurrentes y recursos\n\n${bullets}`;
  };

  // Fallback: construir explicación mínima cuando no tenemos detalle por pregunta
  const buildExplainFromList = (list) => {
    if (!Array.isArray(list) || !list.length) return '';
    const items = list.filter(Boolean).slice(0, 4);
    const lines = items.map((enunRaw) => {
      const enun = stripMd(enunRaw || '').trim();
      const hint = pickMicroTip(enun);
      return `- ${enun}\n  Elegiste: N/D\n  Correcta(s): N/D\n  Breve porqué: ${hint}`;
    }).join('\n');
    return `\n\n### Explicación de preguntas incorrectas\n\n${lines}`;
  };

  const buildFallbackAnalysis = (p) => {
    try {
      const name = p?.itemName || 'Quiz';
      const totalIntentos = Number(p?.totalIntentos || 0);
      const mejor = Number(p?.mejorPuntaje || 0);
      const promedio = Math.round(Number(p?.promedio || 0));
      const scores = Array.isArray(p?.scores) ? p.scores : [];
      const ultimo = Number(p?.ultimoPuntaje ?? (scores.length ? scores[scores.length - 1] : 0));
      const desviacion = (typeof p?.desviacionPuntaje === 'number') ? p.desviacionPuntaje.toFixed(2) : 'N/D';
      const pendiente = (typeof p?.pendienteTendencia === 'number') ? p.pendienteTendencia.toFixed(3) : 'N/D';
      const promDur = (typeof p?.promedioDuracion === 'number') ? Math.round(p.promedioDuracion) : null;
      const mejorDur = (typeof p?.mejorDuracion === 'number') ? Math.round(p.mejorDuracion) : null;
      const peorDur = (typeof p?.peorDuracion === 'number') ? Math.round(p.peorDuracion) : null;
      const intentNum = p?.intentoNumero;
      const totPreg = p?.totalPreguntasIntento;
      const corr = p?.correctasIntento;
      const inc = p?.incorrectasIntento;
      const om = p?.omitidasIntento;
      const avgQ = (typeof p?.promedioTiempoPregunta !== 'undefined' && p?.promedioTiempoPregunta != null)
        ? Math.round(p.promedioTiempoPregunta / 1000) : null;
      const totalT = (typeof p?.totalTiempoIntento !== 'undefined' && p?.totalTiempoIntento != null)
        ? Math.round(p.totalTiempoIntento / 1000) : null;

      const secResumen = `### Resumen general\n\n` +
        `- Has realizado ${totalIntentos} intento(s) en "${name}".\n` +
        `- Mejor puntaje: ${mejor}%. Promedio: ${promedio}%. Último: ${ultimo}%.`;

      const secTendencia = `\n\n### Tendencia y variabilidad\n\n` +
        `- Secuencia de puntajes: ${scores.join(', ') || 'N/D'}.\n` +
        `- Pendiente de tendencia: ${pendiente}. Variabilidad (DE): ${desviacion}.\n` +
        `- Interpreta si la pendiente es positiva (mejora), negativa (descenso) o cercana a 0 (estable).`;

      const secEquilibrio = `\n\n### Equilibrio puntaje-tiempo\n\n` +
        `- Tiempo prom. por intento (s): ${promDur ?? 'N/D'}; mejor: ${mejorDur ?? 'N/D'}; peor: ${peorDur ?? 'N/D'}.\n` +
        `- Último intento: ${totalT ?? 'N/D'}s total; ${avgQ ?? 'N/D'}s por pregunta.`;

      const secAnalisisErrores = `\n\n### Análisis de errores\n\n` +
        `- Revisa si tus fallos son conceptuales (falta de estudio) o de atención.\n` +
        `- Identifica si te equivocas en preguntas largas o cortas.\n` +
        `- Verifica si cambiaste respuestas correctas por incorrectas.`;

      const secProgreso = buildSecProgresoOficial(p);
      const secRecurrentes = buildRecurringSection(p?.erroresRecurrentes);
      const secRecsTecnicas = `\n\n### Recomendaciones técnicas\n\n` +
        `- Aplica la técnica Feynman: explica el concepto en voz alta.\n` +
        `- Usa la técnica Pomodoro para sesiones de estudio enfocadas.\n` +
        `- Realiza mapas mentales para conectar conceptos relacionados.`;

      const secConclusion = `\n\n### Conclusión breve\n\n` +
        `Vas construyendo base. Con un enfoque técnico y análisis de errores, ` +
        `tu rendimiento mejorará. Mantén la constancia.`;

      const intro = buildHumanIntro(p);
      const explic = buildExplainSection(p?.incorrectasDetalle);
      const ejemplos = buildExamplesSection(p?.incorrectasLista);
      const secGuia = buildSecResourceGuide(p);
      // Orden: Intro humano → Resumen → Tendencia → Progreso → Equilibrio → Análisis Errores → Explicación → Recurrentes → Recs Técnicas → Guía → Conclusión → Ejemplos
      return [intro, secResumen, secTendencia, secProgreso, secEquilibrio, secAnalisisErrores, explic, secRecurrentes, secRecsTecnicas, secGuia, secConclusion, ejemplos, '\n\n<<<AI_SOURCE:FALLBACK>>>'].join('');
    } catch (e) {
      console.warn('No se pudo construir análisis local de fallback:', e);
      return '### Análisis\n\nNo se pudo obtener la respuesta de la IA. Revisa tu conexión e intenta nuevamente.';
    }
  };

  // Garantiza secciones mínimas en la salida final y normaliza encabezados
  const escapeReg = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const stripAccents = (s) => String(s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '');
  const hasHeadingStrict = (md, title) => new RegExp(`(^|\n)###\\s+${escapeReg(title)}\\b`, 'i').test(String(md || ''));
  const hasHeadingLoose = (md, title) => {
    const lines = String(md || '').split('\n');
    const tNorm = stripAccents(title).toLowerCase();
    for (const raw of lines) {
      const l = raw.trim();
      if (!l) continue;
      // Acepta ya sea un heading markdown o una línea que coincide con el título (con o sin dos puntos)
      if (/^#{1,6}\s+/i.test(l)) {
        const h = stripAccents(l.replace(/^#{1,6}\s+/, '')).toLowerCase();
        if (h.startsWith(tNorm)) return true;
      } else {
        const w = stripAccents(l.replace(/[:：]+\s*$/, '')).toLowerCase();
        if (w === tNorm) return true;
      }
    }
    return false;
  };
  const normalizeHeadings = (md) => {
    if (!md) return md;
    // Primero: si un heading ### aparece pegado al texto anterior (sin salto de línea), forzar salto.
    // Aplica para niveles 1–6 de #.
    const ensureLineBreaksBeforeHashes = (txt) => String(txt).replace(/#{1,6}\s+/g, (match, offset, str) => {
      if (offset === 0) return match; // ya está al inicio
      const prev = str[offset - 1];
      if (prev === '\n') return match; // ya tiene salto
      return '\n\n' + match; // forzar línea en blanco antes del heading
    });
    let text = ensureLineBreaksBeforeHashes(md);
    const titles = [
      'Resumen general',
      'Tendencia y variabilidad',
      'Progreso respecto al oficial',
      'Equilibrio puntaje-tiempo',
      'Análisis de errores',
      'Guía para encontrar recursos',
      'Errores recurrentes y recursos',
      'Recomendaciones técnicas',
      'Conclusión breve',
      'Explicación de preguntas incorrectas',
      'Ejemplos breves de preguntas con error'
    ];
    const lines = String(text).split('\n');
    const out = [];
    for (let i = 0; i < lines.length; i++) {
      let l = lines[i];
      const raw = l.trim();
      const rawNoColon = raw.replace(/[:：]+\s*$/, '');
      const matchedTitle = titles.find(t => stripAccents(rawNoColon).toLowerCase() === stripAccents(t).toLowerCase());
      if (matchedTitle) {
        // Asegurar línea en formato heading ### y separar con una línea en blanco antes
        if (out.length && out[out.length - 1].trim() !== '') out.push('');
        out.push(`### ${matchedTitle}`);
        // Si siguiente línea no está vacía, añadir una línea en blanco después también
        if (i + 1 < lines.length && lines[i + 1].trim() !== '') {
          out.push('');
        }
        continue;
      }
      // Si ya viene como heading con otro nivel, lo normalizamos a ###
      const m = raw.match(/^(#{1,6})\s+(.+)/);
      if (m) {
        const text = m[2];
        const maybeTitle = titles.find(t => stripAccents(text).toLowerCase().startsWith(stripAccents(t).toLowerCase()));
        if (maybeTitle) {
          if (out.length && out[out.length - 1].trim() !== '') out.push('');
          out.push(`### ${maybeTitle}`);
          if (i + 1 < lines.length && lines[i + 1].trim() !== '') out.push('');
          continue;
        }
      }
      out.push(l);
    }
    // Compactar líneas en blanco dobles
    return out.join('\n').replace(/\n{3,}/g, '\n\n');
  };

  const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : null; };
  const buildSecResumen = (p) => {
    const name = p?.itemName || 'Quiz';
    const totalIntentos = num(p?.totalIntentos) ?? 0;
    const mejor = num(p?.mejorPuntaje) ?? 0;
    const promedio = Math.round(num(p?.promedio) ?? 0);
    const scores = Array.isArray(p?.scores) ? p.scores : [];
    const ultimo = num(p?.ultimoPuntaje ?? (scores.length ? scores[scores.length - 1] : 0));
    const oficial = num(p?.oficialPuntaje);
    const prev = num(p?.previoPuntaje);
    const dLastPrev = (typeof p?.deltaUltimoVsAnterior === 'number') ? p.deltaUltimoVsAnterior : (ultimo != null && prev != null ? ultimo - prev : null);
    const dLastOff = (typeof p?.deltaUltimoVsOficial === 'number') ? p.deltaUltimoVsOficial : (ultimo != null && oficial != null ? ultimo - oficial : null);
    const dBestOff = (typeof p?.deltaMejorVsOficial === 'number') ? p.deltaMejorVsOficial : ((num(p?.mejorPuntaje) != null && oficial != null) ? num(p?.mejorPuntaje) - oficial : null);
    const lines = [
      `- Has realizado ${totalIntentos} intento(s) en "${name}".`,
      `- Mejor puntaje: ${mejor}%. Promedio: ${promedio}%. Último: ${ultimo}%.`,
      (oficial != null ? `- Oficial (intento 1): ${oficial}%` : null),
      (dLastPrev != null ? `- Cambio último vs. anterior: ${dLastPrev > 0 ? '+' : ''}${dLastPrev} pts` : null),
      (dLastOff != null ? `- Cambio último vs. oficial: ${dLastOff > 0 ? '+' : ''}${dLastOff} pts` : null),
      (dBestOff != null ? `- Cambio mejor vs. oficial: ${dBestOff > 0 ? '+' : ''}${dBestOff} pts` : null),
    ].filter(Boolean);
    return `\n\n### Resumen general\n\n${lines.join('\n')}`;
  };
  // Guía general de recursos (siempre útil)
  const buildSecResourceGuide = (p) => {
    return `\n\n### Guía para encontrar recursos\n\n` +
      `- Escribe 2–3 palabras clave del enunciado + “explicación” o “ejercicios resueltos”.\n` +
      `- Para PDFs: añade \`filetype:pdf\` (ej.: porcentajes descuento filetype:pdf).\n` +
      `- Limita por sitios confiables: \`site:es.khanacademy.org\`, \`site:wikipedia.org\`, \`site:rae.es\`.\n` +
      `- Matemáticas: “Khan Academy [tema] ejercicios”, “propiedad [tema] ejemplos”.\n` +
      `- Lengua/Gramática: “DPD RAE [duda]”, “queísmo dequeísmo ejemplos”.\n` +
      `- Historia/Ciencias: “línea de tiempo [evento]”, “concepto [tema] resumen + ejemplos”.`;
  };
  // Saludo humano inicial para que el alumno sienta acompañamiento
  const buildHumanIntro = (p) => {
    const name = p?.itemName || 'esta evaluación';
    const total = num(p?.totalIntentos) ?? 0;
    const scores = Array.isArray(p?.scores) ? p.scores : [];
    const ultimo = num(p?.ultimoPuntaje ?? (scores.length ? scores[scores.length - 1] : null));
    const best = num(p?.mejorPuntaje);
    const alumno = (p?.alumnoNombre || '').trim();
    const first = alumno ? alumno.split(/\s+/)[0] : '';
    const parts = [];
    parts.push(`${alumno ? `¡Hola, ${first}!` : '¡Hola!'} Veo que llevas ${total} intento${total === 1 ? '' : 's'} en ${name}. Gracias por tu esfuerzo — vamos a convertirlo en aprendizaje útil.`);
    if (best != null && ultimo != null && ultimo < best) {
      parts.push(`Aunque el último fue ${ultimo}%, ya demostraste que puedes llegar a ${best}%. Te ayudo a recuperar ese nivel y superarlo.`);
    } else if (ultimo != null) {
      parts.push(`En el último intento obtuviste ${ultimo}%. Te comparto claves concretas para seguir subiendo.`);
    } else if (best != null) {
      parts.push(`Tu mejor resultado hasta ahora es ${best}%.`);
    }
    parts.push(`Abajo tienes un diagnóstico breve y consejos accionables. Vamos paso a paso.`);
    return parts.join(' ');
  };
  const buildSecTendencia = (p) => {
    const scores = Array.isArray(p?.scores) ? p.scores : [];
    const pendiente = (typeof p?.pendienteTendencia === 'number') ? p.pendienteTendencia.toFixed(3) : 'N/D';
    const desviacion = (typeof p?.desviacionPuntaje === 'number') ? p.desviacionPuntaje.toFixed(2) : 'N/D';
    // Interpretación simple
    let label = 'estable';
    const penNum = typeof p?.pendienteTendencia === 'number' ? p.pendienteTendencia : null;
    if (penNum != null) {
      if (penNum > 0.2) label = 'mejora';
      else if (penNum < -0.2) label = 'descenso';
    }
    return `\n\n### Tendencia y variabilidad\n\n- Secuencia de puntajes: ${scores.join(', ') || 'N/D'}.\n- Pendiente de tendencia: ${pendiente} (${label}).\n- Variabilidad (Desviación Estándar): ${desviacion}.\n- Interpretación: ${label === 'mejora' ? 'Crecimiento sostenido.' : label === 'descenso' ? 'Alerta de regresión.' : 'Estabilidad en el rendimiento.'}`;
  };
  const buildSecProgresoOficial = (p) => {
    const practiceCount = Math.max(0, Number(p?.practiceCount || 0));
    const dLastPrev = (typeof p?.deltaUltimoVsAnterior === 'number') ? p.deltaUltimoVsAnterior : null;
    const dLastOff = (typeof p?.deltaUltimoVsOficial === 'number') ? p.deltaUltimoVsOficial : null;
    const dBestOff = (typeof p?.deltaMejorVsOficial === 'number') ? p.deltaMejorVsOficial : null;
    const verdict = (() => {
      const best = dBestOff == null ? -Infinity : dBestOff;
      if (practiceCount === 0) return 'Aún no hay práctica posterior al oficial.';
      if (best >= 15) return 'Alta: la práctica elevó claramente tu techo de puntaje.';
      if (best >= 7) return 'Media: la práctica muestra avance sostenido.';
      if (best >= 3) return 'Ligera: hay señales de mejora, sigue practicando.';
      if (best >= 0) return 'Neutral: sin mejora significativa respecto al oficial.';
      return 'Baja: tu mejor puntaje aún está por debajo del oficial; revisa estrategia.';
    })();
    const rows = [
      `- Intentos de práctica (desde el oficial): ${practiceCount}`,
      (dLastPrev != null ? `- Último vs. anterior: ${dLastPrev > 0 ? '+' : ''}${dLastPrev} pts` : null),
      (dLastOff != null ? `- Último vs. oficial: ${dLastOff > 0 ? '+' : ''}${dLastOff} pts` : null),
      (dBestOff != null ? `- Mejor vs. oficial: ${dBestOff > 0 ? '+' : ''}${dBestOff} pts` : null),
      `- Veredicto: ${verdict}`
    ].filter(Boolean).join('\n');
    return `\n\n### Progreso respecto al oficial\n\n${rows}`;
  };
  const buildSecEquilibrio = (p) => {
    const promDur = (typeof p?.promedioDuracion === 'number') ? Math.round(p.promedioDuracion) : null;
    const mejorDur = (typeof p?.mejorDuracion === 'number') ? Math.round(p.mejorDuracion) : null;
    const peorDur = (typeof p?.peorDuracion === 'number') ? Math.round(p.peorDuracion) : null;
    const avgQ = (typeof p?.promedioTiempoPregunta !== 'undefined' && p?.promedioTiempoPregunta != null)
      ? Math.round(p.promedioTiempoPregunta / 1000) : null;
    const totalT = (typeof p?.totalTiempoIntento !== 'undefined' && p?.totalTiempoIntento != null)
      ? Math.round(p.totalTiempoIntento / 1000) : null;
    return `\n\n### Equilibrio puntaje-tiempo\n\n- Tiempo prom. por intento (s): ${promDur ?? 'N/D'}; mejor: ${mejorDur ?? 'N/D'}; peor: ${peorDur ?? 'N/D'}.\n- Último intento: ${totalT ?? 'N/D'}s total; ${avgQ ?? 'N/D'}s por pregunta.`;
  };
  const buildSecAnalisisErrores = () => `\n\n### Análisis de errores\n\n- Revisa si tus fallos son conceptuales (falta de estudio) o de atención.\n- Identifica si te equivocas en preguntas largas o cortas.\n- Verifica si cambiaste respuestas correctas por incorrectas.`;
  const buildSecRecsTecnicas = () => `\n\n### Recomendaciones técnicas\n\n- Aplica la técnica Feynman: explica el concepto en voz alta.\n- Usa la técnica Pomodoro para sesiones de estudio enfocadas.\n- Realiza mapas mentales para conectar conceptos relacionados.`;
  const buildSecConclusion = () => `\n\n### Conclusión breve\n\nVas construyendo base. Con un enfoque técnico y análisis de errores, tu rendimiento mejorará. Mantén la constancia.`;

  const ensureSections = (md, p) => {
    let out = String(md || '');
    // Solo añadimos si faltan, para evitar duplicados
    if (!hasHeadingLoose(out, 'Resumen general')) out += buildSecResumen(p);
    if (!hasHeadingLoose(out, 'Tendencia y variabilidad')) out += buildSecTendencia(p);
    if (!hasHeadingLoose(out, 'Equilibrio puntaje-tiempo')) out += buildSecEquilibrio(p);
    if (!hasHeadingLoose(out, 'Análisis de errores')) out += buildSecAnalisisErrores(p);
    if (!hasHeadingLoose(out, 'Recomendaciones técnicas')) out += buildSecRecsTecnicas(p);
    if (!hasHeadingLoose(out, 'Conclusión breve')) out += buildSecConclusion(p);
    // Normalizar títulos a markdown y espaciado
    out = normalizeHeadings(out);
    return out;
  };

  const insertBeforeHeading = (md, headingTitle, sectionMd) => {
    if (!sectionMd) return md;
    const lines = String(md || '').split('\n');
    const idx = lines.findIndex(l => /^###\s+/.test(l) && l.toLowerCase().includes(headingTitle.toLowerCase()));
    if (idx === -1) return md + sectionMd; // si no existe, lo agregamos al final
    const before = lines.slice(0, idx).join('\n');
    const after = lines.slice(idx).join('\n');
    return before + sectionMd + '\n' + after;
  };

  // CORRECCIÓN: El systemPrompt ahora se enfoca únicamente en el ROL y TONO de la IA.
  const systemPrompt = `Actúa como un tutor experto, analítico y técnico. Tu tono debe ser profesional pero motivador. Tu objetivo es proporcionar un diagnóstico preciso y accionable para mejorar el rendimiento académico. Responde siempre en español.`;

  // Limitar longitud de listas para evitar respuestas muy largas
  const capArray = (arr, n = 12) => (Array.isArray(arr) ? arr.slice(Math.max(0, arr.length - n)) : []);
  const scoresCapped = capArray(scores, 12);
  const fechasCapped = capArray(fechas, 12);
  const duracionesCapped = capArray(duraciones, 12);
  const scoresList = scoresCapped.join(', ');
  const fechasList = fechasCapped.map(f => {
    try { return new Date(f).toLocaleString('es-ES'); } catch { return String(f); }
  }).join(' | ');
  const duracionesList = duracionesCapped.join(', ');

  // El userQuery contiene todas las instrucciones específicas sobre la TAREA a realizar.
  const userQuery = `Análisis de rendimiento para la evaluación: "${itemName || 'Quiz'}".
Estudiante: ${alumnoNombre ? alumnoNombre : 'N/D'}.

${Array.isArray(incorrectasDetalle) && incorrectasDetalle.length > 0 ? `
═══════════════════════════════════════════════════════════════════════════════
🚨 DATOS CRÍTICOS: PREGUNTAS ESPECÍFICAS DONDE EL ESTUDIANTE FALLÓ
═══════════════════════════════════════════════════════════════════════════════

**ESTOS SON DATOS REALES DEL EXAMEN. DEBES USARLOS OBLIGATORIAMENTE EN TU ANÁLISIS.**

El estudiante falló en las siguientes preguntas específicas. Para CADA una de estas preguntas, DEBES:
1. Mencionarla en la sección "Análisis de errores" con su enunciado o un resumen claro
2. Decir QUÉ respondió el estudiante (de "seleccion")
3. Decir cuál es la respuesta CORRECTA (de "correctas")
4. Analizar POR QUÉ falló (error conceptual/procedimental/atención)
5. Dar una recomendación ESPECÍFICA para esa pregunta

Datos de las preguntas incorrectas:
${JSON.stringify(incorrectasDetalle.slice(0, 10), null, 2)}

**NO PUEDES IGNORAR ESTOS DATOS. El estudiante necesita saber QUÉ preguntas específicas le cuestan trabajo y CÓMO resolverlas.**
═══════════════════════════════════════════════════════════════════════════════

` : ''}
\nResumen de intentos:
- Total de Intentos: ${Number(totalIntentos) || 0}
- Mejor Puntaje: ${Number(mejorPuntaje) || 0}%
- Promedio: ${Number(Math.round(Number(promedio) || 0))}%
- Último Puntaje: ${Number(ultimoPuntaje ?? (scores.length ? scores[scores.length - 1] : 0))}%
- Intentos de práctica (después del oficial): ${Number(practiceCount || 0)}
- Delta último vs. anterior: ${typeof deltaUltimoVsAnterior === 'number' ? (deltaUltimoVsAnterior >= 0 ? '+' : '') + deltaUltimoVsAnterior : 'N/D'} pts
- Delta último vs. oficial: ${typeof deltaUltimoVsOficial === 'number' ? (deltaUltimoVsOficial >= 0 ? '+' : '') + deltaUltimoVsOficial : 'N/D'} pts
- Delta mejor vs. oficial: ${typeof deltaMejorVsOficial === 'number' ? (deltaMejorVsOficial >= 0 ? '+' : '') + deltaMejorVsOficial : 'N/D'} pts
- Secuencia de puntajes (del más antiguo al más reciente): ${scoresList}
- Fechas (orden cronológico): ${fechasList}
- Duraciones en segundos (orden cronológico): ${duracionesList}
\nImportante (regla académica): solo el PRIMER intento cuenta como calificación oficial; los demás son práctica. Datos del intento oficial:
- Puntaje oficial (intento 1): ${typeof oficialPuntaje === 'number' ? oficialPuntaje : 'N/D'}%
- Fecha oficial: ${oficialFecha ? new Date(oficialFecha).toLocaleString('es-ES') : 'N/D'}
- Duración oficial (s): ${typeof oficialDuracion === 'number' ? Math.round(oficialDuracion) : 'N/D'}
\nMétricas adicionales:
- Mejora desde el primer intento: ${typeof mejoraDesdePrimero === 'number' ? mejoraDesdePrimero : 'N/D'} puntos
- Tendencia (pendiente de la serie de puntajes): ${typeof pendienteTendencia === 'number' ? pendienteTendencia.toFixed(3) : 'N/D'}
- Variabilidad (desviación estándar de puntajes): ${typeof desviacionPuntaje === 'number' ? desviacionPuntaje.toFixed(2) : 'N/D'}
- Tiempo promedio por intento (s): ${typeof promedioDuracion === 'number' ? Math.round(promedioDuracion) : 'N/D'}
- Mejor tiempo (s): ${typeof mejorDuracion === 'number' ? Math.round(mejorDuracion) : 'N/D'}
- Peor tiempo (s): ${typeof peorDuracion === 'number' ? Math.round(peorDuracion) : 'N/D'}
${(typeof intentoNumero !== 'undefined' || typeof totalPreguntasIntento !== 'undefined') ? `\nDetalle del último intento revisado:
- Número de intento: ${typeof intentoNumero !== 'undefined' ? intentoNumero : 'N/D'}
- Total de preguntas: ${typeof totalPreguntasIntento !== 'undefined' ? totalPreguntasIntento : 'N/D'}
- Correctas: ${typeof correctasIntento !== 'undefined' ? correctasIntento : 'N/D'}
- Incorrectas: ${typeof incorrectasIntento !== 'undefined' ? incorrectasIntento : 'N/D'}
- Omitidas/sin respuesta: ${typeof omitidasIntento !== 'undefined' ? omitidasIntento : 'N/D'}
- **VERIFICACIÓN DE CONSISTENCIA CRÍTICA:** El puntaje del último intento es ${typeof ultimoPuntaje !== 'undefined' && ultimoPuntaje != null ? ultimoPuntaje + '%' : 'N/D'}. Calcula el puntaje esperado: (correctas / totalPreguntas) * 100. Este debe coincidir aproximadamente con el puntaje reportado. **REGLAS:** (1) Si el puntaje es menor a 100%, DEBE haber preguntas incorrectas u omitidas. (2) Si correctas = totalPreguntas, entonces el puntaje DEBE ser 100%. (3) Si el puntaje es 80%, entonces correctas < totalPreguntas. (4) **NUNCA digas "todas las preguntas fueron correctas" si el puntaje es menor a 100% o si incorrectas > 0 o omitidas > 0.** (5) Si hay inconsistencias entre el puntaje y los datos de correctas/incorrectas, menciona la discrepancia en lugar de hacer afirmaciones contradictorias.
- Tiempo total (s): ${typeof totalTiempoIntento !== 'undefined' && totalTiempoIntento != null ? Math.round(totalTiempoIntento / 1000) : 'N/D'}
- Tiempo promedio por pregunta (s): ${typeof promedioTiempoPregunta !== 'undefined' && promedioTiempoPregunta != null ? Math.round(promedioTiempoPregunta / 1000) : 'N/D'}
- Preguntas respondidas incorrectamente (muestra): ${(Array.isArray(incorrectasLista) && incorrectasLista.length) ? incorrectasLista.join(' | ') : 'N/D'}` : ''}
\nInstrucciones: comienza con un saludo breve y humano (2–3 frases) dirigido al estudiante. Luego genera un análisis TÉCNICO, PEDAGÓGICO y PROFUNDO. Dado que el estudiante ha realizado al menos 2 intentos, céntrate en la COMPARACIÓN, el PROGRESO y la CONSISTENCIA.
RESPETA la regla: el diagnóstico oficial es el intento 1; los demás son práctica.

Debes incluir una sección titulada exactamente "Progreso respecto al oficial" con 3–5 bullets que reporten: intentos de práctica, deltas (último vs anterior, último vs oficial, mejor vs oficial) y un veredicto de utilidad (Alta/Media/Ligera/Neutral/Baja).

Si hay errores recurrentes, añade "Errores recurrentes y recursos" con 2–5 bullets: resume el enunciado, indica veces y da una pista TÉCNICA breve; sugiere 1–2 recursos abiertos.

En explicaciones y ejemplos, evita consejos genéricos. Explica el PORQUÉ CONCEPTUAL o PROCEDIMENTAL específico (p. ej., error en despeje, confusión de fechas, mala interpretación de gráfica).

Estructura la respuesta con estas secciones (usa encabezados markdown ###):
- "Resumen general" (2–3 frases que resuman el progreso y las áreas clave a mejorar. Menciona específicamente cuántas preguntas falló y en qué temas o tipos de preguntas).
- "Tendencia y variabilidad" (3–5 bullets. Analiza la consistencia: ¿es errático o estable? ¿Hay fatiga visible en los tiempos? ¿La mejora es sostenida o hay altibajos?).
- "Progreso respecto al oficial" (3–5 bullets con veredicto de utilidad. Compara específicamente: ¿mejoró en las mismas preguntas donde falló inicialmente? ¿Qué tan útil fue la práctica? ¿Qué preguntas corrigió entre intentos?).
- "Equilibrio puntaje-tiempo" (2–3 bullets. Analiza si el tiempo por pregunta indica dudas, respuestas al azar, o comprensión sólida. ¿Dedicó suficiente tiempo a las preguntas difíciles? ¿Hay relación entre tiempo invertido y acierto? ¿El tiempo mejoró entre intentos?).
- "Análisis de errores" (MÍNIMO 5 bullets, puede ser más si hay varias preguntas incorrectas. **OBLIGATORIO:** Si hay datos de incorrectasDetalle al inicio de este prompt, DEBES mencionar CADA pregunta donde falló. Para CADA pregunta en incorrectasDetalle, crea un bullet DETALLADO que incluya: (1) **Enunciado completo** de la pregunta (copia el texto exacto), (2) **Qué respondió el estudiante** (del campo "seleccion" - menciona la opción exacta), (3) **Cuál es la respuesta correcta** (del campo "correctas" - menciona la opción exacta), (4) **Por qué falló específicamente** (error conceptual/procedimental/atención con explicación detallada del razonamiento incorrecto), (5) **Cómo resolverla correctamente paso a paso** (explica cada paso del proceso de solución como si fueras un tutor, incluyendo fórmulas, conceptos clave, y el razonamiento correcto), (6) **Tipo de pregunta y materia** (si está disponible en incorrectasDetalle). **NO uses frases genéricas. Da EJEMPLOS CONCRETOS con los enunciados reales de las preguntas. Sé PEDAGÓGICO: explica como si estuvieras enseñando a alguien que no entiende el tema.** Si no hay datos de incorrectasDetalle, entonces analiza el tipo de error basándote en los datos disponibles. **CRÍTICO:** Antes de escribir sobre el último intento, verifica: si el puntaje es 80% y hay 5 preguntas totales, entonces correctas = 4 e incorrectas/omitidas = 1. Si el puntaje es 100%, entonces correctas = totalPreguntas. **NUNCA digas "todas las preguntas fueron correctas" si el puntaje es menor a 100%. Si el último intento tiene errores, menciona cuántos hubo y analiza CADA uno con ejemplos específicos usando los datos de incorrectasDetalle.**
- "Recomendaciones técnicas" (exactamente 3 bullets. Sugiere técnicas de estudio concretas como 'Técnica Feynman', 'Pomodoro', 'Mapas mentales', o ejercicios específicos para los temas fallados. Cada recomendación debe estar vinculada a las preguntas específicas donde falló. Por ejemplo: "Para mejorar en [tema de la pregunta X], aplica la técnica Feynman explicando el concepto en voz alta").
- "Plan de estudio personalizado" (2–3 bullets. Basado en las preguntas específicas donde falló, sugiere un plan de estudio concreto: qué temas repasar primero, qué ejercicios hacer, cuánto tiempo dedicar a cada tema, y en qué orden estudiar. Sé específico y accionable: "Día 1-2: Repasa [tema de pregunta X] con [tipo de ejercicio]. Día 3-4: Practica [tema de pregunta Y]...").
- "Conclusión breve" (2–3 frases motivadoras y realistas que reconozcan el progreso específico del estudiante y motiven a seguir mejorando en las áreas identificadas).

Usa bullets, negritas y formato markdown para hacer el análisis más legible. Mantén la respuesta entre 400 y 600 palabras para dar más detalle técnico y pedagógico. Prioriza la calidad y utilidad sobre la brevedad.
\n${Array.isArray(erroresRecurrentes) && erroresRecurrentes.length ? `Referencias de errores recurrentes detectados (no lo pegues literal, úsalo para redactar bullets con pistas y recursos):\n${JSON.stringify(erroresRecurrentes.slice(0, 5))}` : ''}
\nIMPORTANTE: Si hay preguntas incorrectas (campo incorrectasLista con textos de enunciado O incorrectasDetalle con datos detallados), DEBES agregar al final una sección titulada exactamente "Ejemplos breves de preguntas con error" con 2–5 bullets (una por cada pregunta importante donde falló). En cada bullet, incluye: (1) Un resumen claro del enunciado o tema de la pregunta (≤ 110 caracteres), (2) Qué respondió incorrectamente (si está disponible), (3) Un micro‑consejo práctico específico y accionable para esa pregunta (una frase que diga QUÉ hacer, no solo qué evitar). **PRIORIZA usar incorrectasDetalle si está disponible porque tiene más información.** Si no hay preguntas incorrectas, omite esa sección. No omitas esta sección si incorrectasLista o incorrectasDetalle tienen elementos.

**ESTILO Y TONO:**
- Sé claro, directo y pedagógico. Explica como un tutor paciente que quiere que el estudiante entienda.
- Usa ejemplos concretos y números específicos cuando sea posible (no digas "algunas preguntas", di "2 preguntas" o "3 de las 5 preguntas").
- Reconoce el esfuerzo del estudiante pero sé honesto sobre las áreas de mejora.
- Haz que el análisis sea accionable: el estudiante debe saber QUÉ hacer después de leerlo.
- Evita jerga técnica innecesaria, pero no simplifiques demasiado conceptos importantes.
- Usa formato markdown para hacer el texto más legible (negritas para conceptos clave, listas, separadores).
- En las explicaciones paso a paso, usa un lenguaje claro: "Primero...", "Luego...", "Finalmente...".
- Conecta las recomendaciones con las preguntas específicas donde falló. Menciona los temas por nombre cuando sea relevante.`;

  // Función para construir el payload según el modelo (los legacy no soportan systemInstruction)
  const buildPayloadForModel = (modelo) => {
    const isLegacyPro = modelo === 'gemini-pro';
    const finalUserQuery = isLegacyPro
      ? `${systemPrompt}\n\n----------------\n\n${userQuery}`
      : userQuery;

    return {
      contents: [{ parts: [{ text: finalUserQuery }] }],
      // Solo enviamos systemInstruction si NO es el modelo legacy
      ...(!isLegacyPro && { systemInstruction: { parts: [{ text: systemPrompt }] } }),
      generationConfig: {
        maxOutputTokens: 3072,
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
      },
      model: modelo, // Incluir el modelo en el payload para el proxy
    };
  };

  let json, text;
  let geminiSuccess = false; // Flag para controlar si necesitamos ir a Groq

  // =================================================================================
  // 1. INTENTO CON GEMINI (Estrategia Principal) - SOLO SI NO ESTÁ CONFIGURADO GROQ ONLY
  // =================================================================================
  if (!USE_GROQ_ONLY) {
    try {
      let modelosAProbar = [];
      if (QUIZ_AI_MODEL_CONFIGURED) {
        modelosAProbar = [QUIZ_AI_MODEL_CONFIGURED, ...MODELOS_DISPONIBLES.filter(m => m !== QUIZ_AI_MODEL_CONFIGURED)];
      } else {
        modelosAProbar = MODELOS_DISPONIBLES;
      }

      let res = null;
      let modeloUsado = null;

      console.log('🔍 Iniciando análisis de quiz con IA (usando proxy backend)...');

      // Intentar cada modelo hasta encontrar uno que funcione
      for (const modelo of modelosAProbar) {
        try {
          const payload = buildPayloadForModel(modelo);

          console.log(`📡 Probando modelo: ${modelo} (vía proxy ${PROXY_ENDPOINT})`);

          res = await fetch(PROXY_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ ...payload, purpose: 'analisis' }), // Usa GEMINI_API_KEY_ANALISIS
          });

          if (res.ok) {
            json = await res.json();
            text = extractTextFromGemini(json);
            if (text) {
              modeloUsado = modelo;
              geminiSuccess = true;
              console.log(`✅ Análisis generado exitosamente con ${modeloUsado} (vía proxy)`);
              break; // Éxito con Gemini, salir del loop
            }
          } else {
            console.warn(`⚠️ Gemini ${modelo} no respondió OK: ${res.status}`);
          }
        } catch (err) {
          console.warn(`⚠️ Error de red al probar modelo ${modelo}:`, err.message);
        }
      }
    } catch (err) {
      console.warn('Fallo general en bloque Gemini:', err);
    }
  } else {
    console.log('⚙️ Configurado para usar solo Groq. Saltando intento con Gemini.');
  }

  // =================================================================================
  // 2. INTENTO CON GROQ (Respaldo si Gemini falló)
  // =================================================================================
  if (!geminiSuccess) {
    console.log('🔄 Gemini falló o no devolvió texto. Activando respaldo de GROQ...');

    try {
      // Groq usa formato OpenAI (messages), no el formato de Google (contents)
      const groqPayload = {
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userQuery }
        ],
        temperature: 0.7,
        max_tokens: 3072
      };

      const resGroq = await fetch(GROQ_PROXY_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(groqPayload), // Asegúrate de que tu backend soporte este body
      });

      if (resGroq.ok) {
        const jsonGroq = await resGroq.json();
        text = extractTextFromGroq(jsonGroq);
        if (text) {
          console.log('✅ Respaldo Groq respondió exitosamente.');
        } else {
          console.warn('⚠️ Groq respondió OK pero sin contenido de texto.');
        }
      } else {
        console.warn(`❌ Groq falló con status: ${resGroq.status}`);
      }
    } catch (groqErr) {
      console.error('❌ Error crítico al intentar conectar con Groq:', groqErr);
    }
  }

  // =================================================================================
  // 3. FALLBACK FINAL (Si Gemini y Groq fallaron)
  // =================================================================================
  if (!text) {
    if (json?.promptFeedback?.blockReason) {
      console.warn('IA bloqueó el prompt:', json.promptFeedback.blockReason, json.promptFeedback.safetyRatings || '');
    }
    console.warn('IA sin texto utilizable (ni Gemini ni Groq). Usando fallback local.');
    return buildFallbackAnalysis(params);
  }

  // =================================================================================
  // 4. POST-PROCESAMIENTO (Común para cualquier IA que haya respondido)
  // =================================================================================

  // Fallback: si la IA omitió la sección de ejemplos y tenemos datos, la agregamos de forma determinística
  const shouldAppendExamples = Array.isArray(incorrectasLista) && incorrectasLista.length > 0;
  const norm = normalize(text);
  const hasExamplesSection = norm.includes('ejemplos breves de preguntas con error')
    || (norm.includes('ejemplos') && norm.includes('preguntas') && norm.includes('error'));
  let out = text;
  if (shouldAppendExamples && !hasExamplesSection) {
    const section = buildExamplesSection(incorrectasLista);
    if (section) out += section;
  }
  // Garantizar secciones mínimas
  out = ensureSections(out, params);
  // Prepend saludo humano si el texto no lo incluye ya
  const start = String(out).slice(0, 280).toLowerCase();
  const hasHumanIntro = start.includes('hola') || start.includes('¡hola') || start.includes('veo que') || start.includes('vamos a');
  if (!hasHumanIntro) {
    out = buildHumanIntro(params) + '\n\n' + out;
  }
  // Si faltó la sección de progreso, agregarla (antes de Equilibrio o Tendencia)
  if (!hasHeadingLoose(out, 'Progreso respecto al oficial')) {
    const sec = buildSecProgresoOficial(params);
    // Preferimos insertarla antes de "Equilibrio puntaje-tiempo"; si no existe, antes de "Tendencia y variabilidad"
    if (hasHeadingLoose(out, 'Equilibrio puntaje-tiempo')) {
      out = insertBeforeHeading(out, 'Equilibrio puntaje-tiempo', sec);
    } else if (hasHeadingLoose(out, 'Tendencia y variabilidad')) {
      out = insertBeforeHeading(out, 'Tendencia y variabilidad', sec);
    } else {
      out += sec;
    }
  }
  // Añadir explicación detallada si tenemos datos y la IA no la incluyó
  const hasExplain = normalize(out).includes('explicación de preguntas incorrectas');
  if (!hasExplain) {
    let section = '';
    if (Array.isArray(incorrectasDetalle) && incorrectasDetalle.length) {
      // Limitar a 3 ítems para acotar longitud
      section = buildExplainSection(incorrectasDetalle.slice(0, 3));
    } else if (Array.isArray(incorrectasLista) && incorrectasLista.length) {
      // Construir explicación mínima a partir de la lista de enunciados
      section = buildExplainFromList(incorrectasLista.slice(0, 3));
    }
    if (section) {
      // Insertar ANTES de “Recomendaciones prácticas” si existe esa sección
      out = insertBeforeHeading(out, 'Recomendaciones técnicas', section);
    }
  }
  // Insertar sección de errores recurrentes si contamos con datos y no aparece
  if (Array.isArray(erroresRecurrentes) && erroresRecurrentes.length) {
    const hasRec = hasHeadingLoose(out, 'Errores recurrentes y recursos');
    const sec = buildRecurringSection(erroresRecurrentes);
    if (sec && !hasRec) {
      // La colocamos antes de “Recomendaciones técnicas”
      out = insertBeforeHeading(out, 'Recomendaciones técnicas', sec);
    }
  }
  // Asegurar guía de recursos siempre presente (antes de la conclusión)
  if (!hasHeadingLoose(out, 'Guía para encontrar recursos')) {
    const secGuia = buildSecResourceGuide(params);
    out = insertBeforeHeading(out, 'Conclusión breve', secGuia);
  }

  // Marca la fuente según quién respondió
  const sourceTag = geminiSuccess ? 'GEMINI' : 'GROQ';
  return out + `\n\n<<<AI_SOURCE:${sourceTag}>>>`;
}