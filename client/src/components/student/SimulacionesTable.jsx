import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowLeft,
  ChevronDown,
  Calendar,
  Target,
  CheckCircle2,
  Play,
  FileText,
  LineChart,
  RefreshCw,
  AlertTriangle,
  Star
} from 'lucide-react';

/**
 * Componente de tabla de simulaciones del estudiante
 * Muestra las simulaciones disponibles con filtros y opciones de interacción
 */
export function SimulacionesTable({
  // Datos
  selectedTipo,
  selectedModulo,
  filteredSimulaciones,
  loading,
  error,
  // Estados de UI
  isMobile,
  selectedMonth,
  isDropdownOpen,
  setIsDropdownOpen,
  // Funciones de navegación
  handleGoBack,
  // Funciones de filtrado
  getSelectedMonthName,
  handleMonthSelect,
  months,
  // Funciones de interacción
  isWithinDeadline,
  normalizeDeadlineEndOfDay,
  openLongText,
  computeSimEstado,
  isSimulacionAvailable,
  getTotalAttempts,
  getBestScore,
  handleOpenLaunchModal,
  handleVerHistorial,
  handleVerGraficas,
  pendingAnswers,
  launchingSimId,
  // Función de refresh
  onRefresh
}) {
  // Ref y estado para posicionamiento inteligente del dropdown
  const monthButtonRef = useRef(null);
  const [dropdownStyle, setDropdownStyle] = useState({});

  // Calcular posición inteligente del dropdown
  const calculateDropdownPosition = useCallback(() => {
    if (!monthButtonRef.current) return null;
    const rect = monthButtonRef.current.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const viewportW = window.innerWidth;
    const margin = 8;
    const gap = 4;
    const desiredHeight = 280;
    const minHeight = 120;
    const spaceBelow = viewportH - rect.bottom - margin;
    const spaceAbove = rect.top - margin;
    const shouldShowAbove = spaceBelow < 250 && spaceAbove > spaceBelow;

    const maxHeight = shouldShowAbove
      ? Math.max(minHeight, Math.min(desiredHeight, spaceAbove - gap))
      : Math.max(minHeight, Math.min(desiredHeight, spaceBelow - gap));

    let left = rect.left;
    const dropdownWidth = rect.width;
    if (left + dropdownWidth > viewportW - margin) {
      left = viewportW - dropdownWidth - margin;
    }
    if (left < margin) {
      left = margin;
    }

    return {
      position: 'fixed',
      top: shouldShowAbove
        ? `${Math.max(margin, rect.top - maxHeight - gap)}px`
        : `${rect.bottom + gap}px`,
      left: `${left}px`,
      width: `${dropdownWidth}px`,
      maxHeight: `${maxHeight}px`,
      zIndex: 9999,
    };
  }, []);

  // Calcular posición cuando se abre el dropdown y bloquear scroll del body
  useEffect(() => {
    if (isDropdownOpen) {
      // Bloquear scroll del body para evitar que aparezca la barra de scroll principal
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Calcular posición ANTES de mostrar el dropdown para evitar parpadeo
      const style = calculateDropdownPosition();
      if (style) {
        setDropdownStyle(style);
      }

      const handleResize = () => {
        const newStyle = calculateDropdownPosition();
        if (newStyle) setDropdownStyle(newStyle);
      };

      const handleScroll = () => {
        const newStyle = calculateDropdownPosition();
        if (newStyle) setDropdownStyle(newStyle);
      };

      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll, true);

      return () => {
        // Restaurar scroll del body
        document.body.style.overflow = prevOverflow;
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll, true);
      };
    } else {
      setDropdownStyle({});
    }
  }, [isDropdownOpen, calculateDropdownPosition]);

  return (
    <React.Fragment>
      <div className="min-h-screen bg-white px-0 sm:px-2 md:px-3 lg:px-4 xl:px-6 2xl:px-8 pt-6 sm:pt-8 md:pt-10 py-4 lg:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header con navegación */}
          <div className="bg-white border-2 border-gray-200/50 rounded-xl sm:rounded-2xl shadow-lg mb-6 sm:mb-8 mt-4 sm:mt-6 md:mt-8">
            <div className="px-4 sm:px-6 py-5 sm:py-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <button
                    onClick={handleGoBack}
                    className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 active:scale-95 rounded-xl transition-all touch-manipulation"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 mb-2 break-words text-left">
                      {selectedTipo === 'generales' ? 'Simulaciones Generales' :
                        selectedModulo ? selectedModulo.titulo : 'Simulaciones'}
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 font-medium text-left">
                      {selectedTipo === 'generales' ? 'Exámenes generales de ingreso universitario' :
                        selectedModulo ? selectedModulo.descripcion : 'Simulaciones especializadas'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-xs sm:text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                    <Target className="w-4 h-4 mr-1.5 text-violet-600" />
                    <span className="font-semibold">{filteredSimulaciones.length} simulaciones disponibles</span>
                  </div>
                  {onRefresh && (
                    <button
                      onClick={onRefresh}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 active:scale-95 rounded-lg transition-all"
                      title="Refrescar lista"
                      aria-label="Refrescar lista"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Banner decorativo */}
          <div className="bg-gradient-to-r from-cyan-50 via-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl border-2 border-cyan-200/50 shadow-lg p-6 sm:p-8 mb-6 sm:mb-8 relative overflow-hidden ring-2 ring-cyan-100/50">
            <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-cyan-100/40 to-indigo-100/40 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-tr from-blue-100/40 to-cyan-100/40 rounded-full blur-xl"></div>
            <div className="flex items-center justify-center relative z-10">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <div className="relative">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-xl ring-4 ring-cyan-200/50">
                    <Play className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white">
                    <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                  </div>
                </div>
                <div className="flex flex-col items-center text-center">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-700 to-indigo-700 bg-clip-text text-transparent tracking-wide">
                    SIMULACIONES DISPONIBLES
                  </h2>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="w-12 sm:w-16 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"></div>
                    <div className="w-12 sm:w-16 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200/50 shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
              <div className="text-sm sm:text-base md:text-lg font-extrabold text-gray-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600" />
                <span>Filtrar simulaciones</span>
              </div>
              {/* Selector con posicionamiento inteligente */}
              <div className="relative w-full md:w-auto">
                <button
                  ref={monthButtonRef}
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center justify-between w-full md:w-64 px-3 sm:px-4 py-2.5 text-left bg-white border-2 border-gray-300 rounded-xl hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 active:scale-95 transition-all touch-manipulation shadow-sm text-sm sm:text-base"
                  aria-haspopup="listbox"
                  aria-expanded={isDropdownOpen}
                >
                  <span className="truncate pr-2 font-semibold">{getSelectedMonthName()}</span>
                  <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform flex-shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isDropdownOpen && Object.keys(dropdownStyle).length > 0 && createPortal(
                  <>
                    {/* Overlay para cerrar al hacer click fuera */}
                    <div
                      className="fixed inset-0 z-[9998] bg-transparent"
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    <div
                      style={dropdownStyle}
                      className="bg-white border-2 border-gray-300 rounded-xl shadow-2xl overflow-y-auto"
                    >
                      <div className="py-1">
                        <button
                          type="button"
                          onClick={() => { handleMonthSelect('all'); setIsDropdownOpen(false); }}
                          className={`block w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left hover:bg-gray-100 font-medium text-sm sm:text-base transition-colors ${selectedMonth === 'all' ? 'bg-violet-50 text-violet-700' : 'text-gray-700'}`}
                          role="option"
                          aria-selected={selectedMonth === 'all'}
                        >
                          Todos los meses
                        </button>
                        {months.map((month, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => { handleMonthSelect(index.toString()); setIsDropdownOpen(false); }}
                            className={`block w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left hover:bg-gray-100 font-medium text-sm sm:text-base transition-colors ${selectedMonth === index.toString() ? 'bg-violet-50 text-violet-700' : 'text-gray-700'}`}
                            role="option"
                            aria-selected={selectedMonth === index.toString()}
                          >
                            {month}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>,
                  document.body
                )}
              </div>
            </div>
          </div>

          {/* Vista de escritorio - Tabla de simulaciones - Mejorada */}
          <div className="hidden lg:block bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 border-b-0 shadow-xl overflow-hidden ring-2 ring-slate-100/90">
            <div
              className="overflow-x-auto simulaciones-table-scroll"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <table className="min-w-full" style={{ minWidth: '1200px' }}>
                <thead>
                  <tr className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white shadow-md">
                    <th className="px-2 sm:px-2.5 py-2 sm:py-2.5 text-left text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border-r border-white/30 last:border-r-0" style={{ minWidth: '50px' }}>No.</th>
                    <th className="px-2 sm:px-2.5 py-2 sm:py-2.5 text-left text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border-r border-white/30 last:border-r-0" style={{ minWidth: '250px' }}>Simulación</th>
                    <th className="px-2 sm:px-2.5 py-2 sm:py-2.5 text-center text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border-r border-white/30 last:border-r-0" style={{ minWidth: '120px' }}>Fecha límite</th>
                    <th className="px-2 sm:px-2.5 py-2 sm:py-2.5 text-center text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border-r border-white/30 last:border-r-0" style={{ minWidth: '120px' }}>Ejecutar</th>
                    <th className="px-2 sm:px-2.5 py-2 sm:py-2.5 text-center text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border-r border-white/30 last:border-r-0" style={{ minWidth: '100px' }}>Entregado</th>
                    <th className="px-2 sm:px-2.5 py-2 sm:py-2.5 text-center text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border-r border-white/30 last:border-r-0" style={{ minWidth: '140px' }}>Volver a intentar</th>
                    <th className="px-2 sm:px-2.5 py-2 sm:py-2.5 text-center text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border-r border-white/30 last:border-r-0" style={{ minWidth: '120px' }}>Historial</th>
                    <th className="px-2 sm:px-2.5 py-2 sm:py-2.5 text-center text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border-r border-white/30 last:border-r-0" style={{ minWidth: '120px' }}>Gráficas</th>
                    <th className="px-2 sm:px-2.5 py-2 sm:py-2.5 text-center text-[10px] sm:text-[11px] font-bold uppercase tracking-wider last:border-r-0" style={{ minWidth: '120px' }}>Puntaje</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200/90">
                  {loading && (
                    <tr>
                      <td colSpan={9} className="px-2 sm:px-2.5 py-3 sm:py-4 text-center text-[10px] sm:text-[11px] text-gray-500 font-medium">Cargando simulaciones...</td>
                    </tr>
                  )}
                  {!loading && error && (
                    <tr>
                      <td colSpan={9} className="px-2 sm:px-2.5 py-3 sm:py-4 text-center text-[10px] sm:text-[11px] text-red-600 font-semibold">{error}</td>
                    </tr>
                  )}
                  {!loading && !error && filteredSimulaciones.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-2 sm:px-2.5 py-3 sm:py-4 text-center text-[10px] sm:text-[11px] text-gray-500 font-medium">
                        No hay simulaciones para el mes seleccionado.
                      </td>
                    </tr>
                  )}
                  {!loading && !error && filteredSimulaciones.map((simulacion, index) => {
                    const est = computeSimEstado(simulacion);
                    const available = isSimulacionAvailable(simulacion);
                    const attempts = getTotalAttempts(simulacion.id);
                    const pending = pendingAnswers[simulacion.id];
                    return (
                      <tr key={simulacion.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-violet-50/30 transition-colors duration-200`}>
                        <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-[11px] sm:text-xs font-extrabold text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-2 sm:px-3 py-2">
                          <div>
                            <div className="text-xs sm:text-sm font-bold text-gray-900">
                              {simulacion.nombre}
                            </div>
                            {simulacion.descripcion && (
                              <div
                                onClick={() => openLongText(simulacion.nombre, simulacion.descripcion, { tipo: 'simulacion', id: simulacion.id })}
                                className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5 cursor-pointer group"
                              >
                                <p
                                  style={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: isMobile ? 1 : 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    textAlign: 'justify',
                                    wordBreak: 'break-word',
                                    lineHeight: '1.2'
                                  }}
                                  className="group-hover:text-gray-700 transition-colors"
                                >
                                  {simulacion.descripcion}
                                </p>
                                <button
                                  onClick={(e) => { e.stopPropagation(); openLongText(simulacion.nombre, simulacion.descripcion, { tipo: 'simulacion', id: simulacion.id }); }}
                                  className="mt-0.5 text-[9px] sm:text-[10px] text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                                >
                                  Ver descripción completa
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-2 sm:px-3 py-2 text-center border-r border-slate-200/80 last:border-r-0">
                          <div className="flex items-center justify-center">
                            <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 text-violet-600" />
                            <span className="text-[10px] sm:text-[11px] text-gray-900 font-semibold">
                              {(() => {
                                const d = normalizeDeadlineEndOfDay(simulacion.fechaEntrega);
                                return d ? d.toLocaleDateString('es-ES') : 'Sin límite';
                              })()}
                            </span>
                          </div>
                        </td>
                        <td className="px-2 sm:px-3 py-2 text-center border-r border-slate-200/80 last:border-r-0">
                          {available ? (
                            <button
                              onClick={() => handleOpenLaunchModal(simulacion)}
                              disabled={launchingSimId === simulacion.id}
                              className={`relative px-2 sm:px-3 py-1.5 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white rounded-lg text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wide shadow-md transition-all duration-200 border border-red-600 hover:border-red-700 active:scale-95 touch-manipulation ${launchingSimId === simulacion.id ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg transform hover:scale-105'}`}
                            >
                              <span className="relative z-10 flex items-center justify-center">
                                <span className="mr-1 text-xs">🚀</span>
                                {launchingSimId === simulacion.id ? 'LANZANDO…' : 'START'}
                              </span>
                              <div className="absolute inset-0 bg-gradient-to-t from-red-700/20 to-transparent rounded-lg"></div>
                            </button>
                          ) : (
                            <button
                              disabled
                              className="px-2 py-1 bg-gray-300 cursor-not-allowed text-gray-500 rounded-lg text-[10px] sm:text-[11px] font-bold"
                            >
                              {est === 'vencido' ? 'VENCIDO' : (Number(simulacion.totalPreguntas || 0) === 0 ? 'SIN PREGUNTAS' : 'NO DISPONIBLE')}
                            </button>
                          )}
                        </td>
                        <td className="px-2 sm:px-3 py-2 text-center border-r border-slate-200/80 last:border-r-0">
                          {simulacion.completado ? (
                            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 mx-auto" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mx-auto" />
                          )}
                        </td>
                        <td className="px-2 sm:px-3 py-2 text-center border-r border-slate-200/80 last:border-r-0">
                          {simulacion.completado ? (
                            <button
                              onClick={() => handleOpenLaunchModal(simulacion)}
                              disabled={launchingSimId === simulacion.id}
                              className={`relative px-2 sm:px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wide shadow-md transition-all duration-200 border border-red-600 hover:border-red-700 active:scale-95 touch-manipulation ${launchingSimId === simulacion.id ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg transform hover:scale-105'}`}
                            >
                              <span className="relative z-10 flex items-center justify-center">
                                <span className="mr-0.5 text-xs">🔄</span>
                                {launchingSimId === simulacion.id ? 'LANZANDO…' : 'REINTENTAR'}
                              </span>
                              <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 to-transparent rounded-lg"></div>
                            </button>
                          ) : (
                            <span className="text-gray-400 text-[10px] sm:text-[11px]">-</span>
                          )}
                        </td>
                        <td className="px-2 sm:px-3 py-2 text-center border-r border-slate-200/80 last:border-r-0">
                          {simulacion.completado && attempts > 0 ? (
                            <button
                              onClick={() => handleVerHistorial(simulacion)}
                              className="inline-flex items-center gap-0.5 px-1.5 sm:px-2 py-1 text-[9px] sm:text-[10px] font-extrabold text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg border border-blue-200 transition-all active:scale-95 touch-manipulation shadow-sm"
                              title="Historial"
                            >
                              <FileText className="w-3 h-3" />
                              <span>Historial</span>
                              <span className="ml-0.5 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-white text-blue-700 text-[8px] font-extrabold border border-blue-200">{attempts}</span>
                            </button>
                          ) : (
                            <span className="text-gray-400 text-[10px] sm:text-[11px]">-</span>
                          )}
                        </td>
                        <td className="px-2 sm:px-2.5 py-1.5 sm:py-2 text-center border-r border-slate-200/80 last:border-r-0">
                          {simulacion.completado && attempts > 0 ? (
                            <button
                              onClick={() => handleVerGraficas(simulacion)}
                              className={`inline-flex items-center px-1.5 sm:px-2 py-1 text-[9px] sm:text-[10px] font-extrabold rounded-lg border transition-all active:scale-95 touch-manipulation shadow-sm ${
                                attempts >= 3
                                  ? 'text-indigo-700 bg-indigo-100 hover:bg-indigo-200 border-indigo-200'
                                  : 'text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed opacity-60'
                              }`}
                              title={attempts >= 3 ? 'Ver análisis gráfico' : `Se requieren al menos 3 intentos para el análisis. Actualmente tienes ${attempts}.`}
                              disabled={attempts < 3}
                            >
                              <LineChart className="w-3 h-3 mr-0.5" />
                              Análisis
                            </button>
                          ) : (
                            <span className="text-gray-400 text-[10px] sm:text-[11px]">-</span>
                          )}
                        </td>
                        <td className="px-2 sm:px-3 py-2 text-center border-r border-slate-200/80 last:border-r-0">
                          <div className="text-[11px] sm:text-xs text-gray-900 font-extrabold">
                            {simulacion.completado ? (
                              <div className="space-y-0.5">
                                <div className="font-extrabold text-emerald-600 bg-gradient-to-r from-emerald-100 to-green-100 px-2 py-0.5 rounded-lg border border-emerald-200">
                                  {getBestScore(simulacion.id)} %
                                </div>
                                {(() => {
                                  // Mostrar "Parcial" solo si hay pendientes en el intento oficial
                                  if (pending && pending.pending > 0) {
                                    return (
                                      <div className="text-[9px] sm:text-[10px] text-amber-600 font-medium flex items-center gap-1">
                                        <span>⏳</span>
                                        <span>Parcial ({pending.pending} pendiente{pending.pending !== 1 ? 's' : ''})</span>
                                      </div>
                                    );
                                  }
                                  // Mostrar "Mejor de X intentos" solo si no hay pendientes
                                  if (attempts > 1) {
                                    return (
                                      <div className="text-[9px] sm:text-[10px] text-gray-500 font-medium">
                                        Mejor de {attempts} intentos
                                      </div>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
                            ) : (
                              <span className="text-gray-400">0 %</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vista móvil - Cards de simulaciones - Mejoradas */}
          <div className="lg:hidden space-y-4 sm:space-y-5">
            {loading && (
              <div className="text-center py-8 text-gray-500 text-sm">Cargando simulaciones...</div>
            )}
            {!loading && error && (
              <div className="text-center py-8 text-red-600 text-sm font-semibold">{error}</div>
            )}
            {!loading && !error && filteredSimulaciones.length === 0 && (
              <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200/50 shadow-lg p-8 text-center">
                <Target className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-2">
                  No hay simulaciones disponibles
                </h3>
                <p className="text-sm sm:text-base text-gray-600 font-medium">
                  {selectedMonth !== 'all'
                    ? `No se encontraron simulaciones para ${getSelectedMonthName()}.`
                    : 'No hay simulaciones disponibles en este momento.'}
                </p>
              </div>
            )}
            {!loading && !error && filteredSimulaciones.map((simulacion, index) => {
              const est = computeSimEstado(simulacion);
              const available = isSimulacionAvailable(simulacion);
              const attempts = getTotalAttempts(simulacion.id);
              const pending = pendingAnswers[simulacion.id];
              return (
                <div
                  key={simulacion.id}
                  className="bg-white rounded-xl border-2 border-gray-200/50 shadow-lg p-4 hover:shadow-xl transition-all duration-300 ring-1 ring-gray-100/50"
                >
                  {/* Header: Título y Badge */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="bg-violet-100 text-violet-700 font-bold text-xs px-2 py-1 rounded-lg border-2 border-violet-200">
                        #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => { if (simulacion.descripcion) openLongText(simulacion.nombre, simulacion.descripcion, { tipo: 'simulacion', id: simulacion.id }); }}
                        className={`font-extrabold text-gray-900 text-sm leading-tight flex-1 text-left truncate ${simulacion.descripcion ? 'cursor-pointer hover:underline' : ''}`}
                        title={simulacion.nombre}
                      >
                        {simulacion.nombre}
                      </button>
                    </div>
                    <span className={`text-xs font-extrabold px-2 py-1 rounded-lg border-2 whitespace-nowrap ${est === 'completado' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                      est === 'disponible' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                        'bg-red-100 text-red-600 border-red-200'
                      }`}>
                      {est === 'completado' ? 'Completado' : est === 'disponible' ? 'Disponible' : 'Vencido'}
                    </span>
                  </div>
                  {/* Descripción */}
                  {simulacion.descripcion && (
                    <div
                      onClick={() => openLongText(simulacion.nombre, simulacion.descripcion, { tipo: 'simulacion', id: simulacion.id })}
                      className="text-xs text-gray-600 mb-3 leading-relaxed cursor-pointer group"
                    >
                      <p
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          wordBreak: 'break-word',
                          lineHeight: '1.3'
                        }}
                        className="group-hover:text-gray-700 transition-colors"
                      >
                        {simulacion.descripcion}
                      </p>
                      <button
                        onClick={(e) => { e.stopPropagation(); openLongText(simulacion.nombre, simulacion.descripcion, { tipo: 'simulacion', id: simulacion.id }); }}
                        className="mt-0.5 text-[10px] text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                      >
                        Ver descripción completa
                      </button>
                    </div>
                  )}
                  {/* Grid de información */}
                  <div className="grid grid-cols-3 gap-2 text-xs mb-3 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                    <div>
                      <div className="text-gray-500 font-medium mb-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-violet-600" />
                        <span>Límite</span>
                      </div>
                      <div className="text-gray-900 font-bold text-[11px]">
                        {simulacion.fechaEntrega ? (() => {
                          const d = normalizeDeadlineEndOfDay(simulacion.fechaEntrega);
                          return d ? d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) : 'Sin límite';
                        })() : 'Sin límite'}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 font-medium mb-0.5">Estado</div>
                      <div className="text-gray-900 font-bold text-[11px]">
                        {simulacion.completado ? '✓ Completado' : 'Pendiente'}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 font-medium mb-0.5">Intentos</div>
                      <div className="text-gray-900 font-bold">{attempts}</div>
                    </div>
                  </div>
                  {/* Puntaje con estrella */}
                  <div className="flex items-center justify-center gap-1.5 mb-3 bg-gradient-to-r from-amber-50 to-yellow-50 p-2 rounded-lg border border-amber-200">
                    <Star className="w-4 h-4 text-amber-500" fill="currentColor" />
                    {simulacion.completado ? (
                      <div className="flex flex-col items-center">
                        <span className="font-extrabold text-emerald-600 text-sm">
                          {getBestScore(simulacion.id)}%
                        </span>
                        {pending && pending.pending > 0 && (
                          <span className="text-[10px] text-amber-600 font-medium flex items-center gap-0.5">
                            <span>⏳</span>
                            <span>Parcial ({pending.pending})</span>
                          </span>
                        )}
                        {!pending && attempts > 1 && (
                          <span className="text-[10px] text-gray-500 font-medium">
                            Mejor de {attempts}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs font-bold">Sin intentos</span>
                    )}
                  </div>
                  {/* Botones de acción */}
                  <div className="space-y-2">
                    {available && !simulacion.completado && (
                      <button
                        onClick={() => handleOpenLaunchModal(simulacion)}
                        disabled={launchingSimId === simulacion.id}
                        className={`w-full rounded-xl py-2.5 px-3 text-sm font-extrabold text-white bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 shadow-lg transition-all flex items-center justify-center gap-2 border-2 border-red-600 active:scale-95 touch-manipulation hover:shadow-xl ${launchingSimId === simulacion.id ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        <span className="text-base">🚀</span>
                        {launchingSimId === simulacion.id ? 'Lanzando...' : 'Ejecutar'}
                      </button>
                    )}
                    {simulacion.completado && (
                      <>
                        <button
                          onClick={() => handleOpenLaunchModal(simulacion)}
                          disabled={launchingSimId === simulacion.id}
                          className={`w-full rounded-xl py-2.5 px-3 text-sm font-extrabold text-white bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg transition-all flex items-center justify-center gap-2 border-2 border-red-600 active:scale-95 touch-manipulation hover:shadow-xl ${launchingSimId === simulacion.id ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                          <span className="text-base">🔄</span>
                          {launchingSimId === simulacion.id ? 'Lanzando...' : 'Reintentar'}
                        </button>
                        {attempts > 0 && (
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleVerHistorial(simulacion)}
                              className="flex items-center justify-center gap-1 rounded-xl py-2 px-2 text-xs font-extrabold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-2 border-indigo-200 transition-all active:scale-95 touch-manipulation shadow-sm"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              Historial
                            </button>
                            {attempts >= 3 && (
                              <button
                                onClick={() => handleVerGraficas(simulacion)}
                                className="flex items-center justify-center gap-1 rounded-xl py-2 px-2 text-xs font-extrabold bg-purple-50 text-purple-700 hover:bg-purple-100 border-2 border-purple-200 transition-all active:scale-95 touch-manipulation shadow-sm"
                              >
                                <LineChart className="w-3.5 h-3.5" />
                                Gráfico
                              </button>
                            )}
                          </div>
                        )}
                      </>
                    )}
                    {!available && !simulacion.completado && (
                      <div className="w-full px-3 py-2 bg-gray-100 text-gray-600 rounded-xl text-center text-xs font-bold border-2 border-gray-200">
                        {est === 'vencido' ? 'Simulación Vencida' : (Number(simulacion.totalPreguntas || 0) === 0 ? 'Sin preguntas configuradas' : 'No Disponible')}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <style>{`
        .simulaciones-table-scroll::-webkit-scrollbar { width: 0; height: 0; display: none !important; }
        .simulaciones-table-scroll { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `}</style>
    </React.Fragment>
  );
}

export default SimulacionesTable;