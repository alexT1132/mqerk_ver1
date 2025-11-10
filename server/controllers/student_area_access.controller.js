import * as Usuarios from '../models/usuarios.model.js';
import * as Access from '../models/student_area_access.model.js';
import * as StudentNotifs from '../models/student_notifications.model.js';
import { broadcastStudent } from '../ws.js';
import * as Areas from '../models/areas.model.js';

async function getUser(req){
  const id = req.user?.id;
  if(!id) return null;
  try { return await Usuarios.getUsuarioPorid(id); } catch { return null; }
}

export const requestAccess = async (req, res) => {
  try {
    const user = await getUser(req);
    if(!user || user.role !== 'estudiante' || !user.id_estudiante) return res.status(403).json({ message:'Solo estudiantes' });
    const { area_id, area_type='actividad', notes=null } = req.body || {};
    if(!area_id) return res.status(400).json({ message:'area_id requerido' });
    const insertId = await Access.createRequest({ id_estudiante: user.id_estudiante, area_id: Number(area_id), area_type, notes });
    res.status(201).json({ id: insertId });
  } catch(e){ console.error('requestAccess', e); res.status(500).json({ message:'Error interno' }); }
};

export const myRequests = async (req, res) => {
  try {
    const user = await getUser(req);
    if(!user || user.role !== 'estudiante' || !user.id_estudiante) return res.status(403).json({ message:'Solo estudiantes' });
    const { area_type=null, status=null } = req.query || {};
    const rows = await Access.listMyRequests(user.id_estudiante, { area_type, status });
    res.json({ data: rows });
  } catch(e){ console.error('myRequests', e); res.status(500).json({ message:'Error interno' }); }
};

export const myPermissions = async (req, res) => {
  try {
    const user = await getUser(req);
    if(!user || user.role !== 'estudiante' || !user.id_estudiante) return res.status(403).json({ message:'Solo estudiantes' });
    const { area_type=null } = req.query || {};
    const rows = await Access.listPermissions(user.id_estudiante, { area_type });
    res.json({ data: rows });
  } catch(e){ console.error('myPermissions', e); res.status(500).json({ message:'Error interno' }); }
};

export const listRequests = async (req, res) => {
  try {
    const user = await getUser(req);
    if(!user || (user.role !== 'asesor' && user.role !== 'admin')) return res.status(403).json({ message:'Solo asesores o admins' });
    const { status='pending', area_type=null, area_id=null, limit=200, offset=0 } = req.query || {};
    const rows = await Access.listRequests({ status, area_type, area_id: area_id ? Number(area_id) : null, limit: Number(limit), offset: Number(offset) });
    res.json({ data: rows });
  } catch(e){ console.error('listRequests', e); res.status(500).json({ message:'Error interno' }); }
};

export const approve = async (req, res) => {
  try {
    const user = await getUser(req);
    if(!user || (user.role !== 'asesor' && user.role !== 'admin')) return res.status(403).json({ message:'Solo asesores o admins' });
    const { id } = req.params;
    const result = await Access.approveRequest(Number(id), user.id);
    if(!result.ok) return res.status(404).json({ message:'Solicitud no encontrada' });
    // Notificar al estudiante (DB + tiempo real)
    try {
      const reqRow = result.request;
      // Enriquecer metadata con nombre del área y etiqueta humana del tipo
      let areaName = null; try { const area = await Areas.getAreaById(reqRow.area_id); areaName = area?.nombre || null; } catch {}
      const typeLabel = reqRow.area_type === 'simulacion' ? 'Simulación' : 'Actividad';
      const notifId = await StudentNotifs.createNotification({
        student_id: reqRow.id_estudiante,
        type: 'area_access',
        title: 'Acceso aprobado',
        message: `Tu acceso al módulo ${areaName || ('#'+reqRow.area_id)} (${typeLabel}) fue aprobado`,
        action_url: null,
        metadata: { area_id: reqRow.area_id, area_type: reqRow.area_type, area_name: areaName, area_type_label: typeLabel, request_id: reqRow.id, status: 'approved' }
      });
      // Broadcast WS opcional para actualización inmediata en UI
      try { broadcastStudent(reqRow.id_estudiante, { type: 'notification', payload: { notif_id: notifId, type: 'area_access', title: 'Acceso aprobado', message: `Tu acceso al módulo ${areaName || ('#'+reqRow.area_id)} (${typeLabel}) fue aprobado`, metadata: { area_id: reqRow.area_id, area_type: reqRow.area_type, area_name: areaName, area_type_label: typeLabel, request_id: reqRow.id, status: 'approved' }, created_at: new Date().toISOString() } }); } catch {}
    } catch(_e) {}
    res.json({ ok:true });
  } catch(e){ console.error('approve student area access', e); res.status(500).json({ message:'Error interno' }); }
};

export const deny = async (req, res) => {
  try {
    const user = await getUser(req);
    if(!user || (user.role !== 'asesor' && user.role !== 'admin')) return res.status(403).json({ message:'Solo asesores o admins' });
    const { id } = req.params;
    const { notes=null } = req.body || {};
    const ok = await Access.denyRequest(Number(id), user.id, notes);
    if(!ok) return res.status(404).json({ message:'Solicitud no encontrada' });
    try {
      // Cargar para notificar
      const [rows] = await (await import('../db.js')).default.query('SELECT * FROM student_area_requests WHERE id=? LIMIT 1', [id]);
      const reqRow = rows?.[0];
      if (reqRow) {
        let areaName = null; try { const area = await Areas.getAreaById(reqRow.area_id); areaName = area?.nombre || null; } catch {}
        const typeLabel = reqRow.area_type === 'simulacion' ? 'Simulación' : 'Actividad';
        const notifId = await StudentNotifs.createNotification({
          student_id: reqRow.id_estudiante,
          type: 'area_access',
          title: 'Solicitud rechazada',
          message: `Tu solicitud para el módulo ${areaName || ('#'+reqRow.area_id)} (${typeLabel}) fue rechazada`,
          action_url: null,
          metadata: { area_id: reqRow.area_id, area_type: reqRow.area_type, area_name: areaName, area_type_label: typeLabel, request_id: reqRow.id, status: 'denied', notes: notes || null }
        });
        // Broadcast WS
        try { broadcastStudent(reqRow.id_estudiante, { type: 'notification', payload: { notif_id: notifId, type: 'area_access', title: 'Solicitud rechazada', message: `Tu solicitud para el módulo ${areaName || ('#'+reqRow.area_id)} (${typeLabel}) fue rechazada`, metadata: { area_id: reqRow.area_id, area_type: reqRow.area_type, area_name: areaName, area_type_label: typeLabel, request_id: reqRow.id, status: 'denied', notes: notes || null }, created_at: new Date().toISOString() } }); } catch {}
      }
    } catch(_e) {}
    res.json({ ok:true });
  } catch(e){ console.error('deny student area access', e); res.status(500).json({ message:'Error interno' }); }
};
