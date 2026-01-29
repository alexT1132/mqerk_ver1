// AsesorAsignaciones.jsx
import React, { useMemo, useState } from "react";

/* ------------------ Utils & catálogos ------------------ */
const uid = () =>
  (globalThis.crypto?.randomUUID?.() ??
    Math.random().toString(36).slice(2) + Date.now().toString(36));

const GROUP_TEMPLATES = [
  "Grupo A",
  "Grupo B",
  "Grupo C",
  "1A Matutino",
  "1B Vespertino",
  "2A Matutino",
  "2B Vespertino",
];

/* ------------------ Componente principal ------------------ */
export default function AsesorAsignaciones({
  asesores = DEMO_ASESORES,
  cursos = DEMO_CURSOS,
  onSave, // (payload) => void
}) {
  const [selectedAdvisorId, setSelectedAdvisorId] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState([]); // [courseId]
  const [groupsByCourse, setGroupsByCourse] = useState({}); // { [courseId]: [{id,name}] }
  const [groupSelect, setGroupSelect] = useState({}); // { [courseId]: optionValue }
  const [customGroup, setCustomGroup] = useState({}); // { [courseId]: string }
  const [q, setQ] = useState("");

  const filteredAdvisors = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return asesores;
    return asesores.filter(
      (a) =>
        a.name.toLowerCase().includes(s) ||
        (a.role ?? "").toLowerCase().includes(s)
    );
  }, [q, asesores]);

  const advisor = useMemo(
    () => asesores.find((a) => a.id === selectedAdvisorId) ?? null,
    [selectedAdvisorId, asesores]
  );

  const toggleCourse = (id) => {
    setSelectedCourses((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const addGroup = (courseId) => {
    const opt = groupSelect[courseId];
    const isCustom = opt === "__custom__";
    const name = (isCustom ? customGroup[courseId] : opt)?.trim();
    if (!name) return;

    const list = groupsByCourse[courseId] ?? [];
    const exists = list.some((g) => g.name.toLowerCase() === name.toLowerCase());
    if (exists) return;

    setGroupsByCourse((prev) => ({
      ...prev,
      [courseId]: [...list, { id: uid(), name }],
    }));
    setCustomGroup((p) => ({ ...p, [courseId]: "" }));
    setGroupSelect((p) => ({ ...p, [courseId]: "" }));
  };

  const removeGroup = (courseId, groupId) => {
    setGroupsByCourse((prev) => ({
      ...prev,
      [courseId]: (prev[courseId] ?? []).filter((g) => g.id !== groupId),
    }));
  };

  const handleSave = () => {
    if (!advisor) return;
    const payload = {
      advisorId: advisor.id,
      courses: selectedCourses.map((cid) => ({
        id: cid,
        groups: groupsByCourse[cid] ?? [],
      })),
    };
    // Persistencia local opcional
    try {
      const key = "asignacionesAsesores";
      const all = JSON.parse(localStorage.getItem(key) || "{}");
      all[advisor.id] = payload;
      localStorage.setItem(key, JSON.stringify(all));
    } catch {}
    onSave?.(payload);
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-4">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 7h6a3 3 0 0 1 3 3v4" />
              <circle cx="4" cy="7" r="2" />
              <circle cx="13" cy="14" r="2" />
              <path d="M13 14h7" />
              <circle cx="20" cy="14" r="2" />
            </svg>
          </span>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900">
            Asignar cursos y grupos
          </h2>
        </div>

        <button
          onClick={handleSave}
          disabled={!advisor || selectedCourses.length === 0}
          className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 active:scale-95 disabled:opacity-40"
        >
          Guardar asignación
        </button>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Asesores */}
        <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <header className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-700">Asesores registrados</h3>
            <div className="relative">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar…"
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm outline-none focus:border-indigo-300"
              />
              <span className="pointer-events-none absolute right-2 top-1.5 text-slate-400">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" /><path d="M21 21l-3.5-3.5" />
                </svg>
              </span>
            </div>
          </header>

          <ul className="space-y-2 max-h-[480px] overflow-auto pr-1">
            {filteredAdvisors.map((a) => {
              const active = a.id === selectedAdvisorId;
              return (
                <li key={a.id}>
                  <button
                    onClick={() => {
                      setSelectedAdvisorId(a.id);
                      setSelectedCourses([]);
                      setGroupsByCourse({});
                      setGroupSelect({});
                      setCustomGroup({});
                    }}
                    className={[
                      "w-full flex items-center gap-3 rounded-xl border p-3 text-left transition",
                      active
                        ? "border-emerald-500 ring-2 ring-emerald-400/60 bg-emerald-50/60"
                        : "border-slate-200 bg-white hover:shadow-sm",
                    ].join(" ")}
                  >
                    <img src={a.avatar} alt={a.name} className="h-9 w-9 rounded-xl object-cover" />
                    <div className="min-w-0">
                      <p className={["truncate text-sm font-medium", active ? "text-emerald-700" : "text-slate-800"].join(" ")}>
                        {a.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{a.role}</p>
                    </div>
                  </button>
                </li>
              );
            })}
            {filteredAdvisors.length === 0 && (
              <li className="text-sm text-slate-500 px-1">Sin resultados</li>
            )}
          </ul>
        </aside>

        {/* Cursos + grupos */}
        <main className="space-y-6">
          {!advisor ? (
            <div className="grid place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
              <p className="text-sm">Selecciona un asesor a la izquierda para asignarle cursos y crear grupos.</p>
            </div>
          ) : (
            <>
              {/* Selector de cursos */}
              <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <header className="mb-3 flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 7l9-4 9 4-9 4-9-4Z" />
                      <path d="M3 7v6l9 4 9-4V7" />
                    </svg>
                  </span>
                  <h3 className="text-sm font-semibold text-slate-700">Cursos</h3>
                </header>

                <div className="flex flex-wrap gap-2">
                  {cursos.map((c) => {
                    const active = selectedCourses.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        onClick={() => toggleCourse(c.id)}
                        className={[
                          "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition",
                          active
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-400/60"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300",
                        ].join(" ")}
                        title={active ? "Quitar curso" : "Agregar curso"}
                      >
                        <img src={c.image} alt={c.title} className="h-5 w-5 rounded object-cover" />
                        <span className="truncate max-w-[12rem]">{c.title}</span>
                        {active && (
                          <span className="grid h-4 w-4 place-items-center rounded-full bg-emerald-500 text-white text-[10px]">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Gestor de grupos por curso */}
              {selectedCourses.length > 0 ? (
                <section className="space-y-4">
                  {selectedCourses.map((cid) => {
                    const course = cursos.find((c) => c.id === cid);
                    const groups = groupsByCourse[cid] ?? [];
                    return (
                      <div key={cid} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <header className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img src={course.image} alt={course.title} className="h-8 w-8 rounded object-cover" />
                            <h4 className="text-sm font-semibold text-slate-800">{course.title}</h4>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                              {groups.length} grupos
                            </span>
                          </div>
                        </header>

                        {/* Lista de grupos */}
                        {groups.length > 0 ? (
                          <ul className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {groups.map((g) => (
                              <li key={g.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                                <span className="truncate">{g.name}</span>
                                <button
                                  onClick={() => removeGroup(cid, g.id)}
                                  className="rounded-full p-1 text-slate-500 hover:bg-white hover:text-rose-600"
                                  title="Eliminar grupo"
                                >
                                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                  </svg>
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mb-3 text-sm text-slate-500">Aún no hay grupos en este curso.</p>
                        )}

                        {/* Agregar grupo: SELECT + (opcional) input */}
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <div className="flex-1 flex flex-col gap-2 sm:flex-row">
                            <select
                              value={groupSelect[cid] ?? ""}
                              onChange={(e) =>
                                setGroupSelect((prev) => ({ ...prev, [cid]: e.target.value }))
                              }
                              className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-300"
                            >
                              <option value="">Selecciona un grupo…</option>
                              {GROUP_TEMPLATES.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                              <option value="__custom__">Otro…</option>
                            </select>

                            {groupSelect[cid] === "__custom__" && (
                              <input
                                value={customGroup[cid] ?? ""}
                                onChange={(e) =>
                                  setCustomGroup((prev) => ({ ...prev, [cid]: e.target.value }))
                                }
                                placeholder="Nombre personalizado"
                                className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-300"
                              />
                            )}
                          </div>

                          <button
                            onClick={() => addGroup(cid)}
                            disabled={
                              !groupSelect[cid] ||
                              (groupSelect[cid] === "__custom__" && !(customGroup[cid] ?? "").trim())
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
                          >
                            Agregar grupo
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 5v14M5 12h14" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </section>
              ) : (
                <div className="grid place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
                  <p className="text-sm">Selecciona uno o más cursos para comenzar a crear grupos.</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </section>
  );
}

/* ------------------ Demo data ------------------ */
const DEMO_ASESORES = [
  { id: 1, name: "César Lagunes", role: "English Teacher", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&q=80&auto=format&fit=crop" },
  { id: 2, name: "Ana Duarte", role: "Math Coach", avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=120&q=80&auto=format&fit=crop" },
  { id: 3, name: "Daniel Pérez", role: "CS Mentor", avatar: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=120&q=80&auto=format&fit=crop" },
];

const DEMO_CURSOS = [
  { id: 101, title: "English Elemental", image: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=120&q=80&auto=format&fit=crop" },
  { id: 102, title: "Matemáticas Básicas", image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=120&q=80&auto=format&fit=crop" },
  { id: 103, title: "Computación I", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=120&q=80&auto=format&fit=crop" },
  { id: 104, title: "Orientación Educativa", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=120&q=80&auto=format&fit=crop" },
];
