import { Link } from "react-router-dom";

const MODULOS = [
  { title: "Ciencias Exactas", desc: "Matemáticas, Física, Química y afines", color: "from-sky-500 to-cyan-600", tint: "bg-sky-50" },
  { title: "Ciencias Sociales", desc: "Sociología, Psicología y más", color: "from-violet-500 to-fuchsia-600", tint: "bg-violet-50" },
  { title: "Humanidades y Artes", desc: "Literatura, Historia, Filosofía", color: "from-rose-500 to-pink-600", tint: "bg-rose-50" },
  { title: "Ciencias Naturales y de la Salud", desc: "Biología, Medicina, Enfermería", color: "from-green-500 to-emerald-600", tint: "bg-green-50" },
  { title: "Ingeniería y Tecnología", desc: "Ingenierías, Sistemas, Tecnología", color: "from-amber-500 to-orange-600", tint: "bg-amber-50" },
  { title: "Ciencias Económico-Administrativas", desc: "Administración, Economía, Negocios", color: "from-teal-500 to-emerald-600", tint: "bg-teal-50" },
  { title: "Educación y Deportes", desc: "Pedagogía y deportes", color: "from-purple-500 to-indigo-600", tint: "bg-purple-50" },
  { title: "Agropecuarias", desc: "Agronomía, Veterinaria, Zootecnia", color: "from-lime-500 to-green-600", tint: "bg-lime-50" },
  { title: "Turismo", desc: "Gestión turística y hotelería", color: "from-sky-500 to-blue-600", tint: "bg-sky-50" },
  { title: "Núcleo UNAM / IPN", desc: "Materias esenciales ingreso", color: "from-yellow-500 to-amber-500", tint: "bg-yellow-50" },
  { title: "Militar, Naval y Náutica Mercante", desc: "Preparación fuerzas e instituciones navales", color: "from-slate-500 to-slate-700", tint: "bg-slate-50" },
  { title: "Transversal: Análisis Psicométrico", desc: "Exámenes psicométricos y aptitud", color: "from-violet-500 to-purple-600", tint: "bg-violet-50" },
];

function IconBook({ className = "w-7 h-7" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M4 5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v14a1 1 0 0 1-1.447.894L14 18.118l-3.553 1.776A1 1 0 0 1 9 19.118V5H6a2 2 0 0 0-2 2v12a1 1 0 0 0 2 0V5Z" />
    </svg>
  );
}

function Header({ total }) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-black/5 bg-white/70 backdrop-blur dark:bg-white/5 p-5 sm:p-6 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link
                to="/asesor/actividades"
              aria-label="Volver"
              className="grid h-9 w-9 place-items-center rounded-xl border border-black/10 bg-white hover:bg-black/5 transition"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Módulos Específicos</h1>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-800 pl-12">
            Accede a tus áreas permitidas o solicita acceso a nuevas.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-sm">
          <span className="grid place-items-center w-8 h-8 rounded-lg bg-slate-100">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M12 22a10 10 0 1 1 10-10 10.011 10.011 0 0 1-10 10Zm-1-7h2v2h-2Zm0-8h2v6h-2Z" />
            </svg>
          </span>
          <span className="font-medium">{total} módulos disponibles</span>
        </div>
      </div>
    </div>
  );
}

function ModuleCard({ title, desc, color, tint }) {
  return (
    <article
      className={[
        "relative rounded-2xl p-6 sm:p-7",
        "bg-white/90 dark:bg-white/5 backdrop-blur",
        "ring-1 ring-black/5 hover:ring-black/10",
        "transition-all hover:-translate-y-0.5 hover:shadow-md",
      ].join(" ")}
    >
      {/* Badge */}
      <div className="relative w-16 h-16 mx-auto rounded-2xl grid place-items-center">
        <div className={`absolute inset-0 rounded-2xl blur-xl opacity-70 bg-gradient-to-br ${color}`} />
        <div className={`relative w-16 h-16 grid place-items-center rounded-2xl text-white shadow-lg bg-gradient-to-br ${color}`}>
          <IconBook />
        </div>
      </div>

      {/* Textos */}
      <h3 className="mt-5 text-center text-lg font-semibold leading-tight">{title}</h3>
      <p className="mt-1 text-center text-sm text-slate-600 dark:text-slate-800">{desc}</p>

      {/* CTA */}
      <div className="mt-6 flex justify-center">
        <button
          type="button"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
            <path d="M12 17a3 3 0 0 0 3-3v-1a3 3 0 0 0-6 0v1a3 3 0 0 0 3 3Zm6-3a6 6 0 1 0-12 0v1H4v6h16v-6h-2v-1Z" />
          </svg>
          Acceder
        </button>
      </div>

      {/* Tint muy leve como en la referencia */}
      <div className={`pointer-events-none absolute inset-0 -z-10 rounded-2xl ${tint}`} />
    </article>
  );
}

export default function ModulosEspecificos({ items = MODULOS }) {
  return (
    <section className="py-8 sm:py-10">
      <Header total={items.length} />

      <div className="mx-auto mt-6 sm:mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {items.map((m, i) => (
            <ModuleCard key={i} {...m} />
          ))}
        </div>
      </div>
    </section>
  );
}
