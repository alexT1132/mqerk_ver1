import { Layout } from './Layout.jsx'; // Importa el Layout general y flexible
import { HeaderAdmin } from './HeaderAdmin.jsx'; // Importa el Header específico para admin con sistema de notificaciones
import { SideBarDesktop, SideBarsm } from './SideBarAdmin.jsx'; // Importa TU SideBar específico de admin (renombrado para evitar conflictos)
import { AdminNotificationProvider } from '../../context/AdminNotificationContext.jsx'; // Provider para notificaciones admin
import { AdminProvider } from '../../context/AdminContext.jsx'; // Provider principal para datos administrativos
import { ComprobanteProvider } from '../../context/ComprobantesContext.jsx'; // Asegura disponibilidad del contexto de comprobantes en todas las pantallas admin
import { useAuth } from '../../context/AuthContext.jsx';
import { Navigate } from 'react-router-dom';

export function AdminLayout({ children }) {
  const { loading: authLoading, isAuthenticated, user } = useAuth();
  const roleLower = (user?.role || '').toLowerCase();

  // Hard guard: solo admins pueden ver cualquier contenido del layout admin
  if (authLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-gray-600">
        Cargando…
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (roleLower !== 'admin') {
    return <Navigate to="/login?reason=forbidden" replace />;
  }
  return (
    <AdminProvider>
      <AdminNotificationProvider>
        <ComprobanteProvider>
          <Layout
            HeaderComponent={HeaderAdmin}          // Usa HeaderAdmin con sistema de notificaciones
            SideBarDesktopComponent={SideBarDesktop} // Pasa tu SideBarDesktop específico de admin
            SideBarSmComponent={SideBarsm}    // Pasa tu SideBarSm específico de admin
          >
            {children} {/* El contenido específico de tu dashboard de administrador */}
          </Layout>
        </ComprobanteProvider>
      </AdminNotificationProvider>
    </AdminProvider>
  );
}