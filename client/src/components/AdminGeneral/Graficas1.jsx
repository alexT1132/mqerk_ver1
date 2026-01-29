import { useState } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  PieChart, Pie, Cell
} from "recharts";

/* Datos de ejemplo */
const dataMensual = [
  { mes: "Ene", ingresos: 50000, egresos: 30000 },
  { mes: "Feb", ingresos: 56000, egresos: 34000 },
  { mes: "Mar", ingresos: 60000, egresos: 36000 },
  { mes: "Abr", ingresos: 58000, egresos: 33000 },
  { mes: "May", ingresos: 65000, egresos: 38000 },
  { mes: "Jun", ingresos: 69000, egresos: 40000 },
  { mes: "Jul", ingresos: 70000, egresos: 45000 },
  { mes: "Ago", ingresos: 76000, egresos: 43000 },
  { mes: "Sep", ingresos: 75000, egresos: 48000 },
  { mes: "Oct", ingresos: 77000, egresos: 50000 },
  { mes: "Nov", ingresos: 82000, egresos: 54000 },
  { mes: "Dic", ingresos: 87000, egresos: 52000 },
];

const dataAnual = [
  { mes: "2021", ingresos: 620000, egresos: 420000 },
  { mes: "2022", ingresos: 690000, egresos: 455000 },
  { mes: "2023", ingresos: 720000, egresos: 498000 },
  { mes: "2024", ingresos: 780000, egresos: 520000 },
];

const costsMensual = [
  { name: "Docentes", value: 35 },
  { name: "Licencias", value: 15 },
  { name: "Marketing", value: 10 },
  { name: "Operación", value: 30 },
  { name: "Otros", value: 10 },
];
const costsAnual = [
  { name: "Docentes", value: 40 },
  { name: "Licencias", value: 12 },
  { name: "Marketing", value: 8 },
  { name: "Operación", value: 30 },
  { name: "Otros", value: 10 },
];

const COLORS = ["#94a3b8", "#60a5fa", "#34d399", "#f59e0b", "#a78bfa"]; // gris/azul/verde/ámbar/violeta

export default function ChartsSection() {
  const [vista, setVista] = useState("mensual");

  const series = vista === "mensual" ? dataMensual : dataAnual;
  const pieData = vista === "mensual" ? costsMensual : costsAnual;

  return (
    <section className="mx-auto max-w-7xl px-4 py-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Card 1: Líneas */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">
              Ingresos vs Egresos ({vista})
            </h3>
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-indigo-700">ingresos</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-sky-700">egresos</span>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="egresos" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="ingresos" stroke="#6366f1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 2: Pastel */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Distribución de costos</h3>
            {/* Toggle mensual/anual */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Vista</span>
              <div className="rounded-xl bg-slate-50 p-1 ring-1 ring-slate-200">
                <button
                  onClick={() => setVista("mensual")}
                  className={`rounded-lg px-3 py-1 transition ${
                    vista === "mensual" ? "bg-white shadow-sm text-slate-900" : "text-slate-600"
                  }`}
                >
                  mensual
                </button>
                <button
                  onClick={() => setVista("anual")}
                  className={`rounded-lg px-3 py-1 transition ${
                    vista === "anual" ? "bg-white shadow-sm text-slate-900" : "text-slate-600"
                  }`}
                >
                  anual
                </button>
              </div>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={1}
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
