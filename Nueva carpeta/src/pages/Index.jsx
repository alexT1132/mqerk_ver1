import React from 'react'
import NavIndex from "../components/NavIndex.jsx";
import { useState } from 'react';
import { Link } from "react-router-dom";

function App() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);
  return(
    <>
    <NavIndex/>

    <div className="flex-row bg-cover bg-center h-[100%] bg-no-repeat bg-fixed justify-center fondo">

                <h1 className="text-white pt-10 text-center text-6xl font-bold max-sm:text-3xl">¡BIENVENIDOS!</h1>
                <h1 className="text-white pt-[40vh] pb-[20px] text-center text-5xl font-bold max-sm:text-2xl">Regístrate como:</h1>
                <div className="grid justify-center w-full gap-x-2">
                    
                    <Link>
                    <button className="max-sm:w-full w-60 text-2xl font-bold border-2 bg-gradient-to-r from-[#5115bc] to-[#E6007E] bg-[length:120%_100%] ease-in-out bg-right text-white rounded-3xl transition hover:bg-left duration-500 cursor-pointer">
                        Estudiante
                    </button>
                    </Link>

                    <Link>
                    <button  onClick={toggleDropdown} className="max-sm:w-full text-2xl w-60 font-bold border-2 bg-gradient-to-r from-[#5115bc] to-[#E6007E] bg-[length:120%_100%] ease-in-out bg-right text-white rounded-3xl transition hover:bg-left duration-500 cursor-pointer">
                        Colaborador
                    </button>
                    </Link>
                    
                </div>
                {isOpen && (
                    <div className="bg-white text-black border rounded-lg shadow-md">
                        <ul>
                            <Link to='/asesor'>
                                <li className="text-white bg-gradient-to-r from-[#5115bc] to-[#E6007E] bg-[length:120%_100%] ease-in-out bg-right border-1 border-white hover:bg-left duration-500 cursor-pointer">Asesor</li>
                            </Link>
                                <li className="text-white bg-gradient-to-r from-[#5115bc] to-[#E6007E] bg-[length:120%_100%] ease-in-out bg-right border-1 border-white hover:bg-left duration-500 cursor-pointer">Personal Interno</li>
                        </ul>
                    </div>
                    )}
            </div>
            </>
  );
}

export default App