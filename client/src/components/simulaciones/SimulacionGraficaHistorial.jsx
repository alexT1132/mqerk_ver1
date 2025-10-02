import React, { useState, useEffect, useRef } from 'react';
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
  // Métricas de efectividad del análisis de IA
  const [metricasIA, setMetricasIA] = useState(null);
  const [cooldownIA, setCooldownIA] = useState(0); // segundos de cooldown tras 429
  const [ultimoAvisoIA, setUltimoAvisoIA] = useState(null);
  const [firmaAnalisis, setFirmaAnalisis] = useState(null); // firma de datos usada
  const [mensajeNoCambio, setMensajeNoCambio] = useState(null);
  const enProcesoRef = useRef(false);
  const [sugerenciasPersonalizadas, setSugerenciasPersonalizadas] = useState(null);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(true);
  const [insightsAvanzados, setInsightsAvanzados] = useState(null);

  // Reducir cooldown cada segundo
  useEffect(() => {
    if (cooldownIA <= 0) return;
    const t = setTimeout(() => setCooldownIA(cooldownIA - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldownIA]);

  // Función para calcular métricas de efectividad comparando el análisis IA con reglas heurísticas locales
  const calcularMetricasIA = (analisis, materiasPromedios) => {
    if (!analisis || !materiasPromedios || materiasPromedios.length === 0) return null;

    // Definir baseline heurístico
    const debilidadesBaseline = new Set(
      materiasPromedios.filter(m => m.promedio < 70).map(m => m.materia)
    );
    const fortalezasBaseline = new Set(
      materiasPromedios.filter(m => m.promedio >= 80).map(m => m.materia)
    );

    // Extraer del análisis IA (normalizar nombres)
    const debilidadesIA = new Set(
      (analisis.debilidades || [])
        .map(d => (d.materia || d.nombre || '').trim())
        .filter(Boolean)
    );
    const fortalezasIA = new Set(
      (analisis.fortalezas || [])
        .map(f => (f.materia || f.nombre || '').trim())
        .filter(Boolean)
    );

    // Función helper para métricas
    const calcPRF1 = (predSet, realSet) => {
      if (predSet.size === 0 && realSet.size === 0) {
        return { precision: 1, recall: 1, f1: 1, tp: 0 };
      }
      let tp = 0;
      predSet.forEach(v => { if (realSet.has(v)) tp++; });
      const precision = predSet.size === 0 ? 0 : tp / predSet.size;
      const recall = realSet.size === 0 ? 0 : tp / realSet.size;
      const f1 = (precision + recall) === 0 ? 0 : (2 * precision * recall) / (precision + recall);
      return { precision, recall, f1, tp };
    };

    const mDebilidades = calcPRF1(debilidadesIA, debilidadesBaseline);
    const mFortalezas = calcPRF1(fortalezasIA, fortalezasBaseline);

    // Cobertura: materias mencionadas por la IA / total
    const materiasReferenciadas = new Set([
      ...Array.from(debilidadesIA),
      ...Array.from(fortalezasIA),
      ...((analisis.planEstudio && analisis.planEstudio.prioridad) ? analisis.planEstudio.prioridad.map(p => p.materia) : [])
    ].filter(Boolean));

    const cobertura = materiasPromedios.length === 0 ? 0 : materiasReferenciadas.size / materiasPromedios.length;

    // Puntaje global (promedio ponderado: F1 debilidades 60%, F1 fortalezas 30%, cobertura 10%)
    const puntajeGlobal = (mDebilidades.f1 * 0.6) + (mFortalezas.f1 * 0.3) + (cobertura * 0.1);

    return {
      debilidades: { ...mDebilidades, pred: debilidadesIA.size, gold: debilidadesBaseline.size },
      fortalezas: { ...mFortalezas, pred: fortalezasIA.size, gold: fortalezasBaseline.size },
      cobertura: { valor: cobertura, materiasReferenciadas: materiasReferenciadas.size, total: materiasPromedios.length },
      puntajeGlobal
    };
  };

  // Generar sugerencias personalizadas basadas en datos locales + salida IA
  const generarSugerenciasPersonalizadas = (analisis, materiasProm) => {
    if (!analisis) return null;
    const debiles = materiasProm.filter(m => m.promedio < 70).sort((a,b)=>a.promedio-b.promedio);
    const fuertes = materiasProm.filter(m => m.promedio >= 80).sort((a,b)=>b.promedio-a.promedio);

    const causas = debiles.map(d => ({
      materia: d.materia,
      causaProbable: d.promedio < 55 ? 'Déficit de fundamentos básicos' : d.promedio < 63 ? 'Baja consolidación conceptual' : 'Necesita más práctica aplicada',
      recomendacion: d.promedio < 55 ? 'Reforzar definiciones y ejemplos base antes de ejercicios largos.' : d.promedio < 63 ? 'Construir mapas conceptuales y resolver mini-quizzes.' : 'Aumentar volumen de ejercicios cronometrados y revisión de errores.'
    }));

    const plan7Dias = [];
    const dias = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
    dias.forEach((dia, idx) => {
      const materiaObjetivo = debiles[idx % (debiles.length || 1)];
      if (materiaObjetivo) {
        plan7Dias.push({
          dia,
          materia: materiaObjetivo.materia,
          foco: idx < 2 ? 'Fundamentos' : idx < 4 ? 'Práctica guiada' : idx < 6 ? 'Simulacro corto' : 'Repaso + autoevaluación',
          duracion: materiaObjetivo.promedio < 60 ? '45-50 min' : '30-40 min'
        });
      } else {
        plan7Dias.push({ dia, materia: 'General', foco: 'Lectura activa / descanso activo', duracion: '25-30 min'});
      }
    });

    const apalancarFortalezas = fuertes.slice(0,2).map(f => ({
      materia: f.materia,
      estrategia: 'Usar tu dominio para explicar a otro estudiante 1 concepto diario y detectar huecos cognitivos ocultos.'
    }));

    const quickTips = [
      'Ancla cada concepto nuevo a un ejemplo real (efecto de codificación dual).',
      'Después de estudiar 25 min, escribe (sin mirar) 3 puntos clave: promueve recuperación activa.',
      'Registra tus errores recurrentes en una libreta rápida y revísala antes de iniciar un nuevo bloque.'
    ];

    return {
      causas,
      plan7Dias,
      apalancarFortalezas,
      quickTips,
      timestamp: new Date().toISOString()
    };
  };

  // Métricas avanzadas cuantitativas para priorizar acciones
  const calcularInsightsAvanzados = (materiasProm) => {
    if (!materiasProm || materiasProm.length === 0) return null;

    // Funciones auxiliares
    const slope = (serie) => {
      if (serie.length < 2) return 0;
      const n = serie.length;
      const xs = Array.from({length:n}, (_,i)=>i+1);
      const xMean = xs.reduce((a,b)=>a+b,0)/n;
      const yMean = serie.reduce((a,b)=>a+b,0)/n;
      let num=0, den=0;
      for (let i=0;i<n;i++){ num += (xs[i]-xMean)*(serie[i]-yMean); den += Math.pow(xs[i]-xMean,2);} 
      return den===0?0:num/den; // pendiente simple
    };
    const stdev = (arr) => {
      if (arr.length < 2) return 0;
      const m = arr.reduce((a,b)=>a+b,0)/arr.length;
      return Math.sqrt(arr.reduce((a,b)=>a+Math.pow(b-m,2),0)/arr.length);
    };

    const materiasDetalladas = materiasProm.map(m => {
      const serie = m.puntajes || [];
      const pend = slope(serie);
      const vol = stdev(serie);
      const severidad = m.promedio < 55 ? 'crítica' : m.promedio < 65 ? 'alta' : m.promedio < 70 ? 'media' : m.promedio < 80 ? 'moderada' : 'baja';
      const momentum = pend > 1 ? 'acelerando' : pend > 0.3 ? 'mejorando' : pend < -1 ? 'retroceso fuerte' : pend < -0.3 ? 'bajando' : 'plano';
      const estabilidad = vol < 3 ? 'muy estable' : vol < 6 ? 'estable' : vol < 10 ? 'variable' : 'volátil';
      const horasSugeridasSemana = severidad==='crítica' ? 4 : severidad==='alta' ? 3 : severidad==='media' ? 2 : severidad==='moderada' ? 1.5 : 1;
      return {
        materia: m.materia,
        promedio: m.promedio,
        severidad,
        momentum,
        estabilidad,
        horasSugeridasSemana,
        pendiente: pend,
        volatilidad: vol
      };
    });

    // Priorización: severidad > momentum negativo > menor promedio
    const ordenSeveridad = { 'crítica':5,'alta':4,'media':3,'moderada':2,'baja':1 };
    const ordenMomentum = { 'retroceso fuerte':4,'bajando':3,'plano':2,'mejorando':1,'acelerando':0 };
    const priorizadas = [...materiasDetalladas].sort((a,b)=>{
      const s = ordenSeveridad[b.severidad]-ordenSeveridad[a.severidad];
      if (s!==0) return s;
      const mo = ordenMomentum[b.momentum]-ordenMomentum[a.momentum];
      if (mo!==0) return mo;
      return a.promedio - b.promedio;
    }).map((m,i)=>({ prioridad:i+1, ...m }));

    // Sugerencia total horas (suma y ajuste a múltiplos de 0.5)
    let totalHoras = materiasDetalladas.reduce((a,b)=>a + b.horasSugeridasSemana,0);
    totalHoras = Math.round(totalHoras*2)/2;

    return { materias: priorizadas, totalHoras, timestamp: new Date().toISOString() };
  };
  
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

  // Función para generar análisis con IA (optimizada con firma y lock)
  const generarAnalisisIA = async () => {
    if (!analisisDisponible) {
      setErrorIA('Servicio de IA no configurado');
      return;
    }
    if (cooldownIA > 0) {
      setErrorIA(`Espera ${cooldownIA}s antes de solicitar de nuevo el análisis.`);
      return;
    }
    if (enProcesoRef.current) return; // prevenir doble click

    // Construir firma de datos relevantes
    try {
      const firmaNueva = JSON.stringify({
        intentos: historial.intentos.map(i => ({ p: i.puntaje || 0, t: i.tiempoEmpleado || 0 })).slice(-12),
        totalIntentos: historial.intentos.length,
        promedio: Number(promedioPuntaje.toFixed(2)),
        materias: promediosPorMateria.map(m => ({ n: m.materia, pr: Number(m.promedio.toFixed(2)), ul: m.ultimoPuntaje, me: m.mejorPuntaje }))
      });
      if (firmaAnalisis && firmaAnalisis === firmaNueva && analisisIA) {
        setMensajeNoCambio('No hubo cambios en los datos. Se reutiliza el último análisis.');
        setMostrarAnalisisIA(true);
        return;
      }
      setMensajeNoCambio(null);
      setFirmaAnalisis(firmaNueva);
    } catch(e) {
      console.warn('No se pudo generar firma de análisis:', e);
    }

    setCargandoIA(true);
    setErrorIA(null);
    enProcesoRef.current = true;
    
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
      if (analisis.esFallbackLocal) {
        setUltimoAvisoIA('Mostrando análisis heurístico local (límite de cuota 429).');
        setCooldownIA(60); // enfriar 1 minuto
      } else if (analisis.desdeCache) {
        setUltimoAvisoIA('Mostrando análisis previo desde cache por límite de cuota.');
        setCooldownIA(45);
      } else if (analisis.aviso) {
        setUltimoAvisoIA(analisis.aviso);
      } else {
        setUltimoAvisoIA(null);
      }
      
      // Obtener recursos recomendados para áreas débiles
      const recursosRecomendados = {};
      areasDebiles.forEach(area => {
        recursosRecomendados[area.materia] = obtenerRecursosRecomendados(area.materia);
      });
      
      setAnalisisIA(analisis);
      setRecursos(recursosRecomendados);
      setMostrarAnalisisIA(true);
      // Calcular métricas de efectividad
      const m = calcularMetricasIA(analisis, promediosPorMateria);
      setMetricasIA(m);
  const sug = generarSugerenciasPersonalizadas(analisis, promediosPorMateria);
  setSugerenciasPersonalizadas(sug);
  const insights = calcularInsightsAvanzados(promediosPorMateria);
  setInsightsAvanzados(insights);
      
    } catch (error) {
      console.error('Error generando análisis IA:', error);
      if (error.message && error.message.includes('Límite de peticiones')) {
        setErrorIA('Límite de peticiones excedido. Se intentó fallback local.');
        setCooldownIA(60);
      } else {
        setErrorIA('Error al generar análisis. Por favor, intenta nuevamente.');
      }
    } finally {
      setCargandoIA(false);
      enProcesoRef.current = false;
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

  // Reemplazado: se eliminan datos simulados de materias; ahora se derivan de analytics backend
  const materiasActuales = (analytics?.materias || []).map(m => ({
    materia: m.nombre,
    promedio: m.ratio,
    icon: '📘',
    color: '#3B82F6',
    puntajes: [] // pendiente evolución por materia real
  }));

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
  <div className="max-w-full lg:max-w-7xl mx-auto px-0 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between py-3 sm:py-6">
            <div className="flex items-center space-x-2 sm:space-x-3 w-full">
              <button
                onClick={onClose}
                className="flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colores flex-shrink-0 min-h-[44px] min-w-[44px] active:scale-[0.98]"
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
  <div className="max-w-full lg:max-w-7xl mx-auto px-0 sm:px-4 lg:px-8 py-3 sm:py-6">
        {/* Estadísticas principales - Grid responsive optimizado */}
  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6 lg:mb-8">
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
          
          <div className="grid grid-cols-1 min-[380px]:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
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
              <div className="min-w-[320px] sm:min-w-[420px]">
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
              {analisisIA && analisisIA.esFallbackLocal && (
                <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Fallback Local</span>
              )}
              {analisisIA && analisisIA.desdeCache && (
                <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">Cache</span>
              )}
            </div>
            
            <button
              onClick={generarAnalisisIA}
              disabled={cargandoIA || cooldownIA > 0}
              className="flex items-center justify-center w-full sm:w-auto space-x-2 px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium transition-colores text-sm"
            >
              {cargandoIA ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analizando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{cooldownIA > 0 ? `Espera ${cooldownIA}s` : 'Generar Análisis'}</span>
                </>
              )}
            </button>
          </div>

          {ultimoAvisoIA && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-yellow-700">{ultimoAvisoIA}</p>
            </div>
          )}
          {mensajeNoCambio && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-700">{mensajeNoCambio}</p>
            </div>
          )}

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
              {/* Sugerencias Personalizadas */}
              {sugerenciasPersonalizadas && (
                <div className="bg-white border border-blue-200 rounded-lg p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-blue-900 text-sm sm:text-base flex items-center">
                      <Lightbulb className="w-4 h-4 mr-2 text-blue-500" />
                      Sugerencias Inteligentes Personalizadas
                    </h4>
                    <button onClick={()=>setMostrarSugerencias(!mostrarSugerencias)} className="text-xs text-blue-600 hover:underline">
                      {mostrarSugerencias ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>
                  {mostrarSugerencias && (
                    <div className="space-y-5">
                      <div>
                        <p className="text-xs sm:text-sm text-blue-800 font-medium mb-2">Diagnóstico de Causas Probables</p>
                        <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                          {sugerenciasPersonalizadas.causas.map((c,i)=>(
                            <div key={i} className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                              <p className="text-xs font-semibold text-blue-700 truncate">{c.materia}</p>
                              <p className="text-[11px] text-blue-600 mt-1"><span className="font-medium">Causa:</span> {c.causaProbable}</p>
                              <p className="text-[11px] text-blue-600 mt-1"><span className="font-medium">Acción:</span> {c.recomendacion}</p>
                            </div>
                          ))}
                          {sugerenciasPersonalizadas.causas.length === 0 && (
                            <div className="text-xs text-blue-600">Sin áreas críticas; mantén consistencia.</div>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-blue-800 font-medium mb-2">Plan de 7 Días (Ciclos Cortos)</p>
                        <div className="overflow-x-auto scrollbar-hide">
                          <div className="flex space-x-2">
                            {sugerenciasPersonalizadas.plan7Dias.map((p,i)=>(
                              <div key={i} className="min-w-[110px] bg-white border border-blue-100 rounded-lg p-2 shadow-sm">
                                <p className="text-[10px] font-semibold text-blue-700">{p.dia}</p>
                                <p className="text-[10px] text-blue-600 truncate">{p.materia}</p>
                                <p className="text-[10px] text-blue-500 mt-1">{p.foco}</p>
                                <p className="text-[10px] text-blue-400">{p.duracion}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-blue-800 font-medium mb-2">Apalancar Fortalezas</p>
                        <div className="grid gap-3 md:grid-cols-2">
                          {sugerenciasPersonalizadas.apalancarFortalezas.map((f,i)=>(
                            <div key={i} className="bg-green-50 border border-green-100 rounded-lg p-3">
                              <p className="text-xs font-semibold text-green-700">{f.materia}</p>
                              <p className="text-[11px] text-green-600 mt-1 leading-snug">{f.estrategia}</p>
                            </div>
                          ))}
                          {sugerenciasPersonalizadas.apalancarFortalezas.length === 0 && (
                            <div className="text-xs text-green-600">Se generará cuando exista al menos una materia ≥ 80%.</div>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-blue-800 font-medium mb-2">Quick Tips Cognitivos</p>
                        <ul className="list-disc pl-4 space-y-1">
                          {sugerenciasPersonalizadas.quickTips.map((t,i)=>(
                            <li key={i} className="text-[11px] text-blue-700 leading-snug">{t}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={()=>{
                            try {
                              const texto = JSON.stringify(sugerenciasPersonalizadas, null, 2);
                              navigator.clipboard.writeText(texto);
                              setUltimoAvisoIA('Plan copiado al portapapeles.');
                            } catch(e) { console.warn('No se pudo copiar', e); }
                          }}
                          className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                        >Copiar Plan</button>
                        <button
                          onClick={()=>setMostrarSugerencias(false)}
                          className="px-3 py-1.5 text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
                        >Cerrar</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Panel Acciones Prioritarias */}
              {insightsAvanzados && (
                <div className="bg-white border border-rose-200 rounded-lg p-4 sm:p-6">
                  <h4 className="font-semibold text-rose-900 text-sm sm:text-base mb-3 flex items-center">
                    <Target className="w-4 h-4 mr-2 text-rose-500" />
                    Acciones Prioritarias (Datos Cuantitativos)
                  </h4>
                  <p className="text-[11px] text-rose-700 mb-3">Priorización combinando severidad (nivel bajo), momentum (pendiente reciente) y estabilidad. Total horas sugeridas esta semana: <span className="font-semibold">{insightsAvanzados.totalHoras}h</span></p>
                  <div className="overflow-x-auto scrollbar-hide">
                    <table className="min-w-[640px] w-full text-[11px]">
                      <thead>
                        <tr className="text-rose-800 text-left border-b border-rose-200">
                          <th className="py-1 pr-2">#</th>
                          <th className="py-1 pr-2">Materia</th>
                          <th className="py-1 pr-2">Prom</th>
                          <th className="py-1 pr-2">Severidad</th>
                          <th className="py-1 pr-2">Momentum</th>
                          <th className="py-1 pr-2">Estabilidad</th>
                          <th className="py-1 pr-2">Horas/Sem</th>
                          <th className="py-1 pr-2">Pend</th>
                          <th className="py-1 pr-2">Vol</th>
                        </tr>
                      </thead>
                      <tbody>
                        {insightsAvanzados.materias.map(m => (
                          <tr key={m.materia} className="border-b last:border-0 border-rose-100">
                            <td className="py-1 pr-2 font-medium text-rose-700">{m.prioridad}</td>
                            <td className="py-1 pr-2 text-rose-900">{m.materia}</td>
                            <td className="py-1 pr-2 text-rose-700">{m.promedio.toFixed(1)}%</td>
                            <td className="py-1 pr-2">{m.severidad}</td>
                            <td className="py-1 pr-2">{m.momentum}</td>
                            <td className="py-1 pr-2">{m.estabilidad}</td>
                            <td className="py-1 pr-2 font-medium">{m.horasSugeridasSemana}h</td>
                            <td className="py-1 pr-2">{m.pendiente.toFixed(2)}</td>
                            <td className="py-1 pr-2">{m.volatilidad.toFixed(1)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={()=>{
                        try {
                          navigator.clipboard.writeText(JSON.stringify(insightsAvanzados,null,2));
                          setUltimoAvisoIA('Métricas avanzadas copiadas.');
                        } catch(e) {}
                      }}
                      className="px-3 py-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-md"
                    >Copiar métricas</button>
                    <button
                      onClick={()=> setInsightsAvanzados(null)}
                      className="px-3 py-1.5 text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
                    >Ocultar</button>
                  </div>
                </div>
              )}
              {/* Métricas de efectividad del análisis IA */}
              {metricasIA && (
                <div className="bg-white border border-indigo-200 rounded-lg p-4 sm:p-6 shadow-inner">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-indigo-900 text-sm sm:text-base flex items-center">
                      <Zap className="w-4 h-4 mr-2 text-indigo-500" />
                      Efectividad del Análisis IA
                    </h4>
                    <span className="text-[10px] sm:text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium">
                      Beta
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                      <p className="text-xs font-medium text-indigo-800 mb-1">F1 Debilidades</p>
                      <div className="w-full bg-white h-2 rounded overflow-hidden border border-indigo-200">
                        <div style={{width: `${(metricasIA.debilidades.f1*100).toFixed(0)}%`}} className="h-full bg-indigo-500"></div>
                      </div>
                      <p className="text-[10px] mt-1 text-indigo-700">
                        P {(metricasIA.debilidades.precision*100).toFixed(0)}% · R {(metricasIA.debilidades.recall*100).toFixed(0)}% · F1 {(metricasIA.debilidades.f1*100).toFixed(0)}%
                      </p>
                      <p className="text-[10px] text-indigo-600 mt-1">TP {metricasIA.debilidades.tp} / Pred {metricasIA.debilidades.pred} / Gold {metricasIA.debilidades.gold}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                      <p className="text-xs font-medium text-green-800 mb-1">F1 Fortalezas</p>
                      <div className="w-full bg-white h-2 rounded overflow-hidden border border-green-200">
                        <div style={{width: `${(metricasIA.fortalezas.f1*100).toFixed(0)}%`}} className="h-full bg-green-500"></div>
                      </div>
                      <p className="text-[10px] mt-1 text-green-700">
                        P {(metricasIA.fortalezas.precision*100).toFixed(0)}% · R {(metricasIA.fortalezas.recall*100).toFixed(0)}% · F1 {(metricasIA.fortalezas.f1*100).toFixed(0)}%
                      </p>
                      <p className="text-[10px] text-green-600 mt-1">TP {metricasIA.fortalezas.tp} / Pred {metricasIA.fortalezas.pred} / Gold {metricasIA.fortalezas.gold}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                      <p className="text-[10px] font-medium text-yellow-800">Cobertura</p>
                      <p className="text-sm font-semibold text-yellow-700">{(metricasIA.cobertura.valor*100).toFixed(0)}%</p>
                      <p className="text-[10px] text-yellow-600">{metricasIA.cobertura.materiasReferenciadas}/{metricasIA.cobertura.total} materias</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                      <p className="text-[10px] font-medium text-purple-800">Puntaje Global</p>
                      <p className="text-sm font-semibold text-purple-700">{(metricasIA.puntajeGlobal*100).toFixed(0)}%</p>
                      <p className="text-[10px] text-purple-600">F1 debilidades 60%, fortalezas 30%, cobertura 10%</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="text-[10px] font-medium text-gray-700">Interpretación</p>
                      <p className="text-[10px] text-gray-600 leading-snug">Valores más altos indican mayor alineación del análisis IA con las reglas locales. Útil para monitorear calidad.</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500">Estas métricas comparan la salida de la IA con un baseline heurístico (reglas de umbrales) y no representan una validación absoluta de exactitud pedagógica.</p>
                </div>
              )}
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
                className="inline-flex items-center justify-center w-full sm:w-auto space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colores text-sm sm:text-base"
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