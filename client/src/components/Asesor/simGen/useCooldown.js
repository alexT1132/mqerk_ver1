import { useState, useEffect, useRef } from 'react';
import { getCooldownRemainingMs } from './formulaUtils';

/**
 * Hook optimizado para manejar cooldown con requestAnimationFrame
 * Evita re-renders constantes y mejora rendimiento
 */
export function useCooldown(active = true) {
  const [cooldownMs, setCooldownMs] = useState(0);
  const animationFrameId = useRef(null);
  const lastUpdateTime = useRef(Date.now());

  const updateCooldown = () => {
    const now = Date.now();
    // Solo actualizar el estado máximo cada 500ms para evitar re-renders excesivos
    if (now - lastUpdateTime.current >= 500) {
      const remaining = getCooldownRemainingMs();
      setCooldownMs(remaining);
      lastUpdateTime.current = now;
      
      // Si ya no hay cooldown, detener la animación
      if (remaining <= 0) {
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
          animationFrameId.current = null;
        }
        return;
      }
    }
    
    // Continuar la animación
    animationFrameId.current = requestAnimationFrame(updateCooldown);
  };

  useEffect(() => {
    if (!active) {
      // Limpiar animación si no está activo
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      return;
    }

    // Inicializar con el valor actual
    setCooldownMs(getCooldownRemainingMs());
    
    // Iniciar loop de animación
    animationFrameId.current = requestAnimationFrame(updateCooldown);

    return () => {
      // Limpiar al desmontar
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    };
  }, [active]);

  // Función para forzar actualización (ej: después de iniciar nuevo cooldown)
  const refreshCooldown = () => {
    setCooldownMs(getCooldownRemainingMs());
  };

  // Helper para formatear tiempo restante
  const getFormattedTime = () => {
    if (cooldownMs <= 0) return { seconds: 0, formatted: '0s' };
    
    const seconds = Math.ceil(cooldownMs / 1000);
    const mins = Math.floor(seconds / 60);
    const remainingSecs = seconds % 60;
    
    if (mins > 0) {
      return {
        seconds,
        formatted: `${mins} min${mins > 1 ? 's' : ''}${remainingSecs > 0 ? ` ${remainingSecs}s` : ''}`
      };
    }
    return { seconds, formatted: `${seconds}s` };
  };

  return {
    cooldownMs,
    isActive: cooldownMs > 0,
    formattedTime: getFormattedTime().formatted,
    secondsRemaining: getFormattedTime().seconds,
    refreshCooldown
  };
}