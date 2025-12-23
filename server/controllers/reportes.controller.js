import * as Usuarios from '../models/usuarios.model.js';
import * as AsesorPerfiles from '../models/asesor_perfiles.model.js';
import db from '../db.js';

/**
 * Resolver ID de asesor desde user ID
 */
async function resolveAsesorUserId(userId) {
  const user = await Usuarios.getUsuarioPorid(userId).catch(() => null);
  if (!user || user.role !== 'asesor') return null;
  return user.id;
}

/**
 * Obtener estadísticas generales del asesor
 * GET /api/asesores/reportes/estadisticas
 */
export const getEstadisticas = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'No autenticado' });

    const asesorUserId = await resolveAsesorUserId(userId);
    if (!asesorUserId) return res.status(403).json({ message: 'Solo asesores' });

    // Obtener perfil del asesor para obtener preregistro_id y grupos
    const perfil = await AsesorPerfiles.getByUserId(asesorUserId).catch(() => null);
    if (!perfil || !perfil.preregistro_id) {
      return res.json({
        data: {
          pagos: { total: 0, porMetodo: {}, porMes: [] },
          actividades: { total: 0, completadas: 0, pendientes: 0, promedioCalificacion: 0 },
          estudiantes: { total: 0, activos: 0 },
          rendimiento: { promedioGeneral: 0, topEstudiantes: [] }
        }
      });
    }

    const preregistroId = perfil.preregistro_id;
    const gruposArr = perfil?.grupos_asesor || (perfil?.grupo_asesor ? [perfil.grupo_asesor] : []);
    const grupos = Array.isArray(gruposArr) ? gruposArr : [];

    const placeholders = grupos.length > 0 ? grupos.map(() => '?').join(',') : '';

    // 1. Estadísticas de pagos del asesor (lo que le pagan a él)
    const [pagosRows] = await db.query(`
      SELECT 
        SUM(ingreso_final) as total,
        metodo_pago,
        DATE_FORMAT(fecha_pago, '%Y-%m') as mes
      FROM pagos_asesores
      WHERE asesor_preregistro_id = ?
        AND status = 'Pagado'
      GROUP BY metodo_pago, mes
    `, [preregistroId]);

    const totalPagos = pagosRows.reduce((sum, row) => sum + parseFloat(row.total || 0), 0);
    const pagosPorMetodo = {};
    const pagosPorMes = {};

    pagosRows.forEach(row => {
      const metodo = row.metodo_pago || 'Otro';
      pagosPorMetodo[metodo] = (pagosPorMetodo[metodo] || 0) + parseFloat(row.total || 0);
      
      const mes = row.mes;
      if (mes) {
        pagosPorMes[mes] = (pagosPorMes[mes] || 0) + parseFloat(row.total || 0);
      }
    });

    // Convertir pagosPorMes a array ordenado
    const pagosPorMesArray = Object.entries(pagosPorMes)
      .map(([mes, total]) => ({ mes, total: parseFloat(total) }))
      .sort((a, b) => a.mes.localeCompare(b.mes));

    // 2. Estadísticas de actividades (solo si hay grupos)
    let totalActividades = 0;
    let completadas = 0;
    let pendientes = 0;
    let promedioCalificacion = 0;

    if (grupos.length > 0) {
      const [actividadesRows] = await db.query(`
        SELECT 
          COUNT(DISTINCT ae.id) as total_entregas,
          SUM(CASE WHEN ae.estado = 'revisada' THEN 1 ELSE 0 END) as completadas,
          SUM(CASE WHEN ae.estado = 'entregada' THEN 1 ELSE 0 END) as pendientes,
          AVG(ae.calificacion) as promedio_calificacion
        FROM actividades_entregas ae
        INNER JOIN estudiantes e ON ae.id_estudiante = e.id
        WHERE e.grupo IN (${placeholders})
          AND ae.calificacion IS NOT NULL
      `, grupos);

      const actividadesStats = actividadesRows[0] || {};
      totalActividades = parseInt(actividadesStats.total_entregas || 0);
      completadas = parseInt(actividadesStats.completadas || 0);
      pendientes = parseInt(actividadesStats.pendientes || 0);
      promedioCalificacion = parseFloat(actividadesStats.promedio_calificacion || 0);
    }

    // 3. Estadísticas de estudiantes (solo si hay grupos)
    let totalEstudiantes = 0;
    let estudiantesActivos = 0;

    if (grupos.length > 0) {
      const [estudiantesRows] = await db.query(`
        SELECT 
          COUNT(DISTINCT e.id) as total,
          SUM(CASE WHEN e.estatus = 'Activo' OR e.estatus IS NULL THEN 1 ELSE 0 END) as activos
        FROM estudiantes e
        LEFT JOIN soft_deletes sd ON sd.id_estudiante = e.id
        WHERE e.grupo IN (${placeholders})
          AND e.verificacion = 2
          AND sd.id IS NULL
      `, grupos);

      const estudiantesStats = estudiantesRows[0] || {};
      totalEstudiantes = parseInt(estudiantesStats.total || 0);
      estudiantesActivos = parseInt(estudiantesStats.activos || 0);
    }

    // 4. Rendimiento de estudiantes (top 5 por calificación promedio) - solo si hay grupos
    let topEstudiantes = [];
    let promedioGeneral = 0;

    if (grupos.length > 0) {
      const [rendimientoRows] = await db.query(`
        SELECT 
          e.id,
          CONCAT(e.nombre, ' ', e.apellidos) as nombre_completo,
          AVG(ae.calificacion) as promedio,
          COUNT(ae.id) as total_actividades
        FROM estudiantes e
        INNER JOIN actividades_entregas ae ON e.id = ae.id_estudiante
        WHERE e.grupo IN (${placeholders})
          AND ae.calificacion IS NOT NULL
          AND ae.estado = 'revisada'
        GROUP BY e.id, e.nombre, e.apellidos
        ORDER BY promedio DESC
        LIMIT 5
      `, grupos);

      topEstudiantes = rendimientoRows.map(row => ({
        id: row.id,
        nombre: row.nombre_completo,
        promedio: parseFloat(row.promedio || 0),
        totalActividades: parseInt(row.total_actividades || 0)
      }));

      // Promedio general de todos los estudiantes
      const [promedioGeneralRow] = await db.query(`
        SELECT AVG(ae.calificacion) as promedio_general
        FROM actividades_entregas ae
        INNER JOIN estudiantes e ON ae.id_estudiante = e.id
        WHERE e.grupo IN (${placeholders})
          AND ae.calificacion IS NOT NULL
          AND ae.estado = 'revisada'
      `, grupos);

      promedioGeneral = parseFloat(promedioGeneralRow[0]?.promedio_general || 0);
    }

    res.json({
      data: {
        pagos: {
          total: totalPagos,
          porMetodo: pagosPorMetodo,
          porMes: pagosPorMesArray
        },
        actividades: {
          total: totalActividades,
          completadas,
          pendientes,
          promedioCalificacion: promedioCalificacion.toFixed(2)
        },
        estudiantes: {
          total: totalEstudiantes,
          activos: estudiantesActivos
        },
        rendimiento: {
          promedioGeneral: promedioGeneral.toFixed(2),
          topEstudiantes
        }
      }
    });
  } catch (e) {
    console.error('Error obteniendo estadísticas:', e);
    res.status(500).json({ message: 'Error interno' });
  }
};
