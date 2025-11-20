// Simuladores.jsx
import { Link } from "react-router-dom";
import { Zap, Target, Brain, ArrowRight, Clock } from "lucide-react";

const ACCENTS = {
  violet: {
    ring: "ring-violet-200/60 hover:ring-violet-300/80 from-white to-violet-50/40",
    icon: "text-violet-600",
    link: "text-violet-700 hover:text-violet-800",
  },
  indigo: {
    ring: "ring-indigo-200/60 hover:ring-indigo-300/80 from-white to-indigo-50/40",
    icon: "text-indigo-600",
    link: "text-indigo-700 hover:text-indigo-800",
  },
  blue: {
    ring: "ring-blue-200/60 hover:ring-blue-300/80 from-white to-blue-50/40",
    icon: "text-blue-600",
    link: "text-blue-700 hover:text-blue-800",
  },
};

function SimCard({ icon: Icon, title, subtitle, desc, to, accent = "violet" }) {
  const a = ACCENTS[accent] || ACCENTS.violet;

  return (
    <article
      className={[
        "group rounded-2xl border border-slate-200/60 ring-1",
        "bg-gradient-to-b transition shadow-sm hover:shadow-xl",
        "p-8 sm:p-10 hover:-translate-y-0.5",
        "focus-within:ring-2 focus-within:ring-offset-1 focus-within:ring-offset-white",
        "dark:focus-within:ring-offset-slate-900",
        a.ring,
      ].join(" ")}
    >
      <div
        className={[
          "mb-6 inline-grid h-16 w-16 place-items-center rounded-2xl",
          "bg-gradient-to-br from-white/60 to-slate-100",
          "shadow-inner ring-1 ring-slate-200/70",
        ].join(" ")}
      >
        <Icon className={["h-9 w-9", a.icon].join(" ")} />
      </div>

      <h3 className="text-2xl font-semibold text-slate-900">{title}</h3>
      <p className={["mt-1 text-lg font-semibold", a.link.split(" ")[0]].join(" ")}>{subtitle}</p>

      <p className="mt-4 max-w-prose text-slate-600">{desc}</p>

      <Link
        to={to}
        className={[
          "mt-8 inline-flex items-center gap-2 font-semibold",
          "outline-none focus-visible:underline",
          a.link,
        ].join(" ")}
      >
        ACCEDER
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </article>
  );
}

export default function Simuladores() {
  return (
  <div className="mx-auto max-w-9xl px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-6">
      <div className="space-y-3 sm:space-y-4">
        {/* Hero panel */}
        <section
          aria-label="encabezado de simulaciones"
          className="rounded-3xl border border-slate-200/70 ring-1 ring-slate-200/60 bg-gradient-to-tr from-white to-violet-50/50 px-4 py-2 sm:px-5 sm:py-3 lg:px-6 lg:py-4 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <h1 className="uppercase tracking-tight text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-violet-700 to-indigo-700 bg-clip-text text-transparent">
                Simulaciones
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl">
                Simuladores para exámenes de ingreso y evaluaciones académicas.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 self-start sm:self-auto rounded-full bg-white/80 backdrop-blur px-3 py-1.5 text-sm text-slate-600 ring-1 ring-slate-200 shadow-xs">
              <Clock className="h-4 w-4 text-violet-600" />
              <span className="font-medium">Actualizado hoy</span>
            </div>
          </div>
        </section>

        {/* Ribbon section header */}
  <header className="rounded-2xl border border-slate-200/70 ring-1 ring-slate-200/60 bg-gradient-to-r from-violet-50/70 to-indigo-50/70 px-3 py-2 sm:px-3.5 sm:py-2.5 shadow-sm">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="relative inline-grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md">
              <Zap className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 inline-grid h-4 w-4 place-items-center rounded-full bg-amber-400 text-[9px] font-bold text-slate-900 ring-2 ring-white">
                ★
              </span>
            </div>

            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl leading-none font-extrabold tracking-tight text-slate-900">
                SIMULADORES
              </h2>
              <div className="mt-2 h-1 w-24 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600"></div>
              <p className="mt-2 text-sm text-slate-500">Elige el tipo de simulación que deseas gestionar</p>
            </div>
          </div>
        </header>

  <section className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
        <SimCard
          icon={Target}
          title="Simulador por"
          subtitle="áreas generales"
          desc="Visualiza y crea nuevas simulaciones."
          to="/asesor/simuladores/generales"
          accent="violet"
        />
        <SimCard
          icon={Brain}
          title="Simulador por"
          subtitle="módulos específicos"
          desc="Visualiza y crea simulaciones especializadas por área de conocimiento y carrera."
          to="/asesor/simuladores/especificos"
          accent="indigo"
        />
        </section>
      </div>
    </div>
  );
}
