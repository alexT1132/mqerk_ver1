import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from '../api/axios.js';
import { useAuth } from './AuthContext.jsx';

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
  const unreadCount = notifications.filter(n => !n.is_read).length;
  const unreadNotifications = notifications.filter(n => !n.is_read);
  const readNotifications = notifications.filter(n => n.is_read);

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
      const res = await axios.get('/student/notifications');
      const rows = res.data?.data || [];
      setNotifications(rows.map(r => ({ ...r, timestamp: new Date(r.created_at) })));
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    } finally { setIsLoading(false); }
  };

  // TODO: BACKEND - Marcar notificación como leída
  const markAsRead = async (notificationId) => {
    try { await axios.put(`/student/notifications/${notificationId}/read`); setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read:1 } : n)); } catch(e){ console.error('markAsRead', e); }
  };

  // TODO: BACKEND - Marcar notificación como no leída
  const markAsUnread = async (notificationId) => {
    try { await axios.put(`/student/notifications/${notificationId}/unread`); setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read:0 } : n)); } catch(e){ console.error('markAsUnread', e); }
  };

  // Marcar todas las notificaciones como leídas
  const markAllAsRead = async () => { try { await axios.put('/student/notifications/mark-all-read'); setNotifications(prev => prev.map(n => ({ ...n, is_read:1 }))); } catch(e){ console.error('markAllAsRead', e); } };

  // TODO: BACKEND - Eliminar notificación
  const deleteNotification = async (notificationId) => { try { await axios.delete(`/student/notifications/${notificationId}`); setNotifications(prev => prev.filter(n => n.id !== notificationId)); } catch(e){ console.error('deleteNotification', e); } };

  // Eliminar todas las notificaciones leídas
  const deleteAllRead = async () => { try { await axios.delete('/student/notifications/delete-read'); setNotifications(prev => prev.filter(n => !n.is_read)); } catch(e){ console.error('deleteAllRead', e); } };

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
  const { isAuthenticated, user } = useAuth();
  const pollRef = useRef(null);
  const wsRef = useRef(null);
  useEffect(() => {
    // Si NO está autenticado como estudiante: asegurar limpieza (importante para evitar 401 tras logout)
    if(!(isAuthenticated && user?.role === 'estudiante')){
      if(pollRef.current){ clearInterval(pollRef.current); pollRef.current = null; }
      if(wsRef.current && wsRef.current.readyState === 1){ try { wsRef.current.close(); } catch(_){} }
      return; // no configuramos nada
    }

    // Autenticado estudiante: cargar y comenzar polling
    loadNotifications();
    pollRef.current = setInterval(() => loadNotifications(), 60000);

    // Construir URL WS a partir del baseURL de axios para no usar el puerto de Vite (5173)
    let wsUrl;
    try {
      const base = new URL(axios.defaults.baseURL); // ej: http://localhost:1002/api
      const proto = base.protocol === 'https:' ? 'wss:' : 'ws:'; // CORRECTO: http -> ws, https -> wss
      wsUrl = `${proto}//${base.host}/ws/notifications`;
    } catch(_e){
      const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
      wsUrl = `${proto}://${window.location.hostname}:1002/ws/notifications`;
    }

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      ws.onopen = () => setIsConnected(true);
      ws.onclose = () => setIsConnected(false);
      ws.onerror = () => {};
      ws.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data);
          if(data.type === 'notification' && data.payload){
            const base = data.payload;
            const temp = {
              id: `temp-${Date.now()}`,
              type: base.kind === 'grade' ? 'grade' : base.kind === 'assignment' ? 'assignment' : 'system',
              title: base.kind === 'grade' ? 'Nueva calificación' : base.title || 'Notificación',
              message: base.kind === 'grade' ? `Calificación: ${base.calificacion}` : (base.message || ''),
              action_url: '/alumno/actividades',
              is_read: 0,
              timestamp: new Date()
            };
            setNotifications(prev => [temp, ...prev]);
          }
        } catch {}
      };
    } catch(_err) {}

    return () => {
      if(pollRef.current){ clearInterval(pollRef.current); pollRef.current = null; }
      if(wsRef.current && wsRef.current.readyState === 1){ try { wsRef.current.close(); } catch(_){} }
    };
  }, [isAuthenticated, user]);

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