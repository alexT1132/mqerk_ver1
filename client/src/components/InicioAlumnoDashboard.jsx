// BACKEND: Componente principal del dashboard de inicio para estudiantes
// Este componente maneja la pantalla de bienvenida y verificación de pago
// Requiere integración con endpoints de subida de archivos y verificación de estudiantes
import React, { useState, useEffect, useRef } from 'react';
import { User, Clock, BookOpen, TrendingUp, Upload, X, CheckCircle, Star, Calendar, GraduationCap, ChevronRight, AlertTriangle, Wifi, HelpCircle, Settings, ShieldCheck } from 'lucide-react';
import { useStudent } from '../context/StudentContext.jsx';
import { useNavigate } from 'react-router-dom';
import { AlumnoDashboardMetrics } from './Metrics_dash_alumnos_comp.jsx';

// BACKEND: Frases motivacionales que se muestran de forma rotativa diariamente
// Estas frases se pueden personalizar desde el backend o mantener como están
const motivationalPhrases = [
  "¡Hoy es un gran día para aprender algo nuevo!",
  "¡Sigue adelante, cada paso cuenta hacia tu éxito!",
  "¡Tu esfuerzo de hoy te acerca más a tus metas!",
  "¡Nunca dejes de intentarlo, eres más fuerte de lo que crees!",
  "¡Eres capaz de lograr grandes cosas extraordinarias!",
  "¡El conocimiento que adquieres hoy cambiará tu futuro!",
  "¡Cada desafío es una oportunidad para crecer!",
  "¡Tu perseverancia es tu mayor fortaleza!",
  "¡Hoy puede ser el día que marque la diferencia!",
  "¡Los sueños se alcanzan con dedicación y trabajo duro!",
  "¡Tu potencial no tiene límites, demuéstralo!",
  "¡Cada momento de estudio te hace más sabio!",
  "¡La excelencia es un hábito, cultívala día a día!",
  "¡Tu futuro brillante comienza con las acciones de hoy!",
  "¡Convierte tus obstáculos en escalones hacia el éxito!",
  "¡La educación es el arma más poderosa para cambiar el mundo!",
  "¡Tu determinación es la clave de tu triunfo!",
  "¡Cada día eres mejor versión de ti mismo!",
  "¡El éxito está construido sobre pequeñas victorias diarias!",
  "¡Cree en ti mismo, porque nosotros creemos en ti!",
  "¡Cada libro que lees te abre mil puertas nuevas!",
  "¡El fracaso es solo el primer intento de algo extraordinario!",
  "¡Tu mente es tu herramienta más poderosa, úsala sabiamente!",
  "¡Aprende hoy lo que te ayudará a brillar mañana!",
  "¡El aprendizaje nunca termina, siempre hay algo más que descubrir!",
  "¡Tus metas están más cerca de lo que imaginas!",
  "¡La constancia es el secreto de todos los grandes logros!",
  "¡Cada pregunta que haces te hace más inteligente!",
  "¡El camino del conocimiento es el más hermoso de todos!",
  "¡Hoy decides ser imparable en tu crecimiento personal!"
];

// BACKEND: Función para obtener el saludo según la hora del día
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return '¡Buenos días';
  if (hour < 19) return '¡Buenas tardes';
  return '¡Buenas noches';
};

// BACKEND: Función para obtener la frase motivacional del día
// Usa el día del año para rotar las frases de forma consistente
const getDailyPhrase = () => {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  return motivationalPhrases[dayOfYear % motivationalPhrases.length];
};

// BACKEND: Componente de partículas flotantes decorativas (sin integración requerida)
const FloatingParticles = () => {
  const particles = Array.from({ length: 15 }, (_, i) => (
    <div
      key={i}
      className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 3}s`,
        animationDuration: `${3 + Math.random() * 4}s`
      }}
    />
  ));
  return <div className="absolute inset-0 overflow-hidden pointer-events-none">{particles}</div>;
};

// BACKEND: Componente de progreso de carga para subida de archivos
const UploadProgress = ({ show, progress }) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white/95 backdrop-blur-lg p-8 rounded-3xl shadow-2xl max-w-sm w-full mx-4 border-4 border-green-200">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Upload className="text-green-600 animate-bounce" size={32} />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Subiendo archivo...</h3>
          <p className="text-gray-600">Por favor espera un momento</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-center text-gray-700 font-semibold">{progress}%</p>
      </div>
    </div>
  );
};

// BACKEND: Componente para mostrar mensaje de sección en desarrollo
// Se puede usar para secciones que aún no están implementadas
const SectionPlaceholder = ({ sectionName }) => {
  return (
    <div className="max-w-4xl mx-auto text-center">
      <div className="bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-indigo-500/20 backdrop-blur-lg rounded-3xl p-12 border border-purple-300/30 shadow-xl">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full p-6 w-fit mx-auto">
            <Settings className="text-white" size={48} />
          </div>
        </div>
        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 mb-6">
          {sectionName}
        </h2>
        <p className="text-xl text-purple-100 font-semibold mb-8">
          Esta sección está en desarrollo y estará disponible pronto.
        </p>
        <div className="text-6xl mb-6">🚧</div>
        <p className="text-lg text-purple-200">
          Mientras tanto, puedes explorar las otras secciones disponibles.
        </p>
      </div>
    </div>
  );
};

/**
 * INTEGRACIÓN BACKEND: Componente principal del dashboard de inicio del alumno
 * 
 * Props esperadas del backend:
 * - alumno: string (nombre completo del estudiante)
 * - matricula: string (número de matrícula)
 * - verificado: boolean (si el estudiante está verificado)
 * - haPagado: boolean (si el estudiante ha realizado el pago)
 * - onComprobanteSubido: function (callback cuando se sube un comprobante)
 * 
 * Contextos requeridos:
 * - StudentContext: datos del estudiante, verificación, curso actual
 * - Funciones del contexto que debe implementar el backend:
 *   - isVerified, hasPaid, currentCourse, isFirstAccess, studentData
 *   - simulateVerification(), resetStudentState(), clearCourse()
 */
const InicioAlumnoDashboard = ({ 
  alumno, 
  matricula, 
  verificado, 
  haPagado, 
  onComprobanteSubido 
}) => {
  // BACKEND: Obtener datos del contexto del estudiante
  const { 
    isVerified, 
    hasPaid, 
    currentCourse, 
    isFirstAccess, 
    studentData, 
    activeSection,
    simulateVerification,
    resetStudentState,
    clearCourse,
    forceCompleteReset,
    goToWelcome
  } = useStudent();
  const navigate = useNavigate();
  
  // BACKEND: Combinar datos de props con datos del contexto
  // Priorizar props si existen, sino usar datos del contexto
  const finalVerificado = verificado !== undefined ? verificado : isVerified;
  const finalHaPagado = haPagado !== undefined ? haPagado : hasPaid;
  const finalAlumno = alumno || studentData.name || "XXXX";
  const finalMatricula = matricula || studentData.matricula || "XXXX";

  // Estados locales
  const [frase, setFrase] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDestello, setShowDestello] = useState(false);
  const [comprobante, setComprobante] = useState(null);
  const [mensajeVerificacion, setMensajeVerificacion] = useState("");
  const [showStats, setShowStats] = useState(false);
  const [sliderX, setSliderX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadProgress, setShowUploadProgress] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showTip, setShowTip] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('default');
  const [elementsVisible, setElementsVisible] = useState(false);
  const [hora, setHora] = useState(new Date());
  const [clockPulse, setClockPulse] = useState(false);
  
  const audioRef = useRef(null);
  const sliderRef = useRef(null);
  const fileInputRef = useRef(null);
  const circleSize = 48;
  const sliderWidth = 280;

  // BACKEND: Redirigir automáticamente solo si se acaba de verificar
  // Esto ocurre cuando el estudiante está verificado y pagado, pero no es primer acceso
  useEffect(() => {
    const shouldRedirect = finalVerificado && 
                          finalHaPagado && 
                          !isFirstAccess && 
                          !currentCourse &&
                          !window.location.search.includes('direct=true');
    
    if (shouldRedirect) {
      const timer = setTimeout(() => {
        navigate('/alumno/cursos');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [finalVerificado, finalHaPagado, isFirstAccess, currentCourse, navigate]);

  // Animación de entrada
  useEffect(() => {
    setTimeout(() => setElementsVisible(true), 200);
  }, []);

  useEffect(() => {
    setFrase(getDailyPhrase());
  }, []);

  // Reloj en tiempo real con efecto de "respiración"
  useEffect(() => {
    const timer = setInterval(() => {
      setHora(new Date());
      setClockPulse(true);
      setTimeout(() => setClockPulse(false), 200);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Seguimiento del mouse para sombras dinámicas
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Estado de conexión
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // BACKEND: Función para manejar la subida de comprobantes de pago
  // Esta función debe conectarse con el endpoint del backend para procesar archivos
  const handleSubirComprobante = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setShowUploadProgress(true);
      setUploadProgress(0);
      
      // BACKEND: Aquí debe ir la llamada real a la API
      // Ejemplo:
      // try {
      //   const formData = new FormData();
      //   formData.append('comprobante', file);
      //   formData.append('studentId', studentData.id);
      //   
      //   const response = await fetch('/api/student/upload-payment-proof', {
      //     method: 'POST',
      //     headers: {
      //       'Authorization': `Bearer ${localStorage.getItem('token')}`
      //     },
      //     body: formData
      //   });
      //   
      //   if (response.ok) {
      //     // Procesar respuesta exitosa
      //   }
      // } catch (error) {
      //   // Manejar errores
      // }
      
      // Simulación temporal - ELIMINAR cuando se conecte el backend
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setShowUploadProgress(false);
              setComprobante(file);
              setShowDestello(true);
              setMensajeVerificacion("¡Comprobante recibido! Tu verificación está en proceso. En un máximo de 24 horas podrás acceder a la plataforma completa.");
              
              // Efectos de feedback
              if ('vibrate' in navigator) {
                navigator.vibrate([200, 100, 200]);
              }
              
              // Sonido de éxito (opcional)
              try {
                const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiS2PLNFCIF');
                audio.volume = 0.3;
                audio.play().catch(() => {});
              } catch (e) {}
              
              setTimeout(() => setShowDestello(false), 3000);
              setShowModal(false);
              if (onComprobanteSubido) onComprobanteSubido(file);
            }, 800);
            return 100;
          }
          return prev + Math.random() * 15 + 5;
        });
      }, 100);
    }
  };

  // BACKEND: Determinar si mostrar el bloqueo de pago
  // Se muestra cuando el estudiante no ha pagado O no está verificado Y es primer acceso
  const mostrarBloqueo = (!finalHaPagado || !finalVerificado) && isFirstAccess;
  
  // BACKEND: Validar si hay un curso real (no placeholder)
  // IMPORTANTE: Esta validación evita mostrar datos falsos del localStorage
  // Si aparece información de curso cuando no debería, usar el botón "Limpiar Curso" 
  // o "Resetear Estado" para limpiar los datos temporales del navegador
  const tieneNumCursoValido = currentCourse && 
                            currentCourse.title && 
                            currentCourse.title !== "XXXX" && 
                            currentCourse.title.trim() !== "";
  
  // BACKEND: Obtener el primer nombre del estudiante para personalización
  const firstName = finalAlumno.split(' ')[0];
  const isMobile = window.innerWidth < 640;

  // BACKEND: Función para manejar la verificación (SOLO PARA TESTING - ELIMINAR EN PRODUCCIÓN)
  const handleVerification = () => {
    simulateVerification();
    setTimeout(() => {
      navigate('/alumno/cursos');
    }, 1500);
  };

  // BACKEND: Función para obtener el mensaje de bienvenida personalizado
  const getWelcomeMessage = () => {
    return `${getGreeting()}, ${firstName}!`;
  };

  const handleTouchStart = (e) => {
    setDragging(true);
    setSliderX(0);
    if ('vibrate' in navigator) navigator.vibrate(50);
  };
  
  const handleTouchMove = (e) => {
    if (!dragging) return;
    const touch = e.touches[0];
    const rect = sliderRef.current.getBoundingClientRect();
    let x = touch.clientX - rect.left;
    if (x < 0) x = 0;
    if (x > sliderWidth - circleSize) x = sliderWidth - circleSize;
    setSliderX(x);
  };
  
  const handleTouchEnd = () => {
    if (sliderX > (sliderWidth - circleSize - 10)) {
      setSliderX(sliderWidth - circleSize);
      if ('vibrate' in navigator) navigator.vibrate(100);
      setTimeout(() => {
        setSliderX(0);
        setShowModal(true);
      }, 300);
    } else {
      setSliderX(0);
    }
    setDragging(false);
  };

  // Temas de color
  const themes = {
    default: 'from-indigo-900 via-purple-800 to-pink-900',
    ocean: 'from-blue-900 via-teal-800 to-cyan-900',
    sunset: 'from-orange-900 via-red-800 to-pink-900',
    forest: 'from-green-900 via-emerald-800 to-teal-900'
  };

  return (
    <div className="relative min-h-screen w-full">
      
      {/* Progreso de carga */}
      <UploadProgress show={showUploadProgress} progress={uploadProgress} />

      {/* Mostrar métricas del curso cuando activeSection sea "inicio" y hay un curso válido */}
      {activeSection === 'inicio' && tieneNumCursoValido && (
        <div className={`transition-all duration-1000 ${elementsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <AlumnoDashboardMetrics />
        </div>
      )}

      {/* Mostrar mensaje de bienvenida cuando NO hay sección activa */}
      {!activeSection && (
        <div className={`fixed inset-0 min-h-screen w-full bg-gradient-to-br ${themes[currentTheme]} overflow-y-auto transition-all duration-1000`}>
          
          {/* Partículas flotantes */}
          <FloatingParticles />
          
          {/* Elementos de fondo animados mejorados */}
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className="absolute w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse duration-[8000ms] transform-gpu transition-all duration-1000"
              style={{
                left: `${mousePosition.x * 0.02}px`,
                top: `${mousePosition.y * 0.02}px`,
              }}
            ></div>
            <div 
              className="absolute w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse duration-[8000ms] delay-[2000ms] transform-gpu transition-all duration-1000"
              style={{
                right: `${mousePosition.x * 0.01}px`,
                top: `${mousePosition.y * 0.03 + 80}px`,
              }}
            ></div>
            <div 
              className="absolute w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse duration-[8000ms] delay-[4000ms] transform-gpu transition-all duration-1000"
              style={{
                left: `${mousePosition.x * 0.015 + 80}px`,
                bottom: `${mousePosition.y * 0.02}px`,
              }}
            ></div>
            
            {/* Estrellas mejoradas con más animación */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute text-yellow-300 opacity-60 animate-pulse"
                style={{
                  left: `${10 + i * 12}%`,
                  top: `${15 + i * 8}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${2 + i * 0.3}s`
                }}
              >
                <Star size={16 + Math.random() * 8} />
              </div>
            ))}
          </div>

          {/* Layout principal para bienvenida */}
          <div className="relative z-10 min-h-screen p-4 sm:p-6 lg:p-8 sm:pl-40 md:pl-52 lg:pl-40 xl:pl-32 pt-20 sm:pt-24 md:pt-28 lg:pt-32">
            {/* Header con saludo animado */}
            <div className={`text-center mb-12 lg:mb-16 transition-all duration-1000 ${elementsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 drop-shadow-2xl animate-pulse duration-1000 hover:scale-105 transition-transform cursor-pointer">
                {getWelcomeMessage()}
              </h1>
            </div>

            {/* Grid principal - responsive mejorado */}
            <div className={`max-w-7xl mx-auto ${mostrarBloqueo || (!mostrarBloqueo && tieneNumCursoValido) ? 'grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 xl:gap-12' : 'flex justify-center'} items-start`}>
          
              {/* Columna izquierda - Área de comprobante O nombre del curso */}
              {(mostrarBloqueo || (!mostrarBloqueo && tieneNumCursoValido)) && (
                <div className={`space-y-6 md:order-1 transition-all duration-1000 delay-300 ${elementsVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
                  <div className="w-full max-w-md mx-auto md:mx-0 sm:ml-8 md:ml-12 lg:ml-8 xl:ml-4 px-4 md:px-0">
                    
                    {/* Mensaje de estado con efectos mejorados O nombre del curso */}
                    <div className="relative group ml-0 sm:ml-8 md:ml-12 lg:ml-8 xl:ml-4">
                      <div className={`absolute inset-0 ${mostrarBloqueo ? 'bg-gradient-to-r from-yellow-400/30 via-amber-300/30 to-orange-400/30' : 'bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-indigo-500/30'} blur-lg rounded-xl animate-pulse`}></div>
                      <div className={`relative ${mostrarBloqueo ? 'bg-gradient-to-r from-yellow-400/20 via-amber-300/20 to-orange-400/20' : 'bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-indigo-500/20'} backdrop-blur-lg rounded-xl p-4 sm:p-6 md:p-4 lg:p-6 border ${mostrarBloqueo ? 'border-yellow-300/40' : 'border-purple-300/40'} text-center mb-6 shadow-xl ${mostrarBloqueo ? 'shadow-yellow-500/30 hover:shadow-yellow-500/50' : 'shadow-purple-500/30 hover:shadow-purple-500/50'} transition-all duration-500 group-hover:scale-102`}>
                        
                        {/* Contenido cuando está en modo bloqueo (pago) */}
                        {mostrarBloqueo && (
                          <>
                            {!comprobante ? (
                              <div className="flex flex-col items-center gap-3 sm:gap-4 md:gap-3 lg:gap-4">
                                <div className="bg-yellow-400 rounded-full p-2 sm:p-3 md:p-2 lg:p-3 animate-pulse group-hover:animate-bounce">
                                  <AlertTriangle size={24} className="sm:w-8 sm:h-8 md:w-6 md:h-6 lg:w-8 lg:h-8 text-yellow-900 animate-pulse" style={{
                                    animation: 'pulse 2s infinite, heartbeat 1.5s infinite'
                                  }} />
                                </div>
                                <p className="text-yellow-100 font-bold text-lg sm:text-xl md:text-lg lg:text-2xl xl:text-3xl leading-relaxed group-hover:text-yellow-50 transition-colors">
                                  Debes subir tu comprobante para acceder a la plataforma completa.
                                </p>
                                <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg px-3 py-2 sm:px-4 md:px-3 lg:px-4 mt-2">
                                  <p className="text-yellow-200 font-semibold text-xs sm:text-sm md:text-xs lg:text-sm">
                                    📋 Sube tu comprobante de pago para continuar
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-teal-500/20 backdrop-blur-lg rounded-2xl p-6 border border-green-300/30 shadow-xl animate-fadeIn">
                                <div className="flex items-center justify-center gap-3 mb-4">
                                  <div className="bg-green-400 rounded-full p-2 animate-pulse">
                                    <CheckCircle size={28} className="text-white" />
                                  </div>
                                  <span className="font-extrabold text-xl text-green-100">¡Comprobante enviado!</span>
                                </div>
                                <p className="text-green-100 font-semibold text-base sm:text-lg leading-relaxed">
                                  Tu archivo ha sido recibido exitosamente. La verificación está en proceso.
                                </p>
                              </div>
                            )}
                            
                            {mensajeVerificacion && (
                              <div className="mt-4 text-center text-green-200 font-bold bg-green-500/20 border border-green-300/30 rounded-lg px-4 py-3 animate-pulse">
                                <div className="flex items-center justify-center gap-2">
                                  <CheckCircle size={20} />
                                  <span className="text-sm sm:text-base">{mensajeVerificacion}</span>
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        {/* BACKEND: Contenido cuando está verificado y con curso seleccionado */}
                        {!mostrarBloqueo && tieneNumCursoValido && (
                          <div className="flex flex-col items-center gap-6 py-4">
                            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full p-4 animate-pulse group-hover:animate-bounce">
                              <GraduationCap size={48} className="text-white" />
                            </div>
                            <div className="text-center">
                              <p className="text-purple-100 font-semibold text-2xl mb-4">
                                Curso Actual
                              </p>
                              {/* BACKEND: Título del curso actual desde la API */}
                              <h3 className="text-white font-bold text-2xl sm:text-3xl md:text-2xl lg:text-4xl xl:text-5xl leading-relaxed group-hover:text-purple-100 transition-colors mb-3">
                                {currentCourse.title}
                              </h3>
                              {/* BACKEND: Instructor del curso actual */}
                              {currentCourse.instructor && currentCourse.instructor !== "XXXX" && (
                                <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
                                  <p className="text-purple-100 text-sm font-medium">
                                    Instructor: <span className="text-white font-semibold">{currentCourse.instructor}</span>
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Botones solo cuando está en modo bloqueo */}
                    {mostrarBloqueo && (
                      <>
                        {/* Botón de subir comprobante mejorado */}
                        {!comprobante && (
                          <div className="group ml-0 sm:ml-8 md:ml-12 lg:ml-8 xl:ml-4">
                            {isMobile ? (
                              <div className="w-full">
                                <div
                                  ref={sliderRef}
                                  className="relative mx-auto group-hover:scale-105 transition-transform duration-300"
                                  style={{ width: `${Math.min(sliderWidth, window.innerWidth - 96)}px`, height: `${circleSize}px` }}
                                >
                                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-pink-400 to-pink-600 rounded-full flex items-center shadow-lg group-hover:shadow-xl transition-shadow"></div>
                                  <span className="absolute left-8 sm:left-12 md:left-10 lg:left-12 top-1/2 -translate-y-1/2 text-xs sm:text-sm md:text-xs lg:text-base font-bold text-gray-800 select-none pointer-events-none">Desliza para subirlo</span>
                                  <ChevronRight size={20} className="sm:w-6 sm:h-6 md:w-5 md:h-5 lg:w-6 lg:h-6 absolute right-3 sm:right-4 md:right-3 lg:right-4 top-1/2 -translate-y-1/2 text-white pointer-events-none" />
                                  <div
                                    className="absolute top-0 left-0 z-10"
                                    style={{ transform: `translateX(${sliderX}px)` }}
                                  >
                                    <button
                                      className="w-10 h-10 sm:w-12 sm:h-12 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-white border-4 border-pink-400 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-all duration-200 hover:shadow-lg"
                                      onTouchStart={handleTouchStart}
                                      onTouchMove={handleTouchMove}
                                      onTouchEnd={handleTouchEnd}
                                      onMouseDown={e => e.preventDefault()}
                                      tabIndex={-1}
                                      aria-label="Desliza para subir"
                                      style={{ touchAction: 'none' }}
                                    >
                                      <ChevronRight size={16} className="sm:w-5 sm:h-5 md:w-4 md:h-4 lg:w-5 lg:h-5 text-pink-500" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <button
                                className="w-full py-4 px-8 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white font-extrabold rounded-2xl shadow-xl text-xl hover:scale-105 hover:shadow-2xl transition-all duration-300 animate-pulse focus:outline-none focus:ring-4 focus:ring-pink-300/50 border border-white/20 group-hover:from-purple-400 group-hover:via-pink-400 group-hover:to-indigo-400"
                                onClick={() => setShowModal(true)}
                              >
                                <div className="flex items-center justify-center gap-3">
                                  <Upload className="animate-bounce group-hover:animate-pulse" size={24} />
                                  <span>Subir comprobante de pago</span>
                                </div>
                              </button>
                            )}
                          </div>
                        )}

                        {/* BACKEND: Botón de verificación para testing - ELIMINAR EN PRODUCCIÓN */}
                        {mostrarBloqueo && isFirstAccess && (
                          <div className="group ml-0 sm:ml-8 md:ml-12 lg:ml-8 xl:ml-4 mt-4">
                            <button
                              className="w-full py-4 px-8 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white font-extrabold rounded-2xl shadow-xl text-xl hover:scale-105 hover:shadow-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-300/50 border border-white/20 group-hover:from-green-400 group-hover:via-emerald-400 group-hover:to-teal-400"
                              onClick={handleVerification}
                            >
                              <div className="flex items-center justify-center gap-3">
                                <ShieldCheck className="animate-pulse group-hover:animate-bounce" size={24} />
                                <span>Simular Verificación</span>
                              </div>
                            </button>
                            <p className="text-center text-white/70 text-sm mt-2">
                              (Botón de prueba para simular la verificación)
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Columna derecha - Reloj y frase */}
              <div className={`space-y-6 ${(mostrarBloqueo || (!mostrarBloqueo && tieneNumCursoValido)) ? 'md:order-2' : ''} ${(!mostrarBloqueo && !tieneNumCursoValido) ? 'w-full max-w-6xl' : ''} transition-all duration-1000 delay-500 ${elementsVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
                
                {/* Reloj grande con efecto 3D grueso y sólido */}
                <div className="text-center mb-8 group">
                  <div 
                    className={`${(mostrarBloqueo || (!mostrarBloqueo && tieneNumCursoValido)) ? 'text-7xl sm:text-8xl lg:text-9xl xl:text-[11rem] 2xl:text-[13rem]' : 'text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] 2xl:text-[11rem]'} font-bold text-white mb-4 leading-none transition-all duration-300 ${clockPulse ? 'scale-105' : 'scale-100'} group-hover:scale-105 cursor-pointer select-none`} 
                    style={{ 
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      fontWeight: '900',
                      textShadow: `
                        ${(!mostrarBloqueo && !tieneNumCursoValido) ? 
                          '3px 3px 0px rgba(139, 92, 246, 1), 6px 6px 0px rgba(139, 92, 246, 0.9), 9px 9px 0px rgba(139, 92, 246, 0.8), 12px 12px 0px rgba(139, 92, 246, 0.7), 15px 15px 0px rgba(139, 92, 246, 0.6), 18px 18px 0px rgba(139, 92, 246, 0.5), 21px 21px 0px rgba(139, 92, 246, 0.4), 24px 24px 40px rgba(0, 0, 0, 0.8)' : 
                          '2px 2px 0px rgba(139, 92, 246, 1), 4px 4px 0px rgba(139, 92, 246, 0.9), 6px 6px 0px rgba(139, 92, 246, 0.8), 8px 8px 0px rgba(139, 92, 246, 0.7), 10px 10px 0px rgba(139, 92, 246, 0.6), 12px 12px 0px rgba(139, 92, 246, 0.5), 14px 14px 0px rgba(139, 92, 246, 0.4), 16px 16px 25px rgba(0, 0, 0, 0.8)'
                        }
                      `,
                      WebkitTextStroke: `${(!mostrarBloqueo && !tieneNumCursoValido) ? '3px' : '2px'} rgba(139, 92, 246, 0.3)`,
                      animation: 'breathe 4s ease-in-out infinite'
                    }}
                  >
                    {hora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  
                  {/* Fecha pequeña con hover */}
                  <span className={`text-purple-200 font-semibold bg-white/10 px-4 py-2 rounded-lg ${(mostrarBloqueo || (!mostrarBloqueo && tieneNumCursoValido)) ? 'text-sm sm:text-base' : 'text-base sm:text-lg'} inline-block mx-auto hover:bg-white/20 transition-all duration-300 cursor-pointer`}>
                    {hora.toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>

                {/* Frase motivacional con efectos */}
                <div className="text-center group">
                  <div className="flex items-center gap-3 mb-4 justify-center group-hover:scale-105 transition-transform duration-300">
                    <Calendar className="text-yellow-300 animate-pulse group-hover:animate-bounce" size={24} />
                    <span className="text-yellow-300 font-semibold text-lg group-hover:text-yellow-200 transition-colors">Frase del día</span>
                  </div>
                  <p className={`${(mostrarBloqueo || (!mostrarBloqueo && tieneNumCursoValido)) ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'} font-bold text-white leading-relaxed group-hover:text-yellow-100 transition-all duration-500 cursor-pointer`}>
                    {frase}
                  </p>
                </div>
              </div>
            </div>

            {/* BACKEND: Botones de navegación y testing */}
            <div className="text-center mt-12 relative z-10">
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => navigate('/alumno/cursos')}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  Ver Mis Cursos
                </button>
                
                {/* BACKEND: Botón de reseteo para testing - ELIMINAR EN PRODUCCIÓN */}
                <button
                  onClick={resetStudentState}
                  className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  Resetear Estado (Testing)
                </button>
                
                {/* BACKEND: Botón para limpiar curso seleccionado - ELIMINAR EN PRODUCCIÓN */}
                {tieneNumCursoValido && (
                  <button
                    onClick={clearCourse}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    Limpiar Curso
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audio para destello */}
      <audio ref={audioRef} preload="auto" />
      
      {/* Destello visual mejorado */}
      {showDestello && (
        <div className="fixed inset-0 bg-gradient-to-br from-yellow-100 via-white to-purple-100 bg-opacity-90 z-50 pointer-events-none">
          <div className="absolute inset-0 animate-ping bg-green-400/30 rounded-full scale-150"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="text-6xl animate-bounce">🎉</div>
          </div>
        </div>
      )}

      {/* Modal para subir comprobante */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 sm:p-4 sm:pl-64 md:pl-80 lg:pl-72 xl:pl-60">
          <div className="bg-white/95 backdrop-blur-lg p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl shadow-2xl max-w-sm sm:max-w-md w-full mx-2 sm:mx-4 border-2 sm:border-4 border-pink-200 flex flex-col items-center">
            <div className="mb-4 sm:mb-6 text-4xl sm:text-5xl lg:text-6xl animate-bounce">📤</div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-purple-700 mb-4 sm:mb-6 text-center leading-tight">
              Subir comprobante de pago
            </h2>
            <div className="w-full mb-4 sm:mb-6">
              <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">
                Selecciona tu archivo (JPG, PNG, PDF)
              </label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleSubirComprobante}
                className="w-full text-xs sm:text-sm lg:text-base file:mr-2 sm:file:mr-4 file:py-2 sm:file:py-3 file:px-3 sm:file:px-6 file:rounded-lg sm:file:rounded-xl file:border-0 file:text-xs sm:file:text-sm lg:file:text-base file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-pink-200 file:shadow-md file:transition-all file:duration-300 text-gray-700"
              />
            </div>
            <button
              className="px-4 sm:px-6 lg:px-8 py-2 sm:py-3 bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white rounded-lg sm:rounded-xl shadow-lg transition-all duration-300 text-sm sm:text-base lg:text-lg font-bold flex items-center gap-2 w-full sm:w-auto justify-center"
              onClick={() => setShowModal(false)}
            >
              <X size={16} className="sm:hidden" />
              <X size={20} className="hidden sm:block" />
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export { InicioAlumnoDashboard };