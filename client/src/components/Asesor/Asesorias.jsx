import React, { useMemo, useState, useEffect } from "react";
import api from "../../api/axios.js";
import dayjs from "dayjs";

/**
 * Dashboard de Asesorías — Minimalista, tonos claros
 * - Tarjetas KPI superiores
 * - Panel derecho: Próximas sesiones (lista clicable)
 * - Panel izquierdo: Detalle de la sesión seleccionada (reemplaza el calendario)
 * - Responsive: grid 1col en móvil, 3col en lg (2/3 detalle, 1/3 lista)
 * - Datos reales desde el backend: ingresos asignados al asesor autenticado
 */

/* ------------------------------ Utilidades ------------------------------ */
import { Users } from "lucide-react";

const fmtFecha = (iso) => {
  if (!iso) {
    return { fecha: 'Sin fecha', hora: '--:--' };
  }

  // Usar dayjs para parsear de manera más robusta
  const d = dayjs(iso);

  if (!d.isValid()) {
    return { fecha: 'Fecha inválida', hora: '--:--' };
  }

  const f = d.format('DD MMM');
  const h = d.format('HH:mm');

  return { fecha: f, hora: h };
};

const kColor = {
  card: "bg-white",
  border: "border-slate-200",
  textStrong: "text-slate-800",
  text: "text-slate-600",
  subtext: "text-slate-500",
  chip: "bg-slate-100 text-slate-700",
  primary: "text-sky-600",
};

/* ------------------------------ Componentes ----------------------------- */
const KPI = ({ icon, label, value }) => (
  <div className={`rounded-3xl ${kColor.card} border ${kColor.border} p-4 sm:p-5 shadow-sm ring-1 ring-gray-100 hover:shadow-md transition-shadow`}>
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className={`text-xs sm:text-sm ${kColor.text} mb-1`}>{label}</div>
        <div className={`text-xl sm:text-2xl font-semibold ${kColor.textStrong}`}>{value}</div>
      </div>
    </div>
  </div>
);

// Icono: Total Asesorías - Calendario con check
const IconPeople = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
    <path d="M7 12h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z" />
  </svg>
);

// Icono: Materias Cubiertas - Libro abierto
const IconBook = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z" />
  </svg>
);

// Icono: Personalizadas vs Grupales - Persona individual y grupo
const IconSplit = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
  </svg>
);

// Icono: Horas Programadas - Reloj con manecillas
const IconClock = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
  </svg>
);
const IconCalendar = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M7 2h2v2h6V2h2v2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2V2zm14 8H5v10h16V10z" /></svg>
);
const IconUser = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5z" /></svg>
);
const IconGroup = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4zM6 13a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm10 2c-2.67 0-8 1.34-8 4v1h16v-1c0-2.66-5.33-4-8-4zM6 15c-2.5 0-6 1.25-6 3v2h6v-2.5c0-.17.02-.34.05-.5A11 11 0 0 1 6 15z" /></svg>
);
const IconPin = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 14.5 9 2.5 2.5 0 0 1 12 11.5z" /></svg>
);

const SessionCard = ({ s, selected, onClick }) => {
  const { fecha, hora } = fmtFecha(s.fecha);
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border ${selected ? "border-sky-300 bg-sky-50" : "border-slate-200 bg-white hover:bg-slate-50"} p-4 shadow-sm transition`}
    >
      <div className="text-xs text-slate-500 mb-1">{fecha} · {hora}</div>
      <div className="font-semibold text-slate-800">{s.materia}</div>
      <div className="text-sm text-slate-600">
        {s.tipo} — {s.tipo === "Personalizada" ? s.alumno : `Grupal - Grupo ${s.grupo}`}
      </div>
    </button>
  );
};

/* ------------------------------ Vista principal ------------------------------ */
export default function DashboardAsesorias() {
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selId, setSelId] = useState(null);
  const [activeTab, setActiveTab] = useState('proximas'); // 'proximas' | 'realizadas'
  const sel = useMemo(() => sesiones.find(x => x.id === selId) || null, [selId, sesiones]);

  // Estado para modal de reprogramación
  const [showReprogramar, setShowReprogramar] = useState(false);
  const [reprogramarFecha, setReprogramarFecha] = useState('');
  const [reprogramarHora, setReprogramarHora] = useState('');
  const [reprogramarLoading, setReprogramarLoading] = useState(false);
  const [reprogramarError, setReprogramarError] = useState('');

  // Estado para marcar como realizada
  const [showMarcarRealizada, setShowMarcarRealizada] = useState(false);
  const [marcarRealizadaObservaciones, setMarcarRealizadaObservaciones] = useState('');
  const [marcarRealizadaLoading, setMarcarRealizadaLoading] = useState(false);
  const [marcarRealizadaError, setMarcarRealizadaError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Función para cargar asesorías (reutilizable)
  const loadAsesorias = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('[Asesorias] Iniciando carga de asesorías...');

      // Agregar timeout de 10 segundos
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout: La solicitud tardó demasiado')), 10000)
      );

      const res = await Promise.race([
        api.get('/asesores/mis-asesorias'),
        timeoutPromise
      ]);

      console.log('[Asesorias] Respuesta recibida:', res);

      // Verificar respuesta
      if (!res || !res.data) {
        console.warn('Respuesta inválida del servidor:', res);
        setError('Respuesta inválida del servidor');
        setSesiones([]);
        return;
      }

      const ingresos = res.data?.data || [];

      // Si no hay ingresos, simplemente mostrar lista vacía
      if (!Array.isArray(ingresos)) {
        console.warn('Los datos recibidos no son un array:', ingresos);
        setSesiones([]);
        return;
      }

      // Mapear ingresos al formato esperado por el componente
      const sesionesMapeadas = ingresos.map((ingreso) => {
        // Determinar si es personalizada o grupal (por ahora asumimos personalizada si hay alumno_nombre)
        const tipo = ingreso.alumno_nombre ? 'Personalizada' : 'Grupal';

        // Construir fecha/hora ISO para el componente
        let fechaStr = ingreso.fecha;

        // Normalizar fecha: puede venir como YYYY-MM-DD o con hora
        if (fechaStr && fechaStr.includes('T')) {
          fechaStr = fechaStr.split('T')[0];
        }
        if (!fechaStr || !dayjs(fechaStr).isValid()) {
          fechaStr = dayjs().format('YYYY-MM-DD');
        }

        let horaStr = ingreso.hora || '09:00';

        // Asegurar formato HH:mm
        if (horaStr && typeof horaStr === 'string') {
          // Si tiene formato de tiempo completo, extraer solo HH:mm
          if (horaStr.includes('T')) {
            horaStr = horaStr.split('T')[1]?.slice(0, 5) || '09:00';
          }
          if (horaStr.length === 5 && horaStr.includes(':')) {
            // Ya está en formato HH:mm, validar
            const [h, m] = horaStr.split(':');
            if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
              horaStr = '09:00';
            }
          } else if (horaStr.includes(':')) {
            // Extraer solo HH:mm
            const parts = horaStr.split(':');
            const h = parseInt(parts[0]) || 9;
            const m = parseInt(parts[1]) || 0;
            horaStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
          } else {
            horaStr = '09:00';
          }
        } else {
          horaStr = '09:00';
        }

        // Construir fecha ISO válida
        const fechaISO = `${fechaStr}T${horaStr}:00`;

        // Validar que la fecha ISO sea válida
        const fechaValidada = dayjs(fechaISO);
        if (!fechaValidada.isValid()) {
          console.warn('Fecha inválida para ingreso:', ingreso.id, 'fecha:', ingreso.fecha, 'hora:', ingreso.hora);
        }

        // Parsear asistencia desde notas si existe
        let asistenciaEstado = null;
        try {
          if (ingreso.notas) {
            const notas = JSON.parse(ingreso.notas);
            asistenciaEstado = notas?.asistencia?.estado || null;
          }
        } catch { }

        // Obtener nombre del alumno
        const alumnoNombre = ingreso.alumno_nombre ||
          (ingreso.estudiante_nombre ? `${ingreso.estudiante_nombre} ${ingreso.estudiante_apellidos || ''}`.trim() : null);

        // Asegurar que la fecha ISO sea válida antes de guardarla
        const fechaFinal = fechaValidada.isValid() ? fechaISO : dayjs().format('YYYY-MM-DDTHH:mm:ss');

        return {
          id: `S-${ingreso.id}`,
          materia: ingreso.curso || 'Sin materia',
          tipo,
          alumno: alumnoNombre,
          grupo: null, // Por ahora no hay grupos en ingresos, se puede extender después
          asesor: ingreso.asesor_nombre || 'Sin asesor',
          fecha: fechaFinal,
          duracionMin: 60, // Por defecto 60 min, se puede calcular o agregar campo
          ubicacion: 'Por definir', // Se puede agregar campo o usar descripción
          descripcion: ingreso.descripcion || 'Sin descripción',
          importe: ingreso.importe || 0,
          metodo: ingreso.metodo || '',
          estatus: ingreso.estatus || 'Pagado',
          asistenciaEstado,
          _ingresoId: ingreso.id, // ID original para referencias
          _calendarEventId: ingreso.calendar_event_id, // ID del evento de calendario
          _confirmacionEstado: ingreso.confirmacion_estado, // 'pendiente', 'confirmada', 'rechazada', o null
        };
      });

      setSesiones(sesionesMapeadas);
      console.log('[Asesorias] Asesorías cargadas exitosamente:', sesionesMapeadas.length);
    } catch (err) {
      console.error('[Asesorias] Error cargando asesorías:', err);
      console.error('[Asesorias] Detalles del error:', {
        message: err?.message,
        response: err?.response?.data,
        status: err?.response?.status,
        config: err?.config?.url
      });

      // Manejar diferentes tipos de errores
      if (err?.response?.status === 404) {
        setError('Perfil de asesor no encontrado. Contacta al administrador.');
      } else if (err?.response?.status === 401) {
        setError('No estás autenticado. Por favor, inicia sesión nuevamente.');
      } else if (err?.response?.status === 403) {
        setError('No tienes permisos para ver asesorías.');
      } else if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err?.message) {
        setError(`Error: ${err.message}`);
      } else {
        setError('No se pudieron cargar las asesorías. Intenta recargar la página.');
      }

      // Asegurar que siempre se muestre lista vacía en caso de error
      setSesiones([]);
    } finally {
      console.log('[Asesorias] Finalizando carga, estableciendo loading=false');
      setLoading(false);
    }
  };

  // Cargar asesorías al montar el componente
  useEffect(() => {
    loadAsesorias();
  }, []); // Solo ejecutar una vez al montar

  // Función para abrir modal de reprogramación
  const handleReprogramar = () => {
    if (!sel) return;
    const fechaActual = dayjs(sel.fecha);
    setReprogramarFecha(fechaActual.format('YYYY-MM-DD'));
    setReprogramarHora(fechaActual.format('HH:mm'));
    setReprogramarError('');
    setShowReprogramar(true);
  };

  // Función para abrir modal de marcar como realizada
  const handleMarcarRealizada = () => {
    if (!sel) return;
    setMarcarRealizadaObservaciones('');
    setMarcarRealizadaError('');
    setShowMarcarRealizada(true);
  };

  // Función para enviar solicitud de marcar como realizada
  const handleMarcarRealizadaSubmit = async (e) => {
    e.preventDefault();
    if (!sel || !sel._ingresoId) return;

    try {
      setMarcarRealizadaLoading(true);
      setMarcarRealizadaError('');

      await api.post('/asesores/marcar-realizada', {
        ingreso_id: sel._ingresoId,
        observaciones: marcarRealizadaObservaciones || null,
      });

      // Cerrar modal
      setShowMarcarRealizada(false);

      // Recargar asesorías
      await loadAsesorias();

      // Mostrar modal de éxito
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error al marcar como realizada:', err);
      setMarcarRealizadaError(
        err?.response?.data?.message ||
        'No se pudo enviar la solicitud. Intenta de nuevo.'
      );
    } finally {
      setMarcarRealizadaLoading(false);
    }
  };

  // Función para guardar reprogramación
  const handleReprogramarSubmit = async (e) => {
    e.preventDefault();
    if (!sel || !sel._ingresoId) return;

    try {
      setReprogramarLoading(true);
      setReprogramarError('');

      // Validar fecha y hora
      if (!reprogramarFecha || !reprogramarHora) {
        setReprogramarError('Fecha y hora son requeridas');
        return;
      }

      const fechaValidada = dayjs(`${reprogramarFecha}T${reprogramarHora}:00`);
      if (!fechaValidada.isValid()) {
        setReprogramarError('Fecha u hora inválida');
        return;
      }

      // Actualizar ingreso en el backend
      // El backend automáticamente sincroniza con el calendario
      await api.put(`/finanzas/ingresos/${sel._ingresoId}`, {
        fecha: reprogramarFecha,
        hora: reprogramarHora,
      });

      // Recargar asesorías para reflejar los cambios
      await loadAsesorias();

      // Cerrar modal
      setShowReprogramar(false);

      // Mantener la selección si es posible
      if (sel) {
        const nuevaSesion = sesiones.find(s => s._ingresoId === sel._ingresoId);
        if (nuevaSesion) {
          setSelId(nuevaSesion.id);
        }
      }
    } catch (err) {
      console.error('Error al reprogramar:', err);
      setReprogramarError('No se pudo reprogramar la sesión. Intenta de nuevo.');
    } finally {
      setReprogramarLoading(false);
    }
  };

  // Filtrar sesiones próximas (no confirmadas y futuras o de hoy)
  const sesionesProximas = useMemo(() => {
    return sesiones.filter(s => {
      // Excluir sesiones ya confirmadas
      if (s._confirmacionEstado === 'confirmada') return false;

      // Mostrar solo sesiones de hoy en adelante
      const fechaSesion = dayjs(s.fecha);
      const hoy = dayjs().startOf('day');
      return fechaSesion.isSameOrAfter(hoy, 'day');
    });
  }, [sesiones]);

  // Filtrar sesiones realizadas (confirmadas)
  const sesionesRealizadas = useMemo(() => {
    return sesiones.filter(s => {
      return s._confirmacionEstado === 'confirmada';
    }).sort((a, b) => {
      // Ordenar por fecha descendente (más recientes primero)
      return dayjs(b.fecha).valueOf() - dayjs(a.fecha).valueOf();
    });
  }, [sesiones]);

  // Limpiar selección si cambiamos de tab
  useEffect(() => {
    if (sel && activeTab === 'proximas' && sel._confirmacionEstado === 'confirmada') {
      setSelId(null);
    } else if (sel && activeTab === 'realizadas' && sel._confirmacionEstado !== 'confirmada') {
      setSelId(null);
    }
  }, [activeTab, sel]);

  // KPIs calculados (solo de sesiones próximas)
  const kpis = useMemo(() => {
    const total = sesionesProximas.length;
    const materias = new Set(sesionesProximas.map(s => s.materia)).size;
    const pers = sesionesProximas.filter(s => s.tipo === "Personalizada").length;
    const grup = sesionesProximas.filter(s => s.tipo === "Grupal").length;
    const horas = Math.round(sesionesProximas.reduce((acc, s) => acc + (s.duracionMin || 0), 0) / 60);
    return { total, materias, pers, grup, horas };
  }, [sesionesProximas]);

  return (
    <div className="min-h-screen relative w-full overflow-x-hidden">
      {/* Fondo fijo independiente del scroll */}
      <div className="fixed inset-0 bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 -z-50"></div>

      <section className="px-4 sm:px-6 lg:px-10 pt-6 xs:pt-8 sm:pt-10 md:pt-12 pb-8 max-w-[1920px] mx-auto relative z-10">
        {/* Header con título grande */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-600 shadow-xl ring-4 ring-violet-200">
              <Users className="size-8 sm:size-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-1 tracking-tight">
                <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent inline-block" style={{ lineHeight: '1.2', paddingBottom: '0.2em' }}>
                  Asesorías
                </span>
              </h1>
              <p className="text-slate-600 text-sm sm:text-base font-medium">
                Gestiona tus sesiones de asesoría asignadas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm hover:border-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500">
              <option>Semana</option>
              <option>Mes</option>
            </select>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <KPI icon={<IconPeople />} label="Total Asesorías" value={kpis.total} />
          <KPI icon={<IconBook />} label="Materias Cubiertas" value={kpis.materias} />
          <KPI icon={<IconSplit />} label="Personalizadas vs Grupales" value={`${kpis.pers} / ${kpis.grup}`} />
          <KPI icon={<IconClock />} label="Horas Programadas" value={`${kpis.horas} h`} />
        </div>

        {/* Contenido principal */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="grid place-items-center p-12">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p className={`text-base ${kColor.text}`}>Cargando asesorías...</p>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-md border border-rose-200 overflow-hidden">
            <div className="grid place-items-center p-12">
              <div className="text-center">
                <p className={`text-base text-rose-600 font-medium`}>{error}</p>
              </div>
            </div>
          </div>
        ) : sesiones.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="grid place-items-center p-12 text-center">
              <div className="max-w-md">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-slate-100 p-4">
                    <IconCalendar />
                  </div>
                </div>
                <p className={`text-lg font-semibold ${kColor.textStrong} mb-2`}>No tienes asesorías asignadas</p>
                <p className={`text-sm ${kColor.subtext}`}>Las asesorías aparecerán aquí cuando te sean asignadas</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Detalle (izquierda) */}
            <div className={`lg:col-span-2 rounded-xl shadow-md border ${kColor.border} bg-white p-4 sm:p-6`}>
              <div className="mb-4 flex items-center gap-2">
                <IconCalendar />
                <h2 className={`text-lg font-semibold ${kColor.textStrong}`}>Detalle de Sesión</h2>
              </div>

              {!sel && (
                <div className="grid place-items-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-12 text-center">
                  <p className={`text-base font-medium ${kColor.textStrong}`}>Selecciona una sesión para ver el detalle</p>
                  <p className={`text-sm ${kColor.subtext}`}>Haz clic en una tarjeta de sesión para ver el detalle</p>
                </div>
              )}

              {sel && <DetalleSesion s={sel} onReprogramar={handleReprogramar} onMarcarRealizada={handleMarcarRealizada} />}
            </div>

            {/* Lista (derecha) */}
            <div className={`rounded-xl shadow-md border ${kColor.border} bg-white p-4 sm:p-6`}>
              {/* Tabs para alternar entre próximas y realizadas */}
              <div className="flex gap-2 mb-4 border-b border-gray-200">
                <button
                  onClick={() => {
                    setActiveTab('proximas');
                    setSelId(null);
                  }}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'proximas'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Próximas Sesiones
                  {sesionesProximas.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-600">
                      {sesionesProximas.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => {
                    setActiveTab('realizadas');
                    setSelId(null);
                  }}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'realizadas'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Sesiones Realizadas
                  {sesionesRealizadas.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-600">
                      {sesionesRealizadas.length}
                    </span>
                  )}
                </button>
              </div>

              <div className="grid gap-3 max-h-[calc(100vh-400px)] overflow-y-auto">
                {activeTab === 'proximas' ? (
                  sesionesProximas.length > 0 ? (
                    sesionesProximas.map(s => (
                      <SessionCard key={s.id} s={s} selected={s.id === selId} onClick={() => setSelId(s.id)} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-sm text-gray-500">
                      No hay sesiones próximas
                    </div>
                  )
                ) : (
                  sesionesRealizadas.length > 0 ? (
                    sesionesRealizadas.map(s => (
                      <SessionCard key={s.id} s={s} selected={s.id === selId} onClick={() => setSelId(s.id)} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-sm text-gray-500">
                      No hay sesiones realizadas
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal Marcar como Realizada */}
        {showMarcarRealizada && sel && (
          <div className="fixed inset-0 z-[9999] overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-center bg-black/40">
            <div className="min-h-[calc(100vh-2rem)] flex flex-col items-center justify-center py-4 w-full">
              <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-y-auto max-h-[calc(100vh-3rem)]">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-900">Marcar Sesión como Realizada</h3>
                  <button
                    onClick={() => !marcarRealizadaLoading && setShowMarcarRealizada(false)}
                    className="text-gray-500 hover:text-gray-700"
                    disabled={marcarRealizadaLoading}
                  >
                    ✕
                  </button>
                </div>
                <form onSubmit={handleMarcarRealizadaSubmit} className="px-5 py-4 space-y-4">
                  <div className="text-xs text-gray-500 mb-2">
                    {sel.materia} • {sel.alumno || 'Sin alumno'} • {fmtFecha(sel.fecha).fecha} {fmtFecha(sel.fecha).hora}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Observaciones (opcional)
                    </label>
                    <textarea
                      value={marcarRealizadaObservaciones}
                      onChange={(e) => setMarcarRealizadaObservaciones(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      rows={4}
                      placeholder="Agrega cualquier observación sobre la sesión..."
                      disabled={marcarRealizadaLoading}
                    />
                  </div>
                  {marcarRealizadaError && (
                    <div className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg">
                      {marcarRealizadaError}
                    </div>
                  )}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowMarcarRealizada(false)}
                      disabled={marcarRealizadaLoading}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={marcarRealizadaLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {marcarRealizadaLoading ? 'Enviando...' : 'Enviar Solicitud'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Éxito */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-[9999] bg-black/40 p-3 sm:p-4 flex items-center justify-center">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                    <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Solicitud Enviada</h3>
                </div>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="px-5 py-4">
                <p className="text-sm text-gray-600">
                  Solicitud enviada. El administrador revisará tu solicitud.
                </p>
              </div>
              <div className="px-5 py-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Reprogramar */}
        {showReprogramar && sel && (
          <div className="fixed inset-0 z-[9999] overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-center bg-black/40">
            <div className="min-h-[calc(100vh-2rem)] flex flex-col items-center justify-center py-4 w-full">
              <div className="bg-white w-full max-w-md rounded-2xl shadow-xl max-h-[calc(100vh-3rem)] overflow-y-auto">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-900">Reprogramar Sesión</h3>
                  <button
                    onClick={() => !reprogramarLoading && setShowReprogramar(false)}
                    className="text-gray-500 hover:text-gray-700"
                    disabled={reprogramarLoading}
                  >
                    ✕
                  </button>
                </div>
                <form onSubmit={handleReprogramarSubmit} className="px-5 py-4 space-y-4">
                  <div className="text-xs text-gray-500 mb-2">
                    {sel.materia} • {sel.alumno || 'Sin alumno'}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Nueva Fecha</label>
                    <input
                      type="date"
                      value={reprogramarFecha}
                      onChange={(e) => setReprogramarFecha(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                      disabled={reprogramarLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Nueva Hora</label>
                    <input
                      type="time"
                      value={reprogramarHora}
                      onChange={(e) => setReprogramarHora(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                      disabled={reprogramarLoading}
                    />
                  </div>
                  {reprogramarError && (
                    <div className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg">
                      {reprogramarError}
                    </div>
                  )}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowReprogramar(false)}
                      disabled={reprogramarLoading}
                      className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={reprogramarLoading}
                      className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-70"
                    >
                      {reprogramarLoading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function DetalleSesion({ s, onReprogramar, onMarcarRealizada }) {
  const { fecha, hora } = fmtFecha(s.fecha);
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Columna izquierda */}
      <div className="space-y-3">
        <Item label="Materia" value={s.materia} />
        <Item label="Tipo" value={s.tipo} />
        <Item label={s.tipo === "Personalizada" ? "Alumno" : "Grupo"} value={s.tipo === "Personalizada" ? s.alumno : s.grupo} />
        <Item label="Asesor" value={s.asesor} />
      </div>

      {/* Columna derecha */}
      <div className="space-y-3">
        <Item label="Fecha" value={fecha} icon={<IconCalendar />} />
        <Item label="Hora" value={hora} icon={<IconClock />} />
        <Item label="Duración" value={`${s.duracionMin} min`} />
        <Item label="Ubicación" value={s.ubicacion} icon={<IconPin />} />
      </div>

      {/* Descripción */}
      <div className="md:col-span-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="text-sm font-medium text-slate-700 mb-1">Descripción</div>
          <p className="text-sm text-slate-600 leading-relaxed">{s.descripcion}</p>
        </div>
      </div>

      {/* Acciones */}
      <div className="md:col-span-2 flex flex-wrap gap-2">
        <button
          onClick={onReprogramar}
          disabled={s._confirmacionEstado === 'pendiente' || s._confirmacionEstado === 'confirmada'}
          className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700 hover:bg-sky-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={s._confirmacionEstado === 'pendiente' ? 'No se puede reprogramar: hay una solicitud pendiente' : s._confirmacionEstado === 'confirmada' ? 'No se puede reprogramar: la asesoría ya fue confirmada' : ''}
        >
          Reprogramar
        </button>
        <button
          onClick={onMarcarRealizada}
          disabled={s._confirmacionEstado === 'pendiente' || s._confirmacionEstado === 'confirmada'}
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={s._confirmacionEstado === 'pendiente' ? 'Ya hay una solicitud pendiente de confirmación' : s._confirmacionEstado === 'confirmada' ? 'La asesoría ya fue confirmada como realizada' : ''}
        >
          {s._confirmacionEstado === 'pendiente' ? 'Solicitud Pendiente' : s._confirmacionEstado === 'confirmada' ? 'Ya Confirmada' : 'Marcar como realizada'}
        </button>
        <button
          disabled={s._confirmacionEstado === 'confirmada'}
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={s._confirmacionEstado === 'confirmada' ? 'No se puede cancelar: la asesoría ya fue confirmada como realizada' : ''}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

function Item({ label, value, icon }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
      {icon && <div className="text-slate-500">{icon}</div>}
      <div className="text-sm text-slate-500">{label}</div>
      <div className="ml-auto text-sm font-medium text-slate-800">{value}</div>
    </div>
  );
}
