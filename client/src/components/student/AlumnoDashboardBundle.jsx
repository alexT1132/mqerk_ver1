// BACKEND: Dashboard Bundle - Contenedor principal de rutas del alumno
import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';

// Layout y contextos
import { AlumnoLayout } from '../layouts/AlumnoLayout.jsx';
import { Header_Alumno_comp } from '../layouts/Header_Alumno_comp.jsx';
import { useStudent } from '../../context/StudentContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { StudentNotificationProvider } from '../../context/StudentNotificationContext.jsx';

// Componentes de páginas
import Profile_Alumno_comp from './Profile_Alumno_Comp.jsx';
import { Calendar_Alumno_comp } from './Calendar_Alumno_Comp.jsx';
import MisCursos_Alumno_comp from './MisCursos_Alumno_Comp.jsx';
import MisPagos_Alumno_comp from './MisPagos_Alumno_Comp.jsx';
import { Configuracion_Alumno_comp } from './Configuracion_Alumno_Comp.jsx';
import Feedback_Alumno_Comp from './Feedback_Alumno_Comp.jsx';
import { Asistencia_Alumno_comp } from './Asistencia_Alumno_comp.jsx';
import { InicioAlumnoDashboard } from "./InicioAlumnoDashboard.jsx";
import { SideBarDesktop_Alumno_comp, SideBarSm_Alumno_comp } from '../layouts/SidebarAlumno.jsx';
import CourseDetailDashboard from '../shared/CourseDetailDashboard.jsx';
import { Actividades_Alumno_comp } from './Actividades_Alumno_comp.jsx';
import { Simulaciones_Alumno_comp } from './Simulaciones_Alumno_comp.jsx';
import Recursos_Alumno_comp from './Recursos_Alumno_comp.jsx';
import { CerrarSesion_Alumno_comp } from './CerrarSesion_Alumno_comp.jsx';
import { AccessGuard } from './AccessGuard.jsx';
import Quizz_Review from './Quizz_Review.jsx';
import Simulacion_Review from './Simulacion_Review.jsx';
import SimulacionResultadosPage from '../../pages/alumnos/SimulacionResultadosPage.jsx';
import QuizResultadosPage from '../../pages/alumnos/QuizResultadosPage.jsx';
import AnalisisIAPage from '../../pages/alumnos/AnalisisIAPage.jsx';
import ChatFloatingButton from '../shared/ChatFloatingButton.jsx';

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
      <StudentNotificationProvider>
        <StudentAwareLayout />
      </StudentNotificationProvider>
    </CourseProvider>
  );
}

// BACKEND: Layout con contexto de estudiante

function StudentAwareLayout() {
  const { isVerified, hasPaid, currentCourse, isLoading, hasContentAccess, refreshOverdueAccess } = useStudent();
  const { alumno, isAuthenticated, loading: authLoading } = useAuth();
  const location = useLocation();
  const isCoursesRoute = location.pathname.startsWith('/alumno/cursos');
  // Fallback inmediato a localStorage para evitar parpadeo o estados transitorios en el primer render
  const hasSelectedCourse = (() => {
    if (currentCourse) return true;
    try {
      const raw = localStorage.getItem('currentCourse');
      if (!raw) return false;
      // Evitar contar la cadena "null" o datos corruptos
      if (raw === 'null' || raw === 'undefined') return false;
      const obj = JSON.parse(raw);
      return obj && typeof obj === 'object' && (obj.id || obj.title);
    } catch { return false; }
  })();
  const isConfigRoute = location.pathname.startsWith('/alumno/configuracion');
  const isQuizRoute = location.pathname.startsWith('/alumno/actividades/quiz');
  const isFeedbackRoute = location.pathname.startsWith('/alumno/feedback');
  // Permitir toda la sección de Actividades (selector/botones/lista) sin curso seleccionado.
  // El bloqueo debe ocurrir al ejecutar un quiz o simulación, no al navegar dentro de la sección.
  const isActividadesSection = location.pathname.startsWith('/alumno/actividades');
  // Consideramos "runner" sólo la vista de toma (no resultados) para permitir layout normal en resultados
  const isSimRoute = location.pathname.startsWith('/alumno/simulaciones/tomar/') && !location.pathname.endsWith('/resultados') && !location.pathname.includes('/resultados?');
  // Sección de simulaciones (no runner): debe mostrar sidebar incluso sin curso seleccionado
  const isSimulacionesSection = location.pathname.startsWith('/alumno/simulaciones') && !isSimRoute;
  const verificacion = Number(alumno?.verificacion ?? 0); // 0: no subido, 1: enviado, 2: aprobado
  const isApproved = verificacion >= 2;

  // Hidratar una vez montado para habilitar lógica que depende de localStorage/context sin caer en la TDZ
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);

  // BACKEND: Estado para manejar la transición de carga
  const [isReady, setIsReady] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Regla simplificada: mostrar sidebar en TODAS las rutas del alumno excepto en los "runners"
  // (tomar quiz/simulación). Esto evita ocultamientos tras refresh en secciones como Asistencia/Calendario.
  const isAlumnoSection = location.pathname.startsWith('/alumno');
  // Ocultar sidebar en Mis Cursos cuando aún no hay curso seleccionado
  // ADEMÁS: Ocultar sidebar si el alumno NO tiene acceso completo (por falta de verificación o pago)
  const shouldShowSidebar = isAlumnoSection && !isQuizRoute && !isSimRoute && hasSelectedCourse && hasContentAccess;

  // Redirección temprana para evitar parpadeo del dashboard sin curso seleccionado
  // IMPORTANTE: Usar hasSelectedCourse (que verifica localStorage) en lugar de solo currentCourse
  // para evitar redirigir antes de que el curso se haya hidratado desde localStorage
  // No redirigir a cursos si el usuario está entrando directamente a un quiz (runner o resultados),
  // porque el currentCourse puede hidratarse unos ms después y causar un salto molesto.
  // Solo redirigir a /alumno/cursos desde las páginas de aterrizaje del dashboard.
  // Evita que un refresh profundo (p.ej. en pagos, perfil, actividades) te saque de la vista actual.
  const isAlumnoLanding = location.pathname === '/alumno' || location.pathname === '/alumno/' || location.pathname === '/alumno/dashboard';
  // Usar hasSelectedCourse que verifica tanto currentCourse como localStorage
  // SIEMPRE redirigir a cursos si no hay uno seleccionado, sin importar la verificación aquí (se maneja en el dashboard)
  const shouldRedirectToCourses = hydrated && !hasSelectedCourse && isAlumnoLanding;
  // Ya no redirigimos a bienvenida externo; el dashboard ya maneja el bloqueo internamente
  const shouldRedirectToWelcome = false;


  // BACKEND: El botón de logout se muestra cuando NO hay sidebar Y NO se está en quiz/simulación
  //const showLogoutButton = !shouldShowSidebar;
  const showLogoutButton = !shouldShowSidebar && !isSimRoute && !isQuizRoute;

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
      // En el quiz/simulación deshabilitamos navegación del header por seguridad
      disableNavOptions={isQuizRoute || isSimRoute || !shouldShowSidebar}
      onLogout={handleLogout}
    />
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, [currentCourse, isVerified, hasPaid]);

  // Redirigir si se pierde la autenticación mientras se está navegando
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const path = location.pathname;
      // No redirigir si ya estamos en login o rutas públicas
      if (!path.startsWith('/login') && !path.startsWith('/pre_registro')) {
        // Limpiar datos sensibles
        try {
          localStorage.removeItem('mq_user');
          localStorage.removeItem('rememberMe');
          localStorage.removeItem('currentCourse');
          sessionStorage.clear();
        } catch (e) {
          console.warn('Error al limpiar datos locales:', e);
        }
        // Redirigir al login con la ruta actual como parámetro
        window.location.href = `/login?redirect=${encodeURIComponent(path)}`;
      }
    }
  }, [authLoading, isAuthenticated, location.pathname]);

  // Recalcular acceso global al montar y cuando cambie alumno
  useEffect(() => {
    refreshOverdueAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alumno?.plan, alumno?.plan_type, alumno?.folio, alumno?.id, alumno?.created_at]);

  // ✅ FORZAR RE-RENDER cuando cambie currentCourse
  useEffect(() => {
    if (currentCourse) {
      // Log solo en desarrollo para reducir ruido en consola
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 currentCourse cambió, forzando re-render:', currentCourse.title);
      }
      setForceUpdate(prev => prev + 1);
    }
  }, [currentCourse]);

  // El curso NO se deselecciona automáticamente - debe persistir durante toda la sesión
  // Solo se puede cambiar desde /alumno/cursos explícitamente

  // BACKEND: Loading state para evitar parpadeos
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando dashboard...</p>
          <div className="mt-4 w-64 bg-gray-200 rounded-full h-2 mx-auto">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
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
          <Route path="/actividades/quiz/:quizId" element={<AccessGuard><Quizz_Review /></AccessGuard>} />
          <Route path="/actividades/quiz/:quizId/resultados" element={<AccessGuard><QuizResultadosPage /></AccessGuard>} />
          <Route path="/simulaciones" element={<AccessGuard><Simulaciones_Alumno_comp /></AccessGuard>} />
          <Route path="/simulaciones/tomar/:simId" element={<AccessGuard><Simulacion_Review /></AccessGuard>} />
          <Route path="/simulaciones/tomar/:simId/resultados" element={<AccessGuard><SimulacionResultadosPage /></AccessGuard>} />
          <Route path="/analisis-ia" element={<AccessGuard><AnalisisIAPage /></AccessGuard>} />
          <Route path="/recursos" element={<AccessGuard><Recursos_Alumno_comp /></AccessGuard>} />
          <Route path="/feedback" element={<AccessGuard><Feedback_Alumno_Comp /></AccessGuard>} />
          <Route path="/asistencia" element={<AccessGuard><Asistencia_Alumno_comp /></AccessGuard>} />
          <Route path="/calendario" element={<AccessGuard><Calendar_Alumno_comp /></AccessGuard>} />
          <Route path="mis-pagos" element={<MisPagos_Alumno_comp />} />
          <Route path="/configuracion" element={<Configuracion_Alumno_comp />} />
          <Route path="/logout" element={<CerrarSesion_Alumno_comp />} />
        </Routes>
      </AlumnoLayout>
      {/* Ocultar chat durante exámenes (quizzes y simulaciones) */}
      {!isQuizRoute && !isSimRoute && <ChatFloatingButton />}
    </div>
  );
}