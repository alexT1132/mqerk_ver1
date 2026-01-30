import api from '../api/axios.js';

// Service: Gastos Fijos
// Conecta con la API /finanzas/gastos-fijos

export async function listGastosFijos(params = {}) {
  const { from, to, metodo, estatus, frecuencia } = params;
  const res = await api.get('/finanzas/gastos-fijos', {
    params: { from, to, metodo, estatus, frecuencia }
  });
  return res?.data?.data || [];
}

export async function createGastoFijo(gasto) {
  const res = await api.post('/finanzas/gastos-fijos', gasto);
  return res?.data?.gasto;
}

export async function updateGastoFijo(id, gasto) {
  const res = await api.put(`/finanzas/gastos-fijos/${id}`, gasto);
  return res?.data?.gasto;
}

export async function deleteGastoFijo(id) {
  const res = await api.delete(`/finanzas/gastos-fijos/${id}`);
  return res?.data?.ok === true;
}
