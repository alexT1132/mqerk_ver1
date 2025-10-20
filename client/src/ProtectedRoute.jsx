import { useAuth } from "./context/AuthContext";
import { Navigate, Outlet } from 'react-router-dom';
import { LoadingPage } from "./LoadingPage";

function ProtectedRoute() {

    const {loading, isAuthenticated} = useAuth();

    if (loading) return <LoadingPage />;
    if (!loading && !isAuthenticated) return <Navigate to='/login' replace />
    
    return <Outlet />;
}

export default ProtectedRoute;