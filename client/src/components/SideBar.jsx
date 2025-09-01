import { Link } from "react-router-dom";


function ElementoSideBar({Icono, NombreElemento, to}){

  return(
    <>
      <li className="group flex justify-start items-center pointer-events-none h-fit gap-1.5">
        <Link to={to} className="items-center p-2 text-gray-900 rounded-lg pointer-events-auto dark:text-white hover:bg-indigo-100 group">
          {Icono}
        </Link>
        <div className="flex z-2 select-none hover:opacity-0 hover:hidden items-center h-fit bg-gray-700 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-md">
          {NombreElemento}
        </div>
      </li>
    </>
  )
}

export function SideBar({estudiante, asesor, admin}) {


const rutasEstudiante = {
    toInicio: "/estudiante/inicio",
    toMiPerfil: "/perfil",
    toMisCursos: "/cursos",
    toSimuladores: "/simuladores",
    toAsesorias: "/asesorias",
    toCorreo: "/correo",
    toCalendario: "/calendario",
    toReportes: "/reportes",
    toRecursosEducativos: "/recursos",
    toMisPagos: "/pagos",
    toAutenticacion: "/autenticacion",
    toConfiguracion: "/configuracion",
    toCerrarSesion: "/login"
  };

  const rutasAsesor = {
    toInicio: "/asesor/inicio",
    toMiPerfil: "/asesor/perfil",
    toActividades: "/asesor/actividades",
    toQuizt: "/asesor/quizt",
    toMisCursos: "/cursos-asesor",
    toSimuladores: "/asesor/simuladores",
    toAsesorias: "/asesorias-asesor",
    toCorreo: "/correo-asesor",
    toCalendario: "/calendario-asesor",
    toReportes: "/reportes-asesor",
    toRecursosEducativos: "/recursos-asesor",
    toMisPagos: "/pagos-asesor",
  toAutenticacion: "/autenticacion-asesor",
  toFeedback: "/asesor_feedback",
    toConfiguracion: "/configuracion-asesor",
    toCerrarSesion: "/login"
  };

  const rutasAdmin = {
    toInicio: "/inicio-admin",
    toMiPerfil: "/perfil-admin",
    toMisCursos: "/cursos-admin",
    toSimuladores: "/simuladores-admin",
    toAsesorias: "/asesorias-admin",
    toCorreo: "/correo-admin",
    toCalendario: "/calendario-admin",
    toReportes: "/reportes-admin",
    toRecursosEducativos: "/recursos-admin",
    toMisPagos: "/pagos-admin",
    toAutenticacion: "/autenticacion-admin",
    toConfiguracion: "/configuracion-admin",
    toCerrarSesion: "/login"
  };

  let rutas;
  if (estudiante) rutas = rutasEstudiante;
  if (asesor) rutas = rutasAsesor;
  if (admin) rutas = rutasAdmin;

  const roles = [estudiante, asesor, admin].filter(Boolean);
  if (roles.length > 1) {
    return (
      <div className="p-4 text-red-600 font-bold">
        Corregir propiedades del componente SideBarDesktop: solo se debe pasar una propiedad (estudiante, asesor o admin).
      </div>
    );
  }


  const svgColor='#3818c3';
  const svgColorLogout='#EA3323';
  const xmlns = "http://www.w3.org/2000/svg";
  const width='26px';
  const height='26px';

  const LogoInicio=<svg xmlns={xmlns} height={height} viewBox="0 -960 960 960" width={width} fill={svgColor}><path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z"/></svg>;
  const LogoPerfil=<svg xmlns={xmlns} height={height} viewBox="0 -960 960 960" width={width} fill={svgColor}><path d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q53 0 100-15.5t86-44.5q-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160Zm0-360q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm0-60Zm0 360Z" /></svg>;
  const LogoActividades=<svg xmlns={xmlns} height={height} viewBox="0 -960 960 960" width={width} fill={svgColor}><path d="M480-120 200-272v-240L40-600l440-240 440 240v320h-80v-276l-80 44v240L480-120Zm0-332 274-148-274-148-274 148 274 148Zm0 241 200-108v-151L480-360 280-470v151l200 108Zm0-241Zm0 90Zm0 0Z"/></svg>;
  const LogoQuizt=<svg xmlns={xmlns} height={height} viewBox="0 -960 960 960" width={width} fill={svgColor}><path d="M309-389q29 29 71 29t71-29l160-160q29-29 29-71t-29-71q-29-29-71-29t-71 29q-37-13-73-6t-61 32q-25 25-32 61t6 73q-29 29-29 71t29 71ZM240-80v-172q-57-52-88.5-121.5T120-520q0-150 105-255t255-105q125 0 221.5 73.5T827-615l52 205q5 19-7 34.5T840-360h-80v120q0 33-23.5 56.5T680-160h-80v80h-80v-160h160v-200h108l-38-155q-23-91-98-148t-172-57q-116 0-198 81t-82 197q0 60 24.5 114t69.5 96l26 24v208h-80Zm254-360Z"/></svg>;
  const LogoCursos=<svg xmlns={xmlns} height={height} viewBox="0 -960 960 960" width={width} fill={svgColor}><path d="M480-120 200-272v-240L40-600l440-240 440 240v320h-80v-276l-80 44v240L480-120Zm0-332 274-148-274-148-274 148 274 148Zm0 241 200-108v-151L480-360 280-470v151l200 108Zm0-241Zm0 90Zm0 0Z" /></svg>;
  const LogoSimuladores=<svg xmlns={xmlns} height={height} viewBox="0 -960 960 960" width={width} fill={svgColor}><path d="M400-160h160v-160H400v160ZM160-400h160v-160H160v160Zm240 0h160v-160H400v160Zm240 0h160v-160H640v160Zm0-240h160v-160H640v160ZM320-80v-240H80v-320h480v-240h320v560H640v240H320Z"/></svg>
  const LogoAsesorias=<svg xmlns={xmlns} height={height} viewBox="0 -960 960 960" width={width} fill={svgColor}><path d="M840-120v-640H120v320H40v-320q0-33 23.5-56.5T120-840h720q33 0 56.5 23.5T920-760v560q0 33-23.5 56.5T840-120ZM360-400q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm0-80q33 0 56.5-23.5T440-560q0-33-23.5-56.5T360-640q-33 0-56.5 23.5T280-560q0 33 23.5 56.5T360-480ZM40-80v-112q0-34 17.5-62.5T104-298q62-31 126-46.5T360-360q66 0 130 15.5T616-298q29 15 46.5 43.5T680-192v112H40Zm80-80h480v-32q0-11-5.5-20T580-226q-54-27-109-40.5T360-280q-56 0-111 13.5T140-226q-9 5-14.5 14t-5.5 20v32Zm240-400Zm0 400Z" /></svg>;
  const LogoCorreo=<svg xmlns={xmlns} height={height} viewBox="0 -960 960 960" width={width} fill={svgColor}><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z" /></svg>;
  const LogoCalendario=<svg xmlns={xmlns} height={height} viewBox="0 -960 960 960" width={width} fill={svgColor}><path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Zm280 240q-17 0-28.5-11.5T440-440q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440q0 17-11.5 28.5T480-400Zm-160 0q-17 0-28.5-11.5T280-440q0-17 11.5-28.5T320-480q17 0 28.5 11.5T360-440q0 17-11.5 28.5T320-400Zm320 0q-17 0-28.5-11.5T600-440q0-17 11.5-28.5T640-480q17 0 28.5 11.5T680-440q0 17-11.5 28.5T640-400ZM480-240q-17 0-28.5-11.5T440-280q0-17 11.5-28.5T480-320q17 0 28.5 11.5T520-280q0 17-11.5 28.5T480-240Zm-160 0q-17 0-28.5-11.5T280-280q0-17 11.5-28.5T320-320q17 0 28.5 11.5T360-280q0 17-11.5 28.5T320-240Zm320 0q-17 0-28.5-11.5T600-280q0-17 11.5-28.5T640-320q17 0 28.5 11.5T680-280q0 17-11.5 28.5T640-240Z" /></svg>;
  const LogoReportes=<svg xmlns={xmlns} height={height} viewBox="0 -960 960 960" width={width} fill={svgColor}><path d="M280-280h80v-200h-80v200Zm320 0h80v-400h-80v400Zm-160 0h80v-120h-80v120Zm0-200h80v-80h-80v80ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z" /></svg>;
  const LogoRecursos=<svg xmlns={xmlns} height={height} viewBox="0 -960 960 960" width={width} fill={svgColor}><path d="M560-564v-68q33-14 67.5-21t72.5-7q26 0 51 4t49 10v64q-24-9-48.5-13.5T700-600q-38 0-73 9.5T560-564Zm0 220v-68q33-14 67.5-21t72.5-7q26 0 51 4t49 10v64q-24-9-48.5-13.5T700-380q-38 0-73 9t-67 27Zm0-110v-68q33-14 67.5-21t72.5-7q26 0 51 4t49 10v64q-24-9-48.5-13.5T700-490q-38 0-73 9.5T560-454ZM260-320q47 0 91.5 10.5T440-278v-394q-41-24-87-36t-93-12q-36 0-71.5 7T120-692v396q35-12 69.5-18t70.5-6Zm260 42q44-21 88.5-31.5T700-320q36 0 70.5 6t69.5 18v-396q-33-14-68.5-21t-71.5-7q-47 0-93 12t-87 36v394Zm-40 118q-48-38-104-59t-116-21q-42 0-82.5 11T100-198q-21 11-40.5-1T40-234v-482q0-11 5.5-21T62-752q46-24 96-36t102-12q58 0 113.5 15T480-740q51-30 106.5-45T700-800q52 0 102 12t96 36q11 5 16.5 15t5.5 21v482q0 23-19.5 35t-40.5 1q-37-20-77.5-31T700-240q-60 0-116 21t-104 59ZM280-494Z" /></svg>;
  const LogoFeedback=<svg xmlns={xmlns} height={height} viewBox="0 -960 960 960" width={width} fill={svgColor}><path d="M320-400h320v-22q0-44-44-71t-116-27q-72 0-116 27t-44 71v22Zm160-160q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560ZM80-80v-720q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H240L80-80Zm126-240h594v-480H160v525l46-45Zm-46 0v-480 480Z"/></svg>
  const LogoPagos=<svg xmlns={xmlns} height={height} viewBox="0 -960 960 960" width={width} fill={svgColor}><path d="M560-440q-50 0-85-35t-35-85q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35ZM280-320q-33 0-56.5-23.5T200-400v-320q0-33 23.5-56.5T280-800h560q33 0 56.5 23.5T920-720v320q0 33-23.5 56.5T840-320H280Zm80-80h400q0-33 23.5-56.5T840-480v-160q-33 0-56.5-23.5T760-720H360q0 33-23.5 56.5T280-640v160q33 0 56.5 23.5T360-400Zm440 240H120q-33 0-56.5-23.5T40-240v-440h80v440h680v80ZM280-400v-320 320Z" /></svg>;
  const LogoAutenticacion=<svg xmlns={xmlns} height={height} viewBox="0 -960 960 960" width={width} fill={svgColor}><path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm240-120q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z" /></svg>;
  const LogoConfig=<svg xmlns={xmlns} height={height} viewBox="0 -960 960 960" width={width} fill={svgColor}><path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z" /></svg>;
  const LogoLogOut=<svg xmlns={xmlns} height={height} viewBox="0 -960 960 960" width={width} fill={svgColorLogout}><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z" /></svg>
  
  // Toggle simple para mostrar/ocultar Feedback en panel asesor
  const advisorFeedbackEnabled = asesor ? (typeof window !== 'undefined' ? (localStorage.getItem('advisorFeedbackEnabled') !== 'false') : true) : true;

  return (
    <>
      <aside
        className="hidden sm:flex flex-col fixed w-16 shadow-[4px_0_10px_-2px_rgba(0,0,0,0.3)] z-1"
        aria-label="Sidebar"
      >
        <nav className="h-dvh bg-gray-50">

          <ul className="relative p-4 pb-2 h-full">
            
            <ElementoSideBar to={rutas.toInicio} Icono={LogoInicio} NombreElemento='Inicio'/>

            <ElementoSideBar to={rutas.toMiPerfil} Icono={LogoPerfil} NombreElemento='Mi Perfil'/>

            <ElementoSideBar to={rutas.toActividades} Icono={LogoActividades} NombreElemento='Actividades'/>

            <ElementoSideBar to={rutas.toQuizt} Icono={LogoQuizt} NombreElemento='Quizt'/>

            <ElementoSideBar to={rutas.toSimuladores} Icono={LogoSimuladores} NombreElemento='Simuladores'/>

            <ElementoSideBar to={rutas.toAsesorias} Icono={LogoAsesorias} NombreElemento='Asesorías'/>

            <ElementoSideBar to={rutas.toCorreo} Icono={LogoCorreo} NombreElemento='Correo'/>

            <ElementoSideBar to={rutas.toCalendario} Icono={LogoCalendario} NombreElemento='Calendario'/>

            <ElementoSideBar to={rutas.toReportes} Icono={LogoReportes} NombreElemento='Reportes'/>

            <ElementoSideBar to={rutas.toRecursosEducativos} Icono={LogoRecursos} NombreElemento='Recursos educativos'/>

            {asesor && advisorFeedbackEnabled && (
              <ElementoSideBar to={rutas.toFeedback} Icono={LogoFeedback} NombreElemento='Feedback'/>
            )}

            <ElementoSideBar to={rutas.toMisPagos} Icono={LogoPagos} NombreElemento='Mis pagos'/>

            <ElementoSideBar to={rutas.toAutenticacion} Icono={LogoAutenticacion} NombreElemento='Autenticación'/>

            

            <div className={`fixed bottom-3 z-3`}>
            <ElementoSideBar to={rutas.toConfiguracion} Icono={LogoConfig} NombreElemento='Configuración'/>
            <ElementoSideBar to={rutas.toCerrarSesion} Icono={LogoLogOut} NombreElemento='Cerrar Sesión'/>
            </div>
          </ul>
        </nav>
      </aside>
    </>
  );
};