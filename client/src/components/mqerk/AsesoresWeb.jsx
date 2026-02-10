import { useState, useEffect, useRef } from "react";
import Kelvin from "../../assets/mqerk/Asesores/5.webp";
import Ruth from "../../assets/mqerk/Asesores/6.webp";
import Emmanuel from "../../assets/mqerk/Asesores/7.webp";
import Cesar from "../../assets/mqerk/Asesores/8.webp";
import Alex from "../../assets/mqerk/Asesores/9.webp";

const asesores = [
  { nombre: "Kelvin Ramírez", rol: "Asesor Cienytec", img: Kelvin },
  { nombre: "Emmanuel López", rol: "Asesor Psicoeducativo", img: Emmanuel },
  { nombre: "Ruth Chávez", rol: "Asesora de MKT", img: Ruth },
  { nombre: "Alejandro Tellez", rol: "Asesor en sistemas", img: Alex },
  { nombre: "César Lagunes", rol: "English Teacher", img: Cesar },
];

export default function Asesores() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % asesores.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Manejador para el hover en desktop
  const handleMouseEnter = (index) => {
    setIsPaused(true);
    setActiveIndex(index); // Activar inmediatamente al pasar el mouse
  };

  return (
    <section className="bg-slate-50 py-16 px-4 overflow-hidden">
      <div className="w-full">
        {/* Título con diseño más moderno */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-[#F4138A] mb-4 tracking-tight">
            Nuestros Asesores
          </h2>
          <div className="h-1.5 w-24 bg-gradient-to-r from-[#F4138A] to-purple-600 mx-auto rounded-full" />
        </div>

        {/* --- DESKTOP VIEW --- */}
        <div
          className="hidden md:flex h-[500px] w-full max-w-full gap-1 px-4"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {asesores.map((a, i) => {
            const isActive = activeIndex === i;
            const isDimmed = !isActive;

            return (
              <div
                key={i}
                onMouseEnter={() => handleMouseEnter(i)}
                // Optimización: will-change-[flex] ayuda al navegador a prepararse para animar el ancho
                // transform-gpu fuerza el uso de la GPU
                className={`relative transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer overflow-hidden rounded-3xl border-2 border-transparent will-change-[flex-grow] transform-gpu
                  ${isActive ? 'flex-[4] shadow-2xl scale-100 z-30 border-[#F4138A]/30' : 'flex-[1.5] scale-95 z-10'}
                  ${isDimmed ? 'opacity-100 grayscale-[0.0] hover:grayscale-0' : 'opacity-100 grayscale-0'}
                `}
                style={{ backfaceVisibility: 'hidden' }} // Evita flickering en algunos navegadores
              >
                <div className={`absolute inset-0 transition-all duration-700 ${isDimmed ? 'bg-black/10' : 'bg-transparent'}`}></div>

                <img
                  src={a.img}
                  alt={a.nombre}
                  // Sincronizamos duración con el contenedor (700ms) y agregamos will-change-transform
                  className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 will-change-transform ${isActive ? 'scale-110' : 'scale-100'}`}
                  style={{ backfaceVisibility: 'hidden' }}
                />

                {/* Overlay de información */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                  <div className={`absolute bottom-8 left-6 transition-all duration-500 ${isActive ? 'translate-x-0' : 'translate-y-8 opacity-0'}`}>
                    <p className="text-[#F4138A] font-bold text-sm uppercase tracking-widest mb-1">{a.rol}</p>
                    <h3 className="text-white text-2xl font-black leading-tight">{a.nombre}</h3>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* --- MOBILE VIEW --- */}
        <div className="md:hidden"
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="relative h-[450px] w-full flex justify-center items-center mb-6">
            {asesores.map((a, i) => {
              const isActive = activeIndex === i;

              // Simplificamos la lógica móvil para evitar bugs de desplazamiento fantasma.
              // Usamos un efecto limpio de Fade + Scale.
              return (
                <div
                  key={i}
                  // Optimización móvil: will-change-[transform,opacity] es crucial para suavidad
                  className={`absolute w-[85vw] max-w-[340px] transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-[transform,opacity] transform-gpu
                    ${isActive
                      ? "opacity-100 scale-100 z-20 translate-x-0 pointer-events-auto"
                      : "opacity-0 scale-95 z-10 pointer-events-none"}`} // scale-95 en reposo para que el "pop" sea más sutil y suave
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="relative h-[450px] rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-black/5">
                    <img src={a.img} alt={a.nombre} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 via-transparent to-transparent" />

                    <div className="absolute bottom-0 left-0 p-8 w-full text-left">
                      <span className="bg-[#F4138A] text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase mb-3 inline-block">
                        {a.rol}
                      </span>
                      <h3 className="text-white text-3xl font-extrabold">{a.nombre}</h3>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Indicadores de posición (Dots) */}
          <div className="flex justify-center space-x-2 mt-4">
            {asesores.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 ${activeIndex === i ? 'w-8 bg-[#F4138A]' : 'w-2 bg-gray-300'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}