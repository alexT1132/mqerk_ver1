import React from 'react'
import Navbar from '../../../components/mqerk/Navbar'
import Uno from "../../../assets/mqerk/exporientas/1.png";
import Dos from "../../../assets/mqerk/exporientas/2.png";
import { Link } from "react-router-dom";
import Footer from "../../../components/layout/footer";

function Talleres() {
  return (
    <div className='min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white'>
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-600 via-indigo-700 to-purple-800 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 animate-fade-in">
            EXPORIENTAS
          </h1>
          <p className="text-purple-100 text-lg sm:text-xl max-w-2xl mx-auto animate-fade-in-delay">
            Ferias educativas masivas para orientar el futuro académico y profesional de los estudiantes
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        
        {/* 2025 */}
        <YearSection year="2025" />
        
        <div className="flex justify-center mb-20">
          <div className="w-full max-w-md">
            <ExporientaCard
              to='/mqerk/exporientas/feria_profesiografica'
              image={Uno}
              title="Feria Profesiográfica"
              description="Evento realizado para que los estudiantes de 6to semestre conozcan las oportunidades educativas que tiene la cuenca del Papaloapan y sus alrededores."
              date="05 de marzo"
              delay="0"
            />
          </div>
        </div>

        {/* 2024 */}
        <YearSection year="2024" />
        
        <div className="flex justify-center mb-20">
          <div className="w-full max-w-md">
            <ExporientaCard
              to='/mqerk/exporientas/exporienta_educativa'
              image={Dos}
              title="1ra. EXPO-ORIENTA Educativa 2024"
              description="Expo Orienta Educativa del ciclo escolar 2024-2025."
              date="18 de octubre"
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

// Componente de tarjeta de exporienta con animaciones (SIN BADGES)
function ExporientaCard({ to, image, title, description, date, delay = "0" }) {
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
          className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-700"
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