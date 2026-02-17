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
  const isViolet = accent === "violet";
  const gradientClass = isViolet
    ? "from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
    : "from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700";

  return (
    <article
      className={[
        "group flex flex-col h-full rounded-3xl border-2 border-slate-200/60 ring-2",
        "bg-gradient-to-br from-white to-slate-50/50 transition-all duration-300",
        "shadow-lg hover:shadow-2xl hover:-translate-y-2",
        "p-8 sm:p-10",
        "focus-within:ring-4 focus-within:ring-offset-2 focus-within:ring-offset-white",
        a.ring,
      ].join(" ")}
    >
      <div
        className={[
          "mb-6 inline-grid h-20 w-20 place-items-center rounded-3xl",
          "bg-gradient-to-br shadow-xl ring-4 ring-white/50",
          isViolet
            ? "from-violet-500 to-indigo-500"
            : "from-indigo-500 to-purple-500",
          "group-hover:scale-110 transition-transform duration-300",
        ].join(" ")}
      >
        <Icon className={["h-10 w-10 text-white"].join(" ")} />
      </div>

      <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">{title}</h3>
      <p className={["mt-2 text-xl font-bold", a.link.split(" ")[0]].join(" ")}>{subtitle}</p>

      <p className="mt-4 max-w-prose text-slate-600 leading-relaxed mb-8">{desc}</p>

      <Link
        to={to}
        className={[
          "mt-auto inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white w-fit",
          "bg-gradient-to-r shadow-lg hover:shadow-xl",
          "transition-all duration-200 hover:scale-105 active:scale-95",
          "outline-none focus-visible:ring-4 focus-visible:ring-offset-2",
          gradientClass,
        ].join(" ")}
      >
        ACCEDER
        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
      </Link>
    </article>
  );
}

export default function Simuladores() {
  return (
    <div className="min-h-screen relative w-full overflow-x-hidden">
      {/* Fondo fijo independiente del scroll */}
      <div className="fixed inset-0 bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 -z-50"></div>

      <div className="relative z-10 mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-6">
        <div className="space-y-4 sm:space-y-6">
          {/* Hero panel */}
          <section
            aria-label="encabezado de simulaciones"
            className="rounded-3xl border-2 border-slate-200/70 ring-2 ring-slate-200/40 bg-gradient-to-br from-white via-violet-50/30 to-indigo-50/30 px-6 py-5 sm:px-8 sm:py-6 lg:px-10 lg:py-8 shadow-lg"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-violet-100 via-indigo-100 to-purple-100 shadow-lg ring-4 ring-white">
                  <Zap className="h-8 w-8 sm:h-10 sm:w-10 text-violet-600" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                    SIMULACIONES
                  </h1>
                  <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-2xl font-medium">
                    Simuladores para exámenes de ingreso y evaluaciones académicas.
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-2.5 self-start sm:self-auto rounded-full bg-gradient-to-r from-violet-50 to-indigo-50 backdrop-blur-sm px-4 py-2.5 text-sm text-slate-700 ring-2 ring-violet-200/50 shadow-md">
                <Clock className="h-5 w-5 text-violet-600" />
                <span className="font-semibold">Actualizado hoy</span>
              </div>
            </div>
          </section>

          {/* Ribbon section header */}
          <header className="rounded-2xl border-2 border-violet-200/60 ring-2 ring-violet-200/40 bg-gradient-to-r from-violet-50/80 via-indigo-50/80 to-purple-50/80 px-5 py-4 sm:px-6 sm:py-5 shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="relative inline-grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-xl ring-4 ring-white/50">
                <Zap className="h-7 w-7 sm:h-8 sm:w-8" />
                <span className="absolute -top-1 -right-1 inline-grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-[10px] font-bold text-white ring-2 ring-white shadow-md">
                  ★
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="text-2xl sm:text-3xl leading-none font-extrabold tracking-tight text-slate-900">
                  SIMULADORES
                </h2>
                <div className="mt-3 h-1.5 w-32 rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 shadow-sm"></div>
                <p className="mt-3 text-sm sm:text-base text-slate-600 font-medium">Elige el tipo de simulación que deseas gestionar</p>
              </div>
            </div>
          </header>

          <section className="grid grid-cols-1 gap-4 sm:gap-5 lg:gap-8 xl:gap-12 lg:grid-cols-2 max-w-6xl mx-auto w-full">
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
    </div>
  );
}
