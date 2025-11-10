// BACKEND: Componente de Cerrar Sesión
// Este componente maneja la funcionalidad de logout del estudiante
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { logoutRequest } from '../../api/usuarios.js';

/**
 * BACKEND: Componente de cerrar sesión
 * Esta página debe implementar la funcionalidad de logout completa
 */
export function CerrarSesion_Alumno_comp() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
  const doLogout = async () => {
      try {
    await logoutRequest();
      } catch (error) {
        // Silenciar: logout client-side de todas formas
        console.warn('Fallo en logout del servidor, continuando con logout local');
      }
      // Logout del contexto limpia cookies/localStorage
      logout();
      // Redirigir a login
      navigate('/login', { replace: true });
    };

    doLogout();
  }, [navigate, logout]);

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold text-gray-600 text-center">
        Cerrando Sesión...
      </h1>
      <p className="text-center text-gray-500 mt-4">
        Redireccionando a la página de inicio de sesión.
      </p>
    </div>
  );
}

export default CerrarSesion_Alumno_comp;