import { useInactivityTimeout } from '../../hooks/useInactivityTimeout.jsx';
import { useNavigate } from 'react-router-dom';

/**
 * Componente que maneja el timeout de inactividad
 * Se aplica globalmente para todos los paneles (admin, alumno, asesor)
 * 
 * Tiempos de inactividad configurados:
 * - 60 minutos para asesores (3600000 ms) - tiempo extendido para trabajo administrativo
 * - 60 minutos para alumnos (3600000 ms) - más tiempo para estudio/práctica
 * - 45 minutos para administradores (2700000 ms) - tiempo moderado para tareas admin
 */
export function InactivityHandler() {
    const navigate = useNavigate();
    
    // Configurar timeout de 60 minutos (3600000 ms) de inactividad
    // Tiempo extendido para asesores que trabajan activamente en el sistema
    useInactivityTimeout(60 * 60 * 1000, () => {
        // Redirigir al login con mensaje de timeout
        navigate('/login?reason=timeout', { replace: true });
    });
    
    // Este componente no renderiza nada, solo maneja la lógica de inactividad
    return null;
}
