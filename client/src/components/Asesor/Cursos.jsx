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
        "group relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 p-5 shadow-md transition-all duration-300 min-h-[140px]",
        selected
          ? "border-emerald-500 ring-4 ring-emerald-400/30 bg-gradient-to-br from-emerald-50 to-green-50 hover:shadow-xl scale-105"
          : "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-lg hover:-translate-y-1"
      ].join(" ")}
    >
      {selected && (
        <>
          <span className="pointer-events-none absolute -top-3 -right-3 grid h-8 w-8 place-items-center rounded-full bg-emerald-500 text-white text-sm font-bold shadow-xl z-10">
            ✓
          </span>
          <span className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-emerald-500" />
        </>
      )}
      
      {/* Imagen o icono de respaldo */}
      <div className={[
        "relative flex items-center justify-center h-16 w-16 rounded-xl overflow-hidden",
        selected ? "ring-4 ring-emerald-400/50" : "ring-2 ring-slate-200 group-hover:ring-indigo-300"
      ].join(" ")}>
        {!imageError && image ? (
          <img 
            src={image} 
            alt={title}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className={[
            "h-full w-full flex items-center justify-center",
            selected 
              ? "bg-gradient-to-br from-emerald-500 to-green-600" 
              : "bg-gradient-to-br from-indigo-500 to-purple-600"
          ].join(" ")}>
            <GraduationCap 
              size={32} 
              className="text-white" 
            />
          </div>
        )}
      </div>

      <h3 className={[
        "text-sm font-bold text-center transition-colors leading-tight",
        selected 
          ? "text-emerald-700" 
          : "text-slate-800 group-hover:text-indigo-600"
      ].join(" ")}>
        {title}
      </h3>

      {selected && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
          <div className="h-1 w-12 rounded-full bg-emerald-500"></div>
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
        console.log('Estudiantes cargados:', list);
        setEstudiantes(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error('Error cargando estudiantes:', e);
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

    console.log('Procesando estudiantes para cursos:', estudiantes);

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
    console.log('Cursos extraídos:', cursos);
    return cursos;
  }, [estudiantes]);

  const handleSelect = (title) => {
    setSelected(title);
    try { localStorage.setItem("cursoSeleccionado", title); } catch {}
  };

  // Sincronizar con cambios en localStorage
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "cursoSeleccionado") setSelected(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Debug: mostrar información en consola
  useEffect(() => {
    console.log('Estado actual - Loading:', loading, 'Estudiantes:', estudiantes.length, 'Cursos:', cursosAsignados.length);
  }, [loading, estudiantes, cursosAsignados]);

  return (
    <div className="w-full min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header siempre visible */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Mis Cursos</h1>
          <p className="text-slate-600">Selecciona un curso para ver su dashboard y gestionar tus estudiantes</p>
        </div>

        {/* Contenido */}
        {error ? (
          <div className="text-center py-16 bg-red-50 rounded-2xl border border-red-200 shadow-sm">
            <p className="text-red-600 font-medium text-lg mb-2">Error al cargar los cursos</p>
            <p className="text-sm text-red-500 mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                window.location.reload();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
            <div className="mb-4 text-sm text-slate-600">
              {cursosAsignados.length} {cursosAsignados.length === 1 ? 'curso encontrado' : 'cursos encontrados'}
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
          <div className="text-center py-16 bg-transparent rounded-2xl border border-slate-200 shadow-sm">
            <GraduationCap size={64} className="mx-auto text-slate-400 mb-4" />
            <p className="text-slate-600 font-medium text-lg mb-2">No tienes cursos asignados aún</p>
            <p className="text-sm text-slate-500 mb-4">Los cursos aparecerán aquí cuando tengas estudiantes asignados.</p>
            {estudiantes.length > 0 && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Nota:</strong> Tienes {estudiantes.length} {estudiantes.length === 1 ? 'estudiante' : 'estudiantes'} asignado{estudiantes.length > 1 ? 's' : ''}, 
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
