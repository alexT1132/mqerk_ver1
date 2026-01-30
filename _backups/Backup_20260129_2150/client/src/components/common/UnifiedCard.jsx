import React from 'react';

/**
 * UnifiedCard: Tarjeta reutilizable para áreas / módulos / simulaciones
 * Props:
 * - title, description, icon (React node)
 * - footer (React node)
 * - containerClasses: clases para fondo + borde (ej. gradients)
 * - minHeight: altura mínima px (default 230)
 * - onClick: handler (añade interacción accesible)
 * - interactive: true añade cursor + efectos active
 * - disabled: desactiva interacción (añade aria-disabled)
 * - pending: estilo semitransparente (opcional)
 * - bodyClass / iconWrapperClass para ajustes finos
 */
export const UnifiedCard = ({
  title,
  description,
  icon,
  footer,
  containerClasses = '',
  minHeight = 230,
  onClick,
  interactive = true,
  disabled = false,
  pending = false,
  bodyClass = '',
  iconWrapperClass = '',
}) => {
  const clickable = interactive && !!onClick && !disabled && !pending;
  const base = `border-2 rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 group px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6 flex flex-col select-none ${containerClasses} ring-1 ring-gray-100/50`;
  const interactiveClasses = clickable ? ' cursor-pointer active:scale-[0.97] active:shadow-sm touch-manipulation' : '';
  const stateClasses = disabled ? ' opacity-50 pointer-events-none' : pending ? ' opacity-70' : '';

  const handleKey = (e) => {
    if (!clickable) return;
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); }
  };

  return (
    <div
      className={base + interactiveClasses + stateClasses + ' h-full'}
      style={{ minHeight }}
      onClick={clickable ? onClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={handleKey}
      aria-disabled={disabled || pending}
    >
      <div className={`text-center mb-2 flex-1 flex flex-col ${bodyClass}`}>
        <div className={`w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform shadow-lg ring-2 ring-white/50 ${iconWrapperClass}`}>
          {icon}
        </div>
        <h3 className="text-xs xs:text-sm sm:text-base font-extrabold text-gray-900 leading-tight mb-1.5 sm:mb-2 line-clamp-2 flex-shrink-0 px-1">{title}</h3>
        {description && (
          <p className="text-gray-600 text-[10px] xs:text-xs sm:text-sm mb-2 sm:mb-3 leading-relaxed line-clamp-2 sm:line-clamp-3 flex-shrink-0 px-1">
            {description}
          </p>
        )}
      </div>
      {footer && (
        <div className="mt-auto pt-2 sm:pt-3 border-t border-gray-200/50 text-center text-[10px] xs:text-xs sm:text-sm">
          {footer}
        </div>
      )}
    </div>
  );
};

export default UnifiedCard;
