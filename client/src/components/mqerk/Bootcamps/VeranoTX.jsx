import {useState, useEffect} from 'react'
import Navbar from '../../../components/mqerk/Navbar'
import Uno from "../../../assets/mqerk/Fotos Estudiantes/1.png";
import Dos from "../../../assets/mqerk/Fotos Estudiantes/bootcamp2.png";
import Tres from "../../../assets/mqerk/Fotos Estudiantes/bootcamp3.png";
import Cuatro from "../../../assets/mqerk/Fotos Estudiantes/2.png";
import Primero from "../../../assets/mqerk/veranotx/01.png";
import Segundo from "../../../assets/mqerk/veranotx/02.png";
import Tercero from "../../../assets/mqerk/veranotx/03.png";
import Cuarto from "../../../assets/mqerk/veranotx/04.png";
import Quinto from "../../../assets/mqerk/veranotx/05.png";
import Sexto from "../../../assets/mqerk/veranotx/06.png";
import Septimo from "../../../assets/mqerk/veranotx/07.png";
import { Link } from "react-router-dom";
import Footer from "../../footer";

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
        <h1 className='text-center mt-35 font-bold text-2xl text-[#401454]'>2da Edición del BootCamp de Verano Misión TX 2024: Entrénate como un Astronauta</h1>

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
                    <p className='text-justify text-xl'>
                        Los asesores de MQerKAcademy participaron en Cienytec, 
                        dentro de la 2da edición del BootCamp de verano "Misión TX 2024: 
                        Entrénate como un Astronauta", gracias a la invitación otorgada por la Lic. 
                        Ilse Mariela Nolasco López. Esta colaboración se llevó a cabo bajo el tema "Científicos del Futuro: 
                        Ciencia y Tecnología en Acción en el Espacio", promoviendo el aprendizaje STEAM en un entorno dinámico y motivador.
                    </p>
                </div>
                <div>
                    <h1 className='font-bold text-2xl'>Objetivos alcanzados:</h1>
                    <ul className="space-y-2 gap-1 flex flex-col py-5 text-xl">
                        <li className="flex items-center">
                            <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                            Diseña una base lunar
                        </li>
                        <li className="flex items-center">
                            <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                            Aprender a como se relaciona las STEAM para poder ser un astronauta.
                        </li>
                        <li className="flex items-center">
                            <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                            Dar a conocer la estructura, propósito y contenidos del BootCamp Misión TX 2024.
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
                        <p className="text-lg">19 de Agosto del 2024</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Segundo} className='w-8' />
                        <p className="text-lg">Dirigido a: estudiantes de nivel básico</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Tercero} className='w-6' />
                        <p className="text-md">San Juan Bautista Tuxtepec, Oaxaca.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Cuarto} className='w-6' />
                        <p className="text-md">Instalaciones: Esc. Sec. Gral José Vasconcelos</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Quinto} className='w-6' />
                        <p className="text-md">30 asistentes</p>
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
            
                      <Link to='/bootcamps/ecat' className='flex flex-col rounded-2xl hover:shadow-2xl py-3 cursor-pointer'>
                        <h1 className='font-bold text-xl text-[#401454] text-center mb-6'>ECAT 2024</h1>
                        <img src={Cuatro} className='px-3 h-55 rounded-2xl' />
                        <div>
                          <p className='px-4 text-justify text-lg'>
                            Participación en el Evento de ciencia, arte y tecnología 2024 5ta edición, en compañía de los alumnos de las diferentes instituciones, estudiantes de nuestra academia y a colaboradores.
                          </p>
                        </div>
                        <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
                          <p>29 de Ferbrero</p>
                        </div>
                      </Link>
            
                      <div className='flex flex-col rounded-2xl'>
                        
                      </div>
            
        </div>
      </div>

      {/* MOVILE */}
      <div className='block md:hidden'>
        <h1 className='text-center mt-24 font-bold text-2xl text-[#401454]'>2da Edición del BootCamp de Verano Misión TX 2024: Entrénate como un Astronauta</h1>

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
                        Los asesores de MQerKAcademy participaron en Cienytec, 
                        dentro de la 2da edición del BootCamp de verano "Misión TX 2024: 
                        Entrénate como un Astronauta", gracias a la invitación otorgada por la Lic. 
                        Ilse Mariela Nolasco López. Esta colaboración se llevó a cabo bajo el tema "Científicos del Futuro: 
                        Ciencia y Tecnología en Acción en el Espacio", promoviendo el aprendizaje STEAM en un entorno dinámico y motivador.
                    </p>
                </div>
                <div>
                    <h1 className='font-bold text-2xl'>Objetivos alcanzados:</h1>
                    <ul className="space-y-2 gap-1 flex flex-col py-3 text-lg">
                        <li className="flex items-center">
                            <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                            Diseña una base lunar
                        </li>
                        <li className="flex items-center">
                            <span className="w-4 h-2 bg-black rounded-full mr-3"></span>
                            Aprender a como se relaciona las STEAM para poder ser un astronauta.
                        </li>
                        <li className="flex items-center">
                            <span className="w-4 h-2 bg-black rounded-full mr-3"></span>
                            Dar a conocer la estructura, propósito y contenidos del BootCamp Misión TX 2024.
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
                        <p className="text-lg">19 de Agosto del 2024</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Segundo} className='w-8' />
                        <p className="text-lg">Dirigido a: estudiantes de nivel básico</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Tercero} className='w-6' />
                        <p className="text-md">San Juan Bautista Tuxtepec, Oaxaca.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Cuarto} className='w-6' />
                        <p className="text-md">Instalaciones: Esc. Sec. Gral José Vasconcelos</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Quinto} className='w-6' />
                        <p className="text-md">30 asistentes</p>
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
    
              <Link to='/bootcamps/ecat' className='flex flex-col rounded-2xl shadow-2xl py-3 cursor-pointer'>
                <h1 className='font-bold text-xl text-[#401454] text-center mb-6'>ECAT 2024</h1>
                <img src={Cuatro} className='px-3 h-55 rounded-2xl' />
                <div>
                  <p className='px-4 text-justify text-lg'>
                    Participación en el Evento de ciencia, arte y tecnología 2024 5ta edición, en compañía de los alumnos de las diferentes instituciones, estudiantes de nuestra academia y a colaboradores.
                  </p>
                </div>
                <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
                  <p>29 de Ferbrero</p>
                </div>
              </Link>
    
              <div className='flex flex-col rounded-2xl'>
                
              </div>
    
        </div>

      </div>
        <Footer />
    </div>
  )
}

export default Talleres