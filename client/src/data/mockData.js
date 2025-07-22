// ============================================================================
// DATOS MOCK PARA DESARROLLO
// ============================================================================
// IMPORTANTE: Este archivo debe ser ELIMINADO cuando se conecte el backend real
// Todos los datos aquí son simulados para desarrollo y testing
// ============================================================================

/**
 * Datos mock del administrador
 * TODO: ELIMINAR cuando se conecte el backend
 */
export const MOCK_ADMIN_DATA = {
  id: 1,
  name: "Carlos Mendoza",
  email: "carlos.mendoza@mqerk.academy",
  role: "Administrador Principal",
  avatar: null,
  phone: "+52 555 123 4567",
  department: "Administración General",
  lastLogin: new Date('2025-07-09T08:30:00'),
  permissions: [
    "VIEW_DASHBOARD",
    "MANAGE_USERS",
    "MANAGE_COURSES",
    "MANAGE_PAYMENTS",
    "VIEW_REPORTS",
    "SYSTEM_CONFIG"
  ],
  preferences: {
    language: "es",
    timezone: "America/Mexico_City",
    theme: "light",
    notifications: {
      email: true,
      push: true,
      sms: false
    }
  }
};

/**
 * Datos mock del estado del sistema
 * TODO: ELIMINAR cuando se conecte el backend
 */
export const MOCK_SYSTEM_STATUS = {
  isOnline: true,
  lastUpdate: new Date(),
  version: "2.1.3",
  uptime: "15 días, 8 horas",
  
  // Métricas del sistema
  metrics: {
    activeUsers: 145,
    totalCourses: 23,
    pendingPayments: 8,
    totalStudents: 1205,
    totalRevenue: 125000,
    systemLoad: 0.65,
    memoryUsage: 0.72,
    diskUsage: 0.45
  },
  
  // Estado de servicios
  services: {
    database: { status: "online", responseTime: 12 },
    apiServer: { status: "online", responseTime: 8 },
    paymentGateway: { status: "online", responseTime: 45 },
    emailService: { status: "online", responseTime: 150 },
    fileStorage: { status: "online", responseTime: 25 }
  },
  
  // Alertas del sistema
  alerts: [
    {
      id: 1,
      type: "info",
      message: "Mantenimiento programado para el 15 de julio a las 2:00 AM",
      timestamp: new Date('2025-07-08T10:00:00'),
      acknowledged: false
    }
  ]
};

/**
 * Datos mock de citas educativas
 * TODO: ELIMINAR cuando se conecte el backend
 */
export const MOCK_EDUCATIONAL_QUOTES = [
  { 
    id: 1,
    quote: "La educación es el arma más poderosa que puedes usar para cambiar el mundo", 
    author: "Nelson Mandela",
    category: "inspirational",
    isActive: true,
    createdAt: new Date('2025-01-01')
  },
  { 
    id: 2,
    quote: "El objetivo de la educación es la virtud y el deseo de convertirse en un buen ciudadano", 
    author: "Platón",
    category: "philosophy",
    isActive: true,
    createdAt: new Date('2025-01-02')
  },
  { 
    id: 3,
    quote: "La educación no es preparación para la vida; la educación es la vida en sí misma", 
    author: "John Dewey",
    category: "philosophy",
    isActive: true,
    createdAt: new Date('2025-01-03')
  },
  { 
    id: 4,
    quote: "Enseñar es aprender dos veces", 
    author: "Joseph Joubert",
    category: "teaching",
    isActive: true,
    createdAt: new Date('2025-01-04')
  },
  { 
    id: 5,
    quote: "La educación es el pasaporte hacia el futuro, el mañana pertenece a aquellos que se preparan para él en el día de hoy", 
    author: "Malcolm X",
    category: "motivational",
    isActive: true,
    createdAt: new Date('2025-01-05')
  },
  { 
    id: 6,
    quote: "El aprendizaje nunca agota la mente", 
    author: "Leonardo da Vinci",
    category: "learning",
    isActive: true,
    createdAt: new Date('2025-01-06')
  },
  { 
    id: 7,
    quote: "La educación es la llave dorada que abre la puerta de la libertad", 
    author: "George Washington Carver",
    category: "freedom",
    isActive: true,
    createdAt: new Date('2025-01-07')
  },
  { 
    id: 8,
    quote: "Lo que esculpe al ser humano es su capacidad de aprender", 
    author: "Anónimo",
    category: "learning",
    isActive: true,
    createdAt: new Date('2025-01-08')
  },
  { 
    id: 9,
    quote: "La inversión en conocimiento paga el mejor interés", 
    author: "Benjamin Franklin",
    category: "investment",
    isActive: true,
    createdAt: new Date('2025-01-09')
  },
  { 
    id: 10,
    quote: "Educar no es llenar un recipiente, sino encender una hoguera", 
    author: "William Butler Yeats",
    category: "teaching",
    isActive: true,
    createdAt: new Date('2025-01-10')
  },
  { 
    id: 11,
    quote: "El conocimiento es poder", 
    author: "Francis Bacon",
    category: "knowledge",
    isActive: true,
    createdAt: new Date('2025-01-11')
  },
  { 
    id: 12,
    quote: "La educación es el desarrollo en el hombre de toda la perfección de que su naturaleza es capaz", 
    author: "Immanuel Kant",
    category: "philosophy",
    isActive: true,
    createdAt: new Date('2025-01-12')
  },
  { 
    id: 13,
    quote: "No hay nada más poderoso que una mente educada", 
    author: "Anónimo",
    category: "empowerment",
    isActive: true,
    createdAt: new Date('2025-01-13')
  },
  { 
    id: 14,
    quote: "La educación es la base sobre la cual construimos nuestro futuro", 
    author: "Christine Gregoire",
    category: "future",
    isActive: true,
    createdAt: new Date('2025-01-14')
  },
  { 
    id: 15,
    quote: "Un maestro afecta la eternidad; nunca puede decir dónde termina su influencia", 
    author: "Henry Adams",
    category: "teaching",
    isActive: true,
    createdAt: new Date('2025-01-15')
  },
  { 
    id: 16,
    quote: "La educación es el gran igualador de las condiciones del hombre", 
    author: "Horace Mann",
    category: "equality",
    isActive: true,
    createdAt: new Date('2025-01-16')
  },
  { 
    id: 17,
    quote: "Aprender sin pensar es inútil. Pensar sin aprender, peligroso", 
    author: "Confucio",
    category: "wisdom",
    isActive: true,
    createdAt: new Date('2025-01-17')
  },
  { 
    id: 18,
    quote: "La sabiduría no es producto de la escolarización, sino de un intento a lo largo de toda la vida de adquirirla", 
    author: "Albert Einstein",
    category: "wisdom",
    isActive: true,
    createdAt: new Date('2025-01-18')
  },
  { 
    id: 19,
    quote: "La educación es el movimiento de la oscuridad a la luz", 
    author: "Allan Bloom",
    category: "enlightenment",
    isActive: true,
    createdAt: new Date('2025-01-19')
  },
  { 
    id: 20,
    quote: "El propósito de la educación es reemplazar una mente vacía con una abierta", 
    author: "Malcolm Forbes",
    category: "purpose",
    isActive: true,
    createdAt: new Date('2025-01-20')
  }
];

/**
 * Datos mock de notificaciones del administrador
 * TODO: ELIMINAR cuando se conecte el backend
 */
export const MOCK_ADMIN_NOTIFICATIONS = [
  {
    id: 1,
    type: "payment",
    title: "Nuevo pago pendiente de validación",
    message: "El estudiante Juan Pérez ha realizado un pago que requiere validación.",
    isRead: false,
    priority: "high",
    timestamp: new Date('2025-07-09T08:15:00'),
    actionUrl: "/admin/payments/pending"
  },
  {
    id: 2,
    type: "system",
    title: "Actualización del sistema completada",
    message: "La actualización v2.1.3 se ha instalado correctamente.",
    isRead: false,
    priority: "medium",
    timestamp: new Date('2025-07-09T07:30:00'),
    actionUrl: "/admin/system"
  },
  {
    id: 3,
    type: "user",
    title: "Nuevo estudiante registrado",
    message: "María González se ha registrado en el curso de Inglés Básico.",
    isRead: true,
    priority: "low",
    timestamp: new Date('2025-07-08T16:45:00'),
    actionUrl: "/admin/students"
  },
  {
    id: 4,
    type: "course",
    title: "Curso completado",
    message: "El estudiante Pedro Ramírez ha completado el curso de Matemáticas Avanzadas.",
    isRead: true,
    priority: "medium",
    timestamp: new Date('2025-07-08T14:20:00'),
    actionUrl: "/admin/courses"
  }
];

/**
 * Configuración mock de la aplicación
 * TODO: ELIMINAR cuando se conecte el backend
 */
export const MOCK_APP_CONFIG = {
  appName: "MQerK Academy",
  version: "2.1.3",
  environment: "development",
  
  // URLs de la aplicación
  urls: {
    frontend: "http://localhost:3000",
    backend: "http://localhost:3001",
    cdn: "https://cdn.mqerk.academy"
  },
  
  // Configuración de features
  features: {
    payments: true,
    notifications: true,
    reports: true,
    analytics: true,
    multilanguage: false
  },
  
  // Límites del sistema
  limits: {
    maxStudentsPerCourse: 100,
    maxFileSize: 10485760, // 10MB
    maxNotifications: 50,
    sessionTimeout: 3600000 // 1 hora
  }
};

// ============================================================================
// FUNCIONES HELPER PARA DATOS MOCK
// ============================================================================

/**
 * Simula delay de red para hacer el mock más realista
 * @param {number} ms - Milisegundos de delay
 */
export const simulateNetworkDelay = (ms = 500) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Simula errores aleatorios para testing
 * @param {number} errorRate - Probabilidad de error (0-1)
 */
export const simulateRandomError = (errorRate = 0.1) => {
  if (Math.random() < errorRate) {
    throw new Error('Error simulado para testing');
  }
};

/**
 * Obtiene una cita aleatoria para el día actual
 * @returns {Object} Cita del día
 */
export const getTodaysQuote = () => {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const quoteIndex = dayOfYear % MOCK_EDUCATIONAL_QUOTES.length;
  return MOCK_EDUCATIONAL_QUOTES[quoteIndex];
};

// ============================================================================
// DATOS MOCK PARA SIMULACIONES
// ============================================================================
// TODO: ELIMINAR cuando se conecte el backend de simulaciones

/**
 * Módulos específicos disponibles con las 5 materias más esenciales
 */
export const MOCK_MODULOS_ESPECIFICOS = [
  {
    id: 1,
    titulo: "Ciencias Exactas",
    color: "from-blue-500 to-cyan-600",
    icono: "BarChart3",
    descripcion: "Matemáticas, Física, Química y disciplinas afines",
    bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
    borderColor: "border-blue-200",
    materias: [
      "Cálculo",
      "Geometría Analítica",
      "Probabilidad y Estadística",
      "Razonamiento Matemático"
    ]
  },
  {
    id: 2,
    titulo: "Ciencias Sociales",
    color: "from-purple-500 to-indigo-600",
    icono: "Users",
    descripcion: "Sociología, Psicología, Antropología y áreas relacionadas",
    bgColor: "bg-gradient-to-br from-purple-50 to-indigo-50",
    borderColor: "border-purple-200",
    materias: [
      "Historia",
      "Lectura Crítica",
      "Lógica",
      "Ciencias Sociales",
      "Cultura General"
    ]
  },
  {
    id: 3,
    titulo: "Humanidades y Artes",
    color: "from-rose-500 to-pink-600",
    icono: "BookOpen",
    descripcion: "Literatura, Historia, Filosofía y expresiones artísticas",
    bgColor: "bg-gradient-to-br from-rose-50 to-pink-50",
    borderColor: "border-rose-200",
    materias: [
      "Literatura",
      "Filosofía",
      "Historia del Arte",
      "Redacción",
      "Comprensión Lectora"
    ]
  },
  {
    id: 4,
    titulo: "Ciencias Naturales y de la Salud",
    color: "from-emerald-500 to-green-600",
    icono: "Heart",
    descripcion: "Biología, Medicina, Enfermería y ciencias de la vida",
    bgColor: "bg-gradient-to-br from-emerald-50 to-green-50",
    borderColor: "border-emerald-200",
    materias: [
      "Biología Celular y Molecular",
      "Química General y Orgánica",
      "Anatomía",
      "Física"
    ]
  },
  {
    id: 5,
    titulo: "Ingeniería y Tecnología",
    color: "from-orange-500 to-amber-600",
    icono: "Cog",
    descripcion: "Ingenierías, Tecnología, Sistemas y áreas técnicas",
    bgColor: "bg-gradient-to-br from-orange-50 to-amber-50",
    borderColor: "border-orange-200",
    materias: [
      "Cálculo",
      "Trigonometría",
      "Física",
      "Química",
      "Programación"
    ]
  },
  {
    id: 6,
    titulo: "Ciencias Económico-Administrativas",
    color: "from-teal-500 to-cyan-600",
    icono: "TrendingUp",
    descripcion: "Administración, Economía, Contaduría y Negocios",
    bgColor: "bg-gradient-to-br from-teal-50 to-cyan-50",
    borderColor: "border-teal-200",
    materias: [
      "Matemáticas Financieras",
      "Estadística",
      "Economía",
      "Lógica"
    ]
  },
  {
    id: 7,
    titulo: "Educación y Deportes",
    color: "from-violet-500 to-purple-600",
    icono: "GraduationCap",
    descripcion: "Pedagogía, Educación Física y ciencias del deporte",
    bgColor: "bg-gradient-to-br from-violet-50 to-purple-50",
    borderColor: "border-violet-200",
    materias: [
      "Psicología Educativa",
      "Biología Humana",
      "Ética",
      "Sociología",
      "Fundamentos Educativos"
    ]
  },
  {
    id: 8,
    titulo: "Agropecuarias",
    color: "from-lime-500 to-green-600",
    icono: "Leaf",
    descripcion: "Agronomía, Veterinaria, Zootecnia y ciencias agropecuarias",
    bgColor: "bg-gradient-to-br from-lime-50 to-green-50",
    borderColor: "border-lime-200",
    materias: [
      "Biología Animal y Vegetal",
      "Química",
      "Ciencias de la Tierra",
      "Estadística"
    ]
  },
  {
    id: 9,
    titulo: "Turismo",
    color: "from-blue-400 to-sky-600",
    icono: "Globe",
    descripcion: "Gestión turística, hotelería y servicios de viajes",
    bgColor: "bg-gradient-to-br from-blue-50 to-sky-50",
    borderColor: "border-blue-200",
    materias: [
      "Administración de Servicios",
      "Cultura Turística",
      "Economía",
      "Atención al Cliente"
    ]
  },
  {
    id: 10,
    titulo: "Núcleo UNAM / IPN",
    color: "from-yellow-500 to-amber-600",
    icono: "School",
    descripcion: "Materias esenciales para exámenes de admisión UNAM e IPN",
    bgColor: "bg-gradient-to-br from-yellow-50 to-amber-50",
    borderColor: "border-yellow-200",
    materias: [
      "Biología",
      "Geografía",
      "Historia Universal",
      "Historia de México",
      "Literatura",
      "Filosofía"
    ]
  },
  {
    id: 11,
    titulo: "Militar, Naval y Náutica Mercante",
    color: "from-slate-500 to-gray-600",
    icono: "Anchor",
    descripcion: "Preparación para instituciones militares, navales y marinas mercantes",
    bgColor: "bg-gradient-to-br from-slate-50 to-gray-50",
    borderColor: "border-slate-200",
    materias: [
      "Matemáticas",
      "Física",
      "Química",
      "Geografía",
      "Historia de México",
      "Razonamiento lógico"
    ]
  },
  {
    id: 12,
    titulo: "Módulo Transversal: Análisis Psicométrico",
    color: "from-purple-400 to-indigo-500",
    icono: "Brain",
    descripcion: "Preparación para exámenes psicométricos y evaluaciones de aptitud",
    bgColor: "bg-gradient-to-br from-purple-50 to-indigo-50",
    borderColor: "border-purple-200",
    materias: [
      "Razonamiento abstracto",
      "Secuencias lógicas",
      "Habilidad espacial",
      "Atención y memoria",
      "Test de matrices",
      "Aptitud verbal y numérica",
      "Pruebas de personalidad simuladas"
    ]
  }
];

/**
 * Simulaciones generales disponibles
 */
export const MOCK_SIMULACIONES_GENERALES = [
  {
    id: 1,
    nombre: "Simulador EXANI II - Completo",
    descripcion: "Examen Nacional de Ingreso a la Educación Superior",
    fechaEntrega: "2025-08-15",
    completado: true,
    fechaCompletado: "2025-07-06",
    score: 95,
    maxScore: 100,
    intentos: 1,
    maxIntentos: 3,
    tiempoLimite: "180 minutos",
    estado: "completado",
    tipo: "generales",
    categoria: "Ingreso Universitario",
    dificultad: "Alto"
  },
  {
    id: 2,
    nombre: "Pruebas Académicas Generales",
    descripcion: "Evaluación integral de conocimientos básicos",
    fechaEntrega: "2025-08-20",
    completado: false,
    fechaCompletado: null,
    score: null,
    maxScore: 100,
    intentos: 0,
    maxIntentos: 2,
    tiempoLimite: "120 minutos",
    estado: "disponible",
    tipo: "generales",
    categoria: "Evaluación General",
    dificultad: "Medio"
  },
  {
    id: 3,
    nombre: "Simulador PAA - Aptitud Académica",
    descripcion: "Prueba de Aptitud Académica",
    fechaEntrega: "2025-09-01",
    completado: false,
    fechaCompletado: null,
    score: null,
    maxScore: 100,
    intentos: 0,
    maxIntentos: 3,
    tiempoLimite: "150 minutos",
    estado: "disponible",
    tipo: "generales",
    categoria: "Aptitud Académica",
    dificultad: "Alto"
  },
  {
    id: 4,
    nombre: "Simulador CENEVAL EXANI II",
    descripcion: "Simulación oficial del examen CENEVAL",
    fechaEntrega: "2025-07-25",
    completado: true,
    fechaCompletado: "2025-07-20",
    score: 88,
    maxScore: 100,
    intentos: 2,
    maxIntentos: 3,
    tiempoLimite: "200 minutos",
    estado: "completado",
    tipo: "generales",
    categoria: "CENEVAL",
    dificultad: "Alto"
  }
];

/**
 * Simulaciones específicas por módulo
 */
export const MOCK_SIMULACIONES_ESPECIFICAS = [
  {
    id: 5,
    nombre: "Simulador Medicina UNAM",
    descripcion: "Examen específico para carrera de Medicina",
    fechaEntrega: "2025-08-10",
    completado: false,
    fechaCompletado: null,
    score: null,
    maxScore: 100,
    intentos: 0,
    maxIntentos: 2,
    tiempoLimite: "240 minutos",
    estado: "disponible",
    tipo: "especificos",
    moduloId: 4, // Ciencias Naturales y de la Salud
    categoria: "Medicina",
    dificultad: "Alto"
  },
  {
    id: 6,
    nombre: "Simulador Ingeniería IPN",
    descripcion: "Examen para carreras de Ingeniería",
    fechaEntrega: "2025-08-25",
    completado: true,
    fechaCompletado: "2025-07-05",
    score: 85,
    maxScore: 100,
    intentos: 1,
    maxIntentos: 3,
    tiempoLimite: "180 minutos",
    estado: "completado",
    tipo: "especificos",
    moduloId: 5, // Ingeniería y Tecnología
    categoria: "Ingeniería",
    dificultad: "Alto"
  },
  {
    id: 7,
    nombre: "Simulador Ciencias Exactas",
    descripcion: "Matemáticas, Física y Química avanzadas",
    fechaEntrega: "2025-09-15",
    completado: false,
    fechaCompletado: null,
    score: null,
    maxScore: 100,
    intentos: 0,
    maxIntentos: 2,
    tiempoLimite: "200 minutos",
    estado: "disponible",
    tipo: "especificos",
    moduloId: 1, // Ciencias Exactas
    categoria: "Ciencias Exactas",
    dificultad: "Alto"
  },
  {
    id: 8,
    nombre: "Simulador Psicología UAM",
    descripcion: "Examen específico para Psicología",
    fechaEntrega: "2025-08-30",
    completado: false,
    fechaCompletado: null,
    score: null,
    maxScore: 100,
    intentos: 0,
    maxIntentos: 2,
    tiempoLimite: "160 minutos",
    estado: "disponible",
    tipo: "especificos",
    moduloId: 2, // Ciencias Sociales
    categoria: "Psicología",
    dificultad: "Medio"
  },
  {
    id: 9,
    nombre: "Simulador Humanidades UNAM",
    descripcion: "Letras, Filosofía y áreas humanísticas",
    fechaEntrega: "2025-09-05",
    completado: true,
    fechaCompletado: "2025-07-15",
    score: 92,
    maxScore: 100,
    intentos: 1,
    maxIntentos: 2,
    tiempoLimite: "140 minutos",
    estado: "completado",
    tipo: "especificos",
    moduloId: 3, // Humanidades y Artes
    categoria: "Humanidades",
    dificultad: "Medio"
  }
];

// ============================================================================
// EXPORT POR DEFECTO
// ============================================================================

export default {
  admin: MOCK_ADMIN_DATA,
  systemStatus: MOCK_SYSTEM_STATUS,
  quotes: MOCK_EDUCATIONAL_QUOTES,
  notifications: MOCK_ADMIN_NOTIFICATIONS,
  config: MOCK_APP_CONFIG,
  
  // Datos de simulaciones
  modulosEspecificos: MOCK_MODULOS_ESPECIFICOS,
  simulacionesGenerales: MOCK_SIMULACIONES_GENERALES,
  simulacionesEspecificas: MOCK_SIMULACIONES_ESPECIFICAS,
  
  // Helpers
  simulateNetworkDelay,
  simulateRandomError,
  getTodaysQuote
};
