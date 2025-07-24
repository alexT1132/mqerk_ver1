import React from 'react'
import Navbar from '../../../components/mqerk/Navbar'
import Uno from "../../../assets/mqerk/exporientas/1.png";
import Dos from "../../../assets/mqerk/exporientas/2.png";
import { Link } from "react-router-dom";


function Talleres() {
  return (
    <div className='min-h-screen flex flex-col'>
      <Navbar />
      {/* DESKTOP */}
      <div className='hidden md:block'>
        <h1 className='mt-10 text-center font-bold text-[#401454] text-4xl'>EXPORIENTAS</h1>
        <h1 className='mt-6 text-center text-[#401454] text-4xl font-bold'>2025</h1>

        <div className='grid grid-cols-3 px-10 gap-10 mt-8'>

          <div className='flex flex-col rounded-2xl'>
            
          </div>

          <Link to='/mqerk/exporientas/feria_profesiografica' className='flex flex-col rounded-2xl hover:shadow-2xl py-3'>
            <div className="flex justify-center mb-6">
              <h1 className='font-bold text-xl text-[#401454] text-center'>Feria profesiografica</h1>
            </div>
            <img src={Uno} className='px-5' />
            <div>
              <p className='px-4 mt-2 text-justify text-lg'>
                Evento realizado para que los estudiantes de 6to semestre conozcan las oportunidades educativas que tiene la cuenca del papaloapan y sus alrededores.
              </p>
            </div>
            <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
              <p>05 de Marzo</p>
            </div>
          </Link>

          <div className='flex flex-col rounded-2xl'>
            
          </div>

        </div>

        <h1 className='mt-20 text-center text-[#401454] text-4xl font-bold'>2024</h1>

        <div className='grid grid-cols-3 px-10 gap-10 mt-8 mb-10'>

          <div className='flex flex-col rounded-2xl'>
            
          </div>

          <Link to='/mqerk/exporientas/exporienta_educativa' className='flex flex-col rounded-2xl hover:shadow-2xl py-3'>
            <div className="flex justify-center mb-6">
              <h1 className='font-bold text-xl text-[#401454] text-center'>1ra. EXPO ORIENTA EDUCATIVA 2024</h1>
            </div>
            <img src={Dos} className='px-5' />
            <div>
              <p className='px-4 mt-2 text-justify text-lg'>
                Expo Orienta Educativa del ciclo escolar 2024-2025. 
              </p>
            </div>
            <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
              <p>18 de octubre</p>
            </div>
          </Link>

          <div className='flex flex-col rounded-2xl'>
            
          </div>

        </div>

      </div>

      {/* MOVILE */}
      <div className='block md:hidden'>
      <h1 className='mt-25 text-center font-bold text-[#401454] text-4xl'>EXPORIENTAS</h1>
        <h1 className='mt-6 text-center text-[#401454] text-4xl font-bold'>2025</h1>

        <div className='grid grid-cols-1 px-10 gap-10 mt-8'>

          <Link to='/mqerk/exporientas/feria_profesiografica' className='flex flex-col rounded-2xl shadow-2xl py-3'>
            <div className="flex justify-center mb-6">
              <h1 className='font-bold text-xl text-[#401454] text-center'>Feria profesiografica</h1>
            </div>
            <img src={Uno} className='px-5' />
            <div>
              <p className='px-4 mt-2 text-justify text-lg'>
                Evento realizado para que los estudiantes de 6to semestre conozcan las oportunidades educativas que tiene la cuenca del papaloapan y sus alrededores.
              </p>
            </div>
            <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
              <p>05 de Marzo</p>
            </div>
          </Link>

        </div>

        <h1 className='mt-20 text-center text-[#401454] text-4xl font-bold'>2024</h1>

        <div className='grid grid-cols-1 px-10 gap-10 mt-8 mb-10'>

          <Link to='/mqerk/exporientas/exporienta_educativa' className='flex flex-col rounded-2xl shadow-2xl py-2'>
            <div className="flex justify-center mb-6">
              <h1 className='font-bold text-xl text-[#401454] text-center'>1ra. EXPO ORIENTA EDUCATIVA 2024</h1>
            </div>
            <img src={Dos} className='px-5' />
            <div>
              <p className='px-4 mt-2 text-justify text-lg'>
                Expo Orienta Educativa del ciclo escolar 2024-2025. 
              </p>
            </div>
            <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
              <p>18 de octubre</p>
            </div>
          </Link>

        </div>

      </div>
    </div>
  )
}

export default Talleres