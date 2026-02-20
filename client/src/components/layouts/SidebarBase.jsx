import React, { useState, useRef, useEffect } from "react";
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Lock, Unlock } from 'lucide-react';
import { useAuth } from "../../context/AuthContext.jsx";
import { logoutRequest } from "../../api/usuarios.js";

// --- Tooltip Component (reusable) ---
function HoverTooltip({ anchorRef, text, show }) {
  const [style, setStyle] = useState({ display: 'none' });

  useEffect(() => {
    if (!show || !anchorRef?.current) {
      setStyle({ display: 'none' });
      return;
    }
    const rect = anchorRef.current.getBoundingClientRect();
    const top = rect.top + rect.height / 2;
    const left = rect.right + 15;

    setStyle({
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      transform: 'translateY(-50%)',
      zIndex: 9999,
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
    });
  }, [show, anchorRef]);

  if (!show) return null;

  return createPortal(
    <div style={style} className="bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-100 border border-gray-700">
      {text}
      <div className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
    </div>,
    document.body
  );
}

// --- Sidebar Item Component ---
function SidebarItem({
  icon,
  label,
  to,
  isSidebarOpen,
  mobileOnClick,
  isActive,
  sectionKey,
  badge,
  onSectionChange,
  logoutPath = "/login",
  userRole
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
  let linkClasses = "flex items-center transition-all duration-300 ease-out relative select-none ";

  if (isMobileItem) {
    // Mobile styles
    containerClasses = "w-full mb-1 px-3";
    linkClasses += "justify-start pl-4 pr-3 gap-3 py-3 rounded-2xl w-full border-none ";

    if (active) {
      linkClasses += "bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg ring-0 outline-none ";
    } else {
      if (isLogout) {
        linkClasses += "text-red-500 bg-transparent active:bg-red-50 ";
      } else {
        linkClasses += "text-gray-600 bg-transparent active:bg-indigo-50 ";
      }
    }
  } else {
    // Desktop
    const isAdmin = userRole === 'admin';
    containerClasses = "group flex justify-center items-center relative z-10 w-full px-2 " +
      (isSidebarOpen
        ? (isAdmin ? "min-h-[40px] lg:min-h-[42px] xl:min-h-[42px] 2xl:min-h-[50px]" : "min-h-[42px]")
        : (isAdmin ? "min-h-[42px] lg:min-h-[44px] xl:min-h-[44px] 2xl:min-h-[54px]" : "min-h-[46px]"));

    if (isSidebarOpen) {
      // Desplegado: estilo listado limpio, sin cajas ni scale
      linkClasses += "justify-start pl-3 pr-3 gap-3 rounded-xl w-full py-2 2xl:py-3 ";
      if (active) {
        linkClasses += "bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold shadow-sm ";
      } else if (isLogout) {
        linkClasses += "bg-transparent text-red-500 hover:bg-red-50/80 ";
      } else {
        linkClasses += "bg-transparent text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 ";
      }
    } else {
      // Colapsado: iconos en caja
      linkClasses += "justify-center p-0 rounded-xl w-10 h-10 aspect-square ";
      if (active) {
        linkClasses += "bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/40 z-20 font-bold border-none ";
      } else if (isLogout) {
        linkClasses += "bg-white text-red-500 border border-gray-200 shadow-sm hover:bg-red-50 hover:border-red-200 hover:text-red-600 ";
      } else {
        linkClasses += "bg-white text-gray-500 border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-300 hover:scale-105 ";
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
        <div className="flex-shrink-0 relative flex items-center justify-center">
          {React.cloneElement(icon, {
            stroke: currentIconColor,
            color: currentIconColor,
            fill: "none",
            className: `transition-all duration-300 ${isMobileItem ? "w-6 h-6" : (active ? "w-5 h-5" : "w-[18px] h-[18px]")}`,
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

        {/* Text for mobile or expanded sidebar */}
        {(isMobileItem || isSidebarOpen) && (
          <span className={`text-sm font-medium ml-1 truncate ${active ? 'text-white' : (isMobileItem ? 'text-gray-700' : '')}`}>
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
}

// --- Desktop Sidebar Component ---
export function DesktopSidebarBase({
  menuItems = [],
  userRole = "alumno",
  showPinnedToggle = true,
  showAutoCollapse = true,
  forceOpen = false,
  forceClosed = false,
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

  const timeoutRef = useRef(null);
  const freezeUntilRef = useRef(0);
  const sidebarRef = useRef(null);
  const scrollableRef = useRef(null);
  const pinnedGraceUntilRef = useRef(0);

  const HOVER_CLOSE_DELAY = 100; // Reducido para respuesta más rápida
  const CLICK_FREEZE_MS = 200; // Reducido para respuesta más rápida

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
      resizeTimeout = setTimeout(handleResize, 200);
    };

    window.addEventListener('resize', debouncedHandleResize);
    window.addEventListener('orientationchange', debouncedHandleResize);

    return () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      window.removeEventListener('resize', debouncedHandleResize);
      window.removeEventListener('orientationchange', debouncedHandleResize);
    };
  }, []);

  // Auto-collapse logic - solo aplicar si no hay preferencia guardada
  useEffect(() => {
    if (!showAutoCollapse || forceOpen || forceClosed) return; // Si está forzado abierto o cerrado, no auto-colapsar

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
  }, [viewport.width, viewport.portrait, showAutoCollapse, forceOpen, forceClosed]);

  // Sidebar open/close logic
  const setSidebarOpenSafe = (open) => {
    // Si está forzado abierto, no permitimos cerrarlo
    if (forceOpen) return;
    // Si está forzado cerrado, no permitimos abrirlo
    if (forceClosed) return;

    setIsSidebarOpen(prev => {
      if (isPinnedCollapsed && open) return false;
      return open;
    });
  };

  const handleMouseEnter = () => {
    if (forceOpen || forceClosed || isPinnedCollapsed || Date.now() < pinnedGraceUntilRef.current) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setSidebarOpenSafe(true);
  };

  const handleMouseLeave = (e) => {
    if (forceOpen || forceClosed) return; // Salida rápida si está forzado

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
  const isSmallScreen = viewport.height < 600;
  const isLargeScreen = viewport.height > 900;

  // Altura y anchos consistentes con Layout.jsx
  const sidebarWidth = effectiveOpen
    ? (isTablet ? 'w-60' : 'w-64 2xl:w-72')
    : (isTablet ? 'w-20' : 'w-20');

  // Altura dinámica para pantallas pequeñas
  const sidebarHeight = isSmallScreen
    ? `${viewport.height - parseInt(heightOffset.replace('px', ''))}px`
    : `calc(100vh - ${heightOffset})`;

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

  return (
    <aside
      ref={sidebarRef}
      className={`hidden sm:flex flex-col fixed ${sidebarWidth} ${isTablet ? 'shadow-md' : 'shadow-lg'} z-[2000] bg-white/95 ${isTablet ? 'backdrop-blur-[2px]' : 'backdrop-blur-sm'} border-r border-gray-200/80 ${isTablet ? (effectiveOpen ? 'translate-x-0' : '-translate-x-0') : ''} transition-all duration-150 ease-out transform-gpu will-change-transform overflow-hidden`}
      style={{
        top: topOffset,
        height: sidebarHeight,
        transform: 'translateX(0)',
        opacity: 1,
        backdropFilter: isTablet ? 'blur(2px)' : 'blur(10px)',
        WebkitBackdropFilter: isTablet ? 'blur(2px)' : 'blur(10px)',
        // Mejoras para pantallas pequeñas
        ...(isSmallScreen && {
          maxHeight: '100vh',
          overflowY: 'auto'
        }),
        // Mejoras para tablets
        ...(isTablet && {
          borderRadius: effectiveOpen ? '0 12px 12px 0' : '0'
        })
      }}
      aria-label={`Sidebar de ${userRole}`}
      // Si está forceOpen o forceClosed, desactivamos los listeners del mouse pasando undefined
      onMouseEnter={isTablet || forceOpen || forceClosed ? undefined : handleMouseEnter}
      onMouseLeave={isTablet || forceOpen || forceClosed ? undefined : handleMouseLeave}
      onClickCapture={() => { freezeUntilRef.current = Date.now() + CLICK_FREEZE_MS; }}
      onClick={() => {
        if (forceOpen || forceClosed) return; // Click no hace nada si está forzado
        if (isTablet) {
          if (isPinnedCollapsed) return;
          setIsSidebarOpen(prev => !prev);
          return;
        }
        if (!isPinnedCollapsed && !isSidebarOpen) setSidebarOpenSafe(true);
      }}
      onFocus={() => {
        if (!forceOpen && !forceClosed && !isTablet && !isPinnedCollapsed) {
          setSidebarOpenSafe(true);
        }
      }}
      onBlur={(e) => {
        if (forceOpen || forceClosed || isPinnedCollapsed) return;
        if (sidebarRef.current && !sidebarRef.current.contains(e.relatedTarget)) {
          setSidebarOpenSafe(false);
        }
      }}
    >
      {showPinnedToggle && !forceOpen && !forceClosed && (
        <div className="px-3 py-2.5 flex items-center justify-end gap-2 border-b border-slate-200/50 bg-slate-50/60">
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
      )}

      <nav className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Opciones principales + Configuración hacen scroll; solo Cerrar Sesión fijo abajo */}
        <div
          ref={scrollableRef}
          data-sidebar-scroll
          className="flex-1 min-h-0 overflow-y-auto overflow-x-visible no-scrollbar"
        >
          <ul className={`px-3 pt-3 pb-2 list-none ${userRole === 'admin' ? 'space-y-1 lg:space-y-1.5 xl:space-y-1.5 2xl:space-y-3' : 'space-y-0.5'}`}>
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
                userRole={userRole}
              />
            ))}
          </ul>
        </div>
        <div className="flex-shrink-0 px-4 pt-2 pb-4 border-t border-gray-200/60 bg-white/50">
          <ul className={`space-y-0.5 list-none ${userRole === 'admin' ? 'lg:space-y-1 xl:space-y-1 2xl:space-y-2.5' : ''}`}>
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
                userRole={userRole}
              />
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  );
}