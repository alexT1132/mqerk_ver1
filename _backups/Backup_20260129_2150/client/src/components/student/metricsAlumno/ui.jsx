import React from 'react';

/**
 * Envoltorio para tarjetas con comportamientos de accesibilidad y micro-interacciones.
 * Añade efectos de escala sutiles al hover y active.
 */
export const ClickableCard = ({ onClick, className = '', ariaLabel, children }) => {
  const isClickable = typeof onClick === 'function';

  return (
    <div
      className={`
        relative group transition-all duration-300 ease-out h-full
        ${isClickable 
          ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30' 
          : ''} 
        ${className}
      `}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={isClickable ? (ariaLabel || 'Abrir detalle') : undefined}
      onKeyDown={(e) => {
        if (!isClickable) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {children}
    </div>
  );
};

/**
 * Encabezado estilo "Píldora" con gradiente y sombra.
 * Soporta icono, título y subtítulo.
 */
export const CardPillHeader = ({ title, subtitle, gradientClassName, icon }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      {/* Píldora con gradiente */}
      <div 
        className={`
          inline-flex items-center justify-center 
          ${gradientClassName} 
          text-white 
          rounded-full 
          px-4 sm:px-5 py-1.5 sm:py-2 
          mb-3 
          shadow-lg shadow-black/5
          border border-white/20 
          backdrop-blur-sm
          transform transition-transform hover:scale-105 duration-300
        `}
      >
        {icon ? (
          <span className="mr-2.5 flex items-center justify-center opacity-90">
            {icon}
          </span>
        ) : null}
        
        <h3 className="text-sm sm:text-base font-black tracking-wide leading-none pt-0.5">
          {title}
        </h3>
      </div>
      
      {/* Subtítulo (opcional) */}
      {subtitle ? (
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider max-w-[90%] leading-relaxed">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
};