import { useState } from "react";

export default function TopbarDashboard() {
  const [report, setReport] = useState("mensual");

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-13 px-3 md:px-6 py-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* ===== Izquierda: logo + título ===== */}
          <div className="flex items-start gap-3">
            <div className="mt-[2px] flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <IconApps className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-[18px] md:text-[20px] font-semibold text-slate-900">
                Panel General — MQerKAcademy
              </h1>
              <p className="text-[12px] text-slate-500">
                Asesores Especializados en la Enseñanza de las Ciencias y Tecnología
              </p>
            </div>
          </div>
          

          {/* ===== Derecha: todos los controles en línea ===== */}
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            {/* Conmutador reporte */}
            <div className="flex items-center rounded-xl bg-slate-50 p-1 ring-1 ring-slate-200">
              <button
                onClick={() => setReport("mensual")}
                className={`rounded-lg px-3 py-1.5 text-sm transition ${
                  report === "mensual"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                Reporte mensual
              </button>
              <button
                onClick={() => setReport("anual")}
                className={`rounded-lg px-3 py-1.5 text-sm transition ${
                  report === "anual"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                Reporte anual
              </button>
            </div>

            {/* Calendario */}
            <button className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm text-slate-800 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50">
              <IconCalendar className="h-4 w-4 text-slate-600" />
              Calendario
            </button>

            {/* Alertas */}
            <button className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm text-slate-800 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50">
              <IconBell className="h-4 w-4 text-slate-600" />
              Alertas
            </button>

            {/* Buscador */}
            <div className="flex items-center gap-2 rounded-lg bg-white px-2.5 py-1.5 shadow-sm ring-1 ring-slate-200">
              <IconSearch className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar sección..."
                className="w-32 md:w-48 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
              />
            </div>

            {/* Año */}
            <div className="flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 shadow-sm ring-1 ring-slate-200">
              <select className="bg-transparent text-sm text-slate-700 outline-none">
                <option>2025</option>
                <option>2024</option>
                <option>2023</option>
              </select>
              <IconChevronDown className="h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ====== Iconos ====== */
function IconApps(p){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}><rect x="3" y="3" width="7" height="7" rx="2" strokeWidth="1.8"/><rect x="14" y="3" width="7" height="7" rx="2" strokeWidth="1.8"/><rect x="3" y="14" width="7" height="7" rx="2" strokeWidth="1.8"/><rect x="14" y="14" width="7" height="7" rx="2" strokeWidth="1.8"/></svg>)}
function IconCalendar(p){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}><rect x="3" y="5" width="18" height="16" rx="2" strokeWidth="1.8"/><path strokeWidth="1.8" d="M3 10h18M8 3v4M16 3v4"/></svg>)}
function IconBell(p){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}><path strokeWidth="1.8" d="M6 8a6 6 0 1112 0v5l2 3H4l2-3z"/><path strokeWidth="1.8" d="M9 19a3 3 0 006 0"/></svg>)}
function IconSearch(p){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}><circle cx="11" cy="11" r="7" strokeWidth="1.8"/><path strokeWidth="1.8" d="M20 20l-3-3"/></svg>)}
function IconChevronDown(p){return(<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}><path strokeWidth="2" strokeLinecap="round" d="M6 9l6 6 6-6"/></svg>)}
