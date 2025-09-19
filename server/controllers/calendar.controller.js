import * as Calendar from "../models/calendar_events.model.js";
import * as Usuarios from "../models/usuarios.model.js";
import * as Ingresos from "../models/ingresos.model.js";
import * as GastosFijos from "../models/gastos_fijos.model.js";
import * as GastosVariables from "../models/gastos_variables.model.js";

export const listEvents = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const user = await Usuarios.getUsuarioPorid(userId);
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

    const { startDate, endDate } = req.query || {};
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate y endDate son obligatorios (YYYY-MM-DD)' });
    }

    const events = await Calendar.getEventsByUserAndRange(userId, startDate, endDate);
    // map DB -> UI shape
    const mapped = events.map(e => ({
      id: e.id,
      titulo: e.titulo,
      descripcion: e.descripcion,
      fecha: e.fecha ? new Date(e.fecha).toISOString().split('T')[0] : null,
      hora: e.hora || null,
      tipo: e.tipo || 'personal',
      prioridad: e.prioridad || 'media',
      recordarMinutos: e.recordar_minutos ?? 15,
      completado: e.completado === 1
    }));
    return res.status(200).json(mapped);
  } catch (e) {
    console.error('listEvents error:', e);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const createEvent = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const user = await Usuarios.getUsuarioPorid(userId);
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

    const body = req.body || {};
    if (!body.titulo || !body.fecha || !body.hora) {
      return res.status(400).json({ message: 'titulo, fecha y hora son obligatorios' });
    }

    // map UI -> DB shape
    const created = await Calendar.createEvent(userId, {
      titulo: body.titulo,
      descripcion: body.descripcion || null,
      fecha: body.fecha,
      hora: body.hora,
      tipo: body.tipo || 'personal',
      prioridad: body.prioridad || 'media',
      recordar_minutos: Number.isInteger(body.recordarMinutos) ? body.recordarMinutos : 15,
      completado: body.completado ? 1 : 0
    });

    const mapped = {
      id: created.id,
      titulo: created.titulo,
      descripcion: created.descripcion,
      fecha: created.fecha ? new Date(created.fecha).toISOString().split('T')[0] : null,
      hora: created.hora,
      tipo: created.tipo,
      prioridad: created.prioridad,
      recordarMinutos: created.recordar_minutos,
      completado: created.completado === 1,
    };

    return res.status(201).json(mapped);
  } catch (e) {
    console.error('createEvent error:', e);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const user = await Usuarios.getUsuarioPorid(userId);
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

    const { id } = req.params;
    const body = req.body || {};

    // map UI -> DB keys
    const payload = { ...body };
    if (Object.prototype.hasOwnProperty.call(body, 'recordarMinutos')) {
      payload.recordar_minutos = Number.isInteger(body.recordarMinutos) ? body.recordarMinutos : 15;
      delete payload.recordarMinutos;
    }

    const updated = await Calendar.updateEvent(Number(id), userId, payload);
    if (!updated) return res.status(404).json({ message: 'No encontrado' });

    const mapped = {
      id: updated.id,
      titulo: updated.titulo,
      descripcion: updated.descripcion,
      fecha: updated.fecha ? new Date(updated.fecha).toISOString().split('T')[0] : null,
      hora: updated.hora,
      tipo: updated.tipo,
      prioridad: updated.prioridad,
      recordarMinutos: updated.recordar_minutos,
      completado: updated.completado === 1,
    };

    return res.status(200).json(mapped);
  } catch (e) {
    console.error('updateEvent error:', e);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const user = await Usuarios.getUsuarioPorid(userId);
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

    const { id } = req.params;
    // Si el evento está vinculado a un ingreso/gasto, bloquear la eliminación directa
    try {
      const ingreso = await Ingresos.getIngresoByCalendarEventId(Number(id));
      if (ingreso) {
        return res.status(409).json({ message: 'Este evento está vinculado a un ingreso. Bórralo desde Ingresos.' });
      }
      const gastoF = await GastosFijos.getByCalendarEventId(Number(id));
      if (gastoF) {
        return res.status(409).json({ message: 'Este evento está vinculado a un gasto fijo. Bórralo desde Gastos fijos.' });
      }
      const gastoV = await GastosVariables.getByCalendarEventId(Number(id));
      if (gastoV) {
        return res.status(409).json({ message: 'Este evento está vinculado a un gasto variable. Bórralo desde Gastos variables.' });
      }
    } catch {}
    const ok = await Calendar.deleteEvent(Number(id), userId);
    if (!ok) return res.status(404).json({ message: 'No encontrado' });
    return res.sendStatus(204);
  } catch (e) {
    console.error('deleteEvent error:', e);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};
