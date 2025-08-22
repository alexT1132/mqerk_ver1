import React from 'react'
import Navbar from '../../../components/mqerk/Navbar'
import Uno from "../../../assets/mqerk/bootcamp/1.png";
import Dos from "../../../assets/mqerk/bootcamp/2.png";
import { Link } from "react-router-dom";
import Footer from "../../footer";

function Talleres() {
  return (
    <div className='min-h-screen flex flex-col'>
      <Navbar />
      {/* DESKTOP */}
      <div className='hidden md:block'>
        <h1 className='mt-10 text-center font-bold text-[#401454] text-4xl'>BOOTCAMP</h1>

        <h1 className='mt-10 text-center text-[#401454] text-4xl font-bold'>2024</h1>

        <div className='grid grid-cols-4 px-10 gap-10 mt-8'>

          <div className='flex flex-col rounded-2xl'>
            
          </div>

          <Link to='/bootcamps/veranoTX' className='flex flex-col rounded-2xl hover:shadow-2xl py-3 cursor-pointer'>
            <div className="flex justify-center mb-6 px-5">
              <h1 className='font-bold text-xl text-[#401454] text-center'>Verano misión TX 2024 </h1>
            </div>
            <img src={Uno} className='px-3 rounded-3xl' />
            <div>
              <p className='px-4 mt-2 text-justify text-lg'>
                Se llevó a cabo la participación de nuestros asesores en cienytec, Bajo el tema  Científicos del futuro: Ciencia y tecnología en acción en el espacio .
              </p>
            </div>
            <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
              <p>19 de agosto</p>
            </div>
          </Link>

          <Link to='/bootcamps/ecat' className='flex flex-col rounded-2xl hover:shadow-2xl py-3 cursor-pointer'>
            <h1 className='font-bold text-xl text-[#401454] text-center mb-6'>ECAT 2024</h1>
            <img src={Dos} className='px-3 h-55 rounded-2xl' />
            <div>
              <p className='px-4 text-justify text-lg'>
                Participación en el Evento de ciencia, arte y tecnología 2024 5ta edición, en compañía de los alumnos de las diferentes instituciones, estudiantes de nuestra academia y a colaboradores.
              </p>
            </div>
            <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
              <p>29 de Ferbrero</p>
            </div>
          </Link>

          <div className='flex flex-col rounded-2xl'>
            
          </div>

        </div>
      </div>

      {/* MOVILE */}
      <div className='block md:hidden'>
        <h1 className='mt-18 text-center font-bold text-[#401454] text-4xl'>BOOTCAMP</h1>

        <h1 className='mt-10 text-center text-[#401454] text-4xl font-bold'>2024</h1>

        <div className='grid grid-cols-1 px-10 gap-10 mt-8'>

          <Link to='/bootcamps/veranoTX' className='flex flex-col rounded-2xl shadow-2xl py-2'>
            <div className="flex justify-center mb-6 px-5">
              <h1 className='font-bold text-xl text-[#401454] text-center'>Verano misión TX 2024 </h1>
            </div>
            <img src={Uno} className='px-3 rounded-3xl' />
            <div>
              <p className='px-4 mt-2 text-justify text-lg'>
                Se llevó a cabo la participación de nuestros asesores en cienytec, Bajo el tema  Científicos del futuro: Ciencia y tecnología en acción en el espacio .
              </p>
            </div>
            <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
              <p>19 de agosto</p>
            </div>
          </Link>

          <Link to='/bootcamps/ecat' className='flex flex-col rounded-2xl shadow-2xl py-2'>
            <h1 className='font-bold text-xl text-[#401454] text-center mb-6'>ECAT 2024</h1>
            <img src={Dos} className='px-3 h-40' />
            <div>
              <p className='px-4 text-justify text-lg'>
                Participación en el Evento de ciencia, arte y tecnología 2024 5ta edición, en compañía de los alumnos de las diferentes instituciones, estudiantes de nuestra academia y a colaboradores.
              </p>
            </div>
            <div className='flex justify-end items-end h-full w-full mt-5 font-bold px-6'>
              <p>29 de Febrero</p>
            </div>
          </Link>

          <div className='flex flex-col rounded-2xl'>
            
          </div>

        </div>
      </div>

      <Footer />
    
    </div>
  )
}

export default Talleres