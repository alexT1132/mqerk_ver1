// GroupCards.jsx
import { Link } from "react-router-dom";

/** Paleta por prefijo (m=mañana, v=vespertino, s=sabatino) */
const COLORS = {
  m: { from: "from-blue-500", to: "to-indigo-500", ring: "ring-blue-200/70" },
  v: { from: "from-violet-500", to: "to-fuchsia-500", ring: "ring-violet-200/70" },
  s: { from: "from-emerald-500", to: "to-teal-500", ring: "ring-emerald-200/70" },
};

const UserIcon = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="8" r="3.2" />
    <path d="M4 19c1.8-3.2 5-5 8-5s6.2 1.8 8 5" />
  </svg>
);

/**
 * props:
 *  - groups: [{ id: "m1", title?: "M1", subtitle?: "Mañana 1", count?: 12 }]
 *  - onSelect: (groupId) => void
 *  - selected: groupId | null (opcional, para resaltar activo)
 */
export default function GroupCards({
  groups = [
    { id: "m1", subtitle: "Mañana 1" },
    { id: "m2", subtitle: "Mañana 2" },
    { id: "v1", subtitle: "Vespertino 1" },
    { id: "v2", subtitle: "Vespertino 2" },
    { id: "v3", subtitle: "Vespertino 3" },
    { id: "s1", subtitle: "Sabatino 1" },
    { id: "s2", subtitle: "Sabatino 2" },
  ],
  onSelect = (id) => console.log("select:", id),
  selected = null,
}) {
  return (
    <div className="w-full">
      {/* título opcional */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Grupos</h2>
        <p className="text-sm text-slate-600">Selecciona un grupo para ver sus actividades.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {groups.map((g) => {
          const prefix = g.id[0]?.toLowerCase() || "m";
          const theme = COLORS[prefix] || COLORS.m;
          const isActive = selected && selected.toLowerCase() === g.id.toLowerCase();

          return (
            <button
              key={g.id}
              onClick={() => onSelect(g.id)}
              className={[
                "group relative w-full text-left rounded-2xl border bg-white p-4 sm:p-5 shadow-sm",
                "transition hover:shadow-md focus:outline-none",
                isActive ? "border-transparent ring-2 " + theme.ring : "border-slate-200",
              ].join(" ")}
            >
              {/* icono en gradiente */}
              <div className="flex items-start gap-3">
                <div
                  className={[
                    "grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white shadow",
                    "bg-gradient-to-br", theme.from, theme.to,
                    "ring-1 ring-white/30",
                  ].join(" ")}
                >
                  <UserIcon className="w-5 h-5" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-base font-semibold">
                      {(g.title || g.id).toUpperCase()}
                    </h3>
                    {typeof g.count === "number" && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {g.count}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-sm text-slate-600">
                    {g.subtitle || labelFromId(g.id)}
                  </p>
                </div>
              </div>

              {/* CTA */}
              <Link to='/asesor/alumnos' className="mt-4 flex items-center text-sm text-indigo-600">
                <span className="font-medium">Ver grupo</span>
                <svg
                  viewBox="0 0 24 24"
                  className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  fill="none" stroke="currentColor" strokeWidth="1.8"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>

              {/* borde suave al hover */}
              <div
                className={[
                  "pointer-events-none absolute inset-0 rounded-2xl",
                  "ring-0 ring-transparent group-hover:ring-1 group-hover:ring-slate-200",
                  "transition",
                ].join(" ")}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function labelFromId(id = "") {
  const p = id[0]?.toLowerCase();
  if (p === "m") return "Mañana";
  if (p === "v") return "Vespertino";
  if (p === "s") return "Sabatino";
  return "Grupo";
}