// controllers/cursos.controller.js
import path from "path";
import { serializeTagsCSV } from "../utils/tags.js";
import { buildPublicUrl } from "../utils/url.js";
import {
  findAllCursos,
  findCursoById,
  insertCurso,
  updateCursoById,
  deleteCursoById,
} from "../models/cursos.model.js";
import { publicUrlToDiskPath, safeUnlink } from "../utils/files.js";

/* Helpers de normalización */
const MODS = new Set(["PRESENCIAL", "ONLINE", "HIBRIDO"]);
const LEVELS = new Set(["BASICO", "INTERMEDIO", "AVANZADO"]);
const SECTIONS = new Set(["alumnos", "docentes"]);
const DURATION_UNITS = new Set(["semanas", "horas", "días", "meses"]);

const toNumber = (v, def = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};
const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

/* ============ LISTAR ============ */
export async function listarCursos(req, res, next) {
  try {
    const data = await findAllCursos();
    return res.json({ ok: true, data });
  } catch (err) { next(err); }
}

/* ============ CREAR ============ */
export async function crearCurso(req, res, next) {
  try {
    const {
      nombre, codigo, subtitulo, modalidad, imagenUrl, tags,
      alumnos, likes, vistas,
      // nuevos
      nivel, section, duration, durationUnit, rating,
    } = req.body;

    if (!nombre || String(nombre).trim() === "") {
      return res.status(400).json({ ok: false, message: "El nombre es obligatorio" });
    }

    // Imagen -> URL pública
    let finalImagenUrl = imagenUrl || "";
    if (req.file) {
      const rel = path.posix.join("/uploads", "cursos", req.file.filename);
      finalImagenUrl = buildPublicUrl(req, rel);
    }

    const curso = await insertCurso({
      nombre: String(nombre),
      codigo: String(codigo ?? ""),
      subtitulo: subtitulo ? String(subtitulo) : "",
      modalidad: MODS.has(modalidad) ? modalidad : "PRESENCIAL",
      imagenUrl: finalImagenUrl,
      tagsCSV: serializeTagsCSV(tags),
      alumnos: toNumber(alumnos),
      likes: toNumber(likes),
      vistas: toNumber(vistas),
      // nuevos normalizados
      nivel: LEVELS.has(nivel) ? nivel : "INTERMEDIO",
      section: SECTIONS.has(section) ? section : "alumnos",
      duration: toNumber(duration),
      durationUnit: DURATION_UNITS.has(durationUnit) ? durationUnit : "semanas",
      rating: clamp(toNumber(rating), 0, 5),
    });

    return res.status(201).json({ ok: true, data: curso });
  } catch (err) { next(err); }
}

/* ============ ACTUALIZAR ============ */
export async function actualizarCurso(req, res, next) {
  try {
    const { id } = req.params;
    const current = await findCursoById(id);
    if (!current) return res.status(404).json({ ok: false, message: "No encontrado" });

    const patch = {};
    if (req.body.nombre !== undefined) patch.nombre = String(req.body.nombre);
    if (req.body.codigo !== undefined) patch.codigo = String(req.body.codigo);
    if (req.body.subtitulo !== undefined) patch.subtitulo = String(req.body.subtitulo);

    if (req.body.modalidad !== undefined) {
      patch.modalidad = MODS.has(req.body.modalidad) ? req.body.modalidad : current.modalidad;
    }

    if (req.body.alumnos !== undefined) patch.alumnos = toNumber(req.body.alumnos, current.alumnos);
    if (req.body.likes !== undefined) patch.likes = toNumber(req.body.likes, current.likes);
    if (req.body.vistas !== undefined) patch.vistas = toNumber(req.body.vistas, current.vistas);
    if (req.body.tags !== undefined) patch.tags = serializeTagsCSV(req.body.tags);

    // nuevos
    if (req.body.nivel !== undefined) {
      patch.nivel = LEVELS.has(req.body.nivel) ? req.body.nivel : current.nivel;
    }
    if (req.body.section !== undefined) {
      patch.section = SECTIONS.has(req.body.section) ? req.body.section : current.section;
    }
    if (req.body.duration !== undefined) patch.duration = toNumber(req.body.duration, current.duration);
    if (req.body.durationUnit !== undefined) {
      patch.durationUnit = DURATION_UNITS.has(req.body.durationUnit) ? req.body.durationUnit : current.durationUnit;
    }
    if (req.body.rating !== undefined) patch.rating = clamp(toNumber(req.body.rating, current.rating), 0, 5);

    // Imagen nueva: set y borra anterior si era local
    if (req.file) {
      const rel = path.posix.join("/uploads", "cursos", req.file.filename);
      patch.imagenUrl = buildPublicUrl(req, rel);
      const oldAbs = publicUrlToDiskPath(current.imagenUrl);
      if (oldAbs) { try { await safeUnlink(oldAbs); } catch (_) {} }
    } else if (req.body.imagenUrl !== undefined) {
      patch.imagenUrl = String(req.body.imagenUrl);
      if (!patch.imagenUrl) {
        const oldAbs = publicUrlToDiskPath(current.imagenUrl);
        if (oldAbs) { try { await safeUnlink(oldAbs); } catch (_) {} }
      }
    }

    const updated = await updateCursoById(id, patch);
    return res.json({ ok: true, data: updated });
  } catch (err) { next(err); }
}

/* ============ ELIMINAR ============ */
export async function eliminarCurso(req, res, next) {
  try {
    const { id } = req.params;
    const current = await findCursoById(id);
    if (!current) return res.status(404).json({ ok: false, message: "No encontrado" });

    const ok = await deleteCursoById(id);
    if (!ok) return res.status(404).json({ ok: false, message: "No encontrado" });

    const abs = publicUrlToDiskPath(current.imagenUrl);
    if (abs) { try { await safeUnlink(abs); } catch (_) {} }

    return res.json({ ok: true });
  } catch (err) { next(err); }
}
