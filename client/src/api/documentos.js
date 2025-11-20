import { getApiOrigin } from '../utils/url.js';

const API_BASE = getApiOrigin();

/**
 * Obtener todos los documentos del asesor autenticado
 */
export async function getDocumentos() {
  const response = await fetch(`${API_BASE}/api/documentos`, {
    method: 'GET',
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error al obtener documentos' }));
    throw new Error(error.message || 'Error al obtener documentos');
  }
  
  return response.json();
}

/**
 * Obtener un documento por ID
 */
export async function getDocumento(id) {
  const response = await fetch(`${API_BASE}/api/documentos/${id}`, {
    method: 'GET',
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error al obtener documento' }));
    throw new Error(error.message || 'Error al obtener documento');
  }
  
  return response.json();
}

/**
 * Subir archivo de un documento
 */
export async function uploadDocumento(id, file) {
  const formData = new FormData();
  formData.append('archivo', file);
  
  const response = await fetch(`${API_BASE}/api/documentos/${id}/upload`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error al subir documento' }));
    throw new Error(error.message || 'Error al subir documento');
  }
  
  return response.json();
}

/**
 * Descargar un documento
 */
export async function downloadDocumento(id) {
  const response = await fetch(`${API_BASE}/api/documentos/${id}/download`, {
    method: 'GET',
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error al descargar documento' }));
    throw new Error(error.message || 'Error al descargar documento');
  }
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'documento';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

/**
 * Eliminar un documento
 */
export async function deleteDocumento(id) {
  const response = await fetch(`${API_BASE}/api/documentos/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error al eliminar documento' }));
    throw new Error(error.message || 'Error al eliminar documento');
  }
  
  return response.json();
}

