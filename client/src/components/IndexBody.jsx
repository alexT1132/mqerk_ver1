import React, {useState} from "react";
import { Link } from "react-router-dom";

const ResponsivePage = () => {

    const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        {/* Versión para computadoras */}
        <div className="hidden bg-cover bg-center md:flex w-full min-h-screen justify-center fondo">
        <div className="flex flex-col items-center">
                <h1 className="text-white text-6xl font-bold mt-10">¡BIENVENIDOS!</h1>
                <h1 className="text-white text-center text-5xl font-bold mt-87">Regístrate como:</h1>
                <div className="flex gap-5 mt-6">
                    <button className="px-25 font-bold py-4 border-2 bg-gradient-to-r from-[#5115bc] to-[#E6007E] bg-[length:120%_100%] ease-in-out bg-right text-white rounded-3xl transition hover:bg-left duration-500 cursor-pointer">
                        Estudiante
                    </button>

                    <div className="relative">
                        <button  onClick={toggleDropdown} className="px-25 font-bold py-4 border-2 bg-gradient-to-r from-[#5115bc] to-[#E6007E] bg-[length:120%_100%] ease-in-out bg-right text-white rounded-3xl transition hover:bg-left duration-500 cursor-pointer">
                            Colaborador
                        </button>
                        {isOpen && (
                        <div className="absolute bg-white text-black border rounded-lg shadow-md mt-1 w-full">
                            <ul>
                                <Link to='/asesor'>
                                    <li className="px-3 text-white py-2 bg-gradient-to-r from-[#5115bc] to-[#E6007E] bg-[length:120%_100%] ease-in-out bg-right border-1 border-white hover:bg-left duration-500 cursor-pointer">Asesor</li>
                                </Link>
                                <li className="px-3 text-white py-2 bg-gradient-to-r from-[#5115bc] to-[#E6007E] bg-[length:120%_100%] ease-in-out bg-right border-1 border-white hover:bg-left duration-500 cursor-pointer">Personal Interno</li>
                            </ul>
                        </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
  
        {/* Versión para móviles */}
        <div className="flex md:hidden w-full bg-cover bg-[position:calc(50%+165px)_calc(50%-1px)] bg-no-repeat bg-fixed min-h-screen justify-center fondo">
            <div className="flex flex-col items-center">
                <h1 className="text-white text-3xl font-bold mt-10">¡BIENVENIDOS!</h1>
                <h1 className="text-white text-center text-3xl font-bold mt-68">Regístrate como:</h1>
                <div className="flex gap-5 mt-5">
                    <button className="px-3 py-2 border-2 bg-gradient-to-r from-[#5115bc] to-[#E6007E] bg-[length:120%_100%] ease-in-out bg-right text-white rounded-3xl transition duration-300">
                        Estudiante
                    </button>

                    <div className="relative">
                        <button onClick={toggleDropdown} className="px-4 py-2 border-2 bg-gradient-to-r from-[#5115bc] to-[#E6007E] bg-[length:120%_100%] ease-in-out bg-right text-white rounded-3xl transition duration-300">
                            Colaborador
                        </button>
                        {isOpen && (
                        <div className="absolute bg-white text-black border rounded-lg shadow-md mt-1 w-full">
                            <ul>
                                <Link to='/asesor'>
                                    <li className="px-3 text-white py-2 bg-gradient-to-r from-[#5115bc] to-[#E6007E] bg-[length:120%_100%] ease-in-out bg-right border-1 border-white">Asesor</li>
                                </Link>
                                <li className="px-3 text-white py-2 bg-gradient-to-r from-[#5115bc] to-[#E6007E] bg-[length:120%_100%] ease-in-out bg-right border-1 border-white">Personal Interno</li>
                            </ul>
                        </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  }

export default ResponsivePage;
