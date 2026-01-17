import React from 'react';
import MetricCard, { AcademicStatusCard, MonthlyAverageCard } from './MetricCard.jsx';

/**
 * Componente MetricsGrid
 * Renderiza la primera fila de métricas (5 columnas) del dashboard del estudiante.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {Object} props.metricsData - Datos de métricas del estudiante.
 * @param {Function} props.onOpenMonthlyAverageModal - Función para abrir modal de promedio mensual.
 */
export default function MetricsGrid({ metricsData, onOpenMonthlyAverageModal }) {
  const {
    attendance,
    attendanceData,
    activities,
    quiz,
    monthlyAverage,
    monthlyAverageData,
    academicStatus
  } = metricsData || {};

  // Calcular si hay datos para mostrar gráfico de promedio mensual
  const hasMonthlyData = monthlyAverageData &&
    monthlyAverageData.length > 0 &&
    monthlyAverageData.some(item => item.promedio > 0);

  // Determinar si hay datos de asistencia
  const hasAttendanceData = attendance !== null && attendance !== undefined;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 md:gap-8 lg:gap-12 mb-16 max-w-8xl mx-auto">
      
      {/* Métrica de Asistencia */}
      <MetricCard
        title="Asistencia"
        subtitle="Este mes"
        value={hasAttendanceData ? Math.round(attendance) : '—'}
        valueSuffix={hasAttendanceData ? '%' : ''}
        icon={
          <svg fill="currentColor" viewBox="0 0 24 24" className="animate-pulse">
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
          </svg>
        }
        bgColor="from-blue-600 via-cyan-600 to-teal-600"
        color="from-blue-600 to-cyan-600"
        hasProgressBar={hasAttendanceData}
        percentage={hasAttendanceData ? attendance : 0}
        hasData={hasAttendanceData}
        tooltip="Porcentaje de días asistidos en el mes actual"
        onClick={null}
      >
        {hasAttendanceData && attendanceData && (
          <div className="text-sm text-white/90 font-bold drop-shadow-md mt-2">
            {attendanceData.asistidas} de {attendanceData.total} días
          </div>
        )}
      </MetricCard>

      {/* Métrica de Actividades */}
      <MetricCard
        title="Actividades"
        subtitle="Curso actual"
        value={activities?.current || 0}
        valueSuffix={`/${activities?.total || 0}`}
        icon={
          <svg fill="currentColor" viewBox="0 0 24 24" className="animate-pulse">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        }
        bgColor="from-orange-600 via-amber-600 to-yellow-600"
        color="from-orange-600 to-amber-600"
        hasProgressBar={activities?.total > 0}
        percentage={activities?.total > 0 ? (activities.current / activities.total) * 100 : 0}
        hasData={activities?.total > 0}
        tooltip="Progreso en actividades del curso actual"
        onClick={null}
      >
        {activities?.total > 0 && (
          <div className="text-xs sm:text-sm text-white/90 font-bold drop-shadow-md mt-2">
            {Math.round((activities.current / activities.total) * 100)}%
          </div>
        )}
      </MetricCard>

      {/* Métrica de Quiz */}
      <MetricCard
        title="Quiz"
        subtitle="Evaluaciones"
        value={quiz?.total > 0 ? Math.round((quiz.current / quiz.total) * 100) : 0}
        valueSuffix={quiz?.total > 0 ? '%' : ''}
        icon={
          <svg fill="currentColor" viewBox="0 0 24 24" className="animate-pulse">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        }
        bgColor="from-green-600 via-emerald-600 to-teal-600"
        color="from-green-600 to-emerald-600"
        hasProgressBar={quiz?.total > 0}
        percentage={quiz?.total > 0 ? (quiz.current / quiz.total) * 100 : 0}
        hasData={quiz?.total > 0}
        tooltip="Porcentaje de quizzes aprobados"
        onClick={null}
      >
        {quiz?.total > 0 && (
          <>
            <div className="text-xs sm:text-sm font-bold drop-shadow-md mt-2">
              {quiz.current} de {quiz.total}
            </div>
            <div className="text-xs text-white/90 mt-1">
              aprobados
            </div>
          </>
        )}
      </MetricCard>

      {/* Métrica de Promedio Mensual */}
      <MonthlyAverageCard
        average={monthlyAverage || 0}
        monthlyData={monthlyAverageData || []}
        onClick={onOpenMonthlyAverageModal}
        hasData={hasMonthlyData}
      />

      {/* Métrica de Estado Académico */}
      <AcademicStatusCard
        level={academicStatus?.level || 'A'}
        description={academicStatus?.description || 'Activo'}
        score={academicStatus?.score || 0}
        color={academicStatus?.color || 'yellow'}
        onClick={null}
      />
    </div>
  );
}