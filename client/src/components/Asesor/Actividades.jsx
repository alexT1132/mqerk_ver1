import { Link } from "react-router-dom";
import { GraduationCap, BookText, Calculator, Users, Languages, Layers, ArrowRight } from "lucide-react";
import { areaIdFromName } from "../../api/actividades";

const AREAS = [
  {
    title: "Español y redacción indirecta",
    subtitle: "Competencias comunicativas y lingüísticas",
    icon: <BookText className="w-6 h-6" />,
    colors: { from: "from-orange-500", to: "to-amber-600", tint: "bg-amber-50", ring: "ring-amber-100" },
    to: "/asesor/actividades/modulo",
  },
  {
    title: "Matemáticas y pensamiento analítico",
    subtitle: "Razonamiento lógico y matemático",
    icon: <Calculator className="w-6 h-6" />,
    colors: { from: "from-blue-500", to: "to-indigo-600", tint: "bg-indigo-50", ring: "ring-indigo-100" },
    to: "/asesor/actividades/modulo",
  },
  {
    title: "Habilidades transversales",
    subtitle: "Competencias interpersonales y sociales",
    icon: <Users className="w-6 h-6" />,
    colors: { from: "from-emerald-500", to: "to-teal-600", tint: "bg-emerald-50", ring: "ring-emerald-100" },
    to: "/asesor/actividades/modulo",
  },
  {
    title: "Lengua extranjera",
    subtitle: "Comunicación en idioma extranjero",
    icon: <Languages className="w-6 h-6" />,
    colors: { from: "from-violet-500", to: "to-purple-600", tint: "bg-violet-50", ring: "ring-violet-100" },
    to: "/asesor/actividades/modulo",
  },
  {
    title: "Módulos específicos",
    subtitle: "Conocimientos especializados",
    icon: <Layers className="w-6 h-6" />,
    colors: { from: "from-rose-500", to: "to-pink-600", tint: "bg-rose-50", ring: "ring-rose-100" },
    to: "/asesor/actividades/modulos_especificos",
  },
];

function SectionBadge() {
  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-violet-200/60 bg-gradient-to-r from-violet-50/80 via-indigo-50/80 to-purple-50/80 p-4 sm:p-5 shadow-xl ring-2 ring-slate-100/50 mb-5 sm:mb-6">
      <div className="pointer-events-none absolute -left-10 -top-14 h-48 w-48 rounded-full bg-violet-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 -bottom-14 h-48 w-48 rounded-full bg-indigo-200/50 blur-3xl" />
      <div className="relative z-10 flex items-center gap-3 sm:gap-4">
        <div className="relative grid size-11 sm:size-13 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-600 to-purple-600 text-white shadow-2xl ring-4 ring-white/50 shrink-0">
          <GraduationCap className="size-5 sm:size-6 text-white" />
          <div className="absolute -top-1 -right-1 inline-grid h-4 w-4 sm:h-5 sm:w-5 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white ring-2 ring-white shadow-md">
            <span className="text-[8px] sm:text-[10px] font-bold">★</span>
          </div>
        </div>
        <div className="flex flex-col min-w-0">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600">
            ÁREAS DE ESTUDIO
          </h2>
          <div className="mt-1 sm:mt-1.5 flex gap-2">
            <span className="h-1 w-12 sm:w-16 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 shadow-sm" />
            <span className="h-1 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-sm" />
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
        "group relative flex flex-col overflow-hidden w-full min-w-0",
        // Proporción algo menos alta para reducir espacio entre descripción y botón
        "aspect-[4/3] min-h-[160px] sm:min-h-[180px]",
        // Padding (solo 2xl: más grande para monitores ≥1536px; pantallas 13–14" 2160×1440 quedan con contenido normal)
        "rounded-2xl p-3 sm:p-4",
        "sm:rounded-3xl",
        "lg:p-4",
        "2xl:p-5",
        // Visual
        "bg-white border-2 shadow-lg",
        ring,
        "hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2",
      ].join(" ")}
    >
      {/* Fondos decorativos */}
      <div className={`pointer-events-none absolute inset-0 -z-10 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${tint} opacity-50 group-hover:opacity-70 transition-opacity duration-300`} />
      <div className="pointer-events-none absolute inset-0 rounded-2xl sm:rounded-3xl group-hover:from-white/10 group-hover:to-transparent transition-all duration-300" />

      {/* Icono (solo 2xl: más grande; xl y menores = contenido normal para 13–14" 2160×1440) */}
      <div className="relative w-11 h-11 sm:w-12 sm:h-12 2xl:w-16 2xl:h-16 rounded-xl sm:rounded-2xl grid place-items-center text-white shadow-lg ring-4 ring-white/50 group-hover:scale-105 transition-transform duration-300 shrink-0">
        <div className={`absolute inset-0 -z-10 blur-xl opacity-60 bg-gradient-to-br ${from} ${to} rounded-xl sm:rounded-2xl`} />
        <div className={`w-full h-full grid place-items-center rounded-xl sm:rounded-2xl bg-gradient-to-br ${from} ${to}`}>
          <div className="scale-110 2xl:scale-[1.35]">{icon}</div>
        </div>
      </div>

      {/* Texto (solo 2xl: letras más grandes; hasta xl = contenido normal) */}
      <h3 className="mt-2 sm:mt-2.5 2xl:mt-3 text-sm sm:text-sm lg:text-sm 2xl:text-xl font-bold leading-tight text-slate-900 line-clamp-2">
        {title}
      </h3>
      <p className="mt-0.5 2xl:mt-1 text-[0.7rem] sm:text-xs 2xl:text-base text-slate-600 font-medium leading-relaxed line-clamp-2">
        {subtitle}
      </p>

      {/* CTA: pegado al borde inferior de la tarjeta (a ras de marco) */}
      <div className="mt-auto shrink-0">
        <Link
          to={enlace}
          state={{ title, id_area: areaIdFromName(title) || null }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 2xl:px-4 2xl:py-2 rounded-xl text-xs 2xl:text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl group"
        >
          Explorar área
          <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 2xl:h-4 2xl:w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}

export default function AreasDeEstudio({ items = AREAS }) {
  return (
    <div className="min-h-screen relative w-full overflow-x-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 -z-50" />

      <section className="relative z-10 px-3 sm:px-4 lg:px-5 pt-4 sm:pt-6 pb-6 mx-auto w-full max-w-[1920px]">
        {/*
          Grid 4 columnas en lg+ para aprovechar todo el ancho; márgenes reducidos.
          Tarjetas flexibles (w-full) con aspect-square para ocupar el espacio disponible.
        */}
        <SectionBadge />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-4">
          {items.map((a, i) => (
            <AreaCard key={i} {...a} />
          ))}
        </div>
      </section>
    </div>
  );
}