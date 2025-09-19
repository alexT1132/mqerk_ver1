import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from '../api/axios.js';
import { useAuth } from './AuthContext.jsx';
import { resolvePlanType, getActivationDate, generatePaymentSchedule } from '../utils/payments.js';

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
  const [isConnected, setIsConnected] = useState(false); // Estado lógico de conexión (reflejado por StudentContext)
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
      // Normalizar y deduplicar (por id)
      const seen = new Set();
      const norm = [];
      for (const r of rows) {
        if (r.id && seen.has(r.id)) continue;
        if (r.id) seen.add(r.id);
        norm.push({ ...r, timestamp: new Date(r.created_at) });
      }
      setNotifications(prev => {
        // Merge manteniendo existentes con cambios de is_read
        const map = new Map();
        for (const n of prev) map.set(n.id, n);
        for (const n of norm) map.set(n.id, n);
        // Ordenar desc por id (asumiendo autoincrement) o timestamp fallback
        return Array.from(map.values()).sort((a,b) => (b.id||0)-(a.id||0) || b.timestamp - a.timestamp);
      });
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

  // Ya no abrimos un WebSocket propio aquí. Dejamos que StudentContext maneje la conexión
  // y emitimos/recibimos mediante eventos del navegador. Reflejamos isConnected
  // escuchando los eventos de conexión si fuera necesario en el futuro.

  // Integración en tiempo real: escuchar eventos emitidos por StudentContext (event-driven)
  useEffect(() => {
    const handler = (e) => {
      const data = e.detail;
      if(!data) return;
      if (data.type === 'welcome') {
        setIsConnected(true);
      }
      if (data.type === 'notification' && data.payload) {
        const p = data.payload;
        setNotifications(prev => {
          // Deduplicar por notif_id si viene, si no por combinación kind+entrega_id+actividad_id
          const idKey = p.notif_id || `${p.kind}:${p.entrega_id || ''}:${p.actividad_id || ''}`;
          if (prev.some(n => String(n.id) === String(p.notif_id) || n._runtimeKey === idKey)) return prev;
          const instant = {
            id: p.notif_id || undefined,
            _runtimeKey: idKey,
            type: p.kind || p.type || 'general',
            title: p.kind === 'grade' ? 'Calificación publicada' : (p.title || 'Notificación'),
            message: p.kind === 'grade' && p.calificacion !== undefined ? `Tu entrega fue calificada con ${p.calificacion}` : (p.message || ''),
            is_read: 0,
            timestamp: new Date(),
            created_at: new Date().toISOString()
          };
            return [instant, ...prev].slice(0,200); // mantener límite razonable
        });
      }
    };
    window.addEventListener('student-ws-message', handler);
    return () => window.removeEventListener('student-ws-message', handler);
  }, []);

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
  const { isAuthenticated, user, alumno } = useAuth();
  const pollRef = useRef(null);
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

    return () => {
      if(pollRef.current){ clearInterval(pollRef.current); pollRef.current = null; }
    };
  }, [isAuthenticated, user]);

  // Generador automático de notificación de pagos (vencimiento/tolerancia)
  useEffect(() => {
    try {
      if (!(isAuthenticated && user?.role === 'estudiante' && alumno)) return;

      const now = new Date();
      const planType = resolvePlanType(alumno?.plan || alumno?.plan_type);
      const activationDate = getActivationDate(alumno);
      const schedule = generatePaymentSchedule({ startDate: activationDate, planType, now });

      // Siguiente pago no pagado: upcoming (antes del due) o pending (entre due y fin de tolerancia)
      const next = schedule.find(p => p.status === 'upcoming' || p.status === 'pending');
      if (!next) return;

      const dueDate = new Date(next.dueDate);
      const startWindow = new Date(dueDate); startWindow.setDate(startWindow.getDate() - 3);
      const endWindow = new Date(dueDate); endWindow.setDate(endWindow.getDate() + (next.toleranceDays ?? 0));

      // Solo notificar dentro de la ventana
      if (now < startWindow || now > endWindow) return;

      // De-dup: por id estable y por "no mostrar hoy"
      const alumnoKey = alumno?.folio || alumno?.id || 'anon';
      const dueKey = dueDate.toISOString().slice(0, 10);
      const notifId = `paywarn:${alumnoKey}:${next.index}:${dueKey}`;
      const already = notifications.some(n => String(n.id) === String(notifId));
      if (already) return;
      const todayKey = new Date().toISOString().slice(0, 10);
      const skipKey = `paymentWarn:${alumnoKey}:${next.index}:${dueKey}`;
      const dismissedOn = localStorage.getItem(skipKey);
      if (dismissedOn === todayKey) return;

      // Mensaje contextual
      const msPerDay = 1000 * 60 * 60 * 24;
      let title = 'Aviso de pago';
      let message = '';
      let priority = NOTIFICATION_PRIORITIES.HIGH;
      if (now <= dueDate) {
        const daysToDue = Math.ceil((dueDate - now) / msPerDay);
        if (daysToDue > 1) message = `Tu pago #${next.index} vence en ${daysToDue} días.`;
        else if (daysToDue === 1) { message = `Tu pago #${next.index} vence mañana.`; priority = NOTIFICATION_PRIORITIES.URGENT; }
        else { message = `Tu pago #${next.index} vence hoy.`; priority = NOTIFICATION_PRIORITIES.URGENT; }
        title = 'Próximo vencimiento de pago';
      } else {
        const daysIntoTol = Math.floor((now - dueDate) / msPerDay);
        const tol = next.toleranceDays ?? 0;
        const remaining = Math.max(0, tol - daysIntoTol);
        if (remaining > 1) {
          title = 'Pago vencido (tolerancia activa)';
          message = `Pago #${next.index} vencido. Te quedan ${remaining} días de tolerancia para evitar el bloqueo.`;
          priority = NOTIFICATION_PRIORITIES.HIGH;
        } else if (remaining === 1) {
          title = 'Último día de tolerancia';
          message = `Hoy es tu último día de tolerancia para el pago #${next.index}. Evita el bloqueo regularizando tu pago.`;
          priority = NOTIFICATION_PRIORITIES.URGENT;
        } else {
          title = 'Fin de tolerancia';
          message = `El periodo de tolerancia para el pago #${next.index} termina hoy.`;
          priority = NOTIFICATION_PRIORITIES.URGENT;
        }
      }

      const notif = {
        id: notifId,
        type: NOTIFICATION_TYPES.PAYMENT,
        priority,
        title,
        message,
        timestamp: new Date(),
        is_read: 0,
        actionUrl: '/alumno/mis-pagos',
        metadata: {
          amount: next.amount,
          dueDate: dueKey,
          paymentIndex: next.index,
          toleranceDays: next.toleranceDays
        }
      };

      setNotifications(prev => [notif, ...prev]);
    } catch (e) {
      // silencioso
    }
    // Re-evaluar cuando cambien insumos clave o al recargar
  }, [isAuthenticated, user, alumno, notifications]);

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