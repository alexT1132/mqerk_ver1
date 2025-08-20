import { useState } from "react";
import Navbar from "../../components/NavBar";
import { SideBar } from "../../components/SideBar.jsx";
import { MiPerfil, Dashboard, MisCursos, ActividadesAsesor, QuiztAsesor, SimuladoresAsesor, CrearQuiztAsesor } from "./Secciones";
import { BtnDesplegable } from "../../components/CursosComp.jsx";


export function PerfilAsesor(){
    return(
    <>
        <Navbar/>
        <SideBar asesor/>
        

        <div className="flex flex-col sm:mx-25 my-5 items-center">
        <MiPerfil />
            
        </div>

    </>

    );
};


export const DashboardAsesor =() =>{
    return(
        <>
        <Navbar/>
        <div className={`hidden sm:flex`}>
        <SideBar asesor/>
        </div>

        <div className="flex flex-col flex-wrap justify-center items-center w-full gap-8 sm:p-10 md:px-15">
        <Dashboard/>
        </div>

        </>
    );
};


export const DashboardCurso=() =>{

    return(
        <>
        <Navbar/>
        <div>
        <SideBar asesor/>

        <div className="flex flex-col w-full gap-8 p-2 sm:p-5 sm:px-21">

        <MisCursos/>

        </div>
        </div>
        <div>

        </div>
        
        </>
    );
};

export const Actividades=()=>{
    return(
        <>
        <Navbar/>


        <SideBar asesor/>
        <div className="flex flex-col justify-center items-center gap-y-15">
        <ActividadesAsesor/>
        </div>

        </>
    );
};

export const Quizt=()=>{
    return(
        <>
        <Navbar/>
        <SideBar asesor/>
        <div className="flex flex-col justify-center items-center gap-y-15">
        <QuiztAsesor/>
        </div>

        </>
    );
};

export const CrearQuizt=()=>{
    return(
        <>
        <Navbar/>
        <SideBar asesor/>
        <div className="flex flex-col justify-center items-center gap-y-15">
        <CrearQuiztAsesor/>
        </div>

        </>
    );
};

export const Simuladores=()=>{
    return(
        <>
        <Navbar/>
        <SideBar asesor/>
        <div className="flex flex-col justify-center items-center gap-y-15">
        <SimuladoresAsesor/>
        </div>

        </>
    );
};

// Placeholder component for asesorias route (to be implemented with actual content)
export const Asesorias = () => {
    return (
        <>
            <Navbar />
            <SideBar asesor />
            <div className="flex flex-col justify-center items-center gap-y-15 p-6 w-full">
                <h2 className="text-2xl font-bold bg-linear-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">Asesorías</h2>
                <p className="text-gray-600 text-center max-w-xl">Sección en construcción. Aquí podrás gestionar y visualizar tus asesorías programadas, historial y métricas.</p>
            </div>
        </>
    )
};