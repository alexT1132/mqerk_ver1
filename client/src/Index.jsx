import React, { useState, useEffect } from 'react';
import Fenix from "./assets/fenix.png";
import { Link } from "react-router-dom";

const WelcomePage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800">
      {/* Patrón de fondo sutil y animado */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 border border-white/40 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 border border-white/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 border border-white/30 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-28 h-28 border border-white/40 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        
        {/* Hexágonos decorativos sutiles */}
        <div className="absolute top-10 right-10 w-16 h-16 opacity-30">
          <svg viewBox="0 0 100 100" className="w-full h-full animate-spin-slow">
            <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="none" stroke="white" strokeWidth="1"/>
          </svg>
        </div>
        <div className="absolute bottom-20 left-20 w-12 h-12 opacity-20">
          <svg viewBox="0 0 100 100" className="w-full h-full animate-spin-slow">
            <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="none" stroke="white" strokeWidth="1"/>
          </svg>
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className={`flex items-center gap-3 transition-all duration-700 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105">
              <span className="text-white font-bold text-lg sm:text-xl">M</span>
            </div>
            <div className="hidden sm:block">
              <h2 className="text-white font-semibold text-sm">MQerK</h2>
              <p className="text-white/70 text-xs">Academy</p>
            </div>
          </div>

          {/* Tagline - Oculto en móvil */}
          <div className={`hidden lg:block transition-all duration-700 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
            <p className="text-white/90 text-sm xl:text-base font-light max-w-2xl text-center">
              Asesores Especializados en la Enseñanza de las Ciencias y Tecnología
            </p>
          </div>

          {/* Botón Iniciar Sesión */}
          <Link to='/login' className={`px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full font-medium text-sm sm:text-base transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-pink-500/50 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
            Iniciar Sesión
          </Link>
        </div>
      </header>

      {/* Tagline móvil */}
      <div className="lg:hidden px-4 mt-2">
        <p className={`text-white/80 text-xs sm:text-sm text-center transition-all duration-700 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          Asesores Especializados en la Enseñanza de las Ciencias y Tecnología
        </p>
      </div>

      {/* Contenido Principal */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8" style={{ minHeight: 'calc(100vh - 120px)' }}>
        <div className="max-w-4xl mx-auto text-center">
          {/* Título */}
          <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 sm:mb-12 transition-all duration-700 delay-300 ${isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
            ¡BIENVENIDOS!
          </h1>

          {/* Logo Central */}
          <div className={`mb-8 sm:mb-12 flex justify-center transition-all duration-700 delay-500 ${isVisible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
            <div className="relative group">
              <div className="absolute inset-0 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 bg-white/5 backdrop-blur-sm rounded-full border border-white/20 flex items-center justify-center hover:border-white/40 transition-all duration-500 hover:scale-105 p-8">
                {/* Aquí puedes añadir tu imagen */}
                <img 
                  src={Fenix} 
                  alt="Logo MQerK Academy" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>

          {/* Texto de registro */}
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-semibold text-white mb-6 sm:mb-8 transition-all duration-700 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            Regístrate como:
          </h2>

          {/* Botones de registro - Ahora iguales */}
          <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 transition-all duration-700 delay-900 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <button className="w-full sm:w-64 px-8 py-3.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full font-medium text-base sm:text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-pink-500/50">
              Personal Interno
            </button>
            <Link to='/pre_registro' className="w-full sm:w-64 px-8 py-3.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full font-medium text-base sm:text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50">
              Asesor
            </Link>
          </div>
        </div>
      </main>

      {/* Partículas flotantes sutiles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-float"></div>
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-white/40 rounded-full animate-float" style={{ animationDelay: '2s', animationDuration: '4s' }}></div>
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-white/20 rounded-full animate-float" style={{ animationDelay: '1s', animationDuration: '5s' }}></div>
        <div className="absolute bottom-1/4 right-1/3 w-1.5 h-1.5 bg-white/30 rounded-full animate-float" style={{ animationDelay: '3s', animationDuration: '6s' }}></div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 1;
          }
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default WelcomePage;