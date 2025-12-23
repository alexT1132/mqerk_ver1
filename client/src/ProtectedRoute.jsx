import { useAuth } from "./context/AuthContext";
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

function ProtectedRoute() {
    const { loading, isAuthenticated } = useAuth();
    const location = useLocation();

    // Redirigir inmediatamente cuando se pierde la autenticación (incluso después de cargar)
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            // Limpiar datos locales cuando se pierde la autenticación
            try {
                const path = location.pathname;
                // No limpiar si ya estamos en login o rutas públicas
                if (!path.startsWith('/login') && !path.startsWith('/pre_registro')) {
                    // Limpiar datos sensibles pero mantener preferencias
                    try {
                        localStorage.removeItem('mq_user');
                        localStorage.removeItem('rememberMe');
                        sessionStorage.clear();
                    } catch (e) {
                        console.warn('Error al limpiar datos locales:', e);
                    }
                    // Redirigir al login con la ruta actual como parámetro para redirigir después
                    window.location.href = `/login?redirect=${encodeURIComponent(path)}`;
                }
            } catch (e) {
                console.error('Error en ProtectedRoute redirect:', e);
                window.location.href = '/login';
            }
        }
    }, [loading, isAuthenticated, location.pathname]);

    if (loading) return <h1>Loading...</h1>
    if (!loading && !isAuthenticated) return <Navigate to='/login' replace />
    
    return <Outlet />;
}

export default ProtectedRoute;