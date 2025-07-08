import React, { useState, useEffect } from 'react';

// Componente para la pantalla de carga inicial
function LoadingScreen({ onComplete }) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(timer);
                    setTimeout(onComplete, 500); // Pequeño delay antes de mostrar el contenido
                    return 100;
                }
                return prev + 2;
            });
        }, 50);

        return () => clearInterval(timer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 flex items-center justify-center z-50">
            <div className="text-center">
                {/* Logo animado */}
                <div className="mb-8 animate-pulse">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mx-auto bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
                        <img 
                            src="/src/assets/MQerK_logo.png" 
                            alt="MQerK Academy" 
                            className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 object-contain filter brightness-0 invert"
                        />
                    </div>
                </div>

                {/* Título */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                    MQerK Academy
                </h1>
                <p className="text-lg sm:text-xl text-white/80 mb-8">
                    Sistema de Validación de Pagos
                </p>

                {/* Barra de progreso */}
                <div className="w-64 sm:w-80 mx-auto">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full h-3 mb-4 overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-white/80 to-white/60 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-white/70 text-sm">
                        Cargando sistema... {progress}%
                    </p>
                </div>

                {/* Indicador de carga */}
                <div className="mt-8 flex justify-center space-x-2">
                    <div className="w-3 h-3 bg-white/60 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-3 h-3 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
            </div>
        </div>
    );
}

// Componente para los botones de categoría modernos
function CategoryButton({ label, isActive, onClick, profesorAsignado }) {
    return (
        <button
            onClick={onClick}
            className={`
                relative overflow-hidden px-6 py-4 rounded-2xl font-semibold text-base
                transition-colors duration-200 ease-out w-full max-w-[160px] h-[80px]
                flex flex-col items-center justify-center gap-1
                ${isActive
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30' 
                    : 'bg-gradient-to-br from-blue-400 to-blue-500 text-white shadow-md hover:from-blue-500 hover:to-blue-600 hover:shadow-lg'
                }
            `}
        >
            <span className="text-lg font-bold relative z-10">{label}</span>
            {isActive && profesorAsignado && (
                <span className="text-xs font-medium opacity-90 relative z-10">
                    {profesorAsignado.split(' ')[0]}
                </span>
            )}
        </button>
    );
}

// Componente para los botones de vespertino modernos
function VespertinoButton({ label, isActive, onClick, profesorAsignado }) {
    return (
        <button
            onClick={onClick}
            className={`
                relative overflow-hidden px-8 py-6 rounded-2xl font-semibold text-lg
                transition-colors duration-200 ease-out min-w-[200px] h-[100px]
                flex flex-col items-center justify-center gap-2
                ${isActive
                    ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30' 
                    : 'bg-gradient-to-br from-indigo-400 to-purple-500 text-white shadow-md hover:from-purple-500 hover:to-indigo-600 hover:shadow-lg'
                }
            `}
        >
            <span className="relative z-10 font-bold">{label}</span>
            {isActive && profesorAsignado && (
                <span className="text-sm font-medium opacity-90 relative z-10">
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
        'C1': {
            'VESPERTINO 1': 'García López',
            'VESPERTINO 2': 'Martínez Silva'
        },
        'C2': {
            'VESPERTINO 1': 'Fernández Ruiz',
            'VESPERTINO 2': 'López Herrera'
        },
        'C3': {
            'VESPERTINO 1': 'Sánchez Morales',
            'VESPERTINO 2': 'Jiménez Vázquez'
        },
        'C4': {
            'VESPERTINO 1': 'Muñoz Delgado',
            'VESPERTINO 2': 'Romero Castillo'
        },
        'C5': {
            'VESPERTINO 1': 'Guerrero Peña',
            'VESPERTINO 2': 'Ruiz Medina'
        },
        'C6': {
            'VESPERTINO 1': 'Ortega Santos',
            'VESPERTINO 2': 'Moreno Silva'
        },
        'C7': {
            'VESPERTINO 1': 'Navarro Ramos',
            'VESPERTINO 2': 'Herrero Blanco'
        },
        'C8': {
            'VESPERTINO 1': 'Prieto Vega',
            'VESPERTINO 2': 'Campos Rubio'
        },
        'C9': {
            'VESPERTINO 1': 'Domínguez Cruz',
            'VESPERTINO 2': 'Torres Mendoza'
        },
        'C10': {
            'VESPERTINO 1': 'Vargas Molina',
            'VESPERTINO 2': 'Castro Jiménez'
        }
    };

    const categorias = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10'];
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
        setActiveCategory(categoria);
        setActiveVespertino(''); // Reset vespertino cuando cambia categoría
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
        <div className="w-full h-full min-h-[calc(100vh-80px)] flex flex-col bg-gray-50">
            {/* Header con filtros optimizado */}
            <div className="pt-8 pb-6 px-6">
                <div className="w-full max-w-7xl mx-auto">
                    {/* Título principal */}
                    <div className="text-center mb-12">
                        <h1 className="text-3xl font-bold text-gray-800 mb-3">
                            Seleccionar Grupo de Trabajo
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Selecciona la categoría y turno para gestionar los comprobantes
                        </p>
                    </div>

                    {/* Botones de categoría */}
                    <div className="mb-12">
                        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-700 mb-8 text-center">
                                Categorías Disponibles (10 Grupos)
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 justify-items-center">
                                {categorias.map((cat) => (
                                    <CategoryButton
                                        key={cat}
                                        label={cat}
                                        isActive={activeCategory === cat}
                                        onClick={() => handleCategorySelect(cat)}
                                        profesorAsignado={activeCategory === cat && activeVespertino ? getProfesorAsignado() : null}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Botones de vespertino - Solo mostrar si hay categoría seleccionada */}
                    {activeCategory && (
                        <div className="mb-8">
                            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                                <h2 className="text-xl font-semibold text-gray-700 mb-8 text-center">
                                    Turnos Disponibles para {activeCategory}
                                </h2>
                                <div className="flex flex-wrap gap-6 justify-center">
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
                        <div className="mb-6">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-6 rounded-2xl shadow-lg">
                                <div className="text-center">
                                    <p className="text-xl font-semibold mb-2">
                                        Grupo Activo: {activeCategory} - {activeVespertino}
                                    </p>
                                    <p className="text-blue-100">
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
                <div className="flex-1 px-6 pb-6">
                    <div className="w-full max-w-7xl mx-auto">
                        {/* Tabla de comprobantes */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[900px]">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                                            <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                                                Nombre del Alumno
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                                                Curso Comprado
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                                                Fecha/Hora
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                                                Importe
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                                                Método de Pago
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                                                Comprobante
                                            </th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {comprobantes.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-16 text-center text-gray-500">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                        </div>
                                                        <p className="text-lg font-medium text-gray-700 mb-2">
                                                            No hay comprobantes para revisar
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            Los comprobantes aparecerán aquí cuando estén disponibles para validación
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            comprobantes.map((comprobante, index) => (
                                                <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                                                    <td className="px-6 py-4 text-sm text-gray-900">
                                                        <div className="font-medium">{comprobante.nombreAlumno}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">
                                                        {comprobante.cursoComprado}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {comprobante.fechaHora}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                                                        ${comprobante.importe}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">
                                                        {comprobante.metodoPago}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <button className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-150 px-3 py-1 rounded-lg hover:bg-blue-50">
                                                            Ver comprobante
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <div className="flex gap-3 justify-center">
                                                            <button
                                                                onClick={() => handleRechazar(comprobante)}
                                                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors duration-150"
                                                            >
                                                                RECHAZAR
                                                            </button>
                                                            <button
                                                                onClick={() => handleValidar(comprobante)}
                                                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition-colors duration-150"
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
                <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-red-50/95 backdrop-blur-lg rounded-2xl max-w-md w-full shadow-2xl border border-red-200/50 overflow-hidden">
                        <div className="flex justify-center pt-8 pb-4">
                            <div className="w-20 h-20 bg-red-200/80 rounded-full flex items-center justify-center">
                                <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-center px-6 pb-2">
                            <h3 className="text-xl font-bold text-red-800">Confirmar Rechazo</h3>
                        </div>
                        <div className="px-6 pb-8">
                            <p className="text-gray-700 mb-6 text-center">
                                ¿Estás seguro que deseas rechazar el comprobante de <br />
                                <span className="font-semibold text-gray-900">{currentComprobante?.nombreAlumno}</span>?
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => setShowRejectModal(false)}
                                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors duration-150"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmarRechazo}
                                    className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors duration-150"
                                >
                                    Rechazar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-green-50/95 backdrop-blur-lg rounded-2xl max-w-md w-full shadow-2xl border border-green-200/50 overflow-hidden">
                        <div className="flex justify-center pt-8 pb-4">
                            <div className="w-20 h-20 bg-green-200/80 rounded-full flex items-center justify-center">
                                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={4}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-center px-6 pb-2">
                            <h3 className="text-xl font-bold text-green-800">¡Comprobante Validado!</h3>
                        </div>
                        <div className="px-6 pb-8">
                            <p className="text-gray-700 mb-6 text-center">
                                El comprobante de <br />
                                <span className="font-semibold text-gray-900">{currentComprobante?.nombreAlumno}</span> <br />
                                ha sido validado exitosamente.
                            </p>
                            <div className="flex justify-center">
                                <button
                                    onClick={() => setShowSuccessModal(false)}
                                    className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors duration-150"
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