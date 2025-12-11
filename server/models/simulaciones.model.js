import db from '../db.js';

export const listSimulaciones = async ({ id_area, visible = true, soloPublicas = false } = {}) => {
  const clauses = ['s.activo = 1'];
  const params = [];
  
  // ✅ IMPORTANTE: Si id_area es null/undefined, NO filtrar por área (incluir todas las áreas)
  // Si id_area es 0, filtrar solo las que tienen id_area = NULL o 0 (generales)
  // Si id_area tiene valor, filtrar por esa área específica
  if (id_area != null) {
    if (id_area === 0) {
      // Filtrar solo generales (sin área)
      clauses.push('(s.id_area IS NULL OR s.id_area = 0)');
    } else {
      clauses.push('s.id_area = ?');
      params.push(id_area);
    }
  }
  
  if (visible) {
    clauses.push('(s.fecha_limite IS NULL OR s.fecha_limite >= NOW())');
  }
  // ✅ FILTRAR: Solo mostrar simulaciones publicadas si se solicita (para estudiantes)
  if (soloPublicas) {
    clauses.push('s.publico = 1');
  }
  const where = clauses.length ? 'WHERE ' + clauses.join(' AND ') : '';
  const sql = `SELECT s.*,
    (SELECT COUNT(*) FROM simulaciones_preguntas sp WHERE sp.id_simulacion = s.id) AS total_preguntas,
    (SELECT COUNT(*) FROM simulaciones_intentos si WHERE si.id_simulacion = s.id) AS total_intentos_global
  FROM simulaciones s ${where} ORDER BY s.fecha_limite ASC, s.id DESC`;
  
  // ✅ DEBUG: Log temporal para depurar
  if (process.env.NODE_ENV !== 'production') {
    console.log('[listSimulaciones MODEL] DEBUG:', {
      id_area,
      visible,
      soloPublicas,
      sql,
      params
    });
  }
  
  const [rows] = await db.query(sql, params);
  
  // ✅ DEBUG: Log temporal para depurar
  if (process.env.NODE_ENV !== 'production') {
    console.log('[listSimulaciones MODEL] Resultados:', {
      totalRows: rows.length,
      sampleRows: rows.slice(0, 3).map(r => ({
        id: r.id,
        titulo: r.titulo,
        publico: r.publico,
        activo: r.activo,
        id_area: r.id_area
      }))
    });
  }
  
  return rows;
};

export const getSimulacionById = async (id) => {
  const [rows] = await db.query('SELECT * FROM simulaciones WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
};

export const getSimulacionFull = async (id) => {
  const sim = await getSimulacionById(id);
  if (!sim) return null;
  const [pregs] = await db.query('SELECT * FROM simulaciones_preguntas WHERE id_simulacion = ? ORDER BY orden ASC, id ASC', [id]);
  if (!pregs.length) return { ...sim, preguntas: [] };
  const ids = pregs.map(p => p.id);
  const [opcs] = await db.query('SELECT * FROM simulaciones_preguntas_opciones WHERE id_pregunta IN (?) ORDER BY id ASC', [ids]);
  const byPreg = new Map();
  for (const o of opcs) { const arr = byPreg.get(o.id_pregunta) || []; arr.push(o); byPreg.set(o.id_pregunta, arr); }
  const preguntas = pregs.map(p => ({ ...p, opciones: byPreg.get(p.id) || [] }));
  return { ...sim, preguntas };
};

export const listResumenEstudiante = async (id_estudiante) => {
  // ✅ FILTRAR: Solo mostrar simulaciones publicadas para estudiantes (excluir borradores)
  const [rows] = await db.query(`
    SELECT s.*,
      (SELECT si.puntaje FROM simulaciones_intentos si WHERE si.id_simulacion = s.id AND si.id_estudiante = ? ORDER BY si.id DESC LIMIT 1) AS ultimo_puntaje,
      (SELECT MAX(si.puntaje) FROM simulaciones_intentos si WHERE si.id_simulacion = s.id AND si.id_estudiante = ?) AS mejor_puntaje,
      (SELECT COUNT(*) FROM simulaciones_intentos si WHERE si.id_simulacion = s.id AND si.id_estudiante = ?) AS total_intentos
    FROM simulaciones s
    WHERE s.activo = 1 AND s.publico = 1
    ORDER BY s.fecha_limite ASC, s.id DESC
  `, [id_estudiante, id_estudiante, id_estudiante]);
  return rows;
};

export const listIntentosEstudiante = async (id_simulacion, id_estudiante) => {
  const [rows] = await db.query('SELECT * FROM simulaciones_intentos WHERE id_simulacion = ? AND id_estudiante = ? ORDER BY id DESC', [id_simulacion, id_estudiante]);
  return rows;
};

export const createSimulacion = async ({ titulo, descripcion, id_area = null, fecha_limite = null, time_limit_min = null, publico = 0, activo = 1, creado_por = null, grupos = null }) => {
  // Guardar grupos como JSON string si es objeto/array
  let gruposVal = grupos;
  try { if (gruposVal && typeof gruposVal !== 'string') gruposVal = JSON.stringify(gruposVal); } catch { gruposVal = null; }
  const [res] = await db.query(
    'INSERT INTO simulaciones (titulo, descripcion, id_area, fecha_limite, time_limit_min, publico, activo, creado_por, grupos) VALUES (?,?,?,?,?,?,?,?,?)',
    [titulo, descripcion || null, id_area || null, fecha_limite || null, time_limit_min || null, publico ? 1 : 0, activo ? 1 : 0, creado_por || null, gruposVal || null]
  );
  return getSimulacionById(res.insertId);
};

export const updateSimulacionMeta = async (id, fields = {}) => {
  const allowed = ['titulo','descripcion','id_area','fecha_limite','time_limit_min','publico','activo','grupos'];
  const sets = []; const params = [];
  for (const k of allowed) {
    if (Object.prototype.hasOwnProperty.call(fields, k)) {
      let v = fields[k];
      if (k === 'grupos') { try { if (v && typeof v !== 'string') v = JSON.stringify(v); } catch { v = null; } }
      if (k === 'publico' || k === 'activo') v = v ? 1 : 0;
      sets.push(`${k} = ?`); params.push(v);
    }
  }
  if (!sets.length) return getSimulacionById(id);
  params.push(id);
  await db.query(`UPDATE simulaciones SET ${sets.join(', ')} WHERE id = ?`, params);
  return getSimulacionById(id);
};

export const deleteSimulacion = async (id) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Verificar existencia
    const [existsRows] = await conn.query('SELECT id FROM simulaciones WHERE id = ? LIMIT 1', [id]);
    if (!existsRows.length) {
      await conn.rollback();
      return false;
    }

    // Borrar respuestas y sesiones
    const [ses] = await conn.query('SELECT id FROM simulaciones_sesiones WHERE id_simulacion = ?', [id]);
    const sesIds = ses.map((r) => r.id);
    if (sesIds.length) {
      await conn.query('DELETE FROM simulaciones_respuestas WHERE id_sesion IN (?)', [sesIds]);
      await conn.query('DELETE FROM simulaciones_sesiones WHERE id IN (?)', [sesIds]);
    } else {
      await conn.query('DELETE FROM simulaciones_respuestas WHERE id_sesion IN (SELECT id FROM simulaciones_sesiones WHERE id_simulacion = ?)', [id]);
      await conn.query('DELETE FROM simulaciones_sesiones WHERE id_simulacion = ?', [id]);
    }

    // Borrar intentos
    await conn.query('DELETE FROM simulaciones_intentos WHERE id_simulacion = ?', [id]);

    // Borrar preguntas y opciones
    const [pregs] = await conn.query('SELECT id FROM simulaciones_preguntas WHERE id_simulacion = ?', [id]);
    const qIds = pregs.map((r) => r.id);
    if (qIds.length) {
      await conn.query('DELETE FROM simulaciones_preguntas_opciones WHERE id_pregunta IN (?)', [qIds]);
      await conn.query('DELETE FROM simulaciones_preguntas WHERE id IN (?)', [qIds]);
    } else {
      await conn.query('DELETE FROM simulaciones_preguntas_opciones WHERE id_pregunta IN (SELECT id FROM simulaciones_preguntas WHERE id_simulacion = ?)', [id]);
      await conn.query('DELETE FROM simulaciones_preguntas WHERE id_simulacion = ?', [id]);
    }

    // Finalmente borrar la simulación
    const [del] = await conn.query('DELETE FROM simulaciones WHERE id = ?', [id]);

    await conn.commit();
    return del?.affectedRows > 0;
  } catch (e) {
    try { await conn.rollback(); } catch {}
    console.error('deleteSimulacion error:', e);
    throw e;
  } finally {
    conn.release();
  }
};

export const createPregunta = async ({ id_simulacion, orden = null, enunciado, tipo = 'opcion_multiple', puntos = 1, activa = 1 }) => {
  const [res] = await db.query(
    'INSERT INTO simulaciones_preguntas (id_simulacion, orden, enunciado, tipo, puntos, activa) VALUES (?,?,?,?,?,?)',
    [id_simulacion, orden, enunciado, tipo, puntos, activa ? 1 : 0]
  );
  const [rows] = await db.query('SELECT * FROM simulaciones_preguntas WHERE id = ?', [res.insertId]);
  return rows[0];
};

export const createOpcion = async ({ id_pregunta, texto, es_correcta = 0, orden = null }) => {
  const [res] = await db.query(
    'INSERT INTO simulaciones_preguntas_opciones (id_pregunta, texto, es_correcta, orden) VALUES (?,?,?,?)',
    [id_pregunta, texto, es_correcta ? 1 : 0, orden]
  );
  const [rows] = await db.query('SELECT * FROM simulaciones_preguntas_opciones WHERE id = ?', [res.insertId]);
  return rows[0];
};

export const replacePreguntas = async (id_simulacion, preguntas = []) => {
  // Borrar existentes
  const [pregs] = await db.query('SELECT id FROM simulaciones_preguntas WHERE id_simulacion = ?', [id_simulacion]);
  const qIds = pregs.map(r => r.id);
  if (qIds.length) {
    await db.query('DELETE FROM simulaciones_preguntas_opciones WHERE id_pregunta IN (?)', [qIds]);
    await db.query('DELETE FROM simulaciones_preguntas WHERE id IN (?)', [qIds]);
  } else {
    await db.query('DELETE FROM simulaciones_preguntas WHERE id_simulacion = ?', [id_simulacion]);
  }
  if (!Array.isArray(preguntas) || !preguntas.length) return;
  let orden = 1;
  for (const q of preguntas) {
    const row = await createPregunta({
      id_simulacion,
      orden: q.orden ?? orden,
      enunciado: q.text || q.enunciado || '',
      tipo: q.tipo || (q.type === 'tf' ? 'verdadero_falso' : (q.type === 'short' ? 'respuesta_corta' : (q.type === 'multi' ? 'multi_respuesta' : 'opcion_multiple'))),
      puntos: q.puntos || q.points || 1,
      activa: q.activa != null ? q.activa : 1
    });
    if (Array.isArray(q.opciones) && q.opciones.length) {
      let o = 1;
      for (const opt of q.opciones) {
        await createOpcion({ id_pregunta: row.id, texto: opt.texto || opt.text || '', es_correcta: !!(opt.es_correcta || opt.correct), orden: opt.orden ?? o++ });
      }
    } else if (q.type === 'tf') {
      await createOpcion({ id_pregunta: row.id, texto: 'Verdadero', es_correcta: q.answer === 'true', orden: 1 });
      await createOpcion({ id_pregunta: row.id, texto: 'Falso', es_correcta: q.answer === 'false', orden: 2 });
    } else if (q.type === 'short' && q.answer) {
      await createOpcion({ id_pregunta: row.id, texto: q.answer, es_correcta: 1, orden: 1 });
    }
    orden++;
  }
};

export const createSesion = async ({ id_simulacion, id_estudiante }) => {
  const [res] = await db.query('INSERT INTO simulaciones_sesiones (id_simulacion, id_estudiante) VALUES (?,?)', [id_simulacion, id_estudiante]);
  const [rows] = await db.query('SELECT * FROM simulaciones_sesiones WHERE id = ?', [res.insertId]);
  return rows[0];
};

export const saveRespuestasBatch = async (id_sesion, respuestas = []) => {
  if (!Array.isArray(respuestas) || !respuestas.length) return { affectedRows: 0 };
  const values = respuestas.map(r => [id_sesion, r.id_pregunta, r.id_opcion || null, r.texto_libre || null, r.tiempo_ms || 0]);
  const sql = 'INSERT INTO simulaciones_respuestas (id_sesion, id_pregunta, id_opcion, texto_libre, tiempo_ms) VALUES ?';
  const [res] = await db.query(sql, [values]);
  return res;
};

export const finalizarSesion = async ({ id_sesion, meta = {} }) => {
  const [[ses]] = await db.query('SELECT * FROM simulaciones_sesiones WHERE id = ? LIMIT 1', [id_sesion]);
  if (!ses) throw new Error('Sesión no encontrada');
  // Cargar banco de preguntas y opciones
  const [pregs] = await db.query('SELECT * FROM simulaciones_preguntas WHERE id_simulacion = ? ORDER BY orden ASC, id ASC', [ses.id_simulacion]);
  const preguntaIds = pregs.map(p => p.id);
  const [opcs] = preguntaIds.length ? await db.query('SELECT * FROM simulaciones_preguntas_opciones WHERE id_pregunta IN (?)', [preguntaIds]) : [[]];
  const opcionesByPregunta = new Map();
  for (const o of opcs) {
    const list = opcionesByPregunta.get(o.id_pregunta) || []; list.push(o); opcionesByPregunta.set(o.id_pregunta, list);
  }
  const [resp] = await db.query('SELECT * FROM simulaciones_respuestas WHERE id_sesion = ?', [id_sesion]);
  const respByPregunta = new Map();
  for (const r of resp) { respByPregunta.set(r.id_pregunta, r); }
  let correctas = 0; const total = pregs.length;
  for (const p of pregs) {
    const r = respByPregunta.get(p.id);
    const opciones = opcionesByPregunta.get(p.id) || [];
    if (p.tipo === 'respuesta_corta') continue; // no se califica automáticamente
    if (p.tipo === 'multi_respuesta') {
      // Simplificado: no implementado aún, cuenta como incorrecto
    } else {
      const correct = opciones.find(o => o.es_correcta == 1);
      if (r && correct && r.id_opcion === correct.id) correctas += 1;
    }
  }
  const puntaje = total > 0 ? Math.round((correctas / total) * 100) : 0;
  // Calcular elapsed_ms robusto: preferir meta.elapsed_ms o meta.duration_ms; luego diferencia de timestamps; o suma de tiempos por pregunta.
  let elapsed_ms = null;
  try {
    const fromBody = Number(meta.elapsed_ms);
    const fromBody2 = Number(meta.duration_ms);
    if (Number.isFinite(fromBody) && fromBody > 0) elapsed_ms = Math.round(fromBody);
    else if (Number.isFinite(fromBody2) && fromBody2 > 0) elapsed_ms = Math.round(fromBody2);
    if (elapsed_ms == null) {
      const startedAt = meta.started_at ? new Date(meta.started_at) : (ses.started_at ? new Date(ses.started_at) : null);
      const finishedAt = meta.finished_at ? new Date(meta.finished_at) : new Date();
      if (startedAt && finishedAt) {
        const diff = finishedAt - startedAt;
        if (Number.isFinite(diff) && diff > 0) elapsed_ms = diff;
      }
    }
    if (elapsed_ms == null) {
      // como última opción, sumar tiempos capturados por pregunta
      const [respForTime] = await db.query('SELECT COALESCE(SUM(tiempo_ms),0) AS sum_ms FROM simulaciones_respuestas WHERE id_sesion = ?', [id_sesion]);
      const sum_ms = Number(respForTime?.[0]?.sum_ms || 0);
      if (sum_ms > 0) elapsed_ms = sum_ms;
    }
  } catch {}
  const tiempo_segundos = Number.isFinite(Number(meta.tiempo_segundos)) && Number(meta.tiempo_segundos) > 0
    ? Math.round(Number(meta.tiempo_segundos))
    : (elapsed_ms != null ? Math.max(1, Math.round(elapsed_ms / 1000)) : (ses.elapsed_ms ? Math.round(ses.elapsed_ms / 1000) : null));
  // Persistir finished_at y elapsed_ms si podemos
  if (elapsed_ms != null) {
    await db.query('UPDATE simulaciones_sesiones SET finished_at = NOW(), elapsed_ms = ? WHERE id = ?', [elapsed_ms, id_sesion]);
  } else {
    await db.query('UPDATE simulaciones_sesiones SET finished_at = NOW() WHERE id = ?', [id_sesion]);
  }
  const intentos = await contarIntentosEstudiante(ses.id_simulacion, ses.id_estudiante);
  const intent_number = intentos + 1;
  const [ins] = await db.query('INSERT INTO simulaciones_intentos (id_simulacion, id_estudiante, puntaje, intent_number, tiempo_segundos, total_preguntas, correctas) VALUES (?,?,?,?,?,?,?)', [ses.id_simulacion, ses.id_estudiante, puntaje, intent_number, tiempo_segundos, total, correctas]);
  const [row] = await db.query('SELECT * FROM simulaciones_intentos WHERE id = ?', [ins.insertId]);
  
  // ✅ Notificar al asesor cuando se completa el primer intento (oficial)
  if (intent_number === 1) {
    try {
      const AsesorNotifs = await import('../models/asesor_notifications.model.js');
      const [simData] = await db.query('SELECT titulo, nombre FROM simulaciones WHERE id = ? LIMIT 1', [ses.id_simulacion]);
      const [estData] = await db.query('SELECT nombre, apellidos FROM estudiantes WHERE id = ? LIMIT 1', [ses.id_estudiante]);
      const asesorUserId = await AsesorNotifs.getAsesorUserIdByEstudianteId(ses.id_estudiante);
      
      if (asesorUserId) {
        const simTitulo = simData[0]?.titulo || simData[0]?.nombre || 'Simulación';
        const estNombre = estData[0] ? `${estData[0].nombre || ''} ${estData[0].apellidos || ''}`.trim() : 'Un estudiante';
        await AsesorNotifs.createNotification({
          asesor_user_id: asesorUserId,
          type: 'simulation_completed',
          title: 'Simulación completada',
          message: `${estNombre} completó la simulación "${simTitulo}" con ${puntaje}%`,
          action_url: `/asesor/simuladores?simId=${ses.id_simulacion}`,
          metadata: { simulacion_id: ses.id_simulacion, estudiante_id: ses.id_estudiante, intent_number: 1, puntaje }
        });
        console.log(`[finalizarSesion] Notificación enviada al asesor ${asesorUserId} por simulación completada por estudiante ${ses.id_estudiante}`);
      }
    } catch (e) {
      console.error('[finalizarSesion] Error al notificar al asesor:', e);
      // No fallar la operación si la notificación falla
    }
  }
  
  return { intento: row, puntaje, total_preguntas: total, correctas };
};

export const contarIntentosEstudiante = async (id_simulacion, id_estudiante) => {
  const [rows] = await db.query('SELECT COUNT(*) AS total FROM simulaciones_intentos WHERE id_simulacion = ? AND id_estudiante = ?', [id_simulacion, id_estudiante]);
  return rows[0]?.total || 0;
};

export const listPreguntas = async (id_simulacion, { includeInactive = false } = {}) => {
  const whereActivo = includeInactive ? '' : ' AND activa = 1';
  const [pregs] = await db.query(
    `SELECT * FROM simulaciones_preguntas WHERE id_simulacion = ?${whereActivo} ORDER BY orden ASC, id ASC`,
    [id_simulacion]
  );
  if (!pregs.length) return [];
  const ids = pregs.map(p => p.id);
  const [opcs] = await db.query('SELECT * FROM simulaciones_preguntas_opciones WHERE id_pregunta IN (?) ORDER BY id ASC', [ids]);
  const byPreg = new Map();
  for (const o of opcs) { const arr = byPreg.get(o.id_pregunta) || []; arr.push(o); byPreg.set(o.id_pregunta, arr); }
  return pregs.map(p => ({ ...p, opciones: byPreg.get(p.id) || [] }));
};

// Analítica detallada por estudiante: preguntas + intentos + respuestas por intento
export const getAnaliticaPorEstudiante = async (id_simulacion, id_estudiante) => {
  // Preguntas y opciones
  const preguntas = await listPreguntas(id_simulacion, { includeInactive: true });
  // Intentos registrados (resultado final por intento)
  const [intentos] = await db.query(
    'SELECT * FROM simulaciones_intentos WHERE id_simulacion = ? AND id_estudiante = ? ORDER BY created_at ASC, id ASC',
    [id_simulacion, id_estudiante]
  );
  // Sesiones finalizadas (para emparejar con intentos)
  const [sesiones] = await db.query(
    'SELECT * FROM simulaciones_sesiones WHERE id_simulacion = ? AND id_estudiante = ? AND finished_at IS NOT NULL ORDER BY finished_at ASC, id ASC',
    [id_simulacion, id_estudiante]
  );
  const sesIds = sesiones.map(s => s.id);
  let respBySesion = new Map();
  if (sesIds.length) {
    const [resps] = await db.query(
      'SELECT * FROM simulaciones_respuestas WHERE id_sesion IN (?) ORDER BY id ASC',
      [sesIds]
    );
    for (const r of resps) {
      const arr = respBySesion.get(r.id_sesion) || []; arr.push(r); respBySesion.set(r.id_sesion, arr);
    }
  }
  // Emparejar por índice (asumiendo que cada finalize crea un intento)
  const n = Math.min(intentos.length, sesiones.length);
  const emparejados = [];
  for (let i = 0; i < n; i++) {
    const intento = intentos[i];
    const sesion = sesiones[i];
    const respuestas = respBySesion.get(sesion.id) || [];
    emparejados.push({
      intento,
      sesion: { id: sesion.id, started_at: sesion.started_at, finished_at: sesion.finished_at, elapsed_ms: sesion.elapsed_ms },
      respuestas
    });
  }
  const mismatch = intentos.length !== sesiones.length;
  return { preguntas, intentos: emparejados, mismatch, total_intentos: intentos.length, total_sesiones: sesiones.length };
};

// Lista, para una simulación, los estudiantes que ya hicieron al menos 1 intento,
// con su puntaje oficial (primer intento) y el total de intentos.
export const listEstudiantesEstadoSimulacion = async (id_simulacion) => {
  const sql = `
    SELECT 
      si.id_estudiante,
      e.nombre,
      e.apellidos,
      e.grupo,
      e.folio,
      COUNT(*) AS total_intentos,
      -- Primer intento (puntaje oficial)
      (SELECT si2.puntaje FROM simulaciones_intentos si2 
         WHERE si2.id_simulacion = si.id_simulacion AND si2.id_estudiante = si.id_estudiante 
         ORDER BY si2.id ASC LIMIT 1) AS oficial_puntaje
    FROM simulaciones_intentos si
    LEFT JOIN estudiantes e ON e.id = si.id_estudiante
    WHERE si.id_simulacion = ?
    GROUP BY si.id_estudiante
    ORDER BY e.apellidos ASC, e.nombre ASC, si.id_estudiante ASC
  `;
  const [rows] = await db.query(sql, [id_simulacion]);
  return rows.map(r => ({
    id_estudiante: r.id_estudiante,
    nombre: r.nombre,
    apellidos: r.apellidos,
    grupo: r.grupo,
    folio: r.folio,
    total_intentos: Number(r.total_intentos || 0),
    oficial_puntaje: r.oficial_puntaje != null ? Number(r.oficial_puntaje) : null,
  }));
};
