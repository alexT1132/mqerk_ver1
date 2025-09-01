// utils/useIsMobile.js
import { useEffect, useState } from "react";

export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const onChange = (e) => setIsMobile(e.matches);

    setIsMobile(mq.matches);
    mq.addEventListener?.("change", onChange);
    mq.addListener?.(onChange); // fallback Safari viejo

    return () => {
      mq.removeEventListener?.("change", onChange);
      mq.removeListener?.(onChange);
    };
  }, [breakpoint]);

  return isMobile;
}