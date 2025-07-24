import { createContext, useContext, useState, useEffect } from 'react';

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
  const [activeSection, setActiveSection] = useState(null); // Nueva: controla qué sección está activa
  const [studentData, setStudentData] = useState({
    name: "Joss Luis Rodríguez Márquez",
    matricula: "ISC20-001",
    email: "jose.rodriguez@example.com"
  });

  // Cursos disponibles del estudiante
  const [availableCourses] = useState([
    {
      id: 'math-advanced',
      title: 'Matemáticas Avanzadas',
      instructor: 'Dr. María González',
      image: '/assets/math-course.jpg',
      category: 'exactas',
      type: 'curso',
      metadata: [
        { icon: 'reloj', text: '12 semanas' },
        { icon: 'libro', text: '24 lecciones' },
        { icon: 'estudiante', text: '180 estudiantes' }
      ],
      progress: 65,
      isActive: true
    },
    {
      id: 'web-programming',
      title: 'Programación Web',
      instructor: 'Ing. Carlos Pérez',
      image: '/assets/web-course.jpg',
      category: 'programacion',
      type: 'desarrollo',
      metadata: [
        { icon: 'reloj', text: '16 semanas' },
        { icon: 'libro', text: '32 lecciones' },
        { icon: 'estudiante', text: '220 estudiantes' }
      ],
      progress: 40,
      isActive: true
    },
    {
      id: 'english-intermediate',
      title: 'Inglés Intermedio',
      instructor: 'Prof. Sarah Johnson',
      image: '/assets/english-course.jpg',
      category: 'idiomas',
      type: 'curso',
      metadata: [
        { icon: 'reloj', text: '20 semanas' },
        { icon: 'libro', text: '40 lecciones' },
        { icon: 'estudiante', text: '150 estudiantes' }
      ],
      progress: 80,
      isActive: true
    }
  ]);

  // Función para simular la verificación del estudiante
  const simulateVerification = () => {
    setIsVerified(true);
    setHasPaid(true);
    setIsFirstAccess(false); // Ya no es primer acceso después de verificar
    // Guardar en localStorage para persistir el estado
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
    console.log('Estado del estudiante reseteado completamente');
    // Forzar una recarga del estado
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  // Función para forzar reseteo completo (eliminar TODO el localStorage)
  const forceCompleteReset = () => {
    localStorage.clear();
    console.log('LocalStorage completamente limpiado');
    window.location.reload();
  };

  // Función para navegar al inicio sin redirección
  const goToStart = () => {
    setIsFirstAccess(true); // Temporalmente marcar como primer acceso
    localStorage.setItem('isFirstAccess', 'true');
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
  }, []);

  const contextValue = {
    // Estados
    isVerified,
    hasPaid,
    currentCourse,
    isFirstAccess,
    studentData,
    availableCourses,
    activeSection, // Nueva sección activa
    
    // Funciones
    simulateVerification,
    selectCourse,
    clearCourse,
    resetStudentState,
    forceCompleteReset,
    goToStart,
    setActiveSectionHandler, // Función para manejar navegación activa
    goToWelcome, // Función para ir al mensaje de bienvenida
    
    // Setters directos (para casos específicos)
    setIsVerified,
    setHasPaid,
    setCurrentCourse,
    setIsFirstAccess,
    setActiveSection // Setter para la sección activa
  };

  return (
    <StudentContext.Provider value={contextValue}>
      {children}
    </StudentContext.Provider>
  );
};