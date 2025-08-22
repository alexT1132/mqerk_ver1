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
import { Link } from 'react-router-dom';
import Ocho from "../../../assets/mqerk/online/2.png";
import Nueve from "../../../assets/mqerk/online/3.png";
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
        <h1 className='text-center mt-10 font-bold text-2xl text-[#401454]'>Guardianes Disruptivos</h1>

        <div className="flex justify-center items-center mt-10">
            <div className="w-full max-w-3xl aspect-video">
                <ReactPlayer
                    url="https://www.youtube.com/watch?v=sGMTVHWB6do"
                    playing
                    muted
                    width="100%"
                    height="100%"
                    controls
                />
            </div>
        </div>

        <div className='flex w-full px-8 mt-20 gap-8 mb-6'>
            <div className='flex flex-col w-[60%] gap-10'>
                <div>
                    <h1 className='font-bold text-2xl'>Resumen</h1>
                    <p className='text-justify text-lg'>
                    Transformando la educación con IA. Kelvin Ramírez, CEO de MQerKAcademy, junto al Lic. Daniel Campillo, invitado especial, lideraron una conversación sobre las tendencias emergentes en inteligencia artificial y su potencial para revolucionar la educación. En una sesión cargada de ideas innovadoras, se exploraron cómo las herramientas de IA pueden transformar tanto el proceso de enseñanza como la experiencia de aprendizaje, abordando el futuro de la educación en un mundo digitalizado y cada vez más conectado.
                    </p>
                </div>
                <div>
                    <h1 className='font-bold text-2xl'>Objetivos:</h1>
                    <ul className="space-y-2 gap-1 flex flex-col py-5 text-lg">
                        <li className="flex items-center">
                            <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                            Informar sobre las principales tecnologías de IA utilizadas actualmente en entornos educativos.
                        </li>
                        <li className="flex items-center">
                            <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                            Reflexionar sobre los desafíos éticos y sociales asociados al uso de IA en la educación.
                        </li>
                        <li className="flex items-center">
                            <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                            Proponer estrategias prácticas para integrar herramientas de IA en instituciones educativas de manera efectiva y responsable.
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
                        <p className="text-md">24 de Enero del 2025</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Segundo} className='w-8' />
                        <p className="text-md">Dirigido a: publico en general</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Tercero} className='w-6' />
                        <p className="text-md">San Juan Bautista Tuxtepec, Oaxaca.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Cuarto} className='w-6' />
                        <p className="text-md">Instalaciones: MQerKAcademy</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Quinto} className='w-6' />
                        <p className="text-md">950 asistentes</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Sexto} className='w-6' />
                        <p className="text-md">1.5 horas</p>
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
        <h1 className='text-center mt-25 font-bold text-2xl text-[#401454]'>Guardianes Disruptivos</h1>

            <div className="flex justify-center items-center mt-10">
                <div className="w-full max-w-3xl aspect-video flex justify-center items-center">
                    <ReactPlayer
                    url="https://www.youtube.com/watch?v=sGMTVHWB6do"
                    playing
                    muted
                    controls
                    width="90%"
                    height="100%"
                    className="rounded-2xl shadow-lg"
                    />
                </div>
            </div>

            <div className='flex flex-col w-full gap-10 px-6 mt-10'>
                <div>
                    <h1 className='font-bold text-2xl'>Resumen</h1>
                    <p className='text-justify text-lg'>
                    Transformando la educación con IA. Kelvin Ramírez, CEO de MQerKAcademy, junto al Lic.  Daniel Campillo, invitado especial, lideraron una conversación sobre las tendencias emergentes en inteligencia artificial y su potencial para revolucionar la educación. En una sesión cargada de ideas innovadoras, se exploraron cómo las herramientas de IA pueden transformar tanto el proceso de enseñanza como la experiencia de aprendizaje, abordando el futuro de la educación en un mundo digitalizado y cada vez más conectado.
                    </p>
                </div>
                <div>
                    <h1 className='font-bold text-2xl'>Objetivos:</h1>
                    <ul className="space-y-2 gap-1 flex flex-col py-3 text-lg">
                        <li className="flex items-center">
                            <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                            Informar sobre las principales tecnologías de IA utilizadas actualmente en entornos educativos.
                        </li>
                        <li className="flex items-center">
                            <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                            Reflexionar sobre los desafíos éticos y sociales asociados al uso de IA en la educación.
                        </li>
                        <li className="flex items-center">
                            <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                            Proponer estrategias prácticas para integrar herramientas de IA en instituciones educativas de manera efectiva y responsable.
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
                        <p className="text-md">24 de Enero del 2025</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Segundo} className='w-8' />
                        <p className="text-md">Dirigido a: publico en general</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Tercero} className='w-6' />
                        <p className="text-md">San Juan Bautista Tuxtepec, Oaxaca.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Cuarto} className='w-6' />
                        <p className="text-md">Instalaciones: MQerKAcademy</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Quinto} className='w-6' />
                        <p className="text-md">950 asistentes</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Sexto} className='w-6' />
                        <p className="text-md">1.5 horas</p>
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