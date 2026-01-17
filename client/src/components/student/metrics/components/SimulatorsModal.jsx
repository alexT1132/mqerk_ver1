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
  ReferenceLine,
  LineChart,
  Line
} from 'recharts';

/**
 * Modal para vista expandida de simuladores
 * 
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Controla la visibilidad del modal
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Array} props.generales - Array de simuladores generales
 * @param {Array} props.especificos - Array de módulos específicos
 */
const SimulatorsModal = ({ isOpen, onClose, generales = [], especificos = [] }) => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'generales', 'especificos', 'comparison'
  const [chartType, setChartType] = useState('bar'); // 'bar', 'line', 'radar'

  if (!isOpen) return null;

  // Combinar todos los datos para análisis
  const allData = useMemo(() => {
    const generalData = generales.map(item => ({
      ...item,
      type: 'General',
      category: 'Área Fundamental',
      shortName: item.area
    }));
    
    const specificData = especificos.map(item => ({
      ...item,
      type: 'Específico',
      category: 'Módulo Universitario',
      shortName: item.modulo?.replace('Módulo ', '') || `Módulo ${item.id_area}`
    }));
    
    return [...generalData, ...specificData];
  }, [generales, especificos]);

  // Calcular estadísticas detalladas
  const detailedStats = useMemo(() => {
    const scores = allData.map(s => s.puntaje || 0).filter(s => s > 0);
    const generalScores = generales.map(s => s.puntaje || 0).filter(s => s > 0);
    const specificScores = especificos.map(s => s.puntaje || 0).filter(s => s > 0);
    
    return {
      total: allData.length,
      generalCount: generales.length,
      specificCount: especificos.length,
      overallAverage: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      generalAverage: generalScores.length > 0 ? Math.round(generalScores.reduce((a, b) => a + b, 0) / generalScores.length) : 0,
      specificAverage: specificScores.length > 0 ? Math.round(specificScores.reduce((a, b) => a + b, 0) / specificScores.length) : 0,
      maxScore: scores.length > 0 ? Math.max(...scores) : 0,
      minScore: scores.length > 0 ? Math.min(...scores) : 0,
      above70: scores.filter(s => s >= 70).length,
      above85: scores.filter(s => s >= 85).length,
      below50: scores.filter(s => s < 50).length,
      bestArea: allData.reduce((best, current) => 
        (current.puntaje || 0) > (best?.puntaje || 0) ? current : best, allData[0]
      ),
      worstArea: allData.reduce((worst, current) => 
        (current.puntaje || 0) < (worst?.puntaje || 0) ? current : worst, allData[0]
      )
    };
  }, [allData, generales, especificos]);

  // Preparar datos para gráficos
  const chartData = useMemo(() => {
    if (activeTab === 'generales') {
      return generales.map(item => ({
        name: item.area,
        score: item.puntaje || 0,
        color: item.color || '#A855F7',
        meta: 70
      })).sort((a, b) => b.score - a.score);
    }
    
    if (activeTab === 'especificos') {
      return especificos.map(item => ({
        name: item.modulo?.replace('Módulo ', '') || `Módulo ${item.id_area}`,
        score: item.puntaje || 0,
        color: item.color || '#10B981',
        meta: 65
      })).sort((a, b) => b.score - a.score);
    }
    
    // Vista general combinada
    return allData.map(item => ({
      name: item.shortName,
      score: item.puntaje || 0,
      color: item.type === 'General' ? '#A855F7' : '#10B981',
      type: item.type,
      meta: item.type === 'General' ? 70 : 65
    })).sort((a, b) => b.score - a.score);
  }, [activeTab, generales, especificos, allData]);

  // Datos para gráfico de comparativa
  const comparisonData = useMemo(() => {
    const categories = ['< 50%', '50-69%', '70-84%', '85-100%'];
    
    const generalCounts = [
      generales.filter(g => (g.puntaje || 0) < 50).length,
      generales.filter(g => (g.puntaje || 0) >= 50 && (g.puntaje || 0) < 70).length,
      generales.filter(g => (g.puntaje || 0) >= 70 && (g.puntaje || 0) < 85).length,
      generales.filter(g => (g.puntaje || 0) >= 85).length
    ];
    
    const specificCounts = [
      especificos.filter(e => (e.puntaje || 0) < 50).length,
      especificos.filter(e => (e.puntaje || 0) >= 50 && (e.puntaje || 0) < 70).length,
      especificos.filter(e => (e.puntaje || 0) >= 70 && (e.puntaje || 0) < 85).length,
      especificos.filter(e => (e.puntaje || 0) >= 85).length
    ];
    
    return categories.map((category, index) => ({
      category,
      generales: generalCounts[index],
      especificos: specificCounts[index]
    }));
  }, [generales, especificos]);

  // Custom Tooltip para gráficos
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isAboveMeta = data.score >= data.meta;
      
      return (
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 rounded-xl shadow-2xl border border-gray-600 backdrop-blur-sm max-w-xs">
          <div className="flex items-center space-x-3 mb-3">
            <div
              className="w-4 h-4 rounded-full shadow-lg"
              style={{ backgroundColor: data.color || payload[0].color }}
            ></div>
            <div>
              <p className="font-bold text-sm text-gray-100">{data.name || label}</p>
              {data.type && (
                <p className="text-xs text-gray-300">{data.type}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800/50 rounded-lg p-2">
              <p className="text-xs text-gray-400">Puntuación</p>
              <p className={`text-xl font-black ${isAboveMeta ? 'text-green-400' : 'text-yellow-400'}`}>
                {data.score || payload[0].value}%
              </p>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-2">
              <p className="text-xs text-gray-400">Meta</p>
              <p className="text-lg font-bold text-blue-400">{data.meta || 70}%</p>
            </div>
          </div>
          
          {data.generales !== undefined && data.especificos !== undefined && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="bg-purple-900/30 rounded p-2">
                <p className="text-xs text-purple-300">Generales</p>
                <p className="text-lg font-bold">{data.generales}</p>
              </div>
              <div className="bg-emerald-900/30 rounded p-2">
                <p className="text-xs text-emerald-300">Específicos</p>
                <p className="text-lg font-bold">{data.especificos}</p>
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Renderizar el gráfico según el tipo seleccionado
  const renderChart = () => {
    if (activeTab === 'comparison') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="category" />
            <YAxis label={{ value: 'Cantidad', angle: -90, position: 'insideLeft' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="generales" name="Áreas Fundamentales" fill="#A855F7" radius={[4, 4, 0, 0]} />
            <Bar dataKey="especificos" name="Módulos Específicos" fill="#10B981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 10 }}
              interval={0}
            />
            <YAxis 
              domain={[0, 100]}
              label={{ value: 'Puntuación (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    // Gráfico de barras por defecto
    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fontSize: 10 }}
            interval={0}
          />
          <YAxis 
            domain={[0, 100]}
            label={{ value: 'Puntuación (%)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" />
          <Bar dataKey="score" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color} 
                stroke="#fff"
                strokeWidth={1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-none sm:rounded-2xl shadow-2xl w-full h-full sm:h-auto sm:max-w-6xl sm:max-h-[95vh] relative flex flex-col overflow-hidden">
        
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-4 sm:p-6 relative shrink-0">
          <h2 className="text-lg sm:text-2xl font-bold text-white text-center pr-8 sm:pr-10 leading-tight">
            Análisis Detallado de Simuladores
          </h2>
          <button
            onClick={onClose}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/20 hover:bg-white/30 text-white rounded-full p-1.5 sm:p-2 transition-all duration-200 hover:scale-110"
            aria-label="Cerrar modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-gray-50">
          
          {/* Pestañas de navegación */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'overview' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'}`}
            >
              Vista General
            </button>
            <button
              onClick={() => setActiveTab('generales')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'generales' 
                ? 'bg-purple-600 text-white shadow-lg' 
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'}`}
            >
              Áreas Fundamentales ({generales.length})
            </button>
            <button
              onClick={() => setActiveTab('especificos')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'especificos' 
                ? 'bg-emerald-600 text-white shadow-lg' 
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'}`}
            >
              Módulos Específicos ({especificos.length})
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'comparison' 
                ? 'bg-pink-600 text-white shadow-lg' 
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'}`}
            >
              Comparativa
            </button>
          </div>
          
          {/* Selector de tipo de gráfico */}
          <div className="flex justify-end mb-4">
            <div className="flex items-center space-x-2 bg-white rounded-lg p-2 border border-gray-300">
              <span className="text-sm text-gray-600">Tipo de gráfico:</span>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="text-sm bg-transparent border-none focus:outline-none focus:ring-0"
                disabled={activeTab === 'comparison'}
              >
                <option value="bar">Barras</option>
                <option value="line">Líneas</option>
              </select>
            </div>
          </div>
          
          {/* Estadísticas destacadas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-lg border border-blue-200">
              <div className="text-xs text-blue-600 font-semibold mb-1">Promedio General</div>
              <div className="text-2xl font-bold text-blue-700">{detailedStats.overallAverage}%</div>
              <div className="text-xs text-gray-500 mt-1">de {detailedStats.total} simuladores</div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-lg border border-purple-200">
              <div className="text-xs text-purple-600 font-semibold mb-1">Mejor Área</div>
              <div className="text-lg font-bold text-purple-700 truncate">
                {detailedStats.bestArea?.shortName || 'N/A'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {detailedStats.bestArea?.puntaje || 0}%
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-lg border border-red-200">
              <div className="text-xs text-red-600 font-semibold mb-1">Peor Área</div>
              <div className="text-lg font-bold text-red-700 truncate">
                {detailedStats.worstArea?.shortName || 'N/A'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {detailedStats.worstArea?.puntaje || 0}%
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-lg border border-green-200">
              <div className="text-xs text-green-600 font-semibold mb-1">Simuladores ≥ 70%</div>
              <div className="text-2xl font-bold text-green-700">{detailedStats.above70}</div>
              <div className="text-xs text-gray-500 mt-1">de {detailedStats.total} totales</div>
            </div>
          </div>
          
          {/* Gráfico principal */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-300 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                {activeTab === 'overview' && 'Vista General de Simuladores'}
                {activeTab === 'generales' && 'Áreas Fundamentales'}
                {activeTab === 'especificos' && 'Módulos Específicos'}
                {activeTab === 'comparison' && 'Comparativa por Rangos de Puntuación'}
              </h3>
              <div className="text-sm text-gray-500">
                {activeTab !== 'comparison' && `Mostrando ${chartData.length} elementos`}
              </div>
            </div>
            <div className="h-96">
              {renderChart()}
            </div>
          </div>
          
          {/* Recomendaciones y acciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 shadow-lg border border-blue-300">
              <h4 className="text-lg font-bold text-blue-800 mb-3">Recomendaciones</h4>
              <ul className="space-y-2">
                {detailedStats.below50 > 0 && (
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-red-500 rounded-full mt-2 mr-3"></span>
                    <span className="text-sm text-gray-700">
                      <strong>{detailedStats.below50} simulador(es)</strong> están por debajo del 50%. Considera repasar esos temas.
                    </span>
                  </li>
                )}
                {detailedStats.above85 < detailedStats.total && (
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3"></span>
                    <span className="text-sm text-gray-700">
                      <strong>{detailedStats.total - detailedStats.above85} simulador(es)</strong> no han alcanzado el 85%. Enfócate en mejorar esas áreas.
                    </span>
                  </li>
                )}
                {detailedStats.generalAverage < 70 && (
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3"></span>
                    <span className="text-sm text-gray-700">
                      El promedio de áreas fundamentales es <strong>{detailedStats.generalAverage}%</strong>. Intenta llegar al 70%.
                    </span>
                  </li>
                )}
                {detailedStats.specificAverage < 65 && (
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3"></span>
                    <span className="text-sm text-gray-700">
                      El promedio de módulos específicos es <strong>{detailedStats.specificAverage}%</strong>. La meta es 65%.
                    </span>
                  </li>
                )}
                {detailedStats.above70 >= detailedStats.total && (
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></span>
                    <span className="text-sm text-gray-700">
                      ¡Excelente! Todos los simuladores están por encima del 70%. Sigue manteniendo ese nivel.
                    </span>
                  </li>
                )}
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 shadow-lg border border-gray-300">
              <h4 className="text-lg font-bold text-gray-800 mb-3">Acciones Rápidas</h4>
              <div className="space-y-3">
                <button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center"
                  onClick={() => alert('Redirigiendo a simuladores...')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  Ir a Simuladores
                </button>
                <button
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center"
                  onClick={() => alert('Generando reporte...')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Descargar Reporte PDF
                </button>
                <button
                  className="w-full bg-gray-800 hover:bg-black text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center"
                  onClick={onClose}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cerrar Análisis
                </button>
              </div>
              <div className="mt-4 text-xs text-gray-500 text-center">
                <p>Los datos se actualizan automáticamente después de cada simulación.</p>
              </div>
            </div>
          </div>
          
        </div>
        
      </div>
    </div>
  );
};
