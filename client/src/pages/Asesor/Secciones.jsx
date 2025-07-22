import {useEffect, useState} from 'react';
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

    // Componentes para el dashboard
    Container,
    // TarjetaPerfil,
    BtnCursoActivo,
    Analiticas



    } from "../../components/DashboradComp.jsx";


import Persona from '../../assets/Persona.jpg';

import { BtnDesplegable, ActivityModal, ModalCursos, TablaAsignacionActividades, TablaEstudiantes } from "../../components/CursosComp.jsx";



// Este archivo tiene como objetivo armar las secciones, sin incluir
// el topbar y/o el sidebar, la pagina completa se arma en el archivo
// Asesor.jsx

export function Dashboard({src, TituloAsesor, Nombre, Ingreso, cantidadCursos, cantidadEstudiantes, cantidadCertificados, cantidadGeneraciones}){
    return(
        <div className="flex flex-col w-full items-center md:items-stretch gap-y-20 p-10">
        <div className="flex flex-col md:flex-row flex-wrap gap-3 sm:flex-nowrap">
        <Container SeccionDashboard={'Cursos Activos'} ModalCursos={<ModalCursos/>} Contenido={<BtnCursoActivo/>}/>
        <TarjetaPerfil src={src} TituloAsesor={TituloAsesor} Nombre={Nombre} Ingreso={Ingreso} cantidadCursos={cantidadCursos} cantidadEstudiantes={cantidadEstudiantes} cantidadCertificados={cantidadCertificados} cantidadGeneraciones={cantidadGeneraciones}/>
        </div>

        <Container SeccionDashboard={'Analíticas'} Contenido={<Analiticas TituloTabla1={'Rendimiento'} TituloTabla2={'Tareas entregadas'}/>}/>
        </div>
    );
};


export function MiPerfil(){
    return(

        <>
        <div className={`flex flex-wrap justify-center`}>
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

            <div className='flex flex-col gap-x-4 lg:flex-row sm:w-full sm:justify-evenly pb-10 sm:pb-8'>

            <div className="flex flex-col gap-x-4 gap-y-10 md:flex-row items-center md:items-baseline md:justify-evenly py-8 md:py-10 max-sm:gap-y-10">
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

            <aside className="flex flex-col items-center lg:items-end gap-y-2 md:gap-y-7">
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

            <div className="flex flex-col gap-4">
            <Documentacion/>

            <Lineamientos/>

            <Contrato/>
            
            </div> 

            </>
    );
};


export function MisCursos(){

    const handleOpenModal = () => {
        if (selected === "Actividades") {
            setIsModalOpen(true);
        } else if (selected === "Quizt") {
            alert("Solo puedes crear actividades cuando 'Actividades' está seleccionado.");
        } else if (selected === "Simuladores") {
            alert("Solo puedes crear actividades cuando 'Actividades' está seleccionado.");
        }else {
            alert("Selecciona una opción válida.");
        }
    };

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [selected, setSelected] = useState("");
    
    
    return(
        <div className="flex flex-col justify-center items-center gap-y-15">
        
        <div className={`flex items-center justify-center gap-x-2 sm:justify-normal w-full`}>
        <BtnDesplegable selected={selected} setSelected={setSelected}/>
        <ModalCursos onClick={handleOpenModal}/>

        <ActivityModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}/>
        </div>

        <TablaAsignacionActividades/>
        <TablaEstudiantes/>

        </div>
    );
};