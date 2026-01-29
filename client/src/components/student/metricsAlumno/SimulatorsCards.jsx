import React from 'react';
import { CardPillHeader } from './ui.jsx';

export const SimulatorsCards = ({ simulatorGrades }) => {
  const hasGeneralData = simulatorGrades?.generales?.length > 0;
  const hasSpecificData = simulatorGrades?.especificos?.length > 0 &&
    simulatorGrades.especificos.some(item => item.puntaje > 0);

  if (!hasGeneralData && !hasSpecificData) return null;

  return (
    <>
      {/* --- TARJETA: SIMULADORES GENERALES --- */}
      {hasGeneralData && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 p-5 sm:p-6 flex flex-col h-full">
          <div className="mb-6">
            <CardPillHeader
              title="Simuladores Generales"
              subtitle="Áreas Fundamentales"
              gradientClassName="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md"
              icon={(
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              )}
            />
          </div>

          <div className="flex-1 space-y-5">
            {simulatorGrades.generales.map((item, index) => (
              <div key={index} className="group">
                <div className="flex items-end justify-between mb-2">
                  <div className="flex items-center gap-2">
                     {/* Punto indicador de color */}
                    <div 
                        className="w-2 h-2 rounded-full shadow-sm"
                        style={{ backgroundColor: item.color || '#cbd5e1' }}
                    ></div>
                    <span 
                        className="text-xs sm:text-sm font-bold text-slate-700 group-hover:text-blue-700 transition-colors"
                    >
                        {item.area}
                    </span>
                  </div>
                  <span className="text-sm font-black text-slate-800">
                    {item.puntaje}%
                  </span>
                </div>
                
                {/* Barra de progreso */}
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-50 relative">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out shadow-sm relative overflow-hidden"
                    style={{
                      width: `${Math.max(item.puntaje, 5)}%`, // Mínimo 5% visual
                      background: item.color 
                        ? `linear-gradient(90deg, ${item.color}cc, ${item.color})` // Gradiente sutil
                        : '#94a3b8'
                    }}
                  >
                    {/* Brillo overlay para efecto glass */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/30"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TARJETA: MÓDULOS ESPECÍFICOS --- */}
      {hasSpecificData && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 p-5 sm:p-6 flex flex-col h-full">
          <div className="mb-6">
            <CardPillHeader
              title="Módulos Específicos"
              subtitle="Por Universidad"
              gradientClassName="bg-gradient-to-r from-purple-600 to-pink-600 shadow-md"
              icon={(
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              )}
            />
          </div>

          {/* Contenedor con scroll si hay muchos elementos */}
          <div className="flex-1 space-y-4 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
            {simulatorGrades.especificos.map((item, index) => (
              <div key={index} className="group relative">
                <div className="flex items-center justify-between mb-1.5 relative z-10">
                  
                  {/* Nombre con Truncado CSS */}
                  <span
                    className="text-xs sm:text-sm font-semibold text-slate-600 group-hover:text-purple-700 transition-colors truncate max-w-[75%]"
                    title={item.modulo} // Tooltip nativo al hacer hover
                  >
                    {item.modulo || 'Módulo Sin Nombre'}
                  </span>

                  <span className="text-xs sm:text-sm font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md group-hover:bg-purple-50 group-hover:text-purple-700 transition-colors">
                    {item.puntaje}%
                  </span>
                </div>

                {/* Barra de progreso */}
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-50">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-700 ease-out shadow-sm"
                    style={{ width: `${Math.max(item.puntaje, 5)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};