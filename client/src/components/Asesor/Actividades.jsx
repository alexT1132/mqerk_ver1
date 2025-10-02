import { Link } from "react-router-dom";

const AREAS = [
  {
    title: "Español y redacción indirecta",
    subtitle: "Competencias comunicativas y lingüísticas",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M4 3h12a2 2 0 0 1 2 2v3H6a2 2 0 0 0-2 2v9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm4 14h10v2H8v-2Zm0-4h10v2H8v-2Z" />
      </svg>
    ),
    colors: { from: "from-orange-500", to: "to-amber-600", tint: "bg-amber-50", ring: "ring-amber-100" },
    to: "#",
  },
  {
    title: "Matemáticas y pensamiento analítico",
    subtitle: "Razonamiento lógico y matemático",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M7 11h10v2H7v-2Zm0-6h10v2H7V5Zm0 12h10v2H7v-2Z" />
      </svg>
    ),
    colors: { from: "from-blue-500", to: "to-indigo-600", tint: "bg-indigo-50", ring: "ring-indigo-100" },
    to: "#",
  },
  {
    title: "Habilidades transversales",
    subtitle: "Competencias interpersonales y sociales",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M9 6a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm6 1h6v2h-6V7Zm0 4h6v2h-6v-2Zm-5 3a5 5 0 0 0-5 5H3a7 7 0 0 1 14 0h-2a5 5 0 0 0-5-5Z" />
      </svg>
    ),
    colors: { from: "from-emerald-500", to: "to-teal-600", tint: "bg-emerald-50", ring: "ring-emerald-100" },
    to: "#",
  },
  {
    title: "Lengua extranjera",
    subtitle: "Comunicación en idioma extranjero",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M3 4h18v2H3V4Zm0 4h10v2H3V8Zm0 4h7v2H3v-2Zm0 4h12v2H3v-2Zm15-6 3-3 1.4 1.4-3 3 3 3L22 19l-3-3-3 3-1.4-1.4 3-3-3-3L16 7l3 3Z" />
      </svg>
    ),
    colors: { from: "from-violet-500", to: "to-purple-600", tint: "bg-violet-50", ring: "ring-violet-100" },
    to: "#",
  },
  {
    title: "Módulos específicos",
    subtitle: "Conocimientos especializados",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M4 6h8v12H4V6Zm10 0h6v12h-6V6Z" />
      </svg>
    ),
    colors: { from: "from-rose-500", to: "to-pink-600", tint: "bg-rose-50", ring: "ring-rose-100" },
    to: "/asesor/actividades/modulos_especificos",
  },
];

function SectionBadge() {
  return (
    <div className="relative mx-auto max-w-8xl">
      <div className="rounded-2xl border border-white/40 bg-gradient-to-b from-white/70 to-white/20 backdrop-blur-lg dark:from-white/10 dark:to-white/5 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="shrink-0 grid place-items-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M4 4h16v2H4V4Zm2 4h12v12H6V8Zm2 2v8h8v-8H8Z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              <span className="text-indigo-600">ÁREAS</span> DE ESTUDIO
            </h2>
            <div className="mt-1 h-1 w-24 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

function AreaCard({ title, subtitle, icon, colors, to: enlace }) {
  const { from, to, tint, ring } = colors;
  return (
    <article
      className={[
        "group relative rounded-2xl p-6 sm:p-7 shadow-sm",
        "bg-white/90 dark:bg-white/5 backdrop-blur",
        "ring-1", ring,
        "hover:ring-2 hover:ring-black/5 dark:hover:ring-white/20",
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
      ].join(" ")}
    >
      <div className={`w-12 h-12 rounded-xl grid place-items-center text-white shadow ${tint} ring-8 ring-white/60 dark:ring-white/10`}>
        <div className={`w-12 h-12 absolute -z-10 blur-xl opacity-70 bg-gradient-to-br ${from} ${to} rounded-xl`} />
        <div className={`w-12 h-12 grid place-items-center rounded-xl bg-gradient-to-br ${from} ${to}`}>
          {icon}
        </div>
      </div>

      <h3 className="mt-5 text-lg font-semibold leading-tight">
        {title}
      </h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-800">
        {subtitle}
      </p>

      <div className="mt-6 flex items-center gap-2 text-sm font-medium">
        <Link
          to={enlace}
          className="inline-flex items-center gap-2 text-slate-800 dark:text-black group-hover:underline"
        >
          Explorar área
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </Link>
      </div>

      {/* Tint de fondo muy leve */}
      <div className={`pointer-events-none absolute inset-0 -z-10 rounded-2xl ${tint}`} />
    </article>
  );
}

export default function AreasDeEstudio({ items = AREAS }) {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <SectionBadge />

      <div className="mx-auto mt-6 sm:mt-10 max-w-8xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
        {items.map((a, i) => (
          <AreaCard key={i} {...a} />
        ))}
      </div>
    </section>
  );
}
