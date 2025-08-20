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
  const base = `border rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 group px-4 py-5 sm:px-6 sm:py-6 flex flex-col select-none ${containerClasses}`;
  const interactiveClasses = clickable ? ' cursor-pointer active:scale-[0.97] active:shadow-sm' : '';
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
        <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform shadow-lg ${iconWrapperClass}`}>
          {icon}
        </div>
        <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-snug mb-1 line-clamp-3 flex-shrink-0">{title}</h3>
        {description && (
          <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 leading-snug line-clamp-3 flex-shrink-0">
            {description}
          </p>
        )}
      </div>
      {footer && (
        <div className="mt-auto pt-2 sm:pt-3 text-center text-xs sm:text-sm">
          {footer}
        </div>
      )}
    </div>
  );
};

export default UnifiedCard;
