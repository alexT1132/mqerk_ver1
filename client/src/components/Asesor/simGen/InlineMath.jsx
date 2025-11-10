// Renderizador real de fórmulas con KaTeX
// Requiere dependencias: react-katex y katex (ya están en package.json)
import { InlineMath as KaInlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export default function InlineMath({ math, children }) {
  const formula = typeof math === 'string' ? math : (typeof children === 'string' ? children : '');
  // Fallback: si no hay fórmula, no renderizar nada
  if (!formula) return null;
  // react-katex puede lanzar si la fórmula es inválida; capturamos de forma segura
  try {
    return <KaInlineMath math={formula} />;
  } catch {
    // Mostrar literal si hay error de sintaxis
    return <span className="font-mono text-[0.95em] text-slate-700">{formula}</span>;
  }
}
