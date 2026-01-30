// AreasInteres.jsx
import {
  ArrowLeft,
  Brain,
  ArrowRight,
  FlaskConical,
  Users2,
  BookOpenText,
  HeartPulse,
  Cog,
  BriefcaseBusiness,
  Dumbbell,
  Sprout,
  Plane,
  Landmark,
  Anchor,
  ScanLine,
} from "lucide-react";
import ModulosEspecificos from "../common/ModulosEspecificos";

/* -------------------------------------------
   Datos de las áreas (12)
-------------------------------------------- */
const AREAS = [
  {
    id: "exactas",
    title: "Ciencias Exactas",
    desc: "Matemáticas, Física, Química y afines",
    icon: FlaskConical,
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    id: "sociales",
    title: "Ciencias Sociales",
    desc: "Sociología, Psicología y más",
    icon: Users2,
    gradient: "from-fuchsia-500 to-violet-600",
  },
  {
    id: "humanidades",
    title: "Humanidades y Artes",
    desc: "Literatura, Historia, Filosofía",
    icon: BookOpenText,
    gradient: "from-pink-500 to-rose-600",
  },
  {
    id: "salud",
    title: "Ciencias de la Salud",
    desc: "Biología, Medicina, Enfermería",
    icon: HeartPulse,
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    id: "ingenieria",
    title: "Ingeniería y Tecnología",
    desc: "Ingenierías, Sistemas, Tecnología",
    icon: Cog,
    gradient: "from-amber-500 to-orange-600",
  },
  {
    id: "eco-admin",
    title: "Económico-Administrativas",
    desc: "Administración, Economía, Negocios",
    icon: BriefcaseBusiness,
    gradient: "from-cyan-600 to-indigo-600",
  },
  {
    id: "educ-deportes",
    title: "Educación y Deportes",
    desc: "Pedagogía y deportes",
    icon: Dumbbell,
    gradient: "from-violet-600 to-indigo-600",
  },
  {
    id: "agropecuarias",
    title: "Agropecuarias",
    desc: "Agronomía, Veterinaria, Zootecnia",
    icon: Sprout,
    gradient: "from-lime-600 to-emerald-600",
  },
  {
    id: "turismo",
    title: "Turismo",
    desc: "Gestión turística y hotelería",
    icon: Plane,
    gradient: "from-sky-500 to-indigo-600",
  },
  {
    id: "unam",
    title: "Núcleo UNAM / IPN",
    desc: "Materias esenciales de ingreso",
    icon: Landmark,
    gradient: "from-yellow-500 to-orange-600",
  },
  {
    id: "naval",
    title: "Militar / Naval / Náutica",
    desc: "Fuerzas e instituciones navales",
    icon: Anchor,
    gradient: "from-slate-600 to-slate-800",
  },
  {
    id: "psicometrico",
    title: "Transversal: Psicométrico",
    desc: "Exámenes psicométricos y aptitud",
    icon: ScanLine,
    gradient: "from-purple-500 to-fuchsia-600",
  },
];

/* -------------------------------------------
   Vista principal
-------------------------------------------- */
export default function AreasInteres() {
  return (
    <ModulosEspecificos
      items={AREAS}
      areaType="simulacion"
      variant="sim"
      header={{ title: 'Elige un módulo específico', subtitle: 'Selecciona un módulo para visualizar y/o crear un simulador.' }}
      buildAccessLink={(item) => ({ pathname: '/asesor/simuladores/area', search: `?area=${encodeURIComponent(item.title)}` })}
      getAreaKey={(item) => item.title}
    />
  );
}
