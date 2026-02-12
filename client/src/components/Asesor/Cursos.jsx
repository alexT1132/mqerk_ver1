// MisCursos.jsx - Página de cursos del asesor
import { Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { GraduationCap } from "lucide-react";
import { getMisEstudiantes } from "../../api/asesores.js";

/* Chip con estilo mejorado y manejo de errores de imagen */
const CourseChip = ({ title, image, selected, onSelect }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <Link
      to="/asesor/dashboard"
      state={{ curso: title }}
      onClick={() => {
        if (onSelect) onSelect(title);
        localStorage.setItem("cursoSeleccionado", title);
      }}
      className={[
        "group relative flex flex-col items-center justify-center gap-3 rounded-3xl border-2 p-5 shadow-lg transition-all duration-300 min-h-[140px]",
        selected
          ? "border-emerald-500 ring-4 ring-emerald-400/30 bg-gradient-to-br from-emerald-50 to-green-50 hover:shadow-xl scale-105"
          : "border-slate-200 bg-white hover:border-violet-300 hover:shadow-xl hover:-translate-y-2 ring-2 ring-slate-100/50"
      ].join(" ")}
    >
      {selected && (
        <span className="pointer-events-none absolute -top-3 -right-3 grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white text-sm font-extrabold shadow-xl ring-4 ring-white z-10">
          ✓
        </span>
      )}

      {/* Imagen o icono de respaldo */}
      <div className={[
        "relative flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-2xl overflow-hidden transition-all duration-300",
        selected ? "ring-4 ring-emerald-400/50 shadow-lg" : "ring-2 ring-slate-200 group-hover:ring-violet-300 group-hover:shadow-md"
      ].join(" ")}>
        {!imageError && image ? (
          <img
            src={image}
            alt={title}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className={[
            "h-full w-full flex items-center justify-center transition-all duration-300",
            selected
              ? "bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg"
              : "bg-gradient-to-br from-violet-500 to-indigo-600 group-hover:from-violet-600 group-hover:to-indigo-700"
          ].join(" ")}>
            <GraduationCap
              size={32}
              className="text-white transition-transform duration-300 group-hover:scale-110"
            />
          </div>
        )}
      </div>

      <h3 className={[
        "text-sm font-extrabold text-center transition-colors leading-tight",
        selected
          ? "text-emerald-700"
          : "text-slate-800 group-hover:text-violet-600"
      ].join(" ")}>
        {title}
      </h3>

      {selected && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
          <div className="h-1.5 w-16 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 shadow-md"></div>
        </div>
      )}
    </Link>
  );
};

export default function MisCursos() {
  const [loading, setLoading] = useState(true);
  const [estudiantes, setEstudiantes] = useState([]);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(() => {
    try { return localStorage.getItem("cursoSeleccionado") || null; } catch { return null; }
  });

  // Cargar estudiantes del asesor para obtener cursos
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const response = await getMisEstudiantes();
        if (!alive) return;
        const data = response?.data || {};
        const list = data?.data || data?.estudiantes || [];
        setEstudiantes(Array.isArray(list) ? list : []);
      } catch (e) {
        setError(e?.response?.data?.message || 'Error al cargar los estudiantes');
        setEstudiantes([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Extraer cursos únicos de los estudiantes
  const cursosAsignados = useMemo(() => {
    const cursosSet = new Set();
    const cursosMap = new Map();

    estudiantes.forEach(est => {
      // Intentar múltiples campos donde puede estar el curso
      const cursoNombre = est.curso || est.carrera || est.plan_estudio || est.plan || null;
      if (cursoNombre && cursoNombre.trim()) {
        const cursoKey = String(cursoNombre).trim();
        if (cursoKey && cursoKey !== 'null' && cursoKey !== 'undefined') {
          if (!cursosSet.has(cursoKey)) {
            cursosSet.add(cursoKey);
            cursosMap.set(cursoKey, {
              id: cursoKey,
              title: cursoKey,
              image: null // Se mostrará icono por defecto
            });
          }
        }
      }
    });

    const cursos = Array.from(cursosMap.values());
    return cursos;
  }, [estudiantes]);

  const handleSelect = (title) => {
    setSelected(title);
    try { localStorage.setItem("cursoSeleccionado", title); } catch { }
  };

  // Sincronizar con cambios en localStorage
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "cursoSeleccionado") setSelected(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);


  return (
    <div className="w-full min-h-screen relative">
      <div className="fixed inset-0 bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 -z-50"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header siempre visible */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-xl ring-2 ring-violet-200">
              <GraduationCap className="size-8 sm:size-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-2 tracking-tight leading-tight">
                <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent inline-block" style={{ lineHeight: '1.2', paddingBottom: '0.2em' }}>
                  Mis Cursos
                </span>
              </h1>
              <p className="text-slate-600 text-sm sm:text-base font-medium">
                Selecciona un curso para ver su dashboard y gestionar tus estudiantes
              </p>
            </div>
          </div>
        </div>

        {/* Contenido */}
        {error ? (
          <div className="text-center py-16 bg-gradient-to-r from-red-50 to-rose-50 rounded-3xl border-2 border-red-200 shadow-lg ring-2 ring-red-100">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-md ring-2 ring-red-200 mb-4">
              <GraduationCap className="size-8" />
            </div>
            <p className="text-red-700 font-extrabold text-lg mb-2">Error al cargar los cursos</p>
            <p className="text-sm text-red-600 mb-6 font-medium">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                window.location.reload();
              }}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              Reintentar
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[140px] animate-pulse rounded-2xl bg-slate-200 border-2 border-slate-200"></div>
            ))}
          </div>
        ) : cursosAsignados.length > 0 ? (
          <>
            <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-50 to-indigo-50 border-2 border-violet-200 rounded-xl shadow-sm">
              <span className="text-violet-600 font-extrabold text-sm">
                {cursosAsignados.length} {cursosAsignados.length === 1 ? 'curso encontrado' : 'cursos encontrados'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {cursosAsignados.map((c, i) => (
                <CourseChip
                  key={c.id ?? i}
                  title={c.title}
                  image={c.image}
                  selected={selected === c.title}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border-2 border-slate-200 shadow-lg ring-2 ring-slate-100">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 mb-4 shadow-md ring-4 ring-white">
              <GraduationCap size={40} className="text-violet-600" />
            </div>
            <p className="text-slate-700 font-extrabold text-lg mb-2">No tienes cursos asignados aún</p>
            <p className="text-sm text-slate-500 mb-4 font-medium">Los cursos aparecerán aquí cuando tengas estudiantes asignados.</p>
            {estudiantes.length > 0 && (
              <div className="mt-6 mx-auto max-w-md p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl shadow-sm ring-2 ring-amber-100">
                <p className="text-sm text-amber-800 font-medium">
                  <strong className="font-extrabold">Nota:</strong> Tienes {estudiantes.length} {estudiantes.length === 1 ? 'estudiante' : 'estudiantes'} asignado{estudiantes.length > 1 ? 's' : ''},
                  pero {estudiantes.length === 1 ? 'no tiene' : 'no tienen'} curso asignado aún.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Mock removido: provee props reales desde el bundle o deja vacío
