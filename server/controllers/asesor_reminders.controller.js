import * as Usuarios from '../models/usuarios.model.js';
import * as AsesorReminders from '../models/asesor_reminders.model.js';
import * as StudentReminders from '../models/student_reminders.model.js';
import * as AsesorPerfiles from '../models/asesor_perfiles.model.js';
import db from '../db.js';

// Asegurar que las tablas existan al cargar el módulo
AsesorReminders.ensureTable().catch(err => {
  console.error('Error inicializando tabla asesor_reminders:', err?.code || err?.message || err);
  if (err?.code === 'ETIMEDOUT') {
    console.error('[DB] ⚠️  No se puede conectar a MySQL. Verifica que el servidor MySQL esté corriendo.');
  }
});

/**
 * Resolver ID de asesor desde user ID
 */
async function resolveAsesorUserId(userId) {
  const user = await Usuarios.getUsuarioPorid(userId).catch(() => null);
  if (!user || user.role !== 'asesor') return null;
  return user.id;
}

/**
 * Listar recordatorios personales del asesor
 */
export const listPersonal = async (req, res) => {
  try {
    const asesorUserId = await resolveAsesorUserId(req.user.id);
    if (!asesorUserId) return res.status(403).json({ message: 'Solo asesores' });

    const reminders = await AsesorReminders.listByAsesor(asesorUserId);
    res.json({ data: reminders });
  } catch (e) {
    console.error('asesor_reminders listPersonal error:', e);
    res.status(500).json({ message: 'Error interno' });
  }
};

/**
 * Crear recordatorio personal del asesor
 */
export const createPersonal = async (req, res) => {
  try {
    const asesorUserId = await resolveAsesorUserId(req.user.id);
    if (!asesorUserId) return res.status(403).json({ message: 'Solo asesores' });

    const { title, description, date, time, category, priority } = req.body || {};
    if (!title || !date) return res.status(400).json({ message: 'title y date son obligatorios' });

    const pr = ['red', 'orange', 'amber', 'green', 'blue', 'violet'];
    const p = pr.includes(priority) ? priority : 'blue';

    const created = await AsesorReminders.create(asesorUserId, {
      title,
      description,
      date,
      time: time || null,
      category: category || 'recordatorio',
      priority: p
    });

    res.status(201).json({ data: created });
  } catch (e) {
    console.error('asesor_reminders createPersonal error:', e);
    res.status(500).json({ message: 'Error interno' });
  }
};

/**
 * Actualizar recordatorio personal del asesor
 */
export const updatePersonal = async (req, res) => {
  try {
    const asesorUserId = await resolveAsesorUserId(req.user.id);
    if (!asesorUserId) return res.status(403).json({ message: 'Solo asesores' });

    const { id } = req.params;
    const ok = await AsesorReminders.update(Number(id), asesorUserId, req.body || {});
    if (!ok) return res.status(404).json({ message: 'No encontrado' });

    res.json({ ok: true });
  } catch (e) {
    console.error('asesor_reminders updatePersonal error:', e);
    res.status(500).json({ message: 'Error interno' });
  }
};

/**
 * Eliminar recordatorio personal del asesor
 */
export const deletePersonal = async (req, res) => {
  try {
    const asesorUserId = await resolveAsesorUserId(req.user.id);
    if (!asesorUserId) return res.status(403).json({ message: 'Solo asesores' });

    const { id } = req.params;
    const ok = await AsesorReminders.remove(Number(id), asesorUserId);
    if (!ok) return res.status(404).json({ message: 'No encontrado' });

    res.sendStatus(204);
  } catch (e) {
    console.error('asesor_reminders deletePersonal error:', e);
    res.status(500).json({ message: 'Error interno' });
  }
};

/**
 * Crear recordatorio para estudiantes (individual o masivamente por grupo)
 */
export const createForStudents = async (req, res) => {
  try {
    const asesorUserId = await resolveAsesorUserId(req.user.id);
    if (!asesorUserId) return res.status(403).json({ message: 'Solo asesores' });

    const { title, description, date, priority, category, studentIds, grupo } = req.body || {};
    if (!title || !date) return res.status(400).json({ message: 'title y date son obligatorios' });

    // Si se especifica grupo, obtener todos los estudiantes de ese grupo
    let targetStudentIds = [];
    if (grupo) {
      // Obtener perfil del asesor para verificar que tiene acceso al grupo
      const perfil = await AsesorPerfiles.getByUserId(asesorUserId).catch(() => null);
      const gruposArr = perfil?.grupos_asesor || (perfil?.grupo_asesor ? [perfil.grupo_asesor] : []);

      if (!gruposArr.includes(grupo)) {
        return res.status(403).json({ message: 'No tienes acceso a este grupo' });
      }

      // Obtener nombre completo del asesor
      const [asesorRows] = await db.query(
        `SELECT ap.nombres, ap.apellidos 
         FROM asesor_perfiles apf
         INNER JOIN asesor_preregistros ap ON ap.id = apf.preregistro_id
         WHERE apf.usuario_id = ?
         LIMIT 1`,
        [asesorUserId]
      );

      if (!asesorRows || asesorRows.length === 0) {
        return res.status(403).json({ message: 'No se encontró el perfil del asesor' });
      }

      const asesorNombre = null; // No longer strictly required for query if grouped correctly

      // Obtener estudiantes del grupo asignados al asesor
      const [rows] = await db.query(
        `SELECT e.id 
         FROM estudiantes e
         LEFT JOIN soft_deletes sd ON sd.id_estudiante = e.id
         WHERE e.grupo = ? 
           AND e.verificacion = 2
           AND sd.id IS NULL
         ORDER BY e.id`,
        [grupo]
      );

      targetStudentIds = rows.map(r => r.id);
    } else if (studentIds && Array.isArray(studentIds) && studentIds.length > 0) {
      // Verificar que los estudiantes pertenecen al asesor
      const perfil = await AsesorPerfiles.getByUserId(asesorUserId).catch(() => null);
      const gruposArr = perfil?.grupos_asesor || (perfil?.grupo_asesor ? [perfil.grupo_asesor] : []);

      if (gruposArr.length === 0) {
        return res.status(403).json({ message: 'No tienes grupos asignados' });
      }

      // Obtener nombre completo del asesor
      const [asesorRows] = await db.query(
        `SELECT ap.nombres, ap.apellidos 
         FROM asesor_perfiles apf
         INNER JOIN asesor_preregistros ap ON ap.id = apf.preregistro_id
         WHERE apf.usuario_id = ?
         LIMIT 1`,
        [asesorUserId]
      );

      if (!asesorRows || asesorRows.length === 0) {
        return res.status(403).json({ message: 'No se encontró el perfil del asesor' });
      }

      const asesorNombre = null; // No longer strictly required for query

      // Verificar que los estudiantes pertenecen a los grupos del asesor
      const placeholders = studentIds.map(() => '?').join(',');
      const gruposPlaceholders = gruposArr.map(() => '?').join(',');
      const [rows] = await db.query(
        `SELECT e.id 
         FROM estudiantes e
         LEFT JOIN soft_deletes sd ON sd.id_estudiante = e.id
         WHERE e.id IN (${placeholders})
           AND e.grupo IN (${gruposPlaceholders})
           AND e.verificacion = 2
           AND sd.id IS NULL`,
        [...studentIds, ...gruposArr]
      );

      targetStudentIds = rows.map(r => r.id);
    } else {
      return res.status(400).json({ message: 'Debes especificar studentIds o grupo' });
    }

    if (targetStudentIds.length === 0) {
      return res.status(400).json({ message: 'No se encontraron estudiantes válidos' });
    }

    const pr = ['red', 'orange', 'amber', 'green', 'blue', 'violet'];
    const p = pr.includes(priority) ? priority : 'blue';

    const result = await StudentReminders.createForStudents(targetStudentIds, {
      title,
      description,
      date,
      priority: p,
      category: category || 'recordatorio',
      asesor_user_id: asesorUserId
    });

    res.status(201).json({
      data: {
        inserted: result.inserted,
        firstId: result.firstId,
        studentsAffected: targetStudentIds.length
      }
    });
  } catch (e) {
    console.error('asesor_reminders createForStudents error:', e);
    res.status(500).json({ message: 'Error interno' });
  }
};

/**
 * Listar recordatorios creados por el asesor para estudiantes
 */
export const listForStudents = async (req, res) => {
  try {
    const asesorUserId = await resolveAsesorUserId(req.user.id);
    if (!asesorUserId) return res.status(403).json({ message: 'Solo asesores' });

    const reminders = await StudentReminders.listByAsesor(asesorUserId);
    res.json({ data: reminders });
  } catch (e) {
    console.error('asesor_reminders listForStudents error:', e);
    res.status(500).json({ message: 'Error interno' });
  }
};

/**
 * Eliminar recordatorio enviado a estudiantes (broadcast)
 * Se identifica por un ID de instancia, pero elimina todas las copias del mismo recordatorio
 */
export const deleteForStudents = async (req, res) => {
  try {
    const asesorUserId = await resolveAsesorUserId(req.user.id);
    if (!asesorUserId) return res.status(403).json({ message: 'Solo asesores' });

    const { id } = req.params;

    // Primero obtenemos los datos del recordatorio para identificarlo
    const [reminderRows] = await db.query(
      'SELECT title, date, description FROM student_reminders WHERE id = ? AND asesor_user_id = ?',
      [id, asesorUserId]
    );

    if (!reminderRows || reminderRows.length === 0) {
      return res.status(404).json({ message: 'Recordatorio no encontrado o no eres el autor' });
    }

    const { title, date, description } = reminderRows[0];

    // Formatear fecha para el modelo (DATE_FORMAT en query anterior lo devuelve como YYYY-MM-DD si es DATE)
    // Pero si es DATE, JS lo devuelve como objeto Date o string ISO.
    // Vamos a usar la fecha directamente del objeto.

    const ok = await StudentReminders.removeBroadcast(asesorUserId, title, date, description);
    if (!ok) return res.status(404).json({ message: 'No se pudo eliminar' });

    res.sendStatus(204);
  } catch (e) {
    console.error('asesor_reminders deleteForStudents error:', e);
    res.status(500).json({ message: 'Error interno' });
  }
};

