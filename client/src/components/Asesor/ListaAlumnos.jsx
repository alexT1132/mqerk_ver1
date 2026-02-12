import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Users,
  ArrowLeft as LucideArrowLeft,
  Search,
  Sparkles,
  UserPlus,
  ChevronRight,
  Filter,
  GraduationCap,
  Calendar
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { getMisEstudiantes } from "../../api/asesores.js";
import { buildStaticUrl } from "../../utils/url.js";

/* --- Iconos inline --- */
const ArrowLeft = (props) => <LucideArrowLeft {...props} />;

/**
 * props:
 *  - students: [{ id, name, avatar, edad?, grupo? }]
 *  - onClick?: (student) => void
 *  - className?: string
 */
export function StudentChips({
  students = [],
  onClick = () => { },
  className = "",
}) {
  return (
    <div className={`w-full ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {students.map((s) => (
          <button
            key={s.id}
            onClick={() => onClick(s)}
            className="
              group flex items-center gap-4
              rounded-3xl border-2 border-slate-100 bg-white/90
              p-4 sm:p-5
              shadow-sm hover:shadow-xl hover:bg-white
              hover:-translate-y-1 hover:border-violet-200/50
              transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-violet-500/10
              relative overflow-hidden
            "
            title={s.name}
          >
            {/* Efecto de brillo al hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 via-fuchsia-500/0 to-indigo-500/0 group-hover:from-violet-500/5 group-hover:via-fuchsia-500/5 group-hover:to-indigo-500/5 transition-all duration-500" />

            <Avatar src={s.avatar} name={s.name} />

            <div className="min-w-0 text-left relative z-10">
              <p className="truncate text-base font-bold text-slate-900 group-hover:text-violet-700 transition-colors">
                {s.name}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {s.grupo && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-indigo-50 text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider">
                    {s.grupo}
                  </span>
                )}
                {s.edad && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                    <Calendar className="size-3" />
                    {s.edad} años
                  </span>
                )}
              </div>
            </div>

            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
              <div className="size-8 rounded-full bg-violet-50 flex items-center justify-center text-violet-600">
                <ChevronRight className="size-5" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* Avatar moderno con gradiente y sombra */
function Avatar({ src, name }) {
  const [failed, setFailed] = useState(false);
  const initials = (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");

  const sharedClasses = "size-12 sm:size-14 rounded-2xl object-cover shadow-md ring-2 ring-white group-hover:ring-violet-100 transition-all duration-300";

  if (!src || failed) {
    return (
      <div
        className={`${sharedClasses} grid place-items-center bg-gradient-to-br from-violet-500 via-indigo-600 to-purple-600 text-white text-lg font-bold`}
        aria-label={name}
      >
        {initials || "?"}
      </div>
    );
  }

  return (
    <div className="relative">
      <img
        src={src}
        alt={name}
        className={sharedClasses}
        onError={() => setFailed(true)}
      />
      <div className="absolute -bottom-1 -right-1 size-4 rounded-full bg-emerald-500 border-2 border-white" title="Activo" />
    </div>
  );
}

// Página: Lista de alumnos para Asesor (filtrada por grupo del asesor)
export default function ListaAlumnos() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rawStudents, setRawStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

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

  const allStudents = useMemo(() => {
    const list = Array.isArray(rawStudents) ? rawStudents : [];
    const filtered = list.filter(s => {
      const estatus = s.estatus || 'Activo';
      return estatus === 'Activo';
    });

    return filtered.map(s => {
      const name = `${s.nombres || s.nombre || ""} ${s.apellidos || ""}`.trim();
      const avatar = s.foto ? buildStaticUrl(s.foto) : "";
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

  const students = useMemo(() => {
    if (!searchTerm.trim()) return allStudents;
    const term = searchTerm.toLowerCase().trim();
    return allStudents.filter(s =>
      s.name.toLowerCase().includes(term) ||
      (s.grupo && s.grupo.toLowerCase().includes(term))
    );
  }, [allStudents, searchTerm]);

  const handleClick = (s) => {
    navigate(`/asesor/estudiante/${s.id}`);
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 -z-50"></div>
      <div className="mx-auto max-w-8xl px-4 pb-32 pt-4 sm:px-6 lg:px-8">
        {/* Header Premium y Elevado */}
        <header className="-mt-1 sm:-mt-2 rounded-3xl border-2 border-violet-200/60 bg-gradient-to-r from-violet-50/80 via-indigo-50/80 to-purple-50/80 shadow-xl ring-2 ring-slate-100/50 px-4 sm:px-7 py-5 mb-8 relative overflow-hidden">
          {/* blobs */}
          <div className="pointer-events-none absolute -left-10 -top-14 h-64 w-64 rounded-full bg-violet-200/50 blur-3xl" />
          <div className="pointer-events-none absolute -right-10 -bottom-14 h-64 w-64 rounded-full bg-indigo-200/50 blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <button
                onClick={() => navigate(-1)}
                className="mt-1 inline-flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
                aria-label="Volver"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              <div className="hidden sm:flex p-3 rounded-2xl bg-white/40 backdrop-blur-md shadow-sm ring-1 ring-white/50 items-center justify-center">
                <Users className="size-6 text-violet-700" />
              </div>

              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 inline-block pb-1" style={{ lineHeight: '1.2', paddingBottom: '0.2em' }}>
                    Lista de Estudiantes
                  </span>
                </h1>
                {grupoAsesor ? (
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-violet-100 text-[11px] font-bold text-violet-700">
                      Grupo {grupoAsesor}
                    </span>
                    <p className="text-sm text-slate-500 font-medium">
                      Mostrando alumnos activos del módulo
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 font-medium mt-1.5">
                    Gestiona y revisa el progreso de tus alumnos asignados
                  </p>
                )}
              </div>
            </div>

            <div className="inline-flex items-center gap-2.5 rounded-2xl border-2 border-violet-200 bg-white/70 backdrop-blur-sm p-4 text-sm text-slate-700 shadow-lg ring-1 ring-violet-500/10">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-md">
                <Users className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-slate-900 leading-none">{students.length}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Total de alumnos</span>
              </div>
            </div>
          </div>
        </header>

        {/* Banner Principal Informativo */}
        <div className="relative mb-8 rounded-3xl border-2 border-violet-100/60 bg-gradient-to-br from-indigo-50 to-white shadow-lg overflow-hidden md:py-6 py-4 px-6 md:px-8">
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
            <Sparkles className="w-full h-full text-violet-600" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="size-16 rounded-3xl bg-white shadow-xl flex items-center justify-center border-2 border-violet-50 group hover:rotate-6 transition-transform">
                <GraduationCap className="size-8 text-violet-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Control Académico</h2>
                <p className="text-sm text-slate-500 max-w-md">
                  Consulta perfiles detallados, historial de simulacros y progreso individual de cada estudiante.
                </p>
              </div>
            </div>

            {/* Barra de búsqueda integrada en el banner */}
            <div className="w-full lg:w-96 relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por nombre o grupo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-transparent bg-white shadow-md focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all placeholder:text-slate-400 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Grid de Estudiantes */}
        <div className="relative">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="size-14 rounded-full border-4 border-slate-100 border-t-violet-600 animate-spin shadow-inner" />
              <p className="text-base font-bold text-slate-500 animate-pulse">Sincronizando alumnos...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border-2 border-rose-200 bg-rose-50 p-8 text-center shadow-lg">
              <div className="mx-auto size-16 rounded-full bg-rose-100 flex items-center justify-center mb-4 text-rose-600">
                <Search className="size-8" />
              </div>
              <h3 className="text-lg font-bold text-rose-800 mb-1">Error al cargar la lista</h3>
              <p className="text-sm text-rose-600 font-medium">{error}</p>
            </div>
          ) : students.length > 0 ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <StudentChips students={students} onClick={handleClick} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 px-6 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/30">
              <div className="size-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                <Users className="size-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No hay resultados</h3>
              <p className="text-sm text-slate-500 text-center max-w-sm mt-2 font-medium">
                {searchTerm
                  ? `No encontramos ningún alumno que coincida con "${searchTerm}".`
                  : "Aún no hay alumnos activos registrados en este grupo."}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-6 px-6 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold shadow-lg hover:bg-slate-800 transition-all"
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
