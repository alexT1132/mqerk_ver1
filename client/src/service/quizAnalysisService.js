// Servicio dedicado para análisis de rendimiento de quizzes con IA (Gemini)
// Usa variables de entorno separadas para no saturar el otro servicio.

const QUIZ_AI_API_KEY = import.meta?.env?.VITE_GEMINI_QUIZ_API_KEY || 'AIzaSyDEGxWYeiRqRMnv2LmpqNKXiZiCt44oL78';
const QUIZ_AI_MODEL = import.meta?.env?.VITE_GEMINI_QUIZ_MODEL || 'gemini-2.5-flash-preview-05-20';

export function isQuizIAConfigured() {
  return Boolean(QUIZ_AI_API_KEY);
}

function buildEndpoint() {
  return `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(QUIZ_AI_MODEL)}:generateContent?key=${encodeURIComponent(QUIZ_AI_API_KEY)}`;
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

/**
 * Ejecuta un análisis resumido de desempeño para un quiz específico.
 * params: {
 * itemName: string,
 * totalIntentos: number,
 * mejorPuntaje: number,
 * promedio: number,
 * scores: number[] (orden cronológico),
 * }
 */
export async function analyzeQuizPerformance(params) {
  // Si no hay configuración de IA, devolvemos directamente un análisis local de fallback.
  if (!isQuizIAConfigured()) {
    return buildFallbackAnalysis(params);
  }
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

  // Utilidades locales para generación de fallback
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
    // Gramática y ortografía (solo si explícito)
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

      const secOportunidades = `\n\n### Oportunidades clave\n\n` +
        `- Refuerza los temas con mayor incidencia de error del último intento.\n` +
        `- Revisa preguntas con lectura compleja; identifica palabras clave.\n` +
        `- Ajusta el ritmo si hay respuestas apresuradas o excesivos cambios.`;

      const secProgreso = buildSecProgresoOficial(p);
      const secRecurrentes = buildRecurringSection(p?.erroresRecurrentes);
      const secRecs = `\n\n### Recomendaciones prácticas\n\n` +
        `- Haz 10–15 min de práctica dirigida en los tópicos con más errores.\n` +
        `- Repite un intento enfocado: primero comprensión del enunciado, luego alternativas.\n` +
        `- Anota 2–3 reglas/tips por tema en una hoja de repaso rápido.`;

      const secConclusion = `\n\n### Conclusión breve\n\n` +
        `Vas construyendo base. Con práctica enfocada en los temas críticos y control del ritmo, ` +
        `tu puntaje debería subir en los siguientes intentos.`;

      const intro = buildHumanIntro(p);
      const explic = buildExplainSection(p?.incorrectasDetalle);
      const ejemplos = buildExamplesSection(p?.incorrectasLista);
      const secGuia = buildSecResourceGuide(p);
      // Orden: Intro humano → Resumen → Tendencia → Progreso → Equilibrio → Oportunidades → Explicación → Recurrentes → Recs → Guía → Conclusión → Ejemplos
      return [intro, secResumen, secTendencia, secProgreso, secEquilibrio, secOportunidades, explic, secRecurrentes, secRecs, secGuia, secConclusion, ejemplos, '\n\n<<<AI_SOURCE:FALLBACK>>>'].join('');
    } catch (e) {
      console.warn('No se pudo construir análisis local de fallback:', e);
      return '### Análisis\n\nNo se pudo obtener la respuesta de la IA. Revisa tu conexión e intenta nuevamente.';
    }
  };

  // Garantiza secciones mínimas en la salida final y normaliza encabezados
  const escapeReg = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const stripAccents = (s) => String(s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '');
  const hasHeadingStrict = (md, title) => new RegExp(`(^|\n)###\s+${escapeReg(title)}\b`, 'i').test(String(md || ''));
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
      'Oportunidades clave',
      'Guía para encontrar recursos',
      'Errores recurrentes y recursos',
      'Recomendaciones prácticas',
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
    return `\n\n### Tendencia y variabilidad\n\n- Secuencia de puntajes: ${scores.join(', ') || 'N/D'}.\n- Pendiente de tendencia: ${pendiente} (${label}). Variabilidad (DE): ${desviacion}.\n- Interpreta si la pendiente es positiva (mejora), negativa (descenso) o cercana a 0 (estable).`;
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
  const buildSecOportunidades = () => `\n\n### Oportunidades clave\n\n- Refuerza los temas con mayor incidencia de error del último intento.\n- Revisa preguntas con lectura compleja; identifica palabras clave.\n- Ajusta el ritmo si hay respuestas apresuradas o excesivos cambios.`;
  const buildSecRecs = () => `\n\n### Recomendaciones prácticas\n\n- Haz 10–15 min de práctica dirigida en los tópicos con más errores.\n- Repite un intento enfocado: primero comprensión del enunciado, luego alternativas.\n- Anota 2–3 reglas/tips por tema en una hoja de repaso rápido.`;
  const buildSecConclusion = () => `\n\n### Conclusión breve\n\nVas construyendo base. Con práctica enfocada en los temas críticos y control del ritmo, tu puntaje debería subir en los siguientes intentos.`;

  const ensureSections = (md, p) => {
    let out = String(md || '');
    // Solo añadimos si faltan, para evitar duplicados
    if (!hasHeadingLoose(out, 'Resumen general')) out += buildSecResumen(p);
    if (!hasHeadingLoose(out, 'Tendencia y variabilidad')) out += buildSecTendencia(p);
    if (!hasHeadingLoose(out, 'Equilibrio puntaje-tiempo')) out += buildSecEquilibrio(p);
    if (!hasHeadingLoose(out, 'Oportunidades clave')) out += buildSecOportunidades(p);
    if (!hasHeadingLoose(out, 'Recomendaciones prácticas')) out += buildSecRecs(p);
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
  // Se eliminaron las instrucciones sobre la longitud y el contenido del resumen para evitar conflictos
  // con las instrucciones más detalladas del userQuery.
  const systemPrompt = `Actúa como un tutor experto, amigable y motivador. Tu tono debe ser siempre positivo, constructivo y alentador. Tu objetivo es ayudar al estudiante a entender su rendimiento y a sentirse capacitado para mejorar. Responde siempre en español.`;

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
- Tiempo total (s): ${typeof totalTiempoIntento !== 'undefined' && totalTiempoIntento != null ? Math.round(totalTiempoIntento / 1000) : 'N/D'}
- Tiempo promedio por pregunta (s): ${typeof promedioTiempoPregunta !== 'undefined' && promedioTiempoPregunta != null ? Math.round(promedioTiempoPregunta / 1000) : 'N/D'}
- Preguntas respondidas incorrectamente (muestra): ${(Array.isArray(incorrectasLista) && incorrectasLista.length) ? incorrectasLista.join(' | ') : 'N/D'}` : ''}
${Array.isArray(incorrectasDetalle) && incorrectasDetalle.length ? `
Adicional (para explicar preguntas incorrectas con más detalle):
- Genera una subsección: "Explicación de preguntas incorrectas" con 2–5 ítems. Para cada ítem incluye:
  - Enunciado (1 línea)
  - Elegiste: [opción(es) seleccionada(s)]
  - Correcta(s): [opción(es) correctas]
  - Breve porqué (1 frase)
Referencia de datos (no lo pegues literal, úsalo para redactar):
${JSON.stringify(incorrectasDetalle.slice(0, 5))}` : ''}
\nInstrucciones: comienza con un saludo breve y humano (2–3 frases) dirigido al estudiante, mencionando su número de intentos y ánimo por seguir mejorando. Luego genera un análisis claro y bien estructurado usando estas métricas. Dado que el estudiante ha realizado al menos 2 intentos, tu análisis debe centrarse fuertemente en la COMPARACIÓN y el PROGRESO. Analiza si los errores se repiten (patrones de fallo persistentes) o si son nuevos. RESPETA la regla: el diagnóstico oficial es el intento 1; los demás intentos son práctica y se usan para observar progreso y utilidad. Debes incluir una sección titulada exactamente "Progreso respecto al oficial" con 3–5 bullets que reporten: intentos de práctica, delta último vs. anterior, delta último vs. oficial, delta mejor vs. oficial y un veredicto de utilidad (Alta/Media/Ligera/Neutral/Baja) basado en el delta mejor vs. oficial (≥15 Alta; ≥7 Media; ≥3 Ligera; ≥0 Neutral; <0 Baja). Si recibes una lista de errores recurrentes entre intentos, añade también una sección titulada exactamente "Errores recurrentes y recursos" con 2–5 bullets: resume el enunciado, indica (veces) y da una pista breve útil; sugiere 1–2 recursos abiertos (no privativos) por tema. En las secciones de explicación y ejemplos, evita consejos genéricos de ortografía/gramática (b/v, g/j, tildes, puntuación) a menos que el ENUNCIADO sea explícitamente de Lengua/Gramática; en su lugar, explica el porqué conceptual específico (p. ej., orden de planetas, fecha histórica, propiedad matemática). Estructura la respuesta con estas secciones (usa encabezados markdown ###):
- "Resumen general" (2–3 frases).
- "Tendencia y variabilidad" (3–5 bullets con interpretación clara de la evolución).
- "Progreso respecto al oficial" (3–5 bullets con veredicto de utilidad).
- "Equilibrio puntaje-tiempo" (2–3 bullets con posibles causas y efectos).
- "Oportunidades clave" (3–5 bullets, concretas y accionables, enfocadas en lo que falta por mejorar).
- "Recomendaciones prácticas" (exactamente 3 bullets, cada una con una acción concreta y breve).
- "Conclusión breve" (2–3 frases motivadoras y realistas).
Usa bullets y negritas para resaltar conceptos clave. Mantén la respuesta entre 240 y 380 palabras como máximo.
\n${Array.isArray(erroresRecurrentes) && erroresRecurrentes.length ? `Referencias de errores recurrentes detectados (no lo pegues literal, úsalo para redactar bullets con pistas y recursos):\n${JSON.stringify(erroresRecurrentes.slice(0, 5))}` : ''}
\nIMPORTANTE: Si hay preguntas incorrectas (campo incorrectasLista con textos de enunciado), DEBES agregar al final una sección titulada exactamente "Ejemplos breves de preguntas con error" con 2–3 bullets. En cada bullet, incluye un resumen corto (≤ 110 caracteres) del enunciado y un micro‑consejo práctico (una frase). Si no hay preguntas incorrectas, omite esa sección. No omitas esta sección si incorrectasLista tiene elementos.`;

  const payload = {
    contents: [{ parts: [{ text: userQuery }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      maxOutputTokens: 3072,
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
    },
  };

  let json, text;
  try {
    const res = await fetch(buildEndpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.warn('IA no OK:', res.status, res.statusText);
      return buildFallbackAnalysis(params);
    }
    json = await res.json();
    text = extractTextFromGemini(json);
  } catch (err) {
    console.warn('Fallo al llamar/parsear IA, usando fallback:', err);
    return buildFallbackAnalysis(params);
  }
  if (!text) {
    if (json?.promptFeedback?.blockReason) {
      console.warn('IA bloqueó el prompt:', json.promptFeedback.blockReason, json.promptFeedback.safetyRatings || '');
    } else if (Array.isArray(json?.candidates) && json.candidates[0]?.finishReason) {
      console.warn('IA finishReason:', json.candidates[0].finishReason);
    } else {
      console.warn('IA sin texto utilizable, json=', json);
    }
    return buildFallbackAnalysis(params);
  }
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
      out = insertBeforeHeading(out, 'Recomendaciones prácticas', section);
    }
  }
  // Insertar sección de errores recurrentes si contamos con datos y no aparece
  if (Array.isArray(erroresRecurrentes) && erroresRecurrentes.length) {
    const hasRec = hasHeadingLoose(out, 'Errores recurrentes y recursos');
    const sec = buildRecurringSection(erroresRecurrentes);
    if (sec && !hasRec) {
      // La colocamos antes de “Recomendaciones prácticas”
      out = insertBeforeHeading(out, 'Recomendaciones prácticas', sec);
    }
  }
  // Asegurar guía de recursos siempre presente (antes de la conclusión)
  if (!hasHeadingLoose(out, 'Guía para encontrar recursos')) {
    const secGuia = buildSecResourceGuide(params);
    out = insertBeforeHeading(out, 'Conclusión breve', secGuia);
  }
  return out + '\n\n<<<AI_SOURCE:GEMINI>>>';
}
