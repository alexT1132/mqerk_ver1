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
        <h1 className='text-center mt-10 font-bold text-2xl text-[#401454]'>Foro: Día internacional de la educación</h1>

        <div className="flex justify-center items-center mt-10">
            <div className="w-full max-w-3xl aspect-video">
                <ReactPlayer
                url="https://youtu.be/JyIawPyqg_Q"
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
                    Celebrando el Día Internacional de la Educación: Un foro para repensar el futuro de la enseñanza y el aprendizaje
                    En el marco del Día Internacional de la Educación, se llevó a cabo un foro revolucionario que reunió a expertos clave para discutir la transformación educativa. Este evento contó con la participación de la Directora del CBTis 107, Bertha Elena López Bernabé, el Presidente Nacional de Filosofía DGETI, Abel Iturbe Enríquez, y el Director de MQerKAcademy, Kelvin Valentín Gómez Ramírez.
                    El objetivo de este foro fue exponer cómo la educación ha dado un giro de 180°, adaptándose a las nuevas formas de aprendizaje y enseñanza, y cómo estas transformaciones son esenciales para enfrentar los desafíos del siglo XXI.
                    Durante el evento, se debatieron enfoques disruptivos que están marcando la diferencia en las aulas, desde metodologías más inclusivas y personalizadas, hasta el uso de tecnologías innovadoras que promueven una enseñanza más interactiva y colaborativa. Además, se compartieron experiencias sobre cómo romper con los esquemas tradicionales para crear espacios educativos que fomenten el pensamiento crítico, la creatividad y la adaptabilidad de los estudiantes.
                    Este foro no solo celebró los avances alcanzados, sino que también subrayó la importancia de continuar innovando para garantizar una educación accesible, inclusiva y de calidad para todos.
                   </p>
                </div>
                <div>
                    <h1 className='font-bold text-2xl'>Objetivos:</h1>
                    <ul className="space-y-2 gap-1 flex flex-col py-5 text-lg">
                        <li className="flex items-center">
                            <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                            Conmemorar el Día Internacional de la Educación y reconocer su impacto en el desarrollo de las personas y las sociedades.
                        </li>
                        <li className="flex items-center">
                            <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                            Fomentar el diálogo y la reflexión sobre los principales desafíos que enfrenta la educación en la actualidad.
                        </li>
                        <li className="flex items-center">
                            <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                            Impulsar propuestas para lograr una educación inclusiva, equitativa y de calidad para todos y todas.
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
                        <p className="text-md">24 de enero del 2022</p>
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
                        <p className="text-md">3.5 mil  asistentes</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Sexto} className='w-6' />
                        <p className="text-md">1:40 horas</p>
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
        <h1 className='text-center mt-25 font-bold text-2xl text-[#401454]'>Foro: Día internacional de la educación</h1>

        <div className="flex justify-center items-center mt-10">
            <div className="w-full max-w-3xl aspect-video flex justify-center items-center">
                <ReactPlayer
                url="https://youtu.be/JyIawPyqg_Q"
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
                    Celebrando el Día Internacional de la Educación: Un foro para repensar el futuro de la enseñanza y el aprendizaje
                    En el marco del Día Internacional de la Educación, se llevó a cabo un foro revolucionario que reunió a expertos clave para discutir la transformación educativa. Este evento contó con la participación de la Directora del CBTis 107, Bertha Elena López Bernabé, el Presidente Nacional de Filosofía DGETI, Abel Iturbe Enríquez, y el Director de MQerKAcademy, Kelvin Valentín Gómez Ramírez.
                    El objetivo de este foro fue exponer cómo la educación ha dado un giro de 180°, adaptándose a las nuevas formas de aprendizaje y enseñanza, y cómo estas transformaciones son esenciales para enfrentar los desafíos del siglo XXI.
                    Durante el evento, se debatieron enfoques disruptivos que están marcando la diferencia en las aulas, desde metodologías más inclusivas y personalizadas, hasta el uso de tecnologías innovadoras que promueven una enseñanza más interactiva y colaborativa. Además, se compartieron experiencias sobre cómo romper con los esquemas tradicionales para crear espacios educativos que fomenten el pensamiento crítico, la creatividad y la adaptabilidad de los estudiantes.
                    Este foro no solo celebró los avances alcanzados, sino que también subrayó la importancia de continuar innovando para garantizar una educación accesible, inclusiva y de calidad para todos.
                   </p>
                </div>
                <div>
                    <h1 className='font-bold text-2xl'>Objetivos:</h1>
                    <ul className="space-y-2 gap-1 flex flex-col py-3 text-lg">
                        <li className="flex items-center">
                            <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                            Conmemorar el Día Internacional de la Educación y reconocer su impacto en el desarrollo de las personas y las sociedades.
                        </li>
                        <li className="flex items-center">
                            <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                            Fomentar el diálogo y la reflexión sobre los principales desafíos que enfrenta la educación en la actualidad.
                        </li>
                        <li className="flex items-center">
                            <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                            Impulsar propuestas para lograr una educación inclusiva, equitativa y de calidad para todos y todas.
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
                        <p className="text-md">24 de enero del 2022</p>
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
                        <p className="text-md">3.5 mil  asistentes</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Sexto} className='w-6' />
                        <p className="text-md">1:40 horas</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={Septimo} className='w-6' />
                        <p className="text-md">No aplica</p>
                    </div>
                </div>
            </div>

      </div>

    </div>
  )
}

export default Online