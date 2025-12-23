import Logo from "../assets/MQerK_logo.webp";
import { GrLogin } from "react-icons/gr";
import { Link } from "react-router-dom";

const DesktopTopbar = () => {
    return (
      <div className="hidden md:flex w-full border-b-2 border-white p-4 items-center justify-between shadow-md md:px-8" style={{ backgroundColor: "#3818c3" }}>
        {/* Imagen a la izquierda */}
        <img
            src={Logo}
            alt="Logo"
            className="w-20 h-16"
        />
  
        {/* Título en el centro */}
        <h1 className="text-white text-3xl font-semibold text-center flex-1">
            Asesores Especializados en la Enseñanza de las Ciencias y Tecnología 
        </h1>
  
        {/* Botón a la derecha */}
        <Link to='/login' className="text-white border-2 px-4 py-2 rounded-2xl font-medium transition md:px-6 md:py-2.5 bg-gradient-to-r from-[#5115bc] to-[#E6007E] bg-[length:120%_100%] ease-in-out bg-right hover:bg-left duration-500 cursor-pointer">
          Iniciar Sesión
        </Link>
      </div>
    );
  };
  
  const MobileTopbar = () => {
    return (
      <div className="flex md:hidden w-full border-b-2 border-white p-4 items-center justify-between shadow-md" style={{ backgroundColor: "#3818c3" }}>
        {/* Imagen a la izquierda */}
        <img
            src={Logo}
            alt="Logo"
            className="w-15 h-13"
        />
  
        {/* Título en el centro */}
        <h1 className="text-white text-center flex-1">
            Asesores Especializados en la Enseñanza de las Ciencias y Tecnología 
        </h1>
  
        {/* Botón a la derecha */}
        <Link to='/login' className="px-3 py-3 text-white rounded-xl font-medium transition" style={{ backgroundImage: "linear-gradient(to right, #5115bc, #E6007E)", border: '1px solid white' }}>
            <GrLogin />
        </Link>
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