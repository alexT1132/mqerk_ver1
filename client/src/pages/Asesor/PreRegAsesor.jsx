import Navbar from "../../components/NavLogin.jsx";
import { useForm } from "react-hook-form";
import { useAsesor } from "../../context/AsesorContext.jsx";
import { useNavigate } from "react-router-dom";

export function PreRegAsesor() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { preSignup, loading, error, datos1 } = useAsesor();
  const navigate = useNavigate();

  const onSubmite = handleSubmit(async (values) => {
    try {
      await preSignup(values);
      // Flujo directo al formulario (tests eliminados)
      navigate(`/registro_asesor?preregistroId=${preregistroId}`);
    } catch (e) {
      // error already stored in context
    }
  });

  return (
    <div className="h-screen">
      <Navbar />
      <div className="flex justify-center items-center overflow-hidden">
        {/* <!-- Tarjeta para móviles --> */}
        <div className="w-90 p-8 rounded-3xl md:hidden mb-5">
          <h2 className="text-2xl font-semibold text-center text-gray-900 mb-6">
            Registro previo de los datos generales
          </h2>
          <p className="mb-8 text-justify">
            Este es un pre-registro del proceso de reclutamiento para dar
            espacio a que realices las pruebas y test psicológicos que
            MQerKAcademy aplica a sus futuros asesores.
          </p>

          {error && (
            <div className="text-red-600 mb-4 text-center">{error}</div>
          )}
          {datos1 && (
            <div className="text-green-600 text-center mb-4">
              Preregistro guardado (ID {datos1.id})
            </div>
          )}
          <form onSubmit={onSubmite}>
            <div className="mb-6">
              <label
                htmlFor="nombre"
                className="block text-sm font-medium text-gray-900"
              >
                Nombre(s)
              </label>
              <input
                type="text"
                {...register("nombres", { required: "Nombre obligatorio" })}
                className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Introduce tu nombre"
                required
              />
              {errors.nombres && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.nombres.message}
                </p>
              )}
            </div>
            <div className="mb-6">
              <label
                htmlFor="apellidos"
                className="block text-sm font-medium text-gray-900"
              >
                Apellidos
              </label>
              <input
                type="text"
                {...register("apellidos", {
                  required: "Apellidos obligatorios",
                })}
                className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Introduce tus apellidos"
                required
              />
              {errors.apellidos && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.apellidos.message}
                </p>
              )}
            </div>
            <div className="mb-6">
              <label
                htmlFor="correo"
                className="block text-sm font-medium text-gray-900"
              >
                Correo
              </label>
              <input
                type="email"
                {...register("correo", {
                  required: "Correo obligatorio",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Formato de correo inválido",
                  },
                })}
                className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Introduce tu correo"
                required
              />
              {errors.correo && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.correo.message}
                </p>
              )}
            </div>
            <div className="mb-6">
              <label
                htmlFor="telefono"
                className="block text-sm font-medium text-gray-900"
              >
                Numero de telefono
              </label>
              <input
                type="tel"
                {...register("telefono", {
                  required: "Teléfono obligatorio",
                  pattern: {
                    value: /^[0-9+\-()\s]{8,20}$/,
                    message: "Teléfono inválido",
                  },
                })}
                className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Introduce tu numero de telefono"
                required
              />
              {errors.telefono && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.telefono.message}
                </p>
              )}
            </div>
            <div className="mb-6">
              <label
                htmlFor="pais"
                className="block text-sm font-medium text-gray-900"
              >
                Area de especialización
              </label>
              <select
                {...register("area", { required: "Área obligatoria" })}
                className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option selected value="">
                  Selecciona una opción
                </option>
                <option value="Ciencias Exactas">Ciencias Exactas</option>
                <option value="Ciencias de la Salud">
                  Ciencias de la Salud
                </option>
                <option value="Ciencias Económico - Administrativo">
                  Ciencias Económico - Administrativo
                </option>
                <option value="Ingeniería">Ingeniería</option>
                <option value="Tecnología">Tecnología</option>
                <option value="Ciencias Químico - Biológico">
                  Ciencias Químico - Biológico
                </option>
                <option value="Ciencias Sociales y humanidades">
                  Ciencias Sociales y humanidades
                </option>
              </select>
            </div>
            <div className="mb-6">
              <label
                htmlFor="pais"
                className="block text-sm font-medium text-gray-900"
              >
                Grado de estudio
              </label>
              <select
                {...register("estudios", {
                  required: "Grado de estudios obligatorio",
                })}
                className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option selected value="">
                  Selecciona una opción
                </option>
                {errors.area && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.area.message}
                  </p>
                )}
                {errors.estudios && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.estudios.message}
                  </p>
                )}
                <option value="Licenciatura">Licenciatura</option>
                <option value="Maestría">Maestría</option>
                <option value="Técnico">Técnico</option>
                <option value="Especialista">Especialista</option>
              </select>
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-5.5 bg-blue-400 text-white rounded-lg hover:bg-blue-600 transition duration-300 disabled:opacity-50"
              >
                {loading ? "Guardando..." : "Continuar"}
              </button>
            </div>
          </form>
        </div>

        {/* <!-- Tarjeta para computadoras --> */}
        <div className="hidden md:flex w-260 p-8 rounded-3xl d-flex flex-col">
          <h2 className="text-3xl font-semibold text-center text-gray-900 mb-10">
            Registro previo de los datos generales
          </h2>
          <p className="text-center mb-10">
            Este es un pre-registro del proceso de reclutamiento para dar
            espacio a que realices las pruebas y test psicológicos que
            MQerKAcademy aplica a sus futuros asesores.
          </p>
          {error && (
            <div className="text-red-600 mb-4 text-center w-full">{error}</div>
          )}
          {datos1 && (
            <div className="text-green-600 text-center mb-4 w-full">
              Preregistro guardado (ID {datos1.id})
            </div>
          )}
          <form onSubmit={onSubmite}>
            <div className="hidden md:flex space-x-20 mb-6">
              {/* Campo Nombre (izquierda) */}
              <div className="flex-1">
                <label
                  htmlFor="nombre"
                  className="block text-sm font-medium text-gray-900"
                >
                  Nombre(s)
                </label>
                <input
                  type="text"
                  {...register("nombres", { required: "Nombre obligatorio" })}
                  className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Introduce tu nombre"
                  required
                />
                {errors.nombres && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.nombres.message}
                  </p>
                )}
              </div>

              {/* Campo Apellidos (derecha) */}
              <div className="flex-1">
                <label
                  htmlFor="apellidos"
                  className="block text-sm font-medium text-gray-600"
                >
                  Apellidos
                </label>
                <input
                  type="text"
                  {...register("apellidos", {
                    required: "Apellidos obligatorios",
                  })}
                  className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Introduce tus apellidos"
                  required
                />
                {errors.apellidos && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.apellidos.message}
                  </p>
                )}
              </div>
            </div>
            <div className="hidden md:flex space-x-20 mb-6">
              {/* Campo Nombre (izquierda) */}
              <div className="flex-1">
                <label
                  htmlFor="correo"
                  className="block text-sm font-medium text-gray-900"
                >
                  Correo
                </label>
                <input
                  type="email"
                  {...register("correo", {
                    required: "Correo obligatorio",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Formato de correo inválido",
                    },
                  })}
                  className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Introduce tu correo"
                  required
                />
                {errors.correo && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.correo.message}
                  </p>
                )}
              </div>

              {/* Campo Apellidos (derecha) */}
              <div className="flex-1">
                <label
                  htmlFor="telefono"
                  className="block text-sm font-medium text-gray-600"
                >
                  Numero de telefono
                </label>
                <input
                  type="tel"
                  {...register("telefono", {
                    required: "Teléfono obligatorio",
                    pattern: {
                      value: /^[0-9+\-()\s]{8,20}$/,
                      message: "Teléfono inválido",
                    },
                  })}
                  className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Introduce tu numero de telefono"
                  required
                />
                {errors.telefono && (
                  <p className="text-red-600 text-xs mt-1">
                    {errors.telefono.message}
                  </p>
                )}
              </div>
            </div>
            <div className="hidden md:flex space-x-20 mb-6">
              <div className="flex-1">
                <label
                  htmlFor="pais"
                  className="block text-sm font-medium text-gray-600"
                >
                  Area de especialización
                </label>
                <select
                  {...register("area", { required: "Área obligatoria" })}
                  className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option selected value="">
                    Selecciona una opción
                  </option>
                  <option value="Ciencias Exactas">Ciencias Exactas</option>
                  <option value="Ciencias de la Salud">
                    Ciencias de la Salud
                  </option>
                  <option value="Ciencias Económico - Administrativo">
                    Ciencias Económico - Administrativo
                  </option>
                  <option value="Ingeniería">Ingeniería</option>
                  <option value="Tecnología">Tecnología</option>
                  <option value="Ciencias Químico - Biológico">
                    Ciencias Químico - Biológico
                  </option>
                  <option value="Ciencias Sociales y humanidades">
                    Ciencias Sociales y humanidades
                  </option>
                </select>
              </div>

              <div className="flex-1">
                <label
                  htmlFor="pais"
                  className="block text-sm font-medium text-gray-600"
                >
                  Grado de estudio
                </label>
                <select
                  {...register("estudios", {
                    required: "Grado de estudios obligatorio",
                  })}
                  className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {errors.area && (
                    <p className="text-red-600 text-xs mt-1">
                      {errors.area.message}
                    </p>
                  )}
                  {errors.estudios && (
                    <p className="text-red-600 text-xs mt-1">
                      {errors.estudios.message}
                    </p>
                  )}
                  <option selected value="">
                    Selecciona una opción
                  </option>
                  <option value="Licenciatura">Licenciatura</option>
                  <option value="Maestría">Maestría</option>
                  <option value="Técnico">Técnico</option>
                  <option value="Especialista">Especialista</option>
                </select>
              </div>
            </div>
            <div className="hidden md:flex justify-end mb-6">
              <button
                type="submit"
                disabled={loading}
                className="w-40 py-3 mt-5.5 bg-blue-400 text-white rounded-lg hover:bg-blue-600 transition duration-300 disabled:opacity-50"
              >
                {loading ? "Guardando..." : "Continuar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
