import React, { useMemo, useState } from "react";

/* ===================== Helpers ===================== */
const money = (n = 0) =>
  (Number(n) || 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  });

const months = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];
const byMonth = (isoDate) => {
  const d = new Date(isoDate);
  return isNaN(d) ? 0 : d.getMonth();
};
const sum = (arr, sel) => arr.reduce((a, x) => a + (typeof sel === "function" ? sel(x) : x[sel] || 0), 0);

/* ===================== Mini Charts (SVG) ===================== */
function LineMini({ series = [], height = 140, padding = 28 }) {
  // series: [{label, data: number[12], color}]
  const width = 360;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const max = Math.max(1, ...series.flatMap(s => s.data));
  const x = (i) => padding + (i / 11) * innerW;
  const y = (v) => padding + innerH - (v / max) * innerH;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      {/* axis */}
      <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#e5e7eb" />
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e5e7eb" />
      {/* ticks */}
      {[0.25,0.5,0.75].map(t => (
        <line key={t} x1={padding} x2={width - padding} y1={padding + innerH*(1-t)} y2={padding + innerH*(1-t)} stroke="#f1f5f9" />
      ))}
      {series.map((s, idx) => {
        const d = s.data.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(v)}`).join(" ");
        return (
          <g key={s.label}>
            <path d={d} fill="none" stroke={s.color} strokeWidth="2.5" />
            {s.data.map((v, i) => (
              <circle key={i} cx={x(i)} cy={y(v)} r="2.8" fill={s.color} />
            ))}
          </g>
        );
      })}
      {/* labels bottom */}
      {months.map((m, i) => (
        <text key={m} x={x(i)} y={height - padding + 16} fontSize="9" textAnchor="middle" fill="#64748b">{m}</text>
      ))}
    </svg>
  );
}

function PieMini({ data = [], height = 160, palette = ["#94a3b8", "#cbd5e1", "#64748b", "#e5e7eb"] }) {
  const width = 320;
  const cx = width / 2, cy = height / 2, r = Math.min(cx, cy) - 18;
  const total = Math.max(1, sum(data, "value"));
  let a0 = -Math.PI / 2;

  const arcs = data.map((d, i) => {
    const a1 = a0 + (d.value / total) * Math.PI * 2;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const p0 = [cx + r * Math.cos(a0), cy + r * Math.sin(a0)];
    const p1 = [cx + r * Math.cos(a1), cy + r * Math.sin(a1)];
    const path = `M ${cx} ${cy} L ${p0[0]} ${p0[1]} A ${r} ${r} 0 ${large} 1 ${p1[0]} ${p1[1]} Z`;
    a0 = a1;
    return { path, color: palette[i % palette.length], label: d.label, value: d.value };
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      {arcs.map((a, i) => <path key={i} d={a.path} fill={a.color} stroke="#fff" />)}
      {/* legend */}
      {arcs.map((a, i) => (
        <g key={i} transform={`translate(${12}, ${12 + i*18})`}>
          <rect width="10" height="10" fill={a.color} rx="2" />
          <text x="16" y="10" fontSize="11" fill="#475569">{a.label} ({money(a.value)})</text>
        </g>
      ))}
    </svg>
  );
}

function BarsMini({ data = [], height = 160 }) {
  // data: [{label,value}]
  const width = 320, padding = 28;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const max = Math.max(1, ...data.map(d => d.value));
  const bw = innerW / data.length * 0.7;
  const gap = innerW / data.length * 0.3;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e5e7eb" />
      {data.map((d, i) => {
        const h = (d.value / max) * innerH;
        const x = padding + i * (bw + gap) + gap/2;
        const y = height - padding - h;
        return (
          <g key={d.label}>
            <rect x={x} y={y} width={bw} height={h} rx="6" fill="#111827" />
            <text x={x + bw/2} y={height - padding + 16} fontSize="10" textAnchor="middle" fill="#64748b">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ===================== Main ===================== */
export default function FinancialDashboard() {
  // Datos demo (ajusta a tu backend)
  const [ingresos, setIngresos] = useState([
    { fecha: "2025-01-05", concepto: "Asesoría 1", monto: 1200, canal: "web", servicio: "Asesoría", responsable: "Sistema" },
    { fecha: "2025-02-12", concepto: "Curso Verano", monto: 3500, canal: "manual", servicio: "Curso", responsable: "SecAdmin" },
    { fecha: "2025-03-20", concepto: "Curso Regular", monto: 1500, canal: "web", servicio: "Curso", responsable: "Sistema" },
    { fecha: "2025-03-22", concepto: "Asesoría Avanzada", monto: 900, canal: "manual", servicio: "Asesoría", responsable: "SecAdmin" },
  ]);
  const [egresos, setEgresos] = useState([
    { fecha: "2025-01-10", concepto: "Pago docente", monto: 800, categoria: "Docentes" },
    { fecha: "2025-02-05", concepto: "Licencias software", monto: 1200, categoria: "Licencias" },
    { fecha: "2025-03-01", concepto: "Publicidad", monto: 600, categoria: "Marketing" },
  ]);

  // KPIs simples (ejemplo)
  const ingresosMes = sum(ingresos.filter(i => byMonth(i.fecha) === 0), "monto"); // Enero como ejemplo
  const egresosMes  = sum(egresos.filter(i => byMonth(i.fecha) === 0), "monto");
  const utilidadBruta = ingresosMes - egresosMes;                          // demo
  const utilidadNeta  = utilidadBruta * 0.9;                               // demo (impuestos/otras deducciones)
  const margen        = ingresosMes ? (utilidadBruta / ingresosMes) : 0;
  const cac           = 4;                                                 // demo
  const cltv          = 9500;                                              // demo

  // Series para gráficas
  const serieIngresos = Array(12).fill(0);
  const serieEgresos  = Array(12).fill(0);
  ingresos.forEach(i => { serieIngresos[byMonth(i.fecha)] += i.monto; });
  egresos.forEach(e => { serieEgresos[byMonth(e.fecha)] += e.monto; });

  const distEgresos = Object.values(egresos.reduce((acc, e) => {
    acc[e.categoria] = acc[e.categoria] || { label: e.categoria, value: 0 };
    acc[e.categoria].value += e.monto;
    return acc;
  }, {}));

  const ventasPorServicio = Object.values(ingresos.reduce((acc, i) => {
    acc[i.servicio] = acc[i.servicio] || { label: i.servicio, value: 0 };
    acc[i.servicio].value += i.monto;
    return acc;
  }, {}));

  // Form para agregar ingreso manual
  const [nuevo, setNuevo] = useState({ fecha: "", concepto: "", monto: "", servicio: "Curso" });
  const agregarVenta = () => {
    const m = Number(nuevo.monto);
    if (!nuevo.fecha || !nuevo.concepto || !m) return alert("Completa fecha, concepto y monto.");
    setIngresos(p => [{ fecha: nuevo.fecha, concepto: nuevo.concepto, monto: m, canal: "manual", servicio: nuevo.servicio, responsable: "SecAdmin" }, ...p]);
    setNuevo({ fecha: "", concepto: "", monto: "", servicio: "Curso" });
  };

  // Feed / alertas demo
  const alertas = [];
  if (egresos.filter(e => e.categoria === "Marketing").some(e => e.monto > 1000)) {
    alertas.push("Gasto en Marketing mayor a $1000 este mes.");
  }
  if (ingresos.some(i => i.monto >= 3000 && i.canal === "manual")) {
    alertas.push("Venta grande detectada: venta manual ≥ $3,000.");
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 md:px-6 py-6">
      {/* KPIs + Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <KPI title="Ingresos mensuales" value={money(ingresosMes)} hint="Canal: web/manual (se sincroniza automáticamente con ventas web)" />
        <KPI title="Egresos mensuales" value={money(egresosMes)} />
        <Card title="Ingresos vs Egresos (meses)">
          <LineMini
            series={[
              { label: "Ingresos", data: serieIngresos, color: "#2563eb" },
              { label: "Egresos",  data: serieEgresos,  color: "#10b981" },
            ]}
          />
        </Card>

        <KPI title="Utilidad bruta" value={money(utilidadBruta)} hint="Utilidad antes de impuestos y otras deducciones." />
        <KPI title="Utilidad neta (estimada)" value={money(utilidadNeta)} />
        <Card title="Distribución de egresos">
          <PieMini data={distEgresos} />
        </Card>

        <KPI title="Margen de rentabilidad" value={`${Math.round(margen * 100)}%`} rightLabel="CAC" rightValue={`$${cac}`} />
        <KPI title="CLTV" value={money(cltv)} />
        <Card title="Ventas por servicio">
          <BarsMini data={ventasPorServicio} />
        </Card>
      </div>

      {/* Registros */}
      <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card title="Registro de Ingresos">
          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="date"
              value={nuevo.fecha}
              onChange={(e) => setNuevo({ ...nuevo, fecha: e.target.value })}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="dd/mm/aaaa"
            />
            <input
              value={nuevo.concepto}
              onChange={(e) => setNuevo({ ...nuevo, concepto: e.target.value })}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm md:col-span-2"
              placeholder="Concepto"
            />
            <input
              type="number"
              value={nuevo.monto}
              onChange={(e) => setNuevo({ ...nuevo, monto: e.target.value })}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Monto"
            />
            <select
              value={nuevo.servicio}
              onChange={(e) => setNuevo({ ...nuevo, servicio: e.target.value })}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm md:col-span-2"
            >
              <option>Curso</option>
              <option>Asesoría</option>
            </select>
            <button onClick={agregarVenta} className="rounded-xl bg-indigo-600 text-white px-3 py-2 text-sm font-medium hover:bg-indigo-700 md:col-span-2">
              Agregar venta manual
            </button>
          </div>

          {/* Tabla */}
          <Table
            columns={["Fecha", "Concepto", "Monto", "Canal", "Responsable"]}
            rows={ingresos.map(i => [i.fecha, i.concepto, money(i.monto), i.canal, i.responsable])}
          />
        </Card>

        <Card title="Registro de Egresos">
          <Table
            columns={["Fecha", "Concepto", "Monto", "Categoría"]}
            rows={egresos.map(e => [e.fecha, e.concepto, money(e.monto), e.categoria])}
          />
        </Card>
      </div>

      {/* Alertas + Actividad */}
      <div className="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card title="Alertas">
          {alertas.length === 0 ? (
            <p className="text-slate-500 text-sm">Sin alertas por ahora.</p>
          ) : (
            <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
              {alertas.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          )}
        </Card>
        <Card title="Actividad reciente">
          <p className="text-slate-600 text-sm">
            Últimas entradas de ingresos y egresos. (Aquí podría aparecer un feed que indique si la venta fue manual o por web).
          </p>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {ingresos.slice(0,3).map((i,idx)=>(
              <li key={idx}>💰 {i.fecha}: {i.concepto} — {money(i.monto)} ({i.canal})</li>
            ))}
            {egresos.slice(0,3).map((e,idx)=>(
              <li key={`e${idx}`}>💸 {e.fecha}: {e.concepto} — {money(e.monto)} ({e.categoria})</li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

/* ===================== UI Pieces ===================== */
function Shell({ children }) {
  return <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">{children}</div>;
}
function Card({ title, children }) {
  return (
    <Shell>
      {title && <h3 className="text-sm font-semibold text-slate-800">{title}</h3>}
      <div className={title ? "mt-3" : ""}>{children}</div>
    </Shell>
  );
}

function KPI({ title, value, hint, rightLabel, rightValue }) {
  return (
    <Shell>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-slate-600">{title}</div>
          <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
          {hint && <p className="mt-1 text-xs text-slate-500 max-w-[38ch]">{hint}</p>}
        </div>
        {rightLabel && (
          <div className="rounded-xl border border-slate-200 px-3 py-2 text-right">
            <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">{rightLabel}</div>
            <div className="text-sm font-semibold text-slate-900">{rightValue}</div>
          </div>
        )}
      </div>
    </Shell>
  );
}

function Table({ columns, rows }) {
  return (
    <div className="mt-3">
      {/* Desktop */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>{columns.map(c => <th key={c} className="px-4 py-2 text-left font-medium">{c}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r, i) => (
              <tr key={i} className="hover:bg-slate-50/60">
                {r.map((cell, j) => <td key={j} className="px-4 py-2">{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile cards */}
      <div className="md:hidden grid grid-cols-1 gap-2">
        {rows.map((r, i) => (
          <div key={i} className="rounded-xl border border-slate-200 p-3 text-sm">
            {r.map((cell, j) => (
              <div key={j} className="flex justify-between gap-3 py-0.5">
                <span className="text-slate-500">{columns[j]}</span>
                <span className="font-medium text-slate-800">{cell}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
