// AsesorPerfil.jsx (conectado a backend)
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMiPerfil, updateMiPerfil, getMisEstudiantes } from "../../api/asesores.js";
import { buildStaticUrl } from "../../utils/url.js";
import {
  Mail, MapPin, Phone, CalendarDays, Flag, User2, HeartHandshake,
  GraduationCap, School, Ruler, Languages, Clock, BadgeCheck,
  BriefcaseBusiness, Sparkles, Boxes, BookOpenCheck, Brain, Users2,
  Edit, X, Save, Loader2, CheckCircle2, XCircle, ShieldCheck
} from "lucide-react";

/* --------------------------- helpers UI --------------------------- */

const SectionCard = ({ title, children }) => (
  <section className="rounded-3xl border-2 border-slate-200 bg-white shadow-lg hover:shadow-xl transition-all duration-300 ring-2 ring-slate-100/50">
    <div className="px-4 sm:px-6 py-4 sm:py-5 border-b-2 border-slate-200 bg-gradient-to-r from-violet-50/50 to-indigo-50/50">
      <div className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 px-4 py-2 ring-2 ring-violet-200 shadow-md">
        <span className="text-sm font-extrabold tracking-wide text-white">
          {title.toUpperCase()}
        </span>
      </div>
    </div>
    <div className="px-4 sm:px-6 py-5 sm:py-6">{children}</div>
  </section>
);

const Row = ({ icon: Icon, label, value, editing, name, type = "text", onChange, placeholder, options = null }) => {
  if (editing) {
    return (
      <li className="flex items-start gap-3 py-2">
        <span className="mt-1 inline-flex h-6 w-6 items-center justify-center text-white bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg shrink-0 shadow-md ring-1 ring-violet-200">
          <Icon className="h-4 w-4" />
        </span>
        <label className="flex-1">
          <span className="block text-xs font-bold text-slate-700 mb-1.5">{label}</span>
          {type === "textarea" ? (
            <textarea
              name={name}
              value={value || ""}
              onChange={onChange}
              placeholder={placeholder}
              className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none ring-transparent transition-all duration-200 placeholder:text-slate-400 hover:border-violet-300 hover:shadow-md focus:border-violet-500 focus:ring-4 focus:ring-violet-500/30 font-medium"
              rows={3}
            />
          ) : options ? (
            <select
              name={name}
              value={value || ""}
              onChange={onChange}
              className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none ring-transparent transition-all duration-200 hover:border-violet-300 hover:shadow-md focus:border-violet-500 focus:ring-4 focus:ring-violet-500/30 font-medium"
            >
              <option value="">Seleccionar...</option>
              {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : (
            <input
              name={name}
              type={type}
              value={value || ""}
              onChange={onChange}
              placeholder={placeholder}
              className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none ring-transparent transition-all duration-200 placeholder:text-slate-400 hover:border-violet-300 hover:shadow-md focus:border-violet-500 focus:ring-4 focus:ring-violet-500/30 font-medium"
            />
          )}
        </label>
      </li>
    );
  }

  return (
    <li className="flex items-start gap-3 py-2 group">
      <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center text-white bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg group-hover:from-violet-600 group-hover:to-indigo-700 shadow-md ring-1 ring-violet-200 transition-all duration-200 group-hover:scale-110">
        <Icon className="h-4 w-4" />
      </span>
      <p className="text-[15px] leading-relaxed flex-1">
        <span className="font-bold text-slate-800">{label}: </span>
        <span className="text-slate-700">{value || "—"}</span>
      </p>
    </li>
  );
};

const StatPill = ({ value, label }) => (
  <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-white/95 px-3 sm:px-4 py-3 sm:py-4 shadow-md ring-2 ring-white/50 hover:shadow-lg hover:scale-105 transition-all duration-200 min-w-0">
    <span className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-violet-600 to-indigo-600">
      {value}
    </span>
    <span className="text-[10px] sm:text-[11px] font-extrabold tracking-wide text-slate-800 text-center break-words">
      {label.toUpperCase()}
    </span>
  </div>
);

/* ------------------------ tarjeta de perfil ----------------------- */

const ProfileCard = ({ user, stats = {}, onEdit, editing, onSave, onCancel, saving }) => {
  const { cursos = 0, estudiantes = 0, certificados = 0, generaciones = 0 } = stats;

  return (
    <aside className="rounded-3xl border-2 border-violet-200/70 bg-gradient-to-br from-violet-50/50 via-indigo-50/50 to-purple-50/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 ring-2 ring-violet-100/50 sticky top-24">
      <div className="rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-600 p-5 sm:p-6 text-white ring-4 ring-white/20 shadow-2xl">
        {/* avatar + nombre */}
        <div className="flex flex-col items-center text-center">
          <div className="relative group">
            <img
              src={user?.avatar || "https://i.pravatar.cc/150?img=12"}
              alt={user?.name || "Asesor"}
              className="h-28 w-28 rounded-3xl object-cover ring-4 ring-white/40 shadow-2xl transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-400/20 to-indigo-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <h3 className="mt-5 text-lg sm:text-xl font-black tracking-tight break-words max-w-full px-2 line-clamp-2">
            {user?.name || "Asesor"}
          </h3>
          <p className="text-xs sm:text-sm font-medium opacity-95 mt-1 break-words max-w-full px-2">
            {user?.role || "Asesor"}
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm ring-2 ring-white/30 shadow-md max-w-full">
            <Clock className="h-3.5 w-3.5 flex-shrink-0" />
            <p className="text-[11px] sm:text-[12px] font-extrabold tracking-wide whitespace-nowrap">
              ASESOR DESDE {user?.since || "2023"}
            </p>
          </div>
        </div>

        {/* stats */}
        <div className="mt-6 grid grid-cols-2 gap-2 sm:gap-3">
          <StatPill value={cursos} label="Cursos" />
          <StatPill value={estudiantes} label="Estudiantes" />
          <StatPill value={certificados} label="Certificados" />
          <StatPill value={generaciones} label="Generaciones" />
        </div>
      </div>

      {editing ? (
        <div className="mt-5 grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <button
            onClick={onCancel}
            disabled={saving}
            className="w-full rounded-2xl px-3 py-3.5 font-bold shadow-md transition-all duration-200 flex items-center justify-center gap-2 border-2 border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-400 hover:text-slate-800 hover:shadow-lg disabled:opacity-50"
          >
            <X className="h-5 w-5 flex-shrink-0" />
            <span className="whitespace-nowrap">Cancelar</span>
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="w-full rounded-2xl px-3 py-3.5 font-bold shadow-lg transition-all duration-200 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white ring-2 ring-violet-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-5 w-5 animate-spin flex-shrink-0" />
            ) : (
              <Save className="h-5 w-5 flex-shrink-0" />
            )}
            <span className="whitespace-nowrap">{saving ? '...' : 'Guardar'}</span>
          </button>
        </div>
      ) : (
        <button
          onClick={onEdit}
          className="mt-5 w-full rounded-2xl px-4 py-3.5 font-bold shadow-lg transition-all duration-200 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white ring-2 ring-violet-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
        >
          <Edit className="h-5 w-5 flex-shrink-0" />
          <span className="whitespace-nowrap">Editar perfil</span>
        </button>
      )}
    </aside>
  );
};

/* ----------------------- página de perfil ------------------------- */

export default function AsesorPerfil() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editing, setEditing] = useState(false);
  const [perfilData, setPerfilData] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);

  // Formulario
  const [form, setForm] = useState({});

  // Cargar datos
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [perfilRes, estudiantesRes] = await Promise.all([
          getMiPerfil().catch(() => ({ data: null })),
          getMisEstudiantes().catch(() => ({ data: null })),
        ]);
        if (!alive) return;

        const data = perfilRes?.data?.data || null;
        setPerfilData(data);

        // Inicializar formulario
        if (data) {
          setForm({
            nombres: data.preregistro?.nombres || "",
            apellidos: data.preregistro?.apellidos || "",
            correo: data.preregistro?.correo || "",
            telefono: data.preregistro?.telefono || "",
            direccion: data.perfil?.direccion || "",
            municipio: data.perfil?.municipio || "",
            nacimiento: data.perfil?.nacimiento ? data.perfil.nacimiento.split('T')[0] : "",
            nacionalidad: data.perfil?.nacionalidad || "",
            genero: data.perfil?.genero || "",
            rfc: data.perfil?.rfc || "",
            nivel_estudios: data.perfil?.nivel_estudios || "",
            institucion: data.perfil?.institucion || "",
            titulo_academico: data.perfil?.titulo_academico ? "1" : "0",
            anio_graduacion: data.perfil?.anio_graduacion || "",
            experiencia_rango: data.perfil?.experiencia_rango || "",
            areas_especializacion: Array.isArray(data.perfil?.areas_especializacion)
              ? data.perfil.areas_especializacion.join(', ')
              : (data.perfil?.areas_especializacion || ""),
            empresa: data.perfil?.empresa || "",
            ultimo_puesto: data.perfil?.ultimo_puesto || "",
            funciones: data.perfil?.funciones || "",
            plataformas: Array.isArray(data.perfil?.plataformas)
              ? data.perfil.plataformas.join(', ')
              : (data.perfil?.plataformas || ""),
            curp: data.perfil?.curp || "",
            entidad_curp: data.perfil?.entidad_curp || "",
          });
        }

        const list = estudiantesRes?.data?.data || estudiantesRes?.data?.estudiantes || [];
        setEstudiantes(Array.isArray(list) ? list : []);
      } catch (e) {
        if (alive) setError(e?.response?.data?.message || 'Error cargando perfil');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setSuccess(null);
    setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        nombres: form.nombres?.trim() || undefined,
        apellidos: form.apellidos?.trim() || undefined,
        correo: form.correo?.trim() || undefined,
        telefono: form.telefono?.trim() || undefined,
        direccion: form.direccion?.trim() || undefined,
        municipio: form.municipio?.trim() || undefined,
        nacimiento: form.nacimiento || undefined,
        nacionalidad: form.nacionalidad?.trim() || undefined,
        genero: form.genero?.trim() || undefined,
        rfc: form.rfc?.trim() || undefined,
        nivel_estudios: form.nivel_estudios?.trim() || undefined,
        institucion: form.institucion?.trim() || undefined,
        titulo_academico: form.titulo_academico === "1" ? true : (form.titulo_academico === "0" ? false : undefined),
        anio_graduacion: form.anio_graduacion ? Number(form.anio_graduacion) : undefined,
        experiencia_rango: form.experiencia_rango?.trim() || undefined,
        areas_especializacion: form.areas_especializacion?.trim()
          ? form.areas_especializacion.split(',').map(s => s.trim()).filter(Boolean)
          : undefined,
        empresa: form.empresa?.trim() || undefined,
        ultimo_puesto: form.ultimo_puesto?.trim() || undefined,
        funciones: form.funciones?.trim() || undefined,
        plataformas: form.plataformas?.trim()
          ? form.plataformas.split(',').map(s => s.trim()).filter(Boolean)
          : undefined,
        curp: form.curp?.trim() || undefined,
        entidad_curp: form.entidad_curp?.trim() || undefined,
      };

      // Eliminar campos undefined
      Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

      const { data } = await updateMiPerfil(payload);
      setPerfilData(data?.data || perfilData);
      setEditing(false);
      setSuccess('Perfil actualizado correctamente');

      // Recargar datos
      const { data: refreshData } = await getMiPerfil();
      setPerfilData(refreshData?.data || null);

      setTimeout(() => setSuccess(null), 3000);
    } catch (e) {
      setError(e?.response?.data?.message || 'Error al guardar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Restaurar formulario
    if (perfilData) {
      setForm({
        nombres: perfilData.preregistro?.nombres || "",
        apellidos: perfilData.preregistro?.apellidos || "",
        correo: perfilData.preregistro?.correo || "",
        telefono: perfilData.preregistro?.telefono || "",
        direccion: perfilData.perfil?.direccion || "",
        municipio: perfilData.perfil?.municipio || "",
        nacimiento: perfilData.perfil?.nacimiento ? perfilData.perfil.nacimiento.split('T')[0] : "",
        nacionalidad: perfilData.perfil?.nacionalidad || "",
        genero: perfilData.perfil?.genero || "",
        rfc: perfilData.perfil?.rfc || "",
        nivel_estudios: perfilData.perfil?.nivel_estudios || "",
        institucion: perfilData.perfil?.institucion || "",
        titulo_academico: perfilData.perfil?.titulo_academico ? "1" : "0",
        anio_graduacion: perfilData.perfil?.anio_graduacion || "",
        experiencia_rango: perfilData.perfil?.experiencia_rango || "",
        areas_especializacion: Array.isArray(perfilData.perfil?.areas_especializacion)
          ? perfilData.perfil.areas_especializacion.join(', ')
          : (perfilData.perfil?.areas_especializacion || ""),
        empresa: perfilData.perfil?.empresa || "",
        ultimo_puesto: perfilData.perfil?.ultimo_puesto || "",
        funciones: perfilData.perfil?.funciones || "",
        plataformas: Array.isArray(perfilData.perfil?.plataformas)
          ? perfilData.perfil.plataformas.join(', ')
          : (perfilData.perfil?.plataformas || ""),
        curp: perfilData.perfil?.curp || "",
        entidad_curp: perfilData.perfil?.entidad_curp || "",
      });
    }
    setEditing(false);
    setError(null);
  };

  const fullName = useMemo(() => {
    if (!perfilData) return "Asesor";
    const n = perfilData.preregistro?.nombres || '';
    const a = perfilData.preregistro?.apellidos || '';
    return `${n} ${a}`.trim() || "Asesor";
  }, [perfilData]);

  const avatarUrl = useMemo(() => {
    if (!perfilData) return "https://i.pravatar.cc/150?img=12";
    const fotoUrl = perfilData.perfil?.foto_url;
    const doc = perfilData.perfil?.doc_fotografia;
    return fotoUrl || (doc ? buildStaticUrl(doc) : "https://i.pravatar.cc/150?img=12");
  }, [perfilData]);

  const stats = useMemo(() => {
    const cursos = new Set();
    let estudiantesCount = 0;
    if (Array.isArray(estudiantes)) {
      estudiantesCount = estudiantes.length;
      for (const e of estudiantes) {
        const c = e.curso || e.carrera || e.plan_estudio || null;
        if (c) cursos.add(String(c).trim());
      }
    }
    return { cursos: cursos.size, estudiantes: estudiantesCount, certificados: 0, generaciones: 0 };
  }, [estudiantes]);

  const fmt = (v) => (v == null || v === '' ? '—' : String(v));
  const fmtDate = (d) => {
    if (!d) return '—';
    try {
      const dt = new Date(d);
      return isNaN(dt) ? String(d) : dt.toLocaleDateString('es-MX');
    } catch {
      return String(d);
    }
  };

  const userCard = {
    name: fullName,
    role: (Array.isArray(perfilData?.perfil?.areas_especializacion) && perfilData.perfil.areas_especializacion.length > 0)
      ? perfilData.perfil.areas_especializacion[0]
      : 'Asesor',
    since: (perfilData?.perfil?.created_at ? new Date(perfilData.perfil.created_at).getFullYear() : new Date().getFullYear()),
    avatar: avatarUrl
  };

  // Opciones para selects
  const generoOptions = [
    { value: "Masculino", label: "Masculino" },
    { value: "Femenino", label: "Femenino" },
    { value: "Otro", label: "Otro" },
    { value: "Prefiero no decir", label: "Prefiero no decir" }
  ];

  const nivelEstudiosOptions = [
    { value: "Bachillerato", label: "Bachillerato" },
    { value: "Técnico", label: "Técnico" },
    { value: "Licenciatura", label: "Licenciatura" },
    { value: "Maestría", label: "Maestría" },
    { value: "Doctorado", label: "Doctorado" },
    { value: "Postdoctorado", label: "Postdoctorado" }
  ];

  const experienciaOptions = [
    { value: "Menos de 1 año", label: "Menos de 1 año" },
    { value: "1-3 años", label: "1-3 años" },
    { value: "3-5 años", label: "3-5 años" },
    { value: "5-10 años", label: "5-10 años" },
    { value: "Más de 10 años", label: "Más de 10 años" }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (error && !perfilData) {
    return (
      <div className="text-center py-16">
        <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen relative">
      <div className="fixed inset-0 bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 -z-50"></div>
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-xl ring-2 ring-violet-200">
              <User2 className="size-8 sm:size-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-2 tracking-tight leading-tight">
                <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent inline-block" style={{ lineHeight: '1.1', paddingBottom: '2px' }}>
                  Mi Perfil
                </span>
              </h1>
              <p className="text-slate-600 text-sm sm:text-base font-medium">
                Gestiona tu información personal y profesional
              </p>
            </div>
          </div>
        </div>

        {/* Mensajes de éxito/error */}
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl text-red-700 flex items-center gap-3 shadow-md ring-2 ring-red-100">
            <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-md">
              <XCircle className="size-4" />
            </div>
            <span className="flex-1 font-bold">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto p-1 hover:bg-red-100 rounded-lg transition-colors"
              aria-label="Cerrar mensaje de error"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl text-green-700 flex items-center gap-3 shadow-md ring-2 ring-green-100">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md">
              <CheckCircle2 className="size-4" />
            </div>
            <span className="flex-1 font-bold">{success}</span>
            <button
              onClick={() => setSuccess(null)}
              className="ml-auto p-1 hover:bg-green-100 rounded-lg transition-colors"
              aria-label="Cerrar mensaje de éxito"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {perfilData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* columna izquierda (info) */}
            <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">

              {/* Datos personales */}
              <SectionCard title="Datos personales">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ul className="space-y-1">
                    <Row icon={Mail} label="Correo electrónico" value={fmt(perfilData?.preregistro?.correo)}
                      editing={editing} name="correo" type="email" onChange={handleChange}
                      placeholder="correo@ejemplo.com" />
                    <Row icon={MapPin} label="Dirección" value={fmt(perfilData?.perfil?.direccion)}
                      editing={editing} name="direccion" onChange={handleChange}
                      placeholder="Calle y número" />
                    <Row icon={Users2} label="Municipio" value={fmt(perfilData?.perfil?.municipio)}
                      editing={editing} name="municipio" onChange={handleChange}
                      placeholder="Nombre del municipio" />
                    <Row icon={Phone} label="Número de teléfono" value={fmt(perfilData?.preregistro?.telefono)}
                      editing={editing} name="telefono" type="tel" onChange={handleChange}
                      placeholder="55 1234 5678" />
                    <Row icon={CalendarDays} label="Fecha de nacimiento"
                      value={fmtDate(perfilData?.perfil?.nacimiento)}
                      editing={editing} name="nacimiento" type="date" onChange={handleChange} />
                  </ul>
                  <ul className="space-y-1">
                    <Row icon={User2} label="Nombres" value={fmt(perfilData?.preregistro?.nombres)}
                      editing={editing} name="nombres" onChange={handleChange}
                      placeholder="Nombres" />
                    <Row icon={User2} label="Apellidos" value={fmt(perfilData?.preregistro?.apellidos)}
                      editing={editing} name="apellidos" onChange={handleChange}
                      placeholder="Apellidos" />
                    <Row icon={Flag} label="Nacionalidad" value={fmt(perfilData?.perfil?.nacionalidad)}
                      editing={editing} name="nacionalidad" onChange={handleChange}
                      placeholder="Mexicana" />
                    <Row icon={User2} label="Género" value={fmt(perfilData?.perfil?.genero)}
                      editing={editing} name="genero" onChange={handleChange}
                      options={generoOptions} />
                    <Row icon={BadgeCheck} label="RFC" value={fmt(perfilData?.perfil?.rfc)}
                      editing={editing} name="rfc" onChange={handleChange}
                      placeholder="RFC123456789" />
                  </ul>
                </div>
              </SectionCard>

              {/* Datos académicos */}
              <SectionCard title="Datos académicos">
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                  <Row icon={GraduationCap} label="Nivel máximo de estudios"
                    value={fmt(perfilData?.perfil?.nivel_estudios)}
                    editing={editing} name="nivel_estudios" onChange={handleChange}
                    options={nivelEstudiosOptions} />
                  <Row icon={BookOpenCheck} label="Título académico"
                    value={perfilData?.perfil?.titulo_academico ? "Sí" : "No"}
                    editing={editing} name="titulo_academico" onChange={handleChange}
                    options={[{ value: "1", label: "Sí" }, { value: "0", label: "No" }]} />
                  <Row icon={School} label="Institución educativa"
                    value={fmt(perfilData?.perfil?.institucion)}
                    editing={editing} name="institucion" onChange={handleChange}
                    placeholder="Nombre de la institución" />
                  <Row icon={CalendarDays} label="Año de graduación"
                    value={fmt(perfilData?.perfil?.anio_graduacion)}
                    editing={editing} name="anio_graduacion" type="number" onChange={handleChange}
                    placeholder="2020" />
                </ul>
              </SectionCard>

              {/* Datos profesionales */}
              <SectionCard title="Datos profesionales">
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                  <Row icon={BriefcaseBusiness} label="Experiencia laboral"
                    value={fmt(perfilData?.perfil?.experiencia_rango)}
                    editing={editing} name="experiencia_rango" onChange={handleChange}
                    options={experienciaOptions} />
                  <Row icon={Brain} label="Áreas de especialización"
                    value={fmt(Array.isArray(perfilData?.perfil?.areas_especializacion)
                      ? perfilData.perfil.areas_especializacion.join(', ')
                      : perfilData?.perfil?.areas_especializacion)}
                    editing={editing} name="areas_especializacion" onChange={handleChange}
                    placeholder="Matemáticas, Física (separar con comas)" />
                  <Row icon={School} label="Institución actual"
                    value={fmt(perfilData?.perfil?.empresa || 'MQerKAcademy')}
                    editing={editing} name="empresa" onChange={handleChange}
                    placeholder="Nombre de la institución" />
                  <Row icon={User2} label="Puesto actual"
                    value={fmt(perfilData?.perfil?.ultimo_puesto || 'Asesor')}
                    editing={editing} name="ultimo_puesto" onChange={handleChange}
                    placeholder="Asesor, Profesor, etc." />
                  <Row icon={Users2} label="Función"
                    value={fmt(perfilData?.perfil?.funciones || 'Asesorar y entrenar')}
                    editing={editing} name="funciones" type="textarea" onChange={handleChange}
                    placeholder="Descripción de tus funciones" />
                  <Row icon={Boxes} label="Plataformas EDTECH"
                    value={fmt(Array.isArray(perfilData?.perfil?.plataformas)
                      ? perfilData.perfil.plataformas.join(', ')
                      : perfilData?.perfil?.plataformas)}
                    editing={editing} name="plataformas" onChange={handleChange}
                    placeholder="Google Classroom, Moodle (separar con comas)" />
                </ul>
              </SectionCard>
            </div>

            {/* columna derecha (tarjeta) */}
            <div className="lg:col-span-1 order-1 lg:order-2">
              <ProfileCard
                user={userCard}
                stats={stats}
                editing={editing}
                onEdit={() => setEditing(true)}
                onSave={handleSave}
                onCancel={handleCancel}
                saving={saving}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}