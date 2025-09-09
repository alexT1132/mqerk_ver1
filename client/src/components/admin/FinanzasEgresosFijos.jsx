import React, { useEffect, useMemo, useState } from "react";

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
  "Semestral",
  "Anual",
];

export default function FinanzasEgresosFijos() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [plantillas, setPlantillas] = useState([]);
  const [plantillaModalOpen, setPlantillaModalOpen] = useState(false);
  const [plantillaForm, setPlantillaForm] = useState({ categoria: '', descripcion: '', proveedor: '', frecuencia: 'Mensual', metodo: 'Efectivo', monto_sugerido: '', dia_pago: '', hora_preferida: '', recordar_minutos: 30, auto_evento: true });
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
        } catch(e) { console.warn('No se pudieron cargar plantillas', e?.message || e); }
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

  const getSmartEventTime = (dateStr) => {
    const d = dayjs(dateStr);
    if (d.isSame(dayjs(), "day")) return dayjs().add(1, "hour").format("HH:mm");
    return "09:00";
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
      if (exceed > 0 || snap.budget === 0) {
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
            } catch(_) {}
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
    <section className="px-4 sm:px-6 lg:px-10 py-6 max-w-screen-2xl mx-auto">
      <header className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
            Gastos fijos
          </h1>
          <p className="text-sm text-gray-500">
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
              Registro de gastos fijos
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Total pagado:{" "}
              <span className="font-semibold text-gray-900">
                {formatCurrency(totals.all)}
              </span>
            </p>
          </div>
            <div className="flex items-center gap-2">
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
                    Fecha
                  </th>
                  <th className="text-center font-semibold px-4 py-3 border-r border-gray-200">
                    Hora
                  </th>
                  <th className="text-center font-semibold px-4 py-3 border-r border-gray-200">
                    Categoría
                  </th>
                  <th className="text-center font-semibold px-4 py-3 border-r border-gray-200 w-[60px]">
                    Descripción
                  </th>
                  <th className="text-center font-semibold px-4 py-3 border-r border-gray-200">
                    Proveedor
                  </th>
                  <th className="text-center font-semibold px-4 py-3 border-r border-gray-200">
                    Frecuencia
                  </th>
                  <th className="text-center font-semibold px-1 py-3 border-r border-gray-200">
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
                          onChange={(e) =>
                            setRows((prev) => {
                              const next = prev.map((x, i) =>
                                i === idx
                                  ? { ...x, frecuencia: e.target.value }
                                  : x
                              );
                              saveExpenses("fijos", next);
                              return next;
                            })
                          }
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
                              if (exceed > 0 || snap.budget === 0) {
                                // abrir advertencia y no aplicar cambio aún
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
                            setRows((prev) => {
                              const nextRows = prev.map((x, i) =>
                                i === idx ? { ...x, estatus: next } : x
                              );
                              saveExpenses("fijos", nextRows);
                              return nextRows;
                            });
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
                  <span className="text-xs text-gray-500">{r.fecha}</span>
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
                      onChange={(e) =>
                        setRows((prev) => {
                          const next = prev.map((x, i) =>
                            i === idx ? { ...x, frecuencia: e.target.value } : x
                          );
                          saveExpenses("fijos", next);
                          return next;
                        })
                      }
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
                    onChange={(e) =>
                      setRows((prev) => {
                        const next = prev.map((x, i) =>
                          i === idx ? { ...x, estatus: e.target.value } : x
                        );
                        saveExpenses("fijos", next);
                        return next;
                      })
                    }
                    className={`rounded-md text-[10px] px-1.5 py-0.5 border ${
                      r.estatus === "Pagado"
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
      {showModal && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto p-3 sm:p-4 pt-[92px] sm:pt-[112px] pb-6 bg-black/40">
          <div className="bg-white w-full max-w-[95vw] sm:max-w-lg rounded-2xl shadow-xl flex flex-col max-h-[90dvh] mx-auto my-6 sm:my-8">
            <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-base font-semibold text-gray-900">
                Nuevo gasto fijo
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
                      Hora
                    </label>
                    <input
                      type="time"
                      name="hora"
                      value={form.hora}
                      onChange={onChange}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Categoría
                    </label>
                    <input
                      name="categoria"
                      value={form.categoria}
                      onChange={onChange}
                      placeholder="Renta, Nómina, Servicios…"
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
                      Proveedor
                    </label>
                    <input
                      name="proveedor"
                      value={form.proveedor}
                      onChange={onChange}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Frecuencia
                    </label>
                    <select
                      name="frecuencia"
                      value={form.frecuencia}
                      onChange={onChange}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    >
                      {FRECUENCIAS.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
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
                      Importe
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      name="importe"
                      value={form.importe}
                      onChange={onChangeImporte}
                      placeholder="0.00"
                      required
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
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

      {/* Modal Plantillas de gastos fijos */}
      {plantillaModalOpen && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto p-3 sm:p-4 pt-[92px] sm:pt-[112px] pb-6 bg-black/40">
          <div className="bg-white w-full max-w-[96vw] sm:max-w-3xl rounded-2xl shadow-xl flex flex-col max-h-[90dvh] mx-auto my-6 sm:my-8">
            <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-base font-semibold text-gray-900">Plantillas de gastos fijos</h3>
              <button onClick={() => setPlantillaModalOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="px-4 sm:px-5 py-4 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input placeholder="Categoría" value={plantillaForm.categoria} onChange={e=>setPlantillaForm(f=>({...f,categoria:e.target.value}))} className="rounded-lg border border-gray-200 px-3 py-2 text-sm"/>
                <input placeholder="Proveedor" value={plantillaForm.proveedor} onChange={e=>setPlantillaForm(f=>({...f,proveedor:e.target.value}))} className="rounded-lg border border-gray-200 px-3 py-2 text-sm"/>
                <input placeholder="Monto sugerido" value={plantillaForm.monto_sugerido} onChange={e=>setPlantillaForm(f=>({...f,monto_sugerido:e.target.value.replace(/[^\d.]/g,'')}))} className="rounded-lg border border-gray-200 px-3 py-2 text-sm"/>
                <select value={plantillaForm.frecuencia} onChange={e=>setPlantillaForm(f=>({...f,frecuencia:e.target.value}))} className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
                  {FRECUENCIAS.map(f=> <option key={f} value={f}>{f}</option>)}
                </select>
                <select value={plantillaForm.metodo} onChange={e=>setPlantillaForm(f=>({...f,metodo:e.target.value}))} className="rounded-lg border border-gray-200 px-3 py-2 text-sm">
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Tarjeta">Tarjeta</option>
                </select>
                <input placeholder="Descripción (opcional)" value={plantillaForm.descripcion} onChange={e=>setPlantillaForm(f=>({...f,descripcion:e.target.value}))} className="rounded-lg border border-gray-200 px-3 py-2 text-sm md:col-span-2"/>
                <input type="number" min={1} max={31} placeholder="Día de pago (1-31, opcional)" value={plantillaForm.dia_pago} onChange={e=>setPlantillaForm(f=>({...f,dia_pago:e.target.value}))} className="rounded-lg border border-gray-200 px-3 py-2 text-sm"/>
                <input type="time" placeholder="Hora preferida (opcional)" value={plantillaForm.hora_preferida} onChange={e=>setPlantillaForm(f=>({...f,hora_preferida:e.target.value}))} className="rounded-lg border border-gray-200 px-3 py-2 text-sm"/>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700">Recordar (min)</label>
                  <input type="number" min={0} value={plantillaForm.recordar_minutos} onChange={e=>setPlantillaForm(f=>({...f,recordar_minutos:Number(e.target.value)||0}))} className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm"/>
                </div>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={!!plantillaForm.auto_evento} onChange={e=>setPlantillaForm(f=>({...f,auto_evento:e.target.checked}))}/>
                  Crear evento de calendario automático
                </label>
                <button onClick={async ()=>{
                  try {
                    const payload = { ...plantillaForm, monto_sugerido: Number((plantillaForm.monto_sugerido||'').replace(/,/g,'')) || 0, dia_pago: plantillaForm.dia_pago?Number(plantillaForm.dia_pago):null, recordar_minutos: Number(plantillaForm.recordar_minutos)||30, auto_evento: !!plantillaForm.auto_evento };
                    if (!payload.categoria) return;
                    const saved = await createPlantilla(payload);
                    setPlantillas(prev=>[saved, ...prev]);
                    setPlantillaForm({ categoria: '', descripcion: '', proveedor: '', frecuencia: 'Mensual', metodo: 'Efectivo', monto_sugerido: '', dia_pago: '', hora_preferida: '', recordar_minutos: 30, auto_evento: true });
                  } catch(e) { console.error('crear plantilla', e); }
                }} className="rounded-lg bg-indigo-600 text-white px-3 py-2 text-sm">Agregar plantilla</button>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <table className="w-full text-sm">
                  <thead className="text-gray-600">
                    <tr>
                      <th className="text-left px-2 py-2">Categoría</th>
                      <th className="text-left px-2 py-2">Proveedor</th>
                      <th className="text-right px-2 py-2">Monto</th>
                      <th className="text-left px-2 py-2">Frecuencia</th>
                      <th className="px-2 py-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plantillas.length===0 ? (
                      <tr><td colSpan={5} className="text-center text-gray-500 px-2 py-4">Sin plantillas</td></tr>
                    ) : plantillas.map(p => (
                      <tr key={p.id} className="border-t">
                        <td className="px-2 py-2">{p.categoria}</td>
                        <td className="px-2 py-2">{p.proveedor || '-'}</td>
                        <td className="px-2 py-2 text-right">{new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(Number(p.monto_sugerido||0))}</td>
                        <td className="px-2 py-2">{p.frecuencia}{p.dia_pago?` (${p.dia_pago})`:''}</td>
                        <td className="px-2 py-2">
                          <div className="flex items-center gap-2 justify-end">
                            <button onClick={async()=>{
                              try {
                                // Permitir elegir fecha/estatus al instanciar rápidamente
                                const chosenDate = window.prompt('Fecha del egreso (YYYY-MM-DD). Déjalo vacío para usar sugerida por plantilla:', '');
                                const chosenStatus = window.prompt('Estatus (Pagado/Pendiente)', 'Pendiente');
                                const body = {};
                                if (chosenDate && /^\d{4}-\d{2}-\d{2}$/.test(chosenDate)) body.fecha = chosenDate;
                                if (chosenStatus && (chosenStatus==='Pagado' || chosenStatus==='Pendiente')) body.estatus = chosenStatus;
                                const gasto = await instanciarDesdePlantilla(p.id, body);
                                setRows(prev=>[{ ...gasto, calendarEventId: gasto.calendar_event_id ?? gasto.calendarEventId }, ...prev]);
                                // Crear evento si la plantilla sugiere auto_evento
                                try {
                                  if (p.auto_evento) {
                                    const hora = p.hora_preferida || getSmartEventTime(gasto.fecha);
                                    const evRes = await api.post('/admin/calendar/events', {
                                      titulo: `Pagar ${gasto.categoria}`,
                                      descripcion: `Proveedor: ${gasto.proveedor||'-'} | Monto: ${formatCurrency(gasto.importe)} | Desde plantilla` ,
                                      fecha: gasto.fecha,
                                      hora,
                                      tipo: 'finanzas',
                                      prioridad: 'media',
                                      recordarMinutos: Number(p.recordar_minutos)||30,
                                      completado: false,
                                    });
                                    const ev = evRes?.data || {};
                                    const evId = ev.id || ev.eventId || ev.event?.id;
                                    if (evId && gasto?.id) {
                                      try {
                                        const updated = await updateGastoFijo(gasto.id, { calendar_event_id: evId });
                                        setRows(prev => prev.map(x => x.id === updated.id ? { ...updated, calendarEventId: updated.calendar_event_id ?? evId } : x));
                                        saveExpenses('fijos', rows);
                                      } catch(_) {}
                                    }
                                  }
                                } catch(err) { console.warn('evento plantilla', err?.response?.status || err?.message || err); }
                              } catch(e) { console.error('instanciar', e); }
                            }} className="text-emerald-700 hover:text-emerald-800 text-xs">Crear egreso</button>
                            <button onClick={async()=>{
                              try { await deletePlantilla(p.id); setPlantillas(prev=>prev.filter(x=>x.id!==p.id)); } catch(e) { console.error('delete plantilla', e); }
                            }} className="text-rose-700 hover:text-rose-800 text-xs">Eliminar</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal presupuesto insuficiente */}
      {budgetWarn.open && (
        <div className="fixed inset-0 z-[10000] overflow-y-auto pt-[128px] sm:pt-[148px] pb-6 px-3 sm:px-4 bg-black/40">
          <div className="bg-white w-full max-w-[95vw] sm:max-w-md rounded-2xl shadow-xl mx-auto my-6 sm:my-8 flex flex-col max-h-[90dvh]">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">
                Presupuesto insuficiente
              </h3>
              <button
                onClick={() =>
                  setBudgetWarn({ open: false, context: null, info: null })
                }
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="px-5 py-4 text-sm text-gray-700 space-y-2">
              {(() => {
                const i = budgetWarn.info || {};
                const b = i.snap || { budget: 0, spent: 0, leftover: 0 };
                return (
                  <>
                    <p>
                      Mes: <strong className="text-gray-900">{i.month}</strong>
                    </p>
                    <p>
                      Presupuesto:{" "}
                      <strong className="text-indigo-600">
                        {new Intl.NumberFormat("es-MX", {
                          style: "currency",
                          currency: "MXN",
                        }).format(b.budget || 0)}
                      </strong>
                    </p>
                    <p>
                      Gastado:{" "}
                      <strong className="text-rose-600">
                        {new Intl.NumberFormat("es-MX", {
                          style: "currency",
                          currency: "MXN",
                        }).format(b.spent || 0)}
                      </strong>
                    </p>
                    <p>
                      Disponible:{" "}
                      <strong className="text-emerald-600">
                        {new Intl.NumberFormat("es-MX", {
                          style: "currency",
                          currency: "MXN",
                        }).format(b.leftover || 0)}
                      </strong>
                    </p>
                    <p className="mt-1">
                      Este egreso:{" "}
                      <strong className="text-gray-900">
                        {new Intl.NumberFormat("es-MX", {
                          style: "currency",
                          currency: "MXN",
                        }).format(i.amount || 0)}
                      </strong>
                    </p>
                    <p className="text-rose-700 font-medium">
                      Excedente:{" "}
                      {new Intl.NumberFormat("es-MX", {
                        style: "currency",
                        currency: "MXN",
                      }).format(Math.max(0, i.exceed || 0))}
                    </p>
                    <p className="text-xs text-gray-500">
                      Puedes continuar y registrar el egreso, cambiarlo a
                      pendiente o ajustar el presupuesto.
                    </p>
                  </>
                );
              })()}
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-end gap-2">
              <Link
                to="/administrativo/finanzas/egresos/presupuesto"
                onClick={() =>
                  setBudgetWarn({ open: false, context: null, info: null })
                }
                className="px-3 py-1.5 text-sm rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              >
                Ajustar presupuesto
              </Link>
              {budgetWarn.context === "create" ? (
                <>
                  <button
                    onClick={saveAsPendingInstead}
                    className="px-3 py-1.5 text-sm rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50"
                  >
                    Guardar como Pendiente
                  </button>
                  <button
                    onClick={proceedCreateEvenIfExceed}
                    className="px-3 py-1.5 text-sm rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                  >
                    Continuar y guardar
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() =>
                      setBudgetWarn({ open: false, context: null, info: null })
                    }
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Ver descripción */}
      {descOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/40 p-3 sm:p-4 flex items-center justify-center">
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

      {/* Modal Editar egreso fijo */}
      {editOpen && editData && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto p-3 sm:p-4 pt-[92px] sm:pt-[112px] pb-6 bg-black/40">
          <div className="bg-white w-full max-w-[95vw] sm:max-w-lg rounded-2xl shadow-xl flex flex-col max-h-[90dvh] mx-auto my-6 sm:my-8">
            <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-base font-semibold text-gray-900">
                Editar gasto fijo
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
              onSubmit={(e) => {
                e.preventDefault();
                if (editIndex === null) return;
                const amount = Number(editData.importe) || 0;
                setRows((prev) => {
                  const next = prev.map((x, i) =>
                    i === editIndex ? { ...editData, importe: amount } : x
                  );
                  saveExpenses("fijos", next);
                  return next;
                });
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
                      Hora
                    </label>
                    <input
                      type="time"
                      value={editData.hora || ""}
                      onChange={(e) =>
                        setEditData((d) => ({ ...d, hora: e.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Categoría
                    </label>
                    <input
                      value={editData.categoria}
                      onChange={(e) =>
                        setEditData((d) => ({
                          ...d,
                          categoria: e.target.value,
                        }))
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
                      Proveedor
                    </label>
                    <input
                      value={editData.proveedor || ""}
                      onChange={(e) =>
                        setEditData((d) => ({
                          ...d,
                          proveedor: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Frecuencia
                    </label>
                    <select
                      value={editData.frecuencia}
                      onChange={(e) =>
                        setEditData((d) => ({
                          ...d,
                          frecuencia: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    >
                      {FRECUENCIAS.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
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
                      Importe
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editData.importe}
                      onChange={(e) =>
                        setEditData((d) => ({
                          ...d,
                          importe: Number(e.target.value || 0),
                        }))
                      }
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
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

      {/* Modal Confirmación de borrado */}
      {confirmOpen && editIndex !== null && (
        <div className="fixed inset-0 z-[12000] bg-black/40 px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-center">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">
                Eliminar gasto fijo
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
                ¿Seguro que deseas eliminar este egreso fijo? Esta acción no se
                puede deshacer.
              </p>
              <div className="rounded-lg bg-gray-50 ring-1 ring-gray-200 p-3 text-xs">
                <div>
                  <span className="text-gray-500">Categoría:</span>{" "}
                  <span className="text-gray-800 font-medium">
                    {rows[editIndex]?.categoria}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Fecha:</span>{" "}
                  <span className="text-gray-800">
                    {rows[editIndex]?.fecha}
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
                  // Capturar item a eliminar para borrar en calendario si aplica
                  const toRemove = rows[editIndex];
                  try {
                    // Eliminar de la API si tiene ID
                    if (toRemove?.id) {
                      await deleteGastoFijo(toRemove.id);
                    }
                    
                    // Eliminar de la lista local + persistir + toast undo
                    setRows((prev) => {
                      const removed = prev[editIndex];
                      const next = prev.filter((_, i) => i !== editIndex);
                      saveExpenses("fijos", next);
                      if (undo.timer) clearTimeout(undo.timer);
                      const t = setTimeout(
                        () =>
                          setUndo({
                            show: false,
                            item: null,
                            index: null,
                            timer: null,
                          }),
                        7000
                      );
                      setUndo({
                        show: true,
                        item: removed,
                        index: editIndex,
                        timer: t,
                      });
                      return next;
                    });
                    
                    // Refrescar presupuesto si el gasto eliminado estaba Pagado
                    if (toRemove?.estatus === "Pagado") {
                      const month = dayjs(toRemove.fecha).format("YYYY-MM");
                      await refreshBudgetSummary(month);
                    }
                    
                    // Intentar borrar evento de calendario en background
                    try {
                      if (toRemove?.calendarEventId) {
                        await api.delete(
                          `/admin/calendar/events/${toRemove.calendarEventId}`
                        );
                      }
                    } catch (e) {
                      console.warn(
                        "No se pudo borrar evento calendario (fijo):",
                        e?.response?.status || e?.message || e
                      );
                    }
                  } catch (error) {
                    console.error('Error al eliminar gasto fijo:', error);
                    setConfirmError('Error al eliminar el gasto');
                  }
                  setConfirmLoading(false);
                  setConfirmOpen(false);
                  setEditOpen(false);
                  setEditIndex(null);
                  setEditData(null);
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
