import React from "react";
import { Link } from "react-router-dom";
import { GrLogin } from "react-icons/gr";


export function BtnIndex({TextoBtn, to}){


    return(
        <>
        <Link to={to} className={`flex flex-wrap`}>
            <button className={`py-1.5 border-2 w-52 border-white bg-gradient-to-r from-[#5115bc] to-[#E6007E] bg-[length:120%_100%] bg-right rounded-3xl transition hover:bg-left duration-500 cursor-pointer`}>
                <p className={`text-2xl overflow-hidden whitespace-nowrap font-bold text-white`}>
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
    <Link to={to} className={`flex items-center`}>
      <button className={`border-2 border-white w-full h-full object-contain overflow-hidden rounded-2xl bg-gradient-to-r from-[#5115bc] to-[#E6007E] transition bg-[length:120%_100%] ease-in-out bg-right hover:bg-left duration-500 cursor-pointer`}>
        <p className={`font-medium p-2 capitalize text-white max-sm:hidden`}>
          iniciar sesión
        </p>
        <div className={`flex justify-center text-3xl text-white sm:hidden w-full h-full p-2`}>
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M480-120v-80h280v-560H480v-80h280q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H480Zm-80-160-55-58 102-102H120v-80h327L345-622l55-58 200 200-200 200Z"/></svg>
        </div>
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