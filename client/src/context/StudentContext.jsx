import React, { createContext, useContext, useState, useEffect } from 'react';
import eeauImg from '../assets/mqerk/1.webp';
import { useAuth } from './AuthContext.jsx';
import { computeOverdueState } from '../utils/payments.js';
import * as AreaAccess from '../api/areaAccess.js';

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

// Fallback seguro para cuando el hook se usa fuera del provider (evita crasheos en rutas o HMR)
const defaultStudentContext = {
  // Flags y datos básicos
  isVerified: false,
  hasPaid: false,
  isFirstAccess: true,
  hasContentAccess: true,
  overdueDays: 0,
  studentData: null,
  enrolledCourses: [],
  currentCourse: null,
  activeSection: null,
  wsStatus: 'idle',
  wsAttempts: 0,

  // Funciones no-op
  simulateVerification: () => {},
  resetStudentState: () => {},
  forceCompleteReset: () => {},
  goToStart: () => {},
  loadEnrolledCourses: () => {},
  selectCourse: () => {},
  clearCourse: () => {},
  enrollInCourse: () => {},
  updateCourseProgress: () => {},
  setActiveSectionHandler: () => {},
  goToWelcome: () => {},
  addAllowedSimulationArea: () => {},
  requestNewSimulationAreaAccess: () => {},
  addAllowedActivityArea: () => {},
  requestNewActivityAreaAccess: () => {},
  addAllowedArea: () => {},
  requestNewAreaAccess: () => {},
  clearAreas: () => {},
  checkPaymentStatus: async () => ({ hasAccess: true, overdueDays: 0 }),
  updatePaymentStatus: () => {},
  refreshOverdueAccess: () => ({ hasAccess: true, overdueDays: 0 }),

  // UI prefs
  headerPrefs: { showQuickLinks: true, links: ['cursos','calendario','pagos'] },
  updateHeaderPrefs: () => {},
};

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (!context) {
    try { console.warn('useStudent used outside StudentProvider. Using fallback context.'); } catch {}
    return defaultStudentContext;
  }
  return context;
};

export const StudentProvider = ({ children }) => {
  const { isAuthenticated, alumno, user } = useAuth();
  // Estados principales del estudiante
  const [isVerified, setIsVerified] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(() => {
    // Hidratar inmediatamente desde localStorage para evitar redirecciones tempranas en refresh
    try {
      const raw = localStorage.getItem('currentCourse');
      if (!raw || raw === 'null' || raw === 'undefined') {
        console.log('[Curso] No hay curso en localStorage al inicializar');
        return null;
      }
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && (parsed.id || parsed.title)) {
        console.log('[Curso] ✅ Curso cargado desde localStorage en inicialización:', parsed.title || parsed.id);
        return parsed;
      }
      console.warn('[Curso] Curso inválido en localStorage al inicializar, limpiando...');
      localStorage.removeItem('currentCourse');
      return null;
    } catch (error) {
      console.error('[Curso] Error al parsear curso desde localStorage en inicialización:', error);
      localStorage.removeItem('currentCourse');
      return null;
    }
  });
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

  // Preferencias de UI (accesos rápidos del header, etc.)
  const defaultHeaderPrefs = {
    showQuickLinks: true,
    links: ['cursos', 'calendario', 'pagos'], // orden base
  };
  const [headerPrefs, setHeaderPrefs] = useState(defaultHeaderPrefs);
  const updateHeaderPrefs = (partialOrFn) => {
    setHeaderPrefs((prev) => {
      const next = typeof partialOrFn === 'function' ? partialOrFn(prev) : { ...prev, ...partialOrFn };
      try { localStorage.setItem('studentHeaderPrefs', JSON.stringify(next)); } catch {}
      return next;
    });
  };

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

  // Utilidades de red (reintento simple con backoff corto)
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const fetchWithRetry = async (url, options, retries = 2, delayMs = 400) => {
    let lastErr;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetch(url, options);
        if (res.ok) return res;
        // Log detallado del cuerpo cuando hay 5xx (ayuda a depurar sin romper UI)
        try {
          const ct = res.headers.get('content-type') || '';
          const body = ct.includes('application/json') ? JSON.stringify(await res.json()) : await res.text();
          console.warn(`[EEAU] intento ${attempt + 1} fallo: status=${res.status}`, body?.slice?.(0, 500) || body);
        } catch {}
        if (res.status >= 500 && res.status <= 599 && attempt < retries) {
          await sleep(delayMs);
          continue;
        }
        return res; // 4xx u otros: no reintentar
      } catch (err) {
        lastErr = err;
        console.warn(`[EEAU] error de red intento ${attempt + 1}:`, err?.message || err);
        if (attempt < retries) {
          await sleep(delayMs);
          continue;
        }
      }
    }
    throw lastErr || new Error('fetchWithRetry agotado');
  };

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
      // Obtener ID del estudiante si está disponible (de studentData o alumno del AuthContext)
      const estudianteId = studentData?.id || studentData?.id_estudiante || alumno?.id;
      const url = estudianteId 
        ? `/api/eeau?id_estudiante=${estudianteId}`
        : '/api/eeau';
      
      const res = await fetchWithRetry(url, { credentials: 'include' }, 2, 450);
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
      // Validar imagen de la API: solo usar si es una URL válida (http/https) o data URI
      // NO usar rutas relativas como /public/ porque no funcionan en el frontend
      let validImage = eeauImg; // Por defecto usar la imagen importada
      if (c?.image || c?.imagen || c?.foto_url || c?.fotoUrl || c?.imagen_portada) {
        const apiImage = c.image || c.imagen || c.foto_url || c.fotoUrl || c.imagen_portada;
        // Solo usar si es una URL completa (http/https) o data URI
        // Ignorar rutas relativas como /public/ porque no existen en el frontend
        if (apiImage && (
          apiImage.startsWith('http://') || 
          apiImage.startsWith('https://') || 
          apiImage.startsWith('data:')
        )) {
          validImage = apiImage;
        }
        // Si es una ruta relativa que empieza con /, ignorarla y usar la imagen importada
        // porque las rutas del backend no coinciden con las del frontend
      }
      
      // Obtener progreso del backend (0-100) o usar 0 si no está disponible
      const progresoReal = c?.progreso != null ? Math.round(c.progreso) : 0;
      
      const courseObj = c ? buildCourse({
        id: c.codigo || 'EEAU',
        title: c.titulo || 'Curso EEAU',
        instructor: c.asesor || 'Kelvin Valentin Ramirez',
        image: validImage, // Usar solo imagen válida
        progress: progresoReal, // Progreso real del backend
        metadata: [
          { icon: 'reloj', text: `Duración: ${c.duracion_meses || 8} meses` },
          { icon: 'libro', text: 'Lecciones interactivas' },
          { icon: 'estudiante', text: `Progreso: ${progresoReal}%` }
        ]
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
    } else {
      console.warn('⚠️ Curso no encontrado en enrolledCourses:', courseId);
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

  const requestNewSimulationAreaAccess = async (areaId, options = {}) => {
    try {
      // Evitar solicitudes duplicadas locales (UI)
      if (simulationRequests.some(req => req.areaId === areaId && req.status === 'pending')) return;
      const payload = { area_id: areaId, area_type: 'simulacion', notes: options?.notes || null };
      await AreaAccess.createAreaRequest(payload);
      // Refrescar desde backend
      await hydrateAreaAccess();
    } catch (e) {
      console.error('No se pudo crear solicitud de simulación', e);
      // fallback local para no bloquear UX
      const newRequest = { areaId, status: 'pending', date: new Date().toISOString() };
      const newRequests = [...simulationRequests, newRequest];
      setSimulationRequests(newRequests);
      localStorage.setItem('simulationRequests', JSON.stringify(newRequests));
    }
  };

  // Funciones específicas para ACTIVIDADES
  const addAllowedActivityArea = (areaId) => {
    if (!allowedActivityAreas.includes(areaId)) {
      const newAllowedAreas = [...allowedActivityAreas, areaId];
      setAllowedActivityAreas(newAllowedAreas);
      localStorage.setItem('allowedActivityAreas', JSON.stringify(newAllowedAreas));
    }
  };

  const requestNewActivityAreaAccess = async (areaId, options = {}) => {
    try {
      if (activityRequests.some(req => req.areaId === areaId && req.status === 'pending')) return;
      const payload = { area_id: areaId, area_type: 'actividad', notes: options?.notes || null };
      await AreaAccess.createAreaRequest(payload);
      await hydrateAreaAccess();
    } catch (e) {
      console.error('No se pudo crear solicitud de actividad', e);
      const newRequest = { areaId, status: 'pending', date: new Date().toISOString() };
      const newRequests = [...activityRequests, newRequest];
      setActivityRequests(newRequests);
      localStorage.setItem('activityRequests', JSON.stringify(newRequests));
    }
  };

  // Hidratar permisos y solicitudes desde backend
  const isStudent = !!user && (String(user.role || '').toLowerCase() === 'estudiante') && !!alumno?.id;

  const hydrateAreaAccess = async () => {
    try {
      if (!isStudent) return; // Solo estudiantes pueden consultar estos endpoints
      const [permAct, permSim, reqsAct, reqsSim] = await Promise.all([
        AreaAccess.listMyAreaPermissions({ area_type: 'actividad' }).then(r=> r?.data?.data || []).catch(()=>[]),
        AreaAccess.listMyAreaPermissions({ area_type: 'simulacion' }).then(r=> r?.data?.data || []).catch(()=>[]),
        AreaAccess.listMyAreaRequests({ area_type: 'actividad' }).then(r=> r?.data?.data || []).catch(()=>[]),
        AreaAccess.listMyAreaRequests({ area_type: 'simulacion' }).then(r=> r?.data?.data || []).catch(()=>[]),
      ]);
      const actIds = Array.from(new Set(permAct.map(p => p.area_id))).filter(Boolean);
      const simIds = Array.from(new Set(permSim.map(p => p.area_id))).filter(Boolean);
      setAllowedActivityAreas(actIds);
      setAllowedSimulationAreas(simIds);
      localStorage.setItem('allowedActivityAreas', JSON.stringify(actIds));
      localStorage.setItem('allowedSimulationAreas', JSON.stringify(simIds));
      // Normalizar estructura de requests para el estado local esperado
      const mapReq = (r) => ({ id: r.id, areaId: r.area_id, status: r.status, date: r.created_at, notes: r.notes || null });
      const reqAct = reqsAct.map(mapReq);
      const reqSim = reqsSim.map(mapReq);
      setActivityRequests(reqAct);
      setSimulationRequests(reqSim);
      localStorage.setItem('activityRequests', JSON.stringify(reqAct));
      localStorage.setItem('simulationRequests', JSON.stringify(reqSim));
    } catch (e) {
      console.warn('hydrateAreaAccess fallo; se mantienen estados locales', e?.message || e);
    }
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
  // Este useEffect se ejecuta DESPUÉS del estado inicial, pero necesitamos asegurarnos
  // de que el curso se cargue lo antes posible para evitar redirecciones innecesarias
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
    
    // Siempre restaurar currentCourse desde localStorage si existe y es válido
    // Esto asegura que el curso persista después de refrescar
    if (storedCourse) {
      try {
        const parsedCourse = JSON.parse(storedCourse);
        // Verificar que el curso almacenado sea válido
        if (parsedCourse && typeof parsedCourse === 'object' && (parsedCourse.id || parsedCourse.title)) {
          // Siempre actualizar para asegurar que el curso se restaure correctamente
          // incluso si ya está en el estado (por si cambió algo en localStorage)
          setCurrentCourse(parsedCourse);
          console.log('[Curso] ✅ Curso restaurado desde localStorage en useEffect:', parsedCourse.title || parsedCourse.id);
        } else {
          console.warn('[Curso] Curso inválido en localStorage, limpiando...');
          localStorage.removeItem('currentCourse');
        }
      } catch (error) {
        console.error('[Curso] Error parsing stored course:', error);
        // Si hay error al parsear, limpiar el localStorage corrupto
        localStorage.removeItem('currentCourse');
      }
    } else {
      console.log('[Curso] No hay curso guardado en localStorage en useEffect');
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

    // Cargar preferencias de UI
    try {
      const rawHeader = localStorage.getItem('studentHeaderPrefs');
      if (rawHeader) {
        const parsed = JSON.parse(rawHeader);
        // Merge con defaults para tolerar cambios futuros
        setHeaderPrefs({ ...defaultHeaderPrefs, ...(parsed || {}) });
      } else {
        setHeaderPrefs(defaultHeaderPrefs);
      }
    } catch { setHeaderPrefs(defaultHeaderPrefs); }

  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadEnrolledCourses();
      // Refrescar permisos/solicitudes solo si es estudiante
      if (isStudent) hydrateAreaAccess();
    }
  }, [isAuthenticated, isStudent]);

  // Sincronizar el curso guardado en localStorage con enrolledCourses cuando se cargan los cursos
  // Esto asegura que el curso persista incluso después de refrescar
  useEffect(() => {
    // Solo sincronizar si hay enrolledCourses cargados
    if (enrolledCourses.length === 0) return;
    
    // Si ya hay un currentCourse establecido, verificar que coincida con enrolledCourses
    if (currentCourse) {
      const courseExists = enrolledCourses.some(c => c.id === currentCourse.id);
      if (courseExists) {
        // Si existe, actualizar con los datos frescos de enrolledCourses (por si cambió algo)
        const freshCourse = enrolledCourses.find(c => c.id === currentCourse.id);
        if (freshCourse && JSON.stringify(freshCourse) !== JSON.stringify(currentCourse)) {
          // Log solo en desarrollo para reducir ruido en consola
          if (process.env.NODE_ENV === 'development') {
            console.log('🔄 Actualizando curso con datos frescos de enrolledCourses:', freshCourse.title);
          }
          setCurrentCourse(freshCourse);
          localStorage.setItem('currentCourse', JSON.stringify(freshCourse));
        }
        return; // Ya está sincronizado
      }
    }
    
    // Si no hay currentCourse pero hay uno guardado en localStorage, restaurarlo
    if (!currentCourse) {
      try {
        const storedCourseRaw = localStorage.getItem('currentCourse');
        if (!storedCourseRaw || storedCourseRaw === 'null' || storedCourseRaw === 'undefined') return;
        
        const storedCourse = JSON.parse(storedCourseRaw);
        if (!storedCourse || typeof storedCourse !== 'object') return;
        
        // Buscar el curso en enrolledCourses por ID o título
        const matchedCourse = enrolledCourses.find(c => 
          c.id === storedCourse.id || 
          c.title === storedCourse.title ||
          (storedCourse.id && c.id && String(c.id).toLowerCase() === String(storedCourse.id).toLowerCase())
        );
        
        if (matchedCourse) {
          console.log('✅ Restaurando curso desde localStorage y sincronizando con enrolledCourses:', matchedCourse.title);
          setCurrentCourse(matchedCourse);
          localStorage.setItem('currentCourse', JSON.stringify(matchedCourse));
          setIsFirstAccess(false);
        } else {
          // Si el curso guardado no existe en enrolledCourses, restaurarlo de todas formas
          // Esto permite que el curso persista incluso si hay problemas temporales con enrolledCourses
          console.warn('⚠️ El curso guardado no coincide con ningún curso matriculado, restaurándolo de todas formas:', storedCourse.id, storedCourse.title);
          setCurrentCourse(storedCourse);
          setIsFirstAccess(false);
        }
      } catch (error) {
        console.error('Error al sincronizar curso desde localStorage:', error);
      }
    }
  }, [enrolledCourses]); // Ejecutar cuando enrolledCourses cambie

  // WebSocket robusto (notificaciones + estado verificación) con reconexión exponencial
  const [wsStatus, setWsStatus] = useState('idle'); // idle|connecting|open|closed|error|unavailable
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
      
      // Intentar health check pero no bloquear si falla (puede ser problema temporal)
      let healthy = false;
      try {
        healthy = await waitForBackendHealth(2000);
        if (!healthy && attempt < 3) {
          // En los primeros intentos, esperar un poco antes de abrir WS
          // Solo mostrar warning en desarrollo y solo una vez por sesión
          if (import.meta.env?.DEV && attempt === 1) {
            console.debug('[WS] Backend no responde health check. Verifica que el servidor esté corriendo en http://localhost:1002');
          }
          scheduleReconnect(attempt);
          return;
        }
      } catch (healthErr) {
        // Solo mostrar error detallado en desarrollo y en el primer intento
        if (import.meta.env?.DEV && attempt === 1) {
          console.debug('[WS] Health check falló:', healthErr?.message || healthErr);
        }
        // Si ya hemos intentado varias veces, intentar abrir el WS de todas formas
        if (attempt < 3) {
          scheduleReconnect(attempt);
          return;
        }
        // Después de 3 intentos, intentar abrir el WS incluso si el health check falla
        if (import.meta.env?.DEV) {
          console.debug('[WS] Health check falló pero intentando abrir WS de todas formas (intento', attempt, ')');
        }
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
          // Si llega una notificación de acceso a área aprobado, refrescar permisos
          if (data && data.type === 'notification' && data.payload) {
            const p = data.payload;
            const ptype = (p.kind || p.type || '').toLowerCase();
            const status = (p.metadata?.status || '').toLowerCase();
            if (ptype === 'area_access' && status === 'approved') {
              try { if (isStudent) hydrateAreaAccess(); } catch {}
            }
          }
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
  // IMPORTANTE: Solo limpiar si realmente se perdió la autenticación (no durante verificación inicial)
  useEffect(() => {
    // Verificar si hay un usuario autenticado en localStorage para saber si realmente se perdió la sesión
    // Si no hay usuario en localStorage, entonces sí se cerró sesión realmente
    const hasUserInStorage = localStorage.getItem('mq_user');
    
    if (!isAuthenticated && !hasUserInStorage) {
      // Solo limpiar si realmente se cerró sesión (no hay usuario en localStorage)
      console.log('[Curso] Sesión cerrada, limpiando curso...');
      setCurrentCourse(null);
      setActiveSection(null);
      setIsFirstAccess(true);
      localStorage.removeItem('currentCourse');
      localStorage.removeItem('activeSection');
      localStorage.setItem('isFirstAccess', 'true');
    } else if (!isAuthenticated && hasUserInStorage) {
      // Si no está autenticado pero hay usuario en localStorage, podría ser una verificación temporal
      // No limpiar el curso, ya que la autenticación podría restaurarse pronto
      console.log('[Curso] Verificación de autenticación en progreso, manteniendo curso...');
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

  // Preferencias UI
  headerPrefs,
  updateHeaderPrefs,
  };

  return (
    <StudentContext.Provider value={value}>
      {children}
    </StudentContext.Provider>
  );
};