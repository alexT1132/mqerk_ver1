import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Star, BookOpen, Video, Award, X } from 'lucide-react';
import { useLocation, useParams, Navigate, useNavigate } from "react-router-dom";
import { usePreview } from "../../context/PreviewContext";

export default function CoursePreview({ curso, nombreCurso }) {
  const location = useLocation();
  const navigate = useNavigate(); // Agregar useNavigate
  const cursoData = curso || location.state?.curso;

  const { preview, loadByCourse } = usePreview();

  console.log(preview);

  // Estados del componente
  const [activeTab, setActiveTab] = useState('Descripción');
  const [embedUrl, setEmbedUrl] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para contenido de tabs
  const [descripcion, setDescripcion] = useState('');
  const [aprenderas, setAprenderas] = useState([]);
  const [areasEnsenanza, setAreasEnsenanza] = useState([]);
  
  // Estados para los datos del curso
  const [courseName, setCourseName] = useState('');
  const [courseImage, setCourseImage] = useState('');
  const [courseModalidad, setCourseModalidad] = useState('');
  const [courseDuration, setCourseDuration] = useState('');
  const [courseRating, setCourseRating] = useState(0);
  const [courseLevel, setCourseLevel] = useState('');
  const [tagline, setTagline] = useState('');
  const [totalClasses, setTotalClasses] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState('');

  // Estados para el plan lateral (resumen)
  const [planLateralNombre, setPlanLateralNombre] = useState('MENSUAL');
  const [planLateralPrecio, setPlanLateralPrecio] = useState('0');
  const [planLateralPrecioTachado, setPlanLateralPrecioTachado] = useState('0');
  const [planLateralDescuento, setPlanLateralDescuento] = useState('0');
  const [planLateralBeneficios, setPlanLateralBeneficios] = useState([]);

  const [asesores, setAsesores] = useState([]);

  // Estados para los planes de precios
  const [planes, setPlanes] = useState([
    {
      id: 1,
      nombre: 'Mensual',
      descripcion: 'Pago mes a mes durante los 8 meses',
      precio: '1,500',
      etiquetaPrecio: 'PAGO',
      beneficios: [
        'Acceso a nuestra plataforma educativa',
        'Guías digitales con ejercicios tipo examen',
        'Libros electrónicos en PDF por materia',
        'Simuladores en línea'
      ],
      destacado: false
    },
    {
      id: 2,
      nombre: 'Start',
      descripcion: 'Pago en 2 exhibiciones (inicio y mitad del curso)',
      precio: '5,500',
      etiquetaPrecio: '2 PAGOS DE',
      beneficios: [
        'Acceso a nuestra plataforma educativa',
        'Guías digitales con ejercicios tipo examen',
        'Libros electrónicos en PDF por materia',
        'Simuladores en línea'
      ],
      destacado: true
    },
    {
      id: 3,
      nombre: 'Premium',
      descripcion: 'Pago único con precio preferencial',
      precio: '10,500',
      etiquetaPrecio: '1 SOLO PAGO DE',
      beneficios: [
        'Acceso a nuestra plataforma educativa',
        'Guías digitales con ejercicios tipo examen',
        'Libros electrónicos en PDF por materia',
        'Simuladores en línea'
      ],
      destacado: false
    }
  ]);

  // Función para manejar la navegación al registro
  const handleRegistro = (planSeleccionado = null) => {
    // Puedes pasar el plan seleccionado como state si lo necesitas después
    navigate('/registro_alumno', {
      state: {
        curso: cursoData,
        plan: planSeleccionado
      }
    });
  };

  // Redirigir si no hay curso
  if (!cursoData) {
    return <Navigate to="/cursos" replace />;
  }

  // Cargar preview existente si hay courseId
  useEffect(() => {
    const loadPreviewData = async () => {
      if (cursoData.id) {
        try {
          setIsLoading(true);
          const previewData = await loadByCourse(cursoData.id);
          
          if (previewData) {
            // Cargar datos del preview
            const videoUrlFromDB = previewData.video_url || '';
            
            // Convertir la URL del video a embedUrl
            if (videoUrlFromDB) {
              let videoId = '';
              
              if (videoUrlFromDB.includes('youtu.be/')) {
                videoId = videoUrlFromDB.split('youtu.be/')[1]?.split('?')[0];
              } else if (videoUrlFromDB.includes('youtube.com/watch?v=')) {
                videoId = videoUrlFromDB.split('v=')[1]?.split('&')[0];
              } else if (videoUrlFromDB.includes('youtube.com/embed/')) {
                videoId = videoUrlFromDB.split('embed/')[1]?.split('?')[0];
              }
              
              if (videoId) {
                setEmbedUrl(`https://www.youtube.com/embed/${videoId}`);
              }
            }
            
            setDescripcion(previewData.descripcion);
            setAprenderas(previewData.aprenderas);
            setAreasEnsenanza(previewData.areas_ensenanza);
            setTagline(previewData.tagline);
            setTotalClasses(previewData.total_classes);
            setHoursPerDay(previewData.hours_per_day);
            
            // Plan lateral
            setPlanLateralNombre(previewData.plan_lateral?.nombre);
            setPlanLateralPrecio(previewData.plan_lateral?.precio);
            setPlanLateralPrecioTachado(previewData.plan_lateral?.precio_tachado);
            setPlanLateralDescuento(previewData.plan_lateral?.descuento);
            setPlanLateralBeneficios(previewData.plan_lateral?.beneficios);
            
            // Planes de precios
            if (previewData.planes && previewData.planes.length > 0) {
              setPlanes(previewData.planes);
            }
          }
        } catch (error) {
          console.log("No hay preview disponible");
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadPreviewData();
  }, [cursoData.id]);

  // Cargar datos del curso cuando el componente se monta
  useEffect(() => {
    if (cursoData) {
      setCourseName(cursoData.nombre || '');
      setCourseImage(cursoData.imagenUrl || '');
      setCourseModalidad(cursoData.modalidad || '');
      
      // Formatear duración correctamente
      let durationText = '';
      if (cursoData.duration && cursoData.durationUnit) {
        const duration = parseFloat(cursoData.duration);
        const formattedDuration = Number.isInteger(duration) ? duration : duration.toFixed(0);
        durationText = `${formattedDuration} ${cursoData.durationUnit}`;
      } 
      setCourseDuration(durationText);
      
      setCourseRating(cursoData.rating || 0);
      setCourseLevel(cursoData.nivel || '');
    }
  }, [cursoData]);

  // Cerrar modal al presionar ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 flex items-center justify-center">
        <div className="text-white text-2xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 animate-fade-in">
            {tagline && (
              <div className="inline-block">
                <span className="text-white/80 text-sm font-medium bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">
                  {tagline}
                </span>
              </div>
            )}
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              {courseName}
            </h2>
            
            <button
              onClick={() => handleRegistro()}
              className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/90 transition-all transform hover:scale-105 hover:shadow-2xl">
              Empieza ya
            </button>
          </div>

          {/* Right Image */}
          <div className="relative animate-slide-in">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-400/30 to-indigo-400/30 rounded-3xl blur-2xl"></div>
            <img 
              src={courseImage}
              alt={courseName}
              className="relative rounded-3xl shadow-2xl w-full object-cover aspect-video"
            />
          </div>
        </div>
      </div>

      {/* Course Info Section */}
      <div className="bg-white rounded-t-[3rem] mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          
          {/* Info Cards */}
          <div className="mb-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8 text-center">
              Información del curso
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Modalidad */}
              <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-indigo-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <Calendar className="w-6 h-6 text-indigo-600 mb-3" />
                <p className="text-gray-700 font-medium text-sm">{courseModalidad}</p>
              </div>
              
              {/* Clases */}
              {totalClasses && (
                <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-indigo-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <BookOpen className="w-6 h-6 text-indigo-600 mb-3" />
                  <p className="text-gray-700 font-medium text-sm">{totalClasses}</p>
                </div>
              )}
              
              {/* Horas por día */}
              {hoursPerDay && (
                <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-indigo-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <Clock className="w-6 h-6 text-indigo-600 mb-3" />
                  <p className="text-gray-700 font-medium text-sm">{hoursPerDay}</p>
                </div>
              )}
              
              {/* Duración */}
              <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-indigo-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <Users className="w-6 h-6 text-indigo-600 mb-3" />
                <p className="text-gray-700 font-medium text-sm">{courseDuration}</p>
              </div>
              
              {/* Nivel */}
              <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-indigo-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <Award className="w-6 h-6 text-indigo-600 mb-3" />
                <p className="text-gray-700 font-medium text-sm">{courseLevel}</p>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left Column - Video */}
            <div className="lg:col-span-2">
              <div className="bg-gray-50 rounded-3xl overflow-hidden min-h-[400px] border-2 border-gray-200">
                {embedUrl ? (
                  <iframe
                    src={`${embedUrl}?autoplay=1`}
                    className="w-full h-[400px]"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="p-8 lg:p-12 h-full flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="bg-white rounded-full p-6">
                        <Video className="w-8 h-8 text-indigo-600" />
                      </div>
                      <span className="text-gray-400 font-semibold text-lg">Video no disponible</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="mt-8">
                <div className="flex gap-2 border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab('Descripción')}
                    className={`px-6 py-3 font-semibold rounded-t-xl transition-colors ${
                      activeTab === 'Descripción'
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-600 hover:text-indigo-600'
                    }`}
                  >
                    Descripción
                  </button>
                  <button
                    onClick={() => setActiveTab('Aprenderás')}
                    className={`px-6 py-3 font-semibold rounded-t-xl transition-colors ${
                      activeTab === 'Aprenderás'
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-600 hover:text-indigo-600'
                    }`}
                  >
                    Aprenderás
                  </button>
                  <button
                    onClick={() => setActiveTab('Áreas de enseñanza')}
                    className={`px-6 py-3 font-semibold rounded-t-xl transition-colors ${
                      activeTab === 'Áreas de enseñanza'
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-600 hover:text-indigo-600'
                    }`}
                  >
                    Áreas de enseñanza
                  </button>
                </div>
                
                <div className="bg-white rounded-b-2xl rounded-tr-2xl border border-gray-200 p-8">
                  {/* Tab: Descripción */}
                  {activeTab === 'Descripción' && (
                    <div className="text-gray-600 leading-relaxed">
                      {descripcion || 'No hay descripción disponible para este curso.'}
                    </div>
                  )}

                  {/* Tab: Aprenderás */}
                  {activeTab === 'Aprenderás' && (
                    <div className="space-y-4">
                      {aprenderas.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">No hay información disponible</p>
                      ) : (
                        <ul className="space-y-4">
                          {aprenderas.map((item, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <span className="text-gray-900 font-bold text-lg">•</span>
                              <span className="flex-1 text-gray-700 leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {/* Tab: Áreas de enseñanza */}
                  {activeTab === 'Áreas de enseñanza' && (
                    <div className="space-y-4">
                      {areasEnsenanza.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">No hay áreas disponibles</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {areasEnsenanza.map((area, index) => (
                            <div
                              key={index}
                              className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-700 font-medium hover:border-indigo-300 hover:shadow-sm transition-all"
                            >
                              {area}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Pricing */}
            <div className="space-y-6">
              {/* Plan Lateral */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8 border border-indigo-100">
                <h3 className="text-indigo-600 font-semibold mb-2">{planLateralNombre}</h3>
                
                <div className="flex items-baseline gap-2 mb-4 flex-wrap">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold text-gray-900">$</span>
                    <span className="text-5xl font-bold text-gray-900">{planLateralPrecio}</span>
                  </div>
                  <span className="text-gray-500">MXN</span>
                  
                  {planLateralPrecioTachado !== '0' && (
                    <div className="flex items-baseline gap-2">
                      <span className="text-gray-400 line-through">${planLateralPrecioTachado}</span>
                    </div>
                  )}
                  
                  {planLateralDescuento !== '0' && (
                    <span className="text-green-600 font-semibold">-{planLateralDescuento}%</span>
                  )}
                </div>
                
                <div className="mb-6 space-y-2">
                  {planLateralBeneficios.length === 0 ? (
                    <p className="text-gray-400 text-sm italic">No hay beneficios disponibles</p>
                  ) : (
                    planLateralBeneficios.map((beneficio, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-600">{beneficio}</span>
                      </div>
                    ))
                  )}
                </div>
                
                <button 
                  onClick={() => setShowModal(true)}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all transform hover:scale-105"
                >
                  Ver más planes
                </button>
              </div>

              {/* Rating */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-700">Valoración</span>
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-5 h-5 ${i < Math.floor(courseRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                    <span className="font-bold text-gray-900 ml-2">{courseRating}</span>
                  </div>
                </div>
              </div>

              {/* Asesores */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Asesores</h3>
                {asesores.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">
                    Aún no hay asesores asignados.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {asesores.map((asesor, index) => (
                      <div key={index} className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                          {asesor.avatar ? (
                            <img 
                              src={asesor.avatar} 
                              alt={asesor.nombre}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-indigo-600 font-bold text-lg">
                              {asesor.nombre?.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {asesor.nombre}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {asesor.cargo || 'Asesor CienTec'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Planes */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-fast"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 rounded-3xl max-w-7xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón cerrar */}
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white hover:bg-white/10 rounded-full p-2 transition-all z-10"
            >
              <X className="w-7 h-7 sm:w-8 sm:h-8" />
            </button>

            <div className="p-8 sm:p-12 pt-20">
              {/* Título */}
              <h2 className="text-white text-4xl sm:text-5xl font-bold text-center mb-4">
                ELIGE UN PLAN A TU MEDIDA
              </h2>

              {/* Grid de planes */}
              <div className="grid md:grid-cols-3 gap-6 mt-12">
                {preview.planes && preview.planes.map((plan) => (
                  <div 
                    key={plan.id}
                    className={`backdrop-blur-md rounded-3xl p-6 transition-all duration-300 transform hover:scale-105 ${
                      plan.destacado 
                        ? 'bg-white/20 border-4 border-white/40 hover:border-white/60 md:scale-110 shadow-2xl' 
                        : 'bg-white/10 border-2 border-white/20 hover:border-white/40'
                    }`}
                  >
                    <h3 className="text-white text-2xl font-bold text-center mb-4">
                      {plan.nombre}
                    </h3>
                    
                    <p className="text-white/90 text-center text-sm mb-6">
                      {plan.descripcion}
                    </p>

                    <div className="space-y-2 mb-6">
                      {plan.beneficios && plan.beneficios.map((beneficio, beneficioIndex) => (
                        <div key={beneficioIndex} className="flex items-start gap-2">
                          <span className="text-white font-bold mt-1">•</span>
                          <span className="flex-1 text-white/90 text-sm">{beneficio}</span>
                        </div>
                      ))}
                    </div>

                    <p className="text-white/80 text-sm text-center mb-2">{plan.etiquetaPrecio}</p>

                    <div className="flex justify-center items-center mb-6">
                      <span className="text-white text-4xl font-bold">$</span>
                      <span className="text-white text-4xl font-bold">{plan.precio}</span>
                    </div>

                    <button 
                      onClick={() => handleRegistro(plan)}
                      className="w-full bg-white text-indigo-600 py-3 rounded-xl font-semibold hover:bg-white/90 transition-all transform hover:scale-105">
                      Adquirir
                    </button>
                  </div>
                ))}
              </div>

              {/* Nota al final */}
              <p className="text-white/80 text-center text-xs mt-8 max-w-3xl mx-auto">
                Nota: El proceso de pago podrá realizarse una vez finalizado el registro en el formulario de MQerKAcademy. 
                Los detalles correspondientes se encontrarán en el panel principal (dashboard) de la plataforma.
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fade-in-fast {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-slide-in {
          animation: slide-in 0.8s ease-out;
        }

        .animate-fade-in-fast {
          animation: fade-in-fast 0.3s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}