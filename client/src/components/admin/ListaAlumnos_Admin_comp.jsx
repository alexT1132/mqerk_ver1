import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminContext } from '../../context/AdminContext.jsx';

// Modal de confirmación personalizado
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirmar", cancelText = "Cancelar", studentName = "" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 backdrop-blur-md transition-all duration-300" onClick={onCancel}></div>
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-auto transform transition-all duration-300 scale-100">
        <div className="p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {title}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {message}
              </p>
              {studentName && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                  <p className="text-sm font-medium text-red-800">
                    Estudiante: <span className="font-bold">{studentName}</span>
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    Esta acción es irreversible
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 rounded-b-xl">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente de notificación personalizada
const CustomNotification = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const getNotificationStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 transform transition-all duration-300 ease-in-out">
      <div className={`max-w-md p-4 rounded-lg border shadow-xl ${getNotificationStyles()}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium">{message}</p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={onClose}
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function LoadingScreen({ onComplete }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 2000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-white">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-lg font-medium text-gray-700">Cargando lista de estudiantes...</p>
            </div>
        </div>
    );
}

// Componente para botones de categoría (cursos)
function CategoryButton({ label, isActive, onClick }) {
    // Función para obtener texto responsive
    const getResponsiveText = (label) => {
        const abbreviations = {
            'DIGI-START': { short: 'DIGI', medium: 'DIGI-START' },
            'MINDBRIDGE': { short: 'MIND', medium: 'MINDBRIDGE' },
            'SPEAKUP': { short: 'SPEAK', medium: 'SPEAKUP' },
            'EEAU': { short: 'EEAU', medium: 'EEAU' },
            'EEAP': { short: 'EEAP', medium: 'EEAP' },
            'PCE': { short: 'PCE', medium: 'PCE' }
        };
        
        return abbreviations[label] || { short: label, medium: label };
    };

    const textVariants = getResponsiveText(label);

    return (
        <button
            onClick={onClick}
            className={`
                relative overflow-hidden 
                px-1 py-1.5 xs:px-2 xs:py-2 sm:px-3 sm:py-3 md:px-4 md:py-3
                rounded-md xs:rounded-lg sm:rounded-xl 
                font-bold text-[9px] xs:text-[10px] sm:text-xs md:text-sm lg:text-base
                transition-all duration-300 ease-out 
                w-full min-w-[70px] xs:min-w-[85px] sm:min-w-[100px] max-w-[120px] xs:max-w-[140px] sm:max-w-[160px]
                h-10 xs:h-12 sm:h-14 md:h-16
                flex items-center justify-center
                border-2 transform hover:scale-105 hover:shadow-lg
                ${isActive
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white border-purple-500 shadow-md shadow-purple-500/30' 
                    : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-400 shadow-sm hover:from-purple-600 hover:to-purple-700 hover:border-purple-500'
                }
            `}
        >
            {/* Texto para pantallas muy pequeñas */}
            <span className="block xs:hidden relative z-10 tracking-tight text-center leading-tight break-words hyphens-auto px-1">
                {textVariants.short}
            </span>
            {/* Texto para pantallas medianas y grandes */}
            <span className="hidden xs:block relative z-10 tracking-tight text-center leading-tight break-words hyphens-auto px-1">
                {textVariants.medium}
            </span>
        </button>
    );
}

// Botón de grupo con información de capacidad
function GrupoButton({ label, isActive, onClick, grupo }) {
    // Función para obtener estilos sobrios basados en el tipo de turno
    const getGrupoStyles = (tipo, isActive) => {
        const baseStyles = "relative overflow-hidden px-3 py-2 xs:px-4 xs:py-2 sm:px-5 sm:py-3 rounded-md xs:rounded-lg font-medium text-xs xs:text-sm transition-all duration-200 ease-out w-full min-w-[100px] max-w-[140px] h-10 xs:h-12 sm:h-14 flex flex-col items-center justify-center gap-0.5 border hover:shadow-md";
        
        switch (tipo) {
            case 'vespertino':
                return isActive 
                    ? `${baseStyles} bg-purple-500 text-white border-purple-500`
                    : `${baseStyles} bg-white text-purple-600 border-purple-300 hover:bg-purple-50`;
            
            case 'matutino':
                return isActive 
                    ? `${baseStyles} bg-blue-500 text-white border-blue-500`
                    : `${baseStyles} bg-white text-blue-600 border-blue-300 hover:bg-blue-50`;
            
            case 'sabatino':
                return isActive 
                    ? `${baseStyles} bg-green-500 text-white border-green-500`
                    : `${baseStyles} bg-white text-green-600 border-green-300 hover:bg-green-50`;
            
            default:
                return isActive 
                    ? `${baseStyles} bg-gray-500 text-white border-gray-500`
                    : `${baseStyles} bg-white text-gray-600 border-gray-300 hover:bg-gray-50`;
        }
    };

   

    return (
        <button
            onClick={onClick}
            className={getGrupoStyles(grupo?.tipo, isActive)}
        >
            <span className="relative z-10 tracking-wide text-center leading-tight">{label}</span>
        </button>
    );
}

function ListaAlumnos_Admin_comp() {
  const navigate = useNavigate();
  const [showLoadingScreen, setShowLoadingScreen] = useState(() => {
    const hasState = sessionStorage.getItem('listAlumnos_activeCategory') && 
                     sessionStorage.getItem('listAlumnos_activeTurno');
    return !hasState;
  });
  const [activeCategory, setActiveCategory] = useState(() => {
    return sessionStorage.getItem('listAlumnos_activeCategory') || null;
  });
  const [activeTurno, setActiveTurno] = useState(() => {
    return sessionStorage.getItem('listAlumnos_activeTurno') || null;
  });
  const [alumnos, setAlumnos] = useState([]);
  const [searchTerm, setSearchTerm] = useState(() => {
    return sessionStorage.getItem('listAlumnos_searchTerm') || '';
  });

  // Estados para modal y notificaciones
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    studentName: '',
    onConfirm: () => {}
  });
  const [notification, setNotification] = useState({
    isVisible: false,
    message: '',
    type: 'success'
  });

  // ============= INTEGRACIÓN CON ADMINCONTEXT =============
  
  // AdminContext.jsx proporciona TODAS las funciones para estudiantes:
  // - studentsData: datos de estudiantes cargados
  // - isLoading: estado de carga del contexto
  // - error: errores del contexto
  // - lastUpdated: timestamp de última actualización
  // - loadStudentsData(curso, turno): cargar estudiantes por curso/turno
  // - deleteStudent(folio): eliminar estudiante
  // - updateStudent(folio, data): actualizar estudiante
  // - updateStudentStatus(folio, status): cambiar estatus del estudiante
  const { 
    studentsData,
    isLoading,
    error,
    lastUpdated,
    loadStudentsData,
    deleteStudent,
    updateStudent
  } = useAdminContext();

  // ==================== CONFIGURACIÓN DE CURSOS Y GRUPOS ====================
  
  // ❌ CURSOS FIJOS - HARDCODEADOS en el frontend
  // Estos NO cambian desde el backend, están definidos aquí:
  const cursosDisponibles = ['EEAU', 'EEAP', 'DIGI-START', 'MINDBRIDGE', 'SPEAKUP', 'PCE'];
  
  // ✅ GRUPOS DINÁMICOS - TODO viene del backend
  // Incluye: nombre, tipo, capacidad máxima, alumnos actuales
  // TODO: CONECTAR CON BACKEND - Endpoint: GET /api/cursos/{curso}/grupos
  //  ESTOS DATOS SÍ VIENEN DEL BACKEND 
  const [gruposPorCurso, setGruposPorCurso] = useState({
    // DATOS MOCK TEMPORALES PARA PRUEBAS - ELIMINAR EN PRODUCCIÓN
    // ✅ Contadores actualizados según los datos simulados
    'EEAU': [
      { id: 1, nombre: 'V1', tipo: 'vespertino', capacidad: 10, alumnosActuales: 3 }, // 3 estudiantes en EEAU-V1
      { id: 2, nombre: 'V2', tipo: 'vespertino', capacidad: 10, alumnosActuales: 2 }, // 2 estudiantes en EEAU-V2
      { id: 3, nombre: 'M1', tipo: 'matutino', capacidad: 15, alumnosActuales: 1 }    // 1 estudiante en EEAU-M1
    ],
    'EEAP': [
      { id: 4, nombre: 'V1', tipo: 'vespertino', capacidad: 12, alumnosActuales: 2 }, // 2 estudiantes en EEAP-V1
      { id: 5, nombre: 'S1', tipo: 'sabatino', capacidad: 20, alumnosActuales: 1 }    // 1 estudiante en EEAP-S1
    ],
    'DIGI-START': [
      { id: 6, nombre: 'V1', tipo: 'vespertino', capacidad: 8, alumnosActuales: 1 },  // 1 estudiante en DIGI-START-V1
      { id: 7, nombre: 'M1', tipo: 'matutino', capacidad: 10, alumnosActuales: 1 }    // 1 estudiante en DIGI-START-M1
    ],
    'MINDBRIDGE': [
      { id: 8, nombre: 'V1', tipo: 'vespertino', capacidad: 6, alumnosActuales: 1 }   // 1 estudiante en MINDBRIDGE-V1
    ],
    'SPEAKUP': [
      { id: 9, nombre: 'V1', tipo: 'vespertino', capacidad: 8, alumnosActuales: 1 },  // 1 estudiante en SPEAKUP-V1
      { id: 10, nombre: 'V2', tipo: 'vespertino', capacidad: 8, alumnosActuales: 1 }  // 1 estudiante en SPEAKUP-V2
    ],
    'PCE': [
      { id: 11, nombre: 'M1', tipo: 'matutino', capacidad: 12, alumnosActuales: 1 },  // 1 estudiante en PCE-M1
      { id: 12, nombre: 'S1', tipo: 'sabatino', capacidad: 15, alumnosActuales: 1 }   // 1 estudiante en PCE-S1
    ]
  });

  // ==================== SIMULACIÓN DE DATOS POR CURSO Y TURNO ====================
  
  // ✅ DATOS MOCK CENTRALIZADOS - Los datos ahora se importan desde /data/studentsData.js
  // Esto asegura que ListaAlumnos y StudentProfilePage usen los mismos datos
  // ELIMINAR EN PRODUCCIÓN junto con el archivo studentsData.js

  // ==================== UTILIDADES ====================
  
  // Obtiene los grupos disponibles para el curso seleccionado
  const getGruposDisponibles = () => {
    return gruposPorCurso[activeCategory] || [];
  };

  // Obtiene información del grupo seleccionado
  const getGrupoInfo = () => {
    if (!activeCategory || !activeTurno) return null;
    
    const grupos = getGruposDisponibles();
    return grupos.find(grupo => grupo.nombre === activeTurno);
  };

  const fetchAlumnos = async () => {
    if (!activeCategory || !activeTurno) return;
    
    try {
      // INTEGRACIÓN CON ADMINCONTEXT - Los datos vienen del contexto
      // AdminContext.jsx maneja loadStudentsData(curso, turno) con datos mock
      // En producción, AdminContext hará las llamadas HTTP reales
      
      // Simular delay del backend (esto se quita en producción)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // TEMPORAL: Usar datos centralizados mock hasta que AdminContext esté conectado
      const mockData = getStudentsByCourseAndTurn(activeCategory, activeTurno);
      setAlumnos(mockData);
      
      // TODO: USAR ADMINCONTEXT EN LUGAR DE MOCK - DESCOMENTAR EN PRODUCCIÓN
      // const data = await loadStudentsData(activeCategory, activeTurno);
      // setAlumnos(data || []);
      
    } catch (err) {
      console.error('Error al cargar estudiantes:', err);
      setAlumnos([]);
    }
  };

  // FUNCIONES DE INTEGRACIÓN CON ADMINCONTEXT - LISTAS PARA USAR
  // deleteStudent y updateStudent vienen directamente del AdminContext.jsx
  // Estas funciones YA están conectadas con el backend (actualmente con mocks)
  const deleteStudentFromBackend = async (folio) => {
    try {
      if (deleteStudent && typeof deleteStudent === 'function') {
        await deleteStudent(folio); // ← AdminContext.jsx
        await fetchAlumnos(); // Recargar lista después de eliminar
        return { success: true, message: 'Estudiante eliminado exitosamente' };
      }
      throw new Error('Función de eliminación no disponible en AdminContext');
    } catch (error) {
      console.error('Error al eliminar estudiante:', error);
      return { success: false, message: error.message || 'Error al eliminar estudiante' };
    }
  };

  const updateStudentInBackend = async (folio, updatedData) => {
    try {
      if (updateStudent && typeof updateStudent === 'function') {
        await updateStudent(folio, updatedData); // ← AdminContext.jsx
        await fetchAlumnos(); // Recargar lista después de actualizar
        return { success: true, message: 'Estudiante actualizado exitosamente' };
      }
      throw new Error('Función de actualización no disponible en AdminContext');
    } catch (error) {
      console.error('Error al actualizar estudiante:', error);
      return { success: false, message: error.message || 'Error al actualizar estudiante' };
    }
  };

  // Cargar estudiantes cuando se seleccionan curso y turno
  useEffect(() => {
    if (activeCategory && activeTurno) {
      // Mostrar notificación de carga
      showNotification(`🔄 Cargando estudiantes de ${activeCategory} - ${activeTurno}...`, 'info');
      
      fetchAlumnos().then(() => {
        // Mostrar notificación de éxito después de cargar
        setTimeout(() => {
          const count = alumnosMockPorCursoTurno[`${activeCategory}-${activeTurno}`]?.length || 0;
          showNotification(`✅ ${count} estudiantes cargados para ${activeCategory} - ${activeTurno}`, 'success');
        }, 600);
      });
    }
  }, [activeCategory, activeTurno]);

  // Guardar estado en sessionStorage cuando cambie
  useEffect(() => {
    if (activeCategory) {
      sessionStorage.setItem('listAlumnos_activeCategory', activeCategory);
    } else {
      sessionStorage.removeItem('listAlumnos_activeCategory');
    }
  }, [activeCategory]);

  useEffect(() => {
    if (activeTurno) {
      sessionStorage.setItem('listAlumnos_activeTurno', activeTurno);
    } else {
      sessionStorage.removeItem('listAlumnos_activeTurno');
    }
  }, [activeTurno]);

  useEffect(() => {
    sessionStorage.setItem('listAlumnos_searchTerm', searchTerm);
  }, [searchTerm]);

  // Restaurar posición del scroll cuando el componente se monte
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem('listAlumnos_scrollPosition');
    if (savedScrollPosition) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollPosition));
        sessionStorage.removeItem('listAlumnos_scrollPosition');
      }, 100);
    }
  }, []);

  // Cargar datos inmediatamente si hay estado guardado
  useEffect(() => {
    if (activeCategory && activeTurno && alumnos.length === 0) {
      fetchAlumnos();
    }
  }, []);

  // Manejar la finalización de la pantalla de carga inicial
  const handleLoadingComplete = () => {
    setShowLoadingScreen(false);
  };

  // Función para actualizar manualmente los datos
  const handleRefreshData = async () => {
    if (activeCategory && activeTurno) {
      await fetchAlumnos();
    }
  };

  // Función para limpiar filtros y estado guardado
  const handleClearFilters = () => {
    setActiveCategory(null);
    setActiveTurno(null);
    setSearchTerm('');
    setAlumnos([]);
    sessionStorage.removeItem('listAlumnos_activeCategory');
    sessionStorage.removeItem('listAlumnos_activeTurno');
    sessionStorage.removeItem('listAlumnos_searchTerm');
    sessionStorage.removeItem('listAlumnos_scrollPosition');
  };

  // Filtrar estudiantes basado en término de búsqueda, categoría activa y turno
  const alumnosFiltrados = alumnos.filter(alumno => {
    const matchesSearch = 
      alumno.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumno.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumno.correoElectronico.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumno.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumno.municipioComunidad.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = activeCategory === null || alumno.curso === activeCategory;
    const matchesTurno = activeTurno === null || alumno.turno === activeTurno;
    
    return matchesSearch && matchesCategory && matchesTurno;
  });

  // Manejar selección de categoría (curso)
  const handleCategorySelect = (categoria) => {
    if (activeCategory === categoria) {
      setActiveCategory(null);
      setActiveTurno(null);
      setAlumnos([]); // ✅ Limpiar datos al deseleccionar
    } else {
      setActiveCategory(categoria);
      setActiveTurno(null); // Reset grupo al cambiar curso
      setAlumnos([]); // ✅ Limpiar datos al cambiar curso
    }
  };

  // Manejar selección de grupo (vespertino/matutino/sabatino)
  const handleGrupoSelect = (grupo) => {
    if (grupo === activeTurno) {
      setActiveTurno(null);
      setAlumnos([]); // ✅ Limpiar datos al deseleccionar turno
    } else {
      setActiveTurno(grupo);
      // Los datos se cargarán automáticamente en el useEffect
    }
  };

  // Action Handlers - Ready for backend integration
  const handleVerPerfil = (alumno) => {
    sessionStorage.setItem('listAlumnos_scrollPosition', window.pageYOffset.toString());
    navigate(`/administrativo/student/${alumno.folio}`);
  };

  // Función para mostrar notificaciones
  const showNotification = (message, type = 'success') => {
    setNotification({
      isVisible: true,
      message: message,
      type: type
    });
  };

  // Función para cerrar notificaciones
  const closeNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  const handleEliminarAlumno = (alumno) => {
    setConfirmModal({
      isOpen: true,
      title: 'Confirmar Eliminación',
      message: '¿Estás seguro de que quieres eliminar este estudiante? Esta acción no se puede deshacer.',
      studentName: `${alumno.nombres} ${alumno.apellidos}`,
      onConfirm: async () => {
        setConfirmModal({ isOpen: false, title: '', message: '', studentName: '', onConfirm: () => {} });
        
        const result = await deleteStudentFromBackend(alumno.folio);
        if (result.success) {
          showNotification('✅ ' + result.message, 'success');
        } else {
          showNotification('❌ ' + result.message, 'error');
        }
      }
    });
  };

  const handleCambiarEstatus = async (alumno, nuevoEstatus) => {
    const result = await updateStudentInBackend(alumno.folio, { estatus: nuevoEstatus });
    if (result.success) {
      showNotification(`✅ Estatus cambiado a ${nuevoEstatus} exitosamente`, 'success');
    } else {
      showNotification('❌ ' + result.message, 'error');
    }
  };

  const refreshStudentsList = () => {
    if (activeCategory && activeTurno) {
      fetchAlumnos();
    }
  };

  const getStatusBadge = (estatus) => {
    if (estatus === 'Activo') {
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          ✓
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          ✗
        </span>
      );
    }
  };

  // Si está cargando inicialmente, mostrar pantalla de carga
  if (showLoadingScreen) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  // Manejo de errores
  if (error) {
    return (
      <div className="w-full h-full min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-rose-100">
        <div className="text-center bg-white rounded-2xl shadow-2xl p-8 border border-red-200 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Error al cargar datos</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={handleRefreshData}
              disabled={isLoading}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Reintentando...' : 'Reintentar'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Modal de confirmación */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        studentName={confirmModal.studentName}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ isOpen: false, title: '', message: '', studentName: '', onConfirm: () => {} })}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

     
      <CustomNotification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={closeNotification}
      />

      <div className="w-full h-full min-h-[calc(100vh-80px)] flex flex-col bg-white">
  
      <div className="pt-2 xs:pt-4 sm:pt-6 pb-2 xs:pb-3 sm:pb-4 px-2 xs:px-4 sm:px-6">
        <div className="w-full max-w-7xl mx-auto">
          
          <div className="text-center mb-4 xs:mb-6 sm:mb-8">
            <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 xs:mb-2 px-2">
              Lista de Alumnos por Curso
            </h1>
            <div className="w-8 xs:w-12 sm:w-16 lg:w-20 h-0.5 xs:h-1 bg-gradient-to-r from-blue-500/80 to-indigo-500/80 mx-auto mb-2 rounded-full"></div>
            <p className="text-xs xs:text-sm sm:text-base text-gray-600 px-4">
              Gestiona y supervisa a todos los estudiantes registrados por curso
            </p>
            
         
            {lastUpdated && (
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-3">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  Actualizado: {new Date(lastUpdated).toLocaleTimeString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
                <button
                  onClick={handleRefreshData}
                  disabled={isLoading}
                  className="ml-2 text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50"
                  title="Actualizar datos"
                >
                  <svg className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                {(activeCategory || activeTurno || searchTerm) && (
                  <button
                    onClick={handleClearFilters}
                    className="ml-2 text-red-600 hover:text-red-700 transition-colors"
                    title="Limpiar todos los filtros"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Botones de categoría (filtros por curso) */}
          <div className="mb-4 xs:mb-6 sm:mb-8">
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg xs:rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-6 shadow-lg border border-gray-200">
              <h2 className="text-base xs:text-lg sm:text-xl font-bold text-gray-800 mb-3 xs:mb-4 sm:mb-6 text-center px-2">
                Filtrar por Curso
              </h2>
              <div className="grid grid-cols-3 xs:grid-cols-3 sm:grid-cols-6 md:grid-cols-6 gap-1 xs:gap-1.5 sm:gap-2 md:gap-3 place-items-center">
                {cursosDisponibles.map((cat) => (
                  <CategoryButton
                    key={cat}
                    label={cat}
                    isActive={activeCategory === cat}
                    onClick={() => handleCategorySelect(cat)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Selector de grupos/turnos dinámico */}
          {activeCategory && getGruposDisponibles().length > 0 && (
            <div className="mb-3 xs:mb-4 sm:mb-6">
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg xs:rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-6 shadow-lg border border-gray-200">
                <h2 className="text-base xs:text-lg sm:text-xl font-bold text-gray-800 mb-3 xs:mb-4 sm:mb-6 text-center px-2">
                  Grupos Disponibles para {activeCategory}
                </h2>
                <div className="flex flex-wrap gap-1.5 xs:gap-2 sm:gap-3 justify-center items-center max-w-4xl mx-auto">
                  {getGruposDisponibles().map((grupo) => (
                    <GrupoButton
                      key={grupo.id || grupo.nombre}
                      label={`${grupo.nombre} (${grupo.alumnosActuales}/${grupo.capacidad})`}
                      isActive={activeTurno === grupo.nombre}
                      onClick={() => handleGrupoSelect(grupo.nombre)}
                      grupo={grupo}
                    />
                  ))}
                </div>
                
                {/* Leyenda de colores por tipo de turno */}
                <div className="mt-4 flex flex-wrap gap-2 justify-center text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>Matutino</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-purple-500 rounded"></div>
                    <span>Vespertino</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Sabatino</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Información del grupo seleccionado */}
      {activeCategory && activeTurno && (
        <div className="px-2 xs:px-4 sm:px-6 mb-4 xs:mb-6">
          <div className="w-full max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 xs:px-6 sm:px-8 py-4 xs:py-5 sm:py-6 rounded-lg xs:rounded-xl sm:rounded-2xl shadow-lg">
              <div className="text-center">
                <p className="text-sm xs:text-base sm:text-lg md:text-xl font-semibold mb-1 xs:mb-2">
                  Grupo Activo: {activeCategory} - {activeTurno}
                </p>
                <p className="text-xs xs:text-sm sm:text-base text-blue-100">
                  Capacidad: <span className="font-bold text-white">{getGrupoInfo()?.alumnosActuales || 0}/{getGrupoInfo()?.capacidad || 0}</span> estudiantes
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal de la tabla */}
      <div className="flex-1 px-2 xs:px-4 sm:px-6 pb-4 xs:pb-6">
        <div className="w-full max-w-7xl mx-auto">
          {/* Tabla de alumnos completa - Solo se muestra cuando hay curso Y turno seleccionados */}
          {activeCategory && activeTurno ? (
            <>
              {/* Barra de búsqueda - Solo se muestra cuando hay curso seleccionado */}
              <div className="mb-4 xs:mb-6">
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg xs:rounded-xl p-3 xs:p-4 shadow-lg border border-gray-200">
                  <div className="max-w-sm xs:max-w-md mx-auto">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Buscar por nombre, apellido, correo o folio..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 xs:px-4 py-2 xs:py-3 pl-8 xs:pl-10 pr-3 xs:pr-4 text-xs xs:text-sm border border-gray-300 rounded-md xs:rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <div className="absolute inset-y-0 left-0 pl-2 xs:pl-3 flex items-center pointer-events-none">
                        <svg className="h-4 xs:h-5 w-4 xs:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabla de alumnos */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg xs:rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="px-3 xs:px-4 sm:px-6 py-3 xs:py-4 border-b border-gray-200 bg-gradient-to-r from-gray-100 to-gray-50">
              <h3 className="text-base xs:text-lg sm:text-xl font-bold text-gray-800">
                Lista Completa de Alumnos ({alumnosFiltrados.length})
              </h3>
              <p className="text-xs xs:text-sm text-gray-600 mt-1">
                Información completa de todos los estudiantes registrados
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-100 to-gray-50">
                  <tr>
                    <th className="px-2 xs:px-3 sm:px-4 py-3 xs:py-4 text-left text-xs xs:text-sm font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      <div className="flex flex-col space-y-1">
                        <span>Folio</span>
                        <span className="text-gray-500 font-normal">ID</span>
                      </div>
                    </th>
                    <th className="px-2 xs:px-3 sm:px-4 py-3 xs:py-4 text-left text-xs xs:text-sm font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      <div className="flex flex-col space-y-1">
                        <span>Estudiante</span>
                        <span className="text-gray-500 font-normal">Información Básica</span>
                      </div>
                    </th>
                    <th className="px-3 xs:px-4 sm:px-6 py-3 xs:py-4 text-left text-xs xs:text-sm font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                      <div className="flex flex-col space-y-1">
                        <span>Tutor</span>
                        <span className="text-gray-500 font-normal">Contacto</span>
                      </div>
                    </th>
                    <th className="px-1 xs:px-2 py-3 xs:py-4 text-center text-xs xs:text-sm font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200 w-20">
                      <div className="flex flex-col space-y-1">
                        <span>Estado</span>
                      </div>
                    </th>
                    <th className="px-2 xs:px-3 sm:px-4 py-3 xs:py-4 text-center text-xs xs:text-sm font-bold text-gray-700 uppercase tracking-wider">
                      <div className="flex flex-col space-y-1">
                        <span>Acciones</span>
                        <span className="text-gray-500 font-normal">Gestionar</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {alumnosFiltrados.map((alumno, index) => (
                    <tr key={alumno.folio} className={`hover:bg-gray-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      {/* Columna Folio */}
                      <td className="px-2 xs:px-3 sm:px-4 py-3 xs:py-4 border-r border-gray-200">
                        <div className="text-center">
                          <div className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md inline-block">
                            {alumno.folio}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {alumno.fechaRegistro}
                          </div>
                        </div>
                      </td>
                      
                      {/* Columna Estudiante */}
                      <td className="px-2 xs:px-3 sm:px-4 py-3 xs:py-4 border-r border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
                              <span className="text-sm font-bold text-white">
                                {alumno.nombres.charAt(0)}{alumno.apellidos.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-900">
                              {alumno.nombres} {alumno.apellidos}
                            </div>
                            <div className="text-xs text-gray-600 truncate">
                              {alumno.correoElectronico}
                            </div>
                            <div className="text-xs text-gray-500">
                              {alumno.municipioComunidad}
                            </div>
                            <div className="flex space-x-1 mt-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {alumno.curso}
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {alumno.turno}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Columna Tutor */}
                      <td className="px-3 xs:px-4 sm:px-6 py-3 xs:py-4 border-r border-gray-200">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900">
                            {alumno.nombreTutor}
                          </div>
                          <div className="text-sm text-green-600 font-mono">
                            {alumno.telefonoTutor}
                          </div>
                          <div className="text-xs text-gray-500">
                            Tel. Alumno: {alumno.telefonoAlumno}
                          </div>
                        </div>
                      </td>
                      
                      {/* Columna Estado */}
                      <td className="px-1 xs:px-2 py-3 xs:py-4 border-r border-gray-200 w-20">
                        <div className="flex flex-col items-center space-y-1">
                          {getStatusBadge(alumno.estatus)}
                          {/* Dropdown para cambiar estatus */}
                          <div className="relative group">
                            <button className="text-xs text-gray-500 hover:text-blue-600 transition-colors">
                              Cambiar
                            </button>
                            <div className="absolute hidden group-hover:block bg-white border border-gray-200 rounded-lg shadow-lg mt-1 py-1 w-24 z-10">
                              {alumno.estatus !== 'Activo' && (
                                <button
                                  onClick={() => handleCambiarEstatus(alumno, 'Activo')}
                                  className="block w-full text-left px-2 py-1 text-xs text-green-600 hover:bg-green-50"
                                >
                                  ✅ Activar
                                </button>
                              )}
                              {alumno.estatus !== 'Inactivo' && (
                                <button
                                  onClick={() => handleCambiarEstatus(alumno, 'Inactivo')}
                                  className="block w-full text-left px-2 py-1 text-xs text-yellow-600 hover:bg-yellow-50"
                                >
                                  ⏸️ Inactivar
                                </button>
                              )}
                              {alumno.estatus !== 'Suspendido' && (
                                <button
                                  onClick={() => handleCambiarEstatus(alumno, 'Suspendido')}
                                  className="block w-full text-left px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                                >
                                  ❌ Suspender
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Columna Acciones */}
                      <td className="px-2 xs:px-3 sm:px-4 py-3 xs:py-4 text-center">
                        <div className="flex flex-col space-y-2">
                          <button 
                            onClick={() => handleVerPerfil(alumno)}
                            className="inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                            title="Ver perfil completo del estudiante"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Ver Perfil
                          </button>
                          <button 
                            onClick={() => handleEliminarAlumno(alumno)}
                            className="inline-flex items-center justify-center px-3 py-2 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                            title="Eliminar estudiante"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Estado vacío */}
            {alumnosFiltrados.length === 0 && (
              <div className="text-center py-8 xs:py-12 bg-gray-50">
                <svg className="mx-auto h-8 xs:h-12 w-8 xs:w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-4m-4 0H9m11 0a2 2 0 01-2 2M7 13a2 2 0 01-2-2V9a2 2 0 012-2h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15a2 2 0 012 2v2a2 2 0 01-2 2H7z" />
                </svg>
                <h3 className="mt-2 xs:mt-4 text-base xs:text-lg font-medium text-gray-900">No se encontraron alumnos</h3>
                <p className="mt-1 xs:mt-2 text-xs xs:text-sm text-gray-500 px-4">
                  {searchTerm || activeCategory !== null || activeTurno !== null ? 
                    'No se encontraron alumnos con los filtros seleccionados.' : 
                    'Selecciona un curso y turno para ver los estudiantes.'
                  }
                </p>
               
              </div>
            )}
          </div>
          </>
          ) : (
            // Mensaje cuando no se han seleccionado curso y turno
            <div className="text-center py-8 xs:py-12 bg-gradient-to-br from-gray-50 to-white rounded-lg xs:rounded-xl shadow-lg border border-gray-200">
              <div className="max-w-xs xs:max-w-md mx-auto px-4">
                <svg className="mx-auto h-12 xs:h-16 w-12 xs:w-16 text-purple-400 mb-3 xs:mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="text-lg xs:text-xl font-bold text-gray-800 mb-1 xs:mb-2">
                  {!activeCategory 
                    ? "Selecciona un Curso de Inglés"
                    : "Selecciona un Turno"
                  }
                </h3>
                <p className="text-xs xs:text-base text-gray-600 mb-3 xs:mb-4">
                  {!activeCategory 
                    ? "Para gestionar los alumnos, primero debes seleccionar el curso que deseas revisar desde las opciones de arriba."
                    : `Ahora selecciona el turno específico para ver los estudiantes de ${activeCategory}.`
                  }
                </p>
              
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

export default ListaAlumnos_Admin_comp;