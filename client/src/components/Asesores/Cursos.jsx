// AsesorDashboard.jsx
import { Link } from "react-router-dom";

const CourseChip = ({ title, image }) => {
  return (
    <Link
      to={`/asesor_dashboard`}
      state={{  curso: title }}
      className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <img
        src={image}
        alt={title}
        className="h-12 w-12 rounded-lg object-cover"
      />
      <h3 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition">
        {title}
      </h3>
    </Link>
  );
};

/* ------------------------------------------------------------------ */
/* Página                                                              */
/* ------------------------------------------------------------------ */

export default function AsesorDashboard({
  courses = DEFAULT_COURSES,
  user = DEFAULT_USER,
  stats = DEFAULT_STATS,
}) {
  return (
    <div className="flex justify-center mx-auto w-full px-4 py-6 lg:px-8">
      {/* 2 columnas: izquierda (2fr) / derecha (1fr) */}
      <div className="flex gap-8">
          {/* Cursos */}
          <section>
            <h2 className="mb-4 text-2xl font-bold text-pink-600">
              Cursos activos
            </h2>

            {/* Grid de cursos: 1, 2, 3 y 4 columnas */}
            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
              {courses.map((c, i) => (
                <CourseChip key={c.id ?? i} title={c.title} image={c.image}/>
              ))}
            </div>
          </section>
      </div>
    </div>
  );
}


const DEFAULT_COURSES = [
  {
    id: 1,
    title: "English Elemental",
    image:
      "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=200&q=80&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Matemáticas Básicas",
    image:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=200&q=80&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Computación I",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&q=80&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "Orientación Educativa",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&q=80&auto=format&fit=crop",
  },
  {
    id: 5,
    title: "EAU",
    image:
      "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=200&q=80&auto=format&fit=crop",
  },
  {
    id: 6,
    title: "Asesgral",
    image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=200&q=80&auto=format&fit=crop",
  },
  {
    id: 7,
    title: "Inglés Conversacional",
    image:
      "https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?w=200&q=80&auto=format&fit=crop",
  },
  {
    id: 8,
    title: "Cómputo Avanzado",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=200&q=80&auto=format&fit=crop",
  },
];

const DEFAULT_USER = {
  name: "Lic. César Emilio Lagunes Batalla",
  role: "English Teacher",
  since: "2023",
  avatar:
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80&auto=format&fit=crop",
};

const DEFAULT_STATS = [
  { label: "CURSOS", value: 3 },
  { label: "ESTUDIANTES", value: 56 },
  { label: "CERTIFICADOS", value: 2 },
  { label: "GENERACIONES", value: 2 },
];