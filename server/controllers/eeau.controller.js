import { getEEAUCourse, ensureEEAUTable } from "../models/eeau.model.js";

export const obtenerEEAU = async (_req, res) => {
  try {
    const curso = await getEEAUCourse();
    if (!curso) return res.status(404).json({ message: 'Curso EEAU no encontrado' });
    res.setHeader('Cache-Control', 'no-store');
    return res.json({ data: curso });
  } catch (e) {
    // Log estructurado para depurar en producción y evitar perder el stack
    console.error('[eeau.controller] Error obteniendo EEAU (primer intento)', {
      message: e?.message,
      code: e?.code,
      errno: e?.errno,
      sqlState: e?.sqlState,
      stack: e?.stack?.split?.('\n')?.slice(0,6).join('\n')
    });
    // Intentar recrear tabla si se rompió el schema
    try { 
      await ensureEEAUTable(); 
    } catch(tableErr){ 
      console.error('[eeau.controller] No se pudo asegurar tabla EEAU', { 
        message: tableErr?.message, code: tableErr?.code, stack: tableErr?.stack?.split?.('\n')?.slice(0,4).join('\n')
      }); 
    }
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
    // Incluir meta para saber que entró al fallback y el error original (sin stack completo) 
    return res.json({ data: fallback, fallback: true, error: e?.message || String(e) });
  }
};
