import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// Uso del paquete npm (mismo origen) para evitar bloqueos por Tracking Prevention al cargar desde CDN
const KaInlineMath = ({ math }) => {
  const ref = React.useRef();
  React.useEffect(() => {
    if (ref.current && math) {
      try {
        katex.render(math, ref.current, {
          throwOnError: false,
          displayMode: false,
          strict: false,
          trust: true
        });
      } catch (e) { console.error(e); }
    }
  }, [math]);
  return <span ref={ref} />;
};

const BlockMath = ({ math }) => {
  const ref = React.useRef();
  React.useEffect(() => {
    if (ref.current && math) {
      try {
        katex.render(math, ref.current, {
          throwOnError: false,
          displayMode: true,
          strict: false,
          trust: true
        });
      } catch (e) { console.error(e); }
    }
  }, [math]);
  return <div ref={ref} />;
};


/**
 * Componente Wrapper para KaTeX con heurísticas de limpieza y corrección automática.
 * Soluciona problemas de compatibilidad de Regex y mejora la detección de texto.
 */
const InlineMath = React.memo(function InlineMath({ math, children, display = false }) {
  // Memoizamos la limpieza para no recalcular en cada render si la fórmula no cambia
  const cleanFormula = React.useMemo(() => {
    const rawInput = typeof math === 'string' ? math : (typeof children === 'string' ? children : '');

    if (!rawInput || !rawInput.trim()) return null;

    let processed = rawInput.trim();

    // 1. ELIMINAR DELIMITADORES $ (Compatible con todos los navegadores)
    // Reemplazamos el Lookbehind (?<!\\) que rompe Safari por una función lógica
    processed = processed.replace(/(\\)?\$/g, (match, escaped) => {
      return escaped ? match : ''; // Si tiene \, lo dejamos. Si es solo $, lo borramos.
    });

    // 2. CORRECCIONES TIPOGRÁFICAS COMUNES
    processed = processed
      .replace(/×/g, '\\times')
      .replace(/÷/g, '\\div')
      .replace(/¿/g, '')
      .replace(/¡/g, '')
      .replace(/sen\s/g, '\\sin ')    // Corrección común en español
      .replace(/tg\s/g, '\\tan ');    // Corrección común en español

    // 3. LIMPIEZA DE ESPACIOS Y SALTOS DE LÍNEA
    processed = processed
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/\r\n?/g, '\n')
      .replace(/\n+/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .trim();

    const originalFormula = processed;

    // 4. HEURÍSTICA DE TEXTO: Detectar frases y envolverlas en \text{}
    // Evita romper comandos LaTeX existentes ({, }, \)
    processed = processed.replace(
      /(^|[^\\{a-zA-Z])([a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]{2,}(?:\s+[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]{1,})+)/g,
      (match, prefix, phrase, offset) => {
        // Verificar balance de llaves para no reemplazar dentro de comandos (ej: \frac{...})
        const beforeText = originalFormula.substring(0, offset + prefix.length);
        const openBraces = (beforeText.match(/\{/g) || []).length;
        const closeBraces = (beforeText.match(/\}/g) || []).length;

        // Si hay llaves desbalanceadas, asumimos que estamos dentro de un comando LaTeX y no tocamos
        if (openBraces > closeBraces) return match;

        // Verificar si ya está protegido por \text o \mathrm
        if (/\\(text|mathrm|bf|it)\s*\{$/.test(beforeText)) return match;

        return `${prefix}\\text{${phrase}}`;
      }
    );

    return processed;
  }, [math, children]);

  if (!cleanFormula) return null;

  // Decidir si usar bloque o línea
  const isVeryLong = cleanFormula.length > 200;
  const shouldUseBlock = display || isVeryLong;

  // Configuración de KaTeX para tolerar errores sin explotar
  // Nota: En los mocks de arriba ya aplicamos throwOnError: false, pero lo mantenemos aquí
  // por si usas la librería real.
  const katexSettings = {
    strict: false,
    trust: true,
    throwOnError: false,
    errorColor: '#ef4444' // Color rojo suave de Tailwind (rose-500)
  };

  try {
    if (shouldUseBlock) {
      return (
        <div className="katex-display-wrapper my-2 w-full overflow-x-auto text-center" style={{ maxWidth: '100%' }}>
          <BlockMath math={cleanFormula} settings={katexSettings} />
        </div>
      );
    }

    return (
      <span className="katex-inline-wrapper">
        <KaInlineMath math={cleanFormula} settings={katexSettings} />
      </span>
    );

  } catch (error) {
    // Fallback visual en caso de error catastrófico de renderizado
    return (
      <span className="inline-flex items-center gap-1 rounded bg-red-50 px-2 py-0.5 text-xs text-red-600 border border-red-100" title={error.message}>
        ⚠️ Error LaTeX: {cleanFormula.substring(0, 20)}...
      </span>
    );
  }
});

export default InlineMath;