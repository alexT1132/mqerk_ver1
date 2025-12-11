import { getEEAUCourse, ensureEEAUTable } from "../models/eeau.model.js";

export const obtenerEEAU = async (_req, res) => {
  // ✅ IMPORTANTE: Asegurar que siempre devolvemos una respuesta (nunca 500)
  // Envolver todo en un try-catch externo para capturar cualquier error inesperado
  try {
    try {
      const curso = await getEEAUCourse();
      if (!curso) {
        // Si no se encuentra, devolver fallback en lugar de 404
        console.warn('[eeau.controller] Curso EEAU no encontrado, usando fallback');
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
        return res.status(200).json({ data: fallback, fallback: true });
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
      // ✅ IMPORTANTE: Asegurar que siempre devolvemos 200, nunca 500
      if (!res.headersSent) {
        return res.status(200).json({ data: fallback, fallback: true, error: e?.message || String(e) });
      }
    }
  } catch (outerErr) {
    // ✅ Capturar cualquier error inesperado que no fue manejado en el try interno
    console.error('[eeau.controller] Error inesperado en obtenerEEAU:', {
      message: outerErr?.message,
      stack: outerErr?.stack?.split?.('\n')?.slice(0, 10).join('\n')
    });
    // SIEMPRE devolver 200 con fallback, nunca 500
    if (!res.headersSent) {
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
      return res.status(200).json({ data: fallback, fallback: true, error: outerErr?.message || String(outerErr) });
    }
  }
};
