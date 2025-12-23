import * as Usuarios from '../models/usuarios.model.js';
import * as Reminders from '../models/student_reminders.model.js';

// Asegurar que la tabla tenga el campo asesor_user_id
Reminders.ensureTable().catch(err => {
  console.error('Error asegurando tabla student_reminders:', err?.code || err?.message || err);
  if (err?.code === 'ETIMEDOUT') {
    console.error('[DB] ⚠️  No se puede conectar a MySQL. Verifica que el servidor MySQL esté corriendo.');
  }
});

async function resolveStudentId(userId){
  const user = await Usuarios.getUsuarioPorid(userId).catch(()=>null);
  if(!user || user.role !== 'estudiante' || !user.id_estudiante) return null;
  return user.id_estudiante;
}

export const list = async (req, res) => {
  try {
    const sid = await resolveStudentId(req.user.id);
    if(!sid) return res.status(403).json({ message:'Solo estudiantes' });
    const rows = await Reminders.listByStudent(sid);
    res.json({ data: rows });
  } catch(e){ console.error('reminders list', e); res.status(500).json({ message:'Error interno'}); }
};

export const create = async (req, res) => {
  try {
    const sid = await resolveStudentId(req.user.id);
    if(!sid) return res.status(403).json({ message:'Solo estudiantes' });
    const { title, description, date, priority } = req.body || {};
    if(!title || !date) return res.status(400).json({ message:'title y date son obligatorios'});
    const pr = ['red','orange','yellow','green','blue','purple'];
    const p = pr.includes(priority) ? priority : 'blue';
    const created = await Reminders.create(sid, { title, description, date, priority: p });
    res.status(201).json({ data: created });
  } catch(e){ console.error('reminders create', e); res.status(500).json({ message:'Error interno'}); }
};

export const update = async (req, res) => {
  try {
    const sid = await resolveStudentId(req.user.id);
    if(!sid) return res.status(403).json({ message:'Solo estudiantes' });
    const ok = await Reminders.update(Number(req.params.id), sid, req.body || {});
    if(!ok) return res.status(404).json({ message:'No encontrado'});
    res.json({ ok:true });
  } catch(e){ console.error('reminders update', e); res.status(500).json({ message:'Error interno'}); }
};

export const remove = async (req, res) => {
  try {
    const sid = await resolveStudentId(req.user.id);
    if(!sid) return res.status(403).json({ message:'Solo estudiantes' });
    const ok = await Reminders.remove(Number(req.params.id), sid);
    if(!ok) return res.status(404).json({ message:'No encontrado'});
    res.sendStatus(204);
  } catch(e){ console.error('reminders remove', e); res.status(500).json({ message:'Error interno'}); }
};
