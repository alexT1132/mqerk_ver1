import React from "react";
import { Link } from "react-router-dom";


export function BtnIndex({TextoBtn, to}){


    return(
        <>
        <Link to={to} className={``}>
            <button className={`overflow-hidden py-1.5 border-2 border-white bg-gradient-to-r from-[#5115bc] to-[#E6007E] bg-[length:120%_100%] bg-right rounded-3xl transition hover:bg-left duration-500 cursor-pointer`}>
                <p className={`text-2xl font-bold text-white`}>
                    {TextoBtn}
                </p>
                
            </button>
        </Link>

        </>
    )
}

export const Login=({to})=>{
  return(
    <>
    <Link to={to}>
      <button className={`border-2 border-white px-4 py-2 rounded-2xl bg-gradient-to-r from-[#5115bc] to-[#E6007E] transition bg-[length:120%_100%] ease-in-out bg-right hover:bg-left duration-500 cursor-pointer`}>
        <p className={`font-medium capitalize text-white`}>
          iniciar sesión
        </p>
      </button>
              
    </Link>
    </>
  );
}

export const Logos=({src, alt})=>{
    return(
        <img
            src={src}
            alt={alt}
            className="object-contain w-25 h-20"
        />
    )
}