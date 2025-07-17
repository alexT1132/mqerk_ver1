import Navbar from "../../components/NavBar";
import { SideBar } from "../../components/SideBar.jsx";
import { MiPerfil, Dashboard, MisCursos } from "./Secciones";


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

        <MisCursos/>
        </div>
        <div>

        </div>
        
        </>
    )
}