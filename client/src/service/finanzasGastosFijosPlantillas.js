import api from '../api/axios.js';

export async function listPlantillas(params = {}) {
  const res = await api.get('/finanzas/gastos-fijos/plantillas', { params });
  return res?.data?.data || [];
}

export async function createPlantilla(payload) {
  const res = await api.post('/finanzas/gastos-fijos/plantillas', payload);
  return res?.data?.plantilla;
}

export async function updatePlantilla(id, payload) {
  const res = await api.put(`/finanzas/gastos-fijos/plantillas/${id}`, payload);
  return res?.data?.plantilla;
}

export async function deletePlantilla(id) {
  const res = await api.delete(`/finanzas/gastos-fijos/plantillas/${id}`);
  return res?.data?.ok === true;
}

export async function instanciarDesdePlantilla(id, { fecha, hora = null, estatus = 'Pendiente' }) {
  const res = await api.post(`/finanzas/gastos-fijos/plantillas/${id}/instanciar`, { fecha, hora, estatus });
  return res?.data?.gasto;
}
