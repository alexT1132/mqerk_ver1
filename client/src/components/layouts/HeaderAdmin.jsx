// HeaderAdmin.jsx
import React, { useRef, useEffect, useState } from "react"; 
import { Link, useLocation } from "react-router-dom"; 
import MQerkLogo from "../../assets/MQerK_logo.png";
import { Logos } from "../../pages/public/IndexComp.jsx"; 
import { useAdminContext } from "../../context/AdminContext.jsx";

/**
 * Componente de encabezado de administrador con sistema de notificaciones y avatar de perfil
 * Contiene logo de MQerK, título dinámico de página, menú desplegable de notificaciones y perfil de admin
 * LISTO PARA INTEGRACIÓN CON BACKEND - Usa AdminContext para datos del perfil de administrador
 * 
 * Características:
 * - Títulos dinámicos de página basados en la ruta actual
 * - Notificaciones en tiempo real con contador de no leídas
 * - Avatar de administrador con menú desplegable de perfil (preparado para backend)
 * - Diseño responsivo para móvil y escritorio
 * - Indicador de estado en línea para administrador
 */
export function HeaderAdmin({
  isNotificationsOpen,
  toggleNotifications,
  markAllAsRead, 
  notifications, 
  unreadCount,   
  setIsNotificationsOpen 
}) {
  
  const location = useLocation(); // Hook para obtener la ruta actual
  const { adminProfile } = useAdminContext(); // Obtener perfil de administrador del contexto
  
  // Estado para menú desplegable de perfil
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Mapeo de títulos de rutas para títulos dinámicos de página
  // Usado para mostrar el nombre de la sección actual en el encabezado
  const routeTitles = {
    "/administrativo/bienvenida": "Panel Principal",
    "/administrativo/inicio-admin": "Panel Administrativo", 
    "/administrativo/comprobantes-recibo": "Comprobantes de Pago",
    "/administrativo/lista-alumnos": "Lista de Estudiantes",
    "/administrativo/generar-contrato": "Generar Contrato",
    "/administrativo/reportes-pagos": "Reportes de Pagos", 
    "/administrativo/calendario": "Calendario",
    "/administrativo/email": "Correo Electrónico",
    "/administrativo/configuracion": "Configuración",
    "/login": "Iniciar Sesión",
    // Rutas antiguas para compatibilidad
    "/admin1/dashboard": "Panel Principal",
    "/admin1/inicio-admin": "Panel Administrativo", 
    "/admin1/comprobantes-recibo": "Comprobantes de Pago",
    "/admin1/lista-alumnos": "Lista de Estudiantes",
    "/admin1/validacion-pagos": "Validación de Pagos",
    "/admin1/reportes-pagos": "Reportes de Pagos", 
    "/admin1/calendario": "Calendario",
    "/admin1/email": "Correo Electrónico",
    "/admin1/configuracion": "Configuración",
    // Agregar más rutas según sea necesario
  };

  // Obtener título de sección actual basado en la ruta
  const currentSectionTitle = routeTitles[location.pathname] || ""; 

  // Referencias para detectar clics fuera de los menús desplegables
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  /**
   * Efecto para cerrar menús desplegables al hacer clic fuera
   * Maneja tanto notificaciones como menús desplegables de perfil
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Cerrar menú desplegable de notificaciones si se hace clic fuera
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
      }
      
      // Cerrar menú desplegable de perfil si se hace clic fuera
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIsNotificationsOpen]); 

  /**
   * Alternar visibilidad del menú desplegable de perfil
   */
  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
    // Cerrar notificaciones si están abiertas
    if (isNotificationsOpen) {
      setIsNotificationsOpen(false);
    }
  };

  /**
   * Manejar cierre de sesión de administrador
   * TODO: BACKEND - Implementar endpoint real de cierre de sesión
   */
  const handleLogout = async () => {
    try {
      // TODO: BACKEND - Llamar endpoint de cierre de sesión
      // await fetch('/api/admin/logout', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      //     'Content-Type': 'application/json'
      //   }
      // });
      
      // Limpiar almacenamiento local
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminProfile');
      
      // Redirigir al login
      window.location.href = '/login';
    } catch (error) {
      console.error('Error de cierre de sesión:', error);
    }
  };

  // Filtrar notificaciones no leídas para mostrar en el menú desplegable
  const displayedNotifications = notifications.filter(notif => !notif.isRead);

  /**
   * Obtener iniciales del administrador para avatar de respaldo
   * @param {string} name - Nombre completo del administrador
   * @returns {string} - Primeras letras del primer y último nombre
   */
  const getInitials = (name) => {
    if (!name) return 'AD';
    const names = name.split(' ');
    return names.length >= 2 
      ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="relative flex items-center justify-between z-50 bg-gradient-to-r from-[#3d18c3] to-[#4816bf] sticky top-0 left-0 w-full px-3 sm:px-6 py-4">
      {/* Contenedor del Logo */}
      <div className="flex items-center justify-start h-full w-fit z-10 pl-2">
        <Link to={`/admin1/dashboard`} className="flex items-center justify-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
            <Logos src={MQerkLogo} />
          </div>
        </Link>
      </div>

      <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col justify-center items-center px-8 md:px-12 lg:px-16 w-auto max-w-4xl">
        
        {/* Títulos para PC */}
        <div className="hidden sm:flex flex-col items-center">
          <h1 className="text-center text-lg md:text-xl lg:text-2xl text-white font-extrabold mb-1 whitespace-nowrap tracking-wide">
            Asesores Especializados en Educación de Ciencia y Tecnología
          </h1>
          {currentSectionTitle && (
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
          {currentSectionTitle && ( 
            <p className="text-center text-xs text-white font-medium opacity-70 mt-1 whitespace-nowrap uppercase tracking-wider">
              {currentSectionTitle}
            </p>
          )}
        </div>
      </div>

      {/* Contenedor de los iconos de notificación y perfil */}
      <div className="flex items-center justify-end gap-3 sm:gap-4 h-full w-fit z-10">
        {/* Icono de Notificación con Alternador */}
        <div
          className="relative flex items-center justify-center"
          ref={notificationRef}
        >
          <button
            className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 text-white hover:scale-110 hover:bg-purple-600 hover:bg-opacity-30 rounded-full transition-all duration-200 relative group"
            onClick={toggleNotifications}
            aria-label="Ver notificaciones"
          >
            {/* Icono de campana (notificaciones) con efecto de pulso al hacer hover */}
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
            {/* Indicador de cantidad de notificaciones - solo se muestra si hay notificaciones no leídas */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Contenedor de Menú Desplegable de Notificaciones (se muestra condicionalmente) */}
          {isNotificationsOpen && (
            <div className="absolute top-full mt-2 w-80 bg-white/50 border border-gray-200/50 rounded-lg shadow-xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200 backdrop-blur-xl
                              max-sm:left-1/2 max-sm:-translate-x-1/2 max-sm:w-[calc(100vw-32px)] sm:right-0 sm:max-w-xs">
              {/* Dropdown header */}
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

              {/* Mark as read button */}
              {unreadCount > 0 && (
                <div className="px-4 py-2 bg-gray-50/50 border-b border-gray-200/50">
                  <button
                    onClick={markAllAsRead} 
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-150"
                  >
                    {/* Double check icon WhatsApp style */}
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
                    Marcar como leído
                  </button>
                </div>
              )}

              {/* Notifications list */}
              <div className="max-h-64 overflow-y-auto">
                {/* Show only unread notifications */}
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
                    <p className="text-gray-500 text-xs">No hay notificaciones pendientes</p>
                  </div>
                )}
              </div>

              {/* Dropdown footer */}
              <div className="px-4 py-2 bg-gray-50/50 border-t border-gray-200/50">
                <button className="text-xs text-gray-600 hover:text-gray-800 transition-colors duration-150">
                  Ver todas las notificaciones
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Avatar with Dropdown */}
        <div className="relative flex items-center justify-center" ref={profileRef}>
          <button
            onClick={toggleProfile}
            className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-white shadow-lg bg-gradient-to-b from-orange-300 to-orange-400 hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            aria-label="Menú de perfil del administrador"
          >
            {adminProfile?.avatar ? (
              // Real admin photo from backend
              <img
                src={adminProfile.avatar}
                alt={`${adminProfile.name} avatar`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to initials if image fails to load
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            
            {/* Fallback: Admin initials or default avatar */}
            <div 
              className={`w-full h-full flex items-center justify-center bg-gradient-to-b from-blue-500 to-blue-600 text-white font-bold text-sm sm:text-base ${adminProfile?.avatar ? 'hidden' : 'flex'}`}
              style={{ display: adminProfile?.avatar ? 'none' : 'flex' }}
            >
              {adminProfile ? getInitials(adminProfile.name) : 'AD'}
            </div>
          </button>
          
          {/* Online status indicator */}
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute top-full mt-2 w-64 bg-white/95 border border-gray-200/50 rounded-lg shadow-xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200 backdrop-blur-xl
                            max-sm:left-1/2 max-sm:-translate-x-1/2 max-sm:w-[calc(100vw-32px)] sm:right-0">
              
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-blue-600/50 to-blue-800/50 text-white px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/50 bg-gradient-to-b from-blue-500 to-blue-600 flex items-center justify-center">
                    {adminProfile?.avatar ? (
                      <img
                        src={adminProfile.avatar}
                        alt={`${adminProfile.name} avatar`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-full h-full flex items-center justify-center text-white font-bold text-sm ${adminProfile?.avatar ? 'hidden' : 'flex'}`}
                      style={{ display: adminProfile?.avatar ? 'none' : 'flex' }}
                    >
                      {adminProfile ? getInitials(adminProfile.name) : 'AD'}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{adminProfile?.name || 'Administrator'}</h3>
                    <p className="text-xs text-blue-100">{adminProfile?.role || 'Admin'}</p>
                  </div>
                </div>
              </div>

              {/* Profile Menu Items */}
              <div className="py-2">
                {/* Profile Settings */}
                <Link
                  to="/administrativo/configuracion?section=perfil"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50/50 transition-colors duration-150"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Configuración de Perfil
                </Link>

                {/* Account Settings */}
                <Link
                  to="/administrativo/configuracion?section=general"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50/50 transition-colors duration-150"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Configuración de Cuenta
                </Link>

                {/* Divider */}
                <div className="border-t border-gray-200/50 my-2"></div>

                {/* Admin Info */}
                <div className="px-4 py-2">
                  <div className="text-xs text-gray-500 mb-1">Correo Electrónico</div>
                  <div className="text-sm text-gray-700">{adminProfile?.email || 'admin@mqerk.academy'}</div>
                </div>

                <div className="px-4 py-2">
                  <div className="text-xs text-gray-500 mb-1">Último Acceso</div>
                  <div className="text-sm text-gray-700">
                    {adminProfile?.lastLogin 
                      ? new Date(adminProfile.lastLogin).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Hoy'
                    }
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200/50 my-2"></div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50/50 transition-colors duration-150 w-full text-left"
                >
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}