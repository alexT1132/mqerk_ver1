import Logo from "../assets/MQerK_logo.png";
import Guardianes from "../assets/guardianes.png";
import { Link } from "react-router-dom";

const DesktopTopbar = () => {
    return (
      <div className="hidden md:flex w-full border-b-2 border-white p-4 items-center justify-between shadow-md md:px-8" style={{ backgroundColor: "#3818c3" }}>
        {/* Imagen a la izquierda */}
        <Link to='/'>
          <img
            src={Logo}
            alt="Logo"
            className="w-20 h-16"
          />
        </Link>
  
        {/* Título en el centro */}
        <h1 className="text-white text-3xl font-semibold text-center flex-1">
            Asesores Especializados en la Enseñanza de las Ciencias y Tecnología 
        </h1>
  
        {/* Botón a la derecha */}
        <img
            src={Guardianes}
            alt="Logo"
            className="w-16 h-17 m-0"
        />
      </div>
    );
  };
  
  const MobileTopbar = () => {
    return (
      <div className="flex md:hidden w-full border-b border-white/60 px-3 py-2 items-center justify-between shadow-sm" style={{ backgroundColor: "#3818c3" }}>
        {/* Imagen a la izquierda */}
        <img
            src={Logo}
            alt="Logo"
            className="w-12 h-10"
        />
  
        {/* Título en el centro */}
  <h1 className="text-white text-xs leading-4 text-center flex-1 px-2">
            Asesores Especializados en la Enseñanza de las Ciencias y Tecnología 
        </h1>
  
        <img
            src={Guardianes}
            alt="Logo"
            className="w-10 h-10"
        />
      </div>
    );
  };

const Topbar = () => {
  return (
    <>
        <DesktopTopbar />
        <MobileTopbar />
    </>
  );
};

export default Topbar;