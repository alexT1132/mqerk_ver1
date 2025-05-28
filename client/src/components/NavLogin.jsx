import React from "react";
import { Link } from "react-router-dom";
import MQerkLogo from "../assets/MQerK_logo.png";
import Guardianes from "../assets/guardianes.png";
import { Logos } from "./IndexComp.jsx";

const DesktopTopbar = () => {
    return (
      <div className="hidden md:flex w-full border-b-2 bg-[#3818c3] border-white p-4 items-center justify-between shadow-md md:px-8">
        {/* Imagen a la izquierda */}

        <Link to={`/`}>
        <Logos src={MQerkLogo}/>
        </Link>
  
        {/* Título en el centro */}
        <h1 className="text-white text-3xl font-semibold text-center object-contain">
            Asesores Especializados en la Enseñanza de las Ciencias y Tecnología 
        </h1>
  
        {/* Botón a la derecha */}
        <Logos src={Guardianes}/>
      </div>
    );
  };
  
  const MobileTopbar = () => {
    return (
      <div className="flex md:hidden w-full border-b-2 border-white p-4 items-center justify-between shadow-md" style={{ backgroundColor: "#3818c3" }}>
        {/* Imagen a la izquierda */}
        <img
            src={MQerkLogo}
            alt="Logo"
            className="w-15 h-13"
        />
  
        {/* Título en el centro */}
        <h1 className="text-white text-center flex-1">
            Asesores Especializados en la Enseñanza de las Ciencias y Tecnología 
        </h1>
  
        <img
            src={Guardianes}
            alt="Logo"
            className="w-15 h-17"
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
