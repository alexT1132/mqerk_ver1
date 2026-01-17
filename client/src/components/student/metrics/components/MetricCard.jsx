import React from 'react';

/**
 * Componente MetricCard - Tarjeta reutilizable para mostrar métricas individuales
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.title - Título de la métrica
 * @param {string} props.subtitle - Subtítulo o descripción
 * @param {number|string} props.value - Valor principal de la métrica
 * @param {number|string} props.secondaryValue - Valor secundario (opcional)
 * @param {number} props.percentage - Porcentaje para la barra de progreso (0-100)
 * @param {string} props.icon - Icono SVG o componente React
 * @param {string} props.color - Color principal (gradiente)
 * @param {string} props.bgColor - Color de fondo (gradiente)
 * @param {boolean} props.hasProgressBar - Si muestra barra de progreso
 * @param {string} props.progressLabel - Etiqueta para la barra de progreso
 * @param {function} props.onClick - Función al hacer clic
 * @param {string} props.tooltip - Texto del tooltip
 * @param {boolean} props.isLoading - Estado de carga
 * @param {boolean} props.hasData - Si tiene datos válidos
 */
const MetricCard = ({
  title = 'Métrica',
  subtitle = 'Descripción',
  value = '—',
  secondaryValue = null,
  percentage = 0,
  icon = null,
  color = 'from-blue-600 to-cyan-600',
  bgColor = 'from-blue-600 via-cyan-600 to-teal-600',
  hasProgressBar = false,
  progressLabel = null,
  onClick = null,
  tooltip = '',
  isLoading = false,
  hasData = true,
  className = '',
  children
}) => {
  // Determinar si es clickeable
  const isClickable = !!onClick;
  
  // Manejar clic
  const handleClick = () => {
    if (onClick && !isLoading) {
      onClick();
    }
  };

  // Renderizar contenido de carga
  if (isLoading) {
    return (
      <div className={`flex flex-col items-center group transition-all duration-300 ${className}`}>
        <div className="relative mb-6">
          <div className={`relative w-36 h-36 sm:w-40 sm:h-40 lg:w-44 lg:h-44 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 rounded-3xl flex flex-col items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 p-4 sm:p-5 backdrop-blur-sm animate-pulse`}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gray-400 rounded-full mb-2 sm:mb-3"></div>
            <div className="text-center mb-3">
              <div className="text-3xl font-black text-gray-400 mb-1">—</div>
              <div className="text-sm text-gray-400 font-bold">Cargando...</div>
            </div>
            {hasProgressBar && (
              <div className="w-full h-3 bg-white/20 backdrop-blur-sm rounded-full overflow-hidden border border-white/30">
                <div className="h-full bg-gray-300 rounded-full w-1/2"></div>
              </div>
            )}
          </div>
        </div>
        <h3 className="text-gray-800 font-black text-base sm:text-lg lg:text-xl mb-2 bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent">
          {title}
        </h3>
        <p className="text-sm text-gray-600 text-center font-semibold">
          {subtitle}
        </p>
      </div>
    );
  }

  // Renderizar sin datos
  if (!hasData) {
    return (
      <div className={`flex flex-col items-center group transition-all duration-300 ${className}`}>
        <div className="relative mb-6">
          <div className={`relative w-36 h-36 sm:w-40 sm:h-40 lg:w-44 lg:h-44 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 rounded-3xl flex flex-col items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 p-4 sm:p-5 backdrop-blur-sm`}>
            {icon && (
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white mb-2 sm:mb-3 drop-shadow-lg">
                {icon}
              </div>
            )}
            <div className="text-center mb-3">
              <div className="text-2xl font-black text-gray-400 mb-1">
                —
              </div>
              <div className="text-xs text-gray-400 font-bold">
                Sin datos
              </div>
            </div>
            {hasProgressBar && (
              <div className="w-full h-3 bg-white/20 backdrop-blur-sm rounded-full overflow-hidden border border-white/30">
                <div className="h-full bg-gray-300 rounded-full w-0"></div>
              </div>
            )}
          </div>
        </div>
        <h3 className="text-gray-800 font-black text-base sm:text-lg lg:text-xl mb-2 bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent">
          {title}
        </h3>
        <p className="text-sm text-gray-600 text-center font-semibold">
          {subtitle}
        </p>
      </div>
    );
  }

  // Renderizar contenido normal
  return (
    <div
      className={`flex flex-col items-center group transition-all duration-300 ${isClickable ? 'cursor-pointer' : ''} ${className}`}
      onClick={handleClick}
      title={tooltip}
    >
      <div className={`relative mb-6 ${isClickable ? 'group-hover:scale-110 group-hover:-translate-y-2' : ''} transition-all duration-500`}>
        {/* Tarjeta principal con gradiente */}
        <div className={`relative w-36 h-36 sm:w-40 sm:h-40 lg:w-44 lg:h-44 bg-gradient-to-br ${bgColor} rounded-3xl flex flex-col items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] ${isClickable ? 'group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)]' : ''} border border-white/20 p-4 sm:p-5 backdrop-blur-sm transition-all duration-500`}>
          
          {/* Icono animado */}
          {icon && (
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white mb-2 sm:mb-3 drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
              {icon}
            </div>
          )}

          {/* Información principal */}
          <div className="text-center mb-3">
            <div className="text-3xl font-black text-white mb-1 drop-shadow-lg">
              {value}
            </div>
            {secondaryValue && (
              <div className="text-sm text-white/90 font-bold drop-shadow-md">
                {secondaryValue}
              </div>
            )}
            {progressLabel && (
              <div className="text-xs text-white/80 mt-1">
                {progressLabel}
              </div>
            )}
          </div>

          {/* Barra de progreso */}
          {hasProgressBar && (
            <div className="w-full h-3 bg-white/20 backdrop-blur-sm rounded-full overflow-hidden border border-white/30">
              <div
                className="h-full bg-gradient-to-r from-white via-white/90 to-white rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
              ></div>
            </div>
          )}

          {/* Contenido adicional personalizado */}
          {children}
        </div>
      </div>

      {/* Título con gradiente */}
      <h3 className={`text-gray-800 font-black text-base sm:text-lg lg:text-xl mb-2 bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
        {title}
      </h3>
      <p className="text-sm text-gray-600 text-center font-semibold">
        {subtitle}
      </p>
    </div>
  );
};

/**
 * Componente MetricCard para estado académico (especializado)
 */
export const AcademicStatusCard = ({
  level = 'A',
  description = 'Activo',
  score = 0,
  color = 'yellow',
  onClick = null,
  isLoading = false
}) => {
  const isClickable = !!onClick;
  
  // Mapear colores
  const colorMap = {
    red: {
      bg: 'from-red-600 to-red-700',
      ring: 'ring-red-200',
      text: 'text-red-700',
      gradient: 'from-red-600 to-red-700'
    },
    yellow: {
      bg: 'from-yellow-400 to-yellow-500',
      ring: 'ring-yellow-200',
      text: 'text-yellow-600',
      gradient: 'from-yellow-400 to-yellow-500'
    },
    green: {
      bg: 'from-green-600 to-green-700',
      ring: 'ring-green-200',
      text: 'text-green-700',
      gradient: 'from-green-600 to-green-700'
    }
  };

  const colors = colorMap[color] || colorMap.yellow;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center group cursor-pointer transform hover:scale-105 transition-all duration-200">
        <div className="relative mb-10">
          <div className="relative w-36 h-36 sm:w-40 sm:h-40 lg:w-48 lg:h-48 bg-gradient-to-br from-gray-50 via-slate-100 to-gray-200 rounded-3xl shadow-2xl border-2 border-gray-300 p-6 sm:p-8 backdrop-blur-sm bg-white/25 border border-white/20 animate-pulse">
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto rounded-full bg-gray-300 mb-3 sm:mb-4"></div>
              <div className="text-base sm:text-lg font-black text-gray-400">Cargando...</div>
              <div className="text-sm text-gray-500 mt-1">—%</div>
            </div>
          </div>
        </div>
        <h3 className="text-gray-700 font-bold text-base sm:text-lg lg:text-xl mb-2 sm:mb-3">
          Estado académico
        </h3>
        <p className="text-base text-gray-500 text-center leading-relaxed">
          Evaluación actual
        </p>
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col items-center group cursor-pointer transform hover:scale-105 transition-all duration-200"
      onClick={onClick}
    >
      <div className="relative mb-10">
        {/* Contenedor principal */}
        <div className={`relative w-36 h-36 sm:w-40 sm:h-40 lg:w-48 lg:h-48 bg-gradient-to-br from-gray-50 via-slate-100 to-gray-200 rounded-3xl shadow-2xl group-hover:shadow-3xl group-hover:scale-105 transition-all duration-200 border-2 border-gray-300 p-6 sm:p-8 backdrop-blur-sm bg-white/25 border border-white/20 hover:scale-105 hover:-translate-y-1`}>

          {/* Estado actual destacado */}
          <div className="text-center mb-4 sm:mb-6">
            <div className={`w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto rounded-full flex items-center justify-center shadow-xl ring-4 sm:ring-6 lg:ring-8 mb-3 sm:mb-4 transition-all duration-200 animate-pulse drop-shadow-lg ${colors.bg} ${colors.ring} group-hover:ring-8 sm:group-hover:ring-10 lg:group-hover:ring-12 group-hover:shadow-2xl`}>
              <span className="text-white font-black text-xl sm:text-2xl lg:text-3xl drop-shadow-sm">
                {level}
              </span>
            </div>
            <div className={`text-base sm:text-lg font-black ${colors.text}`}>
              {description}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Puntaje: {Math.round(score)}%
            </div>
          </div>

          {/* Indicadores pequeños de otros estados */}
          <div className="flex justify-center space-x-3">
            {[
              { level: 'R', name: 'Riesgo', color: 'bg-red-600' },
              { level: 'A', name: 'Activo', color: 'bg-yellow-400' },
              { level: 'D', name: 'Destacado', color: 'bg-green-600' }
            ].map((status) => (
              <div
                key={status.level}
                className={`w-6 h-6 rounded-full cursor-help transition-all duration-150 ${level === status.level ? 'opacity-100 scale-110' : 'opacity-40 hover:opacity-70'} ${status.color}`}
                title={`${status.name}`}
              ></div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Título */}
      <h3 className="text-gray-700 font-bold text-base sm:text-lg lg:text-xl mb-2 sm:mb-3 group-hover:text-gray-800 transition-colors duration-200">
        Estado académico
      </h3>
      <p className="text-base text-gray-500 text-center leading-relaxed">
        Evaluación actual
      </p>
      
      {/* Tooltip informativo */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute z-10 -mt-2 bg-gray-800 text-white text-xs rounded-lg p-3 pointer-events-none max-w-xs">
        <div className="font-bold mb-1">{description}</div>
        <div>Puntaje: {Math.round(score)}%</div>
        <div className="mt-1 text-gray-300">
          {level === 'R' && 'Se recomienda apoyo adicional'}
          {level === 'A' && 'Mantén tu ritmo de estudio'}
          {level === 'D' && '¡Excelente desempeño!'}
        </div>
      </div>
    </div>
  );
};

/**
 * Componente MetricCard para promedio mensual con gráfico
 */
export const MonthlyAverageCard = ({
  average = 0,
  monthlyData = [],
  onClick = null,
  isLoading = false,
  hasData = true
}) => {
  const isClickable = !!onClick;
  const hasMonthlyData = monthlyData && monthlyData.length > 0 && monthlyData.some(item => item.promedio > 0);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center group cursor-pointer transition-all duration-150">
        <div className="relative mb-6 group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500">
          <div className="relative w-36 h-36 sm:w-40 sm:h-40 lg:w-44 lg:h-44 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 p-4 sm:p-5 flex flex-col items-center justify-center backdrop-blur-sm animate-pulse">
            <div className="flex items-center justify-center mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 mr-1 sm:mr-2"></div>
              <span className="text-2xl sm:text-3xl font-black text-gray-400">—</span>
            </div>
            <div className="flex items-center justify-center h-12 mb-2">
              <span className="text-xs text-gray-400">Cargando...</span>
            </div>
          </div>
        </div>
        <h3 className="text-gray-800 font-black text-base sm:text-lg lg:text-xl mb-2 bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent">
          Promedio mensual
        </h3>
        <p className="text-sm text-gray-600 text-center font-semibold">
          Tendencia histórica
        </p>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="flex flex-col items-center group cursor-pointer transition-all duration-150">
        <div className="relative mb-6 group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500">
          <div className="relative w-36 h-36 sm:w-40 sm:h-40 lg:w-44 lg:h-44 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 p-4 sm:p-5 flex flex-col items-center justify-center backdrop-blur-sm">
            <div className="flex items-center justify-center mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 mr-1 sm:mr-2">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 6l2.3 2.3-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
                </svg>
              </div>
              <span className="text-2xl sm:text-3xl font-black text-gray-400">—</span>
            </div>
            <div className="flex items-center justify-center h-12 mb-2">
              <span className="text-xs text-gray-400">Sin datos</span>
            </div>
          </div>
        </div>
        <h3 className="text-gray-800 font-black text-base sm:text-lg lg:text-xl mb-2 bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent">
          Promedio mensual
        </h3>
        <p className="text-sm text-gray-600 text-center font-semibold">
          Tendencia histórica
        </p>
      </div>
    );
  }

  // Renderizar con datos
  return (
    <div
      className="flex flex-col items-center group cursor-pointer transition-all duration-150"
      title="Haz clic para ver el gráfico detallado de tu promedio mensual"
      onClick={onClick}
    >
      <div className="relative mb-6 group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500">
        {/* Contenedor del gráfico visual con gradiente */}
        <div className="relative w-36 h-36 sm:w-40 sm:h-40 lg:w-44 lg:h-44 bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] group-hover:shadow-[0_20px_60px_rgba(139,92,246,0.5)] border border-white/20 p-4 sm:p-5 flex flex-col items-center justify-center backdrop-blur-sm transition-all duration-500">

          {/* Header del gráfico con icono animado */}
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 text-white mr-1 sm:mr-2 drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg fill="currentColor" viewBox="0 0 24 24" className="animate-pulse">
                <path d="M16 6l2.3 2.3-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
              </svg>
            </div>
            <span className="text-2xl sm:text-3xl font-black text-white drop-shadow-lg">
              {average > 0 ? `${Math.round(average)}%` : '—'}
            </span>
          </div>

          {/* Gráfico de barras simplificado */}
          {hasMonthlyData ? (
            <div className="flex items-end justify-center space-x-1 h-12 mb-2">
              {monthlyData.slice(-5).map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className="w-3 bg-gradient-to-t from-blue-400 to-purple-500 rounded-t-sm"
                    style={{ height: `${Math.max(4, (item.promedio / 100) * 40)}px` }}
                  ></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-12 mb-2">
              <span className="text-xs text-white/80">Sin datos históricos</span>
            </div>
          )}

          {/* Indicador de clic */}
          {hasMonthlyData && (
            <div className="text-center">
              <span className="text-xs text-white font-bold drop-shadow-md">Clic para ver detalle</span>
            </div>
          )}

          {/* Icono de expansión */}
          <div className="absolute top-2 right-2 w-5 h-5 text-white/70 opacity-90">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M15 3l2.3 2.3-2.89 2.87 1.42 1.42L18.7 6.7 21 9V3h-6zM3 9l2.3-2.3 2.87 2.89 1.42-1.42L6.7 5.3 9 3H3v6z" />
            </svg>
          </div>
        </div>
      </div>
      {/* Título con gradiente */}
      <h3 className="text-gray-800 font-black text-base sm:text-lg lg:text-xl mb-2 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
        Promedio mensual
      </h3>
      <p className="text-sm text-gray-600 text-center font-semibold">
        Tendencia histórica
      </p>
    </div>
  );
};

// Exportar componentes
export default MetricCard;