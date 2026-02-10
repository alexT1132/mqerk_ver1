// src/components/Topbar.jsx
import { Bell, X, CheckCheck, Trash2, Loader2, LogOut } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getMiPerfil, getNotifications, getUnreadCount, markNotificationRead, markAllNotificationsRead, deleteNotification } from "../../api/asesores.js";
import { buildStaticUrl } from "../../utils/url.js";
import { useAuth } from "../../context/AuthContext.jsx";
import logo from '../../assets/MQerK_logo.png';

export default function Topbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const { logout } = useAuth();
  const notificationsRef = useRef(null);

  // Función para cargar foto de perfil
  const loadPhoto = async () => {
    try {
      const { data } = await getMiPerfil();
      let fotoUrl = null;
      if (data?.data?.perfil?.foto_url) {
        fotoUrl = data.data.perfil.foto_url;
      } else if (data?.data?.perfil?.doc_fotografia) {
        fotoUrl = buildStaticUrl(data.data.perfil.doc_fotografia);
      }
      // ✅ Agregar timestamp para evitar cache
      if (fotoUrl) {
        const separator = fotoUrl.includes('?') ? '&' : '?';
        setPhotoUrl(`${fotoUrl}${separator}t=${Date.now()}`);
      } else {
        setPhotoUrl(null);
      }
    } catch (e) {
      console.error('Error cargando foto de perfil:', e);
      setPhotoUrl(null);
    } finally {
      setLoading(false);
    }
  };

  // Cargar foto de perfil al montar
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!alive) return;
      await loadPhoto();
    })();
    return () => { alive = false; };
  }, []);

  // ✅ Escuchar evento cuando se actualiza la foto en Configuraciones
  useEffect(() => {
    const handlePhotoUpdated = () => {
      loadPhoto();
    };
    window.addEventListener('asesor-photo-updated', handlePhotoUpdated);
    return () => {
      window.removeEventListener('asesor-photo-updated', handlePhotoUpdated);
    };
  }, []);

  // Cargar notificaciones
  const loadNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const [notifsRes, countRes] = await Promise.all([
        getNotifications({ limit: 20 }),
        getUnreadCount()
      ]);
      setNotifications(notifsRes?.data?.data || []);
      setUnreadCount(countRes?.data?.unread_count || 0);
    } catch (e) {
      console.error('Error cargando notificaciones:', e);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Cargar notificaciones cuando se abre el dropdown
  useEffect(() => {
    if (notificationsOpen) {
      loadNotifications();
    }
  }, [notificationsOpen]);

  // Recargar contador de no leídas periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      if (!notificationsOpen) {
        getUnreadCount().then(res => {
          setUnreadCount(res?.data?.unread_count || 0);
        }).catch(() => { });
      }
    }, 30000); // Cada 30 segundos

    return () => clearInterval(interval);
  }, [notificationsOpen]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationsOpen]);

  const handleNotificationClick = async (notif) => {
    // Marcar como leída si no está leída
    if (!notif.is_read) {
      try {
        await markNotificationRead(notif.id);
        setNotifications(prev => prev.map(n =>
          n.id === notif.id ? { ...n, is_read: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (e) {
        console.error('Error marcando notificación como leída:', e);
      }
    }

    // Navegar a la URL de acción si existe
    if (notif.action_url) {
      setNotificationsOpen(false);
      navigate(notif.action_url);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error('Error marcando todas como leídas:', e);
    }
  };

  const handleDeleteNotification = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      // Actualizar contador si era no leída
      const notif = notifications.find(n => n.id === id);
      if (notif && !notif.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (e) {
      console.error('Error eliminando notificación:', e);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (e) {
      console.error('Error al cerrar sesión:', e);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'payment':
        return '💰';
      case 'activity_submission':
        return '📝';
      case 'feedback_submission':
        return '💬';
      case 'simulation_completed':
        return '🎯';
      case 'system':
        return '⚙️';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'payment':
        return 'bg-emerald-100 text-emerald-700';
      case 'activity_submission':
        return 'bg-blue-100 text-blue-700';
      case 'feedback_submission':
        return 'bg-purple-100 text-purple-700';
      case 'simulation_completed':
        return 'bg-indigo-100 text-indigo-700';
      case 'system':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // ✅ Avatar URL - sin imagen hardcodeada

  return (
    <header className="fixed top-0 left-0 right-0 z-50 text-white bg-gradient-to-r from-[#3d18c3] to-[#4816bf] shadow-md supports-[backdrop-filter]:backdrop-blur">
      <div className="w-full flex items-center justify-between px-3 sm:px-4 h-14">
        {/* Izquierda */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Logo (visible siempre, más pequeño en móvil) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <img src={logo} alt="MQerKAcademy" className="w-12 sm:w-16" />
          </div>
        </div>

        {/* Centro: título (oculto en móvil, visible desde sm) */}
        <h1 className="hidden sm:block text-xs sm:text-sm md:text-base font-medium text-center select-none tracking-wide flex-1 px-2">
          Asesores Especializados en la Enseñanza de las Ciencias y Tecnología
        </h1>

        {/* Título móvil más corto */}
        <h1 className="sm:hidden text-[10px] font-medium text-center select-none tracking-tight flex-1 px-1">
          Asesores Especializados
        </h1>

        {/* Derecha */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-5">
          {/* Notificaciones (visible siempre) */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              aria-label="Notificaciones"
              className="relative rounded-full p-1.5 sm:p-2 hover:bg-white/10 transition-colors"
            >
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 inline-flex items-center justify-center h-4 w-4 sm:h-5 sm:w-5 text-[10px] sm:text-xs font-bold text-white bg-red-500 rounded-full ring-2 ring-violet-700">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown de notificaciones */}
            {notificationsOpen && (
              <div className="absolute right-0 top-full mt-2 w-[calc(100vw-1rem)] sm:w-96 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border-2 border-slate-200 overflow-hidden z-50">
                {/* Header */}
                <div className="px-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Notificaciones</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                        title="Marcar todas como leídas"
                      >
                        <CheckCheck className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setNotificationsOpen(false)}
                      className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Lista de notificaciones */}
                <div className="max-h-96 overflow-y-auto">
                  {loadingNotifications ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                      <Bell className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                      <p className="font-medium">No hay notificaciones</p>
                      <p className="text-sm">Las nuevas notificaciones aparecerán aquí</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer ${!notif.is_read ? 'bg-violet-50/50' : ''
                            }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl ${getNotificationColor(notif.type)}`}>
                              {getNotificationIcon(notif.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <h4 className={`text-sm font-semibold ${!notif.is_read ? 'text-slate-900' : 'text-slate-700'}`}>
                                    {notif.title}
                                  </h4>
                                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                                    {notif.message}
                                  </p>
                                  <p className="text-xs text-slate-400 mt-1">
                                    {new Date(notif.created_at).toLocaleString('es-MX', {
                                      day: 'numeric',
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                                <div className="flex items-start gap-1 shrink-0">
                                  {!notif.is_read && (
                                    <span className="w-2 h-2 rounded-full bg-violet-600 shrink-0 mt-1"></span>
                                  )}
                                  <button
                                    onClick={(e) => handleDeleteNotification(e, notif.id)}
                                    className="p-1 rounded-lg hover:bg-slate-200 transition-colors text-slate-400 hover:text-slate-600"
                                    title="Eliminar"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-center">
                    <button
                      onClick={() => navigate('/asesor/configuraciones')}
                      className="text-xs text-violet-600 hover:text-violet-700 font-medium"
                    >
                      Ver todas las notificaciones
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Perfil con foto */}
          <button
            onClick={() => navigate('/asesor/configuraciones')}
            aria-label="Perfil"
            className="relative rounded-full overflow-visible ring-2 ring-white/30 hover:ring-white/50 transition-all hover:scale-105 active:scale-95"
          >
            {loading ? (
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white/10 flex items-center justify-center rounded-full">
                <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
              </div>
            ) : photoUrl ? (
              <>
                <img
                  src={photoUrl}
                  alt="Avatar"
                  key={photoUrl} // ✅ Forzar re-render cuando cambia
                  className="w-8 h-8 sm:w-9 sm:h-9 object-cover rounded-full ring-2 ring-white/30"
                  onError={(e) => {
                    // ✅ Si falla, ocultar y mostrar placeholder
                    e.target.style.display = 'none';
                  }}
                />
                {/* Punto verde de estado en línea - mejorado para que sobresalga más */}
                <span className="absolute -right-0.5 -bottom-0.5 sm:-right-1 sm:-bottom-1 h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-lg z-10" />
              </>
            ) : (
              <>
                {/* ✅ Placeholder sin imagen hardcodeada */}
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white/20 flex items-center justify-center rounded-full ring-2 ring-white/30">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                {/* Punto verde de estado en línea */}
                <span className="absolute -right-0.5 -bottom-0.5 sm:-right-1 sm:-bottom-1 h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-lg z-10" />
              </>
            )}
          </button>

          {/* Botón de Logout */}
          <button
            onClick={handleLogout}
            title="Cerrar Sesión"
            className="flex items-center justify-center p-1.5 sm:p-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white hover:text-red-600 transition-all duration-300 shadow-lg active:scale-95 group"
          >
            <LogOut className="h-4 w-4 sm:h-5 sm:w-5 group-hover:rotate-12 transition-transform" />
            <span className="hidden lg:inline ml-2 text-xs font-bold uppercase tracking-wider">Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
}
