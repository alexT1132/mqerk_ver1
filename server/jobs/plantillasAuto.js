import cron from 'node-cron';
import { pool } from '../db.js';
import dayjs from 'dayjs';
import 'dayjs/locale/es.js';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import dotenv from 'dotenv';
dotenv.config();

// Configurar dayjs con timezone (México). Acepta override via ENV TZ (ej: America/Mexico_City)
dayjs.extend(utc);
dayjs.extend(timezone);
const TZ = process.env.TZ || 'America/Mexico_City';

/**
 * Ejecuta la lógica de instanciar plantillas de gastos fijos para la fecha dada.
 * Mantiene idempotencia: no duplica si ya existe gasto para plantilla en fecha.
 * @param {string|Date} fechaTarget - Fecha base (YYYY-MM-DD) que se evaluará como "hoy".
 * @param {object} [opts]
 * @param {boolean} [opts.debug=false] - Si true, registra información adicional.
 * @returns {Promise<{created:number, skipped:number, details:Array}>}
 */
export async function runPlantillasJob(fechaTarget, opts = {}) {
  const debug = !!opts.debug;
  const hoy = dayjs(fechaTarget).tz(TZ).startOf('day');
  const fechaISO = hoy.format('YYYY-MM-DD');

  const conn = await pool.getConnection();
  try {
    // Traemos todas las plantillas auto activas cuyo periodo ya inició y no ha terminado.
    // Aplicamos la lógica de frecuencia en JS porque el SQL original no consideraba 'frecuencia'
    // ni el fallback de dia_pago desde fecha_inicio.
    const [plantillas] = await conn.query(`
      SELECT * FROM gastos_fijos_plantillas
      WHERE auto_instanciar = 1
        AND activo = 1
        AND (fecha_inicio IS NULL OR fecha_inicio <= ?)
        AND (fecha_fin IS NULL OR fecha_fin >= ?)
    `, [fechaISO, fechaISO]);

    if (debug) console.log(`[plantillasAuto] ${plantillas.length} plantillas cargadas para evaluar (${fechaISO})`);
    if (!plantillas.length) return { created: 0, skipped: 0, details: [] };

    let created = 0;
    let skipped = 0;
    const details = [];

    for (const p of plantillas) {
      try {
        if (!shouldInstantiateToday(p, hoy)) {
          skipped++;
          if (debug) details.push({ plantilla_id: p.id, action: 'skip-no-schedule' });
          continue;
        }
        // Idempotencia: ¿ya existe gasto para esta plantilla hoy?
        const [existe] = await conn.query(
          'SELECT id FROM gastos_fijos WHERE plantilla_id = ? AND fecha = ? LIMIT 1',
          [p.id, fechaISO]
        );
        if (existe.length) {
          skipped++;
            details.push({ plantilla_id: p.id, action: 'skip-existing' });
          continue;
        }
        const estatus = p.auto_marcar_pagado ? 'Pagado' : 'Pendiente';
        const insertData = {
          plantilla_id: p.id,
          categoria: p.categoria,
          descripcion: p.descripcion,
          proveedor: p.proveedor,
          frecuencia: p.frecuencia || 'Mensual',
          metodo: p.metodo || 'Efectivo',
          importe: Number(p.monto_sugerido || 0),
          fecha: fechaISO,
          hora: p.hora_preferida || '00:00:00',
          estatus,
          created_at: new Date(),
          updated_at: new Date()
        };
        const [result] = await conn.query('INSERT INTO gastos_fijos SET ?', insertData);
        // Marcar last_used_at en la plantilla (útil para auditoría / próximos cálculos)
        await conn.query('UPDATE gastos_fijos_plantillas SET last_used_at = CURRENT_TIMESTAMP WHERE id = ?', [p.id]);
        created++;
        details.push({ plantilla_id: p.id, gasto_id: result.insertId, action: 'created', estatus });
      } catch (innerErr) {
        skipped++;
        details.push({ plantilla_id: p.id, action: 'error', error: innerErr.message });
        console.error('[plantillasAuto] Error procesando plantilla', p.id, innerErr);
      }
    }
    if (debug) console.log(`[plantillasAuto] Resultado ${fechaISO}: created=${created} skipped=${skipped}`);
    return { created, skipped, details };
  } catch (err) {
    console.error('[plantillasAuto] Error ejecutando job', err);
    throw err;
  } finally {
    conn.release();
  }
}

// Determina si hoy corresponde instanciar la plantilla según su frecuencia, dia_pago o fecha_inicio.
function shouldInstantiateToday(p, hoy) {
  const freq = (p.frecuencia || 'Mensual').trim();
  const start = p.fecha_inicio ? dayjs(p.fecha_inicio) : null;
  if (start && hoy.isBefore(start, 'day')) return false; // aún no inicia
  const anchor = p.cadencia_anchor ? dayjs(p.cadencia_anchor) : (start || hoy);

  // Fallback dia_pago: si es NULL usamos el día de fecha_inicio (si existe) o el día actual (esto último solo aplica a Diario)
  let diaPago = p.dia_pago;
  if (!diaPago && start) diaPago = start.date();

  // Frecuencias simples
  if (freq === 'Diario') return true; // cada día desde start (si hay start)

  if (freq === 'Semanal') {
    // Semanal: usamos el día de semana del anchor (0=Domingo...6=Sabado)
    const weekdayAnchor = anchor.day();
    return hoy.day() === weekdayAnchor;
  }

  if (freq === 'Quincenal') {
    // Dos veces por mes: diaPago y diaPago + 15 (clamp al fin de mes). Si no hay diaPago, usar día de start.
    if (!diaPago) diaPago = anchor.date();
    const second = Math.min(diaPago + 15, hoy.endOf('month').date());
    return hoy.date() === diaPago || hoy.date() === second;
  }

  // Para las restantes basadas en meses (Mensual, Bimestral, Semestral, Anual)
  if (!diaPago) {
    // Si sigue sin diaPago (no había fecha_inicio) no podemos calendarizar
    return false;
  }

  const step = freq === 'Mensual' ? 1 : freq === 'Bimestral' ? 2 : freq === 'Semestral' ? 6 : freq === 'Anual' ? 12 : 1;
  const monthsDiff = hoy.startOf('day').diff(anchor.startOf('day'), 'month');
  if (monthsDiff < 0) return false;
  if (monthsDiff % step !== 0) return false; // no cae en la cadencia

  // Validar día del mes (soporta dia_pago = 31 => último día del mes)
  const lastDay = hoy.endOf('month').date();
  if (diaPago === 31) {
    return hoy.date() === lastDay;
  }
  return hoy.date() === diaPago;
}

/**
 * Programa el job diario.
 * CRON: por defecto a las 05:05 hora de México (ajustable por env PLANTILLAS_CRON="5 5 * * *").
 */
export function schedulePlantillasJob() {
  const cronExpr = process.env.PLANTILLAS_CRON || '5 5 * * *'; // 05:05 todos los días
  console.log(`[plantillasAuto] Programando cron ${cronExpr} TZ=${TZ}`);
  const task = cron.schedule(cronExpr, async () => {
    const fecha = dayjs().tz(TZ).format('YYYY-MM-DD');
    try {
      const res = await runPlantillasJob(fecha);
      console.log(`[plantillasAuto] ${fecha} creado=${res.created} omitido=${res.skipped}`);
    } catch (e) {
      console.error('[plantillasAuto] Fallo ejecución programada', e);
    }
  }, { timezone: TZ });
  return task;
}

export default { runPlantillasJob, schedulePlantillasJob };
