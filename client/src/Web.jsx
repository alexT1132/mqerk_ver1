import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Footer from "./components/footer";
import Navbar from "./components/mqerk/Navbar";
import HeroVideo from "./components/mqerk/HeroVideo";
import Nuestroscursos from "./components/mqerk/Cursos";
import Trayectoria, { DEMO_ITEMS } from "./components/mqerk/Trayectoria";
import Modelo from "./components/mqerk/Modelo";
import Video from "./assets/mqerk/video.mp4";
import NuestrosAsesores from "./components/mqerk/AsesoresWeb";
import FloatingWhatsapp from "./components/FloatingWhatsapp";
import Uno1 from "./assets/1.png";
import Dos2 from "./assets/2.png";
import Tres3 from "./assets/3.png";
import Cuatro4 from "./assets/4.png";
import Cinco5 from "./assets/5.png";
import Seis6 from "./assets/6.png";
import Siete7 from "./assets/7.png";
import Ocho8 from "./assets/8.png";
import Foto1 from "./assets/mqerk/carrusel/1.png";
import Foto2 from "./assets/mqerk/carrusel/2.png";
import Foto3 from "./assets/mqerk/carrusel/3.png";
import Foto4 from "./assets/mqerk/carrusel/4.png";
import Foto5 from "./assets/mqerk/carrusel/5.png";
import Foto6 from "./assets/mqerk/carrusel/6.png";
import Foto7 from "./assets/mqerk/carrusel/7.png";
import Foto8 from "./assets/mqerk/carrusel/8.png";

function Web() {

    const imagenes = [
      Uno1,
      Dos2,
      Tres3,
      Cuatro4,
      Cinco5,
      Seis6,
      Siete7,
      Ocho8,
    ];
  
    // Repetimos las imágenes para crear el efecto loop sin cortes
    const carruselImagenes = [
      ...imagenes, ...imagenes, ...imagenes, ...imagenes, ...imagenes, ...imagenes, ...imagenes, ...imagenes, ...imagenes, ...imagenes, ...imagenes, ...imagenes, ...imagenes, ...imagenes, ...imagenes, ...imagenes, ...imagenes, ...imagenes, ...imagenes, ...imagenes, ...imagenes, ...imagenes, ...imagenes, ...imagenes, ...imagenes, ...imagenes, ...imagenes, ...imagenes, ...imagenes, ...imagenes, ...imagenes, ...imagenes, ...imagenes, ...imagenes, ...imagenes, ...imagenes, ...imagenes, ...imagenes, ...imagenes, ...imagenes, ...imagenes, ...imagenes, ...imagenes, ...imagenes, ...imagenes, ...imagenes, ...imagenes, ...imagenes, ...imagenes, ...imagenes,
    ];

    const images = [
      Foto1,
      Foto2,
      Foto3,
      Foto4,
      Foto5,
      Foto6,
      Foto7,
      Foto8
    ];

    const location = useLocation();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [forward, setForward] = useState(true);

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentIndex(prev => {
          if (forward) {
            if (prev === images.length - 1) {
              setForward(false);
              return prev - 1;
            }
            return prev + 1;
          } else {
            if (prev === 0) {
              setForward(true);
              return prev + 1;
            }
            return prev - 1;
          }
        });
      }, 4000);
      return () => clearInterval(interval);
    }, [forward]);

    const getLeftImage = () => images[(currentIndex - 1 + images.length) % images.length];
    const getRightImage = () => images[(currentIndex + 1) % images.length];

    const scrollToCursos = () => {
      const section = document.getElementById('cursos');
      if (section) {
        // Un pequeño delay asegura que el navegador esté listo para scrollear
        setTimeout(() => {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    };

    // --- CORRECCIÓN AQUÍ: Detectamos también el hash '#cursos' ---
    useEffect(() => {
      if (location.state?.ejecutarFuncion || location.hash === '#cursos') {
        scrollToCursos();
      }
    }, [location]);

  return (
    <div className="min-h-screen flex flex-col" id="inicio" >
        <Navbar />
        <HeroVideo
          mp4Src={Video}
          headline={<>Educación disruptiva en <span className="whitespace-nowrap">Ciencia + Tecnología</span></>}
          subheadline="igual mentes que transforman el mundo."
          highlight="¡Da el primer paso hacia tu éxito académico!"
          ctaText="¡Regístrate aquí!"
          ctaHref="#registro"
        />
        
        {/* --- CORRECCIÓN AQUÍ: Agregamos el ID que faltaba --- */}
        <div id="cursos" className="scroll-mt-24">
            <Nuestroscursos />
        </div>
        {/* --------------------------------------------------- */}

        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#3c24ba]">+10 convenios y participaciones con instituciones</h2>
          <div className="overflow-hidden w-full py-6">
            <div className="flex animate-marquee space-x-6 w-max">
              {carruselImagenes.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`img-${index}`}
                  className="w-32 h-32 object-cover"
                />
              ))}
            </div>
          </div>
        </div>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#F4138A]">Nuestros estudiantes</h2>
          <br />
          <div className="pasarela-3d-container mb-10">
            <div className="pasarela-3d">
              <img src={getLeftImage()} alt="left" className="pasarela-img left" />
              <img src={images[currentIndex]} alt="center" className="pasarela-img center" />
              <img src={getRightImage()} alt="right" className="pasarela-img right" />
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
  )
}

export default Web