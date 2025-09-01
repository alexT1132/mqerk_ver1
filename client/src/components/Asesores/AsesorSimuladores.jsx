// Simuladores.jsx
import { Link } from "react-router-dom";
import { Zap, Target, Brain, ArrowRight } from "lucide-react";

const ACCENT_CLASSES = {
  violet:
    "ring-violet-200/60 hover:ring-violet-300/80 from-white to-violet-50/40",
  indigo:
    "ring-indigo-200/60 hover:ring-indigo-300/80 from-white to-indigo-50/40",
  blue: "ring-blue-200/60 hover:ring-blue-300/80 from-white to-blue-50/40",
};

function SimCard({ icon: Icon, title, subtitle, desc, to, accent = "violet" }) {
  const accentClasses = ACCENT_CLASSES[accent] || ACCENT_CLASSES.violet;

  return (
    <article
      className={[
        "rounded-2xl border border-slate-200/60 ring-1",
        "bg-gradient-to-b transition shadow-sm hover:shadow-xl",
        "p-8 sm:p-10",
        "hover:-translate-y-0.5",
        accentClasses,
      ].join(" ")}
    >
      <div
        className={[
          "mb-6 inline-grid h-16 w-16 place-items-center rounded-2xl",
          "bg-gradient-to-br from-white/60 to-slate-100",
          "shadow-inner ring-1 ring-slate-200/70",
        ].join(" ")}
      >
        <Icon className="h-9 w-9 text-violet-600" />
      </div>

      <h3 className="text-2xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-lg font-semibold text-violet-700">{subtitle}</p>

      <p className="mt-4 max-w-prose text-slate-600">{desc}</p>

      <Link
        to={to}
        className="mt-8 inline-flex items-center gap-2 font-semibold text-violet-700 hover:text-violet-800"
      >
        ACCEDER <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}

export default function Simuladores() {
  return (
    <div className="mx-auto max-w-9xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <header className="relative mb-8 rounded-2xl border border-slate-200/60 ring-1 ring-violet-200/50 bg-gradient-to-br from-white to-slate-50/60 shadow-sm">
        <div className="flex items-center gap-4 px-5 sm:px-8 py-5 sm:py-6">
          <div className="relative inline-grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md">
            <Zap className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 inline-grid h-5 w-5 place-items-center rounded-full bg-amber-400 text-[10px] font-bold text-slate-900 ring-2 ring-white">
              ★
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-violet-700">
            SIMULADORES
          </h1>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SimCard
          icon={Target}
          title="Simulador por"
          subtitle="áreas generales"
          desc="Visualiza y crea nuevas simulaciones."
          to="/asesor_simuladores/generales"
          accent="violet"
        />
        <SimCard
          icon={Brain}
          title="Simulador por"
          subtitle="módulos específicos"
          desc="Visualiza y crea simulaciones especializadas por área de conocimiento y carrera."
          to="/asesor_simuladores/especificos"
          accent="indigo"
        />
      </section>
    </div>
  );
}
