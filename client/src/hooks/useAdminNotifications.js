// src\hooks\useAdminNotifications.js
import { useState, useEffect } from 'react';

/**
 * Hook personalizado para manejar notificaciones administrativas
 * Gestiona notificaciones específicas del panel de administración
 */
export function useAdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // TODO: Obtener notificaciones reales del backend
  useEffect(() => {
    // Por ahora iniciamos con un array vacío
    // En el futuro, aquí haremos la llamada al backend:
    // const fetchNotifications = async () => {
    //   try {
    //     const response = await fetch('/api/admin/notifications');
    //     const adminNotifications = await response.json();
    //     setNotifications(adminNotifications);
    //   } catch (error) {
    //     console.error('Error fetching notifications:', error);
    //     setNotifications([]);
    //   }
    // };
    // fetchNotifications();

    setNotifications([]);
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

  // Calculamos el número de notificaciones no leídas
  const unreadCount = notifications.filter(notif => !notif.isRead).length;

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