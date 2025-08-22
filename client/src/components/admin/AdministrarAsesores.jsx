import { useEffect, useState, useMemo, useRef } from 'react';
import api from '../../api/axios';

// Vista básica para administrar asesores y asignar grupo
export default function AdministrarAsesores(){
  const [data,setData] = useState([]);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState('');
  const [savingId,setSavingId] = useState(null);
  const [filtro,setFiltro] = useState('');
  const [statusFilter,setStatusFilter] = useState('');
  const [grupoFilter,setGrupoFilter] = useState('');
  const [sortKey,setSortKey] = useState('id');
  const [sortDir,setSortDir] = useState('asc');
  const searchRef = useRef(null);

  const [grupos,setGrupos] = useState([]);

  const load = async ()=>{
    setLoading(true); setError('');
    try {
      const [asesoresRes, gruposRes] = await Promise.all([
        api.get('/asesores/admin/list'),
        api.get('/asesores/admin/grupos')
      ]);
      setData(asesoresRes.data?.data||[]);
      setGrupos(gruposRes.data?.grupos||[]);
    } catch(e){ setError(e?.response?.data?.message || 'Error cargando asesores'); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ load(); },[]);

  const updateGrupos = async (row, nuevos)=>{
    setSavingId(row.id);
    try {
      await api.put(`/asesores/perfil/${row.id}/grupos`, { grupos: nuevos });
      setData(prev=> prev.map(r=> r.id===row.id ? { ...r, grupos_asesor: nuevos, grupo_asesor: nuevos[0] } : r));
    } catch(e){ alert(e?.response?.data?.message || 'Error guardando grupos'); }
    finally { setSavingId(null); }
  };

  const changeStatus = async (row, nuevo)=>{
    setSavingId(row.id);
    try {
      const res = await api.put(`/asesores/preregistro/${row.id}/status`, { status: nuevo });
      setData(prev=> prev.map(r=> r.id===row.id ? { ...r, status: res.data.preregistro.status } : r));
    } catch(e){ alert(e?.response?.data?.message || 'Error actualizando status'); }
    finally { setSavingId(null); }
  };

  // Debounce manual para búsqueda
  const [debouncedFiltro,setDebouncedFiltro] = useState('');
  useEffect(()=>{ const t=setTimeout(()=> setDebouncedFiltro(filtro.trim()),350); return ()=> clearTimeout(t); },[filtro]);

  const statusBadge = (status) => {
    const base = 'px-2 py-0.5 rounded-full text-[10px] xs:text-xs font-semibold tracking-wide';
    switch(status){
      case 'completed': return <span className={base+' bg-green-100 text-green-700 border border-green-200'}>completed</span>;
      case 'testing': return <span className={base+' bg-blue-100 text-blue-700 border border-blue-200'}>testing</span>;
      case 'pending': return <span className={base+' bg-yellow-100 text-yellow-700 border border-yellow-200'}>pending</span>;
      case 'rejected': return <span className={base+' bg-red-100 text-red-700 border border-red-200'}>rejected</span>;
      default: return <span className={base+' bg-gray-100 text-gray-600 border border-gray-200'}>{status||'—'}</span>;
    }
  };

  const processed = useMemo(()=>{
    let list = [...data];
    if(debouncedFiltro){
      const f = debouncedFiltro.toLowerCase();
      list = list.filter(r=> (r.nombres+' '+r.apellidos).toLowerCase().includes(f) || r.correo.toLowerCase().includes(f));
    }
    if(statusFilter) list = list.filter(r=> r.status===statusFilter);
  if(grupoFilter) list = list.filter(r=> (Array.isArray(r.grupos_asesor)? r.grupos_asesor.includes(grupoFilter) : (r.grupo_asesor||'') === grupoFilter));
    list.sort((a,b)=>{
      const dir = sortDir==='asc'?1:-1;
      const va = a[sortKey] ?? '';
      const vb = b[sortKey] ?? '';
      if(typeof va === 'number' && typeof vb === 'number') return (va-vb)*dir;
      return String(va).localeCompare(String(vb),'es',{sensitivity:'base'})*dir;
    });
    return list;
  },[data,debouncedFiltro,statusFilter,grupoFilter,sortKey,sortDir]);

  // Métricas
  const metrics = useMemo(()=>{
    const total = data.length;
  const conGrupo = data.filter(d=> (d.grupo_asesor || (Array.isArray(d.grupos_asesor) && d.grupos_asesor.length))).length;
    const sinGrupo = total - conGrupo;
    const totalAsignados = data.reduce((acc,d)=> acc + (d.estudiantes_asignados||0),0);
    const totalAlumnos = data.reduce((acc,d)=> acc + (d.total_estudiantes_grupo||0),0);
    const completion = totalAlumnos? Math.round((totalAsignados/totalAlumnos)*100):0;
    return { total, conGrupo, sinGrupo, totalAsignados, totalAlumnos, completion };
  },[data]);

  const onSort = (key)=>{
    if(sortKey===key) setSortDir(d=> d==='asc'?'desc':'asc'); else { setSortKey(key); setSortDir('asc'); }
  };

  return (
    <div className="p-4 xs:p-6 flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-lg xs:text-xl font-bold text-gray-800 tracking-tight">Administrar Asesores</h1>
        <p className="text-xs xs:text-sm text-gray-500 max-w-2xl">Gestiona el estado, grupo y asignación automática de alumnos por grupo para cada asesor.</p>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative">
            <input ref={searchRef} placeholder="Buscar nombre o correo" value={filtro} onChange={e=> setFiltro(e.target.value)} className="pr-8 border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-300/40 outline-none rounded-md px-3 py-2 text-xs xs:text-sm w-64 transition" />
            {debouncedFiltro && (
              <button onClick={()=> { setFiltro(''); searchRef.current?.focus(); }} className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                ✕
              </button>) }
          </div>
          <select value={statusFilter} onChange={e=> setStatusFilter(e.target.value)} className="px-3 py-2 text-xs xs:text-sm border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-purple-300">
            <option value="">Status (todos)</option>
            <option value="pending">pending</option>
            <option value="testing">testing</option>
            <option value="completed">completed</option>
            <option value="rejected">rejected</option>
          </select>
            <select value={grupoFilter} onChange={e=> setGrupoFilter(e.target.value)} className="px-3 py-2 text-xs xs:text-sm border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-purple-300">
              <option value="">Grupo (todos)</option>
              {grupos.map(g=> <option key={g} value={g}>{g}</option>)}
            </select>
          <button onClick={load} className="px-4 py-2 text-xs xs:text-sm font-medium rounded-md bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow hover:from-purple-500 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400">Refrescar</button>
          <button onClick={()=> { setStatusFilter(''); setGrupoFilter(''); setFiltro(''); }} className="px-3 py-2 text-xs xs:text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50">Limpiar</button>
          <div className="ml-auto text-xs text-gray-500">{processed.length} resultado(s)</div>
        </div>
        {/* Métricas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label:'Asesores', val: metrics.total },
            { label:'Con grupo', val: metrics.conGrupo },
            { label:'Sin grupo', val: metrics.sinGrupo },
            { label:'Alumnos asignados', val: metrics.totalAsignados },
            { label:'Alumnos grupo', val: metrics.totalAlumnos },
            { label:'% cobertura', val: metrics.completion+'%' }
          ].map(m=> (
            <div key={m.label} className="rounded-lg border border-gray-200 bg-white/70 backdrop-blur px-3 py-2 flex flex-col shadow-sm">
              <span className="text-[10px] xs:text-[11px] uppercase tracking-wide text-gray-500 font-medium">{m.label}</span>
              <span className="text-sm xs:text-base font-semibold text-gray-800">{m.val}</span>
            </div>
          ))}
        </div>
      </div>
      {loading && <div className="text-sm text-purple-600 animate-pulse">Cargando asesores...</div>}
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div>}

      <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 bg-white flex items-center justify-between">
          <h2 className="text-sm xs:text-base font-semibold text-gray-800 tracking-tight">Listado de Asesores</h2>
          <span className="text-[10px] xs:text-xs text-gray-400">Auto-asignación al cambiar grupo</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-[11px] xs:text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#111827] text-white select-none">
                {[
                  {k:'id',t:'Folio'},
                  {k:'nombres',t:'Nombre'},
                  {k:'correo',t:'Correo'},
                  {k:'area',t:'Área'},
                  {k:'status',t:'Status'},
                  {k:'grupo_asesor',t:'Grupos'},
                  {k:'alumnos',t:'Alumnos (asignados / total)', noSort:true},
                  {k:'estado',t:'Estado', noSort:true}
                ].map(col=> (
                  <th key={col.t} onClick={()=> !col.noSort && onSort(col.k)} className={`px-3 sm:px-4 py-3 text-left font-semibold tracking-wide text-[10px] xs:text-[11px] sm:text-xs uppercase whitespace-nowrap border-r border-[#1f2937] last:border-r-0 ${col.noSort? 'cursor-default' : 'cursor-pointer hover:bg-[#1f2433]'}`}>{col.t}{!col.noSort && sortKey===col.k && <span className="ml-1 text-[9px]">{sortDir==='asc'?'▲':'▼'}</span>}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white">
              {processed.map((r,idx)=> {
                const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60';
                return (
                  <tr key={r.id} className={`transition-colors hover:bg-gray-50 ${rowBg}`}>
                    <td className="px-3 sm:px-4 py-2 font-medium text-gray-600">{r.id}</td>
                    <td className="px-3 sm:px-4 py-2 text-gray-800 font-medium">{r.nombres} {r.apellidos}</td>
                    <td className="px-3 sm:px-4 py-2 text-gray-600">{r.correo}</td>
                    <td className="px-3 sm:px-4 py-2 text-gray-600">{r.area || '-'}</td>
                    <td className="px-3 sm:px-4 py-2 space-y-1">
                      {statusBadge(r.status)}
                      <div>
                        <select className="mt-1 w-full px-2 py-1 rounded-md border border-gray-300 text-[10px] xs:text-[11px] bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 disabled:opacity-50" value={r.status} onChange={(e)=> changeStatus(r, e.target.value)} disabled={savingId===r.id}>
                          <option value="pending">pending</option>
                          <option value="testing">testing</option>
                          <option value="completed">completed</option>
                          <option value="rejected">rejected</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-2">
                      <MultiGrupoSelector
                        gruposDisponibles={grupos}
                        value={Array.isArray(r.grupos_asesor)? r.grupos_asesor : (r.grupo_asesor? [r.grupo_asesor]: [])}
                        disabled={savingId===r.id}
                        onChange={(vals)=> updateGrupos(r, vals)}
                      />
                    </td>
                    <td className="px-3 sm:px-4 py-2 text-center font-medium text-gray-700">
                      {(r.grupo_asesor || (Array.isArray(r.grupos_asesor) && r.grupos_asesor.length)) ? <span>{r.estudiantes_asignados || 0} <span className="text-gray-400">/</span> {r.total_estudiantes_grupo || 0}</span> : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-3 sm:px-4 py-2 text-[10px] xs:text-xs">
                      {savingId===r.id ? <span className="text-purple-600 animate-pulse font-medium">Guardando...</span> : <span className="text-green-600 font-semibold">OK</span>}
                    </td>
                  </tr>
                );
              })}
              {!loading && !processed.length && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium">No hay asesores</p>
                      <p className="text-xs text-gray-400">Aparecerán aquí cuando se registren</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-md bg-purple-50/60 border border-purple-200 px-4 py-3 text-[11px] xs:text-xs text-purple-700 leading-relaxed flex flex-wrap gap-2 items-center">
        <span className="font-medium">Tip:</span>
        <span>Al seleccionar un grupo se auto-asignan los alumnos aprobados sin asesor (o con el asesor por defecto).</span>
        <span className="hidden sm:inline">Usa las columnas para ordenar y los filtros para segmentar.</span>
      </div>
    </div>
  );
}

// Selector multigrupo simple con checkboxes en dropdown
function MultiGrupoSelector({ gruposDisponibles, value, onChange, disabled }){
  const [open,setOpen] = useState(false);
  const toggle = (g)=>{
    if(disabled) return;
    const exists = value.includes(g);
    const next = exists ? value.filter(v=> v!==g) : [...value, g];
    onChange(next);
  };
  const label = value.length ? value.join(', ') : '(Sin grupos)';
  return (
    <div className="relative text-[10px] xs:text-xs">
      <button type="button" disabled={disabled} onClick={()=> setOpen(o=>!o)} className={`w-full border px-2 py-1 rounded-md text-left bg-white hover:bg-gray-50 ${disabled? 'opacity-50 cursor-not-allowed':''}`}>{label}</button>
      {open && !disabled && (
        <div className="absolute z-20 mt-1 w-48 max-h-56 overflow-auto bg-white border border-gray-200 rounded-md shadow-lg p-2 flex flex-col gap-1">
          {gruposDisponibles.map(g=> {
            const active = value.includes(g);
            return (
              <label key={g} className={`flex items-center gap-2 cursor-pointer px-2 py-1 rounded-md text-[10px] ${active? 'bg-purple-100 text-purple-700':'hover:bg-gray-100'}`}> 
                <input type="checkbox" className="accent-purple-600" checked={active} onChange={()=> toggle(g)} />
                <span className="truncate">{g}</span>
              </label>
            );
          })}
          <button onClick={()=> setOpen(false)} className="mt-2 text-[10px] bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded-md">Cerrar</button>
        </div>
      )}
    </div>
  );
}
