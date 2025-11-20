import React, { useMemo, useRef, useState, useEffect } from "react";
// Nota: reemplazado react-katex por un componente local liviano para evitar dependencia
import InlineMath from './InlineMath.jsx';
import MathPalette, { Modal } from './MathPalette.jsx';

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
    return `${h.slice(0,4).join('')}-${h.slice(4,6).join('')}-${h.slice(6,8).join('')}-${h.slice(8,10).join('')}-${h.slice(10).join('')}`;
  }
  // Último recurso
  return `id-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
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
/** Renderiza texto plano mezclado con fórmulas delimitadas por $...$ */
function MathText({ text = "" }) {
  const re = /\$(.+?)\$/g;
  const parts = [];
  let lastIndex = 0;
  let m;

  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIndex) {
      parts.push({ t: text.slice(lastIndex, m.index) });
    }
    parts.push({ m: m[1] });
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < text.length) parts.push({ t: text.slice(lastIndex) });

  return (
    <>
      {parts.map((p, i) =>
        p.m ? <InlineMath key={i} math={p.m} /> : <span key={i}>{p.t}</span>
      )}
    </>
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
    <div className="flex items-start gap-3">
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Seleccionar imagen
          </button>
          {value && (
            <button
              type="button"
              onClick={handleRemove}
              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100"
            >
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
        <img
          src={value.preview}
          alt="preview"
          className="h-24 w-32 rounded-lg border border-slate-200 object-cover"
        />
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

/* -------------------------- Componente de Opción ------------------------- */
function OptionRow({ option, onChange, onRemove }) {
  const inputRef = useRef(null);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const handlePick = (latexWithDelimiters) => {
    insertAtCursor(inputRef.current, latexWithDelimiters, (next) =>
      onChange({ ...option, text: next })
    );
    setPaletteOpen(false);
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-3">
      <div className="flex items-start gap-3">
        {/* marcar correcta */}
        <input
          type="checkbox"
          checked={option.correct}
          onChange={(e) => onChange({ ...option, correct: e.target.checked })}
          className="mt-2 h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
          title="Marcar como correcta"
        />

        <div className="flex-1">
          {/* >>> Vista previa del texto de la opción (LaTeX) */}
          <div className="mb-1 min-h-[18px] pl-0 text-sm text-slate-700">
            {option.text ? <MathText text={option.text} /> : null}
          </div>

          {/* input con botón calculadora */}
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={option.text}
              onChange={(e) => onChange({ ...option, text: e.target.value })}
              placeholder="Texto de opción (puede contener $\\frac{a}{b}$)"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 pr-12 text-sm
                         focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setPaletteOpen(true); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center
                         rounded-lg border border-slate-200 bg-white text-slate-700
                         hover:bg-slate-50 focus:outline-none"
              title="Insertar fórmula"
              aria-label="Insertar fórmula"
            >
              {/* ícono calculadora */}
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="4" y="3" width="16" height="18" rx="2" />
                <path d="M8 7h8M8 11h2M12 11h2M16 11h0M8 15h2M12 15h2M16 15h0" />
              </svg>
            </button>
          </div>
        </div>

        {/* eliminar opción */}
        <button
          onClick={onRemove}
          className="self-start rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
        >
          Eliminar
        </button>
      </div>

      {/* Imagen para la opción */}
      <ImagePicker
        value={option.image}
        onChange={(img) => onChange({ ...option, image: img })}
        label="Imagen de la opción (opcional)"
      />

      {/* Paleta LaTeX */}
      <MathPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onPick={handlePick}
      />
    </div>
  );
}

/* --------------------------- Tarjeta de Pregunta ------------------------- */
function QuestionCard({ q, onChange, onRemove }) {
  const textareaRef = useRef(null);
  const [paletteOpen, setPaletteOpen] = useState(false);

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
    insertAtCursor(textareaRef.current, latexWithDelimiters, (next) =>
      onChange({ ...q, text: next })
    );
    setPaletteOpen(false);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-grid h-9 w-9 place-items-center rounded-lg bg-violet-600 text-white">
            Q
          </span>
          <select
            value={q.type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="multiple">Opción múltiple</option>
            <option value="tf">Verdadero / Falso</option>
            <option value="short">Respuesta corta</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-600">Puntos</label>
          <input
            type="number"
            min={1}
            value={q.points}
            onChange={(e) =>
              onChange({ ...q, points: Number(e.target.value) || 1 })
            }
            className="w-20 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <button
            onClick={onRemove}
            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100"
          >
            Eliminar
          </button>
        </div>
      </div>

      {/* Vista previa en vivo del enunciado */}
        <div className="mt-3 text-sm text-slate-700">
          <MathText text={q.text} />
        </div>

      {/* Enunciado + botón paleta */}
      <div className="mt-3">
        <div className="relative">
          <textarea
            ref={textareaRef}
            rows={2}
            value={q.text}
            onChange={(e) => onChange({ ...q, text: e.target.value })}
            placeholder="Escribe la consigna… Puedes usar $\\sqrt{x}$, $\\frac{a}{b}$, etc."
            className="w-full rounded-lg border border-slate-200 px-3 py-2 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          {/* Botón calculadora (abre paleta) */}
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            title="Insertar fórmula"
          >
            {/* ícono calculadora simple */}
            <svg viewBox="0 0 24 24" className="h-5 w-5">
              <path
                d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm0 5h10M8 13h2m-2 4h2m4-4h2m-2 4h2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Imagen de la pregunta */}
      <div className="mt-3">
        <ImagePicker
          value={q.image}
          onChange={(img) => onChange({ ...q, image: img })}
          label="Imagen de la pregunta (opcional)"
        />
      </div>

      {/* Tipo múltiple con opciones + imágenes */}
      {q.type === "multiple" && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700">
              Opciones (marca la correcta)
            </p>
            <button
              onClick={addOption}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              + Agregar opción
            </button>
          </div>
          {q.options.map((opt) => (
            <div key={opt.id}>
              <OptionRow
                option={opt}
                onChange={setOption}
                onRemove={() => removeOption(opt.id)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Tipo verdadero/falso */}
      {q.type === "tf" && (
        <div className="mt-3">
          <label className="text-sm font-medium text-slate-700">
            Respuesta correcta
          </label>
          <div className="mt-2 flex gap-4">
            {["true", "false"].map((v) => (
              <label
                key={v}
                className="inline-flex items-center gap-2 text-sm text-slate-700"
              >
                <input
                  type="radio"
                  name={`tf-${q.id}`}
                  value={v}
                  checked={q.answer === v}
                  onChange={(e) => onChange({ ...q, answer: e.target.value })}
                  className="h-4 w-4 text-violet-600 focus:ring-violet-500"
                />
                {v === "true" ? "Verdadero" : "Falso"}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Tipo respuesta corta */}
      {q.type === "short" && (
        <div className="mt-3">
          <label className="text-sm font-medium text-slate-700">
            Respuesta esperada (palabras clave)
          </label>
          <input
            type="text"
            value={q.answer}
            onChange={(e) => onChange({ ...q, answer: e.target.value })}
            placeholder="Ej. 'sujeto, predicado' o la frase exacta"
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      )}

      {/* Modal paleta */}
      <MathPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onPick={handlePick}
      />
    </div>
  );
}

/* ----------------------------- Vista principal --------------------------- */
export default function EspanolFormBuilder() {
  const [questions, setQuestions] = useState([newQuestion("multiple")]);
  const [previewOpen, setPreviewOpen] = useState(false);

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

  const handleDraft = () => {
    console.log("Borrador:", payload);
    alert("Borrador guardado (console.log).");
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
    if (!v.ok) return alert(v.msg);

    // Ejemplo real:
    // const formData = buildFormData(payload);
    // await fetch("/api/forms/espanol", { method: "POST", body: formData });

    console.log("Publicar (payload con archivos en memoria):", payload);
    alert("Formulario publicado (console.log).");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-6 rounded-2xl border border-slate-200 bg-gradient-to-r from-violet-600 to-fuchsia-600 p-6 text-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">Crear formulario • Español</h1>
            <p className="mt-1 text-sm opacity-90">
              Construye preguntas con imágenes, LaTeX, opción múltiple, verdadero/falso y respuesta corta.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="rounded-full bg-white/15 px-3 py-1">Preguntas: {questions.length}</span>
            <span className="rounded-full bg-white/15 px-3 py-1">Puntos: {totalPoints}</span>
          </div>
        </div>
      </header>

      {/* Acciones */}
      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            onClick={() => setPreviewOpen(true)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Vista previa
          </button>
          <button
            onClick={handleDraft}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Guardar borrador
          </button>
          <button
            onClick={handlePublish}
            className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-700"
          >
            Publicar
          </button>
        </div>
      </section>

      {/* Constructor */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900">Preguntas</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => addQuestion("multiple")}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              + Opción múltiple
            </button>
            <button
              onClick={() => addQuestion("tf")}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              + Verdadero/Falso
            </button>
            <button
              onClick={() => addQuestion("short")}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              + Respuesta corta
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

                <div className="font-medium text-slate-900">
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
                        className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-sm ${
                          o.correct ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white"
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
  );
}
