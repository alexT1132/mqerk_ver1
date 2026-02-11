// CursoBienvenida.jsx - Dashboard del curso seleccionado (Reestructurado)
import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Calendar, Users, BookOpen, ArrowLeft, FileText, UserCheck, Clock, TrendingUp, Sparkles } from "lucide-react";
import DashboardCard from "./DashboardCard";

export default function CursoBienvenida() {
  const navigate = useNavigate();
  const location = useLocation();
  const [nombreCurso, setNombreCurso] = useState(null);

  // Prioridad: 1) state (click en selección), 2) localStorage (curso previamente seleccionado)
  const nombreFromState = location.state?.curso ?? null;

  // Cargar curso desde localStorage como respaldo si no hay en state
  useEffect(() => {
    if (nombreFromState) {
      setNombreCurso(nombreFromState);
      try { localStorage.setItem("cursoSeleccionado", nombreFromState); } catch { }
    } else {
      try {
        const cursoGuardado = localStorage.getItem("cursoSeleccionado");
        if (cursoGuardado) {
          setNombreCurso(cursoGuardado);
        } else {
          navigate('/asesor/inicio', { replace: true });
        }
      } catch {
        navigate('/asesor/inicio', { replace: true });
      }
    }
  }, [nombreFromState, navigate]);

  // Escuchar cambios en localStorage
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'cursoSeleccionado') {
        setNombreCurso(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    const checkInterval = setInterval(() => {
      try {
        const current = localStorage.getItem("cursoSeleccionado");
        if (current && current !== nombreCurso) {
          setNombreCurso(current);
        }
      } catch { }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(checkInterval);
    };
  }, [nombreCurso]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 w-full overflow-x-hidden">
      {/* Header mejorado */}
      <header className="relative w-full bg-gradient-to-r from-violet-100/50 via-indigo-100/50 to-purple-100/50 border-b-2 border-violet-200 shadow-lg backdrop-blur-sm">
        <div className="w-full pl-4 sm:pl-6 md:pl-8 lg:pl-12 pr-4 sm:pr-6 md:pr-8 lg:pr-12 py-8 sm:py-10 lg:py-12">
          <button
            onClick={() => navigate('/asesor/inicio')}
            className="mb-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-100 to-indigo-100 hover:from-violet-200 hover:to-indigo-200 px-4 py-2.5 text-sm font-bold text-violet-700 transition-all duration-200 hover:shadow-md hover:scale-105 border border-violet-200"
            aria-label="Regresar"
          >
            <ArrowLeft size={18} /> Regresar
          </button>

          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg ring-2 ring-violet-200">
              <Sparkles className="size-6 text-white" />
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-50 to-indigo-50 border-2 border-violet-200 shadow-sm">
              <p className="text-xs uppercase tracking-widest text-violet-700 font-extrabold">Dashboard del curso</p>
            </div>
          </div>

          <div className="mt-2 mb-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-3 tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent inline-block" style={{ lineHeight: '1.1', paddingBottom: '2px' }}>
                {nombreCurso || 'Selecciona un curso'}
              </span>
            </h1>
            <p className="text-base sm:text-lg text-violet-700 max-w-2xl font-bold">
              Gestiona tus estudiantes, materiales y sesiones desde aquí
            </p>
          </div>

          <div className="flex flex-wrap gap-3 mt-8">
            <Link
              to="/asesor/recursos_educativos"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 px-6 py-3 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 ring-2 ring-violet-200"
            >
              <BookOpen size={20} /> Ver temario
            </Link>
            <Link
              to="/asesor/grupos"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 ring-2 ring-violet-200"
            >
              <Users size={20} /> Ver grupos
            </Link>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-8 lg:py-12 relative z-10" aria-labelledby="panel-title">
        <h2 id="panel-title" className="sr-only">Panel del asesor</h2>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
            {/* Sección Principal - Izquierda */}
            <section className="space-y-6">
              {/* Panel de Bienvenida Mejorado */}
              <DashboardCard
                className="bg-gradient-to-br from-violet-500 via-indigo-500 to-purple-500 border-2 border-violet-400 shadow-2xl ring-4 ring-violet-200/50"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl ring-4 ring-white/30">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-extrabold text-white mb-2">¡Bienvenido al dashboard del curso!</h3>
                    <p className="text-base text-white/90 leading-relaxed font-bold">
                      Desde aquí podrás acceder al temario, materiales, estudiantes y próximas sesiones.
                      Explora todas las opciones disponibles para gestionar tu curso de manera eficiente.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-extrabold border-2 border-white/30 shadow-lg">
                        <TrendingUp className="h-4 w-4" /> Gestión completa
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-extrabold border-2 border-white/30 shadow-lg">
                        <UserCheck className="h-4 w-4" /> Control total
                      </span>
                    </div>
                  </div>
                </div>
              </DashboardCard>

              {/* Tarjetas de Acceso Rápido */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DashboardCard
                  title="Grupos asignados"
                  actions={
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md ring-2 ring-violet-200">
                      <Users className="text-white" size={22} />
                    </div>
                  }
                  className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-violet-300 bg-gradient-to-br from-violet-50 to-indigo-50 ring-2 ring-violet-200/50"
                >
                  <p className="mt-2 mb-4 text-sm text-violet-800 leading-relaxed font-bold">
                    Visualiza y gestiona los grupos que se te han asignado. Accede a la lista completa de estudiantes por grupo.
                  </p>
                  <Link
                    to="/asesor/grupos"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 ring-2 ring-violet-200"
                  >
                    Ver Grupos <ArrowLeft className="h-4 w-4 rotate-180" />
                  </Link>
                </DashboardCard>

                <DashboardCard
                  title="Materiales y recursos"
                  actions={
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md ring-2 ring-violet-200">
                      <BookOpen className="text-white" size={22} />
                    </div>
                  }
                  className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-violet-300 bg-gradient-to-br from-indigo-50 to-purple-50 ring-2 ring-violet-200/50"
                >
                  <p className="mt-2 mb-4 text-sm text-indigo-800 leading-relaxed font-bold">
                    Accede a todo el material de apoyo, recursos del curso y documentación necesaria para tus sesiones.
                  </p>
                  <Link
                    to="/asesor/recursos_educativos"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 ring-2 ring-violet-200"
                  >
                    Ir al temario <ArrowLeft className="h-4 w-4 rotate-180" />
                  </Link>
                </DashboardCard>
              </div>

              {/* Tarjeta de Estadísticas Rápidas */}
              <DashboardCard
                className="bg-gradient-to-br from-purple-100 via-violet-100 to-indigo-100 border-2 border-purple-300 ring-2 ring-purple-200/50"
              >
                <h3 className="text-base font-extrabold text-purple-800 mb-4">Accesos rápidos</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Link
                    to="/asesor/actividades"
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-violet-400 to-indigo-500 hover:from-violet-500 hover:to-indigo-600 border-2 border-violet-300 hover:shadow-xl hover:scale-110 transition-all duration-200 group ring-2 ring-violet-200"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-125 transition-transform shadow-lg ring-2 ring-white/30">
                      <FileText className="h-7 w-7 text-white" />
                    </div>
                    <span className="text-xs font-extrabold text-white text-center">Actividades</span>
                  </Link>

                  <Link
                    to="/asesor/feedback"
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 hover:from-indigo-500 hover:to-purple-600 border-2 border-indigo-300 hover:shadow-xl hover:scale-110 transition-all duration-200 group ring-2 ring-indigo-200"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-125 transition-transform shadow-lg ring-2 ring-white/30">
                      <UserCheck className="h-7 w-7 text-white" />
                    </div>
                    <span className="text-xs font-extrabold text-white text-center">Feedback</span>
                  </Link>

                  <Link
                    to="/asesor/agenda"
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 border-2 border-purple-300 hover:shadow-xl hover:scale-110 transition-all duration-200 group ring-2 ring-purple-200"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-125 transition-transform shadow-lg ring-2 ring-white/30">
                      <Calendar className="h-7 w-7 text-white" />
                    </div>
                    <span className="text-xs font-extrabold text-white text-center">Agenda</span>
                  </Link>

                  <Link
                    to="/asesor/simuladores"
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 border-2 border-violet-400 hover:shadow-xl hover:scale-110 transition-all duration-200 group ring-2 ring-violet-300"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-125 transition-transform shadow-lg ring-2 ring-white/30">
                      <TrendingUp className="h-7 w-7 text-white" />
                    </div>
                    <span className="text-xs font-extrabold text-white text-center">Simuladores</span>
                  </Link>
                </div>
              </DashboardCard>
            </section>

            {/* Sidebar - Derecha */}
            <aside className="space-y-6">
              {/* Próximas Sesiones */}
              <DashboardCard
                title="Próximas sesiones"
                actions={
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md ring-2 ring-violet-200">
                    <Calendar className="text-white" size={22} />
                  </div>
                }
                className="border-2 border-violet-300 bg-gradient-to-br from-violet-100 to-indigo-100 shadow-xl ring-2 ring-violet-200/50"
                titleClassName="!text-violet-950 drop-shadow-sm"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-violet-400/20 to-indigo-400/20 backdrop-blur-sm border-2 border-violet-300/50">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md ring-2 ring-violet-200">
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="h-4 w-3/4 bg-violet-300/50 rounded animate-pulse mb-2"></div>
                      <div className="h-3 w-1/2 bg-violet-300/50 rounded animate-pulse"></div>
                    </div>
                  </div>

                  <div className="text-center py-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 mb-3 shadow-lg ring-4 ring-violet-200">
                      <Calendar className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-sm font-extrabold text-violet-800 mb-1">
                      No hay sesiones programadas aún
                    </p>
                    <p className="text-xs text-violet-600 font-bold">
                      Las próximas sesiones aparecerán aquí
                    </p>
                  </div>
                </div>
              </DashboardCard>

              {/* Información del Curso */}
              <DashboardCard
                className="bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 border-2 border-indigo-300 ring-2 ring-indigo-200/50"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg ring-2 ring-indigo-200">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-base font-extrabold text-indigo-800">Información del curso</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/60 backdrop-blur-sm border-2 border-indigo-200 shadow-md">
                    <span className="text-xs font-extrabold text-indigo-700">Curso activo</span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 text-white text-xs font-extrabold border-2 border-emerald-300 shadow-lg">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                      Activo
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/60 backdrop-blur-sm border-2 border-indigo-200 shadow-md">
                    <p className="text-xs font-extrabold text-indigo-700 mb-1">Última actualización</p>
                    <p className="text-sm font-extrabold text-indigo-900">Hoy</p>
                  </div>
                </div>
              </DashboardCard>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
