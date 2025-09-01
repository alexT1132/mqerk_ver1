// src/components/SidebarIconOnly.jsx
import { NAV_ITEMS, LOGOUT } from "./navItems";
import { NavLink } from "react-router-dom";

export default function SidebarIconOnly({ onLogout = () => {} }) {

  return (
    <aside className="hidden md:flex w-16 shrink-0">
      <div className="sticky top-16 h-[calc(100vh-4rem)] border-r border-slate-200 bg-white/90 backdrop-blur px-2 py-3">
        {/* Navegación */}
        <nav className="mt-1 space-y-1 w-full">
          {NAV_ITEMS.map(({ key, label, icon: Icon, href }) => (
            <NavLink
              key={key}
              to={href}
              aria-label={label}
              className={({ isActive }) => [
                "group relative flex items-center justify-center rounded-lg p-2 transition",
                isActive
                  ? "bg-violet-50 text-violet-700 ring-1 ring-violet-200"
                  : "text-slate-600 hover:bg-slate-100"
              ].join(" ")}
            >
              {({ isActive }) => (
                <>
                  <Icon className={["h-5 w-5", isActive ? "text-violet-700" : "text-slate-500"].join(" ")} />
                  {/* Tooltip flotante */}
                  <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 whitespace-nowrap rounded-md bg-slate-900/90 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition group-hover:opacity-100">
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="my-3 border-t border-slate-200" />

        {/* Cerrar sesión */}
        <button
          onClick={onLogout}
          aria-label={LOGOUT.label}
          className="group relative flex w-full items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100"
        >
          <LOGOUT.icon className="h-5 w-5 text-red-500" />
          <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 whitespace-nowrap rounded-md bg-slate-900/90 px-2 py-1 text-xs font-medium text-white shadow-lg ring-1 ring-black/20 opacity-0 translate-x-1 scale-95 transition group-hover:opacity-100 group-hover:translate-x-0 group-hover:scale-100 z-40">
            {LOGOUT.label}
          </span>
        </button>
      </div>
    </aside>
  );
}
