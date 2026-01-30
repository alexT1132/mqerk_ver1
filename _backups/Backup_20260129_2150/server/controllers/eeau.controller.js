import { getEEAUCourse, ensureEEAUTable } from "../models/eeau.model.js";
import { getResumenActividadesEstudiante } from "../models/actividades_entregas.model.js";
import { resumenQuizzesEstudiante } from "../models/quizzes_intentos.model.js";
import { listResumenEstudiante } from "../models/simulaciones.model.js";

export const obtenerEEAU = async (req, res) => {
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
      // Si hay un id_estudiante en query params, calcular progreso
      let cursoConProgreso = { ...curso };
      if (req.query.id_estudiante) {
        try {
          const id_estudiante = parseInt(req.query.id_estudiante);
          if (!isNaN(id_estudiante)) {
            const progreso = await calcularProgresoEstudiante(id_estudiante);
            cursoConProgreso.progreso = progreso;
          }
        } catch (progError) {
          console.warn('[eeau.controller] Error calculando progreso:', progError?.message);
          // Continuar sin progreso si falla el cálculo
        }
      }
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ data: cursoConProgreso });
    } catch (e) {
      // Detectar errores de conexión específicamente
      const isConnectionError = e?.code === 'ECONNREFUSED' || e?.code === 'ETIMEDOUT';
      
      if (isConnectionError) {
        console.error('[eeau.controller] Error de conexión a MySQL:', {
          message: e?.message,
          code: e?.code,
          suggestion: 'MySQL no está disponible. Verifica que el servicio esté corriendo.',
          config: {
            host: process.env.DB_HOST || '127.0.0.1',
            port: process.env.DB_PORT || '3306',
            user: process.env.DB_USER || 'root',
            database: process.env.DB_NAME || 'mqerkacademy'
          }
        });
        // No intentar recrear tabla si es error de conexión
      } else {
        // Log estructurado para depurar en producción y evitar perder el stack
        console.error('[eeau.controller] Error obteniendo EEAU (primer intento)', {
          message: e?.message,
          code: e?.code,
          errno: e?.errno,
          sqlState: e?.sqlState,
          stack: e?.stack?.split?.('\n')?.slice(0,6).join('\n')
        });
        // Intentar recrear tabla solo si NO es error de conexión
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

/**
 * Calcula el progreso del estudiante basado en actividades, quizzes y simulaciones
 * @param {number} id_estudiante - ID del estudiante
 * @returns {Promise<number>} Progreso de 0 a 100
 */
async function calcularProgresoEstudiante(id_estudiante) {
  try {
    // Obtener resúmenes de actividades, quizzes y simulaciones
    const [actividadesData, quizzesData, simulacionesData] = await Promise.allSettled([
      getResumenActividadesEstudiante(id_estudiante),
      resumenQuizzesEstudiante(id_estudiante),
      listResumenEstudiante(id_estudiante)
    ]);

    // Calcular progreso de actividades
    let actividadesCompletadas = 0;
    let totalActividades = 0;
    if (actividadesData.status === 'fulfilled' && Array.isArray(actividadesData.value)) {
      const actividades = actividadesData.value;
      totalActividades = actividades.length;
      actividadesCompletadas = actividades.filter(a => {
        const estado = a.entrega_estado;
        return estado === 'revisada' || estado === 'entregada';
      }).length;
    }

    // Calcular progreso de quizzes
    let quizzesCompletados = 0;
    let totalQuizzes = 0;
    if (quizzesData.status === 'fulfilled' && Array.isArray(quizzesData.value)) {
      const quizzes = quizzesData.value;
      totalQuizzes = quizzes.length;
      // Un quiz está completado si tiene al menos un intento
      quizzesCompletados = quizzes.filter(q => {
        const intentos = q.total_intentos || 0;
        return intentos > 0;
      }).length;
    }

    // Calcular progreso de simulaciones
    let simulacionesCompletadas = 0;
    let totalSimulaciones = 0;
    if (simulacionesData.status === 'fulfilled' && Array.isArray(simulacionesData.value)) {
      const simulaciones = simulacionesData.value;
      totalSimulaciones = simulaciones.length;
      // Una simulación está completada si tiene al menos un intento
      simulacionesCompletadas = simulaciones.filter(s => {
        const intentos = s.total_intentos || 0;
        return intentos > 0;
      }).length;
    }

    // Calcular progreso ponderado
    // Ponderación: 40% actividades, 30% quizzes, 30% simulaciones
    const totalItems = totalActividades + totalQuizzes + totalSimulaciones;
    if (totalItems === 0) {
      return 0; // Sin contenido, progreso 0%
    }

    const progresoActividades = totalActividades > 0 
      ? (actividadesCompletadas / totalActividades) * 100 
      : 0;
    const progresoQuizzes = totalQuizzes > 0 
      ? (quizzesCompletados / totalQuizzes) * 100 
      : 0;
    const progresoSimulaciones = totalSimulaciones > 0 
      ? (simulacionesCompletadas / totalSimulaciones) * 100 
      : 0;

    // Ponderación: 40% actividades, 30% quizzes, 30% simulaciones
    const pesoActividades = totalActividades / totalItems;
    const pesoQuizzes = totalQuizzes / totalItems;
    const pesoSimulaciones = totalSimulaciones / totalItems;

    // Normalizar pesos para que sumen 1
    const sumaPesos = pesoActividades + pesoQuizzes + pesoSimulaciones;
    const pesoActNorm = sumaPesos > 0 ? pesoActividades / sumaPesos : 0;
    const pesoQuizNorm = sumaPesos > 0 ? pesoQuizzes / sumaPesos : 0;
    const pesoSimNorm = sumaPesos > 0 ? pesoSimulaciones / sumaPesos : 0;

    const progresoTotal = Math.round(
      (progresoActividades * pesoActNorm * 0.4) +
      (progresoQuizzes * pesoQuizNorm * 0.3) +
      (progresoSimulaciones * pesoSimNorm * 0.3)
    );

    return Math.min(100, Math.max(0, progresoTotal));
  } catch (error) {
    console.error('[eeau.controller] Error calculando progreso:', error);
    return 0; // Retornar 0 si hay error
  }
}
