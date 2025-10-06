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
  courses = DEFAULT_COURSES,
  user = DEFAULT_USER,
  stats = DEFAULT_STATS,
}) {
  return (
    <div className="flex justify-center mx-auto w-full px-4 py-6 lg:px-8">
      {/* 2 columnas: izquierda (2fr) / derecha (1fr) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* IZQUIERDA */}
        <div className="space-y-6">
          {/* Cursos */}
          <section>
            <h2 className="mb-4 text-2xl font-bold text-pink-600">
              Cursos activos
            </h2>

            {/* Grid de cursos: 1, 2, 3 y 4 columnas */}
            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3">
              {courses.map((c, i) => (
                <CourseChip key={c.id ?? i} title={c.title} image={c.image}/>
              ))}
            </div>
          </section>
        </div>

        {/* DERECHA (sticky) */}
        <aside className="h-fit lg:sticky lg:top-6">
          <AnalyticsCard user={user} stats={stats} />
        </aside>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Datos de ejemplo (puedes reemplazar por tus datos reales)           */
/* ------------------------------------------------------------------ */

const DEFAULT_COURSES = [
  {
    id: 1,
    title: "English Elemental",
    image:
      "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=200&q=80&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Matemáticas Básicas",
    image:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=200&q=80&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Computación I",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&q=80&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "Orientación Educativa",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&q=80&auto=format&fit=crop",
  },
  {
    id: 5,
    title: "EAU",
    image:
      "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=200&q=80&auto=format&fit=crop",
  },
  {
    id: 6,
    title: "Asesgral",
    image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=200&q=80&auto=format&fit=crop",
  },
  {
    id: 7,
    title: "Inglés Conversacional",
    image:
      "https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?w=200&q=80&auto=format&fit=crop",
  },
  {
    id: 8,
    title: "Cómputo Avanzado",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=200&q=80&auto=format&fit=crop",
  },
];

const DEFAULT_USER = {
  name: "Lic. César Emilio Lagunes Batalla",
  role: "English Teacher",
  since: "2023",
  avatar:
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80&auto=format&fit=crop",
};

const DEFAULT_STATS = [
  { label: "CURSOS", value: 3 },
  { label: "ESTUDIANTES", value: 56 },
  { label: "CERTIFICADOS", value: 2 },
  { label: "GENERACIONES", value: 2 },
];