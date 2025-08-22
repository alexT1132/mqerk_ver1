import * as Actividades from '../models/actividades.model.js';
import * as Entregas from '../models/actividades_entregas.model.js';
import * as EntregaArchivos from '../models/actividades_entregas_archivos.model.js';
import * as Estudiantes from '../models/estudiantes.model.js';
import * as StudentNotifs from '../models/student_notifications.model.js';
import { broadcastStudent } from '../ws.js';
import * as Areas from '../models/areas.model.js';
import { upload } from '../middlewares/multer.js';

// Ahora soporta hasta 5 PDFs por envío inicial o append
export const actividadUploadMiddleware = upload.array('archivos', 5);
export const actividadAssetsUpload = upload.fields([
  { name:'recursos', maxCount:10 },
  { name:'imagen', maxCount:1 }
]);

export const createActividad = async (req, res) => {
  try {
    const { titulo } = req.body;
    if (!titulo) return res.status(400).json({ message:'titulo requerido'});
    if (req.body.id_area !== undefined && req.body.id_area !== null) {
      const areaId = Number(req.body.id_area);
      if (areaId === 5) return res.status(400).json({ message:'id_area 5 es contenedor y no asignable'});
      const area = await Areas.getAreaById(areaId);
      if(!area) return res.status(400).json({ message:'id_area no válido'});
    }
    if (req.body.grupos) {
      try { if (typeof req.body.grupos === 'string') req.body.grupos = JSON.parse(req.body.grupos); } catch { req.body.grupos = null; }
      if (req.body.grupos && !Array.isArray(req.body.grupos)) req.body.grupos = null;
    }
    if (req.files) {
      const recursos = (req.files.recursos || []).map(f => ({ archivo:`/public/${f.filename}`, nombre:f.originalname, mime:f.mimetype, tamano:f.size }));
      if (recursos.length) req.body.recursos_json = recursos;
      const imagen = (req.files.imagen || [])[0];
      if (imagen) req.body.imagen_portada = `/public/${imagen.filename}`;
    }
    const id = await Actividades.createActividad(req.body);
    const act = await Actividades.getActividad(id);
    // Crear notificaciones para grupos si se enviaron
    try {
      if (Array.isArray(req.body.grupos) && req.body.grupos.length) {
        const placeholders = req.body.grupos.map(()=>'?').join(',');
        const [rows] = await (await import('../db.js')).default.query(`SELECT id FROM estudiantes WHERE grupo IN (${placeholders})`, req.body.grupos);
        if (rows.length) {
          const list = rows.map(r => ({
            student_id: r.id,
            type: 'assignment',
            title: 'Nueva actividad asignada',
            message: act.titulo ? `Se te asignó: ${act.titulo}` : 'Tienes una nueva actividad',
            action_url: '/alumno/actividades',
            metadata: { actividad_id: id }
          }));
          const bulkRes = await StudentNotifs.bulkCreateNotifications(list).catch(()=>null);
          let idMap = [];
          if (bulkRes && bulkRes.affectedRows) {
            const { firstInsertId, affectedRows } = bulkRes;
            if (firstInsertId && affectedRows === rows.length) {
              idMap = Array.from({ length: affectedRows }, (_,i)=> firstInsertId + i);
            }
          }
          // Emitir en tiempo real con notif_id si disponible
          rows.forEach((r, idx) => {
            broadcastStudent(r.id, { type:'notification', payload: { kind:'assignment', actividad_id:id, title: 'Nueva actividad', message: act.titulo, notif_id: idMap[idx] } });
          });
        }
      }
    } catch(e){ console.error('notif createActividad', e); }
    res.status(201).json({ data: act });
  } catch(e){ console.error('createActividad', e); res.status(500).json({ message:'Error interno'}); }
};

export const updateActividad = async (req, res) => {
  try {
    const { id } = req.params; const existing = await Actividades.getActividad(id);
    if(!existing) return res.status(404).json({ message:'No encontrada'});
    if (req.body.id_area !== undefined) {
      const areaId = req.body.id_area === null ? null : Number(req.body.id_area);
      if (areaId === 5) return res.status(400).json({ message:'id_area 5 es contenedor y no asignable'});
      if (areaId !== null) {
        const area = await Areas.getAreaById(areaId);
        if(!area) return res.status(400).json({ message:'id_area no válido'});
      }
    }
    if (req.body.grupos) {
      try { if (typeof req.body.grupos === 'string') req.body.grupos = JSON.parse(req.body.grupos); } catch { req.body.grupos = null; }
      if (req.body.grupos && !Array.isArray(req.body.grupos)) req.body.grupos = null;
    }
    if (req.files && (req.files.recursos?.length || req.files.imagen?.length)) {
      const recursos = (req.files.recursos || []).map(f => ({ archivo:`/public/${f.filename}`, nombre:f.originalname, mime:f.mimetype, tamano:f.size }));
      if (recursos.length) req.body.recursos_json = recursos;
      const imagen = (req.files.imagen || [])[0];
      if (imagen) req.body.imagen_portada = `/public/${imagen.filename}`;
    }
    const upd = await Actividades.updateActividad(id, req.body);
    if(!upd.affectedRows) return res.status(400).json({ message:'Sin cambios'});
    const refreshed = await Actividades.getActividad(id);
    res.json({ data: refreshed });
  } catch(e){ console.error('updateActividad', e); res.status(500).json({ message:'Error interno'}); }
};

export const listActividades = async (req, res) => {
  try { const acts = await Actividades.listActividades(req.query, req.query); res.json({ data: acts }); }
  catch(e){ console.error('listActividades', e); res.status(500).json({ message:'Error interno'}); }
};

export const getActividad = async (req, res) => {
  try { const act = await Actividades.getActividad(req.params.id); if(!act) return res.status(404).json({ message:'No encontrada'}); res.json({ data: act }); }
  catch(e){ console.error('getActividad', e); res.status(500).json({ message:'Error interno'}); }
};

// Comportamiento estilo Classroom:
//  - Primera subida crea la entrega base (registro en actividades_entregas) y se guarda archivo principal también en tabla archivos
//  - Subidas posteriores (antes de revisión y dentro de fecha límite) SOLAMENTE agregan más archivos a la misma entrega activa.
//  - Si se quiere estrictamente un único archivo, se podría pasar query ?modo=single (no implementado aún).
export const crearOReemplazarEntrega = async (req, res) => {
  try {
    const { id } = req.params; const { id_estudiante } = req.body;
    if(!id_estudiante) {
      console.warn('crearOReemplazarEntrega: id_estudiante ausente. body=', req.body, 'files len=', (req.files||[]).length);
      return res.status(400).json({ message:'id_estudiante requerido'});
    }
    const act = await Actividades.getActividad(id);
    if(!act || !act.activo) return res.status(404).json({ message:'Actividad no encontrada'});
    if(act.tipo !== 'actividad') return res.status(400).json({ message:'Tipo no soportado'});
    if(act.fecha_limite && new Date() > new Date(act.fecha_limite)) return res.status(400).json({ message:'Fecha límite vencida'});
    const est = await Estudiantes.getEstudianteById(id_estudiante); if(!est) return res.status(404).json({ message:'Estudiante no encontrado'});
    const files = req.files || [];
    if(!files.length) {
      console.warn('crearOReemplazarEntrega: sin archivos recibidos. fieldName esperado=archivos. body keys=', Object.keys(req.body||{}));
      return res.status(400).json({ message:'Al menos 1 PDF requerido'});
    }
    if(files.length > 5) return res.status(400).json({ message:'Máximo 5 PDFs por envío'});
    let total = 0;
    for(const f of files){
      if(f.mimetype !== 'application/pdf') return res.status(400).json({ message:'Solo PDF permitido'});
      total += f.size;
      if(f.size > 5 * 1024 * 1024) return res.status(400).json({ message:`Archivo ${f.originalname} excede 5MB individuales`});
    }
    if(total > 20 * 1024 * 1024) return res.status(400).json({ message:'Tamaño combinado excede 20MB'});
    const activa = await Entregas.getEntregaActiva(id, id_estudiante);
    if (!activa) {
      // Crear entrega base con primer archivo como principal
      const first = files[0];
      const entregaId = await Entregas.createEntrega({ id_actividad:id, id_estudiante, archivo:`/public/${first.filename}`, original_nombre:first.originalname, mime_type:first.mimetype, tamano:first.size });
      // Guardar todos los archivos en la tabla anexos
      for(const f of files){
        await EntregaArchivos.addArchivo({ entrega_id:entregaId, archivo:`/public/${f.filename}`, original_nombre:f.originalname, mime_type:f.mimetype, tamano:f.size });
      }
      const entrega = await Entregas.getEntregaById(entregaId);
      const archivos = await EntregaArchivos.listArchivosEntrega(entregaId);
      return res.status(201).json({ data: { ...entrega, archivos }, created:true });
    } else {
      if (activa.estado === 'revisada') return res.status(400).json({ message:'Entrega revisada, no se pueden agregar archivos'});
      // Dentro de fecha límite y no revisada: agregar archivos (validar acumulado)
      const existentes = await EntregaArchivos.listArchivosEntrega(activa.id);
      if (existentes.length + files.length > 5) return res.status(400).json({ message:'Máximo 5 PDFs por entrega'});
      let totalExistente = existentes.reduce((s,a)=> s + (a.tamano||0), 0);
      for(const f of files){ totalExistente += f.size; }
      if(totalExistente > 20 * 1024 * 1024) return res.status(400).json({ message:'Tamaño combinado excede 20MB'});
      for(const f of files){
        await EntregaArchivos.addArchivo({ entrega_id:activa.id, archivo:`/public/${f.filename}`, original_nombre:f.originalname, mime_type:f.mimetype, tamano:f.size });
      }
      const archivos = await EntregaArchivos.listArchivosEntrega(activa.id);
      return res.status(201).json({ data: { ...activa, archivos }, appended:true });
    }
  } catch(e){
    console.error('crearOReemplazarEntrega ERROR', e?.message, e);
    res.status(500).json({ message:'Error interno', debug: e?.message });
  }
};

export const getEntregaActual = async (req, res) => {
  try {
    const entrega = await Entregas.getEntregaActiva(req.params.id, req.params.id_estudiante);
    if(!entrega) return res.status(404).json({ message:'Sin entrega'});
    const archivos = await EntregaArchivos.listArchivosEntrega(entrega.id).catch(()=>[]);
    res.json({ data: { ...entrega, archivos } });
  }
  catch(e){ console.error('getEntregaActual', e); res.status(500).json({ message:'Error interno'}); }
};

export const calificarEntrega = async (req, res) => {
  try {
    const { id } = req.params; const { calificacion, comentarios } = req.body; if(calificacion === undefined) return res.status(400).json({ message:'calificacion requerida'});
    const entrega = await Entregas.getEntregaById(id); if(!entrega) return res.status(404).json({ message:'Entrega no encontrada'});
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
        }).catch(()=>null);
        broadcastStudent(entrega.id_estudiante, { type:'notification', payload: { kind:'grade', entrega_id: entrega.id, actividad_id: entrega.id_actividad, calificacion, notif_id: notifId } });
      }
    } catch(e){ console.error('notif calificarEntrega', e); }
    res.json({ data: refreshed });
  }
  catch(e){ console.error('calificarEntrega', e); res.status(500).json({ message:'Error interno'}); }
};

export const listEntregasActividad = async (req, res) => {
  try {
    res.set('Cache-Control','no-store'); res.set('Pragma','no-cache');
    const rows = await Entregas.listEntregasActividad(req.params.id, req.query);
    // Adjuntar archivos de cada entrega
    const enriched = await Promise.all(rows.map(async r => {
      try { r.archivos = await EntregaArchivos.listArchivosEntrega(r.id); } catch { r.archivos = []; }
      return r;
    }));
    res.json({ data: enriched });
  }
  catch(e){ console.error('listEntregasActividad', e); res.status(500).json({ message:'Error interno'}); }
};

export const listEntregasEstudiante = async (req, res) => {
  try { res.set('Cache-Control','no-store'); res.set('Pragma','no-cache'); const rows = await Entregas.listEntregasEstudiante(req.params.id_estudiante, req.query); res.json({ data: rows }); }
  catch(e){ console.error('listEntregasEstudiante', e); res.status(500).json({ message:'Error interno'}); }
};

export const historialEntregasActividadEstudiante = async (req, res) => {
  try {
    const { id, id_estudiante } = req.params;
    const rows = await Entregas.listHistorialEntregasActividadEstudiante(id, id_estudiante);
    res.json({ data: rows });
  } catch(e){ console.error('historialEntregasActividadEstudiante', e); res.status(500).json({ message:'Error interno'}); }
};

// Ruta explícita para forzar append (útil a front que sólo quiere agregar más PDFs)
export const agregarEntrega = async (req, res) => {
  try {
    req.query.mode = 'append';
    return crearOReemplazarEntrega(req, res);
  } catch(e){ console.error('agregarEntrega', e); res.status(500).json({ message:'Error interno'}); }
};

// === Archivos múltiples de una entrega ===
export const listArchivosEntrega = async (req, res) => {
  try {
    const { entregaId } = req.params;
    const entrega = await Entregas.getEntregaById(entregaId);
    if(!entrega) return res.status(404).json({ message:'Entrega no encontrada'});
    const archivos = await EntregaArchivos.listArchivosEntrega(entregaId);
    res.json({ data: archivos });
  } catch(e){ console.error('listArchivosEntrega', e); res.status(500).json({ message:'Error interno'}); }
};

export const addArchivoEntrega = async (req, res) => {
  try {
    const { entregaId } = req.params;
    const entrega = await Entregas.getEntregaById(entregaId);
    if(!entrega) return res.status(404).json({ message:'Entrega no encontrada'});
  if(entrega.estado === 'revisada') return res.status(400).json({ message:'Entrega revisada; no se pueden agregar archivos'});
  const act = await Actividades.getActividad(entrega.id_actividad);
  if(act.fecha_limite && new Date() > new Date(act.fecha_limite)) return res.status(400).json({ message:'Fecha límite vencida'});
    const files = req.files || (req.file ? [req.file] : []);
  if(!files.length) { console.warn('addArchivoEntrega: sin archivos. body=', req.body); return res.status(400).json({ message:'Al menos 1 PDF requerido'}); }
    const existentes = await EntregaArchivos.listArchivosEntrega(entrega.id);
    if (existentes.length + files.length > 5) return res.status(400).json({ message:'Máximo 5 PDFs por entrega'});
    let total = existentes.reduce((s,a)=> s + (a.tamano||0), 0);
    for(const f of files){
      if(f.mimetype !== 'application/pdf') return res.status(400).json({ message:'Solo PDF permitido'});
      if(f.size > 5 * 1024 * 1024) return res.status(400).json({ message:`Archivo ${f.originalname} excede 5MB individuales`});
      total += f.size;
    }
    if(total > 20 * 1024 * 1024) return res.status(400).json({ message:'Tamaño combinado excede 20MB'});
    let lastId = null;
    for(const f of files){
      lastId = await EntregaArchivos.addArchivo({ entrega_id: entrega.id, archivo:`/public/${f.filename}`, original_nombre:f.originalname, mime_type:f.mimetype, tamano:f.size });
    }
    const archivos = await EntregaArchivos.listArchivosEntrega(entrega.id);
    res.status(201).json({ data: archivos, added: lastId });
  } catch(e){ console.error('addArchivoEntrega ERROR', e?.message, e); res.status(500).json({ message:'Error interno'}); }
};

export const deleteArchivoEntrega = async (req, res) => {
  try {
    const { entregaId, archivoId } = req.params;
    const entrega = await Entregas.getEntregaById(entregaId);
    if(!entrega) return res.status(404).json({ message:'Entrega no encontrada'});
  if(entrega.estado === 'revisada') return res.status(400).json({ message:'Entrega revisada; no se pueden eliminar archivos'});
    const ok = await EntregaArchivos.deleteArchivo(archivoId, entregaId);
    if(!ok) return res.status(404).json({ message:'Archivo no encontrado'});
    const archivos = await EntregaArchivos.listArchivosEntrega(entregaId);
  res.json({ data: archivos, deleted: Number(archivoId) });
  } catch(e){ console.error('deleteArchivoEntrega', e); res.status(500).json({ message:'Error interno'}); }
};

export const resumenActividadesEstudiante = async (req, res) => {
  try { res.set('Cache-Control','no-store'); res.set('Pragma','no-cache'); const rows = await Entregas.getResumenActividadesEstudiante(req.params.id_estudiante); res.json({ data: rows }); }
  catch(e){ console.error('resumenActividadesEstudiante', e); res.status(500).json({ message:'Error interno'}); }
};
