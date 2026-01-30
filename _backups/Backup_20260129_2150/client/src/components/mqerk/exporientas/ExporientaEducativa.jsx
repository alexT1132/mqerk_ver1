import React, { useState, useEffect } from 'react'
import Navbar from '../../../components/mqerk/Navbar'
import Uno from "../../../assets/mqerk/Fotos Estudiantes/exporientas.png";
import Dos from "../../../assets/mqerk/Fotos Estudiantes/exporientas (2).png";
import Tres from "../../../assets/mqerk/Fotos Estudiantes/exporientas (3).png";
import Primero from "../../../assets/mqerk/veranotx/01.png";
import Segundo from "../../../assets/mqerk/veranotx/02.png";
import Tercero from "../../../assets/mqerk/veranotx/03.png";
import Cuarto from "../../../assets/mqerk/veranotx/04.png";
import Quinto from "../../../assets/mqerk/veranotx/05.png";
import Sexto from "../../../assets/mqerk/veranotx/06.png";
import Septimo from "../../../assets/mqerk/veranotx/07.png";
import { Link } from "react-router-dom";
import Footer from "../../../components/layout/footer";

function Exporientas() {
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
            to="/exporientas" 
            className="inline-flex items-center gap-2 text-purple-100 hover:text-white transition-colors mb-6 group"
          >
            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a exporientas
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-400 text-yellow-900 animate-pulse">
              PRIMERA EDICIÓN
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold animate-fade-in">
            1ra. EXPO-ORIENTA Educativa 2024
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
                Los asesores de MQerKAcademy participaron activamente en la Exporienta Educativa edición 2024-2025, donde, 
                a través de pláticas, talleres, stands informativos y actividades interactivas, los estudiantes tuvieron la 
                oportunidad de aclarar dudas sobre su futuro académico, recibir orientación personalizada y conocer estrategias 
                educativas para fortalecer sus habilidades y prepararse para el ingreso al nivel superior.
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
                  text="Brindar orientación vocacional a los estudiantes a través de charlas y talleres." 
                  delay="0"
                />
                <ObjectiveItem 
                  text="Ayudarles a tomar decisiones informadas sobre su futuro académico y profesional." 
                  delay="100"
                />
                <ObjectiveItem 
                  text="Acercarlos a instituciones de educación superior con información actualizada y útil." 
                  delay="200"
                />
              </ul>
            </section>

            {/* Special Note - RÉCORD ABSOLUTO */}
            <section className="bg-gradient-to-r from-red-100 via-orange-100 to-yellow-100 rounded-2xl shadow-md p-6 sm:p-8 animate-slide-up border-l-4 border-red-600" style={{ animationDelay: '200ms' }}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <svg className="w-10 h-10 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-xl text-red-900 mb-2 flex items-center gap-2">
                    ¡RÉCORD HISTÓRICO! 🏆
                  </h3>
                  <p className="text-red-800 leading-relaxed mb-3">
                    Con <span className="font-black text-2xl text-red-900">1,000 asistentes</span>, este evento marca un 
                    hito en la historia de MQerKAcademy como la <span className="font-bold">expo más grande jamás realizada</span>, 
                    superando todos los registros anteriores y consolidando nuestro compromiso con la educación y orientación 
                    vocacional de los jóvenes.
                  </p>
                  <div className="bg-white/50 rounded-lg p-3 mt-3">
                    <p className="text-sm text-red-900 font-semibold">
                      📊 Primera edición: El inicio de una tradición educativa anual
                    </p>
                  </div>
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
                <InfoItem icon={Primero} text="18 de Octubre del 2024" />
                <InfoItem icon={Segundo} text="Dirigido a: Estudiantes de preparatoria" />
                <InfoItem icon={Tercero} text="San Juan Bautista Tuxtepec, Oaxaca." />
                <InfoItem icon={Cuarto} text="Instalaciones: CBTIS 107" special />
                <InfoItem icon={Quinto} text="1,000 asistentes" recordAbsolute />
                <InfoItem icon={Sexto} text="5 horas" />
                <InfoItem icon={Septimo} text="No aplica" />
              </div>
            </div>
          </div>
        </div>

        {/* No Related Workshops - Primera edición, evento único */}
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
function InfoItem({ icon, text, special = false, recordAbsolute = false }) {
  let colorClass = 'text-gray-700';
  if (special) colorClass = 'text-purple-600 font-semibold';
  if (recordAbsolute) colorClass = 'text-red-600 font-black text-lg';

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

export default Exporientas;