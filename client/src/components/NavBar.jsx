import React, { useState, useEffect, useRef } from 'react';
import Logo from "../assets/MQerK_logo.png";
import { BtnSideBar } from './SideBarComp';
import { Notificaciones, PerfilMenu } from './NavBarComp';
import MQerkLogo from "../assets/MQerK_logo.png";
import { Logos } from "./IndexComp.jsx";
import { Link } from "react-router-dom";


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

    <header className='flex items-center justify-between z-2 bg-linear-to-r py-2 h-fit from-[#3d18c3] to-[#4816bf] sticky top-0 left-0 m-auto max-sm:h-min'>
      <div className='flex relative items-center lg:w-70 lg:justify-between px-3'>
      <BtnSideBar className='z-2' Sidebar={Sidebar} setSidebar={setSidebar} abrirSidebar={abrirSidebar}/>

      
      
      <Link to={`/`} className={`lg:flex justify-center hidden px-5`}>
        <Logos src={MQerkLogo}/>
      </Link>

      </div>
    

      <div className={`flex justify-center items-center`}>
      <h1 className='flex justify-center h-10 overflow-hidden sm:h-fit text-center text-sm sm:text-xl md:text-2xl text-white z-0 font-bold'>Asesores Especializados en la Enseñanza de las Ciencias y Tecnología </h1>
      <h2 className='text-center font-bold text-[#f4138a] text-2xl'>{Seccion}</h2>
      </div>
        
      <div className='flex relative items-baseline md:w-60 md:justify-between justify-end px-2'>
      <Notificaciones/>

      <PerfilMenu navbar={`hidden sm:flex`}/>
      </div>

    
    
    </header>

    
    </>



    
  );
}

export default Navbar;
