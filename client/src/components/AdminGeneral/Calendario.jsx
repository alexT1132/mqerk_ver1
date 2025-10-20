import React, { useMemo, useState } from "react";

/* ===== util ===== */
const meses = [
  "ENERO","FEBRERO","MARZO","ABRIL","MAYO","JUNIO",
  "JULIO","AGOSTO","SEPTIEMBRE","OCTUBRE","NOVIEMBRE","DICIEMBRE"
];
const dias = ["L","M","X","J","V","S","D"];
const abreMes = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];

function makeCalendar(year, month /* 0-11 */) {
  // Lunes como primer día
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // 0 = Lunes
  const start = new Date(year, month, 1 - offset);
  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push({
      date: d,
      day: d.getDate(),
      inMonth: d.getMonth() === month,
      isToday: sameDate(d, new Date()),
    });
  }
  return days;
}
const sameDate = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/* ===== pill, tag, etc ===== */
const Pill = ({ children, className = "" }) => (
  <span
    className={
      "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium " +
      className
    }
  >
    {children}
  </span>
);

/* ====== Componente principal ====== */
export default function AgendaEventos() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState(new Date(year, month, now.getDate()));

  const gridDays = useMemo(() => makeCalendar(year, month), [year, month]);

  const prev = () => {
    const m = new Date(year, month - 1, 1);
    setYear(m.getFullYear());
    setMonth(m.getMonth());
  };
  const next = () => {
    const m = new Date(year, month + 1, 1);
    setYear(m.getFullYear());
    setMonth(m.getMonth());
  };

  // Evento demo (pago pendiente)
  const eventos = [
    {
      id: "pago-2",
      titulo: "Pago #2",
      origen: "Sistema",
      etiqueta: "Fecha de pago",
      estado: "Pago pendiente • 5500 MXN",
      fecha: new Date(2026, 0, 14), // 14 ENE 2026
      pendiente: true,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 md:px-6 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ===== Columna izquierda: Agenda / Calendario ===== */}
        <section className="lg:col-span-5">
          <h1 className="text-2xl md:text-[28px] font-extrabold tracking-tight text-slate-900">
            AGENDA / CALENDARIO
          </h1>

          {/* Header del mes */}
          <div className="mt-4 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 p-3 shadow-sm text-white">
            <div className="flex items-center justify-between">
              <button
                onClick={prev}
                className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 hover:bg-white/25"
                aria-label="Mes anterior"
              >
                ‹
              </button>
              <div className="text-sm md:text-base font-semibold">
                {meses[month]} {year}
              </div>
              <button
                onClick={next}
                className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 hover:bg-white/25"
                aria-label="Mes siguiente"
              >
                ›
              </button>
            </div>
          </div>

          {/* Calendario */}
          <div className="mt-2 rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* encabezado días */}
            <div className="grid grid-cols-7 px-3 pt-3 text-center text-xs font-medium text-slate-500">
              {dias.map((d) => (
                <div key={d} className="py-2">
                  {d}
                </div>
              ))}
            </div>
            {/* celdas */}
            <div className="grid grid-cols-7 gap-1 p-2">
              {gridDays.map((d, i) => {
                const isSelected = sameDate(d.date, selected);
                return (
                  <button
                    key={i}
                    onClick={() => setSelected(d.date)}
                    className={[
                      "h-10 rounded-xl text-sm transition",
                      d.inMonth ? "text-slate-800" : "text-slate-400",
                      "hover:bg-slate-50",
                      isSelected ? "ring-2 ring-violet-500 ring-offset-2" : "",
                      d.isToday && !isSelected ? "border border-violet-300" : "",
                    ].join(" ")}
                  >
                    {d.day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Botón crear recordatorio */}
          <div className="mt-3">
            <button className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700">
              <span className="grid h-4 w-4 place-items-center rounded-full bg-white/20">+</span>
              Crear Recordatorio
            </button>
          </div>

          {/* Leyenda */}
          <div className="mt-6 w-full max-w-xs rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-semibold text-slate-800">Leyenda de Eventos</div>
            <ul className="mt-3 space-y-2 text-sm">
              {[
                ["#f59e0b", "Actividades / Tareas"],
                ["#ef4444", "Simuladores"],
                ["#8b5cf6", "Conferencias / talleres"],
                ["#06b6d4", "Fecha de pago"],
                ["#3b82f6", "Exámenes / Evaluaciones"],
                ["#10b981", "Asesorías"],
                ["#64748b", "Recordatorio"],
              ].map(([c, t]) => (
                <li className="flex items-center gap-3" key={t}>
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ background: c }}
                  />
                  <span className="text-slate-700">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ===== Columna derecha: Eventos importantes ===== */}
        <section className="lg:col-span-7">
          <div className="flex items-start justify-between">
            <h2 className="text-2xl md:text-[28px] font-extrabold tracking-tight text-slate-900 leading-tight">
              EVENTOS Y ACTIVIDADES<br />IMPORTANTES
            </h2>
            <Pill className="bg-sky-100 text-sky-700">1 pendiente</Pill>
          </div>

          {/* Tarjeta de evento */}
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            {eventos.map((e) => (
              <div
                key={e.id}
                className="flex items-start gap-4 md:gap-6"
              >
                {/* Chip de fecha vertical */}
                <div className="rounded-xl border border-slate-200 px-3 py-2 text-center text-slate-700 min-w-[72px]">
                  <div className="text-[11px] font-semibold text-rose-600">
                    {abreMes[e.fecha.getMonth()]}
                  </div>
                  <div className="text-2xl font-bold leading-none">
                    {String(e.fecha.getDate()).padStart(2,"0")}
                  </div>
                  <div className="text-[11px]">{e.fecha.getFullYear()}</div>
                </div>

                {/* Contenido */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-semibold text-slate-900">{e.titulo}</div>
                    <Pill className="bg-slate-100 text-slate-600">Sistema</Pill>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Pill className="bg-violet-100 text-violet-700">Fecha de pago</Pill>
                    <Pill className="bg-rose-100 text-rose-700">
                      <span className="me-1 inline-block h-2 w-2 rounded-full bg-rose-500" />
                      {e.estado}
                    </Pill>
                  </div>
                </div>

                {/* Acción */}
                <button className="ml-auto rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700">
                  💳 Pagar
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
