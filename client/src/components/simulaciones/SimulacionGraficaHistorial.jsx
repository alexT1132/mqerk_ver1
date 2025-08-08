import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  BarChart3, 
  BarChart2,
  Clock, 
  Trophy, 
  Target,
  Calendar,
  Award,
  ArrowLeft,
  Home,
  Activity,
  BookOpen,
  Brain,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  Users,
  Star,
  Sparkles,
  Bot,
  Zap,
  RefreshCw,
  MessageSquare,
  Loader2,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Importar servicios de IA
import { 
  generarAnalisisConGemini, 
  esGeminiConfigurado, 
  obtenerRecursosRecomendados 
} from '../../service/geminiService.js';

/**
 * Página completa responsive para mostrar análisis detallado de rendimiento y retroalimentación
 */
function SimulacionGraficaHistorial({ 
  simulacion, 
  historial, 
  isOpen, 
  onClose,
  tipo = 'generales',        // 'generales' | 'especificos'
  moduloId = null,           // ID del módulo (para específicas)
  categoria = null           // Categoría de la simulación
}) {
  // Hook para detectar diferentes dispositivos y orientación
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [orientation, setOrientation] = useState('portrait');
  
  // Estados para análisis de IA
  const [analisisIA, setAnalisisIA] = useState(null);
  const [cargandoIA, setCargandoIA] = useState(false);
  const [errorIA, setErrorIA] = useState(null);
  const [mostrarAnalisisIA, setMostrarAnalisisIA] = useState(false);
  const [recursos, setRecursos] = useState({});
  const [analisisDisponible, setAnalisisDisponible] = useState(esGeminiConfigurado());
  
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setIsSmallScreen(width < 360);
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setOrientation(width > height ? 'landscape' : 'portrait');
    };
    
    checkDevice();
    
    // Debounce para evitar demasiadas actualizaciones
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkDevice, 100);
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', () => {
      setTimeout(checkDevice, 100);
    });
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', checkDevice);
      clearTimeout(timeoutId);
    };
  }, []);

  // Función para generar análisis con IA
  const generarAnalisisIA = async () => {
    if (!analisisDisponible) {
      setErrorIA('Servicio de IA no configurado');
      return;
    }

    setCargandoIA(true);
    setErrorIA(null);
    
    try {
      // Preparar datos para el análisis
      const datosParaAnalisis = {
        simulacion: simulacion.nombre,
        tipo: tipo,
        categoria: categoria,
        moduloId: moduloId,
        intentos: historial.intentos.length,
        promedio: promedioPuntaje,
        tiempoPromedio: promedioTiempo,
        mejorTiempo: mejorTiempo,
        materias: promediosPorMateria.map(m => ({
          nombre: m.materia,
          promedio: m.promedio,
          tendencia: m.tendencia,
          puntajes: m.puntajes,
          mejorPuntaje: m.mejorPuntaje,
          ultimoPuntaje: m.ultimoPuntaje,
          tiempoPromedio: Math.floor(Math.random() * 20) + 10 // Simular tiempo por materia
        })),
        areasDebiles: areasDebiles.map(a => ({
          nombre: a.materia,
          promedio: a.promedio,
          tipoProblema: a.promedio < 60 ? 'Conceptual' : 'Procedimental',
          frecuenciaErrores: a.promedio < 60 ? 'Alta' : 'Media'
        })),
        contextoEspecifico: {
          tipoSimulacion: tipo,
          moduloNombre: tipo === 'especificos' ? obtenerNombreModulo(moduloId) : null,
          categoriaEspecifica: categoria,
          nivelDificultad: calcularNivelDificultad(promedioPuntaje)
        }
      };

      // Llamar al servicio de IA
      const analisis = await generarAnalisisConGemini(datosParaAnalisis);
      
      // Obtener recursos recomendados para áreas débiles
      const recursosRecomendados = {};
      areasDebiles.forEach(area => {
        recursosRecomendados[area.materia] = obtenerRecursosRecomendados(area.materia);
      });
      
      setAnalisisIA(analisis);
      setRecursos(recursosRecomendados);
      setMostrarAnalisisIA(true);
      
    } catch (error) {
      console.error('Error generando análisis IA:', error);
      setErrorIA('Error al generar análisis. Por favor, intenta nuevamente.');
    } finally {
      setCargandoIA(false);
    }
  };

  // Función para obtener altura de gráfica según dispositivo y orientación
  const getChartHeight = (baseHeight = 250) => {
    if (isSmallScreen) return Math.max(120, baseHeight * 0.6);
    if (isMobile) {
      return orientation === 'landscape' ? Math.max(150, baseHeight * 0.7) : Math.max(180, baseHeight * 0.8);
    }
    if (isTablet) return Math.max(220, baseHeight * 0.9);
    return baseHeight;
  };

  // Función para obtener el tamaño de fuente según el dispositivo
  const getFontSize = (base = 12) => {
    if (isSmallScreen) return Math.max(8, base - 4);
    if (isMobile) return Math.max(10, base - 2);
    return base;
  };

  // Early return después de todos los hooks
  if (!isOpen || !simulacion || !historial) return null;

  // Verificación adicional para evitar errores
  if (!historial.intentos || historial.intentos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 overflow-x-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
            <div className="flex items-center justify-between py-3 sm:py-6">
              <div className="flex items-center space-x-2 sm:space-x-3 w-full">
                <button
                  onClick={onClose}
                  className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0 min-h-[44px] min-w-[44px] touch-manipulation"
                >
                  <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium">Volver</span>
                </button>
                <div className="hidden sm:block w-px h-6 bg-white/20"></div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-sm sm:text-xl lg:text-2xl font-bold">Análisis de Rendimiento</h1>
                  <p className="text-blue-100 text-xs sm:text-sm mt-1 truncate">{simulacion.nombre}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estado vacío */}
        <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-16">
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 max-w-md w-full text-center">
            <Activity className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Sin datos disponibles</h3>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">No hay historial de intentos para mostrar en esta simulación.</p>
            <button
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm sm:text-base w-full sm:w-auto justify-center"
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Volver a Simulaciones
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Datos simulados de materias evaluadas por tipo de simulación - 5 materias por simulación
  const materiasPorSimulacion = {
    // SIMULACIONES GENERALES
    'Simulador EXANI II': [
      { materia: 'Matemáticas', puntajes: [85, 90, 88, 92, 94], color: '#3B82F6', icon: '📐' },
      { materia: 'Español', puntajes: [75, 78, 82, 85, 88], color: '#10B981', icon: '📚' },
      { materia: 'Ciencias', puntajes: [60, 65, 70, 75, 78], color: '#8B5CF6', icon: '🔬' },
      { materia: 'Ciencias Sociales', puntajes: [70, 72, 75, 78, 82], color: '#F59E0B', icon: '🌍' },
      { materia: 'Inglés', puntajes: [55, 60, 65, 70, 74], color: '#EF4444', icon: '🗣️' }
    ],
    'Simulador CENEVAL': [
      { materia: 'Razonamiento Lógico', puntajes: [80, 85, 87, 90, 92], color: '#3B82F6', icon: '🧠' },
      { materia: 'Comprensión Lectora', puntajes: [70, 75, 80, 82, 85], color: '#10B981', icon: '📖' },
      { materia: 'Conocimientos Generales', puntajes: [65, 70, 72, 75, 78], color: '#8B5CF6', icon: '📋' },
      { materia: 'Habilidades Cuantitativas', puntajes: [55, 60, 65, 68, 72], color: '#F59E0B', icon: '🔢' },
      { materia: 'Tecnologías de la Información', puntajes: [62, 66, 69, 73, 76], color: '#EF4444', icon: '💻' }
    ],
    'Simulador PAA': [
      { materia: 'Razonamiento Verbal', puntajes: [78, 82, 85, 88, 90], color: '#3B82F6', icon: '💬' },
      { materia: 'Razonamiento Matemático', puntajes: [72, 75, 78, 82, 85], color: '#10B981', icon: '🔢' },
      { materia: 'Inglés', puntajes: [65, 70, 73, 76, 79], color: '#8B5CF6', icon: '🗣️' },
      { materia: 'Redacción', puntajes: [60, 65, 68, 72, 75], color: '#F59E0B', icon: '✍️' },
      { materia: 'Ciencias Naturales', puntajes: [67, 71, 74, 77, 80], color: '#EF4444', icon: '🔬' }
    ],
    'Pruebas Académicas Generales': [
      { materia: 'Comprensión Lectora', puntajes: [75, 80, 82, 85, 87], color: '#3B82F6', icon: '📖' },
      { materia: 'Matemáticas Básicas', puntajes: [70, 73, 76, 80, 83], color: '#10B981', icon: '🔢' },
      { materia: 'Ciencias Generales', puntajes: [68, 72, 75, 78, 81], color: '#8B5CF6', icon: '🔬' },
      { materia: 'Cultura General', puntajes: [65, 68, 70, 73, 76], color: '#F59E0B', icon: '🌍' },
      { materia: 'Habilidades Analíticas', puntajes: [69, 72, 75, 78, 82], color: '#EF4444', icon: '🎯' }
    ]
  };

  // Datos por módulos específicos - 5 materias esenciales por módulo
  const materiasPorModulo = {
    // Módulo 1: Ciencias Exactas
    1: [
      { materia: 'Cálculo', puntajes: [82, 85, 88, 90, 92], color: '#3B82F6', icon: '📐' },
      { materia: 'Geometría Analítica', puntajes: [75, 78, 82, 85, 88], color: '#10B981', icon: '📊' },
      { materia: 'Probabilidad y Estadística', puntajes: [70, 73, 76, 80, 83], color: '#8B5CF6', icon: '📈' },
      { materia: 'Razonamiento Matemático', puntajes: [68, 72, 75, 78, 82], color: '#F59E0B', icon: '🧠' }
    ],
    // Módulo 2: Ciencias Sociales
    2: [
      { materia: 'Historia', puntajes: [85, 88, 90, 92, 94], color: '#3B82F6', icon: '📜' },
      { materia: 'Lectura Crítica', puntajes: [78, 82, 85, 88, 90], color: '#10B981', icon: '�' },
      { materia: 'Lógica', puntajes: [72, 75, 78, 82, 85], color: '#8B5CF6', icon: '🧠' },
      { materia: 'Ciencias Sociales', puntajes: [70, 73, 76, 80, 83], color: '#F59E0B', icon: '🌍' },
      { materia: 'Cultura General', puntajes: [74, 77, 80, 83, 86], color: '#EF4444', icon: '🎭' }
    ],
    // Módulo 3: Humanidades y Artes
    3: [
      { materia: 'Literatura', puntajes: [88, 90, 92, 94, 96], color: '#3B82F6', icon: '📚' },
      { materia: 'Filosofía', puntajes: [82, 85, 88, 90, 92], color: '#10B981', icon: '�' },
      { materia: 'Historia del Arte', puntajes: [75, 78, 82, 85, 88], color: '#8B5CF6', icon: '🎨' },
      { materia: 'Redacción', puntajes: [70, 73, 76, 80, 83], color: '#F59E0B', icon: '✍️' },
      { materia: 'Comprensión Lectora', puntajes: [76, 79, 82, 85, 88], color: '#EF4444', icon: '�' }
    ],
    // Módulo 4: Ciencias Naturales y de la Salud
    4: [
      { materia: 'Biología Celular y Molecular', puntajes: [80, 83, 86, 89, 91], color: '#3B82F6', icon: '🧬' },
      { materia: 'Química General y Orgánica', puntajes: [75, 78, 82, 85, 88], color: '#10B981', icon: '⚗️' },
      { materia: 'Anatomía', puntajes: [70, 73, 76, 80, 83], color: '#8B5CF6', icon: '🫀' },
      { materia: 'Física', puntajes: [68, 72, 75, 78, 82], color: '#F59E0B', icon: '⚛️' }
    ],
    // Módulo 5: Ingeniería y Tecnología
    5: [
      { materia: 'Cálculo', puntajes: [85, 88, 90, 92, 94], color: '#3B82F6', icon: '�' },
      { materia: 'Trigonometría', puntajes: [78, 82, 85, 88, 90], color: '#10B981', icon: '📏' },
      { materia: 'Física', puntajes: [72, 75, 78, 82, 86], color: '#8B5CF6', icon: '⚛️' },
      { materia: 'Química', puntajes: [70, 73, 76, 80, 84], color: '#F59E0B', icon: '🧪' },
      { materia: 'Programación', puntajes: [74, 77, 80, 83, 87], color: '#EF4444', icon: '�' }
    ],
    // Módulo 6: Ciencias Económico-Administrativas
    6: [
      { materia: 'Matemáticas Financieras', puntajes: [83, 86, 89, 92, 94], color: '#3B82F6', icon: '📊' },
      { materia: 'Estadística', puntajes: [78, 82, 85, 88, 90], color: '#10B981', icon: '📈' },
      { materia: 'Economía', puntajes: [72, 75, 78, 82, 85], color: '#8B5CF6', icon: '💰' },
      { materia: 'Lógica', puntajes: [75, 78, 81, 84, 87], color: '#EF4444', icon: '🧠' }
    ],
    // Módulo 7: Educación y Deportes
    7: [
      { materia: 'Psicología Educativa', puntajes: [86, 89, 92, 94, 96], color: '#3B82F6', icon: '🧠' },
      { materia: 'Biología Humana', puntajes: [80, 83, 86, 89, 91], color: '#10B981', icon: '🔬' },
      { materia: 'Ética', puntajes: [75, 78, 82, 85, 88], color: '#8B5CF6', icon: '⚖️' },
      { materia: 'Sociología', puntajes: [72, 75, 78, 82, 85], color: '#F59E0B', icon: '👥' },
      { materia: 'Fundamentos Educativos', puntajes: [77, 80, 83, 86, 89], color: '#EF4444', icon: '📚' }
    ],
    // Módulo 8: Agropecuarias
    8: [
      { materia: 'Biología Animal y Vegetal', puntajes: [81, 84, 87, 90, 92], color: '#3B82F6', icon: '🌱' },
      { materia: 'Química', puntajes: [76, 79, 82, 85, 88], color: '#10B981', icon: '🧪' },
      { materia: 'Ciencias de la Tierra', puntajes: [71, 74, 77, 80, 83], color: '#8B5CF6', icon: '🌍' },
      { materia: 'Estadística', puntajes: [73, 76, 79, 82, 85], color: '#EF4444', icon: '📊' }
    ],
    // Módulo 9: Turismo
    9: [
      { materia: 'Administración de Servicios', puntajes: [79, 82, 85, 88, 91], color: '#3B82F6', icon: '🏨' },
      { materia: 'Cultura Turística', puntajes: [77, 80, 83, 86, 89], color: '#10B981', icon: '🌐' },
      { materia: 'Economía', puntajes: [72, 75, 78, 81, 84], color: '#8B5CF6', icon: '💰' },
      { materia: 'Atención al Cliente', puntajes: [80, 83, 86, 89, 92], color: '#F59E0B', icon: '👥' }
    ],
    // Módulo 10: Núcleo UNAM / IPN
    10: [
      { materia: 'Biología', puntajes: [76, 79, 83, 86, 89], color: '#3B82F6', icon: '🧬' },
      { materia: 'Geografía', puntajes: [74, 78, 82, 85, 88], color: '#10B981', icon: '🌍' },
      { materia: 'Historia Universal', puntajes: [78, 81, 84, 87, 90], color: '#8B5CF6', icon: '🏛️' },
      { materia: 'Historia de México', puntajes: [80, 83, 86, 89, 92], color: '#F59E0B', icon: '🇲🇽' },
      { materia: 'Literatura', puntajes: [77, 80, 83, 87, 90], color: '#EF4444', icon: '📚' },
      { materia: 'Filosofía', puntajes: [75, 79, 82, 85, 88], color: '#EC4899', icon: '💭' }
    ],
    // Módulo 11: Militar, Naval y Náutica Mercante
    11: [
      { materia: 'Matemáticas', puntajes: [78, 82, 85, 88, 92], color: '#3B82F6', icon: '🔢' },
      { materia: 'Física', puntajes: [75, 79, 83, 86, 90], color: '#10B981', icon: '⚛️' },
      { materia: 'Química', puntajes: [73, 77, 81, 85, 88], color: '#8B5CF6', icon: '🧪' },
      { materia: 'Geografía', puntajes: [80, 83, 86, 89, 92], color: '#F59E0B', icon: '🌍' },
      { materia: 'Historia de México', puntajes: [76, 80, 84, 87, 90], color: '#EF4444', icon: '🇲🇽' },
      { materia: 'Razonamiento lógico', puntajes: [77, 81, 85, 88, 91], color: '#EC4899', icon: '🧠' }
    ],
    // Módulo 12: Módulo Transversal: Análisis Psicométrico
    12: [
      { materia: 'Razonamiento abstracto', puntajes: [82, 85, 88, 91, 94], color: '#3B82F6', icon: '🧩' },
      { materia: 'Secuencias lógicas', puntajes: [80, 83, 87, 90, 93], color: '#10B981', icon: '📊' },
      { materia: 'Habilidad espacial', puntajes: [75, 79, 83, 87, 90], color: '#8B5CF6', icon: '🔷' },
      { materia: 'Atención y memoria', puntajes: [78, 82, 85, 89, 92], color: '#F59E0B', icon: '👁️' },
      { materia: 'Test de matrices', puntajes: [77, 81, 84, 88, 91], color: '#EF4444', icon: '📋' },
      { materia: 'Aptitud verbal y numérica', puntajes: [79, 83, 86, 90, 93], color: '#EC4899', icon: '🔤' },
      { materia: 'Pruebas de personalidad simuladas', puntajes: [85, 87, 90, 92, 95], color: '#0EA5E9', icon: '👤' }
    ]
  };

  // Función para obtener materias según el tipo de simulación
  const obtenerMateriasSimulacion = () => {
    if (tipo === 'generales') {
      // Para simulaciones generales, buscar por nombre
      return materiasPorSimulacion[simulacion.nombre] || [
        { materia: 'Razonamiento Verbal', puntajes: [75, 80, 85, 88, 90], color: '#3B82F6', icon: '💬' },
        { materia: 'Razonamiento Matemático', puntajes: [70, 75, 78, 82, 85], color: '#10B981', icon: '🔢' },
        { materia: 'Conocimientos Generales', puntajes: [68, 72, 75, 78, 82], color: '#8B5CF6', icon: '📋' },
        { materia: 'Comprensión Lectora', puntajes: [65, 70, 73, 76, 80], color: '#F59E0B', icon: '📖' },
        { materia: 'Habilidades Analíticas', puntajes: [67, 71, 74, 77, 81], color: '#EF4444', icon: '🎯' }
      ];
    } else {
      // Para simulaciones específicas, buscar por módulo
      return materiasPorModulo[moduloId] || [
        { materia: 'Área Especializada 1', puntajes: [75, 80, 85, 88, 90], color: '#3B82F6', icon: '🎯' },
        { materia: 'Área Especializada 2', puntajes: [70, 75, 78, 82, 85], color: '#10B981', icon: '📚' },
        { materia: 'Área Especializada 3', puntajes: [68, 72, 75, 78, 82], color: '#8B5CF6', icon: '🔬' },
        { materia: 'Área Especializada 4', puntajes: [65, 70, 73, 76, 80], color: '#F59E0B', icon: '⚡' },
        { materia: 'Área Especializada 5', puntajes: [67, 71, 74, 77, 81], color: '#EF4444', icon: '🎨' }
      ];
    }
  };

  // Obtener materias para la simulación actual
  const materiasActuales = obtenerMateriasSimulacion();

  // Calcular promedios por materia
  const promediosPorMateria = materiasActuales.map(materia => ({
    ...materia,
    promedio: materia.puntajes.reduce((sum, p) => sum + p, 0) / materia.puntajes.length,
    ultimoPuntaje: materia.puntajes[materia.puntajes.length - 1],
    mejorPuntaje: Math.max(...materia.puntajes),
    tendencia: materia.puntajes[materia.puntajes.length - 1] > materia.puntajes[0] ? 'mejora' : 'baja'
  }));

  // Identificar áreas más débiles (promedio < 70)
  const areasDebiles = promediosPorMateria.filter(materia => materia.promedio < 70);
  
  // Preparar datos para gráfica de materias
  const datosMaterias = materiasActuales.map((materia, index) => ({
    materia: materia.materia,
    promedio: materia.puntajes.reduce((sum, p) => sum + p, 0) / materia.puntajes.length,
    ultimo: materia.puntajes[materia.puntajes.length - 1],
    color: materia.color,
    icon: materia.icon
  }));

  // Preparar datos para gráfica de evolución por materia
  const datosEvolucionMaterias = historial.intentos.map((_, index) => {
    const punto = { intento: `Intento ${index + 1}` };
    materiasActuales.forEach(materia => {
      punto[materia.materia] = materia.puntajes[index] || 0;
    });
    return punto;
  });

  // Generar recomendaciones basadas en el análisis
  const generarRecomendaciones = () => {
    const recomendaciones = [];
    
    areasDebiles.forEach(area => {
      if (area.promedio < 60) {
        recomendaciones.push({
          tipo: 'critico',
          materia: area.materia,
          mensaje: `Requiere atención inmediata. Promedio: ${area.promedio.toFixed(1)}%`,
          accion: 'Dedicar tiempo extra de estudio y buscar recursos adicionales'
        });
      } else if (area.promedio < 70) {
        recomendaciones.push({
          tipo: 'atencion',
          materia: area.materia,
          mensaje: `Necesita refuerzo. Promedio: ${area.promedio.toFixed(1)}%`,
          accion: 'Revisar conceptos fundamentales y practicar más ejercicios'
        });
      }
    });

    // Reconocer fortalezas
    const fortalezas = promediosPorMateria.filter(materia => materia.promedio >= 80);
    if (fortalezas.length > 0) {
      recomendaciones.push({
        tipo: 'fortaleza',
        materia: fortalezas[0].materia,
        mensaje: `¡Excelente rendimiento! Promedio: ${fortalezas[0].promedio.toFixed(1)}%`,
        accion: 'Mantener el nivel y ayudar a reforzar otras áreas'
      });
    }

    return recomendaciones;
  };

  // Función para obtener nombre del módulo
  const obtenerNombreModulo = (moduloId) => {
    const modulos = {
      1: 'Ciencias Exactas',
      2: 'Ciencias Sociales',
      3: 'Humanidades y Artes',
      4: 'Ciencias Naturales y de la Salud',
      5: 'Ingeniería y Tecnología',
      6: 'Ciencias Económico-Administrativas',
      7: 'Educación y Deportes',
      8: 'Agropecuarias',
      9: 'Turismo',
      10: 'Núcleo UNAM / IPN',
      11: 'Militar, Naval y Náutica Mercante',
      12: 'Módulo Transversal: Análisis Psicométrico'
    };
    return modulos[moduloId] || 'Módulo Especializado';
  };

  // Función para calcular nivel de dificultad
  const calcularNivelDificultad = (promedio) => {
    if (promedio >= 85) return 'Avanzado';
    if (promedio >= 70) return 'Intermedio';
    return 'Básico';
  };

  // Función para generar recomendaciones contextuales
  const generarRecomendacionesContextuales = () => {
    const recomendaciones = [];
    
    // Recomendaciones específicas según el tipo
    if (tipo === 'generales') {
      // Recomendaciones para simulaciones generales
      areasDebiles.forEach(area => {
        if (area.promedio < 60) {
          recomendaciones.push({
            tipo: 'critico',
            materia: area.materia,
            mensaje: `Área crítica en ${area.materia} para examen de ingreso. Promedio: ${area.promedio.toFixed(1)}%`,
            accion: `Revisar conceptos fundamentales de ${area.materia} y practicar con ejercicios del CENEVAL/EXANI`,
            recursos: [
              'Guías oficiales del CENEVAL',
              'Ejercicios de práctica en línea',
              'Cursos intensivos de repaso'
            ]
          });
        } else if (area.promedio < 70) {
          recomendaciones.push({
            tipo: 'atencion',
            materia: area.materia,
            mensaje: `Necesita refuerzo en ${area.materia}. Promedio: ${area.promedio.toFixed(1)}%`,
            accion: `Practicar ejercicios específicos de ${area.materia} y tomar simulacros adicionales`,
            recursos: [
              'Simulacros en línea',
              'Libros de ejercicios',
              'Videos explicativos'
            ]
          });
        }
      });
    } else {
      // Recomendaciones para simulaciones específicas
      const nombreModulo = obtenerNombreModulo(moduloId);
      areasDebiles.forEach(area => {
        if (area.promedio < 60) {
          recomendaciones.push({
            tipo: 'critico',
            materia: area.materia,
            mensaje: `Área crítica en ${area.materia} para ${nombreModulo}. Promedio: ${area.promedio.toFixed(1)}%`,
            accion: `Estudiar teoría específica de ${area.materia} y realizar ejercicios especializados`,
            recursos: [
              `Libros especializados en ${nombreModulo}`,
              'Laboratorios virtuales',
              'Tutorías personalizadas'
            ]
          });
        } else if (area.promedio < 70) {
          recomendaciones.push({
            tipo: 'atencion',
            materia: area.materia,
            mensaje: `Refuerzo necesario en ${area.materia} para ${nombreModulo}. Promedio: ${area.promedio.toFixed(1)}%`,
            accion: `Practicar casos específicos de ${area.materia} y conectar con aplicaciones reales`,
            recursos: [
              'Ejercicios prácticos',
              'Casos de estudio',
              'Proyectos aplicados'
            ]
          });
        }
      });
    }

    // Reconocer fortalezas
    const fortalezas = promediosPorMateria.filter(materia => materia.promedio >= 80);
    if (fortalezas.length > 0) {
      const mejorArea = fortalezas[0];
      recomendaciones.push({
        tipo: 'fortaleza',
        materia: mejorArea.materia,
        mensaje: `¡Excelente rendimiento en ${mejorArea.materia}! Promedio: ${mejorArea.promedio.toFixed(1)}%`,
        accion: `Mantener el nivel en ${mejorArea.materia} y usar esta fortaleza para apoyar otras áreas`,
        recursos: [
          'Ejercicios de nivel avanzado',
          'Competencias académicas',
          'Tutoría a otros estudiantes'
        ]
      });
    }

    return recomendaciones;
  };

  const recomendacionesContextuales = generarRecomendacionesContextuales();

  // Preparar datos para las gráficas con verificaciones
  const datosGrafica = historial.intentos.map((intento, index) => ({
    intento: `Intento ${index + 1}`,
    puntaje: intento.puntaje || 0,
    tiempo: intento.tiempoEmpleado || 0,
    fecha: intento.fecha ? new Date(intento.fecha).toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit' 
    }) : 'N/A'
  }));

  // Estadísticas calculadas con verificaciones
  const promedioPuntaje = historial.intentos.length > 0 
    ? historial.intentos.reduce((sum, i) => sum + (i.puntaje || 0), 0) / historial.intentos.length
    : 0;
  const mejorTiempo = historial.intentos.length > 0 
    ? Math.min(...historial.intentos.map(i => i.tiempoEmpleado || 0).filter(t => t > 0))
    : 0;
  const promedioTiempo = historial.intentos.length > 0 
    ? historial.intentos.reduce((sum, i) => sum + (i.tiempoEmpleado || 0), 0) / historial.intentos.length
    : 0;

  return (
    <div 
      className="min-h-screen bg-gray-50 overflow-x-hidden"
      style={{
        WebkitOverflowScrolling: 'touch',
        position: 'relative',
        width: '100%',
        maxWidth: '100vw'
      }}
    >
      {/* Header responsive */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between py-3 sm:py-6">
            <div className="flex items-center space-x-2 sm:space-x-3 w-full">
              <button
                onClick={onClose}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0 min-h-[44px] min-w-[44px]"
                style={{ touchAction: 'manipulation' }}
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-medium">Volver</span>
              </button>
              <div className="hidden sm:block w-px h-6 bg-white/20"></div>
              <div className="flex-1 min-w-0">
                <h1 className="text-sm sm:text-xl lg:text-2xl font-bold flex items-center space-x-1 sm:space-x-2">
                  <BarChart2 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 flex-shrink-0" />
                  <span className="truncate">Análisis de Rendimiento</span>
                </h1>
                <p className="text-blue-100 text-xs sm:text-sm mt-1 truncate">{simulacion.nombre}</p>
                {/* Mostrar información contextual */}
                <div className="flex items-center space-x-3 mt-2 text-xs sm:text-sm text-blue-200">
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-blue-300 rounded-full"></span>
                    <span>{tipo === 'generales' ? 'Simulación General' : 'Simulación Específica'}</span>
                  </span>
                  {tipo === 'especificos' && moduloId && (
                    <span className="flex items-center space-x-1">
                      <span className="w-2 h-2 bg-green-300 rounded-full"></span>
                      <span>{obtenerNombreModulo(moduloId)}</span>
                    </span>
                  )}
                  {categoria && (
                    <span className="flex items-center space-x-1">
                      <span className="w-2 h-2 bg-yellow-300 rounded-full"></span>
                      <span>{categoria}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-6">
        {/* Estadísticas principales - Grid responsive optimizado */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6 lg:mb-8">
          <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg flex-shrink-0">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 truncate">Mejor Puntaje</p>
                <p className="text-base sm:text-lg lg:text-xl font-bold text-green-600 leading-tight">
                  {historial.mejorPuntaje || Math.max(...historial.intentos.map(i => i.puntaje || 0))}%
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 truncate">Promedio</p>
                <p className="text-base sm:text-lg lg:text-xl font-bold text-blue-600 leading-tight">{promedioPuntaje.toFixed(1)}%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg flex-shrink-0">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 truncate">Mejor Tiempo</p>
                <p className="text-base sm:text-lg lg:text-xl font-bold text-purple-600 leading-tight">{mejorTiempo}min</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-orange-100 rounded-lg flex-shrink-0">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-orange-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 truncate">Intentos</p>
                <p className="text-base sm:text-lg lg:text-xl font-bold text-orange-600 leading-tight">
                  {historial.totalIntentos || historial.intentos.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Análisis por Materias/Áreas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 mb-6 sm:mb-8">
          <div className="flex items-center mb-4 sm:mb-6">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mr-2 flex-shrink-0" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">Análisis por Materias/Áreas</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {promediosPorMateria.map((materia, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <span className="text-base sm:text-lg flex-shrink-0">{materia.icon}</span>
                    <span className="font-medium text-gray-900 text-xs sm:text-sm truncate">{materia.materia}</span>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${
                    materia.promedio >= 80 ? 'bg-green-100 text-green-800' :
                    materia.promedio >= 70 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {materia.promedio.toFixed(1)}%
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                  <span>Último: {materia.ultimoPuntaje}%</span>
                  <span>Mejor: {materia.mejorPuntaje}%</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  {materia.tendencia === 'mejora' ? (
                    <TrendingUp className="w-3 h-3 text-green-500 flex-shrink-0" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-500 flex-shrink-0" />
                  )}
                  <span className={`text-xs font-medium truncate ${
                    materia.tendencia === 'mejora' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {materia.tendencia === 'mejora' ? 'Mejorando' : 'Descendente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Gráfica de rendimiento por materias - Responsive */}
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 overflow-hidden">
            <h4 className="font-medium text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Comparación de Rendimiento</h4>
            <div className="w-full overflow-x-auto scrollbar-hide" style={{WebkitOverflowScrolling: 'touch'}}>
              <div className="min-w-[280px] sm:min-w-[400px]">
                <ResponsiveContainer width="100%" height={isSmallScreen ? 150 : isMobile ? 180 : isTablet ? 220 : 250}>
                  <BarChart data={datosMaterias}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="materia" 
                      tick={{ fontSize: isSmallScreen ? 7 : isMobile ? 8 : 10 }}
                      angle={isMobile ? -45 : 0}
                      textAnchor={isMobile ? "end" : "middle"}
                      height={isMobile ? 50 : 60}
                      interval={0}
                    />
                    <YAxis 
                      domain={[0, 100]}
                      tick={{ fontSize: isSmallScreen ? 7 : isMobile ? 8 : 10 }}
                      width={isMobile ? 25 : 35}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#F9FAFB', 
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: isSmallScreen ? '10px' : isMobile ? '11px' : '12px',
                        padding: '8px'
                      }}
                      formatter={(value) => [`${value}%`, 'Promedio']}
                    />
                    <Bar dataKey="promedio" radius={[4, 4, 0, 0]}>
                      {datosMaterias.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Retroalimentación y Recomendaciones */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 mb-6 sm:mb-8">
          <div className="flex items-center mb-4 sm:mb-6">
            <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 mr-2 flex-shrink-0" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Retroalimentación y Recomendaciones</h3>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {recomendacionesContextuales.map((rec, index) => (
              <div key={index} className={`p-3 sm:p-4 rounded-lg border-l-4 ${
                rec.tipo === 'critico' ? 'bg-red-50 border-red-500' :
                rec.tipo === 'atencion' ? 'bg-yellow-50 border-yellow-500' :
                'bg-green-50 border-green-500'
              }`}>
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {rec.tipo === 'critico' ? (
                      <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                    ) : rec.tipo === 'atencion' ? (
                      <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                    ) : (
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium text-sm sm:text-base ${
                      rec.tipo === 'critico' ? 'text-red-800' :
                      rec.tipo === 'atencion' ? 'text-yellow-800' :
                      'text-green-800'
                    }`}>
                      {rec.materia}
                    </h4>
                    <p className={`text-xs sm:text-sm mt-1 ${
                      rec.tipo === 'critico' ? 'text-red-700' :
                      rec.tipo === 'atencion' ? 'text-yellow-700' :
                      'text-green-700'
                    }`}>
                      {rec.mensaje}
                    </p>
                    <p className={`text-xs mt-2 font-medium ${
                      rec.tipo === 'critico' ? 'text-red-600' :
                      rec.tipo === 'atencion' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      📋 {rec.accion}
                    </p>
                    {rec.recursos && rec.recursos.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-600 mb-1">Recursos recomendados:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {rec.recursos.map((recurso, idx) => (
                            <li key={idx} className="flex items-center space-x-1">
                              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                              <span>{recurso}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Análisis Inteligente con IA */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 mr-2 flex-shrink-0" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Análisis Inteligente con IA</h3>
              <span className="ml-2 px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full">
                {analisisDisponible ? 'Disponible' : 'Demo'}
              </span>
            </div>
            
            <button
              onClick={generarAnalisisIA}
              disabled={cargandoIA}
              className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium transition-colors text-sm"
            >
              {cargandoIA ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analizando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generar Análisis</span>
                </>
              )}
            </button>
          </div>

          {/* Estado de carga */}
          {cargandoIA && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-3">
                <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                <div>
                  <p className="text-sm font-medium text-indigo-800">Analizando tu rendimiento...</p>
                  <p className="text-xs text-indigo-600 mt-1">
                    La IA está evaluando tus datos para generar recomendaciones personalizadas
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {errorIA && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-red-800">Error en el análisis</p>
                  <p className="text-xs text-red-600 mt-1">{errorIA}</p>
                </div>
              </div>
            </div>
          )}

          {/* Análisis de IA */}
          {analisisIA && mostrarAnalisisIA && (
            <div className="space-y-4 sm:space-y-6">
              {/* Resumen general */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4 sm:p-6">
                <div className="flex items-start space-x-3">
                  <MessageSquare className="w-5 h-5 text-indigo-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-indigo-900 text-sm sm:text-base mb-2">
                      Resumen del Análisis
                    </h4>
                    <p className="text-indigo-800 text-xs sm:text-sm leading-relaxed">
                      {analisisIA.resumen}
                    </p>
                  </div>
                </div>
              </div>

              {/* Fortalezas */}
              {analisisIA.fortalezas && analisisIA.fortalezas.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6">
                  <h4 className="font-semibold text-green-900 text-sm sm:text-base mb-3 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Fortalezas Identificadas
                  </h4>
                  <div className="space-y-3">
                    {analisisIA.fortalezas.map((fortaleza, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 border border-green-200">
                        <h5 className="font-medium text-green-800 text-sm mb-1">
                          {fortaleza.materia}
                        </h5>
                        <p className="text-green-700 text-xs sm:text-sm">
                          {fortaleza.comentario}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Áreas de mejora */}
              {analisisIA.debilidades && analisisIA.debilidades.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6">
                  <h4 className="font-semibold text-yellow-900 text-sm sm:text-base mb-3 flex items-center">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Áreas de Mejora
                  </h4>
                  <div className="space-y-4">
                    {analisisIA.debilidades.map((debilidad, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 border border-yellow-200">
                        <h5 className="font-medium text-yellow-800 text-sm mb-1">
                          {debilidad.materia}
                        </h5>
                        <p className="text-yellow-700 text-xs sm:text-sm mb-2">
                          {debilidad.comentario}
                        </p>
                        {debilidad.accionesEspecificas && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-yellow-800 mb-1">
                              Acciones recomendadas:
                            </p>
                            <ul className="text-xs text-yellow-700 space-y-1 pl-4">
                              {debilidad.accionesEspecificas.map((accion, i) => (
                                <li key={i} className="list-disc">{accion}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Plan de estudio */}
              {analisisIA.planEstudio && analisisIA.planEstudio.prioridad && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
                  <h4 className="font-semibold text-blue-900 text-sm sm:text-base mb-3 flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    Plan de Estudio Personalizado
                  </h4>
                  <div className="space-y-3">
                    {analisisIA.planEstudio.prioridad.map((item, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 border border-blue-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-blue-800 text-sm">
                              {item.materia}
                            </h5>
                            <p className="text-blue-700 text-xs mt-1">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {item.tiempo}
                            </p>
                            <p className="text-blue-600 text-xs mt-1">
                              {item.enfoque}
                            </p>
                          </div>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            Prioridad {index + 1}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recursos recomendados */}
              {Object.keys(recursos).length > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 sm:p-6">
                  <h4 className="font-semibold text-purple-900 text-sm sm:text-base mb-3 flex items-center">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Recursos Recomendados
                  </h4>
                  <div className="space-y-4">
                    {Object.entries(recursos).map(([materia, recursosMateria]) => (
                      <div key={materia} className="bg-white rounded-lg p-3 border border-purple-200">
                        <h5 className="font-medium text-purple-800 text-sm mb-2">
                          {materia}
                        </h5>
                        <div className="space-y-2">
                          {recursosMateria.map((recurso, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                  {recurso.tipo}
                                </span>
                                <span className="text-sm text-purple-700">
                                  {recurso.nombre}
                                </span>
                              </div>
                              {recurso.url !== '#' && (
                                <a
                                  href={recurso.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-600 hover:text-purple-800"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mensaje inicial */}
          {!analisisIA && !cargandoIA && !errorIA && (
            <div className="text-center py-6 sm:py-8">
              <Bot className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                Análisis Inteligente con IA
              </h4>
              <p className="text-gray-600 text-sm sm:text-base mb-4 max-w-md mx-auto">
                Obtén recomendaciones personalizadas basadas en tu rendimiento y patrones de aprendizaje
              </p>
              <button
                onClick={generarAnalisisIA}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generar Análisis</span>
              </button>
            </div>
          )}
        </div>

        {/* Gráficas de Evolución */}
        <div className="space-y-6 mb-6 sm:mb-8">
          {/* Gráfica de puntajes generales */}
          <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-3 sm:mb-4">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mr-2 flex-shrink-0" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Evolución General</h3>
            </div>
            <div className="w-full overflow-x-auto scrollbar-hide" style={{WebkitOverflowScrolling: 'touch'}}>
              <div className="min-w-[300px] sm:min-w-[400px]">
                <ResponsiveContainer width="100%" height={isMobile ? 200 : 300} minWidth={300}>
                  <AreaChart data={datosGrafica}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="intento" 
                      tick={{ fontSize: isMobile ? 8 : 12 }}
                      interval={0}
                    />
                    <YAxis 
                      domain={[0, 100]}
                      tick={{ fontSize: isMobile ? 8 : 12 }}
                      width={isMobile ? 30 : 40}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#F9FAFB', 
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: isMobile ? '11px' : '12px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="puntaje" 
                      stroke="#3B82F6" 
                      fill="url(#gradientPuntaje)"
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id="gradientPuntaje" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SimulacionGraficaHistorial;