import { useMemo } from "react";

const ITEMS = [
  { label: "Inicio",         icon: HomeIcon,     href: "/administrador_dashboard" },
  { label: "Cursos Activos", icon: CoursesIcon,  href: "/administrador_cursos" },
  { label: "Certificaciones", icon: CertificateIcon, href: "#" },
  { label: "Roles",          icon: BadgeIcon,    href: "#" },
  { label: "Financiero",     icon: WalletIcon,   href: "#" },
  { label: "Contabilidad",   icon: CoinIcon,     href: "#" },
  { label: "Administrativo", icon: BriefcaseIcon,href: "#" },
  { label: "Gestión",        icon: BellIcon,     href: "#" },
  { label: "Productividad",  icon: ChartIcon,    href: "#" },
  { label: "Estratégicos",    icon: TargetIcon,      href: "#" },
  { label: "Asesores",       icon: UsersIcon,    href: "#" },
  { label: "Calendario",     icon: CalendarIcon, href: "#" },
  { label: "Correo",         icon: MailIcon,     href: "#" },
  { label: "Lineamientos y Normativas", icon: DocumentIcon, href: "#" },
  { label: "Configuración",  icon: SettingsIcon, href: "#" },
];

export function SidebarRail() {
  return (
    <aside
      className="
        hidden md:flex fixed inset-y-0 left-0 z-40
        top-16 w-16 h-[calc(100vh-64px)]
        bg-white/95 shadow-lg backdrop-blur-md flex-col items-center
      "
      aria-label="Barra lateral"
    >

      <nav className="mt-1 flex w-full flex-col items-center gap-1">
        {ITEMS.map(({ label, icon: Icon, href }) => (
          <TooltipItem key={label} label={label} href={href}>
            <Icon className="h-5 w-5 text-violet-700" />
          </TooltipItem>
        ))}
      </nav>

      <div />
        <TooltipItem label="Cerrar sesión" onClick={() => alert("Cerrar sesión")}>
            <ExitIcon className="h-5 w-5 text-rose-600" />
        </TooltipItem>
      <div/>
    </aside>
  );
}

/* Drawer móvil */
export function SidebarDrawer({ open, onClose }) {
  const classes = useMemo(
    () =>
      `fixed inset-0 z-50 md:hidden ${open ? "" : "pointer-events-none"}`,
    [open]
  );

  return (
    <div className={classes} aria-hidden={!open}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={`absolute left-0 top-14 h-[calc(100vh-56px)] w-72 bg-white shadow-2xl ring-1 ring-black/5
                    transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Encabezado */}
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-700 font-bold">
            MQ
          </div>
          <span className="font-semibold text-slate-800">Menú</span>
          <button onClick={onClose} className="ml-auto rounded-md p-1.5 hover:bg-slate-100" aria-label="Cerrar">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
              <path strokeWidth="2" strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* Lista con textos (sin tooltip) */}
        <nav className="p-2">
          {ITEMS.map(({ label, icon: Icon, href }) => (
            <a
              key={label}
              href={href}
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50"
            >
              <Icon className="h-5 w-5 text-violet-700" />
              <span className="font-medium">{label}</span>
            </a>
          ))}
        </nav>

        <div className="p-2">
          <button
            onClick={() => { onClose(); alert("Cerrar sesión"); }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-rose-600 hover:bg-rose-50"
          >
            <ExitIcon className="h-5 w-5" />
            <span className="font-medium">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* --- Item con tooltip personalizado (desktop) --- */
function TooltipItem({ label, children, href, onClick }) {
  const Btn = (
    <button
      onClick={onClick}
      className="group relative mt-1 inline-flex h-10 w-10 items-center justify-center
                 rounded-lg hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
      aria-label={label}
    >
      {children}
      <span
        className="pointer-events-none absolute left-[calc(100%+8px)] top-1/2 z-50
                   -translate-y-1/2 scale-95 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1
                   text-xs font-medium text-white opacity-0 shadow-lg ring-1 ring-black/5
                   transition-all duration-150 group-hover:opacity-100 group-hover:scale-100"
        role="tooltip"
      >
        {label}
        <span className="absolute right-full top-1/2 -translate-y-1/2 border-y-8 border-y-transparent border-r-8 border-r-slate-900" />
      </span>
    </button>
  );
  return href ? <a href={href} className="block">{Btn}</a> : Btn;
}

/* --- Iconos (SVG) --- */
function HomeIcon(p){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}><path strokeWidth="1.8" d="M3 11l9-7 9 7M5 10v10h14V10"/></svg>)}
function UsersIcon(p){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}><path strokeWidth="1.8" d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4" strokeWidth="1.8"/></svg>)}
function CoursesIcon(props){return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}><path strokeWidth="1.8" d="M3 6.5A2.5 2.5 0 015.5 4H11v14H5.5A2.5 2.5 0 013 15.5v-9z" /><path strokeWidth="1.8" d="M21 6.5A2.5 2.5 0 0018.5 4H13v14h5.5A2.5 2.5 0 0021 15.5v-9z" /><path strokeWidth="1.8" d="M13 7h5" /></svg>)}
function BadgeIcon(p){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}><path strokeWidth="1.8" d="M7 4h10v4H7zM5 8h14v12H5z"/></svg>)}
function BriefcaseIcon(p){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}><path strokeWidth="1.8" d="M3 7h18v11H3z"/><path strokeWidth="1.8" d="M9 7V5h6v2"/></svg>)}
function WalletIcon(p){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}><path strokeWidth="1.8" d="M3 7h18v10H3z"/><circle cx="17" cy="12" r="1.5"/></svg>)}
function CoinIcon(p){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}><ellipse cx="12" cy="7" rx="7" ry="3" strokeWidth="1.8"/><path strokeWidth="1.8" d="M5 7v7c0 1.7 3.1 3 7 3s7-1.3 7-3V7"/></svg>)}
function ChartIcon(p){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}><path strokeWidth="1.8" d="M4 19V5M9 19v-8M14 19V9M19 19v-4"/></svg>)}
function BellIcon(p){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}><path strokeWidth="1.8" d="M6 8a6 6 0 1112 0v5l2 3H4l2-3z"/><path strokeWidth="1.8" d="M9 19a3 3 0 006 0"/></svg>)}
function CalendarIcon(p){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}><rect x="3" y="5" width="18" height="16" rx="2" strokeWidth="1.8"/><path strokeWidth="1.8" d="M3 10h18M8 3v4M16 3v4"/></svg>)}
function MailIcon(p){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}><rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="1.8"/><path strokeWidth="1.8" d="M3 7l9 6 9-6"/></svg>)}
function SettingsIcon(p){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}><path strokeWidth="1.8" d="M12 15a3 3 0 100-6 3 3 0 000 6z"/><path strokeWidth="1.8" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06A1.65 1.65 0 0015 19.4a1.65 1.65 0 00-1 .6 1.65 1.65 0 01-2.06 0 1.65 1.65 0 00-1-.6 1.65 1.65 0 00-1.82-.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-.6-1 1.65 1.65 0 010-2.06 1.65 1.65 0 00.6-1 1.65 1.65 0 00-.6-1l-.06-.06A2 2 0 016.77 4.05l.06.06A1.65 1.65 0 008.6 4.4 1.65 1.65 0 009.6 4a1.65 1.65 0 012.06 0 1.65 1.65 0 001 .6 1.65 1.65 0 001.82.33l.06-.06A2 2 0 0119.95 6.8l-.06.06a1.65 1.65 0 00-.6 1 1.65 1.65 0 001 .6 1.65 1.65 0 010 2.06 1.65 1.65 0 00-1 .6z"/></svg>)}
function ExitIcon(p){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}><path strokeWidth="1.8" d="M10 17l5-5-5-5"/><path strokeWidth="1.8" d="M15 12H3"/><path strokeWidth="1.8" d="M21 3h-6v18h6"/></svg>)}
function CertificateIcon(props) {return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}><circle cx="12" cy="8" r="4.5" strokeWidth="1.8" /><path strokeWidth="1.8" d="M10 12.5l-3 3v4l3-1.2 2 1.2v-4z" /><path strokeWidth="1.8" d="M14 12.5l3 3v4l-3-1.2-2 1.2v-4z" /><path strokeWidth="1.6" d="M10.5 8.2l1.2 1.2 2-2" /></svg>);}
function TargetIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      {/* círculo externo */}
      <circle cx="12" cy="12" r="9" strokeWidth="1.8" />
      {/* círculo interno */}
      <circle cx="12" cy="12" r="4" strokeWidth="1.8" />
      {/* línea como puntería */}
      <path strokeWidth="1.8" d="M12 2v2M12 20v2M2 12h2M20 12h2" />
    </svg>
  );
}
function DocumentIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      {/* hoja */}
      <rect x="4" y="3" width="16" height="18" rx="2" ry="2" strokeWidth="1.8" />
      {/* líneas */}
      <path strokeWidth="1.8" d="M8 7h8M8 11h8M8 15h6" />
    </svg>
  );
}
