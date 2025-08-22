import React, { createContext, useContext, useState, useEffect } from 'react';
import eeauImg from '../assets/mqerk/1.png';
import { useAuth } from './AuthContext.jsx';
import { computeOverdueState } from '../utils/payments.js';

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
  const { isAuthenticated, alumno } = useAuth();
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
  const [hasContentAccess, setHasContentAccess] = useState(true); // Acceso al contenido (global)
  const [overdueDays, setOverdueDays] = useState(0); // Días de mora efectivos (más allá de tolerancia)
  
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

  // Reemplazo de mocks: se cargará dinámicamente EEAU desde backend
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  // TODO: BACKEND - Función para cargar cursos matriculados desde API
  const loadEnrolledCourses = async () => {
    const buildCourse = (override = {}) => ({
      id: 'EEAU',
      title: 'Curso EEAU',
      instructor: 'Kelvin Valentin Ramirez',
      image: eeauImg,
         category: 'preparacion',
      type: 'curso',
      isActive: true,
      enrollmentDate: new Date().toISOString().slice(0,10),
      progress: 0,
      lastAccessed: new Date().toISOString(),
      status: 'active',
      metadata: [
        { icon: 'reloj', text: 'Duración: 8 meses' },
        { icon: 'libro', text: 'Lecciones interactivas' },
        { icon: 'estudiante', text: 'Progreso: 0%' }
      ],
      ...override
    });
    try {
      const res = await fetch('/api/eeau', { credentials: 'include' });
      if (!res.ok) {
        console.warn('No se pudo obtener EEAU (status no OK, usando fallback):', res.status);
        const fallback = buildCourse();
        setEnrolledCourses([fallback]);
        return;
      }
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        console.warn('Respuesta /api/eeau no es JSON (content-type=' + ct + '), usando fallback');
        const fallback = buildCourse();
        setEnrolledCourses([fallback]);
        return;
      }
      let json;
      try {
        json = await res.json();
      } catch(parseErr) {
        console.warn('Parse JSON /api/eeau falló, usando fallback:', parseErr);
        const fallback = buildCourse();
        setEnrolledCourses([fallback]);
        return;
      }
      const c = json?.data;
      const courseObj = c ? buildCourse({
        id: c.codigo || 'EEAU',
  title: c.titulo || 'Curso EEAU',
        instructor: c.asesor || 'Kelvin Valentin Ramirez'
      }) : buildCourse();
      setEnrolledCourses([courseObj]); // el usuario debe hacer click para seleccionar
    } catch (error) {
      console.error('Error al cargar curso EEAU (fallback activado):', error);
      const fallback = buildCourse(); // sólo mostrar lista
      setEnrolledCourses([fallback]);
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

  useEffect(() => {
    if (isAuthenticated) {
      loadEnrolledCourses();
    }
  }, [isAuthenticated]);

  // WebSocket robusto (notificaciones + estado verificación) con reconexión exponencial
  const [wsStatus, setWsStatus] = useState('idle'); // idle|connecting|open|closed|error
  const [wsAttempts, setWsAttempts] = useState(0);
  // WebSocket con helper de URL y pre-chequeo de backend
  useEffect(() => {
    if(!isAuthenticated){ return; }
    let ws; let closedManually = false; let reconnectTimer;
    let lastUrl = '';
    async function openSocket(attempt){
      setWsStatus('connecting');
      // Importar dinámicamente para evitar ciclos y facilitar tree-shaking
      const { getWsNotificationsUrl, waitForBackendHealth } = await import('../utils/ws.js');
      const healthy = await waitForBackendHealth(2500);
      if(!healthy){
        console.warn('[WS] Backend no responde health todavía, intentando igualmente abrir WS');
      }
      const url = getWsNotificationsUrl();
      lastUrl = url;
      try {
        ws = new WebSocket(url);
      } catch(err){
        console.error('[WS] Error creando instancia WebSocket', err);
        scheduleReconnect(attempt);
        return;
      }
      ws.onopen = () => { setWsStatus('open'); setWsAttempts(0); };
      ws.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data);
          window.dispatchEvent(new CustomEvent('student-ws-message', { detail: data }));
          if (data.type === 'student_status' && data.payload && typeof data.payload.verificacion !== 'undefined') {
            const v = Number(data.payload.verificacion);
            if (v >= 2) {
              if (!isVerified) setIsVerified(true);
              if (!hasPaid) setHasPaid(true);
              localStorage.setItem('studentVerified','true');
              localStorage.setItem('studentPaid','true');
            } else if (v === 3) {
              setIsVerified(false);
              setHasPaid(false);
              localStorage.removeItem('studentVerified');
              localStorage.removeItem('studentPaid');
            }
          }
        } catch(_){}
      };
      ws.onerror = (e) => { console.warn('[WS] onerror', e?.message || e); setWsStatus('error'); };
      ws.onclose = (ev) => {
        setWsStatus('closed');
        if(!closedManually){
          scheduleReconnect(attempt+1);
        }
      };
    }
    function scheduleReconnect(nextAttempt){
      const backoff = Math.min(30000, 1000 * Math.pow(2, nextAttempt));
      setWsAttempts(nextAttempt);
      reconnectTimer = setTimeout(()=> openSocket(nextAttempt), backoff);
    }
    openSocket(wsAttempts+1);
    return () => { closedManually = true; try { ws && ws.close(); } catch(_){}; if(reconnectTimer) clearTimeout(reconnectTimer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Ya no se auto-selecciona el curso: el alumno debe elegirlo manualmente en /alumno/cursos.

  // Sincronizar flags con el backend: si AuthContext expone verificación aprobada (>=2), reflejarlo aquí
  useEffect(() => {
    const verif = Number(alumno?.verificacion ?? 0);
    if (verif >= 2) {
      if (!isVerified) setIsVerified(true);
      if (!hasPaid) setHasPaid(true); // Asumir pagado cuando está aprobado
      if (localStorage.getItem('studentVerified') !== 'true') localStorage.setItem('studentVerified', 'true');
      if (localStorage.getItem('studentPaid') !== 'true') localStorage.setItem('studentPaid', 'true');
    }
  }, [alumno?.verificacion]);

  // Resetear selección de curso y sección activa cuando el usuario cierra sesión
  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentCourse(null);
      setActiveSection(null);
      setIsFirstAccess(true);
      localStorage.removeItem('currentCourse');
      localStorage.removeItem('activeSection');
      localStorage.setItem('isFirstAccess', 'true');
    }
  }, [isAuthenticated]);

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

  // Verificar acceso al contenido basado en calendario de pagos (tolerancia aplicada)
  const refreshOverdueAccess = (now = new Date()) => {
    try {
      const { isOverdueLocked, overdueDays } = computeOverdueState({ alumno, now });
      setHasContentAccess(!isOverdueLocked);
      setOverdueDays(overdueDays || 0);
      return { hasAccess: !isOverdueLocked, overdueDays };
    } catch (e) {
      console.warn('No se pudo evaluar estado de mora:', e);
      // Ante error, no bloquear
      setHasContentAccess(true);
      setOverdueDays(0);
      return { hasAccess: true, overdueDays: 0 };
    }
  };

  // Chequeo de pagos: usar cálculo local; opcionalmente podría mezclarse con backend en el futuro
  const checkPaymentStatus = async () => {
    return refreshOverdueAccess();
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
    
  // Funciones de pagos y acceso global
  checkPaymentStatus,
  updatePaymentStatus,
  refreshOverdueAccess,
  wsStatus,
  wsAttempts,
  };

  return (
    <StudentContext.Provider value={value}>
      {children}
    </StudentContext.Provider>
  );
};