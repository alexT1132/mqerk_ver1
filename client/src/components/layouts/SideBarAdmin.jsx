import React, { useState, useEffect, useRef } from "react";
import { BsGraphUp } from "react-icons/bs";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logoutRequest } from "../../api/usuarios.js";
import { useAuth } from "../../context/AuthContext.jsx";
import axios from "../../api/axios";
import { createPortal } from 'react-dom';
import { DesktopSidebarBase } from "./SidebarBase.jsx";

// --- COLORES ---
const svgColor = "#3818c3";       // Azul original
const svgColorLogout = "#EA3323"; // Rojo original
const svgColorActive = "#ffffff"; // Blanco

// --- TOOLTIP (Solo PC) ---
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

/**
 * ElementoSideBar
 */
function ElementoSideBar({ Icono, NombreElemento, to, onClick: mobileOnClick, badge }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout: authLogout } = useAuth();
  const isActive = location.pathname === to;
  const linkRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  const isMobileItem = !!mobileOnClick;

  const handleLinkClick = async (e) => {
    if (to === "/login") {
      e.preventDefault();
      if (mobileOnClick) mobileOnClick();

      // Hacer logout en segundo plano sin bloquear la UI
      (async () => {
        try {
          await logoutRequest().catch(() => { });
          await authLogout?.();
          // Limpiar solo lo necesario
          try {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminProfile');
            localStorage.removeItem('mq_user');
            localStorage.removeItem('rememberMe');
            Object.keys(localStorage).forEach(key => {
              if (key.startsWith('mq_') || key.includes('token') || key.includes('auth')) {
                localStorage.removeItem(key);
              }
            });
          } catch { }
        } catch (error) {
          console.error('Error durante logout:', error);
        } finally {
          // Redirigir sin recargar la página
          navigate('/login', { replace: true });
        }
      })();
      return;
    }

    if (mobileOnClick) mobileOnClick();

    if (isActive && to !== "/login") {
      e.preventDefault();
      navigate("/administrativo/bienvenida");
    }
  };

  // =====================================================================
  // ESTILOS CORREGIDOS (MÓVIL VS PC)
  // =====================================================================

  let containerClasses = "";
  let linkClasses = "flex items-center transition-all duration-300 ease-out relative select-none ";

  if (isMobileItem) {
    // --- MÓVIL (CORREGIDO) ---
    // Usamos px-3 y w-full para asegurar que llene el contenedor ampliado.
    containerClasses = "w-full mb-1 px-3";

    // Ajuste: gap-3 en vez de gap-4 para ganar espacio, padding equilibrado.
    linkClasses += "justify-start pl-4 pr-3 gap-3 py-3 rounded-2xl w-full border-none ";

    if (isActive) {
      // Activo Móvil: Gradiente bonito y texto blanco
      linkClasses += "bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md ring-0 outline-none ";
    } else {
      // Inactivo Móvil: Transparente limpio
      if (to === "/login") {
        linkClasses += "text-red-500 bg-transparent active:bg-red-50 ";
      } else {
        linkClasses += "text-gray-600 bg-transparent active:bg-indigo-50 ";
      }
    }

  } else {
    // --- PC (RELIEVE MANTENIDO) ---
    containerClasses = "group flex justify-center items-center relative z-10 min-h-[52px] w-full px-2";
    linkClasses += "justify-center p-0 rounded-xl w-10 h-10 aspect-square ";

    if (isActive) {
      linkClasses += "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/40 transform scale-110 z-20 font-bold border-none ";
    } else {
      if (to === "/login") {
        linkClasses += "bg-white text-red-500 border border-gray-200 shadow-sm hover:bg-red-50 hover:border-red-200 hover:text-red-600 ";
      } else {
        linkClasses += "bg-white text-gray-500 border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-300 hover:scale-105 ";
      }
    }
  }

  let currentIconColor = svgColor;
  if (to === "/login") currentIconColor = svgColorLogout;
  else if (isActive) currentIconColor = svgColorActive;

  return (
    <li className={containerClasses} style={{ listStyle: 'none' }}>
      <Link
        ref={linkRef}
        to={to}
        onClick={handleLinkClick}
        className={linkClasses}
        onMouseEnter={() => !isMobileItem && setHovered(true)}
        onMouseLeave={() => !isMobileItem && setHovered(false)}
      >
        {/* Icono */}
        <div className="flex-shrink-0 relative flex items-center justify-center">
          {React.cloneElement(Icono, {
            stroke: currentIconColor,
            color: currentIconColor,
            fill: "none",
            // En móvil un poco más grande (24px) para que se vea bien
            className: `transition-all duration-300 ${isMobileItem ? "w-6 h-6" : (isActive ? "w-5 h-5" : "w-[18px] h-[18px]")}`,
            strokeWidth: isActive ? 2.5 : 2,
            ...(to === "/administrativo/lista-alumnos" && isActive ? { fill: "white" } : {})
          })}

          {badge && badge > 0 && (
            <span className={`absolute bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm border border-white z-50 animate-pulse
              ${isMobileItem ? 'top-1/2 -translate-y-1/2 -right-2 min-w-[18px] h-[18px]' : '-top-1 -right-1 min-w-[18px] h-[18px]'}`}>
              {badge > 9 ? '9+' : badge}
            </span>
          )}
        </div>

        {/* Texto en Móvil - Ajustado tamaño de fuente */}
        {isMobileItem && (
          <span className={`text-[15px] leading-none font-medium ml-1 truncate ${isActive ? 'text-white' : 'text-gray-700'}`}>
            {NombreElemento}
          </span>
        )}

        {/* Tooltip en PC */}
        {!isMobileItem && (
          <HoverTooltip anchorRef={linkRef} text={NombreElemento} show={hovered} />
        )}
      </Link>
    </li>
  );
}

// --- ICONOS ---
const xmlns = "http://www.w3.org/2000/svg";
const LogoInicio = (<svg xmlns={xmlns} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>);
const LogoDashboard = (<svg xmlns={xmlns} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>);
const LogoComprobantes = (<svg xmlns={xmlns} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16l4-2 4 2 4-2 4 2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="9" x2="16" y2="9"></line><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="13" y2="17"></line></svg>);
const LogoAlumnos = (<svg xmlns={xmlns} viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75"></path></svg>);
const LogoGenerarContrato = (<svg xmlns={xmlns} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><circle cx="11.5" cy="14.5" r="2.5"></circle><path d="M13.25 16.25L15 18"></path></svg>);
const LogoReportesPagos = (<svg xmlns={xmlns} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="10" y2="9"></line></svg>);
const LogoCalendario = (<svg xmlns={xmlns} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>);
const LogoEmail = (<svg xmlns={xmlns} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>);
const LogoConfig = (<svg xmlns={xmlns} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1.51-1V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>);
const LogoLogOut = (<svg xmlns={xmlns} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="17 16 22 12 17 8"></polyline><line x1="22" y1="12" x2="10" y2="12"></line></svg>);
const LogoFinanzas = (<BsGraphUp size={20} />);
const LogoChat = (<svg xmlns={xmlns} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>);


export function SideBarDesktop() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const res = await axios.get('/chat/support/unread');
        setUnreadCount(res.data?.data?.total || 0);
      } catch (e) {
        console.error('Error loading unread count:', e);
      }
    };
    loadUnreadCount();
    const handler = () => loadUnreadCount();
    window.addEventListener('admin-chat-update', handler);
    const wsHandler = (e) => {
      const data = e.detail;
      if (data?.type === 'chat_message' && data.data) {
        const msg = data.data;
        if (msg.sender_role === 'estudiante') setUnreadCount(prev => prev + 1);
      }
    };
    window.addEventListener('student-ws-message', wsHandler);
    return () => {
      window.removeEventListener('admin-chat-update', handler);
      window.removeEventListener('student-ws-message', wsHandler);
    };
  }, []);

  // Menú principal de admin
  const adminMenuItems = [
    { label: "Bienvenida", path: "/administrativo/bienvenida", icon: LogoInicio },
    { label: "Dashboard", path: "/administrativo/dashboard-metricas", icon: LogoDashboard },
    { label: "Comprobantes Recibidos", path: "/administrativo/comprobantes-recibo", icon: LogoComprobantes },
    { label: "Lista de Alumnos", path: "/administrativo/lista-alumnos", icon: LogoAlumnos },
    { label: "Generar Contrato", path: "/administrativo/generar-contrato", icon: LogoGenerarContrato },
    { label: "Reportes de Pagos", path: "/administrativo/reportes-pagos", icon: LogoReportesPagos },
    { label: "Calendario", path: "/administrativo/calendario", icon: LogoCalendario },
    { label: "Email", path: "/administrativo/email", icon: LogoEmail },
    { label: "Asesores", path: "/administrativo/asesores", icon: LogoAlumnos },
    { label: "Chat de Soporte", path: "/administrativo/chat", icon: LogoChat, badgeKey: "chat" },
    { label: "Finanzas", path: "/administrativo/finanzas", icon: LogoFinanzas },
  ];

  // Items del fondo (configuración y logout)
  const adminBottomItems = [
    { label: "Configuración", path: "/administrativo/configuracion", icon: LogoConfig, isBottom: true },
    { label: "Cerrar Sesión", path: "/login", icon: LogoLogOut, isBottom: true },
  ];

  // Combinar todos los items
  const allAdminMenuItems = [...adminMenuItems, ...adminBottomItems];

  return (
    <DesktopSidebarBase
      menuItems={allAdminMenuItems}
      userRole="admin"
      showPinnedToggle={false}
      showAutoCollapse={false}
      forceOpen={false}
      forceClosed={true}
      logoutPath="/login"
      topOffset="80px"
      heightOffset="80px"
      badgeConfig={{
        loadFunction: async () => {
          try {
            const res = await axios.get('/chat/support/unread');
            return { chat: res.data?.data?.total || 0 };
          } catch (e) {
            return { chat: 0 };
          }
        },
        eventNames: ['admin-chat-update', 'student-ws-message']
      }}
    />
  );
}

/**
 * SideBarsm (Móvil - ARREGLADO)
 * Se aumentó el ancho a w-72 para evitar que el texto se corte.
 */
export function SideBarsm({ isMenuOpen, closeMenu }) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const res = await axios.get('/chat/support/unread');
        setUnreadCount(res.data?.data?.total || 0);
      } catch (e) {
        console.error('Error loading unread count:', e);
      }
    };
    loadUnreadCount();
    const handler = () => loadUnreadCount();
    window.addEventListener('admin-chat-update', handler);
    const wsHandler = (e) => {
      const data = e.detail;
      if (data?.type === 'chat_message' && data.data) {
        const msg = data.data;
        if (msg.sender_role === 'estudiante') setUnreadCount(prev => prev + 1);
      }
    };
    window.addEventListener('student-ws-message', wsHandler);
    return () => {
      window.removeEventListener('admin-chat-update', handler);
      window.removeEventListener('student-ws-message', wsHandler);
    };
  }, []);

  return (
    <>
      {isMenuOpen && (
        <>
          <div
            className="sm:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={closeMenu}
            aria-hidden="true"
            style={{
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)'
            }}
          ></div>
          {/* CORRECCIÓN: w-72 en lugar de w-64 para dar espacio al texto */}
          <aside className="sm:hidden fixed top-[64px] left-0 w-72 h-[calc(100vh-64px)] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col overflow-hidden">
            <nav className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
                <ul className="py-4 px-2 space-y-1 list-none">
                  <ElementoSideBar to="/administrativo/bienvenida" Icono={LogoInicio} NombreElemento="Bienvenida" onClick={closeMenu} />
                  <ElementoSideBar to="/administrativo/dashboard-metricas" Icono={LogoDashboard} NombreElemento="Dashboard" onClick={closeMenu} />
                  <ElementoSideBar to="/administrativo/comprobantes-recibo" Icono={LogoComprobantes} NombreElemento="Comprobantes Recibidos" onClick={closeMenu} />
                  <ElementoSideBar to="/administrativo/lista-alumnos" Icono={LogoAlumnos} NombreElemento="Lista de Alumnos" onClick={closeMenu} />
                  <ElementoSideBar to="/administrativo/generar-contrato" Icono={LogoGenerarContrato} NombreElemento="Generar Contrato" onClick={closeMenu} />
                  <ElementoSideBar to="/administrativo/reportes-pagos" Icono={LogoReportesPagos} NombreElemento="Reportes de Pagos" onClick={closeMenu} />
                  <ElementoSideBar to="/administrativo/calendario" Icono={LogoCalendario} NombreElemento="Calendario" onClick={closeMenu} />
                  <ElementoSideBar to="/administrativo/email" Icono={LogoEmail} NombreElemento="Email" onClick={closeMenu} />
                  <ElementoSideBar to="/administrativo/asesores" Icono={LogoAlumnos} NombreElemento="Asesores" onClick={closeMenu} />
                  <ElementoSideBar to="/administrativo/chat" Icono={LogoChat} NombreElemento="Chat de Soporte" onClick={closeMenu} badge={unreadCount > 0 ? unreadCount : undefined} />
                  <ElementoSideBar to="/administrativo/finanzas" Icono={LogoFinanzas} NombreElemento="Finanzas" onClick={closeMenu} />
                  <ElementoSideBar to="/administrativo/configuracion" Icono={LogoConfig} NombreElemento="Configuración" onClick={closeMenu} />
                </ul>
              </div>
              <div className="flex-shrink-0 pb-4 pt-2 px-2 border-t border-gray-200/60 bg-white/50">
                <ul className="space-y-1 list-none">
                  <ElementoSideBar to="/login" Icono={LogoLogOut} NombreElemento="Cerrar Sesión" onClick={closeMenu} />
                </ul>
              </div>
            </nav>
          </aside>
        </>
      )}
    </>
  );
}