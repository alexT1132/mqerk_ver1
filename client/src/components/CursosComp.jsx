import {useState, useEffect} from "react";

const TestComp=()=>{
    return(
        <div className={`bg-[#1f1f1f] h-dvh flex items-center justify-center`}>
        <BtnDesplegable/>
        <ModalCursos/>
        </div>
    )
}

export const BtnDesplegable=()=>{

    const Opciones = [`Actividades`, `Quizt`, `Simuladores`];
    const [selected, setSelected] = useState("");

    useEffect(() => {
    const saved = sessionStorage.getItem("opcionSeleccionada");
    if (saved && Opciones.includes(saved)) {
      setSelected(saved);
    }
    }, []);

    const handleChange = (e) => {
    setSelected(e.target.value);
    sessionStorage.setItem("opcionSeleccionada", e.target.value);
    };


    return(
        <>
        <select
        className={`flex bg-white uppercase font-semibold sm:font-bold rounded-xl p-1 cursor-pointer text-xs sm:text-xl md:text-2xl text-[#53289f]`}
        value={selected}
        onChange={handleChange}
        >
                {Opciones.map((opcion, index)=>
                <option className={`font-semibold sm:font-bold`} key={index} value={opcion}>{opcion}</option>)}
        </select>
        </>
    )
}

export const ModalCursos=()=>{
    return(
        <button className={`flex group rounded-full hover:bg-white relative cursor-pointer`}>
            <svg xmlns="http://www.w3.org/2000/svg" height="35px" viewBox="0 -960 960 960" width="35px" fill="#53289f"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg>
            <span className={`absolute opacity-0 hover:opacity-0 hover:bg- cursor-default group-hover:opacity-100 font-semibold transition-opacity duration-300 bg-amber-200 rounded-full pointer-events-none px-1 -top-6 -right-7 `}>Crear</span>
        </button>
    )
}




export default TestComp;