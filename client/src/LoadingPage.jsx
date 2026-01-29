import React from "react";

/* ========== 1) Pantalla completa ========== */
export function LoadingPage() {
  return (
    <main
      role="status"
      aria-live="polite"
      className="grid min-h-[100svh] place-items-center bg-white px-6"
    >
      <div className="flex flex-col items-center gap-6 text-center">
        {/* Spinner */}
        <div className="relative">
          <div className="h-14 w-14 rounded-full border-2 border-slate-200" />
          <div className="absolute inset-0 h-14 w-14 rounded-full border-2 border-slate-900 border-t-transparent animate-spin [animation-duration:900ms]" />
        </div>

        <div className="space-y-1">
          <p className="text-base font-medium text-slate-800">Cargando…</p>
          <p className="text-sm text-slate-500">Esto tomará solo un momento</p>
        </div>

        {/* Barra sutil */}
        <div className="h-1.5 w-[240px] overflow-hidden rounded-full bg-slate-200">
          <div className="h-full w-1/2 animate-pulse bg-slate-900/80" />
        </div>
      </div>
    </main>
  );
}

/* ========== 2) Overlay bloqueante ========== */
export function LoadingOverlay() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 grid place-items-center bg-white/70 backdrop-blur-sm"
    >
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-md">
        <div className="relative">
          <div className="h-5 w-5 rounded-full border-2 border-slate-200" />
          <div className="absolute inset-0 h-5 w-5 rounded-full border-2 border-slate-900 border-t-transparent animate-spin [animation-duration:900ms]" />
        </div>
        <span className="text-sm font-medium text-slate-800">Procesando…</span>
      </div>
    </div>
  );
}

/* ========== 3) Esqueletos de tarjetas (opcional) ========== */
export function SkeletonCards() {
  return (
    <div className="mx-auto w-full max-w-7xl p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="h-4 w-32 rounded bg-slate-200/80 animate-pulse" />
            <div className="mt-4 h-6 w-24 rounded bg-slate-200/80 animate-pulse" />
            <div className="mt-3 h-3 w-48 rounded bg-slate-200/70 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
