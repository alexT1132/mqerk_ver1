import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrencyMXN } from '../../utils/formatters.js';
import { useAdminNotificationContext } from '../../context/AdminNotificationContext.jsx';
import LoadingOverlay from '../shared/LoadingOverlay.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

// INTEGRACIÓN BACKEND - ¡Contexto admin listo!
import { useAdminContext } from '../../context/AdminContext.jsx';

// Componente para cada tarjeta métrica individual
function MetricCard({ title, value, icon, description, onClick, isClickable = false, colorScheme, isLoading = false }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className={`
                relative overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl 
                bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30
                border-2 border-gray-200/60 hover:border-indigo-300/80 shadow-lg hover:shadow-2xl
                p-3 xs:p-3.5 sm:p-4 md:p-5 lg:p-6 
                transition-all duration-300 ease-out group
                ${isClickable ? 'cursor-pointer hover:scale-[1.02] active:scale-95 hover:-translate-y-1 touch-manipulation' : ''}
                min-h-[90px] xs:min-h-[100px] sm:min-h-[120px] md:min-h-[140px] lg:min-h-[160px] 
                flex flex-col justify-between
                ${isLoading ? 'animate-pulse' : ''}
                ring-2 ring-transparent hover:ring-indigo-200/50
                before:absolute before:inset-0 before:bg-gradient-to-br before:from-transparent before:via-white/30 before:to-transparent before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100
            `}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >

            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="w-full h-full bg-repeat bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2740%27%20height%3D%2740%27%20viewBox%3D%270%200%2040%2040%27%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%3E%3Cg%20fill%3D%27%23000000%27%20fill-opacity%3D%270.1%27%3E%3Cpath%20d%3D%27M20%2020c0-1%201-2%202-2s2%201%202%202-1%202-2%202-2-1-2-2z%27/%3E%3C/g%3E%3C/svg%3E')]"></div>
            </div>

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start justify-between mb-2 xs:mb-3 sm:mb-4">
                    <div className={`
                        relative flex items-center justify-center 
                        w-9 h-9 xs:w-10 xs:h-10 sm:w-12 sm:h-12 md:w-13 md:h-13 lg:w-14 lg:h-14
                        rounded-xl sm:rounded-2xl transition-all duration-500 shadow-lg group-hover:shadow-2xl
                        ${colorScheme.iconBg} 
                        group-active:scale-95
                        group-hover:scale-110 group-hover:rotate-3
                        ring-2 ring-white/50
                    `}>

                        <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <div className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 relative z-10 transition-transform duration-500 group-hover:scale-110 drop-shadow-md">
                            {icon}
                        </div>
                    </div>

                    {isClickable && (
                        <div className={`
                            opacity-0 group-hover:opacity-100 transition-all duration-500 p-1.5 xs:p-2 rounded-xl
                            ${colorScheme.hoverBg} transform translate-x-4 group-hover:translate-x-0
                            ring-1 ring-indigo-200/50
                        `}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 12h12" />
                            </svg>
                        </div>
                    )}
                </div>

                <div className="mb-1.5 xs:mb-2 sm:mb-3 flex-1 flex items-center">
                    <span className={`
                        text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 
                        font-extrabold tracking-tight leading-none
                        ${colorScheme.valueColor} 
                        group-hover:scale-105 transition-transform duration-300
                        drop-shadow-md
                    `}>
                        {isLoading ? '...' : value}
                    </span>
                </div>

                <h3 className="font-extrabold text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs text-gray-800 uppercase tracking-wider mb-1 leading-tight group-hover:text-indigo-700 transition-colors duration-300">
                    {title}
                </h3>

                <p className="text-[7px] xs:text-[8px] sm:text-[9px] md:text-xs text-gray-600 leading-tight line-clamp-2 mb-2 xs:mb-2.5 sm:mb-3 group-hover:text-gray-700 transition-colors duration-300 font-medium">
                    {isLoading ? 'Cargando datos...' : description}
                </p>


                <div className={`
                    w-full h-1 xs:h-1.5 sm:h-2 rounded-full overflow-hidden transition-all duration-500 shadow-inner
                    ${colorScheme.accentBar}
                `}>
                    <div
                        className={`
                            h-full rounded-full transition-all duration-1000 ease-out relative
                            ${colorScheme.accentFill}
                            before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent before:translate-x-[-100%] before:transition-transform before:duration-1000 group-hover:before:translate-x-[100%]
                            ${isHovered ? 'w-full' : 'w-[45%]'}
                        `}
                    ></div>
                </div>
            </div>
        </div>
    );
}

// Componente principal del dashboard de métricas
function DashboardMetrics() {
    // Integración con el backend - usa el contexto AdminContext
    const {
        dashboardData,
        isLoading,
        error,
        refreshDashboard,
        lastUpdated
    } = useAdminContext();
    const navigate = useNavigate();

    // Session validation
    const { isAuthenticated, loading } = useAuth();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/login', { replace: true });
        }
    }, [loading, isAuthenticated, navigate]);

    // Show loading state while checking authentication
    if (loading || !isAuthenticated) {
        return (
            <div className="w-full h-full min-h-[calc(100vh-80px)] flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-indigo-600 font-medium">Verificando sesión...</p>
                </div>
            </div>
        );
    }

    // Obtener datos de notificaciones del contexto
    // AdminNotificationContext.jsx proporciona: unreadCount, toggleNotifications, notifications, etc.
    // Este contexto centraliza el estado de notificaciones entre HeaderAdmin y DashboardMetrics
    const { unreadCount, toggleNotifications } = useAdminNotificationContext(); // ← AdminNotificationContext.jsx

    // Esquemas de colores para cada tarjeta de métrica
    const colorSchemes = [
        {
            iconBg: 'bg-gradient-to-br from-emerald-100 to-green-200 hover:from-emerald-200 hover:to-green-300 backdrop-blur-sm',
            valueColor: 'text-emerald-700',
            hoverBg: 'hover:bg-emerald-50/80',
            accentBar: 'bg-emerald-200/60',
            accentFill: 'bg-gradient-to-r from-emerald-500 to-green-600'
        },
        {
            iconBg: 'bg-gradient-to-br from-amber-100 to-yellow-200 hover:from-amber-200 hover:to-yellow-300 backdrop-blur-sm',
            valueColor: 'text-amber-700',
            hoverBg: 'hover:bg-amber-50/80',
            accentBar: 'bg-amber-200/60',
            accentFill: 'bg-gradient-to-r from-amber-500 to-yellow-600'
        },
        {
            iconBg: 'bg-gradient-to-br from-blue-100 to-cyan-200 hover:from-blue-200 hover:to-cyan-300 backdrop-blur-sm',
            valueColor: 'text-blue-700',
            hoverBg: 'hover:bg-blue-50/80',
            accentBar: 'bg-blue-200/60',
            accentFill: 'bg-gradient-to-r from-blue-500 to-cyan-600'
        },
        {
            iconBg: 'bg-gradient-to-br from-purple-100 to-violet-200 hover:from-purple-200 hover:to-violet-300 backdrop-blur-sm',
            valueColor: 'text-purple-700',
            hoverBg: 'hover:bg-purple-50/80',
            accentBar: 'bg-purple-200/60',
            accentFill: 'bg-gradient-to-r from-purple-500 to-violet-600'
        },
        {
            iconBg: 'bg-gradient-to-br from-rose-100 to-pink-200 hover:from-rose-200 hover:to-pink-300 backdrop-blur-sm',
            valueColor: 'text-rose-700',
            hoverBg: 'hover:bg-rose-50/80',
            accentBar: 'bg-rose-200/60',
            accentFill: 'bg-gradient-to-r from-rose-500 to-pink-600'
        }
    ];


    const icons = {
        ingresos: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.9 0 2.50-.87 2.50-2.05 0-1.33-.73-1.94-2.78-2.73-2.24-.83-3.55-1.85-3.55-3.96 0-1.82 1.29-3.16 3.1-3.46V4h2.67v1.8c1.79.30 2.88 1.26 3.02 3.05h-1.94c-.12-.79-.62-1.76-2.33-1.76-1.06 0-2.31.56-2.31 1.85 0 .97.74 1.60 2.70 2.37 2.24.87 3.64 1.87 3.64 4.19 0 1.78-1.15 3.09-3.14 3.59z" />
            </svg>
        ),
        pagos: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
                <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
            </svg>
        ),
        alumnos: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 18v-4.5c0-1.1.9-2 2-2s2 .9 2 2V18h3v-7.5c0-1.1.9-2 2-2s2 .9 2 2V18h3v-6c0-.8.7-1.5 1.5-1.5S21 11.2 21 12v6h1v2H2v-2h2z" />
                <path d="M12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5z" />
                <path d="M5.5 6.5C6.33 6.5 7 5.83 7 5S6.33 3.5 5.5 3.5 4 4.17 4 5s.67 1.5 1.5 1.5z" />
            </svg>
        ),
        cursos: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
            </svg>
        ),
        accesos: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM15.1 8H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z" />
            </svg>
        ),
        notificaciones: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-rose-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
            </svg>
        )
    };

    // Cargar datos del dashboard al montar el componente
    // Los datos se cargan automáticamente desde AdminContext

    // Función para manejar clics en las tarjetas de métricas
    const handleCardClick = (metricType) => {
        // Ejemplo de navegación condicional (nota: ya no es admin1 por órdenes superiores)
        switch (metricType) {
            case 'ingresos':
                navigate('/administrativo/reportes-pagos');
                break;
            case 'pagos-pendientes':
                navigate('/administrativo/comprobantes-recibo');
                break;
            case 'nuevos-alumnos':
                // navigate('/admin/lista-alumnos');
                break;
            case 'cursos-activos':
                // navigate('/admin/gestion-cursos');
                break;
            case 'accesos-activados':
                // navigate('/admin/gestion-accesos');
                break;
            default:
                break;
        }
    };

    // Función para refrescar datos manualmente (backend real)
    const handleRefreshData = async () => {
        if (isLoading) return;

        try {
            await refreshDashboard();
        } catch (err) {
            // Error manejado por el contexto
        }
    };

    /**
     * Configuración de métricas - LISTO PARA BACKEND ✅
     * 
     * DATOS DESDE CONTEXTOS (NO requiere modificaciones en este componente):
     * - dashboardData: AdminContext.jsx → ingresos, pagosPendientes, nuevosAlumnos, cursosActivos, accesosActivados
     * - unreadCount: AdminNotificationContext.jsx → cantidad de notificaciones sin leer
     * - isLoading: Estado de carga automático desde contextos
     * 
     * PARA ACTIVAR BACKEND: Solo configurar AdminContext.jsx y AdminNotificationContext.jsx
     */
    const getMetricsData = () => {
        if (!dashboardData) return [];

        const periodo = dashboardData.ingresosPeriodo;
        const descIngresos = periodo
            ? `${periodo.isFallback ? 'Ingresos del último mes con pagos: ' : 'Ingresos del mes actual: '} ${periodo.etiqueta}`
            : 'Ingresos acumulados del mes actual';
        return [
            {
                id: 'ingresos',
                title: "INGRESOS TOTALES",
                value: isLoading ? '...' : formatCurrencyMXN(dashboardData.ingresos || 0), // ← AdminContext.jsx
                description: descIngresos,
                icon: icons.ingresos,
                isClickable: true,
                onClick: () => handleCardClick('ingresos')
            },
            {
                id: 'pagos',
                title: "PAGOS PENDIENTES",
                value: isLoading ? '...' : String(dashboardData.pagosPendientes || '0'), // ← AdminContext.jsx
                description: "Pagos en espera de validación",
                icon: icons.pagos,
                isClickable: true,
                onClick: () => handleCardClick('pagos-pendientes')
            },
            {
                id: 'alumnos',
                title: "NUEVOS ALUMNOS",
                value: isLoading ? '...' : String(dashboardData.nuevosAlumnos || '0'), // ← AdminContext.jsx
                description: "Registros nuevos este mes",
                icon: icons.alumnos,
                isClickable: true,
                onClick: () => handleCardClick('nuevos-alumnos')
            },
            {
                id: 'cursos',
                title: "CURSOS ACTIVOS",
                value: isLoading ? '...' : String(dashboardData.cursosActivos || '0'), // ← AdminContext.jsx
                description: "Cursos con estudiantes activos",
                icon: icons.cursos,
                isClickable: true,
                onClick: () => handleCardClick('cursos-activos')
            },
            {
                id: 'accesos',
                title: "ACCESOS ACTIVADOS",
                value: isLoading ? '...' : String(dashboardData.accesosActivados || '0'), // ← AdminContext.jsx
                description: "Accesos habilitados hoy",
                icon: icons.accesos,
                isClickable: true,
                onClick: () => handleCardClick('accesos-activados')
            },
            {
                id: 'notificaciones',
                title: "NOTIFICACIONES",
                value: unreadCount > 0 ? String(unreadCount) : "0", // ← AdminNotificationContext.jsx
                description: unreadCount > 0 ? "Notificaciones sin leer" : "Todo al día",
                icon: icons.notificaciones,
                isClickable: true,
                onClick: toggleNotifications // ← AdminNotificationContext.jsx
            }
        ];
    };

    // Manejo de errores con opción de reintentar
    if (error) {
        return (
            <div className="w-full h-full min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-rose-100 px-3 xs:px-4">
                <div className="text-center bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 border-2 border-red-200 ring-2 ring-red-100/50 max-w-md w-full">
                    <div className="w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 ring-2 ring-red-200/50 shadow-lg">
                        <svg className="w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-lg xs:text-xl sm:text-2xl font-extrabold text-red-700 mb-2 sm:mb-3">Error al cargar datos</h2>
                    <p className="text-sm xs:text-base text-gray-700 mb-5 sm:mb-6 max-w-md mx-auto font-medium">{error}</p>
                    <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 justify-center">
                        <button
                            onClick={handleRefreshData}
                            disabled={isLoading}
                            className="px-5 xs:px-6 py-2 xs:py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl sm:rounded-2xl hover:from-red-700 hover:to-rose-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm xs:text-base shadow-lg hover:shadow-xl active:scale-95 touch-manipulation"
                        >
                            {isLoading ? 'Reintentando...' : 'Reintentar'}
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-5 xs:px-6 py-2 xs:py-2.5 bg-gradient-to-r from-gray-600 to-slate-600 text-white rounded-xl sm:rounded-2xl hover:from-gray-700 hover:to-slate-700 transition-all duration-200 font-semibold text-sm xs:text-base shadow-lg hover:shadow-xl active:scale-95 touch-manipulation"
                        >
                            Recargar página
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const metricsData = getMetricsData();

    return (
        <div className="relative w-full h-full min-h-[calc(100vh-80px)] flex flex-col bg-white">
            {isLoading && (
                <LoadingOverlay message="Cargando métricas del dashboard..." />
            )}
            {/* Header con información de actualización */}
            <div className="pt-3 xs:pt-4 sm:pt-5 md:pt-6 lg:pt-8 pb-0 px-3 xs:px-4 sm:px-5 md:px-6">
                <div className="w-full max-w-7xl xl:max-w-screen-2xl 2xl:max-w-none mx-auto">
                    <div className="text-center mb-3 xs:mb-4 sm:mb-5">

                        <h2 className="relative inline-block 
                            text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl 
                            font-extrabold 
                            bg-gradient-to-r from-indigo-700 via-purple-700 to-violet-700
                            bg-clip-text text-transparent
                            mb-2 xs:mb-3 sm:mb-4 
                            tracking-tight leading-tight
                            drop-shadow-sm
                        ">
                            Dashboard Administrativo
                        </h2>
                        <div className="w-12 xs:w-16 sm:w-20 md:w-24 lg:w-28 h-0.5 xs:h-1 sm:h-1.5 bg-gradient-to-r from-indigo-500/80 via-purple-500/80 to-violet-500/80 mx-auto mb-2 xs:mb-3 sm:mb-4 rounded-full"></div>
                        <p className="text-xs xs:text-sm sm:text-base md:text-lg text-gray-700/90 font-semibold max-w-md mx-auto leading-relaxed px-2">
                            {isLoading ? 'Cargando métricas...' : 'Resumen de métricas y actividades principales'}
                        </p>
                    </div>

                    {/* Información de última actualización y botón de refresh */}
                    <div className="flex flex-col xs:flex-row items-center justify-between gap-2 xs:gap-0 text-xs xs:text-sm text-gray-600 mb-3 xs:mb-4 px-2">
                        <div className="flex items-center gap-2">
                            {lastUpdated && (
                                <>
                                    <svg className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-semibold">
                                        Actualizado: {new Date(lastUpdated).toLocaleTimeString('es-ES', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </>
                            )}
                        </div>
                        <button
                            onClick={handleRefreshData}
                            disabled={isLoading}
                            className="flex items-center gap-1.5 xs:gap-2 px-3 xs:px-4 py-1.5 xs:py-2 
                                bg-gradient-to-r from-indigo-600 to-purple-600 
                                text-white rounded-lg xs:rounded-xl
                                hover:from-indigo-700 hover:to-purple-700 
                                transition-all duration-200 
                                disabled:opacity-50 disabled:cursor-not-allowed
                                shadow-md hover:shadow-lg
                                active:scale-95 touch-manipulation
                                font-semibold text-xs xs:text-sm
                            "
                        >
                            <svg className={`w-3.5 h-3.5 xs:w-4 xs:h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>{isLoading ? 'Actualizando...' : 'Actualizar'}</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center py-3 xs:py-4 sm:py-5 md:py-6">
                <div className="w-full max-w-7xl xl:max-w-screen-2xl 2xl:max-w-none mx-auto px-3 xs:px-4 sm:px-5 md:px-6 2xl:px-4">
                    <div className="grid grid-cols-6 gap-2 xs:gap-3 sm:gap-4 md:gap-5 lg:gap-6 2xl:gap-8 auto-rows-fr">
                        {metricsData.map((metric, index) => (
                            <MetricCard
                                key={metric.id}
                                title={metric.title}
                                value={metric.value}
                                icon={metric.icon}
                                description={metric.description}
                                onClick={metric.onClick}
                                isClickable={metric.isClickable}
                                colorScheme={colorSchemes[index % colorSchemes.length]}
                                isLoading={isLoading}
                            />
                        ))}
                    </div>

                    {/* Indicador móvil */}
                    <div className="mt-4 xs:mt-5 sm:mt-6 lg:hidden">
                        <div className="flex items-center justify-center gap-2 text-gray-500/80">
                            <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full"></div>
                            <p className="text-[9px] xs:text-xs sm:text-sm text-center font-medium">
                                Toca las tarjetas para más detalles
                            </p>
                            <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full"></div>
                        </div>
                    </div>

                    {/* Footer con información adicional */}
                    <div className="mt-5 xs:mt-6 sm:mt-8 text-center">
                        <div className="text-xs xs:text-sm text-gray-500 font-medium">
                            <span>Datos actualizados automáticamente cada 5 minutos</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DashboardMetrics;