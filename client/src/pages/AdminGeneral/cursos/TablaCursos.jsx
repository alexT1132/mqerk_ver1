// CursosTable.jsx
export default function CursosTable({
  data = [],
  onEdit = () => {},
  onDelete = () => {},
  onView = () => {},
}) {
  return (
    <div className="space-y-4">
      {/* Desktop / md+: tabla */}
      <div className="hidden md:block">
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:font-semibold text-gray-700">
                <th className="w-16">#</th>
                <th>Nombre del curso</th>
                <th className="w-36">Modalidad</th>
                <th className="w-32">Turno</th>
                <th className="w-40">Horario</th>
                <th className="w-40">Grupos</th>
                <th className="w-40 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{c.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{c.nombre}</div>
                    {c.subtitulo ? (
                      <div className="text-xs text-gray-500">{c.subtitulo}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">{c.modalidad}</td>
                  <td className="px-4 py-3">{c.turno}</td>
                  <td className="px-4 py-3">{c.horario}</td>
                  <td className="px-4 py-3">{c.grupos}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onView(c)}
                        className="px-2 py-1 rounded-md border text-gray-700 hover:bg-gray-100"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => onEdit(c)}
                        className="px-2 py-1 rounded-md border text-blue-700 hover:bg-blue-50"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onDelete(c)}
                        className="px-2 py-1 rounded-md border text-red-700 hover:bg-red-50"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No hay cursos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile: tarjetas */}
      <div className="md:hidden ">
        {data.map((c) => (
          <div
            key={c.id}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Curso #{c.id}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => onView(c)}
                  className="px-2 py-1 rounded-md border text-gray-700"
                >
                  Ver
                </button>
                <button
                  onClick={() => onEdit(c)}
                  className="px-2 py-1 rounded-md border text-blue-700"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(c)}
                  className="px-2 py-1 rounded-md border text-red-700"
                >
                  Eliminar
                </button>
              </div>
            </div>

            <div className="mt-2">
              <div className="text-base font-semibold text-gray-900">{c.nombre}</div>
              {c.subtitulo ? (
                <div className="text-sm text-gray-600">{c.subtitulo}</div>
              ) : null}
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <dt className="text-gray-500">Modalidad</dt>
                <dd className="text-gray-900">{c.modalidad}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Turno</dt>
                <dd className="text-gray-900">{c.turno}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-gray-500">Horario</dt>
                <dd className="text-gray-900">{c.horario}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-gray-500">Grupos</dt>
                <dd className="text-gray-900">{c.grupos}</dd>
              </div>
            </dl>
          </div>
        ))}
        {data.length === 0 && (
          <div className="rounded-xl border border-dashed p-6 text-center text-gray-500">
            No hay cursos.
          </div>
        )}
      </div>
    </div>
  );
}
