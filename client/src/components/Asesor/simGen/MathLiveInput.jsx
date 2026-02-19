import { useEffect, useRef } from 'react';
import 'mathlive';

/**
 * Input matemático visual (WYSIWYG) con MathLive.
 * - El usuario ve la fórmula renderizada y la edita como en Word/Desmos.
 * - El valor que se emite por `onChange` es LaTeX (sin delimitadores $).
 */
export function MathLiveInput({
  value = '',
  onChange,
  className = '',
  placeholder = 'Escribe tu fórmula…',
}) {
  const mfRef = useRef(null);
  const lastValueRef = useRef(String(value ?? ''));

  // Inicializar opciones una sola vez
  useEffect(() => {
    const mf = mfRef.current;
    if (!mf) return;

    try {
      // Opciones para hacerlo más amigable (usando API moderna)
      if (mf.virtualKeyboardMode !== undefined) {
        mf.virtualKeyboardMode = 'manual';
      }
      if (mf.smartMode !== undefined) {
        mf.smartMode = true;
      }
      if (mf.virtualKeyboardZIndex !== undefined) {
        mf.virtualKeyboardZIndex = 10005;
      }

      // Asegurar que globalmente se respete el z-index si la librería lo permite
      if (typeof window !== 'undefined' && window.MathfieldElement) {
        window.MathfieldElement.computeOption('virtualKeyboardZIndex', 10005);
      }
      // Placeholder (si existe soporte)
      if ('placeholder' in mf) {
        mf.placeholder = placeholder;
      }
    } catch {
      // No-op: si cambia la API, no rompemos el editor
    }
  }, [placeholder]);

  // Sincronizar value externo sin romper el cursor cuando el usuario está escribiendo
  useEffect(() => {
    const mf = mfRef.current;
    const next = String(value ?? '');
    lastValueRef.current = next;
    if (!mf) return;

    // Evitar pisar mientras el usuario está enfocado en el editor
    const isFocused = typeof document !== 'undefined' && document.activeElement === mf;
    if (isFocused) return;

    if (mf.value !== next) {
      mf.value = next;
    }
  }, [value]);

  useEffect(() => {
    const mf = mfRef.current;
    if (!mf) return;

    const handler = (evt) => {
      const el = evt?.target;
      if (!el) return;
      const latex = typeof el.getValue === 'function' ? el.getValue() : el.value;
      const next = String(latex ?? '');
      lastValueRef.current = next;
      onChange?.(next);
    };

    mf.addEventListener('input', handler);
    return () => mf.removeEventListener('input', handler);
  }, [onChange]);

  return (
    <div className={className}>
      <math-field
        ref={mfRef}
        style={{
          width: '100%',
          padding: '12px 14px',
          borderRadius: '12px',
          border: '2px solid rgb(203 213 225)', // slate-300
          backgroundColor: 'white',
          display: 'block',
          minHeight: '54px',
          fontSize: '1.25rem',
          lineHeight: '1.75rem',
          outline: 'none',
        }}
      >
        {lastValueRef.current}
      </math-field>
      <p className="mt-2 text-[11px] text-slate-500">
        Tip: escribe <span className="font-mono">/</span> para fracciones, <span className="font-mono">^</span> para exponentes.
      </p>
    </div>
  );
}

