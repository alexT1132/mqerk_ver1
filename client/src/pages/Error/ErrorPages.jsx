import React from "react";
import { Link } from "react-router-dom";

export const Error404=()=>{
    return(
    
    <div className={`flex flex-col items-center justify-center h-dvh gap-10 bg-gradient-to-r from-[#3d18c3] to-[#4816bf] bg-[#4c4b4b]`}>
        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="250" height="250" x="0" y="0" viewBox="0 0 100 100" style={{background:`new 0 0 250 250`}} xml:space="preserve" className=""><g><path d="M50 98C23.533 98 2 76.467 2 50S23.533 2 50 2s48 21.533 48 48-21.533 48-48 48zm0-90C26.841 8 8 26.841 8 50s18.841 42 42 42 42-18.841 42-42S73.159 8 50 8zm22.342 62.684a3 3 0 0 0 1.342-4.025C73.404 66.1 66.663 53 50 53S26.596 66.1 26.316 66.658a2.994 2.994 0 0 0 1.332 4.012 3.008 3.008 0 0 0 4.028-1.315C31.893 68.932 37.13 59 50 59s18.107 9.932 18.316 10.342A2.995 2.995 0 0 0 71.003 71c.45 0 .908-.101 1.339-.316zM65 44c-3.309 0-6-2.691-6-6s2.691-6 6-6 6 2.691 6 6-2.691 6-6 6zm-30 0c-3.309 0-6-2.691-6-6s2.691-6 6-6 6 2.691 6 6-2.691 6-6 6z" fill="#ffffff" opacity="1" data-original="#000000" className=""></path></g></svg>
        <h1 className={`text-center text-white font-bold text-3xl`}>
            Error 404
            <p className={`font-normal text-white text-2xl`}>
                No encontrado
            </p>
        </h1>

        <div className={`flex flex-col items-center gap-5 p-0 m-0`}>
        <p className={`text-xl text-center text-white`}>
            ¡Lamentamos los inconvenientes¡ Vuelve a intentar a la web principal 😊
        </p>
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M440-800v487L216-537l-56 57 320 320 320-320-56-57-224 224v-487h-80Z"/></svg>
        <Link to={`/`} draggable={false} target={"_blank"}>
            <p className={`text-center w-fit font-semibold hover:underline active:text-blue-700 text-2xl`}>
                Regresar al inicio
            </p>
        </Link>
        </div>
    </div>

    )
}