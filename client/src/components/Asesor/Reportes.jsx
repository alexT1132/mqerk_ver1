import React, { useState, useEffect } from 'react';
import { BarChart3, DollarSign, ClipboardList, Users, TrendingUp, Loader2, AlertCircle, Calendar, Award, CheckCircle, Clock } from 'lucide-react';
import axios from '../../api/axios.js';

// Formatear dinero
const fmtMoney = (n) =>
  typeof n === "number"
    ? n.toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    })
    : n ?? "-";

export default function Reportes() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadEstadisticas();
  }, []);

  const loadEstadisticas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/asesores/reportes/estadisticas');
      setStats(response.data.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Error cargando estadísticas');
    } finally {
      setLoading(false);
    }
  };


  // Obtener nombre del mes
  const getMonthName = (mes) => {
    const [year, month] = mes.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };

  // Calcular porcentaje para barras
  const getPercentage = (value, max) => {
    if (!max || max === 0) return 0;
    return Math.min((value / max) * 100, 100);
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="size-12 animate-spin text-violet-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="size-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-bold text-lg mb-2">Error</p>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={loadEstadisticas}
            className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <p className="text-slate-600">No hay datos disponibles</p>
      </div>
    );
  }

  const { pagos: pagosStats, actividades, estudiantes, rendimiento } = stats;

  // Calcular máximo para gráficos
  const maxIngresosMes = pagosStats.porMes.length > 0
    ? Math.max(...pagosStats.porMes.map(p => p.total))
    : 0;

  const maxMetodo = Object.keys(pagosStats.porMetodo).length > 0
    ? Math.max(...Object.values(pagosStats.porMetodo))
    : 0;

  return (
    <div className="w-full min-h-screen relative">
      <div className="fixed inset-0 bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 -z-50"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-xl ring-2 ring-violet-200">
              <BarChart3 className="size-8 sm:size-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-2 tracking-tight leading-tight">
                <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent inline-block" style={{ lineHeight: '1.2', paddingBottom: '0.2em' }}>
                  Reportes y Estadísticas
                </span>
              </h1>
              <p className="text-slate-600 text-sm sm:text-base font-medium">
                Análisis completo de pagos, actividades y rendimiento de tus estudiantes
              </p>
            </div>
          </div>
        </div>

        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {/* Total de ingresos */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-emerald-200 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-md">
                <DollarSign className="size-6" />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-slate-600 mb-1">Total de Ingresos</h3>
            <p className="text-2xl font-bold text-emerald-600">{fmtMoney(pagosStats.total)}</p>
            <p className="text-xs text-slate-400 mt-1 italic">Total histórico (todos los períodos)</p>
          </div>

          {/* Actividades completadas */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-200 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
                <ClipboardList className="size-6" />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-slate-600 mb-1">Actividades Completadas</h3>
            <p className="text-2xl font-bold text-blue-600">{actividades.completadas} / {actividades.total}</p>
          </div>

          {/* Estudiantes activos */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-200 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-md">
                <Users className="size-6" />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-slate-600 mb-1">Estudiantes Activos</h3>
            <p className="text-2xl font-bold text-purple-600">{estudiantes.activos} / {estudiantes.total}</p>
          </div>

          {/* Promedio general */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-amber-200 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
                <TrendingUp className="size-6" />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-slate-600 mb-1">Promedio General</h3>
            <p className="text-2xl font-bold text-amber-600">{rendimiento.promedioGeneral}%</p>
          </div>
        </div>

        {/* Gráficos de ingresos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de ingresos por mes */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="size-6 text-violet-600" />
              <h2 className="text-xl font-bold text-slate-800">Ingresos Totales por Mes</h2>
            </div>
            {pagosStats.porMes.length > 0 ? (
              <div className="space-y-4">
                {pagosStats.porMes.map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-slate-700 capitalize">
                        {getMonthName(item.mes)}
                      </span>
                      <span className="font-bold text-emerald-600">{fmtMoney(item.total)}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-green-600 rounded-full transition-all duration-500"
                        style={{ width: `${getPercentage(item.total, maxIngresosMes)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8">No hay datos de ingresos por mes</p>
            )}
          </div>

          {/* Gráfico de ingresos por método de pago */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <DollarSign className="size-6 text-violet-600" />
              <h2 className="text-xl font-bold text-slate-800">Ingresos Totales por Método</h2>
            </div>
            {Object.keys(pagosStats.porMetodo).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(pagosStats.porMetodo).map(([metodo, total], idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-slate-700">{metodo}</span>
                      <span className="font-bold text-emerald-600">{fmtMoney(total)}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${getPercentage(total, maxMetodo)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8">No hay datos de métodos de pago</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Estadísticas de actividades */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <ClipboardList className="size-6 text-violet-600" />
              <h2 className="text-xl font-bold text-slate-800">Estado de Actividades</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border-2 border-emerald-200">
                <div className="flex items-center gap-3">
                  <CheckCircle className="size-5 text-emerald-600" />
                  <span className="font-semibold text-slate-700">Completadas</span>
                </div>
                <span className="text-xl font-bold text-emerald-600">{actividades.completadas}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border-2 border-amber-200">
                <div className="flex items-center gap-3">
                  <Clock className="size-5 text-amber-600" />
                  <span className="font-semibold text-slate-700">Pendientes</span>
                </div>
                <span className="text-xl font-bold text-amber-600">{actividades.pendientes}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                <div className="flex items-center gap-3">
                  <TrendingUp className="size-5 text-blue-600" />
                  <span className="font-semibold text-slate-700">Promedio de Calificación</span>
                </div>
                <span className="text-xl font-bold text-blue-600">{actividades.promedioCalificacion}%</span>
              </div>
            </div>
          </div>

          {/* Top estudiantes */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <Award className="size-6 text-violet-600" />
              <h2 className="text-xl font-bold text-slate-800">Top Estudiantes</h2>
            </div>
            {rendimiento.topEstudiantes.length > 0 ? (
              <div className="space-y-3">
                {rendimiento.topEstudiantes.map((estudiante, idx) => (
                  <div
                    key={estudiante.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl border-2 border-violet-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${idx === 0 ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
                        idx === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-600' :
                          idx === 2 ? 'bg-gradient-to-br from-amber-700 to-amber-900' :
                            'bg-gradient-to-br from-violet-500 to-indigo-600'
                        }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{estudiante.nombre}</p>
                        <p className="text-xs text-slate-500">{estudiante.totalActividades} actividades</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-violet-600">{estudiante.promedio.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8">No hay datos de rendimiento</p>
            )}
          </div>
        </div>

        {/* Botón de actualizar */}
        <div className="flex justify-center">
          <button
            onClick={loadEstadisticas}
            className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
          >
            <BarChart3 className="size-5" />
            Actualizar Estadísticas
          </button>
        </div>
      </div>
    </div>
  );
}
