// src/components/Header_Alumno_comp.jsx
import React, { useRef, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import MQerkLogo from "../../assets/MQerK_logo.png";
import { Logos } from "../IndexComp"; // Asegúrate de que la ruta a IndexComp.jsx sea correcta
import { useStudent } from "../../context/StudentContext";
import { buildStaticUrl, getApiOrigin } from "../../utils/url";
import { useStudentNotifications } from "../../context/StudentNotificationContext";
import { useAuth } from "../../context/AuthContext";

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
  onLogout: propOnLogout = null,
  // Nuevo: cuando true, oculta opciones de navegación (en ausencia de sidebar)
  disableNavOptions = false
}) {
  // Usar contextos
  const { studentData, isVerified, hasContentAccess, wsStatus, headerPrefs } = useStudent();
  const { 
    notifications, 
    unreadCount, 
    markAllAsRead, 
    markAsRead,
    getNotificationIcon,
    getPriorityColor
  } = useStudentNotifications();
  const notificationRef = useRef(null);

  const { alumno, logout } = useAuth();

  // Construir URL absoluto para archivos estticos del backend (evitar IPs fijas)
  const apiOrigin = getApiOrigin();


  // Estados locales del componente
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // Determinar datos finales usando contexto con fallbacks
  const finalStudentData = studentData || { name: "Estudiante", matricula: "0000", email: "estudiante@mqerk.com" };
  const finalProfileImage = propProfileImage; // Imagen desde props tiene prioridad
  // Mostrar en línea cuando el WS del estudiante está abierto; props pueden forzar apagado si es necesario
  const finalIsOnline = propIsOnline && (wsStatus === 'open');

  // Función para alternar dropdown de notificaciones
  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  // (Search removed)

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

  // Debug: loggear la URL final del avatar en desarrollo
  useEffect(() => {
    try {
      // Vite: import.meta.env.DEV
      if (import.meta && import.meta.env && import.meta.env.DEV) {
        const finalPhoto = buildStaticUrl(alumno?.foto);
        console.debug('[Header alumno] foto raw:', alumno?.foto, ' -> url:', finalPhoto);
      }
    } catch (_) {
      // ignore
    }
  }, [alumno?.foto]);

  // Si cambia la ruta de la foto, reintenta mostrarla reseteando el estado de error
  useEffect(() => {
    setAvatarError(false);
  }, [alumno?.foto]);

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
              <Link
                onClick={() => logout()}
                to='/login'
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium text-sm shadow-sm hover:shadow-md"
              >
                Cerrar sesión
              </Link>
            </div>
          </div>
        </div>
      )}

  <header className="fixed top-0 left-0 right-0 flex items-center justify-between z-50 bg-gradient-to-r from-[#3d18c3] to-[#4816bf] w-full px-4 sm:px-6 py-4 shadow-md">
        {/* Contenedor del Logo */}
        <div className="flex items-center justify-start h-full w-fit z-10">
          <Link to={`/`} className="flex items-center justify-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
              <Logos src={MQerkLogo} />
            </div>
          </Link>
        </div>

      {/* Centro configurable: atajos rápidos u nombre de la academia */}
      <div className="hidden sm:flex flex-1 justify-center mx-6 lg:mx-8">
        {!disableNavOptions && headerPrefs?.showQuickLinks ? (
          <nav className="flex items-center gap-2 sm:gap-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-full px-2 py-1.5">
            {(headerPrefs?.links || ['cursos','calendario','pagos']).map((key) => {
              if (key === 'cursos') return (
                <Link key="cursos" to="/alumno/cursos" className="flex items-center gap-2 px-3 py-1.5 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium" title="Ir a mis cursos">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v15H6.5A2.5 2.5 0 0 0 4 19.5V4.5A2.5 2.5 0 0 1 6.5 2z"/></svg>
                  <span>Cursos</span>
                </Link>
              );
              if (key === 'calendario') return (
                <Link key="calendario" to="/alumno/calendario" className="flex items-center gap-2 px-3 py-1.5 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium" title="Ver calendario">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <span>Calendario</span>
                </Link>
              );
              if (key === 'pagos') return (
                <Link key="pagos" to="/alumno/mis-pagos" className="flex items-center gap-2 px-3 py-1.5 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium" title="Ir a mis pagos">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M21 7H3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 13H8"/><path d="M16 11H8"/><path d="M7 7V4"/><path d="M17 7V4"/></svg>
                  <span>Mis pagos</span>
                </Link>
              );
              return null;
            })}
          </nav>
  ) : (
          <div className="flex items-center text-white/95 select-none">
            <span className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-wide drop-shadow-sm">MQERKACADEMY</span>
          </div>
        )}
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

        {/* Icono de Notificación y Perfil: SIEMPRE visibles; solo se ocultan los quick links al centro */}
          <>
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
                <div className="fixed top-14 right-2 left-auto w-[50vw] max-w-[92vw] bg-white/60 border border-gray-200/60 rounded-lg shadow-xl z-[100] overflow-hidden backdrop-blur-xl
                                sm:absolute sm:top-full sm:mt-2 sm:right-0 sm:left-auto sm:w-80 sm:max-w-xs">
                  {/* Header del dropdown */}
                  <div className="bg-gradient-to-r from-purple-600/60 to-purple-800/60 text-white px-3 py-1.5 sm:px-4 sm:py-3">
                    <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base sm:text-lg">Notificaciones</h3>
                      {unreadCount > 0 && (
            <span className="bg-purple-500/60 text-white px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium">
                          {unreadCount} nuevas
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Botón de marcar como leídas */}
                  {unreadCount > 0 && (
                    <div className="hidden sm:block px-4 py-2 bg-gray-50/60 border-b border-gray-200/60">
                      <button
                        onClick={markAllAsRead}
            className="flex items-center gap-2 text-[12px] sm:text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-150"
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
                  <div className="max-h-[30vh] sm:max-h-64 overflow-y-auto">
                    {displayedNotifications.length > 0 ? (
                      <ul className="py-1">
                        {displayedNotifications.map((notification) => {
                          const unread = !notification.is_read;
                          return (
                            <li
                              key={notification.id || notification._runtimeKey}
                              onClick={() => { if(unread && notification.id) { try { markAsRead(notification.id); } catch(_){} } }}
                              className={`relative px-3 py-1.5 text-[13px] sm:text-sm transition-colors duration-150 border-l-4 cursor-pointer group
                                ${unread ? 'bg-gradient-to-r from-purple-50 to-transparent hover:from-purple-100 hover:bg-purple-50' : 'hover:bg-gray-100/60'}
                                ${unread ? 'border-purple-500' : 'border-gray-300'}`}
                            >
                              {unread && (
                                <span className="absolute top-2 right-3 w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                              )}
                              <div className="flex items-start gap-3">
                                <div className={`text-base sm:text-lg mt-0.5 flex-shrink-0 ${unread ? 'text-purple-600' : ''}`}>
                                  {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <p className={`truncate text-xs sm:text-sm ${unread ? 'font-semibold text-gray-900' : 'font-medium'} ${getPriorityColor(notification.priority)}`}>
                                      {notification.title}
                                    </p>
                                    {notification.priority === 'urgent' && (
                                      <span className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0"></span>
                                    )}
                                  </div>
                                  <p className={`text-[11px] sm:text-xs leading-relaxed ${unread ? 'text-gray-700' : 'text-gray-600'}`}>
                                    {notification.message}
                                  </p>
                                  <div className="flex items-center justify-between mt-2">
                                    <span className={`text-[10px] uppercase tracking-wide ${unread ? 'text-purple-500 font-semibold' : 'text-gray-400'}`}>
                                      {formatTimeAgo(notification.timestamp)}
                                    </span>
                                    {unread && notification.id && (
                                      <button
                                        onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }}
                                        className="text-[10px] text-purple-600 hover:text-purple-800 font-medium"
                                      >Marcar leído</button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <div className="px-3 py-6 sm:px-4 sm:py-8 text-center bg-gray-100/60">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-400">
                          <svg fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                        </div>
                        <p className="text-gray-600 text-[13px] sm:text-sm font-medium">¡Todo al día!</p>
                        <p className="text-gray-500 text-[11px] sm:text-xs">No tienes notificaciones pendientes</p>
                      </div>
                    )}
                  </div>

                  {/* Footer del dropdown */}
                  <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-50/60 border-t border-gray-200/60">
                    <button className="text-[11px] sm:text-xs text-gray-600 hover:text-gray-800 transition-colors duration-150">
                      Ver todas las notificaciones
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Icono de Perfil - PREPARADO PARA BACKEND */}
            <div className="relative flex items-center justify-center">
              <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full overflow-hidden border-1 sm:border-2 border-white shadow-md sm:shadow-lg hover:scale-105 transition-transform duration-200 cursor-pointer">
                {(() => {
                  const finalPhoto = buildStaticUrl(alumno?.foto);
                  const showImage = !!finalPhoto && !avatarError;
                  if (showImage) {
                    return (
                      <img
                        src={finalPhoto}
                        className="w-full h-full object-cover object-center"
                        onError={() => setAvatarError(true)}
                        loading="eager"
                        decoding="async"
                        width={80}
                        height={80}
                        alt="Foto de perfil"
                      />
                    );
                  }
                  return (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-bold text-xs sm:text-sm lg:text-base select-none">
                        {getInitials(alumno?.nombre)}
                      </span>
                    </div>
                  );
                })()}
              </div>
              
              {/* BACKEND: Indicador de estado online/offline */}
              <div className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 sm:w-2 sm:h-2 lg:w-2.5 lg:h-2.5 ${finalIsOnline ? 'bg-green-400' : 'bg-gray-400'} border-1 border-white rounded-full ${finalIsOnline ? 'animate-pulse' : ''}`}></div>
            </div>
          </>
      </div>
    </header>
    </>
  );
}