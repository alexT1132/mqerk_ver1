import { useState, useEffect } from "react";
import Navbar from "../../../components/mqerk/Navbar";
import Uno from "../../../assets/mqerk/preview/curso1/3.png";
import Dos from "../../../assets/mqerk/preview/curso1/4.png";
import Tres from "../../../assets/mqerk/preview/curso1/15.png";
import Cuatro from "../../../assets/mqerk/preview/curso1/14.png";
import Cinco from "../../../assets/mqerk/preview/curso1/13.png";
import Seis from "../../../assets/mqerk/preview/curso1/12.png";
import Video from "../../../assets/mqerk/preview/curso1/eeau.mp4";
import Asesor from "../../../assets/mqerk/Asesores/5.png";
import { FaQuoteLeft, FaQuoteRight, FaStar } from "react-icons/fa";
import { FaTrophy, FaCertificate, FaUsers, FaBookOpen } from "react-icons/fa";
import { CiHeart } from "react-icons/ci";
import { FaHeart } from "react-icons/fa";
import { FaShareAlt } from "react-icons/fa";
import { SlOptions } from "react-icons/sl";
import { Link } from "react-router-dom";
import Icono6 from "../../../assets/mqerk/preview/curso1/5.png";
import Footer from "../../../components/footer";

function Eeau() {

    const [mensaje, setMensaje] = useState("1");
    const [planes, setPlanes] = useState(false);
    const [tipoPlan, setTipoPlan] = useState('');

    const handleClick = (texto) => {
        setMensaje(texto);
    };

    const curso = 'EEAP';

    localStorage.setItem('roles', JSON.stringify({ role: 'estudiante' }));

    const habilidades = [
    "Dominar los fundamentos teóricos que necesitas, sin vueltas innecesarias.",
    "Afina tu capacidad para analizar, sintetizar y transformar información en conocimiento útil.",
    "Poner manos a la obra con habilidades técnicas aplicadas al mundo real.",
    "Resolver problemas como todo un estratega, no como un adivinador de opciones múltiples.",
    "Activar tu creatividad para encontrar soluciones diferentes y funcionales.",
    "Evaluar con criterio, no solo con memoria: sabrás cuándo, cómo y por qué usar lo que sabes.",
    ];

    const areas = [
    "Habilidades creativas",
    "Habilidades cognitivas",
    "Habilidades lógicas",
    "Español y comprensión lectora",
    "Redacción indirecta",
    "Pensamiento analítico"
  ];

  const areas2 = [
    "Matemáticas",
    "Ciencias exactas",
    "Módulos específicos",
    "Psicoeducación",
    "Inglés"
  ];

    const [liked, setLiked] = useState(false);

  // Leer el estado guardado al cargar
  useEffect(() => {
    const savedLiked = localStorage.getItem("heartLiked");
    if (savedLiked) setLiked(savedLiked === "true");
  }, []);

  // Guardar el estado cuando cambie
  useEffect(() => {
    localStorage.setItem("heartLiked", liked);
  }, [liked]);

  const toggleLike = () => {
    setLiked(!liked);
  };

  return (
    <>
        <Navbar />
        {/* MOVIL */}
        <div className="block md:hidden">
            Movile
        </div>
        {/* DESKTOP */}
        <div className="hidden md:block">
            <div className="w-full">
                <div className="preview_fondo h-180">
                    <div className="relative top-[20%] left-[43%] transform -translate-x-1/2 -translate-y-1/2 w-200">
                        <div className="flex justify-start items-center gap-2">
                            <img src={Uno} className="w-8" />
                            <p className="text-white text-[20px]">Despierta todo tu potencial.</p>
                        </div>
                        <div className="font-bold text-[50px] text-white">
                            <p>Entrenamiento para el Examen de</p>
                            <p>Admisión a la Preparatoria</p>
                        </div>
                        <div onClick={() => setPlanes(true)} className="bg-white w-40 text-center mt-5 text-[#3a14a9] font-bold text-[25px] py-2 rounded-[10px] cursor-pointer">Empieza ya</div>
                    </div>
                    <div className="relative top-[27%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                        <h1 className="text-[#3a14a9] font-bold text-5xl">Información del curso</h1>
                    </div>
                    <div className="relative w-185 top-[31%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-wrap justify-center gap-4">
                        {/* <!-- Tarjeta 1 --> */}
                        <div className="w-33 border border-[#3a14a9] text-[#3a14a9] rounded-lg bg-white shadow-md flex items-center justify-center">
                            <div className="flex justify-center items-center gap-2 py-1">
                                <img src={Dos} className="w-6" />
                                <p>Presencial</p>
                            </div>
                        </div>

                        {/* <!-- Tarjeta 2 --> */}
                        <div className="w-33 border border-[#3a14a9] text-[#3a14a9] rounded-lg bg-white shadow-md flex items-center justify-center">
                            <div className="flex justify-center items-center gap-2 py-1">
                                <img src={Tres} className="w-6" />
                                <p>+ 130 clases</p>
                            </div>
                        </div>

                        {/* <!-- Tarjeta 3 --> */}
                        <div className="w-33 border border-[#3a14a9] text-[#3a14a9] rounded-lg bg-white shadow-md flex items-center justify-center">
                            <div className="flex justify-center items-center gap-2 py-1">
                                <img src={Cuatro} className="w-6" />
                                <p>2 h al día</p>
                            </div>
                        </div>

                        {/* <!-- Tarjeta 4 --> */}
                        <div className="w-33 border border-[#3a14a9] text-[#3a14a9] rounded-lg bg-white shadow-md flex items-center justify-center">
                            <div className="flex justify-center items-center gap-2 py-1">
                                <img src={Cinco} className="w-6" />
                                <p>8 meses</p>
                            </div>
                        </div>

                        {/* <!-- Tarjeta 5 --> */}
                        <div className="w-33 border border-[#3a14a9] text-[#3a14a9] rounded-lg bg-white shadow-md flex items-center justify-center">
                            <div className="flex justify-center items-center gap-2 py-1">
                                <img src={Seis} className="w-6" />
                                <p>Rendimiento</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative top-[25rem] left-[50%] transform -translate-x-1/2 -translate-y-1/2 max-w-7xl p-4 flex gap-6 items-start">
                    {/* VIDEO Y ASESOR */}
                    <div className="bg-white rounded-lg w-[70%] shadow overflow-hidden">
                        <div className="aspect-video">
                        <iframe
                            className="w-full h-full"
                            src={Video}
                            title="Video del curso"
                            allowFullScreen
                        ></iframe>
                        </div>
                        <div className="flex justify-between items-center p-4 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                            <img src={Asesor} className="w-8 h-8 bg-gray-300 rounded-full" />
                            <div>
                                <p className="font-medium text-gray-900">Kelvin Ramírez</p>
                                <p className="text-gray-500 text-xs">Asesor CienyTec</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                className="flex items-center gap-2 p-2 rounded-lg hover:scale-110 transition-transform"
                                onClick={toggleLike}
                                >
                                <FaHeart
                                    className={`text-2xl transition-colors duration-300 ${
                                    liked ? "text-purple-500" : "text-gray-400"
                                    }`}
                                />
                                <span className="text-lg font-semibold">{liked ? 1 : 0}</span>
                            </button>
                            <span className="text-[#3a14a9] flex justify-center gap-2 font-semibold">
                                <FaShareAlt className="text-[20px]" />
                                Compartir
                            </span>
                            <span className="text-[#3a14a9] flex justify-center gap-2 font-semibold">
                                <SlOptions className="text-[20px]" />
                            </span>
                        </div>
                        </div>
                        <div className="max-w-full py-4 flex justify-center items-center">
                            {/* Botones */}
                            <div className="flex flex-wrap gap-3">
                                <button
                                onClick={() => handleClick("1")}
                                className="bg-[#3a14a9] text-white font-semibold px-4 py-2 rounded w-45"
                                >
                                Descripción
                                </button>

                                <button
                                onClick={() => handleClick("2")}
                                className="bg-[#3a14a9] text-white font-semibold px-4 py-2 rounded w-45"
                                >
                                Aprenderás a
                                </button>

                                <button
                                onClick={() => handleClick("3")}
                                className="bg-[#3a14a9] text-white font-semibold px-4 py-2 rounded w-45"
                                >
                                Áreas de enseñanza
                                </button>
                            </div>
                            </div>
                            {/* Mensaje */}
                            {mensaje === '1' && (
                                <div className="p-3 rounded text-md">
                                    <p className="text-justify">
                                        Prepárate para tu examen de admisión con un curso diferente: olvida la memorización y enfócate en entender, aplicar y destacar. Con el método MQ+Disruptivo, recibirás acompañamiento personalizado, herramientas digitales, simuladores y estrategias que activan tu mente y refuerzan tu seguridad. Este no es un curso más: es una guía integral para ingresar a las mejores universidades pensando, resolviendo y avanzando con propósito.
                                    </p>
                                </div>
                            )}
                            {mensaje === '2' && (
                                <div className="max-w-4xl mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {habilidades.map((texto, index) => (
                                        <div key={index} className="flex items-start gap-2">
                                            <img src={Icono6} className="text-indigo-600 w-6 mt-1" />
                                            <p className="text-gray-700 text-sm">{texto}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {mensaje === '3' && (
                                <div className="flex justify-center">
                                    <div className="max-w-full p-4">
                                        <div className="gap-y-2 list-decimal list-inside text-gray-700 text-md">
                                            {areas.map((area, index) => (
                                            <div key={index}>{index + 1} {area}</div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="max-w-full p-4">
                                        <div className="gap-y-2 list-decimal list-inside text-gray-700 text-md">
                                            {areas2.map((area, index) => (
                                            <div key={index}>{index + 7} {area}</div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="max-w-4xl mx-auto p-4 space-y-6">
                                {/* Encabezado */}
                                {/* <div className="flex items-center justify-center gap-4">
                                    <div className="flex items-center gap-2">
                                    <FaQuoteLeft className="text-purple-700" />
                                    <span className="font-semibold text-purple-700">Opiniones del curso</span>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700">15 opiniones</span>
                                    <div className="flex items-center gap-1 text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar key={i} className="h-4 w-4" />
                                    ))}
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700">4.5</span>
                                </div> */}


                                {/* Comentario ejemplo */}
                                {/* <div className="relative border-t-2 border-b-2 border-black py-6 px-4">
                                    <FaQuoteLeft className="absolute -top-3 left-0 text-black text-2xl" />
                                    <div className="flex items-center gap-3 mb-2">
                                    <img
                                        src="https://i.pravatar.cc/40?img=12"
                                        alt="usuario"
                                        className="w-10 h-10 rounded-full"
                                    />
                                    <div>
                                        <p className="font-semibold text-sm text-purple-700">Ramon Espiridion</p>
                                        <div className="flex text-yellow-400 mt-1">
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar key={i} className="h-3 w-3" />
                                        ))}
                                        </div>
                                    </div>
                                    </div>
                                    <p className="text-sm text-gray-700">Curso muy interactivo en su formato presencial, gracias!</p>
                                    <FaQuoteRight className="absolute -bottom-3 right-0 text-black text-2xl" />
                                </div> */}
                            </div>
                    </div>

                    {/* INFORMACIÓN DEL CURSO */}
                    <div>
                        <div className="bg-white rounded-xl border-3 border-gray-400 p-6 space-y-4">
                        <div>
                        <p className="text-lg text-[#3a14a9]">Mensual</p>
                        <div className="flex justify-between">
                            <div className="flex items-center gap-2">
                                <p className="text-2xl font-bold text-gray-900">$1,500 MXN</p>
                                <span className="line-through text-gray-400">$2,000</span>
                            </div>
                            <span className="text-white text-lg bg-[#3a14a9] px-2 py-1 rounded-lg">-25%</span>
                        </div>
                        </div>

                        <div>
                        <h4 className="font-semibold text-[#3a14a9] mb-2">El curso incluye:</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            <li>Guías digitales con ejercicios tipo examen de admisión</li>
                            <li>Libros electrónicos en formato PDF</li>
                            <li>Simuladores en línea</li>
                            <li>Conferencias gratuitas con expertos</li>
                            <li>Acceso a nuestra plataforma educativa</li>
                            <li>Orientación psicoeducativa para mejorar tu rendimiento</li>
                        </ul>
                        </div>

                        <button onClick={() => setPlanes(true)} className="w-full bg-[#3a14a9] text-white text-sm py-3 rounded font-semibold hover:bg-purple-700 transition">
                        Ver más planes
                        </button>
                    </div>
                    <div className="max-w-md bg-white rounded-xl border-3 border-gray-400 p-6 space-y-4 mt-2">
                    {/* Encabezado de valoración */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                        <FaTrophy className="text-yellow-500 text-4xl" />
                        <div>
                            <p className="text-xl font-bold text-[#3a14a9]">Valoración</p>
                            <p className="text-xs text-gray-500">430 estudiantes</p>
                        </div>
                        </div>
                        <div className="text-right">
                        <p className="text-sm font-semibold text-gray-700">4.5</p>
                        <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                                <FaStar key={i} className="h-4 w-4" />
                            ))}
                        </div>
                        <p className="text-xs text-purple-700 font-semibold">15 opiniones</p>
                        </div>
                    </div>
                    </div>

                    <div className="max-w-md bg-white rounded-xl border-3 border-gray-400 p-6 space-y-4 mt-2">

                    {/* Editor */}
                    <div>
                        <p className="text-sm font-bold text-[#3a14a9] mb-2">Editor</p>
                        <div className="flex items-center gap-3">
                        <img
                            src={Asesor}
                            alt="Kelvin"
                            className="w-10 h-10 rounded-full"
                        />
                        <div>
                            <p className="text-sm font-semibold text-[#3a14a9]">Kelvin Ramírez</p>
                            <p className="text-xs text-gray-500">Asesor CienyTec</p>
                        </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-3">
                        Hola, soy Kelvin Ramírez, químico y educador con enfoque disruptivo. Me especializo en la enseñanza de ciencias exactas, en el desarrollo de habilidades cognitivas y creativas en jóvenes.
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="text-sm text-gray-600 space-y-2">
                        <p className="flex items-center gap-2">
                        <FaStar className="text-yellow-500" /> 4.6 evaluación del instructor
                        </p>
                        <p className="flex items-center gap-2">
                        <FaCertificate className="text-gray-500" /> +20 reconocimientos
                        </p>
                        <p className="flex items-center gap-2">
                        <FaUsers className="text-gray-500" /> 1230 estudiantes
                        </p>
                        <p className="flex items-center gap-2">
                        <FaBookOpen className="text-gray-500" /> 20 cursos
                        </p>
                    </div>
                    </div>
                    </div>
                </div>
                {/* Modal */}
                    {planes && (
                        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                        <div className="bg-[#3c24ba] text-white w-full max-w-5xl rounded-lg px-4 py-6 relative space-y-4 overflow-y-auto max-h-[120vh]">
                            {/* Cerrar */}
                            <button
                            onClick={() => setPlanes(false)}
                            className="absolute top-4 right-4 text-white text-2xl font-bold cursor-pointer"
                            >
                            &times;
                            </button>

                            {/* Encabezado */}
                            <div className="flex justify-center">
                                <div className="header-plan w-170 py-15 text-center">
                                    <h2 className="text-4xl font-bold ml-20">ELIGE UN PLAN A</h2>
                                    <h2 className="text-4xl font-bold ml-20 mb-5">TU MEDIDA</h2>
                                </div>
                            </div>

                            {/* Planes */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                                {/* Mensual */}
                                <div className="bg-white/10 border-2 border-white/20 rounded-xl p-6 text-sm flex flex-col justify-between">
                                <div className="absolute top-[29%] left-[12%] py-2 rounded-2xl bg-gradient-to-br from-[#440c83] to-[#3c24ba] text-center text-xl font-bold w-30">Mensual</div>
                                    <div>
                                    <p className="text-center text-2xl mt-2 font-bold">Pago mes a mes durante los 8 meses</p>
                                    <ul className="mt-4 space-y-2 list-disc list-inside text-white text-sm">
                                        <li>Acceso a nuestra plataforma educativa</li>
                                        <li>Guías digitales con ejercicios tipo examen</li>
                                        <li>Libros electrónicos en PDF por materia</li>
                                        <li>Simuladores en línea</li>
                                    </ul>
                                    </div>
                                    <div className="text-center mt-6">
                                    <p className="text-2xl font-bold mb-4">$1,500</p>
                                    <Link 
                                    to='/registro_alumno'
                                    onClick={() => {
                                        localStorage.setItem(
                                            'datos',
                                            JSON.stringify({ curso, planMensual: 'Mensual' })
                                        );
                                    }} 
                                    className="mt-2 bg-white text-purple-700 font-bold px-5 py-2 rounded-lg cursor-pointer">
                                        ADQUIRIR
                                    </Link>
                                    </div>
                                </div>

                                {/* Start (más grande) */}
                                <div className="bg-white/10 rounded-xl p-8 shadow-xl transform scale-110 text-base flex flex-col justify-between border-4 border-white">
                                    <div className="absolute top-[-7%] left-[30%] py-3 rounded-2xl bg-gradient-to-br from-[#440c83] to-[#3c24ba] text-center text-xl font-bold w-33">Start</div>
                                    <div>
                                    <p className="text-center mt-2 leading-tight font-bold text-xl">
                                        Pago en 2 exhibiciones <br /> (inicio y mitad del curso)
                                    </p>
                                    <ul className="mt-4 space-y-2 list-disc list-inside text-white">
                                        <li>Acceso a nuestra plataforma educativa</li>
                                        <li>Guías digitales con ejercicios tipo examen</li>
                                        <li>Libros electrónicos en PDF por materia</li>
                                        <li>Simuladores en línea</li>
                                    </ul>
                                    </div>
                                    <div className="text-center mt-6">
                                    <p className="text-2xl font-bold mb-4">2 PAGOS DE $5,500</p>
                                    <Link 
                                    to='/registro_alumno'
                                    onClick={() => {
                                        localStorage.setItem(
                                            'datos',
                                            JSON.stringify({ curso, planMensual: 'Start' })
                                        );
                                    }} 
                                    className="mt-2 bg-white text-purple-700 font-bold px-6 py-2 rounded-lg cursor-pointer">
                                        ADQUIRIR
                                    </Link>
                                    </div>
                                </div>

                                {/* Premium */}
                                <div className="bg-white/10 border-2 border-white/20 rounded-xl p-6 shadow-lg text-sm flex flex-col justify-between">
                                    <div className="absolute top-[29%] right-[12%] py-2 rounded-2xl bg-gradient-to-br from-[#440c83] to-[#3c24ba] text-center text-xl font-bold w-30">Premium</div>
                                    <div>
                                    <p className="text-center mt-2 font-bold text-2xl">Pago único con precio preferencial</p>
                                    <ul className="mt-4 space-y-2 list-disc list-inside text-white text-sm">
                                        <li>Acceso a nuestra plataforma educativa</li>
                                        <li>Guías digitales con ejercicios tipo examen</li>
                                        <li>Libros electrónicos en PDF por materia</li>
                                        <li>Simuladores en línea</li>
                                    </ul>
                                    </div>
                                    <div className="text-center mt-6">
                                    <p className="text-2xl font-bold mb-4">$10,500</p>
                                    <Link 
                                    to='/registro_alumno'
                                    onClick={() => {
                                        localStorage.setItem(
                                            'datos',
                                            JSON.stringify({ curso, planMensual: 'Premium' })
                                        );
                                    }} 
                                    className="mt-2 bg-white text-purple-700 font-bold px-6 py-2 rounded-lg cursor-pointer">
                                        ADQUIRIR
                                    </Link>
                                    </div>
                                </div>
                                </div>

                            {/* Nota */}
                            <p className="text-xs text-center text-white mt-10">
                            Nota: El proceso de pago podrá realizarse una vez finalizado el registro en el formulario de MQerkAcademy.
                            Los detalles correspondientes se encontrarán en el panel principal (dashboard) de la plataforma.
                            </p>
                        </div>
                        </div>
                    )}
            </div>
        </div>    
    </>
    )
}

export default Eeau