import Navbar from "../../components/NavBar";
import { SideBarDesktop, SideBarsm } from "../../components/sidebar";
import React from "react";
import { MiPerfil } from "./Paginas";

export function PerfilAsesor(){
    return(
    <>
        <Navbar/>
        <SideBarDesktop toMiPerfil={'/PerfilAsesor'}/>
        

        <div className="flex flex-col flex-wrap justify-center items-center gap-8 p-10 px-25">
        <MiPerfil />
            
        </div>

            </>

    );
}










