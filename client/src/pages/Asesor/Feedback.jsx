import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../../components/Asesor/Topbar";
import SidebarIconOnly from "../../components/Asesor/Sidebar";
import MobileSidebar from "../../components/Asesor/MobileSidebar";
import { getMisEstudiantes } from "../../api/asesores.js";
import { Eye, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Layout({ embedded = false }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [hiddenCount, setHiddenCount] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [gruposAPI, setGruposAPI] = useState([]);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const navigate = useNavigate();
  const { logout } = useAuth();
  const handleLogout = async () => { await logout(); navigate('/login', { replace: true }); };

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
        const params = selectedGroup === 'TODOS' ? undefined : { grupo: selectedGroup };
        const { data } = await getMisEstudiantes(params);
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

  // Página de lista: ahora el detalle vive en la ruta /asesor/feedback/:studentId del bundle.

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
    const arr = (gruposAPI || []).map((g) => String(g).toUpperCase());
    // Añadir opción 'Todos' si hay 2+ grupos
    if (arr.length >= 1) return ['TODOS', ...arr];
    return arr;
  }, [gruposAPI]);

  // Auto-select default group: 'TODOS' when haya grupos disponibles
  useEffect(() => {
    if (!selectedGroup && gruposDisponibles.length >= 1) {
      setSelectedGroup('TODOS');
    }
  }, [gruposDisponibles, selectedGroup]);

  // Filter students by selected group (no 'all' option)
  const baseFiltrados = useMemo(() => {
    if (!selectedGroup) return [];
    if (selectedGroup === 'TODOS') return estudiantes;
    const sel = selectedGroup.toUpperCase();
    return estudiantes.filter((e) => {
      const g = (e.grupo ?? e.turno ?? '').toString().trim().toUpperCase();
      return g === sel;
    });
  }, [estudiantes, selectedGroup]);

  const getFecha = (e) => {
    const raw = e.fechaRegistro || e.fecha_registro || e.created_at;
    if (!raw) return null;
    const d = new Date(raw);
    return isNaN(d) ? null : d;
  };

  const estudiantesFiltrados = useMemo(() => {
    let list = baseFiltrados;
    // filtro por texto (folio, nombre)
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((e) => {
        const folio = String(e.folio_formateado || e.folio || '').toLowerCase();
        const nombre = [e.nombres || e.nombre || '', e.apellidos || e.apellido || ''].join(' ').toLowerCase();
        return folio.includes(q) || nombre.includes(q);
      });
    }
    // filtro por fecha
    let from = null, to = null;
    if (dateFrom) { const d = new Date(dateFrom); if (!isNaN(d)) from = d; }
    if (dateTo) { const d = new Date(dateTo); if (!isNaN(d)) { d.setHours(23,59,59,999); to = d; } }
    if (from || to) {
      list = list.filter((e) => {
        const d = getFecha(e);
        if (!d) return false;
        if (from && d < from) return false;
        if (to && d > to) return false;
        return true;
      });
    }
    return list;
  }, [baseFiltrados, search, dateFrom, dateTo]);

  const clearFilters = () => { setSearch(''); setDateFrom(''); setDateTo(''); };

  const content = (
    <>
      <div className="mx-auto">
        <h1 className="text-lg sm:text-xl font-bold text-gray-800">Feedback de alumnos</h1>
        <p className="text-sm text-gray-600">Selecciona un alumno asignado para revisar sus entregas y dejar notas.</p>
      </div>

      <section className="bg-white rounded-2xl shadow p-4 sm:p-5 border border-slate-100">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="font-semibold text-slate-800 flex items-center gap-3">
            <span>Mis estudiantes</span>
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200" title="Activos tras filtro de grupo">
              Activos {baseFiltrados.length}
            </span>
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200" title="Coincidencias con filtros de texto/fecha">
              Coinciden {estudiantesFiltrados.length}
            </span>
            {hiddenCount > 0 && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200" title="Ocultos por estar inactivos/suspendidos/eliminados">
                Ocultos {hiddenCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={search}
              onChange={(e)=> setSearch(e.target.value)}
              placeholder="Buscar por folio o nombre"
              className="w-full sm:w-64 px-3 py-1.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="date"
              value={dateFrom}
              onChange={(e)=> setDateFrom(e.target.value)}
              className="px-2 py-1.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              title="Desde"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e)=> setDateTo(e.target.value)}
              className="px-2 py-1.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              title="Hasta"
            />
            <button
              onClick={clearFilters}
              className="px-2.5 py-1.5 rounded-lg border text-sm border-slate-300 hover:bg-slate-50"
              title="Limpiar filtros"
            >
              Limpiar
            </button>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-sm text-purple-600 ml-auto">
              <Loader2 className="size-4 animate-spin" /> Cargando…
            </div>
          )}
        </div>

        {/* Filtro por grupo */}
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
              <colgroup>
                {colWidths.map((w, i) => (
                  <col key={i} style={{ width: w }} />
                ))}
              </colgroup>
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
                            <span className="font-medium truncate inline-block max-w-[260px]" title={c.render(e)}>
                              {c.render(e)}
                            </span>
                          ) : (
                            c.render(e)
                          )}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/asesor/feedback/${e.id}`)}
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
    </>
  );

  if (embedded) return content;

  return (
    <div className="min-h-screen bg-slate-50">
      <Topbar onOpenMobileMenu={() => setMobileOpen(true)} />

      <MobileSidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        active="feedback"
        onLogout={handleLogout}
      />

      <div className="mx-auto">
        <div className="flex">
          <SidebarIconOnly active="feedback" onLogout={handleLogout} />

          <main className="flex-1 p-3 sm:p-6 space-y-6">
            {content}
          </main>
        </div>
      </div>
    </div>
  );
}