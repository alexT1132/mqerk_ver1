import NavLogin from "../../components/common/auth/NavLogin";
import { useLocation, useNavigate } from "react-router-dom";

export default function GraciasAsesor(){
  const location = useLocation();
  const navigate = useNavigate();
  const creds = location.state?.creds || null;
  return (
    <div>
      <NavLogin />
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-white rounded-xl shadow p-6 text-center">
          <h1 className="text-2xl font-semibold mb-2">¡Gracias por completar tu registro!</h1>
          <p className="text-sm text-gray-700 mb-4">Hemos finalizado tu proceso. Si tus credenciales fueron generadas, las verás a continuación.</p>
          {creds ? (
            <div className="mt-4 text-left border rounded p-4 bg-gray-50">
              <h2 className="font-semibold mb-2">Tus credenciales</h2>
              <div className="text-sm space-y-1">
                <div><span className="font-medium">Usuario:</span> {creds.usuario}</div>
                <div><span className="font-medium">Contraseña:</span> {creds.password}</div>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  className="text-xs bg-gray-800 text-white px-3 py-1 rounded hover:bg-black"
                  onClick={()=> navigator.clipboard.writeText(`${creds.usuario} ${creds.password}`)}
                >Copiar</button>
                <button
                  className="text-xs bg-purple-700 text-white px-3 py-1 rounded hover:bg-purple-800"
                  onClick={()=> navigate('/login')}
                >Ir a iniciar sesión</button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600">No se proporcionaron credenciales. Si ya finalizaste previamente, usa el botón siguiente para ir al inicio de sesión.</p>
          )}
          <div className="mt-6">
            <button
              className="text-sm text-purple-700 underline"
              onClick={()=> navigate('/login')}
            >Ir al inicio de sesión</button>
          </div>
        </div>
      </div>
    </div>
  );
}
