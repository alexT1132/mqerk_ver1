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
        "group relative flex flex-col items-center justify-center gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-3 rounded-xl sm:rounded-2xl border-2 p-2 sm:p-3 md:p-3.5 lg:p-4 shadow-xl transition-all duration-500 w-full overflow-visible",
        selected
          ? "border-violet-500 ring-2 ring-violet-400/40 bg-gradient-to-br from-violet-100 via-purple-100 to-indigo-100 hover:shadow-2xl scale-[1.02] backdrop-blur-sm"
          : "border-violet-200 bg-gradient-to-br from-white to-violet-50/50 hover:border-violet-400 hover:shadow-2xl hover:-translate-y-1 sm:hover:-translate-y-2 hover:scale-[1.01] backdrop-blur-sm"
      ].join(" ")}
      style={{ minHeight: '140px', boxSizing: 'border-box' }}
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
        "relative z-10 flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 rounded-xl sm:rounded-2xl overflow-hidden shadow-xl transition-all duration-500 flex-shrink-0",
        selected 
          ? "ring-2 ring-violet-400/60 scale-105 shadow-violet-500/30" 
          : "ring-1 ring-violet-200/50 group-hover:ring-violet-300/60 group-hover:scale-105 group-hover:shadow-lg"
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
              size={20}
              className="text-white drop-shadow-xl relative z-10 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" 
            />
          </div>
        )}
      </div>

      {/* Título del curso */}
      <h3 className={[
        "relative z-10 text-[10px] sm:text-xs md:text-sm lg:text-base font-extrabold text-center transition-all duration-300 leading-tight px-1 sm:px-1.5 md:px-2 break-words w-full line-clamp-2",
        selected 
          ? "text-violet-800 drop-shadow-sm" 
          : "text-violet-700 group-hover:text-violet-600 font-bold"
      ].join(" ")}>
        {title}
      </h3>

      {/* Indicador de selección - Check superior derecho */}
      {selected && (
        <span className="pointer-events-none absolute top-0 right-0 grid h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 place-items-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-[10px] sm:text-xs font-bold shadow-xl z-[50] ring-1 ring-white -translate-y-1/2 translate-x-1/2">
          ✓
        </span>
      )}


      {/* Indicador inferior para seleccionado */}
      {selected && (
        <div className="absolute bottom-1.5 sm:bottom-2 md:bottom-3 left-1/2 -translate-x-1/2 z-10">
          <div className="h-1 sm:h-1.5 w-12 sm:w-14 md:w-16 rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 shadow-lg"></div>
        </div>
      )}

      {/* Efecto de hover - flecha */}
      <div className={[
        "absolute bottom-1.5 sm:bottom-2 md:bottom-3 right-1.5 sm:right-2 md:right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10",
        selected ? "opacity-100" : ""
      ].join(" ")}>
        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg">
          <ArrowRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
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
        // Error silencioso
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
        // Error silencioso
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
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 relative overflow-x-hidden w-full">
      {/* Elementos decorativos de fondo - Optimizados para móviles */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] lg:w-[600px] lg:h-[600px] bg-gradient-to-br from-violet-400/40 to-indigo-400/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] lg:w-[600px] lg:h-[600px] bg-gradient-to-br from-indigo-400/40 to-purple-400/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] sm:w-[350px] sm:h-[350px] md:w-[450px] md:h-[450px] lg:w-[500px] lg:h-[500px] bg-gradient-to-br from-purple-300/30 to-pink-300/30 rounded-full blur-3xl pointer-events-none"></div>

      {/* Contenido Principal */}
      <div className="relative z-10 w-full max-w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-6 sm:pt-8 md:pt-10 lg:pt-12 xl:pt-16 pb-8 sm:pb-12">
        {/* Header mejorado */}
        <div className="mb-6 sm:mb-8 md:mb-10 lg:mb-12 space-y-4 sm:space-y-5 md:space-y-6">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-wrap">
            <div className="p-2 sm:p-3 md:p-4 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-xl ring-2 sm:ring-4 ring-violet-200/50">
              <Sparkles className="size-5 sm:size-6 md:size-8 lg:size-10 text-white" />
            </div>
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-violet-100 to-indigo-100 border-2 border-violet-300 shadow-md">
              <span className="text-xs sm:text-sm font-extrabold text-violet-800 uppercase tracking-wider">Panel de Asesor</span>
            </div>
          </div>
          
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-extrabold mb-2 sm:mb-3 tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent inline-block" style={{ lineHeight: '1.1', paddingBottom: '2px' }}>
                Bienvenido de vuelta
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-violet-800 font-extrabold break-words">
              {userName}
            </p>
            <p className="text-sm sm:text-base md:text-lg text-violet-700 max-w-3xl leading-relaxed font-bold">
              Selecciona un curso para comenzar a gestionar tus estudiantes, actividades y recursos educativos de manera eficiente
            </p>
          </div>
        </div>

        {/* Sección de Cursos */}
        <div className="space-y-4 sm:space-y-6 md:space-y-8">
          {/* Encabezado de sección mejorado */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4 pb-4 sm:pb-5 md:pb-6 border-b-2 sm:border-b-3 md:border-b-4 border-violet-300/50">
            <div className="space-y-2 sm:space-y-3 flex-1 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-wrap">
                <div className="h-2 sm:h-2.5 md:h-3 w-12 sm:w-16 md:w-20 lg:w-24 rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 shadow-xl"></div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold">
                  <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                    Mis Cursos
                  </span>
                </h2>
              </div>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-violet-700 ml-0 sm:ml-16 md:ml-20 lg:ml-24 xl:ml-28 font-bold break-words">
                Elige el curso para acceder a su dashboard completo
              </p>
            </div>
            {cursosMostrar.length > 0 && !loading && (
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 shadow-lg ring-2 ring-violet-200 flex-shrink-0">
                <span className="text-xs sm:text-sm font-extrabold text-white">Total:</span>
                <span className="text-lg sm:text-xl font-extrabold text-white">{cursosMostrar.length}</span>
              </div>
            )}
          </div>
          
          {/* Grid de cursos */}
          {loading && cursosMostrar.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4 lg:gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-full h-[140px] sm:h-[150px] md:h-[160px] animate-pulse rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-200 to-indigo-200 border-2 border-violet-300 shadow-lg"></div>
              ))}
            </div>
          ) : cursosMostrar.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4 lg:gap-5" style={{ gridAutoRows: 'minmax(140px, auto)' }}>
              {cursosMostrar.map((c, i) => (
                <div key={c.id ?? i} className="w-full" style={{ minHeight: '140px' }}>
                  <CourseChip 
                    title={c.title} 
                    image={c.image}
                    selected={selected === c.title}
                    onSelect={handleSelect}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="relative overflow-hidden text-center py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 bg-gradient-to-br from-violet-100/80 via-indigo-100/80 to-purple-100/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border-2 border-violet-300 shadow-2xl ring-2 sm:ring-4 ring-violet-200/50">
              {/* Efectos de fondo */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-200/30 via-purple-200/20 to-indigo-200/30"></div>
              <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-gradient-to-br from-violet-400/30 to-indigo-400/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-gradient-to-br from-indigo-400/30 to-purple-400/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
              
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-600 mb-4 sm:mb-5 md:mb-6 shadow-xl ring-2 sm:ring-4 ring-violet-200">
                  <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-violet-800 mb-2 sm:mb-3 px-2">No tienes cursos asignados aún</h3>
                <p className="text-sm sm:text-base md:text-lg text-violet-700 max-w-md mx-auto leading-relaxed font-bold px-2">
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
