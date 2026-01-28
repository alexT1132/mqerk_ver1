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



      const intro = buildHumanIntro(p);

      // Resumen muy breve (sin secciones genéricas)
      const secResumen = `\n\n### Resultado del intento\n\n` +
        `- Calificación: ${ultimo}%\n` +
        `- Correctas: ${corr || 0} / ${totPreg || 0}\n` +
        `- Incorrectas: ${inc || 0}\n` +
        `- Total de intentos: ${totalIntentos}\n` +
        `- Mejor puntaje: ${mejor}%`;

      const explic = buildExplainSection(p?.incorrectasDetalle);
      const secRecurrentes = buildRecurringSection(p?.erroresRecurrentes);
      const secGuia = buildSecResourceGuide(p);

      const secConclusion = `\n\n### Próximos pasos\n\n` +
        `Enfócate en dominar los temas donde fallaste. Usa los recursos sugeridos y practica con ejercicios similares. ` +
        `La constancia es clave para mejorar.`;

      // Orden simplificado: Intro → Resumen → Explicación → Recurrentes → Guía → Conclusión (SIN tendencia, equilibrio ni progreso)
      return [intro, secResumen, explic, secRecurrentes, secGuia, secConclusion, '\n\n<<<AI_SOURCE:FALLBACK>>>'].join('');
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
    // if (!hasHeadingLoose(out, 'Tendencia y variabilidad')) out += buildSecTendencia(p);
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

  // NUEVO: El systemPrompt se enfoca en análisis profundo de errores específicos
  const systemPrompt = `Eres un tutor académico experto enfocado en corrección de errores y aprendizaje efectivo.
  
  Tu análisis debe ser:
  1. ENFOCADO EN ERRORES: Dedica el 80% del análisis a explicar detalladamente cada pregunta que el alumno falló.
  2. PASO A PASO: Para cada error, proporciona una explicación completa de cómo resolverlo, con ejemplos concretos.
  3. PRÁCTICO Y ACCIONABLE: Indica exactamente qué estudiar, cómo practicar y cómo usar IA (ChatGPT/Gemini) para reforzar el aprendizaje.
  4. DETECTAR PATRONES: Identifica si hay errores recurrentes y explica por qué ocurren.
  
  IMPORTANTE: 
  - NO incluyas secciones genéricas sobre "tendencia" o "variabilidad" a menos que sean críticas para entender el patrón de errores.
  - Enfócate en lo que el alumno necesita HACER para mejorar, no en estadísticas abstractas.
  - Sé directo pero constructivo. El objetivo es que el alumno entienda sus errores y sepa exactamente cómo corregirlos.`;

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

  // Construir lista de preguntas incorrectas con flag de reincidencia
  const listaIncorrectasPrompt = (Array.isArray(incorrectasDetalle) && incorrectasDetalle.length > 0) ?
    incorrectasDetalle.slice(0, 10).map(item => {
      // Verificar si este error es recurrente
      const esRecurrente = Array.isArray(erroresRecurrentes) && erroresRecurrentes.some(r => {
        const txtA = String(r.enunciado || '').toLowerCase().trim();
        const txtB = String(item.enunciado || '').toLowerCase().trim();
        return txtA.includes(txtB.substring(0, 20)) || txtB.includes(txtA.substring(0, 20));
      });
      return {
        ...item,
        es_reincidente: esRecurrente
      };
    }) : [];

  // El userQuery contiene todas las instrucciones específicas sobre la TAREA a realizar.
  const userQuery = `ANÁLISIS DETALLADO DE ERRORES para: "${itemName || 'Quiz'}".
Estudiante: ${alumnoNombre ? alumnoNombre : 'Alumno'}.

RESULTADO DEL INTENTO ${intentoNumero || 1}:
- Calificación: ${ultimoPuntaje}%
- Correctas: ${correctasIntento || 0} / ${totalPreguntasIntento || 0}
- Incorrectas: ${incorrectasIntento || 0}
- Total de intentos realizados: ${totalIntentos || 1}

${listaIncorrectasPrompt.length > 0 ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 ANÁLISIS DETALLADO DE CADA ERROR (SECCIÓN PRINCIPAL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ IMPORTANTE: Debes analizar TODAS las preguntas que el estudiante falló en CUALQUIER intento, no solo las del último intento.

PRIORIDAD DE ANÁLISIS:

1. **MÁXIMA PRIORIDAD - Errores Inconsistentes (🚨 CONOCIMIENTO INESTABLE):**
   Preguntas que a veces acertó y a veces falló en diferentes intentos.
   Esto indica:
   - Está adivinando (no domina el concepto)
   - Tuvo suerte en algunos intentos
   - Conocimiento superficial o inestable
   
   Ejemplo: Si en 4 intentos respondió: Correcta, Incorrecta, Correcta, Incorrecta
   → NO domina el tema, solo está adivinando o tuvo suerte.

2. **ALTA PRIORIDAD - Errores Reincidentes (⚠️ ERROR REINCIDENTE):**
   Preguntas que falló en MÚLTIPLES intentos.
   Esto indica desconocimiento persistente del concepto.

3. **PRIORIDAD NORMAL - Errores Únicos:**
   Preguntas que falló solo en un intento.
   Pueden ser errores de atención o conceptos nuevos.

Para CADA pregunta incorrecta, proporciona un análisis COMPLETO siguiendo este formato:

### [Pregunta N] [Título descriptivo del tema] [MARCADOR DE PRIORIDAD]

**Marcadores posibles:**
- 🚨 CONOCIMIENTO INESTABLE (falló en algunos intentos, acertó en otros)
- ⚠️ ERROR REINCIDENTE (falló en múltiples intentos)
- (sin marcador para errores únicos)

**Historial de respuestas en todos los intentos:**
[Muestra cómo respondió en cada intento: Intento 1: Correcta, Intento 2: Incorrecta, etc.]

**Tu respuesta (en el intento donde falló):** "[Opción que eligió]" (Incorrecta)

**Respuesta correcta:** "[Opción correcta completa]"

**¿Por qué fallaste?**
[Explicación clara y directa del error conceptual. Si es CONOCIMIENTO INESTABLE, enfatiza que NO domina el tema aunque a veces acierte. Identifica si:
- Confundió conceptos similares
- No conocía la regla/fórmula
- Error de lectura o interpretación
- Aplicó mal un procedimiento
- Está adivinando (si es inconsistente)]

**Cómo resolverlo paso a paso:**
1. [Primer paso específico con ejemplo]
2. [Segundo paso específico con ejemplo]
3. [Tercer paso específico con ejemplo]
[Continúa hasta completar el proceso de resolución]

**Ejemplo similar resuelto:**
[Proporciona un ejemplo concreto similar a la pregunta, resuelto paso a paso para que el alumno vea la aplicación práctica]

**Qué estudiar específicamente:**
- [Concepto/tema específico 1]
- [Concepto/tema específico 2]
- [Práctica recomendada]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DATA DE PREGUNTAS INCORRECTAS (TODOS LOS INTENTOS):
${JSON.stringify(listaIncorrectasPrompt, null, 2)}

NOTA IMPORTANTE: 
- Si "es_reincidente" es true, este error ya ocurrió en intentos anteriores. Marca con "⚠️ ERROR REINCIDENTE".
- Si una pregunta se respondió correctamente en algunos intentos e incorrectamente en otros, marca con "🚨 CONOCIMIENTO INESTABLE" y enfatiza que NO domina el tema.
- DEBES analizar TODAS las preguntas que aparecen en la data, no solo las del último intento.
` : `
¡Excelente! No hubo errores en este intento. 

Calificación perfecta: ${ultimoPuntaje}%

Sugerencias para seguir avanzando:
- Practica con ejercicios más avanzados del mismo tema
- Explora aplicaciones prácticas de estos conceptos
- Ayuda a compañeros a entender estos temas (enseñar refuerza el aprendizaje)
`}

${listaIncorrectasPrompt.length > 0 ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 RECURSOS DE ESTUDIO Y PLAN DE RECUPERACIÓN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Basándote en los errores detectados, proporciona:

**1. Recursos de estudio específicos** (mínimo 3):

Para cada tema fallado:
- **Tema:** [Nombre del tema/concepto específico]
- **Qué buscar en Google/YouTube:** "[Query exacta de búsqueda]" 
  Ejemplo: "reglas de acentuación diacrítica ejercicios resueltos pdf"
- **Recursos recomendados:** 
  - [Libro/manual específico]
  - [Canal de YouTube o video específico]
  - [Sitio web confiable: Khan Academy, Wikipedia, RAE, etc.]
- **Ejercicios prácticos:** [Tipo de ejercicios que debe hacer]

**2. Cómo usar IA para estudiar estos temas:**

Proporciona 3-5 prompts ESPECÍFICOS que el alumno puede usar con ChatGPT o Gemini:

📝 **Prompt 1 - Para entender el concepto:**
"[Prompt exacto que puede copiar y pegar]"
Ejemplo: "Explícame la diferencia entre 'haber' y 'a ver' con 10 ejemplos prácticos y ejercicios"

📝 **Prompt 2 - Para practicar:**
"[Prompt exacto que puede copiar y pegar]"
Ejemplo: "Genera 15 ejercicios de acentuación diacrítica con sus respuestas, ordenados de fácil a difícil"

📝 **Prompt 3 - Para verificar comprensión:**
"[Prompt exacto que puede copiar y pegar]"
Ejemplo: "Hazme un examen de 10 preguntas sobre [tema] y corrige mis respuestas explicando cada error"

[Continúa con más prompts según los temas fallados]

**3. Plan de estudio sugerido:**

Día 1-2: [Actividades específicas]
Día 3-4: [Actividades específicas]
Día 5-7: [Actividades específicas]
` : ''}

${totalIntentos > 1 && (pendienteTendencia !== null || promedioTiempoPregunta) ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 OBSERVACIONES SOBRE TU PROGRESO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${pendienteTendencia !== null ? `**Tendencia de puntajes:** ${pendienteTendencia > 0.2 ? '📈 Mejorando (sigue así)' : pendienteTendencia < -0.2 ? '📉 Descendiendo (revisa tu estrategia de estudio)' : '➡️ Estable'}
` : ''}
${promedioTiempoPregunta ? `**Tiempo por pregunta:** ${Math.round(promedioTiempoPregunta / 1000)}s promedio ${Math.round(promedioTiempoPregunta / 1000) < 30 ? '(⚠️ Muy rápido - puede indicar respuestas al azar)' : Math.round(promedioTiempoPregunta / 1000) > 120 ? '(⚠️ Muy lento - puede indicar dudas conceptuales)' : '(✓ Ritmo adecuado)'}
` : ''}
` : ''}

INSTRUCCIONES CRÍTICAS:
- El 80% del análisis debe ser sobre las preguntas incorrectas con explicaciones DETALLADAS
- NO incluyas secciones genéricas como "Resumen general", "Tendencia y variabilidad", "Equilibrio puntaje-tiempo" a menos que sean CRÍTICAS para entender los errores
- Cada pregunta incorrecta debe tener: explicación del error + pasos de resolución + ejemplo similar + recursos específicos
- Los prompts de IA deben ser COPIABLES directamente (entre comillas)
- Sé específico, práctico y accionable en cada recomendación

⚠️ MUY IMPORTANTE - ANÁLISIS COMPLETO:
- Debes analizar TODAS las preguntas que el estudiante falló en CUALQUIER intento
- Si solo tienes data del último intento, INFIERE y ANALIZA basándote en:
  * Los errores recurrentes mencionados
  * El historial de puntajes (si bajó/subió puede indicar nuevos errores o corrección de antiguos)
  * El número total de intentos vs preguntas incorrectas actuales
- PRIORIZA los errores inconsistentes (que a veces acertó y a veces falló) porque indican conocimiento inestable
- Si una pregunta aparece en "errores recurrentes" pero no en el último intento, IGUAL debes analizarla porque indica que la acertó por suerte
`;

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
  let groqSuccess = false; // Flag para saber si Groq respondió

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
          groqSuccess = true;
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
  // if (!hasHeadingLoose(out, 'Progreso respecto al oficial')) {
  //   const sec = buildSecProgresoOficial(params);
  //   // Preferimos insertarla antes de "Equilibrio puntaje-tiempo"; si no existe, antes de "Tendencia y variabilidad"
  //   if (hasHeadingLoose(out, 'Equilibrio puntaje-tiempo')) {
  //     out = insertBeforeHeading(out, 'Equilibrio puntaje-tiempo', sec);
  //   } else if (hasHeadingLoose(out, 'Tendencia y variabilidad')) {
  //     out = insertBeforeHeading(out, 'Tendencia y variabilidad', sec);
  //   } else {
  //     out += sec;
  //   }
  // }
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
  const sourceTag = geminiSuccess ? 'GEMINI' : groqSuccess ? 'GROQ' : 'FALLBACK';
  return out + `\n\n<<<AI_SOURCE:${sourceTag}>>>`;
}