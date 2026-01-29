import { pool } from "../db.js";

// Obtener todos los previews
export const getPreviewsModel = async () => {
  const [rows] = await pool.execute(`
    SELECT 
      p.*,
      c.nombre as curso_nombre,
      c.codigo as curso_codigo,
      c.imagenUrl as curso_imagen
    FROM previews p
    LEFT JOIN cursos c ON p.course_id = c.id
    ORDER BY p.created_at DESC
  `);
  return rows;
};

// Obtener preview por ID
export const getPreviewByIdModel = async (id) => {
  const [rows] = await pool.execute(`
    SELECT 
      p.*,
      c.nombre as curso_nombre,
      c.codigo as curso_codigo,
      c.imagenUrl as curso_imagen,
      c.modalidad as curso_modalidad,
      c.nivel as curso_nivel,
      c.duration as duration,
      c.durationUnit as durationUnit,
      c.rating as rating
    FROM previews p
    LEFT JOIN cursos c ON p.course_id = c.id
    WHERE p.id = ?
  `, [id]);

  if (rows.length === 0) return null;
  
  const preview = rows[0];
  
  // Parsear JSON fields
  if (preview.aprenderas) {
    preview.aprenderas = JSON.parse(preview.aprenderas);
  }
  if (preview.areas_ensenanza) {
    preview.areas_ensenanza = JSON.parse(preview.areas_ensenanza);
  }
  if (preview.plan_lateral) {
    preview.plan_lateral = JSON.parse(preview.plan_lateral);
  }
  if (preview.planes) {
    preview.planes = JSON.parse(preview.planes);
  }
  
  return preview;
};

// Obtener preview por course_id
export const getPreviewByCourseIdModel = async (courseId) => {
  const [rows] = await pool.execute(`
    SELECT 
      p.*,
      c.nombre as curso_nombre,
      c.codigo as curso_codigo,
      c.imagenUrl as curso_imagen,
      c.modalidad as curso_modalidad,
      c.nivel as curso_nivel,
      c.duration as duration,
      c.durationUnit as durationUnit,
      c.rating as rating
    FROM previews p
    LEFT JOIN cursos c ON p.course_id = c.id
    WHERE p.course_id = ?
  `, [courseId]);
  
  if (rows.length === 0) return null;
  
  const preview = rows[0];
  
  // Parsear JSON fields
  if (preview.aprenderas) {
    preview.aprenderas = JSON.parse(preview.aprenderas);
  }
  if (preview.areas_ensenanza) {
    preview.areas_ensenanza = JSON.parse(preview.areas_ensenanza);
  }
  if (preview.plan_lateral) {
    preview.plan_lateral = JSON.parse(preview.plan_lateral);
  }
  if (preview.planes) {
    preview.planes = JSON.parse(preview.planes);
  }
  
  return preview;
};

// Crear nuevo preview
export const createPreviewModel = async (previewData) => {
  const {
    course_id,
    video_url,
    descripcion,
    aprenderas,
    areas_ensenanza,
    tagline,
    total_classes,
    hours_per_day,
    plan_lateral,
    planes
  } = previewData;

  const [result] = await pool.execute(
    `INSERT INTO previews (
      course_id,
      video_url,
      descripcion,
      aprenderas,
      areas_ensenanza,
      tagline,
      total_classes,
      hours_per_day,
      plan_lateral,
      planes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      course_id,
      video_url || null,
      descripcion || null,
      aprenderas ? JSON.stringify(aprenderas) : null,
      areas_ensenanza ? JSON.stringify(areas_ensenanza) : null,
      tagline || null,
      total_classes || null,
      hours_per_day || null,
      plan_lateral ? JSON.stringify(plan_lateral) : null,
      planes ? JSON.stringify(planes) : null
    ]
  );

  return result.insertId;
};

// Actualizar preview
export const updatePreviewModel = async (id, previewData) => {
  const {
    video_url,
    descripcion,
    aprenderas,
    areas_ensenanza,
    tagline,
    total_classes,
    hours_per_day,
    plan_lateral,
    planes
  } = previewData;

  const [result] = await pool.execute(
    `UPDATE previews SET
      video_url = ?,
      descripcion = ?,
      aprenderas = ?,
      areas_ensenanza = ?,
      tagline = ?,
      total_classes = ?,
      hours_per_day = ?,
      plan_lateral = ?,
      planes = ?
    WHERE id = ?`,
    [
      video_url || null,
      descripcion || null,
      aprenderas ? JSON.stringify(aprenderas) : null,
      areas_ensenanza ? JSON.stringify(areas_ensenanza) : null,
      tagline || null,
      total_classes || null,
      hours_per_day || null,
      plan_lateral ? JSON.stringify(plan_lateral) : null,
      planes ? JSON.stringify(planes) : null,
      id
    ]
  );

  return result.affectedRows > 0;
};

// Eliminar preview
export const deletePreviewModel = async (id) => {
  const [result] = await pool.execute(
    `DELETE FROM previews WHERE id = ?`,
    [id]
  );

  return result.affectedRows > 0;
};

// Verificar si existe un preview para un curso
export const checkPreviewExistsModel = async (courseId) => {
  const [rows] = await pool.execute(
    `SELECT id FROM previews WHERE course_id = ?`,
    [courseId]
  );

  return rows.length > 0;
};