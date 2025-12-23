// Renderizador real de fórmulas con KaTeX
// Requiere dependencias: react-katex y katex (ya están en package.json)
import { InlineMath as KaInlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export default function InlineMath({ math, children, display = false }) {
  const formula = typeof math === 'string' ? math : (typeof children === 'string' ? children : '');
  // Fallback: si no hay fórmula, no renderizar nada
  if (!formula || formula.trim() === '') return null;
  
  // Limpiar la fórmula de espacios en blanco y caracteres problemáticos
  let cleanFormula = formula.trim();
  
  // Remover delimitadores $ si están presentes (ya que react-katex los agrega automáticamente)
  cleanFormula = cleanFormula.replace(/^\$+|\$+$/g, '').trim();
  
  // Para fórmulas muy largas o complejas, usar BlockMath en lugar de InlineMath
  // Solo usar BlockMath si es explícitamente display o si la fórmula es MUY larga
  // Las fórmulas simples como \sum_{i=1}^{n} a_i deben ser inline
  const isVeryLong = cleanFormula.length > 200;
  const shouldUseBlock = display || isVeryLong;
  
  // react-katex puede lanzar si la fórmula es inválida; capturamos de forma segura
  try {
    if (shouldUseBlock) {
      return (
        <div className="katex-display-wrapper" style={{ textAlign: 'center', width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
          <div style={{ display: 'inline-block' }}>
            <BlockMath math={cleanFormula} />
          </div>
        </div>
      );
    } else {
      // Para fórmulas inline, no agregar overflowX a menos que sea necesario
      return <KaInlineMath math={cleanFormula} />;
    }
  } catch (error) {
    // Log del error en desarrollo para debugging
    if (process.env.NODE_ENV === 'development') {
      console.warn('[InlineMath] Error renderizando fórmula:', cleanFormula.substring(0, 100), error);
    }
    // Mostrar literal si hay error de sintaxis, con scroll horizontal para fórmulas largas
    return (
      <div className="overflow-x-auto w-full" style={{ maxWidth: '100%' }}>
        <span className="font-mono text-[0.95em] text-slate-700 whitespace-nowrap" title={`Error renderizando: ${cleanFormula.substring(0, 200)}...`}>
          ${cleanFormula}$
        </span>
      </div>
    );
  }
}
