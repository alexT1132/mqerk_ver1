import { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const ResponsivePage = () => {
  const { register, handleSubmit } = useForm({
      defaultValues: { rememberMe: true }
    });

    const { signin, isAuthenticated, user, errors } = useAuth();

    const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = handleSubmit(async (data) => {
      if (submitting) return;
      setSubmitting(true);
      try {
        const payload = {
          ...data,
          usuario: (data.usuario || '').trim(),
          contraseña: (data.contraseña || '').trim(),
          rememberMe: Boolean(data.rememberMe)
        };
        await signin(payload);
      } finally {
        setSubmitting(false);
      }
    });

    useEffect(() => {
      if (!isAuthenticated) return;

      const role = (user?.role || '').toLowerCase();
      if (role === 'admin' || role === 'administrador' || role === 'administrativo') {
        // En tu App.jsx el bundle del admin está en "/administrativo/*"
        navigate('/administrativo', { replace: true });
        return;
      }
      if (role === 'estudiante') {
        navigate('/alumno', { replace: true });
        return;
      }
      if (role === 'asesor') {
        navigate('/asesor/dashboard', { replace: true });
        return;
      }
      // Rol desconocido: fallback seguro
      navigate('/', { replace: true });
    }, [isAuthenticated, user, navigate])


    return (
        <div className="flex flex-col justify-center items-center h-screen" style={{ backgroundColor: "#3818c3" }}>

        {
          errors.map((error, i) => (
            <div className="absolute top-40 bg-red-500 text-white p-2 rounded w-85 font-bold text-center py-3" key={i}>
              {error}
            </div>
          ))
        }

        {/* <!-- Tarjeta para móviles --> */}
        <div className="w-80 bg-white p-8 rounded-3xl shadow-lg md:hidden mb-25">
            <div className="flex justify-center mb-0">
                <FaUser className="text-5xl text-center mb-4 text-gray-400" />
            </div>
          <h2 className="text-2xl font-semibold text-center text-gray-400 mb-4">Iniciar sesión</h2>

          <form onSubmit={onSubmit}>
            <div className="mb-4">
              <label htmlFor="login-usuario-mobile" className="block text-sm font-medium text-gray-400">Usuario</label>
              <input
                type="text"
                id="login-usuario-mobile"
                className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Introduce tu correo electrónico"
                autoCapitalize="none"
                autoCorrect="off"
                inputMode="email"
                autoComplete="username"
                {...register("usuario", { required: true })}
              />
            </div>
      
            <div className="mb-6">
              <label htmlFor="login-password-mobile" className="block text-sm font-medium text-gray-400">Contraseña</label>
              <input
                type="password"
                id="login-password-mobile"
                className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="current-password"
                {...register("contraseña", { required: true })}
                placeholder="Introduce tu contraseña"
              />
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-gray-500 mb-4" htmlFor="remember-mobile">
              <input id="remember-mobile" type="checkbox" className="accent-blue-500" {...register("rememberMe")} />
              Recuérdame en este dispositivo
            </label>
      
            <button
              type="submit"
              disabled={submitting}
              aria-busy={submitting}
              className={`w-full py-3 text-white rounded-lg transition duration-300 ${submitting ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-400 hover:bg-blue-600'}`}
            >
              {submitting ? 'Iniciando…' : 'Iniciar sesión'}
            </button>
          </form>
          <p className="text-center mt-6">¿Haz olvidado tu contraseña?</p>
        </div>
      
        {/* <!-- Tarjeta para computadoras --> */}
        <div className="hidden md:flex w-90 bg-white p-8 rounded-3xl shadow-lg d-flex flex-col mb-20">
            <div className="flex justify-center mb-0">
                <FaUser className="text-5xl text-center mb-4 text-gray-400" />
            </div>
          <h2 className="text-3xl font-semibold text-center text-gray-400 mb-6">Iniciar sesión</h2>
      
          <form onSubmit={onSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-400">Usuario</label>
              <input
                type="text"
                {...register("usuario")}
                className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Introduce tu correo electrónico"
                required
                autoCapitalize="none"
                autoCorrect="off"
                inputMode="email"
                autoComplete="username"
              />
            </div>
      
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-400">Contraseña</label>
              <input
                type="password"
                {...register("contraseña")}
                className="mt-2 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Introduce tu contraseña"
                required
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="current-password"
              />
            </div>

            <div className="mb-4">
              <label className="inline-flex items-center gap-2 text-sm text-gray-500">
                <input type="checkbox" className="accent-blue-500" {...register("rememberMe")} />
                Recuérdame en este dispositivo
              </label>
            </div>
      
            <button
              type="submit"
              disabled={submitting}
              aria-busy={submitting}
              className={`w-full py-3 text-white rounded-lg transition duration-300 ${submitting ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-400 hover:bg-blue-600 cursor-pointer'}`}
            >
              {submitting ? 'Iniciando…' : 'Iniciar sesión'}
            </button>
          </form>
          <p className="text-center mt-10">¿Haz olvidado tu contraseña?</p>
        </div>
      </div>
      
    );
  }

export default ResponsivePage;