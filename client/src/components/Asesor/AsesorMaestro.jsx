// AsesorDashboard.jsx - Página de inicio con diseño mejorado
import { Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { BookOpen, GraduationCap, Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { getMisEstudiantes, getPerfil, getPreRegistro } from "../../api/asesores.js";

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
        "group relative flex flex-col items-center justify-center gap-5 rounded-3xl border-2 p-8 shadow-xl transition-all duration-500 min-h-[200px] overflow-visible",
        selected
          ? "border-violet-500 ring-4 ring-violet-400/40 bg-gradient-to-br from-violet-50 via-purple-50/80 to-indigo-50/80 hover:shadow-2xl scale-[1.03] backdrop-blur-sm"
          : "border-slate-200/80 bg-white hover:border-violet-400/60 hover:shadow-2xl hover:-translate-y-3 hover:scale-[1.02] backdrop-blur-sm"
      ].join(" ")}
    >
      {/* Efecto de brillo de fondo */}
      <div className={[
        "absolute inset-0 rounded-3xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500",
        selected ? "opacity-100" : ""
      ].join(" ")}>
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-purple-500/5 to-indigo-500/5"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-400/20 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
      </div>

      {/* Contenedor del icono */}
      <div className={[
        "relative z-10 flex items-center justify-center h-24 w-24 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500",
        selected 
          ? "ring-4 ring-violet-400/60 scale-110 shadow-violet-500/30" 
          : "ring-2 ring-slate-200/50 group-hover:ring-violet-300/60 group-hover:scale-110 group-hover:shadow-lg"
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
            "h-full w-full flex items-center justify-center relative",
            selected 
              ? "bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600" 
              : "bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500 group-hover:from-violet-600 group-hover:via-purple-600 group-hover:to-indigo-600"
          ].join(" ")}>
            {/* Efecto de brillo interno */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"></div>
            <GraduationCap 
              size={48} 
              className="text-white drop-shadow-2xl relative z-10" 
            />
          </div>
        )}
      </div>

      {/* Título del curso */}
      <h3 className={[
        "relative z-10 text-lg font-extrabold text-center transition-all duration-300 leading-tight px-3",
        selected 
          ? "text-violet-700 drop-shadow-sm" 
          : "text-slate-800 group-hover:text-violet-600"
      ].join(" ")}>
        {title}
      </h3>

      {/* Indicador de selección - Check superior derecho */}
      {selected && (
        <span className="pointer-events-none absolute top-0 right-0 grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-sm font-bold shadow-2xl z-[50] ring-2 ring-white -translate-y-1/2 translate-x-1/2">
          ✓
        </span>
      )}

      {/* Barra lateral izquierda para seleccionado */}
      {selected && (
        <span className="absolute left-0 top-0 bottom-0 w-2 rounded-l-3xl bg-gradient-to-b from-violet-600 via-purple-600 to-indigo-600 shadow-lg z-20"></span>
      )}

      {/* Indicador inferior para seleccionado */}
      {selected && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
          <div className="h-2 w-20 rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 shadow-lg"></div>
        </div>
      )}

      {/* Efecto de hover - flecha */}
      <div className={[
        "absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10",
        selected ? "opacity-100" : ""
      ].join(" ")}>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg">
          <ArrowRight className="h-4 w-4 text-white" />
        </div>
      </div>
    </Link>
  );
};

/* ------------------------------------------------------------------ */
/* Página Principal con Diseño Mejorado                               */
/* ------------------------------------------------------------------ */

export default function AsesorDashboard({
  courses = [],
  user = {},
  stats = [],
}) {
  const authContext = useAuth();
  const authUser = authContext?.user || null;
  const [loading, setLoading] = useState(true);
  const [estudiantes, setEstudiantes] = useState([]);
  const [perfil, setPerfil] = useState(null);
  const [prereg, setPrereg] = useState(null);
  const [selected, setSelected] = useState(() => {
    try { return localStorage.getItem("cursoSeleccionado") || null; } catch { return null; }
  });

  const preregistroId = authUser?.asesor_profile?.preregistro_id || authUser?.asesor_profile?.preregistroId || null;

  // Cargar estudiantes del asesor para obtener cursos
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const { data } = await getMisEstudiantes().catch(() => ({ data: { data: [] } }));
        if (!alive) return;
        const list = data?.data || data?.estudiantes || [];
        setEstudiantes(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error('Error cargando estudiantes:', e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Cargar perfil del asesor para mostrar el nombre
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!preregistroId) return;
      try {
        const [perfilRes, preRes] = await Promise.all([
          getPerfil(preregistroId).catch(() => ({ data: null })),
          getPreRegistro(preregistroId).catch(() => ({ data: null })),
        ]);
        if (!alive) return;
        setPerfil(perfilRes?.data?.perfil || null);
        setPrereg(preRes?.data?.preregistro || null);
      } catch (e) {
        console.error('Error cargando perfil:', e);
      }
    })();
    return () => { alive = false; };
  }, [preregistroId]);

  // Extraer cursos únicos de los estudiantes
  const cursosAsignados = useMemo(() => {
    const cursosSet = new Set();
    const cursosMap = new Map();

    estudiantes.forEach(est => {
      const cursoNombre = est.curso || est.carrera || est.plan_estudio || null;
      if (cursoNombre && cursoNombre.trim()) {
        const cursoKey = cursoNombre.trim();
        if (!cursosSet.has(cursoKey)) {
          cursosSet.add(cursoKey);
          const cursoImages = {
            'EEAU': null,
            'EEAP': null,
            'DIGI-START': null,
            'MINDBRIDGE': null,
            'SPEAKUP': null,
            'PCE': null,
          };
          cursosMap.set(cursoKey, {
            id: cursoKey,
            title: cursoKey,
            image: cursoImages[cursoKey] || null
          });
        }
      }
    });

    return Array.from(cursosMap.values());
  }, [estudiantes]);

  const handleSelect = (title) => {
    setSelected(title);
    try { localStorage.setItem("cursoSeleccionado", title); } catch {}
  };

  const cursosMostrar = loading 
    ? (courses || []) 
    : (cursosAsignados.length > 0 ? cursosAsignados : (courses || []));

  useEffect(() => {
    if (!loading && cursosMostrar.length > 0) {
      const cursoGuardado = selected;
      const cursoExiste = cursosMostrar.some(c => c.title === cursoGuardado);
      if (cursoGuardado && !cursoExiste) {
        setSelected(null);
        try { localStorage.removeItem("cursoSeleccionado"); } catch {}
      }
    }
  }, [loading, cursosMostrar, selected]);

  // Nombre del usuario
  const userName = useMemo(() => {
    if (prereg?.nombres && prereg?.apellidos) {
      return `${prereg.nombres} ${prereg.apellidos}`.trim();
    }
    if (perfil?.nombres && perfil?.apellidos) {
      return `${perfil.nombres} ${perfil.apellidos}`.trim();
    }
    return authUser?.usuario || "Asesor";
  }, [prereg, perfil, authUser]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/20 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-violet-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

      {/* Contenido Principal */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Header mejorado */}
        <div className="mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-100 to-indigo-100 border border-violet-200/50 shadow-sm mb-2">
            <Sparkles className="h-4 w-4 text-violet-600" />
            <span className="text-sm font-semibold text-violet-700">Panel de Asesor</span>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-violet-800 to-indigo-800 leading-tight">
              Bienvenido de vuelta
            </h1>
            <p className="text-2xl sm:text-3xl text-slate-700 font-bold">
              {userName}
            </p>
            <p className="text-lg text-slate-600 max-w-3xl leading-relaxed">
              Selecciona un curso para comenzar a gestionar tus estudiantes, actividades y recursos educativos de manera eficiente
            </p>
          </div>
        </div>

        {/* Sección de Cursos */}
        <div className="space-y-8">
          {/* Encabezado de sección mejorado */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-4 border-b-2 border-slate-200/60">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <div className="h-2 w-16 rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 shadow-lg"></div>
                <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-800">
                  Mis Cursos
                </h2>
              </div>
              <p className="text-lg text-slate-600 ml-20">
                Elige el curso para acceder a su dashboard completo
              </p>
            </div>
            {cursosMostrar.length > 0 && !loading && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200/50 shadow-sm">
                <span className="text-sm font-semibold text-slate-600">Total:</span>
                <span className="text-lg font-bold text-violet-600">{cursosMostrar.length}</span>
              </div>
            )}
          </div>
          
          {/* Grid de cursos */}
          {loading && cursosMostrar.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-[200px] animate-pulse rounded-3xl bg-gradient-to-br from-slate-200 to-slate-100 border-2 border-slate-200 shadow-lg"></div>
              ))}
            </div>
          ) : cursosMostrar.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {cursosMostrar.map((c, i) => (
                <CourseChip 
                  key={c.id ?? i} 
                  title={c.title} 
                  image={c.image}
                  selected={selected === c.title}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          ) : (
            <div className="relative overflow-hidden text-center py-20 bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-slate-200/80 shadow-2xl">
              {/* Efectos de fondo */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 via-purple-50/30 to-indigo-50/50"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-100 via-purple-100 to-indigo-100 mb-6 shadow-xl">
                  <BookOpen className="h-12 w-12 text-violet-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">No tienes cursos asignados aún</h3>
                <p className="text-base text-slate-600 max-w-md mx-auto leading-relaxed">
                  Los cursos aparecerán aquí cuando tengas estudiantes asignados a tu cuenta
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
