import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from "./Navbar";
import Footer from "../../components/layout/footer";
import { useCursos } from "../../context/CursosContext";
import { usePreview } from "../../context/PreviewContext"; // Importar PreviewContext
import { Curso1 } from "../../assets/mqerk/cursos"; // Importar imagen local

const LEVEL_COLORS = {
  'BASICO': 'bg-emerald-100 text-emerald-800',
  'INTERMEDIO': 'bg-blue-100 text-blue-800',
  'AVANZADO': 'bg-purple-100 text-purple-800',
  'Básico': 'bg-emerald-100 text-emerald-800',
  'Intermedio': 'bg-blue-100 text-blue-800',
  'Avanzado': 'bg-purple-100 text-purple-800',
};

const LEVEL_DISPLAY = {
  'BASICO': 'Básico',
  'INTERMEDIO': 'Intermedio',
  'AVANZADO': 'Avanzado',
  'Básico': 'Básico',
  'Intermedio': 'Intermedio',
  'Avanzado': 'Avanzado',
};

const MODALITY_DISPLAY = {
  'PRESENCIAL': 'Presencial',
  'ONLINE': 'En línea',
  'HIBRIDO': 'Híbrido',
  'Presencial': 'Presencial',
  'En línea': 'En línea',
  'Híbrido': 'Híbrido',
};


const CourseCard = ({ course }) => {
  const navigate = useNavigate();

  const levelKey = course.nivel || 'INTERMEDIO';
  const levelClass = LEVEL_COLORS[levelKey] || 'bg-gray-100 text-gray-800';
  const levelDisplay = LEVEL_DISPLAY[levelKey] || levelKey;
  const modalityDisplay = MODALITY_DISPLAY[course.modalidad] || course.modalidad;

  // Generar URL amigable desde el nombre del curso
  const generateCourseUrl = (courseName) => {
    return courseName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
      .replace(/[^a-z0-9\s-]/g, '') // Eliminar caracteres especiales
      .trim()
      .replace(/\s+/g, '-'); // Reemplazar espacios con guiones
  };

  const handleVerTemario = () => {
    const courseUrl = generateCourseUrl(course.nombre);
    navigate(`/curso/${courseUrl}`, {
      state: {
        curso: course
      }
    });
  };

  const handleInscribirme = () => {
    const courseUrl = generateCourseUrl(course.nombre);
    navigate(`/curso/${courseUrl}`, {
      state: {
        curso: course,
        openModal: true // Flag para abrir el modal automáticamente
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden flex flex-col h-full transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative h-48 overflow-hidden group">
        {course.imagenUrl ? (
          <img
            src={course.imagenUrl}
            alt={course.nombre}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              if (course.nombre && (course.nombre.toLowerCase().includes('examen de admisión') || course.nombre.toLowerCase().includes('eeau'))) {
                e.target.src = Curso1;
              } else {
                e.target.style.display = 'none';
                e.target.parentElement.classList.add('bg-gray-200');
              }
              e.target.onerror = null;
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
            <svg className="w-16 h-16 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md shadow-sm ${levelClass}`}>
            {levelDisplay}
          </span>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex-grow">
          <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2 line-clamp-2">
            {course.nombre}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {course.subtitulo || 'Descripción del curso'}
          </p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {course.tags.slice(0, 3).map((t, idx) => (
              <span
                key={`${t}-${idx}`}
                className="text-[10px] font-medium px-2 py-0.5 bg-gray-50 text-gray-500 rounded border border-gray-100"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <div className="border-t border-gray-100 pt-3 mt-auto">
          <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
            <div className="flex gap-3">
              <span className="flex items-center gap-1">
                ⏱ {course.duration} {course.durationUnit}
              </span>
              <span className="flex items-center gap-1">
                📍 {modalityDisplay}
              </span>
            </div>
            <div className="flex items-center font-semibold text-yellow-500">
              ★ {course.rating.toFixed(1)}
              <span className="text-gray-400 font-normal ml-1">
                ({course.alumnos})
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleVerTemario}
              className="flex-1 text-center py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              Ver temario
            </button>
            <button
              onClick={handleInscribirme}
              className="flex-1 text-center py-2 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all"
            >
              Inscribirme
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CourseSection = ({ title, list, loading }) => {
  if (loading) {
    return (
      <section className="mb-20">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 border-l-4 border-[#F4138A] pl-4">
            {title}
          </h2>
          <div className="h-px bg-gray-200 flex-grow rounded-full"></div>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-5 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (list.length === 0) {
    return (
      <section className="mb-20">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 border-l-4 border-[#F4138A] pl-4">
            {title}
          </h2>
          <div className="h-px bg-gray-200 flex-grow rounded-full"></div>
        </div>
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-500">No hay cursos disponibles en esta sección</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-20">
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 border-l-4 border-[#F4138A] pl-4">
          {title}
        </h2>
        <div className="h-px bg-gray-200 flex-grow rounded-full"></div>
      </div>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </section>
  );
};

export default function CursosGrid({ fullPage }) {
  const { cursos, loading, ObtenerCursos } = useCursos();

  useEffect(() => {
    ObtenerCursos();
  }, [ObtenerCursos]);

  const estudiantes = cursos.filter(c => c.section === 'alumnos');
  const docentes = cursos.filter(c => c.section === 'docentes');

  return (
    <div className="flex flex-col min-h-screen">
      {fullPage && <Navbar />}

      <div className={`flex-grow ${fullPage ? "bg-gray-50" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-indigo-600 font-semibold tracking-wide uppercase text-sm">
              Catálogo Educativo
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#F4138A] mt-2 mb-6">
              Explora nuestros cursos
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Programas diseñados meticulosamente para desarrollar habilidades reales, aprobar exámenes y potenciar tu futuro.
              Todos incluyen <span className="font-bold text-indigo-700">certificación oficial</span>.
            </p>
          </div>

          <CourseSection
            title="Cursos para Estudiantes"
            list={estudiantes}
            loading={loading}
          />

          <CourseSection
            title="Formación Docente"
            list={docentes}
            loading={loading}
          />
        </div>
      </div>

      {fullPage && <Footer />}
    </div>
  );
}