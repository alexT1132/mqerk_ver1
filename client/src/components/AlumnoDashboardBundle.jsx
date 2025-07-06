// BACKEND: Componente Bundle para el Dashboard de Alumno
// Este archivo maneja las rutas y layout del dashboard, no contiene datos
// Cada componente individual es responsable de obtener sus propios datos del backend
import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

// Layout y contextos principales
import { AlumnoLayout } from './AlumnoLayout.jsx';
import { useStudent } from '../context/StudentContext.jsx';

// Componentes de páginas
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

import { CourseProvider } from '../context/CourseContext.jsx';
import { StudentProvider } from '../context/StudentContext.jsx';

// ==========================================
// COMPONENTES DE PÁGINA
// ==========================================

/**
 * Página de perfil del alumno
 * Maneja la información personal y configuración del estudiante
 */
function AlumnoMiPerfil() {
  return <Profile_Alumno_comp />;
}

/**
 * Página de calendario del alumno
 * Muestra clases programadas, exámenes y eventos importantes
 */
function AlumnoCalendario() {
  return <Calendar_Alumno_comp />;
}

/**
 * Página de cursos del alumno
 * Muestra los cursos inscritos y disponibles
 */
function AlumnoMisCursos() {
  return (
    <MisCursos_Alumno_comp />
  );
}

/**
 * BACKEND: Página de actividades recientes
 * Esta página mostrará el historial de actividades del estudiante
 * Estructura esperada: tareas completadas, exámenes realizados, progreso
 */
function AlumnoActividades() {
  // Actividad de prueba para testing
  const actividadPrueba = {
    id: 1,
    titulo: "Ejercicios de Álgebra Básica",
    descripcion: "Resolver 10 ejercicios sobre ecuaciones lineales",
    tipo: "tarea",
    estado: "pendiente", // pendiente, en_progreso, completada
    fechaVencimiento: "2025-07-10",
    progreso: 30,
    puntos: 100
  };

  const handleIniciarActividad = () => {
    alert("Iniciando actividad: " + actividadPrueba.titulo);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">📋 Actividades</h1>
            <p className="text-blue-100">
              Gestiona tus tareas y sigue tu progreso académico
            </p>
          </div>
          <div className="text-6xl opacity-20">
            📋
          </div>
        </div>
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-md border border-blue-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-blue-600 text-xl">📝</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-blue-600">1</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-md border border-yellow-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-yellow-600 text-xl">⏳</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">En Progreso</p>
              <p className="text-2xl font-bold text-yellow-600">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-md border border-green-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-green-600 text-xl">✅</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Completadas</p>
              <p className="text-2xl font-bold text-green-600">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de actividades */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Actividades Recientes</h2>
        </div>
        
        <div className="p-6">
          {/* Actividad de prueba */}
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">📝</span>
                  <h3 className="text-lg font-semibold text-gray-800">{actividadPrueba.titulo}</h3>
                  <span className="ml-3 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    {actividadPrueba.estado}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-3">{actividadPrueba.descripcion}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>📅 Vence: {actividadPrueba.fechaVencimiento}</span>
                  <span>⭐ {actividadPrueba.puntos} puntos</span>
                </div>

                {/* Barra de progreso */}
                <div className="mt-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progreso</span>
                    <span>{actividadPrueba.progreso}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all" 
                      style={{ width: `${actividadPrueba.progreso}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="ml-4">
                <button
                  onClick={handleIniciarActividad}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm font-semibold"
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>

          {/* Estado vacío para más actividades */}
          <div className="mt-6 text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <div className="text-4xl mb-3">📚</div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Más actividades próximamente
            </h3>
            <p className="text-gray-500 text-sm">
              Las nuevas actividades aparecerán aquí cuando estén disponibles
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * BACKEND: Página de simulaciones
 * Esta página contendrá los simuladores y prácticas del estudiante
 * Estructura esperada: simulacros de exámenes, ejercicios interactivos
 */
function AlumnoSimulaciones() {
  // Simulación de prueba para testing
  const simulacionPrueba = {
    id: 1,
    titulo: "Simulacro de Matemáticas - Nivel Básico",
    descripcion: "Examen de práctica con 15 preguntas sobre álgebra y geometría",
    tipo: "simulacro",
    duracion: "45 min",
    preguntas: 15,
    dificultad: "básico",
    disponible: true
  };

  const handleIniciarSimulacion = () => {
    alert("Iniciando simulación: " + simulacionPrueba.titulo);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 text-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">🎯 Simulaciones</h1>
            <p className="text-violet-100">
              Practica con simulacros y ejercicios interactivos para mejorar tus habilidades
            </p>
          </div>
          <div className="text-6xl opacity-20">
            🎯
          </div>
        </div>
      </div>

      {/* Simulaciones disponibles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Simulacros de Exámenes */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              📊 Simulacros de Exámenes
            </h2>
          </div>
          <div className="p-6">
            {/* Simulacro de prueba */}
            <div className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{simulacionPrueba.titulo}</h3>
                  <p className="text-gray-600 text-sm mb-3">{simulacionPrueba.descripcion}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <span>⏱️ {simulacionPrueba.duracion}</span>
                    <span>❓ {simulacionPrueba.preguntas} preguntas</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      {simulacionPrueba.dificultad}
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleIniciarSimulacion}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm font-semibold"
              >
                Iniciar Simulacro
              </button>
            </div>

            {/* Estado para más simulacros */}
            <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded-lg">
              <div className="text-3xl mb-2">📋</div>
              <p className="text-gray-500 text-sm">Más simulacros próximamente</p>
            </div>
          </div>
        </div>

        {/* Ejercicios Interactivos */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              🎮 Ejercicios Interactivos
            </h2>
          </div>
          <div className="p-6">
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Próximamente disponible
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Los ejercicios interactivos estarán disponibles pronto
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium">
                🔄 En desarrollo
              </div>
            </div>
          </div>
        </div>

        {/* Práctica Libre */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              🔥 Práctica Libre
            </h2>
          </div>
          <div className="p-6">
            <div className="text-center py-8">
              <div className="text-6xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Próximamente disponible
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                El modo de práctica libre estará disponible pronto
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium">
                🔄 En desarrollo
              </div>
            </div>
          </div>
        </div>

        {/* Historial de Simulaciones */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              📈 Historial de Resultados
            </h2>
          </div>
          <div className="p-6">
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Sin historial disponible
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Completa simulaciones para ver tu progreso aquí
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium">
                � Historial vacío
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
        <div className="flex items-start space-x-4">
          <div className="text-3xl">💡</div>
          <div>
            <h3 className="text-lg font-semibold text-indigo-800 mb-2">
              ¿Cómo funcionan las simulaciones?
            </h3>
            <ul className="text-indigo-700 space-y-1 text-sm">
              <li>• <strong>Simulacros de exámenes:</strong> Practica con exámenes similares a los reales</li>
              <li>• <strong>Ejercicios interactivos:</strong> Actividades dinámicas para reforzar conocimientos</li>
              <li>• <strong>Práctica libre:</strong> Modo de estudio personalizado a tu ritmo</li>
              <li>• <strong>Resultados detallados:</strong> Análisis de tu progreso y áreas de mejora</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * BACKEND: Página de Feedback y Soporte
 * Renderiza el componente de feedback del estudiante
 * El componente Feedback_Alumno_Comp maneja su propia integración con el backend
 */
function AlumnoFeedback() {
  return (
    <Feedback_Alumno_Comp />
  );
}

/**
 * BACKEND: Página de Asistencia del Alumno
 * Renderiza el componente que maneja el control de asistencia del estudiante
 * El componente Asistencia_Alumno_comp maneja su propia integración con el backend
 */
function AlumnoAsistencia() {
  return (
    <Asistencia_Alumno_comp />
  );
}

/**
 * BACKEND: Página de Mis Pagos del Alumno
 * Renderiza el componente que maneja los pagos del estudiante
 * El componente MisPagos_Alumno_comp maneja su propia integración con el backend
 */
function AlumnoMisPagos() {
  return (
    <MisPagos_Alumno_comp />
  );
}

/**
 * BACKEND: Página de Configuración del Alumno
 * Renderiza el componente de configuración del estudiante
 * El componente Configuracion_Alumno_comp maneja su propia integración con el backend
 */
function AlumnoConfiguracion() {
  return (
    <Configuracion_Alumno_comp />
  );
}

/**
 * BACKEND: Página de Cerrar Sesión
 * Esta página debe implementar la funcionalidad de logout completa
 * 
 * Funcionalidad requerida:
 * - Llamada a endpoint /api/auth/logout
 * - Limpiar tokens de autenticación
 * - Limpiar datos del usuario en localStorage/sessionStorage
 * - Redirigir a la página de login
 */
function AlumnoCerrarSesion() {
  // BACKEND: Aquí debe ir la lógica de logout
  // useEffect(() => {
  //   const logout = async () => {
  //     try {
  //       await fetch('/api/auth/logout', {
  //         method: 'POST',
  //         headers: {
  //           'Authorization': `Bearer ${localStorage.getItem('token')}`
  //         }
  //       });
  //     } catch (error) {
  //       console.error('Error al cerrar sesión:', error);
  //     }
  //     
  //     // Limpiar datos locales
  //     localStorage.clear();
  //     sessionStorage.clear();
  //     
  //     // Redirigir
  //     navigate('/login');
  //   };
  //   logout();
  // }, []);

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
 * BACKEND: Componente Bundle para el Dashboard de Alumno
 * 
 * RESPONSABILIDAD: 
 * - Manejo de rutas y estructura de layout únicamente
 * - NO maneja datos - cada componente individual obtiene sus propios datos del backend
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
        <Route path="/asistencia" element={<AlumnoAsistencia />} />
        <Route path="/calendario" element={<AlumnoCalendario />} />
        <Route path="/mis-pagos" element={<AlumnoMisPagos />} />
        <Route path="/configuracion" element={<AlumnoConfiguracion />} />
        <Route path="/test-panel" element={<AlumnoTestPanel />} />
        <Route path="/logout" element={<AlumnoCerrarSesion />} />
      </Routes>
    </AlumnoLayout>
  );
}
