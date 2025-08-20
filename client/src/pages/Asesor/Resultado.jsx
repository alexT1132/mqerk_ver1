import Topbar from "../../components/NavLogin";
import { useAsesor } from "../../context/AsesorContext";
import { usePreventPageReload } from "../../NoReload.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from 'react';
// import { TablaEvaluacion } from "../../components/DashboardComp.jsx"; // (No usado por ahora)


export function Resultado() {
  usePreventPageReload();
  const { datos1, preregistroId, saveTestResults } = useAsesor();
  const navigate = useNavigate();
  const location = useLocation();
  const initialState = location.state || {};
  const [scores, setScores] = useState(()=>({
    bigfive: initialState.ResultadoBigFive,
    dass: initialState.ResultadoDASS,
    zavic: initialState.ResultadoZavic,
    baron: initialState.ResultadoBarOn,
    wais: initialState.ResultadoWais,
    academica: initialState.ResultadoAcademica
  }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const savedRef = useRef(false);

  // Guardar si venimos recién del test
  useEffect(()=>{
    if(!preregistroId) return;
    if(scores.bigfive == null || scores.dass == null) return; // incompleto
    if(savedRef.current) return;
    // Persistir resultados
    (async()=>{
      try {
        setLoading(true); setError(null);
        await saveTestResults({
          bigfive_total: scores.bigfive,
          dass21_total: scores.dass,
          zavic_total: scores.zavic,
          baron_total: scores.baron,
            wais_total: scores.wais,
            academica_total: scores.academica
        });
        savedRef.current = true;
      } catch(e){
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [preregistroId, scores]);

  // Si recarga sin location.state intentar cargar del backend
  useEffect(()=>{
    if(!preregistroId) return;
    if(scores.bigfive != null) return; // ya tenemos
    (async()=>{
      try {
        setLoading(true); setError(null);
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:1002'}/api/asesores/tests/${preregistroId}`, { credentials:'include' });
        if(res.status === 404){
          navigate('/test');
          return;
        }
        const body = await res.json();
        const r = body.resultados;
        setScores({
          bigfive: r.bigfive_total,
          dass: r.dass21_total,
          zavic: r.zavic_total,
          baron: r.baron_total,
          wais: r.wais_total,
          academica: r.academica_total
        });
        savedRef.current = true;
      } catch(e){
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [preregistroId]);

  // Derivar métricas
  const ResultadoBigFive = scores.bigfive ?? 0;
  const ResultadoDASS = scores.dass ?? 0;
  const ResultadoZavic = scores.zavic ?? 0;
  const ResultadoBarOn = scores.baron ?? 0;
  const ResultadoWais = scores.wais ?? 0;
  const ResultadoAcademica = scores.academica ?? 0;

  // ====== Subescalas DASS (si vienen del estado de navegación). Si no existen, se ignoran.
  const dassDep = (location.state && location.state.dassDep) || null;
  const dassAnx = (location.state && location.state.dassAnx) || null;
  const dassStr = (location.state && location.state.dassStr) || null;
  const dassDepCat = (location.state && location.state.dassDepCat) || null;
  const dassAnxCat = (location.state && location.state.dassAnxCat) || null;
  const dassStrCat = (location.state && location.state.dassStrCat) || null;
  // Helper para clasificar si llegan solo valores y no categorías
  const classifyDass = (type, score)=>{
    if(score == null) return null;
    const ranges = type==='D'
      ? [[0,9,'Normal'],[10,13,'Mild'],[14,20,'Moderate'],[21,27,'Severe'],[28,200,'Extremely Severe']]
      : type==='A'
        ? [[0,7,'Normal'],[8,9,'Mild'],[10,14,'Moderate'],[15,19,'Severe'],[20,200,'Extremely Severe']]
        : [[0,14,'Normal'],[15,18,'Mild'],[19,25,'Moderate'],[26,33,'Severe'],[34,200,'Extremely Severe']];
    const f = ranges.find(r=> score>=r[0] && score<=r[1]);
    return f?f[2]:null;
  };
  const depCat = dassDepCat || (dassDep!=null ? classifyDass('D', dassDep): null);
  const anxCat = dassAnxCat || (dassAnx!=null ? classifyDass('A', dassAnx): null);
  const strCat = dassStrCat || (dassStr!=null ? classifyDass('S', dassStr): null);
  const severeFlag = [depCat, anxCat, strCat].some(c=> c === 'Severe' || c === 'Extremely Severe');

  // Gating psicologico (Big Five + DASS). Si no pasa, no debería aprobar aunque pase los demás.
  // Gating psicologico (Big Five + DASS total + severidad subescalas si disponibles)
  const aptoPsico = (ResultadoBigFive > 65 && ResultadoDASS < 50 && !severeFlag);
  const mensaje7 = aptoPsico ? "Bien" : "Mal"; // mantiene compatibilidad con texto existente
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
  // Decisión final (aprobación pre-registro). Variable única (sin redeclarar).
  const aprobadoFinal = (aptoPsico && ResultadoZavic > 80 && ResultadoBarOn > 90 && ResultadoWais >= 150 && ResultadoAcademica >= 160);
  const mensajefinal = aprobadoFinal ? "Bien" : "Mal";
  const total = ResultadoBigFive + ResultadoDASS + ResultadoZavic + ResultadoBarOn + ResultadoWais + ResultadoAcademica;

  if(!datos1){
    return <div className='p-10 text-center'>Cargando perfil...</div>;
  }

  return (
    <>
      <Topbar/>
      <div className={`flex flex-col gap-7 justify-center items-center mx-2 my-2 sm:my-5 sm:mx-5 md:mx-10 lg:mx-20`}>
        <h1 className={`font-bold text-center text-2xl`}>{datos1.nombres} {datos1.apellidos}</h1>
        {loading && <p className='text-sm text-gray-500'>Guardando / cargando resultados...</p>}
        {error && <p className='text-sm text-red-600'>Error: {error}</p>}
        <h2 className={`font-semibold text-center`}>
          INFORME EJECUTIVO DE RESULTADOS: EVALUACIÓN INTEGRAL
          {aprobadoFinal && (
            <p className={`font-normal text-justify`}>
              El presente informe consolida los resultados obtenidos en una serie de pruebas psicológicas, académicas y técnicas
              aplicadas para evaluar las competencias, habilidades y aptitudes del candidato(a). Este análisis tiene como
              finalidad determinar la alineación del perfil con los estándares requeridos para el rol de asesor(a) educativo.
            </p>
          )}
        </h2>
        <p className={`text-justify text-sm font-semibold sm:text-sm md:text-sm lg:font-thin`}>
          {mensaje7 === "Bien" ? "" : "Con base en los indicadores arrojados por las primeras pruebas aplicadas, se recomienda realizar una valoración psicológica complementaria para asegurar el adecuado bienestar personal y profesional."}
        </p>
  {aprobadoFinal && (
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
  )}
  {aprobadoFinal && (dassDep!=null || dassAnx!=null || dassStr!=null) && (
          <div className="w-full mt-4">
            <h3 className="font-semibold mb-2 text-sm">Detalle DASS-21 (Subescalas)</h3>
            <table className="border border-gray-400 text-xs w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-2 py-1">Subescala</th>
                  <th className="border px-2 py-1">Puntaje (x2)</th>
                  <th className="border px-2 py-1">Categoría</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-2 py-1">Depresión</td>
                  <td className="border px-2 py-1 text-center">{dassDep!=null? dassDep : '-'}</td>
                  <td className={`border px-2 py-1 text-center ${depCat && (depCat==='Severe'||depCat==='Extremely Severe')? 'text-red-600 font-semibold':''}`}>{depCat||'-'}</td>
                </tr>
                <tr>
                  <td className="border px-2 py-1">Ansiedad</td>
                  <td className="border px-2 py-1 text-center">{dassAnx!=null? dassAnx : '-'}</td>
                  <td className={`border px-2 py-1 text-center ${anxCat && (anxCat==='Severe'||anxCat==='Extremely Severe')? 'text-red-600 font-semibold':''}`}>{anxCat||'-'}</td>
                </tr>
                <tr>
                  <td className="border px-2 py-1">Estrés</td>
                  <td className="border px-2 py-1 text-center">{dassStr!=null? dassStr : '-'}</td>
                  <td className={`border px-2 py-1 text-center ${strCat && (strCat==='Severe'||strCat==='Extremely Severe')? 'text-red-600 font-semibold':''}`}>{strCat||'-'}</td>
                </tr>
              </tbody>
            </table>
            {severeFlag && (
              <p className="text-xs text-red-700 mt-2">Filtro aplicado: presencia de nivel Severe o Extremely Severe en subescala DASS bloquea la aprobación psicométrica.</p>
            )}
          </div>
        )}
        <div className="w-full mt-6 flex flex-col gap-4">
          {aprobadoFinal ? (
            <>
              <div className="p-4 border rounded bg-green-50 text-sm text-green-800">
                Pre-evaluación aprobada. Continúa con el registro completo para generar tus credenciales.
              </div>
              <button
                onClick={()=> navigate('/registro_asesor', { state: { aprobadoFinal: true }})}
                className="self-end bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Completar Registro
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-4 w-full">
              <div className="p-4 border rounded bg-red-50 text-sm text-red-700">
                Gracias por completar la evaluación. En esta ocasión tu perfil no continúa en el proceso. Te invitamos a postular nuevamente en el futuro.
              </div>
              <button onClick={()=> navigate('/index')} className="self-end bg-gray-700 hover:bg-gray-800 text-white text-sm font-semibold py-2 px-4 rounded-lg">Regresar al inicio</button>
            </div>
          )}
          {!aptoPsico && (
            <p className="text-xs text-red-600 font-medium">Filtro psicométrico no superado.</p>
          )}
        </div>
  {/* Se eliminó lógica de finalización directa; ahora se continúa a registro completo */}
        <footer>
          {aprobadoFinal ? (
            <p className={`text-justify text-sm font-semibold sm:text-sm md:text-sm lg:font-thin`}>
              ✅ ¡Felicidades! Perfil aceptado para continuar. Completa tu registro para generar credenciales.
            </p>
          ) : (
            <p className={`text-justify text-sm font-semibold sm:text-sm md:text-sm lg:font-thin`}>
              ❌ Gracias por tu interés. En esta ocasión no cumples con el perfil requerido. Te deseamos éxito en tus próximos proyectos.
            </p>
          )}
        </footer>
      </div>
    </>
  );
}