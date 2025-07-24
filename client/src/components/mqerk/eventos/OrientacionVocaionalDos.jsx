import React, {useState, useEffect} from 'react'
import Navbar from '../../../components/mqerk/Navbar'
import Uno from "../../../assets/mqerk/Fotos Estudiantes/22.png";
import Dos from "../../../assets/mqerk/Fotos Estudiantes/23.png";
import Tres from "../../../assets/mqerk/Fotos Estudiantes/24.png";
import Primero from "../../../assets/mqerk/veranotx/01.png";
import Segundo from "../../../assets/mqerk/veranotx/02.png";
import Tercero from "../../../assets/mqerk/veranotx/03.png";
import Cuarto from "../../../assets/mqerk/veranotx/04.png";
import Quinto from "../../../assets/mqerk/veranotx/05.png";
import Sexto from "../../../assets/mqerk/veranotx/06.png";
import Septimo from "../../../assets/mqerk/veranotx/07.png";
import { Link } from "react-router-dom";
import Cinco from "../../../assets/mqerk/talleres/5.png";
import Siete from "../../../assets/mqerk/talleres/7.png";

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
        <h1 className='text-center mt-35 font-bold text-2xl text-[#401454]'>Orientación Vocacional y Psicoeducativa: Transformar mi Educación</h1>

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
                        Con ideas claras y participación activa, los estudiantes de 5º semestre del CBTis 107 de Tuxtepec exploraron su vocación en un taller transformador. A través de dinámicas y metodologías centradas en el autoconocimiento, la toma de decisiones académicas y profesionales, identificaron sus intereses, habilidades y competencias. La sesión fue guiada por Lic. Kelvin Ramírez, quien desde MQerKAcademy compartió herramientas clave para fortalecer su elección profesional y visualizar su futuro desde una perspectiva consciente y estratégica.
                    </p>
                </div>
                <div>
                    <h1 className='font-bold text-2xl'>Objetivos:</h1>
                    <ul className="space-y-2 gap-1 flex flex-col py-5 text-lg">
                        <li className="flex items-center">
                            <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                            Ayudar a los estudiantes a descubrir sus intereses, talentos y valores para elegir su vocación.
                        </li>
                        <li className="flex items-center">
                            <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                            Destacar la importancia del bienestar emocional al tomar decisiones sobre su futuro.
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
                        <p className="text-md">18 de Octubre del 2024</p>
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

        <h1 className='text-center mt-35 font-bold text-2xl text-[#401454]'>Tambien puedes ver:</h1>

<div className='grid grid-cols-4 px-10 gap-10 mt-8'>

          <Link to='/talleres/orientacion_vocacional_y_psicoeducativa' className='flex flex-col rounded-2xl hover:shadow-2xl py-2'>
            <div className='flex justify-center mb-6'>
              <h1 className='font-bold text-center text-xl text-[#401454]'>Orientación vocacional y psicoeducativa</h1>
            </div>
            <div className='px-5'>
              <img src={Cinco} />
            </div>
            <div>
              <p className='px-4 mt-2 text-justify text-lg'>
              Espacio formativo donde los estudiantes reflexionaron sobre su futuro académico y profesional,
              impulsando su motivación y toma de decisiones con propósito.
              </p>
            </div>
            <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
              <p>21 de octubre</p>
            </div>
          </Link>

          <Link to='/talleres/apoyo_a_la_ciencia_y_la_tecnologia' className='flex flex-col rounded-2xl hover:shadow-2xl py-2'>
            <h1 className='font-bold text-xl text-[#401454] text-center mb-6'>Apoyo a la ciencia y tecnologia</h1>
            <img src={Siete} className='px-5' />
            <div>
              <p className='px-4 text-justify text-lg'>
              Recibimos a jóvenes ganadores en programación, reafirmando nuestro compromiso con la tecnología y la educación.
              </p>
            </div>
            <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
              <p>22 de enero</p>
            </div>
          </Link>

        </div>

      </div>

      {/* MOVILE */}
      <div className='block md:hidden'>
      <h1 className='text-center mt-25 font-bold text-2xl text-[#401454]'>Orientación Vocacional y Psicoeducativa: Transformar mi Educación</h1>

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
                    Con ideas claras y participación activa, los estudiantes de 5º semestre del CBTis 107 de Tuxtepec exploraron su vocación en un taller transformador. A través de dinámicas y metodologías centradas en el autoconocimiento, la toma de decisiones académicas y profesionales, identificaron sus intereses, habilidades y competencias. La sesión fue guiada por Lic. Kelvin Ramírez, quien desde MQerKAcademy compartió herramientas clave para fortalecer su elección profesional y visualizar su futuro desde una perspectiva consciente y estratégica.
                    </p>
                </div>
                <div>
                    <h1 className='font-bold text-2xl'>Objetivos:</h1>
                    <ul className="space-y-2 gap-1 flex flex-col py-3 text-lg">
                        <li className="flex items-center">
                            <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                            Ayudar a los estudiantes a descubrir sus intereses, talentos y valores para elegir su vocación.
                        </li>
                        <li className="flex items-center">
                            <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                            Destacar la importancia del bienestar emocional al tomar decisiones sobre su futuro.
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
                        <p className="text-md">18 de Octubre del 2024</p>
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

          <Link to='/talleres/orientacion_vocacional_y_psicoeducativa' className='flex flex-col rounded-2xl shadow-2xl py-2'>
            <div className='flex justify-center mb-6'>
              <h1 className='font-bold text-center text-xl text-[#401454]'>Orientación vocacional y psicoeducativa</h1>
            </div>
            <div className='px-5'>
              <img src={Cinco} />
            </div>
            <div>
              <p className='px-4 mt-2 text-justify text-lg'>
              Espacio formativo donde los estudiantes reflexionaron sobre su futuro académico y profesional,
              impulsando su motivación y toma de decisiones con propósito.
              </p>
            </div>
            <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
              <p>21 de octubre</p>
            </div>
          </Link>

          <Link to='/talleres/apoyo_a_la_ciencia_y_la_tecnologia' className='flex flex-col rounded-2xl shadow-2xl py-2'>
            <h1 className='font-bold text-xl text-[#401454] text-center mb-6'>Apoyo a la ciencia y tecnologia</h1>
            <img src={Siete} className='px-5' />
            <div>
              <p className='px-4 text-justify text-lg'>
              Recibimos a jóvenes ganadores en programación, reafirmando nuestro compromiso con la tecnología y la educación.
              </p>
            </div>
            <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
              <p>22 de enero</p>
            </div>
          </Link>

        </div>

      </div>

    </div>
  )
}

export default Talleres