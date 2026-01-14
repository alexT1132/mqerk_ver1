// Componente de Cerrar Sesión
// Este componente maneja la funcionalidad de logout del estudiante
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { logoutRequest } from '../../api/usuarios.js';

/**
 * Componente de cerrar sesión optimizado
 * Maneja el logout sin recargar toda la página
 */
export function CerrarSesion_Alumno_comp() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [status, setStatus] = useState('processing'); // processing, success, error

  useEffect(() => {
    const doLogout = async () => {
      try {
        // Intentar logout en el servidor
        await logoutRequest();
        setStatus('success');
      } catch (error) {
        // Silenciar: logout client-side de todas formas
        console.warn('Fallo en logout del servidor, continuando con logout local');
        setStatus('success'); // Continuar aunque falle el servidor
      }

      // Logout del contexto limpia cookies/localStorage
      await logout();

      // Pequeño delay para mostrar el mensaje de éxito
      setTimeout(() => {
        // Redirigir a login sin recargar la página
        navigate('/login', { replace: true });
      }, 800);
    };

    doLogout();
  }, [navigate, logout]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full mx-4">
        <div className="text-center">
          {/* Icono animado */}
          <div className="mx-auto w-16 h-16 mb-6 relative">
            {status === 'processing' && (
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
            )}
            {status === 'success' && (
              <svg
                className="w-16 h-16 text-green-500 animate-bounce"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </div>

          {/* Título */}
          <h1 className="text-2xl font-bold text-gray-800 mb-3">
            {status === 'processing' ? 'Cerrando Sesión...' : '¡Sesión Cerrada!'}
          </h1>

          {/* Mensaje */}
          <p className="text-gray-600">
            {status === 'processing'
              ? 'Estamos cerrando tu sesión de forma segura.'
              : 'Redirigiendo a la página de inicio de sesión...'}
          </p>

          {/* Barra de progreso */}
          {status === 'processing' && (
            <div className="mt-6 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2 rounded-full animate-pulse w-3/4"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CerrarSesion_Alumno_comp;