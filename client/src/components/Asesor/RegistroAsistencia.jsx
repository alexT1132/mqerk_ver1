import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMisEstudiantes } from '../../api/asesores.js';
import { registrarAsistenciasMasivas, getAsistenciasPorAsesor, eliminarAsistencia } from '../../api/asistencias.js';
import { CheckCircle, XCircle, Calendar, Users, Save, ArrowLeft, AlertCircle, History, BarChart3, Download, Filter, Search, Trash2, Eye } from 'lucide-react';
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
      cargarHistorial();
    }
  }, [activeTab]);

  const cargarHistorial = async () => {
    setLoadingHistorial(true);
    setError('');
    try {
      const { data } = await getAsistenciasPorAsesor(filtros);
      setHistorial(Array.isArray(data?.data) ? data.data : []);
    } catch (e) {
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

  const handleEliminarAsistencia = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este registro de asistencia?')) return;

    try {
      await eliminarAsistencia(id);
      setSuccess('Asistencia eliminada correctamente');
      cargarHistorial();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e?.message || 'Error al eliminar asistencia');
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
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Registro de Asistencia</h1>
              <p className="text-gray-600">Gestiona la asistencia de tus estudiantes</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('registro')}
              className={`px-6 py-3 font-medium transition-all relative ${activeTab === 'registro'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Registrar
            </button>
            <button
              onClick={() => setActiveTab('historial')}
              className={`px-6 py-3 font-medium transition-all relative ${activeTab === 'historial'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <History className="w-4 h-4 inline mr-2" />
              Historial
            </button>
            <button
              onClick={() => setActiveTab('estadisticas')}
              className={`px-6 py-3 font-medium transition-all relative ${activeTab === 'estadisticas'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Estadísticas
            </button>
          </div>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2 shadow-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2 shadow-sm">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
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
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Fecha de la clase
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-2" />
              Tipo de actividad
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
            >
              <option value="clase">Clase</option>
              <option value="tarea">Tarea</option>
              <option value="simulacion">Simulación</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resumen */}
      <div className="bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600 rounded-xl shadow-lg p-6 mb-6 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold mb-1">{totalEstudiantes}</div>
            <div className="text-sm opacity-90 font-medium">Total estudiantes</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-1">{presentes}</div>
            <div className="text-sm opacity-90 font-medium">Presentes</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-1">{ausentes}</div>
            <div className="text-sm opacity-90 font-medium">Ausentes</div>
          </div>
        </div>
      </div>

      {/* Botones de acción rápida */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={marcarTodosPresentes}
          className="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          Marcar todos presentes
        </button>
        <button
          onClick={marcarTodosAusentes}
          className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <XCircle className="w-4 h-4" />
          Marcar todos ausentes
        </button>
      </div>

      {/* Tabla de estudiantes */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Estudiante</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Grupo</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Asistencia</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Observaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {estudiantes.map((estudiante) => {
                const nombreCompleto = `${estudiante.nombres || estudiante.nombre || ''} ${estudiante.apellidos || ''}`.trim() || estudiante.email || `Estudiante ${estudiante.id}`;
                const asistencia = asistencias[estudiante.id] || { asistio: true, observaciones: '' };

                return (
                  <tr key={estudiante.id} className="hover:bg-purple-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{nombreCompleto}</div>
                      {estudiante.email && (
                        <div className="text-xs text-gray-500">{estudiante.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-3 py-1 text-xs font-bold bg-purple-100 text-purple-700 rounded-full">
                        {estudiante.grupo || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleAsistenciaChange(estudiante.id, true)}
                          className={`p-2.5 rounded-xl transition-all transform hover:scale-110 ${asistencia.asistio
                            ? 'bg-green-100 text-green-600 ring-2 ring-green-500 shadow-md'
                            : 'bg-gray-100 text-gray-400 hover:bg-green-50'
                            }`}
                          title="Presente"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleAsistenciaChange(estudiante.id, false)}
                          className={`p-2.5 rounded-xl transition-all transform hover:scale-110 ${!asistencia.asistio
                            ? 'bg-red-100 text-red-600 ring-2 ring-red-500 shadow-md'
                            : 'bg-gray-100 text-gray-400 hover:bg-red-50'
                            }`}
                          title="Ausente"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={asistencia.observaciones || ''}
                        onChange={(e) => handleObservacionesChange(estudiante.id, e.target.value)}
                        placeholder="Observaciones (opcional)"
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm transition-all"
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
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100"
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
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">Filtros</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Desde</label>
            <input
              type="date"
              value={filtros.desde}
              onChange={(e) => setFiltros({ ...filtros, desde: e.target.value })}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hasta</label>
            <input
              type="date"
              value={filtros.hasta}
              onChange={(e) => setFiltros({ ...filtros, hasta: e.target.value })}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Grupo</label>
            <select
              value={filtros.grupo}
              onChange={(e) => setFiltros({ ...filtros, grupo: e.target.value })}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
            >
              <option value="">Todos</option>
              {gruposDisponibles.map(g => (
                <option key={g} value={g}>Grupo {g.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
            <select
              value={filtros.tipo}
              onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
            >
              <option value="">Todos</option>
              <option value="clase">Clase</option>
              <option value="tarea">Tarea</option>
              <option value="simulacion">Simulación</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estudiante</label>
            <select
              value={filtros.id_estudiante}
              onChange={(e) => setFiltros({ ...filtros, id_estudiante: e.target.value })}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
            >
              <option value="">Todos</option>
              {estudiantes.map(e => (
                <option key={e.id} value={e.id}>
                  {`${e.nombres || e.nombre || ''} ${e.apellidos || ''}`.trim()}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2 lg:col-span-5 justify-end mt-2">
            <button
              onClick={cargarHistorial}
              disabled={loadingHistorial}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              {loadingHistorial ? 'Cargando...' : 'Buscar'}
            </button>
            <button
              onClick={exportarCSV}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              title="Exportar a CSV"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de historial */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Estudiante</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Grupo</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Observaciones</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loadingHistorial ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                      <p className="text-gray-600">Cargando historial...</p>
                    </div>
                  </td>
                </tr>
              ) : historial.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <History className="w-12 h-12 text-gray-300" />
                      <p className="text-gray-600 font-medium">No hay registros de asistencia</p>
                      <p className="text-sm text-gray-500">Ajusta los filtros o registra nuevas asistencias</p>
                    </div>
                  </td>
                </tr>
              ) : (
                historial.map((registro) => (
                  <tr key={registro.id} className="hover:bg-purple-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(registro.fecha).toLocaleDateString('es-MX', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {`${registro.estudiante_nombre || ''} ${registro.estudiante_apellidos || ''}`.trim()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-3 py-1 text-xs font-bold bg-purple-100 text-purple-700 rounded-full">
                        {registro.estudiante_grupo || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full capitalize">
                        {registro.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {registro.asistio ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          Presente
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold bg-red-100 text-red-700 rounded-full">
                          <XCircle className="w-3 h-3" />
                          Ausente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{registro.observaciones || '—'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleEliminarAsistencia(registro.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-600">Total Registros</div>
            <Calendar className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{totalRegistros}</div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-600">Presentes</div>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-green-600">{totalPresentes}</div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-600">Ausentes</div>
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-3xl font-bold text-red-600">{totalAusentes}</div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium opacity-90">% Asistencia</div>
            <BarChart3 className="w-5 h-5" />
          </div>
          <div className="text-3xl font-bold">{porcentajeAsistencia}%</div>
        </div>
      </div>

      {/* Estadísticas por estudiante */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Estadísticas por Estudiante</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Estudiante</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Grupo</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Presentes</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Ausentes</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">% Asistencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {estadisticasPorEstudiante.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No hay datos suficientes para mostrar estadísticas
                  </td>
                </tr>
              ) : (
                estadisticasPorEstudiante.map((est) => (
                  <tr key={est.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{est.nombre}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-3 py-1 text-xs font-bold bg-purple-100 text-purple-700 rounded-full">
                        {est.grupo || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-medium text-gray-900">{est.total}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-medium text-green-600">{est.presentes}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-medium text-red-600">{est.ausentes}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${est.porcentaje >= 80 ? 'bg-green-500' :
                              est.porcentaje >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                            style={{ width: `${est.porcentaje}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{est.porcentaje}%</span>
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
