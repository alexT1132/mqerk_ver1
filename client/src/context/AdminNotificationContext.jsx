// src/context/AdminNotificationContext.jsx
import React, { createContext, useContext } from 'react';
import { useAdminNotifications } from '../hooks/useAdminNotifications.js';

/**
 * Contexto para compartir el estado de notificaciones administrativas
 * entre componentes como HeaderAdmin y DashboardMetrics
 */
const AdminNotificationContext = createContext();

/**
 * Provider del contexto de notificaciones administrativas
 * Centraliza el estado y la lógica de notificaciones
 */
export function AdminNotificationProvider({ children }) {
  const adminNotifications = useAdminNotifications();
  // Debug mount log (solo desarrollo)
  if (import.meta?.env?.DEV) {
    // Evitar ruido excesivo: log sólo primeras 2 montadas
    if (!window.__ADMIN_NOTIF_MOUNT_COUNT) window.__ADMIN_NOTIF_MOUNT_COUNT = 0;
    if (window.__ADMIN_NOTIF_MOUNT_COUNT < 2) {
      // eslint-disable-next-line no-console
      console.log('[AdminNotificationProvider] mount', {
        unreadCount: adminNotifications?.unreadCount,
        pendingCount: adminNotifications?.pendingCount,
        notificationsLen: adminNotifications?.notifications?.length
      });
      window.__ADMIN_NOTIF_MOUNT_COUNT++;
    }
  }

  return (
    <AdminNotificationContext.Provider value={adminNotifications}>
      {children}
    </AdminNotificationContext.Provider>
  );
}

/**
 * Hook para consumir el contexto de notificaciones administrativas
 * @returns {Object} El estado y métodos de notificaciones administrativas
 */
export function useAdminNotificationContext() {
  const context = useContext(AdminNotificationContext);
  if (!context) {
    // En desarrollo devolvemos un stub para no romper toda la UI mientras se depura
    if (import.meta?.env?.DEV) {
      // eslint-disable-next-line no-console
      console.warn('[useAdminNotificationContext] Contexto ausente. Devolviendo stub DEV. Revisa que <AdminNotificationProvider> envuelva tu árbol.');
      const stub = {
        notifications: [],
        unreadNotifications: [],
        unreadCount: 0,
        pendingCount: 0,
        isNotificationsOpen: false,
        setIsNotificationsOpen: () => {},
        toggleNotifications: () => {},
        markAllAsRead: () => {},
        markAsRead: () => {},
        addNotification: () => {},
        removeNotification: () => {},
        getNotificationIcon: () => '🔔',
        getPriorityColor: () => 'border-blue-500 bg-blue-50',
        getTimeAgo: () => '—'
      };
      return stub;
    }
    throw new Error('useAdminNotificationContext debe usarse dentro de AdminNotificationProvider');
  }
  return context;
}