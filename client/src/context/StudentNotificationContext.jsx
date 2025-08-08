import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * CONTEXTO PARA NOTIFICACIONES DEL ESTUDIANTE
 * 
 * Propósito: Manejar todas las notificaciones específicas del estudiante
 * - Notificaciones de pagos
 * - Recordatorios de clases
 * - Nuevos contenidos disponibles
 * - Mensajes del instructor
 * - Actualizaciones de progreso
 * - Alertas del sistema
 * 
 * Responsabilidades:
 * - Lista de notificaciones no leídas/leídas
 * - Contador de notificaciones no leídas
 * - Marcar como leída/no leída
 * - Eliminar notificaciones
 * - Cargar notificaciones desde backend
 * - Suscribirse a notificaciones en tiempo real
 * 
 * Integración con backend:
 * - GET /api/students/{id}/notifications
 * - PUT /api/students/{id}/notifications/{notificationId}/read
 * - DELETE /api/students/{id}/notifications/{notificationId}
 * - WebSocket para notificaciones en tiempo real
 */

const StudentNotificationContext = createContext();

export const useStudentNotifications = () => {
  const context = useContext(StudentNotificationContext);
  if (!context) {
    throw new Error('useStudentNotifications must be used within a StudentNotificationProvider');
  }
  return context;
};

// Tipos de notificaciones disponibles
export const NOTIFICATION_TYPES = {
  PAYMENT: 'payment',
  CLASS_REMINDER: 'class_reminder',
  NEW_CONTENT: 'new_content',
  MESSAGE: 'message',
  PROGRESS: 'progress',
  SYSTEM: 'system',
  ASSIGNMENT: 'assignment',
  GRADE: 'grade'
};

// Prioridades de notificaciones
export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

export const StudentNotificationProvider = ({ children }) => {
  // Estados principales
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false); // Para WebSocket
  const [lastUpdated, setLastUpdated] = useState(null);

  // TODO: BACKEND - Mock data para testing (eliminar cuando se conecte al backend)
  const mockNotifications = [
    {
      id: 'notif-1',
      type: NOTIFICATION_TYPES.PAYMENT,
      priority: NOTIFICATION_PRIORITIES.HIGH,
      title: 'Pago Pendiente',
      message: 'Tu pago mensual vence en 3 días. Realiza tu pago para mantener acceso completo.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
      isRead: false,
      actionUrl: '/dashboard/pagos',
      metadata: {
        amount: '$50.00',
        dueDate: '2024-01-25'
      }
    },
    {
      id: 'notif-2',
      type: NOTIFICATION_TYPES.CLASS_REMINDER,
      priority: NOTIFICATION_PRIORITIES.MEDIUM,
      title: 'Clase de Inglés Mañana',
      message: 'Tienes una clase programada mañana a las 3:00 PM con Prof. María González.',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 horas atrás
      isRead: false,
      actionUrl: '/dashboard/calendario',
      metadata: {
        classTime: '15:00',
        instructor: 'Prof. María González',
        subject: 'Inglés Intermedio'
      }
    },
    {
      id: 'notif-3',
      type: NOTIFICATION_TYPES.NEW_CONTENT,
      priority: NOTIFICATION_PRIORITIES.MEDIUM,
      title: 'Nuevo Contenido Disponible',
      message: 'Se ha agregado un nuevo módulo a tu curso de Matemáticas.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 día atrás
      isRead: true,
      actionUrl: '/dashboard/cursos/matematicas',
      metadata: {
        courseName: 'Matemáticas Avanzadas',
        moduleTitle: 'Cálculo Diferencial'
      }
    },
    {
      id: 'notif-4',
      type: NOTIFICATION_TYPES.MESSAGE,
      priority: NOTIFICATION_PRIORITIES.LOW,
      title: 'Mensaje del Instructor',
      message: 'Prof. Ana López te ha enviado comentarios sobre tu última tarea.',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 días atrás
      isRead: true,
      actionUrl: '/dashboard/mensajes',
      metadata: {
        from: 'Prof. Ana López',
        subject: 'Comentarios Tarea #5'
      }
    },
    {
      id: 'notif-5',
      type: NOTIFICATION_TYPES.SYSTEM,
      priority: NOTIFICATION_PRIORITIES.URGENT,
      title: 'Mantenimiento Programado',
      message: 'El sistema estará en mantenimiento el domingo de 2:00 AM a 6:00 AM.',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 semana atrás
      isRead: false,
      actionUrl: null,
      metadata: {
        maintenanceStart: '2024-01-28 02:00',
        maintenanceEnd: '2024-01-28 06:00'
      }
    }
  ];

  // Computadas
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const unreadNotifications = notifications.filter(n => !n.isRead);
  const readNotifications = notifications.filter(n => n.isRead);

  // Filtros por tipo
  const getNotificationsByType = (type) => {
    return notifications.filter(n => n.type === type);
  };

  // Filtros por prioridad
  const getNotificationsByPriority = (priority) => {
    return notifications.filter(n => n.priority === priority);
  };

  // TODO: BACKEND - Cargar notificaciones desde API
  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      // TODO: Implementar llamada al backend
      // const studentId = getStudentId(); // Obtener desde contexto de autenticación
      // const response = await fetch(`/api/students/${studentId}/notifications`, {
      //   method: 'GET',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
      //     'Content-Type': 'application/json'
      //   }
      // });
      // const data = await response.json();
      // setNotifications(data.notifications);
      // setLastUpdated(new Date());
      
      // MOCK: Solo para testing - comentar/descomentar según necesites
      // console.log('🔔 Cargando notificaciones del estudiante...');
      // setNotifications(mockNotifications);
      // setLastUpdated(new Date());
      
      console.log('🔔 Esperando conexión con backend para cargar notificaciones...');
      
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // TODO: BACKEND - Marcar notificación como leída
  const markAsRead = async (notificationId) => {
    try {
      // TODO: Implementar llamada al backend
      // const studentId = getStudentId();
      // await fetch(`/api/students/${studentId}/notifications/${notificationId}/read`, {
      //   method: 'PUT',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
      //     'Content-Type': 'application/json'
      //   }
      // });
      
      // Actualizar estado local
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      console.log(`✅ Notificación ${notificationId} marcada como leída`);
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
    }
  };

  // TODO: BACKEND - Marcar notificación como no leída
  const markAsUnread = async (notificationId) => {
    try {
      // TODO: Implementar llamada al backend
      // const studentId = getStudentId();
      // await fetch(`/api/students/${studentId}/notifications/${notificationId}/unread`, {
      //   method: 'PUT',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
      //     'Content-Type': 'application/json'
      //   }
      // });
      
      // Actualizar estado local
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: false }
            : notification
        )
      );
      
      console.log(`📬 Notificación ${notificationId} marcada como no leída`);
    } catch (error) {
      console.error('Error al marcar notificación como no leída:', error);
    }
  };

  // Marcar todas las notificaciones como leídas
  const markAllAsRead = async () => {
    try {
      // TODO: Implementar llamada al backend
      // const studentId = getStudentId();
      // await fetch(`/api/students/${studentId}/notifications/mark-all-read`, {
      //   method: 'PUT',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
      //     'Content-Type': 'application/json'
      //   }
      // });
      
      // Actualizar estado local
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      
      console.log('✅ Todas las notificaciones marcadas como leídas');
    } catch (error) {
      console.error('Error al marcar todas las notificaciones como leídas:', error);
    }
  };

  // TODO: BACKEND - Eliminar notificación
  const deleteNotification = async (notificationId) => {
    try {
      // TODO: Implementar llamada al backend
      // const studentId = getStudentId();
      // await fetch(`/api/students/${studentId}/notifications/${notificationId}`, {
      //   method: 'DELETE',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
      //     'Content-Type': 'application/json'
      //   }
      // });
      
      // Actualizar estado local
      setNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );
      
      console.log(`🗑️ Notificación ${notificationId} eliminada`);
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
    }
  };

  // Eliminar todas las notificaciones leídas
  const deleteAllRead = async () => {
    try {
      // TODO: Implementar llamada al backend
      // const studentId = getStudentId();
      // await fetch(`/api/students/${studentId}/notifications/delete-read`, {
      //   method: 'DELETE',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
      //     'Content-Type': 'application/json'
      //   }
      // });
      
      // Actualizar estado local
      setNotifications(prev => prev.filter(notification => !notification.isRead));
      
      console.log('🗑️ Todas las notificaciones leídas eliminadas');
    } catch (error) {
      console.error('Error al eliminar notificaciones leídas:', error);
    }
  };

  // TODO: BACKEND - Configurar WebSocket para notificaciones en tiempo real
  const connectToNotifications = () => {
    try {
      // TODO: Implementar conexión WebSocket
      // const studentId = getStudentId();
      // const ws = new WebSocket(`wss://api.example.com/notifications/${studentId}`);
      
      // ws.onopen = () => {
      //   setIsConnected(true);
      //   console.log('🔌 Conectado a notificaciones en tiempo real');
      // };
      
      // ws.onmessage = (event) => {
      //   const newNotification = JSON.parse(event.data);
      //   setNotifications(prev => [newNotification, ...prev]);
      // };
      
      // ws.onclose = () => {
      //   setIsConnected(false);
      //   console.log('🔌 Desconectado de notificaciones en tiempo real');
      // };
      
      // ws.onerror = (error) => {
      //   console.error('Error en WebSocket de notificaciones:', error);
      // };
      
      // return ws;
      
      // Mock para testing
      console.log('🔌 Mock: Conectado a notificaciones en tiempo real');
      setIsConnected(true);
      
    } catch (error) {
      console.error('Error al conectar WebSocket:', error);
    }
  };

  // Añadir nueva notificación (para testing y WebSocket)
  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date(),
      isRead: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  // Obtener icono para tipo de notificación
  const getNotificationIcon = (type) => {
    const icons = {
      [NOTIFICATION_TYPES.PAYMENT]: '💳',
      [NOTIFICATION_TYPES.CLASS_REMINDER]: '📅',
      [NOTIFICATION_TYPES.NEW_CONTENT]: '📚',
      [NOTIFICATION_TYPES.MESSAGE]: '💬',
      [NOTIFICATION_TYPES.PROGRESS]: '📊',
      [NOTIFICATION_TYPES.SYSTEM]: '⚙️',
      [NOTIFICATION_TYPES.ASSIGNMENT]: '📝',
      [NOTIFICATION_TYPES.GRADE]: '🎯'
    };
    return icons[type] || '🔔';
  };

  // Obtener color para prioridad
  const getPriorityColor = (priority) => {
    const colors = {
      [NOTIFICATION_PRIORITIES.LOW]: 'text-gray-500',
      [NOTIFICATION_PRIORITIES.MEDIUM]: 'text-blue-500',
      [NOTIFICATION_PRIORITIES.HIGH]: 'text-orange-500',
      [NOTIFICATION_PRIORITIES.URGENT]: 'text-red-500'
    };
    return colors[priority] || 'text-gray-500';
  };

  // Cargar notificaciones al inicializar
  useEffect(() => {
    loadNotifications();
    
    // Configurar WebSocket
    const ws = connectToNotifications();
    
    // Cleanup
    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  // Función para cargar datos mock (solo para testing)
  const loadMockNotifications = () => {
    console.log('🔔 Cargando datos mock para testing...');
    setNotifications(mockNotifications);
    setLastUpdated(new Date());
  };

  // Función para refrescar notificaciones
  const refreshNotifications = () => {
    loadNotifications();
  };

  // Función para limpiar notificaciones (testing)
  const clearAllNotifications = () => {
    setNotifications([]);
    console.log('🧹 Todas las notificaciones limpiadas');
  };

  const value = {
    // Estados
    notifications,
    unreadCount,
    unreadNotifications,
    readNotifications,
    isLoading,
    isConnected,
    lastUpdated,
    
    // Funciones de lectura
    markAsRead,
    markAsUnread,
    markAllAsRead,
    
    // Funciones de eliminación
    deleteNotification,
    deleteAllRead,
    clearAllNotifications,
    
    // Funciones de filtrado
    getNotificationsByType,
    getNotificationsByPriority,
    
    // Funciones de utilidad
    getNotificationIcon,
    getPriorityColor,
    addNotification,
    refreshNotifications,
    loadMockNotifications, // Solo para testing
    
    // Funciones de carga
    loadNotifications,
    
    // Constantes
    NOTIFICATION_TYPES,
    NOTIFICATION_PRIORITIES
  };

  return (
    <StudentNotificationContext.Provider value={value}>
      {children}
    </StudentNotificationContext.Provider>
  );
};