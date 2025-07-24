import Navbar from "../../components/NavLogin.jsx";

export function PreRegAsesor() {
  return (
    <div>
        <Navbar />
        <div className="flex justify-center items-center">

          <div className="flex flex-col p-8">
            <h2 className="text-3xl font-semibold text-center text-gray-900 mb-10">Registro previo de los datos generales</h2>
            <p className='text-center'>Este es un pre-registro del proceso de reclutamiento para dar espacio a que realices las pruebas y test psicológicos que MQerKAcademy aplica a sus futuros asesores.</p>
            <form className={`flex select-none py-8 flex-col relative flex-wrap gap-y-2 md:grid md:grid-cols-2 md:gap-x-4`}>

              <label className="flex flex-col text-sm font-medium text-gray-900">Nombre(s):
              <input
              autoCapitalize="words"
              autoComplete="given-name"
              type="text"
              id="nombre"
              name="firstName"
              className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Introduzca su nombre"
              />
              </label>


              <label className="flex flex-col text-sm font-medium text-gray-900">Apellidos:
              <input
              type="text"
              id="apellidos"
              name="lastName"
              className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Introduzca sus apellidos"
              />
              </label>

              <label className="flex flex-col text-sm font-medium text-gray-900">Correo:
              <input
              type="email"
              id="email"
              name="correo"
              className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Introduzca su correo"
              />
              </label>


              <label className="flex flex-col text-sm font-medium text-gray-900">Numero de teléfono:
              <input
              type="tel"
              id="tel"
              name="tel"
              className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Introduzca su número de teléfono"
              />
              </label>


              <label className="flex flex-col text-sm font-medium text-gray-900">
              Área de especialización:
              <select
              defaultValue={0}
                  className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                  <option disabled value={0}>Selecciona una opción</option>
                  <option value="Ciencias Exactas">Ciencias Exactas</option>
                  <option value="Ciencias de la Salud">Ciencias de la Salud</option>
                  <option value="Ciencias Económico - Administrativo">Ciencias Económico - Administrativo</option>
                  <option value="Ingeniería">Ingeniería</option>
                  <option value="Tecnología">Tecnología</option>
                  <option value="Ciencias Químico - Biológico">Ciencias Químico - Biológico</option>
                  <option value="Ciencias Sociales y humanidades">Ciencias Sociales y humanidades</option>
              </select>
              </label>


              <label className="flex flex-col text-sm font-medium text-gray-900">
              Grado de estudios:
              <select
                  id="Grade"
                  name="Grade"
                  defaultValue={0}
                  className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                  <option disabled value={0}>Selecciona una opción</option>
                  <option value="Licenciatura">Licenciatura</option>
                  <option value="Maestría">Maestría</option>
                  <option value="Técnico">Técnico</option>
                  <option value="Especialista">Especialista</option>
              </select>
              </label>


              <label className="flex flex-col text-sm font-medium text-gray-900">Introduzca su ID:
              <input
              type="text"
              id="idAsesor"
              name="idAsesor"
              className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Introduzca el ID que le fue proporcionado"
              />
              </label>

              <div className="flex justify-end py-4 sm:py-0 items-end">
                  <button
                  type="submit"
                  className="px-8 py-3 bg-blue-400 sm:absolute -bottom-20 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                  >
                  Continuar
                  </button>
              </div>
            </form>
          </div>
        </div>
    </div>
  )
}