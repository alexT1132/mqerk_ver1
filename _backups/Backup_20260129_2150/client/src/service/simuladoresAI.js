// Servicio aislado para generación de preguntas con IA (Gemini)
// No modifica ni depende del geminiService existente

const PROXY_ENDPOINT = '/api/ai/gemini/generate';
// Usar gemini-1.5-flash para Free Tier (15 RPM vs 2 RPM de Pro)
const MODEL = (import.meta?.env?.VITE_GEMINI_MODEL) || 'gemini-2.5-flash';
const TIMEOUT = 60000; // Aumentado a 60s para dar tiempo cuando hay rate limits
const COOLDOWN_MS = Number(import.meta?.env?.VITE_IA_COOLDOWN_MS || 120000); // 2 minutos por defecto para evitar rate limits de Google
const COOLDOWN_429_MS = Number(import.meta?.env?.VITE_IA_COOLDOWN_429_MS || 600000); // 10 minutos cuando el servidor devuelve 429
const COOLDOWN_KEY = 'ia_cooldown_until';
const COOLDOWN_429_COUNT_KEY = 'ia_cooldown_429_count'; // Contador de 429 consecutivos para backoff exponencial

// Esquema JSON estricto para Structured Outputs (garantiza JSON válido y ahorra tokens)
const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    preguntas: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          type: { type: "STRING", enum: ["multi", "tf", "short"] },
          text: { type: "STRING" },
          points: { type: "NUMBER" },
          // Opciones opcionales (solo para tipo 'multi')
          options: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                text: { type: "STRING" },
                correct: { type: "BOOLEAN" }
              },
              required: ["text", "correct"]
            }
          },
          // Answer opcional (para tipo 'tf' y 'short')
          answer: { type: "STRING" }
        },
        required: ["type", "text", "points"]
      }
    }
  },
  required: ["preguntas"]
};

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
    // Validar que el valor sea razonable (no corrupto)
    if (v <= 0 || v > Date.now() + (24 * 60 * 60 * 1000)) {
      // Si el valor es inválido o muy grande (más de 24 horas), limpiarlo
      localStorage.removeItem(COOLDOWN_KEY);
      // Si el cooldown expiró o es inválido, también resetear el contador de 429 si ha pasado mucho tiempo
      const last429Time = Number(localStorage.getItem('ia_last_429_time') || 0);
      if (last429Time > 0 && (Date.now() - last429Time) > (60 * 60 * 1000)) {
        // Si pasó más de 1 hora desde el último 429, resetear el contador
        localStorage.removeItem(COOLDOWN_429_COUNT_KEY);
        localStorage.removeItem('ia_last_429_time');
      }
      return 0;
    }
    const rem = v - Date.now();
    if (rem <= 0) {
      // Limpiar el cooldown del localStorage si ya expiró
      localStorage.removeItem(COOLDOWN_KEY);
      // Si el cooldown expiró, verificar si debemos resetear el contador de 429
      const last429Time = Number(localStorage.getItem('ia_last_429_time') || 0);
      if (last429Time > 0 && (Date.now() - last429Time) > (60 * 60 * 1000)) {
        // Si pasó más de 1 hora desde el último 429, resetear el contador
        localStorage.removeItem(COOLDOWN_429_COUNT_KEY);
        localStorage.removeItem('ia_last_429_time');
      }
      return 0;
    }
    return rem;
  } catch {
    // Si hay error al leer, limpiar y retornar 0
    try {
      localStorage.removeItem(COOLDOWN_KEY);
    } catch { }
    return 0;
  }
};

// Función para limpiar manualmente el cooldown (útil para debugging o reset)
export const clearCooldown = () => {
  try {
    localStorage.removeItem(COOLDOWN_KEY);
    localStorage.removeItem(RECENT_REQUESTS_KEY);
    localStorage.removeItem(COOLDOWN_429_COUNT_KEY);
    localStorage.removeItem('ia_last_429_time');
    return true;
  } catch {
    return false;
  }
};
const startCooldown = (customMs = null, is429 = false) => {
  try {
    let cooldownTime = customMs;

    if (is429) {
      // Verificar si ha pasado suficiente tiempo desde el último 429 para resetear el contador
      const last429Time = Number(localStorage.getItem('ia_last_429_time') || 0);
      const timeSinceLast429 = Date.now() - last429Time;

      // Si pasó más de 1 hora desde el último 429, resetear el contador
      let count429 = Number(localStorage.getItem(COOLDOWN_429_COUNT_KEY) || 0);
      if (timeSinceLast429 > (60 * 60 * 1000)) {
        count429 = 0;
        console.warn('[SimuladoresAI] Reseteando contador de 429 (pasó más de 1 hora desde el último)');
      }

      // Incrementar el contador
      count429 = count429 + 1;
      localStorage.setItem(COOLDOWN_429_COUNT_KEY, String(count429));
      localStorage.setItem('ia_last_429_time', String(Date.now()));

      // Cooldown base de 10 minutos, incrementa 5 minutos por cada 429 consecutivo
      // Máximo 30 minutos
      cooldownTime = Math.min(COOLDOWN_429_MS + (count429 - 1) * 300000, 1800000);

      console.warn(`[SimuladoresAI] 429 recibido (${count429} consecutivo). Cooldown: ${Math.ceil(cooldownTime / 60000)} minutos. El límite es del servidor de Google, no solo local.`);
    } else {
      // Si no es 429, resetear el contador
      localStorage.removeItem(COOLDOWN_429_COUNT_KEY);
      localStorage.removeItem('ia_last_429_time');
      cooldownTime = customMs || COOLDOWN_MS;
    }

    localStorage.setItem(COOLDOWN_KEY, String(Date.now() + cooldownTime));
  } catch { }
};

// Sistema de tracking de uso diario (separado del análisis)
const USAGE_KEY = 'ai_questions_usage';
const DAILY_LIMIT_ASESOR = 20; // Asesores pueden generar más preguntas

// Sistema de tracking de peticiones recientes para prevenir saturación
const RECENT_REQUESTS_KEY = 'ai_recent_requests';
const MAX_REQUESTS_PER_WINDOW = 3; // Máximo 3 peticiones
const REQUEST_WINDOW_MS = 60000; // En una ventana de 1 minuto

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

// Verificar si se han hecho demasiadas peticiones recientes
const checkRecentRequests = () => {
  try {
    const data = JSON.parse(localStorage.getItem(RECENT_REQUESTS_KEY) || '[]');
    const now = Date.now();
    // Filtrar peticiones dentro de la ventana de tiempo
    const recentRequests = data.filter(timestamp => (now - timestamp) < REQUEST_WINDOW_MS);

    if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
      const oldestRequest = Math.min(...recentRequests);
      const waitTime = REQUEST_WINDOW_MS - (now - oldestRequest);
      return {
        tooMany: true,
        waitTime: Math.ceil(waitTime / 1000) // en segundos
      };
    }

    return { tooMany: false, waitTime: 0 };
  } catch {
    return { tooMany: false, waitTime: 0 };
  }
};

// Registrar una petición reciente
const recordRecentRequest = () => {
  try {
    const data = JSON.parse(localStorage.getItem(RECENT_REQUESTS_KEY) || '[]');
    const now = Date.now();
    // Agregar timestamp actual
    data.push(now);
    // Mantener solo las últimas 10 peticiones para no llenar el storage
    const recent = data.filter(timestamp => (now - timestamp) < REQUEST_WINDOW_MS * 2).slice(-10);
    localStorage.setItem(RECENT_REQUESTS_KEY, JSON.stringify(recent));
  } catch {
    // Ignorar errores de storage
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

  // ✅ CRÍTICO: Escapar comandos LaTeX dentro de strings JSON antes del parseo
  // Los comandos LaTeX como \$ \text \frac necesitan ser \\$ \\text \\frac en JSON
  // Esto debe hacerse ANTES de intentar parsear para evitar errores de "Bad escaped character"
  let fixedLatex = '';
  let inString = false;
  let escapeNext = false;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    const nextCh = i + 1 < t.length ? t[i + 1] : null;
    
    if (escapeNext) {
      // Si estamos escapando, verificar si es un escape válido de JSON
      // 'u' es especial porque puede ser \uXXXX (unicode), verificar si sigue un dígito hex
      if (ch === 'u' && i + 4 < t.length) {
        const unicodeSeq = t.slice(i, i + 4);
        if (/^[0-9a-fA-F]{4}$/.test(unicodeSeq)) {
          // Es un escape unicode válido, mantenerlo y avanzar los 4 caracteres
          fixedLatex += '\\' + ch + unicodeSeq;
          i += 3; // Avanzar los 3 caracteres restantes (el bucle incrementará i en 1 más)
          escapeNext = false;
          continue;
        }
      }
      
      // Verificar si es un escape válido de JSON de un solo carácter
      // Los escapes válidos son: \" \\ \/ \b \f \n \r \t
      // Pero necesitamos verificar el contexto: \t es válido, pero \text no lo es
      const singleCharEscapes = {
        '"': true, '\\': true, '/': true, 'b': true, 'f': true, 'n': true, 'r': true
      };
      
      // 't' es especial: puede ser \t (tab) o parte de \text, \frac, etc.
      if (ch === 't') {
        // Verificar si el siguiente carácter forma parte de un comando LaTeX común
        const nextChars = t.slice(i, Math.min(i + 10, t.length));
        const latexCommands = ['text', 'frac', 'sqrt', 'sum', 'int', 'lim', 'sin', 'cos', 'tan', 'log', 'ln', 'exp'];
        const isLatexCommand = latexCommands.some(cmd => nextChars.startsWith(cmd));
        
        if (isLatexCommand) {
          // Es un comando LaTeX, necesitamos doble escape
          fixedLatex += '\\\\' + ch;
        } else {
          // Es \t (tab), escape válido
          fixedLatex += '\\' + ch;
        }
      } else if (singleCharEscapes[ch]) {
        // Es un escape válido de JSON de un solo carácter
        fixedLatex += '\\' + ch;
      } else {
        // Es un comando LaTeX o carácter especial, necesitamos doble escape
        fixedLatex += '\\\\' + ch;
      }
      escapeNext = false;
      continue;
    }
    
    if (ch === '\\') {
      if (inString) {
        // Dentro de un string, marcar que el siguiente carácter está escapado
        escapeNext = true;
        continue;
      } else {
        // Fuera de string, mantener la barra invertida
        fixedLatex += ch;
      }
      continue;
    }
    
    if (ch === '"') {
      // Verificar si la comilla está escapada
      if (i > 0 && t[i - 1] === '\\' && !escapeNext) {
        // La comilla está escapada, mantenerla
        fixedLatex += ch;
        continue;
      }
      inString = !inString;
      fixedLatex += ch;
      continue;
    }
    
    fixedLatex += ch;
  }
  t = fixedLatex;

  // Intentar parsear, si falla, intentar reparar
  try {
    return JSON.parse(t);
  } catch (e) {
    console.error('[SimuladoresAI] ❌ Error parseando JSON:', e.message);
    console.log('[SimuladoresAI] 📄 JSON que falló (primeros 500 chars):', t.slice(0, 500));

    // REPARACIÓN INICIAL AGRESIVA: aplicar todas las correcciones comunes primero
    let fixed = t;

    // 1. Reemplazar smart quotes / comillas curvas (muy común en respuestas de IA)
    fixed = fixed.replace(/[""]/g, '"').replace(/['']/g, "'");

    // 2. Eliminar caracteres de control invisibles que rompen JSON
    fixed = fixed.replace(/[\x00-\x1F\x7F]/g, (char) => {
      if (char === '\n' || char === '\r' || char === '\t') return char;
      return '';
    });

    // 3. Reparar comillas sin escapar dentro de strings (patrón común: "texto "con" comillas")
    // Intentar detectar y arreglar comillas internas no escapadas
    fixed = fixed.replace(/"([^"]*)"([^",:\[\]{}]+)"([^"]*)"/g, '"$1\\"$2\\"$3"');

    // 4. Reparar booleanos y null truncados
    fixed = fixed.replace(/:\s*fals([,\}\]\n\s])/gi, ': false$1');
    fixed = fixed.replace(/:\s*tru([,\}\]\n\s])/gi, ': true$1');
    fixed = fixed.replace(/:\s*nul([,\}\]\n\s])/gi, ': null$1');

    // 5. Agregar comas faltantes entre propiedades
    fixed = fixed.replace(/("\s*)\s+("[^"]+"\s*:)/g, '$1, $2');
    fixed = fixed.replace(/(true|false)\s+("[^"]+"\s*:)/g, '$1, $2');
    fixed = fixed.replace(/(\d)\s+("[^"]+"\s*:)/g, '$1, $2');
    fixed = fixed.replace(/}\s*{/g, '}, {');
    fixed = fixed.replace(/]\s*\[/g, '], [');

    // 6. Reparar comas antes de cierre de llaves/corchetes
    fixed = fixed.replace(/,\s*([\}\]])/g, '$1');

    // Intentar parsear después de reparación inicial
    try {
      const result = JSON.parse(fixed);
      console.log('[SimuladoresAI] ✅ JSON reparado exitosamente con correcciones iniciales');
      return result;
    } catch (e2) {
      console.warn('[SimuladoresAI] 🔧 Reparación inicial falló, intentando reparaciones específicas...');
    }

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
      console.warn('[SimuladoresAI] 🔧 Reparando: error en array o valor truncado');
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

      // Reparar strings truncados que pueden causar este error
      // Buscar strings que terminan abruptamente antes de una coma o corchete
      fixed = fixed.replace(/"\s*([,\}\]])/g, (match, delimiter) => {
        // Si hay un string que termina justo antes de un delimitador sin comilla de cierre
        // Esto puede indicar un string truncado
        return match; // Por ahora mantener, pero podríamos necesitar más lógica
      });

      try {
        return JSON.parse(fixed);
      } catch (e2) {
        // Si aún falla, intentar una reparación más agresiva
        // Buscar el patrón específico del error y repararlo
        const errorMatch = e2.message.match(/position (\d+)/);
        if (errorMatch) {
          const errorPos = parseInt(errorMatch[1]);
          // Buscar alrededor de la posición del error
          const start = Math.max(0, errorPos - 100);
          const end = Math.min(fixed.length, errorPos + 100);
          const context = fixed.slice(start, end);

          // Intentar reparar valores truncados en el contexto del error
          let contextFixed = context;
          contextFixed = contextFixed.replace(/fals([,\}\]\n\s])/gi, 'false$1');
          contextFixed = contextFixed.replace(/tru([,\}\]\n\s])/gi, 'true$1');
          contextFixed = contextFixed.replace(/fal([,\}\]\n\s])/gi, 'false$1');
          contextFixed = contextFixed.replace(/tr([,\}\]\n\s])/gi, 'true$1');

          // Reparar strings no terminados en el contexto
          // Buscar si hay un string abierto cerca del error
          let inStr = false;
          let esc = false;
          let strStart = -1;
          for (let i = Math.max(0, errorPos - 200); i < Math.min(fixed.length, errorPos + 50); i++) {
            if (esc) {
              esc = false;
              continue;
            }
            if (fixed[i] === '\\') {
              esc = true;
              continue;
            }
            if (fixed[i] === '"') {
              if (inStr) {
                inStr = false;
                strStart = -1;
              } else {
                inStr = true;
                strStart = i;
              }
            }
          }

          // Si hay un string abierto, cerrarlo antes del delimitador problemático
          if (inStr && strStart >= 0 && strStart < errorPos) {
            // Buscar el siguiente delimitador después del error
            let closePos = errorPos;
            for (let i = errorPos; i < Math.min(fixed.length, errorPos + 50); i++) {
              if (fixed[i] === ',' || fixed[i] === '}' || fixed[i] === ']') {
                closePos = i;
                break;
              }
            }
            fixed = fixed.slice(0, closePos) + '"' + fixed.slice(closePos);
            try {
              return JSON.parse(fixed);
            } catch (e3) {
              // Continuar con otros intentos
            }
          }

          if (contextFixed !== context) {
            fixed = fixed.slice(0, start) + contextFixed + fixed.slice(end);
            try {
              return JSON.parse(fixed);
            } catch (e3) {
              // Continuar con otros intentos
            }
          }
        }
        // Continuar con otros intentos de reparación (pasar al siguiente bloque)
      }
    }

    // Reparación adicional: strings truncados que causan errores de sintaxis
    // Esto puede ocurrir cuando el JSON se corta a mitad de un string
    if (e.message && (e.message.includes('Unterminated string') || e.message.includes('Unexpected end') || e.message.includes('position'))) {
      console.warn('[SimuladoresAI] 🔧 Reparando: string no terminado o truncado');
      let fixed = t;

      // PRIMER PASO: Reparar saltos de línea sin escapar dentro de strings
      // Esto es crítico porque la IA puede generar \n literales que rompen el JSON
      let result = '';
      let inString = false;
      let escapeNext = false;
      let stringStart = -1;

      for (let i = 0; i < fixed.length; i++) {
        const ch = fixed[i];
        const nextCh = i + 1 < fixed.length ? fixed[i + 1] : null;

        if (escapeNext) {
          // Si estamos escapando, agregar el carácter normalmente
          result += ch;
          escapeNext = false;
          continue;
        }

        if (ch === '\\') {
          // Verificar si es un escape válido o un salto de línea literal
          if (inString && nextCh === 'n' && fixed[i + 2] !== '"') {
            // Es un \n literal dentro de un string, mantenerlo como está
            result += ch;
            escapeNext = true;
            continue;
          }
          result += ch;
          escapeNext = true;
          continue;
        }

        if (ch === '"') {
          if (inString) {
            // Cerrar string
            inString = false;
            stringStart = -1;
            result += ch;
          } else {
            // Abrir string
            inString = true;
            stringStart = i;
            result += ch;
          }
          continue;
        }

        if (inString) {
          // Dentro de un string, escapar caracteres problemáticos
          if (ch === '\n' || ch === '\r') {
            // Salto de línea literal sin escapar - escapar
            result += '\\n';
          } else if (ch === '\t') {
            result += '\\t';
          } else if (ch.charCodeAt(0) < 32 && ch !== '\n' && ch !== '\r' && ch !== '\t') {
            // Carácter de control - escapar como unicode
            result += `\\u${ch.charCodeAt(0).toString(16).padStart(4, '0')}`;
          } else {
            result += ch;
          }
        } else {
          result += ch;
        }
      }

      // Si quedó un string abierto, cerrarlo
      if (inString) {
        // Buscar el último } válido para cerrar el string antes
        const lastBrace = result.lastIndexOf('}');
        if (lastBrace > stringStart) {
          // Insertar comilla de cierre antes del último }
          let insertPos = lastBrace;
          // Retroceder hasta encontrar un carácter no-espacio
          for (let i = lastBrace - 1; i > stringStart; i--) {
            if (result[i] !== ' ' && result[i] !== '\n' && result[i] !== '\t' && result[i] !== '\\') {
              insertPos = i + 1;
              break;
            }
          }
          fixed = result.slice(0, insertPos) + '"' + result.slice(insertPos);
        } else {
          // No hay }, cerrar al final
          fixed = result + '"';
        }
      } else {
        fixed = result;
      }

      try {
        return JSON.parse(fixed);
      } catch (e2) {
        console.warn('[SimuladoresAI] 🔧 Intento 1 falló, intentando reparación más agresiva...');

        // SEGUNDO PASO: Reparación más agresiva - reconstruir strings problemáticos
        try {
          // Buscar la posición del error para contexto
          const errorMatch = e2.message.match(/position (\d+)/);
          if (errorMatch) {
            const errorPos = parseInt(errorMatch[1]);
            const contextStart = Math.max(0, errorPos - 200);
            const contextEnd = Math.min(fixed.length, errorPos + 200);
            const context = fixed.slice(contextStart, contextEnd);

            // Intentar encontrar y reparar el string problemático
            // Buscar el string más cercano al error que esté abierto
            let inStr = false;
            let esc = false;
            let strStart = -1;
            let fixed2 = fixed;

            for (let i = Math.max(0, errorPos - 500); i < Math.min(fixed.length, errorPos + 100); i++) {
              const ch = fixed2[i];
              if (esc) {
                esc = false;
                continue;
              }
              if (ch === '\\') {
                esc = true;
                continue;
              }
              if (ch === '"') {
                if (inStr) {
                  inStr = false;
                  strStart = -1;
                } else {
                  inStr = true;
                  strStart = i;
                }
              }
            }

            // Si hay un string abierto cerca del error, cerrarlo
            if (inStr && strStart >= 0) {
              // Cerrar el string antes del siguiente delimitador importante
              let closePos = errorPos;
              for (let i = errorPos; i < Math.min(fixed.length, errorPos + 100); i++) {
                if (fixed2[i] === '}' || fixed2[i] === ']' || fixed2[i] === ',') {
                  closePos = i;
                  break;
                }
              }
              fixed2 = fixed2.slice(0, closePos) + '"' + fixed2.slice(closePos);
              return JSON.parse(fixed2);
            }
          }
        } catch (e3) {
          // Continuar con el siguiente intento
        }

        // TERCER PASO: Truncar en el último } válido y cerrar strings abiertos
        try {
          const lastValidBrace = fixed.lastIndexOf('}');
          if (lastValidBrace > 0) {
            let truncated = fixed.slice(0, lastValidBrace + 1);

            // Contar comillas y cerrar si es necesario
            let quoteCount = 0;
            let inStr = false;
            let esc = false;
            for (let i = 0; i < truncated.length; i++) {
              if (esc) {
                esc = false;
                continue;
              }
              if (truncated[i] === '\\') {
                esc = true;
                continue;
              }
              if (truncated[i] === '"') {
                quoteCount++;
                inStr = !inStr;
              }
            }

            // Si hay comillas sin cerrar, cerrar antes del último }
            if (inStr) {
              const beforeLastBrace = truncated.slice(0, lastValidBrace);
              truncated = beforeLastBrace + '"' + truncated.slice(lastValidBrace);
            }

            return JSON.parse(truncated);
          }
        } catch (e4) {
          console.error('[SimuladoresAI] ❌ Error parseando JSON de IA después de múltiples intentos de reparación:', e4);
          console.error('[SimuladoresAI] 📄 Texto original (primeros 1000 chars):', t.slice(0, 1000));
          console.error('[SimuladoresAI] 📄 Texto reparado (primeros 1000 chars):', fixed.slice(0, 1000));
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
        '- Nivel básico: ENFÓCATE EXCLUSIVAMENTE EN CONCEPTOS FUNDAMENTALES. Para álgebra: preguntas MUY SIMPLES sobre definiciones básicas (¿qué es una variable?, ¿qué es una constante?, ¿qué es una ecuación?), identificación básica en expresiones SIMPLES (máximo 2 términos, sin potencias, números pequeños 1-10). Ejemplos permitidos: 3x, 5y, 2a + 3, x - 5. PROHIBIDO usar expresiones con potencias (x², m²), múltiples términos complejos (más de 2), o operaciones avanzadas. Para otras áreas: operaciones simples, problemas de la vida diaria, conceptos básicos y definiciones fundamentales. Nivel intermedio: aplicaciones más complejas, resolución de problemas prácticos. Nivel avanzado: problemas multi-paso con análisis, síntesis de conceptos.\n' +
        '- Opciones de respuesta deben incluir el resultado numérico correcto y distractoras cercanas por errores comunes.'
      )
    };
  }
  if (/inglés|english|lengua.*extranjera|foreign.*language/i.test(a)) {
    return {
      tag: 'ingles', directrices: (
        'ENGLISH LANGUAGE REQUIREMENTS (ALL CONTENT MUST BE IN ENGLISH):\n' +
        '- Reading comprehension: short texts, emails, articles, dialogues in English.\n' +
        '- Grammar: verb tenses, conditionals, passive voice, phrasal verbs, prepositions.\n' +
        '- Vocabulary: synonyms, antonyms, word formation, collocations, idioms.\n' +
        '- Writing: sentence structure, paragraph organization, formal/informal register.\n' +
        '- Listening comprehension: understanding spoken English in various contexts.\n' +
        '- All questions, options, instructions, and examples MUST be in English.\n' +
        '- Use authentic English texts and contexts (emails, articles, conversations).\n' +
        '- Focus on practical English skills for academic and professional contexts.'
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
 * @param {number} [opts.temperature] - Temperatura para la generación (0.0-1.0, default: 0.2). Valores más bajos = más precisión en JSON.
 * @param {number} [opts.topP] - Nucleus sampling (0.0-1.0, default: undefined). Controla diversidad de tokens.
 * @param {number} [opts.topK] - Top-K sampling (integer, default: undefined). Limita tokens candidatos.
 * @param {number} [opts.maxOutputTokens] - Tokens máximos de salida (default: calculado automáticamente)
 * @returns {Promise<Array>} preguntas normalizadas
 */
export async function generarPreguntasIA({ tema, cantidad = 5, area = undefined, nivel = 'intermedio', modo = 'general', temas = undefined, distribucion = undefined, idioma = 'auto', temperature = 0.2, topP = undefined, topK = undefined, maxOutputTokens = undefined, purpose = 'simuladores' }) {
  // Normalizar temas a array si se provee como string
  let temasList = Array.isArray(temas) ? temas : (typeof temas === 'string' ? temas.split(',').map(s => s.trim()).filter(Boolean) : []);
  // Validación flexible: requiere al menos uno de tema | area | temas
  if (!tema && !area && (!temasList || temasList.length === 0)) {
    throw new Error('Se requiere al menos un "tema", o "area", o lista de "temas".');
  }
  // Bloqueo si está en cooldown
  const rem = getCooldownRemainingMs();
  if (rem > 0) {
    const secs = Math.ceil(rem / 1000);
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    const timeDisplay = mins > 0
      ? `${mins} minuto${mins > 1 ? 's' : ''}${remainingSecs > 0 ? ` y ${remainingSecs} segundo${remainingSecs > 1 ? 's' : ''}` : ''}`
      : `${secs} segundo${secs > 1 ? 's' : ''}`;
    const err = new Error(`Debes esperar ${timeDisplay} antes de volver a generar con IA. Esto ayuda a evitar límites de la API.`);
    // adjuntar metadatos para que la UI pueda decidir
    err.code = 'COOLDOWN';
    err.remainingMs = rem;
    throw err;
  }

  // ⚠️ PREVENCIÓN: Verificar si se han hecho demasiadas peticiones recientes
  const recentCheck = checkRecentRequests();
  if (recentCheck.tooMany) {
    const mins = Math.floor(recentCheck.waitTime / 60);
    const secs = recentCheck.waitTime % 60;
    const timeDisplay = mins > 0
      ? `${mins} minuto${mins > 1 ? 's' : ''}${secs > 0 ? ` y ${secs} segundo${secs > 1 ? 's' : ''}` : ''}`
      : `${recentCheck.waitTime} segundo${recentCheck.waitTime > 1 ? 's' : ''}`;
    const err = new Error(`Has realizado ${MAX_REQUESTS_PER_WINDOW} peticiones en poco tiempo. Por favor, espera ${timeDisplay} antes de intentar nuevamente para evitar saturar el servicio de IA.`);
    err.code = 'TOO_MANY_REQUESTS';
    err.remainingMs = recentCheck.waitTime * 1000;
    throw err;
  }

  // Preparar guía según área
  const hints = areaHints(area);
  const tag = hints.tag;
  let directrices = hints.directrices;
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

  // Reparto explícito entre temas:
  // - Si modo === 'temas': usar temasList
  // - Si modo !== 'temas' y "tema" es lista con comas: repartir entre esas "materias/temas"
  const temasDesdeTema = (modo !== 'temas' && /,/.test(String(tema || '')))
    ? String(tema || '').split(',').map(s => s.trim()).filter(Boolean)
    : [];
  const listaReparto = (modo === 'temas' && temasList.length >= 2) ? temasList : temasDesdeTema;
  const repartoTemasLine = (listaReparto.length >= 2)
    ? (() => {
        const total = Number(cantidadFinal) || (Number(cantidadFinal) === 0 ? 0 : (Number(cantidad) || 5));
        const n = listaReparto.length;
        const label = (modo === 'temas') ? 'temas específicos' : 'materias/temas';
        if (total === n) {
          // ✅ CASO ESPECIAL: Igual número de preguntas que materias = una pregunta por cada materia
          return `\nIMPORTANTE: La lista contiene ${n} ${label}: ${listaReparto.map(t => `"${t}"`).join(', ')}. ` +
            `Debes generar EXACTAMENTE ${total} preguntas, UNA pregunta por cada ${label.slice(0, -1)}. ` +
            `La primera pregunta debe ser sobre "${listaReparto[0]}", la segunda sobre "${listaReparto[1]}", y así sucesivamente. ` +
            `NO generes más de una pregunta por materia. Distribución: 1 pregunta por "${listaReparto.join('", 1 pregunta por "')}".`;
        } else if (total > n) {
          return `\nLa lista contiene múltiples ${label}: ${listaReparto.map(t => `"${t}"`).join(', ')}. ` +
            `Distribuye las ${total} preguntas entre estos ${label} de forma equilibrada y genera AL MENOS 1 pregunta por cada uno; ` +
            `reparte el resto de manera proporcional.`;
        } else {
          // total < n: más materias que preguntas
          return `\nADVERTENCIA: La lista contiene ${n} ${label}: ${listaReparto.map(t => `"${t}"`).join(', ')}, ` +
            `pero solo se generarán ${total} pregunta${total > 1 ? 's' : ''}. ` +
            `Debes elegir una muestra diversa y repartir las ${total} pregunta${total > 1 ? 's' : ''} entre diferentes ${label}, ` +
            `asegurándote de cubrir al menos ${Math.min(total, n)} ${label} diferentes (no te quedes en 1 solo tema/materia). ` +
            `Prioriza la diversidad y el equilibrio en la distribución.`;
        }
      })()
    : '';

  // Determinar si requiere problemas con fórmulas/ecuaciones (matemáticas, física, química)
  const requiereFormulas = /matemática|matematica|física|fisica|química|quimica|álgebra|algebra|geometría|geometria|pensamiento.*analítico|analítico/.test(
    (area || '').toLowerCase() + ' ' + temaEfectivo.toLowerCase()
  );

  const instruccionesFormulas = requiereFormulas ? `

IMPORTANTE PARA ÁREAS DE MATEMÁTICAS, FÍSICA O QUÍMICA (ESTILO EXAMEN IPN):
- Genera problemas PRÁCTICOS similares a exámenes de ingreso universitario como el IPN.
- Incluye FÓRMULAS cuando sean necesarias para resolver el problema (muestra fórmulas como v=d/t, F=ma, x²+5x+6=0, etc.).
- FORMATO MATEMÁTICO: Usa LaTeX para todas las fórmulas matemáticas, encerrándolas en signos de dólar simples para inline ($...$) o dobles para bloque ($$...$$). Ejemplo: "Calcula la integral $\\int x^2 dx$." o "La fórmula es $$F = ma$$". Escapa las barras invertidas correctamente (\\int, \\frac, \\sqrt, \\sum, etc.).
- Presenta situaciones REALES: problemas de la vida diaria, aplicaciones prácticas, análisis de gráficas/tablas.
- Los enunciados deben proporcionar TODOS los datos numéricos necesarios para resolver el problema.
- Las opciones de respuesta múltiple deben incluir el RESULTADO NUMÉRICO correcto con unidades si aplica (ej: "25 m/s", "3.5 moles", "42%", "15 N").
- Para respuesta corta en problemas numéricos, acepta respuestas que incluyan el número con unidades (ej: "25 m/s", "3.5 moles").
- Nivel básico: ENFÓCATE EXCLUSIVAMENTE EN CONCEPTOS FUNDAMENTALES. Para álgebra: preguntas MUY SIMPLES sobre definiciones básicas (¿qué es una variable?, ¿qué es una constante?, ¿qué es una ecuación?), identificación básica en expresiones SIMPLES (máximo 2 términos, sin potencias, números pequeños 1-10). Ejemplos permitidos: 3x, 5y, 2a + 3, x - 5. PROHIBIDO usar expresiones con potencias (x², m²), múltiples términos complejos (más de 2), o operaciones avanzadas. Para física/química: conceptos básicos, definiciones, identificación simple de magnitudes y unidades. Nivel intermedio: combinar fórmulas o despejar variables, resolución de problemas prácticos con expresiones más complejas. Nivel avanzado: problemas multi-paso con análisis complejo, síntesis de conceptos, expresiones algebraicas avanzadas.` : '';

  // Instrucciones específicas según el nivel para el prompt principal
  const nivelInstrucciones = nivel === 'básico'
    ? `\n\nINSTRUCCIONES CRÍTICAS PARA NIVEL BÁSICO (CONCEPTOS FUNDAMENTALES):
- ENFÓCATE EXCLUSIVAMENTE EN CONCEPTOS FUNDAMENTALES Y DEFINICIONES BÁSICAS.
- DIFICULTAD: cada pregunta debe poder resolverse en 10–30 segundos por un estudiante promedio (sin cálculos largos).
- Evita tecnicismos avanzados y evita enunciados largos; máximo ~2 oraciones por pregunta.
- Para álgebra: genera preguntas MUY SIMPLES sobre:
  * ¿Qué es una variable? (ejemplos: x, y, a - sin operaciones complejas)
  * ¿Qué es una constante? (ejemplos: 5, 3, 7 - números simples)
  * ¿Qué es una ecuación? (definición básica, sin resolver)
  * Identificación básica: "En 3x, ¿qué es el 3?" (coeficiente simple)
  * Identificación básica: "En 3x, ¿qué es la x?" (variable simple)
  * NO uses expresiones con potencias (x², m²), NO uses múltiples términos complejos, NO uses operaciones avanzadas.
  * Usa expresiones SIMPLES como: 3x, 5y, 2a + 3, x - 5 (máximo 2 términos, sin potencias).
  * Las preguntas deben ser de RECONOCIMIENTO y DEFINICIÓN, no de cálculo o identificación en expresiones complejas.
- Para otras áreas: conceptos básicos, definiciones fundamentales, identificación simple de elementos.
- Las preguntas deben evaluar COMPRENSIÓN CONCEPTUAL BÁSICA, sin requerir análisis de expresiones complejas.
- Evita expresiones algebraicas con más de 2 términos, potencias, fracciones complejas, o múltiples variables en una misma pregunta.
- Usa ejemplos MUY SIMPLES: números pequeños (1-10), variables simples (x, y, a), operaciones básicas (+, -).`
    : nivel === 'intermedio'
      ? `\n\nINSTRUCCIONES ESPECÍFICAS PARA NIVEL INTERMEDIO (APLICACIÓN):
- ENFÓCATE EN LA APLICACIÓN PRÁCTICA DE CONCEPTOS.
- DIFICULTAD: preguntas de 30–90 segundos; permiten 1–2 pasos de razonamiento o 1 despeje/cálculo moderado.
- Incluye distractores plausibles por errores comunes.
- Genera preguntas que requieran aplicar conceptos en situaciones prácticas, resolver problemas con pasos intermedios, combinar conceptos básicos.
- Puedes usar expresiones con múltiples términos, potencias simples, y operaciones más complejas.
- Incluye problemas de la vida diaria y aplicaciones prácticas.`
      : `\n\nINSTRUCCIONES ESPECÍFICAS PARA NIVEL AVANZADO (ANÁLISIS):
- ENFÓCATE EN ANÁLISIS COMPLEJO Y SÍNTESIS DE CONCEPTOS.
- DIFICULTAD: preguntas de 90–180 segundos; multi‑paso (2–4 pasos), comparación de casos, o interpretación de datos.
- Requiere justificar implícitamente (sin explicaciones largas), pero el enunciado debe traer los datos necesarios.
- Genera preguntas que requieran análisis profundo, problemas multi-paso, síntesis de múltiples conceptos, razonamiento avanzado.
- Puedes usar expresiones complejas con potencias, múltiples términos, fracciones algebraicas, y operaciones avanzadas.
- Incluye problemas que desafíen el pensamiento crítico y la aplicación de conocimientos en contextos complejos.`;

  // Detectar si el examen DEBE salir en inglés (solo para modo auto).
  // Importante: si el "tema" es una lista (ej. "matemáticas, español, inglés..."), NO forzar inglés solo por contener la palabra "inglés".
  // Solo forzamos inglés cuando el área es claramente Inglés, o cuando el tema/temas indican ÚNICAMENTE inglés.
  const areaIndicaIngles = /inglés|english|lengua.*extranjera|foreign.*language/i.test(area || '');
  const temaRaw = String(tema || '').trim();
  const temaPareceLista = /,/.test(temaRaw);
  const temasSoloIngles =
    (modo === 'temas' && temasList.length === 1 && /^(inglés|english)\b/i.test(String(temasList[0] || '').trim())) ||
    (!temaPareceLista && /^(inglés|english)\b/i.test(temaRaw || temaEfectivo));
  const idiomaMode = String(idioma || 'auto').toLowerCase(); // 'auto' | 'es' | 'en' | 'mix'
  const esInglesAuto = areaIndicaIngles || temasSoloIngles;
  const esIngles = idiomaMode === 'en' ? true : (idiomaMode === 'es' || idiomaMode === 'mix') ? false : esInglesAuto;

  // Evitar directrices contradictorias (el área "inglés" trae un bloque que obliga EN).
  if ((idiomaMode === 'es' || idiomaMode === 'mix') && tag === 'ingles') {
    directrices = null;
  }

  const idiomaPrompt = (idiomaMode === 'mix')
    ? 'mixto (es-MX + en-US)'
    : (esIngles ? 'inglés (en-US)' : 'español (es-MX)');

  const instruccionesIdioma = esIngles
    ? `\n\n⚠️ CRITICAL LANGUAGE REQUIREMENT - ALL CONTENT MUST BE IN ENGLISH ONLY ⚠️
This is an English language exam. EVERYTHING must be in English:
- ALL question texts (enunciados) - must be in English
- ALL answer options - must be in English  
- ALL instructions within questions - must be in English
- ALL examples and sample texts - must be in English
- ALL reading comprehension texts (emails, articles, dialogues) - must be in English
- DO NOT mix Spanish and English. DO NOT use Spanish translations.
- If the question asks about English grammar or vocabulary, the question itself must still be in English
- Even instructions like "Read the following email" must be in English
- The JSON structure can use Spanish keys, but ALL user-facing text content must be 100% in English`
    : (idiomaMode === 'mix')
      ? (() => {
          const total = Number(cantidadFinal) || (Number(cantidadFinal) === 0 ? 0 : (Number(cantidad) || 5));
          const enCount = Math.floor(total / 2);
          const esCount = Math.max(0, total - enCount);
          return `\n\nREQUISITO CRÍTICO DE IDIOMA (MIXTO es-MX + en-US):
- Genera EXACTAMENTE ${total} preguntas: ${esCount} en español (es-MX) y ${enCount} en inglés (en-US).
- Para las preguntas en español: enunciado y opciones en español.
- Para las preguntas en inglés: enunciado y opciones en inglés.
- No mezcles idiomas dentro de la MISMA pregunta (no Spanglish en un mismo enunciado/opciones).
- Si aparece contenido de inglés como materia, úsalo dentro de las preguntas en inglés; si aparece como referencia en español, debe ser mínimo (ej. citar una oración).`;
        })()
      : `\n\nREQUISITO CRÍTICO DE IDIOMA (es-MX):
- TODO el contenido visible para el estudiante debe estar en español (es-MX): enunciados, opciones, instrucciones, textos de lectura, etc.
- NO generes el examen completo en inglés.
- Si el tema incluye "inglés" como materia, puedes incluir PALABRAS/ORACIONES en inglés solo como parte del contenido evaluado (por ejemplo, citar una oración en inglés), pero la redacción general debe permanecer en español.`;

  const prompt = `Genera preguntas tipo examen en ${idiomaPrompt}, estilo examen de ingreso universitario (como IPN).${areaLine}
Tema principal: "${temaEfectivo}".
Nivel: ${nivel}. Tipos permitidos: ${tiposDesc}.${distLine}${modoLine}${repartoTemasLine}${dirLine}${instruccionesFormulas}${nivelInstrucciones}${instruccionesIdioma}

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
    // Construir generationConfig optimizado para Free Tier
    // Temperatura baja (0.2) para mayor precisión en JSON y menos "alucinaciones"
    // 8192 es el máximo de Flash. No te cobran por lo que no usas, solo por lo generado.
    // Esto previene cortes a mitad de respuesta (evita "fals", "tru" truncados)
    const generationConfig = {
      temperature: Math.max(0.0, Math.min(1.0, temperature || 0.2)),
      maxOutputTokens: maxOutputTokens || 8192,
      response_mime_type: 'application/json',
      // Structured Outputs: garantiza JSON válido y ahorra tokens (la IA no "habla", solo data)
      response_schema: RESPONSE_SCHEMA
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
      model: MODEL,
      purpose: purpose || 'simuladores' // Indica al servidor qué pool de API keys usar
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

      // Manejar errores de rate limit (429 y 503)
      if (status === 429 || status === 503) {
        // Para 429, usar cooldown más largo con backoff exponencial
        const is429 = status === 429;
        startCooldown(null, is429);

        // Obtener el cooldown real que se estableció
        const actualCooldown = is429
          ? (() => {
            const count429 = Number(localStorage.getItem(COOLDOWN_429_COUNT_KEY) || 0);
            return Math.min(COOLDOWN_429_MS + (count429 - 1) * 300000, 1800000);
          })()
          : COOLDOWN_MS;

        const secs = Math.ceil(actualCooldown / 1000);
        const mins = Math.floor(secs / 60);
        const remainingSecs = secs % 60;
        const timeDisplay = mins > 0
          ? `${mins} minuto${mins > 1 ? 's' : ''}${remainingSecs > 0 ? ` y ${remainingSecs} segundo${remainingSecs > 1 ? 's' : ''}` : ''}`
          : `${secs} segundo${secs > 1 ? 's' : ''}`;
        const count429 = Number(localStorage.getItem(COOLDOWN_429_COUNT_KEY) || 0);
        const errorMsg = status === 503
          ? `El servicio de IA está temporalmente no disponible (saturado). Por favor, espera ${timeDisplay} antes de intentar nuevamente.`
          : `Se alcanzó el límite de solicitudes a la API de Google (límite del servidor, no solo local). Por favor, espera ${timeDisplay} antes de intentar nuevamente. ${is429 && count429 > 1 ? `(Intento ${count429} - el tiempo de espera aumenta con cada error. El límite es compartido y puede afectar a otros usuarios también.)` : 'El límite es del servidor de Google y puede tardar más tiempo en resetearse.'}`;
        const e = new Error(errorMsg);
        e.code = 'RATE_LIMIT';
        e.remainingMs = actualCooldown;
        e.status = status;
        throw e;
      }
      // Otros errores pueden también ser relacionados con límites de cuota
      const errMsg = String(err?.error || err?.message || '').toLowerCase();
      if (errMsg.includes('quota') || errMsg.includes('rate limit') || errMsg.includes('429') || errMsg.includes('503')) {
        // Si el mensaje menciona 429, usar backoff exponencial
        const is429 = errMsg.includes('429');
        startCooldown(null, is429);
        const actualCooldown = is429
          ? (() => {
            const count429 = Number(localStorage.getItem(COOLDOWN_429_COUNT_KEY) || 0);
            return Math.min(COOLDOWN_429_MS + (count429 - 1) * 300000, 1800000);
          })()
          : COOLDOWN_MS;
        const secs = Math.ceil(actualCooldown / 1000);
        const mins = Math.floor(secs / 60);
        const remainingSecs = secs % 60;
        const timeDisplay = mins > 0
          ? `${mins} minuto${mins > 1 ? 's' : ''}${remainingSecs > 0 ? ` y ${remainingSecs} segundo${remainingSecs > 1 ? 's' : ''}` : ''}`
          : `${secs} segundo${secs > 1 ? 's' : ''}`;
        const e = new Error(`Error de cuota: ${err?.error || 'Se alcanzó el límite de solicitudes'}. Por favor, espera ${timeDisplay} antes de intentar nuevamente.`);
        e.code = 'RATE_LIMIT';
        e.remainingMs = actualCooldown;
        e.status = status;
        throw e;
      }
      throw new Error(err?.error || `Error al generar preguntas con IA (${status}). Por favor intenta de nuevo.`);
    }
    const data = await resp.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Con response_schema, el JSON debería ser válido directamente
    // Pero mantenemos extractJson como fallback por si el servidor está saturado o hay errores
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (parseError) {
      // Fallback a extractJson si el parseo directo falla (red de seguridad)
      console.warn('[SimuladoresAI] JSON directo falló, usando extractJson como fallback:', parseError);
      parsed = extractJson(text);
    }

    const arr = Array.isArray(parsed?.preguntas) ? parsed.preguntas : [];
    const result = normalizarPreguntas(arr, cantidadFinal, dist);

    // Incrementar contador de uso exitoso
    incrementQuestionUsage();

    // ⚠️ PREVENCIÓN: Registrar petición exitosa y activar cooldown preventivo
    recordRecentRequest();
    // Si la petición fue exitosa, resetear el contador de 429 y usar cooldown corto
    localStorage.removeItem(COOLDOWN_429_COUNT_KEY);
    // Cooldown corto después de éxito (30 segundos) para prevenir saturación
    startCooldown(30000, false); // 30 segundos después de éxito

    return result;
  } catch (e) {
    clear();
    // Manejar específicamente el AbortError del timeout
    if (e.name === 'AbortError' || e.message?.includes('aborted')) {
      const timeoutError = new Error('La petición tardó demasiado tiempo. Esto puede deberse a que el servicio de IA está saturado. Por favor, intenta nuevamente en unos momentos.');
      timeoutError.code = 'TIMEOUT';
      timeoutError.originalError = e;
      throw timeoutError;
    }
    // Si el error ya tiene un código (como RATE_LIMIT), propagarlo tal cual
    if (e.code) {
      throw e;
    }
    // Para otros errores, propagar con el mensaje original
    throw e;
  }
}
