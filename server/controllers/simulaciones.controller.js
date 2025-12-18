import * as Sims from '../models/simulaciones.model.js';
import * as Access from '../models/student_area_access.model.js';
import * as StudentNotifs from '../models/student_notifications.model.js';
import db from '../db.js';
import { broadcastStudent } from '../ws.js';

export const listSimulaciones = async (req, res) => {
  try {
    const id_area = req.query.id_area ? Number(req.query.id_area) : undefined;
    const visible = req.query.visible === 'false' ? false : true;
    const user = req.user || null;
    // ✅ FILTRAR: Si es estudiante, solo mostrar simulaciones publicadas (excluir borradores)
    const soloPublicas = user && user.role === 'estudiante';
    
    // ✅ DEBUG: Log antes de listar
    if (process.env.NODE_ENV !== 'production' && user && user.role === 'estudiante') {
      console.log('[listSimulaciones] DEBUG antes de listar:', {
        id_area,
        visible,
        soloPublicas,
        userId: user?.id,
        estudianteId: user?.id_estudiante
      });
    }
    
    let rows = await Sims.listSimulaciones({ id_area, visible, soloPublicas });
    
    // ✅ DEBUG: Log temporal para depurar
    if (process.env.NODE_ENV !== 'production' && user && user.role === 'estudiante') {
      console.log('[listSimulaciones] DEBUG después de listSimulaciones MODEL:', {
        totalRows: rows.length,
        id_area,
        visible,
        soloPublicas,
        sampleRows: rows.slice(0, 5).map(r => ({
          id: r.id,
          titulo: r.titulo,
          publico: r.publico,
          id_area: r.id_area,
          grupos: r.grupos,
          activo: r.activo
        }))
      });
      
      // ✅ Verificar directamente en la base de datos si hay simulaciones publicadas
      if (rows.length === 0) {
        try {
          const db = (await import('../db.js')).default;
          const [allSims] = await db.query(`
            SELECT id, titulo, publico, activo, id_area, grupos 
            FROM simulaciones 
            WHERE activo = 1 
            ORDER BY id DESC 
            LIMIT 10
          `);
          console.log('[listSimulaciones] Verificación directa en BD (todas las activas):', {
            total: allSims.length,
            publicadas: allSims.filter(s => s.publico === 1).length,
            generales: allSims.filter(s => !s.id_area || s.id_area === null || s.id_area === 0).length,
            sample: allSims.slice(0, 5).map(s => ({
              id: s.id,
              titulo: s.titulo,
              publico: s.publico,
              activo: s.activo,
              id_area: s.id_area
            }))
          });
        } catch (dbErr) {
          console.error('[listSimulaciones] Error verificando BD:', dbErr);
        }
      }
    }
    
    if (user && user.role === 'estudiante' && user.id_estudiante) {
      try {
        // ✅ IMPORTANTE: Si se solicitó específicamente id_area=0 (solo generales),
        // el modelo ya filtró correctamente, así que no necesitamos filtrar más por áreas permitidas
        // Las simulaciones generales están disponibles para todos los estudiantes
        if (id_area === 0) {
          // Ya están filtradas por el modelo como generales, no filtrar más
          if (process.env.NODE_ENV !== 'production') {
            console.log('[listSimulaciones] Solicitud de generales (id_area=0), sin filtro adicional por áreas:', {
              totalRows: rows.length,
              sample: rows.slice(0, 3).map(r => ({ id: r.id, titulo: r.titulo, id_area: r.id_area }))
            });
          }
        } else {
          // Para otros casos (id_area específico o undefined), aplicar filtro de áreas permitidas
          const allowed = await Access.getAllowedAreaIds(user.id_estudiante);
          const beforeFilter = rows.length;
          
          // ✅ IMPORTANTE: Las simulaciones generales (sin id_area) deben mostrarse siempre
          // Solo filtrar por id_area si el estudiante tiene áreas permitidas
          // Si no tiene áreas permitidas, mostrar solo simulaciones generales (sin id_area)
          if (Array.isArray(allowed) && allowed.length) {
            // Si tiene áreas permitidas, mostrar simulaciones sin área O con área permitida
            rows = rows.filter(r => {
              const hasNoArea = !r.id_area || r.id_area === null || Number(r.id_area) === 0;
              const hasAllowedArea = r.id_area && allowed.includes(Number(r.id_area));
              return hasNoArea || hasAllowedArea;
            });
          } else {
            // Si no tiene áreas permitidas, mostrar solo simulaciones generales (sin id_area)
            rows = rows.filter(r => !r.id_area || r.id_area === null || Number(r.id_area) === 0);
          }
          
          // ✅ DEBUG: Log temporal para depurar
          if (process.env.NODE_ENV !== 'production') {
            console.log('[listSimulaciones] DEBUG después de filtrar por áreas permitidas:', {
              allowedAreas: allowed,
              beforeFilter,
              afterFilter: rows.length,
              filteredOut: beforeFilter - rows.length
            });
          }
        }

        // ✅ Filtrar por grupos: solo mostrar simulaciones asignadas al grupo del estudiante
        // ✅ IMPORTANTE: Las simulaciones generales (sin id_area) siempre deben mostrarse
        // sin importar los grupos asignados
        const [studentData] = await db.query('SELECT grupo FROM estudiantes WHERE id = ? LIMIT 1', [user.id_estudiante]);
        const studentGrupo = studentData[0]?.grupo || null;

        if (studentGrupo) {
          const beforeGruposFilter = rows.length;
          rows = rows.filter(r => {
            // ✅ IMPORTANTE: Si es una simulación general (sin id_area), siempre mostrarla
            // sin importar los grupos asignados. Las simulaciones generales están disponibles
            // para todos los estudiantes independientemente de su grupo.
            const isGeneral = !r.id_area || r.id_area === null || Number(r.id_area) === 0;
            if (isGeneral) {
              if (process.env.NODE_ENV !== 'production') {
                console.log('[listSimulaciones] Incluyendo simulación general (sin filtro de grupos):', {
                  id: r.id,
                  titulo: r.titulo,
                  id_area: r.id_area
                });
              }
              return true;
            }
            
            // Si la simulación no tiene grupos asignados (NULL, undefined, o vacío), está disponible para todos
            if (!r.grupos || r.grupos === null || r.grupos === '') return true;

            // Parsear grupos (puede ser JSON string o array)
            let grupos = [];
            try {
              grupos = typeof r.grupos === 'string' ? JSON.parse(r.grupos) : r.grupos;
              // Si no es array después de parsear, mostrar por seguridad
              if (!Array.isArray(grupos)) return true;
            } catch (parseError) {
              // Error al parsear JSON, mostrar por seguridad
              console.warn('[listSimulaciones] Error parsing grupos for simulacion', r.id, ':', parseError.message);
              return true;
            }

            // Si grupos está vacío, disponible para todos
            if (grupos.length === 0) return true;

            // Verificar si el grupo del estudiante está en la lista
            const matchesGrupo = grupos.includes(studentGrupo);
            
            if (process.env.NODE_ENV !== 'production' && !matchesGrupo) {
              console.log('[listSimulaciones] Excluyendo simulación (grupo no coincide):', {
                id: r.id,
                titulo: r.titulo,
                grupos,
                studentGrupo
              });
            }
            
            return matchesGrupo;
          });
          
          // ✅ DEBUG: Log temporal para depurar
          if (process.env.NODE_ENV !== 'production') {
            console.log('[listSimulaciones] DEBUG después de filtrar por grupos:', {
              studentGrupo,
              beforeGruposFilter,
              afterGruposFilter: rows.length,
              filteredOut: beforeGruposFilter - rows.length
            });
          }
        }
      } catch (e) { console.error('listSimulaciones filter error:', e); }
    }
    // ✅ DEBUG: Log final antes de enviar respuesta
    if (process.env.NODE_ENV !== 'production' && user && user.role === 'estudiante') {
      console.log('[listSimulaciones] DEBUG respuesta final:', {
        totalRows: rows.length,
        estudianteId: user.id_estudiante,
        sampleRows: rows.slice(0, 3).map(r => ({
          id: r.id,
          titulo: r.titulo,
          publico: r.publico,
          activo: r.activo,
          id_area: r.id_area,
          grupos: r.grupos
        }))
      });
    }
    
    res.json({ data: rows });
  } catch (e) { 
    console.error('[listSimulaciones] Error:', e);
    if (process.env.NODE_ENV !== 'production') {
      console.error('[listSimulaciones] Stack:', e.stack);
    }
    res.status(500).json({ message: 'Error interno' }); 
  }
};

export const resumenSimulacionesEstudiante = async (req, res) => {
  try { const rows = await Sims.listResumenEstudiante(req.params.id_estudiante); res.json({ data: rows }); }
  catch (e) { console.error('resumenSimulacionesEstudiante', e); res.status(500).json({ message: 'Error interno' }); }
};

export const listIntentosSimulacionEstudiante = async (req, res) => {
  try { const rows = await Sims.listIntentosEstudiante(req.params.id, req.params.id_estudiante); res.json({ data: rows }); }
  catch (e) { console.error('listIntentosSimulacionEstudiante', e); res.status(500).json({ message: 'Error interno' }); }
};

export const listPreguntasSimulacion = async (req, res) => {
  try { const rows = await Sims.listPreguntas(req.params.id); res.json({ data: rows }); }
  catch (e) { console.error('listPreguntasSimulacion', e); res.status(500).json({ message: 'Error interno' }); }
};

// GET /api/simulaciones/:id/analitica/:id_estudiante
export const getAnaliticaSimulacionEstudiante = async (req, res) => {
  try {
    const id_simulacion = Number(req.params.id);
    const id_estudiante = Number(req.params.id_estudiante);
    if (!id_estudiante) return res.status(400).json({ message: 'id_estudiante requerido' });
    const data = await Sims.getAnaliticaPorEstudiante(id_simulacion, id_estudiante);
    res.json({ data });
  } catch (e) {
    console.error('getAnaliticaSimulacionEstudiante', e);
    res.status(500).json({ message: 'Error interno' });
  }
};

export const crearSesionSimulacion = async (req, res) => {
  try {
    const id_simulacion = Number(req.params.id);
    const id_estudiante = Number(req.body?.id_estudiante);
    if (!id_estudiante) return res.status(400).json({ message: 'id_estudiante requerido' });
    const sesion = await Sims.createSesion({ id_simulacion, id_estudiante });
    res.status(201).json({ data: sesion });
  } catch (e) { console.error('crearSesionSimulacion', e); res.status(500).json({ message: 'Error interno' }); }
};

export const registrarRespuestasSesion = async (req, res) => {
  try {
    const id_sesion = Number(req.params.id_sesion);
    const respuestas = Array.isArray(req.body?.respuestas) ? req.body.respuestas : [];
    const out = await Sims.saveRespuestasBatch(id_sesion, respuestas);
    res.json({ data: { saved: out.affectedRows || 0 } });
  } catch (e) { console.error('registrarRespuestasSesion', e); res.status(500).json({ message: 'Error interno' }); }
};

export const finalizarSesionSimulacion = async (req, res) => {
  try {
    // Aceptar metadatos de tiempo del cliente (elapsed_ms, started_at, finished_at, duration_ms, tiempo_segundos, etc.)
    const meta = req.body || {};
    const result = await Sims.finalizarSesion({ id_sesion: Number(req.params.id_sesion), meta });
    res.json({ data: result });
  } catch (e) { console.error('finalizarSesionSimulacion', e); res.status(500).json({ message: 'Error interno' }); }
};

// Review detallado de una simulación por intento (estructura similar a getReviewQuizIntento)
export const getReviewSimulacionIntento = async (req, res) => {
  try {
    const { id, id_estudiante } = req.params; // simulacion, estudiante
    const intentoQuery = req.query?.intento ? Number(req.query.intento) : null;
    const id_simulacion = Number(id);
    if (!id_simulacion) return res.status(400).json({ message: 'id simulacion inválido' });

    // Cargar preguntas + opciones
    const preguntasRaw = await Sims.listPreguntas(id_simulacion, { includeInactive: true });
    const normalizeOrder = (rows = []) => [...rows].sort((a, b) => {
      const aNum = Number(a?.intent_number ?? a?.intentNumber ?? a?.id ?? 0);
      const bNum = Number(b?.intent_number ?? b?.intentNumber ?? b?.id ?? 0);
      return aNum - bNum;
    });

    // Cargar sesiones finalizadas e intentos para el estudiante
    // Nota: simulaciones_sesiones no tiene columna intent_number; ordenar por finished_at/id.
    const [sesiones] = await db.query(
      'SELECT * FROM simulaciones_sesiones WHERE id_simulacion = ? AND id_estudiante = ? AND finished_at IS NOT NULL ORDER BY finished_at DESC, id DESC',
      [id_simulacion, id_estudiante]
    ).catch(() => [[]]);
    const [intentosRows] = await db.query(
      'SELECT * FROM simulaciones_intentos WHERE id_simulacion = ? AND id_estudiante = ? ORDER BY intent_number ASC, id ASC',
      [id_simulacion, id_estudiante]
    ).catch(() => [[]]);

    const ascSesiones = normalizeOrder(sesiones);
    const ascIntentos = normalizeOrder(intentosRows);

    const pickIntentoResumen = (attemptNum) => {
      if (!ascIntentos.length) return null;
      if (attemptNum && attemptNum > 0) {
        const match = ascIntentos.find(r => Number(r.intent_number) === attemptNum);
        if (match) return match;
        const idx = attemptNum - 1;
        if (idx >= 0 && idx < ascIntentos.length) return ascIntentos[idx];
      }
      return ascIntentos[ascIntentos.length - 1] || null;
    };

    if (!sesiones.length) {
      const resumenFallback = pickIntentoResumen(intentoQuery);
      if (resumenFallback) {
        const idx = ascIntentos.findIndex(r => r.id === resumenFallback.id);
        const intento_num = Number(resumenFallback.intent_number) || (idx >= 0 ? idx + 1 : (ascIntentos.length ? ascIntentos.length : 1));
        return res.json({
          data: {
            intento: intento_num,
            sesion: null,
            resumen: resumenFallback,
            preguntas: [],
            detail_available: false,
            fallback: { reason: 'no_session' }
          }
        });
      }
      return res.status(404).json({ message: 'No hay sesión finalizada para mostrar' });
    }

    let sesion = (() => {
      if (intentoQuery && intentoQuery > 0) {
        const direct = sesiones.find(s => Number(s.intent_number) === intentoQuery);
        if (direct) return direct;
        return ascSesiones[intentoQuery - 1] || null;
      }
      return sesiones[0];
    })();

    if (!sesion) {
      sesion = sesiones[0];
    }

    const intento_num = (() => {
      if (!sesion) return 1;
      if (sesion.intent_number != null) return Number(sesion.intent_number) || 1;
      const idx = ascSesiones.findIndex(s => s.id === sesion.id);
      return idx >= 0 ? idx + 1 : 1;
    })();

    const resumen = (() => {
      if (!ascIntentos.length) return null;
      const byIntent = ascIntentos.find(r => Number(r.intent_number) === intento_num);
      if (byIntent) return byIntent;
      if (intentoQuery && intentoQuery > 0) {
        const byQuery = ascIntentos.find(r => Number(r.intent_number) === intentoQuery);
        if (byQuery) return byQuery;
      }
      const idx = ascSesiones.findIndex(s => s.id === sesion?.id);
      if (idx >= 0 && ascIntentos[idx]) return ascIntentos[idx];
      return ascIntentos[ascIntentos.length - 1];
    })();

    const buildPreguntas = (answersMap) => preguntasRaw.map(p => {
      const respuestas = answersMap.get(p.id) || [];
      // Normalizar múltiples filas por misma pregunta: para opción única tomar SOLO la última marca.
      let seleccionadas = [];
      let valor_texto = null;
      let respuestaCortaObj = null;
      if (p.tipo === 'opcion_multiple' || p.tipo === 'verdadero_falso') {
        const withOpt = respuestas.filter(r => r.id_opcion != null);
        if (withOpt.length) {
          // Tomar la última por id (id autoincremental correlaciona con el orden de guardado)
          const last = withOpt.reduce((a, b) => (a.id > b.id ? a : b));
          seleccionadas = [last.id_opcion];
        }
      } else if (p.tipo === 'multi_respuesta') {
        // Conservar únicas por opción, última ocurrencia prevalece (aunque no hay 'desmarcar' en tabla)
        const ids = new Set();
        for (const r of respuestas) { if (r.id_opcion != null) ids.add(r.id_opcion); }
        seleccionadas = Array.from(ids);
      } else if (p.tipo === 'respuesta_corta') {
        // Para respuestas cortas, buscar cualquier respuesta (incluso si texto_libre es null)
        // Esto es importante porque la respuesta puede estar en estado "pending" sin texto aún
        if (respuestas.length > 0) {
          // Tomar la última respuesta (por ID) para esta pregunta
          const last = respuestas.reduce((a, b) => (a.id > b.id ? a : b));
          // Si tiene texto_libre, usarlo; si no, dejar null
          valor_texto = last.texto_libre != null && String(last.texto_libre).trim() !== '' 
            ? last.texto_libre 
            : null;
          respuestaCortaObj = last; // Guardar el objeto completo de la respuesta para campos de calificación
          // Asegurar que tenemos el ID de la respuesta (debe ser el id de la fila en simulaciones_respuestas)
          if (!respuestaCortaObj.id) {
            console.error('[getReviewSimulacionIntento] Respuesta corta sin ID:', respuestaCortaObj);
          } else {
            console.log(`[getReviewSimulacionIntento] ✅ Respuesta corta encontrada para pregunta ${p.id}:`, {
              id_respuesta: respuestaCortaObj.id,
              texto_libre: respuestaCortaObj.texto_libre,
              calificacion_status: respuestaCortaObj.calificacion_status
            });
          }
        } else {
          console.warn(`[getReviewSimulacionIntento] ⚠️ No hay respuestas en BD para pregunta ${p.id} (tipo: respuesta_corta)`);
        }
      } else {
        // Default (tratar como opción única)
        const withOpt = respuestas.filter(r => r.id_opcion != null);
        if (withOpt.length) {
          const last = withOpt.reduce((a, b) => (a.id > b.id ? a : b));
          seleccionadas = [last.id_opcion];
        }
      }

      // Tiempo: mantener suma como referencia (puede estar sobrecontado si hubo cambios, pero no afecta correctitud)
      const tiempo_ms = respuestas.reduce((s, r) => s + (Number(r.tiempo_ms) || 0), 0) || null;

      const correctasIds = (p.opciones || []).filter(o => o.es_correcta === 1).map(o => o.id);
      let correcta = false;
      if (p.tipo === 'multi_respuesta') {
        correcta = seleccionadas.length === correctasIds.length && seleccionadas.every(id => correctasIds.includes(id));
      } else if (p.tipo === 'opcion_multiple' || p.tipo === 'verdadero_falso') {
        correcta = seleccionadas.length === 1 && correctasIds.includes(seleccionadas[0]);
      } else if (p.tipo === 'respuesta_corta') {
        // Para respuesta corta: si fue revisada manualmente, usar calificacion_confianza
        // 100 = correcta, 0 = incorrecta (cuando es revisión manual)
        if (respuestaCortaObj && respuestaCortaObj.calificacion_metodo === 'manual') {
          correcta = respuestaCortaObj.calificacion_confianza === 100;
        } else {
          // Si no fue revisada manualmente, usar comparación de texto o calificación automática
          const correctOpt = (p.opciones || []).find(o => o.es_correcta === 1);
          if (correctOpt && valor_texto) {
            correcta = correctOpt.texto.trim().toLowerCase() === String(valor_texto).trim().toLowerCase();
          } else if (respuestaCortaObj && respuestaCortaObj.calificacion_confianza != null) {
            // Usar calificación automática: confianza >= 70 generalmente significa correcta
            correcta = respuestaCortaObj.calificacion_confianza >= 70;
          }
        }
      }

      const preguntaObj = {
        id: p.id,
        orden: p.orden,
        enunciado: p.enunciado,
        tipo: p.tipo,
        puntos: p.puntos,
        opciones: (p.opciones || []).map(o => ({ id: o.id, texto: o.texto, es_correcta: o.es_correcta })),
        seleccionadas,
        valor_texto,
        correcta,
        tiempo_ms
      };
      
      // Si es respuesta corta y tenemos la respuesta con calificación, incluir campos adicionales
      if (p.tipo === 'respuesta_corta') {
        if (respuestaCortaObj && respuestaCortaObj.id) {
          // Tenemos una respuesta en la BD, incluir todos los campos
          preguntaObj.id_respuesta = respuestaCortaObj.id; // ID de la respuesta en la BD (CRÍTICO: debe ser el ID de simulaciones_respuestas, no de la pregunta)
          preguntaObj.calificacion_status = respuestaCortaObj.calificacion_status || 'pending';
          preguntaObj.calificacion_metodo = respuestaCortaObj.calificacion_metodo || null;
          preguntaObj.calificacion_confianza = respuestaCortaObj.calificacion_confianza != null ? Number(respuestaCortaObj.calificacion_confianza) : null;
          preguntaObj.revisada_por = respuestaCortaObj.revisada_por || null;
          preguntaObj.notas_revision = respuestaCortaObj.notas_revision || null;
        } else {
          // No hay respuesta en la BD aún (puede estar pendiente de guardar)
          // NO incluir id_respuesta para evitar errores
          console.warn(`[getReviewSimulacionIntento] Respuesta corta sin objeto respuesta para pregunta ${p.id}`);
          preguntaObj.calificacion_status = 'pending';
        }
      }
      
      return preguntaObj;
    });

    // Respuestas de la sesión
    const [resps] = await db.query('SELECT * FROM simulaciones_respuestas WHERE id_sesion = ?', [sesion.id]);
    let byPregunta = new Map();
    for (const r of resps) { const arr = byPregunta.get(r.id_pregunta) || []; arr.push(r); byPregunta.set(r.id_pregunta, arr); }

    let detailAvailable = resps.length > 0;
    let resumenOut = resumen;
    let sesionOut = sesion;
    let fallbackReason = detailAvailable ? null : 'partial';

    if (!detailAvailable) {
      try {
        const analitica = await Sims.getAnaliticaPorEstudiante(id_simulacion, id_estudiante);
        if (analitica && Array.isArray(analitica.intentos)) {
          const match = analitica.intentos.find(item => {
            const attemptNum = Number(item?.intento?.intent_number ?? item?.intento?.numero ?? 0);
            return attemptNum === intento_num;
          }) || analitica.intentos[intento_num - 1];

          if (match) {
            const fallbackResps = Array.isArray(match.respuestas) ? match.respuestas : [];
            if (fallbackResps.length) {
              byPregunta = new Map();
              for (const r of fallbackResps) {
                const arr = byPregunta.get(r.id_pregunta) || [];
                arr.push(r);
                byPregunta.set(r.id_pregunta, arr);
              }
              detailAvailable = true;
              fallbackReason = 'analytics';
              if (!resumenOut && match.intento) resumenOut = match.intento;
              if ((!sesionOut || !sesionOut.id) && match.sesion) sesionOut = match.sesion;
            }
          }
        }
      } catch (err) {
        console.warn('getReviewSimulacionIntento: analitica fallback', err?.message || err);
      }
    }

    const preguntas = buildPreguntas(byPregunta);

    res.json({
      data: {
        intento: intento_num,
        sesion: sesionOut ? {
          id: sesionOut.id,
          finished_at: sesionOut.finished_at,
          started_at: sesionOut.started_at || null,
          intent_number: sesionOut.intent_number ?? intento_num,
          elapsed_ms: sesionOut.elapsed_ms ?? null
        } : null,
        resumen: resumenOut,
        preguntas,
        detail_available: detailAvailable,
        fallback: fallbackReason ? { reason: fallbackReason } : null
      }
    });
  } catch (e) {
    console.error('getReviewSimulacionIntento', e);
    res.status(500).json({ message: 'Error interno' });
  }
};

// ----- CRUD para asesores/admin ----- //
export const createSimulacion = async (req, res) => {
  try {
    if (req.user?.role === 'estudiante') return res.status(403).json({ message: 'No autorizado' });
    const { titulo, descripcion, preguntas, fecha_limite, time_limit_min, publico, activo, id_area, grupos } = req.body || {};
    
    // ✅ IMPORTANTE: Validar que el título no esté vacío (trim para eliminar espacios)
    const tituloTrimmed = titulo ? String(titulo).trim() : '';
    
    // ✅ Log detallado para debugging
    console.log('[createSimulacion] Validación de título:', {
      tituloRecibido: titulo,
      tituloTipo: typeof titulo,
      tituloTrimmed,
      tituloTrimmedLength: tituloTrimmed.length,
      tituloVacio: !tituloTrimmed,
      tituloMenorA3: tituloTrimmed.length < 3,
      bodyCompleto: req.body
    });
    
    if (!tituloTrimmed || tituloTrimmed.length < 3) {
      console.error('[createSimulacion] ❌ ERROR: Título inválido rechazado:', {
        tituloRecibido: titulo,
        tituloTrimmed,
        tituloTrimmedLength: tituloTrimmed.length
      });
      return res.status(400).json({ message: 'El título del simulador es requerido y debe tener al menos 3 caracteres' });
    }
    
    const creado_por = req.user?.id || null;
    // Parse grupos if string
    let gruposVal = grupos;
    try { if (typeof gruposVal === 'string') gruposVal = JSON.parse(gruposVal); } catch { gruposVal = null; }
    if (gruposVal && !Array.isArray(gruposVal)) gruposVal = null;

    // ✅ IMPORTANTE: Si activo no se proporciona, usar true por defecto (simuladores deben estar activos)
    // Si se proporciona activo explícitamente, usarlo (útil para simuladores creados con IA que inicialmente pueden estar como borradores)
    const activoValue = activo !== undefined ? (activo === true || activo === 1 || activo === '1') : true;

    // ✅ IMPORTANTE: Normalizar id_area - convertir a número si es válido, null si no
    // Esto asegura que valores como "101" se conviertan a 101, y null/undefined se mantengan como null
    let idAreaFinal = null;
    if (id_area !== null && id_area !== undefined && id_area !== '') {
      const idAreaNum = Number(id_area);
      if (!Number.isNaN(idAreaNum) && idAreaNum > 0) {
        idAreaFinal = idAreaNum;
      }
    }
    
    // Log para debugging
    console.log('[createSimulacion] Recibido:', {
      titulo: tituloTrimmed,
      descripcion: descripcion ? String(descripcion).trim().substring(0, 50) : null,
      id_areaRecibido: id_area,
      id_areaFinal: idAreaFinal,
      tipoIdArea: typeof id_area,
      tienePreguntas: Array.isArray(preguntas) && preguntas.length > 0,
      cantidadPreguntas: Array.isArray(preguntas) ? preguntas.length : 0,
      fecha_limite: fecha_limite,
      time_limit_min: time_limit_min,
      publico: publico,
      activo: activoValue,
      grupos: gruposVal
    });

    // ✅ IMPORTANTE: Usar título validado (trimmed) y asegurar descripción
    const descripcionFinal = descripcion ? String(descripcion).trim() : null;
    const created = await Sims.createSimulacion({ 
      titulo: tituloTrimmed, // Usar título validado
      descripcion: descripcionFinal || null, 
      id_area: idAreaFinal, // ✅ Usar id_area normalizado
      fecha_limite, 
      time_limit_min, 
      publico, 
      activo: activoValue, 
      creado_por, 
      grupos: gruposVal 
    });
    if (Array.isArray(preguntas) && preguntas.length) {
      try { 
        await Sims.replacePreguntas(created.id, preguntas);
        console.log('[createSimulacion] Preguntas guardadas exitosamente:', {
          simulacionId: created.id,
          cantidadPreguntas: preguntas.length
        });
      } catch (e) { 
        console.error('createSimulacion: replacePreguntas ERROR', e?.message || e);
        console.error('Stack:', e?.stack);
      }
    }
    const fresh = await Sims.getSimulacionById(created.id);
    
    // ✅ Log para verificar qué se guardó
    console.log('[createSimulacion] Simulador guardado en BD:', {
      id: fresh?.id,
      titulo: fresh?.titulo,
      tituloTipo: typeof fresh?.titulo,
      tituloVacio: !fresh?.titulo || String(fresh?.titulo).trim() === '',
      tituloLength: fresh?.titulo ? String(fresh?.titulo).length : 0,
      descripcion: fresh?.descripcion ? String(fresh.descripcion).substring(0, 50) : null,
      descripcionTipo: typeof fresh?.descripcion,
      descripcionVacia: !fresh?.descripcion || String(fresh?.descripcion).trim() === '',
      descripcionLength: fresh?.descripcion ? String(fresh?.descripcion).length : 0,
      id_area: fresh?.id_area,
      publico: fresh?.publico,
      activo: fresh?.activo,
      // Comparar con lo que se envió
      tituloEnviado: tituloTrimmed,
      descripcionEnviada: descripcionFinal ? String(descripcionFinal).substring(0, 50) : null,
      tituloCoincide: fresh?.titulo === tituloTrimmed,
      todosLosCampos: Object.keys(fresh || {})
    });

    // ✅ SOLO notificar a estudiantes si la simulación está PUBLICADA (publico = 1)
    // No enviar notificaciones si está en borrador
    try {
      const isPublished = fresh?.publico === 1 || publico === 1 || publico === true;
      if (isPublished) {
        let rows = [];
        
        // Si hay grupos asignados, notificar solo a esos grupos
        if (Array.isArray(gruposVal) && gruposVal.length) {
          // ✅ IMPORTANTE: Normalizar grupos para comparación (el grupo en BD puede estar en mayúsculas)
          const gruposNormalizados = gruposVal.map(g => String(g).trim());
          const placeholders = gruposNormalizados.map(() => 'UPPER(TRIM(?))').join(',');
          // ✅ IMPORTANTE: Solo estudiantes activos y sin soft delete
          const [gruposRows] = await db.query(`
            SELECT e.id 
            FROM estudiantes e
            LEFT JOIN soft_deletes sd ON sd.id_estudiante = e.id
            WHERE UPPER(TRIM(e.grupo)) IN (${placeholders})
              AND e.estatus = 'Activo'
              AND sd.id IS NULL
          `, gruposNormalizados);
          rows = gruposRows;
          console.log(`[createSimulacion] Notificando a ${rows.length} estudiantes activos de grupos ${JSON.stringify(gruposVal)}`);
        }
        // Si NO hay grupos pero hay área, notificar a todos los estudiantes con acceso a esa área
        else if (fresh?.id_area) {
          try {
            const [areaRows] = await db.query(`
              SELECT DISTINCT e.id 
              FROM estudiantes e
              INNER JOIN student_area_access saa ON saa.id_estudiante = e.id
              LEFT JOIN soft_deletes sd ON sd.id_estudiante = e.id
              WHERE saa.area_id = ? 
                AND saa.status = 'approved'
                AND e.estatus = 'Activo'
                AND sd.id IS NULL
            `, [fresh.id_area]);
            rows = areaRows;
            console.log(`[createSimulacion] Notificando a ${rows.length} estudiantes activos con acceso al área ${fresh.id_area}`);
          } catch (areaErr) {
            console.error('[createSimulacion] Error al obtener estudiantes por área:', areaErr);
          }
        }
        // Si es general (sin grupos ni área), notificar a todos los estudiantes activos
        else {
          try {
            const [allRows] = await db.query(`
              SELECT e.id 
              FROM estudiantes e
              LEFT JOIN soft_deletes sd ON sd.id_estudiante = e.id
              WHERE e.estatus = 'Activo'
                AND sd.id IS NULL
              LIMIT 500
            `);
            rows = allRows;
            console.log(`[createSimulacion] Notificando a ${rows.length} estudiantes activos (simulación general)`);
          } catch (allErr) {
            console.error('[createSimulacion] Error al obtener todos los estudiantes:', allErr);
          }
        }
        
        if (rows.length) {
          const list = rows.map(r => ({
            student_id: r.id,
            type: 'assignment',
            title: 'Nueva simulación asignada',
            message: fresh.titulo ? `Se te asignó: ${fresh.titulo}` : 'Tienes una nueva simulación',
            action_url: `/alumno/simulaciones`,
            metadata: { simulacion_id: fresh.id, kind: 'simulacion' }
          }));
          const bulkRes = await StudentNotifs.bulkCreateNotifications(list).catch(() => null);
          let idMap = [];
          if (bulkRes && bulkRes.affectedRows) {
            const { firstInsertId, affectedRows } = bulkRes;
            if (firstInsertId && affectedRows === rows.length) idMap = Array.from({ length: affectedRows }, (_, i) => firstInsertId + i);
          }
          rows.forEach((r, idx) => {
            broadcastStudent(r.id, { type: 'notification', payload: { kind: 'assignment', simulacion_id: fresh.id, title: 'Nueva simulación', message: fresh.titulo, notif_id: idMap[idx] } });
          });
          console.log(`[createSimulacion] Notificaciones enviadas a ${rows.length} estudiantes (simulación publicada)`);
        } else {
          console.log('[createSimulacion] Simulación publicada pero no se encontraron estudiantes para notificar');
        }
      } else if (!isPublished) {
        console.log('[createSimulacion] Simulación creada como borrador, no se enviaron notificaciones');
      }
    } catch (e) { console.error('notif createSimulacion', e); }

    res.status(201).json({ data: fresh });
  } catch (e) { console.error('createSimulacion', e); res.status(500).json({ message: 'Error interno' }); }
};

// Listar, para una simulación, los estudiantes que ya tienen intentos y su puntaje oficial (primer intento)
export const estudiantesEstadoSimulacion = async (req, res) => {
  try {
    const { id } = req.params; // id simulación
    const simulacion = await Sims.getSimulacionById(id);
    if (!simulacion) return res.status(404).json({ message: 'Simulación no encontrada' });
    const rows = await Sims.listEstudiantesEstadoSimulacion(id);
    res.json({ data: rows });
  } catch (e) {
    console.error('estudiantesEstadoSimulacion', { id: req.params?.id, err: e });
    res.status(500).json({ message: 'Error interno' });
  }
};

export const updateSimulacion = async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, preguntas, fecha_limite, time_limit_min, publico, id_area, activo, grupos } = req.body || {};
  try {
    if (req.user?.role === 'estudiante') return res.status(403).json({ message: 'No autorizado' });
    // Obtener para detectar transición de publicación si se desea
    const existing = await Sims.getSimulacionById(id);
    if (!existing) return res.status(404).json({ message: 'Simulación no encontrada' });
    const prevPublico = !!existing.publico;

    // ✅ IMPORTANTE: Validar título si se está actualizando (no permitir string vacío)
    let tituloFinal = titulo;
    if (titulo !== undefined) {
      const tituloTrimmed = titulo ? String(titulo).trim() : '';
      if (!tituloTrimmed || tituloTrimmed.length < 3) {
        // Si el título está vacío o es muy corto, usar el título existente (no actualizar)
        console.warn('[updateSimulacion] Título inválido recibido, preservando título existente:', {
          tituloRecibido: titulo,
          tituloExistente: existing.titulo,
          simulacionId: id
        });
        tituloFinal = undefined; // No incluir en la actualización
      } else {
        tituloFinal = tituloTrimmed;
      }
    }

    const updated = await Sims.updateSimulacionMeta(id, { titulo: tituloFinal, descripcion, id_area, fecha_limite, time_limit_min, publico, activo, grupos });
    if (Array.isArray(preguntas)) {
      await Sims.replacePreguntas(id, preguntas);
    }

    // ✅ SOLO notificar si pasó de no publicado a publicado
    // No enviar notificaciones si está en borrador o si ya estaba publicado
    try {
      const publishTransition = (publico !== undefined) && !prevPublico && (!!publico || publico === 1);
      if (publishTransition) {
        let gruposVal = grupos;
        try { if (!gruposVal && existing.grupos) gruposVal = typeof existing.grupos === 'string' ? JSON.parse(existing.grupos) : existing.grupos; } catch { gruposVal = null; }
        
        let rows = [];
        
        // Si hay grupos asignados, notificar solo a esos grupos
        if (Array.isArray(gruposVal) && gruposVal.length) {
          // ✅ IMPORTANTE: Normalizar grupos para comparación (el grupo en BD puede estar en mayúsculas)
          const gruposNormalizados = gruposVal.map(g => String(g).trim());
          const placeholders = gruposNormalizados.map(() => 'UPPER(TRIM(?))').join(',');
          // ✅ IMPORTANTE: Solo estudiantes activos y sin soft delete
          const [gruposRows] = await db.query(`
            SELECT e.id 
            FROM estudiantes e
            LEFT JOIN soft_deletes sd ON sd.id_estudiante = e.id
            WHERE UPPER(TRIM(e.grupo)) IN (${placeholders})
              AND e.estatus = 'Activo'
              AND sd.id IS NULL
          `, gruposNormalizados);
          rows = gruposRows;
          console.log(`[updateSimulacion] Notificando a ${rows.length} estudiantes activos de grupos ${JSON.stringify(gruposVal)}`);
        }
        // Si NO hay grupos pero hay área, notificar a todos los estudiantes con acceso a esa área
        else if (existing?.id_area) {
          try {
            const [areaRows] = await db.query(`
              SELECT DISTINCT e.id 
              FROM estudiantes e
              INNER JOIN student_area_access saa ON saa.id_estudiante = e.id
              LEFT JOIN soft_deletes sd ON sd.id_estudiante = e.id
              WHERE saa.area_id = ? 
                AND saa.status = 'approved'
                AND e.estatus = 'Activo'
                AND sd.id IS NULL
            `, [existing.id_area]);
            rows = areaRows;
            console.log(`[updateSimulacion] Notificando a ${rows.length} estudiantes activos con acceso al área ${existing.id_area}`);
          } catch (areaErr) {
            console.error('[updateSimulacion] Error al obtener estudiantes por área:', areaErr);
          }
        }
        // Si es general (sin grupos ni área), notificar a todos los estudiantes activos
        else {
          try {
            const [allRows] = await db.query(`
              SELECT e.id 
              FROM estudiantes e
              LEFT JOIN soft_deletes sd ON sd.id_estudiante = e.id
              WHERE e.estatus = 'Activo'
                AND sd.id IS NULL
              LIMIT 500
            `);
            rows = allRows;
            console.log(`[updateSimulacion] Notificando a ${rows.length} estudiantes activos (simulación general)`);
          } catch (allErr) {
            console.error('[updateSimulacion] Error al obtener todos los estudiantes:', allErr);
          }
        }
        
        if (rows.length) {
          const list = rows.map(r => ({
            student_id: r.id,
            type: 'assignment',
            title: 'Nueva simulación asignada',
            message: (titulo || existing.titulo) ? `Se te asignó: ${titulo || existing.titulo}` : 'Tienes una nueva simulación',
            action_url: `/alumno/simulaciones`,
            metadata: { simulacion_id: Number(id), kind: 'simulacion' }
          }));
          const bulkRes = await StudentNotifs.bulkCreateNotifications(list).catch(() => null);
          let idMap = [];
          if (bulkRes && bulkRes.affectedRows) {
            const { firstInsertId, affectedRows } = bulkRes;
            if (firstInsertId && affectedRows === rows.length) idMap = Array.from({ length: affectedRows }, (_, i) => firstInsertId + i);
          }
          rows.forEach((r, idx) => {
            broadcastStudent(r.id, { type: 'notification', payload: { kind: 'assignment', simulacion_id: Number(id), title: 'Nueva simulación', message: titulo || existing.titulo, notif_id: idMap[idx] } });
          });
          console.log(`[updateSimulacion] Notificaciones enviadas a ${rows.length} estudiantes (simulación publicada)`);
        } else {
          console.log('[updateSimulacion] Simulación publicada pero no se encontraron estudiantes para notificar');
        }
      }
    } catch (e) { console.error('notif updateSimulacion', e); }

    const fresh = await Sims.getSimulacionById(id);
    res.json({ data: fresh });
  } catch (e) { console.error('updateSimulacion', e); res.status(500).json({ message: 'Error interno' }); }
};

export const deleteSimulacion = async (req, res) => {
  const { id } = req.params;
  try {
    if (req.user?.role === 'estudiante') return res.status(403).json({ message: 'No autorizado' });
    const ok = await Sims.deleteSimulacion(id);
    if (!ok) return res.status(404).json({ message: 'Simulación no encontrada' });
    res.json({ ok: true });
  } catch (e) { console.error('deleteSimulacion', e); res.status(500).json({ message: 'Error interno' }); }
};

export const getSimulacionFull = async (req, res) => {
  try {
    const sim = await Sims.getSimulacionFull(req.params.id);
    if (!sim) return res.status(404).json({ message: 'No encontrado' });
    res.json({ data: sim });
  } catch (e) { console.error('getSimulacionFull', e); res.status(500).json({ message: 'Error interno' }); }
};

export const getSimulacion = async (req, res) => {
  try {
    const sim = await Sims.getSimulacionById(req.params.id);
    if (!sim) return res.status(404).json({ message: 'No encontrado' });
    res.json({ data: sim });
  } catch (e) { console.error('getSimulacion', e); res.status(500).json({ message: 'Error interno' }); }
};
