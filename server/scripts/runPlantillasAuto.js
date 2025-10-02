import * as PlantillasFijos from '../models/gastos_fijos_plantillas.model.js';
import * as GastosFijos from '../models/gastos_fijos.model.js';
import * as Usuarios from '../models/usuarios.model.js';
import * as CalendarModel from '../models/calendar_events.model.js';

/**
 * Ejecuta la lógica de auto-instanciación de plantillas para una fecha dada.
 * @param {string} fecha YYYY-MM-DD (local) – si no se pasa usa hoy (local) 
 * @returns {Promise<Array>} lista de gastos creados o reutilizados
 */
export async function runPlantillasAuto(fecha) {
  // Normalizar fecha local si no se pasa
  if (!fecha) {
    const d = new Date();
    const local = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    fecha = local.toISOString().slice(0,10); // mantiene día local
  }
  const all = await PlantillasFijos.list({ activo: 1 });
  const creados = [];
  for (const p of all) {
    try {
      if (!p.auto_instanciar) continue;
      if (!p.dia_pago) continue; // requiere dia_pago definido
      if (p.fecha_inicio && String(fecha) < String(p.fecha_inicio)) continue; // respetar inicio

      const targetDay = Number(String(fecha).slice(8,10));
      if (targetDay !== Number(p.dia_pago)) continue; // solo el día exacto

      const freq = String(p.frecuencia || 'Mensual');
      const stepBy = (f) => (f==='Bimestral'?2: f==='Semestral'?6: f==='Anual'?12: 1);
      const step = stepBy(freq);
      if (step > 1) {
        const [yy, mm] = String(fecha).split('-').map(Number);
        const anchor = p.cadencia_anchor ? new Date(p.cadencia_anchor) : (p.created_at ? new Date(p.created_at) : new Date(yy, mm-1, 1));
        const monthsDiff = (yy - anchor.getFullYear())*12 + ((mm-1) - anchor.getMonth());
        if (monthsDiff < 0 || (monthsDiff % step) !== 0) continue;
      }
      // Idempotencia
      const existing = await GastosFijos.findByPlantillaAndDate(p.id, fecha);
      let created;
      if (existing) {
        created = existing;
      } else {
        const payload = await PlantillasFijos.instantiateToGastoFijo(p.id, { fecha, estatus: 'Pendiente' });
        created = await GastosFijos.create(payload);
      }
      // Evento calendario si aplica
      try {
        if (p.auto_evento) {
          const hora = p.hora_preferida || '09:00';
          const adminId = await Usuarios.getFirstAdminId() || 1;
          if (!created.calendar_event_id) {
            const ev = await CalendarModel.createEvent(adminId, {
              titulo: `Pagar ${created.categoria}`,
              descripcion: `Proveedor: ${created.proveedor || '-'} | Monto: ${created.importe} | Auto-instanciado` ,
              fecha,
              hora,
              tipo: 'finanzas',
              prioridad: 'media',
              recordar_minutos: Number(p.recordar_minutos)||30,
              completado: 0,
            });
            await GastosFijos.update(created.id, { calendar_event_id: ev.id });
            created.calendar_event_id = ev.id;
          }
        }
      } catch (e) {
        console.warn('runPlantillasAuto evento', e?.message || e);
      }
      creados.push(created);
    } catch (e) {
      console.warn('runPlantillasAuto plantilla error', p.id, e?.message || e);
    }
  }
  return creados;
}

// Permitir ejecutar manual desde CLI: node scripts/runPlantillasAuto.js 2025-09-12
if (import.meta.url === `file://${process.argv[1]}`) {
  const fechaArg = process.argv[2];
  runPlantillasAuto(fechaArg).then(r => {
    console.log('[runPlantillasAuto] creados:', r.length);
    process.exit(0);
  }).catch(err => {
    console.error('[runPlantillasAuto] error:', err);
    process.exit(1);
  });
}
