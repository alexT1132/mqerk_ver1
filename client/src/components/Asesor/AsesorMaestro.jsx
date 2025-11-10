// AsesorDashboard.jsx
import { Link } from "react-router-dom";

const CourseChip = ({ title, image }) => {
  return (
    <Link
      to="/asesor/dashboard"                    
      state={{ curso: title }}              
      onClick={() => localStorage.setItem("cursoSeleccionado", title)}
      className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <img src={image} alt={title} className="h-12 w-12 rounded-lg object-cover" />
      <h3 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition">
        {title}
      </h3>
    </Link>
  );
};

const AnalyticsCard = ({ user, stats }) => {
  return (
    <div className="rounded-3xl bg-gradient-to-tr from-violet-700 to-indigo-500 p-1 shadow-xl">
      <div className="rounded-3xl bg-gradient-to-b from-violet-700/10 to-indigo-600/10 p-6">
        {/* Avatar */}
        <div className="flex flex-col items-center text-center">
          <img
            src={user?.avatar}
            alt={user?.name}
            className="h-20 w-20 rounded-2xl border-4 border-white/30 object-cover shadow-md"
          />
          <h3 className="mt-4 text-lg font-semibold text-white">
            {user?.name}
          </h3>
          <p className="text-white/80 text-sm">{user?.role}</p>
          <p className="mt-1 text-[11px] tracking-wide text-white/70">
            ASESOR DESDE {user?.since}
          </p>
        </div>

        {/* KPIs */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          {stats?.slice(0, 4).map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-2xl bg-white/95 p-3 text-slate-800 shadow-sm"
            >
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-pink-50">
                <span className="text-base font-extrabold text-pink-600">
                  {s.value}
                </span>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Página                                                              */
/* ------------------------------------------------------------------ */

export default function AsesorDashboard({
  courses = [],
  user = {},
  stats = [],
}) {
  return (
    <div className="w-full m-0 p-0">
      {/* Layout fluido sin centrado forzado */}
      <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr] px-4 lg:px-6 py-4">
        {/* IZQUIERDA */}
        <div className="space-y-4">
          <section className="w-full">
            <h2 className="mb-3 text-2xl font-bold text-pink-600">
              Cursos activos
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
              {courses.map((c, i) => (
                <CourseChip key={c.id ?? i} title={c.title} image={c.image} />
              ))}
            </div>
          </section>
        </div>
        {/* DERECHA */}
        <aside className="self-start">
          <AnalyticsCard user={user} stats={stats} />
        </aside>
      </div>
    </div>
  );
}

/* Mock removido: provee props reales desde el bundle o deja vacío */