import Navbar from "../../components/NavBar";
import { SideBarDesktop } from "../../components/SideBar.jsx";
import { MiPerfil, Dashboard } from "./Secciones";


export function PerfilAsesor(){
    return(
    <>
        <Navbar/>
        <SideBarDesktop asesor/>
        

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
        <SideBarDesktop asesor/>
        </div>

        <div className="flex flex-col flex-wrap justify-center items-center w-full gap-8 sm:p-10 md:px-15">
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