import React, { useEffect, useState, useMemo } from 'react';
// IMPORTANTE: Mantenemos tus importaciones originales
import { calculatePerformanceLevel, getMotivationalFeedback } from './utils.js';

// --- FUNCIONES MATEMÁTICAS ---
const toRad = (deg) => (deg * Math.PI) / 180;

const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  const angleInRadians = toRad(angleInDegrees - 180);
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

export const FeedbackCard = ({ score: scoreProp = 0 }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  // 1. Normalizar score
  const score = Math.min(Math.max(scoreProp || 0, 0), 100);

  // 2. Obtener datos (Tu lógica original)
  const performanceLevel = calculatePerformanceLevel(score); 
  const feedback = getMotivationalFeedback(score); 

  // 3. Configuración
  const CONFIG = {
    cx: 160,
    cy: 160,
    radius: 140,
    innerRadius: 85 
  };

  // 4. Niveles (Colores Sólidos y Emojis)
  const levels = useMemo(() => [
    { level: 'E', color: '#EF4444', emoji: '😞', start: 0, end: 36 },    
    { level: 'D', color: '#F97316', emoji: '😰', start: 36, end: 72 },   
    { level: 'C', color: '#EAB308', emoji: '😐', start: 72, end: 108 },  
    { level: 'B', color: '#84CC16', emoji: '🙂', start: 108, end: 144 }, 
    { level: 'A', color: '#10B981', emoji: '🥳', start: 144, end: 180 }  
  ], []);

  // 5. Animación
  useEffect(() => {
    let start = 0;
    const end = score;
    const duration = 1000;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      
      setAnimatedScore(start + (end - start) * ease);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [score]);

  // 6. Rotación Aguja
  const rotationAngle = (animatedScore / 100) * 180 - 90;

  // 7. Estilos Badge
  const getLevelBadgeStyles = (lvl) => {
    switch(lvl) {
      case 'A': return 'bg-green-100 text-green-700 border-green-200';
      case 'B': return 'bg-lime-100 text-lime-700 border-lime-200';
      case 'C': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'D': return 'bg-orange-100 text-orange-700 border-orange-200';
      default:  return 'bg-red-100 text-red-700 border-red-200';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden font-sans p-6 pb-8">
      
      {/* Título */}
      <div className="text-center mb-6">
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
          Rendimiento General
        </h3>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">
          FEEDBACK
        </h2>
      </div>

      {/* Gráfico SVG */}
      <div className="relative w-full flex justify-center mb-2">
        <svg 
          viewBox="0 0 320 170" 
          className="w-full h-auto drop-shadow-sm"
          style={{ maxHeight: '280px', overflow: 'visible' }}
        >
          {/* Arcos */}
          {levels.map((lvl, i) => (
            <path
              key={i}
              d={describeArc(CONFIG.cx, CONFIG.cy, CONFIG.innerRadius, CONFIG.radius, lvl.start, lvl.end)}
              fill={lvl.color}
              stroke="white"
              strokeWidth="2"
            />
          ))}

          {/* Emojis */}
          {levels.map((lvl, i) => {
            const midAngle = (lvl.start + lvl.end) / 2;
            const midRadius = (CONFIG.radius + CONFIG.innerRadius) / 2;
            const pos = polarToCartesian(CONFIG.cx, CONFIG.cy, midRadius, midAngle);
            
            return (
              <text
                key={`emoji-${i}`}
                x={pos.x}
                y={pos.y}
                dy="0.35em"
                textAnchor="middle"
                fontSize="28"
                className="pointer-events-none select-none filter drop-shadow-sm"
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              >
                {lvl.emoji}
              </text>
            );
          })}

          {/* Aguja */}
          <g transform={`translate(${CONFIG.cx}, ${CONFIG.cy}) rotate(${rotationAngle})`}>
            <circle cx="0" cy="0" r="10" fill="#1e293b" />
            <path d="M -6 0 L 0 -130 L 6 0 Z" fill="#1e293b" />
          </g>
        </svg>

        {/* Score numérico y Texto "Puntaje Total" (Bajado de posición) */}
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center translate-y-4">
             <span className="text-5xl font-black text-slate-00 tabular-nums leading-none">
              {Math.round(animatedScore)}%
            </span>
             <span className="text-sm font-semibold text-slate-400 mt-2">Puntaje Total</span>
        </div>
      </div>

      {/* Panel de Feedback */}
      <div className="mt-10 flex flex-col items-center text-center">
         <div className="flex items-center gap-3 mb-2">
            <span className={`px-3 py-1 rounded-lg text-sm font-bold uppercase border ${getLevelBadgeStyles(performanceLevel.level)}`}>
              NIVEL {performanceLevel.level}
            </span>
            <h4 className="text-xl font-black text-slate-800">
              {feedback.message}
            </h4>
         </div>
         <p className="text-slate-500 text-sm font-medium max-w-xs leading-relaxed">
            {feedback.description}
         </p>
      </div>

    </div>
  );
};