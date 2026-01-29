// src/context/mqerk/CursosContext.jsx
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  ObtenerCursosRequest,
  createCursoRequest,
  updateCursoRequest,
  deleteCursoRequest,
} from "../api/cursos.js"; // ✅ Corregido: dos niveles arriba

const CursosContext = createContext(null);

/* ================= Helpers ================= */
const parseTags = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(String);
  try {
    const maybe = JSON.parse(val);
    if (Array.isArray(maybe)) return maybe.map(String);
  } catch {}
  return String(val)
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
};

const serializeTags = (val) => {
  if (Array.isArray(val)) return val.join(",");
  return parseTags(val).join(",");
};

const normalizeFromApi = (c) => ({
  ...c,
  codigo: c?.codigo ?? c?.code ?? "",
  imagenUrl: c?.imagenUrl ?? c?.image ?? "",
  alumnos: Number(c?.alumnos ?? c?.students ?? 0),
  likes: Number(c?.likes ?? 0),
  vistas: Number(c?.vistas ?? 0),
  tags: parseTags(c?.tags ?? []),
  section: c?.section ?? "",
  nivel: c?.nivel ?? "",
  duration: Number(c?.duration ?? 0),
  durationUnit: c?.durationUnit ?? "",
  rating: Number(c?.rating ?? 0),
});

function buildFormData(payload) {
  const fd = new FormData();

  if (payload.nombre != null) fd.append("nombre", payload.nombre);
  if (payload.subtitulo != null) fd.append("subtitulo", payload.subtitulo);
  if (payload.modalidad != null) fd.append("modalidad", payload.modalidad);
  if (payload.codigo != null) fd.append("codigo", payload.codigo);

  if (payload.nivel != null) fd.append("nivel", payload.nivel);
  if (payload.section != null) fd.append("section", payload.section);
  if (payload.duration != null) fd.append("duration", String(Number(payload.duration)));
  if (payload.durationUnit != null) fd.append("durationUnit", payload.durationUnit);
  if (payload.rating != null) fd.append("rating", String(Number(payload.rating)));

  fd.append("alumnos", String(Number(payload.alumnos ?? 0)));
  fd.append("likes", String(Number(payload.likes ?? 0)));
  fd.append("vistas", String(Number(payload.vistas ?? 0)));

  if (payload.tags != null) fd.append("tags", serializeTags(payload.tags));

  if (payload.imagen instanceof File) {
    fd.append("imagen", payload.imagen);
  } else if (payload.imagenUrl) {
    fd.append("imagenUrl", payload.imagenUrl);
  }

  return fd;
}

export function CursosProvider({ children, initial = [] }) {
  const [cursos, setCursos] = useState(initial.map(normalizeFromApi));
  const [loading, setLoading] = useState(false);

  const ObtenerCursos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await ObtenerCursosRequest();
      const list = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
        ? res.data
        : [];
      setCursos(list.map(normalizeFromApi));
    } catch (err) {
      console.error("[Cursos][API] GET error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    ObtenerCursos();
  }, [ObtenerCursos]);

  const CrearCurso = useCallback(async (values) => {
    const needsMultipart = values?.imagen instanceof File;
    const payload = needsMultipart
      ? buildFormData(values)
      : {
          ...values,
          alumnos: Number(values?.alumnos ?? 0),
          likes: Number(values?.likes ?? 0),
          vistas: Number(values?.vistas ?? 0),
          duration: Number(values?.duration ?? 0),
          rating: Number(values?.rating ?? 0),
          tags: serializeTags(values?.tags ?? []),
        };

    const res = await createCursoRequest(payload, needsMultipart);
    const createdRaw = res?.data?.data ?? res?.data ?? res;
    const created = normalizeFromApi(createdRaw);

    setCursos((prev) => [created, ...prev]);
    return created;
  }, []);

  const ActualizarCurso = useCallback(async (id, patch) => {
    const needsMultipart = patch?.imagen instanceof File;
    const payload = needsMultipart
      ? buildFormData(patch)
      : {
          ...patch,
          alumnos: Number(patch?.alumnos ?? 0),
          likes: Number(patch?.likes ?? 0),
          vistas: Number(patch?.vistas ?? 0),
          duration: Number(patch?.duration ?? 0),
          rating: Number(patch?.rating ?? 0),
          tags: serializeTags(patch?.tags ?? []),
        };

    const res = await updateCursoRequest(id, payload, needsMultipart);
    const updatedRaw = res?.data?.data ?? res?.data ?? res;
    const updated = normalizeFromApi(updatedRaw);

    setCursos((prev) =>
      prev.map((c) => (String(c.id ?? c._id) === String(id) ? updated : c))
    );
    return updated;
  }, []);

  const EliminarCurso = useCallback(async (id) => {
    await deleteCursoRequest(id);
    setCursos((prev) => prev.filter((c) => String(c.id ?? c._id) !== String(id)));
  }, []);

  const value = {
    cursos,
    loading,
    ObtenerCursos,
    CrearCurso,
    ActualizarCurso,
    EliminarCurso,
  };

  return <CursosContext.Provider value={value}>{children}</CursosContext.Provider>;
}

export function useCursos() {
  const ctx = useContext(CursosContext);
  if (!ctx) throw new Error("useCursos must be used within a CursosProvider");
  return ctx;
}