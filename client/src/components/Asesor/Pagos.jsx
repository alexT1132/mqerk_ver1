import { useEffect, useMemo, useState } from "react";
import { getMisPagos } from "../../api/asesores.js";
import { Loader2, Calendar, DollarSign, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

/* ---------- Constantes ---------- */
const YEARS = Array.from({ length: 6 }, (_, i) => 2024 + i);
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

// Formatear dinero
const fmtMoney = (n) =>
  typeof n === "number"
    ? n.toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN",
        maximumFractionDigits: 0,
      })
    : n ?? "-";

// Obtener nombre del tipo de servicio
const getTipoNombre = (tipo) => {
  const tipos = {
    curso: "Curso",
    asesoria: "Asesoría",
    otro: "Otro"
  };
  return tipos[tipo] || tipo;
};

// Obtener color del status
const getStatusColor = (status) => {
  if (status === "Pagado") return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 border-emerald-300";
  if (status === "Pendiente") return "bg-amber-50 text-amber-700 ring-1 ring-amber-200 border-amber-300";
  if (status === "Cancelado") return "bg-red-50 text-red-700 ring-1 ring-red-200 border-red-300";
  return "bg-slate-50 text-slate-700 ring-1 ring-slate-200 border-slate-300";
};

// Obtener icono del status
const getStatusIcon = (status) => {
  if (status === "Pagado") return <CheckCircle2 className="size-3.5" />;
  if (status === "Pendiente") return <Clock className="size-3.5" />;
  if (status === "Cancelado") return <XCircle className="size-3.5" />;
  return <AlertCircle className="size-3.5" />;
};

// Calcular semanas del mes
const getWeeksInMonth = (year, monthIndex) => {
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDay = firstDay.getDay(); // 0 = domingo, 1 = lunes, etc.
  
  // Ajustar para que la semana empiece en lunes
  const offset = startDay === 0 ? 6 : startDay - 1;
  const totalDays = daysInMonth + offset;
  const weeks = Math.ceil(totalDays / 7);
  
  return Math.min(weeks, 5); // Máximo 5 semanas
};

/* ---------- Componente de botón de semana ---------- */
function WeekChip({ w, active, onClick, count }) {
  return (
    <button
      onClick={onClick}
      className={[
        "relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 transform",
        active
          ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg scale-105 ring-4 ring-violet-200"
          : "bg-white text-slate-700 border-2 border-slate-200 hover:border-violet-300 hover:shadow-md hover:scale-[1.02]",
      ].join(" ")}
    >
      <div className="flex flex-col items-center gap-1">
        <span>Semana {w}</span>
        {count !== undefined && count > 0 && (
          <span className={[
            "text-xs px-2 py-0.5 rounded-full",
            active ? "bg-white/20 text-white" : "bg-violet-50 text-violet-700"
          ].join(" ")}>
            {count} pago{count !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      {active && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-white rounded-full"></div>
      )}
    </button>
  );
}

export default function Pagos() {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const currentDate = new Date();
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(MONTHS[currentDate.getMonth()]);
  const [week, setWeek] = useState(1);

  const monthIndex = MONTHS.indexOf(month);
  const weeksInMonth = useMemo(() => getWeeksInMonth(year, monthIndex), [year, monthIndex]);

  // Cargar pagos del mes completo (sin filtrar por semana)
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // Cargar todos los pagos del mes (sin especificar semana)
        const { data } = await getMisPagos({ year, month });
        if (!alive) return;
        setPagos(data?.data || []);
      } catch (e) {
        if (alive) setError(e?.response?.data?.message || 'Error cargando pagos');
        setPagos([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [year, month]);

  // Agrupar pagos por semana para mostrar el contador
  const pagosPorSemana = useMemo(() => {
    if (!year || monthIndex === -1 || !pagos.length) {
      const result = {};
      for (let w = 1; w <= weeksInMonth; w++) {
        result[w] = [];
      }
      return result;
    }
    
    const result = {};
    for (let w = 1; w <= weeksInMonth; w++) {
      result[w] = [];
    }
    
    // Calcular día de inicio del mes
    const firstDayOfMonth = new Date(year, monthIndex, 1);
    const dayOfWeek = firstDayOfMonth.getDay(); // 0 = domingo, 1 = lunes, etc.
    // Ajustar para que la semana empiece en lunes (0 = lunes, 6 = domingo)
    const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    
    // Agrupar pagos por semana
    pagos.forEach(pago => {
      if (!pago.fecha_pago) return;
      
      try {
        const fecha = new Date(pago.fecha_pago + 'T00:00:00');
        // Verificar que la fecha pertenece al mes actual
        if (fecha.getFullYear() !== year || fecha.getMonth() !== monthIndex) {
          return;
        }
        
        const dia = fecha.getDate();
        
        // Determinar en qué semana cae el día
        for (let w = 1; w <= weeksInMonth; w++) {
          let weekStart = 1 + (w - 1) * 7 - offset;
          if (weekStart < 1) weekStart = 1;
          
          let weekEnd = weekStart + 6;
          if (weekEnd > daysInMonth) weekEnd = daysInMonth;
          
          // Asegurar que weekStart no sea mayor que weekEnd
          if (weekStart > daysInMonth) {
            weekStart = daysInMonth;
            weekEnd = daysInMonth;
          }
          
          if (dia >= weekStart && dia <= weekEnd) {
            result[w].push(pago);
            break;
          }
        }
      } catch (e) {
        console.error('Error procesando fecha de pago:', pago.fecha_pago, e);
      }
    });
    
    return result;
  }, [pagos, year, monthIndex, weeksInMonth]);

  // Filtrar pagos por semana seleccionada
  const rows = useMemo(() => {
    if (!week || week < 1 || week > weeksInMonth) return [];
    return pagosPorSemana[week] || [];
  }, [pagosPorSemana, week, weeksInMonth]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    const total = rows.length;
    const pagados = rows.filter(p => p.status === 'Pagado').length;
    const pendientes = rows.filter(p => p.status === 'Pendiente').length;
    const totalIngresos = rows
      .filter(p => p.status === 'Pagado')
      .reduce((sum, p) => sum + (p.ingreso_final || 0), 0);
    const totalPendientes = rows
      .filter(p => p.status === 'Pendiente')
      .reduce((sum, p) => sum + (p.ingreso_final || 0), 0);
    const totalHoras = rows
      .reduce((sum, p) => sum + (p.horas_trabajadas || 0), 0);
    
    return {
      total,
      pagados,
      pendientes,
      totalIngresos,
      totalPendientes,
      totalHoras
    };
  }, [rows]);

  // Resetear semana cuando cambia el mes
  useEffect(() => {
    if (week > weeksInMonth) {
      setWeek(1);
    }
  }, [month, weeksInMonth, week]);

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Dashboard de Pagos</h1>
          <p className="text-slate-600">Consulta tus pagos y honorarios por período</p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-md border-2 border-slate-200 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Calendar className="size-5 text-violet-600" />
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="px-4 py-2.5 rounded-lg border-2 border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="px-4 py-2.5 rounded-lg border-2 border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
              >
                {MONTHS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="px-4 py-2 bg-violet-50 text-violet-700 rounded-lg font-semibold text-sm">
              {pagos.length} {pagos.length === 1 ? 'pago encontrado' : 'pagos encontrados'} en {month} {year}
            </div>
          </div>
        </div>

        {/* Botones de semanas */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="size-5 text-violet-600" />
            <h3 className="text-base font-bold text-slate-800">Selecciona la semana:</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: weeksInMonth }, (_, i) => i + 1).map((w) => (
              <WeekChip
                key={w}
                w={w}
                active={w === week}
                onClick={() => setWeek(w)}
                count={pagosPorSemana[w]?.length || 0}
              />
            ))}
          </div>
        </div>

        {/* Estadísticas */}
        {!loading && rows.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-5 border-2 border-emerald-200 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="size-6 text-emerald-600" />
                <CheckCircle2 className="size-5 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-emerald-700 mb-1">{fmtMoney(stats.totalIngresos)}</div>
              <div className="text-xs text-emerald-600 font-medium">Ingresos pagados</div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-5 border-2 border-amber-200 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <Clock className="size-6 text-amber-600" />
                <AlertCircle className="size-5 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-amber-700 mb-1">{fmtMoney(stats.totalPendientes)}</div>
              <div className="text-xs text-amber-600 font-medium">Pendientes por cobrar</div>
            </div>

            <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl p-5 border-2 border-violet-200 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <Clock className="size-6 text-violet-600" />
                <span className="text-2xl">⏱</span>
              </div>
              <div className="text-2xl font-bold text-violet-700 mb-1">{stats.totalHoras.toFixed(1)}</div>
              <div className="text-xs text-violet-600 font-medium">Horas trabajadas</div>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-5 border-2 border-slate-200 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="size-6 text-slate-600" />
                <span className="text-2xl">📊</span>
              </div>
              <div className="text-2xl font-bold text-slate-700 mb-1">{stats.total}</div>
              <div className="text-xs text-slate-600 font-medium">Total de pagos</div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Tabla */}
        <div className="bg-white rounded-2xl shadow-md border-2 border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="size-8 animate-spin text-violet-600" />
              </div>
            ) : rows.length === 0 ? (
              <div className="text-center py-16">
                <DollarSign className="size-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 font-medium text-lg mb-2">
                  No hay pagos para esta semana
                </p>
                <p className="text-sm text-slate-500">
                  Los pagos aparecerán aquí cuando estén registrados
                </p>
              </div>
            ) : (
              <table className="min-w-[1000px] w-full text-left">
                <thead className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                  <tr>
                    <th className="px-5 py-4 font-semibold text-sm uppercase tracking-wide">ID_Pago</th>
                    <th className="px-5 py-4 font-semibold text-sm uppercase tracking-wide">Tipo de servicio</th>
                    <th className="px-5 py-4 font-semibold text-sm uppercase tracking-wide">Monto base</th>
                    <th className="px-5 py-4 font-semibold text-sm uppercase tracking-wide">Horas trabajadas</th>
                    <th className="px-5 py-4 font-semibold text-sm uppercase tracking-wide">Honorarios / Comisión</th>
                    <th className="px-5 py-4 font-semibold text-sm uppercase tracking-wide">Ingreso final</th>
                    <th className="px-5 py-4 font-semibold text-sm uppercase tracking-wide">Fecha de pago</th>
                    <th className="px-5 py-4 font-semibold text-sm uppercase tracking-wide">Método de pago</th>
                    <th className="px-5 py-4 font-semibold text-sm uppercase tracking-wide">Nota</th>
                    <th className="px-5 py-4 font-semibold text-sm uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {rows.map((r, i) => (
                    <tr
                      key={r.id}
                      className="hover:bg-gradient-to-r hover:from-violet-50 hover:to-indigo-50 transition-colors duration-200"
                    >
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-900">{r.id_pago}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg bg-violet-100 text-violet-700 text-sm font-medium border border-violet-200">
                          {getTipoNombre(r.tipo_servicio)}
                        </span>
                        {r.servicio_detalle && (
                          <div className="text-xs text-slate-500 mt-1">{r.servicio_detalle}</div>
                        )}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-slate-700">{r.monto_base ? fmtMoney(r.monto_base) : "-"}</span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium">
                          <Clock className="size-3.5" />
                          {r.horas_trabajadas ? `${r.horas_trabajadas}h` : "-"}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-slate-700 font-medium">
                          {r.honorarios_comision ? fmtMoney(r.honorarios_comision) : "-"}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-lg font-bold text-emerald-700">
                          {fmtMoney(r.ingreso_final)}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-slate-700">
                          {r.fecha_pago ? new Date(r.fecha_pago).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          }) : "-"}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-slate-700">{r.metodo_pago || "-"}</span>
                      </td>
                      <td className="px-5 py-4 max-w-xs">
                        <span className="text-slate-600 text-sm truncate block" title={r.nota || ""}>
                          {r.nota || "-"}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={[
                            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border-2",
                            getStatusColor(r.status)
                          ].join(" ")}
                        >
                          {getStatusIcon(r.status)}
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
