// BACKEND: Dashboard Bundle - Contenedor principal de rutas del alumno
import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';

// Layout y contextos
import { AlumnoLayout } from '../layouts/AlumnoLayout.jsx';
import { Header_Alumno_comp } from '../layouts/Header_Alumno_comp.jsx';
import { useStudent } from '../../context/StudentContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

// Componentes de páginas
import Profile_Alumno_comp from './Profile_Alumno_Comp.jsx';
import { Calendar_Alumno_comp } from './Calendar_Alumno_Comp.jsx';
import MisCursos_Alumno_comp from './MisCursos_Alumno_Comp.jsx';
import MisPagos_Alumno_comp from './MisPagos_Alumno_Comp.jsx';
import { Configuracion_Alumno_comp } from './Configuracion_Alumno_Comp.jsx';
import Feedback_Alumno_Comp from './Feedback_Alumno_Comp.jsx';
import { Asistencia_Alumno_comp } from './Asistencia_Alumno_comp.jsx';
import { InicioAlumnoDashboard } from "./InicioAlumnoDashboard.jsx";
import { SideBarDesktop_Alumno_comp, SideBarSm_Alumno_comp } from '../layouts/SideBar_Alumno_Comp.jsx';
import CourseDetailDashboard from '../shared/CourseDetailDashboard.jsx';
import { Actividades_Alumno_comp } from './Actividades_Alumno_comp.jsx';
import { Simulaciones_Alumno_comp } from './Simulaciones_Alumno_comp.jsx';
import { CerrarSesion_Alumno_comp } from './CerrarSesion_Alumno_comp.jsx';
import { AccessGuard } from './AccessGuard.jsx';

import { CourseProvider } from '../../context/CourseContext.jsx';

/**
 * BACKEND: Contenedor principal del dashboard del alumno
 * - Manejo de rutas y layout principal
 * - Control de sidebar basado en estado del estudiante
 * - Cada componente maneja sus propias llamadas API
 */
export function AlumnoDashboardBundle() {
  return (
    <CourseProvider>
      <StudentAwareLayout />
    </CourseProvider>
  );
}

// BACKEND: Layout con contexto de estudiante

function StudentAwareLayout() {
  const { isVerified, hasPaid, currentCourse, isLoading, hasContentAccess, refreshOverdueAccess } = useStudent();
  const { alumno } = useAuth();
  const location = useLocation();
  const isCoursesRoute = location.pathname.startsWith('/alumno/cursos');
  const isConfigRoute = location.pathname.startsWith('/alumno/configuracion');
  const verificacion = Number(alumno?.verificacion ?? 0); // 0: no subido, 1: enviado, 2: aprobado
  const isApproved = verificacion >= 2;

  // BACKEND: Estado para manejar la transición de carga
  const [isReady, setIsReady] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Mostrar sidebar si:
  // - Está en Configuración, o
  // - Ya hay curso seleccionado y (verificado/pagado o aprobado por backend)
  // Permitir en /alumno/cursos si ya existe currentCourse
  const shouldShowSidebar = (
    isConfigRoute || (
      !!currentCourse && (
    ((isVerified && hasPaid) || isApproved) && hasContentAccess
      )
    )
  );

  // Redirección temprana para evitar parpadeo del dashboard sin curso seleccionado
  const shouldRedirectToCourses = isApproved && !currentCourse && !isCoursesRoute;
  // Redirección por bloqueo global de acceso
  const shouldRedirectToWelcome = !hasContentAccess && location.pathname !== '/alumno' && location.pathname !== '/alumno/dashboard' && location.pathname !== '/alumno/';

  // BACKEND: El botón de logout se muestra cuando NO hay sidebar
  const showLogoutButton = !shouldShowSidebar;

  // BACKEND: Función para manejar el logout
  const handleLogout = () => {
    // TODO: Implementar llamada al API de logout
    // logoutAPI();
    // Limpiar datos locales
    localStorage.clear();
    sessionStorage.clear();
    // Redirigir al login
    window.location.href = '/login';
  };

  // BACKEND: Header personalizado con la lógica del botón de logout
  const CustomHeader = (props) => (
    <Header_Alumno_comp
      {...props}
      showLogoutButton={showLogoutButton}
  disableNavOptions={!shouldShowSidebar}
      onLogout={handleLogout}
    />
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, [currentCourse, isVerified, hasPaid]);

  // Recalcular acceso global al montar y cuando cambie alumno
  useEffect(() => {
    refreshOverdueAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alumno?.plan, alumno?.plan_type, alumno?.folio, alumno?.id, alumno?.created_at]);

  // ✅ FORZAR RE-RENDER cuando cambie currentCourse
  useEffect(() => {
    if (currentCourse) {
      console.log('🔄 currentCourse cambió, forzando re-render:', currentCourse.title);
      setForceUpdate(prev => prev + 1);
    }
  }, [currentCourse]);

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

  // Redirigir antes de renderizar Layout para evitar flicker y exposición del sidebar
  if (shouldRedirectToCourses) {
    return <Navigate to="/alumno/cursos" replace />;
  }
  if (shouldRedirectToWelcome) {
    return <Navigate to="/alumno" replace />;
  }

  // BACKEND: Renderizado del layout principal
  // - Utiliza componentes de sidebar según el estado del estudiante
  return (
    <div className={`min-h-screen transition-opacity duration-300 ${isReady ? 'opacity-100' : 'opacity-0'}`}>
      <AlumnoLayout
        HeaderComponent={CustomHeader}
        SideBarDesktopComponent={shouldShowSidebar ? (props => <SideBarDesktop_Alumno_comp {...props} onLogout={handleLogout} />) : null}
        SideBarSmComponent={shouldShowSidebar ? (props => <SideBarSm_Alumno_comp {...props} onLogout={handleLogout} />) : null}
      >
        {/* BACKEND: Rutas del dashboard del alumno */}
        <Routes>
          <Route path="/" element={<InicioAlumnoDashboard />} />
          <Route path="/dashboard" element={<InicioAlumnoDashboard />} />
          <Route path="/course-details" element={<CourseDetailDashboard />} />
          <Route path="/cursos" element={<MisCursos_Alumno_comp />} />
          <Route path="/mi-perfil" element={<Profile_Alumno_comp />} />
          <Route path="/actividades" element={<AccessGuard><Actividades_Alumno_comp /></AccessGuard>} />
          <Route path="/simulaciones" element={<AccessGuard><Simulaciones_Alumno_comp /></AccessGuard>} />
          <Route path="/feedback" element={<AccessGuard><Feedback_Alumno_Comp /></AccessGuard>} />
          <Route path="/asistencia" element={<AccessGuard><Asistencia_Alumno_comp /></AccessGuard>} />
          <Route path="/calendario" element={<AccessGuard><Calendar_Alumno_comp /></AccessGuard>} />
          <Route path="mis-pagos" element={<MisPagos_Alumno_comp />} />
          <Route path="/configuracion" element={<Configuracion_Alumno_comp />} />
          <Route path="/logout" element={<CerrarSesion_Alumno_comp />} />
        </Routes>
      </AlumnoLayout>
    </div>
  );
}