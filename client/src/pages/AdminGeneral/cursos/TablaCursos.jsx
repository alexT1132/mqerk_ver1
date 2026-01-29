import { useMemo, useState, useEffect } from "react";

/* ================== UTIL ================== */
const genId = () => (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
const todayISO = () => new Date().toISOString();
const fmtDate = (iso) => new Date(iso).toLocaleDateString("es-MX", { year: "2-digit", month: "2-digit", day: "2-digit" });

/* ================== BADGES ================== */
const LevelBadge = ({ level = "Intermedio", className = "" }) => {
  const styles = {
    Básico: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Intermedio: "bg-violet-50 text-violet-700 ring-violet-200",
    Avanzado: "bg-amber-50 text-amber-700 ring-amber-200",
  }[level] ?? "bg-slate-100 text-slate-700 ring-slate-200";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${styles} ${className}`}>
      {level}
    </span>
  );
};
const SectionBadge = ({ value }) => {
  const isAlumnos = value === "alumnos";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
      isAlumnos ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-sky-50 text-sky-700 ring-sky-200"}`}>
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
        {isAlumnos ? (<><path d="M12 3 3 8l9 5 9-5-9-5Z"/><path d="M7 13v5l5 3 5-3v-5"/></>) : (<><path d="M4 4h16v6H4z"/><path d="M8 14h8"/><path d="M6 18h12"/></>)}
      </svg>
      {isAlumnos ? "Alumnos" : "Docentes"}
    </span>
  );
};

/* ================== CARD ================== */
const CourseCard = ({ level, image, name, subtitle, tags = [], duration = 8, durationUnit = "semanas", modality = "Presencial", rating = 4.8, students = 0 }) => (
  <article className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
    <div className="relative">
      {image ? (
        <img src={image} alt={name || "Curso"} className="h-40 w-full object-cover" />
      ) : (
        <div className="h-40 w-full bg-gradient-to-br from-slate-100 to-slate-200 grid place-items-center text-slate-400">
          <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M4 6h16M4 12h10M4 18h7" />
          </svg>
        </div>
      )}
      <div className="absolute left-3 top-3"><LevelBadge level={level} /></div>
    </div>
    <div className="p-4">
      <h3 className="text-base md:text-lg font-semibold text-slate-900">{name || "Nombre del curso"}</h3>
      <p className="text-slate-500 text-sm mt-1">{subtitle || "Descripción breve del curso"}</p>
      {tags?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.slice(0, 6).map((t) => (
            <span key={t + Math.random()} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700">{t}</span>
          ))}
        </div>
      )}
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1">{duration} {durationUnit}</span>
          <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1">{modality}</span>
        </div>
        <div className="text-right text-xs text-slate-600">
          <span className="inline-flex items-center gap-1 font-medium text-slate-800">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M12 17.3 6.8 20l1-5.8-4.2-4.1 5.9-.9L12 4l2.6 5.2 5.9.9-4.2 4.1 1 5.8-5.2-2.7z"/></svg>
            {Number(rating || 0).toFixed(1)}
          </span>
          <div className="text-slate-500">{students} alumnos</div>
        </div>
      </div>
    </div>
  </article>
);

/* ================== IMAGE UPLOADER ================== */
function ImageUploader({ value, onChange }) {
  const [drag, setDrag] = useState(false);
  const [objectUrl, setObjectUrl] = useState("");

  // si value es un File, generamos preview; si es string (URL/base64), úsalo tal cual
  useEffect(() => {
    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setObjectUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setObjectUrl("");
    }
  }, [value]);

  const preview = value instanceof File ? objectUrl : (typeof value === "string" ? value : "");

  const handleFiles = (files) => {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Sube una imagen (png, jpg, webp)."); return; }
    onChange?.(file); // guardas el File; para backend puedes usar FormData luego
  };

  return (
    <div
      className={`rounded-2xl border-2 ${drag ? "border-slate-400" : "border-dashed border-slate-300"} bg-slate-50/60 p-4`}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
    >
      <div className="flex items-center gap-4">
        <div className="h-20 w-32 overflow-hidden rounded-xl bg-white border border-slate-200 grid place-items-center">
          {preview ? (
            <img src={preview} alt="preview" className="h-full w-full object-cover" />
          ) : (
            <svg viewBox="0 0 24 24" className="h-10 w-10 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M3 7h18M7 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
              <path d="m3 7 3 10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l3-10" />
              <path d="M10 12l2 2 3-3" />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-700 font-medium">Imagen del curso</p>
          <p className="text-xs text-slate-500">Arrastra y suelta, o <label className="text-slate-900 underline cursor-pointer">explora</label></p>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => document.querySelector('input[type="file"].sr-only')?.click()}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-white"
            >
              Subir imagen
            </button>
            {preview && (
              <>
                <a href={preview} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-white">
                  Ver
                </a>
                <button
                  type="button"
                  onClick={() => onChange?.("")}
                  className="rounded-xl border border-rose-200 text-rose-700 px-3 py-1.5 hover:bg-rose-50 text-sm"
                >
                  Quitar
                </button>
              </>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">PNG/JPG/WebP · máx 3–5MB (recomendado 1200×600)</p>
        </div>
      </div>
    </div>
  );
}

/* ================== DATA & DEFAULTS ================== */
const defaults = () => ({
  id: genId(),
  name: "",
  code: "",
  section: "alumnos",
  createdAt: todayISO(),
  level: "Intermedio",
  image: "", // File o string
  subtitle: "",
  tags: [],
  tagsText: "",
  duration: 8,
  durationUnit: "semanas",
  modality: "Presencial",
  rating: 4.8,
  students: 0,
});
const parseTags = (txt) => txt.split(",").map((t) => t.trim()).filter(Boolean);

const Empty = ({ onNew }) => (
  <div className="text-center py-16">
    <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 grid place-items-center">
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </div>
    <p className="text-slate-600 font-medium">Aún no hay cursos</p>
    <p className="text-slate-500 text-sm mt-1">Crea tu primer curso y asigna su sección.</p>
    <button onClick={onNew} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2 text-sm hover:opacity-95">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
      Nuevo curso
    </button>
  </div>
);

/* ================== PAGE ================== */
export default function CursosManager({ initial }) {
  const [items, setItems] = useState(initial ?? []);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState({ open: false, mode: "create", draft: null });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((c) => [c.name, c.code, c.section, c.level, c.modality, c.tags?.join(" ")].join(" ").toLowerCase().includes(q));
  }, [items, query]);

  const openCreate = () => setModal({ open: true, mode: "create", draft: defaults() });
  const openEdit = (c) => setModal({ open: true, mode: "edit", draft: { ...c, tagsText: c.tags?.join(", ") ?? "" } });
  const closeModal = () => setModal({ open: false, mode: "create", draft: null });

  const saveDraft = () => {
    const d = modal.draft;
    if (!d.name.trim()) return alert("El nombre del curso es obligatorio.");
    const toSave = { ...d, tags: parseTags(d.tagsText ?? d.tags?.join(",") ?? "") };
    if (modal.mode === "create") setItems((p) => [{ ...toSave }, ...p]);
    else setItems((p) => p.map((x) => (x.id === d.id ? toSave : x)));
    closeModal();
  };
  const remove = (id) => { if (confirm("¿Eliminar este curso?")) setItems((p) => p.filter((x) => x.id !== id)); };

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">Cursos</h1>
          <p className="text-slate-500 text-sm">Crea cursos y define toda la información que verás en la tarjeta.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />
            </svg>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar curso, etiqueta, modalidad…" className="w-64 rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5"/>
          </div>
          <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-3.5 py-2 text-sm hover:opacity-95">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
            Nuevo
          </button>
        </div>
      </div>

      {/* Tabla (desktop) */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hidden md:block">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left font-medium">#</th>
              <th className="px-4 py-3 text-left font-medium">Curso</th>
              <th className="px-4 py-3 text-left font-medium">Nivel</th>
              <th className="px-4 py-3 text-left font-medium">Modalidad</th>
              <th className="px-4 py-3 text-left font-medium">Sección</th>
              <th className="px-4 py-3 text-left font-medium">Alumnos</th>
              <th className="px-4 py-3 text-left font-medium">Creado</th>
              <th className="px-4 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr><td colSpan="8" className="px-4 py-10 text-center text-slate-500">Sin resultados.</td></tr>
            ) : (
              filtered.map((c, i) => (
                <tr key={c.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{c.name}</td>
                  <td className="px-4 py-3"><LevelBadge level={c.level} /></td>
                  <td className="px-4 py-3 text-slate-600">{c.modality}</td>
                  <td className="px-4 py-3"><SectionBadge value={c.section} /></td>
                  <td className="px-4 py-3 text-slate-600">{c.students}</td>
                  <td className="px-4 py-3 text-slate-600">{fmtDate(c.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(c)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-700 hover:bg-slate-50">Editar</button>
                      <button onClick={() => remove(c.id)} className="rounded-lg border border-rose-200 text-rose-700 px-3 py-1.5 hover:bg-rose-50">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Tarjetas (móvil) */}
      <div className="md:hidden mt-4 grid grid-cols-1 gap-3">
        {filtered.length === 0 ? <Empty onNew={openCreate} /> : filtered.map((c) => <CourseCard key={c.id} {...c} />)}
      </div>

      {/* MODAL MEJORADO */}
      {modal.open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 px-3" onMouseDown={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="w-full max-w-5xl rounded-2xl bg-white shadow-xl">
            {/* header */}
            <div className="flex items-start justify-between p-5 border-b border-slate-100">
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-slate-900">
                  {modal.mode === "create" ? "Nuevo curso" : "Editar curso"}
                </h2>
                <p className="text-slate-500 text-sm">Completa los campos y sube una imagen. A la derecha verás la previsualización.</p>
              </div>
              <button onClick={closeModal} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="Cerrar">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>

            {/* body */}
            <div className="grid lg:grid-cols-[1.15fr_1fr] gap-6 p-5 max-h-[75vh] overflow-y-auto">
              {/* --- Columna izquierda: FORM con aire --- */}
              <div className="grid gap-6">
                {/* Identificación */}
                <section className="grid gap-3">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Identificación</p>
                  <div className="grid md:grid-cols-12 gap-3">
                    <label className="md:col-span-12 grid gap-1">
                      <span className="text-sm text-slate-700">Nombre del curso *</span>
                      <input
                        value={modal.draft.name}
                        onChange={(e) => setModal(m => ({ ...m, draft: { ...m.draft, name: e.target.value } }))}
                        className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/5"
                        placeholder="Entrenamiento para el examen…"
                      />
                    </label>
                    <label className="md:col-span-6 grid gap-1">
                      <span className="text-sm text-slate-700">Código</span>
                      <input
                        value={modal.draft.code}
                        onChange={(e) => setModal(m => ({ ...m, draft: { ...m.draft, code: e.target.value } }))}
                        className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-slate-900/5"
                        placeholder="ADM-UNI"
                      />
                    </label>
                    <label className="md:col-span-6 grid gap-1">
                      <span className="text-sm text-slate-700">Sección</span>
                      <select
                        value={modal.draft.section}
                        onChange={(e) => setModal(m => ({ ...m, draft: { ...m.draft, section: e.target.value } }))}
                        className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-slate-900/5"
                      >
                        <option value="alumnos">Alumnos</option>
                        <option value="docentes">Docentes</option>
                      </select>
                    </label>
                  </div>
                </section>

                {/* Detalle */}
                <section className="grid gap-3">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Detalle</p>
                  <label className="grid gap-1">
                    <span className="text-sm text-slate-700">Descripción breve</span>
                    <input
                      value={modal.draft.subtitle}
                      onChange={(e) => setModal(m => ({ ...m, draft: { ...m.draft, subtitle: e.target.value } }))}
                      className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-slate-900/5"
                      placeholder="Razonamiento y habilidades…"
                    />
                  </label>

                  <div className="grid md:grid-cols-2 gap-3">
                    <label className="grid gap-1">
                      <span className="text-sm text-slate-700">Nivel</span>
                      <select
                        value={modal.draft.level}
                        onChange={(e) => setModal(m => ({ ...m, draft: { ...m.draft, level: e.target.value } }))}
                        className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-slate-900/5"
                      >
                        <option>Básico</option>
                        <option>Intermedio</option>
                        <option>Avanzado</option>
                      </select>
                    </label>
                    <label className="grid gap-1">
                      <span className="text-sm text-slate-700">Modalidad</span>
                      <select
                        value={modal.draft.modality}
                        onChange={(e) => setModal(m => ({ ...m, draft: { ...m.draft, modality: e.target.value } }))}
                        className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-slate-900/5"
                      >
                        <option>Presencial</option>
                        <option>En línea</option>
                        <option>Híbrido</option>
                      </select>
                    </label>
                  </div>
                </section>

                {/* Plan */}
                <section className="grid gap-3">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Plan</p>
                  <div className="grid md:grid-cols-12 gap-3">
                    <label className="md:col-span-5 grid gap-1">
                      <span className="text-sm text-slate-700">Duración</span>
                      <div className="flex gap-2">
                        <input
                          type="number" min="1"
                          value={modal.draft.duration}
                          onChange={(e) => setModal(m => ({ ...m, draft: { ...m.draft, duration: Number(e.target.value) } }))}
                          className="w-24 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-slate-900/5"
                        />
                        <select
                          value={modal.draft.durationUnit}
                          onChange={(e) => setModal(m => ({ ...m, draft: { ...m.draft, durationUnit: e.target.value } }))}
                          className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-slate-900/5"
                        >
                          <option>semanas</option><option>horas</option><option>días</option><option>meses</option>
                        </select>
                      </div>
                    </label>
                    <label className="md:col-span-3 grid gap-1">
                      <span className="text-sm text-slate-700">Rating</span>
                      <input
                        type="number" step="0.1" min="0" max="5"
                        value={modal.draft.rating}
                        onChange={(e) => setModal(m => ({ ...m, draft: { ...m.draft, rating: Number(e.target.value) } }))}
                        className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-slate-900/5"
                      />
                    </label>
                    <label className="md:col-span-4 grid gap-1">
                      <span className="text-sm text-slate-700">Alumnos</span>
                      <input
                        type="number" min="0"
                        value={modal.draft.students}
                        onChange={(e) => setModal(m => ({ ...m, draft: { ...m.draft, students: Number(e.target.value) } }))}
                        className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-slate-900/5"
                      />
                    </label>
                  </div>

                  <label className="grid gap-1">
                    <span className="text-sm text-slate-700">Etiquetas (separadas por coma)</span>
                    <input
                      value={modal.draft.tagsText}
                      onChange={(e) => setModal(m => ({ ...m, draft: { ...m.draft, tagsText: e.target.value } }))}
                      placeholder="Problemas, Razonamiento, Estrategias"
                      className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-slate-900/5"
                    />
                  </label>
                </section>

                {/* Imagen (uploader) */}
                <section className="grid gap-3">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Imagen</p>
                  <ImageUploader
                    value={modal.draft.image}
                    onChange={(fileOrEmpty) => setModal(m => ({ ...m, draft: { ...m.draft, image: fileOrEmpty } }))}
                  />
                </section>
              </div>

              {/* --- Columna derecha: PREVIEW sticky --- */}
              <div className="grid gap-2 lg:sticky lg:top-5 self-start">
                <p className="text-sm text-slate-500">Previsualización</p>
                <CourseCard
                  level={modal.draft.level}
                  image={modal.draft.image instanceof File ? URL.createObjectURL(modal.draft.image) : modal.draft.image}
                  name={modal.draft.name}
                  subtitle={modal.draft.subtitle}
                  tags={parseTags(modal.draft.tagsText)}
                  duration={modal.draft.duration}
                  durationUnit={modal.draft.durationUnit}
                  modality={modal.draft.modality}
                  rating={modal.draft.rating}
                  students={modal.draft.students}
                />
              </div>
            </div>

            {/* footer */}
            <div className="flex justify-end gap-2 p-5 border-t border-slate-100">
              <button onClick={closeModal} className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Cancelar</button>
              <button onClick={saveDraft} className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm hover:opacity-95">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}