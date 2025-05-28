import NavIndex from './components/NavIndex'
import { useState } from 'react';
import { Link } from "react-router-dom";
import React from 'react';
import { BtnIndex } from './components/IndexComp.jsx';


export default function Index() {

    const [isOpen, setIsOpen] = useState(false);
    
    const toggleDropdown = () => setIsOpen(!isOpen);

    const MainBtn='max-sm:w-full py-2 w-60 text-2xl font-bold border-2 bg-gradient-to-r from-[#5115bc] to-[#E6007E] bg-[length:120%_100%] ease-in-out bg-right text-white rounded-3xl transition hover:bg-left duration-500 cursor-pointer';
    const DisplayedBtn='text-white gap-4 w-[60%] rounded-full bg-gradient-to-r from-[#5115bc] to-[#E6007E] bg-[length:120%_100%] ease-in-out bg-right border-1 border-white hover:bg-left duration-500 cursor-pointer';

return(
    <>
    <NavIndex/>

    <div className="flex flex-col bg-cover bg-center h-dvh justify-center bg-no-repeat bg-fixed fondo">

                <h1 className="text-white pt-10 text-center text-6xl font-bold max-sm:text-3xl">¡BIENVENIDOS!</h1>


                <div className={`flex flex-col gap-4 items-center`}>
                <h1 className="text-white text-center text-5xl font-bold max-sm:text-2xl">Regístrate como:</h1>
                
                <div className="flex flex-wrap justify-center w-fit items-center gap-x-2">
                    
                    <BtnIndex to={``} TextoBtn={`Personal interno`}/>

                    <BtnIndex to={``} TextoBtn={`Colaborador`}/>
                    
                
                
                
                </div>
                </div>

            </div>
    </>
  );



}
