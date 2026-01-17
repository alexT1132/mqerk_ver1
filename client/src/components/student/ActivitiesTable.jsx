import React, { useState } from 'react';
import {
    Upload,
    Eye,
    CheckCircle,
    XCircle,
    Download,
    ArrowLeft,
    FileText,
    ChevronDown,
    Calendar,
    Target,
    CheckCircle2,
    MessageSquareText,
    Table2,
    LayoutGrid,
    Star
} from 'lucide-react';

/**
 * Componente de tabla de actividades del estudiante
 * Muestra las actividades disponibles con filtros y opciones de interacción
 */
export function ActivitiesTable({
    // Datos
    selectedArea,
    filteredActividades,
    loading,
    error,

    // Estados de UI
    isMobile,
    selectedMonth,
    isDropdownOpen,
    setIsDropdownOpen,
    descMaxCh,

    // Funciones de navegación
    handleGoBack,

    // Funciones de filtrado
    getSelectedMonthName,
    handleMonthSelect,
    months,

    // Funciones de interacción
    isWithinDeadline,
    openLongText,
    openResourcesModal,
    handleDownload,
    openUploadModal,
    openViewModal,
    openNotasModal
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

    return (
        <div className="px-0 sm:px-3 md:px-4 lg:px-6 py-6">
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
                                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 mb-2">Actividades</h1>
                                <p className="text-sm sm:text-base text-gray-600 font-medium">{selectedArea?.titulo}</p>
                            </div>
                        </div>
                        <div className="flex items-center text-xs sm:text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                            <Target className="w-4 h-4 mr-1.5 text-violet-600" />
                            <span className="font-semibold">{filteredActividades.length} actividades disponibles</span>
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
                                <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white">
                                <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                            </div>
                        </div>

                        <div className="flex flex-col items-center">
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-700 to-indigo-700 bg-clip-text text-transparent tracking-wide">
                                ACTIVIDADES DISPONIBLES
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
                            <span>Filtrar actividades</span>
                        </div>
                        {/* Toggle de vista - Solo móvil */}
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
            {viewMode === 'cards' ? (
                /* Vista de tarjetas */
                <div className="space-y-3">
                    {loading && (
                        <div className="text-center py-8 text-gray-500 text-sm">Cargando actividades...</div>
                    )}
                    {!loading && error && (
                        <div className="text-center py-8 text-red-600 text-sm font-semibold">{error}</div>
                    )}
                    {!loading && !error && filteredActividades.length === 0 && (
                        <div className="bg-white rounded-xl border-2 border-gray-200/50 shadow-lg p-6 text-center">
                            <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <h3 className="text-base font-extrabold text-gray-900 mb-1.5">
                                No hay actividades disponibles
                            </h3>
                            <p className="text-sm text-gray-600 font-medium">
                                No hay actividades disponibles por ahora en esta materia.
                            </p>
                        </div>
                    )}
                    {!loading && !error && filteredActividades.map((actividad, index) => {
                        const withinDeadline = isWithinDeadline(actividad.fechaEntrega);
                        const hasSubmission = actividad.archivo_entrega;
                        const hasGrade = actividad.calificacion_final !== null && actividad.calificacion_final !== undefined;

                        return (
                            <div
                                key={actividad.id}
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
                                            onClick={() => { if (actividad.descripcion) openLongText(actividad.nombre, actividad.descripcion, { tipo: 'actividad', id: actividad.id }); }}
                                            className={`font-extrabold text-gray-900 text-sm leading-tight flex-1 text-left truncate ${actividad.descripcion ? 'cursor-pointer hover:underline' : ''}`}
                                            title={actividad.nombre}
                                        >
                                            {actividad.nombre}
                                        </button>
                                    </div>
                                    <span className={`text-xs font-extrabold px-2 py-1 rounded-lg border-2 whitespace-nowrap ${hasSubmission ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                            withinDeadline ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                'bg-red-100 text-red-600 border-red-200'
                                        }`}>
                                        {hasSubmission ? 'Entregado' : withinDeadline ? 'Pendiente' : 'Vencido'}
                                    </span>
                                </div>

                                {/* Descripción */}
                                {actividad.descripcion && (
                                    <div
                                        onClick={() => openLongText(actividad.nombre, actividad.descripcion, { tipo: 'actividad', id: actividad.id })}
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
                                            {actividad.descripcion}
                                        </p>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); openLongText(actividad.nombre, actividad.descripcion, { tipo: 'actividad', id: actividad.id }); }}
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
                                            {actividad.fechaEntrega ? new Date(actividad.fechaEntrega).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) : 'Sin límite'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500 font-medium mb-0.5">Estado</div>
                                        <div className="text-gray-900 font-bold text-[11px]">
                                            {hasSubmission ? '✓ Enviado' : 'Pendiente'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500 font-medium mb-0.5">Nota</div>
                                        <div className="text-gray-900 font-bold">
                                            {hasGrade ? (actividad.calificacion_final === -1 ? 'Revisión' : `${actividad.calificacion_final}/10`) : '-'}
                                        </div>
                                    </div>
                                </div>

                                {/* Calificación destacada si existe */}
                                {hasGrade && actividad.calificacion_final !== -1 && (
                                    <div className="flex items-center justify-center gap-1.5 mb-3 bg-gradient-to-r from-amber-50 to-yellow-50 p-2 rounded-lg border border-amber-200">
                                        <Star className="w-4 h-4 text-amber-500" fill="currentColor" />
                                        <span className="font-extrabold text-emerald-600 text-sm">
                                            {actividad.calificacion_final}/10
                                        </span>
                                    </div>
                                )}

                                {/* Botones de acción */}
                                <div className="grid grid-cols-2 gap-2">
                                    {actividad.recursos && actividad.recursos.length > 0 && (
                                        <button
                                            onClick={() => openResourcesModal(actividad)}
                                            className="flex items-center justify-center gap-1 rounded-xl py-2 px-2 text-xs font-extrabold bg-blue-50 text-blue-700 hover:bg-blue-100 border-2 border-blue-200 transition-all active:scale-95 touch-manipulation shadow-sm"
                                        >
                                            <FileText className="w-3.5 h-3.5" />
                                            Recursos
                                        </button>
                                    )}
                                    {withinDeadline && (
                                        <button
                                            onClick={() => openUploadModal(actividad)}
                                            className="flex items-center justify-center gap-1 rounded-xl py-2 px-2 text-xs font-extrabold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-2 border-emerald-200 transition-all active:scale-95 touch-manipulation shadow-sm"
                                        >
                                            <Upload className="w-3.5 h-3.5" />
                                            {hasSubmission ? 'Editar' : 'Subir'}
                                        </button>
                                    )}
                                    {hasSubmission && (
                                        <button
                                            onClick={() => openViewModal(actividad)}
                                            className="flex items-center justify-center gap-1 rounded-xl py-2 px-2 text-xs font-extrabold bg-purple-50 text-purple-700 hover:bg-purple-100 border-2 border-purple-200 transition-all active:scale-95 touch-manipulation shadow-sm"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            Ver
                                        </button>
                                    )}
                                    {actividad.notas && String(actividad.notas).trim().length > 0 && (
                                        <button
                                            onClick={() => openNotasModal(actividad)}
                                            className="flex items-center justify-center gap-1 rounded-xl py-2 px-2 text-xs font-extrabold bg-amber-50 text-amber-700 hover:bg-amber-100 border-2 border-amber-200 transition-all active:scale-95 touch-manipulation shadow-sm relative"
                                        >
                                            <MessageSquareText className="w-3.5 h-3.5" />
                                            Notas
                                            {(() => {
                                                try {
                                                    const seen = localStorage.getItem(`notas_seen_${actividad.id}`);
                                                    const notasAt = actividad.notas_at ? new Date(actividad.notas_at).getTime() : 0;
                                                    const seenAt = seen ? new Date(seen).getTime() : 0;
                                                    const isNew = notasAt && notasAt > seenAt;
                                                    return isNew ? (
                                                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
                                                    ) : null;
                                                } catch { return null; }
                                            })()}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Vista de tabla */
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border-2 border-gray-200/50 ring-2 ring-gray-100/50">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200" style={{ minWidth: '1250px' }}>
                            <thead className="bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500">
                                <tr>
                                    <th className="px-4 sm:px-4 py-3 sm:py-4 text-left text-xs font-extrabold text-white uppercase tracking-widest" style={{ minWidth: '70px' }}>No.</th>
                                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-extrabold text-white uppercase tracking-widest" style={{ minWidth: '320px' }}>Actividad</th>
                                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-extrabold text-white uppercase tracking-widest" style={{ minWidth: '160px' }}>Recursos</th>
                                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-extrabold text-white uppercase tracking-widest" style={{ minWidth: '150px' }}>Fecha Límite</th>
                                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-extrabold text-white uppercase tracking-widest" style={{ minWidth: '160px' }}>Subir / Editar</th>
                                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-extrabold text-white uppercase tracking-widest" style={{ minWidth: '130px' }}>Entregado</th>
                                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-extrabold text-white uppercase tracking-widest" style={{ minWidth: '140px' }}>Visualizar</th>
                                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-extrabold text-white uppercase tracking-widest" style={{ minWidth: '150px' }}>Calificación</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200/50">
                                {loading && (
                                    <tr>
                                        <td colSpan={8} className="px-4 sm:px-6 py-6 sm:py-8 text-center text-sm sm:text-base text-gray-500 font-medium">Cargando actividades...</td>
                                    </tr>
                                )}
                                {!loading && error && (
                                    <tr>
                                        <td colSpan={8} className="px-4 sm:px-6 py-6 sm:py-8 text-center text-sm sm:text-base text-red-600 font-semibold">{error}</td>
                                    </tr>
                                )}
                                {!loading && !error && filteredActividades.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="px-4 sm:px-6 py-6 sm:py-8 text-center text-sm sm:text-base text-gray-500 font-medium">No hay actividades.</td>
                                    </tr>
                                )}
                                {!loading && !error && filteredActividades.map((actividad, index) => {
                                    const vencida = !isWithinDeadline(actividad.fechaEntrega);
                                    // Verificar permiso de edición
                                    const tienePermisoEditar = actividad.permite_editar_despues_calificada === true ||
                                        actividad.permite_editar_despues_calificada === 1 ||
                                        actividad.permite_editar_despues_calificada === '1' ||
                                        String(actividad.permite_editar_despues_calificada) === '1';
                                    // Bloqueado si ya fue revisada y no permite editar, o si está vencida
                                    const puedeEditar = actividad.entregada && !vencida &&
                                        (actividad.estado !== 'revisada' || tienePermisoEditar);

                                    return (
                                        <tr key={actividad.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-violet-50/30 transition-colors duration-200`}>
                                            <td className="px-4 sm:px-4 py-3 sm:py-4 text-sm text-gray-700 font-extrabold">{index + 1}</td>
                                            <td className="px-4 sm:px-6 py-3 sm:py-4">
                                                <div>
                                                    <button
                                                        type="button"
                                                        onClick={() => { if (actividad.descripcion) openLongText(actividad.nombre, actividad.descripcion, { tipo: 'actividad', id: actividad.id }); }}
                                                        className={`text-sm sm:text-base font-bold text-gray-900 text-left w-full truncate ${actividad.descripcion ? 'cursor-pointer hover:underline' : ''}`}
                                                        title={actividad.nombre}
                                                    >
                                                        {actividad.nombre}
                                                    </button>
                                                    {actividad.descripcion && (
                                                        <div
                                                            onClick={() => openLongText(actividad.nombre, actividad.descripcion, { tipo: 'actividad', id: actividad.id })}
                                                            className="text-xs text-gray-500 mt-0.5 cursor-pointer group"
                                                        >
                                                            <p
                                                                style={{
                                                                    display: '-webkit-box',
                                                                    WebkitLineClamp: 2,
                                                                    WebkitBoxOrient: 'vertical',
                                                                    overflow: 'hidden',
                                                                    textAlign: 'justify',
                                                                    maxWidth: descMaxCh,
                                                                    wordBreak: 'break-word'
                                                                }}
                                                                className="group-hover:text-gray-700 transition-colors"
                                                            >
                                                                {actividad.descripcion}
                                                            </p>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); openLongText(actividad.nombre, actividad.descripcion, { tipo: 'actividad', id: actividad.id }); }}
                                                                className="mt-1 text-[11px] text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                                                            >
                                                                Ver descripción completa
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                                {actividad.recursos && actividad.recursos.length > 0 && (
                                                    <button
                                                        onClick={() => openResourcesModal(actividad)}
                                                        className="inline-flex items-center px-2.5 py-1.5 text-xs font-bold rounded-lg text-blue-700 hover:text-blue-900 hover:bg-blue-50 border-2 border-blue-200 active:scale-95 transition-all touch-manipulation shadow-sm"
                                                    >
                                                        <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" /> {actividad.recursos.length} PDF{actividad.recursos.length > 1 ? 's' : ''}
                                                    </button>
                                                )}
                                                {!actividad.recursos?.length && actividad.plantilla && (
                                                    <button
                                                        onClick={() => handleDownload(actividad.id)}
                                                        className="inline-flex items-center px-2.5 py-1.5 text-xs font-bold rounded-lg text-blue-700 hover:text-blue-900 hover:bg-blue-50 border-2 border-blue-200 active:scale-95 transition-all touch-manipulation shadow-sm"
                                                    >
                                                        <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" /> PDF
                                                    </button>
                                                )}
                                                {!actividad.plantilla && (!actividad.recursos || actividad.recursos.length === 0) && (
                                                    <span className="text-xs text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                                <div className="text-xs sm:text-sm text-gray-900 font-semibold">{new Date(actividad.fechaEntrega).toLocaleDateString('es-ES')}</div>
                                                {actividad.fecha_limite_original && actividad.fechaEntrega &&
                                                    new Date(actividad.fechaEntrega).getTime() > new Date(actividad.fecha_limite_original).getTime() && (
                                                        <div className="text-[10px] sm:text-xs text-purple-600 font-bold bg-purple-50 px-1.5 py-0.5 rounded mt-0.5">✨ Fecha extendida</div>
                                                    )}
                                                <div className={`text-[10px] sm:text-xs font-bold ${vencida ? 'text-red-600' : 'text-green-600'}`}>{vencida ? 'Vencida' : 'A tiempo'}</div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                                {!actividad.entregada ? (
                                                    <button
                                                        onClick={() => openUploadModal(actividad)}
                                                        className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 shadow-md transition-all touch-manipulation"
                                                    >
                                                        <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" /> Subir
                                                    </button>
                                                ) : (
                                                    <div className="flex flex-col items-start">
                                                        <button
                                                            onClick={() => openUploadModal(actividad)}
                                                            disabled={!puedeEditar}
                                                            title={!puedeEditar && actividad.estado === 'revisada' ? 'Esta entrega ya fue calificada y no puede modificarse' : (!puedeEditar ? 'No disponible' : 'Editar entrega')}
                                                            className={`inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm active:scale-95 transition-all touch-manipulation ${puedeEditar ? 'text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                                                }`}
                                                        >
                                                            {puedeEditar ? <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" /> : null}
                                                            {puedeEditar ? 'Editar' : 'Bloqueado'}
                                                        </button>
                                                        {!puedeEditar && actividad.estado === 'revisada' && !tienePermisoEditar && (
                                                            <span className="mt-1 text-[10px] font-bold text-purple-600">Ya calificada - no editable</span>
                                                        )}
                                                        {actividad.estado === 'revisada' && tienePermisoEditar && (
                                                            <span className="mt-1 text-[10px] font-bold text-emerald-600">✨ Edición permitida</span>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                                {actividad.entregada ? (
                                                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
                                                ) : (
                                                    <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                                                )}
                                            </td>
                                            <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => openViewModal(actividad)}
                                                    disabled={!actividad.entregada}
                                                    className={`p-2 rounded-lg active:scale-95 transition-all touch-manipulation ${actividad.entregada ? 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50' : 'text-gray-400 cursor-not-allowed'}`}
                                                    title="Ver entrega"
                                                >
                                                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                                                </button>
                                            </td>
                                            <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm">
                                                {actividad.entregada ? (
                                                    actividad.estado === 'revisada' ? (
                                                        <span className="font-extrabold text-gray-900 inline-flex items-center gap-2">
                                                            <span className="bg-gradient-to-r from-emerald-100 to-green-100 px-2.5 py-1 rounded-lg border-2 border-emerald-200 text-emerald-700">
                                                                {actividad.score !== null && actividad.score !== undefined
                                                                    ? `${Number(actividad.score).toFixed(1)}/10`
                                                                    : (actividad.mejorPuntaje !== null && actividad.mejorPuntaje !== undefined
                                                                        ? `${Number(actividad.mejorPuntaje > 10 ? actividad.mejorPuntaje / 10 : actividad.mejorPuntaje).toFixed(1)}/10`
                                                                        : '—')}
                                                            </span>
                                                            {actividad.notas && String(actividad.notas).trim().length > 0 && (
                                                                <button
                                                                    onClick={() => openNotasModal(actividad)}
                                                                    className="relative p-1.5 rounded-lg hover:bg-blue-50 active:scale-95 text-blue-600 transition-all touch-manipulation border border-blue-200"
                                                                    title="Ver notas del asesor"
                                                                >
                                                                    <MessageSquareText className="w-4 h-4" />
                                                                    {(() => {
                                                                        try {
                                                                            const seen = localStorage.getItem(`notas_seen_${actividad.id}`);
                                                                            const notasAt = actividad.notas_at ? new Date(actividad.notas_at).getTime() : 0;
                                                                            const seenAt = seen ? new Date(seen).getTime() : 0;
                                                                            const isNew = notasAt && notasAt > seenAt;
                                                                            return isNew ? (
                                                                                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
                                                                            ) : null;
                                                                        } catch { return null; }
                                                                    })()}
                                                                </button>
                                                            )}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs sm:text-sm text-amber-600 font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">En revisión</span>
                                                    )
                                                ) : (
                                                    <span className="text-xs text-gray-400">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

