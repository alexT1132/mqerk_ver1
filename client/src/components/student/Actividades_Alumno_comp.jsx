// BACKEND: Componente de Actividades del Alumno
// Este componente maneja la página de actividades y tareas del estudiante con 4 niveles:
// 1. Tarjetas de áreas/módulos/materias
// 2. Lista de materias específicas del área
// 3. Botones de Actividades y Quiz por materia
// 4. Tabla de actividades específicas con funcionalidad completa
import React, { useState, useEffect, useRef } from 'react';
import { getAreasCatalog } from '../../api/areas';
import { AREAS_CATALOG_CACHE } from '../../utils/catalogCache';
import { styleForArea } from '../common/areaStyles.jsx';
import UnifiedCard from '../common/UnifiedCard.jsx';
import { resumenActividadesEstudiante, crearOReemplazarEntrega, agregarEntrega } from '../../api/actividades';
import { resumenQuizzesEstudiante, crearIntentoQuiz, listIntentosQuizEstudiante } from '../../api/quizzes';
import { useAuth } from '../../context/AuthContext';
import { useStudent } from '../../context/StudentContext'; // BACKEND: Control de acceso a módulos
import { useStudentNotifications } from '../../context/StudentNotificationContext';
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
  RotateCcw,
  Play,
  Lock,      // BACKEND: Icono para módulos bloqueados
  Send,      // BACKEND: Icono para solicitar acceso
  Globe,     // BACKEND: Icono para Turismo
  Anchor,    // BACKEND: Icono para Militar, Naval y Náutica Mercante
  Hourglass  // BACKEND: Icono para estado pendiente
} from 'lucide-react';

// BACKEND: Resolver URLs absolutas a archivos estáticos del backend (puerto API) evitando 404 al intentar cargar desde 5173
const RAW_API_BASE = (import.meta?.env?.VITE_API_URL) || (typeof window !== 'undefined' ? `http://${window.location.hostname}:1002/api` : '');
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
  // BACKEND: Contexto para control de acceso a módulos específicos
  const { 
    allowedActivityAreas, 
    activityRequests, 
    addAllowedActivityArea, 
    requestNewActivityAreaAccess 
  } = useStudent();
  
  // BACKEND: Determinar si el estudiante ya tiene al menos un área permitida
  const hasInitialArea = allowedActivityAreas.length > 0;

  // Estados de navegación (ampliado para módulos específicos)
  const [currentLevel, setCurrentLevel] = useState('areas'); // 'areas', 'modulos', 'buttons', 'table'
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedModulo, setSelectedModulo] = useState(null); // Nuevo estado para módulos específicos
  const [selectedType, setSelectedType] = useState(null); // 'actividades' | 'quiz'

  // Estados para actividades (similar a Feedback)
  const [actividades, setActividades] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Estados para modales (inspirado en Feedback)
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedActividad, setSelectedActividad] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  // Eliminado modal de edición separado; se usa un único modal para subir / reemplazar
  const [viewingActivityFile, setViewingActivityFile] = useState('');
  const [uploadSelectedFile, setUploadSelectedFile] = useState(null); // Archivo seleccionado en el modal
  const [uploadError, setUploadError] = useState('');
  const [pdfError, setPdfError] = useState(false); // Error de carga de PDF en visor
  // UI: menú de recursos múltiples por actividad
  const [openResourceMenu, setOpenResourceMenu] = useState(null); // (legacy dropdown) mantengo por compatibilidad (ya no se usa)
  const [showResourcesModal, setShowResourcesModal] = useState(false);
  const [resourcesActividad, setResourcesActividad] = useState(null); // actividad seleccionada para recursos
  const [previewRecurso, setPreviewRecurso] = useState(null); // recurso seleccionado para vista previa
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const [previewKey, setPreviewKey] = useState(0); // para forzar recarga
  
  // Estados para modal de historial de quizzes
  const [showHistorialModal, setShowHistorialModal] = useState(false);
  const [selectedQuizHistorial, setSelectedQuizHistorial] = useState(null);
  
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
  const [gradeRefreshKey, setGradeRefreshKey] = useState(0);
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
        const calValue = calMatch ? parseInt(calMatch[1],10) : null;
        if (calValue !== null && latestGrade.metadata?.actividadId) {
          setActividades(prev => prev.map(a => a.id === latestGrade.metadata.actividadId ? { ...a, score: calValue, mejorPuntaje: calValue, estado: 'revisada' } : a));
        }
      }
    }
  }, [notifications, selectedType]);
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

  const [areasData, setAreasData] = useState([]); // desde API (generales)
  const [modulosEspecificos, setModulosEspecificos] = useState([]); // desde API (modulos)
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [catalogError, setCatalogError] = useState('');
  // Usar styleForArea compartido
  const styleFor = styleForArea;

  useEffect(()=> {
    let cancel=false;
    const fromCache = AREAS_CATALOG_CACHE.get();
    if (fromCache?.data) {
      const payload = fromCache.data;
      const generales = Array.isArray(payload.generales) ? payload.generales : [];
      const modulos = Array.isArray(payload.modulos) ? payload.modulos : [];
      const mappedGenerales = generales.map(a=> ({ id:a.id, titulo:a.nombre, descripcion:a.descripcion, ...styleFor(a.id) }));
      if (payload.contenedor) {
        mappedGenerales.push({ id: payload.contenedor.id, titulo: payload.contenedor.nombre, descripcion: payload.contenedor.descripcion, ...styleFor(payload.contenedor.id) });
      }
      setAreasData(mappedGenerales);
      setModulosEspecificos(modulos.map(m=> ({ id:m.id, titulo:m.nombre, descripcion:m.descripcion, ...styleFor(m.id) })));
      // Si está fresco y no stale evitamos refetch
      if (!fromCache.stale) return; // stale-while-revalidate: mostramos y luego revalidamos abajo
    }
    const load = async (silent=false)=> {
      if(!silent) { setLoadingCatalog(true); setCatalogError(''); }
      try {
        const res = await getAreasCatalog();
        const payload = res.data?.data || res.data || {};
        AREAS_CATALOG_CACHE.set(payload);
        const generales = Array.isArray(payload.generales) ? payload.generales : [];
        const modulos = Array.isArray(payload.modulos) ? payload.modulos : [];
        if(cancel) return;
        const mappedGenerales = generales.map(a=> ({ id:a.id, titulo:a.nombre, descripcion:a.descripcion, ...styleFor(a.id) }));
        if (payload.contenedor) {
          mappedGenerales.push({ id: payload.contenedor.id, titulo: payload.contenedor.nombre, descripcion: payload.contenedor.descripcion, ...styleFor(payload.contenedor.id) });
        }
        setAreasData(mappedGenerales);
        setModulosEspecificos(modulos.map(m=> ({ id:m.id, titulo:m.nombre, descripcion:m.descripcion, ...styleFor(m.id) })));
      } catch(e){ if(!cancel){ setCatalogError('No se pudo cargar catálogo de áreas'); }}
      finally { if(!cancel) setLoadingCatalog(false); }
    };
    // Si venía de cache y era stale, revalidar en segundo plano (silent true)
    load(fromCache?.data ? true : false);
    return ()=> { cancel=true; };
  },[]);

  // Datos reales se cargarán desde la API según área y tipo seleccionado
  const { user } = useAuth() || {}; // user debe contener id_estudiante
  const estudianteId = user?.id_estudiante || user?.id || null;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Meses como ordinales (como en Feedback)
  const months = [
    'Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto', 'Sexto',
    'Séptimo', 'Octavo',,
  ];

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
      if (!estudianteId || !selectedType || !selectedArea) return;
      setLoading(true); setError('');
      try {
        if (selectedType === 'actividades') {
          const { data } = await resumenActividadesEstudiante(estudianteId);
          const rows = (data?.data || data || []).filter(a => {
            if(!a.id_area) return true; // sin asignación específica
            if(selectedArea.id === 5) { // contenedor de módulos específicos
              if(!selectedModulo) return false; // aún no se eligió uno
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
              return {
              id: r.id,
              nombre: r.titulo,
              descripcion: r.descripcion || '',
              fechaEntrega: r.fecha_limite,
              fechaSubida: r.entrega_estado ? (r.entregada_at ? new Date(r.entregada_at).toISOString().split('T')[0] : null) : null,
              archivo: r.archivo || null,
              entregada: !!r.entrega_estado,
                // score puede venir null aunque calificacion exista: mantenemos cal como score para mostrarla
                score: cal,
              maxScore: r.puntos_max || 100,
                estado: cal !== null ? 'revisada' : estadoCalc,
              areaId: r.id_area,
              tipo: 'actividades',
              intentos: [],
              totalIntentos: r.version || (r.entrega_estado ? 1 : 0),
                mejorPuntaje: cal,
              // Compatibilidad: usamos 'plantilla' para mostrar el botón de descarga con el primer recurso
              plantilla: r.plantilla || (firstRecurso ? firstRecurso.archivo : null),
              recursos
            };
          });
          setActividades(mapped);
        } else if (selectedType === 'quiz') {
          const { data } = await resumenQuizzesEstudiante(estudianteId);
          const rows = (data?.data || data || []).filter(q => {
            if(!q.id_area) return true;
            if(selectedArea.id === 5) {
              if(!selectedModulo) return false;
              return q.id_area === selectedModulo.id;
            }
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
      } catch (e) {
        console.error(e);
        setError('Error cargando datos');
        if (retryCount < MAX_RETRIES) {
          setRetryCount(c=>c+1);
        }
      } finally { setLoading(false); }
    };
    fetchData();
  }, [estudianteId, selectedType, selectedArea, retryCount, gradeRefreshKey]);

  const manualRetry = () => { setRetryCount(c=>c+1); };

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
              setActividades(prev => prev.map(p => p.id === act.id ? { ...p, score: mine.calificacion, mejorPuntaje: mine.calificacion, estado: 'revisada' } : p));
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
              setActividades(prev => prev.map(p => p.id === act.id ? { ...p, score: mine.calificacion, mejorPuntaje: mine.calificacion, estado: 'revisada' } : p));
            }
          } catch {/* ignore */}
        }
      } catch {/* ignore */}
    }, 12000); // 12s balancea frescura y carga
    return () => clearInterval(interval);
  }, [actividades, selectedType, estudianteId]);

  // Hook para detectar si es móvil (como en Feedback)
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  // Función para manejar la selección de área/materia
  const handleSelectArea = (area) => {
    setSelectedArea(area);
    if (area.id === 5) { // Módulos específicos
      setCurrentLevel('modulos');
    } else {
      setCurrentLevel('buttons'); // Ir directamente a los botones para otras áreas
    }
  };

  // BACKEND: Función para manejar la selección de módulo específico con control de acceso
  const handleSelectModulo = (modulo) => {
    // Solo permitir la selección si el módulo está en las áreas permitidas
    if (allowedActivityAreas.includes(modulo.id)) {
      setSelectedModulo(modulo);
      setCurrentLevel('buttons');
    } else {
      // Si no está permitido, se puede iniciar la solicitud desde la tarjeta
      console.log("Área no permitida. Debes solicitar acceso.");
    }
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
    // Para actividades el efecto useEffect hará la carga real.
  // quizzes se cargan en efecto general
  };

  // Función para regresar al nivel anterior
  const handleGoBack = () => {
    if (currentLevel === 'table') {
      setCurrentLevel('buttons');
      setSelectedType(null);
      setActividades([]);
    } else if (currentLevel === 'buttons') {
      if (selectedArea && selectedArea.id === 5) { // Si estamos en módulos específicos
        setCurrentLevel('modulos');
        setSelectedModulo(null);
      } else {
        setCurrentLevel('areas');
        setSelectedArea(null);
      }
    } else if (currentLevel === 'modulos') {
      setCurrentLevel('areas');
      setSelectedArea(null);
      setSelectedModulo(null);
    }
  };

  // Función para manejar subida de archivos (mejorada con historial de intentos)
  const handleFileUpload = async (actividadId, file) => {
    if (!file || file.type !== 'application/pdf') {
      showNotification('Archivo no válido','Por favor, selecciona únicamente archivos PDF.','warning');
      return;
    }
    if (!estudianteId) {
      showNotification('Sesión requerida','No se encontró ID de estudiante','error');
      return;
    }
    const esTipoActividad = selectedType === 'actividades';
    try {
      if (esTipoActividad) {
        const fd = new FormData();
        fd.append('archivo', file);
        fd.append('id_estudiante', estudianteId);
        // Usar siempre la ruta append para conservar historial de intentos
        await agregarEntrega(actividadId, fd).catch(async err => {
          // fallback: si ruta no existe (deploy viejo) usar comportamiento legacy
          if (err?.response?.status === 404) {
            await crearOReemplazarEntrega(actividadId, fd);
          } else throw err;
        });
        // refrescar lista
        const { data } = await resumenActividadesEstudiante(estudianteId);
        const rows = (data?.data || data || []).filter(a => {
          if(!a.id_area) return true;
          if(selectedArea.id === 5){
            if(!selectedModulo) return false;
            return a.id_area === selectedModulo.id;
          }
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
            fechaEntrega: r.fecha_limite,
            fechaSubida: r.entregada_at ? new Date(r.entregada_at).toISOString().split('T')[0] : null,
            archivo: r.archivo || null,
            entregada: !!r.entrega_estado,
            score: r.calificacion ?? null,
            maxScore: r.puntos_max || 100,
            estado: r.entrega_estado || 'pendiente',
            areaId: r.id_area,
            tipo: 'actividades',
            intentos: [],
            totalIntentos: r.version || (r.entrega_estado ? 1 : 0),
            mejorPuntaje: r.calificacion ?? null,
            plantilla: r.plantilla || (firstRecurso ? firstRecurso.archivo : null),
            recursos
          };
        });
        setActividades(mapped);
      } else {
        // Simular intento de quiz: aquí solo creamos intento con puntaje aleatorio (placeholder real de UI de quiz)
        const randomScore = Math.floor(Math.random() * 41) + 60; // 60-100
        await crearIntentoQuiz(actividadId, { id_estudiante: estudianteId, puntaje: randomScore });
        const { data } = await resumenQuizzesEstudiante(estudianteId);
        const rows = (data?.data || data || []).filter(q => {
          if(!q.id_area) return true;
          if(selectedArea.id === 5){
            if(!selectedModulo) return false;
            return q.id_area === selectedModulo.id;
          }
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
      setConfettiScore(esTipoActividad ? 0 : actividades.find(a=>a.id===actividadId)?.score || 0);
      setShowConfetti(true); setTimeout(()=> setShowConfetti(false),3000);
    } catch (e) {
      console.error(e);
      showNotification('Error','No se pudo subir el archivo','error');
    }
  };

  // Funciones para modales (mejoradas como en Feedback)
  const openUploadModal = (actividad) => {
    setSelectedActividad(actividad);
    setShowUploadModal(true);
  };

  const openViewModal = (actividad) => {
    setSelectedActividad(actividad);
  setViewingActivityFile(resolveFileUrl(actividad.archivo));
    setPdfError(false);
    setShowViewModal(true);
  };

  const closeModals = () => {
    setShowUploadModal(false);
    setShowViewModal(false);
    setSelectedActividad(null);
    setViewingActivityFile('');
  setUploadSelectedFile(null);
  setUploadError('');
    setPdfError(false);
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
  setPreviewError(null); setPreviewLoading(false); setPreviewKey(c=>c+1);
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
      setTimeout(()=> handleDownloadRecurso(resourcesActividad.id, r), idx * 300); // separación mayor para evitar saturar
    });
  };

  // Utilidad: forzar descarga usando fetch -> blob para evitar abrir nueva pestaña
  const downloadViaBlob = async (url, filename) => {
    try {
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('HTTP '+res.status);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename || 'archivo.pdf';
      document.body.appendChild(a);
      a.click();
      setTimeout(()=> { URL.revokeObjectURL(blobUrl); a.remove(); }, 1000);
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

  // Filtrado por mes (como en Feedback)
  const filteredActividades = actividades.filter(actividad => {
    if (selectedMonth === 'all') return true;
    const activityMonth = new Date(actividad.fechaEntrega).getMonth();
    return activityMonth === parseInt(selectedMonth);
  });

  const getSelectedMonthName = () => {
    if (selectedMonth === 'all') return 'Todos los meses';
    return months[parseInt(selectedMonth)];
  };

  const handleMonthSelect = (monthValue) => {
    setSelectedMonth(monthValue);
    setIsDropdownOpen(false);
  };

  // Verificar fecha límite (como en Feedback)
  const isWithinDeadline = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    return now < due;
  };

  // Funciones específicas para Quizzes
  const handleIniciarSimulacion = (quizId) => {
    // BACKEND: TODO - Verificar si está dentro de la fecha y redirigir a la página de simulación
    console.log('Iniciando simulación:', quizId);
    // Por ahora solo log, después será: 
    // window.location.href = `/simulacion/${quizId}`;
    showNotification(
      'Iniciando simulación',
      'Redirigiendo a la simulación...',
      'info'
    );
  };

  const handleVisualizarResultados = (quizId) => {
    // BACKEND: TODO - Mostrar resultados del quiz
    console.log('Visualizando resultados:', quizId);
    showNotification(
      'Visualizar resultados',
      'Mostrando resultados del quiz...',
      'info'
    );
  };

  // Verificar si la actividad/quiz está disponible para iniciar
  const isQuizAvailable = (quiz) => {
    // Para actividades: siempre disponibles para intentar/reintentar
    if (quiz.tipo === 'actividades') {
      return true; // Las actividades siempre se pueden reintentar
    }
    // Para quiz: verificar fecha límite
    const now = new Date();
    const fechaEntrega = new Date(quiz.fechaEntrega);
    return now <= fechaEntrega && quiz.estado === 'disponible';
  };

  // Verificar si se puede reintentar (para actividades: siempre, para quiz: según límites)
  const canRetry = (item) => {
    if (item.tipo === 'actividades') {
      // Las actividades siempre se pueden reintentar sin límite
      return item.entregada; // Solo si ya se ha entregado al menos una vez
    }
    // Para quiz: verificar límites de intentos
    return item.completado && item.intentos < item.maxIntentos && item.estado === 'completado';
  };

  // Límite de tamaño para PDF (1.5MB)
  const MAX_FILE_SIZE_BYTES = 1.5 * 1024 * 1024; // 1.5MB

  // Nueva función para confirmar subida/reemplazo desde el modal (single-submission)
  const handleConfirmUpload = () => {
    if (!uploadSelectedFile) {
      setUploadError('Selecciona un archivo PDF.');
      return;
    }
    if (uploadSelectedFile.type !== 'application/pdf') {
      setUploadError('Solo se permiten archivos PDF.');
      return;
    }
    if (uploadSelectedFile.size > MAX_FILE_SIZE_BYTES) {
      setUploadError('El archivo supera 1.5MB. Comprime el PDF e inténtalo nuevamente.');
      return;
    }
    handleFileUpload(selectedActividad.id, uploadSelectedFile);
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
        // Para quiz: simular resultado inmediato
        const simulatedScore = Math.floor(Math.random() * 100) + 1;
        const simulatedTime = Math.floor(Math.random() * 120) + 30;
        
        const nuevoIntento = {
          id: Date.now(),
          numero: actividad.totalIntentos + 1,
          fecha: new Date().toISOString(),
          puntaje: simulatedScore,
          tiempoEmpleado: simulatedTime,
          respuestasCorrectas: Math.floor((simulatedScore / 100) * 20),
          totalPreguntas: 20,
          comentarios: `Intento ${actividad.totalIntentos + 1} completado`
        };

        // Actualizar quiz
        setActividades(prev => prev.map(act => 
          act.id === actividadId 
            ? { 
                ...act, 
                completado: true, 
                entregada: true,
                score: simulatedScore,
                mejorPuntaje: Math.max(act.mejorPuntaje || 0, simulatedScore),
                fechaCompletado: new Date().toISOString().split('T')[0],
                estado: 'completado',
                intentos: [...act.intentos, nuevoIntento],
                totalIntentos: act.totalIntentos + 1
              }
            : act
        ));

        // Efecto visual de confetti con puntos para quiz
        setConfettiScore(simulatedScore);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
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
  };

  const closeHistorialModal = () => {
    setShowHistorialModal(false);
    setSelectedQuizHistorial(null);
  };

  const getQuizHistorial = (quizId) => {
    const quiz = actividades.find(q => q.id === quizId);
    if (!quiz) return { intentos: [], totalIntentos: 0, mejorPuntaje: 0, promedioTiempo: 0 };

    return {
      intentos: quiz.intentos || [],
      totalIntentos: quiz.totalIntentos || 0,
      mejorPuntaje: quiz.mejorPuntaje || 0,
      promedioTiempo: quiz.intentos ? 
        quiz.intentos.reduce((sum, intento) => sum + (intento.tiempoEmpleado || 0), 0) / quiz.intentos.length : 0
    };
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

  // Modal para gestionar archivos (multi-archivo estilo Classroom)
  const renderUploadModal = () => {
    if (!showUploadModal || !selectedActividad) return null;

    const isEdit = selectedActividad.entregada && selectedActividad.estado !== 'revisada';
    const blocked = selectedActividad.entregada && selectedActividad.estado === 'revisada';
    // Cargar lista de archivos si no la tenemos aún y hay entrega
    useEffect(() => {
      (async () => {
        if (selectedActividad.entrega_id && entregaArchivos.length === 0 && isEdit && !blocked) {
          try {
            const resp = await listArchivosEntrega(selectedActividad.entrega_id);
            setEntregaArchivos(resp.data?.data || []);
          } catch {}
        }
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
              {blocked ? 'La actividad ya fue revisada. No puedes subir más archivos.' : isEdit ? 'Agrega o elimina PDFs antes de la revisión.' : 'Sube un PDF (podrás agregar más luego).' }
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
                  <span className="flex items-center gap-1 text-green-600 font-medium">Calificación: {selectedActividad.score}%</span>
                )}
              </div>
            </div>

            <div className={`border-2 ${uploadError ? 'border-red-300 bg-red-50' : 'border-dashed border-gray-300 bg-gray-50'} rounded-xl p-4 transition-colors`}> 
              <input
                type="file"
                accept="application/pdf"
                disabled={blocked}
                onChange={(e) => {
                  setUploadError('');
                  const file = e.target.files?.[0];
                  if (!file) { setUploadSelectedFile(null); return; }
                  if (file.type !== 'application/pdf') {
                    setUploadError('Debe ser un PDF.');
                    setUploadSelectedFile(null);
                    return;
                  }
                  if (file.size > MAX_FILE_SIZE_BYTES) {
                    setUploadError('Supera 1.5MB. Comprime el PDF.');
                    setUploadSelectedFile(null);
                    return;
                  }
                  setUploadSelectedFile(file);
                }}
                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
              />
              <p className="mt-2 text-xs text-gray-500">
                Solo PDF. Tamaño máximo 1.5MB. Necesitas reducirlo? {' '}
                <a
                  href="https://www.ilovepdf.com/compress_pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Comprimir PDF
                </a>
              </p>
              {uploadSelectedFile && !uploadError && (
                <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> {uploadSelectedFile.name} ({(uploadSelectedFile.size/1024).toFixed(1)} KB)
                </div>
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
                        <button onClick={() => window.open(f.archivo.startsWith('http') ? f.archivo : `${window.location.origin}${f.archivo}`,'_blank')} className="text-blue-600 hover:underline">Ver</button>
                        {!blocked && <button onClick={async () => { try { const resp = await deleteArchivoEntrega(selectedActividad.entrega_id, f.id); setEntregaArchivos(resp.data?.data || []); } catch { showNotification('Error','No se pudo eliminar','error'); } }} className="text-red-500 hover:text-red-700">Eliminar</button>}
                      </div>
                    </li>
                  ))}
                  {entregaArchivos.length === 0 && <li className="text-xs text-gray-500">Sin archivos todavía.</li>}
                </ul>
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <button onClick={closeModals} className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors">Cerrar</button>
              {!blocked && <button onClick={() => { if (!uploadSelectedFile) { setUploadError('Selecciona un archivo.'); return; } handleConfirmUpload(); }} className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors text-white shadow ${isEdit ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'}`}>{isEdit ? 'Agregar Archivo' : 'Subir'}</button>}
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
      if (pdfSrc) window.open(pdfSrc, '_blank', 'noopener');
    };

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100 border-2 border-purple-200 flex flex-col" style={{ maxHeight: '70vh' }}>
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-purple-700">Visualizar Actividad</h2>
          <p className="mb-4 text-gray-700 text-sm sm:text-base">
            Actividad: <span className="font-semibold text-purple-600">{selectedActividad.nombre}</span>
          </p>
          {pdfSrc && esPDF ? (
            <>
              <div className="flex-grow w-full h-64 sm:h-96 bg-gray-100 rounded-lg overflow-hidden mb-4 border border-gray-300 flex items-center justify-center relative">
                {isMobile ? (
                  <span className="text-gray-500 text-center text-xs px-2">En móvil usa "Ver en nueva pestaña" para mejor experiencia.</span>
                ) : (
                  <iframe
                    key={pdfSrc}
                    src={pdfSrc}
                    title="Visor de PDF"
                    className="w-full h-full border-none"
                    onError={(e) => { e.currentTarget.outerHTML = '<div class="w-full h-full flex items-center justify-center text-xs text-red-500">Error cargando PDF</div>'; }}
                  />
                )}
              </div>
              <p className="text-[10px] sm:text-xs text-gray-500 text-center mb-2 truncate px-2">
                Ruta: {pdfSrc ? pdfSrc.replace(/^https?:\/\/[^/]+/, '') : ''}
              </p>
            </>
          ) : (
            <p className="mb-6 text-gray-700 text-sm sm:text-base text-center">
              No hay archivo PDF para visualizar.
            </p>
          )}
          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-auto">
            {pdfSrc && esPDF && !isMobile && (
              <button
                onClick={handleOpenPdfInNewTab}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
              >
                Ver en nueva pestaña
              </button>
            )}
            <button
              onClick={closeModals}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm"
            >
              Cerrar
            </button>
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

  // Modal para mostrar el historial de intentos de quiz
  const renderHistorialModal = () => {
    if (!showHistorialModal || !selectedQuizHistorial) return null;

    const historial = getQuizHistorial(selectedQuizHistorial.id);

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-8 pb-8 overflow-y-auto">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl min-h-fit max-h-[calc(100vh-4rem)] overflow-hidden flex flex-col my-auto">
          {/* Header del modal */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold truncate">Historial de Intentos</h2>
                <p className="text-indigo-100 mt-1 text-base truncate">{selectedQuizHistorial.nombre}</p>
              </div>
              <button
                onClick={closeHistorialModal}
                className="text-white hover:text-gray-200 transition-colors ml-4 flex-shrink-0 p-2 hover:bg-white/10 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Contenido del modal */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Resumen estadístico */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <div className="text-blue-600 text-sm font-medium">Total de Intentos</div>
                <div className="text-2xl font-bold text-blue-800">{historial.totalIntentos}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                <div className="text-green-600 text-sm font-medium">Mejor Puntaje</div>
                <div className="text-2xl font-bold text-green-800">{historial.mejorPuntaje}%</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                <div className="text-purple-600 text-sm font-medium">Promedio</div>
                <div className="text-2xl font-bold text-purple-800">
                  {Math.round(historial.promedio || 0)}%
                </div>
              </div>
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                <div className="text-orange-600 text-sm font-medium">Último Intento</div>
                <div className="text-sm font-bold text-orange-800">
                  {historial.intentos.length > 0 
                    ? new Date(historial.intentos[historial.intentos.length - 1].fecha).toLocaleDateString('es-ES')
                    : 'N/A'
                  }
                </div>
              </div>
            </div>

            {/* Lista de intentos */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Historial Detallado ({historial.intentos.length} intentos)
              </h3>
              
              {historial.intentos.length > 0 ? (
                <div className="max-h-80 overflow-y-auto bg-gray-50 rounded-xl border border-gray-200 p-4">
                  <div className="space-y-3">
                    {[...historial.intentos].reverse().map((intento, index) => (
                      <div
                        key={intento.id}
                        className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center space-x-4 min-w-0 flex-1">
                          <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
                            {historial.intentos.length - index}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 text-base">
                              Intento {historial.intentos.length - index}
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                              {new Date(intento.fecha).toLocaleDateString('es-ES')} a las{' '}
                              {new Date(intento.fecha).toLocaleTimeString('es-ES', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 flex-shrink-0">
                          <div className="text-right">
                            <div className={`font-bold text-lg ${
                              intento.puntaje === historial.mejorPuntaje 
                                ? 'text-green-600' 
                                : 'text-gray-700'
                            }`}>
                              {intento.puntaje}%
                              {intento.puntaje === historial.mejorPuntaje && (
                                <span className="ml-1 text-yellow-500">👑</span>
                              )}
                            </div>
                          </div>
                          <div className={`w-2 h-8 rounded-full ${
                            intento.puntaje >= 90 ? 'bg-green-500' :
                            intento.puntaje >= 70 ? 'bg-yellow-500' :
                            intento.puntaje >= 50 ? 'bg-orange-500' : 'bg-red-500'
                          }`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-base">No hay intentos registrados para esta evaluación.</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer del modal */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end flex-shrink-0 border-t border-gray-200">
            <button
              onClick={closeHistorialModal}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
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

  // Modal de recursos múltiples (descarga y vista previa)
  const renderResourcesModal = () => {
    if (!showResourcesModal || !resourcesActividad) return null;
  const recursos = resourcesActividad.recursos || [];
  const current = previewRecurso;
  const baseUrl = current ? resolveFileUrl(current.archivo) : null;
  const currentUrl = baseUrl ? baseUrl + (baseUrl.includes('?') ? '&' : '?') + 'v=' + previewKey : null; // cache-bust
  // BACKEND: Asesores solo pueden subir PDFs, así que asumimos siempre PDF y simplificamos la lógica
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-start px-2 pt-24 md:pt-28 pb-4 z-50" onClick={closeResourcesModal}>
        <div className="bg-white rounded-t-2xl md:rounded-xl shadow-2xl w-full max-w-4xl h-[calc(100vh-7rem)] md:h-[80vh] flex flex-col overflow-hidden" onClick={e=>e.stopPropagation()}>
          <div className="px-4 md:px-6 py-3 md:py-4 border-b flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <h2 className="font-semibold text-lg">Recursos de: {resourcesActividad.nombre}</h2>
            <button onClick={closeResourcesModal} className="text-white/80 hover:text-white">✕</button>
          </div>
          <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
      <div className="w-full md:w-64 md:border-r border-b md:border-b-0 overflow-y-auto p-3 space-y-2 bg-gray-50 max-h-40 md:max-h-none flex-shrink-0">
              {recursos.map((r,idx)=> (
        <div key={idx} className={`group rounded-lg border p-2 text-xs cursor-pointer transition-colors ${previewRecurso===r ? 'border-blue-500 bg-white shadow-sm' : 'border-gray-200 bg-white hover:bg-blue-50'}`} onClick={()=> { setPreviewRecurso(r); setPreviewError(null); setPreviewLoading(true); setPreviewKey(c=>c+1); }}>
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-blue-500" />
                    <span className="truncate" title={r.nombre || r.archivo}>{r.nombre || r.archivo.split('/').pop()}</span>
                  </div>
                  <div className="mt-1 flex gap-2">
          <button className="text-blue-600 hover:underline" onClick={(e)=> { e.stopPropagation(); handleDownloadRecurso(resourcesActividad.id,r); }}>Descargar</button>
          <button className="text-gray-500 hover:underline" onClick={(e)=> { e.stopPropagation(); setPreviewRecurso(r); setPreviewError(null); setPreviewLoading(true); setPreviewKey(c=>c+1); }}>Ver</button>
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
                    <button onClick={()=> handleDownloadRecurso(resourcesActividad.id,current)} className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-md">Descargar actual</button>
                  )}
                </div>
              </div>
              <div className="flex-1 bg-gray-100 m-2 md:m-3 rounded-lg flex items-center justify-center overflow-hidden relative">
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
                        <button className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs" onClick={()=> { setPreviewError(null); setPreviewLoading(true); setPreviewKey(c=>c+1); }}>Reintentar</button>
                        <a className="text-blue-600 underline" href={baseUrl} target="_blank" rel="noopener">Abrir en nueva pestaña</a>
                      </div>
                    )}
                    <iframe
                      key={currentUrl}
                      src={currentUrl}
                      title="Recurso PDF"
                      className="w-full h-full border-0"
                      onLoad={()=> setPreviewLoading(false)}
                      onError={()=> { setPreviewLoading(false); setPreviewError(true); }}
                    />
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
    <div className="min-h-screen bg-white p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {error && !loading && (
          <div className="mb-4 p-4 rounded-xl border border-red-200 bg-red-50 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 text-sm text-red-700">
              {error} {retryCount>0 && retryCount<=MAX_RETRIES && `(reintento ${retryCount}/${MAX_RETRIES})`}
            </div>
            <div className="flex gap-2">
              {retryCount <= MAX_RETRIES && (
                <button onClick={manualRetry} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 active:scale-95">Reintentar</button>
              )}
              <button onClick={()=> window.location.reload()} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 active:scale-95">Recargar</button>
            </div>
          </div>
        )}
        {catalogError && (
          <div className="mb-4 p-3 rounded-xl bg-yellow-50 border border-yellow-200 text-sm text-yellow-800">{catalogError}</div>
        )}
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-8">
          <div className="px-6 py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl xs:text-4xl sm:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  ACTIVIDADES Y EVALUACIONES
                </h1>
                <p className="text-gray-600">
                  Selecciona el área de estudio que deseas explorar
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
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Trophy className="w-2 h-2 text-white" />
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-indigo-700 to-blue-700 bg-clip-text text-transparent">
                  ÁREAS DE ESTUDIO
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-12 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full"></div>
                  <div className="w-12 h-0.5 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

  {/* Grid de áreas */}
  {/* Grid responsive mejorado: 2 columnas en móviles, 3 en tablets, 4 en desktop */}
  <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 auto-rows-fr gap-3 sm:gap-5">
          {(loadingCatalog || loading) && areasData.length===0 && (
            <div className="col-span-full py-8 text-center text-sm text-gray-500">Cargando áreas...</div>
          )}
          {areasData.map((area) => (
            <div key={area.id} className="[tap-highlight-color:transparent]">
              <UnifiedCard
                title={area.titulo}
                description={area.descripcion}
                icon={area.icono}
                containerClasses={`${area.bgColor} ${area.borderColor} bg-gradient-to-br`}
                iconWrapperClass={`bg-gradient-to-br ${area.color}`}
                minHeight={CARD_HEIGHT_PX}
                onClick={() => handleSelectArea(area)}
                footer={<div className="inline-flex items-center text-gray-600 font-medium tracking-wide"><span className="group-hover:text-gray-800 transition-colors text-xs sm:text-sm">Explorar área</span><ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 sm:ml-2 rotate-180 group-hover:translate-x-1 transition-transform" /></div>}
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
      <div className="min-h-screen bg-white p-4 lg:p-8">
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

          {/* Grid de módulos específicos con lógica de acceso y estilo restaurado */}
          {/* Grid responsive para módulos específicos */}
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 auto-rows-fr gap-3 sm:gap-5">
            {(loadingCatalog || loading) && modulosEspecificos.length===0 && (
              <div className="col-span-full py-6 text-center text-sm text-gray-500">Cargando módulos...</div>
            )}
            {modulosEspecificos.map((modulo) => {
              const isAllowed = allowedActivityAreas.includes(modulo.id);
              const request = activityRequests.find(req => req.areaId === modulo.id);
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
                      <span>Ver actividades</span>
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
                      <Lock className="w-4 h-4 mr-2" />
                      <span>Solicitar Acceso</span>
                    </div>
                  );
                }
              } else {
                // Estado inicial: Elige tu primera área
                isClickable = true;
                actionHandler = () => handleInitialAreaSelection(modulo.id);
                cardClassName += " cursor-pointer ring-4 ring-transparent hover:ring-indigo-400";
                footerContent = (
                  <div className="inline-flex items-center text-indigo-600 font-medium text-sm">
                    <span>Seleccionar esta área</span>
                    <CheckCircle2 className="w-4 h-4 ml-2" />
                  </div>
                );
              }

              return (
                <div key={modulo.id} className="[tap-highlight-color:transparent]">
                  <UnifiedCard
                    title={modulo.titulo}
                    description={modulo.descripcion}
                    icon={getIconComponent(modulo.icono?.type?.name || 'BookOpen')}
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

  // Función para renderizar botones de actividades y quiz
  const renderButtons = () => (
    <div className="min-h-screen bg-white p-4 lg:p-8">
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
                    {selectedModulo ? selectedModulo.titulo : selectedArea?.titulo}
                  </h1>
                  <p className="text-gray-600">Selecciona el tipo de contenido que deseas revisar</p>
                </div>
              </div>
              <div className="mt-4 lg:mt-0 flex items-center text-sm text-gray-500">
                <Target className="w-4 h-4 mr-1" />
                <span>2 tipos disponibles</span>
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
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-2 h-2 text-white" />
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
                  Actividades y Quizzes
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-12 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"></div>
                  <div className="w-12 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjetas tipo (responsive + altura uniforme usando UnifiedCard) */}
        <div className="mx-auto w-full">
          {/* En desktop mostramos exactamente dos tarjetas grandes centradas */}
          <div className="hidden lg:flex justify-center gap-10 max-w-6xl mx-auto">
            <UnifiedCard
              title="Actividades"
              description="Tareas y ejercicios prácticos para reforzar tu aprendizaje"
              icon={<FileText className="w-6 h-6 text-white" />}
              containerClasses="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 lg:w-[380px] xl:w-[420px]"
              iconWrapperClass="bg-gradient-to-br from-blue-500 to-indigo-600"
              minHeight={CARD_HEIGHT_PX+40}
              onClick={() => handleSelectType('actividades')}
              footer={<div className="inline-flex items-center text-blue-600 font-medium text-xs sm:text-sm"><span>ACCEDER</span><ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 sm:ml-2 rotate-180 group-hover:translate-x-1 transition-transform" /></div>}
            />
            <UnifiedCard
              title="Quizzes"
              description="Cuestionarios y evaluaciones en línea"
              icon={<Brain className="w-6 h-6 text-white" />}
              containerClasses="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 lg:w-[380px] xl:w-[420px]"
              iconWrapperClass="bg-gradient-to-br from-purple-500 to-pink-600"
              minHeight={CARD_HEIGHT_PX+40}
              onClick={() => handleSelectType('quiz')}
              footer={<div className="inline-flex items-center text-purple-600 font-medium text-xs sm:text-sm"><span>ACCEDER</span><ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 sm:ml-2 rotate-180 group-hover:translate-x-1 transition-transform" /></div>}
            />
          </div>
          {/* Mobile / tablet grid (mantener responsive compacto) */}
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 lg:hidden auto-rows-fr gap-3 sm:gap-5 max-w-5xl mx-auto">
            <UnifiedCard
              title="Actividades"
              description="Tareas y ejercicios prácticos para reforzar tu aprendizaje"
              icon={<FileText className="w-6 h-6 text-white" />}
              containerClasses="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200"
              iconWrapperClass="bg-gradient-to-br from-blue-500 to-indigo-600"
              minHeight={CARD_HEIGHT_PX}
              onClick={() => handleSelectType('actividades')}
              footer={<div className="inline-flex items-center text-blue-600 font-medium text-[10px] xs:text-xs sm:text-sm"><span>ACCEDER</span><ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 ml-1 rotate-180 group-hover:translate-x-1 transition-transform" /></div>}
            />
            <UnifiedCard
              title="Quizzes"
              description="Cuestionarios y evaluaciones en línea"
              icon={<Brain className="w-6 h-6 text-white" />}
              containerClasses="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200"
              iconWrapperClass="bg-gradient-to-br from-purple-500 to-pink-600"
              minHeight={CARD_HEIGHT_PX}
              onClick={() => handleSelectType('quiz')}
              footer={<div className="inline-flex items-center text-purple-600 font-medium text-[10px] xs:text-xs sm:text-sm"><span>ACCEDER</span><ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 ml-1 rotate-180 group-hover:translate-x-1 transition-transform" /></div>}
            />
          </div>
        </div>
      </div>
    </div>
  );

    // Función para renderizar tabla de actividades (versión unificada single-submission)
    const renderTablaActividades = () => (
      <div className="p-6">
        <div className="mb-8">
          <button
            onClick={handleGoBack}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a opciones
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Actividades</h1>
              <p className="text-gray-600">{selectedArea?.titulo}</p>
            </div>
            {/* Filtro por mes */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-48"
              >
                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-gray-700">{getSelectedMonthName()}</span>
                <ChevronDown className={`w-4 h-4 ml-2 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-30">
                  <div className="py-1">
                    <button
                      onClick={() => handleMonthSelect('all')}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${selectedMonth === 'all' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
                    >
                      Todos los meses
                    </button>
                    {months.map((month, index) => (
                      <button
                        key={index}
                        onClick={() => handleMonthSelect(index.toString())}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${selectedMonth === index.toString() ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
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

        {/* Nueva tabla single-submission */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-blue-500 to-indigo-600">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">No.</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Actividad</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Recursos</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Fecha Límite</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Subir / Editar</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Entregado</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Visualizar</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Calificación</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">Cargando actividades...</td>
                  </tr>
                )}
                {!loading && error && (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-sm text-red-600">{error}</td>
                  </tr>
                )}
                {!loading && !error && filteredActividades.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">No hay actividades.</td>
                  </tr>
                )}
                {!loading && !error && filteredActividades.map((actividad, index) => {
                  const vencida = !isWithinDeadline(actividad.fechaEntrega);
                  const puedeEditar = actividad.entregada && !vencida && actividad.estado !== 'revisada';
                  return (
                    <tr key={actividad.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-4 text-sm text-gray-700 font-medium">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{actividad.nombre}</div>
                          <div className="text-xs text-gray-500">{actividad.descripcion}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {actividad.recursos && actividad.recursos.length > 0 && (
                          <button
                            onClick={() => openResourcesModal(actividad)}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-blue-200"
                          >
                            <Download className="w-4 h-4 mr-1" /> {actividad.recursos.length} PDF{actividad.recursos.length>1?'s':''}
                          </button>
                        )}
                        {!actividad.recursos?.length && actividad.plantilla && (
                          <button
                            onClick={() => handleDownload(actividad.id)}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-blue-200"
                          >
                            <Download className="w-4 h-4 mr-1" /> PDF
                          </button>
                        )}
                        {!actividad.plantilla && (!actividad.recursos || actividad.recursos.length === 0) && (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{new Date(actividad.fechaEntrega).toLocaleDateString('es-ES')}</div>
                        <div className={`text-xs ${vencida ? 'text-red-600' : 'text-green-600'}`}>{vencida ? 'Vencida' : 'A tiempo'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {!actividad.entregada ? (
                          <button
                            onClick={() => openUploadModal(actividad)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
                          >
                            <Upload className="w-4 h-4 mr-1" /> Subir
                          </button>
                        ) : (
                          <button
                            onClick={() => openUploadModal(actividad)}
                            disabled={!puedeEditar}
                            className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md shadow-sm ${
                              puedeEditar ? 'text-white bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                            }`}
                          >
                            {puedeEditar ? <Upload className="w-4 h-4 mr-1" /> : null}
                            {puedeEditar ? 'Editar' : 'Bloqueado'}
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {actividad.entregada ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => openViewModal(actividad)}
                          disabled={!actividad.entregada}
                          className={`p-2 rounded-md ${actividad.entregada ? 'text-green-600 hover:text-green-800 hover:bg-green-50' : 'text-gray-400 cursor-not-allowed'} transition-colors`}
                          title="Ver entrega"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {actividad.entregada ? (
                          actividad.estado === 'revisada' ? (
                            <span className="font-medium text-gray-900">{actividad.score !== null && actividad.score !== undefined ? actividad.score : (actividad.mejorPuntaje ?? 0)}</span>
                          ) : (
                            <span className="text-xs text-yellow-600 font-medium">En revisión</span>
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
      <div className="p-6">
        <div className="mb-8">
          <button
            onClick={handleGoBack}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a opciones
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quizzes</h1>
              <p className="text-gray-600">{selectedArea?.titulo}</p>
            </div>
            
            {/* Filtro por mes */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-48"
              >
                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-gray-700">{getSelectedMonthName()}</span>
                <ChevronDown className={`w-4 h-4 ml-2 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-30">
                  <div className="py-1">
                    <button
                      onClick={() => handleMonthSelect('all')}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${selectedMonth === 'all' ? 'bg-purple-50 text-purple-600' : 'text-gray-700'}`}
                    >
                      Todos los meses
                    </button>
                    {months.map((month, index) => (
                      <button
                        key={index}
                        onClick={() => handleMonthSelect(index.toString())}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${selectedMonth === index.toString() ? 'bg-purple-50 text-purple-600' : 'text-gray-700'}`}
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

        {/* Tabla de quiz */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-purple-500 to-pink-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Simulación
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Fecha Límite
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Mejor Puntaje
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Intentos
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-white uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredActividades.map((quiz, index) => (
                  <tr key={quiz.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{quiz.nombre}</div>
                        <div className="text-sm text-gray-500">{quiz.descripcion}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          Tiempo límite: {quiz.tiempoLimite} | Máx. intentos: {quiz.maxIntentos}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(quiz.fechaEntrega).toLocaleDateString('es-ES')}
                      </div>
                      <div className={`text-xs ${isWithinDeadline(quiz.fechaEntrega) ? 'text-green-600' : 'text-red-600'}`}>
                        {isWithinDeadline(quiz.fechaEntrega) ? 'Disponible' : 'Vencido'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        quiz.estado === 'completado' ? 'bg-green-100 text-green-800' :
                        quiz.estado === 'disponible' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {quiz.estado === 'completado' ? 'Completado' :
                         quiz.estado === 'disponible' ? 'Disponible' :
                         'Vencido'}
                      </span>
                    </td>                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {getBestScore(quiz.id) !== 'En revisión' ? `${getBestScore(quiz.id)}%` : getBestScore(quiz.id)}
                    </div>
                    {quiz.score && (
                      <div className="text-xs text-gray-500">
                        de {quiz.maxScore}%
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getTotalAttempts(quiz.id)} / {quiz.maxIntentos}
                    </div>
                    {getTotalAttempts(quiz.id) > 0 && (
                      <button
                        onClick={() => handleVerHistorial(quiz)}
                        className="text-xs text-purple-600 hover:text-purple-800"
                      >
                        Ver historial
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-2">
                      {isQuizAvailable(quiz) ? (
                        <button
                          onClick={() => handleIniciarSimulacion(quiz.id)}
                          className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                          title="Iniciar simulación"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      ) : quiz.completado ? (
                        <>
                          <button
                            onClick={() => handleVisualizarResultados(quiz.id)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver resultados"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {canRetry(quiz) && (
                            <button
                              onClick={() => handleReintentar(quiz.id)}
                              className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg transition-colors"
                              title="Reintentar"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-gray-500">No disponible</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
      {renderHistorialModal()}
      {renderNotificationModal()}
  {renderResourcesModal()}

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