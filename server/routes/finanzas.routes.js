import { Router } from 'express';
import * as Ingresos from '../models/ingresos.model.js';
import * as GastosFijos from '../models/gastos_fijos.model.js';
import * as GastosVariables from '../models/gastos_variables.model.js';
import * as PlantillasFijos from '../models/gastos_fijos_plantillas.model.js';
import { runPlantillasJob } from '../jobs/plantillasAuto.js';
import { createEvent as calCreate, updateEvent as calUpdate } from '../controllers/calendar.controller.js';
import * as CalendarModel from '../models/calendar_events.model.js';
import * as Usuarios from '../models/usuarios.model.js';
import * as Presupuestos from '../models/presupuestos.model.js';
import * as PagosAsesores from '../models/pagos_asesores.model.js';

const router = Router();

// GET /api/finanzas/ingresos
router.get('/finanzas/ingresos', async (req, res) => {
  try {
  const { from, to, metodo, estatus, origen } = req.query || {};
  const data = await Ingresos.getIngresos({ from, to, metodo, estatus, origen });
    res.json({ data });
  } catch (err) {
    console.error('GET /finanzas/ingresos', err);
    res.status(500).json({ message: 'Error interno' });
  }
});

// GET /api/finanzas/ingresos/aggregates?by=month&from=...&to=...
router.get('/finanzas/ingresos/aggregates', async (req, res) => {
  try {
    const { by = 'month', from, to } = req.query || {};
    const data = await Ingresos.getAggregates({ by, from, to });
    res.json({ data });
  } catch (err) {
    console.error('GET /finanzas/ingresos/aggregates', err);
    res.status(500).json({ message: 'Error interno' });
  }
});

// POST /api/finanzas/ingresos
router.post('/finanzas/ingresos', async (req, res) => {
  try {
    const body = req.body || {};
    // Validaciones mínimas
    if (!body.curso || !body.fecha || !body.metodo || body.importe === undefined) {
      return res.status(400).json({ message: 'Campos obligatorios: curso, fecha, metodo, importe' });
    }
    // Si es manual (sin comprobante y sin estudiante_id), exigir alumno_nombre
    const isManual = !body.comprobante_id && !body.estudiante_id;
    if (isManual && !body.alumno_nombre) {
      return res.status(400).json({ message: 'alumno_nombre es requerido para registros manuales' });
    }
    const created = await Ingresos.createIngreso(body);
    res.status(201).json({ ingreso: created });
  } catch (err) {
    console.error('POST /finanzas/ingresos', err);
    res.status(500).json({ message: 'Error interno' });
  }
});

// PUT /api/finanzas/ingresos/:id
router.put('/finanzas/ingresos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const updated = await Ingresos.updateIngreso(Number(id), body);
    if (!updated) return res.status(404).json({ message: 'No encontrado' });

    // Sync con calendario si aplica
    try {
      const userId = req.user?.id; // puede no existir si esta ruta no usa auth
      const titulo = body.curso && body.alumno_nombre ? `Inicio ${body.curso} - ${body.alumno_nombre}` : undefined;
      const descripcion = body.descripcion || undefined;
      if (updated.calendar_event_id) {
        const payload = {};
        if (body.fecha) payload.fecha = body.fecha;
        if (body.hora) payload.hora = body.hora;
        if (titulo) payload.titulo = titulo;
        if (descripcion) payload.descripcion = descripcion;
        if (Object.keys(payload).length) {
          await CalendarModel.updateEvent(updated.calendar_event_id, userId || updated.user_id || 0, payload);
        }
      } else if ((body.fecha || body.hora || body.descripcion || body.estatus || body.curso) && userId) {
        const ev = await CalendarModel.createEvent(userId, {
          titulo: titulo || `Inicio ${updated.curso} - ${updated.alumno_nombre || ''}`.trim(),
          descripcion: descripcion || null,
          fecha: body.fecha || updated.fecha,
          hora: body.hora || updated.hora || '09:00',
          tipo: 'trabajo',
          prioridad: 'media',
          recordar_minutos: 30,
          completado: 0,
        });
        await Ingresos.updateIngreso(Number(id), { calendar_event_id: ev.id });
      }
    } catch (e) {
      console.warn('No se pudo sincronizar con calendario:', e?.message || e);
    }

    return res.json({ ingreso: updated });
  } catch (err) {
    console.error('PUT /finanzas/ingresos/:id', err);
    res.status(500).json({ message: 'Error interno' });
  }
});

// DELETE /api/finanzas/ingresos/:id
router.delete('/finanzas/ingresos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ingreso = await Ingresos.getIngresoById(Number(id));
    if (!ingreso) return res.status(404).json({ message: 'No encontrado' });

    // Borrar evento de calendario si existe y tenemos userId
    try {
      const userId = req.user?.id || ingreso.user_id || null;
      if (ingreso.calendar_event_id && userId) {
        await CalendarModel.deleteEvent(ingreso.calendar_event_id, userId);
      }
    } catch (e) {
      console.warn('No se pudo eliminar el evento de calendario vinculado:', e?.message || e);
    }

    const ok = await Ingresos.deleteIngreso(Number(id));
    if (!ok) return res.status(404).json({ message: 'No encontrado' });
    return res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /finanzas/ingresos/:id', err);
    res.status(500).json({ message: 'Error interno' });
  }
});

// GASTOS FIJOS
router.get('/finanzas/gastos-fijos', async (req, res) => {
  try {
    const { from, to, metodo, estatus, frecuencia } = req.query || {};
    const data = await GastosFijos.list({ from, to, metodo, estatus, frecuencia });
    res.json({ data });
  } catch (err) {
    console.error('GET /finanzas/gastos-fijos', err);
    res.status(500).json({ message: 'Error interno' });
  }
});

router.post('/finanzas/gastos-fijos', async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.fecha || !body.categoria || body.importe === undefined) {
      return res.status(400).json({ message: 'Campos obligatorios: fecha, categoria, importe' });
    }
    const created = await GastosFijos.create(body);
    res.status(201).json({ gasto: created });
  } catch (err) {
    console.error('POST /finanzas/gastos-fijos', err);
    res.status(500).json({ message: 'Error interno' });
  }
});

router.put('/finanzas/gastos-fijos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await GastosFijos.update(Number(id), req.body || {});
    if (!updated) return res.status(404).json({ message: 'No encontrado' });
    res.json({ gasto: updated });
  } catch (err) {
    console.error('PUT /finanzas/gastos-fijos/:id', err);
    res.status(500).json({ message: 'Error interno' });
  }
});

router.delete('/finanzas/gastos-fijos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ok = await GastosFijos.remove(Number(id));
    if (!ok) return res.status(404).json({ message: 'No encontrado' });
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /finanzas/gastos-fijos/:id', err);
    res.status(500).json({ message: 'Error interno' });
  }
});

// GASTOS VARIABLES
router.get('/finanzas/gastos-variables', async (req, res) => {
  try {
    const { metodo, estatus } = req.query || {};
    const data = await GastosVariables.list({ metodo, estatus });
    res.json({ data });
  } catch (err) {
    console.error('GET /finanzas/gastos-variables', err);
    res.status(500).json({ message: 'Error interno' });
  }
});

router.post('/finanzas/gastos-variables', async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.producto || body.importe === undefined) {
      return res.status(400).json({ message: 'Campos obligatorios: producto, importe' });
    }
    const created = await GastosVariables.create(body);
    res.status(201).json({ gasto: created });
  } catch (err) {
    console.error('POST /finanzas/gastos-variables', err);
    res.status(500).json({ message: 'Error interno' });
  }
});

router.put('/finanzas/gastos-variables/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await GastosVariables.update(Number(id), req.body || {});
    if (!updated) return res.status(404).json({ message: 'No encontrado' });
    res.json({ gasto: updated });
  } catch (err) {
    console.error('PUT /finanzas/gastos-variables/:id', err);
    res.status(500).json({ message: 'Error interno' });
  }
});

router.delete('/finanzas/gastos-variables/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ok = await GastosVariables.remove(Number(id));
    if (!ok) return res.status(404).json({ message: 'No encontrado' });
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /finanzas/gastos-variables/:id', err);
    res.status(500).json({ message: 'Error interno' });
  }
});

// PRESUPUESTOS
router.get('/finanzas/presupuestos', async (req, res) => {
  try {
    const data = await Presupuestos.list();
    res.json({ data });
  } catch (err) {
    console.error('GET /finanzas/presupuestos', err);
    res.status(500).json({ message: 'Error interno' });
  }
});

// GASTOS FIJOS - PLANTILLAS (semi-fijos)
router.get('/finanzas/gastos-fijos/plantillas', async (req, res) => {
  try {
    const { activo } = req.query || {};
    const data = await PlantillasFijos.list({ activo });
    res.json({ data });
  } catch (err) {
    console.error('GET /finanzas/gastos-fijos/plantillas', err);
    res.status(500).json({ message: 'Error interno' });
  }
});

router.post('/finanzas/gastos-fijos/plantillas', async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.categoria) return res.status(400).json({ message: 'categoria requerida' });
    const saved = await PlantillasFijos.create(body);
    res.status(201).json({ plantilla: saved });
  } catch (err) {
    console.error('POST /finanzas/gastos-fijos/plantillas', err);
    res.status(500).json({ message: 'Error interno' });
  }
});

router.put('/finanzas/gastos-fijos/plantillas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await PlantillasFijos.update(Number(id), req.body || {});
    if (!updated) return res.status(404).json({ message: 'No encontrado' });
    res.json({ plantilla: updated });
  } catch (err) {
    console.error('PUT /finanzas/gastos-fijos/plantillas/:id', err);
    res.status(500).json({ message: 'Error interno' });
  }
});

router.delete('/finanzas/gastos-fijos/plantillas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ok = await PlantillasFijos.remove(Number(id));
    if (!ok) return res.status(404).json({ message: 'No encontrado' });
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /finanzas/gastos-fijos/plantillas/:id', err);
    res.status(500).json({ message: 'Error interno' });
  }
});

// Crear un gasto fijo a partir de una plantilla (el usuario decide si pagado o pendiente)
router.post('/finanzas/gastos-fijos/plantillas/:id/instanciar', async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha, hora=null, estatus='Pendiente' } = req.body || {};
    const payload = await PlantillasFijos.instantiateToGastoFijo(Number(id), { fecha, hora, estatus });
    if (!payload) return res.status(404).json({ message: 'Plantilla no encontrada' });
    const created = await GastosFijos.create(payload);
    res.status(201).json({ gasto: created });
  } catch (err) {
    console.error('POST /finanzas/gastos-fijos/plantillas/:id/instanciar', err);
    res.status(500).json({ message: 'Error interno' });
  }
});

// Job manual: generar egresos pendientes y eventos para plantillas con auto_instanciar/auto_evento que correspondan a una fecha dada (default: hoy)
router.post('/finanzas/gastos-fijos/plantillas/job/run', async (req, res) => {
  try {
    const { fecha, debug } = req.body || {};
    const target = fecha || new Date();
    const result = await runPlantillasJob(target, { debug });
    res.json({ ok: true, fecha: typeof target === 'string' ? target : new Date(target).toISOString().slice(0,10), ...result });
  } catch (err) {
    console.error('POST /finanzas/gastos-fijos/plantillas/job/run', err);
    res.status(500).json({ message: 'Error interno', error: err.message });
  }
});

router.post('/finanzas/presupuestos', async (req, res) => {
  try {
    const { mes, monto } = req.body || {};
    if (!mes || !/^\d{4}-\d{2}$/.test(mes)) return res.status(400).json({ message: 'mes inválido (YYYY-MM)' });
    if (monto === undefined) return res.status(400).json({ message: 'monto requerido' });
    const saved = await Presupuestos.upsert({ mes, monto: Number(monto) });
    res.status(201).json({ presupuesto: saved });
  } catch (err) {
    console.error('POST /finanzas/presupuestos', err);
    res.status(500).json({ message: 'Error interno' });
  }
});

router.delete('/finanzas/presupuestos/:mes', async (req, res) => {
  try {
    const { mes } = req.params;
    const ok = await Presupuestos.remove(mes);
    if (!ok) return res.status(404).json({ message: 'No encontrado' });
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /finanzas/presupuestos/:mes', err);
    res.status(500).json({ message: 'Error interno' });
  }
});

router.get('/finanzas/egresos/resumen-mensual', async (req, res) => {
  try {
    const { mes } = req.query || {};
    const data = await Presupuestos.getMonthlySummary(mes);
    res.json({ data });
  } catch (err) {
    console.error('GET /finanzas/egresos/resumen-mensual', err);
    res.status(500).json({ message: 'Error interno' });
  }
});

// DEBUG (solo dev): crear y listar eventos de calendario sin auth para verificar integración
router.post('/finanzas/_debug/calendar/events', async (req, res) => {
  try {
    const body = req.body || {};
    let userId = Number(body.userId);
    if (!userId || Number.isNaN(userId)) {
      userId = await Usuarios.getFirstAdminId();
      if (!userId) return res.status(400).json({ message: 'No existe usuario admin para asociar el evento' });
    }
    const created = await CalendarModel.createEvent(userId, {
      titulo: body.titulo || 'Debug Event',
      descripcion: body.descripcion || null,
      fecha: body.fecha || new Date().toISOString().slice(0,10),
      hora: body.hora || '09:00',
      tipo: body.tipo || 'debug',
      prioridad: body.prioridad || 'media',
      recordar_minutos: Number.isInteger(body.recordar_minutos) ? body.recordar_minutos : 15,
      completado: body.completado ? 1 : 0,
    });
    res.status(201).json({ event: created });
  } catch (err) {
  console.error('POST /finanzas/_debug/calendar/events', err);
  res.status(500).json({ message: 'Error interno', error: err?.message || String(err), code: err?.code });
  }
});

router.get('/finanzas/_debug/calendar/events', async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query || {};
    const uid = Number(userId) || 1;
    const start = startDate || new Date().toISOString().slice(0,10);
    const end = endDate || start;
    const events = await CalendarModel.getEventsByUserAndRange(uid, start, end);
    res.json({ data: events });
  } catch (err) {
    console.error('GET /finanzas/_debug/calendar/events', err);
    res.status(500).json({ message: 'Error interno' });
  }
});

router.get('/finanzas/_debug/admin/first-id', async (_req, res) => {
  try {
    const id = await Usuarios.getFirstAdminId();
    if (!id) return res.status(404).json({ message: 'No hay admin' });
    res.json({ id });
  } catch (err) {
    console.error('GET /finanzas/_debug/admin/first-id', err);
    res.status(500).json({ message: 'Error interno' });
  }
});

// Pagos a Asesores
router.get('/finanzas/pagos-asesores', async (req, res) => {
  try {
    const { asesor_id, from, to, status } = req.query || {};
    const data = await PagosAsesores.list({ asesor_id, from, to, status });
    res.json({ data });
  } catch (err) {
    console.error('GET /finanzas/pagos-asesores', err);
    res.status(500).json({ message: 'Error interno' });
  }
});

router.post('/finanzas/pagos-asesores', async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.tipo_servicio || !body.fecha_pago) {
      return res.status(400).json({ message: 'Campos obligatorios: tipo_servicio, fecha_pago' });
    }
    // ingreso_final por defecto = (monto_base + honorarios_comision) si no viene
    if (body.ingreso_final === undefined) {
      const base = Number(body.monto_base || 0);
      const hon = Number(body.honorarios_comision || 0);
      body.ingreso_final = base + hon;
    }
    const created = await PagosAsesores.create(body);
    
    // Crear notificación para el asesor si tiene usuario_id
    if (created.asesor_preregistro_id) {
      try {
        const AsesorPerfiles = await import('../models/asesor_perfiles.model.js');
        const AsesorNotifs = await import('../models/asesor_notifications.model.js');
        const perfil = await AsesorPerfiles.getByPreRegistro(created.asesor_preregistro_id);
        if (perfil?.usuario_id) {
          await AsesorNotifs.createNotification({
            asesor_user_id: perfil.usuario_id,
            type: 'payment',
            title: 'Nuevo pago registrado',
            message: `Se registró un pago de $${created.ingreso_final?.toLocaleString('es-MX') || 0} por ${created.tipo_servicio || 'servicio'}`,
            action_url: '/asesor/mis-pagos',
            metadata: {
              pago_id: created.id,
              tipo_servicio: created.tipo_servicio,
              ingreso_final: created.ingreso_final,
              fecha_pago: created.fecha_pago,
              status: created.status
            }
          }).catch(err => console.error('Error creando notificación de pago:', err));
        }
      } catch (err) {
        console.error('Error al crear notificación de pago:', err);
      }
    }
    
    res.status(201).json({ pago: created });
  } catch (err) {
    console.error('POST /finanzas/pagos-asesores', err);
    res.status(500).json({ message: 'Error interno' });
  }
});

router.put('/finanzas/pagos-asesores/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await PagosAsesores.update(Number(id), req.body || {});
    if (!updated) return res.status(404).json({ message: 'No encontrado' });
    res.json({ pago: updated });
  } catch (err) {
    console.error('PUT /finanzas/pagos-asesores/:id', err);
    res.status(500).json({ message: 'Error interno' });
  }
});

router.delete('/finanzas/pagos-asesores/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ok = await PagosAsesores.remove(Number(id));
    if (!ok) return res.status(404).json({ message: 'No encontrado' });
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /finanzas/pagos-asesores/:id', err);
    res.status(500).json({ message: 'Error interno' });
  }
});

export default router;
