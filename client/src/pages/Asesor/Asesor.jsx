import Navbar from "../../components/NavBar";
import { SideBarDesktop } from "../../components/SideBar.jsx";
import { MiPerfil, Dashboard } from "./Secciones";


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
};


export const DashboardAsesor =() =>{
    return(
        <>
        <Navbar/>
        <div className={`hidden sm:flex`}>
        <SideBarDesktop/>
        </div>

        <div className="flex flex-col flex-wrap justify-center items-center w-full gap-8 sm:p-10 sm:px-25">
        <Dashboard/>
        </div>

        </>
    );
};

export const DashboardAsesorCalificaciones=() =>{

    return(
        <>
        
        
        </>
    )
}