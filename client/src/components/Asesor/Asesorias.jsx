import React, { useMemo, useState } from "react";

/**
 * Dashboard de Asesorías — Minimalista, tonos claros
 * - Tarjetas KPI superiores
 * - Panel derecho: Próximas sesiones (lista clicable)
 * - Panel izquierdo: Detalle de la sesión seleccionada (reemplaza el calendario)
 * - Responsive: grid 1col en móvil, 3col en lg (2/3 detalle, 1/3 lista)
 */

const DEMO_SESIONES = [
  {
    id: "S-101",
    materia: "Matemáticas",
    tipo: "Personalizada",
    alumno: "Juan Pérez",
    grupo: null,
    asesor: "Mtra. Laura Gómez",
    fecha: "2025-09-18T10:00:00",
    duracionMin: 60,
    ubicacion: "Aula 3 / Edificio B",
    descripcion:
      "Repaso de álgebra lineal: sistemas de ecuaciones y matrices. Llevar calculadora científica.",
  },
  {
    id: "S-102",
    materia: "Física",
    tipo: "Grupal",
    alumno: null,
    grupo: "2B",
    asesor: "Ing. Carlos Rivera",
    fecha: "2025-09-19T12:00:00",
    duracionMin: 90,
    ubicacion: "Laboratorio 1",
    descripcion: "Movimiento parabólico y práctica con sensores de movimiento.",
  },
  {
    id: "S-103",
    materia: "Inglés",
    tipo: "Personalizada",
    alumno: "Ana López",
    grupo: null,
    asesor: "Prof. Erik Santos",
    fecha: "2025-09-20T16:00:00",
    duracionMin: 60,
    ubicacion: "Sala de Idiomas",
    descripcion: "Speaking: role play sobre entrevistas de trabajo. Nivel B1.",
  },
];

/* ------------------------------ Utilidades ------------------------------ */
const fmtFecha = (iso) => {
  const d = new Date(iso);
  const f = d.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
  const h = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  return { fecha: f, hora: h };
};

const kColor = {
  card: "bg-white",
  border: "border-slate-200",
  textStrong: "text-slate-800",
  text: "text-slate-600",
  subtext: "text-slate-500",
  chip: "bg-slate-100 text-slate-700",
  primary: "text-sky-600",
};

/* ------------------------------ Componentes ----------------------------- */
const KPI = ({ icon, label, value }) => (
  <div className={`rounded-2xl ${kColor.card} border ${kColor.border} p-4 shadow-sm`}>
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">{icon}</div>
      <div>
        <div className={`text-sm ${kColor.text}`}>{label}</div>
        <div className={`text-xl font-semibold ${kColor.textStrong}`}>{value}</div>
      </div>
    </div>
  </div>
);

const IconPeople = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4zM6 13a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm10 2c-2.67 0-8 1.34-8 4v1h16v-1c0-2.66-5.33-4-8-4zM6 15c-2.5 0-6 1.25-6 3v2h6v-2.5c0-.17.02-.34.05-.5A11 11 0 0 1 6 15z"/></svg>
);
const IconBook = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M18 2H8a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h11v3h2V4a2 2 0 0 0-2-2zM7 16a2 2 0 0 0-2 2V6a2 2 0 0 1 2-2h10v12H7z"/></svg>
);
const IconSplit = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M5 4h4v4H7v4h3l2 2v4h2v-5l-2-2H7V8h2V4H5zM15 4h4v4h-2V4h-2z"/></svg>
);
const IconClock = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2zm.75 5.5a.75.75 0 0 0-1.5 0v5c0 .2.08.39.22.53l3 3a.75.75 0 0 0 1.06-1.06L12.75 12.2V7.5z"/></svg>
);
const IconCalendar = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M7 2h2v2h6V2h2v2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2V2zm14 8H5v10h16V10z"/></svg>
);
const IconUser = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5z"/></svg>
);
const IconGroup = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4zM6 13a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm10 2c-2.67 0-8 1.34-8 4v1h16v-1c0-2.66-5.33-4-8-4zM6 15c-2.5 0-6 1.25-6 3v2h6v-2.5c0-.17.02-.34.05-.5A11 11 0 0 1 6 15z"/></svg>
);
const IconPin = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 14.5 9 2.5 2.5 0 0 1 12 11.5z"/></svg>
);

const SessionCard = ({ s, selected, onClick }) => {
  const { fecha, hora } = fmtFecha(s.fecha);
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border ${selected ? "border-sky-300 bg-sky-50" : "border-slate-200 bg-white hover:bg-slate-50"} p-4 shadow-sm transition`}
    >
      <div className="text-xs text-slate-500 mb-1">{fecha} · {hora}</div>
      <div className="font-semibold text-slate-800">{s.materia}</div>
      <div className="text-sm text-slate-600">
        {s.tipo} — {s.tipo === "Personalizada" ? s.alumno : `Grupal - Grupo ${s.grupo}`}
      </div>
    </button>
  );
};

/* ------------------------------ Vista principal ------------------------------ */
export default function DashboardAsesorias({ sesiones = DEMO_SESIONES }) {
  const [selId, setSelId] = useState(null);
  const sel = useMemo(() => sesiones.find(x => x.id === selId) || null, [selId, sesiones]);

  // KPIs calculados
  const kpis = useMemo(() => {
    const total = sesiones.length;
    const materias = new Set(sesiones.map(s => s.materia)).size;
    const pers = sesiones.filter(s => s.tipo === "Personalizada").length;
    const grup = sesiones.filter(s => s.tipo === "Grupal").length;
    const horas = Math.round(sesiones.reduce((acc, s) => acc + (s.duracionMin || 0), 0) / 60);
    return { total, materias, pers, grup, horas };
  }, [sesiones]);

  return (
    <div className="mx-auto w-full px-3 py-6">
      {/* Encabezado */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Asesorías</h1>
        <div className="flex items-center gap-2">
          <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
            <option>Semana</option>
            <option>Mes</option>
          </select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <KPI icon={<IconPeople />} label="Total Asesorías" value={kpis.total} />
        <KPI icon={<IconBook />} label="Materias Cubiertas" value={kpis.materias} />
        <KPI icon={<IconSplit />} label="Personalizadas vs Grupales" value={`${kpis.pers} / ${kpis.grup}`} />
        <KPI icon={<IconClock />} label="Horas Programadas" value={`${kpis.horas} h`} />
      </div>

      {/* Contenido principal */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Detalle (izquierda) */}
        <div className={`lg:col-span-2 rounded-2xl ${kColor.card} border ${kColor.border} p-4 shadow-sm`}>
          <div className="mb-3 flex items-center gap-2">
            <IconCalendar />
            <h2 className={`text-lg font-semibold ${kColor.textStrong}`}>Detalle de Sesión</h2>
          </div>

          {!sel && (
            <div className="grid place-items-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-12 text-center">
              <p className={`text-base font-medium ${kColor.textStrong}`}>Selecciona una sesión para ver el detalle</p>
              <p className={`text-sm ${kColor.subtext}`}>Haz clic en una tarjeta de "Próximas Sesiones"</p>
            </div>
          )}

          {sel && <DetalleSesion s={sel} />}
        </div>

        {/* Lista (derecha) */}
        <div className={`rounded-2xl ${kColor.card} border ${kColor.border} p-4 shadow-sm`}>
          <h3 className={`mb-3 text-lg font-semibold ${kColor.textStrong}`}>Próximas Sesiones</h3>
          <div className="grid gap-3">
            {sesiones.map(s => (
              <SessionCard key={s.id} s={s} selected={s.id === selId} onClick={() => setSelId(s.id)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetalleSesion({ s }) {
  const { fecha, hora } = fmtFecha(s.fecha);
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Columna izquierda */}
      <div className="space-y-3">
        <Item label="Materia" value={s.materia} />
        <Item label="Tipo" value={s.tipo} />
        <Item label={s.tipo === "Personalizada" ? "Alumno" : "Grupo"} value={s.tipo === "Personalizada" ? s.alumno : s.grupo} />
        <Item label="Asesor" value={s.asesor} />
      </div>

      {/* Columna derecha */}
      <div className="space-y-3">
        <Item label="Fecha" value={fecha} icon={<IconCalendar />} />
        <Item label="Hora" value={hora} icon={<IconClock />} />
        <Item label="Duración" value={`${s.duracionMin} min`} />
        <Item label="Ubicación" value={s.ubicacion} icon={<IconPin />} />
      </div>

      {/* Descripción */}
      <div className="md:col-span-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="text-sm font-medium text-slate-700 mb-1">Descripción</div>
          <p className="text-sm text-slate-600 leading-relaxed">{s.descripcion}</p>
        </div>
      </div>

      {/* Acciones */}
      <div className="md:col-span-2 flex flex-wrap gap-2">
        <button className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700 hover:bg-sky-100">Reprogramar</button>
        <button className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100">Marcar como realizada</button>
        <button className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100">Cancelar</button>
      </div>
    </div>
  );
}

function Item({ label, value, icon }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
      {icon && <div className="text-slate-500">{icon}</div>}
      <div className="text-sm text-slate-500">{label}</div>
      <div className="ml-auto text-sm font-medium text-slate-800">{value}</div>
    </div>
  );
}
