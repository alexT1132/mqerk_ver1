// ChartsResponsive.jsx
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LabelList,
  BarChart,
  Bar,
  LineChart,
  Line,
  ReferenceLine,
} from "recharts";

const cursosData = [
  { name: "ASEGRAL", value: 100 },
  { name: "EEAU", value: 90 },
  { name: "EEAP", value: 20 },
  { name: "ENGLISH", value: 30 },
  { name: "COMPUTACIÓN", value: 40 },
  { name: "ORIENTACIÓN", value: 20 },
  { name: "LECTURA", value: 10 },
];

const alumnosMesData = [
  { month: "ENERO", value: 20 },
  { month: "FEBRERO", value: 30 },
  { month: "MARZO", value: 40 },
  { month: "ABRIL", value: 50 },
  { month: "MAYO", value: 60 },
  { month: "JUNIO", value: 70 },
  { month: "JULIO", value: 80 },
  { month: "AGOSTO", value: 90 },
  { month: "SEPTIEMBRE", value: 100 },
  { month: "OCTUBRE", value: 110 },
  { month: "NOVIEMBRE", value: 120 },
];

const currency = (n) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);

// ===== Datos para punto de equilibrio (ejemplo real) =====
const precio = 1300;            // precio por curso
const costoVariable = 500;       // costo variable por curso
const costoFijo = 15000;         // costo fijo
const puntoEquilibrio = costoFijo / (precio - costoVariable); // 18.75

// genera puntos 0..60
const peData = Array.from({ length: 13 }, (_, i) => {
  const x = i * 5; // cursos vendidos
  return {
    x,
    ingresos: x * precio,
    costos: costoFijo + x * costoVariable,
  };
});

export default function ChartsResponsive() {
  return (
    <section className="w-full">
      {/* grid responsive: 1 -> 2 -> 3 columnas */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-2 xl:grid-cols-3">
        {/* 1) Barras horizontales */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-slate-600">CURSOS/ASESORÍAS</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cursosData} layout="vertical" margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis type="number" domain={[0, "dataMax + 10"]} />
                <YAxis type="category" dataKey="name" width={110} />
                <Tooltip />
                <Legend verticalAlign="top" height={28} />
                <Bar dataKey="value" name="Cursos/Asesorías" fill="#00C9D8" radius={[8, 8, 8, 8]}>
                  <LabelList dataKey="value" position="insideLeft" offset={8} fill="#0f172a" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2) Barras verticales */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-slate-600">Alumnos por mes</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={alumnosMesData} margin={{ top: 8, right: 16, bottom: 30, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                  height={50}
                  tick={{ fontSize: 11 }}
                />
                <YAxis />
                <Tooltip />
                <Legend verticalAlign="top" height={28} />
                <Bar dataKey="value" name="Alumnos por mes" fill="#00C9D8" radius={[8, 8, 0, 0]}>
                  <LabelList dataKey="value" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3) Línea: Punto de equilibrio */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-slate-600">
            Análisis de Punto de Equilibrio
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={peData} margin={{ top: 10, right: 16, bottom: 20, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" label={{ value: "Cursos Vendidos", position: "insideBottom", dy: 10 }} />
                <YAxis tickFormatter={currency} width={70} />
                <Tooltip formatter={(v, k) => [currency(v), k]} />
                <Legend />
                <Line type="monotone" dataKey="ingresos" name="Ingresos" stroke="#2F80ED" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="costos" name="Costos Totales" stroke="#F2994A" strokeWidth={3} dot={false} />
                <ReferenceLine
                  x={puntoEquilibrio}
                  stroke="#EB5757"
                  strokeDasharray="6 6"
                  label={{
                    value: `PE: ${puntoEquilibrio.toFixed(2)} cursos`,
                    position: "top",
                    fill: "#EB5757",
                    fontSize: 12,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
