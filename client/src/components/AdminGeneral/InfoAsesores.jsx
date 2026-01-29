import React, { useMemo, useState } from "react";

/* ==================== datos demo ==================== */
const seed = [
  { id: "A-001", nombre: "César E. Lagunes", email: "cesar.batalla@mqerkacademy.com", puesto: "English Teacher", estado: "Aceptado", cursos: 2, estudiantes: 56 },
  { id: "A-002", nombre: "María P. Ortega", email: "maria.ortega@mqerkacademy.com", puesto: "Asesora Matemáticas", estado: "Recomendación psicológica", cursos: 1, estudiantes: 12 },
  { id: "A-003", nombre: "Luis F. Navarro", email: "luis.navarro@correo.com", puesto: "Asesor Física", estado: "Rechazado", cursos: 0, estudiantes: 0 },
];

/* ==================== helpers UI ==================== */
const BadgeEstado = ({ estado }) => {
  const map = {
    "Aceptado": "bg-emerald-50 text-emerald-700 ring-emerald-200",
    "Rechazado": "bg-rose-50 text-rose-700 ring-rose-200",
    "Recomendación psicológica": "bg-amber-50 text-amber-700 ring-amber-200",
    "Pendiente": "bg-slate-100 text-slate-700 ring-slate-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${map[estado] || map.Pendiente}`}>
      {estado}
    </span>
  );
};

const StatCard = ({ label, value, accent = "slate" }) => {
  const color = {
    slate:  "bg-slate-50 ring-slate-200 text-slate-700",
    emerald:"bg-emerald-50 ring-emerald-200 text-emerald-700",
    rose:   "bg-rose-50 ring-rose-200 text-rose-700",
  }[accent];
  return (
    <div className={`rounded-xl px-3 py-2 text-center ring-1 ${color} min-w-[70px]`}>
      <div className="text-[11px] font-medium">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
};

const Segment = ({ value, onChange, options }) => (
  <div className="inline-flex rounded-xl bg-slate-100 p-1">
    {options.map((o) => (
      <button
        key={o}
        onClick={() => onChange(o)}
        className={`px-3 py-1.5 text-sm rounded-lg transition ${
          value === o ? "bg-white shadow ring-1 ring-slate-200 text-slate-900" : "text-slate-600 hover:text-slate-800"
        }`}
      >
        {o}
      </button>
    ))}
  </div>
);

/* ==================== util simple ==================== */
const exportCSV = (rows, filename = "asesores.csv") => {
  const headers = ["id","nombre","email","puesto","estado","cursos","estudiantes"];
  const csv = [headers.join(","), ...rows.map(r => headers.map(h => `"${String(r[h] ?? "").replace(/"/g,'""')}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
};

/* ==================== vista ==================== */
export default function AsesoresAdmin() {
  const [items, setItems] = useState(seed);
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("Todos");
  const [periodo, setPeriodo] = useState("Mes");
  const [soloRechazados, setSoloRechazados] = useState(false);

  const stats = useMemo(() => {
    const total = items.length;
    const acept = items.filter(i => i.estado === "Aceptado").length;
    const rech = items.filter(i => i.estado === "Rechazado").length;
    return { total, acept, rech };
  }, [items]);

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    return items.filter(i => {
      if (soloRechazados && i.estado !== "Rechazado") return false;
      if (estado !== "Todos" && i.estado !== estado) return false;
      if (!text) return true;
      return [i.id, i.nombre, i.email, i.puesto].join(" ").toLowerCase().includes(text);
    });
  }, [items, q, estado, soloRechazados]);

  const eliminar = (id) => setItems(prev => prev.filter(x => x.id !== id));

  const rechazados = items.filter(i => i.estado === "Rechazado");

  return (
    <div className="mx-auto w-full max-w-7xl px-4 md:px-6 py-6">
      {/* ====== Topbar ====== */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-violet-700">Asesores — Admin Central</h1>
          <p className="text-slate-500 text-sm">Visualiza, filtra y gestiona el ciclo de incorporación.</p>
        </div>
        <div className="flex items-center gap-3">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Aceptados" value={stats.acept} accent="emerald" />
          <StatCard label="Rechazados" value={stats.rech} accent="rose" />
          <button
            onClick={() => alert("Abrir modal para agregar asesor")}
            className="rounded-xl bg-violet-600 text-white px-4 py-2 text-sm font-semibold shadow hover:bg-violet-700"
          >
            Agregar asesor
          </button>
        </div>
      </div>

      {/* ====== Layout principal ====== */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ====== Filtros ====== */}
        <aside className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">Filtros</h2>

          <label className="mt-3 block">
            <span className="text-xs text-slate-600">Buscar</span>
            <div className="relative mt-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Nombre, email o ID"
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5"
              />
            </div>
          </label>

          <label className="mt-3 block">
            <span className="text-xs text-slate-600">Estado evaluación</span>
            <select
              value={estado}
              onChange={(e)=>setEstado(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/5"
            >
              {["Todos","Aceptado","Rechazado","Recomendación psicológica"].map(s => <option key={s}>{s}</option>)}
            </select>
          </label>

          <div className="mt-3">
            <span className="text-xs text-slate-600">Periodo</span>
            <div className="mt-1"><Segment value={periodo} onChange={setPeriodo} options={["Semana","Mes","Año"]} /></div>
          </div>

          <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300" checked={soloRechazados} onChange={(e)=>setSoloRechazados(e.target.checked)} />
            Mostrar solo rechazados
          </label>

          <div className="mt-4 grid gap-2">
            <button
              onClick={() => exportCSV(rechazados, "rechazados.csv")}
              className="rounded-xl bg-rose-600 text-white px-3 py-2 text-sm font-medium hover:bg-rose-700"
            >
              Exportar rechazados CSV
            </button>
            <button
              onClick={() => alert("Estadística inferencial")}
              className="rounded-xl bg-violet-600 text-white px-3 py-2 text-sm font-medium hover:bg-violet-700"
            >
              Estadística inferencial
            </button>
            <button
              onClick={() => alert("Gestionar honorarios")}
              className="rounded-xl bg-emerald-600 text-white px-3 py-2 text-sm font-medium hover:bg-emerald-700"
            >
              Gestionar honorarios
            </button>
          </div>
        </aside>

        {/* ====== Lista de asesores ====== */}
        <section className="lg:col-span-9 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Lista de asesores</h2>
          </div>

          {/* Tabla (>= md) */}
          <div className="hidden md:block mt-3 overflow-hidden rounded-xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">ID</th>
                  <th className="px-4 py-2 text-left font-medium">Nombre</th>
                  <th className="px-4 py-2 text-left font-medium">Puesto</th>
                  <th className="px-4 py-2 text-left font-medium">Estado evaluación</th>
                  <th className="px-4 py-2 text-left font-medium">Cursos / Estudiantes</th>
                  <th className="px-4 py-2 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 text-slate-600">{a.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{a.nombre}</div>
                      <div className="text-slate-500 text-xs">{a.email}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{a.puesto}</td>
                    <td className="px-4 py-3"><BadgeEstado estado={a.estado} /></td>
                    <td className="px-4 py-3 text-slate-700">{a.cursos} cursos<br/>{a.estudiantes} estudiantes</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-700 hover:bg-slate-50">Ver</button>
                        <button className="rounded-lg bg-violet-600 text-white px-3 py-1.5 hover:bg-violet-700">Honorarios</button>
                        <button onClick={()=>eliminar(a.id)} className="rounded-lg bg-rose-600 text-white px-3 py-1.5 hover:bg-rose-700">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan="6" className="px-4 py-10 text-center text-slate-500">Sin resultados.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Lista en tarjetas (móvil) */}
          <div className="md:hidden mt-3 grid grid-cols-1 gap-3">
            {filtered.map((a) => (
              <div key={a.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-500">{a.id}</div>
                  <BadgeEstado estado={a.estado} />
                </div>
                <div className="mt-1 font-semibold text-slate-900">{a.nombre}</div>
                <div className="text-xs text-slate-500">{a.email}</div>
                <div className="mt-2 text-sm text-slate-700">{a.puesto}</div>
                <div className="mt-2 text-xs text-slate-600">{a.cursos} cursos • {a.estudiantes} estudiantes</div>
                <div className="mt-3 flex gap-2">
                  <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-700">Ver</button>
                  <button className="rounded-lg bg-violet-600 text-white px-3 py-1.5">Honorarios</button>
                  <button onClick={()=>eliminar(a.id)} className="rounded-lg bg-rose-600 text-white px-3 py-1.5">Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ====== Tarjetas inferiores ====== */}
        <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800">Panel rápido</h3>
            <ul className="mt-3 space-y-1 text-sm text-slate-700">
              <li>Total asesores: {stats.total}</li>
              <li>Aceptados: {stats.acept}</li>
              <li>Rechazados: {stats.rech}</li>
              <li>Recomendación psicológica: {items.filter(i=>i.estado==="Recomendación psicológica").length}</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800">Acciones masivas</h3>
            <div className="mt-3 grid gap-2">
              <button onClick={()=>alert("Enviar encuesta")} className="rounded-xl bg-violet-600 text-white px-3 py-2 text-sm font-medium hover:bg-violet-700">
                Enviar encuesta a asesores activos
              </button>
              <button onClick={()=>alert("Generar pagos")} className="rounded-xl bg-emerald-600 text-white px-3 py-2 text-sm font-medium hover:bg-emerald-700">
                Generar pagos
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800">Rechazados</h3>
            <p className="mt-2 text-sm text-slate-600">Exporta datos y planifica acciones de seguimiento.</p>
            <button
              onClick={()=>exportCSV(rechazados, "rechazados.csv")}
              className="mt-3 rounded-xl bg-rose-600 text-white px-3 py-2 text-sm font-medium hover:bg-rose-700"
            >
              Exportar CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
