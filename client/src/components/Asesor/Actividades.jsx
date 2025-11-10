import { Link, useLocation } from "react-router-dom";
import { GraduationCap, BookText, Calculator, Users, Languages, Layers } from "lucide-react";
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
    <div className="relative -mt-3 sm:-mt-5 md:-mt-6 mx-auto max-w-8xl overflow-hidden rounded-3xl border border-cyan-200/40 bg-gradient-to-r from-cyan-50/70 via-white to-indigo-50/70 p-5 sm:p-7 shadow-sm mb-6">
      {/* blobs suaves al fondo */}
      <div className="pointer-events-none absolute -left-10 -top-14 h-56 w-56 rounded-full bg-cyan-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 -bottom-14 h-56 w-56 rounded-full bg-indigo-200/40 blur-3xl" />

      <div className="relative z-10 flex items-center gap-4">
        {/* ícono */}
        <div className="relative grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-sky-500 to-violet-600 text-white shadow-lg sm:size-14">
          <GraduationCap className="size-6 sm:size-7 text-white" />
        </div>

        <div className="flex flex-col">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-sky-700 to-violet-700">
            ÁREAS DE ESTUDIO
          </h2>
          {/* subrayado doble */}
          <div className="mt-1 flex gap-2">
            <span className="h-1 w-16 rounded-full bg-gradient-to-r from-sky-500 to-sky-300" />
            <span className="h-1 w-10 rounded-full bg-gradient-to-r from-violet-500 to-violet-300" />
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
        "group relative overflow-hidden rounded-2xl p-6 sm:p-7 shadow-sm",
        "bg-white/90 backdrop-blur",
        "ring-1",
        ring,
        "hover:ring-2 hover:ring-black/5",
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
      ].join(" ")}
    >
      <div className={`w-12 h-12 rounded-xl grid place-items-center text-white shadow ${tint} ring-8 ring-white/60`}>
        <div className={`w-12 h-12 absolute -z-10 blur-xl opacity-70 bg-gradient-to-br ${from} ${to} rounded-xl`} />
        <div className={`w-12 h-12 grid place-items-center rounded-xl bg-gradient-to-br ${from} ${to}`}>
          {icon}
        </div>
      </div>

      <h3 className="mt-5 text-lg sm:text-xl font-semibold leading-tight text-slate-900">
        {title}
      </h3>
      <p className="mt-1 text-sm text-slate-600">
        {subtitle}
      </p>

      <div className="mt-6 flex items-center gap-2 text-sm font-medium">
        <Link
          to={enlace}
          state={{ title, id_area: areaIdFromName(title) || null }}
          className="inline-flex items-center gap-2 text-slate-800 group-hover:underline"
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
    <section className="px-4 sm:px-6 lg:px-8 pt-0 sm:pt-0 pb-6">
      <div className="space-y-3 sm:space-y-4">
        <SectionBadge />

        <div className="mx-auto max-w-8xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {items.map((a, i) => (
            <AreaCard key={i} {...a} />
          ))}
        </div>
      </div>
    </section>
  );
}
