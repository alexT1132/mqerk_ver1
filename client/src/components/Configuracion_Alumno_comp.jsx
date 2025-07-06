import React, { useState, useEffect } from 'react';

// ========================================
// ICONOS SVG MODERNOS Y RESPONSIVE
// ========================================
// Iconos optimizados para dispositivos móviles y desktop con colores dinámicos
const IconoUsuario = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const IconoLibroAbierto = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.523 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.523 18.246 18 16.5 18s-3.332.477-4.5 1.253" />
    </svg>
);

const IconoCandado = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-rose-600 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

const IconoCamara = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const IconoCheckCirculo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const IconoAlertaCirculo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-rose-500 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const IconoGuardar = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
);

const IconoEscudo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

const IconoCargando = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
);

// ========================================
// UTILIDADES Y VALIDACIONES
// ========================================
// BACKEND: Función de validación de correo electrónico
// TODO: Considerar usar validación más robusta o librería de validación como Yup o Joi
const isValidEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
};

export function Configuracion_Alumno_comp() {
    // ========================================
    // ESTADOS DEL COMPONENTE
    // ========================================
    
    // Estado para los campos del formulario - BACKEND: datos desde API
    const [profile, setProfile] = useState({
        nombre: 'XXXX', // TODO: GET /api/user/profile - obtener nombre completo
        email: 'XXXX',  // TODO: GET /api/user/profile - obtener email actual
        telefono: 'XXXX', // TODO: GET /api/user/profile - obtener teléfono
        fechaNacimiento: 'XXXX', // TODO: GET /api/user/profile - obtener fecha de nacimiento
        fotoUrl: null, // TODO: GET /api/user/profile - URL de foto desde servidor (null = sin foto)
    });

    // Estado para preferencias educativas - BACKEND: datos desde API
    const [learningPreferences, setLearningPreferences] = useState({
        nivelExperiencia: '', // TODO: GET /api/user/preferences - nivel actual del usuario
        intereses: [], // TODO: GET /api/user/preferences - array de intereses seleccionados
    });

    // Estado para preferencias de notificaciones - BACKEND: datos desde API
    const [notificationPreferences, setNotificationPreferences] = useState({
        emailNotifications: true, // TODO: GET /api/user/notifications - notificaciones por email
        classReminders: true, // TODO: GET /api/user/notifications - recordatorios de clases
        pushNotifications: false, // TODO: GET /api/user/notifications - notificaciones push
        profilePublic: true, // TODO: GET /api/user/privacy - perfil público
        showProgress: false, // TODO: GET /api/user/privacy - mostrar progreso
        instructorMessages: true, // TODO: GET /api/user/privacy - mensajes de instructores
    });

    // Estado para la gestión de contraseñas - LOCAL: no persiste
    const [security, setSecurity] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });

    // Estados para validaciones en tiempo real - LOCAL: validación del lado cliente
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
    
    // Estados para loading y errores - LOCAL: control de UI
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // ========================================
    // EFFECTS PARA CARGA INICIAL DE DATOS
    // ========================================
    
    // TODO: BACKEND - Cargar datos del usuario al montar el componente
    useEffect(() => {
        const loadUserData = async () => {
            setIsLoading(true);
            try {
                // TODO: Implementar llamadas a la API
                // const profileResponse = await fetch('/api/user/profile');
                // const profileData = await profileResponse.json();
                // setProfile({
                //     nombre: profileData.nombre || 'XXXX',
                //     email: profileData.email || 'XXXX', 
                //     telefono: profileData.telefono || 'XXXX',
                //     fechaNacimiento: profileData.fechaNacimiento || 'XXXX',
                //     fotoUrl: profileData.profilePictureUrl || null // null = sin foto de perfil
                // });
                
                // const preferencesResponse = await fetch('/api/user/preferences');
                // const preferencesData = await preferencesResponse.json();
                // setLearningPreferences(preferencesData);
                
                // const notificationsResponse = await fetch('/api/user/notifications');
                // const notificationsData = await notificationsResponse.json();
                // setNotificationPreferences(notificationsData);
                
                console.log('🔧 TODO: Implementar carga de datos desde backend');
            } catch (error) {
                console.error('Error loading user data:', error);
                setErrors({ general: 'Error al cargar los datos del usuario' });
            } finally {
                setIsLoading(false);
            }
        };

        loadUserData();
    }, []);

    // ========================================
    // MANEJADORES DE EVENTOS
    // ========================================
    // Manejador para cambios en información de perfil
    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));

        // Validación en tiempo real del email
        if (name === 'email') {
            setEmailValid(isValidEmail(value));
        }
    };

    // Manejador para cambios en preferencias de aprendizaje
    const handleLearningPreferenceChange = (e) => {
        const { name, value } = e.target;
        setLearningPreferences(prev => ({ ...prev, [name]: value }));
    };

    // Manejador para cambios en preferencias de notificaciones
    const handleNotificationChange = (e) => {
        const { name, checked } = e.target;
        setNotificationPreferences(prev => ({ ...prev, [name]: checked }));
    };

    // Manejador para cambios en intereses de aprendizaje
    const handleInterestsChange = (e) => {
        const { value, checked } = e.target;
        setLearningPreferences(prev => ({
            ...prev,
            intereses: checked 
                ? [...prev.intereses, value]
                : prev.intereses.filter(interest => interest !== value)
        }));
    };

    // Manejador para eliminar cuenta
    const handleDeleteAccount = () => {
        const confirmation = window.confirm(
            "⚠️ ADVERTENCIA: Esta acción eliminará permanentemente tu cuenta y todos tus datos. Esta acción NO se puede deshacer.\n\n¿Estás seguro de que quieres continuar?"
        );
        
        if (confirmation) {
            const doubleConfirmation = window.prompt(
                "Para confirmar, escribe 'ELIMINAR' en mayúsculas:"
            );
            
            if (doubleConfirmation === 'ELIMINAR') {
                // TODO: BACKEND - Eliminar cuenta
                // const response = await fetch('/api/user/delete-account', {
                //     method: 'DELETE',
                //     headers: {
                //         'Authorization': `Bearer ${localStorage.getItem('token')}`,
                //         'Content-Type': 'application/json'
                //     }
                // });
                
                console.log('🔧 TODO: Implementar eliminación de cuenta en backend');
                alert("Funcionalidad de eliminación de cuenta (simulada). La cuenta se eliminaría en producción.");
            } else {
                alert("Eliminación cancelada. La confirmación no coincide.");
            }
        }
    };

    // Manejador para cambios en campos de seguridad/contraseña
    const handleSecurityChange = (e) => {
        const { name, value } = e.target;
        setSecurity(prev => ({ ...prev, [name]: value }));

        // Validación en tiempo real de contraseñas
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

    // ========================================
    // FUNCIONES DE ACCIÓN (BACKEND CALLS)
    // ========================================

    // BACKEND: Guardar cambios generales del perfil
    const handleSaveChanges = async (e) => {
        e.preventDefault();
        
        if (!emailValid) {
            alert("Por favor, introduce un correo electrónico válido.");
            return;
        }

        setIsLoading(true);
        try {
            // TODO: POST /api/user/profile - actualizar información del perfil
            // const response = await fetch('/api/user/profile', {
            //     method: 'PUT',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ 
            //         nombre: profile.nombre, 
            //         email: profile.email 
            //     })
            // });
            
            // TODO: POST /api/user/preferences - actualizar preferencias
            // const prefsResponse = await fetch('/api/user/preferences', {
            //     method: 'PUT',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(learningPreferences)
            // });

            console.log('🔧 TODO: Implementar guardado en backend');
            alert("Configuración guardada con éxito!");
        } catch (error) {
            console.error('Error saving changes:', error);
            alert("Error al guardar los cambios. Por favor, inténtalo de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    // BACKEND: Cambiar contraseña del usuario
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
            // TODO: POST /api/user/change-password - cambiar contraseña
            // const response = await fetch('/api/user/change-password', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //         currentPassword: security.currentPassword,
            //         newPassword: security.newPassword
            //     })
            // });
            
            console.log('🔧 TODO: Implementar cambio de contraseña en backend');
            alert("Contraseña cambiada con éxito!");
            
            // Limpiar formulario tras éxito
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
            console.error('Error changing password:', error);
            alert("Error al cambiar la contraseña. Por favor, verifica tu contraseña actual.");
        } finally {
            setIsLoading(false);
        }
    };

    // BACKEND: Cambiar foto de perfil
    const handleChangeProfilePicture = () => {
        // Crear input file dinámicamente para mejor UX
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.style.display = 'none';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                // Validar tamaño del archivo (máx 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    alert('La imagen debe ser menor a 5MB');
                    return;
                }
                
                // Validar tipo de archivo
                if (!file.type.startsWith('image/')) {
                    alert('Solo se permiten archivos de imagen');
                    return;
                }
                
                try {
                    setIsLoading(true);
                    
                    // Crear preview local inmediatamente
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        setProfile(prev => ({ ...prev, fotoUrl: e.target.result }));
                    };
                    reader.readAsDataURL(file);
                    
                    // TODO: BACKEND - Subir imagen al servidor
                    // const formData = new FormData();
                    // formData.append('profilePicture', file);
                    // 
                    // const response = await fetch('/api/user/profile-picture', {
                    //     method: 'POST',
                    //     headers: {
                    //         'Authorization': `Bearer ${localStorage.getItem('token')}` // TODO: Obtener token del auth context
                    //     },
                    //     body: formData
                    // });
                    // 
                    // if (!response.ok) {
                    //     throw new Error('Error al subir la imagen');
                    // }
                    // 
                    // const result = await response.json();
                    // // El backend debería devolver: { success: true, imageUrl: "https://cdn.ejemplo.com/profiles/usuario123.jpg" }
                    // setProfile(prev => ({ ...prev, fotoUrl: result.imageUrl }));
                    
                    console.log('🔧 TODO: Implementar subida de imagen al backend');
                    alert("Foto de perfil actualizada localmente. En producción se subiría al servidor.");
                    
                } catch (error) {
                    console.error('Error uploading profile picture:', error);
                    alert("Error al cambiar la foto de perfil. Por favor, inténtalo de nuevo.");
                    // Revertir el cambio local si falla (volver a null = sin foto)
                    setProfile(prev => ({ ...prev, fotoUrl: null }));
                } finally {
                    setIsLoading(false);
                }
            }
        };
        
        // Cleanup function
        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
    };

    // ========================================
    // CONFIGURACIÓN Y DATOS ESTÁTICOS
    // ========================================

    // Mapeo de intereses disponibles - BACKEND: podría venir desde API
    const interestLabels = {
        programacion: 'Programación',
        tecnologico: 'Technology & AI',
        psicoeducativo: 'Psicoeducativo',
        idiomas: 'Idiomas',
        exactas: 'Ciencias Exactas',
        admision: 'Preparación Admisión'
    };

    // ========================================
    // RENDER DEL COMPONENTE
    // ========================================
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50 py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header mejorado con loading indicator */}
                <div className="text-center mb-6 sm:mb-12">
                    <div className="flex items-center justify-center gap-3 mb-2 sm:mb-4">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Configuración de Cuenta
                        </h1>
                        {isLoading && <IconoCargando />}
                    </div>
                    <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto px-4">
                        Personaliza tu experiencia de aprendizaje y mantén tu cuenta segura
                    </p>
                    {errors.general && (
                        <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm">
                            {errors.general}
                        </div>
                    )}
                </div>

                {/* Contenido principal dividido en tarjetas responsivas */}
                <div className="space-y-4 sm:space-y-6">
                    {/* Sección: Información de Perfil */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-2xl border border-white/20 overflow-hidden transform transition-all duration-300 hover:shadow-xl">
                        <div className="p-4 sm:p-6 lg:p-8">
                            <div className="flex items-center gap-3 mb-4 sm:mb-6">
                                <div className="p-2 sm:p-3 bg-blue-100 rounded-xl sm:rounded-2xl transition-all duration-300 hover:bg-blue-200">
                                    <IconoUsuario />
                                </div>
                                <div>
                                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Información de Perfil</h2>
                                    <p className="text-gray-600 text-sm sm:text-base">Actualiza tu información personal</p>
                                </div>
                            </div>
                            
                            {/* Profile content reorganizado para móvil */}
                            <div className="space-y-6">
                                {/* Profile Picture - centrada en móvil con mejores efectos */}
                                <div className="flex justify-center">
                                    <div className="relative group">
                                        <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg sm:shadow-xl ring-2 sm:ring-4 ring-blue-100 transition-all duration-500 group-hover:ring-blue-200 group-hover:shadow-2xl bg-gradient-to-br from-gray-100 to-gray-200 group-hover:scale-105">
                                            {profile.fotoUrl ? (
                                                <img
                                                    src={profile.fotoUrl}
                                                    alt="Foto de Perfil"
                                                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                                                    onError={(e) => {
                                                        // Fallback si la imagen no carga
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            {/* Placeholder cuando no hay imagen */}
                                            <div 
                                                className={`w-full h-full flex items-center justify-center ${profile.fotoUrl ? 'hidden' : 'flex'}`}
                                                style={{ display: profile.fotoUrl ? 'none' : 'flex' }}
                                            >
                                                <div className="text-gray-400 text-center">
                                                    <IconoUsuario />
                                                    <span className="block text-xs mt-1">Sin foto</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleChangeProfilePicture}
                                            disabled={isLoading}
                                            className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-lg transition-all duration-300 transform opacity-0 group-hover:opacity-100 hover:scale-110 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="Cambiar foto de perfil"
                                        >
                                            {isLoading ? <IconoCargando /> : <IconoCamara />}
                                        </button>
                                        {/* Indicador de carga global */}
                                        {isLoading && (
                                            <div className="absolute inset-0 bg-white/80 rounded-2xl sm:rounded-3xl flex items-center justify-center">
                                                <IconoCargando />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Profile Fields - stack vertical en móvil con mejor feedback visual */}
                                <div className="space-y-4 sm:space-y-6">
                                    <div className="space-y-2">
                                        <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700">
                                            Nombre Completo
                                        </label>
                                        <input
                                            type="text"
                                            id="nombre"
                                            name="nombre"
                                            value={profile.nombre}
                                            onChange={handleProfileChange}
                                            disabled={isLoading}
                                            className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-gray-50/50 border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-gray-50 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                                            placeholder="Ingresa tu nombre completo"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                                            Correo Electrónico
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={profile.email}
                                            onChange={handleProfileChange}
                                            disabled={isLoading}
                                            className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-gray-50/50 border rounded-xl sm:rounded-2xl focus:ring-2 focus:border-transparent transition-all duration-200 hover:bg-gray-50 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed ${
                                                !emailValid && profile.email.length > 0 
                                                    ? 'border-rose-300 focus:ring-rose-500' 
                                                    : 'border-gray-200 focus:ring-blue-500'
                                            }`}
                                            placeholder="ejemplo@correo.com"
                                        />
                                        {!emailValid && profile.email.length > 0 && (
                                            <div className="flex items-center gap-2 text-rose-600 text-xs sm:text-sm font-medium animate-pulse">
                                                <IconoAlertaCirculo />
                                                <span>Formato de correo inválido</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="telefono" className="block text-sm font-semibold text-gray-700">
                                            Teléfono
                                        </label>
                                        <input
                                            type="tel"
                                            id="telefono"
                                            name="telefono"
                                            value={profile.telefono}
                                            onChange={handleProfileChange}
                                            disabled={isLoading}
                                            className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-gray-50/50 border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-gray-50 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                                            placeholder="(123) 456-7890"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="fechaNacimiento" className="block text-sm font-semibold text-gray-700">
                                            Fecha de Nacimiento
                                        </label>
                                        <input
                                            type="date"
                                            id="fechaNacimiento"
                                            name="fechaNacimiento"
                                            value={profile.fechaNacimiento}
                                            onChange={handleProfileChange}
                                            disabled={isLoading}
                                            className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-gray-50/50 border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-gray-50 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sección: Preferencias de Aprendizaje */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-2xl border border-white/20 overflow-hidden transform transition-all duration-300 hover:shadow-xl">
                        <div className="p-4 sm:p-6 lg:p-8">
                            <div className="flex items-center gap-3 mb-4 sm:mb-6">
                                <div className="p-2 sm:p-3 bg-emerald-100 rounded-xl sm:rounded-2xl transition-all duration-300 hover:bg-emerald-200">
                                    <IconoLibroAbierto />
                                </div>
                                <div>
                                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Preferencias de Aprendizaje</h2>
                                    <p className="text-gray-600 text-sm sm:text-base">Personaliza tu experiencia educativa</p>
                                </div>
                            </div>
                            
                            <div className="space-y-6 sm:space-y-8">
                                {/* Nivel de Experiencia */}
                                <div className="space-y-3">
                                    <label htmlFor="nivelExperiencia" className="block text-sm font-semibold text-gray-700">
                                        Nivel de Experiencia
                                    </label>
                                    <select
                                        id="nivelExperiencia"
                                        name="nivelExperiencia"
                                        value={learningPreferences.nivelExperiencia}
                                        onChange={handleLearningPreferenceChange}
                                        disabled={isLoading}
                                        className="w-full sm:max-w-xs px-3 py-2.5 sm:px-4 sm:py-3 bg-gray-50/50 border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 hover:bg-gray-50 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="">Selecciona tu nivel</option>
                                        <option value="principiante">🌱 Principiante</option>
                                        <option value="intermedio">📈 Intermedio</option>
                                        <option value="avanzado">🚀 Avanzado</option>
                                    </select>
                                </div>
                                
                                {/* Áreas de Interés */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-700">Áreas de Interés</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        {Object.entries(interestLabels).map(([key, label]) => (
                                            <label key={key} className="group cursor-pointer">
                                                <div className={`relative p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 ${
                                                    learningPreferences.intereses.includes(key)
                                                        ? 'border-emerald-500 bg-emerald-50 shadow-md transform scale-105'
                                                        : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30 hover:shadow-sm'
                                                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                    <div className="flex items-center gap-2 sm:gap-3">
                                                        <input
                                                            type="checkbox"
                                                            value={key}
                                                            checked={learningPreferences.intereses.includes(key)}
                                                            onChange={handleInterestsChange}
                                                            disabled={isLoading}
                                                            className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 border-2 border-gray-300 rounded-lg focus:ring-emerald-500 focus:ring-2 disabled:cursor-not-allowed"
                                                        />
                                                        <span className="font-medium text-gray-700 group-hover:text-emerald-700 transition-colors text-sm sm:text-base">
                                                            {label}
                                                        </span>
                                                    </div>
                                                    {learningPreferences.intereses.includes(key) && (
                                                        <div className="absolute top-1 right-1 text-emerald-500">
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

                    {/* Sección: Preferencias de Notificaciones y Privacidad */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-2xl border border-white/20 overflow-hidden transform transition-all duration-300 hover:shadow-xl">
                        <div className="p-4 sm:p-6 lg:p-8">
                            <div className="flex items-center gap-3 mb-4 sm:mb-6">
                                <div className="p-2 sm:p-3 bg-purple-100 rounded-xl sm:rounded-2xl transition-all duration-300 hover:bg-purple-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-5 5v-5zM11.613 15.932c-.26-.026-.522-.032-.785-.032-1.188 0-2.355.186-3.46.546M9.828 15.932L4 21V9a7 7 0 0114 0v6.932" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Notificaciones y Privacidad</h2>
                                    <p className="text-gray-600 text-sm sm:text-base">Controla cómo te comunicamos y qué información compartes</p>
                                </div>
                            </div>
                            
                            <div className="space-y-6 sm:space-y-8">
                                {/* Notificaciones */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2">Notificaciones</h3>
                                    <div className="space-y-3 sm:space-y-4">
                                        {[
                                            { key: 'emailNotifications', label: 'Notificaciones por email', desc: 'Recibe actualizaciones importantes por correo' },
                                            { key: 'classReminders', label: 'Recordatorios de clases', desc: 'Te avisamos antes de tus clases programadas' },
                                            { key: 'pushNotifications', label: 'Notificaciones push', desc: 'Notificaciones instantáneas en tu dispositivo' },
                                            { key: 'instructorMessages', label: 'Mensajes de instructores', desc: 'Comunicación directa con tus profesores' }
                                        ].map(({ key, label, desc }) => (
                                            <label key={key} className="group cursor-pointer">
                                                <div className={`relative p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 ${
                                                    notificationPreferences[key]
                                                        ? 'border-purple-500 bg-purple-50 shadow-md'
                                                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/30 hover:shadow-sm'
                                                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                    <div className="flex items-start gap-3">
                                                        <input
                                                            type="checkbox"
                                                            name={key}
                                                            checked={notificationPreferences[key]}
                                                            onChange={handleNotificationChange}
                                                            disabled={isLoading}
                                                            className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 border-2 border-gray-300 rounded-lg focus:ring-purple-500 focus:ring-2 disabled:cursor-not-allowed mt-1"
                                                        />
                                                        <div className="flex-1">
                                                            <span className="font-medium text-gray-700 group-hover:text-purple-700 transition-colors text-sm sm:text-base block">
                                                                {label}
                                                            </span>
                                                            <span className="text-gray-500 text-xs sm:text-sm">
                                                                {desc}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {notificationPreferences[key] && (
                                                        <div className="absolute top-1 right-1 text-purple-500">
                                                            <IconoCheckCirculo />
                                                        </div>
                                                    )}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Privacidad */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-2">Privacidad</h3>
                                    <div className="space-y-3 sm:space-y-4">
                                        {[
                                            { key: 'profilePublic', label: 'Perfil público', desc: 'Otros estudiantes pueden ver tu perfil básico' },
                                            { key: 'showProgress', label: 'Mostrar progreso', desc: 'Permite que otros vean tu avance en los cursos' }
                                        ].map(({ key, label, desc }) => (
                                            <label key={key} className="group cursor-pointer">
                                                <div className={`relative p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 ${
                                                    notificationPreferences[key]
                                                        ? 'border-purple-500 bg-purple-50 shadow-md'
                                                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/30 hover:shadow-sm'
                                                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                    <div className="flex items-start gap-3">
                                                        <input
                                                            type="checkbox"
                                                            name={key}
                                                            checked={notificationPreferences[key]}
                                                            onChange={handleNotificationChange}
                                                            disabled={isLoading}
                                                            className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 border-2 border-gray-300 rounded-lg focus:ring-purple-500 focus:ring-2 disabled:cursor-not-allowed mt-1"
                                                        />
                                                        <div className="flex-1">
                                                            <span className="font-medium text-gray-700 group-hover:text-purple-700 transition-colors text-sm sm:text-base block">
                                                                {label}
                                                            </span>
                                                            <span className="text-gray-500 text-xs sm:text-sm">
                                                                {desc}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {notificationPreferences[key] && (
                                                        <div className="absolute top-1 right-1 text-purple-500">
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

                    {/* Sección: Zona de Peligro */}
                    <div className="bg-gradient-to-br from-rose-50 to-red-50/50 rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-2xl border-2 border-rose-200/50 overflow-hidden transform transition-all duration-300 hover:shadow-xl">
                        <div className="p-4 sm:p-6 lg:p-8">
                            <div className="flex items-center gap-3 mb-4 sm:mb-6">
                                <div className="p-2 sm:p-3 bg-rose-200 rounded-xl sm:rounded-2xl transition-all duration-300 hover:bg-rose-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-rose-700 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-rose-900">Zona de Peligro</h2>
                                    <p className="text-rose-700 text-sm sm:text-base">Acciones irreversibles para tu cuenta</p>
                                </div>
                            </div>
                            
                            <div className="space-y-4 sm:space-y-6">
                                <div className="bg-white/60 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-rose-300/50">
                                    <div className="flex items-start gap-3 mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                        <div>
                                            <h3 className="font-bold text-rose-900 text-base sm:text-lg">Eliminar Cuenta</h3>
                                            <p className="text-rose-700 text-sm sm:text-base mt-1">
                                                Esta acción eliminará permanentemente tu cuenta, todos tus cursos, progreso y datos personales. 
                                                <span className="font-semibold"> Esta acción NO se puede deshacer.</span>
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-rose-100/50 rounded-lg p-3 sm:p-4 mb-4">
                                        <h4 className="font-semibold text-rose-900 text-sm mb-2">Se eliminará:</h4>
                                        <ul className="text-rose-800 text-xs sm:text-sm space-y-1">
                                            <li>• Tu perfil y información personal</li>
                                            <li>• Todo tu progreso en cursos</li>
                                            <li>• Certificados y logros obtenidos</li>
                                            <li>• Historial de pagos y facturas</li>
                                            <li>• Configuraciones y preferencias</li>
                                        </ul>
                                    </div>
                                    
                                    <button
                                        type="button"
                                        onClick={handleDeleteAccount}
                                        disabled={isLoading}
                                        className={`w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-white shadow-lg transition-all duration-200 text-sm sm:text-base ${
                                            isLoading
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 hover:shadow-xl hover:scale-105 active:scale-95'
                                        }`}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            {isLoading ? <IconoCargando /> : (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            )}
                                            {isLoading ? 'Procesando...' : 'Eliminar Cuenta Permanentemente'}
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sección: Seguridad de la Cuenta */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-2xl border border-white/20 overflow-hidden transform transition-all duration-300 hover:shadow-xl">
                        <div className="p-4 sm:p-6 lg:p-8">
                            <div className="flex items-center gap-3 mb-4 sm:mb-6">
                                <div className="p-2 sm:p-3 bg-rose-100 rounded-xl sm:rounded-2xl transition-all duration-300 hover:bg-rose-200">
                                    <IconoCandado />
                                </div>
                                <div>
                                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Seguridad de la Cuenta</h2>
                                    <p className="text-gray-600 text-sm sm:text-base">Mantén tu cuenta protegida</p>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                {/* Password fields - stack vertical en móvil */}
                                <div className="space-y-4 sm:space-y-6">
                                    {/* Contraseña Actual */}
                                    <div className="space-y-2">
                                        <label htmlFor="currentPassword" className="block text-sm font-semibold text-gray-700">
                                            Contraseña Actual
                                        </label>
                                        <input
                                            type="password"
                                            id="currentPassword"
                                            name="currentPassword"
                                            value={security.currentPassword}
                                            onChange={handleSecurityChange}
                                            disabled={isLoading}
                                            className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-gray-50/50 border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200 hover:bg-gray-50 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                                            placeholder="Introduce tu contraseña actual"
                                        />
                                    </div>
                                    
                                    {/* Nueva Contraseña */}
                                    <div className="space-y-2">
                                        <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700">
                                            Nueva Contraseña
                                        </label>
                                        <input
                                            type="password"
                                            id="newPassword"
                                            name="newPassword"
                                            value={security.newPassword}
                                            onChange={handleSecurityChange}
                                            disabled={isLoading}
                                            className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-gray-50/50 border rounded-xl sm:rounded-2xl focus:ring-2 focus:border-transparent transition-all duration-200 hover:bg-gray-50 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed ${
                                                security.newPassword && !passwordValidation.isValid && security.newPassword.length > 0
                                                    ? 'border-rose-300 focus:ring-rose-500'
                                                    : 'border-gray-200 focus:ring-rose-500'
                                            }`}
                                            placeholder="Crea una nueva contraseña"
                                        />
                                    </div>
                                    
                                    {/* Confirmar Nueva Contraseña */}
                                    <div className="space-y-2">
                                        <label htmlFor="confirmNewPassword" className="block text-sm font-semibold text-gray-700">
                                            Confirmar Nueva Contraseña
                                        </label>
                                        <input
                                            type="password"
                                            id="confirmNewPassword"
                                            name="confirmNewPassword"
                                            value={security.confirmNewPassword}
                                            onChange={handleSecurityChange}
                                            disabled={isLoading}
                                            className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-gray-50/50 border rounded-xl sm:rounded-2xl focus:ring-2 focus:border-transparent transition-all duration-200 hover:bg-gray-50 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed ${
                                                security.confirmNewPassword && !passwordValidation.match && security.newPassword.length > 0
                                                    ? 'border-rose-300 focus:ring-rose-500'
                                                    : 'border-gray-200 focus:ring-rose-500'
                                            }`}
                                            placeholder="Confirma tu nueva contraseña"
                                        />
                                        {security.newPassword.length > 0 && security.confirmNewPassword.length > 0 && (
                                            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium animate-pulse">
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
                                </div>
                                
                                {/* Password Requirements */}
                                {security.newPassword.length > 0 && (
                                    <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200/50">
                                        <div className="flex items-center gap-2 mb-3 sm:mb-4">
                                            {passwordValidation.isValid ? <IconoCheckCirculo /> : <IconoAlertaCirculo />}
                                            <h4 className={`font-semibold text-sm sm:text-base transition-colors duration-200 ${passwordValidation.isValid ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                Requisitos de Seguridad
                                            </h4>
                                        </div>
                                        <div className="space-y-2 sm:space-y-3">
                                            {[
                                                { key: 'length', text: 'Al menos 8 caracteres' },
                                                { key: 'uppercase', text: 'Una letra mayúscula' },
                                                { key: 'lowercase', text: 'Una letra minúscula' },
                                                { key: 'number', text: 'Un número' },
                                                { key: 'specialChar', text: 'Un carácter especial' }
                                            ].map(({ key, text }) => (
                                                <div key={key} className="flex items-center gap-2 text-xs sm:text-sm transition-colors duration-200">
                                                    {passwordValidation[key] ? <IconoCheckCirculo /> : <IconoAlertaCirculo />}
                                                    <span className={passwordValidation[key] ? 'text-emerald-600 font-medium' : 'text-gray-600'}>
                                                        {text}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Change Password Button */}
                                <div className="pt-2 sm:pt-4">
                                    <button
                                        type="button"
                                        onClick={handleChangePassword}
                                        disabled={!passwordValidation.isValid || !passwordValidation.match || security.newPassword === '' || isLoading}
                                        className={`w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-semibold text-white shadow-lg transition-all duration-200 text-sm sm:text-base ${
                                            !passwordValidation.isValid || !passwordValidation.match || security.newPassword === '' || isLoading
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 hover:shadow-xl hover:scale-105 active:scale-95'
                                        }`}
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

                    {/* Save Button */}
                    <div className="bg-gradient-to-r from-gray-50/50 to-blue-50/30 rounded-2xl sm:rounded-3xl shadow-lg border border-white/20 overflow-hidden transform transition-all duration-300 hover:shadow-xl">
                        <div className="p-4 sm:p-6 lg:p-8">
                            <div className="flex flex-col gap-4 text-center sm:text-left">
                                <div className="flex items-center gap-2 text-blue-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-xs sm:text-sm font-medium">
                                        Los cambios se guardarán de forma segura y se aplicarán inmediatamente.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSaveChanges}
                                    disabled={!emailValid || isLoading}
                                    className={`w-full px-8 sm:px-12 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg text-white shadow-lg transition-all duration-200 ${
                                        !emailValid || isLoading
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:scale-105 active:scale-95'
                                    }`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        {isLoading ? <IconoCargando /> : <IconoGuardar />}
                                        {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ========================================
// DOCUMENTACIÓN DEL COMPONENTE
// ========================================
// 
// DESCRIPCIÓN:
// Componente de configuración de cuenta para estudiantes que permite:
// - Actualizar información personal (nombre, email, foto de perfil)
// - Configurar preferencias de aprendizaje
// - Cambiar contraseña con validaciones de seguridad
// - Seleccionar áreas de interés educativo
//

//
// BACKEND INTEGRATION POINTS:
// - GET /api/user/profile - cargar datos del perfil
//   • Debe devolver: { nombre, email, telefono, fechaNacimiento, profilePictureUrl }
//   • profilePictureUrl puede ser null si no tiene foto
// - PUT /api/user/profile - actualizar información personal
// - GET /api/user/preferences - cargar preferencias
// - PUT /api/user/preferences - actualizar preferencias
// - GET /api/user/notifications - cargar configuración de notificaciones
// - PUT /api/user/notifications - actualizar notificaciones
// - POST /api/user/change-password - cambiar contraseña
// - POST /api/user/profile-picture - subir nueva foto (FormData)
//   • Debe devolver: { success: true, imageUrl: "URL_completa_de_la_imagen" }
// - DELETE /api/user/delete-account - eliminar cuenta permanentemente
//

export default Configuracion_Alumno_comp;