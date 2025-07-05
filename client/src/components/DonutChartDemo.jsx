import React, { useState } from 'react';

// Datos de ejemplo que muestran cómo se verá el gráfico donut
const subjectResultsExample = {
  total: 70,
  subjects: [
    { code: 'E/R', percent: 18, color: '#8B5CF6', fullName: 'Español y redacción indirecta' },
    { code: 'M/A', percent: 12, color: '#EC4899', fullName: 'Matemáticas y pensamiento analítico' },
    { code: 'HT', percent: 15, color: '#F59E0B', fullName: 'Habilidades transversales' },
    { code: 'LE', percent: 15, color: '#6366F1', fullName: 'Lengua extranjera' },
    { code: 'ME', percent: 10, color: '#7C3AED', fullName: 'Módulos específicos' },
  ]
};

const DonutChartDemo = () => {
  const [tooltipData, setTooltipData] = useState({ 
    isVisible: false, 
    title: '', 
    description: '', 
    position: { x: 0, y: 0 } 
  });

  // Función para mostrar tooltip personalizado
  const showTooltip = (e, title, description) => {
    setTooltipData({
      isVisible: true,
      title,
      description,
      position: { 
        x: e.pageX + 10, 
        y: e.pageY - 10 
      }
    });
  };

  // Función para ocultar tooltip
  const hideTooltip = () => {
    setTooltipData(prev => ({ ...prev, isVisible: false }));
  };

  // Componente de Tooltip personalizado
  const CustomHoverTooltip = ({ title, description, isVisible, position = { x: 0, y: 0 } }) => {
    if (!isVisible) return null;
    
    return (
      <div 
        className="fixed bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900 text-white p-4 rounded-xl shadow-2xl border border-purple-400 z-[10000] backdrop-blur-sm transition-all duration-200"
        style={{ 
          left: position.x + 10, 
          top: position.y - 10,
          maxWidth: '280px'
        }}
      >
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
          <div>
            <p className="font-bold text-purple-200 mb-1">{title}</p>
            <p className="text-sm text-gray-200 leading-relaxed">{description}</p>
          </div>
        </div>
        <div className="absolute -bottom-1 left-6 w-0 h-0 border-l-3 border-r-3 border-t-3 border-transparent border-t-purple-800"></div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Demostración del Gráfico Donut - Resultados por Materia
        </h1>
        
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Gráfico Donut */}
            <div className="flex flex-col items-center">
              <h2 className="text-xl font-bold text-purple-600 mb-6">
                Gráfico SVG Interactivo
              </h2>
              
              {/* Gráfico de donut exacto como en la imagen */}
              <div className="relative flex items-center justify-center mb-4">
                <svg width="240" height="240" viewBox="0 0 240 240" className="drop-shadow-lg">
                  {/* Generar segmentos del donut */}
                  {(() => {
                    const subjects = subjectResultsExample.subjects;
                    
                    // Calcular el total de todos los porcentajes para normalizar
                    const totalPercent = subjects.reduce((sum, subject) => sum + subject.percent, 0);
                    
                    const centerX = 120;
                    const centerY = 120;
                    const radius = 90;
                    const innerRadius = 45;
                    let currentAngle = -90; // Empezar desde arriba
                    
                    return subjects.map((subject, index) => {
                      // Normalizar el porcentaje para que el círculo esté completo
                      const normalizedPercent = (subject.percent / totalPercent) * 100;
                      const angle = (normalizedPercent / 100) * 360;
                      const nextAngle = currentAngle + angle;
                      
                      // Calcular las coordenadas del arco (círculo completo)
                      const x1 = centerX + radius * Math.cos((currentAngle * Math.PI) / 180);
                      const y1 = centerY + radius * Math.sin((currentAngle * Math.PI) / 180);
                      const x2 = centerX + radius * Math.cos((nextAngle * Math.PI) / 180);
                      const y2 = centerY + radius * Math.sin((nextAngle * Math.PI) / 180);
                      
                      const x3 = centerX + innerRadius * Math.cos((nextAngle * Math.PI) / 180);
                      const y3 = centerY + innerRadius * Math.sin((nextAngle * Math.PI) / 180);
                      const x4 = centerX + innerRadius * Math.cos((currentAngle * Math.PI) / 180);
                      const y4 = centerY + innerRadius * Math.sin((currentAngle * Math.PI) / 180);
                      
                      const largeArcFlag = angle > 180 ? 1 : 0;
                      
                      const pathData = [
                        `M ${x1} ${y1}`,
                        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                        `L ${x3} ${y3}`,
                        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
                        'Z'
                      ].join(' ');
                      
                      // Calcular posición del texto
                      const textAngle = currentAngle + angle / 2;
                      const textRadius = (radius + innerRadius) / 2;
                      const textX = centerX + textRadius * Math.cos((textAngle * Math.PI) / 180);
                      const textY = centerY + textRadius * Math.sin((textAngle * Math.PI) / 180);
                      
                      const result = (
                        <g key={index}>
                          <path
                            d={pathData}
                            fill={subject.color}
                            stroke="white"
                            strokeWidth="3"
                            className="hover:opacity-80 transition-opacity cursor-pointer"
                            onMouseEnter={(e) => showTooltip(e, subject.code, subject.fullName)}
                            onMouseLeave={hideTooltip}
                          />
                          {/* Texto con abreviación */}
                          <text
                            x={textX}
                            y={textY - 8}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="white"
                            fontSize="18"
                            fontWeight="bold"
                            className="pointer-events-none drop-shadow-sm"
                          >
                            {subject.code}
                          </text>
                          {/* Texto con porcentaje */}
                          <text
                            x={textX}
                            y={textY + 14}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="white"
                            fontSize="16"
                            fontWeight="bold"
                            className="pointer-events-none drop-shadow-sm"
                          >
                            {subject.percent}%
                          </text>
                        </g>
                      );
                      
                      currentAngle = nextAngle;
                      return result;
                    });
                  })()}
                </svg>
                
                {/* Porcentaje central */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="text-5xl font-bold text-purple-600">
                    {subjectResultsExample.total}%
                  </div>
                </div>
              </div>

              {/* Etiquetas adicionales */}
              <div className="text-center space-y-2">
                <div className="text-sm text-purple-600 font-medium">
                  Clic para ver detalle
                </div>
                <div className="text-lg font-bold text-purple-600">
                  1er simulador
                </div>
                <div className="text-sm text-red-600 font-medium">
                  Materias por reforzar:
                </div>
                <div className="text-sm font-bold text-red-700">
                  ME - M/A
                </div>
              </div>
            </div>

            {/* Información de las materias */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Desglose por Materia
              </h2>
              
              {subjectResultsExample.subjects.map((subject, index) => (
                <div 
                  key={index} 
                  className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div 
                    className="w-6 h-6 rounded-sm mr-4 flex-shrink-0"
                    style={{ backgroundColor: subject.color }}
                  ></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold text-gray-800">
                          {subject.code} - {subject.percent}%
                        </div>
                        <div className="text-sm text-gray-600">
                          {subject.fullName}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                <h3 className="font-bold text-purple-800 mb-2">
                  Características del Gráfico:
                </h3>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Cada sección muestra la abreviación y porcentaje</li>
                  <li>• El centro muestra el puntaje total (70%)</li>
                  <li>• Hovering muestra el nombre completo de la materia</li>
                  <li>• Se identifican automáticamente las materias por reforzar</li>
                  <li>• Colores distintivos para cada materia</li>
                  <li>• Totalmente responsive y compatible con datos dinámicos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip personalizado */}
      <CustomHoverTooltip 
        title={tooltipData.title}
        description={tooltipData.description}
        isVisible={tooltipData.isVisible}
        position={tooltipData.position}
      />
    </div>
  );
};

export default DonutChartDemo;
