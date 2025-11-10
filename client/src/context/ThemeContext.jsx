import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext({
  theme: 'system', // 'light' | 'dark' | 'system'
  isDark: false,
  setTheme: () => {},
  toggleDark: () => {},
});

function getSystemPrefersDark() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyHtmlClass(isDark) {
  try {
    const root = document.documentElement;
    if (!root) return;
    root.classList.toggle('dark', Boolean(isDark));
  } catch {}
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof localStorage === 'undefined') return 'system';
    return localStorage.getItem('theme') || 'system';
  });
  const [isDark, setIsDark] = useState(false);

  // Compute and apply on mount + when theme changes
  useEffect(() => {
    const compute = () => {
      const dark = theme === 'dark' || (theme === 'system' && getSystemPrefersDark());
      setIsDark(dark);
      applyHtmlClass(dark);
    };
    compute();

    let media;
    if (theme === 'system' && typeof window !== 'undefined' && window.matchMedia) {
      media = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => compute();
      try { media.addEventListener('change', handler); } catch { media.addListener(handler); }
      return () => { try { media.removeEventListener('change', handler); } catch { media.removeListener(handler); } };
    }
  }, [theme]);

  const api = useMemo(() => ({
    theme,
    isDark,
    setTheme: (next) => {
      setTheme(next);
      try { localStorage.setItem('theme', next); } catch {}
    },
    toggleDark: () => {
      setTheme((prev) => {
        const next = (prev === 'dark') ? 'light' : 'dark';
        try { localStorage.setItem('theme', next); } catch {}
        return next;
      });
    },
  }), [theme, isDark]);

  return (
    <ThemeContext.Provider value={api}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() { return useContext(ThemeContext); }
