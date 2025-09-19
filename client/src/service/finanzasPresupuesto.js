import api from '../api/axios.js';

// Service: Presupuestos de egresos y resumen mensual
// All methods return plain data or throw; callers can catch and fallback to local store.

export async function listPresupuestos() {
  const res = await api.get('/finanzas/presupuestos');
  // Expect { data: [{ id, mes, monto, created_at, updated_at }] }
  return res?.data?.data || [];
}

export async function upsertPresupuesto({ mes, monto }) {
  const res = await api.post('/finanzas/presupuestos', { mes, monto });
  return res?.data?.presupuesto;
}

export async function deletePresupuesto(mes) {
  const res = await api.delete(`/finanzas/presupuestos/${encodeURIComponent(mes)}`);
  return res?.data?.ok === true;
}

export async function getResumenMensual(mes) {
  // mes format YYYY-MM; if omitted, backend uses current month
  const res = await api.get('/finanzas/egresos/resumen-mensual', { params: { mes } });
  // Expect { data: { mes, budget, spent, leftover } }
  return res?.data?.data || { mes, budget: 0, spent: 0, leftover: 0 };
}
