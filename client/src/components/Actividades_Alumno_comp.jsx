// BACKEND: Componente de Actividades del Alumno
// Este componente maneja la página de actividades y tareas del estudiante con 4 niveles:
// 1. Tarjetas de áreas/módulos/materias
// 2. Lista de materias específicas del área
// 3. Botones de Actividades y Quiz por materia
// 4. Tabla de actividades específicas con funcionalidad completa
import React, { useState, useEffect } from 'react';
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
  Play
} from 'lucide-react';

/**
 * BACKEND: Componente de actividades con navegación simple
 * Flujo: áreas/módulos/materias -> botones (actividades/quiz) -> tabla
 */
export function Actividades_Alumno_comp() {
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

  // BACKEND: TODO - Conectar con API para módulos específicos
  // Datos para módulos específicos de exámenes de ingreso
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
    'Séptimo', 'Octavo', 'Noveno', 'Décimo', 'Undécimo', 'Duodécimo'
  ];

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

  // Función para manejar la selección de módulo específico
  const handleSelectModulo = (modulo) => {
    setSelectedModulo(modulo);
    setCurrentLevel('buttons');
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
      alert('Por favor, selecciona únicamente archivos PDF.');
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
    alert('Redirigiendo a la simulación...');
  };

  const handleVisualizarResultados = (quizId) => {
    // BACKEND: TODO - Mostrar resultados del quiz
    console.log('Visualizando resultados:', quizId);
    alert('Mostrando resultados del quiz...');
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
      
      alert(historialTexto);
    } else {
      alert('No hay historial de intentos disponible para esta actividad.');
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

  // NIVEL 1: Tarjetas de áreas/módulos/materias
  const renderAreas = () => (
    <div className="min-h-screen bg-white p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-8">
          <div className="px-6 py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  Portal de Actividades Académicas
                </h1>
                <p className="text-gray-600">
                  Áreas generales y módulos específicos organizados por competencias
                </p>
              </div>
              <div className="mt-4 lg:mt-0 flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                <span>Actualizado hoy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Subtítulo */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-gray-600" />
            Materias del curso y módulos específicos
          </h2>
        </div>

        {/* Tarjetas de áreas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {areasData.map((area) => (
            <div
              key={area.id}
              onClick={() => handleSelectArea(area)}
              className={`${area.bgColor} rounded-lg border-2 ${area.borderColor} shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer group`}
            >
              <div className="p-6">
                <div className={`w-12 h-12 bg-gradient-to-br ${area.color} rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-105 transition-transform shadow-sm`}>
                  {area.icono}
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2 leading-tight">
                  {area.titulo}
                </h3>
                <p className="text-gray-700 text-sm mb-4">
                  {area.descripcion}
                </p>
                <div className="flex items-center text-blue-600 text-sm font-medium">
                  <span>Ver actividades</span>
                  <ArrowLeft className="w-4 h-4 ml-1 rotate-180 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // NIVEL 2: Módulos específicos para exámenes de ingreso
  const renderModulos = () => (
    <div className="min-h-screen bg-white p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header con botón de regreso */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-8">
          <div className="px-6 py-6">
            <div className="flex items-center space-x-4 mb-4">
              <button
                onClick={handleGoBack}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Volver
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${selectedArea?.color} rounded-lg flex items-center justify-center text-white`}>
                {selectedArea?.icono}
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  {selectedArea?.titulo}
                </h1>
                <p className="text-gray-600">
                  Selecciona el área de conocimiento para simulaciones de exámenes de ingreso
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Subtítulo */}
        <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-lg border border-indigo-200 shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <GraduationCap className="w-5 h-5 mr-2 text-indigo-600" />
            Áreas de Conocimiento para Exámenes de Ingreso Universitario
          </h2>
          <p className="text-gray-600 text-sm mt-2">
            Estas áreas están diseñadas para prepararte para los exámenes de admisión a universidades
          </p>
        </div>

        {/* Tarjetas de módulos específicos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {modulosEspecificos.map((modulo) => (
            <div
              key={modulo.id}
              onClick={() => handleSelectModulo(modulo)}
              className={`${modulo.bgColor} rounded-lg border-2 ${modulo.borderColor} shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer group`}
            >
              <div className="p-6">
                <div className={`w-12 h-12 bg-gradient-to-br ${modulo.color} rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-105 transition-transform shadow-sm`}>
                  {modulo.icono}
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2 leading-tight">
                  {modulo.titulo}
                </h3>
                <p className="text-gray-700 text-sm mb-4">
                  {modulo.descripcion}
                </p>
                <div className="flex items-center text-blue-600 text-sm font-medium">
                  <span>Acceder</span>
                  <ArrowLeft className="w-4 h-4 ml-1 rotate-180 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // NIVEL 3: Botones de Actividades y Quiz (modificado para incluir contexto de módulos)
  const renderButtons = () => (
    <div className="min-h-screen bg-white p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header con botón de regreso */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-8">
          <div className="px-6 py-6">
            <div className="flex items-center space-x-4 mb-4">
              <button
                onClick={handleGoBack}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Volver
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${selectedModulo ? selectedModulo.color : selectedArea?.color} rounded-lg flex items-center justify-center text-white`}>
                {selectedModulo ? selectedModulo.icono : selectedArea?.icono}
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  {selectedModulo ? selectedModulo.titulo : selectedArea?.titulo}
                </h1>
                <p className="text-gray-600">
                  {selectedModulo 
                    ? `${selectedArea?.titulo} - Selecciona el tipo de contenido que deseas ver`
                    : "Selecciona el tipo de contenido que deseas ver"
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

          {/* Selector de actividades del mes */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-200 shadow-md p-8 mb-8 relative overflow-hidden">
          {/* Decorative background pattern */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-100/30 to-blue-100/30 rounded-full blur-xl"></div>
          
          <div className="flex items-center justify-center relative z-10">
            <div className="flex items-center space-x-4">
              {/* Icon container with gradient background */}
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center">
                  <Brain className="w-2 h-2 text-white" />
                </div>
              </div>
              
              {/* Title with enhanced styling */}
              <div className="flex flex-col items-center">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-700 bg-clip-text text-transparent">
                  Actividades y Quizzes
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-12 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
                  <div className="w-12 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"></div>
                </div>
              </div>
            </div>
          
           
          </div>
        </div>

        {/* Botones de tipo de actividad */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Botón de Actividades */}
          <div
            onClick={() => handleSelectType('actividades')}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer group"
          >
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform shadow-md">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Actividades</h3>
              <p className="text-gray-700 mb-6">Ver y gestionar todas las actividades académicas</p>
              <div className="inline-flex items-center text-blue-600 font-medium">
                <span>Acceder</span>
                <ArrowLeft className="w-4 h-4 ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Botón de Quiz */}
          <div
            onClick={() => handleSelectType('quiz')}
            className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer group"
          >
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform shadow-md">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quiz</h3>
              <p className="text-gray-700 mb-6">Cuestionarios y evaluaciones en línea</p>
              <div className="inline-flex items-center text-emerald-600 font-medium">
                <span>Acceder</span>
                <ArrowLeft className="w-4 h-4 ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // NIVEL 3: Tabla de actividades específicas (diseño original)
  const renderTablaActividades = () => (
    <div className="min-h-screen bg-white p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header con navegación */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
          <div className="px-6 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                <button
                  onClick={handleGoBack}
                  className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Atrás
                </button>
                <div className="border-l border-gray-300 pl-4">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    Actividades
                  </h1>
                  <p className="text-gray-600">{selectedModulo ? selectedModulo.titulo : selectedArea?.titulo}</p>
                </div>
              </div>
              
              {/* Puntos totales */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                <div className="flex items-center space-x-2">
                  <Star className="w-6 h-6 text-yellow-500" fill="currentColor" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Puntos Totales:</p>
                    <p className="text-2xl font-bold text-gray-900">{totalScore} pts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Animación de confeti */}
        {showConfetti && (
          <>
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm pointer-events-none z-40"></div>
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-40">
              {Array.from({ length: isMobile ? 50 : 200 }).map((_, i) => {
                const colors = ['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400', 'bg-pink-400'];
                const leftPosition = Math.random() * 100;
                const animationDelay = Math.random() * 2;
                
                return (
                  <div
                    key={i}
                    className={`absolute ${colors[i % colors.length]} opacity-80 rounded w-3 h-3 animate-bounce top-0`}
                    style={{
                      left: `${leftPosition}%`,
                      animationDelay: `${animationDelay}s`
                    }}
                  />
                );
              })}

              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col items-center text-center">
                <Sparkles className="w-20 h-20 sm:w-32 sm:h-32 text-yellow-300 animate-pulse" />
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xl sm:text-3xl px-6 py-3 sm:px-8 sm:py-4 rounded-xl shadow-xl border-2 border-yellow-200 animate-bounce mt-4">
                  {confettiScore > 0 ? `+${confettiScore} puntos` : 'En revisión'}
                </div>
                <p className="mt-2 text-xl sm:text-2xl font-bold text-indigo-700">
                  {confettiScore > 0 ? '¡Excelente trabajo!' : '¡Actividad entregada!'}
                </p>
              </div>
            </div>
          </>
        )}

        {/* Filtro de mes */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <label className="text-sm font-medium text-gray-700">
              Filtrar por mes:
            </label>
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between w-full sm:w-48 px-4 py-2 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="text-gray-900">{getSelectedMonthName()}</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-30 max-h-48 overflow-y-auto">
                  <div
                    onClick={() => handleMonthSelect('all')}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-900 border-b border-gray-100"
                  >
                    Todos los meses
                  </div>
                  {months.map((month, index) => (
                    <div
                      key={index}
                      onClick={() => handleMonthSelect(index.toString())}
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-900 border-b border-gray-100 last:border-b-0"
                    >
                      {month}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Vista de escritorio - Tabla de actividades */}
        <div className="hidden lg:block bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actividad</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Entrega</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Descargar</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Subir</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Editar</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ver</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Entregado</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Puntaje</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredActividades.length > 0 ? (
                filteredActividades.map((actividad, index) => (
                  <tr key={actividad.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">{actividad.nombre}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center text-sm text-gray-900">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {new Date(actividad.fechaEntrega).toLocaleDateString('es-ES')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleDownload(actividad.id)}
                        className="inline-flex items-center justify-center w-10 h-10 bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700 rounded-lg transition-all duration-200 hover:shadow-md border border-green-200 hover:border-green-300"
                        title="Descargar"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => openUploadModal(actividad)}
                        className="inline-flex items-center justify-center px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md border border-blue-200 hover:border-blue-300"
                      >
                        {actividad.entregada ? 'Reintentar' : 'Subir'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => openEditModal(actividad)}
                        className="inline-flex items-center justify-center w-10 h-10 bg-orange-50 hover:bg-orange-100 text-orange-600 hover:text-orange-700 rounded-lg transition-all duration-200 hover:shadow-md border border-orange-200 hover:border-orange-300"
                        title="Editar"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => openViewModal(actividad)}
                        disabled={!actividad.archivo}
                        className={`inline-flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 ${
                          actividad.archivo
                            ? 'bg-purple-50 hover:bg-purple-100 text-purple-600 hover:text-purple-700 hover:shadow-md border border-purple-200 hover:border-purple-300'
                            : 'bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-200'
                        }`}
                        title="Ver"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {actividad.entregada ? (
                        <CheckCircle className="w-6 h-6 text-green-500 mx-auto" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-500 mx-auto" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm text-gray-900 font-medium">
                        {actividad.score !== null ? `${actividad.score}/${actividad.maxScore} pts` : 'En revisión'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                    No hay actividades para el mes seleccionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Vista móvil - Cards de actividades */}
        <div className="lg:hidden space-y-4">
          {filteredActividades.length > 0 ? (
            filteredActividades.map((actividad, index) => (
              <div
                key={actividad.id}
                className="bg-white rounded-lg border border-gray-200 shadow-sm p-6"
              >
                {/* Badge de estado */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded">#{index + 1}</span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        actividad.entregada ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                      }`}>
                        {actividad.entregada ? 'Entregado' : 'Pendiente'}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">{actividad.nombre}</h3>
                    <p className="text-gray-600 text-sm mb-2">{actividad.descripcion}</p>
                    <div className="flex items-center text-xs text-gray-500 mb-2">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>Entrega: {new Date(actividad.fechaEntrega).toLocaleDateString('es-ES')}</span>
                    </div>
                  </div>
                </div>
                
                {/* Puntaje */}
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                  <span className="text-sm font-medium text-gray-900">
                    {actividad.score !== null ? `${actividad.score}/${actividad.maxScore} pts` : 'En revisión'}
                  </span>
                </div>
                
                {/* Botones de acción */}
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => handleDownload(actividad.id)}
                    className="p-3 bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700 rounded-lg transition-all duration-200 hover:shadow-md border border-green-200 hover:border-green-300 flex items-center justify-center"
                    title="Descargar"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => openUploadModal(actividad)}
                    className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 rounded-lg transition-all duration-200 hover:shadow-md border border-blue-200 hover:border-blue-300 flex items-center justify-center"
                    title="Subir"
                  >
                    <Upload className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => openEditModal(actividad)}
                    className="p-3 bg-orange-50 hover:bg-orange-100 text-orange-600 hover:text-orange-700 rounded-lg transition-all duration-200 hover:shadow-md border border-orange-200 hover:border-orange-300 flex items-center justify-center"
                    title="Editar"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => openViewModal(actividad)}
                    disabled={!actividad.archivo}
                    className={`p-3 rounded-lg transition-all duration-200 flex items-center justify-center ${
                      actividad.archivo
                        ? 'bg-purple-50 hover:bg-purple-100 text-purple-600 hover:text-purple-700 hover:shadow-md border border-purple-200 hover:border-purple-300'
                        : 'bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-200'
                    }`}
                    title="Ver"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-500">
                No hay actividades para el mes seleccionado.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Overlay para cerrar dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
  // NIVEL 3: Tabla específica para Quiz/Simulaciones
  const renderTablaQuiz = () => (
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
                    Evaluaciones
                  </h1>
                  <p className="text-gray-600">
                    {selectedModulo ? selectedModulo.titulo : selectedArea?.titulo}
                  </p>
                </div>
              </div>
              <div className="mt-4 lg:mt-0 flex items-center text-sm text-gray-500">
                <Target className="w-4 h-4 mr-1" />
                <span>{filteredActividades.length} evaluaciones disponibles</span>
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
                  EVALUACIONES DISPONIBLES
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
              Filtrar evaluaciones
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

        {/* Vista de escritorio - Tabla de evaluaciones */}
        <div className="hidden lg:block bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Evaluación
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha límite
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ejecutar
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entregado
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Volver a intentar
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visualizar
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Historial
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Puntaje
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredActividades.length > 0 ? (
                  filteredActividades.map((quiz, index) => (
                    <tr key={quiz.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-900">
                          {quiz.nombre}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {new Date(quiz.fechaEntrega).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isQuizAvailable(quiz) ? (
                          <button
                            onClick={() => handleIniciarSimulacion(quiz.id)}
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
                            {!isWithinDeadline(quiz.fechaEntrega) ? 'VENCIDO' : 'NO DISPONIBLE'}
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {quiz.entregada ? (
                          <CheckCircle className="w-6 h-6 text-green-500 mx-auto" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-500 mx-auto" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {quiz.entregada ? (
                          <button
                            onClick={() => handleReintentar(quiz.id)}
                            className="relative px-5 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg text-sm font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-b-3 border-red-600 hover:border-red-700 active:scale-95 active:border-b-1"
                          >
                            <span className="relative z-10 flex items-center justify-center">
                              <RotateCcw className="w-4 h-4 mr-1" />
                              REINTENTAR
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 to-transparent rounded-lg"></div>
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {quiz.entregada ? (
                          <button
                            onClick={() => handleVisualizarResultados(quiz.id)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver resultados"
                          >
                            <Trophy className="w-5 h-5" />
                          </button>
                        ) : (
                          <button
                            disabled
                            className="p-2 text-gray-300 cursor-not-allowed rounded-lg"
                            title="Ver resultados"
                          >
                            <Trophy className="w-5 h-5" />
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {quiz.entregada && getTotalAttempts(quiz.id) > 0 ? (
                          <button
                            onClick={() => handleVerHistorial(quiz)}
                            className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors"
                          >
                            <FileText className="w-3 h-3 mr-1" />
                            Ver historial ({getTotalAttempts(quiz.id)})
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-sm text-gray-900 font-medium">
                          {quiz.entregada ? (
                            <div className="space-y-1">
                              <div className={`font-bold ${quiz.score !== null ? 'text-green-600' : 'text-blue-600'}`}>
                                {quiz.score !== null ? `${getBestScore(quiz.id)} %` : 'En revisión'}
                              </div>
                              {getTotalAttempts(quiz.id) > 1 && quiz.score !== null && (
                                <div className="text-xs text-gray-500">
                                  Mejor de {getTotalAttempts(quiz.id)} intentos
                                </div>
                              )}
                              {quiz.score === null && (
                                <div className="text-xs text-gray-500">
                                  Pendiente de calificación
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
                    <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                      No hay evaluaciones para el mes seleccionado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vista móvil - Cards de evaluaciones */}
        <div className="lg:hidden space-y-4">
          {filteredActividades.length > 0 ? (
            filteredActividades.map((quiz, index) => (
              <div
                key={quiz.id}
                className="bg-white rounded-lg border border-gray-200 shadow-sm p-6"
              >
                {/* Badge de estado */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-2">{quiz.nombre}</h3>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Límite: {new Date(quiz.fechaEntrega).toLocaleDateString('es-ES')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                      <span className="text-sm font-medium text-gray-900">
                        {quiz.entregada ? (
                          <div className="flex flex-col">
                            <span className={`font-bold ${quiz.score !== null ? 'text-green-600' : 'text-blue-600'}`}>
                              {quiz.score !== null ? `${getBestScore(quiz.id)} %` : 'En revisión'}
                            </span>
                            {getTotalAttempts(quiz.id) > 1 && quiz.score !== null && (
                              <span className="text-xs text-gray-500">
                                Mejor de {getTotalAttempts(quiz.id)} intentos
                              </span>
                            )}
                            {quiz.score === null && (
                              <span className="text-xs text-gray-500">
                                Pendiente de calificación
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
                    quiz.entregada ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                  }`}>
                    {quiz.entregada ? 'Completado' : 'Pendiente'}
                  </span>
                </div>
                
                {/* Botones de acción específicos para quiz */}
                <div className="space-y-2">
                  {/* Botón Ejecutar */}
                  {isQuizAvailable(quiz) && (
                    <button
                      onClick={() => handleIniciarSimulacion(quiz.id)}
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
                  {quiz.entregada && (
                    <button
                      onClick={() => handleReintentar(quiz.id)}
                      className="relative w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl text-base font-bold uppercase tracking-wider shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-b-4 border-red-600 hover:border-red-700 active:scale-95 active:border-b-2"
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        <RotateCcw className="w-5 h-5 mr-3" />
                        REINTENTAR
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-t from-red-600/30 to-transparent rounded-xl"></div>
                      <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  )}

                  {/* Botón Ver Historial */}
                  {quiz.entregada && getTotalAttempts(quiz.id) > 0 && (
                    <button
                      onClick={() => handleVerHistorial(quiz)}
                      className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Ver Historial ({getTotalAttempts(quiz.id)} intentos)
                    </button>
                  )}

                  {/* Botón Ver Resultados */}
                  {quiz.entregada && (
                    <button
                      onClick={() => handleVisualizarResultados(quiz.id)}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center"
                    >
                      <Trophy className="w-4 h-4 mr-2" />
                      Ver Resultados
                    </button>
                  )}

                  {/* Estado no disponible */}
                  {!isQuizAvailable(quiz) && !quiz.entregada && (
                    <div className="w-full px-4 py-3 bg-gray-100 text-gray-600 rounded-lg text-center font-medium">
                      {!isWithinDeadline(quiz.fechaEntrega) ? 'Evaluación Vencida' : 'No Disponible'}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay evaluaciones disponibles
              </h3>
              <p className="text-gray-600">
                {selectedMonth !== 'all' 
                  ? `No se encontraron evaluaciones para ${getSelectedMonthName()}.`
                  : 'No hay evaluaciones disponibles en este momento.'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Overlay para cerrar dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );

  // Modales mejorados (inspirados en Feedback_Alumno_Comp)
  const renderUploadModal = () => (
    showUploadModal && selectedActividad && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedActividad.entregada ? `Reintentar Actividad - Intento #${selectedActividad.totalIntentos + 1}` : 'Subir Actividad'}
            </h2>
          </div>
          
          <div className="px-6 py-4">
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Actividad:</span> {selectedActividad.nombre}
            </p>

            {selectedActividad.entregada && selectedActividad.mejorPuntaje && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Tu mejor puntaje:</span> {selectedActividad.mejorPuntaje}%
                </p>
                <p className="text-sm text-blue-700">
                  Intentos previos: {selectedActividad.totalIntentos}
                </p>
              </div>
            )}

            {selectedActividad.entregada ? (
              <>
                <p className="text-sm text-gray-600 mb-6">
                  Puedes subir una nueva versión para intentar mejorar tu puntaje. Los intentos anteriores se mantendrán en el historial.
                </p>
                <label className="block w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer text-center">
                  Subir Nuevo Intento
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(selectedActividad.id, e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-4">Por favor, sube tu actividad en formato PDF.</p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(selectedActividad.id, e.target.files[0]);
                    }
                  }}
                  className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-4"
                />
              </>
            )}
          </div>
          
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={closeModals}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 text-sm font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    )
  );

  const renderViewModal = () => (
    showViewModal && selectedActividad && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Visualizar Actividad</h2>
          </div>
          
          <div className="px-6 py-4 flex-1">
            <p className="text-sm text-gray-600 mb-4">
              <span className="font-medium">Actividad:</span> {selectedActividad.nombre}
            </p>
            
            {viewingActivityFile ? (
              <>
                {isMobile ? (
                  <div className="h-40 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center mb-4">
                    <span className="text-gray-500 text-center text-sm px-4">Vista previa no soportada en móvil. Usa el botón para abrir en una nueva pestaña.</span>
                  </div>
                ) : (
                  <div className="h-96 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden mb-4">
                    <iframe
                      src={viewingActivityFile}
                      title="Visor de actividad"
                      className="w-full h-full"
                    >
                      Este navegador no soporta la visualización de archivos. Puedes descargarlo aquí.
                    </iframe>
                  </div>
                )}
                <p className="text-xs text-gray-500 text-center mb-4">
                  (Simulación: En una aplicación real, aquí se cargaría el archivo subido por el alumno desde el backend.)
                </p>
              </>
            ) : (
              <div className="h-96 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
                <p className="text-gray-500">No hay archivo subido para visualizar.</p>
              </div>
            )}
          </div>
          
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            {viewingActivityFile && (
              <button
                onClick={() => window.open(viewingActivityFile, '_blank')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Ver en nueva pestaña
              </button>
            )}
            <button
              onClick={closeModals}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 text-sm font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    )
  );

  const renderEditModal = () => (
    showEditModal && selectedActividad && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Editar Actividad</h2>
          </div>
          
          <div className="px-6 py-4">
            <p className="text-sm text-gray-600 mb-4">
              <span className="font-medium">Actividad:</span> {selectedActividad.nombre}
            </p>
            <p className="text-sm text-gray-600">
              Esta funcionalidad estará disponible próximamente para editar detalles de la actividad como descripción, fecha límite, etc.
            </p>
          </div>
          
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={closeModals}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 text-sm font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    )
  );

  // Modal para mostrar el historial de intentos de quizzes (idéntico al de simulaciones)
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

          {/* Contenido del modal - Scrollable */}
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
                <div className="text-purple-600 text-sm font-medium">Promedio de Tiempo</div>
                <div className="text-2xl font-bold text-purple-800">
                  {Math.round(historial.promedioTiempo || 0)} min
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
                            <div className="text-sm text-gray-500">
                              {intento.tiempoEmpleado} min
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