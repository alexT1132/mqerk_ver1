import 'dotenv/config';
import db from '../db.js';
import * as Plantillas from '../models/gastos_fijos_plantillas.model.js';

async function main() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1; // 1-12
  const mm = String(m).padStart(2, '0');
  const thisMonthStr = `${y}-${mm}-01`;
  const nextMonth = new Date(y, now.getMonth() + 1, 1);
  const nextMonthStr = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth()+1).padStart(2,'0')}-01`;

  const items = [
    { categoria: 'Renta local', proveedor: 'Propietario', frecuencia: 'Mensual', metodo: 'Transferencia', monto_sugerido: 4500, dia_pago: 1, hora_preferida: '09:00', recordar_minutos: 60, auto_evento: 1, auto_instanciar: 1, cadencia_anchor: thisMonthStr },
    { categoria: 'Luz', proveedor: 'CFE', frecuencia: 'Bimestral', metodo: 'Transferencia', monto_sugerido: 1500, dia_pago: 10, hora_preferida: '09:00', recordar_minutos: 60, auto_evento: 1, auto_instanciar: 1, cadencia_anchor: nextMonthStr },
    { categoria: 'Internet', proveedor: 'ISP', frecuencia: 'Mensual', metodo: 'Transferencia', monto_sugerido: 750, dia_pago: 10, hora_preferida: '09:00', recordar_minutos: 60, auto_evento: 1, auto_instanciar: 1, cadencia_anchor: thisMonthStr },
    { categoria: 'Canva', proveedor: 'Canva', frecuencia: 'Mensual', metodo: 'Tarjeta', monto_sugerido: 750, dia_pago: 10, hora_preferida: '09:00', recordar_minutos: 60, auto_evento: 1, auto_instanciar: 1, cadencia_anchor: thisMonthStr },
    { categoria: 'Mant code', proveedor: 'DevOps', frecuencia: 'Mensual', metodo: 'Transferencia', monto_sugerido: 500, dia_pago: 10, hora_preferida: '09:00', recordar_minutos: 60, auto_evento: 1, auto_instanciar: 1, cadencia_anchor: thisMonthStr },
    { categoria: 'Sueldo', proveedor: 'Nómina', frecuencia: 'Mensual', metodo: 'Transferencia', monto_sugerido: 10000, dia_pago: 15, hora_preferida: '09:00', recordar_minutos: 60, auto_evento: 1, auto_instanciar: 1, cadencia_anchor: thisMonthStr },
    { categoria: 'Insumos', proveedor: 'Varios', frecuencia: 'Mensual', metodo: 'Efectivo', monto_sugerido: 500, dia_pago: 10, hora_preferida: '09:00', recordar_minutos: 60, auto_evento: 1, auto_instanciar: 1, cadencia_anchor: thisMonthStr },
  ];

  const created = [];
  for (const it of items) {
    try {
      const saved = await Plantillas.create(it);
      created.push({ id: saved.id, categoria: saved.categoria, monto: saved.monto_sugerido });
      console.log('✔ Plantilla creada:', saved.id, saved.categoria, saved.frecuencia, saved.monto_sugerido);
    } catch (e) {
      console.error('✖ Error creando plantilla', it.categoria, e?.message || e);
    }
  }

  try { await db.end?.(); } catch {}
  return created;
}

main().then(list => {
  console.log('\nResumen:', list);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
