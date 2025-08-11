import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getConfigRequest, upsertConfigRequest, changePasswordRequest, updateEstudianteRequest, updateFotoEstudianteRequest, softDeleteAlumnoRequest } from '../../api/estudiantes.js';
import ConfirmModal from '../shared/ConfirmModal.jsx';

// Iconos SVG
const IconoUsuario = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const IconoLibroAbierto = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.523 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.523 18.246 18 16.5 18s-3.332.477-4.5 1.253" />
    </svg>
);

const IconoCandado = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

const IconoCamara = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const IconoCheckCirculo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const IconoAlertaCirculo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const IconoGuardar = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
);

const IconoEscudo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

const IconoCargando = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
);

const IconoTrash = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

// Utilidades
const isValidEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
};

export function Configuracion_Alumno_comp() {
    const { user, alumno, logout } = useAuth();
    // Estados del componente
    // Helper para armar URL absoluta de fotos
    const host = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname : 'localhost';
    const apiUrl = (import.meta?.env?.VITE_API_URL) || `http://${host}:1002/api`;
    const apiOrigin = apiUrl.replace(/\/api\/?$/, '');
    const buildStaticUrl = (p) => {
        if (!p) return null;
        if (/^https?:\/\//i.test(p)) return p;
        return `${apiOrigin}${p.startsWith('/') ? '' : '/'}${p}`;
    };

    const [profile, setProfile] = useState({
        nombre: alumno?.nombre ? `${alumno.nombre} ${alumno.apellidos || ''}`.trim() : 'Estudiante',
        email: alumno?.email || '',
        telefono: alumno?.telefono || '',
        fechaNacimiento: '1990-05-15', // No disponible en backend aún
        fotoUrl: buildStaticUrl(alumno?.foto),
    });

    const [learningPreferences, setLearningPreferences] = useState({
        nivelExperiencia: 'intermedio',
        intereses: ['programacion', 'tecnologico'],
    });

    const [security, setSecurity] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });

    const [passwordValidation, setPasswordValidation] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        specialChar: false,
        match: false,
        isValid: false,
    });

    const [emailValid, setEmailValid] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteProcessing, setDeleteProcessing] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [saveProcessing, setSaveProcessing] = useState(false);

    // Carga inicial de datos del usuario
    
    useEffect(() => {
        const loadUserData = async () => {
            if (!alumno?.id) return;
            setIsLoading(true);
            try {
                // Sincronizar datos base desde Auth
                setProfile(prev => ({
                    ...prev,
                    nombre: alumno?.nombre ? `${alumno.nombre} ${alumno.apellidos || ''}`.trim() : prev.nombre,
                    email: alumno?.email || prev.email,
                    telefono: alumno?.telefono || prev.telefono,
                    fechaNacimiento: alumno?.fecha_nacimiento || prev.fechaNacimiento,
                    fotoUrl: buildStaticUrl(alumno?.foto) || prev.fotoUrl,
                }));

                // Cargar preferencias
                const res = await getConfigRequest(alumno.id);
                const cfg = res.data;
                setLearningPreferences({
                    nivelExperiencia: cfg.nivel_experiencia || 'intermedio',
                    intereses: Array.isArray(cfg.intereses) ? cfg.intereses : (cfg.intereses ? JSON.parse(cfg.intereses) : []),
                });
            } catch (error) {
                setErrors({ general: 'Error al cargar los datos del usuario' });
            } finally {
                setIsLoading(false);
            }
        };

        loadUserData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [alumno?.id]);

    // Manejadores de eventos
    
    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));

        if (name === 'email') {
            setEmailValid(isValidEmail(value));
        }
    };

    const handleLearningPreferenceChange = (e) => {
        const { name, value } = e.target;
        setLearningPreferences(prev => ({ ...prev, [name]: value }));
    };

    const handleInterestsChange = (e) => {
        const { value, checked } = e.target;
        setLearningPreferences(prev => ({
            ...prev,
            intereses: checked 
                ? [...prev.intereses, value]
                : prev.intereses.filter(interest => interest !== value)
        }));
    };

    const handleDeleteAccount = () => {
        setShowDeleteModal(true);
    };

    const confirmSoftDelete = async () => {
        try {
            setDeleteProcessing(true);
            if (!alumno?.id) throw new Error('ID de alumno no disponible');
            await softDeleteAlumnoRequest(alumno.id, { reason: 'Alumno solicitó eliminación de acceso' });
            alert('Tu acceso ha sido eliminado de forma permanente.');
            logout();
        } catch (e) {
            alert(e?.response?.data?.message || 'No se pudo desactivar la cuenta.');
        } finally {
            setDeleteProcessing(false);
            setShowDeleteModal(false);
        }
    };

    const handleSecurityChange = (e) => {
        const { name, value } = e.target;
        setSecurity(prev => ({ ...prev, [name]: value }));

        if (name === 'newPassword' || name === 'confirmNewPassword') {
            const newPass = name === 'newPassword' ? value : security.newPassword;
            const confirmPass = name === 'confirmNewPassword' ? value : security.confirmNewPassword;

            const length = newPass.length >= 8;
            const uppercase = /[A-Z]/.test(newPass);
            const lowercase = /[a-z]/.test(newPass);
            const number = /[0-9]/.test(newPass);
            const specialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPass);
            const match = newPass === confirmPass && newPass !== '';

            const isValid = length && uppercase && lowercase && number && specialChar && match;

            setPasswordValidation({
                length,
                uppercase,
                lowercase,
                number,
                specialChar,
                match,
                isValid,
            });
        }
    };

    // Funciones de acción
    const handleOpenSaveConfirm = (e) => {
        e.preventDefault();
        if (!emailValid) {
            alert('Por favor, introduce un correo electrónico válido.');
            return;
        }
        setShowSaveModal(true);
    };

    const executeSaveChanges = async () => {
        setSaveProcessing(true);
        setIsLoading(true);
        try {
            if (!alumno?.id) throw new Error('ID de alumno no disponible');
            // 1) Guardar preferencias
            const prefPayload = {
                nivel_experiencia: learningPreferences.nivelExperiencia,
                intereses: learningPreferences.intereses,
            };
            // 2) Actualizar email/teléfono/fecha_nacimiento del estudiante
            const estPayload = {
                email: profile.email || undefined,
                telefono: profile.telefono || undefined,
                fecha_nacimiento: profile.fechaNacimiento || undefined,
            };
            // Limpiar undefined
            Object.keys(estPayload).forEach((k) => estPayload[k] === undefined && delete estPayload[k]);

            await Promise.all([
                upsertConfigRequest(alumno.id, prefPayload),
                Object.keys(estPayload).length ? updateEstudianteRequest(alumno.id, estPayload) : Promise.resolve(),
            ]);
            // Guardado exitoso: no mostrar alert bloqueante
        } catch (error) {
            alert('Error al guardar los cambios. Por favor, inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
            setSaveProcessing(false);
            setShowSaveModal(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        
        if (!passwordValidation.isValid) {
            alert("Tu nueva contraseña no cumple con todos los requisitos de seguridad.");
            return;
        }
        if (security.newPassword !== security.confirmNewPassword) {
            alert("Las nuevas contraseñas no coinciden.");
            return;
        }
        
        setIsLoading(true);
        try {
            if (!user?.id) throw new Error('ID de usuario no disponible');
            await changePasswordRequest(user.id, {
                currentPassword: security.currentPassword,
                newPassword: security.newPassword,
            });
            alert("Contraseña cambiada con éxito!");
            
            setSecurity({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
            setPasswordValidation({
                length: false,
                uppercase: false,
                lowercase: false,
                number: false,
                specialChar: false,
                match: false,
                isValid: false,
            });
        } catch (error) {
            alert(error?.response?.data?.message || "Error al cambiar la contraseña. Por favor, verifica tu contraseña actual.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangeProfilePicture = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.style.display = 'none';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 5 * 1024 * 1024) {
                    alert('La imagen debe ser menor a 5MB');
                    return;
                }
                
                if (!file.type.startsWith('image/')) {
                    alert('Solo se permiten archivos de imagen');
                    return;
                }
                
                try {
                    setIsLoading(true);
                    // Subir a servidor
                    if (!alumno?.id) throw new Error('ID de alumno no disponible');
                    const res = await updateFotoEstudianteRequest(alumno.id, file);
                    const nuevaRel = res?.data?.data?.foto; // ej: /public/xxx.png
                    const nuevaAbs = buildStaticUrl(nuevaRel);
                    setProfile(prev => ({ ...prev, fotoUrl: nuevaAbs }));
                    alert('Foto de perfil actualizada');
                } catch (error) {
                    alert(error?.response?.data?.message || 'Error al cambiar la foto de perfil.');
                } finally {
                    setIsLoading(false);
                }
            }
        };
        
        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
    };

    // Configuración de datos estáticos

    const interestLabels = {
        programacion: 'Programación',
        tecnologico: 'Technology & AI',
        psicoeducativo: 'Psicoeducativo',
        idiomas: 'Idiomas',
        exactas: 'Ciencias Exactas',
        admision: 'Preparación Admisión'
    };

    // Render del componente
    
    return (
        <div className="min-h-screen bg-white py-8 px-6">
            <div className="max-w-6xl mx-auto">
                <ConfirmModal
                    isOpen={showDeleteModal}
                    variant="danger"
                    type="confirm"
                    message="Eliminar acceso de la cuenta"
                    details={'Esta acción eliminará tu acceso a la cuenta de forma permanente. No podrás volver a iniciar sesión con esta cuenta.'}
                    requireText={true}
                    expectedText={'ELIMINAR'}
                    inputLabel={'Para confirmar, escribe'}
                    confirmText={deleteProcessing ? 'Procesando...' : 'Sí, eliminar mi acceso'}
                    cancelText={'Cancelar'}
                    isProcessing={deleteProcessing}
                    onConfirm={confirmSoftDelete}
                    onCancel={() => setShowDeleteModal(false)}
                />
                <ConfirmModal
                    isOpen={showSaveModal}
                    variant="primary"
                    type="confirm"
                    message="Guardar cambios"
                    details={`Se guardarán tus preferencias de aprendizaje y tus datos de contacto.`}
                    confirmText={saveProcessing ? 'Guardando...' : 'Sí, guardar'}
                    cancelText={'Cancelar'}
                    isProcessing={saveProcessing}
                    onConfirm={executeSaveChanges}
                    onCancel={() => !saveProcessing && setShowSaveModal(false)}
                />
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <h1 className="text-3xl xs:text-4xl sm:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            CONFIGURACIÓN
                        </h1>
                        {isLoading && <IconoCargando />}
                    </div>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Personaliza tu experiencia de aprendizaje y mantén tu cuenta segura
                    </p>
                    {errors.general && (
                        <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm">
                            {errors.general}
                        </div>
                    )}
                </div>

                {/* Contenido principal en grid de 2 columnas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* COLUMNA IZQUIERDA */}
                    <div className="space-y-8">
                        {/* Información Personal */}
                        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden hover:shadow-3xl transition-all duration-300">
                            <div className="p-8">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                                        <IconoUsuario />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">Información Personal</h2>
                                        <p className="text-gray-600">Tu perfil público</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-8">
                                    {/* Foto de Perfil */}
                                    <div className="flex justify-center">
                                        <div className="relative group">
                                            <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-lg ring-4 ring-blue-100 transition-all duration-500 group-hover:ring-blue-200 group-hover:shadow-xl bg-gradient-to-br from-gray-100 to-gray-200 group-hover:scale-105">
                                                {profile.fotoUrl ? (
                                                    <img
                                                        src={profile.fotoUrl}
                                                        alt="Foto de Perfil"
                                                        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.nextSibling.style.display = 'flex';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <div className="text-gray-400 text-center">
                                                            <IconoUsuario />
                                                            <span className="block text-xs mt-1">Sin foto</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleChangeProfilePicture}
                                                disabled={isLoading}
                                                className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-3 rounded-xl shadow-lg transition-all duration-300 transform opacity-0 group-hover:opacity-100 hover:scale-110 hover:shadow-xl disabled:opacity-50"
                                                title="Cambiar foto de perfil"
                                            >
                                                {isLoading ? <IconoCargando /> : <IconoCamara />}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Campos del formulario */}
                                    <div className="space-y-6">
                                        <div>
                                            <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-2">
                                                Nombre Completo
                                            </label>
                                            <input
                                                type="text"
                                                id="nombre"
                                                name="nombre"
                                                value={profile.nombre}
                                                onChange={handleProfileChange}
                                                disabled={isLoading}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-gray-100"
                                                placeholder="Ingresa tu nombre completo"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                                Correo Electrónico
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={profile.email}
                                                onChange={handleProfileChange}
                                                disabled={isLoading}
                                                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 hover:bg-gray-100 ${
                                                    !emailValid && profile.email.length > 0 
                                                        ? 'border-rose-300 focus:ring-rose-500' 
                                                        : 'border-gray-200 focus:ring-blue-500'
                                                }`}
                                                placeholder="ejemplo@correo.com"
                                            />
                                            {!emailValid && profile.email.length > 0 && (
                                                <div className="flex items-center gap-2 text-rose-600 text-sm font-medium mt-2">
                                                    <IconoAlertaCirculo />
                                                    <span>Formato de correo inválido</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label htmlFor="telefono" className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Teléfono
                                                </label>
                                                <input
                                                    type="tel"
                                                    id="telefono"
                                                    name="telefono"
                                                    value={profile.telefono}
                                                    onChange={handleProfileChange}
                                                    disabled={isLoading}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-gray-100"
                                                    placeholder="(123) 456-7890"
                                                />
                                            </div>
                                            
                                            <div>
                                                <label htmlFor="fechaNacimiento" className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Fecha de Nacimiento
                                                </label>
                                                <input
                                                    type="date"
                                                    id="fechaNacimiento"
                                                    name="fechaNacimiento"
                                                    value={profile.fechaNacimiento}
                                                    onChange={handleProfileChange}
                                                    disabled={isLoading}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-gray-100"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Zona de Peligro */}
                        <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-2xl shadow-2xl border-2 border-rose-300 overflow-hidden hover:shadow-3xl transition-all duration-300">
                            <div className="p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-rose-200 rounded-xl">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-rose-900">Zona de Peligro</h2>
                                        <p className="text-rose-700">Acciones irreversibles</p>
                                    </div>
                                </div>
                                
                                <div className="bg-white/60 rounded-xl p-6 border border-rose-300/50">
                                    <div className="flex items-start gap-3 mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                        <div>
                                            <h3 className="font-bold text-rose-900 text-lg">Eliminar Acceso</h3>
                                            <p className="text-rose-700 mt-1">
                                                Esta acción eliminará permanentemente tu acceso a la cuenta. 
                                                <span className="font-semibold"> NO se puede deshacer.</span>
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <button
                                        type="button"
                                        onClick={handleDeleteAccount}
                                        disabled={isLoading}
                                        className="w-full px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all duration-200 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50"
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            {isLoading ? <IconoCargando /> : <IconoTrash />}
                                            {isLoading ? 'Procesando...' : 'Eliminar Acceso Permanentemente'}
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* COLUMNA DERECHA */}
                    <div className="space-y-8">
                        {/* Preferencias de Aprendizaje */}
                        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden hover:shadow-3xl transition-all duration-300">
                            <div className="p-8">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-3 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl">
                                        <IconoLibroAbierto />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">Preferencias de Aprendizaje</h2>
                                        <p className="text-gray-600">Personaliza tu experiencia</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-8">
                                    {/* Nivel de Experiencia */}
                                    <div>
                                        <label htmlFor="nivelExperiencia" className="block text-sm font-semibold text-gray-700 mb-3">
                                            Nivel de Experiencia
                                        </label>
                                        <select
                                            id="nivelExperiencia"
                                            name="nivelExperiencia"
                                            value={learningPreferences.nivelExperiencia}
                                            onChange={handleLearningPreferenceChange}
                                            disabled={isLoading}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 hover:bg-gray-100"
                                        >
                                            <option value="">Selecciona tu nivel</option>
                                            <option value="principiante">🌱 Principiante</option>
                                            <option value="intermedio">📈 Intermedio</option>
                                            <option value="avanzado">🚀 Avanzado</option>
                                        </select>
                                    </div>
                                    
                                    {/* Áreas de Interés */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-700 mb-4">Áreas de Interés</h3>
                                        <div className="grid grid-cols-1 gap-3">
                                            {Object.entries(interestLabels).map(([key, label]) => (
                                                <label key={key} className="group cursor-pointer">
                                                    <div className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                                                        learningPreferences.intereses.includes(key)
                                                            ? 'border-emerald-500 bg-emerald-50 shadow-md'
                                                            : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30'
                                                    }`}>
                                                        <div className="flex items-center gap-3">
                                                            <input
                                                                type="checkbox"
                                                                value={key}
                                                                checked={learningPreferences.intereses.includes(key)}
                                                                onChange={handleInterestsChange}
                                                                disabled={isLoading}
                                                                className="w-5 h-5 text-emerald-600 border-2 border-gray-300 rounded-lg focus:ring-emerald-500 focus:ring-2"
                                                            />
                                                            <span className="font-medium text-gray-700 group-hover:text-emerald-700 transition-colors">
                                                                {label}
                                                            </span>
                                                        </div>
                                                        {learningPreferences.intereses.includes(key) && (
                                                            <div className="absolute top-2 right-2 text-emerald-500">
                                                                <IconoCheckCirculo />
                                                            </div>
                                                        )}
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Seguridad de la Cuenta */}
                        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden hover:shadow-3xl transition-all duration-300">
                            <div className="p-8">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-3 bg-gradient-to-br from-rose-100 to-red-100 rounded-xl">
                                        <IconoCandado />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">Seguridad</h2>
                                        <p className="text-gray-600">Protege tu cuenta</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-6">
                                    <div>
                                        <label htmlFor="currentPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Contraseña Actual
                                        </label>
                                        <input
                                            type="password"
                                            id="currentPassword"
                                            name="currentPassword"
                                            value={security.currentPassword}
                                            onChange={handleSecurityChange}
                                            disabled={isLoading}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200 hover:bg-gray-100"
                                            placeholder="Tu contraseña actual"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Nueva Contraseña
                                        </label>
                                        <input
                                            type="password"
                                            id="newPassword"
                                            name="newPassword"
                                            value={security.newPassword}
                                            onChange={handleSecurityChange}
                                            disabled={isLoading}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200 hover:bg-gray-100"
                                            placeholder="Nueva contraseña"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="confirmNewPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Confirmar Contraseña
                                        </label>
                                        <input
                                            type="password"
                                            id="confirmNewPassword"
                                            name="confirmNewPassword"
                                            value={security.confirmNewPassword}
                                            onChange={handleSecurityChange}
                                            disabled={isLoading}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200 hover:bg-gray-100"
                                            placeholder="Confirma tu nueva contraseña"
                                        />
                                        {security.newPassword.length > 0 && security.confirmNewPassword.length > 0 && (
                                            <div className="flex items-center gap-2 text-sm font-medium mt-2">
                                                {passwordValidation.match ? (
                                                    <>
                                                        <IconoCheckCirculo />
                                                        <span className="text-emerald-600">Las contraseñas coinciden</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <IconoAlertaCirculo />
                                                        <span className="text-rose-600">Las contraseñas no coinciden</span>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Requisitos de Contraseña */}
                                    {security.newPassword.length > 0 && (
                                        <div className="bg-gray-50 rounded-xl p-6">
                                            <h4 className="font-semibold text-gray-700 mb-4">Requisitos de Seguridad</h4>
                                            <div className="space-y-2">
                                                {[
                                                    { key: 'length', text: 'Al menos 8 caracteres' },
                                                    { key: 'uppercase', text: 'Una letra mayúscula' },
                                                    { key: 'lowercase', text: 'Una letra minúscula' },
                                                    { key: 'number', text: 'Un número' },
                                                    { key: 'specialChar', text: 'Un carácter especial' }
                                                ].map(({ key, text }) => (
                                                    <div key={key} className="flex items-center gap-2 text-sm">
                                                        {passwordValidation[key] ? <IconoCheckCirculo /> : <IconoAlertaCirculo />}
                                                        <span className={passwordValidation[key] ? 'text-emerald-600 font-medium' : 'text-gray-600'}>
                                                            {text}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    <button
                                        type="button"
                                        onClick={handleChangePassword}
                                        disabled={!passwordValidation.isValid || !passwordValidation.match || security.newPassword === '' || isLoading}
                                        className="w-full px-8 py-3 rounded-xl font-semibold text-white shadow-lg transition-all duration-200 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 hover:shadow-xl hover:scale-105 active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            {isLoading ? <IconoCargando /> : <IconoEscudo />}
                                            {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botón de Guardar General */}
                <div className="mt-12 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl shadow-2xl border-2 border-blue-200 overflow-hidden hover:shadow-3xl transition-all duration-300">
                    <div className="p-8">
                        <div className="flex flex-col items-center gap-6 text-center">
                            <div className="flex items-center gap-2 text-blue-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="font-medium">
                                    Los cambios se guardarán de forma segura y se aplicarán inmediatamente.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleOpenSaveConfirm}
                                disabled={!emailValid || isLoading}
                                className="px-12 py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all duration-200 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:scale-105 active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                <div className="flex items-center justify-center gap-3">
                                    {isLoading ? <IconoCargando /> : <IconoGuardar />}
                                    {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Configuracion_Alumno_comp;