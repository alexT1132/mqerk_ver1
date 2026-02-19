// Simuladores.jsx
import { Link } from "react-router-dom";
import { Zap, Target, Brain, ArrowRight, Clock } from "lucide-react";

/* Estilo alineado con Quizt&Act.jsx (Actividades y Quizzes) */
const CARD_STYLES = {
  violet: {
    border: "border-violet-200",
    hoverRing: "hover:ring-violet-200/50",
    bg: "from-violet-50 via-indigo-50/50 to-white",
    hoverOverlay: "group-hover:from-violet-50/30 group-hover:to-indigo-50/30",
    iconBg: "from-violet-600 via-indigo-600 to-purple-600",
    subtitle: "text-violet-700",
    button: "from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700",
  },
  indigo: {
    border: "border-indigo-200",
    hoverRing: "hover:ring-indigo-200/50",
    bg: "from-indigo-50 via-purple-50/50 to-white",
    hoverOverlay: "group-hover:from-indigo-50/30 group-hover:to-purple-50/30",
    iconBg: "from-indigo-600 via-purple-600 to-purple-600",
    subtitle: "text-indigo-700",
    button: "from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700",
  },
};

function SimCard({ icon: Icon, title, subtitle, desc, to, accent = "violet" }) {
  const s = CARD_STYLES[accent] || CARD_STYLES.violet;

  return (
    <article
      className={[
        "group relative flex flex-col h-full rounded-3xl border-2 shadow-xl ring-2 ring-slate-100/50",
        "bg-gradient-to-br transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl",
        s.border,
        s.bg,
        s.hoverRing,
      ].join(" ")}
    >
      <div
        className={[
          "absolute inset-0 rounded-3xl bg-gradient-to-br transition-all duration-300",
          "from-transparent to-transparent",
          s.hoverOverlay,
        ].join(" ")}
      />
      <div className="relative flex flex-col flex-1 min-h-0 p-6 sm:p-9 2xl:p-12 text-center">
        <div
          className={[
            "mx-auto inline-flex w-16 h-16 sm:w-20 sm:h-20 2xl:w-28 2xl:h-28 items-center justify-center rounded-3xl text-white shadow-2xl shrink-0",
            "bg-gradient-to-br ring-4 ring-white/50 group-hover:scale-110 transition-transform duration-300",
            s.iconBg,
          ].join(" ")}
        >
          <Icon className="w-8 h-8 sm:w-10 sm:h-10 2xl:w-14 2xl:h-14" />
        </div>
        <h3 className="mt-6 sm:mt-7 2xl:mt-8 text-2xl sm:text-3xl 2xl:text-4xl font-bold text-slate-900 shrink-0">
          {title}
        </h3>
        <p className={`mt-1.5 sm:mt-2 2xl:mt-3 text-xl sm:text-2xl 2xl:text-3xl font-bold shrink-0 ${s.subtitle}`}>
          {subtitle}
        </p>
        <p className="mt-3 sm:mt-4 2xl:mt-5 flex-1 min-h-0 text-sm sm:text-base 2xl:text-lg text-slate-600 font-medium leading-relaxed">
          {desc}
        </p>
        <div className="mt-auto pt-6 sm:pt-8 2xl:pt-10 shrink-0">
          <Link
            to={to}
            className={[
              "group/link inline-flex items-center gap-2 px-6 py-3 2xl:px-8 2xl:py-4 rounded-xl font-bold text-white text-base 2xl:text-lg",
              "bg-gradient-to-r shadow-lg hover:shadow-xl",
              "transition-all duration-200 hover:scale-105 active:scale-95",
              s.button,
            ].join(" ")}
          >
            ACCEDER
            <ArrowRight className="w-4 h-4 2xl:w-5 2xl:h-5 transition-transform group-hover/link:translate-x-1" />
          </Link>
        </div>
      </div>
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
            className="rounded-3xl border-2 border-slate-200/70 ring-2 ring-slate-200/40 bg-gradient-to-br from-white via-violet-50/30 to-indigo-50/30 px-6 py-5 sm:px-8 sm:py-6 lg:px-10 lg:py-8 2xl:px-12 2xl:py-10 shadow-lg"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-start gap-4 2xl:gap-6">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 2xl:w-24 2xl:h-24 rounded-2xl bg-gradient-to-br from-violet-100 via-indigo-100 to-purple-100 shadow-lg ring-4 ring-white">
                  <Zap className="h-8 w-8 sm:h-10 sm:w-10 2xl:h-12 2xl:w-12 text-violet-600" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl 2xl:text-7xl font-extrabold bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                    SIMULACIONES
                  </h1>
                  <p className="mt-3 2xl:mt-4 text-base sm:text-lg 2xl:text-xl text-slate-600 max-w-2xl font-medium">
                    Simuladores para exámenes de ingreso y evaluaciones académicas.
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-2.5 self-start sm:self-auto rounded-full bg-gradient-to-r from-violet-50 to-indigo-50 backdrop-blur-sm px-4 py-2.5 2xl:px-5 2xl:py-3 text-sm 2xl:text-base text-slate-700 ring-2 ring-violet-200/50 shadow-md">
                <Clock className="h-5 w-5 2xl:h-6 2xl:w-6 text-violet-600" />
                <span className="font-semibold">Actualizado hoy</span>
              </div>
            </div>
          </section>

          {/* Ribbon section header */}
          <header className="rounded-2xl border-2 border-violet-200/60 ring-2 ring-violet-200/40 bg-gradient-to-r from-violet-50/80 via-indigo-50/80 to-purple-50/80 px-5 py-4 sm:px-6 sm:py-5 2xl:px-8 2xl:py-6 shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-start gap-4 sm:gap-5 2xl:gap-6">
              <div className="relative inline-grid h-12 w-12 sm:h-14 sm:w-14 2xl:h-16 2xl:w-16 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-xl ring-4 ring-white/50">
                <Zap className="h-7 w-7 sm:h-8 sm:w-8 2xl:h-9 2xl:w-9" />
                <span className="absolute -top-1 -right-1 inline-grid h-5 w-5 2xl:h-6 2xl:w-6 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-[10px] 2xl:text-xs font-bold text-white ring-2 ring-white shadow-md">
                  ★
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="text-2xl sm:text-3xl 2xl:text-4xl leading-none font-extrabold tracking-tight text-slate-900">
                  SIMULADORES
                </h2>
                <div className="mt-3 2xl:mt-4 h-1.5 w-32 2xl:w-40 rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 shadow-sm"></div>
                <p className="mt-3 2xl:mt-4 text-sm sm:text-base 2xl:text-lg text-slate-600 font-medium">Elige el tipo de simulación que deseas gestionar</p>
              </div>
            </div>
          </header>

          {/* 2xl (1920×1080): contenedor más ancho y tarjetas más grandes */}
          <section className="mx-auto max-w-6xl 2xl:max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 xl:gap-16 2xl:gap-20">
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
