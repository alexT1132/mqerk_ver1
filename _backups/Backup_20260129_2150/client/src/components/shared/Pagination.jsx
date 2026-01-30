import React, { useMemo } from 'react';

// Reusable Pagination component
// Props:
// - totalItems: number (required)
// - pageSize: number (default 10)
// - currentPage: number (1-based)
// - onPageChange: (page:number) => void
// - siblingCount: number (how many pages to show around current, default 1)
// - showSummary: boolean (show "Mostrando X–Y de Z")
// - className: string (extra classes for container)
export default function Pagination({
  totalItems = 0,
  pageSize = 10,
  currentPage = 1,
  onPageChange,
  siblingCount = 1,
  showSummary = true,
  className = '',
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize || 1));

  // Hide if only one page
  if (totalPages <= 1) return null;

  const clamp = (p) => Math.min(Math.max(p, 1), totalPages);
  const prev = () => onPageChange && onPageChange(clamp(currentPage - 1));
  const next = () => onPageChange && onPageChange(clamp(currentPage + 1));

  const range = useMemo(() => {
    const DOTS = 'DOTS';
    const totalPageNumbers = siblingCount * 2 + 5; // first, last, current, 2 dots
    if (totalPageNumbers >= totalPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const showLeftDots = leftSiblingIndex > 2;
    const showRightDots = rightSiblingIndex < totalPages - 1;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    if (!showLeftDots && showRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, DOTS, totalPages];
    }

    if (showLeftDots && !showRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from({ length: rightItemCount }, (_, i) => totalPages - rightItemCount + 1 + i);
      return [firstPageIndex, DOTS, ...rightRange];
    }

    const middleRange = Array.from({ length: rightSiblingIndex - leftSiblingIndex + 1 }, (_, i) => leftSiblingIndex + i);
    return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
  }, [currentPage, siblingCount, totalPages]);

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${className}`}>
      {showSummary && (
        <div className="text-xs sm:text-sm text-gray-600">
          Mostrando <span className="font-medium text-gray-900">{start}</span>
          {`–`}<span className="font-medium text-gray-900">{end}</span> de
          <span className="font-medium text-gray-900"> {totalItems}</span>
        </div>
      )}

      <nav className="inline-flex items-center gap-1" aria-label="Paginación">
        <button
          type="button"
          onClick={prev}
          disabled={currentPage <= 1}
          className="px-2.5 py-1.5 rounded-lg border text-sm disabled:opacity-50 disabled:cursor-not-allowed bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Anterior
        </button>
        <ul className="flex items-center gap-1">
          {range.map((item, idx) => {
            if (item === 'DOTS') {
              return (
                <li key={`dots-${idx}`} className="px-2.5 py-1.5 text-gray-500">…</li>
              );
            }
            const page = item;
            const isActive = page === currentPage;
            return (
              <li key={page}>
                <button
                  type="button"
                  onClick={() => onPageChange && onPageChange(page)}
                  className={`px-2.5 py-1.5 rounded-lg border text-sm transition ${
                    isActive
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={`Página ${page}`}
                >
                  {page}
                </button>
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          onClick={next}
          disabled={currentPage >= totalPages}
          className="px-2.5 py-1.5 rounded-lg border text-sm disabled:opacity-50 disabled:cursor-not-allowed bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Siguiente
        </button>
      </nav>
    </div>
  );
}
