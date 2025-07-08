import React from "react";
import { Link } from "react-router-dom";

function ElementoSideBar({Icono, NombreElemento, to}){
  return(
    <>
      <li className="group flex justify-start items-center h-fit gap-1.5">
        <Link to={to} className="items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-indigo-100 group">
          {Icono}
        </Link>
        <div className="flex items-center h-fit bg-gray-700 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-md z-10">
          {NombreElemento}
        </div>
      </li>
    </>
  )
}

export function SideBarDesktopAdmin1() {
  const svgColor='#3818c3';
  const svgColorLogout='#EA3323';
  const xmlns = "http://www.w3.org/2000/svg";
  const width='30px';
  const height='30px';

  const LogoInicio=<svg xmlns={xmlns} height={height} viewBox="0 -960 960 960" width={width} fill={svgColor}><path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z"/></svg>;
  
  const LogoComprobantes=<svg xmlns={xmlns} height={height} viewBox="0 -960 960 960" width={width} fill={svgColor}><path d="M320-240h320v-80H320v80Zm0-160h320v-80H320v80ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-800h320l240 240v400q0 33-23.5 56.5T720-80H240Zm280-520v-200H240v640h480v-360H560q-17 0-28.5-11.5T520-560ZM240-800v200-200 640-640Z"/></svg>;
  
  const LogoAlumnos=<svg xmlns={xmlns} height={height} viewBox="0 -960 960 960" width={width} fill={svgColor}><path d="M40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm720 0v-120q0-44-24.5-84.5T666-434q51 6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v120H760ZM360-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm400-160q0 66-47 113t-113 47q-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113ZM120-240h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T440-640q0-33-23.5-56.5T360-720q-33 0-56.5 23.5T280-640q0 33 23.5 56.5T360-560Zm0 320Zm0-400Z"/></svg>;
  
  const LogoValidacionPagos=<svg xmlns={xmlns} height={height} viewBox="0 -960 960 960" width={width} fill={svgColor}><path d="M320-240h320v-80H320v80Zm0-160h320v-80H320v80ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-800h320l240 240v400q0 33-23.5 56.5T720-80H240Zm280-520v-200H240v640h480v-360H560q-17 0-28.5-11.5T520-560ZM240-800v200-200 640-640Z"/></svg>;
  
  const LogoReportesPagos=<svg xmlns={xmlns} height={height} viewBox="0 -960 960 960" width={width} fill={svgColor}><path d="M320-240h320v-80H320v80Zm0-160h320v-80H320v80ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-800h320l240 240v400q0 33-23.5 56.5T720-80H240Zm280-520v-200H240v640h480v-360H560q-17 0-28.5-11.5T520-560ZM240-800v200-200 640-640Z"/></svg>;
  
  const LogoCalendario=<svg xmlns={xmlns} height={height} viewBox="0 -960 960 960" width={width} fill={svgColor}><path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Zm280 240q-17 0-28.5-11.5T440-440q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440q0 17-11.5 28.5T480-400Zm-160 0q-17 0-28.5-11.5T280-440q0-17 11.5-28.5T320-480q17 0 28.5 11.5T360-440q0 17-11.5 28.5T320-400Zm320 0q-17 0-28.5-11.5T600-440q0-17 11.5-28.5T640-480q17 0 28.5 11.5T680-440q0 17-11.5 28.5T640-400ZM480-240q-17 0-28.5-11.5T440-280q0-17 11.5-28.5T480-320q17 0 28.5 11.5T520-280q0 17-11.5 28.5T480-240Zm-160 0q-17 0-28.5-11.5T280-280q0-17 11.5-28.5T320-320q17 0 28.5 11.5T360-280q0 17-11.5 28.5T320-240Zm320 0q-17 0-28.5-11.5T600-280q0-17 11.5-28.5T640-320q17 0 28.5 11.5T680-280q0 17-11.5 28.5T640-240Z"/></svg>;
  
  const LogoEmail=<svg xmlns={xmlns} height={height} viewBox="0 -960 960 960" width={width} fill={svgColor}><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z"/></svg>;
  
  const LogoConfig=<svg xmlns={xmlns} height={height} viewBox="0 -960 960 960" width={width} fill={svgColor}><path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z"/></svg>;
  
  const LogoLogOut=<svg xmlns={xmlns} height={height} viewBox="0 -960 960 960" width={width} fill={svgColorLogout}><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z"/></svg>;

  return (
    <>
      <aside
        className="max-sm:hidden flex flex-col fixed w-[80px] shadow-[4px_0_10px_-2px_rgba(0,0,0,0.3)] z-1"
        aria-label="Sidebar"
      >
        <nav className="h-dvh bg-gray-50">
          <ul className="p-4 pb-2 h-full">
            
            <ElementoSideBar to="/admin1/dashboard" Icono={LogoInicio} NombreElemento='Inicio'/>

            <ElementoSideBar to="/admin1/comprobantes" Icono={LogoComprobantes} NombreElemento='Comprobantes Recibidos'/>

            <ElementoSideBar to="/admin1/lista-alumnos" Icono={LogoAlumnos} NombreElemento='Lista de Alumnos'/>

            <ElementoSideBar to="/admin1/validacion-pagos" Icono={LogoValidacionPagos} NombreElemento='Validación de Pagos'/>

            <ElementoSideBar to="/admin1/reportes-pagos" Icono={LogoReportesPagos} NombreElemento='Reportes de Pagos'/>

            <ElementoSideBar to="/admin1/calendario" Icono={LogoCalendario} NombreElemento='Calendario'/>

            <ElementoSideBar to="/admin1/email" Icono={LogoEmail} NombreElemento='Email'/>

            <ElementoSideBar to="/admin1/configuracion" Icono={LogoConfig} NombreElemento='Configuración'/>

            <div className={`relative translate-y-full`}>
              <ElementoSideBar to="/login" Icono={LogoLogOut} NombreElemento='Cerrar Sesión'/>
            </div>
          </ul>
        </nav>
      </aside>
    </>
  );
}