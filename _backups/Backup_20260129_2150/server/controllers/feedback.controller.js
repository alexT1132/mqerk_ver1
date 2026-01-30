import * as Tasks from '../models/feedback_tasks.model.js';
import * as Subs from '../models/feedback_submissions.model.js';
import * as Estudiantes from '../models/estudiantes.model.js';
import * as Notes from '../models/feedback_submission_notes.model.js';
import { upload } from '../middlewares/multer.js';

// Wrapper para usar en rutas para subir un PDF (reutiliza storage general)
export const feedbackUploadMiddleware = upload.single('archivo');

// Middleware para tareas: campos 'recursos' (múltiples) e 'imagen'
export const taskUploadMiddleware = (req, _res, next) => next();

export const createTask = async (req, res) => {
  try {
    const { nombre, descripcion, due_date, puntos, grupos } = req.body;
    if (!nombre || !due_date) return res.status(400).json({ message: 'nombre y due_date son obligatorios' });
    let gruposParsed = undefined;
    if (grupos) {
      try { gruposParsed = Array.isArray(grupos) ? grupos : JSON.parse(grupos); } catch { return res.status(400).json({ message:'grupos debe ser array JSON válido'}); }
    }
    const id = await Tasks.createTask({
      nombre,
      descripcion,
      due_date,
      puntos: puntos || 10,
      grupos: gruposParsed,
    });
    const task = await Tasks.getTask(id);
    res.status(201).json({ data: task });
  } catch (e) {
    console.error('createTask error', e); res.status(500).json({ message: 'Error interno' });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Tasks.getTask(id);
    if(!existing) return res.status(404).json({ message:'No encontrada' });
    const { nombre, descripcion, due_date, puntos, activo, grupos } = req.body;
    let gruposParsed = grupos;
    if (grupos !== undefined) {
      if (Array.isArray(grupos)) gruposParsed = grupos; else {
        try { gruposParsed = JSON.parse(grupos); } catch { return res.status(400).json({ message:'grupos JSON inválido'}); }
      }
    }
    const resUpd = await Tasks.updateTask(id, {
      nombre,
      descripcion,
      due_date,
      puntos,
      activo,
  grupos: gruposParsed,
    });
    if(!resUpd.affectedRows) return res.status(400).json({ message:'Sin cambios' });
    const refreshed = await Tasks.getTask(id);
    res.json({ data: refreshed });
  } catch(e){ console.error('updateTask error', e); res.status(500).json({ message:'Error interno'}); }
};

export const listTasks = async (req, res) => {
  try {
    const { activo, limit, offset } = req.query;
    const tasks = await Tasks.listTasks({ activo, limit, offset });
    res.json({ data: tasks });
  } catch (e) { console.error('listTasks error', e); res.status(500).json({ message: 'Error interno' }); }
};

export const createOrReplaceSubmission = async (req, res) => {
  try {
    const { id_task, id_estudiante } = req.body;
    if (!id_task || !id_estudiante) return res.status(400).json({ message: 'id_task y id_estudiante obligatorios' });
    if (!req.file) return res.status(400).json({ message: 'Archivo PDF requerido (campo archivo)' });

    const task = await Tasks.getTask(id_task);
    if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });
    const est = await Estudiantes.getEstudianteById(id_estudiante);
    if (!est) return res.status(404).json({ message: 'Estudiante no encontrado' });

    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ message: 'Solo PDF permitido' });
    }
    if (req.file.size > 1.5 * 1024 * 1024) {
      return res.status(400).json({ message: 'PDF excede 1.5MB' });
    }

    // Si ya existe una entrega activa, crear versión y marcar la anterior como reemplazada
    const prev = await Subs.getLatestSubmission(id_task, id_estudiante);
    let newId;
    if (prev) {
      newId = await Subs.versionSubmission(prev.id, {
        id_task,
        id_estudiante,
        archivo: `/public/${req.file.filename}`,
        original_nombre: req.file.originalname,
        mime_type: req.file.mimetype,
        tamano: req.file.size,
        puntos: task.puntos || 10,
      });
    } else {
      newId = await Subs.createSubmission({
        id_task,
        id_estudiante,
        archivo: `/public/${req.file.filename}`,
        original_nombre: req.file.originalname,
        mime_type: req.file.mimetype,
        tamano: req.file.size,
        puntos: task.puntos || 10,
        version: 1,
      });
    }

    const latest = await Subs.getSubmissionById(newId);
    
    // Crear notificación para el asesor asignado
    try {
      const AsesorNotifs = await import('../models/asesor_notifications.model.js');
      const asesorUserId = await AsesorNotifs.getAsesorUserIdByEstudianteId(id_estudiante);
      if (asesorUserId) {
        await AsesorNotifs.createNotification({
          asesor_user_id: asesorUserId,
          type: 'feedback_submission',
          title: 'Nueva entrega de Feedback',
          message: `${est.nombres} ${est.apellidos} entregó la tarea "${task.nombre}" del mes ${task.mes || 'N/A'}`,
          action_url: `/asesor/feedback/${id_estudiante}`,
          metadata: {
            submission_id: newId,
            task_id: id_task,
            estudiante_id: id_estudiante,
            task_nombre: task.nombre,
            mes: task.mes
          }
        }).catch(err => console.error('Error creando notificación de feedback:', err));
      }
    } catch (err) {
      console.error('Error al crear notificación de feedback:', err);
    }
    
    res.status(201).json({ data: latest });
  } catch (e) { console.error('createOrReplaceSubmission error', e); res.status(500).json({ message: 'Error interno' }); }
};

export const listSubmissionsByStudent = async (req, res) => {
  try {
    const { id_estudiante } = req.params;
    const { limit, offset } = req.query;
    const subs = await Subs.listSubmissionsByStudent(id_estudiante, { limit, offset });
    res.json({ data: subs });
  } catch (e) { console.error('listSubmissionsByStudent error', e); res.status(500).json({ message: 'Error interno' }); }
};

export const listSubmissionsByTask = async (req, res) => {
  try {
    const { id_task } = req.params;
    const { limit, offset } = req.query;
    const subs = await Subs.listSubmissionsByTask(id_task, { limit, offset });
    res.json({ data: subs });
  } catch (e) { console.error('listSubmissionsByTask error', e); res.status(500).json({ message: 'Error interno' }); }
};

export const updateSubmissionGrade = async (req, res) => {
  try {
    const { id } = req.params; const { puntos } = req.body;
    if (puntos === undefined) return res.status(400).json({ message:'puntos requerido'});
    const sub = await Subs.getSubmissionById(id);
    if(!sub) return res.status(404).json({ message:'Submission no encontrada'});
    await Subs.updateSubmissionGrade(id, puntos);
    const refreshed = await Subs.getSubmissionById(id);
    res.json({ data: refreshed });
  } catch(e){ console.error('updateSubmissionGrade error', e); res.status(500).json({ message:'Error interno'}); }
};

export const cancelSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const sub = await Subs.getSubmissionById(id);
    if(!sub) return res.status(404).json({ message:'Submission no encontrada'});
    // Si este registro es referenciado por otros (replaced_by), impedir borrar para no romper historial
    // Para simplificar, solo permitimos cancelar la última versión activa (la que no tiene replaced_by)
    if (sub.replaced_by) return res.status(400).json({ message:'No se puede cancelar una versión reemplazada' });
    // Reactivar la anterior si existe una versión previa que apuntaba a este id
    const prev = await Subs.getSubmissionByReplacedBy(id);
    if (prev) {
      // Quitar el replaced_by para volverla activa
      await Subs.setReplacedBy(prev.id, null);
    }
    await Subs.deleteSubmissionById(id);
    res.json({ message: 'Eliminada' });
  } catch(e){ console.error('cancelSubmission error', e); res.status(500).json({ message:'Error interno'}); }
};

// Notas de asesor por submission
export const getSubmissionNote = async (req, res) => {
  try {
    const { id } = req.params; // id = id_submission
    const sub = await Subs.getSubmissionById(id);
    if (!sub) return res.status(404).json({ message: 'Submission no encontrada' });
    const note = await Notes.getNoteBySubmissionId(id);
    res.json({ data: note });
  } catch (e) { console.error('getSubmissionNote error', e); res.status(500).json({ message: 'Error interno' }); }
};

export const upsertSubmissionNote = async (req, res) => {
  try {
    const { id } = req.params; // id = id_submission
    const { nota } = req.body;
    if (nota === undefined) return res.status(400).json({ message: 'nota requerida' });
    const sub = await Subs.getSubmissionById(id);
    if (!sub) return res.status(404).json({ message: 'Submission no encontrada' });
    // FUTURO: obtener id_asesor desde auth; por ahora null
    const saved = await Notes.upsertNote({ id_submission: Number(id), id_asesor: null, nota: String(nota).slice(0, 5000) });
    res.json({ data: saved });
  } catch (e) { console.error('upsertSubmissionNote error', e); res.status(500).json({ message: 'Error interno' }); }
};
