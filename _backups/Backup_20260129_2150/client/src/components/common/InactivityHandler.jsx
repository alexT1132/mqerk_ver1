import { useInactivityTimeout } from '../../hooks/useInactivityTimeout.jsx';

/**
 * Componente que maneja el timeout de inactividad
 * Se aplica globalmente para todos los paneles (admin, alumno, asesor)
 */
export function InactivityHandler() {
    // Configurar timeout de 1 hora (60 minutos) de inactividad
    // Convertir minutos a milisegundos: 60 * 60 * 1000 = 3600000
    useInactivityTimeout(60 * 60 * 1000);
    
    // Este componente no renderiza nada, solo maneja la lógica de inactividad
    return null;
}
