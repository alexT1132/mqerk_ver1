// src/components/SideBar_Alumno_comp.jsx
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Lock, Unlock } from 'lucide-react';
import { useStudent } from '../../context/StudentContext.jsx';

/**
 * Componente para un elemento individual de la barra lateral de Alumno.
 * Se utiliza tanto en la versión de escritorio como en la móvil.
 * @param {object} props - Las props del componente.
 * @param {JSX.Element} props.Icono - El icono SVG a mostrar.
 * @param {string} props.NombreElemento - El nombre del elemento de navegación.
 * @param {string} props.to - La ruta a la que apunta el enlace.
 * @param {boolean} props.isSidebarOpen - Indica si el sidebar de escritorio está abierto (para mostrar/ocultar texto).
 * @param {function} [props.onClick] - Función opcional para manejar clics (principalmente para cerrar el menú móvil).
 */
// Tooltip flotante usando Portal para evitar clipping por overflow
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
      const left = rect.right + 12; // 12px de separación
      setStyle({
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        transform: 'translateY(-50%)',
        zIndex: 9999,
        pointerEvents: 'none',
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
    <div style={style} role="tooltip" aria-hidden="true" className="bg-gray-900/90 text-white px-3 py-2 rounded-lg shadow-xl backdrop-blur-sm border border-gray-700/50 text-sm font-medium">
      {text}
    </div>,
    document.body
  );
}

function ElementoSideBarAlumno({ Icono, NombreElemento, to, isSidebarOpen, onClick: mobileOnClick, activo, sectionKey }) {
  const { activeSection, setActiveSectionHandler } = useStudent();
  const location = useLocation();
  const navigate = useNavigate();
  const linkRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  // Detectar logout tanto si llega como ruta absoluta como anidada
  const isLogout = to === "/logout" || to === "/alumno/logout";
  const isInicio = to === "/alumno/" || to === "/alumno";
  
  // Para las secciones que usan el nuevo sistema, verificar si esta sección está activa
  const isActive = sectionKey ? activeSection === sectionKey : location.pathname === to;
  // Quitar bloqueo visual/funcional de elementos: todos accesibles
  const isBlocked = false;
  const isMobileItem = !!mobileOnClick;

  const handleLinkClick = (e) => {
  // Todos los elementos son accesibles; no bloquear navegación
    if (mobileOnClick) {
      mobileOnClick();
    }
    
    // Si tiene sectionKey, usar el nuevo sistema de navegación
    if (sectionKey) {
      e.preventDefault();
      setActiveSectionHandler(sectionKey);
      // Mantener la ruta principal del alumno
      if (location.pathname !== "/alumno/") {
        navigate("/alumno/");
      }
    } else {
      // Para opciones sin sectionKey, limpiar activeSection
      if (activeSection) {
        setActiveSectionHandler(null);
      }
      
  if (isActive && !isLogout) {
        e.preventDefault();
        navigate("/alumno/");
      }
    }
  };

  const svgColor = "#4F46E5";
  const svgColorLogout = "#EA3323";
  return (
    <li className="group flex justify-start items-center h-fit gap-1.5 relative">
      <Link
        ref={linkRef}
        to={to}
        onClick={handleLinkClick}
        className={`
          items-center p-2 rounded-lg flex w-full transition-all duration-200 ease-in-out relative
          ${isActive
            ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg transform scale-[1.02]"
            : "text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:text-purple-700 hover:shadow-md hover:transform hover:scale-[1.01]"}
          ${isLogout ? "hover:bg-red-50 hover:text-red-600" : ""}
        `}
        aria-label={NombreElemento}
        aria-current={isActive ? 'page' : undefined}
        aria-disabled={false}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
      >
        <div className="flex-shrink-0">
          {React.cloneElement(Icono, {
            stroke: isLogout ? svgColorLogout : (isActive ? "white" : svgColor),
            fill: "none"
          })}
        </div>
        {isMobileItem ? (
          <span className="text-sm font-medium whitespace-nowrap block ml-2">
            {NombreElemento}
          </span>
        ) : isSidebarOpen ? (
          <span className="text-sm font-medium whitespace-nowrap block ml-2">
            {NombreElemento}
          </span>
        ) : (
          <HoverTooltip anchorRef={linkRef} text={NombreElemento} show={hovered} />
        )}
      </Link>
    </li>
  );
}

// Definiciones de colores y tamaños para los SVG, compartidas.
const svgColor = "#4F46E5"; // Azul más fuerte para iconos inactivos
const svgColorLogout = "#EA3323"; // Rojo para cerrar sesión
const xmlns = "http://www.w3.org/2000/svg";
const width = "30px"; // Vuelto al tamaño original
const height = "30px"; // Vuelto al tamaño original

// Definición de los iconos SVG para cada elemento del menú - Actualizados para coincidir con la imagen
const LogoInicio = (
  <svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const LogoMisCursos = (
  <svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
  </svg>
);

const LogoMiPerfil = (
  <svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const LogoActividades = (
  <svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const LogoSimulaciones = (
  <svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
  </svg>
);

const LogoRecursos = (
  <svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    <line x1="12" y1="11" x2="12" y2="17"/>
    <line x1="9" y1="14" x2="15" y2="14"/>
  </svg>
);

const LogoFeedback = (
  <svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const LogoCalendario = (
  <svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const LogoMisPagos = (
  <svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
    <line x1="1" y1="10" x2="22" y2="10"/>
  </svg>
);

const LogoAsistencia = (
  <svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>
);

// Iconos que NO cambian (Configuración y Cerrar Sesión)
const LogoConfigAlumno = (
  <svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1.51-1V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

const LogoCerrarSesionAlumno = (
  <svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColorLogout} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="17 16 22 12 17 8"/>
    <line x1="22" y1="12" x2="10" y2="12"/>
  </svg>
);

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

/**
 * Componente de la barra lateral para escritorio de Alumnos.
 * Incorpora la funcionalidad de ser plegable (colapsable) al pasar el cursor.
 * @param {function} props.setDesktopSidebarOpen - Función para comunicar el estado de apertura al Layout.
 */
export function SideBarDesktop_Alumno_comp({ setDesktopSidebarOpen, activo }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Pin colapsado: no se expande con hover
  const [isPinnedCollapsed, setIsPinnedCollapsed] = useState(false);
  // Estado de viewport para decisiones responsivas (tablet/portrait)
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    portrait: typeof window !== 'undefined' ? window.matchMedia('(orientation: portrait)').matches : false,
  });
  const timeoutRef = useRef(null);
  // Ventana de protección post-click para evitar colapsos por reflow/navegación
  const freezeUntilRef = useRef(0);
  const sidebarRef = useRef(null);
  // Ventana de gracia tras fijar colapsado para ignorar hovers residuales
  const pinnedGraceUntilRef = useRef(0);
  // Apertura transitoria (especialmente útil en tablets): permite abrir unos segundos aunque esté fijado colapsado
  const transientUntilRef = useRef(0);
  // Constantes de timing
  const HOVER_CLOSE_DELAY = 200;
  const CLICK_FREEZE_MS = 500;

  // Setter seguro: nunca abre si está fijado colapsado
  const setSidebarOpenSafe = (open) => {
    setIsSidebarOpen(prev => {
      if (isPinnedCollapsed && open) return false;
      return open;
    });
  };

  const openTransient = (ms = 5000) => {
    transientUntilRef.current = Date.now() + ms;
    setIsSidebarOpen(true);
  };

  // Determinar si es tablet a partir del estado de viewport (evita usar window aún)
  const isTablet = viewport.width >= 640 && viewport.width < 1024;

  // Ancho responsivo: detener animación de width (transform-only)
  const sidebarWidth = isSidebarOpen
    ? (isTablet ? 'w-60' : 'w-56 md:w-60 lg:w-64')
    : (isTablet ? 'w-20' : 'w-16 md:w-20');

  const handleMouseEnter = () => {
    // Bloquear apertura si está fijado o dentro de la ventana de gracia tras fijar
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
        // Si aún está en hover, no cerramos
        if (sidebarRef.current && sidebarRef.current.matches(':hover')) {
          timeoutRef.current = null;
          return;
        }
        const now = Date.now();
        const remaining = freezeUntilRef.current - now;
        if (remaining > 0) {
          // Esperar a que termine la ventana de protección post-click y reintentar
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
        // Forzar cerrado inmediato y crear una ventana de gracia para evitar re-apertura por eventos hover residuales
        setSidebarOpenSafe(false);
        pinnedGraceUntilRef.current = Date.now() + 800; // 800ms de bloqueo de hover
      } else {
        // Al liberar, permitir hover normal después de un corto margen para evitar apertura instantánea durante reflow
        pinnedGraceUntilRef.current = Date.now() + 100; // breve
      }
      try { localStorage.setItem('sidebarPinnedCollapsed', String(next)); } catch (_) {}
      return next;
    });
  };

  // Cargar estado persistido al montar
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
    } catch (_) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Escuchar cambios de tamaño/orientación
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
    // Cerrar al hacer tap fuera en tablets
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

  // Efecto de seguridad: si se fija colapsado y quedó abierto por alguna carrera, cerrarlo
  useEffect(() => {
    if (isPinnedCollapsed && isSidebarOpen) {
      // Si está abierto de forma transitoria, mantenerlo hasta que expire
      if (Date.now() < transientUntilRef.current) return;
      setSidebarOpenSafe(false);
    }
  }, [isPinnedCollapsed, isSidebarOpen]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // En tablets: quitamos autocierre para evitar jank; se cierra con tap fuera o tap en el propio sidebar

  // Sincroniza el overlay de blur con el estado real del sidebar.
  // Si por cualquier motivo el sidebar se cierra, el overlay se limpia automáticamente.
  useEffect(() => {
  if (setDesktopSidebarOpen) setDesktopSidebarOpen(isSidebarOpen);
  }, [isSidebarOpen, setDesktopSidebarOpen]);

  // En tablets respetamos el estado fijado; si está fijado, no debe abrirse
  const effectivePinned = isPinnedCollapsed;

  return (
    <aside
      ref={sidebarRef}
  className={`hidden sm:flex flex-col fixed ${sidebarWidth} ${isTablet ? 'shadow-md' : 'shadow-lg'} z-[2000] top-[80px] h-[calc(100vh-80px)] bg-white/95 ${isTablet ? 'backdrop-blur-[2px]' : 'backdrop-blur-sm'} border-r border-gray-200/80 ${isTablet ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-0') : ''} transition-transform duration-200 ease-out transform-gpu will-change-transform overflow-y-auto overflow-x-visible no-scrollbar`}
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
        // En tablets/touch sin hover: toggle manual, pero si está fijado, no abrir
        if (isTablet) {
          if (effectivePinned) return; // bloqueado: no se abre
          setIsSidebarOpen(prev => !prev); // alternar abrir/cerrar
          return;
        }
        // Desktop: permitir abrir con foco/click si no está fijado
        if (!effectivePinned && !isSidebarOpen) setSidebarOpenSafe(true);
      }}
  onFocus={() => { /* En tablets no abrir al enfocar; en desktop sí */ if (!isTablet && !effectivePinned) setSidebarOpenSafe(true); }}
      onBlur={(e) => {
            if (isPinnedCollapsed) return; // si está fijado colapsado, ya está cerrado
        // Cerrar si el foco sale totalmente del sidebar
        if (sidebarRef.current && !sidebarRef.current.contains(e.relatedTarget)) {
          setSidebarOpenSafe(false);
        }
      }}
    >
  {/* Barra superior con botón de fijar colapsado */}
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
          {/* Grupo superior de elementos de navegación principales */}
          <div className="space-y-2">
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

          {/* Espacio flexible que empuja los elementos inferiores */}
          <div className="flex-grow"></div>

          {/* Elementos de Configuración y Cerrar Sesión en la parte inferior */}
          <div className="pt-2 space-y-2">
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

/**
 * Componente de la barra lateral para dispositivos móviles de Alumnos.
 * Gestiona su apertura/cierre basada en props.
 * @param {object} props - Las props del componente.
 * @param {boolean} props.isMenuOpen - Estado para saber si el menú móvil está abierto.
 * @param {function} props.closeMenu - Función para cerrar el menú, se pasa a los ElementoSideBarAlumno.
 */
export function SideBarSm_Alumno_comp({ isMenuOpen, closeMenu, activo }) {
  return (
    <>
      {/* Contenedor del menú lateral móvil con transición */}
      {/* Asegúrate que el z-index aquí sea mayor que el z-index del overlay de desenfoque en Layout.jsx (z-40) */}
      <aside className={`sm:hidden fixed top-[80px] left-0 w-64 h-[calc(100vh-80px)] bg-white/95 backdrop-blur-lg shadow-2xl z-50 transform transition-all duration-300 ease-in-out overflow-hidden border-r border-gray-200/50
          ${isMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-90'}`}
        style={{
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)'
        }}>
        <nav className="h-full overflow-visible">
          <ul className="p-3 space-y-2 h-full flex flex-col justify-between overflow-y-auto overflow-x-visible no-scrollbar list-none relative">
            {/* Grupo superior de elementos de navegación móvil */}
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
            {/* Agrupación de Configuración y Cerrar Sesión en la parte inferior para móvil */}
            <div className="mt-auto pb-4">
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