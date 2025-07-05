// src/components/Profile_Alumno_comp.jsx
import React, { useState, useEffect } from 'react';
import reeseProfilePic from '../assets/reese.jfif'; // Importa la imagen de perfil

/**
 * Componente de la Modal para editar el perfil del alumno.
 *
 * @param {object} props - Las props del componente.
 * @param {boolean} props.isOpen - Si la modal está abierta.
 * @param {function} props.onClose - Función para cerrar la modal.
 * @param {object} props.initialData - Datos iniciales del perfil para editar.
 * @param {function} props.onSave - Función para guardar los cambios, recibe los nuevos datos.
 */
function ProfileEditModal({ isOpen, onClose, initialData, onSave }) {
  // Estado para los datos que se están editando dentro de la modal
  const [formData, setFormData] = useState(initialData);

  // Sincroniza formData con initialData cuando la modal se abre
  useEffect(() => {
    setFormData(initialData);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Manejar campos anidados (personal.email, academic.bachillerato, etc.)
    const [section, field] = name.split('.');
    if (field) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-gradient-to-br from-purple-900/60 via-blue-900/50 to-pink-900/60 backdrop-blur-[3px] animate-fade-in p-1 sm:p-0">
      <div className="relative w-full max-w-md mx-auto rounded-3xl shadow-2xl border border-white/30 bg-white/80 bg-clip-padding backdrop-blur-xl p-0 overflow-hidden animate-pop-in flex flex-col max-h-[95vh]">
        {/* Header visual sticky y responsivo */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 px-3 py-4 sm:p-6 text-center border-b border-white/20">
          <div className="flex justify-center mb-1 sm:mb-2">
            <span className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/30 shadow-lg border-4 border-white/40 text-3xl sm:text-4xl animate-bounce-in">✏️</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white drop-shadow-lg tracking-wide">Editar Perfil</h2>
        </div>
        {/* Formulario moderno y ultra responsivo */}
        <form onSubmit={handleSubmit} className="flex-1 p-3 sm:p-6 space-y-5 sm:space-y-6 overflow-y-auto max-h-[60vh] sm:max-h-[65vh] scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-transparent">
          {/* Datos Personales */}
          <div>
            <h3 className="text-xs font-bold text-purple-700 mb-2 flex items-center gap-1 uppercase tracking-wider">
              <span className="text-base">👤</span> Datos Personales
            </h3>
            <div className="space-y-2">
              <input
                type="email"
                name="personal.email"
                value={formData.personal.email}
                onChange={handleChange}
                placeholder="Correo electrónico"
                className="w-full p-3 rounded-xl bg-white/60 border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-300 text-sm font-semibold placeholder-purple-400 shadow-inner transition-all duration-200 outline-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  name="personal.municipio"
                  value={formData.personal.municipio}
                  onChange={handleChange}
                  placeholder="Municipio"
                  className="w-full p-3 rounded-xl bg-white/60 border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-300 text-sm font-semibold placeholder-purple-400 shadow-inner transition-all duration-200 outline-none"
                />
                <input
                  type="text"
                  name="personal.tutorName"
                  value={formData.personal.tutorName}
                  onChange={handleChange}
                  placeholder="Tutor"
                  className="w-full p-3 rounded-xl bg-white/60 border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-300 text-sm font-semibold placeholder-purple-400 shadow-inner transition-all duration-200 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="tel"
                  name="personal.phoneNumber"
                  value={formData.personal.phoneNumber}
                  onChange={handleChange}
                  placeholder="Mi teléfono"
                  className="w-full p-3 rounded-xl bg-white/60 border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-300 text-sm font-semibold placeholder-purple-400 shadow-inner transition-all duration-200 outline-none"
                />
                <input
                  type="tel"
                  name="personal.tutorPhoneNumber"
                  value={formData.personal.tutorPhoneNumber}
                  onChange={handleChange}
                  placeholder="Tel. tutor"
                  className="w-full p-3 rounded-xl bg-white/60 border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-300 text-sm font-semibold placeholder-purple-400 shadow-inner transition-all duration-200 outline-none"
                />
              </div>
            </div>
          </div>
          {/* Datos Académicos */}
          <div>
            <h3 className="text-xs font-bold text-green-700 mb-2 flex items-center gap-1 uppercase tracking-wider">
              <span className="text-base">🎓</span> Datos Académicos
            </h3>
            <div className="space-y-2">
              <input
                type="text"
                name="academic.bachillerato"
                value={formData.academic.bachillerato}
                onChange={handleChange}
                placeholder="Bachillerato actual"
                className="w-full p-3 rounded-xl bg-white/60 border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-300 text-sm font-semibold placeholder-green-400 shadow-inner transition-all duration-200 outline-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  name="academic.licenciaturaOption"
                  value={formData.academic.licenciaturaOption}
                  onChange={handleChange}
                  placeholder="Licenciatura"
                  className="w-full p-3 rounded-xl bg-white/60 border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-300 text-sm font-semibold placeholder-green-400 shadow-inner transition-all duration-200 outline-none"
                />
                <input
                  type="text"
                  name="academic.universityOption"
                  value={formData.academic.universityOption}
                  onChange={handleChange}
                  placeholder="Universidad"
                  className="w-full p-3 rounded-xl bg-white/60 border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-300 text-sm font-semibold placeholder-green-400 shadow-inner transition-all duration-200 outline-none"
                />
              </div>
            </div>
          </div>
          {/* Datos del Curso */}
          <div>
            <h3 className="text-xs font-bold text-orange-700 mb-2 flex items-center gap-1 uppercase tracking-wider">
              <span className="text-base">📚</span> Datos del Curso
            </h3>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  name="course.advisor"
                  value={formData.course.advisor}
                  onChange={handleChange}
                  placeholder="Asesor"
                  className="w-full p-3 rounded-xl bg-white/60 border-2 border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-300 text-sm font-semibold placeholder-orange-400 shadow-inner transition-all duration-200 outline-none"
                />
                <input
                  type="text"
                  name="course.group"
                  value={formData.course.group}
                  onChange={handleChange}
                  placeholder="Grupo"
                  className="w-full p-3 rounded-xl bg-white/60 border-2 border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-300 text-sm font-semibold placeholder-orange-400 shadow-inner transition-all duration-200 outline-none"
                />
              </div>
              <input
                type="text"
                name="course.modality"
                value={formData.course.modality}
                onChange={handleChange}
                placeholder="Modalidad"
                className="w-full p-3 rounded-xl bg-white/60 border-2 border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-300 text-sm font-semibold placeholder-orange-400 shadow-inner transition-all duration-200 outline-none"
              />
            </div>
          </div>
          {/* Botones modernos sticky abajo en mobile */}
          <div className="sticky bottom-0 z-10 bg-white/80 backdrop-blur-xl border-t border-white/20 flex gap-3 p-2 sm:p-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 py-2 sm:px-4 sm:py-3 rounded-xl bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 font-bold shadow hover:from-gray-300 hover:to-gray-400 transition-all duration-200 active:scale-95 border border-gray-300 text-sm sm:text-base"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-3 py-2 sm:px-4 sm:py-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 text-white font-bold shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 active:scale-95 border-0 text-sm sm:text-base"
            >
              Guardar
            </button>
          </div>
        </form>
        {/* Animaciones keyframes para la modal */}
        <style>{`
          @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
          @keyframes pop-in { 0% { opacity: 0; transform: scale(0.85);} 100% { opacity: 1; transform: scale(1); } }
          @keyframes bounce-in { 0% { opacity: 0; transform: scale(0.7);} 60% { opacity: 1; transform: scale(1.1);} 100% { transform: scale(1); } }
          .animate-fade-in { animation: fade-in 0.5s cubic-bezier(.4,0,.2,1) both; }
          .animate-pop-in { animation: pop-in 0.6s cubic-bezier(.4,0,.2,1) both; }
          .animate-bounce-in { animation: bounce-in 0.8s cubic-bezier(.4,0,.2,1) both; }
        `}</style>
      </div>
    </div>
  );
}


/**
 * Componente para mostrar el perfil completo del alumno.
 * Incluye secciones de datos personales, académicos y del curso.
 *
 * Este componente ahora gestiona sus propios datos de perfil y la modal de edición.
 *
 * @param {object} props - Las props del componente.
 * @param {object} [props.profileData] - Objeto con los datos iniciales del perfil (opcional, para sobrescribir mockData).
 * @param {boolean} [props.isLoading=false] - Indica si los datos están cargando.
 * @param {string|null} [props.error=null] - Mensaje de error si la carga falla.
 */
export function Profile_Alumno_comp({ profileData: initialProfileDataProp, isLoading = false, error = null }) {
  // --- INTEGRACIÓN BACKEND: ---
  // 1. Aquí puedes hacer el fetch de los datos del perfil desde el backend usando useEffect.
  // 2. Usa el estado de carga y error para mostrar el UI adecuado.
  // 3. Usa la función handleSaveProfile para actualizar el perfil en el backend.

  // Datos mock para el perfil, usados si no se pasan datos iniciales por prop
  const mockProfileData = {
    name: "José Luis Rodríguez Marquez",
    profilePic: reeseProfilePic,
    personal: {
      email: "jose.luis@email.com",
      municipio: "Ciudad de México",
      tutorName: "María Fernández",
      phoneNumber: "5512345678",
      tutorPhoneNumber: "5587654321",
    },
    academic: {
      academy: "MQerK Academy",
      bachillerato: "Preparatoria Federal",
      licenciaturaOption: "Ingeniería de Software",
      universityOption: "Universidad Nacional",
    },
    course: {
      activeCourse: "Introducción a React",
      advisor: "Dra. Jane Doe",
      group: "A-101",
      modality: "Online",
    }
  };

  // Estado para los datos del perfil que se muestran en la UI
  const [currentProfileData, setCurrentProfileData] = useState(initialProfileDataProp || mockProfileData);
  // Estado para controlar la visibilidad de la modal de edición
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Estado de carga y error para la petición al backend (opcional)
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState(null);

  // --- INTEGRACIÓN BACKEND: Cargar datos del perfil ---
  /*
  useEffect(() => {
    setIsLoading(true);
    fetch('/api/perfil-alumno')
      .then(res => res.json())
      .then(data => {
        setCurrentProfileData(data);
        setIsLoading(false);
      })
      .catch(err => {
        setError('Error al cargar el perfil');
        setIsLoading(false);
      });
  }, []);
  */

  // Sincronizar el estado interno si la prop profileData cambia desde el padre
  useEffect(() => {
    if (initialProfileDataProp) {
      setCurrentProfileData(initialProfileDataProp);
    }
  }, [initialProfileDataProp]);

  // Función para abrir la modal
  const handleEditClick = () => {
    setIsModalOpen(true);
  };

  // Función para cerrar la modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // --- INTEGRACIÓN BACKEND: Guardar cambios del perfil ---
  const handleSaveProfile = async (updatedData) => {
    // Aquí puedes hacer la petición al backend para guardar los cambios
    // Ejemplo con fetch:
    /*
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/perfil-alumno', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (!response.ok) throw new Error('Error al guardar el perfil');
      const data = await response.json();
      setCurrentProfileData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
    */
    // Por ahora, solo actualiza el estado local:
    setCurrentProfileData(updatedData);
    handleCloseModal();
  };

  // --- LÓGICA DE CARGA Y ERRORES ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-red-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-200 text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-lg font-medium text-red-600">Error al cargar el perfil: {error}</p>
        </div>
      </div>
    );
  }
  // ----------------------------------

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-100 p-3 xs:p-4 sm:p-6 lg:p-8 font-inter text-gray-800">
      
      {/* Encabezado de la página de perfil mejorado */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 pb-6 border-b-2 border-gray-200">
        <h2 className="text-2xl xs:text-3xl sm:text-4xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4 sm:mb-0">
          MI PERFIL
        </h2>
        <button
          onClick={handleEditClick}
          className="px-4 xs:px-6 py-2 xs:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 text-sm xs:text-base flex items-center space-x-2"
        >
          <span>✏️</span>
          <span>Editar perfil</span>
        </button>
      </div>

      {/* MANTENER INTACTA - Sección de Información del Usuario con estilo mejorado */}
      <div className="bg-gradient-to-br from-white via-gray-50 to-blue-50 p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-200 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8 hover:shadow-3xl transition-all duration-300">
        {/* Columna de la izquierda: Foto de Perfil y Nombre */}
        <div className="flex flex-col items-center justify-start lg:col-span-1 border-b lg:border-b-0 lg:border-r border-gray-200 pb-6 lg:pb-0 lg:pr-6">
          <div className="relative mb-4">
            <img
              src={currentProfileData.profilePic}
              alt={currentProfileData.name}
              className="w-40 h-40 rounded-full object-cover border-4 border-blue-400 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/160x160/A0AEC0/FFFFFF?text=Foto"; }}
            />
            {/* Badge de verificación */}
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
              <span className="text-white text-sm font-bold">✓</span>
            </div>
          </div>
          <div className="text-center bg-white rounded-xl px-4 py-3 shadow-lg border border-gray-100">
            <p className="text-xl font-bold text-gray-900 mb-1">{currentProfileData.name}</p>
            <div className="flex items-center justify-center text-sm text-green-600 font-medium">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              Estudiante Activo
            </div>
          </div>
        </div>

        {/* Columnas centrales y de la derecha para los datos */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
          {/* Sección: DATOS PERSONALES */}
          <div className="md:col-span-2">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 mb-6 shadow-lg">
              <h3 className="text-lg font-bold text-white flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 13a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                DATOS PERSONALES
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-2 13H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z"/></svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Correo electrónico</p>
                    <p className="text-sm font-bold text-gray-800 break-all">{currentProfileData.personal.email}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-100 to-pink-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Mi número de teléfono</p>
                    <p className="text-sm font-bold text-gray-800">{currentProfileData.personal.phoneNumber}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0L6.343 16.657a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Municipio o comunidad</p>
                    <p className="text-sm font-bold text-gray-800">{currentProfileData.personal.municipio}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-100 to-pink-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Teléfono de mi tutor</p>
                    <p className="text-sm font-bold text-gray-800">{currentProfileData.personal.tutorPhoneNumber}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 sm:col-span-2">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-purple-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM12 15v2m-2 2h4M7 21h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Nombre de mi tutor</p>
                    <p className="text-sm font-bold text-gray-800">{currentProfileData.personal.tutorName}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de secciones - Solo 2 tarjetas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xs:gap-8">

        {/* Sección: DATOS ACADÉMICOS - Mejorada */}
        <div className="bg-white rounded-2xl shadow-xl border border-green-200 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 lg:col-span-1">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 xs:p-5">
            <h3 className="text-lg xs:text-xl font-bold text-white flex items-center justify-center">
              <span className="mr-2 text-2xl">🎓</span>
              DATOS ACADÉMICOS
            </h3>
          </div>
          <div className="p-4 xs:p-6 space-y-4">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-green-600 text-sm">🏫</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Academia</p>
                <p className="text-sm font-bold text-gray-800">{currentProfileData.academic.academy}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-green-600 text-sm">📚</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Bachillerato actual</p>
                <p className="text-sm font-bold text-gray-800">{currentProfileData.academic.bachillerato}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-green-600 text-sm">🎯</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Opción de licenciatura</p>
                <p className="text-sm font-bold text-gray-800">{currentProfileData.academic.licenciaturaOption}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-green-600 text-sm">🏛️</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Opción de universidad</p>
                <p className="text-sm font-bold text-gray-800">{currentProfileData.academic.universityOption}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sección: DATOS DEL CURSO - Mejorada */}
        <div className="bg-white rounded-2xl shadow-xl border border-orange-200 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 lg:col-span-1">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 xs:p-5">
            <h3 className="text-lg xs:text-xl font-bold text-white flex items-center justify-center">
              <span className="mr-2 text-2xl">📖</span>
              DATOS DEL CURSO
            </h3>
          </div>
          <div className="p-4 xs:p-6 space-y-4">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-orange-600 text-sm">📝</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Curso activo</p>
                <p className="text-sm font-bold text-gray-800">{currentProfileData.course.activeCourse}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-orange-600 text-sm">👨‍🏫</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Asesor a cargo</p>
                <p className="text-sm font-bold text-gray-800">{currentProfileData.course.advisor}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-orange-600 text-sm">👥</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Grupo</p>
                <p className="text-sm font-bold text-gray-800">{currentProfileData.course.group}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-orange-600 text-sm">💻</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Modalidad</p>
                <p className="text-sm font-bold text-gray-800">{currentProfileData.course.modality}</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Renderiza la Modal de Edición si isModalOpen es true */}
      <ProfileEditModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialData={currentProfileData}
        onSave={handleSaveProfile}
      />
    </div>
  );
}