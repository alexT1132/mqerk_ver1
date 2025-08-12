import { useState, useEffect } from 'react';
import LoadingOverlay from '../shared/LoadingOverlay.jsx';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import jsPDF from 'jspdf';
import { generarYDescargarContrato } from '../../service/contractPDFService.js';
import { generarPDFCalibracion } from '../../service/pdfCalibrationService.js';
import ConfirmModal from '../shared/ConfirmModal';
import { useAdminContext } from '../../context/AdminContext.jsx';

// Reemplazado por el componente reutilizable LoadingOverlay

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

/**
 * Componente Admin de Gestión de Contratos
 * Gestiona la generación y administración de contratos para alumnos con pagos aprobados
 * 
 * ENDPOINTS BACKEND REQUERIDOS:
 * - GET /api/cursos/{curso}/grupos - Obtener grupos disponibles por curso
 * - GET /api/alumnos/aprobados?curso={curso}&turno={turno} - Obtener alumnos aprobados por curso y turno
 * - POST /api/contratos/{id}/generar - Generar contrato PDF
 * - POST /api/contratos/{id}/subir - Subir contrato firmado
 * - GET /api/contratos/{id}/visualizar - Visualizar contrato
 * 
 * FORMATO ESPERADO DE RESPUESTA ALUMNOS APROBADOS:
 * [
 *   {
 *     "id": 1,
 *     "folio": "PAG001",
 *     "alumno": "Juan Pérez",
 *     "correoElectronico": "juan@email.com",
 *     "categoria": "EEAU",
 *     "turno": "V1",
 *     "pagoCurso": "$1,500.00",
 *     "metodoPago": "Transferencia",
 *     "fechaEntrada": "2024-12-15",
 *     "planCurso": "Plan Básico - 6 meses",
 *     "contratoUrl": "/uploads/contrato123.pdf", // null si no tiene contrato aún
 *     "estado": "aprobado"
 *   }
 * ]
 */

function ValidacionPagos_Admin_comp() {
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeTurno, setActiveTurno] = useState(null);
  const [pagos, setPagos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [modalPDF, setModalPDF] = useState({
    isOpen: false,
    url: '',
    alumno: null,
    tipo: ''
  });
  
  const [showContratoModal, setShowContratoModal] = useState(false);
  const [selectedAlumno, setSelectedAlumno] = useState(null);
  const [isGeneratingContract, setIsGeneratingContract] = useState(false);
  const [contractModal, setContractModal] = useState({
    isOpen: false,
    type: '', // 'confirm' | 'success' | 'error'
    alumno: null,
    message: '',
    details: ''
  });

  // ============= INTEGRACIÓN CON ADMINCONTEXT =============
  
  // AdminContext.jsx proporciona TODAS las funciones para pagos y contratos:
  // - paymentsData: datos de pagos cargados desde el contexto
  // - isLoading: estado de carga del contexto
  // - error: errores del contexto
  // - lastUpdated: timestamp de última actualización
  // - loadPaymentsData(curso, turno): cargar pagos por curso/turno
  // - approvePayment(paymentId): aprobar un pago
  // - rejectPayment(paymentId, reason): rechazar un pago
  // - generateContract(paymentId, contractData): generar contrato PDF
  // - uploadContract(paymentId, file): subir contrato firmado
  const { 
    paymentsData,        // ← AdminContext.jsx datos de pagos
    isLoading,           // ← AdminContext.jsx estado de carga
    error,               // ← AdminContext.jsx errores
    lastUpdated,         // ← AdminContext.jsx timestamp actualización
    loadPaymentsData,    // ← AdminContext.jsx función cargar pagos
    approvePayment,      // ← AdminContext.jsx función aprobar pago
    rejectPayment,       // ← AdminContext.jsx función rechazar pago
    generateContract,    // ← AdminContext.jsx función generar contrato
    uploadContract       // ← AdminContext.jsx función subir contrato
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
    'EEAU': [
      { id: 1, nombre: 'V1', tipo: 'vespertino', capacidad: 10, alumnosActuales: 8 },
      { id: 2, nombre: 'V2', tipo: 'vespertino', capacidad: 10, alumnosActuales: 5 },
      { id: 3, nombre: 'M1', tipo: 'matutino', capacidad: 15, alumnosActuales: 12 }
    ],
    'EEAP': [
      { id: 4, nombre: 'V1', tipo: 'vespertino', capacidad: 12, alumnosActuales: 9 },
      { id: 5, nombre: 'S1', tipo: 'sabatino', capacidad: 20, alumnosActuales: 15 }
    ],
    'DIGI-START': [
      { id: 6, nombre: 'V1', tipo: 'vespertino', capacidad: 8, alumnosActuales: 6 },
      { id: 7, nombre: 'M1', tipo: 'matutino', capacidad: 10, alumnosActuales: 7 }
    ],
    'MINDBRIDGE': [
      { id: 8, nombre: 'V1', tipo: 'vespertino', capacidad: 6, alumnosActuales: 4 }
    ],
    'SPEAKUP': [
      { id: 9, nombre: 'V1', tipo: 'vespertino', capacidad: 8, alumnosActuales: 6 },
      { id: 10, nombre: 'V2', tipo: 'vespertino', capacidad: 8, alumnosActuales: 3 }
    ],
    'PCE': [
      { id: 11, nombre: 'M1', tipo: 'matutino', capacidad: 12, alumnosActuales: 10 },
      { id: 12, nombre: 'S1', tipo: 'sabatino', capacidad: 15, alumnosActuales: 8 }
    ]
  });

  // ==================== UTILIDADES ====================
  
  // Obtiene los grupos disponibles para el curso seleccionado
  const getGruposDisponibles = () => {
    return gruposPorCurso[activeCategory] || [];
  };

  const fetchPagos = async () => {
    if (!activeCategory || !activeTurno) return;
    
    try {
      // ✅ INTEGRACIÓN CON ADMINCONTEXT - Los datos vienen del contexto
      // AdminContext.jsx maneja loadPaymentsData(curso, turno) con datos mock
      // En producción, AdminContext hará las llamadas HTTP reales
      
      // TODO: USAR ADMINCONTEXT EN LUGAR DE MOCK - DESCOMENTAR EN PRODUCCIÓN
      // const data = await loadPaymentsData(activeCategory, activeTurno);
      // setPagos(data || []);
      
      // ⚠️ TEMPORAL: Usar datos mock hasta que AdminContext esté conectado
      // Simular delay del backend (esto se quita en producción)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // DATOS MOCK PARA PRUEBAS - Solo alumnos APROBADOS que necesitan contratos
      const todosMockPagos = [
        // EEAU - V1
        {
          id: 1,
          folio: "MQEEAU-2025-0001",
          alumno: "María González López",
          correoElectronico: "maria.gonzalez@email.com",
          telefono: "555-0101",
          direccion: "Av. Principal 123, Col. Centro",
          fechaNacimiento: "1995-03-15",
          identificacion: "INE123456789",
          categoria: "EEAU",
          turno: "V1",
          planCurso: "Plan Básico - 6 meses",
          pagoCurso: "$1,500.00",
          metodoPago: "Transferencia bancaria",
          fechaEntrada: "2024-07-29",
          comprobanteUrl: "/src/assets/comprobante-pago-MQ-20250729-0001.pdf",
          contratoUrl: null, // Sin contrato aún
          estado: "aprobado"
        },
        {
          id: 2,
          folio: "MQEEAU-2025-0002", 
          alumno: "Carlos Hernández Ruiz",
          correoElectronico: "carlos.hernandez@email.com",
          telefono: "555-0102",
          direccion: "Calle Secundaria 456, Col. Norte",
          fechaNacimiento: "1992-08-22",
          identificacion: "INE987654321",
          categoria: "EEAU",
          turno: "V1",
          planCurso: "Plan Básico - 6 meses",
          pagoCurso: "$1,500.00",
          metodoPago: "Tarjeta de crédito",
          fechaEntrada: "2024-07-28",
          comprobanteUrl: "/src/assets/comprobante-pago-MQ-20250729-0001.png",
          contratoUrl: "/src/assets/contrato-firmado-carlos.pdf", // Ya tiene contrato subido
          estado: "aprobado"
        },
        // EEAU - V2
        {
          id: 3,
          folio: "MQEEAU-2025-0003",
          alumno: "Ana Patricia Morales",
          correoElectronico: "ana.morales@email.com", 
          telefono: "555-0103",
          direccion: "Blvd. Sur 789, Col. Jardines",
          fechaNacimiento: "1988-12-10",
          identificacion: "INE456789123",
          categoria: "EEAU",
          turno: "V2",
          planCurso: "Plan Básico - 6 meses",
          pagoCurso: "$1,500.00",
          metodoPago: "Depósito en efectivo",
          fechaEntrada: "2024-07-27",
          comprobanteUrl: "/src/assets/comprobante-pago-MQ-20250729-0001.pdf",
          contratoUrl: null, // Sin contrato aún
          estado: "aprobado"
        },
        // EEAP - V1
        {
          id: 4,
          folio: "MQEEAP-2025-0001",
          alumno: "Roberto Silva Mendoza",
          correoElectronico: "roberto.silva@email.com",
          telefono: "555-0201",
          direccion: "Av. Universidad 321, Col. Educación",
          fechaNacimiento: "1990-05-18",
          identificacion: "INE789123456",
          categoria: "EEAP",
          turno: "V1",
          planCurso: "Plan Avanzado - 8 meses",
          pagoCurso: "$1,800.00",
          metodoPago: "Transferencia bancaria",
          fechaEntrada: "2024-07-26",
          comprobanteUrl: "/src/assets/comprobante-pago-MQ-20250729-0001.pdf",
          contratoUrl: "/src/assets/contrato-firmado-roberto.pdf", // Ya tiene contrato subido
          estado: "aprobado"
        },
        // DIGI-START - V1
        {
          id: 5,
          folio: "MQDIGI-2025-0001",
          alumno: "Lucía Rodríguez Tech",
          correoElectronico: "lucia.rodriguez@email.com",
          telefono: "555-0301",
          direccion: "Calle Innovación 147, Col. Tecnológica",
          fechaNacimiento: "1994-09-03",
          identificacion: "INE321654987",
          categoria: "DIGI-START",
          turno: "V1",
          planCurso: "Plan Digital - 4 meses",
          pagoCurso: "$2,200.00",
          metodoPago: "Tarjeta de crédito",
          fechaEntrada: "2024-07-25",
          comprobanteUrl: "/src/assets/comprobante-pago-MQ-20250729-0001.png",
          contratoUrl: null, // Sin contrato aún
          estado: "aprobado"
        },
        // MINDBRIDGE - V1
        {
          id: 6,
          folio: "MQMIND-2025-0001",
          alumno: "Eduardo Morales Mind",
          correoElectronico: "eduardo.morales@email.com",
          telefono: "555-0401",
          direccion: "Av. Psicología 258, Col. Mental",
          fechaNacimiento: "1987-11-14",
          identificacion: "INE654987321",
          categoria: "MINDBRIDGE",
          turno: "V1",
          planCurso: "Plan Psicológico - 3 meses",
          pagoCurso: "$1,200.00",
          metodoPago: "Depósito en efectivo",
          fechaEntrada: "2024-07-24",
          comprobanteUrl: "/src/assets/comprobante-pago-MQ-20250729-0001.pdf",
          contratoUrl: null, // Sin contrato aún
          estado: "aprobado"
        },
        // SPEAKUP - V1
        {
          id: 7,
          folio: "MQSPEAK-2025-0001",
          alumno: "Carmen Jiménez Speak",
          correoElectronico: "carmen.jimenez@email.com",
          telefono: "555-0501",
          direccion: "Calle Oratoria 369, Col. Comunicación",
          fechaNacimiento: "1991-07-08",
          identificacion: "INE147258369",
          categoria: "SPEAKUP",
          turno: "V1",
          planCurso: "Plan Conversacional - 5 meses",
          pagoCurso: "$1,700.00",
          metodoPago: "Transferencia bancaria",
          fechaEntrada: "2024-07-23",
          comprobanteUrl: "/src/assets/comprobante-pago-MQ-20250729-0001.png",
          contratoUrl: "/src/assets/contrato-firmado-carmen.pdf", // Ya tiene contrato subido
          estado: "aprobado"
        },
        // PCE - M1
        {
          id: 8,
          folio: "MQPCE-2025-0001",
          alumno: "Fernando Vargas Prep",
          correoElectronico: "fernando.vargas@email.com",
          telefono: "555-0601",
          direccion: "Blvd. Preparatoria 741, Col. Académica",
          fechaNacimiento: "1993-04-25",
          identificacion: "INE963852741",
          categoria: "PCE",
          turno: "M1",
          planCurso: "Plan Certificación - 7 meses",
          pagoCurso: "$2,500.00",
          metodoPago: "Tarjeta de crédito",
          fechaEntrada: "2024-07-22",
          comprobanteUrl: "/src/assets/comprobante-pago-MQ-20250729-0001.pdf",
          contratoUrl: null, // Sin contrato aún
          estado: "aprobado"
        }
      ];
      
      // Filtrar por curso y turno seleccionado
      const mockPagosFiltrados = todosMockPagos.filter(pago => 
        pago.categoria === activeCategory && pago.turno === activeTurno
      );
      
      setPagos(mockPagosFiltrados);
      
    } catch (err) {
      console.error('Error cargando pagos:', err);
      setPagos([]);
    }
  };

  // ✅ CARGAR PAGOS CUANDO SE SELECCIONAN CURSO Y TURNO (ADMINCONTEXT)
  useEffect(() => {
    if (activeCategory && activeTurno) {
      // fetchPagos usa datos mock temporales
      // En producción, esta función debería usar loadPaymentsData del AdminContext
      fetchPagos();
    }
  }, [activeCategory, activeTurno]);

  // TODO: IMPLEMENTAR - Cargar datos dinámicos desde el backend usando AdminContext
  useEffect(() => {
    // ✅ INTEGRACIÓN CON ADMINCONTEXT - Esta función debe usar AdminContext
    // En lugar de llamadas HTTP directas, usar las funciones del contexto
    // AdminContext.jsx maneja toda la lógica de carga de datos
    
    const loadInitialData = async () => {
      try {
        // TODO: USAR ADMINCONTEXT PARA CARGAR GRUPOS
        // Ejemplo: const grupos = await loadCourseGroups();
        // setGruposPorCurso(grupos);
        
        // MOCK TEMPORAL - Los grupos vienen hardcodeados arriba
        // En producción, descomentar estas líneas y usar AdminContext:
        //   if (loadCourseGroups && typeof loadCourseGroups === 'function') {
        //     const gruposResponse = await loadCourseGroups();
        //     setGruposPorCurso(gruposResponse);
        //   }
        
        console.log('📦 Datos iniciales cargados (mock temporal)');
      } catch (error) {
        console.error('Error loading initial data:', error);
        setError('Error al cargar datos iniciales');
      }
    };
    
    // loadInitialData(); // Descomentar cuando AdminContext tenga loadCourseGroups
  }, []);

  // TODO: IMPLEMENTAR - Cargar grupos cuando se selecciona un curso
  useEffect(() => {
    if (activeCategory) {
      // IMPLEMENTAR ESTA LLAMADA AL BACKEND 
      
      // const loadGruposForCurso = async () => {
      //     try {
      //         const response = await api.get(`/api/cursos/${activeCategory}/grupos`);
      //         setGruposPorCurso(prev => ({
      //             ...prev,
      //             [activeCategory]: response.data
      //         }));
      //     } catch (error) {
      //         console.error(`Error cargando grupos para ${activeCategory}:`, error);
      //     }
      // };
      
      // loadGruposForCurso();
    }
  }, [activeCategory]);

  // Auto-ocultar overlay tras 2s para simular la carga inicial
  useEffect(() => {
    if (!showLoadingScreen) return;
    const t = setTimeout(() => setShowLoadingScreen(false), 2000);
    return () => clearTimeout(t);
  }, [showLoadingScreen]);

  const handleRefreshData = async () => {
    if (activeCategory && activeTurno) {
      await fetchPagos();
    }
  };

  // ==================== FUNCIONES DEL MODAL DE CONTRATOS ====================
  
  // Cerrar modal de contratos
  const closeContractModal = () => {
    setContractModal({
      isOpen: false,
      type: '',
      alumno: null,
      message: '',
      details: ''
    });
    setIsGeneratingContract(false);
  };

  // Abrir modal de confirmación para generar contrato
  const openContractModal = (alumno) => {
    setContractModal({
      isOpen: true,
      type: 'confirm',
      alumno: alumno,
      message: 'Generar Contrato desde Plantilla Oficial',
      details: `Se generará el contrato usando la plantilla PDF oficial de MQERK con los datos del estudiante ${alumno.alumno}.`
    });
  };

  // Confirmar generación de contrato
  const confirmGenerateContract = async () => {
    return handleConfirmarGeneracionContrato();
  };

  // Modal de error general
  const showErrorModal = (message, details = '') => {
    setContractModal({
      isOpen: true,
      type: 'error',
      alumno: null,
      message: message,
      details: details
    });
  };

  // Filtrar pagos según categoría, turno y búsqueda
  const pagosFiltrados = pagos.filter(pago => {
    const matchCategory = !activeCategory || pago.categoria === activeCategory;
    const matchTurno = !activeTurno || pago.turno === activeTurno;
    const matchSearch = !searchTerm || 
      pago.alumno.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pago.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pago.correoElectronico?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchCategory && matchTurno && matchSearch;
  });

  // Función para manejar la selección de categoría
  const handleCategorySelect = (categoria) => {
    if (activeCategory === categoria) {
      setActiveCategory(null);
      setActiveTurno(null);
    } else {
      setActiveCategory(categoria);
      setActiveTurno(null); // Reset turno al cambiar curso
    }
  };

  // Función para manejar la selección de turno
  const handleTurnoSelect = (turno) => {
    if (turno === activeTurno) {
      setActiveTurno(null);
    } else {
      setActiveTurno(turno);
    }
  };

  // Función para generar contrato usando la plantilla PDF oficial
  const generarContratoDesdePlantilla = async (alumno) => {
    try {
      console.log('🔄 Generando contrato desde plantilla oficial para:', alumno.alumno);
      
      // Usar el nuevo servicio de generación de contratos
      const resultado = await generarYDescargarContrato(alumno);
      
      console.log('✅ Contrato generado exitosamente:', resultado.nombreArchivo);
      return resultado.url;
      
    } catch (error) {
      console.error('❌ Error al generar contrato:', error);
      throw new Error(error.message || 'Error al generar el contrato desde la plantilla oficial');
    }
  };

  // Función para generar PDF de calibración (herramienta de desarrollo)
  const generarPDFDeCalibracion = async () => {
    try {
      console.log('🔧 Generando PDF de calibración...');
      await generarPDFCalibracion();
      console.log('✅ PDF de calibración descargado');
    } catch (error) {
      console.error('❌ Error en calibración:', error);
      alert('Error al generar PDF de calibración: ' + error.message);
    }
  };

  // ==================== FUNCIONES DE INTEGRACIÓN CON ADMINCONTEXT ====================
  
  // FUNCIONES PARA GESTIÓN DE CONTRATOS - LISTAS PARA USAR
  // generateContract y uploadContract vienen directamente del AdminContext.jsx
  // Estas funciones YA están conectadas con el backend (actualmente con mocks)
  
  // Función para generar contrato usando AdminContext
  const handleGenerarContrato = async (id) => {
    try {
      // Encontrar el alumno por ID
      const alumno = pagos.find(p => p.id === id);
      if (!alumno) {
        showErrorModal('Error', 'No se encontró el alumno');
        return;
      }

      // Validar que los datos estén completos
      if (!alumno.alumno || !alumno.categoria || !alumno.planCurso || !alumno.pagoCurso) {
        showErrorModal('Error', 'Faltan datos del alumno para generar el contrato');
        return;
      }

      // ✅ INTEGRACIÓN CON ADMINCONTEXT
      // generateContract está disponible desde useAdminContext()
      if (generateContract && typeof generateContract === 'function') {
        // Abrir modal de confirmación - el contrato se genera en handleConfirmarGeneracionContrato
        openContractModal(alumno);
      } else {
        throw new Error('Función generateContract no disponible en AdminContext');
      }
      
      console.log('🔄 Preparando generación de contrato para pago:', id, '(AdminContext)');
    } catch (error) {
      console.error('Error al generar contrato:', error);
      showErrorModal('Error', 'Error al generar el contrato. Inténtalo de nuevo.');
    }
  };

  // Función para confirmar la generación de contrato usando AdminContext
  const handleConfirmarGeneracionContrato = async () => {
    setIsGeneratingContract(true);
    
    try {
      // Obtener el alumno del modal actual
      const alumnoCompleto = contractModal.alumno;
      
      // Cerrar modal de confirmación
      setContractModal({ isOpen: false, type: '', alumno: null, message: '', details: '' });
      
      // ✅ USAR ADMINCONTEXT PARA GENERAR CONTRATO
      // generateContract viene del AdminContext.jsx y maneja la generación del PDF
      const contractData = {
        alumno: alumnoCompleto.alumno,
        folio: alumnoCompleto.folio,
        curso: alumnoCompleto.categoria,
        turno: alumnoCompleto.turno,
        plan: alumnoCompleto.planCurso,
        pago: alumnoCompleto.pagoCurso
      };
      
      const result = await generateContract(alumnoCompleto.id, contractData);
      
      if (result && result.success) {
        // Actualizar el estado local con la URL del contrato generado
        setPagos(pagos.map(pago => 
          pago.id === alumnoCompleto.id ? { 
            ...pago, 
            contratoGenerado: true, 
            contratoUrl: result.contractUrl 
          } : pago
        ));

        // Mostrar modal de éxito
        setContractModal({
          isOpen: true,
          type: 'success',
          alumno: alumnoCompleto,
          message: '¡Contrato PDF Generado Exitosamente!',
          details: `El contrato para ${alumnoCompleto.alumno} se ha generado correctamente usando AdminContext. Ahora puedes imprimirlo, hacerlo firmar y subirlo usando el botón "Subir".`
        });
      } else {
        throw new Error('No se pudo generar el contrato desde AdminContext');
      }
      
    } catch (pdfError) {
      console.error('Error específico en generación PDF:', pdfError);
      
      // Mostrar modal de error
      setContractModal({
        isOpen: true,
        type: 'error',
        alumno: contractModal.alumno,
        message: 'Error al Generar el PDF',
        details: `No se pudo crear el contrato PDF para ${contractModal.alumno?.alumno}. Error: ${pdfError.message}`
      });
    }
    
    setIsGeneratingContract(false);
  };

  // Función para subir contrato firmado usando AdminContext
  const handleSubirContrato = async (id, file) => {
    try {
      if (!file) {
        showErrorModal('Error de Archivo', 'Por favor selecciona un archivo PDF para subir.');
        return;
      }

      // Validar que sea un archivo PDF
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        showErrorModal('Tipo de Archivo Incorrecto', 'Solo se permiten archivos PDF. Por favor selecciona un archivo .pdf');
        return;
      }

      // Validar tamaño del archivo (máximo 10MB) 
      // esta es una de las tantas formas que hay para establecer un tamaño máximo de archivo
      // y evitar que suban archivos demasiado grandes vale
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        showErrorModal('Archivo Demasiado Grande', 'El archivo es demasiado grande. El tamaño máximo permitido es 10MB.');
        return;
      }

      // Encontrar el alumno
      const alumno = pagos.find(p => p.id === id);
      if (!alumno) {
        showErrorModal('Error', 'No se encontró el alumno');
        return;
      }

      // ✅ USAR ADMINCONTEXT PARA SUBIR CONTRATO
      // uploadContract viene del AdminContext.jsx y maneja la subida del archivo
      if (uploadContract && typeof uploadContract === 'function') {
        const result = await uploadContract(id, file);
        
        if (result && result.success) {
          // Actualizar el estado local con la información del archivo subido
          setPagos(pagos.map(pago => 
            pago.id === id ? { 
              ...pago, 
              contratoSubido: true, 
              contratoUrl: result.uploadedUrl,
              nombreArchivoSubido: file.name,
              fechaSubida: new Date().toISOString()
            } : pago
          ));

          // Mostrar modal de éxito
          setContractModal({
            isOpen: true,
            type: 'success',
            alumno: alumno,
            message: '¡Contrato Subido Exitosamente!',
            details: `El archivo "${file.name}" se ha subido correctamente usando AdminContext y ya está disponible para ${alumno.alumno} en su dashboard.`
          });
        } else {
          throw new Error('No se pudo subir el contrato desde AdminContext');
        }
      } else {
        // FALLBACK TEMPORAL: Usar simulación mock si AdminContext no está disponible
        console.warn('⚠️ uploadContract no disponible en AdminContext, usando mock temporal');
        
        // Simular subida del archivo creando una URL temporal
        const fileUrl = URL.createObjectURL(file);
        
        // Actualizar el estado
        setPagos(pagos.map(pago => 
          pago.id === id ? { 
            ...pago, 
            contratoSubido: true, 
            contratoUrl: fileUrl,
            nombreArchivoSubido: file.name,
            fechaSubida: new Date().toISOString()
          } : pago
        ));

        // Mostrar modal de éxito  
        setContractModal({
          isOpen: true,
          type: 'success',
          alumno: alumno,
          message: '¡Contrato Subido Exitosamente!',
          details: `El archivo "${file.name}" se ha subido correctamente usando mock temporal y ya está disponible para ${alumno.alumno} en su dashboard.`
        });
      }
      
      console.log('📤 Subir contrato para pago:', id, 'Archivo:', file?.name, '(AdminContext)');
    } catch (error) {
      console.error('Error al subir contrato:', error);
      showErrorModal('Error al Subir', 'Error al subir el contrato. Inténtalo de nuevo.');
    }
  };

  const handleVisualizarContrato = (url, alumno) => {
    try {
      if (!url) {
        showErrorModal('Sin Contrato', 'No hay contrato disponible para visualizar.');
        return;
      }

      // Abrir la modal con el PDF
      setModalPDF({
        isOpen: true,
        url: url,
        alumno: alumno,
        tipo: 'contrato'
      });
      
      console.log('Visualizar contrato en modal:', url);
    } catch (error) {
      console.error('Error al visualizar contrato:', error);
      showErrorModal('Error al Visualizar', 'Error al abrir el contrato. Inténtalo de nuevo.');
    }
  };

  const handleVisualizarComprobante = (url, alumno) => {
    try {
      if (!url) {
        showErrorModal('Sin Comprobante', 'No hay comprobante disponible para visualizar.');
        return;
      }

      // Abrir la modal con el comprobante
      setModalPDF({
        isOpen: true,
        url: url,
        alumno: alumno,
        tipo: 'comprobante'
      });
      
      console.log('Visualizar comprobante en modal:', url);
    } catch (error) {
      console.error('Error al visualizar comprobante:', error);
      showErrorModal('Error al Visualizar', 'Error al abrir el comprobante. Inténtalo de nuevo.');
    }
  };

  // Función para aprobar pago usando AdminContext
  const handleAprobarPago = async (id) => {
    try {
      // ✅ USAR ADMINCONTEXT PARA APROBAR PAGO
      // approvePayment viene del AdminContext.jsx y maneja la aprobación
      if (approvePayment && typeof approvePayment === 'function') {
        const result = await approvePayment(id);
        
        if (result && result.success) {
          console.log('✅ Pago aprobado exitosamente:', id, '(AdminContext)');
          // Recargar datos si es necesario
          if (activeCategory && activeTurno) {
            await fetchPagos();
          }
        } else {
          throw new Error('No se pudo aprobar el pago desde AdminContext');
        }
      } else {
        console.warn('⚠️ approvePayment no disponible en AdminContext');
        console.log('📝 Aprobar pago (mock):', id);
      }
    } catch (error) {
      console.error('Error al aprobar pago:', error);
    }
  };

  // Función para rechazar pago usando AdminContext
  const handleRechazarPago = async (id) => {
    try {
      // ✅ USAR ADMINCONTEXT PARA RECHAZAR PAGO  
      // rejectPayment viene del AdminContext.jsx y maneja el rechazo
      if (rejectPayment && typeof rejectPayment === 'function') {
        const reason = prompt('Ingrese la razón del rechazo:');
        if (reason) {
          const result = await rejectPayment(id, reason);
          
          if (result && result.success) {
            console.log('❌ Pago rechazado exitosamente:', id, '(AdminContext)');
            // Recargar datos si es necesario
            if (activeCategory && activeTurno) {
              await fetchPagos();
            }
          } else {
            throw new Error('No se pudo rechazar el pago desde AdminContext');
          }
        }
      } else {
        console.warn('⚠️ rejectPayment no disponible en AdminContext');
        console.log('📝 Rechazar pago (mock):', id);
      }
    } catch (error) {
      console.error('Error al rechazar pago:', error);
    }
  };

  // Carga inicial: overlay en capa, no reemplaza la vista

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
    <div className="w-full h-full min-h-[calc(100vh-80px)] flex flex-col bg-white">
      {(showLoadingScreen || isLoading) && (
        <LoadingOverlay message={showLoadingScreen ? "Cargando validación de pagos..." : "Cargando..."} />
      )}
      {/* Header con filtros optimizado */}
      <div className="pt-2 xs:pt-4 sm:pt-6 pb-2 xs:pb-3 sm:pb-4 px-2 xs:px-4 sm:px-6">
        <div className="w-full max-w-7xl mx-auto">
          {/* Título principal */}
          <div className="text-center mb-4 xs:mb-6 sm:mb-8">
            <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 xs:mb-2 px-2">
              Generar Contratos
            </h1>
            <div className="w-8 xs:w-12 sm:w-16 lg:w-20 h-0.5 xs:h-1 bg-gradient-to-r from-blue-500/80 to-indigo-500/80 mx-auto mb-2 rounded-full"></div>
            <p className="text-xs xs:text-sm sm:text-base text-gray-600 px-4">
              Gestiona la generación de contratos de los estudiantes por curso y turno
            </p>
            
            {/* Información de actualización y refresh */}
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
                <button
                  onClick={generarPDFDeCalibracion}
                  className="ml-2 text-purple-600 hover:text-purple-700 transition-colors"
                  title="Generar PDF de calibración para ajustar coordenadas"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </button>
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
                      onClick={() => handleTurnoSelect(grupo.nombre)}
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

          {/* Información del grupo seleccionado */}
          {activeCategory && activeTurno && (
            <div className="mb-4 xs:mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 xs:px-6 sm:px-8 py-4 xs:py-5 sm:py-6 rounded-lg xs:rounded-xl sm:rounded-2xl shadow-lg">
                <div className="text-center">
                  <p className="text-sm xs:text-base sm:text-lg md:text-xl font-semibold mb-1 xs:mb-2">
                    Grupo Activo: {activeCategory} - {activeTurno}
                  </p>
                  <p className="text-xs xs:text-sm sm:text-base text-blue-100">
                    Validando pagos del grupo seleccionado
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Barra de búsqueda - Solo se muestra cuando ambos filtros están activos */}
          {activeCategory && activeTurno && (
            <div className="mb-4 xs:mb-6">
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg xs:rounded-xl p-3 xs:p-4 shadow-lg border border-gray-200">
                <div className="max-w-sm xs:max-w-md mx-auto">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar por nombre, folio o correo..."
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
          )}
        </div>
      </div>

      {/* Contenido principal de la tabla */}
      <div className="flex-1 px-2 xs:px-4 sm:px-6 pb-4 xs:pb-6">
        <div className="w-full max-w-7xl mx-auto">
          {/* Contenido Principal */}
          {!activeCategory ? (
            // Estado inicial - Seleccionar categoría
            <div className="text-center py-8 xs:py-12 bg-gradient-to-br from-gray-50 to-white rounded-lg xs:rounded-xl shadow-lg border border-gray-200">
              <div className="max-w-xs xs:max-w-md mx-auto px-4">
                <svg className="mx-auto h-12 xs:h-16 w-12 xs:w-16 text-purple-400 mb-3 xs:mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-lg xs:text-xl font-bold text-gray-800 mb-1 xs:mb-2">
                  Selecciona un Curso
                </h3>
                <p className="text-xs xs:text-base text-gray-600 mb-3 xs:mb-4">
                  Para ver los pagos y contratos, primero selecciona un curso de la lista anterior.
                </p>
               
              </div>
            </div>
          ) : !activeTurno ? (
            // Categoría seleccionada, falta turno
            <div className="text-center py-8 xs:py-12 bg-gradient-to-br from-gray-50 to-white rounded-lg xs:rounded-xl shadow-lg border border-gray-200">
              <div className="max-w-xs xs:max-w-md mx-auto px-4">
                <svg className="mx-auto h-12 xs:h-16 w-12 xs:w-16 text-purple-400 mb-3 xs:mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg xs:text-xl font-bold text-gray-800 mb-1 xs:mb-2">
                  Selecciona un Turno
                </h3>
                <p className="text-xs xs:text-base text-gray-600 mb-3 xs:mb-4">
                  Ahora selecciona un turno para ver los pagos y contratos de <span className="font-medium">{activeCategory}</span>.
                </p>
               
              </div>
            </div>
          ) : (
            // Ambos filtros activos - Mostrar contenido
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg xs:rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Header con gradiente como en ListaAlumnos */}
              <div className="px-3 xs:px-4 sm:px-6 py-3 xs:py-4 border-b border-gray-200 bg-gradient-to-r from-gray-100 to-gray-50">
                <h3 className="text-base xs:text-lg sm:text-xl font-bold text-gray-800">
                  Pagos y contratos - {activeCategory}
                </h3>
                <p className="text-xs xs:text-sm text-gray-600 mt-1">
                  {activeTurno} • {pagosFiltrados.length} {pagosFiltrados.length === 1 ? 'registro' : 'registros'}
                </p>
              </div>
            
              {/* Vista Desktop - Tabla responsive */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-100 to-gray-50">
                    <tr>
                      <th className="px-1 xs:px-2 sm:px-4 py-2 xs:py-3 text-left text-[10px] xs:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                        Folio
                      </th>
                      <th className="px-1 xs:px-2 sm:px-4 py-2 xs:py-3 text-left text-[10px] xs:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                        Alumno
                      </th>
                      <th className="px-1 xs:px-2 sm:px-4 py-2 xs:py-3 text-left text-[10px] xs:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                        Fecha
                      </th>
                      <th className="px-1 xs:px-2 sm:px-4 py-2 xs:py-3 text-left text-[10px] xs:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                        Plan
                      </th>
                      <th className="px-1 xs:px-2 sm:px-4 py-2 xs:py-3 text-left text-[10px] xs:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                        Pago
                      </th>
                      <th className="px-1 xs:px-2 sm:px-4 py-2 xs:py-3 text-left text-[10px] xs:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                        Método
                      </th>
                      <th className="px-1 xs:px-2 sm:px-4 py-2 xs:py-3 text-center text-[10px] xs:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                        Contrato
                      </th>
                      <th className="px-1 xs:px-2 sm:px-4 py-2 xs:py-3 text-center text-[10px] xs:text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                        Subir
                      </th>
                      <th className="px-1 xs:px-2 sm:px-4 py-2 xs:py-3 text-center text-[10px] xs:text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Visualizar
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pagosFiltrados.map((pago, index) => (
                      <tr key={pago.id} className={`transition-colors duration-150 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                        <td className="px-1 xs:px-2 sm:px-4 py-2 xs:py-3 border-r border-gray-200">
                          <div className="text-center">
                            <div className="text-[10px] xs:text-xs sm:text-sm font-bold text-purple-600 bg-purple-100 px-1 xs:px-2 py-0.5 xs:py-1 rounded-md xs:rounded-lg">
                              {pago.folio}
                            </div>
                          </div>
                        </td>
                        <td className="px-1 xs:px-2 sm:px-4 py-2 xs:py-3 border-r border-gray-200">
                          <div className="flex items-start space-x-1 xs:space-x-2 sm:space-x-3">
                            <div className="flex-shrink-0">
                              <div className="h-6 xs:h-8 sm:h-10 w-6 xs:w-8 sm:w-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
                                <span className="text-[8px] xs:text-[10px] sm:text-sm font-bold text-white">
                                  {pago.alumno.split(' ').map(n => n.charAt(0)).join('').substring(0, 2)}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[10px] xs:text-xs sm:text-sm font-semibold text-gray-900 truncate">
                                {pago.alumno}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-1 xs:px-2 sm:px-4 py-2 xs:py-3 border-r border-gray-200 text-[8px] xs:text-[10px] sm:text-xs text-gray-700">
                          {pago.fechaEntrada}
                        </td>
                        <td className="px-1 xs:px-2 sm:px-4 py-2 xs:py-3 border-r border-gray-200 text-[8px] xs:text-[10px] sm:text-xs text-gray-700">
                          {pago.planCurso}
                        </td>
                        <td className="px-1 xs:px-2 sm:px-4 py-2 xs:py-3 border-r border-gray-200">
                          <span className="text-[8px] xs:text-[10px] sm:text-xs font-semibold text-green-700 bg-green-50 px-1 xs:px-2 py-0.5 xs:py-1 rounded-md">
                            {pago.pagoCurso}
                          </span>
                        </td>
                        <td className="px-1 xs:px-2 sm:px-4 py-2 xs:py-3 border-r border-gray-200 text-[8px] xs:text-[10px] sm:text-xs text-gray-700">
                          {pago.metodoPago}
                        </td>
                        <td className="px-1 xs:px-2 sm:px-4 py-2 xs:py-3 border-r border-gray-200 text-center">
                          {pago.contratoGenerado ? (
                            <button
                              onClick={() => handleVisualizarContrato(pago.contratoUrl, pago)}
                              className="inline-flex items-center px-1 xs:px-2 sm:px-3 py-0.5 xs:py-1 sm:py-2 bg-green-600 text-white text-[8px] xs:text-[10px] sm:text-xs font-medium rounded-md hover:bg-green-700 transition-colors duration-150"
                            >
                              <svg className="w-2 xs:w-3 sm:w-4 h-2 xs:h-3 sm:h-4 mr-0.5 xs:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Descargar
                            </button>
                          ) : (
                            <button
                              onClick={() => handleGenerarContrato(pago.id)}
                              className="inline-flex items-center px-1 xs:px-2 sm:px-3 py-0.5 xs:py-1 sm:py-2 bg-gray-700 text-white text-[8px] xs:text-[10px] sm:text-xs font-medium rounded-md hover:bg-gray-800 transition-colors duration-150"
                            >
                              <svg className="w-2 xs:w-3 sm:w-4 h-2 xs:h-3 sm:h-4 mr-0.5 xs:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Generar
                            </button>
                          )}
                        </td>
                        <td className="px-1 xs:px-2 sm:px-4 py-2 xs:py-3 border-r border-gray-200 text-center">
                          {pago.contratoSubido ? (
                            <div className="inline-flex items-center px-1 xs:px-2 sm:px-3 py-0.5 xs:py-1 sm:py-2 bg-green-100 text-green-700 text-[8px] xs:text-[10px] sm:text-xs font-medium rounded-md border border-green-200">
                              <svg className="w-2 xs:w-3 sm:w-4 h-2 xs:h-3 sm:h-4 mr-0.5 xs:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Subido
                            </div>
                          ) : (
                            <label className="inline-flex items-center px-1 xs:px-2 sm:px-3 py-0.5 xs:py-1 sm:py-2 bg-blue-600 text-white text-[8px] xs:text-[10px] sm:text-xs font-medium rounded-md hover:bg-blue-700 transition-colors duration-150 cursor-pointer">
                              <svg className="w-2 xs:w-3 sm:w-4 h-2 xs:h-3 sm:h-4 mr-0.5 xs:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              Subir
                              <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleSubirContrato(pago.id, e.target.files[0])} />
                            </label>
                          )}
                        </td>
                        <td className="px-1 xs:px-2 sm:px-4 py-2 xs:py-3 text-center">
                          <div className="flex flex-col items-center space-y-1">
                            {/* Botón para ver comprobante */}
                            <button
                              onClick={() => handleVisualizarComprobante(pago.comprobanteUrl, pago)}
                              className="inline-flex items-center px-1 xs:px-2 sm:px-3 py-0.5 xs:py-1 sm:py-2 bg-blue-600 text-white text-[8px] xs:text-[10px] sm:text-xs font-medium rounded-md hover:bg-blue-700 transition-colors duration-150"
                            >
                              <svg className="w-2 xs:w-3 sm:w-4 h-2 xs:h-3 sm:h-4 mr-0.5 xs:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Comprobante
                            </button>
                            
                            {/* Botón para ver contrato */}
                            {pago.contratoSubido ? (
                              <button
                                onClick={() => handleVisualizarContrato(pago.contratoUrl, pago)}
                                className="inline-flex items-center px-1 xs:px-2 sm:px-3 py-0.5 xs:py-1 sm:py-2 bg-indigo-600 text-white text-[8px] xs:text-[10px] sm:text-xs font-medium rounded-md hover:bg-indigo-700 transition-colors duration-150"
                              >
                                <svg className="w-2 xs:w-3 sm:w-4 h-2 xs:h-3 sm:h-4 mr-0.5 xs:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Contrato
                              </button>
                            ) : (
                              <div className="inline-flex items-center px-1 xs:px-2 sm:px-3 py-0.5 xs:py-1 sm:py-2 bg-gray-200 text-gray-500 text-[8px] xs:text-[10px] sm:text-xs font-medium rounded-md">
                                <svg className="w-2 xs:w-3 sm:w-4 h-2 xs:h-3 sm:h-4 mr-0.5 xs:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                </svg>
                                Sin contrato
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
              </table>
            </div>

            {/* Vista móvil - Cards con sombras pronunciadas */}
            <div className="lg:hidden bg-gradient-to-br from-gray-50 via-white to-gray-50">
              <div className="space-y-4 p-4">
                {pagosFiltrados.map((pago, index) => (
                  <div key={pago.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 space-y-4 hover:shadow-xl transition-shadow duration-300">
                    {/* Header de la card */}
                    <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg shadow-sm">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{pago.folio}</span>
                      </div>
                    </div>

                    {/* Información del alumno */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg shadow-sm">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Alumno</p>
                          <p className="text-sm font-medium text-gray-900">{pago.alumno}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gradient-to-br from-green-50 to-white p-2 rounded-lg">
                          <p className="text-xs text-gray-500 font-medium">Fecha</p>
                          <p className="text-sm text-gray-800">{pago.fechaEntrada}</p>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-50 to-white p-2 rounded-lg">
                          <p className="text-xs text-gray-500 font-medium">Pago</p>
                          <p className="text-sm font-semibold text-green-700">{pago.pagoCurso}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="bg-gradient-to-br from-yellow-50 to-white p-2 rounded-lg">
                          <p className="text-xs text-gray-500 font-medium">Plan del curso</p>
                          <p className="text-sm text-gray-800">{pago.planCurso}</p>
                        </div>
                        <div className="bg-gradient-to-br from-indigo-50 to-white p-2 rounded-lg">
                          <p className="text-xs text-gray-500 font-medium">Método de pago</p>
                          <p className="text-sm text-gray-800">{pago.metodoPago}</p>
                        </div>
                      </div>
                    </div>

                    {/* Acciones móvil */}
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">Acciones</p>
                      <div className="grid grid-cols-1 gap-2">
                        {/* Generar/Descargar contrato */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Contrato:</span>
                          {pago.contratoGenerado ? (
                            <button
                              onClick={() => handleVisualizarContrato(pago.contratoUrl, pago)}
                              className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 transition-colors duration-150"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Descargar
                            </button>
                          ) : (
                            <button
                              onClick={() => handleGenerarContrato(pago.id)}
                              className="inline-flex items-center px-3 py-1 bg-gray-700 text-white text-xs font-medium rounded-md hover:bg-gray-800 transition-colors duration-150"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Generar
                            </button>
                          )}
                        </div>

                        {/* Subir contrato */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Subir:</span>
                          {pago.contratoSubido ? (
                            <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-md border border-green-200">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Subido
                            </div>
                          ) : (
                            <label className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors duration-150 cursor-pointer">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              Subir
                              <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleSubirContrato(pago.id, e.target.files[0])} />
                            </label>
                          )}
                        </div>

                        {/* Visualizar documentos */}
                        <div className="space-y-2">
                          <span className="text-sm font-medium text-gray-700">Visualizar documentos:</span>
                          
                          {/* Botón para ver comprobante */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Comprobante:</span>
                            <button
                              onClick={() => handleVisualizarComprobante(pago.comprobanteUrl, pago)}
                              className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors duration-150"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Ver Comprobante
                            </button>
                          </div>
                          
                          {/* Botón para ver contrato */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Contrato:</span>
                            {pago.contratoSubido ? (
                              <button
                                onClick={() => handleVisualizarContrato(pago.contratoUrl, pago)}
                                className="inline-flex items-center px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded-md hover:bg-indigo-700 transition-colors duration-150"
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Ver Contrato
                              </button>
                            ) : (
                              <div className="inline-flex items-center px-3 py-1 bg-gray-200 text-gray-500 text-xs font-medium rounded-md">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                </svg>
                                Sin contrato
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {pagosFiltrados.length === 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron registros</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No hay pagos para {activeCategory} - {activeTurno} que coincidan con la búsqueda.
                </p>
              </div>
            )}
          </div>
        )}
        </div>
      </div>

      {/* Componente Modal para visualizar PDF */}
      {modalPDF.isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-all duration-300"
            onClick={() => setModalPDF({ isOpen: false, url: '', alumno: null, tipo: '' })}
          />
          
          {/* Modal Content */}
          <div className="relative flex flex-col h-full max-w-6xl mx-auto">
            {/* Header de la modal */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between relative z-10">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {modalPDF.tipo === 'contrato' ? 'Contrato de Curso' : 'Comprobante de Pago'}
                  </h3>
                  {modalPDF.alumno && (
                    <p className="text-sm text-gray-600">
                      {modalPDF.alumno.alumno} • Folio: {modalPDF.alumno.folio} • {modalPDF.alumno.categoria}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Botón descargar */}
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = modalPDF.url;
                    link.download = `${modalPDF.tipo}_${modalPDF.alumno?.folio}_${modalPDF.alumno?.alumno?.replace(/\s+/g, '_')}.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Descargar
                </button>
                
                {/* Botón cerrar */}
                <button
                  onClick={() => setModalPDF({ isOpen: false, url: '', alumno: null, tipo: '' })}
                  className="inline-flex items-center justify-center w-8 h-8 border border-gray-300 shadow-sm rounded-md text-gray-400 bg-white hover:bg-gray-50 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* PDF Viewer */}
            <div className="flex-1 bg-gray-100">
              <iframe
                src={modalPDF.url}
                className="w-full h-full border-none"
                title={`${modalPDF.tipo} - ${modalPDF.alumno?.alumno}`}
                style={{ minHeight: 'calc(100vh - 120px)' }}
              />
            </div>
            
            {/* Footer de la modal */}
            <div className="bg-white border-t border-gray-200 px-4 py-3 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m-1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    {modalPDF.tipo === 'contrato' 
                      ? modalPDF.alumno?.contratoSubido 
                        ? 'Contrato firmado y subido'
                        : 'Contrato generado automáticamente'
                      : 'Comprobante de pago válido'
                    }
                  </span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setModalPDF({ isOpen: false, url: '', alumno: null, tipo: '' })}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = modalPDF.url;
                      link.download = `${modalPDF.tipo}_${modalPDF.alumno?.folio}_${modalPDF.alumno?.alumno?.replace(/\s+/g, '_')}.pdf`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                  >
                    Descargar PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para generar contrato */}
      <ConfirmModal
        isOpen={contractModal.isOpen}
        type={contractModal.type}
        message={contractModal.message}
        details={contractModal.details}
        onConfirm={confirmGenerateContract}
        onCancel={() => setContractModal({ isOpen: false, type: '', alumno: null, message: '', details: '' })}
      />
    </div>
  );
}

export default ValidacionPagos_Admin_comp;