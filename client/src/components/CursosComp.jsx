import React from "react";

const TestComp=()=>{
    return(
        <div className={`bg-[#1f1f1f] h-dvh flex items-center justify-center`}>
        <BtnDesplegable/>
        </div>
    )
}

export const BtnDesplegable=()=>{

    const Opciones=[`Actividades`, `Quizt`, `Simuladores`]

    return(
        <>
        <select className={`bg-white uppercase rounded-xl`}>
                {Opciones.map((opcion, index)=>
                <option key={index} value={opcion}>{opcion}</option>)}

        </select>
        </>
    )
}

export default TestComp;