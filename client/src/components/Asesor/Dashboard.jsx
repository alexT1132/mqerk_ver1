// CursoBienvenida.jsx
import { useEffect, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Calendar, Users, BookOpen } from "lucide-react";
import DashboardCard from "./DashboardCard";

export default function CursoBienvenida() {
  const navigate = useNavigate();
  const location = useLocation();

  // Prioridad: state.curso (viene del click) > localStorage > fallback
  const nombreFromState = location.state?.curso ?? null;
  const nombreFromStorage = useMemo(() => {
    try { return localStorage.getItem("cursoSeleccionado"); } catch { return null; }
  }, []);

  const nombreCurso = nombreFromState || nombreFromStorage || "Tu curso";

  // Si llegó por state, sincroniza storage para que persista tras recargar
  useEffect(() => {
    if (nombreFromState) {
      try { localStorage.setItem("cursoSeleccionado", nombreFromState); } catch {}
    }
  }, [nombreFromState]);

  return (
    <div className="min-h-screen bg-transparent">
      {/* Hero mejorado */}
  {/* Full-bleed: el layout ya no aplica padding, así que no necesitamos márgenes negativos */}
  <header className="relative isolate overflow-hidden w-full bg-gradient-to-r from-violet-700 to-indigo-600">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:24px_24px]"></div>
        {/* Full-bleed: sin max-width ni padding horizontal para que el morado ocupe todo */}
        <div className="relative w-full px-0 py-10 sm:py-12">
          <button
            onClick={() => navigate('/asesor')}
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/20 backdrop-blur transition hover:bg-white/15"
            aria-label="Regresar"
          >
            ⟵ Regresar
          </button>

          <p className="text-xs uppercase tracking-widest text-white/80">Bienvenido al curso</p>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white sm:text-4xl">{nombreCurso}</h1>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="#temario"
              className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/25 transition hover:bg-white/25"
            >
              <BookOpen size={18} /> Ver temario
            </Link>
          </div>
        </div>
      </header>

      {/* Contenido */}
  <main className="w-full px-0 py-4" aria-labelledby="panel-title">
        <h2 id="panel-title" className="sr-only">Panel del asesor</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <section className="md:col-span-2 space-y-4">
            <DashboardCard title="Panel de bienvenida">
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Aquí podrás acceder al temario, materiales, estudiantes y próximas sesiones. ¡Éxito!
              </p>
            </DashboardCard>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DashboardCard
                title="Grupos asignados"
                actions={<Users className="text-slate-400" size={18} />}
              >
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Aquí podrás visualizar los grupos que se te han asignado.
                </p>
                <Link
                  to="/asesor/grupos"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Ver Grupos →
                </Link>
              </DashboardCard>

              <DashboardCard title="Materiales" actions={<BookOpen className="text-slate-400" size={18} /> }>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Accede a material de apoyo y recursos del curso.
                </p>
                <Link
                  to="#temario"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Ir al temario →
                </Link>
              </DashboardCard>
            </div>
          </section>

          <aside className="space-y-4">
            <DashboardCard title="Próximas sesiones" actions={<Calendar className="text-slate-400" size={18} />}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" aria-hidden="true"></div>
                <div className="flex-1">
                  <div className="mb-1 h-3 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-700" aria-hidden="true"></div>
                  <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-slate-700" aria-hidden="true"></div>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                No hay sesiones programadas aún.
              </p>
            </DashboardCard>
          </aside>
        </div>
      </main>
    </div>
  );
}
