import { TablaEvaluacion } from "../../components/DashboradComp";
import Topbar from `../../components/NavLogin.jsx`;
import { BtnFuncion } from "../../components/DashboradComp";
import React from "react";


export const ResultadoAsesor=({area})=>{
    return(
        <>
        <Topbar/>
        <div className={`flex flex-col gap-10 justify-center items-center my-5 mx-20`}>
        <h1 className={`font-bold text-center text-2xl`}>MARIANA RODRIGUEZ PEREZ</h1>

        <h2 className={`font-semibold text-center`}>
            INFORME EJECUTIVO DE RESULTADOS: EVALUACIÓN INTEGRAL
            <p className={`font-normal text-justify`}>
            El presente informe consolida los resultados obtenidos en una serie de pruebas psicológicas, académicas y técnicas
            aplicadas para evaluar las competencias, habilidades y aptitudes del candidato(a). Este análisis exhaustivo tiene como
            finalidad determinar la alineación del perfil del evaluado con los estándares requeridos para desempeñar exitosamente el
            rol de asesor(a) educativo, destacando fortalezas y áreas clave para el desarrollo profesional.
            </p>
        </h2>

        <TablaEvaluacion/>

        <div className={`flex justify-end w-full`}>
        <BtnFuncion funcion={`Iniciar tramite`}/>
        </div>

        <footer className={`mx-40`}>
            <p className={`text-justify text-sm font-thin`}>✅ ¡Felicidades! Usted ha sido aceptado para el puesto de asesor(a) educativo en el área de {area}.
                los resultados obtenidos reflejan que posee las competencias y valores que buscamos.
                Nos entusiasma contar con usted en nuestro equipo para impactar positivamente en la vida de nuestros
                estudiantes
            </p>
        </footer>
        </div>



        </>
    )}