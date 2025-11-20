import { getEEAUCourse, ensureEEAUTable } from "../models/eeau.model.js";

export const obtenerEEAU = async (_req, res) => {
  try {
    const curso = await getEEAUCourse();
    if (!curso) {
      res.setHeader('Cache-Control', 'no-store');
      return res.status(404).json({ message: 'Curso EEAU no encontrado' });
    }
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ data: curso });
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
      // Si se creó la tabla, intentar obtener el curso nuevamente
      try {
        const cursoRetry = await getEEAUCourse();
        if (cursoRetry) {
          res.setHeader('Cache-Control', 'no-store');
          return res.status(200).json({ data: cursoRetry });
        }
      } catch (retryErr) {
        console.error('[eeau.controller] Error al obtener EEAU después de recrear tabla:', retryErr?.message);
      }
    } catch(tableErr){ 
      console.error('[eeau.controller] No se pudo asegurar tabla EEAU', { 
        message: tableErr?.message, code: tableErr?.code, stack: tableErr?.stack?.split?.('\n')?.slice(0,4).join('\n')
      }); 
    }
    // Respuesta de respaldo para evitar 500 en el cliente
    // SIEMPRE devolver 200 con fallback para que el frontend pueda funcionar
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
    // Asegurar que siempre devolvemos 200, nunca 500
    if (!res.headersSent) {
      return res.status(200).json({ data: fallback, fallback: true, error: e?.message || String(e) });
    }
  }
};
