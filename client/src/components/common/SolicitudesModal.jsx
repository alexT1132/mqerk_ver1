import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Inbox, CheckCircle2, XCircle, Clock, User } from "lucide-react";

/* --- Card View Component for "Ver Todas" --- */
function RequestsManager({ rows, status, setStatus, onApprove, onDeny, areaNamesMap, loading, onClose, areaName, areaId, setViewAll }) {
  const stats = useMemo(() => {
    return {
      pending: rows.filter(r => r.status === 'pending').length,
      approved: rows.filter(r => r.status === 'approved').length,
      denied: rows.filter(r => r.status === 'denied').length,
      total: rows.length
    };
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter(r => r.status === status);
  }, [rows, status]);

  const content = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 2xl:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-3xl sm:max-w-[min(48rem,90vw)] 2xl:max-w-5xl min-[1800px]:max-w-6xl max-h-[78vh] 2xl:max-h-[85vh] flex flex-col bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-4 sm:px-6 2xl:px-8 2xl:py-5 border-b border-slate-100 flex items-center justify-between bg-white z-10 shrink-0">
          <div className="flex items-center gap-3 2xl:gap-4">
            <div className="size-10 2xl:size-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center shadow-sm shrink-0">
              <Inbox className="size-5 2xl:size-6" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg 2xl:text-xl font-bold text-slate-900 leading-tight">Centro de Solicitudes</h3>
              <p className="text-xs 2xl:text-sm text-slate-500 font-medium mt-0.5">
                {areaId ? `Área: ${areaName}` : 'Vista Global'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setViewAll(false)}
              className="hidden sm:flex px-3 py-1.5 2xl:px-4 2xl:py-2 text-xs 2xl:text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              Vista Simple
            </button>
            <button
              onClick={onClose}
              className="size-8 2xl:size-10 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-rose-500 transition-colors"
            >
              <XCircle className="size-5 2xl:size-6" />
            </button>
          </div>
        </div>
        <div className="px-4 sm:px-6 2xl:px-8 2xl:py-4 py-3 bg-slate-50/50 border-b border-slate-100 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
          {[
            { id: 'pending', label: 'Pendientes', count: stats.pending, color: 'text-amber-700 bg-amber-50 border-amber-200' },
            { id: 'approved', label: 'Aprobadas', count: stats.approved, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
            { id: 'denied', label: 'Rechazadas', count: stats.denied, color: 'text-rose-700 bg-rose-50 border-rose-200' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setStatus(item.id)}
              className={`flex items-center gap-2 px-3 py-1.5 2xl:px-4 2xl:py-2 rounded-lg border text-xs 2xl:text-sm font-bold transition-all shrink-0 ${status === item.id
                ? `${item.color} shadow-sm ring-1 ring-transparent scale-105`
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                }`}
            >
              {item.label}
              <span className={`px-1.5 py-0.5 2xl:px-2 2xl:py-1 rounded-md text-[10px] 2xl:text-xs ${status === item.id ? 'bg-white/50' : 'bg-slate-100 text-slate-600'}`}>
                {item.count}
              </span>
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 2xl:p-8 bg-slate-50/30">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 2xl:gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 rounded-2xl bg-white border border-slate-200 animate-pulse" />
              ))}
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-10">
              <div className="size-16 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center mb-4">
                <Inbox className="size-8" />
              </div>
              <p className="text-slate-900 font-bold text-sm">Sin resultados</p>
              <p className="text-slate-400 text-xs mt-1">No hay solicitudes en este estado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 2xl:gap-6">
              {filteredRows.map(r => (
                <RequestCard key={r.id} data={r} areaNamesMap={areaNamesMap} status={status} onApprove={() => onApprove(r.id)} onDeny={() => onDeny(r.id)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.getElementById('modal-root'));
}

function RequestCard({ data, areaNamesMap, status, onApprove, onDeny }) {
  const areaName = data.area_name || areaNamesMap?.[data.area_id] || `Área ${data.area_id}`;
  return (
    <article className="group bg-white rounded-2xl p-4 sm:p-5 2xl:p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start justify-between gap-3 2xl:gap-4">
        <div className="flex items-center gap-3 2xl:gap-4 min-w-0">
          <div className="size-11 sm:size-12 2xl:size-14 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex flex-shrink-0 items-center justify-center text-white text-base 2xl:text-lg font-bold shadow-md shadow-indigo-200">
            {data.nombre ? data.nombre.charAt(0).toUpperCase() : '?'}
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-slate-900 text-sm sm:text-base 2xl:text-lg leading-tight truncate">{data.nombre} {data.apellidos}</h4>
            <p className="text-xs 2xl:text-sm text-slate-500 font-medium mt-0.5 truncate">{data.email || 'Sin correo'}</p>
          </div>
        </div>
        <div className="text-right hidden sm:block shrink-0">
          <p className="text-xs 2xl:text-sm font-bold text-slate-400 uppercase tracking-wider">Solicitado</p>
          <p className="text-sm 2xl:text-base font-semibold text-slate-700">{new Date(data.created_at).toLocaleDateString()}</p>
        </div>
      </div>
      <div className="mt-4 2xl:mt-5 flex flex-wrap gap-2 2xl:gap-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 2xl:px-3 2xl:py-2 rounded-xl bg-slate-50 border border-slate-100 text-xs 2xl:text-sm font-bold text-slate-700">
          <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></span><span className="truncate max-w-[120px] sm:max-w-none">{areaName}</span>
        </span>
        <span className="inline-flex items-center px-2.5 py-1.5 2xl:px-3 2xl:py-2 rounded-xl bg-white border border-slate-200 text-xs 2xl:text-sm font-medium text-slate-500 uppercase tracking-wider">{data.area_type}</span>
      </div>
      {status === 'pending' && (
        <div className="mt-5 2xl:mt-6 flex items-center gap-3 2xl:gap-4 pt-4 2xl:pt-5 border-t border-slate-100">
          <button onClick={onDeny} className="flex-1 py-2.5 2xl:py-3 rounded-xl border-2 border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold text-xs 2xl:text-sm transition-all flex items-center justify-center gap-2">
            <XCircle className="size-4 2xl:size-5" /> Rechazar
          </button>
          <button onClick={onApprove} className="flex-1 py-2.5 2xl:py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs 2xl:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
            <CheckCircle2 className="size-4 2xl:size-5" /> Aprobar
          </button>
        </div>
      )}
      {status !== 'pending' && (
        <div className={`mt-5 p-3 rounded-xl border flex items-center gap-2 text-sm font-bold ${status === 'approved' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
          {status === 'approved' ? <CheckCircle2 className="size-5" /> : <XCircle className="size-5" />}
          {status === 'approved' ? 'Solicitud Aprobada' : 'Solicitud Rechazada'}
        </div>
      )}
    </article>
  );
}

export default function SolicitudesModal({ open, onClose, areaId = null, areaName = null, areaType = 'actividad', onRefreshCounts, areaNamesMap = {} }) {
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);
  const [viewAll, setViewAll] = useState(false);
  const [showDenyModal, setShowDenyModal] = useState(false);
  const [currentDenyRequestId, setCurrentDenyRequestId] = useState(null);
  const [denyReason, setDenyReason] = useState('');
  const isSim = areaType === 'simulacion';
  const collectionLabel = isSim ? 'simuladores' : 'módulos';

  const fetchWithRefresh = async (url, options = {}) => {
    const opts = { credentials: 'include', ...options };
    let res = await fetch(url, opts).catch(() => null);
    if (res && res.status !== 401) return res;
    try {
      const r = await fetch('/api/usuarios/token/refresh', { method: 'POST', credentials: 'include' });
      if (r.ok) {
        res = await fetch(url, opts).catch(() => null);
        return res;
      }
    } catch (_) { }
    return res;
  };

  const fetchRequests = async () => {
    if (!open) return;
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (areaId) params.set('area_id', String(areaId));
      params.set('area_type', areaType);

      const res = await fetchWithRefresh(`/api/advisor/area-requests?${params.toString()}`);
      if (!res || !res.ok) throw new Error(`HTTP ${res?.status || 'fetch error'}`);
      const json = await res.json();
      let data = Array.isArray(json?.data) ? json.data : [];

      if (!areaId && areaName) {
        const normalize = (str) => (str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
        const normalizedAreaName = normalize(areaName);

        data = data.filter(request => {
          let requestAreaName = request.area_name;
          if (!requestAreaName && request.area_id && areaNamesMap) {
            requestAreaName = areaNamesMap[String(request.area_id)];
          }
          if (!requestAreaName) return false;
          const normalizedRequestAreaName = normalize(requestAreaName);
          if (!normalizedAreaName || !normalizedRequestAreaName) return false;
          return normalizedRequestAreaName.includes(normalizedAreaName) || normalizedAreaName.includes(normalizedRequestAreaName);
        });
      }

      setRows(data);
    } catch (e) { setError(e?.message || 'Error al cargar'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRequests(); }, [open, status, areaId, areaName, areaType]);

  const approve = async (id) => {
    try {
      const res = await fetchWithRefresh(`/api/advisor/area-requests/${id}/approve`, { method: 'POST' });
      if (!res || !res.ok) throw new Error(`HTTP ${res?.status || 'error'}`);
      await fetchRequests();
      if (typeof onRefreshCounts === 'function') onRefreshCounts();
    } catch (e) { alert('No se pudo aprobar: ' + e.message); }
  };

  const deny = (id) => {
    setCurrentDenyRequestId(id);
    setShowDenyModal(true);
  };

  const handleDenySubmit = async () => {
    if (!currentDenyRequestId) return;
    try {
      const res = await fetchWithRefresh(`/api/advisor/area-requests/${currentDenyRequestId}/deny`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: denyReason })
      });
      if (!res || !res.ok) throw new Error(`HTTP ${res?.status || 'error'}`);
      await fetchRequests();
      if (typeof onRefreshCounts === 'function') onRefreshCounts();
      setShowDenyModal(false);
      setDenyReason('');
      setCurrentDenyRequestId(null);
    } catch (e) {
      alert('No se pudo rechazar: ' + e.message);
    }
  };

  const StatusBadge = ({ value }) => {
    const config = {
      pending: { label: 'P', cls: 'bg-amber-50 text-amber-700 ring-amber-200' },
      approved: { label: 'A', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
      denied: { label: 'R', cls: 'bg-rose-50 text-rose-700 ring-rose-200' },
    };
    const c = config[value] || { label: '?', cls: 'bg-slate-50 text-slate-700 ring-slate-200' };
    return <span className={`inline-flex items-center justify-center size-5 text-[10px] font-black rounded-lg ring-1 ${c.cls}`}>{c.label}</span>;
  };

  if (!open) return null;
  if (viewAll) return <RequestsManager rows={rows} status={status} setStatus={setStatus} onApprove={approve} onDeny={deny} areaNamesMap={areaNamesMap} loading={loading} onClose={onClose} areaName={areaName} areaId={areaId} setViewAll={setViewAll} />;

  const mainContent = (
    <div className="fixed inset-0 z-[100] flex justify-center items-center p-3 sm:p-4 2xl:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm sm:max-w-md 2xl:max-w-lg min-[1800px]:max-w-xl rounded-xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden transition-all">
        <div className="sticky top-0 flex items-center justify-between gap-3 px-4 py-3 2xl:px-6 2xl:py-4 border-b border-slate-100 bg-white/95 backdrop-blur z-10">
          <div className="min-w-0 flex items-center gap-3 2xl:gap-4">
            <span className="grid h-9 w-9 2xl:h-11 2xl:w-11 place-items-center rounded-xl bg-violet-50 text-violet-600 ring-1 ring-violet-100 shrink-0"><Inbox className="w-5 h-5 2xl:w-6 2xl:h-6" /></span>
            <div className="min-w-0">
              <h2 className="text-sm 2xl:text-base font-bold truncate text-slate-900">{areaId ? areaName : `Solicitudes`}</h2>
              <p className="text-[10px] 2xl:text-xs text-slate-500 truncate flex items-center gap-2 font-medium">
                {status === 'pending' ? 'Pendientes' : status === 'approved' ? 'Aprobadas' : 'Rechazadas'}<span className="inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-slate-100 text-slate-600 text-[9px] ring-1 ring-slate-200 font-bold">{rows.length}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="inline-flex h-8 w-8 2xl:h-10 2xl:w-10 items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 font-bold transition-colors shrink-0">✕</button>
        </div>

        <div className="px-4 py-3 2xl:px-6 2xl:py-4 border-b border-slate-50 flex items-center justify-between gap-2">
          <div className="flex gap-1.5">
            {['pending', 'approved', 'denied'].map(s => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`size-8 rounded-lg flex items-center justify-center border transition-all shrink-0 ${status === s
                  ? 'bg-violet-600 text-white border-violet-600 shadow-md ring-2 ring-violet-100 scale-105'
                  : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                  }`}
                title={s === 'pending' ? 'Pendientes' : s === 'approved' ? 'Aprobadas' : 'Rechazadas'}
              >
                {s === 'pending' ? <Clock className="size-4 2xl:size-5" /> : s === 'approved' ? <CheckCircle2 className="size-4 2xl:size-5" /> : <XCircle className="size-4 2xl:size-5" />}
              </button>
            ))}
          </div>
          <button onClick={() => setViewAll(true)} className="px-3 py-1.5 2xl:px-4 2xl:py-2 rounded-lg border border-slate-200 text-[10px] 2xl:text-xs font-bold bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-sm">Ver todas</button>
        </div>

        <div className="px-2 pb-3 2xl:px-4 2xl:pb-4 min-h-[100px] max-h-[420px] 2xl:max-h-[520px] overflow-y-auto custom-scrollbar scrollbar-thin scrollbar-thumb-slate-200">
          {loading && <div className="py-10 flex flex-col items-center justify-center text-slate-500 gap-2"><div className="size-6 rounded-full border-2 border-slate-100 border-t-violet-600 animate-spin" /><span className="text-[10px]">Cargando...</span></div>}
          {error && <div className="m-2 rounded-lg bg-rose-50 text-rose-700 border border-rose-100 px-3 py-2 text-[10px] font-medium">{error}</div>}
          {!loading && !error && rows.length === 0 && (
            <div className="py-10 text-center flex flex-col items-center justify-center">
              <Inbox className="size-8 text-slate-200 mb-2" />
              <p className="text-xs font-bold text-slate-800">Sin pendientes</p>
            </div>
          )}
          {!loading && !error && rows.length > 0 && (
            <div className="divide-y divide-slate-50">
              {rows.map(r => (
                <div key={r.id} className="py-3 px-2 2xl:py-4 2xl:px-3 flex items-center justify-between gap-3 group hover:bg-slate-50/50 transition-colors rounded-xl">
                  <div className="flex items-center gap-3 2xl:gap-4 min-w-0">
                    <div className="size-8 2xl:size-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex-shrink-0 flex items-center justify-center text-white text-xs 2xl:text-sm font-bold shadow-sm">
                      {r.nombre ? r.nombre.charAt(0).toUpperCase() : <User className="size-4 2xl:size-5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-800 truncate text-[11px] 2xl:text-sm leading-tight">{r.nombre} {r.apellidos}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] text-slate-400 truncate max-w-[80px]">{r.area_name || `ID:${r.area_id}`}</span>
                        {status !== 'pending' && <StatusBadge value={r.status} />}
                      </div>
                    </div>
                  </div>

                  {status === 'pending' && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => deny(r.id)} className="size-8 2xl:size-10 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center" title="Rechazar">
                        <XCircle className="size-4 2xl:size-5" />
                      </button>
                      <button onClick={() => approve(r.id)} className="size-8 2xl:size-10 rounded-lg bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center" title="Aprobar">
                        <CheckCircle2 className="size-4 2xl:size-5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showDenyModal && createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 2xl:p-6" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setShowDenyModal(false)} />
          <div className="relative w-full max-w-md 2xl:max-w-2xl min-[1800px]:max-w-3xl rounded-xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-5 sm:px-6 2xl:px-8 2xl:py-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-10 shrink-0">
              <h3 className="text-base sm:text-lg 2xl:text-xl font-bold text-slate-900 leading-tight">Razón del rechazo</h3>
              <button
                onClick={() => setShowDenyModal(false)}
                className="size-8 2xl:size-10 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-rose-500 transition-colors"
              >
                <XCircle className="size-5 2xl:size-6" />
              </button>
            </div>
            <div className="p-5 sm:p-6 2xl:p-8">
              <textarea
                className="w-full p-3 2xl:p-4 text-sm 2xl:text-base border border-slate-300 rounded-lg focus:ring-violet-500 focus:border-violet-500 resize-y min-h-[100px] 2xl:min-h-[120px]"
                placeholder="Escribe la razón del rechazo aquí..."
                value={denyReason}
                onChange={(e) => setDenyReason(e.target.value)}
              ></textarea>
            </div>
            <div className="px-5 sm:px-6 2xl:px-8 2xl:py-5 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setShowDenyModal(false)}
                className="px-4 py-2 2xl:px-5 2xl:py-2.5 text-sm 2xl:text-base rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDenySubmit}
                className="px-4 py-2 2xl:px-5 2xl:py-2.5 text-sm 2xl:text-base rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors"
                disabled={!denyReason.trim()}
              >
                Rechazar
              </button>
            </div>
          </div>
        </div>,
        document.getElementById('modal-root')
      )}
    </div>
  );

  return createPortal(mainContent, document.getElementById('modal-root'));
}
