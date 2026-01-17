// src/components/SideBar_Alumno_comp.jsx
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Lock, Unlock } from 'lucide-react';
import { useStudent } from '../../context/StudentContext.jsx';

/**
 * Componente para un elemento individual de la barra lateral de Alumno.
 * CORRECCIÓN: Se ajustó la recepción de props para detectar correctamente el modo móvil.
 */

// Tooltip flotante (Solo PC)
function HoverTooltip({ anchorRef, text, show }) {
  const [style, setStyle] = useState({ display: 'none' });
  useEffect(() => {
    let rafId = null;
    const updateNow = () => {
      if (!show || !anchorRef?.current) {
        setStyle({ display: 'none' });
        return;
      }
      const rect = anchorRef.current.getBoundingClientRect();
      const top = rect.top + rect.height / 2;
      const left = rect.right + 10; 
      setStyle({
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        transform: 'translateY(-50%)',
        zIndex: 10000, 
        pointerEvents: 'none',
        whiteSpace: 'nowrap', 
      });
    };
    const scheduleUpdate = () => {
      if (rafId != null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        updateNow();
      });
    };
    scheduleUpdate();
    if (!show) return;
    window.addEventListener('scroll', scheduleUpdate, true);
    window.addEventListener('resize', scheduleUpdate);
    return () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', scheduleUpdate, true);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, [show, anchorRef]);

  if (!show) return null;
  return createPortal(
    <div style={style} role="tooltip" aria-hidden="true" className="bg-slate-900 text-white px-3 py-1.5 rounded-lg shadow-xl shadow-slate-900/20 backdrop-blur-sm border border-slate-700/50 text-xs font-semibold tracking-wide animate-in fade-in zoom-in-95 duration-100">
      {text}
      <div className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 border-4 border-transparent border-r-slate-900"></div>
    </div>,
    document.body
  );
}

// CORRECCIÓN AQUÍ: cambié "onClick: mobileOnClick" por "mobileOnClick" directamente
function ElementoSideBarAlumno({ Icono, NombreElemento, to, isSidebarOpen, mobileOnClick, activo, sectionKey }) {
  const { activeSection, setActiveSectionHandler } = useStudent();
  const location = useLocation();
  const navigate = useNavigate();
  const linkRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  
  const isLogout = to === "/logout" || to === "/alumno/logout";
  const isActive = sectionKey ? activeSection === sectionKey : location.pathname === to;
  
  // Ahora sí detectará correctamente que es un ítem móvil
  const isMobileItem = !!mobileOnClick;

  const handleLinkClick = (e) => {
      if (mobileOnClick) mobileOnClick();
      if (sectionKey) {
        e.preventDefault();
        setActiveSectionHandler(sectionKey);
        if (location.pathname !== "/alumno/") navigate("/alumno/");
      } else {
        if (activeSection) setActiveSectionHandler(null);
      }
    };

  const svgColor = "#64748b"; 
  const svgColorActive = "#ffffff"; 
  const svgColorLogout = "#ef4444"; 
  
  // =====================================================================
  // LÓGICA DE CLASES
  // =====================================================================
  
  let containerClasses = "";
  let linkClasses = "flex items-center transition-all duration-300 ease-out relative select-none ";

  if (isMobileItem) {
    // -----------------------------------------------------
    // ESTILOS MÓVIL (LIMPIEZA TOTAL: SIN BORDES, SIN SOMBRAS)
    // -----------------------------------------------------
    containerClasses = "group flex items-center relative w-full mb-1 px-4";
    
    // Agregamos border-0 explícitamente por seguridad
    linkClasses += "justify-start pl-4 pr-4 gap-4 py-3 rounded-2xl w-full border-0 ";

    if (isActive) {
      // ACTIVO MÓVIL: Fondo degradado, texto blanco, CERO bordes/sombras
      linkClasses += "bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-none ring-0 outline-none ";
    } else {
      // INACTIVO MÓVIL: Transparente Total
      if (isLogout) {
        linkClasses += "text-red-500 bg-transparent shadow-none ring-0 active:bg-red-50/30 ";
      } else {
        linkClasses += "text-slate-600 bg-transparent shadow-none ring-0 active:bg-slate-100/50 ";
      }
    }

  } else {
    // -----------------------------------------------------
    // ESTILOS PC (CON RELIEVES Y BORDES)
    // -----------------------------------------------------
    containerClasses = "group flex items-center justify-center relative z-10 min-h-[70px] w-full px-2";

    linkClasses += isSidebarOpen 
      ? "justify-start px-4 gap-3 rounded-xl w-full py-3 " 
      : "justify-center p-0 rounded-xl w-12 h-12 aspect-square ";

    if (isActive) {
      // ACTIVO PC: Bloque grande, sombra, efecto 3D
      linkClasses += "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/40 transform scale-110 z-20 font-bold border-none ";
    } else {
      // INACTIVO PC: Borde gris, fondo blanco (Relieve)
      if (isLogout) {
        linkClasses += "text-gray-500 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-100 ";
      } else {
        linkClasses += "bg-white text-slate-500 border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-300 hover:text-indigo-600 hover:scale-105 ";
      }
    }
  }

  const innerDivClasses = isMobileItem
    ? "flex items-center" 
    : "flex items-center justify-center";

  return (
    <li className={containerClasses}>
      <Link
        ref={linkRef}
        to={to}
        onClick={handleLinkClick}
        className={linkClasses}
        aria-label={NombreElemento}
        aria-current={isActive ? 'page' : undefined}
        onMouseEnter={() => !isMobileItem && setHovered(true)}
        onMouseLeave={() => !isMobileItem && setHovered(false)}
        onFocus={() => !isMobileItem && setHovered(true)}
        onBlur={() => !isMobileItem && setHovered(false)}
      >
        <div className={innerDivClasses}>
          <div className="flex-shrink-0 flex items-center justify-center relative">
            <div className="relative">
              {React.cloneElement(Icono, {
                stroke: isLogout ? svgColorLogout : (isActive ? svgColorActive : svgColor),
                fill: "none",
                className: `transition-all duration-300 ${isMobileItem ? "w-[22px] h-[22px]" : (isActive ? "w-6 h-6" : "w-5 h-5")}`,
                strokeWidth: isActive ? 2.5 : 2
              })}
            </div>
          </div>
          {(isMobileItem || isSidebarOpen) && (
            <span className={`text-[15px] whitespace-nowrap ml-1 transition-colors ${isActive ? 'text-white' : ''} font-medium`}>
              {NombreElemento}
            </span>
          )}
          {!isMobileItem && !isSidebarOpen && (
            <HoverTooltip anchorRef={linkRef} text={NombreElemento} show={hovered} />
          )}
        </div>
      </Link>
    </li>
  );
}

// --- ICONOS (Sin cambios) ---
const svgColor = "#4F46E5"; 
const svgColorLogout = "#EA3323"; 
const xmlns = "http://www.w3.org/2000/svg";
const width = "20px"; 
const height = "20px"; 

const LogoInicio = (<svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>);
const LogoMisCursos = (<svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>);
const LogoMiPerfil = (<svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>);
const LogoActividades = (<svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>);
const LogoSimulaciones = (<svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>);
const LogoRecursos = (<svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /><line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" /></svg>);
const LogoFeedback = (<svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>);
const LogoCalendario = (<svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>);
const LogoMisPagos = (<svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="22" y2="10" /></svg>);
const LogoAsistencia = (<svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const LogoConfigAlumno = (<svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1.51-1V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>);
const LogoCerrarSesionAlumno = (<svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColorLogout} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="17 16 22 12 17 8" /><line x1="22" y1="12" x2="10" y2="12" /></svg>);

const alumnoMenuItems = [
  { label: "Inicio", path: "/alumno/", icon: LogoInicio, sectionKey: "inicio" },
  { label: "Mis Cursos", path: "/alumno/cursos", icon: LogoMisCursos },
  { label: "Mi Perfil", path: "/alumno/mi-perfil", icon: LogoMiPerfil },
  { label: "Actividades", path: "/alumno/actividades", icon: LogoActividades },
  { label: "Simulaciones", path: "/alumno/simulaciones", icon: LogoSimulaciones },
  { label: "Recursos", path: "/alumno/recursos", icon: LogoRecursos },
  { label: "Feedback", path: "/alumno/feedback", icon: LogoFeedback },
  { label: "Asistencia", path: "/alumno/asistencia", icon: LogoAsistencia },
  { label: "Calendario", path: "/alumno/calendario", icon: LogoCalendario },
  { label: "Mis Pagos", path: "/alumno/mis-pagos", icon: LogoMisPagos },
];

export function SideBarDesktop_Alumno_comp({ setDesktopSidebarOpen, activo }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPinnedCollapsed, setIsPinnedCollapsed] = useState(false);
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    portrait: typeof window !== 'undefined' ? window.matchMedia('(orientation: portrait)').matches : false,
  });
  const timeoutRef = useRef(null);
  const freezeUntilRef = useRef(0);
  const sidebarRef = useRef(null);
  const pinnedGraceUntilRef = useRef(0);
  const transientUntilRef = useRef(0);
  const HOVER_CLOSE_DELAY = 200;
  const CLICK_FREEZE_MS = 500;

  const setSidebarOpenSafe = (open) => {
    setIsSidebarOpen(prev => {
      if (isPinnedCollapsed && open) return false;
      return open;
    });
  };

  const isTablet = viewport.width >= 640 && viewport.width < 1024;
  const sidebarWidth = isSidebarOpen
    ? (isTablet ? 'w-60' : 'w-56 md:w-60 lg:w-64')
    : (isTablet ? 'w-20' : 'w-16 md:w-20');

  const handleMouseEnter = () => {
    if (isPinnedCollapsed || Date.now() < pinnedGraceUntilRef.current) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setSidebarOpenSafe(true);
  };

  const handleMouseLeave = (e) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const scheduleCloseCheck = (delay = HOVER_CLOSE_DELAY) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (sidebarRef.current && sidebarRef.current.matches(':hover')) {
          timeoutRef.current = null;
          return;
        }
        const now = Date.now();
        const remaining = freezeUntilRef.current - now;
        if (remaining > 0) {
          scheduleCloseCheck(remaining + HOVER_CLOSE_DELAY);
          return;
        }
        setSidebarOpenSafe(false);
        timeoutRef.current = null;
      }, delay);
    };
    scheduleCloseCheck();
  };

  const togglePinned = () => {
    setIsPinnedCollapsed(prev => {
      const next = !prev;
      if (next) {
        setSidebarOpenSafe(false);
        pinnedGraceUntilRef.current = Date.now() + 800; 
      } else {
        pinnedGraceUntilRef.current = Date.now() + 100;
      }
      try { localStorage.setItem('sidebarPinnedCollapsed', String(next)); } catch (_) { }
      return next;
    });
  };

  useEffect(() => {
    try {
      const pc = localStorage.getItem('sidebarPinnedCollapsed') === 'true';
      const prefersUnset = localStorage.getItem('sidebarPinnedCollapsed') === null;
      const isTablet = viewport.width >= 640 && viewport.width < 1024;
      const shouldAutoCollapse = prefersUnset && (isTablet || viewport.portrait);
      if (pc || shouldAutoCollapse) {
        setIsPinnedCollapsed(true);
        setSidebarOpenSafe(false);
        pinnedGraceUntilRef.current = Date.now() + 800;
      }
    } catch (_) { }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
        portrait: window.matchMedia('(orientation: portrait)').matches,
      });
    };
    let resizeTimeout;
    const debouncedHandleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 200);
    };
    window.addEventListener('resize', debouncedHandleResize);
    window.addEventListener('orientationchange', debouncedHandleResize);
    const handleOutsideTap = (e) => {
      const isTabletNow = window.innerWidth >= 640 && window.innerWidth < 1024;
      if (!isTabletNow) return;
      if (!sidebarRef.current) return;
      if (!isSidebarOpen) return;
      if (sidebarRef.current.contains(e.target)) return;
      setIsSidebarOpen(false);
    };
    document.addEventListener('click', handleOutsideTap, true);
    return () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      window.removeEventListener('resize', debouncedHandleResize);
      window.removeEventListener('orientationchange', debouncedHandleResize);
      document.removeEventListener('click', handleOutsideTap, true);
    };
  }, []);

  useEffect(() => {
    if (isPinnedCollapsed && isSidebarOpen) {
      if (Date.now() < transientUntilRef.current) return;
      setSidebarOpenSafe(false);
    }
  }, [isPinnedCollapsed, isSidebarOpen]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (setDesktopSidebarOpen) setDesktopSidebarOpen(isSidebarOpen);
  }, [isSidebarOpen, setDesktopSidebarOpen]);

  const effectivePinned = isPinnedCollapsed;

  return (
    <aside
      ref={sidebarRef}
      className={`hidden sm:flex flex-col fixed ${sidebarWidth} ${isTablet ? 'shadow-md' : 'shadow-lg'} z-[2000] top-[80px] h-[calc(100vh-80px)] bg-white/95 ${isTablet ? 'backdrop-blur-[2px]' : 'backdrop-blur-sm'} border-r border-gray-200/80 ${isTablet ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-0') : ''} transition-all duration-200 ease-out transform-gpu will-change-transform overflow-y-auto overflow-x-visible no-scrollbar`}
      style={{
        transform: 'translateX(0)',
        opacity: 1,
        backdropFilter: isTablet ? 'blur(2px)' : 'blur(10px)',
        WebkitBackdropFilter: isTablet ? 'blur(2px)' : 'blur(10px)'
      }}
      aria-label="Sidebar de escritorio de alumno"
      onMouseEnter={isTablet ? undefined : handleMouseEnter}
      onMouseLeave={isTablet ? undefined : handleMouseLeave}
      onClickCapture={() => { freezeUntilRef.current = Date.now() + CLICK_FREEZE_MS; }}
      onClick={() => {
        if (isTablet) {
          if (effectivePinned) return;
          setIsSidebarOpen(prev => !prev);
          return;
        }
        if (!effectivePinned && !isSidebarOpen) setSidebarOpenSafe(true);
      }}
      onFocus={() => {
        if (!isTablet && !effectivePinned) {
          setSidebarOpenSafe(true);
        }
      }}
      onBlur={(e) => {
        if (isPinnedCollapsed) return;
        if (sidebarRef.current && !sidebarRef.current.contains(e.relatedTarget)) {
          setSidebarOpenSafe(false);
        }
      }}
    >
      <div className="px-3 py-2 flex items-center justify-end gap-2 border-b border-gray-200/60 bg-white/70">
        <button
          onClick={togglePinned}
          className={`inline-flex items-center justify-center w-8 h-8 rounded-md border text-xs font-medium transition-all
            ${isPinnedCollapsed ? 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
          title={isPinnedCollapsed ? 'Liberar sidebar (permitir expandir)' : 'Fijar colapsado (no expandir)'}
          aria-pressed={isPinnedCollapsed}
        >
          {isPinnedCollapsed ? <Lock size={16} /> : <Unlock size={16} />}
        </button>
      </div>
      <nav className="h-full overflow-visible">
        <ul className="p-4 h-full flex flex-col list-none overflow-visible relative">
          <div className="space-y-1">
            {alumnoMenuItems.map((item) => (
              <ElementoSideBarAlumno
                key={item.path}
                to={item.path}
                Icono={item.icon}
                NombreElemento={item.label}
                isSidebarOpen={isSidebarOpen}
                activo={activo}
                sectionKey={item.sectionKey}
              />
            ))}
          </div>
          <div className="flex-grow pointer-events-none"></div>
          <div className="pt-2 space-y-1">
            <ul className="list-none">
              <ElementoSideBarAlumno
                to="/alumno/configuracion"
                Icono={LogoConfigAlumno}
                NombreElemento="Configuración"
                isSidebarOpen={isSidebarOpen}
                activo={activo}
              />
              <ElementoSideBarAlumno
                to="/alumno/logout"
                Icono={LogoCerrarSesionAlumno}
                NombreElemento="Cerrar Sesión"
                isSidebarOpen={isSidebarOpen}
                activo={activo}
              />
            </ul>
          </div>
        </ul>
      </nav>
    </aside>
  );
}

// SideBarSm_Alumno_comp
export function SideBarSm_Alumno_comp({ isMenuOpen, closeMenu, activo }) {
  return (
    <>
      <aside className={`sm:hidden fixed top-[80px] left-0 w-56 h-[calc(100vh-80px)] bg-white/95 backdrop-blur-lg shadow-lg z-50 transform transition-all duration-300 ease-in-out overflow-hidden
          ${isMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-90'}`}
        style={{
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)'
        }}>
        <nav className="h-full overflow-visible">
          <ul className="px-0 py-3 space-y-0 h-full flex flex-col justify-between overflow-y-auto overflow-x-visible no-scrollbar list-none relative">
            <div>
              {alumnoMenuItems.map((item) => (<ElementoSideBarAlumno
                key={item.path}
                to={item.path}
                Icono={item.icon}
                NombreElemento={item.label}
                mobileOnClick={closeMenu}
                isSidebarOpen={true}
                activo={activo}
                sectionKey={item.sectionKey}
              />
              ))}
            </div>
            {/* Contenedor inferior sin bordes molestos */}
            <div className="mt-auto pb-3 pt-1">
              <ul className="list-none">
                <ElementoSideBarAlumno
                  to="/alumno/configuracion"
                  Icono={LogoConfigAlumno}
                  NombreElemento="Configuración"
                  mobileOnClick={closeMenu}
                  isSidebarOpen={true}
                  activo={activo}
                />
                <ElementoSideBarAlumno
                  to="/alumno/logout"
                  Icono={LogoCerrarSesionAlumno}
                  NombreElemento="Cerrar Sesión"
                  mobileOnClick={closeMenu}
                  isSidebarOpen={true}
                  activo={activo}
                />
              </ul>
            </div>
          </ul>
        </nav>
      </aside>
    </>
  );
}