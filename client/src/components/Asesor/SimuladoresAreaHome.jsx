import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';

const ArrowLeft = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const StudentsIcon = (props) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path d="M12 3l9 4-9 4-9-4 9-4zM3 10l9 4 9-4" stroke="currentColor" strokeWidth="1.6" fill="none"/>
    <path d="M7 14v4a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-4" stroke="currentColor" strokeWidth="1.6" fill="none"/>
  </svg>
);
const BrainIcon = (props) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path d="M8.5 7A3.5 3.5 0 0 0 5 10.5v3A3.5 3.5 0 0 0 8.5 17H10V7H8.5zM14 7v10h1.5A3.5 3.5 0 0 0 19 13.5v-3A3.5 3.5 0 0 0 15.5 7H14z" fill="currentColor" opacity=".25"/>
    <path d="M10 7v10m4-10v10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
  </svg>
);

// Icono compacto de "simulaciones": dos barras verticales (pausa)
const SimIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <rect x="8" y="6.5" width="3.2" height="11" rx="1.6" fill="currentColor" />
    <rect x="12.8" y="6.5" width="3.2" height="11" rx="1.6" fill="currentColor" />
  </svg>
);

export default function SimuladoresAreaHome(){
  const [search] = useSearchParams();
  const location = useLocation();
  const incoming = location.state?.title || '';
  const queryArea = (search.get('area') || '').trim();
  const areaTitle = incoming || queryArea || 'Módulo específico';

  return (
    <section className="px-3 sm:px-6 lg:px-10 pt-0 sm:pt-0 pb-6 sm:pb-8">
      <header className="-mt-3 sm:-mt-5 md:-mt-6 rounded-2xl border border-slate-200/70 bg-white shadow-sm px-3 sm:px-6 py-3 sm:py-4 mb-5 sm:mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <button
              onClick={() => window.history.back()}
              className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
              aria-label="Volver"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 truncate">{areaTitle}</h1>
              <p className="text-slate-500">Selecciona lo que quieres gestionar</p>
            </div>
          </div>
          <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100">🎯</span>
            <span className="whitespace-nowrap">2 opciones</span>
          </div>
        </div>
      </header>

      <div className="rounded-3xl bg-gradient-to-br from-violet-50 to-fuchsia-50 border border-violet-100/60 shadow-sm px-3 sm:px-6 py-3 sm:py-4 mb-6 sm:mb-10">
        <div className="flex items-center gap-3 sm:gap-4 justify-center text-center">
          <div className="inline-flex w-10 h-10 sm:w-14 sm:h-14 items-center justify-center rounded-2xl text-white shadow-md bg-gradient-to-tr from-violet-600 to-indigo-600">
            <SimIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="text-center">
            <h2 className="text-xl sm:text-3xl font-bold text-violet-800">Simulaciones por área</h2>
            <div className="mx-auto mt-1 h-1 w-28 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-10">
        <article className="rounded-3xl border border-white/60 bg-gradient-to-b from-violet-50 to-indigo-50 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
          <div className="p-5 sm:p-8 text-center">
            <div className="mx-auto inline-flex w-14 h-14 sm:w-16 sm:h-16 items-center justify-center rounded-2xl text-white shadow-lg bg-gradient-to-br from-violet-600 to-indigo-500">
              <StudentsIcon className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <h3 className="mt-5 sm:mt-6 text-lg sm:text-2xl font-semibold text-slate-900">Estudiantes</h3>
            <p className="mt-2 sm:mt-3 text-slate-600">Lista de alumnos y estado por área</p>
            <div className="mt-6 sm:mt-8">
              <Link
                to="/asesor/lista-alumnos"
                state={{ title: areaTitle }}
                className="group inline-flex items-center gap-2 font-medium text-violet-700 hover:text-violet-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300 rounded-lg"
              >
                ACCEDER
                <svg viewBox="0 0 24 24" className="w-4 h-4 transition-transform group-hover:translate-x-0.5">
                  <path d="M5 12h12M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          </div>
        </article>

        <article className="rounded-3xl border border-white/60 bg-gradient-to-b from-fuchsia-50 to-pink-50 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
          <div className="p-5 sm:p-8 text-center">
            <div className="mx-auto inline-flex w-14 h-14 sm:w-16 sm:h-16 items-center justify-center rounded-2xl text-white shadow-lg bg-gradient-to-br from-fuchsia-500 to-pink-500">
              <BrainIcon className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <h3 className="mt-5 sm:mt-6 text-lg sm:text-2xl font-semibold text-slate-900">Simuladores</h3>
            <p className="mt-2 sm:mt-3 text-slate-600">Gestiona y crea simulaciones de este módulo</p>
            <div className="mt-6 sm:mt-8">
              <Link
                to={{ pathname: '/asesor/simuladores/modulo', search: `?area=${encodeURIComponent(areaTitle)}` }}
                className="group inline-flex items-center gap-2 font-medium text-fuchsia-700 hover:text-fuchsia-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-fuchsia-300 rounded-lg"
              >
                ACCEDER
                <svg viewBox="0 0 24 24" className="w-4 h-4 transition-transform group-hover:translate-x-0.5">
                  <path d="M5 12h12M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
