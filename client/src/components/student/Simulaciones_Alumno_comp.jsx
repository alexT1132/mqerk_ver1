// BACKEND: Componente de Simulaciones del Alumno
// Este componente maneja la página de simulaciones del estudiante con 3 niveles:
// 1. Tarjetas de simuladores (áreas generales vs módulos específicos)
// 2. Lista de módulos específicos (solo para módulos específicos)
// 3. Tabla de simulaciones disponibles con funcionalidad completa


import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStudent } from '../../context/StudentContext'; // Importar el hook
import {
  // simulaciones dedicadas
  listPreguntasSimulacion,
  crearSesionSimulacion,
  enviarRespuestasSesionSimulacion,
  finalizarSesionSimulacion,
  // listado/resumen/intentos
  listSimulaciones,
  resumenSimulacionesEstudiante,
  listIntentosSimulacionEstudiante
} from '../../api/simulaciones';
import { useAuth } from '../../context/AuthContext.jsx';
// Eliminado uso de datos mock; ahora todo viene de backend
import { getAreasCatalog } from '../../api/areas';
import { AREAS_CATALOG_CACHE } from '../../utils/catalogCache';
import { styleForArea } from '../common/areaStyles.jsx';
import SimulacionGraficaHistorial from '../simulaciones/SimulacionGraficaHistorial';
import { 
  ArrowLeft, 
  BookOpen, 
  FileText, 
  Brain, 
  ChevronDown, 
  Calendar,
  BarChart3,
  Users,
  Award,
  Clock,
  Heart,
  Cog,
  TrendingUp,
  GraduationCap,
  Leaf,
  Play,
  Globe,
  Trophy,
  Target,
  Zap,
  RotateCcw,
  Timer,
  CheckCircle2,
  AlertTriangle,
  Star,
  Lock,      // Icono de candado
  Send,      // Icono para enviar solicitud
  Hourglass, // Icono para estado pendiente
  LineChart, // Icono para gráficas
  GraduationCap as School, // Icono para Núcleo UNAM / IPN
  Anchor     // Icono para Militar, Naval y Náutica Mercante
} from 'lucide-react';
import UnifiedCard from '../common/UnifiedCard.jsx';

/**
 * Helper para convertir nombres de iconos a componentes React
 */
const getIconComponent = (iconName) => {
  const iconMap = {
    BarChart3: <BarChart3 className="w-6 h-6" />,
    Users: <Users className="w-6 h-6" />,
    BookOpen: <BookOpen className="w-6 h-6" />,
    Heart: <Heart className="w-6 h-6" />,
    Cog: <Cog className="w-6 h-6" />,
    TrendingUp: <TrendingUp className="w-6 h-6" />,
    GraduationCap: <GraduationCap className="w-6 h-6" />,
    Leaf: <Leaf className="w-6 h-6" />,
    Globe: <Globe className="w-6 h-6" />,
    School: <School className="w-6 h-6" />,
    Anchor: <Anchor className="w-6 h-6" />,
    Brain: <Brain className="w-6 h-6" />
  };
  return iconMap[iconName] || <Brain className="w-6 h-6" />;
};

/**
 * BACKEND: Componente de simulaciones con navegación por tipos
 * Flujo: Tipo de simulador → Módulos (si es específico) → Lista de simulaciones
 */
export function Simulaciones_Alumno_comp() {
  const navigate = useNavigate();
  const location = useLocation();
  // Estados de navegación
  const [currentLevel, setCurrentLevel] = useState('tipos'); // 'tipos', 'modulos', 'simulaciones'
  const [selectedTipo, setSelectedTipo] = useState(null); // 'generales' | 'especificos'
  const [selectedModulo, setSelectedModulo] = useState(null); // Para módulos específicos
  const [simulaciones, setSimulaciones] = useState([]);
  // (Debug removido) const [simsDebug, setSimsDebug] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Estados para efectos visuales
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiScore, setConfettiScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);

  // Contexto del estudiante para manejar áreas permitidas y solicitudes
  const { 
    allowedSimulationAreas, 
    simulationRequests, 
    addAllowedSimulationArea, 
    requestNewSimulationAreaAccess 
  } = useStudent();
  const { user, alumno } = useAuth() || {};
  const estudianteId = alumno?.id || user?.id_estudiante || user?.id || null;

  // Estados para historial de intentos
  const [showHistorialModal, setShowHistorialModal] = useState(false);
  const [selectedSimulacionHistorial, setSelectedSimulacionHistorial] = useState(null);
  const [simulacionesHistorial, setSimulacionesHistorial] = useState({});
  const [historialCache, setHistorialCache] = useState({}); // simulacionId -> intentos reales
  // Estado de carga/errores del backend de simulaciones
  const [loadingSims, setLoadingSims] = useState(false);
  const [simError, setSimError] = useState('');

  // Estados para modal de gráficas
  const [showGraficasModal, setShowGraficasModal] = useState(false);
  const [selectedSimulacionGraficas, setSelectedSimulacionGraficas] = useState(null);
  // Estado para restauración automática (deep-link) del historial
  const [pendingOpenHistorialSimId, setPendingOpenHistorialSimId] = useState(null);

  // Estados para modales de notificación
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationContent, setNotificationContent] = useState({
    title: '',
    message: '',
    type: 'success' // 'success', 'info', 'warning', 'error'
  });
  // Estado para modal de lanzamiento (countdown) y seguimiento de ventana
  const [launchModal, setLaunchModal] = useState({ open:false, simulacion:null, seconds:4 });
  const [launchingSimId, setLaunchingSimId] = useState(null); // id simulacion que está lanzando
  const simWindowRef = React.useRef(null);
  const simMonitorRef = React.useRef(null);
  // Fallback / retry minimal (para futuras integraciones API)
  const [loadError, setLoadError] = useState('');
  const [retryToken, setRetryToken] = useState(0);
  const manualRetrySims = () => setRetryToken(t=>t+1);

  // Catálogo dinámico de áreas/módulos (reuso de endpoint de Actividades)
  const [modulosEspecificos, setModulosEspecificos] = useState([]);
  const [areasGenerales, setAreasGenerales] = useState([]); // para filtrar simulaciones generales por id_area válido
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [catalogError, setCatalogError] = useState('');
  useEffect(()=> {
    let cancel=false;
    const fromCache = AREAS_CATALOG_CACHE.get();
    if (fromCache?.data) {
      const payload = fromCache.data;
      const modulos = Array.isArray(payload.modulos) ? payload.modulos : [];
      const mapped = modulos.map(m=> ({ id:m.id, titulo:m.nombre, descripcion:m.descripcion, ...styleForArea(m.id) }));
      setModulosEspecificos(mapped);
      const generales = Array.isArray(payload.generales) ? payload.generales : [];
      setAreasGenerales(generales.map(g => ({ id: g.id, nombre: g.nombre })));
      if (!fromCache.stale) return; // mostrar cache y revalidar silenciosamente si stale
    }
    const load = async (silent=false)=> {
      if(!silent) { setLoadingCatalog(true); setCatalogError(''); }
      try {
        const res = await getAreasCatalog();
        const payload = res.data?.data || res.data || {};
        AREAS_CATALOG_CACHE.set(payload);
        const modulos = Array.isArray(payload.modulos) ? payload.modulos : [];
        const mapped = modulos.map(m=> ({ id:m.id, titulo:m.nombre, descripcion:m.descripcion, ...styleForArea(m.id) }));
        const generales = Array.isArray(payload.generales) ? payload.generales : [];
        if(!cancel) {
          setModulosEspecificos(mapped);
          setAreasGenerales(generales.map(g => ({ id: g.id, nombre: g.nombre })));
        }
      } catch(e){ if(!cancel) setCatalogError('No se pudo cargar catálogo de módulos'); }
      finally { if(!cancel) setLoadingCatalog(false); }
    };
    load(fromCache?.data ? true : false);
    return ()=> { cancel=true; };
  },[]);
  // (mocks eliminados)

  // Si el usuario abrió "Generales" antes de que el catálogo cargue,
  // recargamos la lista automáticamente cuando areasGenerales esté disponible
  useEffect(() => {
    if (selectedTipo === 'generales' && currentLevel === 'simulaciones') {
      loadSimulaciones({ type: 'generales' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areasGenerales]);

  // Restaurar estado según query params (deep-link / returnTo)
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search || '');
      const level = params.get('level');
      const type = params.get('type');
      const moduloId = params.get('moduloId');
      const wantsHistorial = params.get('historial') === '1';
      const simIdParam = params.get('simId');

      // Nuevo: permitir anclar vista de módulos (selector) como en Actividades (level=buttons)
      if (level === 'modulos') {
        if (currentLevel !== 'modulos' || selectedTipo !== 'especificos') {
          setSelectedTipo('especificos');
          setSelectedModulo(null);
          setCurrentLevel('modulos');
          // Normalizar URL: limpiar ruido heredado (type/moduloId/historial/simId)
          try {
            const now = new URLSearchParams(location.search || '');
            const hasNoise = now.has('type') || now.has('moduloId') || now.has('historial') || now.has('simId');
            if (hasNoise) {
              now.set('level', 'modulos');
              now.delete('type');
              now.delete('moduloId');
              now.delete('historial');
              now.delete('simId');
              const qs = now.toString();
              navigate(`${location.pathname}${qs ? `?${qs}` : ''}`, { replace: true });
            }
          } catch {}
        }
        // En selector "modulos" somos autoritativos: no continuar forzando tabla
        setPendingOpenHistorialSimId(null);
        return;
      }

      if (type === 'generales') {
        if (currentLevel !== 'simulaciones' || selectedTipo !== 'generales') {
          setSelectedTipo('generales');
          setCurrentLevel('simulaciones');
          // Trigger load for generales
          loadSimulaciones({ type: 'generales' });
        }
      } else if (type === 'modulo' && moduloId) {
        const idNum = Number(moduloId);
        if (Number.isFinite(idNum)) {
          // Enforce acceso real: solo cargar si el módulo está permitido
          if (allowedSimulationAreas.includes(idNum)) {
            setSelectedTipo('especificos');
            setSelectedModulo(prev => (prev?.id === idNum ? prev : { id: idNum, titulo: '', descripcion: '' }));
            setCurrentLevel('simulaciones');
            loadSimulaciones({ type: 'modulo', moduloId: idNum });
          } else {
            // No permitido: regresar al selector de módulos y limpiar ruido de URL
            setSelectedTipo('especificos');
            setSelectedModulo(null);
            setCurrentLevel('modulos');
            try {
              const now = new URLSearchParams(location.search || '');
              now.set('level', 'modulos');
              now.delete('type');
              now.delete('moduloId');
              now.delete('historial');
              now.delete('simId');
              const qs = now.toString();
              navigate(`${location.pathname}${qs ? `?${qs}` : ''}`, { replace: true });
            } catch {}
            try { showNotification('Acceso restringido','Debes solicitar acceso y esperar aprobación del asesor para entrar a este módulo.','warning'); } catch {}
          }
        }
      } else if (level === 'simulaciones' && !type) {
        // fallback: al menos mostrar tabla generales
        setSelectedTipo('generales');
        setCurrentLevel('simulaciones');
        loadSimulaciones({ type: 'generales' });
      } else if (level === 'tipos') {
        // Permitir anclar portada de tipos
        setCurrentLevel('tipos');
        setSelectedTipo(null);
        setSelectedModulo(null);
      }

      if (wantsHistorial && simIdParam) {
        const sid = Number(simIdParam);
        if (Number.isFinite(sid)) setPendingOpenHistorialSimId(sid);
      } else {
        setPendingOpenHistorialSimId(null);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Cuando la lista de simulaciones está disponible y hay un historial pendiente por abrir, abrirlo
  useEffect(() => {
    if (!pendingOpenHistorialSimId) return;
    const sim = simulaciones.find(s => Number(s.id) === Number(pendingOpenHistorialSimId));
    if (sim) {
      setPendingOpenHistorialSimId(null);
      handleVerHistorial(sim);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingOpenHistorialSimId, simulaciones]);

  // Helper: construir URL de retorno preservando el nivel actual (tabla) y contexto
  const buildReturnTo = (extraParams = {}) => {
    try {
      const params = new URLSearchParams();
      // Siempre regresar al nivel de tabla
      params.set('level', 'simulaciones');
      const typeVal = selectedTipo === 'especificos' ? 'modulo' : 'generales';
      params.set('type', typeVal);
      if (typeVal === 'modulo' && selectedModulo?.id != null) {
        params.set('moduloId', String(selectedModulo.id));
      }
      Object.entries(extraParams).forEach(([k, v]) => {
        if (v != null) params.set(k, String(v));
      });
      const qs = params.toString();
      return `${location.pathname}${qs ? `?${qs}` : ''}`;
    } catch {
      return `${location.pathname}${location.search || ''}`;
    }
  };

  // Meses como ordinales
  const months = [
    'Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto', 'Sexto',
    'Séptimo', 'Octavo', 'Noveno'
  ];

  // Altura mínima uniforme para tarjetas (módulos específicos) alineada con Actividades
  const CARD_HEIGHT_PX = 230;

  // (Se eliminó bloque duplicado de helpers; definiciones únicas se mantienen más abajo tras loadSimulaciones)

  // Normalizar fecha límite a fin de día local cuando llega sin hora o a medianoche
  function normalizeDeadlineEndOfDay(input) {
    if (!input) return null;
    try {
      if (typeof input === 'string') {
        const s = input.trim();
        // Fecha-only YYYY-MM-DD o YYYY/MM/DD
        const dateOnly = /^\d{4}[-\/]\d{2}[-\/]\d{2}$/;
        if (dateOnly.test(s)) {
          const [y, m, d] = s.split(/[-\/]/).map(Number);
          return new Date(y, m - 1, d, 23, 59, 59, 999);
        }
        // Datetime con hora y posible zona
        const dtMatch = s.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})[ T]([0-9]{2}):([0-9]{2})(?::([0-9]{2})(?:\.([0-9]{1,3}))?)?(?:Z|[+\-][0-9]{2}:[0-9]{2})?$/);
        if (dtMatch) {
          const y = Number(dtMatch[1]);
          const m = Number(dtMatch[2]);
          const d = Number(dtMatch[3]);
          const hh = Number(dtMatch[4]);
          const mm = Number(dtMatch[5]);
          const ss = Number(dtMatch[6] || 0);
          // medianoche => tratar como fecha-only
          if (hh === 0 && mm === 0 && ss === 0) {
            return new Date(y, m - 1, d, 23, 59, 59, 999);
          }
          const n = new Date(s);
          if (!isNaN(n)) {
            // Si cae a medianoche local, normalizar a fin de día
            if (n.getHours() === 0 && n.getMinutes() === 0 && n.getSeconds() === 0 && n.getMilliseconds() === 0) {
              return new Date(n.getFullYear(), n.getMonth(), n.getDate(), 23, 59, 59, 999);
            }
            return n;
          }
          return new Date(y, m - 1, d, hh, mm, ss);
        }
        const parsed = new Date(s);
        if (!isNaN(parsed)) {
          if (parsed.getHours() === 0 && parsed.getMinutes() === 0 && parsed.getSeconds() === 0 && parsed.getMilliseconds() === 0) {
            return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 23, 59, 59, 999);
          }
          return parsed;
        }
      }
      const d = new Date(input);
      if (!isNaN(d)) {
        if (d.getHours() === 0 && d.getMinutes() === 0 && d.getSeconds() === 0 && d.getMilliseconds() === 0) {
          return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
        }
        return d;
      }
    } catch {}
    return null;
  }

  // Verificar fecha límite (normalizada a fin de día)
  const isWithinDeadline = (dueDate) => {
    const now = new Date();
    const due = normalizeDeadlineEndOfDay(dueDate);
    return due ? now <= due : true;
  };

  const handleVisualizarResultados = (simulacionOrId) => {
    const simulacionId = typeof simulacionOrId === 'object' ? simulacionOrId?.id : simulacionOrId;
    if (!simulacionId) return;
    const simData = typeof simulacionOrId === 'object'
      ? simulacionOrId
      : simulaciones.find(s => s.id === simulacionId) || null;
    const returnTo = buildReturnTo();
    navigate(`/alumno/simulaciones/tomar/${simulacionId}/resultados`, {
      state: { simulacion: simData, returnTo }
    });
  };

  // Verificar si la simulación está disponible para iniciar
  const computeSimEstado = (sim) => {
    const intents = Number(sim.totalIntentos || 0);
    if (intents > 0 || sim.completado) return 'completado';
    return isWithinDeadline(sim.fechaEntrega) ? 'disponible' : 'vencido';
  };

  const isSimulacionAvailable = (simulacion) => {
    const now = new Date();
    const fechaEntrega = normalizeDeadlineEndOfDay(simulacion.fechaEntrega);
    const withinDate = (!!fechaEntrega ? now <= fechaEntrega : true);
    const hasQuestions = Number(simulacion.totalPreguntas || 0) > 0;
    return withinDate && hasQuestions && computeSimEstado(simulacion) === 'disponible';
  };

  // Verificar si se puede reintentar (Función legacy - ahora permitimos reintentos ilimitados)
  const canRetry = (simulacion) => {
    return simulacion.completado;
  };

  // (Legacy historial in-memory removido; ahora historial se obtiene de backend y cache local en historialCache)

  // Reemplazo: eliminamos mocks y cargamos desde backend
  const loadSimulaciones = async (scope) => {
    if(!estudianteId) { setSimulaciones([]); return; }
    setLoadingSims(true); setSimError('');
    try {
      // Intento 1: visible=false para no ocultar por fecha en el backend
      const [resResumen, resCatalog] = await Promise.allSettled([
        resumenSimulacionesEstudiante(estudianteId),
        listSimulaciones({ visible: 'false' })
      ]);
  const resumenRows = resResumen.status === 'fulfilled' ? (resResumen.value?.data?.data || resResumen.value?.data || []) : [];
      let catalogRows = resCatalog.status === 'fulfilled' ? (resCatalog.value?.data?.data || resCatalog.value?.data || []) : [];
  // Nota: si se requiere, se puede leer status desde resResumen.reason?.response?.status o resCatalog.reason?.response?.status
      // Fallback 2: si viene vacío, intenta sin el flag visible
      if (!Array.isArray(catalogRows) || catalogRows.length === 0) {
        try {
          const res2 = await listSimulaciones();
          const rows2 = res2?.data?.data || res2?.data || [];
          if (Array.isArray(rows2) && rows2.length) catalogRows = rows2;
        } catch {}
      }
      const resumenById = resumenRows.reduce((acc,q)=>{ acc[q.id]=q; return acc; },{});
      const baseRows = catalogRows.length ? catalogRows : resumenRows;
      const generalIds = areasGenerales.map(a => Number(a.id)).filter(n => Number.isFinite(n));
      const generalIdSet = new Set(generalIds);
      const filtered = baseRows.filter(q => {
        if (scope.type === 'generales') {
          // Generales: incluir simulaciones sin id_area (verdaderamente generales)
          // o aquellas mapeadas a un área general del catálogo
          const raw = q.id_area;
          const areaNum = raw != null ? Number(raw) : null;
          const isGeneral = raw == null || Number(raw) === 0; // considerar 0 como general
          return isGeneral || generalIdSet.has(areaNum);
        } else if (scope.type === 'modulo' && scope.moduloId != null) {
          // Específicos por módulo
          return Number(q.id_area) === Number(scope.moduloId);
        }
        return false;
      });
  // Debug info removida: antes se guardaban métricas internas en simsDebug
      const mapped = filtered.map(q => {
        const r = resumenById[q.id] || q;
        const total_intentos = Number(r.total_intentos || 0);
        const ultimo_puntaje = r.ultimo_puntaje ?? null;
        const mejor_puntaje = r.mejor_puntaje ?? null;
        const fecha_limite = q.fecha_limite || q.fechaEntrega || null;
        const now = new Date();
        const due = normalizeDeadlineEndOfDay(fecha_limite);
        const within = due ? now <= due : true;
        const estadoSim = total_intentos > 0 ? 'completado' : (within ? 'disponible' : 'vencido');
        return {
          id: q.id,
          nombre: q.titulo,
            fechaEntrega: fecha_limite,
          completado: total_intentos > 0,
          score: ultimo_puntaje,
          bestScore: mejor_puntaje,
          estado: estadoSim,
          totalIntentos: total_intentos,
          totalPreguntas: Number(q.total_preguntas || 0)
        };
      });
      setSimulaciones(mapped);
    } catch(e){
      console.error(e); setSimError('Error cargando simulaciones');
    } finally { setLoadingSims(false); }
  };

  // Historial real: fetch solo al abrir modal
  const fetchHistorial = async (simulacion) => {
    if(!estudianteId) return;
    try {
  const resp = await listIntentosSimulacionEstudiante(simulacion.id, estudianteId);
      const rows = resp.data?.data || resp.data || [];
      setHistorialCache(prev=> ({...prev, [simulacion.id]: rows}));
    } catch(e){ console.warn('No se pudo cargar historial', e); }
  };

  const getSimulacionHistorial = (simulacionId) => {
    const intentos = historialCache[simulacionId] || [];
    return {
      intentos: intentos.map((it, idx)=> ({
        id: it.id,
        fecha: it.created_at,
        puntaje: it.puntaje,
        // Mostrar minutos usando múltiples fuentes posibles desde backend
        tiempoEmpleado: (() => {
          const sec = (() => {
            if (typeof it.tiempo_segundos === 'number' && it.tiempo_segundos > 0) return it.tiempo_segundos;
            if (typeof it.duration_sec === 'number' && it.duration_sec > 0) return it.duration_sec;
            if (typeof it.elapsed_ms === 'number' && it.elapsed_ms > 0) return Math.round(it.elapsed_ms / 1000);
            if (it.started_at && it.finished_at) {
              const s = new Date(it.started_at).getTime();
              const f = new Date(it.finished_at).getTime();
              if (Number.isFinite(s) && Number.isFinite(f) && f > s) return Math.round((f - s) / 1000);
            }
            return 0;
          })();
          return Math.max(0, Math.round(sec / 60));
        })()
      })),
      totalIntentos: intentos.length,
      mejorPuntaje: intentos.reduce((m,i)=> i.puntaje>m?i.puntaje:m,0),
      promedioTiempo: (() => {
        if (!intentos.length) return 0;
        const sumSec = intentos.reduce((s, it) => {
          if (typeof it.tiempo_segundos === 'number' && it.tiempo_segundos > 0) return s + it.tiempo_segundos;
          if (typeof it.duration_sec === 'number' && it.duration_sec > 0) return s + it.duration_sec;
          if (typeof it.elapsed_ms === 'number' && it.elapsed_ms > 0) return s + Math.round(it.elapsed_ms / 1000);
          if (it.started_at && it.finished_at) {
            const st = new Date(it.started_at).getTime();
            const ft = new Date(it.finished_at).getTime();
            if (Number.isFinite(st) && Number.isFinite(ft) && ft > st) return s + Math.round((ft - st) / 1000);
          }
          return s;
        }, 0);
        return Math.round((sumSec / intentos.length) / 60);
      })()
    };
  };

  // Helpers de presentación: intentos totales y mejor puntaje por simulación
  const getTotalAttempts = (simulacionId) => {
    const item = simulaciones.find(s => s.id === simulacionId);
    if (item && typeof item.totalIntentos === 'number') return item.totalIntentos;
    const intentos = historialCache[simulacionId] || [];
    return Array.isArray(intentos) ? intentos.length : 0;
  };

  const getBestScore = (simulacionId) => {
    const item = simulaciones.find(s => s.id === simulacionId);
    if (item && item.bestScore != null) return item.bestScore;
    const intentos = historialCache[simulacionId] || [];
    if (!Array.isArray(intentos) || intentos.length === 0) return 0;
    return intentos.reduce((m,i)=> (typeof i.puntaje === 'number' && i.puntaje > m) ? i.puntaje : m, 0);
  };

  // Efecto para calcular el puntaje total
  useEffect(() => {
    const calculatedTotal = simulaciones.reduce((sum, sim) => sum + (sim.score || 0), 0);
    setTotalScore(calculatedTotal);
  }, [simulaciones]);

  // Hook para detectar si es móvil
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  // Función para manejar la selección de tipo de simulador
  const handleSelectTipo = (tipo) => {
    setSelectedTipo(tipo);
    if (tipo === 'especificos') {
      setCurrentLevel('modulos');
      // Sincronizar URL: anclar selector de módulos
      try {
        const params = new URLSearchParams(location.search || '');
        params.set('level', 'modulos');
        params.delete('type');
        params.delete('moduloId');
        params.delete('historial');
        params.delete('simId');
        const qs = params.toString();
        navigate(`${location.pathname}${qs ? `?${qs}` : ''}`, { replace: true });
      } catch { /* ignore */ }
    } else {
      setCurrentLevel('simulaciones');
      loadSimulaciones({ type:'generales' });
      // Sincronizar URL: vista de tabla generales sin 'level' para evitar rebotes
      try {
        const params = new URLSearchParams(location.search || '');
        params.set('type', 'generales');
        params.delete('level');
        params.delete('moduloId');
        params.delete('historial');
        params.delete('simId');
        const qs = params.toString();
        navigate(`${location.pathname}${qs ? `?${qs}` : ''}`, { replace: true });
      } catch { /* ignore */ }
    }
  };

  // Función para manejar la selección de módulo específico
  const handleSelectModulo = (modulo) => {
    if (allowedSimulationAreas.includes(modulo.id)) {
      setSelectedModulo(modulo);
      setCurrentLevel('simulaciones');
      loadSimulaciones({ type:'modulo', moduloId:modulo.id });
      // Sincronizar URL: vista de tabla del módulo (sin 'level')
      try {
        const params = new URLSearchParams(location.search || '');
        params.set('type', 'modulo');
        params.set('moduloId', String(modulo.id));
        params.delete('level');
        params.delete('historial');
        params.delete('simId');
        const qs = params.toString();
        navigate(`${location.pathname}${qs ? `?${qs}` : ''}`, { replace: true });
      } catch { /* ignore */ }
    } else {
      console.log('Área no permitida. Debes solicitar acceso.');
    }
  };

  // Función para manejar la solicitud de acceso a un nuevo módulo
  const handleRequestAccess = (moduloId) => {
    // Evitar duplicar SOLO si hay una solicitud pendiente activa
    const hasPending = simulationRequests.some(req => req.areaId === moduloId && String(req.status || '').toLowerCase() === 'pending');
    if (hasPending) {
      showNotification(
        'Solicitud pendiente',
        'Ya existe una solicitud en revisión para esta área.',
        'warning'
      );
      return;
    }
    requestNewSimulationAreaAccess(moduloId);
    showNotification(
      'Solicitud enviada',
      'Tu solicitud de acceso ha sido enviada. Recibirás una notificación cuando sea aprobada.',
      'success'
    );
  };

  // Función para manejar la primera selección de área del estudiante (NO otorga acceso inmediato)
  const handleInitialAreaSelection = (moduloId) => {
    // En el primer uso también se debe solicitar acceso, no concederlo automáticamente
    const hasPending = simulationRequests.some(req => req.areaId === moduloId && String(req.status || '').toLowerCase() === 'pending');
    if (hasPending) {
      showNotification('Solicitud pendiente', 'Ya existe una solicitud en revisión para esta área.', 'warning');
      return;
    }
    requestNewSimulationAreaAccess(moduloId);
    showNotification(
      'Solicitud enviada',
      'Tu solicitud de acceso inicial ha sido enviada. Recibirás una notificación cuando sea aprobada.',
      'success'
    );
  };

  // Función para regresar al nivel anterior
  const handleGoBack = () => {
    if (currentLevel === 'simulaciones') {
      if (selectedTipo === 'especificos') {
        setCurrentLevel('modulos');
        setSimulaciones([]);
        // URL: anclar selector de módulos
        try {
          const params = new URLSearchParams(location.search || '');
          params.set('level', 'modulos');
          params.delete('type');
          params.delete('moduloId');
          params.delete('historial');
          params.delete('simId');
          const qs = params.toString();
          navigate(`${location.pathname}${qs ? `?${qs}` : ''}`, { replace: true });
        } catch { /* ignore */ }
      } else {
        setCurrentLevel('tipos');
        setSelectedTipo(null);
        setSimulaciones([]);
        // URL: volver a portada (limpiar query)
        try { navigate('/alumno/simulaciones', { replace: true }); } catch {}
      }
    } else if (currentLevel === 'modulos') {
      setCurrentLevel('tipos');
      setSelectedTipo(null);
      setSelectedModulo(null);
      // URL: volver a portada (limpiar query)
      try { navigate('/alumno/simulaciones', { replace: true }); } catch {}
    }
  };

  // Filtrado por mes (memoizado)
  const filteredSimulaciones = React.useMemo(() => {
    return simulaciones.filter(simulacion => {
      if (selectedMonth === 'all') return true;
      const d = normalizeDeadlineEndOfDay(simulacion.fechaEntrega);
      if (!d) return false;
      const simMonth = d.getMonth();
      return simMonth === parseInt(selectedMonth);
    });
  }, [simulaciones, selectedMonth]);

  const getSelectedMonthName = () => {
    if (selectedMonth === 'all') return 'Todos los meses';
    return months[parseInt(selectedMonth)];
  };

  const handleMonthSelect = (monthValue) => {
    setSelectedMonth(monthValue);
    setIsDropdownOpen(false);
  };
  // (Legacy mock attempt handlers removidos)

  const closeHistorialModal = () => {
    setShowHistorialModal(false);
    setSelectedSimulacionHistorial(null);
  };

  // Abrir modal de historial y cargar intentos desde backend
  const handleVerHistorial = async (simulacion) => {
    if (!simulacion) return;
    setSelectedSimulacionHistorial(simulacion);
    setShowHistorialModal(true);
    try {
      await fetchHistorial(simulacion);
    } catch {}
  };

  // Funciones para manejar modal de gráficas
  const handleVerGraficas = async (simulacion) => {
    if (!simulacion) return;
    setSelectedSimulacionGraficas(simulacion);
    // Cargar historial antes de abrir el modal para evitar estado "sin datos"
    try { await fetchHistorial(simulacion); } catch {}
    setShowGraficasModal(true);
  };

  const closeGraficasModal = () => {
    setShowGraficasModal(false);
    setSelectedSimulacionGraficas(null);
  };

  // Función para mostrar notificaciones modales
  const showNotification = (title, message, type = 'success') => {
    setNotificationContent({ title, message, type });
    setShowNotificationModal(true);
  };

  const closeNotificationModal = () => {
    setShowNotificationModal(false);
    setNotificationContent({ title: '', message: '', type: 'success' });
  };

  // Registrar respuesta local (solo una opción por pregunta por ahora)
  const handleSelectOpcion = (id_pregunta, id_opcion) => {
    setRespuestasSesion(prev => ({
      ...prev,
      [id_pregunta]: { id_opcion, tiempo_ms: 0 }
    }));
  };

  // Enviar respuestas al backend (batch) y finalizar
  const handleFinalizarSesion = async () => {
    if(!activeSesion) return;
    setSesionLoading(true); setSesionError('');
    try {
      // Preparar batch
      const batch = Object.entries(respuestasSesion).map(([id_pregunta, r])=> ({ id_pregunta: Number(id_pregunta), id_opcion: r.id_opcion, tiempo_ms: r.tiempo_ms||0 }));
      if(batch.length){
        await enviarRespuestasSesionSimulacion(activeSesion.id, batch);
      }
      const fin = await finalizarSesionSimulacion(activeSesion.id);
      const resultado = fin.data?.data || {};
      showNotification('Simulación finalizada', `Puntaje: ${resultado.puntaje ?? 'N/A'}`, 'success');
      setShowSesionModal(false);
      setActiveSesion(null);
      await loadSimulaciones(selectedTipo==='generales' ? {type:'generales'} : {type:'modulo', moduloId:selectedModulo?.id});
    } catch(e){
      console.error(e); setSesionError('Error al finalizar'); showNotification('Error','No se pudo finalizar la sesión','error');
    } finally { setSesionLoading(false); }
  };

  const handleCancelarSesion = () => {
    setShowSesionModal(false);
    setActiveSesion(null);
    setPreguntasSesion([]);
    setRespuestasSesion({});
  };

  // Limpieza: se removieron simulacionesGenerales/especificas y lógica mock.
  // Estados para sesión activa (toma de simulación real)
  const [activeSesion, setActiveSesion] = useState(null); // { id, simulacionId }
  const [preguntasSesion, setPreguntasSesion] = useState([]); // preguntas cargadas
  const [respuestasSesion, setRespuestasSesion] = useState({}); // id_pregunta -> { id_opcion, tiempo_ms }
  const [sesionLoading, setSesionLoading] = useState(false);
  const [sesionError, setSesionError] = useState('');
  const [showSesionModal, setShowSesionModal] = useState(false);

  // Handler para iniciar sesión real (crea sesión y carga preguntas)
  const handleIniciarSimulacion = async (simulacionId) => {
    const sim = simulaciones.find(s=>s.id===simulacionId);
    if(!sim || !estudianteId) return;
    setSesionLoading(true); setSesionError('');
    try {
  const pregResp = await listPreguntasSimulacion(sim.id);
      const preguntas = pregResp.data?.data || [];
  const sesionResp = await crearSesionSimulacion(sim.id, { id_estudiante: estudianteId });
      const sesionId = sesionResp.data?.data?.id;
      setActiveSesion({ id: sesionId, simulacionId: sim.id, nombre: sim.nombre });
      setPreguntasSesion(preguntas.sort((a,b)=> (a.orden||0)-(b.orden||0)));
      setRespuestasSesion({});
      setShowSesionModal(true);
    } catch(e){
      console.error(e); setSesionError('No se pudo iniciar la simulación');
      showNotification('Error','No se pudo iniciar la simulación','error');
    } finally { setSesionLoading(false); }
  };

  const handleReintentar = (simulacionId) => handleIniciarSimulacion(simulacionId);

  // Abrir runner y monitorear cierre para mostrar notificación y refrescar
  const openSimRunner = (simulacionId) => {
    const url = `/alumno/simulaciones/tomar/${simulacionId}`;
    try {
      // Pre-abrir pestaña en blanco para evitar bloqueos y redirecciones tempranas
      const w = window.open('', '_blank');
      if (!w) {
        navigate(url, { replace:true });
      } else {
        try {
          w.document.write('<!doctype html><title>MQERK Academy</title><meta charset="utf-8"/><p style="font-family:system-ui,Segoe UI,Arial;margin:2rem;color:#4b5563;">Cargando simulación…</p>');
          w.document.close();
        } catch {}
        w.location.href = url;
        simWindowRef.current = w;
        if (simMonitorRef.current) clearInterval(simMonitorRef.current);
        simMonitorRef.current = setInterval(async () => {
          if (simWindowRef.current && simWindowRef.current.closed) {
            clearInterval(simMonitorRef.current);
            simMonitorRef.current = null;
            simWindowRef.current = null;
            setLaunchingSimId(null);
            try {
              await loadSimulaciones(selectedTipo==='generales' ? {type:'generales'} : {type:'modulo', moduloId:selectedModulo?.id});
            } catch {}
            showNotification('Simulación finalizada', 'Tu intento ha concluido correctamente.', 'success');
          }
        }, 1200);
      }
    } catch {
      navigate(url, { replace:true });
    }
  };

  const handleOpenLaunchModal = (simulacion) => {
    if (launchingSimId) return;
    setLaunchModal({ open:true, simulacion, seconds:4 });
  };
  const cancelLaunch = () => setLaunchModal({ open:false, simulacion:null, seconds:4 });
  const doLaunchNow = () => {
    if(!launchModal.simulacion) return;
    const id = launchModal.simulacion.id;
    setLaunchingSimId(id);
    setLaunchModal({ open:false, simulacion:null, seconds:4 });
    openSimRunner(id);
  };
  useEffect(()=> {
    if(!launchModal.open) return;
    if(launchModal.seconds <= 0) { doLaunchNow(); return; }
    const t = setTimeout(()=> setLaunchModal(prev=> ({...prev, seconds: prev.seconds - 1 })), 1000);
    return ()=> clearTimeout(t);
  }, [launchModal.open, launchModal.seconds]);
  useEffect(()=> () => { if(simMonitorRef.current) clearInterval(simMonitorRef.current); }, []);

  // Función para obtener el color de la dificultad
  const getDifficultyColor = (dificultad) => {
    switch (dificultad) {
      case 'Bajo':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Medio':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Alto':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // NIVEL 1: Tipos de simuladores
  const renderTipos = () => (
  <div className="min-h-screen bg-white px-0 sm:px-2 md:px-3 lg:px-4 xl:px-6 2xl:px-8 py-4 lg:py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-8">
          <div className="px-6 py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl xs:text-4xl sm:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  SIMULACIONES
                </h1>
                <p className="text-gray-600">
                  Simuladores para exámenes de ingreso y evaluaciones académicas
                </p>
              </div>
              <div className="mt-4 lg:mt-0 flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                <span>Actualizado hoy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Título estilizado */}
        <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 rounded-xl border border-purple-200 shadow-md p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100/30 to-blue-100/30 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-100/30 to-purple-100/30 rounded-full blur-xl"></div>
          
          <div className="flex items-center justify-center relative z-10">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-5 lg:mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Trophy className="w-2 h-2 text-white" />
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-indigo-700 to-blue-700 bg-clip-text text-transparent">
                  SIMULADORES
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-12 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full"></div>
                  <div className="w-12 h-0.5 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjetas de tipos de simulador (2 columnas en móviles, misma altura y CTA alineado) */}
  <div className="grid grid-cols-2 auto-rows-fr gap-3 md:gap-4 lg:gap-6 max-w-3xl mx-auto">
          {/* Simulador por áreas generales */}
          <div
            onClick={() => handleSelectTipo('generales')}
            className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group h-full"
          >
            <div className="p-4 sm:p-5 lg:p-6 text-center min-h-[180px] h-full flex flex-col items-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-5 lg:mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Target className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-white" />
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-1 sm:mb-2">Simulador por</h3>
              <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-purple-700 mb-2 sm:mb-3">áreas generales</h4>
              <p className="text-gray-700 leading-snug text-xs sm:text-sm mb-3 sm:mb-4">
                EXANI II, PAA y evaluaciones generales para ingreso universitario
              </p>
              <div className="mt-auto pt-2 sm:pt-3 inline-flex items-center text-purple-600 font-medium text-xs sm:text-sm">
                <span>ACCEDER</span>
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 sm:ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Simulador por módulos específicos */}
          <div
            onClick={() => handleSelectTipo('especificos')}
            className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group h-full"
          >
            <div className="p-4 sm:p-5 lg:p-6 text-center min-h-[180px] h-full flex flex-col items-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-5 lg:mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Brain className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-white" />
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-1 sm:mb-2">Simulador por</h3>
              <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-indigo-700 mb-2 sm:mb-3">módulos específicos</h4>
              <p className="text-gray-700 leading-snug text-xs sm:text-sm mb-3 sm:mb-4">
                Simulaciones especializadas por área de conocimiento y carrera
              </p>
              <div className="mt-auto pt-2 sm:pt-3 inline-flex items-center text-indigo-600 font-medium text-xs sm:text-sm">
                <span>ACCEDER</span>
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 sm:ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSesionModal = () => {
    if(!showSesionModal || !activeSesion) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl flex flex-col max-h-[90vh]">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h3 className="text-lg font-semibold">Simulación: {activeSesion.nombre}</h3>
            <button onClick={handleCancelarSesion} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {sesionError && <div className="text-red-600 text-sm">{sesionError}</div>}
            {preguntasSesion.length === 0 && !sesionLoading && (
              <div className="text-sm text-gray-500">No hay preguntas configuradas.</div>
            )}
            {preguntasSesion.map((p, idx)=>(
              <div key={p.id} className="border rounded-lg p-4">
                <div className="font-medium mb-2">{idx+1}. {p.enunciado}</div>
                <div className="space-y-2 flex flex-col items-center">
                  {p.opciones && p.opciones.map(op => {
                    const selected = respuestasSesion[p.id]?.id_opcion === op.id;
                    return (
                      <button
                        key={op.id}
                        type="button"
                        onClick={()=>handleSelectOpcion(p.id, op.id)}
                        className={`w-full text-left px-3 py-2 rounded border transition-colors ${selected ? 'bg-indigo-600 text-white border-indigo-600' : 'hover:bg-indigo-50 border-gray-200'}`}
                      >
                        {op.texto}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-500">Preguntas respondidas: {Object.keys(respuestasSesion).length}/{preguntasSesion.length}</div>
            <div className="flex gap-3">
              <button onClick={handleCancelarSesion} className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button disabled={sesionLoading} onClick={handleFinalizarSesion} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">{sesionLoading ? 'Guardando...' : 'Finalizar'}</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // NIVEL 2: Módulos específicos (CON LÓGICA DE ACCESO Y ESTILO RESTAURADO)
  const renderModulos = () => {
    const hasInitialArea = allowedSimulationAreas.length > 0;

    return (
  <div className="min-h-screen bg-white px-0 sm:px-2 md:px-3 lg:px-4 xl:px-6 2xl:px-8 py-4 lg:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header con navegación */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-8">
            <div className="px-6 py-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleGoBack}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                      {hasInitialArea ? 'Módulos Específicos' : 'Elige tu Área de Interés'}
                    </h1>
                    <p className="text-gray-600">
                      {hasInitialArea 
                        ? 'Accede a tus áreas permitidas o solicita acceso a nuevas.'
                        : 'Selecciona tu primera área de conocimiento para empezar.'}
                    </p>
                  </div>
                </div>
                <div className="mt-4 lg:mt-0 flex items-center text-sm text-gray-500">
                  <Brain className="w-4 h-4 mr-1" />
                  <span>{modulosEspecificos.length} módulos disponibles</span>
                </div>
              </div>
            </div>
          </div>

      {/* Grid de módulos específicos - responsive uniforme (igual que actividades):
        - 2 columnas en móviles
        - 3 en tablets
        - 4 en desktop
        - auto-rows-fr para alturas uniformes con minHeight
      */}
          {(loadError || catalogError) && (
            <div className="mb-4 p-4 rounded-xl border border-red-200 bg-red-50 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 text-sm text-red-700">{loadError || catalogError}</div>
              <div className="flex gap-2">
                <button onClick={manualRetrySims} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 active:scale-95">Reintentar</button>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr gap-3 md:gap-4 lg:gap-5">
            {(loadingCatalog && modulosEspecificos.length===0) && (
              <div className="col-span-full py-6 text-center text-sm text-gray-500">Cargando módulos...</div>
            )}
            {modulosEspecificos.map((modulo) => {
              const isAllowed = allowedSimulationAreas.includes(modulo.id);
              const request = simulationRequests.find(req => req.areaId === modulo.id);
              const isPending = request && request.status === 'pending';

              let actionHandler = () => {};
              let footerContent;
        let cardClassName = `${modulo.bgColor} ${modulo.borderColor} border rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 group px-4 py-5 sm:px-6 sm:py-6 flex flex-col select-none`;
              let isClickable = false;

              if (hasInitialArea) {
                if (isAllowed) {
                  isClickable = true;
                  actionHandler = () => handleSelectModulo(modulo);
                  cardClassName += " cursor-pointer";
                  footerContent = (
                    <div className="inline-flex items-center text-gray-600 font-medium text-sm">
                      <span>Ver simulaciones</span>
                      <ArrowLeft className="w-4 h-4 ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />
                    </div>
                  );
                } else if (isPending) {
                  cardClassName += " opacity-70"; 
                  footerContent = (
                    <div className="inline-flex items-center text-yellow-800 font-medium text-sm bg-yellow-200/80 px-3 py-1 rounded-full">
                      <Hourglass className="w-4 h-4 mr-2" />
                      <span>Pendiente</span>
                    </div>
                  );
                } else {
                  isClickable = true;
                  actionHandler = () => handleRequestAccess(modulo.id);
                  cardClassName += " cursor-pointer";
                  footerContent = (
                    <div className="inline-flex items-center text-blue-600 font-medium text-sm">
                      <Send className="w-4 h-4 mr-2" />
                      <span>Solicitar Acceso</span>
                    </div>
                  );
                }
              } else {
                // Estado inicial: Elige tu primera área (enviar solicitud, no otorgar acceso)
                if (isPending) {
                  // Si ya hay una solicitud pendiente previa para esta área, mostrar estado y deshabilitar
                  isClickable = false;
                  footerContent = (
                    <div className="inline-flex items-center text-yellow-800 font-medium text-sm bg-yellow-200/80 px-3 py-1 rounded-full">
                      <Hourglass className="w-4 h-4 mr-2" />
                      <span>Pendiente</span>
                    </div>
                  );
                } else {
                  isClickable = true;
                  actionHandler = () => handleInitialAreaSelection(modulo.id);
                  cardClassName += " cursor-pointer ring-4 ring-transparent hover:ring-indigo-400";
                  footerContent = (
                    <div className="inline-flex items-center text-indigo-600 font-medium text-sm">
                      <Send className="w-4 h-4 mr-2" />
                      <span>Solicitar acceso</span>
                    </div>
                  );
                }
              }

              return (
                <div key={modulo.id} className="[tap-highlight-color:transparent]">
                  <UnifiedCard
                    title={modulo.titulo}
                    description={modulo.descripcion}
                    icon={modulo.icono}
                    containerClasses={`${modulo.bgColor} ${modulo.borderColor} bg-gradient-to-br`}
                    iconWrapperClass={`bg-gradient-to-br ${modulo.color}`}
                    minHeight={CARD_HEIGHT_PX}
                    onClick={isClickable ? actionHandler : undefined}
                    interactive={isClickable}
                    pending={isPending}
                    footer={<div className="text-xs sm:text-sm">{footerContent}</div>}
                  />
                </div>
              );
            })}
            {!loadingCatalog && !catalogError && modulosEspecificos.length===0 && (
              <div className="col-span-full text-center text-xs sm:text-sm text-gray-500 py-6">No hay módulos específicos disponibles.</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // NIVEL 3: Tabla de simulaciones
  const renderSimulaciones = () => (
  <div className="min-h-screen bg-white px-0 sm:px-2 md:px-3 lg:px-4 xl:px-6 2xl:px-8 py-4 lg:py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header con navegación */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-8">
          <div className="px-6 py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleGoBack}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    {selectedTipo === 'generales' ? 'Simulaciones Generales' : 
                     selectedModulo ? `Simulaciones - ${selectedModulo.titulo}` : 'Simulaciones'}
                  </h1>
                  <p className="text-gray-600">
                    {selectedTipo === 'generales' ? 'Exámenes generales de ingreso universitario' :
                     selectedModulo ? selectedModulo.descripcion : 'Simulaciones especializadas'}
                  </p>
                </div>
              </div>
              <div className="mt-4 lg:mt-0 flex items-center text-sm text-gray-500">
                <Target className="w-4 h-4 mr-1" />
                <span>{filteredSimulaciones.length} simulaciones disponibles</span>
              </div>
            </div>
          </div>
        </div>

        {/* Título estilizado */}
        <div className="bg-gradient-to-r from-cyan-50 via-blue-50 to-indigo-50 rounded-xl border border-cyan-200 shadow-md p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-100/30 to-indigo-100/30 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-100/30 to-cyan-100/30 rounded-full blur-xl"></div>
          
          <div className="flex items-center justify-center relative z-10">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Play className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-2 h-2 text-white" />
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
                  SIMULACIONES DISPONIBLES
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-12 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"></div>
                  <div className="w-12 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="text-lg font-semibold text-gray-800">
              Filtrar simulaciones
            </div>
            
            {/* Acciones */}
            {/* Debug removido */}
            <div className="flex items-center gap-2 order-3 md:order-2" />
            
            {/* Selector de mes */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between w-64 px-4 py-2 text-left bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span>{getSelectedMonthName()}</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                  <div className="py-1">
                    <button
                      onClick={() => handleMonthSelect('all')}
                      className={`block w-full px-4 py-2 text-left hover:bg-gray-100 ${selectedMonth === 'all' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                    >
                      Todos los meses
                    </button>
                    {months.map((month, index) => (
                      <button
                        key={index}
                        onClick={() => handleMonthSelect(index.toString())}
                        className={`block w-full px-4 py-2 text-left hover:bg-gray-100 ${selectedMonth === index.toString() ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Vista de escritorio - Tabla de simulaciones */}
        <div className="hidden lg:block bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-cyan-500 to-indigo-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Simulación
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                    Fecha límite
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                    Ejecutar
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                    Entregado
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                    Volver a intentar
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                    Historial
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                    Gráficas
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                    Puntaje
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSimulaciones.length > 0 ? (
                  filteredSimulaciones.map((simulacion, index) => (
                    <tr key={simulacion.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {simulacion.nombre}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {(() => {
                              const d = normalizeDeadlineEndOfDay(simulacion.fechaEntrega);
                              return d ? d.toLocaleDateString('es-ES') : 'Sin límite';
                            })()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isSimulacionAvailable(simulacion) ? (
                          <button
                            onClick={() => handleOpenLaunchModal(simulacion)}
                            disabled={launchingSimId === simulacion.id}
                            className={`relative px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg text-sm font-bold uppercase tracking-wider shadow-lg transition-all duration-200 border-b-4 border-red-700 hover:border-red-800 ${launchingSimId===simulacion.id ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-xl transform hover:scale-105 active:scale-95 active:border-b-2'}`}
                          >
                            <span className="relative z-10 flex items-center justify-center">
                              <span className="mr-2">🚀</span>
                              {launchingSimId===simulacion.id ? 'LANZANDO…' : 'START'}
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-t from-red-700/20 to-transparent rounded-lg"></div>
                          </button>
                        ) : (
                          <button
                            disabled
                            className="px-4 py-2 bg-gray-300 cursor-not-allowed text-gray-500 rounded-lg text-sm font-medium"
                          >
                            {computeSimEstado(simulacion) === 'vencido' ? 'VENCIDO' : (Number(simulacion.totalPreguntas||0) === 0 ? 'SIN PREGUNTAS' : 'NO DISPONIBLE')}
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {simulacion.completado ? (
                          <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto" />
                        ) : (
                          <AlertTriangle className="w-6 h-6 text-red-500 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {simulacion.completado ? (
                          <button
                            onClick={() => handleOpenLaunchModal(simulacion)}
                            disabled={launchingSimId === simulacion.id}
                            className={`relative px-5 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg text-sm font-bold uppercase tracking-wider shadow-lg transition-all duration-200 border-b-3 border-red-600 hover:border-red-700 ${launchingSimId===simulacion.id ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-xl transform hover:scale-105 active:scale-95 active:border-b-1'}`}
                          >
                            <span className="relative z-10 flex items-center justify-center">
                              <span className="mr-1">🔄</span>
                              {launchingSimId===simulacion.id ? 'LANZANDO…' : 'REINTENTAR'}
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 to-transparent rounded-lg"></div>
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {simulacion.completado && getTotalAttempts(simulacion.id) > 0 ? (
                          <button
                            onClick={() => handleVerHistorial(simulacion)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-100/80 hover:bg-blue-200 rounded-full transition-colors"
                            title="Historial"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Historial</span>
                            <span className="ml-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-white text-blue-700 text-[10px] font-bold">{getTotalAttempts(simulacion.id)}</span>
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {simulacion.completado && getTotalAttempts(simulacion.id) > 0 ? (
                          <button
                            onClick={() => handleVerGraficas(simulacion)}
                            className="inline-flex items-center px-3 py-1 text-xs font-medium text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded-full transition-colors"
                            title="Ver análisis gráfico"
                          >
                            <LineChart className="w-3 h-3 mr-1" />
                            Análisis
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-sm text-gray-900 font-medium">
                          {simulacion.completado ? (
                            <div className="space-y-1">
                              <div className="font-bold text-green-600">
                                {getBestScore(simulacion.id)} %
                              </div>
                              {getTotalAttempts(simulacion.id) > 1 && (
                                <div className="text-xs text-gray-500">
                                  Mejor de {getTotalAttempts(simulacion.id)} intentos
                                </div>
                              )}
                            </div>
                          ) : (
                            '0 %'
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="px-6 py-8 text-center text-gray-500">
                      No hay simulaciones para el mes seleccionado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vista móvil - Cards de simulaciones */}
        <div className="lg:hidden space-y-4">
          {filteredSimulaciones.length > 0 ? (
            filteredSimulaciones.map((simulacion, index) => (
              <div
                key={simulacion.id}
                className="bg-white rounded-lg border border-gray-200 shadow-sm p-6"
              >
                {/* Badge de estado */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-extrabold text-gray-900 text-[1.15rem] leading-snug tracking-tight mb-1">{simulacion.nombre}</h3>
                    <div className="w-14 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full mb-2"></div>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>
                        Límite: {(() => {
                          const d = normalizeDeadlineEndOfDay(simulacion.fechaEntrega);
                          return d ? d.toLocaleDateString('es-ES') : 'Sin límite';
                        })()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                      <span className="text-sm font-medium text-gray-900">
                        {simulacion.completado ? (
                          <div className="flex flex-col">
                            <span className="font-bold text-green-600">
                              {getBestScore(simulacion.id)} %
                            </span>
                            {getTotalAttempts(simulacion.id) > 1 && (
                              <span className="text-xs text-gray-500">
                                Mejor de {getTotalAttempts(simulacion.id)} intentos
                              </span>
                            )}
                          </div>
                        ) : (
                          '0 %'
                        )}
                      </span>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    simulacion.completado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                  }`}>
                    {simulacion.completado ? 'Completado' : 'Pendiente'}
                  </span>
                </div>
                
                {/* Acciones */}
                <div className="mt-4">
                  {isSimulacionAvailable(simulacion) && !simulacion.completado && (
                    <button
                      onClick={() => handleOpenLaunchModal(simulacion)}
                      disabled={launchingSimId === simulacion.id}
                      className={`w-full rounded-lg py-3 px-4 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-md transition flex items-center justify-center gap-2 ${launchingSimId===simulacion.id ? 'opacity-60 cursor-not-allowed' : 'active:scale-[.97]'}`}
                    >
                      <span className="text-base">🚀</span>
                      {launchingSimId===simulacion.id ? 'Lanzando...' : 'Ejecutar'}
                    </button>
                  )}
                  {simulacion.completado && (
                    <>
                      <button
                        onClick={() => handleOpenLaunchModal(simulacion)}
                        disabled={launchingSimId === simulacion.id}
                        className={`w-full rounded-lg py-3 px-4 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-md transition flex items-center justify-center gap-2 ${launchingSimId===simulacion.id ? 'opacity-60 cursor-not-allowed' : 'active:scale-[.97]'}`}
                      >
                        <span className="text-base">🔄</span>
                        {launchingSimId===simulacion.id ? 'Lanzando...' : 'Reintentar'}
                      </button>
                      {getTotalAttempts(simulacion.id) > 0 && (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <button
                            onClick={() => handleVerHistorial(simulacion)}
                            className="flex items-center justify-center gap-1 rounded-lg py-2.5 px-2 text-[11px] font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Historial
                          </button>
                          <button
                            onClick={() => handleVerGraficas(simulacion)}
                            className="flex items-center justify-center gap-1 rounded-lg py-2.5 px-2 text-[11px] font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition"
                          >
                            <LineChart className="w-3.5 h-3.5" />
                            Gráfico
                          </button>
                        </div>
                      )}
                    </>
                  )}
                  {!isSimulacionAvailable(simulacion) && !simulacion.completado && (
                    <div className="mt-2 w-full px-4 py-3 bg-gray-100 text-gray-600 rounded-lg text-center text-sm font-medium">
                      {computeSimEstado(simulacion) === 'vencido' ? 'Simulación Vencida' : (Number(simulacion.totalPreguntas||0) === 0 ? 'Sin preguntas configuradas' : 'No Disponible')}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay simulaciones disponibles
              </h3>
              <p className="text-gray-600">
                {selectedMonth !== 'all' 
                  ? `No se encontraron simulaciones para ${getSelectedMonthName()}.`
                  : 'No hay simulaciones disponibles en este momento.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Modal para mostrar el historial de intentos - Compacto
  const renderHistorialModal = () => {
    if (!showHistorialModal || !selectedSimulacionHistorial) return null;

    const historial = getSimulacionHistorial(selectedSimulacionHistorial.id);

    return (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-3 md:p-4">
        <div
          className="bg-white rounded-lg shadow-xl w-full max-w-[92vw] md:max-w-[30rem] lg:max-w-[32rem] xl:max-w-[36rem] h-[72vh] sm:h-[68vh] md:h-[62vh] lg:h-[58vh] max-h-[720px] overflow-hidden flex flex-col transform translate-y-6 sm:translate-y-8 md:translate-x-8 lg:translate-x-0"
          role="dialog"
          aria-modal="true"
          aria-labelledby="historial-title"
        >
          {/* Header del modal */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <h2 id="historial-title" className="text-lg font-bold truncate">Historial de Intentos</h2>
                <p className="text-indigo-100 mt-0.5 text-sm truncate">{selectedSimulacionHistorial.nombre}</p>
              </div>
              <button
                onClick={closeHistorialModal}
                className="text-white hover:text-gray-200 transition-colors ml-3 flex-shrink-0 p-1.5 hover:bg-white/10 rounded-md"
                aria-label="Cerrar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Contenido del modal - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Resumen estadístico */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="text-blue-600 text-xs font-medium">Total de Intentos</div>
                <div className="text-xl font-bold text-blue-800">{historial.totalIntentos}</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="text-green-600 text-xs font-medium">Mejor Puntaje</div>
                <div className="text-xl font-bold text-green-800">{historial.mejorPuntaje}%</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                <div className="text-purple-600 text-xs font-medium">Promedio de Tiempo</div>
                <div className="text-xl font-bold text-purple-800">
                  {Math.round(historial.promedioTiempo || 0)} min
                </div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                <div className="text-orange-600 text-xs font-medium">Último Intento</div>
                <div className="text-xs font-bold text-orange-800">
                  {historial.intentos.length > 0 
                    ? new Date(historial.intentos[historial.intentos.length - 1].fecha).toLocaleDateString('es-ES')
                    : 'N/A'
                  }
                </div>
              </div>
            </div>

            {/* Lista de intentos */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-gray-900 mb-3">
                Historial Detallado ({historial.intentos.length} intentos)
              </h3>
              
              {historial.intentos.length > 0 ? (
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
                  <div className="space-y-2.5">
                    {[...historial.intentos].reverse().map((intento, index) => (
                      <div
                        key={intento.id}
                        className="bg-white p-3 rounded-md border border-gray-200 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <div className="w-7 h-7 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-semibold text-[11px] flex-shrink-0">
                            {historial.intentos.length - index}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 text-sm">
                              Intento {historial.intentos.length - index}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {new Date(intento.fecha).toLocaleDateString('es-ES')} a las{' '}
                              {new Date(intento.fecha).toLocaleTimeString('es-ES', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <div className="text-right">
                            <div className={`font-bold text-base ${
                              intento.puntaje === historial.mejorPuntaje 
                                ? 'text-green-600' 
                                : 'text-gray-700'
                            }`}>
                              {intento.puntaje}%
                              {intento.puntaje === historial.mejorPuntaje && (
                                <span className="ml-1 text-yellow-500">👑</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {intento.tiempoEmpleado} min
                            </div>
                          </div>
                          <div className={`w-1.5 h-7 rounded-full ${
                            intento.puntaje >= 90 ? 'bg-green-500' :
                            intento.puntaje >= 70 ? 'bg-yellow-500' :
                            intento.puntaje >= 50 ? 'bg-orange-500' : 'bg-red-500'
                          }`}></div>
                          <button
                            onClick={() => {
                              // número de intento mostrado es historial.intentos.length - index
                              const intentoNumero = historial.intentos.length - index;
                              const returnTo = buildReturnTo({ historial: '1', simId: selectedSimulacionHistorial.id });
                              navigate(`/alumno/simulaciones/tomar/${selectedSimulacionHistorial.id}/resultados?intento=${intentoNumero}`, {
                                state: { simulacion: selectedSimulacionHistorial, returnTo }
                              });
                            }}
                            className="px-2 py-1 text-[10px] font-medium rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200"
                          >
                            Detalles
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-6">
                  <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm">No hay intentos registrados para esta simulación.</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer del modal */}
          <div className="bg-gray-50 px-4 py-3 flex justify-end flex-shrink-0 border-t border-gray-200">
            <button
              onClick={closeHistorialModal}
              className="px-4 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm font-medium transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Modal de notificación personalizado
  const renderNotificationModal = () => {
    if (!showNotificationModal) return null;

    const getIconByType = (type) => {
      switch (type) {
        case 'success':
          return <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />;
        case 'warning':
          return <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />;
        case 'error':
          return <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />;
        case 'info':
        default:
          return <Brain className="w-12 h-12 text-blue-500 mx-auto mb-4" />;
      }
    };

    const getColorByType = (type) => {
      switch (type) {
        case 'success':
          return 'from-green-500 to-emerald-600';
        case 'warning':
          return 'from-yellow-500 to-orange-600';
        case 'error':
          return 'from-red-500 to-red-600';
        case 'info':
        default:
          return 'from-blue-500 to-indigo-600';
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
          {/* Header del modal */}
          <div className={`bg-gradient-to-r ${getColorByType(notificationContent.type)} text-white p-6 text-center`}>
            {getIconByType(notificationContent.type)}
            <h2 className="text-xl font-bold">{notificationContent.title}</h2>
          </div>

          {/* Contenido del modal */}
          <div className="p-6 text-center">
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              {notificationContent.message}
            </p>
            
            <button
              onClick={closeNotificationModal}
              className={`w-full px-6 py-3 bg-gradient-to-r ${getColorByType(notificationContent.type)} hover:opacity-90 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105`}
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Renderizado principal basado en el nivel actual
  return (
    <div>
      {/* Si el modal de gráficas está abierto, mostrar solo ese componente */}
      {showGraficasModal ? (
        <SimulacionGraficaHistorial
          simulacion={selectedSimulacionGraficas}
          historial={selectedSimulacionGraficas ? getSimulacionHistorial(selectedSimulacionGraficas.id) : null}
          idEstudiante={estudianteId}
          isOpen={showGraficasModal}
          onClose={closeGraficasModal}
          tipo={selectedTipo}
          moduloId={selectedModulo?.id}
          categoria={selectedSimulacionGraficas?.categoria}
        />
      ) : (
        <>
          {currentLevel === 'tipos' && renderTipos()}
          {currentLevel === 'modulos' && renderModulos()}
          {currentLevel === 'simulaciones' && renderSimulaciones()}
          
          {/* Modal de historial */}
          {selectedSimulacionHistorial && renderHistorialModal()}
          
          {/* Modal de notificación */}
          {renderNotificationModal()}
        </>
      )}
      
      {/* Confetti effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="text-6xl font-bold text-green-600 animate-bounce">
              🎉 {confettiScore}% 🎉
            </div>
          </div>
        </div>
      )}

      {/* Modal lanzamiento simulación */}
      {launchModal.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 pt-8 pb-6 text-center">
              <Brain className="w-14 h-14 mx-auto mb-4" />
              <h3 className="text-2xl font-bold">Iniciando Simulación</h3>
            </div>
            <div className="p-8 text-center space-y-6">
              <p className="text-gray-700 text-lg">
                Redirigiendo en <span className="font-bold text-indigo-600">{launchModal.seconds}s</span>...
              </p>
              <div className="flex gap-4 justify-center">
                <button onClick={cancelLaunch} className="flex-1 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition">Cancelar</button>
                <button onClick={doLaunchNow} className="flex-1 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium shadow">Aceptar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Simulaciones_Alumno_comp;