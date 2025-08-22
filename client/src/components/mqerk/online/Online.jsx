import Navbar from '../../../components/mqerk/Navbar'
import Uno from "../../../assets/mqerk/online/1.png";
import Dos from "../../../assets/mqerk/online/2.png";
import Tres from "../../../assets/mqerk/online/3.png";
import Cuatro from "../../../assets/mqerk/online/4.png";
import Cinco from "../../../assets/mqerk/online/5.png";
import Seis from "../../../assets/mqerk/online/6.png";
import Siete from "../../../assets/mqerk/online/7.png";
import Ocho from "../../../assets/mqerk/online/8.png";
import Nueve from "../../../assets/mqerk/online/9.png";
import Diez from "../../../assets/mqerk/online/10.png";
import { Link } from 'react-router-dom'
import Footer from "../../footer";

function Talleres() {
  return (
    <div className='min-h-screen flex flex-col'>
      <Navbar />
      {/* DESKTOP */}
      <div className='hidden md:block'>
        <h1 className='mt-10 text-center font-bold text-[#401454] text-4xl'>ONLINE</h1>
        <h1 className='mt-6 text-center text-[#401454] text-4xl font-bold'>2025</h1>

        <div className='grid grid-cols-4 px-10 gap-10 mt-8'>

          <div className='flex flex-col rounded-2xl'>
            
          </div>

          <Link to='/mqerk/online/guardianes_disruptivos' className='flex flex-col rounded-2xl hover:shadow-2xl py-3'>
            <div className="flex justify-center mb-6">
              <h1 className='font-bold text-xl text-[#401454] text-center'>Guardianes Disruptivos: cambiando el rumbo, transformando la educación</h1>
            </div>
            <img src={Uno} className='px-5' />
            <div>
              <p className='px-4 mt-2 text-justify text-lg'>
              Explorando las tendencias y la Inteligencia artificial para transformar la educación.
              </p>
            </div>
            <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
              <p>24 de enero</p>
            </div>
          </Link>

          <Link className='flex flex-col rounded-2xl hover:shadow-2xl py-3'>
            <div className="flex justify-center mb-6">
              <h1 className='font-bold text-[21px] text-[#401454] text-center'>Entrenamiento para el examen de admisión a la universidad 2025</h1>
            </div>
            <img src={Dos} className='px-5' />
            <div>
              <p className='px-4 mt-2 text-justify text-lg'>
              Regreso a clases de nuestr@s estudiantes del curso: Entrenamiento para el examen de admisión a la universidad 2025
              </p>
            </div>
            <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
              <p>04 de enero</p>
            </div>
          </Link>

          <div className='flex flex-col rounded-2xl'>
            
          </div>

        </div>

        <h1 className='mt-20 text-center text-[#401454] text-4xl font-bold'>2024</h1>

        <div className='grid grid-cols-3 px-10 gap-10 mt-8'>

          <div className='flex flex-col rounded-2xl'>
            
          </div>

          <Link className='flex flex-col rounded-2xl hover:shadow-2xl py-3'>
            <div className="flex justify-center mb-6">
              <h1 className='font-bold text-xl text-[#401454] text-center'>Apertura del curso "Acredita el examen de admisión a la universidad 2024</h1>
            </div>
            <img src={Tres} className='px-5' />
            <div>
              <p className='px-4 mt-2 text-justify text-lg'>
              iniciativa diseñada para fortalecer los conocimientos y habilidades clave requeridos en las principales evaluaciones de ingreso a nivel superior.
              </p>
            </div>
            <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
              <p>16 de julio</p>
            </div>
          </Link>

          <div className='flex flex-col rounded-2xl'>
            
          </div>

        </div>

        <h1 className='mt-20 text-center text-[#401454] text-4xl font-bold'>2023</h1>

        <div className='grid grid-cols-3 px-10 gap-10 mt-8'>

          <div className='flex flex-col rounded-2xl'>
            
          </div>

          <Link to='/mqerk/online/eeau23' className='flex flex-col rounded-2xl hover:shadow-2xl py-3'>
            <div className="flex justify-center mb-6">
              <h1 className='font-bold text-xl text-[#401454] text-center'>Se recopilaron testimonios de participantes que lograron ingresar exitosamente a distintas instituciones de educación superior.</h1>
            </div>
            <img src={Cuatro} className='px-5' />
            <div>
              <p className='px-4 mt-2 text-justify text-lg'>
              Pregunta detonante: ¿Cómo fue tu experiencia en la primer simulación del examen de admisión a la universidad?
              </p>
            </div>
            <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
              <p>23 de febrero</p>
            </div>
          </Link>

          <div className='flex flex-col rounded-2xl'>
            
          </div>

        </div>

        <h1 className='mt-6 text-center text-[#401454] text-4xl font-bold'>2022</h1>

        <div className='grid grid-cols-4 px-10 gap-10 mt-8'>

          <div className='flex flex-col rounded-2xl'>
            
          </div>

          <Link to='/mqerk/online/todas_y_todos' className='flex flex-col rounded-2xl hover:shadow-2xl py-3'>
            <div className="flex justify-center mb-6">
              <h1 className='font-bold text-xl text-[#401454] text-center'>Todas y todos por una educación disruptiva y sostenible</h1>
            </div>
            <img src={Cinco} className='px-5' />
            <div>
              <p className='px-4 mt-2 text-justify text-lg'>
              Alumnos de MQerKAcademy mostraron la participacion en realizar una actividad con el fin de aportar a la educación desde su definición- problemática y solución.
              </p>
            </div>
            <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
              <p>24 de enero</p>
            </div>
          </Link>

          <Link to='/mqerk/online/foro' className='flex flex-col rounded-2xl hover:shadow-2xl py-3'>
            <div className="flex justify-center mb-6">
              <h1 className='font-bold text-[21px] text-[#401454] text-center'>Foro: Día internacional de la educación</h1>
            </div>
            <img src={Seis} className='px-5' />
            <div>
              <p className='px-4 mt-2 text-justify text-lg'>
              M.M Kelvin Ramirez dió a conocer como la educación a logrado un giro de 180° en la nuevas formas de aprendizaje y enseñanza.
              </p>
            </div>
            <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
              <p>24 de enero</p>
            </div>
          </Link>

          <div className='flex flex-col rounded-2xl'>
            
          </div>

        </div>

        <h1 className='mt-20 text-center text-[#401454] text-4xl font-bold'>2021</h1>
        
                <div className='grid grid-cols-4 px-10 gap-10 mt-8 mb-10'>
        
                  <Link className='flex flex-col rounded-2xl hover:shadow-2xl py-3'>
                    <div className='flex justify-center items-center mb-6'>
                      <h1 className='font-bold text-xl text-center px-3 text-[#401454]'>¿Como brinque de la industria a la ciencia?</h1>
                    </div>
                    <div>
                      <img src={Siete} className='px-5' />
                    </div>
                    <div>
                      <p className='px-4 mt-2 text-justify text-lg'>
                        Dr. Edgar Krötzsch dio una platica vía zoom hacia los egresados y/o profesionales 
                      </p>
                    </div>
                    <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
                      <p>28 de marzo</p>
                    </div>
                  </Link>
        
                  <Link to='/mqerk/online/matematicas_para_un_mundo_mejor' className='flex flex-col rounded-2xl hover:shadow-2xl py-3'>
                    <div className="flex justify-center mb-6">
                      <h1 className='font-bold text-xl text-[#401454] text-center'>Matemáticas para un mundo mejor</h1>
                    </div>
                    <img src={Ocho} className='px-5' />
                    <div>
                      <p className='px-4 mt-2 text-justify text-lg'>
                        M.M Kelvin Ramirez se dirige a los espectadoras de mqerkacademiya cerca de la matematicas y como se utilizan en el mundo.
                      </p>
                    </div>
                    <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
                      <p>14 de marzo</p>
                    </div>
                  </Link>
        
                  <Link to='/mqerk/online/ciencia_en_alimentos_fermentados' className='flex flex-col rounded-2xl hover:shadow-2xl py-3'>
                    <h1 className='font-bold text-2xl text-[#401454] text-center mb-6'>Ciencia en alimentos fermentados</h1>
                    <img src={Nueve} className='px-5' />
                    <div>
                      <p className='px-4 text-justify text-lg'>
                        En compañía del Dr. en Ciencias Cirilo Nolasco Hipólito, se exploraron los procesos y beneficios de los alimentos fermentados.
                      </p>
                    </div>
                    <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
                      <p>20 de enero</p>
                    </div>
                  </Link>
        
                  <Link to='/mqerk/online/ingles_2021' className='flex flex-col rounded-2xl hover:shadow-2xl py-3'>
                    <div className="flex justify-center mb-6">
                      <h1 className='font-bold text-xl text-[#401454] text-center'>Ingles, el idioma dominio ante la entrada en vigor del T-MEC</h1>
                    </div>
                    <img src={Diez} className='px-5' />
                    <div>
                      <p className='px-4 mt-2 text-justify text-lg'>
                      El Dr. Hermes Meza expuso temas relacionados con el dominio del idioma inglés, las estrategias para su adquisición y las exigencias lingüísticas del contexto actual.
                      </p>
                    </div>
                    <div className='flex justify-end items-end w-full mt-5 font-bold px-6'>
                      <p>19 de enero</p>
                    </div>
                  </Link>
        
                </div>        
      </div>

      {/* MOVILE */}
      <div className='block md:hidden'>
      <h1 className='mt-25 text-center font-bold text-[#401454] text-4xl'>ONLINE</h1>
        <h1 className='mt-6 text-center text-[#401454] text-4xl font-bold'>2025</h1>

        <div className='grid grid-cols-1 px-10 gap-10 mt-4'>

          <Link to='/mqerk/online/guardianes_disruptivos' className='flex flex-col rounded-2xl shadow-2xl py-3'>
            <div className="flex justify-center mb-6">
              <h1 className='font-bold text-xl text-[#401454] text-center'>Guardianes Disruptivos: cambiando el rumbo, transformando la educación</h1>
            </div>
            <img src={Uno} className='px-5' />
            <div>
              <p className='px-4 mt-2 text-justify text-lg'>
              Explorando las tendencias y la Inteligencia artificial para transformar la educación.
              </p>
            </div>
            <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
              <p>24 de enero</p>
            </div>
          </Link>

          <div className='flex flex-col rounded-2xl shadow-2xl py-3'>
            <div className="flex justify-center mb-6">
              <h1 className='font-bold text-[21px] text-[#401454] text-center'>Entrenamiento para el examen de admisión a la universidad 2025</h1>
            </div>
            <img src={Dos} className='px-5' />
            <div>
              <p className='px-4 mt-2 text-justify text-lg'>
              Regreso a clases de nuestr@s estudiantes del curso: Entrenamiento para el examen de admisión a la universidad 2025
              </p>
            </div>
            <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
              <p>04 de enero</p>
            </div>
          </div>

          <div className='flex flex-col rounded-2xl'>
            
          </div>

        </div>

        <h1 className='mt-20 text-center text-[#401454] text-4xl font-bold'>2024</h1>

        <div className='grid grid-cols-1 px-10 gap-10 mt-4'>

          <div className='flex flex-col rounded-2xl shadow-2xl py-3'>
            <div className="flex justify-center mb-6">
              <h1 className='font-bold text-xl text-[#401454] text-center'>Apertura del curso "Acredita el examen de admisión a la universidad 2024</h1>
            </div>
            <img src={Tres} className='px-5' />
            <div>
              <p className='px-4 mt-2 text-justify text-lg'>
              iniciativa diseñada para fortalecer los conocimientos y habilidades clave requeridos en las principales evaluaciones de ingreso a nivel superior.
              </p>
            </div>
            <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
              <p>16 de julio</p>
            </div>
          </div>

        </div>

        <h1 className='mt-20 text-center text-[#401454] text-4xl font-bold'>2023</h1>

        <div className='grid grid-cols-1 px-10 gap-10 mt-8'>

          <Link to='/mqerk/online/eeau23' className='flex flex-col rounded-2xl shadow-2xl py-3'>
            <div className="flex justify-center mb-6">
              <h1 className='font-bold text-xl text-[#401454] text-center'>Testimonios: ACREDITA EL EXAMEN DE ADMISIÓN A LA UNIVERSIDAD 2023</h1>
            </div>
            <img src={Cuatro} className='px-5' />
            <div>
              <p className='px-4 mt-2 text-justify text-lg'>
              Pregunta detonante: ¿Cómo fue tu experiencia en la primer simulación del examen de admisión a la universidad?
              </p>
            </div>
            <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
              <p>23 de febrero</p>
            </div>
          </Link>

        </div>

        <h1 className='mt-20 text-center text-[#401454] text-4xl font-bold'>2022</h1>

        <div className='grid grid-cols-1 px-10 gap-10 mt-8'>

          <Link to='/mqerk/online/todas_y_todos' className='flex flex-col rounded-2xl shadow-2xl py-3'>
            <div className="flex justify-center mb-6">
              <h1 className='font-bold text-xl text-[#401454] text-center px-1'>Todas y todos por una educación disruptiva y sostenible</h1>
            </div>
            <img src={Cinco} className='px-5' />
            <div>
              <p className='px-4 mt-2 text-justify text-lg'>
              Alumnos de MQerKAcademy mostraron la participacion en realizar una actividad con el fin de aportar a la educación desde su definición- problemática y solución.
              </p>
            </div>
            <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
              <p>24 de enero</p>
            </div>
          </Link>

          <Link to='/mqerk/online/foro' className='flex flex-col rounded-2xl shadow-2xl py-3'>
            <div className="flex justify-center mb-6">
              <h1 className='font-bold text-[21px] text-[#401454] text-center'>Foro: Día internacional de la educación</h1>
            </div>
            <img src={Seis} className='px-5' />
            <div>
              <p className='px-4 mt-2 text-justify text-lg'>
              M.M Kelvin Ramirez dió a conocer como la educación a logrado un giro de 180° en la nuevas formas de aprendizaje y enseñanza.
              </p>
            </div>
            <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
              <p>24 de enero</p>
            </div>
          </Link>

        </div>

        <h1 className='mt-20 text-center text-[#401454] text-4xl font-bold'>2021</h1>
        
                <div className='grid grid-cols-1 px-10 gap-10 mt-8 mb-10'>
        
                  <div className='flex flex-col rounded-2xl shadow-2xl py-3'>
                    <div className='flex justify-center items-center mb-6'>
                      <h1 className='font-bold text-xl text-center px-3 text-[#401454]'>¿Como brinque de la industria a la ciencia?</h1>
                    </div>
                    <div>
                      <img src={Siete} className='px-5' />
                    </div>
                    <div>
                      <p className='px-4 mt-2 text-justify text-lg'>
                        Dr. Edgar Krötzsch dio una platica vía zoom hacia los egresados y/o profesionales 
                      </p>
                    </div>
                    <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
                      <p>28 de marzo</p>
                    </div>
                  </div>
        
                  <Link to='/mqerk/online/matematicas_para_un_mundo_mejor' className='flex flex-col rounded-2xl shadow-2xl py-3'>
                    <div className="flex justify-center mb-6">
                      <h1 className='font-bold text-xl text-[#401454] text-center'>Matemáticas para un mundo mejor</h1>
                    </div>
                    <img src={Ocho} className='px-5' />
                    <div>
                      <p className='px-4 mt-2 text-justify text-lg'>
                        M.M Kelvin Ramirez se dirige a los espectadoras de mqerkacademiya cerca de la matematicas y como se utilizan en el mundo.
                      </p>
                    </div>
                    <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
                      <p>14 de marzo</p>
                    </div>
                  </Link>
        
                  <Link to='/mqerk/online/ciencia_en_alimentos_fermentados' className='flex flex-col rounded-2xl shadow-2xl py-3'>
                    <h1 className='font-bold text-2xl text-[#401454] text-center mb-6'>Ciencia en alimentos fermentados</h1>
                    <img src={Nueve} className='px-5' />
                    <div>
                      <p className='px-4 text-justify text-lg'>
                      En compañía del Dr. en Ciencias Cirilo Nolasco Hipólito, se exploraron los procesos y beneficios de los alimentos fermentados.
                      </p>
                    </div>
                    <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
                      <p>20 de enero</p>
                    </div>
                  </Link>
        
                  <Link to='/mqerk/online/ingles_2021' className='flex flex-col rounded-2xl shadow-2xl py-3'>
                    <div className="flex justify-center mb-6">
                      <h1 className='font-bold text-xl text-[#401454] text-center'>ingles, el idioma dominio ante la entrada en vigor del T-MEC</h1>
                    </div>
                    <img src={Diez} className='px-5' />
                    <div>
                      <p className='px-4 mt-2 text-justify text-lg'>
                        El Dr. Hermes Meza expuso temas relacionados con el dominio del idioma inglés, las estrategias para su adquisición y las exigencias lingüísticas del contexto actual.
                      </p>
                    </div>
                    <div className='flex justify-end items-end w-full mt-5 font-bold px-6'>
                      <p>19 de enero</p>
                    </div>
                  </Link>
        
              </div> 
      </div>
        <Footer />
    </div>
  )
}

export default Talleres