// src/components/SidebarIconOnly.jsx
import React, { useState, useCallback, useRef, useEffect } from "react";
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
  const navRef = useRef(null);
  const scrollPosRef = useRef(0);

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

  // Guardar posición de scroll antes de que cambie la ruta
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const handleScroll = () => {
      scrollPosRef.current = nav.scrollTop;
    };

    nav.addEventListener('scroll', handleScroll);
    return () => nav.removeEventListener('scroll', handleScroll);
  }, []);

  // Restaurar posición de scroll después de renderizar
  useEffect(() => {
    const nav = navRef.current;
    if (nav && scrollPosRef.current > 0) {
      nav.scrollTop = scrollPosRef.current;
    }
  });

  const renderNavItem = ({ key, label, icon: Icon, href }) => (
    <NavLink
      key={key}
      to={href}
      aria-label={label}
      onMouseEnter={(e) => showTip(e.currentTarget, label, "dark")}
      onMouseLeave={hideTip}
      className={({ isActive }) => [
        "group relative flex items-center justify-center rounded-lg px-2 py-2.5 transition",
        isActive || (!!active && (active === key || (key === "feedback" && path.startsWith("/asesor/feedback"))))
          ? "bg-violet-50 text-violet-700 ring-1 ring-violet-200"
          : "text-slate-600 hover:bg-violet-50 hover:text-violet-700 hover:ring-1 hover:ring-violet-200 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300",
      ].join(" ")}
    >
      {({ isActive }) => (
        <>
          <Icon
            className={[
              "h-5 w-5 transition-colors",
              isActive || (!!active && (active === key || (key === "feedback" && path.startsWith("/asesor/feedback"))))
                ? "text-violet-700"
                : "text-slate-500 group-hover:text-violet-700",
            ].join(" ")}
          />
          {counts[key] > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow ring-2 ring-white transform translate-x-1/4 -translate-y-1/4">
              {counts[key] > 99 ? "99+" : counts[key]}
            </span>
          )}
          <span
            className={[
              "pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded",
              isActive || (!!active && (active === key || (key === "feedback" && path.startsWith("/asesor/feedback"))))
                ? "bg-violet-600 opacity-100"
                : "bg-violet-500 opacity-0 group-hover:opacity-100",
            ].join(" ")}
          />
        </>
      )}
    </NavLink>
  );

  return (
    <aside className="hidden md:flex w-20 shrink-0 z-40 isolate border-r border-slate-200 box-border h-full">
      <div className="flex flex-col h-full w-full bg-white/90 backdrop-blur px-0 py-0 overflow-x-visible">
        {/* Navegación */}
        {/* Fixed "Inicio" Item */}
        <div className="flex-none p-1 border-b border-slate-100 bg-white z-10">
          {renderNavItem(NAV_ITEMS[0])}
        </div>

        {/* Scrollable Navigation (Rest of items) */}
        <nav
          ref={navRef}
          className="mt-0 w-full flex-1 overflow-y-auto overflow-x-visible overscroll-contain no-scrollbar p-0.5 pt-1 flex flex-col justify-evenly"
        >
          {NAV_ITEMS.slice(1).map(renderNavItem)}
        </nav>

        <div className="my-1 border-t border-slate-200" />

        {/* Cerrar sesión */}
        <div className="p-1">
          <button
            onClick={onLogout}
            aria-label={LOGOUT.label}
            onMouseEnter={(e) => showTip(e.currentTarget, LOGOUT.label, "danger")}
            onMouseLeave={hideTip}
            className="group relative flex w-full items-center justify-center rounded-lg py-3 px-2.5 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:ring-1 hover:ring-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
          >
            <LOGOUT.icon className="h-[22px] w-[22px] text-red-500 transition-colors group-hover:text-red-600" />
            {/* Tooltip via portal */}
          </button>
        </div>
      </div>
      {/* Portal global de tooltip */}
      <TooltipPortal visible={tip.visible} x={tip.x} y={tip.y} text={tip.text} color={tip.color} />
    </aside>
  );
}
