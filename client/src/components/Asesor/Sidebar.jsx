// src/components/SidebarIconOnly.jsx
import React, { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { NAV_ITEMS, LOGOUT } from "./navItems";
import { NavLink, useLocation } from "react-router-dom";

function TooltipPortal({ visible, x, y, text, color = 'dark' }) {
  if (!visible) return null;
  return createPortal(
    <div
      style={{ position: 'fixed', left: x, top: y, transform: 'translateY(-50%)' }}
      className={[
        'pointer-events-none z-[99999] px-3 py-1 rounded-md text-[12px] leading-none shadow-lg select-none',
        color === 'danger'
          ? 'bg-red-600 text-white ring-1 ring-red-700/50'
          : 'bg-slate-900/90 text-white ring-1 ring-black/20'
      ].join(' ')}
    >
      {text}
    </div>,
    document.body
  );
}

export default function SidebarIconOnly({ onLogout = () => { }, active, counts = {} }) {
  const location = useLocation();
  const path = location.pathname || '';

  const [tip, setTip] = useState({ visible: false, text: '', x: 0, y: 0, color: 'dark' });
  const showTip = useCallback((el, text, color = 'dark') => {
    try {
      const rect = el.getBoundingClientRect();
      setTip({ visible: true, text, x: rect.right + 10, y: rect.top + rect.height / 2, color });
    } catch (_) {
      // ignore
    }
  }, []);
  const hideTip = useCallback(() => setTip(t => ({ ...t, visible: false })), []);

  return (
    <aside className="hidden md:flex fixed left-0 top-14 bottom-0 w-24 shrink-0 z-40 isolate border-r border-slate-200 box-border">
      <div className="flex flex-col h-full w-full bg-white/90 backdrop-blur px-0 py-0 overflow-x-visible">
        {/* Navegación */}
        <nav className="mt-0 space-y-0 w-full flex-1 overflow-y-auto overflow-x-visible overscroll-contain no-scrollbar">
          {NAV_ITEMS.map(({ key, label, icon: Icon, href }) => (
            <NavLink
              key={key}
              to={href}
              aria-label={label}
              onMouseEnter={(e) => showTip(e.currentTarget, label, 'dark')}
              onMouseLeave={hideTip}
              className={({ isActive }) => [
                "group relative flex items-center justify-center rounded-lg p-3 transition",
                (isActive || (!!active && ((active === key) || (key === 'feedback' && path.startsWith('/asesor/feedback')))))
                  ? "bg-violet-50 text-violet-700 ring-1 ring-violet-200"
                  : "text-slate-600 hover:bg-violet-50 hover:text-violet-700 hover:ring-1 hover:ring-violet-200 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
              ].join(" ")}
            >
              {({ isActive }) => (
                <>
                  {/* Solo icono centrado */}
                  <Icon className={["h-6 w-6 transition-colors", (isActive || (!!active && ((active === key) || (key === 'feedback' && path.startsWith('/asesor/feedback'))))) ? "text-violet-700" : "text-slate-500 group-hover:text-violet-700"].join(" ")} />

                  {/* Badge de contador */}
                  {counts[key] > 0 && (
                    <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow ring-2 ring-white transform translate-x-1/4 -translate-y-1/4">
                      {counts[key] > 99 ? '99+' : counts[key]}
                    </span>
                  )}

                  {/* Indicador lateral al pasar el mouse */}
                  <span className={[
                    "pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded",
                    (isActive || (!!active && ((active === key) || (key === 'feedback' && path.startsWith('/asesor/feedback')))))
                      ? "bg-violet-600 opacity-100"
                      : "bg-violet-500 opacity-0 group-hover:opacity-100"
                  ].join(" ")} />
                  {/* Tooltip ahora se renderiza via portal (ver abajo) */}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="my-1 border-t border-slate-200" />

        {/* Cerrar sesión */}
        <button
          onClick={onLogout}
          aria-label={LOGOUT.label}
          onMouseEnter={(e) => showTip(e.currentTarget, LOGOUT.label, 'danger')}
          onMouseLeave={hideTip}
          className="group relative flex w-full items-center justify-center rounded-lg p-3 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:ring-1 hover:ring-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
        >
          <LOGOUT.icon className="h-6 w-6 text-red-500 transition-colors group-hover:text-red-600" />
          {/* Tooltip via portal */}
        </button>
      </div>
      {/* Portal global de tooltip */}
      <TooltipPortal visible={tip.visible} x={tip.x} y={tip.y} text={tip.text} color={tip.color} />
    </aside>
  );
}
