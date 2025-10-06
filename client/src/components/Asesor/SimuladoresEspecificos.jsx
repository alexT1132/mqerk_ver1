// AreasInteres.jsx
import {
  ArrowLeft,
  Brain,
  ArrowRight,
  FlaskConical,
  Users2,
  BookOpenText,
  HeartPulse,
  Cog,
  BriefcaseBusiness,
  Dumbbell,
  Sprout,
  Plane,
  Landmark,
  Anchor,
  ScanLine,
} from "lucide-react";
import { Link } from "react-router-dom";

/* -------------------------------------------
   Encabezado (minimal, con volver y contador)
-------------------------------------------- */
function HeaderInteres({ title, subtitle, total = 12, onBack }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-sky-50 to-indigo-50/60 px-4 sm:px-6 py-4 sm:py-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-600 hover:bg-white shadow-sm"
            aria-label="Regresar"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {title}
            </h1>
            {subtitle && (
              <p className="text-slate-600 text-sm sm:text-base">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-slate-700 shadow-sm">
          <Brain className="h-4 w-4" />
          <span className="text-sm">{total} módulos disponibles</span>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------
   Tarjeta de Área
-------------------------------------------- */
function AreaCard({ icon: Icon, title, desc, to = "#", gradient }) {
  return (
    <Link
      to={to}
      className="group relative rounded-3xl border border-slate-200 bg-white/80 p-6 sm:p-7 shadow-sm ring-1 ring-transparent hover:ring-violet-200 hover:shadow-md transition"
    >
      {/* halo de fondo */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl " />

      {/* icono */}
      <div
        className={[
          "mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-md",
          "ring-1 ring-inset ring-white/40",
          "bg-gradient-to-br",
          gradient || "from-violet-500 to-fuchsia-600",
        ].join(" ")}
      >
        <Icon className="h-7 w-7" />
      </div>

      {/* contenido */}
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600 leading-relaxed">{desc}</p>

      {/* CTA */}
      <div className="mt-5 inline-flex items-center gap-2 text-violet-700 group-hover:text-violet-800">
        <span className="text-sm font-medium">Seleccionar esta área</span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

/* -------------------------------------------
   Datos de las áreas (12)
-------------------------------------------- */
const AREAS = [
  {
    id: "exactas",
    title: "Ciencias Exactas",
    desc: "Matemáticas, Física, Química y afines",
    icon: FlaskConical,
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    id: "sociales",
    title: "Ciencias Sociales",
    desc: "Sociología, Psicología y más",
    icon: Users2,
    gradient: "from-fuchsia-500 to-violet-600",
  },
  {
    id: "humanidades",
    title: "Humanidades y Artes",
    desc: "Literatura, Historia, Filosofía",
    icon: BookOpenText,
    gradient: "from-pink-500 to-rose-600",
  },
  {
    id: "salud",
    title: "Ciencias de la Salud",
    desc: "Biología, Medicina, Enfermería",
    icon: HeartPulse,
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    id: "ingenieria",
    title: "Ingeniería y Tecnología",
    desc: "Ingenierías, Sistemas, Tecnología",
    icon: Cog,
    gradient: "from-amber-500 to-orange-600",
  },
  {
    id: "eco-admin",
    title: "Económico-Administrativas",
    desc: "Administración, Economía, Negocios",
    icon: BriefcaseBusiness,
    gradient: "from-cyan-600 to-indigo-600",
  },
  {
    id: "educ-deportes",
    title: "Educación y Deportes",
    desc: "Pedagogía y deportes",
    icon: Dumbbell,
    gradient: "from-violet-600 to-indigo-600",
  },
  {
    id: "agropecuarias",
    title: "Agropecuarias",
    desc: "Agronomía, Veterinaria, Zootecnia",
    icon: Sprout,
    gradient: "from-lime-600 to-emerald-600",
  },
  {
    id: "turismo",
    title: "Turismo",
    desc: "Gestión turística y hotelería",
    icon: Plane,
    gradient: "from-sky-500 to-indigo-600",
  },
  {
    id: "unam",
    title: "Núcleo UNAM / IPN",
    desc: "Materias esenciales de ingreso",
    icon: Landmark,
    gradient: "from-yellow-500 to-orange-600",
  },
  {
    id: "naval",
    title: "Militar / Naval / Náutica",
    desc: "Fuerzas e instituciones navales",
    icon: Anchor,
    gradient: "from-slate-600 to-slate-800",
  },
  {
    id: "psicometrico",
    title: "Transversal: Psicométrico",
    desc: "Exámenes psicométricos y aptitud",
    icon: ScanLine,
    gradient: "from-purple-500 to-fuchsia-600",
  },
];

/* -------------------------------------------
   Vista principal
-------------------------------------------- */
export default function AreasInteres() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <HeaderInteres
        title="Elige un modulo específico"
        subtitle="Selecciona un modulo para visualizar y/o crear un simulador."
        total={AREAS.length}
        onBack={() => window.history.back()}
      />

      {/* grilla responsive: 1/2/3/4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {AREAS.map((a) => (
          <AreaCard
            key={a.id}
            icon={a.icon}
            title={a.title}
            desc={a.desc}
            gradient={a.gradient}
            to={`/asesor_simuladores/modulo`}
          />
        ))}
      </div>
    </div>
  );
}
