import React from "react";
import { Logos } from "./IndexComp.jsx";
import MQerkLogo from "../assets/MQerK_logo.png";
import { GrLogin } from "react-icons/gr";
import { Link } from "react-router-dom";
import { Login } from "./IndexComp.jsx";

const DesktopTopbar = () => {
    return (
      <header className="flex items-center justify-between bg-linear-to-r from-[#3d18c3] to-[#4816bf] sticky top-0 left-0 m-auto h-[10vh] max-sm:h-min">
        {/* Imagen a la izquierda */}
        <div className={`flex relative items-center gap-x-30 mx-5`}>
        <Link to={`/`}>
        <Logos src={MQerkLogo} alt={`Logo MQerkAcademy`}/>
        </Link>
        </div>
  
        {/* Título en el centro */}
        <h1 className="text-white text-3xl font-semibold text-center">
            Asesores Especializados en la Enseñanza de las Ciencias y Tecnología 
        </h1>
  
        {/* Botón a la derecha */}
        <div className={`flex relative items-baseline justify-end sm:gap-x-30 mx-5`}>
        <Login to={`/login`}/>
        </div>
      </header>
    );
  };
  
  const MobileTopbar = () => {
    return (
      <div className="flex md:hidden w-full border-b-2 border-white p-4 items-center justify-between shadow-md" style={{ backgroundColor: "#3818c3" }}>
        {/* Imagen a la izquierda */}
        <img
            src={MQerkLogo}
            alt="MQerkLogo"
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
