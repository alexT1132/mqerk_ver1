import * as Asistencias from '../models/asistencias.model.js';
import * as Estudiantes from '../models/estudiantes.model.js';
import * as Usuarios from '../models/usuarios.model.js';

/**
 * Registrar asistencia de un estudiante
 * POST /api/asistencias
 */
export const registrarAsistencia = async (req, res) => {
  try {
    const { id_estudiante, fecha, tipo = 'clase', asistio = true, observaciones = null } = req.body;
    const id_asesor = req.user?.id;
    
    if (!id_estudiante || !fecha) {
      return res.status(400).json({ message: 'id_estudiante y fecha son requeridos' });
    }
    
    if (!id_asesor) {
      return res.status(403).json({ message: 'Usuario no autenticado' });
    }
    
    // Verificar que el estudiante existe
    const estudiante = await Estudiantes.getEstudianteById(id_estudiante);
    if (!estudiante) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }
    
    // Verificar que el asesor tiene acceso a este estudiante
    const user = await Usuarios.getUsuarioPorid(id_asesor);
    if (user?.role !== 'asesor') {
      return res.status(403).json({ message: 'Solo los asesores pueden registrar asistencias' });
    }
    
    const result = await Asistencias.registrarAsistencia({
      id_estudiante,
      id_asesor,
      fecha,
      tipo,
      asistio,
      observaciones
    });
    
    res.status(201).json({ 
      message: 'Asistencia registrada correctamente',
      data: { id: result }
    });
  } catch (error) {
    console.error('Error registrando asistencia:', error);
    res.status(500).json({ message: error?.message || 'Error al registrar asistencia' });
  }
};

/**
 * Registrar múltiples asistencias (para una clase)
 * POST /api/asistencias/masivo
 */
export const registrarAsistenciasMasivas = async (req, res) => {
  try {
    const { fecha, tipo = 'clase', asistencias } = req.body;
    const id_asesor = req.user?.id;
    
    if (!fecha || !Array.isArray(asistencias) || asistencias.length === 0) {
      return res.status(400).json({ message: 'fecha y asistencias (array) son requeridos' });
    }
    
    if (!id_asesor) {
      return res.status(403).json({ message: 'Usuario no autenticado' });
    }
    
    const user = await Usuarios.getUsuarioPorid(id_asesor);
    if (user?.role !== 'asesor') {
      return res.status(403).json({ message: 'Solo los asesores pueden registrar asistencias' });
    }
    
    const result = await Asistencias.registrarAsistenciasMasivas({
      id_asesor,
      fecha,
      tipo,
      asistencias
    });
    
    res.status(201).json({ 
      message: 'Asistencias registradas correctamente',
      data: { registradas: result }
    });
  } catch (error) {
    console.error('Error registrando asistencias masivas:', error);
    res.status(500).json({ message: error?.message || 'Error al registrar asistencias' });
  }
};

/**
 * Obtener asistencias de un estudiante
 * GET /api/asistencias/estudiante/:id_estudiante
 */
export const getAsistenciasEstudiante = async (req, res) => {
  try {
    const { id_estudiante } = req.params;
    const { desde, hasta, tipo } = req.query;
    
    const asistencias = await Asistencias.getAsistenciasEstudiante(id_estudiante, {
      desde,
      hasta,
      tipo
    });
    
    res.json({ data: asistencias });
  } catch (error) {
    console.error('Error obteniendo asistencias del estudiante:', error);
    res.status(500).json({ message: error?.message || 'Error al obtener asistencias' });
  }
};

/**
 * Obtener asistencias de estudiantes del asesor
 * GET /api/asistencias/asesor
 */
export const getAsistenciasPorAsesor = async (req, res) => {
  try {
    const id_asesor = req.user?.id;
    
    if (!id_asesor) {
      return res.status(403).json({ message: 'Usuario no autenticado' });
    }
    
    const { desde, hasta, tipo, grupo, id_estudiante } = req.query;
    
    const asistencias = await Asistencias.getAsistenciasPorAsesor(id_asesor, {
      desde,
      hasta,
      tipo,
      grupo,
      id_estudiante
    });
    
    res.json({ data: asistencias });
  } catch (error) {
    console.error('Error obteniendo asistencias del asesor:', error);
    res.status(500).json({ message: error?.message || 'Error al obtener asistencias' });
  }
};

/**
 * Obtener resumen de asistencia de un estudiante
 * GET /api/asistencias/estudiante/:id_estudiante/resumen
 */
export const getResumenAsistenciaEstudiante = async (req, res) => {
  try {
    const { id_estudiante } = req.params;
    const { desde, hasta } = req.query;
    
    const resumen = await Asistencias.getResumenAsistenciaEstudiante(id_estudiante, {
      desde,
      hasta
    });
    
    res.json({ data: resumen });
  } catch (error) {
    console.error('Error obteniendo resumen de asistencia:', error);
    res.status(500).json({ message: error?.message || 'Error al obtener resumen' });
  }
};

/**
 * Eliminar asistencia
 * DELETE /api/asistencias/:id
 */
export const eliminarAsistencia = async (req, res) => {
  try {
    const { id } = req.params;
    const id_asesor = req.user?.id;
    
    if (!id_asesor) {
      return res.status(403).json({ message: 'Usuario no autenticado' });
    }
    
    const eliminado = await Asistencias.eliminarAsistencia(id, id_asesor);
    
    if (!eliminado) {
      return res.status(404).json({ message: 'Asistencia no encontrada o no tienes permisos' });
    }
    
    res.json({ message: 'Asistencia eliminada correctamente' });
  } catch (error) {
    console.error('Error eliminando asistencia:', error);
    res.status(500).json({ message: error?.message || 'Error al eliminar asistencia' });
  }
};

