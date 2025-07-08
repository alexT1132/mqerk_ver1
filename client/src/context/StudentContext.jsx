import React, { createContext, useContext, useState, useEffect } from 'react';

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
  const [allowedAreas, setAllowedAreas] = useState([]); // Áreas permitidas
  const [areaRequests, setAreaRequests] = useState([]); // Solicitudes de nuevas áreas
  
  // TODO: Datos del estudiante serán proporcionados por el backend
  const [studentData, setStudentData] = useState({
    name: "XXXX", // TODO: Obtener desde backend
    matricula: "XXXX", // TODO: Obtener desde backend
    email: "XXXX" // TODO: Obtener desde backend
  });

  // TODO: Cursos disponibles serán proporcionados por el backend
  // Curso de prueba para testing - ELIMINAR en producción
  const testCourse = {
    id: 'test-course-001',
    title: 'Curso de Prueba - Matemáticas Avanzadas',
    instructor: 'Prof. Testing',
    image: 'https://placehold.co/400x200/4f46e5/ffffff?text=Matematicas',
    category: 'exactas',
    type: 'curso',
    isActive: true,
    metadata: [
      { icon: 'reloj', text: '12 semanas' },
      { icon: 'libro', text: '24 lecciones' },
      { icon: 'estudiante', text: '150 estudiantes' }
    ]
  };
  
  const [availableCourses] = useState([testCourse]);

  // Función para manejar la verificación del estudiante - integración con backend
  const simulateVerification = () => {
    // TODO: Verificar con backend en lugar de solo cambiar estado local
    setIsVerified(true);
    setHasPaid(true);
    setIsFirstAccess(false);
    localStorage.setItem('studentVerified', 'true');
    localStorage.setItem('studentPaid', 'true');
    localStorage.setItem('isFirstAccess', 'false');
  };

  // Función para seleccionar un curso
  const selectCourse = (courseId) => {
    const course = availableCourses.find(c => c.id === courseId);
    if (course) {
      setCurrentCourse(course);
      localStorage.setItem('currentCourse', JSON.stringify(course));
    }
  };

  // Función para deseleccionar el curso (útil para testing)
  const clearCourse = () => {
    setCurrentCourse(null);
    setActiveSection(null); // También limpiar la sección activa
    localStorage.removeItem('currentCourse');
    localStorage.removeItem('activeSection');
  };

  // Función para manejar la navegación activa
  const setActiveSectionHandler = (section) => {
    if (section === null) {
      // Limpiar sección activa
      setActiveSection(null);
      localStorage.removeItem('activeSection');
    } else if (activeSection === section) {
      // Si ya está activa, desactivar (volver al mensaje de bienvenida)
      setActiveSection(null);
      localStorage.removeItem('activeSection');
    } else {
      // Activar nueva sección
      setActiveSection(section);
      localStorage.setItem('activeSection', section);
    }
  };

  // Función para ir al mensaje de bienvenida (desactivar todas las secciones)
  const goToWelcome = () => {
    setActiveSection(null);
    localStorage.removeItem('activeSection');
  };

  // --- Funciones para Manejo de Áreas de Simulación ---

  // Seleccionar el área inicial o añadir una nueva área permitida
  const addAllowedArea = (areaId) => {
    if (!allowedAreas.includes(areaId)) {
      const newAllowedAreas = [...allowedAreas, areaId];
      setAllowedAreas(newAllowedAreas);
      localStorage.setItem('allowedAreas', JSON.stringify(newAllowedAreas));
    }
  };

  // Solicitar acceso a una nueva área
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

    // Cargar áreas permitidas y solicitudes
    const storedAllowedAreas = localStorage.getItem('allowedAreas');
    if (storedAllowedAreas) setAllowedAreas(JSON.parse(storedAllowedAreas));

    const storedAreaRequests = localStorage.getItem('areaRequests');
    if (storedAreaRequests) setAreaRequests(JSON.parse(storedAreaRequests));

  }, []);

  // Función para resetear el estado (útil para testing)
  const resetStudentState = () => {
    setIsVerified(false);
    setHasPaid(false);
    setCurrentCourse(null);
    setIsFirstAccess(true);
    setActiveSection(null); // Resetear sección activa
    // Limpiar TODO el localStorage relacionado con el estudiante
    localStorage.removeItem('studentVerified');
    localStorage.removeItem('studentPaid');
    localStorage.removeItem('isFirstAccess');
    localStorage.removeItem('currentCourse');
    localStorage.removeItem('activeSection');
    // También limpiar las áreas
    clearAreas();
    // Forzar una recarga del estado
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

  const value = {
    isVerified,
    hasPaid,
    studentData,
    availableCourses,
    currentCourse,
    isFirstAccess,
    activeSection,
    allowedAreas, // Exponer áreas permitidas
    areaRequests, // Exponer solicitudes
    simulateVerification,
    selectCourse,
    clearCourse,
    setActiveSectionHandler,
    goToWelcome,
    resetStudentState,
    addAllowedArea, // Exponer función para añadir área
    requestNewAreaAccess, // Exponer función para solicitar área
  };

  return (
    <StudentContext.Provider value={value}>
      {children}
    </StudentContext.Provider>
  );
};
