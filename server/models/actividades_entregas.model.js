import db from '../db.js';

export const getEntregaActiva = async (id_actividad, id_estudiante) => {
  const [rows] = await db.query(`SELECT * FROM actividades_entregas WHERE id_actividad = ? AND id_estudiante = ? AND replaced_by IS NULL ORDER BY id DESC LIMIT 1`, [id_actividad, id_estudiante]);
  return rows[0] || null;
};

export const getEntregaById = async (id) => {
  const [rows] = await db.query('SELECT * FROM actividades_entregas WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
};

// Crea la primera entrega (o genérica) siempre con version calculada = MAX(version)+1
// Mantiene compatibilidad con llamadas existentes que asumen versión inicial cuando no hay previas.
export const createEntrega = async ({ id_actividad, id_estudiante, archivo, original_nombre, mime_type, tamano }) => {
  const [vr] = await db.query('SELECT COALESCE(MAX(version),0)+1 AS nextVersion FROM actividades_entregas WHERE id_actividad = ? AND id_estudiante = ?', [id_actividad, id_estudiante]);
  const nextVersion = vr[0]?.nextVersion || 1;
  const sql = `INSERT INTO actividades_entregas (id_actividad, id_estudiante, archivo, original_nombre, mime_type, tamano, estado, version, entregada_at) VALUES (?,?,?,?,?,?, 'entregada', ?, NOW())`;
  const [res] = await db.query(sql, [id_actividad, id_estudiante, archivo, original_nombre, mime_type, tamano, nextVersion]);
  return res.insertId;
};

// Crea una nueva entrega adicional (no reemplaza las previas). Igual a createEntrega; se deja por semántica.
export const createEntregaAttempt = async (args) => {
  return createEntrega(args);
};

export const replaceEntrega = async (prevEntregaId, { id_actividad, id_estudiante, archivo, original_nombre, mime_type, tamano, prevVersion }) => {
  const newVersion = (prevVersion || 1) + 1;
  const sql = `INSERT INTO actividades_entregas (id_actividad, id_estudiante, archivo, original_nombre, mime_type, tamano, estado, version, entregada_at) VALUES (?,?,?,?,?,?, 'entregada', ?, NOW())`;
  const [res] = await db.query(sql, [id_actividad, id_estudiante, archivo, original_nombre, mime_type, tamano, newVersion]);
  const newId = res.insertId;
  await db.query('UPDATE actividades_entregas SET replaced_by = ? WHERE id = ?', [newId, prevEntregaId]);
  return newId;
};

export const calificarEntrega = async (id, calificacion, comentarios) => {
  // Actualiza calificación y comentarios; marca revisada y registra timestamps
  const [res] = await db.query(
    `UPDATE actividades_entregas
     SET calificacion = ?,
         comentarios = ?,
         estado = 'revisada',
         revisada_at = NOW(),
         comentarios_updated_at = CASE WHEN ? IS NOT NULL AND ? <> '' THEN NOW() ELSE comentarios_updated_at END
     WHERE id = ?`,
    [calificacion, comentarios || null, comentarios || null, comentarios || '', id]
  );
  return res;
};

// Revertir estado "revisada" para permitir nuevas modificaciones antes de la fecha límite
export const resetRevision = async (id) => {
  const [res] = await db.query(
    `UPDATE actividades_entregas
     SET estado = 'entregada',
         calificacion = NULL,
         comentarios = NULL,
         revisada_at = NULL,
         comentarios_updated_at = NULL
     WHERE id = ?`,
    [id]
  );
  return res;
};

export const listEntregasActividad = async (id_actividad, { limit = 100, offset = 0 } = {}) => {
  // ✅ IMPORTANTE: Solo mostrar entregas de estudiantes activos
  const [rows] = await db.query(`
    SELECT ae.* 
    FROM actividades_entregas ae
    INNER JOIN estudiantes e ON ae.id_estudiante = e.id
    WHERE ae.id_actividad = ? AND e.estatus = 'Activo'
    ORDER BY ae.id DESC 
    LIMIT ? OFFSET ?`,
    [id_actividad, Number(limit), Number(offset)]);
  return rows;
};

export const listEntregasEstudiante = async (id_estudiante, { limit = 100, offset = 0 } = {}) => {
  const [rows] = await db.query('SELECT * FROM actividades_entregas WHERE id_estudiante = ? ORDER BY id DESC LIMIT ? OFFSET ?', [id_estudiante, Number(limit), Number(offset)]);
  return rows;
};

export const listHistorialEntregasActividadEstudiante = async (id_actividad, id_estudiante) => {
  const [rows] = await db.query('SELECT * FROM actividades_entregas WHERE id_actividad = ? AND id_estudiante = ? ORDER BY version ASC, id ASC', [id_actividad, id_estudiante]);
  return rows;
};

// Resumen mostrando SOLO la última entrega (según id) incluso si ahora permitimos múltiples intentos sin replaced_by.
export const getResumenActividadesEstudiante = async (id_estudiante) => {
  // Prioriza entrega calificada más reciente; si ninguna calificada aún, usa la última (MAX id)
  const [rows] = await db.query(`
    SELECT a.*,
           e.id AS entrega_id,
           e.estado AS entrega_estado,
           e.calificacion,
           e.comentarios AS entrega_comentarios,
           e.comentarios_updated_at AS entrega_notas_updated_at,
           e.revisada_at,
           e.version,
           e.entregada_at,
           e.archivo,
           COALESCE(e.permite_editar_despues_calificada, 0) AS permite_editar_despues_calificada
    FROM actividades a
    LEFT JOIN (
      SELECT t.*
      FROM actividades_entregas t
      INNER JOIN (
        SELECT id_actividad,
               COALESCE(
                 MAX(CASE WHEN calificacion IS NOT NULL THEN id END),
                 MAX(id)
               ) AS chosen_id
        FROM actividades_entregas
        WHERE id_estudiante = ?
        GROUP BY id_actividad
      ) m ON m.chosen_id = t.id
      WHERE t.id_estudiante = ?
    ) e ON e.id_actividad = a.id
    WHERE a.activo = 1 AND a.tipo = 'actividad'
    ORDER BY a.fecha_limite ASC, a.id DESC`, [id_estudiante, id_estudiante]);
  return rows;
};
