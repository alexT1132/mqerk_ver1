import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const scrollToTop = () => {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  const root = document.getElementById('root');
  if (root) root.scrollTop = 0;
  const topEl = document.getElementById('eeau23-top');
  if (topEl) topEl.scrollIntoView({ behavior: 'instant', block: 'start' });
};

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    scrollToTop();
    const raf = requestAnimationFrame(scrollToTop);
    const t1 = setTimeout(scrollToTop, 50);
    const t2 = setTimeout(scrollToTop, 150);
    const t3 = setTimeout(scrollToTop, 400);
    const t4 = hash === '#top' ? setTimeout(scrollToTop, 600) : null;
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (t4) clearTimeout(t4);
    };
  }, [pathname, hash]);

  return null;
}
