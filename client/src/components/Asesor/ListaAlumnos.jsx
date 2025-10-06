import React from "react";

/**
 * props:
 *  - students: [{ id, name, avatar, group? }]   // group: m1, v2, etc.
 *  - onClick?: (student) => void
 *  - className?: string
 */
export default function StudentChips({
  students = DEMO_STUDENTS,
  onClick = () => {},
  className = "",
}) {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex flex-wrap gap-3 sm:gap-4">
        {students.map((s) => (
          <button
            key={s.id}
            onClick={() => onClick(s)}
            className="
              group inline-flex items-center gap-3 sm:gap-4
              rounded-2xl border border-slate-200 bg-white/90
              px-3.5 py-3 sm:px-4 sm:py-3.5
              shadow-sm hover:shadow-md hover:bg-white
              transition focus:outline-none focus:ring-2 focus:ring-indigo-500/50
            "
            title={s.name}
          >
            <Avatar src={s.avatar} name={s.name} />

            <div className="min-w-0 text-left">
              <p className="truncate text-[15px] sm:text-base font-semibold text-slate-800">
                {s.name}
              </p>
              {s.edad && (
                <span className="mt-0.5 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                  {String(s.edad).toUpperCase()} Años
                </span>
              )}
            </div>

          </button>
        ))}
      </div>
    </div>
  );
}

/* Avatar redondo con fallback de iniciales */
function Avatar({ src, name }) {
  const initials = (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");

  return src ? (
    <img
      src={src}
      alt={name}
      className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl object-cover ring-1 ring-slate-200"
      loading="lazy"
    />
  ) : (
    <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl grid place-items-center
                    bg-gradient-to-br from-indigo-500 to-violet-500 text-white
                    text-sm font-semibold ring-1 ring-white/30">
      {initials || "?"}
    </div>
  );
}

/* Demo */
const DEMO_STUDENTS = [
  { id: "1", name: "Ana Castillo",   avatar: "https://i.pravatar.cc/80?img=5",  edad: "15" },
  { id: "2", name: "Luis Hernández", avatar: "",                                 edad: "16" },
  { id: "3", name: "María López",    avatar: "https://i.pravatar.cc/80?img=15", edad: "17" },
  { id: "4", name: "Carlos Díaz",    avatar: "https://i.pravatar.cc/80?img=20", edad: "15" },
  { id: "5", name: "Sofía Pérez",    avatar: "",                                 edad: "15" },
];
