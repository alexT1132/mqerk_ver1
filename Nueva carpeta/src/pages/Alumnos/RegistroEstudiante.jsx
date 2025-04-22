import React from 'react';
import CardRegistroEstudiante from '../../components/EstudianteRegistroCard'
import Topbar from '../../components/NavLogin'

function RegistroEstudiante(){

    return(
        <div className='bg-linear-to-br from-[#3f33c7] to-[#3b32c9] h-full'>
        <Topbar/>
        <div className="flex mt-30 items-center content-center justify-center h-inherit w-inherit bg-inherit">
        <CardRegistroEstudiante/>
        </div>
        </div>


    );

}

export default RegistroEstudiante;