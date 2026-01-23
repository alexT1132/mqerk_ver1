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

  // Normalizar saltos de línea / HTML breaks que rompen KaTeX (común en editores ricos)
  cleanFormula = cleanFormula
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/\r\n?/g, '\n')
    .replace(/\n+/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .trim();
  
  // ✅ Detectar y envolver texto con acentos en \text{} para evitar errores de KaTeX
  // Esto evita errores de "Accented Unicode text character used in math mode"
  if (cleanFormula && /[áéíóúÁÉÍÓÚñÑüÜ]/.test(cleanFormula)) {
    // Guardar referencia a la fórmula original para verificar contexto
    const originalFormula = cleanFormula;
    
    // Primero, buscar y envolver frases con espacios escapados y acentos
    // Ejemplo: "moles\ de\ soluto" -> "\text{moles de soluto}"
    cleanFormula = cleanFormula.replace(/([a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+(?:\\\s+[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+)+)/g, (match, p1, offset) => {
      // Verificar que contiene acentos
      if (!/[áéíóúÁÉÍÓÚñÑüÜ]/.test(match)) {
        return match;
      }
      
      // Verificar que no está ya dentro de \text{}
      const beforeText = originalFormula.substring(0, offset);
      const openText = (beforeText.match(/\\text\{/g) || []).length;
      const closeText = (beforeText.match(/\}/g) || []).length;
      if (openText > closeText) {
        return match; // Ya está dentro de \text{}
      }
      
      // Limpiar espacios escapados y envolver en \text{}
      const cleaned = match.replace(/\\\s+/g, ' ').replace(/\s+/g, ' ').trim();
      return `\\text{${cleaned}}`;
    });
    
    // Actualizar referencia después del primer reemplazo
    const updatedFormula = cleanFormula;
    
    // Luego, buscar palabras individuales con acentos que no están en \text{}
    cleanFormula = cleanFormula.replace(/\b([a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+)\b/g, (match, word, offset) => {
      // Solo procesar si tiene acentos
      if (!/[áéíóúÁÉÍÓÚñÑüÜ]/.test(word)) {
        return match;
      }
      
      // Verificar que no está ya dentro de \text{}
      const beforeText = updatedFormula.substring(0, offset);
      const openText = (beforeText.match(/\\text\{/g) || []).length;
      const closeText = (beforeText.match(/\}/g) || []).length;
      if (openText > closeText) {
        return match; // Ya está dentro de \text{}
      }
      
      // Envolver en \text{}
      return `\\text{${word}}`;
    });
  }
  
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
    // Mostrar fallback claro si hay error de sintaxis, con scroll horizontal para fórmulas largas
    return (
      <div className="overflow-x-auto w-full" style={{ maxWidth: '100%' }}>
        <div className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2">
          <span className="text-rose-700 text-xs font-bold">Error LaTeX</span>
          <span className="font-mono text-[0.95em] text-slate-700 whitespace-nowrap" title={`Error renderizando: ${cleanFormula.substring(0, 200)}...`}>
            {cleanFormula}
          </span>
        </div>
      </div>
    );
  }
}
