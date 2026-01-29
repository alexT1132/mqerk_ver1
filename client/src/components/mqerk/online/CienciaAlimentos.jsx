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
            Ciencia en Alimentos Fermentados: Un Platillo Saludable
          </h1>
        </div>
      </div>

      {/* Video Player */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center items-center animate-fade-in">
          <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl">
            <ReactPlayer
              url="https://youtu.be/jF5fxgEgtuM?si=Ju9_O3e5H55OX2O-"
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
                <span className="font-semibold">Kelvin Ramírez</span>, Asesor y CEO de MQerKAcademy, junto al 
                <span className="font-semibold"> Dr. en Ciencias Cirilo Nolasco Hipólito</span>, ofrecieron una charla 
                informativa donde abordaron los procesos y beneficios de los alimentos fermentados desde una perspectiva 
                científica y nutricional. Durante la sesión se explicó cómo la fermentación no solo mejora la conservación 
                y el sabor de los alimentos, sino que también promueve la salud intestinal, fortalece el sistema 
                inmunológico y puede ser una herramienta clave en la alimentación sostenible. La plática invitó a 
                reflexionar sobre el valor de los saberes tradicionales en diálogo con la ciencia moderna.
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
                  text="Divulgar los beneficios nutricionales y funcionales de los alimentos fermentados." 
                  delay="0"
                />
                <ObjectiveItem 
                  text="Promover el consumo responsable y seguro de estos productos en la vida cotidiana." 
                  delay="100"
                />
                <ObjectiveItem 
                  text="Fomentar la investigación sobre microbiota intestinal y su relación con alimentos fermentados." 
                  delay="200"
                />
              </ul>
            </section>

            {/* Special Note - Ciencia y Tradición */}
            <section className="bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl shadow-md p-6 sm:p-8 animate-slide-up border-l-4 border-emerald-600" style={{ animationDelay: '200ms' }}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-emerald-900 mb-2">Ciencia + Tradición 🥬</h3>
                  <p className="text-emerald-800 leading-relaxed mb-3">
                    Una fascinante exploración de cómo los <span className="font-bold">alimentos fermentados</span> combinan 
                    saberes ancestrales con investigación científica moderna. Desde el kimchi hasta el kombucha, descubre 
                    cómo estos alimentos benefician tu <span className="font-bold">microbiota intestinal</span> y fortalecen 
                    tu salud.
                  </p>
                  <div className="bg-white/50 rounded-lg p-3 mt-3">
                    <p className="text-sm text-emerald-900 font-semibold">
                      🦠 Microbiota + Fermentación + Alimentación Sostenible
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
                <InfoItem icon={Primero} text="20 de enero del 2021" />
                <InfoItem icon={Segundo} text="Dirigido a: estudiantes" />
                <InfoItem icon={Tercero} text="San Juan Bautista Tuxtepec, Oaxaca." />
                <InfoItem icon={Cuarto} text="Instalaciones: MQerKAcademy (Virtual)" special />
                <InfoItem icon={Quinto} text="25 asistentes" />
                <InfoItem icon={Sexto} text="2 horas" />
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
function InfoItem({ icon, text, special = false }) {
  return (
    <div className="flex items-start gap-3 group hover:translate-x-1 transition-transform duration-300">
      <div className="flex-shrink-0">
        <img src={icon} alt="" className="w-7 h-7 object-contain" />
      </div>
      <p className={`leading-relaxed text-sm ${special ? 'text-purple-600 font-semibold' : 'text-gray-700'}`}>
        {text}
      </p>
    </div>
  );
}

export default Online;