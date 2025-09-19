import React from "react";
import { BsGraphUp } from "react-icons/bs";
import { Link, useLocation, useNavigate } from "react-router-dom"; // Importamos useLocation y useNavigate
import { logoutRequest } from "../../api/usuarios.js";
import { useAuth } from "../../context/AuthContext.jsx";

/**
 * Componente para un elemento individual de la barra lateral.
 * Se utiliza tanto en la versión de escritorio como en la móvil, ajustando su comportamiento.
 * @param {object} props - Las props del componente.
 * @param {JSX.Element} props.Icono - El icono SVG a mostrar.
 * @param {string} props.NombreElemento - El nombre del elemento de navegación.
 * @param {string} props.to - La ruta a la que apunta el enlace.
 * @param {function} [props.onClick] - Función opcional para manejar clics (principalmente para cerrar el menú móvil).
 */
function ElementoSideBar({ Icono, NombreElemento, to, onClick: mobileOnClick }) { // Renombramos onClick a mobileOnClick
  const location = useLocation(); // Hook para obtener la ubicación actual
  const navigate = useNavigate(); // Hook para navegar programáticamente
  const { logout: authLogout } = useAuth();
  const isActive = location.pathname === to; // Comprobamos si la ruta actual coincide con la ruta del enlace

  // Define si es un elemento para el menú móvil o de escritorio
  const isMobileItem = !!mobileOnClick; // Si mobileOnClick está presente, asumimos que es para el menú móvil

  const handleLinkClick = (e) => {
    // Manejo especial para Cerrar Sesión
    if (to === "/login") {
      e.preventDefault();
      try {
        // Actualiza estado de auth en el cliente inmediatamente
        authLogout?.();
        // Llama al backend para limpiar la cookie httpOnly (sin bloquear redirección)
        logoutRequest().catch(() => {});
      } finally {
        // Limpieza adicional
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminProfile');
        if (mobileOnClick) mobileOnClick();
        // Hard redirect para desmontar Providers y evitar llamadas residuales
        window.location.href = '/login';
      }
      return;
    }
    // Si se proporciona una función de cierre para móvil, la llamamos primero
    if (mobileOnClick) {
      mobileOnClick();
    }

    // Lógica para alternar (toggle) la vista si el enlace ya está activo
    // Esta lógica no se aplica al botón de "Cerrar Sesión" ya que siempre debe navegar.
    if (isActive && to !== "/login") { // Agregamos la condición to !== "/login"
      e.preventDefault(); // Previene la navegación por defecto del Link si ya está activo
      // Navegamos de vuelta a la página de bienvenida
      // Asegúrate de que esta ruta '/administrativo/bienvenida' es la correcta para tu pantalla de bienvenida
      navigate("/administrativo/bienvenida"); 
    }
    // Si no está activo, o si es el botón de cerrar sesión, permitimos que la navegación predeterminada del Link continúe
  };

  return (
    <li className="group flex justify-start items-center h-fit gap-1.5 relative">
      <Link
        to={to}
        onClick={handleLinkClick} // Usamos nuestro nuevo manejador de clic
        // AÑADIDO 'relative' aquí para que el tooltip se posicione correctamente respecto a este enlace.
        className={`
          items-center p-2 rounded-lg flex w-full transition-colors duration-200 relative
          ${isActive
            ? "bg-indigo-600 text-white shadow-md" // Estilos para el estado activo
            : "text-gray-900 dark:text-white hover:bg-indigo-100 dark:hover:bg-indigo-700" // Estilos para el estado inactivo
          }
          ${to === "/login" ? "hover:bg-red-100 dark:hover:bg-red-700" : ""} /* Estilos hover específicos para cerrar sesión */
        `}
      >
        <div className="flex-shrink-0">
          {/* Clonamos el icono para aplicar color dinámico; compatible con SVG personalizados y react-icons */}
          {React.cloneElement(Icono, {
            color: to === "/login" ? svgColorLogout : (isActive ? "white" : svgColor),
            stroke: to === "/login" ? svgColorLogout : (isActive ? "white" : svgColor),
            ...(to === "/administrativo/lista-alumnos" && isActive ? { fill: "white" } : {})
          })}
        </div>
        {/*
          AJUSTE DE ESTILO: Tooltip mejorado para escritorio y texto visible para móvil
          CAMBIADO Z-INDEX A Z-50 PARA ASEGURAR QUE ESTÉ POR ENCIMA DEL SIDEBAR.
        */}
        <span
          className={`
            text-sm font-medium whitespace-nowrap
            ${isMobileItem
              ? 'block ml-2' // Siempre visible en móvil
              : 'hidden group-hover:block absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg z-50 opacity-0 group-hover:opacity-100 transition-all duration-300' // Z-INDEX CAMBIADO A Z-50
            }
          `}
        >
          {NombreElemento}
        </span>
      </Link>
    </li>
  );
}

// Definiciones de colores y tamaños para los SVG, compartidas.
const svgColor = "#3818c3"; // Azul principal
const svgColorLogout = "#EA3323"; // Rojo para cerrar sesión
const xmlns = "http://www.w3.org/2000/svg";
const width = "30px";
const height = "30px";

// Definición de los iconos SVG para cada elemento del menú.
const LogoInicio = (
  <svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const LogoDashboard = (
  <svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

const LogoComprobantes = (
  <svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16l4-2 4 2 4-2 4 2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="8" y1="9" x2="16" y2="9"></line>
    <line x1="8" y1="13" x2="16" y2="13"></line>
    <line x1="8" y1="17" x2="13" y2="17"></line>
  </svg>
);

// ACTUALIZADO: Logo para Lista de Alumnos - Ícono de tres personas (contorno más visible)
const LogoAlumnos = (
  <svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75"></path>
  </svg>
);


const LogoGenerarContrato = (
  <svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <circle cx="11.5" cy="14.5" r="2.5"></circle>
    <path d="M13.25 16.25L15 18"></path>
  </svg>
);

const LogoReportesPagos = (
  <svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <line x1="10" y1="9" x2="10" y2="9"></line>
  </svg>
);

const LogoCalendario = (
  <svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const LogoEmail = (
  <svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const LogoConfig = (
  <svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1.51-1V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

const LogoLogOut = (
  <svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColorLogout} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="17 16 22 12 17 8"></polyline>
    <line x1="22" y1="12" x2="10" y2="12"></line>
  </svg>
);

// Icono de Finanzas usando react-icons (gráfica ascendente)
const LogoFinanzas = (<BsGraphUp size={28} />);

/**
 * Componente de la barra lateral para escritorio (usando Flexbox ajustado).
 * Exportado como SideBarDesktop.
 */
export function SideBarDesktop() {
  return (
    <aside
      className="max-sm:hidden flex flex-col fixed w-[80px] shadow-[4px_0_10px_-2px_rgba(0,0,0,0.3)] z-40 top-[84px] h-[calc(100vh-84px)] bg-gray-50"
      aria-label="Sidebar de escritorio"
    >
      <nav className="h-full">
        <ul className="p-4 h-full flex flex-col">
          {/* Grupo superior de elementos de navegación principales */}
          <div className="space-y-2">
       
            <ElementoSideBar to="/administrativo/bienvenida" Icono={LogoInicio} NombreElemento="Bienvenida" />
            <ElementoSideBar to="/administrativo/dashboard-metricas" Icono={LogoDashboard} NombreElemento="Dashboard" />
            <ElementoSideBar to="/administrativo/comprobantes-recibo" Icono={LogoComprobantes} NombreElemento="Comprobantes Recibidos" />
            <ElementoSideBar to="/administrativo/lista-alumnos" Icono={LogoAlumnos} NombreElemento="Lista de Alumnos" />
            <ElementoSideBar to="/administrativo/generar-contrato" Icono={LogoGenerarContrato} NombreElemento="Generar Contrato" />
            <ElementoSideBar to="/administrativo/reportes-pagos" Icono={LogoReportesPagos} NombreElemento="Reportes de Pagos" />
            <ElementoSideBar to="/administrativo/calendario" Icono={LogoCalendario} NombreElemento="Calendario" />
            <ElementoSideBar to="/administrativo/email" Icono={LogoEmail} NombreElemento="Email" />
            <ElementoSideBar to="/administrativo/asesores" Icono={LogoAlumnos} NombreElemento="Asesores" />
            {/* Nueva opción: Finanzas */}
            <ElementoSideBar to="/administrativo/finanzas" Icono={LogoFinanzas} NombreElemento="Finanzas" />
          </div>

          {/* Espacio flexible que empuja los elementos inferiores */}
          <div className="flex-grow"></div> 

          {/* Elementos de Configuración y Cerrar Sesión en la parte inferior */}
          <div className="pt-2 space-y-2">
            <ElementoSideBar to="/administrativo/configuracion" Icono={LogoConfig} NombreElemento="Configuración" />
            <ElementoSideBar to="/login" Icono={LogoLogOut} NombreElemento="Cerrar Sesión" />
          </div>
        </ul>
      </nav>
    </aside>
  );
}

/**
 * Componente de la barra lateral para dispositivos móviles.
 * Exportado como SideBarsm.
 * @param {object} props - Las props del componente.
 * @param {boolean} props.isMenuOpen - Estado para saber si el menú móvil está abierto.
 * @param {function} props.closeMenu - Función para cerrar el menú, se pasa a los ElementoSideBar.
 */
export function SideBarsm({ isMenuOpen, closeMenu }) {
  return (
    <>
      {isMenuOpen && (
        <>
          {/* Overlay oscuro cuando el menú está abierto para cerrar al hacer clic fuera */}
          <div
            className="sm:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeMenu}
            aria-hidden="true"
          ></div>
          {/* Contenedor del menú lateral móvil con transición */}
          <aside className="sm:hidden fixed top-[64px] left-0 w-64 h-[calc(100vh-64px)] bg-gray-50 shadow-lg z-50 transform transition-transform duration-300 ease-in-out">
            <nav className="h-full">
              <ul className="p-4 space-y-2 h-full flex flex-col justify-between overflow-y-auto">
                {/* Grupo superior de elementos de navegación móvil */}
                <div>
                  {/* Los componentes ElementoSideBar ahora manejan la lógica de toggle y el resaltado */}
                  <ElementoSideBar
                    to="/administrativo/bienvenida"
                    Icono={LogoInicio}
                    NombreElemento="Bienvenida"
                    onClick={closeMenu}
                  />
                  <ElementoSideBar
                    to="/administrativo/dashboard-metricas"
                    Icono={LogoDashboard}
                    NombreElemento="Dashboard"
                    onClick={closeMenu}
                  />
                  <ElementoSideBar
                    to="/administrativo/comprobantes-recibo"
                    Icono={LogoComprobantes}
                    NombreElemento="Comprobantes Recibidos"
                    onClick={closeMenu}
                  />
                  <ElementoSideBar
                    to="/administrativo/lista-alumnos"
                    Icono={LogoAlumnos}
                    NombreElemento="Lista de Alumnos"
                    onClick={closeMenu}
                  />
                  <ElementoSideBar
                    to="/administrativo/generar-contrato"
                    Icono={LogoGenerarContrato}
                    NombreElemento="Generar Contrato"
                    onClick={closeMenu}
                  />
                  <ElementoSideBar
                    to="/administrativo/reportes-pagos"
                    Icono={LogoReportesPagos}
                    NombreElemento="Reportes de Pagos"
                    onClick={closeMenu}
                  />
                  <ElementoSideBar
                    to="/administrativo/calendario"
                    Icono={LogoCalendario}
                    NombreElemento="Calendario"
                    onClick={closeMenu}
                  />
                  <ElementoSideBar
                    to="/administrativo/email"
                    Icono={LogoEmail}
                    NombreElemento="Email"
                    onClick={closeMenu}
                  />
                  <ElementoSideBar
                    to="/administrativo/asesores"
                    Icono={LogoAlumnos}
                    NombreElemento="Asesores"
                    onClick={closeMenu}
                  />
                  {/* Nueva opción: Finanzas */}
                  <ElementoSideBar
                    to="/administrativo/finanzas"
                    Icono={LogoFinanzas}
                    NombreElemento="Finanzas"
                    onClick={closeMenu}
                  />
                </div>
                {/* Agrupación de Configuración y Cerrar Sesión en la parte inferior para móvil */}
                <div className="mt-auto pb-4">
                  <ElementoSideBar
                    to="/administrativo/configuracion"
                    Icono={LogoConfig}
                    NombreElemento="Configuración"
                    onClick={closeMenu}
                  />
                  <ElementoSideBar
                    to="/login"
                    Icono={LogoLogOut}
                    NombreElemento="Cerrar Sesión"
                    onClick={closeMenu}
                  />
                </div>
              </ul>
            </nav>
          </aside>
        </>
      )}
    </>
  );
}