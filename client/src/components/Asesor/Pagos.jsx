import { useEffect, useMemo, useState } from "react";

/* ---------- Filtros ---------- */
const YEARS = Array.from({ length: 6 }, (_, i) => 2024 + i);
const MONTHS = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];

/* ---------- Mock de datos por semana (puedes quitar esto al conectar API) ---------- */
const DATA = {
  1: [
    {
      id: "P001",
      tipo: "Asesoría",
      montoBase: null,
      horas: 1,
      honorarios: "35%",
      ingreso: 350,
      fecha: "2025-09-03",
      metodo: "Transferencia",
      nota: "Pago por asesoría",
      status: "Pagado",
    },
    {
      id: "P002",
      tipo: "Curso",
      montoBase: 120,
      horas: 4,
      honorarios: "$480",
      ingreso: 480,
      fecha: "2025-09-04",
      metodo: "Efectivo",
      nota: "Curso extra",
      status: "Pendiente",
    },
  ],
  2: [],
  3: [],
  4: [],
};

const fmtMoney = (n) =>
  typeof n === "number"
    ? n.toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN",
        maximumFractionDigits: 0,
      })
    : n ?? "-";

/* ---------- UI Components ---------- */
function WeekChip({ w, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        "px-4 py-2 rounded-xl text-sm font-medium transition shadow-sm",
        active
          ? "bg-violet-700 text-white"
          : "bg-white text-slate-800 border border-slate-200 hover:bg-slate-50",
      ].join(" ")}
    >
      Semana {w}
    </button>
  );
}

export default function PagosSemanas() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
  const [week, setWeek] = useState(1);

  const rows = useMemo(() => DATA[week] ?? [], [week]);

  /* Aquí conectarías tu API usando year, month y week */
  useEffect(() => {
    // Ejemplo de fetch:
    // fetch(`/api/pagos?year=${year}&month=${month}&week=${week}`)
    //   .then(r => r.json())
    //   .then(data => setRows(data));
    // Por ahora, usamos el mock de DATA.
    console.log("Filtros cambiaron:", { year, month, week });
  }, [year, month, week]);

  return (
    <div className="space-y-4">
      {/* Título */}
      <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">
        Dashboard de Pagos – Asesor
      </h2>

      {/* Filtros Año / Mes */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          {MONTHS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* Botonera Semanas */}
      <div className="flex flex-wrap gap-3">
        {[1, 2, 3, 4].map((w) => (
          <WeekChip key={w} w={w} active={w === week} onClick={() => setWeek(w)} />
        ))}
      </div>

      {/* Tabla */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left">
            <thead className="bg-slate-50/60 text-slate-600 text-sm">
              <tr>
                <th className="px-5 py-4 font-semibold">ID_Pago</th>
                <th className="px-5 py-4 font-semibold">Tipo de servicio</th>
                <th className="px-5 py-4 font-semibold">Monto base</th>
                <th className="px-5 py-4 font-semibold">Horas trabajadas</th>
                <th className="px-5 py-4 font-semibold">Honorarios / Comisión</th>
                <th className="px-5 py-4 font-semibold">Ingreso final</th>
                <th className="px-5 py-4 font-semibold">Fecha de pago</th>
                <th className="px-5 py-4 font-semibold">Método de pago</th>
                <th className="px-5 py-4 font-semibold">Nota</th>
                <th className="px-5 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="text-slate-800">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-8 text-center text-slate-500">
                    No hay registros para esta semana.
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => (
                  <tr key={r.id} className={i % 2 ? "bg-slate-50/30" : ""}>
                    <td className="px-5 py-5 whitespace-nowrap">{r.id}</td>
                    <td className="px-5 py-5">{r.tipo}</td>
                    <td className="px-5 py-5">{r.montoBase ?? "-"}</td>
                    <td className="px-5 py-5">{r.horas}</td>
                    <td className="px-5 py-5">{r.honorarios}</td>
                    <td className="px-5 py-5">{fmtMoney(r.ingreso)}</td>
                    <td className="px-5 py-5">{r.fecha}</td>
                    <td className="px-5 py-5">{r.metodo}</td>
                    <td className="px-5 py-5">{r.nota}</td>
                    <td className="px-5 py-5">
                      <span
                        className={[
                          "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                          r.status === "Pagado"
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                            : "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
                        ].join(" ")}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
