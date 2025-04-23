import React, { useState, useEffect, useRef } from 'react';
import Logo from "../assets/MQerK_logo.png";
import { BtnSideBar } from './SideBarComp';
import { Notificaciones, PerfilMenu } from './NavBarComp';


function Navbar() {

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

    <header className='flex z-10 items-center justify-between bg-linear-to-r from-[#3d18c3] to-[#4816bf] fixed w-screen h-[13vh] max-sm:h-min'>
      
      <div className='flex items-center'>
      <BtnSideBar Sidebar={Sidebar} setSidebar={setSidebar} abrirSidebar={abrirSidebar}/>

      
      
      <a className='flex items-center w-fit max-sm:hidden'><img className='w-30' src={Logo} alt="Logo de MQerk Academy" /></a>

      </div>
    


      <h1 className='text-center max-sm:text-sm text-white font-bold text-2xl'>Asesores Especializados en la Enseñanza de las Ciencias y Tecnología </h1>
        
      <div className='flex items-baseline justify-end sm:gap-x-10'>
      <Notificaciones/>

      <PerfilMenu/>
      </div>

    
    

    </header>

    
    </>



    
  );
}

export default Navbar;
