import React from "react";
import { useEffect, useRef, useState } from "react";

export function Notificaciones(){

    const [noti, setNoti]=useState(false);
    const abrirNotificaciones=useRef(null);

    useEffect(()=>{
      function handleClick(e){
        if(abrirNotificaciones.current && !abrirNotificaciones.current.contains(e.target)){
          setNoti(false)
        }
      }
      document.addEventListener('click', handleClick);

      return()=>{
        document.removeEventListener('click', handleClick);
      };

    }, []);

    const Notificacion1=<p>Hola</p>


    return(
    <>
    <div ref={abrirNotificaciones} className="relative inline-block">
    <button className='cursor-pointer' onClick={()=>setNoti(!noti)}>
      <svg className='max-sm:h-[5vh]' xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="48px" fill="#e3e3e3"><path d="M160-200v-60h80v-304q0-84 49.5-150.5T420-798v-22q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v22q81 17 130.5 83.5T720-564v304h80v60H160Zm320-302Zm0 422q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM300-260h360v-304q0-75-52.5-127.5T480-744q-75 0-127.5 52.5T300-564v304Z"/></svg>
    </button>
    {noti &&(
    
    <AbrirNotificaciones Notificacion1={Notificacion1} Notificacion2='es' Notificacion3='de prueba'/>
    
    )
    }
    </div>
    </>

    );
}

export function AbrirNotificaciones({Notificacion1, Notificacion2, Notificacion3}){

  
  return(
    <div className="absolute top-full right-0 mt-2 w-64 bg-white shadow-lg rounded-lg p-4 z-50">
      <div>
        <ul>
          <li>{Notificacion1}</li>
          <li>{Notificacion2}</li>
          <li>{Notificacion3}</li>
        </ul>
      </div>
    </div>
  );
}

export function PerfilMenu(){

    return(
    <>
    <button className='cursor-pointer max-sm:hidden' onClick={()=>setPerfil(!perfil)}>
      <svg className='max-sm:h-[5vh]' xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="48px" fill="#e3e3e3"><path d="M222-255q63-44 125-67.5T480-346q71 0 133.5 23.5T739-255q44-54 62.5-109T820-480q0-145-97.5-242.5T480-820q-145 0-242.5 97.5T140-480q0 61 19 116t63 109Zm257.81-195q-57.81 0-97.31-39.69-39.5-39.68-39.5-97.5 0-57.81 39.69-97.31 39.68-39.5 97.5-39.5 57.81 0 97.31 39.69 39.5 39.68 39.5 97.5 0 57.81-39.69 97.31-39.68 39.5-97.5 39.5Zm.66 370Q398-80 325-111.5t-127.5-86q-54.5-54.5-86-127.27Q80-397.53 80-480.27 80-563 111.5-635.5q31.5-72.5 86-127t127.27-86q72.76-31.5 155.5-31.5 82.73 0 155.23 31.5 72.5 31.5 127 86t86 127.03q31.5 72.53 31.5 155T848.5-325q-31.5 73-86 127.5t-127.03 86Q562.94-80 480.47-80Zm-.47-60q55 0 107.5-16T691-212q-51-36-104-55t-107-19q-54 0-107 19t-104 55q51 40 103.5 56T480-140Zm0-370q34 0 55.5-21.5T557-587q0-34-21.5-55.5T480-664q-34 0-55.5 21.5T403-587q0 34 21.5 55.5T480-510Zm0-77Zm0 374Z"/></svg>
    </button>
    </>

    );
}