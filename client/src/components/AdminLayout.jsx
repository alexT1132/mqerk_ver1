// src/layouts/AdminLayout.jsx
import React from 'react';
import { Layout } from '../components/Layout.jsx'; // Importa el Layout general y flexible
import { Header } from '../components/Header.jsx'; // Importa TU Header.jsx (el que subiste en este prompt)
import { SideBarDesktop, SideBarsm } from '../components/SideBar.jsx'; // Importa TU SideBar.jsx (con SideBarDesktop y SideBarsm)

/**
 * Componente de Layout específico para Dashboards de Administrador.
 * Este componente actúa como un "wrapper" que configura el Layout general
 * con los componentes de Header y Sidebar adecuados para el rol de Administrador.
 */
export function AdminLayout({ children }) {
  return (
    <Layout
      HeaderComponent={Header}          // Pasa tu Header.jsx específico de admin
      SideBarDesktopComponent={SideBarDesktop} // Pasa tu SideBarDesktop específico de admin
      SideBarSmComponent={SideBarsm}    // Pasa tu SideBarSm específico de admin
    >
      {children} {/* El contenido específico de tu dashboard de administrador */}
    </Layout>
  );
}
