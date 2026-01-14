import React, { useState, useEffect } from 'react'
import Navbar from '../../../components/mqerk/Navbar'
import Uno from "../../../assets/mqerk/Fotos Estudiantes/39.png";
import Dos from "../../../assets/mqerk/Fotos Estudiantes/40.png";
import Tres from "../../../assets/mqerk/Fotos Estudiantes/41.png";
import Primero from "../../../assets/mqerk/veranotx/01.png";
import Segundo from "../../../assets/mqerk/veranotx/02.png";
import Tercero from "../../../assets/mqerk/veranotx/03.png";
import Cuarto from "../../../assets/mqerk/veranotx/04.png";
import Quinto from "../../../assets/mqerk/veranotx/05.png";
import Sexto from "../../../assets/mqerk/veranotx/06.png";
import Septimo from "../../../assets/mqerk/veranotx/07.png";
import { Link } from "react-router-dom";
import Footer from "../../footer";

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
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold animate-fade-in">
            Feria Profesiográfica
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
                En el COBAO Plantel 07, nuestros asesores de MQerKAcademy participaron activamente en la Feria 
                Profesiográfica edición 2024-2025, brindando a los estudiantes pláticas, talleres, stands informativos 
                y actividades interactivas. Estas dinámicas permitieron a los alumnos resolver dudas sobre su futuro 
                académico, recibir orientación vocacional personalizada y conocer las herramientas que MQerKAcademy 
                pone a su alcance para prepararse eficazmente para el examen de admisión al nivel superior, además de 
                fortalecer habilidades clave en ciencia, tecnología y pensamiento crítico.
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
                  text="Orientar a los estudiantes con charlas y talleres que les ayuden a identificar sus intereses y habilidades." 
                  delay="0"
                />
                <ObjectiveItem 
                  text="Conectar a los estudiantes con instituciones de educación superior y brindarles información actualizada." 
                  delay="100"
                />
              </ul>
            </section>

            {/* Special Note - Evento Masivo */}
            <section className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl shadow-md p-6 sm:p-8 animate-slide-up border-l-4 border-amber-600" style={{ animationDelay: '200ms' }}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-amber-900 mb-2">¡Evento Masivo! 🎉</h3>
                  <p className="text-amber-800 leading-relaxed">
                    Con <span className="font-bold text-amber-900">600 asistentes</span>, esta feria es uno de los 
                    eventos más grandes organizados por MQerKAcademy, demostrando nuestro compromiso con la orientación 
                    vocacional y el futuro académico de los jóvenes.
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
                <InfoItem icon={Primero} text="18 de Octubre del 2025" future />
                <InfoItem icon={Segundo} text="Dirigido a: Estudiantes de preparatoria" />
                <InfoItem icon={Tercero} text="San Juan Bautista Tuxtepec, Oaxaca." />
                <InfoItem icon={Cuarto} text="Instalaciones: COBAO 07" />
                <InfoItem icon={Quinto} text="600 asistentes" record />
                <InfoItem icon={Sexto} text="5 horas" />
                <InfoItem icon={Septimo} text="No aplica" />
              </div>
            </div>
          </div>
        </div>

        {/* No Related Workshops - Evento único tipo feria */}
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
function InfoItem({ icon, text, future = false, record = false }) {
  let colorClass = 'text-gray-700';
  if (future) colorClass = 'text-green-600 font-semibold';
  if (record) colorClass = 'text-rose-600 font-bold text-base';

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