import React from "react";
import {
    // Componentes para seccion mi perfil
    DatosPersonales,
    DatosAcademicos,
    DatosProfesionales,
    TarjetaPerfil,
    BtnFuncion,
    Documentacion,
    Lineamientos,
    Contrato,

    // Componentes para el dashborar
    Container,
    ModalCursos,
    // TarjetaPerfil,
    BtnCursoActivo,
    Analiticas
    } from "../../components/DashboradComp.jsx";
import Persona from '../../assets/Persona.jpg'


// Este archivo tiene como objetivo armar las secciones, sin incluir
// el topbar y/o el sidebar, la pagina completa se arma en el archivo
// Asesor.jsx

export function Dashboard(){
    return(
        <div className="flex flex-col gap-y-20 w-full p-10">
        <div className="flex">
        <Container SeccionDashboard={'Cursos Activos'} ModalCursos={<ModalCursos/>} Contenido={<BtnCursoActivo/>}/>
        <TarjetaPerfil/>
        </div>

        <Container SeccionDashboard={'Analíticas'} Contenido={<Analiticas TituloTabla1={'Rendimiento'} TituloTabla2={'Tareas entregadas'}/>}/>
        </div>
    )
}


export function MiPerfil(){
    return(

        <>
            <div className="flex w-full justify-center">
            <DatosPersonales
            Correo={'darianreyesromero@hotmail.com'}
            Direccion={'18 de marzo entre morelos y aldama'}
            Municipio={'San Juan Bautista Tuxtepec'}
            Numero={'2871324476'}
            Nacimiento={'21/02/2000'}
            Nacionalidad={'Mexico'}
            Genero={'Masculino'}
            EstadoCivil={'Union Libre'}
            RFC={'RERD000121QB7'}
            
            
            />
            </div>

            <div className='flex w-full justify-evenly mb-20'>

            <div className="flex items-baseline justify-evenly w-full pt-20">
            <DatosAcademicos
            NivelEstudios={'Universidad'}
            Titulo={'Ing. Sistemas Computacionales'}
            Institucion={'Instituto Tecnologico de Tuxtepec'}
            Graduacion={'2023'}
            Idiomas={'Español e inglés'}
            Disponibilidad={'Si'}
            Horario={'08:00-17:00'}
            Certificaciones={'Ninguna'}
            
            />

            <DatosProfesionales
            Experiencia={"No"}
            ExperienciaAsesorias={'no'}
            Funcion={'Administrador'}
            Plataformas={'Google Meet, Google Classroom'}
            Institucion={'MQerqAcademy'}
            Area={'Tecnologias TI'}
            Puesto={'Desarrollador web FrontEnd'}
            
            />
            </div>

            <aside className="flex flex-col items-end gap-y-7">
            <TarjetaPerfil
            src={Persona}
            Ingreso={'2023'}
            cantidadCursos={'3'}
            cantidadCertificados={'3'}
            cantidadEstudiantes={'40'}
            cantidadGeneraciones={'2'}
            
            />

            <BtnFuncion funcion='Editar perfil'/>

            </aside>

            

            </div>
            <Documentacion/>

            <Lineamientos/>

            <Contrato/>
            


            </>
    )
}