import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Hook para detectar inactividad del usuario y cerrar sesión automáticamente
 * después de un tiempo determinado (por defecto 1 hora)
 * 
 * @param {number} timeoutMinutes - Tiempo en minutos antes de cerrar sesión (default: 60)
 */
export const useInactivityTimeout = (timeoutMinutes = 60) => {
    const { isAuthenticated, logout } = useAuth();
    const timeoutRef = useRef(null);
    const lastActivityRef = useRef(Date.now());

    useEffect(() => {
        // Solo aplicar si el usuario está autenticado
        if (!isAuthenticated) {
            // Limpiar timeout si no está autenticado
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            return;
        }

        const timeoutMs = timeoutMinutes * 60 * 1000; // Convertir minutos a milisegundos
        lastActivityRef.current = Date.now();

        // Función para resetear el timer
        const resetTimer = () => {
            // Solo resetear si el usuario está autenticado
            if (!isAuthenticated) return;
            
            lastActivityRef.current = Date.now();
            
            // Limpiar el timeout anterior
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Establecer nuevo timeout
            timeoutRef.current = setTimeout(() => {
                const timeSinceLastActivity = Date.now() - lastActivityRef.current;
                
                // Verificar que realmente pasó el tiempo sin actividad
                if (timeSinceLastActivity >= timeoutMs && isAuthenticated) {
                    console.log('Sesión cerrada por inactividad (1 hora sin actividad)');
                    logout();
                }
            }, timeoutMs);
        };

        // Eventos que indican actividad del usuario
        const events = [
            'mousedown',
            'mousemove',
            'keypress',
            'scroll',
            'touchstart',
            'click',
            'keydown',
            'wheel'
        ];

        // Función para manejar cambios de visibilidad de la pestaña
        const handleVisibilityChange = () => {
            if (!document.hidden && isAuthenticated) {
                // Cuando la pestaña vuelve a estar visible, verificar si pasó mucho tiempo
                const timeSinceLastActivity = Date.now() - lastActivityRef.current;
                if (timeSinceLastActivity >= timeoutMs) {
                    // Si pasó el tiempo sin actividad, cerrar sesión
                    console.log('Sesión cerrada por inactividad (1 hora sin actividad)');
                    logout();
                } else {
                    // Si no pasó el tiempo, resetear el timer
                    resetTimer();
                }
            }
        };

        // Agregar listeners para todos los eventos de actividad
        events.forEach(event => {
            document.addEventListener(event, resetTimer, { passive: true });
        });

        // Agregar listener para cambios de visibilidad
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // También escuchar cuando la ventana recupera el foco
        const handleFocus = () => {
            if (isAuthenticated) {
                const timeSinceLastActivity = Date.now() - lastActivityRef.current;
                if (timeSinceLastActivity >= timeoutMs) {
                    console.log('Sesión cerrada por inactividad (1 hora sin actividad)');
                    logout();
                } else {
                    resetTimer();
                }
            }
        };
        window.addEventListener('focus', handleFocus);

        // Inicializar el timer
        resetTimer();

        // Cleanup: remover listeners y limpiar timeout
        return () => {
            events.forEach(event => {
                document.removeEventListener(event, resetTimer);
            });
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [isAuthenticated, logout, timeoutMinutes]);
};

