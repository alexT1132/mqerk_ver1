import axios from './axios.js';

/**
 * Obtener todos los documentos del asesor autenticado
 */
export async function getDocumentos() {
  try {
    const response = await axios.get('/documentos');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al obtener documentos');
  }
}

/**
 * Obtener un documento por ID
 */
export async function getDocumento(id) {
  try {
    const response = await axios.get(`/documentos/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al obtener documento');
  }
}

/**
 * Subir archivo de un documento
 */
export async function uploadDocumento(id, file) {
  const formData = new FormData();
  formData.append('archivo', file);

  try {
    const response = await axios.post(`/documentos/${id}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al subir documento');
  }
}

/**
 * Descargar un documento
 */
export async function downloadDocumento(id) {
  try {
    const response = await axios.get(`/documentos/${id}/download`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;

    // Intentar obtener nombre del archivo del header
    const contentDisposition = response.headers['content-disposition'];
    let fileName = 'documento';
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      if (fileNameMatch && fileNameMatch.length === 2) fileName = fileNameMatch[1];
    }

    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al descargar documento');
  }
}

/**
 * Eliminar un documento
 */
export async function deleteDocumento(id) {
  try {
    const response = await axios.delete(`/documentos/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al eliminar documento');
  }
}

