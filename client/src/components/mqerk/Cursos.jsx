export default function CursosMinimal() {

const courses = [
  { id: 1, title: 'Entrenamiento para el examen de admisión a la universidad', subtitle: 'Razonamiento y habilidades para aprobar el examen', level: 'Intermedio', duration: '8 semanas', modality: 'Presencial', students: 128, rating: 4.8, tags: ['Problemas', 'Razonamiento', 'Estrategias'], certificado: true, image: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1200&q=60' },
  { id: 2, title: 'Entrenamiento para el examen de admisión a la preparatoria', subtitle: 'Preparación completa en matemáticas y lógica', level: 'Básico', duration: '6 semanas', modality: 'Presencial', students: 100, rating: 4.7, tags: ['Matemáticas', 'Lógica', 'Estrategias'], certificado: true, image: 'https://images.unsplash.com/photo-1532619675605-4d4b6aee9d9a?auto=format&fit=crop&w=1200&q=60' },
  { id: 3, title: 'Digi-Start: desbloquea tu potencial tecnológico (computación)', subtitle: 'Fundamentos y creatividad tecnológica', level: 'Básico', duration: '4 semanas', modality: 'Híbrido', students: 75, rating: 4.9, tags: ['Computación', 'Tecnología', 'Creatividad'], certificado: true, image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=60' },
  { id: 4, title: 'CodeLab: crea, aprende y programa (programación)', subtitle: 'Programación práctica y proyectos reales', level: 'Intermedio', duration: '6 semanas', modality: 'Híbrido', students: 90, rating: 4.8, tags: ['Programación', 'Proyectos', 'Codificación'], certificado: true, image: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?auto=format&fit=crop&w=1200&q=60' },
  { id: 5, title: 'Level Up English: Aprende y Aplica en la Escuela', subtitle: 'Inglés práctico para el aula y la vida diaria', level: 'Todos los niveles', duration: '4 meses', modality: 'Híbrido', students: 210, rating: 4.9, tags: ['Inglés', 'Conversación', 'Práctica'], certificado: true, image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=60' },
  { id: 6, title: 'Business English Pro: comunica y destaca', subtitle: 'Inglés profesional y habilidades de comunicación', level: 'Avanzado', duration: '3 meses', modality: 'Híbrido', students: 80, rating: 4.7, tags: ['Inglés', 'Negocios', 'Comunicación'], certificado: true, image: 'https://images.unsplash.com/photo-1526378724244-4a0ecbe60778?auto=format&fit=crop&w=1200&q=60' },
  { id: 7, title: 'Cálculo Diferencial e Integral para universitarios', subtitle: 'Profundiza en matemáticas avanzadas', level: 'Avanzado', duration: '8 semanas', modality: 'Presencial', students: 60, rating: 4.6, tags: ['Cálculo', 'Integral', 'Diferencial'], certificado: true, image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=60' },
  { id: 8, title: 'Piensa & Resuelve: Curso de Pensamiento Matemático', subtitle: 'Desarrolla lógica y resolución de problemas', level: 'Intermedio', duration: '6 semanas', modality: 'Presencial', students: 85, rating: 4.8, tags: ['Lógica', 'Problemas', 'Razonamiento'], certificado: true, image: 'https://images.unsplash.com/photo-1529270292312-1fc395c7b427?auto=format&fit=crop&w=1200&q=60' },
  { id: 9, title: 'Ciencias Experimentales: Interacciones y Transformaciones', subtitle: 'Experimenta y descubre los principios científicos', level: 'Básico', duration: '4 semanas', modality: 'Presencial', students: 70, rating: 4.7, tags: ['Experimentos', 'Ciencia', 'STEAM'], certificado: true, image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1200&q=60' },
  { id: 10, title: 'Estrategias psicoeducativas para jóvenes', subtitle: 'Herramientas para desarrollo emocional y académico', level: 'Intermedio', duration: '1 mes', modality: 'Presencial', students: 50, rating: 4.6, tags: ['Psicoeducación', 'Habilidades', 'Autocuidado'], certificado: true, image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=60' },
  { id: 11, title: 'Estrategias educativas para maestros', subtitle: 'Optimiza la enseñanza con metodologías innovadoras', level: 'Avanzado', duration: '2 meses', modality: 'Híbrido', students: 40, rating: 4.7, tags: ['Docentes', 'Metodologías', 'Innovación'], certificado: true, image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=60' },
  { id: 12, title: 'Tecnología aplicada en la enseñanza', subtitle: 'Descubre herramientas digitales para educadores', level: 'Intermedio', duration: '4 semanas', modality: 'Híbrido', students: 30, rating: 4.6, tags: ['Tecnología','Educación','Innovación'], certificado: true, image: 'https://images.unsplash.com/photo-1556012018-4843e3bb0a68?auto=format&fit=crop&w=1200&q=60' },
  { id: 13, title: 'Aula Inteligente: tecnología aplicada a la enseñanza', subtitle: 'Aprende a crear aulas inteligentes y conectadas', level: 'Avanzado', duration: '6 semanas', modality: 'Híbrido', students: 25, rating: 4.7, tags: ['Aula','Inteligente','Tecnología'], certificado: true, image: 'https://images.unsplash.com/photo-1581092334393-c61c128fd5ec?auto=format&fit=crop&w=1200&q=60' },
];

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4">
        {/* Encabezado */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#F4138A]">Nuestros cursos</h2>
          <div className="mx-auto mt-4 h-0.5 w-24 bg-[#3C24BA]" />
          <p className="mt-6 text-lg md:text-xl text-[#3c24ba] font-semibold">
            Asesores Especializados en la Enseñanza de las Ciencias y Tecnología
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {courses.map(c => (
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
                    <a href="#" className="text-sm font-semibold text-indigo-600">Ver temario</a>
                    <button className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm">Inscribirme</button>
                </div>
                </div>
            </div>
            ))}
        </div>
      </div>
    </section>
  );
}