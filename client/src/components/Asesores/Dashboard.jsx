// CursoBienvenida.jsx
import { useEffect, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

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
    <div className="bg-slate-50">
      {/* Hero */}
      <header className="bg-gradient-to-r from-violet-700 to-indigo-600">
        <div className="mx-auto w-[88%] px-4 py-10">
          <button
            onClick={() => navigate('/asesor')}
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur hover:bg-white/15"
          >
            ⟵ Regresar
          </button>

          <p className="text-sm uppercase tracking-wider text-white/80">
            Bienvenido al curso
          </p>
          <h1 className="mt-1 text-3xl font-bold text-white sm:text-4xl">
            {nombreCurso}
          </h1>

          <div className="mt-6 flex flex-wrap gap-3">
            <button className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-white/25">
              Ver temario
            </button>
          </div>
        </div>
      </header>

      {/* Contenido minimal */}
      <main className="mx-auto max-w-8xl px-4 py-10">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <section className="md:col-span-2 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800">
                Panel de bienvenida
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Aquí podrás acceder al temario, materiales, estudiantes y
                próximas sesiones. ¡Éxito!
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-1">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-800">
                  Grupos asignados
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Aqui podras visualizar los grupos que se te han asignado.
                </p>
                <Link to="/asesor/grupos" className="mt-3 text-sm font-semibold text-indigo-600 hover:underline">
                  Ver Grupos →
                </Link>
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-800">
                Próximas sesiones
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                No hay sesiones programadas aún.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
