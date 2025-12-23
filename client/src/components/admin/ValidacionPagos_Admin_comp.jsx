import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import LoadingOverlay from '../shared/LoadingOverlay.jsx';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import jsPDF from 'jspdf';
import { generarContratoPDF } from '../../service/contractPDFService.js';
import { generarPDFCalibracion } from '../../service/pdfCalibrationService.js';
import ConfirmModal from '../shared/ConfirmModal';
import { useAdminContext } from '../../context/AdminContext.jsx';
import api from '../../api/axios.js';

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
  // Modal pequeña de generación (loading) (mover dentro del componente para evitar invalid hook call)
  const [genModal, setGenModal] = useState({ open: false, alumno: null, startedAt: 0, countdown: 5, preliminar: false });

  const [activeCategory, setActiveCategory] = useState(null);
  const [activeTurno, setActiveTurno] = useState(null);
  const [pagos, setPagos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [modalPDF, setModalPDF] = useState({
    isOpen: false,
    url: '',
    alumno: null,
    tipo: '',
    nombreArchivo: ''
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
  // Modal específica para eliminar contrato
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    pago: null,
    processing: false
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
    paymentsData,        // datos de pagos (mock por ahora en contexto)
    isLoading,
    error,
    lastUpdated,
    loadPaymentsData,    // no usado ahora (derivamos pagos desde estudiantes aprobados)
    approvePayment,
    rejectPayment,
    generateContract,
    uploadContract,
    loadStudentsData,    // usamos para construir grupos y pagos
    loadCourseGroups
  } = useAdminContext();

  // ==================== CONFIGURACIÓN DE CURSOS Y GRUPOS ====================

  // ❌ CURSOS FIJOS - HARDCODEADOS en el frontend
  // Estos NO cambian desde el backend, están definidos aquí:
  const cursosDisponibles = ['EEAU', 'EEAP', 'DIGI-START', 'MINDBRIDGE', 'SPEAKUP', 'PCE'];

  // ✅ GRUPOS DINÁMICOS - TODO viene del backend
  // Incluye: nombre, tipo, capacidad máxima, alumnos actuales
  // TODO: CONECTAR CON BACKEND - Endpoint: GET /api/cursos/{curso}/grupos
  //  ESTOS DATOS SÍ VIENEN DEL BACKEND 
  // Grupos dinámicos construidos desde estudiantes aprobados
  const [gruposPorCurso, setGruposPorCurso] = useState({});
  // Cache de estudiantes aprobados por curso para evitar recargas innecesarias
  const [approvedStudentsByCourse, setApprovedStudentsByCourse] = useState({});

  // ==================== UTILIDADES ====================

  // Obtiene los grupos disponibles para el curso seleccionado
  const getGruposDisponibles = () => gruposPorCurso[activeCategory] || [];

  const fetchPagos = async () => {
    if (!activeCategory || !activeTurno) return;
    try {
      let courseStudents = approvedStudentsByCourse[activeCategory];
      if (!courseStudents) {
        courseStudents = await loadStudentsData(activeCategory); // carga todos los del curso
        setApprovedStudentsByCourse(prev => ({ ...prev, [activeCategory]: courseStudents }));
      }
      const grupoFiltrado = courseStudents.filter(est => (est.turno || est.grupo) === activeTurno);
      const pagosBase = grupoFiltrado.map(est => ({
        id: est.id,
        folio: est.folio,
        folioNumero: est.folioNumero || est.folioNumeroOriginal || est.folioNumero || est.folioNumeroRaw || est.folioNumero,
        alumno: `${est.nombres || ''} ${est.apellidos || ''}`.trim(),
        correoElectronico: est.correoElectronico || est.email || '',
        categoria: est.curso || activeCategory,
        turno: est.turno || est.grupo || activeTurno,
        planCurso: est.planCurso || null,
        pagoCurso: est.pagoCurso || null,
        metodoPago: est.metodoPago || null,
        fechaEntrada: est.fechaRegistro || (est.created_at ? est.created_at.split('T')[0] : ''),
        comprobanteUrl: est.comprobanteUrl || null,
        contratoUrl: est.contratoUrl || null,
        estado: 'aprobado',
        contratoGenerado: Boolean(est.contratoUrl),
        contratoSubido: Boolean(est.contratoUrl)
      }));

      // Enriquecer consultando backend sólo para los que aún no tienen contratoUrl
      const enriched = await Promise.all(pagosBase.map(async p => {
        if (p.contratoUrl) return p;
        try {
          const folioCheck = p.folioNumero || p.folio;
          if (!folioCheck) return p;
          // Verificación silenciosa de contrato existente SIN regenerar.
          // Usamos check=1 (modo sólo verificación). Antes se usaba store=1 y eso regeneraba tras eliminar.
          const resp = await api.get(`/admin/estudiantes/folio/${folioCheck}/contrato?check=1`).catch((e) => {
            // Silenciar errores 404 u otros durante enriquecimiento
            return null;
          });
          const data = resp?.data;
          // No logging para producción
          if (data?.existing && data?.archivo) {
            // Contrato encontrado, actualizar flags locales
            return { ...p, contratoUrl: data.archivo, contratoGenerado: true, contratoSubido: true };
          }
        } catch (e) { /* Ignorar excepción silenciosamente */ }
        return p;
      }));
      setPagos(enriched);
    } catch (err) {
      console.error('Error construyendo pagos desde estudiantes aprobados:', err);
      setPagos([]);
    }
  };

  // ✅ CARGAR PAGOS CUANDO SE SELECCIONAN CURSO Y TURNO (ADMINCONTEXT)
  // Eliminado efecto que cargaba datos mock de pagos (ahora derivamos de estudiantes)

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

        // Datos iniciales cargados (mock temporal) - log removido en producción
      } catch (error) {
        // Error loading initial data (silenciado en producción)
        setError('Error al cargar datos iniciales');
      }
    };

    // loadInitialData(); // Descomentar cuando AdminContext tenga loadCourseGroups
  }, []);

  // Cargar grupos desde backend cuando cambia curso
  useEffect(() => {
    const loadGroups = async () => {
      if (!activeCategory) return;
      try {
        const grupos = await loadCourseGroups(activeCategory, 'aprobados');
        setGruposPorCurso(prev => ({ ...prev, [activeCategory]: grupos }));
      } catch (e) {
        console.error('Error obteniendo grupos del backend:', e);
        setGruposPorCurso(prev => ({ ...prev, [activeCategory]: [] }));
      }
      setActiveTurno(null);
      setPagos([]);
    };
    loadGroups();
  }, [activeCategory]);

  // Construir pagos cuando ya hay curso y turno
  useEffect(() => {
    if (activeCategory && activeTurno) fetchPagos();
  }, [activeCategory, activeTurno]);

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
      String(pago.folio || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      pago.correoElectronico?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchCategory && matchTurno && matchSearch;
  });

  // Función para manejar la selección de categoría
  const handleCategorySelect = (categoria) => {
    if (activeCategory === categoria) {
      // Deseleccionar curso actual
      setActiveCategory(null);
      setActiveTurno(null);
      setPagos([]);
    } else {
      // Seleccionar nuevo curso y reiniciar turno y pagos
      setActiveCategory(categoria);
      setActiveTurno(null);
      setPagos([]);
    }
  };

  // (Se eliminó la función de generación debug y el botón asociado a solicitud del usuario)

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

  // Versión original (backend) preservada por si se requiere volver a usar
  const handleGenerarContratoBackend = async (id) => {
    try {
      const alumno = pagos.find(p => p.id === id);
      if (!alumno) { showErrorModal('Error', 'No se encontró el alumno'); return; }
      if (!alumno.alumno || !alumno.categoria || !alumno.planCurso || !alumno.pagoCurso) {
        showErrorModal('Error', 'Faltan datos del alumno para generar el contrato'); return;
      }
      openContractModal(alumno);
      console.log('🔄 Preparando generación de contrato (backend) para pago:', id);
    } catch (error) {
      console.error('Error (backend) al preparar generación contrato:', error);
      showErrorModal('Error', 'Error al preparar la generación del contrato (backend).');
    }
  };

  // Nueva función: generar contrato local usando el mismo motor que el modo debug (sin marcadores)
  // Reemplaza el comportamiento del botón "Generar" para aprovechar inmediatamente las mejoras de layout.
  const handleGenerarContrato = async (id) => {
    try {
      const pago = pagos.find(p => p.id === id);
      if (!pago) { showErrorModal('Error', 'No se encontró el alumno'); return; }
      // Validaciones mínimas
      if (!pago.alumno || !pago.folio) {
        console.warn('⚠️ Faltan datos básicos, se intentará obtener registro completo por API');
      }

      // 1) Obtener el registro completo actualizado desde el backend (igual que en debug)
      const folioApi = pago.folioNumero || pago.folioNumeroOriginal || pago.folioNumeroRaw || pago.folioNumero || pago.folio;
      if (!folioApi) {
        showErrorModal('Error', 'No se pudo determinar el folio para cargar datos completos');
        return;
      }

      // Preparar variables previas (abrir modal lo antes posible)
      let estudianteCompleto = null;
      let usoFallback403 = false;
      const start = Date.now();
      // Modal provisional mientras obtenemos datos (sin alumno todavía)
      setGenModal({ open: true, alumno: { nombreCompleto: pago.alumno || 'Cargando...' }, startedAt: start, countdown: 5, preliminar: false });
      console.debug('[CONTRATO] Modal generación abierta (fase 1)');
      // Ceder el control al navegador para que pinte la modal antes del trabajo pesado
      await new Promise(requestAnimationFrame);
      await new Promise(r => setTimeout(r, 30));
      console.debug('[CONTRATO] Continuando luego de pintar modal');

      try {
        const resp = await api.get(`/admin/estudiantes/folio/${folioApi}`);
        estudianteCompleto = resp?.data?.data;
        if (!estudianteCompleto) throw new Error('El backend no devolvió datos');
      } catch (e) {
        const status = e?.response?.status;
        const statusTxt = e?.response ? `${e.response.status} ${e.response.statusText}` : (e.message || 'Error desconocido');
        if (status === 403) {
          console.warn('⚠️ 403 Forbidden al obtener datos completos. Usando fallback local para generar contrato preliminar.');
          usoFallback403 = true;
          estudianteCompleto = {
            folio: pago.folio,
            folioNumero: pago.folioNumero || pago.folio,
            nombre: (pago.alumno || '').split(' ')[0] || pago.alumno || 'Alumno',
            apellidos: (pago.alumno || '').split(' ').slice(1).join(' ') || '---',
            nombreCompleto: pago.alumno || 'Alumno Desconocido',
            correoElectronico: pago.correoElectronico || 'sin-correo@example.com',
            telefono: pago.telefono || '',
            nombreTutor: pago.nombreTutor || 'Tutor',
            categoria: pago.categoria || '',
            fechaEntrada: pago.fechaEntrada || new Date().toISOString().slice(0, 10),
            pagoCurso: pago.pagoCurso || '',
            planCurso: pago.planCurso || '',
            metodoPago: pago.metodoPago || '',
            academia: pago.categoria || '',
          };
        } else {
          throw new Error(`No se pudieron obtener los datos completos del alumno (${statusTxt})`);
        }
      }

      // Actualizar modal con datos definitivos / bandera preliminar
      setGenModal(g => ({ ...g, alumno: estudianteCompleto, preliminar: usoFallback403 }));
      console.debug('[CONTRATO] Modal generación actualizada con datos definitivos. preliminar=', usoFallback403);

      console.log('📝 Generando contrato LOCAL definitivo (solo vista, sin descarga automática) para:', estudianteCompleto.nombreCompleto || estudianteCompleto.alumno);

      // Iniciar countdown local (sin limpiar si se cierra antes, inofensivo)
      let c = 5;
      const tick = () => {
        c -= 1;
        setGenModal(g => g.open ? { ...g, countdown: c } : g);
        if (c > 0) setTimeout(tick, 1000);
      };
      setTimeout(tick, 1000);

      let resultado;
      let errorGeneracion = null;
      try {
        console.debug('[CONTRATO] Iniciando generación pdf-lib pesada...');
        // Usar las mismas opciones que el modo debug para asegurar consistencia en campos rellenados
        const pdfOptions = {
          debug: true, // mantener true para logs y trazabilidad visual (no agrega marcadores visibles salvo debugMarkers)
          templateUrl: '/public/CONTRATO_C_E_E_A.pdf',
          allowBlankFallback: true,
          showMissingTemplateBanner: false,
          preliminar: usoFallback403,
          // Fallbacks de texto (solo se usan si el dato real no viene de la BD)
          sampleFechaText: pago.fechaEntrada || new Date().toLocaleDateString('es-MX'),
          // No mostrar el texto del plan; solo se marcará la casilla con 'X'
          showPlanCurso: false,
          showMonto: true,
          showNivelAcademico: false, // se desactiva para no mostrar bachillerato / CBTIS
          showSeguimiento: false, // cambiar a true si se quiere mostrar seguimiento psicológico
          showFechaPagina1: false, // activar si se requiere la fecha DIA/MES/AÑO en página 1
          // Control de meses en página 2 (mantener por defecto visible set 1 y 2)
          hideMesSet1: false,
          hideMesSet2: false,
          showMesSet3: false,
          // Posibles muestras (solo si vienen vacíos en datos reales)
          sampleUniversidadText: 'UNIVERSIDAD DEMO',
          samplePostulacionText: 'INGENIERIA',
          sampleOrientacion: 'SI'
        };
        resultado = await generarContratoPDF(estudianteCompleto, pdfOptions);
        console.debug('[CONTRATO] Generación pdf-lib finalizada');
      } catch (e) {
        errorGeneracion = e;
      }

      const elapsed = Date.now() - start;
      const MIN_DELAY = 5000; // 5 segundos
      if (elapsed < MIN_DELAY) {
        await new Promise(r => setTimeout(r, MIN_DELAY - elapsed));
      }

      // Cerrar modal de loading
      setGenModal(g => ({ ...g, open: false }));

      if (errorGeneracion) throw errorGeneracion;

      // 3) Actualizar estado local para que aparezca como generado (usa objectURL en memoria)
      setPagos(prev => prev.map(p => p.id === pago.id ? { ...p, contratoGenerado: true, contratoUrl: resultado.url } : p));
      console.log('✅ Contrato local generado (no descargado automáticamente):', resultado.nombreArchivo);

      // 4) Mostrar modal de vista previa usando el object URL
      setModalPDF({
        isOpen: true,
        url: resultado.url,
        alumno: estudianteCompleto,
        tipo: usoFallback403 ? 'contrato-local-preliminar' : 'contrato-local-preview',
        nombreArchivo: resultado.nombreArchivo || ''
      });
    } catch (error) {
      console.error('❌ Error en generación local (no debug):', error);
      // Asegurarse de cerrar modal de loading si hay error
      setGenModal(g => ({ ...g, open: false }));
      showErrorModal('Error', error.message || 'No se pudo generar el contrato local');
    }
  };

  // Función para confirmar la generación de contrato usando AdminContext
  const handleConfirmarGeneracionContrato = async () => {
    setIsGeneratingContract(true);

    try {
      // Obtener el alumno del modal actual (guardar referencia ANTES de cerrar)
      const alumnoRef = contractModal?.alumno;
      if (!alumnoRef) {
        throw new Error('No hay alumno seleccionado para generar el contrato');
      }
      // Cerrar modal de confirmación
      setContractModal({ isOpen: false, type: '', alumno: null, message: '', details: '' });

      // ✅ USAR ADMINCONTEXT PARA GENERAR CONTRATO
      // generateContract viene del AdminContext.jsx y maneja la generación del PDF
      const contractData = {
        alumno: alumnoRef.alumno,
        folio: alumnoRef.folio,
        curso: alumnoRef.categoria,
        turno: alumnoRef.turno,
        plan: alumnoRef.planCurso,
        pago: alumnoRef.pagoCurso
      };

      // Llamar backend generación (devuelve JSON con archivo)
      let data;
      try {
        const folioApi = alumnoRef.folioNumero || alumnoRef.folioNumeroOriginal || alumnoRef.folioNumeroRaw || alumnoRef.folioNumero || alumnoRef.folio; // última alternativa
        // Preview por defecto (sin guardar). Para guardar usar ?store=1 posteriormente.
        const resp = await api.get(`/admin/estudiantes/folio/${folioApi}/contrato`);
        data = resp.data;
      } catch (e) {
        // Si la respuesta no es JSON (HTML dev server), levantar error claro
        throw new Error(e?.response ? (`${e.response.status} ${e.response.statusText}`) : (e.message || 'Error desconocido'));
      }
      if (data.preview) {
        if (!data.archivo_base64) throw new Error('Respuesta sin contenido base64');
        const pdfUrl = `data:${data.mime || 'application/pdf'};base64,${data.archivo_base64}`;
        setModalPDF({
          isOpen: true,
          url: pdfUrl,
          alumno: alumnoRef,
          tipo: 'contrato'
        });
      } else {
        const urlContrato = data.archivo;
        if (!urlContrato) throw new Error('Respuesta sin archivo');
        setPagos(pagos.map(pago => pago.id === alumnoRef.id ? { ...pago, contratoGenerado: true, contratoUrl: urlContrato } : pago));
        setContractModal({
          isOpen: true,
          type: 'success',
          alumno: alumnoRef,
          message: data.existing ? 'Contrato ya existente' : '¡Contrato Generado!',
          details: data.existing ? 'Ya había un contrato registrado. Puedes descargarlo o subir el firmado.' : `Contrato creado y guardado. Ahora descárgalo, recaba firmas y súbelo como firmado.`
        });
      }

    } catch (pdfError) {
      console.error('Error específico en generación PDF:', pdfError);

      // Mostrar modal de error
      setContractModal({
        isOpen: true,
        type: 'error',
        alumno: contractModal?.alumno || null,
        message: 'Error al Generar el PDF',
        details: `No se pudo crear el contrato PDF para ${contractModal?.alumno?.alumno || '(Alumno desconocido)'}. Error: ${pdfError.message}`
      });
    }

    setIsGeneratingContract(false);
  };

  // Función para manejar selección de turno/grupo
  const handleTurnoSelect = (turnoNombre) => {
    if (turnoNombre === activeTurno) {
      setActiveTurno(null);
      setPagos([]);
    } else {
      setActiveTurno(turnoNombre);
      // Al cambiar de turno reconstruiremos pagos vía efecto
    }
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

      // Subir directamente al backend nuevo endpoint
      const formData = new FormData();
      formData.append('contrato', file);
      const folio = alumno.folioNumero || alumno.folio;
      let data;
      try {
        const resp = await api.post(`/admin/estudiantes/folio/${folio}/contrato`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        data = resp.data;
      } catch (e) {
        throw new Error(e?.response ? (`${e.response.status} ${e.response.statusText}`) : (e.message || 'Error desconocido subida'));
      }
      const urlArchivo = data.archivo || null;

      // Optimistic update local
      setPagos(prev => prev.map(p => p.id === id ? {
        ...p,
        contratoSubido: true,
        contratoGenerado: true,
        contratoUrl: urlArchivo,
        nombreArchivoSubido: file.name,
        fechaSubida: new Date().toISOString(),
        versionContrato: 1,
        contratoFirmado: true
      } : p));

      // Intentar revalidar datos del estudiante (para futuras mejoras si backend devuelve estado)
      try {
        if (alumno.folio) {
          const folioCheck = alumno.folioNumero || alumno.folio;
          const respDetalle = await api.get(`/admin/estudiantes/folio/${folioCheck}`);
          const detalle = respDetalle?.data?.data;
          if (detalle?.contratoUrl) {
            setPagos(prev => prev.map(p => p.id === id ? { ...p, contratoUrl: detalle.contratoUrl } : p));
          }
        }
      } catch (revalErr) {
        console.warn('No se pudo revalidar estudiante tras subir contrato:', revalErr?.message);
      }

      setContractModal({
        isOpen: true,
        type: 'success',
        alumno: alumno,
        message: '¡Contrato Subido Exitosamente!',
        details: `El archivo "${file.name}" se ha subido correctamente y ya está disponible para ${alumno.alumno}.`
      });

      console.log('📤 Subido contrato para pago:', id, 'Archivo:', file?.name);
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

  // Eliminar contrato para permitir regenerar / subir nuevamente
  const openDeleteContrato = (pago) => {
    if (!pago) return;
    setDeleteModal({ open: true, pago, processing: false });
  };

  const confirmDeleteContrato = async () => {
    if (!deleteModal.pago) return;
    setDeleteModal(dm => ({ ...dm, processing: true }));
    try {
      const pago = deleteModal.pago;
      const folio = pago.folioNumero || pago.folio;
      await api.delete(`/admin/estudiantes/folio/${folio}/contrato`);
      setPagos(prev => prev.map(p => p.id === pago.id ? { ...p, contratoUrl: null, contratoGenerado: false, contratoSubido: false, contratoFirmado: false } : p));
      setDeleteModal({ open: false, pago: null, processing: false });
      // Revalidar contra backend (check=1 no genera nada)
      try { await api.get(`/admin/estudiantes/folio/${folio}/contrato?check=1`); } catch (_) { }
    } catch (e) {
      setDeleteModal(dm => ({ ...dm, processing: false }));
      alert('No se pudo eliminar el contrato: ' + (e?.response?.data?.message || e.message));
    }
  };

  const cancelDeleteContrato = () => setDeleteModal({ open: false, pago: null, processing: false });

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
      { /* Util para construir nombre de descarga */}
      { /* NOTA: se define como función local, no como nodo React */}
      { /* eslint-disable-next-line no-unused-vars */}
      {(() => {
        const tipoMap = {
          'contrato-local-preview': 'Contrato',
          'contrato-local-preliminar': 'Contrato_PRELIMINAR',
          'contrato': 'Contrato',
          'comprobante': 'Comprobante'
        };
        // Adjuntar a una ref local en closure accessible por handlers via inline const
        // Guardamos en un objeto en scope del render
        // eslint-disable-next-line react-hooks/rules-of-hooks
      })()}
      {/* Helper local para nombre de archivo (no se renderiza nada) */}
      { /* eslint-disable-next-line no-unused-vars */}
      {(() => { /* noop placeholder to keep consistent structure */ })()}
      {(showLoadingScreen || isLoading) && (
        <LoadingOverlay message={showLoadingScreen ? "Cargando contratos.." : "Cargando..."} />
      )}
      {/* Header con filtros optimizado */}
      <div className="pt-6 xs:pt-8 sm:pt-10 md:pt-12 pb-2 xs:pb-3 sm:pb-4 px-2 xs:px-4 sm:px-6">
        <div className="w-full max-w-7xl mx-auto">
          {/* Título principal */}
          <div className="text-center mb-4 xs:mb-6 sm:mb-8">
            <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-extrabold 
              bg-gradient-to-r from-purple-600 to-purple-700
              bg-clip-text text-transparent
              mb-2 xs:mb-3 sm:mb-4 px-2">
              Generar Contratos
            </h1>
            <div className="w-12 xs:w-16 sm:w-20 md:w-24 lg:w-28 h-0.5 xs:h-1 sm:h-1.5 bg-gradient-to-r from-purple-500/80 to-purple-600/80 mx-auto mb-2 xs:mb-3 sm:mb-4 rounded-full"></div>
            <p className="text-xs xs:text-sm sm:text-base text-gray-700 font-semibold px-4">
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
                  className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95 touch-manipulation font-semibold text-xs"
                  title="Actualizar datos"
                >
                  <svg className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{isLoading ? 'Actualizando...' : 'Actualizar'}</span>
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
            <div className="bg-gradient-to-br from-white via-gray-50 to-slate-50 rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-5 shadow-lg border border-gray-200">
              <h2 className="text-base xs:text-lg sm:text-xl font-extrabold text-gray-800 mb-3 xs:mb-4 sm:mb-5 text-center px-2">
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
              <div className="bg-gradient-to-br from-white via-gray-50 to-slate-50 rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-5 shadow-lg border border-gray-200">
                <h2 className="text-base xs:text-lg sm:text-xl font-extrabold text-gray-800 mb-3 xs:mb-4 sm:mb-5 text-center px-2">
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
                <div className="mt-4 xs:mt-5 sm:mt-6 flex flex-wrap gap-3 xs:gap-4 justify-center text-xs xs:text-sm">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="w-4 h-4 xs:w-5 xs:h-5 bg-blue-500 rounded-full ring-1 ring-blue-300/30"></div>
                    <span className="font-semibold text-blue-600">Matutino</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="w-4 h-4 xs:w-5 xs:h-5 bg-purple-500 rounded-full ring-1 ring-purple-300/30"></div>
                    <span className="font-semibold text-purple-600">Vespertino</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg border border-green-200">
                    <div className="w-4 h-4 xs:w-5 xs:h-5 bg-green-500 rounded-full ring-1 ring-green-300/30"></div>
                    <span className="font-semibold text-green-600">Sabatino</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Información del grupo seleccionado */}
          {activeCategory && activeTurno && (
            <div className="mb-4 xs:mb-6">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 xs:px-6 sm:px-8 py-4 xs:py-5 sm:py-6 rounded-xl sm:rounded-2xl shadow-lg border-2 border-purple-400/40 ring-2 ring-purple-200/20">
                <div className="text-center">
                  <p className="text-base xs:text-lg sm:text-xl md:text-2xl font-extrabold mb-2 xs:mb-3">
                    Grupo Activo: {activeCategory} - {activeTurno}
                  </p>
                  <p className="text-xs xs:text-sm sm:text-base md:text-lg text-purple-50 font-semibold">
                    Validando pagos del grupo seleccionado
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Barra de búsqueda - Solo se muestra cuando ambos filtros están activos */}
          {activeCategory && activeTurno && (
            <div className="mb-4 xs:mb-6">
              <div className="bg-gradient-to-br from-white via-gray-50 to-slate-50 rounded-xl sm:rounded-2xl p-3 xs:p-4 shadow-lg border border-gray-200">
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
                        <td className="px-1 xs:px-2 sm:px-4 py-2 xs:py-3 border-r border-gray-200 text-center">
                          {/* Folio compacto estilo ComprobanteRecibo */}
                          <div className="font-mono text-[10px] xs:text-xs sm:text-sm font-medium text-blue-600 tracking-wide">
                            {pago.folio}
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
                          {pago.planCurso || '—'}
                        </td>
                        <td className="px-1 xs:px-2 sm:px-4 py-2 xs:py-3 border-r border-gray-200">
                          <span className="text-[8px] xs:text-[10px] sm:text-xs font-semibold text-green-700 bg-green-50 px-1 xs:px-2 py-0.5 xs:py-1 rounded-md">
                            {pago.pagoCurso || '—'}
                          </span>
                        </td>
                        <td className="px-1 xs:px-2 sm:px-4 py-2 xs:py-3 border-r border-gray-200 text-[8px] xs:text-[10px] sm:text-xs text-gray-700">
                          {pago.metodoPago || '—'}
                        </td>
                        <td className="px-1 xs:px-2 sm:px-4 py-2 xs:py-3 border-r border-gray-200 text-center">
                          <div className="flex items-center justify-center gap-2">
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
                                onClick={() => !genModal.open && handleGenerarContrato(pago.id)}
                                disabled={genModal.open}
                                className="btn-generar inline-flex items-center px-1 xs:px-2 sm:px-3 py-0.5 xs:py-1 sm:py-2 bg-gray-700 text-white text-[8px] xs:text-[10px] sm:text-xs font-medium rounded-md hover:bg-gray-800 transition-colors duration-150"
                              >
                                <svg className="w-2 xs:w-3 sm:w-4 h-2 xs:h-3 sm:h-4 mr-0.5 xs:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Generar
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-1 xs:px-2 sm:px-4 py-2 xs:py-3 border-r border-gray-200 text-center">
                          {pago.contratoSubido ? (
                            <div className="inline-flex items-center px-1 xs:px-2 sm:px-3 py-0.5 xs:py-1 sm:py-2 bg-green-100 text-green-700 text-[8px] xs:text-[10px] sm:text-xs font-medium rounded-md border border-green-200">
                              <svg className="w-2 xs:w-3 sm:w-4 h-2 xs:h-3 sm:h-4 mr-0.5 xs:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Subido
                              <button onClick={() => openDeleteContrato(pago)} title="Eliminar contrato" className="ml-1 text-red-600 hover:text-red-700">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
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
                          <span className="text-sm font-medium font-mono text-blue-600 tracking-wide">{pago.folio}</span>
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
                                onClick={() => !genModal.open && handleGenerarContrato(pago.id)}
                                disabled={genModal.open}
                                className="btn-generar inline-flex items-center px-3 py-1 bg-gray-700 text-white text-xs font-medium rounded-md hover:bg-gray-800 transition-colors duration-150"
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
                                <button onClick={() => openDeleteContrato(pago)} title="Eliminar contrato" className="ml-2 text-red-600 hover:text-red-700">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
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
                            <span className="text-sm font-medium text-gray-700">Visualizar contrato:</span>
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

      {/* Componente Modal para visualizar PDF (versión compacta) */}
      {modalPDF.isOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-center p-1.5 sm:p-3">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setModalPDF({ isOpen: false, url: '', alumno: null, tipo: '' })}
          />
          <div className="relative flex flex-col w-full max-w-[820px] h-[82vh] rounded-md sm:rounded-lg translate-y-6 sm:translate-y-10 bg-white shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300 transform">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 px-2 sm:px-2.5 py-1.5 border-b bg-white/95 backdrop-blur z-10 h-[42px]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-6.5 h-6.5 rounded-full bg-purple-100 flex items-center justify-center">
                  <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h3 className="text-[12px] sm:text-[13px] md:text-sm font-semibold text-gray-900 truncate">{modalPDF.tipo === 'contrato' ? 'Contrato de Curso' : 'Contrato'}</h3>
                  {modalPDF.alumno && (
                    <p className="text-[9px] sm:text-[10px] text-gray-600 truncate">{modalPDF.alumno.alumno} • Folio: {modalPDF.alumno.folio} • {modalPDF.alumno.categoria}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = modalPDF.url;
                    const buildFilename = (mp) => {
                      if (!mp) return 'Archivo.pdf';
                      if (mp.nombreArchivo) return mp.nombreArchivo;
                      const tipoMap = {
                        'contrato-local-preview': 'Contrato',
                        'contrato-local-preliminar': 'Contrato_PRELIMINAR',
                        'contrato': 'Contrato',
                        'comprobante': 'Comprobante'
                      };
                      const prefix = tipoMap[mp.tipo] || 'Documento';
                      const folio = mp.alumno?.folio || mp.alumno?.folio_formateado || mp.alumno?.folioNumero || 'SIN_FOLIO';
                      const rawName = mp.alumno?.alumno || mp.alumno?.nombreCompleto || [mp.alumno?.nombre, mp.alumno?.apellidos].filter(Boolean).join(' ') || 'ALUMNO';
                      const safeName = rawName.replace(/[^A-Za-z0-9]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
                      return `${prefix}_${folio}_${safeName || 'ALUMNO'}.pdf`;
                    };
                    link.download = buildFilename(modalPDF);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="inline-flex items-center px-2.5 py-1.5 text-[11px] font-medium rounded-md bg-purple-600 text-white hover:bg-purple-700 border border-transparent shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Descargar
                </button>
                {/* Abrir en nueva pestaña */}
                <button
                  onClick={() => {
                    try { window.open(modalPDF.url, '_blank', 'noopener'); } catch (_) { }
                  }}
                  title="Abrir en nueva pestaña"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3h7v7m0-7L10 14m-4 7h11" />
                  </svg>
                </button>
                <button
                  onClick={() => setModalPDF({ isOpen: false, url: '', alumno: null, tipo: '' })}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            {/* Loading mini modal (portal) */}
            {/* (El portal de loading se movió fuera para que aparezca aunque aún no esté abierto modalPDF) */}
            {/* Visor */}
            <div className="flex-1 bg-gray-100">
              <iframe
                allowFullScreen
                src={modalPDF.url}
                className="w-full h-full border-none"
                title={`${modalPDF.tipo} - ${modalPDF.alumno?.alumno}`}
              />
            </div>
            {/* Footer */}
            <div className="px-2 sm:px-2.5 py-1.5 border-t bg-white/95 backdrop-blur text-[9.5px] sm:text-[10px] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-gray-600 min-w-0">
                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m-1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="truncate">
                  {modalPDF.tipo === 'contrato'
                    ? modalPDF.alumno?.contratoSubido
                      ? 'Contrato firmado y subido'
                      : 'Contrato generado automáticamente'
                    : 'Comprobante de pago válido'}
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  onClick={() => setModalPDF({ isOpen: false, url: '', alumno: null, tipo: '' })}
                  className="px-2.5 py-1.5 text-[11px] font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = modalPDF.url;
                    const buildFilename = (mp) => {
                      if (!mp) return 'Archivo.pdf';
                      if (mp.nombreArchivo) return mp.nombreArchivo;
                      const tipoMap = {
                        'contrato-local-preview': 'Contrato',
                        'contrato-local-preliminar': 'Contrato_PRELIMINAR',
                        'contrato': 'Contrato',
                        'comprobante': 'Comprobante'
                      };
                      const prefix = tipoMap[mp.tipo] || 'Documento';
                      const folio = mp.alumno?.folio || mp.alumno?.folio_formateado || mp.alumno?.folioNumero || 'SIN_FOLIO';
                      const rawName = mp.alumno?.alumno || mp.alumno?.nombreCompleto || [mp.alumno?.nombre, mp.alumno?.apellidos].filter(Boolean).join(' ') || 'ALUMNO';
                      const safeName = rawName.replace(/[^A-Za-z0-9]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
                      return `${prefix}_${folio}_${safeName || 'ALUMNO'}.pdf`;
                    };
                    link.download = buildFilename(modalPDF);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="px-2.5 py-1.5 text-[11px] font-medium text-white bg-purple-600 border border-transparent rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  Descargar PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para generar contrato */}
      {contractModal.isOpen && (
        <ConfirmModal
          isOpen
          type={contractModal.type}
          message={contractModal.message}
          details={contractModal.details}
          onConfirm={confirmGenerateContract}
          onCancel={() => setContractModal({ isOpen: false, type: '', alumno: null, message: '', details: '' })}
        />
      )}

      {/* Portal global para la modal de generación */}
      {genModal.open && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-auto select-none">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          <div className="relative bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.35)] border border-purple-200 w-full max-w-xs p-5 animate-fade-in">
            <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 shadow-lg flex items-center justify-center ring-4 ring-white">
              <svg className="w-4 h-4 text-white animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582M20 20v-5h-.581M5 9a7.5 7.5 0 0113.418-3.418M19 15a7.5 7.5 0 01-13.418 3.418" />
              </svg>
            </div>
            <div className="flex items-center mb-4 mt-1">
              <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
                </svg>
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-gray-800 tracking-wide flex items-center flex-wrap gap-1">
                  Generando contrato
                  {genModal.preliminar && (
                    <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-600 border border-red-200">PRELIMINAR</span>
                  )}
                </h4>
                <p className="text-[11px] text-gray-500 truncate max-w-[180px]" title={genModal.alumno?.nombreCompleto}>
                  {genModal.alumno?.nombreCompleto || 'Preparando PDF'}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="w-full bg-gray-200/80 rounded-full h-2 overflow-hidden relative">
                <div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(45deg,#fff_0_8px,#e5e5e5_8px_16px)]" />
                <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-600 animate-loading-bar rounded-full shadow-inner" />
              </div>
              <div className="flex items-center justify-between text-[11px] text-gray-600 font-medium">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l2.5 1.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Procesando...
                </span>
                <span className="tabular-nums text-purple-600">{genModal.countdown}s</span>
              </div>
              <p className="text-[10px] leading-snug text-gray-400">
                Estamos ensamblando tu PDF con la plantilla oficial y posicionando los campos calibrados.
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal personalizada para eliminar contrato */}
      {deleteModal.open && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={cancelDeleteContrato} />
          <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl border border-rose-200 overflow-hidden animate-fade-in">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-100 rounded-full opacity-40 blur-2xl" />
            <div className="relative px-6 pt-6 pb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-md">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 leading-tight">Eliminar contrato</h3>
                  <p className="text-xs text-rose-600 font-medium tracking-wide uppercase">Acción irreversible</p>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-gray-700 leading-relaxed">
                  ¿Seguro que deseas eliminar el contrato del alumno
                  <span className="font-semibold text-gray-900"> {deleteModal.pago?.alumno}</span>? Esta acción quitará el archivo actual y podrás generar uno nuevo después.
                </p>
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 flex items-start gap-2">
                  <svg className="w-5 h-5 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-[11px] text-rose-700 leading-snug">
                    Esta eliminación no guarda historial. Si necesitas auditoría futura, considera implementar un soft delete.
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center gap-3 justify-end">
              <button
                onClick={cancelDeleteContrato}
                disabled={deleteModal.processing}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteContrato}
                disabled={deleteModal.processing}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-md bg-gradient-to-r from-rose-600 to-rose-700 text-white text-sm font-semibold shadow hover:from-rose-700 hover:to-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-60"
              >
                {deleteModal.processing ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582M20 20v-5h-.581M5 9a7.5 7.5 0 0113.418-3.418M19 15a7.5 7.5 0 01-13.418 3.418" />
                    </svg>
                    Eliminando...
                  </span>
                ) : 'Eliminar contrato'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default ValidacionPagos_Admin_comp;