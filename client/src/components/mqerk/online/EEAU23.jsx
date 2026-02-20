import React, { useState, useEffect, useLayoutEffect } from 'react'
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

function EEAU23() {
  const topRef = React.useRef(null)

  const scrollToTop = () => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
    const root = document.getElementById('root')
    if (root) root.scrollTop = 0
    const el = topRef.current || document.getElementById('eeau23-top')
    el?.scrollIntoView({ behavior: 'instant', block: 'start', inline: 'nearest' })
  }

  // useLayoutEffect: scroll ANTES del paint (evita parpadeo)
  useLayoutEffect(() => {
    scrollToTop()
  }, [])

  // useEffect: refuerzos para contenido que se pinta más tarde (ReactPlayer, etc.)
  useEffect(() => {
    scrollToTop()
    const raf = requestAnimationFrame(scrollToTop)
    const t50 = setTimeout(scrollToTop, 50)
    const t150 = setTimeout(scrollToTop, 150)
    const t400 = setTimeout(scrollToTop, 400)
    const t800 = setTimeout(scrollToTop, 800)
    const t1200 = setTimeout(scrollToTop, 1200)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(t50)
      clearTimeout(t150)
      clearTimeout(t400)
      clearTimeout(t800)
      clearTimeout(t1200)
    }
  }, [])

  return (
    <div ref={topRef} className='min-h-screen flex flex-col bg-linear-to-b from-purple-50 to-white'>
      {/* Ancla para scroll al inicio (evita que quede "hasta abajo" al navegar desde /online) */}
      <div id="eeau23-top" className="absolute -top-px left-0 w-px h-px pointer-events-none" aria-hidden="true" />
      <Navbar />

      {/* Hero Section */}
      <div className="bg-[#3c26cc] text-white py-12 px-4 sm:px-6 lg:px-8">
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
            Testimonios: Acredita el Examen de Admisión a la Universidad
          </h1>
        </div>
      </div>

      {/* Video Player - Responsive: encuadra según pantalla y dispositivo */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="relative w-full animate-fade-in" style={{ paddingBottom: '56.25%' }}>
          <div className="absolute inset-0 rounded-xl sm:rounded-2xl overflow-hidden shadow-xl">
            <ReactPlayer
              url="https://youtu.be/v-iXIcu6LUI"
              playing
              muted
              width="100%"
              height="100%"
              controls
              style={{ position: 'absolute', top: 0, left: 0 }}
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
                <div className="w-1 h-8 bg-linear-to-b from-purple-600 to-indigo-600 rounded-full"></div>
                Resumen
              </h2>
              <p className="text-gray-700 leading-relaxed text-justify">
                La experiencia transformadora del curso "Acredita el examen de admisión a la universidad 2023". Los 
                estudiantes del curso, a cargo de Kelvin Ramírez, compartieron sus testimonios sobre la primera simulación 
                del examen de admisión. Cada uno de ellos destacó cómo la simulación les permitió comprender mejor el 
                formato del examen, mejorar sus tiempos de respuesta y reforzar sus conocimientos clave. Más allá de la 
                preparación académica, los testimonios reflejaron cómo el curso contribuyó a aumentar su confianza y reducir 
                el estrés, preparándolos de manera efectiva para afrontar el desafío real.
              </p>
            </section>

            {/* Objetivos */}
            <section className="bg-white rounded-2xl shadow-md p-6 sm:p-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <h2 className="text-2xl sm:text-3xl font-bold text-purple-800 mb-6 flex items-center gap-3">
                <div className="w-1 h-8 bg-linear-to-b from-purple-600 to-indigo-600 rounded-full"></div>
                Objetivos
              </h2>
              <ul className="space-y-4">
                <ObjectiveItem 
                  text="Generar confianza en padres y alumnos sobre la calidad del curso." 
                  delay="0"
                />
                <ObjectiveItem 
                  text="Ayudar a decidir qué carrera o programa estudiar, si aún tienes dudas." 
                  delay="100"
                />
                <ObjectiveItem 
                  text="Mostrar a la universidad que tienes la capacidad y la disciplina para tener éxito en estudios superiores." 
                  delay="200"
                />
              </ul>
            </section>

            {/* Special Note - Testimonios */}
            <section className="bg-linear-to-r from-blue-100 to-indigo-100 rounded-2xl shadow-md p-6 sm:p-8 animate-slide-up border-l-4 border-blue-600" style={{ animationDelay: '200ms' }}>
              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-blue-900 mb-2">Testimonios Reales 💬</h3>
                  <p className="text-blue-800 leading-relaxed">
                    Video testimonial de <span className="font-bold">7 estudiantes</span> que compartieron su experiencia 
                    en la primera simulación del examen de admisión. Sus voces reflejan el impacto del curso en su 
                    preparación académica y emocional para enfrentar este importante desafío.
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
                <InfoItem icon={Primero} text="29 de febrero del 2023" />
                <InfoItem icon={Segundo} text="Dirigido a: estudiantes y padres de familia" />
                <InfoItem icon={Tercero} text="San Juan Bautista Tuxtepec, Oaxaca." />
                <InfoItem icon={Cuarto} text="Instalaciones: MQerKAcademy (Video)" special />
                <InfoItem icon={Quinto} text="7 asistentes" />
                <InfoItem icon={Sexto} text="4 minutos" short />
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
      <div className="shrink-0 mt-1.5">
        <div className="w-2 h-2 rounded-full bg-purple-600 group-hover:scale-125 transition-transform duration-300"></div>
      </div>
      <span className="text-gray-700 leading-relaxed">{text}</span>
    </li>
  );
}

// Componente de información con icono
function InfoItem({ icon, text, special = false, short = false }) {
  let colorClass = 'text-gray-700';
  if (special) colorClass = 'text-purple-600 font-semibold';
  if (short) colorClass = 'text-blue-600 font-semibold';

  return (
    <div className="flex items-start gap-3 group hover:translate-x-1 transition-transform duration-300">
      <div className="shrink-0">
        <img src={icon} alt="" className="w-7 h-7 object-contain" />
      </div>
      <p className={`leading-relaxed text-sm ${colorClass}`}>
        {text}
      </p>
    </div>
  );
}

export default EEAU23;