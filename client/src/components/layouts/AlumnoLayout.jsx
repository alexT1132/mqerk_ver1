import { Layout } from './Layout.jsx'; // El Layout general y flexible
import { Header_Alumno_comp } from './Header_Alumno_comp.jsx'; // El Header de alumno con barra de búsqueda
import { SideBarDesktop_Alumno_comp, SideBarSm_Alumno_comp } from './SideBar_Alumno_Comp.jsx'; // Los SideBars de alumno (plegable y móvil)

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
 * 
 * NOTA: StudentNotificationProvider ahora está en AlumnoDashboardBundle para que
 * esté disponible antes de que se cree el CustomHeader.
 */
export function AlumnoLayout({ children, HeaderComponent, SideBarDesktopComponent, SideBarSmComponent }) {
  return (
    <Layout
      HeaderComponent={HeaderComponent !== undefined ? HeaderComponent : Header_Alumno_comp} // Permite null explícito
      SideBarDesktopComponent={SideBarDesktopComponent !== undefined ? SideBarDesktopComponent : SideBarDesktop_Alumno_comp} // Usa la prop o el default
      SideBarSmComponent={SideBarSmComponent !== undefined ? SideBarSmComponent : SideBarSm_Alumno_comp}    // Usa la prop o el default
    >
      {children} {/* El contenido específico del dashboard de alumno */}
    </Layout>
  );
}