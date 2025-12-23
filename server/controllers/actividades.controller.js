import * as Actividades from '../models/actividades.model.js';
import * as Entregas from '../models/actividades_entregas.model.js';
import * as EntregaArchivos from '../models/actividades_entregas_archivos.model.js';
import * as Estudiantes from '../models/estudiantes.model.js';
import * as StudentNotifs from '../models/student_notifications.model.js';
import { broadcastStudent } from '../ws.js';
import * as Areas from '../models/areas.model.js';
import { upload } from '../middlewares/multer.js';
import * as Access from '../models/student_area_access.model.js';
import * as FechaExtensiones from '../models/actividades_fecha_extensiones.model.js';

// Ahora soporta hasta 5 PDFs por envío inicial o append
export const actividadUploadMiddleware = upload.array('archivos', 5);
export const actividadAssetsUpload = upload.fields([
  { name: 'recursos', maxCount: 10 },
  { name: 'imagen', maxCount: 1 }
]);

export const createActividad = async (req, res) => {
  try {
    const { titulo } = req.body;
    if (!titulo) return res.status(400).json({ message: 'titulo requerido' });
    if (req.body.id_area !== undefined && req.body.id_area !== null) {
      const areaId = Number(req.body.id_area);
      if (areaId === 5) return res.status(400).json({ message: 'id_area 5 es contenedor y no asignable' });
      const area = await Areas.getAreaById(areaId);
      if (!area) return res.status(400).json({ message: 'id_area no válido' });
    }
    if (req.body.grupos) {
      try { if (typeof req.body.grupos === 'string') req.body.grupos = JSON.parse(req.body.grupos); } catch { req.body.grupos = null; }
      if (req.body.grupos && !Array.isArray(req.body.grupos)) req.body.grupos = null;
    }
    if (req.files) {
      const recursos = (req.files.recursos || []).map(f => ({ archivo: `/public/${f.filename}`, nombre: f.originalname, mime: f.mimetype, tamano: f.size }));
      if (recursos.length) req.body.recursos_json = recursos;
      const imagen = (req.files.imagen || [])[0];
      if (imagen) req.body.imagen_portada = `/public/${imagen.filename}`;
    }
    const id = await Actividades.createActividad(req.body);
    const act = await Actividades.getActividad(id);
    // Crear notificaciones para grupos si se enviaron
    try {
      if (Array.isArray(req.body.grupos) && req.body.grupos.length) {
        const db = await import('../db.js');
        // ✅ IMPORTANTE: Solo asignar a estudiantes activos
        // Normalizar grupos para comparación (el grupo en BD puede estar en mayúsculas)
        const gruposNormalizados = req.body.grupos.map(g => String(g).trim());
        // Crear placeholders para el query IN con normalización
        const placeholders = gruposNormalizados.map(() => 'UPPER(TRIM(?))').join(',');

        // ✅ IMPORTANTE: Excluir estudiantes con soft delete (borrado suave)
        const [rows] = await db.default.query(`
          SELECT e.id, e.nombre, e.apellidos, e.grupo, e.estatus 
          FROM estudiantes e
          LEFT JOIN soft_deletes sd ON sd.id_estudiante = e.id
          WHERE UPPER(TRIM(e.grupo)) IN (${placeholders}) 
            AND e.estatus = 'Activo'
            AND sd.id IS NULL
        `, gruposNormalizados);

        console.log(`\n🔔 [createActividad] Actividad ${id} "${act.titulo || '(sin título)'}": Buscando estudiantes activos para grupos ${JSON.stringify(req.body.grupos)}`);

        // Verificar estudiantes totales e inactivos para diagnóstico (incluyendo soft deletes)
        const [todosEstudiantes] = await db.default.query(`
          SELECT e.id, e.nombre, e.apellidos, e.grupo, e.estatus, 
                 CASE WHEN sd.id IS NOT NULL THEN 1 ELSE 0 END AS tiene_soft_delete
          FROM estudiantes e
          LEFT JOIN soft_deletes sd ON sd.id_estudiante = e.id
          WHERE UPPER(TRIM(e.grupo)) IN (${placeholders})
        `, gruposNormalizados);

        const totalEstudiantes = todosEstudiantes.length;
        const estudiantesActivos = rows.length;
        const estudiantesInactivos = todosEstudiantes.filter(e => e.estatus !== 'Activo');
        const estudiantesConSoftDelete = todosEstudiantes.filter(e => e.tiene_soft_delete === 1);

        console.log(`📊 [createActividad] Resumen del grupo ${JSON.stringify(req.body.grupos)}:`);
        console.log(`   - Total estudiantes en grupo: ${totalEstudiantes}`);
        console.log(`   - ✅ Estudiantes ACTIVOS (sin soft delete): ${estudiantesActivos}`);
        console.log(`   - ❌ Estudiantes INACTIVOS: ${estudiantesInactivos.length}`);
        console.log(`   - 🗑️  Estudiantes con SOFT DELETE: ${estudiantesConSoftDelete.length}`);

        if (rows.length > 0) {
          console.log(`\n✅ [createActividad] Estudiantes ACTIVOS que recibirán la asignación:`);
          rows.forEach(r => {
            console.log(`   - ID ${r.id}: ${r.nombre} ${r.apellidos} (${r.grupo}) - ${r.estatus}`);
          });
        }

        if (estudiantesInactivos.length > 0) {
          console.log(`\n⚠️  [createActividad] Estudiantes INACTIVOS que NO recibirán la asignación:`);
          estudiantesInactivos.forEach(e => {
            console.log(`   - ID ${e.id}: ${e.nombre} ${e.apellidos} (${e.grupo}) - ${e.estatus || '(null)'}`);
          });
        }

        if (estudiantesConSoftDelete.length > 0) {
          console.log(`\n🗑️  [createActividad] Estudiantes con SOFT DELETE que NO recibirán la asignación:`);
          estudiantesConSoftDelete.forEach(e => {
            console.log(`   - ID ${e.id}: ${e.nombre} ${e.apellidos} (${e.grupo}) - Estatus: ${e.estatus || '(null)'}`);
          });
        }

        if (rows.length) {
          const list = rows.map(r => ({
            student_id: r.id,
            type: 'assignment',
            title: 'Nueva actividad asignada',
            message: act.titulo ? `Se te asignó: ${act.titulo}` : 'Tienes una nueva actividad',
            action_url: '/alumno/actividades',
            metadata: { actividad_id: id }
          }));
          const bulkRes = await StudentNotifs.bulkCreateNotifications(list).catch(() => null);
          let idMap = [];
          if (bulkRes && bulkRes.affectedRows) {
            const { firstInsertId, affectedRows } = bulkRes;
            if (firstInsertId && affectedRows === rows.length) {
              idMap = Array.from({ length: affectedRows }, (_, i) => firstInsertId + i);
            }
          }
          // Emitir en tiempo real con notif_id si disponible
          rows.forEach((r, idx) => {
            broadcastStudent(r.id, { type: 'notification', payload: { kind: 'assignment', actividad_id: id, title: 'Nueva actividad', message: act.titulo, notif_id: idMap[idx] } });
          });
          console.log(`\n✅ [createActividad] ${rows.length} notificaciones creadas exitosamente para actividad ${id}\n`);
        } else {
          console.warn(`\n⚠️  [createActividad] No se encontraron estudiantes activos para grupos ${JSON.stringify(req.body.grupos)} - No se crearán notificaciones\n`);
        }
      }
    } catch (e) { console.error('notif createActividad', e); }
    res.status(201).json({ data: act });
  } catch (e) { console.error('createActividad', e); res.status(500).json({ message: 'Error interno' }); }
};

export const updateActividad = async (req, res) => {
  try {
    const { id } = req.params; const existing = await Actividades.getActividad(id);
    if (!existing) return res.status(404).json({ message: 'No encontrada' });
    if (req.body.id_area !== undefined) {
      const areaId = req.body.id_area === null ? null : Number(req.body.id_area);
      if (areaId === 5) return res.status(400).json({ message: 'id_area 5 es contenedor y no asignable' });
      if (areaId !== null) {
        const area = await Areas.getAreaById(areaId);
        if (!area) return res.status(400).json({ message: 'id_area no válido' });
      }
    }
    if (req.body.grupos) {
      try { if (typeof req.body.grupos === 'string') req.body.grupos = JSON.parse(req.body.grupos); } catch { req.body.grupos = null; }
      if (req.body.grupos && !Array.isArray(req.body.grupos)) req.body.grupos = null;
    }
    if (req.files && (req.files.recursos?.length || req.files.imagen?.length)) {
      const recursos = (req.files.recursos || []).map(f => ({ archivo: `/public/${f.filename}`, nombre: f.originalname, mime: f.mimetype, tamano: f.size }));
      if (recursos.length) req.body.recursos_json = recursos;
      const imagen = (req.files.imagen || [])[0];
      if (imagen) req.body.imagen_portada = `/public/${imagen.filename}`;
    }
    const upd = await Actividades.updateActividad(id, req.body);
    if (!upd.affectedRows) return res.status(400).json({ message: 'Sin cambios' });
    const refreshed = await Actividades.getActividad(id);
    res.json({ data: refreshed });
  } catch (e) { console.error('updateActividad', e); res.status(500).json({ message: 'Error interno' }); }
};

export const listActividades = async (req, res) => {
  try {
    // ✅ IMPORTANTE: Para estudiantes, solo mostrar actividades activas
    const user = req.user || null;
    const filters = { ...req.query };
    if (user && user.role === 'estudiante') {
      filters.activo = true; // Solo mostrar actividades activas a estudiantes
    }
    let acts = await Actividades.listActividades(filters, req.query);
    // Si es estudiante, filtrar por áreas permitidas (si actividad tiene id_area)
    if (user && user.role === 'estudiante' && user.id_estudiante) {
      try {
        const allowed = await Access.getAllowedAreaIds(user.id_estudiante);
        if (Array.isArray(allowed) && allowed.length) {
          acts = acts.filter(a => !a.id_area || allowed.includes(Number(a.id_area)));
        } else {
          acts = acts.filter(a => !a.id_area);
        }
        // ✅ Asegurar también que todas las actividades estén activas (doble validación)
        acts = acts.filter(a => a.activo === 1 || a.activo === true);
      } catch (_e) { }
    }
    res.json({ data: acts });
  }
  catch (e) { console.error('listActividades', e); res.status(500).json({ message: 'Error interno' }); }
};

export const getActividad = async (req, res) => {
  try {
    const act = await Actividades.getActividad(req.params.id);
    if (!act) return res.status(404).json({ message: 'No encontrada' });
    // Si es estudiante y la actividad está asociada a un área, validar permiso
    const user = req.user || null;
    if (user && user.role === 'estudiante' && user.id_estudiante && act.id_area) {
      try {
        const allowed = await Access.hasPermission(user.id_estudiante, Number(act.id_area));
        if (!allowed) return res.status(403).json({ message: 'Sin permiso para este módulo/área' });
      } catch (_e) { return res.status(403).json({ message: 'Sin permiso para este módulo/área' }); }
    }
    res.json({ data: act });
  }
  catch (e) { console.error('getActividad', e); res.status(500).json({ message: 'Error interno' }); }
};

// Comportamiento estilo Classroom:
//  - Primera subida crea la entrega base (registro en actividades_entregas) y se guarda archivo principal también en tabla archivos
//  - Subidas posteriores (antes de revisión y dentro de fecha límite) SOLAMENTE agregan más archivos a la misma entrega activa.
//  - Si se quiere estrictamente un único archivo, se podría pasar query ?modo=single (no implementado aún).
export const crearOReemplazarEntrega = async (req, res) => {
  try {
    const { id } = req.params;
    let { id_estudiante } = req.body;

    // ✅ Si es estudiante, forzar su propio ID para evitar errores de frontend o suplantación
    if (req.user && req.user.role === 'estudiante' && req.user.id_estudiante) {
      id_estudiante = req.user.id_estudiante;
    }

    if (!id_estudiante) {
      console.warn('crearOReemplazarEntrega: id_estudiante ausente. body=', req.body, 'files len=', (req.files || []).length);
      return res.status(400).json({ message: 'id_estudiante requerido' });
    }
    const act = await Actividades.getActividad(id);
    if (!act || !act.activo) return res.status(404).json({ message: 'Actividad no encontrada' });
    if (act.tipo !== 'actividad') return res.status(400).json({ message: 'Tipo no soportado' });

    // Obtener información del estudiante primero para verificar grupo y fecha límite efectiva
    const est = await Estudiantes.getEstudianteById(id_estudiante); 
    if (!est) return res.status(404).json({ message: 'Estudiante no encontrado' });

    // ✅ Validar fecha límite efectiva (considera extensiones por grupo o estudiante)
    if (act.fecha_limite) {
      const fechaLimiteEfectiva = await FechaExtensiones.getFechaLimiteEfectiva(id, id_estudiante, est.grupo);
      if (fechaLimiteEfectiva) {
        // Establecer hora al final del día (23:59:59.999)
        fechaLimiteEfectiva.setHours(23, 59, 59, 999);
        const ahora = new Date();
        if (ahora > fechaLimiteEfectiva) {
          return res.status(400).json({ message: 'Fecha límite vencida' });
        }
      }
    }

    // Verificar permiso de área si aplica
    // Permitir si: 1) tiene permiso de área, 2) actividad sin área, 3) actividad asignada a su grupo
    if (act.id_area) {
      try {
        console.log(`[crearOReemplazarEntrega] Verificando permiso: id_estudiante=${id_estudiante}, id_area=${act.id_area}`);
        const hasAreaPermission = await Access.hasPermission(id_estudiante, Number(act.id_area));
        console.log(`[crearOReemplazarEntrega] Resultado permiso área: ${hasAreaPermission}`);
        
        // Si no tiene permiso de área, verificar si la actividad está asignada a su grupo
        if (!hasAreaPermission) {
          const studentGroup = est.grupo ? String(est.grupo).trim().toUpperCase() : null;
          const activityGroups = Array.isArray(act.grupos) ? act.grupos : 
                                (act.grupos ? (typeof act.grupos === 'string' ? JSON.parse(act.grupos) : [act.grupos]) : []);
          const normalizedActivityGroups = activityGroups.map(g => String(g).trim().toUpperCase());
          const isAssignedToGroup = studentGroup && normalizedActivityGroups.length > 0 && 
                                   normalizedActivityGroups.includes(studentGroup);
          
          console.log(`[crearOReemplazarEntrega] Grupo estudiante: ${studentGroup}, Grupos actividad: ${JSON.stringify(normalizedActivityGroups)}, Asignado: ${isAssignedToGroup}`);
          
          if (!isAssignedToGroup) {
            return res.status(403).json({ message: 'Sin permiso para este módulo/área' });
          }
        }
      } catch (e) {
        console.error('[crearOReemplazarEntrega] Error verificando permiso:', e);
        // En caso de error, verificar si está asignado a grupo como fallback
        try {
          const studentGroup = est.grupo ? String(est.grupo).trim().toUpperCase() : null;
          const activityGroups = Array.isArray(act.grupos) ? act.grupos : 
                                (act.grupos ? (typeof act.grupos === 'string' ? JSON.parse(act.grupos) : [act.grupos]) : []);
          const normalizedActivityGroups = activityGroups.map(g => String(g).trim().toUpperCase());
          const isAssignedToGroup = studentGroup && normalizedActivityGroups.length > 0 && 
                                   normalizedActivityGroups.includes(studentGroup);
          if (!isAssignedToGroup) {
            return res.status(403).json({ message: 'Sin permiso para este módulo/área' });
          }
        } catch (e2) {
          return res.status(403).json({ message: 'Sin permiso para este módulo/área' });
        }
      }
    }
    const files = req.files || [];
    if (!files.length) {
      console.warn('crearOReemplazarEntrega: sin archivos recibidos. fieldName esperado=archivos. body keys=', Object.keys(req.body || {}));
      return res.status(400).json({ message: 'Al menos 1 PDF requerido' });
    }
    if (files.length > 5) return res.status(400).json({ message: 'Máximo 5 PDFs por envío' });
    let total = 0;
    for (const f of files) {
      if (f.mimetype !== 'application/pdf') return res.status(400).json({ message: 'Solo PDF permitido' });
      total += f.size;
      if (f.size > 5 * 1024 * 1024) return res.status(400).json({ message: `Archivo ${f.originalname} excede 5MB individuales` });
    }
    if (total > 20 * 1024 * 1024) return res.status(400).json({ message: 'Tamaño combinado excede 20MB' });
    const activa = await Entregas.getEntregaActiva(id, id_estudiante);
    if (!activa) {
      // Crear entrega base con primer archivo como principal
      const first = files[0];
      const entregaId = await Entregas.createEntrega({ id_actividad: id, id_estudiante, archivo: `/public/${first.filename}`, original_nombre: first.originalname, mime_type: first.mimetype, tamano: first.size });
      // Guardar todos los archivos en la tabla anexos
      for (const f of files) {
        await EntregaArchivos.addArchivo({ entrega_id: entregaId, archivo: `/public/${f.filename}`, original_nombre: f.originalname, mime_type: f.mimetype, tamano: f.size });
      }
      const entrega = await Entregas.getEntregaById(entregaId);
      const archivos = await EntregaArchivos.listArchivosEntrega(entregaId);

      // Crear notificación para el asesor asignado
      try {
        const AsesorNotifs = await import('../models/asesor_notifications.model.js');
        const asesorUserId = await AsesorNotifs.getAsesorUserIdByEstudianteId(id_estudiante);
        if (asesorUserId) {
          await AsesorNotifs.createNotification({
            asesor_user_id: asesorUserId,
            type: 'activity_submission',
            title: 'Nueva entrega de actividad',
            message: `${est.nombres} ${est.apellidos} entregó la actividad "${act.titulo}"`,
            action_url: `/asesor/actividades/${id}/entregas`,
            metadata: {
              entrega_id: entregaId,
              actividad_id: id,
              estudiante_id: id_estudiante,
              actividad_titulo: act.titulo
            }
          }).catch(err => console.error('Error creando notificación de entrega:', err));
        }
      } catch (err) {
        console.error('Error al crear notificación de entrega:', err);
      }

      return res.status(201).json({ data: { ...entrega, archivos }, created: true });
    } else {
      // Verificar si permite editar después de calificada
      const permiteEditar = await FechaExtensiones.permiteEditarDespuesCalificada(activa.id);
      if (activa.estado === 'revisada' && !permiteEditar) {
        return res.status(400).json({ message: 'Entrega revisada, no se pueden agregar archivos' });
      }
      // Dentro de fecha límite y no revisada: agregar archivos (validar acumulado)
      const existentes = await EntregaArchivos.listArchivosEntrega(activa.id);
      if (existentes.length + files.length > 5) return res.status(400).json({ message: 'Máximo 5 PDFs por entrega' });
      let totalExistente = existentes.reduce((s, a) => s + (a.tamano || 0), 0);
      for (const f of files) { totalExistente += f.size; }
      if (totalExistente > 20 * 1024 * 1024) return res.status(400).json({ message: 'Tamaño combinado excede 20MB' });
      for (const f of files) {
        await EntregaArchivos.addArchivo({ entrega_id: activa.id, archivo: `/public/${f.filename}`, original_nombre: f.originalname, mime_type: f.mimetype, tamano: f.size });
      }
      const archivos = await EntregaArchivos.listArchivosEntrega(activa.id);
      return res.status(201).json({ data: { ...activa, archivos }, appended: true });
    }
  } catch (e) {
    console.error('crearOReemplazarEntrega ERROR', e?.message, e);
    res.status(500).json({ message: 'Error interno', debug: e?.message });
  }
};

export const getEntregaActual = async (req, res) => {
  try {
    const entrega = await Entregas.getEntregaActiva(req.params.id, req.params.id_estudiante);
    if (!entrega) return res.status(404).json({ message: 'Sin entrega' });
    const archivos = await EntregaArchivos.listArchivosEntrega(entrega.id).catch(() => []);
    res.json({ data: { ...entrega, archivos } });
  }
  catch (e) { console.error('getEntregaActual', e); res.status(500).json({ message: 'Error interno' }); }
};

export const calificarEntrega = async (req, res) => {
  try {
    const { id } = req.params; const { calificacion, comentarios } = req.body; if (calificacion === undefined) return res.status(400).json({ message: 'calificacion requerida' });
    const entrega = await Entregas.getEntregaById(id); if (!entrega) return res.status(404).json({ message: 'Entrega no encontrada' });
    await Entregas.calificarEntrega(id, calificacion, comentarios);
    const refreshed = await Entregas.getEntregaById(id);
    try {
      if (entrega.id_estudiante) {
        const notifId = await StudentNotifs.createNotification({
          student_id: entrega.id_estudiante,
          type: 'grade',
          title: 'Calificación publicada',
          message: `Tu entrega fue calificada con ${calificacion}`,
          action_url: '/alumno/actividades',
          metadata: { entrega_id: entrega.id, actividad_id: entrega.id_actividad, calificacion }
        }).catch(() => null);
        broadcastStudent(entrega.id_estudiante, { type: 'notification', payload: { kind: 'grade', entrega_id: entrega.id, actividad_id: entrega.id_actividad, calificacion, notif_id: notifId } });
      }
    } catch (e) { console.error('notif calificarEntrega', e); }
    res.json({ data: refreshed });
  }
  catch (e) { console.error('calificarEntrega', e); res.status(500).json({ message: 'Error interno' }); }
};

export const listEntregasActividad = async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store'); res.set('Pragma', 'no-cache');
    const rows = await Entregas.listEntregasActividad(req.params.id, req.query);
    // Adjuntar archivos de cada entrega
    const enriched = await Promise.all(rows.map(async r => {
      try { r.archivos = await EntregaArchivos.listArchivosEntrega(r.id); } catch { r.archivos = []; }
      return r;
    }));
    res.json({ data: enriched });
  }
  catch (e) { console.error('listEntregasActividad', e); res.status(500).json({ message: 'Error interno' }); }
};

// ✅ Obtener estudiantes que recibieron la asignación (notificación) para una actividad
export const getEstudiantesAsignadosActividad = async (req, res) => {
  try {
    const { id } = req.params;
    const db = await import('../db.js');
    // Buscar estudiantes que recibieron notificación de tipo 'assignment' con metadata.actividad_id = id
    // Solo incluir estudiantes activos
    // ✅ IMPORTANTE: Excluir estudiantes con soft delete (borrado suave)
    // Usar DISTINCT para evitar duplicados y GROUP BY para agrupar por estudiante
    let [rows] = await db.default.query(`
      SELECT DISTINCT e.id, e.nombre, e.apellidos, e.email, e.grupo, e.estatus
      FROM estudiantes e
      INNER JOIN student_notifications sn ON sn.student_id = e.id
      LEFT JOIN soft_deletes sd ON sd.id_estudiante = e.id
      WHERE sn.type = 'assignment'
        AND e.estatus = 'Activo'
        AND sd.id IS NULL
        AND (
          JSON_EXTRACT(sn.metadata, '$.actividad_id') = ?
          OR sn.metadata LIKE ?
          OR sn.metadata LIKE ?
        )
      GROUP BY e.id
      ORDER BY e.apellidos, e.nombre
    `, [Number(id), `%"actividad_id":${Number(id)}%`, `%'actividad_id':${Number(id)}%`]);

    // Si no hay resultados con JSON_EXTRACT, intentar solo con LIKE (también excluir soft deletes)
    if (rows.length === 0) {
      [rows] = await db.default.query(`
        SELECT DISTINCT e.id, e.nombre, e.apellidos, e.email, e.grupo, e.estatus
        FROM estudiantes e
        INNER JOIN student_notifications sn ON sn.student_id = e.id
        LEFT JOIN soft_deletes sd ON sd.id_estudiante = e.id
        WHERE sn.type = 'assignment'
          AND e.estatus = 'Activo'
          AND sd.id IS NULL
          AND (sn.metadata LIKE ? OR sn.metadata LIKE ?)
        GROUP BY e.id
        ORDER BY e.apellidos, e.nombre
      `, [`%"actividad_id":${Number(id)}%`, `%'actividad_id':${Number(id)}%`]);
    }

    console.log(`[getEstudiantesAsignadosActividad] Actividad ${id}: ${rows.length} estudiantes activos asignados (excluyendo soft deletes)`);
    res.json({ data: rows });
  } catch (e) {
    console.error('getEstudiantesAsignadosActividad', e);
    res.status(500).json({ message: 'Error interno' });
  }
};

export const listEntregasEstudiante = async (req, res) => {
  try { res.set('Cache-Control', 'no-store'); res.set('Pragma', 'no-cache'); const rows = await Entregas.listEntregasEstudiante(req.params.id_estudiante, req.query); res.json({ data: rows }); }
  catch (e) { console.error('listEntregasEstudiante', e); res.status(500).json({ message: 'Error interno' }); }
};

export const historialEntregasActividadEstudiante = async (req, res) => {
  try {
    const { id, id_estudiante } = req.params;
    const rows = await Entregas.listHistorialEntregasActividadEstudiante(id, id_estudiante);
    res.json({ data: rows });
  } catch (e) { console.error('historialEntregasActividadEstudiante', e); res.status(500).json({ message: 'Error interno' }); }
};

// Ruta explícita para forzar append (útil a front que sólo quiere agregar más PDFs)
export const agregarEntrega = async (req, res) => {
  try {
    req.query.mode = 'append';
    return crearOReemplazarEntrega(req, res);
  } catch (e) { console.error('agregarEntrega', e); res.status(500).json({ message: 'Error interno' }); }
};

// === Archivos múltiples de una entrega ===
export const listArchivosEntrega = async (req, res) => {
  try {
    const { entregaId } = req.params;
    const entrega = await Entregas.getEntregaById(entregaId);
    if (!entrega) return res.status(404).json({ message: 'Entrega no encontrada' });
    const archivos = await EntregaArchivos.listArchivosEntrega(entregaId);
    res.json({ data: archivos });
  } catch (e) { console.error('listArchivosEntrega', e); res.status(500).json({ message: 'Error interno' }); }
};

export const addArchivoEntrega = async (req, res) => {
  try {
    const { entregaId } = req.params;
    const entrega = await Entregas.getEntregaById(entregaId);
    if (!entrega) return res.status(404).json({ message: 'Entrega no encontrada' });
    const act = await Actividades.getActividad(entrega.id_actividad);
    // Verificar si permite editar después de calificada
    const permiteEditar = await FechaExtensiones.permiteEditarDespuesCalificada(entrega.id);
    if (entrega.estado === 'revisada' && !permiteEditar) {
      return res.status(400).json({ message: 'Entrega revisada; no se pueden agregar archivos' });
    }
    
    // Obtener información del estudiante para fecha límite efectiva
    const est = await Estudiantes.getEstudianteById(entrega.id_estudiante);
    
    // ✅ Validar fecha límite efectiva: permitir agregar archivos hasta el final del día de la fecha límite
    if (act.fecha_limite && est) {
      const fechaLimiteEfectiva = await FechaExtensiones.getFechaLimiteEfectiva(entrega.id_actividad, entrega.id_estudiante, est.grupo);
      if (fechaLimiteEfectiva) {
        fechaLimiteEfectiva.setHours(23, 59, 59, 999);
        const ahora = new Date();
        if (ahora > fechaLimiteEfectiva) {
          return res.status(400).json({ message: 'Fecha límite vencida' });
        }
      }
    }
    const files = req.files || (req.file ? [req.file] : []);
    if (!files.length) { console.warn('addArchivoEntrega: sin archivos. body=', req.body); return res.status(400).json({ message: 'Al menos 1 PDF requerido' }); }
    const existentes = await EntregaArchivos.listArchivosEntrega(entrega.id);
    if (existentes.length + files.length > 5) return res.status(400).json({ message: 'Máximo 5 PDFs por entrega' });
    let total = existentes.reduce((s, a) => s + (a.tamano || 0), 0);
    for (const f of files) {
      if (f.mimetype !== 'application/pdf') return res.status(400).json({ message: 'Solo PDF permitido' });
      if (f.size > 5 * 1024 * 1024) return res.status(400).json({ message: `Archivo ${f.originalname} excede 5MB individuales` });
      total += f.size;
    }
    if (total > 20 * 1024 * 1024) return res.status(400).json({ message: 'Tamaño combinado excede 20MB' });
    let lastId = null;
    for (const f of files) {
      lastId = await EntregaArchivos.addArchivo({ entrega_id: entrega.id, archivo: `/public/${f.filename}`, original_nombre: f.originalname, mime_type: f.mimetype, tamano: f.size });
    }
    const archivos = await EntregaArchivos.listArchivosEntrega(entrega.id);
    res.status(201).json({ data: archivos, added: lastId });
  } catch (e) { console.error('addArchivoEntrega ERROR', e?.message, e); res.status(500).json({ message: 'Error interno' }); }
};

export const deleteArchivoEntrega = async (req, res) => {
  try {
    const { entregaId, archivoId } = req.params;
    const entrega = await Entregas.getEntregaById(entregaId);
    if (!entrega) return res.status(404).json({ message: 'Entrega no encontrada' });
    
    // Verificar si permite editar después de calificada
    const permiteEditar = await FechaExtensiones.permiteEditarDespuesCalificada(entrega.id);
    if (entrega.estado === 'revisada' && !permiteEditar) {
      return res.status(400).json({ message: 'Entrega revisada; no se pueden eliminar archivos' });
    }
    
    const ok = await EntregaArchivos.deleteArchivo(archivoId, entregaId);
    if (!ok) return res.status(404).json({ message: 'Archivo no encontrado' });
    const archivos = await EntregaArchivos.listArchivosEntrega(entregaId);
    res.json({ data: archivos, deleted: Number(archivoId) });
  } catch (e) { console.error('deleteArchivoEntrega', e); res.status(500).json({ message: 'Error interno' }); }
};

export const resumenActividadesEstudiante = async (req, res) => {
  try { 
    res.set('Cache-Control', 'no-store'); 
    res.set('Pragma', 'no-cache'); 
    const rows = await Entregas.getResumenActividadesEstudiante(req.params.id_estudiante);
    
    // Obtener información del estudiante para calcular fechas límite efectivas
    const estudiante = await Estudiantes.getEstudianteById(req.params.id_estudiante);
    const grupoEstudiante = estudiante?.grupo || null;
    
    // Calcular fecha límite efectiva para cada actividad (considera extensiones)
    const rowsConFechaLimiteEfectiva = await Promise.all(rows.map(async (row) => {
      if (row.fecha_limite) {
        const fechaLimiteEfectiva = await FechaExtensiones.getFechaLimiteEfectiva(
          row.id, 
          req.params.id_estudiante, 
          grupoEstudiante
        );
        return {
          ...row,
          fecha_limite_efectiva: fechaLimiteEfectiva ? fechaLimiteEfectiva.toISOString() : row.fecha_limite
        };
      }
      return row;
    }));
    
    res.json({ data: rowsConFechaLimiteEfectiva }); 
  }
  catch (e) { console.error('resumenActividadesEstudiante', e); res.status(500).json({ message: 'Error interno' }); }
};

// === Extensiones de fecha límite ===
export const extenderFechaLimiteGrupo = async (req, res) => {
  try {
    const { id } = req.params; // id_actividad
    const { grupo, nueva_fecha_limite, notas } = req.body;
    const creado_por = req.user?.id || req.user?.id_usuario || null;

    if (!grupo || !nueva_fecha_limite) {
      return res.status(400).json({ message: 'grupo y nueva_fecha_limite requeridos' });
    }

    const act = await Actividades.getActividad(id);
    if (!act) return res.status(404).json({ message: 'Actividad no encontrada' });

    const extensionId = await FechaExtensiones.createExtension({
      id_actividad: Number(id),
      tipo: 'grupo',
      grupo: String(grupo).trim(),
      id_estudiante: null,
      nueva_fecha_limite: new Date(nueva_fecha_limite),
      creado_por,
      notas: notas || null
    });

    res.json({ data: { id: extensionId, message: 'Extensión creada exitosamente' } });
  } catch (e) {
    console.error('extenderFechaLimiteGrupo', e);
    res.status(500).json({ message: e.message || 'Error al extender fecha límite' });
  }
};

export const extenderFechaLimiteEstudiante = async (req, res) => {
  try {
    const { id } = req.params; // id_actividad
    const { id_estudiante, nueva_fecha_limite, notas } = req.body;
    const creado_por = req.user?.id || req.user?.id_usuario || null;

    if (!id_estudiante || !nueva_fecha_limite) {
      return res.status(400).json({ message: 'id_estudiante y nueva_fecha_limite requeridos' });
    }

    const act = await Actividades.getActividad(id);
    if (!act) return res.status(404).json({ message: 'Actividad no encontrada' });

    const est = await Estudiantes.getEstudianteById(id_estudiante);
    if (!est) return res.status(404).json({ message: 'Estudiante no encontrado' });

    const extensionId = await FechaExtensiones.createExtension({
      id_actividad: Number(id),
      tipo: 'estudiante',
      grupo: null,
      id_estudiante: Number(id_estudiante),
      nueva_fecha_limite: new Date(nueva_fecha_limite),
      creado_por,
      notas: notas || null
    });

    res.json({ data: { id: extensionId, message: 'Extensión creada exitosamente' } });
  } catch (e) {
    console.error('extenderFechaLimiteEstudiante', e);
    res.status(500).json({ message: e.message || 'Error al extender fecha límite' });
  }
};

export const listExtensionesActividad = async (req, res) => {
  try {
    const { id } = req.params; // id_actividad
    const extensiones = await FechaExtensiones.listExtensiones(Number(id));
    res.json({ data: extensiones });
  } catch (e) {
    console.error('listExtensionesActividad', e);
    res.status(500).json({ message: 'Error al listar extensiones' });
  }
};

export const eliminarExtension = async (req, res) => {
  try {
    const { extensionId } = req.params;
    const ok = await FechaExtensiones.deleteExtension(Number(extensionId));
    if (!ok) return res.status(404).json({ message: 'Extensión no encontrada' });
    res.json({ data: { message: 'Extensión eliminada exitosamente' } });
  } catch (e) {
    console.error('eliminarExtension', e);
    res.status(500).json({ message: 'Error al eliminar extensión' });
  }
};

// === Permitir editar después de calificada ===
export const permitirEditarDespuesCalificada = async (req, res) => {
  try {
    const { entregaId } = req.params;
    const { permite } = req.body; // boolean

    const entrega = await Entregas.getEntregaById(entregaId);
    if (!entrega) return res.status(404).json({ message: 'Entrega no encontrada' });

    console.log(`[permitirEditarDespuesCalificada] Actualizando entrega ${entregaId}, permite=${permite}`);
    const ok = await FechaExtensiones.setPermiteEditarDespuesCalificada(entregaId, permite);
    if (!ok) return res.status(400).json({ message: 'No se pudo actualizar el permiso' });

    // Verificar que se guardó correctamente
    const verificado = await FechaExtensiones.permiteEditarDespuesCalificada(entregaId);
    console.log(`[permitirEditarDespuesCalificada] Verificado después de guardar: ${verificado}`);

    res.json({ data: { message: 'Permiso actualizado exitosamente', permite: permite ? true : false, verificado } });
  } catch (e) {
    console.error('permitirEditarDespuesCalificada', e);
    res.status(500).json({ message: 'Error al actualizar permiso' });
  }
};
