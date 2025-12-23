// PerfilEstudiante.jsx - Perfil completo del estudiante para asesor
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getEstudianteByIdRequest } from "../../api/estudiantes.js";
import { buildStaticUrl } from "../../utils/url.js";
import {
  Mail, MapPin, Phone, CalendarDays, User2, GraduationCap, School, BookOpen,
  Users, FileText, ArrowLeft, Award, Loader2, AlertCircle
} from "lucide-react";

const SectionCard = ({ title, children }) => (
  <section className="rounded-2xl border border-slate-200 bg-white shadow-md hover:shadow-lg transition-shadow">
    <div className="px-5 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/50">
      <div className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-1.5 shadow-sm">
        <span className="text-sm font-bold tracking-wide text-white">
          {title.toUpperCase()}
        </span>
      </div>
    </div>
    <div className="px-5 sm:px-6 py-5">{children}</div>
  </section>
);

const Row = ({ icon: Icon, label, value }) => (
  <li className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
      <Icon className="h-4 w-4" />
    </span>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-[15px] font-medium text-slate-900 leading-relaxed">{value || <span className="text-slate-400 italic">No especificado</span>}</p>
    </div>
  </li>
);

export default function PerfilEstudiante() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [estudiante, setEstudiante] = useState(null);

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

  if (loading) {
    return (
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <p className="text-sm text-slate-600">Cargando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !estudiante) {
    return (
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-8">
        <div className="rounded-xl border-2 border-rose-200 bg-rose-50 p-4 sm:p-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-rose-900 mb-1">Error</h3>
            <p className="text-sm text-rose-700">{error || "Estudiante no encontrado"}</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-rose-300 bg-white px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  const nombreCompleto = `${estudiante.nombre || ""} ${estudiante.apellidos || ""}`.trim();
  const fotoUrl = estudiante.foto ? buildStaticUrl(estudiante.foto) : null;

  // Calcular edad
  let edad = "";
  try {
    if (estudiante.fecha_nacimiento) {
      const dob = new Date(estudiante.fecha_nacimiento);
      if (!isNaN(dob)) {
        const diff = Date.now() - dob.getTime();
        edad = String(Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000)));
      }
    }
  } catch { }

  return (
    <div className="w-full">
      {/* Header con foto y nombre - Sin fondo morado, elementos más arriba */}
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pt-0 pb-4 sm:pb-5">
        <button
          onClick={() => navigate(-1)}
          className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver
        </button>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-1">
          <div className="flex-shrink-0">
            {fotoUrl ? (
              <img
                src={fotoUrl}
                alt={nombreCompleto}
                className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl object-cover ring-2 ring-slate-200 shadow-md"
              />
            ) : (
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xl sm:text-2xl font-bold ring-2 ring-slate-200 shadow-md">
                {nombreCompleto.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold mb-2 text-slate-900 truncate">{nombreCompleto}</h1>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {estudiante.folio_formateado && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                  <FileText className="h-3 w-3" />
                  {estudiante.folio_formateado}
                </span>
              )}
              {estudiante.grupo && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                  <Users className="h-3 w-3" />
                  {estudiante.grupo}
                </span>
              )}
              {estudiante.curso && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                  <GraduationCap className="h-3 w-3" />
                  {estudiante.curso}
                </span>
              )}
              {estudiante.estatus && (
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${estudiante.estatus === 'Activo'
                    ? 'bg-emerald-100 text-emerald-700 ring-emerald-200'
                    : 'bg-rose-100 text-rose-700 ring-rose-200'
                  }`}>
                  {estudiante.estatus}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid de información */}
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda - Información personal */}
          <div className="lg:col-span-2 space-y-6">
            <SectionCard title="Información Personal">
              <ul className="space-y-1">
                <Row icon={User2} label="Nombre completo" value={nombreCompleto} />
                <Row icon={Mail} label="Correo electrónico" value={estudiante.email} />
                <Row icon={Phone} label="Teléfono" value={estudiante.telefono} />
                {edad && <Row icon={CalendarDays} label="Edad" value={`${edad} años`} />}
                {estudiante.fecha_nacimiento && (
                  <Row
                    icon={CalendarDays}
                    label="Fecha de nacimiento"
                    value={new Date(estudiante.fecha_nacimiento).toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  />
                )}
                {estudiante.comunidad2 || estudiante.comunidad1 ? (
                  <Row
                    icon={MapPin}
                    label="Ubicación"
                    value={estudiante.comunidad2 || estudiante.comunidad1}
                  />
                ) : null}
              </ul>
            </SectionCard>

            {/* Información del tutor */}
            {(estudiante.nombre_tutor || estudiante.tel_tutor) && (
              <SectionCard title="Información del Tutor">
                <ul className="space-y-1">
                  {estudiante.nombre_tutor && (
                    <Row icon={User2} label="Nombre del tutor" value={estudiante.nombre_tutor} />
                  )}
                  {estudiante.tel_tutor && (
                    <Row icon={Phone} label="Teléfono del tutor" value={estudiante.tel_tutor} />
                  )}
                </ul>
              </SectionCard>
            )}

            {/* Información académica */}
            <SectionCard title="Información Académica">
              <ul className="space-y-1">
                {estudiante.academico1 && (
                  <Row icon={School} label="Nivel académico" value={estudiante.academico1} />
                )}
                {estudiante.academico2 && (
                  <Row icon={BookOpen} label="Bachillerato" value={estudiante.academico2} />
                )}
                {estudiante.semestre && (
                  <Row icon={GraduationCap} label="Semestre" value={estudiante.semestre} />
                )}
                {estudiante.orientacion && (
                  <Row icon={Award} label="Orientación/Licenciatura" value={estudiante.orientacion} />
                )}
                {(estudiante.universidades1 || estudiante.universidades2) && (
                  <Row
                    icon={School}
                    label="Universidades"
                    value={[estudiante.universidades1, estudiante.universidades2].filter(Boolean).join(", ")}
                  />
                )}
              </ul>
            </SectionCard>
          </div>

          {/* Columna derecha - Información del curso */}
          <div className="space-y-6">
            <SectionCard title="Información del Curso">
              <ul className="space-y-1">
                {estudiante.curso && (
                  <Row icon={GraduationCap} label="Curso" value={estudiante.curso} />
                )}
                {estudiante.grupo && (
                  <Row icon={Users} label="Grupo" value={estudiante.grupo} />
                )}
                {estudiante.turno && (
                  <Row icon={CalendarDays} label="Turno" value={estudiante.turno} />
                )}
                {estudiante.plan && (
                  <Row icon={Award} label="Plan" value={estudiante.plan} />
                )}
                {estudiante.anio && (
                  <Row icon={CalendarDays} label="Año" value={estudiante.anio} />
                )}
                {estudiante.asesor && (
                  <Row icon={User2} label="Asesor" value={estudiante.asesor} />
                )}
              </ul>
            </SectionCard>

            {/* Información de salud (si existe) */}
            {(estudiante.alergia || estudiante.discapacidad1) && (
              <SectionCard title="Información de Salud">
                <ul className="space-y-1">
                  {estudiante.alergia && (
                    <Row icon={AlertCircle} label="Alergias" value={estudiante.alergia} />
                  )}
                  {estudiante.discapacidad1 && (
                    <Row icon={AlertCircle} label="Discapacidad/Trastorno" value={estudiante.discapacidad1} />
                  )}
                </ul>
              </SectionCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

