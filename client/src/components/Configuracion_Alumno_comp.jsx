import React, { useState } from 'react';
import reeseProfilePic from '../assets/reese.jfif';

// Iconos básicos en formato SVG mejorados
const IconoUsuario = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);
const IconoLibroAbierto = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.523 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.523 18.246 18 16.5 18s-3.332.477-4.5 1.253" />
    </svg>
);
const IconoCandado = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);
const IconoCamara = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
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

// Función de validación de correo electrónico
const isValidEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
};

export function Configuracion_Alumno_comp() {
    // Estado para los campos del formulario
    const [profile, setProfile] = useState({
        nombre: 'Juan Pérez',
        email: 'juan.perez@example.com',
        fotoUrl: reeseProfilePic, // Se obtendrá de la base de datos posteriormente
    });

    const [learningPreferences, setLearningPreferences] = useState({
        nivelExperiencia: 'intermedio',
        intereses: ['programacion', 'idiomas'],
    });

    const [security, setSecurity] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });

    // Estado para la validación de la nueva contraseña
    const [passwordValidation, setPasswordValidation] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        specialChar: false,
        match: false,
        isValid: false,
    });

    // Estado para la validación del correo electrónico
    const [emailValid, setEmailValid] = useState(true);

    // Manejadores de cambio para los inputs
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
        setLearningPreferences(prev => {
            const currentInterests = new Set(prev.intereses);
            if (checked) {
                currentInterests.add(value);
            } else {
                currentInterests.delete(value);
            }
            return { ...prev, intereses: Array.from(currentInterests) };
        });
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

    // Manejador para guardar la configuración
    const handleSaveChanges = (e) => {
        e.preventDefault();
        if (!emailValid) {
            alert("Por favor, introduce un correo electrónico válido.");
            return;
        }
        console.log("Guardando configuración:", { profile, learningPreferences, security });
        alert("Configuración guardada con éxito!");
    };

    const handleChangePassword = (e) => {
        e.preventDefault();
        if (!passwordValidation.isValid) {
            alert("Tu nueva contraseña no cumple con todos los requisitos de seguridad.");
            return;
        }
        if (security.newPassword !== security.confirmNewPassword) {
            alert("Las nuevas contraseñas no coinciden.");
            return;
        }
        
        console.log("Cambiando contraseña");
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
    };

    const handleChangeProfilePicture = () => {
        console.log("Simulando cambio de foto de perfil");
        alert("Funcionalidad de cambiar foto de perfil (simulada).");
    };

    const interestLabels = {
        programacion: 'Programación',
        tecnologico: 'Technology & AI',
        psicoeducativo: 'Psicoeducativo',
        idiomas: 'Idiomas',
        exactas: 'Ciencias Exactas',
        admision: 'Preparación Admisión'
    };
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50 py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-6 sm:mb-12">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 sm:mb-4">
                        Configuración de Cuenta
                    </h1>
                    <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto px-4">
                        Personaliza tu experiencia de aprendizaje y mantén tu cuenta segura
                    </p>
                </div>

                {/* Contenido principal dividido en tarjetas */}
                <div className="space-y-4 sm:space-y-6">
                    
                    {/* Sección: Información de Perfil */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-2xl border border-white/20 overflow-hidden">
                        <div className="p-4 sm:p-6 lg:p-8">
                            <div className="flex items-center gap-3 mb-4 sm:mb-6">
                                <div className="p-2 sm:p-3 bg-blue-100 rounded-xl sm:rounded-2xl">
                                    <IconoUsuario />
                                </div>
                                <div>
                                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Información de Perfil</h2>
                                    <p className="text-gray-600 text-sm sm:text-base">Actualiza tu información personal</p>
                                </div>
                            </div>
                            
                            {/* Profile content reorganizado para móvil */}
                            <div className="space-y-6">
                                {/* Profile Picture - centrada en móvil */}
                                <div className="flex justify-center">
                                    <div className="relative group">
                                        <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg sm:shadow-xl ring-2 sm:ring-4 ring-blue-100 transition-all duration-300 group-hover:ring-blue-200 group-hover:shadow-2xl bg-gray-100">
                                            <img
                                                src={profile.fotoUrl}
                                                alt="Foto de Perfil"
                                                className="w-full h-full object-contain object-center transition-transform duration-500 group-hover:scale-105"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleChangeProfilePicture}
                                            className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-lg transition-all duration-300 transform opacity-0 group-hover:opacity-100 hover:scale-110 hover:shadow-xl"
                                            title="Cambiar foto de perfil"
                                        >
                                            <IconoCamara />
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Profile Fields - stack vertical en móvil */}
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
                                            className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-gray-50/50 border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-gray-50 text-sm sm:text-base"
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
                                            className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-gray-50/50 border rounded-xl sm:rounded-2xl focus:ring-2 focus:border-transparent transition-all duration-200 hover:bg-gray-50 text-sm sm:text-base ${
                                                !emailValid && profile.email.length > 0 
                                                    ? 'border-rose-300 focus:ring-rose-500' 
                                                    : 'border-gray-200 focus:ring-blue-500'
                                            }`}
                                        />
                                        {!emailValid && profile.email.length > 0 && (
                                            <div className="flex items-center gap-2 text-rose-600 text-xs sm:text-sm font-medium">
                                                <IconoAlertaCirculo />
                                                <span>Formato de correo inválido</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sección: Preferencias de Aprendizaje */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-2xl border border-white/20 overflow-hidden">
                        <div className="p-4 sm:p-6 lg:p-8">
                            <div className="flex items-center gap-3 mb-4 sm:mb-6">
                                <div className="p-2 sm:p-3 bg-emerald-100 rounded-xl sm:rounded-2xl">
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
                                        className="w-full sm:max-w-xs px-3 py-2.5 sm:px-4 sm:py-3 bg-gray-50/50 border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 hover:bg-gray-50 text-sm sm:text-base"
                                    >
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
                                                <div className={`relative p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 ${
                                                    learningPreferences.intereses.includes(key)
                                                        ? 'border-emerald-500 bg-emerald-50 shadow-md'
                                                        : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30'
                                                }`}>
                                                    <div className="flex items-center gap-2 sm:gap-3">
                                                        <input
                                                            type="checkbox"
                                                            value={key}
                                                            checked={learningPreferences.intereses.includes(key)}
                                                            onChange={handleInterestsChange}
                                                            className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 border-2 border-gray-300 rounded-lg focus:ring-emerald-500 focus:ring-2"
                                                        />
                                                        <span className="font-medium text-gray-700 group-hover:text-emerald-700 transition-colors text-sm sm:text-base">
                                                            {label}
                                                        </span>
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sección: Seguridad de la Cuenta */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-2xl border border-white/20 overflow-hidden">
                        <div className="p-4 sm:p-6 lg:p-8">
                            <div className="flex items-center gap-3 mb-4 sm:mb-6">
                                <div className="p-2 sm:p-3 bg-rose-100 rounded-xl sm:rounded-2xl">
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
                                            className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-gray-50/50 border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200 hover:bg-gray-50 text-sm sm:text-base"
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
                                            className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-gray-50/50 border rounded-xl sm:rounded-2xl focus:ring-2 focus:border-transparent transition-all duration-200 hover:bg-gray-50 text-sm sm:text-base ${
                                                security.newPassword && !passwordValidation.isValid && security.newPassword.length > 0
                                                    ? 'border-rose-300 focus:ring-rose-500'
                                                    : 'border-gray-200 focus:ring-rose-500'
                                            }`}
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
                                            className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-gray-50/50 border rounded-xl sm:rounded-2xl focus:ring-2 focus:border-transparent transition-all duration-200 hover:bg-gray-50 text-sm sm:text-base ${
                                                security.confirmNewPassword && !passwordValidation.match && security.newPassword.length > 0
                                                    ? 'border-rose-300 focus:ring-rose-500'
                                                    : 'border-gray-200 focus:ring-rose-500'
                                            }`}
                                        />
                                        {security.newPassword.length > 0 && security.confirmNewPassword.length > 0 && (
                                            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
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
                                    <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                                        <div className="flex items-center gap-2 mb-3 sm:mb-4">
                                            {passwordValidation.isValid ? <IconoCheckCirculo /> : <IconoAlertaCirculo />}
                                            <h4 className={`font-semibold text-sm sm:text-base ${passwordValidation.isValid ? 'text-emerald-600' : 'text-rose-600'}`}>
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
                                                <div key={key} className="flex items-center gap-2 text-xs sm:text-sm">
                                                    {passwordValidation[key] ? <IconoCheckCirculo /> : <IconoAlertaCirculo />}
                                                    <span className={passwordValidation[key] ? 'text-emerald-600' : 'text-gray-600'}>
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
                                        disabled={!passwordValidation.isValid || !passwordValidation.match || security.newPassword === ''}
                                        className={`w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-semibold text-white shadow-lg transition-all duration-200 text-sm sm:text-base ${
                                            !passwordValidation.isValid || !passwordValidation.match || security.newPassword === ''
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 hover:shadow-xl hover:scale-105 active:scale-95'
                                        }`}
                                    >
                                        Cambiar Contraseña
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="bg-gradient-to-r from-gray-50/50 to-blue-50/30 rounded-2xl sm:rounded-3xl shadow-lg border border-white/20 overflow-hidden">
                        <div className="p-4 sm:p-6 lg:p-8">
                            <div className="flex flex-col gap-4 text-center sm:text-left">
                                <div>
                                    <p className="text-gray-600 text-xs sm:text-sm">
                                        Los cambios se guardarán de forma segura y se aplicarán inmediatamente.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSaveChanges}
                                    disabled={!emailValid}
                                    className={`w-full px-8 sm:px-12 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg text-white shadow-lg transition-all duration-200 ${
                                        !emailValid
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:scale-105 active:scale-95'
                                    }`}
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Configuracion_Alumno_comp;