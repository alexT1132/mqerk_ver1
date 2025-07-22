import NavIndex from './components/layouts/NavIndex.jsx'
import React from 'react';
import { BtnIndex } from './pages/public/IndexComp.jsx';


export default function Index() {
    return(
        <div className={`h-dvh overflow-hidden`}>
        <NavIndex/>
        <div className={`flex flex-wrap justify-center bg-linear-to-r from-[#3d18c3] to-[#4816bf] h-full`}>
            <img className={`object-cover absolute top-0 opacity-20 h-dvh select-none pointer-events-none`} src={`../src/assets/fondo_index.jpg`} alt="Fondo de index" onContextMenu={(e) => e.preventDefault()} />
                
                
                <div className={`flex flex-col items-center w-full pt-5`}>
                <h1 className={`text-white text-center font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl z-1`}>¡BIENVENIDOS!</h1>

                </div>
                <div className={`flex flex-col w-full gap-4 z-1`}>
                    <h1 className="flex justify-center text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center font-bold">Regístrate como:</h1>
                    
                    

                    <div className="flex flex-wrap w-full justify-center items-center gap-2">
                        
                        <BtnIndex to={``} TextoBtn={`Personal interno`}/>

                        <BtnIndex to={``} TextoBtn={`Colaborador`}/>
                        
                    </div>
            </div>
            </div>
        </div>
    );



    }
