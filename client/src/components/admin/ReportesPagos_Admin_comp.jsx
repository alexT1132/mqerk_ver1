// src\components\ReportesPagos_Admin_comp.jsx
import React, { useState, useEffect } from 'react';

export function ReportesPagos_Admin_comp() {
  const [reportes, setReportes] = useState({});
  const [fechaInicio, setFechaInicio] = useState('2024-01-01');
  const [fechaFin, setFechaFin] = useState('2024-12-31');
  const [cargando, setCargando] = useState(true);

  // Datos de ejemplo (esto vendrá del backend)
  useEffect(() => {
    setTimeout(() => {
      setReportes({
        resumenGeneral: {
          totalIngresos: 52800,
          totalPagos: 24,
          pagosPendientes: 3,
          pagosAprobados: 18,
          pagosRechazados: 3,
          promedioMensual: 4400
        },
        ingresosPorMes: [
          { mes: 'Enero', ingresos: 4200, pagos: 3 },
          { mes: 'Febrero', ingresos: 3800, pagos: 2 },
          { mes: 'Marzo', ingresos: 5100, pagos: 3 },
          { mes: 'Abril', ingresos: 4600, pagos: 2 },
          { mes: 'Mayo', ingresos: 4200, pagos: 3 },
          { mes: 'Junio', ingresos: 3900, pagos: 2 },
          { mes: 'Julio', ingresos: 4800, pagos: 3 },
          { mes: 'Agosto', ingresos: 4500, pagos: 2 },
          { mes: 'Septiembre', ingresos: 4200, pagos: 2 },
          { mes: 'Octubre', ingresos: 4600, pagos: 1 },
          { mes: 'Noviembre', ingresos: 4800, pagos: 1 },
          { mes: 'Diciembre', ingresos: 4000, pagos: 0 }
        ],
        pagosPorCurso: [
          { curso: 'Inglés Básico', pagos: 8, ingresos: 19200 },
          { curso: 'Inglés Intermedio', pagos: 6, ingresos: 15600 },
          { curso: 'Inglés Avanzado', pagos: 5, ingresos: 12000 },
          { curso: 'Inglés Conversacional', pagos: 5, ingresos: 6000 }
        ],
        metodosDepago: [
          { metodo: 'Transferencia Bancaria', cantidad: 12, porcentaje: 50 },
          { metodo: 'Depósito en Efectivo', cantidad: 7, porcentaje: 29.2 },
          { metodo: 'Transferencia SPEI', cantidad: 5, porcentaje: 20.8 }
        ]
      });
      setCargando(false);
    }, 1000);
  }, [fechaInicio, fechaFin]);

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reportes de Pagos</h1>
              <p className="mt-1 text-sm text-gray-500">
                Análisis detallado de ingresos y estadísticas de pagos
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Exportar Reporte
              </button>
            </div>
          </div>
        </div>

        {/* Filtros de fecha */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de inicio
              </label>
              <input
                type="date"
                id="fechaInicio"
                className="block w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="fechaFin" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de fin
              </label>
              <input
                type="date"
                id="fechaFin"
                className="block w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Aplicar Filtros
            </button>
          </div>
        </div>

        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"></path>
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Ingresos</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${reportes.resumenGeneral.totalIngresos.toLocaleString()} MXN
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pagos Procesados</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {reportes.resumenGeneral.totalPagos}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pagos Pendientes</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {reportes.resumenGeneral.pagosPendientes}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"></path>
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Promedio Mensual</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${reportes.resumenGeneral.promedioMensual.toLocaleString()} MXN
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico de ingresos por mes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Ingresos por Mes</h3>
            <div className="space-y-4">
              {reportes.ingresosPorMes.slice(0, 6).map((mes, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 text-sm text-gray-600">{mes.mes}</div>
                    <div className="flex-1 mx-4">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(mes.ingresos / 5100) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    ${mes.ingresos.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Pagos por Curso</h3>
            <div className="space-y-4">
              {reportes.pagosPorCurso.map((curso, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-32 text-sm text-gray-600 truncate">{curso.curso}</div>
                    <div className="flex-1 mx-4">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(curso.ingresos / 19200) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {curso.pagos} pagos
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Métodos de pago y tabla detallada */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Métodos de Pago</h3>
            <div className="space-y-4">
              {reportes.metodosDepago.map((metodo, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-40 text-sm text-gray-600">{metodo.metodo}</div>
                    <div className="flex-1 mx-4">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{ width: `${metodo.porcentaje}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {metodo.cantidad} ({metodo.porcentaje}%)
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen de Estado</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-green-800">Pagos Aprobados</span>
                <span className="text-lg font-bold text-green-900">
                  {reportes.resumenGeneral.pagosAprobados}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="text-sm font-medium text-yellow-800">Pagos Pendientes</span>
                <span className="text-lg font-bold text-yellow-900">
                  {reportes.resumenGeneral.pagosPendientes}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-sm font-medium text-red-800">Pagos Rechazados</span>
                <span className="text-lg font-bold text-red-900">
                  {reportes.resumenGeneral.pagosRechazados}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}