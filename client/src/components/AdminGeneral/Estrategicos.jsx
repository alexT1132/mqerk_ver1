import { useState } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend, CartesianGrid, XAxis, YAxis } from "recharts";

// COMPONENTES UI DEFINIDOS LOCALMENTE
const Button = ({ children, className = "", ...props }) => (
  <button className={`px-4 py-2 rounded-md font-semibold ${className}`} {...props}>
    {children}
  </button>
);

const Card = ({ children, className = "" }) => (
  <div className={`bg-white border rounded-xl ${className}`}>{children}</div>
);

const CardHeader = ({ children }) => <div className="p-4 border-b font-bold text-lg">{children}</div>;
const CardTitle = ({ children }) => <h2 className="text-xl font-semibold">{children}</h2>;
const CardContent = ({ children }) => <div className="p-4">{children}</div>;

const Select = ({ onValueChange, children }) => (
  <select onChange={(e) => onValueChange(e.target.value)} className="border rounded px-4 py-2">
    {children}
  </select>
);
const SelectTrigger = ({ children, className }) => <>{children}</>;
const SelectValue = ({ placeholder }) => <option>{placeholder}</option>;
const SelectContent = ({ children }) => <>{children}</>;
const SelectItem = ({ value, children }) => <option value={value}>{children}</option>;

const Table = ({ children }) => <table className="w-full border-collapse">{children}</table>;
const TableHeader = ({ children }) => <thead className="bg-gray-100">{children}</thead>;
const TableBody = ({ children }) => <tbody>{children}</tbody>;
const TableRow = ({ children }) => <tr className="border-b last:border-none">{children}</tr>;
const TableHead = ({ children }) => <th className="p-2 text-left text-sm font-semibold">{children}</th>;
const TableCell = ({ children }) => <td className="p-2 text-sm">{children}</td>;

export default function Estrategicos() {
  const [filtro, setFiltro] = useState("mes");

  const alumnosPorCurso = [
    { curso: "Matemáticas", alumnos: 120 },
    { curso: "Física", alumnos: 95 },
    { curso: "Química", alumnos: 80 },
    { curso: "STEAM Verano", alumnos: 150 },
  ];

  const crecimientoInscripciones = [
    { periodo: "Ene", inscripciones: 200 },
    { periodo: "Feb", inscripciones: 240 },
    { periodo: "Mar", inscripciones: 280 },
    { periodo: "Abr", inscripciones: 350 },
    { periodo: "May", inscripciones: 400 },
  ];

  const participacion = [
    { area: "Cursos", valor: 45 },
    { area: "Asesorías", valor: 25 },
    { area: "Talleres", valor: 20 },
    { area: "Conferencias", valor: 10 },
  ];

  const desempeñoAsesores = [
    { criterio: "Calidad", A: 90 },
    { criterio: "Cumplimiento", A: 80 },
    { criterio: "Satisfacción", A: 85 },
    { criterio: "Innovación", A: 70 },
  ];

  const tablaCursos = [
    { curso: "Matemáticas", asesor: "Ana Pérez", alumnos: 40, fecha: "2025-01-10" },
    { curso: "Física", asesor: "Luis Gómez", alumnos: 35, fecha: "2025-01-15" },
    { curso: "Química", asesor: "María López", alumnos: 20, fecha: "2025-01-20" },
    { curso: "STEAM Verano", asesor: "Carlos Ruiz", alumnos: 50, fecha: "2025-01-25" },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Filtros */}
      <div className="flex items-center gap-4">
        <Select onValueChange={(val) => setFiltro(val)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semana">Semana</SelectItem>
            <SelectItem value="mes">Mes</SelectItem>
            <SelectItem value="año">Año</SelectItem>
          </SelectContent>
        </Select>
        <Button className="bg-indigo-600 text-white">Aplicar Filtro</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle>Alumnos por Curso</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart width={400} height={250} data={alumnosPorCurso}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="curso" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="alumnos" fill="#4f46e5" />
            </BarChart>
          </CardContent>
        </Card>

        <Card className="shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle>Crecimiento de Inscripciones</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart width={400} height={250} data={crecimientoInscripciones}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="periodo" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="inscripciones" stroke="#16a34a" strokeWidth={3} />
            </LineChart>
          </CardContent>
        </Card>

        <Card className="shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle>Distribución de Participación</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart width={400} height={250}>
              <Pie data={participacion} dataKey="valor" nameKey="area" cx="50%" cy="50%" outerRadius={100} fill="#6366f1" label />
              <Tooltip />
            </PieChart>
          </CardContent>
        </Card>

        <Card className="shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle>Desempeño de Asesores</CardTitle>
          </CardHeader>
          <CardContent>
            <RadarChart cx={200} cy={125} outerRadius={100} width={400} height={250} data={desempeñoAsesores}>
              <PolarGrid />
              <PolarAngleAxis dataKey="criterio" />
              <PolarRadiusAxis />
              <Radar name="Asesores" dataKey="A" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
              <Legend />
            </RadarChart>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle>Registro de Cursos y Asesores</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Curso</TableHead>
                <TableHead>Asesor</TableHead>
                <TableHead>Alumnos</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tablaCursos.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{row.curso}</TableCell>
                  <TableCell>{row.asesor}</TableCell>
                  <TableCell>{row.alumnos}</TableCell>
                  <TableCell>{row.fecha}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
