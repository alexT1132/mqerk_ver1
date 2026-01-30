import { useState, useEffect, useCallback, useRef } from 'react';

export function useInactivityTimeout(timeoutMs = 300000, onTimeout) {
  const [isActive, setIsActive] = useState(true);
  const timerRef = useRef(null);

  const resetTimer = useCallback(() => {
    setIsActive(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsActive(false);
      if (onTimeout) onTimeout();
    }, timeoutMs);
  }, [timeoutMs, onTimeout]);

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [resetTimer]);

  return { isActive, resetTimer };
}
