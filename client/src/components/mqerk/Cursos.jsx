import React from 'react';
import Navbar from "./Navbar"; 
import Footer from "../../components/layout/footer";

import { 
  Curso1, Curso2, Curso3, Curso4, Curso5, Curso6, 
  Curso7, Curso8, Curso9, Curso10, Curso11, Curso12, Curso13 
} from "../../assets/mqerk/cursos";

const WHATSAPP_PHONE = "522871515760";

const buildWaLink = (courseTitle) => {
  const msg = `Hola, me gustaría inscribirme al curso: "${courseTitle}". ¿Podrían darme más información?`;
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`;
};

const LEVEL_COLORS = {
  'Básico': 'bg-green-100 text-green-800',
  'Intermedio': 'bg-blue-100 text-blue-800',
  'Avanzado': 'bg-purple-100 text-purple-800',
  'Todos los niveles': 'bg-gray-100 text-gray-800',
};

const courses = [
  { id: 1, category: 'student', title: 'Entrenamiento para el examen de admisión a la universidad', subtitle: 'Razonamiento y habilidades para aprobar el examen', level: 'Intermedio', duration: '8 semanas', modality: 'Presencial', students: 128, rating: 4.8, tags: ['Problemas', 'Razonamiento', 'Estrategias'], image: Curso1, to: '/entrenamiento_examen_admision_universidad' },
  { id: 2, category: 'student', title: 'Entrenamiento para el examen de admisión a la preparatoria', subtitle: 'Preparación completa en matemáticas y lógica', level: 'Básico', duration: '6 semanas', modality: 'Presencial', students: 100, rating: 4.7, tags: ['Matemáticas', 'Lógica', 'Estrategias'], image: Curso2 },
  { id: 3, category: 'student', title: 'Digi-Start: desbloquea tu potencial tecnológico', subtitle: 'Fundamentos y creatividad tecnológica', level: 'Básico', duration: '4 semanas', modality: 'Híbrido', students: 75, rating: 4.9, tags: ['Computación', 'Tecnología', 'Creatividad'], image: Curso3 },
  { id: 4, category: 'student', title: 'CodeLab: crea, aprende y programa', subtitle: 'Programación práctica y proyectos reales', level: 'Intermedio', duration: '6 semanas', modality: 'Híbrido', students: 90, rating: 4.8, tags: ['Programación', 'Proyectos', 'Codificación'], image: Curso4 },
  { id: 5, category: 'student', title: 'Level Up English: Aprende y Aplica', subtitle: 'Inglés práctico para el aula y la vida diaria', level: 'Todos los niveles', duration: '4 meses', modality: 'Híbrido', students: 210, rating: 4.9, tags: ['Inglés', 'Conversación', 'Práctica'], image: Curso5 },
  { id: 6, category: 'student', title: 'Business English Pro: comunica y destaca', subtitle: 'Inglés profesional y habilidades de comunicación', level: 'Avanzado', duration: '3 meses', modality: 'Híbrido', students: 80, rating: 4.7, tags: ['Inglés', 'Negocios', 'Comunicación'], image: Curso6 },
  { id: 7, category: 'student', title: 'Cálculo Diferencial e Integral', subtitle: 'Profundiza en matemáticas avanzadas', level: 'Avanzado', duration: '8 semanas', modality: 'Presencial', students: 60, rating: 4.6, tags: ['Cálculo', 'Integral', 'Diferencial'], image: Curso7 },
  { id: 8, category: 'student', title: 'Piensa & Resuelve: Pensamiento Matemático', subtitle: 'Desarrolla lógica y resolución de problemas', level: 'Intermedio', duration: '6 semanas', modality: 'Presencial', students: 85, rating: 4.8, tags: ['Lógica', 'Problemas', 'Razonamiento'], image: Curso8 },
  { id: 9, category: 'student', title: 'Ciencias Experimentales', subtitle: 'Experimenta y descubre los principios científicos', level: 'Básico', duration: '4 semanas', modality: 'Presencial', students: 70, rating: 4.7, tags: ['Experimentos', 'Ciencia', 'STEAM'], image: Curso9 },
  { id: 10, category: 'student', title: 'Estrategias psicoeducativas', subtitle: 'Herramientas para desarrollo emocional', level: 'Intermedio', duration: '1 mes', modality: 'Presencial', students: 50, rating: 4.6, tags: ['Psicoeducación', 'Habilidades'], image: Curso10 },
  { id: 11, category: 'teacher', title: 'Estrategias educativas para maestros', subtitle: 'Optimiza la enseñanza con metodologías innovadoras', level: 'Avanzado', duration: '2 meses', modality: 'Híbrido', students: 40, rating: 4.7, tags: ['Docentes', 'Metodologías', 'Innovación'], image: Curso11 },
  { id: 12, category: 'teacher', title: 'Tecnología aplicada en la enseñanza', subtitle: 'Descubre herramientas digitales para educadores', level: 'Intermedio', duration: '4 semanas', modality: 'Híbrido', students: 30, rating: 4.6, tags: ['Tecnología', 'Educación', 'Innovación'], image: Curso12 },
  { id: 13, category: 'teacher', title: 'Aula Inteligente: tecnología aplicada', subtitle: 'Aprende a crear aulas inteligentes y conectadas', level: 'Avanzado', duration: '6 semanas', modality: 'Híbrido', students: 25, rating: 4.7, tags: ['Aula', 'Inteligente', 'Tecnología'], image: Curso13 },
];

const CourseCard = ({ course }) => {
  const levelClass = LEVEL_COLORS[course.level] || 'bg-gray-100 text-gray-800';

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden flex flex-col h-full transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative h-48 overflow-hidden group">
        <img 
          src={course.image} 
          alt={course.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
        />
        <div className="absolute top-3 left-3 flex gap-2">
            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md shadow-sm ${levelClass}`}>
                {course.level}
            </span>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex-grow">
            <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2 line-clamp-2">{course.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{course.subtitle}</p>
            <div className="flex flex-wrap gap-1.5 mb-4">
            {course.tags.slice(0, 3).map(t => (
                <span key={t} className="text-[10px] font-medium px-2 py-0.5 bg-gray-50 text-gray-500 rounded border border-gray-100">{t}</span>
            ))}
            </div>
        </div>
        <div className="border-t border-gray-100 pt-3 mt-auto">
            <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                <div className="flex gap-3">
                    <span className="flex items-center gap-1">⏱ {course.duration}</span>
                    <span className="flex items-center gap-1">📍 {course.modality}</span>
                </div>
                <div className="flex items-center font-semibold text-yellow-500">
                    ★ {course.rating} <span className="text-gray-400 font-normal ml-1">({course.students})</span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                {course.to ? (
                    <a href={course.to} className="flex-1 text-center py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">Ver temario</a>
                ) : (
                   <span className="flex-1 text-center py-2 text-sm text-gray-400 bg-gray-50 rounded-lg cursor-not-allowed" title="Próximamente">Ver temario</span>
                )}
                <a href={buildWaLink(course.title)} target="_blank" rel="noopener noreferrer" className="flex-1 text-center py-2 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all">Inscribirme</a>
            </div>
        </div>
      </div>
    </div>
  );
};

const CourseSection = ({ title, list }) => (
  <section className="mb-20">
    <div className="flex items-center gap-4 mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 border-l-4 border-[#F4138A] pl-4">{title}</h2>
        <div className="h-px bg-gray-200 flex-grow rounded-full"></div>
    </div>
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {list.map(course => <CourseCard key={course.id} course={course} />)}
    </div>
  </section>
);

// --- AQUÍ ES DONDE ESTABA EL PROBLEMA ---
// Agregamos { fullPage } para recibir la orden desde App.js
export default function CursosGrid({ fullPage }) {
  const docentes = courses.filter(c => c.category === 'teacher');
  const estudiantes = courses.filter(c => c.category === 'student');

  return (
    <div className="flex flex-col min-h-screen">
        
        {/* SOLO mostramos Navbar si fullPage es true (cuando vienes desde /cursos) */}
        {fullPage && <Navbar />}

        <div className={`flex-grow ${fullPage ? "bg-gray-50" : "bg-transparent"}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <span className="text-indigo-600 font-semibold tracking-wide uppercase text-sm">Catálogo Educativo</span>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-[#F4138A] mt-2 mb-6">Explora nuestros cursos</h1>
                    <p className="text-lg text-gray-600 leading-relaxed">
                    Programas diseñados meticulosamente para desarrollar habilidades reales, aprobar exámenes y potenciar tu futuro. Todos incluyen <span className="font-bold text-indigo-700">certificación oficial</span>.
                    </p>
                </div>
                <CourseSection title="Cursos para Estudiantes" list={estudiantes} />
                <CourseSection title="Formación Docente" list={docentes} />
            </div>
        </div>

        {/* SOLO mostramos Footer si fullPage es true */}
        {fullPage && <Footer />}
    </div>
  );
}