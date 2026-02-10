import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation } from "react-router-dom"; // Link eliminado (no se usaba)
import Footer from "./components/layout/footer";
import Navbar from "./components/mqerk/Navbar";
import HeroVideo from "./components/mqerk/HeroVideo";
import Nuestroscursos from "./components/mqerk/Cursos";
import Trayectoria, { DEMO_ITEMS } from "./components/mqerk/Trayectoria";
import Modelo from "./components/mqerk/Modelo";
import NuestrosAsesores from "./components/mqerk/AsesoresWeb";
import FloatingWhatsapp from "./components/common/FloatingWhatsapp";

// Assets
import Video from "./assets/mqerk/video.mp4";
import Uno1 from "./assets/1.webp";
import Dos2 from "./assets/2.webp";
import Tres3 from "./assets/3.webp";
import Cuatro4 from "./assets/4.webp";
import Cinco5 from "./assets/5.webp";
import Seis6 from "./assets/6.webp";
import Siete7 from "./assets/7.webp";
import Ocho8 from "./assets/8.webp";

// Carrusel Estudiantes
import Foto1 from "./assets/mqerk/carrusel/1.webp";
import Foto2 from "./assets/mqerk/carrusel/2.webp";
import Foto3 from "./assets/mqerk/carrusel/3.webp";
import Foto4 from "./assets/mqerk/carrusel/4.webp";
import Foto5 from "./assets/mqerk/carrusel/5.webp";
import Foto6 from "./assets/mqerk/carrusel/6.webp";
import Foto7 from "./assets/mqerk/carrusel/7.webp";
import Foto8 from "./assets/mqerk/carrusel/8.webp";

function Web() {
  const location = useLocation();

  // Referencia para el scroll (React way)
  const cursosSectionRef = useRef(null);

  // useMemo evita que estos arrays se recreen en cada render (optimización)
  const partnersImages = useMemo(() => [
    Uno1, Dos2, Tres3, Cuatro4, Cinco5, Seis6, Siete7, Ocho8
  ], []);

  const studentImages = useMemo(() => [
    Foto1, Foto2, Foto3, Foto4, Foto5, Foto6, Foto7, Foto8
  ], []);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Lógica simplificada para carrusel circular (infinito)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % studentImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [studentImages.length]);

  // Manejo de scroll usando Refs
  useEffect(() => {
    if (location.state?.ejecutarFuncion || location.hash === '#cursos') {
      // Verificamos que la referencia exista antes de scrollear
      if (cursosSectionRef.current) {
        cursosSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [location]);

  // Funciones helper para obtener índices circulares de forma segura
  const getPrevIndex = () => (currentIndex - 1 + studentImages.length) % studentImages.length;
  const getNextIndex = () => (currentIndex + 1) % studentImages.length;

  return (
    <div className="min-h-screen flex flex-col" id="inicio">
      <Navbar />

      <HeroVideo
        mp4Src={Video}
        headline={<>Educación disruptiva en <span className="whitespace-nowrap">Ciencia + Tecnología</span></>}
        subheadline="igual mentes que transforman el mundo."
        highlight="¡Da el primer paso hacia tu éxito académico!"
        ctaText="¡Regístrate aquí!"
        ctaHref="#cursos"
      />

      {/* Usamos la Ref aquí en lugar de ID para el JS, aunque dejamos el ID por si el CSS lo usa */}
      <div id="cursos" ref={cursosSectionRef} className="scroll-mt-24">
        <Nuestroscursos />
      </div>

      {/* SECCIÓN: CONVENIOS (MARQUEE) */}
      <div className="text-center mb-12">
        {/* Sugerencia: Mueve estos colores hardcoded a tu tailwind.config.js */}
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#3c24ba]">
          +10 convenios y participaciones con instituciones
        </h2>

        <div className="relative overflow-hidden w-full py-6 flex gap-0 select-none group">
          {/* Renderizado del Marquee - Reutilizamos el map para limpiar código */}
          {[0, 1].map((i) => (
            <div
              key={i}
              className="flex min-w-full shrink-0 animate-marquee-infinite items-center justify-around gap-6 group-hover:[animation-play-state:paused]"
              aria-hidden={i === 1} // El segundo bloque se oculta a lectores de pantalla
            >
              {partnersImages.map((src, index) => (
                <img
                  key={`${i}-${index}`}
                  src={src}
                  alt={`Institución aliada ${index + 1}`}
                  loading="lazy" // Optimización de carga
                  className="w-32 h-20 object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition duration-300"
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* SECCIÓN: ESTUDIANTES (CARRUSEL 3D) */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#F4138A]">
          Nuestros estudiantes
        </h2>
        <br />
        <div className="pasarela-3d-container mb-10">
          <div className="pasarela-3d">
            {/* Imágenes con carga perezosa */}
            <img
              src={studentImages[getPrevIndex()]}
              alt="Estudiante anterior"
              className="pasarela-img left"
              loading="lazy"
            />
            <img
              src={studentImages[currentIndex]}
              alt="Estudiante destacado"
              className="pasarela-img center"
              loading="lazy"
            />
            <img
              src={studentImages[getNextIndex()]}
              alt="Estudiante siguiente"
              className="pasarela-img right"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      <Trayectoria items={DEMO_ITEMS} />

      <Modelo />

      <NuestrosAsesores />

      <FloatingWhatsapp
        phone="522871515760"
        message="¡Hola MQerk! Me quiero registrar a un curso."
        position="br"
        showAfter={200}
        tooltip="¿Dudas? Escríbenos"
        pulse={true}
      />

      <Footer />
    </div>
  );
}

export default Web;