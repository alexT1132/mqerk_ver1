import React, {useState, useEffect} from 'react'
import Navbar from "../../components/NavLogin.jsx";
import Veintiuno from "../../assets/21.png";
import R21_1 from "../../assets/21-R1.png";
import R21_2 from "../../assets/21-R2.png";
import R21_3 from "../../assets/21-R3.png";
import R21_4 from "../../assets/21-R4.png";
import Veintidos from "../../assets/22.png";
import R22_1 from "../../assets/22-R1.png";
import R22_2 from "../../assets/22-R2.png";
import R22_3 from "../../assets/22-R3.png";
import R22_4 from "../../assets/22-R4.png";
import Veintitres from "../../assets/23.png";
import R23_1 from "../../assets/23-R1.png";
import R23_2 from "../../assets/23-R2.png";
import R23_3 from "../../assets/23-R3.png";
import R23_4 from "../../assets/23-R4.png";
import Veinticuatro from "../../assets/24.png";
import R24_1 from "../../assets/24-R1.png";
import R24_2 from "../../assets/24-R2.png";
import R24_3 from "../../assets/24-R3.png";
import R24_4 from "../../assets/24-R4.png";
import Veinticinco from "../../assets/25.png";
import R25_1 from "../../assets/25-R1.png";
import R25_2 from "../../assets/25-R2.png";
import R25_3 from "../../assets/25-R3.png";
import R25_4 from "../../assets/25-R4.png";

import { SelectorPuntajes, BtnTest, BtnInicio, InstBigFive, InstDass21 } from '../../components/TestComp.jsx';



export function Test() {

    const [step, setStep] = useState(0);

    const nextStep = () => {
        setStep(step + 1);
      };
    
      const prevStep = () => {
        setStep(step - 1);
      };

      

  return (
    <>
        <Navbar />
        <div className={`flex flex-col flex-wrap items-center px-6 md:px-8 `}>
        {step === 0 && (
        <div className="flex flex-col items-center">

            <div className={`flex flex-col items-center pb-6`}>
                <h2 className="flex flex-wrap text-2xl font-semibold text-center m-6 text-gray-900">MARIANA RODRIGUEZ PEREZ</h2>
                <p className='flex text-justify'>Estamos muy emocionados de contar contigo como parte de nuestro proceso de selección. Tu talento y experiencia son clave para seguir construyendo una academia disruptiva y que prepare a los estudiantes para enfrentar los retos del futuro.</p>
            </div>
                    <div className='flex flex-col border-4 border-[#3818c3] py-5 px-15 gap-10 box-sizing overflow-y-auto'>
                        <p className='text-center'>Una vez culminado la entrevista en Recursos Humanos, ahora necesitamos que completes algunos pasos importantes:</p>

                        <ol className={`flex flex-col list-decimal list-inside`}>
                            <li className={``}>
                            <strong>Test psicológicos y pruebas académicas:</strong> Estos nos ayudarán a conocer más sobre tus habilidades, conocimientos y áreas de especialidad.
                            </li>
                            
                            <li>
                            <strong>Una vez hayas acreditados los test y pruebas,podrás subir tus documentos:</strong> Por favor, asegúrate de cargar los documentos requeridos en el formato indicado para agilizar tu proceso de contratación.
                            </li>
                        </ol>

                        <div className={`flex flex-col gap-2`}>
                        <p className='text-center'>En MQerKAcademy valoramos el compromiso, la pasión por la educación y la creatividad para transformar vidas. Estamos seguros de que juntos lograremos grandes cosas.</p>
                        <p className='text-center'>Si tienes alguna pregunta o necesitas apoyo, no dudes en comunicarte con nuestro equipo.</p>
                        <p className='text-center'>¡Mucho éxito y bienvenido(a) a esta nueva etapa!</p>
                        <p className='text-center font-bold'>El equipo de MQerKAcademy</p>
                        </div>

                    </div>
                    <div className='flex justify-center m-6'>
                        <BtnInicio type={`submit`} onClick={nextStep}/>
                    </div>
                    

                    </div>
                    )}
                    
                    {step === 1 && (
                    <div className={`flex flex-col`}>
                    <h2 className="text-3xl font-semibold text-center text-gray-900 m-6">MARIANA RODRIGUEZ PEREZ</h2>
                    <div className={`pb-4`}>
                    <InstBigFive/>
                    </div>

                    <form onSubmit={nextStep} className={`flex flex-col`}>
                    <div className='flex flex-col border-4 border-[#3818c3] py-5 px-15 overflow-y-auto'>
                    
                    <ol start={1} className={`flex flex-col gap-8 list-decimal`}>

                        <li>
                            <SelectorPuntajes Inciso={`Disfruto aprender cosas nuevas y explorar temas desconocidos.`} id={``}/>
                        </li>

                        <li>
                            <SelectorPuntajes Inciso={`Me gusta experimentar con métodos o ideas poco convencionales.`} id={``}/>
                        </li>

                        <li>
                            <SelectorPuntajes Inciso={`Aprecio las artes, la creatividad y nuevas formas de expresión.`} id={``}/>
                        </li>

                        <li>
                            <SelectorPuntajes Inciso={`Estoy abierto/a a los cambios y nuevas experiencias.`} id={``}/>
                        </li>

                        <li>
                            <SelectorPuntajes Inciso={`Cumplo con mis compromisos sin importar las dificultades.`} id={``}/>
                        </li>

                        <li>
                            <SelectorPuntajes Inciso={`Me considero una persona organizada y meticulosa en mi trabajo.`} id={``}/>
                        </li>

                        <li>
                            <SelectorPuntajes Inciso={`Planeo con anticipación para evitar contratiempos.`} id={``}/>
                        </li>
                    </ol>

                    </div>
                        <div className='flex w-full justify-end items-center px-4 py-5'>
                            <BtnTest type={`submit`} TextoBtn={`Siguiente`} />
                        </div>
                    </form>
                    </div>
                    )}


                    
                    {step === 2 && (
                    <div className={`flex flex-col`}>
                    <h2 className="text-3xl font-semibold text-center text-gray-900 m-6">MARIANA RODRIGUEZ PEREZ</h2>
                    <div className={`pb-4`}>
                    <InstBigFive/>
                    </div>


                    <form onSubmit={nextStep} className={``}>                     
                        <div className='flex flex-col border-4 border-[#3818c3] py-5 px-15 overflow-x-auto'>
                        
                        <ol start={8} className={`flex flex-col gap-8 list-decimal`}>
                            <li>
                                <SelectorPuntajes Inciso={`Termino lo que empiezo, incluso si requiere un esfuerzo extra.`}/>
                            </li>

                            <li>
                                <SelectorPuntajes Inciso={`Me gusta interactuar con otras personas y compartir ideas.`}/>
                            </li>

                            <li>
                                <SelectorPuntajes Inciso={`Siento energía y entusiasmo cuando trabajo en equipo.`}/>
                            </li>

                            <li>
                                <SelectorPuntajes Inciso={`Tomo la iniciativa en conversaciones o proyectos grupales.`}/>
                            </li>

                            <li>
                                <SelectorPuntajes Inciso={`Me resulta fácil presentarme y comunicarme con nuevas personas.`}/>
                            </li>

                            <li>
                                <SelectorPuntajes Inciso={`Escucho y valoro las opiniones de los demás.`}/>
                            </li>

                            <li>
                                <SelectorPuntajes Inciso={`Ayudo a compañeros o estudiantes cuando necesitan apoyo.`}/>
                            </li>
                        </ol>
                        </div>


                        <div className={`flex justify-between px-4 py-5`}>
                            <BtnTest TextoBtn={`Anterior`} onClick={prevStep}/>
                            <BtnTest type={`submit`} TextoBtn={`Siguiente`}/>
                        </div>
                    </form>
                    </div>
                    )}
                    {step === 3 && (

                    <div className={`flex flex-col`}>
                    <h2 className="text-3xl font-semibold text-center text-gray-900 m-6">MARIANA RODRIGUEZ PEREZ</h2>
                    <div className={`pb-4`}>
                    <InstBigFive/>
                    </div>

                    <form onSubmit={nextStep}>

                        <div className={`flex flex-col border-4 border-[#3818c3] py-5 px-15 overflow-y-auto`}>

                        <ol start={15} className={`flex flex-col gap-8 list-decimal`}>
                            <li>
                                <SelectorPuntajes Inciso={`Mantengo un trato respetuoso y positivo en situaciones conflictivas.`}/>
                            </li>

                            <li>
                                <SelectorPuntajes Inciso={`Celebro los logros de los demás y reconozco sus esfuerzos.`}/>
                            </li>

                            <li>
                                <SelectorPuntajes Inciso={`Mantengo la calma en situaciones estresantes o difíciles.`}/>
                            </li>

                            <li>
                                <SelectorPuntajes Inciso={`No me dejo afectar fácilmente por críticas o problemas menores.`}/>
                            </li>

                            <li>
                                <SelectorPuntajes Inciso={`Manejo mis emociones de manera equilibrada y reflexiva.`}/>
                            </li>

                            <li>
                                <SelectorPuntajes Inciso={`Encuentro soluciones prácticas sin dejarme llevar por el estrés.`}/>
                            </li>

                            <li>
                                <SelectorPuntajes Inciso={`Nunca me he sentido estresado o presionado en mi vida.`}/>
                            </li>

                            <li>
                                <SelectorPuntajes Inciso={`Siempre he logrado todo sin enfrentar ningún error.`}/>
                            </li>
                        </ol>
                        </div>
                        <div className={`flex justify-between px-4 py-5`}>
                            <BtnTest TextoBtn={`Anterior`} onClick={prevStep}/>
                            <BtnTest type={`submit`} TextoBtn={`Siguiente`}/>
                        </div>

                    </form>
                    </div>
                    )}
                    {step === 4 && (
                    <div>
                    
                        <InstDass21/>
                        <form onSubmit={nextStep}>
                            <div className={`flex flex-col border-4 border-[#3818c3] py-5 px-15 overflow-y-auto`}>
                                <ol start={1} className={`flex flex-col gap-8 list-decimal`}>
                                    <li>
                                        <SelectorPuntajes Inciso={`Me ha sido difícil relajarme después de un día de trabajo.`}/>
                                    </li>

                                    <li>
                                        <SelectorPuntajes Inciso={`Me he sentido nervioso/a o alterado/a al enfrentar cambios importantes.`}/>
                                    </li>

                                    <li>
                                        <SelectorPuntajes Inciso={`He sentido que no puedo organizar mis tareas y responsabilidades de forma efectiva.`}/>
                                    </li>

                                    <li>
                                        <SelectorPuntajes Inciso={`Me he sentido tenso/a o irritado/a sin motivo aparente.`}/>
                                    </li>

                                    <li>
                                        <SelectorPuntajes Inciso={`Siento que mi carga de trabajo me resulta difícil de manejar.`}/>
                                    </li>

                                    <li>
                                        <SelectorPuntajes Inciso={`Me cuesta pensar con claridad cuando me encuentro bajo presión.`}/>
                                    </li>

                                    <li>
                                        <SelectorPuntajes Inciso={`Me frustro fácilmente cuando las cosas no salen como planeo.`}/>
                                    </li>
                                </ol>

                            </div>
                            <div className={`flex w-full justify-end items-center px-4 py-5`}>
                            <BtnTest TextoBtn={`Siguiente`}/>
                            </div>
                        </form>
                    </div>
                    )}
                        
                    {step === 5 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">TEST DASS-21</h2>
                        <p className='text-center text-xl mb-2'>Instrucciones:</p>
                        <p className='text-center text-xl mb-3'>Responde a cada ítem considerando cómo te has sentido o comportado en la última semana, seleccionando una opción por cada afirmación:</p>
                        <p className='text-center text-xl mb-3'>0 = Nunca | 1 = Casi nunca | 2 = A veces | 3 = Frecuentemente | 4 = Muy frecuentemente</p>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>8. He sentido una sensación de miedo, aunque no haya un motivo claro.</p>
                            </div>

                            <div>
                                <select
                                    id="pais"
                                    name="pais"
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>9. He sentido que mi corazón late rápido incluso en reposo.</p>
                            </div>

                            <div>
                                <select
                                    id="pais"
                                    name="pais"
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>10. Me cuesta mantener la calma al enfrentar conflictos o desafíos.</p>
                            </div>

                            <div>
                                <select
                                    id="pais"
                                    name="pais"
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>11. He sentido que no puedo detener pensamientos preocupantes.</p>
                            </div>

                            <div>
                                <select
                                    id="pais"
                                    name="pais"
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>12. Me he sentido abrumado/a ante tareas importantes.</p>
                            </div>

                            <div>
                                <select
                                    id="pais"
                                    name="pais"
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>13. He evitado situaciones que me ponen nervioso/a.</p>
                            </div>

                            <div>
                                <select
                                    id="pais"
                                    name="pais"
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>14. He sentido incomodidad física (como temblores o sudoración) en situaciones estresantes.</p>
                            </div>

                            <div>
                                <select
                                    id="pais"
                                    name="pais"
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            <button
                            onClick={prevStep}    
                            className="w-38 px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Anterior
                                </button>
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Siguiente
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 6 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">TEST DASS-21</h2>
                        <p className='text-center text-xl mb-2'>Instrucciones:</p>
                        <p className='text-center text-xl mb-3'>Responde a cada ítem considerando cómo te has sentido o comportado en la última semana, seleccionando una opción por cada afirmación:</p>
                        <p className='text-center text-xl mb-3'>0 = Nunca | 1 = Casi nunca | 2 = A veces | 3 = Frecuentemente | 4 = Muy frecuentemente</p>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>15. Me he sentido triste o vacío/a durante la última semana.</p>
                            </div>

                            <div>
                                <select
                                    id="pais"
                                    name="pais"
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>16. He perdido interés en actividades que antes disfrutaba.</p>
                            </div>

                            <div>
                                <select
                                    id="pais"
                                    name="pais"
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>17. He sentido que no tengo energía para cumplir con mis responsabilidades.</p>
                            </div>

                            <div>
                                <select
                                    id="pais"
                                    name="pais"
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>18. Me he sentido inferior o poco capaz comparado con otros.</p>
                            </div>

                            <div>
                                <select
                                    id="pais"
                                    name="pais"
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>19. Me cuesta encontrar cosas positivas en mi día a día.</p>
                            </div>

                            <div>
                                <select
                                    id="pais"
                                    name="pais"
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>20. Me he sentido desmotivado/a para resolver problemas cotidianos.</p>
                            </div>

                            <div>
                                <select
                                    id="pais"
                                    name="pais"
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>21. Siento que no estoy logrando los objetivos que me he propuesto.</p>
                            </div>

                            <div>
                                <select
                                    id="pais"
                                    name="pais"
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona un puntaje</option>
                                    <option value="0">0</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            <button
                            onClick={prevStep}    
                            className="w-38 px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Anterior
                                </button>
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Siguiente
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 7 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">TEST DE ZAVIC</h2>
                        <p className='text-center text-xl mb-2'>Instrucciones:</p>
                        <p className='text-center text-xl mb-3'>A continuación, encontrarás una serie de situaciones con cuatro posibles respuestas. Lee cada situación cuidadosamente y asigna un número del 1 al 4 según lo siguiente:</p>
                        <p className='text-center text-xl mb-3'>4 = Más importante | 3 = Importante pero no tanto como la anterior | 2 = Menos importante | 1 = Menos relevante de todas</p>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>1. Si descubres que un colega no está cumpliendo con las normas de la empresa, tú:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Lo reportas a un supervisor de inmediato.">Lo reportas a un supervisor de inmediato.</option>
                                        <option value="Intentas hablar con él para entender la situación.">Intentas hablar con él para entender la situación.</option>
                                        <option value="Decides no involucrarte en el asunto.">Decides no involucrarte en el asunto.</option>
                                        <option value="Consideras que es su responsabilidad y no intervienes.">Consideras que es su responsabilidad y no intervienes.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>2. En una situación en la que tu equipo debe tomar una decisión difícil, tú</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Propones seguir estrictamente las políticas establecidas.">Propones seguir estrictamente las políticas establecidas.</option>
                                        <option value="Buscas la opción más justa para todos.">Buscas la opción más justa para todos.</option>
                                        <option value="Consideras lo que beneficiaría más a la mayoría.">Consideras lo que beneficiaría más a la mayoría.</option>
                                        <option value="Optas por la decisión más eficiente, sin importar las reglas.">Optas por la decisión más eficiente, sin importar las reglas.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>3. Si tienes que elegir entre dos proyectos, eliges el que:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Está alineado con las normas de la empresa.">Está alineado con las normas de la empresa.</option>
                                        <option value="Tiene un mayor impacto positivo en las personas.">Tiene un mayor impacto positivo en las personas.</option>
                                        <option value="Te brinde más beneficios económicos.">Te brinde más beneficios económicos.</option>
                                        <option value="Sea más fácil de completar rápidamente.">Sea más fácil de completar rápidamente.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>4. Cuando trabajas en equipo, priorizas:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Seguir las reglas para evitar conflictos.">Seguir las reglas para evitar conflictos.</option>
                                        <option value="Crear un ambiente de respeto mutuo.">Crear un ambiente de respeto mutuo.</option>
                                        <option value="Cumplir con los objetivos, sin importar las relaciones personales.">Cumplir con los objetivos, sin importar las relaciones personales.</option>
                                        <option value="Minimizar el esfuerzo necesario para lograr los resultados.">Minimizar el esfuerzo necesario para lograr los resultados.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>5. Si observas que un proyecto no cumple con los estándares éticos de la empresa, tú:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Informas inmediatamente a los responsables.">Informas inmediatamente a los responsables.</option>
                                        <option value="Buscas entender las razones detrás de la situación antes de actuar.">Buscas entender las razones detrás de la situación antes de actuar.</option>
                                        <option value="Te mantienes al margen para evitar conflictos.">Te mantienes al margen para evitar conflictos.</option>
                                        <option value="Lo consideras un error menor si no afecta directamente el resultado.">Lo consideras un error menor si no afecta directamente el resultado.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>6. Si encuentras un objeto valioso olvidado en tu lugar de trabajo, tú:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Lo devuelves inmediatamente a su dueño.">Lo devuelves inmediatamente a su dueño.</option>
                                        <option value="Informas a tus superiores y entregas el objeto.">Informas a tus superiores y entregas el objeto.</option>
                                        <option value="Decides esperar para ver si alguien lo reclama.">Decides esperar para ver si alguien lo reclama.</option>
                                        <option value="Lo dejas donde lo encontraste.">Lo dejas donde lo encontraste.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Siguiente
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 8 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">TEST DE ZAVIC</h2>
                        <p className='text-center text-xl mb-2'>Instrucciones:</p>
                        <p className='text-center text-xl mb-3'>A continuación, encontrarás una serie de situaciones con cuatro posibles respuestas. Lee cada situación cuidadosamente y asigna un número del 1 al 4 según lo siguiente:</p>
                        <p className='text-center text-xl mb-3'>4 = Más importante | 3 = Importante pero no tanto como la anterior | 2 = Menos importante | 1 = Menos relevante de todas</p>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>7. Si un cliente ofrece un incentivo para recibir un trato especial, tú:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Rechazas el incentivo y explicas que no es ético.">Rechazas el incentivo y explicas que no es ético.</option>
                                        <option value="Informas la situación a tu supervisor.">Informas la situación a tu supervisor.</option>
                                        <option value="Aceptas el incentivo para evitar problemas.">Aceptas el incentivo para evitar problemas.</option>
                                        <option value="Consideras si afecta negativamente a alguien antes de decidir.">Consideras si afecta negativamente a alguien antes de decidir.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>8. En una situación de presión por cumplir metas laborales, prefieres:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Mantener la integridad, aunque afecte los resultados.">Mantener la integridad, aunque afecte los resultados.</option>
                                        <option value="Buscar apoyo del equipo para trabajar dentro de las reglas.">Buscar apoyo del equipo para trabajar dentro de las reglas.</option>
                                        <option value="Tomar atajos siempre que sean efectivos.">Tomar atajos siempre que sean efectivos.</option>
                                        <option value="Adaptarte a las circunstancias, incluso si eso implica romper algunas normas.">Adaptarte a las circunstancias, incluso si eso implica romper algunas normas.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>9. Si un compañero de trabajo te pide que lo cubras en una actividad que no completó, tú:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Informas al supervisor sobre la situación.">Informas al supervisor sobre la situación.</option>
                                        <option value="Lo ayudas solo si es una emergencia.">Lo ayudas solo si es una emergencia.</option>
                                        <option value="Aceptas hacerlo, pero te aseguras de que sea la última vez.">Aceptas hacerlo, pero te aseguras de que sea la última vez.</option>
                                        <option value="Te niegas porque no es tu responsabilidad.">Te niegas porque no es tu responsabilidad.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>10. Si tuvieras que elegir entre dos trabajos, elegirías el que:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Ofrece mayor estabilidad económica.">Ofrece mayor estabilidad económica.</option>
                                        <option value="Te permite obtener mayores ingresos a corto plazo.">Te permite obtener mayores ingresos a corto plazo.</option>
                                        <option value="Ofrece menos ingresos pero más equilibrio personal.">Ofrece menos ingresos pero más equilibrio personal.</option>
                                        <option value="Brinda más oportunidades de crecimiento profesional.">Brinda más oportunidades de crecimiento profesional.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>11. Cuando se trata de beneficios laborales, priorizas:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Un salario justo y competitivo.">Un salario justo y competitivo.</option>
                                        <option value="Incentivos adicionales como bonos.">Incentivos adicionales como bonos.</option>
                                        <option value="Un ambiente laboral cómodo y equilibrado.">Un ambiente laboral cómodo y equilibrado.</option>
                                        <option value="Oportunidades de aprendizaje y desarrollo.">Oportunidades de aprendizaje y desarrollo.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>12. Si tienes la oportunidad de mejorar un proceso en tu trabajo, lo haces porque:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Aumenta la productividad de tu equipo.">Aumenta la productividad de tu equipo.</option>
                                        <option value="Mejora los ingresos de la empresa.">Mejora los ingresos de la empresa.</option>
                                        <option value="Beneficia a los clientes o usuarios.">Beneficia a los clientes o usuarios.</option>
                                        <option value="Genera menos estrés en tu día a día.">Genera menos estrés en tu día a día.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            <button
                            onClick={prevStep}    
                            className="w-38 px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Anterior
                                </button>
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Siguiente
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 9 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">TEST DE ZAVIC</h2>
                        <p className='text-center text-xl mb-2'>Instrucciones:</p>
                        <p className='text-center text-xl mb-3'>A continuación, encontrarás una serie de situaciones con cuatro posibles respuestas. Lee cada situación cuidadosamente y asigna un número del 1 al 4 según lo siguiente:</p>
                        <p className='text-center text-xl mb-3'>4 = Más importante | 3 = Importante pero no tanto como la anterior | 2 = Menos importante | 1 = Menos relevante de todas</p>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>13. Si tu supervisor te pide que completes una tarea extra sin remuneración adicional, tú:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Te aseguras de que valga la pena el esfuerzo.">Te aseguras de que valga la pena el esfuerzo.</option>
                                        <option value="Preguntas si habrá beneficios futuros por hacerlo.">Preguntas si habrá beneficios futuros por hacerlo.</option>
                                        <option value="Lo haces porque es parte de tu compromiso.">Lo haces porque es parte de tu compromiso.</option>
                                        <option value="Lo rechazas si consideras que no es justo.">Lo rechazas si consideras que no es justo.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>14. En un proyecto grupal, prefieres ser:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="El líder que toma decisiones.">El líder que toma decisiones.</option>
                                        <option value="Parte del equipo que ejecuta las tareas.">Parte del equipo que ejecuta las tareas.</option>
                                        <option value="El apoyo técnico que brinda soluciones.">El apoyo técnico que brinda soluciones.</option>
                                        <option value="El observador que monitorea el progreso.">El observador que monitorea el progreso.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>15. Si tu supervisor te pide una opinión sobre una estrategia, tú:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Propones una alternativa más efectiva.">Propones una alternativa más efectiva.</option>
                                        <option value="Das tu opinión solo si estás seguro/a de que será bien recibida.">Das tu opinión solo si estás seguro/a de que será bien recibida.</option>
                                        <option value="Apoyas lo que ya está decidido.">Apoyas lo que ya está decidido.</option>
                                        <option value="Evitas opinar para no complicarte.">Evitas opinar para no complicarte.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>16. En un entorno laboral, buscas roles que:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Te permitan tomar decisiones importantes.">Te permitan tomar decisiones importantes.</option>
                                        <option value="Sean clave para el éxito del equipo.">Sean clave para el éxito del equipo.</option>
                                        <option value="No requieran demasiada exposición.">No requieran demasiada exposición.</option>
                                        <option value="Te ofrezcan la posibilidad de aprender sin presión.">Te ofrezcan la posibilidad de aprender sin presión.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>17. Cuando surge un problema en tu equipo, tiendes a:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Asumir la responsabilidad de encontrar una solución.">Asumir la responsabilidad de encontrar una solución.</option>
                                        <option value="Esperar a que alguien más tome la iniciativa.">Esperar a que alguien más tome la iniciativa.</option>
                                        <option value="Consultar a tus superiores antes de actuar.">Consultar a tus superiores antes de actuar.</option>
                                        <option value="Resolverlo solo si afecta directamente tu desempeño.">Resolverlo solo si afecta directamente tu desempeño.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>18. Si un colega está teniendo un mal día, tú:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Le ofreces tu ayuda para aliviar su carga.">Le ofreces tu ayuda para aliviar su carga.</option>
                                        <option value="Intentas animarlo con una conversación positiva.">Intentas animarlo con una conversación positiva.</option>
                                        <option value="Decides darle su espacio para que lo resuelva por su cuenta.">Decides darle su espacio para que lo resuelva por su cuenta.</option>
                                        <option value="Lo reportas a los supervisores para que lo apoyen.">Lo reportas a los supervisores para que lo apoyen.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            <button
                            onClick={prevStep}    
                            className="w-38 px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Anterior
                                </button>
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Siguiente
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 10 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">TEST DE ZAVIC</h2>
                        <p className='text-center text-xl mb-2'>Instrucciones:</p>
                        <p className='text-center text-xl mb-3'>A continuación, encontrarás una serie de situaciones con cuatro posibles respuestas. Lee cada situación cuidadosamente y asigna un número del 1 al 4 según lo siguiente:</p>
                        <p className='text-center text-xl mb-3'>4 = Más importante | 3 = Importante pero no tanto como la anterior | 2 = Menos importante | 1 = Menos relevante de todas</p>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>19. Si tu equipo está enfrentando dificultades, tú:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Buscas formas de motivarlos a seguir adelante.">Buscas formas de motivarlos a seguir adelante.</option>
                                        <option value="Les recuerdas que todos deben cumplir sus responsabilidades.">Les recuerdas que todos deben cumplir sus responsabilidades.</option>
                                        <option value="Los apoyas solo si afecta directamente tus tareas.">Los apoyas solo si afecta directamente tus tareas.</option>
                                        <option value="Esperas a que encuentren una solución por sí mismos.">Esperas a que encuentren una solución por sí mismos.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>20. Cuando se trata de compartir recursos laborales, tú:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Aseguras que todos tengan acceso equitativo.">Aseguras que todos tengan acceso equitativo.</option>
                                        <option value="Priorizas las necesidades de quienes más lo necesitan.">Priorizas las necesidades de quienes más lo necesitan.</option>
                                        <option value="Utilizas los recursos de manera personal para garantizar resultados.">Utilizas los recursos de manera personal para garantizar resultados.</option>
                                        <option value="Propones que los recursos sean asignados por orden jerárquico.">Propones que los recursos sean asignados por orden jerárquico.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>21. Si un cliente necesita más tiempo o apoyo del esperado, tú:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Lo ayudas sin dudar porque es tu responsabilidad.">Lo ayudas sin dudar porque es tu responsabilidad.</option>
                                        <option value="Buscas apoyo de otros para brindarle el servicio necesario.">Buscas apoyo de otros para brindarle el servicio necesario.</option>
                                        <option value="Haces lo que puedes sin comprometer tus tareas.">Haces lo que puedes sin comprometer tus tareas.</option>
                                        <option value="Le explicas que hay límites claros en los servicios ofrecidos.">Le explicas que hay límites claros en los servicios ofrecidos.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>22. Prefieres un entorno laboral donde puedas:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Innovar constantemente en los procesos.">Innovar constantemente en los procesos.</option>
                                        <option value="Mejorar la eficiencia con métodos probados.">Mejorar la eficiencia con métodos probados.</option>
                                        <option value="Tener un enfoque claro y estructurado.">Tener un enfoque claro y estructurado.</option>
                                        <option value="Cumplir tus tareas sin necesidad de cambiar lo establecido.">Cumplir tus tareas sin necesidad de cambiar lo establecido.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>23. Al abordar un problema complejo, tú:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Piensas fuera de lo convencional para resolverlo.">Piensas fuera de lo convencional para resolverlo.</option>
                                        <option value="Analizas las soluciones más prácticas disponibles.">Analizas las soluciones más prácticas disponibles.</option>
                                        <option value="Buscas ejemplos previos para guiarte.">Buscas ejemplos previos para guiarte.</option>
                                        <option value="Evitas involucrarte si no es parte de tu rol.">Evitas involucrarte si no es parte de tu rol.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>24. Cuando tienes una idea nueva, tiendes a:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Compartirla con el equipo para desarrollarla juntos.">Compartirla con el equipo para desarrollarla juntos.</option>
                                        <option value="Analizarla primero para asegurarte de que es viable.">Analizarla primero para asegurarte de que es viable.</option>
                                        <option value="Guardarla para ti hasta que sea necesaria.">Guardarla para ti hasta que sea necesaria.</option>
                                        <option value="Evitar proponerla si no estás seguro/a de su éxito.">Evitar proponerla si no estás seguro/a de su éxito.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            <button
                            onClick={prevStep}    
                            className="w-38 px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Anterior
                                </button>
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Siguiente
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 11 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">TEST DE ZAVIC</h2>
                        <p className='text-center text-xl mb-2'>Instrucciones:</p>
                        <p className='text-center text-xl mb-3'>A continuación, encontrarás una serie de situaciones con cuatro posibles respuestas. Lee cada situación cuidadosamente y asigna un número del 1 al 4 según lo siguiente:</p>
                        <p className='text-center text-xl mb-3'>4 = Más importante | 3 = Importante pero no tanto como la anterior | 2 = Menos importante | 1 = Menos relevante de todas</p>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>25. Si un proyecto requiere innovación, prefieres:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value="Proponer nuevas formas de hacerlo.">Proponer nuevas formas de hacerlo.</option>
                                        <option value="Seguir métodos que ya hayan funcionado antes.">Seguir métodos que ya hayan funcionado antes.</option>
                                        <option value="Pedir apoyo a un colega más experimentado.">Pedir apoyo a un colega más experimentado.</option>
                                        <option value="Cumplir tu parte sin involucrarte en la planificación.">Cumplir tu parte sin involucrarte en la planificación.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>26. Si tu empresa enfrenta un problema recurrente, prefieres:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Aseguras que todos tengan acceso equitativo.'>Aseguras que todos tengan acceso equitativo.</option>
                                        <option value='Priorizas las necesidades de quienes más lo necesitan.'>Priorizas las necesidades de quienes más lo necesitan.</option>
                                        <option value='Utilizas los recursos de manera personal para garantizar resultados.'>Utilizas los recursos de manera personal para garantizar resultados.</option>
                                        <option value='Propones que los recursos sean asignados por orden jerárquico.'>Propones que los recursos sean asignados por orden jerárquico.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>27. Cuando trabajas en un equipo diverso con distintas ideas, tú:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Fomentas la integración de todas las perspectivas.'>Fomentas la integración de todas las perspectivas.</option>
                                        <option value='Analizas qué idea tiene más sentido práctico.'>Analizas qué idea tiene más sentido práctico.</option>
                                        <option value='Prefieres seguir con las ideas que ya funcionan.'>Prefieres seguir con las ideas que ya funcionan.</option>
                                        <option value='Te adaptas a la decisión de la mayoría sin cuestionar.'>Te adaptas a la decisión de la mayoría sin cuestionar.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>28. Si la empresa donde trabajas implementa un proyecto de impacto social, tú:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Participas activamente y propones ideas.'>Participas activamente y propones ideas.</option>
                                        <option value='Colaboras si te lo solicitan.'>Colaboras si te lo solicitan.</option>
                                        <option value='Lo apoyas solo si no interfiere con tus tareas.'>Lo apoyas solo si no interfiere con tus tareas.</option>
                                        <option value='Consideras que es una actividad secundaria.'>Consideras que es una actividad secundaria.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>29. Cuando observas prácticas laborales que dañan el medio ambiente, tú:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Informas a tus superiores para buscar soluciones.'>Informas a tus superiores para buscar soluciones.</option>
                                        <option value='Propones alternativas más sostenibles.'>Propones alternativas más sostenibles.</option>
                                        <option value='Te enfocas en cumplir con tus propias responsabilidades.'>Te enfocas en cumplir con tus propias responsabilidades.</option>
                                        <option value='Lo ignoras porque no depende de ti cambiarlo.'>Lo ignoras porque no depende de ti cambiarlo.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>30. Si tu equipo recibe fondos adicionales para un proyecto, tú:</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div className='w-80'>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Aseguras que se usen de manera eficiente y responsable.'>Aseguras que se usen de manera eficiente y responsable.</option>
                                        <option value='Propones invertirlos en actividades que beneficien a la comunidad.'>Propones invertirlos en actividades que beneficien a la comunidad.</option>
                                        <option value='Sugieres utilizarlos en mejorar los recursos internos del equipo.'>Sugieres utilizarlos en mejorar los recursos internos del equipo.</option>
                                        <option value='Consideras que deberían distribuirse como incentivos individuales.'>Consideras que deberían distribuirse como incentivos individuales.</option>
                                    </select>
                                </div>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="4">4</option>
                                        <option value="3">3</option>
                                        <option value="2">2</option>
                                        <option value="1">1</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            <button
                            onClick={prevStep}    
                            className="w-38 px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Anterior
                                </button>
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Siguiente
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 12 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">Test de Inteligencia Emocional Bar-On</h2>
                        <p className='text-center text-xl mb-2'>Instrucciones:</p>
                        <p className='text-center text-xl mb-3'> Lee cada afirmación y selecciona la opción que mejor describa tu comportamiento habitual en el entorno laboral. Utiliza una escala del 1 al 5:</p>
                        <p className='text-center text-xl mb-3'>1 = Totalmente en desacuerdo | 2 = En desacuerdo | 3 = Neutral | 4 = De acuerdo | 5 = Totalmente de acuerdo</p>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>1. Soy capaz de reconocer cuando mis emociones afectan mi desempeño en el trabajo.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>2. Entiendo cómo mis emociones pueden influir en la dinámica del equipo de trabajo.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>3. Reflexiono sobre mis emociones después de situaciones estresantes para aprender de ellas.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>4. Soy consciente de las emociones que siento cuando estoy trabajando bajo presión.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>5. Reconozco mis fortalezas y debilidades emocionales.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>6. Mantengo la calma en situaciones de alta presión o conflicto en el trabajo.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>7. En momentos de estrés, puedo mantener un enfoque claro y no dejo que mis emociones me descontrolen.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Siguiente
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 13 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">Test de Inteligencia Emocional Bar-On</h2>
                        <p className='text-center text-xl mb-2'>Instrucciones:</p>
                        <p className='text-center text-xl mb-3'> Lee cada afirmación y selecciona la opción que mejor describa tu comportamiento habitual en el entorno laboral. Utiliza una escala del 1 al 5:</p>
                        <p className='text-center text-xl mb-3'>1 = Totalmente en desacuerdo | 2 = En desacuerdo | 3 = Neutral | 4 = De acuerdo | 5 = Totalmente de acuerdo</p>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>8. Cuando estoy frustrado, sé cómo calmarme y seguir adelante.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>9. Me esfuerzo por mantener una actitud positiva frente a desafíos o fracasos.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>10. Suelo manejar mis emociones sin que estas interfieran con la toma de decisiones en el trabajo.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>11. Trato de comprender cómo se sienten los demás antes de actuar o dar una respuesta.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>12. Escucho activamente a los compañeros de trabajo para comprender sus necesidades y emociones.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>13. Soy capaz de reconocer cuando los estudiantes o colegas necesitan apoyo emocional.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            <button
                            onClick={prevStep}    
                            className="w-38 px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Anterior
                                </button>
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Siguiente
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 14 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">Test de Inteligencia Emocional Bar-On</h2>
                        <p className='text-center text-xl mb-2'>Instrucciones:</p>
                        <p className='text-center text-xl mb-3'> Lee cada afirmación y selecciona la opción que mejor describa tu comportamiento habitual en el entorno laboral. Utiliza una escala del 1 al 5:</p>
                        <p className='text-center text-xl mb-3'>1 = Totalmente en desacuerdo | 2 = En desacuerdo | 3 = Neutral | 4 = De acuerdo | 5 = Totalmente de acuerdo</p>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>14. Intento adaptar mi enfoque a las necesidades emocionales de los demás, especialmente cuando trato con estudiantes.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>15. Me esfuerzo por mostrar empatía y apoyo en situaciones emocionales difíciles en el entorno académico.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>16. Puedo manejar conflictos de manera eficaz sin que estos afecten las relaciones laborales.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>17. Me siento cómodo estableciendo relaciones de confianza con colegas y estudiantes.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>18. Fomento un ambiente de trabajo colaborativo y respetuoso.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>19. Soy capaz de comunicarme claramente con los estudiantes y compañeros, incluso en situaciones difíciles.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            <button
                            onClick={prevStep}    
                            className="w-38 px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Anterior
                                </button>
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Siguiente
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 15 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">Test de Inteligencia Emocional Bar-On</h2>
                        <p className='text-center text-xl mb-2'>Instrucciones:</p>
                        <p className='text-center text-xl mb-3'> Lee cada afirmación y selecciona la opción que mejor describa tu comportamiento habitual en el entorno laboral. Utiliza una escala del 1 al 5:</p>
                        <p className='text-center text-xl mb-3'>1 = Totalmente en desacuerdo | 2 = En desacuerdo | 3 = Neutral | 4 = De acuerdo | 5 = Totalmente de acuerdo</p>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>20. Me esfuerzo por crear un clima laboral inclusivo y positivo en el trabajo.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>21. Al tomar decisiones importantes, considero tanto los hechos como mis emociones.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>22. En situaciones complicadas, busco soluciones que beneficien tanto a los estudiantes como al equipo.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>23. Soy capaz de evaluar las posibles consecuencias emocionales de mis decisiones antes de actuar.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>24. A la hora de resolver problemas, soy creativo y abierto a nuevas ideas.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>25. Tomo decisiones basadas en un equilibrio entre la lógica y las emociones de los involucrados.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona un puntaje</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            <button
                            onClick={prevStep}    
                            className="w-38 px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Anterior
                                </button>
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Siguiente
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 16 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">TEST de Inteligencia Cognitiva Completa (IQ Test de Alto Nivel)-WAIS:</h2>
                        <p className='text-xl mb-2'>Instrucciones:</p>
                        <p className='text-xl'>1. Lee cuidadosamente cada pregunta antes de responder.</p>
                        <p className='text-xl'>2. Responde con claridad y en el espacio indicado.</p>
                        <p className='text-xl'>3. Algunas preguntas son cerradas (elige la opción correcta) y otras abiertas (explica o describe).</p>
                        <p className='text-xl mb-6'>4. En las preguntas abiertas, procura incluir ejemplos prácticos, soluciones claras o reflexiones relevantes según corresponda.</p>
                        <p className='text-center font-bold text-xl text-gray-900'>Tiempo estimado:</p>
                        <p className='text-center text-xl'>Tienes un máximo de 40 minutos para completar el test.</p>
                        <p className='text-center font-bold text-xl text-gray-900'>¡Buena suerte!</p>
                        <p className='text-center text-xl mb-8'>Si tienes alguna duda antes de comenzar, consulta con el evaluador.</p>
                        <div className='flex justify-center items-center'>
                            <button
                            type="submit"
                            className="w-50 px-10 py-3 font-bold bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                            >
                            Iniciar
                            </button>
                        </div>
                    </form>
                    )}
                    {step === 17 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">TEST de Inteligencia Cognitiva Completa (IQ Test de Alto Nivel)-WAIS:</h2>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>1. Encuentra el siguiente número en la serie: 5, 10, 20, 40, ...</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='50'>50</option>
                                        <option value='60'>60</option>
                                        <option value='80'>80</option>
                                        <option value='100'>100</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>2. Si 2(x+3)=3x+7, ¿cuánto vale x?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='-1'>-1</option>
                                        <option value='1'>1</option>
                                        <option value='0'>0</option>
                                        <option value='2'>2</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>3. Un empleado realiza una tarea en 4 horas. Si trabaja al doble de velocidad, ¿cuánto tardará en terminar?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value=' 2 horas'> 2 horas</option>
                                        <option value=' 3 horas'> 3 horas</option>
                                        <option value=' 1 horas'> 1 horas</option>
                                        <option value=' 4 horas'> 4 horas</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>4. En un grupo hay 12 personas. Cada una debe saludar a las demás una vez. ¿Cuántos saludos se realizan en total?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='66'>66</option>
                                        <option value='72'>72</option>
                                        <option value='144'>144</option>
                                        <option value='12'>12</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>5. Encuentra el elemento que no encaja: Manzana, Pera, Carro, Mango.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Manzana'>Manzana</option>
                                        <option value='Pera'>Pera</option>
                                        <option value='Carro'>Carro</option>
                                        <option value='Mango'>Mango</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Siguiente
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 18 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">TEST de Inteligencia Cognitiva Completa (IQ Test de Alto Nivel)-WAIS:</h2>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>6. Un estudiante no entiende un concepto clave en clase. ¿Qué pasos seguirías?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 border w-127 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Ignorar el problema y continuar.'>Ignorar el problema y continuar.</option>
                                        <option value='Repetir la explicación de la misma manera.'>Repetir la explicación de la misma manera.</option>
                                        <option value='Proporcionar un ejemplo práctico y verificar su comprensión.'>Proporcionar un ejemplo práctico y verificar su comprensión.</option>
                                        <option value='Pedirle que lo estudie después de clase.'>Pedirle que lo estudie después de clase.</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>7. Si te enfrentas a un grupo con niveles de aprendizaje variados, ¿qué harías?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Dividir el grupo en niveles y trabajar con cada nivel por separado.'>Dividir el grupo en niveles y trabajar con cada nivel por separado.</option>
                                        <option value='Ignorar las diferencias y enseñar al ritmo promedio.'>Ignorar las diferencias y enseñar al ritmo promedio.</option>
                                        <option value='Diseñar actividades con diferentes niveles de dificultad.'>Diseñar actividades con diferentes niveles de dificultad.</option>
                                        <option value='Enfocarme solo en los más avanzados.'>Enfocarme solo en los más avanzados.</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>8. ¿Qué harías si un estudiante cuestiona tu explicación con argumentos válidos?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-127 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Escuchar y debatir respetuosamente.'>Escuchar y debatir respetuosamente.</option>
                                        <option value='Rechazar sus argumentos de inmediato.'>Rechazar sus argumentos de inmediato.</option>
                                        <option value='Ignorar el comentario y seguir.'>Ignorar el comentario y seguir.</option>
                                        <option value='Pedirle que consulte otras fuentes.'>Pedirle que consulte otras fuentes.</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>9. Te informan de un cambio de tema con 24 horas de anticipación. ¿Qué harías?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-127 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Solicitar más tiempo para prepararte.'>Solicitar más tiempo para prepararte.</option>
                                        <option value='Prepararte lo mejor posible con los recursos disponibles.'>Prepararte lo mejor posible con los recursos disponibles.</option>
                                        <option value='Cancelar la clase si no te sientes listo.'>Cancelar la clase si no te sientes listo.</option>
                                        <option value='Ignorar la preparación y trabajar improvisando.'>Ignorar la preparación y trabajar improvisando.</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>10. Propón una actividad dinámica para enseñar un concepto complejo.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                            <input
                                type="text"
                                className="mt-2 p-3 w-127 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Escribe tu respuesta aquí"
                            />
                            </div>
                        </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            <button
                            onClick={prevStep}    
                            className="w-38 px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Anterior
                                </button>
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Siguiente
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 19 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">TEST de Inteligencia Cognitiva Completa (IQ Test de Alto Nivel)-WAIS:</h2>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>11. ¿Qué harías para motivar a un estudiante desinteresado?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-111 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Hablar con él para entender sus intereses.'>Hablar con él para entender sus intereses.</option>
                                        <option value='Ignorar su actitud.'>Ignorar su actitud.</option>
                                        <option value='Regañarlo frente a la clase.'>Regañarlo frente a la clase.</option>
                                        <option value='Pedirle que busque motivación en casa.'>Pedirle que busque motivación en casa.</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>12. ¿Cómo redactarías un correo breve a los padres de un estudiante sobre su progreso?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <input
                                type="text"
                                className="mt-2 p-3 w-111 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Introduce tu correo electrónico"
                                />
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>13. ¿Cómo explicarías la importancia de tu materia?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <input
                                type="text"
                                className="mt-2 p-3 w-111 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Introduce tu correo electrónico"
                                />
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>14. ¿Cómo corregirías a un estudiante sin hacerlo sentir mal?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-111 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Regañandolo en privado.'>Regañandolo en privado.</option>
                                        <option value='Ignorando el error.'>Ignorando el error.</option>
                                        <option value='Corrigiendo de manera constructiva y explicativa.'>Corrigiendo de manera constructiva y explicativa.</option>
                                        <option value='Pidiéndole que lo investigue por su cuenta.'>Pidiéndole que lo investigue por su cuenta.</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>15. Describe tu introducción ideal para tu primera clase.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                            <input
                                type="text"
                                className="mt-2 p-3 w-111 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Introduce tu correo electrónico"
                            />
                            </div>
                        </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            <button
                            onClick={prevStep}    
                            className="w-38 px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Anterior
                                </button>
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Siguiente
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 20 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">TEST de Inteligencia Cognitiva Completa (IQ Test de Alto Nivel)-WAIS:</h2>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>16. Un estudiante argumenta que una técnica no es útil en la vida real. ¿Cómo responderías?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <input
                                type="text"
                                className="mt-2 p-3 w-118 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Introduce tu correo electrónico"
                                />
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>17. Describe cómo manejarías una situación en la que un estudiante interrumpe constantemente.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Ignorar las interrupciones.'>Ignorar las interrupciones.</option>
                                        <option value='Llamarle la atención frente a la clase.'>Llamarle la atención frente a la clase.</option>
                                        <option value='Hablar con él en privado para entender su comportamiento.'>Hablar con él en privado para entender su comportamiento.</option>
                                        <option value='Pedirle que abandone la clase.'>Pedirle que abandone la clase.</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>18. Si no tienes acceso a tus materiales preparados, ¿cómo improvisarías una clase?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <input
                                type="text"
                                className="mt-2 p-3 w-118 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Introduce tu correo electrónico"
                                />
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>19. ¿Cómo manejarías un conflicto entre dos estudiantes?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-118 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Ignorando el conflicto.'>Ignorando el conflicto.</option>
                                        <option value='Resolviéndolo en privado, escuchando ambas partes.'>Resolviéndolo en privado, escuchando ambas partes.</option>
                                        <option value='Sancionándolos a ambos.'>Sancionándolos a ambos.</option>
                                        <option value='Pidiendo la intervención de un superior.'>Pidiendo la intervención de un superior.</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>20. Explica cómo evaluarías si los estudiantes comprendieron el tema al final de la sesión.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                            <input
                                type="text"
                                className="mt-2 p-3 w-118 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Introduce tu correo electrónico"
                            />
                            </div>
                        </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            <button
                            onClick={prevStep}    
                            className="w-38 px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Anterior
                                </button>
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Siguiente
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 21 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">TEST de Inteligencia Cognitiva Completa (IQ Test de Alto Nivel)-WAIS:</h2>
                        <p>En los siguientes ejercicios, selecciona el inciso de la figura que pertenece a la imagen.</p>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-15 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex flex-col">
                                <p className='text-justify'>21.</p>
                                <img className='w-50 h-50' src={Veintiuno} />
                            </div>

                            <div className='flex flex-row space-x-5 gap-15'>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="checkbox" radio />
                                    <img src={R21_1} />
                                </div>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="checkbox" radio />
                                    <img src={R21_2} />
                                </div>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="checkbox" radio />
                                    <img src={R21_3} />
                                </div>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="checkbox" radio />
                                    <img src={R21_4} />
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex flex-col">
                                <p className='text-justify'>22.</p>
                                <img className='w-50 h-50' src={Veintidos} />
                            </div>

                            <div className='flex flex-row space-x-5 gap-15'>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="checkbox" radio />
                                    <img src={R22_1} />
                                </div>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="checkbox" radio />
                                    <img src={R22_2} />
                                </div>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="checkbox" radio />
                                    <img src={R22_3} />
                                </div>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="checkbox" radio />
                                    <img src={R22_4} />
                                </div>
                            </div>
                        </div>        
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            <button
                            onClick={prevStep}    
                            className="w-38 px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Anterior
                                </button>
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Siguiente
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 22 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">TEST de Inteligencia Cognitiva Completa (IQ Test de Alto Nivel)-WAIS:</h2>
                        <p>En los siguientes ejercicios, selecciona el inciso de la figura que pertenece a la imagen.</p>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-15 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex flex-col">
                                <p className='text-justify'>23.</p>
                                <img className='w-50 h-50' src={Veintitres} />
                            </div>

                            <div className='flex flex-row space-x-5 gap-15'>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="checkbox" radio />
                                    <img src={R23_1} />
                                </div>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="checkbox" radio />
                                    <img src={R23_2} />
                                </div>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="checkbox" radio />
                                    <img src={R23_3} />
                                </div>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="checkbox" radio />
                                    <img src={R23_4} />
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex flex-col">
                                <p className='text-justify'>24.</p>
                                <img className='w-50 h-50' src={Veinticuatro} />
                            </div>

                            <div className='flex flex-row space-x-5 gap-15'>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="checkbox" radio />
                                    <img src={R24_1} />
                                </div>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="checkbox" radio />
                                    <img src={R24_2} />
                                </div>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="checkbox" radio />
                                    <img src={R24_3} />
                                </div>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="checkbox" radio />
                                    <img src={R24_4} />
                                </div>
                            </div>
                        </div>        
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            <button
                            onClick={prevStep}    
                            className="w-38 px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Anterior
                                </button>
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Siguiente
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 23 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">TEST de Inteligencia Cognitiva Completa (IQ Test de Alto Nivel)-WAIS:</h2>
                        <p>En los siguientes ejercicios, selecciona el inciso de la figura que pertenece a la imagen.</p>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-15 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex flex-col">
                                <p className='text-justify'>25.</p>
                                <img className='w-90 h-20' src={Veinticinco} />
                            </div>

                            <div className='flex flex-row space-x-5 gap-8'>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="checkbox" />
                                    <img src={R25_1} />
                                </div>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="checkbox" />
                                    <img src={R25_2} />
                                </div>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="checkbox" />
                                    <img src={R25_3} />
                                </div>
                                <div className='flex flex-row gap-5 items-center'>
                                    <input type="checkbox" />
                                    <img src={R25_4} />
                                </div>
                            </div>
                        </div>     
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            <button
                            onClick={prevStep}    
                            className="w-38 px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Anterior
                                </button>
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Finalizar
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 24 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">¡Felicidades por completar los test psicológicos!</h2>
                        <div className='border-4 border-[#3818c3]'>
                        <p className='mt-6 mb-6 ml-6 mr-6 text-xl text-justify'>Tu compromiso y dedicación en esta etapa son muy valiosos para nosotros. Ahora que has finalizado esta fase, estás listo(a) para pasar a las pruebas académicas, donde podrás demostrar tus conocimientos y habilidades en las áreas clave de nuestra academia.</p>    
                        <p className='mt-6 mb-6 ml-6 mr-6 text-xl text-justify'>Recuerda que estas pruebas son una oportunidad para destacar tus fortalezas y confirmar tu preparación para formar parte del equipo de asesores especializados de MQerKAcademy.</p>    
                        <p className='mt-6 mb-6 ml-6 mr-6 text-xl text-justify'>Te invitamos a mantener la misma actitud positiva y enfoque en esta próxima etapa. Si tienes dudas o necesitas alguna orientación, no dudes en preguntarnos.</p>    
                        <p className='mt-6 mb-6 ml-6 mr-6 text-xl font-bold text-center'>¡Mucho éxito!</p>    
                        <p className='mt-6 mb-6 ml-6 mr-6 text-xl text-center font-bold'>El equipo de MQerKAcademy</p>    
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">

                            <div className='flex justify-center items-center w-full'>
                                <button
                                type="submit"
                                className="w-55 px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Siguiente
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 25 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">Prueba académica</h2>
                        <div>
                        <p className='mt-6 mb-6 ml-6 mr-6 text-xl text-justify'>Instrucciones:</p>    
                        <p className='mt-6 mb-6 ml-6 mr-6 text-xl text-justify'>Esta prueba académica tiene como objetivo evaluar tus habilidades, conocimientos y estrategias como asesor educativo. Responde con sinceridad y claridad, demostrando tu capacidad para abordar situaciones académicas y personales de los estudiantes. Completa las preguntas dentro del tiempo establecido y entrega tus respuestas al finalizar. </p>           
                        <p className='mt-6 mb-6 ml-6 mr-6 text-xl font-bold text-center'>Tiempo: 45 minutos</p>    
                        <p className='mt-6 mb-6 ml-6 mr-6 text-xl text-center font-bold'>¡Éxito!</p>    
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">

                            <div className='flex justify-center items-center w-full'>
                                <button
                                type="submit"
                                className="w-55 px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Iniciar Prueba
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 26 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">Prueba académica</h2>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>1. ¿Cuál es el primer paso al identificar el problema de un estudiante?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                            <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-120 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Proponer soluciones inmediatas'>Proponer soluciones inmediatas</option>
                                        <option value='Escuchar activamente al estudiante'>Escuchar activamente al estudiante</option>
                                        <option value='Informar a los padres sin consultar al estudiante'>Informar a los padres sin consultar al estudiante</option>
                                        <option value='Revisar el expediente académico'>Revisar el expediente académico</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>2. ¿Qué estrategia usarías para motivar a un estudiante desinteresado?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <input
                                type="text"
                                className="mt-2 p-3 w-120 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Escribe tu respuesta"
                                />
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>3. Si un estudiante tiene dificultades en matemáticas, ¿cuál sería tu acción inmediata?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                            <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Regañarlo por su bajo rendimiento'>Regañarlo por su bajo rendimiento</option>
                                        <option value='Proporcionarle recursos adicionales, como ejercicios prácticos'>Proporcionarle recursos adicionales, como ejercicios prácticos</option>
                                        <option value='Cambiar su enfoque hacia otra materia'>Cambiar su enfoque hacia otra materia</option>
                                        <option value='Decirle que es cuestión de práctica'>Decirle que es cuestión de práctica</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>4. Define "escucha activa" en tus propias palabras.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <input
                                type="text"
                                className="mt-2 p-3 w-120 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Escribe tu respuesta"
                                />
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>5. ¿Qué harías si un estudiante no muestra interés en mejorar?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-120 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Ignorarlo y centrarte en otros estudiantes'>Ignorarlo y centrarte en otros estudiantes</option>
                                        <option value='Investigar las causas subyacentes y buscar soluciones con él'>Investigar las causas subyacentes y buscar soluciones con él</option>
                                        <option value='Aplicar castigos para que se motive'>Aplicar castigos para que se motive</option>
                                        <option value='Dejarlo a cargo de otro asesor'>Dejarlo a cargo de otro asesor</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Siguiente
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 27 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">Prueba académica</h2>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>6. ¿Cómo manejarías un conflicto entre dos estudiantes?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <input
                                type="text"
                                className="mt-2 p-3 w-124 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Escribe tu respuesta aqui"
                                />
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>7. Completa la frase: "Un buen asesor debe ser ______."</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                            <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-124 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Autoritario'>Autoritario</option>
                                        <option value='Empático'>Empático</option>
                                        <option value='Distante'>Distante</option>
                                        <option value='Impersonal'>Impersonal</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>8. ¿Cuál es la mejor forma de evaluar el progreso de un estudiante?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                            <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-124 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Aplicar exámenes semanales'>Aplicar exámenes semanales</option>
                                        <option value='Observar su desempeño general y recopilar retroalimentación'>Observar su desempeño general y recopilar retroalimentación</option>
                                        <option value='Compararlo con otros estudiantes'>Compararlo con otros estudiantes</option>
                                        <option value='Presionarlo para obtener mejores resultados'>Presionarlo para obtener mejores resultados</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>9. Describe un caso en el que tu intervención como asesor sería crítica.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <input
                                type="text"
                                className="mt-2 p-3 w-124 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Escribe tu respuesta aqui"
                                />
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>10. ¿Qué harías si un estudiante confiesa tener problemas personales graves?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Ignorar el problema y seguir con los temas académicos'>Ignorar el problema y seguir con los temas académicos</option>
                                        <option value='Escuchar con empatía y referirlo a un profesional si es necesario'>Escuchar con empatía y referirlo a un profesional si es necesario</option>
                                        <option value='Decirle que no puedes ayudarle'>Decirle que no puedes ayudarle</option>
                                        <option value='Hablar directamente con sus padres sin su consentimiento'>Hablar directamente con sus padres sin su consentimiento</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            <button
                            onClick={prevStep}    
                            className="w-38 px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Anterior
                                </button>
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Siguiente
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 28 && (
                    <form onSubmit={nextStep}>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">Prueba académica</h2>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>11. ¿Qué herramientas tecnológicas usarías para asesorar?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <input
                                type="text"
                                className="mt-2 p-3 w-133 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Escribe tu respuesta aqui"
                                />
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>12. ¿Qué actitud es más importante al dar retroalimentación?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                            <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-133 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Ser crítico para que el estudiante mejore'>Ser crítico para que el estudiante mejore</option>
                                        <option value='Ser constructivo y destacar áreas de mejora junto con logros'>Ser constructivo y destacar áreas de mejora junto con logros</option>
                                        <option value='Ser permisivo y evitar dar críticas'>Ser permisivo y evitar dar críticas</option>
                                        <option value='Mostrar indiferencia'>Mostrar indiferencia</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>13. ¿Cómo equilibrarías la disciplina y la motivación?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <input
                                type="text"
                                className="mt-2 p-3 w-133 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Escribe tu respuesta aqui"
                                />
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>14. ¿Qué harías si un estudiante interrumpe constantemente la clase?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                            <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Ignorarlo para no afectar a otros'>Ignorarlo para no afectar a otros</option>
                                        <option value='Hablar con él en privado para entender la causa del comportamiento'>Hablar con él en privado para entender la causa del comportamiento</option>
                                        <option value='Expulsarlo de la sesión'>Expulsarlo de la sesión</option>
                                        <option value='Regañarlo públicamente para que aprenda'>Regañarlo públicamente para que aprenda</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>15. ¿Qué importancia tiene la empatía en el rol de asesor?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <input
                                type="text"
                                className="mt-2 p-3 w-133 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Escribe tu respuesta aqui"
                                />
                            </div>
                        </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            <button
                            onClick={prevStep}    
                            className="w-38 px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Anterior
                                </button>
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Siguiente
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    {step === 29 && (
                    <form>
                        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">Prueba académica</h2>
                        <div className='border-4 border-[#3818c3]'>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>16. ¿Cómo manejarías la presión de trabajar con varios estudiantes al mismo tiempo?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                            <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Priorizar casos según su urgencia y delegar tareas si es necesario'>Priorizar casos según su urgencia y delegar tareas si es necesario</option>
                                        <option value='Trabajar de forma rápida y superficial'>Trabajar de forma rápida y superficial</option>
                                        <option value='Ignorar a los menos problemáticos'>Ignorar a los menos problemáticos</option>
                                        <option value='Centrarse solo en un estudiante hasta resolver su caso'>Centrarse solo en un estudiante hasta resolver su caso</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>17. ¿Qué harías si un estudiante rechaza tu ayuda constantemente?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <input
                                type="text"
                                className="mt-2 p-3 w-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Escribe tu respuesta aqui"
                                />
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>18. ¿Cuál es el principal objetivo de un asesor educativo?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                            <div>
                                    <select
                                        id="pais"
                                        name="pais"
                                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option selected value="">Selecciona una opción</option>
                                        <option value='Resolver problemas administrativos'>Resolver problemas administrativos</option>
                                        <option value='Ayudar a los estudiantes a alcanzar su máximo potencial académico y personal'>Ayudar a los estudiantes a alcanzar su máximo potencial académico y personal</option>
                                        <option value='Garantizar que todos obtengan las mejores calificaciones'>Garantizar que todos obtengan las mejores calificaciones</option>
                                        <option value='Cumplir con los requisitos de la institución'>Cumplir con los requisitos de la institución</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>19. Describe una técnica creativa que usarías para enseñar un tema complejo.</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <input
                                type="text"
                                className="mt-2 p-3 w-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Escribe tu respuesta aqui"
                                />
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-2 flex items-center">
                                <p className='text-justify'>20. ¿Qué significa ser un líder para tus estudiantes?</p>
                            </div>

                            <div className='flex flex-row space-x-5'>
                                <input
                                type="text"
                                className="mt-2 p-3 w-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Escribe tu respuesta aqui"
                                />
                            </div>
                        </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6 mt-6 ml-6 mr-6">
                            <div className="flex-1 flex items-center">
                            <button
                            onClick={prevStep}    
                            className="w-38 px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Anterior
                                </button>
                            </div>

                            <div className='flex justify-center items-center'>
                                <button
                                type="submit"
                                className="w-full px-10 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Finalizar
                                </button>
                            </div>
                        </div>
                    </form>
                    )}
                    </div>
                </>
  )
}
