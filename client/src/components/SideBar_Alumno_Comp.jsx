// src/components/SideBar_Alumno_comp.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Lock } from 'lucide-react';
import { useStudent } from '../context/StudentContext.jsx';

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
function ElementoSideBarAlumno({ Icono, NombreElemento, to, isSidebarOpen, onClick: mobileOnClick, activo, sectionKey }) {
  const { isVerified, hasPaid, activeSection, setActiveSectionHandler } = useStudent();
  const location = useLocation();
  const navigate = useNavigate();
  const isLogout = to === "/logout";
  const isInicio = to === "/alumno/" || to === "/alumno";
  
  // Para las secciones que usan el nuevo sistema, verificar si esta sección está activa
  const isActive = sectionKey ? activeSection === sectionKey : location.pathname === to;
  
  // El elemento está bloqueado si el estudiante no está verificado/pagado y no es inicio o logout
  const isBlocked = (!isVerified || !hasPaid) && !isInicio && !isLogout;
  const isMobileItem = !!mobileOnClick;

  const handleLinkClick = (e) => {
    if (isBlocked) {
      e.preventDefault();
      alert('Debes completar la verificación y el pago para acceder a esta sección.');
      return;
    }
    
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
        to={isBlocked ? '#' : to}
        onClick={handleLinkClick}
        className={`
          items-center p-2 rounded-lg flex w-full transition-all duration-200 ease-in-out relative
          ${isActive
            ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg transform scale-[1.02]"
            : isBlocked
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:text-purple-700 hover:shadow-md hover:transform hover:scale-[1.01]"}
          ${isLogout ? "hover:bg-red-50 hover:text-red-600" : ""}
        `}
        tabIndex={isBlocked ? -1 : 0}
        aria-disabled={isBlocked}
      >
        <div className="flex-shrink-0">
          {isBlocked ? (
            <Lock size={24} className="text-gray-400" />
          ) : (
            React.cloneElement(Icono, {
              stroke: isLogout ? svgColorLogout : (isActive ? "white" : svgColor),
              fill: "none"
            })
          )}
        </div>
        {isMobileItem ? (
          <span className="text-sm font-medium whitespace-nowrap block ml-2">
            {NombreElemento}
          </span>
        ) : (
          <>
            <span className={`text-sm font-medium whitespace-nowrap ml-2 transition-all duration-300 ease-in-out ${
              isSidebarOpen ? 'opacity-100 translate-x-0 delay-100' : 'opacity-0 -translate-x-2 w-0 overflow-hidden'
            }`}>
              {NombreElemento}
            </span>
            {!isSidebarOpen && (
              <span className="hidden group-hover:block absolute left-full top-1/2 -translate-y-1/2 ml-3 bg-gray-900/90 text-white px-3 py-2 rounded-lg shadow-xl z-50 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none backdrop-blur-sm border border-gray-700/50 text-sm font-medium">
                {NombreElemento}
              </span>
            )}
          </>
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
  { label: "Feedback", path: "/alumno/feedback", icon: LogoFeedback },
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
  const timeoutRef = useRef(null);

  const sidebarWidth = isSidebarOpen ? 'w-64' : 'w-[80px]'; // Incrementado el ancho expandido para mejor visibilidad

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsSidebarOpen(true);
    // ¡CRÍTICO! Llama a la función del Layout para comunicar el estado
    if (setDesktopSidebarOpen) {
      setDesktopSidebarOpen(true);
    }
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsSidebarOpen(false);
      // ¡CRÍTICO! Llama a la función del Layout para comunicar el estado
      if (setDesktopSidebarOpen) {
        setDesktopSidebarOpen(false);
      }
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <aside
      className={`max-sm:hidden flex flex-col fixed ${sidebarWidth} shadow-lg z-40 top-[80px] h-[calc(100vh-80px)] bg-white/95 backdrop-blur-sm border-r border-gray-200/80 transition-all duration-300 ease-in-out overflow-hidden`}
      style={{
        transform: isSidebarOpen ? 'translateX(0)' : 'translateX(0)',
        opacity: 1,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      }}
      aria-label="Sidebar de escritorio de alumno"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <nav className="h-full">
        <ul className="p-4 h-full flex flex-col list-none">
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
                to="/logout"
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
        <nav className="h-full">
          <ul className="p-4 space-y-2 h-full flex flex-col justify-between overflow-y-auto list-none">
            {/* Grupo superior de elementos de navegación móvil */}
            <div>
              {alumnoMenuItems.map((item) => (
                <ElementoSideBarAlumno
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
                  to="/logout"
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
