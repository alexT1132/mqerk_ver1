import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export const Error404 = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [particles, setParticles] = useState([]);

    // Generar partículas flotantes para el efecto de fondo
    useEffect(() => {
        const newParticles = Array.from({ length: 20 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 3 + 1,
            duration: Math.random() * 3 + 2,
            delay: Math.random() * 2,
        }));
        setParticles(newParticles);
        setIsLoaded(true);
    }, []);

    return (
        <div className="relative overflow-hidden h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
            {/* Fondo animado con partículas */}
            <div className="absolute inset-0 overflow-hidden">
                {particles.map((particle) => (
                    <div
                        key={particle.id}
                        className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
                        style={{
                            left: `${particle.x}%`,
                            top: `${particle.y}%`,
                            animationDelay: `${particle.delay}s`,
                            animationDuration: `${particle.duration}s`,
                        }}
                    />
                ))}
                
                {/* Efectos de ondas */}
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="relative z-10 flex flex-col items-center gap-8 max-w-2xl mx-auto px-6">
                {/* Número 404 animado */}
                <div className={`transform transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'}`}>
                    <div className="relative">
                        {/* Efecto de brillo detrás del texto */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 blur-2xl opacity-50 animate-pulse"></div>
                        
                        <h1 className="relative text-8xl md:text-9xl lg:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-pulse tracking-tighter">
                            404
                        </h1>
                    </div>
                </div>

                {/* Icono animado */}
                <div className={`transform transition-all duration-1000 delay-300 ${isLoaded ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
                        
                        <div className="relative bg-white/10 backdrop-blur-xl rounded-full p-8 border border-white/20 group-hover:scale-110 transition-transform duration-300">
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="120" 
                                height="120" 
                                viewBox="0 0 100 100" 
                                className="text-white animate-bounce"
                                style={{ animationDuration: '2s' }}
                            >
                                <path 
                                    d="M50 98C23.533 98 2 76.467 2 50S23.533 2 50 2s48 21.533 48 48-21.533 48-48 48zm0-90C26.841 8 8 26.841 8 50s18.841 42 42 42 42-18.841 42-42S73.159 8 50 8zm22.342 62.684a3 3 0 0 0 1.342-4.025C73.404 66.1 66.663 53 50 53S26.596 66.1 26.316 66.658a2.994 2.994 0 0 0 1.332 4.012 3.008 3.008 0 0 0 4.028-1.315C31.893 68.932 37.13 59 50 59s18.107 9.932 18.316 10.342A2.995 2.995 0 0 0 71.003 71c.45 0 .908-.101 1.339-.316zM65 44c-3.309 0-6-2.691-6-6s2.691-6 6-6 6 2.691 6 6-2.691 6-6 6zm-30 0c-3.309 0-6-2.691-6-6s2.691-6 6-6 6 2.691 6 6-2.691 6-6 6z" 
                                    fill="currentColor"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Título y descripción */}
                <div className={`text-center transform transition-all duration-1000 delay-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-pulse">
                        ¡Oops! Página no encontrada
                    </h2>
                    <p className="text-xl md:text-2xl text-white/80 mb-8 leading-relaxed">
                        La página que buscas ha desaparecido en el ciberespacio 🚀
                    </p>
                </div>

                {/* Botón de regreso animado */}
                <div className={`transform transition-all duration-1000 delay-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                    <Link 
                        to="/" 
                        className="group relative inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-xl rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
                    >
                        {/* Efecto de brillo en hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="w-6 h-6 transform group-hover:-translate-x-2 transition-transform duration-300" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        
                        <span className="relative z-10">Regresar al inicio</span>
                        
                        {/* Efecto de ondas en el botón */}
                        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </Link>
                </div>

                {/* Mensaje adicional */}
                <div className={`text-center transform transition-all duration-1000 delay-900 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                    <p className="text-white/60 text-sm animate-pulse">
                        Si el problema persiste, contacta con soporte técnico
                    </p>
                </div>
            </div>

            {/* Efecto de estrellas */}
            <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 50 }).map((_, i) => (
                    <div
                        key={`star-${i}`}
                        className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${1 + Math.random() * 2}s`,
                        }}
                    />
                ))}
            </div>
        </div>
    )
}