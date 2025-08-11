import { useState, useEffect } from 'react';
import { useEstudiantes } from "../../context/EstudiantesContext";
import { useComprobante } from '../../context/ComprobantesContext';


function LoadingScreen({ onComplete }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 2000); // Simula un tiempo de carga de 2 segundos
        return () => clearTimeout(timer);
    }, [onComplete]);
// Esta función se ejecuta una vez que la carga se completa 
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-white">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-lg font-medium text-gray-700">Cargando validación de recibos... </p>
            </div>
        </div>
    );
}

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

// Botón de turno vespertino con profesor asignado
function VespertinoButton({ label, isActive, onClick, profesorAsignado }) {

    const { grupos: gruposObtenidos } = useEstudiantes();

    // Función para obtener estilos sobrios basados en el tipo de turno
    const getGrupoStyles = (grupo, isActive) => {
        const baseStyles = "relative overflow-hidden px-3 py-2 xs:px-4 xs:py-2 sm:px-5 sm:py-3 rounded-md xs:rounded-lg font-medium text-xs xs:text-sm transition-all duration-200 ease-out w-full min-w-[100px] max-w-[140px] h-10 xs:h-12 sm:h-14 flex flex-col items-center justify-center gap-0.5 border hover:shadow-md";
        
        switch (grupo) {
            case 'V1':
                return isActive 
                    ? `${baseStyles} bg-purple-500 text-white border-purple-500`
                    : `${baseStyles} bg-white text-purple-600 border-purple-300 hover:bg-purple-50`;
            
            case 'V2':
                return isActive 
                    ? `${baseStyles} bg-purple-500 text-white border-purple-500`
                    : `${baseStyles} bg-white text-purple-600 border-purple-300 hover:bg-purple-50`;
            
            case 'V3':
                return isActive 
                    ? `${baseStyles} bg-purple-500 text-white border-purple-500`
                    : `${baseStyles} bg-white text-purple-600 border-purple-300 hover:bg-purple-50`;
            

            case 'M1':
                return isActive 
                    ? `${baseStyles} bg-blue-500 text-white border-blue-500`
                    : `${baseStyles} bg-white text-blue-600 border-blue-300 hover:bg-blue-50`;
            
            case 'M2':
                return isActive 
                    ? `${baseStyles} bg-blue-500 text-white border-blue-500`
                    : `${baseStyles} bg-white text-blue-600 border-blue-300 hover:bg-blue-50`;
            
                    
            case 'S1':
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
            className={getGrupoStyles(gruposObtenidos.grupo, isActive)}
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
    // ==================== ESTADOS DE LA APLICACIÓN ====================
    
    // Estados de navegación y UI
    const [showLoadingScreen, setShowLoadingScreen] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [showContent, setShowContent] = useState(false);
    const [activeCategory, setActiveCategory] = useState('');
    const [activeVespertino, setActiveVespertino] = useState('');
    const [vistaActual, setVistaActual] = useState('pendientes'); // 'pendientes', 'aprobados', 'rechazados'
   
    // Estados de modales
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [currentComprobante, setCurrentComprobante] = useState(null);
    const [motivoRechazo, setMotivoRechazo] = useState('');
    const [showPdfTip, setShowPdfTip] = useState(false);
    
    // Estados para campos editables (importe y método)
    const [editableFields, setEditableFields] = useState({}); // Para almacenar valores temporales de edición por comprobante

    
    
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
    const [profesoresAsignados, setProfesoresAsignados] = useState({
        // DATOS MOCK TEMPORALES PARA PRUEBAS - ELIMINAR EN PRODUCCIÓN
        'EEAU': {
            'V1': { nombre: 'García López', id: 123 },
            'V2': { nombre: 'Martínez Silva', id: 124 },
            'M1': { nombre: 'Pérez García', id: 125 }
        },
        'EEAP': {
            'V1': { nombre: 'Fernández Ruiz', id: 126 },
            'S1': { nombre: 'López Herrera', id: 127 }
        },
        'DIGI-START': {
            'V1': { nombre: 'Rodríguez Tech', id: 128 },
            'M1': { nombre: 'González Code', id: 129 }
        },
        'MINDBRIDGE': {
            'V1': { nombre: 'Morales Mind', id: 130 }
        },
        'SPEAKUP': {
            'V1': { nombre: 'Jiménez Speak', id: 131 },
            'V2': { nombre: 'Castro Talk', id: 132 }
        },
        'PCE': {
            'M1': { nombre: 'Vargas Prep', id: 133 },
            'S1': { nombre: 'Medina Exam', id: 134 }
        }
    });

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
           capacidad: 10,        ← DINÁMICO: Admin puede cambiar
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
                console.error('Error cargando datos iniciales:', error);
                // TODO: Mostrar mensaje de error al usuario
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

    // Normalizar datos del contexto
    const baseArray = Array.isArray(comprobantesObtenidos)
        ? comprobantesObtenidos
        : (comprobantesObtenidos ? [comprobantesObtenidos] : []);

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
    const pendientes = mergedArray.filter(c => Number(c.verificacion) === 1 || (!c.verificacion && c.estado !== 'rechazado' && c.estado !== 'aprobado'));
    const aprobados = mergedArray.filter(c => Number(c.verificacion) === 2 || c.estado === 'aprobado');
    const rechazados = mergedArray.filter(c => Number(c.verificacion) === 3 || c.estado === 'rechazado');
    const currentList = vistaActual === 'aprobados' ? aprobados : vistaActual === 'rechazados' ? rechazados : pendientes;
    const apiOrigin = (import.meta?.env?.VITE_API_URL || `http://${window.location.hostname}:1002/api`).replace(/\/api\/?$/, '');

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
            getGrupo(categoria);
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

    const handleLoadingComplete = () => {
        setShowLoadingScreen(false);
        setIsLoading(false);
    };

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
        setCurrentComprobante(comprobante);
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
            await rejectVerificacionComprobante(folioParaRechazo, { motivo: motivoRechazo, importe: importeActualizado, metodo: metodoPagoActualizado });
            
            const key = (currentComprobante.id_estudiante ?? currentComprobante.id ?? currentComprobante.folio) || generateFolio(currentComprobante.cursoComprado);
            const folioFinal = currentComprobante.folio || generateFolio(currentComprobante.cursoComprado);
            setComprobantesOverrides(prev => ({
                ...prev,
                [key]: {
                    ...currentComprobante,
                    folio: folioFinal,
                    importe: importeActualizado,
                    metodoPago: metodoPagoActualizado,
                    estado: 'rechazado',
                    verificacion: 3,
                    motivoRechazo: motivoRechazo,
                    fechaRechazo: new Date().toLocaleString()
                }
            }));
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
            console.error('Error al rechazar comprobante:', error);
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
            await getVerificacionComprobante(folio, dataComplete);
            // Override local inmediato (optimistic UI)
            const key = comprobante.id_estudiante ?? comprobante.id ?? comprobante.folio;
            setComprobantesOverrides(prev => ({
                ...prev,
                [key]: {
                    ...comprobante,
                    importe: importeActualizado,
                    metodoPago: metodoPagoActualizado,
                    estado: 'aprobado',
                    verificacion: 2,
                    fechaAprobacion: new Date().toLocaleString()
                }
            }));
            setVistaActual('aprobados');
            setShowSuccessModal(true);
            // Refrescar backend (mantener después de feedback al usuario)
            await getComprobantes(activeVespertino, activeCategory);
        } catch (error) {
            console.error('Error al aprobar comprobante:', error);
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

    console.log(comprobantesObtenidos)

    // ==================== RENDER ====================

    // Si está cargando inicialmente, mostrar pantalla de carga
    if (showLoadingScreen) {
        return <LoadingScreen onComplete={handleLoadingComplete} />;
    }

    return (
        <div className="w-full h-full min-h-[calc(100vh-80px)] flex flex-col bg-white">
            {/* ==================== HEADER Y FILTROS ==================== */}
            <div className="pt-2 xs:pt-4 sm:pt-6 pb-2 xs:pb-3 sm:pb-4 px-2 xs:px-4 sm:px-6">
                <div className="w-full max-w-7xl mx-auto">
                    {/* Título principal */}
                    <div className="text-center mb-4 xs:mb-6 sm:mb-8">
                        <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 xs:mb-2 px-2">
                            Seleccionar Curso para Comprobantes de Pago
                        </h1>
                        <p className="text-xs xs:text-sm sm:text-base text-gray-600 px-4">
                            Selecciona el curso para gestionar los comprobantes de pago
                        </p>
                    </div>

                    {/* Selector de cursos */}
                    <div className="mb-4 xs:mb-6 sm:mb-8">
                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg xs:rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-6 shadow-lg border border-gray-200">
                            <h2 className="text-base xs:text-lg sm:text-xl font-bold text-gray-800 mb-3 xs:mb-4 sm:mb-6 text-center px-2">
                                Cursos Disponibles
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
                    {activeCategory && (
                        <div className="mb-3 xs:mb-4 sm:mb-6">
                            <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg xs:rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-6 shadow-lg border border-gray-200">
                                <h2 className="text-base xs:text-lg sm:text-xl font-bold text-gray-800 mb-3 xs:mb-4 sm:mb-6 text-center px-2">
                                    Grupos Disponibles para {activeCategory}
                                </h2>
                                <div className="flex flex-wrap gap-1.5 xs:gap-2 sm:gap-3 justify-center items-center max-w-4xl mx-auto">
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
                    {activeCategory && activeVespertino && (
                        <div className="mb-4 xs:mb-6">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 xs:px-6 sm:px-8 py-4 xs:py-5 sm:py-6 rounded-lg xs:rounded-xl sm:rounded-2xl shadow-lg">
                                <div className="text-center">
                                    <p className="text-sm xs:text-base sm:text-lg md:text-xl font-semibold mb-1 xs:mb-2">
                                        Grupo Activo: {activeCategory} - {activeVespertino}
                                    </p>
                                    <p className="text-xs xs:text-sm sm:text-base text-blue-100">
                                        Profesor Asignado: <span className="font-bold text-white">{getProfesorAsignado()}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navegación entre vistas */}
                    {activeCategory && activeVespertino && (
                        <div className="mb-4 xs:mb-6">
                            <div className="bg-white rounded-lg xs:rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-6 shadow-lg border border-gray-200">
                                <div className="flex flex-wrap gap-2 xs:gap-3 justify-center">
                                    <button
                                        onClick={() => setVistaActual('pendientes')}
                                        className={`px-4 xs:px-6 py-2 xs:py-3 rounded-lg font-semibold text-sm xs:text-base transition-all duration-300 flex items-center space-x-2 ${
                                            vistaActual === 'pendientes'
                                                ? 'bg-orange-500 text-white shadow-lg transform scale-105'
                                                : 'bg-gray-100 text-gray-700 hover:bg-orange-100'
                                        }`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Pendientes ({pendientes.length})</span>
                                    </button>
                                    <button
                                        onClick={() => setVistaActual('aprobados')}
                                        className={`px-4 xs:px-6 py-2 xs:py-3 rounded-lg font-semibold text-sm xs:text-base transition-all duration-300 flex items-center space-x-2 ${
                                            vistaActual === 'aprobados'
                                                ? 'bg-green-500 text-white shadow-lg transform scale-105'
                                                : 'bg-gray-100 text-gray-700 hover:bg-green-100'
                                        }`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Aprobados ({aprobados.length})</span>
                                    </button>
                                    <button
                                        onClick={() => setVistaActual('rechazados')}
                                        className={`px-4 xs:px-6 py-2 xs:py-3 rounded-lg font-semibold text-sm xs:text-base transition-all duration-300 flex items-center space-x-2 ${
                                            vistaActual === 'rechazados'
                                                ? 'bg-red-500 text-white shadow-lg transform scale-105'
                                                : 'bg-gray-100 text-gray-700 hover:bg-red-100'
                                        }`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                <div className="flex-1 px-2 xs:px-4 sm:px-6 pb-4 xs:pb-6">
                    <div className="w-full max-w-7xl mx-auto">
                        <div className="bg-white rounded-lg xs:rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                            <div className="px-4 xs:px-6 py-4 bg-gray-50 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800">{getTituloVista()}</h3>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[1000px] xs:min-w-[1100px] sm:min-w-[1200px]">
                                    <thead>
                                        <tr className={`${vistaActual === 'aprobados' ? 'bg-gradient-to-r from-green-700 to-green-800' : 
                                                        vistaActual === 'rechazados' ? 'bg-gradient-to-r from-red-700 to-red-800' : 
                                                        'bg-gradient-to-r from-gray-800 to-gray-900'} text-white`}>
                                            <th className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-center text-xs xs:text-sm font-semibold uppercase tracking-wider border-r border-gray-300">Folio</th>
                                            <th className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-center text-xs xs:text-sm font-semibold uppercase tracking-wider border-r border-gray-300">Nombre del Alumno</th>
                                            <th className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-center text-xs xs:text-sm font-semibold uppercase tracking-wider border-r border-gray-300">Fecha y Hora</th>
                                            <th className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-center text-xs xs:text-sm font-semibold uppercase tracking-wider border-r border-gray-300">Importe</th>
                                            <th className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-center text-xs xs:text-sm font-semibold uppercase tracking-wider border-r border-gray-300">Método</th>
                                            {vistaActual === 'rechazados' && (
                                                <th className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-center text-xs xs:text-sm font-semibold uppercase tracking-wider border-r border-gray-300">Motivo Rechazo</th>
                                            )}
                                            {vistaActual === 'aprobados' && (
                                                <th className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-center text-xs xs:text-sm font-semibold uppercase tracking-wider border-r border-gray-300">Fecha Aprobación</th>
                                            )}
                                            {vistaActual === 'rechazados' && (
                                                <th className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-center text-xs xs:text-sm font-semibold uppercase tracking-wider border-r border-gray-300">Fecha Rechazo</th>
                                            )}
                                            <th className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-center text-xs xs:text-sm font-semibold uppercase tracking-wider">Comprobante</th>
                                            {vistaActual === 'pendientes' && (
                                                <th className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-center text-xs xs:text-sm font-semibold uppercase tracking-wider">Acciones</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {currentList.length === 0 && (
                                            <tr>
                                                <td colSpan={vistaActual === 'rechazados' ? '8' : vistaActual === 'aprobados' ? '7' : '7'} className="px-4 xs:px-6 py-12 xs:py-16 text-center text-gray-500">
                                                    <div className="flex flex-col items-center">
                                                        <div className={`w-12 xs:w-16 h-12 xs:h-16 rounded-full flex items-center justify-center mb-3 xs:mb-4 ${
                                                            vistaActual === 'aprobados' ? 'bg-green-100' : 
                                                            vistaActual === 'rechazados' ? 'bg-red-100' : 'bg-gray-100'
                                                        }`}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 xs:h-8 w-6 xs:w-8 ${
                                                                vistaActual === 'aprobados' ? 'text-green-400' : 
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
                                        {currentList.map((comprobante) => (
                                                <tr key={comprobante.id_estudiante ?? `${comprobante.folio}-${comprobante.created_at}`}
                                                    className={`hover:bg-gray-50 transition-colors duration-150 ${
                                                    vistaActual === 'rechazados' ? 'bg-red-50/30' : 
                                                    vistaActual === 'aprobados' ? 'bg-green-50/30' : ''
                                                }`}>
                                    {/* Columna Folio */}
                                    <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-xs xs:text-sm text-gray-900 text-center border-r border-gray-200">
                                        <div className="font-mono text-blue-600 font-medium">M{activeCategory}{obtenerDosUltimosDigitosAnioSiguiente()}-{String(comprobante.folio).padStart(4, '0')}</div>
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
                                                                v = intPart + '.' + (decPart ? decPart.slice(0,2) : '');
                                                            }
                                                            handleFieldChange(comprobante, 'importe', v);
                                                        }}
                                                        onBlur={() => {
                                                            if (!invalid) {
                                                                const formatted = (val === '' ? '' : Number(val).toFixed(2));
                                                                if (formatted !== '') handleFieldChange(comprobante, 'importe', formatted);
                                                            }
                                                        }}
                                                        className={`w-full px-2 py-1 text-center border rounded hide-spinner focus:outline-none focus:ring-2 transition-colors duration-150 ${invalid ? 'border-red-500 focus:ring-red-400 focus:border-red-500 bg-red-50 placeholder-red-400' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                                                        placeholder="0.00"
                                                    />
                                                    {invalid && (
                                                        <div className="text-[10px] xs:text-[11px] font-medium text-red-600 tracking-wide">{errorMsg}</div>
                                                    )}
                                                </div>
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
                                                        className={`w-full px-2 py-1 text-center border rounded focus:outline-none focus:ring-2 transition-colors duration-150 ${invalid ? 'border-red-500 focus:ring-red-400 focus:border-red-500 bg-red-50 placeholder-red-400' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                                                        placeholder="Método de pago"
                                                    />
                                                    {invalid && (
                                                        <div className="text-[10px] xs:text-[11px] font-medium text-red-600 tracking-wide">Requerido</div>
                                                    )}
                                                </div>
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
                                            {comprobante.fechaRechazo}
                                        </td>
                                    )}
                                    
                                    <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 whitespace-nowrap text-xs xs:text-sm text-center">
                                        <button onClick={() => handleVerComprobante(`${apiOrigin}${comprobante.comprobante}`)} className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-150 px-2 xs:px-3 py-1 rounded-lg hover:bg-blue-50">
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
                                            ))}
                                        {/* Aprobados */}
                                        {!Array.isArray(comprobantesObtenidos) && vistaActual === 'aprobados' && comprobantesObtenidos.verificacion === 2 ? (
                                            <tr>
                                                {/* Columna Folio */}
                                                <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-xs xs:text-sm text-gray-900 text-center border-r border-gray-200">
                                                    <div className="font-mono text-blue-600 font-medium">M{activeCategory}{obtenerDosUltimosDigitosAnioSiguiente()}-{String(comprobantesObtenidos.folio).padStart(4, '0')}</div>
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
                                        <button onClick={() => handleVerComprobante(`${(import.meta?.env?.VITE_API_URL || `http://${window.location.hostname}:1002/api`).replace(/\/api\/?$/, '')}${comprobantesObtenidos.comprobante}`)} className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-150 px-2 xs:px-3 py-1 rounded-lg hover:bg-blue-50">
                                            Ver comprobante
                                        </button>
                                    </td>
                                                </tr>
                                        ) : (
                                            Array.isArray(comprobantesObtenidos) && comprobantesObtenidos.verificacion === 2 && vistaActual === 'aprobados' && comprobantesObtenidos.map((comprobante) => (
                                                <tr key={comprobante.id} className={`hover:bg-gray-50 transition-colors duration-150 ${
                                                    vistaActual === 'rechazados' ? 'bg-red-50/30' : 
                                                    vistaActual === 'aprobados' ? 'bg-green-50/30' : ''
                                                }`}>
                                    {/* Columna Folio */}
                                    <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-xs xs:text-sm text-gray-900 text-center border-r border-gray-200">
                                        <div className="font-mono text-blue-600 font-medium">M{activeCategory}{obtenerDosUltimosDigitosAnioSiguiente()}-{comprobante.folio}</div>
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
                                                onChange={(e) => handleFieldChange(comprobante.id, 'importe', e.target.value)}
                                                className="w-full px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                                onChange={(e) => handleFieldChange(comprobante.id, 'metodoPago', e.target.value)}
                                                className="w-full px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                            {comprobante.fechaRechazo}
                                        </td>
                                    )}
                                    
                                    <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 whitespace-nowrap text-xs xs:text-sm text-center">
                                        <button onClick={() => handleVerComprobante(`${(import.meta?.env?.VITE_API_URL || `http://${window.location.hostname}:1002/api`).replace(/\/api\/?$/, '')}${comprobantesObtenidos.comprobante}`)} className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-150 px-2 xs:px-3 py-1 rounded-lg hover:bg-blue-50">
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
                                                    <div className="font-mono text-blue-600 font-medium">M{activeCategory}{obtenerDosUltimosDigitosAnioSiguiente()}-{String(comprobantesObtenidos.folio).padStart(4, '0')}</div>
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
                                                onChange={(e) => setImporteEditable(e.target.value)}
                                                className="w-full px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                                onChange={(e) => setMetodoEditable(e.target.value)}
                                                className="w-full px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                            {comprobantesObtenidos.fechaRechazo}
                                        </td>
                                    )}
                                    
                                    <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 whitespace-nowrap text-xs xs:text-sm text-center">
                                        <button onClick={() => handleVerComprobante(`${(import.meta?.env?.VITE_API_URL || `http://${window.location.hostname}:1002/api`).replace(/\/api\/?$/, '')}${comprobantesObtenidos.comprobante}`)} className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-150 px-2 xs:px-3 py-1 rounded-lg hover:bg-blue-50">
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
                                                <tr key={comprobante.id} className={`hover:bg-gray-50 transition-colors duration-150 ${
                                                    vistaActual === 'rechazados' ? 'bg-red-50/30' : 
                                                    vistaActual === 'aprobados' ? 'bg-green-50/30' : ''
                                                }`}>
                                    {/* Columna Folio */}
                                    <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-xs xs:text-sm text-gray-900 text-center border-r border-gray-200">
                                        <div className="font-mono text-blue-600 font-medium">M{activeCategory}{obtenerDosUltimosDigitosAnioSiguiente()}-{comprobante.folio}</div>
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
                                                onChange={(e) => handleFieldChange(comprobante.id, 'importe', e.target.value)}
                                                className="w-full px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                                onChange={(e) => handleFieldChange(comprobante.id, 'metodoPago', e.target.value)}
                                                className="w-full px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                            {comprobante.fechaRechazo}
                                        </td>
                                    )}
                                    
                                    <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 whitespace-nowrap text-xs xs:text-sm text-center">
                                        <button onClick={() => handleVerComprobante(`${(import.meta?.env?.VITE_API_URL || `http://${window.location.hostname}:1002/api`).replace(/\/api\/?$/, '')}${comprobantesObtenidos.comprobante}`)} className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-150 px-2 xs:px-3 py-1 rounded-lg hover:bg-blue-50">
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
            {modalComprobante.isOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-28 bg-black/60 backdrop-blur-sm"
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
                                        onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/600x400/ef4444/ffffff?text=Error+al+cargar+imagen"; }}
                                    />
                                )}
                            </div>
                            {showPdfTip && <PdfZoomTip onDismiss={handleDismissPdfTip} />}
                        </main>
                    </div>
                </div>
            )}
            {/***************************************************************/}
                    {/* FIN: Modal de visualización de comprobante      */}
            {/***************************************************************/}

            {/* Modales de Confirmación  */}
            {showRejectSuccessModal && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-2 xs:p-4">
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
                </div>
            )}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-2 xs:p-4">
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
                </div>
            )}

            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-2 xs:p-4">
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
                </div>
            )}
        </div>
    );
}
