import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Mail, MapPin, Phone, CalendarDays, User2, GraduationCap, School, BookOpen,
  Users, FileText, ArrowLeft, Award, Loader2, AlertCircle, ChevronRight,
  UserCircle, HeartPulse, Sparkles, BookMarked, Fingerprint
} from "lucide-react";
import { getEstudianteByIdRequest } from "../../api/estudiantes.js";
import { buildStaticUrl } from "../../utils/url.js";

/* Components Reutilizables Premium */

const ProfileAvatar = ({ src, name, className = "" }) => {
  const [failed, setFailed] = useState(false);
  const initials = (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");

  const sharedClasses = `size-24 sm:size-28 lg:size-32 rounded-3xl object-cover shadow-2xl ring-4 ring-white group-hover:ring-violet-100 transition-all duration-500 ${className}`;

  if (!src || failed) {
    return (
      <div
        className={`${sharedClasses} grid place-items-center bg-gradient-to-br from-violet-500 via-indigo-600 to-purple-600 text-white text-3xl font-black`}
      >
        {initials || <User2 className="size-12" />}
      </div>
    );
  }

  return (
    <div className="relative group">
      <img
        src={src}
        alt={name}
        className={sharedClasses}
        onError={() => setFailed(true)}
      />
      <div className="absolute -bottom-2 -right-2 size-7 sm:size-8 rounded-full bg-emerald-500 border-4 border-white shadow-lg flex items-center justify-center" title="Perfil Activo">
        <div className="size-2 sm:size-2.5 rounded-full bg-white animate-pulse" />
      </div>
    </div>
  );
};

const SectionCard = ({ title, icon: Icon, children, gradient = "from-violet-600 to-indigo-600" }) => (
  <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-[2rem] border border-slate-200/60 bg-white shadow-xl overflow-hidden ring-1 ring-slate-100">
    <div className="px-5 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
      <div className={`p-2 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-md`}>
        {Icon && <Icon className="size-4 sm:size-5" />}
      </div>
      <h3 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
        {title}
      </h3>
    </div>
    <div className="px-5 sm:px-6 py-5 sm:py-6 bg-white/50">{children}</div>
  </section>
);

const InfoRow = ({ icon: Icon, label, value, colorClass = "text-indigo-600 bg-indigo-50" }) => (
  <li className="flex items-center gap-3 sm:gap-4 py-3 sm:py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors px-2 rounded-xl">
    <div className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl ${colorClass} shrink-0 shadow-sm`}>
      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">{label}</p>
      <p className="text-sm sm:text-base font-bold text-slate-800 truncate">{value || <span className="text-slate-300 font-medium italic text-xs">No especificado</span>}</p>
    </div>
  </li>
);

const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`
      flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-300 whitespace-nowrap
      ${active
        ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-200 -translate-y-0.5"
        : "bg-white text-slate-500 hover:text-slate-700 border border-slate-200/60 hover:border-slate-300 hover:bg-slate-50"
      }
    `}
  >
    <Icon className={`size-3.5 sm:size-4.5 ${active ? "animate-pulse" : ""}`} />
    {label}
  </button>
);

/* Main Component */
export default function PerfilEstudiante() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [estudiante, setEstudiante] = useState(null);
  const [activeTab, setActiveTab] = useState("personal"); // personal | academico | curso

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data } = await getEstudianteByIdRequest(id);
        if (!alive) return;
        setEstudiante(data?.data || data || null);
      } catch (e) {
        if (!alive) return;
        setError(e?.response?.data?.message || "Error al cargar el perfil del estudiante");
        console.error("Error cargando estudiante:", e);
      } finally {
        if (alive) setLoading(false);
      }
    }
    if (id) load();
    return () => { alive = false; };
  }, [id]);

  const nombreCompleto = useMemo(() =>
    `${estudiante?.nombre || ""} ${estudiante?.apellidos || ""}`.trim(),
    [estudiante]
  );

  const fotoUrl = useMemo(() =>
    estudiante?.foto ? buildStaticUrl(estudiante.foto) : null,
    [estudiante]
  );

  const edad = useMemo(() => {
    if (!estudiante?.fecha_nacimiento) return "";
    try {
      const dob = new Date(estudiante.fecha_nacimiento);
      if (isNaN(dob)) return "";
      const diff = Date.now() - dob.getTime();
      return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
    } catch { return ""; }
  }, [estudiante]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
          <div className="absolute inset-0 h-12 w-12 rounded-full border-t-2 border-violet-400 animate-pulse" />
        </div>
        <p className="text-base font-bold text-slate-500 animate-pulse">Sincronizando perfil...</p>
      </div>
    );
  }

  if (error || !estudiante) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-12">
        <div className="rounded-[2.5rem] border-2 border-rose-100 bg-rose-50/50 p-8 text-center shadow-xl">
          <div className="mx-auto size-20 rounded-full bg-rose-100 flex items-center justify-center mb-6 text-rose-600">
            <AlertCircle className="size-10" />
          </div>
          <h3 className="text-2xl font-black text-rose-900 mb-2">Oops! Algo salió mal</h3>
          <p className="text-rose-700 font-medium mb-8">{error || "No pudimos encontrar al estudiante solicitado."}</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-2xl bg-white border-2 border-rose-200 px-8 py-3.5 text-sm font-bold text-rose-700 hover:bg-rose-100 shadow-lg hover:shadow-xl transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Regresar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen relative">
      <div className="fixed inset-0 bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 -z-50"></div>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-4 sm:py-8 pb-32 relative">
        {/* Botón Volver - Adaptativo */}
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-2 rounded-2xl border-2 border-slate-100 bg-white px-4 py-2 sm:px-5 sm:py-2.5 text-sm font-bold text-slate-600 shadow-sm hover:shadow-lg hover:bg-slate-50 hover:border-slate-200 transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="hidden sm:inline">Volver</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-amber-50 border border-amber-100 text-amber-700">
            <Sparkles className="size-3.5 sm:size-4 animate-star" />
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Vista de Asesor</span>
          </div>
        </div>

        {/* Header Profile - Optimizado para tablets/iPad */}
        <header className="relative mb-8 sm:mb-10 overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-white border border-slate-200/60 shadow-2xl p-6 md:p-8 lg:p-10 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 lg:gap-12 transition-all hover:shadow-indigo-100/50">
          <div className="absolute -top-20 -right-20 size-64 rounded-full bg-violet-100/40 blur-3xl -z-0" />
          <div className="absolute -bottom-20 -left-20 size-64 rounded-full bg-indigo-100/40 blur-3xl -z-0" />

          <div className="relative z-10 shrink-0">
            <ProfileAvatar src={fotoUrl} name={nombreCompleto} />
          </div>

          <div className="relative z-10 flex-1 text-center md:text-left min-w-0 flex flex-col justify-center h-full">
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4 group inline-block">
              {nombreCompleto}
              <div className="hidden md:block h-1.5 w-0 group-hover:w-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full transition-all duration-500 mt-1" />
            </h1>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 mt-2">
              {estudiante.folio_formateado && (
                <span className="inline-flex items-center gap-2 rounded-xl sm:rounded-2xl bg-slate-100/80 backdrop-blur-sm border border-slate-200 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-slate-700 shadow-sm">
                  <Fingerprint className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
                  {estudiante.folio_formateado}
                </span>
              )}
              {estudiante.grupo && (
                <span className="inline-flex items-center gap-2 rounded-xl sm:rounded-2xl bg-indigo-50 border border-indigo-100 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-indigo-700 shadow-sm">
                  <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {estudiante.grupo}
                </span>
              )}
              {estudiante.curso && (
                <span className="inline-flex items-center gap-2 rounded-xl sm:rounded-2xl bg-violet-50 border border-violet-100 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-violet-700 shadow-sm">
                  <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {estudiante.curso}
                </span>
              )}
              <span className={`inline-flex items-center gap-2 rounded-xl sm:rounded-2xl px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold border shadow-sm ${estudiante.estatus === 'Activo'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                : 'bg-rose-50 text-rose-700 border-rose-100'
                }`}>
                <div className={`size-1.5 sm:size-2 rounded-full ${estudiante.estatus === 'Activo' ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                {estudiante.estatus}
              </span>
            </div>
          </div>
        </header>

        {/* Tabs Switcher - Mejorado para iPad (flex-row en lugar de wrap desordenado) */}
        <nav className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 mb-8 bg-slate-100/50 p-1.5 sm:p-2 rounded-[1.5rem] sm:rounded-3xl border border-slate-200/60 shadow-inner w-full sm:w-fit overflow-x-auto no-scrollbar">
          <TabButton
            active={activeTab === "personal"}
            onClick={() => setActiveTab("personal")}
            icon={UserCircle}
            label="Personal"
          />
          <TabButton
            active={activeTab === "academico"}
            onClick={() => setActiveTab("academico")}
            icon={BookMarked}
            label="Estudios"
          />
          <TabButton
            active={activeTab === "curso"}
            onClick={() => setActiveTab("curso")}
            icon={School}
            label="Curso"
          />
        </nav>

        {/* Tab Content - 2 columnas desde iPad (md) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-start">
          {activeTab === "personal" && (
            <>
              <SectionCard title="Datos de Contacto" icon={User2}>
                <ul className="space-y-1">
                  <InfoRow icon={User2} label="Nombre" value={nombreCompleto} />
                  <InfoRow icon={Mail} label="Email" value={estudiante.email} colorClass="text-rose-600 bg-rose-50" />
                  <InfoRow icon={Phone} label="Móvil" value={estudiante.telefono} colorClass="text-sky-600 bg-sky-50" />
                  {edad && <InfoRow icon={CalendarDays} label="Edad" value={`${edad} años`} colorClass="text-amber-600 bg-amber-50" />}
                  {estudiante.fecha_nacimiento && (
                    <InfoRow
                      icon={CalendarDays}
                      label="Fecha de Nacimiento"
                      value={new Date(estudiante.fecha_nacimiento).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    />
                  )}
                </ul>
              </SectionCard>

              <SectionCard title="Geolocalización" icon={MapPin} gradient="from-emerald-600 to-teal-600">
                <ul className="space-y-1">
                  <InfoRow
                    icon={MapPin}
                    label="Colonia / Comunidad"
                    value={estudiante.comunidad1 || estudiante.comunidad2}
                    colorClass="text-emerald-600 bg-emerald-50"
                  />
                  <InfoRow
                    icon={School}
                    label="Municipio / Zona"
                    value={estudiante.municipio}
                  />
                </ul>
              </SectionCard>
            </>
          )}

          {activeTab === "academico" && (
            <>
              <SectionCard title="Trayectoria" icon={GraduationCap} gradient="from-indigo-600 to-blue-600">
                <ul className="space-y-1">
                  <InfoRow icon={School} label="Estatus Académico" value={estudiante.academico1} />
                  <InfoRow icon={BookOpen} label="Institución" value={estudiante.academico2} colorClass="text-violet-600 bg-violet-50" />
                  <InfoRow icon={ChevronRight} label="Semestre" value={estudiante.semestre} />
                  <InfoRow icon={Award} label="Carrera de Interés" value={estudiante.orientacion} colorClass="text-amber-600 bg-amber-50" />
                  <InfoRow
                    icon={School}
                    label="Universidades Meta"
                    value={[estudiante.universidades1, estudiante.universidades2].filter(Boolean).join(", ")}
                    colorClass="text-cyan-600 bg-cyan-50"
                  />
                </ul>
              </SectionCard>

              <div className="space-y-6 sm:space-y-10">
                <SectionCard title="Protección Civil / Tutor" icon={Users} gradient="from-purple-600 to-fuchsia-600">
                  <ul className="space-y-1">
                    <InfoRow icon={User2} label="Tutor Legal" value={estudiante.nombre_tutor} />
                    <InfoRow icon={Phone} label="Emergencias" value={estudiante.tel_tutor} colorClass="text-sky-600 bg-sky-50" />
                  </ul>
                </SectionCard>

                <SectionCard title="Salud y Atención" icon={HeartPulse} gradient="from-rose-500 to-pink-600">
                  <ul className="space-y-1">
                    <InfoRow icon={AlertCircle} label="Alergias" value={estudiante.alergia} colorClass="text-rose-600 bg-rose-50" />
                    <InfoRow icon={AlertCircle} label="Necesidades Esp." value={estudiante.discapacidad1} colorClass="text-orange-600 bg-orange-50" />
                  </ul>
                </SectionCard>
              </div>
            </>
          )}

          {activeTab === "curso" && (
            <>
              <SectionCard title="Configuración" icon={Users} gradient="from-cyan-600 to-blue-600">
                <ul className="space-y-1">
                  <InfoRow icon={GraduationCap} label="Curso Actual" value={estudiante.curso} colorClass="text-violet-600 bg-violet-50" />
                  <InfoRow icon={Users} label="ID de Grupo" value={estudiante.grupo} colorClass="text-indigo-600 bg-indigo-50" />
                  <InfoRow icon={CalendarDays} label="Turno" value={estudiante.turno} colorClass="text-amber-600 bg-amber-50" />
                </ul>
              </SectionCard>

              <SectionCard title="Asignación y Plan" icon={BookMarked} gradient="from-slate-700 to-slate-900">
                <ul className="space-y-1">
                  <InfoRow icon={Award} label="Esquema Educativo" value={estudiante.plan} />
                  <InfoRow icon={CalendarDays} label="Periodo Ciclo" value={estudiante.anio} />
                  <InfoRow icon={User2} label="Asesor Responsable" value={estudiante.asesor} colorClass="text-emerald-600 bg-emerald-50" />
                </ul>
              </SectionCard>
            </>
          )}
        </div>

        <style>{`
        @keyframes star {
           0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
           50% { transform: scale(1.2) rotate(180deg); opacity: 0.7; }
        }
        .animate-star {
           animation: star 3s ease-in-out infinite;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      </div>
    </div>
  );
}
