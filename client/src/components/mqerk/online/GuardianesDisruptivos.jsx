import React, { useState, useEffect } from 'react'
import Navbar from '../../../components/mqerk/Navbar'
import Primero from "../../../assets/mqerk/veranotx/01.webp";
import Segundo from "../../../assets/mqerk/veranotx/02.webp";
import Tercero from "../../../assets/mqerk/veranotx/03.webp";
import Cuarto from "../../../assets/mqerk/veranotx/04.webp";
import Quinto from "../../../assets/mqerk/veranotx/05.webp";
import Sexto from "../../../assets/mqerk/veranotx/06.webp";
import Septimo from "../../../assets/mqerk/veranotx/07.webp";
import ReactPlayer from 'react-player/youtube';
import { Link } from 'react-router-dom';
import Footer from "../../../components/layout/footer";

function Online() {
  return (
    <div className='min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white'>
      <Navbar />

      {/* Hero Section - SIN BADGES */}
      <div className="bg-gradient-to-br from-purple-600 via-indigo-700 to-purple-800 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Link 
            to="/online" 
            className="inline-flex items-center gap-2 text-purple-100 hover:text-white transition-colors mb-6 group"
          >
            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a online
          </Link>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold animate-fade-in">
            Guardianes Disruptivos: Cambiando el Rumbo, Transformando la Educación
          </h1>
        </div>
      </div>

      {/* Video Player - MÁS GRANDE */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center items-center animate-fade-in">
          <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl">
            <ReactPlayer
              url="https://www.youtube.com/watch?v=sGMTVHWB6do"
              playing
              muted
              width="700px"
              height="100%"
              controls
            />
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
                Transformando la educación con IA. Kelvin Ramírez, CEO de MQerKAcademy, junto al Lic. Daniel Campillo, 
                invitado especial, lideraron una conversación sobre las tendencias emergentes en inteligencia artificial 
                y su potencial para revolucionar la educación. En una sesión cargada de ideas innovadoras, se exploraron 
                cómo las herramientas de IA pueden transformar tanto el proceso de enseñanza como la experiencia de 
                aprendizaje, abordando el futuro de la educación en un mundo digitalizado y cada vez más conectado.
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
                  text="Informar sobre las principales tecnologías de IA utilizadas actualmente en entornos educativos." 
                  delay="0"
                />
                <ObjectiveItem 
                  text="Reflexionar sobre los desafíos éticos y sociales asociados al uso de IA en la educación." 
                  delay="100"
                />
                <ObjectiveItem 
                  text="Proponer estrategias prácticas para integrar herramientas de IA en instituciones educativas de manera efectiva y responsable." 
                  delay="200"
                />
              </ul>
            </section>

            {/* Special Note - Evento Virtual Masivo */}
            <section className="bg-gradient-to-r from-red-100 via-orange-100 to-yellow-100 rounded-2xl shadow-md p-6 sm:p-8 animate-slide-up border-l-4 border-red-600" style={{ animationDelay: '200ms' }}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-red-900 mb-2">¡Evento Virtual Masivo! 🎥</h3>
                  <p className="text-red-800 leading-relaxed mb-3">
                    Con <span className="font-bold text-red-900">950 asistentes virtuales</span>, este evento marca un 
                    hito como uno de los webinars más exitosos de MQerKAcademy, demostrando el poder del formato digital 
                    para alcanzar a una audiencia global interesada en la transformación educativa mediante IA.
                  </p>
                  <div className="bg-white/50 rounded-lg p-3 mt-3">
                    <p className="text-sm text-red-900 font-semibold">
                      💡 Primer gran evento online de 2025
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
                <InfoItem icon={Primero} text="24 de Enero del 2025" recent />
                <InfoItem icon={Segundo} text="Dirigido a: público en general" />
                <InfoItem icon={Tercero} text="San Juan Bautista Tuxtepec, Oaxaca." />
                <InfoItem icon={Cuarto} text="Instalaciones: MQerKAcademy (Virtual)" special />
                <InfoItem icon={Quinto} text="950 asistentes" mega />
                <InfoItem icon={Sexto} text="1.5 horas" />
                <InfoItem icon={Septimo} text="No aplica" />
              </div>
            </div>
          </div>
        </div>

        {/* No Related Events - Evento más reciente */}
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
function InfoItem({ icon, text, recent = false, special = false, mega = false }) {
  let colorClass = 'text-gray-700';
  if (recent) colorClass = 'text-green-600 font-semibold';
  if (special) colorClass = 'text-purple-600 font-semibold';
  if (mega) colorClass = 'text-red-600 font-bold text-base';

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

export default Online;