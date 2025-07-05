// Header.jsx
import React, { useRef, useEffect } from "react"; 
import { Link, useLocation } from "react-router-dom"; // Importamos useLocation
import MQerkLogo from "../assets/MQerK_logo.png";
import { Logos } from "./IndexComp.jsx"; // Asegúrate de que la ruta a IndexComp.jsx sea correcta

/**
 * Componente del encabezado de la aplicación.
 * Contiene el logo, el título central, y los iconos de notificación y perfil.
 * AHORA RECIBE EL ESTADO Y LAS FUNCIONES DE NOTIFICACIÓN COMO PROPS DESDE LAYOUT.
 */
export function Header({
  isNotificationsOpen,
  toggleNotifications,
  markAllAsRead, 
  notifications, 
  unreadCount,   
  setIsNotificationsOpen 
}) {
  
  const location = useLocation(); // Hook para obtener la ruta actual

  // Mapeo de rutas a nombres legibles para mostrar en el header
  // Se usa para obtener el nombre de la sección actual.
  const routeTitles = {
    "/admin1/dashboard": "Dashboard Principal", // Tu pantalla de bienvenida
    "/admin1/inicio-admin": "Dashboard Administrativo",
    "/admin1/comprobantes-recibo": "Comprobantes Recibidos",
    "/admin1/lista-alumnos": "Lista de Alumnos",
    "/admin1/validacion-pagos": "Validación de Pagos",
    "/admin1/reportes-pagos": "Reportes de Pagos",
    "/admin1/calendario": "Calendario",
    "/admin1/email": "Email",
    "/admin1/configuracion": "Configuración",
    "/login": "Iniciar Sesión",
    // Agrega más rutas según sea necesario
  };

  // Obtiene el título de la sección actual basado en la ruta.
  const currentSectionTitle = routeTitles[location.pathname] || ""; 

  // Referencia para detectar clics fuera del contenedor de notificaciones
  const notificationRef = useRef(null);

  // Efecto para cerrar las notificaciones al hacer clic fuera de ellas
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationRef, setIsNotificationsOpen]); 

  // Filtramos las notificaciones no leídas aquí para la visualización del dropdown
  const displayedNotifications = notifications.filter(notif => !notif.isRead);

  return (
    <header className="relative flex items-center justify-between z-50 bg-gradient-to-r from-[#3d18c3] to-[#4816bf] sticky top-0 left-0 w-full px-3 sm:px-6 py-4">
      {/* Contenedor del Logo */}
      <div className="flex items-center justify-start h-full w-fit z-10 pl-2">
        <Link to={`/`} className="flex items-center justify-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
            <Logos src={MQerkLogo} />
          </div>
        </Link>
      </div>

      {/* Bloque de texto central - Centrado absoluto para pantallas pequeñas */}
      <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col justify-center items-center px-8 md:px-12 lg:px-16 w-auto max-w-4xl">
        {/*
          Visibilidad de los títulos controlada por tamaño de pantalla:
          - En PC (sm:block): Título Principal Más Grande, Nombre de Sección Actual (discreto)
          - En Móvil (sm:hidden): MQerK Academy, Nombre de Sección Actual (discreto)
        */}

        {/* Títulos para PC */}
        <div className="hidden sm:flex flex-col items-center">
          <h1 className="text-center text-xl md:text-2xl lg:text-3xl text-white font-extrabold mb-1 whitespace-nowrap tracking-wide">
            Asesores Especializados en la Enseñanza de las Ciencias y Tecnología
          </h1>
          {currentSectionTitle && ( // Solo muestra si hay un título de sección
            <p className="text-center text-sm md:text-base text-white font-medium opacity-80 mt-1 whitespace-nowrap uppercase tracking-wider">
              {currentSectionTitle}
            </p>
          )}
        </div>

        {/* Títulos para Móvil */}
        <div className="sm:hidden flex flex-col items-center">
          <h1 className="text-center text-base text-white font-extrabold mb-1 whitespace-nowrap tracking-wide">
            MQerK Academy
          </h1>
          {currentSectionTitle && ( // Solo muestra si hay un título de sección
            <p className="text-center text-xs text-white font-medium opacity-70 mt-1 whitespace-nowrap uppercase tracking-wider">
              {currentSectionTitle}
            </p>
          )}
        </div>
      </div>

      {/* Contenedor de los iconos de notificación y perfil */}
      <div className="flex items-center justify-end gap-3 sm:gap-4 h-full w-fit z-10">
        {/* Icono de Notificación con Toggle */}
        <div
          className="relative flex items-center justify-center"
          ref={notificationRef}
        >
          <button
            className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 text-white hover:scale-110 hover:bg-purple-600 hover:bg-opacity-30 rounded-full transition-all duration-200 relative group"
            onClick={toggleNotifications}
            aria-label="Ver notificaciones"
          >
            {/* SVG del icono de campana (notificaciones) con efecto de shake en hover */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="28px"
              viewBox="0 -960 960 960"
              width="28px"
              fill="#ffffff"
              className="group-hover:animate-pulse transition-all duration-200"
            >
              <path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z" />
            </svg>
            {/* Indicador de número de notificaciones - solo se muestra si hay notificaciones no leídas */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Contenedor de Notificaciones Desplegable (se muestra condicionalmente) */}
          {isNotificationsOpen && (
            <div className="absolute top-full mt-2 w-80 bg-white/50 border border-gray-200/50 rounded-lg shadow-xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200 backdrop-blur-xl
                              max-sm:left-1/2 max-sm:-translate-x-1/2 max-sm:w-[calc(100vw-32px)] sm:right-0 sm:max-w-xs">
              {/* Header del dropdown */}
              <div className="bg-gradient-to-r from-purple-600/50 to-purple-800/50 text-white px-4 py-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Notificaciones</h3>
                  {unreadCount > 0 && (
                    <span className="bg-purple-500/50 text-white px-2 py-1 rounded-full text-xs font-medium">
                      {unreadCount} nuevas
                    </span>
                  )}
                </div>
              </div>

              {/* Botón de marcar como leídas */}
              {unreadCount > 0 && (
                <div className="px-4 py-2 bg-gray-50/50 border-b border-gray-200/50">
                  <button
                    onClick={markAllAsRead} 
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-150"
                  >
                    {/* Icono de doble check estilo WhatsApp */}
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="text-blue-500"
                    >
                      <path d="M20 6L9 17l-5-5"/>
                      <path d="M21 6L10 17l-1-1" strokeWidth="1.5"/>
                    </svg>
                    Marcar como leídas
                  </button>
                </div>
              )}

              {/* Lista de notificaciones */}
              <div className="max-h-64 overflow-y-auto">
                {/* Mostramos solo las notificaciones no leídas */}
                {displayedNotifications.length > 0 ? (
                  <ul className="py-1">
                    {displayedNotifications.map((notification) => ( 
                      <li 
                        key={notification.id}
                        className="px-4 py-3 text-sm text-gray-800 hover:bg-gray-100/50 transition-colors duration-150 border-l-4 border-l-blue-500 bg-blue-50/50"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-gray-800 font-medium">{notification.message}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-8 text-center bg-gray-100/50">
                    <div className="w-12 h-12 mx-auto mb-3 text-gray-400">
                      <svg fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <p className="text-gray-600 text-sm font-medium">¡Todo al día!</p>
                    <p className="text-gray-500 text-xs">No tienes notificaciones pendientes</p>
                  </div>
                )}
              </div>

              {/* Footer del dropdown */}
              <div className="px-4 py-2 bg-gray-50/50 border-t border-gray-200/50">
                <button className="text-xs text-gray-600 hover:text-gray-800 transition-colors duration-150">
                  Ver todas las notificaciones
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Icono de Perfil de usuario (avatar) */}
        <div className="relative flex items-center justify-center">
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-white shadow-lg bg-gradient-to-b from-orange-300 to-orange-400 hover:scale-105 transition-transform duration-200">
            {/* Dibujo del avatar (simulado con divs y tailwind) */}
            <div className="relative w-full h-full bg-gradient-to-b from-yellow-200 to-yellow-300">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-3 sm:w-10 sm:h-4 bg-gradient-to-b from-orange-600 to-orange-700 rounded-t-full"></div>
              <div className="absolute top-3 left-2.5 sm:top-4 sm:left-3 w-0.5 h-0.5 sm:w-1 sm:h-1 bg-gray-800 rounded-full"></div>
              <div className="absolute top-3 right-2.5 sm:top-4 sm:right-3 w-0.5 h-0.5 sm:w-1 sm:h-1 bg-gray-800 rounded-full"></div>
              <div className="absolute top-4 sm:top-5 left-1/2 transform -translate-x-1/2 w-0.5 h-0.5 sm:w-0.5 sm:h-1 bg-yellow-400 rounded-full"></div>
              <div className="absolute top-5 sm:top-6 left-1/2 transform -translate-x-1/2 w-1.5 sm:w-2 h-0.5 bg-gray-700 rounded-full"></div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-3 sm:w-8 sm:h-4 bg-gradient-to-b from-gray-600 to-gray-700 rounded-t-lg">
                <div className="absolute top-0.5 sm:top-1 left-1/2 transform -translate-x-1/2 w-4 h-2 sm:w-4 sm:h-3 bg-white"></div>
                <div className="absolute top-0.5 sm:top-1 left-1/2 transform -translate-x-1/2 w-0.5 h-2 sm:w-1 sm:h-3 bg-red-600"></div>
              </div>
            </div>
          </div>
          {/* Indicador de estado en línea */}
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
        </div>
      </div>
    </header>
  );
}