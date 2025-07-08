// src/components/test.jsx
// Panel de Testing para el Dashboard de Alumno
// Este componente te permite probar todos los estados y navegación del dashboard
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudent } from '../context/StudentContext.jsx';
import { useCourse } from '../context/CourseContext.jsx';

const AlumnoTestPanel = () => {
  const navigate = useNavigate();
  const { 
    isVerified, 
    hasPaid, 
    currentCourse, 
    isFirstAccess, 
    activeSection,
    studentData,
    simulateVerification,
    resetStudentState,
    clearCourse,
    forceCompleteReset,
    goToStart,
    setIsVerified,
    setHasPaid,
    setIsFirstAccess,
    setActiveSection,
    selectCourse
  } = useStudent();

  const { courses } = useCourse();

  // Curso de prueba para testing
  const testCourse = {
    id: 'test-course-001',
    title: 'Curso de Prueba - Matemáticas Avanzadas',
    instructor: 'Prof. Testing',
    image: 'https://placehold.co/400x200/4f46e5/ffffff?text=Matematicas',
    category: 'exactas',
    type: 'curso',
    isActive: true,
    metadata: [
      { icon: 'reloj', text: '12 semanas' },
      { icon: 'libro', text: '24 lecciones' },
      { icon: 'estudiante', text: '150 estudiantes' }
    ]
  };

  // Estados de testing
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-200">
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent text-center mb-4">
            🧪 PANEL DE TESTING - DASHBOARD ALUMNO
          </h1>
          <p className="text-center text-gray-600">
            Prueba todos los estados y navegación del dashboard
          </p>
        </div>

        {/* Estado Actual */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Estado Actual</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-3 rounded-lg text-center ${isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <div className="font-semibold">Verificado</div>
              <div className="text-sm">{isVerified ? '✅ Sí' : '❌ No'}</div>
            </div>
            <div className={`p-3 rounded-lg text-center ${hasPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <div className="font-semibold">Pagado</div>
              <div className="text-sm">{hasPaid ? '✅ Sí' : '❌ No'}</div>
            </div>
            <div className={`p-3 rounded-lg text-center ${currentCourse ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
              <div className="font-semibold">Curso Actual</div>
              <div className="text-xs">{currentCourse ? currentCourse.title.substring(0, 20) + '...' : 'Ninguno'}</div>
            </div>
            <div className={`p-3 rounded-lg text-center ${isFirstAccess ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
              <div className="font-semibold">Primer Acceso</div>
              <div className="text-sm">{isFirstAccess ? '🆕 Sí' : '🔄 No'}</div>
            </div>
          </div>
          {activeSection && (
            <div className="mt-4 p-3 bg-purple-100 text-purple-800 rounded-lg text-center">
              <strong>Sección Activa:</strong> {activeSection}
            </div>
          )}
        </div>

        {/* Navegación Rápida */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🚀 Navegación Rápida</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => navigate('/alumno/')}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all text-sm font-semibold"
            >
              🏠 Inicio
            </button>
            <button
              onClick={() => navigate('/alumno/cursos')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm font-semibold"
            >
              📚 Mis Cursos
            </button>
            <button
              onClick={() => navigate('/alumno/dashboard')}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all text-sm font-semibold"
            >
              📈 Dashboard
            </button>
            <button
              onClick={() => navigate('/alumno/mi-perfil')}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all text-sm font-semibold"
            >
              👤 Perfil
            </button>
            <button
              onClick={() => navigate('/alumno/calendario')}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm font-semibold"
            >
              📅 Calendario
            </button>
            <button
              onClick={() => navigate('/alumno/feedback')}
              className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-all text-sm font-semibold"
            >
              💬 Feedback
            </button>
            <button
              onClick={() => navigate('/alumno/asistencia')}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all text-sm font-semibold"
            >
              ✅ Asistencia
            </button>
            <button
              onClick={() => navigate('/alumno/mis-pagos')}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all text-sm font-semibold"
            >
              💳 Pagos
            </button>
            <button
              onClick={() => navigate('/alumno/actividades')}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all text-sm font-semibold"
            >
              📝 Actividades
            </button>
            <button
              onClick={() => navigate('/alumno/simulaciones')}
              className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-all text-sm font-semibold"
            >
              🎯 Simulaciones
            </button>
            <button
              onClick={() => navigate('/alumno/configuracion')}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all text-sm font-semibold"
            >
              ⚙️ Configuración
            </button>
          </div>
        </div>

        {/* Controles de Estado */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">⚙️ Controles de Estado</h2>
          
          {/* Controles Básicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700">Estado de Verificación</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsVerified(true)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isVerified ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-green-100'
                  }`}
                >
                  ✅ Verificar
                </button>
                <button
                  onClick={() => setIsVerified(false)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    !isVerified ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-red-100'
                  }`}
                >
                  ❌ No Verificar
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700">Estado de Pago</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setHasPaid(true)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    hasPaid ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-green-100'
                  }`}
                >
                  💰 Pagado
                </button>
                <button
                  onClick={() => setHasPaid(false)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    !hasPaid ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-red-100'
                  }`}
                >
                  🚫 No Pagado
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700">Primer Acceso</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsFirstAccess(true)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isFirstAccess ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-yellow-100'
                  }`}
                >
                  🆕 Primer Acceso
                </button>
                <button
                  onClick={() => setIsFirstAccess(false)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    !isFirstAccess ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-blue-100'
                  }`}
                >
                  🔄 Acceso Recurrente
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700">Curso de Prueba</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => selectCourse(testCourse.id)}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm font-semibold"
                >
                  📖 Asignar Curso
                </button>
                <button
                  onClick={clearCourse}
                  className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all text-sm font-semibold"
                >
                  🗑️ Limpiar Curso
                </button>
              </div>
            </div>
          </div>

          {/* Botón para controles avanzados */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold"
          >
            {showAdvanced ? '🔼 Ocultar Controles Avanzados' : '🔽 Mostrar Controles Avanzados'}
          </button>

          {/* Controles Avanzados */}
          {showAdvanced && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-4">Controles Avanzados</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={simulateVerification}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm font-semibold"
                >
                  🚀 Verificación Completa
                </button>
                <button
                  onClick={resetStudentState}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all text-sm font-semibold"
                >
                  🔄 Reset Estado
                </button>
                <button
                  onClick={forceCompleteReset}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm font-semibold"
                >
                  💥 Reset Completo
                </button>
                <button
                  onClick={goToStart}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all text-sm font-semibold"
                >
                  🏠 Forzar Inicio
                </button>
                <button
                  onClick={() => setActiveSection('inicio')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all text-sm font-semibold"
                >
                  📊 Activar Métricas
                </button>
                <button
                  onClick={() => setActiveSection(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all text-sm font-semibold"
                >
                  🚫 Desactivar Sección
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Escenarios Predefinidos */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🎭 Escenarios Predefinidos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => {
                setIsVerified(false);
                setHasPaid(false);
                setIsFirstAccess(true);
                clearCourse();
                setActiveSection(null);
                navigate('/alumno/');
              }}
              className="p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-all text-left"
            >
              <div className="font-semibold text-red-800">🚨 Estudiante Nuevo (Sin Pagar)</div>
              <div className="text-sm text-red-600">No verificado, no pagado, primer acceso</div>
            </button>

            <button
              onClick={() => {
                setIsVerified(true);
                setHasPaid(true);
                setIsFirstAccess(false);
                clearCourse();
                setActiveSection(null);
                navigate('/alumno/');
              }}
              className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-all text-left"
            >
              <div className="font-semibold text-green-800">✅ Estudiante Verificado (Sin Curso)</div>
              <div className="text-sm text-green-600">Verificado, pagado, sin curso seleccionado</div>
            </button>

            <button
              onClick={() => {
                setIsVerified(true);
                setHasPaid(true);
                setIsFirstAccess(false);
                selectCourse(testCourse.id);
                setActiveSection(null);
                navigate('/alumno/');
              }}
              className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-all text-left"
            >
              <div className="font-semibold text-blue-800">📚 Estudiante Activo (Con Curso)</div>
              <div className="text-sm text-blue-600">Verificado, pagado, con curso seleccionado</div>
            </button>

            <button
              onClick={() => {
                setIsVerified(true);
                setHasPaid(true);
                setIsFirstAccess(false);
                selectCourse(testCourse.id);
                setActiveSection('inicio');
                navigate('/alumno/');
              }}
              className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-all text-left"
            >
              <div className="font-semibold text-purple-800">📊 Estudiante con Métricas</div>
              <div className="text-sm text-purple-600">Todo activo + métricas del dashboard</div>
            </button>
          </div>
        </div>

        {/* Escenarios de Navegación Específicos */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🧭 Pruebas de Navegación Específicas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                setIsVerified(true);
                setHasPaid(true);
                selectCourse(testCourse.id);
                navigate('/alumno/actividades');
              }}
              className="p-4 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-all text-left"
            >
              <div className="font-semibold text-amber-800">📝 Probar Actividades</div>
              <div className="text-sm text-amber-600">Navegar a sección de actividades</div>
            </button>

            <button
              onClick={() => {
                setIsVerified(true);
                setHasPaid(true);
                selectCourse(testCourse.id);
                navigate('/alumno/simulaciones');
              }}
              className="p-4 bg-violet-50 border border-violet-200 rounded-lg hover:bg-violet-100 transition-all text-left"
            >
              <div className="font-semibold text-violet-800">🎯 Probar Simulaciones</div>
              <div className="text-sm text-violet-600">Navegar a sección de simulaciones</div>
            </button>

            <button
              onClick={() => {
                setIsVerified(true);
                setHasPaid(false);
                navigate('/alumno/mis-pagos');
              }}
              className="p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-all text-left"
            >
              <div className="font-semibold text-red-800">💳 Probar Pagos (No Pagado)</div>
              <div className="text-sm text-red-600">Ver estado de comprobante pendiente</div>
            </button>

            <button
              onClick={() => {
                setIsVerified(false);
                navigate('/alumno/mi-perfil');
              }}
              className="p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-all text-left"
            >
              <div className="font-semibold text-orange-800">👤 Probar Perfil (No Verificado)</div>
              <div className="text-sm text-orange-600">Ver perfil sin verificación</div>
            </button>

            <button
              onClick={() => {
                clearCourse();
                navigate('/alumno/cursos');
              }}
              className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-all text-left"
            >
              <div className="font-semibold text-gray-800">📚 Probar Cursos (Sin Curso)</div>
              <div className="text-sm text-gray-600">Ver estado sin cursos asignados</div>
            </button>

            <button
              onClick={() => {
                setIsVerified(true);
                setHasPaid(true);
                selectCourse(testCourse.id);
                navigate('/alumno/dashboard');
              }}
              className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-all text-left"
            >
              <div className="font-semibold text-emerald-800">📈 Probar Dashboard Completo</div>
              <div className="text-sm text-emerald-600">Dashboard con datos completos</div>
            </button>
          </div>
        </div>

        {/* Información de Depuración */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🔍 Debug Info</h2>
          <div className="bg-gray-800 text-green-400 p-4 rounded-lg font-mono text-sm overflow-auto">
            <div>studentData: {JSON.stringify(studentData, null, 2)}</div>
            <div>currentCourse: {JSON.stringify(currentCourse, null, 2)}</div>
            <div>activeSection: "{activeSection}"</div>
            <div>window.location: {window.location.pathname + window.location.search}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumnoTestPanel;
