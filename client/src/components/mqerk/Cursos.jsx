import Curso1 from "../../assets/mqerk/cursos/CURSO 1.webp";
import Curso2 from "../../assets/mqerk/cursos/CURSO 2.webp";
import Curso3 from "../../assets/mqerk/cursos/CURSO 3.webp";
import Curso4 from "../../assets/mqerk/cursos/CURSO 4.webp";
import Curso5 from "../../assets/mqerk/cursos/CURSO 5.webp";
import Curso6 from "../../assets/mqerk/cursos/CURSO 6.webp";
import Curso7 from "../../assets/mqerk/cursos/CURSO 7.webp";
import Curso8 from "../../assets/mqerk/cursos/CURSO 8.webp";
import Curso9 from "../../assets/mqerk/cursos/CURSO 9.webp";
import Curso10 from "../../assets/mqerk/cursos/CURSO 10.webp";
import Curso11 from "../../assets/mqerk/cursos/CURSO 11.webp";
import Curso12 from "../../assets/mqerk/cursos/CURSO 12.webp";
import Curso13 from "../../assets/mqerk/cursos/CURSO 13.webp";

const WHATSAPP_PHONE = "522871515760";

// Utilidad para generar el link con mensaje precargado
const buildWaLink = (courseTitle) => {
  const msg = `Hola, me gustaría inscribirme al curso: "${courseTitle}". ¿Podrían darme más información?`;
  const encoded = encodeURIComponent(msg);
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encoded}`;
};

const courses = [
  { id: 1, title: 'Entrenamiento para el examen de admisión a la universidad', subtitle: 'Razonamiento y habilidades para aprobar el examen', level: 'Intermedio', duration: '8 semanas', modality: 'Presencial', students: 128, rating: 4.8, tags: ['Problemas', 'Razonamiento', 'Estrategias'], certificado: true, image: Curso1, to: '/entrenamiento_examen_admision_universidad' },
  { id: 2, title: 'Entrenamiento para el examen de admisión a la preparatoria', subtitle: 'Preparación completa en matemáticas y lógica', level: 'Básico', duration: '6 semanas', modality: 'Presencial', students: 100, rating: 4.7, tags: ['Matemáticas', 'Lógica', 'Estrategias'], certificado: true, image: Curso2 },
  { id: 3, title: 'Digi-Start: desbloquea tu potencial tecnológico (computación)', subtitle: 'Fundamentos y creatividad tecnológica', level: 'Básico', duration: '4 semanas', modality: 'Híbrido', students: 75, rating: 4.9, tags: ['Computación', 'Tecnología', 'Creatividad'], certificado: true, image: Curso3},
  { id: 4, title: 'CodeLab: crea, aprende y programa (programación)', subtitle: 'Programación práctica y proyectos reales', level: 'Intermedio', duration: '6 semanas', modality: 'Híbrido', students: 90, rating: 4.8, tags: ['Programación', 'Proyectos', 'Codificación'], certificado: true, image: Curso4, },
  { id: 5, title: 'Level Up English: Aprende y Aplica en la Escuela', subtitle: 'Inglés práctico para el aula y la vida diaria', level: 'Todos los niveles', duration: '4 meses', modality: 'Híbrido', students: 210, rating: 4.9, tags: ['Inglés', 'Conversación', 'Práctica'], certificado: true, image: Curso5 },
  { id: 6, title: 'Business English Pro: comunica y destaca', subtitle: 'Inglés profesional y habilidades de comunicación', level: 'Avanzado', duration: '3 meses', modality: 'Híbrido', students: 80, rating: 4.7, tags: ['Inglés', 'Negocios', 'Comunicación'], certificado: true, image: Curso6 },
  { id: 7, title: 'Cálculo Diferencial e Integral para universitarios', subtitle: 'Profundiza en matemáticas avanzadas', level: 'Avanzado', duration: '8 semanas', modality: 'Presencial', students: 60, rating: 4.6, tags: ['Cálculo', 'Integral', 'Diferencial'], certificado: true, image: Curso7 },
  { id: 8, title: 'Piensa & Resuelve: Curso de Pensamiento Matemático', subtitle: 'Desarrolla lógica y resolución de problemas', level: 'Intermedio', duration: '6 semanas', modality: 'Presencial', students: 85, rating: 4.8, tags: ['Lógica', 'Problemas', 'Razonamiento'], certificado: true, image: Curso8 },
  { id: 9, title: 'Ciencias Experimentales: Interacciones y Transformaciones', subtitle: 'Experimenta y descubre los principios científicos', level: 'Básico', duration: '4 semanas', modality: 'Presencial', students: 70, rating: 4.7, tags: ['Experimentos', 'Ciencia', 'STEAM'], certificado: true, image: Curso9 },
  { id: 10, title: 'Estrategias psicoeducativas para jóvenes', subtitle: 'Herramientas para desarrollo emocional y académico', level: 'Intermedio', duration: '1 mes', modality: 'Presencial', students: 50, rating: 4.6, tags: ['Psicoeducación', 'Habilidades', 'Autocuidado'], certificado: true, image: Curso10 },
  { id: 11, title: 'Estrategias educativas para maestros', subtitle: 'Optimiza la enseñanza con metodologías innovadoras', level: 'Avanzado', duration: '2 meses', modality: 'Híbrido', students: 40, rating: 4.7, tags: ['Docentes', 'Metodologías', 'Innovación'], certificado: true, image: Curso11, },
  { id: 12, title: 'Tecnología aplicada en la enseñanza', subtitle: 'Descubre herramientas digitales para educadores', level: 'Intermedio', duration: '4 semanas', modality: 'Híbrido', students: 30, rating: 4.6, tags: ['Tecnología','Educación','Innovación'], certificado: true, image: Curso12 },
  { id: 13, title: 'Aula Inteligente: tecnología aplicada a la enseñanza', subtitle: 'Aprende a crear aulas inteligentes y conectadas', level: 'Avanzado', duration: '6 semanas', modality: 'Híbrido', students: 25, rating: 4.7, tags: ['Aula','Inteligente','Tecnología'], certificado: true, image: Curso13 },
];

export default function CursosGrid() {
  const docentes = courses.filter(c => c.id === 12 || c.id === 13);
  const estudiantes = courses.filter(c => c.id !== 12 && c.id !== 13);

  const SeccionCursos = ({ titulo, lista }) => (
    <section className="mb-16">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-indigo-700">{titulo}</h2>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {lista.map(c => (
          <div key={c.id} className="bg-white rounded-2xl shadow-md overflow-hidden transform hover:-translate-y-2 transition">
            <div className="relative h-40">
              <img src={c.image} alt={c.title} className="w-full h-full object-cover" />
              <span className="absolute top-3 left-3 bg-indigo-600 text-white text-xs font-semibold px-2 py-1 rounded">{c.level}</span>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold leading-snug">{c.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{c.subtitle}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {c.tags.map(t => (<span key={t} className="text-xs px-2 py-1 bg-gray-100 rounded-full">{t}</span>))}
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-3">
                  <span className="inline-block px-2 py-1 border rounded">{c.duration}</span>
                  <span className="inline-block px-2 py-1 border rounded">{c.modality}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{c.rating} ★</div>
                  <div className="text-xs">{c.students} alumnos</div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <a href={c.to} className="text-sm font-semibold text-indigo-600">Ver temario</a>
                <a
                  href={buildWaLink(c.title)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Inscribirme en WhatsApp al curso ${c.title}`}
                  className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  Inscribirme
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-extrabold leading-tight text-[#F4138A]">Nuestros cursos</h2>
        <p className="mt-2 text-gray-600">
          Programas diseñados para desarrollar habilidades reales y aprobar exámenes. Todos los cursos incluyen <span className="font-semibold">certificado</span>.
        </p>
      </div>
      <SeccionCursos titulo="Cursos para Estudiantes" lista={estudiantes} />
      <SeccionCursos titulo="Cursos para Docentes" lista={docentes} />
    </div>
  );
}
