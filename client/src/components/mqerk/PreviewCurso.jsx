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

            <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-tight tracking-tighter break-words drop-shadow-2xl">
              {courseName}
            </h1>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center lg:justify-start pt-4">
              <button
                onClick={() => handleRegistro()}
                className="w-full sm:w-auto bg-white text-indigo-700 px-10 py-5 rounded-[1.5rem] font-black text-lg sm:text-xl hover:bg-indigo-50 transition-all transform hover:scale-[1.05] hover:shadow-2xl active:scale-95 ring-8 ring-white/10 shadow-xl"
              >
                ¡Empieza ahora!
              </button>
              <button
                onClick={() => {
                  const elemento = document.getElementById('detalles-curso');
                  if (elemento) elemento.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto bg-white/10 backdrop-blur-md border-2 border-white/40 text-white px-10 py-5 rounded-[1.5rem] font-black text-lg sm:text-xl hover:bg-white/20 transition-all transform hover:scale-[1.05] active:scale-95 shadow-lg"
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
      <div id="detalles-curso" className="bg-slate-50 relative mt-8 lg:mt-12 rounded-t-[3rem] shadow-inner min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">

          {/* Info Cards - Flex centered for better mobile alignment */}
          <div className="flex flex-wrap items-stretch justify-center gap-3 sm:gap-4 mb-12">
            {[
              { icon: Calendar, label: courseModalidad, show: true },
              { icon: BookOpen, label: totalClasses, show: !!totalClasses },
              { icon: Clock, label: hoursPerDay, show: !!hoursPerDay },
              { icon: Users, label: courseDuration, show: true },
              { icon: Award, label: courseLevel, show: true }
            ].map((item, idx) => item.show && (
              <div key={idx} className="flex-grow sm:flex-grow-0 basis-[calc(50%-12px)] sm:basis-auto bg-white border border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 group min-w-[140px]">
                <div className="p-3 bg-indigo-50 rounded-xl mb-3 group-hover:bg-indigo-100 transition-colors">
                  <item.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <p className="text-slate-700 font-bold text-xs sm:text-sm line-clamp-2 leading-tight uppercase tracking-tight">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">

            {/* Left Column - Video & Content (8 cols) */}
            <div className="lg:col-span-8 flex flex-col gap-8">

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

              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <nav className="flex border-b border-slate-100 overflow-x-auto no-scrollbar scroll-smooth bg-slate-50/50" aria-label="Tabs">
                  {['Descripción', 'Aprenderás', 'Áreas de enseñanza'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 min-w-fit whitespace-nowrap px-6 py-5 font-bold text-sm sm:text-base border-b-4 transition-all duration-300 outline-none ${activeTab === tab
                        ? 'border-indigo-600 text-indigo-600 bg-white'
                        : 'border-transparent text-slate-400 hover:text-indigo-500 hover:bg-slate-50'
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>

                <div className="p-6 sm:p-10 min-h-[300px]">
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
            <div className="lg:col-span-4 space-y-6">

              {/* Pricing Card */}
              <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-xl border border-indigo-50 relative overflow-hidden lg:sticky lg:top-24">
                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50/50 rounded-bl-[5rem] -mr-10 -mt-10 z-0"></div>
                <div className="relative z-10">
                  <div className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full w-fit mb-4 tracking-widest uppercase">
                    Plan Recomendado
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-1">{planLateralNombre}</h3>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-5xl font-black text-slate-900 tracking-tight">${planLateralPrecio}</span>
                    <span className="text-slate-400 font-bold text-xs">MXN</span>
                  </div>

                  {(planLateralPrecioTachado !== '0' || planLateralDescuento !== '0') && (
                    <div className="flex items-center gap-3 mb-8 bg-red-50/80 px-4 py-2 rounded-2xl w-fit">
                      {planLateralPrecioTachado !== '0' && (
                        <span className="text-slate-400 line-through text-sm font-bold">${planLateralPrecioTachado}</span>
                      )}
                      {planLateralDescuento !== '0' && (
                        <span className="text-red-600 font-black text-xs">-{planLateralDescuento}% DTO</span>
                      )}
                    </div>
                  )}

                  <div className="space-y-4 mb-10">
                    {planLateralBeneficios.length > 0 ? (
                      planLateralBeneficios.map((b, i) => (
                        <div key={i} className="flex items-start gap-4">
                          <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          </div>
                          <span className="text-slate-600 text-sm font-bold leading-tight">{b}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-sm italic font-medium">Incluye acceso ilimitado al curso</p>
                    )}
                  </div>

                  <button
                    onClick={() => setShowModal(true)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-indigo-200 transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-3 group"
                  >
                    <span>Ver todos los planes</span>
                    <svg className="w-5 h-5 transform group-hover:translate-x-1.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </button>
                </div>
              </div>

              {/* Rating Section */}
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Valoración alumnos</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-3xl font-black text-slate-800">{courseRating}</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-4 h-4 ${s <= Math.round(courseRating) ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-100 text-slate-200'}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Asesores Widget */}
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-6 flex items-center gap-3">
                  <div className="w-2 h-6 bg-indigo-600 rounded-full"></div>
                  Equipo MQerK
                </h3>
                <div className="space-y-5">
                  {asesores.length > 0 ? asesores.map((asesor, idx) => (
                    <div key={idx} className="flex items-center gap-4 group cursor-pointer">
                      <div className="relative">
                        <img
                          src={asesor.avatar || `https://ui-avatars.com/api/?name=${asesor.nombre}&background=4f46e5&color=fff&bold=true`}
                          alt={asesor.nombre}
                          className="w-12 h-12 rounded-[1rem] object-cover ring-4 ring-slate-50 group-hover:ring-indigo-50 transition-all shadow-sm"
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-800 truncate group-hover:text-indigo-600 transition-colors uppercase">{asesor.nombre}</p>
                        <p className="text-[11px] font-bold text-slate-400 truncate tracking-wide">{asesor.cargo || 'Asesor Académico'}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
                        <Users className="w-6 h-6 text-slate-300" />
                      </div>
                      <p className="text-slate-400 font-bold text-xs">Asesores en proceso de asignación</p>
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl transition-opacity"
            onClick={() => setShowModal(false)}
          />

          <div className="relative bg-slate-50 sm:rounded-[3rem] rounded-[2rem] w-full max-w-6xl max-h-[95vh] overflow-y-auto shadow-2xl animate-fade-in-up border border-white/20">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-md z-30 border-b border-slate-200 px-8 py-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Planes MQerK</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all active:scale-90">
                <X className="w-6 h-6 text-slate-600" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-12">
              <div className="text-center max-w-2xl mx-auto mb-16">
                <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                  Tu Éxito Comienza Aquí
                </div>
                <h3 className="text-3xl sm:text-4xl font-black text-slate-800 leading-tight">Elige el plan que mejor se adapte a tus metas académicas</h3>
              </div>

              <div className="grid md:grid-cols-3 gap-8 items-stretch">
                {preview?.planes?.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative flex flex-col rounded-[2.5rem] p-8 sm:p-10 transition-all duration-300 group ${plan.destacado
                      ? 'bg-white ring-8 ring-indigo-500/5 shadow-2xl scale-[1.03] z-10 border-2 border-indigo-100'
                      : 'bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-xl'
                      }`}
                  >
                    {plan.destacado && (
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white text-[10px] font-black px-6 py-2 rounded-full shadow-xl uppercase tracking-widest">
                        Más Elegido
                      </div>
                    )}

                    <div className="mb-8">
                      <h4 className="text-2xl font-black text-slate-900 mb-3 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{plan.nombre}</h4>
                      <p className="text-sm font-bold text-slate-400 leading-snug min-h-[44px]">{plan.descripcion}</p>
                    </div>

                    <div className="mb-10">
                      <p className="text-[10px] font-black text-indigo-600 mb-1 uppercase tracking-widest">{plan.etiquetaPrecio}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-slate-900 tracking-tighter">${plan.precio}</span>
                        <span className="text-slate-400 font-bold text-xs">MXN</span>
                      </div>
                    </div>

                    <div className="h-px bg-slate-100 w-full mb-10"></div>

                    <ul className="space-y-4 mb-12 flex-1">
                      {plan.beneficios?.map((b, i) => (
                        <li key={i} className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-6 h-6 rounded-xl bg-green-50 flex items-center justify-center mt-0.5 group-hover:bg-green-100 transition-colors">
                            <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          </div>
                          <span className="text-[13px] text-slate-600 font-bold leading-tight">{b}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleRegistro(plan)}
                      className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 transform active:scale-[0.96] ${plan.destacado
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/30'
                        : 'bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-800'
                        }`}
                    >
                      Adquirir {plan.nombre}
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-20 p-8 rounded-[2rem] bg-indigo-900 text-center relative overflow-hidden">
                <p className="relative z-10 text-white/90 text-sm font-black italic max-w-3xl mx-auto leading-relaxed">
                  "El proceso de ingreso es mediato. Una vez confirmado el plan, tendrás acceso total a los contenidos diseñados para asegurar tu ingreso a la universidad."
                </p>
              </div>
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