// src/components/Header_Alumno_comp.jsx
import React, { useRef, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import MQerkLogo from "../../assets/MQerK_logo.png";
import { Logos } from "../../pages/public/IndexComp.jsx"; // Asegúrate de que la ruta a IndexComp.jsx sea correcta
import { useStudent } from "../../context/StudentContext";
import { useStudentNotifications } from "../../context/StudentNotificationContext";

/**
 * Componente del encabezado de la aplicación para Alumnos.
 * Contiene el logo, la barra de búsqueda y los iconos de notificación y perfil.
 * Ahora usa contextos para obtener datos del estudiante y notificaciones.
 * 
 * FEATURES:
 * - Integración completa con StudentContext para datos del estudiante
 * - Integración completa con StudentNotificationContext para notificaciones
 * - Búsqueda lista para backend
 * - Avatar inteligente con imagen del backend o iniciales
 * - Modal de confirmación para logout
 * - Responsive design con Tailwind
 */
export function Header_Alumno_comp({
  // LEGACY: Props opcionales para compatibilidad (se pueden eliminar gradualmente)
  isNotificationsOpen: legacyIsNotificationsOpen,
  toggleNotifications: legacyToggleNotifications,
  markAllAsRead: legacyMarkAllAsRead,
  notifications: legacyNotifications,
  unreadCount: legacyUnreadCount,
  setIsNotificationsOpen: legacySetIsNotificationsOpen,
  
  // BACKEND: Props adicionales (opcionales, el contexto tiene prioridad)
  profileImage: propProfileImage = null,
  isOnline: propIsOnline = true,
  showLogoutButton = false,
  onLogout: propOnLogout = null
}) {
  // Usar contextos
  const { studentData, isVerified, hasContentAccess } = useStudent();
  const { 
    notifications, 
    unreadCount, 
    markAllAsRead, 
    markAsRead,
    isConnected,
    getNotificationIcon,
    getPriorityColor
  } = useStudentNotifications();
  const notificationRef = useRef(null);

  // Estados locales del componente
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Determinar datos finales usando contexto con fallbacks
  const finalStudentData = studentData || { name: "Estudiante", matricula: "0000", email: "estudiante@mqerk.com" };
  const finalProfileImage = propProfileImage; // Imagen desde props tiene prioridad
  const finalIsOnline = propIsOnline && isConnected; // Combinamos estado de props y contexto

  // Función para alternar dropdown de notificaciones
  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  // Función para manejar la búsqueda - Lista para conectar con backend
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Conectar con API de búsqueda del estudiante
      // searchStudentContent(searchQuery);
      // navigate(`/dashboard/buscar?q=${encodeURIComponent(searchQuery)}`);
      console.log(`🔍 Buscando: ${searchQuery}`);
    }
  };

  // Función para manejar cambios en el input
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    // TODO: Implementar búsqueda en tiempo real si se desea
    // debounceSearch(e.target.value);
  };

  // Función para obtener las iniciales del alumno
  const getInitials = (name) => {
    if (!name) return 'AL';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Función para manejar error en carga de imagen
  const handleImageError = (e) => {
    console.log('Error cargando imagen de perfil, usando avatar de respaldo');
    e.target.style.display = 'none';
    e.target.nextSibling.style.display = 'flex'; // Mostrar avatar de respaldo
  };

  // Función para mostrar modal de logout
  const showLogoutConfirmation = () => {
    setShowLogoutModal(true);
  };

  // Confirmar logout desde el modal
  const confirmLogout = () => {
    setShowLogoutModal(false);
    if (propOnLogout) {
      propOnLogout();
    } else {
      // Fallback si no se proporciona función de logout
      console.log('👋 Cerrando sesión...');
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  // Efecto para manejar clicks fuera del dropdown de notificaciones
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
  }, []);

  // Filtrar notificaciones no leídas para mostrar
  const displayedNotifications = notifications.filter(notif => !notif.isRead);

  // Función para formatear tiempo transcurrido
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Hace un momento';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Hace ${minutes} min`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Hace ${hours}h`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `Hace ${days} día${days > 1 ? 's' : ''}`;
    }
  };

  // Cancelar logout
  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      {/* BACKEND: Modal de confirmación de logout - Sobrio y elegante */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
            {/* Header del modal */}
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5 text-red-600"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16,17 21,12 16,7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Cerrar sesión</h3>
                  <p className="text-sm text-gray-500">Confirma que quieres salir</p>
                </div>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="px-6 py-5">
              <p className="text-gray-700 text-base leading-relaxed">
                ¿Estás seguro de que quieres cerrar sesión? Tendrás que volver a iniciar sesión para acceder a tu cuenta.
              </p>
            </div>

            {/* Botones de acción */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex gap-3 justify-end">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="relative flex items-center justify-between z-50 bg-gradient-to-r from-[#3d18c3] to-[#4816bf] sticky top-0 left-0 w-full px-4 sm:px-6 py-4">
        {/* Contenedor del Logo */}
        <div className="flex items-center justify-start h-full w-fit z-10">
          <Link to={`/`} className="flex items-center justify-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
              <Logos src={MQerkLogo} />
            </div>
          </Link>
        </div>

      {/* Barra de búsqueda central - OCULTA EN MÓVIL */}
      {/* hidden = oculto en móvil, sm:flex = visible desde 640px en adelante */}
      <div className="hidden sm:flex flex-1 justify-center mx-6 lg:mx-8">
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
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 animate-spin opacity-30 pointer-events-none"></div>
          </div>
        </form>
      </div>

      {/* Contenedor de los iconos de notificación y perfil */}
      <div className="flex items-center justify-end gap-3 sm:gap-4 h-full w-fit z-10">
        
        {/* BACKEND: Botón de Salir - Solo visible en pantallas específicas */}
        {showLogoutButton && (
          <button
            onClick={showLogoutConfirmation}
            className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white hover:scale-105 hover:bg-red-600 hover:bg-opacity-30 rounded-full transition-all duration-200 relative group"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            {/* Icono de salir */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 group-hover:animate-pulse transition-all duration-200"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        )}

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
            <div className="absolute top-full mt-2 w-80 bg-white/60 border border-gray-200/60 rounded-lg shadow-xl z-50 overflow-hidden backdrop-blur-xl
                            max-sm:left-1/2 max-sm:-translate-x-1/2 max-sm:w-[calc(100vw-32px)] sm:right-0 sm:max-w-xs">
              {/* Header del dropdown */}
              <div className="bg-gradient-to-r from-purple-600/60 to-purple-800/60 text-white px-4 py-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Notificaciones</h3>
                  {unreadCount > 0 && (
                    <span className="bg-purple-500/60 text-white px-2 py-1 rounded-full text-xs font-medium">
                      {unreadCount} nuevas
                    </span>
                  )}
                </div>
              </div>

              {/* Botón de marcar como leídas */}
              {unreadCount > 0 && (
                <div className="px-4 py-2 bg-gray-50/60 border-b border-gray-200/60">
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
                        className="px-4 py-3 text-sm hover:bg-gray-100/60 transition-colors duration-150 border-l-4"
                        style={{
                          borderLeftColor: notification.priority === 'urgent' ? '#ef4444' : 
                                          notification.priority === 'high' ? '#f97316' : 
                                          notification.priority === 'medium' ? '#3b82f6' : '#6b7280'
                        }}
                      >
                        <div className="flex items-start gap-3">
                          {/* Icono de tipo de notificación */}
                          <div className="text-lg mt-0.5 flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className={`font-medium text-sm truncate ${getPriorityColor(notification.priority)}`}>
                                {notification.title}
                              </p>
                              {/* Indicador de prioridad */}
                              {notification.priority === 'urgent' && (
                                <span className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0"></span>
                              )}
                            </div>
                            <p className="text-gray-600 text-xs leading-relaxed">
                              {notification.message}
                            </p>
                            
                            {/* Tiempo transcurrido */}
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-400">
                                {formatTimeAgo(notification.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-8 text-center bg-gray-100/60">
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
              <div className="px-4 py-2 bg-gray-50/60 border-t border-gray-200/60">
                <button className="text-xs text-gray-600 hover:text-gray-800 transition-colors duration-150">
                  Ver todas las notificaciones
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Icono de Perfil - PREPARADO PARA BACKEND */}
        <div className="relative flex items-center justify-center">
          <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full overflow-hidden border-1 sm:border-2 border-white shadow-md sm:shadow-lg hover:scale-105 transition-transform duration-200 cursor-pointer">
            
            {/* BACKEND: Imagen real del alumno */}
            {finalProfileImage && (
              <img
                src={finalProfileImage}
                alt={`Foto de perfil de ${finalStudentData.name}`}
                className="w-full h-full object-cover object-center"
                onError={handleImageError}
                loading="lazy"
              />
            )}
            
            {/* BACKEND: Avatar de respaldo cuando no hay imagen o falla la carga */}
            <div 
              className={`${finalProfileImage ? 'hidden' : 'flex'} w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center`}
              style={{ display: finalProfileImage ? 'none' : 'flex' }}
            >
              {/* Mostrar iniciales del alumno */}
              <span className="text-white font-bold text-xs sm:text-sm lg:text-base select-none">
                {getInitials(finalStudentData.name)}
              </span>
            </div>
          </div>
          
          {/* BACKEND: Indicador de estado online/offline */}
          <div className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 sm:w-2 sm:h-2 lg:w-2.5 lg:h-2.5 ${finalIsOnline ? 'bg-green-400' : 'bg-gray-400'} border-1 border-white rounded-full ${finalIsOnline ? 'animate-pulse' : ''}`}></div>
        </div>
      </div>

      {/* BACKEND: Modal de confirmación de logout - Sobrio y elegante */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
            {/* Header del modal */}
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5 text-red-600"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16,17 21,12 16,7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Cerrar sesión</h3>
                  <p className="text-sm text-gray-500">Confirma que quieres salir</p>
                </div>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="px-6 py-5">
              <p className="text-gray-700 text-base leading-relaxed">
                ¿Estás seguro de que quieres cerrar sesión? Tendrás que volver a iniciar sesión para acceder a tu cuenta.
              </p>
            </div>

            {/* Botones de acción */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex gap-3 justify-end">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
    </>
  );
}
