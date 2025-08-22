import { getEEAUCourse } from "../models/eeau.model.js";

export const obtenerEEAU = async (_req, res) => {
  try {
    const curso = await getEEAUCourse();
    if (!curso) return res.status(404).json({ message: 'Curso EEAU no encontrado' });
    res.setHeader('Cache-Control', 'no-store');
    return res.json({ data: curso });
  } catch (e) {
    console.error('Error obteniendo EEAU:', e);
    return res.status(500).json({ message: 'Error interno' });
  }
};
