import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ClipboardList, Brain, ArrowLeft as LucideArrowLeft, ListChecks } from "lucide-react";

/* --- Iconos inline --- */
const ArrowLeft = (props) => <LucideArrowLeft {...props} />;

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
    <section className="px-3 sm:px-6 lg:px-10 py-6 sm:py-8">
      {/* Header superior */}
  <header className="-mt-1 sm:-mt-2 md:-mt-3 rounded-3xl border border-cyan-200/40 bg-gradient-to-r from-cyan-50/70 via-white to-indigo-50/70 shadow-sm px-3 sm:px-6 py-4 sm:py-5 mb-6 sm:mb-7 relative overflow-hidden">
        {/* blobs */}
        <div className="pointer-events-none absolute -left-10 -top-14 h-56 w-56 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 -bottom-14 h-56 w-56 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Link
              to="/asesor/actividades"
              className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
              aria-label="Volver"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="min-w-0">
              {/* 3) Usar el título dinámico */}
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-sky-700 to-violet-700 truncate">
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
  <div className="relative mt-2 sm:mt-3 md:mt-4 rounded-3xl border border-cyan-100/60 bg-gradient-to-br from-cyan-50 to-blue-50 shadow-sm px-3 sm:px-6 py-4 sm:py-5 mb-8 sm:mb-12 overflow-hidden">
        <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-cyan-200/40 blur-2xl" />
        <div className="pointer-events-none absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-indigo-200/40 blur-2xl" />
        <div className="relative z-10 flex items-center gap-3 sm:gap-4 justify-center text-center">
          <div className="relative">
            <div className="inline-flex w-10 h-10 sm:w-14 sm:h-14 items-center justify-center rounded-2xl text-white shadow-md bg-gradient-to-tr from-blue-600 to-violet-600">
              <ListChecks className="w-5 h-5 sm:w-7 sm:h-7" />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-sky-700 to-violet-700">
              Actividades y Quizzes
            </h2>
            <div className="mx-auto mt-1 flex gap-2 justify-center">
              <span className="h-1 w-16 rounded-full bg-gradient-to-r from-sky-500 to-sky-300" />
              <span className="h-1 w-10 rounded-full bg-gradient-to-r from-violet-500 to-violet-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid de tarjetas */}
  <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-10">
        {/* Card Actividades */}
        <article className="rounded-3xl border border-white/60 bg-gradient-to-b from-blue-50 to-blue-50 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
          <div className="p-5 sm:p-8 text-center">
            <div className="mx-auto inline-flex w-14 h-14 sm:w-16 sm:h-16 items-center justify-center rounded-2xl text-white shadow-lg bg-gradient-to-br from-blue-600 to-indigo-500">
              <ClipboardList className="w-7 h-7" />
            </div>
            <h3 className="mt-5 sm:mt-6 text-lg sm:text-2xl font-semibold text-slate-900">
              Actividades
            </h3>
            <p className="mt-2 sm:mt-3 text-slate-600">
              Gestiona la creación, edición y seguimiento de actividades del área.
            </p>
            <div className="mt-6 sm:mt-8">
              <Link
                to="/asesor/actividades/modulo/tabla_actividades"
                state={{ title: areaTitle }}
                className="group inline-flex items-center gap-2 font-medium text-blue-700 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 rounded-lg"
              >
                Gestionar
                <svg viewBox="0 0 24 24" className="w-4 h-4 transition-transform group-hover:translate-x-0.5">
                  <path d="M5 12h12M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          </div>
        </article>

        {/* Card Quizzes */}
        <article className="rounded-3xl border border-white/60 bg-gradient-to-b from-fuchsia-50 to-pink-50 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
          <div className="p-5 sm:p-8 text-center">
            <div className="mx-auto inline-flex w-14 h-14 sm:w-16 sm:h-16 items-center justify-center rounded-2xl text-white shadow-lg bg-gradient-to-br from-fuchsia-500 to-pink-500">
              <Brain className="w-7 h-7" />
            </div>
            <h3 className="mt-5 sm:mt-6 text-lg sm:text-2xl font-semibold text-slate-900">
              Quizzes
            </h3>
            <p className="mt-2 sm:mt-3 text-slate-600">
              Gestiona la creación de quizzes, banco de preguntas y resultados de estudiantes.
            </p>
            <div className="mt-6 sm:mt-8">
              <Link
                to="/asesor/actividades/quiz"
                state={{ title: areaTitle }}
                className="group inline-flex items-center gap-2 font-medium text-fuchsia-700 hover:text-fuchsia-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-fuchsia-300 rounded-lg"
              >
                Gestionar
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
