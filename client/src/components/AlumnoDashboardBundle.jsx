// BACKEND: Componente Bundle para el Dashboard de Alumno
// Este archivo maneja SOLO las rutas y layout del dashboard, no contiene datos
// Cada componente individual es responsable de obtener sus propios datos del backend
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layout y contextos principales
import { AlumnoLayout } from './AlumnoLayout.jsx';
import { useStudent } from '../context/StudentContext.jsx';

// Componentes de páginas - SOLO IMPORTACIONES
import { Profile_Alumno_comp } from './Profile_Alumno_comp.jsx';
import { Calendar_Alumno_comp } from './Calendar_Alumno_comp.jsx';
import { MisCursos_Alumno_comp } from './MisCursos_Alumno_comp.jsx';
import MisPagos_Alumno_comp from './MisPagos_Alumno_comp.jsx';
import { Configuracion_Alumno_comp } from './Configuracion_Alumno_comp.jsx';
import Feedback_Alumno_Comp from './Feedback_Alumno_Comp.jsx';
import { Asistencia_Alumno_comp } from './Asistencia_Alumno_comp.jsx';
import { InicioAlumnoDashboard } from "./InicioAlumnoDashboard.jsx";
import { SideBarDesktop_Alumno_comp, SideBarSm_Alumno_comp } from './SideBar_Alumno_Comp.jsx';
import CourseDetailDashboard from './CourseDetailDashboard.jsx';
import AlumnoTestPanel from './test.jsx'; // Panel de testing

// Componentes separados (ahora en archivos individuales)
import { Actividades_Alumno_comp } from './Actividades_Alumno_comp.jsx';
import { Simulaciones_Alumno_comp } from './Simulaciones_Alumno_comp.jsx';
import { CerrarSesion_Alumno_comp } from './CerrarSesion_Alumno_comp.jsx';

import { CourseProvider } from '../context/CourseContext.jsx';
import { StudentProvider } from '../context/StudentContext.jsx';

/**
 * BACKEND: Componente Bundle para el Dashboard de Alumno
 * 
 * RESPONSABILIDAD: 
 * - SOLO manejo de rutas y estructura de layout
 * - NO maneja datos - cada componente individual obtiene sus propios datos del backend
 * - NO contiene lógica de componentes - solo importa y renderiza
 * 
 * ARQUITECTURA:
 * - Utiliza AlumnoLayout como envoltorio para todas las páginas
 * - Proporciona estructura de navegación con sidebar condicional
 * - Maneja el contexto de estudiante y cursos
 * - Cada componente hijo es responsable de sus propias llamadas API
 * 
 * INTEGRACIÓN BACKEND:
 * Cada componente individual debe tener sus propias llamadas API:
 * - Profile_Alumno_comp.jsx: datos del perfil del estudiante
 * - Calendar_Alumno_comp.jsx: calendario de clases y eventos
 * - MisCursos_Alumno_comp.jsx: cursos inscritos y disponibles
 * - MisPagos_Alumno_comp.jsx: historial de pagos y facturación
 * - Configuracion_Alumno_comp.jsx: configuración de cuenta
 * - Feedback_Alumno_Comp.jsx: sistema de feedback y soporte
 * - Asistencia_Alumno_comp.jsx: control de asistencia
 * - Actividades_Alumno_comp.jsx: actividades y tareas del estudiante
 * - Simulaciones_Alumno_comp.jsx: simulacros y prácticas
 * - CerrarSesion_Alumno_comp.jsx: funcionalidad de logout
 */
export function AlumnoDashboardBundle() {
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
  
  // Lógica para mostrar sidebar condicionalmente
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
        <Route path="/mi-perfil" element={<Profile_Alumno_comp />} />
        <Route path="/actividades" element={<Actividades_Alumno_comp />} />
        <Route path="/simulaciones" element={<Simulaciones_Alumno_comp />} />
        <Route path="/feedback" element={<Feedback_Alumno_Comp />} />
        <Route path="/asistencia" element={<Asistencia_Alumno_comp />} />
        <Route path="/calendario" element={<Calendar_Alumno_comp />} />
        <Route path="/mis-pagos" element={<MisPagos_Alumno_comp />} />
        <Route path="/configuracion" element={<Configuracion_Alumno_comp />} />
        <Route path="/test-panel" element={<AlumnoTestPanel />} />
        <Route path="/logout" element={<CerrarSesion_Alumno_comp />} />
      </Routes>
    </AlumnoLayout>
  );
}
