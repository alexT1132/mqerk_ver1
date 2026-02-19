import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ClipboardList, Brain, ArrowLeft as LucideArrowLeft, ListChecks, ArrowRight } from "lucide-react";

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
    <section className="px-3 sm:px-6 lg:px-10 2xl:px-12 py-6 sm:py-8 2xl:py-10">
      {/* Header superior — 2xl: más grande en 1920×1080 */}
      <header className="-mt-1 sm:-mt-2 md:-mt-3 rounded-3xl border-2 border-violet-200/60 bg-gradient-to-r from-violet-50/80 via-indigo-50/80 to-purple-50/80 shadow-xl ring-2 ring-slate-100/50 px-4 sm:px-7 2xl:px-10 py-5 sm:py-6 2xl:py-8 mb-8 2xl:mb-10 relative overflow-hidden">
        <div className="pointer-events-none absolute -left-10 -top-14 h-64 w-64 rounded-full bg-violet-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 -bottom-14 h-64 w-64 rounded-full bg-indigo-200/50 blur-3xl" />
        <div className="relative z-10 flex items-start justify-between gap-4 2xl:gap-6">
          <div className="flex items-start gap-4 2xl:gap-6">
            <Link
              to="/asesor/actividades"
              className="mt-1 inline-flex h-11 w-11 2xl:h-12 2xl:w-12 items-center justify-center rounded-xl border-2 border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label="Volver"
            >
              <ArrowLeft className="h-5 w-5 2xl:h-6 2xl:w-6" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl 2xl:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 truncate">
                {areaTitle}
              </h1>
              <p className="text-sm sm:text-base 2xl:text-lg text-slate-600 font-medium mt-1.5 2xl:mt-2">
                Selecciona el tipo de contenido que deseas revisar
              </p>
            </div>
          </div>

          <div className="mt-1 inline-flex items-center gap-2.5 rounded-xl border-2 border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50 px-4 py-2.5 2xl:px-5 2xl:py-3 text-sm 2xl:text-base text-slate-700 shadow-md">
            <div className="inline-flex h-6 w-6 2xl:h-7 2xl:w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-sm">
              <span className="text-xs 2xl:text-sm">🎯</span>
            </div>
            <span className="whitespace-nowrap font-bold">2 tipos disponibles</span>
          </div>
        </div>
      </header>

      {/* Banner intermedio — 2xl: más grande en 1920×1080 */}
      <div className="relative mt-2 sm:mt-3 md:mt-4 rounded-3xl border-2 border-violet-200/60 bg-gradient-to-br from-violet-50/80 via-indigo-50/80 to-purple-50/80 shadow-xl ring-2 ring-slate-100/50 px-4 sm:px-7 2xl:px-10 py-5 sm:py-6 2xl:py-8 mb-10 sm:mb-14 2xl:mb-16 overflow-hidden">
        <div className="pointer-events-none absolute -left-10 -top-10 h-48 w-48 rounded-full bg-violet-200/50 blur-2xl" />
        <div className="pointer-events-none absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-indigo-200/50 blur-2xl" />
        <div className="relative z-10 flex items-center gap-4 sm:gap-5 2xl:gap-8 justify-center text-center">
          <div className="relative">
            <div className="inline-flex w-16 h-16 sm:w-20 sm:h-20 2xl:w-28 2xl:h-28 items-center justify-center rounded-3xl text-white shadow-2xl bg-gradient-to-br from-violet-500 via-indigo-600 to-purple-600 ring-4 ring-white/50">
              <ListChecks className="w-8 h-8 sm:w-10 sm:h-10 2xl:w-14 2xl:h-14" />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl 2xl:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600">
              Actividades y Quizzes
            </h2>
            <div className="mx-auto mt-2 2xl:mt-3 flex gap-2 justify-center">
              <span className="h-1.5 w-20 2xl:w-24 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 shadow-sm" />
              <span className="h-1.5 w-12 2xl:w-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid de tarjetas — 2xl: contenedor más ancho y tarjetas más grandes (igual que Simuladores) */}
      <div className="mx-auto max-w-6xl 2xl:max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 xl:gap-16 2xl:gap-20">
        {/* Card Actividades — flex para que el botón quede siempre abajo (misma posición que la otra tarjeta) */}
        <article className="group relative flex flex-col h-full rounded-3xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-white shadow-xl ring-2 ring-slate-100/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:ring-blue-200/50">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-50/0 to-indigo-50/0 group-hover:from-blue-50/30 group-hover:to-indigo-50/30 transition-all duration-300" />
          <div className="relative flex flex-col flex-1 min-h-0 p-6 sm:p-9 2xl:p-12 text-center">
            <div className="mx-auto inline-flex w-16 h-16 sm:w-20 sm:h-20 2xl:w-28 2xl:h-28 items-center justify-center rounded-3xl text-white shadow-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 ring-4 ring-white/50 group-hover:scale-110 transition-transform duration-300 shrink-0">
              <ClipboardList className="w-8 h-8 sm:w-10 sm:h-10 2xl:w-14 2xl:h-14" />
            </div>
            <h3 className="mt-6 sm:mt-7 2xl:mt-8 text-2xl sm:text-3xl 2xl:text-4xl font-bold text-slate-900 shrink-0">
              Actividades
            </h3>
            <p className="mt-3 sm:mt-4 2xl:mt-5 flex-1 min-h-0 text-sm sm:text-base 2xl:text-lg text-slate-600 font-medium leading-relaxed">
              Gestiona la creación, edición y seguimiento de actividades del área.
            </p>
            <div className="mt-auto pt-6 sm:pt-8 2xl:pt-10 shrink-0">
              <Link
                to="/asesor/actividades/modulo/tabla_actividades"
                state={{ title: areaTitle }}
                className="group inline-flex items-center gap-2 px-6 py-3 2xl:px-8 2xl:py-4 rounded-xl font-bold text-white text-base 2xl:text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              >
                Gestionar
                <ArrowRight className="w-4 h-4 2xl:w-5 2xl:h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </article>

        {/* Card Quizzes — flex para que el botón quede siempre abajo (misma posición que la otra tarjeta) */}
        <article className="group relative flex flex-col h-full rounded-3xl border-2 border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 via-pink-50/50 to-white shadow-xl ring-2 ring-slate-100/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:ring-fuchsia-200/50">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-fuchsia-50/0 to-pink-50/0 group-hover:from-fuchsia-50/30 group-hover:to-pink-50/30 transition-all duration-300" />
          <div className="relative flex flex-col flex-1 min-h-0 p-6 sm:p-9 2xl:p-12 text-center">
            <div className="mx-auto inline-flex w-16 h-16 sm:w-20 sm:h-20 2xl:w-28 2xl:h-28 items-center justify-center rounded-3xl text-white shadow-2xl bg-gradient-to-br from-fuchsia-500 via-pink-500 to-rose-600 ring-4 ring-white/50 group-hover:scale-110 transition-transform duration-300 shrink-0">
              <Brain className="w-8 h-8 sm:w-10 sm:h-10 2xl:w-14 2xl:h-14" />
            </div>
            <h3 className="mt-6 sm:mt-7 2xl:mt-8 text-2xl sm:text-3xl 2xl:text-4xl font-bold text-slate-900 shrink-0">
              Quizzes
            </h3>
            <p className="mt-3 sm:mt-4 2xl:mt-5 flex-1 min-h-0 text-sm sm:text-base 2xl:text-lg text-slate-600 font-medium leading-relaxed">
              Gestiona la creación de quizzes, banco de preguntas y resultados de estudiantes.
            </p>
            <div className="mt-auto pt-6 sm:pt-8 2xl:pt-10 shrink-0">
              <Link
                to="/asesor/actividades/quiz"
                state={{ title: areaTitle }}
                className="group inline-flex items-center gap-2 px-6 py-3 2xl:px-8 2xl:py-4 rounded-xl font-bold text-white text-base 2xl:text-lg bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              >
                Gestionar
                <ArrowRight className="w-4 h-4 2xl:w-5 2xl:h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
