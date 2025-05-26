import React from "react";


export function BtnIndex({TextoBtn}){


    return(
        <>

            <button className={`max-sm:w-full overflow-hidden py-2 w-60 text-2xl font-bold border-2 bg-gradient-to-r from-[#5115bc] to-[#E6007E] bg-[length:120%_100%] ease-in-out bg-right text-white rounded-3xl transition hover:bg-left duration-500 cursor-pointer`}>
                {TextoBtn}
            </button>

        </>
    )
}