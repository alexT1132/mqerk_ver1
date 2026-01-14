import React, { useState, useEffect } from 'react'
import Navbar from '../../../components/mqerk/Navbar'
import Primero from "../../../assets/mqerk/veranotx/01.png";
import Segundo from "../../../assets/mqerk/veranotx/02.png";
import Tercero from "../../../assets/mqerk/veranotx/03.png";
import Cuarto from "../../../assets/mqerk/veranotx/04.png";
import Quinto from "../../../assets/mqerk/veranotx/05.png";
import Sexto from "../../../assets/mqerk/veranotx/06.png";
import Septimo from "../../../assets/mqerk/veranotx/07.png";
import ReactPlayer from 'react-player/youtube';
import { Link } from 'react-router-dom';
import Footer from "../../footer";

function Online() {
  return (
    <div className='min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white'>
      <Navbar />

      {/* Hero Section */}
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
            Foro: Día Internacional de la Educación
          </h1>
        </div>
      </div>

      {/* Video Player */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center items-center animate-fade-in">
          <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl">
            <ReactPlayer
              url="https://youtu.be/JyIawPyqg_Q"
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
              <p className="text-gray-700 leading-relaxed text-justify mb-4">
                <span className="font-bold text-purple-700">Celebrando el Día Internacional de la Educación:</span> Un 
                foro para repensar el futuro de la enseñanza y el aprendizaje.
              </p>
              <p className="text-gray-700 leading-relaxed text-justify mb-4">
                En el marco del Día Internacional de la Educación, se llevó a cabo un foro revolucionario que reunió a 
                expertos clave para discutir la transformación educativa. Este evento contó con la participación de la 
                Directora del CBTis 107, <span className="font-semibold">Bertha Elena López Bernabé</span>, el Presidente 
                Nacional de Filosofía DGETI, <span className="font-semibold">Abel Iturbe Enríquez</span>, y el Director 
                de MQerKAcademy, <span className="font-semibold">Kelvin Valentín Gómez Ramírez</span>.
              </p>
              <p className="text-gray-700 leading-relaxed text-justify mb-4">
                El objetivo de este foro fue exponer cómo la educación ha dado un giro de 180°, adaptándose a las nuevas 
                formas de aprendizaje y enseñanza, y cómo estas transformaciones son esenciales para enfrentar los desafíos 
                del siglo XXI.
              </p>
              <p className="text-gray-700 leading-relaxed text-justify">
                Durante el evento, se debatieron enfoques disruptivos que están marcando la diferencia en las aulas, desde 
                metodologías más inclusivas y personalizadas, hasta el uso de tecnologías innovadoras que promueven una 
                enseñanza más interactiva y colaborativa. Además, se compartieron experiencias sobre cómo romper con los 
                esquemas tradicionales para crear espacios educativos que fomenten el pensamiento crítico, la creatividad 
                y la adaptabilidad de los estudiantes.
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
                  text="Conmemorar el Día Internacional de la Educación y reconocer su impacto en el desarrollo de las personas y las sociedades." 
                  delay="0"
                />
                <ObjectiveItem 
                  text="Fomentar el diálogo y la reflexión sobre los principales desafíos que enfrenta la educación en la actualidad." 
                  delay="100"
                />
                <ObjectiveItem 
                  text="Impulsar propuestas para lograr una educación inclusiva, equitativa y de calidad para todos y todas." 
                  delay="200"
                />
              </ul>
            </section>

            {/* Special Note - Evento Viral */}
            <section className="bg-gradient-to-r from-yellow-100 via-orange-100 to-red-100 rounded-2xl shadow-md p-6 sm:p-8 animate-slide-up border-l-4 border-yellow-600" style={{ animationDelay: '200ms' }}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <svg className="w-10 h-10 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-xl text-yellow-900 mb-2 flex items-center gap-2">
                    ¡EVENTO VIRAL HISTÓRICO! 🔥
                  </h3>
                  <p className="text-yellow-800 leading-relaxed mb-3">
                    Con <span className="font-black text-2xl text-yellow-900">3,500 asistentes virtuales</span>, este foro 
                    se convirtió en el <span className="font-bold">evento online MÁS GRANDE de toda la historia de 
                    MQerKAcademy</span>, superando cualquier récord previo y consolidándose como un hito en la difusión 
                    de ideas educativas transformadoras.
                  </p>
                  <div className="bg-white/60 rounded-lg p-4 mt-4 space-y-2">
                    <p className="text-sm text-yellow-900 font-bold flex items-center gap-2">
                      👥 Panel de expertos de alto nivel
                    </p>
                    <p className="text-sm text-yellow-900 font-bold flex items-center gap-2">
                      🌍 Alcance masivo: 3,500 personas conectadas
                    </p>
                    <p className="text-sm text-yellow-900 font-bold flex items-center gap-2">
                      📺 Transmisión en vivo de 1:40 horas
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
                <InfoItem icon={Primero} text="24 de enero del 2022" />
                <InfoItem icon={Segundo} text="Dirigido a: público en general" />
                <InfoItem icon={Tercero} text="San Juan Bautista Tuxtepec, Oaxaca." />
                <InfoItem icon={Cuarto} text="Instalaciones: MQerKAcademy (Virtual)" special />
                <InfoItem icon={Quinto} text="3,500 asistentes" recordAbsolute />
                <InfoItem icon={Sexto} text="1:40 horas" />
                <InfoItem icon={Septimo} text="No aplica" />
              </div>
            </div>
          </div>
        </div>

        {/* No Related Events */}
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
  if (recordAbsolute) colorClass = 'text-yellow-600 font-black text-lg';

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