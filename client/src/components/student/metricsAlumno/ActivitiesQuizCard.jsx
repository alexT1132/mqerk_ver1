import React from 'react';
import { ClickableCard, CardPillHeader } from './ui.jsx';

export const ActivitiesQuizCard = ({ currentMetricsData, onOpen }) => {
  // Verificación de seguridad para datos
  const hasActivityData = currentMetricsData?.activityProgress &&
    currentMetricsData.activityProgress.length > 0 &&
    currentMetricsData.activityProgress.some(item => (item.activities > 0 || item.quizts > 0));

  if (!hasActivityData) return null;

  // Extraemos los últimos 4 periodos para mostrar
  const chartData = currentMetricsData.activityProgress.slice(-4);

  return (
    <ClickableCard
      ariaLabel="Abrir detalle de avance de actividades y quizzes"
      onClick={onOpen}
    >
      <div className="group h-full flex flex-col justify-between bg-white rounded-3xl border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 p-5 sm:p-6 overflow-hidden relative">
        
        {/* Header con gradiente */}
        <div className="mb-6">
          <CardPillHeader
            title="Actividades y Evaluaciones"
            gradientClassName="bg-gradient-to-r from-blue-600 to-purple-600 shadow-md"
            icon={(
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            )}
          />
        </div>

        {/* GRÁFICO DE BARRAS INTERACTIVO */}
        <div className="flex-1 flex flex-col justify-end min-h-[140px] mb-6">
          <div className="flex items-end justify-between px-2 gap-2 sm:gap-4 h-full">
            {chartData.map((item, index) => (
              <div key={index} className="flex flex-col items-center justify-end h-full w-full">
                
                {/* Contenedor de barras */}
                <div className="flex items-end gap-1.5 sm:gap-2 h-full pb-2">
                  
                  {/* Barra Azul (Actividades) */}
                  <div className="relative group/bar flex flex-col items-center justify-end h-full w-3 sm:w-5 bg-blue-50 rounded-full">
                    <div 
                      className="w-full rounded-full bg-blue-500 group-hover/bar:bg-blue-600 transition-all duration-300 relative"
                      style={{ height: `${Math.max(15, item.activities)}%` }} // Min 15% para visibilidad visual
                    >
                       {/* Tooltip */}
                       <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 opacity-0 group-hover/bar:opacity-100 transition-all duration-200 pointer-events-none transform translate-y-2 group-hover/bar:translate-y-0 z-10">
                          <div className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                            {item.activities}%
                          </div>
                          {/* Triangulito del tooltip */}
                          <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-blue-600 mx-auto"></div>
                       </div>
                    </div>
                  </div>

                  {/* Barra Morada (Quizzes) */}
                  <div className="relative group/bar flex flex-col items-center justify-end h-full w-3 sm:w-5 bg-purple-50 rounded-full">
                    <div 
                      className="w-full rounded-full bg-purple-500 group-hover/bar:bg-purple-600 transition-all duration-300 relative"
                      style={{ height: `${Math.max(15, item.quizts)}%` }}
                    >
                       {/* Tooltip */}
                       <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 opacity-0 group-hover/bar:opacity-100 transition-all duration-200 pointer-events-none transform translate-y-2 group-hover/bar:translate-y-0 z-10">
                          <div className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                            {item.quizts}%
                          </div>
                          <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-purple-600 mx-auto"></div>
                       </div>
                    </div>
                  </div>

                </div>

                {/* Etiqueta del Periodo */}
                <span className="text-[10px] sm:text-xs font-semibold text-slate-400 mt-1 truncate max-w-[50px] text-center">
                  {item.period}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* LEYENDA (Simple dots) */}
        <div className="flex justify-center gap-6 mb-6">
           <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="text-xs font-medium text-slate-500">Actividades</span>
           </div>
           <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              <span className="text-xs font-medium text-slate-500">Quizzes</span>
           </div>
        </div>

        {/* TARJETAS DE RESUMEN (Stats) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Bloque Actividades */}
          <div className="relative overflow-hidden rounded-2xl bg-blue-50/50 p-4 border border-blue-100 transition-colors group-hover:bg-blue-50">
            <div className="relative z-10">
              <div className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-1">
                {currentMetricsData.activities.current}
                <span className="text-sm font-medium text-slate-400 ml-1 font-sans">/ {currentMetricsData.activities.total}</span>
              </div>
              <div className="text-xs font-bold text-blue-600 uppercase tracking-wide">Actividades</div>
            </div>
            {/* Elemento decorativo de fondo */}
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-blue-200/30 rounded-full blur-xl"></div>
          </div>

          {/* Bloque Quizzes */}
          <div className="relative overflow-hidden rounded-2xl bg-purple-50/50 p-4 border border-purple-100 transition-colors group-hover:bg-purple-50">
            <div className="relative z-10">
              <div className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-1">
                {currentMetricsData.quiz.current}
                <span className="text-sm font-medium text-slate-400 ml-1 font-sans">/ {currentMetricsData.quiz.total}</span>
              </div>
              <div className="text-xs font-bold text-purple-600 uppercase tracking-wide">Quizzes</div>
            </div>
             {/* Elemento decorativo de fondo */}
             <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-purple-200/30 rounded-full blur-xl"></div>
          </div>
        </div>

        {/* Call to Action Sutil (Solo aparece al hover de la tarjeta) */}
        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <div className="bg-slate-100 p-1.5 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
           </div>
        </div>

      </div>
    </ClickableCard>
  );
};