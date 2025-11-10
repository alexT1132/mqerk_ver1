import Navbar from "../../components/NavLogin.jsx";
import { useNavigate } from "react-router-dom";
import { usePreventPageReload } from "../../NoReload.jsx";
import { useAsesor } from "../../context/AsesorContext.jsx";
import { useEffect } from "react";

export function Bienvenida() {

    usePreventPageReload();

    const navigate = useNavigate();

    const { datos1, preregistroId, loadPreRegistro } = useAsesor();

    useEffect(() => {
        // Si no hay datos aún pero existe preregistroId, intentar cargar
        if(!datos1 && preregistroId){
            loadPreRegistro();
        }
        // Si no hay preregistroId ni datos, ir a preregistro
        if(!datos1 && !preregistroId){
            navigate('/pre_registro');
        }
    }, [datos1, preregistroId]);

  return (
    <div>
        <Navbar />
        <div className="flex justify-center items-center overflow-hidden">
                {/* <!-- Tarjeta para móviles --> */}
                <div className="p-8 rounded-3xl md:hidden mb-5">
                <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">¡Bienvenido(a) {datos1 ? `${datos1.nombres} ${datos1.apellidos}` : '...'} a MQerKAcademy!</h2>
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
                        <button type="submit" onClick={() => {navigate('/test')}} className="font-bold text-2xl w-40 py-3 mt-5.5 bg-blue-500 text-white rounded-xl hover:bg-blue-700 transition duration-300">
                            Iniciar
                        </button>
                    </div>
                </div>
              
                {/* <!-- Tarjeta para computadoras --> */}
                <div className="hidden md:flex p-8 d-flex w-330 flex-col">
                    <h2 className="text-3xl font-semibold text-center text-gray-900 mb-10">¡Bienvenido(a) {datos1 ? `${datos1.nombres} ${datos1.apellidos}` : '...'} a MQerKAcademy!</h2>
                    <p className='text-center mb-10'>Estamos muy emocionados de contar contigo como parte de nuestro proceso de selección. Tu talento y experiencia son clave para seguir construyendo una academia disruptiva y que prepare a los estudiantes para enfrentar los retos del futuro.</p>
                    <div className='border-4 border-[#3818c3]'>
                        <p className='text-center mt-5'>Una vez culminado la entrevista en Recursos Humanos, ahora necesitamos que completes algunos pasos importantes:</p>
                        <p className='text-start ml-5'>1. Test psicológicos y pruebas académicas: Estos nos ayudarán a conocer más sobre tus habilidades, conocimientos y áreas de especialidad.</p>
                        <p className='text-start ml-5 mb-5'>2. Una vez hayas acreditados los test y pruebas,podrás subir tus documentos: Por favor, asegúrate de cargar los documentos requeridos en el formato indicado para agilizar tu proceso de contratación.</p>
                        <p className='text-center ml-5 mr-5'>En MQerKAcademy valoramos el compromiso, la pasión por la educación y la creatividad para transformar vidas. Estamos seguros de que juntos lograremos grandes cosas.</p>
                        <p className='text-center'>Si tienes alguna pregunta o necesitas apoyo, no dudes en comunicarte con nuestro equipo.</p>
                        <p className='text-center'>¡Mucho éxito y bienvenido(a) a esta nueva etapa!</p>
                        <p className='text-center mb-10 font-bold'>El equipo de MQerKAcademy</p>
                    </div>
                    <div className='flex justify-center'>
                        <button type="submit" onClick={() => {navigate('/test')}} className="font-bold text-2xl w-40 py-3 mt-5.5 bg-blue-500 text-white rounded-xl hover:bg-blue-700 transition duration-300">
                            Iniciar
                        </button>
                    </div>
                </div>
        </div>
    </div>
  )
}