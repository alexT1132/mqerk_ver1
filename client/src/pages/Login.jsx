import React from "react";
import { FaUser } from "react-icons/fa";
import Topbar from "../components/NavLogin.jsx";

const ResponsivePage = () => {
    return (
      <div className={`h-dvh overflow-y-hidden`}>
      <Topbar/>
        <div className="flex flex-col justify-center w-full items-center bg-[#3818c3] h-dvh">

        

        <form className="flex flex-col relative gap-3 md:gap-2 mx-5 mb-35 w-80 bg-white py-4 px-5 rounded-3xl shadow-lg">
          <FaUser className="text-6xl absolute w-15 h-auto -top-10 left-1/2 transform -translate-x-1/2 bg-gray-400 p-2 z-0 rounded-full text-center text-white" />

          <div className={`flex flex-col items-center `}>
            
            <h2 className="text-2xl font-semibold text-center text-gray-400">Iniciar sesión</h2>
          </div>

          <div className={`flex flex-col gap-3 py-5 md:py-4`}>
              <div className={`flex flex-col gap-1`}>
              <label htmlFor="email" className="text-sm select-none font-medium text-gray-400">Correo electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                className="p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Introduce tu correo electrónico"
              />
              </div>

              
              <div className={`flex flex-col gap-1`}>
              <label htmlFor="password" className="text-sm select-none font-medium text-gray-400">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                className="p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Introduce tu contraseña"
              />
              </div>
          </div>

          <div className={`flex flex-col gap-4`}>
            <button
              type="submit"
              className="w-full p-3 bg-blue-400 text-white rounded-lg hover:bg-blue-600 transition duration-300"
            >
              Iniciar sesión
            </button>
          <p className="text-center select-none">¿Haz olvidado tu contraseña?</p>
          </div>
        </form>
      </div>
      </div>
    );
  }

export default ResponsivePage;
