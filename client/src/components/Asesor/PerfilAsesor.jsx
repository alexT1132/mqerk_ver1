// AsesorPerfil.jsx (conectado a backend)
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMiPerfil, updateMiPerfil, getMisEstudiantes } from "../../api/asesores.js";
import { buildStaticUrl } from "../../utils/url.js";
import {
  Mail, MapPin, Phone, CalendarDays, Flag, User2, HeartHandshake,
  GraduationCap, School, Ruler, Languages, Clock, BadgeCheck,
  BriefcaseBusiness, Sparkles, Boxes, BookOpenCheck, Brain, Users2,
  Edit, X, Save, Loader2, CheckCircle2, XCircle
} from "lucide-react";

/* --------------------------- helpers UI --------------------------- */

const SectionCard = ({ title, children }) => (
  <section className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm">
    <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100">
      <div className="inline-flex items-center gap-2 rounded-xl bg-violet-50/80 px-3 py-1 ring-1 ring-violet-200">
        <span className="text-sm font-black tracking-wide text-violet-700">
          {title.toUpperCase()}
        </span>
      </div>
    </div>
    <div className="px-4 sm:px-6 py-4 sm:py-5">{children}</div>
  </section>
);

const Row = ({ icon: Icon, label, value, editing, name, type = "text", onChange, placeholder, options = null }) => {
  if (editing) {
    return (
      <li className="flex items-start gap-3 py-2">
        <span className="mt-1 inline-flex h-5 w-5 items-center justify-center text-violet-600 shrink-0">
          <Icon className="h-4 w-4" />
        </span>
        <label className="flex-1">
          <span className="block text-xs font-semibold text-slate-700 mb-1">{label}</span>
          {type === "textarea" ? (
            <textarea
              name={name}
              value={value || ""}
              onChange={onChange}
              placeholder={placeholder}
              className="w-full rounded-lg border-2 border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-transparent transition placeholder:text-slate-400 hover:border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
              rows={3}
            />
          ) : options ? (
            <select
              name={name}
              value={value || ""}
              onChange={onChange}
              className="w-full rounded-lg border-2 border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-transparent transition hover:border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
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
              className="w-full rounded-lg border-2 border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-transparent transition placeholder:text-slate-400 hover:border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
            />
          )}
        </label>
      </li>
    );
  }
  
  return (
    <li className="flex items-start gap-3 py-1.5">
      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center text-violet-600">
        <Icon className="h-4 w-4" />
      </span>
      <p className="text-[15px] leading-relaxed">
        <span className="font-semibold text-slate-800">{label}: </span>
        <span className="text-slate-700">{value || "—"}</span>
      </p>
    </li>
  );
};

const StatPill = ({ value, label }) => (
  <div className="flex items-center gap-3 rounded-xl bg-white/90 px-4 py-3 shadow-sm ring-1 ring-slate-200">
    <span className="grid h-8 w-8 place-items-center rounded-lg bg-pink-50 font-extrabold text-pink-600">
      {value}
    </span>
    <span className="text-[13px] font-semibold tracking-wide text-slate-800">
      {label.toUpperCase()}
    </span>
  </div>
);

/* ------------------------ tarjeta de perfil ----------------------- */

const ProfileCard = ({ user, stats = {}, onEdit, editing }) => {
  const { cursos=0, estudiantes=0, certificados=0, generaciones=0 } = stats;

  return (
    <aside className="rounded-3xl border border-violet-200/70 bg-gradient-to-br from-violet-600/10 via-indigo-600/10 to-sky-600/10 p-5 shadow-lg">
      <div className="rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-600 p-5 text-white ring-1 ring-white/20 shadow-xl">
        {/* avatar + nombre */}
        <div className="flex flex-col items-center text-center">
          <img
            src={user?.avatar || "https://i.pravatar.cc/150?img=12"}
            alt={user?.name || "Asesor"}
            className="h-24 w-24 rounded-2xl object-cover ring-4 ring-white/30 shadow-lg"
          />
          <h3 className="mt-4 text-lg font-black">{user?.name}</h3>
          <p className="text-sm opacity-90">{user?.role || "Asesor"}</p>
          <p className="mt-1 text-[12px] tracking-wide opacity-80">
            ASESOR DESDE {user?.since || "2023"}
          </p>
        </div>

        {/* stats */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <StatPill value={cursos} label="Cursos" />
          <StatPill value={estudiantes} label="Estudiantes" />
          <StatPill value={certificados} label="Certificados" />
          <StatPill value={generaciones} label="Generaciones" />
        </div>
      </div>

      <button
        onClick={onEdit}
        disabled={editing}
        className={`mt-4 w-full rounded-2xl px-4 py-3 font-semibold shadow-lg transition ${
          editing 
            ? 'bg-slate-400 text-white cursor-not-allowed' 
            : 'bg-violet-600 text-white hover:bg-violet-700'
        }`}
      >
        {editing ? 'Editando...' : 'Editar perfil'}
      </button>
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
    <div className="w-full min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Mensajes de éxito/error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
            <XCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {perfilData && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* columna izquierda (info) */}
            <div className="xl:col-span-2 space-y-6">
              {/* Barra de acciones en modo edición */}
              {editing && (
                <div className="flex items-center justify-between p-4 bg-violet-50 rounded-xl border-2 border-violet-200">
                  <span className="text-violet-700 font-semibold">Modo edición</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="px-4 py-2 rounded-lg border-2 border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                      <X className="h-4 w-4 inline mr-1" />
                      Cancelar
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold hover:from-violet-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Guardar cambios
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Datos personales */}
              <SectionCard title="Datos personales">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <ul>
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
                  <ul>
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
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
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
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
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
            <div className="xl:col-span-1">
              <ProfileCard
                user={userCard}
                stats={stats}
                editing={editing}
                onEdit={() => setEditing(true)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
