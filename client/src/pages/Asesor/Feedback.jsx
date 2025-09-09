import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Topbar from "../../components/Asesor/Topbar";
import SidebarIconOnly from "../../components/Asesor/Sidebar";
import MobileSidebar from "../../components/Asesor/MobileSidebar";
import { getMisEstudiantes } from "../../api/asesores.js";
import { Eye, Loader2 } from "lucide-react";

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [hiddenCount, setHiddenCount] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [gruposAPI, setGruposAPI] = useState([]);
  const navigate = useNavigate();
  const { studentId } = useParams();

  // Carga inicial solo para conocer los grupos del asesor; no trae estudiantes aún.
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await getMisEstudiantes();
        if (!alive) return;
        const grupos = data?.grupos_asesor || [];
        setGruposAPI(Array.isArray(grupos) ? grupos : []);
        // Si API ya envió estudiantes, normalizarlos (p. ej., cuando no se pasa grupo y backend decide devolver primero)
        const raw = data?.data ?? [];
        if (Array.isArray(raw) && raw.length) {
          const filtered = raw; // backend ya devuelve solo aprobados/visibles
          setEstudiantes(filtered);
          setHiddenCount(0);
        }
      } catch (e) {
        if (alive) setError(e?.response?.data?.message || "Error cargando grupos del asesor");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Cuando el usuario elige un grupo, pedimos alumnos de ese grupo.
  useEffect(() => {
    if (!selectedGroup) return;
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await getMisEstudiantes({ grupo: selectedGroup });
        if (!alive) return;
        const list = Array.isArray(data?.data) ? data.data : [];
        setEstudiantes(list);
        setHiddenCount(0);
      } catch (e) {
        if (alive) setError(e?.response?.data?.message || "Error cargando estudiantes del grupo");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [selectedGroup]);

  // Página de lista: delega el detalle a la ruta /asesor_feedback/:studentId

  // Close helpers for slide-over
  // Si viene con :studentId en la URL, redirigimos a la página de detalle.
  useEffect(() => {
    if (studentId) navigate(`/asesor_feedback/${studentId}`, { replace: true });
  }, [studentId]);

  const columns = useMemo(
    () => [
      { key: "folio", label: "Folio", render: (e) => e.folio_formateado || e.folio || "—" },
      { key: "nombreCompleto", label: "Nombre", render: (e) => {
        const parts = [e.nombres || e.nombre, e.apellidos || e.apellido].filter(Boolean);
        return parts.length ? parts.join(' ') : '—';
      } },
      { key: "grupo", label: "Grupo", render: (e) => e.grupo || "—" },
      { key: "curso", label: "Curso", render: (e) => e.curso || e.carrera || "—" },
      { key: "plan", label: "Plan", render: (e) => e.plan || e.plan_estudio || "—" },
      { key: "anio", label: "Año", render: (e) => e.anio || e.año || e.year || "—" },
      {
        key: "registro",
        label: "Registro",
        render: (e) => {
          const raw = e.fechaRegistro || e.fecha_registro || e.created_at;
          if (!raw) return "—";
          const d = new Date(raw);
          return isNaN(d) ? String(raw) : d.toLocaleDateString();
        },
      },
    ],
    []
  );

  // Col widths for the table; rendered via map to avoid whitespace nodes inside <colgroup>
  const colWidths = useMemo(
    () => ['12%', '28%', '10%', '18%', '12%', '8%', '12%', '10%'],
    []
  );

  // Grupos disponibles provienen del backend (perfil del asesor)
  const gruposDisponibles = useMemo(() => {
    return (gruposAPI || []).map((g) => String(g).toUpperCase());
  }, [gruposAPI]);

  // Auto-select when only one group exists
  useEffect(() => {
    if (!selectedGroup && gruposDisponibles.length === 1) {
      setSelectedGroup(gruposDisponibles[0]);
    }
  }, [gruposDisponibles, selectedGroup]);

  // Filter students by selected group (no 'all' option)
  const estudiantesFiltrados = useMemo(() => {
    if (!selectedGroup) return [];
    const sel = selectedGroup.toUpperCase();
    return estudiantes.filter((e) => {
      const g = (e.grupo ?? e.turno ?? '').toString().trim().toUpperCase();
      return g === sel;
    });
  }, [estudiantes, selectedGroup]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Topbar onOpenMobileMenu={() => setMobileOpen(true)} />

      <MobileSidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        active="inicio"
        onLogout={() => console.log("logout")}
      />

      <div className="mx-auto">
        <div className="flex">
          <SidebarIconOnly active="inicio" onLogout={() => console.log("logout")} />

          <main className="flex-1 p-3 sm:p-6 space-y-6">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-800">Feedback de alumnos</h1>
              <p className="text-sm text-gray-600">Selecciona un alumno asignado para revisar sus entregas y dejar notas.</p>
            </div>

            <section className="bg-white rounded-2xl shadow p-4 sm:p-5 border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-slate-800 flex items-center gap-3">
                  <span>Mis estudiantes</span>
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200" title="Solo activos del grupo seleccionado">
                    Activos {estudiantesFiltrados.length}
                  </span>
                  {hiddenCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200" title="Ocultos por estar inactivos/suspendidos/eliminados">
                      Ocultos {hiddenCount}
                    </span>
                  )}
                </div>
                {loading && (
                  <div className="flex items-center gap-2 text-sm text-purple-600">
                    <Loader2 className="size-4 animate-spin" /> Cargando…
                  </div>
                )}
              </div>
              {/* Filtro por grupo (obligatorio) */}
              <div className="mb-3">
                {gruposDisponibles.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-600 mr-1">Grupo:</span>
                    {gruposDisponibles.map((g) => (
                      <button
                        key={g}
                        onClick={() => setSelectedGroup(g)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                          selectedGroup === g
                            ? 'bg-purple-700 text-white border-purple-700 shadow'
                            : 'bg-white text-purple-700 border-purple-300 hover:bg-purple-50'
                        }`}
                        aria-pressed={selectedGroup === g}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500">No hay grupos disponibles.</div>
                )}
              </div>
              {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
              {!selectedGroup ? (
                <div className="p-6 text-sm text-slate-600 bg-slate-50 rounded-xl border border-slate-200">
                  Selecciona un grupo para ver a tus estudiantes asignados.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-lg bg-white">
                  <table className="min-w-[980px] table-fixed text-sm">
                  <colgroup>{colWidths.map((w, i) => (
                    <col key={i} style={{ width: w }} />
                  ))}</colgroup>
                  <thead className="bg-purple-700 sticky top-0 z-10">
                    <tr className="text-left text-white uppercase tracking-wide">
                      {columns.map((c) => (
                        <th key={c.key} className="px-4 py-3 whitespace-nowrap text-xs font-bold">
                          {c.label}
                        </th>
                      ))}
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-100 bg-white">
                    {estudiantesFiltrados.length === 0 && !loading ? (
                      <tr>
                        <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-slate-500">
                          No hay estudiantes asignados.
                        </td>
                      </tr>
                    ) : (
                      estudiantesFiltrados.map((e) => (
                        <tr key={e.id} className="hover:bg-slate-50">
                          {columns.map((c) => (
                            <td key={c.key} className="px-4 py-3 whitespace-nowrap text-slate-800">
                              {c.key === 'nombreCompleto' ? (
                                <span className="font-medium truncate inline-block max-w-[260px]" title={c.render(e)}>{c.render(e)}</span>
                              ) : (
                                c.render(e)
                              )}
                            </td>
                          ))}
              <td className="px-4 py-3 text-right whitespace-nowrap">
                            <button
                              onClick={() => navigate(`/asesor_feedback/${e.id}`)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-purple-700 hover:bg-purple-800 text-white shadow-md"
                              title="Revisar actividades"
                            >
                              <Eye className="size-4" /> Revisar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Página sólo lista: el detalle ahora está en /asesor_feedback/:studentId */}
          </main>
        </div>
      </div>
    </div>
  );
}