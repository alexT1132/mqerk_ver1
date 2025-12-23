import React from 'react';

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
  // Fallback ligero: resalta $$...$$ y $...$ sin renderizar LaTeX
  const displayRe = /\$\$([\s\S]+?)\$\$/g;
  const inlineRe = /\$([^\$]+)\$/g;
  let html = escapeHtml(text);
  // display blocks
  html = html.replace(displayRe, (_, expr) => `<div style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; background:#f5f5f5; padding:6px 8px; border-radius:6px; display:block">${escapeHtml(expr)}</div>`);
  // inline
  html = html.replace(inlineRe, (_, expr) => `<span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; background:#f5f5f5; padding:2px 4px; border-radius:4px">${escapeHtml(expr)}</span>`);
  // line breaks
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
