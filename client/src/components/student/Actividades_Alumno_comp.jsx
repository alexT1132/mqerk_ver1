// BACKEND: Componente de Actividades del Alumno
// Este componente maneja la página de actividades y tareas del estudiante con 4 niveles:
// 1. Tarjetas de áreas/módulos/materias
// 2. Lista de materias específicas del área
// 3. Botones de Actividades y Quiz por materia
// 4. Tabla de actividades específicas con funcionalidad completa
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Pagination from '../shared/Pagination.jsx';
import HistorialModal from '../simulaciones/HistorialModal.jsx';
import QuizResultados from '../simulaciones/QuizResultados.jsx';
import { getAreasCatalog } from '../../api/areas';
import { AREAS_CATALOG_CACHE } from '../../utils/catalogCache';
import { styleForArea } from '../common/areaStyles.jsx';
import UnifiedCard from '../common/UnifiedCard.jsx';
import { resumenActividadesEstudiante, crearOReemplazarEntrega, addArchivoEntrega, listArchivosEntrega, deleteArchivoEntrega } from '../../api/actividades';
import { resumenQuizzesEstudiante, crearIntentoQuiz, listIntentosQuizEstudiante, listQuizzes } from '../../api/quizzes';
import { useAuth } from '../../context/AuthContext';
import { useStudent } from '../../context/StudentContext'; // BACKEND: Control de acceso a módulos
import { useStudentNotifications } from '../../context/StudentNotificationContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Upload,
  Eye,
  CheckCircle,
  XCircle,
  Download,
  ArrowLeft,
  BookOpen,
  FileText,
  Brain,
  ChevronDown,
  Star,
  Calendar,
  Trophy,
  Target,
  Sparkles,
  BarChart3,
  Users,
  Award,
  Clock,
  Heart,
  Cog,
  TrendingUp,
  GraduationCap,
  Leaf,
  CheckCircle2,
  AlertTriangle,
  Play,
  Lock,      // BACKEND: Icono para módulos bloqueados
  Send,      // BACKEND: Icono para solicitar acceso
  Globe,     // BACKEND: Icono para Turismo
  Anchor,    // BACKEND: Icono para Militar, Naval y Náutica Mercante
  Hourglass,  // BACKEND: Icono para estado pendiente
  MessageSquareText // BACKEND: Icono para notas del asesor
} from 'lucide-react';

// BACKEND: Resolver URLs absolutas a archivos estáticos del backend (puerto API) evitando 404 al intentar cargar desde 5173
// Usar base relativa por defecto para evitar Mixed Content detrás de túneles HTTPS
const RAW_API_BASE = (import.meta?.env?.VITE_API_URL) || '/api';
const API_ORIGIN = RAW_API_BASE.replace(/\/api\/?$/, '');
const resolveFileUrl = (p) => {
  if (!p) return null;
  if (/^https?:/i.test(p)) return p; // ya es absoluta
  if (p.startsWith('/')) return API_ORIGIN + p; // ruta absoluta en backend
  return API_ORIGIN + '/' + p; // relativa
};

/**
 * BACKEND: Componente de actividades con navegación simple
 * Flujo: áreas/módulos/materias -> botones (actividades/quiz) -> tabla
 */
export function Actividades_Alumno_comp() {
  // Estado para modal de resultados de quiz
  const [showResultadosModal, setShowResultadosModal] = useState(false);
  const [selectedQuizResultados, setSelectedQuizResultados] = useState(null);
  // BACKEND: Contexto para control de acceso a módulos específicos
  const navigate = useNavigate();
  const location = useLocation();
  const {
    allowedActivityAreas,
    activityRequests,
    addAllowedActivityArea,
    requestNewActivityAreaAccess,
    currentCourse,
  } = useStudent();

  // BACKEND: Determinar si el estudiante ya tiene al menos un área permitida
  const hasInitialArea = Array.isArray(allowedActivityAreas) && allowedActivityAreas.length > 0;

  // Estados de navegación (ampliado para módulos específicos)
  const [currentLevel, setCurrentLevel] = useState('areas'); // 'areas', 'modulos', 'buttons', 'table'
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedModulo, setSelectedModulo] = useState(null); // Nuevo estado para módulos específicos
  const [selectedType, setSelectedType] = useState(null); // 'actividades' | 'quiz'

  // Estados para actividades (similar a Feedback)
  const [actividades, setActividades] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);



  const [areasData, setAreasData] = useState([]); // desde API (generales)
  const [modulosEspecificos, setModulosEspecificos] = useState([]); // desde API (modulos)

  // Paginación reutilizable (para quizzes): 10 por página
  const [quizPage, setQuizPage] = useState(1);
  const QUIZ_PAGE_SIZE = 10;
  // Reiniciar a la primera página cuando cambie el filtro de mes o el listado
  useEffect(() => { setQuizPage(1); }, [selectedMonth]);

  // Nota: sorted/paged se calculan después de definir filteredActividades
  /////////////////////////////////////////////////////7

  // Deep-linking: si venimos con una URL, este efecto ajusta el estado para mostrar la vista correcta.
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search || '');
      const level = params.get('level');
      const type = params.get('type');
      const areaIdParam = params.get('areaId');
      const wantsHistorial = params.get('historial') === '1';
      const quizIdParam = params.get('quizId');

      // Si piden explícitamente volver al selector (buttons) y hay área, restaurar a ese nivel
      if (level === 'buttons' && areaIdParam) {
        const areaId = Number(areaIdParam);
        if (Number.isFinite(areaId)) {
          // Detectar por pertenencia al catálogo de módulos (más robusto que umbral de ID)
          const modulo = modulosEspecificos.find(m => m.id === areaId);
          if (modulo) {
            setSelectedArea({ id: 5, titulo: 'Módulos' });
            setSelectedModulo(modulo);
          } else {
            const area = areasData.find(a => a.id === areaId);
            if (area) {
              setSelectedArea(area);
              setSelectedModulo(null);
            }
          }
          setSelectedType(null);
          setCurrentLevel('buttons');
          // Normalizar la URL: quitar type/historial/quizId si vienen arrastrados
          try {
            const paramsNow = new URLSearchParams(location.search || '');
            const hasNoise = paramsNow.has('type') || paramsNow.has('historial') || paramsNow.has('quizId');
            if (hasNoise) {
              paramsNow.set('level', 'buttons');
              paramsNow.set('areaId', String(areaId));
              paramsNow.delete('type');
              paramsNow.delete('historial');
              paramsNow.delete('quizId');
              const qs = paramsNow.toString();
              navigate(`${location.pathname}${qs ? `?${qs}` : ''}`, { replace: true });
            }
          } catch { }
          // En modo selector somos autoritativos: no seguir procesando para evitar forzar la tabla
          setPendingOpenHistorialQuizId(null);
          return;
        }
      }

      // Si no hay parámetros mínimos para tabla (type y areaId), no forzar nada: dejamos el nivel actual o áreas por defecto
      if (!type || !areaIdParam) {
        if (level === 'buttons') {
          // Ya gestionado arriba; no forzamos cambio de nivel
          return;
        }
        if (!level) {
          setCurrentLevel('areas');
          setSelectedArea(null);
          setSelectedModulo(null);
          setSelectedType(null);
        }
        // Continuamos por si hay historial pendiente
      } else {
        // Si hay datos de áreas y módulos cargados, procedemos a establecer el estado.
        if (areasData.length > 0 || modulosEspecificos.length > 0) {
          const areaId = Number(areaIdParam);
          // Detectar módulo por pertenencia al catálogo en vez de por umbral de ID
          const modulo = modulosEspecificos.find(m => m.id === areaId);
          if (modulo) { // Es un módulo específico
            setSelectedArea({ id: 5, titulo: 'Módulos' });
            setSelectedModulo(modulo);
            setSelectedType(type);
            setCurrentLevel('table');
          } else { // Es un área general
            const area = areasData.find(a => a.id === areaId);
            if (area) {
              setSelectedArea(area);
              setSelectedModulo(null); // Nos aseguramos de limpiar el módulo
              setSelectedType(type);
              setCurrentLevel(area.id === 5 ? 'modulos' : 'table');
            }
          }
        }
      }

      // Marcar si debemos reabrir el historial al volver desde resultados
      // Solo si estamos (o vamos a estar) en contexto de tabla de quizzes
      if (wantsHistorial && quizIdParam && level !== 'buttons') {
        const qid = Number(quizIdParam);
        if (Number.isFinite(qid)) {
          setPendingOpenHistorialQuizId(qid);
        }
      } else {
        setPendingOpenHistorialQuizId(null);
      }
    } catch (e) {
      console.error("Error en deep-linking:", e);
    }
    // Este efecto se ejecuta cada vez que cambia la URL o cuando los catálogos de áreas/módulos se terminan de cargar.
  }, [location.search, areasData, modulosEspecificos, navigate]);

  ////////////////////////////////////////////////////////////////////////////////

  // Estados para modales (inspirado en Feedback)
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [entregaArchivos, setEntregaArchivos] = useState([]); // archivos actuales de la entrega seleccionada
  const [selectedActividad, setSelectedActividad] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  // Eliminado modal de edición separado; se usa un único modal para subir / reemplazar
  const [viewingActivityFile, setViewingActivityFile] = useState('');
  const [viewingEntregaArchivos, setViewingEntregaArchivos] = useState([]); // archivos de la entrega para modal de vista
  const [viewingSelectedArchivoId, setViewingSelectedArchivoId] = useState(null);
  const [viewingArchivosLoading, setViewingArchivosLoading] = useState(false);
  const [viewingArchivosError, setViewingArchivosError] = useState('');
  // Multi-upload: lista de archivos seleccionados en el modal
  const [uploadSelectedFiles, setUploadSelectedFiles] = useState([]); // File[]
  const [uploadError, setUploadError] = useState('');
  const [pdfError, setPdfError] = useState(false); // Error de carga de PDF en visor
  // Estados para manejar inline PDF en móviles (detección y fallback)
  const [mobilePdfLoading, setMobilePdfLoading] = useState(false);
  const [mobilePdfFailed, setMobilePdfFailed] = useState(false);
  const [useAltViewer, setUseAltViewer] = useState(false); // visor alterno (Google Docs) en móvil
  // UI: menú de recursos múltiples por actividad
  const [openResourceMenu, setOpenResourceMenu] = useState(null); // (legacy dropdown) mantengo por compatibilidad (ya no se usa)
  const [showResourcesModal, setShowResourcesModal] = useState(false);
  const [resourcesActividad, setResourcesActividad] = useState(null); // actividad seleccionada para recursos
  const [previewRecurso, setPreviewRecurso] = useState(null); // recurso seleccionado para vista previa
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const [previewKey, setPreviewKey] = useState(0); // para forzar recarga
  // Notas del asesor
  const [showNotasModal, setShowNotasModal] = useState(false);
  const [notasActividad, setNotasActividad] = useState(null);
  const [notasContent, setNotasContent] = useState('');

  // Estados para modal de historial de quizzes
  const [showHistorialModal, setShowHistorialModal] = useState(false);
  const [selectedQuizHistorial, setSelectedQuizHistorial] = useState(null);
  // Reapertura automática del Historial tras volver de resultados
  const [pendingOpenHistorialQuizId, setPendingOpenHistorialQuizId] = useState(null);
  // Modal para ver textos largos (instrucciones / descripciones)
  const [longTextModal, setLongTextModal] = useState({ open: false, title: '', content: '', meta: null });
  const openLongText = (title, content, meta = null) => setLongTextModal({ open: true, title, content: String(content || ''), meta });
  const closeLongText = () => setLongTextModal({ open: false, title: '', content: '', meta: null });

  // Estados para efectos visuales (como en Feedback)
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiScore, setConfettiScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);

  // Estados para modales de notificación
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationContent, setNotificationContent] = useState({
    title: '',
    message: '',
    type: 'success' // 'success', 'info', 'warning', 'error'
  });
  // BACKEND: Trigger para refrescar actividades al recibir nueva calificación vía WebSocket
  const { notifications } = useStudentNotifications?.() || {};
  const lastGradeNotifRef = useRef(null);
  const lastAreaAccessNotifRef = useRef(null);
  const [gradeRefreshKey, setGradeRefreshKey] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0); // refresco manual (e.g., al terminar un quiz en otra pestaña)
  useEffect(() => {
    if (!notifications || !Array.isArray(notifications)) return;
    // Asumimos que notifications viene ordenado con la más reciente primero
    const latestGrade = notifications.find(n => n.type === 'grade');
    if (latestGrade && latestGrade.id !== lastGradeNotifRef.current) {
      lastGradeNotifRef.current = latestGrade.id;
      // Refrescar sólo si actualmente estamos viendo actividades
      if (selectedType === 'actividades') {
        setGradeRefreshKey(k => k + 1);
        // Si payload contiene id de actividad y calificación, actualizamos optimísticamente
        // Aceptar formatos: "Calificación: 10" o "Tu entrega fue calificada con 10"
        const calMatch = /(?:Calificación:|calificada\s+con)\s*(\d+)/i.exec(latestGrade.message || '');
        const calValue = calMatch ? parseInt(calMatch[1], 10) : null;
        if (calValue !== null && latestGrade.metadata?.actividadId) {
          // Convertir de escala 0-100 a escala 0-10 (si viene de BD en escala 100)
          const cal10 = calValue > 10 ? calValue / 10 : calValue;
          setActividades(prev => prev.map(a => a.id === latestGrade.metadata.actividadId ? { ...a, score: cal10, mejorPuntaje: cal10, estado: 'revisada' } : a));
        }
      }
    }
  }, [notifications, selectedType]);

  // Escuchar eventos de WebSocket para actualizar lista en tiempo real cuando se crea un nuevo quiz/actividad/simulación
  useEffect(() => {
    const handler = (e) => {
      const data = e.detail;
      if (!data || data.type !== 'notification' || !data.payload) return;
      const payload = data.payload;

      // Si es una notificación de nueva actividad/quiz/simulación asignada
      if (payload.kind === 'assignment') {
        const actividadId = payload.actividad_id || payload.metadata?.actividad_id;
        const simulacionId = payload.simulacion_id || payload.metadata?.simulacion_id;
        // Buscar kind en metadata primero, luego en el mensaje como fallback
        const kind = payload.metadata?.kind || '';
        const messageLower = (payload.message || '').toLowerCase();
        const titleLower = (payload.title || '').toLowerCase();

        // Determinar el tipo de contenido con múltiples verificaciones
        const isQuiz = kind === 'quiz'
          || messageLower.includes('quiz')
          || titleLower.includes('quiz')
          || messageLower.includes('quizz');
        const isSimulacion = kind === 'simulacion'
          || messageLower.includes('simulación')
          || messageLower.includes('simulacion')
          || titleLower.includes('simulación')
          || titleLower.includes('simulacion');
        const isActividad = !isQuiz && !isSimulacion && (actividadId || messageLower.includes('actividad'));

        // Si hay un simulacion_id, es una simulación (no se muestra en actividades/quizzes, pero recargamos por si acaso)
        if (simulacionId) {
          // Las simulaciones tienen su propia página, pero podemos mostrar una notificación
          console.log('[Actividades] Nueva simulación asignada:', simulacionId);
          // No recargamos aquí porque las simulaciones no se muestran en esta vista
        }

        // Recargar si es quiz y estamos viendo quizzes, o si es actividad y estamos viendo actividades
        const shouldRefresh = (isQuiz && selectedType === 'quiz') || (isActividad && selectedType === 'actividades');

        if (shouldRefresh) {
          console.log('[Actividades] Recargando lista por nueva asignación:', {
            isQuiz,
            isActividad,
            selectedType,
            kind,
            actividadId,
            message: payload.message
          });
          // Recargar la lista para mostrar el nuevo quiz/actividad
          setRefreshKey(k => k + 1);
        } else {
          console.debug('[Actividades] No se recargará la lista:', {
            isQuiz,
            isActividad,
            selectedType,
            kind,
            shouldRefresh
          });
        }
      }
    };
    window.addEventListener('student-ws-message', handler);
    return () => window.removeEventListener('student-ws-message', handler);
  }, [selectedType, selectedArea]);

  // Cuando llegue una notificación de acceso a área aprobado, refrescar todo el panel
  useEffect(() => {
    if (!notifications || !Array.isArray(notifications)) return;
    const latestAccess = notifications.find(n => {
      const kind = String(n.kind || n.type || '').toLowerCase();
      const status = String(n.metadata?.status || '').toLowerCase();
      return kind === 'area_access' && status === 'approved';
    });
    if (latestAccess && latestAccess.id !== lastAreaAccessNotifRef.current) {
      lastAreaAccessNotifRef.current = latestAccess.id;
      try {
        const areaName = latestAccess.metadata?.area_name || '';
        showNotification('Acceso aprobado', `Tu acceso al módulo ${areaName} fue aprobado. Ya puedes entrar.`, 'success');
      } catch { }
      // Opcional: disparar un re-render ligero; el contexto ya re-hidrata permisos vía WS
      setRefreshKey((k) => k + 1);
    }
  }, [notifications]);

  // Mantener la URL sincronizada con el contexto (type & areaId) cuando estamos en la tabla
  useEffect(() => {
    try {
      if (currentLevel !== 'table' || !selectedType || !selectedArea) return;
      const areaIdValue = (selectedArea.id === 5) ? (selectedModulo?.id) : selectedArea.id;
      if (!areaIdValue) return;
      const params = new URLSearchParams(location.search || '');
      const curType = params.get('type');
      const curArea = params.get('areaId');
      const expectedType = String(selectedType);
      const expectedArea = String(areaIdValue);
      if (curType === expectedType && curArea === expectedArea) return; // ya sincronizado
      // Importante: al entrar a la vista de tabla eliminamos cualquier rastro de 'level=buttons'
      // para evitar que el deep-link de selector reescriba la URL y nos regrese al selector.
      params.delete('level');
      params.set('type', expectedType);
      params.set('areaId', expectedArea);
      const qs = params.toString();
      navigate(`${location.pathname}${qs ? `?${qs}` : ''}`, { replace: true });
    } catch { /* ignore */ }
  }, [currentLevel, selectedType, selectedArea, selectedModulo, location.pathname]);

  // Escuchar notificación desde la pestaña del quiz al finalizar
  useEffect(() => {
    const onMessage = (e) => {
      try {
        if (!e?.data || e.origin !== window.location.origin) return;
        if (e.data.type === 'QUIZ_FINISHED') {
          showNotification('¡Quiz terminado!', 'Se registraron tus respuestas. Actualizando…', 'success');
          // Traer de nuevo el listado para reflejar estado/completado
          setRefreshKey((k) => k + 1);
          // Opcional: traer foco a esta pestaña
          try { window.focus(); } catch { }
        }
      } catch { /* ignore */ }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  // Cuando el listado está listo y hay un historial pendiente, abrirlo
  useEffect(() => {
    if (!pendingOpenHistorialQuizId) return;
    const quiz = actividades.find(q => Number(q.id) === Number(pendingOpenHistorialQuizId));
    if (quiz) {
      setPendingOpenHistorialQuizId(null);
      handleVerHistorial(quiz);
    }
  }, [pendingOpenHistorialQuizId, actividades]);
  // UI: Reintentos y fallback
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;
  // Altura fija uniforme para tarjetas (áreas y módulos) en todas las resoluciones
  const CARD_HEIGHT_PX = 230; // ajustar si se requiere más espacio

  // Función para obtener el componente de icono basado en el nombre
  const getIconComponent = (iconName) => {
    switch (iconName) {
      case 'BarChart3':
        return <BarChart3 className="w-6 h-6 text-white" />;
      case 'Users':
        return <Users className="w-6 h-6 text-white" />;
      case 'BookOpen':
        return <BookOpen className="w-6 h-6 text-white" />;
      case 'Heart':
        return <Heart className="w-6 h-6 text-white" />;
      case 'Cog':
        return <Cog className="w-6 h-6 text-white" />;
      case 'TrendingUp':
        return <TrendingUp className="w-6 h-6 text-white" />;
      case 'GraduationCap':
        return <GraduationCap className="w-6 h-6 text-white" />;
      case 'Leaf':
        return <Leaf className="w-6 h-6 text-white" />;
      case 'Globe':
        return <Globe className="w-6 h-6 text-white" />;
      case 'Anchor':
        return <Anchor className="w-6 h-6 text-white" />;
      case 'Award':
        return <Award className="w-6 h-6 text-white" />;
      case 'Target':
        return <Target className="w-6 h-6 text-white" />;
      default:
        return <BookOpen className="w-6 h-6 text-white" />;
    }
  };


  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [catalogError, setCatalogError] = useState('');
  // Usar styleForArea compartido
  const styleFor = styleForArea;

  useEffect(() => {
    let cancel = false;
    const fromCache = AREAS_CATALOG_CACHE.get();
    if (fromCache?.data) {
      const payload = fromCache.data;
      const generales = Array.isArray(payload.generales) ? payload.generales : [];
      const modulos = Array.isArray(payload.modulos) ? payload.modulos : [];
      const mappedGenerales = generales.map(a => ({ id: a.id, titulo: a.nombre, descripcion: a.descripcion, ...styleFor(a.id) }));
      if (payload.contenedor) {
        mappedGenerales.push({ id: payload.contenedor.id, titulo: payload.contenedor.nombre, descripcion: payload.contenedor.descripcion, ...styleFor(payload.contenedor.id) });
      }
      setAreasData(mappedGenerales);
      setModulosEspecificos(modulos.map(m => ({ id: m.id, titulo: m.nombre, descripcion: m.descripcion, ...styleFor(m.id) })));
      // Si está fresco y no stale evitamos refetch
      if (!fromCache.stale) return; // stale-while-revalidate: mostramos y luego revalidamos abajo
    }
    const load = async (silent = false) => {
      if (!silent) { setLoadingCatalog(true); setCatalogError(''); }
      try {
        const res = await getAreasCatalog();
        const payload = res.data?.data || res.data || {};
        AREAS_CATALOG_CACHE.set(payload);
        const generales = Array.isArray(payload.generales) ? payload.generales : [];
        const modulos = Array.isArray(payload.modulos) ? payload.modulos : [];
        if (cancel) return;
        const mappedGenerales = generales.map(a => ({ id: a.id, titulo: a.nombre, descripcion: a.descripcion, ...styleFor(a.id) }));
        if (payload.contenedor) {
          mappedGenerales.push({ id: payload.contenedor.id, titulo: payload.contenedor.nombre, descripcion: payload.contenedor.descripcion, ...styleFor(payload.contenedor.id) });
        }
        setAreasData(mappedGenerales);
        setModulosEspecificos(modulos.map(m => ({ id: m.id, titulo: m.nombre, descripcion: m.descripcion, ...styleFor(m.id) })));
      } catch (e) { if (!cancel) { setCatalogError('No se pudo cargar catálogo de áreas'); } }
      finally { if (!cancel) setLoadingCatalog(false); }
    };
    // Si venía de cache y era stale, revalidar en segundo plano (silent true)
    load(fromCache?.data ? true : false);
    return () => { cancel = true; };
  }, []);

  // Datos reales se cargarán desde la API según área y tipo seleccionado
  const { user, alumno } = useAuth() || {}; // usar alumno.id cuando exista
  const estudianteId = alumno?.id || user?.id_estudiante || user?.id || null;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Hook para detectar si es móvil (debe declararse antes de cualquier uso en efectos)
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  const isTablet = typeof window !== 'undefined' ? (window.innerWidth >= 768 && window.innerWidth < 1024) : false;
  const isLandscape = typeof window !== 'undefined' ? window.innerWidth > window.innerHeight : false;

  // Ancho óptimo de lectura (número de caracteres por línea)
  // Ajuste: en tablet landscape usar líneas más cortas para mejor legibilidad
  const descMaxCh = isMobile
    ? '44ch'
    : (isTablet ? (isLandscape ? '46ch' : '50ch') : '62ch');

  // Ancho del modal según dispositivo/orientación (más estrecho en tablet landscape)
  // Modal de instrucciones: hacerlo más compacto y aprovechar mejor el ancho disponible
  const modalWidth = isMobile
    ? '88vw'
    : (isTablet
      ? (isLandscape ? 'min(560px, 60vw)' : 'min(600px, 64vw)')
      // Escritorio y pantallas muy grandes: aún más compacto
      : 'min(480px, 30vw)');
  const modalOffsetX = 0; // centrar sin desplazamiento lateral para evitar márgenes innecesarios

  // Meses como ordinales (como en Feedback)
  const months = [
    'Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto', 'Sexto',
    'Séptimo', 'Octavo',
  ];

  // Si no hay curso seleccionado, inferir una fecha de inicio a partir de la lista cargada
  const inferredStartDate = useMemo(() => {
    try {
      const dates = (actividades || [])
        .map(a => a?.fechaEntrega)
        .filter(Boolean)
        .map(d => {
          const dt = new Date(d);
          return Number.isNaN(dt.getTime()) ? null : dt;
        })
        .filter(Boolean);
      if (!dates.length) return null;
      // earliest date
      let min = dates[0];
      for (const dt of dates) if (dt.getTime() < min.getTime()) min = dt;
      return min;
    } catch {
      return null;
    }
  }, [actividades]);

  // Helper: parse YYYY-MM-DD or ISO to a local Date without timezone shifts
  const parseLocalYMD = (s) => {
    if (!s) return null;
    try {
      if (typeof s === 'string') {
        const m = s.trim().match(/^(\d{4})[-\/]?(\d{2})[-\/]?(\d{2})/);
        if (m) {
          const y = parseInt(m[1], 10);
          const mo = parseInt(m[2], 10) - 1;
          const d = parseInt(m[3], 10);
          return new Date(y, mo, d);
        }
      }
      const dt = new Date(s);
      return Number.isNaN(dt.getTime()) ? null : dt;
    } catch {
      return null;
    }
  };

  // Map a due date to the ordinal academic month index (0..7) relative to course start
  const computeOrdinalMonthIndex = (dueDateStr) => {
    const startStr = currentCourse?.startDate || currentCourse?.enrollmentDate || null;
    if (!dueDateStr) return null;
    const start = startStr ? parseLocalYMD(startStr) : (inferredStartDate || null);
    const due = parseLocalYMD(dueDateStr);
    if (!start || !due) return null;
    // Calculate months difference ignoring days first
    let monthsDiff = (due.getFullYear() - start.getFullYear()) * 12 + (due.getMonth() - start.getMonth());
    // If due day is before start day within the month, consider it still in previous month bucket
    if (due.getDate() < start.getDate()) monthsDiff -= 1;
    if (monthsDiff < 0) return null; // before course start
    return monthsDiff;
  };

  // BACKEND: Inicializar con al menos un área permitida si es el primer acceso
  useEffect(() => {
    if (allowedActivityAreas.length === 0) {
      // Si es la primera vez, agregar automáticamente el área de Ciencias Exactas
      addAllowedActivityArea(1);
    }
  }, [allowedActivityAreas.length, addAllowedActivityArea]);

  // Cargar resumen de actividades/quizzes desde la API según el tipo seleccionado
  useEffect(() => {
    const fetchData = async () => {
      // Nota: Para quizzes podemos cargar catálogo aun sin estudianteId.
      // Por eso solo exigimos tipo y área seleccionados.
      if (!selectedType || !selectedArea) return;
      setLoading(true); setError('');
      try {
        if (selectedType === 'actividades') {
          if (!estudianteId) { setActividades([]); setLoading(false); return; }
          const { data } = await resumenActividadesEstudiante(estudianteId);
          const rows = (data?.data || data || []).filter(a => {
            if (!a.id_area) return false; // ocultar actividades sin área asignada para evitar mezclar materias
            if (selectedArea.id === 5) { // contenedor de módulos específicos
              if (!selectedModulo) return false; // aún no se eligió uno
              return a.id_area === selectedModulo.id; // coincide con módulo específico 101..112
            }
            return a.id_area === selectedArea.id; // áreas generales 1..4
          });
          const mapped = rows.map(r => {
            // Parsear recursos_json (nuevo campo que reemplaza a 'plantilla')
            let recursos = [];
            if (r.recursos_json) {
              try {
                recursos = typeof r.recursos_json === 'string' ? JSON.parse(r.recursos_json) : r.recursos_json;
                if (!Array.isArray(recursos)) recursos = [];
              } catch { recursos = []; }
            }
            const firstRecurso = recursos[0];
            const cal = r.calificacion ?? r.entrega_calificacion ?? null;
            const estadoCalc = (r.estado_revision || r.entrega_estado || 'pendiente');
            // Normalizar el valor de permite_editar_despues_calificada
            const permiteEditar = r.permite_editar_despues_calificada === 1 || 
                                  r.permite_editar_despues_calificada === true || 
                                  r.permite_editar_despues_calificada === '1' ||
                                  String(r.permite_editar_despues_calificada) === '1';
            return {
              id: r.id,
              nombre: r.titulo,
              descripcion: r.descripcion || '',
              // Usar fecha límite efectiva si existe (con extensiones), sino usar la fecha límite base
              fechaEntrega: r.fecha_limite_efectiva || r.fecha_limite,
              fecha_limite_original: r.fecha_limite, // Guardar fecha original para comparar
              fechaSubida: r.entrega_estado ? (r.entregada_at ? new Date(r.entregada_at).toISOString().split('T')[0] : null) : null,
              archivo: r.archivo || null,
              entregada: !!r.entrega_estado,
              // Convertir calificación de escala 0-100 (BD) a escala 0-10 (UI)
              score: cal !== null && cal !== undefined ? (cal > 10 ? cal / 10 : cal) : null,
              maxScore: r.puntos_max || 100,
              estado: cal !== null ? 'revisada' : estadoCalc,
              areaId: r.id_area,
              tipo: 'actividades',
              intentos: [],
              totalIntentos: r.version || (r.entrega_estado ? 1 : 0),
              mejorPuntaje: cal,
              permite_editar_despues_calificada: permiteEditar,
              // Compatibilidad: usamos 'plantilla' para mostrar el botón de descarga con el primer recurso
              plantilla: r.plantilla || (firstRecurso ? firstRecurso.archivo : null),
              recursos,
              entrega_id: r.entrega_id || r.entregaId || null,
              // Notas del asesor si existen en la respuesta
              notas:
                r.entrega_notas ||
                r.entrega_comentarios ||
                r.comentarios ||
                r.observaciones ||
                r.retroalimentacion ||
                '',
              notas_at: r.entrega_notas_updated_at || r.revisada_at || null,
            };
          });
          setActividades(mapped);
        } else if (selectedType === 'quiz') {
          // Traer resumen por estudiante y catálogo global de quizzes en paralelo
          // IMPORTANTE: Cuando el backend ya filtra por áreas permitidas del estudiante,
          // no debemos filtrar por id_area aquí para evitar ocultar quizzes que deberían estar visibles.
          // El backend en listQuizzes ya filtra correctamente por áreas permitidas del estudiante.
          // Solo filtrar por área si el usuario explícitamente seleccionó un área específica en la UI.
          const idAreaQuery = selectedArea.id === 5 ? (selectedModulo?.id || undefined) : selectedArea.id;
          console.debug('[Quizzes] Cargando quizzes para área:', selectedArea.id, 'módulo:', selectedModulo?.id, 'query id_area:', idAreaQuery);
          // Nota: Pasamos id_area al backend, pero el backend también filtra por áreas permitidas del estudiante
          // El backend ya hace el trabajo pesado de filtrar por permisos, así que confiamos en él
          const [resResumen, resCatalog] = await Promise.allSettled([
            estudianteId ? resumenQuizzesEstudiante(estudianteId) : Promise.resolve({ data: { data: [] } }),
            listQuizzes(idAreaQuery ? { id_area: idAreaQuery } : {})
          ]);
          const resumenRows = resResumen.status === 'fulfilled' ? (resResumen.value?.data?.data || resResumen.value?.data || []) : [];
          const catalogRows = resCatalog.status === 'fulfilled' ? (resCatalog.value?.data?.data || resCatalog.value?.data || []) : [];
          console.debug('[Quizzes] Resumen recibido:', resumenRows.length, 'catálogo recibido:', catalogRows.length);

          // Índice de resumen por id quiz para mergear métricas del alumno
          const resumenById = resumenRows.reduce((acc, q) => { acc[q.id] = q; return acc; }, {});

          // Fuente base: si hay catálogo, usarlo; si no, usar el resumen directamente
          let baseRows = catalogRows.length ? catalogRows : resumenRows;
          console.debug('[Quizzes] Filas base antes de filtrar duplicados:', baseRows.length);
          console.debug('[Quizzes] IDs de quizzes base:', baseRows.map(q => ({ id: q.id, titulo: q.titulo, id_area: q.id_area })));

          // Eliminar duplicados por ID (por si algún quiz aparece en ambas fuentes)
          const seenIds = new Set();
          baseRows = baseRows.filter(q => {
            if (!q?.id) return false;
            if (seenIds.has(q.id)) return false;
            seenIds.add(q.id);
            return true;
          });
          console.debug('[Quizzes] Filas base después de filtrar duplicados:', baseRows.length);

          // Filtrado por área/módulo seleccionado
          // NOTA: El backend ya filtró por áreas permitidas del estudiante, así que los quizzes
          // que lleguen aquí ya son visibles para el estudiante. Solo filtramos por la UI
          // del área seleccionada para mantener la consistencia visual.
          const rows = baseRows.filter(q => {
            const id_area = q.id_area;

            // Si el quiz no tiene área asignada, solo mostrarlo si estamos viendo "Todas las áreas"
            // (pero como estamos en una vista de área específica, normalmente lo ocultamos)
            if (!id_area) {
              console.debug('[Quizzes] Quiz sin área:', q.id, q.titulo);
              // Permitir mostrar quizzes sin área solo si no hay área seleccionada específica
              // En la práctica, si estamos viendo quizzes, hay un área seleccionada, así que los ocultamos
              return false;
            }

            // Si estamos viendo módulos específicos (selectedArea.id === 5)
            if (selectedArea.id === 5) {
              if (!selectedModulo) {
                // Si no hay módulo seleccionado, no mostrar ningún quiz (esperando selección)
                return false;
              }
              // Coincidir con el módulo específico
              const matches = id_area === selectedModulo.id;
              if (!matches) {
                console.debug('[Quizzes] Quiz no coincide con módulo:', {
                  quiz_id: q.id,
                  quiz_titulo: q.titulo,
                  quiz_id_area: id_area,
                  modulo_esperado: selectedModulo.id,
                  modulo_titulo: selectedModulo.titulo
                });
              }
              return matches;
            }

            // Para áreas generales (1-4), coincidir con el área seleccionada
            const matches = id_area === selectedArea.id;
            if (!matches) {
              console.debug('[Quizzes] Quiz no coincide con área:', {
                quiz_id: q.id,
                quiz_titulo: q.titulo,
                quiz_id_area: id_area,
                area_esperada: selectedArea.id,
                area_titulo: selectedArea.titulo
              });
            }
            return matches;
          });

          console.debug('[Quizzes] Filas después de filtrar por área:', rows.length);

          // Eliminar datos mock: si no hay filas, se mostrará tabla vacía o estado vacío.
          const mapped = rows.map(q => {
            const r = resumenById[q.id] || q; // r contiene métricas si existen
            const total_intentos = Number(r.total_intentos || 0);
            // Regla: el primer intento es el oficial para calificación
            const oficial_puntaje = (r.oficial_puntaje != null ? Number(r.oficial_puntaje) : null);
            const ultimo_puntaje = (r.ultimo_puntaje != null ? Number(r.ultimo_puntaje) : null);
            const mejor_puntaje = (r.mejor_puntaje != null ? Number(r.mejor_puntaje) : null);
            const fecha_limite = q.fecha_limite || q.fechaEntrega || null;
            const now = new Date();
            const due = normalizeDeadlineEndOfDay(fecha_limite);
            const within = due ? now <= due : true;
            // Intentos máximos: null o 0 => sin límite (∞)
            const unlimited = q.max_intentos == null || Number(q.max_intentos) === 0;
            const max_intentos_value = unlimited ? Number.POSITIVE_INFINITY : Number(q.max_intentos);
            const max_intentos_label = unlimited ? '∞' : max_intentos_value;
            // Estado visual esperado por la tabla: 'disponible' (quedan intentos) | 'completado' (sin intentos) | 'vencido'
            const estadoQuiz = (total_intentos >= max_intentos_value)
              ? 'completado'
              : (within ? 'disponible' : 'vencido');
            return {
              id: q.id,
              nombre: q.titulo,
              descripcion: q.descripcion || '',
              fechaEntrega: fecha_limite,
              fechaSubida: null,
              archivo: null,
              entregada: total_intentos > 0,
              score: (oficial_puntaje != null ? oficial_puntaje : ultimo_puntaje),
              maxScore: q.puntos_max || 100,
              estado: estadoQuiz,
              // defaults para evitar textos "undefined" en la UI
              tiempoLimite: (() => {
                const tl = Number(q.time_limit_min);
                if (!Number.isFinite(tl) || tl <= 0) return null;
                const hh = Math.floor(tl / 60), mm = tl % 60;
                if (hh > 0 && mm > 0) return `${hh} h ${mm} min`;
                if (hh > 0) return `${hh} h`;
                return `${mm} min`;
              })(),
              // Mostrar '∞' cuando sea ilimitado
              maxIntentos: max_intentos_label,
              // Valor numérico para la lógica
              maxIntentosValue: max_intentos_value,
              areaId: q.id_area,
              tipo: 'quiz',
              intentos: [],
              totalIntentos: total_intentos,
              completado: total_intentos >= max_intentos_value,
              mejorPuntaje: mejor_puntaje,
              plantilla: null
            };
          });
          setActividades(mapped);
        }
      } catch (e) {
        console.error(e);
        setError('Error cargando datos');
        if (retryCount < MAX_RETRIES) {
          setRetryCount(c => c + 1);
        }
      } finally { setLoading(false); }
    };
    fetchData();
  }, [estudianteId, selectedType, selectedArea, retryCount, gradeRefreshKey, refreshKey]);

  // Efecto: cuando cambia el PDF a visualizar en móvil intentamos inline y medimos si carga
  useEffect(() => {
    if (!showViewModal) return;
    if (!isMobile) return; // sólo móviles
    if (!viewingActivityFile) return;
    setMobilePdfLoading(true); setMobilePdfFailed(false);
    const timer = setTimeout(() => {
      // Si después de 3s no terminó onLoad asumimos que fallará inline
      setMobilePdfLoading(l => {
        if (l) { setMobilePdfFailed(true); return false; }
        return l;
      });
    }, 3000);
    return () => clearTimeout(timer);
  }, [viewingActivityFile, showViewModal, isMobile]);

  const manualRetry = () => { setRetryCount(c => c + 1); };

  // Notas: helpers para abrir/cerrar modal
  const openNotasModal = (actividad) => {
    const contenido = actividad?.notas || '';
    setNotasActividad(actividad || null);
    setNotasContent(String(contenido || ''));
    setShowNotasModal(true);

    // Marcar como visto: guardar timestamp visto para esta actividad
    try {
      if (actividad?.id) {
        const key = `notas_seen_${actividad.id}`;
        const nowIso = new Date().toISOString();
        localStorage.setItem(key, nowIso);
      }
    } catch { }
  };
  const closeNotasModal = () => { setShowNotasModal(false); setNotasActividad(null); setNotasContent(''); };

  // Efecto para calcular el puntaje total (como en Feedback)
  useEffect(() => {
    const calculatedTotal = actividades.reduce((sum, actividad) => sum + (actividad.score || 0), 0);
    setTotalScore(calculatedTotal);
  }, [actividades]);

  // Enriquecer calificaciones faltantes: algunas actividades entregadas vienen sin calificación;
  // consultamos el endpoint de entregas para obtenerla.
  const gradeEnrichmentRef = useRef(false);
  useEffect(() => {
    if (gradeEnrichmentRef.current) return; // evitar reentradas mientras corre
    if (!estudianteId) return;
    const missing = actividades.filter(a => selectedType === 'actividades' && a.entregada && (a.score === null || a.score === undefined));
    if (missing.length === 0) return;
    gradeEnrichmentRef.current = true;
    (async () => {
      try {
        const mod = await import('../../api/actividades');
        const fetchOne = async (act) => {
          try {
            const resp = await mod.listEntregasActividad(act.id);
            const list = Array.isArray(resp.data?.data) ? resp.data.data : [];
            const mine = list.find(e => String(e.id_estudiante) === String(estudianteId));
            if (mine && (mine.calificacion !== null && mine.calificacion !== undefined)) {
              // Convertir de escala 0-100 a escala 0-10
              const cal10 = mine.calificacion > 10 ? mine.calificacion / 10 : mine.calificacion;
              setActividades(prev => prev.map(p => p.id === act.id ? {
                ...p,
                score: cal10,
                mejorPuntaje: cal10,
                estado: 'revisada',
                notas: mine.notas || mine.comentarios || mine.observaciones || mine.retroalimentacion || p.notas || '',
                notas_at: mine.updated_at || p.notas_at || null
              } : p));
            }
          } catch { /* silencioso */ }
        };
        // Limitar concurrencia básica
        for (const act of missing) { // pequeño retardo para no saturar
          // eslint-disable-next-line no-await-in-loop
          await fetchOne(act);
        }
      } finally { gradeEnrichmentRef.current = false; }
    })();
  }, [actividades, estudianteId, selectedType]);

  // Polling ligero para casos donde el docente califica después de que el alumno ya abrió la vista y no llegó notificación.
  useEffect(() => {
    if (selectedType !== 'actividades') return;
    if (!estudianteId) return;
    const hasMissing = actividades.some(a => a.entregada && (a.score === null || a.score === undefined));
    if (!hasMissing) return; // nada que hacer
    const interval = setInterval(async () => {
      // Cada 12s reconsulta solo las actividades aún sin score
      const pending = actividades.filter(a => a.entregada && (a.score === null || a.score === undefined));
      if (pending.length === 0) return;
      try {
        const mod = await import('../../api/actividades');
        for (const act of pending) { // eslint-disable-next-line no-await-in-loop
          try {
            const resp = await mod.listEntregasActividad(act.id);
            const list = Array.isArray(resp.data?.data) ? resp.data.data : [];
            const mine = list.find(e => String(e.id_estudiante) === String(estudianteId));
            if (mine && (mine.calificacion !== null && mine.calificacion !== undefined)) {
              // Convertir de escala 0-100 a escala 0-10
              const cal10 = mine.calificacion > 10 ? mine.calificacion / 10 : mine.calificacion;
              setActividades(prev => prev.map(p => p.id === act.id ? {
                ...p,
                score: cal10,
                mejorPuntaje: cal10,
                estado: 'revisada',
                notas: mine.notas || mine.comentarios || mine.observaciones || mine.retroalimentacion || p.notas || '',
                notas_at: mine.updated_at || p.notas_at || null
              } : p));
            }
          } catch {/* ignore */ }
        }
      } catch {/* ignore */ }
    }, 12000); // 12s balancea frescura y carga
    return () => clearInterval(interval);
  }, [actividades, selectedType, estudianteId]);

  // Estados y detección para optimizar vista móvil de PDFs y listas de archivos
  const [showMobileFileList, setShowMobileFileList] = useState(false); // toggle de lista lateral en móviles
  const [canInlinePdf, setCanInlinePdf] = useState(true); // heurística simple de si podemos intentar inline
  useEffect(() => {
    if (!isMobile) { setCanInlinePdf(true); return; }
    try {
      const ua = navigator.userAgent || '';
      // Heurísticas básicas donde el inline PDF suele fallar o es incómodo
      if (/FBAN|FBAV|Instagram|Line\//i.test(ua)) { setCanInlinePdf(false); return; }
      // WebView genéricas
      if (/wv\)/i.test(ua)) { setCanInlinePdf(false); return; }
      // Por defecto permitir
      setCanInlinePdf(true);
    } catch { setCanInlinePdf(true); }
  }, [isMobile]);

  // Función para manejar la selección de área/materia
  const handleSelectArea = (area) => {
    setSelectedArea(area);
    try { if (area?.id) localStorage.setItem('lastAreaId', String(area.id)); } catch { /* ignore */ }
    if (area.id === 5) { // Módulos específicos
      setCurrentLevel('modulos');
    } else {
      setCurrentLevel('buttons'); // Ir directamente a los botones para otras áreas
      // Sincronizar URL para permitir refresh conservando el selector
      try {
        const params = new URLSearchParams(location.search || '');
        params.set('level', 'buttons');
        params.set('areaId', String(area.id));
        params.delete('type');
        params.delete('historial');
        params.delete('quizId');
        const qs = params.toString();
        navigate(`${location.pathname}${qs ? `?${qs}` : ''}`, { replace: true });
      } catch { /* ignore */ }
    }
  };

  // BACKEND: Función para manejar la selección de módulo específico con control de acceso
  const handleSelectModulo = (modulo) => {
    // Enforce real access: solo entrar si el módulo está permitido
    if (allowedActivityAreas.includes(modulo.id)) {
      setSelectedModulo(modulo);
      setCurrentLevel('buttons');
      try { if (modulo?.id) localStorage.setItem('lastAreaId', String(modulo.id)); } catch { /* ignore */ }
      // Sincronizar URL para permitir refresh conservando el selector
      try {
        const params = new URLSearchParams(location.search || '');
        params.set('level', 'buttons');
        params.set('areaId', String(modulo.id));
        params.delete('type');
        params.delete('historial');
        params.delete('quizId');
        const qs = params.toString();
        navigate(`${location.pathname}${qs ? `?${qs}` : ''}`, { replace: true });
      } catch { /* ignore */ }
    } else {
      // Si no está permitido, no navegar; la tarjeta bloqueada ofrece solicitar acceso
      showNotification(
        'Acceso restringido',
        'Debes solicitar acceso y esperar aprobación del asesor para entrar a este módulo.',
        'warning'
      );
    }
  };



  // //--- SOLUCIÓN DEFINITIVA DE NAVEGACIÓN ---
  // useEffect(() => {
  //   const params = new URLSearchParams(location.search);
  //   const typeFromUrl = params.get('type');
  //   const areaIdFromUrl = params.get('areaId');

  //   // CASO 1: La URL tiene parámetros, pero el componente no está mostrando la tabla.
  //   // Esto pasa cuando vienes de "Volver" o cargas la URL directamente.
  //   if (typeFromUrl && areaIdFromUrl && currentLevel !== 'table') {
  //     // Esperamos a que los datos del catálogo estén listos antes de hacer nada.
  //     if (areasData.length > 0 || modulosEspecificos.length > 0) {
  //       const areaId = Number(areaIdFromUrl);
  //       const area = areasData.find(a => a.id === areaId);
  //       if (area) {
  //         setSelectedArea(area);
  //         setSelectedType(typeFromUrl);
  //         setCurrentLevel('table'); // Forzamos la vista de tabla
  //       }
  //     }
  //     return; // Evita que se ejecute más lógica
  //   }

  //   // CASO 2: El estado interno dice que debemos estar en una tabla (ej. hiciste clic en "Quizzes").
  //   // Nos aseguramos de que la URL lo refleje.
  //   if (currentLevel === 'table' && selectedType && selectedArea) {
  //     const expectedSearch = `?type=${selectedType}&areaId=${selectedArea.id}`;
  //     if (location.search !== expectedSearch) {
  //       navigate(location.pathname + expectedSearch, { replace: true });
  //     }
  //     return;
  //   }

  //   // CASO 3: El estado interno es el principal ("areas") pero la URL aún tiene parámetros.
  //   // Limpiamos la URL para que coincida con la vista.
  //   if (currentLevel === 'areas' && location.search) {
  //     navigate(location.pathname, { replace: true });
  //   }
  // }, [
  //   location.search,
  //   currentLevel,
  //   selectedType,
  //   selectedArea,
  //   areasData,
  //   modulosEspecificos,
  //   navigate
  // ]);

  // Nota: Se eliminó un segundo efecto de deep-linking redundante que forzaba
  // volver a 'areas' cuando no había parámetros en la URL. Ese efecto
  // interfería con la navegación interna (por ejemplo, al seleccionar un área
  // o un módulo, que no actualiza inmediatamente la URL) y "rebotaba" la vista
  // impidiendo avanzar a botones/tabla. Conservamos únicamente el efecto de
  // deep-linking declarado más arriba, que ya sincroniza correctamente el
  // estado con la URL cuando es necesario.
  // Función para mostrar notificaciones modales
  const showNotification = (title, message, type = 'success') => {
    setNotificationContent({ title, message, type });
    setShowNotificationModal(true);
  };

  const closeNotificationModal = () => {
    setShowNotificationModal(false);
    setNotificationContent({ title: '', message: '', type: 'success' });
  };

  // BACKEND: Función para manejar la solicitud de acceso a un nuevo módulo
  const handleRequestAccess = (moduloId) => {
    // Evitar enviar múltiples solicitudes para la misma área
    if (activityRequests.some(req => req.areaId === moduloId)) {
      showNotification(
        'Solicitud ya enviada',
        'Ya has enviado una solicitud para esta área.',
        'warning'
      );
      return;
    }
    requestNewActivityAreaAccess(moduloId);
    showNotification(
      'Solicitud enviada',
      'Tu solicitud de acceso ha sido enviada. Recibirás una notificación cuando sea aprobada.',
      'success'
    );
  };

  // BACKEND: Función para manejar la primera selección de área del estudiante
  const handleInitialAreaSelection = (moduloId) => {
    addAllowedActivityArea(moduloId);
    showNotification(
      '¡Área seleccionada!',
      'Ahora tienes acceso a estas actividades.',
      'success'
    );
  };

  // Función para manejar la selección de tipo (actividades/quiz)
  const handleSelectType = (type) => {
    setSelectedType(type);
    setCurrentLevel('table');
    // Sincronizar URL: pasar de level=buttons a vista de tabla
    try {
      const params = new URLSearchParams(location.search || '');
      // Determinar área actual (general o módulo)
      const areaIdValue = (selectedArea?.id === 5) ? (selectedModulo?.id) : (selectedArea?.id);
      if (areaIdValue) params.set('areaId', String(areaIdValue));
      params.set('type', String(type));
      // Al entrar a tabla, quitar level/historial/quizId
      params.delete('level');
      params.delete('historial');
      params.delete('quizId');
      const qs = params.toString();
      navigate(`${location.pathname}${qs ? `?${qs}` : ''}`, { replace: true });
    } catch { /* ignore */ }
    // Para actividades el efecto useEffect hará la carga real.
    // quizzes se cargan en efecto general
  };

  // Cooldown para evitar doble navegación con la flecha (doble click)
  const backCooldownRef = useRef(0);

  // Función para regresar al nivel anterior (determinística, sin depender del historial)
  const handleGoBack = () => {
    const now = Date.now();
    if (now - (backCooldownRef.current || 0) < 600) return; // ignorar clicks en ráfaga
    backCooldownRef.current = now;
    try {
      if (currentLevel === 'table') {
        // Volver al selector "Actividades y Quizzes" del área/módulo actual
        // Cerrar modal de historial si estuviera abierto
        try {
          setShowHistorialModal(false);
          setSelectedQuizHistorial(null);
          setPendingOpenHistorialQuizId(null);
        } catch { }
        setCurrentLevel('buttons');
        const params = new URLSearchParams(location.search || '');
        const areaIdValue = (selectedArea?.id === 5) ? (selectedModulo?.id) : selectedArea?.id;
        // Siempre marcar que volvemos al selector
        params.set('level', 'buttons');
        // Si conocemos el área o módulo, preservarlo en la URL
        if (areaIdValue) params.set('areaId', String(areaIdValue));
        // Quitamos 'type' para que muestre selector
        params.delete('type');
        // Limpiamos flags de reapertura de historial
        params.delete('historial');
        params.delete('quizId');
        const qs = params.toString();
        navigate(`${location.pathname}${qs ? `?${qs}` : ''}`, { replace: true });
        return;
      }

      if (currentLevel === 'buttons') {
        // Volver al listado de áreas principal
        setCurrentLevel('areas');
        setSelectedArea(null);
        setSelectedModulo(null);
        setSelectedType(null);
        // Mantener navegación estable en la misma ruta base
        navigate('/alumno/actividades', { replace: true });
        return;
      }

      if (currentLevel === 'modulos') {
        // Desde "Módulos Específicos" volver al listado de áreas
        setCurrentLevel('areas');
        setSelectedArea(null);
        setSelectedModulo(null);
        setSelectedType(null);
        navigate('/alumno/actividades', { replace: true });
        return;
      }

      // Cualquier otro estado: ir a la portada de Actividades
      navigate('/alumno/actividades', { replace: true });
    } catch {
      navigate('/alumno/actividades', { replace: true });
    }
  };

  // Función para manejar subida multi-archivo
  const handleFileUpload = async (actividadId, files) => {
    if (!files || !files.length) { showNotification('Sin archivos', 'Selecciona al menos un PDF.', 'warning'); return; }
    if (!Array.isArray(files)) files = [files];
    // Validaciones ya se hacen previo, pero reforzamos
    let totalBytes = 0;
    for (const f of files) {
      if (f.type !== 'application/pdf') { showNotification('Solo PDF', `El archivo ${f.name} no es PDF.`, 'warning'); return; }
      if (f.size > MAX_FILE_SIZE_BYTES) { showNotification('Archivo grande', `${f.name} supera 5MB.`, 'warning'); return; }
      totalBytes += f.size;
    }
    if (totalBytes > MAX_TOTAL_BYTES) { showNotification('Límite excedido', 'Los archivos combinados superan 20MB.', 'warning'); return; }
    if (!estudianteId) { showNotification('Sesión requerida', 'No se encontró ID de estudiante', 'error'); return; }
    const esTipoActividad = selectedType === 'actividades';
    try {
      if (esTipoActividad) {
        const fd = new FormData();
        files.forEach(f => fd.append('archivos', f));
        fd.append('id_estudiante', estudianteId);
        if (selectedActividad?.entrega_id) {
          await addArchivoEntrega(selectedActividad.entrega_id, fd);
        } else {
          await crearOReemplazarEntrega(actividadId, fd);
        }
        // refrescar lista actividades
        const { data } = await resumenActividadesEstudiante(estudianteId);
        const rows = (data?.data || data || []).filter(a => {
          if (!a.id_area) return true;
          if (selectedArea.id === 5) { if (!selectedModulo) return false; return a.id_area === selectedModulo.id; }
          return a.id_area === selectedArea.id;
        });
        const mapped = rows.map(r => {
          let recursos = [];
          if (r.recursos_json) {
            try {
              recursos = typeof r.recursos_json === 'string' ? JSON.parse(r.recursos_json) : r.recursos_json;
              if (!Array.isArray(recursos)) recursos = [];
            } catch { recursos = []; }
          }
          const firstRecurso = recursos[0];
          return {
            id: r.id,
            nombre: r.titulo,
            descripcion: r.descripcion || '',
            // Usar fecha límite efectiva si existe (con extensiones), sino usar la fecha límite base
            fechaEntrega: r.fecha_limite_efectiva || r.fecha_limite,
            fecha_limite_original: r.fecha_limite, // Guardar fecha original para comparar
            fechaSubida: r.entregada_at ? new Date(r.entregada_at).toISOString().split('T')[0] : null,
            archivo: r.archivo || null,
            entregada: !!r.entrega_estado,
            // Convertir calificación de escala 0-100 (BD) a escala 0-10 (UI)
            score: r.calificacion !== null && r.calificacion !== undefined ? (r.calificacion > 10 ? r.calificacion / 10 : r.calificacion) : null,
            maxScore: r.puntos_max || 100,
            estado: r.entrega_estado || 'pendiente',
            areaId: r.id_area,
            tipo: 'actividades',
            intentos: [],
            totalIntentos: r.version || (r.entrega_estado ? 1 : 0),
            // Convertir mejorPuntaje de escala 0-100 a escala 0-10
            mejorPuntaje: r.calificacion !== null && r.calificacion !== undefined ? (r.calificacion > 10 ? r.calificacion / 10 : r.calificacion) : null,
            plantilla: r.plantilla || (firstRecurso ? firstRecurso.archivo : null),
            recursos,
            entrega_id: r.entrega_id || r.entregaId || null,
            // Normalizar el valor de permite_editar_despues_calificada
            permite_editar_despues_calificada: (r.permite_editar_despues_calificada === 1 || 
                                                r.permite_editar_despues_calificada === true || 
                                                r.permite_editar_despues_calificada === '1' ||
                                                String(r.permite_editar_despues_calificada) === '1'),
          };
        });
        setActividades(mapped);
      } else {
        // Quiz (placeholder existente)
        const randomScore = Math.floor(Math.random() * 41) + 60;
        await crearIntentoQuiz(actividadId, { id_estudiante: estudianteId, puntaje: randomScore });
        const { data } = await resumenQuizzesEstudiante(estudianteId);
        const rows = (data?.data || data || []).filter(q => {
          if (!q.id_area) return true;
          if (selectedArea.id === 5) { if (!selectedModulo) return false; return q.id_area === selectedModulo.id; }
          return q.id_area === selectedArea.id;
        });
        const mapped = rows.map(q => ({
          id: q.id,
          nombre: q.titulo,
          descripcion: q.descripcion || '',
          fechaEntrega: q.fecha_limite,
          fechaSubida: null,
          archivo: null,
          entregada: q.total_intentos > 0,
          score: q.ultimo_puntaje ?? null,
          maxScore: q.puntos_max || 100,
          estado: q.total_intentos ? 'realizado' : 'pendiente',
          areaId: q.id_area,
          tipo: 'quiz',
          intentos: [],
          totalIntentos: q.total_intentos || 0,
          mejorPuntaje: q.mejor_puntaje ?? null,
          plantilla: null
        }));
        setActividades(mapped);
      }
      setShowUploadModal(false); setSelectedActividad(null);
      setConfettiScore(esTipoActividad ? 0 : actividades.find(a => a.id === actividadId)?.score || 0);
      setShowConfetti(true); setTimeout(() => setShowConfetti(false), 3000);
    } catch (e) {
      console.error(e);
      showNotification('Error', 'No se pudieron subir los archivos', 'error');
    }
  };

  // Funciones para modales (mejoradas como en Feedback)
  const openUploadModal = (actividad) => {
    setSelectedActividad(actividad);
    setShowUploadModal(true);
  };

  const openViewModal = (actividad) => {
    setSelectedActividad(actividad);
    setViewingEntregaArchivos([]);
    setViewingSelectedArchivoId(null);
    setViewingArchivosError('');
    setMobilePdfFailed(false); setMobilePdfLoading(false);
    setUseAltViewer(false);
    // Si la actividad tiene registro de entrega múltiple, obtener lista
    if (actividad.entrega_id) {
      setViewingArchivosLoading(true);
      listArchivosEntrega(actividad.entrega_id)
        .then(resp => {
          const arr = resp.data?.data || [];
          setViewingEntregaArchivos(arr);
          if (arr.length) {
            setViewingSelectedArchivoId(arr[0].id);
            const firstSrc = arr[0].archivo.startsWith('http') ? arr[0].archivo : `${window.location.origin}${arr[0].archivo}`;
            setViewingActivityFile(firstSrc);
          } else {
            setViewingActivityFile(resolveFileUrl(actividad.archivo));
          }
        })
        .catch(() => { setViewingArchivosError('No se pudieron cargar los archivos de la entrega'); setViewingActivityFile(resolveFileUrl(actividad.archivo)); })
        .finally(() => setViewingArchivosLoading(false));
    } else {
      setViewingActivityFile(resolveFileUrl(actividad.archivo));
    }
    setPdfError(false);
    setShowViewModal(true);
  };

  const closeModals = () => {
    setShowUploadModal(false);
    setEntregaArchivos([]); // limpiar archivos al cerrar
    setShowViewModal(false);
    setSelectedActividad(null);
    setViewingActivityFile('');
    setViewingEntregaArchivos([]);
    setViewingSelectedArchivoId(null);
    setUploadSelectedFiles([]);
    setUploadError('');
    setPdfError(false);
    setShowMobileFileList(false);
    setUseAltViewer(false);
  };

  // Función para descargar actividad
  const handleDownload = (actividadId) => {
    const actividad = actividades.find(a => a.id === actividadId);
    if (!actividad) return;
    // Prioriza primer recurso si existen múltiples
    const target = actividad.recursos?.[0] || (actividad.plantilla ? { archivo: actividad.plantilla } : null);
    if (!target) return;
    const full = resolveFileUrl(target.archivo || target);
    const name = (target.nombre || (target.archivo || target).split('/').pop() || `actividad_${actividadId}.pdf`);
    downloadViaBlob(full, name);
  };

  const handleDownloadRecurso = (actividadId, recurso) => {
    if (!recurso) return;
    const full = resolveFileUrl(recurso.archivo);
    const name = recurso.nombre || recurso.archivo.split('/').pop();
    downloadViaBlob(full, name);
  };

  const openResourcesModal = (actividad) => {
    setResourcesActividad(actividad);
    setPreviewRecurso(actividad.recursos?.[0] || null);
    setPreviewError(null); setPreviewLoading(false); setPreviewKey(c => c + 1);
    setShowResourcesModal(true);
  };

  const closeResourcesModal = () => {
    setShowResourcesModal(false);
    setResourcesActividad(null);
    setPreviewRecurso(null);
  };

  const downloadAllRecursos = () => {
    if (!resourcesActividad?.recursos?.length) return;
    resourcesActividad.recursos.forEach((r, idx) => {
      setTimeout(() => handleDownloadRecurso(resourcesActividad.id, r), idx * 300); // separación mayor para evitar saturar
    });
  };

  // Utilidad: forzar descarga usando fetch -> blob para evitar abrir nueva pestaña
  const downloadViaBlob = async (url, filename) => {
    try {
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename || 'archivo.pdf';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(blobUrl); a.remove(); }, 1000);
    } catch (e) {
      // Fallback: abrir en nueva pestaña si no se pudo forzar descarga
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  };

  // Filtrado por mes (académico: 0..7 relativo a inicio del curso)
  const filteredActividades = actividades.filter(actividad => {
    if (selectedMonth === 'all') return true;
    if (!actividad?.fechaEntrega) return true; // sin fecha, no filtramos para no ocultar contenido
    // Intentar usar el calendario académico relativo al inicio del curso
    const ord = computeOrdinalMonthIndex(actividad.fechaEntrega);
    if (ord === null) {
      // Fallback: si no hay curso seleccionado o fechas inválidas, no filtramos para evitar confusiones
      // console.debug('Filtro meses: sin curso/fecha válida, omitiendo filtrado para', actividad);
      return true;
    }
    const sel = parseInt(selectedMonth, 10);
    return ord === sel;
  });

  // Ordenar por fecha más reciente primero (desc) -> movido a useMemo más abajo

  // Ordenar y paginar quizzes (depende de filteredActividades)
  const sortedActividades = useMemo(() => {
    return [...filteredActividades].sort((a, b) => {
      try {
        const da = a?.fechaEntrega ? new Date(a.fechaEntrega).getTime() : -Infinity;
        const db = b?.fechaEntrega ? new Date(b.fechaEntrega).getTime() : -Infinity;
        return db - da;
      } catch { return 0; }
    });
  }, [filteredActividades]);

  const quizTotal = sortedActividades.length;
  const pagedQuizzes = useMemo(() => {
    const start = (quizPage - 1) * QUIZ_PAGE_SIZE;
    return sortedActividades.slice(start, start + QUIZ_PAGE_SIZE);
  }, [sortedActividades, quizPage]);

  const getSelectedMonthName = () => {
    if (selectedMonth === 'all') return 'Todos los meses';
    return months[parseInt(selectedMonth)];
  };

  const handleMonthSelect = (monthValue) => {
    setSelectedMonth(monthValue);
    setIsDropdownOpen(false);
  };

  // Normaliza una fecha límite para que expire al final del día (horario local)
  // Reglas:
  // - Si viene como 'YYYY-MM-DD' (sin hora), expira a las 23:59:59.999 de ese día local.
  // - Si trae hora explícita distinta de 00:00, se respeta tal cual.
  // - Si la hora es 00:00 y parece un formato sin zona ("YYYY-MM-DD 00:00:00"), se interpreta como fin de ese día.
  function normalizeDeadlineEndOfDay(input) {
    if (!input) return null;
    try {
      if (typeof input === 'string') {
        const s = input.trim();
        // Detectar formato fecha-only (YYYY-MM-DD o YYYY/MM/DD)
        const dateOnlyMatch = s.match(/^\d{4}[-\/]\d{2}[-\/]\d{2}$/);
        if (dateOnlyMatch) {
          const [y, m, d] = s.split(/[-\/]/).map(Number);
          return new Date(y, m - 1, d, 23, 59, 59, 999);
        }
        // Detectar si trae hora explícita (acepta opcional segundos, milisegundos y zona)
        const dateTimeMatch = s.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})[ T]([0-9]{2}):([0-9]{2})(?::([0-9]{2})(?:\.([0-9]{1,3}))?)?(?:Z|[+\-][0-9]{2}:[0-9]{2})?$/);
        if (dateTimeMatch) {
          const y = Number(dateTimeMatch[1]);
          const m = Number(dateTimeMatch[2]);
          const d = Number(dateTimeMatch[3]);
          const hh = Number(dateTimeMatch[4]);
          const mm = Number(dateTimeMatch[5]);
          const ss = Number(dateTimeMatch[6] || 0);
          // Si la hora es exactamente 00:00:00, trátalo como fecha-only y pon fin de día local
          // (esto cubre cadenas con o sin zona: Z, +hh:mm, -hh:mm)
          if (hh === 0 && mm === 0 && ss === 0) {
            return new Date(y, m - 1, d, 23, 59, 59, 999);
          }
          // De lo contrario, dejar que el constructor nativo resuelva (posible zona incluida)
          const dNative = new Date(s);
          if (!isNaN(dNative)) {
            // Si al convertir a hora local queda exactamente a medianoche (00:00:00.000),
            // interpretamos que era una fecha-only desplazada por zona, y la normalizamos a fin de día local
            if (
              dNative.getHours() === 0 &&
              dNative.getMinutes() === 0 &&
              dNative.getSeconds() === 0 &&
              dNative.getMilliseconds() === 0
            ) {
              return new Date(dNative.getFullYear(), dNative.getMonth(), dNative.getDate(), 23, 59, 59, 999);
            }
            return dNative;
          }
          // Fallback a local
          return new Date(y, m - 1, d, hh, mm, ss);
        }
        // Cualquier otro formato, intentar parseo nativo
        const parsed = new Date(s);
        if (!isNaN(parsed)) {
          if (
            parsed.getHours() === 0 &&
            parsed.getMinutes() === 0 &&
            parsed.getSeconds() === 0 &&
            parsed.getMilliseconds() === 0
          ) {
            return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 23, 59, 59, 999);
          }
          return parsed;
        }
      }
      // Si ya es Date u otro tipo, confiar en el constructor
      const d = new Date(input);
      if (!isNaN(d)) {
        if (
          d.getHours() === 0 &&
          d.getMinutes() === 0 &&
          d.getSeconds() === 0 &&
          d.getMilliseconds() === 0
        ) {
          return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
        }
        return d;
      }
    } catch { }
    return null;
  }

  // Verificar fecha límite (como en Feedback)
  const isWithinDeadline = (dueDate) => {
    const now = new Date();
    const due = normalizeDeadlineEndOfDay(dueDate);
    return due ? now <= due : true;
  };

  // Helper: construir URL de retorno preservando el contexto (área/módulo y tipo)
  const buildReturnTo = (extraParams = {}) => {
    try {
      const params = new URLSearchParams();
      if (selectedType) params.set('type', String(selectedType));
      const areaIdValue = (selectedArea?.id === 5) ? (selectedModulo?.id) : selectedArea?.id;
      if (areaIdValue != null) params.set('areaId', String(areaIdValue));
      Object.entries(extraParams).forEach(([k, v]) => { if (v != null) params.set(k, String(v)); });
      const qs = params.toString();
      return `${location.pathname}${qs ? `?${qs}` : ''}`;
    } catch {
      return `${location.pathname}${location.search || ''}`;
    }
  };

  // Funciones específicas para Quizzes
  const handleIniciarSimulacion = (quizId) => {
    // Bloquear si ya hay una pestaña de este quiz abierta (heartbeat en localStorage)
    try {
      const info = JSON.parse(localStorage.getItem(`quiz_open_${quizId}`) || 'null');
      if (info && info.ts && (Date.now() - Number(info.ts)) < 15000) {
        showNotification('Quiz ya abierto', 'Ya tienes este quiz abierto en otra pestaña. Ciérrala o vuelve a esa pestaña para continuar.', 'warning');
        return;
      }
    } catch { }

    // Verificar si hay curso disponible (en estado o localStorage) pero no bloquear
    // El quiz puede iniciarse sin curso seleccionado, solo mostrar advertencia si es necesario
    let hasCourse = false;
    try {
      hasCourse = !!currentCourse || !!localStorage.getItem('currentCourse');
    } catch { }

    if (!hasCourse) {
      // Mostrar advertencia pero no bloquear - permitir iniciar el quiz
      console.warn('[Quiz] No hay curso seleccionado, pero permitiendo iniciar quiz');
    }

    // Mostrar modal con cuenta regresiva y permitir cancelar (abriremos la pestaña al aceptar o al terminar la cuenta)
    try { preOpenedTabRef.current = null; } catch { }
    // Mostrar modal con cuenta regresiva y permitir cancelar
    setStartModal({ open: true, quizId, seconds: 5 });
  };
  // Detectar si un quiz está abierto en otra pestaña (latido <15s)
  const isQuizOpenElsewhere = (qid) => {
    try {
      const info = JSON.parse(localStorage.getItem(`quiz_open_${qid}`) || 'null');
      return Boolean(info && info.ts && (Date.now() - Number(info.ts)) < 15000);
    } catch { return false; }
  };

  const handleVisualizarResultados = (quizId) => {
    const quiz = actividades.find(q => q.id === quizId);
    if (!quiz) { showNotification('No encontrado', 'No se encontró el quiz para mostrar resultados.', 'warning'); return; }
    const returnTo = buildReturnTo();
    navigate(`/alumno/actividades/quiz/${quizId}/resultados`, { state: { quiz, returnTo } });
  };
  // Cierre del modal de resultados
  const closeResultadosModal = () => {
    setShowResultadosModal(false);
    setSelectedQuizResultados(null);
  };
  // Render modal resultados quiz
  const renderResultadosModal = () => (
    <QuizResultados
      open={showResultadosModal}
      onClose={closeResultadosModal}
      quiz={selectedQuizResultados}
      estudianteId={estudianteId}
    />
  );

  // Verificar si la actividad/quiz está disponible para iniciar
  const isQuizAvailable = (quiz) => {
    // Para actividades: siempre disponibles para intentar/reintentar
    if (quiz.tipo === 'actividades') {
      return true; // Las actividades siempre se pueden reintentar
    }
    // Para quiz: verificar fecha límite
    const now = new Date();
    const fechaEntrega = normalizeDeadlineEndOfDay(quiz.fechaEntrega);
    const within = (!!fechaEntrega ? now <= fechaEntrega : true);
    const attempts = Number((quiz.totalIntentos != null ? quiz.totalIntentos : getTotalAttempts(quiz.id)) || 0);
    const max = (quiz.maxIntentosValue != null) ? quiz.maxIntentosValue : (quiz.maxIntentos === '∞' ? Number.POSITIVE_INFINITY : Number(quiz.maxIntentos || 1));
    return within && attempts < max;
  };

  // Recalcular estado de quiz en tiempo de render para evitar inconsistencias si cambió la norma de vencimiento
  const computeQuizEstado = (quiz) => {
    const intents = Number((quiz.totalIntentos != null ? quiz.totalIntentos : getTotalAttempts(quiz.id)) || 0);
    const max = (quiz.maxIntentosValue != null) ? quiz.maxIntentosValue : (quiz.maxIntentos === '∞' ? Number.POSITIVE_INFINITY : Number(quiz.maxIntentos || 1));
    if (intents >= max) return 'completado';
    return isWithinDeadline(quiz.fechaEntrega) ? 'disponible' : 'vencido';
  };

  // Verificar si se puede reintentar (para actividades: siempre, para quiz: según límites)
  const canRetry = (item) => {
    if (item.tipo === 'actividades') {
      // Las actividades siempre se pueden reintentar sin límite
      return !!item.entregada; // Solo si ya se ha entregado al menos una vez
    }
    // Para quiz: se puede reintentar si hay intentos restantes y sigue dentro de fecha
    const attempts = Number((item.totalIntentos != null ? item.totalIntentos : getTotalAttempts(item.id)) || 0);
    const max = (item.maxIntentosValue != null) ? item.maxIntentosValue : (item.maxIntentos === '∞' ? Number.POSITIVE_INFINITY : Number(item.maxIntentos || 1));
    return attempts < max && isWithinDeadline(item.fechaEntrega);
  };

  // Estado y lógica para modal de inicio con cuenta regresiva
  const [startModal, setStartModal] = useState({ open: false, quizId: null, seconds: 5 });
  // Mantener referencia estable a la pestaña pre-abierta para no afectar dependencias del efecto
  const preOpenedTabRef = useRef(null);

  // Ticker para re-evaluar el estado "abierto en otra pestaña" y refrescar el render
  const [openHeartbeatTick, setOpenHeartbeatTick] = useState(0);
  useEffect(() => {
    const onStorage = (e) => {
      if (e && typeof e.key === 'string' && e.key.startsWith('quiz_open_')) {
        setOpenHeartbeatTick((t) => t + 1);
      }
    };
    window.addEventListener('storage', onStorage);
    const iv = setInterval(() => setOpenHeartbeatTick((t) => t + 1), 5000);
    return () => { window.removeEventListener('storage', onStorage); clearInterval(iv); };
  }, []);

  // Abrir quiz en nueva pestaña (ventaja: aislamiento y bloqueos sin afectar dashboard)
  const openQuizInNewTab = (qid, reuseWin = null) => {
    // Construir URL con areaId si está disponible
    const returnTo = buildReturnTo();
    const areaIdValue = (selectedArea?.id === 5) ? (selectedModulo?.id) : selectedArea?.id;
    let target = `/alumno/actividades/quiz/${qid}`;
    if (areaIdValue != null) {
      target += `?areaId=${areaIdValue}`;
    }
    
    try {
      // Pre-marcar este quiz como "abierto" para reflejar el estado de inmediato en UI
      try { localStorage.setItem(`quiz_open_${qid}`, JSON.stringify({ ts: Date.now(), pid: 'preopen' })); } catch { }
      setOpenHeartbeatTick((t) => t + 1);
      // Abrir nueva pestaña en el gesto del usuario (aceptar) o tras la cuenta
      const win = window.open('', '_blank');
      if (!win) {
        // Popup bloqueado -> fallback misma pestaña
        navigate(target, { replace: true, state: { returnTo } });
      }
      else {
        try {
          win.document.write('<!doctype html><title>MQERK Academy</title><meta charset="utf-8"/><p style="font-family:system-ui,Segoe UI,Arial;margin:2rem;color:#4b5563;">Cargando quiz…</p>');
          win.document.close();
        } catch { }
        win.location.href = target;
      }
    } catch {
      navigate(target, { replace: true, state: { returnTo } });
    } finally {
      setStartModal({ open: false, quizId: null, seconds: 5 });
    }
  };
  useEffect(() => {
    if (!startModal.open) return;
    if (startModal.seconds <= 0) {
      // Abrir en nueva pestaña al terminar la cuenta
      openQuizInNewTab(startModal.quizId, null);
      return;
    }
    const t = setTimeout(() => setStartModal(s => ({ ...s, seconds: s.seconds - 1 })), 1000);
    return () => clearTimeout(t);
  }, [startModal.open, startModal.seconds, navigate]);

  // Modal UI para confirmar inicio de quiz con cuenta regresiva
  const renderStartQuizModal = () => {
    if (!startModal.open) return null;
    // Estilo igual al contenedor de notificaciones (gradiente, ícono y botón primario)
    const colorGradient = 'from-blue-500 to-indigo-600';
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { try { if (preOpenedTabRef.current && !preOpenedTabRef.current.closed && preOpenedTabRef.current.location.href === 'about:blank') { preOpenedTabRef.current.close(); } } catch { } setStartModal({ open: false, quizId: null, seconds: 5 }); }}>
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
          {/* Header estilo notificación */}
          <div className={`bg-gradient-to-r ${colorGradient} text-white p-6 text-center`}>
            <Brain className="w-12 h-12 text-white/90 mx-auto mb-2" />
            <h2 className="text-xl font-bold">Iniciando Quiz</h2>
          </div>
          {/* Contenido */}
          <div className="p-6 text-center space-y-5">
            <p className="text-gray-700 text-lg leading-relaxed">
              Redirigiendo al Quiz en <span className="font-semibold text-gray-900">{startModal.seconds}s</span>…
            </p>
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => { try { if (preOpenedTabRef.current && !preOpenedTabRef.current.closed && preOpenedTabRef.current.location.href === 'about:blank') { preOpenedTabRef.current.close(); } } catch { } setStartModal({ open: false, quizId: null, seconds: 5 }); }}
                className="w-1/2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => openQuizInNewTab(startModal.quizId, null)}
                className={`w-1/2 px-6 py-3 bg-gradient-to-r ${colorGradient} hover:opacity-90 text-white rounded-lg font-medium shadow-lg`}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Límites multi-archivo
  const MAX_FILES = 5;
  const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB individuales
  const MAX_TOTAL_BYTES = 20 * 1024 * 1024; // 20MB combinados

  // Confirmar subida multi-archivo
  const handleConfirmUpload = () => {
    if (!uploadSelectedFiles.length) { setUploadError('Selecciona al menos un PDF.'); return; }
    const anyNonPdf = uploadSelectedFiles.some(f => f.type !== 'application/pdf');
    if (anyNonPdf) { setUploadError('Solo archivos PDF.'); return; }
    const anyTooBig = uploadSelectedFiles.some(f => f.size > MAX_FILE_SIZE_BYTES);
    if (anyTooBig) { setUploadError('Uno o más archivos superan 5MB.'); return; }
    const total = uploadSelectedFiles.reduce((s, f) => s + f.size, 0);
    if (total > MAX_TOTAL_BYTES) { setUploadError('Tamaño combinado > 20MB.'); return; }
    handleFileUpload(selectedActividad.id, uploadSelectedFiles);
  };

  // Función para reintentar una actividad
  const handleReintentar = (actividadId) => {
    const actividad = actividades.find(a => a.id === actividadId);
    if (actividad) {
      console.log(`Reintentando ${actividad.tipo}: ${actividad.nombre}`);
      console.log(`Intento número: ${actividad.totalIntentos + 1}`);
      console.log(`Intentos previos: ${actividad.totalIntentos}`);
      console.log(`Mejor puntaje actual: ${actividad.mejorPuntaje || 'N/A'}`);

      if (selectedType === 'actividades') {
        // Para actividades: abrir modal de subida
        openUploadModal(actividad);
      } else {
        // Para quiz: ya no simulamos; redirigimos al flujo de inicio del quiz
        handleIniciarSimulacion(actividadId);
      }
    }
  };

  // Función para mostrar historial de intentos
  const mostrarHistorial = (actividadId) => {
    const actividad = actividades.find(a => a.id === actividadId);
    if (actividad && actividad.intentos.length > 0) {
      let historialTexto = `HISTORIAL DE INTENTOS - ${actividad.nombre}\n\n`;
      actividad.intentos.forEach(intento => {
        historialTexto += `Intento ${intento.numero}:\n`;
        historialTexto += `  Fecha: ${new Date(intento.fecha).toLocaleDateString('es-ES')}\n`;
        historialTexto += `  Puntaje: ${intento.puntaje}%\n`;
        if (intento.comentarios) {
          historialTexto += `  Comentarios: ${intento.comentarios}\n`;
        }
        historialTexto += `\n`;
      });
      historialTexto += `Mejor puntaje: ${actividad.mejorPuntaje}%\n`;
      historialTexto += `Total de intentos: ${actividad.totalIntentos}`;

      showNotification(
        'Historial de Intentos',
        historialTexto,
        'info'
      );
    } else {
      showNotification(
        'Sin historial',
        'No hay historial de intentos disponible para esta actividad.',
        'warning'
      );
    }
  };

  // Funciones para el modal de historial de quizzes
  const handleVerHistorial = (quiz) => {
    setSelectedQuizHistorial(quiz);
    setShowHistorialModal(true);
    // Intentar cargar intentos reales desde el backend si hay estudiante
    if (!quiz || !quiz.id || !estudianteId) return;
    (async () => {
      try {
        const resp = await listIntentosQuizEstudiante(quiz.id, estudianteId);
        const lista = resp?.data?.data || resp?.data || [];
        if (Array.isArray(lista)) {
          const intentos = lista.map((it, idx) => {
            const sec = Number(it.tiempo_segundos ?? it.tiempo_empleado ?? it.duration_sec ?? 0);
            return {
              id: it.id || idx + 1,
              numero: it.numero || it.version || idx + 1,
              fecha: it.created_at || it.fecha || it.updated_at || new Date().toISOString(),
              puntaje: Number(it.puntaje ?? it.score ?? it.calificacion ?? 0),
              // Normalizamos a segundos y preservamos ambos nombres para compatibilidad
              tiempoEmpleado: sec,
              tiempo_segundos: sec,
            };
          });
          const totalIntentos = intentos.length;
          const mejorPuntaje = intentos.reduce((m, x) => Math.max(m, Number(x.puntaje || 0)), 0);
          const promedio = totalIntentos ? (intentos.reduce((s, x) => s + Number(x.puntaje || 0), 0) / totalIntentos) : 0;
          setActividades(prev => prev.map(q => q.id === quiz.id ? {
            ...q,
            intentos,
            totalIntentos,
            mejorPuntaje: mejorPuntaje || q.mejorPuntaje || 0,
            score: intentos[totalIntentos - 1]?.puntaje ?? q.score ?? null,
            promedio
          } : q));
        }
      } catch (e) {
        console.warn('No se pudo cargar historial de intentos del backend', e);
      }
    })();
  };

  const closeHistorialModal = () => {
    setShowHistorialModal(false);
    setSelectedQuizHistorial(null);
  };

  const getQuizHistorial = (quizId) => {
    const quiz = actividades.find(q => q.id === quizId);
    if (!quiz) return { intentos: [], totalIntentos: 0, mejorPuntaje: 0, promedio: 0, promedioTiempo: 0 };

    const intentos = Array.isArray(quiz.intentos) ? quiz.intentos : [];
    const totalIntentos = Number(quiz.totalIntentos || intentos.length || 0);
    const mejorPuntaje = Number(quiz.mejorPuntaje || intentos.reduce((m, x) => Math.max(m, Number(x.puntaje || 0)), 0) || 0);
    const promedio = totalIntentos ? (intentos.reduce((s, x) => s + Number(x.puntaje || 0), 0) / totalIntentos) : 0;
    const promedioTiempo = intentos.length ? (intentos.reduce((s, x) => s + Number(x.tiempoEmpleado || 0), 0) / intentos.length) : 0;
    return { intentos, totalIntentos, mejorPuntaje, promedio, promedioTiempo };
  };

  const getTotalAttempts = (quizId) => {
    const quiz = actividades.find(q => q.id === quizId);
    return quiz ? quiz.totalIntentos || 0 : 0;
  };

  const getBestScore = (itemId) => {
    const item = actividades.find(q => q.id === itemId);
    if (!item) return 0;
    if (selectedType === 'actividades') {
      if (item.score === null || item.score === undefined) {
        // Si está marcada como revisada pero score null, mostrar 0 (o placeholder) y no 'En revisión'
        if (item.estado === 'revisada') return item.mejorPuntaje ?? 0;
        return 'En revisión';
      }
      return item.score;
    }
    return item.mejorPuntaje || 0;
  };

  // Efecto para cargar archivos de la entrega cuando se abre el modal (no hooks dentro de render condicional)
  useEffect(() => {
    if (!showUploadModal || !selectedActividad) return;
    const isEdit = selectedActividad.entregada && selectedActividad.estado !== 'revisada';
    const blocked = selectedActividad.entregada && selectedActividad.estado === 'revisada';
    if (selectedActividad.entrega_id && entregaArchivos.length === 0 && isEdit && !blocked) {
      (async () => {
        try {
          const resp = await listArchivosEntrega(selectedActividad.entrega_id);
          setEntregaArchivos(resp.data?.data || []);
        } catch { }
      })();
    }
  }, [showUploadModal, selectedActividad, entregaArchivos.length]);

  // Modal para gestionar archivos (multi-archivo estilo Classroom)
  const renderUploadModal = () => {
    if (!showUploadModal || !selectedActividad) return null;

    const isEdit = selectedActividad.entregada && selectedActividad.estado !== 'revisada';
    const blocked = selectedActividad.entregada && selectedActividad.estado === 'revisada';

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
          {/* Header */}
          <div className={`p-6 text-center ${blocked ? 'bg-gradient-to-r from-gray-400 to-gray-500' : isEdit ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-gradient-to-r from-blue-500 to-indigo-600'} text-white`}>
            <Upload className="w-12 h-12 text-white mx-auto mb-4" />
            <h2 className="text-xl font-bold">
              {blocked ? 'Entrega Finalizada' : isEdit ? 'Gestionar Archivos' : 'Subir Archivos'}
            </h2>
            <p className="text-indigo-100 mt-1 text-sm">
              {blocked ? 'La actividad ya fue revisada. No puedes subir más archivos.' : isEdit ? 'Agrega o elimina PDFs antes de la revisión.' : 'Sube un PDF (podrás agregar más luego).'}
            </p>
          </div>

          {/* Contenido */}
          <div className="p-6 space-y-5">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{selectedActividad.nombre}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{selectedActividad.descripcion}</p>
              <div className="mt-2 text-xs text-gray-500 flex flex-col gap-1">
                <span>Fecha límite: {new Date(selectedActividad.fechaEntrega).toLocaleDateString('es-ES')}</span>
                {selectedActividad.entregada && (
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-500" /> Entregado el {selectedActividad.fechaSubida || '—'}
                  </span>
                )}
                {selectedActividad.estado === 'revisada' && selectedActividad.score !== null && (
                  <span className="flex items-center gap-1 text-green-600 font-medium">Calificación: {Number(selectedActividad.score).toFixed(1)}/10</span>
                )}
              </div>
            </div>

            <div className={`border-2 ${uploadError ? 'border-red-300 bg-red-50' : 'border-dashed border-gray-300 bg-gray-50'} rounded-xl p-4 transition-colors`}>
              <input
                type="file"
                accept="application/pdf"
                multiple
                name="archivos"
                disabled={blocked}
                onChange={(e) => {
                  setUploadError('');
                  const fileList = Array.from(e.target.files || []);
                  if (!fileList.length) { setUploadSelectedFiles([]); return; }
                  if (fileList.length > MAX_FILES) { setUploadError(`Máximo ${MAX_FILES} PDFs por envío.`); setUploadSelectedFiles([]); return; }
                  let total = 0;
                  for (const f of fileList) {
                    if (f.type !== 'application/pdf') { setUploadError('Todos los archivos deben ser PDF.'); setUploadSelectedFiles([]); return; }
                    if (f.size > MAX_FILE_SIZE_BYTES) { setUploadError(`${f.name} supera 5MB.`); setUploadSelectedFiles([]); return; }
                    total += f.size;
                  }
                  if (total > MAX_TOTAL_BYTES) { setUploadError('Tamaño combinado > 20MB.'); setUploadSelectedFiles([]); return; }
                  setUploadSelectedFiles(fileList);
                }}
                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
              />
              <p className="mt-2 text-xs text-gray-500">
                Solo PDF. Máx {MAX_FILES} archivos, 5MB c/u, 20MB total. ¿Comprimir?{' '}
                <a
                  href="https://www.ilovepdf.com/compress_pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Comprimir PDF
                </a>
              </p>
              {!!uploadSelectedFiles.length && !uploadError && (
                <ul className="mt-2 text-xs text-green-600 space-y-1 max-h-28 overflow-auto pr-1">
                  {uploadSelectedFiles.map(f => (
                    <li key={f.name} className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> {f.name} ({(f.size / 1024).toFixed(1)} KB)</li>
                  ))}
                </ul>
              )}
              {uploadError && (
                <div className="mt-2 text-xs text-red-600 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" /> {uploadError}
                </div>
              )}
            </div>

            {isEdit && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Archivos actuales</h4>
                <ul className="space-y-2 max-h-40 overflow-auto pr-1">
                  {entregaArchivos.map(f => (
                    <li key={f.id} className="flex items-center justify-between bg-gray-100 rounded-lg px-3 py-2 text-xs">
                      <span className="truncate" title={f.original_nombre || f.archivo}>{(f.original_nombre || f.archivo.split('/').pop())}</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => window.open(f.archivo.startsWith('http') ? f.archivo : `${window.location.origin}${f.archivo}`, '_blank')} className="text-blue-600 hover:underline">Ver</button>
                        {!blocked && <button onClick={async () => { try { const resp = await deleteArchivoEntrega(selectedActividad.entrega_id, f.id); setEntregaArchivos(resp.data?.data || []); } catch { showNotification('Error', 'No se pudo eliminar', 'error'); } }} className="text-red-500 hover:text-red-700">Eliminar</button>}
                      </div>
                    </li>
                  ))}
                  {entregaArchivos.length === 0 && <li className="text-xs text-gray-500">Sin archivos todavía.</li>}
                </ul>
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <button onClick={closeModals} className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors">Cerrar</button>
              {!blocked && <button onClick={() => { if (!uploadSelectedFiles.length) { setUploadError('Selecciona archivos.'); return; } handleConfirmUpload(); }} className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors text-white shadow ${isEdit ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'}`}>{isEdit ? 'Agregar Archivos' : 'Subir Archivos'}</button>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Modal para ver archivo estilo compacto (inspirado en snippet proporcionado)
  const renderViewModal = () => {
    if (!showViewModal || !selectedActividad) return null;
    const pdfSrc = viewingActivityFile;
    const esPDF = pdfSrc && pdfSrc.toLowerCase().endsWith('.pdf');

    const handleOpenPdfInNewTab = () => {
      if (pdfSrc) window.open(encodeURI(pdfSrc), '_blank', 'noopener');
    };

    // Modo multi-archivo: barra lateral de archivos si hay más de uno
    const hasMulti = viewingEntregaArchivos && viewingEntregaArchivos.length > 0;

    const downloadEntregaArchivo = async (f) => {
      if (!f) return;
      const full = f.archivo.startsWith('http') ? f.archivo : `${window.location.origin}${f.archivo}`;
      const name = f.original_nombre || f.archivo.split('/').pop();
      await downloadViaBlob(full, name);
    };
    const downloadAllEntregaArchivos = () => {
      viewingEntregaArchivos.forEach((f, idx) => setTimeout(() => downloadEntregaArchivo(f), idx * 400));
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-start px-2 pt-24 md:pt-28 pb-4 z-50" onClick={closeModals}>
        <div className="bg-white rounded-t-2xl md:rounded-xl shadow-2xl w-full max-w-5xl h-[calc(100vh-7rem)] md:h-[82vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
          <div className="px-4 md:px-6 py-3 md:py-4 border-b flex items-center justify-between bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
            <h2 className="font-semibold text-lg truncate flex-1 pr-2">Entrega: {selectedActividad.nombre}</h2>
            {hasMulti && isMobile && (
              <button
                onClick={() => setShowMobileFileList(v => !v)}
                className="mr-2 px-3 py-1.5 text-xs rounded-md bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20"
              >{showMobileFileList ? 'Ocultar' : 'Lista'}</button>
            )}
            <button onClick={closeModals} className="text-white/80 hover:text-white">✕</button>
          </div>
          <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
            {/* Sidebar archivos entrega */}
            <div className={`w-full md:w-64 md:border-r border-b md:border-b-0 overflow-y-auto p-3 space-y-2 bg-gray-50 ${hasMulti ? (isMobile ? (showMobileFileList ? 'block max-h-48' : 'hidden') : 'block') : 'hidden md:block'} md:max-h-none flex-shrink-0`}>
              {viewingArchivosLoading && <div className="text-xs text-gray-500">Cargando...</div>}
              {viewingArchivosError && <div className="text-xs text-red-600">{viewingArchivosError}</div>}
              {!viewingArchivosLoading && !viewingArchivosError && viewingEntregaArchivos.map(f => {
                const active = f.id === viewingSelectedArchivoId;
                const display = f.original_nombre || f.archivo.split('/').pop();
                return (
                  <div key={f.id} className={`group rounded-lg border p-2 text-xs cursor-pointer transition-colors ${active ? 'border-purple-500 bg-white shadow-sm' : 'border-gray-200 bg-white hover:bg-purple-50'}`} onClick={() => { setViewingSelectedArchivoId(f.id); const src = f.archivo.startsWith('http') ? f.archivo : `${window.location.origin}${f.archivo}`; setViewingActivityFile(src); }}>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-500" />
                      <span className="truncate" title={display}>{display}</span>
                    </div>
                    <div className="mt-1 flex gap-2">
                      <button className="text-blue-600 hover:underline" onClick={(e) => { e.stopPropagation(); downloadEntregaArchivo(f); }}>Descargar</button>
                      <button className="text-gray-500 hover:underline" onClick={(e) => { e.stopPropagation(); setViewingSelectedArchivoId(f.id); const src = f.archivo.startsWith('http') ? f.archivo : `${window.location.origin}${f.archivo}`; setViewingActivityFile(src); }}>Ver</button>
                    </div>
                  </div>
                );
              })}
              {!viewingArchivosLoading && !viewingArchivosError && viewingEntregaArchivos.length === 0 && (
                <div className="text-xs text-gray-400">Sin archivos.</div>
              )}
            </div>
            {/* Panel visor */}
            <div className="flex-1 flex flex-col">
              <div className="p-3 border-b flex flex-wrap gap-2 items-center justify-between">
                <div className="text-sm font-medium truncate max-w-[60%]">
                  {hasMulti ? (viewingEntregaArchivos.find(f => f.id === viewingSelectedArchivoId)?.original_nombre || viewingEntregaArchivos.find(f => f.id === viewingSelectedArchivoId)?.archivo?.split('/').pop() || 'Selecciona un archivo') : (pdfSrc ? pdfSrc.split('/').pop() : 'Sin archivo')}
                </div>
                <div className="flex gap-2">
                  {hasMulti && viewingEntregaArchivos.length > 1 && (
                    <button onClick={downloadAllEntregaArchivos} className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md">Descargar todo</button>
                  )}
                  {pdfSrc && esPDF && (
                    <button onClick={() => { if (viewingSelectedArchivoId) { const f = viewingEntregaArchivos.find(x => x.id === viewingSelectedArchivoId); downloadEntregaArchivo(f); } else { handleOpenPdfInNewTab(); } }} className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-md">Descargar actual</button>
                  )}
                  {pdfSrc && esPDF && !isMobile && (
                    <button onClick={handleOpenPdfInNewTab} className="px-3 py-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded-md">Abrir pestaña</button>
                  )}
                  <button onClick={closeModals} className="px-3 py-1.5 text-xs bg-gray-500 hover:bg-gray-600 text-white rounded-md">Cerrar</button>
                </div>
              </div>
              <div className={`flex-1 bg-gray-100 m-2 md:m-3 rounded-lg flex items-center justify-center overflow-hidden relative ${isMobile && showMobileFileList ? 'hidden' : 'flex'}`}>
                {pdfSrc && esPDF ? (
                  isMobile ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-gray-600 text-xs gap-3">
                      <div className="font-medium">Abrir documento</div>
                      <div className="text-[11px] text-gray-500 max-w-xs">En móvil se abrirá fuera del sitio para mejor lectura.</div>
                      <button onClick={() => window.open(pdfSrc, '_blank', 'noopener')} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-xs w-full max-w-[200px]">Abrir PDF</button>
                      <button onClick={() => window.location.href = pdfSrc} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs w-full max-w-[200px]">Forzar descarga</button>
                      <button onClick={() => setUseAltViewer(v => !v)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs w-full max-w-[200px]">{useAltViewer ? 'Cerrar visor alterno' : 'Visor alterno'}</button>
                      {useAltViewer && (
                        <iframe
                          allowFullScreen
                          key={pdfSrc + 'alt-simple'}
                          src={`https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(pdfSrc)}`}
                          title="Entrega PDF (Alt)"
                          className="w-full h-full border-none mt-2 bg-white"
                          onError={() => setUseAltViewer(false)}
                        />
                      )}
                    </div>
                  ) : (
                    <iframe key={pdfSrc} src={encodeURI(pdfSrc)} title="Entrega PDF" className="w-full h-full border-none" allowFullScreen />
                  )
                ) : (
                  <div className="text-xs text-gray-500">No hay PDF para visualizar.</div>
                )}
              </div>
              <div className="px-4 pb-2">
                <p className="text-[10px] sm:text-xs text-gray-500 truncate">Ruta: {pdfSrc ? pdfSrc.replace(/^https?:\/\/[^/]+/, '') : ''}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Modal para editar actividades
  const renderEditModal = () => {
    if (!showEditModal || !selectedActividad) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
          {/* Header del modal */}
          <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 text-center">
            <Edit className="w-12 h-12 text-white mx-auto mb-4" />
            <h2 className="text-xl font-bold">Editar Actividad</h2>
          </div>

          {/* Contenido del modal */}
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {selectedActividad.nombre}
              </h3>
              <p className="text-gray-600 text-sm">
                Reemplaza el archivo de tu actividad
              </p>
            </div>

            <div className="mb-6">
              <input
                type="file"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                accept=".pdf,.doc,.docx,.txt"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeModals}
                className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  // Lógica para editar archivo
                  closeModals();
                }}
                className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Historial modal ahora se renderiza con componente reutilizable

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

  // Modal de recursos múltiples (descarga y vista previa)
  const renderResourcesModal = () => {
    if (!showResourcesModal || !resourcesActividad) return null;
    const recursos = resourcesActividad.recursos || [];
    const current = previewRecurso;
    const baseUrlRaw = current ? resolveFileUrl(current.archivo) : null;
    // Codificar la URL para manejar espacios y caracteres especiales (ej. nombres con espacios)
    const baseUrl = baseUrlRaw ? encodeURI(baseUrlRaw) : null;
    const currentUrl = baseUrl ? baseUrl + (baseUrl.includes('?') ? '&' : '?') + 'v=' + previewKey : null; // cache-bust
    // BACKEND: Asesores solo pueden subir PDFs, así que asumimos siempre PDF y simplificamos la lógica
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-start px-2 pt-24 md:pt-28 pb-4 z-50" onClick={closeResourcesModal}>
        <div className="bg-white rounded-t-2xl md:rounded-xl shadow-2xl w-full max-w-4xl h-[calc(100vh-7rem)] md:h-[80vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
          <div className="px-4 md:px-6 py-3 md:py-4 border-b flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <h2 className="font-semibold text-lg flex-1 pr-2 truncate">Recursos de: {resourcesActividad.nombre}</h2>
            {isMobile && (
              <button
                onClick={() => setShowMobileFileList(v => !v)}
                className="mr-2 px-3 py-1.5 text-xs rounded-md bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20"
              >{showMobileFileList ? 'Ocultar' : 'Lista'}</button>
            )}
            <button onClick={closeResourcesModal} className="text-white/80 hover:text-white">✕</button>
          </div>
          <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
            <div className={`w-full md:w-64 md:border-r border-b md:border-b-0 overflow-y-auto p-3 space-y-2 bg-gray-50 ${isMobile ? (showMobileFileList ? 'block max-h-48' : 'hidden') : 'block'} md:max-h-none flex-shrink-0`}>
              {recursos.map((r, idx) => (
                <div key={idx} className={`group rounded-lg border p-2 text-xs cursor-pointer transition-colors ${previewRecurso === r ? 'border-blue-500 bg-white shadow-sm' : 'border-gray-200 bg-white hover:bg-blue-50'}`} onClick={() => { setPreviewRecurso(r); setPreviewError(null); setPreviewLoading(true); setPreviewKey(c => c + 1); }}>
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-blue-500" />
                    <span className="truncate" title={r.nombre || r.archivo}>{r.nombre || r.archivo.split('/').pop()}</span>
                  </div>
                  <div className="mt-1 flex gap-2">
                    <button className="text-blue-600 hover:underline" onClick={(e) => { e.stopPropagation(); handleDownloadRecurso(resourcesActividad.id, r); }}>Descargar</button>
                    <button className="text-gray-500 hover:underline" onClick={(e) => { e.stopPropagation(); setPreviewRecurso(r); setPreviewError(null); setPreviewLoading(true); setPreviewKey(c => c + 1); }}>Ver</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex-1 flex flex-col">
              <div className="p-3 border-b flex flex-wrap gap-2 items-center justify-between">
                <div className="text-sm font-medium truncate max-w-[70%]">
                  {current ? (current.nombre || current.archivo.split('/').pop()) : 'Selecciona un recurso'}
                </div>
                <div className="flex gap-2">
                  <button onClick={downloadAllRecursos} className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md">Descargar todo</button>
                  {current && (
                    <button onClick={() => handleDownloadRecurso(resourcesActividad.id, current)} className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-md">Descargar actual</button>
                  )}
                </div>
              </div>
              <div className={`flex-1 bg-gray-100 m-2 md:m-3 rounded-lg flex items-center justify-center overflow-hidden relative ${isMobile && showMobileFileList ? 'hidden' : 'flex'}`}>
                {current ? (
                  <>
                    {previewLoading && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-xs text-gray-600 bg-white/60 backdrop-blur-sm">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        Cargando PDF...
                      </div>
                    )}
                    {previewError && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-4 text-xs text-red-600 bg-white">
                        <div>ERROR al cargar el PDF</div>
                        <button className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs" onClick={() => { setPreviewError(null); setPreviewLoading(true); setPreviewKey(c => c + 1); }}>Reintentar</button>
                        <a className="text-blue-600 underline" href={baseUrl} target="_blank" rel="noopener">Abrir en nueva pestaña</a>
                      </div>
                    )}
                    {(!canInlinePdf && isMobile && !useAltViewer) ? (
                      <div className="flex flex-col items-center justify-center gap-3 text-center p-4 text-xs text-gray-600">
                        <div>Vista previa limitada en este dispositivo.</div>
                        <a href={baseUrl} target="_blank" rel="noopener" className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs">Abrir PDF</a>
                        <button onClick={() => setUseAltViewer(true)} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs">Visor alterno</button>
                      </div>
                    ) : useAltViewer ? (
                      <iframe
                        allowFullScreen
                        key={currentUrl + 'alt'}
                        src={`https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(baseUrl)}`}
                        title="Recurso PDF (Alt)"
                        className="w-full h-full border-0 bg-white"
                        onLoad={() => setPreviewLoading(false)}
                        onError={() => { setUseAltViewer(false); setPreviewError(true); }}
                      />
                    ) : (
                      <iframe
                        allowFullScreen
                        key={currentUrl}
                        src={currentUrl}
                        title="Recurso PDF"
                        className="w-full h-full border-0"
                        onLoad={() => setPreviewLoading(false)}
                        onError={() => { setPreviewLoading(false); setPreviewError(true); }}
                      />
                    )}
                  </>
                ) : (
                  <div className="text-sm text-gray-500">Selecciona un archivo para previsualizar.</div>
                )}
              </div>
            </div>
          </div>
          <div className="px-4 md:px-6 py-3 border-t flex justify-end bg-gray-50">
            <button onClick={closeResourcesModal} className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-md w-full md:w-auto">Cerrar</button>
          </div>
        </div>
      </div>
    );
  };

  // Función para renderizar las áreas principales
  const renderAreas = () => (
    <div className="min-h-screen bg-transparent dark:bg-transparent px-0 sm:px-2 md:px-3 lg:px-4 xl:px-6 2xl:px-8 py-4 lg:py-8">
      <div className="max-w-7xl mx-auto">
        {error && !loading && (
          <div className="mb-4 p-4 rounded-xl border border-red-200 bg-red-50 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 text-sm text-red-700">
              {error} {retryCount > 0 && retryCount <= MAX_RETRIES && `(reintento ${retryCount}/${MAX_RETRIES})`}
            </div>
            <div className="flex gap-2">
              {retryCount <= MAX_RETRIES && (
                <button onClick={manualRetry} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 active:scale-95">Reintentar</button>
              )}
              <button onClick={() => window.location.reload()} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 active:scale-95">Recargar</button>
            </div>
          </div>
        )}
        {catalogError && (
          <div className="mb-4 p-3 rounded-xl bg-yellow-50 border border-yellow-200 text-sm text-yellow-800">{catalogError}</div>
        )}
        {/* Header - Mejorado para móviles */}
        <div className="bg-white border-2 border-gray-200/50 rounded-xl sm:rounded-2xl shadow-lg mb-6 sm:mb-8">
          <div className="px-4 sm:px-6 py-6 sm:py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 tracking-tight">
                  ACTIVIDADES Y EVALUACIONES
                </h1>
                <p className="text-sm sm:text-base text-gray-600 font-medium">
                  Selecciona el área de estudio que deseas explorar
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
                  <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white">
                  <Trophy className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                </div>
              </div>

              <div className="flex flex-col items-center">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-violet-600 via-indigo-700 to-purple-700 bg-clip-text text-transparent tracking-wide">
                  ÁREAS DE ESTUDIO
                </h2>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="w-12 sm:w-16 h-1 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full"></div>
                  <div className="w-12 sm:w-16 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de áreas - Mejorado para móviles */}
        {/* Grid responsive: optimizado para móviles y tablets */}
        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {(loadingCatalog || loading) && areasData.length === 0 && (
            <div className="col-span-full py-8 text-center text-sm sm:text-base text-gray-500 font-medium">Cargando áreas...</div>
          )}
          {areasData.map((area) => (
            <div key={area.id} className="[tap-highlight-color:transparent]">
              <UnifiedCard
                title={area.titulo}
                description={area.descripcion}
                icon={area.icono}
                containerClasses={`${area.bgColor} ${area.borderColor} bg-gradient-to-br border-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
                iconWrapperClass={`bg-gradient-to-br ${area.color} ring-2 ring-white/50`}
                minHeight={CARD_HEIGHT_PX}
                onClick={() => handleSelectArea(area)}
                footer={<div className="inline-flex items-center text-gray-700 font-bold tracking-wide"><span className="group-hover:text-gray-900 transition-colors text-xs sm:text-sm">Explorar área</span><ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 sm:ml-2 rotate-180 group-hover:translate-x-1 transition-transform" /></div>}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // BACKEND: Función para renderizar módulos específicos con control de acceso
  const renderModulos = () => {
    const hasInitialArea = allowedActivityAreas.length > 0;

    return (
      <div className="min-h-screen bg-white px-0 sm:px-2 md:px-3 lg:px-4 xl:px-6 2xl:px-8 py-4 lg:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header con navegación - Mejorado para móviles */}
          <div className="bg-white border-2 border-gray-200/50 rounded-xl sm:rounded-2xl shadow-lg mb-6 sm:mb-8">
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
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {(loadingCatalog || loading) && modulosEspecificos.length === 0 && (
              <div className="col-span-full py-6 text-center text-sm sm:text-base text-gray-500 font-medium">Cargando módulos...</div>
            )}
            {modulosEspecificos.map((modulo) => {
              const isAllowed = allowedActivityAreas.includes(modulo.id);
              const request = activityRequests.find(req => req.areaId === modulo.id);
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
                      <span>Ver actividades</span>
                      <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 rotate-180 group-hover:translate-x-1.5 transition-transform" />
                    </div>
                  );
                } else if (isPending) {
                  // Estado pendiente: no permitir entrar ni acceso temporal
                  isClickable = false;
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
                // Estado inicial: Elige tu primera área
                isClickable = true;
                actionHandler = () => handleInitialAreaSelection(modulo.id);
                footerContent = (
                  <div className="inline-flex items-center text-indigo-700 font-extrabold text-xs sm:text-sm bg-gradient-to-r from-indigo-100 to-violet-100 px-3 py-1.5 rounded-lg border border-indigo-200 shadow-sm group-hover:shadow-md transition-all ring-2 ring-indigo-200/50">
                    <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                    <span>Solicitar acceso</span>
                  </div>
                );
              }

              // Marcar tarjetas como pendientes cuando exista una solicitud pendiente
              const cardPending = isPending;

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
                    pending={cardPending}
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

  // Función para renderizar botones de actividades y quiz
  const renderButtons = () => (
    <div className="min-h-screen bg-white px-0 sm:px-2 md:px-3 lg:px-4 xl:px-6 2xl:px-8 py-4 lg:py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header con navegación - Mejorado para móviles */}
        <div className="bg-white border-2 border-gray-200/50 rounded-xl sm:rounded-2xl shadow-lg mb-6 sm:mb-8">
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
                    {selectedModulo ? selectedModulo.titulo : selectedArea?.titulo}
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 font-medium">Selecciona el tipo de contenido que deseas revisar</p>
                </div>
              </div>
              <div className="flex items-center text-xs sm:text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                <Target className="w-4 h-4 mr-1.5 text-violet-600" />
                <span className="font-semibold">2 tipos disponibles</span>
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
                  <Target className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white">
                  <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                </div>
              </div>

              <div className="flex flex-col items-center">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-700 to-indigo-700 bg-clip-text text-transparent tracking-wide">
                  Actividades y Quizzes
                </h2>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="w-12 sm:w-16 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"></div>
                  <div className="w-12 sm:w-16 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjetas tipo (responsive + altura uniforme usando UnifiedCard) - Mejoradas */}
        <div className="mx-auto w-full">
          {/* En desktop mostramos exactamente dos tarjetas grandes centradas - Mejoradas */}
          <div className="hidden lg:flex justify-center gap-8 xl:gap-10 max-w-6xl mx-auto">
            <UnifiedCard
              title="Actividades"
              description="Tareas y ejercicios prácticos para reforzar tu aprendizaje"
              icon={<FileText className="w-8 h-8 text-white" />}
              containerClasses="bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 border-2 border-blue-300/50 lg:w-[400px] xl:w-[450px] shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ring-2 ring-blue-100/50"
              iconWrapperClass="bg-gradient-to-br from-blue-500 via-indigo-600 to-cyan-600 ring-4 ring-blue-200/50 shadow-lg"
              minHeight={CARD_HEIGHT_PX + 60}
              onClick={() => handleSelectType('actividades')}
              footer={<div className="inline-flex items-center text-blue-700 font-extrabold text-sm sm:text-base bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-2 rounded-xl border-2 border-blue-200 shadow-sm group-hover:shadow-md transition-all"><span>ACCEDER</span><ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 ml-2 rotate-180 group-hover:translate-x-2 transition-transform" /></div>}
            />
            <UnifiedCard
              title="Quizzes"
              description="Cuestionarios y evaluaciones en línea"
              icon={<Brain className="w-8 h-8 text-white" />}
              containerClasses="bg-gradient-to-br from-purple-50 via-pink-50 to-fuchsia-50 border-2 border-purple-300/50 lg:w-[400px] xl:w-[450px] shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ring-2 ring-purple-100/50"
              iconWrapperClass="bg-gradient-to-br from-purple-500 via-pink-600 to-fuchsia-600 ring-4 ring-purple-200/50 shadow-lg"
              minHeight={CARD_HEIGHT_PX + 60}
              onClick={() => handleSelectType('quiz')}
              footer={<div className="inline-flex items-center text-purple-700 font-extrabold text-sm sm:text-base bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-xl border-2 border-purple-200 shadow-sm group-hover:shadow-md transition-all"><span>ACCEDER</span><ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 ml-2 rotate-180 group-hover:translate-x-2 transition-transform" /></div>}
            />
          </div>
          {/* Mobile / tablet grid: 2 columnas en todas las resoluciones < lg - Mejoradas */}
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:hidden auto-rows-fr gap-4 sm:gap-5 md:gap-6 max-w-5xl mx-auto">
            <UnifiedCard
              title="Actividades"
              description="Tareas y ejercicios prácticos para reforzar tu aprendizaje"
              icon={<FileText className="w-7 h-7 sm:w-8 sm:h-8 text-white" />}
              containerClasses="bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 border-2 border-blue-300/50 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ring-2 ring-blue-100/50"
              iconWrapperClass="bg-gradient-to-br from-blue-500 via-indigo-600 to-cyan-600 ring-3 ring-blue-200/50 shadow-lg"
              minHeight={CARD_HEIGHT_PX + 20}
              onClick={() => handleSelectType('actividades')}
              footer={<div className="inline-flex items-center text-blue-700 font-extrabold text-xs sm:text-sm bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-1.5 rounded-lg border-2 border-blue-200 shadow-sm group-hover:shadow-md transition-all"><span>ACCEDER</span><ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 rotate-180 group-hover:translate-x-1.5 transition-transform" /></div>}
            />
            <UnifiedCard
              title="Quizzes"
              description="Cuestionarios y evaluaciones en línea"
              icon={<Brain className="w-7 h-7 sm:w-8 sm:h-8 text-white" />}
              containerClasses="bg-gradient-to-br from-purple-50 via-pink-50 to-fuchsia-50 border-2 border-purple-300/50 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ring-2 ring-purple-100/50"
              iconWrapperClass="bg-gradient-to-br from-purple-500 via-pink-600 to-fuchsia-600 ring-3 ring-purple-200/50 shadow-lg"
              minHeight={CARD_HEIGHT_PX + 20}
              onClick={() => handleSelectType('quiz')}
              footer={<div className="inline-flex items-center text-purple-700 font-extrabold text-xs sm:text-sm bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1.5 rounded-lg border-2 border-purple-200 shadow-sm group-hover:shadow-md transition-all"><span>ACCEDER</span><ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 rotate-180 group-hover:translate-x-1.5 transition-transform" /></div>}
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Función para renderizar tabla de actividades (versión unificada single-submission)
  const renderTablaActividades = () => (
    <div className="px-0 sm:px-3 md:px-4 lg:px-6 py-6">

      <div className="bg-white border-2 border-gray-200/50 rounded-xl sm:rounded-2xl shadow-lg mb-6 sm:mb-8">
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
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 mb-2">Actividades</h1>
                <p className="text-sm sm:text-base text-gray-600 font-medium">{selectedArea?.titulo}</p>
              </div>
            </div>
            <div className="flex items-center text-xs sm:text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
              <Target className="w-4 h-4 mr-1.5 text-violet-600" />
              <span className="font-semibold">{filteredActividades.length} actividades disponibles</span>
            </div>
          </div>
        </div>
      </div>


      <div className="bg-gradient-to-r from-cyan-50 via-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl border-2 border-cyan-200/50 shadow-lg p-6 sm:p-8 mb-6 sm:mb-8 relative overflow-hidden ring-2 ring-cyan-100/50">
        <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-cyan-100/40 to-indigo-100/40 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-tr from-blue-100/40 to-cyan-100/40 rounded-full blur-xl"></div>

        <div className="flex items-center justify-center relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-xl ring-4 ring-cyan-200/50">
                <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white">
                <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
              </div>
            </div>

            <div className="flex flex-col items-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-700 to-indigo-700 bg-clip-text text-transparent tracking-wide">
                ACTIVIDADES DISPONIBLES
              </h2>
              <div className="flex items-center space-x-2 mt-2">
                <div className="w-12 sm:w-16 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"></div>
                <div className="w-12 sm:w-16 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros (UX optimizada para móviles) - Mejorado */}
      <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200/50 shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
          <div className="text-sm sm:text-base md:text-lg font-extrabold text-gray-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600" />
            <span>Filtrar actividades</span>
          </div>
          {isMobile ? (
            <div className="relative w-full">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between w-full px-3 sm:px-4 py-2 text-left bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
              >
                <span className="truncate">{getSelectedMonthName()}</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isDropdownOpen && (
                <div className="absolute z-[80] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-2xl max-h-72 overflow-y-auto">
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => { handleMonthSelect('all'); setIsDropdownOpen(false); }}
                      className={`block w-full px-4 py-3 text-left text-base hover:bg-gray-100 ${selectedMonth === 'all' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                      role="option"
                      aria-selected={selectedMonth === 'all'}
                    >
                      Todos los meses
                    </button>
                    {months.map((month, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => { handleMonthSelect(index.toString()); setIsDropdownOpen(false); }}
                        className={`block w-full px-4 py-3 text-left text-base hover:bg-gray-100 ${selectedMonth === index.toString() ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                        role="option"
                        aria-selected={selectedMonth === index.toString()}
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between w-56 sm:w-64 px-3 sm:px-4 py-2 text-left bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
              >
                <span>{getSelectedMonthName()}</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isDropdownOpen && (
                <div className="absolute z-[70] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-64 overflow-auto">
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => { handleMonthSelect('all'); setIsDropdownOpen(false); }}
                      className={`block w-full px-4 py-2 text-left hover:bg-gray-100 ${selectedMonth === 'all' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                    >
                      Todos los meses
                    </button>
                    {months.map((month, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => { handleMonthSelect(index.toString()); setIsDropdownOpen(false); }}
                        className={`block w-full px-4 py-2 text-left hover:bg-gray-100 ${selectedMonth === index.toString() ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                        role="option"
                        aria-selected={selectedMonth === index.toString()}
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Nueva tabla single-submission - Mejorada para móviles */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border-2 border-gray-200/50 ring-2 ring-gray-100/50">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500">
              <tr>
                <th className="px-3 sm:px-4 py-3 sm:py-4 text-left text-xs font-extrabold text-white uppercase tracking-widest">No.</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-extrabold text-white uppercase tracking-widest">Actividad</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-extrabold text-white uppercase tracking-widest">Recursos</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-extrabold text-white uppercase tracking-widest">Fecha Límite</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-extrabold text-white uppercase tracking-widest">Subir / Editar</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-extrabold text-white uppercase tracking-widest">Entregado</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-extrabold text-white uppercase tracking-widest">Visualizar</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-extrabold text-white uppercase tracking-widest">Calificación</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200/50">
              {loading && (
                <tr>
                  <td colSpan={8} className="px-4 sm:px-6 py-6 sm:py-8 text-center text-sm sm:text-base text-gray-500 font-medium">Cargando actividades...</td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={8} className="px-4 sm:px-6 py-6 sm:py-8 text-center text-sm sm:text-base text-red-600 font-semibold">{error}</td>
                </tr>
              )}
              {!loading && !error && filteredActividades.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 sm:px-6 py-6 sm:py-8 text-center text-sm sm:text-base text-gray-500 font-medium">No hay actividades.</td>
                </tr>
              )}
              {!loading && !error && filteredActividades.map((actividad, index) => {
                const vencida = !isWithinDeadline(actividad.fechaEntrega);
                // Verificar permiso de edición (puede venir como 0/1, true/false, o string)
                const tienePermisoEditar = actividad.permite_editar_despues_calificada === true ||
                  actividad.permite_editar_despues_calificada === 1 ||
                  actividad.permite_editar_despues_calificada === '1' ||
                  String(actividad.permite_editar_despues_calificada) === '1';
                // Bloqueado si ya fue revisada (calificada) y no permite editar, o si está vencida
                const puedeEditar = actividad.entregada && !vencida && 
                  (actividad.estado !== 'revisada' || tienePermisoEditar);
                
                // Debug temporal
                if (actividad.estado === 'revisada' && actividad.entregada) {
                  console.log(`[DEBUG] Actividad ${actividad.id}:`, {
                    estado: actividad.estado,
                    permite_editar_despues_calificada: actividad.permite_editar_despues_calificada,
                    tienePermisoEditar,
                    puedeEditar,
                    vencida
                  });
                }
                return (
                  <tr key={actividad.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-violet-50/30 transition-colors duration-200`}>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-sm text-gray-700 font-extrabold">{index + 1}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div>
                        <div className="text-sm sm:text-base font-bold text-gray-900">{actividad.nombre}</div>
                        {actividad.descripcion && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            <p
                              style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textAlign: 'justify',
                                maxWidth: descMaxCh,
                                wordBreak: 'break-word'
                              }}
                            >
                              {actividad.descripcion}
                            </p>
                            {String(actividad.descripcion).length > 160 && (
                              <button
                                onClick={() => openLongText(actividad.nombre, actividad.descripcion, { tipo: 'actividad', id: actividad.id })}
                                className="mt-1 text-[11px] text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                Ver más
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      {actividad.recursos && actividad.recursos.length > 0 && (
                        <button
                          onClick={() => openResourcesModal(actividad)}
                          className="inline-flex items-center px-2.5 py-1.5 text-xs font-bold rounded-lg text-blue-700 hover:text-blue-900 hover:bg-blue-50 border-2 border-blue-200 active:scale-95 transition-all touch-manipulation shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" /> {actividad.recursos.length} PDF{actividad.recursos.length > 1 ? 's' : ''}
                        </button>
                      )}
                      {!actividad.recursos?.length && actividad.plantilla && (
                        <button
                          onClick={() => handleDownload(actividad.id)}
                          className="inline-flex items-center px-2.5 py-1.5 text-xs font-bold rounded-lg text-blue-700 hover:text-blue-900 hover:bg-blue-50 border-2 border-blue-200 active:scale-95 transition-all touch-manipulation shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" /> PDF
                        </button>
                      )}
                      {!actividad.plantilla && (!actividad.recursos || actividad.recursos.length === 0) && (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm text-gray-900 font-semibold">{new Date(actividad.fechaEntrega).toLocaleDateString('es-ES')}</div>
                      {actividad.fecha_limite_original && actividad.fechaEntrega && 
                       new Date(actividad.fechaEntrega).getTime() > new Date(actividad.fecha_limite_original).getTime() && (
                        <div className="text-[10px] sm:text-xs text-purple-600 font-bold bg-purple-50 px-1.5 py-0.5 rounded mt-0.5">✨ Fecha extendida</div>
                      )}
                      <div className={`text-[10px] sm:text-xs font-bold ${vencida ? 'text-red-600' : 'text-green-600'}`}>{vencida ? 'Vencida' : 'A tiempo'}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      {!actividad.entregada ? (
                        <button
                          onClick={() => openUploadModal(actividad)}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 shadow-md transition-all touch-manipulation"
                        >
                          <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" /> Subir
                        </button>
                      ) : (
                        <div className="flex flex-col items-start">
                          <button
                            onClick={() => openUploadModal(actividad)}
                            disabled={!puedeEditar}
                            title={!puedeEditar && actividad.estado === 'revisada' ? 'Esta entrega ya fue calificada y no puede modificarse' : (!puedeEditar ? 'No disponible' : 'Editar entrega')}
                            className={`inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm active:scale-95 transition-all touch-manipulation ${puedeEditar ? 'text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                              }`}
                          >
                            {puedeEditar ? <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" /> : null}
                            {puedeEditar ? 'Editar' : 'Bloqueado'}
                          </button>
                          {!puedeEditar && actividad.estado === 'revisada' && !tienePermisoEditar && (
                            <span className="mt-1 text-[10px] font-bold text-purple-600">Ya calificada - no editable</span>
                          )}
                          {actividad.estado === 'revisada' && tienePermisoEditar && (
                            <span className="mt-1 text-[10px] font-bold text-emerald-600">✨ Edición permitida</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      {actividad.entregada ? (
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
                      ) : (
                        <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <button
                        onClick={() => openViewModal(actividad)}
                        disabled={!actividad.entregada}
                        className={`p-2 rounded-lg active:scale-95 transition-all touch-manipulation ${actividad.entregada ? 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50' : 'text-gray-400 cursor-not-allowed'}`}
                        title="Ver entrega"
                      >
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm">
                      {actividad.entregada ? (
                        actividad.estado === 'revisada' ? (
                          <span className="font-extrabold text-gray-900 inline-flex items-center gap-2">
                            <span className="bg-gradient-to-r from-emerald-100 to-green-100 px-2.5 py-1 rounded-lg border-2 border-emerald-200 text-emerald-700">
                              {actividad.score !== null && actividad.score !== undefined 
                                ? `${Number(actividad.score).toFixed(1)}/10` 
                                : (actividad.mejorPuntaje !== null && actividad.mejorPuntaje !== undefined 
                                  ? `${Number(actividad.mejorPuntaje > 10 ? actividad.mejorPuntaje / 10 : actividad.mejorPuntaje).toFixed(1)}/10` 
                                  : '—')}
                            </span>
                            {actividad.notas && String(actividad.notas).trim().length > 0 && (
                              <button
                                onClick={() => openNotasModal(actividad)}
                                className="relative p-1.5 rounded-lg hover:bg-blue-50 active:scale-95 text-blue-600 transition-all touch-manipulation border border-blue-200"
                                title="Ver notas del asesor"
                              >
                                <MessageSquareText className="w-4 h-4" />
                                {(() => {
                                  try {
                                    const seen = localStorage.getItem(`notas_seen_${actividad.id}`);
                                    const notasAt = actividad.notas_at ? new Date(actividad.notas_at).getTime() : 0;
                                    const seenAt = seen ? new Date(seen).getTime() : 0;
                                    const isNew = notasAt && notasAt > seenAt;
                                    return isNew ? (
                                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
                                    ) : null;
                                  } catch { return null; }
                                })()}
                              </button>
                            )}
                          </span>
                        ) : (
                          <span className="text-xs sm:text-sm text-amber-600 font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">En revisión</span>
                        )
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Función para renderizar tabla de quizzes
  const renderTablaQuiz = () => (
    <div className="px-0 sm:px-3 md:px-4 lg:px-6 py-6">

      <div className="bg-white border-2 border-gray-200/50 rounded-xl sm:rounded-2xl shadow-lg mb-6 sm:mb-8">
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
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 mb-2">Quizzes</h1>
                <p className="text-sm sm:text-base text-gray-600 font-medium">{selectedArea?.titulo}</p>
              </div>
            </div>
            <div className="flex items-center text-xs sm:text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
              <Target className="w-4 h-4 mr-1.5 text-violet-600" />
              <span className="font-semibold">{filteredActividades.length} quizzes disponibles</span>
            </div>
          </div>
        </div>
      </div>


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

            <div className="flex flex-col items-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-cyan-600 via-blue-700 to-indigo-700 bg-clip-text text-transparent tracking-wide">
                QUIZZES DISPONIBLES
              </h2>
              <div className="flex items-center space-x-2 mt-2">
                <div className="w-12 sm:w-16 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"></div>
                <div className="w-12 sm:w-16 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros (UX optimizada para móviles) - Mejorado */}
      <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200/50 shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
          <div className="text-sm sm:text-base md:text-lg font-extrabold text-gray-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600" />
            <span>Filtrar quizzes</span>
          </div>
          {isMobile ? (
            <div className="relative w-full">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between w-full px-3 sm:px-4 py-2 text-left bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
              >
                <span className="truncate">{getSelectedMonthName()}</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isDropdownOpen && (
                <div className="absolute z-[80] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-2xl max-h-72 overflow-y-auto">
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => { handleMonthSelect('all'); setIsDropdownOpen(false); }}
                      className={`block w-full px-4 py-3 text-left text-base hover:bg-gray-100 ${selectedMonth === 'all' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                      role="option"
                      aria-selected={selectedMonth === 'all'}
                    >
                      Todos los meses
                    </button>
                    {months.map((month, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => { handleMonthSelect(index.toString()); setIsDropdownOpen(false); }}
                        className={`block w-full px-4 py-3 text-left text-base hover:bg-gray-100 ${selectedMonth === index.toString() ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                        role="option"
                        aria-selected={selectedMonth === index.toString()}
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between w-56 sm:w-64 px-3 sm:px-4 py-2 text-left bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
              >
                <span>{getSelectedMonthName()}</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute z-[70] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-64 overflow-auto">
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => { handleMonthSelect('all'); setIsDropdownOpen(false); }}
                      className={`block w-full px-4 py-2 text-left hover:bg-gray-100 ${selectedMonth === 'all' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                    >
                      Todos los meses
                    </button>
                    {months.map((month, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => { handleMonthSelect(index.toString()); setIsDropdownOpen(false); }}
                        className={`block w-full px-4 py-2 text-left hover:bg-gray-100 ${selectedMonth === index.toString() ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                        role="option"
                        aria-selected={selectedMonth === index.toString()}
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quizzes responsive: tarjetas en móvil, tabla en desktop */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border-2 border-gray-200/50 ring-2 ring-gray-100/50">
        {/* Vista de tarjetas para móviles */}
        <div className="block md:hidden space-y-3 p-3">
          {!loading && !error && filteredActividades.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              No hay quizzes disponibles por ahora en esta materia. Intenta cambiar de mes o vuelve más tarde.
            </div>
          )}
          {pagedQuizzes.map((quiz) => {
            const est = computeQuizEstado(quiz);
            const available = isQuizAvailable(quiz);
            const attempts = getTotalAttempts(quiz.id);
            const showResults = attempts > 0;
            const displayResults = showResults || !available;
            const isOpen = isQuizOpenElsewhere(quiz.id);
            return (
              <div key={quiz.id} className="bg-white border-2 border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                {/* Header con título y estado */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 pr-2">
                    <h3 className="text-sm font-bold text-gray-900 leading-tight mb-1">{quiz.nombre}</h3>
                    <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-full border ${
                      est === 'completado' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                      est === 'disponible' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                      'bg-red-100 text-red-800 border-red-200'
                    }`}>
                      {est === 'completado' ? 'Completado' : est === 'disponible' ? 'Disponible' : 'Vencido'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { if (available && !isOpen) handleIniciarSimulacion(quiz.id); }}
                      className={`p-2 rounded-lg transition-all ${(!available || isOpen) ? 'text-gray-400 cursor-not-allowed' : 'text-emerald-600 hover:bg-emerald-50'}`}
                      disabled={!available || isOpen}
                    >
                      <Play className="w-5 h-5" />
                    </button>
                    {displayResults && (
                      <button
                        onClick={() => handleVisualizarResultados(quiz.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Descripción */}
                {quiz.descripcion && (
                  <div 
                    onClick={() => openLongText(quiz.nombre, quiz.descripcion, { tipo: 'quiz', id: quiz.id })}
                    className="mb-3 cursor-pointer"
                  >
                    <p className="text-xs text-gray-600 line-clamp-2 mb-1">{quiz.descripcion}</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); openLongText(quiz.nombre, quiz.descripcion, { tipo: 'quiz', id: quiz.id }); }}
                      className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                    >
                      Ver instrucciones
                    </button>
                  </div>
                )}

                {/* Información en grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-gray-500 font-medium mb-0.5">Fecha límite</div>
                    <div className="text-gray-900 font-semibold">
                      {quiz.fechaEntrega ? new Date(quiz.fechaEntrega).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }) : 'Sin fecha'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 font-medium mb-0.5">Mejor puntaje</div>
                    <div className="text-gray-900 font-bold">
                      {getBestScore(quiz.id) !== 'En revisión' ? `${getBestScore(quiz.id)}%` : getBestScore(quiz.id)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 font-medium mb-0.5">Intentos</div>
                    <div className="text-gray-900 font-bold">
                      {attempts} / {quiz.maxIntentos}
                    </div>
                    {attempts > 0 && (
                      <button
                        onClick={() => handleVerHistorial(quiz)}
                        className="text-xs text-purple-600 hover:text-purple-800 font-bold underline mt-0.5"
                      >
                        Ver historial
                      </button>
                    )}
                  </div>
                  <div>
                    <div className="text-gray-500 font-medium mb-0.5">Tiempo</div>
                    <div className="text-gray-900 font-semibold">{quiz.tiempoLimite}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabla para desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200/50 text-sm">
            <thead className="bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500">
              <tr>
                <th className="px-1.5 sm:px-2 md:px-3 lg:px-6 py-1.5 sm:py-2 md:py-3 lg:py-4 text-left font-extrabold text-white uppercase tracking-tight text-[9px] sm:text-[10px] md:text-xs">
                  Quiz
                </th>
                <th className="px-1.5 sm:px-2 md:px-3 lg:px-6 py-1.5 sm:py-2 md:py-3 lg:py-4 text-left font-extrabold text-white uppercase tracking-tight text-[9px] sm:text-[10px] md:text-xs">
                  Fecha Límite
                </th>
                <th className="px-1.5 sm:px-2 md:px-3 lg:px-6 py-1.5 sm:py-2 md:py-3 lg:py-4 text-left font-extrabold text-white uppercase tracking-tight text-[9px] sm:text-[10px] md:text-xs">
                  Estado
                </th>
                <th className="px-1.5 sm:px-2 md:px-3 lg:px-6 py-1.5 sm:py-2 md:py-3 lg:py-4 text-left font-extrabold text-white uppercase tracking-tight text-[9px] sm:text-[10px] md:text-xs">
                  Mejor Puntaje
                </th>
                <th className="px-1.5 sm:px-2 md:px-3 lg:px-6 py-1.5 sm:py-2 md:py-3 lg:py-4 text-left font-extrabold text-white uppercase tracking-tight text-[9px] sm:text-[10px] md:text-xs">
                  Intentos
                </th>
                <th className="px-1.5 sm:px-2 md:px-3 lg:px-6 py-1.5 sm:py-2 md:py-3 lg:py-4 text-center font-extrabold text-white uppercase tracking-tight text-[9px] sm:text-[10px] md:text-xs">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200/50">
              {!loading && !error && filteredActividades.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-2 sm:px-4 md:px-6 py-6 sm:py-8 md:py-10 text-center text-gray-500 text-[10px] sm:text-xs md:text-sm">
                    No hay quizzes disponibles por ahora en esta materia. Intenta cambiar de mes o vuelve más tarde.
                  </td>
                </tr>
              )}
              {pagedQuizzes.map((quiz, index) => (
                <tr key={quiz.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-violet-50/30 transition-colors duration-200`}>
                  <td className="px-1.5 sm:px-2 md:px-3 lg:px-6 py-1.5 sm:py-2 md:py-3 lg:py-4">
                    <div>
                      <div className="text-[10px] sm:text-xs md:text-sm lg:text-base font-bold text-gray-900 leading-tight">{quiz.nombre}</div>
                      {quiz.descripcion && (
                        <div 
                          onClick={() => openLongText(quiz.nombre, quiz.descripcion, { tipo: 'quiz', id: quiz.id })}
                          className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm text-gray-500 mt-0.5 cursor-pointer group"
                        >
                          <p
                            style={{
                              display: '-webkit-box',
                              WebkitLineClamp: isMobile ? 1 : 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textAlign: 'justify',
                              maxWidth: isMobile ? '100%' : descMaxCh,
                              wordBreak: 'break-word',
                              lineHeight: '1.3'
                            }}
                            className="group-hover:text-gray-700 transition-colors"
                          >
                            {quiz.descripcion}
                          </p>
                          <button
                            onClick={(e) => { e.stopPropagation(); openLongText(quiz.nombre, quiz.descripcion, { tipo: 'quiz', id: quiz.id }); }}
                            className="mt-0.5 text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                          >
                            Ver instrucciones
                          </button>
                        </div>
                      )}
                      <div className="text-[8px] sm:text-[9px] md:text-xs text-gray-400 mt-0.5">
                        Tiempo: {quiz.tiempoLimite} | Intentos: {quiz.maxIntentos}
                      </div>
                    </div>
                  </td>
                  <td className="px-1.5 sm:px-2 md:px-3 lg:px-6 py-1.5 sm:py-2 md:py-3 lg:py-4 whitespace-nowrap">
                    <div className="text-[9px] sm:text-[10px] md:text-xs lg:text-sm text-gray-900 font-semibold leading-tight">
                      {quiz.fechaEntrega ? new Date(quiz.fechaEntrega).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }) : 'Sin fecha'}
                    </div>
                    <div className={`text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs font-bold ${isWithinDeadline(quiz.fechaEntrega) ? 'text-emerald-600' : 'text-red-600'}`}>
                      {isWithinDeadline(quiz.fechaEntrega) ? 'Disponible' : (quiz.fechaEntrega ? 'Vencido' : 'Disponible')}
                    </div>
                  </td>
                  <td className="px-1.5 sm:px-2 md:px-3 lg:px-6 py-1.5 sm:py-2 md:py-3 lg:py-4 whitespace-nowrap">
                    {(() => {
                      const est = computeQuizEstado(quiz); return (
                        <span className={`inline-flex px-1 sm:px-1.5 md:px-2.5 py-0.5 text-[8px] sm:text-[9px] md:text-xs font-extrabold rounded-full border ${est === 'completado' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                          est === 'disponible' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            'bg-red-100 text-red-800 border-red-200'
                          }`}>
                          {est === 'completado' ? 'Completado' : est === 'disponible' ? 'Disponible' : 'Vencido'}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-1.5 sm:px-2 md:px-3 lg:px-6 py-1.5 sm:py-2 md:py-3 lg:py-4 whitespace-nowrap">
                    <div className="text-[10px] sm:text-xs md:text-sm lg:text-base font-bold text-gray-900">
                      {getBestScore(quiz.id) !== 'En revisión' ? `${getBestScore(quiz.id)}%` : getBestScore(quiz.id)}
                    </div>
                    {quiz.score && (
                      <div className="text-[8px] sm:text-[9px] md:text-xs text-gray-500 font-medium">
                        de {quiz.maxScore}%
                      </div>
                    )}
                  </td>
                  <td className="px-1.5 sm:px-2 md:px-3 lg:px-6 py-1.5 sm:py-2 md:py-3 lg:py-4 whitespace-nowrap">
                    <div className="text-[10px] sm:text-xs md:text-sm lg:text-base font-bold text-gray-900">
                      {getTotalAttempts(quiz.id)} / {quiz.maxIntentos}
                    </div>
                    {getTotalAttempts(quiz.id) > 0 && (
                      <button
                        onClick={() => handleVerHistorial(quiz)}
                        className="text-[8px] sm:text-[9px] md:text-xs text-purple-600 hover:text-purple-800 font-bold underline"
                      >
                        Ver historial
                      </button>
                    )}
                  </td>
                  <td className="px-1.5 sm:px-2 md:px-3 lg:px-6 py-1.5 sm:py-2 md:py-3 lg:py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-0.5 sm:space-x-1 md:space-x-2">
                      {(() => {
                        const available = isQuizAvailable(quiz);
                        const retryable = canRetry(quiz);
                        const attempts = getTotalAttempts(quiz.id);
                        const showResults = attempts > 0;
                        const displayResults = showResults || !available;
                        const isOpen = isQuizOpenElsewhere(quiz.id);
                        return (
                          <>
                            <button
                              onClick={() => { if (available && !isOpen) handleIniciarSimulacion(quiz.id); }}
                              className={`p-1 sm:p-1.5 md:p-2 rounded-lg transition-all active:scale-95 touch-manipulation ${(!available || isOpen) ? 'text-gray-400 cursor-not-allowed' : 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50'}`}
                              title={isOpen ? 'Ya abierto en otra pestaña' : (available ? 'Iniciar quiz' : 'No disponible')}
                              disabled={!available || isOpen}
                            >
                              <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" />
                            </button>
                            {displayResults && (
                              <button
                                onClick={() => handleVisualizarResultados(quiz.id)}
                                className="p-1 sm:p-1.5 md:p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all active:scale-95 touch-manipulation"
                                title={showResults ? 'Ver resultados' : 'Ver resultados (no hay intentos registrados)'}
                              >
                                <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" />
                              </button>
                            )}
                            {/* Botón de reintento removido: los reintentos se gestionan al iniciar si hay intentos disponibles */}
                            {!available && !retryable && !showResults && (
                              <span className="text-[8px] sm:text-[9px] md:text-xs text-gray-500">No disponible</span>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-200 bg-white">
          <Pagination
            totalItems={quizTotal}
            pageSize={QUIZ_PAGE_SIZE}
            currentPage={quizPage}
            onPageChange={setQuizPage}
          />
        </div>
      </div>
    </div>
  );

  // Función principal de renderizado
  return (
    <div className="min-h-screen bg-white">
      {currentLevel === 'areas' && renderAreas()}
      {currentLevel === 'modulos' && renderModulos()}
      {currentLevel === 'buttons' && renderButtons()}
      {currentLevel === 'table' && (selectedType === 'actividades' ? renderTablaActividades() : renderTablaQuiz())}

      {/* Modales */}
      {renderUploadModal()}
      {renderViewModal()}
      <HistorialModal
        open={!!showHistorialModal}
        item={selectedQuizHistorial}
        historial={selectedQuizHistorial ? getQuizHistorial(selectedQuizHistorial.id) : null}
        onClose={closeHistorialModal}
      />
      {/* Resultados ahora es página completa: /alumno/actividades/quiz/:quizId/resultados */}
      {renderNotificationModal()}
      {renderStartQuizModal()}
      {renderResourcesModal()}
      {longTextModal.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 px-2 sm:px-3 lg:px-4 2xl:px-6 py-4 sm:py-6" onClick={closeLongText}>
          <div
            className="bg-white rounded-xl shadow-2xl w-full flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden"
            style={{ width: modalWidth, transform: modalOffsetX ? `translateX(${modalOffsetX}px)` : undefined }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header fijo */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-3 sm:py-4 flex-shrink-0">
              <h2 className="text-base sm:text-lg lg:text-[15px] 2xl:text-[14px] font-bold break-words" title={longTextModal.title}>{longTextModal.title}</h2>
            </div>
            {/* Contenido con scroll */}
            <div className="flex-1 overflow-y-auto px-3 py-2 sm:p-3 lg:p-4 min-h-0">
              <div 
                className="text-sm sm:text-base lg:text-[12px] xl:text-[12.5px] 2xl:text-[12.5px] text-gray-800 whitespace-pre-wrap pr-1 sm:pr-2" 
                style={{ 
                  textAlign: 'justify', 
                  lineHeight: 1.42, 
                  wordBreak: 'break-word', 
                  maxWidth: (isMobile ? '42ch' : (isTablet ? (isLandscape ? '40ch' : '44ch') : '44ch')), 
                  margin: '0 auto' 
                }}
              >
                {longTextModal.content}
              </div>
            </div>
            {/* Footer fijo */}
            <div className="px-3 py-2 sm:p-3 lg:p-4 border-t border-gray-200 flex-shrink-0 flex justify-end bg-white">
              <button onClick={closeLongText} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-[13px] sm:text-sm lg:text-[12px] 2xl:text-[11px] transition-colors">Cerrar</button>
            </div>
          </div>
        </div>
      )}
      {showNotasModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeNotasModal}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-5">
              <div className="flex items-center gap-2">
                <MessageSquareText className="w-6 h-6" />
                <h2 className="text-lg font-bold">Notas del asesor</h2>
              </div>
              {notasActividad?.nombre && (
                <p className="text-sm text-blue-100 mt-1 truncate">{notasActividad.nombre}</p>
              )}
            </div>
            <div className="p-5">
              {notasContent && String(notasContent).trim().length > 0 ? (
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap text-gray-800 text-sm">{notasContent}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No hay notas registradas.</p>
              )}
              {notasActividad?.notas_at && (
                <p className="mt-3 text-xs text-gray-400">Última actualización: {new Date(notasActividad.notas_at).toLocaleString('es-ES')}</p>
              )}
              <div className="mt-5 flex justify-end">
                <button onClick={closeNotasModal} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm">Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay para cerrar dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
}

export default Actividades_Alumno_comp;