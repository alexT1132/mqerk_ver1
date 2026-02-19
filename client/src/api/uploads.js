import api from './axios';

/**
 * Sube una imagen de pregunta u opción (quiz o simulación).
 * @param {File} file - Archivo de imagen
 * @returns {Promise<{ url: string }>} - URL pública para guardar (ej. /uploads/preguntas/xxx.jpg)
 */
export const uploadPreguntaImagen = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  const { data } = await api.post('/uploads/pregunta-imagen', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data?.url ?? data;
};
