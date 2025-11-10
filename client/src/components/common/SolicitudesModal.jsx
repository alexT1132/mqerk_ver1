import { useEffect, useMemo, useState } from "react";
import { Inbox } from "lucide-react";

export default function SolicitudesModal({
  open,
  onClose,
  areaId = null,
  areaName = null,
  areaType = 'actividad',
  onRefreshCounts,
  areaNamesMap = {},
}) {
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rows, setRows] = useState([]);

  const isSim = areaType === 'simulacion';
  const collectionLabel = isSim ? 'simuladores' : 'módulos';

  // Helper con refresh automático si el access token expiró
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
    } catch (_) {}
    return res; // puede seguir siendo 401
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
      if (!res || !res.ok) {
        if (res && res.status === 401) throw new Error('Necesitas iniciar sesión como asesor para ver solicitudes (401)');
        throw new Error(`HTTP ${res?.status || 'fetch error'}`);
      }
      const json = await res.json();
      setRows(Array.isArray(json?.data) ? json.data : []);
    } catch (e) {
      setError(e?.message || 'Error al cargar');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchRequests(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [open, status, areaId, areaType]);

  const approve = async (id) => {
    try {
      const res = await fetchWithRefresh(`/api/advisor/area-requests/${id}/approve`, { method: 'POST' });
      if (!res || !res.ok) throw new Error(res && res.status === 401 ? 'No autorizado (asesor requerido)' : `HTTP ${res?.status || 'fetch error'}`);
      await fetchRequests();
      try { if (typeof onRefreshCounts === 'function') onRefreshCounts(); } catch {}
    } catch (e) { alert('No se pudo aprobar: ' + (e?.message || 'Error')); }
  };
  const deny = async (id) => {
    try {
      const notes = window.prompt('Razón del rechazo (opcional):') || '';
      const res = await fetchWithRefresh(`/api/advisor/area-requests/${id}/deny`, { method: 'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ notes }) });
      if (!res || !res.ok) throw new Error(res && res.status === 401 ? 'No autorizado (asesor requerido)' : `HTTP ${res?.status || 'fetch error'}`);
      await fetchRequests();
      try { if (typeof onRefreshCounts === 'function') onRefreshCounts(); } catch {}
    } catch (e) { alert('No se pudo rechazar: ' + (e?.message || 'Error')); }
  };

  const StatusBadge = ({ value }) => {
    const config = useMemo(() => ({
      pending: { label: 'Pendiente', cls: 'bg-amber-50 text-amber-700 ring-amber-200' },
      approved: { label: 'Aprobada', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
      denied: { label: 'Rechazada', cls: 'bg-rose-50 text-rose-700 ring-rose-200' },
    }), []);
    const c = config[value] || { label: value, cls: 'bg-slate-50 text-slate-700 ring-slate-200' };
    return <span className={["inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ring-1", c.cls].join(' ')}>{c.label}</span>;
  };

  if (!open) return null;
  return (
  <div className="fixed inset-0 z-50 flex justify-center items-center p-3 sm:p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
  <div className="relative w-full max-w-sm rounded-xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden mt-16 sm:mt-24">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between gap-3 px-3 py-2 border-b bg-white/95 backdrop-blur">
          <div className="min-w-0 flex items-center gap-3">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-violet-100 text-violet-700">
              <Inbox className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-semibold truncate">
                {areaId ? (
                  <>Solicitudes para <span className="font-bold">{areaName || `#${areaId}`}</span></>
                ) : `Solicitudes de acceso a ${collectionLabel}`}
              </h2>
              <p className="text-[11px] text-slate-500 truncate flex items-center gap-2">
                {status === 'pending' ? 'Pendientes' : status === 'approved' ? 'Aprobadas' : 'Rechazadas'}
                <span className="inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-slate-100 text-slate-700 text-[10px] ring-1 ring-slate-200">{rows.length}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-100" aria-label="Cerrar">✕</button>
        </div>

        {/* Filtros */}
  <div className="px-3 pt-1.5 pb-1.5 flex flex-wrap items-center gap-2">
          {['pending','approved','denied'].map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={[
                'px-2.5 py-1 rounded-full text-sm border transition',
                status===s ? 'bg-violet-600 text-white border-violet-600' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              ].join(' ')}
            >
              {s === 'pending' ? 'Pendientes' : s === 'approved' ? 'Aprobadas' : 'Rechazadas'}
            </button>
          ))}
          {areaId && (
            <button onClick={() => { try { onClose(); } catch {}; }} className="ml-auto px-2.5 py-1 rounded-full border text-sm bg-white hover:bg-slate-50 text-slate-600 border-slate-200">Ver todas</button>
          )}
        </div>

        {/* Body */}
        {/* Área de contenido con altura fija: scroll aparece cuando hay más de ~3 filas */}
  <div className="px-3 pb-3 h-[200px] sm:h-[260px] overflow-y-auto overscroll-contain">
          {loading && (
            <div className="py-6 flex flex-col items-center justify-center text-slate-500 text-sm gap-2">
              <svg className="animate-spin h-4 w-4 text-violet-600" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
              Cargando...
            </div>
          )}
          {error && <div className="mb-3 rounded-md bg-rose-50 text-rose-700 border border-rose-200 px-3 py-2 text-sm">{error}</div>}
          {!loading && !error && rows.length === 0 && (
            <div className="py-8 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 grid place-items-center mb-2 text-slate-400">
                <Inbox className="w-5 h-5" />
              </div>
              <p className="text-sm text-slate-500">Sin solicitudes {status === 'pending' ? 'pendientes' : ''}</p>
            </div>
          )}

          {!loading && !error && rows.length > 0 && (
            <div className="divide-y">
              {rows.map(r => (
                <div key={r.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{r.nombre ? `${r.nombre} ${r.apellidos || ''}` : `Estudiante #${r.id_estudiante}`}</div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                      <span className="truncate">Área: {r.area_name || areaNamesMap?.[r.area_id] || r.area_id}</span>
                      <span className="inline-block h-1 w-1 rounded-full bg-slate-300" />
                      <span className="truncate capitalize">Tipo: {r.area_type}</span>
                      <span className="inline-block h-1 w-1 rounded-full bg-slate-300" />
                      <StatusBadge value={r.status} />
                    </div>
                    {r.notes && <div className="text-[11px] text-slate-400 truncate mt-0.5">Notas: {r.notes}</div>}
                  </div>
                  {status === 'pending' ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button onClick={() => approve(r.id)} className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs shadow-sm">Aprobar</button>
                      <button onClick={() => deny(r.id)} className="px-2.5 py-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-xs shadow-sm">Rechazar</button>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 shrink-0">{new Date(r.decided_at || r.created_at).toLocaleString()}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
