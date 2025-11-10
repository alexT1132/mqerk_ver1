import React, { useMemo, useState, useEffect } from "react";

/* ---------- categorías/leyenda ---------- */
const CATEGORIES = {
  tareas: { name: "Actividades / Tareas", dot: "bg-amber-500" },
  simuladores: { name: "Simuladores", dot: "bg-fuchsia-500" },
  conferencias: { name: "Conferencias / talleres", dot: "bg-green-500" },
  pago: { name: "Fecha de pago", dot: "bg-violet-500" },
  examenes: { name: "Exámenes / Evaluaciones", dot: "bg-blue-500" },
  asesorias: { name: "Asesorías", dot: "bg-rose-500" },
  recordatorio: { name: "Recordatorio", dot: "bg-teal-500" },
};

const monthNames = "enero_febrero_marzo_abril_mayo_junio_julio_agosto_septiembre_octubre_noviembre_diciembre".split("_");

function startOfMonth(d) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function endOfMonth(d) { return new Date(d.getFullYear(), d.getMonth() + 1, 0); }
function addMonths(d, n) { return new Date(d.getFullYear(), d.getMonth() + n, 1); }
function toISO(d) { return d.toISOString().slice(0, 10); }
const fmtMoney = (n) => n?.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });

/* =========================================================
   MODAL: Crear Recordatorio
========================================================= */
function ReminderModal({ open, onClose, onSave, defaultDate }) {
  const PRIORITIES = [
    { key: "red",    ring: "ring-red-300",    bg: "bg-red-500" },
    { key: "orange", ring: "ring-orange-300", bg: "bg-orange-500" },
    { key: "amber",  ring: "ring-amber-300",  bg: "bg-amber-400" },
    { key: "green",  ring: "ring-green-300",  bg: "bg-green-500" },
    { key: "blue",   ring: "ring-blue-300",   bg: "bg-blue-600" },
    { key: "violet", ring: "ring-violet-300", bg: "bg-violet-500" },
  ];

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState(defaultDate || "");
  const [priority, setPriority] = useState("blue");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setName(""); setDesc(""); setPriority("blue");
      setDate(defaultDate || "");
      setError("");
    }
  }, [open, defaultDate]);

  const save = () => {
    if (!name.trim()) return setError("El nombre es obligatorio.");
    if (!date) return setError("La fecha es obligatoria.");
    onSave({
      id: crypto.randomUUID(),
      date,                 // "YYYY-MM-DD"
      title: name.trim(),
      description: desc.trim(),
      cat: "recordatorio",
      tag: "Recordatorio",
      priority,             // para estilos propios si quieres
      admin: false,
    });
    onClose?.();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      {/* modal */}
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl bg-white">
          {/* header */}
          <div className="px-5 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
            <div className="flex items-center gap-2">
              <span className="text-xl">🗒️</span>
              <h3 className="font-semibold text-lg">Crear Recordatorio</h3>
            </div>
          </div>

          {/* body */}
          <div className="px-5 py-4 space-y-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Nombre <span className="text-rose-500">*</span></label>
              <input
                type="text"
                placeholder="Ej. Entrega de proyecto"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Descripción</label>
              <textarea
                rows={3}
                placeholder="Detalles del recordatorio…"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Fecha <span className="text-rose-500">*</span></label>
              <input
                type="date"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Prioridad</label>
              <div className="mt-2 flex items-center gap-3">
                {PRIORITIES.map(p => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setPriority(p.key)}
                    className={[
                      "w-8 h-8 rounded-full ring-2 transition",
                      p.bg,
                      priority === p.key ? p.ring : "ring-transparent hover:ring-slate-300"
                    ].join(" ")}
                    aria-label={p.key}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* footer */}
          <div className="px-5 py-4 flex items-center justify-end gap-3 bg-slate-50">
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2 text-slate-700 hover:bg-white"
            >
              Cancelar
            </button>
            <button
              onClick={save}
              className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-4 py-2"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   LISTA EVENTOS / LEYENDA / CALENDARIO
========================================================= */
function Chip({ children, className = "" }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${className}`} />;
}

function DatePill({ date }) {
  const d = new Date(date);
  const m = d.toLocaleString("es-MX", { month: "short" }).toUpperCase();
  const day = d.getDate();
  const y = d.getFullYear();
  return (
    <div className="w-20 shrink-0 grid place-items-center rounded-xl bg-rose-50 border border-rose-100 text-center py-2">
      <div className="text-rose-600 text-xs font-semibold">{m}</div>
      <div className="text-2xl font-bold -mt-0.5">{day}</div>
      <div className="text-[10px] text-slate-500">{y}</div>
    </div>
  );
}

function EventItem({ ev }) {
  const isPago = ev.cat === "pago";
  return (
    <div className="flex items-start gap-4 p-4 sm:p-5 border-b last:border-0">
      <DatePill date={ev.date} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-semibold text-slate-900">{ev.title}</h4>
          {ev.admin && <Chip className="bg-amber-100 text-amber-800 ring-1 ring-amber-200">★ Admin</Chip>}
        </div>
        <p className="text-sm text-slate-600 mt-1 line-clamp-2">{ev.description}</p>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <Chip className="bg-teal-100 text-teal-800 ring-1 ring-teal-200">{ev.tag || "Recordatorio"}</Chip>
          {isPago && (
            <Chip className="bg-rose-100 text-rose-700 ring-1 ring-rose-200">
              ● Pago pendiente • {fmtMoney(ev.amount)}
            </Chip>
          )}
        </div>
      </div>
      {isPago ? (
        <button className="ml-auto inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2.5">
          💳 Pagar
        </button>
      ) : null}
    </div>
  );
}

function Legend() {
  const entries = Object.entries(CATEGORIES);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h5 className="font-semibold text-slate-900 mb-3">Leyenda de Eventos</h5>
      <ul className="space-y-2">
        {entries.map(([k, v]) => (
          <li key={k} className="flex items-center gap-3 text-sm">
            <span className={`w-3.5 h-3.5 rounded-full ${v.dot}`} />
            <span>{v.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Calendar({ monthDate, setMonthDate, events, onCreate }) {
  const meta = useMemo(() => {
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    const startWeekday = (start.getDay() + 6) % 7; // L(0) a D(6)
    const daysInMonth = end.getDate();

    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(start.getFullYear(), start.getMonth(), d);
      cells.push(date);
    }
    const map = events.reduce((acc, e) => {
      (acc[e.date] ||= []).push(e);
      return acc;
    }, {});
    return { start, cells, map };
  }, [monthDate, events]);

  const go = (n) => setMonthDate(addMonths(monthDate, n));
  const dayLabel = ["L", "M", "X", "J", "V", "S", "D"];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* header */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white">
        <button onClick={() => go(-1)} className="p-2 rounded-lg hover:bg-white/10">‹</button>
        <div className="text-sm sm:text-base font-semibold uppercase tracking-wide">
          {monthNames[monthDate.getMonth()].toUpperCase()} {monthDate.getFullYear()}
        </div>
        <button onClick={() => go(1)} className="p-2 rounded-lg hover:bg-white/10">›</button>
      </div>

      {/* labels */}
      <div className="grid grid-cols-7 text-center text-xs text-slate-500 px-2 sm:px-3 py-2">
        {dayLabel.map((d) => <div key={d} className="py-1">{d}</div>)}
      </div>

      {/* celdas */}
      <div className="grid grid-cols-7 gap-px bg-slate-200/60">
        {meta.cells.map((date, i) => {
          if (!date) return <div key={`e-${i}`} className="bg-white h-16 sm:h-20" />;
          const iso = toISO(date);
          const evs = meta.map[iso] || [];
          const today = toISO(new Date()) === iso;
          return (
            <div key={iso} className="relative bg-white h-16 sm:h-20 p-1.5 hover:bg-slate-50 transition">
              <div className={`text-xs text-slate-700 font-medium w-6 h-6 grid place-items-center rounded ${today ? "bg-slate-900 text-white" : ""}`}>
                {date.getDate()}
              </div>
              {/* puntos */}
              <div className="absolute left-1.5 bottom-1.5 flex gap-1">
                {evs.slice(0, 3).map((e) => (
                  <span key={e.id} className={`w-2.5 h-2.5 rounded ${CATEGORIES[e.cat]?.dot || "bg-slate-400"}`} />
                ))}
                {evs.length > 3 && <span className="text-[10px] text-slate-500">+{evs.length - 3}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* footer */}
      <div className="p-3 sm:p-4">
        <button
          onClick={() => onCreate?.(toISO(new Date(monthDate.getFullYear(), monthDate.getMonth(), new Date().getDate())))}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm px-4 py-2"
        >
          ＋ Crear recordatorio
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   PÁGINA PRINCIPAL
========================================================= */
export default function AgendaDashboard() {
  // carga inicial (con algunos ejemplos) desde localStorage
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem("events");
    if (saved) return JSON.parse(saved);
    // ejemplos
    return [
      { id: "1", date: "2025-09-29", title: "Fecha de pago mensual", tag: "Fecha de pago", amount: 500, admin: true, cat: "pago" },
      { id: "2", date: "2025-11-05", title: "PAGO CORRESPONDIENTE DEL MES", tag: "Fecha de pago", amount: 1500, admin: true, cat: "pago" },
      { id: "3", date: "2025-11-15", title: "Cuota de Noviembre", tag: "Fecha de pago", amount: 750, admin: true, cat: "pago" },
      { id: "4", date: "2025-09-12", title: "Conferencia sobre Programación", tag: "Conferencias / talleres", admin: true, cat: "conferencias" },
    ];
  });

  // persistir
  useEffect(() => {
    localStorage.setItem("events", JSON.stringify(events));
  }, [events]);

  // ordenar por fecha (desc/asc según prefieras)
  const ordered = useMemo(
    () => [...events].sort((a, b) => a.date.localeCompare(b.date)),
    [events]
  );

  const [monthDate, setMonthDate] = useState(new Date("2025-09-01"));
  const [openModal, setOpenModal] = useState(false);
  const [modalDate, setModalDate] = useState("");

  const openCreate = (dateISO) => {
    setModalDate(dateISO || "");
    setOpenModal(true);
  };

  const addReminder = (ev) => {
    setEvents((prev) => [...prev, ev]);
  };

  const pendientes = events.filter((e) => e.cat === "pago").length;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-violet-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-start">
          {/* Calendario */}
          <section>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 mb-3">
              AGENDA / CALENDARIO
            </h2>
            <Calendar
              monthDate={monthDate}
              setMonthDate={setMonthDate}
              events={events}
              onCreate={(d) => { openCreate(d); }}
            />
            <div className="mt-4 max-w-sm">
              <Legend />
            </div>
          </section>

          {/* Eventos */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
                EVENTOS Y ACTIVIDADES IMPORTANTES
              </h2>
              <div className="hidden sm:flex items-center gap-2">
                <span className="rounded-full bg-slate-100 text-slate-700 text-sm px-3 py-1.5 border border-slate-200">
                  {pendientes} pendientes
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              {ordered.map((ev) => <EventItem key={ev.id} ev={ev} />)}
            </div>
          </section>
        </div>
      </div>

      {/* MODAL */}
      <ReminderModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSave={addReminder}
        defaultDate={modalDate}
      />
    </main>
  );
}
