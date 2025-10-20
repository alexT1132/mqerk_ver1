import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

// Mock data (replace with real API calls)
const asistenciaData = [
  { mes: "Ene", asistencia: 88, satisfaccion: 4.6 },
  { mes: "Feb", asistencia: 85, satisfaccion: 4.4 },
  { mes: "Mar", asistencia: 92, satisfaccion: 4.7 },
  { mes: "Abr", asistencia: 89, satisfaccion: 4.5 },
  { mes: "May", asistencia: 90, satisfaccion: 4.6 },
  { mes: "Jun", asistencia: 87, satisfaccion: 4.3 },
  { mes: "Jul", asistencia: 91, satisfaccion: 4.8 },
  { mes: "Ago", asistencia: 93, satisfaccion: 4.7 },
  { mes: "Sep", asistencia: 88, satisfaccion: 4.4 },
  { mes: "Oct", asistencia: 90, satisfaccion: 4.6 },
  { mes: "Nov", asistencia: 92, satisfaccion: 4.7 },
  { mes: "Dic", asistencia: 86, satisfaccion: 4.2 },
];

const asesoresData = [
  { name: "Ana Pérez", horas: 120, grupos: 3, retencion: 85, satisfaccion: 4.6 },
  { name: "Luis Méndez", horas: 95, grupos: 2, retencion: 90, satisfaccion: 4.8 },
  { name: "María Ruiz", horas: 140, grupos: 4, retencion: 78, satisfaccion: 4.3 },
  { name: "Jorge Silva", horas: 110, grupos: 3, retencion: 82, satisfaccion: 4.5 },
];

const ventasData = [
  { name: "Manual", value: 120 },
  { name: "Automática", value: 420 },
];

const finalizacionData = [
  { curso: "Física I", inscritos: 40, finalizados: 30 },
  { curso: "Álgebra", inscritos: 55, finalizados: 45 },
  { curso: "Química", inscritos: 32, finalizados: 20 },
  { curso: "Programación", inscritos: 60, finalizados: 50 },
];

const RADAR_VARS = ["horas", "grupos", "retencion", "satisfaccion"];

export default function ProductividadPanel() {
  const [periodo, setPeriodo] = useState("mensual");
  const [asesorFilter, setAsesorFilter] = useState("todos");

  // derive radar data from asesoresData
  const radarData = useMemo(() => {
    return asesoresData.map((a) => ({
      subject: a.name,
      horas: a.horas / 10, // normalize for display
      grupos: a.grupos * 10,
      retencion: a.retencion / 10,
      satisfaccion: a.satisfaccion * 10,
    }));
  }, []);

  // colors for pies/bars
  const COLORS = ["#6366F1", "#06B6D4", "#F59E0B", "#10B981", "#EF4444"];

  return (
    <div className="min-h-screen p-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-indigo-700">Productividad</h2>
        </div>
        <div className="flex space-x-3 items-center">
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="rounded-md border px-3 py-2 bg-white"
          >
            <option value="mensual">Mensual</option>
            <option value="trimestral">Trimestral</option>
            <option value="anual">Anual</option>
          </select>

          <select
            value={asesorFilter}
            onChange={(e) => setAsesorFilter(e.target.value)}
            className="rounded-md border px-3 py-2 bg-white"
          >
            <option value="todos">Todos los asesores</option>
            {asesoresData.map((a, i) => (
              <option key={i} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* KPI cards */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-500">Horas impartidas (mes)</p>
          <p className="text-2xl font-bold text-indigo-600">{asesoresData.reduce((s, a) => s + a.horas, 0)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-500">Grupos activos</p>
          <p className="text-2xl font-bold text-indigo-600">{asesoresData.reduce((s, a) => s + a.grupos, 0)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-500">Satisfacción promedio</p>
          <p className="text-2xl font-bold text-indigo-600">{(asesoresData.reduce((s, a) => s + a.satisfaccion, 0) / asesoresData.length).toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-500">Ventas (periodo)</p>
          <p className="text-2xl font-bold text-indigo-600">{ventasData.reduce((s, v) => s + v.value, 0)}</p>
        </div>
      </section>

      {/* Main grid: left charts, right charts */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Asistencia + Rendimiento */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-2">Asistencia y Satisfacción ({periodo})</h3>
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={asistenciaData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="asistencia" name="Asistencia %" stroke="#06B6D4" strokeWidth={2} />
                  <Line type="monotone" dataKey="satisfaccion" name="Satisfacción (escala 1-5)" stroke="#6366F1" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-2">Tabla resumen por curso</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="p-2">Curso</th>
                    <th className="p-2">Asesor</th>
                    <th className="p-2">Inscritos</th>
                    <th className="p-2">Finalizados</th>
                    <th className="p-2">% Finalización</th>
                    <th className="p-2">% Asistencia</th>
                  </tr>
                </thead>
                <tbody>
                  {finalizacionData.map((f, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">{f.curso}</td>
                      <td className="p-2">{["Ana Pérez","Luis Méndez","María Ruiz","Jorge Silva"][i % 4]}</td>
                      <td className="p-2">{f.inscritos}</td>
                      <td className="p-2">{f.finalizados}</td>
                      <td className="p-2">{Math.round((f.finalizados / f.inscritos) * 100)}%</td>
                      <td className="p-2">{80 + i * 3}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column: Radar, Ventas, Finalización */}
        <aside className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-sm" style={{ height: 300 }}>
            <h4 className="font-semibold text-gray-700 mb-2">Comparativo de asesores (Radar)</h4>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart cx="50%" cy="50%" outerRadius={80} data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 50]} />
                <Radar name="Asesores" dataKey="horas" stroke="#6366F1" fill="#6366F1" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm" style={{ height: 260 }}>
            <h4 className="font-semibold text-gray-700 mb-2">Ventas - Manual vs Automática</h4>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={ventasData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={70} paddingAngle={4}>
                  {ventasData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-3 text-xs text-gray-500">Totales: {ventasData.reduce((s, v) => s + v.value, 0)} ventas</div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-semibold text-gray-700 mb-2">Cursos - Finalización</h4>
            <div style={{ width: "100%", height: 140 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={finalizacionData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="curso" type="category" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="inscritos" name="Inscritos" stackId="a" />
                  <Bar dataKey="finalizados" name="Finalizados" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </aside>
      </main>

    </div>
  );
}
