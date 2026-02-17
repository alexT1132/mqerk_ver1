import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export function useInactivityTimeout(timeoutMs = 300000, onTimeout) {
  const [isActive, setIsActive] = useState(true);
  const timerRef = useRef(null);
  const { logout, isAuthenticated } = useAuth();

  const handleTimeout = useCallback(async () => {
    setIsActive(false);
    
    // Solo cerrar sesión si el usuario está autenticado
    if (isAuthenticated) {
      try {
        await logout();
        // Llamar al callback personalizado si se proporciona
        if (onTimeout) onTimeout();
      } catch (error) {
        console.error('Error during logout:', error);
        // Forzar callback incluso si hay error
        if (onTimeout) onTimeout();
      }
    }
  }, [logout, isAuthenticated, onTimeout]);

  const resetTimer = useCallback(() => {
    setIsActive(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    
    // Solo configurar timer si está autenticado
    if (isAuthenticated) {
      timerRef.current = setTimeout(handleTimeout, timeoutMs);
    }
  }, [timeoutMs, handleTimeout, isAuthenticated]);

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    
    // Solo agregar listeners si está autenticado
    if (isAuthenticated) {
      events.forEach(event => window.addEventListener(event, resetTimer));
      resetTimer();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [resetTimer, isAuthenticated]);

  return { isActive, resetTimer };
}
