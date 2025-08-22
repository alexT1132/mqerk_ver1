import React, {useState, useEffect} from 'react'
import Navbar from '../../../components/mqerk/Navbar'
import Uno from "../../../assets/mqerk/Fotos Estudiantes/33.png";
import Dos from "../../../assets/mqerk/Fotos Estudiantes/34.png";
import Tres from "../../../assets/mqerk/Fotos Estudiantes/35.png";
import Primero from "../../../assets/mqerk/veranotx/01.png";
import Segundo from "../../../assets/mqerk/veranotx/02.png";
import Tercero from "../../../assets/mqerk/veranotx/03.png";
import Cuarto from "../../../assets/mqerk/veranotx/04.png";
import Quinto from "../../../assets/mqerk/veranotx/05.png";
import Sexto from "../../../assets/mqerk/veranotx/06.png";
import Septimo from "../../../assets/mqerk/veranotx/07.png";
import ReactPlayer from 'react-player/youtube';
import Footer from "../../footer";

function Online() {

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
        <h1 className='text-center mt-10 font-bold text-2xl text-[#401454]'>Testimonios: Acredita El Examen De Admisión A La Universidad</h1>

        <div className="flex justify-center items-center mt-10">
            <div className="w-full max-w-3xl aspect-video">
                <ReactPlayer
                url="https://youtu.be/v-iXIcu6LUI"
                playing
                muted
                controls
                width="100%"
                height="100%"
                className="rounded-2xl shadow-lg"
                />
            </div>
        </div>

        <div className='flex w-full px-8 mt-20 gap-8 mb-6'>
            <div className='flex flex-col w-[60%] gap-10'>
                <div>
                    <h1 className='font-bold text-2xl'>Resumen</h1>
                    <p className='text-justify text-lg'>
                    La experiencia transformadora del curso "Acredita el examen de admisión a la universidad 2023". Los estudiantes del curso, a cargo de Kelvin Ramírez, compartieron sus testimonios sobre la primer simulación del examen de admisión. Cada uno de ellos destacó cómo la simulación les permitió comprender mejor el formato del examen, mejorar sus tiempos de respuesta y reforzar sus conocimientos clave. Más allá de la preparación académica, los testimonios reflejaron cómo el curso contribuyó a aumentar su confianza y reducir el estrés, preparándolos de manera efectiva para afrontar el desafío real.
                    </p>
                </div>
                <div>
                    <h1 className='font-bold text-2xl'>Objetivos:</h1>
                    <ul className="space-y-2 gap-1 flex flex-col py-5 text-lg">
                        <li className="flex items-center">
                            <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                            Generar confianza en padres y alumnos sobre la calidad del curso.
                        </li>
                        <li className="flex items-center">
                            <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                            Ayudar a decidir qué carrera o programa estudiar, si aún tienes dudas.
                        </li>
                        <li className="flex items-center">
                            <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                            Mostrar a la universidad que tienes la capacidad y la disciplina para tener éxito en estudios superiores.
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
                        <p className="text-md">29 de febrero del 2023</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Segundo} className='w-8' />
                        <p className="text-md">Dirigido a: estudiantes y padres de familia</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Tercero} className='w-6' />
                        <p className="text-md">San Juan Bautista Tuxtepec, Oaxaca.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Cuarto} className='w-6' />
                        <p className="text-md">Instalaciones de: MQerKAcademy</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Quinto} className='w-6' />
                        <p className="text-md">7 asistentes</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Sexto} className='w-6' />
                        <p className="text-md">4 Minutos</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Septimo} className='w-6' />
                        <p className="text-md">No aplica</p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* MOVILE */}
      <div className='block md:hidden'>
        <h1 className='text-center mt-25 font-bold text-2xl text-[#401454]'>Testimonios: Acredita El Examen De Admisión A La Universidad</h1>

        <div className="flex justify-center items-center mt-10">
            <div className="w-full max-w-3xl aspect-video flex justify-center items-center">
                <ReactPlayer
                url="https://youtu.be/v-iXIcu6LUI"
                playing
                muted
                controls
                width="90%"
                height="100%"
                className="rounded-2xl shadow-lg"
                />
            </div>
        </div>

            <div className='flex flex-col w-full gap-10 px-6 mt-15'>
                <div>
                    <h1 className='font-bold text-2xl'>Resumen</h1>
                    <p className='text-justify text-lg'>
                    La experiencia transformadora del curso "Acredita el examen de admisión a la universidad 2023". Los estudiantes del curso, a cargo de Kelvin Ramírez, compartieron sus testimonios sobre la primer simulación del examen de admisión. Cada uno de ellos destacó cómo la simulación les permitió comprender mejor el formato del examen, mejorar sus tiempos de respuesta y reforzar sus conocimientos clave. Más allá de la preparación académica, los testimonios reflejaron cómo el curso contribuyó a aumentar su confianza y reducir el estrés, preparándolos de manera efectiva para afrontar el desafío real.
                    </p>
                </div>
                <div>
                    <h1 className='font-bold text-2xl'>Objetivos:</h1>
                    <ul className="space-y-2 gap-1 flex flex-col py-3 text-lg">
                        <li className="flex items-center">
                            <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                            Generar confianza en padres y alumnos sobre la calidad del curso.
                        </li>
                        <li className="flex items-center">
                            <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                            Ayudar a decidir qué carrera o programa estudiar, si aún tienes dudas.
                        </li>
                        <li className="flex items-center">
                            <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                            Mostrar a la universidad que tienes la capacidad y la disciplina para tener éxito en estudios superiores.
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
                        <p className="text-md">29 de febrero del 2023</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Segundo} className='w-8' />
                        <p className="text-md">Dirigido a: estudiantes y padres de familia</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Tercero} className='w-6' />
                        <p className="text-md">San Juan Bautista Tuxtepec, Oaxaca.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Cuarto} className='w-6' />
                        <p className="text-md">Instalaciones de: MQerKAcademy</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Quinto} className='w-6' />
                        <p className="text-md">7 asistentes</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Sexto} className='w-6' />
                        <p className="text-md">4 Minutos</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Septimo} className='w-6' />
                        <p className="text-md">No aplica</p>
                    </div>
                </div>
            </div>

      </div>
        <Footer />
    </div>
  )
}

export default Online