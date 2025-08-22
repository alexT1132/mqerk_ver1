import React from 'react'
import Navbar from '../../../components/mqerk/Navbar'
import Uno from "../../../assets/mqerk/talleres/1.png";
import Dos from "../../../assets/mqerk/talleres/2.png";
import Tres from "../../../assets/mqerk/talleres/3.png";
import Cuatro from "../../../assets/mqerk/talleres/4.png";
import Cinco from "../../../assets/mqerk/talleres/5.png";
import Seis from "../../../assets/mqerk/talleres/6.png";
import Siete from "../../../assets/mqerk/talleres/7.png";
import Ocho from "../../../assets/mqerk/talleres/8.png";
import Nueve from "../../../assets/mqerk/talleres/9.png";
import Diez from "../../../assets/mqerk/talleres/10.png";
import { Link } from "react-router-dom";
import Footer from "../../footer";

function Talleres() {
  return (
    <div className='min-h-screen flex flex-col'>
      <Navbar />
      {/* DESKTOP */}
      <div className='hidden md:block'>
        <h1 className='mt-10 text-center font-bold text-[#401454] text-4xl'>TALLERES</h1>
        <h1 className='mt-6 text-center text-[#401454] text-4xl font-bold'>2025</h1>

        <div className='grid grid-cols-4 px-10 gap-10 mt-8'>

          <Link to='/talleres/ia_para_la_enseñanza' className='flex flex-col rounded-2xl hover:shadow-2xl py-3 cursor-pointer'>
            <div className='flex justify-center mb-6'>
              <h1 className='font-bold text-xl text-[#401454]'>IA para la enseñanza en el aula</h1>
            </div>
            <div>
              <img src={Uno} className='px-5' />
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
            <img src={Dos} className='px-5' />
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
            <img src={Tres} className='px-5' />
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

        <h1 className='mt-20 text-center text-[#401454] text-4xl font-bold'>2024</h1>

        <div className='grid grid-cols-3 px-10 gap-10 mt-8'>

          <Link to='/talleres/orientacion_vocacional_y_psicoeducativa' className='flex flex-col rounded-2xl hover:shadow-2xl py-3'>
            <div className='flex justify-center mb-6'>
              <h1 className='font-bold text-xl text-[#401454]'>Orientación vocacional y psicoeducativa</h1>
            </div>
            <div className='px-5'>
              <img src={Cinco} />
            </div>
            <div>
              <p className='px-4 mt-2 text-justify text-lg'>
                Un espacio formativo que permitió a los estudiantes reflexionar sobre su futuro académico y profesional.
              </p>
            </div>
            <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
              <p>21 de octubre</p>
            </div>
          </Link>

          <Link to='/talleres/orientacion_vocacional' className='flex flex-col rounded-2xl hover:shadow-2xl py-3'>
            <div className="flex justify-center mb-6">
              <h1 className='font-bold text-xl text-[#401454] text-center'>Orientación vocacional</h1>
            </div>
            <img src={Seis} className='px-5' />
            <div>
              <p className='px-4 mt-2 text-justify text-lg'>
              Actividad orientada a apoyar la toma de decisiones, a partir del reconocimiento y análisis de las propias habilidades e intereses.
              </p>
            </div>
            <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
              <p>18 de octubre</p>
            </div>
          </Link>

          <Link to='/talleres/apoyo_a_la_ciencia_y_la_tecnologia' className='flex flex-col rounded-2xl hover:shadow-2xl py-3'>
            <h1 className='font-bold text-xl text-[#401454] text-center mb-6'>Apoyo a la ciencia y tecnologia</h1>
            <img src={Siete} className='px-5' />
            <div>
              <p className='px-4 text-justify text-lg'>
              Dimos la bienvenida a jóvenes destacados en programación, reafirmando nuestro compromiso con el impulso a la tecnología y la formación educativa.
              </p>
            </div>
            <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
              <p>22 de enero</p>
            </div>
          </Link>

        </div>

        <h1 className='mt-20 text-center text-[#401454] text-4xl font-bold'>2023</h1>

        <div className='grid grid-cols-4 px-10 gap-10 mt-8'>

          <div className='flex flex-col rounded-2xl'>
            
          </div>

          <Link to='/talleres/transformar_la_educacion' className='flex flex-col rounded-2xl hover:shadow-2xl py-3'>
            <div className="flex justify-center mb-6 px-5">
              <h1 className='font-bold text-xl text-[#401454] text-center'>Cambiar el mundo, transformar la educacion</h1>
            </div>
            <img src={Ocho} className='px-3' />
            <div>
              <p className='px-4 mt-2 text-justify text-lg'>
              Conferencia otorgada exclusivamente a los alumnos y alumnas de Sto semestre del Centro de Bachillerato Tecnológico Industrial y de Servicios 107
              </p>
            </div>
            <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
              <p>06 de diciembre</p>
            </div>
          </Link>

          <Link to='/talleres/educacion_disruptiva' className='flex flex-col rounded-2xl hover:shadow-2xl py-3'>
            <h1 className='font-bold text-xl text-[#401454] text-center mb-6'>Educacion disruptiva, transformando mentes</h1>
            <img src={Nueve} className='px-3' />
            <div>
              <p className='px-4 text-justify text-lg'>
              Semana de conferencias en el CBTis 107 de Tuxtepec, se contó con la presencia de alumnos de diferentes semestre
              </p>
            </div>
            <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
              <p>2 al 14 de junio</p>
            </div>
          </Link>

          <div className='flex flex-col rounded-2xl'>
            
          </div>

        </div>

        <h1 className='mt-20 text-center text-[#401454] text-4xl font-bold'>2021</h1>

        <div className='grid grid-cols-3 px-10 gap-10 mt-8 mb-10'>

          <div className='flex flex-col rounded-2xl'>
            
          </div>

          <Link to='/talleres/tecnologia_artificial' className='flex flex-col rounded-2xl hover:shadow-2xl py-3'>
            <div className="flex justify-center mb-6">
              <h1 className='font-bold text-xl text-[#401454] text-center'>Tecnología Artificial Aplicada en la Educación</h1>
            </div>
            <img src={Diez} className='px-5' />
            <div>
              <p className='px-4 mt-2 text-justify text-lg'>
              El M.M. Kelvin Valentín Gómez Ramírez, asesor de MQerkAcademy, ofreció su primera conferencia a los alumnos del CBTis 107.
              </p>
            </div>
            <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
              <p>11 de noviembre</p>
            </div>
          </Link>

          <div className='flex flex-col rounded-2xl'>
            
          </div>

        </div>
      </div>

      {/* MOVILE */}
      <div className='block md:hidden'>
      <h1 className='mt-25 text-center font-bold text-[#401454] text-4xl'>TALLERES</h1>
        <h1 className='mt-6 text-center text-[#401454] text-4xl font-bold'>2025</h1>

        <div className='grid grid-cols-1 px-10 gap-10 mt-8'>

          <Link to='/talleres/ia_para_la_enseñanza' className='flex flex-col rounded-2xl shadow-2xl py-2'>
            <div className='flex justify-center mb-6'>
              <h1 className='font-bold text-xl text-[#401454]'>IA para la enseñanza en el aula</h1>
            </div>
            <div>
              <img src={Uno} className='px-5' />
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

          <Link to='/talleres/ia_en_la_salud' className='flex flex-col rounded-2xl shadow-2xl py-2'>
            <div className="flex justify-center mb-6">
              <h1 className='font-bold text-xl text-[#401454] text-center'>IA en la salud</h1>
            </div>
            <img src={Dos} className='px-5' />
            <div>
              <p className='px-4 mt-2 text-justify text-lg'>
                Sesión informativa para el personal del sector salud sobre inteligencia artificial aplicada a la innovación médica y la prevención de fraudes digitales.
              </p>
            </div>
            <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
              <p>18 de marzo</p>
            </div>
          </Link>

          <Link to='/talleres/ia_en_la_gestion_emp' className='flex flex-col rounded-2xl shadow-2xl py-2'>
            <h1 className='font-bold text-xl text-[#401454] text-center mb-6'>IA en la gestión  empresarial</h1>
            <img src={Tres} className='px-5' />
            <div>
              <p className='px-4 text-justify text-lg'>
                Ejecutivos conocieron cómo aplicar la inteligencia artificial para optimizar procesos y tomar decisiones en la Compañía Cervecera del Trópico.
              </p>
            </div>
            <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
              <p>07 de marzo</p>
            </div>
          </Link>

          <Link to='/talleres/tecnomate' className='flex flex-col rounded-2xl shadow-2xl py-2'>
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

        <h1 className='mt-20 text-center text-[#401454] text-4xl font-bold'>2024</h1>

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

          <Link to='/talleres/orientacion_vocacional' className='flex flex-col rounded-2xl shadow-2xl py-2'>
            <div className="flex justify-center mb-6">
              <h1 className='font-bold text-xl text-[#401454] text-center'>Orientación vocacional</h1>
            </div>
            <img src={Seis} className='px-5' />
            <div>
              <p className='px-4 mt-2 text-justify text-lg'>
                Actividad centrada en fortalecer la toma de decisiones académicas y profesionales
                 a través del reconocimiento de habilidades e intereses.
              </p>
            </div>
            <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
              <p>18 de octubre</p>
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

        <h1 className='mt-20 text-center text-[#401454] text-4xl font-bold'>2023</h1>

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

          <Link to='/talleres/educacion_disruptiva' className='flex flex-col rounded-2xl shadow-2xl py-2'>
            <h1 className='font-bold text-xl text-[#401454] text-center mb-6'>Educacion disruptiva, transformando mentes</h1>
            <img src={Nueve} className='px-3' />
            <div>
              <p className='px-4 text-justify text-lg'>
                Semana de conferencias en el CBTis 107 de Tuxtepec, se contó con la presencia de alumnos de diferentes semestre
              </p>
            </div>
            <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
              <p>2 al 14 de junio</p>
            </div>
          </Link>

        </div>

        <h1 className='mt-20 text-center text-[#401454] text-4xl font-bold'>2021</h1>

        <div className='grid grid-cols-1 px-10 gap-10 mt-8 mb-10'>

          <Link to='/talleres/tecnologia_artificial' className='flex flex-col rounded-2xl shadow-2xl py-2'>
            <div className="flex justify-center mb-6">
              <h1 className='font-bold text-xl text-[#401454] text-center'>Tecnología Artificial Aplicada en la Educación</h1>
            </div>
            <img src={Diez} className='px-5' />
            <div>
              <p className='px-4 mt-2 text-justify text-lg'>
              El M.M. Kelvin Valentín Gómez Ramírez, asesor de MQerkAcademy, ofreció su primera conferencia a los alumnos del CBTis 107.
              </p>
            </div>
            <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
              <p>11 de noviembre</p>
            </div>
          </Link>


        </div>

      </div>
      <Footer />
    </div>
  )
}

export default Talleres