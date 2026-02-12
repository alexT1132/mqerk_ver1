import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMisEstudiantes } from '../../api/asesores.js';
import { registrarAsistenciasMasivas, getAsistenciasPorAsesor, eliminarAsistencia } from '../../api/asistencias.js';
import { CheckCircle, XCircle, Calendar, Users, Save, ArrowLeft, AlertCircle, History, BarChart3, Download, Filter, Search, Trash2, Eye, ClipboardCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function RegistroAsistencia() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('registro'); // registro, historial, estadisticas

  // Estados comunes
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para registro
  const [estudiantes, setEstudiantes] = useState([]);
  const [asistencias, setAsistencias] = useState({});
  const [fecha, setFecha] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [tipo, setTipo] = useState('clase');
  const [saving, setSaving] = useState(false);

  // Estados para historial
  const [historial, setHistorial] = useState([]);
  const [filtros, setFiltros] = useState({
    desde: '',
    hasta: '',
    tipo: '',
    id_estudiante: '',
    grupo: ''
  });
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [ultimaFechaGuardada, setUltimaFechaGuardada] = useState(null); // Para recordar la última fecha guardada

  // Cargar estudiantes
  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const { data } = await getMisEstudiantes();
        if (!alive) return;
        const list = Array.isArray(data?.data) ? data.data : [];

        // Obtener grupos del asesor
        const asesorGroups = user?.grupo_asesor ? (Array.isArray(user.grupo_asesor) ? user.grupo_asesor : [user.grupo_asesor]) : [];

        const filtered = list.filter(s => {
          const estatus = s.estatus || 'Activo';
          // Filtrar también por grupo si el asesor tiene grupos asignados
          const perteneceAGrupo = asesorGroups.length === 0 || asesorGroups.includes(s.grupo);
          return estatus === 'Activo' && perteneceAGrupo;
        });
        setEstudiantes(filtered);

        // Inicializar asistencias como presente por defecto
        const initialAsistencias = {};
        filtered.forEach(s => {
          initialAsistencias[s.id] = { asistio: true, observaciones: '' };
        });
        setAsistencias(initialAsistencias);
      } catch (e) {
        if (!alive) return;
        setError(e?.response?.data?.message || e?.message || 'Error al cargar estudiantes');
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, []);

  // Cargar historial cuando se cambia a esa tab
  useEffect(() => {
    if (activeTab === 'historial') {
      // Si hay una fecha recién guardada, usarla para los filtros y cargar inmediatamente
      if (ultimaFechaGuardada) {
        const nuevosFiltros = {
          desde: ultimaFechaGuardada,
          hasta: ultimaFechaGuardada,
          tipo: '',
          grupo: '',
          id_estudiante: ''
        };
        setFiltros(nuevosFiltros);
        // Limpiar la fecha guardada después de usarla
        setUltimaFechaGuardada(null);
        // Cargar inmediatamente con los nuevos filtros
        setTimeout(() => {
          cargarHistorial(nuevosFiltros);
        }, 100);
        return;
      }

      // Si no hay filtros configurados, establecer filtros por defecto para mostrar registros recientes
      const hasAnyFilter = filtros.desde || filtros.hasta || filtros.tipo || filtros.grupo || filtros.id_estudiante;
      if (!hasAnyFilter) {
        const hoy = new Date();
        const hace30Dias = new Date();
        hace30Dias.setDate(hace30Dias.getDate() - 30);
        const filtrosPorDefecto = {
          desde: hace30Dias.toISOString().split('T')[0],
          hasta: hoy.toISOString().split('T')[0],
          tipo: '',
          grupo: '',
          id_estudiante: ''
        };
        setFiltros(filtrosPorDefecto);
        // Cargar inmediatamente con los filtros por defecto
        setTimeout(() => {
          cargarHistorial(filtrosPorDefecto);
        }, 100);
        return;
      }
      // Si ya hay filtros, cargar directamente
      cargarHistorial();
    }
  }, [activeTab, ultimaFechaGuardada]);

  // Recargar historial cuando cambian los filtros (solo si estamos en la tab de historial)
  const prevFiltrosRef = React.useRef(JSON.stringify(filtros));
  useEffect(() => {
    if (activeTab === 'historial') {
      const filtrosActualesStr = JSON.stringify(filtros);
      const filtrosChanged = prevFiltrosRef.current !== filtrosActualesStr;

      if (filtrosChanged) {
        prevFiltrosRef.current = filtrosActualesStr;
        // Solo cargar si hay al menos un filtro configurado
        if (filtros.desde || filtros.hasta || filtros.tipo || filtros.grupo || filtros.id_estudiante) {
          cargarHistorial();
        }
      }
    }
  }, [activeTab, filtros.desde, filtros.hasta, filtros.tipo, filtros.grupo, filtros.id_estudiante]);

  const cargarHistorial = async (filtrosToUse = null) => {
    const filtrosActuales = filtrosToUse || filtros;
    setLoadingHistorial(true);
    setError('');
    try {
      const response = await getAsistenciasPorAsesor(filtrosActuales);

      // El backend devuelve { data: [...] } según el controlador
      // response.json() devuelve el objeto parseado, así que response ya es { data: [...] }
      const registros = Array.isArray(response?.data) ? response.data : [];

      setHistorial(registros);
    } catch (e) {
      console.error('[RegistroAsistencia] Error al cargar historial:', e);
      setError(e?.message || 'Error al cargar historial');
    } finally {
      setLoadingHistorial(false);
    }
  };

  const handleAsistenciaChange = (idEstudiante, asistio) => {
    setAsistencias(prev => ({
      ...prev,
      [idEstudiante]: {
        ...prev[idEstudiante],
        asistio
      }
    }));
  };

  const handleObservacionesChange = (idEstudiante, observaciones) => {
    setAsistencias(prev => ({
      ...prev,
      [idEstudiante]: {
        ...prev[idEstudiante],
        observaciones
      }
    }));
  };

  const handleGuardar = async () => {
    if (!fecha) {
      setError('Debes seleccionar una fecha');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const asistenciasArray = Object.entries(asistencias).map(([id_estudiante, data]) => ({
        id_estudiante: Number(id_estudiante),
        asistio: data.asistio,
        observaciones: data.observaciones || null
      }));

      await registrarAsistenciasMasivas({
        fecha,
        tipo,
        asistencias: asistenciasArray
      });

      setSuccess('Asistencias registradas correctamente');

      // Guardar la fecha para que cuando se cambie a historial, se muestre automáticamente
      setUltimaFechaGuardada(fecha);

      // Si estamos en la tab de historial, recargar automáticamente
      if (activeTab === 'historial') {
        // Actualizar filtros para mostrar la fecha recién guardada
        setFiltros(prev => ({
          ...prev,
          desde: fecha,
          hasta: fecha
        }));
        // Recargar historial después de un pequeño delay para asegurar que el backend haya guardado
        setTimeout(() => {
          cargarHistorial();
        }, 500);
      }

      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Error al guardar asistencias');
    } finally {
      setSaving(false);
    }
  };

  const marcarTodosPresentes = () => {
    const nuevasAsistencias = {};
    estudiantes.forEach(s => {
      nuevasAsistencias[s.id] = { asistio: true, observaciones: asistencias[s.id]?.observaciones || '' };
    });
    setAsistencias(nuevasAsistencias);
  };

  const marcarTodosAusentes = () => {
    const nuevasAsistencias = {};
    estudiantes.forEach(s => {
      nuevasAsistencias[s.id] = { asistio: false, observaciones: asistencias[s.id]?.observaciones || '' };
    });
    setAsistencias(nuevasAsistencias);
  };

  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  const handleEliminarAsistencia = async (id) => {
    setConfirmDelete({ open: true, id });
  };

  const confirmarEliminar = async () => {
    if (!confirmDelete.id) return;

    try {
      await eliminarAsistencia(confirmDelete.id);
      setSuccess('Asistencia eliminada correctamente');
      cargarHistorial();
      setTimeout(() => setSuccess(''), 3000);
      setConfirmDelete({ open: false, id: null });
    } catch (e) {
      setError(e?.message || 'Error al eliminar asistencia');
      setConfirmDelete({ open: false, id: null });
    }
  };

  const exportarCSV = () => {
    if (historial.length === 0) {
      setError('No hay datos para exportar');
      return;
    }

    const headers = ['Fecha', 'Estudiante', 'Grupo', 'Tipo', 'Asistió', 'Observaciones'];
    const rows = historial.map(h => [
      h.fecha || '',
      `${h.estudiante_nombre || ''} ${h.estudiante_apellidos || ''}`.trim(),
      h.estudiante_grupo || '',
      h.tipo || '',
      h.asistio ? 'Sí' : 'No',
      h.observaciones || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `asistencias_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  const totalEstudiantes = estudiantes.length;
  const presentes = Object.values(asistencias).filter(a => a?.asistio).length;
  const ausentes = totalEstudiantes - presentes;

  // Calcular estadísticas del historial
  const totalRegistros = historial.length;
  const totalPresentes = historial.filter(h => h.asistio).length;
  const totalAusentes = totalRegistros - totalPresentes;
  const porcentajeAsistencia = totalRegistros > 0 ? ((totalPresentes / totalRegistros) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen relative p-4 sm:p-6 lg:p-8">
      <div className="fixed inset-0 bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 -z-50"></div>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 rounded-xl hover:bg-slate-100 transition-all duration-200 hover:scale-110 active:scale-100 ring-2 ring-slate-200 hover:ring-slate-300"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div className="flex items-center gap-4 flex-1">
              <div className="p-4 rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-xl ring-2 ring-violet-200">
                <ClipboardCheck className="size-8 sm:size-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-2 tracking-tight leading-tight">
                  <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent inline-block" style={{ lineHeight: '1.2', paddingBottom: '0.2em' }}>
                    Registro de Asistencia
                  </span>
                </h1>
                <p className="text-slate-600 text-sm sm:text-base font-medium">Gestiona la asistencia de tus estudiantes</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b-2 border-slate-200">
            <button
              onClick={() => setActiveTab('registro')}
              className={`px-6 py-4 font-bold transition-all duration-200 relative flex items-center gap-2 ${activeTab === 'registro'
                ? 'text-violet-600 border-b-3 border-violet-600 bg-slate-50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
            >
              <Calendar className={`w-5 h-5 ${activeTab === 'registro' ? 'text-violet-600' : ''}`} />
              Registrar
            </button>
            <button
              onClick={() => setActiveTab('historial')}
              className={`px-6 py-4 font-bold transition-all duration-200 relative flex items-center gap-2 ${activeTab === 'historial'
                ? 'text-violet-600 border-b-3 border-violet-600 bg-slate-50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
            >
              <History className={`w-5 h-5 ${activeTab === 'historial' ? 'text-violet-600' : ''}`} />
              Historial
            </button>
            <button
              onClick={() => setActiveTab('estadisticas')}
              className={`px-6 py-4 font-bold transition-all duration-200 relative flex items-center gap-2 ${activeTab === 'estadisticas'
                ? 'text-violet-600 border-b-3 border-violet-600 bg-slate-50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
            >
              <BarChart3 className={`w-5 h-5 ${activeTab === 'estadisticas' ? 'text-violet-600' : ''}`} />
              Estadísticas
            </button>
          </div>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 text-red-700 px-5 py-4 rounded-2xl mb-6 flex items-center gap-3 shadow-lg ring-2 ring-red-100">
            <div className="p-2 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-md">
              <AlertCircle className="w-5 h-5" />
            </div>
            <span className="font-bold">{error}</span>
            <button
              onClick={() => setError('')}
              className="ml-auto p-1 rounded-lg hover:bg-red-100 transition-colors"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 text-green-700 px-5 py-4 rounded-2xl mb-6 flex items-center gap-3 shadow-lg ring-2 ring-green-100">
            <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md">
              <CheckCircle className="w-5 h-5" />
            </div>
            <span className="font-bold">{success}</span>
            <button
              onClick={() => setSuccess('')}
              className="ml-auto p-1 rounded-lg hover:bg-green-100 transition-colors"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Vista de Registro */}
        {activeTab === 'registro' && (
          <VistaRegistro
            fecha={fecha}
            setFecha={setFecha}
            tipo={tipo}
            setTipo={setTipo}
            estudiantes={estudiantes}
            asistencias={asistencias}
            totalEstudiantes={totalEstudiantes}
            presentes={presentes}
            ausentes={ausentes}
            handleAsistenciaChange={handleAsistenciaChange}
            handleObservacionesChange={handleObservacionesChange}
            marcarTodosPresentes={marcarTodosPresentes}
            marcarTodosAusentes={marcarTodosAusentes}
            handleGuardar={handleGuardar}
            saving={saving}
          />
        )}

        {/* Vista de Historial */}
        {activeTab === 'historial' && (
          <VistaHistorial
            historial={historial}
            filtros={filtros}
            setFiltros={setFiltros}
            cargarHistorial={cargarHistorial}
            loadingHistorial={loadingHistorial}
            handleEliminarAsistencia={handleEliminarAsistencia}
            exportarCSV={exportarCSV}
            estudiantes={estudiantes}
            user={user}
          />
        )}

        {/* Vista de Estadísticas */}
        {activeTab === 'estadisticas' && (
          <VistaEstadisticas
            historial={historial}
            estudiantes={estudiantes}
            totalRegistros={totalRegistros}
            totalPresentes={totalPresentes}
            totalAusentes={totalAusentes}
            porcentajeAsistencia={porcentajeAsistencia}
          />
        )}

        {/* Modal de confirmación */}
        {confirmDelete.open && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmDelete({ open: false, id: null })} />
            <div className="relative bg-white rounded-3xl shadow-2xl border-2 border-slate-200 p-6 max-w-md w-full z-[201] ring-4 ring-violet-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg ring-2 ring-rose-200">
                  <AlertCircle className="size-6" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">Eliminar registro</h3>
              </div>
              <p className="text-slate-600 mb-6 font-medium">¿Estás seguro de eliminar este registro de asistencia? Esta acción no se puede deshacer.</p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setConfirmDelete({ open: false, id: null })}
                  className="px-5 py-2.5 rounded-xl border-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-bold transition-all duration-200 hover:scale-105 active:scale-100"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarEliminar}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-100 ring-2 ring-rose-200 hover:ring-rose-300"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente Vista de Registro
function VistaRegistro({
  fecha, setFecha, tipo, setTipo, estudiantes, asistencias,
  totalEstudiantes, presentes, ausentes,
  handleAsistenciaChange, handleObservacionesChange,
  marcarTodosPresentes, marcarTodosAusentes, handleGuardar, saving
}) {
  return (
    <>
      {/* Configuración */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl ring-2 ring-slate-100/50 p-6 sm:p-7 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-extrabold text-slate-700 mb-3 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md">
                <Calendar className="w-4 h-4" />
              </div>
              Fecha de la clase
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-violet-500/30 focus:border-violet-500 transition-all shadow-sm hover:shadow-md font-medium"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label className="block text-sm font-extrabold text-slate-700 mb-3 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md">
                <Users className="w-4 h-4" />
              </div>
              Tipo de actividad
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-violet-500/30 focus:border-violet-500 transition-all shadow-sm hover:shadow-md font-medium bg-white"
            >
              <option value="clase">Clase</option>
              <option value="tarea">Tarea</option>
              <option value="simulacion">Simulación</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resumen */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl shadow-lg p-6 sm:p-7 mb-6 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 rounded-xl bg-white/10 backdrop-blur-sm">
            <div className="text-4xl font-extrabold mb-2">{totalEstudiantes}</div>
            <div className="text-sm font-semibold opacity-90">Total estudiantes</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-white/10 backdrop-blur-sm">
            <div className="text-4xl font-extrabold mb-2">{presentes}</div>
            <div className="text-sm font-semibold opacity-90">Presentes</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-red-500/30 backdrop-blur-sm border-2 border-red-400/50">
            <div className="text-4xl font-extrabold mb-2">{ausentes}</div>
            <div className="text-sm font-semibold opacity-90">Ausentes</div>
          </div>
        </div>
      </div>

      {/* Botones de acción rápida */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={marcarTodosPresentes}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <CheckCircle className="w-5 h-5" />
          Marcar todos presentes
        </button>
        <button
          onClick={marcarTodosAusentes}
          className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <XCircle className="w-5 h-5" />
          Marcar todos ausentes
        </button>
      </div>

      {/* Tabla de estudiantes */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl ring-2 ring-slate-100/50 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide">Estudiante</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wide">Grupo</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wide">Asistencia</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide">Observaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-200">
              {estudiantes.map((estudiante) => {
                const nombreCompleto = `${estudiante.nombres || estudiante.nombre || ''} ${estudiante.apellidos || ''}`.trim() || estudiante.email || `Estudiante ${estudiante.id}`;
                const asistencia = asistencias[estudiante.id] || { asistio: true, observaciones: '' };

                return (
                  <tr key={estudiante.id} className="hover:bg-gradient-to-r hover:from-violet-50/30 hover:to-indigo-50/30 transition-all duration-200">
                    <td className="px-6 py-5 whitespace-nowrap border-r-2 border-slate-200">
                      <div className="text-sm font-bold text-slate-900">{nombreCompleto}</div>
                      {estudiante.email && (
                        <div className="text-xs text-slate-500 font-medium">{estudiante.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center border-r-2 border-slate-200">
                      <span className="px-3 py-1 text-xs font-semibold bg-violet-100 text-violet-700 rounded-full">
                        {estudiante.grupo || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center border-r-2 border-slate-200">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleAsistenciaChange(estudiante.id, true)}
                          className={`p-2.5 rounded-lg transition-all ${asistencia.asistio
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                            }`}
                          title="Presente"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleAsistenciaChange(estudiante.id, false)}
                          className={`p-2.5 rounded-lg transition-all ${!asistencia.asistio
                            ? 'bg-slate-600 text-white shadow-md'
                            : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                            }`}
                          title="Ausente"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <input
                        type="text"
                        value={asistencia.observaciones || ''}
                        onChange={(e) => handleObservacionesChange(estudiante.id, e.target.value)}
                        placeholder="Observaciones (opcional)"
                        className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-violet-500/30 focus:border-violet-500 text-sm transition-all shadow-sm hover:shadow-md font-medium"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Botón guardar */}
      <div className="flex justify-end">
        <button
          onClick={handleGuardar}
          disabled={saving || totalEstudiantes === 0}
          className="px-8 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Guardando...' : 'Guardar asistencias'}
        </button>
      </div>
    </>
  );
}

// Componente Vista de Historial
function VistaHistorial({
  historial, filtros, setFiltros, cargarHistorial, loadingHistorial,
  handleEliminarAsistencia, exportarCSV, estudiantes, user
}) {
  // Obtener grupos del asesor para el filtro
  const asesorGroups = user?.grupo_asesor ? (Array.isArray(user.grupo_asesor) ? user.grupo_asesor : [user.grupo_asesor]) : [];
  const gruposDisponibles = asesorGroups.length > 0 ? asesorGroups : ["m1", "m2", "m3", "v1", "v2", "v3", "s1", "s2"];

  return (
    <>
      {/* Filtros */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl ring-2 ring-slate-100/50 p-6 sm:p-7 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md ring-2 ring-violet-200">
            <Filter className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">Filtros</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Desde</label>
            <input
              type="date"
              value={filtros.desde}
              onChange={(e) => setFiltros({ ...filtros, desde: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-violet-500/30 focus:border-violet-500 text-sm shadow-sm hover:shadow-md font-medium transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Hasta</label>
            <input
              type="date"
              value={filtros.hasta}
              onChange={(e) => setFiltros({ ...filtros, hasta: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-violet-500/30 focus:border-violet-500 text-sm shadow-sm hover:shadow-md font-medium transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Grupo</label>
            <select
              value={filtros.grupo}
              onChange={(e) => setFiltros({ ...filtros, grupo: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-violet-500/30 focus:border-violet-500 text-sm shadow-sm hover:shadow-md font-medium bg-white transition-all"
            >
              <option value="">Todos</option>
              {gruposDisponibles.map(g => (
                <option key={g} value={g}>Grupo {g.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Tipo</label>
            <select
              value={filtros.tipo}
              onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-violet-500/30 focus:border-violet-500 text-sm shadow-sm hover:shadow-md font-medium bg-white transition-all"
            >
              <option value="">Todos</option>
              <option value="clase">Clase</option>
              <option value="tarea">Tarea</option>
              <option value="simulacion">Simulación</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Estudiante</label>
            <select
              value={filtros.id_estudiante}
              onChange={(e) => setFiltros({ ...filtros, id_estudiante: e.target.value })}
              className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-violet-500/30 focus:border-violet-500 text-sm shadow-sm hover:shadow-md font-medium bg-white transition-all"
            >
              <option value="">Todos</option>
              {estudiantes.map(e => (
                <option key={e.id} value={e.id}>
                  {`${e.nombres || e.nombre || ''} ${e.apellidos || ''}`.trim()}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-3 lg:col-span-5 justify-end mt-2">
            <button
              onClick={cargarHistorial}
              disabled={loadingHistorial}
              className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center gap-2 transform hover:scale-105 active:scale-100 ring-2 ring-violet-200 hover:ring-violet-300"
            >
              <Search className="w-5 h-5" />
              {loadingHistorial ? 'Cargando...' : 'Buscar'}
            </button>
            <button
              onClick={exportarCSV}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 transform hover:scale-105 active:scale-100 ring-2 ring-emerald-200 hover:ring-emerald-300"
              title="Exportar a CSV"
            >
              <Download className="w-5 h-5" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de historial */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl ring-2 ring-slate-100/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide">Fecha</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide">Estudiante</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wide">Grupo</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wide">Tipo</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wide">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide">Observaciones</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-200">
              {loadingHistorial ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-violet-600"></div>
                      <p className="text-slate-600 font-bold">Cargando historial...</p>
                    </div>
                  </td>
                </tr>
              ) : historial.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-xl ring-4 ring-violet-200">
                        <History className="w-12 h-12" />
                      </div>
                      <p className="text-slate-600 font-bold text-lg">No hay registros de asistencia</p>
                      <p className="text-sm text-slate-500 font-medium">Ajusta los filtros o registra nuevas asistencias</p>
                    </div>
                  </td>
                </tr>
              ) : (
                historial.map((registro) => (
                  <tr key={registro.id} className="hover:bg-gradient-to-r hover:from-violet-50/30 hover:to-indigo-50/30 transition-all duration-200">
                    <td className="px-6 py-5 whitespace-nowrap border-r-2 border-slate-200">
                      <div className="text-sm font-bold text-slate-900">
                        {new Date(registro.fecha).toLocaleDateString('es-MX', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap border-r-2 border-slate-200">
                      <div className="text-sm font-extrabold text-slate-900">
                        {`${registro.estudiante_nombre || ''} ${registro.estudiante_apellidos || ''}`.trim()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center border-r-2 border-slate-200">
                      <span className="px-3 py-1 text-xs font-semibold bg-violet-100 text-violet-700 rounded-full">
                        {registro.estudiante_grupo || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center border-r-2 border-slate-200">
                      <span className="px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-700 rounded-full capitalize">
                        {registro.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center border-r-2 border-slate-200">
                      {registro.asistio ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-full">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Presente
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-slate-200 text-slate-700 rounded-full">
                          <XCircle className="w-3.5 h-3.5" />
                          Ausente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 border-r-2 border-slate-200">
                      <div className="text-sm text-slate-600 font-medium">{registro.observaciones || '—'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleEliminarAsistencia(registro.id)}
                        className="p-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// Componente Vista de Estadísticas
function VistaEstadisticas({
  historial, estudiantes, totalRegistros, totalPresentes, totalAusentes, porcentajeAsistencia
}) {
  // Calcular estadísticas por estudiante
  const estadisticasPorEstudiante = estudiantes.map(est => {
    const registrosEst = historial.filter(h => h.id_estudiante === est.id);
    const presentesEst = registrosEst.filter(h => h.asistio).length;
    const ausentesEst = registrosEst.length - presentesEst;
    const porcentajeEst = registrosEst.length > 0 ? ((presentesEst / registrosEst.length) * 100).toFixed(1) : 0;

    return {
      id: est.id,
      nombre: `${est.nombres || est.nombre || ''} ${est.apellidos || ''}`.trim(),
      grupo: est.grupo,
      total: registrosEst.length,
      presentes: presentesEst,
      ausentes: ausentesEst,
      porcentaje: parseFloat(porcentajeEst)
    };
  }).filter(e => e.total > 0).sort((a, b) => b.porcentaje - a.porcentaje);

  return (
    <>
      {/* Resumen general */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl ring-2 ring-slate-100/50 p-6 hover:shadow-2xl transition-all duration-200 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-extrabold text-slate-600">Total Registros</div>
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md ring-2 ring-blue-200">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-extrabold text-slate-900">{totalRegistros}</div>
        </div>

        <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl ring-2 ring-slate-100/50 p-6 hover:shadow-2xl transition-all duration-200 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-extrabold text-slate-600">Presentes</div>
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md ring-2 ring-emerald-200">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-extrabold text-emerald-600">{totalPresentes}</div>
        </div>

        <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl ring-2 ring-slate-100/50 p-6 hover:shadow-2xl transition-all duration-200 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-extrabold text-slate-600">Ausentes</div>
            <div className="p-2 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-md ring-2 ring-rose-200">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-extrabold text-rose-600">{totalAusentes}</div>
        </div>

        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl shadow-lg p-6 text-white hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold opacity-90">% Asistencia</div>
            <div className="p-2 rounded-lg bg-white/20">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold">{porcentajeAsistencia}%</div>
        </div>
      </div>

      {/* Estadísticas por estudiante */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl ring-2 ring-slate-100/50 p-6 sm:p-7">
        <h3 className="text-xl font-extrabold text-slate-900 mb-5 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md ring-2 ring-violet-200">
            <BarChart3 className="w-5 h-5" />
          </div>
          Estadísticas por Estudiante
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide">Estudiante</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wide">Grupo</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wide">Total</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wide">Presentes</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wide">Ausentes</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wide">% Asistencia</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-200">
              {estadisticasPorEstudiante.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-400 to-slate-500 text-white shadow-xl ring-4 ring-slate-200">
                        <BarChart3 className="w-12 h-12" />
                      </div>
                      <p className="text-slate-600 font-bold text-lg">No hay datos suficientes</p>
                      <p className="text-sm text-slate-500 font-medium">Registra asistencias para ver estadísticas</p>
                    </div>
                  </td>
                </tr>
              ) : (
                estadisticasPorEstudiante.map((est) => (
                  <tr key={est.id} className="hover:bg-gradient-to-r hover:from-violet-50/30 hover:to-indigo-50/30 transition-all duration-200">
                    <td className="px-6 py-5 whitespace-nowrap border-r-2 border-slate-200">
                      <div className="text-sm font-extrabold text-slate-900">{est.nombre}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center border-r-2 border-slate-200">
                      <span className="px-3 py-1 text-xs font-semibold bg-violet-100 text-violet-700 rounded-full">
                        {est.grupo || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center border-r-2 border-slate-200">
                      <div className="text-sm font-semibold text-slate-900">{est.total}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center border-r-2 border-slate-200">
                      <div className="text-sm font-semibold text-emerald-600">{est.presentes}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center border-r-2 border-slate-200">
                      <div className="text-sm font-semibold text-slate-600">{est.ausentes}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${est.porcentaje >= 80 ? 'bg-emerald-600' :
                              est.porcentaje >= 60 ? 'bg-amber-500' :
                                'bg-slate-500'
                              }`}
                            style={{ width: `${est.porcentaje}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-slate-900 min-w-[3rem]">{est.porcentaje}%</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
