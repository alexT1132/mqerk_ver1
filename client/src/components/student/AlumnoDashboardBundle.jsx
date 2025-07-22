// BACKEND: Dashboard Bundle - Contenedor principal de rutas del alumno
import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

// Layout y contextos
import { AlumnoLayout } from '../layouts/AlumnoLayout.jsx';
import { useStudent } from '../../context/StudentContext.jsx';

// Componentes de páginas
import { Profile_Alumno_comp } from './Profile_Alumno_comp.jsx';
import { Calendar_Alumno_comp } from './Calendar_Alumno_comp.jsx';
import { MisCursos_Alumno_comp } from './MisCursos_Alumno_comp.jsx';
import MisPagos_Alumno_comp from './MisPagos_Alumno_comp.jsx';
import { Configuracion_Alumno_comp } from './Configuracion_Alumno_comp.jsx';
import Feedback_Alumno_Comp from './Feedback_Alumno_Comp.jsx';
import { Asistencia_Alumno_comp } from './Asistencia_Alumno_comp.jsx';
import { InicioAlumnoDashboard } from "./InicioAlumnoDashboard.jsx";
import { SideBarDesktop_Alumno_comp, SideBarSm_Alumno_comp } from '../layouts/SideBar_Alumno_Comp.jsx';
import CourseDetailDashboard from '../shared/CourseDetailDashboard.jsx';
import { Actividades_Alumno_comp } from './Actividades_Alumno_comp.jsx';
import { Simulaciones_Alumno_comp } from './Simulaciones_Alumno_comp.jsx';
import { CerrarSesion_Alumno_comp } from './CerrarSesion_Alumno_comp.jsx';

import { CourseProvider } from '../../context/CourseContext.jsx';
import { StudentProvider } from '../../context/StudentContext.jsx';

/**
 * BACKEND: Contenedor principal del dashboard del alumno
 * - Manejo de rutas y layout principal
 * - Control de sidebar basado en estado del estudiante
 * - Cada componente maneja sus propias llamadas API
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

// BACKEND: Layout con contexto de estudiante
function StudentAwareLayout() {
  const { isVerified, hasPaid, currentCourse, isLoading } = useStudent();
  
  // BACKEND: Control de sidebar basado en estado del estudiante
  const shouldShowSidebar = !!(
    currentCourse &&     // Curso seleccionado
    isVerified &&        // Usuario verificado
    hasPaid              // Pago confirmado
  );

  // BACKEND: Loading state para evitar parpadeos
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando dashboard...</p>
          <div className="mt-4 w-64 bg-gray-200 rounded-full h-2 mx-auto">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
          </div>
        </div>
      </div>
    );
  }

  // BACKEND: Estado para manejar la transición de carga
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, [currentCourse, isVerified, hasPaid]);

  // BACKEND: Renderizado del layout principal
  // - Utiliza componentes de sidebar según el estado del estudiante
  return (
    <div className={`min-h-screen transition-opacity duration-300 ${isReady ? 'opacity-100' : 'opacity-0'}`}>
      <AlumnoLayout
        HeaderComponent={undefined}
        SideBarDesktopComponent={shouldShowSidebar ? (props => <SideBarDesktop_Alumno_comp {...props} />) : () => null}
        SideBarSmComponent={shouldShowSidebar ? (props => <SideBarSm_Alumno_comp {...props} />) : () => null}
      >
        {/* BACKEND: Rutas del dashboard del alumno */}
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
          <Route path="/logout" element={<CerrarSesion_Alumno_comp />} />
        </Routes>
      </AlumnoLayout>
    </div>
  );
}
