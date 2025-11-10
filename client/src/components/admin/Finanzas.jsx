import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../api/axios.js';
import dayjs from 'dayjs';
import { getBudgetSnapshot, rolloverIfNeeded, LOW_REMAINING_THRESHOLD, sumExpensesMonth } from '../../utils/budgetStore.js';
import { getResumenMensual } from '../../service/finanzasPresupuesto.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function FinanzasHome() {
  const location = useLocation();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [ingresos, setIngresos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEgresosMenu, setShowEgresosMenu] = useState(false);
  const [egresosSnap, setEgresosSnap] = useState({ budget: 0, spent: 0, leftover: 0, reductionPct: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true); setError('');
        if (!authLoading && isAuthenticated && user?.role === 'admin') {
          const res = await api.get('/finanzas/ingresos');
          setIngresos(res.data?.data || []);
        } else {
          setIngresos([]);
        }
      } catch (e) {
        setError('No se pudieron cargar los ingresos');
      } finally { setLoading(false); }
    };
    load();
  // presupuesto egresos: aplicar rollover y tomar snapshot del mes (preferir backend)
  rolloverIfNeeded();
  const m = dayjs().format('YYYY-MM');
  (async () => {
    try {
  const snap = await getResumenMensual(m);
  const localSpent = sumExpensesMonth(m);
  const budget = Number(snap.budget || 0);
  const spent = Math.max(Number(snap.spent || 0), localSpent);
  const leftover = Math.max(0, budget - spent);
  setEgresosSnap({ budget, spent, leftover, reductionPct: 0 });
    } catch {
      setEgresosSnap(getBudgetSnapshot(m));
    }
  })();
  }, [authLoading, isAuthenticated, user?.role]);

  const fmtMoney = (n) => Number(n || 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
  const metrics = useMemo(() => {
    const now = dayjs();
    const prev = now.subtract(1, 'month');
    let totalMonth = 0, countMonth = 0, totalPrev = 0;
    for (const r of ingresos) {
      const d = dayjs(r.fecha);
      const amt = Number(r.importe) || 0;
      if (d.isSame(now, 'month')) { totalMonth += amt; countMonth++; }
      else if (d.isSame(prev, 'month')) { totalPrev += amt; }
    }
    const growthRaw = totalPrev > 0 ? ((totalMonth - totalPrev) / totalPrev) * 100 : 0; // 0 si no hay base
    const growthPositive = Math.max(0, growthRaw); // solo mostrar positivos
    const avg = countMonth > 0 ? totalMonth / countMonth : 0;
    const prevLabel = prev.format('MMMM YYYY');
    return { totalMonth, countMonth, totalPrev, growthRaw, growthPositive, avg, prevLabel };
  }, [ingresos]);
  
  return (
    <div className="relative w-full h-full min-h-[calc(100vh-80px)] flex flex-col bg-white">
      {/* Header con título grande pegado arriba */}
      <div className="pt-1 xs:pt-1 sm:pt-2 lg:pt-2 pb-0 px-2 xs:px-3 sm:px-4">
        <div className="w-full max-w-7xl mx-auto">
          <div className="text-center mb-3">
            <h2 className="relative inline-block text-xl xs:text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-gray-800/90 mb-1 xs:mb-2 tracking-tight leading-tight font-[system-ui,-apple-system,'Segoe_UI','Roboto','Helvetica_Neue',Arial,sans-serif]">
              Finanzas
              <span className="block absolute left-1/2 -translate-x-1/2 bottom-0 w-2/3 h-0.5 bg-gradient-to-r from-indigo-500/80 to-purple-500/80 rounded-full origin-center scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></span>
            </h2>
            <div className="w-8 xs:w-12 sm:w-16 lg:w-20 h-0.5 xs:h-1 bg-gradient-to-r from-indigo-500/80 to-purple-500/80 mx-auto mb-1 xs:mb-2 sm:mb-3 rounded-full"></div>
            <p className="text-[10px] xs:text-xs sm:text-sm lg:text-base text-gray-600/90 font-medium max-w-md mx-auto leading-relaxed">
              Gestiona los ingresos y egresos de MQerKAcademy
            </p>
          </div>
        </div>
      </div>

      {/* Grid de tarjetas estilo dashboard */}
      <div className="flex-1 flex flex-col justify-center items-center py-4 sm:py-6">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-12 auto-rows-fr">
            
            {/* Tarjeta Ingresos */}
            <Link
              to="/administrativo/finanzas/ingresos"
              className="group relative bg-white rounded-2xl border border-gray-200/50 hover:border-emerald-200 shadow-sm hover:shadow-xl transition-all duration-500 p-4 xs:p-5 sm:p-6 lg:p-8 min-h-[180px] sm:min-h-[220px] lg:min-h-[280px] flex flex-col justify-between overflow-hidden"
            >
              {/* Línea decorativa superior */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400"></div>
              
              {/* Patrón sutil de fondo */}
              <div className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity duration-500">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23059669' fill-opacity='1'%3E%3Ccircle cx='3' cy='3' r='0.5'/%3E%3Ccircle cx='17' cy='17' r='0.5'/%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundSize: '20px 20px'
                }}></div>
              </div>

              {/* Header */}
              <div className="relative z-10 flex items-start justify-between mb-4 sm:mb-6">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 rounded-xl bg-emerald-50 border border-emerald-100 group-hover:bg-emerald-100 group-hover:border-emerald-200 transition-colors duration-300">
                    {/* Icono: Entrada (flecha hacia abajo a una base) */}
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 4v10m0 0l-3-3m3 3l3-3M4 20h16" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-800 mb-0.5">Ingresos</h3>
                    <p className="text-xs sm:text-sm font-medium text-emerald-600 uppercase tracking-wider">Gestión Financiera</p>
                  </div>
                </div>
                
                <div className="hidden sm:block text-right">
                  <div className="text-xl sm:text-2xl font-black text-gray-700 mb-1">{loading ? '…' : fmtMoney(metrics.totalMonth)}</div>
                  <div className="text-[10px] sm:text-xs text-gray-500 bg-gray-50 px-2 py-0.5 sm:py-1 rounded-md">Este mes</div>
                </div>
              </div>

              {/* Contenido principal */}
              <div className="relative z-10 flex-1 mb-4 sm:mb-6">
                {/* Descripción: resumida en móvil */}
                <p className="hidden sm:block text-gray-600 leading-relaxed mb-6">
                  Administra cobros, depósitos y conciliación bancaria. Control completo de todos los ingresos de la academia.
                </p>
                <p className="block sm:hidden text-[11px] text-gray-600 mb-3">Resumen de ingresos de la academia</p>

                {/* Estadísticas en línea */}
                {/* Compacto en móvil */}
                <div className="grid sm:hidden grid-cols-2 gap-2 bg-gray-50 rounded-lg p-2 mb-4">
                  <div className="text-center">
                    <div className="text-base font-bold text-emerald-600">{loading ? '…' : metrics.countMonth}</div>
                    <div className="text-[10px] text-gray-500">Transacc.</div>
                  </div>
                  <div className="text-center">
                    <div
                      title={loading ? '' : `Actual: ${fmtMoney(metrics.totalMonth)} | Anterior (${metrics.prevLabel}): ${fmtMoney(metrics.totalPrev)}`}
                      className={`text-base font-bold ${loading ? '' : (metrics.growthRaw > 0 ? 'text-emerald-600' : (metrics.growthRaw < 0 ? 'text-rose-600' : 'text-gray-400'))}`}
                    >
                      {loading ? '…' : `${metrics.growthRaw.toFixed(0)}%`}
                    </div>
                    <div className="text-[10px] text-gray-500">Crecim.</div>
                    {!loading && metrics.growthRaw < 0 ? (
                      <div className="mt-0.5 text-[10px] text-rose-600">{`${Math.abs(Math.min(0, metrics.growthRaw)).toFixed(0)}% menos que el mes anterior`}</div>
                    ) : null}
                  </div>
                </div>

                {/* Completo en desktop */}
                <div className="hidden sm:flex items-center justify-between bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="text-center">
                    <div className="text-lg font-bold text-emerald-600">{loading ? '…' : metrics.countMonth}</div>
                    <div className="text-xs text-gray-500">Transacciones</div>
                  </div>
                  <div className="w-px h-8 bg-gray-200"></div>
                  <div className="text-center">
                    <div
                      title={loading ? '' : `Actual: ${fmtMoney(metrics.totalMonth)} | Anterior (${metrics.prevLabel}): ${fmtMoney(metrics.totalPrev)}`}
                      className={`text-lg font-bold ${loading ? '' : (metrics.growthRaw > 0 ? 'text-emerald-600' : (metrics.growthRaw < 0 ? 'text-rose-600' : 'text-gray-400'))}`}
                    >
                      {loading ? '…' : `${metrics.growthRaw.toFixed(0)}%`}
                    </div>
                    <div className="text-xs text-gray-500">Crecimiento vs mes anterior</div>
                    {!loading && metrics.growthRaw < 0 ? (
                      <div className="mt-0.5 text-[11px] text-rose-600">{`${Math.abs(Math.min(0, metrics.growthRaw)).toFixed(0)}% menos que el mes anterior`}</div>
                    ) : null}
                  </div>
                  <div className="w-px h-8 bg-gray-200"></div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-emerald-600">{loading ? '…' : fmtMoney(metrics.avg)}</div>
                    <div className="text-xs text-gray-500">Ticket promedio</div>
                  </div>
                </div>
              </div>

              {/* Footer */}
               <div className="relative z-10 flex items-center justify-between">
                 <div className="flex items-center text-emerald-600 font-medium group-hover:text-emerald-700 transition-colors">
                   <span className="hidden sm:inline mr-2">Administrar</span>
                   <svg className="w-4 h-4 sm:w-4 sm:h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span className="text-xs text-gray-500">Sistema activo</span>
                </div>
              </div>

              {/* Hover effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/0 to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            </Link>

            {/* Tarjeta Egresos (abre selector) */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setShowEgresosMenu(true)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowEgresosMenu(true); } }}
              className="group relative bg-white rounded-2xl border border-gray-200/50 hover:border-rose-200 shadow-sm hover:shadow-xl transition-all duration-500 p-3 xs:p-4 sm:p-6 lg:p-8 min-h-[180px] sm:min-h-[220px] lg:min-h-[280px] flex flex-col justify-between overflow-hidden cursor-pointer"
            >
              {/* Línea decorativa superior */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-rose-400 to-pink-400"></div>
              
              {/* Patrón sutil de fondo */}
              <div className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity duration-500">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23dc2626' fill-opacity='1'%3E%3Cpath d='M10 10l-2-2 2-2 2 2-2 2zm0 0l2 2-2 2-2-2 2-2z'/%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundSize: '20px 20px'
                }}></div>
              </div>

              {/* Header */}
              <div className="relative z-10 flex items-start justify-between mb-1 sm:mb-4">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 rounded-xl bg-rose-50 border border-rose-100 group-hover:bg-rose-100 group-hover:border-rose-200 transition-colors duration-300">
                    {/* Icono: Salida (flecha hacia arriba desde una base) */}
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 20V10m0 0l-3 3m3-3l3 3M4 4h16" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-800 mb-0.5">Egresos</h3>
                    <p className="text-xs sm:text-sm font-medium text-rose-600 uppercase tracking-wider">Control de Gastos</p>
                  </div>
                </div>
                {/* Indicadores de presupuesto (dot móvil + badge desktop) */}
                <div className="flex items-center gap-2">
                  {/* Dot solo móvil */}
                  {egresosSnap.budget > 0 && egresosSnap.leftover <= LOW_REMAINING_THRESHOLD && egresosSnap.leftover >= 0 && (
                    <span
                      title="Presupuesto bajo"
                      className="inline-block w-2 h-2 rounded-full bg-rose-500 sm:hidden"
                    />
                  )}
                  {/* Desktop badges */}
                  {egresosSnap.spent > egresosSnap.budget ? (
                    <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-100 text-rose-800 ring-1 ring-rose-300">
                      Excedente
                    </span>
                  ) : (
                    egresosSnap.budget > 0 && egresosSnap.leftover <= LOW_REMAINING_THRESHOLD && egresosSnap.leftover >= 0 ? (
                      <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 ring-1 ring-rose-200">
                        Presupuesto bajo
                      </span>
                    ) : (
                      egresosSnap.budget === 0 && (
                        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200" title="Asigna presupuesto para este mes">
                          Sin presupuesto
                        </span>
                      )
                    )
                  )}
                </div>
              </div>

              {/* Contenido principal */}
              <div className="relative z-10 flex-1 mb-1 sm:mb-4">
                {/* Descripción: resumida en móvil */}
                <p className="hidden sm:block text-gray-600 leading-relaxed mb-6">
                  Controla gastos, proveedores y recibos. Administración completa de todos los egresos operativos de la academia.
                </p>
                <p className="hidden sm:hidden text-[11px] text-gray-600 mb-3">Gastos operativos y control de presupuestos</p>

                {/* Estadísticas en línea */}
                {/* Compacto en móvil */}
                <div className="grid sm:hidden grid-cols-3 gap-1.5 bg-gray-50 rounded-lg p-1.5">
                  <div className="text-center">
          <div className="text-[13px] font-bold text-rose-600">{fmtMoney(egresosSnap.spent)}</div>
          <div className="text-[9px] text-gray-500">Gastos</div>
                  </div>
                  <div className="text-center">
          <div className="text-[13px] font-bold text-indigo-600">{fmtMoney(egresosSnap.budget)}</div>
          <div className="text-[9px] text-gray-500">Presup.</div>
                  </div>
                  <div className="text-center">
          <div className={`text-[13px] font-bold ${egresosSnap.leftover <= LOW_REMAINING_THRESHOLD ? 'text-rose-600' : 'text-emerald-600'}`}>{fmtMoney(egresosSnap.leftover)}</div>
          <div className="text-[9px] text-gray-500">Disp.</div>
                  </div>
                </div>
                {/* Barra de progreso compacta (solo móvil) */}
                <div className="sm:hidden mt-1">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        egresosSnap.budget > 0
                          ? egresosSnap.spent / egresosSnap.budget <= 0.7
                            ? 'bg-emerald-500'
                            : egresosSnap.spent <= egresosSnap.budget
                              ? 'bg-amber-500'
                              : 'bg-rose-600'
                          : egresosSnap.spent > 0
                            ? 'bg-rose-600'
                            : 'bg-gray-300'
                      }`}
                      style={{
                        width: `${Math.min(100, egresosSnap.budget > 0 ? Math.round((egresosSnap.spent / egresosSnap.budget) * 100) : (egresosSnap.spent > 0 ? 100 : 0))}%`
                      }}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-gray-500">
                    <span>
                      Uso {Math.min(100, egresosSnap.budget > 0 ? Math.round((egresosSnap.spent / egresosSnap.budget) * 100) : (egresosSnap.spent > 0 ? 100 : 0))}%
                    </span>
                    {egresosSnap.spent > egresosSnap.budget && (
                      <span className="text-rose-600 font-semibold">
                        Excedente {fmtMoney(egresosSnap.spent - egresosSnap.budget)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Completo en desktop */}
                <div className="hidden sm:flex items-center justify-between bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="text-center">
                    <div className="text-lg font-bold text-rose-600">{fmtMoney(egresosSnap.spent)}</div>
                    <div className="text-xs text-gray-500">Gastos</div>
                  </div>
                  <div className="w-px h-8 bg-gray-200"></div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-indigo-600">{fmtMoney(egresosSnap.budget)}</div>
                    <div className="text-xs text-gray-500">Presupuesto</div>
                  </div>
                  <div className="w-px h-8 bg-gray-200"></div>
                  <div className="text-center">
                    <div className={`text-lg font-bold ${egresosSnap.leftover <= LOW_REMAINING_THRESHOLD ? 'text-rose-600' : 'text-emerald-600'}`}>{fmtMoney(egresosSnap.leftover)}</div>
                    <div className="text-xs text-gray-500">Disponible</div>
                  </div>
                  {egresosSnap.spent > egresosSnap.budget && (
                    <>
                      <div className="w-px h-8 bg-gray-200"></div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-rose-700">{fmtMoney(Math.max(0, egresosSnap.spent - egresosSnap.budget))}</div>
                        <div className="text-xs text-gray-500">Excedente</div>
                      </div>
                    </>
                  )}
                </div>
              </div>

      {/* Footer: igual que Ingresos */}
         <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center text-rose-600 font-medium group-hover:text-rose-700 transition-colors">
      <span className="hidden sm:inline mr-2">Administrar</span>
                  <svg className="w-4 h-4 sm:w-4 sm:h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                  <span className="text-xs text-gray-500">Sistema activo</span>
                </div>
              </div>

              {/* Alert badge when low budget */}
              {/* Badge retirado para evitar solapamientos; indicador sutil en el encabezado */}

              {/* Hover effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-rose-50/0 to-rose-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            </div>

            {/* (Tarjeta Pagos Asesores eliminada: ahora dentro del modal de Egresos) */}

          </div>
        </div>
      </div>
      {/* Selector de subopciones Egresos */}
      {showEgresosMenu && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-4 bg-black/40"
          onClick={(e) => { if (e.target === e.currentTarget) setShowEgresosMenu(false); }}
        >
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Egresos</h3>
              <button onClick={() => setShowEgresosMenu(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="p-5 grid grid-cols-1 gap-3">
              <Link
                to="/administrativo/finanzas/egresos/fijos"
                className="group rounded-xl bg-gradient-to-br from-rose-50 to-white border border-rose-100 hover:border-rose-200 hover:shadow-md transition-all p-4 flex items-center justify-between"
                onClick={() => setShowEgresosMenu(false)}
              >
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-rose-700 text-sm font-semibold">F</span>
                  <div>
                    <div className="text-sm font-semibold text-rose-700">Gastos fijos</div>
                    <div className="text-xs text-gray-600">Costos recurrentes: renta, nómina, servicios.</div>
                  </div>
                </div>
                <span className="h-8 w-8 rounded-full bg-white/70 border border-rose-100 flex items-center justify-center text-rose-600">→</span>
              </Link>

              <Link
                to="/administrativo/finanzas/egresos/variables"
                className="group rounded-xl bg-gradient-to-br from-amber-50 to-white border border-amber-100 hover:border-amber-200 hover:shadow-md transition-all p-4 flex items-center justify-between"
                onClick={() => setShowEgresosMenu(false)}
              >
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-sm font-semibold">V</span>
                  <div>
                    <div className="text-sm font-semibold text-amber-700">Gastos variables</div>
                    <div className="text-xs text-gray-600">Compras, materiales, logística y otros.</div>
                  </div>
                </div>
                <span className="h-8 w-8 rounded-full bg-white/70 border border-amber-100 flex items-center justify-center text-amber-600">→</span>
              </Link>

              <Link
                to="/administrativo/finanzas/egresos/presupuesto"
                className="group rounded-xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 hover:border-indigo-200 hover:shadow-md transition-all p-4 flex items-center justify-between"
                onClick={() => setShowEgresosMenu(false)}
              >
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold">P</span>
                  <div>
                    <div className="text-sm font-semibold text-indigo-700">Presupuesto</div>
                    <div className="text-xs text-gray-600">Asigna y controla el presupuesto mensual de egresos.</div>
                  </div>
                </div>
                <span className="h-8 w-8 rounded-full bg-white/70 border border-indigo-100 flex items-center justify-center text-indigo-600">→</span>
              </Link>

              <Link
                to="/administrativo/finanzas/pagos-asesores"
                className="group rounded-xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 hover:border-indigo-200 hover:shadow-md transition-all p-4 flex items-center justify-between"
                onClick={() => setShowEgresosMenu(false)}
              >
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold">A</span>
                  <div>
                    <div className="text-sm font-semibold text-indigo-700">Pagos asesores</div>
                    <div className="text-xs text-gray-600">Honorarios y comisiones de asesores.</div>
                  </div>
                </div>
                <span className="h-8 w-8 rounded-full bg-white/70 border border-indigo-100 flex items-center justify-center text-indigo-600">→</span>
              </Link>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-end">
              <button onClick={() => setShowEgresosMenu(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}