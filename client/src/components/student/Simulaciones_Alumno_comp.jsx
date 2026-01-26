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
  Anchor,     // Icono para Militar, Naval y Náutica Mercante
  RefreshCw   // Icono para refrescar
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
  // Estado para respuestas pendientes de calificación
  const [pendingAnswers, setPendingAnswers] = useState({}); // simulacionId -> { pending: number, total: number }

  // Estados para modal de gráficas
  const [showGraficasModal, setShowGraficasModal] = useState(false);
  const [selectedSimulacionGraficas, setSelectedSimulacionGraficas] = useState(null);
  // Modal para ver textos largos (instrucciones / descripciones)
  const [longTextModal, setLongTextModal] = useState({ open: false, title: '', content: '', meta: null });
  const openLongText = (title, content, meta = null) => setLongTextModal({ open: true, title, content: String(content || ''), meta });
  const closeLongText = () => setLongTextModal({ open: false, title: '', content: '', meta: null });
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
  const [launchModal, setLaunchModal] = useState({ open: false, simulacion: null, seconds: 4 });
  const [launchingSimId, setLaunchingSimId] = useState(null); // id simulacion que está lanzando
  const simWindowRef = React.useRef(null);
  const simMonitorRef = React.useRef(null);
  // Fallback / retry minimal (para futuras integraciones API)
  const [loadError, setLoadError] = useState('');
  const [retryToken, setRetryToken] = useState(0);
  const manualRetrySims = () => setRetryToken(t => t + 1);

  // Catálogo dinámico de áreas/módulos (reuso de endpoint de Actividades)
  const [modulosEspecificos, setModulosEspecificos] = useState([]);
  const [areasGenerales, setAreasGenerales] = useState([]); // para filtrar simulaciones generales por id_area válido
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [catalogError, setCatalogError] = useState('');
  useEffect(() => {
    let cancel = false;
    const fromCache = AREAS_CATALOG_CACHE.get();
    if (fromCache?.data) {
      const payload = fromCache.data;
      const modulos = Array.isArray(payload.modulos) ? payload.modulos : [];
      const mapped = modulos.map(m => ({ id: m.id, titulo: m.nombre, descripcion: m.descripcion, ...styleForArea(m.id) }));
      setModulosEspecificos(mapped);
      const generales = Array.isArray(payload.generales) ? payload.generales : [];
      setAreasGenerales(generales.map(g => ({ id: g.id, nombre: g.nombre })));
      if (!fromCache.stale) return; // mostrar cache y revalidar silenciosamente si stale
    }
    const load = async (silent = false) => {
      if (!silent) { setLoadingCatalog(true); setCatalogError(''); }
      try {
        const res = await getAreasCatalog();
        const payload = res.data?.data || res.data || {};
        AREAS_CATALOG_CACHE.set(payload);
        const modulos = Array.isArray(payload.modulos) ? payload.modulos : [];
        const mapped = modulos.map(m => ({ id: m.id, titulo: m.nombre, descripcion: m.descripcion, ...styleForArea(m.id) }));
        const generales = Array.isArray(payload.generales) ? payload.generales : [];
        if (!cancel) {
          setModulosEspecificos(mapped);
          setAreasGenerales(generales.map(g => ({ id: g.id, nombre: g.nombre })));
        }
      } catch (e) { if (!cancel) setCatalogError('No se pudo cargar catálogo de módulos'); }
      finally { if (!cancel) setLoadingCatalog(false); }
    };
    load(fromCache?.data ? true : false);
    return () => { cancel = true; };
  }, []);
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
          } catch { }
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
            } catch { }
            try { showNotification('Acceso restringido', 'Debes solicitar acceso y esperar aprobación del asesor para entrar a este módulo.', 'warning'); } catch { }
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
    } catch { }
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
    } catch { }
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
    const withinDate = (fechaEntrega ? now <= fechaEntrega : true);
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
    if (!estudianteId) { setSimulaciones([]); return; }
    setLoadingSims(true); setSimError('');
    try {
      // ✅ IMPORTANTE: Si estamos en "Simulaciones Generales", enviar id_area=0 al backend
      // para que filtre correctamente solo las simulaciones generales (sin id_area)
      const apiParams = { visible: 'false' };
      if (scope.type === 'generales') {
        apiParams.id_area = 0; // 0 significa "solo generales" (id_area IS NULL OR id_area = 0)
      } else if (scope.type === 'modulo' && scope.moduloId != null) {
        apiParams.id_area = scope.moduloId; // Filtrar por área específica
      }

      // Intento 1: visible=false para no ocultar por fecha en el backend
      const [resResumen, resCatalog] = await Promise.allSettled([
        resumenSimulacionesEstudiante(estudianteId),
        listSimulaciones(apiParams)
      ]);
      const resumenRows = resResumen.status === 'fulfilled' ? (resResumen.value?.data?.data || resResumen.value?.data || []) : [];
      let catalogRows = resCatalog.status === 'fulfilled' ? (resCatalog.value?.data?.data || resCatalog.value?.data || []) : [];
      // Nota: si se requiere, se puede leer status desde resResumen.reason?.response?.status o resCatalog.reason?.response?.status
      // Fallback 2: si viene vacío, intenta sin el flag visible (manteniendo id_area si está definido)
      if (!Array.isArray(catalogRows) || catalogRows.length === 0) {
        try {
          const fallbackParams = {};
          if (apiParams.id_area !== undefined) {
            fallbackParams.id_area = apiParams.id_area;
          }
          const res2 = await listSimulaciones(fallbackParams);
          const rows2 = res2?.data?.data || res2?.data || [];
          if (Array.isArray(rows2) && rows2.length) catalogRows = rows2;
        } catch { }
      }
      const resumenById = resumenRows.reduce((acc, q) => { acc[q.id] = q; return acc; }, {});
      const baseRows = catalogRows.length ? catalogRows : resumenRows;
      const generalIds = areasGenerales.map(a => Number(a.id)).filter(n => Number.isFinite(n));
      const generalIdSet = new Set(generalIds);

      // ✅ DEBUG: Log temporal para depurar
      if (process.env.NODE_ENV !== 'production') {
        console.log('[loadSimulaciones] DEBUG:', {
          scope,
          estudianteId,
          catalogRowsCount: catalogRows.length,
          resumenRowsCount: resumenRows.length,
          baseRowsCount: baseRows.length,
          generalIds,
          areasGeneralesCount: areasGenerales.length,
          sampleCatalogRows: catalogRows.slice(0, 3).map(q => ({
            id: q.id,
            titulo: q.titulo,
            descripcion: q.descripcion ? (q.descripcion.length > 50 ? q.descripcion.substring(0, 50) + '...' : q.descripcion) : null,
            nombre: q.nombre,
            publico: q.publico,
            id_area: q.id_area,
            grupos: q.grupos
          })),
          sampleBaseRows: baseRows.slice(0, 3).map(q => ({
            id: q.id,
            titulo: q.titulo,
            descripcion: q.descripcion ? (q.descripcion.length > 50 ? q.descripcion.substring(0, 50) + '...' : q.descripcion) : null,
            nombre: q.nombre,
            publico: q.publico,
            id_area: q.id_area,
            status: q.status
          })),
          sampleResumenRows: resumenRows.slice(0, 3).map(r => ({
            id: r.id,
            titulo: r.titulo,
            descripcion: r.descripcion ? (r.descripcion.length > 50 ? r.descripcion.substring(0, 50) + '...' : r.descripcion) : null,
            nombre: r.nombre
          }))
        });

        // ✅ Verificar errores en las peticiones
        if (resCatalog.status === 'rejected') {
          console.error('[loadSimulaciones] Error en listSimulaciones:', resCatalog.reason);
          console.error('[loadSimulaciones] Detalles del error:', {
            message: resCatalog.reason?.message,
            response: resCatalog.reason?.response?.data,
            status: resCatalog.reason?.response?.status
          });
        }
        if (resResumen.status === 'rejected') {
          console.error('[loadSimulaciones] Error en resumenSimulacionesEstudiante:', resResumen.reason);
          console.error('[loadSimulaciones] Detalles del error resumen:', {
            message: resResumen.reason?.message,
            response: resResumen.reason?.response?.data,
            status: resResumen.reason?.response?.status
          });
        }

        // ✅ Si ambas peticiones fueron exitosas pero vienen vacías, verificar directamente
        if (resCatalog.status === 'fulfilled' && catalogRows.length === 0) {
          console.warn('[loadSimulaciones] listSimulaciones devolvió 0 resultados:', {
            response: resCatalog.value?.data,
            status: resCatalog.value?.status
          });
        }
      }

      const filtered = baseRows.filter(q => {
        // ✅ FILTRAR: Solo mostrar simulaciones publicadas (no borradores)
        const isPublic = q.publico === true || q.publico === 1 || q.publico === '1' || q.status === 'Publicado';
        if (!isPublic) {
          if (process.env.NODE_ENV !== 'production') {
            console.log('[loadSimulaciones] Excluido (no publicado):', q.id, q.titulo, { publico: q.publico, status: q.status });
          }
          return false; // Excluir borradores
        }

        if (scope.type === 'generales') {
          // Generales: incluir simulaciones sin id_area (verdaderamente generales)
          // o aquellas mapeadas a un área general del catálogo
          const raw = q.id_area;
          const areaNum = raw != null ? Number(raw) : null;
          // ✅ IMPORTANTE: Si no hay áreas generales cargadas aún, mostrar todas las que no tienen id_area
          // Si hay áreas generales, incluir también las que coinciden con esas áreas
          const isGeneral = raw == null || raw === null || Number(raw) === 0; // considerar null, undefined, 0 como general
          const matchesGeneralArea = generalIdSet.size > 0 && generalIdSet.has(areaNum);
          // Si no hay áreas generales definidas, solo mostrar las que no tienen id_area
          // Si hay áreas generales definidas, mostrar las generales Y las que coinciden con áreas generales
          const result = generalIdSet.size === 0 ? isGeneral : (isGeneral || matchesGeneralArea);

          if (process.env.NODE_ENV !== 'production') {
            console.log('[loadSimulaciones] Filtro generales:', {
              id: q.id,
              titulo: q.titulo,
              id_area: q.id_area,
              raw,
              areaNum,
              isGeneral,
              matchesGeneralArea,
              generalIdSetSize: generalIdSet.size,
              generalIdSet: Array.from(generalIdSet),
              result
            });
          }

          return result;
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
        const oficial_puntaje = r.oficial_puntaje ?? null; // Puntaje del intento oficial (primer intento)
        const fecha_limite = q.fecha_limite || q.fechaEntrega || null;
        const now = new Date();
        const due = normalizeDeadlineEndOfDay(fecha_limite);
        const within = due ? now <= due : true;
        const estadoSim = total_intentos > 0 ? 'completado' : (within ? 'disponible' : 'vencido');

        // ✅ Helper para validar si un string tiene contenido real (no vacío, no solo espacios)
        const tieneContenido = (val) => {
          if (val == null || val === undefined) return false;
          const str = String(val).trim();
          return str.length > 0;
        };

        // ✅ IMPORTANTE: Priorizar título sobre nombre, y usar múltiples fuentes
        // El backend devuelve 'titulo' como campo principal, pero también puede tener 'nombre'
        // Combinar datos de 'q' (catálogo) y 'r' (resumen) para obtener el título
        // IMPORTANTE: Tratar strings vacíos como si fueran null/undefined
        // ✅ MEJORADO: También buscar en instrucciones si tiene un título descriptivo
        const tituloFinal = tieneContenido(q.titulo)
          ? String(q.titulo).trim()
          : (tieneContenido(r.titulo)
            ? String(r.titulo).trim()
            : (tieneContenido(q.nombre)
              ? String(q.nombre).trim()
              : (tieneContenido(r.nombre)
                ? String(r.nombre).trim()
                : (tieneContenido(q.instrucciones)
                  ? String(q.instrucciones).trim().substring(0, 100) // Usar primeras 100 chars de instrucciones como título
                  : (tieneContenido(r.instrucciones)
                    ? String(r.instrucciones).trim().substring(0, 100)
                    : `Simulador ${q.id}`)))));

        // ✅ IMPORTANTE: Priorizar descripción, puede venir de múltiples campos
        // Combinar datos de 'q' (catálogo) y 'r' (resumen) para obtener la descripción
        // IMPORTANTE: Tratar strings vacíos como si fueran null/undefined
        // ✅ MEJORADO: También buscar en instrucciones si no hay descripción
        const descripcionFinal = tieneContenido(q.descripcion)
          ? String(q.descripcion).trim()
          : (tieneContenido(r.descripcion)
            ? String(r.descripcion).trim()
            : (tieneContenido(q.instrucciones)
              ? String(q.instrucciones).trim()
              : (tieneContenido(r.instrucciones)
                ? String(r.instrucciones).trim()
                : null)));

        // ✅ MEJORADO: Si el título es solo "Simulador X" y hay descripción, usar parte de la descripción como título
        let tituloMejorado = tituloFinal;
        if (tituloFinal === `Simulador ${q.id}` && descripcionFinal) {
          // Intentar extraer un título de la descripción (primeras palabras hasta 60 caracteres)
          const descPrimeras = descripcionFinal.substring(0, 60).trim();
          if (descPrimeras.length > 10) {
            tituloMejorado = descPrimeras + (descripcionFinal.length > 60 ? '...' : '');
          }
        }

        // ✅ DEBUG: Log para verificar datos de título y descripción (siempre en desarrollo)
        // ✅ MEJORADO: Log más detallado para depurar problemas de título
        if (process.env.NODE_ENV !== 'production' || tituloFinal === `Simulador ${q.id}`) {
          const logData = {
            id: q.id,
            tituloFinal,
            tituloMejorado,
            descripcionFinal: descripcionFinal ? (descripcionFinal.length > 100 ? descripcionFinal.substring(0, 100) + '...' : descripcionFinal) : null,
            q_titulo: q.titulo,
            q_titulo_type: typeof q.titulo,
            q_titulo_length: q.titulo ? String(q.titulo).length : 0,
            q_titulo_trimmed: q.titulo ? String(q.titulo).trim() : null,
            q_descripcion: q.descripcion ? (q.descripcion.length > 100 ? q.descripcion.substring(0, 100) + '...' : q.descripcion) : null,
            q_descripcion_type: typeof q.descripcion,
            r_titulo: r.titulo,
            r_titulo_type: typeof r.titulo,
            r_descripcion: r.descripcion ? (r.descripcion.length > 100 ? r.descripcion.substring(0, 100) + '...' : r.descripcion) : null,
            r_descripcion_type: typeof r.descripcion,
            q_nombre: q.nombre,
            r_nombre: r.nombre,
            q_instrucciones: q.instrucciones ? (q.instrucciones.length > 100 ? q.instrucciones.substring(0, 100) + '...' : q.instrucciones) : null,
            r_instrucciones: r.instrucciones ? (r.instrucciones.length > 100 ? r.instrucciones.substring(0, 100) + '...' : r.instrucciones) : null,
            id_area: q.id_area,
            scope_type: scope?.type,
            scope_moduloId: scope?.moduloId,
            todosLosCampos_q: Object.keys(q),
            todosLosCampos_r: Object.keys(r)
          };
          console.log('[loadSimulaciones] Mapeo de datos para simulación:', logData);

          // ✅ Advertencia si no se encontró título o descripción
          if (!tituloFinal || tituloFinal === `Simulador ${q.id}`) {
            console.warn('[loadSimulaciones] ⚠️ TÍTULO NO ENCONTRADO para simulación:', q.id, {
              q_titulo: q.titulo,
              q_titulo_raw: JSON.stringify(q.titulo),
              q_nombre: q.nombre,
              r_titulo: r.titulo,
              r_nombre: r.nombre,
              usandoFallback: tituloFinal === `Simulador ${q.id}`,
              tituloMejorado: tituloMejorado
            });
          }
          if (!descripcionFinal) {
            console.warn('[loadSimulaciones] ⚠️ DESCRIPCIÓN NO ENCONTRADA para simulación:', q.id, {
              q_descripcion: q.descripcion,
              q_instrucciones: q.instrucciones,
              r_descripcion: r.descripcion,
              r_instrucciones: r.instrucciones
            });
          }
        }

        return {
          id: q.id,
          nombre: tituloMejorado, // Usar el título mejorado
          descripcion: descripcionFinal,
          fechaEntrega: fecha_limite,
          completado: total_intentos > 0,
          score: ultimo_puntaje,
          bestScore: mejor_puntaje,
          oficialScore: oficial_puntaje, // Puntaje oficial (primer intento)
          estado: estadoSim,
          totalIntentos: total_intentos,
          totalPreguntas: Number(q.total_preguntas || 0)
        };
      });
      
      console.log('[DEBUG Simulaciones_Alumno_comp - setSimulaciones]', {
        totalMapped: mapped.length,
        mappedSims: mapped.map(s => ({
          id: s.id,
          nombre: s.nombre,
          totalIntentos: s.totalIntentos,
          mejorPuntaje: s.mejorPuntaje,
          score: s.score,
          completado: s.completado
        }))
      });
      
      setSimulaciones(mapped);

      // Cargar respuestas pendientes para simulaciones completadas
      if (estudianteId) {
        mapped.forEach(async (sim) => {
          if (sim.completado && sim.id) {
            try {
              const resp = await fetch(`/api/grading/pending/simulacion/${sim.id}/${estudianteId}`, {
                credentials: 'include'
              });
              if (resp.ok) {
                const data = await resp.json();
                setPendingAnswers(prev => ({
                  ...prev,
                  [sim.id]: data.data || { pending: 0, total: 0 }
                }));
              }
            } catch (e) {
              console.warn('No se pudo obtener respuestas pendientes para simulación', sim.id, e);
            }
          }
        });
      }
    } catch (e) {
      console.error(e); setSimError('Error cargando simulaciones');
    } finally { setLoadingSims(false); }
  };

  // Historial real: fetch solo al abrir modal
  const fetchHistorial = async (simulacion) => {
    if (!estudianteId) return;
    try {
      const resp = await listIntentosSimulacionEstudiante(simulacion.id, estudianteId);
      const rows = resp.data?.data || resp.data || [];
      setHistorialCache(prev => ({ ...prev, [simulacion.id]: rows }));
    } catch (e) { console.warn('No se pudo cargar historial', e); }
  };

  const getSimulacionHistorial = (simulacionId) => {
    const intentos = historialCache[simulacionId] || [];
    return {
      intentos: intentos.map((it, idx) => ({
        id: it.id,
        intent_number: it.intent_number || (intentos.length - idx), // Usar intent_number del backend o calcular
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
      mejorPuntaje: intentos.reduce((m, i) => i.puntaje > m ? i.puntaje : m, 0),
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
    if (item && typeof item.totalIntentos === 'number') {
      console.log('[DEBUG Simulaciones - getTotalAttempts]', {
        simulacionId,
        simulacionNombre: item.nombre,
        totalIntentos: item.totalIntentos,
        desdeItem: true
      });
      return item.totalIntentos;
    }
    const intentos = historialCache[simulacionId] || [];
    const result = Array.isArray(intentos) ? intentos.length : 0;
    console.log('[DEBUG Simulaciones - getTotalAttempts]', {
      simulacionId,
      totalIntentos: result,
      desdeCache: true,
      cacheLength: intentos.length,
      totalSimulaciones: simulaciones.length
    });
    return result;
  };

  const getBestScore = (simulacionId) => {
    const item = simulaciones.find(s => s.id === simulacionId);
    if (!item) {
      console.log('[DEBUG Simulaciones - getBestScore] Item no encontrado:', simulacionId);
      return 0;
    }
    if (item && item.bestScore != null) {
      console.log('[DEBUG Simulaciones - getBestScore]', {
        simulacionId,
        simulacionNombre: item.nombre,
        bestScore: item.bestScore,
        desdeItem: true
      });
      return item.bestScore;
    }
    const intentos = historialCache[simulacionId] || [];
    if (!Array.isArray(intentos) || intentos.length === 0) {
      console.log('[DEBUG Simulaciones - getBestScore] Sin intentos en cache:', simulacionId);
      return 0;
    }
    const result = intentos.reduce((m, i) => (typeof i.puntaje === 'number' && i.puntaje > m) ? i.puntaje : m, 0);
    console.log('[DEBUG Simulaciones - getBestScore]', {
      simulacionId,
      result,
      desdeCache: true,
      intentosLength: intentos.length
    });
    return result;
  };

  // Escuchar eventos de WebSocket para actualizar lista en tiempo real cuando se crea/publica/borra una simulación
  useEffect(() => {
    let reloadTimeout = null;

    const handler = (e) => {
      const data = e.detail;
      if (!data || data.type !== 'notification' || !data.payload) return;
      const payload = data.payload;

      // ✅ Detectar cualquier notificación relacionada con simulaciones
      const simulacionId = payload.simulacion_id || payload.metadata?.simulacion_id || null;
      const isSimulacion = payload.metadata?.kind === 'simulacion' ||
        payload.kind === 'simulacion' ||
        payload.message?.toLowerCase().includes('simulación') ||
        payload.message?.toLowerCase().includes('simulacion') ||
        payload.title?.toLowerCase().includes('simulación') ||
        payload.title?.toLowerCase().includes('simulacion');

      // ✅ Actualizar lista si:
      // 1. Es una notificación de asignación de simulación (nueva o publicada)
      // 2. El payload tiene simulacion_id
      // 3. El mensaje/título menciona "simulación"
      if ((payload.kind === 'assignment' || isSimulacion) && simulacionId) {
        // Recargar la lista de simulaciones para reflejar cambios
        console.log('[Simulaciones] Notificación de simulación recibida, recargando lista...', {
          simulacionId,
          kind: payload.kind,
          title: payload.title,
          message: payload.message
        });

        // ✅ Cancelar cualquier recarga pendiente para evitar múltiples recargas
        if (reloadTimeout) clearTimeout(reloadTimeout);

        // ✅ Disparar recarga según el scope actual (con pequeño delay para asegurar que el backend actualizó)
        // Actualizar siempre, incluso si no estamos en el nivel correcto (para que se actualice cuando el usuario navegue)
        reloadTimeout = setTimeout(() => {
          if (currentLevel === 'simulaciones') {
            const scope = selectedTipo === 'generales'
              ? { type: 'generales' }
              : (selectedModulo
                ? { type: 'modulo', moduloId: selectedModulo.id }
                : { type: 'generales' });
            loadSimulaciones(scope);
          }
          reloadTimeout = null;
        }, 800); // Delay de 800ms para dar tiempo al backend a actualizar
      }

      // ✅ También actualizar si el mensaje menciona "borrador" o "eliminado" (simulador borrado/despublicado)
      if (payload.message?.toLowerCase().includes('eliminad') ||
        payload.message?.toLowerCase().includes('borrador')) {
        console.log('[Simulaciones] Simulación modificada/eliminada, recargando lista...');

        // ✅ Cancelar cualquier recarga pendiente
        if (reloadTimeout) clearTimeout(reloadTimeout);

        if (currentLevel === 'simulaciones') {
          reloadTimeout = setTimeout(() => {
            const scope = selectedTipo === 'generales'
              ? { type: 'generales' }
              : (selectedModulo
                ? { type: 'modulo', moduloId: selectedModulo.id }
                : { type: 'generales' });
            loadSimulaciones(scope);
            reloadTimeout = null;
          }, 800);
        }
      }
    };

    window.addEventListener('student-ws-message', handler);
    return () => {
      window.removeEventListener('student-ws-message', handler);
      if (reloadTimeout) clearTimeout(reloadTimeout);
    };
  }, [currentLevel, selectedTipo, selectedModulo, estudianteId, loadSimulaciones]);

  // Escuchar notificación desde la pestaña de simulación al finalizar
  useEffect(() => {
    const onMessage = (e) => {
      try {
        if (!e?.data || e.origin !== window.location.origin) return;
        if (e.data.type === 'SIM_FINISHED') {
          console.log('[DEBUG Simulaciones - Mensaje recibido]', {
            tipo: e.data.type,
            simId: e.data.simId,
            sesionId: e.data.sesionId
          });
          showNotification('¡Simulación terminada!', 'Se registraron tus respuestas. Actualizando…', 'success');
          // Recargar simulaciones para reflejar estado/completado
          if (currentLevel === 'simulaciones') {
            const scope = selectedTipo === 'generales'
              ? { type: 'generales' }
              : (selectedModulo
                ? { type: 'modulo', moduloId: selectedModulo.id }
                : { type: 'generales' });
            console.log('[DEBUG Simulaciones - Recargando con scope]', scope);
            loadSimulaciones(scope);
          }
          // Opcional: traer foco a esta pestaña
          try { window.focus(); } catch { }
        }
      } catch { /* ignore */ }
    };
    
    // También escuchar eventos de localStorage como fallback (para cuando no hay window.opener)
    const checkLocalStorage = () => {
      try {
        const simFinished = localStorage.getItem('sim_finished_refresh');
        if (simFinished) {
          const data = JSON.parse(simFinished);
          console.log('[DEBUG Simulaciones - localStorage sim_finished]', data);
          localStorage.removeItem('sim_finished_refresh');
          showNotification('¡Simulación terminada!', 'Se registraron tus respuestas. Actualizando…', 'success');
          if (currentLevel === 'simulaciones') {
            const scope = selectedTipo === 'generales'
              ? { type: 'generales' }
              : (selectedModulo
                ? { type: 'modulo', moduloId: selectedModulo.id }
                : { type: 'generales' });
            console.log('[DEBUG Simulaciones - Recargando desde localStorage con scope]', scope);
            loadSimulaciones(scope);
          }
        }
      } catch {}
    };
    
    // Verificar localStorage periódicamente como fallback
    const interval = setInterval(checkLocalStorage, 2000);
    checkLocalStorage(); // Verificar inmediatamente
    
    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('message', onMessage);
      clearInterval(interval);
    };
  }, [currentLevel, selectedTipo, selectedModulo, loadSimulaciones]);

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
      loadSimulaciones({ type: 'generales' });
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
      loadSimulaciones({ type: 'modulo', moduloId: modulo.id });
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
        try { navigate('/alumno/simulaciones', { replace: true }); } catch { }
      }
    } else if (currentLevel === 'modulos') {
      setCurrentLevel('tipos');
      setSelectedTipo(null);
      setSelectedModulo(null);
      // URL: volver a portada (limpiar query)
      try { navigate('/alumno/simulaciones', { replace: true }); } catch { }
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
    } catch { }
  };

  // Funciones para manejar modal de gráficas
  const handleVerGraficas = async (simulacion) => {
    if (!simulacion) return;
    
    // Validar que haya al menos 3 intentos para un análisis preciso
    const totalAttempts = getTotalAttempts(simulacion.id);
    if (totalAttempts < 3) {
      showNotification('Análisis no disponible', `Se requieren al menos 3 intentos para generar un análisis preciso. Actualmente tienes ${totalAttempts} intento${totalAttempts !== 1 ? 's' : ''}.`, 'warning');
      return;
    }
    
    setSelectedSimulacionGraficas(simulacion);
    // Cargar historial antes de abrir el modal para evitar estado "sin datos"
    try { await fetchHistorial(simulacion); } catch { }
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

  // Handler para respuestas de texto libre (respuesta corta)
  const handleTextAnswer = (id_pregunta, texto_libre) => {
    setRespuestasSesion(prev => ({
      ...prev,
      [id_pregunta]: { texto_libre, tiempo_ms: 0 }
    }));
  };

  // Enviar respuestas al backend (batch) y finalizar
  const handleFinalizarSesion = async () => {
    if (!activeSesion) return;
    setSesionLoading(true); setSesionError('');
    try {
      // Preparar batch - incluir id_opcion o texto_libre según corresponda
      const batch = Object.entries(respuestasSesion).map(([id_pregunta, r]) => ({
        id_pregunta: Number(id_pregunta),
        id_opcion: r.id_opcion || null,
        texto_libre: r.texto_libre || null,
        tiempo_ms: r.tiempo_ms || 0
      }));
      if (batch.length) {
        await enviarRespuestasSesionSimulacion(activeSesion.id, batch);
      }
      const fin = await finalizarSesionSimulacion(activeSesion.id);
      const resultado = fin.data?.data || {};
      showNotification('Simulación finalizada', `Puntaje: ${resultado.puntaje ?? 'N/A'}`, 'success');
      setShowSesionModal(false);
      setActiveSesion(null);
      await loadSimulaciones(selectedTipo === 'generales' ? { type: 'generales' } : { type: 'modulo', moduloId: selectedModulo?.id });
    } catch (e) {
      console.error(e); setSesionError('Error al finalizar'); showNotification('Error', 'No se pudo finalizar la sesión', 'error');
    } finally { setSesionLoading(false); }
  };

  const handleCancelarSesion = () => {
    setShowSesionModal(false);
    setActiveSesion(null);
    setPreguntasSesion([]);
    setRespuestasSesion({});
  };


  // Estados para sesión activa (toma de simulación real)
  const [activeSesion, setActiveSesion] = useState(null); // { id, simulacionId }
  const [preguntasSesion, setPreguntasSesion] = useState([]); // preguntas cargadas
  const [respuestasSesion, setRespuestasSesion] = useState({}); // id_pregunta -> { id_opcion, tiempo_ms }
  const [sesionLoading, setSesionLoading] = useState(false);
  const [sesionError, setSesionError] = useState('');
  const [showSesionModal, setShowSesionModal] = useState(false);

  // Handler para iniciar sesión real (crea sesión y carga preguntas)
  const handleIniciarSimulacion = async (simulacionId) => {
    const sim = simulaciones.find(s => s.id === simulacionId);
    if (!sim || !estudianteId) return;
    setSesionLoading(true); setSesionError('');
    try {
      const pregResp = await listPreguntasSimulacion(sim.id);
      const preguntas = pregResp.data?.data || [];
      const sesionResp = await crearSesionSimulacion(sim.id, { id_estudiante: estudianteId });
      const sesionId = sesionResp.data?.data?.id;
      setActiveSesion({ id: sesionId, simulacionId: sim.id, nombre: sim.nombre });
      setPreguntasSesion(preguntas.sort((a, b) => (a.orden || 0) - (b.orden || 0)));
      setRespuestasSesion({});
      setShowSesionModal(true);
    } catch (e) {
      console.error(e); setSesionError('No se pudo iniciar la simulación');
      showNotification('Error', 'No se pudo iniciar la simulación', 'error');
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
        navigate(url, { replace: true });
      } else {
        try {
          w.document.write('<!doctype html><title>MQERK Academy</title><meta charset="utf-8"/><p style="font-family:system-ui,Segoe UI,Arial;margin:2rem;color:#4b5563;">Cargando simulación…</p>');
          w.document.close();
        } catch { }
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
              await loadSimulaciones(selectedTipo === 'generales' ? { type: 'generales' } : { type: 'modulo', moduloId: selectedModulo?.id });
            } catch { }
            showNotification('Simulación finalizada', 'Tu intento ha concluido correctamente.', 'success');
          }
        }, 1200);
      }
    } catch {
      navigate(url, { replace: true });
    }
  };

  const handleOpenLaunchModal = (simulacion) => {
    if (launchingSimId) return;
    setLaunchModal({ open: true, simulacion, seconds: 4 });
  };
  const cancelLaunch = () => setLaunchModal({ open: false, simulacion: null, seconds: 4 });
  const doLaunchNow = () => {
    if (!launchModal.simulacion) return;
    const id = launchModal.simulacion.id;
    setLaunchingSimId(id);
    setLaunchModal({ open: false, simulacion: null, seconds: 4 });
    openSimRunner(id);
  };
  useEffect(() => {
    if (!launchModal.open) return;
    if (launchModal.seconds <= 0) { doLaunchNow(); return; }
    const t = setTimeout(() => setLaunchModal(prev => ({ ...prev, seconds: prev.seconds - 1 })), 1000);
    return () => clearTimeout(t);
  }, [launchModal.open, launchModal.seconds]);
  useEffect(() => () => { if (simMonitorRef.current) clearInterval(simMonitorRef.current); }, []);

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

  // NIVEL 1: Tipos de simuladores - Mejorado para móviles
  const renderTipos = () => (
    <div className="min-h-screen bg-white px-0 sm:px-2 md:px-3 lg:px-4 xl:px-6 2xl:px-8 pt-6 sm:pt-8 md:pt-10 py-8 sm:py-10 lg:py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header - Mejorado para móviles */}
        <div className="bg-white border-2 border-gray-200/50 rounded-xl sm:rounded-2xl shadow-lg mb-6 sm:mb-8 mt-4 sm:mt-6 md:mt-8">
          <div className="px-4 sm:px-6 py-5 sm:py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 tracking-tight">
                  SIMULACIONES
                </h1>
                <p className="text-sm sm:text-base text-gray-600 font-medium">
                  Simuladores para exámenes de ingreso y evaluaciones académicas
                </p>
              </div>
              <div className="flex items-center text-xs sm:text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                <Clock className="w-4 h-4 mr-1.5 text-violet-600" />
                <span className="font-semibold">Actualizado hoy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Título estilizado - Mejorado para móviles */}
        <div className="bg-gradient-to-r from-violet-50 via-indigo-50 to-purple-50 rounded-xl sm:rounded-2xl border-2 border-violet-200/50 shadow-lg p-6 sm:p-8 mb-6 sm:mb-8 relative overflow-hidden ring-2 ring-violet-100/50">
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-violet-100/40 to-indigo-100/40 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-tr from-indigo-100/40 to-purple-100/40 rounded-full blur-xl"></div>

          <div className="flex items-center justify-center relative z-10">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="relative">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-violet-500 via-indigo-600 to-purple-600 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-xl ring-4 ring-violet-200/50 group-hover:scale-110 transition-transform">
                  <Zap className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white">
                  <Trophy className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                </div>
              </div>

              <div className="flex flex-col items-center">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-violet-600 via-indigo-700 to-purple-700 bg-clip-text text-transparent tracking-wide">
                  SIMULADORES
                </h2>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="w-12 sm:w-16 h-1 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full"></div>
                  <div className="w-12 sm:w-16 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjetas de tipos de simulador - Mejoradas para móviles */}
        <div className="grid grid-cols-2 auto-rows-fr gap-4 sm:gap-5 md:gap-6 max-w-3xl mx-auto">
          {/* Simulador por áreas generales */}
          <div
            onClick={() => handleSelectTipo('generales')}
            className="bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 border-2 border-violet-300/50 rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group h-full ring-2 ring-violet-100/50 active:scale-[0.97] touch-manipulation"
          >
            <div className="p-4 sm:p-5 lg:p-6 text-center min-h-[200px] sm:min-h-[220px] h-full flex flex-col items-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-violet-500 via-indigo-600 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-5 lg:mb-6 group-hover:scale-110 transition-transform shadow-lg ring-3 ring-violet-200/50">
                <Target className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-white" />
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-extrabold text-gray-900 mb-1 sm:mb-2">Simulador por</h3>
              <h4 className="text-sm sm:text-base lg:text-lg font-extrabold text-violet-700 mb-3 sm:mb-4">áreas generales</h4>
              <p className="text-gray-700 leading-relaxed text-xs sm:text-sm mb-3 sm:mb-4 px-1">
                EXANI II, PAA y evaluaciones generales para ingreso universitario
              </p>
              <div className="mt-auto pt-2 sm:pt-3 border-t border-violet-200/50 w-full">
                <div className="inline-flex items-center text-violet-700 font-extrabold text-xs sm:text-sm bg-gradient-to-r from-violet-100 to-indigo-100 px-3 py-1.5 rounded-lg border border-violet-200 shadow-sm group-hover:shadow-md transition-all">
                  <span>ACCEDER</span>
                  <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 rotate-180 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            </div>
          </div>

          {/* Simulador por módulos específicos */}
          <div
            onClick={() => handleSelectTipo('especificos')}
            className="bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 border-2 border-indigo-300/50 rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group h-full ring-2 ring-indigo-100/50 active:scale-[0.97] touch-manipulation"
          >
            <div className="p-4 sm:p-5 lg:p-6 text-center min-h-[200px] sm:min-h-[220px] h-full flex flex-col items-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-indigo-500 via-blue-600 to-cyan-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-5 lg:mb-6 group-hover:scale-110 transition-transform shadow-lg ring-3 ring-indigo-200/50">
                <Brain className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-white" />
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-extrabold text-gray-900 mb-1 sm:mb-2">Simulador por</h3>
              <h4 className="text-sm sm:text-base lg:text-lg font-extrabold text-indigo-700 mb-3 sm:mb-4">módulos específicos</h4>
              <p className="text-gray-700 leading-relaxed text-xs sm:text-sm mb-3 sm:mb-4 px-1">
                Simulaciones especializadas por área de conocimiento y carrera
              </p>
              <div className="mt-auto pt-2 sm:pt-3 border-t border-indigo-200/50 w-full">
                <div className="inline-flex items-center text-indigo-700 font-extrabold text-xs sm:text-sm bg-gradient-to-r from-indigo-100 to-blue-100 px-3 py-1.5 rounded-lg border border-indigo-200 shadow-sm group-hover:shadow-md transition-all">
                  <span>ACCEDER</span>
                  <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 rotate-180 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSesionModal = () => {
    if (!showSesionModal || !activeSesion) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl flex flex-col max-h-[calc(100vh-2rem)]">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h3 className="text-lg font-semibold">Simulación: {activeSesion.nombre}</h3>
            <button onClick={handleCancelarSesion} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {sesionError && <div className="text-red-600 text-sm">{sesionError}</div>}
            {preguntasSesion.length === 0 && !sesionLoading && (
              <div className="text-sm text-gray-500">No hay preguntas configuradas.</div>
            )}
            {preguntasSesion.map((p, idx) => (
              <div key={p.id} className="border rounded-lg p-4">
                <div className="font-medium mb-2">{idx + 1}. {p.enunciado}</div>

                {/* Pregunta de respuesta corta */}
                {p.tipo === 'respuesta_corta' && (
                  <div>
                    <textarea
                      value={respuestasSesion[p.id]?.texto_libre || ''}
                      onChange={(e) => handleTextAnswer(p.id, e.target.value)}
                      placeholder="Escribe tu respuesta aquí..."
                      rows={4}
                      className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-colors resize-y"
                    />
                    <p className="mt-2 text-xs text-gray-500">Escribe tu respuesta en el cuadro de texto arriba.</p>
                  </div>
                )}

                {/* Preguntas de opción múltiple o verdadero/falso - NO mostrar opciones para respuesta_corta */}
                {p.tipo !== 'respuesta_corta' && (p.tipo === 'opcion_multiple' || p.tipo === 'verdadero_falso' || p.tipo === 'multi_respuesta' || !p.tipo) && p.opciones && p.opciones.length > 0 && (
                  <div className="space-y-2 flex flex-col items-center">
                    {p.opciones.map(op => {
                      const selected = respuestasSesion[p.id]?.id_opcion === op.id;
                      return (
                        <button
                          key={op.id}
                          type="button"
                          onClick={() => handleSelectOpcion(p.id, op.id)}
                          className={`w-full text-left px-3 py-2 rounded border transition-colors ${selected ? 'bg-indigo-600 text-white border-indigo-600' : 'hover:bg-indigo-50 border-gray-200'}`}
                        >
                          {op.texto}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Preguntas respondidas: {
                Object.entries(respuestasSesion).filter(([_, r]) =>
                  r.id_opcion != null || (r.texto_libre != null && r.texto_libre.trim() !== '')
                ).length
              }/{preguntasSesion.length}
            </div>
            <div className="flex gap-3">
              <button onClick={handleCancelarSesion} className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button disabled={sesionLoading} onClick={handleFinalizarSesion} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">{sesionLoading ? 'Guardando...' : 'Finalizar'}</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // NIVEL 2: Módulos específicos - Mejorado para móviles
  const renderModulos = () => {
    const hasInitialArea = allowedSimulationAreas.length > 0;

    return (
      <div className="min-h-screen bg-white px-0 sm:px-2 md:px-3 lg:px-4 xl:px-6 2xl:px-8 pt-6 sm:pt-8 md:pt-10 py-4 lg:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header con navegación - Mejorado para móviles */}
          <div className="bg-white border-2 border-gray-200/50 rounded-xl sm:rounded-2xl shadow-lg mb-6 sm:mb-8 mt-4 sm:mt-6 md:mt-8">
            <div className="px-4 sm:px-6 py-5 sm:py-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <button
                    onClick={handleGoBack}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 active:scale-95 rounded-xl transition-all touch-manipulation"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 mb-2">
                      {hasInitialArea ? 'Módulos Específicos' : 'Elige tu Área de Interés'}
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 font-medium">
                      {hasInitialArea
                        ? 'Accede a tus áreas permitidas o solicita acceso a nuevas.'
                        : 'Selecciona tu primera área de conocimiento para empezar.'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-xs sm:text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                  <Brain className="w-4 h-4 mr-1.5 text-violet-600" />
                  <span className="font-semibold">{modulosEspecificos.length} módulos disponibles</span>
                </div>
              </div>
            </div>
          </div>

          {/* Grid de módulos específicos - Mejorado para móviles */}
          {(loadError || catalogError) && (
            <div className="mb-4 p-4 rounded-xl border-2 border-red-200 bg-red-50 flex flex-col sm:flex-row sm:items-center gap-3 shadow-lg">
              <div className="flex-1 text-sm text-red-700 font-semibold">{loadError || catalogError}</div>
              <div className="flex gap-2">
                <button onClick={manualRetrySims} className="px-3 py-1.5 text-xs font-extrabold rounded-lg bg-red-600 text-white hover:bg-red-700 active:scale-95 transition-all touch-manipulation shadow-sm">Reintentar</button>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {(loadingCatalog && modulosEspecificos.length === 0) && (
              <div className="col-span-full py-6 text-center text-sm sm:text-base text-gray-500 font-medium">Cargando módulos...</div>
            )}
            {modulosEspecificos.map((modulo) => {
              const isAllowed = allowedSimulationAreas.includes(modulo.id);
              const request = simulationRequests.find(req => req.areaId === modulo.id);
              const isPending = request && request.status === 'pending';

              let actionHandler = () => { };
              let footerContent;
              let isClickable = false;

              if (hasInitialArea) {
                if (isAllowed) {
                  isClickable = true;
                  actionHandler = () => handleSelectModulo(modulo);
                  footerContent = (
                    <div className="inline-flex items-center text-gray-700 font-extrabold text-xs sm:text-sm bg-gradient-to-r from-gray-100 to-slate-100 px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm group-hover:shadow-md transition-all">
                      <span>Ver simulaciones</span>
                      <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 rotate-180 group-hover:translate-x-1.5 transition-transform" />
                    </div>
                  );
                } else if (isPending) {
                  footerContent = (
                    <div className="inline-flex items-center text-amber-800 font-extrabold text-xs sm:text-sm bg-gradient-to-r from-amber-100 to-yellow-100 px-3 py-1.5 rounded-xl border-2 border-amber-200 shadow-sm">
                      <Hourglass className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                      <span>Pendiente</span>
                    </div>
                  );
                } else {
                  isClickable = true;
                  actionHandler = () => handleRequestAccess(modulo.id);
                  footerContent = (
                    <div className="inline-flex items-center text-blue-700 font-extrabold text-xs sm:text-sm bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-1.5 rounded-lg border border-blue-200 shadow-sm group-hover:shadow-md transition-all">
                      <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
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
                    <div className="inline-flex items-center text-amber-800 font-extrabold text-xs sm:text-sm bg-gradient-to-r from-amber-100 to-yellow-100 px-3 py-1.5 rounded-xl border-2 border-amber-200 shadow-sm">
                      <Hourglass className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                      <span>Pendiente</span>
                    </div>
                  );
                } else {
                  isClickable = true;
                  actionHandler = () => handleInitialAreaSelection(modulo.id);
                  footerContent = (
                    <div className="inline-flex items-center text-indigo-700 font-extrabold text-xs sm:text-sm bg-gradient-to-r from-indigo-100 to-violet-100 px-3 py-1.5 rounded-lg border border-indigo-200 shadow-sm group-hover:shadow-md transition-all ring-2 ring-indigo-200/50">
                      <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
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
                    containerClasses={`${modulo.bgColor} ${modulo.borderColor} bg-gradient-to-br border-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
                    iconWrapperClass={`bg-gradient-to-br ${modulo.color} ring-2 ring-white/50`}
                    minHeight={CARD_HEIGHT_PX}
                    onClick={isClickable ? actionHandler : undefined}
                    interactive={isClickable}
                    pending={isPending}
                    footer={<div className="text-xs sm:text-sm">{footerContent}</div>}
                  />
                </div>
              );
            })}
            {!loadingCatalog && !catalogError && modulosEspecificos.length === 0 && (
              <div className="col-span-full text-center text-xs sm:text-sm text-gray-500 py-6 font-medium">No hay módulos específicos disponibles.</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // NIVEL 3: Tabla de simulaciones
  const renderSimulaciones = () => (
    <div className="min-h-screen bg-white px-0 sm:px-2 md:px-3 lg:px-4 xl:px-6 2xl:px-8 pt-6 sm:pt-8 md:pt-10 py-4 lg:py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header con navegación - Mejorado para móviles */}
        <div className="bg-white border-2 border-gray-200/50 rounded-xl sm:rounded-2xl shadow-lg mb-6 sm:mb-8 mt-4 sm:mt-6 md:mt-8">
          <div className="px-4 sm:px-6 py-5 sm:py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <button
                  onClick={handleGoBack}
                  className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 active:scale-95 rounded-xl transition-all touch-manipulation"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 mb-2 break-words text-left">
                    {selectedTipo === 'generales' ? 'Simulaciones Generales' :
                      selectedModulo ? selectedModulo.titulo : 'Simulaciones'}
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 font-medium text-left">
                    {selectedTipo === 'generales' ? 'Exámenes generales de ingreso universitario' :
                      selectedModulo ? selectedModulo.descripcion : 'Simulaciones especializadas'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center text-xs sm:text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                  <Target className="w-4 h-4 mr-1.5 text-violet-600" />
                  <span className="font-semibold">{filteredSimulaciones.length} simulaciones disponibles</span>
                </div>
                <button
                  onClick={() => {
                    const scope = selectedTipo === 'generales' 
                      ? { type: 'generales' } 
                      : { type: 'modulo', moduloId: selectedModulo?.id };
                    loadSimulaciones(scope);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 active:scale-95 rounded-lg transition-all"
                  title="Refrescar lista"
                  aria-label="Refrescar lista"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Título estilizado - Mejorado para móviles */}
        <div className="bg-gradient-to-r from-cyan-50 via-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl border-2 border-cyan-200/50 shadow-lg p-6 sm:p-8 mb-6 sm:mb-8 relative overflow-hidden ring-2 ring-cyan-100/50">
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-cyan-100/40 to-indigo-100/40 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-tr from-blue-100/40 to-cyan-100/40 rounded-full blur-xl"></div>

          <div className="flex items-center justify-center relative z-10">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="relative">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-xl ring-4 ring-cyan-200/50">
                  <Play className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white">
                  <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                </div>
              </div>

              <div className="flex flex-col items-center text-center">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-700 to-indigo-700 bg-clip-text text-transparent tracking-wide">
                  SIMULACIONES DISPONIBLES
                </h2>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="w-12 sm:w-16 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"></div>
                  <div className="w-12 sm:w-16 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros - Mejorado para móviles */}
        <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200/50 shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
            <div className="text-sm sm:text-base md:text-lg font-extrabold text-gray-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600" />
              <span>Filtrar simulaciones</span>
            </div>

            {/* Acciones */}
            {/* Debug removido */}
            <div className="flex items-center gap-2 order-3 md:order-2" />

            {/* Selector de mes */}
            <div className="relative w-full md:w-auto">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between w-full md:w-64 px-3 sm:px-4 py-2 text-left bg-white border-2 border-gray-300 rounded-xl hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 active:scale-95 transition-all touch-manipulation shadow-sm"
              >
                <span className="font-semibold">{getSelectedMonthName()}</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-300 rounded-xl shadow-xl">
                  <div className="py-1">
                    <button
                      onClick={() => handleMonthSelect('all')}
                      className={`block w-full px-4 py-2.5 text-left hover:bg-gray-100 font-medium ${selectedMonth === 'all' ? 'bg-violet-50 text-violet-700' : 'text-gray-700'}`}
                    >
                      Todos los meses
                    </button>
                    {months.map((month, index) => (
                      <button
                        key={index}
                        onClick={() => handleMonthSelect(index.toString())}
                        className={`block w-full px-4 py-2.5 text-left hover:bg-gray-100 font-medium ${selectedMonth === index.toString() ? 'bg-violet-50 text-violet-700' : 'text-gray-700'}`}
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

        {/* Vista de escritorio - Tabla de simulaciones - Mejorada */}
        <div className="hidden lg:block bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 border-b-0 shadow-xl overflow-hidden ring-2 ring-slate-100/90">
          <div className="overflow-x-auto simulaciones-table-scroll" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white shadow-md">
                  <th className="px-2 sm:px-2.5 py-2 sm:py-2.5 text-left text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border-r border-white/30 last:border-r-0">No.</th>
                  <th className="px-2 sm:px-2.5 py-2 sm:py-2.5 text-left text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border-r border-white/30 last:border-r-0">Simulación</th>
                  <th className="px-2 sm:px-2.5 py-2 sm:py-2.5 text-center text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border-r border-white/30 last:border-r-0">Fecha límite</th>
                  <th className="px-2 sm:px-2.5 py-2 sm:py-2.5 text-center text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border-r border-white/30 last:border-r-0">Ejecutar</th>
                  <th className="px-2 sm:px-2.5 py-2 sm:py-2.5 text-center text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border-r border-white/30 last:border-r-0">Entregado</th>
                  <th className="px-2 sm:px-2.5 py-2 sm:py-2.5 text-center text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border-r border-white/30 last:border-r-0">Volver a intentar</th>
                  <th className="px-2 sm:px-2.5 py-2 sm:py-2.5 text-center text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border-r border-white/30 last:border-r-0">Historial</th>
                  <th className="px-2 sm:px-2.5 py-2 sm:py-2.5 text-center text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border-r border-white/30 last:border-r-0">Gráficas</th>
                  <th className="px-2 sm:px-2.5 py-2 sm:py-2.5 text-center text-[10px] sm:text-[11px] font-bold uppercase tracking-wider last:border-r-0">Puntaje</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200/90">
                {filteredSimulaciones.length > 0 ? (
                  filteredSimulaciones.map((simulacion, index) => (
                    <tr key={simulacion.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-violet-50/30 transition-colors duration-200`}>
                      <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-[11px] sm:text-xs font-extrabold text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-2 sm:px-3 py-2">
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-gray-900">
                            {simulacion.nombre}
                          </div>
                          {simulacion.descripcion && (
                            <div
                              onClick={() => openLongText(simulacion.nombre, simulacion.descripcion, { tipo: 'simulacion', id: simulacion.id })}
                              className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5 cursor-pointer group"
                            >
                              <p
                                style={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: isMobile ? 1 : 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  textAlign: 'justify',
                                  wordBreak: 'break-word',
                                  lineHeight: '1.2'
                                }}
                                className="group-hover:text-gray-700 transition-colors"
                              >
                                {simulacion.descripcion}
                              </p>
                              <button
                                onClick={(e) => { e.stopPropagation(); openLongText(simulacion.nombre, simulacion.descripcion, { tipo: 'simulacion', id: simulacion.id }); }}
                                className="mt-0.5 text-[9px] sm:text-[10px] text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                              >
                                Ver descripción completa
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-2 sm:px-3 py-2 text-center border-r border-slate-200/80 last:border-r-0">
                        <div className="flex items-center justify-center">
                          <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 text-violet-600" />
                          <span className="text-[10px] sm:text-[11px] text-gray-900 font-semibold">
                            {(() => {
                              const d = normalizeDeadlineEndOfDay(simulacion.fechaEntrega);
                              return d ? d.toLocaleDateString('es-ES') : 'Sin límite';
                            })()}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 sm:px-3 py-2 text-center border-r border-slate-200/80 last:border-r-0">
                        {isSimulacionAvailable(simulacion) ? (
                          <button
                            onClick={() => handleOpenLaunchModal(simulacion)}
                            disabled={launchingSimId === simulacion.id}
                            className={`relative px-2 sm:px-3 py-1.5 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white rounded-lg text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wide shadow-md transition-all duration-200 border border-red-600 hover:border-red-700 active:scale-95 touch-manipulation ${launchingSimId === simulacion.id ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg transform hover:scale-105'}`}
                          >
                            <span className="relative z-10 flex items-center justify-center">
                              <span className="mr-1 text-xs">🚀</span>
                              {launchingSimId === simulacion.id ? 'LANZANDO…' : 'START'}
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-t from-red-700/20 to-transparent rounded-lg"></div>
                          </button>
                        ) : (
                          <button
                            disabled
                            className="px-2 py-1 bg-gray-300 cursor-not-allowed text-gray-500 rounded-lg text-[10px] sm:text-[11px] font-bold"
                          >
                            {computeSimEstado(simulacion) === 'vencido' ? 'VENCIDO' : (Number(simulacion.totalPreguntas || 0) === 0 ? 'SIN PREGUNTAS' : 'NO DISPONIBLE')}
                          </button>
                        )}
                      </td>
                      <td className="px-2 sm:px-3 py-2 text-center border-r border-slate-200/80 last:border-r-0">
                        {simulacion.completado ? (
                          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 mx-auto" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mx-auto" />
                        )}
                      </td>
                      <td className="px-2 sm:px-3 py-2 text-center border-r border-slate-200/80 last:border-r-0">
                        {simulacion.completado ? (
                          <button
                            onClick={() => handleOpenLaunchModal(simulacion)}
                            disabled={launchingSimId === simulacion.id}
                            className={`relative px-2 sm:px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wide shadow-md transition-all duration-200 border border-red-600 hover:border-red-700 active:scale-95 touch-manipulation ${launchingSimId === simulacion.id ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg transform hover:scale-105'}`}
                          >
                            <span className="relative z-10 flex items-center justify-center">
                              <span className="mr-0.5 text-xs">🔄</span>
                              {launchingSimId === simulacion.id ? 'LANZANDO…' : 'REINTENTAR'}
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 to-transparent rounded-lg"></div>
                          </button>
                        ) : (
                          <span className="text-gray-400 text-[10px] sm:text-[11px]">-</span>
                        )}
                      </td>
                      <td className="px-2 sm:px-3 py-2 text-center border-r border-slate-200/80 last:border-r-0">
                        {simulacion.completado && getTotalAttempts(simulacion.id) > 0 ? (
                          <button
                            onClick={() => handleVerHistorial(simulacion)}
                            className="inline-flex items-center gap-0.5 px-1.5 sm:px-2 py-1 text-[9px] sm:text-[10px] font-extrabold text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg border border-blue-200 transition-all active:scale-95 touch-manipulation shadow-sm"
                            title="Historial"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Historial</span>
                            <span className="ml-0.5 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-white text-blue-700 text-[8px] font-extrabold border border-blue-200">{getTotalAttempts(simulacion.id)}</span>
                          </button>
                        ) : (
                          <span className="text-gray-400 text-[10px] sm:text-[11px]">-</span>
                        )}
                      </td>
                      <td className="px-2 sm:px-2.5 py-1.5 sm:py-2 text-center border-r border-slate-200/80 last:border-r-0">
                        {simulacion.completado && getTotalAttempts(simulacion.id) > 0 ? (
                          <button
                            onClick={() => handleVerGraficas(simulacion)}
                            className={`inline-flex items-center px-1.5 sm:px-2 py-1 text-[9px] sm:text-[10px] font-extrabold rounded-lg border transition-all active:scale-95 touch-manipulation shadow-sm ${
                              getTotalAttempts(simulacion.id) >= 3 
                                ? 'text-indigo-700 bg-indigo-100 hover:bg-indigo-200 border-indigo-200' 
                                : 'text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed opacity-60'
                            }`}
                            title={getTotalAttempts(simulacion.id) >= 3 ? 'Ver análisis gráfico' : `Se requieren al menos 3 intentos para el análisis. Actualmente tienes ${getTotalAttempts(simulacion.id)}.`}
                            disabled={getTotalAttempts(simulacion.id) < 3}
                          >
                            <LineChart className="w-3 h-3 mr-0.5" />
                            Análisis
                          </button>
                        ) : (
                          <span className="text-gray-400 text-[10px] sm:text-[11px]">-</span>
                        )}
                      </td>
                      <td className="px-2 sm:px-3 py-2 text-center border-r border-slate-200/80 last:border-r-0">
                        <div className="text-[11px] sm:text-xs text-gray-900 font-extrabold">
                          {simulacion.completado ? (
                            <div className="space-y-0.5">
                              <div className="font-extrabold text-emerald-600 bg-gradient-to-r from-emerald-100 to-green-100 px-2 py-0.5 rounded-lg border border-emerald-200">
                                {getBestScore(simulacion.id)} %
                              </div>
                              {(() => {
                                const pending = pendingAnswers[simulacion.id];
                                // Mostrar "Parcial" solo si hay pendientes en el intento oficial
                                if (pending && pending.pending > 0) {
                                  return (
                                    <div className="text-[9px] sm:text-[10px] text-amber-600 font-medium flex items-center gap-1">
                                      <span>⏳</span>
                                      <span>Parcial ({pending.pending} pendiente{pending.pending !== 1 ? 's' : ''})</span>
                                    </div>
                                  );
                                }
                                // Mostrar "Mejor de X intentos" solo si no hay pendientes
                                if (getTotalAttempts(simulacion.id) > 1) {
                                  return (
                                    <div className="text-[9px] sm:text-[10px] text-gray-500 font-medium">
                                      Mejor de {getTotalAttempts(simulacion.id)} intentos
                                    </div>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          ) : (
                            <span className="text-gray-400">0 %</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="px-2 sm:px-2.5 py-3 sm:py-4 text-center text-[10px] sm:text-[11px] text-gray-500 font-medium">
                      No hay simulaciones para el mes seleccionado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vista móvil - Cards de simulaciones - Mejoradas */}
        <div className="lg:hidden space-y-4 sm:space-y-5">
          {filteredSimulaciones.length > 0 ? (
            filteredSimulaciones.map((simulacion, index) => (
              <div
                key={simulacion.id}
                className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200/50 shadow-lg p-5 sm:p-6 hover:shadow-xl transition-all duration-300 ring-1 ring-gray-100/50"
              >
                {/* Badge de estado */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-extrabold text-gray-900 text-base sm:text-lg leading-snug tracking-tight mb-1.5">{simulacion.nombre}</h3>
                    {simulacion.descripcion && (
                      <div
                        onClick={() => openLongText(simulacion.nombre, simulacion.descripcion, { tipo: 'simulacion', id: simulacion.id })}
                        className="text-xs sm:text-sm text-gray-600 mb-2.5 leading-relaxed cursor-pointer group"
                      >
                        <p
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            wordBreak: 'break-word',
                            lineHeight: '1.4'
                          }}
                          className="group-hover:text-gray-700 transition-colors"
                        >
                          {simulacion.descripcion}
                        </p>
                        <button
                          onClick={(e) => { e.stopPropagation(); openLongText(simulacion.nombre, simulacion.descripcion, { tipo: 'simulacion', id: simulacion.id }); }}
                          className="mt-1 text-[10px] sm:text-xs text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                        >
                          Ver descripción completa
                        </button>
                      </div>
                    )}
                    <div className="w-16 sm:w-20 h-1.5 bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500 rounded-full mb-3 shadow-sm"></div>
                    <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-2.5">
                      <Calendar className="w-4 h-4 mr-1.5 text-violet-600" />
                      <span className="font-semibold">
                        Límite: {(() => {
                          const d = normalizeDeadlineEndOfDay(simulacion.fechaEntrega);
                          return d ? d.toLocaleDateString('es-ES') : 'Sin límite';
                        })()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" fill="currentColor" />
                      <span className="text-sm sm:text-base font-bold text-gray-900">
                        {simulacion.completado ? (
                          <div className="flex flex-col">
                            <span className="font-extrabold text-emerald-600 bg-gradient-to-r from-emerald-100 to-green-100 px-2 py-0.5 rounded-lg border border-emerald-200">
                              {getBestScore(simulacion.id)} %
                            </span>
                            {(() => {
                              const pending = pendingAnswers[simulacion.id];
                              if (pending && pending.pending > 0) {
                                return (
                                  <span className="text-xs text-amber-600 font-medium mt-0.5 flex items-center gap-1">
                                    <span>⏳</span>
                                    <span>Parcial ({pending.pending} pendiente{pending.pending !== 1 ? 's' : ''})</span>
                                  </span>
                                );
                              }
                              if (getTotalAttempts(simulacion.id) > 1) {
                                return (
                                  <span className="text-xs text-gray-500 font-medium mt-0.5">
                                    Mejor de {getTotalAttempts(simulacion.id)} intentos
                                  </span>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        ) : (
                          <span className="text-gray-400">0 %</span>
                        )}
                      </span>
                    </div>
                  </div>
                  <span className={`text-xs sm:text-sm font-extrabold px-2.5 py-1.5 rounded-xl border-2 ${simulacion.completado ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-600 border-red-200'
                    }`}>
                    {simulacion.completado ? 'Completado' : 'Pendiente'}
                  </span>
                </div>

                {/* Acciones */}
                <div className="mt-4 space-y-2">
                  {isSimulacionAvailable(simulacion) && !simulacion.completado && (
                    <button
                      onClick={() => handleOpenLaunchModal(simulacion)}
                      disabled={launchingSimId === simulacion.id}
                      className={`w-full rounded-xl py-3 px-4 text-sm font-extrabold text-white bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 shadow-lg transition-all flex items-center justify-center gap-2 border-2 border-red-600 active:scale-95 touch-manipulation ${launchingSimId === simulacion.id ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-xl'}`}
                    >
                      <span className="text-lg">🚀</span>
                      {launchingSimId === simulacion.id ? 'Lanzando...' : 'Ejecutar'}
                    </button>
                  )}
                  {simulacion.completado && (
                    <>
                      <button
                        onClick={() => handleOpenLaunchModal(simulacion)}
                        disabled={launchingSimId === simulacion.id}
                        className={`w-full rounded-xl py-3 px-4 text-sm font-extrabold text-white bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg transition-all flex items-center justify-center gap-2 border-2 border-red-600 active:scale-95 touch-manipulation ${launchingSimId === simulacion.id ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-xl'}`}
                      >
                        <span className="text-lg">🔄</span>
                        {launchingSimId === simulacion.id ? 'Lanzando...' : 'Reintentar'}
                      </button>
                      {getTotalAttempts(simulacion.id) > 0 && (
                        <div className="grid grid-cols-2 gap-2.5 mt-2.5">
                          <button
                            onClick={() => handleVerHistorial(simulacion)}
                            className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-3 text-xs font-extrabold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-2 border-indigo-200 transition-all active:scale-95 touch-manipulation shadow-sm"
                          >
                            <FileText className="w-4 h-4" />
                            Historial
                          </button>
                          {getTotalAttempts(simulacion.id) >= 3 && (
                            <button
                              onClick={() => handleVerGraficas(simulacion)}
                              className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-3 text-xs font-extrabold bg-purple-50 text-purple-700 hover:bg-purple-100 border-2 border-purple-200 transition-all active:scale-95 touch-manipulation shadow-sm"
                            >
                              <LineChart className="w-4 h-4" />
                              Gráfico
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                  {!isSimulacionAvailable(simulacion) && !simulacion.completado && (
                    <div className="mt-2 w-full px-4 py-3 bg-gray-100 text-gray-600 rounded-xl text-center text-sm font-bold border-2 border-gray-200">
                      {computeSimEstado(simulacion) === 'vencido' ? 'Simulación Vencida' : (Number(simulacion.totalPreguntas || 0) === 0 ? 'Sin preguntas configuradas' : 'No Disponible')}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200/50 shadow-lg p-8 text-center">
              <Target className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-2">
                No hay simulaciones disponibles
              </h3>
              <p className="text-sm sm:text-base text-gray-600 font-medium">
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
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-3 md:p-4 pt-8 sm:pt-12 md:pt-16">
        <div
          className="bg-white rounded-lg shadow-xl w-full max-w-[92vw] md:max-w-[30rem] lg:max-w-[32rem] xl:max-w-[36rem] max-h-[calc(100vh-10rem)] overflow-hidden flex flex-col transform translate-y-6 sm:translate-y-8 md:translate-x-8 lg:translate-x-0"
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
                    ? new Date(historial.intentos[0].fecha).toLocaleDateString('es-ES')
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
                    {historial.intentos.map((intento, index) => (
                      <div
                        key={intento.id}
                        className="bg-white p-3 rounded-md border border-gray-200 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <div className="w-7 h-7 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-semibold text-[11px] flex-shrink-0">
                            {intento.intent_number || (historial.totalIntentos - index)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 text-sm">
                              Intento {intento.intent_number || (historial.totalIntentos - index)}
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
                            <div className={`font-bold text-base ${intento.puntaje === historial.mejorPuntaje
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
                          <div className={`w-1.5 h-7 rounded-full ${intento.puntaje >= 90 ? 'bg-green-500' :
                            intento.puntaje >= 70 ? 'bg-yellow-500' :
                              intento.puntaje >= 50 ? 'bg-orange-500' : 'bg-red-500'
                            }`}></div>
                          <button
                            onClick={() => {
                              // Usar intent_number del backend o calcular basado en posición
                              const intentoNumero = intento.intent_number || (historial.totalIntentos - index);
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

      {/* Modal para ver descripción completa */}
      {longTextModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 px-2 sm:px-3 lg:px-4 py-4 sm:py-6" onClick={closeLongText}>
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header fijo */}
            <div className="bg-gradient-to-r from-violet-500 to-indigo-600 text-white px-4 py-3 sm:py-4 flex-shrink-0">
              <h2 className="text-base sm:text-lg font-bold break-words" title={longTextModal.title}>{longTextModal.title}</h2>
            </div>
            {/* Contenido con scroll */}
            <div className="flex-1 overflow-y-auto px-4 py-3 sm:p-4 min-h-0">
              <div
                className="text-sm sm:text-base text-gray-800 whitespace-pre-wrap"
                style={{
                  textAlign: 'justify',
                  lineHeight: 1.6,
                  wordBreak: 'break-word'
                }}
              >
                {longTextModal.content}
              </div>
            </div>
            {/* Footer fijo */}
            <div className="px-4 py-3 sm:p-4 border-t border-gray-200 flex-shrink-0 flex justify-end bg-white">
              <button onClick={closeLongText} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors">Cerrar</button>
            </div>
          </div>
        </div>
      )}
      <style>{`
.simulaciones-table-scroll::-webkit-scrollbar { width: 0; height: 0; display: none !important; }
.simulaciones-table-scroll { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `}</style>
    </div>
  );
}

export default Simulaciones_Alumno_comp;