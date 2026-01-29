// AsesorPerfil.jsx
import React from "react";
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
  // demo data – reemplaza por los tuyos
  const user = {
    name: "Lic. César Emilio Lagunes Batalla",
    role: "English Teacher",
    since: "2023",
    avatar:
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=256&fit=crop",
  };

  const stats = { cursos: 3, estudiantes: 56, certificados: 2, generaciones: 2 };

  const personalesL = [
    { icon: Mail, label: "Correo electrónico", value: "cesar.batalla@mqerkacademy.com" },
    { icon: MapPin, label: "Dirección", value: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" },
    { icon: Users2, label: "Municipio", value: "San Juan Bautista Tuxtepec Oaxaca" },
    { icon: Phone, label: "Número de teléfono", value: "287-XXX-XXXX" },
    { icon: CalendarDays, label: "Fecha de nacimiento", value: "19/MES/AÑO" },
  ];

  const personalesR = [
    { icon: Flag, label: "Nacionalidad", value: "Mexicana" },
    { icon: User2, label: "Género", value: "Masculino" },
    { icon: HeartHandshake, label: "Estado civil", value: "Soltero" },
    { icon: BadgeCheck, label: "RFC", value: "XXXXXXXXX" },
  ];

  const academicos = [
    { icon: GraduationCap, label: "Nivel máximo de estudios", value: "Licenciatura" },
    { icon: BookOpenCheck, label: "Título académico", value: "XXXXXXXXXXXXXXXXXXXXXX" },
    { icon: School, label: "Institución educativa", value: "UMAD" },
    { icon: CalendarDays, label: "Año de graduación", value: "2024" },
    { icon: Languages, label: "Idiomas", value: "Español e Inglés" },
    { icon: Clock, label: "Disponibilidad", value: "Miércoles y Jueves" },
    { icon: Ruler, label: "Horario", value: "12:00 pm - 5:00 pm" },
    { icon: BadgeCheck, label: "Certificaciones", value: "Sí" },
  ];

  const profesionales = [
    { icon: BriefcaseBusiness, label: "Experiencia laboral", value: "1-2 años" },
    { icon: Sparkles, label: "Experiencia previa en asesorías", value: "Sí" },
    { icon: Users2, label: "Función", value: "Asesorar y entrenar" },
    { icon: Boxes, label: "Plataformas EDTECH", value: "CANVA, EXCEL, OTRAS" },
    { icon: School, label: "Institución actual", value: "MQerKAcademy" },
    { icon: Brain, label: "Áreas de especialización", value: "Idiomas" },
    { icon: User2, label: "Puesto actual", value: "English Teacher" },
  ];

  return (
    <div className="max-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
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
            user={user}
            stats={stats}
            onEdit={() => alert("Abrir modal para editar perfil")}
          />
        </div>
      </div>
    </div>
  );
}
