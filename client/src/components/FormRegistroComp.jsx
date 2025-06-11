import React, {useState, useRef} from "react";

export const TestComp=()=>{
    return(
        <div className={`bg-[#1f1f1f] w-full h-full flex flex-col justify-center items-center`}>
        
        </div>
    );
};

export const BtnForm=({type, TextoBtn})=>{
    return(
        <button type={type} className={`bg-[#0064fb] rounded-[10px] p-3`}>
            <p className={`text-white`}>
            {TextoBtn}
            </p>
        </button>
    );
};

export const BtnSubirArchivo=()=>{

    const usarInput = useRef(null);

    const inputPointer=()=>{
        usarInput.current.click();

    };

    return(
        <button onClick={inputPointer} className={`flex justify-center items-center gap-2 bg-[#1976d2] shadow-md rounded-md w-full py-1.5 `}>
            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#e3e3e3"><path d="M440-200h80v-167l64 64 56-57-160-160-160 160 57 56 63-63v167ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520v-200H240v640h480v-440H520ZM240-800v200-200 640-640Z"/></svg>
            <p className={`text-white uppercase font-bol`}>
                Archivo
            </p>
            <input accept=".pdf,.doc,.docx" type='file' className='hidden' ref={usarInput}
            />
        </button>
    );
};