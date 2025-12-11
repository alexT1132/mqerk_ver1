// Servicio aislado para generación de preguntas con IA (Gemini)
// No modifica ni depende del geminiService existente

const PROXY_ENDPOINT = '/api/ai/gemini/generate';
const MODEL = (import.meta?.env?.VITE_GEMINI_MODEL) || 'gemini-2.5-flash';
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
  try { localStorage.setItem(COOLDOWN_KEY, String(Date.now() + COOLDOWN_MS)); } catch { }
};

// Sistema de tracking de uso diario (separado del análisis)
const USAGE_KEY = 'ai_questions_usage';
const DAILY_LIMIT_ASESOR = 20; // Asesores pueden generar más preguntas

export const getQuestionUsageToday = () => {
  try {
    const data = JSON.parse(localStorage.getItem(USAGE_KEY) || '{}');
    const today = new Date().toISOString().split('T')[0];
    if (data.date !== today) {
      return { count: 0, limit: DAILY_LIMIT_ASESOR, remaining: DAILY_LIMIT_ASESOR };
    }
    return {
      count: data.count || 0,
      limit: DAILY_LIMIT_ASESOR,
      remaining: Math.max(0, DAILY_LIMIT_ASESOR - (data.count || 0))
    };
  } catch {
    return { count: 0, limit: DAILY_LIMIT_ASESOR, remaining: DAILY_LIMIT_ASESOR };
  }
};

const incrementQuestionUsage = () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const data = JSON.parse(localStorage.getItem(USAGE_KEY) || '{}');
    if (data.date !== today) {
      localStorage.setItem(USAGE_KEY, JSON.stringify({ date: today, count: 1, limit: DAILY_LIMIT_ASESOR }));
    } else {
      data.count = (data.count || 0) + 1;
      localStorage.setItem(USAGE_KEY, JSON.stringify(data));
    }
  } catch (e) {
    console.error('Error incrementando uso de preguntas IA:', e);
  }
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
  t = t.replace(/[""]/g, '"').replace(/['']/g, "'").replace(/,\s*(\}|\])/g, '$1');

  // Reparar valores booleanos truncados comunes ANTES del parseo
  // Orden importante: primero los más específicos, luego los más generales

  // Caso más común: "correct": fals] o "correct": fals, (sin espacio, seguido directamente de delimitador)
  t = t.replace(/:\s*fals([,\}\]\n\s])/gi, ': false$1');
  t = t.replace(/:\s*tru([,\}\]\n\s])/gi, ': true$1');

  // Caso con espacio: "correct": fals ] o "correct": fals ,
  t = t.replace(/:\s*fals\s+([,\}\]\n])/gi, ': false$1');
  t = t.replace(/:\s*tru\s+([,\}\]\n])/gi, ': true$1');

  // Casos más cortos truncados
  t = t.replace(/:\s*fal\s*([,\}\]\n\s])/gi, ': false$1');
  t = t.replace(/:\s*tr\s*([,\}\]\n\s])/gi, ': true$1');

  // Caso más agresivo: cualquier carácter no alfanumérico después (excepto comillas que ya están manejadas)
  t = t.replace(/:\s*fals([^a-z0-9_"])/gi, ': false$1');
  t = t.replace(/:\s*tru([^a-z0-9_"])/gi, ': true$1');

  // Reparar null truncado
  t = t.replace(/:\s*nul\s*([,\}\]\n\s])/gi, ': null$1');
  t = t.replace(/:\s*nu\s*([,\}\]\n\s])/gi, ': null$1');
  t = t.replace(/:\s*nul([^a-z0-9_"])/gi, ': null$1');

  // Intentar parsear, si falla, intentar reparar
  try {
    return JSON.parse(t);
  } catch (e) {
    console.error('[SimuladoresAI] ❌ Error parseando JSON:', e.message);
    console.log('[SimuladoresAI] 📄 JSON que falló:', t);


    // REPARACIÓN PRIORITARIA: Falta coma entre propiedades
    if (e.message && e.message.includes("Expected ',' or '}'")) {
      console.warn('[SimuladoresAI] 🔧 Reparando: falta coma entre propiedades');
      let fixed = t;

      // Patrón: "valor" "propiedad": (falta coma)
      fixed = fixed.replace(/("\s*)\s+("[\w]+"\s*:)/g, '$1, $2');

      // Patrón: true/false "propiedad": (falta coma)
      fixed = fixed.replace(/(true|false)\s+("[\w]+"\s*:)/g, '$1, $2');

      // Patrón: número "propiedad": (falta coma)
      fixed = fixed.replace(/(\d)\s+("[\w]+"\s*:)/g, '$1, $2');

      // Patrón: } { (falta coma entre objetos)
      fixed = fixed.replace(/}\s*{/g, '}, {');

      console.log('[SimuladoresAI] ✅ Intentando parsear JSON reparado');

      try {
        return JSON.parse(fixed);
      } catch (e2) {
        console.error('[SimuladoresAI] ❌ Reparación de comas falló:', e2.message);
        // Continuar con otras reparaciones
      }
    }
    // Reparar errores de array (elementos faltantes o valores truncados)
    if (e.message && (e.message.includes("Expected ','") || e.message.includes("Expected ']'") || e.message.includes("after array element"))) {
      // Buscar y reparar valores booleanos truncados que causan el error
      // Ejemplo: "correct": fals] -> "correct": false]
      let fixed = t;
      fixed = fixed.replace(/:\s*fals\s*([,\}\]\n])/gi, ': false$1');
      fixed = fixed.replace(/:\s*tru\s*([,\}\]\n])/gi, ': true$1');
      fixed = fixed.replace(/:\s*fal\s*([,\}\]\n])/gi, ': false$1');
      fixed = fixed.replace(/:\s*tr\s*([,\}\]\n])/gi, ': true$1');
      // También buscar patrones sin espacio antes del delimitador
      fixed = fixed.replace(/:\s*fals([,\}\]])/gi, ': false$1');
      fixed = fixed.replace(/:\s*tru([,\}\]])/gi, ': true$1');
      fixed = fixed.replace(/:\s*fal([,\}\]])/gi, ': false$1');
      fixed = fixed.replace(/:\s*tr([,\}\]])/gi, ': true$1');

      // Reparar null truncado
      fixed = fixed.replace(/:\s*nul\s*([,\}\]\n])/gi, ': null$1');
      fixed = fixed.replace(/:\s*nu\s*([,\}\]\n])/gi, ': null$1');

      try {
        return JSON.parse(fixed);
      } catch (e2) {
        // Si aún falla, intentar una reparación más agresiva
        // Buscar el patrón específico del error y repararlo
        const errorMatch = e.message.match(/position (\d+)/);
        if (errorMatch) {
          const errorPos = parseInt(errorMatch[1]);
          // Buscar alrededor de la posición del error
          const start = Math.max(0, errorPos - 50);
          const end = Math.min(fixed.length, errorPos + 50);
          const context = fixed.slice(start, end);

          // Intentar reparar valores truncados en el contexto del error
          let contextFixed = context;
          contextFixed = contextFixed.replace(/fals([,\}\]\n\s])/gi, 'false$1');
          contextFixed = contextFixed.replace(/tru([,\}\]\n\s])/gi, 'true$1');
          contextFixed = contextFixed.replace(/fal([,\}\]\n\s])/gi, 'false$1');
          contextFixed = contextFixed.replace(/tr([,\}\]\n\s])/gi, 'true$1');

          if (contextFixed !== context) {
            fixed = fixed.slice(0, start) + contextFixed + fixed.slice(end);
            try {
              return JSON.parse(fixed);
            } catch (e3) {
              // Continuar con otros intentos
            }
          }
        }
        // Continuar con otros intentos de reparación
      }
    }

    if (e.message && (e.message.includes('Unterminated string') || e.message.includes('Unexpected end'))) {
      // Intentar reparar strings sin cerrar
      let fixed = t;
      let inString = false;
      let escapeNext = false;
      const openStrings = []; // Array de posiciones donde se abren strings

      // Encontrar todos los strings y detectar cuáles están sin cerrar
      for (let i = 0; i < fixed.length; i++) {
        const ch = fixed[i];
        if (escapeNext) {
          escapeNext = false;
          continue;
        }
        if (ch === '\\') {
          escapeNext = true;
          continue;
        }
        if (ch === '"') {
          if (inString) {
            // Cerrar string
            inString = false;
            if (openStrings.length > 0) {
              openStrings.pop();
            }
          } else {
            // Abrir string
            inString = true;
            openStrings.push(i);
          }
        }
      }

      // Si hay strings sin cerrar, cerrarlos
      if (inString && openStrings.length > 0) {
        const lastOpenPos = openStrings[openStrings.length - 1];
        const lastBrace = fixed.lastIndexOf('}');

        if (lastBrace > lastOpenPos) {
          // Cerrar el string antes del último }
          // Buscar el último carácter antes del } que no sea espacio
          let insertPos = lastBrace;
          for (let i = lastBrace - 1; i > lastOpenPos; i--) {
            if (fixed[i] !== ' ' && fixed[i] !== '\n' && fixed[i] !== '\t') {
              insertPos = i + 1;
              break;
            }
          }
          fixed = fixed.slice(0, insertPos) + '"' + fixed.slice(insertPos);
        } else {
          // Si no hay }, agregar " al final (después de quitar espacios finales)
          fixed = fixed.trim() + '"';
        }
      }

      try {
        return JSON.parse(fixed);
      } catch (e2) {
        // Si aún falla, intentar una reparación más agresiva: truncar en el último } válido
        try {
          const lastValidBrace = fixed.lastIndexOf('}');
          if (lastValidBrace > 0) {
            const truncated = fixed.slice(0, lastValidBrace + 1);
            // Asegurar que todos los strings estén cerrados
            let quoteCount = (truncated.match(/"/g) || []).length;
            if (quoteCount % 2 !== 0) {
              // Hay comillas sin cerrar, cerrar antes del último }
              const beforeLastBrace = truncated.slice(0, lastValidBrace);
              return JSON.parse(beforeLastBrace + '"' + truncated.slice(lastValidBrace));
            }
            return JSON.parse(truncated);
          }
        } catch (e3) {
          console.error('Error parseando JSON de IA después de múltiples intentos de reparación:', e3);
          console.error('Texto original (primeros 1000 chars):', t.slice(0, 1000));
          throw new Error('La respuesta de la IA contiene JSON mal formado. Por favor, intenta generar las preguntas nuevamente.');
        }
        throw e2;
      }
    }
    throw e;
  }
};

// Utilidad: mapear áreas conocidas a lineamientos específicos
const canonArea = (raw) => String(raw || '').trim().toLowerCase();
const areaHints = (area) => {
  const a = canonArea(area);
  if (!a) return { tag: null, directrices: null };
  if (/mate|álgebra|algebra|aritm|geom|matemática|pensamiento.*analítico|analítico/.test(a)) {
    return {
      tag: 'matematica', directrices: (
        'ESTILO EXAMEN IPN - PROBLEMAS PRÁCTICOS:\n' +
        '- Incluye problemas reales con situaciones cotidianas, aplicaciones prácticas, análisis de gráficas y tablas.\n' +
        '- Usa fórmulas matemáticas fundamentales: ecuaciones de primer y segundo grado, sistemas de ecuaciones, funciones lineales y cuadráticas.\n' +
        '- Geometría: área, perímetro, volumen, teorema de Pitágoras, trigonometría básica, semejanza de triángulos.\n' +
        '- Aritmética: fracciones, porcentajes, regla de tres, proporciones, interés simple y compuesto.\n' +
        '- Álgebra: factorización, productos notables, ecuaciones con raíces, logaritmos básicos.\n' +
        '- Los problemas deben incluir datos numéricos realistas y requerir aplicación de fórmulas. Muestra la fórmula cuando sea relevante.\n' +
        '- Nivel básico: operaciones simples, problemas de la vida diaria. Nivel intermedio: aplicaciones más complejas. Nivel avanzado: problemas multi-paso con análisis.\n' +
        '- Opciones de respuesta deben incluir el resultado numérico correcto y distractoras cercanas por errores comunes.'
      )
    };
  }
  if (/español|lengua|comunica|lectura|comprensión|gramática|redacción/.test(a)) {
    return {
      tag: 'espanol', directrices: (
        '- Incluye ortografía básica, sinónimos/antónimos, comprensión de lectura corta, clases de palabras.\n' +
        '- Evita tecnicismos; prioriza claridad y contexto.'
      )
    };
  }
  if (/física|fisica/.test(a)) {
    return {
      tag: 'fisica', directrices: (
        'ESTILO EXAMEN IPN - PROBLEMAS CON FÓRMULAS:\n' +
        '- Incluye problemas prácticos que requieren aplicación de fórmulas físicas fundamentales.\n' +
        '- Cinemática: MRU, MRUV, caída libre. Fórmulas: v=d/t, vf=vi+at, d=vit+½at², vf²=vi²+2ad.\n' +
        '- Dinámica: leyes de Newton, fuerza, peso, fricción. Fórmulas: F=ma, W=mg, Fr=μN.\n' +
        '- Energía y trabajo: energía cinética, potencial, conservación. Fórmulas: Ec=½mv², Ep=mgh, W=Fd.\n' +
        '- Termodinámica: calor específico, cambio de temperatura. Fórmulas: Q=mcΔT, conversión de escalas.\n' +
        '- Electricidad básica: ley de Ohm, circuitos simples. Fórmulas: V=IR, P=VI, P=I²R.\n' +
        '- Los problemas deben incluir valores numéricos y unidades SI. Las opciones deben mostrar resultados con unidades correctas.\n' +
        '- Presenta problemas donde se requiera despejar variables, sustituir valores y calcular resultados finales.\n' +
        '- Nivel básico: aplicación directa de una fórmula. Nivel intermedio: combinar fórmulas o despejar variables. Nivel avanzado: problemas multi-paso o conceptuales.'
      )
    };
  }
  if (/quím|quim/.test(a)) {
    return {
      tag: 'quimica', directrices: (
        'ESTILO EXAMEN IPN - PROBLEMAS CON ECUACIONES QUÍMICAS:\n' +
        '- Incluye problemas que requieren balanceo de ecuaciones químicas, cálculos estequiométricos y aplicaciones prácticas.\n' +
        '- Estequiometría: relaciones molares, masa-mol, volumen en condiciones normales. Fórmulas: n=m/M, PV=nRT.\n' +
        '- Soluciones: molaridad, porcentaje en masa/volumen, diluciones. Fórmulas: M=n/V, %m/v=(m/V)×100, C1V1=C2V2.\n' +
        '- Balanceo de ecuaciones químicas: método de tanteo y por redox básico.\n' +
        '- Tabla periódica: propiedades periódicas, configuración electrónica básica, valencias comunes.\n' +
        '- Reacciones químicas: ácido-base básicas, óxido-reducción simples, reacciones de combustión.\n' +
        '- Los problemas deben incluir datos numéricos y requerir cálculos. Las opciones deben mostrar resultados con unidades correctas (moles, gramos, litros, molaridad).\n' +
        '- Nivel básico: identificación, clasificación. Nivel intermedio: cálculos simples con una fórmula. Nivel avanzado: problemas estequiométricos complejos.'
      )
    };
  }
  if (/biolog/.test(a)) {
    return {
      tag: 'biologia', directrices: (
        '- Célula, tejidos, sistemas del cuerpo, ecosistemas, genética básica.'
      )
    };
  }
  if (/historia|geograf/.test(a)) {
    return {
      tag: 'ciencias_sociales', directrices: (
        '- Hechos y periodos clave, ubicación geográfica, causas y consecuencias simples.'
      )
    };
  }
  if (/razonamiento.*(verbal|lect|leng)/.test(a)) {
    return {
      tag: 'razonamiento_verbal', directrices: (
        '- Analogías, relaciones de palabras, inferencias de enunciados cortos.'
      )
    };
  }
  if (/razonamiento.*(mate|num|lóg|log)/.test(a)) {
    return {
      tag: 'razonamiento_matematico', directrices: (
        '- Series numéricas, patrones, problemas lógicos breves.'
      )
    };
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
    let base = String(t || '').trim() || `Pregunta ${idx + 1}`;
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
      options = options.map((o, j) => ({ text: o.text || `Opción ${j + 1}`, correct: !!o.correct }));
      // 2) Si hay más de 4, truncar; si menos, completar hasta 4
      if (options.length > 4) options = options.slice(0, 4);
      const baseLen = options.length;
      if (baseLen < 4) {
        console.warn(`[SimuladoresAI] ⚠️ Pregunta ${i + 1} de opción múltiple solo tiene ${baseLen} opciones. Completando hasta 4...`);
      }
      for (let k = baseLen; k < 4; k++) options.push({ text: `Opción ${k + 1}`, correct: false });
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
    const need = { multi: dist.multi | 0, tf: dist.tf | 0, short: dist.short | 0 };
    const have = { multi: 0, tf: 0, short: 0 };
    out.forEach(q => { if (have[q.type] != null) have[q.type]++; });
    // Si sobran de un tipo y faltan de otro, convertir los excedentes del final
    const convert = (from, to) => {
      while (have[from] > need[from] && have[to] < need[to]) {
        const idx = out.lastIndexOf(out.slice().reverse().find(q => q.type === from));
        if (idx < 0) break;
        const q = out[idx];
        if (to === 'tf') { out[idx] = { ...q, type: 'tf', answer: 'true', options: undefined }; }
        else if (to === 'short') { out[idx] = { ...q, type: 'short', answer: q.answer || '', options: undefined }; }
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
    convert('short', 'multi'); convert('tf', 'multi');
    convert('multi', 'tf'); convert('short', 'tf');
    convert('tf', 'short'); convert('multi', 'short');
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
 * @param {Object} [opts.distribucion] - Distribución personalizada: { multi: número, tf: número, short: número }
 * @param {number} [opts.temperature] - Temperatura para la generación (0.0-1.0, default: 0.6). Valores más altos = más creativo.
 * @param {number} [opts.topP] - Nucleus sampling (0.0-1.0, default: undefined). Controla diversidad de tokens.
 * @param {number} [opts.topK] - Top-K sampling (integer, default: undefined). Limita tokens candidatos.
 * @param {number} [opts.maxOutputTokens] - Tokens máximos de salida (default: calculado automáticamente)
 * @returns {Promise<Array>} preguntas normalizadas
 */
export async function generarPreguntasIA({ tema, cantidad = 5, area = undefined, nivel = 'intermedio', modo = 'general', temas = undefined, distribucion = undefined, temperature = 0.6, topP = undefined, topK = undefined, maxOutputTokens = undefined }) {
  // Normalizar temas a array si se provee como string
  let temasList = Array.isArray(temas) ? temas : (typeof temas === 'string' ? temas.split(',').map(s => s.trim()).filter(Boolean) : []);
  // Validación flexible: requiere al menos uno de tema | area | temas
  if (!tema && !area && (!temasList || temasList.length === 0)) {
    throw new Error('Se requiere al menos un "tema", o "area", o lista de "temas".');
  }
  // Bloqueo si está en cooldown
  const rem = getCooldownRemainingMs();
  if (rem > 0) {
    const err = new Error(`En enfriamiento ${Math.ceil(rem / 1000)}s por límite de cuota.`);
    // adjuntar metadatos para que la UI pueda decidir
    err.code = 'COOLDOWN';
    err.remainingMs = rem;
    throw err;
  }
  // Preparar guía según área
  const { tag, directrices } = areaHints(area);
  // Usar distribución personalizada si se proporciona, sino calcular automáticamente
  const dist = distribucion || distribucionTipos(cantidad, tag);
  // Si hay distribución personalizada, recalcular cantidad total
  const cantidadFinal = distribucion ? (dist.multi + dist.tf + dist.short) : cantidad;
  const tiposDesc = 'opción múltiple (1 correcta), verdadero/falso, respuesta corta';
  const temaEfectivo = String(tema || area || (temasList[0] || 'Contenido del módulo')).trim();
  const areaLine = area ? `\nÁrea o módulo: ${area}.` : '';
  const dirLine = directrices ? `\nLineamientos específicos del área:\n${directrices}` : '';
  const distLine = `\nDistribución EXACTA por tipo: ${dist.multi} multi, ${dist.tf} tf, ${dist.short} short.`;
  const modoLine = (modo === 'temas' && temasList.length)
    ? `\nEnfoque por TEMAS específicos: ${temasList.map(t => `"${t}"`).join(', ')}. Distribuye las preguntas entre estos temas de forma equilibrada.`
    : `\nCobertura GENERAL del tema/área indicada.`;

  // Determinar si requiere problemas con fórmulas/ecuaciones (matemáticas, física, química)
  const requiereFormulas = /matemática|matematica|física|fisica|química|quimica|álgebra|algebra|geometría|geometria|pensamiento.*analítico|analítico/.test(
    (area || '').toLowerCase() + ' ' + temaEfectivo.toLowerCase()
  );

  const instruccionesFormulas = requiereFormulas ? `

IMPORTANTE PARA ÁREAS DE MATEMÁTICAS, FÍSICA O QUÍMICA (ESTILO EXAMEN IPN):
- Genera problemas PRÁCTICOS similares a exámenes de ingreso universitario como el IPN.
- Incluye FÓRMULAS cuando sean necesarias para resolver el problema (muestra fórmulas como v=d/t, F=ma, x²+5x+6=0, etc.).
- Presenta situaciones REALES: problemas de la vida diaria, aplicaciones prácticas, análisis de gráficas/tablas.
- Los enunciados deben proporcionar TODOS los datos numéricos necesarios para resolver el problema.
- Las opciones de respuesta múltiple deben incluir el RESULTADO NUMÉRICO correcto con unidades si aplica (ej: "25 m/s", "3.5 moles", "42%", "15 N").
- Para respuesta corta en problemas numéricos, acepta respuestas que incluyan el número con unidades (ej: "25 m/s", "3.5 moles").
- Nivel básico: aplicación directa de una fórmula simple. Nivel intermedio: combinar fórmulas o despejar variables. Nivel avanzado: problemas multi-paso con análisis complejo.` : '';

  const prompt = `Genera preguntas tipo examen en español (es-MX), estilo examen de ingreso universitario (como IPN).${areaLine}
Tema principal: "${temaEfectivo}".
Nivel: ${nivel}. Tipos permitidos: ${tiposDesc}.${distLine}${modoLine}${dirLine}${instruccionesFormulas}

Requisitos estrictos:
- EXACTAMENTE ${cantidadFinal} preguntas.
- Opción múltiple: SIEMPRE 4 opciones (nunca menos), UNA sola correcta ("correct": true solo en una, las otras 3 con "correct": false).
- Verdadero/falso: usar "answer": "true" | "false".
- Respuesta corta: "answer" con texto breve y objetivo. ${requiereFormulas ? 'Para problemas numéricos, incluye el resultado numérico con unidades si aplica (ej: "25 m/s", "3.5", "42%").' : 'Sin explicaciones.'}
- Enunciados claros, con datos suficientes para resolver. ${requiereFormulas ? 'Para problemas numéricos, incluye las fórmulas necesarias en el enunciado o presenta problemas donde se requiera aplicarlas. Muestra fórmulas en notación matemática estándar.' : ''} Evita dependencias de imágenes.

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
    // Construir generationConfig con parámetros configurables
    const generationConfig = {
      temperature: Math.max(0.0, Math.min(1.0, temperature || 0.3)),
      maxOutputTokens: maxOutputTokens || Math.max(2000, cantidadFinal * 200),
      response_mime_type: 'application/json'
    };

    // Agregar parámetros opcionales solo si se especifican
    if (topP !== undefined && topP !== null) {
      generationConfig.topP = Math.max(0.0, Math.min(1.0, topP));
    }
    if (topK !== undefined && topK !== null) {
      generationConfig.topK = Math.max(1, Math.floor(topK));
    }

    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig,
      model: MODEL
    };
    console.log('[SimuladoresAI] Sending request with model:', MODEL);
    const resp = await fetch(PROXY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
      signal: controller.signal
    });
    clear();
    if (!resp.ok) {
      const status = resp.status;
      const err = await resp.json().catch(() => ({}));

      // Detectar error de API key bloqueada (leaked)
      if (status === 403 && (err?.code === 'API_KEY_LEAKED' ||
        String(err?.error || err?.message || '').toLowerCase().includes('leaked'))) {
        const e = new Error(err?.message || 'La API key de Gemini fue bloqueada porque fue expuesta públicamente. Por favor, contacta al administrador para obtener una nueva API key.');
        e.code = 'API_KEY_LEAKED';
        e.status = 403;
        e.helpUrl = err?.helpUrl;
        throw e;
      }

      if (status === 429) {
        // iniciar cooldown y propagar error con mensaje claro
        startCooldown();
        const secs = Math.ceil(COOLDOWN_MS / 1000);
        const e = new Error(`Error 429: Se alcanzó el límite de solicitudes a la API de Google. Por favor, espera ${secs} segundo${secs > 1 ? 's' : ''} antes de intentar nuevamente. Esto ayuda a evitar límites de la API.`);
        e.code = 'RATE_LIMIT';
        e.remainingMs = COOLDOWN_MS;
        e.status = 429;
        throw e;
      }
      // Otros errores pueden también ser relacionados con límites de cuota
      const errMsg = String(err?.error || err?.message || '').toLowerCase();
      if (errMsg.includes('quota') || errMsg.includes('rate limit') || errMsg.includes('429')) {
        startCooldown();
        const secs = Math.ceil(COOLDOWN_MS / 1000);
        const e = new Error(`Error de cuota: ${err?.error || 'Se alcanzó el límite de solicitudes'}. Por favor, espera ${secs} segundo${secs > 1 ? 's' : ''} antes de intentar nuevamente.`);
        e.code = 'RATE_LIMIT';
        e.remainingMs = COOLDOWN_MS;
        e.status = status;
        throw e;
      }
      throw new Error(err?.error || `Error al generar preguntas con IA (${status}). Por favor intenta de nuevo.`);
    }
    const data = await resp.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const parsed = extractJson(text);
    const arr = Array.isArray(parsed?.preguntas) ? parsed.preguntas : [];
    const result = normalizarPreguntas(arr, cantidadFinal, dist);

    // Incrementar contador de uso exitoso
    incrementQuestionUsage();

    return result;
  } catch (e) {
    clear();
    throw e;
  }
}
