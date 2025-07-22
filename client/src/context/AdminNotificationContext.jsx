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
    throw new Error('useAdminNotificationContext debe usarse dentro de AdminNotificationProvider');
  }
  
  return context;
}
