import db from '../db.js';

// Obtener la fecha límite efectiva para un estudiante y actividad
// Considera extensiones por grupo y por estudiante individual
export const getFechaLimiteEfectiva = async (id_actividad, id_estudiante, grupo) => {
  // Primero obtener la fecha límite base de la actividad
  const [actRows] = await db.query('SELECT fecha_limite FROM actividades WHERE id = ?', [id_actividad]);
  if (!actRows.length) return null;
  const fechaBase = actRows[0].fecha_limite;
  if (!fechaBase) return null;

  // Buscar extensión específica para el estudiante (prioridad más alta)
  const [estRows] = await db.query(
    'SELECT nueva_fecha_limite FROM actividades_fecha_extensiones WHERE id_actividad = ? AND tipo = "estudiante" AND id_estudiante = ? ORDER BY created_at DESC LIMIT 1',
    [id_actividad, id_estudiante]
  );
  if (estRows.length) {
    return new Date(estRows[0].nueva_fecha_limite);
  }

  // Si no hay extensión individual, buscar por grupo
  if (grupo) {
    const grupoNormalizado = String(grupo).trim().toUpperCase();
    const [grupoRows] = await db.query(
      'SELECT nueva_fecha_limite FROM actividades_fecha_extensiones WHERE id_actividad = ? AND tipo = "grupo" AND UPPER(TRIM(grupo)) = ? ORDER BY created_at DESC LIMIT 1',
      [id_actividad, grupoNormalizado]
    );
    if (grupoRows.length) {
      return new Date(grupoRows[0].nueva_fecha_limite);
    }
  }

  // Si no hay extensiones, devolver la fecha base
  return new Date(fechaBase);
};

// Crear extensión de fecha
export const createExtension = async ({ id_actividad, tipo, grupo, id_estudiante, nueva_fecha_limite, creado_por, notas }) => {
  const sql = `INSERT INTO actividades_fecha_extensiones 
    (id_actividad, tipo, grupo, id_estudiante, nueva_fecha_limite, creado_por, notas) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const [res] = await db.query(sql, [
    id_actividad,
    tipo,
    tipo === 'grupo' ? grupo : null,
    tipo === 'estudiante' ? id_estudiante : null,
    nueva_fecha_limite,
    creado_por || null,
    notas || null
  ]);
  return res.insertId;
};

// Listar extensiones de una actividad
export const listExtensiones = async (id_actividad) => {
  const [rows] = await db.query(
    `SELECT e.*, 
            CASE WHEN e.tipo = 'estudiante' THEN CONCAT(est.nombre, ' ', est.apellidos) ELSE NULL END AS estudiante_nombre,
            CASE WHEN e.tipo = 'grupo' THEN e.grupo ELSE NULL END AS grupo_nombre
     FROM actividades_fecha_extensiones e
     LEFT JOIN estudiantes est ON e.id_estudiante = est.id
     WHERE e.id_actividad = ?
     ORDER BY e.created_at DESC`,
    [id_actividad]
  );
  return rows;
};

// Eliminar extensión
export const deleteExtension = async (id) => {
  const [res] = await db.query('DELETE FROM actividades_fecha_extensiones WHERE id = ?', [id]);
  return res.affectedRows > 0;
};

// Verificar si una entrega permite edición después de calificada
export const permiteEditarDespuesCalificada = async (entrega_id) => {
  const [rows] = await db.query(
    'SELECT permite_editar_despues_calificada FROM actividades_entregas WHERE id = ?',
    [entrega_id]
  );
  return rows.length > 0 && rows[0].permite_editar_despues_calificada === 1;
};

// Actualizar permiso de edición después de calificada
export const setPermiteEditarDespuesCalificada = async (entrega_id, permite) => {
  const [res] = await db.query(
    'UPDATE actividades_entregas SET permite_editar_despues_calificada = ? WHERE id = ?',
    [permite ? 1 : 0, entrega_id]
  );
  return res.affectedRows > 0;
};

