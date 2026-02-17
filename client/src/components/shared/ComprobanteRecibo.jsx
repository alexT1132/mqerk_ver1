import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import LoadingOverlay from './LoadingOverlay.jsx';
import { exportApprovedComprobantesToExcel } from '../../utils/exportExcel.js';
import { useEstudiantes } from "../../context/EstudiantesContext";
import { useComprobante } from '../../context/ComprobantesContext';


// Reemplazado por el componente reutilizable LoadingOverlay

// Botón de categoría de curso
function CategoryButton({ label, isActive, onClick }) {
    // Función para obtener texto responsive
    // falta  ver si realmente funciona bien en pantallas pequeñas y grandes

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
                px-1 py-1 xs:px-1.5 xs:py-1.5 sm:px-2 sm:py-2 md:px-3 md:py-2
                rounded-md xs:rounded-lg sm:rounded-xl 
                font-bold text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs lg:text-sm
                transition-all duration-300 ease-out 
                w-full min-w-[60px] xs:min-w-[70px] sm:min-w-[80px] max-w-[100px] xs:max-w-[110px] sm:max-w-[130px]
                h-8 xs:h-10 sm:h-12 md:h-14
                flex items-center justify-center
                border-2 transform 
                active:scale-95 touch-manipulation
                hover:scale-105 hover:shadow-md
                ring-1 ring-transparent hover:ring-purple-200/20
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

// Botón de turno (matutino/vespertino/sabatino) con profesor asignado
function VespertinoButton({ label, isActive, onClick, profesorAsignado, grupo }) {

    // Función para obtener estilos sobrios basados en el tipo de turno
    const getGrupoStyles = (grupo, isActive) => {
        const baseStyles = "relative overflow-hidden px-3 py-2 xs:px-4 xs:py-2 sm:px-5 sm:py-3 rounded-lg xs:rounded-xl sm:rounded-2xl font-extrabold text-xs xs:text-sm sm:text-base transition-all duration-300 ease-out w-full min-w-[100px] max-w-[140px] h-10 xs:h-12 sm:h-14 flex flex-col items-center justify-center gap-0.5 border-2 hover:shadow-lg active:scale-95 touch-manipulation ring-2 ring-transparent hover:ring-opacity-50";

        switch (grupo) {
            case 'V1':
            case 'V2':
            case 'V3':
                return isActive
                    ? `${baseStyles} bg-purple-500 text-white border-purple-500 shadow-md`
                    : `${baseStyles} bg-white text-purple-600 border-purple-300 hover:bg-purple-50`;

            case 'M1':
            case 'M2':
                return isActive
                    ? `${baseStyles} bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 shadow-md ring-blue-300/30`
                    : `${baseStyles} bg-gradient-to-r from-blue-400/60 to-indigo-400/60 text-white border-blue-300/50 shadow-sm hover:from-blue-500/70 hover:to-indigo-500/70 hover:border-blue-400/60 hover:ring-blue-200/20`;

            case 'S1':
                return isActive
                    ? `${baseStyles} bg-gradient-to-r from-green-600 to-teal-600 text-white border-green-500 shadow-md ring-green-300/30`
                    : `${baseStyles} bg-gradient-to-r from-green-400/60 to-teal-400/60 text-white border-green-300/50 shadow-sm hover:from-green-500/70 hover:to-teal-500/70 hover:border-green-400/60 hover:ring-green-200/20`;

            default:
                return isActive
                    ? `${baseStyles} bg-gray-500 text-white border-gray-500`
                    : `${baseStyles} bg-white text-gray-600 border-gray-300 hover:bg-gray-50`;
        }
    };

    return (
        <button
            onClick={onClick}
            className={getGrupoStyles(grupo, isActive)}
        >
            <span className="relative z-10 tracking-wide text-center leading-tight">{label}</span>
            {isActive && profesorAsignado && (
                <span className="text-[8px] xs:text-[9px] sm:text-[10px] font-medium opacity-90 relative z-10 text-center">
                    Prof. {profesorAsignado}
                </span>
            )}
        </button>
    );
}

// Tooltip de ayuda para zoom en PDFs
// este se puede quedar 
function PdfZoomTip({ onDismiss }) {
    const [dontShowAgain, setDontShowAgain] = useState(false);

    const handleDismiss = () => {
        onDismiss(dontShowAgain);
    };

    return (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-11/12 max-w-md bg-indigo-600/95 backdrop-blur-sm text-white p-3 rounded-lg shadow-xl z-10 border border-indigo-400/50">
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M12 21v-1m0-16a9 9 0 110 18 9 9 0 010-18z"></path></svg>
                </div>
                <div className="flex-grow">
                    <h4 className="font-bold text-sm">Consejo</h4>
                    <p className="text-xs text-indigo-100">Usa <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md">Rueda del ratón</kbd> para hacer zoom.</p>
                    <div className="mt-2">
                        <label className="flex items-center text-xs text-indigo-200 cursor-pointer">
                            <input
                                type="checkbox"
                                className="h-3.5 w-3.5 rounded border-gray-300 text-indigo-500 focus:ring-indigo-500"
                                checked={dontShowAgain}
                                onChange={(e) => setDontShowAgain(e.target.checked)}
                            />
                            <span className="ml-2">No volver a mostrar</span>
                        </label>
                    </div>
                </div>
                <button onClick={handleDismiss} className="p-1 rounded-full hover:bg-indigo-500/50 transition-colors flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
        </div>
    );
}

// COMPONENTE PRINCIPAL: Gestión de Comprobantes de Pago
export function ComprobanteRecibo() {
    const location = typeof window !== 'undefined' ? useLocation() : { search: '' };
    // ==================== ESTADOS DE LA APLICACIÓN ====================

    // Estados de navegación y UI
    const [showLoadingScreen, setShowLoadingScreen] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [showContent, setShowContent] = useState(false);
    const [activeCategory, setActiveCategory] = useState('');
    const [activeVespertino, setActiveVespertino] = useState('');
    const [vistaActual, setVistaActual] = useState('pendientes'); // 'pendientes', 'aprobados', 'rechazados'
    // Buscador solo para la tabla de aprobados
    const [approvedSearchTerm, setApprovedSearchTerm] = useState(() => sessionStorage.getItem('compRecibo_aprobados_searchTerm') || '');

    // Estados de modales
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [currentComprobante, setCurrentComprobante] = useState(null);
    const [motivoRechazo, setMotivoRechazo] = useState('');
    const [showPdfTip, setShowPdfTip] = useState(false);

    // Estados para campos editables (importe y método)
    const [editableFields, setEditableFields] = useState({}); // Para almacenar valores temporales de edición por comprobante
    // Celda en edición (solo aprobados) { key, field }
    const [editingCell, setEditingCell] = useState(null);
    const [isCoarsePointer, setIsCoarsePointer] = useState(false); // detectar móvil/táctil
    const [toast, setToast] = useState(null); // { msg, type }

    useEffect(() => {
        try {
            const mq = window.matchMedia('(pointer: coarse)');
            setIsCoarsePointer(mq.matches);
            const handler = (e) => setIsCoarsePointer(e.matches);
            mq.addEventListener ? mq.addEventListener('change', handler) : mq.addListener(handler);
            return () => { mq.removeEventListener ? mq.removeEventListener('change', handler) : mq.removeListener(handler); };
        } catch (_) { /* noop */ }
    }, []);

    // Toast auto hide
    useEffect(() => {
        if (toast) {
            const t = setTimeout(() => setToast(null), 2500);
            return () => clearTimeout(t);
        }
    }, [toast]);



    // Estado del visor de comprobantes
    const [modalComprobante, setModalComprobante] = useState({
        isOpen: false,
        comprobante: null,
        zoomLevel: 1
    });

    // ==================== DATOS Y CONFIGURACIÓN ====================

    // TODO: REEMPLAZAR CON API - Comprobantes pendientes de validación
    //  ELIMINAR DATOS MOCK ANTES DE PRODUCCIÓN 
    // const [comprobantes, setComprobantes] = useState([
    //     {
    //         id: 1,
    //         folio: "MQEEAU-2025-0001", 
    //         nombreAlumno: "María González López",
    //         cursoComprado: "EEAU - Grupo M1",
    //         fechaHora: "2024-07-29 14:30",
    //         importe: "1500.00",
    //         metodoPago: "Transferencia bancaria",
    //         estado: "pendiente",
    //         comprobanteUrl: "/src/assets/comprobante-pago-MQ-20250729-0001.pdf"
    //     },
    //     {
    //         id: 2,
    //         folio: "MQEEAP-2025-0002", 
    //         nombreAlumno: "Carlos Hernández Ruiz",
    //         cursoComprado: "EEAP - Grupo V1",
    //         fechaHora: "2024-07-29 16:45",
    //         importe: "1800.00",
    //         metodoPago: "Deposito en efectivo",
    //         estado: "pendiente",
    //         comprobanteUrl: "/src/assets/comprobante-pago-MQ-20250729-0001.png"
    //     },
    //     {
    //         id: 3,
    //         folio: "MQDIGI-2025-0003", 
    //         nombreAlumno: "Ana Patricia Morales",
    //         cursoComprado: "DIGI-START - Grupo V1",
    //         fechaHora: "2024-07-29 10:15",
    //         importe: "2200.00",
    //         metodoPago: "Tarjeta de crédito",
    //         estado: "pendiente",
    //         comprobanteUrl: "/src/assets/comprobante-pago-MQ-20250729-0001.pdf"
    //     }
    // ]);


    // Cierra el modal de éxito y limpia el comprobante actual
    const cerrarModalExito = () => {
        setShowSuccessModal(false);
        setCurrentComprobante(null);
    };

    // Modal de éxito para rechazo
    const [showRejectSuccessModal, setShowRejectSuccessModal] = useState(false);
    const cerrarModalRechazoExito = () => {
        setShowRejectSuccessModal(false);
        setCurrentComprobante(null);
    };

    /* 
    ========== DATOS MOCK - ELIMINAR EN PRODUCCIÓN ==========
    
    Ejemplo de estructura de datos que debe venir del backend:
    
    const [comprobantes, setComprobantes] = useState([
        {
            id: 1,
            nombreAlumno: "María González López",
            cursoComprado: "Matemáticas Nivel 1",
            fechaHora: "2024-06-27 14:30",
            importe: "150.00",
            metodoPago: "Transferencia bancaria",
            estado: "pendiente",
            comprobanteUrl: "/src/assets/comprobante-pago-MQ-20250729-0001.pdf"
        }
    ]);
    
    ========== FIN DATOS MOCK ==========
    */

    // TODO: REEMPLAZAR CON API - Historial de comprobantes procesados / overrides locales
    // Estado local de comprobantes pendientes (base) y overrides para aprobados / rechazados sin persistir aún
    const [comprobantes, setComprobantes] = useState([]); // base pendientes
    const [comprobantesOverrides, setComprobantesOverrides] = useState({}); // key -> objeto sobrescrito (verificacion/estado)

    // ==================== CONFIGURACIÓN DE CURSOS Y GRUPOS ====================

    // ❌ CURSOS FIJOS - HARDCODEADOS en el frontend
    // Estos NO cambian desde el backend, están definidos aquí:
    const cursosDisponibles = ['EEAU', 'EEAP', 'DIGI-START', 'MINDBRIDGE', 'SPEAKUP', 'PCE'];

    //  PROFESORES DINÁMICOS - TODO viene del backend  
    // Asignaciones pueden cambiar: reasignar profesores a diferentes grupos
    // TODO: CONECTAR CON BACKEND - Endpoint: GET /api/profesores/asignaciones
    // ¡¡¡ ESTOS DATOS SÍ VIENEN DEL BACKEND !!!
    const [profesoresAsignados, setProfesoresAsignados] = useState({});

    /*
    ========== ESTRUCTURA DE DATOS BACKEND - ACLARACIÓN IMPORTANTE ==========
    
    ❌ CURSOS: FIJOS en el frontend ['EEAU', 'EEAP', 'DIGI-START', 'MINDBRIDGE', 'SPEAKUP', 'PCE']
       → NO requieren endpoint del backend
       → Están hardcodeados en el componente
       → Solo se cambian editando el código frontend
    
     DINÁMICO desde el backend (TODO viene de APIs):
    
    1. GRUPOS/TURNOS POR CURSO:
       Endpoint: GET /api/cursos/{curso}/grupos
       Response: [
         { 
           id: 1, 
           nombre: "V1", 
           tipo: "vespertino", 
           capacidad: 30,        ← DINÁMICO: Admin puede cambiar
           alumnosActuales: 8    ← DINÁMICO: Se actualiza automáticamente
         }
       ]
       
    2. ASIGNACIÓN DE PROFESORES:
       Endpoint: GET /api/profesores/asignaciones
       Response: {
         "EEAU": {
           "V1": { 
             nombre: "García López",  ← DINÁMICO: Admin puede reasignar
             id: 123 
           }
         }
       }
    

    ========== FIN ACLARACIÓN ==========
    */

    // ==================== UTILIDADES ====================

    const isPdf = modalComprobante.comprobante?.toLowerCase().endsWith('.pdf');

    // Genera folio dinámico basado en el curso y año actual (los renombro por la cuestion del espacio)
    const generateFolio = (cursoComprado) => {
        const year = new Date().getFullYear();
        const courseCode = cursoComprado.includes('EEAU') ? 'EEAU' :
            cursoComprado.includes('EEAP') ? 'EEAP' :
                cursoComprado.includes('DIGI-START') ? 'DIGI' :
                    cursoComprado.includes('MINDBRIDGE') ? 'MIND' :
                        cursoComprado.includes('SPEAKUP') ? 'SPEAK' :
                            cursoComprado.includes('PCE') ? 'PCE' : 'GEN';

        // Obtener el siguiente número secuencial
        const allFolios = [
            ...comprobantes,
            ...comprobantesAprobados,
            ...comprobantesRechazados
        ].map(c => c.folio || '').filter(Boolean);

        const foliosOfYear = allFolios.filter(folio =>
            folio.includes(`-${year}-`) && folio.includes(courseCode)
        );

        const nextNumber = foliosOfYear.length + 1;
        const paddedNumber = nextNumber.toString().padStart(4, '0');

        return `MQ${courseCode}-${year}-${paddedNumber}`;
    };

    // Obtener valor de campo editable o valor original, evitando null en inputs
    const getFieldValue = (comprobante, field) => {
        const byId = comprobante.id_estudiante ?? comprobante.id ?? comprobante.folio;
        const raw = (editableFields[byId]?.[field] ?? comprobante[field]);
        return raw == null ? '' : raw;
    };

    // Handler para actualizar campos editables por comprobante y campo
    const handleFieldChange = (comprobante, field, value) => {
        const byId = comprobante.id_estudiante ?? comprobante.id ?? comprobante.folio;
        setEditableFields(prev => ({
            ...prev,
            [byId]: {
                ...prev[byId],
                [field]: value
            }
        }));
    };

    // Iniciar edición de una celda aprobada
    const startEditApprovedCell = (comprobante, field) => {
        const key = comprobante.id_estudiante ?? comprobante.id ?? comprobante.folio;
        setEditingCell({ key, field });
        setEditableFields(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                importe: getFieldValue(comprobante, 'importe') || comprobante.importe || '',
                metodoPago: getFieldValue(comprobante, 'metodoPago') || comprobante.metodoPago || comprobante.metodo || ''
            }
        }));
    };

    const saveApprovedEdit = (comprobante) => {
        if (!editingCell) return;
        const key = editingCell.key;
        const field = editingCell.field;
        const importeRaw = getFieldValue(comprobante, 'importe');
        const metodoRaw = getFieldValue(comprobante, 'metodoPago') || getFieldValue(comprobante, 'metodo');
        if (field === 'importe') {
            if (!importeRaw || String(importeRaw).trim() === '') { alert('El importe es obligatorio'); return; }
            const num = Number(importeRaw); if (isNaN(num) || num < 0) { alert('Importe inválido'); return; }
        }
        if (field === 'metodoPago') {
            if (!metodoRaw || String(metodoRaw).trim() === '') { alert('El método es obligatorio'); return; }
        }
        const num = Number(importeRaw); const importeFormat = isNaN(num) ? comprobante.importe : num.toFixed(2);
        // TODO: persistir cambios en backend (PATCH /api/comprobantes/{folio})
        setComprobantesOverrides(prev => ({
            ...prev,
            [key]: {
                ...comprobante,
                importe: importeFormat,
                metodoPago: metodoRaw,
                metodo: metodoRaw
            }
        }));
        setEditingCell(null);
        setToast({ msg: 'Cambios guardados', type: 'success' });
    };

    const cancelApprovedEdit = (comprobante) => {
        if (!editingCell) return;
        const key = editingCell.key;
        setEditableFields(prev => ({
            ...prev,
            [key]: {
                importe: comprobante.importe ?? '',
                metodoPago: comprobante.metodoPago || comprobante.metodo || ''
            }
        }));
        setEditingCell(null);
    };

    // Obtiene los comprobantes según la vista activa Y filtrados por curso/grupo seleccionado
    const getComprobantesActuales = () => {
        let comprobantesBase;
        switch (vistaActual) {
            case 'aprobados':
                comprobantesBase = comprobantesAprobados;
                break;
            case 'rechazados':
                comprobantesBase = comprobantesRechazados;
                break;
            default:
                comprobantesBase = comprobantes;
        }

        // FILTRAR por curso y grupo seleccionado
        if (activeCategory && activeVespertino) {
            const filtroGrupo = `${activeCategory} - Grupo ${activeVespertino}`;
            return comprobantesBase.filter(comprobante =>
                comprobante.cursoComprado === filtroGrupo
            );
        }

        return comprobantesBase;
    };

    // Título dinámico según la vista Y grupo seleccionado
    const getTituloVista = () => {
        const grupoInfo = activeCategory && activeVespertino ? ` - ${activeCategory} ${activeVespertino}` : '';

        switch (vistaActual) {
            case 'aprobados':
                return `Comprobantes Aprobados${grupoInfo}`;
            case 'rechazados':
                return `Comprobantes Rechazados${grupoInfo}`;
            default:
                return `Comprobantes Pendientes${grupoInfo}`;
        }
    };

    // Obtiene el profesor asignado al grupo seleccionado
    const getProfesorAsignado = () => {
        if (activeCategory && activeVespertino) {
            const profesor = profesoresAsignados[activeCategory]?.[activeVespertino];
            return profesor?.nombre || 'Sin asignar';
        }
        return null;
    };

    // 🔧 CONTADORES DINÁMICOS - Solo para el grupo seleccionado
    const getContadoresParaGrupo = () => {
        if (!activeCategory || !activeVespertino) {
            return { pendientes: 0, aprobados: 0, rechazados: 0 };
        }

        const filtroGrupo = `${activeCategory} - Grupo ${activeVespertino}`;

        const pendientes = comprobantes.filter(c => c.cursoComprado === filtroGrupo).length;
        const aprobados = comprobantesAprobados.filter(c => c.cursoComprado === filtroGrupo).length;
        const rechazados = comprobantesRechazados.filter(c => c.cursoComprado === filtroGrupo).length;

        return { pendientes, aprobados, rechazados };
    };

    // ==================== EFECTOS ====================

    // TODO: IMPLEMENTAR - Cargar datos dinámicos desde el backend
    useEffect(() => {
        // IMPLEMENTAR ESTAS LLAMADAS AL BACKEND

        const loadInitialData = async () => {
            try {
                // 1. Cargar grupos para todos los cursos (los cursos son fijos)
                // const gruposData = {};
                // for (const curso of cursosDisponibles) {
                //     const gruposResponse = await api.get(`/api/cursos/${curso}/grupos`);
                //     gruposData[curso] = gruposResponse.data;
                // }
                // setGruposPorCurso(gruposData);

                // 2. Cargar profesores asignados
                // const profesoresResponse = await api.get('/api/profesores/asignaciones');
                // setProfesoresAsignados(profesoresResponse.data);

                // 3. Cargar comprobantes pendientes
                // const comprobantesResponse = await api.get('/api/comprobantes/pendientes');
                // setComprobantes(comprobantesResponse.data);

                // 4. Cargar historial de comprobantes
                // const [aprobados, rechazados] = await Promise.all([
                //     api.get('/api/comprobantes/aprobados'),
                //     api.get('/api/comprobantes/rechazados')
                // ]);
                // setComprobantesAprobados(aprobados.data);
                // setComprobantesRechazados(rechazados.data);

            } catch (error) {
                // Error manejado por el contexto
            }
        };

        // loadInitialData();
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

    // Manejo del tooltip de PDF
    useEffect(() => {
        if (modalComprobante.isOpen && isPdf) {
            const hideTip = localStorage.getItem('hidePdfZoomTip');
            if (hideTip !== 'true') {
                setShowPdfTip(true);
            }
        } else {
            setShowPdfTip(false);
        }
    }, [modalComprobante.isOpen, isPdf]);

    // ========================================
    // MANEJADORES DE EVENTOS 
    // ========================================

    const { getGrupo } = useEstudiantes();

    const { getComprobantes, comprobantes: comprobantesObtenidos, getVerificacionComprobante, rejectVerificacionComprobante } = useComprobante();

    // Normalizar datos del contexto (armonizar nombre de campo metodo/metodoPago)
    const normalizeComprobante = (c) => {
        if (!c || typeof c !== 'object') return c;
        // Si backend manda 'metodo' copiar a metodoPago para UI consistente
        if (c.metodo && !c.metodoPago) {
            return { ...c, metodoPago: c.metodo };
        }
        // Si sólo hay metodoPago pero no metodo, generar metodo para compatibilidad con usos antiguos
        if (c.metodoPago && !c.metodo) {
            return { ...c, metodo: c.metodoPago };
        }
        return c;
    };
    const baseArrayRaw = Array.isArray(comprobantesObtenidos)
        ? comprobantesObtenidos
        : (comprobantesObtenidos ? [comprobantesObtenidos] : []);
    const baseArray = baseArrayRaw.map(normalizeComprobante);

    // Merge overrides locales (aprobados / rechazados hechos en UI sin persistir todavía)
    const mergedMap = {};
    baseArray.forEach(c => {
        const k = c.id_estudiante ?? c.id ?? c.folio;
        mergedMap[k] = c;
    });
    Object.entries(comprobantesOverrides).forEach(([k, ov]) => {
        mergedMap[k] = { ...(mergedMap[k] || {}), ...ov };
    });
    const mergedArray = Object.values(mergedMap);

    // Derivar listas por estado/verificacion
    // Solo mostrar como pendiente si tiene comprobante subido (tiene campo comprobante o id de comprobante)
    const pendientes = mergedArray.filter(c => {
        // Debe tener un comprobante subido (tiene campo comprobante o es un registro de comprobante válido)
        const tieneComprobante = c.comprobante || c.id || (c.verificacion !== undefined && c.verificacion !== null);
        if (!tieneComprobante) return false;
        // Solo pendientes: verificacion === 1 O (sin verificacion pero con comprobante y no está rechazado/aprobado)
        return Number(c.verificacion) === 1 || (!c.verificacion && c.comprobante && c.estado !== 'rechazado' && c.estado !== 'aprobado');
    });
    const aprobados = mergedArray.filter(c => Number(c.verificacion) === 2 || c.estado === 'aprobado');
    const rechazados = mergedArray.filter(c => {
        const v = Number(c.verificacion);
        const estado = c.estado;
        const motivo = (c.motivoRechazo ?? '').toString().trim();
        // Considerar rechazados por:
        // - verificacion=3
        // - estado='rechazado' (override UI)
        // - tiene motivoRechazo y NO está aprobado actualmente
        return v === 3 || estado === 'rechazado' || (motivo !== '' && v !== 2);
    });
    const currentList = vistaActual === 'aprobados' ? aprobados : vistaActual === 'rechazados' ? rechazados : pendientes;

    // Persistir el término de búsqueda de aprobados
    useEffect(() => {
        sessionStorage.setItem('compRecibo_aprobados_searchTerm', approvedSearchTerm || '');
    }, [approvedSearchTerm]);

    // Filtrar solo la lista de aprobados según el buscador
    const displayedList = (() => {
        if (vistaActual !== 'aprobados') return currentList;
        const term = (approvedSearchTerm || '').trim().toLowerCase();
        if (!term) return currentList;
        const twoDigits = (() => {
            const y = new Date().getFullYear() + 1;
            return String(y).slice(-2);
        })();
        const safe = (v) => (v === undefined || v === null) ? '' : String(v).toLowerCase();
        return currentList.filter(c => {
            // Folio mostrado en tabla, y variaciones comunes
            const folioRaw = String(c.folio ?? '').padStart(4, '0');
            const folioShown = `m${(activeCategory || '').toUpperCase()}${twoDigits}-${folioRaw}`.toLowerCase();
            const folioSimple = String(c.folio ?? '').toLowerCase();
            // Nombre completo
            const nombre = safe(c.nombre) + ' ' + safe(c.apellidos);
            // Metodo e importe
            const metodo = safe(c.metodoPago || c.metodo);
            const importe = safe(c.importe);
            // Correos si existieran en el objeto
            const correo = safe(c.correo || c.correoElectronico);
            return (
                nombre.includes(term) ||
                folioShown.includes(term) ||
                folioRaw.includes(term) ||
                folioSimple.includes(term) ||
                metodo.includes(term) ||
                importe.includes(term) ||
                correo.includes(term)
            );
        });
    })();
    const apiOrigin = (import.meta?.env?.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '')).replace(/\/api\/?$/, '');

    // Sincronizar estado base 'comprobantes' sólo cuando cambian datos del backend
    useEffect(() => {
        setComprobantes(baseArray);
    }, [comprobantesObtenidos]);

    // Navegación entre cursos
    const handleCategorySelect = (categoria) => {
        if (activeCategory === categoria) {
            setActiveCategory('');
            setActiveVespertino('');
            setShowContent(false);
        } else {
            setActiveCategory(categoria);
            setActiveVespertino('');
            setShowContent(false);
            // Mostrar TODOS los grupos (incluyendo aquellos con solo rechazados o pendientes)
            // Sigue excluyendo soft-deleted desde el backend
            getGrupo(categoria, 'todos');
        }
    };

    const handleVespertinoSelect = (vespertino) => {
        if (activeVespertino === vespertino) {
            setActiveVespertino('');
            setShowContent(false);
        } else {
            setActiveVespertino(vespertino);
            setShowContent(true);
            getComprobantes(vespertino, activeCategory);
        }
    };

    // Deep-link: si hay ?curso=EEAU&grupo=V2 en la URL, preseleccionar y cargar
    useEffect(() => {
        try {
            const params = new URLSearchParams(location?.search || window.location.search || '');
            const cursoParam = params.get('curso');
            const grupoParam = params.get('grupo');
            if (cursoParam && cursosDisponibles.includes(cursoParam)) {
                // Seleccionar curso y cargar grupos 'todos' para asegurar presencia aunque solo haya rechazados
                setActiveCategory(cursoParam);
                getGrupo(cursoParam, 'todos');
                if (grupoParam) {
                    // Pequeño delay para asegurar que gruposObtenidos se llene antes de pedir comprobantes
                    setTimeout(() => {
                        setActiveVespertino(grupoParam);
                        setShowContent(true);
                        getComprobantes(grupoParam, cursoParam);
                    }, 50);
                }
            }
        } catch (_) { /* noop */ }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Escuchar eventos WS del admin para refrescar en tiempo real la tabla si coincide curso/grupo
    useEffect(() => {
        const onAdminEvent = (e) => {
            const data = e.detail;
            if (!data) return;
            if (data.type === 'new_comprobante') {
                const p = data.payload || {};
                if (p.curso === activeCategory && p.grupo === activeVespertino) {
                    // Refrescar listado actual
                    getComprobantes(activeVespertino, activeCategory);
                }
            }
        };
        window.addEventListener('admin-ws-message', onAdminEvent);
        return () => window.removeEventListener('admin-ws-message', onAdminEvent);
    }, [activeCategory, activeVespertino]);

    // Auto-ocultar overlay tras 2s para simular la carga inicial
    useEffect(() => {
        if (!showLoadingScreen) return;
        const t = setTimeout(() => {
            setShowLoadingScreen(false);
            setIsLoading(false);
        }, 2000);
        return () => clearTimeout(t);
    }, [showLoadingScreen]);

    // ==================== ACCIONES DE COMPROBANTES ====================

    /*
    ========== ENDPOINTS NECESARIOS PARA EL BACKEND ==========
    
     IMPORTANTE: Los cursos ['EEAU', 'EEAP', 'DIGI-START', 'MINDBRIDGE', 'SPEAKUP', 'PCE'] 
        están FIJOS en el frontend y NO requieren endpoint.
    
    === CONFIGURACIÓN DINÁMICA ===
    1. GET /api/cursos/{curso}/grupos
       - Parámetro: curso (uno de los 6 cursos fijos)
       - Response: Array con grupos del curso:
         [{ 
           id: 1, 
           nombre: "V1", 
           tipo: "vespertino", 
           capacidad: 10,        ← Admin puede modificar
           alumnosActuales: 8    ← Se actualiza automáticamente
         }]
         
    2. GET /api/profesores/asignaciones
       - Response: Objeto con asignaciones dinámicas:
         { "EEAU": { "V1": { nombre: "García López", id: 123 } } }
    
    === GESTIÓN DE COMPROBANTES ===
    3. POST /api/comprobantes/{id}/rechazar
    4. POST /api/comprobantes/{id}/aprobar  
    5. GET /api/comprobantes/pendientes
    6. GET /api/comprobantes/aprobados
    7. GET /api/comprobantes/rechazados
    
  
    
    ========== FIN LISTA DE ENDPOINTS ==========
    */

    // TODO: Conectar con API - Endpoint: POST /api/comprobantes/{id}/rechazar
    const handleRechazar = (comprobante) => {
        setCurrentComprobante(normalizeComprobante(comprobante));
        setShowRejectModal(true);
    };

    // TODO: Conectar con API - Enviar motivo de rechazo al backend
    const confirmarRechazo = async () => {
        if (!motivoRechazo.trim()) {
            alert('Por favor, ingresa el motivo del rechazo');
            return;
        }
        // Validar campos obligatorios importe y método
        const importeActualizadoRaw = getFieldValue(currentComprobante, 'importe');
        const metodoPagoActualizadoRaw = getFieldValue(currentComprobante, 'metodoPago');
        if (!importeActualizadoRaw || String(importeActualizadoRaw).trim() === '') {
            alert('El campo Importe es obligatorio para rechazar.');
            return;
        }
        const importeNumber = Number(importeActualizadoRaw);
        if (isNaN(importeNumber) || importeNumber < 0) {
            alert('El importe debe ser un número válido (no negativo).');
            return;
        }
        if (!metodoPagoActualizadoRaw || String(metodoPagoActualizadoRaw).trim() === '') {
            alert('El campo Método de Pago es obligatorio para rechazar.');
            return;
        }
        try {
            // Obtener los valores editados o usar los originales
            const importeActualizado = importeNumber.toFixed(2);
            const metodoPagoActualizado = metodoPagoActualizadoRaw;
            // Persistir rechazo en backend (verificacion=3)
            const folioParaRechazo = currentComprobante.folio || generateFolio(currentComprobante.cursoComprado);
            // Optimistic UI primero
            const key = (currentComprobante.id_estudiante ?? currentComprobante.id ?? currentComprobante.folio) || generateFolio(currentComprobante.cursoComprado);
            const folioFinal = currentComprobante.folio || generateFolio(currentComprobante.cursoComprado);
            setComprobantesOverrides(prev => ({
                ...prev,
                [key]: {
                    ...currentComprobante,
                    folio: folioFinal,
                    importe: importeActualizado,
                    metodoPago: metodoPagoActualizado,
                    metodo: metodoPagoActualizado,
                    estado: 'rechazado',
                    verificacion: 3,
                    motivoRechazo: motivoRechazo,
                    fechaRechazo: new Date().toLocaleString()
                }
            }));
            // Llamada backend después (sin bloquear UI)
            try {
                await rejectVerificacionComprobante(folioParaRechazo, { motivo: motivoRechazo, importe: importeActualizado, metodo: metodoPagoActualizado });
            } catch (apiErr) {
                // Error manejado por el contexto
                alert('Rechazo local aplicado, pero falló guardar en servidor. Reintenta.');
            }
            // Limpiar campos editables de ese comprobante
            setEditableFields(prev => {
                const copy = { ...prev };
                delete copy[key];
                return copy;
            });

            setShowRejectModal(false);
            setCurrentComprobante(null);
            setMotivoRechazo('');
            setShowRejectSuccessModal(true);
            setVistaActual('rechazados');

            // Refrescar lista para que persista tras reload usando curso/grupo actuales
            if (activeVespertino && activeCategory) {
                await getComprobantes(activeVespertino, activeCategory);
            }

            // Opcional: limpiar override si backend ya refleja estado
            // (mantener por ahora por consistencia con aprobación)
        } catch (error) {
            // Error manejado por el contexto
            alert('Error al procesar el rechazo. Intenta nuevamente.');
        }
    };

    // TODO: Conectar con API - Endpoint: POST /api/comprobantes/{id}/aprobar
    const handleValidar = async (comprobante) => {
        try {
            const folio = comprobante.folio;
            if (folio === undefined || folio === null || String(folio).trim() === '') {
                alert('Folio no encontrado. No se puede validar.');
                return;
            }
            // Obtener los valores editados o usar los originales
            const importeActualizadoRaw = getFieldValue(comprobante, 'importe');
            const metodoPagoActualizadoRaw = getFieldValue(comprobante, 'metodoPago');
            if (!importeActualizadoRaw || String(importeActualizadoRaw).trim() === '') {
                alert('El campo Importe es obligatorio para validar.');
                return;
            }
            const importeNumber = Number(importeActualizadoRaw);
            if (isNaN(importeNumber) || importeNumber < 0) {
                alert('El importe debe ser un número válido (no negativo).');
                return;
            }
            if (!metodoPagoActualizadoRaw || String(metodoPagoActualizadoRaw).trim() === '') {
                alert('El campo Método de Pago es obligatorio para validar.');
                return;
            }
            const importeActualizado = importeNumber.toFixed(2);
            const metodoPagoActualizado = metodoPagoActualizadoRaw;
            const dataComplete = {
                importe: importeActualizado,
                metodo: metodoPagoActualizado,
            };
            // Optimistic UI ANTES de llamar API
            const key = comprobante.id_estudiante ?? comprobante.id ?? comprobante.folio;
            setComprobantesOverrides(prev => ({
                ...prev,
                [key]: {
                    ...comprobante,
                    importe: importeActualizado,
                    metodoPago: metodoPagoActualizado,
                    metodo: metodoPagoActualizado,
                    estado: 'aprobado',
                    verificacion: 2,
                    fechaAprobacion: new Date().toLocaleString()
                }
            }));
            setVistaActual('aprobados');
            setShowSuccessModal(true);
            // Llamada backend luego, y refresco al terminar
            try {
                await getVerificacionComprobante(folio, dataComplete);
                await getComprobantes(activeVespertino, activeCategory);
            } catch (apiErr) {
                // Error manejado por el contexto
                alert('Aprobación mostrada localmente, pero falló guardar en servidor. Reintenta.');
            }
        } catch (error) {
            // Error manejado por el contexto
            alert('Error al procesar la aprobación. Intenta nuevamente.');
        }
    };

    // ==================== VISOR DE COMPROBANTES ====================

    const handleVerComprobante = (comprobante) => {
        setModalComprobante({
            isOpen: true,
            comprobante: comprobante,
            zoomLevel: 1
        });
    };

    const closeModal = () => {
        setModalComprobante({ isOpen: false, comprobante: null, zoomLevel: 1 });
    }

    const { grupos: gruposObtenidos } = useEstudiantes();

    function obtenerDosUltimosDigitosAnioSiguiente() {
        const fechaActual = new Date();
        const anioSiguiente = fechaActual.getFullYear() + 1;
        return anioSiguiente.toString().slice(-2);
    }

    // Controles de zoom para imágenes
    const handleZoomIn = () => setModalComprobante(prev => ({ ...prev, zoomLevel: Math.min(prev.zoomLevel + 0.2, 3) }));
    const handleZoomOut = () => setModalComprobante(prev => ({ ...prev, zoomLevel: Math.max(prev.zoomLevel - 0.2, 0.2) }));
    const handleResetZoom = () => setModalComprobante(prev => ({ ...prev, zoomLevel: 1 }));

    const handleDismissPdfTip = (permanently) => {
        if (permanently) {
            localStorage.setItem('hidePdfZoomTip', 'true');
        }
        setShowPdfTip(false);
    };


    // ==================== RENDER ====================

    return (
        <div className="w-full h-full min-h-[calc(100vh-80px)] flex flex-col bg-white overflow-x-hidden">
            {showLoadingScreen && (
                <LoadingOverlay message="Cargando validación de recibos..." />
            )}
            {/* ==================== HEADER Y FILTROS ==================== */}
            <div className="pt-6 xs:pt-8 sm:pt-10 md:pt-12 pb-2 xs:pb-2 sm:pb-3 w-full max-w-full mx-auto">
                <div className="w-full max-w-full mx-auto px-2 xs:px-3 sm:px-4">
                    {/* Título principal */}
                    <div className="text-center mb-3 xs:mb-4 sm:mb-5">
                        <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-extrabold 
                            bg-gradient-to-r from-purple-600 to-purple-700
                            bg-clip-text text-transparent
                            mb-2 xs:mb-3 sm:mb-4">
                            Seleccionar Curso para Comprobantes de Pago
                        </h1>
                        <p className="text-xs xs:text-sm sm:text-base text-gray-700 font-semibold">
                            Selecciona el curso para gestionar los comprobantes de pago
                        </p>
                    </div>

                    {/* Selector de cursos */}
                    <div className="mb-3 xs:mb-4 sm:mb-5">
                        <div className="bg-gradient-to-br from-white via-gray-50 to-slate-50 rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-5 shadow-lg border border-gray-200">
                            <h2 className="text-base xs:text-lg sm:text-xl font-extrabold text-gray-800 mb-3 xs:mb-4 sm:mb-5 text-center">
                                Cursos Disponibles
                            </h2>
                            <div className="grid grid-cols-3 xs:grid-cols-3 sm:grid-cols-6 md:grid-cols-6 gap-1 xs:gap-1.5 sm:gap-2 justify-items-center">
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
                    {activeCategory && (
                        <div className="mb-3 xs:mb-4 sm:mb-5">
                            <div className="bg-gradient-to-br from-white via-gray-50 to-slate-50 rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-5 shadow-lg border border-gray-200">
                                <h2 className="text-base xs:text-lg sm:text-xl font-extrabold text-gray-800 mb-3 xs:mb-4 sm:mb-5 text-center">
                                    Grupos Disponibles para {activeCategory}
                                </h2>
                                <div className="flex flex-wrap gap-1.5 xs:gap-2 sm:gap-3 justify-center items-center w-full max-w-full mx-auto">
                                    {Array.isArray(gruposObtenidos) ? (
                                        gruposObtenidos.map((data, index) => (
                                            <VespertinoButton
                                                key={index}
                                                label={`${data.grupo} (${data.cantidad_estudiantes})`}
                                                isActive={activeVespertino === data.grupo}
                                                onClick={() => handleVespertinoSelect(data.grupo)}
                                                profesorAsignado={
                                                    activeVespertino === data.grupo
                                                        ? profesoresAsignados[activeCategory]?.[data.grupo]?.nombre
                                                        : null
                                                }
                                                grupo={data.grupo}
                                            />
                                        ))
                                    ) : gruposObtenidos ? (
                                        <VespertinoButton
                                            key={gruposObtenidos.grupo}
                                            label={`${gruposObtenidos.grupo} (${gruposObtenidos.cantidad_estudiantes})`}
                                            isActive={activeVespertino === gruposObtenidos.grupo}
                                            onClick={() => handleVespertinoSelect(gruposObtenidos.grupo)}
                                            profesorAsignado={
                                                activeVespertino === gruposObtenidos.grupo
                                                    ? profesoresAsignados[activeCategory]?.[gruposObtenidos.grupo]?.nombre
                                                    : null
                                            }
                                            grupo={gruposObtenidos.grupo}
                                        />
                                    ) : (
                                        <p>No hay grupos disponibles</p>
                                    )
                                    }
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
                    {activeCategory && activeVespertino && (
                        <div className="mb-4 xs:mb-5 sm:mb-6">
                            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 xs:px-6 sm:px-8 py-4 xs:py-5 sm:py-6 rounded-xl sm:rounded-2xl shadow-lg border-2 border-purple-400/40 ring-2 ring-purple-200/20">
                                <div className="text-center">
                                    <p className="text-base xs:text-lg sm:text-xl md:text-2xl font-extrabold mb-2 xs:mb-3">
                                        Grupo Activo: {activeCategory} - {activeVespertino}
                                    </p>
                                    {getProfesorAsignado() && getProfesorAsignado() !== 'Sin asignar' && (
                                        <p className="text-xs xs:text-sm sm:text-base md:text-lg text-purple-50 font-semibold">
                                            Profesor Asignado: <span className="font-extrabold text-white">{getProfesorAsignado()}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navegación entre vistas */}
                    {activeCategory && activeVespertino && (
                        <div className="mb-4 xs:mb-5 sm:mb-6">
                            <div className="bg-white rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-5 shadow-lg border border-gray-200">
                                <div className="flex flex-wrap gap-2 xs:gap-3 sm:gap-4 justify-center">
                                    <button
                                        onClick={() => setVistaActual('pendientes')}
                                        className={`px-4 xs:px-5 sm:px-6 py-2 xs:py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-extrabold text-xs xs:text-sm sm:text-base transition-all duration-300 flex items-center space-x-2 
                                        active:scale-95 touch-manipulation
                                        ring-2 ring-transparent
                                        ${vistaActual === 'pendientes'
                                                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg transform scale-105 ring-orange-200/30'
                                                : 'bg-gray-100 text-gray-700 hover:bg-orange-50 hover:ring-orange-100/30 border-2 border-gray-300'
                                            }`}
                                    >
                                        <svg className="w-4 h-4 xs:w-5 xs:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Pendientes ({pendientes.length})</span>
                                    </button>
                                    <button
                                        onClick={() => setVistaActual('aprobados')}
                                        className={`px-4 xs:px-5 sm:px-6 py-2 xs:py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-extrabold text-xs xs:text-sm sm:text-base transition-all duration-300 flex items-center space-x-2 
                                        active:scale-95 touch-manipulation
                                        ring-2 ring-transparent
                                        ${vistaActual === 'aprobados'
                                                ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg transform scale-105 ring-green-200/30'
                                                : 'bg-gray-100 text-gray-700 hover:bg-green-50 hover:ring-green-100/30 border-2 border-gray-300'
                                            }`}
                                    >
                                        <svg className="w-4 h-4 xs:w-5 xs:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Aprobados ({aprobados.length})</span>
                                    </button>
                                    <button
                                        onClick={() => setVistaActual('rechazados')}
                                        className={`px-4 xs:px-5 sm:px-6 py-2 xs:py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-extrabold text-xs xs:text-sm sm:text-base transition-all duration-300 flex items-center space-x-2 
                                        active:scale-95 touch-manipulation
                                        ring-2 ring-transparent
                                        ${vistaActual === 'rechazados'
                                                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg transform scale-105 ring-red-200/30'
                                                : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:ring-red-100/30 border-2 border-gray-300'
                                            }`}
                                    >
                                        <svg className="w-4 h-4 xs:w-5 xs:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Rechazados ({rechazados.length})</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ==================== TABLA DE COMPROBANTES ==================== */}
            {showContent && (
                <div className="flex-1 px-2 xs:px-4 sm:px-6 pb-4 xs:pb-6 w-full max-w-full overflow-x-hidden">
                    <div className="w-full max-w-full mx-auto">
                        <div className="bg-white rounded-lg xs:rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                            <div className="px-4 xs:px-6 py-4 bg-gray-50 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800">{getTituloVista()}</h3>
                            </div>

                            <div className="overflow-x-auto">
                                {vistaActual === 'aprobados' && (
                                    <div className="px-4 xs:px-6 pt-4 pb-2 bg-white border-b border-gray-200">
                                        <div className="w-full max-w-full mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <div className="flex-1">
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        placeholder="Buscar en aprobados: nombre, folio, correo, método..."
                                                        value={approvedSearchTerm}
                                                        onChange={(e) => setApprovedSearchTerm(e.target.value)}
                                                        className="w-full px-3 xs:px-4 py-2 xs:py-3 pl-8 xs:pl-10 pr-8 xs:pr-10 text-xs xs:text-sm border border-gray-300 rounded-md xs:rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                    />
                                                    <div className="absolute inset-y-0 left-0 pl-2 xs:pl-3 flex items-center pointer-events-none">
                                                        <svg className="h-4 xs:h-5 w-4 xs:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                        </svg>
                                                    </div>
                                                    {approvedSearchTerm && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setApprovedSearchTerm('')}
                                                            className="absolute inset-y-0 right-0 pr-2 xs:pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                                            aria-label="Limpiar búsqueda"
                                                            title="Limpiar"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 xs:h-5 xs:w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-10.293a1 1 0 00-1.414-1.414L10 8.586 7.707 6.293a1 1 0 10-1.414 1.414L8.586 10l-2.293 2.293a1 1 0 101.414 1.414L10 11.414l2.293 2.293a1 1 0 001.414-1.414L11.414 10l2.293-2.293z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                                {approvedSearchTerm && (
                                                    <div className="mt-1 text-right text-[11px] xs:text-xs text-gray-500">
                                                        Mostrando {displayedList.length} resultado{displayedList.length === 1 ? '' : 's'}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-none">
                                                <button
                                                    type="button"
                                                    onClick={() => exportApprovedComprobantesToExcel(displayedList, { curso: activeCategory, grupo: activeVespertino, apiOrigin })}
                                                    className="inline-flex items-center px-3 py-2 rounded-md text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors"
                                                    title="Exportar tabla de aprobados a Excel"
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v8m-4-4h8m4 4v3a2 2 0 01-2 2H6a2 2 0 01-2-2v-3m16-4V7a2 2 0 00-2-2h-3.5a2 2 0 01-1.4-.6l-1.9-1.9A2 2 0 008.9 2H6a2 2 0 00-2 2v7" /></svg>
                                                    Exportar Excel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <table className="w-full table-fixed">
                                    <thead>
                                        <tr className={`${vistaActual === 'aprobados' ? 'bg-gradient-to-r from-green-700 to-green-800' :
                                            vistaActual === 'rechazados' ? 'bg-gradient-to-r from-red-700 to-red-800' :
                                                'bg-gradient-to-r from-gray-800 to-gray-900'} text-white`}>
                                            <th className="w-20 px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-center text-xs xs:text-sm font-semibold uppercase tracking-wider border-r border-gray-300">Folio</th>
                                            <th className="w-40 px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-center text-xs xs:text-sm font-semibold uppercase tracking-wider border-r border-gray-300">Nombre del Alumno</th>
                                            <th className="w-32 px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-center text-xs xs:text-sm font-semibold uppercase tracking-wider border-r border-gray-300">Fecha y Hora</th>
                                            <th className="w-24 px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-center text-xs xs:text-sm font-semibold uppercase tracking-wider border-r border-gray-300">Importe</th>
                                            <th className="w-28 px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-center text-xs xs:text-sm font-semibold uppercase tracking-wider border-r border-gray-300">Método</th>
                                            {vistaActual === 'rechazados' && (
                                                <th className="w-32 px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-center text-xs xs:text-sm font-semibold uppercase tracking-wider border-r border-gray-300">Motivo Rechazo</th>
                                            )}
                                            {vistaActual === 'aprobados' && (
                                                <th className="w-32 px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-center text-xs xs:text-sm font-semibold uppercase tracking-wider border-r border-gray-300">Fecha Aprobación</th>
                                            )}
                                            {vistaActual === 'rechazados' && (
                                                <th className="w-32 px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-center text-xs xs:text-sm font-semibold uppercase tracking-wider border-r border-gray-300">Fecha Rechazo</th>
                                            )}
                                            <th className="w-32 px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-center text-xs xs:text-sm font-semibold uppercase tracking-wider">Comprobante</th>
                                            {vistaActual === 'pendientes' && (
                                                <th className="w-28 px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-center text-xs xs:text-sm font-semibold uppercase tracking-wider">Acciones</th>
                                            )}
                                            {/* Sin columna extra de edición; edición inline */}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {(vistaActual === 'aprobados' ? displayedList : currentList).length === 0 && (
                                            <tr>
                                                <td colSpan={vistaActual === 'rechazados' ? '8' : vistaActual === 'aprobados' ? '7' : '7'} className="px-4 xs:px-6 py-12 xs:py-16 text-center text-gray-500">
                                                    <div className="flex flex-col items-center">
                                                        <div className={`w-12 xs:w-16 h-12 xs:h-16 rounded-full flex items-center justify-center mb-3 xs:mb-4 ${vistaActual === 'aprobados' ? 'bg-green-100' :
                                                                vistaActual === 'rechazados' ? 'bg-red-100' : 'bg-gray-100'
                                                            }`}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 xs:h-8 w-6 xs:w-8 ${vistaActual === 'aprobados' ? 'text-green-400' :
                                                                    vistaActual === 'rechazados' ? 'text-red-400' : 'text-gray-400'
                                                                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                        </div>
                                                        <p className="text-base xs:text-lg font-medium text-gray-700 mb-1 xs:mb-2">
                                                            {vistaActual === 'aprobados' && 'No hay comprobantes aprobados'}
                                                            {vistaActual === 'rechazados' && 'No hay comprobantes rechazados'}
                                                            {vistaActual === 'pendientes' && 'No hay comprobantes pendientes'}
                                                        </p>
                                                        <p className="text-xs xs:text-sm text-gray-500 px-4">
                                                            {vistaActual === 'aprobados' && 'Los comprobantes aprobados aparecerán aquí'}
                                                            {vistaActual === 'rechazados' && 'Los comprobantes rechazados aparecerán aquí'}
                                                            {vistaActual === 'pendientes' && 'Los comprobantes aparecerán aquí cuando estén disponibles para validación'}
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                        {/* Renderizar lista actual (pendientes/aprobados/rechazados) */}
                                        {(vistaActual === 'aprobados' ? displayedList : currentList).map((comprobante) => (
                                            <tr key={comprobante.id_estudiante ?? `${comprobante.folio}-${comprobante.created_at}`}
                                                className={`hover:bg-gray-50 transition-colors duration-150 ${vistaActual === 'rechazados' ? 'bg-red-50/30' :
                                                        vistaActual === 'aprobados' ? 'bg-green-50/30' : ''
                                                    }`}>
                                                {/* Columna Folio */}
                                                <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-xs xs:text-sm text-gray-900 text-center border-r border-gray-200">
                                                    <div className="font-mono text-purple-600 font-medium">M{activeCategory}{obtenerDosUltimosDigitosAnioSiguiente()}-{String(comprobante.folio).padStart(4, '0')}</div>
                                                </td>

                                                {/* Columna Nombre del Alumno */}
                                                <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-xs xs:text-sm text-gray-900 text-center border-r border-gray-200">
                                                    <div className="font-medium">{comprobante.nombre} {comprobante.apellidos}</div>
                                                </td>

                                                {/* Columna Fecha y Hora  */}
                                                <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 whitespace-nowrap text-xs xs:text-sm text-gray-900 text-center border-r border-gray-200">
                                                    <div className="font-medium">{new Date(comprobante.created_at).toLocaleString('es-MX')}</div>
                                                </td>

                                                {/* Columna Importe - Campo editable (requerido) */}
                                                <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-xs xs:text-sm text-center border-r border-gray-200">
                                                    {vistaActual === 'pendientes' ? (() => {
                                                        const val = getFieldValue(comprobante, 'importe');
                                                        const numeric = Number(val);
                                                        const empty = !val || !String(val).trim();
                                                        const notNumber = !empty && isNaN(numeric);
                                                        const negative = !empty && !notNumber && numeric < 0;
                                                        const invalid = empty || notNumber || negative;
                                                        const errorMsg = empty ? 'Requerido' : notNumber ? 'Número inválido' : negative ? 'No negativos' : '';
                                                        return (
                                                            <div className="space-y-1">
                                                                <input
                                                                    type="text"
                                                                    inputMode="decimal"
                                                                    value={val}
                                                                    onChange={(e) => {
                                                                        let v = e.target.value;
                                                                        v = v.replace(/[^\d.]/g, '');
                                                                        v = v.replace(/(\..*)\./g, '$1');
                                                                        if (v.includes('.')) {
                                                                            const [intPart, decPart] = v.split('.');
                                                                            v = intPart + '.' + (decPart ? decPart.slice(0, 2) : '');
                                                                        }
                                                                        handleFieldChange(comprobante, 'importe', v);
                                                                    }}
                                                                    onBlur={() => {
                                                                        if (!invalid) {
                                                                            const formatted = (val === '' ? '' : Number(val).toFixed(2));
                                                                            if (formatted !== '') handleFieldChange(comprobante, 'importe', formatted);
                                                                        }
                                                                    }}
                                                                    className={`w-full px-2 py-1 text-center border rounded hide-spinner focus:outline-none focus:ring-2 transition-colors duration-150 ${invalid ? 'border-red-500 focus:ring-red-400 focus:border-red-500 bg-red-50 placeholder-red-400' : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'}`}
                                                                    placeholder="0.00"
                                                                />
                                                                {invalid && (
                                                                    <div className="text-[10px] xs:text-[11px] font-medium text-red-600 tracking-wide">{errorMsg}</div>
                                                                )}
                                                            </div>
                                                        );
                                                    })() : vistaActual === 'aprobados' ? (() => {
                                                        const key = comprobante.id_estudiante ?? comprobante.id ?? comprobante.folio;
                                                        const isEditing = editingCell && editingCell.key === key && editingCell.field === 'importe';
                                                        if (isEditing) {
                                                            const val = getFieldValue(comprobante, 'importe');
                                                            const numeric = Number(val);
                                                            const empty = !val || !String(val).trim();
                                                            const notNumber = !empty && isNaN(numeric);
                                                            const negative = !empty && !notNumber && numeric < 0;
                                                            const invalid = empty || notNumber || negative;
                                                            const errorMsg = empty ? 'Requerido' : notNumber ? 'Número inválido' : negative ? 'No negativos' : '';
                                                            return (
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center gap-1">
                                                                        <input
                                                                            autoFocus
                                                                            type="text"
                                                                            inputMode="decimal"
                                                                            value={val}
                                                                            onChange={(e) => {
                                                                                let v = e.target.value;
                                                                                v = v.replace(/[^\d.]/g, '');
                                                                                v = v.replace(/(\..*)\./g, '$1');
                                                                                if (v.includes('.')) {
                                                                                    const [intPart, decPart] = v.split('.');
                                                                                    v = intPart + '.' + (decPart ? decPart.slice(0, 2) : '');
                                                                                }
                                                                                handleFieldChange(comprobante, 'importe', v);
                                                                            }}
                                                                            onKeyDown={(e) => { if (e.key === 'Enter') saveApprovedEdit(comprobante); if (e.key === 'Escape') cancelApprovedEdit(comprobante); }}
                                                                            onBlur={() => { if (isCoarsePointer && !invalid) saveApprovedEdit(comprobante); }}
                                                                            className={`w-full px-2 py-2 text-center border rounded hide-spinner focus:outline-none focus:ring-2 transition-colors duration-150 text-sm ${invalid ? 'border-red-500 focus:ring-red-400 focus:border-red-500 bg-red-50' : 'border-gray-300 focus:ring-green-500 focus:border-green-500'}`}
                                                                            placeholder="0.00"
                                                                        />
                                                                        <button onClick={() => saveApprovedEdit(comprobante)} className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-[10px]">✓</button>
                                                                        <button onClick={() => cancelApprovedEdit(comprobante)} className="px-2 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded text-[10px]">✕</button>
                                                                    </div>
                                                                    {invalid && <div className="text-[10px] font-medium text-red-600">{errorMsg}</div>}
                                                                </div>
                                                            );
                                                        }
                                                        return (
                                                            <div className="font-medium text-green-600 cursor-pointer hover:underline select-none" onClick={() => startEditApprovedCell(comprobante, 'importe')} role="button" aria-label="Editar importe">${comprobante.importe ?? ''}</div>
                                                        );
                                                    })() : (
                                                        <div className="font-medium text-green-600">${comprobante.importe ?? ''}</div>
                                                    )}
                                                </td>

                                                {/* Columna Método - Campo editable (requerido) */}
                                                <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-xs xs:text-sm text-center border-r border-gray-200">
                                                    {vistaActual === 'pendientes' ? (() => {
                                                        const val = getFieldValue(comprobante, 'metodoPago');
                                                        const invalid = !val || !String(val).trim();
                                                        return (
                                                            <div className="space-y-1">
                                                                <input
                                                                    type="text"
                                                                    value={val}
                                                                    onChange={(e) => handleFieldChange(comprobante, 'metodoPago', e.target.value)}
                                                                    className={`w-full px-2 py-1 text-center border rounded focus:outline-none focus:ring-2 transition-colors duration-150 ${invalid ? 'border-red-500 focus:ring-red-400 focus:border-red-500 bg-red-50 placeholder-red-400' : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'}`}
                                                                    placeholder="Método de pago"
                                                                />
                                                                {invalid && (
                                                                    <div className="text-[10px] xs:text-[11px] font-medium text-red-600 tracking-wide">Requerido</div>
                                                                )}
                                                            </div>
                                                        );
                                                    })() : vistaActual === 'aprobados' ? (() => {
                                                        const key = comprobante.id_estudiante ?? comprobante.id ?? comprobante.folio;
                                                        const isEditing = editingCell && editingCell.key === key && editingCell.field === 'metodoPago';
                                                        if (isEditing) {
                                                            const val = getFieldValue(comprobante, 'metodoPago');
                                                            const invalid = !val || !String(val).trim();
                                                            return (
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center gap-1">
                                                                        <input
                                                                            autoFocus
                                                                            type="text"
                                                                            value={val}
                                                                            onChange={(e) => handleFieldChange(comprobante, 'metodoPago', e.target.value)}
                                                                            onKeyDown={(e) => { if (e.key === 'Enter') saveApprovedEdit(comprobante); if (e.key === 'Escape') cancelApprovedEdit(comprobante); }}
                                                                            onBlur={() => { if (isCoarsePointer && !invalid) saveApprovedEdit(comprobante); }}
                                                                            className={`w-full px-2 py-2 text-center border rounded focus:outline-none focus:ring-2 transition-colors duration-150 text-sm ${invalid ? 'border-red-500 focus:ring-red-400 focus:border-red-500 bg-red-50' : 'border-gray-300 focus:ring-green-500 focus:border-green-500'}`}
                                                                            placeholder="Método de pago"
                                                                        />
                                                                        <button onClick={() => saveApprovedEdit(comprobante)} className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-[10px]">✓</button>
                                                                        <button onClick={() => cancelApprovedEdit(comprobante)} className="px-2 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded text-[10px]">✕</button>
                                                                    </div>
                                                                    {invalid && <div className="text-[10px] font-medium text-red-600">Requerido</div>}
                                                                </div>
                                                            );
                                                        }
                                                        return (
                                                            <div className="font-medium cursor-pointer hover:underline select-none" onClick={() => startEditApprovedCell(comprobante, 'metodoPago')} role="button" aria-label="Editar método de pago">{comprobante.metodoPago || comprobante.metodo || ''}</div>
                                                        );
                                                    })() : (
                                                        <div className="font-medium">{comprobante.metodo ?? ''}</div>
                                                    )}
                                                </td>
                                                {vistaActual === 'rechazados' && (
                                                    <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-xs xs:text-sm text-red-700 text-center border-r border-gray-200">
                                                        <div className="bg-red-100 px-2 py-1 rounded-md max-w-xs mx-auto">
                                                            <span className="font-medium">{comprobante.motivoRechazo}</span>
                                                        </div>
                                                    </td>
                                                )}

                                                {vistaActual === 'aprobados' && (
                                                    <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 whitespace-nowrap text-xs xs:text-sm text-green-700 font-medium text-center border-r border-gray-200">
                                                        {new Date(comprobante.created_at).toLocaleString('es-MX')}
                                                    </td>
                                                )}

                                                {vistaActual === 'rechazados' && (
                                                    <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 whitespace-nowrap text-xs xs:text-sm text-red-700 font-medium text-center border-r border-gray-200">
                                                        {(comprobante.fechaRechazo || comprobante.updated_at || comprobante.created_at)
                                                            ? new Date(comprobante.fechaRechazo || comprobante.updated_at || comprobante.created_at).toLocaleString('es-MX')
                                                            : ''}
                                                    </td>
                                                )}

                                                <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 whitespace-nowrap text-xs xs:text-sm text-center">
                                                    <button onClick={() => handleVerComprobante(`${apiOrigin}${comprobante.comprobante}`)} className="text-purple-600 hover:text-purple-800 font-medium transition-colors duration-150 px-2 xs:px-3 py-1 rounded-lg hover:bg-purple-50">
                                                        Ver comprobante
                                                    </button>
                                                </td>

                                                {/* Botones de acción */}
                                                {vistaActual === 'pendientes' && (
                                                    <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 whitespace-nowrap text-xs xs:text-sm text-center">
                                                        <div className="flex gap-1 xs:gap-2 sm:gap-3 justify-center">
                                                            <button onClick={() => handleRechazar(comprobante)} className="px-2 xs:px-3 sm:px-4 py-1 xs:py-2 bg-red-500 hover:bg-red-600 text-white text-[10px] xs:text-xs font-semibold rounded-md xs:rounded-lg transition-colors duration-150">RECHAZAR</button>
                                                            <button onClick={() => handleValidar(comprobante)} className="px-2 xs:px-3 sm:px-4 py-1 xs:py-2 bg-green-500 hover:bg-green-600 text-white text-[10px] xs:text-xs font-semibold rounded-md xs:rounded-lg transition-colors duration-150">VALIDAR</button>
                                                        </div>
                                                    </td>
                                                )}
                                                {/* En aprobados no hay columna de acciones (edición inline) */}
                                            </tr>
                                        ))}
                                        {/* Aprobados */}
                                        {!Array.isArray(comprobantesObtenidos) && vistaActual === 'aprobados' && comprobantesObtenidos.verificacion === 2 ? (
                                            <tr>
                                                {/* Columna Folio */}
                                                <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-xs xs:text-sm text-gray-900 text-center border-r border-gray-200">
                                                    <div className="font-mono text-purple-600 font-medium">M{activeCategory}{obtenerDosUltimosDigitosAnioSiguiente()}-{String(comprobantesObtenidos.folio).padStart(4, '0')}</div>
                                                </td>

                                                {/* Columna Nombre del Alumno */}
                                                <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-xs xs:text-sm text-gray-900 text-center border-r border-gray-200">
                                                    <div className="font-medium">{comprobantesObtenidos.nombre}{comprobantesObtenidos.apellidos}</div>
                                                </td>

                                                {/* Columna Fecha y Hora  */}
                                                <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 whitespace-nowrap text-xs xs:text-sm text-gray-900 text-center border-r border-gray-200">
                                                    <div className="font-medium">{new Date(comprobantesObtenidos.created_at).toLocaleString('es-MX')}</div>
                                                </td>

                                                {/* Columna Importe - Campo editable */}
                                                <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-xs xs:text-sm text-center border-r border-gray-200">
                                                    <div className="font-medium text-green-600">${comprobantesObtenidos.importe}</div>
                                                </td>

                                                {/* Columna Método - Campo editable */}
                                                <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-xs xs:text-sm text-center border-r border-gray-200">
                                                    <div className="font-medium">{comprobantesObtenidos.metodo}</div>
                                                </td>
                                                {vistaActual === 'aprobados' && (
                                                    <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 whitespace-nowrap text-xs xs:text-sm text-green-700 font-medium text-center border-r border-gray-200">
                                                        {new Date(comprobantesObtenidos.created_at).toLocaleString()}
                                                    </td>
                                                )}

                                                <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 whitespace-nowrap text-xs xs:text-sm text-center">
                                                    <button onClick={() => handleVerComprobante(`${(import.meta?.env?.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '')).replace(/\/api\/?$/, '')}${comprobantesObtenidos.comprobante}`)} className="text-purple-600 hover:text-purple-800 font-medium transition-colors duration-150 px-2 xs:px-3 py-1 rounded-lg hover:bg-purple-50">
                                                        Ver comprobante
                                                    </button>
                                                </td>
                                            </tr>
                                        ) : (
                                            Array.isArray(comprobantesObtenidos) && comprobantesObtenidos.verificacion === 2 && vistaActual === 'aprobados' && comprobantesObtenidos.map((comprobante) => (
                                                <tr key={comprobante.id} className={`hover:bg-gray-50 transition-colors duration-150 ${vistaActual === 'rechazados' ? 'bg-red-50/30' :
                                                        vistaActual === 'aprobados' ? 'bg-green-50/30' : ''
                                                    }`}>
                                                    {/* Columna Folio */}
                                                    <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-xs xs:text-sm text-gray-900 text-center border-r border-gray-200">
                                                        <div className="font-mono text-purple-600 font-medium">M{activeCategory}{obtenerDosUltimosDigitosAnioSiguiente()}-{comprobante.folio}</div>
                                                    </td>

                                                    {/* Columna Nombre del Alumno */}
                                                    <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-xs xs:text-sm text-gray-900 text-center border-r border-gray-200">
                                                        <div className="font-medium">{comprobante.nombreAlumno}</div>
                                                    </td>

                                                    {/* Columna Fecha y Hora  */}
                                                    <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 whitespace-nowrap text-xs xs:text-sm text-gray-900 text-center border-r border-gray-200">
                                                        <div className="font-medium">{comprobante.fechaHora}</div>
                                                    </td>

                                                    {/* Columna Importe - Campo editable */}
                                                    <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-xs xs:text-sm text-center border-r border-gray-200">
                                                        {vistaActual === 'pendientes' ? (
                                                            <input
                                                                type="text"
                                                                value={getFieldValue(comprobante, 'importe')}
                                                                onChange={(e) => handleFieldChange(comprobante, 'importe', e.target.value)}
                                                                className="w-full px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                                placeholder="0.00"
                                                            />
                                                        ) : (
                                                            <div className="font-medium text-green-600">${comprobante.importe}</div>
                                                        )}
                                                    </td>

                                                    {/* Columna Método - Campo editable */}
                                                    <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-xs xs:text-sm text-center border-r border-gray-200">
                                                        {vistaActual === 'pendientes' ? (
                                                            <input
                                                                type="text"
                                                                value={getFieldValue(comprobante, 'metodoPago')}
                                                                onChange={(e) => handleFieldChange(comprobante, 'metodoPago', e.target.value)}
                                                                className="w-full px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                                placeholder="Método de pago"
                                                            />
                                                        ) : (
                                                            <div className="font-medium">{comprobante.metodoPago}</div>
                                                        )}
                                                    </td>
                                                    {vistaActual === 'rechazados' && (
                                                        <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-xs xs:text-sm text-red-700 text-center border-r border-gray-200">
                                                            <div className="bg-red-100 px-2 py-1 rounded-md max-w-xs mx-auto">
                                                                <span className="font-medium">{comprobante.motivoRechazo}</span>
                                                            </div>
                                                        </td>
                                                    )}

                                                    {vistaActual === 'aprobados' && (
                                                        <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 whitespace-nowrap text-xs xs:text-sm text-green-700 font-medium text-center border-r border-gray-200">
                                                            {comprobante.created_at}
                                                        </td>
                                                    )}

                                                    {vistaActual === 'rechazados' && (
                                                        <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 whitespace-nowrap text-xs xs:text-sm text-red-700 font-medium text-center border-r border-gray-200">
                                                            {(comprobante.fechaRechazo || comprobante.updated_at || comprobante.created_at)
                                                                ? new Date(comprobante.fechaRechazo || comprobante.updated_at || comprobante.created_at).toLocaleString('es-MX')
                                                                : ''}
                                                        </td>
                                                    )}

                                                    <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 whitespace-nowrap text-xs xs:text-sm text-center">
                                                        <button onClick={() => handleVerComprobante(`${(import.meta?.env?.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '')).replace(/\/api\/?$/, '')}${comprobantesObtenidos.comprobante}`)} className="text-purple-600 hover:text-purple-800 font-medium transition-colors duration-150 px-2 xs:px-3 py-1 rounded-lg hover:bg-purple-50">
                                                            Ver comprobante
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                        {/* Rechazados */}
                                        {!Array.isArray(comprobantesObtenidos) && vistaActual === 'rechazados' ? (
                                            <tr>
                                                {/* Columna Folio */}
                                                <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-xs xs:text-sm text-gray-900 text-center border-r border-gray-200">
                                                    <div className="font-mono text-purple-600 font-medium">M{activeCategory}{obtenerDosUltimosDigitosAnioSiguiente()}-{String(comprobantesObtenidos.folio).padStart(4, '0')}</div>
                                                </td>

                                                {/* Columna Nombre del Alumno */}
                                                <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-xs xs:text-sm text-gray-900 text-center border-r border-gray-200">
                                                    <div className="font-medium">{comprobantesObtenidos.nombre}{comprobantesObtenidos.apellidos}</div>
                                                </td>

                                                {/* Columna Fecha y Hora  */}
                                                <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 whitespace-nowrap text-xs xs:text-sm text-gray-900 text-center border-r border-gray-200">
                                                    <div className="font-medium">{new Date(comprobantesObtenidos.created_at).toLocaleString('es-MX')}</div>
                                                </td>

                                                {/* Columna Importe - Campo editable */}
                                                <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-xs xs:text-sm text-center border-r border-gray-200">
                                                    {vistaActual === 'pendientes' ? (
                                                        <input
                                                            type="text"
                                                            value={getFieldValue(comprobantesObtenidos, 'importe')}
                                                            onChange={(e) => handleFieldChange(comprobantesObtenidos, 'importe', e.target.value)}
                                                            className="w-full px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                            placeholder="0.00"
                                                        />
                                                    ) : (
                                                        <div className="font-medium text-green-600">${comprobantesObtenidos.importe}</div>
                                                    )}
                                                </td>

                                                {/* Columna Método - Campo editable */}
                                                <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-xs xs:text-sm text-center border-r border-gray-200">
                                                    {vistaActual === 'pendientes' ? (
                                                        <input
                                                            type="text"
                                                            value={getFieldValue(comprobantesObtenidos, 'metodoPago')}
                                                            onChange={(e) => handleFieldChange(comprobantesObtenidos, 'metodoPago', e.target.value)}
                                                            className="w-full px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                            placeholder="Método de pago"
                                                        />
                                                    ) : (
                                                        <div className="font-medium">{comprobantesObtenidos.metodoPago}</div>
                                                    )}
                                                </td>
                                                {vistaActual === 'rechazados' && (
                                                    <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-xs xs:text-sm text-red-700 text-center border-r border-gray-200">
                                                        <div className="bg-red-100 px-2 py-1 rounded-md max-w-xs mx-auto">
                                                            <span className="font-medium">{comprobantesObtenidos.motivoRechazo}</span>
                                                        </div>
                                                    </td>
                                                )}

                                                {vistaActual === 'aprobados' && (
                                                    <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 whitespace-nowrap text-xs xs:text-sm text-green-700 font-medium text-center border-r border-gray-200">
                                                        {comprobantesObtenidos.fechaAprobacion}
                                                    </td>
                                                )}

                                                {vistaActual === 'rechazados' && (
                                                    <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 whitespace-nowrap text-xs xs:text-sm text-red-700 font-medium text-center border-r border-gray-200">
                                                        {(comprobantesObtenidos.fechaRechazo || comprobantesObtenidos.updated_at || comprobantesObtenidos.created_at)
                                                            ? new Date(comprobantesObtenidos.fechaRechazo || comprobantesObtenidos.updated_at || comprobantesObtenidos.created_at).toLocaleString('es-MX')
                                                            : ''}
                                                    </td>
                                                )}

                                                <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 whitespace-nowrap text-xs xs:text-sm text-center">
                                                    <button onClick={() => handleVerComprobante(`${(import.meta?.env?.VITE_API_URL || `http://${window.location.hostname}:1002/api`).replace(/\/api\/?$/, '')}${comprobantesObtenidos.comprobante}`)} className="text-purple-600 hover:text-purple-800 font-medium transition-colors duration-150 px-2 xs:px-3 py-1 rounded-lg hover:bg-purple-50">
                                                        Ver comprobante
                                                    </button>
                                                </td>

                                                {/* Botones de acción solo para pendientes */}
                                                {vistaActual === 'pendientes' && (
                                                    <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 whitespace-nowrap text-xs xs:text-sm text-center">
                                                        <div className="flex gap-1 xs:gap-2 sm:gap-3 justify-center">
                                                            <button onClick={() => handleRechazar(comprobantesObtenidos)} className="px-2 xs:px-3 sm:px-4 py-1 xs:py-2 bg-red-500 hover:bg-red-600 text-white text-[10px] xs:text-xs font-semibold rounded-md xs:rounded-lg transition-colors duration-150">
                                                                RECHAZAR
                                                            </button>
                                                            <button onClick={() => handleValidar(comprobantesObtenidos)} className="px-2 xs:px-3 sm:px-4 py-1 xs:py-2 bg-green-500 hover:bg-green-600 text-white text-[10px] xs:text-xs font-semibold rounded-md xs:rounded-lg transition-colors duration-150">
                                                                VALIDAR
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ) : (
                                            Array.isArray(comprobantesObtenidos) && comprobantesObtenidos.verificacion === 3 && vistaActual === 'pendientes' && comprobantesObtenidos.map((comprobante) => (
                                                <tr key={comprobante.id} className={`hover:bg-gray-50 transition-colors duration-150 ${vistaActual === 'rechazados' ? 'bg-red-50/30' :
                                                        vistaActual === 'aprobados' ? 'bg-green-50/30' : ''
                                                    }`}>
                                                    {/* Columna Folio */}
                                                    <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-xs xs:text-sm text-gray-900 text-center border-r border-gray-200">
                                                        <div className="font-mono text-purple-600 font-medium">M{activeCategory}{obtenerDosUltimosDigitosAnioSiguiente()}-{comprobante.folio}</div>
                                                    </td>

                                                    {/* Columna Nombre del Alumno */}
                                                    <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-xs xs:text-sm text-gray-900 text-center border-r border-gray-200">
                                                        <div className="font-medium">{comprobante.nombreAlumno}</div>
                                                    </td>

                                                    {/* Columna Fecha y Hora  */}
                                                    <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 whitespace-nowrap text-xs xs:text-sm text-gray-900 text-center border-r border-gray-200">
                                                        <div className="font-medium">{comprobante.fechaHora}</div>
                                                    </td>

                                                    {/* Columna Importe - Campo editable */}
                                                    <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-xs xs:text-sm text-center border-r border-gray-200">
                                                        {vistaActual === 'pendientes' ? (
                                                            <input
                                                                type="text"
                                                                value={getFieldValue(comprobante, 'importe')}
                                                                onChange={(e) => handleFieldChange(comprobante, 'importe', e.target.value)}
                                                                className="w-full px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                                placeholder="0.00"
                                                            />
                                                        ) : (
                                                            <div className="font-medium text-green-600">${comprobante.importe}</div>
                                                        )}
                                                    </td>

                                                    {/* Columna Método - Campo editable */}
                                                    <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-xs xs:text-sm text-center border-r border-gray-200">
                                                        {vistaActual === 'pendientes' ? (
                                                            <input
                                                                type="text"
                                                                value={getFieldValue(comprobante, 'metodoPago')}
                                                                onChange={(e) => handleFieldChange(comprobante, 'metodoPago', e.target.value)}
                                                                className="w-full px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                                placeholder="Método de pago"
                                                            />
                                                        ) : (
                                                            <div className="font-medium">{comprobante.metodoPago}</div>
                                                        )}
                                                    </td>
                                                    {vistaActual === 'rechazados' && (
                                                        <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-xs xs:text-sm text-red-700 text-center border-r border-gray-200">
                                                            <div className="bg-red-100 px-2 py-1 rounded-md max-w-xs mx-auto">
                                                                <span className="font-medium">{comprobante.motivoRechazo}</span>
                                                            </div>
                                                        </td>
                                                    )}

                                                    {vistaActual === 'aprobados' && (
                                                        <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 whitespace-nowrap text-xs xs:text-sm text-green-700 font-medium text-center border-r border-gray-200">
                                                            {comprobante.fechaAprobacion}
                                                        </td>
                                                    )}

                                                    {vistaActual === 'rechazados' && (
                                                        <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 whitespace-nowrap text-xs xs:text-sm text-red-700 font-medium text-center border-r border-gray-200">
                                                            {(comprobante.fechaRechazo || comprobante.updated_at || comprobante.created_at)
                                                                ? new Date(comprobante.fechaRechazo || comprobante.updated_at || comprobante.created_at).toLocaleString('es-MX')
                                                                : ''}
                                                        </td>
                                                    )}

                                                    <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 whitespace-nowrap text-xs xs:text-sm text-center">
                                                        <button onClick={() => handleVerComprobante(`${(import.meta?.env?.VITE_API_URL || `http://${window.location.hostname}:1002/api`).replace(/\/api\/?$/, '')}${comprobantesObtenidos.comprobante}`)} className="text-purple-600 hover:text-purple-800 font-medium transition-colors duration-150 px-2 xs:px-3 py-1 rounded-lg hover:bg-purple-50">
                                                            Ver comprobante
                                                        </button>
                                                    </td>

                                                    {/* Botones de acción solo para pendientes */}
                                                    {vistaActual === 'pendientes' && (
                                                        <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 whitespace-nowrap text-xs xs:text-sm text-center">
                                                            <div className="flex gap-1 xs:gap-2 sm:gap-3 justify-center">
                                                                <button onClick={() => handleRechazar(comprobante)} className="px-2 xs:px-3 sm:px-4 py-1 xs:py-2 bg-red-500 hover:bg-red-600 text-white text-[10px] xs:text-xs font-semibold rounded-md xs:rounded-lg transition-colors duration-150">
                                                                    RECHAZAR
                                                                </button>
                                                                <button onClick={() => handleValidar(comprobante)} className="px-2 xs:px-3 sm:px-4 py-1 xs:py-2 bg-green-500 hover:bg-green-600 text-white text-[10px] xs:text-xs font-semibold rounded-md xs:rounded-lg transition-colors duration-150">
                                                                    VALIDAR
                                                                </button>
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/***************************************************************/}
            {/* INICIO: Modal de visualización de comprobante  */}
            {/***************************************************************/}
            {modalComprobante.isOpen && createPortal(
                <div
                    className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-28 bg-black/60 backdrop-blur-sm"
                    onClick={closeModal}
                >
                    <div
                        className="relative bg-gray-50 rounded-2xl shadow-2xl w-full max-w-3xl h-full max-h-[85vh] flex flex-col overflow-hidden border border-gray-200/50"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <header className="flex items-center justify-between p-4 border-b border-gray-200 bg-white flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800">Visualizador de Comprobante</h2>
                                    <p className="text-sm text-gray-500">Revisando pago de {modalComprobante.comprobante?.nombreAlumno}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* Controles de Zoom (solo para imágenes) */}
                                {!isPdf && (
                                    <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                                        <button onClick={handleZoomOut} className="p-2 rounded-md hover:bg-gray-200 transition-colors" title="Alejar"><svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"></path></svg></button>
                                        <span className="text-sm font-medium text-gray-700 w-12 text-center">{Math.round(modalComprobante.zoomLevel * 100)}%</span>
                                        <button onClick={handleZoomIn} className="p-2 rounded-md hover:bg-gray-200 transition-colors" title="Acercar"><svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"></path></svg></button>
                                        <button onClick={handleResetZoom} className="p-2 rounded-md hover:bg-gray-200 transition-colors" title="Restaurar"><svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 9a9 9 0 0114.65-4.65l-4.15 4.15M20 15a9 9 0 01-14.65 4.65l4.15-4.15"></path></svg></button>
                                    </div>
                                )}
                                {/* Botón Abrir en nueva pestaña */}
                                <button onClick={() => window.open(modalComprobante.comprobante?.comprobanteUrl, '_blank')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Abrir en nueva pestaña">
                                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                </button>
                                {/* Botón de Descarga */}
                                <a href={modalComprobante.comprobante?.comprobanteUrl} download={`Comprobante_${modalComprobante.comprobante?.nombreAlumno?.replace(/\s+/g, '_')}`} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Descargar">
                                    <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                </a>
                                {/* Botón de Cerrar */}
                                <button onClick={closeModal} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Cerrar">
                                    <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>
                        </header>

                        {/* Área del Visor del Documento */}
                        <main className="relative flex-1 bg-gray-800/90 p-2 sm:p-4 overflow-auto">
                            <div className={`w-full h-full flex ${isPdf ? 'items-center justify-center' : 'justify-center'}`}>
                                {isPdf ? (
                                    <embed
                                        src={`${modalComprobante.comprobante}#toolbar=0&navpanes=0&scrollbar=1`}
                                        type="application/pdf"
                                        className="w-full max-w-4xl h-full"
                                        title={`Comprobante PDF - ${modalComprobante.comprobante?.nombreAlumno}`}
                                    />
                                ) : (
                                    <img
                                        src={modalComprobante.comprobante}
                                        alt={`Comprobante de ${modalComprobante.comprobante}`}
                                        className="transition-transform duration-200 ease-in-out rounded-md shadow-lg"
                                        style={{
                                            maxWidth: '100%',
                                            transform: `scale(${modalComprobante.zoomLevel})`,
                                            transformOrigin: 'top center'
                                        }}
                                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/ef4444/ffffff?text=Error+al+cargar+imagen"; }}
                                    />
                                )}
                            </div>
                            {showPdfTip && <PdfZoomTip onDismiss={handleDismissPdfTip} />}
                        </main>
                    </div>
                </div>,
                document.getElementById('modal-root')
            )}
            {/***************************************************************/}
            {/* FIN: Modal de visualización de comprobante      */}
            {/***************************************************************/}

            {/* Modales de Confirmación  */}
            {showRejectSuccessModal && createPortal(
                <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-[100] p-2 xs:p-4">
                    <div className="bg-red-50/95 backdrop-blur-lg rounded-lg xs:rounded-xl sm:rounded-2xl max-w-sm xs:max-w-md w-full shadow-2xl border border-red-200/50 overflow-hidden">
                        <div className="flex justify-center pt-6 xs:pt-8 pb-3 xs:pb-4">
                            <div className="w-16 xs:w-20 h-16 xs:h-20 bg-red-200/80 rounded-full flex items-center justify-center">
                                <svg className="w-10 xs:w-12 h-10 xs:h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </div>
                        </div>
                        <div className="text-center px-4 xs:px-6 pb-1 xs:pb-2">
                            <h3 className="text-lg xs:text-xl font-bold text-red-800">Comprobante Rechazado</h3>
                        </div>
                        <div className="px-4 xs:px-6 pb-6 xs:pb-8">
                            <p className="text-sm xs:text-base text-gray-700 mb-4 xs:mb-6 text-center">
                                El comprobante de <br />
                                <span className="font-semibold text-gray-900">{currentComprobante?.nombreAlumno}</span> <br />
                                ha sido rechazado exitosamente.
                            </p>
                            <div className="flex justify-center">
                                <button onClick={cerrarModalRechazoExito} className="px-4 xs:px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-md xs:rounded-lg text-sm xs:text-base transition-colors duration-150">Entendido</button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.getElementById('modal-root')
            )}
            {showRejectModal && createPortal(
                <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-[100] p-2 xs:p-4">
                    <div className="bg-red-50/95 backdrop-blur-lg rounded-lg xs:rounded-xl sm:rounded-2xl max-w-sm xs:max-w-md w-full shadow-2xl border border-red-200/50 overflow-hidden">
                        <div className="flex justify-center pt-6 xs:pt-8 pb-3 xs:pb-4">
                            <div className="w-16 xs:w-20 h-16 xs:h-20 bg-red-200/80 rounded-full flex items-center justify-center">
                                <svg className="w-10 xs:w-12 h-10 xs:h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </div>
                        </div>
                        <div className="text-center px-4 xs:px-6 pb-1 xs:pb-2">
                            <h3 className="text-lg xs:text-xl font-bold text-red-800">Confirmar Rechazo</h3>
                        </div>
                        <div className="px-4 xs:px-6 pb-6 xs:pb-8">
                            <p className="text-sm xs:text-base text-gray-700 mb-4 xs:mb-6 text-center">
                                ¿Estás seguro que deseas rechazar el comprobante de <br />
                                <span className="font-semibold text-gray-900">{currentComprobante?.nombreAlumno}</span>?
                            </p>

                            {/* Campo para el motivo del rechazo */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Motivo del rechazo *
                                </label>
                                <textarea
                                    value={motivoRechazo}
                                    onChange={(e) => setMotivoRechazo(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                                    rows="3"
                                    placeholder="Especifica el motivo del rechazo..."
                                    required
                                />
                            </div>

                            <div className="flex gap-2 xs:gap-3 justify-center">
                                <button onClick={() => { setShowRejectModal(false); setMotivoRechazo(''); }} className="px-4 xs:px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-md xs:rounded-lg text-sm xs:text-base transition-colors duration-150">Cancelar</button>
                                <button onClick={confirmarRechazo} className="px-4 xs:px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-md xs:rounded-lg text-sm xs:text-base transition-colors duration-150">Rechazar</button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.getElementById('modal-root')
            )}

            {showSuccessModal && createPortal(
                <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-[100] p-2 xs:p-4">
                    <div className="bg-green-50/95 backdrop-blur-lg rounded-lg xs:rounded-xl sm:rounded-2xl max-w-sm xs:max-w-md w-full shadow-2xl border border-green-200/50 overflow-hidden">
                        <div className="flex justify-center pt-6 xs:pt-8 pb-3 xs:pb-4">
                            <div className="w-16 xs:w-20 h-16 xs:h-20 bg-green-200/80 rounded-full flex items-center justify-center">
                                <svg className="w-10 xs:w-12 h-10 xs:h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            </div>
                        </div>
                        <div className="text-center px-4 xs:px-6 pb-1 xs:pb-2">
                            <h3 className="text-lg xs:text-xl font-bold text-green-800">¡Comprobante Validado!</h3>
                        </div>
                        <div className="px-4 xs:px-6 pb-6 xs:pb-8">
                            <p className="text-sm xs:text-base text-gray-700 mb-4 xs:mb-6 text-center">
                                El comprobante de <br />
                                <span className="font-semibold text-gray-900">{currentComprobante?.nombreAlumno}</span> <br />
                                ha sido validado exitosamente.
                            </p>
                            <div className="flex justify-center">
                                <button onClick={cerrarModalExito} className="px-4 xs:px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-md xs:rounded-lg text-sm xs:text-base transition-colors duration-150">Entendido</button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.getElementById('modal-root')
            )}
            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-4 right-4 z-[100] px-4 py-3 rounded-md shadow-lg text-sm font-medium text-white animate-fade-in-up
                    ${toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-gray-700'}`}
                    role="status" aria-live="polite">
                    {toast.msg}
                </div>
            )}
        </div>
    );
}
