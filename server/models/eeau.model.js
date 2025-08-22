import db from "../db.js";

export const getEEAUCourse = async () => {
  const [rows] = await db.query("SELECT id, codigo, titulo, asesor, duracion_meses, imagen_portada, activo FROM eeau WHERE codigo = 'EEAU' AND activo = 1 LIMIT 1");
  return rows?.[0] || null;
};
