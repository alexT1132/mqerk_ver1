import { useEffect, useMemo, useState } from "react";
import { getMisPagos } from "../../api/asesores.js";
import { Loader2, Calendar, DollarSign, Clock, CheckCircle2, XCircle, AlertCircle, CreditCard, ChevronDown, Check } from "lucide-react";

/* ---------- Constantes ---------- */
const YEARS = Array.from({ length: 6 }, (_, i) => 2024 + i);
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const TODOS_VALUE = "TODOS";

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
        "relative px-5 py-3 2xl:px-6 2xl:py-4 2xl:text-base rounded-xl text-sm font-bold transition-all duration-200 transform",
        active
          ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg scale-105 ring-2 ring-violet-200"
          : "bg-white text-slate-700 border-2 border-slate-200 hover:border-violet-300 hover:shadow-md hover:scale-[1.02]",
      ].join(" ")}
    >
      <div className="flex flex-col items-center gap-1">
        <span>Semana {w}</span>
        {count !== undefined && count > 0 && (
          <span className={[
            "text-xs px-2.5 py-1 rounded-full font-semibold",
            active ? "bg-white/20 text-white" : "bg-violet-100 text-violet-700 border border-violet-200"
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


/* ---------- Componente Select Personalizado (Limitado a 5 items) ---------- */
function CustomSelect({ value, options, onChange, icon: Icon }) {
  const [isOpen, setIsOpen] = useState(false);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && !e.target.closest('.custom-select-container')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const selectedOption = options.find(o => o.value === value) || options[0];

  return (
    <div className="relative custom-select-container w-full">
      {/* Botón activador */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-white border-2 rounded-xl px-4 py-3 text-left transition-all ${isOpen ? 'border-violet-500 ring-2 ring-violet-200' : 'border-slate-200 hover:border-violet-300'
          }`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {Icon && <Icon className="size-5 text-violet-500 shrink-0" />}
          <span className="font-bold text-slate-700 truncate block">
            {selectedOption?.label || value}
          </span>
        </div>
        <ChevronDown className={`size-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Lista de opciones */}
      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* MAX-HEIGHT ajustado para mostrar aprox 5 elementos (5 * 44px = ~220px) */}
          <div className="max-h-[220px] overflow-y-auto custom-scrollbar">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-sm font-semibold hover:bg-violet-50 transition-colors flex items-center justify-between ${value === opt.value ? 'bg-violet-50 text-violet-700' : 'text-slate-600'
                  }`}
              >
                {opt.label}
                {value === opt.value && <Check className="size-4 text-violet-600" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
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
  const weeksInMonth = useMemo(() => {
    if (year === TODOS_VALUE || month === TODOS_VALUE) return 0;
    return getWeeksInMonth(year, monthIndex);
  }, [year, monthIndex]);

  // Cargar pagos
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {};
        if (year !== TODOS_VALUE) params.year = year;
        if (month !== TODOS_VALUE) params.month = month;

        const { data } = await getMisPagos(params);
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
    // Si estamos viendo todo, no agrupamos por semana
    if (year === TODOS_VALUE || month === TODOS_VALUE) {
      return {};
    }

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
        // Parsear fecha correctamente (puede venir como 'YYYY-MM-DD' o 'YYYY-MM-DDTHH:mm:ss')
        let fechaStr = String(pago.fecha_pago).trim();
        if (fechaStr.includes('T')) {
          fechaStr = fechaStr.split('T')[0];
        }
        if (fechaStr.includes(' ')) {
          fechaStr = fechaStr.split(' ')[0];
        }

        const [yearStr, monthStr, dayStr] = fechaStr.split('-');
        if (!yearStr || !monthStr || !dayStr) {
          console.warn('Formato de fecha inválido:', pago.fecha_pago);
          return;
        }

        const fecha = new Date(parseInt(yearStr), parseInt(monthStr) - 1, parseInt(dayStr));

        // Verificar que la fecha es válida
        if (isNaN(fecha.getTime())) {
          console.warn('Fecha inválida después de parsear:', pago.fecha_pago);
          return;
        }

        // Verificar que la fecha pertenece al mes actual
        if (fecha.getFullYear() !== year || fecha.getMonth() !== monthIndex) {
          return;
        }

        const dia = fecha.getDate();

        // Determinar en qué semana cae el día
        // Calcular el día del año relativo al mes (día 1 = primer día del mes)
        // Luego calcular qué semana es basándose en que cada semana tiene 7 días
        const diaRelativo = dia - 1; // Día 1 = 0, Día 2 = 1, etc.
        const diaConOffset = diaRelativo + offset; // Ajustar por el día de la semana del primer día
        const semanaCalculada = Math.floor(diaConOffset / 7) + 1;

        // Asegurar que la semana esté en el rango válido
        const semanaFinal = Math.max(1, Math.min(semanaCalculada, weeksInMonth));

        if (!result[semanaFinal]) {
          result[semanaFinal] = [];
        }
        result[semanaFinal].push(pago);

        // Log para depuración (solo en desarrollo)
        if (process.env.NODE_ENV === 'development') {
          console.log(`Pago ${pago.id_pago} (${dia}/${monthIndex + 1}/${year}) asignado a semana ${semanaFinal}`, {
            dia,
            offset,
            diaRelativo,
            diaConOffset,
            semanaCalculada,
            semanaFinal
          });
        }
      } catch (e) {
        console.error('Error procesando fecha de pago:', pago.fecha_pago, e);
        // Error procesando fecha de pago - se omite este pago del agrupamiento
      }
    });

    return result;
  }, [pagos, year, monthIndex, weeksInMonth]);

  // Filtrar pagos por semana seleccionada (o devolver todos si es modo TODOS)
  const rows = useMemo(() => {
    if (year === TODOS_VALUE || month === TODOS_VALUE) return pagos;
    if (!week || week < 1 || week > weeksInMonth) return [];
    return pagosPorSemana[week] || [];
  }, [pagos, pagosPorSemana, week, weeksInMonth, year, month]);

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
    <div className="w-full min-h-screen relative">
      <div className="fixed inset-0 bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 -z-50"></div>
      <div className="max-w-[1920px] w-full 2xl:max-w-none mx-auto px-4 sm:px-6 lg:px-8 2xl:px-4 py-6 lg:py-8 2xl:py-10">
        {/* Header */}
        <div className="mb-8 2xl:mb-10">
          <div className="flex items-center gap-4 mb-4 2xl:gap-6 2xl:mb-6">
            <div className="p-4 2xl:p-5 rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-xl ring-2 ring-violet-200">
              <CreditCard className="size-8 sm:size-10 2xl:size-12 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl 2xl:text-6xl font-extrabold mb-2 tracking-tight leading-tight">
                <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent inline-block" style={{ lineHeight: '1.2', paddingBottom: '0.2em' }}>
                  Mis Pagos
                </span>
              </h1>
              <p className="text-slate-600 text-sm sm:text-base 2xl:text-lg font-medium">Consulta tus pagos y honorarios por período</p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg ring-2 ring-slate-100/50 p-5 sm:p-6 2xl:p-7 mb-6 2xl:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <CustomSelect
                value={year}
                options={[
                  { value: TODOS_VALUE, label: 'Todos los años' },
                  ...YEARS.map(y => ({ value: y, label: String(y) }))
                ]}
                onChange={setYear}
                icon={Calendar}
              />

              <CustomSelect
                value={month}
                options={[
                  { value: TODOS_VALUE, label: 'Todos los meses' },
                  ...MONTHS.map(m => ({ value: m, label: m }))
                ]}
                onChange={setMonth}
                icon={Calendar}
              />
            </div>

            <div className="px-5 py-3 2xl:py-4 2xl:text-base bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl font-bold text-sm shadow-md ring-2 ring-violet-200">
              {pagos.length} {pagos.length === 1 ? 'pago encontrado' : 'pagos encontrados'}
              {year !== TODOS_VALUE && month !== TODOS_VALUE && ` en ${month} ${year}`}
            </div>
          </div>
        </div>

        {/* Botones de semanas - Solo mostrar si NO estamos en modo TODOS */}
        {year !== TODOS_VALUE && month !== TODOS_VALUE && (
          <div className="mb-6 2xl:mb-8">
            <div className="flex items-center gap-3 mb-4 2xl:gap-4 2xl:mb-5">
              <div className="p-2 2xl:p-2.5 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md ring-2 ring-violet-200">
                <Calendar className="size-5 2xl:size-6" />
              </div>
              <h3 className="text-lg 2xl:text-xl font-extrabold text-slate-800">Selecciona la semana:</h3>
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
        )}

        {/* Estadísticas */}
        {!loading && rows.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 2xl:gap-6 mb-6 2xl:mb-8">
            <div className="bg-white rounded-2xl p-5 sm:p-6 2xl:p-7 border-2 border-emerald-200 shadow-lg ring-2 ring-slate-100/50 hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3 2xl:mb-4">
                <div className="p-2 2xl:p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-md ring-2 ring-emerald-200">
                  <DollarSign className="size-5 2xl:size-6" />
                </div>
                <CheckCircle2 className="size-5 2xl:size-6 text-emerald-600" />
              </div>
              <div className="text-3xl 2xl:text-4xl font-extrabold text-emerald-700 mb-1">{fmtMoney(stats.totalIngresos)}</div>
              <div className="text-xs 2xl:text-sm text-emerald-600 font-semibold">Ingresos pagados</div>
            </div>

            <div className="bg-white rounded-2xl p-5 sm:p-6 2xl:p-7 border-2 border-amber-200 shadow-lg ring-2 ring-slate-100/50 hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3 2xl:mb-4">
                <div className="p-2 2xl:p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 text-white shadow-md ring-2 ring-amber-200">
                  <Clock className="size-5 2xl:size-6" />
                </div>
                <AlertCircle className="size-5 2xl:size-6 text-amber-600" />
              </div>
              <div className="text-3xl 2xl:text-4xl font-extrabold text-amber-700 mb-1">{fmtMoney(stats.totalPendientes)}</div>
              <div className="text-xs 2xl:text-sm text-amber-600 font-semibold">Pendientes por cobrar</div>
            </div>

            <div className="bg-white rounded-2xl p-5 sm:p-6 2xl:p-7 border-2 border-violet-200 shadow-lg ring-2 ring-slate-100/50 hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3 2xl:mb-4">
                <div className="p-2 2xl:p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md ring-2 ring-violet-200">
                  <Clock className="size-5 2xl:size-6" />
                </div>
                <span className="text-2xl 2xl:text-3xl">⏱</span>
              </div>
              <div className="text-3xl 2xl:text-4xl font-extrabold text-violet-700 mb-1">{stats.totalHoras.toFixed(1)}</div>
              <div className="text-xs 2xl:text-sm text-violet-600 font-semibold">Horas trabajadas</div>
            </div>

            <div className="bg-white rounded-2xl p-5 sm:p-6 2xl:p-7 border-2 border-slate-200 shadow-lg ring-2 ring-slate-100/50 hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3 2xl:mb-4">
                <div className="p-2 2xl:p-2.5 rounded-xl bg-gradient-to-br from-slate-500 to-gray-600 text-white shadow-md ring-2 ring-slate-200">
                  <DollarSign className="size-5 2xl:size-6" />
                </div>
                <span className="text-2xl 2xl:text-3xl">📊</span>
              </div>
              <div className="text-3xl 2xl:text-4xl font-extrabold text-slate-700 mb-1">{stats.total}</div>
              <div className="text-xs 2xl:text-sm text-slate-600 font-semibold">Total de pagos</div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl text-red-700 flex items-center gap-3 shadow-md ring-2 ring-red-100">
            <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-md">
              <AlertCircle className="size-4" />
            </div>
            <span className="font-bold flex-1">{error}</span>
          </div>
        )}

        {/* Tabla */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="size-10 animate-spin text-violet-600" />
              </div>
            ) : rows.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex p-4 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-xl ring-4 ring-violet-200 mb-4">
                  <DollarSign className="size-16" />
                </div>
                <p className="text-slate-600 font-bold text-lg mb-2">
                  {(year === TODOS_VALUE || month === TODOS_VALUE)
                    ? 'No hay pagos registrados'
                    : `No hay pagos para ${week ? `la semana ${week} de` : ''} ${month} ${year}`
                  }
                </p>
                <p className="text-sm text-slate-500 font-medium mb-4">
                  Los pagos aparecerán aquí cuando estén registrados
                </p>
                <p className="text-xs text-slate-400 italic">
                  💡 Intenta cambiar el mes o el año en los filtros superiores para buscar en otros períodos
                </p>
              </div>
            ) : (
              <table className="min-w-[1000px] w-full text-left">
                <thead className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white shadow-md">
                  <tr>
                    <th className="px-4 py-3 2xl:py-4 font-bold text-[11px] 2xl:text-xs uppercase tracking-wider border-r border-white/30 min-w-[100px]">ID_Pago</th>
                    <th className="px-4 py-3 2xl:py-4 font-bold text-[11px] 2xl:text-xs uppercase tracking-wider border-r border-white/30 min-w-[150px]">Tipo de servicio</th>
                    <th className="px-4 py-3 2xl:py-4 font-bold text-[11px] 2xl:text-xs uppercase tracking-wider border-r border-white/30 min-w-[110px]">Monto base</th>
                    <th className="px-4 py-3 2xl:py-4 font-bold text-[11px] 2xl:text-xs uppercase tracking-wider border-r border-white/30 min-w-[100px]">Horas</th>
                    <th className="px-4 py-3 2xl:py-4 font-bold text-[11px] 2xl:text-xs uppercase tracking-wider border-r border-white/30 min-w-[140px]">Hon. / Comis.</th>
                    <th className="px-4 py-3 2xl:py-4 font-bold text-[11px] 2xl:text-xs uppercase tracking-wider border-r border-white/30 min-w-[120px]">Ingreso final</th>
                    <th className="px-4 py-3 2xl:py-4 font-bold text-[11px] 2xl:text-xs uppercase tracking-wider border-r border-white/30 min-w-[120px]">Fecha de pago</th>
                    <th className="px-4 py-3 2xl:py-4 font-bold text-[11px] 2xl:text-xs uppercase tracking-wider border-r border-white/30 min-w-[120px]">Método</th>
                    <th className="px-4 py-3 2xl:py-4 font-bold text-[11px] 2xl:text-xs uppercase tracking-wider border-r border-white/30 min-w-[100px]">Nota</th>
                    <th className="px-4 py-3 2xl:py-4 font-bold text-[11px] 2xl:text-xs uppercase tracking-wider min-w-[100px]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {rows.map((r, i) => (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-50/50 transition-colors duration-150 2xl:[&_td]:py-4"
                    >
                      <td className="px-4 py-3 2xl:py-4 whitespace-nowrap border-r border-slate-100">
                        <span className="font-bold text-slate-900">{r.id_pago}</span>
                      </td>
                      <td className="px-4 py-3 border-r border-slate-100">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-50 text-indigo-600 text-xs font-bold border border-indigo-100 uppercase">
                          {getTipoNombre(r.tipo_servicio)}
                        </span>
                        {r.servicio_detalle && (
                          <div className="text-[10px] text-slate-500 mt-1 font-medium">{r.servicio_detalle}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap border-r border-slate-100">
                        <span className="text-slate-700 font-semibold">{r.monto_base ? fmtMoney(r.monto_base) : "-"}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap border-r border-slate-100">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 uppercase">
                          <Clock className="size-3" />
                          {r.horas_trabajadas ? `${r.horas_trabajadas}h` : "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap border-r border-slate-100">
                        <span className="text-slate-700 font-bold">
                          {r.honorarios_comision ? fmtMoney(r.honorarios_comision) : "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap border-r border-slate-100">
                        <span className="text-base font-bold text-emerald-600">
                          {fmtMoney(r.ingreso_final)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap border-r border-slate-100">
                        <span className="text-slate-700 font-medium">
                          {r.fecha_pago ? new Date(r.fecha_pago).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          }) : "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap border-r border-slate-100">
                        <span className="text-slate-700 font-medium">{r.metodo_pago || "-"}</span>
                      </td>
                      <td className="px-4 py-3 max-w-xs border-r border-slate-100">
                        <span className="text-slate-600 text-[11px] truncate block font-medium" title={r.nota || ""}>
                          {r.nota || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={[
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold border capitalize",
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
