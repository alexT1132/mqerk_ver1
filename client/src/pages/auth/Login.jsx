import React, { useState } from "react";
import { FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Topbar from "../../components/layouts/NavLogin.jsx";

const ResponsivePage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validación simple - credenciales de desarrollo
        if (email === "admin@test.com" && password === "123456") {
            // Redirige al dashboard de Panel_admin1.jsx
            navigate("/admin1/dashboard");
        } else {
            alert("Credenciales incorrectas. \nUsuario: admin@test.com \nContraseña: 123456");
        }
    };

    return (
      <div className={`h-dvh overflow-y-hidden`}>
      <Topbar/>
        <div className="flex flex-col justify-center w-full items-center bg-[#3818c3] h-dvh">

        

        <form onSubmit={handleSubmit} className="flex flex-col relative gap-3 md:gap-2 mx-5 mb-35 w-80 bg-white py-4 px-5 rounded-3xl shadow-lg">
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="admin@test.com"
                required
              />
              </div>

              
              <div className={`flex flex-col gap-1`}>
              <label htmlFor="password" className="text-sm select-none font-medium text-gray-400">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123456"
                required
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
            
            {/* Información de credenciales de prueba */}
            <div className="text-xs text-gray-500 text-center">
              <p><strong>Credenciales de prueba:</strong></p>
              <p>Email: admin@test.com</p>
              <p>Contraseña: 123456</p>
            </div>
            
          <p className="text-center select-none">¿Haz olvidado tu contraseña?</p>
          </div>
        </form>
      </div>
      </div>
    );
  }

export default ResponsivePage;