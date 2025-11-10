import React, {useState, useEffect} from 'react'
import Navbar from '../../../components/mqerk/Navbar'
import Uno from "../../../assets/mqerk/Fotos Estudiantes/30.png";
import Dos from "../../../assets/mqerk/Fotos Estudiantes/31.png";
import Tres from "../../../assets/mqerk/Fotos Estudiantes/32.png";
import Primero from "../../../assets/mqerk/veranotx/01.png";
import Segundo from "../../../assets/mqerk/veranotx/02.png";
import Tercero from "../../../assets/mqerk/veranotx/03.png";
import Cuarto from "../../../assets/mqerk/veranotx/04.png";
import Quinto from "../../../assets/mqerk/veranotx/05.png";
import Sexto from "../../../assets/mqerk/veranotx/06.png";
import Septimo from "../../../assets/mqerk/veranotx/07.png";
import { Link } from "react-router-dom";
import Ocho from "../../../assets/mqerk/talleres/8.png";
import Nueve from "../../../assets/mqerk/talleres/9.png";

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
        <h1 className='text-center mt-35 font-bold text-2xl text-[#401454]'>Gira Educativa: Educación Disruptiva, Transformando Mentes.</h1>

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
                    Inspirar para decidir y transformar. En una gira educativa al CBTis 107, los asesores de MQerKAcademy guiaron a estudiantes de nivel medio superior en un recorrido de autoconocimiento y proyección profesional. Más allá de orientarlos en la elección de una carrera, se buscó motivarles a seguir aprendiendo de forma disruptiva, rompiendo esquemas tradicionales y conectando sus intereses con un propósito real. La experiencia fomentó la toma de decisiones conscientes y el desarrollo de habilidades para enfrentar los retos del futuro con creatividad y determinación.
                    </p>
                </div>
                <div>
                    <h1 className='font-bold text-2xl'>Objetivos:</h1>
                    <ul className="space-y-2 gap-1 flex flex-col py-5 text-lg">
                        <li className="flex items-center">
                            <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                            Inspirar enfoques innovadores en la educación.
                        </li>
                        <li className="flex items-center">
                            <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                            Compartir prácticas disruptivas que han transformado aulas.
                        </li>
                        <li className="flex items-center">
                            <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                            Impulsar habilidades del siglo XXI como la colaboración, resiliencia y pensamiento crítico.
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
                        <p className="text-md">02 al 19 de junio del 2023</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Segundo} className='w-8' />
                        <p className="text-md">Dirigido a: Alumnos de 5° semestre</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Tercero} className='w-6' />
                        <p className="text-md">San Juan Bautista Tuxtepec, Oaxaca.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Cuarto} className='w-6' />
                        <p className="text-md">Instalaciones: CBTIS 107</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Quinto} className='w-6' />
                        <p className="text-md">80 asistentes</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Sexto} className='w-6' />
                        <p className="text-md">4 horas</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Septimo} className='w-6' />
                        <p className="text-md">No aplica</p>
                    </div>
                </div>
            </div>
        </div>

        <h1 className='text-center mt-25 font-bold text-2xl text-[#401454]'>Tambien puedes ver:</h1>

        <div className='grid grid-cols-4 px-10 gap-10 mt-8'>
        
                  <Link to='/talleres/transformar_la_educacion' className='flex flex-col rounded-2xl shadow-2xl py-2'>
                    <div className="flex justify-center mb-6">
                      <h1 className='font-bold text-xl text-[#401454] text-center'>Cambiar el mundo, transformar la educacion</h1>
                    </div>
                    <img src={Ocho} className='px-3' />
                    <div>
                      <p className='px-4 mt-2 text-justify text-lg'>
                      Conferencia otorgada exclusivamente a los alumnos y alumnas de Sto semestre
                       del Centro de Bachillerato Tecnológico Industrial y de Servicios 107.
                      </p>
                    </div>
                    <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
                      <p>06 de diciembre</p>
                    </div>
                  </Link>
        
                </div>

      </div>

      {/* MOVILE */}
      <div className='block md:hidden'>
        <h1 className='text-center mt-35 font-bold text-2xl text-[#401454]'>Gira Educativa: Educación Disruptiva, Transformando Mentes.</h1>

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
                    Inspirar para decidir y transformar. En una gira educativa al CBTis 107, los asesores de MQerKAcademy guiaron a estudiantes de nivel medio superior en un recorrido de autoconocimiento y proyección profesional. Más allá de orientarlos en la elección de una carrera, se buscó motivarles a seguir aprendiendo de forma disruptiva, rompiendo esquemas tradicionales y conectando sus intereses con un propósito real. La experiencia fomentó la toma de decisiones conscientes y el desarrollo de habilidades para enfrentar los retos del futuro con creatividad y determinación.
                    </p>
                </div>
                <div>
                    <h1 className='font-bold text-2xl'>Objetivos:</h1>
                    <ul className="space-y-2 gap-1 flex flex-col py-3 text-lg">
                        <li className="flex items-center">
                            <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                            Inspirar enfoques innovadores en la educación.
                        </li>
                        <li className="flex items-center">
                            <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                            Compartir prácticas disruptivas que han transformado aulas.
                        </li>
                        <li className="flex items-center">
                            <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                            Impulsar habilidades del siglo XXI como la colaboración, resiliencia y pensamiento crítico.
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
                        <p className="text-md">02 al 19 de junio del 2023</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Segundo} className='w-8' />
                        <p className="text-md">Dirigido a: Alumnos de 5° semestre</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Tercero} className='w-6' />
                        <p className="text-md">San Juan Bautista Tuxtepec, Oaxaca.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Cuarto} className='w-6' />
                        <p className="text-md">Instalaciones: CBTIS 107</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Quinto} className='w-6' />
                        <p className="text-md">80 asistentes</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Sexto} className='w-6' />
                        <p className="text-md">4 horas</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Septimo} className='w-6' />
                        <p className="text-md">No aplica</p>
                    </div>
                </div>
            </div>

            <h1 className='text-center mt-25 font-bold text-2xl text-[#401454]'>Tambien puedes ver:</h1>

        <div className='grid grid-cols-1 px-10 gap-10 mt-8'>
        
                  <Link to='/talleres/transformar_la_educacion' className='flex flex-col rounded-2xl shadow-2xl py-2'>
                    <div className="flex justify-center mb-6">
                      <h1 className='font-bold text-xl text-[#401454] text-center'>Cambiar el mundo, transformar la educacion</h1>
                    </div>
                    <img src={Ocho} className='px-3' />
                    <div>
                      <p className='px-4 mt-2 text-justify text-lg'>
                      Conferencia otorgada exclusivamente a los alumnos y alumnas de Sto semestre
                       del Centro de Bachillerato Tecnológico Industrial y de Servicios 107.
                      </p>
                    </div>
                    <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
                      <p>06 de diciembre</p>
                    </div>
                  </Link>
        
                </div>

      </div>

    </div>
  )
}

export default Talleres