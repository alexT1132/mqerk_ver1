

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminContext } from '../../context/AdminContext.jsx';

// TODO BACKEND: Reemplazar por el servicio real que conecte con tu API
import studentService from '../../service/studentService.js';
import api from '../../api/axios.js';

// TODO BACKEND: Configurar el manejo de imágenes desde tu servidor
import defaultStudentPhoto from '../../assets/reese.jfif';

const CustomNotification = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const getNotificationStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 transform transition-all duration-300 ease-in-out">
      <div className={`max-w-md p-4 rounded-lg border shadow-xl ${getNotificationStyles()}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-3">
            {getIcon()}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium leading-5">{message}</p>
          </div>
          <button onClick={onClose} className="ml-4 text-xs text-gray-500 hover:text-gray-700">Cerrar</button>
        </div>
      </div>
    </div>
  );
};

const InputField = ({
  label,
  field,
  value,
  onChange,
  type = 'text',
  options = null,
  disabled = false,
  helpText = null,
  maxLength = null,
  isRequired = false
}) => {
  const getValidationError = () => {
    if (!value && isRequired) return 'Este campo es requerido';
    if (type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email inválido';
    if (type === 'tel' && value && value.replace(/\D/g, '').length < 10) return 'Número incompleto';
    return null;
  };

  const validationError = getValidationError();

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label} {isRequired && <span className="text-red-500 ml-1">*</span>}
      </label>
      {options ? (
        <select
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
          disabled={disabled}
          className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:cursor-not-allowed text-sm transition-all duration-200 hover:border-gray-400 ${
            validationError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
          }`}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
          disabled={disabled}
          maxLength={maxLength}
          rows={3}
          placeholder={`Ingresa ${label.toLowerCase()}`}
          className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:cursor-not-allowed text-sm resize-none transition-all duration-200 hover:border-gray-400 ${
            validationError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
          }`}
        />
      ) : (
        <input
          type={type === 'tel' ? 'text' : type}
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
          disabled={disabled}
          maxLength={maxLength}
          placeholder={
            type === 'tel'
              ? '(555) 123-4567'
              : type === 'email'
              ? 'ejemplo@correo.com'
              : `Ingresa ${label.toLowerCase()}`
          }
          className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:cursor-not-allowed text-sm transition-all duration-200 hover:border-gray-400 ${
            validationError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
          }`}
        />
      )}
      {helpText && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}
      {validationError && (
        <p className="text-xs text-red-600">{validationError}</p>
      )}
      {maxLength && (
        <p className="text-xs text-gray-400 text-right">
          {value?.length || 0}/{maxLength}
        </p>
      )}
    </div>
  );
};

// Modal de confirmación genérico (restaurado)
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Aceptar', cancelText = 'Cancelar' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.35)' }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
        <p className="text-sm text-gray-600 mb-6 whitespace-pre-line">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">{cancelText}</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700">{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL - PERFIL DE ESTUDIANTE
// ============================================================================
function StudentProfilePage() {
  const { folio } = useParams(); // Obtiene el folio del estudiante desde la URL
  const navigate = useNavigate();
  
  // ========================================================================
  // ESTADOS DEL COMPONENTE
  // ========================================================================
  const [isEditing, setIsEditing] = useState(false); // Controla si está en modo edición
  const [isLoading, setIsLoading] = useState(false); // Loading para operaciones de guardado
  const [isLoadingStudent, setIsLoadingStudent] = useState(true); // Loading para cargar datos
  
  // ESTRUCTURA DE DATOS DEL ESTUDIANTE
  // TODO BACKEND: Esta estructura debe coincidir con la respuesta de tu API
  const [formData, setFormData] = useState({
    // Información General
    nombres: '',
    apellidos: '',
    folio: '',
    fechaRegistro: '',
    
    // Información Personal y Contacto
    personal: {
      email: '',
      phoneNumber: '',
      municipio: '',
      tutorName: '',
      tutorPhoneNumber: ''
    },
    
    // Información Académica
    academic: {
      nivelAcademico: '',
      gradoSemestre: '',
      bachillerato: '',
  postulaciones: '',
      universityOption: ''
    },
    
    // Información del Curso
    course: {
      curso: '',
  turno: 'VESPERTINO',
  modality: 'Presencial',
      advisor: '',
      group: ''
    },
    
    // Información de Salud
    health: {
      tipoAlergia: '',
      discapacidadTranstorno: '',
  orientacionVocacional: '',
  alergiaDetalle: '',
  discapacidadDetalle: ''
    },
    
    // Estado del Estudiante
    status: {
      estatus: 'Activo' // Valores: 'Activo', 'Inactivo', 'Suspendido'
    },
    
    // Expectativas
    expectations: {
      cambioQuiereLograr: '',
      comentarioEspera: ''
    },
    rawExtras: {
      comunidad2: '',
      alergia2: '',
      discapacidad2: '',
      universidades2: '',
      plan: '',
      anio: '',
      verificacion: '',
      created_at: ''
    }
  });
  
  const [originalData, setOriginalData] = useState({}); // Backup para cancelar cambios
  const [student, setStudent] = useState(null); // Datos del estudiante
  const [error, setError] = useState(null); // Errores de la aplicación
  const [activeTab, setActiveTab] = useState('general'); // Tab actualmente activo
  const [backendStatus, setBackendStatus] = useState({ available: null, message: '' });

  // Estados para notificaciones y modales
  const [notification, setNotification] = useState({
    isVisible: false,
    message: '',
    type: 'success'
  });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const [saveConfirmModal, setSaveConfirmModal] = useState(false);

  // Folio mostrado con formato: M + CURSO + (año siguiente 2 dígitos) + '-' + número folio con 4 dígitos
  const displayFolio = useMemo(() => {
    const raw = formData.folio;
    if (!raw) return '';
    // Curso elegido (puede venir en formData.course.curso o directamente en student.curso)
    const course = formData?.course?.curso || student?.curso || '';
    // Año: siempre un año adelantado respecto al año actual (dos dígitos)
    const nextYear = ((new Date().getFullYear() + 1) % 100).toString().padStart(2, '0');
    // Parte numérica del folio (se asume que formData.folio es un número incremental)
    const numPart = String(raw).replace(/\D/g, '').padStart(4, '0');
    if (!course) return `M${nextYear}-${numPart}`; // fallback si aún no hay curso
    return `M${course}${nextYear}-${numPart}`;
  }, [formData.folio, formData?.course?.curso, student?.curso]);

  // ========================================================================
  // FUNCIONES DE UTILIDAD
  // ========================================================================
  
  // Función para mostrar notificaciones
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({
      isVisible: true,
      message: message,
      type: type
    });
  }, []);

  // Función para cerrar notificaciones
  const closeNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  }, []);

  const {
    updateStudent,
    deleteStudent,
    updateStudentStatus,
  } = useAdminContext();

  const loadStudentData = async () => {
    setIsLoadingStudent(true);
    setError(null);
    
    try {
      // Validar que el folio existe
      if (!folio || folio.trim() === '') {
        setError('Folio de estudiante no válido');
        return;
      }

      // 🔄 CONEXIÓN API - PASO 1: Cambiar esta línea para usar la API real
      // Reemplazar: const response = await studentService.getStudent(folio);
      // Por: const response = await fetch(`/api/students/${folio}`);
      // Y luego: const data = await response.json();
      const response = await studentService.getStudent(folio);
      
      if (response.success && response.data) {
        setStudent(response.data);
        
        // 🔄 CONEXIÓN API - PASO 2: Eliminar esta condición cuando uses API real
        if (response.isSimulated) {
          showNotification(`⚠️ ${response.message}`, 'warning');
        }
      } else {
        setError(response.message || 'Error al cargar los datos del estudiante');
      }
    } catch (err) {
      console.error('Error al cargar estudiante:', err);
      setError('Error de conexión - Revisa tu conexión a internet');
    } finally {
      setIsLoadingStudent(false);
    }
  };

  useEffect(() => {
    if (folio) {
      loadStudentData();
      checkBackendConnection();
    } else {
      setError('No se especificó un folio de estudiante válido');
      setIsLoadingStudent(false);
    }
  }, [folio]);

  const checkBackendConnection = async () => {
    try {
      // 🔄 CONEXIÓN API - PASO 3: Cambiar esta línea para verificar conexión real
      // Reemplazar: const status = await studentService.checkBackendStatus();
      // Por: const response = await fetch('/api/health');
      // Y luego: const status = await response.json();
      const status = await studentService.checkBackendStatus();
      setBackendStatus(status);
    } catch (error) {
      setBackendStatus({ 
        available: false, 
        message: 'Error al verificar conexión con el servidor' 
      });
    }
  };

  const getNestedValue = (obj, path) => {
    const value = path.split('.').reduce((acc, part) => acc && acc[part], obj);
    return value !== undefined ? value : '';
  };

  // Normaliza turno/grupo a los valores enumerados usados en el select
  const mapTurnoLabel = (valor) => {
    if (!valor) return 'VESPERTINO'; // default global
    const raw = String(valor).trim();
    const upper = raw.toUpperCase();
    // Si ya es un valor válido, devolverlo
    if (['VESPERTINO','MATUTINO','SABATINO'].includes(upper)) return upper;
    // Mapear códigos y variantes
    if (upper.startsWith('V')) return 'VESPERTINO'; // V, V1, V2, VESPERTINO 1, etc.
    if (upper.startsWith('M')) return 'MATUTINO';   // M, M1, M2, MATUTINO 1, etc.
    if (upper.startsWith('S')) return 'SABATINO';   // S, S1, SAB, SABATINO
    return 'VESPERTINO';
  };

  // =============================
  // Mapeo robusto backend -> formData (unifica llaves distintas)
  // =============================
  const mapBackendStudentToFormData = useCallback((st) => {
    if (!st) return null;

    // Helper para obtener el primer valor no vacío (string con algo más que espacios)
    const pickFirstNonEmpty = (...vals) => {
      for (const v of vals) {
        if (v !== undefined && v !== null && String(v).trim() !== '') return v;
      }
      return '';
    };

    // Normalizar fecha (si viene ISO cortar día)
    const fechaRegistro = st.fechaRegistro || st.created_at || st.createdAt || '';
    const fechaNormalizada = typeof fechaRegistro === 'string' && fechaRegistro.includes('T')
      ? fechaRegistro.split('T')[0]
      : fechaRegistro;

    const result = {
      nombres: st.nombres || st.nombre || '',
      apellidos: st.apellidos || st.apellido || '',
      folio: st.folio || st.id || '',
      fechaRegistro: fechaNormalizada,
      personal: {
        email: st.correoElectronico || st.email || st.personalEmail || '',
        municipio: st.municipioComunidad || st.comunidad1 || st.municipio || st.localidad || '',
        tutorName: st.nombreTutor || st.tutorNombre || st.nombre_tutor || '',
        phoneNumber: st.telefonoAlumno || st.telefono || st.phoneNumber || '',
        tutorPhoneNumber: st.telefonoTutor || st.tel_tutor || st.tutorPhone || '',
      },
      academic: {
        nivelAcademico: pickFirstNonEmpty(st.academia, st.nivelAcademico, st.academico1, st.estudios, st.nivel),
        gradoSemestre: pickFirstNonEmpty(st.gradoSemestre, st.semestre, st.grado),
        // Bachillerato: academico2 -> bachillerato -> institucion -> preparatoria -> nivelAcademico -> academico1
        bachillerato: pickFirstNonEmpty(st.academico2, st.bachillerato, st.institucion, st.preparatoria, st.nivelAcademico, st.academico1),
  postulaciones: pickFirstNonEmpty(st.postulaciones, st.postulacion, st.licenciaturaPostula, st.orientacionVocacional, st.orientacion, st.carreraInteres),
  universityOption: pickFirstNonEmpty(st.universidadesPostula, st.universidades1, st.universidades2, st.universityOption)
      },
      course: {
        curso: st.curso || st.course || '',
        turno: mapTurnoLabel(st.turno || st.turnoCodigo || st.shift || ''),
        advisor: st.asesor || st.advisor || st.asesorAsignado || '',
        group: st.grupo || st.group || st.grupoAsignado || '',
  modality: st.modalidad || st.modality || st.modalidadCurso || 'Presencial',
  academia: st.academia || 'MQerKAcademy',
      },
      health: {
        tipoAlergia: st.tipoAlergia || st.alergia || '',
        discapacidadTranstorno: st.discapacidadTranstorno || st.discapacidad || st.trastorno || '',
        orientacionVocacional: st.orientacionVocacional || st.testVocacional || '',
  alergiaDetalle: st.alergia2 || '',
  discapacidadDetalle: st.discapacidad2 || '',
      },
      expectations: {
        cambioQuiereLograr: st.cambioQuiereLograr || st.metaPrincipal || '',
        comentarioEspera: st.comentarioEspera || st.expectativa || '',
      },
      status: {
        estatus: st.estatus || st.status || 'Activo'
      },
      rawExtras: {
        comunidad2: st.comunidad2 || '',
        alergia2: st.alergia2 || '',
        discapacidad2: st.discapacidad2 || '',
  // Detalles derivados (solo locales para UI)
  alergiaDetalle: st.alergia2 || '',
  discapacidadDetalle: st.discapacidad2 || '',
        universidades2: st.universidades2 || '',
  plan: st.plan || '',
  academia: st.academia || '',
        anio: st.anio || '',
        verificacion: st.verificacion ?? '',
        created_at: st.created_at || fechaNormalizada || ''
      }
    };

    if (!result.academic.nivelAcademico && result.academic.bachillerato) {
      result.academic.nivelAcademico = 'Preparatoria';
    }
    if (result.course.modality) {
      const mod = String(result.course.modality).toLowerCase();
      if (mod === 'presencial' || mod === 'virtual') {
        result.course.modality = mod.charAt(0).toUpperCase() + mod.slice(1);
      }
    }
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[MAP ADMIN] bachillerato origen/actual ->', {
        academico2: st.academico2,
        bachilleratoNorm: st.bachillerato,
        academico1: st.academico1,
        resultado: result.academic.bachillerato
      });
    }
    return result;
  }, []);

  // Populate formData when student changes using unified mapping
  useEffect(() => {
    if (!student) return;
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[ADMIN PAGE] student recibido:', student);
    }
    let mapped = mapBackendStudentToFormData(student);
    // Fallback extra: si mapping salió vacío pero student ya está normalizado desde service
    if (mapped && (!mapped.academic.bachillerato || !mapped.academic.nivelAcademico)) {
      if (!mapped.academic.bachillerato && (student.academico2 || student.bachillerato)) {
        mapped.academic.bachillerato = student.academico2 || student.bachillerato;
      }
      if (!mapped.academic.nivelAcademico && (student.academico1 || student.nivelAcademico)) {
        mapped.academic.nivelAcademico = student.academico1 || student.nivelAcademico;
      }
      if (!mapped.academic.gradoSemestre && (student.semestre || student.gradoSemestre)) {
        mapped.academic.gradoSemestre = student.semestre || student.gradoSemestre;
      }
    }
    if (mapped) {
      setFormData(mapped);
      setOriginalData(mapped);
    }
  }, [student, mapBackendStudentToFormData]);

  const formatPhoneNumber = (value) => {
    const cleaned = (value || '').replace(/\D/g, '').slice(0,10);
    const len = cleaned.length;
    if (len === 0) return '';
    if (len < 4) return `(${cleaned}`; // empieza paréntesis
    if (len < 7) return `(${cleaned.slice(0,3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
  };

  const handleInputChange = (field, value) => {
    let processedValue = value;

    if (field === 'personal.phoneNumber' || field === 'personal.tutorPhoneNumber') {
      processedValue = formatPhoneNumber(value);
    } else if (field === 'academic.gradoSemestre') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue === '' || (parseInt(numericValue, 10) >= 1 && parseInt(numericValue, 10) <= 12)) {
        processedValue = numericValue;
      } else {
        return;
      }
    }

    setFormData(prev => {
      const keys = field.split('.');
      if (keys.length === 1) {
        return { ...prev, [field]: processedValue };
      }
      
      const newData = { ...prev };
      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = processedValue;
      return newData;
    });
  };

  // =============================
  // Cambio de foto del estudiante
  // =============================
  const fileInputRef = useRef(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const triggerPhotoSelect = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handlePhotoSelected = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setNotification({ type: 'error', message: 'La imagen excede 2MB' });
      return;
    }
    setIsUploadingPhoto(true);
    try {
      // Necesitamos el id real del estudiante
      if (!student?.id) throw new Error('ID estudiante no disponible');
      const formDataFd = new FormData();
      formDataFd.append('foto', file);
      const apiBase = (api?.defaults?.baseURL || '').replace(/\/api\/?$/, '');
      // Usar axios instancia si existe, si no fetch
      if (api && api.put) {
        await api.put(`/estudiantes/${student.id}/foto`, formDataFd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await fetch(`/api/estudiantes/${student.id}/foto`, { method: 'PUT', body: formDataFd });
      }
      // Refrescar estudiante
      await loadStudentData(true);
      setNotification({ type: 'success', message: 'Foto actualizada' });
    } catch (err) {
      console.error('Error subiendo foto:', err);
      setNotification({ type: 'error', message: 'No se pudo actualizar la foto' });
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.nombres?.trim()) errors.push('Nombres es requerido');
    if (!formData.apellidos?.trim()) errors.push('Apellidos es requerido');
    if (!formData.personal?.email?.trim()) errors.push('Correo electrónico es requerido');
    if (formData.personal?.email && !validateEmail(formData.personal.email)) {
      errors.push('Formato de correo electrónico inválido');
    }
    if (formData.personal?.phoneNumber && formData.personal.phoneNumber.replace(/\D/g, '').length < 10) {
      errors.push('Número de teléfono del alumno incompleto');
    }
    if (formData.personal?.tutorPhoneNumber && formData.personal.tutorPhoneNumber.replace(/\D/g, '').length < 10) {
      errors.push('Número de teléfono del tutor incompleto');
    }
    return errors;
  };

  const handleSave = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      showNotification(`❌ Errores: ${validationErrors.join(', ')}`, 'error');
      return;
    }

    setIsLoading(true);
    try {
      const updateData = {
        nombres: formData.nombres.trim(),
        apellidos: formData.apellidos.trim(),
        correoElectronico: formData.personal.email.trim().toLowerCase(),
        telefonoAlumno: formData.personal.phoneNumber?.replace(/\D/g, '') || '',
        municipioComunidad: formData.personal.municipio?.trim() || '',
        nombreTutor: formData.personal.tutorName?.trim() || '',
        telefonoTutor: formData.personal.tutorPhoneNumber?.replace(/\D/g, '') || '',
        nivelAcademico: formData.academic.nivelAcademico || '',
  academia: formData.academic.nivelAcademico || '',
        gradoSemestre: formData.academic.gradoSemestre || '',
        bachillerato: formData.academic.bachillerato?.trim() || '',
  universidadesPostula: formData.academic.universityOption?.trim() || '',
  postulaciones: formData.academic.postulaciones?.trim() || '',
        curso: formData.course.curso || '',
        turno: formData.course.turno || '',
        asesor: formData.course.advisor?.trim() || '',
        grupo: formData.course.group?.trim() || '',
  modalidad: formData.course.modality || 'Presencial',
        tipoAlergia: formData.health.tipoAlergia?.trim() || '',
        alergiaDetalle: formData.health.tipoAlergia && formData.health.tipoAlergia.toLowerCase() !== 'no'
          ? formData.health.alergiaDetalle?.trim() || ''
          : '',
        discapacidadTranstorno: formData.health.discapacidadTranstorno?.trim() || '',
        discapacidadDetalle: formData.health.discapacidadTranstorno && formData.health.discapacidadTranstorno.toLowerCase() !== 'no'
          ? formData.health.discapacidadDetalle?.trim() || ''
          : '',
        orientacionVocacional: formData.health.orientacionVocacional || '',
        cambioQuiereLograr: formData.expectations.cambioQuiereLograr?.trim() || '',
        comentarioEspera: formData.expectations.comentarioEspera?.trim() || '',
        estatus: formData.status.estatus
      };

    
      const response = await studentService.updateStudent(student.folio, updateData);
      
      if (response.success) {
        const updatedStudent = { ...student, ...updateData };
        setStudent(updatedStudent);
        setIsEditing(false);
        setOriginalData(formData);
        setSaveConfirmModal(true); // Mostrar modal de confirmación
      } else {
        showNotification(`❌ ${response.message || 'Error al actualizar la información'}`, 'error');
      }
    } catch (error) {
      console.error('Error al actualizar estudiante:', error);
      showNotification('❌ Error de conexión al actualizar la información', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
  };

  const handleStatusChange = async (newStatus) => {
    setIsLoading(true);
    try {
    
      const response = await studentService.updateStatus(student.folio, newStatus);
      
      if (response.success) {
        const updatedData = { ...formData, status: { ...formData.status, estatus: newStatus } };
        setFormData(updatedData);
        setOriginalData(updatedData);
        setStudent({ ...student, estatus: newStatus });
        
        // 🔄 CONEXIÓN API - PASO 6: Simplificar mensajes cuando uses API real
        const message = response.isSimulated 
          ? `⚠️ ${response.message}` 
          : `✅ Estudiante marcado como ${newStatus.toLowerCase()}`;
        const type = response.isSimulated ? 'warning' : 'success';
        
        showNotification(message, type);
      } else {
        showNotification(`❌ ${response.message || 'Error al cambiar el estatus'}`, 'error');
      }
    } catch (error) {
      console.error('Error al cambiar estatus:', error);
      showNotification('❌ Error de conexión al cambiar el estatus', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Confirmar Eliminación',
      message: '¿Estás seguro de que quieres eliminar este estudiante? Esta acción es irreversible.',
      onConfirm: async () => {
        setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} });
        
        try {
          
          const response = await studentService.deleteStudent(student.folio);
          
          if (response.success) {
            // 🔄 CONEXIÓN API - PASO 8: Simplificar mensajes cuando uses API real
            const message = response.isSimulated 
              ? `⚠️ ${response.message}` 
              : '✅ Estudiante eliminado exitosamente';
            const type = response.isSimulated ? 'warning' : 'success';
            
            showNotification(message, type);
            setTimeout(() => navigate(-1), 2000);
          } else {
            showNotification(`❌ ${response.message || 'Error al eliminar el estudiante'}`, 'error');
          }
        } catch (error) {
          console.error('Error al eliminar:', error);
          showNotification('❌ Error de conexión al eliminar el estudiante', 'error');
        }
      }
    });
  };

  if (isLoadingStudent) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Cargando perfil del estudiante...</p>
        </div>
      </div>
    );
  }

  if (error && !student) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Error al cargar estudiante</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Volver a Lista
            </button>
            <button 
              onClick={loadStudentData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return null;
  }

  const tabs = [
    {
      id: 'general',
      label: '📋 Información General',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      id: 'academic',
      label: '🎓 Datos Académicos',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      id: 'course',
      label: '📚 Información del Curso',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      id: 'health',
      label: '🏥 Salud y Bienestar',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    },
    {
      id: 'expectations',
      label: '🎯 Objetivos y Expectativas',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
  }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Sección Superior: Foto y Datos Básicos */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-300 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  Información General del Estudiante
                </h3>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Foto del estudiante */}
                  <div className="lg:col-span-4 flex flex-col items-center space-y-4">
                    <div className="relative">
                      <img
                        src={student?.fotoAbs || defaultStudentPhoto}
                        alt={`Foto de ${formData.nombres} ${formData.apellidos}`}
                        className="w-48 h-48 object-cover rounded-full border-4 border-gray-200 shadow-lg"
                      />
                      <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    
                    <div className="text-center space-y-1">
                      <p className="text-lg font-semibold text-gray-900">{formData.nombres} {formData.apellidos}</p>
                      <p className="text-sm text-gray-600">Folio: {displayFolio}</p>
                      <p className="text-sm text-gray-600">Registrado: {formData.fechaRegistro}</p>
                    </div>
                    
                    {isEditing && (
                      <div className="w-full max-w-xs">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png"
                          className="hidden"
                          onChange={handlePhotoSelected}
                        />
                        <button
                          type="button"
                          disabled={isUploadingPhoto}
                          onClick={triggerPhotoSelect}
                          className="w-full px-4 py-2 bg-blue-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center"
                        >
                          {isUploadingPhoto && (
                            <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                            </svg>
                          )}
                          {isUploadingPhoto ? 'Subiendo...' : 'Cambiar Foto'}
                        </button>
                        <p className="text-xs text-gray-400 text-center mt-2">JPG, PNG (Máx. 2MB)</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Datos básicos */}
                  <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 border-b border-gray-200 pb-3 mb-3">
                      <h4 className="text-md font-medium text-gray-800 flex items-center">
                        <svg className="w-4 h-4 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                        </svg>
                        Datos de Identificación
                      </h4>
                    </div>
                    
                    <InputField 
                      label="Nombres" 
                      field="nombres" 
                      value={formData.nombres || ''} 
                      onChange={handleInputChange} 
                      maxLength={50} 
                      isRequired={true} 
                      disabled={!isEditing} 
                    />
                    
                    <InputField 
                      label="Apellidos" 
                      field="apellidos" 
                      value={formData.apellidos || ''} 
                      onChange={handleInputChange} 
                      maxLength={50} 
                      isRequired={true} 
                      disabled={!isEditing} 
                    />
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">Folio</label>
                      <input
                        type="text"
                        value={displayFolio}
                        disabled={true}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-50 cursor-not-allowed text-sm"
                        title={formData.folio ? `Folio interno: ${formData.folio}` : ''}
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">Fecha de Registro</label>
                      <input
                        type="text"
                        value={formData.fechaRegistro || ''}
                        disabled={true}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-50 cursor-not-allowed text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección: Información de Contacto */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg border border-gray-300 overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    Datos de Contacto del Estudiante
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <InputField 
                    label="Correo Electrónico" 
                    field="personal.email" 
                    value={getNestedValue(formData, 'personal.email')} 
                    onChange={handleInputChange} 
                    type="email" 
                    isRequired={true} 
                    disabled={!isEditing} 
                  />
                  <InputField 
                    label="Teléfono del Alumno" 
                    field="personal.phoneNumber" 
                    value={getNestedValue(formData, 'personal.phoneNumber')} 
                    onChange={handleInputChange} 
                    type="tel" 
                    helpText="Formato: (555) 123-4567" 
                    disabled={!isEditing} 
                  />
                  <InputField 
                    label="Municipio/Comunidad" 
                    field="personal.municipio" 
                    value={getNestedValue(formData, 'personal.municipio')} 
                    onChange={handleInputChange} 
                    maxLength={50} 
                    disabled={!isEditing} 
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-gray-300 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    Información del Tutor/Responsable
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <InputField 
                    label="Nombre del Tutor" 
                    field="personal.tutorName" 
                    value={getNestedValue(formData, 'personal.tutorName')} 
                    onChange={handleInputChange} 
                    maxLength={50} 
                    disabled={!isEditing} 
                  />
                  <InputField 
                    label="Teléfono del Tutor" 
                    field="personal.tutorPhoneNumber" 
                    value={getNestedValue(formData, 'personal.tutorPhoneNumber')} 
                    onChange={handleInputChange} 
                    type="tel" 
                    helpText="Formato: (555) 123-4567" 
                    disabled={!isEditing} 
                  />
                  
                  {/* Información adicional del tutor */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Información del Tutor</p>
                        <p className="text-xs text-gray-500 mt-1">
                          El tutor es la persona responsable del estudiante y será contactada en caso de emergencias o para información académica importante.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'academic':
        return (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Sección: Nivel Educativo Actual */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-300 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                  </div>
                  Nivel Educativo Actual
                </h3>
              </div>
              <div className="p-6">
                {/* Ajuste: usar siempre 2 columnas en pantallas medianas y grandes para que los campos tengan el mismo ancho y no quede una tercera columna vacía */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Campo Academia removido a solicitud; valor sigue disponible en formData.academic.nivelAcademico si se necesita mostrar en otra sección */}
                  
                  <InputField 
                    label="Grado/Semestre" 
                    field="academic.gradoSemestre" 
                    value={getNestedValue(formData, 'academic.gradoSemestre')} 
                    onChange={handleInputChange} 
                    maxLength={30}
                    disabled={!isEditing} 
                  />
                  
                  <InputField 
                    label="Bachillerato Actual" 
                    field="academic.bachillerato" 
                    value={getNestedValue(formData, 'academic.bachillerato')} 
                    onChange={handleInputChange} 
                    maxLength={100} 
                    disabled={!isEditing} 
                  />
                </div>
              </div>
            </div>

            {/* Sección: Aspiraciones Académicas */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-300 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  Aspiraciones Académicas y Profesionales
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <InputField
                    label="Licenciatura a Postular"
                    field="academic.postulaciones"
                    value={getNestedValue(formData, 'academic.postulaciones')}
                    onChange={handleInputChange}
                    maxLength={150}
                    disabled={!isEditing}
                  />
                  <InputField 
                    label="Universidades a Postular" 
                    field="academic.universityOption" 
                    value={getNestedValue(formData, 'academic.universityOption')} 
                    onChange={handleInputChange} 
                    maxLength={100} 
                    disabled={!isEditing} 
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'course':
        return (
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg border border-gray-300 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  Información del Curso y Asignaciones
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* Fila 1 */}
                  <div>
                    <InputField 
                      label="Academia" 
                      field="course.academia" 
                      value={getNestedValue(formData, 'course.academia') || 'MQerKAcademy'} 
                      onChange={handleInputChange} 
                      disabled={true} 
                    />
                  </div>
                  <div>
                    <InputField 
                      label="Curso" 
                      field="course.curso" 
                      value={getNestedValue(formData, 'course.curso')} 
                      onChange={handleInputChange} 
                      options={[
                        { value: '', label: 'Seleccionar...' }, 
                        { value: 'EEAU', label: 'EEAU' }, 
                        { value: 'EEAP', label: 'EEAP' }
                      ]} 
                      disabled={!isEditing} 
                    />
                  </div>
                  <div>
                    <InputField 
                      label="Modalidad" 
                      field="course.modality" 
                      value={getNestedValue(formData, 'course.modality') || 'Presencial'} 
                      onChange={handleInputChange} 
                      options={[
                        { value: 'Presencial', label: 'Presencial' }, 
                        { value: 'Virtual', label: 'Virtual' }
                      ]} 
                      disabled={!isEditing} 
                    />
                  </div>
                  {/* Fila 2 */}
                  <div>
                    <InputField 
                      label="Turno" 
                      field="course.turno" 
                      value={getNestedValue(formData, 'course.turno')} 
                      onChange={handleInputChange} 
                      options={[
                        { value: '', label: 'Seleccionar...' }, 
                        { value: 'VESPERTINO', label: 'VESPERTINO' }, 
                        { value: 'MATUTINO', label: 'MATUTINO' },
                        { value: 'SABATINO', label: 'SABATINO' }
                      ]} 
                      disabled={!isEditing} 
                    />
                  </div>
                  <div>
                    <InputField 
                      label="Grupo" 
                      field="course.group" 
                      value={getNestedValue(formData, 'course.group')} 
                      onChange={handleInputChange} 
                      maxLength={20} 
                      disabled={!isEditing} 
                    />
                  </div>
                  <div className="xl:col-span-1 md:col-span-2">
                    <InputField 
                      label="Asesor Asignado" 
                      field="course.advisor" 
                      value={getNestedValue(formData, 'course.advisor')} 
                      onChange={handleInputChange} 
                      maxLength={50} 
                      disabled={!isEditing} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'health':
        return (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Sección: Información Médica */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-300 overflow-hidden">
              <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  Información Médica y de Salud
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
                  <div className="space-y-4">
                    <InputField
                      label="¿Presenta alguna alergia?"
                      field="health.tipoAlergia"
                      value={getNestedValue(formData, 'health.tipoAlergia')}
                      onChange={(e) => {
                        handleInputChange(e);
                        if (e.target.value.toLowerCase() === 'no') {
                          setFormData(prev => ({
                            ...prev,
                            health: { ...prev.health, alergiaDetalle: '' }
                          }));
                        }
                      }}
                      options={[
                        { value: 'No', label: 'No' },
                        { value: 'Si', label: 'Sí' }
                      ]}
                      disabled={!isEditing}
                    />
                    {formData.health.tipoAlergia && formData.health.tipoAlergia.toLowerCase() !== 'no' && (
                      <InputField
                        label="Detalle de la alergia"
                        field="health.alergiaDetalle"
                        value={getNestedValue(formData, 'health.alergiaDetalle')}
                        onChange={handleInputChange}
                        maxLength={150}
                        disabled={!isEditing}
                      />
                    )}
                  </div>
                  <div className="space-y-4">
                    <InputField
                      label="¿Discapacidad o trastorno?"
                      field="health.discapacidadTranstorno"
                      value={getNestedValue(formData, 'health.discapacidadTranstorno')}
                      onChange={(e) => {
                        handleInputChange(e);
                        if (e.target.value.toLowerCase() === 'no') {
                          setFormData(prev => ({
                            ...prev,
                            health: { ...prev.health, discapacidadDetalle: '' }
                          }));
                        }
                      }}
                      options={[
                        { value: 'No', label: 'No' },
                        { value: 'Si', label: 'Sí' }
                      ]}
                      disabled={!isEditing}
                    />
                    {formData.health.discapacidadTranstorno && formData.health.discapacidadTranstorno.toLowerCase() !== 'no' && (
                      <InputField
                        label="Detalle discapacidad / trastorno"
                        field="health.discapacidadDetalle"
                        value={getNestedValue(formData, 'health.discapacidadDetalle')}
                        onChange={handleInputChange}
                        maxLength={180}
                        disabled={!isEditing}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-300 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  Estado del Estudiante
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <div className="lg:col-span-1">
                    <InputField 
                      label="Estatus Actual" 
                      field="status.estatus" 
                      value={getNestedValue(formData, 'status.estatus')} 
                      onChange={handleInputChange} 
                      options={[
                        { value: 'Activo', label: '✅ Activo' }, 
                        { value: 'Inactivo', label: '⏸️ Inactivo' }, 
                        { value: 'Suspendido', label: '❌ Suspendido' }
                      ]} 
                      disabled={!isEditing} 
                    />
                  </div>
                  {!isEditing && (
                    <div className="lg:col-span-2 space-y-3">
                      <p className="text-sm font-medium text-gray-700 mb-3">Acciones Rápidas:</p>
                      <div className="flex flex-wrap gap-3">
                        {getNestedValue(formData, 'status.estatus') !== 'Activo' && (
                          <button 
                            onClick={() => handleStatusChange('Activo')} 
                            disabled={isLoading} 
                            className="flex-1 min-w-[120px] inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 transition-all duration-200 disabled:opacity-50"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Activar
                          </button>
                        )}
                        {getNestedValue(formData, 'status.estatus') !== 'Inactivo' && (
                          <button 
                            onClick={() => handleStatusChange('Inactivo')} 
                            disabled={isLoading} 
                            className="flex-1 min-w-[120px] inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg text-yellow-700 bg-yellow-50 border border-yellow-200 hover:bg-yellow-100 transition-all duration-200 disabled:opacity-50"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Inactivar
                          </button>
                        )}
                        {getNestedValue(formData, 'status.estatus') !== 'Suspendido' && (
                          <button 
                            onClick={() => handleStatusChange('Suspendido')} 
                            disabled={isLoading} 
                            className="flex-1 min-w-[120px] inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 transition-all duration-200 disabled:opacity-50"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                            Suspender
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'expectations':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg border border-gray-300 overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  Objetivos y Expectativas del Estudiante
                </h3>
              </div>
              <div className="p-6 space-y-6">
                <InputField label="Cambio que Quiere Lograr" field="expectations.cambioQuiereLograr" value={getNestedValue(formData, 'expectations.cambioQuiereLograr')} onChange={handleInputChange} type="textarea" maxLength={500} disabled={!isEditing} />
                <InputField label="Comentario/Expectativa" field="expectations.comentarioEspera" value={getNestedValue(formData, 'expectations.comentarioEspera')} onChange={handleInputChange} type="textarea" maxLength={500} disabled={!isEditing} />
              </div>
            </div>
          </div>
        );


      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white py-4 sm:py-8">
      <CustomNotification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={closeNotification}
      />


      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} })}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      {/* Modal de confirmación de guardado - diseño mejorado */}
      {saveConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background: 'rgba(255, 255, 255, 0.63)', backdropFilter: 'blur(2px)'}}>
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center border-t-4 border-green-500">
            <div className="flex flex-col items-center justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-2">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-green-700 mb-1">Cambios guardados</h2>
              <p className="text-gray-600 mb-2">Los cambios se han guardado correctamente.</p>
            </div>
            <button
              onClick={() => setSaveConfirmModal(false)}
              className="mt-2 px-6 py-2 bg-green-600 text-white rounded-lg font-medium shadow hover:bg-green-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors self-start"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver a Lista
              </button>
              <div className="hidden sm:block h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  {formData.nombres} {formData.apellidos}
                  {isEditing && <span className="block sm:inline ml-0 sm:ml-3 mt-1 sm:mt-0 text-sm sm:text-lg text-blue-600">(Editando)</span>}
                </h1>
                <p className="text-sm sm:text-base text-gray-600">Folio: {displayFolio}</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(true);
                    }}
                    className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar Perfil
                  </button>
                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-md"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Eliminar
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center justify-center px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-400 transition-colors shadow-md"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-md disabled:opacity-50"
                  >
                    {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Navegación por pestañas */}
        <div className="mb-6">
          <div className="border-b border-gray-200 bg-white rounded-t-lg">
            <nav className="-mb-px flex space-x-8 px-6 py-3 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    whitespace-nowrap flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-all duration-200
                    ${activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600 bg-indigo-50 rounded-t-lg'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Contenido de las pestañas */}
        <div className="min-h-[400px]">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

export default StudentProfilePage;