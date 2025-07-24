import { Routes, Route, useLocation } from 'react-router-dom';
//src\components\AlumnoDashboardBundle.jsx
// Importación de AlumnoLayout:
// Asumiendo que AlumnoLayout.jsx está en la misma carpeta que AlumnoDashboardBundle.jsx
import { AlumnoLayout } from '../layouts/AlumnoLayout.jsx';
import { useStudent } from '../../context/StudentContext.jsx';

// Importación de los componentes de página:
// Asumiendo que todos estos componentes están en la misma carpeta que AlumnoDashboardBundle.jsx
import { Profile_Alumno_comp } from './Profile_Alumno_Comp.jsx';
import { Calendar_Alumno_comp } from './Calendar_Alumno_Comp.jsx';
import { MisCursos_Alumno_comp } from './MisCursos_Alumno_Comp.jsx';
import MisPagos_Alumno_comp from './MisPagos_Alumno_Comp.jsx';
import { Configuracion_Alumno_comp } from './Configuracion_Alumno_comp.jsx';
import Feedback_Alumno_Comp from './Feedback_Alumno_Comp.jsx'; // Tu componente de Feedback
import { InicioAlumnoDashboard } from "./InicioAlumnoDashboard.jsx";
import { SideBarDesktop_Alumno_comp, SideBarSm_Alumno_comp } from '../layouts/SideBar_Alumno_Comp.jsx';
import CourseDetailDashboard from '../layouts/CourseDetailDashboard.jsx'; // Nuevo componente

import { CourseProvider } from '../../context/CourseContext.jsx';
import { StudentProvider } from '../../context/StudentContext.jsx';

// ==========================================
// PAGE COMPONENTS
// ==========================================
// 🔧 BACKEND: Cada componente maneja su propia lógica de datos

/**
 * 🔧 BACKEND READY: Página de Perfil de Alumno
 * El componente Profile_Alumno_comp maneja su propia lógica de datos internamente.
 * 
 * BACKEND TODO: Verificar que Profile_Alumno_comp tenga sus propias llamadas API.
 */
function AlumnoMiPerfil() {
  return <Profile_Alumno_comp />;
}

/**
 * 🔧 BACKEND READY: Página de Calendario de Alumno
 * El componente Calendar_Alumno_comp maneja su propia lógica de datos internamente.
 * 
 * BACKEND TODO: Verificar que Calendar_Alumno_comp tenga sus propias llamadas API.
 */
function AlumnoCalendario() {
  return <Calendar_Alumno_comp />;
}

/**
 * 🔧 BACKEND READY: Página de Mis Cursos de Alumno
 * Renderiza el componente que maneja los cursos del estudiante.
 * 
 * BACKEND TODO: El componente MisCursos_Alumno_comp maneja su propia lógica interna,
 * verificar que tenga las llamadas API correspondientes.
 */
function AlumnoMisCursos() {
  return (
    <MisCursos_Alumno_comp />
  );
}

/**
 * 🔧 BACKEND TODO: Página de Actividades Recientes
 * Actualmente es un placeholder. Necesita implementación completa.
 * 
 * BACKEND TODO:
 * - Crear componente real para mostrar actividades
 * - Implementar llamada a /api/alumno/actividades
 * - Mostrar historial de tareas, exámenes, y progreso
 */
function AlumnoActividades() {
  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold text-gray-600 text-center">
        🔧 BACKEND TODO: Actividades Recientes
      </h1>
      <p className="text-center text-gray-500 mt-4">
        Implementar componente real para mostrar historial de actividades.
      </p>
    </div>
  );
}

/**
 * 🔧 BACKEND TODO: Página de Simulaciones
 * Actualmente es un placeholder. Necesita implementación completa.
 * 
 * BACKEND TODO:
 * - Crear componente real para simulaciones
 * - Implementar llamada a /api/alumno/simulaciones
 * - Mostrar simuladores disponibles y resultados
 */
function AlumnoSimulaciones() {
  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold text-gray-600 text-center">
        🔧 BACKEND TODO: Simulaciones
      </h1>
      <p className="text-center text-gray-500 mt-4">
        Implementar componente real para simulaciones y prácticas.
      </p>
    </div>
  );
}

/**
 * 🔧 BACKEND READY: Página de Feedback y Soporte
 * Renderiza el componente de feedback del estudiante.
 * 
 * BACKEND TODO: Verificar que Feedback_Alumno_Comp tenga las APIs necesarias.
 */
function AlumnoFeedback() {
  return (
    <Feedback_Alumno_Comp />
  );
}

/**
 * 🔧 BACKEND READY: Página de Mis Pagos de Alumno
 * Renderiza el componente que maneja los pagos del estudiante.
 * 
 * BACKEND TODO: El componente MisPagos_Alumno_comp maneja su propia lógica interna,
 * verificar que tenga las llamadas API correspondientes.
 */
function AlumnoMisPagos() {
  return (
    <MisPagos_Alumno_comp />
  );
}

/**
 * 🔧 BACKEND READY: Página de Configuración de Alumno
 * Renderiza el componente de configuración del estudiante.
 * 
 * BACKEND TODO: Verificar que Configuracion_Alumno_comp tenga las APIs necesarias.
 */
function AlumnoConfiguracion() {
  return (
    <Configuracion_Alumno_comp />
  );
}

/**
 * 🔧 BACKEND TODO: Página de Cerrar Sesión
 * Actualmente es un placeholder. Necesita implementación de logout real.
 * 
 * BACKEND TODO:
 * - Implementar llamada a /api/auth/logout
 * - Limpiar tokens y datos del usuario
 * - Redirigir a página de login
 */
function AlumnoCerrarSesion() {
  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold text-gray-600 text-center">
        Cerrando Sesión...
      </h1>
      <p className="text-center text-gray-500 mt-4">
        Redireccionando a la página de inicio de sesión.
      </p>
    </div>
  );
}

/**
 * 🔧 BACKEND READY: Componente Bundle para el Dashboard de Alumno
 * 
 * RESPONSABILIDAD: Solo maneja routing y estructura de layout.
 * Cada componente individual maneja su propia lógica de datos.
 * 
 * ARQUITECTURA:
 * - Utiliza AlumnoLayout como envoltorio para todas las páginas
 * - Proporciona estructura de navegación con sidebar condicional
 * - Maneja el contexto de estudiante y cursos
 * - NO maneja datos - cada componente es responsable de sus propios datos
 * 
 * BACKEND TODO:
 * Verificar que cada componente individual tenga sus propias llamadas API:
 * - Profile_Alumno_comp.jsx
 * - Calendar_Alumno_comp.jsx  
 * - MisCursos_Alumno_comp.jsx
 * - MisPagos_Alumno_comp.jsx
 * - Configuracion_Alumno_comp.jsx
 * - Feedback_Alumno_Comp.jsx
 */
export function AlumnoDashboardBundle() {
  const location = useLocation();
  const isInicio = location.pathname === '/alumno' || location.pathname === '/alumno/';
  const isCursos = location.pathname === '/alumno/cursos';

  return (
    <StudentProvider>
      <CourseProvider>
        <StudentAwareLayout />
      </CourseProvider>
    </StudentProvider>
  );
}

// Componente interno que tiene acceso al contexto de estudiante
function StudentAwareLayout() {
  const { isVerified, hasPaid, currentCourse } = useStudent();
  const location = useLocation();
  
  const isInicio = location.pathname === '/alumno' || location.pathname === '/alumno/';
  const isCursos = location.pathname === '/alumno/cursos';

  // NUEVA LÓGICA CORREGIDA SEGÚN EL FLUJO REAL:
  // El sidebar se muestra cuando:
  // 1. HAY un curso seleccionado (independiente de la página)
  // 2. El estudiante está verificado y pagado
  // 
  // NO importa si estamos en "Mis Cursos" - si hay curso seleccionado, mostrar sidebar
  // para facilitar la navegación a las secciones del curso actual
  const shouldShowSidebar = !!(
    currentCourse &&             // Debe haber un curso seleccionado
    isVerified &&               // Debe estar verificado
    hasPaid                     // Debe haber pagado
  );


  return (
    <AlumnoLayout
      HeaderComponent={undefined} // Siempre mostrar el header
      SideBarDesktopComponent={shouldShowSidebar ? (props => <SideBarDesktop_Alumno_comp {...props} />) : () => null}
      SideBarSmComponent={shouldShowSidebar ? (props => <SideBarSm_Alumno_comp {...props} />) : () => null}
    >
      <Routes>
        <Route path="/" element={<InicioAlumnoDashboard />} />
        <Route path="/dashboard" element={<CourseDetailDashboard />} />
        <Route path="/cursos" element={<MisCursos_Alumno_comp />} />
        <Route path="/mi-perfil" element={<AlumnoMiPerfil />} />
        <Route path="/actividades" element={<AlumnoActividades />} />
        <Route path="/simulaciones" element={<AlumnoSimulaciones />} />
        <Route path="/feedback" element={<AlumnoFeedback />} />
        <Route path="/calendario" element={<AlumnoCalendario />} />
        <Route path="/mis-pagos" element={<AlumnoMisPagos />} />
        <Route path="/configuracion" element={<AlumnoConfiguracion />} />
        <Route path="/logout" element={<AlumnoCerrarSesion />} />
      </Routes>
    </AlumnoLayout>
  );
}