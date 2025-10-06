// AsesorDashboard.jsx (MARCA el seleccionado)
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

/* Chip con estilo de seleccionado */
const CourseChip = ({ title, image, selected, onSelect }) => {
  return (
    <Link
      to={`/asesor/dashboard`} // puedes dejarlo así; refresca misma ruta
      state={{ curso: title }}
      onClick={() => onSelect?.(title)}
      aria-current={selected ? "true" : "false"}
      className={[
        "relative group flex items-center gap-4 rounded-xl p-4 shadow-sm transition",
        selected
          ? "border border-emerald-500 ring-2 ring-emerald-400/60 bg-emerald-50/60 hover:shadow-md"
          : "border border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow-md",
      ].join(" ")}
      title={selected ? "Curso seleccionado" : "Seleccionar curso"}
    >
      {/* Check minimalista */}
      {selected && (
        <span className="pointer-events-none absolute -top-2 -right-2 grid h-6 w-6 place-items-center rounded-full bg-emerald-500 text-white text-xs shadow-lg">
          ✓
        </span>
      )}

      <img
        src={image}
        alt={title}
        className={[
          "h-12 w-12 rounded-lg object-cover",
          selected ? "ring-2 ring-emerald-400" : "",
        ].join(" ")}
      />

      <h3
        className={[
          "text-sm font-semibold transition",
          selected ? "text-emerald-700" : "text-slate-800 group-hover:text-indigo-600",
        ].join(" ")}
      >
        {title}
      </h3>

      {/* Acento lateral sutil al estar seleccionado */}
      {selected && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-emerald-500/90" />
      )}
    </Link>
  );
};

export default function AsesorDashboard({
  courses = DEFAULT_COURSES,
  user = DEFAULT_USER,
  stats = DEFAULT_STATS,
}) {
  // Lee selección persistida
  const [selected, setSelected] = useState(() => {
    try { return localStorage.getItem("cursoSeleccionado") || null; } catch { return null; }
  });

  // Si cambias la selección aquí, también se persiste
  const handleSelect = (title) => {
    setSelected(title);
    try { localStorage.setItem("cursoSeleccionado", title); } catch {}
  };

  // (Opcional) si esperas que otra parte de la app cambie el localStorage,
  // puedes escuchar el evento 'storage' para actualizar en vivo:
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "cursoSeleccionado") setSelected(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <div className="flex justify-center mx-auto w-full px-4 py-6 lg:px-8">
      <div className="flex gap-8">
        <section>
          <h2 className="mb-4 text-2xl font-bold text-pink-600">Cursos activos</h2>

          {/* Grid 1/2/3/6 columnas */}
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
            {courses.map((c) => (
              <CourseChip
                key={c.id}
                title={c.title}
                image={c.image}
                selected={selected === c.title}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/* -------------------- Datos de ejemplo -------------------- */
const DEFAULT_COURSES = [
  { id: 1, title: "English Elemental", image: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=200&q=80&auto=format&fit=crop" },
  { id: 2, title: "Matemáticas Básicas", image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=200&q=80&auto=format&fit=crop" },
  { id: 3, title: "Computación I", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&q=80&auto=format&fit=crop" },
  { id: 4, title: "Orientación Educativa", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&q=80&auto=format&fit=crop" },
  { id: 5, title: "EAU", image: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=200&q=80&auto=format&fit=crop" },
  { id: 6, title: "Asesgral", image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=200&q=80&auto=format&fit=crop" },
  { id: 7, title: "Inglés Conversacional", image: "https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?w=200&q=80&auto=format&fit=crop" },
  { id: 8, title: "Cómputo Avanzado", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=200&q=80&auto=format&fit=crop" },
];

const DEFAULT_USER = {
  name: "Lic. César Emilio Lagunes Batalla",
  role: "English Teacher",
  since: "2023",
  avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80&auto=format&fit=crop",
};

const DEFAULT_STATS = [
  { label: "CURSOS", value: 3 },
  { label: "ESTUDIANTES", value: 56 },
  { label: "CERTIFICADOS", value: 2 },
  { label: "GENERACIONES", value: 2 },
];
