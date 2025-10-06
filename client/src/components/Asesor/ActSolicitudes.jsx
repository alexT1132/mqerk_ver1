import { useMemo, useState } from "react";

const DEMO = [
  { folio: "EEAU-001", nombre: "María López", estado: "pendiente" },
  { folio: "EEAU-002", nombre: "Juan Pérez", estado: "aprobado" },
  { folio: "EEAU-003", nombre: "Ana Torres", estado: "rechazado" },
];

const Chip = ({ active, onClick, icon, label, count }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm border transition select-none 
      ${active
        ? "bg-orange-500 text-white border-orange-500 shadow-sm"
        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"}
    `}
  >
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10">
      {icon}
    </span>
    <span className="font-medium">{label}</span>
    <span className={`text-xs rounded-full px-1.5 py-0.5 ${active ? "bg-white/15" : "bg-slate-100 border border-slate-200"}`}>
      {count}
    </span>
  </button>
);

const IconClock = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2zm.75 5.5a.75.75 0 0 0-1.5 0v5c0 .2.08.39.22.53l3 3a.75.75 0 0 0 1.06-1.06L12.75 12.2V7.5z"/></svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21.6 6.4 20.2 5z"/></svg>
);
const IconX = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="m6.4 5 -.9.9L11 11.4 5.5 16.9l.9.9L12 12.9l5.6 4.9.9-.9L13 11.4l5.5-5.5-.9-.9L12 10.5z"/></svg>
);

export default function TablaComprobantesEEAU({ initial = DEMO, titulo = "Solicitudes" }) {
  const [items, setItems] = useState(initial);
  const [filter, setFilter] = useState("pendiente"); // pendiente | aprobado | rechazado | todas

  const counts = useMemo(() => ({
    todas: items.length,
    pendiente: items.filter(i => i.estado === "pendiente").length,
    aprobado: items.filter(i => i.estado === "aprobado").length,
    rechazado: items.filter(i => i.estado === "rechazado").length,
  }), [items]);

  const data = useMemo(() => (
    filter === "todas" ? items : items.filter(i => i.estado === filter)
  ), [items, filter]);

  const setEstado = (folio, estado) => setItems(prev => prev.map(i => i.folio === folio ? { ...i, estado } : i));

  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-6">
      {/* Chips */}
      <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <Chip active={filter === "pendiente"} onClick={() => setFilter("pendiente")} icon={<IconClock />} label={`Pendientes`} count={counts.pendiente} />
        <Chip active={filter === "aprobado"} onClick={() => setFilter("aprobado")} icon={<IconCheck />} label={`Aprobados`} count={counts.aprobado} />
        <Chip active={filter === "rechazado"} onClick={() => setFilter("rechazado")} icon={<IconX />} label={`Rechazados`} count={counts.rechazado} />
      </div>

      {/* Card contenedor */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-sm">
        <div className="px-3 py-3">
          <h2 className="text-lg font-semibold text-slate-800">{titulo} — {filter === 'pendiente' ? 'Pendientes' : filter === 'aprobado' ? 'Aprobados' : filter === 'rechazado' ? 'Rechazados' : 'Todas'}</h2>
        </div>

        {/* Tabla Desktop */}
        <div className="hidden overflow-hidden rounded-xl sm:block">
          <table className="min-w-full table-fixed">
            <thead className="bg-slate-900 text-white">
              <tr className="text-left">
                <th className="w-48 px-4 py-3 text-xs font-medium uppercase tracking-wide">Folio</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide">Nombre del alumno</th>
                <th className="w-56 px-4 py-3 text-xs font-medium uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {data.map((i) => (
                <tr key={i.folio} className="border-t border-slate-200 hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-700">{i.folio}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-800">{i.nombre}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setEstado(i.folio, "aprobado")} className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100">Aceptar</button>
                      <button onClick={() => setEstado(i.folio, "rechazado")} className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-100">Rechazar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!data.length && <EmptyState />}
        </div>

        {/* Tarjetas Móvil */}
        <div className="grid gap-3 sm:hidden">
          {data.map(i => (
            <div key={i.folio} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-sm text-slate-500">Folio</div>
              <div className="text-base font-semibold text-slate-800">{i.folio}</div>
              <div className="mt-2 text-sm text-slate-500">Nombre del alumno</div>
              <div className="text-base font-medium text-slate-800">{i.nombre}</div>
              <div className="mt-4 flex items-center gap-2">
                <button onClick={() => setEstado(i.folio, "aprobado")} className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100">Aceptar</button>
                <button onClick={() => setEstado(i.folio, "rechazado")} className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100">Rechazar</button>
              </div>
            </div>
          ))}
          {!data.length && <EmptyState compact />}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ compact = false }) {
  return (
    <div className={`flex flex-col items-center justify-center ${compact ? "p-8" : "p-16"} text-center bg-white`}>
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        {/* Icono documento simple */}
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor"><path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6zm7 1.5L18.5 9H13V3.5zM8 12.5h8v1.5H8v-1.5zm0 3h8v1.5H8v-1.5z"/></svg>
      </div>
      <p className="text-slate-700 font-medium">No hay comprobantes pendientes</p>
      <p className="text-slate-500 text-sm">Los comprobantes aparecerán aquí cuando estén disponibles para validación</p>
    </div>
  );
}
