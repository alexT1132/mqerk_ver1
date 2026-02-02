import React, { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Users,
  Brain,
  ArrowLeft as LucideArrowLeft,
  ArrowRight,
  Gamepad2,
  Sparkles,
  LayoutGrid,
  GraduationCap
} from "lucide-react";

/* --- Iconos inline --- */
const ArrowLeft = (props) => <LucideArrowLeft {...props} />;

// Icono compacto de "simulaciones": dos barras verticales (pausa)
const SimIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <rect x="8" y="6.5" width="3.2" height="11" rx="1.6" fill="currentColor" />
    <rect x="12.8" y="6.5" width="3.2" height="11" rx="1.6" fill="currentColor" />
  </svg>
);

export default function SimuladoresAreaHome() {
  const [search] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const incoming = location.state?.title || '';
  const queryArea = (search.get('area') || '').trim();
  const areaTitle = incoming || queryArea || 'Módulo específico';

  return (
    <section className="px-3 sm:px-6 lg:px-10 py-6 sm:py-8">
      {/* Header superior premium */}
      <header className="-mt-1 sm:-mt-2 md:-mt-3 rounded-3xl border-2 border-violet-200/60 bg-gradient-to-r from-violet-50/80 via-indigo-50/80 to-purple-50/80 shadow-xl ring-2 ring-slate-100/50 px-4 sm:px-7 py-5 sm:py-6 mb-8 relative overflow-hidden">
        {/* blobs suaves */}
        <div className="pointer-events-none absolute -left-10 -top-14 h-64 w-64 rounded-full bg-violet-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 -bottom-14 h-64 w-64 rounded-full bg-indigo-200/50 blur-3xl" />

        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate(-1)}
              className="mt-1 inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label="Volver"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 truncate">
                {areaTitle}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 font-medium mt-1.5">
                Selecciona lo que quieres gestionar
              </p>
            </div>
          </div>

          <div className="mt-1 inline-flex items-center gap-2.5 rounded-xl border-2 border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50 px-4 py-2.5 text-sm text-slate-700 shadow-md">
            <div className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-sm">
              <span className="text-xs">🎯</span>
            </div>
            <span className="whitespace-nowrap font-bold">2 opciones</span>
          </div>
        </div>
      </header>

      {/* Banner intermedio premium */}
      <div className="relative mt-2 sm:mt-3 md:mt-4 rounded-3xl border-2 border-violet-200/60 bg-gradient-to-br from-violet-50/80 via-indigo-50/80 to-purple-50/80 shadow-xl ring-2 ring-slate-100/50 px-4 sm:px-7 py-5 sm:py-6 mb-10 sm:mb-14 overflow-hidden">
        <div className="pointer-events-none absolute -left-10 -top-10 h-48 w-48 rounded-full bg-violet-200/50 blur-2xl" />
        <div className="pointer-events-none absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-indigo-200/50 blur-2xl" />
        <div className="relative z-10 flex items-center gap-4 sm:gap-5 justify-center text-center">
          <div className="relative">
            <div className="inline-flex w-16 h-16 sm:w-20 sm:h-20 items-center justify-center rounded-3xl text-white shadow-2xl bg-gradient-to-br from-violet-500 via-indigo-600 to-purple-600 ring-4 ring-white/50">
              <SimIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600">
              Simulaciones por área
            </h2>
            <div className="mx-auto mt-2 flex gap-2 justify-center">
              <span className="h-1.5 w-20 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 shadow-sm" />
              <span className="h-1.5 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid de tarjetas estilo Quizt&Act */}
      <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
        {/* Card Estudiantes */}
        <article className="group relative rounded-3xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-white shadow-xl ring-2 ring-slate-100/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:ring-blue-200/50">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-50/0 to-indigo-50/0 group-hover:from-blue-50/30 group-hover:to-indigo-50/30 transition-all duration-300" />
          <div className="relative p-6 sm:p-9 text-center">
            <div className="mx-auto inline-flex w-16 h-16 sm:w-20 sm:h-20 items-center justify-center rounded-3xl text-white shadow-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 ring-4 ring-white/50 group-hover:scale-110 transition-transform duration-300">
              <GraduationCap className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <h3 className="mt-6 sm:mt-7 text-2xl sm:text-3xl font-bold text-slate-900">
              Estudiantes
            </h3>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
              Lista de alumnos y estado por área
            </p>
            <div className="mt-7 sm:mt-9">
              <Link
                to="/asesor/lista-alumnos"
                state={{ title: areaTitle }}
                className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              >
                ACCEDER
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </article>

        {/* Card Simuladores */}
        <article className="group relative rounded-3xl border-2 border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 via-pink-50/50 to-white shadow-xl ring-2 ring-slate-100/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:ring-fuchsia-200/50">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-fuchsia-50/0 to-pink-50/0 group-hover:from-fuchsia-50/30 group-hover:to-pink-50/30 transition-all duration-300" />
          <div className="relative p-6 sm:p-9 text-center">
            <div className="mx-auto inline-flex w-16 h-16 sm:w-20 sm:h-20 items-center justify-center rounded-3xl text-white shadow-2xl bg-gradient-to-br from-fuchsia-500 via-pink-500 to-rose-600 ring-4 ring-white/50 group-hover:scale-110 transition-transform duration-300">
              <SimIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h3 className="mt-6 sm:mt-7 text-2xl sm:text-3xl font-bold text-slate-900">
              Simuladores
            </h3>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
              Gestiona y crea simulaciones de este módulo
            </p>
            <div className="mt-7 sm:mt-9">
              <Link
                to={{ pathname: '/asesor/simuladores/modulo', search: `?area=${encodeURIComponent(areaTitle)}` }}
                state={{ title: areaTitle }}
                className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              >
                ACCEDER
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
