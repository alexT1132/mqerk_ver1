import { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Layout } from './Layout.jsx'; // El Layout general y flexible
import { Header_Alumno_comp } from './Header_Alumno_comp.jsx'; // El Header de alumno con barra de búsqueda
import { SideBarDesktop_Alumno_comp, SideBarSm_Alumno_comp } from './SidebarAlumno.jsx'; // Los SideBars de alumno (plegable y móvil) - migrados al componente base

/**
 * Componente de Layout específico para Dashboards de Alumno.
 * Este componente actúa como un "wrapper" que configura el Layout general
 * con los componentes de Header y Sidebar adecuados para el rol de Alumno.
 * 
 * FEATURES:
 * - Header y Sidebar optimizados para estudiantes
 * - Datos centralizados del estudiante (StudentContext viene desde App.jsx)
 * - Notificaciones en tiempo real (StudentNotificationProvider viene desde AlumnoDashboardBundle)
 * - Control de acceso basado en pagos y verificación
 * - Cierre de sesión automático por inactividad (1 hora)
 * 
 * NOTA: StudentNotificationProvider ahora está en AlumnoDashboardBundle para que
 * esté disponible antes de que se cree el CustomHeader.
 */
export function AlumnoLayout({ children, HeaderComponent, SideBarDesktopComponent, SideBarSmComponent }) {
  const { logout } = useAuth();
  const timerRef = useRef(null);
  // Dashboard con métricas: fondo blanco. La bienvenida aplica su propio gradiente morado internamente.
  const backgroundClassName = 'bg-white';

  // Efecto para manejar el cierre de sesión por inactividad
  useEffect(() => {
    // 1 hora en milisegundos (3600000 ms)
    const INACTIVITY_LIMIT = 60 * 60 * 1000;

    const handleLogout = () => {
      console.log("Inactividad detectada (1 hora). Cerrando sesión...");
      logout();
      // Redirigir explícitamente para asegurar limpieza visual
      window.location.href = '/login?reason=inactivity';
    };

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(handleLogout, INACTIVITY_LIMIT);
    };

    // Eventos que se consideran "actividad"
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

    // Inicializar timer
    resetTimer();

    // Listener unificado con throttling básico nativo (resetTimer es ligero, pero evitamos exceso)
    const onActivity = () => resetTimer();

    events.forEach(event => window.addEventListener(event, onActivity));

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(event => window.removeEventListener(event, onActivity));
    };
  }, [logout]);

  return (
    <Layout
      HeaderComponent={HeaderComponent !== undefined ? HeaderComponent : Header_Alumno_comp} // Permite null explícito
      SideBarDesktopComponent={SideBarDesktopComponent !== undefined ? SideBarDesktopComponent : SideBarDesktop_Alumno_comp} // Usa la prop o el default
      SideBarSmComponent={SideBarSmComponent !== undefined ? SideBarSmComponent : SideBarSm_Alumno_comp}    // Usa la prop o el default
      backgroundClassName={backgroundClassName}
      contentClassName="px-0"
    >
      {children} {/* El contenido específico del dashboard de alumno */}
    </Layout>
  );
}