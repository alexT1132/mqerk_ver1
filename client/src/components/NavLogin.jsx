import React from "react";
import { Link } from "react-router-dom";
import MQerkLogo from "../assets/MQerK_logo.png";
import Guardianes from "../assets/guardianes.png";
import { Logos } from "./IndexComp.jsx";

const DesktopTopbar = () => {
    return (
      <header className="flex w-full border-b-2 bg-[#3818c3] border-white sticky top-0 left-0 m-auto items-center justify-between shadow-md z-2">
        {/* Imagen a la izquierda */}

        <Link to={`/`} className={`flex justify-center px-5`}>
        <Logos src={MQerkLogo}/>
        </Link>
  
        {/* Título en el centro */}
        <div className={`flex justify-center overflow-hidden`}>
        <h1 className="text-white sm:text-xl md:text-2xl lg:text-3xl font-semibold text-center">
            Asesores Especializados en la Enseñanza de las Ciencias y Tecnología 
        </h1>
        </div>
  
        {/* Botón a la derecha */}
        <div className={`flex justify-center px-5`}>
        <Logos src={Guardianes}/>
        </div>
      </header>
    );
  };


const Topbar = () => {
  return (
    <>
        <DesktopTopbar />
    </>
  );
};

export default Topbar;
