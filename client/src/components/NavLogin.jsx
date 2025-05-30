import React from "react";
import { Link } from "react-router-dom";
import MQerkLogo from "../assets/MQerK_logo.png";
import Guardianes from "../assets/guardianes.png";
import { Logos } from "./IndexComp.jsx";

const DesktopTopbar = () => {
    return (
      <header className="flex w-full border-b-2 bg-[#3818c3] border-white sticky top-0 left-0 m-auto items-center justify-between shadow-md">
        {/* Imagen a la izquierda */}

        <Link to={`/`} className={`px-5`}>
        <Logos src={MQerkLogo}/>
        </Link>
  
        {/* Título en el centro */}
        <h1 className="text-white text-3xl max-sm:text-sm font-semibold text-center object-contain">
            Asesores Especializados en la Enseñanza de las Ciencias y Tecnología 
        </h1>
  
        {/* Botón a la derecha */}
        <div className={`px-5`}>
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
