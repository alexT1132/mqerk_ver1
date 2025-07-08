import React, { useState } from 'react';

// Componente para cada tarjeta métrica individual
function MetricCard({ title, value, icon, description, onClick, isClickable = false, colorScheme }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className={`
                relative overflow-hidden rounded-xl sm:rounded-2xl bg-white/95 backdrop-blur-sm border border-gray-200/80
                p-2 xs:p-3 sm:p-4 lg:p-5 shadow-lg hover:shadow-xl hover:bg-white transition-all duration-300 ease-out
                ${isClickable ? 'cursor-pointer hover:scale-[1.02] hover:border-gray-300/80 active:scale-[0.98]' : ''}
                min-h-[80px] xs:min-h-[90px] sm:min-h-[120px] lg:min-h-[140px] flex flex-col justify-between
            `}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Contenido principal */}
            <div className="relative z-10 flex flex-col h-full">
                {/* Header con icono */}
                <div className="flex items-start justify-between mb-2 xs:mb-3">
                    <div className={`
                        flex items-center justify-center w-6 h-6 xs:w-8 xs:h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12
                        rounded-lg sm:rounded-xl transition-all duration-300
                        ${colorScheme.iconBg}
                    `}>
                        <div className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6">
                            {icon}
                        </div>
                    </div>

                    {/* Indicador de interactividad */}
                    {isClickable && (
                        <div className={`
                            opacity-0 hover:opacity-100 transition-all duration-300 p-1 rounded-lg
                            ${isHovered ? 'opacity-100' : ''}
                            ${colorScheme.hoverBg}
                        `}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2 xs:h-3 xs:w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Valor principal */}
                <div className="mb-1 xs:mb-2 flex-1 flex items-center">
                    <span className={`
                        text-base xs:text-lg sm:text-xl lg:text-2xl xl:text-3xl font-black tracking-tight leading-none
                        ${colorScheme.valueColor}
                    `}>
                        {value}
                    </span>
                </div>

                {/* Título */}
                <h3 className="font-bold text-[8px] xs:text-[9px] sm:text-xs text-gray-600 uppercase tracking-wide mb-1 leading-tight">
                    {title}
                </h3>

                {/* Descripción */}
                <p className="text-[7px] xs:text-[8px] sm:text-xs text-gray-500 leading-tight line-clamp-2 mb-2">
                    {description}
                </p>

                {/* Barra de acento inferior */}
                <div className={`
                    w-full h-0.5 xs:h-1 rounded-full overflow-hidden transition-all duration-500
                    ${colorScheme.accentBar}
                `}>
                    <div
                        className={`
                            h-full rounded-full transition-all duration-700 ease-out
                            ${colorScheme.accentFill}
                        `}
                        style={{ width: isHovered ? '100%' : '40%' }}
                    ></div>
                </div>
            </div>
        </div>
    );
}

// Componente principal del dashboard
export function DashboardMetrics({ unreadCount, toggleNotifications }) {
    // Esquemas de color para cada tarjeta con efectos translúcidos
    const colorSchemes = [
        {
            iconBg: 'bg-emerald-100/90 hover:bg-emerald-200/90 backdrop-blur-sm',
            valueColor: 'text-emerald-700',
            hoverBg: 'hover:bg-emerald-50/80',
            accentBar: 'bg-emerald-200/60',
            accentFill: 'bg-emerald-600/90'
        },
        {
            iconBg: 'bg-amber-100/90 hover:bg-amber-200/90 backdrop-blur-sm',
            valueColor: 'text-amber-700',
            hoverBg: 'hover:bg-amber-50/80',
            accentBar: 'bg-amber-200/60',
            accentFill: 'bg-amber-600/90'
        },
        {
            iconBg: 'bg-blue-100/90 hover:bg-blue-200/90 backdrop-blur-sm',
            valueColor: 'text-blue-700',
            hoverBg: 'hover:bg-blue-50/80',
            accentBar: 'bg-blue-200/60',
            accentFill: 'bg-blue-600/90'
        },
        {
            iconBg: 'bg-purple-100/90 hover:bg-purple-200/90 backdrop-blur-sm',
            valueColor: 'text-purple-700',
            hoverBg: 'hover:bg-purple-50/80',
            accentBar: 'bg-purple-200/60',
            accentFill: 'bg-purple-600/90'
        },
        {
            iconBg: 'bg-rose-100/90 hover:bg-rose-200/90 backdrop-blur-sm',
            valueColor: 'text-rose-700',
            hoverBg: 'hover:bg-rose-50/80',
            accentBar: 'bg-rose-200/60',
            accentFill: 'bg-rose-600/90'
        }
    ];

    // Datos de ejemplo para las métricas
    const metricsData = [
        {
            id: 1,
            title: "INGRESOS",
            value: "$45,280",
            description: "Total de ingresos del mes actual",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0-2.08-.402-2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
            ),
            isClickable: true,
            onClick: () => console.log("Ver detalles de ingresos")
        },
        {
            id: 2,
            title: "PAGOS PENDIENTES",
            value: "23",
            description: "Pagos pendientes por validar",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            isClickable: true,
            onClick: () => console.log("Ver pagos pendientes")
        },
        {
            id: 3,
            title: "NUEVOS ALUMNOS",
            value: "47",
            description: "Registrados este mes",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            isClickable: true,
            onClick: () => console.log("Ver nuevos alumnos")
        },
        {
            id: 4,
            title: "ACCESOS ACTIVADOS",
            value: "156",
            description: "Accesos activados hoy",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
            ),
            isClickable: true,
            onClick: () => console.log("Ver accesos activados")
        },
        {
            id: 5,
            title: "NOTIFICACIONES",
            value: unreadCount > 0 ? String(unreadCount) : "0",
            description: unreadCount > 0 ? "Notificaciones sin leer" : "Todo al día",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-rose-700" fill="currentColor" viewBox="0 -960 960 960" stroke="none">
                    <path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z" />
                </svg>
            ),
            isClickable: true,
            onClick: toggleNotifications
        }
    ];

    return (
        <div className="w-full h-full min-h-[calc(100vh-80px)] flex flex-col">
            {/* Header del dashboard fijo arriba */}
            <div className="pt-2 xs:pt-4 sm:pt-6 lg:pt-8 pb-0 px-3 xs:px-4 sm:px-6">
                <div className="w-full max-w-7xl mx-auto text-center">
                    <h2 className="text-base xs:text-lg sm:text-xl lg:text-2xl xl:text-3xl font-black text-gray-800/90 mb-1 xs:mb-2 tracking-tight leading-tight"
                        style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif' }}>
                        Dashboard Administrativo
                    </h2>
                    <div className="w-8 xs:w-12 sm:w-16 lg:w-20 h-0.5 xs:h-1 bg-gradient-to-r from-indigo-500/80 to-purple-500/80 mx-auto mb-1 xs:mb-2 sm:mb-3 rounded-full"></div>
                    <p className="text-[10px] xs:text-xs sm:text-sm lg:text-base text-gray-600/90 font-medium max-w-md mx-auto leading-relaxed">
                        Resumen de métricas y actividades principales
                    </p>
                </div>
            </div>

            {/* Contenedor de tarjetas centrado */}
            <div className="flex-1 flex flex-col justify-center items-center py-2 xs:py-4 sm:py-6">
                <div className="w-full max-w-7xl mx-auto px-3 xs:px-4 sm:px-6">
                    {/* Grid ultra responsivo con altura dinámica */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 xs:gap-3 sm:gap-4 lg:gap-5 auto-rows-fr">
                        {metricsData.map((metric, index) => (
                            <MetricCard
                                key={metric.id}
                                title={metric.title}
                                value={metric.value}
                                icon={metric.icon}
                                description={metric.description}
                                onClick={metric.onClick}
                                isClickable={metric.isClickable}
                                colorScheme={colorSchemes[index]}
                            />
                        ))}
                    </div>

                    {/* Información adicional optimizada */}
                    <div className="mt-3 xs:mt-4 sm:mt-6 sm:hidden">
                        <div className="flex items-center justify-center gap-2 text-gray-400/80">
                            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                            <p className="text-[9px] xs:text-xs text-center">
                                Toca las tarjetas para más detalles
                            </p>
                            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
