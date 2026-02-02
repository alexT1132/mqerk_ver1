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
  Zap,
  MessageCircle,
  FileDown,
  RefreshCw,
  Send,
  Loader2,
  X,
  Bot,
  MessageSquare,
  Sparkles,
  Download,
  Share2,
  ChevronDown,
  ChevronUp,
  Star
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
import { analyzeQuizPerformance, askQuickTutor, getAiUsage } from '../../service/quizAnalysisService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../../context/AuthContext';
import AlertDialog from '../ui/AlertDialog'; // Importar AlertDialog
import ChatTutor from './ChatTutor'; // Importar ChatTutor optimizado

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
  const [aiUsage, setAiUsage] = useState({ quizCount: 0, simuladorCount: 0, quizLimit: 5, simuladorLimit: 5, totalRemaining: 5 }); // Actualizado para consistencia

  // Estado para Chat Tutor (Visibilidad)
  const [showChat, setShowChat] = useState(false);
  // States chatQuery, chatLoading, chatResponse eliminados y movidos a ChatTutor.jsx para evitar re-renders masivos
  const [showQuotaModal, setShowQuotaModal] = useState(false); // Nuevo estado para el modal de cuota

  // Detectar fuente del análisis y limpiar marcadores ocultos
  const sourceMatch = analysisText ? analysisText.match(/<<<AI_SOURCE:([\w_]+)>>>/) : null;
  const analysisSource = sourceMatch?.[1] || null;
  const cleanedAnalysisText = analysisText ? analysisText.replace(/\n*<<<AI_SOURCE:[\w_]+>>>\s*$/, '') : analysisText;

  // Estado para Metacognición (Estrategia de Examen)
  const [estrategiaExamen, setEstrategiaExamen] = useState(null);

  // Obtener rol del usuario (ya tenemos user de useAuth arriba)
  const userRole = user?.rol || user?.role || 'estudiante';

  // Helpers para tracking de uso de IA (localStorage)
  const AI_USAGE_KEY = 'ai_analysis_usage';
  // Límites por rol: Los límites reales vienen del backend, estos son solo fallback
  // El backend tiene configurado: estudiantes=30, asesores=100, admin=500
  // Pero para análisis de simulaciones, limitamos a 5 para estudiantes
  const DAILY_LIMIT = userRole === 'asesor' || userRole === 'admin' ? 20 : 5;

  // Funciones de exportación
  const handleShareWhatsApp = () => {
    if (!analysisText) return;
    const mensaje = `*Mi Análisis de Simulación MQerk*\n\nHola, te comparto mi análisis de rendimiento:\n\n${analysisText.substring(0, 300)}...\n\nGenerado por MQerk Academy IA`;
    const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  const handleDownloadPDF = () => {
    if (!analysisText) return;
    // Crear una ventana nueva para imprimir con estilos
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor permite las ventanas emergentes para descargar el PDF');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Análisis de Rendimiento - MQerk Academy</title>
        <style>
          body { font-family: 'Helvetica', 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #6366f1; padding-bottom: 20px; }
          .logo { font-size: 24px; font-weight: bold; color: #4f46e5; }
          .meta { font-size: 14px; color: #666; margin-top: 5px; }
          h1, h2, h3 { color: #1e1b4b; }
          h1 { font-size: 22px; }
          h2 { font-size: 18px; border-left: 4px solid #6366f1; padding-left: 10px; margin-top: 25px; }
          h3 { font-size: 16px; font-weight: 600; }
          ul, ol { padding-left: 20px; }
          li { margin-bottom: 5px; }
          .highlight { background-color: #eef2ff; padding: 15px; border-radius: 8px; border: 1px solid #c7d2fe; margin: 15px 0; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th { background-color: #f3f4f6; text-align: left; padding: 8px; border: 1px solid #d1d5db; }
          td { padding: 8px; border: 1px solid #d1d5db; }
          blockquote { border-left: 4px solid #818cf8; background-color: #f5f3ff; margin: 10px 0; padding: 10px 15px; color: #4338ca; }
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">MQerk Academy</div>
          <h1>Análisis de Rendimiento Inteligente</h1>
          <div class="meta">
            Estudiante: ${estudianteNombre || 'Usuario'}<br>
            Fecha: ${new Date().toLocaleDateString()}<br>
            Simulación: ${simulacion?.titulo || 'General'}
          </div>
        </div>
        <div class="content">
          ${toMarkdownFriendly(analysisText).replace(/\n/g, '<br>').replace(/## (.*)/g, '<h2>$1</h2>').replace(/### (.*)/g, '<h3>$1</h3>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
        </div>
        <div class="footer">
          Generado automáticamente por MQerk Academy IA
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Función para obtener y actualizar el uso de IA
  const refreshAiUsage = async (currentAnalysisSource) => {
    const studentId = idEstudiante || alumno?.id || user?.id;
    if (!studentId) {
      console.warn('⚠️ No se pudo obtener ID de estudiante para tracking de IA');
      return;
    }

    try {
      const qUsageResponse = await api.get(`/ai-usage/${studentId}/quiz`);
      const sUsageResponse = await api.get(`/ai-usage/${studentId}/simulacion`);

      const qUsage = qUsageResponse.data.data;
      const sUsage = sUsageResponse.data.data;

      const remainingQuiz = qUsage.limit - qUsage.count;
      const remainingSimulador = sUsage.limit - sUsage.count;
      const totalRemaining = remainingQuiz + remainingSimulador;

      setAiUsage({
        quizCount: qUsage.count,
        quizLimit: qUsage.limit,
        simuladorCount: sUsage.count,
        simuladorLimit: sUsage.limit,
        remainingQuiz: remainingQuiz,
        remainingSimulador: remainingSimulador,
        totalRemaining: totalRemaining,
        remaining: remainingSimulador // Para compatibilidad con botones de simulador
      });

      // Determinar si el modal de cuota debe mostrarse (Solo cuota de simuladores)
      const isQuotaExhausted = remainingSimulador <= 0;
      // Usar analysisSource derivado del texto O el del estado analisisIA (para caché)
      const effectiveSource = currentAnalysisSource || (analisisIA?.esFallbackLocal ? 'FALLBACK' : null);
      const isFallbackActive = (effectiveSource && effectiveSource.includes('FALLBACK'));

      setShowQuotaModal(isQuotaExhausted && !isFallbackActive); // Solo mostrar si está agotado Y no es solo un fallback técnico

    } catch (error) {
      console.error(`❌ Error obteniendo uso de IA desde BD:`, error);
      setShowQuotaModal(false);
    }
  };

  // Reducir cooldown cada segundo
  useEffect(() => {
    if (cooldownIA <= 0) return;
    const t = setTimeout(() => setCooldownIA(cooldownIA - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldownIA]);

  // Cargar uso de IA desde base de datos al abrir la página
  useEffect(() => {
    if (isOpen) {
      refreshAiUsage(analysisSource);
    }
  }, [isOpen, idEstudiante, alumno?.id, user?.id, analisisIA?.esFallbackLocal, analysisSource]); // Añadir analisisIA.esFallbackLocal como dependencia

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

      // Asegurar líneas en blanco entre párrafos PERO NO ROMPER TABLAS
      // Si una línea NO contiene '|' y la siguiente tampoco, entonces sí aplicar doble salto.
      // Esta regex es conservadora: solo aplica si no parece tabla.
      // O mejor: simplemente eliminamos esa regla agresiva que rompe tablas y listas
      // s = s.replace(/([^\n])\n(?!\n)([^\n])/g, '$1\n\n$2'); 

      // Reemplazo más seguro: solo agregar nuevas líneas si no son items de lista, ni tablas, ni headers
      s = s.replace(/^([^-\d#|].*)\n([^-\d#| \n].*)$/gm, '$1\n\n$2');

      return s;
    } catch {
      return txt;
    }
  };

  // Análisis de IA usage tracking se maneja arriba en refreshAiUsage y su useEffect asociado



  // Función para calcular estrategia de examen (Metacognición)
  const calcularEstrategia = (analitica) => {
    if (!analitica?.intentos?.length || !analitica?.preguntas?.length) return null;

    // Usar el último intento o el oficial (preferiblemente el último para feedback inmediato)
    const intentosOrdenados = [...analitica.intentos].sort((a, b) => {
      const fechaA = a?.intento?.fecha || a?.sesion?.finished_at || null;
      const fechaB = b?.intento?.fecha || b?.sesion?.finished_at || null;
      if (!fechaA) return 1; if (!fechaB) return -1;
      return new Date(fechaA).getTime() - new Date(fechaB).getTime();
    });
    const intento = intentosOrdenados[intentosOrdenados.length - 1];
    if (!intento || !intento.respuestas) return null;

    const preguntasById = new Map(analitica.preguntas.map(p => [p.id, p]));
    const respuestas = intento.respuestas;

    const impulsivas = []; // Incorrectas < 12s
    const bloqueos = [];   // Tiempo > 120s (o > 3x promedio)
    let sumaTiempos = 0;
    let countTiempos = 0;

    // Primero calcular promedio de tiempo para detectar bloqueos relativos
    respuestas.forEach(r => {
      if (typeof r.tiempo_ms === 'number' && r.tiempo_ms > 0) {
        sumaTiempos += r.tiempo_ms;
        countTiempos++;
      }
    });
    const promedioMs = countTiempos > 0 ? sumaTiempos / countTiempos : 0;
    const umbralBloqueo = Math.max(120000, promedioMs * 3); // Mínimo 2 minutos o 3x promedio
    const umbralImpulsivo = 10000; // 10 segundos

    respuestas.forEach(r => {
      const p = preguntasById.get(r.id_pregunta);
      if (!p) return;

      const tiempo = r.tiempo_ms || 0;
      const esCorrecta = r.id_opcion ? (p.opciones || []).some(o => o.id === r.id_opcion && Number(o.es_correcta) === 1) : false;

      // Detección de Impulsividad (Rápido + Error)
      if (!esCorrecta && tiempo > 0 && tiempo < umbralImpulsivo) {
        impulsivas.push({
          pregunta: p.enunciado,
          tiempoSeg: Math.round(tiempo / 1000),
          materia: p.materia || 'General'
        });
      }

      // Detección de Bloqueos (Muy lento + Error/Correcta, pero principalmente si afecta el ritmo)
      // Si tarda mucho y falla, es un bloqueo negativo claro.
      if (tiempo > umbralBloqueo) {
        bloqueos.push({
          pregunta: p.enunciado,
          tiempoSeg: Math.round(tiempo / 1000),
          resultado: esCorrecta ? 'Correcta (pero lenta)' : 'Incorrecta',
          materia: p.materia || 'General'
        });
      }
    });

    // Fatiga: Comparar primera mitad vs segunda mitad
    let fatiga = null;
    if (respuestas.length >= 10) {
      const mitad = Math.floor(respuestas.length / 2);
      const primeraMitad = respuestas.slice(0, mitad);
      const segundaMitad = respuestas.slice(mitad);

      const calcAciertos = (arr) => arr.filter(r => {
        const p = preguntasById.get(r.id_pregunta);
        return p && r.id_opcion && p.opciones.some(o => o.id === r.id_opcion && Number(o.es_correcta) === 1);
      }).length;

      const tasa1 = calcAciertos(primeraMitad) / primeraMitad.length;
      const tasa2 = calcAciertos(segundaMitad) / segundaMitad.length;

      if (tasa1 > tasa2 + 0.2) { // Caída > 20%
        fatiga = {
          detectada: true,
          caida: Math.round((tasa1 - tasa2) * 100),
          mensaje: 'Tu rendimiento cae significativamente en la segunda mitad del examen.'
        };
      }
    }

    return { impulsivas, bloqueos, fatiga, timestamp: new Date().toISOString() };
  };

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

  // Función para identificar errores recurrentes (preguntas falladas múltiples veces)
  const identificarErroresRecurrentes = (analitica) => {
    if (!analitica?.intentos?.length || !analitica?.preguntas?.length) return [];

    // Mapa de preguntas falladas por intento
    const erroresPorPregunta = new Map();

    analitica.intentos.forEach((intento, idx) => {
      const respuestas = Array.isArray(intento.respuestas) ? intento.respuestas : [];
      respuestas.forEach(r => {
        const pregunta = analitica.preguntas.find(p => p.id === r.id_pregunta);
        if (!pregunta) return;

        const esCorrecta = r.id_opcion
          ? (pregunta.opciones || []).some(o => o.id === r.id_opcion && Number(o.es_correcta) === 1)
          : false;

        if (!esCorrecta) {
          const key = r.id_pregunta;
          if (!erroresPorPregunta.has(key)) {
            erroresPorPregunta.set(key, {
              enunciado: pregunta.enunciado,
              materia: pregunta.materia || pregunta.categoria || pregunta.area || null,
              tipo: pregunta.tipo,
              veces: 0,
              intentos: [],
              opciones: pregunta.opciones || []
            });
          }
          const error = erroresPorPregunta.get(key);
          error.veces++;
          error.intentos.push(idx + 1);
        }
      });
    });

    // Retornar solo errores recurrentes (>=2 veces), ordenados por frecuencia
    return Array.from(erroresPorPregunta.values())
      .filter(e => e.veces >= 2)
      .sort((a, b) => b.veces - a.veces);
  };

  // Función para analizar consistencia por pregunta (detectar conocimiento inestable)
  const analizarConsistenciaPorPregunta = (analitica) => {
    if (!analitica?.intentos?.length || !analitica?.preguntas?.length) return [];

    const consistenciaPorPregunta = new Map();

    analitica.intentos.forEach((intento, idx) => {
      const respuestas = Array.isArray(intento.respuestas) ? intento.respuestas : [];
      respuestas.forEach(r => {
        const key = r.id_pregunta;
        if (!consistenciaPorPregunta.has(key)) {
          consistenciaPorPregunta.set(key, {
            historial: [],
            idPregunta: key
          });
        }

        const pregunta = analitica.preguntas.find(p => p.id === key);
        const esCorrecta = pregunta?.opciones?.some(
          o => o.id === r.id_opcion && Number(o.es_correcta) === 1
        ) || false;

        consistenciaPorPregunta.get(key).historial.push({
          intento: idx + 1,
          correcta: esCorrecta
        });
      });
    });

    // Detectar patrones inconsistentes (a veces acierta, a veces falla)
    const preguntasInconsistentes = [];
    consistenciaPorPregunta.forEach((data, idPregunta) => {
      const historial = data.historial;
      const correctas = historial.filter(h => h.correcta).length;
      const incorrectas = historial.filter(h => !h.correcta).length;

      // Si tiene ambos resultados (correcta E incorrecta), es inconsistente
      if (correctas > 0 && incorrectas > 0) {
        const pregunta = analitica.preguntas.find(p => p.id === idPregunta);
        if (pregunta) {
          preguntasInconsistentes.push({
            enunciado: pregunta.enunciado,
            materia: pregunta.materia || pregunta.categoria || pregunta.area || null,
            historial: historial.map(h => h.correcta ? '✓' : '✗').join(' → '),
            historialDetallado: historial,
            correctas,
            incorrectas,
            diagnostico: '🚨 CONOCIMIENTO INESTABLE: A veces acierta, a veces falla. Indica adivinación o dominio superficial.',
            prioridad: 'CRÍTICA'
          });
        }
      }
    });

    return preguntasInconsistentes.sort((a, b) => {
      // Priorizar las que tienen más variación
      const varA = Math.min(a.correctas, a.incorrectas);
      const varB = Math.min(b.correctas, b.incorrectas);
      return varB - varA;
    });
  };

  // Función para detectar conocimiento inestable en materias (altibajos extremos)
  const detectarConocimientoInestable = (materiasProm) => {
    return materiasProm.map(m => {
      const serie = Array.isArray(m.puntajes) ? m.puntajes : [];
      if (serie.length < 3) {
        return {
          ...m,
          esInestable: false,
          esAdivinando: false,
          desviacion: 0,
          diagnostico: '📊 Datos insuficientes para análisis de estabilidad'
        };
      }

      // Calcular desviación estándar
      const promedio = serie.reduce((a, b) => a + b, 0) / serie.length;
      const varianza = serie.reduce((a, b) => a + Math.pow(b - promedio, 2), 0) / serie.length;
      const desviacion = Math.sqrt(varianza);

      // Detectar patrón de altibajos (cambios bruscos entre intentos)
      let altibajos = 0;
      let sumaVariaciones = 0;
      for (let i = 1; i < serie.length; i++) {
        const cambio = Math.abs(serie[i] - serie[i - 1]);
        sumaVariaciones += cambio;
        if (cambio > 15) altibajos++; // Cambio brusco >15 puntos
      }
      const variacionPromedio = serie.length > 1 ? sumaVariaciones / (serie.length - 1) : 0;

      // Criterios de detección
      const esInestable = desviacion > 12; // Desviación >12 puntos indica inconsistencia
      const esAdivinando = altibajos >= Math.ceil(serie.length / 2) || variacionPromedio > 18;

      // Diagnóstico detallado
      let diagnostico = '';
      if (esAdivinando) {
        diagnostico = '🚨 ADIVINANDO: Variaciones extremas entre intentos (ej: 50%→70%→50%). NO domina el contenido, solo tiene suerte ocasional.';
      } else if (esInestable) {
        diagnostico = '⚠️ CONOCIMIENTO INESTABLE: Resultados inconsistentes. Necesita reforzar fundamentos.';
      } else {
        diagnostico = '✓ CONOCIMIENTO ESTABLE: Rendimiento consistente.';
      }

      return {
        ...m,
        esInestable,
        esAdivinando,
        desviacion: Number(desviacion.toFixed(1)),
        variacionPromedio: Number(variacionPromedio.toFixed(1)),
        altibajos,
        diagnostico
      };
    });
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

  // Función para generar análisis con IA (MIGRADO A quizAnalysisService para mejor análisis)
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

    setCargandoIA(true);
    setErrorIA(null);
    enProcesoRef.current = true;

    try {
      // 1) Enriquecer datos: obtener analítica detallada (preguntas, intentos, respuestas)
      let analitica = null;
      try {
        const studentId = idEstudiante || historial?.id_estudiante || historial?.estudianteId || null;
        if (studentId) {
          const respDet = await api.get(`/simulaciones/${simulacion.id}/analitica/${studentId}`);
          analitica = respDet?.data?.data || null;
          console.log('📊 Analítica detallada cargada:', analitica ? 'Sí' : 'No');
        }
      } catch (e) {
        console.warn('⚠️ Analítica detallada no disponible; se continuará con datos agregados.', e?.response?.status || e?.message);
      }

      // 2) Preparar datos para el análisis
      // Ordenar intentos cronológicamente
      const intentosOrdenados = Array.isArray(historial.intentos)
        ? [...historial.intentos].sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
        : [];
      const intentoOficial = intentosOrdenados[0] || null;

      // 3) Generar incorrectasDetalle con TODOS los errores (priorizar oficial + último)
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

      // 4) Identificar errores recurrentes
      const erroresRecurrentes = identificarErroresRecurrentes(analitica);
      console.log('🔄 Errores recurrentes detectados:', erroresRecurrentes.length);

      // 5) Analizar consistencia por pregunta (conocimiento inestable)
      const preguntasInconsistentes = analizarConsistenciaPorPregunta(analitica);
      console.log('🚨 Preguntas con conocimiento inestable:', preguntasInconsistentes.length);

      // 6) Detectar conocimiento inestable por materia
      const materiasConDiagnostico = detectarConocimientoInestable(promediosPorMateria);
      const materiasAdivinando = materiasConDiagnostico.filter(m => m.esAdivinando);
      console.log('🎲 Materias donde está adivinando:', materiasAdivinando.map(m => m.materia).join(', '));

      // 7) Preparar datos para analyzeQuizPerformance (quizAnalysisService)
      const scores = intentosOrdenados.map(i => Number(i.puntaje) || 0);
      const fechas = intentosOrdenados.map(i => i.fecha);
      const duraciones = intentosOrdenados.map(i => {
        const sec = getAttemptSeconds(i);
        return sec > 0 ? sec : null;
      }).filter(v => v != null);

      const ultimoIntento = intentosOrdenados[intentosOrdenados.length - 1];
      const ultimoPuntaje = Number(ultimoIntento?.puntaje) || 0;

      // Calcular duraciones del intento oficial
      let oficialDuracion = null;
      if (analitica && Array.isArray(analitica.intentos) && analitica.intentos.length) {
        const intentosAnaliticaOrdenados = [...analitica.intentos].sort((a, b) => {
          const fechaA = a?.intento?.fecha || a?.sesion?.finished_at || null;
          const fechaB = b?.intento?.fecha || b?.sesion?.finished_at || null;
          if (!fechaA && !fechaB) return 0;
          if (!fechaA) return 1;
          if (!fechaB) return -1;
          return new Date(fechaA).getTime() - new Date(fechaB).getTime();
        });
        const primero = intentosAnaliticaOrdenados[0];
        if (typeof primero?.intento?.tiempo_segundos === 'number' && primero.intento.tiempo_segundos > 0) {
          oficialDuracion = Math.round(primero.intento.tiempo_segundos);
        } else if (typeof primero?.sesion?.elapsed_ms === 'number' && primero.sesion.elapsed_ms > 0) {
          oficialDuracion = Math.round(primero.sesion.elapsed_ms / 1000);
        }
      }

      // Métricas del último intento
      let totalPreguntasIntento = null;
      let correctasIntento = null;
      let incorrectasIntento = null;
      let omitidasIntento = null;
      if (analitica && Array.isArray(analitica.intentos) && analitica.intentos.length) {
        const ultimo = analitica.intentos[analitica.intentos.length - 1];
        const resp = Array.isArray(ultimo?.respuestas) ? ultimo.respuestas : [];
        const preguntas = Array.isArray(analitica.preguntas) ? analitica.preguntas : [];
        const preguntasById = new Map(preguntas.map(p => [p.id, p]));

        let corr = 0, inc = 0, omi = 0;
        resp.forEach(r => {
          const pq = preguntasById.get(r.id_pregunta);
          if (!pq) return;
          const esCorrecta = r.id_opcion ? (pq.opciones || []).some(o => o.id === r.id_opcion && Number(o.es_correcta) === 1) : false;
          if (esCorrecta) corr++; else if (r.id_opcion) inc++; else omi++;
        });

        totalPreguntasIntento = preguntas.length || null;
        correctasIntento = corr;
        incorrectasIntento = inc;
        omitidasIntento = omi;
      }

      // 8) Llamar al servicio de análisis avanzado (quizAnalysisService)
      const t0 = Date.now();
      const analisisTexto = await analyzeQuizPerformance({
        itemName: simulacion.nombre,
        alumnoNombre: estudianteNombre || null,
        totalIntentos: intentosOrdenados.length,
        mejorPuntaje: scores.length ? Math.max(...scores) : 0,
        promedio: Math.round(promedioPuntaje || 0),
        scores: scores,
        fechas: fechas,
        duraciones: duraciones,
        ultimoPuntaje: ultimoPuntaje,
        oficialPuntaje: intentoOficial ? (Number(intentoOficial.puntaje) || 0) : null,
        oficialFecha: intentoOficial?.fecha || null,
        oficialDuracion: oficialDuracion,
        intentoNumero: intentosOrdenados.length,
        totalPreguntasIntento: totalPreguntasIntento,
        correctasIntento: correctasIntento,
        incorrectasIntento: incorrectasIntento,
        omitidasIntento: omitidasIntento,
        incorrectasDetalle: incorrectasDetalle,
        erroresRecurrentes: erroresRecurrentes,
        // ✅ NUEVO: Agregar información de conocimiento inestable
        preguntasInconsistentes: preguntasInconsistentes,
        materiasConDiagnostico: materiasConDiagnostico,
      });

      setIaLatencyMs(Date.now() - t0);
      console.log(`✅ Análisis generado en ${Date.now() - t0}ms`);

      // 9) Procesar respuesta (quizAnalysisService retorna texto Markdown directamente)
      const analisis = {
        resumen: analisisTexto,
        esFallbackLocal: analisisTexto.includes('<<<AI_SOURCE:FALLBACK>>>'),
        desdeCache: false,
        timestamp: new Date().toISOString()
      };

      setAnalisisIA(analisis);
      setMostrarAnalisisIA(true);

      // ✅ ACTUALIZAR CONTADOR VISUAL (El backend ya incrementó el uso)
      if (!analisis.esFallbackLocal && !analisis.desdeCache) {
        // Refrescar el contador para reflejar el incremento realizado por el backend
        refreshAiUsage();
      }

      // 10) Calcular métricas adicionales (insights avanzados)
      const insights = calcularInsightsAvanzados(promediosPorMateria);
      setInsightsAvanzados(insights);

      console.log('📊 Análisis completo:');
      console.log('  - Errores recurrentes:', erroresRecurrentes.length);
      console.log('  - Preguntas inconsistentes:', preguntasInconsistentes.length);
      console.log('  - Materias adivinando:', materiasAdivinando.length);

    } catch (error) {
      console.error('❌ Error generando análisis IA:', error);
      if (error.message && error.message.includes('Límite de peticiones')) {
        setErrorIA('Límite de peticiones excedido. Intenta nuevamente más tarde.');
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

  // Early return seguro: solo cierra si no está abierto o falta simulación
  if (!isOpen || !simulacion) return null;

  // Verificación de datos: si no hay historial o está vacío, mostrar estado amigable en vez de cortar todo
  if (!historial || !Array.isArray(historial.intentos) || historial.intentos.length === 0) {
    return (
      <div className="min-h-screen bg-white overflow-x-hidden">
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
        <pre>${texto.replace(/</g, '<').replace(/>/g, '>')}</pre>
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
    // 🛑 VALIDACIÓN DE CUOTA: Evitar llamada si no hay intentos disponibles
    if (aiUsage.totalRemaining <= 0) {
      setAnalysisError('Has alcanzado tu límite diario de análisis. Vuelve mañana.');
      setShowInlineAnalysis(true);
      return;
    }

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

      // ✅ Calcular Estrategia de Examen (Metacognición) si hay analítica
      if (analitica) {
        const estrategia = calcularEstrategia(analitica);
        setEstrategiaExamen(estrategia);
      }

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
      console.error('❌ Error generando análisis detallado:', error);
      setAnalysisError('Hubo un problema al generar el análisis. Inténtalo de nuevo.');
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  return (
    <div
      // TODO: Cambiar el color de fondo
      className="min-h-screen bg-white overflow-x-hidden"
      style={{
        WebkitOverflowScrolling: 'touch',
        position: 'relative',
        width: '100%',
        maxWidth: '100vw'
      }}
    >
      {/* Header simplificado sin gradiente, integrado al fondo */}
      <div className="bg-white text-gray-900 border-b border-gray-200 relative z-20 px-2 sm:px-6 lg:px-10 shadow-sm mt-4 sm:mt-6 rounded-t-2xl mx-1 sm:mx-6 lg:mx-10">
        <div className="flex items-center justify-between py-5 sm:py-8">
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
      <div className="w-full px-1 sm:px-6 lg:px-10 pt-8 sm:pt-12 pb-6 sm:pb-8">
        {/* Estadísticas principales - Grid responsive optimizado */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6 lg:mb-8 -mx-2 sm:mx-0">
          {/* Intento Oficial */}
          <div className="bg-white p-3 sm:p-5 lg:p-6 rounded-2xl shadow-md border border-blue-100 ring-4 ring-blue-50/30 hover:shadow-xl transition-all duration-300 col-span-2 md:col-span-1 mx-2 sm:mx-0">
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
          <div className="bg-white p-3 sm:p-5 lg:p-6 rounded-2xl shadow-md border border-gray-100 ring-4 ring-gray-50/30 hover:shadow-xl transition-all duration-300 mx-2 sm:mx-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-green-50 rounded-xl flex-shrink-0 ring-1 ring-green-100">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-semibold text-gray-500 truncate">Mejor Puntaje</p>
                <p className="text-base sm:text-lg lg:text-xl font-black text-green-600 leading-tight">
                  {historial.mejorPuntaje || Math.max(...historial.intentos.map(i => i.puntaje || 0))}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-5 lg:p-6 rounded-2xl shadow-md border border-gray-100 ring-4 ring-gray-50/30 hover:shadow-xl transition-all duration-300 mx-2 sm:mx-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-blue-50 rounded-xl flex-shrink-0 ring-1 ring-blue-100">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-semibold text-gray-500 truncate">Promedio</p>
                <p className="text-base sm:text-lg lg:text-xl font-black text-blue-600 leading-tight">{promedioPuntaje.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-3 sm:p-5 lg:p-6 rounded-2xl shadow-md border border-gray-100 ring-4 ring-gray-50/30 hover:shadow-xl transition-all duration-300 mx-2 sm:mx-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-purple-50 rounded-xl flex-shrink-0 ring-1 ring-purple-100">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-semibold text-gray-500 truncate">Mejor Tiempo</p>
                <p className="text-base sm:text-lg lg:text-xl font-black text-purple-600 leading-tight">{mejorTiempo}min</p>
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
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 ring-1 ring-gray-200/50">
          <div className="flex items-center mb-4 sm:mb-6">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mr-2 flex-shrink-0" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">Análisis por Materias/Áreas</h3>
          </div>

          <div className="grid grid-cols-1 min-[380px]:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {promediosPorMateria.map((materia, index) => (
              <div key={index} className="bg-white rounded-lg p-3 sm:p-4 border border-gray-100 shadow-sm">
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
          <div className="bg-white rounded-lg p-3 sm:p-4 overflow-hidden border border-gray-100">
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
                        <ul className="list-xs text-gray-600 space-y-1">
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
          {/* Título del contenedor */}
          <div className="flex items-center mb-3 sm:mb-4">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 mr-2 flex-shrink-0" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Análisis detallado de preguntas</h3>
          </div>

          {/* Botones y contador - Siempre en fila (dos columnas) */}
          <div className="flex flex-row items-center gap-3 sm:gap-4 mb-4 sm:mb-6">

            <button
              onClick={generarAnalisisDetallado}
              disabled={isLoadingAnalysis || (historial?.intentos?.length || 0) < MIN_INTENTOS_TENDENCIA || aiUsage.remaining === 0}
              title={
                aiUsage.remaining === 0 ? 'Límite diario de análisis alcanzado. Vuelve mañana.' :
                  (historial?.intentos?.length || 0) < MIN_INTENTOS_TENDENCIA ? `Requiere mínimo ${MIN_INTENTOS_TENDENCIA} intentos` :
                    'Generar análisis con IA'
              }
              className="flex items-center justify-center space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors text-xs sm:text-sm min-h-[44px] touch-manipulation flex-shrink-0"
            >
              {isLoadingAnalysis ? (
                <>
                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                  <span>Analizando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Generar análisis</span>
                </>
              )}
            </button>
            {/* Indicador IA en línea / Quota status */}
            {aiUsage.remaining > 0 ? (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-lg border border-green-200 mr-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-xs font-medium text-green-700">IA en línea</span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-200 mr-2">
                <AlertTriangle className="w-3 h-3 text-amber-500" />
                <span className="text-xs font-medium text-amber-700">Analizador Local</span>
              </div>
            )}

            {/* Indicador de uso de IA - Optimizado para móviles */}
            <div className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border-2 min-h-[44px] ml-auto ${aiUsage.remaining === 0 ? 'bg-red-50 border-red-300' :
              aiUsage.remaining <= 1 ? 'bg-yellow-50 border-yellow-300' :
                aiUsage.remaining <= 2 ? 'bg-orange-50 border-orange-300' :
                  'bg-blue-50 border-blue-200'
              }`}>
              <Brain className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${aiUsage.remaining === 0 ? 'text-red-600' :
                aiUsage.remaining <= 1 ? 'text-yellow-600' :
                  aiUsage.remaining <= 2 ? 'text-orange-600' :
                    'text-blue-600'
                }`} />
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] sm:text-xs font-medium text-gray-700 whitespace-nowrap">Análisis IA hoy:</span>
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className={`text-xs sm:text-sm font-bold whitespace-nowrap ${aiUsage.remaining === 0 ? 'text-red-600' :
                    aiUsage.remaining <= 1 ? 'text-yellow-700' :
                      aiUsage.remaining <= 2 ? 'text-orange-600' :
                        'text-blue-600'
                    }`}>
                    {aiUsage.remaining} de {aiUsage.limit} disponibles
                  </span>
                  {aiUsage.remaining === 0 && (
                    <span className="hidden sm:inline text-[10px] text-red-600 font-semibold animate-pulse whitespace-nowrap">
                      ⚠️ Límite alcanzado
                    </span>
                  )}
                  {aiUsage.remaining === 1 && (
                    <span className="hidden sm:inline text-[10px] text-yellow-700 font-semibold whitespace-nowrap">
                      ⚡ Último disponible
                    </span>
                  )}
                  {aiUsage.remaining === 2 && (
                    <span className="hidden sm:inline text-[10px] text-orange-600 font-semibold whitespace-nowrap">
                      ⚠️ Quedan 2
                    </span>
                  )}
                </div>
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
                      table: (props) => <table {...props} className="w-full text-left border-collapse my-4 rounded-lg overflow-hidden shadow-sm border border-indigo-100" />,
                      thead: (props) => <thead {...props} className="bg-indigo-50" />,
                      tbody: (props) => <tbody {...props} className="divide-y divide-indigo-50" />,
                      tr: (props) => <tr {...props} className="hover:bg-indigo-50/30 transition-colors" />,
                      th: (props) => <th {...props} className="px-4 py-3 font-semibold text-indigo-900 text-xs sm:text-sm uppercase tracking-wider" />,
                      td: (props) => <td {...props} className="px-4 py-3 text-sm text-gray-700 whitespace-pre-wrap" />,
                    }}
                  >
                    {toMarkdownFriendly(cleanedAnalysisText)}
                  </ReactMarkdown>

                  {/* Botones de acción / exportación */}
                  <div className="mt-6 flex flex-wrap gap-3 pt-4 border-t border-gray-100 items-center justify-between">
                    <div className="flex gap-3">
                      <button
                        onClick={handleShareWhatsApp}
                        className="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-sm font-medium transition-colors"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        WhatsApp
                      </button>
                      <button
                        onClick={handleDownloadPDF}
                        className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-medium transition-colors"
                      >
                        <FileDown className="w-4 h-4 mr-2" />
                        PDF
                      </button>
                    </div>
                    <div className="flex gap-2">
                      {/* Tutor Button with Blocking Logic */}
                      <div className="relative group">
                        <button
                          onClick={() => setShowChat(!showChat)}
                          disabled={(aiUsage.totalRemaining <= 0) || (analysisSource && analysisSource.includes('FALLBACK')) || (analisisIA?.esFallbackLocal)}
                          className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm ${(aiUsage.totalRemaining <= 0) || (analysisSource && analysisSource.includes('FALLBACK')) || (analisisIA?.esFallbackLocal)
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          {showChat ? 'Ocultar Tutor' : 'Preguntar al Tutor'}
                        </button>
                        {(aiUsage.remaining <= 0 || (analysisSource && analysisSource.includes('FALLBACK')) || (analisisIA?.esFallbackLocal)) && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                            {aiUsage.remaining <= 0 ? 'Cuota agotada' : 'No disponible en análisis local'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sección Chat Tutor Optimizado */}
                  {showChat && (
                    <ChatTutor
                      analysisContext={cleanedAnalysisText}
                      studentName={estudianteNombre}
                      onClose={() => setShowChat(false)}
                      onUsageUpdate={() => refreshAiUsage(analysisSource)}
                      aiUsage={aiUsage}
                      isFallback={(analisisIA?.esFallbackLocal) || (analysisSource && analysisSource.includes('FALLBACK'))}
                      analysisSource={analysisSource}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <AlertDialog
          open={showQuotaModal}
          onClose={() => setShowQuotaModal(false)}
          title="Cuota de IA Agotada"
          message="Has agotado tu cuota diaria de análisis con IA. Ahora se utilizará el analizador local."
          type="warning"
          confirmText="Entendido"
        />

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
            {/* ✅ NUEVA SECCIÓN: Análisis de Estrategia de Examen (Metacognición) */}
            {estrategiaExamen && (
              <div className="bg-white border border-violet-200 rounded-lg p-4 sm:p-6 mb-6 shadow-sm ring-1 ring-violet-100">
                <div className="flex items-center mb-4">
                  <Brain className="w-5 h-5 text-violet-600 mr-2" />
                  <h3 className="text-base sm:text-lg font-semibold text-violet-900">
                    Estrategia de Examen (Metacognición)
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Análisis de tu comportamiento: cómo gestionas el tiempo y tomas decisiones bajo presión.
                </p>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {/* Tarjeta Impulsividad */}
                  {estrategiaExamen.impulsivas.length > 0 && (
                    <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                      <div className="flex items-center gap-2 mb-2 text-orange-700 font-semibold">
                        <Zap className="w-4 h-4" />
                        <h4>Patrón Impulsivo</h4>
                      </div>
                      <p className="text-xs text-orange-800 mb-3">
                        Respondiste <span className="font-bold">{estrategiaExamen.impulsivas.length} preguntas</span> incorrectas en menos de 10 segundos.
                      </p>
                      <div className="bg-white/60 rounded p-2 text-xs text-orange-900 mb-2">
                        <strong>Estrategia sugerida:</strong> Lee el enunciado completo dos veces antes de ver las opciones. Oblígate a descartar 2 opciones antes de elegir.
                      </div>
                    </div>
                  )}

                  {/* Tarjeta Bloqueos */}
                  {estrategiaExamen.bloqueos.length > 0 && (
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <div className="flex items-center gap-2 mb-2 text-slate-700 font-semibold">
                        <Clock className="w-4 h-4" />
                        <h4>Bloqueos / Pérdida de Tiempo</h4>
                      </div>
                      <p className="text-xs text-slate-800 mb-3">
                        Te atascaste en <span className="font-bold">{estrategiaExamen.bloqueos.length} preguntas</span> por más de 2 minutos.
                      </p>
                      <div className="bg-white/60 rounded p-2 text-xs text-slate-900 mb-2">
                        <strong>Estrategia sugerida:</strong> Si no sabes la respuesta en 90 segundos, marca una temporalmente y pasa a la siguiente. No sacrifiques tiempo de preguntas fáciles.
                      </div>
                    </div>
                  )}

                  {/* Tarjeta Fatiga */}
                  {estrategiaExamen.fatiga?.detectada && (
                    <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                      <div className="flex items-center gap-2 mb-2 text-red-700 font-semibold">
                        <Activity className="w-4 h-4" />
                        <h4>Fatiga Cognitiva</h4>
                      </div>
                      <p className="text-xs text-red-800 mb-3">
                        {estrategiaExamen.fatiga.mensaje} (Caída del {estrategiaExamen.fatiga.caida}%)
                      </p>
                      <div className="bg-white/60 rounded p-2 text-xs text-red-900 mb-2">
                        <strong>Estrategia sugerida:</strong> Practica simulacros más largos para construir resistencia mental. Haz una pausa mental de 10s cada 15 preguntas.
                      </div>
                    </div>
                  )}
                  {/* Fallback si está todo bien */}
                  {!estrategiaExamen.impulsivas.length && !estrategiaExamen.bloqueos.length && !estrategiaExamen.fatiga?.detectada && (
                    <div className="col-span-full bg-green-50 rounded-xl p-4 border border-green-100 flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <h4 className="font-semibold text-green-800 text-sm">¡Buena Estrategia!</h4>
                        <p className="text-xs text-green-700">Tu ritmo es constante y no detectamos patrones de impulsividad o bloqueos graves.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

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
                  <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
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
            {/* Sección de Segundo Análisis eliminada para unificación */}
          </div>
        )}
      </div>
    </div>
  );
}

export default SimulacionGraficaHistorial;
