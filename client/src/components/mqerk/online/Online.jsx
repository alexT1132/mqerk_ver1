import Navbar from '../../../components/mqerk/Navbar'
import Uno from "../../../assets/mqerk/online/1.webp";
import Dos from "../../../assets/mqerk/online/2.webp";
import Tres from "../../../assets/mqerk/online/3.webp";
import Cuatro from "../../../assets/mqerk/online/4.webp";
import Cinco from "../../../assets/mqerk/online/5.webp";
import Seis from "../../../assets/mqerk/online/6.webp";
import Siete from "../../../assets/mqerk/online/7.webp";
import Ocho from "../../../assets/mqerk/online/8.webp";
import Nueve from "../../../assets/mqerk/online/9.webp";
import Diez from "../../../assets/mqerk/online/10.webp";
import { Link } from 'react-router-dom'
import Footer from "../../footer";

function Talleres() {
  return (
    <div className='min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white'>
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-600 via-indigo-700 to-purple-800 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 animate-fade-in">
            ONLINE
          </h1>
          <p className="text-purple-100 text-lg sm:text-xl max-w-2xl mx-auto animate-fade-in-delay">
            Conferencias, talleres y cursos virtuales que trascienden fronteras
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        
        {/* 2025 - CENTRADO */}
        <YearSection year="2025" />
        <div className="flex justify-center mb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl w-full">
            <OnlineCard
              to='/mqerk/online/guardianes_disruptivos'
              image={Uno}
              title="Guardianes Disruptivos: cambiando el rumbo, transformando la educación"
              description="Explorando las tendencias y la Inteligencia Artificial para transformar la educación."
              date="24 de enero"
              delay="0"
            />
            <OnlineCard
              image={Dos}
              title="Entrenamiento para el examen de admisión a la universidad 2025"
              description="Regreso a clases de nuestr@s estudiantes del curso: Entrenamiento para el examen de admisión a la universidad 2025."
              date="04 de enero"
              delay="100"
            />
          </div>
        </div>

        {/* 2024 */}
        <YearSection year="2024" />
        <div className="flex justify-center mb-20">
          <div className="w-full max-w-md">
            <OnlineCard
              image={Tres}
              title='Apertura del curso "Acredita el examen de admisión a la universidad 2024"'
              description="Iniciativa diseñada para fortalecer los conocimientos y habilidades clave requeridos en las principales evaluaciones de ingreso a nivel superior."
              date="16 de julio"
              delay="0"
            />
          </div>
        </div>

        {/* 2023 */}
        <YearSection year="2023" />
        <div className="flex justify-center mb-20">
          <div className="w-full max-w-md">
            <OnlineCard
              to='/mqerk/online/eeau23'
              image={Cuatro}
              title="Testimonios: ACREDITA EL EXAMEN DE ADMISIÓN A LA UNIVERSIDAD 2023"
              description="Pregunta detonante: ¿Cómo fue tu experiencia en la primera simulación del examen de admisión a la universidad?"
              date="23 de febrero"
              delay="0"
            />
          </div>
        </div>

        {/* 2022 */}
        <YearSection year="2022" />
        <div className="flex justify-center mb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl w-full">
            <OnlineCard
              to='/mqerk/online/todas_y_todos'
              image={Cinco}
              title="Todas y todos por una educación disruptiva y sostenible"
              description="Alumnos de MQerKAcademy mostraron la participación en realizar una actividad con el fin de aportar a la educación desde su definición-problemática y solución."
              date="24 de enero"
              delay="0"
            />
            <OnlineCard
              to='/mqerk/online/foro'
              image={Seis}
              title="Foro: Día internacional de la educación"
              description="M.M. Kelvin Ramírez dio a conocer cómo la educación ha logrado un giro de 180° en las nuevas formas de aprendizaje y enseñanza."
              date="24 de enero"
              delay="100"
            />
          </div>
        </div>

        {/* 2021 */}
        <YearSection year="2021" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          <OnlineCard
            image={Siete}
            title="¿Cómo brinqué de la industria a la ciencia?"
            description="Dr. Edgar Krötzsch dio una plática vía Zoom hacia los egresados y/o profesionales."
            date="28 de marzo"
            delay="0"
          />
          <OnlineCard
            to='/mqerk/online/matematicas_para_un_mundo_mejor'
            image={Ocho}
            title="Matemáticas para un mundo mejor"
            description="M.M. Kelvin Ramírez se dirige a los espectadores de MQerKAcademy acerca de las matemáticas y cómo se utilizan en el mundo."
            date="14 de marzo"
            delay="100"
          />
          <OnlineCard
            to='/mqerk/online/ciencia_en_alimentos_fermentados'
            image={Nueve}
            title="Ciencia en alimentos fermentados"
            description="En compañía del Dr. en Ciencias Cirilo Nolasco Hipólito, se exploraron los procesos y beneficios de los alimentos fermentados."
            date="20 de enero"
            delay="200"
          />
          <OnlineCard
            to='/mqerk/online/ingles_2021'
            image={Diez}
            title="Inglés, el idioma dominio ante la entrada en vigor del T-MEC"
            description="El Dr. Hermes Meza expuso temas relacionados con el dominio del idioma inglés, las estrategias para su adquisición y las exigencias lingüísticas del contexto actual."
            date="19 de enero"
            delay="300"
          />
        </div>

      </main>

      <Footer />
    </div>
  )
}

// Componente para títulos de año
function YearSection({ year }) {
  return (
    <div className="mb-12 text-center">
      <div className="inline-flex items-center gap-4">
        <div className="h-px w-12 sm:w-24 bg-gradient-to-r from-transparent to-purple-300"></div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-purple-700 animate-slide-up">
          {year}
        </h2>
        <div className="h-px w-12 sm:w-24 bg-gradient-to-l from-transparent to-purple-300"></div>
      </div>
    </div>
  );
}

// Componente de tarjeta online con animaciones
function OnlineCard({ to, image, title, description, date, delay = "0" }) {
  const CardWrapper = to ? Link : 'div';
  const cardProps = to ? { to } : {};

  return (
    <CardWrapper 
      {...cardProps}
      className="group flex flex-col bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Imagen con efecto zoom */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
        <img 
          src={image} 
          alt={title}
          className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
      </div>

      {/* Contenido */}
      <div className="flex flex-col flex-1 p-6">
        {/* Título */}
        <h3 className="text-lg font-bold text-purple-800 mb-3 group-hover:text-purple-600 transition-colors duration-300 min-h-[4rem] line-clamp-3">
          {title}
        </h3>

        {/* Descripción */}
        <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">
          {description}
        </p>

        {/* Fecha con icono */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <svg 
              className="w-5 h-5 text-purple-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
            <span className="text-sm font-semibold text-gray-700">{date}</span>
          </div>
          
          {/* Flecha animada solo si tiene link */}
          {to && (
            <svg 
              className="w-5 h-5 text-purple-600 transform group-hover:translate-x-1 transition-transform duration-300" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5l7 7-7 7" 
              />
            </svg>
          )}
        </div>
      </div>

      {/* Borde animado en hover */}
      <div className="h-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
    </CardWrapper>
  );
}

export default Talleres;