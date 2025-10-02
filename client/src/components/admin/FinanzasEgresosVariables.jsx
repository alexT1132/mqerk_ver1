import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaRegEye } from "react-icons/fa";
import dayjs from "dayjs";
import {
  loadExpenses,
  saveExpenses,
  getBudgetSnapshot,
} from "../../utils/budgetStore.js";
import { getResumenMensual } from "../../service/finanzasPresupuesto.js";
import { 
  listGastosVariables, 
  createGastoVariable, 
  updateGastoVariable, 
  deleteGastoVariable 
} from "../../service/finanzasGastosVariables.js";
import api from "../../api/axios.js";

export default function FinanzasEgresosVariables() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportExcelLoading, setExportExcelLoading] = useState(false);
  const [exportExcelError, setExportExcelError] = useState('');
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
  const parseCurrency = (s) => {
    if (typeof s === "number") return s;
    if (!s) return 0;
    const clean = String(s).replace(/,/g, "");
    const n = parseFloat(clean);
    return Number.isNaN(n) ? 0 : n;
  };

  const getDefaultForm = () => ({
    fecha: dayjs().format("YYYY-MM-DD"),
    unidades: "",
    producto: "",
    descripcion: "",
    entidad: "",
    valorUnitario: "", // string formateado mientras escribe
    metodo: "Efectivo",
    estatus: "Pendiente",
    importe: "",
  });

  const [form, setForm] = useState(getDefaultForm());
  // Filtros
  const [showFilters, setShowFilters] = useState(false);
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [filterMetodo, setFilterMetodo] = useState('');
  const [filterEstatus, setFilterEstatus] = useState('');
  
  useEffect(() => {
    const fetchGastosVariables = async () => {
      try {
        setLoading(true);
        const data = await listGastosVariables();
        // Normalizar para asegurar que siempre haya valorUnitario
        const normalized = (data || []).map(d => ({
          ...d,
            // prefer camelCase ya devuelto por backend actualizado
          valorUnitario: d.valorUnitario ?? d.valor_unitario ?? 0
        }));
        setRows(normalized);
        // También mantener en storage como backup
        saveExpenses("variables", normalized);
      } catch (error) {
        console.error('Error al cargar gastos variables:', error);
        // Fallback al storage local si falla la API
        const local = loadExpenses("variables");
        const normalizedLocal = (local || []).map(d => ({
          ...d,
          valorUnitario: d.valorUnitario ?? d.valor_unitario ?? 0
        }));
        setRows(normalizedLocal);
      } finally {
        setLoading(false);
      }
    };

    fetchGastosVariables();
  }, []);

  const applyFilters = async () => {
    try {
      setLoading(true);
      const data = await listGastosVariables({ from: filterFrom || undefined, to: filterTo || undefined, metodo: filterMetodo || undefined, estatus: filterEstatus || undefined });
      const normalized = (data || []).map(d => ({ ...d, valorUnitario: d.valorUnitario ?? d.valor_unitario ?? 0 }));
      setRows(normalized);
      saveExpenses('variables', normalized);
    } catch(e){ console.error('Error filtrando gastos variables', e); }
    finally { setLoading(false); }
  };
  const clearFilters = async () => { setFilterFrom(''); setFilterTo(''); setFilterMetodo(''); setFilterEstatus(''); await applyFilters(); };

  useEffect(() => {
    return () => {
      if (undo.timer) clearTimeout(undo.timer);
    };
  }, [undo.timer]);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const onChangeUnidades = (e) => {
    let v = e.target.value || "";
    v = v.replace(/[^\d]/g, ""); // solo enteros
    setForm((f) => {
      const unidadesNum = Number(v || 0);
      const unitVal = parseCurrency(f.valorUnitario);
      const importeCalc = unidadesNum * unitVal;
      // Formatear numero sin símbolo, con hasta 2 decimales y separador de miles
      let importeStr = '';
      try {
        importeStr = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 }).format(importeCalc);
      } catch {
        importeStr = String(importeCalc);
      }
      return { ...f, unidades: v, importe: importeStr };
    });
  };
  const onChangeValorUnitario = (e) => {
    let v = e.target.value || "";
    v = v.replace(/[^\d.]/g, "");
    const firstDot = v.indexOf(".");
    if (firstDot !== -1)
      v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, "");
    const [enteroRaw, decRaw] = v.split(".");
    const entero = (enteroRaw || "").replace(/^0+(?=\d)/, "");
    const withCommas = entero.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const dec = decRaw !== undefined ? decRaw.slice(0, 2) : undefined;
    const formatted =
      dec !== undefined
        ? dec.length
          ? `${withCommas}.${dec}`
          : `${withCommas}.`
        : withCommas;
    setForm((f) => {
      const unidadesNum = Number(f.unidades || 0);
      const unitVal = parseCurrency(formatted);
      const importeCalc = unidadesNum * unitVal;
      let importeStr = '';
      try {
        importeStr = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 }).format(importeCalc);
      } catch {
        importeStr = String(importeCalc);
      }
      return { ...f, valorUnitario: formatted, importe: importeStr };
    });
  };
  const onChangeImporte = (e) => {
    let v = e.target.value || "";
    v = v.replace(/[^\d.]/g, "");
    const firstDot = v.indexOf(".");
    if (firstDot !== -1)
      v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, "");
    const [enteroRaw, decRaw] = v.split(".");
    const entero = (enteroRaw || "").replace(/^0+(?=\d)/, "");
    const withCommas = entero.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const dec = decRaw !== undefined ? decRaw.slice(0, 2) : undefined;
    const formatted =
      dec !== undefined
        ? dec.length
          ? `${withCommas}.${dec}`
          : `${withCommas}.`
        : withCommas;
    setForm((f) => ({ ...f, importe: formatted }));
  };

  const totals = useMemo(() => {
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

  // Exportar todos los gastos variables a Excel
  const handleExportExcel = async () => {
    try {
      setExportExcelLoading(true); setExportExcelError('');
      const [ExcelJS, data] = await Promise.all([
        import('exceljs'),
        listGastosVariables()
      ]);
      const workbook = new ExcelJS.Workbook();
      const ws = workbook.addWorksheet('Gastos variables');
      const columns = [
        { header: 'ID', key: 'id' },
        { header: 'Fecha', key: 'fecha' },
        { header: 'Unidades', key: 'unidades' },
        { header: 'Producto/Servicio', key: 'producto' },
        { header: 'Descripción', key: 'descripcion' },
        { header: 'Entidad', key: 'entidad' },
        { header: 'Valor unitario', key: 'valorUnitario' },
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
          unidades: r.unidades ?? 0,
          producto: r.producto || '',
          descripcion: r.descripcion || '',
          entidad: r.entidad || '',
          valorUnitario: Number(r.valorUnitario ?? r.valor_unitario ?? 0),
          metodo: r.metodo || '',
          importe: Number(r.importe ?? 0),
          estatus: r.estatus || '',
          calendar_event_id: r.calendar_event_id ?? r.calendarEventId ?? ''
        });
      }
      const headerRow = ws.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.alignment = { vertical: 'middle' };
      headerRow.height = 20;
      headerRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
        cell.border = { top: { style: 'thin', color: { argb: 'FFDBEAFE' } }, left: { style: 'thin', color: { argb: 'FFDBEAFE' } }, bottom: { style: 'thin', color: { argb: 'FFDBEAFE' } }, right: { style: 'thin', color: { argb: 'FFDBEAFE' } } };
      });
      // Formato de moneda para valorUnitario e importe
      ws.getColumn('valorUnitario').numFmt = '#,##0.00';
      ws.getColumn('valorUnitario').alignment = { horizontal: 'right' };
      ws.getColumn('importe').numFmt = '#,##0.00';
      ws.getColumn('importe').alignment = { horizontal: 'right' };
      ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columns.length } };
      ws.views = [{ state: 'frozen', ySplit: 1 }];
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
      const ts = new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
      a.href = url; a.download = `gastos-variables-${ts}.xlsx`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setExportExcelError('No se pudo exportar Excel.');
    } finally { setExportExcelLoading(false); }
  };

  const submit = async (e) => {
    e.preventDefault();
    const unidades = Number(form.unidades || 0);
    if (!unidades) return;
    if (!form.producto) return;
    const valorUnitarioNum = parseCurrency(form.valorUnitario);
    const importeNum = parseCurrency(form.importe);
    const nuevo = {
      fecha: form.fecha,
      unidades,
      producto: form.producto.trim(),
      descripcion: form.descripcion?.trim() || "",
      entidad: form.entidad?.trim() || "",
      valorUnitario: valorUnitarioNum,
      metodo: form.metodo,
      importe: importeNum,
      estatus: form.estatus,
    };
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
      const exceed = Math.max(0, importeNum - snap.leftover);
      if (exceed > 0 || snap.budget === 0) {
        setBudgetWarn({
          open: true,
          context: "create",
          info: { month, snap, amount: importeNum, exceed, entry: nuevo },
        });
        return;
      }
    }
    
    try {
      // Crear gasto variable en la API
      const createdGasto = await createGastoVariable(nuevo);
      const createdNorm = { ...createdGasto, valorUnitario: createdGasto.valorUnitario ?? createdGasto.valor_unitario ?? nuevo.valorUnitario };
      // Actualizar estado local
      setRows((prev) => {
        const next = [...prev, createdNorm];
        saveExpenses("variables", next);
        return next;
      });

      // Crear evento de calendario en background y persistir calendarEventId
      (async () => {
        try {
          const titulo = `Gasto variable: ${nuevo.producto}`;
          const partes = [
            `Unidades: ${nuevo.unidades}`,
            `Método: ${nuevo.metodo}`,
            `Importe: ${formatCurrency(nuevo.importe)}`,
            `Estatus: ${nuevo.estatus}`,
            `Entidad: ${nuevo.entidad || "-"}`,
          ];
          if (nuevo.descripcion) partes.push(`Nota: ${nuevo.descripcion}`);
          const descripcion = partes.join(" | ");
          const hora = "10:00";
          const recordarMinutos = dayjs(nuevo.fecha).isSame(dayjs(), "day")
            ? 10
            : 30;
          const evRes = await api.post("/admin/calendar/events", {
            titulo,
            descripcion,
            fecha: nuevo.fecha,
            hora,
            tipo: "finanzas",
            prioridad: "media",
            recordarMinutos,
            completado: false,
          });
          const ev = evRes?.data || {};
          const evId = ev.id || ev.eventId || ev.event?.id;
          if (evId && createdNorm?.id) {
            try {
              const updated = await updateGastoVariable(createdNorm.id, { calendarEventId: evId });
              setRows((prev) => {
                const next = prev.map((r) => r.id === createdNorm.id ? (updated || { ...r, calendarEventId: evId }) : r);
                saveExpenses("variables", next);
                return next;
              });
            } catch {}
          }
        } catch (err) {
          console.warn(
            "Error al crear evento de calendario:",
            err?.response?.status || err?.message || err
          );
        }
      })();
    } catch (error) {
      console.error('Error al crear gasto variable:', error);
      // Fallback al almacenamiento local
      const _lid = Date.now() + Math.random();
      setRows((prev) => {
        const next = [...prev, { ...nuevo, _lid }];
        saveExpenses("variables", next);
        return next;
      });
    }
    
    setShowModal(false);
    setForm(getDefaultForm());
  };

  const proceedCreateEvenIfExceed = async () => {
    if (!budgetWarn.open || budgetWarn.context !== "create") return;
    const { entry } = budgetWarn.info || {};
    try {
      // Persistir en backend aunque exceda presupuesto
      const created = await createGastoVariable(entry);
      const createdNorm = { ...created, valorUnitario: created.valorUnitario ?? created.valor_unitario ?? entry.valorUnitario };
      setRows((prev) => {
        const next = [...prev, createdNorm];
        saveExpenses("variables", next);
        return next;
      });
      // Crear evento y actualizar calendarEventId
      try {
        const titulo = `Gasto variable: ${entry.producto}`;
        const partes = [
          `Unidades: ${entry.unidades}`,
          `Método: ${entry.metodo}`,
          `Importe: ${formatCurrency(entry.importe)}`,
          `Estatus: ${entry.estatus}`,
          `Entidad: ${entry.entidad || "-"}`,
        ];
        if (entry.descripcion) partes.push(`Nota: ${entry.descripcion}`);
        const descripcion = partes.join(" | ");
        const hora = "10:00";
        const recordarMinutos = dayjs(entry.fecha).isSame(dayjs(), "day") ? 10 : 30;
        const evRes = await api.post("/admin/calendar/events", {
          titulo,
          descripcion,
          fecha: entry.fecha,
          hora,
          tipo: "finanzas",
          prioridad: "media",
          recordarMinutos,
          completado: false,
        });
        const ev = evRes?.data || {};
        const evId = ev.id || ev.eventId || ev.event?.id;
        if (evId && createdNorm?.id) {
          try {
            const updated = await updateGastoVariable(createdNorm.id, { calendarEventId: evId });
            setRows((prev) => {
              const next = prev.map((r) => r.id === createdNorm.id ? (updated || { ...r, calendarEventId: evId }) : r);
              saveExpenses("variables", next);
              return next;
            });
          } catch {}
        }
      } catch (err) {
        console.warn(
          "Calendario egreso variable (exceed path):",
          err?.response?.status || err?.message || err
        );
      }
    } catch (err) {
      // Fallback local si la API falla
      const _lid = Date.now() + Math.random();
      setRows((prev) => {
        const next = [...prev, { ...entry, _lid }];
        saveExpenses("variables", next);
        return next;
      });
    }
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
        saveExpenses("variables", next);
        return next;
      });
      setShowModal(false);
      setForm(getDefaultForm());
    }
    setBudgetWarn({ open: false, context: null, info: null });
  };

  // Nuevo: acciones para el flujo de cambio de estatus (status)
  const saveStatusAsPending = async () => {
    if (!budgetWarn.open || budgetWarn.context !== 'status') return;
    const { idx } = budgetWarn.info || {};
    if (idx === undefined || idx === null) { setBudgetWarn({ open:false, context:null, info:null }); return; }
    const item = rows[idx];
    const prev = item?.estatus;
    // Optimista a Pendiente
    setRows(prevRows => prevRows.map((r,i)=> i===idx ? { ...r, estatus:'Pendiente' } : r));
    try {
      if (item?.id) await updateGastoVariable(item.id, { estatus:'Pendiente' });
    } catch {
      // Revertir si falla
      setRows(prevRows => prevRows.map((r,i)=> i===idx ? { ...r, estatus: prev } : r));
    }
    setBudgetWarn({ open:false, context:null, info:null });
  };

  const proceedStatusEvenIfExceed = async () => {
    if (!budgetWarn.open || budgetWarn.context !== 'status') return;
    const { idx } = budgetWarn.info || {};
    if (idx === undefined || idx === null) { setBudgetWarn({ open:false, context:null, info:null }); return; }
    const item = rows[idx];
    const prev = item?.estatus;
    // Optimista a Pagado y persistir
    setRows(prevRows => prevRows.map((r,i)=> i===idx ? { ...r, estatus:'Pagado' } : r));
    try {
      if (item?.id) await updateGastoVariable(item.id, { estatus:'Pagado' });
    } catch {
      // Revertir si falla
      setRows(prevRows => prevRows.map((r,i)=> i===idx ? { ...r, estatus: prev } : r));
    }
    setBudgetWarn({ open:false, context:null, info:null });
  };

  return (
    <section className="px-4 sm:px-6 lg:px-10 py-6 max-w-screen-2xl mx-auto">
      <header className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
            Gastos variables
          </h1>
          <p className="text-sm text-gray-500">
            Compras, materiales, comisiones y costos no recurrentes.
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
              to="/administrativo/finanzas/egresos/fijos"
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Gastos fijos
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
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-sm ring-1 ring-gray-100 p-4 sm:p-5">
          <p className="text-xs text-gray-500">Hoy</p>
          <p className="text-2xl font-semibold text-rose-600">
            {formatCurrency(totals.today)}
          </p>
        </div>
        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-sm ring-1 ring-gray-100 p-4 sm:p-5">
          <p className="text-xs text-gray-500">Últimos 7 días</p>
          <p className="text-2xl font-semibold text-rose-600">
            {formatCurrency(totals.week)}
          </p>
        </div>
        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-sm ring-1 ring-gray-100 p-4 sm:p-5">
          <p className="text-xs text-gray-500">Mes</p>
          <p className="text-2xl font-semibold text-rose-600">
            {formatCurrency(totals.month)}
          </p>
        </div>
        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-sm ring-1 ring-gray-100 p-4 sm:p-5">
          <p className="text-xs text-gray-500">Año</p>
          <p className="text-2xl font-semibold text-rose-600">
            {formatCurrency(totals.year)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
              Registro de gastos variables
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=> setShowFilters(s=>!s)} className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">{showFilters ? 'Ocultar filtros' : 'Filtros'}</button>
            <button
              onClick={handleExportExcel}
              disabled={exportExcelLoading}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >{exportExcelLoading ? 'Exportando…' : 'Exportar Excel'}</button>
            <button
              onClick={() => setShowModal(true)}
              className="px-3 py-1.5 text-sm rounded-lg bg-rose-600 text-white hover:bg-rose-700"
            >
              Nuevo gasto variable
            </button>
          </div>
        </div>
        {showFilters && (
          <div className="px-6 pb-4 pt-4 border-b border-gray-200 bg-gray-50/60 text-xs sm:text-[13px]">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase tracking-wide">Desde</label>
                <input type="date" value={filterFrom} onChange={e=>setFilterFrom(e.target.value)} className="w-full rounded-lg border border-gray-200 px-2 py-1.5 focus:ring-2 focus:ring-rose-500 focus:border-rose-500" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase tracking-wide">Hasta</label>
                <input type="date" value={filterTo} onChange={e=>setFilterTo(e.target.value)} className="w-full rounded-lg border border-gray-200 px-2 py-1.5 focus:ring-2 focus:ring-rose-500 focus:border-rose-500" />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase tracking-wide">Método</label>
                <select value={filterMetodo} onChange={e=>setFilterMetodo(e.target.value)} className="w-full rounded-lg border border-gray-200 px-2 py-1.5 focus:ring-2 focus:ring-rose-500 focus:border-rose-500">
                  <option value="">Todos</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Tarjeta">Tarjeta</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase tracking-wide">Estatus</label>
                <select value={filterEstatus} onChange={e=>setFilterEstatus(e.target.value)} className="w-full rounded-lg border border-gray-200 px-2 py-1.5 focus:ring-2 focus:ring-rose-500 focus:border-rose-500">
                  <option value="">Todos</option>
                  <option value="Pagado">Pagado</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Vencido">Vencido</option>
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
            <table className="min-w-[980px] md:min-w-[1060px] xl:min-w-[1260px] w-full text-sm">
              <thead className="bg-gray-50/80 backdrop-blur text-gray-600 sticky top-0 z-10">
                <tr>
                  <th className="text-center font-semibold px-4 py-3 border-r border-gray-200">
                    #
                  </th>
                  <th className="text-center font-semibold px-4 py-3 border-r border-gray-200">
                    Unidades
                  </th>
                  <th className="text-center font-semibold px-4 py-3 border-r border-gray-200">
                    Producto/Servicio
                  </th>
                  <th className="text-center font-semibold px-4 py-3 border-r border-gray-200 w-[60px] whitespace-nowrap">
                    Desc.
                  </th>
                  <th className="text-center font-semibold px-4 py-3 border-r border-gray-200">
                    Entidad
                  </th>
                  <th className="text-center font-semibold px-4 py-3 border-r border-gray-200">
                    Valor unitario
                  </th>
                  <th className="text-center font-semibold px-4 py-3 border-r border-gray-200">
                    Método de pago
                  </th>
                  <th className="text-center font-semibold px-4 py-3 border-r border-gray-200">
                    Importe
                  </th>
                  <th className="text-center font-semibold px-4 py-3">
                    Estatus
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr className="border-b border-gray-200">
                    <td
                      colSpan={9}
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      No hay gastos variables.
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
                        {r.unidades}
                      </td>
                      <td className="px-4 py-3 text-gray-900 font-medium border-r border-gray-100">
                        {r.producto}
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
                        {r.entidad || "-"}
                      </td>
                      <td className="px-4 py-3 text-center border-r border-gray-100">
                        {formatCurrency(r.valorUnitario)}
                      </td>
                      <td className="px-4 py-3 text-gray-700 border-r border-gray-100 text-center">
                        {String(r.metodo || "").toLowerCase()}
                      </td>
                      <td className="px-4 py-3 text-center border-r border-gray-100">
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
                            const item = rows[idx];
                            const prevStatus = item.estatus;
                            if (next === "Pagado") {
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
                              const exceed = Math.max(0, Number(item.importe || 0) - snap.leftover);
                              if (exceed > 0 || snap.budget === 0) {
                                setBudgetWarn({
                                  open: true,
                                  context: "status",
                                  info: { idx, month, snap, amount: Number(item.importe || 0), exceed },
                                });
                                return;
                              }
                            }
                            // Optimistic update
                            setRows((prev) => prev.map((x, i) => (i === idx ? { ...x, estatus: next } : x)));
                            try {
                              if (item?.id) await updateGastoVariable(item.id, { estatus: next });
                            } catch (err) {
                              // Revert on error
                              setRows((prev) => prev.map((x, i) => (i === idx ? { ...x, estatus: prevStatus } : x)));
                            }
                          }}
                          className={`rounded-md text-xs px-2 py-1 border ${
                            r.estatus === "Pagado"
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
            <div className="text-sm text-gray-500">
              No hay gastos variables.
            </div>
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
                    {idx + 1}. {r.producto}
                  </div>
                  <select
                    className={`rounded-md text-[11px] px-2 py-1 ${
                      r.estatus === "Pagado"
                        ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border border-amber-200 bg-amber-50 text-amber-700"
                    }`}
                    value={r.estatus}
                    onClick={(e) => e.stopPropagation()}
                    onChange={async (e) => {
                      const next = e.target.value;
                      const item = rows[idx];
                      const prevStatus = item.estatus;
                      if (next === "Pagado") {
                        const month = dayjs(item.fecha).format("YYYY-MM");
                        let snap = null;
                        try {
                          const r = await getResumenMensual(month);
                          snap = { budget: Number(r.budget || 0), spent: Number(r.spent || 0), leftover: Number(r.leftover || 0) };
                        } catch {
                          snap = getBudgetSnapshot(month);
                        }
                        const exceed = Math.max(0, Number(item.importe || 0) - snap.leftover);
                        if (exceed > 0 || snap.budget === 0) {
                          setBudgetWarn({ open: true, context: "status", info: { idx, month, snap, amount: Number(item.importe || 0), exceed } });
                          return;
                        }
                      }
                      setRows((prev) => prev.map((x, i) => (i === idx ? { ...x, estatus: next } : x)));
                      try {
                        if (item?.id) await updateGastoVariable(item.id, { estatus: next });
                      } catch (err) {
                        setRows((prev) => prev.map((x, i) => (i === idx ? { ...x, estatus: prevStatus } : x)));
                      }
                    }}
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Pagado">Pagado</option>
                  </select>
                </div>
                <div className="text-[11px] text-gray-600 mb-2 truncate">
                  {r.descripcion || "-"}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 mb-2">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">Unidades:</span>
                    <span className="font-medium text-gray-800">
                      {r.unidades}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">Entidad:</span>
                    <span className="font-medium text-gray-800">
                      {r.entidad || "-"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">V. unitario:</span>
                    <span className="font-medium text-gray-800">
                      {formatCurrency(r.valorUnitario)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">Método:</span>
                    <span className="font-medium text-gray-800">
                      {String(r.metodo || "").toLowerCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-1 col-span-2">
                    <span className="text-gray-500">Importe</span>
                    <span className="text-sm font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                      {formatCurrency(r.importe)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Nuevo gasto variable */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto pt-[92px] sm:pt-[112px] pb-6 px-3 sm:px-4 bg-black/40">
          <div className="bg-white w-full max-w-[95vw] sm:max-w-lg rounded-2xl shadow-xl flex flex-col max-h-[90dvh] mx-auto my-6 sm:my-8">
            <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-base font-semibold text-gray-900">
                Nuevo gasto variable
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <form onSubmit={submit} className="flex-1 flex flex-col">
              <div className="px-4 sm:px-5 py-4 overflow-y-auto overscroll-contain">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Fecha
                    </label>
                    <input
                      type="date"
                      name="fecha"
                      value={form.fecha}
                      onChange={onChange}
                      required
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Unidades
                    </label>
                    <input
                      name="unidades"
                      value={form.unidades}
                      onChange={onChangeUnidades}
                      placeholder="0"
                      required
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Producto/Servicio
                    </label>
                    <input
                      name="producto"
                      value={form.producto}
                      onChange={onChange}
                      placeholder="Material, comisión, etc."
                      required
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Descripción
                    </label>
                    <textarea
                      name="descripcion"
                      value={form.descripcion}
                      onChange={onChange}
                      rows={2}
                      maxLength={200}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none"
                      placeholder="Notas o detalles (máx. 200 caracteres)"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Entidad
                    </label>
                    <input
                      name="entidad"
                      value={form.entidad}
                      onChange={onChange}
                      placeholder="Proveedor / Persona"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Valor unitario
                    </label>
                    <input
                      name="valorUnitario"
                      value={form.valorUnitario}
                      onChange={onChangeValorUnitario}
                      placeholder="0.00"
                      required
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Método de pago
                    </label>
                    <select
                      name="metodo"
                      value={form.metodo}
                      onChange={onChange}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    >
                      <option value="Efectivo">Efectivo</option>
                      <option value="Transferencia">Transferencia</option>
                      <option value="Tarjeta">Tarjeta</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Estatus
                    </label>
                    <select
                      name="estatus"
                      value={form.estatus}
                      onChange={onChange}
                      className={`w-full rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 ${
                        form.estatus === "Pagado"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-amber-200 bg-amber-50 text-amber-700"
                      }`}
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="Pagado">Pagado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Importe
                    </label>
                    <input
                      name="importe"
                      value={form.importe}
                      readOnly
                      placeholder="0.00"
                      required
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-gray-50 text-gray-600"
                      title="Se calcula automáticamente: unidades × valor unitario"
                    />
                  </div>
                </div>
              </div>
              <div className="px-4 sm:px-5 py-3 border-t border-gray-100 bg-white flex items-center justify-end gap-2 sticky bottom-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
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
                // recrear evento de calendario si existía
                try {
                  if (undo.item?.calendarEventId) {
                    const titulo = `Gasto variable: ${undo.item.producto}`;
                    const partes = [
                      `Unidades: ${undo.item.unidades}`,
                      `Método: ${undo.item.metodo}`,
                      `Importe: ${formatCurrency(undo.item.importe)}`,
                      `Estatus: ${undo.item.estatus}`,
                      `Entidad: ${undo.item.entidad || "-"}`,
                    ];
                    if (undo.item.descripcion)
                      partes.push(`Nota: ${undo.item.descripcion}`);
                    const descripcion = partes.join(" | ");
                    const hora = "10:00";
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
                      hora,
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
                    "No se pudo recrear evento (variables):",
                    e?.response?.status || e?.message || e
                  );
                }
                setRows((prev) => {
                  const next = [...prev];
                  const idx = Math.min(undo.index ?? 0, next.length);
                  next.splice(idx, 0, restored);
                  saveExpenses("variables", next);
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

      {budgetWarn.open && (()=>{ const i = budgetWarn.info||{}; const b = i.snap || { budget:0, spent:0, leftover:0 }; const fmt = (n)=> new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(Number(n||0)); return (
        <div className="fixed inset-0 z-[10000] bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between bg-amber-50/60">
              <h3 className="text-base font-semibold text-amber-800">Presupuesto insuficiente</h3>
              <button onClick={()=> setBudgetWarn({ open:false, context:null, info:null })} className="text-amber-600 hover:text-amber-800">✕</button>
            </div>
            <div className="px-5 py-4 text-sm text-gray-700 space-y-3">
              <p>El egreso marcado excede el presupuesto disponible del mes.</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-gray-50 border"><div className="text-gray-500">Presupuesto</div><div className="font-semibold">{fmt(b.budget)}</div></div>
                <div className="p-2 rounded-lg bg-gray-50 border"><div className="text-gray-500">Gastado</div><div className="font-semibold">{fmt(b.spent)}</div></div>
                <div className="p-2 rounded-lg bg-gray-50 border"><div className="text-gray-500">Disponible</div><div className="font-semibold">{fmt(b.leftover)}</div></div>
                <div className="p-2 rounded-lg bg-gray-50 border"><div className="text-gray-500">Egreso</div><div className="font-semibold text-rose-600">{fmt(i.amount)}</div></div>
              </div>
              <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2">Continuar lo dejará en negativo por {fmt(i.exceed)}.</div>
            </div>
            <div className="px-5 py-3 border-t flex items-center justify-end gap-2 bg-gray-50">
              {budgetWarn.context==='create' ? (
                <>
                  <button onClick={saveAsPendingInstead} className="px-4 py-2 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50 text-sm">Guardar como Pendiente</button>
                  <button onClick={proceedCreateEvenIfExceed} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700">Continuar y guardar</button>
                </>
              ) : (
                <>
                  <button onClick={saveStatusAsPending} className="px-4 py-2 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50 text-sm">Guardar como Pendiente</button>
                  <button onClick={proceedStatusEvenIfExceed} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700">Continuar y guardar</button>
                </>
              )}
            </div>
          </div>
        </div>
      ); })()}

      {/* Modal Editar gasto variable */}
      {editOpen && editData && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto pt-[92px] sm:pt-[112px] pb-6 px-3 sm:px-4 bg-black/40">
          <div className="bg-white w-full max-w-[95vw] sm:max-w-lg rounded-2xl shadow-xl flex flex-col max-h-[90dvh] mx-auto my-6 sm:my-8">
            <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-base font-semibold text-gray-900">
                Editar gasto variable
              </h3>
              <button
                onClick={() => {
                  setEditOpen(false);
                  setEditData(null);
                  setEditIndex(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (editIndex === null || !editData) return;

                const updatedGasto = {
                  ...editData,
                  unidades: Number(editData.unidades || 0),
                  valorUnitario: parseCurrency(editData.valorUnitario),
                  importe: parseCurrency(editData.importe),
                };

                try {
                  const result = await updateGastoVariable(updatedGasto.id, updatedGasto);
                  setRows((prev) => {
                    const next = prev.map((x) => (x.id === result.id ? result : x));
                    saveExpenses("variables", next);
                    return next;
                  });
                } catch (error) {
                  console.error("Error al actualizar gasto variable:", error);
                  // Fallback a la actualización local si la API falla
                  setRows((prev) => {
                    const next = [...prev];
                    next[editIndex] = updatedGasto;
                    saveExpenses("variables", next);
                    return next;
                  });
                }

                setEditOpen(false);
                setEditData(null);
                setEditIndex(null);
              }}
              className="flex-1 flex flex-col"
            >
              <div className="px-4 sm:px-5 py-4 overflow-y-auto overscroll-contain">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Fecha
                    </label>
                    <input
                      type="date"
                      value={editData.fecha}
                      onChange={(e) =>
                        setEditData((d) => ({ ...d, fecha: e.target.value }))
                      }
                      required
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Unidades
                    </label>
                    <input
                      value={editData.unidades}
                      onChange={(e) =>
                        setEditData((d) => ({
                          ...d,
                          unidades: e.target.value.replace(/[^\d]/g, ""),
                        }))
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Producto/Servicio
                    </label>
                    <input
                      value={editData.producto}
                      onChange={(e) =>
                        setEditData((d) => ({ ...d, producto: e.target.value }))
                      }
                      required
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Descripción
                    </label>
                    <textarea
                      rows={2}
                      maxLength={200}
                      value={editData.descripcion || ""}
                      onChange={(e) =>
                        setEditData((d) => ({
                          ...d,
                          descripcion: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Entidad
                    </label>
                    <input
                      value={editData.entidad || ""}
                      onChange={(e) =>
                        setEditData((d) => ({ ...d, entidad: e.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Valor unitario
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editData.valorUnitario ?? ''}
                      onChange={(e) =>
                        setEditData((d) => ({
                          ...d,
                          valorUnitario: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Importe
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editData.importe ?? ''}
                      onChange={(e) =>
                        setEditData((d) => ({ ...d, importe: e.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Método de pago
                    </label>
                    <select
                      value={editData.metodo}
                      onChange={(e) =>
                        setEditData((d) => ({ ...d, metodo: e.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    >
                      <option value="Efectivo">Efectivo</option>
                      <option value="Transferencia">Transferencia</option>
                      <option value="Tarjeta">Tarjeta</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Estatus
                    </label>
                    <select
                      value={editData.estatus}
                      onChange={(e) =>
                        setEditData((d) => ({ ...d, estatus: e.target.value }))
                      }
                      className={`w-full rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 ${
                        editData.estatus === "Pagado"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-amber-200 bg-amber-50 text-amber-700"
                      }`}
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="Pagado">Pagado</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="px-4 sm:px-5 py-3 border-t border-gray-100 bg-white flex items-center justify-between gap-2 sticky bottom-0">
                <button
                  type="button"
                  onClick={() => {
                    setConfirmError("");
                    setConfirmOpen(true);
                  }}
                  className="px-4 py-2 text-sm rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50"
                >
                  Borrar
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditOpen(false);
                      setEditData(null);
                      setEditIndex(null);
                    }}
                    className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ver descripción */}
      {descOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/40 px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-center">
          <div className="bg-white w-full max-w-[95vw] sm:max-w-md rounded-2xl shadow-xl flex flex-col max-h-[90dvh]">
            <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-base font-semibold text-gray-900">
                Descripción
              </h3>
              <button
                onClick={() => setDescOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="px-4 sm:px-5 py-4 overflow-y-auto">
              <p className="text-sm text-gray-800 whitespace-pre-wrap">
                {descText || "Sin descripción"}
              </p>
            </div>
            <div className="px-4 sm:px-5 py-3 border-t border-gray-100 bg-white flex items-center justify-end gap-2 sticky bottom-0">
              <button
                type="button"
                onClick={() => setDescOpen(false)}
                className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmación de borrado */}
      {confirmOpen && editIndex !== null && (
        <div className="fixed inset-0 z-[9999] bg-black/40 px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-center">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">
                Eliminar gasto variable
              </h3>
              <button
                onClick={() => !confirmLoading && setConfirmOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="px-5 py-4 text-sm text-gray-700 space-y-2">
              <p>
                ¿Seguro que deseas eliminar este gasto variable? Esta acción no
                se puede deshacer.
              </p>
              <div className="rounded-lg bg-gray-50 ring-1 ring-gray-200 p-3 text-xs">
                <div>
                  <span className="text-gray-500">Producto/Servicio:</span>{" "}
                  <span className="text-gray-800 font-medium">
                    {rows[editIndex]?.producto}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Unidades:</span>{" "}
                  <span className="text-gray-800">
                    {rows[editIndex]?.unidades}
                  </span>{" "}
                  <span className="text-gray-500 ml-2">Importe:</span>{" "}
                  <span className="text-gray-800 font-medium">
                    {formatCurrency(Number(rows[editIndex]?.importe) || 0)}
                  </span>
                </div>
              </div>
              {confirmError ? (
                <p className="text-[11px] text-rose-600">{confirmError}</p>
              ) : null}
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={confirmLoading}
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (editIndex === null) return;
                  setConfirmLoading(true);
                  setConfirmError("");
                  
                  const toRemove = rows[editIndex];

                  try {
                    await deleteGastoVariable(toRemove.id);
                    
                    setRows((prev) => {
                      const next = prev.filter((_, i) => i !== editIndex);
                      saveExpenses("variables", next);
                      return next;
                    });

                    if (toRemove?.calendarEventId) {
                      await api.delete(`/admin/calendar/events/${toRemove.calendarEventId}`);
                    }

                    setConfirmLoading(false);
                    setConfirmOpen(false);
                    setEditOpen(false);
                    setEditIndex(null);
                    setEditData(null);

                  } catch (error) {
                    console.error("Error al eliminar gasto variable:", error);
                    setConfirmError("No se pudo eliminar el gasto. Inténtalo de nuevo.");
                    setConfirmLoading(false);
                  }
                }}
                className="px-4 py-2 text-sm rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-70"
                disabled={confirmLoading}
              >
                {confirmLoading ? "Eliminando…" : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
