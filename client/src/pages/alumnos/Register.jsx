import { useEffect } from 'react';
import Navlogin from "../../components/NavLogin";
import { FaUser, FaLock, FaArrowRight } from 'react-icons/fa';
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Register() {

    const { signup, isVerde } = useAuth();

    const { register, handleSubmit } = useForm();

    const navigate = useNavigate();

    const datosRegistro = JSON.parse(localStorage.getItem('datosRegistro'));
    const datosRole = JSON.parse(localStorage.getItem('role')); 

    console.log(datosRole);

    const onsubmite = handleSubmit((data) => {
        const datosCompletos = {
        ...data,
        role: datosRole,
        id_estudiante: datosRegistro?.id,
    };

    signup(datosCompletos);        
    });

    useEffect(() => {
      if(isVerde){
        navigate('/login'); // Redirige al login después del registro
      }
    }, [signup])

  return (
    <div className="h-screen flex flex-col bg-[#3c24ba] overflow-hidden">
        <Navlogin />
        <div className="flex items-center justify-center mt-35">
            <form onSubmit={onsubmite} className="bg-white rounded-3xl shadow-2xl p-8 w-[90%] max-w-sm h-[110%]">
                <h2 className="text-2xl md:text-3xl font-extrabold text-center text-purple-800 mb-6">
                CREA TU USUARIO
                </h2>

                {/* Campo de usuario */}
                <div className="flex items-center gap-3 mb-5">
                <FaUser className="text-purple-700 text-xl" />
                <input
                    type="text"
                    placeholder="Usuario"
                    {...register('usuario')}
                    required
                    autoComplete="off"
                    className="w-full border border-gray-300 px-4 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                </div>

                {/* Campo de contraseña */}
                <div className="flex items-center gap-3 mb-8">
                <FaLock className="text-purple-700 text-xl" />
                <input
                    type="password"
                    placeholder="Contraseña"
                    {...register('contraseña')}
                    required
                    autoComplete="off"
                    className="w-full border border-gray-300 px-4 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                </div>

                {/* Botón */}
                <button className="flex items-center justify-center gap-2 bg-purple-700 hover:bg-purple-800 text-white font-semibold px-6 py-2 rounded-lg w-full transition duration-200">
                Continuar
                <FaArrowRight />
                </button>
            </form>
        </div>
    </div>
  )
}

export default Register