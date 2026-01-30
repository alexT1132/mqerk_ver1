import React, { useState, useMemo } from 'react';
import { CardPillHeader } from './ui.jsx'; 

// --- FUNCIONES MATEMÁTICAS (Reutilizables) ---
const toRad = (deg) => (deg * Math.PI) / 180;

const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  const angleInRadians = toRad(angleInDegrees - 90); // -90 para que 0 sea arriba (12 en punto)
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
};

const describeArc = (x, y, innerRadius, outerRadius, startAngle, endAngle) => {
    const start = polarToCartesian(x, y, outerRadius, endAngle);
    const end = polarToCartesian(x, y, outerRadius, startAngle);
    const startInner = polarToCartesian(x, y, innerRadius, endAngle);
    const endInner = polarToCartesian(x, y, innerRadius, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
        "M", start.x, start.y,
        "A", outerRadius, outerRadius, 0, largeArcFlag, 0, end.x, end.y,
        "L", endInner.x, endInner.y,
        "A", innerRadius, innerRadius, 0, largeArcFlag, 1, startInner.x, startInner.y,
        "Z"
    ].join(" ");
};

export const SubjectResultsCard = ({ subjectResults, onOpen }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Verificación de datos
  const hasSubjectData = subjectResults &&
    Array.isArray(subjectResults.subjects) &&
    subjectResults.subjects.length > 0 &&
    (subjectResults.total || 0) > 0;

  if (!hasSubjectData) return null;

  // Procesamiento de datos para el gráfico
  const chartData = useMemo(() => {
    const subjects = subjectResults.subjects;
    // Normalizamos para que la suma de porcentajes llene el círculo (distribución relativa)
    const totalScoreSum = subjects.reduce((sum, s) => sum + s.percent, 0);
    
    let currentAngle = 0;
    
    return subjects.map((subject, index) => {
      // Calculamos qué porción del círculo (360 grados) le corresponde a esta materia
      const sliceAngle = (subject.percent / totalScoreSum) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;
      
      // Ángulo medio para colocar el texto
      const midAngle = startAngle + (sliceAngle / 2);
      
      currentAngle += sliceAngle;

      return {
        ...subject,
        startAngle,
        endAngle,
        midAngle,
        isSmall: sliceAngle < 20 // Flag para ocultar texto si es muy pequeño y evitar solapamiento
      };
    });
  }, [subjectResults]);

  // Datos para mostrar en el centro (Hover o Default)
  const centerInfo = hoveredIndex !== null 
    ? { 
        label: chartData[hoveredIndex].code, 
        value: `${chartData[hoveredIndex].percent}%`, 
        sub: chartData[hoveredIndex].fullName,
        color: chartData[hoveredIndex].color 
      }
    : { 
        label: 'Promedio', 
        value: `${subjectResults.total}%`, 
        sub: 'General', 
        color: '#7e22ce' // Purple-700
      };

  // Materias por reforzar (las 2 más bajas)
  const weakSubjects = useMemo(() => {
    return [...subjectResults.subjects]
      .sort((a, b) => a.percent - b.percent)
      .slice(0, 2);
  }, [subjectResults]);

  // CONFIGURACIÓN SVG
  const size = 260;
  const center = size / 2;
  const radius = 100;
  const innerRadius = 65;

  return (
    <div
      className="group h-full cursor-pointer focus:outline-none"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      aria-label="Abrir resultados detallados por materia"
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen?.()}
    >
      <div className="h-full flex flex-col bg-white rounded-3xl border border-slate-100 shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300 p-5 sm:p-6 relative overflow-hidden">
        
        {/* Header */}
        <div className="mb-4">
            <CardPillHeader
                title="Resultados por Materia"
                gradientClassName="bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-md"
                icon={(
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                )}
            />
        </div>

        {/* CONTENIDO PRINCIPAL: GRÁFICO */}
        <div className="flex-1 flex flex-col items-center justify-center relative min-h-[220px]">
          <svg 
            viewBox={`0 0 ${size} ${size}`} 
            className="w-full h-auto max-w-[240px] drop-shadow-sm transition-all duration-300"
          >
            {chartData.map((item, index) => {
              const isHovered = hoveredIndex === index;
              // Si está hovered, expandimos un poco el radio externo para efecto "pop"
              const rEffect = isHovered ? 6 : 0; 

              // Coordenadas para el texto (código de materia)
              const textPos = polarToCartesian(center, center, (radius + innerRadius) / 2, item.midAngle);

              return (
                <g 
                    key={index}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="transition-all duration-300 cursor-pointer"
                >
                  <path
                    d={describeArc(center, center, innerRadius, radius + rEffect, item.startAngle, item.endAngle)}
                    fill={item.color}
                    stroke="white"
                    strokeWidth="2"
                    className="transition-all duration-300 ease-out"
                    // Atenuamos los otros segmentos cuando uno está seleccionado
                    opacity={hoveredIndex !== null && !isHovered ? 0.6 : 1} 
                  />
                  
                  {/* Texto dentro del arco (Solo si el segmento es lo suficientemente grande) */}
                  {!item.isSmall && (
                    <text
                        x={textPos.x}
                        y={textPos.y}
                        dy="0.35em"
                        textAnchor="middle"
                        fill="white"
                        fontSize="11"
                        fontWeight="bold"
                        className="pointer-events-none select-none drop-shadow-md"
                        style={{ opacity: hoveredIndex !== null && !isHovered ? 0.4 : 1 }}
                    >
                        {item.code}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Círculo blanco decorativo interno para limpiar bordes */}
            <circle cx={center} cy={center} r={innerRadius - 2} fill="white" />
          </svg>

          {/* INFO CENTRAL (Absoluta) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
            <div className="flex flex-col items-center justify-center w-32 h-32 rounded-full animate-in fade-in zoom-in duration-200">
                <span 
                    className="text-xs font-bold uppercase tracking-wider mb-0.5 transition-colors duration-200"
                    style={{ color: hoveredIndex !== null ? centerInfo.color : '#94a3b8' }}
                >
                    {centerInfo.label}
                </span>
                <span 
                    className="text-4xl font-black text-slate-800 tabular-nums leading-none tracking-tight"
                    style={{ color: hoveredIndex !== null ? centerInfo.color : undefined }}
                >
                    {centerInfo.value}
                </span>
                 {/* Nombre completo de la materia en el hover o "General" */}
                 <span className="text-[10px] text-slate-400 font-medium mt-1 max-w-[90px] text-center leading-tight line-clamp-2 px-1">
                    {centerInfo.sub}
                </span>
            </div>
          </div>
        </div>

        {/* FOOTER: DATOS DE REFUERZO */}
        <div className="mt-4 pt-4 border-t border-slate-50">
            <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">
                    Oportunidad de Mejora
                </span>
                
                <div className="flex flex-wrap justify-center gap-2">
                    {weakSubjects.map((subject, idx) => (
                        <div 
                            key={idx} 
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 border border-orange-100 text-orange-700"
                        >
                            <div 
                                className="w-1.5 h-1.5 rounded-full" 
                                style={{ backgroundColor: subject.color || '#f97316' }}
                            ></div>
                            <span className="text-xs font-bold">
                                {subject.code}
                            </span>
                             <span className="text-[10px] font-semibold opacity-70 border-l border-orange-200 pl-1.5 ml-0.5">
                                {subject.percent}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Call to action sutil */}
            <div className="mt-3 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-1 group-hover:translate-y-0">
                 <span className="text-xs font-semibold text-violet-600 flex items-center justify-center gap-1">
                    Ver reporte completo
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                 </span>
            </div>
        </div>

      </div>
    </div>
  );
};