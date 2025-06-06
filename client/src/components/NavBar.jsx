import React, { useState, useEffect, useRef } from 'react';
import Logo from "../assets/MQerK_logo.png";
import { BtnSideBar } from './SideBarComp';
import { Notificaciones, PerfilMenu } from './NavBarComp';


function Navbar({Seccion}) {

  const [Sidebar, setSidebar]=useState(false);
  const abrirSidebar=useRef(null);

  useEffect(()=>{
        function handleClick(e){
          if(abrirSidebar.current && !abrirSidebar.current.contains(e.target)){
            setSidebar(false)
          }
        }
        document.addEventListener('click', handleClick);
  
        return()=>{
          document.removeEventListener('click', handleClick);
        };
  
      }, []);


  const [expandir, setExpandir] = useState(false);

  const toggleSidebar = () => setExpandir(!expandir);


  return (
    <>

    <header className='flex items-center justify-between bg-linear-to-r p-4 h-fit from-[#3d18c3] to-[#4816bf] sticky top-0 left-0 m-auto max-sm:h-min'>
      <div className='flex relative items-center gap-x-30 px-5'>
      <BtnSideBar className='z-2' Sidebar={Sidebar} setSidebar={setSidebar} abrirSidebar={abrirSidebar}/>

      
      
      <a className='flex relative items-center w-fit max-sm:hidden'><img draggable={false} className='w-25' src={Logo} alt="Logo de MQerk Academy" /></a>

      </div>
    

      <div>
      <h1 className='text-center relative max-sm:text-sm text-white z-0 font-bold text-3xl'>Asesores Especializados en la Enseñanza de las Ciencias y Tecnología </h1>
      <h2 className='text-center font-bold text-[#f4138a] text-2xl'>{Seccion}</h2>
      </div>
        
      <div className='flex relative items-baseline justify-end sm:gap-x-30 px-5'>
      <Notificaciones/>

      <PerfilMenu/>
      </div>

    
    
    </header>

    
    </>



    
  );
}

export default Navbar;
