import React from "react";
import Navbar from "../../components/NavBar";
import { SideBarDesktopAdmin } from "../../components/SideBar.jsx";
import { BtnPanelAdmin, Container, AnaliticasAdmin, Buscador, TablaAsesores, OrdenarBtn, TablaColaboradores} from "../../components/DashboradComp"



export function DashboardAdm(){
    return(
        <>
        <Navbar/>

        <SideBarDesktopAdmin/>

        <div className="flex flex-col gap-y-10 sm:gap-8 sm:px-25">
                <div className="flex justify-center p-10 gap-x-5">
                    <BtnPanelAdmin Informacion={'Reporte mensual'}/>
                    <BtnPanelAdmin Informacion={'Reporte anual'}/>
                </div>
        
                <div className="flex flex-wrap w-full justify-center gap-5">
                    <BtnPanelAdmin Informacion={'Ingresos'} cantidad={Math.random()}/>
                    <BtnPanelAdmin Informacion={'Egresos'} cantidad={Math.random()}/>
                    <BtnPanelAdmin Informacion={'Usuarios'} cantidad={Math.random()}/>
                    <BtnPanelAdmin Informacion={'Asesores'} cantidad={Math.random()}/>
                    <BtnPanelAdmin Informacion={'Cursos activos'} cantidad={Math.random()}/>
                    <BtnPanelAdmin Informacion={'Actividad diaria'} cantidad={Math.random()}/>
                    <BtnPanelAdmin Informacion={'Nuevos usuarios'} cantidad={Math.random()}/>
                    <BtnPanelAdmin Informacion={'Ingreso anual'} cantidad={Math.random()}/>
                    <BtnPanelAdmin Informacion={'Tasa de retención'} cantidad={Math.random()}/>
                    <BtnPanelAdmin Informacion={'Tasa de abandono'} cantidad={Math.random()}/>
                    <BtnPanelAdmin Informacion={'Bajas'} cantidad={Math.random()}/>
                    <BtnPanelAdmin Informacion={'Número de asesores'} cantidad={Math.random()}/>
                    <BtnPanelAdmin Informacion={'Certificados emitidos'} cantidad={Math.random()}/>
                    <BtnPanelAdmin Informacion={'crecimiento mensual'} cantidad={Math.random()}/>
                    <BtnPanelAdmin Informacion={'crecimiento anual'} cantidad={Math.random()}/>
                </div>
        
                <div className="flex w-full">
                    <Container SeccionDashboard={'Analíticas'} Contenido={<AnaliticasAdmin/>}/>
                </div>
                </div>
        </>
    );
}


export function ListaAsesores(){
    return(
        <>
        <Navbar/>

        <SideBarDesktopAdmin/>
                <div className="flex flex-col pt-10 sm:gap-2 sm:px-25">
    
                <div className="flex justify-between">
                    <div className={`flex items-center justify-start gap-4 mb-2`}>
                        <h2 className={`font-semibold text-2xl`}>Lista de asesores</h2>
                        <OrdenarBtn/>
                    </div>
    
                
                    <Buscador/>
                </div>
    
                <TablaAsesores/>
    
                </div>
    

            </>
        )
}

export function ListaColaboradores(){
    return(
        <>
        <Navbar/>

        <SideBarDesktopAdmin/>
                <div className="flex flex-col pt-10 sm:gap-2 sm:px-25">
    
                <div className="flex justify-between">
                    <div className={`flex items-center justify-start gap-4 mb-2`}>
                        <h2 className={`font-semibold text-2xl`}>Lista de colaboradores</h2>
                        <OrdenarBtn/>
                    </div>
    
                
                    <Buscador/>
                </div>
    
                <TablaColaboradores/>
    
                </div>
    

            </>
    )
}