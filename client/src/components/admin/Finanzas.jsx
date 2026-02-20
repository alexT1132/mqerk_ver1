import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
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
      <div className="pt-6 xs:pt-8 sm:pt-10 md:pt-12 pb-0 px-4 sm:px-6 2xl:px-4">
        <div className="w-full max-w-7xl xl:max-w-screen-2xl 2xl:max-w-none mx-auto">
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="relative inline-block text-2xl xs:text-3xl sm:text-4xl lg:text-5xl xl:text-5xl 2xl:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 mb-2 sm:mb-3 lg:mb-4 tracking-tight leading-[1.1]">
              <span className="inline-block pb-1">Finanzas</span>
            </h2>
            <div className="w-12 xs:w-16 sm:w-20 lg:w-24 xl:w-24 2xl:w-28 h-1 sm:h-1.5 lg:h-2 bg-gradient-to-r from-slate-400 via-slate-500 to-slate-600 mx-auto mb-2 sm:mb-3 lg:mb-4 rounded-full"></div>
            <p className="text-xs sm:text-sm lg:text-base xl:text-base 2xl:text-lg text-slate-600 font-semibold max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-lg mx-auto leading-relaxed">
              Gestiona los ingresos y egresos de MQerKAcademy
            </p>
          </div>
        </div>
      </div>

      {/* Grid de tarjetas: móvil 2 cols cuadradas/organizadas; desktop igual que antes */}
      <div className="flex-1 flex flex-col justify-center items-center py-4 sm:py-6 2xl:py-8">
        <div className="w-full max-w-6xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-2 xs:px-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 xs:gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12 2xl:gap-14 auto-rows-fr">

            {/* Tarjeta Ingresos */}
            <Link
              to="/administrativo/finanzas/ingresos"
              className="group relative bg-white rounded-xl sm:rounded-2xl border-2 border-slate-200 hover:border-emerald-300 shadow-lg hover:shadow-2xl transition-all duration-300 p-3 xs:p-4 sm:p-6 lg:p-8 xl:p-9 2xl:p-10 min-h-[240px] xs:min-h-[260px] sm:min-h-[220px] lg:min-h-[320px] xl:min-h-[380px] 2xl:min-h-[440px] flex flex-col justify-between overflow-hidden"
            >
              {/* Línea decorativa superior */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400"></div>

              {/* Patrón sutil de fondo */}
              <div className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity duration-500">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23059669' fill-opacity='1'%3E%3Ccircle cx='3' cy='3' r='0.5'/%3E%3Ccircle cx='17' cy='17' r='0.5'/%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundSize: '20px 20px'
                }}></div>
              </div>

              {/* Header: compacto en móvil, alineado */}
              <div className="relative z-10 flex items-start justify-between gap-2 mb-3 xs:mb-4 sm:mb-6 lg:mb-6 xl:mb-7 2xl:mb-8">
                <div className="flex items-center gap-2 xs:gap-3 sm:space-x-4 lg:space-x-4 xl:space-x-5 2xl:space-x-5 min-w-0">
                  <div className="flex items-center justify-center w-9 h-9 xs:w-11 xs:h-11 sm:w-14 sm:h-14 lg:w-14 lg:h-14 xl:w-16 xl:h-16 2xl:w-16 2xl:h-16 rounded-lg xs:rounded-xl bg-emerald-50 border-2 border-emerald-200 group-hover:bg-emerald-100 group-hover:border-emerald-300 transition-colors duration-300 shadow-sm shrink-0">
                    <svg className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 lg:w-7 lg:h-7 xl:w-8 xl:h-8 2xl:w-8 2xl:h-8 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v10m0 0l-3-3m3 3l3-3M4 20h16" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base xs:text-lg sm:text-2xl lg:text-2xl xl:text-3xl 2xl:text-3xl font-extrabold text-slate-900 mb-0.5">Ingresos</h3>
                    <p className="text-[10px] xs:text-xs sm:text-sm lg:text-sm xl:text-base 2xl:text-base font-extrabold text-emerald-700 uppercase tracking-wider break-words">Gestión Financiera</p>
                  </div>
                </div>

                <div className="hidden sm:block text-right shrink-0">
                  <div className="text-xl sm:text-2xl lg:text-2xl xl:text-3xl 2xl:text-3xl font-extrabold text-slate-900 mb-1">{loading ? '…' : fmtMoney(metrics.totalMonth)}</div>
                  <div className="text-[10px] sm:text-xs lg:text-xs xl:text-sm 2xl:text-sm text-slate-600 font-semibold bg-slate-100 border border-slate-200 px-2 py-0.5 sm:py-1 xl:py-1.5 2xl:py-1.5 rounded-lg">Este mes</div>
                </div>
              </div>

              {/* Contenido principal */}
              <div className="relative z-10 flex-1 min-h-0 mb-3 xs:mb-4 sm:mb-6 lg:mb-6 xl:mb-7 2xl:mb-8 flex flex-col">
                {/* Descripción: resumida en móvil */}
                <p className="hidden sm:block text-gray-600 leading-relaxed mb-6 lg:mb-6 xl:mb-7 2xl:text-base 2xl:mb-8">
                  Administra cobros, depósitos y conciliación bancaria. Control completo de todos los ingresos de la academia.
                </p>
                <p className="block sm:hidden text-[10px] xs:text-[11px] text-gray-600 mb-2">Resumen de ingresos</p>

                {/* Estadísticas en línea: compacto en móvil */}
                <div className="grid sm:hidden grid-cols-2 gap-2 xs:gap-3 bg-gray-50 rounded-lg p-2.5 xs:p-3 mb-0">
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
                <div className="hidden sm:flex items-center justify-between bg-slate-50 rounded-lg border-2 border-slate-200 p-4 lg:p-4 xl:p-5 2xl:p-5 mb-6 lg:mb-6 xl:mb-7 2xl:mb-8">
                  <div className="text-center">
                    <div className="text-lg lg:text-lg xl:text-xl 2xl:text-xl font-extrabold text-emerald-700">{loading ? '…' : metrics.countMonth}</div>
                    <div className="text-xs lg:text-xs xl:text-sm 2xl:text-sm text-slate-600 font-semibold">Transacciones</div>
                  </div>
                  <div className="w-px h-8 xl:h-9 2xl:h-10 bg-slate-300"></div>
                  <div className="text-center">
                    <div
                      title={loading ? '' : `Actual: ${fmtMoney(metrics.totalMonth)} | Anterior (${metrics.prevLabel}): ${fmtMoney(metrics.totalPrev)}`}
                      className={`text-lg lg:text-lg xl:text-xl 2xl:text-xl font-extrabold ${loading ? '' : (metrics.growthRaw > 0 ? 'text-emerald-700' : (metrics.growthRaw < 0 ? 'text-rose-700' : 'text-slate-400'))}`}
                    >
                      {loading ? '…' : `${metrics.growthRaw.toFixed(0)}%`}
                    </div>
                    <div className="text-xs lg:text-xs xl:text-sm 2xl:text-sm text-slate-600 font-semibold">Crecimiento vs mes anterior</div>
                    {!loading && metrics.growthRaw < 0 ? (
                      <div className="mt-0.5 text-[11px] text-rose-700 font-semibold">{`${Math.abs(Math.min(0, metrics.growthRaw)).toFixed(0)}% menos que el mes anterior`}</div>
                    ) : null}
                  </div>
                  <div className="w-px h-8 xl:h-9 2xl:h-10 bg-slate-300"></div>
                  <div className="text-center">
                    <div className="text-lg lg:text-lg xl:text-xl 2xl:text-xl font-extrabold text-emerald-700">{loading ? '…' : fmtMoney(metrics.avg)}</div>
                    <div className="text-xs lg:text-xs xl:text-sm 2xl:text-sm text-slate-600 font-semibold">Ticket promedio</div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="relative z-10 flex items-center justify-between gap-2 mt-auto pt-3 xs:pt-4 sm:pt-0">
                <div className="flex items-center text-emerald-700 font-extrabold group-hover:text-emerald-800 transition-colors text-xs xs:text-sm xl:text-base 2xl:text-lg">
                  <span className="hidden sm:inline mr-2">Administrar</span>
                  <svg className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-4 sm:h-4 xl:w-5 xl:h-5 2xl:w-5 2xl:h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
                <div className="flex items-center space-x-1.5 xs:space-x-2 shrink-0">
                  <div className="w-2 h-2 xs:w-2.5 xs:h-2.5 xl:w-3 xl:h-3 2xl:w-3 2xl:h-3 bg-emerald-500 rounded-full border-2 border-emerald-700"></div>
                  <span className="text-[10px] xs:text-xs xl:text-sm 2xl:text-sm text-slate-600 font-semibold">Activo</span>
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
              className="group relative bg-white rounded-xl sm:rounded-2xl border-2 border-slate-200 hover:border-rose-300 shadow-lg hover:shadow-2xl transition-all duration-300 p-3 xs:p-4 sm:p-6 lg:p-8 xl:p-9 2xl:p-10 min-h-[240px] xs:min-h-[260px] sm:min-h-[220px] lg:min-h-[320px] xl:min-h-[380px] 2xl:min-h-[440px] flex flex-col justify-between overflow-hidden cursor-pointer"
            >
              {/* Línea decorativa superior */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-rose-400 to-pink-400"></div>

              {/* Patrón sutil de fondo */}
              <div className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity duration-500">
                <div className="absolute inset-0" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23dc2626' fill-opacity='1'%3E%3Cpath d='M10 10l-2-2 2-2 2 2-2 2zm0 0l2 2-2 2-2-2 2-2z'/%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundSize: '20px 20px'
                }}></div>
              </div>

              {/* Header: compacto en móvil */}
              <div className="relative z-10 flex items-start justify-between gap-2 mb-3 xs:mb-4 sm:mb-4 lg:mb-6 xl:mb-7 2xl:mb-8">
                <div className="flex items-center gap-2 xs:gap-3 sm:space-x-4 lg:space-x-4 xl:space-x-5 2xl:space-x-5 min-w-0">
                  <div className="flex items-center justify-center w-9 h-9 xs:w-11 xs:h-11 sm:w-14 sm:h-14 lg:w-14 lg:h-14 xl:w-16 xl:h-16 2xl:w-16 2xl:h-16 rounded-lg xs:rounded-xl bg-rose-50 border-2 border-rose-200 group-hover:bg-rose-100 group-hover:border-rose-300 transition-colors duration-300 shadow-sm shrink-0">
                    <svg className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 lg:w-7 lg:h-7 xl:w-8 xl:h-8 2xl:w-8 2xl:h-8 text-rose-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20V10m0 0l-3 3m3-3l3 3M4 4h16" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base xs:text-lg sm:text-2xl lg:text-2xl xl:text-3xl 2xl:text-3xl font-extrabold text-slate-900 mb-0.5">Egresos</h3>
                    <p className="text-[10px] xs:text-xs sm:text-sm lg:text-sm xl:text-base 2xl:text-base font-extrabold text-rose-700 uppercase tracking-wider break-words">Control de Gastos</p>
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
                    <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-extrabold bg-rose-100 text-rose-800 border-2 border-rose-300">
                      Excedente
                    </span>
                  ) : (
                    egresosSnap.budget > 0 && egresosSnap.leftover <= LOW_REMAINING_THRESHOLD && egresosSnap.leftover >= 0 ? (
                      <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-extrabold bg-rose-50 text-rose-700 border-2 border-rose-200">
                        Presupuesto bajo
                      </span>
                    ) : (
                      egresosSnap.budget === 0 && (
                        <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-extrabold bg-slate-100 text-slate-700 border-2 border-slate-300" title="Asigna presupuesto para este mes">
                          Sin presupuesto
                        </span>
                      )
                    )
                  )}
                </div>
              </div>

              {/* Contenido principal */}
              <div className="relative z-10 flex-1 min-h-0 mb-3 xs:mb-4 sm:mb-4 lg:mb-6 xl:mb-7 2xl:mb-8 flex flex-col">
                {/* Descripción: resumida en móvil */}
                <p className="hidden sm:block text-gray-600 leading-relaxed mb-6 lg:mb-6 xl:mb-7 2xl:text-base 2xl:mb-8">
                  Controla gastos, proveedores y recibos. Administración completa de todos los egresos operativos de la academia.
                </p>
                <p className="block sm:hidden text-[10px] xs:text-[11px] text-gray-600 mb-2">Gastos y presupuesto</p>

                {/* Estadísticas en línea: compacto en móvil */}
                <div className="grid sm:hidden grid-cols-3 gap-2 xs:gap-3 bg-gray-50 rounded-lg p-2.5 xs:p-3 mb-0">
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
                <div className="sm:hidden mt-2">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${egresosSnap.budget > 0
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
                <div className="hidden sm:flex items-center justify-between bg-slate-50 rounded-lg border-2 border-slate-200 p-4 lg:p-4 xl:p-5 2xl:p-5 mb-6 lg:mb-6 xl:mb-7 2xl:mb-8">
                  <div className="text-center">
                    <div className="text-lg lg:text-lg xl:text-xl 2xl:text-xl font-extrabold text-rose-700">{fmtMoney(egresosSnap.spent)}</div>
                    <div className="text-xs lg:text-xs xl:text-sm 2xl:text-sm text-slate-600 font-semibold">Gastos</div>
                  </div>
                  <div className="w-px h-8 xl:h-9 2xl:h-10 bg-slate-300"></div>
                  <div className="text-center">
                    <div className="text-lg lg:text-lg xl:text-xl 2xl:text-xl font-extrabold text-slate-700">{fmtMoney(egresosSnap.budget)}</div>
                    <div className="text-xs lg:text-xs xl:text-sm 2xl:text-sm text-slate-600 font-semibold">Presupuesto</div>
                  </div>
                  <div className="w-px h-8 xl:h-9 2xl:h-10 bg-slate-300"></div>
                  <div className="text-center">
                    <div className={`text-lg lg:text-lg xl:text-xl 2xl:text-xl font-extrabold ${egresosSnap.leftover <= LOW_REMAINING_THRESHOLD ? 'text-rose-700' : 'text-emerald-700'}`}>{fmtMoney(egresosSnap.leftover)}</div>
                    <div className="text-xs lg:text-xs xl:text-sm 2xl:text-sm text-slate-600 font-semibold">Disponible</div>
                  </div>
                  {egresosSnap.spent > egresosSnap.budget && (
                    <>
                      <div className="w-px h-8 xl:h-9 2xl:h-10 bg-slate-300"></div>
                      <div className="text-center">
                        <div className="text-lg lg:text-lg xl:text-xl 2xl:text-xl font-extrabold text-rose-800">{fmtMoney(Math.max(0, egresosSnap.spent - egresosSnap.budget))}</div>
                        <div className="text-xs lg:text-xs xl:text-sm 2xl:text-sm text-slate-600 font-semibold">Excedente</div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Footer: igual que Ingresos */}
              <div className="relative z-10 flex items-center justify-between gap-2 mt-auto pt-3 xs:pt-4 sm:pt-0">
                <div className="flex items-center text-rose-700 font-extrabold group-hover:text-rose-800 transition-colors text-xs xs:text-sm xl:text-base 2xl:text-lg">
                  <span className="hidden sm:inline mr-2">Administrar</span>
                  <svg className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-4 sm:h-4 xl:w-5 xl:h-5 2xl:w-5 2xl:h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
                <div className="flex items-center space-x-1.5 xs:space-x-2 shrink-0">
                  <div className="w-2 h-2 xs:w-2.5 xs:h-2.5 xl:w-3 xl:h-3 2xl:w-3 2xl:h-3 bg-rose-500 rounded-full border-2 border-rose-700"></div>
                  <span className="text-[10px] xs:text-xs xl:text-sm 2xl:text-sm text-slate-600 font-semibold">Activo</span>
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
      {showEgresosMenu && createPortal(
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center p-3 sm:p-4 min-[1920px]:p-6 min-[2560px]:p-8 backdrop-blur-sm bg-slate-900/50"
          onClick={(e) => { if (e.target === e.currentTarget) setShowEgresosMenu(false); }}
        >
          {/* Compacto hasta 1800px (14"). Desde 1920px más ancha y algo más alta de forma proporcional; desde 2560px aún más */}
          <div className="bg-white w-full max-w-sm sm:max-w-md min-[1800px]:max-w-lg min-[1920px]:max-w-7xl min-[2560px]:max-w-[88rem] min-[1920px]:min-h-[50vh] min-[2560px]:min-h-[55vh] rounded-xl min-[1920px]:rounded-2xl shadow-2xl border-2 border-slate-300 overflow-hidden max-h-[calc(100vh-3rem)] min-[1920px]:max-h-[90vh] flex flex-col">
            <div className="px-4 sm:px-4 min-[1800px]:px-6 min-[1920px]:px-14 min-[2560px]:px-20 py-3 min-[1800px]:py-4 min-[1920px]:py-6 min-[2560px]:py-8 border-b border-slate-200 flex items-center justify-between flex-shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight min-[1800px]:text-xl min-[1920px]:text-4xl min-[2560px]:text-5xl">Egresos</h3>
                <p className="text-[10px] sm:text-[10px] min-[1800px]:text-xs min-[1920px]:text-base min-[2560px]:text-lg font-bold text-rose-500 uppercase tracking-widest mt-0.5 min-[1920px]:mt-1">Control de gastos y presupuesto</p>
              </div>
              <button onClick={() => setShowEgresosMenu(false)} className="text-slate-500 hover:text-slate-700 p-1 hover:bg-slate-100 rounded-lg transition-colors min-[1920px]:p-2 min-[2560px]:p-3">
                <svg className="w-5 h-5 min-[1800px]:w-6 min-[1800px]:h-6 min-[1920px]:w-10 min-[1920px]:h-10 min-[2560px]:w-12 min-[2560px]:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div className="p-3 sm:p-4 min-[1800px]:p-5 min-[1920px]:p-10 min-[1920px]:py-8 min-[2560px]:p-14 min-[2560px]:py-10 grid grid-cols-1 gap-2 min-[1800px]:gap-3 min-[1920px]:gap-6 min-[2560px]:gap-8 overflow-y-auto flex-1 min-h-0 no-scrollbar">
              <Link
                to="/administrativo/finanzas/egresos/fijos"
                className="group rounded-lg min-[1800px]:rounded-xl bg-gradient-to-br from-rose-50 to-white border border-rose-200 hover:border-rose-300 hover:shadow transition-all p-2.5 sm:p-3 min-[1800px]:p-4 min-[1920px]:p-7 min-[1920px]:py-6 min-[2560px]:p-9 min-[2560px]:py-7 flex items-center justify-between"
                onClick={() => setShowEgresosMenu(false)}
              >
                <div className="flex items-center gap-2 min-[1800px]:gap-3 min-[1920px]:gap-6 min-w-0">
                  <span className="inline-flex h-7 w-7 min-[1800px]:h-8 min-[1800px]:w-8 min-[1920px]:h-14 min-[1920px]:w-14 items-center justify-center rounded-md min-[1800px]:rounded-lg min-[1920px]:rounded-xl bg-rose-100 text-rose-700 text-xs min-[1800px]:text-sm min-[1920px]:text-2xl font-extrabold border border-rose-300 shrink-0">F</span>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm min-[1800px]:text-base min-[1920px]:text-2xl font-extrabold text-rose-700 truncate">Gastos fijos</div>
                    <div className="text-[10px] sm:text-[10px] min-[1800px]:text-xs min-[1920px]:text-base text-slate-600 font-medium leading-tight">Costos recurrentes: renta, nómina, servicios.</div>
                  </div>
                </div>
                <span className="h-7 w-7 min-[1800px]:h-8 min-[1800px]:w-8 min-[1920px]:h-14 min-[1920px]:w-14 rounded-md min-[1800px]:rounded-lg min-[1920px]:rounded-xl bg-white/70 border border-rose-200 flex items-center justify-center text-rose-700 font-extrabold text-xs min-[1800px]:text-sm min-[1920px]:text-2xl shrink-0">→</span>
              </Link>

              <Link
                to="/administrativo/finanzas/egresos/variables"
                className="group rounded-lg min-[1800px]:rounded-xl bg-gradient-to-br from-amber-50 to-white border border-amber-200 hover:border-amber-300 hover:shadow transition-all p-2.5 sm:p-3 min-[1800px]:p-4 min-[1920px]:p-7 min-[1920px]:py-6 min-[2560px]:p-9 min-[2560px]:py-7 flex items-center justify-between"
                onClick={() => setShowEgresosMenu(false)}
              >
                <div className="flex items-center gap-2 min-[1800px]:gap-3 min-[1920px]:gap-6 min-w-0">
                  <span className="inline-flex h-7 w-7 min-[1800px]:h-8 min-[1800px]:w-8 min-[1920px]:h-14 min-[1920px]:w-14 items-center justify-center rounded-md min-[1800px]:rounded-lg min-[1920px]:rounded-xl bg-amber-100 text-amber-700 text-xs min-[1800px]:text-sm min-[1920px]:text-2xl font-extrabold border border-amber-300 shrink-0">V</span>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm min-[1800px]:text-base min-[1920px]:text-2xl font-extrabold text-amber-700 truncate">Gastos variables</div>
                    <div className="text-[10px] sm:text-[10px] min-[1800px]:text-xs min-[1920px]:text-base text-slate-600 font-medium leading-tight">Compras, materiales, logística y otros.</div>
                  </div>
                </div>
                <span className="h-7 w-7 min-[1800px]:h-8 min-[1800px]:w-8 min-[1920px]:h-14 min-[1920px]:w-14 rounded-md min-[1800px]:rounded-lg min-[1920px]:rounded-xl bg-white/70 border border-amber-200 flex items-center justify-center text-amber-700 font-extrabold text-xs min-[1800px]:text-sm min-[1920px]:text-2xl shrink-0">→</span>
              </Link>

              <Link
                to="/administrativo/finanzas/egresos/presupuesto"
                className="group rounded-lg min-[1800px]:rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 hover:border-slate-300 hover:shadow transition-all p-2.5 sm:p-3 min-[1800px]:p-4 min-[1920px]:p-7 min-[1920px]:py-6 min-[2560px]:p-9 min-[2560px]:py-7 flex items-center justify-between"
                onClick={() => setShowEgresosMenu(false)}
              >
                <div className="flex items-center gap-2 min-[1800px]:gap-3 min-[1920px]:gap-6 min-w-0">
                  <span className="inline-flex h-7 w-7 min-[1800px]:h-8 min-[1800px]:w-8 min-[1920px]:h-14 min-[1920px]:w-14 items-center justify-center rounded-md min-[1800px]:rounded-lg min-[1920px]:rounded-xl bg-slate-100 text-slate-700 text-xs min-[1800px]:text-sm min-[1920px]:text-2xl font-extrabold border border-slate-300 shrink-0">P</span>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm min-[1800px]:text-base min-[1920px]:text-2xl font-extrabold text-slate-700 truncate">Presupuesto</div>
                    <div className="text-[10px] sm:text-[10px] min-[1800px]:text-xs min-[1920px]:text-base text-slate-600 font-medium leading-tight">Asigna y controla el presupuesto mensual de egresos.</div>
                  </div>
                </div>
                <span className="h-7 w-7 min-[1800px]:h-8 min-[1800px]:w-8 min-[1920px]:h-14 min-[1920px]:w-14 rounded-md min-[1800px]:rounded-lg min-[1920px]:rounded-xl bg-white/70 border border-slate-200 flex items-center justify-center text-slate-700 font-extrabold text-xs min-[1800px]:text-sm min-[1920px]:text-2xl shrink-0">→</span>
              </Link>

              <Link
                to="/administrativo/finanzas/pagos-asesores"
                className="group rounded-lg min-[1800px]:rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 hover:border-slate-300 hover:shadow transition-all p-2.5 sm:p-3 min-[1800px]:p-4 min-[1920px]:p-7 min-[1920px]:py-6 min-[2560px]:p-9 min-[2560px]:py-7 flex items-center justify-between"
                onClick={() => setShowEgresosMenu(false)}
              >
                <div className="flex items-center gap-2 min-[1800px]:gap-3 min-[1920px]:gap-6 min-w-0">
                  <span className="inline-flex h-7 w-7 min-[1800px]:h-8 min-[1800px]:w-8 min-[1920px]:h-14 min-[1920px]:w-14 items-center justify-center rounded-md min-[1800px]:rounded-lg min-[1920px]:rounded-xl bg-slate-100 text-slate-700 text-xs min-[1800px]:text-sm min-[1920px]:text-2xl font-extrabold border border-slate-300 shrink-0">A</span>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm min-[1800px]:text-base min-[1920px]:text-2xl font-extrabold text-slate-700 truncate">Pagos asesores</div>
                    <div className="text-[10px] sm:text-[10px] min-[1800px]:text-xs min-[1920px]:text-base text-slate-600 font-medium leading-tight">Honorarios y comisiones de asesores.</div>
                  </div>
                </div>
                <span className="h-7 w-7 min-[1800px]:h-8 min-[1800px]:w-8 min-[1920px]:h-14 min-[1920px]:w-14 rounded-md min-[1800px]:rounded-lg min-[1920px]:rounded-xl bg-white/70 border border-slate-200 flex items-center justify-center text-slate-700 font-extrabold text-xs min-[1800px]:text-sm min-[1920px]:text-2xl shrink-0">→</span>
              </Link>
            </div>
          </div>
        </div>,
        document.getElementById('modal-root')
      )}
    </div>
  );
}