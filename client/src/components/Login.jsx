import React from "react";
import { FaUser } from "react-icons/fa";

const ResponsivePage = () => {
    return (
        <div className="flex justify-center items-center h-screen" style={{ backgroundColor: "#3818c3" }}>
        {/* <!-- Tarjeta para móviles --> */}
        <div className="w-80 bg-white p-8 rounded-3xl shadow-lg md:hidden mb-25">
            <div className="flex justify-center mb-0">
                <FaUser className="text-5xl text-center mb-4 text-gray-400" />
            </div>
          <h2 className="text-2xl font-semibold text-center text-gray-400 mb-4">Iniciar sesión</h2>
      
          <form>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-400">Correo electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Introduce tu correo electrónico"
              />
            </div>
      
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-400">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Introduce tu contraseña"
              />
            </div>
      
            <button
              type="submit"
              className="w-full py-3 bg-blue-400 text-white rounded-lg hover:bg-blue-600 transition duration-300"
            >
              Iniciar sesión
            </button>
          </form>
          <p className="text-center mt-6">¿Haz olvidado tu contraseña?</p>
        </div>
      
        {/* <!-- Tarjeta para computadoras --> */}
        <div className="hidden md:flex w-90 bg-white p-8 rounded-3xl shadow-lg d-flex flex-col mb-20">
            <div className="flex justify-center mb-0">
                <FaUser className="text-5xl text-center mb-4 text-gray-400" />
            </div>
          <h2 className="text-3xl font-semibold text-center text-gray-400 mb-6">Iniciar sesión</h2>
      
          <form>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-400">Correo electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Introduce tu correo electrónico"
              />
            </div>
      
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-400">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Introduce tu contraseña"
              />
            </div>
      
            <button
              type="submit"
              className="w-full py-3 bg-blue-400 text-white rounded-lg hover:bg-blue-600 transition duration-300"
            >
              Iniciar sesión
            </button>
          </form>
          <p className="text-center mt-10">¿Haz olvidado tu contraseña?</p>
        </div>
      </div>
      
    );
  }

export default ResponsivePage;
