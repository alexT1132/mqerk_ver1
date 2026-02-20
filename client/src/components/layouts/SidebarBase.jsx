import React, { useState, useRef, useEffect } from "react";
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Lock, Unlock } from 'lucide-react';
import { useAuth } from "../../context/AuthContext.jsx";
import { logoutRequest } from "../../api/usuarios.js";

// --- Tooltip: ligero, sin scroll/resize listeners, solo rAF al mostrar ---
function HoverTooltip({ anchorRef, text, show }) {
  const [style, setStyle] = useState({ visibility: 'hidden' });

  useEffect(() => {
    if (!show || !anchorRef?.current) {
      setStyle({ visibility: 'hidden' });
      return;
    }
    const rafId = requestAnimationFrame(() => {
      if (!anchorRef?.current) return;
      const rect = anchorRef.current.getBoundingClientRect();
      setStyle({
        position: 'fixed',
        top: rect.top + rect.height / 2,
        left: rect.right + 12,
        transform: 'translateY(-50%)',
        zIndex: 9999,
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
        visibility: 'visible',
      });
    });
    return () => cancelAnimationFrame(rafId);
  }, [show, anchorRef]);

  if (!show) return null;

  return createPortal(
    <div style={style} className="bg-gray-900 text-white text-xs font-semibold px-2.5 py-1 rounded shadow border border-gray-700">
      {text}
    </div>,
    document.body
  );
}

// --- Sidebar Item Component (memoizado para evitar re-renders en Chrome) ---
const SidebarItem = React.memo(function SidebarItem({
  icon,
  label,
  to,
  isSidebarOpen,
  mobileOnClick,
  isActive,
  sectionKey,
  badge,
  onSectionChange,
  logoutPath = "/login"
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout: authLogout } = useAuth();
  const linkRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  const isLogout = to === logoutPath || to === "/logout";
  const isMobileItem = !!mobileOnClick;

  // Determine active state
  const active = isActive !== undefined ? isActive :
    (sectionKey ? false :
      (to === '/' ? location.pathname === to : location.pathname.startsWith(to)));

  const handleLinkClick = async (e) => {
    // Handle logout
    if (to === logoutPath || to === "/logout") {
      e.preventDefault();
      if (mobileOnClick) mobileOnClick();
      (async () => {
        try {
          await logoutRequest().catch(() => { });
          await authLogout?.();
          try {
            localStorage.removeItem('mq_user');
            localStorage.removeItem('rememberMe');
            localStorage.removeItem('cursoSeleccionado');
            Object.keys(localStorage).forEach(key => {
              if (key.startsWith('mq_') || key.includes('token') || key.includes('auth')) {
                localStorage.removeItem(key);
              }
            });
          } catch { }
        } catch (error) {
          console.error('Error during logout:', error);
        } finally {
          navigate('/login', { replace: true });
        }
      })();
      return;
    }

    // Opción con sectionKey (ej. Inicio): evita navegación y parpadeo si ya estamos en /alumno/
    if (sectionKey) {
      e.preventDefault();
      if (mobileOnClick) mobileOnClick();
      if (onSectionChange) onSectionChange(sectionKey);
      if (location.pathname === "/alumno/") return; // Ya estamos: no navegar, no parpadeo
      navigate("/alumno/");
      return;
    }

    // Solo para enlaces normales: guardar scroll del área desplazable (no en sectionKey para evitar parpadeo)
    const scrollEl = document.querySelector('[data-sidebar-scroll]');
    if (scrollEl) {
      try {
        sessionStorage.setItem('sidebarScrollTop', String(scrollEl.scrollTop));
      } catch { }
    }
    if (mobileOnClick) mobileOnClick();
    if (onSectionChange) onSectionChange(null);
  };

  // --- Styling Logic ---
  let containerClasses = "";
  // outline-none focus:outline-none focus:ring-0 evita el contorno negro al expandir/contratar
  let linkClasses = "flex items-center transition-colors duration-150 ease-out relative select-none outline-none focus:outline-none focus:ring-0 ";

  if (isMobileItem) {
    // Mobile styles
    containerClasses = "w-full mb-1 px-3";
    linkClasses += "justify-start pl-4 pr-3 gap-3 py-3 rounded-2xl w-full border-none ring-0 ";

    if (active) {
      linkClasses += "bg-indigo-600 text-white shadow ";
    } else {
      if (isLogout) {
        linkClasses += "text-red-500 bg-transparent active:bg-red-50 ";
      } else {
        linkClasses += "text-gray-600 bg-transparent active:bg-indigo-50 ";
      }
    }
  } else {
    // Desktop
    containerClasses = "group flex justify-center items-center relative z-10 w-full px-2 " + (isSidebarOpen ? "min-h-[48px] lg:min-h-[52px] xl:min-h-[56px]" : "min-h-[60px] lg:min-h-[64px] xl:min-h-[72px]");
    if (isSidebarOpen) {
      // Desplegado: estilo listado limpio, iconos y texto proporcionales en pantallas grandes
      linkClasses += "justify-start pl-3 pr-3 gap-3 lg:gap-4 xl:gap-4 lg:pl-4 lg:pr-4 xl:pl-4 xl:pr-4 rounded-xl w-full py-2.5 lg:py-3 xl:py-3 ring-0 border-0 ";
      if (active) {
        linkClasses += "bg-indigo-600 text-white font-semibold shadow-sm ";
      } else if (isLogout) {
        linkClasses += "bg-transparent text-red-500 hover:bg-red-50/80 ";
      } else {
        linkClasses += "bg-transparent text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 ";
      }
    } else {
      // Colapsado: iconos proporcionales al sidebar en pantallas grandes
      linkClasses += "justify-center p-0 rounded-xl w-12 h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 aspect-square ring-0 border-0 ";
      if (active) {
        linkClasses += "bg-indigo-600 text-white shadow z-20 font-bold ";
      } else if (isLogout) {
        linkClasses += "bg-gray-50 text-red-500 hover:bg-red-50 hover:text-red-600 ";
      } else {
        linkClasses += "bg-gray-50 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 ";
      }
    }
  }

  // Icon color logic
  const svgColor = "#3818c3";
  const svgColorLogout = "#EA3323";
  const svgColorActive = "#ffffff";

  let currentIconColor = svgColor;
  if (isLogout) currentIconColor = svgColorLogout;
  else if (active) currentIconColor = svgColorActive;

  return (
    <li className={containerClasses} style={{ listStyle: 'none' }}>
      <Link
        ref={linkRef}
        to={to}
        onClick={handleLinkClick}
        className={linkClasses}
        aria-label={label}
        aria-current={active ? 'page' : undefined}
        onMouseEnter={() => !isMobileItem && setHovered(true)}
        onMouseLeave={() => !isMobileItem && setHovered(false)}
        onFocus={() => !isMobileItem && setHovered(true)}
        onBlur={() => !isMobileItem && setHovered(false)}
      >
        {!isMobileItem && isSidebarOpen && (
          <span
            className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full ${
              active ? 'bg-indigo-300 opacity-100' : 'bg-indigo-200/70 opacity-0 group-hover:opacity-80'
            }`}
          />
        )}

        <div className="shrink-0 relative flex items-center justify-center">
          {React.cloneElement(icon, {
            stroke: currentIconColor,
            color: currentIconColor,
            fill: "none",
            className: `${
              isMobileItem ? "w-6 h-6" :
              isSidebarOpen
                ? (active ? "w-6 h-6 lg:w-6 lg:h-6 xl:w-7 xl:h-7" : "w-5 h-5 lg:w-6 lg:h-6 xl:w-6 xl:h-6")
                : (active ? "w-6 h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8" : "w-5 h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7")
            }`,
            strokeWidth: active ? 2.5 : 2,
            width: undefined,
            height: undefined,
          })}

          {badge && badge > 0 && (
            <span className={`absolute bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm border border-white z-50 animate-pulse
              ${isMobileItem ? 'top-1/2 -translate-y-1/2 -right-2 min-w-[18px] h-[18px]' : '-top-1 -right-1 min-w-[18px] h-[18px]'}`}>
              {badge > 9 ? '9+' : badge}
            </span>
          )}
        </div>

        {/* Text for mobile or expanded sidebar - escala en pantallas grandes */}
        {(isMobileItem || isSidebarOpen) && (
          <span className={`text-sm lg:text-base xl:text-base font-medium ml-1 truncate ${active ? 'text-white' : (isMobileItem ? 'text-gray-700' : '')}`}>
            {label}
          </span>
        )}

        {/* Tooltip for collapsed desktop sidebar */}
        {!isMobileItem && !isSidebarOpen && (
          <HoverTooltip anchorRef={linkRef} text={label} show={hovered} />
        )}
      </Link>
    </li>
  );
});

// --- Desktop Sidebar Component ---
export function DesktopSidebarBase({
  menuItems = [],
  userRole = "alumno",
  showPinnedToggle = true,
  showAutoCollapse = true,
  forceOpen = false,
  forceClosed = false,
  expandOnHoverOnly = false,
  setDesktopSidebarOpen,
  onSectionChange = null,
  activeSection = null,
  logoutPath = "/login",
  topOffset = "80px",
  heightOffset = "80px",
  badgeConfig = {}
}) {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(forceOpen && !forceClosed ? true : false);
  // Inicializar isPinnedCollapsed desde localStorage al montar
  const [isPinnedCollapsed, setIsPinnedCollapsed] = useState(() => {
    if (forceOpen || forceClosed) return false;
    // En modo hover, iniciar desbloqueado para que responda al mouse desde el inicio.
    // El usuario puede volver a fijar colapsado manualmente con el candado.
    if (expandOnHoverOnly) return false;
    try {
      return localStorage.getItem('sidebarPinnedCollapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    portrait: typeof window !== 'undefined' ? window.matchMedia('(orientation: portrait)').matches : false,
  });
  const [badges, setBadges] = useState({});

  useEffect(() => {
    if (!expandOnHoverOnly) return;
    // Si venía persistido como colapsado, liberarlo al entrar al modo hover.
    setIsPinnedCollapsed(false);
  }, [expandOnHoverOnly]);

  const timeoutRef = useRef(null);
  const freezeUntilRef = useRef(0);
  const sidebarRef = useRef(null);
  const scrollableRef = useRef(null);
  const pinnedGraceUntilRef = useRef(0);

  const HOVER_CLOSE_DELAY = expandOnHoverOnly ? 50 : 50; // expandOnHoverOnly: delay mayor para evitar retracción accidental
  const CLICK_FREEZE_MS = expandOnHoverOnly ? 1200 : 50; // expandOnHoverOnly: 1.2s freeze - evita colapso por mouseleave espurio tras clic/navegación

  // --- expandOnHoverOnly: Sidebar colapsado por defecto, expande solo al hover, retrae solo al mouse leave ---
  // El usuario puede mantener el toggle de candado activo para fijar colapsado.
  const effectivePinnedCollapsed = isPinnedCollapsed;
  const effectiveShowPinnedToggle = showPinnedToggle;

  // --- SOLUCIÓN CLAVE: Variable maestra ---
  // Si forceClosed es true, effectiveOpen SIEMPRE es false.
  // Si forceOpen es true y forceClosed es false, effectiveOpen SIEMPRE es true.
  // Si no, usa el estado interno.
  const effectiveOpen = forceClosed ? false : (forceOpen ? true : isSidebarOpen);

  // Load badges if configured
  useEffect(() => {
    if (badgeConfig.loadFunction) {
      const loadBadges = async () => {
        try {
          const result = await badgeConfig.loadFunction();
          setBadges(result);
        } catch (error) {
          console.error('Error loading badges:', error);
        }
      };
      loadBadges();

      // Set up event listeners if provided
      const handler = () => loadBadges();
      const cleanup = [];

      if (badgeConfig.eventName) {
        window.addEventListener(badgeConfig.eventName, handler);
        cleanup.push(() => window.removeEventListener(badgeConfig.eventName, handler));
      }

      if (badgeConfig.eventNames && Array.isArray(badgeConfig.eventNames)) {
        badgeConfig.eventNames.forEach(eventName => {
          window.addEventListener(eventName, handler);
          cleanup.push(() => window.removeEventListener(eventName, handler));
        });
      }

      return () => {
        cleanup.forEach(fn => fn());
      };
    }
  }, [badgeConfig]);

  // Viewport handling
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
      resizeTimeout = setTimeout(handleResize, 300);
    };

    window.addEventListener('resize', debouncedHandleResize);
    window.addEventListener('orientationchange', debouncedHandleResize);

    return () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      window.removeEventListener('resize', debouncedHandleResize);
      window.removeEventListener('orientationchange', debouncedHandleResize);
    };
  }, []);

  // Auto-collapse logic - solo aplicar si no hay preferencia guardada (no en expandOnHoverOnly)
  useEffect(() => {
    if (expandOnHoverOnly || !showAutoCollapse || forceOpen || forceClosed) return; // expandOnHoverOnly: siempre inicia colapsado, sin pin

    try {
      const pc = localStorage.getItem('sidebarPinnedCollapsed') === 'true';
      const prefersUnset = localStorage.getItem('sidebarPinnedCollapsed') === null;
      const isTablet = viewport.width >= 640 && viewport.width < 1024;
      const shouldAutoCollapse = prefersUnset && (isTablet || viewport.portrait);

      // Si ya está colapsado en localStorage, mantenerlo
      if (pc) {
        setIsPinnedCollapsed(true);
        setIsSidebarOpen(false);
        pinnedGraceUntilRef.current = Date.now() + 300; // Reducido de 800ms a 300ms
      } else if (shouldAutoCollapse) {
        // Solo auto-colapsar si no hay preferencia guardada
        setIsPinnedCollapsed(true);
        setIsSidebarOpen(false);
        pinnedGraceUntilRef.current = Date.now() + 300; // Reducido de 800ms a 300ms
      }
    } catch (_) { }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewport.width, viewport.portrait, showAutoCollapse, forceOpen, forceClosed, expandOnHoverOnly]);

  // Sidebar open/close logic
  const setSidebarOpenSafe = (open) => {
    // Si está forzado abierto, no permitimos cerrarlo
    if (forceOpen) return;
    // Si está forzado cerrado, no permitimos abrirlo
    if (forceClosed) return;

    setIsSidebarOpen(prev => {
      if (effectivePinnedCollapsed && open) return false;
      return open;
    });
  };

  const handleMouseEnter = () => {
    if (forceOpen || forceClosed || effectivePinnedCollapsed || Date.now() < pinnedGraceUntilRef.current) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setSidebarOpenSafe(true);
  };

  const handleMouseLeave = (e) => {
    if (forceOpen || forceClosed) return; // Salida rápida si está forzado
    // Si relatedTarget está dentro del sidebar (ej. movimiento entre hijos o clic), no colapsar
    if (e.relatedTarget && sidebarRef.current?.contains(e.relatedTarget)) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const scheduleCloseCheck = (delay = HOVER_CLOSE_DELAY) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (sidebarRef.current && sidebarRef.current.matches(':hover')) {
          timeoutRef.current = null;
          return;
        }
        const now = Date.now();
        // Usar freeze: al hacer clic (Link/navegación) el DOM puede actualizarse y disparar mouseleave; el freeze evita colapso prematuro
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
    if (forceOpen || forceClosed) return; // No permitir toggle si está forzado

    setIsPinnedCollapsed(prev => {
      const next = !prev;
      if (next) {
        setSidebarOpenSafe(false);
        pinnedGraceUntilRef.current = Date.now() + 300;
      } else {
        pinnedGraceUntilRef.current = Date.now() + 50;
      }
      try { localStorage.setItem('sidebarPinnedCollapsed', String(next)); } catch (_) { }
      return next;
    });
  };

  const isTablet = viewport.width >= 640 && viewport.width < 1024;
  const hoverEnabled = !forceOpen && !forceClosed && (!isTablet || expandOnHoverOnly);

  // Usamos effectiveOpen en lugar de isSidebarOpen para calcular el ancho
  const sidebarWidth = effectiveOpen
    ? (isTablet ? 'w-60' : 'w-56 md:w-60 lg:w-64')
    : (isTablet ? 'w-20' : 'w-16 md:w-20');

  // Solo Cerrar Sesión (path === logoutPath) fijo abajo; Configuración y el resto hacen scroll
  const mainItems = menuItems.filter(item => item.path !== logoutPath);
  const bottomItems = menuItems.filter(item => item.path === logoutPath);

  // Restaurar posición del scroll del área de opciones
  useEffect(() => {
    const savedScroll = sessionStorage.getItem('sidebarScrollTop');
    const el = scrollableRef.current;
    if (el && savedScroll) {
      const n = parseInt(savedScroll, 10);
      if (n > 0) { el.scrollTop = n; try { sessionStorage.removeItem('sidebarScrollTop'); } catch { } }
    }
  }, [location.pathname]);

  // Informar al Layout el estado del sidebar para ajustar el margen del contenido
  useEffect(() => {
    if (setDesktopSidebarOpen) setDesktopSidebarOpen(effectiveOpen);
  }, [effectiveOpen, setDesktopSidebarOpen]);

  return (
    <aside
      ref={sidebarRef}
      className={`hidden sm:flex flex-col fixed ${sidebarWidth} ${isTablet ? 'shadow-md' : 'shadow-md'} z-2000 bg-white border-r border-gray-200/50 overflow-hidden transition-[width] duration-150 ease-out`}
      style={{
        top: topOffset,
        height: `calc(100vh - ${heightOffset})`,
        contain: 'layout style',
        willChange: 'auto',
      }}
      aria-label={`Sidebar de ${userRole}`}
      // En modo hover también habilitamos hover en tablet (sm/md) para comportamiento consistente
      onMouseEnter={hoverEnabled ? handleMouseEnter : undefined}
      onMouseLeave={hoverEnabled ? handleMouseLeave : undefined}
      onClickCapture={() => { freezeUntilRef.current = Date.now() + CLICK_FREEZE_MS; }}
      onClick={() => {
        if (forceOpen || forceClosed) return; // Click no hace nada si está forzado
        if (isTablet && !expandOnHoverOnly) {
          if (effectivePinnedCollapsed) return;
          setIsSidebarOpen(prev => !prev);
          return;
        }
        // expandOnHoverOnly: el clic NO retrae; si estaba colapsado y hacemos clic (caso raro), expandir
        if (!effectivePinnedCollapsed && !isSidebarOpen) setSidebarOpenSafe(true);
      }}
      onFocus={() => {
        if (hoverEnabled && !effectivePinnedCollapsed) {
          setSidebarOpenSafe(true);
        }
      }}
      onBlur={(e) => {
        // expandOnHoverOnly: NUNCA retraer por blur - solo por mouse leave (evita que el clic en un Link cause retraer)
        if (expandOnHoverOnly) return;
        if (forceOpen || forceClosed || effectivePinnedCollapsed) return;
        if (sidebarRef.current && !sidebarRef.current.contains(e.relatedTarget)) {
          setSidebarOpenSafe(false);
        }
      }}
    >
      {effectiveShowPinnedToggle && !forceOpen && !forceClosed && (
        <div className="px-3 py-2.5 flex items-center justify-end gap-2 border-b border-slate-200/50 bg-slate-50/60">
          <button
            onClick={togglePinned}
            className={`inline-flex items-center justify-center w-8 h-8 rounded-md border text-xs font-medium transition-colors duration-150
              ${isPinnedCollapsed ? 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
            title={isPinnedCollapsed ? 'Liberar sidebar (permitir expandir)' : 'Fijar colapsado (no expandir)'}
            aria-pressed={isPinnedCollapsed}
          >
            {isPinnedCollapsed ? <Lock size={16} /> : <Unlock size={16} />}
          </button>
        </div>
      )}

      <nav className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Opciones principales + Configuración: ocupa todo el espacio disponible y distribuye los ítems */}
        <div
          ref={scrollableRef}
          data-sidebar-scroll
          className="flex-1 min-h-0 flex flex-col overflow-y-auto overflow-x-visible no-scrollbar"
        >
          <ul className="flex-1 flex flex-col justify-between px-3 lg:px-4 xl:px-4 pt-4 pb-2 lg:pt-5 lg:pb-3 gap-1 min-h-full list-none">
            {mainItems.map((item) => (
              <SidebarItem
                key={item.path || item.label}
                icon={item.icon}
                label={item.label}
                to={item.path}
                isSidebarOpen={effectiveOpen}
                sectionKey={item.sectionKey}
                badge={badges[item.badgeKey]}
                onSectionChange={onSectionChange}
                isActive={item.sectionKey ? activeSection === item.sectionKey : undefined}
                logoutPath={logoutPath}
              />
            ))}
          </ul>
        </div>
        <div className="shrink-0 px-4 lg:px-5 xl:px-5 pt-2 pb-4 lg:pt-3 lg:pb-5 border-t border-gray-200/60 bg-white/50">
          <ul className="space-y-1 list-none">
            {bottomItems.map((item) => (
              <SidebarItem
                key={item.path || item.label}
                icon={item.icon}
                label={item.label}
                to={item.path}
                isSidebarOpen={effectiveOpen}
                sectionKey={item.sectionKey}
                badge={badges[item.badgeKey]}
                onSectionChange={onSectionChange}
                isActive={item.sectionKey ? activeSection === item.sectionKey : undefined}
                logoutPath={logoutPath}
              />
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  );
}