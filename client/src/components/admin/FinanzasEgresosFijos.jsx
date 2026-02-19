import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { FaRegEye } from "react-icons/fa";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import api from "../../api/axios.js";
import {
  loadExpenses,
  saveExpenses,
  getBudgetSnapshot,
} from "../../utils/budgetStore.js";
import { getResumenMensual } from "../../service/finanzasPresupuesto.js";
import {
  listGastosFijos,
  createGastoFijo,
  updateGastoFijo,
  deleteGastoFijo
} from "../../service/finanzasGastosFijos.js";
import {
  listPlantillas,
  createPlantilla,
  updatePlantilla,
  deletePlantilla,
  instanciarDesdePlantilla,
} from "../../service/finanzasGastosFijosPlantillas.js";

const FRECUENCIAS = [
  "Diario",
  "Semanal",
  "Quincenal",
  "Mensual",
  "Bimestral",
  "Semestral",
  "Anual",
];

export default function FinanzasEgresosFijos() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportExcelLoading, setExportExcelLoading] = useState(false);
  const [exportExcelError, setExportExcelError] = useState('');
  const [plantillas, setPlantillas] = useState([]);
  const [plantillaModalOpen, setPlantillaModalOpen] = useState(false);
  const [plantillaForm, setPlantillaForm] = useState({ categoria: '', descripcion: '', proveedor: '', frecuencia: 'Mensual', metodo: 'Efectivo', monto_sugerido: '', dia_pago: '', hora_preferida: '', recordar_minutos: 30, auto_evento: true, auto_instanciar: true, fecha_inicio: '', cadencia_anchor: '' });
  const [plantillaEditOpen, setPlantillaEditOpen] = useState(false);
  const [plantillaEdit, setPlantillaEdit] = useState(null);
  const [budgetSummary, setBudgetSummary] = useState({ budget: 0, spent: 0, leftover: 0 });
  const [showModal, setShowModal] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState("");
  const [descOpen, setDescOpen] = useState(false);
  const [descText, setDescText] = useState("");
  // Control de presupuesto insuficiente
  const [budgetWarn, setBudgetWarn] = useState({
    open: false,
    context: null,
    info: null,
  });
  // Deshacer borrado (7s)
  const [undo, setUndo] = useState({
    show: false,
    item: null,
    index: null,
    timer: null,
  });
  const getDefaultForm = () => ({
    fecha: dayjs().format("YYYY-MM-DD"),
    hora: "",
    categoria: "",
    descripcion: "",
    proveedor: "",
    frecuencia: "Mensual",
    metodo: "Efectivo",
    importe: "",
    estatus: "Pendiente",
  });
  const [form, setForm] = useState(getDefaultForm());
  // Filtros (historial)
  const [showFilters, setShowFilters] = useState(false);
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [filterMetodo, setFilterMetodo] = useState('');
  const [filterEstatus, setFilterEstatus] = useState('');
  const [filterFrecuencia, setFilterFrecuencia] = useState('');
  useEffect(() => {
    const fetchGastosFijos = async () => {
      try {
        setLoading(true);
        const data = await listGastosFijos();
        setRows(Array.isArray(data) ? data.map(r => ({ ...r, calendarEventId: r.calendar_event_id ?? r.calendarEventId })) : []);
        // También mantener en storage como backup
        saveExpenses("fijos", data);
        // Cargar resumen de presupuesto
        await refreshBudgetSummary();
        // Cargar plantillas activas
        try {
          const pls = await listPlantillas({ activo: 1 });
          setPlantillas(Array.isArray(pls) ? pls : []);
        } catch (e) { console.warn('No se pudieron cargar plantillas', e?.message || e); }
      } catch (error) {
        console.error('Error al cargar gastos fijos:', error);
        // Fallback al storage local si falla la API
        setRows(loadExpenses("fijos"));
        await refreshBudgetSummary();
      } finally {
        setLoading(false);
      }
    };

    fetchGastosFijos();
  }, []);

  const applyFilters = async () => {
    try {
      setLoading(true);
      const data = await listGastosFijos({ from: filterFrom || undefined, to: filterTo || undefined, metodo: filterMetodo || undefined, estatus: filterEstatus || undefined, frecuencia: filterFrecuencia || undefined });
      setRows(Array.isArray(data) ? data.map(r => ({ ...r, calendarEventId: r.calendar_event_id ?? r.calendarEventId })) : []);
      saveExpenses('fijos', data);
      await refreshBudgetSummary();
    } catch (e) {
      console.error('Error filtrando gastos fijos', e);
    } finally { setLoading(false); }
  };
  const clearFilters = async () => {
    setFilterFrom(''); setFilterTo(''); setFilterMetodo(''); setFilterEstatus(''); setFilterFrecuencia('');
    await applyFilters();
  };

  // Limpia timeout si cambia o desmonta
  useEffect(() => {
    return () => {
      if (undo.timer) clearTimeout(undo.timer);
    };
  }, [undo.timer]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onChangeImporte = (e) => {
    const raw = e.target.value;
    // permitir números, coma y punto; el parse real se hace en submit
    const cleaned = raw.replace(/[^0-9,\.]/g, "");
    setForm((prev) => ({ ...prev, importe: cleaned }));
  };

  const formatCurrency = (n) => {
    const num = Number(n || 0);
    try {
      return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        maximumFractionDigits: 2,
      }).format(num);
    } catch (_) {
      return `$${num.toFixed(2)}`;
    }
  };

  // Normaliza fechas a YYYY-MM-DD (evita mostrar timestamps/zonas)
  const formatDate = (d) => {
    const parsed = dayjs(d);
    if (!parsed.isValid()) return d ? String(d) : "-";
    return parsed.format("YYYY-MM-DD");
  };

  const getSmartEventTime = (dateStr) => {
    const d = dayjs(dateStr);
    if (d.isSame(dayjs(), "day")) return dayjs().add(1, "hour").format("HH:mm");
    return "09:00";
  };

  // Exportar todos los gastos fijos a Excel
  const handleExportExcel = async () => {
    try {
      setExportExcelLoading(true); setExportExcelError('');
      const [ExcelJS, data] = await Promise.all([
        import('exceljs'),
        listGastosFijos()
      ]);
      const workbook = new ExcelJS.Workbook();
      const ws = workbook.addWorksheet('Gastos fijos');
      const columns = [
        { header: 'ID', key: 'id' },
        { header: 'Fecha', key: 'fecha' },
        { header: 'Hora', key: 'hora' },
        { header: 'Categoría', key: 'categoria' },
        { header: 'Descripción', key: 'descripcion' },
        { header: 'Proveedor', key: 'proveedor' },
        { header: 'Frecuencia', key: 'frecuencia' },
        { header: 'Método', key: 'metodo' },
        { header: 'Importe', key: 'importe' },
        { header: 'Estatus', key: 'estatus' },
        { header: 'Calendar Event ID', key: 'calendar_event_id' },
      ];
      ws.columns = columns.map(c => ({ header: c.header, key: c.key, width: Math.max(12, c.header.length + 2) }));
      for (const r of (Array.isArray(data) ? data : [])) {
        ws.addRow({
          id: r.id,
          fecha: r.fecha || '',
          hora: r.hora || '',
          categoria: r.categoria || '',
          descripcion: r.descripcion || '',
          proveedor: r.proveedor || '',
          frecuencia: r.frecuencia || '',
          metodo: r.metodo || '',
          importe: Number(r.importe ?? 0),
          estatus: r.estatus || '',
          calendar_event_id: r.calendar_event_id ?? r.calendarEventId ?? ''
        });
      }
      // Encabezado estilizado
      const headerRow = ws.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.alignment = { vertical: 'middle' };
      headerRow.height = 20;
      headerRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
        cell.border = { top: { style: 'thin', color: { argb: 'FFDBEAFE' } }, left: { style: 'thin', color: { argb: 'FFDBEAFE' } }, bottom: { style: 'thin', color: { argb: 'FFDBEAFE' } }, right: { style: 'thin', color: { argb: 'FFDBEAFE' } } };
      });
      // Formato de moneda
      const importeCol = ws.getColumn('importe');
      importeCol.numFmt = '#,##0.00';
      importeCol.alignment = { horizontal: 'right' };
      // Filtros y congelar encabezado
      ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columns.length } };
      ws.views = [{ state: 'frozen', ySplit: 1 }];
      // Auto tamaño columnas
      ws.columns.forEach((col) => {
        let max = col.header ? String(col.header).length : 10;
        col.eachCell({ includeEmpty: false }, (cell) => {
          const v = cell.value == null ? '' : String(cell.value);
          max = Math.max(max, v.length);
        });
        col.width = Math.min(60, Math.max(12, Math.ceil(max * 1.1)));
      });
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
      a.href = url; a.download = `gastos-fijos-${ts}.xlsx`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setExportExcelError('No se pudo exportar Excel.');
    } finally { setExportExcelLoading(false); }
  };

  const refreshBudgetSummary = async (month) => {
    try {
      const targetMonth = month || dayjs().format("YYYY-MM");
      const summary = await getResumenMensual(targetMonth);
      setBudgetSummary({
        budget: Number(summary.budget || 0),
        spent: Number(summary.spent || 0),
        leftover: Number(summary.leftover || 0)
      });
    } catch (error) {
      console.error('Error al refrescar resumen de presupuesto:', error);
      // Fallback al cálculo local
      setBudgetSummary(getBudgetSnapshot(month || dayjs().format("YYYY-MM")));
    }
  };

  // Acciones para modal de presupuesto insuficiente en cambio de estatus
  const saveStatusAsPending = async () => {
    if (!budgetWarn.open || budgetWarn.context !== 'status') return;
    const { idx } = budgetWarn.info || {};
    if (idx === undefined || idx === null) { setBudgetWarn({ open: false, context: null, info: null }); return; }
    try {
      await patchGasto(idx, { estatus: 'Pendiente' });
    } catch (_) {
      // silencioso: patchGasto ya hizo rollback si falla
    }
    setBudgetWarn({ open: false, context: null, info: null });
  };

  const proceedStatusEvenIfExceed = async () => {
    if (!budgetWarn.open || budgetWarn.context !== 'status') return;
    const { idx } = budgetWarn.info || {};
    if (idx === undefined || idx === null) { setBudgetWarn({ open: false, context: null, info: null }); return; }
    try {
      await patchGasto(idx, { estatus: 'Pagado' });
      const month = dayjs(rows[idx]?.fecha).format('YYYY-MM');
      await refreshBudgetSummary(month);
    } catch (_) {
      // rollback ya aplicado en patchGasto si falla
    }
    setBudgetWarn({ open: false, context: null, info: null });
  };

  // Helper reutilizable para parches optimistas
  const patchGasto = async (idx, patch) => {
    const prev = rows;
    const optimistic = rows.map((x, i) => i === idx ? { ...x, ...patch } : x);
    setRows(optimistic);
    saveExpenses("fijos", optimistic);
    try {
      if (rows[idx]?.id) {
        const updated = await updateGastoFijo(rows[idx].id, patch);
        setRows(cur => {
          const synced = cur.map(x => x.id === updated.id ? { ...x, ...updated } : x);
          saveExpenses("fijos", synced);
          return synced;
        });
      }
    } catch (e) {
      setRows(prev);
      saveExpenses("fijos", prev);
      throw e;
    }
  };

  const totals = useMemo(() => {
    // Solo sumar Pagado
    const now = dayjs();
    const todayStart = now.startOf("day");
    const todayEnd = now.endOf("day");
    const weekStart = todayStart.subtract(6, "day");
    let all = 0,
      today = 0,
      week = 0,
      month = 0,
      year = 0;
    for (const r of rows) {
      if (String(r.estatus) !== "Pagado") continue;
      const amt = Number(r.importe) || 0;
      const d = dayjs(r.fecha);
      all += amt;
      if (d.isSame(now, "day")) today += amt;
      if (
        (d.isAfter(weekStart) || d.isSame(weekStart, "day")) &&
        (d.isBefore(todayEnd) || d.isSame(todayEnd, "day"))
      )
        week += amt;
      if (d.isSame(now, "month")) month += amt;
      if (d.isSame(now, "year")) year += amt;
    }
    return { all, today, week, month, year };
  }, [rows]);

  const submit = async (e) => {
    e.preventDefault();
    const amount = parseFloat(String(form.importe).replace(/,/g, ""));
    if (Number.isNaN(amount)) return;
    if (!form.fecha || !form.categoria) return;
    const nuevo = {
      fecha: form.fecha,
      hora: form.hora || "",
      categoria: form.categoria.trim(),
      descripcion: form.descripcion?.trim() || "",
      proveedor: form.proveedor?.trim() || "",
      frecuencia: form.frecuencia,
      metodo: form.metodo,
      importe: amount,
      estatus: form.estatus,
    };
    // Si se marca como Pagado, validar presupuesto del mes de la fecha
    if (nuevo.estatus === "Pagado") {
      const month = dayjs(nuevo.fecha).format("YYYY-MM");
      let snap = null;
      try {
        const r = await getResumenMensual(month);
        snap = {
          budget: Number(r.budget || 0),
          spent: Number(r.spent || 0),
          leftover: Number(r.leftover || 0),
        };
      } catch {
        snap = getBudgetSnapshot(month);
      }
      const exceed = Math.max(0, amount - snap.leftover);
      if (snap.budget > 0 && exceed > 0) {
        setBudgetWarn({
          open: true,
          context: "create",
          info: { month, snap, amount, exceed, entry: nuevo },
        });
        return; // esperar confirmación
      }
    }

    try {
      // Crear gasto fijo en la API
      const createdGasto = await createGastoFijo(nuevo);

      // Actualizar estado local
      setRows((prev) => {
        const next = [...prev, createdGasto];
        saveExpenses("fijos", next);
        return next;
      });

      // Refrescar presupuesto si el gasto está marcado como Pagado
      if (nuevo.estatus === "Pagado") {
        const month = dayjs(nuevo.fecha).format("YYYY-MM");
        await refreshBudgetSummary(month);
      }

      // Crear evento de calendario en background
      (async () => {
        try {
          const titulo = `Gasto fijo: ${nuevo.categoria}`;
          const partes = [
            `Proveedor: ${nuevo.proveedor || "-"}`,
            `Frecuencia: ${nuevo.frecuencia}`,
            `Método: ${nuevo.metodo}`,
            `Importe: ${formatCurrency(nuevo.importe)}`,
            `Estatus: ${nuevo.estatus}`,
          ];
          if (nuevo.descripcion) partes.push(`Nota: ${nuevo.descripcion}`);
          const descripcion = partes.join(" | ");
          const horaEvento = form.hora
            ? form.hora
            : getSmartEventTime(form.fecha);
          const recordarMinutos = dayjs(form.fecha).isSame(dayjs(), "day")
            ? 10
            : 30;
          const evRes = await api.post("/admin/calendar/events", {
            titulo,
            descripcion,
            fecha: form.fecha,
            hora: horaEvento,
            tipo: "finanzas",
            prioridad: "media",
            recordarMinutos,
            completado: false,
          });
          const ev = evRes?.data || {};
          const evId = ev.id || ev.eventId || ev.event?.id;
          if (evId && createdGasto?.id) {
            try {
              const updated = await updateGastoFijo(createdGasto.id, { calendar_event_id: evId });
              setRows(prev => prev.map(x => x.id === updated.id ? { ...updated, calendarEventId: updated.calendar_event_id ?? evId } : x));
              saveExpenses("fijos", rows);
            } catch (_) { }
          }
        } catch (err) {
          console.warn(
            "Error al crear evento de calendario:",
            err?.response?.status || err?.message || err
          );
        }
      })();
    } catch (error) {
      console.error('Error al crear gasto fijo:', error);
      // Fallback al almacenamiento local
      const _lid = Date.now() + Math.random();
      setRows((prev) => {
        const next = [...prev, { ...nuevo, _lid }];
        saveExpenses("fijos", next);
        return next;
      });
    }
    setShowModal(false);
    setForm(getDefaultForm());
  };

  // Confirmar guardado excediendo presupuesto
  const proceedCreateEvenIfExceed = () => {
    if (!budgetWarn.open || budgetWarn.context !== "create") return;
    const { entry } = budgetWarn.info || {};
    const _lid = Date.now() + Math.random();
    setRows((prev) => {
      const next = [...prev, { ...entry, _lid }];
      saveExpenses("fijos", next);
      return next;
    });
    // Crear evento de calendario en background y guardar id
    (async () => {
      try {
        const titulo = `Gasto fijo: ${entry.categoria}`;
        const partes = [
          `Proveedor: ${entry.proveedor || "-"}`,
          `Frecuencia: ${entry.frecuencia}`,
          `Método: ${entry.metodo}`,
          `Importe: ${formatCurrency(entry.importe)}`,
          `Estatus: ${entry.estatus}`,
        ];
        if (entry.descripcion) partes.push(`Nota: ${entry.descripcion}`);
        const descripcion = partes.join(" | ");
        const horaEvento = entry.hora
          ? entry.hora
          : getSmartEventTime(entry.fecha);
        const recordarMinutos = dayjs(entry.fecha).isSame(dayjs(), "day")
          ? 10
          : 30;
        const evRes = await api.post("/admin/calendar/events", {
          titulo,
          descripcion,
          fecha: entry.fecha,
          hora: horaEvento,
          tipo: "finanzas",
          prioridad: "media",
          recordarMinutos,
          completado: false,
        });
        const ev = evRes?.data || {};
        const evId = ev.id || ev.eventId || ev.event?.id;
        if (evId) {
          setRows((prev) => {
            const next = prev.map((r) =>
              r._lid === _lid ? { ...r, calendarEventId: evId } : r
            );
            saveExpenses("fijos", next);
            return next;
          });
        }
      } catch (err) {
        console.warn(
          "Calendario egreso fijo (exceed path):",
          err?.response?.status || err?.message || err
        );
      }
    })();
    setBudgetWarn({ open: false, context: null, info: null });
    setShowModal(false);
    setForm(getDefaultForm());
  };

  const saveAsPendingInstead = () => {
    if (!budgetWarn.open) return;
    const ctx = budgetWarn.context;
    if (ctx === "create") {
      const { entry } = budgetWarn.info || {};
      const pending = { ...entry, estatus: "Pendiente" };
      setRows((prev) => {
        const next = [...prev, pending];
        saveExpenses("fijos", next);
        return next;
      });
      setShowModal(false);
      setForm(getDefaultForm());
    } else if (ctx === "status") {
      // simplemente cerrar sin aplicar el cambio
    }
    setBudgetWarn({ open: false, context: null, info: null });
  };

  return (
    <section className="px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-8 pt-6 xs:pt-8 sm:pt-10 md:pt-12 lg:pt-12 xl:pt-14 2xl:pt-14 pb-6 max-w-screen-2xl 2xl:max-w-none mx-auto">
      <header className="flex items-center justify-between gap-4 mb-6 lg:mb-8 xl:mb-8 2xl:mb-8 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-4xl 2xl:text-5xl font-extrabold tracking-tight text-gray-900">
            Gastos fijos
          </h1>
          <p className="text-sm lg:text-base xl:text-base 2xl:text-lg text-gray-500">
            Rentas, salarios, servicios y otros costos recurrentes.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 ring-1 ring-gray-200 text-gray-700 text-sm">
              <span className="text-xs text-gray-500">Total</span>
              <strong className="font-semibold text-gray-900">
                {formatCurrency(totals.all)}
              </strong>
            </div>
            <Link
              to="/administrativo/finanzas/egresos/variables"
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Gastos variables
            </Link>
            <Link
              to="/administrativo/finanzas"
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Finanzas
            </Link>
          </div>
        </div>
      </header>

      {/* Tarjetas rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 xl:gap-6 2xl:gap-6 mb-6 lg:mb-8 xl:mb-8 2xl:mb-8">
        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-sm ring-1 ring-gray-100 p-4 sm:p-5 lg:p-6 xl:p-6 2xl:p-7">
          <p className="text-xs lg:text-sm xl:text-sm 2xl:text-base text-gray-500">Hoy</p>
          <p className="text-2xl lg:text-3xl xl:text-3xl 2xl:text-4xl font-semibold text-rose-600">
            {formatCurrency(totals.today)}
          </p>
        </div>
        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-sm ring-1 ring-gray-100 p-4 sm:p-5 lg:p-6 xl:p-6 2xl:p-7">
          <p className="text-xs lg:text-sm xl:text-sm 2xl:text-base text-gray-500">Últimos 7 días</p>
          <p className="text-2xl lg:text-3xl xl:text-3xl 2xl:text-4xl font-semibold text-rose-600">
            {formatCurrency(totals.week)}
          </p>
        </div>
        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-sm ring-1 ring-gray-100 p-4 sm:p-5 lg:p-6 xl:p-6 2xl:p-7">
          <p className="text-xs lg:text-sm xl:text-sm 2xl:text-base text-gray-500">Mes</p>
          <p className="text-2xl lg:text-3xl xl:text-3xl 2xl:text-4xl font-semibold text-rose-600">
            {formatCurrency(totals.month)}
          </p>
        </div>
        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-sm ring-1 ring-gray-100 p-4 sm:p-5 lg:p-6 xl:p-6 2xl:p-7">
          <p className="text-xs lg:text-sm xl:text-sm 2xl:text-base text-gray-500">Año</p>
          <p className="text-2xl lg:text-3xl xl:text-3xl 2xl:text-4xl font-semibold text-rose-600">
            {formatCurrency(totals.year)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl lg:rounded-2xl shadow-md border border-gray-200 overflow-hidden">
        <div className="p-6 lg:p-8 xl:p-8 2xl:p-10 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg lg:text-xl xl:text-xl 2xl:text-2xl font-semibold text-gray-900">
              Registro de gastos fijos
            </h2>
            <p className="text-xs lg:text-sm xl:text-sm 2xl:text-base text-gray-500 mt-0.5">
              Total pagado:{" "}
              <span className="font-semibold text-gray-900">
                {formatCurrency(totals.all)}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowFilters(s => !s)} className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
              {showFilters ? 'Ocultar filtros' : 'Filtros'}
            </button>
            <button
              onClick={handleExportExcel}
              disabled={exportExcelLoading}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              {exportExcelLoading ? 'Exportando…' : 'Exportar Excel'}
            </button>
            <button
              onClick={() => setPlantillaModalOpen(true)}
              className="px-3 py-1.5 text-sm rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              Plantillas
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="px-3 py-1.5 text-sm rounded-lg bg-rose-600 text-white hover:bg-rose-700"
            >
              Nuevo egreso fijo
            </button>
          </div>
        </div>
        {showFilters && (
          <div className="px-6 pb-4 pt-4 border-b border-gray-200 bg-gray-50/60 text-xs sm:text-[13px]">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase tracking-wide">Desde</label>
                <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} className="w-full rounded-lg border border-gray-200 px-2 py-1.5 focus:ring-2 focus:ring-rose-500 focus:border-rose-500" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase tracking-wide">Hasta</label>
                <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)} className="w-full rounded-lg border border-gray-200 px-2 py-1.5 focus:ring-2 focus:ring-rose-500 focus:border-rose-500" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase tracking-wide">Método</label>
                <select value={filterMetodo} onChange={e => setFilterMetodo(e.target.value)} className="w-full rounded-lg border border-gray-200 px-2 py-1.5 focus:ring-2 focus:ring-rose-500 focus:border-rose-500">
                  <option value="">Todos</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Tarjeta">Tarjeta</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase tracking-wide">Estatus</label>
                <select value={filterEstatus} onChange={e => setFilterEstatus(e.target.value)} className="w-full rounded-lg border border-gray-200 px-2 py-1.5 focus:ring-2 focus:ring-rose-500 focus:border-rose-500">
                  <option value="">Todos</option>
                  <option value="Pagado">Pagado</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Vencido">Vencido</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase tracking-wide">Frecuencia</label>
                <select value={filterFrecuencia} onChange={e => setFilterFrecuencia(e.target.value)} className="w-full rounded-lg border border-gray-200 px-2 py-1.5 focus:ring-2 focus:ring-rose-500 focus:border-rose-500">
                  <option value="">Todas</option>
                  {FRECUENCIAS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={applyFilters} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-600 text-white hover:bg-rose-700">Aplicar filtros</button>
              <button onClick={clearFilters} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Limpiar</button>
            </div>
          </div>
        )}
        {exportExcelError && (
          <div className="px-6 py-2 text-sm text-amber-600">{exportExcelError}</div>
        )}

        {/* Tabla desktop */}
        <div className="hidden sm:block">
          <div className="overflow-x-auto max-h-[60vh]">
            <table className="min-w-[980px] md:min-w-[1060px] xl:min-w-[1260px] w-full text-sm lg:text-base xl:text-base 2xl:text-base">
              <thead className="bg-gray-50/80 backdrop-blur text-gray-600 sticky top-0 z-10">
                <tr>
                  <th className="text-center font-semibold px-4 py-3 lg:py-4 xl:py-4 2xl:py-4 border-r border-gray-200">
                    #
                  </th>
                  <th className="text-center font-semibold px-4 py-3 lg:py-4 xl:py-4 2xl:py-4 border-r border-gray-200">
                    Fecha
                  </th>
                  <th className="text-center font-semibold px-4 py-3 lg:py-4 xl:py-4 2xl:py-4 border-r border-gray-200">
                    Hora
                  </th>
                  <th className="text-center font-semibold px-4 py-3 lg:py-4 xl:py-4 2xl:py-4 border-r border-gray-200">
                    Categoría
                  </th>
                  <th className="text-center font-semibold px-4 py-3 lg:py-4 xl:py-4 2xl:py-4 border-r border-gray-200 w-[60px]">
                    Descripción
                  </th>
                  <th className="text-center font-semibold px-4 py-3 lg:py-4 xl:py-4 2xl:py-4 border-r border-gray-200">
                    Proveedor
                  </th>
                  <th className="text-center font-semibold px-4 py-3 lg:py-4 xl:py-4 2xl:py-4 border-r border-gray-200">
                    Frecuencia
                  </th>
                  <th className="text-center font-semibold px-1 py-3 lg:py-4 xl:py-4 2xl:py-4 border-r border-gray-200">
                    Método de pago
                  </th>
                  <th className="text-center font-semibold px-4 py-3 lg:py-4 xl:py-4 2xl:py-4 border-r border-gray-200">
                    Importe
                  </th>
                  <th className="text-center font-semibold px-4 py-3 lg:py-4 xl:py-4 2xl:py-4">
                    Estatus
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr className="border-b border-gray-200">
                    <td
                      colSpan={10}
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      No hay egresos fijos.
                    </td>
                  </tr>
                ) : (
                  rows.map((r, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-200 hover:bg-gray-50/50 cursor-pointer"
                      onClick={() => {
                        setEditIndex(idx);
                        setEditData({ ...r });
                        setEditOpen(true);
                      }}
                    >
                      <td className="px-4 py-3 text-gray-500 border-r border-gray-100">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3 text-gray-700 border-r border-gray-100 text-center">
                        {dayjs(r.fecha).format("DD/MM/YY")}
                      </td>
                      <td className="px-4 py-3 text-gray-700 border-r border-gray-100 text-center">
                        {r.hora ? String(r.hora).slice(0, 5) : "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-900 font-medium border-r border-gray-100 text-center">
                        {r.categoria}
                      </td>
                      <td className="px-4 py-3 border-r border-gray-100">
                        <div className="flex justify-center">
                          <button
                            type="button"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-50 text-indigo-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDescText(r.descripcion || "Sin descripción");
                              setDescOpen(true);
                            }}
                            title="Ver descripción"
                            aria-label="Ver descripción"
                          >
                            <FaRegEye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 border-r border-gray-100">
                        {r.proveedor || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-700 border-r border-gray-100">
                        <select
                          value={r.frecuencia}
                          onClick={(e) => e.stopPropagation()}
                          onChange={async (e) => {
                            try {
                              await patchGasto(idx, { frecuencia: e.target.value });
                            } catch (err) {
                              console.error("No se pudo actualizar frecuencia", err);
                            }
                          }}
                          className="rounded-md text-xs px-2 py-1 border border-gray-200"
                        >
                          {FRECUENCIAS.map((f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-gray-700 border-r border-gray-100 text-center">
                        {String(r.metodo || "").toLowerCase()}
                      </td>
                      <td className="px-4 py-3 text-right border-r border-gray-100">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 font-semibold">
                          {formatCurrency(r.importe)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        <select
                          value={r.estatus}
                          onClick={(e) => e.stopPropagation()}
                          onChange={async (e) => {
                            const next = e.target.value;
                            // Validación de presupuesto si va a Pagado
                            if (next === "Pagado") {
                              const item = rows[idx];
                              const month = dayjs(item.fecha).format("YYYY-MM");
                              let snap = null;
                              try {
                                const r = await getResumenMensual(month);
                                snap = {
                                  budget: Number(r.budget || 0),
                                  spent: Number(r.spent || 0),
                                  leftover: Number(r.leftover || 0),
                                };
                              } catch {
                                snap = getBudgetSnapshot(month);
                              }
                              const exceed = Math.max(
                                0,
                                Number(item.importe || 0) - snap.leftover
                              );
                              if (snap.budget > 0 && exceed > 0) {
                                setBudgetWarn({
                                  open: true,
                                  context: "status",
                                  info: {
                                    idx,
                                    month,
                                    snap,
                                    amount: Number(item.importe || 0),
                                    exceed,
                                  },
                                });
                                return;
                              }
                            }

                            // UI optimista
                            const prevRows = rows;
                            const optimistic = rows.map((x, i) =>
                              i === idx ? { ...x, estatus: next } : x
                            );
                            setRows(optimistic);
                            saveExpenses("fijos", optimistic);

                            try {
                              if (rows[idx]?.id) {
                                const updated = await updateGastoFijo(rows[idx].id, { estatus: next });
                                // sincronizar con respuesta del backend
                                setRows((current) => {
                                  const synced = current.map((x) =>
                                    x.id === updated.id ? { ...x, ...updated } : x
                                  );
                                  saveExpenses("fijos", synced);
                                  return synced;
                                });
                              }
                              // refrescar presupuesto si corresponde
                              if (next === "Pagado") {
                                const month = dayjs(rows[idx].fecha).format("YYYY-MM");
                                await refreshBudgetSummary(month);
                              }
                            } catch (err) {
                              // rollback en error
                              setRows(prevRows);
                              saveExpenses("fijos", prevRows);
                              console.error("No se pudo actualizar estatus", err);
                              // Aquí podrías añadir un toast de error
                            }
                          }}
                          className={`rounded-md text-xs px-2 py-1 border ${r.estatus === "Pagado"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-amber-200 bg-amber-50 text-amber-700"
                            }`}
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="Pagado">Pagado</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Móvil - cards */}
        <div className="sm:hidden p-4 space-y-3">
          {rows.length === 0 ? (
            <div className="text-sm text-gray-500">No hay egresos fijos.</div>
          ) : (
            rows.map((r, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 cursor-pointer"
                onClick={() => {
                  setEditIndex(idx);
                  setEditData({ ...r });
                  setEditOpen(true);
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="text-sm font-semibold text-gray-900 truncate pr-2">
                    {idx + 1}. {r.categoria}
                  </div>
                  <span className="text-xs text-gray-500">{formatDate(r.fecha)}</span>
                </div>
                <div className="text-[11px] text-gray-600 mb-2 truncate">
                  {r.descripcion || "-"}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 mb-2">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">Proveedor:</span>
                    <span className="font-medium text-gray-800">
                      {r.proveedor || "-"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">Hora:</span>
                    <span className="font-medium text-gray-800">
                      {r.hora ? String(r.hora).slice(0, 5) : "-"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">Método:</span>
                    <span className="font-medium text-gray-800">
                      {String(r.metodo || "").toLowerCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">Frec.:</span>
                    <select
                      value={r.frecuencia}
                      onClick={(e) => e.stopPropagation()}
                      onChange={async (e) => {
                        try {
                          await patchGasto(idx, { frecuencia: e.target.value });
                        } catch (err) {
                          console.error("No se pudo actualizar frecuencia", err);
                        }
                      }}
                      className="rounded-md text-[10px] px-1.5 py-0.5 border border-gray-200"
                    >
                      {FRECUENCIAS.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center justify-end gap-1 col-span-2">
                    <span className="text-gray-500">Importe</span>
                    <span className="text-sm font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                      {formatCurrency(r.importe)}
                    </span>
                  </div>
                </div>
                <div className="mt-1 text-[11px] text-gray-600 flex items-center gap-2">
                  <span className="text-gray-500">Estatus:</span>
                  <select
                    value={r.estatus}
                    onClick={(e) => e.stopPropagation()}
                    onChange={async (e) => {
                      const next = e.target.value;
                      // Validación de presupuesto si va a Pagado
                      if (next === "Pagado") {
                        const item = rows[idx];
                        const month = dayjs(item.fecha).format("YYYY-MM");
                        let snap = null;
                        try {
                          const r = await getResumenMensual(month);
                          snap = {
                            budget: Number(r.budget || 0),
                            spent: Number(r.spent || 0),
                            leftover: Number(r.leftover || 0),
                          };
                        } catch {
                          snap = getBudgetSnapshot(month);
                        }
                        const exceed = Math.max(
                          0,
                          Number(item.importe || 0) - snap.leftover
                        );
                        if (snap.budget > 0 && exceed > 0) {
                          setBudgetWarn({
                            open: true,
                            context: "status",
                            info: {
                              idx,
                              month,
                              snap,
                              amount: Number(item.importe || 0),
                              exceed,
                            },
                          });
                          return;
                        }
                      }

                      // UI optimista
                      const prevRows = rows;
                      const optimistic = rows.map((x, i) =>
                        i === idx ? { ...x, estatus: next } : x
                      );
                      setRows(optimistic);
                      saveExpenses("fijos", optimistic);

                      try {
                        if (rows[idx]?.id) {
                          const updated = await updateGastoFijo(rows[idx].id, { estatus: next });
                          // sincronizar con respuesta del backend
                          setRows((current) => {
                            const synced = current.map((x) =>
                              x.id === updated.id ? { ...x, ...updated } : x
                            );
                            saveExpenses("fijos", synced);
                            return synced;
                          });
                        }
                        // refrescar presupuesto si corresponde
                        if (next === "Pagado") {
                          const month = dayjs(rows[idx].fecha).format("YYYY-MM");
                          await refreshBudgetSummary(month);
                        }
                      } catch (err) {
                        // rollback en error
                        setRows(prevRows);
                        saveExpenses("fijos", prevRows);
                        console.error("No se pudo actualizar estatus", err);
                        // Aquí podrías añadir un toast de error
                      }
                    }}
                    className={`rounded-md text-[10px] px-1.5 py-0.5 border ${r.estatus === "Pagado"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-amber-200 bg-amber-50 text-amber-700"
                      }`}
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Pagado">Pagado</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Nuevo egreso fijo */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-[10000] backdrop-blur-sm bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border-2 border-slate-300 overflow-hidden flex flex-col mx-auto animate-in fade-in zoom-in duration-300 max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Nuevo gasto fijo</h3>
                <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mt-0.5">Registro de egresos</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={submit} className="flex-1 flex flex-col min-h-0">
              <div className="px-6 py-6 overflow-y-auto overscroll-contain flex-1 no-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Fecha</label>
                    <input
                      type="date"
                      name="fecha"
                      value={form.fecha}
                      onChange={onChange}
                      required
                      className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold focus:ring-4 focus:ring-rose-100 focus:border-rose-500 transition-all duration-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Hora</label>
                    <input
                      type="time"
                      name="hora"
                      value={form.hora}
                      onChange={onChange}
                      className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold focus:ring-4 focus:ring-rose-100 focus:border-rose-500 transition-all duration-200 outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Categoría</label>
                    <input
                      name="categoria"
                      value={form.categoria}
                      onChange={onChange}
                      placeholder="Renta, Nómina, Servicios..."
                      required
                      className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold focus:ring-4 focus:ring-rose-100 focus:border-rose-500 transition-all duration-200 outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Descripción</label>
                    <textarea
                      name="descripcion"
                      value={form.descripcion}
                      onChange={onChange}
                      rows={2}
                      maxLength={200}
                      className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm focus:ring-4 focus:ring-rose-100 focus:border-rose-500 transition-all duration-200 outline-none resize-none"
                      placeholder="Notas o detalles..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Proveedor</label>
                    <input
                      name="proveedor"
                      value={form.proveedor}
                      onChange={onChange}
                      className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold focus:ring-4 focus:ring-rose-100 focus:border-rose-500 transition-all duration-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Frecuencia</label>
                    <select
                      name="frecuencia"
                      value={form.frecuencia}
                      onChange={onChange}
                      className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold focus:ring-4 focus:ring-rose-100 focus:border-rose-500 transition-all duration-200 outline-none"
                    >
                      {FRECUENCIAS.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Método</label>
                    <select
                      name="metodo"
                      value={form.metodo}
                      onChange={onChange}
                      className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold focus:ring-4 focus:ring-rose-100 focus:border-rose-500 transition-all duration-200 outline-none"
                    >
                      <option value="Efectivo">Efectivo</option>
                      <option value="Transferencia">Transferencia</option>
                      <option value="Tarjeta">Tarjeta</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Importe</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      name="importe"
                      value={form.importe}
                      onChange={onChangeImporte}
                      placeholder="0.00"
                      required
                      className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold focus:ring-4 focus:ring-rose-100 focus:border-rose-500 transition-all duration-200 outline-none font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Estatus</label>
                    <select
                      name="estatus"
                      value={form.estatus}
                      onChange={onChange}
                      className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm font-bold focus:ring-4 focus:ring-rose-100 transition-all duration-200 outline-none ${form.estatus === "Pagado" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="Pagado">Pagado</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 border-t border-gray-100 bg-slate-50/80 flex items-center justify-end gap-2 sticky bottom-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-all active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-black text-white bg-gradient-to-r from-rose-600 to-rose-700 rounded-lg shadow-md shadow-rose-200 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.getElementById('modal-root')
      )}

      {/* Modal Plantillas de gastos fijos */}
      {plantillaModalOpen && createPortal(
        <div className="fixed inset-0 z-[10000] backdrop-blur-sm bg-black/40 overflow-y-auto h-full w-full flex items-center justify-center p-4">
          <div className="relative mx-auto border-2 border-slate-300 w-full max-w-4xl shadow-2xl rounded-2xl bg-white max-h-[90vh] flex flex-col overflow-hidden text-left">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Plantillas de gastos fijos</h3>
                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-0.5">Gestión de recurrencia</p>
                </div>
              </div>
              <button
                onClick={() => setPlantillaModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-8 no-scrollbar flex-1">
              {/* Formulario para agregar nueva plantilla */}
              <div className="bg-slate-50/50 rounded-3xl border-2 border-slate-100 p-6 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Nueva plantilla</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Categoría</label>
                    <input
                      value={plantillaForm.categoria}
                      onChange={e => setPlantillaForm(f => ({ ...f, categoria: e.target.value }))}
                      className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Proveedor</label>
                    <input
                      value={plantillaForm.proveedor}
                      onChange={e => setPlantillaForm(f => ({ ...f, proveedor: e.target.value }))}
                      className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Monto sugerido</label>
                    <input
                      value={plantillaForm.monto_sugerido}
                      onChange={e => setPlantillaForm(f => ({ ...f, monto_sugerido: e.target.value.replace(/[^\d.]/g, '') }))}
                      className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Frecuencia</label>
                    <select
                      value={plantillaForm.frecuencia}
                      onChange={e => setPlantillaForm(f => ({ ...f, frecuencia: e.target.value }))}
                      className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 outline-none"
                    >
                      {FRECUENCIAS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Método</label>
                    <select
                      value={plantillaForm.metodo}
                      onChange={e => setPlantillaForm(f => ({ ...f, metodo: e.target.value }))}
                      className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 outline-none"
                    >
                      <option value="Efectivo">Efectivo</option>
                      <option value="Transferencia">Transferencia</option>
                      <option value="Tarjeta">Tarjeta</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Día de pago</label>
                    <input
                      type="number"
                      min={1}
                      max={31}
                      value={plantillaForm.dia_pago}
                      onChange={e => setPlantillaForm(f => ({ ...f, dia_pago: e.target.value }))}
                      className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 outline-none"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Descripción</label>
                    <input
                      value={plantillaForm.descripcion}
                      onChange={e => setPlantillaForm(f => ({ ...f, descripcion: e.target.value }))}
                      className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Hora preferida</label>
                    <input
                      type="time"
                      value={plantillaForm.hora_preferida}
                      onChange={e => setPlantillaForm(f => ({ ...f, hora_preferida: e.target.value }))}
                      className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Fecha de inicio</label>
                    <input
                      type="date"
                      value={plantillaForm.fecha_inicio}
                      onChange={e => setPlantillaForm(f => ({ ...f, fecha_inicio: e.target.value }))}
                      className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 outline-none"
                    />
                  </div>

                  {['Bimestral', 'Semestral', 'Anual'].includes(plantillaForm.frecuencia) ? (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Mes de referencia</label>
                      <input
                        type="month"
                        value={plantillaForm.cadencia_anchor}
                        onChange={e => setPlantillaForm(f => ({ ...f, cadencia_anchor: e.target.value }))}
                        className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 outline-none"
                      />
                    </div>
                  ) : (
                    <div className="hidden md:block"></div>
                  )}

                  <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-2xl border-2 border-slate-100 space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            checked={!!plantillaForm.auto_evento}
                            onChange={e => setPlantillaForm(f => ({ ...f, auto_evento: e.target.checked }))}
                            className="peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-slate-300 transition-all checked:bg-indigo-600 checked:border-indigo-600 focus:outline-none"
                          />
                          <svg className="absolute h-5 w-5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">Calendario automático</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            checked={!!plantillaForm.auto_instanciar}
                            onChange={e => setPlantillaForm(f => ({ ...f, auto_instanciar: e.target.checked }))}
                            className="peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-slate-300 transition-all checked:bg-indigo-600 checked:border-indigo-600 focus:outline-none"
                          />
                          <svg className="absolute h-5 w-5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">Auto-instanciar</span>
                      </label>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          const anchor = plantillaForm.cadencia_anchor ? `${plantillaForm.cadencia_anchor}-01` : null;
                          const payload = { ...plantillaForm, cadencia_anchor: anchor, monto_sugerido: Number((plantillaForm.monto_sugerido || '').replace(/,/g, '')) || 0, dia_pago: plantillaForm.dia_pago ? Number(plantillaForm.dia_pago) : null, recordar_minutos: Number(plantillaForm.recordar_minutos) || 30, auto_evento: !!plantillaForm.auto_evento, auto_instanciar: !!plantillaForm.auto_instanciar };
                          if (!payload.categoria) return;
                          const saved = await createPlantilla(payload);
                          setPlantillas(prev => [saved, ...prev]);
                          setPlantillaForm({ categoria: '', descripcion: '', proveedor: '', frecuencia: 'Mensual', metodo: 'Efectivo', monto_sugerido: '', dia_pago: '', hora_preferida: '', recordar_minutos: 30, auto_evento: true, auto_instanciar: true, fecha_inicio: '', cadencia_anchor: '' });
                        } catch (e) { console.error('crear plantilla', e); }
                      }}
                      className="h-full w-full bg-indigo-600 text-white font-extrabold rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 px-6 py-4 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                      </svg>
                      Agregar plantilla
                    </button>
                  </div>
                </div>
              </div>

              {/* Listado de plantillas existentes */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-6 bg-slate-300 rounded-full"></div>
                  <h4 className="text-sm font-black text-slate-600 uppercase tracking-wider">Plantillas activas</h4>
                </div>
                <div className="border-2 border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b-2 border-slate-100">
                      <tr>
                        <th className="text-left px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoría</th>
                        <th className="text-left px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Proveedor</th>
                        <th className="text-right px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Monto</th>
                        <th className="text-left px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Frecuencia</th>
                        <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {plantillas.length === 0 ? (
                        <tr><td colSpan={5} className="text-center text-slate-400 px-5 py-8 font-medium italic">No hay plantillas configuradas todavía.</td></tr>
                      ) : plantillas.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-5 py-4 font-bold text-slate-700">{p.categoria}</td>
                          <td className="px-5 py-4 font-medium text-slate-500">{p.proveedor || '-'}</td>
                          <td className="px-5 py-4 text-right font-black text-indigo-600 font-mono italic">{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(p.monto_sugerido || 0))}</td>
                          <td className="px-5 py-4">
                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-tight">
                              {p.frecuencia}{p.dia_pago ? ` (Día ${p.dia_pago})` : ''}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  const monthVal = p.cadencia_anchor ? String(p.cadencia_anchor).slice(0, 7) : '';
                                  setPlantillaEdit({
                                    id: p.id,
                                    categoria: p.categoria || '',
                                    proveedor: p.proveedor || '',
                                    monto_sugerido: String(Number(p.monto_sugerido || 0)),
                                    frecuencia: p.frecuencia || 'Mensual',
                                    metodo: p.metodo || 'Efectivo',
                                    descripcion: p.descripcion || '',
                                    dia_pago: p.dia_pago || '',
                                    hora_preferida: p.hora_preferida || '',
                                    recordar_minutos: Number(p.recordar_minutos) || 30,
                                    auto_evento: !!p.auto_evento,
                                    auto_instanciar: !!p.auto_instanciar,
                                    fecha_inicio: p.fecha_inicio ? String(p.fecha_inicio).slice(0, 10) : '',
                                    cadencia_anchor: monthVal,
                                  });
                                  setPlantillaEditOpen(true);
                                }}
                                className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
                                title="Editar"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              </button>
                              <button
                                onClick={async () => {
                                  try {
                                    const nuevo = await updatePlantilla(p.id, { auto_instanciar: p.auto_instanciar ? 0 : 1 });
                                    setPlantillas(prev => prev.map(x => x.id === p.id ? { ...x, auto_instanciar: nuevo.auto_instanciar } : x));
                                    window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'info', message: nuevo.auto_instanciar ? 'Plantilla activada' : 'Plantilla desactivada' } }));
                                  } catch (e) { console.error('toggle auto_instanciar', e); }
                                }}
                                className={`p-2 rounded-xl transition-colors ${p.auto_instanciar ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                title={p.auto_instanciar ? 'Desactivar auto-creación' : 'Activar auto-creación'}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                              </button>
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    const gasto = await instanciarDesdePlantilla(p.id, {});
                                    setRows(prev => [{ ...gasto, calendarEventId: gasto.calendar_event_id ?? gasto.calendarEventId }, ...prev]);
                                    if (p.auto_evento) {
                                      try {
                                        const hora = p.hora_preferida || getSmartEventTime(gasto.fecha);
                                        const evRes = await api.post('/admin/calendar/events', {
                                          titulo: `Pagar ${gasto.categoria}`,
                                          descripcion: `Proveedor: ${gasto.proveedor || '-'} | Monto: ${formatCurrency(gasto.importe)} | Desde plantilla (manual)`,
                                          fecha: gasto.fecha,
                                          hora,
                                          tipo: 'finanzas',
                                          prioridad: 'media',
                                          recordarMinutos: Number(p.recordar_minutos) || 30,
                                          completado: false,
                                        });
                                        const ev = evRes?.data || {};
                                        const evId = ev.id || ev.eventId || ev.event?.id;
                                        if (evId && gasto?.id) {
                                          try {
                                            const updated = await updateGastoFijo(gasto.id, { calendar_event_id: evId });
                                            setRows(prev => prev.map(x => x.id === updated.id ? { ...updated, calendarEventId: updated.calendar_event_id ?? evId } : x));
                                            saveExpenses('fijos', rows);
                                          } catch (_) { }
                                        }
                                      } catch (err) { console.warn('evento plantilla manual', err?.response?.status || err?.message || err); }
                                    }
                                    window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', message: `Egreso creado manual` } }));
                                  } catch (e) { console.error('instanciar manual', e); }
                                }}
                                className="p-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-colors"
                                title="Crear registro ahora"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              </button>
                              <button
                                onClick={async () => {
                                  try { await deletePlantilla(p.id); setPlantillas(prev => prev.filter(x => x.id !== p.id)); } catch (e) { console.error('delete plantilla', e); }
                                }}
                                className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors"
                                title="Eliminar"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-slate-50/80 flex items-center justify-end sticky bottom-0">
              <button
                onClick={() => setPlantillaModalOpen(false)}
                className="px-8 py-2.5 bg-slate-800 text-white font-black rounded-2xl hover:bg-slate-900 shadow-lg shadow-slate-200 hover:scale-[1.02] active:scale-95 transition-all duration-200"
              >
                Cerrar gestión
              </button>
            </div>
          </div>
        </div>,
        document.getElementById('modal-root')
      )}

      {/* Modal Editar plantilla */}
      {plantillaEditOpen && plantillaEdit && createPortal(
        <div className="fixed inset-0 z-[10000] backdrop-blur-sm bg-black/40 overflow-y-auto h-full w-full flex items-center justify-center p-4">
          <div className="relative mx-auto border-2 border-slate-300 w-full max-w-2xl shadow-2xl rounded-2xl bg-white max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Editar plantilla</h3>
                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-0.5">Configuración de gastos recurrentes</p>
                </div>
              </div>
              <button
                onClick={() => { setPlantillaEditOpen(false); setPlantillaEdit(null); }}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6 no-scrollbar flex-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Categoría</label>
                  <input
                    value={plantillaEdit.categoria}
                    onChange={e => setPlantillaEdit(f => ({ ...f, categoria: e.target.value }))}
                    className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Proveedor</label>
                  <input
                    value={plantillaEdit.proveedor}
                    onChange={e => setPlantillaEdit(f => ({ ...f, proveedor: e.target.value }))}
                    className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Monto sugerido</label>
                  <input
                    value={plantillaEdit.monto_sugerido}
                    onChange={e => setPlantillaEdit(f => ({ ...f, monto_sugerido: e.target.value.replace(/[^\d.]/g, '') }))}
                    className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Frecuencia</label>
                  <select
                    value={plantillaEdit.frecuencia}
                    onChange={e => setPlantillaEdit(f => ({ ...f, frecuencia: e.target.value }))}
                    className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 outline-none"
                  >
                    {FRECUENCIAS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Método</label>
                  <select
                    value={plantillaEdit.metodo}
                    onChange={e => setPlantillaEdit(f => ({ ...f, metodo: e.target.value }))}
                    className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 outline-none"
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Tarjeta">Tarjeta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Día de pago</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={plantillaEdit.dia_pago}
                    onChange={e => setPlantillaEdit(f => ({ ...f, dia_pago: e.target.value }))}
                    placeholder="1-31"
                    className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 outline-none"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Descripción</label>
                  <input
                    value={plantillaEdit.descripcion}
                    onChange={e => setPlantillaEdit(f => ({ ...f, descripcion: e.target.value }))}
                    placeholder="Nota opcional..."
                    className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Hora preferida</label>
                  <input
                    type="time"
                    value={plantillaEdit.hora_preferida}
                    onChange={e => setPlantillaEdit(f => ({ ...f, hora_preferida: e.target.value }))}
                    className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Fecha de inicio</label>
                  <input
                    type="date"
                    value={plantillaEdit.fecha_inicio}
                    onChange={e => setPlantillaEdit(f => ({ ...f, fecha_inicio: e.target.value }))}
                    className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 outline-none"
                  />
                </div>

                {['Bimestral', 'Semestral', 'Anual'].includes(plantillaEdit.frecuencia) ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Mes de referencia</label>
                    <input
                      type="month"
                      value={plantillaEdit.cadencia_anchor}
                      onChange={e => setPlantillaEdit(f => ({ ...f, cadencia_anchor: e.target.value }))}
                      className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 outline-none"
                    />
                  </div>
                ) : (
                  <div className="hidden md:block"></div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Recordar (min)</label>
                  <input
                    type="number"
                    min={0}
                    value={plantillaEdit.recordar_minutos}
                    onChange={e => setPlantillaEdit(f => ({ ...f, recordar_minutos: Number(e.target.value) || 0 }))}
                    className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 outline-none"
                  />
                </div>

                <div className="md:col-span-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={!!plantillaEdit.auto_evento}
                        onChange={e => setPlantillaEdit(f => ({ ...f, auto_evento: e.target.checked }))}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-slate-300 transition-all checked:bg-indigo-600 checked:border-indigo-600 focus:outline-none"
                      />
                      <svg className="absolute h-5 w-5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">Crear evento de calendario automático</span>
                      <p className="text-[10px] text-slate-500 font-medium">Sincroniza el gasto con tu agenda personal.</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={!!plantillaEdit.auto_instanciar}
                        onChange={e => setPlantillaEdit(f => ({ ...f, auto_instanciar: e.target.checked }))}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-slate-300 transition-all checked:bg-indigo-600 checked:border-indigo-600 focus:outline-none"
                      />
                      <svg className="absolute h-5 w-5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">Auto-instanciar egreso fijo</span>
                      <p className="text-[10px] text-slate-500 font-medium">El registro se creará solo al llegar la fecha configurada.</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-slate-50/80 flex items-center justify-end gap-3 sticky bottom-0">
              <button
                onClick={() => { setPlantillaEditOpen(false); setPlantillaEdit(null); }}
                className="px-6 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  try {
                    const anchor = plantillaEdit.cadencia_anchor ? `${plantillaEdit.cadencia_anchor}-01` : null;
                    const payload = {
                      categoria: plantillaEdit.categoria,
                      proveedor: plantillaEdit.proveedor,
                      monto_sugerido: Number((plantillaEdit.monto_sugerido || '').replace(/,/g, '')) || 0,
                      frecuencia: plantillaEdit.frecuencia,
                      metodo: plantillaEdit.metodo,
                      descripcion: plantillaEdit.descripcion,
                      dia_pago: plantillaEdit.dia_pago ? Number(plantillaEdit.dia_pago) : null,
                      hora_preferida: plantillaEdit.hora_preferida || null,
                      recordar_minutos: Number(plantillaEdit.recordar_minutos) || 30,
                      auto_evento: !!plantillaEdit.auto_evento,
                      auto_instanciar: !!plantillaEdit.auto_instanciar,
                      fecha_inicio: plantillaEdit.fecha_inicio || null,
                      cadencia_anchor: anchor,
                    };
                    const saved = await updatePlantilla(plantillaEdit.id, payload);
                    setPlantillas(prev => prev.map(x => x.id === saved.id ? saved : x));
                    setPlantillaEditOpen(false);
                    setPlantillaEdit(null);
                  } catch (e) { console.error('update plantilla', e); }
                }}
                className="px-8 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all duration-200"
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>,
        document.getElementById('modal-root')
      )}

      {/* Modal presupuesto insuficiente (nuevo diseño unificado) */}
      {budgetWarn.open && createPortal(
        (() => {
          const i = budgetWarn.info || {};
          const b = i.snap || { budget: 0, spent: 0, leftover: 0 };
          const fmt = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(n || 0));
          return (
            <div className="fixed inset-0 z-[10000] backdrop-blur-sm bg-black/40 overflow-y-auto h-full w-full flex items-center justify-center p-4 text-center">
              <div className="relative mx-auto border-2 border-amber-300 w-full max-w-md shadow-2xl rounded-2xl bg-white overflow-hidden flex flex-col text-left">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-amber-50/80 backdrop-blur-md z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-amber-900 tracking-tight">Presupuesto insuficiente</h3>
                      <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-0.5">Control de gastos</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setBudgetWarn({ open: false, context: null, info: null })}
                    className="p-2 hover:bg-amber-100/50 rounded-xl text-amber-400 hover:text-amber-600 transition-all duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-6 space-y-5">
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    El egreso marcado excede el presupuesto disponible del mes configurado.
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 shadow-sm">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Presupuesto</div>
                      <div className="text-sm font-extrabold text-slate-800">{fmt(b.budget)}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 shadow-sm">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Gastado</div>
                      <div className="text-sm font-extrabold text-slate-800">{fmt(b.spent)}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-indigo-50 border-2 border-indigo-100 shadow-sm">
                      <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 leading-none">Disponible</div>
                      <div className="text-sm font-extrabold text-indigo-700">{fmt(b.leftover)}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-100 shadow-sm">
                      <div className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1 leading-none">Egreso</div>
                      <div className="text-sm font-black text-rose-600">{fmt(i.amount)}</div>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-100 border-dashed flex items-start gap-3">
                    <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs font-bold text-amber-800 leading-normal">
                      Continuar con este registro dejará el balance en <span className="text-rose-600 underline decoration-2 underline-offset-2">{fmt(i.exceed)}</span> para este periodo.
                    </p>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-end gap-3 sticky bottom-0">
                  <button
                    onClick={() => setBudgetWarn({ open: false, context: null, info: null })}
                    className="w-full sm:w-auto px-6 py-2.5 bg-white border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
                  >
                    Cerrar
                  </button>
                  {budgetWarn.context === 'create' ? (
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button
                        onClick={saveAsPendingInstead}
                        className="flex-1 sm:flex-none px-4 py-2.5 bg-white border-2 border-amber-200 text-amber-700 font-bold rounded-xl hover:bg-amber-50 hover:border-amber-300 transition-all duration-200 text-sm"
                      >
                        Como Pendiente
                      </button>
                      <button
                        onClick={proceedCreateEvenIfExceed}
                        className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all duration-200 text-sm"
                      >
                        Continuar
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button
                        onClick={saveStatusAsPending}
                        className="flex-1 sm:flex-none px-4 py-2.5 bg-white border-2 border-amber-200 text-amber-700 font-bold rounded-xl hover:bg-amber-50 hover:border-amber-300 transition-all duration-200 text-sm"
                      >
                        Como Pendiente
                      </button>
                      <button
                        onClick={proceedStatusEvenIfExceed}
                        className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all duration-200 text-sm"
                      >
                        Continuar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })(),
        document.getElementById('modal-root')
      )}

      {/* Modal Ver descripción */}
      {descOpen && createPortal(
        <div className="fixed inset-0 z-[10000] backdrop-blur-sm bg-black/40 overflow-y-auto h-full w-full flex items-center justify-center p-4">
          <div className="relative mx-auto border-2 border-slate-300 w-full max-w-lg shadow-2xl rounded-2xl bg-white max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Descripción</h3>
              <button
                onClick={() => setDescOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap break-words min-h-[120px] shadow-inner">
                {descText || "Sin descripción"}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-slate-50/80 flex items-center justify-end sticky bottom-0">
              <button
                onClick={() => setDescOpen(false)}
                className="px-6 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all duration-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>,
        document.getElementById('modal-root')
      )}

      {/* Modal Editar egreso fijo */}
      {editOpen && editData && createPortal(
        <div className="fixed inset-0 z-[10000] backdrop-blur-sm bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border-2 border-slate-300 overflow-hidden flex flex-col mx-auto animate-in fade-in zoom-in duration-300 max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Editar gasto fijo</h3>
                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-0.5">Modificar registro existente</p>
              </div>
              <button
                onClick={() => { setEditOpen(false); setEditData(null); setEditIndex(null); }}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editIndex === null) return;
                const amount = Number(editData.importe) || 0;
                setRows((prev) => {
                  const next = prev.map((x, i) => i === editIndex ? { ...editData, importe: amount } : x);
                  saveExpenses("fijos", next);
                  return next;
                });
                setEditOpen(false);
                setEditData(null);
                setEditIndex(null);
              }}
              className="flex-1 flex flex-col min-h-0"
            >
              <div className="px-6 py-6 overflow-y-auto overscroll-contain flex-1 no-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Fecha</label>
                    <input
                      type="date"
                      value={editData.fecha}
                      onChange={(e) => setEditData((d) => ({ ...d, fecha: e.target.value }))}
                      required
                      className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold focus:ring-4 focus:ring-rose-100 focus:border-rose-500 transition-all duration-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Hora</label>
                    <input
                      type="time"
                      value={editData.hora || ""}
                      onChange={(e) => setEditData((d) => ({ ...d, hora: e.target.value }))}
                      className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold focus:ring-4 focus:ring-rose-100 focus:border-rose-500 transition-all duration-200 outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Categoría</label>
                    <input
                      value={editData.categoria}
                      onChange={(e) => setEditData((d) => ({ ...d, categoria: e.target.value }))}
                      required
                      className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold focus:ring-4 focus:ring-rose-100 focus:border-rose-500 transition-all duration-200 outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Descripción</label>
                    <textarea
                      rows={2}
                      maxLength={200}
                      value={editData.descripcion || ""}
                      onChange={(e) => setEditData((d) => ({ ...d, descripcion: e.target.value }))}
                      className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm focus:ring-4 focus:ring-rose-100 focus:border-rose-500 transition-all duration-200 outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Proveedor</label>
                    <input
                      value={editData.proveedor || ""}
                      onChange={(e) => setEditData((d) => ({ ...d, proveedor: e.target.value }))}
                      className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold focus:ring-4 focus:ring-rose-100 focus:border-rose-500 transition-all duration-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Frecuencia</label>
                    <select
                      value={editData.frecuencia}
                      onChange={(e) => setEditData((d) => ({ ...d, frecuencia: e.target.value }))}
                      className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold focus:ring-4 focus:ring-rose-100 focus:border-rose-500 transition-all duration-200 outline-none"
                    >
                      {FRECUENCIAS.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Método</label>
                    <select
                      value={editData.metodo}
                      onChange={(e) => setEditData((d) => ({ ...d, metodo: e.target.value }))}
                      className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold focus:ring-4 focus:ring-rose-100 focus:border-rose-500 transition-all duration-200 outline-none"
                    >
                      <option value="Efectivo">Efectivo</option>
                      <option value="Transferencia">Transferencia</option>
                      <option value="Tarjeta">Tarjeta</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Importe</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editData.importe}
                      onChange={(e) => setEditData((d) => ({ ...d, importe: Number(e.target.value || 0) }))}
                      className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold focus:ring-4 focus:ring-rose-100 focus:border-rose-500 transition-all duration-200 outline-none font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Estatus</label>
                    <select
                      value={editData.estatus}
                      onChange={(e) => setEditData((d) => ({ ...d, estatus: e.target.value }))}
                      className={`w-full rounded-xl border-2 px-4 py-2.5 text-sm font-bold focus:ring-4 focus:ring-rose-100 transition-all duration-200 outline-none ${editData.estatus === "Pagado" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="Pagado">Pagado</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 border-t border-gray-100 bg-slate-50/80 flex items-center justify-between gap-2 sticky bottom-0">
                <button
                  type="button"
                  onClick={() => { setConfirmError(""); setConfirmOpen(true); }}
                  className="px-4 py-2 border border-rose-200 text-rose-600 font-bold rounded-lg hover:bg-rose-50 transition-all active:scale-95 inline-flex items-center gap-2"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Borrar
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setEditOpen(false); setEditData(null); setEditIndex(null); }}
                    className="px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-all active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-black text-white bg-gradient-to-r from-rose-600 to-rose-700 rounded-lg shadow-md shadow-rose-200 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>,
        document.getElementById('modal-root')
      )}

      {/* Modal Confirmación de borrado */}
      {confirmOpen && editIndex !== null && createPortal(
        <div className="fixed inset-0 z-[12000] backdrop-blur-sm bg-black/40 overflow-y-auto h-full w-full flex items-center justify-center p-4">
          <div className="relative mx-auto border border-rose-100 w-full max-w-sm shadow-2xl rounded-2xl bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-rose-50/30">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Eliminar gasto fijo</h3>
              <button
                onClick={() => !confirmLoading && setConfirmOpen(false)}
                className="p-1.5 hover:bg-rose-100 rounded-lg text-rose-400 hover:text-rose-600 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3 p-3 bg-rose-50/50 rounded-xl border border-rose-100/50">
                <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600 text-sm flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-800">
                    ¿Eliminar este egreso fijo?
                  </p>
                  <p className="text-[10px] text-rose-500 font-medium mt-0.5">Esta acción no se puede deshacer.</p>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Categoría</span>
                  <span className="text-xs font-extrabold text-slate-700">{rows[editIndex]?.categoria}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fecha</span>
                  <span className="text-xs font-bold text-slate-600">{formatDate(rows[editIndex]?.fecha)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-100 pt-1.5 mt-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Importe</span>
                  <span className="text-xs font-black text-rose-600">{formatCurrency(Number(rows[editIndex]?.importe) || 0)}</span>
                </div>
              </div>
              {confirmError && <p className="text-[10px] font-bold text-rose-600 text-center uppercase tracking-widest mt-2">{confirmError}</p>}
            </div>
            <div className="px-4 py-3 border-t border-gray-100 bg-slate-50/80 flex items-center justify-stretch gap-2">
              <button
                type="button"
                disabled={confirmLoading}
                onClick={() => setConfirmOpen(false)}
                className="flex-1 px-3 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-all duration-200 disabled:opacity-60"
              >
                No, cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (editIndex === null) return;
                  setConfirmLoading(true);
                  setConfirmError("");
                  const toRemove = rows[editIndex];
                  try {
                    if (toRemove?.id) await deleteGastoFijo(toRemove.id);
                    setRows((prev) => {
                      const removed = prev[editIndex];
                      const next = prev.filter((_, i) => i !== editIndex);
                      saveExpenses("fijos", next);
                      if (undo.timer) clearTimeout(undo.timer);
                      const t = setTimeout(() => setUndo({ show: false, item: null, index: null, timer: null }), 7000);
                      setUndo({ show: true, item: removed, index: editIndex, timer: t });
                      return next;
                    });
                    if (toRemove?.estatus === "Pagado") {
                      const month = dayjs(toRemove.fecha).format("YYYY-MM");
                      await refreshBudgetSummary(month);
                    }
                    try {
                      if (toRemove?.calendarEventId) await api.delete(`/admin/calendar/events/${toRemove.calendarEventId}`);
                    } catch (e) { console.warn("No se pudo borrar evento calendario (fijo):", e?.response?.status || e?.message || e); }
                  } catch (error) { console.error('Error al eliminar gasto fijo:', error); setConfirmError('Error al eliminar el gasto'); }
                  setConfirmLoading(false);
                  setConfirmOpen(false);
                  setEditOpen(false);
                  setEditIndex(null);
                  setEditData(null);
                }}
                className="flex-1 px-3 py-2 bg-rose-600 text-white font-extrabold rounded-lg shadow-md shadow-rose-200 hover:bg-rose-700 active:scale-95 transition-all duration-200 disabled:opacity-70"
                disabled={confirmLoading}
              >
                {confirmLoading ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>,
        document.getElementById('modal-root')
      )}
      {/* Toast Deshacer borrado */}
      {undo.show && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[12000]">
          <div className="flex items-center gap-3 bg-white/95 backdrop-blur rounded-xl shadow-lg ring-1 ring-gray-200 px-4 py-2">
            <span className="text-sm text-gray-700">Gasto eliminado</span>
            <button
              onClick={async () => {
                if (undo.timer) clearTimeout(undo.timer);
                let restored = { ...undo.item };
                try {
                  if (undo.item?.calendarEventId) {
                    const titulo = `Gasto fijo: ${undo.item.categoria}`;
                    const partes = [
                      `Proveedor: ${undo.item.proveedor || "-"}`,
                      `Frecuencia: ${undo.item.frecuencia}`,
                      `Método: ${undo.item.metodo}`,
                      `Importe: ${formatCurrency(undo.item.importe)}`,
                      `Estatus: ${undo.item.estatus}`,
                    ];
                    if (undo.item.descripcion)
                      partes.push(`Nota: ${undo.item.descripcion}`);
                    const descripcion = partes.join(" | ");
                    const horaEvento = undo.item.hora
                      ? undo.item.hora
                      : getSmartEventTime(undo.item.fecha);
                    const recordarMinutos = dayjs(undo.item.fecha).isSame(
                      dayjs(),
                      "day"
                    )
                      ? 10
                      : 30;
                    const evRes = await api.post("/admin/calendar/events", {
                      titulo,
                      descripcion,
                      fecha: undo.item.fecha,
                      hora: horaEvento,
                      tipo: "finanzas",
                      prioridad: "media",
                      recordarMinutos,
                      completado: false,
                    });
                    const ev = evRes?.data || {};
                    const evId = ev.id || ev.eventId || ev.event?.id;
                    if (evId) restored = { ...restored, calendarEventId: evId };
                  }
                } catch (e) {
                  console.warn(
                    "No se pudo recrear evento (fijos):",
                    e?.response?.status || e?.message || e
                  );
                }
                setRows((prev) => {
                  const next = [...prev];
                  const idx = Math.min(undo.index ?? 0, next.length);
                  next.splice(idx, 0, restored);
                  saveExpenses("fijos", next);
                  return next;
                });
                setUndo({ show: false, item: null, index: null, timer: null });
              }}
              className="text-sm font-semibold text-rose-700 hover:text-rose-800"
            >
              Deshacer
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
