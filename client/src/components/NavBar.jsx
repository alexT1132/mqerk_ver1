import React, { useState } from 'react';
import Logo from "../assets/MQerK_logo.png";
import { BtnSideBar } from './SideBarComp';
import { Notificaciones, PerfilMenu } from './NavBarComp';


function Navbar() {



  return (
    <>

    <header className='flex items-center place-content-around bg-linear-to-r from-[#3d18c3] to-[#4816bf] fixed w-full h-[13vh] max-sm:h-min'>
      
      <BtnSideBar/>

      
      
      <a className='flex items-center w-30'><img src={Logo} alt="Logo de MQerk Academy" /></a>

     
    


      <h1 className='text-center max-sm:text-sm text-white font-bold text-2xl'>Asesores Especializados en la Enseñanza de las Ciencias y Tecnología </h1>
        
      <Notificaciones/>

      <PerfilMenu/>

    
    

    </header>

    
    </>



    
  );
}

export default Navbar;
