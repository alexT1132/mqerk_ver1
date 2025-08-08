// BACKEND: Componente de Cerrar Sesión
// Este componente maneja la funcionalidad de logout del estudiante
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * BACKEND: Componente de cerrar sesión
 * Esta página debe implementar la funcionalidad de logout completa
 */
export function CerrarSesion_Alumno_comp() {
  const navigate = useNavigate();

  useEffect(() => {
    // BACKEND: TODO - Implementar lógica de logout
    const logout = async () => {
      try {
        // TODO: Llamada a endpoint /api/auth/logout
        // await fetch('/api/auth/logout', {
        //   method: 'POST',
        //   headers: {
        //     'Authorization': `Bearer ${localStorage.getItem('token')}`
        //   }
        // });
        
        console.log('Cerrando sesión...');
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
      }
      
      // TODO: Limpiar datos locales
      // localStorage.clear();
      // sessionStorage.clear();
      
      // TODO: Redirigir a login
      // navigate('/login');
    };
    
    logout();
  }, [navigate]);

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