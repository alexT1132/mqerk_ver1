import React from 'react'
import Navbar from "../../components/NavLogin.jsx";

export function PreRegAsesor() {
  return (
    <div className='h-screen'>
        <Navbar />
        <div className="flex justify-center items-center overflow-hidden">
                {/* <!-- Tarjeta para móviles --> */}
                <div className="w-90 p-8 rounded-3xl md:hidden mb-5">
                <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">Registro previo de los datos generales</h2>
                <p className='mb-8 text-justify'>Este es un pre-registro del proceso de reclutamiento para dar espacio a que realices las pruebas y test psicológicos que MQerKAcademy aplica a sus futuros asesores.</p>

                  <form>
                    <div className="mb-6">
                        <label htmlFor="nombre" className="block text-sm font-medium text-gray-900">Nombre(s)</label>
                        <input
                        type="text"
                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Introduce tu nombre"
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="apellidos" className="block text-sm font-medium text-gray-900">Apellidos</label>
                        <input
                        type="text"
                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Introduce tus apellidos"
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="correo" className="block text-sm font-medium text-gray-900">Correo</label>
                        <input
                        type="text"
                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Introduce tu correo"
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="telefono" className="block text-sm font-medium text-gray-900">Numero de telefono</label>
                        <input
                        type="text"
                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Introduce tu numero de telefono"
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="pais" className="block text-sm font-medium text-gray-900">
                            Area de especialización
                        </label>
                        <select
                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option selected value="">Selecciona una opción</option>
                            <option value="Ciencias Exactas">Ciencias Exactas</option>
                            <option value="Ciencias de la Salud">Ciencias de la Salud</option>
                            <option value="Ciencias Económico - Administrativo">Ciencias Económico - Administrativo</option>
                            <option value="Ingeniería">Ingeniería</option>
                            <option value="Tecnología">Tecnología</option>
                            <option value="Ciencias Químico - Biológico">Ciencias Químico - Biológico</option>
                            <option value="Ciencias Sociales y humanidades">Ciencias Sociales y humanidades</option>
                        </select>
                    </div>
                    <div className="mb-6">
                        <label htmlFor="pais" className="block text-sm font-medium text-gray-900">
                            Grado de estudio
                        </label>
                        <select
                        id="pais"
                        name="pais"
                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option selected value="">Selecciona una opción</option>
                            <option value="Licenciatura">Licenciatura</option>
                            <option value="Maestría">Maestría</option>
                            <option value="Técnico">Técnico</option>
                            <option value="Especialista">Especialista</option>
                        </select>
                    </div>
                    <div className="mb-6">
                        <label htmlFor="nombre" className="block text-sm font-medium text-gray-900">Introduce tu ID</label>
                        <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Introduce el ID que te fue proporcionado"
                        />
                    </div>
                    <div>
                        <button
                        type="submit"
                        className="w-full py-3 mt-5.5 bg-blue-400 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                        >
                            Continuar
                        </button>
                    </div>
                  </form>
                </div>
              
                {/* <!-- Tarjeta para computadoras --> */}
                <div className="hidden md:flex w-260 p-8 rounded-3xl d-flex flex-col">
                  <h2 className="text-3xl font-semibold text-center text-gray-900 mb-10">Registro previo de los datos generales</h2>
                    <p className='text-center mb-10'>Este es un pre-registro del proceso de reclutamiento para dar espacio a que realices las pruebas y test psicológicos que MQerKAcademy aplica a sus futuros asesores.</p>
                  <form>
                    <div className="hidden md:flex space-x-20 mb-6">
                        {/* Campo Nombre (izquierda) */}
                            <div className="flex-1">
                                <label htmlFor="nombre" className="block text-sm font-medium text-gray-900">Nombre(s)</label>
                                <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Introduce tu nombre"
                                />
                            </div>

                            {/* Campo Apellidos (derecha) */}
                            <div className="flex-1">
                                <label htmlFor="apellidos" className="block text-sm font-medium text-gray-600">Apellidos</label>
                                <input
                                type="text"
                                id="apellidos"
                                name="apellidos"
                                className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Introduce tus apellidos"
                                />
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6">
                        {/* Campo Nombre (izquierda) */}
                            <div className="flex-1">
                                <label htmlFor="correo" className="block text-sm font-medium text-gray-900">Correo</label>
                                <input
                                type="text"
                                id="correo"
                                name="correo"
                                className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Introduce tu correo"
                                />
                            </div>

                            {/* Campo Apellidos (derecha) */}
                            <div className="flex-1">
                                <label htmlFor="telefono" className="block text-sm font-medium text-gray-600">Numero de telefono</label>
                                <input
                                type="text"
                                id="apellidos"
                                name="apellidos"
                                className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Introduce tu numero de telefono"
                                />
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6">
                        {/* Campo Nombre (izquierda) */}
                            <div className="flex-1">
                                <label htmlFor="pais" className="block text-sm font-medium text-gray-600">
                                    Area de especialización
                                </label>
                                <select
                                    id="pais"
                                    name="pais"
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona una opción</option>
                                    <option value="Ciencias Exactas">Ciencias Exactas</option>
                                    <option value="Ciencias de la Salud">Ciencias de la Salud</option>
                                    <option value="Ciencias Económico - Administrativo">Ciencias Económico - Administrativo</option>
                                    <option value="Ingeniería">Ingeniería</option>
                                    <option value="Tecnología">Tecnología</option>
                                    <option value="Ciencias Químico - Biológico">Ciencias Químico - Biológico</option>
                                    <option value="Ciencias Sociales y humanidades">Ciencias Sociales y humanidades</option>
                                </select>
                            </div>

                            {/* Campo Apellidos (derecha) */}
                            <div className="flex-1">
                                <label htmlFor="pais" className="block text-sm font-medium text-gray-600">
                                    Grado de estudio
                                </label>
                                <select
                                    id="pais"
                                    name="pais"
                                    className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option selected value="">Selecciona una opción</option>
                                    <option value="Licenciatura">Licenciatura</option>
                                    <option value="Maestría">Maestría</option>
                                    <option value="Técnico">Técnico</option>
                                    <option value="Especialista">Especialista</option>
                                </select>
                            </div>
                        </div>
                        <div className="hidden md:flex space-x-20 mb-6">
                        {/* Campo Nombre (izquierda) */}
                            <div className="flex-1">
                                <label htmlFor="nombre" className="block text-sm font-medium text-gray-900">Introduce tu ID</label>
                                <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Introduce el ID que te fue proporcionado"
                                />
                            </div>

                            {/* Campo Apellidos (derecha) */}
                            <div className="flex-1 flex justify-end items-end">
                                <button
                                type="submit"
                                className="w-40 py-3 mt-5.5 bg-blue-400 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                                >
                                Continuar
                                </button>
                            </div>
                        </div>
                  </form>
                </div>
        </div>
    </div>
  )
}