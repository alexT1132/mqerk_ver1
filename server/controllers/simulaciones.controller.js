import * as Sims from '../models/simulaciones.model.js';
import * as Access from '../models/student_area_access.model.js';
import * as StudentNotifs from '../models/student_notifications.model.js';
import db from '../db.js';
import { broadcastStudent } from '../ws.js';

export const listSimulaciones = async (req, res) => {
  try {
    const id_area = req.query.id_area ? Number(req.query.id_area) : undefined;
    const visible = req.query.visible === 'false' ? false : true;
    let rows = await Sims.listSimulaciones({ id_area, visible });
    const user = req.user || null;
    if (user && user.role === 'estudiante' && user.id_estudiante) {
      try {
        const allowed = await Access.getAllowedAreaIds(user.id_estudiante);
        if (Array.isArray(allowed) && allowed.length) {
          rows = rows.filter(r => !r.id_area || allowed.includes(Number(r.id_area)));
        } else {
          rows = rows.filter(r => !r.id_area);
        }
      } catch {}
    }
    res.json({ data: rows });
  } catch (e) { console.error('listSimulaciones', e); res.status(500).json({ message:'Error interno' }); }
};

export const resumenSimulacionesEstudiante = async (req, res) => {
  try { const rows = await Sims.listResumenEstudiante(req.params.id_estudiante); res.json({ data: rows }); }
  catch (e) { console.error('resumenSimulacionesEstudiante', e); res.status(500).json({ message:'Error interno' }); }
};

export const listIntentosSimulacionEstudiante = async (req, res) => {
  try { const rows = await Sims.listIntentosEstudiante(req.params.id, req.params.id_estudiante); res.json({ data: rows }); }
  catch (e) { console.error('listIntentosSimulacionEstudiante', e); res.status(500).json({ message:'Error interno' }); }
};

export const listPreguntasSimulacion = async (req, res) => {
  try { const rows = await Sims.listPreguntas(req.params.id); res.json({ data: rows }); }
  catch (e) { console.error('listPreguntasSimulacion', e); res.status(500).json({ message:'Error interno' }); }
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
    if (!id_estudiante) return res.status(400).json({ message:'id_estudiante requerido' });
    const sesion = await Sims.createSesion({ id_simulacion, id_estudiante });
    res.status(201).json({ data: sesion });
  } catch (e) { console.error('crearSesionSimulacion', e); res.status(500).json({ message:'Error interno' }); }
};

export const registrarRespuestasSesion = async (req, res) => {
  try {
    const id_sesion = Number(req.params.id_sesion);
    const respuestas = Array.isArray(req.body?.respuestas) ? req.body.respuestas : [];
    const out = await Sims.saveRespuestasBatch(id_sesion, respuestas);
    res.json({ data: { saved: out.affectedRows || 0 } });
  } catch (e) { console.error('registrarRespuestasSesion', e); res.status(500).json({ message:'Error interno' }); }
};

export const finalizarSesionSimulacion = async (req, res) => {
  try {
    // Aceptar metadatos de tiempo del cliente (elapsed_ms, started_at, finished_at, duration_ms, tiempo_segundos, etc.)
    const meta = req.body || {};
    const result = await Sims.finalizarSesion({ id_sesion: Number(req.params.id_sesion), meta });
    res.json({ data: result });
  } catch (e) { console.error('finalizarSesionSimulacion', e); res.status(500).json({ message:'Error interno' }); }
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
    ).catch(()=>[[]]);
    const [intentosRows] = await db.query(
      'SELECT * FROM simulaciones_intentos WHERE id_simulacion = ? AND id_estudiante = ? ORDER BY intent_number ASC, id ASC',
      [id_simulacion, id_estudiante]
    ).catch(()=>[[]]);

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
        const withText = respuestas.filter(r => r.texto_libre != null && String(r.texto_libre).trim() !== '');
        if (withText.length) {
          const last = withText.reduce((a, b) => (a.id > b.id ? a : b));
          valor_texto = last.texto_libre;
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
        const correctOpt = (p.opciones || []).find(o => o.es_correcta === 1);
        if (correctOpt && valor_texto) correcta = correctOpt.texto.trim().toLowerCase() === String(valor_texto).trim().toLowerCase();
      }

      return {
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
    res.status(500).json({ message:'Error interno' });
  }
};

// ----- CRUD para asesores/admin ----- //
export const createSimulacion = async (req, res) => {
  try {
    if (req.user?.role === 'estudiante') return res.status(403).json({ message:'No autorizado' });
    const { titulo, descripcion, preguntas, fecha_limite, time_limit_min, publico, id_area, grupos } = req.body || {};
    if (!titulo) return res.status(400).json({ message: 'titulo requerido' });
    const creado_por = req.user?.id || null;
    // Parse grupos if string
    let gruposVal = grupos;
    try { if (typeof gruposVal === 'string') gruposVal = JSON.parse(gruposVal); } catch { gruposVal = null; }
    if (gruposVal && !Array.isArray(gruposVal)) gruposVal = null;

    const created = await Sims.createSimulacion({ titulo, descripcion, id_area, fecha_limite, time_limit_min, publico, creado_por, grupos: gruposVal });
    if (Array.isArray(preguntas) && preguntas.length) {
      try { await Sims.replacePreguntas(created.id, preguntas); } catch (e) { console.warn('createSimulacion: replacePreguntas', e?.message || e); }
    }
    const fresh = await Sims.getSimulacionById(created.id);

    // Notificar a estudiantes por grupos si se especificaron
    try {
      if (Array.isArray(gruposVal) && gruposVal.length) {
        const placeholders = gruposVal.map(()=>'?').join(',');
        const [rows] = await db.query(`SELECT id FROM estudiantes WHERE grupo IN (${placeholders})`, gruposVal);
        if (rows.length) {
          const list = rows.map(r => ({
            student_id: r.id,
            type: 'assignment',
            title: 'Nueva simulación asignada',
            message: fresh.titulo ? `Se te asignó: ${fresh.titulo}` : 'Tienes una nueva simulación',
            action_url: `/alumno/simulaciones`,
            metadata: { simulacion_id: fresh.id, kind: 'simulacion' }
          }));
          const bulkRes = await StudentNotifs.bulkCreateNotifications(list).catch(()=>null);
          let idMap = [];
          if (bulkRes && bulkRes.affectedRows) {
            const { firstInsertId, affectedRows } = bulkRes;
            if (firstInsertId && affectedRows === rows.length) idMap = Array.from({ length: affectedRows }, (_,i)=> firstInsertId + i);
          }
          rows.forEach((r, idx) => {
            broadcastStudent(r.id, { type:'notification', payload: { kind:'assignment', simulacion_id:fresh.id, title: 'Nueva simulación', message: fresh.titulo, notif_id: idMap[idx] } });
          });
        }
      }
    } catch (e) { console.error('notif createSimulacion', e); }

    res.status(201).json({ data: fresh });
  } catch (e) { console.error('createSimulacion', e); res.status(500).json({ message:'Error interno' }); }
};

export const updateSimulacion = async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, preguntas, fecha_limite, time_limit_min, publico, id_area, activo, grupos } = req.body || {};
  try {
    if (req.user?.role === 'estudiante') return res.status(403).json({ message:'No autorizado' });
    // Obtener para detectar transición de publicación si se desea
    const existing = await Sims.getSimulacionById(id);
    if (!existing) return res.status(404).json({ message: 'Simulación no encontrada' });
    const prevPublico = !!existing.publico;

    const updated = await Sims.updateSimulacionMeta(id, { titulo, descripcion, id_area, fecha_limite, time_limit_min, publico, activo, grupos });
    if (Array.isArray(preguntas)) {
      await Sims.replacePreguntas(id, preguntas);
    }

    // Si pasó de no publicado a publicado y hay grupos, notificar
    try {
      const publishTransition = (publico !== undefined) && !prevPublico && !!publico;
      let gruposVal = grupos;
      try { if (!gruposVal && existing.grupos) gruposVal = typeof existing.grupos === 'string' ? JSON.parse(existing.grupos) : existing.grupos; } catch { gruposVal = null; }
      if (publishTransition && Array.isArray(gruposVal) && gruposVal.length) {
        const placeholders = gruposVal.map(()=>'?').join(',');
        const [rows] = await db.query(`SELECT id FROM estudiantes WHERE grupo IN (${placeholders})`, gruposVal);
        if (rows.length) {
          const list = rows.map(r => ({
            student_id: r.id,
            type: 'assignment',
            title: 'Nueva simulación asignada',
            message: (titulo || existing.titulo) ? `Se te asignó: ${titulo || existing.titulo}` : 'Tienes una nueva simulación',
            action_url: `/alumno/simulaciones`,
            metadata: { simulacion_id: Number(id), kind: 'simulacion' }
          }));
          const bulkRes = await StudentNotifs.bulkCreateNotifications(list).catch(()=>null);
          let idMap = [];
          if (bulkRes && bulkRes.affectedRows) {
            const { firstInsertId, affectedRows } = bulkRes;
            if (firstInsertId && affectedRows === rows.length) idMap = Array.from({ length: affectedRows }, (_,i)=> firstInsertId + i);
          }
          rows.forEach((r, idx) => {
            broadcastStudent(r.id, { type:'notification', payload: { kind:'assignment', simulacion_id:Number(id), title: 'Nueva simulación', message: titulo || existing.titulo, notif_id: idMap[idx] } });
          });
        }
      }
    } catch (e) { console.error('notif updateSimulacion', e); }

    const fresh = await Sims.getSimulacionById(id);
    res.json({ data: fresh });
  } catch (e) { console.error('updateSimulacion', e); res.status(500).json({ message:'Error interno' }); }
};

export const deleteSimulacion = async (req, res) => {
  const { id } = req.params;
  try {
    if (req.user?.role === 'estudiante') return res.status(403).json({ message:'No autorizado' });
    const ok = await Sims.deleteSimulacion(id);
    if (!ok) return res.status(404).json({ message: 'Simulación no encontrada' });
    res.json({ ok: true });
  } catch (e) { console.error('deleteSimulacion', e); res.status(500).json({ message:'Error interno' }); }
};

export const getSimulacionFull = async (req, res) => {
  try {
    const sim = await Sims.getSimulacionFull(req.params.id);
    if (!sim) return res.status(404).json({ message: 'No encontrado' });
    res.json({ data: sim });
  } catch (e) { console.error('getSimulacionFull', e); res.status(500).json({ message:'Error interno' }); }
};

export const getSimulacion = async (req, res) => {
  try {
    const sim = await Sims.getSimulacionById(req.params.id);
    if (!sim) return res.status(404).json({ message: 'No encontrado' });
    res.json({ data: sim });
  } catch (e) { console.error('getSimulacion', e); res.status(500).json({ message:'Error interno' }); }
};
