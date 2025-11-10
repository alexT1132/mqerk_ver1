import React from "react";

/**
 * Reusable dashboard card.
 * Props:
 * - title: string (optional)
 * - actions: React node (optional, rendered top-right)
 * - className: extra tailwind classes
 * - children: content body
 */
export default function DashboardCard({
  title,
  actions,
  className = "",
  children,
  noPadding = false, // quita el padding interno
  full = false,      // quita borde/redondeado/sombra para full-bleed dentro de un panel
  headerPadding = true // permitir quitar padding sólo del header si se desea
}) {
  // Base visual
  const base = full
    ? "relative bg-transparent border-none shadow-none rounded-none"
    : "relative rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md dark:border-slate-700 dark:bg-slate-800";

  const containerClasses = [base, className].join(" ");

  const contentPadding = noPadding
    ? ""
    : `px-5 pb-5 ${title || actions ? 'pt-2' : 'pt-5'}`;

  const headerClasses = headerPadding && !noPadding ? "flex items-start justify-between gap-2 px-5 pt-5" : "flex items-start justify-between gap-2";

  return (
    <div className={containerClasses}>
      {(title || actions) && (
        <div className={headerClasses}>
          {title && (
            <h3 className="text-sm font-semibold tracking-wide text-slate-800 dark:text-slate-100">
              {title}
            </h3>
          )}
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}
      <div className={contentPadding}>{children}</div>
    </div>
  );
}
