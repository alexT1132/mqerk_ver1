import React, { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createQuiz } from "../../../api/quizzes.js";
import { areaIdFromName } from "../../../api/actividades";
// Nota: reemplazado react-katex por un componente local liviano para evitar dependencia
import InlineMath from './InlineMath.jsx';
import MathExamplesHint from './MathExamplesHint.jsx';
import MathPalette, { Modal, FormulaEditModal } from './MathPalette.jsx';
import RichTextEditor from './RichTextEditor.jsx';
import { AIFormulaModal } from './AIFormulaModal.jsx';
import { useLocation } from "react-router-dom";
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
function MathText({ text = "", onFormulaClick }) {
  if (!text) return null;

  // ✅ Función para sanitizar HTML (similar a RichTextEditor)
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
      while (n.firstChild) {
        parent.insertBefore(n.firstChild, n);
      }
      parent.removeChild(n);
    });
    return div.innerHTML;
  };

  // ✅ Normalizar saltos de línea y espacios primero
  let processedText = String(text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // ✅ Reemplazar símbolos Unicode de multiplicación y división por comandos LaTeX
  processedText = processedText.replace(/×/g, '\\times').replace(/÷/g, '\\div');

  // Regex para detectar $...$ y $$...$$
  const fullLatexRe = /\$\$([\s\S]+?)\$\$|\$([\s\S]+?)\$/g;

  // Protegiendo LaTeX antes de procesar Markdown
  const latexPlaceholder = '___LATEX_PLACEHOLDER___';
  const latexMatches = [];
  let placeholderIndex = 0;

  processedText = processedText.replace(fullLatexRe, (match) => {
    const placeholder = `${latexPlaceholder}${placeholderIndex}___`;
    latexMatches.push(match);
    placeholderIndex++;
    return placeholder;
  });

  // Procesar Markdown: **texto** -> <strong>texto</strong>
  processedText = processedText.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');

  // Restaurar LaTeX
  latexMatches.forEach((match, idx) => {
    processedText = processedText.replace(`${latexPlaceholder}${idx}___`, match);
  });

  const parts = [];
  let lastIndex = 0;
  let m;
  let matchFound = false;

  fullLatexRe.lastIndex = 0;

  while ((m = fullLatexRe.exec(processedText)) !== null) {
    matchFound = true;
    if (m.index > lastIndex) {
      parts.push({ type: 'text', content: processedText.slice(lastIndex, m.index) });
    }

    // m[1] es para $$...$$, m[2] es para $...$
    const formula = (m[1] || m[2] || "").trim();
    const isBlock = !!m[1];

    if (formula) {
      parts.push({
        type: 'math',
        content: formula,
        full: m[0],
        start: m.index,
        end: m.index + m[0].length,
        display: isBlock
      });
    }
    lastIndex = m.index + m[0].length;
  }

  if (lastIndex < processedText.length) {
    parts.push({ type: 'text', content: processedText.slice(lastIndex) });
  }

  // Si no se encontraron fórmulas, devolver el texto con HTML procesado
  if (!matchFound || parts.length === 0) {
    return (
      <span
        className="block w-full break-words overflow-x-auto whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: sanitizeHtmlLite(processedText) }}
      />
    );
  }

  const handleFormulaClick = (formula, fullMatch, start, end) => {
    if (onFormulaClick) {
      onFormulaClick({ formula, fullMatch, start, end });
    }
  };

  // Renderizar las partes encontradas, con soporte para overflow
  return (
    <span className="block w-full break-words overflow-x-auto whitespace-pre-wrap">
      {parts.map((part, idx) =>
        part.type === 'math' ? (
          <span
            key={`math-${idx}`}
            onClick={() => onFormulaClick && handleFormulaClick(part.content, part.full, part.start, part.end)}
            className={`${onFormulaClick ? "cursor-pointer hover:bg-violet-100 rounded px-1 transition-colors" : ""} ${part.display ? "block text-center my-2" : "inline-block align-middle"}`}
            title={onFormulaClick ? "Clic para editar esta fórmula" : ""}
          >
            <InlineMath math={part.content} display={part.display} />
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
        <p className="text-sm font-bold text-slate-700 mb-2">{label}</p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
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
              className="inline-flex items-center gap-2 rounded-xl border-2 border-rose-300 bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700 hover:bg-rose-100 hover:border-rose-400 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
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
        <div className="rounded-xl border-2 border-slate-300 p-3 bg-gradient-to-br from-slate-50 to-white inline-block shadow-sm">
          <img
            src={value.preview}
            alt="Vista previa"
            className="h-32 w-auto max-w-xs rounded-lg border border-slate-200 object-cover shadow-md"
          />
        </div>
      )}
    </div>
  );
}

/** Inserta en el cursor de un textarea */
function insertAtCursor(textarea, insert, setValue) {
  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? textarea.value.length;
  const val = textarea.value;
  const next = val.slice(0, start) + insert + val.slice(end);
  setValue(next);

  requestAnimationFrame(() => {
    textarea.focus();
    const pos = start + insert.length;
    textarea.selectionStart = textarea.selectionEnd = pos;
  });
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
        <div className="flex-shrink-0 mt-1">
          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-bold text-sm border-2 ${option.correct
            ? 'border-emerald-500 bg-emerald-100 text-emerald-700'
            : 'border-slate-300 bg-slate-100 text-slate-600'
            }`}>
            {optionLabel})
          </span>
        </div>

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

  const handleAIInsert = (latexWithDelimiters) => {
    // Insertar nueva fórmula generada por IA en el cursor
    // Si tiene placeholders, el AIFormulaModal ya manejó el modal de placeholders
    insertAtCursor(textareaRef.current, latexWithDelimiters, (next) =>
      onChange({ ...q, text: next })
    );
  };

  const handleFormulaClick = ({ formula, fullMatch, start, end }) => {
    setEditingFormula({ formula, fullMatch, start, end });
    setEditModalOpen(true);
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
            className="rounded-xl border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 transition-all duration-200 hover:border-violet-400 shadow-sm"
          >
            <option value="multiple">Opción múltiple</option>
            <option value="tf">Verdadero / Falso</option>
            <option value="short">Respuesta corta</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-bold text-slate-600">Puntos</label>
          <input
            type="number"
            min={1}
            value={q.points}
            onChange={(e) =>
              onChange({ ...q, points: Number(e.target.value) || 1 })
            }
            className="w-20 rounded-xl border-2 border-slate-300 px-3 py-2.5 text-sm font-bold focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 transition-all duration-200 hover:border-violet-400 shadow-sm bg-white"
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
              <p className="text-sm font-bold text-slate-700">
                Opciones de respuesta
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Marca al menos una opción como correcta
              </p>
            </div>
            <button
              onClick={addOption}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
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
          <label className="block text-sm font-bold text-slate-700 mb-3">
            Respuesta correcta <span className="text-rose-500 font-bold">*</span>
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
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Respuesta esperada (palabras clave) <span className="text-rose-500 font-bold">*</span>
          </label>
          <p className="text-xs text-slate-500 mb-2">
            Especifica las palabras clave o la frase exacta que debe contener la respuesta del estudiante
          </p>
          <input
            type="text"
            value={q.answer}
            onChange={(e) => onChange({ ...q, answer: e.target.value })}
            placeholder="Ej. 'sujeto, predicado' o la frase exacta"
            className="w-full rounded-xl border-2 border-slate-300 px-4 py-3 text-sm font-medium focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-200/50 transition-all duration-200 hover:border-violet-400 bg-white"
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

const STORAGE_KEY = "selectedAreaTitle";

function getSafeStoredTitle() {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const v = String(raw).trim();
  if (!v || v.toLowerCase() === "null" || v.toLowerCase() === "undefined") return null;
  return v;
}

/* ----------------------------- Vista principal --------------------------- */
export default function EspanolFormBuilder() {

  const location = useLocation();
  const navigate = useNavigate();

  // lee el título que llega por state
  const incomingTitle = typeof location.state?.title === "string"
    ? location.state.title.trim()
    : null;

  // decide el título del área (state -> storage -> fallback)
  const [areaTitle, setAreaTitle] = useState(
    incomingTitle || getSafeStoredTitle() || "Español y redacción indirecta"
  );

  // si llegó un nuevo título, persístelo en la sesión
  useEffect(() => {
    if (incomingTitle && incomingTitle.length > 0) {
      setAreaTitle(incomingTitle);
      sessionStorage.setItem(STORAGE_KEY, incomingTitle);
    }
  }, [incomingTitle]);

  // Draft desde el modal (titulo, instrucciones, nombre, etc)
  const draft = location.state?.draft || null;

  // Obtener id_area del state si está disponible, sino intentar obtenerlo del nombre
  const incomingAreaId = location.state?.id_area || location.state?.areaId || null;

  const [questions, setQuestions] = useState([newQuestion("multiple")]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { showAlert, showConfirm, AlertComponent } = useAlert();

  const totalPoints = useMemo(
    () => questions.reduce((acc, q) => acc + (q.points || 0), 0),
    [questions]
  );

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
    const v = validate();
    if (!v.ok) {
      await showAlert(v.msg, 'Error de validación', 'error');
      return;
    }
    try {
      // Normalizar duración: aceptar horas >= 0 y minutos >= 0; llevar minutos >59 a horas
      const rawH = Number.isFinite(Number(draft?.horas)) ? Number(draft?.horas) : 0;
      const rawM = Number.isFinite(Number(draft?.minutos)) ? Number(draft?.minutos) : 0;
      const h = Math.max(0, Math.trunc(rawH));
      let m = Math.max(0, Math.trunc(rawM));
      const carryH = Math.floor(m / 60);
      const normH = h + carryH;
      const normM = m % 60;
      const totalMin = (normH * 60) + normM;

      // Asegurar que el título no esté vacío
      const tituloRaw = draft?.titulo || draft?.nombre || '';
      const titulo = tituloRaw.trim() || `${areaTitle || 'Quiz'} (Borrador) - ${new Date().toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;

      // Asegurar que el id_area esté presente
      const id_area = incomingAreaId || areaIdFromName?.(areaTitle) || null;

      // Validar que id_area no sea null antes de crear
      if (!id_area) {
        await showAlert(
          `No se pudo determinar el área del quiz. Por favor, asegúrate de estar creando el quiz desde una área válida. Área actual: "${areaTitle || 'no especificada'}"`,
          'Error de validación',
          'error'
        );
        return;
      }

      // Asegurar que haya descripción (instrucciones) - usar las del draft o generar una por defecto
      const descripcionRaw = draft?.instrucciones || draft?.descripcion || '';
      const descripcion = descripcionRaw.trim() || `Quiz generado automáticamente con IA. Lee cada pregunta y selecciona la respuesta correcta. Este quiz cubre contenido general del área de ${areaTitle || 'la materia'}.`;

      const body = {
        titulo: titulo,
        descripcion: descripcion, // Siempre tendrá un valor
        materia: areaTitle || null,
        id_area: id_area, // Ya validado que no es null
        publico: false, // Guardar como borrador
        fecha_limite: draft?.fechaLimite || null,
        max_intentos: draft?.intentosMode === 'limited' ? Number(draft?.maxIntentos || 1) : null,
        shuffle_questions: true,
        time_limit_min: totalMin > 0 ? totalMin : null,
        preguntas: questions.map(q => {
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
        })
      };
      await createQuiz(body);
      await showAlert("Borrador guardado exitosamente.", 'Borrador guardado', 'success');
      // Navegar de vuelta a la lista de quizzes - NO usar replace para preservar historial
      navigate('/asesor/quizt');
    } catch (e) {
      await showAlert(e?.response?.data?.message || 'No se pudo guardar el borrador', 'Error', 'error');
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

  const handlePublish = async () => {
    const v = validate();
    if (!v.ok) {
      await showAlert(v.msg, 'Error de validación', 'error');
      return;
    }
    try {
      // Normalizar duración: aceptar horas >= 0 y minutos >= 0; llevar minutos >59 a horas
      const rawH = Number.isFinite(Number(draft?.horas)) ? Number(draft?.horas) : 0;
      const rawM = Number.isFinite(Number(draft?.minutos)) ? Number(draft?.minutos) : 0;
      const h = Math.max(0, Math.trunc(rawH));
      let m = Math.max(0, Math.trunc(rawM));
      const carryH = Math.floor(m / 60);
      const normH = h + carryH;
      const normM = m % 60;
      const totalMin = (normH * 60) + normM;

      // Asegurar que el título no esté vacío
      const tituloRaw = draft?.titulo || draft?.nombre || '';
      const titulo = tituloRaw.trim() || `${areaTitle || 'Quiz'} - ${new Date().toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;

      // Asegurar que el id_area esté presente
      const id_area = incomingAreaId || areaIdFromName?.(areaTitle) || null;

      // Validar que id_area no sea null antes de crear
      if (!id_area) {
        await showAlert(
          `No se pudo determinar el área del quiz. Por favor, asegúrate de estar creando el quiz desde una área válida. Área actual: "${areaTitle || 'no especificada'}"`,
          'Error de validación',
          'error'
        );
        return;
      }

      // Asegurar que haya descripción (instrucciones) - usar las del draft o generar una por defecto
      const descripcionRaw = draft?.instrucciones || draft?.descripcion || '';
      const descripcion = descripcionRaw.trim() || `Quiz generado automáticamente con IA. Lee cada pregunta y selecciona la respuesta correcta. Este quiz cubre contenido general del área de ${areaTitle || 'la materia'}.`;

      const body = {
        titulo: titulo,
        descripcion: descripcion, // Siempre tendrá un valor
        materia: areaTitle || null,
        id_area: id_area, // Ya validado que no es null
        publico: true,
        fecha_limite: draft?.fechaLimite || null,
        max_intentos: draft?.intentosMode === 'limited' ? Number(draft?.maxIntentos || 1) : null,
        shuffle_questions: true,
        time_limit_min: totalMin > 0 ? totalMin : null,
        preguntas: questions.map(q => {
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
        })
      };

      const { data } = await createQuiz(body);
      await showAlert('Quizt creado exitosamente', 'Éxito', 'success');
      navigate('/asesor/quizt');
    } catch (e) {
      await showAlert(e?.response?.data?.message || 'No se pudo crear el quiz', 'Error', 'error');
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
                  Crear formulario • {areaTitle}
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
                    const confirmed = await showConfirm('¿Estás seguro de que deseas cancelar? Se perderán los cambios no guardados.', 'Confirmar cancelación');
                    if (confirmed) {
                      navigate('/asesor/quizt');
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
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Vista previa
                </button>
                <button
                  onClick={handleDraft}
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-600 bg-gradient-to-r from-slate-700 to-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:from-slate-800 hover:to-slate-950 hover:border-slate-700 transition-all shadow-md hover:shadow-xl hover:scale-105 active:scale-95"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Guardar borrador
                </button>
                <button
                  onClick={handlePublish}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:from-violet-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-xl hover:scale-105 active:scale-95 ring-2 ring-violet-200/50"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Publicar
                </button>
              </div>
            </div>
          </section>

          {/* Constructor */}
          <section className="rounded-3xl border-2 border-slate-200 bg-white p-5 sm:p-6 shadow-lg ring-2 ring-slate-100/50">
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

            <div className="space-y-4">
              {questions.map((q) => (
                <QuestionCard
                  key={q.id}
                  q={q}
                  onChange={(data) => updateQuestion(q.id, data)}
                  onRemove={() => removeQuestion(q.id)}
                />
              ))}
            </div>
          </section>
        </main>

        {/* Preview */}
        <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title="Vista previa">
          <article className="space-y-6">
            <header>
              <h3 className="text-lg font-semibold text-slate-900">Formulario de Español</h3>
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
                      {q.options.map((o, optIdx) => (
                        <li
                          key={o.id}
                          className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-sm ${o.correct ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white"
                            }`}
                        >
                          {/* Etiqueta de opción */}
                          <span className={`flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded font-bold text-xs border ${o.correct
                            ? 'border-emerald-400 bg-emerald-200 text-emerald-700'
                            : 'border-slate-300 bg-slate-100 text-slate-600'
                            }`}>
                            {getOptionLabel(optIdx)})
                          </span>

                          {o.image?.preview && (
                            <img
                              src={o.image.preview}
                              alt=""
                              className="h-14 w-20 rounded border border-slate-200 object-cover"
                            />
                          )}
                          <span className="flex-1">
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
