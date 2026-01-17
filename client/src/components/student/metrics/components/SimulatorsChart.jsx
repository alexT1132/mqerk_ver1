import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';

/**
 * Componente SimulatorsChart
 * Muestra gráfica mejorada de simuladores generales y específicos
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.generales - Array de simuladores generales
 * @param {Array} props.especificos - Array de módulos específicos
 * @param {Function} props.onExpand - Función para expandir la vista
 */
const SimulatorsChart = ({ generales = [], especificos = [], onExpand }) => {
  const [viewMode, setViewMode] = useState('combined'); // 'combined', 'generales', 'especificos'
  const [sortBy, setSortBy] = useState('score'); // 'score', 'name', 'type'

  // Calcular estadísticas
  const stats = useMemo(() => {
    const allSimulators = [...generales, ...especificos];
    const scores = allSimulators.map(s => s.puntaje || 0).filter(s => s > 0);
    
    return {
      total: allSimulators.length,
      average: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      max: scores.length > 0 ? Math.max(...scores) : 0,
      min: scores.length > 0 ? Math.min(...scores) : 0,
      above70: scores.filter(s => s >= 70).length,
      below50: scores.filter(s => s < 50).length
    };
  }, [generales, especificos]);

  // Preparar datos para el gráfico combinado
  const chartData = useMemo(() => {
    let data = [];
    
    if (viewMode === 'generales' || viewMode === 'combined') {
      data = data.concat(generales.map(item => ({
        name: item.area,
        value: item.puntaje || 0,
        type: 'General',
        color: item.color || '#A855F7',
        id: `general_${item.id_area || item.area}`,
        meta: 70 // Meta estándar
      })));
    }
    
    if (viewMode === 'especificos' || viewMode === 'combined') {
      data = data.concat(especificos.map(item => ({
        name: item.modulo?.replace('Módulo ', '') || `Módulo ${item.id_area}`,
        value: item.puntaje || 0,
        type: 'Específico',
        color: item.color || '#10B981',
        id: `specific_${item.id_area}`,
        meta: 65 // Meta más baja para módulos específicos
      })));
    }

    // Ordenar datos
    if (sortBy === 'score') {
      data.sort((a, b) => b.value - a.value);
    } else if (sortBy === 'name') {
      data.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'type') {
      data.sort((a, b) => a.type.localeCompare(b.type));
    }

    return data;
  }, [generales, especificos, viewMode, sortBy]);

  // Custom Tooltip para el gráfico
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isAboveMeta = data.value >= data.meta;
      
      return (
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 rounded-xl shadow-2xl border border-gray-600 backdrop-blur-sm max-w-xs">
          <div className="flex items-center space-x-3 mb-3">
            <div
              className="w-4 h-4 rounded-full shadow-lg"
              style={{ backgroundColor: data.color }}
            ></div>
            <div>
              <p className="font-bold text-sm text-gray-100">{data.name}</p>
              <p className="text-xs text-gray-300">{data.type}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800/50 rounded-lg p-2">
              <p className="text-xs text-gray-400">Puntuación</p>
              <p className={`text-xl font-black ${isAboveMeta ? 'text-green-400' : 'text-yellow-400'}`}>
                {data.value}%
              </p>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-2">
              <p className="text-xs text-gray-400">Meta</p>
              <p className="text-lg font-bold text-blue-400">{data.meta}%</p>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-700">
            <p className="text-xs text-gray-300">
              {isAboveMeta ? '✅ Supera la meta' : '⚠️ Por debajo de la meta'}
              {data.value >= 85 ? ' - ¡Excelente!' : 
               data.value >= 70 ? ' - Buen trabajo' : 
               data.value >= 50 ? ' - Necesita mejorar' : 
               ' - Requiere atención urgente'}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Legend para el gráfico
  const renderLegend = (props) => {
    const { payload } = props;
    
    return (
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {payload.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className="text-xs font-medium text-gray-700">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  // Si no hay datos, mostrar mensaje
  if (chartData.length === 0) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl shadow-xl border-2 border-blue-200/50 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 text-blue-400">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
            <path d="M7 12h2v5H7zm4-7h2v12h-2zm4 5h2v7h-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-700 mb-2">Sin datos de simuladores</h3>
        <p className="text-sm text-gray-600 mb-4">
          Aún no has completado simuladores. ¡Comienza tu primer simulador para ver tus resultados aquí!
        </p>
      </div>
    );
  }

  return (
    <div className="group cursor-pointer transition-all duration-300 hover:scale-[1.02]">
      {/* Contenedor principal con gradiente */}
      <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl shadow-xl border-2 border-blue-200/50 p-6 hover:shadow-2xl transition-all duration-300 overflow-hidden">
        
        {/* Efectos decorativos de fondo */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/40 to-indigo-100/40 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-100/40 to-blue-100/40 rounded-full blur-xl"></div>
        
        {/* Contenido relativo */}
        <div className="relative z-10">
          
          {/* Header con título y controles */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <div>
              <div className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full px-4 py-2 mb-2 shadow-lg">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                <h3 className="text-base font-black">Simuladores</h3>
              </div>
              <p className="text-xs text-gray-600 font-medium">Resultados por área y módulo</p>
            </div>
            
            {/* Controles de vista y ordenamiento */}
            <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="text-xs bg-white/80 backdrop-blur-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="combined">Todos</option>
                <option value="generales">Áreas Fundamentales</option>
                <option value="especificos">Módulos Específicos</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs bg-white/80 backdrop-blur-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="score">Ordenar por puntuación</option>
                <option value="name">Ordenar por nombre</option>
                <option value="type">Ordenar por tipo</option>
              </select>
            </div>
          </div>
          
          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-blue-200 shadow-sm">
              <p className="text-xs text-gray-500 font-semibold">Total</p>
              <p className="text-xl font-bold text-blue-600">{stats.total}</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-blue-200 shadow-sm">
              <p className="text-xs text-gray-500 font-semibold">Promedio</p>
              <p className="text-xl font-bold text-indigo-600">{stats.average}%</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-blue-200 shadow-sm">
              <p className="text-xs text-gray-500 font-semibold">Máximo</p>
              <p className="text-xl font-bold text-green-600">{stats.max}%</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-blue-200 shadow-sm">
              <p className="text-xs text-gray-500 font-semibold">≥ 70%</p>
              <p className="text-xl font-bold text-emerald-600">{stats.above70}</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-blue-200 shadow-sm">
              <p className="text-xs text-gray-500 font-semibold">≤ 50%</p>
              <p className="text-xl font-bold text-amber-600">{stats.below50}</p>
            </div>
          </div>
          
          {/* Gráfico principal */}
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 30 }}
                barSize={viewMode === 'combined' ? 20 : 30}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  tick={{ fontSize: 10, fill: '#6b7280' }}
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  label={{ 
                    value: 'Puntuación (%)', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fill: '#6b7280', fontSize: 12 }
                  }}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend content={renderLegend} />
                
                {/* Línea de referencia para meta general */}
                <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1.5} />
                
                <Bar
                  dataKey="value"
                  name="Puntuación"
                  radius={[4, 4, 0, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="#fff"
                      strokeWidth={1}
                      className="hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Leyenda de metas */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              <span className="text-xs font-medium text-gray-700">Áreas Fundamentales</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-green-500"></div>
              <span className="text-xs font-medium text-gray-700">Módulos Específicos</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-0.5 bg-red-500"></div>
              <span className="text-xs font-medium text-gray-700">Meta (70%)</span>
            </div>
          </div>
          
          {/* Botón de acción */}
          <div className="text-center">
            <button
              onClick={onExpand}
              className="inline-flex items-center text-blue-600 font-bold text-sm bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border-2 border-blue-200 shadow-md hover:shadow-lg transition-all hover:scale-105 hover:bg-white"
            >
              <span>Ver análisis detallado</span>
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          {/* Información contextual */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              {stats.above70 === stats.total ? '¡Excelente! Todas las áreas superan la meta' :
               stats.above70 >= stats.total * 0.7 ? 'Buen progreso, la mayoría de áreas cumplen la meta' :
               stats.above70 >= stats.total * 0.5 ? 'Progreso regular, algunas áreas necesitan atención' :
               'Necesitas enfocarte en mejorar tus resultados'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulatorsChart;