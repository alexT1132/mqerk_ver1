// src\hooks\useAdminNotifications.js
import { useState, useEffect, useRef } from 'react';
import { getAdminDashboardMetricsRequest } from '../api/usuarios.js';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Hook personalizado para manejar notificaciones administrativas
 * Gestiona notificaciones específicas del panel de administración
 */
export function useAdminNotifications() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const pollingRef = useRef(null);

  // Poll admin metrics to drive pending payments notification badge
  useEffect(() => {
    let isMounted = true;

    const fetchMetrics = async () => {
      // Evitar llamadas cuando no hay sesión admin
      if (authLoading || !isAuthenticated || user?.role !== 'admin') return;
      try {
        const { data } = await getAdminDashboardMetricsRequest();
        if (!isMounted) return;
        const pend = Number(data?.pagosPendientes || 0);
        setPendingCount(pend);
        // Optionally synthesize a notification entry to show in dropdown
        // We only add a lightweight summary item if there are pendings and none exists
        setNotifications(prev => {
          const hasSynthetic = prev.some(n => n._synthetic === 'pending_summary');
          if (pend > 0 && !hasSynthetic) {
            return [
              {
                id: 'pending-summary',
                _synthetic: 'pending_summary',
                timestamp: new Date(),
                isRead: false,
                priority: 'normal',
                type: 'payment_pending',
                message: `Tienes ${pend} pagos pendientes por revisar`
              },
              ...prev
            ];
          }
          if (pend === 0 && hasSynthetic) {
            return prev.filter(n => n._synthetic !== 'pending_summary');
          }
          // Update message if count changed, but preserve isRead state
          if (hasSynthetic) {
            return prev.map(n => {
              if (n._synthetic === 'pending_summary') {
                // Preserve the existing isRead state when updating the message
                return { ...n, message: `Tienes ${pend} pagos pendientes por revisar`, timestamp: new Date() };
              }
              return n;
            });
          }
          return prev;
        });
      } catch (error) {
        if (!isMounted) return;
        // On error, keep last known values; no throw
        // console.error('Error fetching admin metrics:', error);
      }
    };

    // initial fetch solo si admin
    fetchMetrics();
    // start polling every 60s si admin
    if (!authLoading && isAuthenticated && user?.role === 'admin') {
      pollingRef.current = setInterval(fetchMetrics, 60000);
    }

    // Suscribirse a eventos WS del admin para actualización inmediata
    const wsListener = (e) => {
      const data = e.detail;
      if (!data) return;
      if (data.type === 'new_comprobante') {
        // Actualizar métricas y badge
        fetchMetrics();
        const p = data.payload || {};
        const folioTxt = p.folio != null ? `Folio ${String(p.folio).padStart(4, '0')}` : 'Folio N/D';
        const cursoTxt = p.curso ? String(p.curso).toUpperCase() : 'CURSO';
        const grupoTxt = p.grupo ? String(p.grupo).toUpperCase() : 'GRUPO';
        const alumnoTxt = [p.nombre, p.apellidos].filter(Boolean).join(' ').trim();
        const msg = alumnoTxt
          ? `Nuevo comprobante: ${alumnoTxt} • ${cursoTxt}-${grupoTxt} • ${folioTxt}`
          : `Nuevo comprobante recibido • ${cursoTxt}-${grupoTxt} • ${folioTxt}`;

        // Generar ID único basado en id_estudiante y folio para evitar duplicados
        const uniqueId = `cmp-${p.id_estudiante}-${p.folio || 'unknown'}`;

        // Insertar notificación visible con más contexto, evitando duplicados
        setNotifications(prev => {
          // Verificar si ya existe una notificación con el mismo id_estudiante y folio
          const exists = prev.some(n =>
            n.id === uniqueId ||
            (n.meta?.id_estudiante === p.id_estudiante && n.meta?.folio === p.folio && n.type === 'payment_pending')
          );

          // Si ya existe, no agregar duplicado
          if (exists) {
            return prev;
          }

          // Agregar nueva notificación
          return [
            {
              id: uniqueId,
              timestamp: new Date(),
              isRead: false,
              priority: 'normal',
              type: 'payment_pending',
              message: msg,
              meta: { curso: p.curso, grupo: p.grupo, folio: p.folio, id_estudiante: p.id_estudiante }
            },
            ...prev
          ];
        });
      }
    };
    window.addEventListener('admin-ws-message', wsListener);

    // Chat notification handling - GLOBAL
    let notificationAudio = null;
    let audioUnlocked = false;
    let titleInterval = null;
    let originalTitle = document.title;

    const unlockAudio = () => {
      try {
        if (!notificationAudio) {
          notificationAudio = new Audio('/notification-sound-for-whatsapp.mp3');
        }
        notificationAudio.play().then(() => {
          notificationAudio.pause();
          notificationAudio.currentTime = 0;
          audioUnlocked = true;
        }).catch(() => { });
      } catch (e) { }
    };

    const playNotificationSound = () => {
      try {
        if (!audioUnlocked || !notificationAudio) {
          unlockAudio();
          return;
        }
        notificationAudio.currentTime = 0;
        notificationAudio.play().catch(() => { });
      } catch (e) { }
    };

    const startTitleNotification = (count = 1) => {
      if (titleInterval) return;
      originalTitle = document.title;
      let showingAlert = false;
      titleInterval = setInterval(() => {
        document.title = showingAlert
          ? originalTitle
          : `(${count}) Nuevo${count > 1 ? 's' : ''} mensaje${count > 1 ? 's' : ''}`;
        showingAlert = !showingAlert;
      }, 1000);
    };

    const stopTitleNotification = () => {
      if (titleInterval) {
        clearInterval(titleInterval);
        titleInterval = null;
        document.title = originalTitle;
      }
    };

    // Unlock audio on user interaction
    const handleInteraction = () => {
      unlockAudio();
    };
    unlockAudio();
    document.addEventListener('click', handleInteraction, { once: true });
    document.addEventListener('keydown', handleInteraction, { once: true });

    // Listen for chat messages from students
    const chatListener = (e) => {
      const data = e.detail;
      if (data?.type === 'chat_message' && data.data) {
        const msg = data.data;
        if (msg.sender_role === 'estudiante') {
          // Check if we're in chat route
          const isInChatRoute = window.location.pathname === '/administrativo/chat';

          // Only play sound if NOT in chat route (ChatAdmin component handles it there)
          if (!isInChatRoute) {
            playNotificationSound();
          }

          // Show tab alert if not in chat route or tab is hidden
          if (!isInChatRoute || document.hidden) {
            startTitleNotification(1);
          }
        }
      }
    };
    window.addEventListener('student-ws-message', chatListener);

    // Stop title notification when tab becomes visible
    const visibilityHandler = () => {
      if (!document.hidden) {
        stopTitleNotification();
      }
    };
    document.addEventListener('visibilitychange', visibilityHandler);

    return () => {
      isMounted = false;
      if (pollingRef.current) clearInterval(pollingRef.current);
      window.removeEventListener('admin-ws-message', wsListener);
      window.removeEventListener('student-ws-message', chatListener);
      document.removeEventListener('visibilitychange', visibilityHandler);
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
      stopTitleNotification();
    };
  }, [authLoading, isAuthenticated, user?.role]);

  // Función para alternar el estado del dropdown de notificaciones
  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  // Función para marcar todas las notificaciones como leídas
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  // Función para marcar una notificación específica como leída
  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  // Función para agregar nueva notificación (para futuras integraciones)
  const addNotification = (newNotification) => {
    const notification = {
      id: Date.now(),
      timestamp: new Date(),
      isRead: false,
      priority: "normal",
      ...newNotification
    };
    setNotifications(prev => [notification, ...prev]);
  };

  // Función para eliminar notificación
  const removeNotification = (notificationId) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  // Calculamos el número de notificaciones no leídas
  const unreadCountFromList = notifications.filter(notif => !notif.isRead).length;
  // El badge debe reflejar solo las notificaciones no leídas, no el conteo de pagos pendientes
  const unreadCount = unreadCountFromList;

  // Obtenemos solo las notificaciones no leídas para mostrar en el dropdown
  const unreadNotifications = notifications.filter(notif => !notif.isRead);

  // Función para obtener el ícono según el tipo de notificación
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_student':
        return '👤';
      case 'payment_pending':
        return '💳';
      case 'payment_overdue':
        return '⚠️';
      case 'report_ready':
        return '📊';
      case 'course_completed':
        return '🎓';
      case 'system':
        return '⚙️';
      default:
        return '🔔';
    }
  };

  // Función para obtener el color según la prioridad
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-red-500 bg-red-50';
      case 'normal':
        return 'border-blue-500 bg-blue-50';
      case 'low':
        return 'border-gray-500 bg-gray-50';
      default:
        return 'border-blue-500 bg-blue-50';
    }
  };

  // Función para formatear el tiempo transcurrido
  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - timestamp) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ahora mismo';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `Hace ${diffInDays}d`;
  };

  return {
    notifications,
    unreadNotifications,
    unreadCount,
    pendingCount,
    isNotificationsOpen,
    setIsNotificationsOpen,
    toggleNotifications,
    markAllAsRead,
    markAsRead,
    addNotification,
    removeNotification,
    getNotificationIcon,
    getPriorityColor,
    getTimeAgo
  };
};