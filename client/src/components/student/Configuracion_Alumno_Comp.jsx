import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useStudent } from '../../context/StudentContext.jsx';
import { buildStaticUrl, getApiOrigin } from '../../utils/url';
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
    const { user, alumno, logout, setAlumno } = useAuth();
    const { headerPrefs, updateHeaderPrefs } = useStudent();
    // Estados del componente
    // Helper para armar URL absoluta de fotos
    const apiOrigin = getApiOrigin();

    // Catálogo de áreas predefinidas (claves conocidas)
    const interestLabels = {
        programacion: 'Programación',
        tecnologico: 'Technology & AI',
        psicoeducativo: 'Psicoeducativo',
        idiomas: 'Idiomas',
        exactas: 'Ciencias Exactas',
        admision: 'Preparación Admisión'
    };

    // Helper: ensure date fits input[type="date"] format (YYYY-MM-DD)
    const formatDateForInput = (val) => {
        if (!val) return '';
        if (val instanceof Date && !isNaN(val)) return val.toISOString().slice(0, 10);
        if (typeof val === 'string') {
            // Accept ISO strings like 2000-11-01T06:00:00.000Z or already formatted dates
            if (val.includes('T')) return val.slice(0, 10);
            // Basic yyyy-mm-dd safeguard
            return val.length >= 10 ? val.slice(0, 10) : val;
        }
        return '';
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
        intereses: ['programacion', 'tecnologico'], // claves predefinidas seleccionadas
    });
    // Sugerencias libres con nivel deseado de inicio (se serializan dentro de intereses como objetos)
    const [suggestions, setSuggestions] = useState([]); // [{ titulo: string, nivel: 'principiante'|'intermedio'|'avanzado' }]
    const [newSuggestionTitle, setNewSuggestionTitle] = useState('');
    const [newSuggestionLevel, setNewSuggestionLevel] = useState('intermedio');

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
    const [photoError, setPhotoError] = useState(false);
    // Tabs
    const [activeTab, setActiveTab] = useState('perfil'); // 'perfil' | 'preferencias' | 'apariencia' | 'seguridad' | 'peligro'

    // Viewport guard: hide Apariencia on mobile (md breakpoint = 768px)
    const [isMdUp, setIsMdUp] = useState(() => {
        if (typeof window === 'undefined') return true;
        return window.matchMedia('(min-width: 768px)').matches;
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const mq = window.matchMedia('(min-width: 768px)');
        const handler = (e) => setIsMdUp(e.matches);
        try { mq.addEventListener('change', handler); } catch { mq.addListener(handler); }
        return () => { try { mq.removeEventListener('change', handler); } catch { mq.removeListener(handler); } };
    }, []);

    // If on mobile and currently in 'apariencia', redirect to 'perfil'
    useEffect(() => {
        if (!isMdUp && activeTab === 'apariencia') {
            setActiveTab('perfil');
        }
    }, [isMdUp, activeTab]);

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
                    fechaNacimiento: formatDateForInput(alumno?.fecha_nacimiento) || prev.fechaNacimiento,
                    fotoUrl: buildStaticUrl(alumno?.foto) || prev.fotoUrl,
                }));
                setPhotoError(false);

                // Cargar preferencias
                const res = await getConfigRequest(alumno.id);
                const cfg = res.data;
                const rawInterests = Array.isArray(cfg.intereses) ? cfg.intereses : (cfg.intereses ? JSON.parse(cfg.intereses) : []);
                // Separar claves conocidas y sugerencias libres
                const knownKeys = Object.keys(interestLabels);
                const selectedKeys = [];
                const parsedSuggestions = [];
                for (const item of rawInterests || []) {
                    if (typeof item === 'string') {
                        if (knownKeys.includes(item)) selectedKeys.push(item);
                        else parsedSuggestions.push({ titulo: String(item), nivel: cfg.nivel_experiencia || 'intermedio' });
                    } else if (item && typeof item === 'object') {
                        // Forma enriquecida: { type:'sugerencia', titulo, nivel }
                        if (item.type === 'sugerencia' && item.titulo) {
                            parsedSuggestions.push({ titulo: String(item.titulo), nivel: item.nivel || 'intermedio' });
                        } else if (item.key && knownKeys.includes(item.key)) {
                            selectedKeys.push(item.key);
                        }
                    }
                }
                setLearningPreferences({
                    nivelExperiencia: cfg.nivel_experiencia || 'intermedio',
                    intereses: selectedKeys.length ? selectedKeys : [],
                });
                setSuggestions(parsedSuggestions);
                setNewSuggestionLevel(cfg.nivel_experiencia || 'intermedio');
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
        const nextValue = name === 'fechaNacimiento' ? formatDateForInput(value) : value;
        setProfile(prev => ({ ...prev, [name]: nextValue }));

        if (name === 'email') {
            setEmailValid(isValidEmail(value));
        }
    };

    const handleLearningPreferenceChange = (e) => {
        const { name, value } = e.target;
        setLearningPreferences(prev => ({ ...prev, [name]: value }));
        if (name === 'nivelExperiencia') {
            // Por defecto, usar este nivel como sugerencia inicial también
            setNewSuggestionLevel(value || 'intermedio');
        }
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

    // Manejo de sugerencias libres
    const addSuggestion = () => {
        const title = (newSuggestionTitle || '').trim();
        if (!title) return;
        // Evitar duplicados (case-insensitive) tanto en sugerencias como en claves conocidas
        const existsInSuggestions = suggestions.some(s => s.titulo.toLowerCase() === title.toLowerCase());
        const existsAsKnown = Object.keys(interestLabels).some(k => k.toLowerCase() === title.toLowerCase());
        if (existsInSuggestions || existsAsKnown) {
            alert('Esa sugerencia ya existe o coincide con un área de interés.');
            return;
        }
        if (suggestions.length >= 8) {
            alert('Puedes agregar hasta 8 sugerencias.');
            return;
        }
        setSuggestions(prev => [...prev, { titulo: title, nivel: newSuggestionLevel || 'intermedio' }]);
        setNewSuggestionTitle('');
    };

    const removeSuggestion = (idx) => {
        setSuggestions(prev => prev.filter((_, i) => i !== idx));
    };

    const updateSuggestionLevel = (idx, nivel) => {
        setSuggestions(prev => prev.map((s, i) => (i === idx ? { ...s, nivel } : s)));
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

    // Helper: dividir nombre completo en nombre y apellidos
    const splitFullName = (full) => {
        const raw = String(full || '').trim().replace(/\s+/g, ' ');
        if (!raw) return { nombre: '', apellidos: '' };
        const parts = raw.split(' ');
        if (parts.length === 1) return { nombre: parts[0], apellidos: '' };
        return { nombre: parts[0], apellidos: parts.slice(1).join(' ') };
    };

    const executeSaveChanges = async () => {
        setSaveProcessing(true);
        setIsLoading(true);
        try {
            if (!alumno?.id) throw new Error('ID de alumno no disponible');
            // 1) Guardar preferencias
            // Empaquetar intereses con sugerencias libres en un solo JSON
            const mergedInterests = [
                ...learningPreferences.intereses,
                ...suggestions.map(s => ({ type: 'sugerencia', titulo: s.titulo, nivel: s.nivel }))
            ];
            const prefPayload = {
                nivel_experiencia: learningPreferences.nivelExperiencia,
                intereses: mergedInterests,
            };
            // 2) Actualizar datos del estudiante, incluyendo nombre completo separado
            const { nombre: nombreBase, apellidos: apellidosBase } = splitFullName(profile.nombre);
            const estPayload = {
                nombre: nombreBase || undefined,
                apellidos: apellidosBase || undefined,
                email: profile.email || undefined,
                telefono: profile.telefono || undefined,
                fecha_nacimiento: profile.fechaNacimiento || undefined,
            };
            // Limpiar undefined
            Object.keys(estPayload).forEach((k) => estPayload[k] === undefined && delete estPayload[k]);

            const [cfgRes, estRes] = await Promise.all([
                upsertConfigRequest(alumno.id, prefPayload),
                Object.keys(estPayload).length ? updateEstudianteRequest(alumno.id, estPayload) : Promise.resolve({ data: null }),
            ]);

            // Reflejar cambios en el contexto Auth si backend devolvió el registro actualizado
            if (estRes && estRes.data && estRes.data.data) {
                const updated = estRes.data.data;
                setAlumno(prev => ({ ...(prev || {}), ...updated }));
                setProfile(prev => ({
                    ...prev,
                    nombre: `${updated.nombre || nombreBase || ''} ${updated.apellidos || apellidosBase || ''}`.trim(),
                    email: updated.email ?? prev.email,
                    telefono: updated.telefono ?? prev.telefono,
                    fechaNacimiento: formatDateForInput(updated.fecha_nacimiento) || prev.fechaNacimiento,
                }));
            }
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
                    // Actualizar AuthContext para que header y otras vistas reflejen la nueva foto
                    if (typeof setAlumno === 'function') {
                        setAlumno(prev => ({ ...(prev || {}), foto: nuevaRel }));
                    }
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

    // Secciones estilo admin para navegación lateral
    const secciones = [
        { id: 'perfil', nombre: 'Mi Perfil', icono: '👤', descripcion: 'Tu información personal' },
        { id: 'preferencias', nombre: 'Preferencias', icono: '📚', descripcion: 'Aprendizaje' },
        { id: 'apariencia', nombre: 'Apariencia', icono: '🎛️', descripcion: 'Barra superior' },
        { id: 'seguridad', nombre: 'Seguridad', icono: '🔒', descripcion: 'Protege tu cuenta' },
        { id: 'peligro', nombre: 'Zona de Peligro', icono: '⚠️', descripcion: 'Acciones irreversibles' },
    ];

    // Render del componente
    return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-3 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
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
                {/* Header estilo admin */}
                <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-100 rounded-xl sm:rounded-3xl shadow-xl shadow-blue-200/30 border border-blue-200/50 p-4 sm:p-8 mb-4 sm:mb-8 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent rounded-2xl sm:rounded-3xl"></div>
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <span className="text-lg sm:text-2xl">👤</span>
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                                    Configuración de Cuenta
                                </h1>
                                <p className="mt-0.5 sm:mt-2 text-xs sm:text-base text-gray-600 opacity-80">
                                    Personaliza tu perfil, preferencias y seguridad
                                </p>
                            </div>
                        </div>
                        {activeTab !== 'peligro' && (
                            <div className="mt-4 sm:mt-0">
                                <button
                                    onClick={handleOpenSaveConfirm}
                                    disabled={!emailValid || isLoading}
                                    className="inline-flex items-center px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Guardar Cambios
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                    {errors.general && (
                        <div className="relative z-10 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm">
                            {errors.general}
                        </div>
                    )}
                </div>
                {/* Layout con Sidebar estilo admin */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8">
                    {/* Sidebar de navegación */}
                    <div className="lg:col-span-1">
                        <div className="bg-gradient-to-br from-white via-gray-50 to-blue-50 rounded-xl sm:rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-200/50 p-4 sm:p-8 backdrop-blur-sm relative overflow-visible">
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent rounded-2xl sm:rounded-3xl"></div>
                            <div className="relative z-10">
                                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-6 flex items-center">
                                    <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mr-3"></span>
                                    Secciones
                                </h3>
                                <nav className="space-y-3">
                                    {secciones.map((s) => (
                                        <button
                                            key={s.id}
                                            onClick={() => setActiveTab(s.id)}
                                            className={`w-full text-left p-4 rounded-xl transition-all duration-300 flex items-center space-x-4 group relative overflow-hidden ${
                                                activeTab === s.id
                                                    ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-xl shadow-blue-500/40 transform scale-105'
                                                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-lg hover:scale-[1.02] hover:shadow-blue-200/30'
                                            } ${s.id === 'apariencia' ? 'hidden md:flex' : ''}`}
                                        >
                                            {activeTab === s.id && (
                                                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-xl"></div>
                                            )}
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center relative z-10 ${
                                                activeTab === s.id
                                                    ? 'bg-white/20 shadow-lg'
                                                    : 'bg-gradient-to-br from-blue-100 to-indigo-100 group-hover:from-blue-200 group-hover:to-indigo-200'
                                            } transition-all duration-300`}>
                                                <span className="text-lg">{s.icono}</span>
                                            </div>
                                            <div className="relative z-10 flex-1">
                                                <span className="font-semibold text-base block">{s.nombre}</span>
                                                <span className={`${activeTab === s.id ? 'text-blue-100' : 'text-gray-500'} text-xs opacity-75`}>{s.descripcion}</span>
                                            </div>
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </div>

                    {/* Contenido principal */}
                    <div className="lg:col-span-3">
                        <div className="bg-gradient-to-br from-white via-gray-50 to-blue-50 rounded-xl sm:rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-200/50 p-4 sm:p-8 backdrop-blur-sm relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent rounded-2xl sm:rounded-3xl"></div>
                            <div className="relative z-10 space-y-8">
                                {/* Contenido por pestaña */}
                    {activeTab === 'perfil' && (
                        <>
                        {/* Información Personal */}
                        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 overflow-visible hover:shadow-md transition-all duration-200">
                            <div className="p-4 sm:p-5">
                                <div className="flex items-center gap-3 mb-5 sm:mb-6">
                                    <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-md sm:rounded-lg">
                                        <IconoUsuario />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Información Personal</h2>
                                        <p className="text-gray-600 text-sm">Tu perfil público</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-6">
                                    {/* Foto de Perfil */}
                                    <div className="flex justify-center">
                                        <div className="relative group">
                                            <div className="w-28 h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40 rounded-full overflow-hidden shadow-lg ring-2 sm:ring-4 ring-blue-100 ring-offset-2 ring-offset-white transition-all duration-300 group-hover:ring-blue-200 group-hover:shadow-xl bg-gradient-to-br from-gray-100 to-gray-200">
                                                {profile.fotoUrl && !photoError ? (
                                                    <img
                                                        src={profile.fotoUrl}
                                                        alt="Foto de Perfil"
                                                        className="w-full h-full object-cover object-center"
                                                        onError={() => setPhotoError(true)}
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
                                                className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-2.5 rounded-lg shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                                title="Cambiar foto de perfil"
                                            >
                                                {isLoading ? <IconoCargando /> : <IconoCamara />}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Campos del formulario */}
                                    <div className="space-y-3.5 sm:space-y-4">
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
                                                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150 hover:bg-gray-50 text-sm"
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
                                                className={`w-full px-3 py-2.5 bg-white border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-150 hover:bg-gray-50 text-sm ${
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
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
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
                                                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150 hover:bg-gray-50 text-sm"
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
                                                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150 hover:bg-gray-50 text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        </>
                    )}

                    {activeTab === 'preferencias' && (
                        <>
                        {/* Preferencias de Aprendizaje */}
                        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 overflow-visible hover:shadow-md transition-all duration-200">
                            <div className="p-4 sm:p-5">
                                <div className="flex items-center gap-3 mb-5 sm:mb-6">
                                    <div className="p-2 bg-gradient-to-br from-emerald-100 to-green-100 rounded-md sm:rounded-lg">
                                        <IconoLibroAbierto />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Preferencias de Aprendizaje</h2>
                                        <p className="text-gray-600 text-sm">Personaliza tu experiencia</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-6">
                                    {/* Nivel de Experiencia - Segmented Control */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Nivel de Experiencia
                                        </label>
                                        <div role="radiogroup" aria-label="Nivel de experiencia" className="inline-flex rounded-lg border border-emerald-200 bg-white overflow-hidden">
                                            {[
                                                { key: 'principiante', label: '🌱 Principiante' },
                                                { key: 'intermedio', label: '📈 Intermedio' },
                                                { key: 'avanzado', label: '🚀 Avanzado' },
                                            ].map((opt, i, arr) => {
                                                const active = learningPreferences.nivelExperiencia === opt.key;
                                                const isFirst = i === 0; const isLast = i === arr.length - 1;
                                                return (
                                                    <button
                                                        key={opt.key}
                                                        type="button"
                                                        role="radio"
                                                        aria-checked={active}
                                                        disabled={isLoading}
                                                        onClick={() => {
                                                            setLearningPreferences(prev => ({ ...prev, nivelExperiencia: opt.key }));
                                                            setNewSuggestionLevel(opt.key);
                                                        }}
                                                        className={`px-3.5 py-2 text-xs sm:text-sm font-medium transition-colors border-emerald-200 ${
                                                            active
                                                            ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-400'
                                                            : 'bg-transparent text-emerald-700/80 hover:text-emerald-900 hover:bg-emerald-50'
                                                        } ${isFirst ? 'rounded-l-lg' : ''} ${isLast ? 'rounded-r-lg' : 'border-l'}`}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Áreas de Interés - Toggle grid */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-sm font-semibold text-gray-700">Áreas de Interés</h3>
                                            <span className="text-xs text-gray-500">{learningPreferences.intereses.length} seleccionadas</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                            {Object.entries(interestLabels).map(([key, label]) => {
                                                const selected = learningPreferences.intereses.includes(key);
                                                return (
                                                    <button
                                                        key={key}
                                                        type="button"
                                                        disabled={isLoading}
                                                        onClick={() => {
                                                            setLearningPreferences(prev => ({
                                                                ...prev,
                                                                intereses: selected
                                                                    ? prev.intereses.filter(i => i !== key)
                                                                    : [...prev.intereses, key]
                                                            }));
                                                        }}
                                                        className={`w-full text-left px-3 py-2 rounded-lg border transition ${selected ? 'border-emerald-400 bg-emerald-50 text-emerald-800 shadow-sm' : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/40 text-gray-700'}`}
                                                        aria-pressed={selected}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span className={`inline-flex h-4 w-4 items-center justify-center rounded ${selected ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-transparent'}`}>✓</span>
                                                            <span className="text-sm font-medium">{label}</span>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Sugerencias de nuevos cursos o materias */}
                                    <div>
                                        <div className="flex items-end justify-between gap-2 mb-2">
                                            <h3 className="text-sm font-semibold text-gray-700">Sugerir nuevos cursos o materias</h3>
                                            {suggestions.length > 0 && (
                                                <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">{suggestions.length} sugerencia(s)</span>
                                            )}
                                        </div>
                                        <p className="text-gray-500 text-xs sm:text-sm mb-2.5">Cuéntanos qué temas te interesaría que impartamos y desde qué nivel te gustaría comenzar.</p>

                    {/* Input + selector: grid para mejor acomodo */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 sm:gap-2 items-stretch w-full">
                                            <input
                                                type="text"
                                                value={newSuggestionTitle}
                                                onChange={(e) => setNewSuggestionTitle(e.target.value)}
                        placeholder="Ej. Robótica o Dibujo técnico"
                                                disabled={isLoading}
                        className="sm:col-span-7 lg:col-span-8 w-full px-3 h-10 sm:h-11 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-300 transition-all duration-150 hover:bg-gray-50 placeholder:text-gray-400 text-sm appearance-none"
                                            />
                                            <select
                                                value={newSuggestionLevel}
                                                onChange={(e) => setNewSuggestionLevel(e.target.value)}
                                                disabled={isLoading}
                        className="sm:col-span-3 lg:col-span-2 w-full px-3 h-10 sm:h-11 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-300 transition-all duration-150 hover:bg-gray-50 text-sm appearance-none"
                                            >
                                                <option value="principiante">🌱 Empezar en Principiante</option>
                                                <option value="intermedio">📈 Empezar en Intermedio</option>
                                                <option value="avanzado">🚀 Empezar en Avanzado</option>
                                            </select>
                                            <button
                                                type="button"
                                                onClick={addSuggestion}
                                                disabled={isLoading || !newSuggestionTitle.trim()}
                        className="sm:col-span-2 lg:col-span-2 w-full px-5 h-10 sm:h-11 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-150 disabled:opacity-50 font-semibold shadow text-sm"
                                            >
                                                Agregar
                                            </button>
                                        </div>

                                        {/* Lista de sugerencias agregadas */}
                                        {suggestions.length > 0 && (
                                            <div className="mt-3">
                                                <ul className="divide-y divide-emerald-100 border border-emerald-200 rounded-lg bg-emerald-50/30">
                                                    {suggestions.map((sug, idx) => (
                                                        <li key={idx} className="flex items-center justify-between gap-2 px-3 py-2">
                                                            <span className="text-sm font-medium truncate" title={sug.titulo}>{sug.titulo}</span>
                                                            <div className="flex items-center gap-2">
                                                                <select
                                                                    value={sug.nivel}
                                                                    onChange={(e) => updateSuggestionLevel(idx, e.target.value)}
                                                                    className="text-xs bg-white border border-emerald-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                                >
                                                                    <option value="principiante">Principiante</option>
                                                                    <option value="intermedio">Intermedio</option>
                                                                    <option value="avanzado">Avanzado</option>
                                                                </select>
                                                                <button
                                                                    type="button"
                                                                    className="text-emerald-700 hover:text-emerald-900 px-2 py-1 rounded"
                                                                    onClick={() => removeSuggestion(idx)}
                                                                    aria-label="Eliminar sugerencia"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        </>
                    )}

                                        {activeTab === 'apariencia' && isMdUp && (
                                                <>
                                                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 overflow-visible hover:shadow-md transition-all duration-200">
                                                        <div className="p-4 sm:p-5">
                                                                <div className="flex items-center gap-3 mb-5 sm:mb-6">
                                                                        <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-md sm:rounded-lg">
                                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-2-2h-3l-2-2h-4L8 6H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2Z"/></svg>
                                                                        </div>
                                                                        <div>
                                                                                <h2 className="text-xl font-bold text-gray-900">Barra superior</h2>
                                                                                <p className="text-gray-600 text-sm">Configura los accesos rápidos del header</p>
                                                                        </div>
                                                                </div>

                                                                <div className="space-y-6">
                                                                        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3">
                                                                                <div>
                                                                                        <p className="font-medium text-gray-800 text-sm">Mostrar accesos rápidos</p>
                                                                                        <p className="text-xs text-gray-500">Si lo desactivas, se mostrará solo el nombre de la academia</p>
                                                                                </div>
                                                                                <label className="inline-flex items-center cursor-pointer">
                                                                                        <input type="checkbox" className="sr-only peer" checked={!!headerPrefs?.showQuickLinks} onChange={(e)=> updateHeaderPrefs({ showQuickLinks: e.target.checked })} />
                                                                                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600 transition-colors relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:h-5 after:w-5 after:rounded-full after:transition-all peer-checked:after:translate-x-5"></div>
                                                                                </label>
                                                                        </div>

                                                                        {headerPrefs?.showQuickLinks && (
                                                                            <div>
                                                                                <p className="text-sm font-semibold text-gray-700 mb-2">Orden de accesos</p>
                                                                                <p className="text-xs text-gray-500 mb-3">Arrastra para reordenar o usa los botones</p>
                                                                                <div className="space-y-2">
                                                                                    {(headerPrefs?.links || ['cursos','calendario','pagos']).map((key, idx, arr)=>{
                                                                                        const label = key==='cursos'?'Cursos': key==='calendario'?'Calendario':'Mis pagos';
                                                                                        return (
                                                                                            <div key={key} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2">
                                                                                                <div className="flex items-center gap-2">
                                                                                                    <span className="text-gray-400 cursor-grab">⋮⋮</span>
                                                                                                    <span className="text-sm font-medium text-gray-800">{label}</span>
                                                                                                </div>
                                                                                                <div className="flex items-center gap-2">
                                                                                                    <button type="button" disabled={idx===0} onClick={()=> updateHeaderPrefs(prev=>{ const links=[...prev.links]; [links[idx-1],links[idx]]=[links[idx],links[idx-1]]; return { ...prev, links }; })} className="px-2 py-1 text-xs border rounded disabled:opacity-40">↑</button>
                                                                                                    <button type="button" disabled={idx===arr.length-1} onClick={()=> updateHeaderPrefs(prev=>{ const links=[...prev.links]; [links[idx+1],links[idx]]=[links[idx],links[idx+1]]; return { ...prev, links }; })} className="px-2 py-1 text-xs border rounded disabled:opacity-40">↓</button>
                                                                                                </div>
                                                                                            </div>
                                                                                        );
                                                                                    })}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                </div>
                                                        </div>
                                                </div>
                                                </>
                                        )}

                    {activeTab === 'seguridad' && (
                        <>
                        {/* Seguridad de la Cuenta */}
                        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 overflow-visible hover:shadow-md transition-all duration-200">
                            <div className="p-4 sm:p-5">
                                <div className="flex items-center gap-3 mb-5 sm:mb-6">
                                    <div className="p-2 bg-gradient-to-br from-rose-100 to-red-100 rounded-md sm:rounded-lg">
                                        <IconoCandado />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Seguridad</h2>
                                        <p className="text-gray-600 text-sm">Protege tu cuenta</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
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
                                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-150 hover:bg-gray-50 text-sm"
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
                                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-150 hover:bg-gray-50 text-sm"
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
                                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-150 hover:bg-gray-50 text-sm"
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
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h4 className="font-semibold text-gray-700 mb-3 text-sm">Requisitos de Seguridad</h4>
                                            <div className="space-y-1.5">
                                                {[
                                                    { key: 'length', text: 'Al menos 8 caracteres' },
                                                    { key: 'uppercase', text: 'Una letra mayúscula' },
                                                    { key: 'lowercase', text: 'Una letra minúscula' },
                                                    { key: 'number', text: 'Un número' },
                                                    { key: 'specialChar', text: 'Un carácter especial' }
                                                ].map(({ key, text }) => (
                                                    <div key={key} className="flex items-center gap-2 text-xs sm:text-sm">
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
                                        className="w-full px-6 py-2.5 rounded-lg font-semibold text-white shadow-md transition-all duration-150 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            {isLoading ? <IconoCargando /> : <IconoEscudo />}
                                            {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                        </>
                    )}

                    {activeTab === 'peligro' && (
                        <>
                        {/* Zona de Peligro */}
                        <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-xl shadow-md border border-rose-200 overflow-hidden transition-all duration-200">
                            <div className="p-5">
                                <div className="flex items-center gap-3.5 mb-5">
                                    <div className="p-2.5 bg-rose-200 rounded-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-rose-900">Zona de Peligro</h2>
                                        <p className="text-rose-700 text-sm">Acciones irreversibles</p>
                                    </div>
                                </div>
                                
                                <div className="bg-white/60 rounded-lg p-4 border border-rose-200">
                                    <div className="flex items-start gap-3 mb-3.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                        <div>
                                            <h3 className="font-bold text-rose-900 text-base">Eliminar Acceso</h3>
                                            <p className="text-rose-700 mt-1 text-sm">
                                                Esta acción eliminará permanentemente tu acceso a la cuenta. 
                                                <span className="font-semibold"> NO se puede deshacer.</span>
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <button
                                        type="button"
                                        onClick={handleDeleteAccount}
                                        disabled={isLoading}
                                        className="w-full px-6 py-2.5 rounded-lg font-bold text-white shadow-md transition-all duration-150 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 disabled:opacity-50 text-sm"
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            {isLoading ? <IconoCargando /> : <IconoTrash />}
                                            {isLoading ? 'Procesando...' : 'Eliminar Acceso Permanentemente'}
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                        </>
                    )}
                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    );
}

export default Configuracion_Alumno_comp;