import React, { useState, useEffect, useRef } from 'react';
import MQerkLogo from "../assets/MQerK_logo.png";
import { Logos } from "./IndexComp.jsx";
import { Link } from "react-router-dom";

function NavbarAdmin1({Seccion}) {

  return (
    <>
    <header className='flex items-center justify-between z-50 bg-gradient-to-r from-[#3d18c3] to-[#4816bf] sticky top-0 left-0 w-full px-3 sm:px-6 py-3'>
      
      {/* Sección izquierda - Logo */}
      <div className='flex items-center justify-center h-full'>
        <Link to={`/`} className='flex items-center justify-center'>
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
            <Logos src={MQerkLogo}/>
          </div>
        </Link>
      </div>
    
      {/* Sección central - Títulos */}
      <div className='flex flex-col justify-center items-center flex-1 px-4'>
        {/* Título principal */}
        <h1 className='text-center text-base sm:text-xl md:text-2xl text-white font-extrabold mb-1'>
          ADMIN 1
        </h1>
        
        {/* Subtítulo - responsive */}
        <h2 className='hidden sm:block text-center text-sm md:text-base text-white font-bold tracking-wide leading-tight'>
          Asesores Especializados en la Enseñanza de las Ciencias y Tecnología
        </h2>
        
        {/* Subtítulo para móviles */}
        <h2 className='block sm:hidden text-center text-sm text-white font-bold'>
          MQerK Academy
        </h2>
        
        {Seccion && (
          <h3 className='text-center font-bold text-[#f4138a] text-sm sm:text-lg mt-1'>
            {Seccion}
          </h3>
        )}
      </div>
        
      {/* Sección derecha - Iconos */}
      <div className='flex items-center justify-center gap-3 sm:gap-4 h-full'>
        
        {/* Indicador online - solo en desktop */}
       

        {/* Icono de notificaciones */}
        <div className='relative flex items-center justify-center'>
          <button className='flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors'>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff">
              <path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z"/>
            </svg>
          </button>
          {/* Badge de notificación */}
          <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold'>
            3
          </span>
        </div>

        {/* Avatar */}
        <div className='relative flex items-center justify-center'>
          <div className='flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-white shadow-lg bg-gradient-to-b from-orange-300 to-orange-400'>
            {/* Cara amarilla */}
            <div className='relative w-full h-full bg-gradient-to-b from-yellow-200 to-yellow-300'>
              {/* Cabello castaño */}
              <div className='absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-3 sm:w-10 sm:h-4 bg-gradient-to-b from-orange-600 to-orange-700 rounded-t-full'></div>
              
              {/* Ojos */}
              <div className='absolute top-3 left-2.5 sm:top-4 sm:left-3 w-0.5 h-0.5 sm:w-1 sm:h-1 bg-gray-800 rounded-full'></div>
              <div className='absolute top-3 right-2.5 sm:top-4 sm:right-3 w-0.5 h-0.5 sm:w-1 sm:h-1 bg-gray-800 rounded-full'></div>
              
              {/* Nariz */}
              <div className='absolute top-4 sm:top-5 left-1/2 transform -translate-x-1/2 w-0.5 h-0.5 sm:w-0.5 sm:h-1 bg-yellow-400 rounded-full'></div>
              
              {/* Boca */}
              <div className='absolute top-5 sm:top-6 left-1/2 transform -translate-x-1/2 w-1.5 sm:w-2 h-0.5 bg-gray-700 rounded-full'></div>
              
              {/* Cuello y traje */}
              <div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-3 sm:w-8 sm:h-4 bg-gradient-to-b from-gray-600 to-gray-700 rounded-t-lg'>
                {/* Camisa blanca */}
                <div className='absolute top-0.5 sm:top-1 left-1/2 transform -translate-x-1/2 w-4 h-2 sm:w-4 sm:h-3 bg-white'></div>
                {/* Corbata roja */}
                <div className='absolute top-0.5 sm:top-1 left-1/2 transform -translate-x-1/2 w-0.5 h-2 sm:w-1 sm:h-3 bg-red-600'></div>
              </div>
            </div>
          </div>
          {/* Indicador de estado activo */}
          <div className='absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full'></div>
        </div>
      </div>
    </header>
    </>
  );
}

export default NavbarAdmin1;