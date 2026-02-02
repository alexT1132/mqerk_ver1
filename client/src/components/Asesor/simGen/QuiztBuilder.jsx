import React, { useMemo, useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { getQuizFull, updateQuiz, createQuiz } from '../../../api/quizzes.js';
import { getSimulacionFull, updateSimulacion, deleteSimulacion } from '../../../api/simulaciones.js';
// Nota: reemplazado react-katex por un componente local liviano para evitar dependencia
import InlineMath from './InlineMath.jsx';
import MathExamplesHint from './MathExamplesHint.jsx';
import MathPalette, { SECTIONS, Modal, FormulaEditModal } from './MathPalette.jsx';
import RichTextEditor from './RichTextEditor.jsx';
import { AIFormulaModal } from './AIFormulaModal.jsx';
import { useAlert } from '../../../components/shared/AlertModal.jsx';

const genId = () => {
  // Navegador moderno y https/localhost
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  // Fallback RFC4122 v4 con getRandomValues
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
    const bytes = new Uint8Array(16);
    globalThis.crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // versión 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variante
    const h = [...bytes].map(b => b.toString(16).padStart(2, '0'));
    return `${h.slice(0, 4).join('')}-${h.slice(4, 6).join('')}-${h.slice(6, 8).join('')}-${h.slice(8, 10).join('')}-${h.slice(10).join('')}`;
  }
  // Último recurso
  return `id-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
};

/** Convierte un índice numérico en letra de opción (a, b, c, ... z, aa, ab, ...) */
const getOptionLabel = (index) => {
  if (index < 26) {
    return String.fromCharCode(97 + index); // a-z
  }
  // Para más de 26 opciones: aa, ab, ac, ...
  const firstLetter = String.fromCharCode(97 + Math.floor((index - 26) / 26));
  const secondLetter = String.fromCharCode(97 + ((index - 26) % 26));
  return firstLetter + secondLetter;
};

/* ----------------------- Utilidad: nueva pregunta ------------------------ */
const newQuestion = (type = "multiple") => ({
  id: genId(),
  type, // 'multiple' | 'tf' | 'short'
  text: "",
  points: 1,
  image: null, // { file, preview }
  options:
    type === "multiple"
      ? [{ id: genId(), text: "", correct: false, image: null }]
      : [],
  answer: type === "tf" ? "true" : "", // para tf/short
});

/* ----------------------- Renderiza LaTeX con KaTeX ----------------------- */
/** Renderiza texto plano mezclado con fórmulas delimitadas por $...$ y respeta saltos de línea */
/* ----------------------- Renderiza LaTeX con KaTeX ----------------------- */
/** Renderiza texto plano mezclado con fórmulas delimitadas por $...$ o $$...$$ */
function MathText({ text = "", onFormulaClick }) {
  if (!text) return null;

  // ✅ Función para sanitizar HTML
  const sanitizeHtmlLite = (html) => {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    const allowedTags = ['strong', 'b', 'em', 'i', 'u', 'br'];
    const walker = document.createTreeWalker(div, NodeFilter.SHOW_ELEMENT, null);
    const nodesToRemove = [];
    let node;
    while (node = walker.nextNode()) {
      if (!allowedTags.includes(node.tagName.toLowerCase())) {
        nodesToRemove.push(node);
      }
    }
    nodesToRemove.forEach(n => {
      const parent = n.parentNode;
      while (n.firstChild) parent.insertBefore(n.firstChild, n);
      parent.removeChild(n);
    });
    return div.innerHTML;
  };

  // ✅ Procesador de Markdown simple
  const processMarkdown = (txt) => {
    if (!txt) return '';
    return txt.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
  };

  const parts = [];
  let i = 0;
  let lastIndex = 0;

  // Parser robusto carácter a carácter para manejar anidamientos y escapes
  while (i < text.length) {
    const char = text[i];

    // 1. Saltar escapes
    if (char === '\\') {
      i += 2;
      continue;
    }

    // 2. Detectar inicio fórmula ($)
    if (char === '$') {
      const start = i;
      const isBlock = i + 1 < text.length && text[i + 1] === '$';
      const delimiter = isBlock ? '$$' : '$';
      // Avanzar más allá del delimitador de apertura
      i += delimiter.length;

      let content = '';
      let closed = false;

      // Buscar cierre
      while (i < text.length) {
        const c = text[i];
        if (c === '\\') {
          content += c;
          if (i + 1 < text.length) content += text[i + 1];
          i += 2;
          continue;
        }
        if (c === '$') {
          let isClosing = false;
          if (isBlock) {
            // Para $$ necesitamos otro $ seguido
            if (i + 1 < text.length && text[i + 1] === '$') isClosing = true;
          } else {
            isClosing = true;
          }

          if (isClosing) {
            closed = true;
            break;
          }
        }
        content += c;
        i++;
      }

      if (closed) {
        // Validar heurística SÓLO para inline ($)
        let isValidMath = true;
        if (!isBlock) {
          const formulaTrimmed = content.trim();
          // Heurística de moneda: $120 pesos
          const beginsWithNumber = /^\d+/.test(formulaTrimmed);
          const hasTextWords = /[a-zA-ZáéíóúÁÉÍÓÚñÑ]{2,}/.test(formulaTrimmed);
          const hasMathOperators = /[=\+\-\^_{}\\]/.test(formulaTrimmed);
          if (beginsWithNumber && hasTextWords && !hasMathOperators) {
            isValidMath = false;
          }
        }

        if (isValidMath) {
          // Agregar texto previo
          if (start > lastIndex) {
            const txtSegment = text.substring(lastIndex, start);
            parts.push({ type: 'text', content: processMarkdown(txtSegment) });
          }

          // Agregar fórmula
          const fullMatchEnd = i + delimiter.length;
          const fullMatch = text.substring(start, fullMatchEnd);

          parts.push({
            type: 'math',
            content: content.trim(),
            full: fullMatch,
            start: start,
            end: fullMatchEnd,
            isBlock: isBlock
          });

          // Avanzar cursor principal más allá del cierre
          i += delimiter.length;
          lastIndex = i;
          continue;
        } else {
          // Interpretar como texto
          i = start + 1;
          continue;
        }
      }
    }
    i++;
  }

  // Agregar resto del texto
  if (lastIndex < text.length) {
    const txtSegment = text.substring(lastIndex);
    parts.push({ type: 'text', content: processMarkdown(txtSegment) });
  }

  const handleFormulaClick = (formula, fullMatch, start, end) => {
    if (onFormulaClick) {
      onFormulaClick({ formula, fullMatch, start, end });
    }
  };

  return (
    <span className="block w-full break-words overflow-x-auto whitespace-pre-wrap">
      {parts.map((part, idx) =>
        part.type === 'math' ? (
          <span
            key={`math-${idx}`}
            onClick={() => onFormulaClick && handleFormulaClick(part.content, part.full, part.start, part.end)}
            className={`${onFormulaClick ? "cursor-pointer hover:bg-violet-100 rounded px-1 transition-colors" : ""} ${part.isBlock ? "block text-center my-2" : "inline-block align-middle"}`}
            title={onFormulaClick ? "Clic para editar esta fórmula" : ""}
          >
            <InlineMath math={part.content} display={part.isBlock} />
          </span>
        ) : (
          <span
            key={`text-${idx}`}
            dangerouslySetInnerHTML={{ __html: sanitizeHtmlLite(part.content) }}
          />
        )
      )}
    </span>
  );
}

/* ----------------------------- Image Picker ------------------------------ */
function ImagePicker({ value, onChange, label = "Imagen (opcional)" }) {
  const inputRef = useRef(null);

  const handleSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    onChange({ file, preview });
  };

  const handleRemove = () => {
    if (value?.preview) URL.revokeObjectURL(value.preview);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-sm font-semibold text-slate-700 mb-2">{label}</p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg border-2 border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Seleccionar imagen
          </button>
          {value && (
            <button
              type="button"
              onClick={handleRemove}
              className="inline-flex items-center gap-2 rounded-lg border-2 border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 hover:border-rose-400 transition-all"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Quitar
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleSelect}
          />
        </div>
      </div>

      {value?.preview && (
        <div className="rounded-lg border-2 border-slate-300 p-2 bg-slate-50 inline-block">
          <img
            src={value.preview}
            alt="Vista previa"
            className="h-32 w-auto max-w-xs rounded-lg border border-slate-200 object-cover shadow-sm"
          />
        </div>
      )}
    </div>
  );
}

/** Inserta en el cursor de un textarea y selecciona el primer \\square si existe */
function insertAtCursor(textarea, insert, setValue) {
  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? textarea.value.length;
  const val = textarea.value;
  const next = val.slice(0, start) + insert + val.slice(end);
  setValue(next);

  requestAnimationFrame(() => {
    textarea.focus();
    const PLACE = "\\square";
    const idx = insert.indexOf(PLACE);
    if (idx !== -1) {
      const abs = start + idx;
      textarea.selectionStart = abs;
      textarea.selectionEnd = abs + PLACE.length;
    } else {
      const pos = start + insert.length;
      textarea.selectionStart = textarea.selectionEnd = pos;
    }
  });
}

// Permite navegar entre \square con Tab/Shift+Tab
function jumpToPlaceholder(el, backwards = false) {
  const PLACE = "\\square";
  const val = el.value ?? "";
  const cur = el.selectionDirection === 'backward' ? el.selectionStart : el.selectionEnd;
  if (backwards) {
    const idx = val.lastIndexOf(PLACE, (cur ?? val.length) - 1);
    if (idx !== -1) {
      el.selectionStart = idx;
      el.selectionEnd = idx + PLACE.length;
      return true;
    }
  } else {
    const idx = val.indexOf(PLACE, cur ?? 0);
    if (idx !== -1) {
      el.selectionStart = idx;
      el.selectionEnd = idx + PLACE.length;
      return true;
    }
  }
  return false;
}

/* -------------------------- Componente de Opción ------------------------- */
function OptionRow({ option, optionLabel = 'a', onChange, onRemove }) {
  return (
    <div
      className={`flex flex-col gap-4 rounded-xl border-2 p-5 transition-all duration-200 ${option.correct
        ? 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-green-50 shadow-lg ring-2 ring-emerald-200/50'
        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
        }`}
    >
      <div className="flex items-start gap-3">
        {/* Etiqueta de opción (a, b, c, ...) */}
        <div className="flex-shrink-0 mt-1">
          <span
            className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-bold text-sm border-2 ${option.correct
              ? 'border-emerald-500 bg-emerald-100 text-emerald-700'
              : 'border-slate-300 bg-slate-100 text-slate-600'
              }`}
          >
            {optionLabel})
          </span>
        </div>

        {/* marcar correcta */}
        <label className="mt-1 cursor-pointer">
          <input
            type="checkbox"
            checked={option.correct}
            onChange={(e) => onChange({ ...option, correct: e.target.checked })}
            className="h-5 w-5 rounded border-2 border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 cursor-pointer transition-colors"
            title="Marcar como correcta"
          />
        </label>

        <div className="flex-1">
          <RichTextEditor
            value={option.text}
            onChange={(newText) => onChange({ ...option, text: newText })}
            placeholder="Escribe el texto de la opción… Puedes insertar fórmulas con los botones."
            className="mb-0"
          />
        </div>

        {/* eliminar opción */}
        <button
          onClick={onRemove}
          className="self-start rounded-xl border-2 border-rose-300 bg-rose-50 px-3 py-2.5 text-sm font-bold text-rose-700 hover:bg-rose-100 hover:border-rose-400 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
          title="Eliminar opción"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Imagen para la opción */}
      <ImagePicker
        value={option.image}
        onChange={(img) => onChange({ ...option, image: img })}
        label="Imagen de la opción (opcional)"
      />
    </div>
  );
}

/* --------------------------- Tarjeta de Pregunta ------------------------- */
function QuestionCard({ q, onChange, onRemove }) {
  // Validación adicional
  if (!q || !q.id) {
    return (
      <div className="rounded-xl border-2 border-rose-300 bg-rose-50 p-4">
        <p className="text-sm font-semibold text-rose-700">Error: Pregunta inválida</p>
      </div>
    );
  }

  const textareaRef = useRef(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [showRawText, setShowRawText] = useState(false);
  const [editingFormula, setEditingFormula] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const setType = (type) => {
    const base = { ...q, type };
    if (type === "multiple") {
      base.options =
        q.options?.length
          ? q.options
          : [{ id: genId(), text: "", correct: false, image: null }];
      base.answer = "";
    } else if (type === "tf") {
      base.options = [];
      base.answer = "true";
    } else {
      base.options = [];
      base.answer = "";
    }
    onChange(base);
  };

  const setOption = (opt) =>
    onChange({ ...q, options: q.options.map((o) => (o.id === opt.id ? opt : o)) });

  const addOption = () =>
    onChange({
      ...q,
      options: [
        ...q.options,
        { id: genId(), text: "", correct: false, image: null },
      ],
    });

  const removeOption = (id) =>
    onChange({ ...q, options: q.options.filter((o) => o.id !== id) });

  const handlePick = (latexWithDelimiters) => {
    if (editingFormula) {
      // Reemplazar la fórmula existente
      const { start, end } = editingFormula;
      const currentText = q.text;
      const newText = currentText.slice(0, start) + latexWithDelimiters + currentText.slice(end);
      onChange({ ...q, text: newText });
      setEditingFormula(null);
    } else {
      // Insertar nueva fórmula en el cursor
      insertAtCursor(textareaRef.current, latexWithDelimiters, (next) =>
        onChange({ ...q, text: next })
      );
    }
    setPaletteOpen(false);
  };

  const handleFormulaClick = ({ formula, fullMatch, start, end }) => {
    setEditingFormula({ formula, fullMatch, start, end });
    setEditModalOpen(true);
  };

  const handleAIInsert = (latexWithDelimiters) => {
    // Insertar nueva fórmula generada por IA en el cursor
    // Si tiene placeholders, el AIFormulaModal ya manejó el modal de placeholders
    insertAtCursor(textareaRef.current, latexWithDelimiters, (next) =>
      onChange({ ...q, text: next })
    );
  };

  const handleSaveEditedFormula = (newFormula) => {
    if (editingFormula) {
      const { fullMatch, start, end } = editingFormula;
      const currentText = q.text;

      // Asegurar que newFormula tenga delimitadores (viene del modal con delimitadores)
      const formulaToInsert = newFormula.startsWith('$') ? newFormula : `$${newFormula}$`;

      // Usar el índice si está disponible, sino buscar el fullMatch en el texto
      let newText;
      if (start !== undefined && end !== undefined && start >= 0 && end > start) {
        // Verificar que los índices correspondan al fullMatch
        const matchAtPosition = currentText.slice(start, end);
        if (matchAtPosition === fullMatch) {
          // Los índices son correctos, usar reemplazo por índices
          newText = currentText.slice(0, start) + formulaToInsert + currentText.slice(end);
        } else {
          // Los índices no son correctos, buscar el fullMatch en el texto
          const index = currentText.indexOf(fullMatch);
          if (index !== -1) {
            newText = currentText.slice(0, index) + formulaToInsert + currentText.slice(index + fullMatch.length);
          } else {
            // Fallback: reemplazar solo la primera ocurrencia
            newText = currentText.replace(fullMatch, formulaToInsert);
          }
        }
      } else {
        // Buscar el fullMatch en el texto y reemplazarlo
        const index = currentText.indexOf(fullMatch);
        if (index !== -1) {
          newText = currentText.slice(0, index) + formulaToInsert + currentText.slice(index + fullMatch.length);
        } else {
          // Fallback: reemplazar solo la primera ocurrencia
          newText = currentText.replace(fullMatch, formulaToInsert);
        }
      }

      onChange({ ...q, text: newText });
      setEditingFormula(null);
    }
  };

  // Detectar si hay fórmulas LaTeX
  const hasMath = q.text && /\$[^$]+\$/.test(q.text);

  return (
    <div className="rounded-3xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50/30 p-5 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-200 ring-2 ring-slate-100/50 hover:ring-violet-200/50">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <span className="inline-grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-600 text-white font-extrabold text-lg shadow-lg ring-2 ring-violet-200/50">
            Q
          </span>
          <select
            value={q.type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-lg border-2 border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-colors"
          >
            <option value="multiple">Opción múltiple</option>
            <option value="tf">Verdadero / Falso</option>
            <option value="short">Respuesta corta</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-600">Puntos</label>
          <input
            type="number"
            min={1}
            value={q.points}
            onChange={(e) =>
              onChange({ ...q, points: Number(e.target.value) || 1 })
            }
            className="w-20 rounded-lg border-2 border-slate-200 px-3 py-2 text-sm font-medium focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-colors"
          />
          <button
            onClick={onRemove}
            className="rounded-xl border-2 border-rose-300 bg-gradient-to-r from-rose-50 to-red-50 px-4 py-2.5 text-sm font-bold text-rose-700 hover:from-rose-100 hover:to-red-100 hover:border-rose-400 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
          >
            Eliminar
          </button>
        </div>
      </div>

      {/* Enunciado - RichTextEditor con fórmulas protegidas */}
      <div>
        <RichTextEditor
          value={q.text}
          onChange={(newText) => onChange({ ...q, text: newText })}
          placeholder="Escribe la consigna de la pregunta… Puedes usar fórmulas matemáticas con los botones.

Tips:
• Puedes usar Enter para saltos de línea
• Usa viñetas: - texto o * texto o 1. texto
• Inserta fórmulas con los botones de abajo"
          label="Enunciado de la pregunta"
          required
          className="mb-4"
        />
      </div>

      {/* Imagen de la pregunta */}
      <div className="mt-4">
        <ImagePicker
          value={q.image}
          onChange={(img) => onChange({ ...q, image: img })}
          label="Imagen de la pregunta (opcional)"
        />
      </div>

      {/* Tipo múltiple con opciones + imágenes */}
      {q.type === "multiple" && (
        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between border-t border-slate-200 pt-4">
            <div>
              <p className="text-sm font-semibold text-slate-700">
                Opciones de respuesta
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Marca al menos una opción como correcta
              </p>
            </div>
            <button
              onClick={addOption}
              className="inline-flex items-center gap-2 rounded-lg border-2 border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors shadow-sm"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
              Agregar opción
            </button>
          </div>
          {q.options.map((opt, optIndex) => (
            <div key={opt.id}>
              <OptionRow
                option={opt}
                optionIndex={optIndex}
                optionLabel={getOptionLabel(optIndex)}
                onChange={setOption}
                onRemove={() => removeOption(opt.id)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Tipo verdadero/falso */}
      {q.type === "tf" && (
        <div className="mt-5 border-t border-slate-200 pt-4">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Respuesta correcta <span className="text-rose-500">*</span>
          </label>
          <div className="flex gap-4">
            {["true", "false"].map((v) => {
              const isSelected = q.answer === v;
              return (
                <label
                  key={v}
                  className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold cursor-pointer transition-all ${isSelected
                    ? 'border-violet-500 bg-gradient-to-br from-violet-50 to-indigo-50 text-violet-700 shadow-md'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                    }`}
                >
                  <input
                    type="radio"
                    name={`tf-${q.id}`}
                    value={v}
                    checked={isSelected}
                    onChange={(e) => onChange({ ...q, answer: e.target.value })}
                    className="h-5 w-5 text-violet-600 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
                  />
                  {v === "true" ? "✓ Verdadero" : "✗ Falso"}
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Tipo respuesta corta */}
      {q.type === "short" && (
        <div className="mt-5 border-t border-slate-200 pt-4">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Respuesta esperada (palabras clave) <span className="text-rose-500">*</span>
          </label>
          <p className="text-xs text-slate-500 mb-2">
            Especifica las palabras clave o la frase exacta que debe contener la respuesta del estudiante
          </p>
          <input
            type="text"
            value={q.answer}
            onChange={(e) => onChange({ ...q, answer: e.target.value })}
            placeholder="Ej. 'sujeto, predicado' o la frase exacta"
            className="w-full rounded-lg border-2 border-slate-300 px-4 py-3 text-sm font-medium focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-colors"
          />
        </div>
      )}

      {/* Modal IA para generar fórmulas */}
      <AIFormulaModal
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onInsert={handleAIInsert}
      />

      {/* Modal paleta */}
      <MathPalette
        open={paletteOpen}
        onClose={() => {
          setPaletteOpen(false);
          setEditingFormula(null);
        }}
        onPick={handlePick}
        initialFormula={editingFormula?.formula}
      />

      {/* Modal de edición de fórmula */}
      <FormulaEditModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingFormula(null);
        }}
        formula={editingFormula ? `$${editingFormula.formula}$` : ''}
        onSave={handleSaveEditedFormula}
      />
    </div>
  );
}

/* ----------------------------- Vista principal --------------------------- */
export default function EspanolFormBuilder() {
  const location = useLocation();
  const navigate = useNavigate();
  const usp = new URLSearchParams(location.search || '');
  const quizId = location.state?.quizId || usp.get('id') || null;
  const simId = location.state?.simId || usp.get('simId') || null;
  const tempCreated = !!location.state?.tempCreated;
  // Contexto de área (si se llegó desde una vista específica). Puede venir por state o se resolverá tras cargar la simulación.
  const initialAreaId = location.state?.areaId || null;
  const initialAreaTitle = typeof location.state?.areaTitle === 'string' ? location.state.areaTitle : null;
  const isNew = usp.get('new') === '1';
  const isSim = !!simId;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [meta, setMeta] = useState({ titulo: '', materia: '', max_intentos: null, time_limit_min: null });
  const [descripcion, setDescripcion] = useState(''); // Estado para descripción del simulador
  // Estado inicial: array vacío si hay quizId/simId (se cargarán), sino una pregunta por defecto
  const [questions, setQuestions] = useState(() => {
    const hasId = quizId || simId;
    // Si hay un ID, inicializar como array vacío pero marcar que está cargando
    // Esto evita que se muestre "No hay preguntas" mientras se cargan
    return hasId ? [] : [newQuestion("multiple")];
  });
  const [questionsLoaded, setQuestionsLoaded] = useState(false); // Flag para saber si ya se cargaron las preguntas
  const [previewOpen, setPreviewOpen] = useState(false);
  // Título de área si llega desde navegación (cosmético)
  // Para simuladores, usar 'General' como fallback; para quizzes, 'Español'
  const [areaTitle, setAreaTitle] = useState(() => {
    const hasSimId = !!simId;
    if (hasSimId) {
      return initialAreaTitle || (typeof location.state?.title === 'string' ? location.state.title : 'General');
    }
    return initialAreaTitle || (typeof location.state?.title === 'string' ? location.state.title : 'Español');
  });
  const [areaId, setAreaId] = useState(initialAreaId);
  const [publishing, setPublishing] = useState(false);
  const { showAlert, showConfirm, AlertComponent } = useAlert();

  // Cargar preguntas si estamos editando
  useEffect(() => {
    let alive = true;
    let retryCount = 0;
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 500; // 500ms entre reintentos

    const loadQuiz = async () => {
      if (!quizId && !simId) return; // abrir en blanco para crear contenido
      try {
        setLoading(true);
        if (quizId) {
          const { data } = await getQuizFull(quizId);
          const payload = data?.data || {};
          const quiz = payload.quiz || {};
          const pregs = Array.isArray(payload.preguntas) ? payload.preguntas : [];

          // Si no hay preguntas y aún tenemos reintentos, intentar de nuevo
          if (pregs.length === 0 && retryCount < MAX_RETRIES && alive) {
            retryCount++;
            setTimeout(() => {
              if (alive) loadQuiz();
            }, RETRY_DELAY);
            return;
          }

          if (!alive) return;
          setMeta({
            titulo: quiz.titulo || quiz.nombre || '',
            materia: quiz.materia || '',
            max_intentos: quiz.max_intentos ?? null,
            time_limit_min: quiz.time_limit_min ?? null,
          });
          // ✅ Cargar descripción del quiz
          setDescripcion(quiz.descripcion || quiz.instrucciones || '');
          // IMPORTANTE: Cargar el id_area del quiz existente si no está establecido
          if (quiz.id_area && !areaId) {
            setAreaId(quiz.id_area);
          }
          // También cargar el título del área si está disponible
          if (quiz.materia && !areaTitle) {
            setAreaTitle(quiz.materia);
          }
          const mapped = pregs.map((p) => {
            // Mapear tipo de forma más robusta
            let type = 'multiple'; // default
            const tipoBD = (p.tipo || '').trim().toLowerCase();

            if (tipoBD === 'verdadero_falso' || tipoBD === 'verdadero falso') {
              type = 'tf';
            } else if (tipoBD === 'respuesta_corta' || tipoBD === 'respuesta corta') {
              type = 'short';
            } else if (tipoBD === 'opcion_multiple' || tipoBD === 'opción múltiple' || tipoBD === 'opcion multiple' || !p.tipo || p.tipo === '' || tipoBD === '') {
              type = 'multiple';
            }

            const opts = Array.isArray(p.opciones) ? p.opciones : [];
            let answer = '';

            if (type === 'tf') {
              // Para verdadero/falso, buscar la opción correcta
              const correctOpt = opts.find(o => o.es_correcta);
              answer = correctOpt?.texto === 'Verdadero' ? 'true' : 'false';
            } else if (type === 'short') {
              // Para respuesta corta, extraer el texto de la opción correcta
              const correctOpt = opts.find(o => o.es_correcta);
              answer = correctOpt?.texto || '';
            }

            // Para preguntas de tipo 'short', si no hay opciones pero hay answer, crear una opción
            let finalOptions = [];
            if (type === 'multiple') {
              finalOptions = opts.map(o => ({ id: genId(), text: o.texto || '', correct: !!o.es_correcta, image: null }));
              // NO agregar opciones adicionales automáticamente - usar las que vienen de la BD
            } else if (type === 'short') {
              // Para respuesta corta, extraer la respuesta de las opciones si existen, o usar answer directamente
              if (opts.length > 0) {
                // Si hay opciones, extraer la respuesta correcta
                const correctOpt = opts.find(o => o.es_correcta);
                if (correctOpt) {
                  finalOptions = [{ id: genId(), text: correctOpt.texto || '', correct: true, image: null }];
                  // Asegurar que answer tenga el valor correcto
                  if (!answer) answer = correctOpt.texto || '';
                }
              } else if (answer) {
                // Si no hay opciones pero hay answer, crear una opción con la respuesta
                finalOptions = [{ id: genId(), text: answer, correct: true, image: null }];
              }
            }

            // ✅ CRÍTICO: Cargar imagen de la pregunta si existe (puede venir como p.imagen, p.image, o en metadata_json)
            let preguntaImage = null;
            if (p.imagen) {
              preguntaImage = { url: p.imagen, preview: p.imagen };
            } else if (p.image) {
              preguntaImage = { url: p.image, preview: p.image };
            } else if (p.metadata_json) {
              try {
                const metadata = JSON.parse(p.metadata_json);
                if (metadata.imagen) {
                  preguntaImage = { url: metadata.imagen, preview: metadata.imagen };
                } else if (metadata.image) {
                  preguntaImage = { url: metadata.image, preview: metadata.image };
                }
              } catch { }
            }
            return {
              id: genId(),
              type,
              text: p.enunciado || '',
              points: p.puntos || 1,
              image: preguntaImage,
              options: finalOptions.map(opt => {
                // ✅ CRÍTICO: Cargar imagen de la opción si existe
                let opcionImage = null;
                const originalOpt = opts.find(o => o.texto === opt.text);
                if (originalOpt) {
                  if (originalOpt.imagen) {
                    opcionImage = { url: originalOpt.imagen, preview: originalOpt.imagen };
                  } else if (originalOpt.image) {
                    opcionImage = { url: originalOpt.image, preview: originalOpt.image };
                  } else if (originalOpt.metadata_json) {
                    try {
                      const metadata = JSON.parse(originalOpt.metadata_json);
                      if (metadata.imagen) {
                        opcionImage = { url: metadata.imagen, preview: metadata.imagen };
                      } else if (metadata.image) {
                        opcionImage = { url: metadata.image, preview: metadata.image };
                      }
                    } catch { }
                  }
                }
                return { ...opt, image: opcionImage };
              }),
              answer: answer || '',
            };
          });

          // Solo establecer preguntas si hay preguntas mapeadas
          if (mapped.length > 0) {

            // Crear una copia profunda del array para asegurar una nueva referencia
            const preguntasFinales = mapped.map(q => ({
              ...q,
              options: q.options ? q.options.map(opt => ({ ...opt })) : []
            }));

            // Actualizar el estado directamente
            setQuestions(preguntasFinales);
            setQuestionsLoaded(true); // Marcar que las preguntas se cargaron
          } else {
            // Si no hay preguntas, dejar el array vacío (no crear una por defecto)
            setQuestions([]);
            setQuestionsLoaded(true); // Marcar que se completó la carga (aunque no haya preguntas)
          }

          // Asegurar que loading se desactive después de establecer las preguntas
          if (alive) {
            setLoading(false);
          }
        } else if (simId) {
          retryCount = 0; // Reset retry count for simId
          const { data } = await getSimulacionFull(simId);
          const sim = data?.data || {};
          const pregs = Array.isArray(sim.preguntas) ? sim.preguntas : [];
          if (!alive) return;
          setMeta({
            titulo: sim.titulo || '',
            materia: '',
            max_intentos: null,
            time_limit_min: sim.time_limit_min ?? null,
          });
          // ✅ Cargar descripción del simulador
          setDescripcion(sim.descripcion || sim.instrucciones || '');
          // Resolver contexto de área desde la simulación si no vino por navegación
          try {
            if (sim.id_area && !areaId) {
              setAreaId(sim.id_area);
              // Si hay área, usar el título del área
              if (!areaTitle || areaTitle === 'General') {
                setAreaTitle(sim.titulo_area || 'Área');
              }
            } else if (!sim.id_area) {
              // Si es un simulador general (sin área), asegurar que muestre 'General'
              setAreaTitle('General');
            }
          } catch { }
          const mapped = pregs.map((p) => {
            const type = p.tipo === 'verdadero_falso' ? 'tf' : (p.tipo === 'respuesta_corta' ? 'short' : 'multiple');
            const opts = Array.isArray(p.opciones) ? p.opciones : [];
            const answer = type === 'tf' ? (opts.find(o => o.es_correcta)?.texto === 'Verdadero' ? 'true' : 'false') : (type === 'short' ? (opts.find(o => o.es_correcta)?.texto || '') : '');
            // ✅ CRÍTICO: Cargar imagen de la pregunta si existe (puede venir como p.imagen, p.image, o en metadata_json)
            let preguntaImage = null;
            if (p.imagen) {
              preguntaImage = { url: p.imagen, preview: p.imagen };
            } else if (p.image) {
              preguntaImage = { url: p.image, preview: p.image };
            } else if (p.metadata_json) {
              try {
                const metadata = JSON.parse(p.metadata_json);
                if (metadata.imagen) {
                  preguntaImage = { url: metadata.imagen, preview: metadata.imagen };
                } else if (metadata.image) {
                  preguntaImage = { url: metadata.image, preview: metadata.image };
                }
              } catch { }
            }
            return {
              id: genId(),
              type,
              text: p.enunciado || '',
              points: p.puntos || 1,
              image: preguntaImage,
              options: type === 'multiple' ? opts.map(o => {
                // ✅ CRÍTICO: Cargar imagen de la opción si existe
                let opcionImage = null;
                if (o.imagen) {
                  opcionImage = { url: o.imagen, preview: o.imagen };
                } else if (o.image) {
                  opcionImage = { url: o.image, preview: o.image };
                } else if (o.metadata_json) {
                  try {
                    const metadata = JSON.parse(o.metadata_json);
                    if (metadata.imagen) {
                      opcionImage = { url: metadata.imagen, preview: metadata.imagen };
                    } else if (metadata.image) {
                      opcionImage = { url: metadata.image, preview: metadata.image };
                    }
                  } catch { }
                }
                return { id: genId(), text: o.texto || '', correct: !!o.es_correcta, image: opcionImage };
              }) : [],
              answer,
            };
          });
          const preguntasFinales = mapped.length ? mapped : [newQuestion('multiple')];
          setQuestions(preguntasFinales);
          setQuestionsLoaded(true); // Marcar que se completó la carga
        }
      } catch (e) {
        // Si hay error y aún tenemos reintentos, intentar de nuevo
        if (retryCount < MAX_RETRIES && alive && quizId) {
          retryCount++;
          setTimeout(() => {
            if (alive) loadQuiz();
          }, RETRY_DELAY);
          return;
        }
        if (alive) {
          showAlert(e?.response?.data?.message || (quizId ? 'No se pudo cargar el quiz' : 'No se pudo cargar la simulación'), 'Error', 'error');
          setLoading(false);
        }
      }
    };

    (async () => {
      await loadQuiz();
    })();

    return () => {
      alive = false;
      setQuestionsLoaded(false); // Reset flag cuando cambian las dependencias
    };
  }, [quizId, simId]);

  const totalPoints = useMemo(
    () => questions.reduce((acc, q) => acc + (q.points || 0), 0),
    [questions]
  );

  // Verificar el estado de questions
  useEffect(() => {
    // Si hay preguntas pero loading es true, forzar a false
    if (questions.length > 0 && loading) {
      setLoading(false);
    }
  }, [questions, loading]);

  const updateQuestion = (id, data) =>
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...data } : q)));
  const removeQuestion = (id) =>
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  const addQuestion = (type = "multiple") =>
    setQuestions((prev) => [...prev, newQuestion(type)]);

  const validate = () => {
    if (!questions.length) return { ok: false, msg: "Agrega al menos una pregunta." };
    for (const q of questions) {
      if (!q.text.trim()) return { ok: false, msg: "Hay preguntas sin consigna." };
      if (q.type === "multiple") {
        if (!q.options.length) return { ok: false, msg: "En opción múltiple, agrega opciones." };
        if (!q.options.some((o) => o.correct)) return { ok: false, msg: "Marca al menos una opción correcta." };
      }
      if (q.type === "short" && !q.answer.trim())
        return { ok: false, msg: "En respuesta corta, especifica la respuesta esperada." };
    }
    return { ok: true };
  };

  const payload = {
    subject: "espanol",
    questions,
    totalPoints,
  };

  const handleDraft = async () => {
    if (isSim && simId) {
      // Guardar sin publicar para simuladores
      return handleSaveSim({ publish: false, silent: false });
    }
    // Guardar borrador para quizzes
    const v = validate();
    if (!v.ok) {
      await showAlert(v.msg, 'Error de validación', 'error');
      return;
    }
    try {
      setSaving(true);
      // ✅ Incluir imágenes en las preguntas
      const preguntas = questions.map(q => {
        const preguntaBase = {
          type: q.type,
          text: q.text,
          points: q.points,
          answer: q.answer
        };

        // ✅ Incluir imagen de la pregunta si existe
        if (q.image) {
          preguntaBase.image = q.image.preview || q.image.url || null;
        }

        // ✅ Incluir opciones con sus imágenes
        if (q.type === 'multiple' && q.options) {
          preguntaBase.options = q.options.map(o => {
            const opcionBase = { text: o.text, correct: o.correct };
            // ✅ Incluir imagen de la opción si existe
            if (o.image) {
              opcionBase.image = o.image.preview || o.image.url || null;
            }
            return opcionBase;
          });
        }

        return preguntaBase;
      });
      const body = {
        titulo: meta.titulo || `Quiz ${new Date().toLocaleDateString()}`,
        descripcion: descripcion && descripcion.trim().length > 0 ? descripcion.trim() : '', // ✅ Incluir descripción
        materia: meta.materia || areaTitle || 'Español',
        max_intentos: meta.max_intentos ?? null,
        time_limit_min: meta.time_limit_min ?? null,
        id_area: areaId || null, // Conservar el id_area del quiz
        publico: false, // Guardar como borrador
        fecha_limite: null,
        shuffle_questions: true,
        preguntas
      };
      if (quizId) {
        // Actualizar quiz existente
        await updateQuiz(quizId, body);
      } else {
        // Crear nuevo quiz como borrador
        await createQuiz(body);
      }
      await showAlert("Borrador guardado exitosamente.", 'Borrador guardado', 'success');
      navigate('/asesor/quizt', { replace: true });
    } catch (e) {
      await showAlert(e?.response?.data?.message || 'No se pudo guardar el borrador', 'Error', 'error');
    } finally {
      setSaving(false);
    }
  };

  const buildFormData = (data) => {
    const fd = new FormData();
    fd.append("subject", data.subject);
    fd.append("totalPoints", String(data.totalPoints));
    fd.append(
      "meta",
      JSON.stringify(
        data.questions.map((q) => ({
          id: q.id,
          type: q.type,
          text: q.text,
          points: q.points,
          hasImage: !!q.image,
          options:
            q.type === "multiple"
              ? q.options.map((o) => ({
                id: o.id,
                text: o.text,
                correct: o.correct,
                hasImage: !!o.image,
              }))
              : undefined,
          answer: q.type !== "multiple" ? q.answer : undefined,
        }))
      )
    );
    data.questions.forEach((q, idx) => {
      if (q.image?.file) fd.append(`q[${idx}].image`, q.image.file);
      if (q.type === "multiple") {
        q.options.forEach((o, j) => {
          if (o.image?.file) fd.append(`q[${idx}].opt[${j}].image`, o.image.file);
        });
      }
    });
    return fd;
  };

  const handleSave = async () => {
    const v = validate();
    if (!v.ok) {
      await showAlert(v.msg, 'Error de validación', 'error');
      return;
    }
    if (!quizId && !simId) {
      await showAlert('No hay elemento para actualizar', 'Error', 'error');
      return;
    }
    try {
      setSaving(true);
      // ✅ Incluir imágenes en las preguntas: si hay file, incluir la URL de preview temporalmente
      // Si hay preview pero no file, es una imagen existente (URL), incluirla también
      const preguntas = questions.map(q => {
        const preguntaBase = {
          type: q.type,
          text: q.text,
          points: q.points,
          answer: q.answer
        };

        // ✅ Incluir imagen de la pregunta si existe
        if (q.image) {
          preguntaBase.image = q.image.preview || q.image.url || null;
        }

        // ✅ Incluir opciones con sus imágenes
        if (q.type === 'multiple' && q.options) {
          preguntaBase.options = q.options.map(o => ({
            text: o.text,
            correct: o.correct,
            // ✅ Incluir imagen de la opción si existe
            image: o.image ? (o.image.preview || o.image.url || null) : null
          }));
        }

        return preguntaBase;
      });

      if (quizId) {
        const body = {
          titulo: meta.titulo || undefined,
          materia: meta.materia || undefined,
          descripcion: descripcion && descripcion.trim().length > 0 ? descripcion.trim() : undefined, // ✅ Incluir descripción
          max_intentos: meta.max_intentos ?? null,
          time_limit_min: meta.time_limit_min ?? null,
          id_area: areaId || null, // Conservar el id_area del quiz
          publico: true, // Al usar "Guardar cambios" se publica
          preguntas
        };
        await updateQuiz(quizId, body);
        await showAlert('Quiz actualizado exitosamente', 'Éxito', 'success');
        navigate('/asesor/quizt', { replace: true });
      } else if (simId) {
        const body = {
          preguntas,
          id_area: areaId || null // Conservar el id_area del simulador
        };
        await updateSimulacion(simId, body);
        await showAlert('Simulador actualizado exitosamente', 'Éxito', 'success');
        // Redirigir según contexto (área específica vs generales) - Usar replace para evitar volver al editor con Back
        if (areaId) {
          const areaParam = encodeURIComponent(areaTitle || areaId);
          navigate(`/asesor/simuladores/modulo?area=${areaParam}`, { replace: true });
        } else {
          navigate('/asesor/simuladores/generales', { replace: true });
        }
      }
    } catch (e) {
      await showAlert(e?.response?.data?.message || 'No se pudo actualizar', 'Error', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Guardado específico de simulador con opción de publicar
  const handleSaveSim = async ({ publish = false, silent = false } = {}) => {
    const v = validate();
    if (!v.ok) {
      await showAlert(v.msg, 'Error de validación', 'error');
      return;
    }
    if (!simId) {
      await showAlert('No hay simulador para actualizar', 'Error', 'error');
      return;
    }
    try {
      if (publish) setPublishing(true); else setSaving(true);
      const preguntas = questions.map((q, i) => {
        const preguntaBase = {
          orden: i + 1,
          text: q.text,
          puntos: Number(q.points || 1)
        };

        // ✅ Incluir imagen de la pregunta si existe
        if (q.image) {
          preguntaBase.image = q.image.preview || q.image.url || null;
        }

        if (q.type === 'multiple') {
          const opciones = (q.options || []).map(o => {
            const opcionBase = { texto: o.text, es_correcta: !!o.correct };
            // ✅ Incluir imagen de la opción si existe
            if (o.image) {
              opcionBase.image = o.image.preview || o.image.url || null;
            }
            return opcionBase;
          });
          if (!opciones.some(o => o.es_correcta) && opciones.length) opciones[0].es_correcta = true;
          return { ...preguntaBase, tipo: 'opcion_multiple', opciones };
        } else if (q.type === 'tf') {
          return { ...preguntaBase, type: 'tf', answer: q.answer === 'false' ? 'false' : 'true' };
        } else {
          return { ...preguntaBase, type: 'short', answer: q.answer || '' };
        }
      });
      const body = {
        titulo: meta.titulo || undefined,
        time_limit_min: meta.time_limit_min ?? null,
        descripcion: descripcion && descripcion.trim().length > 0 ? descripcion.trim() : undefined, // ✅ Incluir descripción
        preguntas,
        id_area: areaId || null, // Conservar el id_area del simulador
        activo: true
      };
      if (publish) body.publico = true; else body.publico = false; // Si no publica, guardar como borrador
      await updateSimulacion(simId, body);
      if (!silent) {
        await showAlert(publish ? 'Simulador publicado exitosamente' : 'Borrador guardado exitosamente', publish ? 'Publicado' : 'Guardado', 'success');
      }
      if (areaId) {
        const areaParam = encodeURIComponent(areaTitle || areaId);
        navigate(`/asesor/simuladores/modulo?area=${areaParam}`, { replace: true });
      } else {
        navigate('/asesor/simuladores/generales', { replace: true });
      }
    } catch (e) {
      await showAlert(e?.response?.data?.message || 'No se pudo guardar el simulador', 'Error', 'error');
    } finally {
      if (publish) setPublishing(false); else setSaving(false);
    }
  };

  return (
    <>
      <AlertComponent />
      <div className="min-h-screen bg-transparent w-full overflow-x-hidden">

        {/* Header mejorado */}
        <header className="relative w-full px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8">
          <div className="relative overflow-hidden rounded-3xl border-2 border-violet-200/60 bg-gradient-to-r from-violet-50/80 via-indigo-50/80 to-purple-50/80 shadow-xl ring-2 ring-slate-100/50 px-5 sm:px-7 py-5 sm:py-6">
            <div className="pointer-events-none absolute -left-10 -top-14 h-64 w-64 rounded-full bg-violet-200/50 blur-3xl" />
            <div className="pointer-events-none absolute -right-10 -bottom-14 h-64 w-64 rounded-full bg-indigo-200/50 blur-3xl" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
              <div className="flex-1 min-w-0 max-w-full">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-2 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 break-words">
                  {isSim ? (isNew ? 'Crear Simulador' : 'Editar Simulador') : (quizId ? 'Editar Quizt' : 'Crear Quizt')} • {isSim ? (areaTitle || 'General') : (areaTitle || 'Español')}
                </h1>
                <p className="text-sm sm:text-base font-medium text-slate-600">
                  Construye preguntas con imágenes, fórmulas LaTeX, opción múltiple, verdadero/falso y respuesta corta.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold shrink-0 whitespace-nowrap">
                <span className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white ring-2 ring-violet-200 shadow-md font-bold whitespace-nowrap">
                  <span className="opacity-90">Preguntas:</span> <span className="font-extrabold">{questions.length}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white ring-2 ring-indigo-200 shadow-md font-bold whitespace-nowrap">
                  <span className="opacity-90">Puntos:</span> <span className="font-extrabold">{totalPoints}</span>
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Contenido principal */}
        <main className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-6">
          {/* Acciones */}
          <section className="mb-6 rounded-3xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50/50 p-5 sm:p-6 shadow-lg ring-2 ring-slate-100/50">
            {isSim && (
              <>
                <div className="mb-5 grid gap-4 sm:grid-cols-2 border-b border-slate-200 pb-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Título del simulador</label>
                    <input
                      value={meta.titulo}
                      onChange={(e) => setMeta(m => ({ ...m, titulo: e.target.value }))}
                      placeholder="Ej. Simulador General"
                      className="w-full rounded-lg border-2 border-slate-300 px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Duración (minutos)</label>
                    <input
                      type="number"
                      value={meta.time_limit_min ?? ''}
                      onChange={(e) => setMeta(m => ({ ...m, time_limit_min: e.target.value === '' ? null : Number(e.target.value) }))}
                      placeholder="Ej. 60"
                      className="w-full rounded-lg border-2 border-slate-300 px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-colors"
                    />
                  </div>
                </div>
                {/* ✅ Campo editable para descripción/instrucciones */}
                <div className="mb-5 border-b border-slate-200 pb-5">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Descripción / Instrucciones
                  </label>
                  <RichTextEditor
                    value={descripcion || ''}
                    onChange={setDescripcion}
                    placeholder="Describe el simulador y proporciona instrucciones para los estudiantes. Este texto aparecerá en la lista de simuladores y cuando los estudiantes vean el simulador."
                  />
                  {!descripcion && (
                    <p className="mt-2 text-xs text-amber-600">
                      ⚠️ No hay descripción. Agrega una descripción para que los estudiantes sepan de qué trata este simulador.
                    </p>
                  )}
                </div>
              </>
            )}
            {/* ✅ Campo editable para descripción/instrucciones de quizzes */}
            {!isSim && (
              <div className="mb-5 border-b border-slate-200 pb-5">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Descripción / Instrucciones
                </label>
                <RichTextEditor
                  value={descripcion || ''}
                  onChange={setDescripcion}
                  placeholder="Describe el quiz y proporciona instrucciones para los estudiantes. Este texto aparecerá en la lista de quizzes y cuando los estudiantes vean el quiz."
                />
                {!descripcion && (
                  <p className="mt-2 text-xs text-amber-600">
                    ⚠️ No hay descripción. Agrega una descripción para que los estudiantes sepan de qué trata este quiz.
                  </p>
                )}
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-amber-700 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2.5 rounded-xl border-2 border-amber-200 shadow-sm">
                <svg className="h-5 w-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="font-bold">Guarda tu progreso antes de publicar</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={async () => {
                    const ok = await showConfirm('¿Estás seguro de que deseas cancelar? Se perderán los cambios no guardados. NO se guardará como borrador.', 'Confirmar cancelación');
                    if (!ok) return;

                    // ✅ Caso especial: simulador recién creado para entrar al builder (new=1)
                    // Si el usuario cancela, eliminar ese borrador para que no quede en la lista.
                    if (isSim && isNew && tempCreated && simId) {
                      try {
                        await deleteSimulacion(simId);
                      } catch (e) {
                        await showAlert(
                          e?.response?.data?.message || 'No se pudo eliminar el borrador automáticamente. Puedes eliminarlo desde la lista.',
                          'Aviso',
                          'warning'
                        );
                      }
                    }

                    // Navegar a la lista correspondiente
                    // Usamos replace: true para evitar "loops" con el botón Atrás
                    if (isSim) {
                      if (areaId) {
                        const areaParam = encodeURIComponent(areaTitle || areaId);
                        navigate(`/asesor/simuladores/modulo?area=${areaParam}`, { replace: true });
                      } else {
                        navigate('/asesor/simuladores/generales', { replace: true });
                      }
                    } else {
                      // Enviamos el título del área para que la lista cargue la materia correcta
                      navigate('/asesor/quizt', {
                        state: { title: areaTitle },
                        replace: true
                      });
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-rose-300 bg-white px-4 py-2.5 text-sm font-bold text-rose-700 hover:bg-rose-50 hover:border-rose-400 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancelar
                </button>
                <button
                  onClick={() => setPreviewOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Vista previa
                </button>
                {isSim ? (
                  <>
                    <button
                      onClick={handleDraft}
                      disabled={saving || loading}
                      className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-600 bg-gradient-to-r from-slate-700 to-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:from-slate-800 hover:to-slate-950 hover:border-slate-700 transition-all shadow-md hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-60 disabled:hover:scale-100"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {saving ? 'Guardando…' : 'Guardar borrador'}
                    </button>
                    <button
                      onClick={() => handleSaveSim({ publish: true })}
                      disabled={publishing || loading}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-5 py-2.5 text-sm font-bold text-white hover:from-emerald-700 hover:to-green-700 transition-all shadow-md hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-60 disabled:hover:scale-100 ring-2 ring-emerald-200/50"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      {publishing ? 'Publicando…' : 'Publicar'}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleDraft}
                      className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-600 bg-gradient-to-r from-slate-700 to-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:from-slate-800 hover:to-slate-950 hover:border-slate-700 transition-all shadow-md hover:shadow-xl hover:scale-105 active:scale-95"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Guardar borrador
                    </button>
                    {(quizId) ? (
                      <button
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:from-violet-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-60 disabled:hover:scale-100 ring-2 ring-violet-200/50"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        {saving ? 'Guardando…' : 'Guardar cambios'}
                      </button>
                    ) : (
                      <button
                        onClick={() => showAlert('Usa "Nuevo" para crear. Este builder está en modo edición si llegas desde Editar.', 'Información', 'info')}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:from-violet-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-xl hover:scale-105 active:scale-95 ring-2 ring-violet-200/50"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Publicar
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Constructor */}
          <section className="rounded-3xl border-2 border-slate-200 bg-white p-5 sm:p-6 shadow-lg ring-2 ring-slate-100/50">
            {loading && (
              <div className="mb-4 rounded-lg border-2 border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Cargando quiz…
                </div>
              </div>
            )}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-slate-200">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">Preguntas</h2>
                <p className="text-sm text-slate-600 mt-1 font-medium">Agrega diferentes tipos de preguntas a tu formulario</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => addQuestion("multiple")}
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-violet-300 bg-gradient-to-r from-violet-50 to-indigo-50 px-4 py-2.5 text-sm font-bold text-violet-700 hover:from-violet-100 hover:to-indigo-100 hover:border-violet-400 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 5v14M5 12h14" />
                  </svg>
                  Opción múltiple
                </button>
                <button
                  onClick={() => addQuestion("tf")}
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-indigo-300 bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-2.5 text-sm font-bold text-indigo-700 hover:from-indigo-100 hover:to-purple-100 hover:border-indigo-400 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 5v14M5 12h14" />
                  </svg>
                  Verdadero/Falso
                </button>
                <button
                  onClick={() => addQuestion("short")}
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2.5 text-sm font-bold text-purple-700 hover:from-purple-100 hover:to-pink-100 hover:border-purple-400 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 5v14M5 12h14" />
                  </svg>
                  Respuesta corta
                </button>
              </div>
            </div>

            <div
              className="space-y-4"
              key={`questions-container-${questions.length}`}
            >
              {loading ? (
                <div className="rounded-lg border-2 border-amber-300 bg-amber-50 px-4 py-8 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="text-sm font-semibold text-amber-700">Cargando preguntas...</p>
                  </div>
                </div>
              ) : questions.length === 0 && questionsLoaded ? (
                <div className="rounded-lg border-2 border-rose-200 bg-rose-50 px-4 py-8 text-center">
                  <p className="text-sm font-semibold text-rose-700">No hay preguntas. Agrega una usando los botones de arriba.</p>
                </div>
              ) : questions.length === 0 && !questionsLoaded ? (
                <div className="rounded-lg border-2 border-amber-300 bg-amber-50 px-4 py-8 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="text-sm font-semibold text-amber-700">Cargando preguntas...</p>
                  </div>
                </div>
              ) : (
                <>
                  {questions
                    .filter(q => q && q.id) // Filtrar primero las preguntas válidas
                    .map((q, index) => {
                      // Validar que el tipo sea válido
                      let validQ = { ...q };
                      if (!validQ.type || (validQ.type !== 'multiple' && validQ.type !== 'tf' && validQ.type !== 'short')) {
                        validQ.type = 'multiple';
                        if (!validQ.options || validQ.options.length === 0) {
                          validQ.options = [{ id: genId(), text: '', correct: false, image: null }];
                        }
                      }

                      return (
                        <QuestionCard
                          key={q.id}
                          q={validQ}
                          onChange={(data) => updateQuestion(q.id, data)}
                          onRemove={() => removeQuestion(q.id)}
                        />
                      );
                    })}
                </>
              )}
            </div>
          </section>
        </main>

        {/* Preview */}
        <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title="Vista previa">
          <article className="space-y-6">
            <header>
              <h3 className="text-lg font-semibold text-slate-900">{meta.titulo || (isSim ? 'Simulación' : 'Evaluación')} • {areaTitle || 'General'}</h3>
              <p className="mt-1 text-sm text-slate-500">Puntos totales: {totalPoints}</p>
            </header>

            <ol className="space-y-5">
              {questions.map((q, i) => (
                <li key={q.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="mb-2 text-sm text-slate-500">
                    {i + 1}.{" "}
                    {q.type === "multiple" ? "Opción múltiple" : q.type === "tf" ? "Verdadero/Falso" : "Respuesta corta"} •{" "}
                    {q.points} pt{q.points > 1 ? "s" : ""}
                  </div>

                  <div className="text-slate-900">
                    {q.text ? <MathText text={q.text} /> : <em className="text-slate-400">Sin consigna</em>}
                  </div>

                  {/* Imagen de la pregunta */}
                  {q.image?.preview && (
                    <img
                      src={q.image.preview}
                      alt=""
                      className="mb-3 max-h-56 w-full rounded-lg border border-slate-200 object-contain"
                    />
                  )}

                  {q.type === "multiple" && (
                    <ul className="mt-3 space-y-2">
                      {q.options.map((o) => (
                        <li
                          key={o.id}
                          className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-sm ${o.correct ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white"
                            }`}
                        >
                          {o.image?.preview && (
                            <img
                              src={o.image.preview}
                              alt=""
                              className="h-14 w-20 rounded border border-slate-200 object-cover"
                            />
                          )}
                          <span>
                            {o.text ? <MathText text={o.text} /> : <span className="text-slate-400">Opción sin texto</span>}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {q.type === "tf" && (
                    <p className="mt-3 text-sm text-slate-700">
                      Respuesta correcta: <strong>{q.answer === "true" ? "Verdadero" : "Falso"}</strong>
                    </p>
                  )}

                  {q.type === "short" && (
                    <p className="mt-3 text-sm text-slate-700">
                      Respuesta esperada: <strong>{q.answer || "—"}</strong>
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </article>
        </Modal>
      </div>
    </>
  );
}
