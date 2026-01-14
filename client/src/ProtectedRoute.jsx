import { useAuth } from "./context/AuthContext";
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';

function ProtectedRoute() {
    const { loading, isAuthenticated } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const hasRedirectedRef = useRef(false);

    // Redirigir inmediatamente cuando se pierde la autenticación (incluso después de cargar)
    useEffect(() => {
        if (!loading && !isAuthenticated && !hasRedirectedRef.current) {
            // Limpiar datos locales cuando se pierde la autenticación
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

                // Marcar que ya redirigimos para evitar loops
                hasRedirectedRef.current = true;

                // Redirigir al login con la ruta actual como parámetro para redirigir después
                // Usar navigate en lugar de window.location.href para evitar recarga completa
                navigate(`/login?redirect=${encodeURIComponent(path)}`, { replace: true });
            }
        }

        // Reset el flag cuando vuelve a autenticarse
        if (isAuthenticated) {
            hasRedirectedRef.current = false;
        }
    }, [loading, isAuthenticated, location.pathname, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Cargando...</p>
                </div>
            </div>
        );
    }

    if (!loading && !isAuthenticated) {
        return <Navigate to='/login' replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;