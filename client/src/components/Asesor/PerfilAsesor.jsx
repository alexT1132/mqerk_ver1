// AsesorPerfil.jsx (conectado a backend)
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { getPerfil, getPreRegistro, getMisEstudiantes } from "../../api/asesores.js";
import { buildStaticUrl } from "../../utils/url.js";
import {
  Mail, MapPin, Phone, CalendarDays, Flag, User2, HeartHandshake,
  GraduationCap, School, Ruler, Languages, Clock, BadgeCheck,
  BriefcaseBusiness, Sparkles, Boxes, BookOpenCheck, Brain, Users2
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

const Row = ({ icon: Icon, label, value }) => (
  <li className="flex items-start gap-3 py-1.5">
    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center text-violet-600">
      <Icon className="h-4 w-4" />
    </span>
    <p className="text-[15px] leading-relaxed">
      <span className="font-semibold text-slate-800">{label}: </span>
      <span className="text-slate-700">{value}</span>
    </p>
  </li>
);

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

const ProfileCard = ({ user, stats = {}, onEdit }) => {
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
          <p className="text-sm opacity-90">{user?.role || "English Teacher"}</p>
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
        className="mt-4 w-full rounded-2xl bg-violet-600 px-4 py-3 text-white font-semibold shadow-lg hover:bg-violet-700 transition"
      >
        Editar perfil
      </button>
    </aside>
  );
};

/* ----------------------- página de perfil ------------------------- */

export default function AsesorPerfil() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [prereg, setPrereg] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);

  const preregistroId = user?.asesor_profile?.preregistro_id || user?.asesor_profile?.preregistroId || null;

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!preregistroId) {
        setLoading(false); setError('No se encontró el perfil del asesor en tu sesión.');
        return;
      }
      setLoading(true); setError(null);
      try {
        const [perfilRes, preRes, estudiantesRes] = await Promise.all([
          getPerfil(preregistroId).catch(() => ({ data: null })),
          getPreRegistro(preregistroId).catch(() => ({ data: null })),
          getMisEstudiantes().catch(() => ({ data: null })),
        ]);
        if (!alive) return;
        setPerfil(perfilRes?.data?.perfil || user?.asesor_profile || null);
        setPrereg(preRes?.data?.preregistro || null);
        const list = estudiantesRes?.data?.data || estudiantesRes?.data?.estudiantes || [];
        setEstudiantes(Array.isArray(list) ? list : []);
      } catch (e) {
        if (alive) setError(e?.response?.data?.message || 'Error cargando perfil');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [preregistroId]);

  const fullName = useMemo(() => {
    const n = prereg?.nombres || perfil?.nombres || '';
    const a = prereg?.apellidos || perfil?.apellidos || '';
    return `${n} ${a}`.trim() || (user?.usuario || 'Asesor');
  }, [prereg, perfil, user]);

  const avatarUrl = useMemo(() => {
    const doc = perfil?.doc_fotografia || perfil?.foto || null;
    return doc ? buildStaticUrl(doc) : "https://i.pravatar.cc/150?img=12";
  }, [perfil]);

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
    try { const dt = new Date(d); return isNaN(dt) ? String(d) : dt.toLocaleDateString(); } catch { return String(d); }
  };

  const userCard = { name: fullName, role: (perfil?.areas_especializacion?.[0] || 'Asesor'), since: (perfil?.created_at ? new Date(perfil.created_at).getFullYear() : '—'), avatar: avatarUrl };

  const personalesL = [
    { icon: Mail, label: "Correo electrónico", value: fmt(prereg?.correo) },
    { icon: MapPin, label: "Dirección", value: fmt(perfil?.direccion) },
    { icon: Users2, label: "Municipio", value: fmt(perfil?.municipio) },
    { icon: Phone, label: "Número de teléfono", value: fmt(prereg?.telefono) },
    { icon: CalendarDays, label: "Fecha de nacimiento", value: fmtDate(perfil?.nacimiento) },
  ];

  const personalesR = [
    { icon: Flag, label: "Nacionalidad", value: fmt(perfil?.nacionalidad) },
    { icon: User2, label: "Género", value: fmt(perfil?.genero) },
    { icon: HeartHandshake, label: "Estado civil", value: fmt(perfil?.estado_civil) },
    { icon: BadgeCheck, label: "RFC", value: fmt(perfil?.rfc) },
  ];

  const academicos = [
    { icon: GraduationCap, label: "Nivel máximo de estudios", value: fmt(perfil?.nivel_estudios) },
    { icon: BookOpenCheck, label: "Título académico", value: fmt(perfil?.titulo_academico) },
    { icon: School, label: "Institución educativa", value: fmt(perfil?.institucion) },
    { icon: CalendarDays, label: "Año de graduación", value: fmt(perfil?.anio_graduacion) },
    { icon: Languages, label: "Idiomas", value: fmt((perfil?.idiomas || (Array.isArray(perfil?.areas_especializacion) ? perfil.areas_especializacion.join(', ') : null))) },
    { icon: Clock, label: "Disponibilidad", value: fmt(perfil?.disponibilidad) },
    { icon: Ruler, label: "Horario", value: fmt(perfil?.horario) },
    { icon: BadgeCheck, label: "Certificaciones", value: fmt(perfil?.certificaciones || (perfil?.doc_certificaciones ? 'Sí' : '—')) },
  ];

  const profesionales = [
    { icon: BriefcaseBusiness, label: "Experiencia laboral", value: fmt(perfil?.experiencia_rango) },
    { icon: Sparkles, label: "Experiencia previa en asesorías", value: fmt(perfil?.experiencia_asesorias) },
    { icon: Users2, label: "Función", value: fmt(perfil?.funciones || 'Asesorar y entrenar') },
    { icon: Boxes, label: "Plataformas EDTECH", value: fmt(Array.isArray(perfil?.plataformas) ? perfil.plataformas.join(', ') : perfil?.plataformas) },
    { icon: School, label: "Institución actual", value: fmt(perfil?.empresa || 'MQerKAcademy') },
    { icon: Brain, label: "Áreas de especialización", value: fmt(Array.isArray(perfil?.areas_especializacion) ? perfil.areas_especializacion.join(', ') : perfil?.areas_especializacion) },
    { icon: User2, label: "Puesto actual", value: fmt(perfil?.ultimo_puesto || 'Asesor') },
  ];

  return (
    <div className="max-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {loading && <div className="text-sm text-purple-700">Cargando perfil…</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
      {!loading && !error && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* columna izquierda (info) */}
          <div className="xl:col-span-2 space-y-6">
            <SectionCard title="Datos personales">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <ul>{personalesL.map((i, idx) => <Row key={idx} {...i} />)}</ul>
                <ul>{personalesR.map((i, idx) => <Row key={idx} {...i} />)}</ul>
              </div>
            </SectionCard>

            <SectionCard title="Datos académicos">
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                {academicos.map((i, idx) => <Row key={idx} {...i} />)}
              </ul>
            </SectionCard>

            <SectionCard title="Datos profesionales">
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                {profesionales.map((i, idx) => <Row key={idx} {...i} />)}
              </ul>
            </SectionCard>
          </div>

          {/* columna derecha (tarjeta) */}
          <div className="xl:col-span-1">
            <ProfileCard
              user={userCard}
              stats={stats}
              onEdit={() => alert("Abrir modal para editar perfil")}
            />
          </div>
        </div>
      )}
    </div>
  );
}
