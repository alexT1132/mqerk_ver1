import Topbar from "../../components/NavLogin";
import { useAsesor } from "../../context/AsesorContext";
import { usePreventPageReload } from "../../NoReload.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import { TablaEvaluacion } from "../../components/DashboardComp.jsx";


export function Resultado() {
  

    usePreventPageReload();
  
    const {datos1} = useAsesor();

    const navigate = useNavigate();

    const location = useLocation();
    const { ResultadoBigFive, ResultadoDASS, ResultadoZavic, ResultadoBarOn, ResultadoWais, ResultadoAcademica } = location.state || {};

    const mensaje7 = (
        ResultadoBigFive > 65 && ResultadoDASS < 50 ? "Bien" : "Mal"
    );

    const mensaje1 = ResultadoBigFive > 65 ? "Bien" : "Mal";
    const colorMensaje1 = mensaje1 === "Bien" ? "text-green-500" : "text-red-500";

    const mensaje2 = ResultadoDASS < 50 ? "Bien" : "Mal";
    const colorMensaje2 = mensaje2 === "Bien" ? "text-green-500" : "text-red-500";

    const mensaje3 = ResultadoZavic > 80 ? "Bien" : "Mal";
    const colorMensaje3 = mensaje3 === "Bien" ? "text-green-500" : "text-red-500";

     const mensaje4 = ResultadoBarOn > 90 ? "Bien" : "Mal";
    const colorMensaje4 = mensaje4 === "Bien" ? "text-green-500" : "text-red-500";

    const mensaje5 = ResultadoWais >= 150 ? "Bien" : "Mal";
    const colorMensaje5 = mensaje5 === "Bien" ? "text-green-500" : "text-red-500";

    const mensaje6 = ResultadoAcademica >= 160 ? "Bien" : "Mal";
    const colorMensaje6 = mensaje6 === "Bien" ? "text-green-500" : "text-red-500";

    const mensajefinal = (
        ResultadoZavic > 80 &&
        ResultadoBarOn > 90 &&
        ResultadoWais >= 150 &&
        ResultadoAcademica >= 160
    ) ? "Bien" : "Mal";

    const total = ResultadoBigFive + ResultadoDASS + ResultadoZavic + ResultadoBarOn + ResultadoWais + ResultadoAcademica;


  return (
    <>
        <Topbar/>
        <div className={`flex flex-col gap-7 justify-center items-center mx-2 my-2 sm:my-5 sm:mx-5 md:mx-10 lg:mx-20`}>
        <h1 className={`font-bold text-center text-2xl`}>{datos1.nombres} {datos1.apellidos}</h1>

        <h2 className={`font-semibold text-center`}>
            INFORME EJECUTIVO DE RESULTADOS: EVALUACIÓN INTEGRAL
            <p className={`font-normal text-justify`}>
            El presente informe consolida los resultados obtenidos en una serie de pruebas psicológicas, académicas y técnicas
            aplicadas para evaluar las competencias, habilidades y aptitudes del candidato(a). Este análisis exhaustivo tiene como
            finalidad determinar la alineación del perfil del evaluado con los estándares requeridos para desempeñar exitosamente el
            rol de asesor(a) educativo, destacando fortalezas y áreas clave para el desarrollo profesional.
            </p>
        </h2>
        <p className={`text-justify text-sm font-semibold sm:text-sm md:text-sm lg:font-thin`}>
            {mensaje7 === "Bien" ? "" : "Con base en los indicadores arrojados por las primeras pruebas aplicadas, se recomienda realizar una valoración psicológica complementaria para asegurar el adecuado bienestar personal y profesional."}
        </p>
        <table className="border border-gray-400 text-sm">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border border-gray-400 px-4 py-2 text-center">Test/Prueba</th>
                    <th className="border border-gray-400 px-4 py-2 text-center">Puntaje Obtenido</th>
                    <th className="border border-gray-400 px-4 py-2 text-center">Evaluación</th>
                  </tr>
                </thead>
                <tbody>
                    <tr>
                      <td className="border border-gray-400 px-4 py-2">Test de Personalidad</td>
                      <td className={`border border-gray-400 px-4 py-2 text-center ${colorMensaje1}`}>{ResultadoBigFive}</td>
                      <td className="border border-gray-400 px-4 py-2">{mensaje1 === "Bien" ? "Compatible con el perfil de asesor educativo" : "El perfil presenta áreas de oportunidad que actualmente no se alinean con los requerimientos del rol de asesor educativo."}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-400 px-4 py-2">Test DASS-21</td>
                      <td className={`border border-gray-400 px-4 py-2 text-center ${colorMensaje2}`}>{ResultadoDASS}</td>
                      <td className="border border-gray-400 px-4 py-2">{mensaje2 === "Bien" ? "Dentro de rangos normales" : "Los resultados indican que podrías estar enfrentando algunas cargas emocionales. Sería útil considerar apoyo profesional para fortalecer tu bienestar."}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-400 px-4 py-2">Test de Zavic</td>
                      <td className={`border border-gray-400 px-4 py-2 text-center ${colorMensaje3}`}>{ResultadoZavic}</td>
                      <td className="border border-gray-400 px-4 py-2">{mensaje3 === "Bien" ? "Valores alineados con liderazgo y ética profesional" : "Se identifican diferencias entre los valores actuales y aquellos asociados al liderazgo y la ética profesional requeridos para el rol."}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-400 px-4 py-2">Test de Inteligencia Emocional</td>
                      <td className={`border border-gray-400 px-4 py-2 text-center ${colorMensaje4}`}>{ResultadoBarOn}</td>
                      <td className="border border-gray-400 px-4 py-2">{mensaje4 === "Bien" ? "Adecuada capacidad de gestión emocional" : "Se observan áreas de mejora en la gestión emocional, importantes para un entorno educativo."}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-400 px-4 py-2">Test de WAIS</td>
                      <td className={`border border-gray-400 px-4 py-2 text-center ${colorMensaje5}`}>{ResultadoWais}</td>
                      <td className="border border-gray-400 px-4 py-2">{mensaje5 === "Bien" ? "Inteligencia superior al promedio" : "Los resultados obtenidos se encuentran por debajo del rango esperado para este tipo de función, lo cual puede afectar el desempeño en ciertas tareas cognitivas."}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-400 px-4 py-2">Prueba Académica</td>
                      <td className={`border border-gray-400 px-4 py-2 text-center ${colorMensaje6}`}>{ResultadoAcademica}</td>
                      <td className="border border-gray-400 px-4 py-2">{mensaje6 === "Bien" ? "Excelencia en habilidades técnicas y académicas" : "El puntaje obtenido muestra que hay áreas por reforzar. Con preparación adicional, podrías mejorar significativamente tu desempeño académico."}</td>
                    </tr>
                  <tr className="font-semibold">
                    <td className="border border-gray-400 px-4 py-2 text-center uppercase">TOTAL EN PUNTOS</td>
                    <td className="border border-gray-400 px-4 py-2 text-center">{total}</td>
                    <td className="border border-gray-400 px-4 py-2 text-center uppercase">{mensajefinal === "Bien" ? "ACEPTADO" : "RECHAZADO"}</td>
                  </tr>
                </tbody>
              </table>

        <div className={`flex justify-end w-full`}>
            {mensajefinal === "Bien" ? (
                <button className="bg-purple-700 h-fit hover:bg-purple-800 text-white font-bold cursor-pointer py-2 px-4 rounded-lg transition-colors duration-300">
                    Inicia Tramite
                </button>
            ) : (
                <button onClick={() => navigate('/index')} className="bg-purple-700 h-fit hover:bg-purple-800 text-white font-bold cursor-pointer py-2 px-4 rounded-lg transition-colors duration-300">
                    Abandonar Proceso
                </button>
            )}
        </div>

        <footer>
            <p className={`text-justify text-sm font-semibold sm:text-sm md:text-sm lg:font-thin`}>
                {mensajefinal === "Mal" ? "❌ Lamentamos informarle que en esta ocasión no cumple con el perfil necesario para el puesto de asesor educativo. Le agradecemos su tiempo y le deseamos éxito en sus futuros proyectos." : "✅ ¡Felicidades! Usted ha sido aceptado para el puesto de asesor educativo. Los resultados obtenidos reflejan que posee las competencias y valores que buscamos. Nos entusiasma contar con usted en nuestro equipo para impactar positivamente en la vida de nuestros estudiantes."}
            </p>
        </footer>
        </div>
    </>
  )
}