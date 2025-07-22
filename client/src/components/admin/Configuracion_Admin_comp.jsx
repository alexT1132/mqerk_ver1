// src\components\Configuracion_Admin_comp.jsx
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
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 via-white to-blue-50">
            <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-100 rounded-2xl shadow-2xl p-8 border-2 border-blue-200/50 text-center backdrop-blur-sm relative overflow-hidden">
                {/* Efecto de brillo sutil */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent rounded-2xl"></div>
                
                <div className="relative z-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-6 shadow-lg shadow-blue-500/30"></div>
                    <div className="flex items-center justify-center mb-2">
                        <span className="text-2xl mr-3">⚙️</span>
                        <p className="text-lg font-bold text-gray-800">Cargando configuración...</p>
                    </div>
                    <p className="text-sm text-gray-600 opacity-80">Preparando el panel de configuración del sistema</p>
                </div>
            </div>
        </div>
    );
}

export function Configuracion_Admin_comp() {
  // Estado para controlar la pantalla de carga
  const [isLoading, setIsLoading] = useState(true);
  const [configuracion, setConfiguracion] = useState({
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
      backupAutomatico: true,
      logActividades: true
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [personalData, setPersonalData] = useState({
    nombre: '',
    apellidos: '',
    email: ''
  });

  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [seccionActiva, setSeccionActiva] = useState('general');

  // Función para manejar la carga completa
  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  // Efecto para simular carga inicial de configuraciones
  useEffect(() => {
    // Simular carga de configuraciones del backend
    const loadConfigurations = async () => {
      try {
        // TODO: Implementar llamada al backend para obtener configuraciones
        // const response = await fetch('/api/admin/configuraciones');
        // const data = await response.json();
        // setConfiguracion(data);
        
        // Por ahora mantener la simulación de carga
        setTimeout(() => {
          setIsLoading(false);
        }, 2000);
      } catch (error) {
        console.error('Error al cargar configuraciones:', error);
        setIsLoading(false);
      }
    };

    loadConfigurations();
  }, []);

  const handleGuardarConfiguracion = async () => {
    setGuardando(true);
    setMensaje(''); // Limpiar mensaje anterior
    
    try {
      // TODO: Implementar llamada al backend
      // const response = await fetch('/api/admin/configuraciones', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(configuracion)
      // });
      // if (!response.ok) throw new Error('Error al guardar');
      
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setMensaje('Configuración guardada exitosamente');
      setTimeout(() => setMensaje(''), 4000);
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      setMensaje('Error al guardar la configuración');
      setTimeout(() => setMensaje(''), 4000);
    } finally {
      setGuardando(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMensaje('Las contraseñas no coinciden');
      setTimeout(() => setMensaje(''), 4000);
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setMensaje('La nueva contraseña debe tener al menos 6 caracteres');
      setTimeout(() => setMensaje(''), 4000);
      return;
    }
    
    setGuardando(true);
    setMensaje(''); // Limpiar mensaje anterior
    
    try {
      // TODO: Implementar llamada al backend
      // const response = await fetch('/api/admin/cambiar-password', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     currentPassword: passwordData.currentPassword,
      //     newPassword: passwordData.newPassword
      //   })
      // });
      // if (!response.ok) throw new Error('Error al cambiar contraseña');
      
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setMensaje('Contraseña actualizada exitosamente');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setMensaje(''), 4000);
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      setMensaje('Error al cambiar la contraseña');
      setTimeout(() => setMensaje(''), 4000);
    } finally {
      setGuardando(false);
    }
  };

  const handleUpdatePersonalData = async () => {
    if (!personalData.nombre || !personalData.apellidos || !personalData.email) {
      setMensaje('Todos los campos son obligatorios');
      setTimeout(() => setMensaje(''), 4000);
      return;
    }
    
    setGuardando(true);
    setMensaje(''); // Limpiar mensaje anterior
    
    try {
      // TODO: Implementar llamada al backend
      // const response = await fetch('/api/admin/datos-personales', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(personalData)
      // });
      // if (!response.ok) throw new Error('Error al actualizar datos');
      
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setMensaje('Datos personales actualizados exitosamente');
      setTimeout(() => setMensaje(''), 4000);
    } catch (error) {
      console.error('Error al actualizar datos personales:', error);
      setMensaje('Error al actualizar los datos personales');
      setTimeout(() => setMensaje(''), 4000);
    } finally {
      setGuardando(false);
    }
  };

  const handleInputChange = (seccion, campo, valor) => {
    setConfiguracion(prev => ({
      ...prev,
      [seccion]: {
        ...prev[seccion],
        [campo]: valor
      }
    }));
  };

  const handlePasswordChange = (campo, valor) => {
    setPasswordData(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const handlePersonalDataChange = (campo, valor) => {
    setPersonalData(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const secciones = [
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

  // Si está cargando, mostrar pantalla de carga
  if (isLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Principal */}
        <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-100 rounded-2xl sm:rounded-3xl shadow-xl shadow-blue-200/30 border-2 border-blue-200/50 p-6 sm:p-8 mb-6 sm:mb-8 backdrop-blur-sm relative overflow-hidden">
          {/* Efecto de brillo sutil */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent rounded-2xl sm:rounded-3xl"></div>
          
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
            <div className="mt-4 sm:mt-0">
              <button 
                onClick={handleGuardarConfiguracion}
                disabled={guardando}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 hover:-translate-y-0.5 backdrop-blur-sm"
              >
                {guardando ? (
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
        {mensaje && (
          <div className={`bg-gradient-to-r ${
            mensaje.includes('exitosamente') 
              ? 'from-green-50 via-green-100 to-emerald-100 border-green-300/50 text-green-800' 
              : 'from-red-50 via-red-100 to-pink-100 border-red-300/50 text-red-800'
          } border-2 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-lg backdrop-blur-sm relative overflow-hidden transform transition-all duration-300 hover:scale-[1.02]`}>
            {/* Efecto de brillo sutil */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-2xl"></div>
            
            <div className="relative z-10 flex items-center">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 ${
                mensaje.includes('exitosamente') 
                  ? 'bg-gradient-to-br from-green-400 to-emerald-500 shadow-green-400/30' 
                  : 'bg-gradient-to-br from-red-400 to-pink-500 shadow-red-400/30'
              } shadow-lg`}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mensaje.includes('exitosamente') ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  )}
                </svg>
              </div>
              <span className="font-semibold text-base sm:text-lg">{mensaje}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Sidebar de navegación */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-white via-gray-50 to-blue-50 rounded-2xl sm:rounded-3xl shadow-xl shadow-gray-200/40 border-2 border-gray-200/50 p-6 sm:p-8 backdrop-blur-sm relative overflow-hidden">
              {/* Efecto de brillo sutil */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent rounded-2xl sm:rounded-3xl"></div>
              
              <div className="relative z-10">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-6 flex items-center">
                  <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mr-3"></span>
                  Configuraciones
                </h3>
                <nav className="space-y-3">
                  {secciones.map((seccion) => (
                    <button
                      key={seccion.id}
                      onClick={() => setSeccionActiva(seccion.id)}
                      className={`w-full text-left p-4 rounded-xl transition-all duration-300 flex items-center space-x-4 group relative overflow-hidden ${
                        seccionActiva === seccion.id 
                          ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-xl shadow-blue-500/40 transform scale-105' 
                          : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-lg hover:scale-[1.02] hover:shadow-blue-200/30'
                      }`}
                    >
                      {/* Efecto de brillo para botón activo */}
                      {seccionActiva === seccion.id && (
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-xl"></div>
                      )}
                      
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center relative z-10 ${
                        seccionActiva === seccion.id 
                          ? 'bg-white/20 shadow-lg' 
                          : 'bg-gradient-to-br from-blue-100 to-indigo-100 group-hover:from-blue-200 group-hover:to-indigo-200'
                      } transition-all duration-300`}>
                        <span className="text-lg">{seccion.icono}</span>
                      </div>
                      <div className="relative z-10 flex-1">
                        <span className="font-semibold text-base block">{seccion.nombre}</span>
                        <span className={`text-xs opacity-75 ${
                          seccionActiva === seccion.id ? 'text-blue-100' : 'text-gray-500'
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
            <div className="bg-gradient-to-br from-white via-gray-50 to-blue-50 rounded-2xl sm:rounded-3xl shadow-xl shadow-gray-200/40 border-2 border-gray-200/50 p-6 sm:p-8 backdrop-blur-sm relative overflow-hidden">
              {/* Efecto de brillo sutil */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent rounded-2xl sm:rounded-3xl"></div>
              
              <div className="relative z-10">
                {/* Configuración General */}
                {seccionActiva === 'general' && (
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
                          value={configuracion.general.nombreInstitucion}
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
                          value={configuracion.general.email}
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
                          value={configuracion.general.telefono}
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
                          value={configuracion.general.sitioWeb}
                          onChange={(e) => handleInputChange('general', 'sitioWeb', e.target.value)}
                          className="block w-full px-4 py-4 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:shadow-md hover:border-blue-300"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Dirección
                        </label>
                        <textarea
                          value={configuracion.general.direccion}
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
                          value={configuracion.general.horarioAtencion}
                          onChange={(e) => handleInputChange('general', 'horarioAtencion', e.target.value)}
                          className="block w-full px-4 py-4 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:shadow-md hover:border-blue-300"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Configuración de Seguridad */}
                {seccionActiva === 'seguridad' && (
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
                          value={configuracion.seguridad.sesionMaxima}
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
                          value={configuracion.seguridad.intentosLogin}
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
                          value={configuracion.seguridad.cambioPasswordObligatorio}
                          onChange={(e) => handleInputChange('seguridad', 'cambioPasswordObligatorio', parseInt(e.target.value))}
                          className="block w-full px-4 py-4 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:shadow-md hover:border-blue-300"
                        />
                      </div>
                    </div>

                    {/* Sección para cambiar contraseña */}
                    <div className="mb-10">
                      <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 rounded-2xl p-6 sm:p-8 border-2 border-orange-200/50 shadow-lg shadow-orange-200/30 relative overflow-hidden">
                        {/* Efecto de brillo sutil */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent rounded-2xl"></div>
                        
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
                                disabled={guardando}
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

                    {/* Sección para cambiar datos personales del admin */}
                    <div>
                      <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl p-6 sm:p-8 border-2 border-green-200/50 shadow-lg shadow-green-200/30 relative overflow-hidden">
                        {/* Efecto de brillo sutil */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent rounded-2xl"></div>
                        
                        <div className="relative z-10">
                          <div className="flex items-center mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30 mr-4">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-gray-800">Datos Personales del Administrador</h4>
                              <p className="text-sm text-gray-600 opacity-80">Actualiza tu información personal</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="block text-sm font-semibold text-gray-700 mb-3">Nombre</label>
                              <input 
                                type="text" 
                                value={personalData.nombre}
                                onChange={(e) => handlePersonalDataChange('nombre', e.target.value)}
                                className="block w-full px-4 py-4 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:shadow-md hover:border-green-300" 
                                placeholder="Nombre(s)" 
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="block text-sm font-semibold text-gray-700 mb-3">Apellidos</label>
                              <input 
                                type="text" 
                                value={personalData.apellidos}
                                onChange={(e) => handlePersonalDataChange('apellidos', e.target.value)}
                                className="block w-full px-4 py-4 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:shadow-md hover:border-green-300" 
                                placeholder="Apellidos" 
                              />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                              <label className="block text-sm font-semibold text-gray-700 mb-3">Correo electrónico</label>
                              <input 
                                type="email" 
                                value={personalData.email}
                                onChange={(e) => handlePersonalDataChange('email', e.target.value)}
                                className="block w-full px-4 py-4 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:shadow-md hover:border-green-300" 
                                placeholder="Correo electrónico" 
                              />
                            </div>
                            <div className="md:col-span-2 flex justify-end">
                              <button 
                                onClick={handleUpdatePersonalData}
                                disabled={guardando}
                                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-emerald-600/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 hover:-translate-y-0.5"
                              >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Actualizar Datos
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
