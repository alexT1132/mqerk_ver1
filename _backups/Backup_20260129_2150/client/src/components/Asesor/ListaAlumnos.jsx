import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { getMisEstudiantes } from "../../api/asesores.js";
import { buildStaticUrl } from "../../utils/url.js";

/**
 * props:
 *  - students: [{ id, name, avatar, group? }]   // group: m1, v2, etc.
 *  - onClick?: (student) => void
 *  - className?: string
 */
export function StudentChips({
  students = DEMO_STUDENTS,
  onClick = () => {},
  className = "",
}) {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex flex-wrap gap-3 sm:gap-4">
        {students.map((s) => (
          <button
            key={s.id}
            onClick={() => onClick(s)}
            className="
              group inline-flex items-center gap-3 sm:gap-4
              rounded-2xl border border-slate-200 bg-white/90
              px-3.5 py-3 sm:px-4 sm:py-3.5
              shadow-sm hover:shadow-md hover:bg-white
              transition focus:outline-none focus:ring-2 focus:ring-indigo-500/50
            "
            title={s.name}
          >
            <Avatar src={s.avatar} name={s.name} />

            <div className="min-w-0 text-left">
              <p className="truncate text-[15px] sm:text-base font-semibold text-slate-800">
                {s.name}
              </p>
              {s.edad && (
                <span className="mt-0.5 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                  {String(s.edad).toUpperCase()} Años
                </span>
              )}
            </div>

          </button>
        ))}
      </div>
    </div>
  );
}

/* Avatar redondo con fallback de iniciales */
function Avatar({ src, name }) {
  const [failed, setFailed] = useState(false);
  const initials = (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");

  if (!src || failed) {
    return (
      <div
        className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl grid place-items-center bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-sm font-semibold ring-1 ring-white/30"
        aria-label={name}
      >
        {initials || "?"}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl object-cover ring-1 ring-slate-200"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

/* Demo */
const DEMO_STUDENTS = [
  { id: "1", name: "Ana Castillo",   avatar: "https://i.pravatar.cc/80?img=5",  edad: "15" },
  { id: "2", name: "Luis Hernández", avatar: "",                                 edad: "16" },
  { id: "3", name: "María López",    avatar: "https://i.pravatar.cc/80?img=15", edad: "17" },
  { id: "4", name: "Carlos Díaz",    avatar: "https://i.pravatar.cc/80?img=20", edad: "15" },
  { id: "5", name: "Sofía Pérez",    avatar: "",                                 edad: "15" },
];

// Página: Lista de alumnos para Asesor (filtrada por grupo del asesor)
export default function ListaAlumnos() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rawStudents, setRawStudents] = useState([]);

  // Leer parámetro grupo de la URL
  const grupoFromUrl = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('grupo') || null;
  }, [location.search]);

  const grupoAsesor = grupoFromUrl || user?.grupo_asesor || user?.asesor_profile?.grupo_asesor || null;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        // Usar getMisEstudiantes que filtra por estatus activo y grupo específico
        const params = grupoAsesor ? { grupo: grupoAsesor } : undefined;
        const { data } = await getMisEstudiantes(params);
        if (!cancelled) setRawStudents(Array.isArray(data?.data) ? data.data : (data || []));
      } catch (e) {
        if (!cancelled) setError(e?.response?.data?.message || e?.message || "No se pudieron cargar los estudiantes");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (isAuthenticated) load();
    return () => { cancelled = true; };
  }, [isAuthenticated, grupoAsesor]);

  const students = useMemo(() => {
    const list = Array.isArray(rawStudents) ? rawStudents : [];
    // El backend ya filtra por grupo y estatus activo, solo mapear
    // Filtrar también client-side por estatus activo por si acaso
    const filtered = list.filter(s => {
      const estatus = s.estatus || 'Activo';
      return estatus === 'Activo';
    });
    
    // Mapear a forma simple para StudentChips
    return filtered.map(s => {
      const name = `${s.nombres || s.nombre || ""} ${s.apellidos || ""}`.trim();
      const avatar = s.foto ? buildStaticUrl(s.foto) : "";
      // Calcular edad desde fecha_nacimiento si está disponible
      let edad = "";
      try {
        if (s.fecha_nacimiento) {
          const dob = new Date(s.fecha_nacimiento);
          if (!isNaN(dob)) {
            const diff = Date.now() - dob.getTime();
            edad = String(Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000)));
          }
        }
      } catch { /* noop */ }
      return { id: s.id, name, avatar, edad, grupo: s.grupo || "" };
    });
  }, [rawStudents]);

  const handleClick = (s) => {
    // Navegar al perfil completo del estudiante
    navigate(`/asesor/estudiante/${s.id}`);
  };

  const count = students.length;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
      {/* Header compacto y elevado con botón atrás */}
      <div className="mb-5 sm:mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Volver"
              title="Volver"
              className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6"/></svg>
            </button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 truncate">Estudiantes</h1>
              {grupoAsesor ? (
                <p className="text-sm text-slate-600 truncate">Mostrando alumnos del grupo <span className="font-medium">{grupoAsesor}</span></p>
              ) : (
                <p className="text-sm text-slate-600 truncate">Mostrando todos los alumnos asignados</p>
              )}
            </div>
          </div>

          <div className="mt-0.5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100">👥</span>
            <span className="whitespace-nowrap">{count} alumnos</span>
          </div>
        </div>
      </div>

      {/* Contenido */}
      {loading && <div className="text-slate-500">Cargando alumnos…</div>}
      {!loading && error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>
      )}
      {!loading && !error && (
        <div className="pb-6">
          <StudentChips students={students} onClick={handleClick} />
        </div>
      )}
    </div>
  );
}
