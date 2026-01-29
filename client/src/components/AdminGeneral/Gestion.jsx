import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

export default function GestionDashboard() {
  const [selectedCurso, setSelectedCurso] = useState(null);

  const kpis = [
    { title: "Total Cursos", value: 12 },
    { title: "Total Grupos", value: 34 },
    { title: "Estudiantes Totales", value: 540 },
    { title: "Cupos Ocupados", value: "85%" },
    { title: "Promedio por Grupo", value: 16 },
  ];

  const cursosData = [
    { curso: "Matemáticas", grupos: 5, estudiantes: 120 },
    { curso: "Física", grupos: 4, estudiantes: 100 },
    { curso: "Química", grupos: 3, estudiantes: 80 },
    { curso: "Biología", grupos: 2, estudiantes: 60 },
  ];

  const matriculaData = [
    { mes: "Enero", estudiantes: 40 },
    { mes: "Febrero", estudiantes: 55 },
    { mes: "Marzo", estudiantes: 70 },
    { mes: "Abril", estudiantes: 90 },
  ];

  const rendimientoData = [
    { criterio: "Asistencia", valor: 85 },
    { criterio: "Tareas", valor: 78 },
    { criterio: "Calificaciones", valor: 82 },
    { criterio: "Participación", valor: 75 },
  ];

  const Card = ({ children, className = "" }) => (
    <div className={`bg-white border border-gray-200 rounded-2xl shadow-md ${className}`}>
      {children}
    </div>
  );

  const CardContent = ({ children }) => <div className="p-4">{children}</div>;

  const Tabs = ({ children }) => <div>{children}</div>;
  const TabsList = ({ children }) => <div className="flex gap-4 mt-4">{children}</div>;
  const TabsTrigger = ({ value, children, selected, onClick }) => (
    <button
      className={`px-4 py-2 rounded-full font-medium border ${
        selected === value ? "bg-blue-600 text-white" : "bg-white text-blue-600"
      }`}
      onClick={() => onClick(value)}
    >
      {children}
    </button>
  );
  const TabsContent = ({ value, selected, children }) => (value === selected ? <div>{children}</div> : null);

  const Button = ({ children, variant = "solid" }) => {
    const base = "px-4 py-2 rounded-md font-medium";
    const styles =
      variant === "outline"
        ? "border border-blue-600 text-blue-600 bg-white hover:bg-blue-50"
        : "bg-blue-600 text-white hover:bg-blue-700";
    return <button className={`${base} ${styles}`}>{children}</button>;
  };

  const [tab, setTab] = useState("cursos");

  return (
    <div className="p-6 grid gap-6">
      <h1 className="text-2xl font-bold">Gestión Académica</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {kpis.map((kpi, i) => (
          <Card key={i} className="text-center">
            <CardContent>
              <h2 className="text-lg font-semibold">{kpi.title}</h2>
              <p className="text-2xl font-bold text-blue-600">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs>
        <TabsList>
          <TabsTrigger value="cursos" selected={tab} onClick={setTab}>Cursos y Grupos</TabsTrigger>
          <TabsTrigger value="matricula" selected={tab} onClick={setTab}>Matrícula</TabsTrigger>
          <TabsTrigger value="rendimiento" selected={tab} onClick={setTab}>Rendimiento</TabsTrigger>
        </TabsList>
        
        <TabsContent value="cursos" selected={tab}>
          <Card>
            <CardContent>
              <h2 className="font-bold text-lg mb-4">Cursos y Grupos</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cursosData}>
                  <XAxis dataKey="curso" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="grupos" fill="#8884d8" />
                  <Bar dataKey="estudiantes" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matricula" selected={tab}>
          <Card>
            <CardContent>
              <h2 className="font-bold text-lg mb-4">Evolución de Matrícula</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={matriculaData}>
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="estudiantes" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rendimiento" selected={tab}>
          <Card>
            <CardContent>
              <h2 className="font-bold text-lg mb-4">Rendimiento Estudiantil</h2>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart outerRadius={120} data={rendimientoData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="criterio" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Rendimiento" dataKey="valor" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Acciones rápidas */}
      <div className="flex gap-4 mt-6">
        <Button variant="outline">Registrar Estudiante</Button>
        <Button variant="outline">Crear Grupo</Button>
        <Button variant="outline">Asignar Asesor</Button>
      </div>
    </div>
  );
}
