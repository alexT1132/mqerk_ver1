import axios from "./axios.js";

export const CreateRequest = comprobante => axios.post('/comprobante', comprobante);

export const getComprobantesRequest = (grupo, curso) => axios.get(`/comprobante/${grupo}/${curso}`);

export const getVerificacionComprobanteRequest = (folio, dataComplete) => axios.put(`/comprobante/verificacion/${folio}`, dataComplete);
export const rejectVerificacionComprobanteRequest = (folio, data) => axios.put(`/comprobante/rechazo/${folio}`, data);