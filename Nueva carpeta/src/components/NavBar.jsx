import React, { useState } from 'react';
import Logo from "../assets/MQerK_logo.png";
import { BtnSideBar } from './SideBarComp';
import { Notificaciones, PerfilMenu } from './NavBarComp';


function Navbar() {



  return (
    <>

    <header className='flex items-center bg-linear-to-r from-[#3d18c3] to-[#4816bf] fixed w-screen h-[13vh] max-sm:h-min'>
      
      <div className='flex items-center w-[12%]'>
      <BtnSideBar/>

      
      
      <a className='flex items-center w-30'><img src={Logo} alt="Logo de MQerk Academy" /></a>

      </div>
    


      <h1 className='text-center max-sm:text-sm text-white font-bold text-2xl'>Asesores Especializados en la Enseñanza de las Ciencias y Tecnología </h1>
        
      <div className='flex items-baseline w-[12%] justify-end'>
      <Notificaciones/>

      <PerfilMenu/>
      </div>

    
    

    </header>

    
    </>



    
  );
}

export default Navbar;
