import React from 'react'
import Navbar from '../../../components/mqerk/Navbar'
import Uno from "../../../assets/mqerk/talleres/1.png";
import Dos from "../../../assets/mqerk/talleres/2.png";
import Tres from "../../../assets/mqerk/talleres/3.png";
import Cuatro from "../../../assets/mqerk/talleres/4.png";
import Cinco from "../../../assets/mqerk/talleres/5.png";
import Seis from "../../../assets/mqerk/talleres/6.png";
import Siete from "../../../assets/mqerk/talleres/7.png";
import Ocho from "../../../assets/mqerk/talleres/8.png";
import Nueve from "../../../assets/mqerk/talleres/9.png";
import Diez from "../../../assets/mqerk/talleres/10.png";
import { Link } from "react-router-dom";
import Footer from "../../footer";

function Talleres() {
  return (
    <div className='min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white'>
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-600 via-indigo-700 to-purple-800 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 animate-fade-in">
            TALLERES
          </h1>
          <p className="text-purple-100 text-lg sm:text-xl max-w-2xl mx-auto animate-fade-in-delay">
            Descubre nuestra trayectoria de talleres y conferencias que están transformando la educación
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        
        {/* 2025 */}
        <YearSection year="2025" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          <WorkshopCard
            to='/talleres/ia_para_la_enseñanza'
            image={Uno}
            title="IA para la enseñanza en el aula"
            description="Sesión formativa para docentes sobre inteligencia artificial en la enseñanza, promoviendo la innovación tecnológica en el aula."
            date="25 de marzo"
            delay="0"
          />
          <WorkshopCard
            to='/talleres/ia_en_la_salud'
            image={Dos}
            title="IA en la salud"
            description="Sesión informativa para el personal del sector salud sobre inteligencia artificial aplicada a la innovación médica y la prevención de fraudes digitales."
            date="18 de marzo"
            delay="100"
          />
          <WorkshopCard
            to='/talleres/ia_en_la_gestion_emp'
            image={Tres}
            title="IA en la gestión empresarial"
            description="Ejecutivos conocieron cómo aplicar la inteligencia artificial para optimizar procesos y tomar decisiones en la Compañía Cervecera del Trópico."
            date="07 de marzo"
            delay="200"
          />
          <WorkshopCard
            to='/talleres/tecnomate'
            image={Cuatro}
            title="TecnoMate"
            description="Los docentes fueron capacitados en el uso de herramientas tecnológicas con el objetivo de mejorar la enseñanza y el aprendizaje de las matemáticas."
            date="07 de enero"
            delay="300"
          />
        </div>

        {/* 2024 */}
        <YearSection year="2024" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          <WorkshopCard
            to='/talleres/orientacion_vocacional_y_psicoeducativa'
            image={Cinco}
            title="Orientación vocacional y psicoeducativa"
            description="Un espacio formativo que permitió a los estudiantes reflexionar sobre su futuro académico y profesional."
            date="21 de octubre"
            delay="0"
          />
          <WorkshopCard
            to='/talleres/orientacion_vocacional'
            image={Seis}
            title="Orientación vocacional"
            description="Actividad orientada a apoyar la toma de decisiones, a partir del reconocimiento y análisis de las propias habilidades e intereses."
            date="18 de octubre"
            delay="100"
          />
          <WorkshopCard
            to='/talleres/apoyo_a_la_ciencia_y_la_tecnologia'
            image={Siete}
            title="Apoyo a la ciencia y tecnología"
            description="Dimos la bienvenida a jóvenes destacados en programación, reafirmando nuestro compromiso con el impulso a la tecnología y la formación educativa."
            date="22 de enero"
            delay="200"
          />
        </div>

        {/* 2023 - CENTRADO */}
        <YearSection year="2023" />
        <div className="flex justify-center mb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl w-full">
            <WorkshopCard
              to='/talleres/transformar_la_educacion'
              image={Ocho}
              title="Cambiar el mundo, transformar la educación"
              description="Conferencia otorgada exclusivamente a los alumnos y alumnas de 5to semestre del Centro de Bachillerato Tecnológico Industrial y de Servicios 107."
              date="06 de diciembre"
              delay="0"
            />
            <WorkshopCard
              to='/talleres/educacion_disruptiva'
              image={Nueve}
              title="Educación disruptiva, transformando mentes"
              description="Semana de conferencias en el CBTis 107 de Tuxtepec, se contó con la presencia de alumnos de diferentes semestres."
              date="2 al 14 de junio"
              delay="100"
            />
          </div>
        </div>

        {/* 2021 - CENTRADO */}
        <YearSection year="2021" />
        <div className="flex justify-center mb-20">
          <div className="w-full max-w-md">
            <WorkshopCard
              to='/talleres/tecnologia_artificial'
              image={Diez}
              title="Tecnología Artificial Aplicada en la Educación"
              description="El M.M. Kelvin Valentín Gómez Ramírez, asesor de MQerkAcademy, ofreció su primera conferencia a los alumnos del CBTis 107."
              date="11 de noviembre"
              delay="0"
            />
          </div>
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

// Componente de tarjeta de taller con animaciones
function WorkshopCard({ to, image, title, description, date, delay = "0" }) {
  return (
    <Link 
      to={to} 
      className="group flex flex-col bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Imagen con efecto zoom */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
        <img 
          src={image} 
          alt={title}
          className="w-full h-56 object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
      </div>

      {/* Contenido */}
      <div className="flex flex-col flex-1 p-6">
        {/* Título */}
        <h3 className="text-xl font-bold text-purple-800 mb-3 group-hover:text-purple-600 transition-colors duration-300 min-h-[3.5rem]">
          {title}
        </h3>

        {/* Descripción */}
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4 flex-1">
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
          
          {/* Flecha animada */}
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
        </div>
      </div>

      {/* Borde animado en hover */}
      <div className="h-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
    </Link>
  );
}

export default Talleres;