import React from 'react'
import Navbar from "../../components/NavLogin.jsx";

export function Bienvenida() {
  return (
    <div>
        <Navbar />
        <div className="flex flex-col py-10 justify-center items-center overflow-hidden">
                {/* <!-- Tarjeta para móviles --> */}
                <div className="p-8 rounded-3xl md:hidden mb-5">
                <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">¡Bienvenido(a) MARIANA RODRIGUEZ PEREZ a MQerKAcademy!</h2>
                <p className='text-justify mb-10'>Estamos muy emocionados de contar contigo como parte de nuestro proceso de selección. Tu talento y experiencia son clave para seguir construyendo una academia disruptiva y que prepare a los estudiantes para enfrentar los retos del futuro.</p>
                    <div className='border-4 border-[#3818c3]'>
                        <p className='text-justify mt-5 ml-3 mr-3 mb-6'>Una vez culminado la entrevista en Recursos Humanos, ahora necesitamos que completes algunos pasos importantes:</p>
                        <p className='text-justify ml-3 mr-3 mb-6'>1. Test psicológicos y pruebas académicas: Estos nos ayudarán a conocer más sobre tus habilidades, conocimientos y áreas de especialidad.</p>
                        <p className='text-justify ml-3 mr-3 mb-6'>2. Una vez hayas acreditados los test y pruebas,podrás subir tus documentos: Por favor, asegúrate de cargar los documentos requeridos en el formato indicado para agilizar tu proceso de contratación.</p>
                        <p className='text-justify ml-3 mr-3'>En MQerKAcademy valoramos el compromiso, la pasión por la educación y la creatividad para transformar vidas. Estamos seguros de que juntos lograremos grandes cosas.</p>
                        <p className='text-justify ml-3 mr-3'>Si tienes alguna pregunta o necesitas apoyo, no dudes en comunicarte con nuestro equipo.</p>
                        <p className='text-justify ml-3 mr-3 mb-6'>¡Mucho éxito y bienvenido(a) a esta nueva etapa!</p>
                        <p className='text-center mb-10 font-bold'>El equipo de MQerKAcademy</p>
                    </div>
                    <div className='flex justify-center'>
                        <button type="submit" className="font-bold text-2xl w-40 py-3 mt-5.5 bg-blue-500 text-white rounded-xl hover:bg-blue-700 transition duration-300">
                            Iniciar
                        </button>
                    </div>
                </div>
              
                {/* <!-- Tarjeta para computadoras --> */}
                <div className="hidden md:flex flex-col items-center w-fit gap-10 p-5">
                    <h2 className="text-3xl font-semibold text-center text-gray-900">¡Bienvenido(a) MARIANA RODRIGUEZ PEREZ a MQerKAcademy!</h2>
                    <div className='w-[85.65%]'>
                    <p className='flex text-center'>Estamos muy emocionados de contar contigo como parte de nuestro proceso de selección. Tu talento y experiencia son clave para seguir construyendo una academia disruptiva y que prepare a los estudiantes para enfrentar los retos del futuro.</p>
                    </div>
                    <div className='flex flex-col items-center text-justify w-fit border-4 border-[#3818c3] gap-8 p-3'>
                        <p className='text-center'>Una vez culminado la entrevista en Recursos Humanos, ahora necesitamos que completes algunos pasos importantes:</p>
                            <ol className='list-decimal list-inside flex flex-col gap-4 font-semibold'>
                                <li><strong>Test psicológicos y pruebas académicas:</strong> Estos nos ayudarán a conocer más sobre tus habilidades, conocimientos y áreas de especialidad.</li>
                                <li><strong> Una vez hayas acreditados los test y pruebas, podrás subir tus documentos:</strong> Por favor, asegúrate de cargar los documentos requeridos en el formato indicado para agilizar tu proceso de contratación.</li>
                            </ol>
                        <p className='text-center'>En MQerKAcademy valoramos el compromiso, la pasión por la educación y la creatividad para transformar vidas. Estamos seguros de que juntos lograremos grandes cosas.</p>
                        <p>
                        Si tienes alguna pregunta o necesitas apoyo, no dudes en comunicarte con nuestro equipo.
                        </p>

                        <div>
                        <p>
                        ¡Mucho éxito y bienvenido(a) a esta nueva etapa!
                        </p>
                        <p className='text-center font-bold'>El equipo de MQerKAcademy</p>
                        </div>
                    </div>
                    <div className='flex justify-center'>
                        <button type="submit" className="cursor-pointer font-bold text-2xl w-40 h-13 bg-blue-500 text-white rounded-xl hover:bg-blue-700 transition duration-300">
                            Iniciar
                        </button>
                    </div>
                </div>
        </div>
    </div>
  )
}