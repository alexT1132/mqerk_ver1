// src/layouts/AdminLayout.jsx
import React from 'react';
import { Layout } from './Layout.jsx'; // Importa el Layout general y flexible
import { HeaderAdmin } from './HeaderAdmin.jsx'; // Importa el Header específico para admin con sistema de notificaciones
import { SideBarDesktop, SideBarsm } from './SideBarAdmin.jsx'; // Importa TU SideBar específico de admin (renombrado para evitar conflictos)
import { AdminNotificationProvider } from '../../context/AdminNotificationContext.jsx'; // Provider para notificaciones admin

/**
 * Componente de Layout específico para Dashboards de Administrador.
 * Este componente actúa como un "wrapper" que configura el Layout general
 * con los componentes de Header y Sidebar adecuados para el rol de Administrador.
 * Incluye sistema de notificaciones administrativas mejorado.
 */
export function AdminLayout({ children }) {
  return (
    <AdminNotificationProvider>
      <Layout
        HeaderComponent={HeaderAdmin}          // Usa HeaderAdmin con sistema de notificaciones
        SideBarDesktopComponent={SideBarDesktop} // Pasa tu SideBarDesktop específico de admin
        SideBarSmComponent={SideBarsm}    // Pasa tu SideBarSm específico de admin
      >
        {children} {/* El contenido específico de tu dashboard de administrador */}
      </Layout>
    </AdminNotificationProvider>
  );
}