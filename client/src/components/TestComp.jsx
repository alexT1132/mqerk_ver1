import React from "react";

export const SelectorPuntajes=({Inciso, id})=>{
    return(
        <>

        


        <div className={`flex flex-wrap items-center justify-between gap-x-10`}>
                <p className={`whitespace-normal break-normal`}>{Inciso}</p>

                <select
                    id={id}
                    defaultValue={`5`}
                    name="pais"
                    className="p-3 border border-gray-300 rounded-lg focus:outdivne-none focus:ring-2 focus:ring-blue-500"
                >
                    <option disabled value={`5`}>Selecciona un puntaje</option>
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                </select>
        </div>

       
        </>
    )
}

export const BtnInicio=({type, onClick})=>{
    return(
        <>
        <button type={type} onClick={onClick} className="w-40 py-3 bg-blue-500 rounded-xl hover:bg-blue-700 transition duration-300">
            <p className={`text-white text-2xl font-bold`}>
            Iniciar
            </p>
        </button> 
        </>
    )
}

export const BtnTest=({TextoBtn, type, onClick})=>{
    return(
        <button type={type} onClick={onClick} className="px-10 py-3 bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-300">
            <p className={`text-white break-normal`}>
                {TextoBtn}
            </p>
        </button>
    )
}

export const InstBigFive=()=>{
    return(
        <div className={`flex flex-col gap-3`}>
            <h2 className="text-2xl font-semibold text-center text-gray-900">TEST DE PERSONALIDAD - Big Five</h2>
            
            <section className={`py-4`}>
            <p className='text-center text-xl'>Instrucciones:</p>
            <p className='text-center text-xl'>Responde cada afirmación indicando qué tan de acuerdo estás con la afirmación. Usa la siguiente escala:</p>
            </section>
            
            
            <ol start={0} className={`flex flex-row flex-wrap gap-x-20 gap-y-5 justify-center text-center text-xl list-decimal list-inside`}>
                <li>
                    <p>Totalmente de acuerdo</p>
                </li>
                <li>
                    <p>En desacuerdo</p>
                </li>
                <li>
                    <p>Neutral</p>
                </li>
                <li>
                    <p>De acuerdo</p>
                </li>
                <li>
                    <p>Totalmente de acuerdo</p>
                </li>
            </ol>
        
        </div>
    )
}

export const InstDass21=()=>{
    return(
        <div className={`flex flex-col gap-3`}>
            <h2 className="text-2xl font-semibold text-center text-gray-900">TEST DASS-21</h2>
            
            <section className={`py-4`}>
            <p className='text-center text-xl'>Instrucciones:</p>
            <p className='text-center text-xl'>Responde a cada ítem considerando cómo te has sentido o comportado en la última semana, seleccionando una opción por cada afirmación:</p>
            </section>
            
            
            <ol start={0} className={`flex flex-row flex-wrap gap-x-20 gap-y-5 justify-center text-center text-xl list-decimal list-inside`}>
                <li>
                    <p>Nunca</p>
                </li>
                <li>
                    <p>Casi nunca</p>
                </li>
                <li>
                    <p>A veces</p>
                </li>
                <li>
                    <p>Frecuentemente</p>
                </li>
                <li>
                    <p>Muy frecuentemente</p>
                </li>
            </ol>
        
        </div>
    )
}

export const TestComp=()=>{
    return(
        <div className={`bg-[#1f1f1f] w-full h-full`}>
        <BtnSiguiente/>
        </div>
    )
}