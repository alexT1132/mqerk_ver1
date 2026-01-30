// Grupos.jsx - Lista de grupos asignados al asesor con información real
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users, Loader2, AlertCircle, ChevronRight, ArrowLeft } from "lucide-react";
import { getMisGrupos } from "../../api/asesores";

/** Paleta por prefijo (m=mañana, v=vespertino, s=sabatino) */
const COLORS = {
  m: { from: "from-blue-500", to: "to-indigo-500", ring: "ring-blue-200/70", bg: "bg-blue-50" },
  v: { from: "from-violet-500", to: "to-fuchsia-500", ring: "ring-violet-200/70", bg: "bg-violet-50" },
  s: { from: "from-emerald-500", to: "to-teal-500", ring: "ring-emerald-200/70", bg: "bg-emerald-50" },
};

const UserIcon = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="8" r="3.2" />
    <path d="M4 19c1.8-3.2 5-5 8-5s6.2 1.8 8 5" />
  </svg>
);

function labelFromId(id = "") {
  const p = id[0]?.toLowerCase();
  if (p === "m") return "Mañana";
  if (p === "v") return "Vespertino";
  if (p === "s") return "Sabatino";
  return "Grupo";
}

export default function Grupos() {
  const navigate = useNavigate();
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await getMisGrupos();
        if (!alive) return;
        const gruposData = data?.data || [];
        setGrupos(gruposData);
      } catch (e) {
        if (alive) {
          setError(e?.response?.data?.message || "Error al cargar los grupos");
          console.error("Error cargando grupos:", e);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const handleVerGrupo = (grupoId) => {
    navigate(`/asesor/lista-alumnos?grupo=${encodeURIComponent(grupoId)}`);
  };

  if (loading) {
    return (
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <p className="text-sm text-slate-600">Cargando grupos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-8">
        <div className="rounded-xl border-2 border-rose-200 bg-rose-50 p-4 sm:p-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-rose-900 mb-1">Error al cargar grupos</h3>
            <p className="text-sm text-rose-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!grupos.length) {
    return (
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-8">
        {/* Botón Volver */}
        <div className="mb-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver
          </button>
        </div>
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">Grupos</h2>
          <p className="text-sm text-slate-600 mt-1">Selecciona un grupo para ver sus actividades.</p>
        </div>
        <div className="rounded-xl border-2 border-slate-200 bg-white p-8 sm:p-12 text-center">
          <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay grupos asignados</h3>
          <p className="text-sm text-slate-600">Aún no se te han asignado grupos. Contacta al administrador.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-4 sm:py-6">
      {/* Botón Volver */}
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver
        </button>
      </div>

      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">Grupos</h2>
        <p className="text-sm sm:text-base text-slate-600 mt-1.5">
          Selecciona un grupo para ver sus actividades y estudiantes.
        </p>
      </div>

      {/* Grid de grupos - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
        {grupos.map((g) => {
          const prefix = (g.id || g.nombre || "")[0]?.toLowerCase() || "m";
          const theme = COLORS[prefix] || COLORS.m;
          const grupoId = g.id || g.nombre || "";
          const cantidad = g.cantidad_estudiantes || 0;
          const subtitulo = labelFromId(grupoId);

          return (
            <div
              key={grupoId}
              className="group relative w-full rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-200"
            >
              {/* Icono en gradiente */}
              <div className="flex items-start gap-4 mb-4">
                <div
                  className={[
                    "grid h-12 w-12 sm:h-14 sm:w-14 shrink-0 place-items-center rounded-xl text-white shadow-md",
                    "bg-gradient-to-br", theme.from, theme.to,
                    "ring-1 ring-white/30",
                  ].join(" ")}
                >
                  <UserIcon className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="truncate text-lg sm:text-xl font-bold text-slate-900">
                      {grupoId.toUpperCase()}
                    </h3>
                    {cantidad > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        <Users className="h-3 w-3" />
                        {cantidad}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm sm:text-base text-slate-600 font-medium">
                    {subtitulo}
                  </p>
                </div>
              </div>

              {/* Información adicional */}
              <div className="mb-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Estudiantes activos</span>
                  <span className="font-semibold text-slate-700">{cantidad}</span>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handleVerGrupo(grupoId)}
                className="w-full mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-indigo-700 hover:to-violet-700 transition-all duration-200 hover:shadow-md"
              >
                <span>Ver grupo</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Borde suave al hover */}
              <div
                className={[
                  "pointer-events-none absolute inset-0 rounded-2xl",
                  "ring-0 ring-transparent group-hover:ring-2 group-hover:" + theme.ring,
                  "transition-all duration-200",
                ].join(" ")}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
