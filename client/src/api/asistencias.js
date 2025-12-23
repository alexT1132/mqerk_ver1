import { getApiOrigin } from '../utils/url.js';

const API_BASE = getApiOrigin();

/**
 * Registrar asistencia de un estudiante
 */
export async function registrarAsistencia(data) {
  const response = await fetch(`${API_BASE}/api/asistencias`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error al registrar asistencia' }));
    throw new Error(error.message || 'Error al registrar asistencia');
  }
  
  return response.json();
}

/**
 * Registrar múltiples asistencias (para una clase)
 */
export async function registrarAsistenciasMasivas(data) {
  const response = await fetch(`${API_BASE}/api/asistencias/masivo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error al registrar asistencias' }));
    throw new Error(error.message || 'Error al registrar asistencias');
  }
  
  return response.json();
}

/**
 * Obtener asistencias de un estudiante
 */
export async function getAsistenciasEstudiante(id_estudiante, options = {}) {
  const params = new URLSearchParams();
  if (options.desde) params.append('desde', options.desde);
  if (options.hasta) params.append('hasta', options.hasta);
  if (options.tipo) params.append('tipo', options.tipo);
  
  const response = await fetch(`${API_BASE}/api/asistencias/estudiante/${id_estudiante}?${params}`, {
    method: 'GET',
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error al obtener asistencias' }));
    throw new Error(error.message || 'Error al obtener asistencias');
  }
  
  return response.json();
}

/**
 * Obtener resumen de asistencia de un estudiante
 */
export async function getResumenAsistenciaEstudiante(id_estudiante, options = {}) {
  const params = new URLSearchParams();
  if (options.desde) params.append('desde', options.desde);
  if (options.hasta) params.append('hasta', options.hasta);
  
  const response = await fetch(`${API_BASE}/api/asistencias/estudiante/${id_estudiante}/resumen?${params}`, {
    method: 'GET',
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error al obtener resumen' }));
    throw new Error(error.message || 'Error al obtener resumen');
  }
  
  return response.json();
}

/**
 * Obtener asistencias de estudiantes del asesor
 */
export async function getAsistenciasPorAsesor(options = {}) {
  const params = new URLSearchParams();
  if (options.desde) params.append('desde', options.desde);
  if (options.hasta) params.append('hasta', options.hasta);
  if (options.tipo) params.append('tipo', options.tipo);
  if (options.grupo) params.append('grupo', options.grupo);
  if (options.id_estudiante) params.append('id_estudiante', options.id_estudiante);
  
  const response = await fetch(`${API_BASE}/api/asistencias/asesor?${params}`, {
    method: 'GET',
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error al obtener asistencias' }));
    throw new Error(error.message || 'Error al obtener asistencias');
  }
  
  return response.json();
}

/**
 * Eliminar asistencia
 */
export async function eliminarAsistencia(id) {
  const response = await fetch(`${API_BASE}/api/asistencias/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error al eliminar asistencia' }));
    throw new Error(error.message || 'Error al eliminar asistencia');
  }
  
  return response.json();
}

