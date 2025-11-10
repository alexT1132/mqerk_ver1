import api from '../api/axios.js';

export async function listarPagos(params={}) {
  const qs = new URLSearchParams();
  for (const [k,v] of Object.entries(params)) { if (v!==undefined && v!==null && v!=='') qs.append(k,v); }
  const { data } = await api.get(`/finanzas/pagos-asesores${qs.toString() ? ('?'+qs.toString()) : ''}`);
  return data.data || [];
}

export async function crearPago(payload) {
  const { data } = await api.post('/finanzas/pagos-asesores', payload);
  return data.pago;
}

export async function actualizarPago(id, payload) {
  const { data } = await api.put(`/finanzas/pagos-asesores/${id}`, payload);
  return data.pago;
}

export async function eliminarPago(id) {
  const { data } = await api.delete(`/finanzas/pagos-asesores/${id}`);
  return data.ok;
}
