import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Star, BookOpen, Video, Award, X } from 'lucide-react';
import { useLocation, useParams, Navigate, useNavigate } from "react-router-dom";
import { usePreview } from "../../context/PreviewContext";
import { Curso1 } from "../../assets/mqerk/cursos"; // Fallback para imagen


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
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 font-sans selection:bg-pink-500 selection:text-white pb-12">
      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 lg:py-16 overflow-x-hidden">
        {/* Efectos de fondo sutiles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 left-0 -ml-20 -mt-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <div className="relative grid lg:grid-cols-2 gap-6 lg:gap-16 items-center overflow-x-hidden">
          {/* Left Content */}
          <div className="space-y-4 sm:space-y-6 animate-fade-in text-center lg:text-left px-2 sm:px-0">
            {tagline && (
              <div className="inline-block">
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-white/10 text-white backdrop-blur-md border border-white/20 shadow-sm">
                  <Star className="w-3.5 h-3.5 mr-2 text-yellow-300 fill-yellow-300" />
                  {tagline}
                </span>
              </div>
            )}

            <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white leading-tight tracking-tight break-words">
              {courseName}
            </h1>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start pt-2">
              <button
                onClick={() => handleRegistro()}
                className="w-full sm:w-auto bg-white text-indigo-700 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg hover:bg-indigo-50 transition-all transform hover:scale-[1.02] hover:shadow-xl active:scale-95 ring-4 ring-white/20"
              >
                ¡Empieza ahora!
              </button>
              <button
                onClick={() => {
                  const elemento = document.getElementById('detalles-curso');
                  if (elemento) elemento.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto bg-transparent border-2 border-white/30 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold text-base sm:text-lg hover:bg-white/10 transition-all"
              >
                Ver detalles
              </button>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative animate-slide-in mt-8 lg:mt-0 group perspective-1000">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-[2rem] blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
            <img
              src={courseImage || Curso1}
              onError={(e) => {
                if (!e.target.dataset.tried) {
                  e.target.dataset.tried = "true";
                  e.target.src = Curso1;
                }
              }}
              alt={courseName || "Imagen del curso"}
              className="relative w-full rounded-[2rem] shadow-2xl object-cover aspect-video transform transition-transform duration-500 group-hover:rotate-y-2 group-hover:scale-[1.01]"
            />
          </div>
        </div>
      </div>

      {/* Course Info Section */}
      <div id="detalles-curso" className="bg-slate-50 relative mt-8 lg:mt-12 rounded-t-[3rem] shadow-inner min-h-screen overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 lg:py-16 overflow-x-hidden">

          {/* Info Cards - Grid optimizado para móviles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4 mb-8 sm:mb-12 max-w-full">
            {[
              { icon: Calendar, label: courseModalidad, show: true },
              { icon: BookOpen, label: totalClasses, show: !!totalClasses },
              { icon: Clock, label: hoursPerDay, show: !!hoursPerDay },
              { icon: Users, label: courseDuration, show: true },
              { icon: Award, label: courseLevel, show: true }
            ].map((item, idx) => item.show && (
              <div key={idx} className="bg-white border border-slate-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 group">
                <div className="p-2 sm:p-3 bg-indigo-50 rounded-lg sm:rounded-xl mb-2 sm:mb-3 group-hover:bg-indigo-100 transition-colors">
                  <item.icon className="w-4 h-4 sm:w-6 sm:h-6 text-indigo-600" />
                </div>
                <p className="text-slate-700 font-bold text-[10px] sm:text-xs leading-tight uppercase tracking-tight break-words w-full px-1">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-12 gap-6 lg:gap-12 overflow-x-hidden">

            {/* Left Column - Video & Content (8 cols) */}
            <div className="lg:col-span-8 flex flex-col gap-6 sm:gap-8 overflow-x-hidden">

              {/* Video Wrapper */}
              <div className="bg-slate-200 rounded-[2.5rem] overflow-hidden shadow-2xl border border-white aspect-video relative group">
                {embedUrl ? (
                  <iframe
                    title="Video del curso"
                    src={`${embedUrl}?autoplay=0&rel=0&modestbranding=1&origin=${window.location.origin}`}
                    className="w-full h-full absolute inset-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  ></iframe>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-8">
                    <div className="p-5 bg-white rounded-full shadow-sm mb-4">
                      <Video className="w-10 h-10 text-indigo-300" />
                    </div>
                    <span className="font-bold text-center">Video de presentación no disponible</span>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl sm:rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <nav className="flex border-b border-slate-100 overflow-x-auto no-scrollbar scroll-smooth bg-slate-50/50" aria-label="Tabs">
                  {['Descripción', 'Aprenderás', 'Áreas de enseñanza'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 min-w-fit whitespace-nowrap px-3 sm:px-6 py-4 sm:py-5 font-bold text-xs sm:text-base border-b-4 transition-all duration-300 outline-none ${activeTab === tab
                        ? 'border-indigo-600 text-indigo-600 bg-white'
                        : 'border-transparent text-slate-400 hover:text-indigo-500 hover:bg-slate-50'
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>

                <div className="p-4 sm:p-6 lg:p-10 min-h-[300px] overflow-x-hidden">
                  {/* Tab: Descripción */}
                  <div className={`transition-all duration-500 ${activeTab === 'Descripción' ? 'opacity-100 translate-y-0 block' : 'opacity-0 translate-y-4 hidden'}`}>
                    <div className="prose prose-indigo max-w-none text-slate-600">
                      <p className="leading-relaxed whitespace-pre-line text-justify text-base sm:text-lg">
                        {descripcion || 'No hay descripción disponible para este curso.'}
                      </p>
                    </div>
                  </div>

                  {/* Tab: Aprenderás */}
                  <div className={`transition-all duration-500 ${activeTab === 'Aprenderás' ? 'opacity-100 translate-y-0 block' : 'opacity-0 translate-y-4 hidden'}`}>
                    {aprenderas.length === 0 ? (
                      <p className="text-slate-400 text-center py-8 text-sm font-medium">Información no disponible</p>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-4">
                        {aprenderas.map((item, index) => (
                          <div key={index} className="flex gap-4 p-5 rounded-[1.5rem] bg-indigo-50/30 border border-indigo-100/50 hover:bg-indigo-50 transition-all">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mt-0.5 shadow-sm shadow-green-200">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            <span className="text-slate-700 font-semibold text-sm sm:text-base leading-snug">{item}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tab: Áreas */}
                  <div className={`transition-all duration-500 ${activeTab === 'Áreas de enseñanza' ? 'opacity-100 translate-y-0 block' : 'opacity-0 translate-y-4 hidden'}`}>
                    {areasEnsenanza.length === 0 ? (
                      <p className="text-slate-400 text-center py-8 text-sm font-medium">Áreas no disponibles</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {areasEnsenanza.map((area, index) => (
                          <div key={index} className="flex items-center px-6 py-4 rounded-2xl bg-white text-slate-800 border border-slate-100 font-bold text-sm shadow-sm hover:border-indigo-300 transition-all">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mr-4">
                              <BookOpen className="w-5 h-5 text-indigo-500" />
                            </div>
                            <span className="truncate">{area}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Pricing & Asesores (4 cols) */}
            <div className="lg:col-span-4 space-y-4 sm:space-y-6 overflow-x-hidden">

              {/* Pricing Card */}
              <div className="bg-white rounded-xl sm:rounded-[2rem] p-5 sm:p-6 lg:p-8 shadow-lg border border-indigo-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[4rem] -mr-8 -mt-8 z-0"></div>
                <div className="relative z-10">
                  <h3 className="text-xs sm:text-sm font-bold text-indigo-500 tracking-wider uppercase mb-1 break-words">{planLateralNombre}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 break-all">${planLateralPrecio}</span>
                    <span className="text-slate-500 font-medium text-xs sm:text-sm self-end mb-2">MXN</span>
                  </div>

                  {(planLateralPrecioTachado !== '0' || planLateralDescuento !== '0') && (
                    <div className="flex items-center gap-3 mb-6 bg-red-50 inline-flex px-3 py-1 rounded-lg">
                      {planLateralPrecioTachado !== '0' && (
                        <span className="text-slate-400 line-through text-sm font-medium decoration-slate-400">${planLateralPrecioTachado}</span>
                      )}
                      {planLateralDescuento !== '0' && (
                        <span className="text-red-600 font-bold text-sm">-{planLateralDescuento}% OFF</span>
                      )}
                    </div>
                  )}

                  <div className="space-y-3 mb-8">
                    {planLateralBeneficios.length > 0 ? (
                      planLateralBeneficios.map((b, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-3 h-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                          </div>
                          <span className="text-slate-600 text-sm font-medium">{b}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-sm italic">Incluye acceso completo al curso</p>
                    )}
                  </div>

                  <button
                    onClick={() => setShowModal(true)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 group"
                  >
                    <span>Ver planes disponibles</span>
                    <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </button>
                </div>
              </div>

              {/* Rating & Social Proof */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wide">Valoración alumnos</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-2xl font-bold text-slate-800">{courseRating}</span>
                    <span className="text-slate-400 text-sm">/ 5.0</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-5 h-5 ${s <= Math.round(courseRating) ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-100 text-slate-200'}`} />
                  ))}
                </div>
              </div>

              {/* Asesores Widget */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-500" />
                  Asesores expertos
                </h3>
                <div className="space-y-4">
                  {asesores.length > 0 ? asesores.map((asesor, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-colors">
                      <img
                        src={asesor.avatar || `https://ui-avatars.com/api/?name=${asesor.nombre}&background=random`}
                        alt={asesor.nombre}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-700">{asesor.nombre}</p>
                        <p className="text-xs text-slate-500">{asesor.cargo || 'Instructor'}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-4 text-slate-400 italic text-sm">
                      Próximamente asignación de asesores
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Modal Fullscreen Responsive */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 perspective-1000">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
            onClick={() => setShowModal(false)}
          />

          <div className="relative bg-white sm:rounded-3xl rounded-t-3xl w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-20 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Planes de inscripción</h2>
              <button onClick={() => setShowModal(false)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-10 bg-slate-50">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <span className="text-indigo-600 font-bold uppercase tracking-wider text-xs">Invierte en tu futuro</span>
                <h3 className="text-3xl font-extrabold text-slate-800 mt-2 mb-4">Elige el plan ideal para ti</h3>
                <p className="text-slate-500">Todos nuestros planes incluyen acceso completo a la plataforma, materiales de estudio y soporte.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {preview?.planes?.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative flex flex-col rounded-2xl p-6 sm:p-8 transition-all duration-300 ${plan.destacado
                      ? 'bg-white ring-4 ring-indigo-500/20 shadow-xl scale-[1.02] z-10'
                      : 'bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-lg'
                      }`}
                  >
                    {plan.destacado && (
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                        MÁS POPULAR
                      </div>
                    )}

                    <div className="mb-6">
                      <h4 className="text-lg font-bold text-slate-900 mb-2">{plan.nombre}</h4>
                      <p className="text-sm text-slate-500 min-h-[40px]">{plan.descripcion}</p>
                    </div>

                    <div className="mb-8">
                      <p className="text-xs font-semibold text-indigo-600 mb-1 uppercase">{plan.etiquetaPrecio}</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold text-slate-900">${plan.precio}</span>
                        <span className="text-slate-400 font-medium">MXN</span>
                      </div>
                    </div>

                    <ul className="space-y-4 mb-8 flex-1">
                      {plan.beneficios?.map((b, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-50 flex items-center justify-center mt-0.5">
                            <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                          </div>
                          <span className="text-sm text-slate-600 font-medium">{b}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleRegistro(plan)}
                      className={`w-full py-4 rounded-xl font-bold transition-all ${plan.destacado
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-indigo-500/40'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                    >
                      Seleccionar {plan.nombre}
                    </button>
                  </div>
                ))}
              </div>

              <p className="text-center text-xs text-slate-400 mt-12 max-w-3xl mx-auto">
                * Los precios están en pesos mexicanos (MXN) e incluyen IVA. El acceso a los contenidos es inmediato tras la confirmación del pago en la plataforma.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Styles for Animations & Utilities */}
      <style>{`
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .animate-fade-in-up {
           animation: fade-in-up 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}