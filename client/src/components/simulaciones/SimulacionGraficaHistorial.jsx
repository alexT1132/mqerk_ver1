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
// Añadimos componentes extra de Recharts si no estaban
// (ReferenceLine para mostrar umbrales o metas visuales)
import { ReferenceLine } from 'recharts';
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
  obtenerRecursosRecomendados,
  limpiarCacheAnalisisGemini
} from '../../service/geminiService.js';
import api from '../../api/axios';
// Análisis detallado tipo HistorialModal
import { analyzeQuizPerformance } from '../../service/quizAnalysisService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../../context/AuthContext';

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
  categoria = null,          // Categoría de la simulación
  idEstudiante = null
}) {
  // Obtener información del estudiante para el análisis
  const { alumno, user } = useAuth() || {};
  const estudianteNombre = (() => {
    try {
      if (alumno?.nombre) return `${alumno.nombre} ${alumno.apellidos || ''}`.trim();
      if (user?.name && user.name !== 'XXXX') return String(user.name);
      if (user?.nombre) return `${user.nombre} ${user.apellidos || ''}`.trim();
    } catch { }
    return null;
  })();

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
  // Telemetría/estado IA adicional
  const [iaLatencyMs, setIaLatencyMs] = useState(null);
  const [lastDatosAnalisis, setLastDatosAnalisis] = useState(null);
  // Estado para análisis detallado centrado en preguntas
  const [analysisText, setAnalysisText] = useState('');
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [analysisMeta, setAnalysisMeta] = useState(null);
  const [showInlineAnalysis, setShowInlineAnalysis] = useState(false);
  const [showAvisoMinIntentos, setShowAvisoMinIntentos] = useState(true);
  // Reglas de suficiencia de datos para análisis avanzados
  const MIN_INTENTOS_TENDENCIA = 3; // mínimo absoluto para permitir IA y métricas
  const IDEAL_INTENTOS_TENDENCIA = 4; // recomendado para mayor estabilidad
  const MIN_MATERIAS_ANALISIS = 2; // mínimo para distinguir fortalezas y debilidades

  // Estado para tracking de uso de IA
  const [aiUsage, setAiUsage] = useState({ count: 0, limit: 5, remaining: 5 });

  // Obtener rol del usuario (ya tenemos user de useAuth arriba)
  const userRole = user?.rol || user?.role || 'estudiante';

  // Helpers para tracking de uso de IA (localStorage)
  const AI_USAGE_KEY = 'ai_analysis_usage';
  // Límites por rol: Asesores tienen más intentos porque generan preguntas y fórmulas
  const DAILY_LIMIT = userRole === 'asesor' || userRole === 'admin' ? 20 : 5;

  const getUsageToday = () => {
    try {
      const data = JSON.parse(localStorage.getItem(AI_USAGE_KEY) || '{}');
      const today = new Date().toISOString().split('T')[0];
      if (data.date !== today) {
        return { count: 0, limit: DAILY_LIMIT, remaining: DAILY_LIMIT };
      }
      return {
        count: data.count || 0,
        limit: DAILY_LIMIT,
        remaining: Math.max(0, DAILY_LIMIT - (data.count || 0))
      };
    } catch {
      return { count: 0, limit: DAILY_LIMIT, remaining: DAILY_LIMIT };
    }
  };

  const incrementUsage = () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const data = JSON.parse(localStorage.getItem(AI_USAGE_KEY) || '{}');
      if (data.date !== today) {
        localStorage.setItem(AI_USAGE_KEY, JSON.stringify({ date: today, count: 1, limit: DAILY_LIMIT }));
      } else {
        data.count = (data.count || 0) + 1;
        localStorage.setItem(AI_USAGE_KEY, JSON.stringify(data));
      }
      setAiUsage(getUsageToday());
    } catch (e) {
      console.error('Error incrementando uso de IA:', e);
    }
  };

  // Helper: convertir texto plano a un markdown amigable (títulos y viñetas)
  const toMarkdownFriendly = (txt = '') => {
    if (!txt || typeof txt !== 'string') return '';
    try {
      let s = txt.replace(/\r\n?/g, '\n').trim();
      // Normalizar bullets comunes (•, –, —) a '- '
      s = s.replace(/^\s*[•\-\u2013\u2014]\s+/gm, '- ');
      // Normalizar enumeraciones '1)' o '1-' a '1.'
      s = s.replace(/^\s*(\d{1,2})[\)\-]\s+/gm, '$1. ');
      // Promover líneas tipo 'Titulo:' a encabezados ###
      s = s.replace(/^(Resumen|Fortalezas|Debilidades|Plan de estudio|Recomendaciones|Análisis|Acciones|Objetivos|Sugerencias|Diagnóstico)\s*:\s*$/gmi, '### $1');
      // Si hay 'Titulo: contenido' en una sola línea, separarlo
      s = s.replace(/^(Resumen|Fortalezas|Debilidades|Plan de estudio|Recomendaciones|Análisis|Acciones|Objetivos|Sugerencias|Diagnóstico)\s*:\s*(.+)$/gmi, '### $1\n\n$2');
      // Asegurar líneas en blanco entre párrafos
      s = s.replace(/([^\n])\n(?!\n)([^\n])/g, '$1\n\n$2');
      return s;
    } catch {
      return txt;
    }
  };

  // Reducir cooldown cada segundo
  useEffect(() => {
    if (cooldownIA <= 0) return;
    const t = setTimeout(() => setCooldownIA(cooldownIA - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldownIA]);

  // Cargar uso de IA al abrir la página
  useEffect(() => {
    if (isOpen) {
      setAiUsage(getUsageToday());
    }
  }, [isOpen]);

  // Incrementar uso cuando se genera un análisis exitoso con Gemini
  useEffect(() => {
    if (analisisIA && !analisisIA.esFallbackLocal && !cargandoIA && !errorIA) {
      incrementUsage();
    }
  }, [analisisIA]);


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
    const debiles = materiasProm.filter(m => m.promedio < 70).sort((a, b) => a.promedio - b.promedio);
    const fuertes = materiasProm.filter(m => m.promedio >= 80).sort((a, b) => b.promedio - a.promedio);

    const causas = debiles.map(d => ({
      materia: d.materia,
      causaProbable: d.promedio < 55 ? 'Déficit de fundamentos básicos' : d.promedio < 63 ? 'Baja consolidación conceptual' : 'Necesita más práctica aplicada',
      recomendacion: d.promedio < 55 ? 'Reforzar definiciones y ejemplos base antes de ejercicios largos.' : d.promedio < 63 ? 'Construir mapas conceptuales y resolver mini-quizzes.' : 'Aumentar volumen de ejercicios cronometrados y revisión de errores.'
    }));

    const plan7Dias = [];
    const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
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
        plan7Dias.push({ dia, materia: 'General', foco: 'Lectura activa / descanso activo', duracion: '25-30 min' });
      }
    });

    const apalancarFortalezas = fuertes.slice(0, 2).map(f => ({
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
      const xs = Array.from({ length: n }, (_, i) => i + 1);
      const xMean = xs.reduce((a, b) => a + b, 0) / n;
      const yMean = serie.reduce((a, b) => a + b, 0) / n;
      let num = 0, den = 0;
      for (let i = 0; i < n; i++) { num += (xs[i] - xMean) * (serie[i] - yMean); den += Math.pow(xs[i] - xMean, 2); }
      return den === 0 ? 0 : num / den; // pendiente simple
    };
    const stdev = (arr) => {
      if (arr.length < 2) return 0;
      const m = arr.reduce((a, b) => a + b, 0) / arr.length;
      return Math.sqrt(arr.reduce((a, b) => a + Math.pow(b - m, 2), 0) / arr.length);
    };

    const materiasDetalladas = materiasProm.map(m => {
      const serie = m.puntajes || [];
      const pend = slope(serie);
      const vol = stdev(serie);
      const severidad = m.promedio < 55 ? 'crítica' : m.promedio < 65 ? 'alta' : m.promedio < 70 ? 'media' : m.promedio < 80 ? 'moderada' : 'baja';
      const momentum = pend > 1 ? 'acelerando' : pend > 0.3 ? 'mejorando' : pend < -1 ? 'retroceso fuerte' : pend < -0.3 ? 'bajando' : 'plano';
      const estabilidad = vol < 3 ? 'muy estable' : vol < 6 ? 'estable' : vol < 10 ? 'variable' : 'volátil';
      const horasSugeridasSemana = severidad === 'crítica' ? 4 : severidad === 'alta' ? 3 : severidad === 'media' ? 2 : severidad === 'moderada' ? 1.5 : 1;
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
    const ordenSeveridad = { 'crítica': 5, 'alta': 4, 'media': 3, 'moderada': 2, 'baja': 1 };
    const ordenMomentum = { 'retroceso fuerte': 4, 'bajando': 3, 'plano': 2, 'mejorando': 1, 'acelerando': 0 };
    const priorizadas = [...materiasDetalladas].sort((a, b) => {
      const s = ordenSeveridad[b.severidad] - ordenSeveridad[a.severidad];
      if (s !== 0) return s;
      const mo = ordenMomentum[b.momentum] - ordenMomentum[a.momentum];
      if (mo !== 0) return mo;
      return a.promedio - b.promedio;
    }).map((m, i) => ({ prioridad: i + 1, ...m }));

    // Sugerencia total horas (suma y ajuste a múltiplos de 0.5)
    let totalHoras = materiasDetalladas.reduce((a, b) => a + b.horasSugeridasSemana, 0);
    totalHoras = Math.round(totalHoras * 2) / 2;

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
    // Validar mínimo de datos significativos: requerir al menos MIN_INTENTOS_TENDENCIA intentos
    if (Array.isArray(historial?.intentos) && historial.intentos.length < MIN_INTENTOS_TENDENCIA) {
      setErrorIA(`Necesitas al menos ${MIN_INTENTOS_TENDENCIA} intentos (ideal ${IDEAL_INTENTOS_TENDENCIA}+) para generar un análisis de IA confiable. Realiza más intentos y vuelve a intentarlo.`);
      setMostrarAnalisisIA(false);
      return;
    }
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
    let analitica = null; // hoisted para usar luego en datosParaAnalisis
    try {
      // 1) Enriquecer datos: obtener analítica detallada (preguntas, intentos, respuestas)
      try {
        const studentId = idEstudiante || historial?.id_estudiante || historial?.estudianteId || null;
        if (studentId) {
          const respDet = await api.get(`/simulaciones/${simulacion.id}/analitica/${studentId}`);
          analitica = respDet?.data?.data || null;
        }
      } catch (e) {
        console.warn('Analítica detallada no disponible; se continuará con datos agregados.', e?.response?.status || e?.message);
      }
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
    } catch (e) {
      console.warn('No se pudo generar firma de análisis:', e);
    }

    setCargandoIA(true);
    setErrorIA(null);
    enProcesoRef.current = true;

    try {
      // Preparar datos para el análisis
      // Identificar intento oficial (primer intento) y los de práctica (resto)
      const intentosOrdenados = Array.isArray(historial.intentos)
        ? [...historial.intentos].sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
        : [];
      const intentoOficial = intentosOrdenados[0] || null;
      const intentosPractica = intentosOrdenados.slice(1) || [];

      // ✅ Generar incorrectasDetalle si tenemos analitica
      let incorrectasDetalle = [];
      if (analitica && Array.isArray(analitica.intentos) && analitica.intentos.length) {
        const preguntas = Array.isArray(analitica.preguntas) ? analitica.preguntas : [];
        const preguntasById = new Map(preguntas.map(p => [p.id, p]));
        const processedQuestionIds = new Set();

        // Función auxiliar para procesar un intento y añadir sus errores
        const processAttemptErrors = (intentoData, isOfficialAttempt = false) => {
          if (!intentoData || !Array.isArray(intentoData.respuestas)) return;

          intentoData.respuestas.forEach(r => {
            const pq = preguntasById.get(r.id_pregunta);
            if (!pq || processedQuestionIds.has(pq.id)) return; // Ya procesada o no encontrada

            const esCorrecta = r.id_opcion ? (pq.opciones || []).some(o => o.id === r.id_opcion && Number(o.es_correcta) === 1) : false;

            if (!esCorrecta) {
              const correctasTxt = (pq.opciones || []).filter(o => Number(o.es_correcta) === 1).map(o => o.texto);
              const opcionSeleccionada = r.id_opcion ? (pq.opciones || []).find(o => o.id === r.id_opcion) : null;
              const textoSeleccionado = opcionSeleccionada ? opcionSeleccionada.texto : (r.texto_libre || 'Sin respuesta');

              incorrectasDetalle.push({
                enunciado: pq.enunciado,
                seleccion: [textoSeleccionado],
                correctas: correctasTxt,
                tipo: pq.tipo,
                materia: pq.materia || pq.categoria || pq.area || null,
                esOficial: isOfficialAttempt // Marcar si viene del intento oficial
              });
              processedQuestionIds.add(pq.id);
            }
          });
        };

        // Ordenar intentos por fecha (más antiguo primero)
        const intentosAnaliticaOrdenados = [...analitica.intentos].sort((a, b) => {
          const fechaA = a?.intento?.fecha || a?.sesion?.finished_at || null;
          const fechaB = b?.intento?.fecha || b?.sesion?.finished_at || null;
          if (!fechaA && !fechaB) return 0;
          if (!fechaA) return 1;
          if (!fechaB) return -1;
          return new Date(fechaA).getTime() - new Date(fechaB).getTime();
        });

        const intentoOficialAnalitica = intentosAnaliticaOrdenados[0];
        const ultimoIntentoAnalitica = intentosAnaliticaOrdenados[intentosAnaliticaOrdenados.length - 1];

        // Priorizar errores del intento oficial
        processAttemptErrors(intentoOficialAnalitica, true);
        // Luego añadir errores del último intento que no estén ya en la lista
        processAttemptErrors(ultimoIntentoAnalitica, false);
      }

      const datosParaAnalisis = {
        simulacion: simulacion.nombre,
        tipo: tipo,
        categoria: categoria,
        moduloId: moduloId,
        intentos: historial.intentos.length,
        promedio: promedioPuntaje,
        tiempoPromedio: promedioTiempo,
        mejorTiempo: mejorTiempo,
        totalPreguntas: Number(simulacion.totalPreguntas || simulacion.total_preguntas || 0),
        intentoOficial: intentoOficial ? { puntaje: Number(intentoOficial.puntaje) || 0, fecha: intentoOficial.fecha } : null,
        intentosPractica: intentosPractica.map(i => ({ puntaje: Number(i.puntaje) || 0, fecha: i.fecha })),
        alumnoNombre: estudianteNombre || null, // ✅ Agregar nombre del estudiante para el análisis de Gemini
        incorrectasDetalle: incorrectasDetalle, // ✅ Agregar incorrectasDetalle para análisis detallado
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
        // Adjuntar detalle si está disponible
        detalle: analitica ? {
          mismatch: !!analitica.mismatch,
          preguntas: (analitica.preguntas || []).map(p => ({
            id: p.id, orden: p.orden, tipo: p.tipo, puntos: p.puntos,
            enunciado: p.enunciado,
            opciones: Array.isArray(p.opciones) ? p.opciones.map(o => ({ id: o.id, texto: o.texto, es_correcta: !!o.es_correcta })) : []
          })),
          intentos: (analitica.intentos || []).map(it => ({
            intentoId: it.intento?.id,
            puntaje: Number(it.intento?.puntaje) || 0,
            tiempoSegundos: Number(it.intento?.tiempo_segundos) || null,
            total_preguntas: Number(it.intento?.total_preguntas) || null,
            correctas: Number(it.intento?.correctas) || null,
            sesion: { id: it.sesion?.id, elapsed_ms: it.sesion?.elapsed_ms, finished_at: it.sesion?.finished_at },
            respuestas: (it.respuestas || []).map(r => ({ id_pregunta: r.id_pregunta, id_opcion: r.id_opcion, texto_libre: r.texto_libre, tiempo_ms: r.tiempo_ms }))
          }))
        } : null,
        contextoEspecifico: {
          tipoSimulacion: tipo,
          moduloNombre: tipo === 'especificos' ? obtenerNombreModulo(moduloId) : null,
          categoriaEspecifica: categoria,
          nivelDificultad: calcularNivelDificultad(promedioPuntaje)
        }
      };

      // Llamar al servicio de IA con telemetría
      const t0 = Date.now();
      const analisis = await generarAnalisisConGemini(datosParaAnalisis);
      setIaLatencyMs(Date.now() - t0);
      setLastDatosAnalisis(datosParaAnalisis);
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
      } else if (error.message && error.message.includes('GEMINI_API_KEY')) {
        setErrorIA('El servidor no tiene configurada la API de Gemini. Se usará análisis heurístico local.');
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

  // Early return seguro: solo cierra si no está abierto o falta simulación
  if (!isOpen || !simulacion) return null;

  // Verificación de datos: si no hay historial o está vacío, mostrar estado amigable en vez de cortar todo
  if (!historial || !Array.isArray(historial.intentos) || historial.intentos.length === 0) {
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

  // Reemplazado: se eliminan datos simulados de materias; si no hay 'analytics' del backend, derivar una estructura vacía segura desde historial
  // Nota: Cuando exista endpoint de analytics por materia, mapear aquí.
  // Normalizar materias desde historial o crear una materia "General" como fallback con la serie de puntajes
  let materiasActuales = Array.isArray(historial?.materias)
    ? (historial.materias || []).map(m => ({
      materia: m.nombre || m.materia || 'General',
      promedio: Number(m.promedio || m.ratio || 0),
      icon: '📘',
      color: '#3B82F6',
      puntajes: Array.isArray(m.puntajes) ? m.puntajes.map(v => Number(v) || 0) : []
    }))
    : [];
  if (!Array.isArray(materiasActuales)) materiasActuales = [];
  if (materiasActuales.length === 0) {
    const intentosSerie = Array.isArray(historial?.intentos) ? historial.intentos.map(i => Number(i?.puntaje) || 0) : [];
    materiasActuales = [{ materia: 'General', promedio: (intentosSerie.length ? intentosSerie.reduce((a, b) => a + b, 0) / intentosSerie.length : 0), icon: '📘', color: '#3B82F6', puntajes: intentosSerie }];
  }

  // Calcular promedios por materia
  const promediosPorMateria = materiasActuales.map(materia => {
    const len = Array.isArray(materia.puntajes) ? materia.puntajes.length : 0;
    const serie = Array.isArray(materia.puntajes) ? materia.puntajes.map(v => Number(v) || 0) : [];
    const promedio = len ? (serie.reduce((sum, p) => sum + p, 0) / len) : 0;
    const ultimoPuntaje = len ? serie[len - 1] : 0;
    const mejorPuntaje = len ? Math.max(...serie) : 0;
    const tendencia = len >= 2 ? (serie[len - 1] > serie[0] ? 'mejora' : (serie[len - 1] < serie[0] ? 'baja' : 'plano')) : 'plano';
    return { ...materia, promedio, ultimoPuntaje, mejorPuntaje, tendencia };
  });

  // Identificar áreas más débiles (promedio < 70)
  const areasDebiles = promediosPorMateria.filter(materia => materia.promedio < 70);

  // Preparar datos para gráfica de materias
  const datosMaterias = materiasActuales.map((materia) => {
    const len = Array.isArray(materia.puntajes) ? materia.puntajes.length : 0;
    const serie = Array.isArray(materia.puntajes) ? materia.puntajes.map(v => Number(v) || 0) : [];
    const promedio = len ? (serie.reduce((sum, p) => sum + p, 0) / len) : 0;
    const ultimo = len ? serie[len - 1] : 0;
    return {
      materia: materia.materia,
      promedio,
      ultimo,
      color: materia.color,
      icon: materia.icon
    };
  });

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

  // Construye un resumen en texto sencillo para compartir/copiar
  const construirResumenCompartible = (analisis) => {
    try {
      if (!analisis) return '';
      const lineas = [];

      // Cabecera con métricas clave
      // ✅ IMPORTANTE: Ordenar por fecha para calcular correctamente el último intento
      const intentosOrdenados = Array.isArray(historial?.intentos)
        ? [...historial.intentos].sort((a, b) => {
          const ta = a.fecha ? new Date(a.fecha).getTime() : 0;
          const tb = b.fecha ? new Date(b.fecha).getTime() : 0;
          return ta - tb; // Orden ascendente (más antiguo primero)
        })
        : [];
      const intentos = intentosOrdenados.length;
      const mejor = intentos ? Math.max(...intentosOrdenados.map(i => Number(i.puntaje) || 0)) : null;
      const ultimo = intentos ? Number(intentosOrdenados[intentos - 1].puntaje) || 0 : null;
      const oficialP = intentoOficial ? (Number(intentoOficial.puntaje) || 0) : null;
      const oficialF = intentoOficial?.fecha ? new Date(intentoOficial.fecha).toLocaleDateString('es-ES') : null;

      if (simulacion?.nombre) lineas.push(`Análisis de rendimiento – ${simulacion.nombre}`);
      lineas.push(
        [
          `Intentos: ${intentos}`,
          `Oficial: ${oficialP != null ? oficialP + '%' : 'N/D'}${oficialF ? ' (' + oficialF + ')' : ''}`,
          `Mejor: ${mejor != null ? mejor + '%' : 'N/D'}`,
          `Último: ${ultimo != null ? ultimo + '%' : 'N/D'}`,
          `Promedio: ${promedioPuntaje != null ? promedioPuntaje.toFixed(1) + '%' : 'N/D'}`,
        ].join(' | ')
      );

      if (analisis.resumen) {
        lineas.push('');
        lineas.push(`Resumen: ${analisis.resumen}`);
      }

      // Fortalezas (IA o fallback por datos locales)
      let fortalezas = Array.isArray(analisis.fortalezas) ? analisis.fortalezas : [];
      if (!fortalezas.length && Array.isArray(promediosPorMateria)) {
        fortalezas = promediosPorMateria.filter(m => m.promedio >= 80).map(m => ({ materia: m.materia, comentario: 'Buen dominio, mantener práctica estratégica.' }));
      }
      if (fortalezas.length) {
        lineas.push('');
        lineas.push('Fortalezas:');
        fortalezas.slice(0, 6).forEach(f => {
          lineas.push(`• ${f.materia || 'Área'}: ${f.comentario || 'Rendimiento sólido'}`);
        });
      }

      // Áreas de mejora con acciones
      let debilidades = Array.isArray(analisis.debilidades) ? analisis.debilidades : [];
      if (!debilidades.length && Array.isArray(promediosPorMateria)) {
        debilidades = promediosPorMateria.filter(m => m.promedio < 70).map(m => ({ materia: m.materia, comentario: 'Reforzar fundamentos', accionesEspecificas: [] }));
      }
      if (debilidades.length) {
        lineas.push('');
        lineas.push('Áreas de mejora:');
        debilidades.slice(0, 8).forEach(d => {
          const acciones = Array.isArray(d.accionesEspecificas) && d.accionesEspecificas.length
            ? ` | Acciones: ${d.accionesEspecificas.slice(0, 2).join('; ')}`
            : '';
          lineas.push(`• ${d.materia || 'Área'}: ${d.comentario || 'Reforzar conceptos clave'}${acciones}`);
        });
      }

      // Plan de estudio
      if (analisis.planEstudio?.prioridad?.length) {
        lineas.push('');
        lineas.push('Plan de estudio (prioridades):');
        analisis.planEstudio.prioridad.slice(0, 6).forEach((p, i) => {
          const tiempo = p.tiempo ? ` · ${p.tiempo}` : '';
          const enfoque = p.enfoque ? ` · ${p.enfoque}` : '';
          lineas.push(`${i + 1}. ${p.materia || 'General'}${tiempo}${enfoque}`);
        });
      }

      // Extras del plan 7 días y tips (si existen)
      if (sugerenciasPersonalizadas?.plan7Dias?.length) {
        lineas.push('');
        lineas.push('Plan 7 días (resumen):');
        sugerenciasPersonalizadas.plan7Dias.slice(0, 3).forEach(p => {
          lineas.push(`- ${p.dia}: ${p.materia} · ${p.foco} · ${p.duracion}`);
        });
      }
      if (sugerenciasPersonalizadas?.quickTips?.length) {
        lineas.push('');
        lineas.push('Tips rápidos:');
        sugerenciasPersonalizadas.quickTips.slice(0, 3).forEach(t => lineas.push(`- ${t}`));
      }

      // Indicador de esfuerzo semanal si está disponible
      if (insightsAvanzados?.totalHoras) {
        lineas.push('');
        lineas.push(`Sugerencia de dedicación semanal: ${insightsAvanzados.totalHoras} horas`);
      }

      return lineas.join('\n');
    } catch {
      return '';
    }
  };

  // Descargar resumen como PDF (usando diálogo de impresión del navegador)
  const descargarResumenComoPDF = (analisis) => {
    try {
      const texto = construirResumenCompartible(analisis);
      if (!texto) return;
      const popup = window.open('', '_blank', 'width=820,height=900');
      if (!popup) return;
      const estilos = `
        body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial, "Apple Color Emoji", "Segoe UI Emoji"; color: #111827; }
        h1 { font-size: 18px; margin: 0 0 10px; }
        pre { white-space: pre-wrap; font-size: 13px; line-height: 1.4; }
      `;
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>Resumen de análisis</title><style>${estilos}</style></head><body>
        <h1>Resumen de análisis</h1>
        <pre>${texto.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
      </body></html>`;
      popup.document.open();
      popup.document.write(html);
      popup.document.close();
      // Dar tiempo a que renderice antes de imprimir
      setTimeout(() => { try { popup.focus(); popup.print(); } catch { } }, 300);
    } catch { }
  };

  // Compartir por WhatsApp
  const compartirPorWhatsApp = (analisis) => {
    try {
      const texto = construirResumenCompartible(analisis);
      if (!texto) return;
      const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
      window.open(url, '_blank');
    } catch { }
  };

  // Preparar datos para las gráficas con verificaciones
  const getAttemptSeconds = (i) => {
    if (typeof i?.tiempo_segundos === 'number' && i.tiempo_segundos > 0) return i.tiempo_segundos;
    if (typeof i?.duration_sec === 'number' && i.duration_sec > 0) return i.duration_sec;
    if (typeof i?.elapsed_ms === 'number' && i.elapsed_ms > 0) return Math.round(i.elapsed_ms / 1000);
    if (i?.started_at && i?.finished_at) {
      const s = new Date(i.started_at).getTime();
      const f = new Date(i.finished_at).getTime();
      if (Number.isFinite(s) && Number.isFinite(f) && f > s) return Math.round((f - s) / 1000);
    }
    const min = Number(i?.tiempoEmpleado);
    if (Number.isFinite(min) && min > 0) return Math.round(min * 60);
    return 0;
  };

  const datosGrafica = (Array.isArray(historial?.intentos) ? historial.intentos : []).map((intento, index) => {
    const sec = getAttemptSeconds(intento);
    return ({
      intento: `Intento ${index + 1}`,
      puntaje: Number(intento.puntaje) || 0,
      tiempo: sec > 0 ? Math.round(sec / 60) : 0,
      fecha: intento.fecha ? new Date(intento.fecha).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit'
      }) : 'N/A'
    });
  });

  // Parámetros responsivos/legibilidad para la gráfica de evolución
  const totalIntentos = datosGrafica.length;
  const manyAttemptsMobile = isMobile && totalIntentos > 5;
  const manyAttemptsDesktop = !isMobile && totalIntentos > 10;
  const rotateXAxis = manyAttemptsMobile || manyAttemptsDesktop;
  const chartBaseWidth = isMobile ? 68 : 80; // px por intento
  const dynamicChartWidth = Math.max(isMobile ? 360 : 500, totalIntentos * chartBaseWidth);
  const mostrarLineasReferencia = true; // podría hacerlo configurable
  const metaFortaleza = 80; // línea meta de fortaleza
  const metaMinima = 70;    // línea mínima deseable/intermedia
  const mostrarAvisoPocosDatos = totalIntentos < 2;

  // Estadísticas calculadas con verificaciones
  // ✅ IMPORTANTE: Ordenar por fecha para asegurar que el primer intento cronológico sea el oficial
  const intentosList = Array.isArray(historial?.intentos)
    ? [...historial.intentos].sort((a, b) => {
      const ta = a.fecha ? new Date(a.fecha).getTime() : 0;
      const tb = b.fecha ? new Date(b.fecha).getTime() : 0;
      return ta - tb; // Orden ascendente (más antiguo primero)
    })
    : [];
  const intentoOficial = intentosList.length ? intentosList[0] : null; // El primer intento cronológico es oficial
  const promedioPuntaje = intentosList.length > 0
    ? intentosList.reduce((sum, i) => sum + (Number(i.puntaje) || 0), 0) / intentosList.length
    : 0;
  const tiemposPositivosSec = intentosList.map(getAttemptSeconds).filter(t => t > 0);
  const mejorTiempo = tiemposPositivosSec.length ? Math.max(1, Math.round(Math.min(...tiemposPositivosSec) / 60)) : 0; // en minutos
  const promedioTiempo = intentosList.length > 0
    ? (tiemposPositivosSec.length ? Math.round((tiemposPositivosSec.reduce((a, b) => a + b, 0) / tiemposPositivosSec.length) / 60) : 0)
    : 0;

  // Flags de suficiencia de datos
  const tieneMateriasSuficientes = promediosPorMateria.length >= MIN_MATERIAS_ANALISIS;
  const tieneIntentosSuficientes = intentosList.length >= MIN_INTENTOS_TENDENCIA;
  const datosInsuficientesAvanzado = !(tieneMateriasSuficientes && tieneIntentosSuficientes);

  // Cargar analítica detallada (preguntas + respuestas por intento)
  const cargarAnaliticaDetallada = async () => {
    if (!idEstudiante) return null;
    try {
      const respDet = await api.get(`/simulaciones/${simulacion.id}/analitica/${idEstudiante}`);
      return respDet?.data?.data || null;
    } catch (e) {
      console.warn('Analítica detallada no disponible:', e?.response?.status || e?.message);
      return null;
    }
  };

  // Generar análisis detallado (pregunta-enfocado) similar a HistorialModal
  const generarAnalisisDetallado = async () => {
    if (!historial || !Array.isArray(historial.intentos) || historial.intentos.length === 0) {
      setAnalysisError('No hay suficientes datos para un análisis.');
      setShowInlineAnalysis(true);
      return;
    }
    setShowInlineAnalysis(true);
    setIsLoadingAnalysis(true);
    setAnalysisText('');
    setAnalysisError('');
    setAnalysisMeta(null);

    try {
      // Orden cronológico ascendente
      const ordered = [...historial.intentos].sort((a, b) => {
        const ta = a.fecha ? new Date(a.fecha).getTime() : 0;
        const tb = b.fecha ? new Date(b.fecha).getTime() : 0;
        return ta - tb;
      });
      const scores = ordered.map(i => Number(i.puntaje) || 0);
      const fechas = ordered.map(i => i.fecha || null);
      // Datos del intento oficial (primero)
      const intentoOficial = ordered[0] || null;
      const oficialPuntaje = intentoOficial ? (Number(intentoOficial.puntaje) || null) : null;
      const oficialFecha = intentoOficial ? (intentoOficial.fecha || null) : null;
      // Duraciones por intento
      const analitica = await cargarAnaliticaDetallada();
      let duraciones = [];
      if (analitica && Array.isArray(analitica.intentos) && analitica.intentos.length) {
        duraciones = analitica.intentos.map(it => {
          if (typeof it?.intento?.tiempo_segundos === 'number') return Math.round(it.intento.tiempo_segundos);
          const ms = it?.sesion?.elapsed_ms;
          return (typeof ms === 'number') ? Math.round(ms / 1000) : null;
        }).filter(v => v != null);
      }
      if (duraciones.length === 0) {
        // fallback desde historial (minutos a segundos)
        duraciones = ordered.map(i => {
          const min = Number(i.tiempoEmpleado);
          if (!Number.isFinite(min) || min <= 0) return null;
          return Math.round(min * 60);
        }).filter(v => v != null);
      }

      // ✅ Derivar detalle de TODOS los intentos, especialmente el oficial y el último
      // Priorizar preguntas del intento oficial (donde más importa) y también del último intento
      let incorrectasLista = [];
      let incorrectasDetalle = [];
      let totalPreguntasIntento = null;
      let correctasIntento = null;
      let incorrectasIntento = null;
      let omitidasIntento = null;
      let promedioTiempoPregunta = null;
      let intentoNumero = ordered.length;
      let totalTiempoIntento = null;

      if (analitica && Array.isArray(analitica.intentos) && analitica.intentos.length) {
        const preguntas = Array.isArray(analitica.preguntas) ? analitica.preguntas : [];
        const preguntasById = new Map(preguntas.map(p => [p.id, p]));

        // ✅ Ordenar intentos por fecha (más antiguo primero) para identificar el oficial
        const intentosOrdenados = [...analitica.intentos].sort((a, b) => {
          const fechaA = a?.intento?.fecha || a?.sesion?.finished_at || null;
          const fechaB = b?.intento?.fecha || b?.sesion?.finished_at || null;
          if (!fechaA && !fechaB) return 0;
          if (!fechaA) return 1;
          if (!fechaB) return -1;
          return new Date(fechaA).getTime() - new Date(fechaB).getTime();
        });

        const intentoOficialAnalitica = intentosOrdenados[0] || null;
        const ultimoIntentoAnalitica = intentosOrdenados[intentosOrdenados.length - 1] || null;

        // ✅ Analizar el último intento para métricas
        const ultimo = ultimoIntentoAnalitica;
        const resp = Array.isArray(ultimo?.respuestas) ? ultimo.respuestas : [];
        const detalles = [];
        const detallesOficial = []; // Preguntas incorrectas del intento oficial
        let corr = 0, inc = 0, omi = 0;
        const tiemposMs = [];

        // Analizar último intento para métricas
        resp.forEach(r => {
          const pq = preguntasById.get(r.id_pregunta);
          if (!pq) return;
          const esCorrecta = r.id_opcion ? (pq.opciones || []).some(o => o.id === r.id_opcion && Number(o.es_correcta) === 1) : false;
          if (esCorrecta) corr++; else if (r.id_opcion) inc++; else omi++;
          if (typeof r.tiempo_ms === 'number') tiemposMs.push(r.tiempo_ms);
          if (!esCorrecta) {
            const correctasTxt = (pq.opciones || []).filter(o => Number(o.es_correcta) === 1).map(o => o.texto);
            const opcionSeleccionada = r.id_opcion ? (pq.opciones || []).find(o => o.id === r.id_opcion) : null;
            const textoSeleccionado = opcionSeleccionada ? opcionSeleccionada.texto : (r.texto_libre || 'Sin respuesta');
            detalles.push({
              enunciado: pq.enunciado,
              seleccion: [textoSeleccionado],
              correctas: correctasTxt,
              tipo: pq.tipo,
              materia: pq.materia || pq.categoria || pq.area || null,
              intento: 'último'
            });
          }
        });

        // ✅ Analizar intento oficial para encontrar preguntas donde falló (más importante)
        if (intentoOficialAnalitica && intentoOficialAnalitica !== ultimo) {
          const respOficial = Array.isArray(intentoOficialAnalitica?.respuestas) ? intentoOficialAnalitica.respuestas : [];
          respOficial.forEach(r => {
            const pq = preguntasById.get(r.id_pregunta);
            if (!pq) return;
            const esCorrecta = r.id_opcion ? (pq.opciones || []).some(o => o.id === r.id_opcion && Number(o.es_correcta) === 1) : false;
            if (!esCorrecta) {
              const correctasTxt = (pq.opciones || []).filter(o => Number(o.es_correcta) === 1).map(o => o.texto);
              const opcionSeleccionada = r.id_opcion ? (pq.opciones || []).find(o => o.id === r.id_opcion) : null;
              const textoSeleccionado = opcionSeleccionada ? opcionSeleccionada.texto : (r.texto_libre || 'Sin respuesta');
              detallesOficial.push({
                enunciado: pq.enunciado,
                seleccion: [textoSeleccionado],
                correctas: correctasTxt,
                tipo: pq.tipo,
                materia: pq.materia || pq.categoria || pq.area || null,
                intento: 'oficial'
              });
            }
          });
        }

        // ✅ Combinar: priorizar preguntas del intento oficial, luego del último
        // Eliminar duplicados (misma pregunta) pero mantener la del intento oficial si existe
        const todasLasIncorrectas = [...detallesOficial, ...detalles];
        const unicas = new Map();
        todasLasIncorrectas.forEach(d => {
          const key = d.enunciado;
          if (!unicas.has(key) || d.intento === 'oficial') {
            unicas.set(key, d);
          }
        });

        totalPreguntasIntento = preguntas.length || null;
        correctasIntento = corr; incorrectasIntento = inc; omitidasIntento = omi;
        incorrectasDetalle = Array.from(unicas.values()).slice(0, 10);
        incorrectasLista = Array.from(unicas.values()).map(d => d.enunciado).slice(0, 12);
        if (tiemposMs.length > 0) {
          totalTiempoIntento = tiemposMs.reduce((a, b) => a + b, 0);
          promedioTiempoPregunta = totalPreguntasIntento ? (totalTiempoIntento / totalPreguntasIntento) : (totalTiempoIntento / tiemposMs.length);
        } else {
          const sec = (typeof ultimo?.intento?.tiempo_segundos === 'number') ? ultimo.intento.tiempo_segundos : (typeof ultimo?.sesion?.elapsed_ms === 'number' ? ultimo.sesion.elapsed_ms / 1000 : null);
          totalTiempoIntento = (typeof sec === 'number') ? Math.round(sec * 1000) : null;
          promedioTiempoPregunta = (totalTiempoIntento != null && totalPreguntasIntento) ? (totalTiempoIntento / totalPreguntasIntento) : null;
        }
      }

      const mejorPuntaje = scores.length ? Math.max(...scores) : 0;
      const promedio = promedioPuntaje;
      const ultimoPuntaje = scores.length ? scores[scores.length - 1] : null;
      const mejoraDesdePrimero = (scores.length > 1) ? (scores[scores.length - 1] - scores[0]) : 0;
      // Pendiente y desviación
      let pendienteTendencia = null, desviacionPuntaje = null;
      if (scores.length > 1) {
        const n = scores.length;
        const x = Array.from({ length: n }, (_, i) => i + 1);
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = scores.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((acc, xi, i) => acc + xi * scores[i], 0);
        const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);
        pendienteTendencia = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const avg = sumY / n;
        desviacionPuntaje = Math.sqrt(scores.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0) / (n - 1));
      }
      const promedioDuracion = duraciones.length ? (duraciones.reduce((a, b) => a + b, 0) / duraciones.length) : null;
      const mejorDuracion = duraciones.length ? Math.min(...duraciones) : null;
      const peorDuracion = duraciones.length ? Math.max(...duraciones) : null;

      // ✅ Log para verificar que los datos se estén pasando correctamente
      console.log('[generarAnalisisDetallado] Datos que se envían a la IA:', {
        totalPreguntasIntento,
        correctasIntento,
        incorrectasIntento,
        omitidasIntento,
        incorrectasListaCount: incorrectasLista?.length || 0,
        incorrectasDetalleCount: incorrectasDetalle?.length || 0,
        incorrectasDetalleSample: incorrectasDetalle?.slice(0, 2) || []
      });

      const metaPayload = {
        itemName: simulacion?.nombre,
        totalIntentos: historial.intentos.length,
        mejorPuntaje: mejorPuntaje,
        scores,
        fechas,
        duraciones,
        ultimoPuntaje,
        mejoraDesdePrimero,
        pendienteTendencia,
        desviacionPuntaje,
        promedioDuracion,
        mejorDuracion,
        peorDuracion,
        intentoNumero,
        totalPreguntasIntento,
        correctasIntento,
        incorrectasIntento,
        omitidasIntento,
        incorrectasLista,
        incorrectasDetalle, // ✅ Asegurar que se pase
        promedioTiempoPregunta,
        totalTiempoIntento,
      };

      // Calcular duración oficial (segundos) si posible
      // ✅ IMPORTANTE: Ordenar analitica.intentos por fecha para asegurar que el primero sea el oficial
      let oficialDuracion = null;
      if (analitica && Array.isArray(analitica.intentos) && analitica.intentos.length) {
        // Ordenar por fecha del intento (más antiguo primero)
        const intentosAnaliticaOrdenados = [...analitica.intentos].sort((a, b) => {
          const fechaA = a?.intento?.fecha || a?.sesion?.finished_at || null;
          const fechaB = b?.intento?.fecha || b?.sesion?.finished_at || null;
          if (!fechaA && !fechaB) return 0;
          if (!fechaA) return 1;
          if (!fechaB) return -1;
          return new Date(fechaA).getTime() - new Date(fechaB).getTime();
        });
        const primero = intentosAnaliticaOrdenados[0]; // Primer intento cronológico (oficial)
        if (typeof primero?.intento?.tiempo_segundos === 'number' && primero.intento.tiempo_segundos > 0) {
          oficialDuracion = Math.round(primero.intento.tiempo_segundos);
        } else if (typeof primero?.sesion?.elapsed_ms === 'number' && primero.sesion.elapsed_ms > 0) {
          oficialDuracion = Math.round(primero.sesion.elapsed_ms / 1000);
        }
      }

      const result = await analyzeQuizPerformance({
        ...metaPayload,
        oficialPuntaje,
        oficialFecha,
        oficialDuracion,
        alumnoNombre: estudianteNombre || null, // ✅ Agregar nombre del estudiante
      });
      setAnalysisMeta({
        itemName: simulacion?.nombre || '',
        totalIntentos: historial.intentos.length,
        mejorPuntaje: mejorPuntaje,
        promedio: Math.round(promedio || 0),
        ultimoPuntaje: ultimoPuntaje ?? null,
        pendienteTendencia: (typeof pendienteTendencia === 'number') ? Number(pendienteTendencia) : null,
        desviacionPuntaje: (typeof desviacionPuntaje === 'number') ? Number(desviacionPuntaje) : null,
        promedioDuracion: promedioDuracion != null ? Math.round(promedioDuracion) : null,
        mejorDuracion: mejorDuracion != null ? Math.round(mejorDuracion) : null,
        peorDuracion: peorDuracion != null ? Math.round(peorDuracion) : null,
        intentoNumero: intentoNumero || null,
        totalPreguntasIntento: totalPreguntasIntento || null,
        correctasIntento: correctasIntento || 0,
        incorrectasIntento: incorrectasIntento || 0,
        omitidasIntento: omitidasIntento || 0,
        totalTiempoIntento: totalTiempoIntento != null ? Math.round(totalTiempoIntento / 1000) : null,
        promedioTiempoPregunta: promedioTiempoPregunta != null ? Math.round(promedioTiempoPregunta / 1000) : null,
      });
      setAnalysisText(result);
    } catch (error) {
      console.error('Error generando análisis detallado:', error);
      setAnalysisError('Hubo un problema al generar el análisis. Inténtalo de nuevo.');
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

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
      {/* Header simplificado sin gradiente, integrado al fondo */}
      <div className="bg-transparent text-gray-900 border-b border-gray-200 relative z-20 px-2 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between py-3 sm:py-4">
          <div className="flex items-center space-x-2 sm:space-x-3 w-full">
            <button
              onClick={onClose}
              className="flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors flex-shrink-0 min-h-[40px] min-w-[44px] active:scale-[0.97] text-gray-700"
              style={{ touchAction: 'manipulation' }}
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium">Volver</span>
            </button>
            <div className="hidden sm:block w-px h-6 bg-white/20"></div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-semibold flex items-center space-x-1 sm:space-x-2 tracking-tight text-gray-800">
                <BarChart2 className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 flex-shrink-0 text-indigo-600" />
                <span className="truncate">Análisis de Rendimiento</span>
              </h1>
              <p className="text-gray-500 text-xs sm:text-sm mt-1 truncate font-medium">{simulacion.nombre}</p>
              {/* Información contextual */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[10px] sm:text-xs text-gray-500">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                  <span>{tipo === 'generales' ? 'Simulación General' : 'Simulación Específica'}</span>
                </span>
                {tipo === 'especificos' && moduloId && (
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span>{obtenerNombreModulo(moduloId)}</span>
                  </span>
                )}
                {categoria && (
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                    <span>{categoria}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Contenido principal */}
      <div className="w-full px-1 sm:px-6 lg:px-10 pt-3 sm:pt-4 pb-6 sm:pb-8">
        {/* Estadísticas principales - Grid responsive optimizado */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6 lg:mb-8 -mx-2 sm:mx-0">
          {/* Intento Oficial */}
          <div className="bg-white p-2 sm:p-4 lg:p-6 rounded-lg shadow-sm border border-blue-200 hover:shadow-md transition-shadow col-span-2 md:col-span-1 mx-2 sm:mx-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 truncate">Intento 1 (Oficial)</p>
                <p className="text-base sm:text-lg lg:text-xl font-bold text-blue-700 leading-tight">
                  {intentoOficial ? (Number(intentoOficial.puntaje) || 0) : 0}%
                </p>
                <p className="text-[11px] text-gray-500 truncate">
                  {intentoOficial?.fecha ? new Date(intentoOficial.fecha).toLocaleDateString('es-ES') : 'Fecha N/D'} · {Number(intentoOficial?.tiempoEmpleado) > 0 ? `${Math.round(Number(intentoOficial.tiempoEmpleado) * 60)}s` : 'Tiempo N/D'}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-2 sm:p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow mx-2 sm:mx-0">
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

          <div className="bg-white p-2 sm:p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow mx-2 sm:mx-0">
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

          <div className="bg-white p-2 sm:p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow mx-2 sm:mx-0">
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

          <div className="bg-white p-2 sm:p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow mx-2 sm:mx-0">
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
                  <div className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${materia.promedio >= 80 ? 'bg-green-100 text-green-800' :
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
                  <span className={`text-xs font-medium truncate ${materia.tendencia === 'mejora' ? 'text-green-600' : 'text-red-600'
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
            <div className="w-full overflow-x-auto scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
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
              <div key={index} className={`p-3 sm:p-4 rounded-lg border-l-4 ${rec.tipo === 'critico' ? 'bg-red-50 border-red-500' :
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
                    <h4 className={`font-medium text-sm sm:text-base ${rec.tipo === 'critico' ? 'text-red-800' :
                      rec.tipo === 'atencion' ? 'text-yellow-800' :
                        'text-green-800'
                      }`}>
                      {rec.materia}
                    </h4>
                    <p className={`text-xs sm:text-sm mt-1 ${rec.tipo === 'critico' ? 'text-red-700' :
                      rec.tipo === 'atencion' ? 'text-yellow-700' :
                        'text-green-700'
                      }`}>
                      {rec.mensaje}
                    </p>
                    <p className={`text-xs mt-2 font-medium ${rec.tipo === 'critico' ? 'text-red-600' :
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

        {/* Análisis detallado de preguntas (inline) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 mr-2 flex-shrink-0" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Análisis detallado de preguntas</h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={generarAnalisisDetallado}
                disabled={isLoadingAnalysis || (historial?.intentos?.length || 0) < MIN_INTENTOS_TENDENCIA}
                title={(historial?.intentos?.length || 0) < MIN_INTENTOS_TENDENCIA ? `Requiere mínimo ${MIN_INTENTOS_TENDENCIA} intentos` : ''}
                className="flex items-center justify-center w-full sm:w-auto space-x-2 px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium transition-colores text-sm disabled:cursor-not-allowed"
              >
                {isLoadingAnalysis ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analizando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generar análisis</span>
                  </>
                )}
              </button>
              {/* Indicador de uso de IA */}
              <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg">
                <span className="text-xs text-indigo-700 font-medium">Análisis hoy:</span>
                <span className={`text-xs font-bold ${aiUsage.remaining <= 1 ? 'text-red-600' :
                  aiUsage.remaining <= 2 ? 'text-yellow-600' :
                    'text-emerald-600'
                  }`}>
                  {aiUsage.remaining}/{aiUsage.limit}
                </span>
                {aiUsage.remaining === 0 && (
                  <span className="text-[10px] text-red-600 animate-pulse ml-1">
                    ⚠️
                  </span>
                )}
                {aiUsage.remaining === 1 && (
                  <span className="text-[10px] text-yellow-600 ml-1">
                    ⚡
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Aviso mínimo intentos para IA */}
          {showAvisoMinIntentos && (historial?.intentos?.length || 0) < MIN_INTENTOS_TENDENCIA && (
            <div className="mb-5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-800 flex items-start gap-3">
              <div className="pt-0.5">
                <Lightbulb className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-xs sm:text-sm leading-relaxed flex-1">
                <p className="font-semibold mb-1">Necesitas más datos para un análisis preciso</p>
                <p className="text-amber-700 mb-2">El análisis inteligente requiere al menos <span className="font-semibold">{MIN_INTENTOS_TENDENCIA} intentos</span> (ideal {IDEAL_INTENTOS_TENDENCIA}+) para detectar tendencias reales y diferenciar fortalezas y debilidades. También se recomiendan <span className="font-semibold">{MIN_MATERIAS_ANALISIS}+ materias</span>.</p>
                <ul className="list-disc pl-4 space-y-1 text-[11px] sm:text-xs text-amber-700">
                  <li>Realiza un nuevo intento después de revisar tus errores.</li>
                  <li>Evita repetir inmediatamente: estudia y vuelve para generar datos útiles.</li>
                  <li>Agrega variedad de áreas para obtener métricas comparables.</li>
                </ul>
              </div>
              <button
                onClick={() => setShowAvisoMinIntentos(false)}
                aria-label="Cerrar aviso"
                className="text-amber-600 hover:text-amber-800 text-sm font-semibold px-2"
              >✕</button>
            </div>
          )}

          {/* Avisos informativos (opcional): se ocultan para simplificar UI */}

          {/* Estado de carga */}
          {(cargandoIA || isLoadingAnalysis) && (
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

          {/* Análisis detallado inline (en lugar de modal) */}
          {(showInlineAnalysis || analysisText || analysisError) && (
            <div className="bg-white border border-indigo-200 rounded-lg p-4 sm:p-6 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-indigo-900 text-sm sm:text-base flex items-center">
                  <Sparkles className="w-4 h-4 mr-2 text-indigo-500" />
                  Análisis detallado (preguntas)
                </h4>
                <div className="flex items-center gap-2">
                  {analysisText && (
                    <button
                      onClick={() => {
                        try { navigator.clipboard.writeText(analysisText); } catch (e) { }
                      }}
                      className="px-2.5 py-1.5 text-xs bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >Copiar</button>
                  )}
                  <button
                    onClick={() => setShowInlineAnalysis(!showInlineAnalysis)}
                    className="px-2.5 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
                  >{showInlineAnalysis ? 'Ocultar' : 'Mostrar'}</button>
                </div>
              </div>

              {isLoadingAnalysis && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                  <div className="flex items-center space-x-3">
                    <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                    <p className="text-xs text-indigo-800">Generando análisis…</p>
                  </div>
                </div>
              )}
              {analysisError && !isLoadingAnalysis && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-800">{analysisError}</p>
                </div>
              )}
              {analysisText && showInlineAnalysis && !isLoadingAnalysis && (
                <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // Tipografía y jerarquía
                      h2: (props) => <h2 {...props} className="mt-5 mb-3 text-2xl font-bold text-indigo-900" />,
                      h3: (props) => <h3 {...props} className="mt-4 mb-2 text-xl font-semibold text-indigo-900" />,
                      h4: (props) => <h4 {...props} className="mt-3 mb-1.5 text-lg font-semibold text-indigo-900" />,
                      p: (props) => <p {...props} style={{ textAlign: 'justify' }} />,

                      // Listas
                      ul: (props) => <ul {...props} className="list-disc pl-5 space-y-1" />,
                      ol: (props) => <ol {...props} className="list-decimal pl-5 space-y-1" />,
                      li: (props) => <li {...props} className="marker:text-indigo-500" />,

                      // Citas, separadores
                      blockquote: (props) => (
                        <blockquote {...props} className="border-l-4 border-indigo-300 bg-indigo-50/60 px-3 py-2 text-indigo-900 rounded-sm" />
                      ),
                      hr: (props) => <hr {...props} className="my-4 border-t border-gray-200" />,

                      // Código
                      pre: ({ children, ...props }) => (
                        <pre {...props} className="bg-gray-900 text-gray-100 rounded-lg p-3 overflow-x-auto my-3">
                          {children}
                        </pre>
                      ),
                      code: ({ inline, className, children, ...props }) => (
                        inline
                          ? <code {...props} className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-[0.9em]" >{children}</code>
                          : <code {...props} className={className}>{children}</code>
                      ),

                      // Tablas
                      table: (props) => <table {...props} className="w-full text-left border-collapse my-3" />,
                      thead: (props) => <thead {...props} className="bg-gray-50" />,
                      tbody: (props) => <tbody {...props} />,
                      tr: (props) => <tr {...props} className="even:bg-gray-50/50" />,
                      th: (props) => <th {...props} className="border border-gray-200 px-3 py-2 font-semibold text-gray-800" />,
                      td: (props) => <td {...props} className="border border-gray-200 px-3 py-2" />,
                    }}
                  >
                    {toMarkdownFriendly(analysisText)}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}

          {/* Análisis de IA */}
          {analisisIA && mostrarAnalisisIA && (
            <div className="space-y-4 sm:space-y-6">
              {/* Barra de estado IA y acciones rápidas */}
              <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs">
                  <span className={`px-2 py-1 rounded-full font-medium ${analisisIA.esFallbackLocal ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                    {analisisIA.esFallbackLocal ? 'Análisis heurístico (offline)' : 'IA en línea'}
                  </span>
                  {analisisIA.desdeCache && (
                    <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">Desde caché</span>
                  )}
                  {typeof iaLatencyMs === 'number' && (
                    <span className="text-gray-600">⏱ {iaLatencyMs} ms</span>
                  )}
                  {ultimoAvisoIA && (
                    <span className="text-gray-600">• {ultimoAvisoIA}</span>
                  )}
                  {mensajeNoCambio && (
                    <span className="text-gray-600">• {mensajeNoCambio}</span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={generarAnalisisIA}
                    disabled={cargandoIA || cooldownIA > 0}
                    className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-md inline-flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Reintentar
                  </button>
                  {analisisIA && (
                    <>
                      <button
                        onClick={() => descargarResumenComoPDF(analisisIA)}
                        className="px-3 py-1.5 text-xs bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                      >Descargar PDF</button>
                      <button
                        onClick={() => compartirPorWhatsApp(analisisIA)}
                        className="px-3 py-1.5 text-xs bg-green-600 hover:bg-green-700 text-white rounded-md"
                      >Compartir WhatsApp</button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      try {
                        if (lastDatosAnalisis) limpiarCacheAnalisisGemini(lastDatosAnalisis);
                        setUltimoAvisoIA('Caché de análisis limpiada.');
                      } catch { }
                    }}
                    className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
                  >Limpiar caché</button>
                  {analisisIA && (
                    <button
                      onClick={() => {
                        try {
                          const texto = construirResumenCompartible(analisisIA);
                          if (texto) {
                            navigator.clipboard.writeText(texto);
                            setUltimoAvisoIA('Resumen copiado.');
                          }
                        } catch { }
                      }}
                      className="px-3 py-1.5 text-xs bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >Copiar resumen</button>
                  )}
                </div>
              </div>
              {/* Sugerencias Personalizadas */}
              {sugerenciasPersonalizadas && (
                <div className="bg-white border border-blue-200 rounded-lg p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-blue-900 text-sm sm:text-base flex items-center">
                      <Lightbulb className="w-4 h-4 mr-2 text-blue-500" />
                      Sugerencias Inteligentes Personalizadas
                    </h4>
                    <button onClick={() => setMostrarSugerencias(!mostrarSugerencias)} className="text-xs text-blue-600 hover:underline">
                      {mostrarSugerencias ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>
                  {mostrarSugerencias && (
                    <div className="space-y-5">
                      <div>
                        <p className="text-xs sm:text-sm text-blue-800 font-medium mb-2">Diagnóstico de Causas Probables</p>
                        <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                          {sugerenciasPersonalizadas.causas.map((c, i) => (
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
                            {sugerenciasPersonalizadas.plan7Dias.map((p, i) => (
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
                          {sugerenciasPersonalizadas.apalancarFortalezas.map((f, i) => (
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
                          {sugerenciasPersonalizadas.quickTips.map((t, i) => (
                            <li key={i} className="text-[11px] text-blue-700 leading-snug">{t}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => {
                            try {
                              const texto = JSON.stringify(sugerenciasPersonalizadas, null, 2);
                              navigator.clipboard.writeText(texto);
                              setUltimoAvisoIA('Plan copiado al portapapeles.');
                            } catch (e) { console.warn('No se pudo copiar', e); }
                          }}
                          className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                        >Copiar Plan</button>
                        <button
                          onClick={() => setMostrarSugerencias(false)}
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
                      onClick={() => {
                        try {
                          navigator.clipboard.writeText(JSON.stringify(insightsAvanzados, null, 2));
                          setUltimoAvisoIA('Métricas avanzadas copiadas.');
                        } catch (e) { }
                      }}
                      className="px-3 py-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-md"
                    >Copiar métricas</button>
                    <button
                      onClick={() => setInsightsAvanzados(null)}
                      className="px-3 py-1.5 text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
                    >Ocultar</button>
                  </div>
                </div>
              )}
              {/* Métricas de efectividad del análisis IA */}
              {metricasIA && !datosInsuficientesAvanzado && (
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
                        <div style={{ width: `${(metricasIA.debilidades.f1 * 100).toFixed(0)}%` }} className="h-full bg-indigo-500"></div>
                      </div>
                      <p className="text-[10px] mt-1 text-indigo-700">
                        P {(metricasIA.debilidades.precision * 100).toFixed(0)}% · R {(metricasIA.debilidades.recall * 100).toFixed(0)}% · F1 {(metricasIA.debilidades.f1 * 100).toFixed(0)}%
                      </p>
                      <p className="text-[10px] text-indigo-600 mt-1">TP {metricasIA.debilidades.tp} / Pred {metricasIA.debilidades.pred} / Gold {metricasIA.debilidades.gold}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                      <p className="text-xs font-medium text-green-800 mb-1">F1 Fortalezas</p>
                      <div className="w-full bg-white h-2 rounded overflow-hidden border border-green-200">
                        <div style={{ width: `${(metricasIA.fortalezas.f1 * 100).toFixed(0)}%` }} className="h-full bg-green-500"></div>
                      </div>
                      <p className="text-[10px] mt-1 text-green-700">
                        P {(metricasIA.fortalezas.precision * 100).toFixed(0)}% · R {(metricasIA.fortalezas.recall * 100).toFixed(0)}% · F1 {(metricasIA.fortalezas.f1 * 100).toFixed(0)}%
                      </p>
                      <p className="text-[10px] text-green-600 mt-1">TP {metricasIA.fortalezas.tp} / Pred {metricasIA.fortalezas.pred} / Gold {metricasIA.fortalezas.gold}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                      <p className="text-[10px] font-medium text-yellow-800">Cobertura</p>
                      <p className="text-sm font-semibold text-yellow-700">{(metricasIA.cobertura.valor * 100).toFixed(0)}%</p>
                      <p className="text-[10px] text-yellow-600">{metricasIA.cobertura.materiasReferenciadas}/{metricasIA.cobertura.total} materias</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                      <p className="text-[10px] font-medium text-purple-800">Puntaje Global</p>
                      <p className="text-sm font-semibold text-purple-700">{(metricasIA.puntajeGlobal * 100).toFixed(0)}%</p>
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
              {datosInsuficientesAvanzado && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                    <div className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                      <p className="font-semibold mb-1">Datos insuficientes para métricas avanzadas</p>
                      <p>Genera al menos <span className="font-semibold">{MIN_INTENTOS_TENDENCIA} intentos (ideal {IDEAL_INTENTOS_TENDENCIA}+)</span> y añade otra materia / área para mostrar F1, cobertura y plan de estudio optimizado.</p>
                      <p className="mt-2 text-gray-600">Actualmente: intentos = {intentosList.length}, materias = {promediosPorMateria.length}. Cuando cumplas los requisitos, aparecerán métricas de calidad de IA aquí.</p>
                    </div>
                  </div>
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
                    <p className="text-indigo-800 text-xs sm:text-sm leading-relaxed" style={{ textAlign: 'justify' }}>
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

              {/* Preguntas Problemáticas - NUEVA SECCIÓN */}
              {analisisIA.preguntasProblematicas && analisisIA.preguntasProblematicas.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6">
                  <h4 className="font-semibold text-red-900 text-sm sm:text-base mb-3 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Preguntas Donde Más Fallas
                  </h4>
                  <p className="text-xs text-red-700 mb-4">
                    La IA analizó todas tus respuestas y identificó las preguntas donde más errores cometes. Enfócate en estas para mejorar.
                  </p>
                  <div className="space-y-4">
                    {analisisIA.preguntasProblematicas.map((pregunta, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 border border-red-200">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-red-800 text-sm flex-1">
                            Pregunta {pregunta.idPregunta || index + 1}
                          </h5>
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                            Fallada {pregunta.vecesFallada || 'varias'} veces
                          </span>
                        </div>
                        <p className="text-red-900 text-xs sm:text-sm mb-2 font-medium">
                          {pregunta.enunciado}
                        </p>
                        {pregunta.respuestasIncorrectas && pregunta.respuestasIncorrectas.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs font-medium text-red-700 mb-1">Respuestas que diste (incorrectas):</p>
                            <ul className="text-xs text-red-600 space-y-1 pl-4">
                              {pregunta.respuestasIncorrectas.map((resp, i) => (
                                <li key={i} className="list-disc">"{resp}"</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {pregunta.respuestaCorrecta && (
                          <div className="mb-2">
                            <p className="text-xs font-medium text-green-700 mb-1">Respuesta correcta:</p>
                            <p className="text-xs text-green-800 pl-4">"{pregunta.respuestaCorrecta}"</p>
                          </div>
                        )}
                        {pregunta.analisis && (
                          <div className="mb-2">
                            <p className="text-xs font-medium text-red-800 mb-1">Análisis:</p>
                            <p className="text-xs text-red-700 pl-4">{pregunta.analisis}</p>
                          </div>
                        )}
                        {pregunta.recomendacion && (
                          <div className="mt-2 pt-2 border-t border-red-200">
                            <p className="text-xs font-medium text-red-800 mb-1">💡 Recomendación:</p>
                            <p className="text-xs text-red-700 pl-4">{pregunta.recomendacion}</p>
                          </div>
                        )}
                        {pregunta.tipoError && (
                          <span className="inline-block mt-2 text-[10px] px-2 py-0.5 bg-red-100 text-red-700 rounded">
                            Tipo: {pregunta.tipoError}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Patrones de Errores - NUEVA SECCIÓN */}
              {analisisIA.patronesErrores && Object.keys(analisisIA.patronesErrores).length > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 sm:p-6">
                  <h4 className="font-semibold text-purple-900 text-sm sm:text-base mb-3 flex items-center">
                    <Brain className="w-4 h-4 mr-2" />
                    Patrones de Errores Identificados
                  </h4>
                  <div className="space-y-3">
                    {analisisIA.patronesErrores.tipoPreguntaMasFallada && (
                      <div className="bg-white rounded-lg p-3 border border-purple-200">
                        <p className="text-xs font-medium text-purple-800 mb-1">Tipo de pregunta donde más fallas:</p>
                        <p className="text-xs text-purple-700">{analisisIA.patronesErrores.tipoPreguntaMasFallada}</p>
                      </div>
                    )}
                    {analisisIA.patronesErrores.materiaMasProblematica && (
                      <div className="bg-white rounded-lg p-3 border border-purple-200">
                        <p className="text-xs font-medium text-purple-800 mb-1">Materia más problemática:</p>
                        <p className="text-xs text-purple-700">{analisisIA.patronesErrores.materiaMasProblematica}</p>
                      </div>
                    )}
                    {analisisIA.patronesErrores.longitudPregunta && (
                      <div className="bg-white rounded-lg p-3 border border-purple-200">
                        <p className="text-xs font-medium text-purple-800 mb-1">Patrón de longitud:</p>
                        <p className="text-xs text-purple-700">{analisisIA.patronesErrores.longitudPregunta}</p>
                      </div>
                    )}
                    {analisisIA.patronesErrores.patronTemporal && (
                      <div className="bg-white rounded-lg p-3 border border-purple-200">
                        <p className="text-xs font-medium text-purple-800 mb-1">Evolución entre intentos:</p>
                        <p className="text-xs text-purple-700">{analisisIA.patronesErrores.patronTemporal}</p>
                      </div>
                    )}
                    {analisisIA.patronesErrores.erroresRecurrentes && analisisIA.patronesErrores.erroresRecurrentes.length > 0 && (
                      <div className="bg-white rounded-lg p-3 border border-purple-200">
                        <p className="text-xs font-medium text-purple-800 mb-2">Errores que se repiten:</p>
                        <ul className="text-xs text-purple-700 space-y-1 pl-4">
                          {analisisIA.patronesErrores.erroresRecurrentes.map((error, i) => (
                            <li key={i} className="list-disc">{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
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
                disabled={(historial?.intentos?.length || 0) < 2}
                title={(historial?.intentos?.length || 0) < 2 ? 'Necesitas al menos 2 intentos para análisis IA' : ''}
                className="inline-flex items-center justify-center w-full sm:w-auto space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium transition-colores text-sm sm:text-base disabled:cursor-not-allowed"
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
            <div className="flex items-center mb-1 sm:mb-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mr-2 flex-shrink-0" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Evolución General</h3>
            </div>
            <p className="text-[11px] sm:text-xs text-gray-500 mb-3">El intento 1 es la calificación oficial; los demás son práctica y muestran progreso.</p>
            {mostrarAvisoPocosDatos && (
              <div className="mb-3 rounded-md bg-blue-50 border border-blue-200 px-3 py-2 text-[11px] sm:text-xs text-blue-700">
                Necesitas al menos 2 intentos para apreciar una tendencia; agrega más práctica para un análisis visual más claro.
              </div>
            )}
            <div className="w-full overflow-x-auto scrollbar-hide relative" style={{ WebkitOverflowScrolling: 'touch' }}>
              {/* Fade lateral cuando hay scroll */}
              {dynamicChartWidth > (isMobile ? window.innerWidth - 32 : 0) && (
                <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent"></div>
              )}
              <div style={{ minWidth: dynamicChartWidth }} className="pr-2">
                <ResponsiveContainer width="100%" height={isMobile ? 210 : 320}>
                  <AreaChart data={datosGrafica} margin={{ top: 10, right: 20, left: 0, bottom: rotateXAxis ? 30 : 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="intento"
                      interval={0}
                      tick={{ fontSize: isMobile ? 10 : 12 }}
                      angle={rotateXAxis ? -40 : 0}
                      textAnchor={rotateXAxis ? 'end' : 'middle'}
                      height={rotateXAxis ? 55 : 30}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: isMobile ? 10 : 12 }}
                      width={isMobile ? 32 : 44}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '10px',
                        boxShadow: '0 4px 10px -2px rgba(0,0,0,0.06)',
                        fontSize: isMobile ? '11px' : '12px'
                      }}
                      formatter={(value, _name, props) => {
                        const labelIdx = props?.payload ? Number(String(props.payload.intento).replace(/[^0-9]/g, '')) - 1 : -1;
                        const tipo = labelIdx === 0 ? 'Puntaje (oficial)' : 'Puntaje (práctica)';
                        return [value + '%', tipo];
                      }}
                      labelFormatter={(label, payload) => {
                        if (!payload || !payload.length) return label;
                        const original = payload[0]?.payload;
                        return `${label} · ${original?.fecha || ''}`;
                      }}
                    />
                    {mostrarLineasReferencia && (
                      <>
                        <ReferenceLine y={metaMinima} stroke="#F59E0B" strokeDasharray="4 4" label={{ value: '70% Meta Mín', position: 'right', fill: '#B45309', fontSize: 10 }} />
                        <ReferenceLine y={metaFortaleza} stroke="#10B981" strokeDasharray="4 4" label={{ value: '80% Fortaleza', position: 'right', fill: '#047857', fontSize: 10 }} />
                      </>
                    )}
                    <Area
                      type="monotone"
                      dataKey="puntaje"
                      stroke="#2563EB"
                      fill="url(#gradientPuntajeV2)"
                      strokeWidth={2}
                      activeDot={{ r: 5, stroke: '#1D4ED8', strokeWidth: 2, fill: '#fff' }}
                      dot={{ r: 3, stroke: '#1D4ED8', strokeWidth: 1, fill: '#fff' }}
                    />
                    <defs>
                      <linearGradient id="gradientPuntajeV2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
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

// Modal renderizado dentro del JSX principal para permitir el overlay y la exportación