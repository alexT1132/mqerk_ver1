import { FaTrophy } from "react-icons/fa";
import { ImUsers } from "react-icons/im";
import { FaUsers } from "react-icons/fa6";

export default function MetricStrip({
  title = "12 años de trayectoria académica",
  items = [
    { icon: "users2", value: "+ 20", label: "asesores" },
    { icon: "users3", value: "+ 1100", label: "estudiantes" },
    { icon: "trophy", value: "3", label: "premios" },
  ],
}) {
  return (
    <section className="py-8">
      <div className="mx-auto max-w-7xl px-4">
        <h3 className="text-center text-lg md:text-3xl font-extrabold text-[#0a2a59] leading-tight">
          {title}
        </h3>

        <div className="mt-8 rounded-3xl bg-[#3c26cc] p-4 md:p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/25">
            {items.map((item, idx) => (
              <KPI key={idx} {...item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function KPI({ icon = "users2", value = "—", label = "" }) {
  return (
    <div className="flex items-center justify-start md:justify-center gap-5 py-6 md:py-4 text-white">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-[#183074]/60 shadow-inner">
        {icon === "users3" ? <FaUsers className="text-4xl" /> : icon === "trophy" ? <FaTrophy className="text-4xl" /> : <ImUsers className="text-4xl" />}
      </div>
      <div className="text-left">
        <div className="text-2xl md:text-3xl font-extrabold text-yellow-300 leading-none">
          {value} <span className="sr-only"> </span>
        </div>
        <div className="mt-1 text-base md:text-lg font-semibold tracking-wide">
          {label}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Demo ----------------------------- */
export const DEMO_ITEMS = [
  { icon: "users2", value: "+ 20", label: "asesores" },
  { icon: "users3", value: "+ 1100", label: "estudiantes" },
  { icon: "trophy", value: "3", label: "premios" },
];
