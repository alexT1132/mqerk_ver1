import * as Usuarios from '../models/usuarios.model.js';
import * as StudentNotifs from '../models/student_notifications.model.js';

async function resolveStudentId(userId){
  const user = await Usuarios.getUsuarioPorid(userId).catch(()=>null);
  if(!user || user.role !== 'estudiante' || !user.id_estudiante) return null;
  return user.id_estudiante;
}

export const listStudentNotifications = async (req, res) => {
  try {
    const sid = await resolveStudentId(req.user.id);
    if(!sid) return res.status(403).json({ message:'Solo estudiantes' });
    const rows = await StudentNotifs.listNotifications(sid, req.query);
    res.json({ data: rows });
  } catch(e){ console.error('listStudentNotifications', e); res.status(500).json({ message:'Error interno'}); }
};

export const markRead = async (req, res) => {
  try {
    const sid = await resolveStudentId(req.user.id);
    if(!sid) return res.status(403).json({ message:'Solo estudiantes' });
    const affected = await StudentNotifs.markRead(req.params.id, sid, true);
    if(!affected) return res.status(404).json({ message:'No encontrada'});
    res.json({ ok:true });
  } catch(e){ console.error('markRead notif', e); res.status(500).json({ message:'Error interno'}); }
};

export const markUnread = async (req, res) => {
  try {
    const sid = await resolveStudentId(req.user.id);
    if(!sid) return res.status(403).json({ message:'Solo estudiantes' });
    const affected = await StudentNotifs.markRead(req.params.id, sid, false);
    if(!affected) return res.status(404).json({ message:'No encontrada'});
    res.json({ ok:true });
  } catch(e){ console.error('markUnread notif', e); res.status(500).json({ message:'Error interno'}); }
};

export const markAllRead = async (req, res) => {
  try {
    const sid = await resolveStudentId(req.user.id);
    if(!sid) return res.status(403).json({ message:'Solo estudiantes' });
    await StudentNotifs.markAllRead(sid);
    res.json({ ok:true });
  } catch(e){ console.error('markAllRead notif', e); res.status(500).json({ message:'Error interno'}); }
};

export const deleteNotification = async (req, res) => {
  try {
    const sid = await resolveStudentId(req.user.id);
    if(!sid) return res.status(403).json({ message:'Solo estudiantes' });
    const affected = await StudentNotifs.deleteNotification(req.params.id, sid);
    if(!affected) return res.status(404).json({ message:'No encontrada'});
    res.json({ ok:true });
  } catch(e){ console.error('delete notif', e); res.status(500).json({ message:'Error interno'}); }
};

export const deleteRead = async (req, res) => {
  try {
    const sid = await resolveStudentId(req.user.id);
    if(!sid) return res.status(403).json({ message:'Solo estudiantes' });
    await StudentNotifs.deleteRead(sid);
    res.json({ ok:true });
  } catch(e){ console.error('deleteRead notif', e); res.status(500).json({ message:'Error interno'}); }
};
