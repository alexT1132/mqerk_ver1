import { useEffect, useMemo, useState } from 'react';
import Navbar from '../../components/NavBar';
import { SideBar } from '../../components/SideBar.jsx';
import { Search, Eye, Pencil, Download, CheckCircle, XCircle } from 'lucide-react';
import { buildStaticUrl } from '../../utils/url.js';
import {
  listTasks,
  createTask,
  updateTask,
  listSubmissionsByTask,
  updateSubmissionGrade,
  cancelSubmissionApi,
} from '../../api/feedback.js';

// Vista básica para que el asesor gestione Feedback: tareas y entregas.
export default function FeedbackAsesor() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [subLoading, setSubLoading] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [modalSubmission, setModalSubmission] = useState(null);
  const [modalGrade, setModalGrade] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState({ nombre: '', puntos: 10, due_date: '', archivo: null, activo: true });
  const [q, setQ] = useState('');

  const sortedTasks = useMemo(() => {
    const arr = Array.isArray(tasks) ? tasks : [];
    return [...arr].sort((a,b)=> (new Date(a.due_date||0)) - (new Date(b.due_date||0)));
  }, [tasks]);

  const loadTasks = async () => {
    setLoading(true); setError('');
    try {
      const res = await listTasks();
      const incoming = Array.isArray(res?.data?.data)
        ? res.data.data
        : (Array.isArray(res?.data?.tasks)
          ? res.data.tasks
          : (Array.isArray(res?.data) ? res.data : []));
      setTasks(incoming);
    } catch (e) {
      setError(e?.response?.data?.message || 'No se pudieron cargar las tareas');
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async (taskId) => {
    setSubLoading(true); setError('');
    try {
      const res = await listSubmissionsByTask(taskId);
      const incoming = Array.isArray(res?.data?.data)
        ? res.data.data
        : (Array.isArray(res?.data?.submissions)
          ? res.data.submissions
          : (Array.isArray(res?.data) ? res.data : []));
      const mapped = incoming.map(s => {
        const rel = s.file_url || s.archivo || null;
        const abs = rel ? buildStaticUrl(rel) : null;
        return { ...s, file_url: abs };
      });
      setSubmissions(mapped);
    } catch (e) {
      setError(e?.response?.data?.message || 'No se pudieron cargar las entregas');
    } finally {
      setSubLoading(false);
    }
  };

  useEffect(() => { loadTasks(); }, []);
  useEffect(() => { if (selectedTask?.id) loadSubmissions(selectedTask.id); }, [selectedTask?.id]);

  const openCreate = () => {
    setEditingTask(null);
    setForm({ nombre: '', puntos: 10, due_date: '', archivo: null, activo: true });
    setShowForm(true);
  };
  const openEdit = (task) => {
    setEditingTask(task);
    setForm({
      nombre: task.nombre || '',
      puntos: task.puntos ?? 10,
      due_date: task.due_date ? new Date(task.due_date).toISOString().slice(0,10) : '',
      archivo: null,
      activo: task.activo ?? true,
    });
    setShowForm(true);
  };
  const submitForm = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('nombre', form.nombre);
      fd.append('puntos', String(form.puntos ?? 0));
      if (form.due_date) fd.append('due_date', form.due_date);
      if (typeof form.activo !== 'undefined') fd.append('activo', form.activo ? '1':'0');
      if (form.archivo) fd.append('archivo', form.archivo);
      if (editingTask?.id) {
        await updateTask(editingTask.id, fd);
      } else {
        await createTask(fd);
      }
      setShowForm(false);
      setEditingTask(null);
      await loadTasks();
    } catch (e) {
      setError(e?.response?.data?.message || 'No se pudo guardar la tarea');
    }
  };

  const onChangeGrade = async (submissionId, puntos) => {
    try {
      await updateSubmissionGrade(submissionId, Number(puntos));
      if (selectedTask?.id) await loadSubmissions(selectedTask.id);
    } catch (e) {
      setError(e?.response?.data?.message || 'No se pudo actualizar la calificación');
    }
  };

  const onCancelSubmission = async (submissionId) => {
    if (!confirm('¿Cancelar esta entrega?')) return;
    try {
      await cancelSubmissionApi(submissionId);
      if (selectedTask?.id) await loadSubmissions(selectedTask.id);
    } catch (e) {
      setError(e?.response?.data?.message || 'No se pudo cancelar la entrega');
    }
  };

  const openSubmissionModal = (s) => {
    setModalSubmission(s);
    setModalGrade(s?.puntos ?? 0);
    setShowSubmissionModal(true);
  };
  const closeSubmissionModal = () => {
    setShowSubmissionModal(false);
    setModalSubmission(null);
  };
  const saveSubmissionModal = async () => {
    if (!modalSubmission?.id) return;
    try {
      await updateSubmissionGrade(modalSubmission.id, Number(modalGrade));
      if (selectedTask?.id) await loadSubmissions(selectedTask.id);
      closeSubmissionModal();
    } catch (e) {
      setError(e?.response?.data?.message || 'No se pudo guardar la calificación');
    }
  };

  const filtered = useMemo(()=>{
    const arr = Array.isArray(sortedTasks) ? sortedTasks : [];
    const term = (q||'').trim().toLowerCase();
    if(!term) return arr;
    return arr.filter(t=> (t?.nombre||'').toLowerCase().includes(term));
  }, [sortedTasks, q]);

  const formatDate = (d) => {
    if(!d) return '—';
    const dt = new Date(d);
    if(Number.isNaN(dt.getTime())) return '—';
    return dt.toLocaleDateString('es-MX');
  };

  return (
    <>
      <Navbar />
      <SideBar asesor />
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 flex flex-col gap-6">
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <h2 className="text-2xl font-extrabold bg-linear-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent tracking-tight">Feedback</h2>
          <div className="flex-1" />
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-purple-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e)=> setQ(e.target.value)}
              placeholder="Buscar tarea…"
              className="w-full pl-9 pr-3 py-2 rounded-lg border-2 border-purple-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none text-sm"
            />
          </div>
          <button onClick={openCreate} className="px-4 py-2 rounded-lg text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700 shadow">
            Nueva tarea
          </button>
        </div>

        {error && <div className="p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>}
        {loading ? (
          <div className="text-sm text-gray-600">Cargando tareas…</div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block bg-white border-2 border-purple-200 rounded-xl shadow overflow-hidden">
              <table className="min-w-full table-fixed text-sm">
                <colgroup>
                  <col className="w-[45%]" />
                  <col className="w-[10%]" />
                  <col className="w-[20%]" />
                  <col className="w-[10%]" />
                  <col className="w-[15%]" />
                </colgroup>
                <thead>
                  <tr className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                    <th className="text-left px-4 py-3 font-semibold uppercase text-xs tracking-wide">Tarea</th>
                    <th className="text-left px-4 py-3 font-semibold uppercase text-xs tracking-wide">Puntos</th>
                    <th className="text-left px-4 py-3 font-semibold uppercase text-xs tracking-wide">Entrega</th>
                    <th className="text-left px-4 py-3 font-semibold uppercase text-xs tracking-wide">Activo</th>
                    <th className="text-left px-4 py-3 font-semibold uppercase text-xs tracking-wide">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100">
                  {filtered.length === 0 && (
                    <tr><td className="p-6 text-center text-gray-500" colSpan={5}>Sin tareas registradas.</td></tr>
                  )}
                  {filtered.map(t => (
                    <tr key={t.id} className="hover:bg-purple-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{t.nombre}</td>
                      <td className="px-4 py-3 text-gray-700">{t.puntos ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-700">{formatDate(t.due_date)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ (t.activo ?? 1) ? 'bg-green-100 text-green-700 ring-1 ring-green-300' : 'bg-gray-100 text-gray-600 ring-1 ring-gray-300' }`}>
                          {(t.activo ?? 1) ? 'Sí' : 'No'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => setSelectedTask(t)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
                            <Eye className="w-4 h-4" /> Ver entregas
                          </button>
                          <button onClick={() => openEdit(t)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200">
                            <Pencil className="w-4 h-4" /> Editar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.length === 0 && (
                <div className="col-span-full bg-white border-2 border-purple-200 rounded-xl shadow p-6 text-center text-gray-500">Sin tareas registradas.</div>
              )}
              {filtered.map(t => (
                <div key={t.id} className="bg-white border-2 border-purple-200 rounded-2xl shadow p-4 flex flex-col gap-2">
                  <div className="font-bold text-purple-800 text-sm break-words">{t.nombre}</div>
                  <div className="text-xs text-gray-600 flex items-center gap-3 flex-wrap">
                    <span className="bg-purple-50 border border-purple-200 text-purple-700 px-2 py-0.5 rounded">{t.puntos ?? 0} pts</span>
                    <span className="bg-purple-50 border border-purple-200 text-purple-700 px-2 py-0.5 rounded">Entrega: {formatDate(t.due_date)}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${ (t.activo ?? 1) ? 'bg-green-100 text-green-700 ring-1 ring-green-300' : 'bg-gray-100 text-gray-600 ring-1 ring-gray-300' }`}>
                      {(t.activo ?? 1) ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button onClick={() => setSelectedTask(t)} className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700">
                      <Eye className="w-4 h-4" /> Ver entregas
                    </button>
                    <button onClick={() => openEdit(t)} className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-gray-100 text-gray-800 text-xs font-semibold hover:bg-gray-200">
                      <Pencil className="w-4 h-4" /> Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

      {selectedTask && (
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Entregas: {selectedTask.nombre}</h3>
            <button onClick={() => setSelectedTask(null)} className="text-sm text-purple-700 hover:underline">Cerrar</button>
          </div>
          {subLoading ? (
            <div className="text-sm text-gray-600 mt-2">Cargando entregas…</div>
          ) : (
            <div className="overflow-x-auto border rounded-lg mt-2">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="text-left p-2">Entrega</th>
                    <th className="text-left p-2">Alumno</th>
                    <th className="text-left p-2">Puntos</th>
                    <th className="text-left p-2">Fecha</th>
                    <th className="text-left p-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.length === 0 && (
                    <tr><td className="p-3 text-gray-500" colSpan={5}>Sin entregas.</td></tr>
                  )}
                  {submissions.map(s => (
                    <tr key={s.id} className="border-t">
                      <td className="p-2">
                        {s.file_url ? (
                          <div className="flex items-center gap-2">
                            <button onClick={()=> openSubmissionModal(s)} className="px-2 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700">Ver</button>
                            <a className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 hover:bg-gray-200" href={s.file_url} target="_blank" rel="noreferrer" download>
                              <Download className="w-4 h-4" /> Descargar
                            </a>
                          </div>
                        ) : '—'}
                      </td>
                      <td className="p-2">{s.nombre_alumno || s.alumno || s.id_estudiante}</td>
                      <td className="p-2">
                        <input
                          type="number"
                          className="w-20 border rounded px-2 py-1"
                          defaultValue={s.puntos ?? 0}
                          min={0}
                          max={selectedTask.puntos ?? 100}
                          onBlur={(e)=> onChangeGrade(s.id, e.target.value)}
                        />
                      </td>
                      <td className="p-2">{s.created_at ? new Date(s.created_at).toLocaleString('es-MX') : '—'}</td>
                      <td className="p-2">
                        <button onClick={()=> onCancelSubmission(s.id)} className="px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100">Cancelar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal de vista de entrega (PDF) */}
      {showSubmissionModal && modalSubmission && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border-2 border-purple-200 flex flex-col max-h-[85vh]">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="font-semibold">Entrega de {modalSubmission?.nombre_alumno || modalSubmission?.alumno || modalSubmission?.id_estudiante}</div>
              <button className="text-sm text-purple-700 hover:underline" onClick={closeSubmissionModal}>Cerrar</button>
            </div>
            <div className="p-4 flex flex-col gap-3 overflow-auto">
              {modalSubmission?.file_url ? (
                <div className="w-full h-[60vh] bg-gray-50 border rounded-lg overflow-hidden">
                  <iframe
                    key={modalSubmission.file_url}
                    src={modalSubmission.file_url}
                    title="PDF"
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <div className="text-sm text-gray-600">No hay archivo.</div>
              )}
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700">Puntos:</label>
                  <input type="number" className="w-24 border rounded px-2 py-1" value={modalGrade} min={0} max={selectedTask?.puntos ?? 100} onChange={(e)=> setModalGrade(e.target.valueAsNumber || 0)} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={()=> setModalGrade(selectedTask?.puntos ?? 100)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-green-600 text-white hover:bg-green-700">
                    <CheckCircle className="w-4 h-4" /> Aprobar (máx)
                  </button>
                  <button onClick={()=> setModalGrade(0)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700">
                    <XCircle className="w-4 h-4" /> Rechazar (0)
                  </button>
                  {modalSubmission?.file_url && (
                    <a className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200" href={modalSubmission.file_url} target="_blank" rel="noreferrer" download>
                      <Download className="w-4 h-4" /> Descargar
                    </a>
                  )}
                  <button onClick={saveSubmissionModal} className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-purple-600 text-white hover:bg-purple-700">Guardar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">{editingTask ? 'Editar tarea' : 'Nueva tarea'}</h3>
              <button className="text-sm text-gray-500 hover:underline" onClick={()=> { setShowForm(false); setEditingTask(null); }}>Cerrar</button>
            </div>
            <form className="flex flex-col gap-3" onSubmit={submitForm}>
              <label className="text-sm">
                <span className="block text-gray-700 mb-1">Nombre</span>
                <input className="w-full border rounded px-3 py-2" value={form.nombre} onChange={e=> setForm(f=>({...f, nombre: e.target.value}))} required />
              </label>
              <label className="text-sm">
                <span className="block text-gray-700 mb-1">Puntos</span>
                <input type="number" className="w-full border rounded px-3 py-2" value={form.puntos} min={0} onChange={e=> setForm(f=>({...f, puntos: e.target.valueAsNumber || 0}))} required />
              </label>
              <label className="text-sm">
                <span className="block text-gray-700 mb-1">Fecha de entrega</span>
                <input type="date" className="w-full border rounded px-3 py-2" value={form.due_date} onChange={e=> setForm(f=>({...f, due_date: e.target.value}))} />
              </label>
              <label className="text-sm">
                <span className="block text-gray-700 mb-1">Archivo (opcional)</span>
                <input type="file" accept="application/pdf,image/*" onChange={e=> setForm(f=>({...f, archivo: e.target.files?.[0] || null}))} />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!form.activo} onChange={e=> setForm(f=>({...f, activo: e.target.checked}))} />
                <span>Activo</span>
              </label>
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={()=> { setShowForm(false); setEditingTask(null); }} className="px-3 py-1.5 rounded border">Cancelar</button>
                <button type="submit" className="px-3 py-1.5 rounded bg-purple-600 text-white hover:bg-purple-700">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
