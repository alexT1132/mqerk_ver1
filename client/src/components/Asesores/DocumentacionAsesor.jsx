// DocumentCenter.jsx
import React from "react";
import {
  FileUp,
  FileText,
  IdCard,
  Image,
  GraduationCap,
  Medal,
  ClipboardCheck,
  ShieldCheck,
  BookOpen,
  ScrollText,
  Handshake,
  BadgeCheck,
} from "lucide-react";

/* ---------- UI helpers ---------- */

const TitleBar = ({ icon: Icon, text }) => (
  <div className="relative mx-auto w-max">
    <div className="flex items-center gap-3 rounded-2xl bg-white/80 px-5 py-2.5 shadow-lg ring-1 ring-slate-200">
      <div className="grid h-7 w-7 place-items-center rounded-xl bg-violet-600 text-white shadow">
        <Icon className="h-4 w-4" />
      </div>
      <h2 className="text-lg sm:text-xl font-black tracking-wide text-slate-900">
        {text.toUpperCase()}
      </h2>
    </div>
    <div className="absolute inset-x-0 -bottom-2 mx-auto h-2 w-24 rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-sky-500 opacity-70" />
  </div>
);

const Pill = ({ icon: Icon, label, hint, status = "pending", onClick }) => {
  const isDone = status === "done";
  return (
    <button
      onClick={onClick}
      className={[
        "group relative flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3",
        "text-left shadow-sm ring-1 transition",
        isDone
          ? "bg-white ring-emerald-200 hover:ring-emerald-300"
          : "bg-white ring-violet-200 hover:ring-violet-300",
      ].join(" ")}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span
          className={[
            "grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white shadow",
            isDone ? "bg-emerald-500" : "bg-violet-600",
          ].join(" ")}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-slate-800">
            {label}
          </span>
          {hint && (
            <span className="block truncate text-xs text-slate-500">
              {hint}
            </span>
          )}
        </span>
      </span>

      <span
        className={[
          "ml-3 grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold",
          isDone
            ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
            : "bg-violet-100 text-violet-700 ring-1 ring-violet-200",
        ].join(" ")}
        title={isDone ? "Completado" : "Pendiente"}
      >
        {isDone ? "✓" : "!"}
      </span>
    </button>
  );
};

const Card = ({ title, items }) => (
  <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 sm:p-5 shadow-sm">
    <div className="mb-3">
      <div className="inline-flex rounded-xl bg-violet-50 px-3 py-1 ring-1 ring-violet-200">
        <span className="text-[13px] font-black tracking-wide text-violet-700">
          {title.toUpperCase()}
        </span>
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {items.map((it) => (
        <Pill key={it.label} {...it} />
      ))}
    </div>
  </div>
);

/* ---------- Data de ejemplo (puedes traerla de tu API) ---------- */

const DOCS = [
  { icon: IdCard, label: "INE ambos lados", status: "pending" },
  { icon: FileText, label: "Comprobante de domicilio", status: "pending" },
  { icon: BadgeCheck, label: "CIF SAT", status: "done" },
  { icon: GraduationCap, label: "Título académico", status: "pending" },
  { icon: Medal, label: "Cédula Profesional", status: "pending" },
  { icon: ClipboardCheck, label: "Certificaciones", status: "done" },
  { icon: FileUp, label: "CV actualizado", status: "pending" },
  { icon: Image, label: "Fotografía profesional", status: "pending" },
  { icon: FileText, label: "Carta de recomendación", status: "pending" },
];

const RULES = [
  { icon: ShieldCheck, label: "Reglamento interno", status: "done" },
  { icon: ScrollText, label: "Políticas de privacidad", status: "done" },
  { icon: BookOpen, label: "Normativa", status: "pending" },
  { icon: ScrollText, label: "Términos y condiciones", status: "done" },
  { icon: GraduationCap, label: "Modelo educativo", status: "pending" },
];

const CONTRACT = [
  {
    icon: Handshake,
    label: "Contrato de prestación de servicios",
    status: "pending",
  },
];

/* ---------- Página principal ---------- */

export default function DocumentCenter() {
  // Handlers de ejemplo (conéctalos a tu lógica de subida / vista)
  const handleClick = (label) =>
    alert(`Acción para: ${label} (abrir visor, subir archivo, etc.)`);

  const withHandlers = (arr) =>
    arr.map((x) => ({ ...x, onClick: () => handleClick(x.label) }));

  return (
    <div className="w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Encabezado general */}
      <TitleBar icon={FileUp} text="Documentación" />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sección Documentación */}
        <Card title="Documentos" items={withHandlers(DOCS)} />

        {/* Sección Contrato Laboral (a la derecha en desktop) */}
        <Card title="Contrato laboral" items={withHandlers(CONTRACT)} />
      </div>

      {/* Sección Lineamientos (full width) */}
      <div className="mt-6">
        <Card title="Lineamientos" items={withHandlers(RULES)} />
      </div>
    </div>
  );
}
