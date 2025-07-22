import Navbar from "../../components/NavLogin.jsx";

export function Bienvenida() {
  return (
    <div>
        <Navbar />
        <div className="flex flex-col py-10 justify-center items-center overflow-hidden">

                <div className="flex flex-col items-center w-fit gap-10 p-5">
                    <h2 className="text-3xl font-semibold text-center text-gray-900">¡Bienvenido(a) MARIANA RODRIGUEZ PEREZ a MQerKAcademy!</h2>
                    
                    <p className='flex px-0 lg:px-15 xl:px-20 2xl:px-30 text-justify'>Estamos muy emocionados de contar contigo como parte de nuestro proceso de selección. Tu talento y experiencia son clave para seguir construyendo una academia disruptiva y que prepare a los estudiantes para enfrentar los retos del futuro.</p>
                    <div className='flex flex-col px-2 sm:px-5 items-center text-justify w-fit border-4 border-[#3818c3] gap-8 p-3'>
                        <p className='text-justify'>Una vez culminado la entrevista en Recursos Humanos, ahora necesitamos que completes algunos pasos importantes:</p>
                            <ol className='list-decimal px-2 sm:px-5 list-inside flex flex-col gap-4 font-semibold'>
                                <li><strong>Test psicológicos y pruebas académicas:</strong> Estos nos ayudarán a conocer más sobre tus habilidades, conocimientos y áreas de especialidad.</li>
                                <li><strong> Una vez hayas acreditados los test y pruebas, podrás subir tus documentos:</strong> Por favor, asegúrate de cargar los documentos requeridos en el formato indicado para agilizar tu proceso de contratación.</li>
                            </ol>
                        <p className='text-center px-2 sm:px-5'>En MQerKAcademy valoramos el compromiso, la pasión por la educación y la creatividad para transformar vidas. Estamos seguros de que juntos lograremos grandes cosas.</p>
                        <p className={`px-2 sm:px-5`}>
                        Si tienes alguna pregunta o necesitas apoyo, no dudes en <a>comunicarte</a> con nuestro equipo ya sea via <a target="_blank" className="underline text-blue-700 active:text-blue-900 cursor-pointer" href="tel:+522871515760">telefónica</a> o por nuestro <a target="_blank" className="underline text-green-600 active:text-green-800 cursor-pointer" href="https://api.whatsapp.com/send?phone=522871515760">WhatsApp</a>.
                        </p>

                        <div className="px-2 sm:px-5">
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