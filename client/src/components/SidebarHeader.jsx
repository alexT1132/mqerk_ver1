import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import MQerkLogo from "../assets/MQerK_logo.png";
import { Logos } from "./IndexComp.jsx";

// Componente para elementos de la barra lateral de escritorio
function ElementoSideBar({ Icono, NombreElemento, to }) {
  return (
    <li className="group flex justify-start items-center h-fit gap-1.5">
      <Link
        to={to}
        className="items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-indigo-100 group"
      >
        {Icono}
      </Link>
      <div className="flex items-center h-fit bg-gray-700 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-md z-10">
        {NombreElemento}
      </div>
    </li>
  );
}

// Componente para elementos de la barra lateral móvil
function ElementoSideBarMobile({ Icono, NombreElemento, to, onClick }) {
  return (
    <li>
      <Link
        to={to}
        onClick={onClick}
        className="flex items-center gap-3 p-3 text-gray-700 rounded-lg hover:bg-indigo-100 hover:text-indigo-600 transition-all duration-200"
      >
        <div className="flex-shrink-0">
          {Icono}
        </div>
        <span className="text-sm font-medium">{NombreElemento}</span>
      </Link>
    </li>
  );
}

export function SidebarHeader({ Seccion }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false); // Estado para el toggle de notificaciones
  const notificationRef = useRef(null); // Referencia al contenedor de las notificaciones

  // Función para alternar el estado del menú móvil
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Función para alternar el estado de las notificaciones
  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  // Cerrar las notificaciones al hacer clic fuera del contenedor
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationRef]);

  // Definiciones de colores y tamaños para los SVG
  const svgColor = '#3818c3';
  const svgColorLogout = '#EA3323';
  const xmlns = "http://www.w3.org/2000/svg";
  const width = '30px';
  const height = '30px';

  // Iconos SVG para el menú
  const LogoInicio = <svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
  const LogoComprobantes = <svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="10" y2="9"></line></svg>;
  const LogoAlumnos = <svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
  const LogoValidacionPagos = <svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><circle cx="10" cy="15" r="3"></circle><path d="M21 15L15 21"></path></svg>;
  const LogoReportesPagos = <svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="10" y2="9"></line></svg>; // Reutilizando el icono de comprobantes
  const LogoCalendario = <svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
  const LogoEmail = <svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
  const LogoConfig = <svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1.51-1V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
  const LogoLogOut = <svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColorLogout} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="17 16 22 12 17 8"></polyline><line x1="22" y1="12" x2="10" y2="12"></line></svg>;

  return (
    <>
      {/* Encabezado Principal */}
      <header className='relative flex items-center justify-between z-50 bg-gradient-to-r from-[#3d18c3] to-[#4816bf] sticky top-0 left-0 w-full px-3 sm:px-6 py-4'>
        {/* Contenedor del Logo */}
        <div className='flex items-center justify-start h-full w-fit z-10 pl-2'>
          <Link to={`/`} className='flex items-center justify-center'>
            <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
              <Logos src={MQerkLogo} />
            </div>
          </Link>
        </div>

        {/* Bloque de texto central - Centrado absoluto para pantallas pequeñas */}
        <div className='absolute left-1/2 transform -translate-x-1/2 flex flex-col justify-center items-center px-4 md:px-0 w-auto'>
          <h1 className='text-center text-base sm:text-xl md:text-2xl text-white font-extrabold mb-1 whitespace-nowrap'>
            ADMIN 1
          </h1>

          <h2 className='hidden sm:block text-center text-sm md:text-lg lg:text-xl text-white font-bold tracking-wide leading-tight whitespace-nowrap'>
            Asesores Especializados en la Enseñanza de las Ciencias y Tecnología
          </h2>

          <h2 className='block sm:hidden text-center text-sm text-white font-bold whitespace-nowrap'>
            MQerK Academy
          </h2>

          {/* Se eliminó la sección 'Seccion' del encabezado */}
        </div>

        {/* Contenedor de los iconos de notificación y perfil */}
        <div className='flex items-center justify-end gap-3 sm:gap-4 h-full w-fit z-10'>
          {/* Icono de Notificación con Toggle */}
          <div className='relative flex items-center justify-center' ref={notificationRef}>
            <button
              className='flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors relative'
              onClick={toggleNotifications}
              aria-label="Ver notificaciones"
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="28px" viewBox="0 -960 960 960" width="28px" fill="#ffffff">
                <path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z" />
              </svg>
              <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold'>
                3
              </span>
            </button>

            {/* Contenedor de Notificaciones Desplegable */}
            {isNotificationsOpen && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden">
                <h3 className="bg-gray-100 text-gray-700 px-4 py-2 font-semibold">Notificaciones</h3>
                <ul className="py-2">
                  <li className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150">
                    Pago de Juan Pérez revisado
                  </li>
                  <li className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150">
                    Pago de María García revisado
                  </li>
                  {/* Agrega más notificaciones aquí */}
                </ul>
              </div>
            )}
          </div>

          <div className='relative flex items-center justify-center'>
            <div className='flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-white shadow-lg bg-gradient-to-b from-orange-300 to-orange-400'>
              <div className='relative w-full h-full bg-gradient-to-b from-yellow-200 to-yellow-300'>
                <div className='absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-3 sm:w-10 sm:h-4 bg-gradient-to-b from-orange-600 to-orange-700 rounded-t-full'></div>
                <div className='absolute top-3 left-2.5 sm:top-4 sm:left-3 w-0.5 h-0.5 sm:w-1 sm:h-1 bg-gray-800 rounded-full'></div>
                <div className='absolute top-3 right-2.5 sm:top-4 sm:right-3 w-0.5 h-0.5 sm:w-1 sm:h-1 bg-gray-800 rounded-full'></div>
                <div className='absolute top-4 sm:top-5 left-1/2 transform -translate-x-1/2 w-0.5 h-0.5 sm:w-0.5 sm:h-1 bg-yellow-400 rounded-full'></div>
                <div className='absolute top-5 sm:top-6 left-1/2 transform -translate-x-1/2 w-1.5 sm:w-2 h-0.5 bg-gray-700 rounded-full'></div>
                <div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-3 sm:w-8 sm:h-4 bg-gradient-to-b from-gray-600 to-gray-700 rounded-t-lg'>
                  <div className='absolute top-0.5 sm:top-1 left-1/2 transform -translate-x-1/2 w-4 h-2 sm:w-4 sm:h-3 bg-white'></div>
                  <div className='absolute top-0.5 sm:top-1 left-1/2 transform -translate-x-1/2 w-0.5 h-2 sm:w-1 sm:h-3 bg-red-600'></div>
                </div>
              </div>
            </div>
            <div className='absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full'></div>
          </div>
        </div>
      </header>

      {/* Botón de Menú Hamburguesa para Móviles (posición fija inferior derecha) */}
      <button
        onClick={toggleMenu}
        className='sm:hidden fixed bottom-4 right-4 z-50 flex items-center justify-center w-12 h-12 text-white bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-lg transition-colors'
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Barra Lateral de Escritorio (oculta en móviles) */}
      <aside className="max-sm:hidden flex flex-col fixed w-[80px] shadow-[4px_0_10px_-2px_rgba(0,0,0,0.3)] z-40" aria-label="Sidebar">
        <nav className="h-dvh bg-gray-50">
          {/* Contenedor principal de los elementos de la barra lateral de escritorio */}
          <ul className="p-4 h-full flex flex-col space-y-2">
            {/* Elementos de navegación principales */}
            <ElementoSideBar to="/admin1/inicio-admin" Icono={LogoInicio} NombreElemento="Inicio" />
            <ElementoSideBar to="/admin1/comprobantes-recibo" Icono={LogoComprobantes} NombreElemento="Comprobantes Recibidos" />
            <ElementoSideBar to="/admin1/lista-alumnos" Icono={LogoAlumnos} NombreElemento="Lista de Alumnos" />
            <ElementoSideBar to="/admin1/validacion-pagos" Icono={LogoValidacionPagos} NombreElemento="Validación de Pagos" />
            <ElementoSideBar to="/admin1/reportes-pagos" Icono={LogoReportesPagos} NombreElemento="Reportes de Pagos" />
            <ElementoSideBar to="/admin1/calendario" Icono={LogoCalendario} NombreElemento="Calendario" />
            <ElementoSideBar to="/admin1/email" Icono={LogoEmail} NombreElemento="Email" />
            {/* Configuración y Cerrar Sesión directamente en la lista, el space-y-2 los agrupará */}
            <ElementoSideBar to="/admin1/configuracion" Icono={LogoConfig} NombreElemento="Configuración" />
            <ElementoSideBar to="/login" Icono={LogoLogOut} NombreElemento="Cerrar Sesión" />
          </ul>
        </nav>
      </aside>

      {/* Menú Móvil (se muestra solo en móviles cuando está abierto) */}
      {isMenuOpen && (
        <>
          {/* Overlay oscuro cuando el menú está abierto */}
          <div className="sm:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleMenu}></div>
          {/* Contenedor del menú lateral móvil */}
          <aside className="sm:hidden fixed top-[64px] left-0 w-64 h-[calc(100vh-64px)] bg-gray-50 shadow-lg z-50 transform transition-transform duration-300 ease-in-out">
            <nav className="h-full">
              {/* Lista de elementos del menú móvil con flexbox para distribución */}
              <ul className="p-4 space-y-2 h-full flex flex-col justify-between overflow-y-auto">
                <div>
                  <ElementoSideBarMobile to="/admin1/inicio-admin" Icono={LogoInicio} NombreElemento="Inicio" onClick={toggleMenu} />
                  <ElementoSideBarMobile to="/admin1/comprobantes-recibo" Icono={LogoComprobantes} NombreElemento="Comprobantes Recibidos" onClick={toggleMenu} />
                  <ElementoSideBarMobile to="/admin1/lista-alumnos" Icono={LogoAlumnos} NombreElemento="Lista de Alumnos" onClick={toggleMenu} />
                  <ElementoSideBarMobile to="/admin1/validacion-pagos" Icono={LogoValidacionPagos} NombreElemento="Validación de Pagos" onClick={toggleMenu} />
                  <ElementoSideBarMobile to="/admin1/reportes-pagos" Icono={LogoReportesPagos} NombreElemento="Reportes de Pagos" onClick={toggleMenu} />
                  <ElementoSideBarMobile to="/admin1/calendario" Icono={LogoCalendario} NombreElemento="Calendario" onClick={toggleMenu} />
                  <ElementoSideBarMobile to="/admin1/email" Icono={LogoEmail} NombreElemento="Email" onClick={toggleMenu} />
                </div>
                {/* Agrupación de Configuración y Cerrar Sesión en la parte inferior */}
                <div className="mt-auto pb-4">
                  <ElementoSideBarMobile to="/admin1/configuracion" Icono={LogoConfig} NombreElemento="Configuración" onClick={toggleMenu} />
                  <ElementoSideBarMobile to="/login" Icono={LogoLogOut} NombreElemento="Cerrar Sesión" onClick={toggleMenu} />
                </div>
              </ul>
            </nav>
          </aside>
        </>
      )}
    </>
  );
}