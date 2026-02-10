import { useState, useEffect } from 'react'
import Navbar from '../../../components/mqerk/Navbar'
import Uno from "../../../assets/mqerk/Fotos Estudiantes/talleres.webp";
import Dos from "../../../assets/mqerk/Fotos Estudiantes/talleres (2).webp";
import Tres from "../../../assets/mqerk/Fotos Estudiantes/talleres (3).webp";
import Cuatro from "../../../assets/mqerk/talleres/4.webp";
import Cinco from "../../../assets/mqerk/talleres/3.webp";
import Seis from "../../../assets/mqerk/talleres/2.webp";
import Primero from "../../../assets/mqerk/veranotx/01.webp";
import Segundo from "../../../assets/mqerk/veranotx/02.webp";
import Tercero from "../../../assets/mqerk/veranotx/03.webp";
import Cuarto from "../../../assets/mqerk/veranotx/04.webp";
import Quinto from "../../../assets/mqerk/veranotx/05.webp";
import Sexto from "../../../assets/mqerk/veranotx/06.webp";
import Septimo from "../../../assets/mqerk/veranotx/07.webp";
import { Link } from "react-router-dom";
import Footer from "../../../components/layout/footer";

function Talleres() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [forward, setForward] = useState(true);

  const images = [Uno, Dos, Tres];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        if (forward) {
          if (prev === images.length - 1) {
            setForward(false);
            return prev - 1;
          }
          return prev + 1;
        } else {
          if (prev === 0) {
            setForward(true);
            return prev + 1;
          }
          return prev - 1;
        }
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [forward]);

  const getLeftImage = () => images[(currentIndex - 1 + images.length) % images.length];
  const getRightImage = () => images[(currentIndex + 1) % images.length];

  return (
    <div className='min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white'>
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-600 via-indigo-700 to-purple-800 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Link 
            to="/talleres" 
            className="inline-flex items-center gap-2 text-purple-100 hover:text-white transition-colors mb-6 group"
          >
            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a talleres
          </Link>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold animate-fade-in">
            IA para la Enseñanza en el Aula
          </h1>
        </div>
      </div>

      {/* Carousel - Responsive con clases propias */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="contenedor-carrusel-talleres animate-fade-in">
          <div className="galeria-carrusel-talleres">
            <img src={getLeftImage()} alt="left" className="foto-carrusel-talleres foto-izquierda-talleres" />
            <img src={images[currentIndex]} alt="center" className="foto-carrusel-talleres foto-central-talleres" />
            <img src={getRightImage()} alt="right" className="foto-carrusel-talleres foto-derecha-talleres" />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column - Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Resumen */}
            <section className="bg-white rounded-2xl shadow-md p-6 sm:p-8 animate-slide-up">
              <h2 className="text-2xl sm:text-3xl font-bold text-purple-800 mb-4 flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-purple-600 to-indigo-600 rounded-full"></div>
                Resumen
              </h2>
              <p className="text-gray-700 leading-relaxed text-justify">
                La Escuela Primaria Urbana Fernando Montes de Oca contó con la participación del Asesor Kelvin Valentin 
                Gómez Ramírez, CEO de MQerKAcademy y experto en el uso de la inteligencia artificial en la educación, quien 
                compartió su conocimiento y experiencia con los docentes y directores de la escuela. Este taller fue posible 
                gracias a la colaboración con la UNID Campus Tuxtepec, quienes apoyan la innovación educativa y el uso de 
                nuevas tecnologías para transformar el aprendizaje en las aulas.
              </p>
            </section>

            {/* Objetivos */}
            <section className="bg-white rounded-2xl shadow-md p-6 sm:p-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <h2 className="text-2xl sm:text-3xl font-bold text-purple-800 mb-6 flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-purple-600 to-indigo-600 rounded-full"></div>
                Objetivos
              </h2>
              <ul className="space-y-4">
                <ObjectiveItem 
                  text="Conocimiento en el uso de la inteligencia artificial en la educación." 
                  delay="0"
                />
                <ObjectiveItem 
                  text="Concienciar a los docentes sobre el impacto actual y futuro de la IA en la educación." 
                  delay="100"
                />
                <ObjectiveItem 
                  text="Explorar el potencial de la inteligencia artificial como herramienta para mejorar los procesos de enseñanza y aprendizaje en el aula." 
                  delay="200"
                />
              </ul>
            </section>
          </div>

          {/* Right Column - Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 sticky top-24 animate-slide-up" style={{ animationDelay: '200ms' }}>
              {/* Bordes decorativos */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-pink-500 rounded-tl-2xl"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-pink-500 rounded-br-2xl"></div>

              <div className="space-y-6 pt-6">
                <InfoItem icon={Primero} text="25 de Marzo del 2025" />
                <InfoItem icon={Segundo} text="Dirigido a: docentes de nivel primaria" />
                <InfoItem icon={Tercero} text="San Juan Bautista Tuxtepec, Oaxaca." />
                <InfoItem icon={Cuarto} text="Instalaciones: Esc. Prim. Urb. Fernando Montes de Oca" />
                <InfoItem icon={Quinto} text="35 asistentes" />
                <InfoItem icon={Sexto} text="2 horas" />
                <InfoItem icon={Septimo} text="No aplica" />
              </div>
            </div>
          </div>
        </div>

        {/* Related Workshops */}
        <section className="mt-20">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-purple-700 mb-12 animate-slide-up">
            También puedes ver
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <RelatedWorkshopCard
              to='/talleres/ia_en_la_salud'
              image={Seis}
              title="IA en la salud"
              description="Sesión informativa para el personal del sector salud sobre inteligencia artificial aplicada a la innovación médica y la prevención de fraudes digitales."
              date="18 de marzo"
              delay="0"
            />
            <RelatedWorkshopCard
              to='/talleres/ia_en_la_gestion_emp'
              image={Cinco}
              title="IA en la gestión empresarial"
              description="Ejecutivos conocieron cómo aplicar la inteligencia artificial para optimizar procesos y tomar decisiones en la Compañía Cervecera del Trópico."
              date="07 de marzo"
              delay="100"
            />
            <RelatedWorkshopCard
              to='/talleres/tecnomate'
              image={Cuatro}
              title="TecnoMate"
              description="Los docentes fueron capacitados en el uso de herramientas tecnológicas con el objetivo de mejorar la enseñanza y el aprendizaje de las matemáticas."
              date="07 de enero"
              delay="200"
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

// Componente de ítem de objetivo con animación
function ObjectiveItem({ text, delay = "0" }) {
  return (
    <li 
      className="flex items-start gap-3 group animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex-shrink-0 mt-1.5">
        <div className="w-2 h-2 rounded-full bg-purple-600 group-hover:scale-125 transition-transform duration-300"></div>
      </div>
      <span className="text-gray-700 leading-relaxed">{text}</span>
    </li>
  );
}

// Componente de información con icono
function InfoItem({ icon, text }) {
  return (
    <div className="flex items-start gap-3 group hover:translate-x-1 transition-transform duration-300">
      <div className="flex-shrink-0">
        <img src={icon} alt="" className="w-7 h-7 object-contain" />
      </div>
      <p className="text-gray-700 leading-relaxed">{text}</p>
    </div>
  );
}

// Componente de tarjeta relacionada
function RelatedWorkshopCard({ to, image, title, description, date, delay = "0" }) {
  return (
    <Link 
      to={to} 
      className="group flex flex-col bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Imagen */}
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
        <h3 className="text-xl font-bold text-purple-800 mb-3 group-hover:text-purple-600 transition-colors min-h-[3rem]">
          {title}
        </h3>

        <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1">
          {description}
        </p>

        {/* Fecha */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-semibold text-gray-700">{date}</span>
          </div>
          
          <svg className="w-5 h-5 text-purple-600 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Borde animado */}
      <div className="h-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
    </Link>
  );
}

export default Talleres;