import React from "react";
import { Logos } from "./IndexComp.jsx";
import MQerkLogo from "../assets/MQerK_logo.png";
import { Link } from "react-router-dom";
import { Login } from "./IndexComp.jsx";

const DesktopTopbar = () => {
    return (
      <header className="flex items-center justify-between border-b-2 overflow-hidden h-fit border-white bg-linear-to-r from-[#3d18c3] to-[#4816bf] shadow-md sticky top-0 left-0 m-auto">
        {/* Imagen a la izquierda */}
        <div className={`flex relative items-center px-5`}>
        <Link to={`/`}>
        <Logos src={MQerkLogo} alt={`Logo MQerkAcademy`}/>
        </Link>
        </div>
  
        {/* Título en el centro */}
        <div className={`flex justify-center`}>
        <h1 className="text-white text-3xl font-semibold text-center max-sm:text-sm">
            Asesores Especializados en la Enseñanza de las Ciencias y Tecnología 
        </h1>
        </div>
  
        {/* Botón a la derecha */}
        <div className={`flex relative items-baseline justify-end sm:gap-x-30 px-5`}>
        <Login to={`/login`}/>
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
