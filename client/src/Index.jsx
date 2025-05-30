import NavIndex from './components/NavIndex'
import { useState } from 'react';
import { Link } from "react-router-dom";
import React from 'react';
import { BtnIndex } from './components/IndexComp.jsx';


export default function Index() {
    return(
        <>
        <NavIndex/>
        <div className={`flex flex-wrap bg-fixed fondo bg-no-repeat bg-cover bg-center h-[91.5%]`}>
        
        
                <h1 className={`flex justify-center w-full text-white pt-5 text-6xl font-bold max-sm:text-3xl`}>¡BIENVENIDOS!</h1>

                <div className={`flex flex-col w-full gap-4`}>
                    <h1 className="flex justify-center text-white text-5xl font-bold max-sm:text-2xl">Regístrate como:</h1>
                    
                    <div className="flex flex-wrap w-full justify-center items-center gap-2">
                        
                        <BtnIndex to={``} TextoBtn={`Personal interno`}/>

                        <BtnIndex to={``} TextoBtn={`Colaborador`}/>
                        
                    </div>
            </div>
        </div>
        </>
    );



    }
