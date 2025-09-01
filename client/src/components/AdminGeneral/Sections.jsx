import React from "react";

/* ---- Chip simple ---- */
const Chip = ({ children, tone = "neutral" }) => {
  const map = {
    neutral: "bg-slate-100 text-slate-700",
    green: "bg-emerald-100 text-emerald-700",
    yellow: "bg-amber-100 text-amber-700",
    red: "bg-rose-100 text-rose-700",
    blue: "bg-blue-100 text-blue-700",
    violet: "bg-violet-100 text-violet-700",
    indigo: "bg-indigo-100 text-indigo-700",
  }[tone];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${map}`}>
      {children}
    </span>
  );
};

/* ---- Píldora de título con color ---- */
const TitlePill = ({ label, color = "indigo" }) => {
  const classes = {
    indigo: "bg-indigo-600",
    violet: "bg-violet-600",
    blue: "bg-blue-600",
    green: "bg-emerald-600",
    orange: "bg-orange-600",
    pink: "bg-pink-600",
  }[color];
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white ${classes}`}>
      {label}
    </span>
  );
};

/* ---- Tarjeta ---- */
export function MiniCard({
  icon,
  title = "Finanzas",
  titleColor = "violet",
  subtitle = "Semáforo: saludable",
  href = "#",
  onSelect
}) {

  const handleClick = (e) => {
    // si usas <a>, evita navegación del hash
    e?.preventDefault?.();
    console.log("Tarjeta clic:", title);
    onSelect?.({ title, subtitle, titleColor }); // <- envía el payload
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className="group block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            {icon}
          </div>
          <div className="space-y-1">
            <TitlePill label={title} color={titleColor} />
            {subtitle && <p className="text-[11px] text-slate-500">{subtitle}</p>}
          </div>
        </div>

        <div className="mt-1 rounded-full border border-slate-200 p-1 text-slate-400 transition group-hover:text-slate-600">
          <IconChevronRight className="h-4 w-4" />
        </div>
      </div>
    </a>
  );
}

/* ---- Tarjeta con chips debajo ---- */
export function MiniCardWithChips(props) {
  const { chips = [] } = props;
  return (
    <div className="space-y-2">
      <MiniCard {...props} />
      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((c, i) => (
            <Chip key={i} tone={c.tone}>{c.text}</Chip>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---- Iconos (SVG) ---- */
export function IconMoney(p){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}><rect x="3" y="6" width="18" height="12" rx="2" strokeWidth="1.8"/><circle cx="12" cy="12" r="2.2" strokeWidth="1.8"/></svg>)}
export function IconApps(p){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}><rect x="3" y="3" width="7" height="7" rx="2" strokeWidth="1.8"/><rect x="14" y="3" width="7" height="7" rx="2" strokeWidth="1.8"/><rect x="3" y="14" width="7" height="7" rx="2" strokeWidth="1.8"/><rect x="14" y="14" width="7" height="7" rx="2" strokeWidth="1.8"/></svg>)}
export function IconShield(p){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}><path strokeWidth="1.8" d="M12 3l7 3v6a9 9 0 01-7 8 9 9 0 01-7-8V6l7-3z"/></svg>)}
export function IconLayers(p){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}><path strokeWidth="1.8" d="M12 3l9 5-9 5-9-5 9-5z"/><path strokeWidth="1.8" d="M3 12l9 5 9-5"/></svg>)}
export function IconUser(p){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}><circle cx="12" cy="8" r="4" strokeWidth="1.8"/><path strokeWidth="1.8" d="M4 21a8 8 0 0116 0"/></svg>)}
function IconChevronRight(p){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}><path strokeWidth="2" strokeLinecap="round" d="M9 5l7 7-7 7"/></svg>)}
