import React, { useState, useEffect } from 'react';

// Componente para la pantalla de carga simple (estilo consistente con otros componentes)
function LoadingScreen({ onComplete }) {
    useEffect(() => {
        // Simular carga por 2 segundos
        const timer = setTimeout(() => {
            onComplete();
        }, 2000);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-white">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-lg font-medium text-gray-700">Cargando sistema de validación...</p>
            </div>
        </div>
    );
}

// Componente para los botones de categoría modernos
function CategoryButton({ label, isActive, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`
                relative overflow-hidden 
                px-1.5 py-1.5 xs:px-2 xs:py-2 sm:px-3 sm:py-3 md:px-4 md:py-3
                rounded-md xs:rounded-lg sm:rounded-xl 
                font-bold text-[10px] xs:text-xs sm:text-sm md:text-base
                transition-all duration-300 ease-out 
                w-full min-w-[80px] xs:min-w-[100px] max-w-[140px] xs:max-w-[160px]
                h-10 xs:h-12 sm:h-14 md:h-16
                flex items-center justify-center
                border-2 transform hover:scale-105 hover:shadow-lg
                ${isActive
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white border-purple-500 shadow-md shadow-purple-500/30' 
                    : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-400 shadow-sm hover:from-purple-600 hover:to-purple-700 hover:border-purple-500'
                }
            `}
        >
            <span className="relative z-10 tracking-wide text-center leading-tight">{label}</span>
        </button>
    );
}

// Componente para los botones de vespertino modernos
function VespertinoButton({ label, isActive, onClick, profesorAsignado }) {
    return (
        <button
            onClick={onClick}
            className={`
                relative overflow-hidden 
                px-3 py-2 xs:px-4 xs:py-2 sm:px-5 sm:py-3
                rounded-md xs:rounded-lg 
                font-bold text-xs xs:text-sm
                transition-all duration-300 ease-out 
                w-full min-w-[100px] max-w-[140px]
                h-10 xs:h-12 sm:h-14
                flex flex-col items-center justify-center gap-0.5
                border-2 transform hover:scale-105 hover:shadow-lg
                ${isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-700 text-white border-indigo-500 shadow-md shadow-indigo-500/30' 
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-indigo-400 shadow-sm hover:from-indigo-600 hover:to-purple-700 hover:border-indigo-500'
                }
            `}
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

// Componente principal del comprobante de recibo
export function ComprobanteRecibo() {
    // Estado para controlar la pantalla de carga
    const [isLoading, setIsLoading] = useState(true);
    const [showContent, setShowContent] = useState(false);
    
    // Estados para manejar las categorías activas
    const [activeCategory, setActiveCategory] = useState('');
    const [activeVespertino, setActiveVespertino] = useState('');
   
    // Estados para modales
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [currentComprobante, setCurrentComprobante] = useState(null);

    // Datos de ejemplo para la tabla
    const [comprobantes, setComprobantes] = useState([
        {
            id: 1,
            nombreAlumno: "María González López",
            cursoComprado: "Matemáticas Nivel 1",
            fechaHora: "2024-06-27 14:30",
            importe: "150.00",
            metodoPago: "Transferencia bancaria",
            estado: "pendiente"
        },
        {
            id: 2,
            nombreAlumno: "Carlos Rodríguez Martín",
            cursoComprado: "Física Aplicada",
            fechaHora: "2024-06-27 10:15",
            importe: "200.00",
            metodoPago: "Tarjeta de crédito",
            estado: "pendiente"
        },
        {
            id: 3,
            nombreAlumno: "Ana Fernández Ruiz",
            cursoComprado: "Química Orgánica",
            fechaHora: "2024-06-26 16:45",
            importe: "180.00",
            metodoPago: "PayPal",
            estado: "pendiente"
        }
    ]);

    // Configuración de profesores asignados por grupo (10 grupos)
    const profesoresAsignados = {
        'EEAU': {
            'VESPERTINO 1': 'García López',
            'VESPERTINO 2': 'Martínez Silva'
        },
        'EEAP': {
            'VESPERTINO 1': 'Fernández Ruiz',
            'VESPERTINO 2': 'López Herrera'
        },
        'DIGI-START': {
            'VESPERTINO 1': 'Sánchez Morales',
            'VESPERTINO 2': 'Jiménez Vázquez'
        },
        'MINDBRIDGE': {
            'VESPERTINO 1': 'Muñoz Delgado',
            'VESPERTINO 2': 'Romero Castillo'
        },
        'SPEAKUP': {
            'VESPERTINO 1': 'Guerrero Peña',
            'VESPERTINO 2': 'Ruiz Medina'
        },
        'PCE': {
            'VESPERTINO 1': 'Ortega Santos',
            'VESPERTINO 2': 'Moreno Silva'
        }
    };

    // Definir las categorías basadas en la imagen proporcionada
    const categorias = ['EEAU', 'EEAP', 'DIGI-START', 'MINDBRIDGE', 'SPEAKUP', 'PCE'];
    const vespertinos = ['VESPERTINO 1', 'VESPERTINO 2'];

    // Función para obtener el profesor asignado
    const getProfesorAsignado = () => {
        if (activeCategory && activeVespertino) {
            return profesoresAsignados[activeCategory]?.[activeVespertino] || 'Sin asignar';
        }
        return null;
    };

    // Función para manejar la selección de categoría
    const handleCategorySelect = (categoria) => {
        if (activeCategory === categoria) {
            // Si la categoría ya está activa, cerrar todo
            setActiveCategory('');
            setActiveVespertino('');
            setShowContent(false);
        } else {
            // Si es una categoría diferente, seleccionarla
            setActiveCategory(categoria);
            setActiveVespertino(''); // Reset vespertino cuando cambia categoría
        }
    };

    // Función para manejar la selección de vespertino
    const handleVespertinoSelect = (vespertino) => {
        setActiveVespertino(vespertino);
        setShowContent(true); // Mostrar contenido cuando se selecciona vespertino
    };

    // Función para completar la carga
    const handleLoadingComplete = () => {
        setIsLoading(false);
    };

    // Función para manejar el rechazo de un comprobante específico
    const handleRechazar = (comprobante) => {
        setCurrentComprobante(comprobante);
        setShowRejectModal(true);
    };

    // Función para confirmar el rechazo
    const confirmarRechazo = () => {
        setComprobantes(prevComprobantes =>
            prevComprobantes.filter(c => c.id !== currentComprobante.id)
        );
        setShowRejectModal(false);
        setCurrentComprobante(null);
    };

    // Función para manejar la validación de un comprobante específico
    const handleValidar = (comprobante) => {
        setComprobantes(prevComprobantes =>
            prevComprobantes.filter(c => c.id !== comprobante.id)
        );
        setCurrentComprobante(comprobante);
        setShowSuccessModal(true);
    };

    // Mostrar pantalla de carga
    if (isLoading) {
        return <LoadingScreen onComplete={handleLoadingComplete} />;
    }

    return (
        <div className="w-full h-full min-h-[calc(100vh-80px)] flex flex-col bg-white">
            {/* Header con filtros optimizado */}
            <div className="pt-2 xs:pt-4 sm:pt-6 pb-2 xs:pb-3 sm:pb-4 px-2 xs:px-4 sm:px-6">
                <div className="w-full max-w-7xl mx-auto">
                    {/* Título principal */}
                    <div className="text-center mb-4 xs:mb-6 sm:mb-8">
                        <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 xs:mb-2 px-2">
                            Seleccionar Curso de Inglés
                        </h1>
                        <p className="text-xs xs:text-sm sm:text-base text-gray-600 px-4">
                            Selecciona el curso para gestionar los comprobantes de pago
                        </p>
                    </div>

                    {/* Botones de categoría */}
                    <div className="mb-4 xs:mb-6 sm:mb-8">
                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg xs:rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-6 shadow-lg border border-gray-200">
                            <h2 className="text-base xs:text-lg sm:text-xl font-bold text-gray-800 mb-3 xs:mb-4 sm:mb-6 text-center px-2">
                                Cursos Disponibles
                            </h2>
                            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-1.5 xs:gap-2 sm:gap-3 md:gap-4 place-items-center">
                                {categorias.map((cat) => (
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

                    {/* Botones de vespertino - Solo mostrar si hay categoría seleccionada */}
                    {activeCategory && (
                        <div className="mb-3 xs:mb-4 sm:mb-6">
                            <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg xs:rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-6 shadow-lg border border-gray-200">
                                <h2 className="text-base xs:text-lg sm:text-xl font-bold text-gray-800 mb-3 xs:mb-4 sm:mb-6 text-center px-2">
                                    Turnos Disponibles para {activeCategory}
                                </h2>
                                <div className="flex flex-row gap-3 xs:gap-4 sm:gap-6 justify-center items-center max-w-md mx-auto">
                                    {vespertinos.map((vesp) => (
                                        <VespertinoButton
                                            key={vesp}
                                            label={vesp}
                                            isActive={activeVespertino === vesp}
                                            onClick={() => handleVespertinoSelect(vesp)}
                                            profesorAsignado={activeVespertino === vesp ? profesoresAsignados[activeCategory]?.[vesp] : null}
                                        />
                                    ))}
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
                </div>
            </div>

            {/* Contenido principal - tabla (solo mostrar si showContent es true) */}
            {showContent && (
                <div className="flex-1 px-2 xs:px-4 sm:px-6 pb-4 xs:pb-6">
                    <div className="w-full max-w-7xl mx-auto">
                        {/* Tabla de comprobantes */}
                        <div className="bg-white rounded-lg xs:rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[700px] xs:min-w-[800px] sm:min-w-[900px]">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                                            <th className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-left text-xs xs:text-sm font-semibold uppercase tracking-wider">
                                                Nombre del Alumno
                                            </th>
                                            <th className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-left text-xs xs:text-sm font-semibold uppercase tracking-wider">
                                                Curso Comprado
                                            </th>
                                            <th className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-left text-xs xs:text-sm font-semibold uppercase tracking-wider">
                                                Fecha/Hora
                                            </th>
                                            <th className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-left text-xs xs:text-sm font-semibold uppercase tracking-wider">
                                                Importe
                                            </th>
                                            <th className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-left text-xs xs:text-sm font-semibold uppercase tracking-wider">
                                                Método de Pago
                                            </th>
                                            <th className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-left text-xs xs:text-sm font-semibold uppercase tracking-wider">
                                                Comprobante
                                            </th>
                                            <th className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-center text-xs xs:text-sm font-semibold uppercase tracking-wider">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {comprobantes.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="px-4 xs:px-6 py-12 xs:py-16 text-center text-gray-500">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-12 xs:w-16 h-12 xs:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 xs:mb-4">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 xs:h-8 w-6 xs:w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                        </div>
                                                        <p className="text-base xs:text-lg font-medium text-gray-700 mb-1 xs:mb-2">
                                                            No hay comprobantes para revisar
                                                        </p>
                                                        <p className="text-xs xs:text-sm text-gray-500 px-4">
                                                            Los comprobantes aparecerán aquí cuando estén disponibles para validación
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            comprobantes.map((comprobante, index) => (
                                                <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                                                    <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-xs xs:text-sm text-gray-900">
                                                        <div className="font-medium">{comprobante.nombreAlumno}</div>
                                                    </td>
                                                    <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-xs xs:text-sm text-gray-900">
                                                        {comprobante.cursoComprado}
                                                    </td>
                                                    <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 whitespace-nowrap text-xs xs:text-sm text-gray-900">
                                                        {comprobante.fechaHora}
                                                    </td>
                                                    <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 whitespace-nowrap text-xs xs:text-sm text-gray-900 font-semibold">
                                                        ${comprobante.importe}
                                                    </td>
                                                    <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 text-xs xs:text-sm text-gray-900">
                                                        {comprobante.metodoPago}
                                                    </td>
                                                    <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 whitespace-nowrap text-xs xs:text-sm">
                                                        <button className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-150 px-2 xs:px-3 py-1 rounded-lg hover:bg-blue-50">
                                                            Ver comprobante
                                                        </button>
                                                    </td>
                                                    <td className="px-2 xs:px-4 sm:px-6 py-3 xs:py-4 whitespace-nowrap text-xs xs:text-sm">
                                                        <div className="flex gap-1 xs:gap-2 sm:gap-3 justify-center">
                                                            <button
                                                                onClick={() => handleRechazar(comprobante)}
                                                                className="px-2 xs:px-3 sm:px-4 py-1 xs:py-2 bg-red-500 hover:bg-red-600 text-white text-[10px] xs:text-xs font-semibold rounded-md xs:rounded-lg transition-colors duration-150"
                                                            >
                                                                RECHAZAR
                                                            </button>
                                                            <button
                                                                onClick={() => handleValidar(comprobante)}
                                                                className="px-2 xs:px-3 sm:px-4 py-1 xs:py-2 bg-green-500 hover:bg-green-600 text-white text-[10px] xs:text-xs font-semibold rounded-md xs:rounded-lg transition-colors duration-150"
                                                            >
                                                                VALIDAR
                                                            </button>
                                                        </div>
                                                    </td>
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

            {/* Modales con colores temáticos en el modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-2 xs:p-4">
                    <div className="bg-red-50/95 backdrop-blur-lg rounded-lg xs:rounded-xl sm:rounded-2xl max-w-sm xs:max-w-md w-full shadow-2xl border border-red-200/50 overflow-hidden">
                        <div className="flex justify-center pt-6 xs:pt-8 pb-3 xs:pb-4">
                            <div className="w-16 xs:w-20 h-16 xs:h-20 bg-red-200/80 rounded-full flex items-center justify-center">
                                <svg className="w-10 xs:w-12 h-10 xs:h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
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
                            <div className="flex gap-2 xs:gap-3 justify-center">
                                <button
                                    onClick={() => setShowRejectModal(false)}
                                    className="px-4 xs:px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-md xs:rounded-lg text-sm xs:text-base transition-colors duration-150"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmarRechazo}
                                    className="px-4 xs:px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-md xs:rounded-lg text-sm xs:text-base transition-colors duration-150"
                                >
                                    Rechazar
                                </button>
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
                                <svg className="w-10 xs:w-12 h-10 xs:h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={4}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
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
                                <button
                                    onClick={() => setShowSuccessModal(false)}
                                    className="px-4 xs:px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-md xs:rounded-lg text-sm xs:text-base transition-colors duration-150"
                                >
                                    Entendido
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}