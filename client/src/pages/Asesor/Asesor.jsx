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