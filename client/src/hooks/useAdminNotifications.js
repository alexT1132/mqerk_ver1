// src\hooks\useAdminNotifications.js
import { useState, useEffect, useRef } from 'react';
import { getAdminDashboardMetricsRequest } from '../api/usuarios.js';

/**
 * Hook personalizado para manejar notificaciones administrativas
 * Gestiona notificaciones específicas del panel de administración
 */
export function useAdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const pollingRef = useRef(null);

  // Poll admin metrics to drive pending payments notification badge
  useEffect(() => {
    let isMounted = true;

    const fetchMetrics = async () => {
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
          // Update message if count changed
          if (hasSynthetic) {
            return prev.map(n => n._synthetic === 'pending_summary' ? { ...n, message: `Tienes ${pend} pagos pendientes por revisar`, isRead: false, timestamp: new Date() } : n);
          }
          return prev;
        });
      } catch (error) {
        if (!isMounted) return;
        // On error, keep last known values; no throw
        // console.error('Error fetching admin metrics:', error);
      }
    };

    // initial fetch
    fetchMetrics();
    // start polling every 60s
    pollingRef.current = setInterval(fetchMetrics, 60000);

    return () => {
      isMounted = false;
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

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

  // Calculamos el número de notificaciones no leídas; ensure at least pendingCount shows as badge
  const unreadCountFromList = notifications.filter(notif => !notif.isRead).length;
  const unreadCount = pendingCount > 0 ? pendingCount : unreadCountFromList;

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