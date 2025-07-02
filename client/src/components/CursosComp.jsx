import React, {useState, useEffect} from "react";

const TestComp=()=>{
    return(
        <div className={`bg-[#1f1f1f] h-dvh flex items-center justify-center`}>
        <BtnDesplegable/>
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
        className={`bg-white uppercase font-black sm:font-bold rounded-xl p-2 cursor-pointer text-xs sm:text-xl md:text-2xl text-[#53289f]`}
        value={selected}
        onChange={handleChange}
        >
                {Opciones.map((opcion, index)=>
                <option className={`font-bold`} key={index} value={opcion}>{opcion}</option>)}

        </select>
        </>
    )
}

export default TestComp;