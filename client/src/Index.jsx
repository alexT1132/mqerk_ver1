import NavIndex from './components/NavIndex'
import React from 'react';
import { BtnIndex } from './components/IndexComp.jsx';


export default function Index() {
    return(
        <>
        <NavIndex/>
        <div className={`flex flex-wrap justify-center bg-linear-to-r from-[#3d18c3] to-[#4816bf] sm:bg-size-[12px] md:h-[91.5%] h-dvh`}>
            <img className={`object-cover absolute top-0 opacity-20 h-dvh select-none pointer-events-none`} src={`../src/assets/fondo_index.jpg`} alt="Fondo de index" onContextMenu={(e) => e.preventDefault()} />
                <div className={`flex flex-col items-center w-full pt-5`}>
                <h1 className={`text-white text-center font-bold text-5xl lg:text-6xl z-1`}>¡BIENVENIDOS!</h1>
                <div className={`flex justify-center`}>
               
                </div>

                </div>
                <div className={`flex flex-col w-full gap-4 z-1`}>
                    <h1 className="flex justify-center text-white text-4xl lg:text-5xl text-center font-bold">Regístrate como:</h1>
                    
                    

                    <div className="flex flex-wrap w-full justify-center items-center gap-2">
                        
                        <BtnIndex to={``} TextoBtn={`Personal interno`}/>

                        <BtnIndex to={``} TextoBtn={`Colaborador`}/>
                        
                    </div>
            </div>
        </div>
        </>
    );



    }
