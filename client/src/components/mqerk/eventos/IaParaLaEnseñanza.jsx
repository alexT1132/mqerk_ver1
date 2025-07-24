import React, {useState, useEffect} from 'react'
import Navbar from '../../../components/mqerk/Navbar'
import Uno from "../../../assets/mqerk/Fotos Estudiantes/talleres.png";
import Dos from "../../../assets/mqerk/Fotos Estudiantes/talleres (2).png";
import Tres from "../../../assets/mqerk/Fotos Estudiantes/talleres (3).png";
import Cuatro from "../../../assets/mqerk/talleres/4.png";
import Cinco from "../../../assets/mqerk/talleres/3.png";
import Seis from "../../../assets/mqerk/talleres/2.png";
import Primero from "../../../assets/mqerk/veranotx/01.png";
import Segundo from "../../../assets/mqerk/veranotx/02.png";
import Tercero from "../../../assets/mqerk/veranotx/03.png";
import Cuarto from "../../../assets/mqerk/veranotx/04.png";
import Quinto from "../../../assets/mqerk/veranotx/05.png";
import Sexto from "../../../assets/mqerk/veranotx/06.png";
import Septimo from "../../../assets/mqerk/veranotx/07.png";
import { Link } from "react-router-dom";

function Talleres() {

    const [currentIndex, setCurrentIndex] = useState(0);
    const [forward, setForward] = useState(true);

    const images = [
        Uno,
        Dos,
        Tres
    ];

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
        

  return (
    <div className='min-h-screen flex flex-col'>
      <Navbar />
      {/* DESKTOP */}
      <div className='hidden md:block'>
        <h1 className='text-center mt-35 font-bold text-2xl text-[#401454]'>IA para la Enseñanza en el Aula:</h1>

        <div className="pasarela-3d-container mt-15 mb-10">
          <div className="pasarela-3d">
            <img src={getLeftImage()} alt="left" className="pasarela-img left" />
            <img src={images[currentIndex]} alt="center" className="pasarela-img center" />
            <img src={getRightImage()} alt="right" className="pasarela-img right" />
          </div>
        </div>

        <div className='flex w-full px-8 mt-20 gap-8 mb-6'>
            <div className='flex flex-col w-[60%] gap-10'>
                <div>
                    <h1 className='font-bold text-2xl'>Resumen</h1>
                    <p className='text-justify text-lg'>
                    La Escuela Primaria Urbana Fernando Montes de Oca contó con la participación del Asesor Kelvin Valentin Gómez Ramírez, CEO de MQerKAcademy y experto en el uso de la inteligencia artificial en la educación, quien compartió su conocimiento y experiencia con los docentes y directores de la escuela. Este taller fue posible gracias a la colaboración con la UNID Campus Tuxtepec, quienes apoyan la innovación educativa y el uso de nuevas tecnologías para transformar el aprendizaje en las aulas.
                    </p>
                </div>
                <div>
                    <h1 className='font-bold text-2xl'>Objetivos:</h1>
                    <ul className="space-y-2 gap-1 flex flex-col py-5 text-lg">
                        <li className="flex items-center">
                            <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                            Conocimiento en el uso de la inteligencia artificial en la educación.
                        </li>
                        <li className="flex items-center">
                            <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                            Concienciar a los docentes sobre el impacto actual y futuro de la IA en la educación.
                        </li>
                        <li className="flex items-center">
                            <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                            Explorar el potencial de la inteligencia artificial como herramienta para mejorar los procesos de enseñanza y aprendizaje en el aula.
                        </li>
                    </ul>
                </div>
            </div>
            <div className="relative w-[35%] h-79 bg-white m-4 p-6">
                {/* Esquina superior izquierda */}
                <div className="absolute top-0 left-0 w-[30%] h-[40%] border-t-4 border-l-4 border-[#f4138a]" />

                {/* Esquina inferior derecha */}
                <div className="absolute bottom-0 right-0 w-[30%] h-[40%] border-b-4 border-r-4 border-[#f4138a]" />

                <div className='space-y-3'>
                    <div className="flex items-center gap-3">
                        <img src={Primero} className='w-8' />
                        <p className="text-lg">25 de Marzo del 2025</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Segundo} className='w-8' />
                        <p className="text-lg">Dirigido a: docentes de nivel primaria</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Tercero} className='w-6' />
                        <p className="text-md">San Juan Bautista Tuxtepec, Oaxaca.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Cuarto} className='w-6' />
                        <p className="text-md">Instalaciones: Esc. Prim. Urb. Fernando Montes de Oca</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Quinto} className='w-6' />
                        <p className="text-md">35 asistentes</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Sexto} className='w-6' />
                        <p className="text-md">2 horas</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Septimo} className='w-6' />
                        <p className="text-md">No aplica</p>
                    </div>
                </div>
            </div>
        </div>

        <h1 className='text-center mt-35 font-bold text-2xl text-[#401454]'>Tambien puedes ver:</h1>

        <div className='grid grid-cols-4 px-10 gap-10 mt-8'>

          <Link to='/talleres/ia_en_la_salud' className='flex flex-col rounded-2xl hover:shadow-2xl py-3'>
            <div className="flex justify-center mb-6">
              <h1 className='font-bold text-xl text-[#401454] text-center'>IA en la salud</h1>
            </div>
            <img src={Seis} className='px-5' />
            <div>
              <p className='px-4 mt-2 text-justify text-lg'>
                Sesión informativa para el personal del sector salud sobre inteligencia artificial aplicada a la innovación médica y la prevención de fraudes digitales.
              </p>
            </div>
            <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
              <p>18 de marzo</p>
            </div>
          </Link>

          <Link to='/talleres/ia_en_la_gestion_emp' className='flex flex-col rounded-2xl hover:shadow-2xl py-3'>
            <h1 className='font-bold text-xl text-[#401454] text-center mb-6'>IA en la gestión empresarial</h1>
            <img src={Cinco} className='px-5' />
            <div>
              <p className='px-4 text-justify text-lg'>
                Ejecutivos conocieron cómo aplicar la inteligencia artificial para optimizar procesos y tomar decisiones en la Compañía Cervecera del Trópico.
              </p>
            </div>
            <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
              <p>07 de marzo</p>
            </div>
          </Link>

          <Link to='/talleres/tecnomate' className='flex flex-col rounded-2xl hover:shadow-2xl py-3'>
            <div className="flex justify-center mb-6">
              <h1 className='font-bold text-xl text-[#401454] text-center'>TecnoMate</h1>
            </div>
            <img src={Cuatro} className='px-5' />
            <div>
              <p className='px-4 mt-2 text-justify text-lg'>
                Los docentes fueron capacitados en el uso de herramientas tecnológicas con el objetivo de mejorar la enseñanza y el aprendizaje de las matemáticas.
              </p>
            </div>
            <div className='flex justify-end items-end w-full mt-5 font-bold px-6'>
              <p>07 de enero</p>
            </div>
          </Link>

        </div>


      </div>

      {/* MOVILE */}
      <div className='block md:hidden'>
        <h1 className='text-center mt-24 font-bold text-2xl text-[#401454]'>IA para la Enseñanza en el Aula:</h1>

        <div className="pasarela-3d-container">
            <div className="pasarela-3d">
                <img src={getLeftImage()} alt="left" className="pasarela-img left" />
                <img src={images[currentIndex]} alt="center" className="pasarela-img center" />
                <img src={getRightImage()} alt="right" className="pasarela-img right" />
            </div>
        </div>

            <div className='flex flex-col w-full gap-10 px-6'>
                <div>
                    <h1 className='font-bold text-2xl'>Resumen</h1>
                    <p className='text-justify text-lg'>
                        La Escuela Primaria Urbana Fernando Montes de Oca contó con la participación del Asesor Kelvin Valentin Gómez Ramírez, CEO de MQerKAcademy y experto en el uso de la inteligencia artificial en la educación, quien compartió su conocimiento y experiencia con los docentes y directores de la escuela. Este taller fue posible gracias a la colaboración con la UNID Campus Tuxtepec, quienes apoyan la innovación educativa y el uso de nuevas tecnologías para transformar el aprendizaje en las aulas.
                    </p>
                </div>
                <div>
                    <h1 className='font-bold text-2xl'>Objetivos:</h1>
                    <ul className="space-y-2 gap-1 flex flex-col py-3 text-lg">
                        <li className="flex items-center">
                            <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                            Conocimiento en el uso de la inteligencia artificial en la educación.
                        </li>
                        <li className="flex items-center">
                            <span className="w-4 h-2 bg-black rounded-full mr-3"></span>
                            Concienciar a los docentes sobre el impacto actual y futuro de la IA en la educación.
                        </li>
                        <li className="flex items-center">
                            <span className="w-4 h-2 bg-black rounded-full mr-3"></span>
                            Explorar el potencial de la inteligencia artificial como herramienta para mejorar los procesos de enseñanza y aprendizaje en el aula.
                        </li>
                    </ul>
                </div>
            </div>

            <div className="relative w-89 h-90 bg-white m-4 p-6 mt-8">
                {/* Esquina superior izquierda */}
                <div className="absolute top-0 left-0 w-[45%] h-[40%] border-t-4 border-l-4 border-[#f4138a]" />

                {/* Esquina inferior derecha */}
                <div className="absolute bottom-0 right-0 w-[45%] h-[40%] border-b-4 border-r-4 border-[#f4138a]" />

                <div className='space-y-3'>
                    <div className="flex items-center gap-3">
                        <img src={Primero} className='w-8' />
                        <p className="text-lg">25 de Marzo del 2025</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Segundo} className='w-8' />
                        <p className="text-lg">Dirigido a: docentes de nivel primaria</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Tercero} className='w-6' />
                        <p className="text-md">San Juan Bautista Tuxtepec, Oaxaca.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Cuarto} className='w-6' />
                        <p className="text-md">Instalaciones: Esc. Prim. Urb. Fernando Montes de Oca</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Quinto} className='w-6' />
                        <p className="text-md">35 asistentes</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Sexto} className='w-6' />
                        <p className="text-md">2 horas</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Septimo} className='w-6' />
                        <p className="text-md">No aplica</p>
                    </div>
                </div>
            </div>

            <h1 className='text-center mt-35 font-bold text-2xl text-[#401454]'>Tambien puedes ver:</h1>

        <div className='grid grid-cols-1 px-10 gap-10 mt-8'>

          <Link to='/talleres/ia_en_la_salud' className='flex flex-col rounded-2xl hover:shadow-2xl py-3'>
            <div className="flex justify-center mb-6">
              <h1 className='font-bold text-xl text-[#401454] text-center'>IA en la salud</h1>
            </div>
            <img src={Seis} className='px-5' />
            <div>
              <p className='px-4 mt-2 text-justify text-lg'>
                Sesión informativa para el personal del sector salud sobre inteligencia artificial aplicada a la innovación médica y la prevención de fraudes digitales.
              </p>
            </div>
            <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
              <p>18 de marzo</p>
            </div>
          </Link>

          <Link to='/talleres/ia_en_la_gestion_emp' className='flex flex-col rounded-2xl hover:shadow-2xl py-3'>
            <h1 className='font-bold text-xl text-[#401454] text-center mb-6'>IA en la gestión empresarial</h1>
            <img src={Cinco} className='px-5' />
            <div>
              <p className='px-4 text-justify text-lg'>
                Ejecutivos conocieron cómo aplicar la inteligencia artificial para optimizar procesos y tomar decisiones en la Compañía Cervecera del Trópico.
              </p>
            </div>
            <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
              <p>07 de marzo</p>
            </div>
          </Link>

          <Link to='/talleres/tecnomate' className='flex flex-col rounded-2xl hover:shadow-2xl py-3'>
            <div className="flex justify-center mb-6">
              <h1 className='font-bold text-xl text-[#401454] text-center'>TecnoMate</h1>
            </div>
            <img src={Cuatro} className='px-5' />
            <div>
              <p className='px-4 mt-2 text-justify text-lg'>
                Los docentes fueron capacitados en el uso de herramientas tecnológicas con el objetivo de mejorar la enseñanza y el aprendizaje de las matemáticas.
              </p>
            </div>
            <div className='flex justify-end items-end w-full mt-5 font-bold px-6'>
              <p>07 de enero</p>
            </div>
          </Link>

        </div>

      </div>

    </div>
  )
}

export default Talleres