import { useInactivityTimeout } from '../hooks/useInactivityTimeout';

/**
 * Componente que maneja el timeout de inactividad
 * Se aplica globalmente para todos los paneles (admin, alumno, asesor)
 */
export function InactivityHandler() {
    // Configurar timeout de 1 hora (60 minutos) de inactividad
    useInactivityTimeout(60);
    
    // Este componente no renderiza nada, solo maneja la lógica de inactividad
    return null;
}

