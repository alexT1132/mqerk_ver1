import Navbar from "../../components/NavBar";
import { SideBarDesktop, SideBarsm } from "../../components/sidebar";
import React from "react";
import { MiPerfil, Dashboard } from "./Secciones";

// Esta pagina tiene como proposito armar la pagina completa, importando
// los componentes ya armados en los archivos:
// Paginas.jsx
// DashboardComp.jsx

export function PerfilAsesor(){
    return(
    <>
        <Navbar/>
        <SideBarDesktop toMiPerfil={'/PerfilAsesor'}/>
        

        <div className="flex flex-col flex-wrap justify-center items-center sm:gap-8 sm:p-10 sm:px-25">
        <MiPerfil />
            
        </div>

            </>

    );
}


export function DashboardAsesor(){
    return(
        <>
        <Navbar/>
        <SideBarDesktop/>

        <div className="flex flex-col flex-wrap justify-center items-center gap-8 p-10 px-25">
        <Dashboard/>
        </div>

        </>
    )
}