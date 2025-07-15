import { FaUser, FaLock  } from "react-icons/fa";

export function CardRegistroEstudiante(){

    const inputClass='w-full h-[50px] rounded-lg px-2 sm:text-xl shadow-[1px_1px_8px_2px_rgba(0,0,0,0.4)] transition-shadow duration-300 focus:outline-none focus:[box-shadow:0px_0px_4px_2px_rgba(20,153,236,0.6)]'

    const contenedorClass='flex justify-between items-center gap-3'

    const iconClass='hidden sm:flex justify-center items-center text-[#6527d1] text-[38px] mx-4'

    

    return (

        <form className="flex flex-col m-3 items-center bg-white w-fit h-fit py-8 px-8 gap-10 border-2 border-solid rounded-[20px]">
            <h1 className="text-[#6527d1] text-xl sm:text-4xl text-center font-bold uppercase">Crea tu usuario</h1>
            <div className="flex flex-col w-ful gap-6">
                <div className={contenedorClass}>
                    <FaUser
                    className={iconClass}
                    />
                    <input 
                    type="text" 
                    className={inputClass}
                    placeholder="Crea tu usuario" 
                    />


                </div>


                <div className={contenedorClass}>
                    <FaLock
                    className={iconClass}
                    />
                    <input 
                    type="password" 
                    className={inputClass}
                    placeholder="Crea tu contraseña" 
                    />
                </div>
                </div>
            <button className="sm:h-[50px] w-[130px] text-xl bg-[#5115bc] rounded-[15px] text-white font-bold hover:bg-[#3d0e8f]">
                Continuar
            </button>
        </form>
      
    );
  }