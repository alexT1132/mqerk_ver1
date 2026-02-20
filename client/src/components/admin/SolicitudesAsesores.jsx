import { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/axios';
import { resetPasswordAsesorAdmin } from '../../api/asesores';



export default function SolicitudesAsesores() {
  const [lista, setLista] = useState([]); // todos los preregistros
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [vista, setVista] = useState('pendientes'); // 'pendientes' | 'aprobados'
  const [busqueda, setBusqueda] = useState('');
  const [debounced, setDebounced] = useState('');
  const [savingId, setSavingId] = useState(null);
  // Modal para cambiar estatus
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [rowEditandoStatus, setRowEditandoStatus] = useState(null);
  // Modal asignación de grupos
  const [modalOpen, setModalOpen] = useState(false);
  const [rowAsignando, setRowAsignando] = useState(null); // preregistro row
  const [gruposDisponibles, setGruposDisponibles] = useState([]);
  const [gruposSeleccionados, setGruposSeleccionados] = useState([]);
  const [savingGrupos, setSavingGrupos] = useState(false);
  const [gruposLoading, setGruposLoading] = useState(false);
  // Modal reset password
  const [resetOpen, setResetOpen] = useState(false);
  const [rowReseteando, setRowReseteando] = useState(null);
  const [resetPass, setResetPass] = useState('');
  const [resetUserName, setResetUserName] = useState('');
  const [doingReset, setDoingReset] = useState(false);
  const [resetMsg, setResetMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [waModalOpen, setWaModalOpen] = useState(false);
  const [waNumber, setWaNumber] = useState('');

  const copyTestLink = () => {
    const url = window.location.origin + '/pre_registro';
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    if (!waNumber) return;
    const cleanNumber = waNumber.replace(/\D/g, '');
    const url = window.location.origin + '/pre_registro';
    const text = encodeURIComponent(`¡Hola! Te comparto el link para iniciar tu proceso como asesor en MQerKAcademy: ${url}`);
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
    setWaModalOpen(false);
    setWaNumber('');
  };

  useEffect(() => { const t = setTimeout(() => setDebounced(busqueda.trim().toLowerCase()), 300); return () => clearTimeout(t); }, [busqueda]);

  const cargar = async () => {
    setLoading(true); setError('');
    try {
      const [resList, resGrupos] = await Promise.all([
        api.get('/asesores/admin/list'),
        api.get('/asesores/admin/grupos')
      ]);
      const data = resList.data?.data || [];
      setLista(data);
      setGruposDisponibles(resGrupos.data?.grupos || []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Error cargando solicitudes');
    } finally { setLoading(false); }
  };
  useEffect(() => { cargar(); }, []);

  const pendientes = useMemo(() => lista.filter(r => ['pending', 'testing'].includes(r.status)), [lista]);
  const aprobados = useMemo(() => lista.filter(r => r.status === 'completed'), [lista]);

  const abrirModalGrupos = async (row) => {
    setRowAsignando(row);
    // Prefill con existentes si ya tiene
    const existentes = Array.isArray(row.grupos_asesor) ? row.grupos_asesor : (row.grupo_asesor ? [row.grupo_asesor] : []);
    setGruposSeleccionados(existentes);
    // Cargar catálogo (lazy)
    if (!gruposDisponibles.length) {
      setGruposLoading(true);
      try {
        const res = await api.get('/asesores/admin/grupos');
        setGruposDisponibles(res.data?.grupos || []);
      } catch (e) {
        console.error(e);
      } finally { setGruposLoading(false); }
    }
    setModalOpen(true);
  };

  const cerrarModal = () => { setModalOpen(false); setRowAsignando(null); };

  // Abrir modal de reset password (solo si aprobado)
  const abrirModalReset = (row) => {
    if (row?.status !== 'completed') return;
    setRowReseteando(row);
    setResetPass('');
    setResetUserName('');
    setResetMsg('');
    setResetOpen(true);
  };
  const cerrarModalReset = () => { setResetOpen(false); setRowReseteando(null); setResetPass(''); setResetUserName(''); setResetMsg(''); };
  const confirmarReset = async () => {
    if (!rowReseteando) return;
    if (!resetPass || resetPass.length < 6) { setResetMsg('La nueva contraseña debe tener al menos 6 caracteres'); return; }
    const hasUserId = !!rowReseteando.usuario_id;
    if (!hasUserId && !resetUserName) { setResetMsg('Ingresa el username del asesor si no está vinculado'); return; }
    setDoingReset(true); setResetMsg('');
    try {
      const payload = hasUserId ? { usuarioId: Number(rowReseteando.usuario_id), newPassword: resetPass } : { username: resetUserName, newPassword: resetPass };
      const res = await resetPasswordAsesorAdmin(payload);
      setResetMsg(res?.data?.message || 'Contraseña actualizada');
      setTimeout(() => cerrarModalReset(), 700);
    } catch (e) {
      setResetMsg(e?.response?.data?.message || 'Error al actualizar contraseña');
    } finally { setDoingReset(false); }
  };

  // --- Cambiar estatus (modal) ---
  const abrirModalStatus = (row) => { setRowEditandoStatus(row); setStatusModalOpen(true); };
  const cerrarModalStatus = () => { setStatusModalOpen(false); setRowEditandoStatus(null); };
  const seleccionarStatus = async (nuevo) => {
    if (!rowEditandoStatus) return;
    await cambiarStatus(rowEditandoStatus, nuevo);
    // cambiarStatus ya actualiza estado y abre modal de grupos si corresponde
    cerrarModalStatus();
  };

  const toggleGrupo = (g) => {
    setGruposSeleccionados(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  };

  const guardarGrupos = async () => {
    if (!rowAsignando) return;
    if (!gruposSeleccionados.length) { alert('Agrega al menos un grupo'); return; }
    setSavingGrupos(true);
    try {
      await api.put(`/asesores/perfil/${rowAsignando.id}/grupos`, { grupos: gruposSeleccionados });
      // Actualizar en lista
      setLista(prev => prev.map(r => r.id === rowAsignando.id ? { ...r, grupos_asesor: gruposSeleccionados, grupo_asesor: gruposSeleccionados[0] } : r));
      cerrarModal();
    } catch (e) {
      alert(e?.response?.data?.message || 'Error guardando grupos');
    } finally { setSavingGrupos(false); }
  };
  // cambiar estatus
  const cambiarStatus = async (row, nuevo) => {
    if (!nuevo || row.status === nuevo) return;
    setSavingId(row.id);
    try {
      await api.put(`/asesores/preregistro/${row.id}/status`, { status: nuevo });
      let updated;
      setLista(prev => prev.map(r => {
        if (r.id === row.id) { updated = { ...r, status: nuevo }; return updated; }
        return r;
      }));
      if (nuevo === 'completed') {
        // Abrir asignación de grupos inmediatamente tras aprobar
        setTimeout(() => abrirModalGrupos(updated), 50);
      }
    } catch (e) {
      alert(e?.response?.data?.message || 'Error actualizando status');
    } finally { setSavingId(null); }
  };

  const fuente = vista === 'aprobados' ? aprobados : pendientes;
  const filtrados = useMemo(() => {
    if (!debounced) return fuente;
    return fuente.filter(r => (r.nombres + ' ' + r.apellidos).toLowerCase().includes(debounced) || r.correo.toLowerCase().includes(debounced));
  }, [fuente, debounced]);

  const titulo = vista === 'aprobados' ? 'Solicitudes Aprobadas' : 'Solicitudes Pendientes';
  const STATUSES = ['pending', 'testing', 'completed', 'rejected'];

  // Badge de status
  const statusBadge = (status) => {
    const base = 'px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide shadow-sm';
    switch (status) {
      case 'completed': return <span className={base + ' bg-green-100 text-green-700 border border-green-200'}>completed</span>;
      case 'testing': return <span className={base + ' bg-blue-100 text-blue-700 border border-blue-200'}>testing</span>;
      case 'pending': return <span className={base + ' bg-yellow-100 text-yellow-700 border border-yellow-200'}>pending</span>;
      case 'rejected': return <span className={base + ' bg-red-100 text-red-700 border border-red-200'}>rejected</span>;
      default: return <span className={base + ' bg-gray-100 text-gray-600 border border-gray-200'}>{status || '—'}</span>;
    }
  };

  return (
    <div className="w-full">
      {/* Barra de tabs al inicio */}
      <div className="mb-5">
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg rounded-3xl px-4 py-3 flex items-center gap-4 w-full max-w-xl mx-auto justify-center">
          <button
            onClick={() => setVista('pendientes')}
            className={`relative px-5 sm:px-7 h-11 rounded-2xl font-semibold text-[13px] sm:text-sm flex items-center gap-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-400/50 ${vista === 'pendientes' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-[1.02]' : 'bg-gray-100 text-gray-700 hover:bg-orange-100'}`}
          >
            <span className="flex items-center justify-center w-5 h-5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </span>
            <span>Pendientes ({pendientes.length})</span>
          </button>
          <button
            onClick={() => setVista('aprobados')}
            className={`relative px-5 sm:px-7 h-11 rounded-2xl font-semibold text-[13px] sm:text-sm flex items-center gap-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400/50 ${vista === 'aprobados' ? 'bg-green-500 text-white shadow-lg shadow-green-500/30 scale-[1.02]' : 'bg-gray-100 text-gray-700 hover:bg-green-100'}`}
          >
            <span className="flex items-center justify-center w-5 h-5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </span>
            <span>Aprobados ({aprobados.length})</span>
          </button>
        </div>
      </div>
      {/* Métricas */}
      <MetricsBar pendientes={pendientes.length} aprobados={aprobados.length} total={lista.length} recargar={cargar} loading={loading} />

      {/* Header + búsqueda */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden w-full">
        <div className="px-3 xs:px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-gray-800">{titulo}</h3>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar por nombre o correo" className="w-full sm:w-72 pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              {busqueda && <button onClick={() => setBusqueda('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label="Limpiar">✕</button>}
            </div>
            <button onClick={cargar} className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors">Refrescar</button>
            <button
              onClick={copyTestLink}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 border ${copied
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-500 shadow-sm'
                }`}
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span>¡Link Copiado!</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                  <span>Copiar Link</span>
                </>
              )}
            </button>
            <button
              onClick={() => setWaModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-[#25D366] text-white hover:bg-[#128C7E] shadow-sm border border-[#075E54] transition-all duration-300"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
              <span>WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Tabla: hasta 1920px table-fixed para llenar ancho (monitores chicos) */}
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-0 min-[1920px]:min-w-[1100px] text-[11px] xs:text-xs sm:text-sm table-fixed min-[1920px]:table-auto">
            <thead>
              <tr className="bg-gray-900 text-white select-none">
                <th className="px-4 py-3 text-left font-semibold tracking-wide text-[10px] xs:text-[11px] sm:text-xs uppercase whitespace-nowrap border-r border-[#1f2937] w-[6%] min-[1920px]:w-auto">ID</th>
                <th className="px-4 py-3 text-left font-semibold tracking-wide text-[10px] xs:text-[11px] sm:text-xs uppercase whitespace-nowrap border-r border-[#1f2937] w-[14%] min-[1920px]:w-auto">Nombre</th>
                <th className="px-4 py-3 text-left font-semibold tracking-wide text-[10px] xs:text-[11px] sm:text-xs uppercase whitespace-nowrap border-r border-[#1f2937] w-[16%] min-[1920px]:w-auto">Correo</th>
                <th className="px-4 py-3 text-left font-semibold tracking-wide text-[10px] xs:text-[11px] sm:text-xs uppercase whitespace-nowrap border-r border-[#1f2937] w-[10%] min-[1920px]:w-auto">Área</th>
                <th className="px-4 py-3 text-left font-semibold tracking-wide text-[10px] xs:text-[11px] sm:text-xs uppercase whitespace-nowrap border-r border-[#1f2937] w-[18%] min-[1920px]:w-auto">Grupos</th>
                <th className="px-4 py-3 text-left font-semibold tracking-wide text-[10px] xs:text-[11px] sm:text-xs uppercase whitespace-nowrap border-r border-[#1f2937] w-[10%] min-[1920px]:w-auto">Status</th>
                <th className="px-4 py-3 text-left font-semibold tracking-wide text-[10px] xs:text-[11px] sm:text-xs uppercase whitespace-nowrap border-r border-[#1f2937] w-[12%] min-[1920px]:w-auto">Fecha</th>
                <th className="px-4 py-3 text-left font-semibold tracking-wide text-[10px] xs:text-[11px] sm:text-xs uppercase whitespace-nowrap border-r border-[#1f2937] last:border-r-0 w-[14%] min-[1920px]:w-auto">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {loading && (
                <tr><td colSpan={8} className="px-6 py-10 text-center text-sm text-indigo-600 animate-pulse">Cargando solicitudes...</td></tr>
              )}
              {!loading && filtrados.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <div className={`w-12 xs:w-16 h-12 xs:h-16 rounded-full flex items-center justify-center mb-3 xs:mb-4 ${vista === 'aprobados' ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 xs:h-8 w-6 xs:w-8 ${vista === 'aprobados' ? 'text-green-400' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      <p className="text-sm xs:text-base font-medium mb-1 xs:mb-2">{vista === 'aprobados' ? 'No hay aprobados' : 'No hay solicitudes pendientes'}</p>
                      <p className="text-[11px] xs:text-xs text-gray-500 px-4">{vista === 'aprobados' ? 'Las solicitudes aprobadas aparecerán aquí' : 'Las solicitudes aparecerán aquí cuando se registren'}</p>
                    </div>
                  </td>
                </tr>
              )}
              {filtrados.map((r, idx) => {
                const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60';
                return (
                  <tr key={r.id} className={`transition-colors hover:bg-gray-50 ${rowBg}`}>
                    <td className="px-4 py-2 font-mono text-blue-600 font-medium">{r.id}</td>
                    <td
                      className={`px-4 py-2 text-gray-800 font-medium ${r.status === 'completed' ? 'cursor-pointer hover:underline decoration-indigo-400 underline-offset-4' : ''}`}
                      onClick={() => abrirModalReset(r)}
                      title={r.status === 'completed' ? 'Click para resetear contraseña' : ''}
                    >{r.nombres} {r.apellidos}</td>
                    <td className="px-4 py-2 text-gray-600">{r.correo}</td>
                    <td className="px-4 py-2 text-gray-600">{r.area || '—'}</td>
                    <td
                      className={`px-4 py-2 text-gray-700 space-y-1 ${r.status === 'completed' ? 'cursor-pointer hover:bg-indigo-50/50 transition-colors rounded-md' : ''}`}
                      onClick={() => { if (r.status === 'completed') abrirModalGrupos(r); }}
                      title={r.status === 'completed' ? 'Click para asignar/editar grupos' : ''}
                    >
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(r.grupos_asesor) && r.grupos_asesor.length ? r.grupos_asesor.map(g => (
                          <span key={g} className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-[10px] font-medium border border-indigo-200 shadow-sm">{g}</span>
                        )) : (r.grupo_asesor ? <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-[10px] font-medium border border-indigo-200 shadow-sm">{r.grupo_asesor}</span> : <span className="text-gray-400 text-[11px]">{r.status === 'completed' ? 'Click para asignar' : '—'}</span>)}
                      </div>
                    </td>
                    <td
                      className="px-4 py-2 space-y-1 cursor-pointer hover:bg-indigo-50/50 transition-colors rounded-md"
                      onClick={() => abrirModalStatus(r)}
                      title="Click para cambiar estatus"
                    >
                      <div className="inline-flex items-center gap-1">
                        {statusBadge(r.status)}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-gray-600 text-[11px]">{/* Fecha placeholder si existiera created_at */}{r.created_at ? new Date(r.created_at).toLocaleDateString('es-MX') : '—'}</td>
                    <td className="px-4 py-2 text-[10px] xs:text-xs">{savingId === r.id ? <span className="text-indigo-600 animate-pulse font-medium">Guardando...</span> : <span className="text-green-600 font-semibold">OK</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {error && <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div>}

      {resetOpen && (
        <ModalResetPassword
          onClose={cerrarModalReset}
          row={rowReseteando}
          newPassword={resetPass}
          setNewPassword={setResetPass}
          username={resetUserName}
          setUsername={setResetUserName}
          doing={doingReset}
          message={resetMsg}
          onConfirm={confirmarReset}
        />
      )}

      {waModalOpen && (
        <ModalWhatsAppShare
          onClose={() => setWaModalOpen(false)}
          value={waNumber}
          onChange={setWaNumber}
          onShare={handleWhatsAppShare}
        />
      )}

      {modalOpen && (
        <ModalAsignarGrupos
          onClose={cerrarModal}
          row={rowAsignando}
          gruposDisponibles={gruposDisponibles}
          gruposSeleccionados={gruposSeleccionados}
          toggleGrupo={toggleGrupo}
          guardar={guardarGrupos}
          loadingCatalogo={gruposLoading}
          saving={savingGrupos}
        />
      )}
      {statusModalOpen && (
        <ModalCambiarStatus
          onClose={cerrarModalStatus}
          row={rowEditandoStatus}
          statuses={STATUSES}
          current={rowEditandoStatus?.status}
          onSelect={seleccionarStatus}
          saving={savingId === rowEditandoStatus?.id}
        />
      )}
    </div>
  );
}

// Barra de métricas resumidas
function MetricsBar({ total, pendientes, aprobados, recargar, loading }) {
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  useEffect(() => { setLastUpdated(Date.now()); }, [total, pendientes, aprobados]);
  const fmt = (ts) => new Date(ts).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const cards = [
    { label: 'Total', value: total, color: 'indigo' },
    { label: 'Pendientes', value: pendientes, color: 'orange' },
    { label: 'Aprobados', value: aprobados, color: 'green' },
    { label: 'Última actualización', value: fmt(lastUpdated), color: 'sky', isTime: true }
  ];
  return (
    <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map(c => (
        <div key={c.label} className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm px-3 py-3 flex flex-col gap-1">
          <span className="text-[10px] font-medium tracking-wide text-gray-500 uppercase">{c.label}</span>
          <span className={`text-lg font-semibold ${c.isTime ? 'font-mono text-gray-700' : 'text-gray-800'}`}>{c.value}</span>
          <span className={`absolute inset-x-0 bottom-0 h-1 bg-${c.color}-100`}>
            <span className={`block h-full bg-${c.color}-500/70 w-full`}></span>
          </span>
        </div>
      ))}
    </div>
  );
}

// Modal reutilizable para asignar grupos al asesor aprobado (reutilizable si es que creas un componente aparte)
function ModalAsignarGrupos({ onClose, row, gruposDisponibles, gruposSeleccionados, toggleGrupo, guardar, loadingCatalogo, saving }) {
  if (!row) return null;
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-gray-200 flex flex-col max-h-[80vh]">
        <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">Asignar grupos a <span className="text-indigo-600">{row.nombres} {row.apellidos}</span></h2>
          <button onClick={onClose} className="p-1.5 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100" aria-label="Cerrar">✕</button>
        </div>
        <div className="px-5 py-4 overflow-y-auto flex-1 space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed">Selecciona uno o varios grupos existentes.</p>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-800">Grupos disponibles {loadingCatalogo && <span className="text-[11px] text-indigo-600 ml-1 animate-pulse">cargando...</span>}</h3>
              <span className="text-[11px] text-gray-500">Click para (des)seleccionar</span>
            </div>
            <div className="border rounded-lg p-2.5 bg-gray-50 max-h-40 overflow-y-auto flex flex-wrap gap-2">
              {gruposDisponibles.length === 0 && !loadingCatalogo && (
                <span className="text-[12px] text-gray-500">No hay grupos listados todavía.</span>
              )}
              {gruposDisponibles.map(g => {
                const active = gruposSeleccionados.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGrupo(g)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-medium border transition-colors ${active ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'}`}
                  >{g}</button>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Seleccionados</h3>
            <div className="min-h-[40px] border rounded-lg p-2.5 flex flex-wrap gap-2 bg-white">
              {gruposSeleccionados.length === 0 && <span className="text-[12px] text-gray-400">Ninguno aún</span>}
              {gruposSeleccionados.map(g => (
                <span key={g} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-[10px] font-medium border border-indigo-200">
                  {g}
                  <button onClick={() => toggleGrupo(g)} className="text-indigo-500 hover:text-indigo-700" title="Quitar">×</button>
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="px-5 py-3 border-t border-gray-200 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between bg-gray-50 rounded-b-xl">
          <div className="text-[11px] text-gray-500">Debe haber al menos un grupo para guardar.</div>
          <div className="flex items-center gap-3">
            <button onClick={onClose} type="button" className="px-3.5 py-1.5 text-sm font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-100 text-gray-600">Omitir</button>
            <button disabled={saving} onClick={guardar} type="button" className="px-4 py-1.5 text-sm font-semibold rounded-lg bg-indigo-600 text-white shadow hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 flex items-center gap-2">
              {saving && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
}

// Modal simple para cambiar el estatus del preregistro
function ModalCambiarStatus({ onClose, row, statuses, current, onSelect, saving }) {
  if (!row) return null;
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Cambiar estatus de <span className="text-indigo-600">{row.nombres} {row.apellidos}</span></h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100" aria-label="Cerrar">✕</button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-gray-600">Selecciona el nuevo estatus. El actual es:
            <span className="ml-2 align-middle">{current && (
              <span className="inline-block align-middle">{ /* reutilizamos badge */}</span>
            )}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {statuses.map(s => (
              <button
                key={s}
                type="button"
                disabled={saving || s === current}
                onClick={() => onSelect(s)}
                className={`px-3 py-1 rounded-full text-[12px] font-medium border transition-colors ${s === current ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-default' :
                  s === 'completed' ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' :
                    s === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100' :
                      s === 'testing' ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' :
                        'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                  }`}
              >{s}</button>
            ))}
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} type="button" className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-100 text-gray-600">Cerrar</button>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
}

// Modal para resetear contraseña del asesor
function ModalResetPassword({ onClose, row, newPassword, setNewPassword, username, setUsername, doing, message, onConfirm }) {
  if (!row) return null;
  const needsUsername = !row.usuario_id;
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Resetear contraseña</h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100" aria-label="Cerrar">✕</button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-gray-700">Asesor: <span className="font-medium text-indigo-700">{row.nombres} {row.apellidos}</span></p>
          {needsUsername && (
            <div>
              <label className="block text-[11px] text-gray-600 mb-1">Username del asesor</label>
              <input value={username} onChange={e => setUsername(e.target.value)} placeholder="p.ej. asesor.juan" className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500" />
              <p className="text-[11px] text-gray-500 mt-1">Este preregistro aún no está vinculado a un usuario; ingresa el username existente.</p>
            </div>
          )}
          <div>
            <label className="block text-[11px] text-gray-600 mb-1">Nueva contraseña</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
          {message && <div className="text-[12px] text-gray-700">{message}</div>}
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end bg-gray-50 rounded-b-2xl gap-3">
          <button onClick={onClose} type="button" className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-100 text-gray-600">Cancelar</button>
          <button onClick={onConfirm} disabled={doing} type="button" className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white shadow hover:bg-indigo-500 disabled:opacity-50">{doing ? 'Guardando...' : 'Confirmar'}</button>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
}

// Modal para compartir link por WhatsApp
function ModalWhatsAppShare({ onClose, value, onChange, onShare }) {
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
            </div>
            <h2 className="text-lg font-bold text-gray-800">Enviar por WhatsApp</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">✕</button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            Ingresa el número de WhatsApp (con lada, ej: 521234567890) para enviar el link de invitacion.
          </p>
          <div className="relative">
            <input
              type="tel"
              value={value}
              onChange={e => onChange(e.target.value)}
              placeholder="Ej: 521234567890"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && onShare()}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">📱</span>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3 bg-gray-50/50 rounded-b-2xl">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
            Cancelar
          </button>
          <button
            onClick={onShare}
            disabled={!value}
            className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-[#25D366] rounded-xl hover:bg-[#128C7E] disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-green-200 transition-all"
          >
            Enviar Link
          </button>
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
}
