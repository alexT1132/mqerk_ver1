// BACKEND: Componente de Simulaciones del Alumno
// Este componente maneja la página de simulaciones del estudiante con 3 niveles:
// 1. Tarjetas de simuladores (áreas generales vs módulos específicos)
// 2. Lista de módulos específicos (solo para módulos específicos)
// 3. Tabla de simulaciones disponibles con funcionalidad completa
import React, { useState, useEffect } from 'react';
import { useStudent } from '../../context/StudentContext'; // Importar el hook
import { listQuizzes, resumenQuizzesEstudiante, crearIntentoQuiz, listIntentosQuizEstudiante } from '../../api/quizzes';
import { listPreguntasQuiz, crearSesionQuiz, enviarRespuestasSesion, finalizarSesionQuiz } from '../../api/simulaciones';
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
  // Estados de navegación
  const [currentLevel, setCurrentLevel] = useState('tipos'); // 'tipos', 'modulos', 'simulaciones'
  const [selectedTipo, setSelectedTipo] = useState(null); // 'generales' | 'especificos'
  const [selectedModulo, setSelectedModulo] = useState(null); // Para módulos específicos
  const [simulaciones, setSimulaciones] = useState([]);
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
  const [historialCache, setHistorialCache] = useState({}); // quizId -> intentos reales
  // Estado de carga/errores de quizzes backend
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [quizError, setQuizError] = useState('');

  // Estados para modal de gráficas
  const [showGraficasModal, setShowGraficasModal] = useState(false);
  const [selectedSimulacionGraficas, setSelectedSimulacionGraficas] = useState(null);

  // Estados para modales de notificación
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationContent, setNotificationContent] = useState({
    title: '',
    message: '',
    type: 'success' // 'success', 'info', 'warning', 'error'
  });
  // Fallback / retry minimal (para futuras integraciones API)
  const [loadError, setLoadError] = useState('');
  const [retryToken, setRetryToken] = useState(0);
  const manualRetrySims = () => setRetryToken(t=>t+1);

  // Catálogo dinámico de áreas/módulos (reuso de endpoint de Actividades)
  const [modulosEspecificos, setModulosEspecificos] = useState([]);
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
        if(!cancel) setModulosEspecificos(mapped);
      } catch(e){ if(!cancel) setCatalogError('No se pudo cargar catálogo de módulos'); }
      finally { if(!cancel) setLoadingCatalog(false); }
    };
    load(fromCache?.data ? true : false);
    return ()=> { cancel=true; };
  },[]);
  // (mocks eliminados)

  // Meses como ordinales
  const months = [
    'Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto', 'Sexto',
    'Séptimo', 'Octavo', 'Noveno'
  ];

  // Altura mínima uniforme para tarjetas (módulos específicos) alineada con Actividades
  const CARD_HEIGHT_PX = 230;

  // (Se eliminó bloque duplicado de helpers; definiciones únicas se mantienen más abajo tras loadQuizzes)

  // Verificar fecha límite
  const isWithinDeadline = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    return now < due;
  };

  const handleVisualizarResultados = (simulacionId) => {
    console.log('Visualizando resultados:', simulacionId);
    showNotification(
      'Resultados de simulación',
      'Mostrando resultados de la simulación...',
      'info'
    );
  };

  // Verificar si la simulación está disponible para iniciar
  const isSimulacionAvailable = (simulacion) => {
    const now = new Date();
    const fechaEntrega = new Date(simulacion.fechaEntrega);
    return now <= fechaEntrega && simulacion.estado === 'disponible';
  };

  // Verificar si se puede reintentar (Función legacy - ahora permitimos reintentos ilimitados)
  const canRetry = (simulacion) => {
    return simulacion.completado;
  };

  // (Legacy historial in-memory removido; ahora historial se obtiene de backend y cache local en historialCache)

  // Reemplazo: eliminamos mocks y cargamos desde backend
  const loadQuizzes = async (scope) => {
    if(!estudianteId) { setSimulaciones([]); return; }
    setLoadingQuizzes(true); setQuizError('');
    try {
      const [resResumen, resCatalog] = await Promise.allSettled([
        resumenQuizzesEstudiante(estudianteId),
        listQuizzes()
      ]);
      const resumenRows = resResumen.status === 'fulfilled' ? (resResumen.value?.data?.data || resResumen.value?.data || []) : [];
      const catalogRows = resCatalog.status === 'fulfilled' ? (resCatalog.value?.data?.data || resCatalog.value?.data || []) : [];
      const resumenById = resumenRows.reduce((acc,q)=>{ acc[q.id]=q; return acc; },{});
      const baseRows = catalogRows.length ? catalogRows : resumenRows;
      const filtered = baseRows.filter(q => {
        if(scope.type === 'generales') {
          // áreas generales: id_area null o 1..4 (asunción) y no módulos específicos
          return !q.id_area || (q.id_area >=1 && q.id_area <=4); // ajusta si tu mapping real difiere
        } else if(scope.type === 'modulo' && scope.moduloId) {
          return q.id_area === scope.moduloId;
        }
        return true;
      });
      const mapped = filtered.map(q => {
        const r = resumenById[q.id] || q;
        const total_intentos = Number(r.total_intentos || 0);
        const ultimo_puntaje = r.ultimo_puntaje ?? null;
        const mejor_puntaje = r.mejor_puntaje ?? null;
        const fecha_limite = q.fecha_limite || q.fechaEntrega || null;
        const now = new Date();
        const due = fecha_limite ? new Date(fecha_limite) : null;
        const within = due ? now <= due : true;
        const estadoQuiz = total_intentos > 0 ? 'completado' : (within ? 'disponible' : 'vencido');
        return {
          id: q.id,
          nombre: q.titulo,
            fechaEntrega: fecha_limite,
          completado: total_intentos > 0,
          score: ultimo_puntaje,
          bestScore: mejor_puntaje,
          estado: estadoQuiz,
          totalIntentos: total_intentos
        };
      });
      setSimulaciones(mapped);
    } catch(e){
      console.error(e); setQuizError('Error cargando simulaciones');
    } finally { setLoadingQuizzes(false); }
  };

  // Historial real: fetch solo al abrir modal
  const fetchHistorial = async (simulacion) => {
    if(!estudianteId) return;
    try {
      const resp = await listIntentosQuizEstudiante(simulacion.id, estudianteId);
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
        tiempoEmpleado: Math.round((it.tiempo_segundos||0)/60) || 0
      })),
      totalIntentos: intentos.length,
      mejorPuntaje: intentos.reduce((m,i)=> i.puntaje>m?i.puntaje:m,0),
      promedioTiempo: intentos.length ? Math.round(intentos.reduce((s,i)=> s + (i.tiempo_segundos||0),0)/60/ intentos.length) : 0
    };
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
    } else {
      setCurrentLevel('simulaciones');
      loadQuizzes({ type:'generales' });
    }
  };

  // Función para manejar la selección de módulo específico
  const handleSelectModulo = (modulo) => {
    if (allowedSimulationAreas.includes(modulo.id)) {
      setSelectedModulo(modulo);
      setCurrentLevel('simulaciones');
      loadQuizzes({ type:'modulo', moduloId:modulo.id });
    } else {
      console.log('Área no permitida. Debes solicitar acceso.');
    }
  };

  // Función para manejar la solicitud de acceso a un nuevo módulo
  const handleRequestAccess = (moduloId) => {
    // Evitar enviar múltiples solicitudes para la misma área
    if (simulationRequests.some(req => req.areaId === moduloId)) {
      showNotification(
        'Solicitud ya enviada',
        'Ya has enviado una solicitud para esta área.',
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

  // Función para manejar la primera selección de área del estudiante
  const handleInitialAreaSelection = (moduloId) => {
    addAllowedSimulationArea(moduloId);
    showNotification(
      '¡Área seleccionada!',
      'Ahora tienes acceso a estas simulaciones.',
      'success'
    );
  };

  // Función para regresar al nivel anterior
  const handleGoBack = () => {
    if (currentLevel === 'simulaciones') {
      if (selectedTipo === 'especificos') {
        setCurrentLevel('modulos');
        setSimulaciones([]);
      } else {
        setCurrentLevel('tipos');
        setSelectedTipo(null);
        setSimulaciones([]);
      }
    } else if (currentLevel === 'modulos') {
      setCurrentLevel('tipos');
      setSelectedTipo(null);
      setSelectedModulo(null);
    }
  };

  // Filtrado por mes
  const filteredSimulaciones = simulaciones.filter(simulacion => {
    if (selectedMonth === 'all') return true;
    const simMonth = new Date(simulacion.fechaEntrega).getMonth();
    return simMonth === parseInt(selectedMonth);
  });

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

  // Funciones para manejar modal de gráficas
  const handleVerGraficas = (simulacion) => {
    setSelectedSimulacionGraficas(simulacion);
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
        await enviarRespuestasSesion(activeSesion.id, batch);
      }
      const fin = await finalizarSesionQuiz(activeSesion.id);
      const resultado = fin.data?.data || {};
      showNotification('Simulación finalizada', `Puntaje: ${resultado.puntaje ?? 'N/A'}`, 'success');
      setShowSesionModal(false);
      setActiveSesion(null);
      await loadQuizzes(selectedTipo==='generales' ? {type:'generales'} : {type:'modulo', moduloId:selectedModulo?.id});
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
  const [activeSesion, setActiveSesion] = useState(null); // { id, quizId }
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
      const pregResp = await listPreguntasQuiz(sim.id);
      const preguntas = pregResp.data?.data || [];
      const sesionResp = await crearSesionQuiz(sim.id, { id_estudiante: estudianteId });
      const sesionId = sesionResp.data?.data?.id;
      setActiveSesion({ id: sesionId, quizId: sim.id, nombre: sim.nombre });
      setPreguntasSesion(preguntas.sort((a,b)=> (a.orden||0)-(b.orden||0)));
      setRespuestasSesion({});
      setShowSesionModal(true);
    } catch(e){
      console.error(e); setSesionError('No se pudo iniciar la simulación');
      showNotification('Error','No se pudo iniciar la simulación','error');
    } finally { setSesionLoading(false); }
  };

  const handleReintentar = (simulacionId) => handleIniciarSimulacion(simulacionId);

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
    <div className="min-h-screen bg-white p-4 lg:p-8">
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
        <div className="grid grid-cols-2 auto-rows-fr gap-3 sm:gap-6 lg:gap-8 max-w-3xl mx-auto">
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
                <div className="space-y-2">
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
                <button onClick={()=> window.location.reload()} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 active:scale-95">Recargar</button>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 auto-rows-fr gap-3 sm:gap-5">
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
                            {new Date(simulacion.fechaEntrega).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isSimulacionAvailable(simulacion) ? (
                          <button
                            onClick={() => handleIniciarSimulacion(simulacion.id)}
                            className="relative px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg text-sm font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-b-4 border-red-700 hover:border-red-800 active:scale-95 active:border-b-2"
                          >
                            <span className="relative z-10 flex items-center justify-center">
                              <span className="mr-2">🚀</span>
                              START
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-t from-red-700/20 to-transparent rounded-lg"></div>
                          </button>
                        ) : (
                          <button
                            disabled
                            className="px-4 py-2 bg-gray-300 cursor-not-allowed text-gray-500 rounded-lg text-sm font-medium"
                          >
                            {!isWithinDeadline(simulacion.fechaEntrega) ? 'VENCIDO' : 'NO DISPONIBLE'}
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
                            onClick={() => handleReintentar(simulacion.id)}
                            className="relative px-5 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg text-sm font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-b-3 border-red-600 hover:border-red-700 active:scale-95 active:border-b-1"
                          >
                            <span className="relative z-10 flex items-center justify-center">
                              <span className="mr-1">🔄</span>
                              REINTENTAR
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
                    <h3 className="font-semibold text-gray-900 text-lg mb-2">{simulacion.nombre}</h3>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Límite: {new Date(simulacion.fechaEntrega).toLocaleDateString('es-ES')}</span>
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
                
                {/* Botones de acción para simulaciones */}
                <div className="space-y-2">
                  {/* Botón Ejecutar */}
                  {isSimulacionAvailable(simulacion) && (
                    <button
                      onClick={() => handleIniciarSimulacion(simulacion.id)}
                      className="relative w-full px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl text-base font-bold uppercase tracking-wider shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-b-4 border-red-700 hover:border-red-800 active:scale-95 active:border-b-2"
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        <span className="mr-3 text-xl">🚀</span>
                        EJECUTAR (START)
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-t from-red-700/30 to-transparent rounded-xl"></div>
                      <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  )}

                  {/* Botón Reintentar */}
                  {simulacion.completado && (
                    <button
                      onClick={() => handleReintentar(simulacion.id)}
                      className="relative w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl text-base font-bold uppercase tracking-wider shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-b-4 border-red-600 hover:border-red-700 active:scale-95 active:border-b-2"
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        <span className="mr-3 text-xl">🔄</span>
                        REINTENTAR
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-t from-red-600/30 to-transparent rounded-xl"></div>
                      <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  )}

                  {/* Botón Ver Historial */}
                  {simulacion.completado && getTotalAttempts(simulacion.id) > 0 && (
                    <button
                      onClick={() => handleVerHistorial(simulacion)}
                      className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Ver Historial ({getTotalAttempts(simulacion.id)} intentos)
                    </button>
                  )}

                  {/* Botón Ver Gráficas */}
                  {simulacion.completado && getTotalAttempts(simulacion.id) > 0 && (
                    <button
                      onClick={() => handleVerGraficas(simulacion)}
                      className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center"
                    >
                      <LineChart className="w-4 h-4 mr-2" />
                      📊 Análisis Gráfico
                    </button>
                  )}

                  {/* Estado no disponible */}
                  {!isSimulacionAvailable(simulacion) && !simulacion.completado && (
                    <div className="w-full px-4 py-3 bg-gray-100 text-gray-600 rounded-lg text-center font-medium">
                      {!isWithinDeadline(simulacion.fechaEntrega) ? 'Simulación Vencida' : 'No Disponible'}
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
          className="bg-white rounded-lg shadow-xl w-full max-w-[min(92vw,48rem)] h-[82vh] sm:h-[76vh] md:h-[72vh] lg:h-[70vh] overflow-hidden flex flex-col"
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
                        <div className="flex items-center space-x-3 flex-shrink-0">
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
    </div>
  );
}

export default Simulaciones_Alumno_comp;