// models/cursos.model.js
import { pool } from "../db.js";
import { parseTagsToArray } from "../utils/tags.js";

function rowToEntity(row) {
  return {
    id: row.id,
    nombre: row.nombre ?? "",
    codigo: row.codigo ?? "",
    subtitulo: row.subtitulo ?? "",
    modalidad: row.modalidad ?? "PRESENCIAL",
    imagenUrl: row.imagenUrl ?? "",
    tags: parseTagsToArray(row.tags ?? ""),
    alumnos: Number(row.alumnos ?? 0),
    likes: Number(row.likes ?? 0),
    vistas: Number(row.vistas ?? 0),
    section: row.section ?? "alumnos",
    nivel: row.nivel ?? "INTERMEDIO",
    duration: Number(row.duration ?? 0),
    durationUnit: row.durationUnit ?? "semanas",
    rating: Number(row.rating ?? 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function findAllCursos() {
  const [rows] = await pool.execute(
    "SELECT * FROM cursos ORDER BY created_at DESC"
  );
  return rows.map(rowToEntity);
}

export async function findCursoById(id) {
  const [rows] = await pool.execute(
    `SELECT 
      id, nombre, codigo, subtitulo, modalidad, imagenUrl, 
      tags, alumnos, likes, vistas, nivel, section, 
      duration, durationUnit, rating, created_at, updated_at
    FROM cursos 
    WHERE id = ?`,
    [id]
  );
  return rows[0] ? rowToEntity(rows[0]) : null;
}

export async function insertCurso(data) {
  const {
    nombre, 
    codigo = "", 
    subtitulo = "", 
    modalidad = "PRESENCIAL",
    imagenUrl = "", 
    tagsCSV = "", 
    alumnos = 0, 
    likes = 0, 
    vistas = 0,
    section = "alumnos",
    nivel = "INTERMEDIO",
    duration = 0,
    durationUnit = "semanas",
    rating = 0,
  } = data;

  const [result] = await pool.execute(
    `INSERT INTO cursos
      (nombre, codigo, subtitulo, modalidad, imagenUrl, tags, alumnos, likes, vistas,
       section, nivel, duration, durationUnit, rating)
     VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      nombre, 
      codigo, 
      subtitulo, 
      modalidad, 
      imagenUrl, 
      tagsCSV, 
      Number(alumnos), 
      Number(likes), 
      Number(vistas),
      section, 
      nivel, 
      Number(duration), 
      durationUnit, 
      Number(rating)
    ]
  );

  return await findCursoById(result.insertId);
}

export async function updateCursoById(id, data) {
  const fields = [];
  const values = [];

  // Strings
  if (data.nombre !== undefined)       { fields.push("nombre = ?");       values.push(String(data.nombre)); }
  if (data.codigo !== undefined)       { fields.push("codigo = ?");       values.push(String(data.codigo)); }
  if (data.subtitulo !== undefined)    { fields.push("subtitulo = ?");    values.push(String(data.subtitulo)); }
  if (data.modalidad !== undefined)    { fields.push("modalidad = ?");    values.push(String(data.modalidad)); }
  if (data.imagenUrl !== undefined)    { fields.push("imagenUrl = ?");    values.push(String(data.imagenUrl)); }
  if (data.tags !== undefined)         { fields.push("tags = ?");         values.push(String(data.tags)); }
  if (data.section !== undefined)      { fields.push("section = ?");      values.push(String(data.section)); }
  if (data.nivel !== undefined)        { fields.push("nivel = ?");        values.push(String(data.nivel)); }
  if (data.durationUnit !== undefined) { fields.push("durationUnit = ?"); values.push(String(data.durationUnit)); }
  
  // Números
  if (data.alumnos !== undefined)      { fields.push("alumnos = ?");      values.push(Number(data.alumnos)); }
  if (data.likes !== undefined)        { fields.push("likes = ?");        values.push(Number(data.likes)); }
  if (data.vistas !== undefined)       { fields.push("vistas = ?");       values.push(Number(data.vistas)); }
  if (data.duration !== undefined)     { fields.push("duration = ?");     values.push(Number(data.duration)); }
  if (data.rating !== undefined)       { fields.push("rating = ?");       values.push(Number(data.rating)); }

  if (fields.length === 0) return await findCursoById(id);

  values.push(id);
  await pool.execute(
    `UPDATE cursos SET ${fields.join(", ")} WHERE id = ?`, 
    values
  );
  
  return await findCursoById(id);
}

export async function deleteCursoById(id) {
  const [res] = await pool.execute(
    "DELETE FROM cursos WHERE id = ?", 
    [id]
  );
  return res.affectedRows > 0;
}