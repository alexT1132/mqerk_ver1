
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAdminContext } from '../../context/AdminContext.jsx';
import { changeAdminPasswordRequest, getAdminConfigRequest, updateAdminConfigRequest } from '../../api/usuarios.js';
import LoadingOverlay from '../shared/LoadingOverlay.jsx';

// Pantalla de carga local eliminada en favor de LoadingOverlay compartido

export function Configuracion_Admin_comp() {
  const location = useLocation(); // Hook para obtener parámetros de URL
  const [isLoading, setIsLoading] = useState(true);
  // Overlay inicial para consistencia visual (2s)
  const [showInitialOverlay, setShowInitialOverlay] = useState(true);
  // Datos de configuración inicial del sistema
  const [configuration, setConfiguration] = useState({
    general: {
      nombreInstitucion: 'MQerK Academy',
      email: 'admin@mqerk.com',
      telefono: '+52 999 123 4567',
      direccion: 'Calle Principal #123, Mérida, Yucatán',
      sitioWeb: 'https://mqerk.com',
      horarioAtencion: '8:00 AM - 6:00 PM'
    },
    seguridad: {
      sesionMaxima: 480, // minutos
      intentosLogin: 3,
      cambioPasswordObligatorio: 90, // días
      autenticacionDosFactor: false,
    }
  });

  // Estado para manejo de cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Estado para datos personales del administrador
  const [personalData, setPersonalData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    foto: null,
    fotoPreview: null
  });

  // Estados de control de la interfaz
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  // Leer parámetros de URL para establecer la sección activa
  const urlParams = new URLSearchParams(location.search);
  const sectionParam = urlParams.get('section');
  const [activeSection, setActiveSection] = useState(sectionParam || 'perfil');

  // Contexto del administrador - INTEGRACIÓN AdminContext
  // USADO PARA: Gestión de perfil del admin (foto, datos personales, actualización)
  // AdminContext provee: adminProfile, updateAdminProfile, uploadAdminAvatar
  const { 
    isLoading: contextLoading,
    error,
    lastUpdated,
    adminProfile,         // ✅ USADO: Datos del perfil del admin
    updateAdminProfile,   // ✅ USADO: Función para actualizar perfil personal
    uploadAdminAvatar     // ✅ USADO: Función para subir foto de perfil
  } = useAdminContext();

  // isLoading se controla al terminar de cargar configuraciones del backend

  // Efecto para cargar datos del perfil desde AdminContext
  // INTEGRACIÓN: adminProfile viene del AdminContext y se mapea a personalData local
  useEffect(() => {
    if (adminProfile) {
      setPersonalData({
        nombre: adminProfile.name?.split(' ')[0] || '',
        apellidos: adminProfile.name?.split(' ').slice(1).join(' ') || '',
        email: adminProfile.email || '',
        telefono: adminProfile.phone || '',
        foto: null,
        fotoPreview: adminProfile.avatar || null
      });
    }
  }, [adminProfile]);

  // Efecto de limpieza para liberar URLs de objeto
  useEffect(() => {
    return () => {
      // Limpiar URLs de objeto cuando el componente se desmonte
      if (personalData.fotoPreview && personalData.fotoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(personalData.fotoPreview);
      }
    };
  }, [personalData.fotoPreview]);

  // Efecto para cargar la configuración de seguridad desde el backend
  useEffect(() => {
    const loadConfigurations = async () => {
      try {
        const { data } = await getAdminConfigRequest();
        if (data?.config) {
          setConfiguration(prev => ({
            ...prev,
            seguridad: {
              sesionMaxima: data.config.sesionMaxima ?? prev.seguridad.sesionMaxima,
              intentosLogin: data.config.intentosLogin ?? prev.seguridad.intentosLogin,
              cambioPasswordObligatorio: data.config.cambioPasswordObligatorio ?? prev.seguridad.cambioPasswordObligatorio,
              autenticacionDosFactor: !!data.config.autenticacionDosFactor,
            },
            general: {
              nombreInstitucion: data.config.nombreInstitucion ?? prev.general.nombreInstitucion,
              email: data.config.emailAdministrativo ?? prev.general.email,
              telefono: data.config.telefonoContacto ?? prev.general.telefono,
              direccion: data.config.direccion ?? prev.general.direccion,
              sitioWeb: data.config.sitioWeb ?? prev.general.sitioWeb,
              horarioAtencion: data.config.horarioAtencion ?? prev.general.horarioAtencion,
            }
          }));
        }
      } catch (error) {
        console.error('Error al cargar configuraciones:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfigurations();
  }, []);

  // Efecto: overlay inicial 2s
  useEffect(() => {
    const t = setTimeout(() => setShowInitialOverlay(false), 2000);
    return () => clearTimeout(t);
  }, []);

  // Efecto para actualizar la sección activa cuando cambien los parámetros de URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const sectionParam = urlParams.get('section');
    if (sectionParam && (sectionParam === 'perfil' || sectionParam === 'general' || sectionParam === 'seguridad')) {
      setActiveSection(sectionParam);
    }
  }, [location.search]);

  // Función para guardar configuración de seguridad del sistema
  // PATRÓN: API DIRECTA (no AdminContext) - configuraciones específicas del sistema
  const handleGuardarConfiguracion = async () => {
    setSaving(true);
    setMessage(''); // Limpiar mensaje anterior
    
    try {
      const payload = {
        sesionMaxima: Number(configuration.seguridad.sesionMaxima) || 0,
        intentosLogin: Number(configuration.seguridad.intentosLogin) || 0,
        cambioPasswordObligatorio: Number(configuration.seguridad.cambioPasswordObligatorio) || 0,
        autenticacionDosFactor: !!configuration.seguridad.autenticacionDosFactor,
        // Generales
        nombreInstitucion: configuration.general.nombreInstitucion?.toString() || '',
        emailAdministrativo: configuration.general.email?.toString() || '',
        telefonoContacto: configuration.general.telefono?.toString() || '',
        direccion: configuration.general.direccion?.toString() || '',
        sitioWeb: configuration.general.sitioWeb?.toString() || '',
        horarioAtencion: configuration.general.horarioAtencion?.toString() || '',
      };
      await updateAdminConfigRequest(payload);
      setMessage('Configuración guardada exitosamente');
      setTimeout(() => setMessage(''), 4000);
    } catch (error) {
      console.error('Error saving configuration:', error);
      setMessage('Error al guardar la configuración');
      setTimeout(() => setMessage(''), 4000);
    } finally {
      setSaving(false);
    }
  };

  // Función para actualizar contraseña del administrador
  // PATRÓN: API DIRECTA (no AdminContext) - funcionalidad específica de cambio de contraseña
  const handleUpdatePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('Las contraseñas no coinciden');
      setTimeout(() => setMessage(''), 4000);
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setMessage('La nueva contraseña debe tener al menos 6 caracteres');
      setTimeout(() => setMessage(''), 4000);
      return;
    }
    
    setSaving(true);
    setMessage(''); // Limpiar mensaje anterior
    
    try {
      await changeAdminPasswordRequest({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setMessage('Contraseña actualizada exitosamente');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setMessage(''), 4000);
    } catch (error) {
      console.error('Error changing password:', error);
      const errMsg = error?.response?.data?.message || 'Error al cambiar la contraseña';
      setMessage(errMsg);
      setTimeout(() => setMessage(''), 4000);
    } finally {
      setSaving(false);
    }
  };

  // Función para actualizar datos personales del administrador
  // INTEGRACIÓN AdminContext: Usa updateAdminProfile() y uploadAdminAvatar() del contexto
  const handleUpdatePersonalData = async () => {
    if (!personalData.nombre || !personalData.apellidos || !personalData.email) {
      setMessage('Nombre, apellidos y correo son obligatorios');
      setTimeout(() => setMessage(''), 4000);
      return;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(personalData.email)) {
      setMessage('Por favor ingresa un correo electrónico válido');
      setTimeout(() => setMessage(''), 4000);
      return;
    }
    
    setSaving(true);
    setMessage(''); // Limpiar mensaje anterior
    
    try {
      // Preparar datos para actualización
      const profileData = {
        name: `${personalData.nombre} ${personalData.apellidos}`.trim(),
        email: personalData.email,
        phone: personalData.telefono
      };

      // Si hay una nueva foto, subirla primero usando AdminContext
      let avatarUrl = personalData.fotoPreview;
      if (personalData.foto) {
        const uploadResult = await uploadAdminAvatar(personalData.foto); // ✅ AdminContext function
        if (uploadResult.success) {
          avatarUrl = uploadResult.avatarUrl;
        } else {
          throw new Error('Error al subir la imagen');
        }
      }

      // Actualizar perfil con los nuevos datos usando AdminContext
      const result = await updateAdminProfile({ // ✅ AdminContext function
        ...profileData,
        avatar: avatarUrl
      });

      if (result.success) {
        setMessage('Perfil actualizado exitosamente');
        // Limpiar la foto temporal ya que se guardó
        setPersonalData(prev => ({
          ...prev,
          foto: null,
          fotoPreview: avatarUrl
        }));
      } else {
        throw new Error('Error al actualizar el perfil');
      }
      
      setTimeout(() => setMessage(''), 4000);
    } catch (error) {
      console.error('Error updating personal data:', error);
      setMessage('Error al actualizar el perfil');
      setTimeout(() => setMessage(''), 4000);
    } finally {
      setSaving(false);
    }
  };

  // Función para manejar cambios en configuración general
  const handleInputChange = (seccion, campo, valor) => {
    setConfiguration(prev => ({
      ...prev,
      [seccion]: {
        ...prev[seccion],
        [campo]: valor
      }
    }));
  };

  // Función para manejar cambios en datos de contraseña
  const handlePasswordChange = (campo, valor) => {
    setPasswordData(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  // Función para manejar cambios en datos personales
  const handlePersonalDataChange = (campo, valor) => {
    setPersonalData(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  // Función para manejar cambio de imagen de perfil
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setMessage('Por favor selecciona un archivo de imagen válido');
        setTimeout(() => setMessage(''), 4000);
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage('La imagen debe ser menor a 5MB');
        setTimeout(() => setMessage(''), 4000);
        return;
      }

      // Crear preview temporal
      const previewUrl = URL.createObjectURL(file);
      
      setPersonalData(prev => ({
        ...prev,
        foto: file,
        fotoPreview: previewUrl
      }));
    }
  };

  // Configuración de secciones del menú lateral
  const secciones = [
    { 
      id: 'perfil', 
      nombre: 'Mi Perfil', 
      icono: '👤',
      descripcion: 'Configuración de tu perfil personal'
    },
    { 
      id: 'general', 
      nombre: 'General', 
      icono: '⚙️',
      descripcion: 'Configuración básica del sistema'
    },
    { 
      id: 'seguridad', 
      nombre: 'Seguridad', 
      icono: '🔒',
      descripcion: 'Configuración de seguridad y acceso'
    }
  ];

  return (
    <div className="min-h-screen bg-white p-2 sm:p-4 lg:p-6">
      {(showInitialOverlay || isLoading || contextLoading) && (
        <LoadingOverlay message="Cargando configuración..." subMessage="Por favor espera..." />
      )}
      <div className="max-w-7xl mx-auto">
        {/* Header Principal */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-blue-200/30 border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6 relative">
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 transform transition-all duration-300 hover:scale-105">
                <span className="text-xl sm:text-2xl">⚙️</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                  Configuración del Sistema
                </h1>
                <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 opacity-80">
                  Administra las configuraciones generales y de seguridad de la plataforma
                </p>
              </div>
            </div>
            <div className="mt-3 sm:mt-0">
              <button 
                onClick={handleGuardarConfiguracion}
                disabled={saving}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 hover:-translate-y-0.5 backdrop-blur-sm"
              >
                {saving ? (
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
          </div>
        </div>

        {/* Mensaje de éxito/error */}
        {message && (
          <div className={`bg-white ${
            message.includes('exitosamente') 
              ? 'border-green-200 text-green-700' 
              : 'border-red-200 text-red-700'
          } border rounded-2xl p-4 sm:p-5 mb-4 sm:mb-6 shadow-lg relative transform transition-all duration-300 hover:scale-[1.01]`}>
            <div className="relative z-10 flex items-center">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 ${
                message.includes('exitosamente') 
                  ? 'bg-gradient-to-br from-green-400 to-emerald-500 shadow-green-400/30' 
                  : 'bg-gradient-to-br from-red-400 to-pink-500 shadow-red-400/30'
              } shadow-lg`}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {message.includes('exitosamente') ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  )}
                </svg>
              </div>
              <span className="font-semibold text-base sm:text-lg">{message}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Sidebar de navegación */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-200 p-6 sm:p-8 relative">
              
              <div className="relative z-10">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-6 flex items-center">
                  <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mr-3"></span>
                  Configuraciones
                </h3>
                <nav className="space-y-3">
                  {secciones.map((seccion) => (
                    <button
                      key={seccion.id}
                      onClick={() => setActiveSection(seccion.id)}
                      className={`w-full text-left p-4 rounded-xl transition-all duration-300 flex items-center space-x-4 group relative overflow-hidden ${
                        activeSection === seccion.id 
                          ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-xl shadow-blue-500/40 transform scale-105' 
                          : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-lg hover:scale-[1.02] hover:shadow-blue-200/30'
                      }`}
                    >
                      {/* Efecto de brillo para botón activo */}
                      {activeSection === seccion.id && (
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-xl"></div>
                      )}
                      
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center relative z-10 ${
                        activeSection === seccion.id 
                          ? 'bg-white/20 shadow-lg' 
                          : 'bg-gradient-to-br from-blue-100 to-indigo-100 group-hover:from-blue-200 group-hover:to-indigo-200'
                      } transition-all duration-300`}>
                        <span className="text-lg">{seccion.icono}</span>
                      </div>
                      <div className="relative z-10 flex-1">
                        <span className="font-semibold text-base block">{seccion.nombre}</span>
                        <span className={`text-xs opacity-75 ${
                          activeSection === seccion.id ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {seccion.descripcion}
                        </span>
                      </div>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-200 p-6 sm:p-8 relative">
              
              <div className="relative z-10">
                {/* Mi Perfil */}
                {activeSection === 'perfil' && (
                  <div>
                    <div className="flex items-center mb-8">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 mr-4">
                        <span className="text-xl text-white">👤</span>
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                          Mi Perfil
                        </h3>
                        <p className="text-sm text-gray-600 opacity-80">
                          Gestiona tu información personal y foto de perfil
                        </p>
                      </div>
                    </div>
                    
                    {/* Foto de perfil */}
                    <div className="mb-8">
                      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-lg relative">
                        
                        <div className="relative z-10">
                          <div className="flex items-center mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 mr-4">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-gray-800">Foto de Perfil</h4>
                              <p className="text-sm text-gray-600 opacity-80">Actualiza tu imagen de perfil</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                            <div className="flex-shrink-0">
                              <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shadow-lg">
                                {personalData.fotoPreview ? (
                                  <img 
                                    src={personalData.fotoPreview} 
                                    alt="Preview" 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                )}
                              </div>
                            </div>
                            <div className="flex-1">
                              <label className="block">
                                <span className="sr-only">Seleccionar foto</span>
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  onChange={handleImageChange}
                                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 file:cursor-pointer cursor-pointer"
                                />
                              </label>
                              <p className="mt-2 text-xs text-gray-500">PNG, JPG, GIF hasta 5MB</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Información personal */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Nombre *
                        </label>
                        <input
                          type="text"
                          value={personalData.nombre}
                          onChange={(e) => handlePersonalDataChange('nombre', e.target.value)}
                          className="block w-full px-4 py-4 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:shadow-md hover:border-indigo-300"
                          placeholder="Tu nombre"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Apellidos *
                        </label>
                        <input
                          type="text"
                          value={personalData.apellidos}
                          onChange={(e) => handlePersonalDataChange('apellidos', e.target.value)}
                          className="block w-full px-4 py-4 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:shadow-md hover:border-indigo-300"
                          placeholder="Tus apellidos"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Correo Electrónico *
                        </label>
                        <input
                          type="email"
                          value={personalData.email}
                          onChange={(e) => handlePersonalDataChange('email', e.target.value)}
                          className="block w-full px-4 py-4 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:shadow-md hover:border-indigo-300"
                          placeholder="tu@correo.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          value={personalData.telefono}
                          onChange={(e) => handlePersonalDataChange('telefono', e.target.value)}
                          className="block w-full px-4 py-4 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:shadow-md hover:border-indigo-300"
                          placeholder="+52 999 123 4567"
                        />
                      </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                      <button 
                        onClick={handleUpdatePersonalData}
                        disabled={saving}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-purple-600/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 hover:-translate-y-0.5"
                      >
                        {saving ? (
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
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Actualizar Perfil
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Configuración General */}
                {activeSection === 'general' && (
                  <div>
                    <div className="flex items-center mb-8">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 mr-4">
                        <span className="text-xl text-white">⚙️</span>
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                          Configuración General
                        </h3>
                        <p className="text-sm text-gray-600 opacity-80">
                          Configuración básica de la institución y contacto
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Nombre de la Institución
                        </label>
                        <input
                          type="text"
                          value={configuration.general.nombreInstitucion}
                          onChange={(e) => handleInputChange('general', 'nombreInstitucion', e.target.value)}
                          className="block w-full px-4 py-4 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:shadow-md hover:border-blue-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Email Administrativo
                        </label>
                        <input
                          type="email"
                          value={configuration.general.email}
                          onChange={(e) => handleInputChange('general', 'email', e.target.value)}
                          className="block w-full px-4 py-4 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:shadow-md hover:border-blue-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          value={configuration.general.telefono}
                          onChange={(e) => handleInputChange('general', 'telefono', e.target.value)}
                          className="block w-full px-4 py-4 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:shadow-md hover:border-blue-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Sitio Web
                        </label>
                        <input
                          type="url"
                          value={configuration.general.sitioWeb}
                          onChange={(e) => handleInputChange('general', 'sitioWeb', e.target.value)}
                          className="block w-full px-4 py-4 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:shadow-md hover:border-blue-300"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Dirección
                        </label>
                        <textarea
                          value={configuration.general.direccion}
                          onChange={(e) => handleInputChange('general', 'direccion', e.target.value)}
                          rows={4}
                          className="block w-full px-4 py-4 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:shadow-md hover:border-blue-300 resize-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Horario de Atención
                        </label>
                        <input
                          type="text"
                          value={configuration.general.horarioAtencion}
                          onChange={(e) => handleInputChange('general', 'horarioAtencion', e.target.value)}
                          className="block w-full px-4 py-4 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:shadow-md hover:border-blue-300"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Configuración de Seguridad */}
                {activeSection === 'seguridad' && (
                  <div>
                    <div className="flex items-center mb-8">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30 mr-4">
                        <span className="text-xl text-white">🔒</span>
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                          Configuración de Seguridad
                        </h3>
                        <p className="text-sm text-gray-600 opacity-80">
                          Configuración de seguridad y políticas de acceso
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-10">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Duración Máxima de Sesión (minutos)
                        </label>
                        <input
                          type="number"
                          value={configuration.seguridad.sesionMaxima}
                          onChange={(e) => handleInputChange('seguridad', 'sesionMaxima', parseInt(e.target.value))}
                          className="block w-full px-4 py-4 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:shadow-md hover:border-blue-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Máximo Intentos de Login
                        </label>
                        <input
                          type="number"
                          value={configuration.seguridad.intentosLogin}
                          onChange={(e) => handleInputChange('seguridad', 'intentosLogin', parseInt(e.target.value))}
                          className="block w-full px-4 py-4 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:shadow-md hover:border-blue-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Cambio de Password Obligatorio (días)
                        </label>
                        <input
                          type="number"
                          value={configuration.seguridad.cambioPasswordObligatorio}
                          onChange={(e) => handleInputChange('seguridad', 'cambioPasswordObligatorio', parseInt(e.target.value))}
                          className="block w-full px-4 py-4 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:shadow-md hover:border-blue-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Autenticación de Dos Factores (2FA)
                        </label>
                        <div className="flex items-center h-12">
                          <button
                            type="button"
                            onClick={() => handleInputChange('seguridad', 'autenticacionDosFactor', !configuration.seguridad.autenticacionDosFactor)}
                            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 ${configuration.seguridad.autenticacionDosFactor ? 'bg-green-500' : 'bg-gray-300'}`}
                          >
                            <span
                              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 ${configuration.seguridad.autenticacionDosFactor ? 'translate-x-7' : 'translate-x-1'}`}
                            />
                          </button>
                          <span className="ml-3 text-sm text-gray-700">
                            {configuration.seguridad.autenticacionDosFactor ? 'Activado' : 'Desactivado'}
                          </span>
                        </div>
                        {/* 2FA toggle is persisted via /admin/config; enforcement can be added later */}
                      </div>
                    </div>

                    {/* Sección para cambiar contraseña */}
                    <div className="mb-10">
                      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-lg relative">
                        
                        <div className="relative z-10">
                          <div className="flex items-center mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30 mr-4">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-gray-800">Cambiar Contraseña</h4>
                              <p className="text-sm text-gray-600 opacity-80">Actualiza tu contraseña de acceso</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="block text-sm font-semibold text-gray-700 mb-3">Contraseña Actual</label>
                              <input 
                                type="password" 
                                value={passwordData.currentPassword}
                                onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                                className="block w-full px-4 py-4 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:shadow-md hover:border-orange-300" 
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="block text-sm font-semibold text-gray-700 mb-3">Nueva Contraseña</label>
                              <input 
                                type="password" 
                                value={passwordData.newPassword}
                                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                                className="block w-full px-4 py-4 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:shadow-md hover:border-orange-300" 
                              />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                              <label className="block text-sm font-semibold text-gray-700 mb-3">Confirmar Nueva Contraseña</label>
                              <input 
                                type="password" 
                                value={passwordData.confirmPassword}
                                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                                className="block w-full px-4 py-4 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:shadow-md hover:border-orange-300" 
                              />
                            </div>
                            <div className="md:col-span-2 flex justify-end">
                              <button 
                                onClick={handleUpdatePassword}
                                disabled={saving}
                                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-red-600/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 hover:-translate-y-0.5"
                              >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                                Actualizar Contraseña
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}