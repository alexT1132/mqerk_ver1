import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/** escapa HTML para texto plano */
function escapeHtml(str = '') {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

/**
 * Convierte el texto con $...$ a HTML con KaTeX.
 * Soporta inline $...$ y también $$...$$ (display).
 */
function renderWithKatex(text = '') {
  if (!text) return '';

  // Dividimos por bloques $$...$$ primero (display)
  const displayRe = /\$\$([\s\S]+?)\$\$/g;
  let html = '';
  let lastIndex = 0;
  let m;

  const renderInline = (s) => {
    // render inline $...$
    const inlineRe = /\$([^\$]+)\$/g;
    let out = '';
    let iLast = 0;
    let m2;
    while ((m2 = inlineRe.exec(s)) !== null) {
      const [full, expr] = m2;
      out += escapeHtml(s.slice(iLast, m2.index));
      try {
        out += katex.renderToString(expr, {
          throwOnError: false,
          displayMode: false,
          strict: 'ignore',
        });
      } catch {
        out += escapeHtml(full);
      }
      iLast = m2.index + full.length;
    }
    out += escapeHtml(s.slice(iLast));
    return out;
  };

  while ((m = displayRe.exec(text)) !== null) {
    const [full, expr] = m;
    // texto plano antes del $$...$$
    html += renderInline(text.slice(lastIndex, m.index));
    // bloque display
    try {
      html += katex.renderToString(expr, {
        throwOnError: false,
        displayMode: true,
        strict: 'ignore',
      });
    } catch {
      html += escapeHtml(full);
    }
    lastIndex = m.index + full.length;
  }

  // restante (inline)
  html += renderInline(text.slice(lastIndex));

  // saltos de línea
  html = html.replaceAll('\n', '<br/>');

  return html;
}

/**
 * Textarea con vista previa KaTeX debajo.
 * - El textarea es transparente (solo ves el caret).
 * - La capa inferior muestra el resultado renderizado.
 */
export default function MathTextarea({
  value,
  onChange,
  placeholder = 'Escribe aquí (usa $...$ o $$...$$)',
  rows = 3,
  className = '',
}) {
  const html = renderWithKatex(value);

  return (
    <div className={`relative ${className}`}>
      {/* Capa de preview */}
      <div
        className="
          pointer-events-none absolute inset-0 rounded-lg
          whitespace-pre-wrap break-words
          px-3 py-2 text-slate-900 leading-6
        "
        // KaTeX genera HTML seguro; lo mezclamos con texto escapado.
        dangerouslySetInnerHTML={{ __html: html || escapeHtml(placeholder) }}
      />

      {/* Textarea "transparente" con caret visible */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="
          relative w-full rounded-lg border border-violet-300
          bg-transparent px-3 py-2 text-transparent caret-slate-900
          focus:outline-none focus:ring-2 focus:ring-violet-500
          leading-6
        "
        style={{
          // Para que el placeholder no tape el preview, lo dejamos vacío
          // y usamos el placeholder en la capa de preview.
          // (opcional)
          WebkitTextFillColor: 'transparent',
        }}
      />
    </div>
  );
}
