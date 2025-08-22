import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Footer from "./components/footer";
import Navbar from "./components/mqerk/Navbar";
import Video from "./assets/mqerk/video.mp4";
import Uno from "./assets/mqerk/1.png";
import Dos from "./assets/mqerk/2.png";
import Tres from "./assets/mqerk/3.png";
import Cuatro from "./assets/mqerk/4.png";
import Cinco from "./assets/mqerk/5.png";
import Seis from "./assets/mqerk/6.png";
import Uno1 from "./assets/1.png";
import Dos2 from "./assets/2.png";
import Tres3 from "./assets/3.png";
import Cuatro4 from "./assets/4.png";
import Cinco5 from "./assets/5.png";
import Seis6 from "./assets/6.png";
import Siete7 from "./assets/7.png";
import Ocho8 from "./assets/8.png";
import { FaTrophy } from "react-icons/fa";
import { ImUsers } from "react-icons/im";

import { FaUsers } from "react-icons/fa6";
import { LiaChalkboardTeacherSolid } from "react-icons/lia";
import { CgSandClock } from "react-icons/cg";
import { MdOutlineShoppingCart } from "react-icons/md";
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
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
      ...imagenes,
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
        section.scrollIntoView({ behavior: 'smooth' });
      }
    };

    useEffect(() => {
    if (location.state?.ejecutarFuncion) {
      scrollToCursos();
    }
  }, [location.state]);

  return (
    <div className="min-h-screen flex flex-col" id="inicio" >
        <Navbar />
        {/* movil */}
        <div className="block md:hidden">
            <div className="relative w-full h-110 overflow-hidden">
                <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute top-0 left-0 w-full h-full object-cover z-0"
                >
                    <source src={Video} type="video/mp4" />
                    Tu navegador no soporta videos.
                </video>
                <div className="relative flex flex-col items-center justify-center h-full">
                    <h1 className="text-white text-center text-2xl font-bold">Educación disruptiva en</h1>
                    <h1 className="text-white text-center text-2xl font-bold">Ciencia + Tecnología</h1>
                    <h1 className="text-white text-md font-bold mt-5">igual mentes que transforman el mundo.</h1>
                    <h1 className="text-white text-xl font-bold mt-5" style={{color: '#fff50c'}}>¡Da el primer paso hacia tu</h1>
                    <h1 className="text-white text-xl font-bold" style={{color: '#fff50c'}}>éxito académico!</h1>
                    <button onClick={scrollToCursos} className='bg-[#3c24ba] font-bold text-lg text-white mt-6 px-6 py-3 rounded-4xl'>¡Regístrate aquí!</button>
                </div>
            </div>

            <div className='text-center mt-10 text-2xl font-bold mb-6' id="cursos" style={{color: '#f4138a'}}>Nuestros cursos</div>
            <hr className='mx-8 text-[#3c24ba] border-1' />

            <div className='text-center mt-6 text-lg px-6 font-bold' style={{color: '#3c24ba'}}>Asesores Especializados en la Enseñanza de las Ciencias y Tecnología</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
          <div className="bg-white rounded-2xl shadow-2xl p-3 flex flex-col transition-transform transform hover:scale-105">
            <div className='flex justify-center items-center'>
              <img src={Uno} className='h-43 w-76 rounded-2xl' />
            </div>
            <div className="bg-[#3c24ba] w-50 mt-4 rounded-xl text-white text-center">
              Universidad / Admisión
            </div>
            <div className="mt-2 rounded-xl text-[16px] text-[#00286e] font-bold text-center">
              Entrenamiento para el examen de admisión a la universidad
            </div>
            <div className="mt-2 rounded-xl text-[16px] text-[#00286e] text-center">
              Por Kelvin Ramírez
            </div>
            <div className='space-y-5'>
              <div className='flex flex-row items-center gap-3 mt-5'>
                <FaUsers className='w-5 h-5' style={{color: '#f4138a'}} />
                <div className="text-[13px] text-[#00286e]">Para estudiantes de nIvel medio superior</div>
              </div>
              <div className='flex flex-row items-center gap-3 mt-2'>
                <CgSandClock className='w-5 h-5' style={{color: '#f4138a'}} />
                <div className="text-[13px] text-[#00286e]">Duración 8 meses</div>
              </div>
              <div className='flex flex-row items-center gap-3 mt-2'>
                <LiaChalkboardTeacherSolid className='w-5 h-5' style={{color: '#f4138a'}} />
                <div className="text-[13px] text-[#00286e]">Presencial</div>
              </div>
            </div>
            <div className='w-full flex justify-center items-center py-8'>
              <Link 
              to='/entrenamiento_examen_admision_universidad' className='bg-[#3c24ba] w-60 py-2 flex justify-center items-center gap-2 rounded-2xl'>
                <MdOutlineShoppingCart className='size-5 text-white' />
                <div className="text-[13px] text-white font-bold">Empieza tu transformación</div>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-3 flex flex-col transition-transform transform hover:scale-105">
            <div className='flex justify-center items-center'>
              <img src={Dos} className='h-43 w-76 rounded-2xl' />
            </div>
            <div className="bg-[#3c24ba] w-50 mt-4 rounded-xl text-white text-center">
              Preparatoria / Admisión
            </div>
            <div className="mt-2 rounded-xl text-[16px] text-[#00286e] font-bold text-center">
              Entrenamiento para el examen de admisión a la preparatoria
            </div>
            <div className="mt-2 rounded-xl text-[16px] text-[#00286e] text-center">
              Por Kelvin Ramírez
            </div>
            <div className='space-y-5'>
              <div className='flex flex-row items-center gap-3 mt-5'>
                <FaUsers className='w-5 h-5' style={{color: '#f4138a'}} />
                <div className="text-[13px] text-[#00286e]">Para estudiantes de nIvel secundaria</div>
              </div>
              <div className='flex flex-row items-center gap-3 mt-2'>
                <CgSandClock className='w-5 h-5' style={{color: '#f4138a'}} />
                <div className="text-[13px] text-[#00286e]">Duración 5 meses</div>
              </div>
              <div className='flex flex-row items-center gap-3 mt-2'>
                <LiaChalkboardTeacherSolid className='w-5 h-5' style={{color: '#f4138a'}} />
                <div className="text-[13px] text-[#00286e]">Presencial</div>
              </div>
            </div>
            <div className='w-full flex justify-center items-center py-8'>
              <button className='bg-[#3c24ba] w-60 py-2 flex justify-center items-center gap-2 rounded-2xl'>
                <MdOutlineShoppingCart className='size-5 text-white' />
                <div className="text-[13px] text-white font-bold">Empieza tu transformación</div>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-3 flex flex-col transition-transform transform hover:scale-105">
            <div className='flex justify-center items-center'>
              <img src={Tres} className='h-43 w-76 rounded-2xl' />
            </div>
            <div className="bg-[#3c24ba] w-50 mt-4 rounded-xl text-white text-center">
              Digital / Formación TI
            </div>
            <div className="mt-2 rounded-xl text-[16px] text-[#00286e] font-bold text-center">
              DIGI-START: desbloquea tu potencial
            </div>
            <div className="mt-1.4 rounded-xl text-[16px] text-[#00286e] font-bold text-center">
              tecnológico
            </div>
            <div className="mt-2 rounded-xl text-[16px] text-[#00286e] text-center">
              Por Alejandro Téllez 
            </div>
            <div className='space-y-5'>
              <div className='flex flex-row items-center gap-3 mt-5'>
                <FaUsers className='w-5 h-5' style={{color: '#f4138a'}} />
                <div className="text-[13px] text-[#00286e]">Para estudiantes de nIvel secundaria a superior</div>
              </div>
              <div className='flex flex-row items-center gap-3 mt-2'>
                <CgSandClock className='w-5 h-5' style={{color: '#f4138a'}} />
                <div className="text-[13px] text-[#00286e]">Duración 6 meses</div>
              </div>
              <div className='flex flex-row items-center gap-3 mt-2'>
                <LiaChalkboardTeacherSolid className='w-5 h-5' style={{color: '#f4138a'}} />
                <div className="text-[13px] text-[#00286e]">Presencial</div>
              </div>
            </div>
            <div className='w-full flex justify-center items-center py-8'>
              <button className='bg-[#3c24ba] w-60 py-2 flex justify-center items-center gap-2 rounded-2xl'>
                <MdOutlineShoppingCart className='size-5 text-white' />
                <div className="text-[13px] text-white font-bold">Empieza tu transformación</div>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-3 flex flex-col transition-transform transform hover:scale-105">
            <div className='flex justify-center items-center'>
              <img src={Cuatro} className='h-43 w-76 rounded-2xl' />
            </div>
            <div className="bg-[#3c24ba] w-62 mt-4 rounded-xl text-white text-center">
              Psicología / Desarrollo Personal
            </div>
            <div className="mt-2 rounded-xl text-[16px] text-[#00286e] font-bold text-center">
              MindBridge: Estrategias Psicoeducativas para Jóvenes
            </div>
            <div className="mt-2 rounded-xl text-[16px] text-[#00286e] text-center">
              Por Emmanuel López
            </div>
            <div className='space-y-5'>
              <div className='flex flex-row items-center gap-3 mt-5'>
                <FaUsers className='w-5 h-5' style={{color: '#f4138a'}} />
                <div className="text-[13px] text-[#00286e]">Para jóvenes de 12 a 20 años de edad</div>
              </div>
              <div className='flex flex-row items-center gap-3 mt-2'>
                <CgSandClock className='w-5 h-5' style={{color: '#f4138a'}} />
                <div className="text-[13px] text-[#00286e]">Agenda</div>
              </div>
              <div className='flex flex-row items-center gap-3 mt-2'>
                <LiaChalkboardTeacherSolid className='w-5 h-5' style={{color: '#f4138a'}} />
                <div className="text-[13px] text-[#00286e]">Presencial</div>
              </div>
            </div>
            <div className='w-full flex justify-center items-center py-8'>
              <button className='bg-[#3c24ba] w-60 py-2 flex justify-center items-center gap-2 rounded-2xl'>
                <MdOutlineShoppingCart className='size-5 text-white' />
                <div className="text-[13px] text-white font-bold">Empieza tu transformación</div>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-3 flex flex-col transition-transform transform hover:scale-105">
            <div className='flex justify-center items-center'>
              <img src={Cinco} className='h-43 w-76 rounded-2xl' />
            </div>
            <div className="bg-[#3c24ba] w-50 mt-4 rounded-xl text-white text-center">
              Lenguas Extranjeras
            </div>
            <div className="mt-2 rounded-xl text-[18px] text-[#00286e] font-bold text-center">
              SpeakUp: Mastering English from the Ground Up
            </div>
            <div className="mt-2 rounded-xl text-[18px] text-[#00286e] text-center">
              Por César Lagunes
            </div>
            <div className='space-y-5'>
              <div className='flex flex-row items-center gap-3 mt-5'>
                <FaUsers className='w-5 h-5' style={{color: '#f4138a'}} />
                <div className="text-[13px] text-[#00286e]">Para estudiantes de nIvel medio superior</div>
              </div>
              <div className='flex flex-row items-center gap-3 mt-2'>
                <CgSandClock className='w-5 h-5' style={{color: '#f4138a'}} />
                <div className="text-[13px] text-[#00286e]">Duración 6 meses</div>
              </div>
              <div className='flex flex-row items-center gap-3 mt-2'>
                <LiaChalkboardTeacherSolid className='w-5 h-5' style={{color: '#f4138a'}} />
                <div className="text-[13px] text-[#00286e]">Presencial</div>
              </div>
            </div>
            <div className='w-full flex justify-center items-center py-8'>
              <button className='bg-[#3c24ba] w-60 py-2 flex justify-center items-center gap-2 rounded-2xl'>
                <MdOutlineShoppingCart className='size-5 text-white' />
                <div className="text-[13px] text-white font-bold">Empieza tu transformación</div>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-3 flex flex-col transition-transform transform hover:scale-105">
            <div className='flex justify-center items-center'>
              <img src={Seis} className='h-43 w-76 rounded-2xl' />
            </div>
            <div className="bg-[#3c24ba] w-50 mt-4 rounded-xl text-white text-center">
              Desarrollo Académico 
            </div>
            <div className="mt-2 rounded-xl text-[18px] text-[#00286e] font-bold text-center">
              Potencialización en ciencias exactas.
            </div>
            <div className="mt-2 rounded-xl text-[18px] text-[#00286e] text-center">
              Por Kelvin Ramírez
            </div>
            <div className='space-y-5'>
              <div className='flex flex-row items-center gap-3 mt-5'>
                <FaUsers className='w-5 h-5' style={{color: '#f4138a'}} />
                <div className="text-[13px] text-[#00286e]">Para estudiantes de nIvel medio superior</div>
              </div>
              <div className='flex flex-row items-center gap-3 mt-2'>
                <CgSandClock className='w-5 h-5' style={{color: '#f4138a'}} />
                <div className="text-[13px] text-[#00286e]">Duración 4 meses</div>
              </div>
              <div className='flex flex-row items-center gap-3 mt-2'>
                <LiaChalkboardTeacherSolid className='w-5 h-5' style={{color: '#f4138a'}} />
                <div className="text-[13px] text-[#00286e]">Presencial</div>
              </div>
            </div>
            <div className='w-full flex justify-center items-center py-8'>
              <button className='bg-[#3c24ba] w-60 py-2 flex justify-center items-center gap-2 rounded-2xl'>
                <MdOutlineShoppingCart className='size-5 text-white' />
                <div className="text-[13px] text-white font-bold">Empieza tu transformación</div>
              </button>
            </div>
          </div>
            </div>

            <p className='text-center mt-23 text-lg px-4 font-bold' style={{ color: '#483dc7' }}>+10 convenios y participaciones con instituciones </p>
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

        
        <div className='text-center mt-10 text-4xl font-bold' style={{color: '#f4138a'}}>Nuestros estudiantes</div>

        <div className="pasarela-3d-container mb-10">
          <div className="pasarela-3d">
            <img src={getLeftImage()} alt="left" className="pasarela-img left" />
            <img src={images[currentIndex]} alt="center" className="pasarela-img center" />
            <img src={getRightImage()} alt="right" className="pasarela-img right" />
          </div>
        </div>

        <h1 className='text-[#00286e] text-xl text-center font-bold mb-10'>12 años de trayectoria académica</h1>
        <div className="flex justify-center items-center bg-[#3c24ba] text-yellow-400 py-6 px-4">
          <div className="flex space-x-4">
            
            {/* Primer bloque */}
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-900 text-white rounded-full p-4 mb-2">
                <ImUsers className='w-6 h-6' />
              </div>
              <span className="font-bold text-sm text-[#fff50c]">+ 20 asesores</span>
            </div>

            {/* Línea divisora */}
            <div className="w-px bg-white opacity-50"></div>

            {/* Segundo bloque */}
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-900 text-white rounded-full p-4 mb-2">
                <FaUsers className='w-6 h-6' />
              </div>
              <span className="font-bold text-sm text-[#fff50c]">+ 1200 estudiantes</span>
            </div>

            {/* Línea divisora */}
            <div className="w-px bg-white opacity-50"></div>

            {/* Tercer bloque */}
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-900 text-white rounded-full p-4 mb-2">
                <FaTrophy className='w-6 h-6' />
              </div>
              <span className="font-bold text-sm text-[#fff50c]">3 premios</span>
            </div>

          </div>
        </div>

        <div className='modelo h-50 mt-8'>
          <div className='flex justify-center h-[50%]'>
            <div className='text-lg py-4 px-4 text-center font-bold' style={{color: '#f4138a'}}>Modelo Educativo Disruptivo y Sostenible</div>
          </div>
          <div className='flex justify-center items-end h-[50%]'>
            <div className='text-lg text-center font-bold' style={{color: '#f4138a'}}>Asesores Especializados en Ciencias y Tecnología</div>
          </div>
        </div>

        <div className="flex flex-col justify-center items-center h-full gap-4 p-4 mt-6">
              <div className="carousel-container">

              <div className="card shadow-md rounded-xl p-6 w-70 Masesor1 flex flex-col justify-end items-center h-100 carousel-slide">
                <h2 className="text-2xl text-center font-bold text-white shadow-2xl">Kelvin Ramírez</h2>
                <p className='text-white'>Asesor Cienytec</p>
              </div>

              <div className="card shadow-md rounded-xl p-6 w-70 Masesor2 flex flex-col justify-end items-center h-100 carousel-slide">
                <h2 className="text-2xl text-center font-bold text-white shadow-2xl">Emmanuel López</h2>
                <p className='text-white'>Asesor Psicoeducativo</p>
              </div>

              <div className=" card shadow-md rounded-xl p-6 w-70 Masesor3 flex flex-col justify-end items-center h-100 carousel-slide">
                <h2 className="text-2xl text-center font-bold text-white shadow-2xl">Ruth Chávez</h2>
                <p className='text-white'>Asesora de MKT</p>
              </div>

              <div className="card shadow-md rounded-xl p-6 w-70 Masesor4 flex flex-col justify-end items-center h-100 carousel-slide">
                <h2 className="text-2xl text-center font-bold text-white shadow-2xl">Alejandro Tellez</h2>
                <p className='text-white'>Asesor en sistemas</p>
              </div>

              <div className="card shadow-md rounded-xl p-6 w-70 Masesor5 flex flex-col justify-end items-center h-100 carousel-slide">
                <h2 className="text-2xl text-center font-bold text-white shadow-2xl">Cesar Lagunes</h2>
                <p className='text-white'>English Teacher</p>
              </div>
              </div>
          </div>
        </div>

        {/* desktop */}
        <div className="hidden md:block">
            <div className="relative w-full h-135 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover z-0"
          >
            <source src={Video} type="video/mp4" />
            Tu navegador no soporta videos.
          </video>
          <div className="relative flex flex-col items-center justify-center h-full">
            <h1 className="text-white text-7xl font-bold">Educación disruptiva en</h1>
            <h1 className="text-white text-7xl font-bold">Ciencia + Tecnología</h1>
            <h1 className="text-white text-3xl font-bold mt-6">igual mentes que transforman el mundo.</h1>
            <h1 className="text-white text-5xl font-bold mt-6" style={{color: '#fff50c'}}>¡Da el primer paso hacia tu</h1>
            <h1 className="text-white text-5xl font-bold" style={{color: '#fff50c'}}>éxito académico!</h1>
            <button onClick={scrollToCursos} className="fancy-button bg-[#3c24ba] mt-8 py-5 px-14 rounded-[52px]">
              <svg className="border-svg bg-[#3c24ba]" viewBox="0 0 100 40" preserveAspectRatio="none">
                <rect className="border-rect" x="0" y="0" width="100" height="39" rx="0" ry="0" />
              </svg>
              <span className="button-text text-xl">¡Regístrate aquí!</span>
            </button>
          </div>
        </div>

        <div className='text-center mt-10 text-4xl font-bold mb-10' id="cursos" style={{color: '#f4138a'}}>Nuestros cursos</div>
        <hr className='ml-50 mr-50 text-[#3c24ba] border-1' />

        <div className='text-center mt-10 text-2xl font-bold' style={{color: '#3c24ba'}}>Asesores Especializados en la Enseñanza de las Ciencias y Tecnología</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6 mt-6">
          <div className="bg-white rounded-2xl shadow-2xl p-3 flex flex-col transition-transform transform hover:scale-105">
            <div className='flex justify-center items-center'>
              <img src={Uno} className='h-43 w-76 rounded-2xl' />
            </div>
            <div className="bg-[#3c24ba] w-50 mt-4 rounded-xl text-white text-center">
              Universidad / Admisión
            </div>
            <div className="mt-2 rounded-xl text-[18px] text-[#00286e] font-bold text-center">
              Entrenamiento para el examen de admisión a la universidad
            </div>
            <div className="mt-2 rounded-xl text-[18px] text-[#00286e] text-center">
              Por Kelvin Ramírez
            </div>
            <div className='space-y-5'>
              <div className='flex flex-row items-center gap-3 mt-5'>
                <FaUsers className='w-5 h-5' style={{color: '#f4138a'}} />
                <div className="text-[13px] text-[#00286e]">Para estudiantes de nIvel medio superior</div>
              </div>
              <div className='flex flex-row items-center gap-3 mt-2'>
                <CgSandClock className='w-5 h-5' style={{color: '#f4138a'}} />
                <div className="text-[13px] text-[#00286e]">Duración 8 meses</div>
              </div>
              <div className='flex flex-row items-center gap-3 mt-2'>
                <LiaChalkboardTeacherSolid className='w-5 h-5' style={{color: '#f4138a'}} />
                <div className="text-[13px] text-[#00286e]">Presencial</div>
              </div>
            </div>
            <div className='w-full flex justify-center items-end h-20'>
              <Link to='/entrenamiento_examen_admision_universidad' className='bg-[#3c24ba] w-60 py-2 flex justify-center items-center gap-2 rounded-2xl'>
                <MdOutlineShoppingCart className='size-5 text-white' />
                <div className="text-[13px] text-white font-bold">Empieza tu transformación</div>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-3 flex flex-col transition-transform transform hover:scale-105">
            <div className='flex justify-center items-center'>
              <img src={Dos} className='h-43 w-76 rounded-2xl' />
            </div>
            <div className="bg-[#3c24ba] w-50 mt-4 rounded-xl text-white text-center">
              Preparatoria / Admisión
            </div>
            <div className="mt-2 rounded-xl text-[18px] text-[#00286e] font-bold text-center">
              Entrenamiento para el examen de admisión a la preparatoria
            </div>
            <div className="mt-2 rounded-xl text-[18px] text-[#00286e] text-center">
              Por Kelvin Ramírez
            </div>
            <div className='space-y-5'>
              <div className='flex flex-row items-center gap-3 mt-5'>
                <FaUsers className='w-5 h-5' style={{color: '#f4138a'}} />
                <div className="text-[13px] text-[#00286e]">Para estudiantes de nIvel secundaria</div>
              </div>
              <div className='flex flex-row items-center gap-3 mt-2'>
                <CgSandClock className='w-5 h-5' style={{color: '#f4138a'}} />
                <div className="text-[13px] text-[#00286e]">Duración 5 meses</div>
              </div>
              <div className='flex flex-row items-center gap-3 mt-2'>
                <LiaChalkboardTeacherSolid className='w-5 h-5' style={{color: '#f4138a'}} />
                <div className="text-[13px] text-[#00286e]">Presencial</div>
              </div>
            </div>
            <div className='w-full flex justify-center items-end h-20'>
              <Link to='/entrenamiento_examen_admision_preparatoria' className='bg-[#3c24ba] w-60 py-2 flex justify-center items-center gap-2 rounded-2xl'>
                <MdOutlineShoppingCart className='size-5 text-white' />
                <div className="text-[13px] text-white font-bold">Empieza tu transformación</div>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-3 flex flex-col transition-transform transform hover:scale-105">
            <div className='flex justify-center items-center'>
              <img src={Tres} className='h-43 w-76 rounded-2xl' />
            </div>
            <div className="bg-[#3c24ba] w-50 mt-4 rounded-xl text-white text-center">
              Digital / Formación TI
            </div>
            <div className="mt-2 rounded-xl text-[18px] text-[#00286e] font-bold text-center">
              DIGI-START: desbloquea tu potencial tecnológico
            </div>
            <div className="mt-2 rounded-xl text-[18px] text-[#00286e] text-center">
              Por Alejandro Téllez 
            </div>
            <div className='space-y-5'>
              <div className='flex flex-row items-center gap-3 mt-5'>
                <FaUsers className='w-5 h-5' style={{color: '#f4138a'}} />
                <div className="text-[13px] text-[#00286e]">Para estudiantes de nIvel secundaria a superior</div>
              </div>
              <div className='flex flex-row items-center gap-3 mt-2'>
                <CgSandClock className='w-5 h-5' style={{color: '#f4138a'}} />
                <div className="text-[13px] text-[#00286e]">Duración 6 meses</div>
              </div>
              <div className='flex flex-row items-center gap-3 mt-2'>
                <LiaChalkboardTeacherSolid className='w-5 h-5' style={{color: '#f4138a'}} />
                <div className="text-[13px] text-[#00286e]">Presencial</div>
              </div>
            </div>
            <div className='w-full flex justify-center items-end h-20'>
              <button className='bg-[#3c24ba] w-60 py-2 flex justify-center items-center gap-2 rounded-2xl'>
                <MdOutlineShoppingCart className='size-5 text-white' />
                <div className="text-[13px] text-white font-bold">Empieza tu transformación</div>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-3 flex flex-col transition-transform transform hover:scale-105">
            <div className='flex justify-center items-center'>
              <img src={Cuatro} className='h-43 w-76 rounded-2xl' />
            </div>
            <div className="bg-[#3c24ba] w-62 mt-4 rounded-xl text-white text-center">
              Psicología / Desarrollo Personal
            </div>
            <div className="mt-2 rounded-xl text-[18px] text-[#00286e] font-bold text-center">
              MindBridge: Estrategias Psicoeducativas para Jóvenes
            </div>
            <div className="mt-2 rounded-xl text-[18px] text-[#00286e] text-center">
              Por Emmanuel López
            </div>
            <div className='space-y-5'>
              <div className='flex flex-row items-center gap-3 mt-5'>
                <FaUsers className='w-5 h-5' style={{color: '#f4138a'}} />
                <div className="text-[13px] text-[#00286e]">Para jóvenes de 12 a 20 años de edad</div>
              </div>
              <div className='flex flex-row items-center gap-3 mt-2'>
                <CgSandClock className='w-5 h-5' style={{color: '#f4138a'}} />
                <div className="text-[13px] text-[#00286e]">Agenda</div>
              </div>
              <div className='flex flex-row items-center gap-3 mt-2'>
                <LiaChalkboardTeacherSolid className='w-5 h-5' style={{color: '#f4138a'}} />
                <div className="text-[13px] text-[#00286e]">Presencial</div>
              </div>
            </div>
            <div className='w-full flex justify-center items-end h-20'>
              <button className='bg-[#3c24ba] w-60 py-2 flex justify-center items-center gap-2 rounded-2xl'>
                <MdOutlineShoppingCart className='size-5 text-white' />
                <div className="text-[13px] text-white font-bold">Empieza tu transformación</div>
              </button>
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6 mt-6">
          <div className="bg-white  p-3 flex flex-col">
            
          </div>

          <div className="rounded-2xl shadow-2xl p-3 flex flex-col transition-transform transform hover:scale-105">
            <div className='flex justify-center items-center'>
              <img src={Cinco} className='h-43 w-76 rounded-2xl' />
            </div>
            <div className="bg-[#3c24ba] w-50 mt-4 rounded-xl text-white text-center">
              Lenguas Extranjeras
            </div>
            <div className="mt-2 rounded-xl text-[18px] text-[#00286e] font-bold text-center">
              SpeakUp: Mastering English from the Ground Up
            </div>
            <div className="mt-2 rounded-xl text-[18px] text-[#00286e] text-center">
              Por César Lagunes
            </div>
            <div className='space-y-5'>
              <div className='flex flex-row items-center gap-3 mt-5'>
                <FaUsers className='w-5 h-5' style={{color: '#f4138a'}} />
                <div className="text-[13px] text-[#00286e]">Para estudiantes de nIvel medio superior</div>
              </div>
              <div className='flex flex-row items-center gap-3 mt-2'>
                <CgSandClock className='w-5 h-5' style={{color: '#f4138a'}} />
                <div className="text-[13px] text-[#00286e]">Duración 6 meses</div>
              </div>
              <div className='flex flex-row items-center gap-3 mt-2'>
                <LiaChalkboardTeacherSolid className='w-5 h-5' style={{color: '#f4138a'}} />
                <div className="text-[13px] text-[#00286e]">Presencial</div>
              </div>
            </div>
            <div className='w-full flex justify-center items-end h-20'>
              <button className='bg-[#3c24ba] w-60 py-2 flex justify-center items-center gap-2 rounded-2xl'>
                <MdOutlineShoppingCart className='size-5 text-white' />
                <div className="text-[13px] text-white font-bold">Empieza tu transformación</div>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-3 flex flex-col transition-transform transform hover:scale-105">
            <div className='flex justify-center items-center'>
              <img src={Seis} className='h-43 w-76 rounded-2xl' />
            </div>
            <div className="bg-[#3c24ba] w-50 mt-4 rounded-xl text-white text-center">
              Desarrollo Académico 
            </div>
            <div className="mt-2 rounded-xl text-[18px] text-[#00286e] font-bold text-center">
              Potencialización en ciencias exactas.
            </div>
            <div className="mt-2 rounded-xl text-[18px] text-[#00286e] text-center">
              Por Kelvin Ramírez
            </div>
            <div className='space-y-5'>
              <div className='flex flex-row items-center gap-3 mt-5'>
                <FaUsers className='w-5 h-5' style={{color: '#f4138a'}} />
                <div className="text-[13px] text-[#00286e]">Para estudiantes de nIvel medio superior</div>
              </div>
              <div className='flex flex-row items-center gap-3 mt-2'>
                <CgSandClock className='w-5 h-5' style={{color: '#f4138a'}} />
                <div className="text-[13px] text-[#00286e]">Duración 4 meses</div>
              </div>
              <div className='flex flex-row items-center gap-3 mt-2'>
                <LiaChalkboardTeacherSolid className='w-5 h-5' style={{color: '#f4138a'}} />
                <div className="text-[13px] text-[#00286e]">Presencial</div>
              </div>
            </div>
            <div className='w-full flex justify-center items-end h-20'>
              <button className='bg-[#3c24ba] w-60 py-2 flex justify-center items-center gap-2 rounded-2xl'>
                <MdOutlineShoppingCart className='size-5 text-white' />
                <div className="text-[13px] text-white font-bold">Empieza tu transformación</div>
              </button>
            </div>
          </div>

          <div className="p-3 flex flex-col">
            
          </div>

        </div>

        <p className='text-center mt-23 text-2xl font-bold' style={{ color: '#483dc7' }}>+10 convenios y participaciones con instituciones </p>
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

        <div className='text-center mt-10 text-4xl font-bold' style={{color: '#f4138a'}}>Nuestros estudiantes</div>

        <div className="pasarela-3d-container mt-15 mb-10">
          <div className="pasarela-3d">
            <img src={getLeftImage()} alt="left" className="pasarela-img left" />
            <img src={images[currentIndex]} alt="center" className="pasarela-img center" />
            <img src={getRightImage()} alt="right" className="pasarela-img right" />
          </div>
        </div>

        <h1 className='text-[#00286e] mt-15 text-3xl text-center font-bold mb-10'>12 años de trayectoria académica</h1>
        <div className="flex justify-center items-center bg-[#3c24ba] py-6 px-4">
          <div className="flex sm:space-x-10 lg:space-x-42">
            
            {/* Primer bloque */}
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-900 text-white rounded-full p-4 mb-2">
                <ImUsers className='w-10 h-10' />
              </div>
              <span className="font-bold text-3xl text-[#fff50c]">+ 20 asesores</span>
            </div>

            {/* Línea divisora */}
            <div className="w-px bg-white opacity-50"></div>

            {/* Segundo bloque */}
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-900 text-white rounded-full p-4 mb-2">
                <FaUsers className='w-10 h-10' />
              </div>
              <span className="font-bold text-3xl text-[#fff50c]">+ 1100 estudiantes</span>
            </div>

            {/* Línea divisora */}
            <div className="w-px bg-white opacity-50"></div>

            {/* Tercer bloque */}
            <div className="flex flex-col items-center text-center">
              <div className="bg-blue-900 text-white rounded-full p-4 mb-2">
                <FaTrophy className='w-10 h-10' />
              </div>
              <span className="font-bold text-3xl text-[#fff50c]">3 premios</span>
            </div>

          </div>
        </div>

        <div className='modelo h-190'>
          <div className='flex justify-center h-[50%]'>
            <div className='text-3xl py-12 font-bold' style={{color: '#f4138a'}}>Modelo Educativo Disruptivo y Sostenible</div>
          </div>
          <div className='flex justify-center items-end h-[50%]'>
            <div className='text-3xl font-bold py-12' style={{color: '#f4138a'}}>Asesores Especializados en Ciencias y Tecnología</div>
          </div>
        </div>

        <div className="flex justify-center items-center h-full gap-4 px-8">
            <div className="card shadow-md rounded-xl p-6 w-65 Masesor1 flex flex-col justify-end items-center h-100">
              <h2 className="text-2xl text-center font-bold text-white shadow-2xl">Kelvin Ramírez</h2>
              <p className='text-white'>Asesor Cienytec</p>
            </div>

            <div className="card shadow-md rounded-xl p-6 w-65 Masesor2 flex flex-col justify-end items-center h-100">
              <h2 className="text-2xl text-center font-bold text-white shadow-2xl">Emmanuel López</h2>
              <p className='text-white'>Asesor Psicoeducativo</p>
            </div>

            <div className=" card shadow-md rounded-xl p-6 w-65 Masesor3 flex flex-col justify-end items-center h-100">
              <h2 className="text-2xl text-center font-bold text-white shadow-2xl">Ruth Chávez</h2>
              <p className='text-white'>Asesora de MKT</p>
            </div>

            <div className="card shadow-md rounded-xl p-6 w-65 Masesor4 flex flex-col justify-end items-center h-100">
              <h2 className="text-2xl text-center font-bold text-white shadow-2xl">Alejandro Tellez</h2>
              <p className='text-white'>Asesor en sistemas</p>
            </div>

            <div className="card shadow-md rounded-xl p-6 w-65 Masesor5 flex flex-col justify-end items-center h-100">
              <h2 className="text-2xl text-center font-bold text-white shadow-2xl">César Lagunes</h2>
              <p className='text-white'>English Teacher</p>
            </div>
          </div>
        </div>
        <Footer />
    </div>
  )
}

export default Web