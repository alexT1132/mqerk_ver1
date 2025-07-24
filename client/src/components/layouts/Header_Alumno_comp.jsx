// src/components/Header_Alumno_comp.jsx
import React, { useRef, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import MQerkLogo from "../../assets/MQerK_logo.png";
import { Logos } from "../IndexComp"; // Asegúrate de que la ruta a IndexComp.jsx sea correcta

/**
 * Componente del encabezado de la aplicación para Alumnos.
 * Contiene el logo, la barra de búsqueda y los iconos de notificación y perfil.
 * Recibe el estado y las funciones de notificación como props desde Layout.
 */
export function Header_Alumno_comp({
  isNotificationsOpen,
  toggleNotifications,
  markAllAsRead,
  notifications,
  unreadCount,
  setIsNotificationsOpen
}) {
  const notificationRef = useRef(null);

  // Estados para la funcionalidad de búsqueda
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Función para manejar la búsqueda - Lista para conectar con backend
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Búsqueda:", searchQuery);
      // TODO: Conectar con API de búsqueda
      // searchAPI(searchQuery);
      // navigate(`/buscar?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Función para manejar cambios en el input
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    // TODO: Implementar búsqueda en tiempo real si se desea
    // debounceSearch(e.target.value);
  };

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

  const displayedNotifications = notifications.filter(notif => !notif.isRead);

  return (
    <header className="relative flex items-center justify-between z-50 bg-gradient-to-r from-[#3d18c3] to-[#4816bf] sticky top-0 left-0 w-full px-4 sm:px-6 py-4">
      {/* Estilos CSS personalizados */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-spin-slow {
            animation: spin-slow 3s linear infinite;
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-4px); }
          }
          .animate-float {
            animation: float 2s ease-in-out infinite;
          }
        `
      }} />
      {/* Contenedor del Logo */}
      <div className="flex items-center justify-start h-full w-fit z-10">
        <Link to={`/`} className="flex items-center justify-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
            <Logos src={MQerkLogo} />
          </div>
        </Link>
      </div>

      {/* Barra de búsqueda central */}
      {/* Ajustado mx-4 a ml-6 mr-2 para pantallas pequeñas para moverla más a la derecha */}
      <div className="flex-1 flex justify-center ml-6 mr-2 sm:mx-6 lg:mx-8">
        <form onSubmit={handleSearch} className="relative w-full sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl group">
          {/* Efecto de glow animado de fondo */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-blue-400/20 blur-sm opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-500 animate-pulse pointer-events-none"></div>
          
          {/* Input principal */}
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder={
              window.innerWidth < 640
                ? "Buscar..."
                : window.innerWidth < 1024
                ? "Buscar contenido..."
                : "Comienza la experiencia..."
            }
            className="relative z-10 w-full pl-7 sm:pl-10 pr-4 py-2 sm:py-2.5 lg:py-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/40 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/80 focus:bg-white/10 hover:bg-white/8 hover:border-white/60 transition-all duration-300 text-base sm:text-lg lg:text-xl font-bold placeholder:font-bold font-normal cursor-text placeholder:text-xs sm:placeholder:text-base lg:placeholder:text-lg"
            autoComplete="off"
            spellCheck="false"
          />
          
          {/* Ícono de búsqueda con efecto hover - funciona como botón submit */}
          <button
            type="submit"
            className="absolute z-20 left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-white/80 group-hover:text-white group-focus-within:text-white transition-all duration-300 group-hover:scale-110 hover:text-purple-200 focus:outline-none cursor-pointer"
            aria-label="Buscar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              stroke="currentColor"
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 drop-shadow-sm pointer-events-none"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>

          {/* Partículas flotantes decorativas - solo aparecen cuando hay focus o texto */}
          <div className={`absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full transition-all duration-500 animate-bounce delay-100 pointer-events-none ${(isSearchFocused || searchQuery) ? 'opacity-100' : 'opacity-0'}`}></div>
          <div className={`absolute top-1/2 -left-1 w-1.5 h-1.5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full transition-all duration-500 animate-bounce delay-300 pointer-events-none ${(isSearchFocused || searchQuery) ? 'opacity-100' : 'opacity-0'}`}></div>
          <div className={`absolute -bottom-1 left-1/4 w-1 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-500 animate-bounce delay-500 pointer-events-none ${(isSearchFocused || searchQuery) ? 'opacity-100' : 'opacity-0'}`}></div>

          {/* Línea de progreso animada en el borde - solo cuando hay focus */}
          <div className={`absolute inset-0 rounded-full transition-opacity duration-300 pointer-events-none ${isSearchFocused ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 animate-spin-slow opacity-30 pointer-events-none" style={{
              background: 'conic-gradient(from 0deg, #a855f7, #ec4899, #3b82f6, #a855f7)',
              mask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), white calc(100% - 2px))',
              WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), white calc(100% - 2px))'
            }}></div>
          </div>
        </form>
      </div>

      {/* Contenedor de los iconos de notificación y perfil */}
      <div className="flex items-center justify-end gap-3 sm:gap-4 h-full w-fit z-10">
        {/* Icono de Notificación - MUY COMPACTO */}
        <div
          className="relative flex items-center justify-center"
          ref={notificationRef}
        >
          <button
            className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white hover:scale-105 hover:bg-purple-600 hover:bg-opacity-30 rounded-full transition-all duration-200 relative group"
            onClick={toggleNotifications}
            aria-label="Ver notificaciones"
          >
            {/* SVG del icono de campana - COMPLETO */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="sm:w-5 sm:h-5 lg:w-6 lg:h-6 group-hover:animate-pulse transition-all duration-200"
            >
              <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            {/* Indicador de número - PEQUEÑO */}
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[8px] sm:text-[10px] rounded-full w-3 h-3 sm:w-4 sm:h-4 flex items-center justify-center font-bold animate-bounce">
                {unreadCount > 9 ? '9+' : unreadCount}
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

        {/* Icono de Perfil - MUY COMPACTO */}
        <div className="relative flex items-center justify-center">
          <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full overflow-hidden border-1 sm:border-2 border-white shadow-md sm:shadow-lg bg-gradient-to-b from-orange-300 to-orange-400 hover:scale-105 transition-transform duration-200">
            {/* Avatar ultra compacto */}
            <div className="relative w-full h-full bg-gradient-to-b from-yellow-200 to-yellow-300">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-1.5 sm:w-5 sm:h-2 lg:w-6 lg:h-2.5 bg-gradient-to-b from-orange-600 to-orange-700 rounded-t-full"></div>
              <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 lg:top-2.5 lg:left-2.5 w-0.5 h-0.5 bg-gray-800 rounded-full"></div>
              <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 lg:top-2.5 lg:right-2.5 w-0.5 h-0.5 bg-gray-800 rounded-full"></div>
              <div className="absolute top-2.5 sm:top-3 lg:top-3.5 left-1/2 transform -translate-x-1/2 w-0.5 h-0.5 bg-yellow-400 rounded-full"></div>
              <div className="absolute top-3 sm:top-3.5 lg:top-4 left-1/2 transform -translate-x-1/2 w-1 sm:w-1.5 h-0.5 bg-gray-700 rounded-full"></div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-1.5 sm:w-5 sm:h-2 lg:w-6 lg:h-2.5 bg-gradient-to-b from-gray-600 to-gray-700 rounded-t-lg">
                <div className="absolute top-0.5 left-1/2 transform -translate-x-1/2 w-2.5 h-1 sm:w-3 sm:h-1 lg:w-3.5 lg:h-1.5 bg-white"></div>
                <div className="absolute top-0.5 left-1/2 transform -translate-x-1/2 w-0.5 h-1 sm:w-0.5 sm:h-1 lg:w-0.5 lg:h-1.5 bg-red-600"></div>
              </div>
            </div>
          </div>
          {/* Indicador de estado - PEQUEÑO */}
          <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 sm:w-2 sm:h-2 lg:w-2.5 lg:h-2.5 bg-green-400 border-1 border-white rounded-full animate-pulse"></div>
        </div>
      </div>
    </header>
  );
}