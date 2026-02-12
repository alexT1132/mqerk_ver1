import { Link, useLocation } from "react-router-dom";
import { GraduationCap, BookText, Calculator, Users, Languages, Layers, ArrowRight } from "lucide-react";
import { areaIdFromName } from "../../api/actividades";

const AREAS = [
  {
    title: "Español y redacción indirecta",
    subtitle: "Competencias comunicativas y lingüísticas",
    icon: (<BookText className="w-6 h-6" />),
    colors: { from: "from-orange-500", to: "to-amber-600", tint: "bg-amber-50", ring: "ring-amber-100" },
    to: "/asesor/actividades/modulo",
  },
  {
    title: "Matemáticas y pensamiento analítico",
    subtitle: "Razonamiento lógico y matemático",
    icon: (<Calculator className="w-6 h-6" />),
    colors: { from: "from-blue-500", to: "to-indigo-600", tint: "bg-indigo-50", ring: "ring-indigo-100" },
    to: "/asesor/actividades/modulo",
  },
  {
    title: "Habilidades transversales",
    subtitle: "Competencias interpersonales y sociales",
    icon: (<Users className="w-6 h-6" />),
    colors: { from: "from-emerald-500", to: "to-teal-600", tint: "bg-emerald-50", ring: "ring-emerald-100" },
    to: "/asesor/actividades/modulo",
  },
  {
    title: "Lengua extranjera",
    subtitle: "Comunicación en idioma extranjero",
    icon: (<Languages className="w-6 h-6" />),
    colors: { from: "from-violet-500", to: "to-purple-600", tint: "bg-violet-50", ring: "ring-violet-100" },
    to: "/asesor/actividades/modulo",
  },
  {
    title: "Módulos específicos",
    subtitle: "Conocimientos especializados",
    icon: (<Layers className="w-6 h-6" />),
    colors: { from: "from-rose-500", to: "to-pink-600", tint: "bg-rose-50", ring: "ring-rose-100" },
    to: "/asesor/actividades/modulos_especificos",
  },
];
function SectionBadge() {
  return (
    <div className="relative mx-auto max-w-8xl overflow-hidden rounded-3xl border-2 border-violet-200/60 bg-gradient-to-r from-violet-50/80 via-indigo-50/80 to-purple-50/80 p-6 sm:p-8 shadow-xl ring-2 ring-slate-100/50 mb-8">
      {/* blobs suaves al fondo */}
      <div className="pointer-events-none absolute -left-10 -top-14 h-64 w-64 rounded-full bg-violet-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 -bottom-14 h-64 w-64 rounded-full bg-indigo-200/50 blur-3xl" />

      <div className="relative z-10 flex items-center gap-5">
        {/* ícono */}
        <div className="relative grid size-16 sm:size-20 place-items-center rounded-3xl bg-gradient-to-br from-violet-500 via-indigo-600 to-purple-600 text-white shadow-2xl ring-4 ring-white/50">
          <GraduationCap className="size-8 sm:size-10 text-white" />
          <div className="absolute -top-1 -right-1 inline-grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white ring-2 ring-white shadow-md">
            <span className="text-[10px] font-bold">★</span>
          </div>
        </div>

        <div className="flex flex-col">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600">
            ÁREAS DE ESTUDIO
          </h2>
          {/* subrayado doble */}
          <div className="mt-2 flex gap-2">
            <span className="h-1.5 w-20 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 shadow-sm" />
            <span className="h-1.5 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-sm" />
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
        "group relative flex flex-col h-full overflow-hidden rounded-3xl p-7 sm:p-8 shadow-lg",
        "bg-white border-2",
        ring,
        "hover:shadow-2xl",
        "transition-all duration-300 hover:-translate-y-2",
      ].join(" ")}
    >
      {/* Tint de fondo con gradiente sutil */}
      <div className={`pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br ${tint} opacity-50 group-hover:opacity-70 transition-opacity duration-300`} />

      {/* Overlay sutil en hover */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/0 to-white/0 group-hover:from-white/10 group-hover:to-transparent transition-all duration-300" />

      <div className={`relative w-16 h-16 rounded-3xl grid place-items-center text-white shadow-xl ring-4 ring-white/50 group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
        <div className={`w-16 h-16 absolute -z-10 blur-2xl opacity-60 bg-gradient-to-br ${from} ${to} rounded-3xl group-hover:opacity-80 transition-opacity duration-300`} />
        <div className={`w-16 h-16 grid place-items-center rounded-3xl bg-gradient-to-br ${from} ${to}`}>
          <div className="scale-125">
            {icon}
          </div>
        </div>
      </div>

      <h3 className="mt-6 text-xl sm:text-2xl font-bold leading-tight text-slate-900">
        {title}
      </h3>
      <p className="mt-2 text-sm text-slate-600 font-medium leading-relaxed">
        {subtitle}
      </p>

      <div className="mt-auto pt-8 flex items-center">
        <Link
          to={enlace}
          state={{ title, id_area: areaIdFromName(title) || null }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl group"
        >
          Explorar área
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}

export default function AreasDeEstudio({ items = AREAS }) {
  return (
    <div className="min-h-screen relative w-full overflow-x-hidden">
      {/* Fondo fijo independiente del scroll */}
      <div className="fixed inset-0 bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 -z-50"></div>

      <section className="relative z-10 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-6">
        <div className="space-y-3 sm:space-y-4">
          <SectionBadge />

          <div className="mx-auto max-w-8xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {items.map((a, i) => (
              <AreaCard key={i} {...a} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
