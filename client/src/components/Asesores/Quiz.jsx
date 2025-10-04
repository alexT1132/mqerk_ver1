import { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  CheckCircle2,
  CircleDashed,
  PlaySquare, 
  Sparkles
} from "lucide-react";
import QuiztModal from "./QuiztModal";


/* ------------------- helpers ------------------- */

function Badge({ children, type = "default" }) {
  const styles = {
    default: "bg-slate-100 text-slate-700 ring-slate-200",
    success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    draft: "bg-amber-50 text-amber-700 ring-amber-200",
  }[type];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${styles}`}
    >
      {type === "success" && <CheckCircle2 className="h-3.5 w-3.5" />}
      {type === "draft" && <CircleDashed className="h-3.5 w-3.5" />}
      {children}
    </span>
  );
}

/* Tarjeta compacta para móvil */
function MobileRow({ item, onView, onEdit, onDelete }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            {item.name}
          </h3>
          <p className="text-sm text-slate-500">{item.type}</p>
        </div>
        {item.status === "Publicado" ? (
          <Badge type="success">Publicado</Badge>
        ) : (
          <Badge type="draft">Borrador</Badge>
        )}
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-slate-50 p-3">
          <dt className="text-slate-500">Preguntas</dt>
          <dd className="font-semibold text-slate-900">{item.questions}</dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <dt className="text-slate-500">Intentos</dt>
          <dd className="font-semibold text-slate-900">{item.attempts}</dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <dt className="text-slate-500">Actualizado</dt>
          <dd className="font-semibold text-slate-900">{item.updatedAt}</dd>
        </div>
      </dl>

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={() => onView(item)}
          className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Eye className="mr-2 h-4 w-4" />
          Ver
        </button>
        <button
          onClick={() => onEdit(item)}
          className="inline-flex items-center rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
        >
          <Pencil className="mr-2 h-4 w-4" />
          Editar
        </button>
        <button
          onClick={() => onDelete(item)}
          className="ml-auto inline-flex items-center rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700 hover:bg-rose-100"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </button>
      </div>
    </article>
  );
}

/* ------------------- main component ------------------- */

export default function SimuladoresAdmin({ Icon = PlaySquare, title = "QUIZZES", }) {

  const STORAGE_KEY = "selectedAreaTitle";

  function getSafeStoredTitle() {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const val = String(raw).trim();
    if (!val || val.toLowerCase() === "null" || val.toLowerCase() === "undefined") return null;
    return val;
  }
  
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();

  // Datos de ejemplo (tráelos de tu API)
  const data = useMemo(
    () => [
      {
        id: 1,
        name: "EXANI II – Áreas Generales",
        type: "Áreas generales",
        questions: 120,
        attempts: 3,
        status: "Publicado",
        updatedAt: "2025-08-20",
      },
      {
        id: 2,
        name: "PAA – Módulos Matemáticos",
        type: "Áreas generales",
        questions: 80,
        attempts: 2,
        status: "Borrador",
        updatedAt: "2025-08-18",
      },
      {
        id: 3,
        name: "Diagnóstico – Ingreso Univ.",
        type: "Áreas generales",
        questions: 50,
        attempts: 1,
        status: "Publicado",
        updatedAt: "2025-08-15",
      },
    ],
    []
  );

  /* handlers */
  const handleView = (item) => navigate(`/simuladores/${item.id}`);
  const handleEdit = (item) => navigate(`/simuladores/${item.id}/editar`);
  const handleDelete = (item) => {
    // aquí confirm + llamada a API
    // eslint-disable-next-line no-alert
    if (confirm(`¿Eliminar simulador "${item.name}"?`)) {
      console.log("Eliminar:", item.id);
    }
  };

  const location = useLocation();
  
    // llega desde AreasDeEstudio con Link state={{ title }}
    const incomingTitle = typeof location.state?.title === "string"
      ? location.state.title.trim()
      : null;
  
    const [areaTitle, setAreaTitle] = useState(
      incomingTitle || getSafeStoredTitle() || "Español y redacción indirecta"
    );
  
    useEffect(() => {
      if (incomingTitle && incomingTitle.length > 0) {
        setAreaTitle(incomingTitle);
        sessionStorage.setItem(STORAGE_KEY, incomingTitle);
      }
    }, [incomingTitle]);

    const headerTitle = `${title} — ${areaTitle}`;

  return (
    <div className="mx-auto max-w-8xl px-4 pb-12 pt-4 sm:px-6 lg:px-8">
      {/* Encabezado breve */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-200/40 bg-gradient-to-r from-cyan-50/70 via-white to-indigo-50/70 p-5 sm:p-7 shadow-sm mb-6">
      {/* blobs suaves al fondo */}
      <div className="pointer-events-none absolute -left-10 -top-14 h-56 w-56 rounded-full bg-cyan-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 -bottom-14 h-56 w-56 rounded-full bg-indigo-200/40 blur-3xl" />

      <div className="relative z-10 flex items-center gap-4">
        {/* ícono con badge */}
        <div className="relative grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-sky-500 to-violet-600 text-white shadow-lg sm:size-14">
          <Icon className="size-6 sm:size-7" />
          <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-emerald-500 ring-2 ring-white">
            <Sparkles className="size-3 text-white" />
          </span>
        </div>

        <div className="flex flex-col">
          <h2 className="text-xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-sky-700 to-violet-700 sm:text-2xl">
            {headerTitle}
          </h2>

          {/* subrayado doble */}
          <div className="mt-1 flex gap-2">
            <span className="h-1 w-16 rounded-full bg-gradient-to-r from-sky-500 to-sky-300" />
            <span className="h-1 w-10 rounded-full bg-gradient-to-r from-violet-500 to-violet-300" />
          </div>
        </div>
      </div>
    </div>

      {/* Botón principal (abajo del header, arriba de la tabla) */}
      <div className="mb-4 flex justify-start sm:justify-end">
        <button
          onClick={() => setOpen(true)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-violet-700 hover:to-indigo-700 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Nuevo quizt
        </button>
      </div>

      {/* Móvil: tarjetas */}
      <div className="grid gap-3 md:hidden">
        {data.map((item) => (
          <MobileRow
            key={item.id}
            item={item}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Desktop: tabla */}
      <div className="hidden md:block">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50/60">
                <tr>
                  <th
                    scope="col"
                    className="sticky left-0 z-10 bg-slate-50/60 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
                  >
                    Quizt
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
                  >
                    Tipo
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
                  >
                    Preguntas
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
                  >
                    Intentos
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
                  >
                    Estado
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
                  >
                    Actualizado
                  </th>
                  <th scope="col" className="px-5 py-3"></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {data.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"}
                  >
                    <td className="sticky left-0 z-10 bg-inherit px-5 py-4">
                      <div className="max-w-xs truncate font-medium text-slate-900">
                        {item.name}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-700">{item.type}</td>
                    <td className="px-5 py-4 text-slate-700">
                      {item.questions}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {item.attempts}
                    </td>
                    <td className="px-5 py-4">
                      {item.status === "Publicado" ? (
                        <Badge type="success">Publicado</Badge>
                      ) : (
                        <Badge type="draft">Borrador</Badge>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {item.updatedAt}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(item)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {data.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-14 text-center text-slate-500"
                    >
                      Aún no hay quizt. Crea el primero con el botón
                      <span className="mx-1 rounded bg-slate-100 px-1.5 py-0.5 font-semibold">
                        Nuevo quizt
                      </span>
                      .
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <QuiztModal
            open={open}
            onClose={() => setOpen(false)}
            state={{ title: areaTitle }}
            onCreate={(data) => {
              console.log("Quizt creado:", data);
            }}
      />
    </div>
  );
}
