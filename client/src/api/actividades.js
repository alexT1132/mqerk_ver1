import { buildApiUrl } from '../utils/url.js';

// Mapea el nombre del área a su id aproximado (ajusta si tu catálogo difiere)
export const AREA_NAME_TO_ID = {
  'Español y redacción indirecta': 1,
  'Matemáticas y pensamiento analítico': 2,
  'Habilidades transversales': 3,
  'Lengua extranjera': 4,
};

// Helper para normalizar strings (minúsculas + sin acentos): mejora el mapeo por nombre
const normalize = (s='') => s
  .toString()
  .normalize('NFD')
  .replace(/\p{Diacritic}+/gu, '')
  .toLowerCase()
  .trim();

const AREA_NAME_TO_ID_NORMALIZED = Object.fromEntries(
  Object.entries(AREA_NAME_TO_ID).map(([k,v]) => [normalize(k), v])
);

export function areaIdFromName(name) {
  const n = normalize(name || '');
  return AREA_NAME_TO_ID_NORMALIZED[n];
}

export async function listActividades({ id_area, tipo = 'actividad', limit = 100, offset = 0, activo } = {}) {
  const params = new URLSearchParams();
  if (tipo) params.set('tipo', tipo);
  if (id_area) params.set('id_area', id_area);
  if (limit) params.set('limit', String(limit));
  if (offset) params.set('offset', String(offset));
  if (activo !== undefined) params.set('activo', String(activo ? 1 : 0));
  const url = buildApiUrl(`/actividades?${params.toString()}`);
  const res = await fetch(url, { credentials: 'include' });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || 'Error listando actividades');
  return body; // { data: [...] }
}

export async function getActividad(id) {
  const url = buildApiUrl(`/actividades/${id}`);
  const res = await fetch(url, { credentials: 'include', cache: 'no-store' });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || 'Error obteniendo actividad');
  return body; // { data: {...} }
}

export async function getEstudiantesAsignadosActividad(actividadId) {
  const url = buildApiUrl(`/actividades/${actividadId}/estudiantes-asignados`);
  const res = await fetch(url, { credentials: 'include', cache: 'no-store' });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || 'Error obteniendo estudiantes asignados');
  return body; // { data: [...] }
}

// === Entregas ===
export async function listEntregasActividad(actividadId, params = {}) {
  const usp = new URLSearchParams();
  if (params.limit) usp.set('limit', String(params.limit));
  if (params.offset) usp.set('offset', String(params.offset));
  const url = buildApiUrl(`/actividades/${actividadId}/entregas${usp.toString() ? `?${usp.toString()}` : ''}`);
  const res = await fetch(url, { credentials: 'include', cache: 'no-store' });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || 'Error listando entregas');
  return body; // { data: [...] }
}

export async function calificarEntrega(entregaId, { calificacion, comentarios }) {
  const url = buildApiUrl(`/actividades/entregas/${entregaId}/calificar`);
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ calificacion, comentarios }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || 'Error al calificar');
  return body; // { data: {...} }
}

export async function listArchivosEntrega(entregaId) {
  const url = buildApiUrl(`/actividades/entregas/${entregaId}/archivos`);
  const res = await fetch(url, { credentials: 'include', cache: 'no-store' });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || 'Error listando archivos');
  return body; // { data: [...] }
}

export async function createActividad({ titulo, fecha_limite, grupos, id_area, recursosFiles = [], imagenFile = null, materia } = {}) {
  const fd = new FormData();
  fd.set('titulo', titulo);
  if (fecha_limite) fd.set('fecha_limite', fecha_limite);
  if (Array.isArray(grupos) && grupos.length) fd.set('grupos', JSON.stringify(grupos));
  if (id_area) fd.set('id_area', String(id_area));
  if (materia) fd.set('materia', materia);
  for (const f of recursosFiles) {
    if (f) fd.append('recursos', f);
  }
  if (imagenFile) fd.append('imagen', imagenFile);
  const url = buildApiUrl('/actividades');
  const res = await fetch(url, { method: 'POST', body: fd, credentials: 'include' });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || 'Error creando actividad');
  return body; // { data: {...} }
}

export async function updateActividad(id, data = {}, { nuevosRecursos = [], imagenFile = null } = {}) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined) continue;
    if (k === 'grupos' && Array.isArray(v)) fd.set('grupos', JSON.stringify(v));
    else fd.set(k, v);
  }
  for (const f of (nuevosRecursos || [])) {
    if (f) fd.append('recursos', f);
  }
  if (imagenFile) fd.append('imagen', imagenFile);
  const url = buildApiUrl(`/actividades/${id}`);
  const res = await fetch(url, { method: 'PUT', body: fd, credentials: 'include' });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || 'Error actualizando actividad');
  return body; // { data: {...} }
}

// Opcionales: wrappers para agregar/eliminar archivos a una entrega existente (fetch)
export async function addArchivoEntrega(entregaId, files = []) {
  const fd = new FormData();
  for (const f of files) if (f) fd.append('archivos', f);
  const url = buildApiUrl(`/actividades/entregas/${entregaId}/archivos`);
  const res = await fetch(url, { method: 'POST', body: fd, credentials: 'include' });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || 'Error agregando archivos');
  return body; // { data: [...] }
}

export async function deleteArchivoEntrega(entregaId, archivoId) {
  const url = buildApiUrl(`/actividades/entregas/${entregaId}/archivos/${archivoId}`);
  const res = await fetch(url, { method: 'DELETE', credentials: 'include' });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || 'Error eliminando archivo');
  return body; // { data: [...], deleted }
}

// ==== Student-facing helpers (compat con componentes de alumno) ====
export async function resumenActividadesEstudiante(id_estudiante) {
  const url = buildApiUrl(`/actividades/estudiante/${id_estudiante}/resumen`);
  const res = await fetch(url, { credentials: 'include', cache: 'no-store' });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || 'Error obteniendo resumen');
  return body; // { data: [...] }
}

export async function getEntregaActual(id_actividad, id_estudiante) {
  const url = buildApiUrl(`/actividades/${id_actividad}/entregas/${id_estudiante}`);
  const res = await fetch(url, { credentials: 'include', cache: 'no-store' });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || 'Sin entrega');
  return body; // { data: {...} }
}

export async function crearOReemplazarEntrega(id_actividad, formData) {
  const url = buildApiUrl(`/actividades/${id_actividad}/entregas`);
  const res = await fetch(url, { method: 'POST', body: formData, credentials: 'include' });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || 'Error al subir entrega');
  return body; // { data: {...} }
}

export async function agregarEntrega(id_actividad, formData) {
  const url = buildApiUrl(`/actividades/${id_actividad}/entregas/agregar`);
  const res = await fetch(url, { method: 'POST', body: formData, credentials: 'include' });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || 'Error al agregar archivos');
  return body; // { data: {...} }
}

export async function listEntregasEstudiante(id_estudiante, { limit = 100, offset = 0 } = {}) {
  const usp = new URLSearchParams();
  usp.set('limit', String(limit));
  usp.set('offset', String(offset));
  const url = buildApiUrl(`/actividades/entregas/estudiante/${id_estudiante}?${usp.toString()}`);
  const res = await fetch(url, { credentials: 'include', cache: 'no-store' });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || 'Error listando entregas');
  return body; // { data: [...] }
}

// === Extensiones de fecha límite ===
export async function extenderFechaLimiteGrupo(actividadId, { grupo, nueva_fecha_limite, notas }) {
  const url = buildApiUrl(`/actividades/${actividadId}/extender-fecha/grupo`);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ grupo, nueva_fecha_limite, notas }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || 'Error al extender fecha límite');
  return body; // { data: {...} }
}

export async function extenderFechaLimiteEstudiante(actividadId, { id_estudiante, nueva_fecha_limite, notas }) {
  const url = buildApiUrl(`/actividades/${actividadId}/extender-fecha/estudiante`);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ id_estudiante, nueva_fecha_limite, notas }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || 'Error al extender fecha límite');
  return body; // { data: {...} }
}

export async function listExtensionesActividad(actividadId) {
  const url = buildApiUrl(`/actividades/${actividadId}/extensiones`);
  const res = await fetch(url, { credentials: 'include', cache: 'no-store' });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || 'Error listando extensiones');
  return body; // { data: [...] }
}

export async function eliminarExtension(extensionId) {
  const url = buildApiUrl(`/actividades/extensiones/${extensionId}`);
  const res = await fetch(url, { method: 'DELETE', credentials: 'include' });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || 'Error eliminando extensión');
  return body; // { data: {...} }
}

export async function permitirEditarDespuesCalificada(entregaId, permite) {
  const url = buildApiUrl(`/actividades/entregas/${entregaId}/permite-editar`);
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ permite }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || 'Error al actualizar permiso');
  return body; // { data: {...} }
}
