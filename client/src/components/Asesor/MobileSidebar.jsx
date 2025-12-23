// src/components/MobileSidebar.jsx
import { useEffect } from "react";
import { X } from "lucide-react";
import { NAV_ITEMS, LOGOUT } from "./navItems";
import { NavLink } from "react-router-dom";

export default function MobileSidebar({
  open,
  onClose,
  onLogout = () => { },
  counts = {}
}) {
  // Cerrar con Escape
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        className={[
          "md:hidden fixed inset-0 z-50 bg-slate-900/40 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={[
          "md:hidden fixed inset-y-0 left-0 z-50 w-72 max-w-[85%]",
          "bg-white shadow-2xl ring-1 ring-black/10",
          "transform transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
          "flex flex-col",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <span className="text-sm font-semibold text-slate-700">Menú</span>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          {NAV_ITEMS.map(({ key, label, icon: Icon, href }) => (
            <NavLink
              key={key}
              to={href}
              aria-label={label}
              className={({ isActive }) => [
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                isActive
                  ? "bg-violet-50 text-violet-700 ring-1 ring-violet-200"
                  : "text-slate-600 hover:bg-slate-100"
              ].join(" ")}
            >
              {({ isActive }) => (
                <>
                  <Icon className={["h-5 w-5", isActive ? "text-violet-700" : "text-slate-500"].join(" ")} />
                  {/* Tooltip flotante */}
                  <span className="truncate flex-1">
                    {label}
                  </span>

                  {/* Badge */}
                  {counts[key] > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow ring-2 ring-white">
                      {counts[key] > 99 ? '99+' : counts[key]}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Cerrar sesión */}
        <div className="border-t border-slate-200 p-2">
          <button
            onClick={() => { onClose(); onLogout(); }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
            aria-label={LOGOUT.label}
          >
            <LOGOUT.icon className="h-5 w-5 text-red-500" />
            <span>{LOGOUT.label}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
