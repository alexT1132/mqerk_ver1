import React, { useState, useEffect } from 'react'
import Navbar from '../../../components/mqerk/Navbar'
import Uno from "../../../assets/mqerk/Fotos Estudiantes/33.png";
import Dos from "../../../assets/mqerk/Fotos Estudiantes/34.png";
import Tres from "../../../assets/mqerk/Fotos Estudiantes/35.png";
import Primero from "../../../assets/mqerk/veranotx/01.png";
import Segundo from "../../../assets/mqerk/veranotx/02.png";
import Tercero from "../../../assets/mqerk/veranotx/03.png";
import Cuarto from "../../../assets/mqerk/veranotx/04.png";
import Quinto from "../../../assets/mqerk/veranotx/05.png";
import Sexto from "../../../assets/mqerk/veranotx/06.png";
import Septimo from "../../../assets/mqerk/veranotx/07.png";
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
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold animate-fade-in">
            Tecnología Artificial Aplicada en la Educación
          </h1>
        </div>
      </div>

      {/* Carousel */}
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
                Repensar la educación en tiempos digitales. Durante una conferencia virtual realizada en contexto de 
                pandemia, Kelvin Ramírez, de MQerKAcademy, llevó a los participantes a un recorrido por las fronteras 
                de la inteligencia artificial aplicada a la enseñanza. Se analizaron ejemplos reales de asistentes 
                virtuales, tutorías inteligentes, personalización del aprendizaje y análisis predictivo del rendimiento 
                escolar. Pero más allá de lo técnico, se plantearon reflexiones profundas sobre los retos éticos, la 
                privacidad de los datos y el nuevo rol del docente en un ecosistema educativo que evoluciona aceleradamente. 
                La propuesta: usar la tecnología como aliada para transformar la educación básica y superior, sin perder 
                el enfoque humano.
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
                  text="Informar sobre las tecnologías de IA en la educación." 
                  delay="0"
                />
                <ObjectiveItem 
                  text="Reflexionar sobre los desafíos éticos y sociales de su uso." 
                  delay="100"
                />
                <ObjectiveItem 
                  text="Proponer estrategias para integrar la IA de manera responsable en las instituciones educativas." 
                  delay="200"
                />
              </ul>
            </section>

            {/* Special Note - Conferencia Virtual durante Pandemia */}
            <section className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl shadow-md p-6 sm:p-8 animate-slide-up border-l-4 border-purple-600" style={{ animationDelay: '200ms' }}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-purple-900 mb-2">Conferencia Virtual</h3>
                  <p className="text-purple-800 leading-relaxed">
                    Este evento histórico se realizó de manera virtual durante el contexto de la pandemia COVID-19, 
                    demostrando la adaptabilidad de MQerKAcademy y el poder de la tecnología para seguir educando 
                    incluso en tiempos difíciles.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 sticky top-24 animate-slide-up" style={{ animationDelay: '300ms' }}>
              {/* Bordes decorativos */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-pink-500 rounded-tl-2xl"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-pink-500 rounded-br-2xl"></div>

              <div className="space-y-6 pt-6">
                <InfoItem icon={Primero} text="11 de Noviembre del 2021" highlight />
                <InfoItem icon={Segundo} text="Dirigido a: Estudiantes del CBTIS" />
                <InfoItem icon={Tercero} text="San Juan Bautista Tuxtepec, Oaxaca." />
                <InfoItem icon={Cuarto} text="Instalaciones: MQerKAcademy (Virtual)" special />
                <InfoItem icon={Quinto} text="300 asistentes" mega />
                <InfoItem icon={Sexto} text="2 horas" />
                <InfoItem icon={Septimo} text="No aplica" />
              </div>
            </div>
          </div>
        </div>

        {/* No Related Workshops - Este es el taller más antiguo */}
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
function InfoItem({ icon, text, highlight = false, special = false, mega = false }) {
  let colorClass = 'text-gray-700';
  if (highlight) colorClass = 'text-indigo-600 font-semibold';
  if (special) colorClass = 'text-purple-600 font-semibold';
  if (mega) colorClass = 'text-rose-600 font-bold text-base';

  return (
    <div className="flex items-start gap-3 group hover:translate-x-1 transition-transform duration-300">
      <div className="flex-shrink-0">
        <img src={icon} alt="" className="w-7 h-7 object-contain" />
      </div>
      <p className={`leading-relaxed text-sm ${colorClass}`}>
        {text}
      </p>
    </div>
  );
}

export default Talleres;