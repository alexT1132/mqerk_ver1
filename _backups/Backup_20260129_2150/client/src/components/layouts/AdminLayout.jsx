import { Layout } from './Layout.jsx'; // Importa el Layout general y flexible
import { HeaderAdmin } from './HeaderAdmin.jsx'; // Importa el Header específico para admin con sistema de notificaciones
import { SideBarDesktop, SideBarsm } from './SideBarAdmin.jsx'; // Importa TU SideBar específico de admin (renombrado para evitar conflictos)
import { AdminNotificationProvider } from '../../context/AdminNotificationContext.jsx'; // Provider para notificaciones admin
import { AdminProvider } from '../../context/AdminContext.jsx'; // Provider principal para datos administrativos
import { ComprobanteProvider } from '../../context/ComprobantesContext.jsx'; // Asegura disponibilidad del contexto de comprobantes en todas las pantallas admin
import { useAuth } from '../../context/AuthContext.jsx';
import { Navigate, useLocation } from 'react-router-dom';

export function AdminLayout({ children }) {
  const { loading: authLoading, isAuthenticated, user } = useAuth();
  const roleLower = (user?.role || '').toLowerCase();
  const location = useLocation();
  
  // Detectar si estamos en la ruta de bienvenida para aplicar fondo completo
  const isBienvenidaRoute = (
    location.pathname === '/administrativo/bienvenida' ||
    location.pathname === '/administrativo/' ||
    location.pathname === '/administrativo' ||
    location.pathname === '/admin1/dashboard' ||
    location.pathname === '/admin1/inicio-admin' ||
    location.pathname === '/administrativo/inicio-admin'
  );

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
            backgroundClassName={isBienvenidaRoute ? 'bg-gradient-to-br from-gray-50 via-white to-indigo-50' : 'bg-white'}
            contentClassName={isBienvenidaRoute ? '!px-0 !pb-0' : ''}
          >
            {children} {/* El contenido específico de tu dashboard de administrador */}
          </Layout>
        </ComprobanteProvider>
      </AdminNotificationProvider>
    </AdminProvider>
  );
}