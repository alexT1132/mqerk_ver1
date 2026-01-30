import api from '../api/axios.js';

// Service: Gastos Variables
// Conecta con la API /finanzas/gastos-variables

export async function listGastosVariables(params = {}) {
  const { metodo, estatus } = params;
  const res = await api.get('/finanzas/gastos-variables', {
    params: { metodo, estatus }
  });
  return res?.data?.data || [];
}

export async function createGastoVariable(gasto) {
  const res = await api.post('/finanzas/gastos-variables', gasto);
  return res?.data?.gasto;
}

export async function updateGastoVariable(id, gasto) {
  const res = await api.put(`/finanzas/gastos-variables/${id}`, gasto);
  return res?.data?.gasto;
}

export async function deleteGastoVariable(id) {
  const res = await api.delete(`/finanzas/gastos-variables/${id}`);
  return res?.data?.ok === true;
}
