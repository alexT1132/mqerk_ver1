import { Link } from "react-router-dom";

/** Iconitos SVG (sin librerías externas) */
function IconBook(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M20 22H6.5A2.5 2.5 0 0 1 4 19.5V5.6A2.6 2.6 0 0 1 6.6 3H20v19Z" />
      <path d="M8 7h8M8 11h8" />
    </svg>
  );
}
function IconCalculator(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M8 7h8M8 11h2M12 11h2M16 11h2M8 15h2M12 15h2M16 15h2" />
    </svg>
  );
}
function IconSparkles(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 3l1.8 3.6L17.5 8l-3.7 1.4L12 13l-1.8-3.6L6.5 8l3.7-1.4L12 3z" />
      <path d="M19 14l.9 1.8L22 17l-2.1.8L19 20l-.9-2.2L16 17l2.1-1.2L19 14z" />
      <path d="M5 14l.9 1.8L8 17l-2.1.8L5 20l-.9-2.2L2 17l2.1-1.2L5 14z" />
    </svg>
  );
}
function IconPen(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}
function IconGlobe(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18z" />
    </svg>
  );
}

const SUBJECTS = [
  {
    key: "espanol",
    title: "Español",
    desc: "Comprensión, gramática y vocabulario.",
    gradient: "from-violet-500 to-fuchsia-500",
    Icon: IconBook,
    to: '/asesor/nuevo_simulador/modulo'
  },
  {
    key: "matematicas",
    title: "Matemáticas",
    desc: "Aritmética, álgebra y razonamiento.",
    gradient: "from-sky-500 to-indigo-500",
    Icon: IconCalculator,
    to: '/asesor/nuevo_simulador/modulo'
  },
  {
    key: "habilidades",
    title: "Habilidades transversales",
    desc: "Pensamiento crítico, lógica y gestión.",
    gradient: "from-emerald-500 to-teal-500",
    Icon: IconSparkles,
    to: '/asesor/nuevo_simulador/modulo'
  },
  {
    key: "redaccion",
    title: "Redacción",
    desc: "Estructura, estilo y claridad.",
    gradient: "from-amber-500 to-orange-500",
    Icon: IconPen,
    to: '/asesor/nuevo_simulador/modulo'
  },
  {
    key: "lenguas",
    title: "Lenguas extranjeras",
    desc: "Inglés u otros idiomas.",
    gradient: "from-rose-500 to-pink-500",
    Icon: IconGlobe,
    to: '/asesor/nuevo_simulador/modulo'
  },
];

export default function SubjectsGrid({ onCreate }) {
  const handleCreate = (s) => onCreate?.(s); // te pasamos todo el objeto de la materia

  return (
    <section className="mx-auto w-full px-4 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Crear formularios por materia
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Elige una categoría y genera rápidamente un nuevo formulario.
        </p>
      </header>

      {/* Grid responsive */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SUBJECTS.map(({ key, title, desc, gradient, Icon, to }) => (
          <article
            key={key}
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm transition hover:shadow-md"
          >
            {/* Badge de ícono con gradiente */}
            <div
              className={`mb-4 inline-grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-sm`}
              aria-hidden="true"
            >
              <Icon className="h-6 w-6" />
            </div>

            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-slate-500">{desc}</p>

            {/* Footer / botón */}
            <div className="mt-4">
              <Link
                to={to}
                className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                Crear formulario
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7.293 14.707a1 1 0 0 1 0-1.414L10.586 10 7.293 6.707a1 1 0 1 1 1.414-1.414L13.414 10l-4.707 4.707a1 1 0 0 1-1.414 0Z" />
                </svg>
              </Link>
            </div>

            {/* Accento tenue al hover */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-violet-200/60 to-transparent opacity-0 transition group-hover:opacity-100" />
          </article>
        ))}
      </div>
    </section>
  );
}
