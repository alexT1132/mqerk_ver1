// src/components/Profile_Alumno_comp.jsx
import React, { useState, useEffect } from 'react';
import { useStudent } from '../../context/StudentContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getEstudianteByIdRequest, updateEstudianteRequest } from '../../api/estudiantes.js';
import { buildStaticUrl, getApiOrigin } from '../../utils/url';

// Componente para input con validaciones completas restauradas
const InputField = ({ name, type = "text", placeholder, value, onChange, className, isAcademic = false, isCourse = false, helpText = null, errors = {}, maxLength = null }) => {
  const borderColor = isAcademic ? 'green' : isCourse ? 'orange' : 'purple';
  const placeholderColor = isAcademic ? 'green' : isCourse ? 'orange' : 'purple';
  const hasError = errors[name];
  const hasValue = value && value.trim() !== '';
  
  return (
    <div className="space-y-1">
      <div className="relative">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`w-full p-2 rounded-lg bg-white border-2 ${
            hasError 
              ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-200' 
              : hasValue
              ? `border-${borderColor}-400 focus:border-${borderColor}-500 focus:ring-1 focus:ring-${borderColor}-200`
              : `border-${borderColor}-200 focus:border-${borderColor}-500 focus:ring-1 focus:ring-${borderColor}-200`
          } text-xs font-semibold placeholder-${placeholderColor}-400 shadow-inner transition-all duration-200 outline-none ${className}`}
        />
        {hasValue && !hasError && (
          <span className={`absolute right-2 top-1/2 transform -translate-y-1/2 text-${borderColor}-500 text-sm`}>
            ✓
          </span>
        )}
        {maxLength && hasValue && (
          <span className={`absolute right-8 top-1/2 transform -translate-y-1/2 text-xs ${
            value.length > maxLength * 0.8 ? 'text-amber-500' : 'text-gray-400'
          }`}>
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      {hasError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-2">
          <p className="text-red-600 text-xs font-medium flex items-center gap-1">
            <span>⚠️</span>
            {errors[name]}
          </p>
        </div>
      )}
      {helpText && !hasError && (
        <p className="text-gray-500 text-xs flex items-center gap-1">
          <span>💡</span>
          {helpText}
        </p>
      )}
    </div>
  );
};

/**
 * Modal para editar perfil del alumno - ARREGLADA RESPONSIVIDAD
 */
function ProfileEditModal({ isOpen, onClose, initialData, onSave }) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sincronizar datos cuando se abre la modal
  useEffect(() => {
    setFormData(initialData);
    setErrors({}); // Limpiar errores al abrir
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Funciones de validación completas restauradas
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
    return phone.length >= 10 && phoneRegex.test(phone);
  };

  const validateName = (name) => {
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    return nameRegex.test(name);
  };

  const validateLength = (value, min, max) => {
    if (value && value.length < min) {
      return false;
    }
    if (value && max && value.length > max) {
      return false;
    }
    return true;
  };

  const validateField = (name, value) => {
    let error = null;

    // No validar campos vacíos (son opcionales)
    if (!value || value.trim() === '') {
      return null;
    }

    switch (name) {
      // Validaciones de datos personales
      case 'personal.email':
        if (!validateEmail(value)) {
          error = 'Formato de correo inválido (ejemplo: usuario@correo.com)';
        }
        break;
      case 'personal.phoneNumber':
        if (!validatePhoneNumber(value)) {
          error = 'Formato de teléfono inválido (mínimo 10 dígitos)';
        }
        break;
      case 'personal.tutorPhoneNumber':
        if (!validatePhoneNumber(value)) {
          error = 'Formato de teléfono inválido (mínimo 10 dígitos)';
        }
        break;
      case 'personal.municipio':
        if (!validateLength(value, 2, 50)) {
          error = value.length < 2 ? 'Municipio debe tener al menos 2 caracteres' : 'Municipio muy largo (máx. 50 caracteres)';
        } else if (!validateName(value)) {
          error = 'Municipio solo puede contener letras y espacios';
        }
        break;
      case 'personal.tutorName':
        if (!validateLength(value, 2, 100)) {
          error = value.length < 2 ? 'Nombre del tutor debe tener al menos 2 caracteres' : 'Nombre muy largo (máx. 100 caracteres)';
        } else if (!validateName(value)) {
          error = 'Nombre del tutor solo puede contener letras y espacios';
        }
        break;
      
      // Validaciones de datos académicos
      case 'academic.bachillerato':
        if (!validateLength(value, 2, 100)) {
          error = value.length < 2 ? 'Bachillerato debe tener al menos 2 caracteres' : 'Nombre muy largo (máx. 100 caracteres)';
        }
        break;
      case 'academic.licenciaturaOption':
        if (!validateLength(value, 2, 100)) {
          error = value.length < 2 ? 'Licenciatura debe tener al menos 2 caracteres' : 'Nombre muy largo (máx. 100 caracteres)';
        }
        break;
      case 'academic.universityOption':
        if (!validateLength(value, 2, 100)) {
          error = value.length < 2 ? 'Universidad debe tener al menos 2 caracteres' : 'Nombre muy largo (máx. 100 caracteres)';
        }
        break;
      
      
      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Primero actualizar los datos
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

    // Limpiar el error de este campo si existe
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validar todos los campos que tienen contenido
    const newErrors = {};
    const fieldsToValidate = [
      'personal.email',
      'personal.phoneNumber',
      'personal.tutorPhoneNumber',
      'personal.municipio',
      'personal.tutorName',
      'academic.bachillerato',
      'academic.licenciaturaOption',
      'academic.universityOption'
    ];

    // Validar cada campo individualmente
    fieldsToValidate.forEach(fieldName => {
      const [section, field] = fieldName.split('.');
      const value = formData[section][field];
      
      // Solo validar si el campo tiene contenido
      if (value && value.trim() !== '') {
        const error = validateField(fieldName, value);
        if (error) {
          newErrors[fieldName] = error;
        }
      }
    });

    // Validaciones cruzadas adicionales
    if (formData.personal.phoneNumber && formData.personal.tutorPhoneNumber) {
      if (formData.personal.phoneNumber === formData.personal.tutorPhoneNumber) {
        newErrors['personal.tutorPhoneNumber'] = 'El teléfono del tutor debe ser diferente al tuyo';
      }
    }

    // Validar que el email sea único si es diferente al original
    if (formData.personal.email && formData.personal.email !== initialData.personal.email) {
      // TODO: Implementar validación de email único contra backend
      // const emailExists = await checkEmailExists(formData.personal.email);
      // if (emailExists) {
      //   newErrors['personal.email'] = 'Este correo ya está registrado';
      // }
    }

    setErrors(newErrors);

    // Si hay errores, mostrar resumen si son muchos
    if (Object.keys(newErrors).length > 3) {
      setErrors(prev => ({
        ...prev,
        submit: `Se encontraron ${Object.keys(newErrors).length} errores. Por favor corrige los campos marcados.`
      }));
    }

    // Si no hay errores, guardar
    if (Object.keys(newErrors).length === 0) {
      try {
        await onSave(formData);
        // Mostrar mensaje de éxito
        setErrors({ success: 'Perfil actualizado exitosamente' });
        setTimeout(() => {
          onClose();
        }, 1500);
      } catch (error) {
        console.error('Error al guardar:', error);
        setErrors({ submit: 'Error al guardar los datos. Por favor inténtalo nuevamente.' });
      }
    }

    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm animate-in fade-in duration-500 overflow-y-auto">
      <div className="min-h-screen flex items-end justify-center p-4 pb-16 pt-32">
        <div className="relative w-full max-w-sm mx-auto rounded-2xl shadow-2xl border border-gray-200 bg-white overflow-hidden animate-in zoom-in-95 duration-600">
          
          {/* Header visual compacto */}
          <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 px-5 py-3 text-center">
            <div className="flex justify-center mb-1">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/30 shadow-lg border-2 border-white/50 text-base">✏️</span>
            </div>
            <h2 className="text-base font-extrabold text-white drop-shadow-lg">Editar Perfil</h2>
          </div>

          {/* Formulario compacto */}
          <form onSubmit={handleSubmit} className="p-3">
            <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-2">
              
              {/* Datos Personales */}
              <div>
                <h3 className="text-xs font-bold text-purple-700 mb-2 flex items-center gap-1 uppercase tracking-wider">
                  <span>👤</span> Datos Personales
                </h3>
                <div className="space-y-2">
                  <InputField
                    type="email"
                    name="personal.email"
                    value={formData.personal.email}
                    onChange={handleChange}
                    placeholder="Correo electrónico"
                    helpText="Será usado para notificaciones importantes"
                    errors={errors}
                    maxLength={100}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <InputField
                      name="personal.municipio"
                      value={formData.personal.municipio}
                      onChange={handleChange}
                      placeholder="Municipio"
                      helpText="Donde vives actualmente"
                      errors={errors}
                      maxLength={50}
                    />
                    <InputField
                      name="personal.tutorName"
                      value={formData.personal.tutorName}
                      onChange={handleChange}
                      placeholder="Nombre del tutor"
                      helpText="Padre, madre o tutor legal"
                      errors={errors}
                      maxLength={100}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <InputField
                      type="tel"
                      name="personal.phoneNumber"
                      value={formData.personal.phoneNumber}
                      onChange={handleChange}
                      placeholder="Mi teléfono"
                      helpText="Mínimo 10 dígitos"
                      errors={errors}
                      maxLength={15}
                    />
                    <InputField
                      type="tel"
                      name="personal.tutorPhoneNumber"
                      value={formData.personal.tutorPhoneNumber}
                      onChange={handleChange}
                      placeholder="Teléfono del tutor"
                      helpText="Para emergencias"
                      errors={errors}
                      maxLength={15}
                    />
                  </div>
                </div>
              </div>

              {/* Datos Académicos */}
              <div>
                <h3 className="text-xs font-bold text-green-700 mb-2 flex items-center gap-1 uppercase tracking-wider">
                  <span>🎓</span> Datos Académicos
                </h3>
                <div className="space-y-2">
                  <InputField
                    name="academic.bachillerato"
                    value={formData.academic.bachillerato}
                    onChange={handleChange}
                    placeholder="Bachillerato actual"
                    helpText="Nombre de tu preparatoria"
                    isAcademic={true}
                    errors={errors}
                    maxLength={100}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <InputField
                      name="academic.licenciaturaOption"
                      value={formData.academic.licenciaturaOption}
                      onChange={handleChange}
                      placeholder="Licenciatura"
                      helpText="Carrera de interés"
                      isAcademic={true}
                      errors={errors}
                      maxLength={100}
                    />
                    <InputField
                      name="academic.universityOption"
                      value={formData.academic.universityOption}
                      onChange={handleChange}
                      placeholder="Universidad"
                      helpText="Universidad objetivo"
                      isAcademic={true}
                      errors={errors}
                      maxLength={100}
                    />
                  </div>
                </div>
              </div>

              {/* Datos del Curso - Solo informativos, no editables por alumno */}
              <div>
                <h3 className="text-xs font-bold text-orange-700 mb-2 flex items-center gap-1 uppercase tracking-wider">
                  <span>📚</span> Datos del Curso
                </h3>
                <div className="space-y-2 text-xs text-gray-600 bg-orange-50 border border-orange-200 rounded-md p-2">
                  Estos datos los gestiona la administración. Si necesitas algún cambio, contacta a soporte.
                </div>
              </div>
            </div>

            {/* Mostrar mensajes de estado */}
            {errors.success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                <p className="text-green-600 text-xs font-medium flex items-center gap-1">
                  <span>✅</span>
                  {errors.success}
                </p>
              </div>
            )}
            
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                <p className="text-red-600 text-xs font-medium flex items-center gap-1">
                  <span>❌</span>
                  {errors.submit}
                </p>
              </div>
            )}

            {/* Mostrar resumen de errores si hay muchos */}
            {Object.keys(errors).filter(key => key !== 'submit' && key !== 'success').length > 3 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                <p className="text-amber-600 text-xs font-medium flex items-center gap-1">
                  <span>⚠️</span>
                  Por favor, revisa los campos marcados en rojo antes de continuar.
                </p>
              </div>
            )}

            {/* Mostrar mensaje de éxito */}
            {errors.success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                <p className="text-green-600 text-xs font-medium flex items-center gap-1">
                  <span>✅</span>
                  {errors.success}
                </p>
              </div>
            )}

            {/* Mostrar error de submit si existe */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                <p className="text-red-600 text-xs font-medium flex items-center gap-1">
                  <span>❌</span>
                  {errors.submit}
                </p>
              </div>
            )}

            {/* Botones simplificados */}
            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-3 py-2 rounded-lg bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 transition-all duration-200 text-xs disabled:opacity-50"
              >
                Cancelar
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setFormData(initialData);
                  setErrors({});
                }}
                disabled={isSubmitting}
                className="px-3 py-2 rounded-lg bg-blue-200 text-blue-700 font-bold hover:bg-blue-300 transition-all duration-200 text-xs disabled:opacity-50"
                title="Restaurar valores originales"
              >
                🔄
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 text-xs disabled:opacity-50 flex items-center justify-center gap-1"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                    Guardando...
                  </>
                ) : errors.success ? (
                  <>
                    <span>✅</span>
                    Guardado
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    Guardar
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
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
function Profile_Alumno_comp({ profileData: initialProfileDataProp, isLoading = false, error = null }) {
  
  // BACKEND: Obtener datos básicos del contexto del estudiante
  const { studentData, currentCourse } = useStudent();
  const { alumno } = useAuth();

  // Helper: construir URL absoluta para archivos servidos por el backend
  const apiOrigin = getApiOrigin();
  
  // BACKEND: Estructura base del perfil - se poblará desde la API
  const defaultProfileData = {
    name: studentData?.name && studentData.name !== "XXXX" ? studentData.name : (alumno?.nombre ? `${alumno.nombre} ${alumno.apellidos || ''}`.trim() : "Estudiante"),
    profilePic: buildStaticUrl(alumno?.foto) || null,
    personal: {
      email: studentData?.email && studentData.email !== "XXXX" ? studentData.email : (alumno?.email || ""),
      municipio: alumno?.comunidad1 || "",
      tutorName: alumno?.nombre_tutor || "",
      phoneNumber: alumno?.telefono || "",
      tutorPhoneNumber: alumno?.tel_tutor || "",
    },
    academic: {
  // Siempre mostrar la academia institucional fija
  academy:  "MQerKAcademy",
  // El bachillerato actual proviene del backend; si no hay academico2, usar academico1
  bachillerato: alumno?.academico2 || alumno?.academico1 || "",
      licenciaturaOption: alumno?.orientacion || "",
      universityOption: alumno?.universidades1 || "",
    },
    course: {
      activeCourse: currentCourse?.title || (alumno?.curso || ""),
  // Asesor fijo por ahora (luego será dinámico)
  advisor: "Kélvil Valentín Gómez Ramírez",
      group: alumno?.grupo || "",
      // Modalidad fija por ahora
      modality: "Presencial",
    }
  };

  const [currentProfileData, setCurrentProfileData] = useState(initialProfileDataProp || defaultProfileData);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // BACKEND: Sincronizar con cambios en el contexto
  useEffect(() => {
    if (studentData || currentCourse || alumno) {
      setCurrentProfileData(prev => ({
        ...prev,
        name: studentData?.name && studentData.name !== "XXXX" ? studentData.name : (alumno?.nombre ? `${alumno.nombre} ${alumno.apellidos || ''}`.trim() : "Estudiante"),
        profilePic: buildStaticUrl(alumno?.foto) || prev.profilePic,
        personal: {
          ...prev.personal,
          email: studentData?.email && studentData.email !== "XXXX" ? studentData.email : (alumno?.email || ""),
          municipio: alumno?.comunidad1 ?? prev.personal.municipio,
          tutorName: alumno?.nombre_tutor ?? prev.personal.tutorName,
          phoneNumber: alumno?.telefono ?? prev.personal.phoneNumber,
          tutorPhoneNumber: alumno?.tel_tutor ?? prev.personal.tutorPhoneNumber,
        },
        academic: {
          ...prev.academic,
          // Mantener fija la academia institucional
          academy: "MQerKAcademy",
          bachillerato: alumno?.academico2 ?? alumno?.academico1 ?? prev.academic.bachillerato,
        },
        course: {
          ...prev.course,
          activeCourse: currentCourse?.title || (alumno?.curso || ""),
          advisor: "Kélvil Valentín Gómez Ramírez",
          group: alumno?.grupo ?? prev.course.group,
          modality: "Presencial",
        }
      }));
    }
  }, [studentData, currentCourse, alumno]);

  // BACKEND: Implementar carga de datos desde el backend
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        if (!alumno?.id) return;
        const res = await getEstudianteByIdRequest(alumno.id);
        const est = res.data?.data || res.data; // controlador devuelve {data}
        if (!est) return;

        const uiProfile = {
          name: `${est.nombre || 'Estudiante'}${est.apellidos ? ' ' + est.apellidos : ''}`.trim(),
          profilePic: buildStaticUrl(est.foto),
          personal: {
            email: est.email || '',
            municipio: est.comunidad1 || '',
            tutorName: est.nombre_tutor || '',
            phoneNumber: est.telefono || '',
            tutorPhoneNumber: est.tel_tutor || '',
          },
          academic: {
            // Forzar academia institucional fija
            academy: 'MQerKAcademy',
            // Bachillerato actual: preferir academico2; fallback a academico1
            bachillerato: est.academico2 || est.academico1 || '',
            licenciaturaOption: est.orientacion || '',
            universityOption: est.universidades1 || '',
          },
          course: {
            activeCourse: currentCourse?.title || est.curso || '',
            // Asesor fijo por ahora
            advisor: 'Kélvil Valentín Gómez Ramírez',
            group: est.grupo || '',
            // Modalidad fija por ahora
            modality: 'Presencial',
          }
        };
        setCurrentProfileData(uiProfile);
      } catch (error) {
        console.error('Error al cargar perfil:', error);
      }
    };
    
    fetchProfileData();
  }, [alumno?.id]);

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

  // BACKEND: Guardar cambios del perfil en la API
  const handleSaveProfile = async (updatedData) => {
    try {
      if (!alumno?.id) throw new Error('ID de alumno no disponible');

      // Mapear datos del UI -> backend
      const payload = {
        email: updatedData.personal.email || null,
        comunidad1: updatedData.personal.municipio || null,
        nombre_tutor: updatedData.personal.tutorName || null,
        telefono: updatedData.personal.phoneNumber || null,
        tel_tutor: updatedData.personal.tutorPhoneNumber || null,
        academico1: updatedData.academic.academy || null,
        academico2: updatedData.academic.bachillerato || null,
        orientacion: updatedData.academic.licenciaturaOption || null,
        universidades1: updatedData.academic.universityOption || null
        // Datos del curso NO se envían ni se modifican aquí
      };

      // Limpiar nulls para evitar sobreescritura innecesaria
      Object.keys(payload).forEach(k => (payload[k] == null || payload[k] === '') && delete payload[k]);

      const res = await updateEstudianteRequest(alumno.id, payload);
      const est = res.data?.data || res.data;

      // Actualizar el estado del perfil con la respuesta
      if (est) {
        setCurrentProfileData(prev => ({
          ...prev,
          name: `${est.nombre || prev.name}${est.apellidos ? ' ' + est.apellidos : ''}`.trim(),
          profilePic: buildStaticUrl(est.foto) || prev.profilePic,
          personal: {
            ...prev.personal,
            email: est.email ?? prev.personal.email,
            municipio: est.comunidad1 ?? prev.personal.municipio,
            tutorName: est.nombre_tutor ?? prev.personal.tutorName,
            phoneNumber: est.telefono ?? prev.personal.phoneNumber,
            tutorPhoneNumber: est.tel_tutor ?? prev.personal.tutorPhoneNumber,
          },
          academic: {
            ...prev.academic,
            // Mantener fija la academia institucional
            academy: 'MQerKAcademy',
            // Refrescar bachillerato con preferencia academico2
            bachillerato: (est.academico2 ?? est.academico1) ?? prev.academic.bachillerato,
            licenciaturaOption: est.orientacion ?? prev.academic.licenciaturaOption,
            universityOption: est.universidades1 ?? prev.academic.universityOption,
          },
          // course: datos informativos, no se actualizan desde este flujo
        }));
      } else {
        // Si no retorna el registro, al menos reflejar el UI editado
        setCurrentProfileData(updatedData);
      }

      handleCloseModal();
    } catch (error) {
      console.error('Error al guardar perfil:', error);
      // TODO: Mostrar notificación de error al usuario
    }
  };

  // --- LÓGICA DE CARGA Y ERRORES ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-red-200 text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-lg font-medium text-red-600">Error al cargar el perfil: {error}</p>
        </div>
      </div>
    );
  }
  // ----------------------------------

  return (
    <div className="min-h-screen bg-white p-3 xs:p-4 sm:p-6 lg:p-8 font-inter text-gray-800">
      
      {/* Sección de Encabezado - Consistente con Dashboard */}
      <div className="flex flex-col items-center md:flex-row md:items-start md:justify-between mb-6 pb-4 border-b-2 border-gradient-to-r from-blue-200 to-purple-200">
        <h2 className="text-3xl xs:text-4xl sm:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 md:mb-0">
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
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-200 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8 hover:shadow-2xl transition-all duration-300">
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
          <div className="text-center bg-white rounded-xl px-4 py-3 shadow-2xl border border-gray-100">
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
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 mb-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 13a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                DATOS PERSONALES
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-2xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-2 13H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z"/></svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Correo electrónico</p>
                    <p className="text-sm font-bold text-gray-800 break-all">
                      {currentProfileData.personal.email || 
                        <span className="text-gray-400 italic">No configurado</span>
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-2xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-100 to-pink-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Mi número de teléfono</p>
                    <p className="text-sm font-bold text-gray-800">
                      {currentProfileData.personal.phoneNumber || 
                        <span className="text-gray-400 italic">No configurado</span>
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-2xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0L6.343 16.657a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Municipio o comunidad</p>
                    <p className="text-sm font-bold text-gray-800">
                      {currentProfileData.personal.municipio || 
                        <span className="text-gray-400 italic">No configurado</span>
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-2xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-100 to-pink-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Teléfono de mi tutor</p>
                    <p className="text-sm font-bold text-gray-800">
                      {currentProfileData.personal.tutorPhoneNumber || 
                        <span className="text-gray-400 italic">No configurado</span>
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-2xl border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 sm:col-span-2">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-purple-200 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM12 15v2m-2 2h4M7 21h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Nombre de mi tutor</p>
                    <p className="text-sm font-bold text-gray-800">
                      {currentProfileData.personal.tutorName || 
                        <span className="text-gray-400 italic">No configurado</span>
                      }
                    </p>
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
        <div className="bg-white rounded-2xl shadow-2xl border border-green-200 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 lg:col-span-1">
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
                <p className="text-sm font-bold text-gray-800">
                  {currentProfileData.academic.academy || 
                    <span className="text-gray-400 italic">No configurado</span>
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-green-600 text-sm">📚</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Bachillerato actual</p>
                <p className="text-sm font-bold text-gray-800">
                  {currentProfileData.academic.bachillerato || 
                    <span className="text-gray-400 italic">No configurado</span>
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-green-600 text-sm">🎯</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Opción de licenciatura</p>
                <p className="text-sm font-bold text-gray-800">
                  {currentProfileData.academic.licenciaturaOption || 
                    <span className="text-gray-400 italic">No configurado</span>
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-green-600 text-sm">🏛️</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Opción de universidad</p>
                <p className="text-sm font-bold text-gray-800">
                  {currentProfileData.academic.universityOption || 
                    <span className="text-gray-400 italic">No configurado</span>
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sección: DATOS DEL CURSO - Mejorada */}
        <div className="bg-white rounded-2xl shadow-2xl border border-orange-200 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 lg:col-span-1">
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
                <p className="text-sm font-bold text-gray-800">
                  {currentProfileData.course.activeCourse || 
                    <span className="text-gray-400 italic">No configurado</span>
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-orange-600 text-sm">👨‍🏫</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Asesor a cargo</p>
                <p className="text-sm font-bold text-gray-800">
                  {currentProfileData.course.advisor || 
                    <span className="text-gray-400 italic">No configurado</span>
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-orange-600 text-sm">👥</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Grupo</p>
                <p className="text-sm font-bold text-gray-800">
                  {currentProfileData.course.group || 
                    <span className="text-gray-400 italic">No configurado</span>
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <span className="text-orange-600 text-sm">💻</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Modalidad</p>
                <p className="text-sm font-bold text-gray-800">
                  {currentProfileData.course.modality || 
                    <span className="text-gray-400 italic">No configurado</span>
                  }
                </p>
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

export default Profile_Alumno_comp;