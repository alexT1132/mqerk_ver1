// BACKEND: Componente de Actividades del Alumno
// Este componente maneja la página de actividades y tareas del estudiante con 4 niveles:
// 1. Tarjetas de áreas/módulos/materias
// 2. Lista de materias específicas del área
// 3. Botones de Actividades y Quiz por materia
// 4. Tabla de actividades específicas con funcionalidad completa
import React, { useState, useEffect } from 'react';
import { useStudent } from '../../context/StudentContext'; // BACKEND: Control de acceso a módulos
import { 
  Upload, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Download, 
  Edit, 
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewingActivityFile, setViewingActivityFile] = useState('');
  
  // Estados para modal de historial de quizzes (como en simulaciones)
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

  // BACKEND: TODO - Conectar con API para módulos específicos
  // Datos para módulos específicos de exámenes de ingreso (12 módulos completos)
  const modulosEspecificos = [
    {
      id: 1,
      titulo: "Ciencias Exactas",
      color: "from-blue-500 to-cyan-600",
      icono: <BarChart3 className="w-6 h-6" />,
      descripcion: "Matemáticas, Física, Química y disciplinas afines",
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
      borderColor: "border-blue-200"
    },
    {
      id: 2,
      titulo: "Ciencias Sociales",
      color: "from-purple-500 to-indigo-600",
      icono: <Users className="w-6 h-6" />,
      descripcion: "Sociología, Psicología, Antropología y áreas relacionadas",
      bgColor: "bg-gradient-to-br from-purple-50 to-indigo-50",
      borderColor: "border-purple-200"
    },
    {
      id: 3,
      titulo: "Humanidades y Artes",
      color: "from-rose-500 to-pink-600",
      icono: <BookOpen className="w-6 h-6" />,
      descripcion: "Literatura, Historia, Filosofía y expresiones artísticas",
      bgColor: "bg-gradient-to-br from-rose-50 to-pink-50",
      borderColor: "border-rose-200"
    },
    {
      id: 4,
      titulo: "Ciencias Naturales y de la Salud",
      color: "from-emerald-500 to-green-600",
      icono: <Heart className="w-6 h-6" />,
      descripcion: "Biología, Medicina, Enfermería y ciencias de la vida",
      bgColor: "bg-gradient-to-br from-emerald-50 to-green-50",
      borderColor: "border-emerald-200"
    },
    {
      id: 5,
      titulo: "Ingeniería y Tecnología",
      color: "from-orange-500 to-amber-600",
      icono: <Cog className="w-6 h-6" />,
      descripcion: "Ingenierías, Tecnología, Sistemas y áreas técnicas",
      bgColor: "bg-gradient-to-br from-orange-50 to-amber-50",
      borderColor: "border-orange-200"
    },
    {
      id: 6,
      titulo: "Ciencias Económico-Administrativas",
      color: "from-teal-500 to-cyan-600",
      icono: <TrendingUp className="w-6 h-6" />,
      descripcion: "Administración, Economía, Contaduría y Negocios",
      bgColor: "bg-gradient-to-br from-teal-50 to-cyan-50",
      borderColor: "border-teal-200"
    },
    {
      id: 7,
      titulo: "Educación y Deportes",
      color: "from-violet-500 to-purple-600",
      icono: <GraduationCap className="w-6 h-6" />,
      descripcion: "Pedagogía, Educación Física y ciencias del deporte",
      bgColor: "bg-gradient-to-br from-violet-50 to-purple-50",
      borderColor: "border-violet-200"
    },
    {
      id: 8,
      titulo: "Agropecuarias",
      color: "from-lime-500 to-green-600",
      icono: <Leaf className="w-6 h-6" />,
      descripcion: "Agronomía, Veterinaria, Zootecnia y ciencias agropecuarias",
      bgColor: "bg-gradient-to-br from-lime-50 to-green-50",
      borderColor: "border-lime-200"
    },
    {
      id: 9,
      titulo: "Turismo",
      color: "from-blue-400 to-sky-600",
      icono: <Globe className="w-6 h-6" />,
      descripcion: "Gestión turística, hotelería y servicios de viajes",
      bgColor: "bg-gradient-to-br from-blue-50 to-sky-50",
      borderColor: "border-blue-200"
    },
    {
      id: 10,
      titulo: "Núcleo UNAM / IPN",
      color: "from-yellow-500 to-amber-600",
      icono: <GraduationCap className="w-6 h-6" />,
      descripcion: "Materias esenciales para exámenes de admisión UNAM e IPN",
      bgColor: "bg-gradient-to-br from-yellow-50 to-amber-50",
      borderColor: "border-yellow-200"
    },
    {
      id: 11,
      titulo: "Militar, Naval y Náutica Mercante",
      color: "from-slate-500 to-gray-600",
      icono: <Anchor className="w-6 h-6" />,
      descripcion: "Preparación para instituciones militares, navales y marinas mercantes",
      bgColor: "bg-gradient-to-br from-slate-50 to-gray-50",
      borderColor: "border-slate-200"
    },
    {
      id: 12,
      titulo: "Módulo Transversal: Análisis Psicométrico",
      color: "from-purple-400 to-indigo-500",
      icono: <Brain className="w-6 h-6" />,
      descripcion: "Preparación para exámenes psicométricos y evaluaciones de aptitud",
      bgColor: "bg-gradient-to-br from-purple-50 to-indigo-50",
      borderColor: "border-purple-200"
    }
  ];
  // Datos de prueba para las áreas/materias (sin nivel intermedio)
  const areasData = [
    {
      id: 1,
      titulo: "Español y redacción indirecta",
      color: "from-amber-500 to-orange-600",
      icono: <FileText className="w-6 h-6" />,
      descripcion: "Competencias comunicativas y lingüísticas",
      bgColor: "bg-gradient-to-br from-amber-50 to-orange-50",
      borderColor: "border-amber-200"
    },
    {
      id: 2,
      titulo: "Matemáticas y pensamiento analítico",
      color: "from-blue-500 to-indigo-600",
      icono: <BarChart3 className="w-6 h-6" />,
      descripcion: "Razonamiento lógico y matemático",
      bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50",
      borderColor: "border-blue-200"
    },
    {
      id: 3,
      titulo: "Habilidades transversales",
      color: "from-emerald-500 to-green-600",
      icono: <Users className="w-6 h-6" />,
      descripcion: "Competencias interpersonales y sociales",
      bgColor: "bg-gradient-to-br from-emerald-50 to-green-50",
      borderColor: "border-emerald-200"
    },
    {
      id: 4,
      titulo: "Lengua extranjera",
      color: "from-purple-500 to-violet-600",
      icono: <BookOpen className="w-6 h-6" />,
      descripcion: "Comunicación en idioma extranjero",
      bgColor: "bg-gradient-to-br from-purple-50 to-violet-50",
      borderColor: "border-purple-200"
    },
    {
      id: 5,
      titulo: "Módulos específicos",
      color: "from-rose-500 to-pink-600",
      icono: <Award className="w-6 h-6" />,
      descripcion: "Conocimientos especializados",
      bgColor: "bg-gradient-to-br from-rose-50 to-pink-50",
      borderColor: "border-rose-200"
    }
  ];

  // BACKEND: TODO - Conectar con API /api/students/quizzes/{areaId}
  // Datos específicos para simulaciones/quiz con historial de intentos
  const quizzesData = [
    {
      id: 1,
      nombre: "Simulador de Álgebra Básica",
      descripcion: "Evaluación de conceptos fundamentales de álgebra",
      fechaEntrega: "2024-02-15",
      completado: true,
      fechaCompletado: "2024-02-14",
      score: 92,
      maxScore: 100,
      intentos: [
        {
          id: 1,
          numero: 1,
          fecha: "2024-02-13T10:30:00Z",
          puntaje: 85,
          tiempoEmpleado: 40,
          respuestasCorrectas: 17,
          totalPreguntas: 20,
          comentarios: "Buen manejo de ecuaciones lineales"
        },
        {
          id: 2,
          numero: 2,
          fecha: "2024-02-14T14:15:00Z",
          puntaje: 92,
          tiempoEmpleado: 38,
          respuestasCorrectas: 18,
          totalPreguntas: 20,
          comentarios: "Excelente mejora en factorización"
        }
      ],
      totalIntentos: 2,
      mejorPuntaje: 92,
      maxIntentos: 3,
      tiempoLimite: "45 minutos",
      estado: "completado", // disponible, completado, vencido
      entregada: true,
      areaId: 2, // Matemáticas
      tipo: "quiz"
    },
    {
      id: 2,
      nombre: "Simulador de Geometría",
      descripcion: "Evaluación de conceptos geométricos básicos",
      fechaEntrega: "2024-02-20",
      completado: false,
      fechaCompletado: null,
      score: null,
      maxScore: 100,
      intentos: [],
      totalIntentos: 0,
      mejorPuntaje: null,
      maxIntentos: 2,
      tiempoLimite: "60 minutos",
      estado: "disponible",
      entregada: false,
      areaId: 2, // Matemáticas
      tipo: "quiz"
    },
    {
      id: 3,
      nombre: "Quiz de Comprensión Lectora",
      descripcion: "Evaluación de habilidades de comprensión textual",
      fechaEntrega: "2025-07-18",
      completado: true,
      fechaCompletado: "2025-07-19",
      score: 78,
      maxScore: 100,
      intentos: [
        {
          id: 1,
          numero: 1,
          fecha: "2025-07-19T11:45:00Z",
          puntaje: 78,
          tiempoEmpleado: 28,
          respuestasCorrectas: 23,
          totalPreguntas: 30,
          comentarios: "Buena comprensión general, mejorar análisis crítico"
        }
      ],
      totalIntentos: 1,
      mejorPuntaje: 78,
      maxIntentos: 3,
      tiempoLimite: "30 minutos",
      estado: "completado",
      entregada: true,
      areaId: 1, // Español
      tipo: "quiz"
    },
    {
      id: 4,
      nombre: "Simulador de Redacción",
      descripcion: "Evaluación de habilidades de escritura y redacción",
      fechaEntrega: "2025-07-20",
      completado: false,
      fechaCompletado: null,
      score: null,
      maxScore: 100,
      intentos: [],
      totalIntentos: 0,
      mejorPuntaje: null,
      maxIntentos: 1,
      tiempoLimite: "90 minutos",
      estado: "disponible",
      entregada: false,
      areaId: 1, // Español
      tipo: "quiz"
    }
  ];

  // BACKEND: TODO - Conectar con API /api/students/activities/{areaId}
  // Datos mejorados para actividades con historial de intentos
  const actividadesData = [
    {
      id: 1,
      nombre: "Operaciones fundamentales",
      descripcion: "Ejercicios básicos de suma, resta, multiplicación y división",
      fechaEntrega: "2024-02-12",
      fechaSubida: null,
      archivo: null,
      entregada: false,
      score: null,
      maxScore: 100,
      estado: "pendiente", // pendiente, entregada, revisada
      areaId: 2, // Matemáticas
      tipo: "actividades",
      intentos: [], // Historial de intentos
      totalIntentos: 0, // Contador total de intentos
      mejorPuntaje: null // Mejor puntaje obtenido
    },
    {
      id: 2,
      nombre: "Expresiones algebraicas",
      descripcion: "Simplificación y evaluación de expresiones algebraicas",
      fechaEntrega: "2024-02-12", 
      fechaSubida: "2024-02-10",
      archivo: "/sample-algebra.pdf",
      entregada: true,
      score: 85,
      maxScore: 100,
      estado: "revisada",
      areaId: 2, // Matemáticas
      tipo: "actividades",
      intentos: [
        {
          numero: 1,
          fecha: "2024-02-08",
          puntaje: 72,
          archivo: "/sample-algebra-v1.pdf",
          comentarios: "Buen trabajo, pero necesita mejorar en factorización"
        },
        {
          numero: 2,
          fecha: "2024-02-10",
          puntaje: 85,
          archivo: "/sample-algebra-v2.pdf",
          comentarios: "Excelente mejora en la comprensión de conceptos"
        }
      ],
      totalIntentos: 2,
      mejorPuntaje: 85
    },
    {
      id: 3,
      nombre: "Ensayo sobre literatura moderna",
      descripcion: "Análisis crítico de obras contemporráneas",
      fechaEntrega: "2024-02-20",
      fechaSubida: null,
      archivo: null,
      entregada: false,
      score: null,
      maxScore: 100,
      estado: "pendiente",
      areaId: 1, // Español
      tipo: "actividades",
      intentos: [],
      totalIntentos: 0,
      mejorPuntaje: null
    },
    {
      id: 4,
      nombre: "Redacción Argumentativa",
      descripcion: "Escritura de ensayos con estructura argumentativa",
      fechaEntrega: "2025-08-15",
      fechaSubida: "2025-07-05",
      archivo: "/sample-essay.pdf",
      entregada: true,
      score: 88,
      maxScore: 100,
      estado: "revisada",
      areaId: 1, // Español
      tipo: "actividades",
      intentos: [
        {
          numero: 1,
          fecha: "2025-06-20",
          puntaje: 70,
          archivo: "/essay-v1.pdf",
          comentarios: "Buena estructura pero falta evidencia"
        },
        {
          numero: 2,
          fecha: "2025-06-28",
          puntaje: 82,
          archivo: "/essay-v2.pdf",
          comentarios: "Mejora en argumentación, refinar conclusión"
        },
        {
          numero: 3,
          fecha: "2025-07-05",
          puntaje: 88,
          archivo: "/essay-v3.pdf",
          comentarios: "Excelente trabajo final, muy bien estructurado"
        }
      ],
      totalIntentos: 3,
      mejorPuntaje: 88
    }
  ];

  // Meses como ordinales (como en Feedback)
  const months = [
    'Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto', 'Sexto',
    'Séptimo', 'Octavo', 'Noveno',
  ];

  // BACKEND: Inicializar con al menos un área permitida si es el primer acceso
  useEffect(() => {
    if (allowedActivityAreas.length === 0) {
      // Si es la primera vez, agregar automáticamente el área de Ciencias Exactas
      addAllowedActivityArea(1);
    }
  }, [allowedActivityAreas.length, addAllowedActivityArea]);

  // Efecto para simular algunos reintentos de prueba
  useEffect(() => {
    // Simular que el usuario ya ha realizado algunos intentos en ciertas actividades
    const actividadesConIntentos = actividades.map(act => {
      if (act.id === 1 && act.totalIntentos === 0) {
        // Simular intentos para "Operaciones fundamentales"
        return {
          ...act,
          entregada: true,
          estado: 'revisada',
          score: 75,
          mejorPuntaje: 75,
          totalIntentos: 2,
          intentos: [
            {
              numero: 1,
              fecha: "2024-02-10",
              puntaje: 65,
              archivo: "/operations-v1.pdf",
              comentarios: "Buen trabajo inicial, pero necesita mejorar en divisiones"
            },
            {
              numero: 2,
              fecha: "2024-02-12",
              puntaje: 75,
              archivo: "/operations-v2.pdf",
              comentarios: "Mejora notable, sigue practicando"
            }
          ]
        };
      }
      return act;
    });
    
    if (JSON.stringify(actividades) !== JSON.stringify(actividadesConIntentos)) {
      setActividades(actividadesConIntentos);
    }
  }, []);

  // Efecto para calcular el puntaje total (como en Feedback)
  useEffect(() => {
    const calculatedTotal = actividades.reduce((sum, actividad) => sum + (actividad.score || 0), 0);
    setTotalScore(calculatedTotal);
  }, [actividades]);

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
    setCurrentLevel('table'); // Ir directamente a la tabla
    
    // BACKEND: TODO - Cargar actividades o quiz según el área y tipo seleccionado
    if (type === 'quiz') {
      const filteredQuizzes = quizzesData.filter(quiz => quiz.areaId === selectedArea.id);
      setActividades(filteredQuizzes);
    } else {
      const filteredActividades = actividadesData.filter(
        act => act.areaId === selectedArea.id && act.tipo === type
      );
      setActividades(filteredActividades);
    }
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
  const handleFileUpload = (actividadId, file) => {
    // BACKEND: Validar que el archivo sea PDF antes de enviar al servidor
    // Esta validación debe replicarse en el backend para seguridad
    if (!file || file.type !== 'application/pdf') {
      showNotification(
        'Archivo no válido',
        'Por favor, selecciona únicamente archivos PDF.',
        'warning'
      );
      return;
    }
    
    // BACKEND: TODO - Enviar archivo al servidor con validación adicional de tipo MIME
    const fileUrl = file ? URL.createObjectURL(file) : null;
    
    // Para actividades: no simular puntaje inmediato, va a revisión
    const esTipoActividad = selectedType === 'actividades';
    
    // Actualizar estado local y agregar al historial de intentos
    setActividades(prev => prev.map(act => {
      if (act.id === actividadId) {
        const nuevoIntento = {
          numero: act.totalIntentos + 1,
          fecha: new Date().toISOString().split('T')[0],
          puntaje: esTipoActividad ? null : Math.floor(Math.random() * 30) + 70, // Solo para quiz
          archivo: fileUrl,
          comentarios: `Intento ${act.totalIntentos + 1} - Entregado el ${new Date().toLocaleDateString('es-ES')}`
        };
        
        const nuevosIntentos = [...act.intentos, nuevoIntento];
        
        return {
          ...act,
          archivo: fileUrl,
          entregada: true,
          fechaSubida: new Date().toISOString().split('T')[0],
          estado: esTipoActividad ? 'entregada' : 'revisada', // Actividades van a revisión
          score: esTipoActividad ? null : nuevoIntento.puntaje, // Sin puntaje inmediato para actividades
          intentos: nuevosIntentos,
          totalIntentos: act.totalIntentos + 1,
          mejorPuntaje: esTipoActividad ? null : Math.max(act.mejorPuntaje || 0, nuevoIntento.puntaje)
        };
      }
      return act;
    }));
    
    // Cerrar modal y mostrar efectos visuales
    setShowUploadModal(false);
    setSelectedActividad(null);
    
    // Efectos de celebración diferentes para actividades vs quiz
    if (esTipoActividad) {
      setConfettiScore(0); // 0 indica "en revisión"
    } else {
      const puntajeSimulado = Math.floor(Math.random() * 30) + 70;
      setConfettiScore(puntajeSimulado);
    }
    
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  // Funciones para modales (mejoradas como en Feedback)
  const openUploadModal = (actividad) => {
    setSelectedActividad(actividad);
    setShowUploadModal(true);
  };

  const openViewModal = (actividad) => {
    setSelectedActividad(actividad);
    setViewingActivityFile(actividad.archivo);
    setShowViewModal(true);
  };

  const openEditModal = (actividad) => {
    setSelectedActividad(actividad);
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowUploadModal(false);
    setShowViewModal(false);
    setShowEditModal(false);
    setSelectedActividad(null);
    setViewingActivityFile('');
  };

  // Función para descargar actividad
  const handleDownload = (actividadId) => {
    // BACKEND: TODO - Descargar archivo de actividad
    console.log('Descargando actividad:', actividadId);
    // Por ahora, simular descarga
    const link = document.createElement('a');
    link.href = '/sample-activity.pdf';
    link.download = `actividad_${actividadId}.pdf`;
    link.click();
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

  // Funciones específicas para Quiz/Simulaciones
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

  // Función para agregar un nuevo intento al historial
  const agregarIntento = (actividadId, puntaje, archivo, comentarios = null) => {
    setActividades(prev => prev.map(actividad => {
      if (actividad.id === actividadId) {
        const nuevoIntento = {
          numero: actividad.totalIntentos + 1,
          fecha: new Date().toISOString().split('T')[0],
          puntaje: puntaje,
          archivo: archivo,
          comentarios: comentarios
        };
        
        const nuevosIntentos = [...actividad.intentos, nuevoIntento];
        const nuevoMejorPuntaje = Math.max(actividad.mejorPuntaje || 0, puntaje);
        
        return {
          ...actividad,
          intentos: nuevosIntentos,
          totalIntentos: actividad.totalIntentos + 1,
          mejorPuntaje: nuevoMejorPuntaje,
          score: nuevoMejorPuntaje, // El score actual es el mejor puntaje
          fechaSubida: new Date().toISOString().split('T')[0],
          entregada: true,
          estado: 'revisada'
        };
      }
      return actividad;
    }));
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

  // Funciones para el modal de historial de quizzes (como en simulaciones)
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
    
    // Para actividades que no tienen puntaje asignado aún
    if (selectedType === 'actividades' && item.score === null) {
      return 'En revisión';
    }
    
    return item.mejorPuntaje || 0;
  };

  // Modal para subir archivos
  const renderUploadModal = () => {
    if (!showUploadModal || !selectedActividad) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
          {/* Header del modal */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 text-center">
            <Upload className="w-12 h-12 text-white mx-auto mb-4" />
            <h2 className="text-xl font-bold">Subir Actividad</h2>
          </div>

          {/* Contenido del modal */}
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {selectedActividad.nombre}
              </h3>
              <p className="text-gray-600 text-sm">
                Selecciona el archivo de tu actividad completada
              </p>
            </div>

            <div className="mb-6">
              <input
                type="file"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  // Lógica para subir archivo
                  closeModals();
                }}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Subir
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Modal para ver archivos
  const renderViewModal = () => {
    if (!showViewModal || !selectedActividad) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
          {/* Header del modal */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Ver Actividad</h2>
                <p className="text-purple-100 mt-1">{selectedActividad.nombre}</p>
              </div>
              <button
                onClick={closeModals}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Contenido del modal */}
          <div className="p-6">
            {selectedActividad.archivo ? (
              <div className="text-center">
                <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  Archivo: {selectedActividad.archivo || 'archivo.pdf'}
                </p>
                <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                  <Download className="w-4 h-4 inline mr-2" />
                  Descargar
                </button>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>No hay archivo disponible para esta actividad.</p>
              </div>
            )}
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

  // Función para renderizar las áreas principales
  const renderAreas = () => (
    <div className="min-h-screen bg-white p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
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

        {/* Grid de áreas con el mismo estilo que simulaciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {areasData.map((area) => (
            <div key={area.id} onClick={() => handleSelectArea(area)}>
              <div className={`${area.bgColor} ${area.borderColor} border rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group p-6 flex flex-col h-full cursor-pointer`}>
                <div className="text-center flex-grow">
                  <div className={`w-16 h-16 bg-gradient-to-br ${area.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    {area.icono}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{area.titulo}</h3>
                  <p className="text-gray-700 text-sm mb-4 leading-relaxed">{area.descripcion}</p>
                </div>
                <div className="text-center mt-auto pt-4">
                  <div className="inline-flex items-center text-gray-600 font-medium text-sm">
                    <span>Explorar área</span>
                    <ArrowLeft className="w-4 h-4 ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {modulosEspecificos.map((modulo) => {
              const isAllowed = allowedActivityAreas.includes(modulo.id);
              const request = activityRequests.find(req => req.areaId === modulo.id);
              const isPending = request && request.status === 'pending';

              let actionHandler = () => {};
              let footerContent;
              let cardClassName = `${modulo.bgColor} ${modulo.borderColor} border rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group p-6 flex flex-col h-full`;
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
                <div key={modulo.id} onClick={isClickable ? actionHandler : undefined}>
                  <div className={cardClassName}>
                    <div className="text-center flex-grow">
                      <div className={`w-16 h-16 bg-gradient-to-br ${modulo.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                        {getIconComponent(modulo.icono?.type?.name || 'BookOpen')}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{modulo.titulo}</h3>
                      <p className="text-gray-700 text-sm mb-4 leading-relaxed">{modulo.descripcion}</p>
                    </div>
                    <div className="text-center mt-auto pt-4">
                      {footerContent}
                    </div>
                  </div>
                </div>
              );
            })}
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
                  TIPOS DE CONTENIDO
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-12 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"></div>
                  <div className="w-12 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjetas de tipos de contenido */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Botón de Actividades */}
          <div
            onClick={() => handleSelectType('actividades')}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
          >
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Actividades</h3>
              <h4 className="text-lg font-semibold text-blue-700 mb-4">Tareas y ejercicios</h4>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Tareas y ejercicios prácticos para reforzar tu aprendizaje
              </p>
              <div className="inline-flex items-center text-blue-600 font-medium text-sm">
                <span>ACCEDER</span>
                <ArrowLeft className="w-4 h-4 ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Botón de Quiz/Simulaciones */}
          <div
            onClick={() => handleSelectType('quiz')}
            className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
          >
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Quiz y Simulaciones</h3>
              <h4 className="text-lg font-semibold text-purple-700 mb-4">Evaluaciones</h4>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Evaluaciones interactivas y simuladores de examen
              </p>
              <div className="inline-flex items-center text-purple-600 font-medium text-sm">
                <span>ACCEDER</span>
                <ArrowLeft className="w-4 h-4 ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

    // Función para renderizar tabla de actividades
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

        {/* Tabla de actividades */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-blue-500 to-indigo-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Actividad
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Fecha Límite
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Puntaje
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
                {filteredActividades.map((actividad, index) => (
                  <tr key={actividad.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{actividad.nombre}</div>
                        <div className="text-sm text-gray-500">{actividad.descripcion}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(actividad.fechaEntrega).toLocaleDateString('es-ES')}
                      </div>
                      <div className={`text-xs ${isWithinDeadline(actividad.fechaEntrega) ? 'text-green-600' : 'text-red-600'}`}>
                        {isWithinDeadline(actividad.fechaEntrega) ? 'A tiempo' : 'Vencida'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        actividad.estado === 'revisada' ? 'bg-green-100 text-green-800' :
                        actividad.estado === 'entregada' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {actividad.estado === 'revisada' ? 'Revisada' :
                         actividad.estado === 'entregada' ? 'Entregada' :
                         'Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {actividad.score !== null ? `${actividad.score}%` : 'Sin calificar'}
                      </div>
                      {actividad.mejorPuntaje && (
                        <div className="text-xs text-gray-500">
                          Mejor: {actividad.mejorPuntaje}%
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{actividad.totalIntentos}</div>
                      {actividad.totalIntentos > 0 && (
                        <button
                          onClick={() => mostrarHistorial(actividad.id)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Ver historial
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {!actividad.entregada ? (
                          <button
                            onClick={() => openUploadModal(actividad)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Subir actividad"
                          >
                            <Upload className="w-4 h-4" />
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => openViewModal(actividad)}
                              className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                              title="Ver actividad"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReintentar(actividad.id)}
                              className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg transition-colors"
                              title="Reintentar"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          </>
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

    // Función para renderizar tabla de quiz/simulaciones
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz y Simulaciones</h1>
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
      {renderEditModal()}
      {renderHistorialModal()}
      {renderNotificationModal()}

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