import React, { useState } from 'react';
import Pagination from '../shared/Pagination.jsx';
import {
    Eye,
    ArrowLeft,
    ChevronDown,
    Calendar,
    Target,
    CheckCircle2,
    Play,
    Table2,
    LayoutGrid,
    Star,
    FileText
} from 'lucide-react';

/**
 * Componente de tabla de quizzes del estudiante
 * Muestra los quizzes disponibles con filtros, paginación y opciones de interacción
 */
export function QuizTable({
    // Datos
    selectedArea,
    filteredActividades,
    pagedQuizzes,
    loading,
    error,

    // Estados de UI
    isMobile,
    selectedMonth,
    isDropdownOpen,
    setIsDropdownOpen,
    descMaxCh,

    // Paginación
    quizTotal,
    QUIZ_PAGE_SIZE,
    quizPage,
    setQuizPage,

    // Funciones de navegación
    handleGoBack,

    // Funciones de filtrado
    getSelectedMonthName,
    handleMonthSelect,
    months,

    // Funciones de interacción
    isWithinDeadline,
    openLongText,
    computeQuizEstado,
    isQuizAvailable,
    getTotalAttempts,
    isQuizOpenElsewhere,
    handleIniciarSimulacion,
    handleVisualizarResultados,
    handleVerHistorial,
    getBestScore,
    canRetry,
    pendingAnswers
}) {
    // Estado para controlar el modo de vista (tabla o tarjetas)
    const [viewMode, setViewMode] = useState('table'); // 'table' o 'cards'

    // Efecto para forzar vista de tabla en pantallas grandes
    React.useEffect(() => {
        const handleResize = () => {
            // Si la pantalla es >= 768px (md breakpoint), forzar vista de tabla
            if (window.innerWidth >= 768) {
                setViewMode('table');
            }
        };

        // Ejecutar al montar
        handleResize();

        // Escuchar cambios de tamaño
        window.addEventListener('resize', handleResize);

        // Limpiar listener al desmontar
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Forzar vista de tabla en móvil
    React.useEffect(() => {
        if (isMobile && viewMode !== 'table') {
            setViewMode('table');
        }
    }, [isMobile, viewMode]);

    return (
        <div className="px-0 sm:px-3 md:px-4 lg:px-6 pt-6 sm:pt-8 md:pt-10 py-6">
            {/* Header */}
            <div className="bg-white border-2 border-gray-200/50 rounded-xl sm:rounded-2xl shadow-lg mb-6 sm:mb-8">
                <div className="px-4 sm:px-6 py-5 sm:py-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                            <button
                                onClick={handleGoBack}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 active:scale-95 rounded-xl transition-all touch-manipulation"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 mb-2">Quizzes</h1>
                                <p className="text-sm sm:text-base text-gray-600 font-medium">{selectedArea?.titulo}</p>
                            </div>
                        </div>
                        <div className="flex items-center text-xs sm:text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                            <Target className="w-4 h-4 mr-1.5 text-violet-600" />
                            <span className="font-semibold">{filteredActividades.length} quizzes disponibles</span>
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

                        <div className="flex flex-col items-center">
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-700 to-indigo-700 bg-clip-text text-transparent tracking-wide">
                                QUIZZES DISPONIBLES
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
                    <div className="flex items-center justify-between w-full md:w-auto">
                        <div className="text-sm sm:text-base md:text-lg font-extrabold text-gray-800 flex items-center gap-2">
                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600" />
                            <span>Filtrar quizzes</span>
                        </div>
                        {/* Toggle de vista - Solo móvil */}
                        {!isMobile && (
                            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 md:hidden">
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`p-1.5 rounded transition-all ${viewMode === 'table' ? 'bg-white text-violet-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    title="Vista de tabla"
                                >
                                    <Table2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('cards')}
                                    className={`p-1.5 rounded transition-all ${viewMode === 'cards' ? 'bg-white text-violet-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    title="Vista de tarjetas"
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                    {isMobile ? (
                        <div className="relative w-full">
                            <button
                                type="button"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center justify-between w-full px-3 sm:px-4 py-2 text-left bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-haspopup="listbox"
                                aria-expanded={isDropdownOpen}
                            >
                                <span className="truncate">{getSelectedMonthName()}</span>
                                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isDropdownOpen && (
                                <div className="absolute z-[80] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-2xl max-h-72 overflow-y-auto">
                                    <div className="py-1">
                                        <button
                                            type="button"
                                            onClick={() => { handleMonthSelect('all'); setIsDropdownOpen(false); }}
                                            className={`block w-full px-4 py-3 text-left text-base hover:bg-gray-100 ${selectedMonth === 'all' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
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
                                                className={`block w-full px-4 py-3 text-left text-base hover:bg-gray-100 ${selectedMonth === index.toString() ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                                                role="option"
                                                aria-selected={selectedMonth === index.toString()}
                                            >
                                                {month}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center justify-between w-56 sm:w-64 px-3 sm:px-4 py-2 text-left bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-haspopup="listbox"
                                aria-expanded={isDropdownOpen}
                            >
                                <span>{getSelectedMonthName()}</span>
                                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute z-[70] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-64 overflow-auto">
                                    <div className="py-1">
                                        <button
                                            type="button"
                                            onClick={() => { handleMonthSelect('all'); setIsDropdownOpen(false); }}
                                            className={`block w-full px-4 py-2 text-left hover:bg-gray-100 ${selectedMonth === 'all' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                                        >
                                            Todos los meses
                                        </button>
                                        {months.map((month, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => { handleMonthSelect(index.toString()); setIsDropdownOpen(false); }}
                                                className={`block w-full px-4 py-2 text-left hover:bg-gray-100 ${selectedMonth === index.toString() ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                                                role="option"
                                                aria-selected={selectedMonth === index.toString()}
                                            >
                                                {month}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Vista condicional: Tabla o Tarjetas */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border-2 border-gray-200/50 ring-2 ring-gray-100/50">
                {viewMode === 'cards' ? (
                    /* Vista de tarjetas - Estilo mejorado de simulaciones */
                    <div className="space-y-3 p-3">
                        {loading && (
                            <div className="text-center py-8 text-gray-500 text-sm">Cargando quizzes...</div>
                        )}
                        {!loading && error && (
                            <div className="text-center py-8 text-red-600 text-sm font-semibold">{error}</div>
                        )}
                        {!loading && !error && filteredActividades.length === 0 && (
                            <div className="bg-white rounded-xl border-2 border-gray-200/50 shadow-lg p-6 text-center">
                                <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <h3 className="text-base font-extrabold text-gray-900 mb-1.5">
                                    No hay quizzes disponibles
                                </h3>
                                <p className="text-sm text-gray-600 font-medium">
                                    No hay quizzes disponibles por ahora en esta materia. Intenta cambiar de mes o vuelve más tarde.
                                </p>
                            </div>
                        )}
                        {!loading && !error && pagedQuizzes.map((quiz) => {
                            const est = computeQuizEstado(quiz);
                            const available = isQuizAvailable(quiz);
                            const attempts = getTotalAttempts(quiz.id);
                            const showResults = attempts > 0;
                            const displayResults = showResults || !available;
                            const isOpen = isQuizOpenElsewhere(quiz.id);
                            const pending = pendingAnswers[quiz.id];

                            return (
                                <div
                                    key={quiz.id}
                                    className="bg-white rounded-xl border-2 border-gray-200/50 shadow-lg p-4 hover:shadow-xl transition-all duration-300 ring-1 ring-gray-100/50"
                                >
                                    {/* Header: Título y Badge */}
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <button
                                            type="button"
                                            onClick={() => { if (quiz.descripcion) openLongText(quiz.nombre, quiz.descripcion, { tipo: 'quiz', id: quiz.id }); }}
                                            className={`font-extrabold text-gray-900 text-sm leading-tight flex-1 text-left truncate ${quiz.descripcion ? 'cursor-pointer hover:underline' : ''}`}
                                            title={quiz.nombre}
                                        >
                                            {quiz.nombre}
                                        </button>
                                        <span className={`text-xs font-extrabold px-2 py-1 rounded-lg border-2 whitespace-nowrap ${est === 'completado' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                            est === 'disponible' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                'bg-red-100 text-red-600 border-red-200'
                                            }`}>
                                            {est === 'completado' ? 'Completado' : est === 'disponible' ? 'Disponible' : 'Vencido'}
                                        </span>
                                    </div>

                                    {/* Descripción */}
                                    {quiz.descripcion && (
                                        <div
                                            onClick={() => openLongText(quiz.nombre, quiz.descripcion, { tipo: 'quiz', id: quiz.id })}
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
                                                {quiz.descripcion}
                                            </p>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); openLongText(quiz.nombre, quiz.descripcion, { tipo: 'quiz', id: quiz.id }); }}
                                                className="mt-0.5 text-[10px] text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                                            >
                                                Ver instrucciones
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
                                                {quiz.fechaEntrega ? new Date(quiz.fechaEntrega).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) : 'Sin límite'}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-gray-500 font-medium mb-0.5">Intentos</div>
                                            <div className="text-gray-900 font-bold">{attempts} / {quiz.maxIntentos}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-500 font-medium mb-0.5">Tiempo</div>
                                            <div className="text-gray-900 font-bold">{quiz.tiempoLimite}</div>
                                        </div>
                                    </div>

                                    {/* Puntaje con estrella */}
                                    <div className="flex items-center justify-center gap-1.5 mb-3 bg-gradient-to-r from-amber-50 to-yellow-50 p-2 rounded-lg border border-amber-200">
                                        <Star className="w-4 h-4 text-amber-500" fill="currentColor" />
                                        {showResults ? (
                                            <div className="flex flex-col items-center">
                                                <span className="font-extrabold text-emerald-600 text-sm">
                                                    {getBestScore(quiz.id) !== 'En revisión' ? `${getBestScore(quiz.id)}%` : getBestScore(quiz.id)}
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
                                        {available && !isOpen && (
                                            <button
                                                onClick={() => handleIniciarSimulacion(quiz.id)}
                                                className="w-full rounded-xl py-2.5 px-3 text-sm font-extrabold text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg transition-all flex items-center justify-center gap-2 border-2 border-emerald-600 active:scale-95 touch-manipulation hover:shadow-xl"
                                            >
                                                <Play className="w-4 h-4" />
                                                Iniciar
                                            </button>
                                        )}
                                        {showResults && (
                                            <>
                                                {available && !isOpen && (
                                                    <button
                                                        onClick={() => handleIniciarSimulacion(quiz.id)}
                                                        className="w-full rounded-xl py-2.5 px-3 text-sm font-extrabold text-white bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg transition-all flex items-center justify-center gap-2 border-2 border-red-600 active:scale-95 touch-manipulation hover:shadow-xl"
                                                    >
                                                        <span className="text-base">🔄</span>
                                                        Reintentar
                                                    </button>
                                                )}
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        onClick={() => handleVisualizarResultados(quiz.id)}
                                                        className="flex items-center justify-center gap-1 rounded-xl py-2 px-2 text-xs font-extrabold bg-blue-50 text-blue-700 hover:bg-blue-100 border-2 border-blue-200 transition-all active:scale-95 touch-manipulation shadow-sm"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        Resultados
                                                    </button>
                                                    {attempts > 0 && (
                                                        <button
                                                            onClick={() => handleVerHistorial(quiz)}
                                                            className="flex items-center justify-center gap-1 rounded-xl py-2 px-2 text-xs font-extrabold bg-purple-50 text-purple-700 hover:bg-purple-100 border-2 border-purple-200 transition-all active:scale-95 touch-manipulation shadow-sm"
                                                        >
                                                            <FileText className="w-3.5 h-3.5" />
                                                            Historial
                                                        </button>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                        {(!available || isOpen) && !showResults && (
                                            <div className="w-full px-3 py-2 bg-gray-100 text-gray-600 rounded-xl text-center text-xs font-bold border-2 border-gray-200">
                                                {isOpen ? 'Ya abierto en otra pestaña' : (est === 'vencido' ? 'Quiz Vencido' : 'No Disponible')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {/* Paginación para tarjetas */}
                        {!loading && !error && filteredActividades.length > 0 && (
                            <div className="px-4 py-3 border-t border-gray-200 bg-white rounded-xl">
                                <Pagination
                                    totalItems={quizTotal}
                                    pageSize={QUIZ_PAGE_SIZE}
                                    currentPage={quizPage}
                                    onPageChange={setQuizPage}
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    /* Vista de tabla */
                    <div>
                        <div className="overflow-x-auto">
                            <table className="w-full divide-y divide-gray-200/50 text-sm" style={{ minWidth: isMobile ? '1000px' : '1250px' }}>
                                <thead className="bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500">
                                    <tr>
                                        <th className="px-2.5 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 lg:py-4 text-left font-extrabold text-white uppercase tracking-tight text-[9px] sm:text-[10px] md:text-xs" style={{ minWidth: isMobile ? '240px' : '280px' }}>
                                            Quiz
                                        </th>
                                        <th className="px-2.5 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 lg:py-4 text-left font-extrabold text-white uppercase tracking-tight text-[9px] sm:text-[10px] md:text-xs" style={{ minWidth: '140px' }}>
                                            Fecha Límite
                                        </th>
                                        <th className="px-2.5 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 lg:py-4 text-left font-extrabold text-white uppercase tracking-tight text-[9px] sm:text-[10px] md:text-xs" style={{ minWidth: '140px' }}>
                                            Estado
                                        </th>
                                        <th className="px-2.5 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 lg:py-4 text-left font-extrabold text-white uppercase tracking-tight text-[9px] sm:text-[10px] md:text-xs" style={{ minWidth: '170px' }}>
                                            Mejor Puntaje
                                        </th>
                                        <th className="px-2.5 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 lg:py-4 text-left font-extrabold text-white uppercase tracking-tight text-[9px] sm:text-[10px] md:text-xs" style={{ minWidth: '140px' }}>
                                            Intentos
                                        </th>
                                        <th className="px-2.5 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 lg:py-4 text-center font-extrabold text-white uppercase tracking-tight text-[9px] sm:text-[10px] md:text-xs" style={{ minWidth: '170px' }}>
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200/50">
                                    {loading && (
                                        <tr>
                                            <td colSpan={6} className="px-2 sm:px-4 md:px-6 py-6 sm:py-8 md:py-10 text-center text-sm sm:text-base text-gray-500 font-medium">Cargando quizzes...</td>
                                        </tr>
                                    )}
                                    {!loading && error && (
                                        <tr>
                                            <td colSpan={6} className="px-2 sm:px-4 md:px-6 py-6 sm:py-8 md:py-10 text-center text-sm sm:text-base text-red-600 font-semibold">{error}</td>
                                        </tr>
                                    )}
                                    {!loading && !error && filteredActividades.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-2 sm:px-4 md:px-6 py-6 sm:py-8 md:py-10 text-center text-sm sm:text-base text-gray-500 font-medium">
                                                No hay quizzes disponibles por ahora en esta materia. Intenta cambiar de mes o vuelve más tarde.
                                            </td>
                                        </tr>
                                    )}
                                    {!loading && !error && pagedQuizzes.map((quiz, index) => {
                                        const est = computeQuizEstado(quiz);
                                        const available = isQuizAvailable(quiz);
                                        const attempts = getTotalAttempts(quiz.id);
                                        const showResults = attempts > 0;
                                        const displayResults = showResults || !available;
                                        const isOpen = isQuizOpenElsewhere(quiz.id);
                                        const pending = pendingAnswers[quiz.id];

                                        return (
                                            <tr key={quiz.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-violet-50/30 transition-colors duration-200`}>
                                                <td className={`${isMobile ? 'px-1.5 py-1' : 'px-2.5 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 lg:py-4'}`}>
                                                    <div>
                                                        <button
                                                            type="button"
                                                            onClick={() => { if (quiz.descripcion) openLongText(quiz.nombre, quiz.descripcion, { tipo: 'quiz', id: quiz.id }); }}
                                                            className={`${isMobile ? 'text-[8px]' : 'text-[9px]'} sm:text-xs md:text-sm lg:text-base font-bold text-gray-900 leading-tight text-left w-full truncate ${quiz.descripcion ? 'cursor-pointer hover:underline' : ''}`}
                                                            title={quiz.nombre}
                                                        >
                                                            {quiz.nombre}
                                                        </button>
                                                        {quiz.descripcion && (
                                                            <div
                                                                onClick={() => openLongText(quiz.nombre, quiz.descripcion, { tipo: 'quiz', id: quiz.id })}
                                                                className="text-xs text-gray-500 mt-0.5 cursor-pointer group"
                                                            >
                                                                <p
                                                                    style={{
                                                                        display: '-webkit-box',
                                                                        WebkitLineClamp: isMobile ? 1 : 2,
                                                                        WebkitBoxOrient: 'vertical',
                                                                        overflow: 'hidden',
                                                                        textAlign: 'justify',
                                                                        maxWidth: descMaxCh,
                                                                        wordBreak: 'break-word'
                                                                    }}
                                                                    className="group-hover:text-gray-700 transition-colors"
                                                                >
                                                                    {quiz.descripcion}
                                                                </p>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); openLongText(quiz.nombre, quiz.descripcion, { tipo: 'quiz', id: quiz.id }); }}
                                                                    className={`mt-1 ${isMobile ? 'text-[10px]' : 'text-[11px]'} text-blue-600 hover:text-blue-800 hover:underline font-semibold`}
                                                                >
                                                                    Ver instrucciones
                                                                </button>
                                                            </div>
                                                        )}
                                                        <div className={`${isMobile ? 'text-[6px] mt-0' : 'text-[8px] sm:text-[9px] md:text-xs'} text-gray-400 ${isMobile ? '' : 'mt-0.5'}`}>
                                                            Tiempo: {quiz.tiempoLimite} | Intentos: {quiz.maxIntentos}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-2.5 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 lg:py-4 whitespace-nowrap">
                                                    <div className="text-xs sm:text-sm text-gray-900 font-semibold">
                                                        {quiz.fechaEntrega ? new Date(quiz.fechaEntrega).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }) : 'Sin fecha'}
                                                    </div>
                                                    <div className={`text-[10px] sm:text-xs font-bold ${isWithinDeadline(quiz.fechaEntrega) ? 'text-green-600' : 'text-red-600'}`}>
                                                        {isWithinDeadline(quiz.fechaEntrega) ? 'Disponible' : (quiz.fechaEntrega ? 'Vencido' : 'Disponible')}
                                                    </div>
                                                </td>
                                                <td className="px-2.5 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 lg:py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-1 sm:px-1.5 md:px-2.5 py-0.5 text-[8px] sm:text-[9px] md:text-xs font-extrabold rounded-full border ${est === 'completado' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                                        est === 'disponible' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                                            'bg-red-100 text-red-800 border-red-200'
                                                        }`}>
                                                        {est === 'completado' ? 'Completado' : est === 'disponible' ? 'Disponible' : 'Vencido'}
                                                    </span>
                                                </td>
                                                <td className="px-2.5 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 lg:py-4 whitespace-nowrap">
                                                    <div className="text-[10px] sm:text-xs md:text-sm lg:text-base font-bold text-gray-900">
                                                        {getBestScore(quiz.id) !== 'En revisión' ? `${getBestScore(quiz.id)}%` : getBestScore(quiz.id)}
                                                    </div>
                                                    {pending && pending.pending > 0 && (
                                                        <div className="text-[8px] sm:text-[9px] text-amber-600 font-medium flex items-center gap-1">
                                                            <span>⏳</span>
                                                            <span>Parcial ({pending.pending} pendiente{pending.pending !== 1 ? 's' : ''})</span>
                                                        </div>
                                                    )}
                                                    {!pending && quiz.score && (
                                                        <div className="text-[8px] sm:text-[9px] md:text-xs text-gray-500 font-medium">
                                                            de {quiz.maxScore}%
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-2.5 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 lg:py-4 whitespace-nowrap">
                                                    <div className="text-[10px] sm:text-xs md:text-sm lg:text-base font-bold text-gray-900">
                                                        {attempts} / {quiz.maxIntentos}
                                                    </div>
                                                    {attempts > 0 && (
                                                        <button
                                                            onClick={() => handleVerHistorial(quiz)}
                                                            className="text-[8px] sm:text-[9px] md:text-xs text-purple-600 hover:text-purple-800 font-bold underline"
                                                        >
                                                            Ver historial
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="px-2.5 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 lg:py-4 whitespace-nowrap text-center">
                                                    <div className="flex items-center justify-center space-x-0.5 sm:space-x-1 md:space-x-2">
                                                        <button
                                                            onClick={() => { if (available && !isOpen) handleIniciarSimulacion(quiz.id); }}
                                                            className={`p-1 sm:p-1.5 md:p-2 rounded-lg transition-all active:scale-95 touch-manipulation ${(!available || isOpen) ? 'text-gray-400 cursor-not-allowed' : 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50'}`}
                                                            title={isOpen ? 'Ya abierto en otra pestaña' : (available ? 'Iniciar quiz' : 'No disponible')}
                                                            disabled={!available || isOpen}
                                                        >
                                                            <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" />
                                                        </button>
                                                        {displayResults && (
                                                            <button
                                                                onClick={() => handleVisualizarResultados(quiz.id)}
                                                                className="p-1 sm:p-1.5 md:p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all active:scale-95 touch-manipulation"
                                                                title={showResults ? 'Ver resultados' : 'Ver resultados (no hay intentos registrados)'}
                                                            >
                                                                <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" />
                                                            </button>
                                                        )}
                                                        {!available && !showResults && (
                                                            <span className="text-[8px] sm:text-[9px] md:text-xs text-gray-500">No disponible</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-4 py-3 border-t border-gray-200 bg-white">
                            <Pagination
                                totalItems={quizTotal}
                                pageSize={QUIZ_PAGE_SIZE}
                                currentPage={quizPage}
                                onPageChange={setQuizPage}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default QuizTable;
