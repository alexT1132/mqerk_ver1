import React, {useState, useEffect} from 'react'
import Navbar from '../../../components/mqerk/Navbar'
import Uno from "../../../assets/mqerk/Fotos Estudiantes/16.png";
import Dos from "../../../assets/mqerk/Fotos Estudiantes/17.png";
import Tres from "../../../assets/mqerk/Fotos Estudiantes/18.png";
import Primero from "../../../assets/mqerk/veranotx/01.png";
import Segundo from "../../../assets/mqerk/veranotx/02.png";
import Tercero from "../../../assets/mqerk/veranotx/03.png";
import Cuarto from "../../../assets/mqerk/veranotx/04.png";
import Quinto from "../../../assets/mqerk/veranotx/05.png";
import Sexto from "../../../assets/mqerk/veranotx/06.png";
import Septimo from "../../../assets/mqerk/veranotx/07.png";
import { Link } from 'react-router-dom';
import Cuatro from "../../../assets/mqerk/talleres/1.png";
import Cinco from "../../../assets/mqerk/talleres/2.png";
import Seis from "../../../assets/mqerk/talleres/3.png";

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
        <h1 className='text-center mt-35 font-bold text-2xl text-[#401454]'>TecnoMate: Revolucionando las Matemáticas en el Aula con Herramientas Digitales</h1>

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
                    En MQerKAcademy seguimos transformando la educación. El taller “TecnoMate” reunió a maestras y maestros de primaria de 1° a 6° grado de la zona 118 en una jornada práctica de 5 horas, con el propósito de modernizar la enseñanza de las matemáticas a través del uso de herramientas digitales.
                    Durante este espacio formativo, los participantes aprendieron a integrar plataformas como Kahoot, GeoGebra, Google Sheets y Canva para crear actividades dinámicas, interactivas y adaptadas al contexto escolar. Además, se promovió el pensamiento crítico, científico y el análisis de datos mediante el uso de gráficas y recursos visuales.
                    El taller impulsó la creación de materiales didácticos personalizados y el uso estratégico de la tecnología para fortalecer las competencias matemáticas de los estudiantes en el aula.
                    </p>
                </div>
                <div>
                    <h1 className='font-bold text-2xl'>Objetivos:</h1>
                    <ul className="space-y-2 gap-1 flex flex-col py-5 text-lg">
                        <li className="flex items-center">
                            <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                            Incorporación de herramientas digitales en la planeación y práctica docente.
                        </li>
                        <li className="flex items-center">
                            <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                            Diseño de recursos visuales que hacen las matemáticas más accesibles.
                        </li>
                        <li className="flex items-center">
                            <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                            Aplicación de estrategias para el análisis de datos y resolución de problemas reales.
                        </li>
                        <li className="flex items-center">
                            <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                            Fomento del pensamiento lógico y científico en la educación básica.
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
                        <p className="text-md">07 de enero del 2025</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Segundo} className='w-8' />
                        <p className="text-md">Dirigido a: docentes de nivel primaria</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Tercero} className='w-6' />
                        <p className="text-md">San Juan Bautista Tuxtepec, Oaxaca.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Cuarto} className='w-6' />
                        <p className="text-md">Instalaciones: Colegio México Americano</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Quinto} className='w-6' />
                        <p className="text-md">80 asistentes</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Sexto} className='w-6' />
                        <p className="text-md">5 horas</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Septimo} className='w-6' />
                        <p className="text-md">Entrega de constancia</p>
                    </div>
                </div>
            </div>
        </div>

        <h1 className='text-center mt-35 font-bold text-2xl text-[#401454]'>Tambien puedes ver:</h1>

        <div className='grid grid-cols-4 px-10 gap-10 mt-8'>
        
                  <Link to='/talleres/ia_para_la_enseñanza' className='flex flex-col rounded-2xl hover:shadow-2xl py-3 cursor-pointer'>
                    <div className='flex justify-center mb-6'>
                      <h1 className='font-bold text-xl text-[#401454]'>IA para la enseñanza en el aula</h1>
                    </div>
                    <div>
                      <img src={Cuatro} className='px-5' />
                    </div>
                    <div>
                      <p className='px-4 mt-2 text-justify text-lg'>
                      Sesión formativa para docentes sobre inteligencia artificial en la enseñanza, promoviendo la innovación tecnológica en el aula.
                      </p>
                    </div>
                    <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
                      <p>25 de marzo</p>
                    </div>
                  </Link>
        
                  <Link to='/talleres/ia_en_la_salud' className='flex flex-col rounded-2xl hover:shadow-2xl py-3'>
                    <div className="flex justify-center mb-6">
                      <h1 className='font-bold text-xl text-[#401454] text-center'>IA en la salud</h1>
                    </div>
                    <img src={Cinco} className='px-5' />
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
                    <img src={Seis} className='px-5' />
                    <div>
                      <p className='px-4 text-justify text-lg'>
                        Ejecutivos conocieron cómo aplicar la inteligencia artificial para optimizar procesos y tomar decisiones en la Compañía Cervecera del Trópico.
                      </p>
                    </div>
                    <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
                      <p>07 de marzo</p>
                    </div>
                  </Link>
        
                </div>


      </div>

      {/* MOVILE */}
      <div className='block md:hidden'>
      <h1 className='text-center mt-35 font-bold text-2xl text-[#401454]'>TecnoMate: Revolucionando las Matemáticas en el Aula con Herramientas Digitales</h1>

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
                    En MQerKAcademy seguimos transformando la educación. El taller “TecnoMate” reunió a maestras y maestros de primaria de 1° a 6° grado de la zona 118 en una jornada práctica de 5 horas, con el propósito de modernizar la enseñanza de las matemáticas a través del uso de herramientas digitales.
                    Durante este espacio formativo, los participantes aprendieron a integrar plataformas como Kahoot, GeoGebra, Google Sheets y Canva para crear actividades dinámicas, interactivas y adaptadas al contexto escolar. Además, se promovió el pensamiento crítico, científico y el análisis de datos mediante el uso de gráficas y recursos visuales.
                    El taller impulsó la creación de materiales didácticos personalizados y el uso estratégico de la tecnología para fortalecer las competencias matemáticas de los estudiantes en el aula.
                    </p>
                </div>
                <div>
                    <h1 className='font-bold text-2xl'>Objetivos:</h1>
                    <ul className="space-y-2 gap-1 flex flex-col py-3 text-lg">
                    <li className="flex items-center">
                            <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                            Incorporación de herramientas digitales en la planeación y práctica docente.
                        </li>
                        <li className="flex items-center">
                            <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                            Diseño de recursos visuales que hacen las matemáticas más accesibles.
                        </li>
                        <li className="flex items-center">
                            <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                            Aplicación de estrategias para el análisis de datos y resolución de problemas reales.
                        </li>
                        <li className="flex items-center">
                            <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                            Fomento del pensamiento lógico y científico en la educación básica.
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
                        <p className="text-md">07 de enero del 2025</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Segundo} className='w-8' />
                        <p className="text-md">Dirigido a: docentes de nivel primaria</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Tercero} className='w-6' />
                        <p className="text-md">San Juan Bautista Tuxtepec, Oaxaca.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Cuarto} className='w-6' />
                        <p className="text-md">Instalaciones: Colegio México Americano</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Quinto} className='w-6' />
                        <p className="text-md">80 asistentes</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Sexto} className='w-6' />
                        <p className="text-md">5 horas</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Septimo} className='w-6' />
                        <p className="text-md">Entrega de constancia</p>
                    </div>
                </div>
            </div>

            <h1 className='text-center mt-35 font-bold text-2xl text-[#401454]'>Tambien puedes ver:</h1>

        <div className='grid grid-cols-1 px-10 gap-10 mt-8'>
        
                  <Link to='/talleres/ia_para_la_enseñanza' className='flex flex-col rounded-2xl hover:shadow-2xl py-3 cursor-pointer'>
                    <div className='flex justify-center mb-6'>
                      <h1 className='font-bold text-xl text-[#401454]'>IA para la enseñanza en el aula</h1>
                    </div>
                    <div>
                      <img src={Cuatro} className='px-5' />
                    </div>
                    <div>
                      <p className='px-4 mt-2 text-justify text-lg'>
                      Sesión formativa para docentes sobre inteligencia artificial en la enseñanza, promoviendo la innovación tecnológica en el aula.
                      </p>
                    </div>
                    <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
                      <p>25 de marzo</p>
                    </div>
                  </Link>
        
                  <Link to='/talleres/ia_en_la_salud' className='flex flex-col rounded-2xl hover:shadow-2xl py-3'>
                    <div className="flex justify-center mb-6">
                      <h1 className='font-bold text-xl text-[#401454] text-center'>IA en la salud</h1>
                    </div>
                    <img src={Cinco} className='px-5' />
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
                    <img src={Seis} className='px-5' />
                    <div>
                      <p className='px-4 text-justify text-lg'>
                        Ejecutivos conocieron cómo aplicar la inteligencia artificial para optimizar procesos y tomar decisiones en la Compañía Cervecera del Trópico.
                      </p>
                    </div>
                    <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
                      <p>07 de marzo</p>
                    </div>
                  </Link>
        
                </div>

      </div>

    </div>
  )
}

export default Talleres