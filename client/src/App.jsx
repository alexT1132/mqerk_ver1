import React from 'react'
import NavIndex from './components/NavIndex'
import { useState } from 'react';
import { Link } from "react-router-dom";


export default function Index() {

    const [isOpen, setIsOpen] = useState(false);
    
    const toggleDropdown = () => setIsOpen(!isOpen);

    const MainBtn='max-sm:w-full py-2 w-60 text-2xl font-bold border-2 bg-gradient-to-r from-[#5115bc] to-[#E6007E] bg-[length:120%_100%] ease-in-out bg-right text-white rounded-3xl transition hover:bg-left duration-500 cursor-pointer';
    const DisplayedBtn='text-white gap-4 w-[60%] rounded-full bg-gradient-to-r from-[#5115bc] to-[#E6007E] bg-[length:120%_100%] ease-in-out bg-right border-1 border-white hover:bg-left duration-500 cursor-pointer';

return(
    <>
    <NavIndex/>

    <div className="flex-row bg-cover bg-center h-[100%] bg-no-repeat bg-fixed justify-center fondo">

                <h1 className="text-white pt-10 text-center text-6xl font-bold max-sm:text-3xl">¡BIENVENIDOS!</h1>
                <h1 className="text-white pt-[40vh] pb-[20px] text-center text-5xl font-bold max-sm:text-2xl">Regístrate como:</h1>
                
                <div className="flex justify-center w-full gap-x-2">
                    
                    <Link>
                    <button className={MainBtn}>
                        Estudiante
                    </button>
                    </Link>

                    <Link>
                    <button  onClick={toggleDropdown} className={MainBtn}>
                        Colaborador
                    </button>
                    {isOpen && (
                        <ul className='flex flex-col pt-3 items-end font-bold gap-2 w-full'>

                            <Link className='flex w-full justify-end' to='/asesor'>
                                <button className={DisplayedBtn}>Asesor</button>
                            </Link>

                            <Link className='flex w-full justify-end'>
                                <button className={DisplayedBtn}>Personal Interno</button>
                            </Link>
                        </ul>

                    )}
                    </Link>
                    
                
                
                

                </div>

            </div>
            </>
  );



}

