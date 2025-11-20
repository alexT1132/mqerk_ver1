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
      try { localStorage.setItem("cursoSeleccionado", nombreFromState); } catch {}
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
      } catch {}
    }, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(checkInterval);
    };
  }, [nombreCurso]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 w-full overflow-x-visible">
      {/* Header sin color morado */}
      <header className="relative w-full bg-white border-b border-slate-200 shadow-sm">
        <div className="w-full pl-4 sm:pl-6 md:pl-8 lg:pl-12 pr-4 sm:pr-6 md:pr-8 lg:pr-12 py-8 sm:py-10 lg:py-12">
          <button
            onClick={() => navigate('/asesor/inicio')}
            className="mb-6 inline-flex items-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition-all duration-200 hover:shadow-md"
            aria-label="Regresar"
          >
            <ArrowLeft size={18} /> Regresar
          </button>

          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-xl bg-slate-100 border border-slate-200">
            <Sparkles className="h-4 w-4 text-slate-600" />
            <p className="text-xs uppercase tracking-widest text-slate-600 font-semibold">Dashboard del curso</p>
          </div>
          
          <div className="mt-2 mb-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 mb-3">
              {nombreCurso || 'Selecciona un curso'}
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl">
              Gestiona tus estudiantes, materiales y sesiones desde aquí
            </p>
          </div>

          <div className="flex flex-wrap gap-3 mt-8">
            <Link
              to="/asesor/recursos_educativos"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              <BookOpen size={20} /> Ver temario
            </Link>
            <Link
              to="/asesor/grupos"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-700 hover:bg-slate-800 px-6 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
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
                className="bg-gradient-to-br from-slate-50 to-slate-100/50 border-slate-200 shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-lg">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-800 mb-2">¡Bienvenido al dashboard del curso!</h3>
                    <p className="text-base text-slate-600 leading-relaxed">
                      Desde aquí podrás acceder al temario, materiales, estudiantes y próximas sesiones. 
                      Explora todas las opciones disponibles para gestionar tu curso de manera eficiente.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-semibold">
                        <TrendingUp className="h-3.5 w-3.5" /> Gestión completa
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-semibold">
                        <UserCheck className="h-3.5 w-3.5" /> Control total
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
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Users className="text-slate-700" size={20} />
                    </div>
                  }
                  className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-slate-200"
                >
                  <p className="mt-2 mb-4 text-sm text-slate-600 leading-relaxed">
                    Visualiza y gestiona los grupos que se te han asignado. Accede a la lista completa de estudiantes por grupo.
                  </p>
                  <Link
                    to="/asesor/grupos"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    Ver Grupos <ArrowLeft className="h-4 w-4 rotate-180" />
                  </Link>
                </DashboardCard>

                <DashboardCard 
                  title="Materiales y recursos"
                  actions={
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <BookOpen className="text-slate-700" size={20} />
                    </div>
                  }
                  className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-slate-200"
                >
                  <p className="mt-2 mb-4 text-sm text-slate-600 leading-relaxed">
                    Accede a todo el material de apoyo, recursos del curso y documentación necesaria para tus sesiones.
                  </p>
                  <Link
                    to="/asesor/recursos_educativos"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-800 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    Ir al temario <ArrowLeft className="h-4 w-4 rotate-180" />
                  </Link>
                </DashboardCard>
              </div>

              {/* Tarjeta de Estadísticas Rápidas */}
              <DashboardCard 
                className="bg-gradient-to-br from-slate-50 to-white border-slate-200"
              >
                <h3 className="text-base font-bold text-slate-800 mb-4">Accesos rápidos</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Link
                    to="/asesor/actividades"
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 hover:shadow-lg hover:scale-105 transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 text-center">Actividades</span>
                  </Link>
                  
                  <Link
                    to="/asesor/feedback"
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 hover:shadow-lg hover:scale-105 transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <UserCheck className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 text-center">Feedback</span>
                  </Link>
                  
                  <Link
                    to="/asesor/agenda"
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 hover:shadow-lg hover:scale-105 transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 text-center">Agenda</span>
                  </Link>
                  
                  <Link
                    to="/asesor/simuladores"
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 hover:shadow-lg hover:scale-105 transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 text-center">Simuladores</span>
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
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                    <Calendar className="text-amber-600" size={20} />
                  </div>
                }
                className="border-amber-100 shadow-lg"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center shadow-md">
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse mb-2"></div>
                      <div className="h-3 w-1/2 bg-slate-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                  
                  <div className="text-center py-6">
                    <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-600 mb-1">
                      No hay sesiones programadas aún
                    </p>
                    <p className="text-xs text-slate-500">
                      Las próximas sesiones aparecerán aquí
                    </p>
                  </div>
                </div>
              </DashboardCard>

              {/* Información del Curso */}
              <DashboardCard 
                className="bg-gradient-to-br from-slate-50 to-slate-100/50 border-slate-200"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-md">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">Información del curso</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/60 backdrop-blur-sm">
                    <span className="text-xs font-medium text-slate-600">Curso activo</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      Activo
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-white/60 backdrop-blur-sm">
                    <p className="text-xs font-medium text-slate-600 mb-1">Última actualización</p>
                    <p className="text-sm font-semibold text-slate-800">Hoy</p>
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
