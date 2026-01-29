import React from "react";

/** Iconos simples (SVG) */
const IconUsers = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconTasks = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
    <rect x="3" y="4" width="18" height="16" rx="3" />
    <path d="M8 9h8M8 13h8M8 17h5" />
    <path d="m6 9 .8.8L8.5 8" />
  </svg>
);

/** Tarjeta reutilizable */
function Card({ color, icon, title, subtitle, href = "#", onClick }) {
  const colorMap = {
    amber: {
      pill: "from-amber-500 to-orange-600",
      soft: "bg-amber-50",
      ring: "ring-amber-200",
      text: "text-amber-700",
    },
    violet: {
      pill: "from-indigo-500 to-violet-600",
      soft: "bg-indigo-50",
      ring: "ring-indigo-200",
      text: "text-indigo-700",
    },
  }[color];

  const Container = onClick ? "button" : "a";
  const extra = onClick ? { onClick, type: "button" } : { href };

  return (
    <Container
      className="group relative w-full rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100 transition
                 hover:shadow-lg hover:ring-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
      {...extra}
    >
      {/* Icono */}
      <div
        className={`mb-4 inline-grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-b ${colorMap.pill}
                    text-white shadow-md shadow-black/10`}
      >
        {icon}
      </div>

      {/* Contenido */}
      <h3 className="text-base md:text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>

      {/* CTA */}
      <div className="mt-5 flex items-center gap-2 text-sm font-medium text-slate-700">
        <span>Explorar área</span>
        <svg
          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      </div>

      {/* Soft background aura */}
      <div className={`pointer-events-none absolute inset-0 -z-10 rounded-3xl ${colorMap.soft} opacity-70`} />
      <div className={`pointer-events-none absolute inset-0 rounded-3xl ring-1 ${colorMap.ring}`} />
    </Container>
  );
}

/** Sección completa */
export default function AreasPrincipales() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 md:px-6 py-6 md:py-10">
      {/* Header */}
      <div className="relative mb-8 rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100/60 p-6 text-center shadow-sm">
        <div className="mx-auto inline-flex items-center gap-2 rounded-2xl bg-white/70 px-3 py-1 ring-1 ring-slate-200 shadow">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-700" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16v6H4z" /><path d="M8 14h8" /><path d="M6 18h12" />
          </svg>
          <span className="text-xs font-semibold tracking-wide text-slate-700">ÁREAS</span>
        </div>
        <h2 className="mt-3 text-xl md:text-2xl font-bold tracking-wide text-slate-900">
          Panel principal
        </h2>
        {/* líneas decorativas */}
        <div className="mx-auto mt-2 h-1 w-24 rounded-full bg-gradient-to-r from-slate-300 via-slate-200 to-slate-300" />
      </div>

      {/* Grid de tarjetas */}
      <div className="grid grid-cols-1 gap-4 md:gap-6 sm:grid-cols-2">
        <Card
          color="amber"
          icon={<IconUsers className="h-6 w-6" />}
          title="Asesores"
          subtitle="Gestión de asesores, contacto y seguimiento."
          href="/administrador_asesores/infotmacion"
        />
        <Card
          color="violet"
          icon={<IconTasks className="h-6 w-6" />}
          title="Asignaciones"
          subtitle="Tareas, cursos y distribución de actividades."
          href="/administrador_asesores/asignaciones"
        />
      </div>
    </section>
  );
}