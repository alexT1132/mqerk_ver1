import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

/* --- Iconos inline --- */
const ArrowLeft = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const TargetIcon = (props) => (
  <svg viewBox="0 0 24 24" {...props}>
    <circle cx="12" cy="12" r="9" fill="white" opacity=".15" />
    <circle cx="12" cy="12" r="5" fill="white" opacity=".25" />
    <circle cx="12" cy="12" r="2" fill="white" />
  </svg>
);
const DocIcon = (props) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path d="M9 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9l-6-6H9z" fill="currentColor" opacity=".2"/>
    <path d="M9 3v4a2 2 0 0 0 2 2h6M9 13h6M9 17h6M9 9h2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
  </svg>
);
const BrainIcon = (props) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path d="M8.5 7A3.5 3.5 0 0 0 5 10.5v3A3.5 3.5 0 0 0 8.5 17H10V7H8.5zM14 7v10h1.5A3.5 3.5 0 0 0 19 13.5v-3A3.5 3.5 0 0 0 15.5 7H14z" fill="currentColor" opacity=".25"/>
    <path d="M10 7v10m4-10v10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
  </svg>
);

export default function ActividadesQuizzesPage() {
  const location = useLocation();

  // 1) Leer el título enviado por Link state (desde las tarjetas)
  const incomingTitle = location.state?.title;

  // 2) Persistir en sessionStorage para que sobreviva a refresh/navegación directa
  const [areaTitle, setAreaTitle] = useState(
    incomingTitle ||
      sessionStorage.getItem("selectedAreaTitle") ||
      "Español y redacción indirecta"
  );

  useEffect(() => {
    if (incomingTitle && incomingTitle !== areaTitle) {
      setAreaTitle(incomingTitle);
      sessionStorage.setItem("selectedAreaTitle", incomingTitle);
    }
  }, [incomingTitle]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="px-4 sm:px-6 lg:px-10 py-8">
      {/* Header superior */}
      <header className="rounded-2xl border border-slate-200/70 bg-white shadow-sm px-4 sm:px-6 py-5 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Link
              to="/asesor/actividades"
              className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
              aria-label="Volver"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              {/* 3) Usar el título dinámico */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {areaTitle}
              </h1>
              <p className="text-slate-500">
                Selecciona el tipo de contenido que deseas revisar
              </p>
            </div>
          </div>

          <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100">
              🎯
            </span>
            <span className="whitespace-nowrap">2 tipos disponibles</span>
          </div>
        </div>
      </header>

      {/* Banner intermedio */}
      <div className="rounded-3xl bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100/60 shadow-sm px-4 sm:px-6 py-5 mb-10">
        <div className="flex items-center gap-3 sm:gap-4 justify-center">
          <div className="relative">
            <div className="inline-flex w-12 h-12 sm:w-14 sm:h-14 items-center justify-center rounded-2xl text-white shadow-md bg-gradient-to-tr from-blue-600 to-violet-600">
              <TargetIcon className="w-6 h-6" />
            </div>
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-800">
              Actividades y Quizzes
            </h2>
            <div className="mx-auto mt-1 h-1 w-28 rounded-full bg-gradient-to-r from-blue-600 to-violet-600" />
          </div>
        </div>
      </div>

      {/* Grid de tarjetas */}
      <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
        {/* Card Actividades */}
        <article className="rounded-3xl border border-white/60 bg-gradient-to-b from-blue-50 to-blue-50 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
          <div className="p-6 sm:p-8 text-center">
            <div className="mx-auto inline-flex w-16 h-16 items-center justify-center rounded-2xl text-white shadow-lg bg-gradient-to-br from-blue-600 to-indigo-500">
              <DocIcon className="w-7 h-7" />
            </div>
            <h3 className="mt-6 text-xl sm:text-2xl font-semibold text-slate-900">
              Actividades
            </h3>
            <p className="mt-3 text-slate-600">
              Tareas y ejercicios prácticos para reforzar tu aprendizaje
            </p>
            <div className="mt-8">
              <Link
                to="/asesor/actividades/modulo/tabla_actividades"
                state={{ title: areaTitle }}
                className="group inline-flex items-center gap-2 font-medium text-blue-700 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 rounded-lg"
              >
                ACCEDER
                <svg viewBox="0 0 24 24" className="w-4 h-4 transition-transform group-hover:translate-x-0.5">
                  <path d="M5 12h12M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          </div>
        </article>

        {/* Card Quizzes */}
        <article className="rounded-3xl border border-white/60 bg-gradient-to-b from-fuchsia-50 to-pink-50 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
          <div className="p-6 sm:p-8 text-center">
            <div className="mx-auto inline-flex w-16 h-16 items-center justify-center rounded-2xl text-white shadow-lg bg-gradient-to-br from-fuchsia-500 to-pink-500">
              <BrainIcon className="w-7 h-7" />
            </div>
            <h3 className="mt-6 text-xl sm:text-2xl font-semibold text-slate-900">
              Quizzes
            </h3>
            <p className="mt-3 text-slate-600">
              Cuestionarios y evaluaciones en línea
            </p>
            <div className="mt-8">
              <Link
                to="/asesor/actividades/quiz"
                state={{ title: areaTitle }}
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
