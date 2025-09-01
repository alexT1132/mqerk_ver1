import { getEEAUCourse } from "../models/eeau.model.js";

export const obtenerEEAU = async (_req, res) => {
  try {
    const curso = await getEEAUCourse();
    if (!curso) return res.status(404).json({ message: 'Curso EEAU no encontrado' });
    res.setHeader('Cache-Control', 'no-store');
    return res.json({ data: curso });
  } catch (e) {
    console.error('Error obteniendo EEAU:', e);
    // Respuesta de respaldo para evitar 500 en el cliente
    const fallback = {
      id: null,
      codigo: 'EEAU',
      titulo: 'Programa EEAU',
      asesor: 'Kelvin Valentin Ramirez',
      duracion_meses: 8,
      imagen_portada: '/public/eeau_portada.png',
      activo: 1,
    };
    res.setHeader('Cache-Control', 'no-store');
    return res.json({ data: fallback, fallback: true });
  }
};
