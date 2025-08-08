import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * CONTEXTO PARA DATOS ESPECÍFICOS DEL ESTUDIANTE
 * 
 * Propósito: Manejar toda la información personal y académica del estudiante
 * - Información personal del estudiante
 * - Cursos matriculados/inscritos
 * - Progreso académico
 * - Estado de verificación y pagos
 * - Curso actual en estudio
 * 
 * Responsabilidades:
 * - Datos personales del estudiante
 * - Cursos en los que está inscrito
 * - Progreso y calificaciones
 * - Estado de pagos y verificación
 * - Curso actualmente seleccionado
 * - Áreas de simulación permitidas
 * 
 * NO es responsable de:
 * - Catálogo general de cursos (usar CourseContext)
 * - Información de cursos no matriculados (usar CourseContext)
 */

// Context para manejar el estado del estudiante
const StudentContext = createContext();

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
};

export const StudentProvider = ({ children }) => {
  // Estados principales del estudiante
  const [isVerified, setIsVerified] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [isFirstAccess, setIsFirstAccess] = useState(true);
  const [activeSection, setActiveSection] = useState(null);
  // Estados separados para Simulaciones y Actividades
  const [allowedSimulationAreas, setAllowedSimulationAreas] = useState([]); // Áreas permitidas para simulaciones (inicialmente vacío para selección inicial)
  const [simulationRequests, setSimulationRequests] = useState([]); // Solicitudes de nuevas áreas para simulaciones
  const [allowedActivityAreas, setAllowedActivityAreas] = useState([]); // Áreas permitidas para actividades (inicialmente vacío para selección inicial)
  const [activityRequests, setActivityRequests] = useState([]); // Solicitudes de nuevas áreas para actividades
  
  // Estados legacy para compatibilidad (deprecated - se mantendrán temporalmente)
  const [allowedAreas, setAllowedAreas] = useState([]); // Áreas permitidas (legacy)
  const [areaRequests, setAreaRequests] = useState([]); // Solicitudes de nuevas áreas (legacy)
  const [hasContentAccess, setHasContentAccess] = useState(true); // NUEVO: Control de acceso al contenido
  const [overdueDays, setOverdueDays] = useState(0); // NUEVO: Días de retraso en pagos
  
  // TODO: BACKEND - Datos del estudiante serán proporcionados por el endpoint del perfil
  // Estructura esperada: GET /api/students/profile
  const [studentData, setStudentData] = useState({
    name: "XXXX", // TODO: Obtener desde backend
    matricula: "XXXX", // TODO: Obtener desde backend
    email: "XXXX" // TODO: Obtener desde backend
  });

  // TODO: BACKEND - Cursos matriculados/inscritos del estudiante específico
  // Estructura esperada: GET /api/students/{id}/enrolled-courses
  // {
  //   enrolledCourses: [
  //     {
  //       id: string,
  //       title: string,
  //       instructor: string,
  //       image: string,
  //       category: string,
  //       type: string,
  //       isActive: boolean,
  //       enrollmentDate: string,
  //       progress: number, // 0-100
  //       lastAccessed: string,
  //       status: 'active' | 'completed' | 'paused',
  //       metadata: Array<{ icon: string, text: string }>
  //     }
  //   ],
  //   currentCourseId: string
  // }

  // Mock data para testing - ELIMINAR cuando se conecte al backend
  const mockEnrolledCourses = [
    {
      id: 'enrolled-1',
      title: 'Mi Curso de Inglés',
      instructor: 'Prof. María González',
      image: 'https://placehold.co/400x250/4f46e5/ffffff?text=Mi+Inglés',
      category: 'idiomas',
      type: 'curso',
      isActive: true,
      enrollmentDate: '2024-01-15',
      progress: 65,
      lastAccessed: '2024-01-20',
      status: 'active',
      metadata: [
        { icon: 'reloj', text: '6 meses de duración' },
        { icon: 'libro', text: '48 lecciones interactivas' },
        { icon: 'estudiante', text: 'Progreso: 65%' }
      ]
    },
    {
      id: 'enrolled-2',
      title: 'Matemáticas que Estoy Cursando',
      instructor: 'Dr. Ana López',
      image: 'https://placehold.co/400x250/059669/ffffff?text=Mis+Matemáticas',
      category: 'exactas',
      type: 'curso',
      isActive: true,
      enrollmentDate: '2024-01-10',
      progress: 40,
      lastAccessed: '2024-01-19',
      status: 'active',
      metadata: [
        { icon: 'reloj', text: '4 meses intensivos' },
        { icon: 'libro', text: '85 ejercicios prácticos' },
        { icon: 'estudiante', text: 'Progreso: 40%' }
      ]
    }
  ];

  const [enrolledCourses, setEnrolledCourses] = useState(mockEnrolledCourses);

  // TODO: BACKEND - Función para cargar cursos matriculados desde API
  const loadEnrolledCourses = async () => {
    try {
      // TODO: Implementar llamada al backend
      // const response = await fetch(`/api/students/${studentData.id}/enrolled-courses`, {
      //   method: 'GET',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
      //     'Content-Type': 'application/json'
      //   }
      // });
      // const data = await response.json();
      // setEnrolledCourses(data.enrolledCourses);
      // if (data.currentCourseId) {
      //   const currentCourse = data.enrolledCourses.find(c => c.id === data.currentCourseId);
      //   setCurrentCourse(currentCourse);
      // }
      
      // Mock para testing - eliminar cuando se implemente backend
      console.log('Cargando cursos matriculados del estudiante...');
    } catch (error) {
      console.error('Error al cargar cursos matriculados:', error);
    }
  };

  // Función para manejar la verificación del estudiante - integración con backend
  const simulateVerification = () => {
    console.log('✅ Simulando verificación del estudiante...');
    
    // TODO: Verificar con backend en lugar de solo cambiar estado local
    setIsVerified(true);
    setHasPaid(true);
    setIsFirstAccess(false);
    
    // Persistir en localStorage
    localStorage.setItem('studentVerified', 'true');
    localStorage.setItem('studentPaid', 'true');
    localStorage.setItem('isFirstAccess', 'false');
    
    console.log('✅ Verificación simulada completada');
  };

  // Función para seleccionar un curso de los matriculados
  const selectCourse = (courseId) => {
    const course = enrolledCourses.find(c => c.id === courseId);
    if (course) {
      setCurrentCourse(course);
      setIsFirstAccess(false); // ✅ IMPORTANTE: Marcar que ya no es primer acceso
      localStorage.setItem('currentCourse', JSON.stringify(course));
      localStorage.setItem('isFirstAccess', 'false'); // ✅ Persistir en localStorage
      
      console.log('✅ Curso seleccionado:', course.title);
      
      // TODO: BACKEND - Actualizar el curso actual en el backend
      // updateCurrentCourseOnBackend(courseId);
    }
  };

  // TODO: BACKEND - Función para actualizar el curso actual en el backend
  const updateCurrentCourseOnBackend = async (courseId) => {
    try {
      // TODO: Implementar llamada al backend
      // await fetch(`/api/students/${studentData.id}/current-course`, {
      //   method: 'PUT',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ courseId })
      // });
      
      console.log(`Actualizando curso actual a: ${courseId}`);
    } catch (error) {
      console.error('Error al actualizar curso actual:', error);
    }
  };

  // Función para deseleccionar el curso (útil para testing)
  const clearCourse = () => {
    setCurrentCourse(null);
    setActiveSection(null); // También limpiar la sección activa
    localStorage.removeItem('currentCourse');
    localStorage.removeItem('activeSection');
  };

  // TODO: BACKEND - Función para inscribirse a un nuevo curso
  const enrollInCourse = async (courseId) => {
    try {
      // TODO: Implementar llamada al backend
      // const response = await fetch(`/api/students/${studentData.id}/enroll`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ courseId })
      // });
      // const newCourse = await response.json();
      // setEnrolledCourses(prev => [...prev, newCourse]);
      
      console.log(`Inscribiéndose al curso: ${courseId}`);
    } catch (error) {
      console.error('Error al inscribirse al curso:', error);
    }
  };

  // TODO: BACKEND - Función para actualizar progreso del curso
  const updateCourseProgress = async (courseId, progress) => {
    try {
      // TODO: Implementar llamada al backend
      // await fetch(`/api/students/${studentData.id}/courses/${courseId}/progress`, {
      //   method: 'PUT',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ progress })
      // });
      
      // Actualizar el progreso localmente
      setEnrolledCourses(prev => 
        prev.map(course => 
          course.id === courseId 
            ? { ...course, progress, lastAccessed: new Date().toISOString() }
            : course
        )
      );
      
      console.log(`Actualizando progreso del curso ${courseId} a ${progress}%`);
    } catch (error) {
      console.error('Error al actualizar progreso:', error);
    }
  };

  // Función para manejar la navegación activa
  const setActiveSectionHandler = (section) => {
    if (section === null) {
      // Limpiar sección activa
      setActiveSection(null);
      localStorage.removeItem('activeSection');
    } else if (activeSection === section) {
      // Si ya está activa, desacticonst (volver al mensaje de bienvenida)
      setActiveSection(null);
      localStorage.removeItem('activeSection');
    } else {
      // Acticonst nueva sección
      setActiveSection(section);
      localStorage.setItem('activeSection', section);
    }
  };

  // Función para ir al mensaje de bienvenida (desacticonst todas las secciones)
  const goToWelcome = () => {
    setActiveSection(null);
    localStorage.removeItem('activeSection');
  };

  // --- Funciones para Manejo de Áreas de Simulación ---

  // Funciones específicas para SIMULACIONES
  const addAllowedSimulationArea = (areaId) => {
    if (!allowedSimulationAreas.includes(areaId)) {
      const newAllowedAreas = [...allowedSimulationAreas, areaId];
      setAllowedSimulationAreas(newAllowedAreas);
      localStorage.setItem('allowedSimulationAreas', JSON.stringify(newAllowedAreas));
    }
  };

  const requestNewSimulationAreaAccess = (areaId) => {
    // Evitar solicitudes duplicadas
    if (simulationRequests.some(req => req.areaId === areaId)) return;

    // TODO: Enviar solicitud al backend
    console.log(`Enviando solicitud para el área de simulación: ${areaId}`);
    
    const newRequest = { areaId, status: 'pending', date: new Date() };
    const newRequests = [...simulationRequests, newRequest];
    setSimulationRequests(newRequests);
    localStorage.setItem('simulationRequests', JSON.stringify(newRequests));
  };

  // Funciones específicas para ACTIVIDADES
  const addAllowedActivityArea = (areaId) => {
    if (!allowedActivityAreas.includes(areaId)) {
      const newAllowedAreas = [...allowedActivityAreas, areaId];
      setAllowedActivityAreas(newAllowedAreas);
      localStorage.setItem('allowedActivityAreas', JSON.stringify(newAllowedAreas));
    }
  };

  const requestNewActivityAreaAccess = (areaId) => {
    // Evitar solicitudes duplicadas
    if (activityRequests.some(req => req.areaId === areaId)) return;

    // TODO: Enviar solicitud al backend
    console.log(`Enviando solicitud para el área de actividad: ${areaId}`);
    
    const newRequest = { areaId, status: 'pending', date: new Date() };
    const newRequests = [...activityRequests, newRequest];
    setActivityRequests(newRequests);
    localStorage.setItem('activityRequests', JSON.stringify(newRequests));
  };

  // --- Funciones Legacy para compatibilidad ---
  // Seleccionar el área inicial o añadir una nueva área permitida (DEPRECATED)
  const addAllowedArea = (areaId) => {
    if (!allowedAreas.includes(areaId)) {
      const newAllowedAreas = [...allowedAreas, areaId];
      setAllowedAreas(newAllowedAreas);
      localStorage.setItem('allowedAreas', JSON.stringify(newAllowedAreas));
    }
  };

  // Solicitar acceso a una nueva área (DEPRECATED)
  const requestNewAreaAccess = (areaId) => {
    // Evitar solicitudes duplicadas
    if (areaRequests.some(req => req.areaId === areaId)) return;

    // TODO: Enviar solicitud al backend
    console.log(`Enviando solicitud para el área: ${areaId}`);
    
    const newRequest = { areaId, status: 'pending', date: new Date() };
    const newRequests = [...areaRequests, newRequest];
    setAreaRequests(newRequests);
    localStorage.setItem('areaRequests', JSON.stringify(newRequests));
  };

  // Limpiar áreas (para testing)
  const clearAreas = () => {
    // Limpiar simulaciones
    setAllowedSimulationAreas([]);
    setSimulationRequests([]);
    localStorage.removeItem('allowedSimulationAreas');
    localStorage.removeItem('simulationRequests');
    
    // Limpiar actividades
    setAllowedActivityAreas([]);
    setActivityRequests([]);
    localStorage.removeItem('allowedActivityAreas');
    localStorage.removeItem('activityRequests');
    
    // Limpiar legacy
    setAllowedAreas([]);
    setAreaRequests([]);
    localStorage.removeItem('allowedAreas');
    localStorage.removeItem('areaRequests');
  };

  // Cargar estado persistente al inicializar
  useEffect(() => {
    const storedVerified = localStorage.getItem('studentVerified') === 'true';
    const storedPaid = localStorage.getItem('studentPaid') === 'true';
    const storedFirstAccess = localStorage.getItem('isFirstAccess') !== 'false';
    const storedCourse = localStorage.getItem('currentCourse');
    const storedActiveSection = localStorage.getItem('activeSection');

    setIsVerified(storedVerified);
    setHasPaid(storedPaid);
    setIsFirstAccess(storedFirstAccess);
    setActiveSection(storedActiveSection);
    
    if (storedCourse) {
      try {
        const parsedCourse = JSON.parse(storedCourse);
        setCurrentCourse(parsedCourse);
      } catch (error) {
        console.error('Error parsing stored course:', error);
      }
    }

    // Cargar áreas permitidas y solicitudes - NUEVOS ESTADOS SEPARADOS
    const storedAllowedSimulationAreas = localStorage.getItem('allowedSimulationAreas');
    if (storedAllowedSimulationAreas) setAllowedSimulationAreas(JSON.parse(storedAllowedSimulationAreas));

    const storedSimulationRequests = localStorage.getItem('simulationRequests');
    if (storedSimulationRequests) setSimulationRequests(JSON.parse(storedSimulationRequests));

    const storedAllowedActivityAreas = localStorage.getItem('allowedActivityAreas');
    if (storedAllowedActivityAreas) setAllowedActivityAreas(JSON.parse(storedAllowedActivityAreas));

    const storedActivityRequests = localStorage.getItem('activityRequests');
    if (storedActivityRequests) setActivityRequests(JSON.parse(storedActivityRequests));

    // Cargar áreas legacy para compatibilidad
    const storedAllowedAreas = localStorage.getItem('allowedAreas');
    if (storedAllowedAreas) setAllowedAreas(JSON.parse(storedAllowedAreas));

    const storedAreaRequests = localStorage.getItem('areaRequests');
    if (storedAreaRequests) setAreaRequests(JSON.parse(storedAreaRequests));

  }, []);

  // Función para resetear el estado (útil para testing)
  const resetStudentState = () => {
    console.log('🔄 Reseteando estado del estudiante...');
    
    // Resetear todos los estados
    setIsVerified(false);
    setHasPaid(false);
    setCurrentCourse(null);
    setIsFirstAccess(true);
    setActiveSection(null);
    
    // Limpiar TODO el localStorage relacionado con el estudiante
    localStorage.removeItem('studentVerified');
    localStorage.removeItem('studentPaid');
    localStorage.removeItem('isFirstAccess');
    localStorage.removeItem('currentCourse');
    localStorage.removeItem('activeSection');
    
    // También limpiar las áreas
    clearAreas();
    
    console.log('✅ Estado reseteado completamente');
    
    // Forzar una recarga del estado después de un breve delay
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  // Función para forzar reseteo completo (eliminar TODO el localStorage)
  const forceCompleteReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  // Función para navegar al inicio sin redirección
  const goToStart = () => {
    setIsFirstAccess(true); // Temporalmente marcar como primer acceso
    localStorage.setItem('isFirstAccess', 'true');
  };

  // Verificar acceso al contenido basado en pagos vencidos
  const checkContentAccess = () => {
    // Si tiene acceso al contenido, salir
    if (hasContentAccess) return;

    // Calcular días de retraso en pagos
    const today = new Date();
    const dueDate = new Date(localStorage.getItem('nextPaymentDue'));
    const diffTime = Math.abs(today - dueDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    setOverdueDays(diffDays);

    // Si el pago está vencido por más de X días (por ejemplo, 3 días), denegar acceso
    if (diffDays > 3) {
      setHasContentAccess(false);
    } else {
      setHasContentAccess(true);
    }
  };

  // TODO BACKEND: Función para verificar estado de pagos y bloquear contenido
  const checkPaymentStatus = async () => {
    try {
      // TODO: Implementar llamada al backend
      // const response = await fetch(`/api/students/${studentData.id}/payment-status`);
      // const paymentData = await response.json();
      
      // MOCK LOGIC - Reemplazar con datos reales del backend
      const mockOverduePayments = 0; // Número de pagos vencidos
      const mockOverdueDays = 0; // Días de retraso más antiguo
      
      // LÓGICA DE BLOQUEO:
      // - Si hay pagos vencidos por más de 30 días → bloquear acceso
      // - Si hay más de 2 pagos vencidos → bloquear acceso
      const shouldBlockAccess = mockOverduePayments > 2 || mockOverdueDays > 30;
      
      setHasContentAccess(!shouldBlockAccess);
      setOverdueDays(mockOverdueDays);
      
      return {
        hasAccess: !shouldBlockAccess,
        overduePayments: mockOverduePayments,
        overdueDays: mockOverdueDays
      };
    } catch (error) {
      console.error('Error checking payment status:', error);
      return { hasAccess: true, overduePayments: 0, overdueDays: 0 };
    }
  };

  // TODO BACKEND: Función para actualizar estado de pago
  const updatePaymentStatus = (paymentId, status) => {
    // TODO: Implementar actualización local y sincronización con backend
    console.log(`Actualizando pago ${paymentId} a estado: ${status}`);
    
    // Verificar si necesita bloquear/desbloquear acceso
    checkPaymentStatus();
  };

  const value = {
    // Datos del estudiante
    isVerified,
    hasPaid,
    studentData,
    isFirstAccess,
    activeSection,
    hasContentAccess,
    overdueDays,
    
    // Cursos del estudiante (solo los matriculados)
    enrolledCourses,
    currentCourse,
    
    // Áreas de simulación - NUEVOS ESTADOS SEPARADOS
    allowedSimulationAreas,
    simulationRequests,
    allowedActivityAreas,
    activityRequests,
    
    // Áreas legacy (deprecated - se mantendrán temporalmente para compatibilidad)
    allowedAreas,
    areaRequests,
    
    // Funciones de verificación y autenticación
    simulateVerification,
    resetStudentState,
    forceCompleteReset,
    goToStart,
    
    // Funciones de manejo de cursos matriculados
    loadEnrolledCourses,
    selectCourse,
    clearCourse,
    enrollInCourse,
    updateCourseProgress,
    
    // Funciones de navegación
    setActiveSectionHandler,
    goToWelcome,
    
    // Funciones de áreas - NUEVAS FUNCIONES SEPARADAS
    addAllowedSimulationArea,
    requestNewSimulationAreaAccess,
    addAllowedActivityArea,
    requestNewActivityAreaAccess,
    
    // Funciones legacy (deprecated - se mantendrán temporalmente para compatibilidad)
    addAllowedArea,
    requestNewAreaAccess,
    clearAreas,
    
    // Funciones de pagos
    checkPaymentStatus,
    updatePaymentStatus,
  };

  return (
    <StudentContext.Provider value={value}>
      {children}
    </StudentContext.Provider>
  );
};