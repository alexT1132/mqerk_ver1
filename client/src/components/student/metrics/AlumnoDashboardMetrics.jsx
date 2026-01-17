import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCourse } from '../../context/CourseContext.jsx';
import { BarChart as MUIBarChart } from '@mui/x-charts/BarChart';

// Componentes extraídos
import ChartModal from './components/ChartModal.jsx';
import MetricCard, { AcademicStatusCard, MonthlyAverageCard } from './components/MetricCard.jsx';
import MetricsGrid from './components/MetricsGrid.jsx';
import PersonalDataSection from './components/PersonalDataSection.jsx';

// Constantes
const reeseProfilePic = "https://placehold.co/128x128/A0AEC0/FFFFFF?text=Foto";

/**
 * Componente AlumnoDashboardMetrics refactorizado
 */
export function AlumnoDashboardMetrics({ userData, metricsData, isLoading = false, showMetrics = false }) {
  const { selectedCourse } = useCourse();
  const { alumno } = useAuth();

  // Estados para modales de gráficos
  const [isMonthlyAverageModalOpen, setIsMonthlyAverageModalOpen] = useState(false);

  // Helper to build absolute URL for stored photos
  const host = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname : 'localhost';
  const apiUrl = (import.meta?.env?.VITE_API_URL) || `http://${host}:1002/api`;
  const apiOrigin = apiUrl.replace(/\/api\/?$/, '');
  const buildStaticUrl = (p) => {
    if (!p) return reeseProfilePic;
    if (/^https?:\/\//i.test(p)) return p;
    return `${apiOrigin}${p.startsWith('/') ? '' : '/'}${p}`;
  };

  // Map alumno from AuthContext into userData shape
  const alumnoUserData = alumno ? {
    name: `${alumno.nombre || ''} ${alumno.apellidos || ''}`.trim() || '',
    email: alumno.email || '',
    telefono: alumno.telefono || '',
    comunidad: alumno.comunidad1 || '',
    telTutor: alumno.tel_tutor || '',
    nombreTutor: alumno.nombre_tutor || '',
    folio: alumno.folio || '',
    profilePic: buildStaticUrl(alumno.foto) || reeseProfilePic,
  } : {};

  // Fusionar los datos
  const mergedMetricsData = useMemo(() => {
    if (metricsData) {
      return metricsData;
    }
    return {
      attendance: null,
      activities: { current: 0, total: 0 },
      quiz: { current: 0, total: 0 },
      monthlyAverage: 0,
      monthlyAverageData: [],
      activityProgress: [],
      feedbackScore: 0,
      subjectResults: { total: 0, subjects: [] },
      simulatorGrades: [],
    };
  }, [metricsData]);

  // Determinar si estamos cargando
  const isActuallyLoading = isLoading;

  // Si hay un curso seleccionado, usar sus datos simulados
  const currentMetricsData = useMemo(() => {
    if (selectedCourse?.metricas) {
      return {
        ...mergedMetricsData,
        monthlyAverage: selectedCourse.metricas.promedio || mergedMetricsData.monthlyAverage,
        activities: {
          ...mergedMetricsData.activities,
          current: (() => {
            const avanceNum = Number.parseInt(selectedCourse.metricas.avance, 10);
            const avance = Number.isFinite(avanceNum) ? avanceNum : 0;
            return Math.floor((avance / 100) * mergedMetricsData.activities.total);
          })()
        }
      };
    }
    return mergedMetricsData;
  }, [selectedCourse, mergedMetricsData]);

  // Calcular el estado académico
  const calculateAcademicStatus = (metrics) => {
    const { attendance, monthlyAverage, activities, quiz } = metrics;
    const activityProgress = activities?.total ? (activities.current / activities.total) * 100 : 0;
    const quizProgress = quiz?.total ? (quiz.current / quiz.total) * 100 : 0;
    const overallScore = (attendance * 0.2 + monthlyAverage * 0.4 + activityProgress * 0.2 + quizProgress * 0.2);

    if (overallScore >= 85) {
      return { level: 'D', color: 'green', description: 'Destacado', score: overallScore };
    } else if (overallScore >= 65) {
      return { level: 'A', color: 'yellow', description: 'Activo', score: overallScore };
    } else {
      return { level: 'R', color: 'red', description: 'Riesgo', score: overallScore };
    }
  };

  const calculatedAcademicStatus = useMemo(() => calculateAcademicStatus(currentMetricsData), [
    currentMetricsData.attendance,
    currentMetricsData.monthlyAverage,
    currentMetricsData.activities?.current,
    currentMetricsData.activities?.total,
    currentMetricsData.quiz?.current,
    currentMetricsData.quiz?.total,
  ]);

  const currentMetricsWithStatus = useMemo(() => ({
    ...currentMetricsData,
    academicStatus: calculatedAcademicStatus,
  }), [currentMetricsData, calculatedAcademicStatus]);

  // Fusiona: alumno (Auth) <- props (override)
  const currentUserData = {
    name: '',
    email: '',
    telefono: '',
    comunidad: '',
    telTutor: '',
    nombreTutor: '',
    folio: '',
    profilePic: reeseProfilePic,
    ...alumnoUserData,
    ...userData
  };

  const buildCourseCode = () => 'MEEAU';
  const onlyDigits = (v) => typeof v === 'string' ? /^\d+$/.test(v) : (typeof v === 'number' && Number.isFinite(v));
  const seqNum = onlyDigits(currentUserData.folio) ? parseInt(currentUserData.folio, 10) : null;
  const yy = String((alumno?.anio && Number(alumno?.anio)) ? Number(alumno.anio) : new Date().getFullYear()).slice(-2);
  const displayFolio = seqNum != null
    ? `${buildCourseCode()}${yy}-${String(seqNum).padStart(4, '0')}`
    : currentUserData.folio;

  // Datos finales
  const finalMetricsData = useMemo(() => currentMetricsWithStatus, [currentMetricsWithStatus]);

  // --- Renderizado Condicional: Estado de Carga ---
  if (isActuallyLoading) {
    return (
      <div className="p-4 sm:p-6 text-center text-gray-600 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium">Cargando datos del dashboard...</p>
        </div>
      </div>
    );
  }

  // Si solo queremos mostrar foto + nombre + datos personales
  if (!showMetrics) {
    return (
      <div className="w-full font-inter text-gray-800">
        {/* Sección de Encabezado del Dashboard */}
        <div className="flex flex-col items-center md:flex-row md:items-start md:justify-between mb-6 pb-4 border-b-2 border-gradient-to-r from-blue-200 to-purple-200">
          <h2 className="text-3xl xs:text-4xl sm:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 md:mb-0">
            DASHBOARD
          </h2>
          <div className="bg-white rounded-full px-3 xs:px-4 sm:px-6 py-1.5 xs:py-2 sm:py-3 shadow-lg border border-gray-200">
            <span className="text-xs xs:text-sm sm:text-base font-bold text-gray-700">
              Folio: <span className="text-blue-600">{displayFolio}</span>
            </span>
          </div>
        </div>

        {/* Sección de Información del Usuario */}
        <PersonalDataSection 
          userData={currentUserData} 
          displayFolio={displayFolio} 
          reeseProfilePic={reeseProfilePic} 
        />
      </div>
    );
  }

  return (
    <div className="w-full font-inter text-gray-800 pt-4 sm:pt-6">
      {/* Sección de Encabezado del Dashboard */}
      <div className="flex flex-col items-center md:flex-row md:items-start md:justify-between mb-6 pb-4 border-b-2 border-gradient-to-r from-blue-200 to-purple-200">
        <h2 className="text-3xl xs:text-4xl sm:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 md:mb-0">
          DASHBOARD
        </h2>
        <div className="bg-white rounded-full px-3 xs:px-4 sm:px-6 py-1.5 xs:py-2 sm:py-3 shadow-lg border border-gray-200">
          <span className="text-xs xs:text-sm sm:text-base font-bold text-gray-700">
            Folio: <span className="text-blue-600">{displayFolio}</span>
          </span>
        </div>
      </div>

      {/* Sección de Información del Usuario - Colapsable */}
      <PersonalDataSection 
        userData={currentUserData} 
        displayFolio={displayFolio} 
        reeseProfilePic={reeseProfilePic} 
      />

      {/* Sección "TU STATUS MENSUAL" */}
      <div className="text-center mb-6 mt-8">
        <div className="inline-block bg-white rounded-full px-6 xs:px-8 py-3 xs:py-4 shadow-xl border border-gray-200">
          <h2 className="text-xl xs:text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            TU STATUS MENSUAL
          </h2>
        </div>
      </div>

      {/* Primera fila de métricas usando MetricsGrid */}
      <MetricsGrid 
        metricsData={finalMetricsData}
        onMonthlyAverageClick={() => setIsMonthlyAverageModalOpen(true)}
      />

      {/* Modal para el Gráfico de Promedio Mensual */}
      <ChartModal
        isOpen={isMonthlyAverageModalOpen}
        onClose={() => setIsMonthlyAverageModalOpen(false)}
        title="Evolución del Promedio Mensual - Últimos 12 Meses"
        maxWidth="max-w-3xl"
      >
        <div className="bg-white rounded-xl p-4 shadow-lg">
          <div className="mb-2">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-200 flex items-center justify-between">
              <div>
                <div className="text-sm text-blue-600 font-semibold mb-0">Promedio General</div>
                <div className="text-xs text-blue-500 mt-0">
                  Basado en {finalMetricsData.monthlyAverageData?.length || 0} meses de datos
                </div>
              </div>
              <div className="text-3xl font-bold text-blue-700">
                {finalMetricsData.monthlyAverage}%
              </div>
            </div>
          </div>
          <div className="w-full flex items-center justify-center bg-white rounded-lg p-1 overflow-hidden">
            <MUIBarChart
              width={typeof window !== 'undefined' ? Math.min(600, window.innerWidth - 48) : 300}
              height={250}
              dataset={finalMetricsData.monthlyAverageData || []}
              xAxis={[{
                scaleType: 'band',
                dataKey: 'month',
                label: 'Meses',
                labelStyle: { fontSize: 12, fill: '#6b7280' },
                tickLabelStyle: { fontSize: 10, angle: -45, textAnchor: 'end' }
              }]}
              yAxis={[{
                label: 'Promedio (%)',
                min: 0,
                max: 100,
                labelStyle: { fontSize: 12, fill: '#6b7280' },
                tickLabelStyle: { fontSize: 10 }
              }]}
              series={[
                {
                  dataKey: 'promedio',
                  label: 'Promedio Mensual',
                  color: '#3b82f6'
                }
              ]}
              margin={{ left: 50, right: 10, top: 20, bottom: 60 }}
              sx={{
                '& .MuiChartsAxis-line': {
                  stroke: '#6b7280',
                  strokeWidth: 2,
                },
                '& .MuiChartsAxis-tick': {
                  stroke: '#6b7280',
                },
                '& .MuiChartsAxis-tickLabel': {
                  fill: '#374151',
                  fontSize: '10px',
                  fontWeight: 500,
                },
                '& .MuiChartsLegend-label': {
                  fill: '#374151',
                  fontSize: '12px',
                  fontWeight: 600,
                },
                '& .MuiChartsBar-root': {
                  rx: 6,
                }
              }}
            />
          </div>
        </div>
      </ChartModal>
    </div>
  );
}

export default AlumnoDashboardMetrics;