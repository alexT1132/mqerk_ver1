// AreasInteres.jsx
import {
  Atom,           // Ciencias Exactas (Physics/Science)
  Users,          // Ciencias Sociales (Sociology)
  Feather,        // Humanidades y Artes (Literature/Arts)
  Dna,            // Ciencias Naturales y de la Salud (Biology/Medicine)
  Cpu,            // Ingeniería y Tecnología (Tech/Systems)
  TrendingUp,     // Ciencias Económico-Administrativas (Economics/Growth)
  Trophy,         // Educación y Deportes (Sports/Achievement)
  Sprout,         // Agropecuarias (Agriculture)
  Map,            // Turismo (Travel/Maps - better than Plane for general Tourism)
  Landmark,       // Núcleo UNAM/IPN (Institutions)
  Ship,           // Militar, Naval (Ship/Naval)
  BrainCircuit,   // Psicométrico (Mind/Cognitive)
} from "lucide-react";
import ModulosEspecificos from "../common/ModulosEspecificos";

/* -------------------------------------------
   Datos de las áreas (12)
-------------------------------------------- */
// ✅ Updated to match the icons and color structure of ActEspecificos.jsx
const AREAS = [
  {
    id: "exactas",
    title: "Ciencias Exactas",
    desc: "Matemáticas, Física, Química y afines",
    icon: Atom,
    color: "from-sky-500 to-cyan-600",
    tint: "bg-sky-50",
  },
  {
    id: "sociales",
    title: "Ciencias Sociales",
    desc: "Sociología, Psicología y más",
    icon: Users,
    color: "from-violet-500 to-fuchsia-600",
    tint: "bg-violet-50",
  },
  {
    id: "humanidades",
    title: "Humanidades y Artes",
    desc: "Literatura, Historia, Filosofía",
    icon: Feather,
    color: "from-rose-500 to-pink-600",
    tint: "bg-rose-50",
  },
  {
    id: "salud",
    title: "Ciencias Naturales y de la Salud",
    desc: "Biología, Medicina, Enfermería",
    icon: Dna,
    color: "from-green-500 to-emerald-600",
    tint: "bg-green-50",
  },
  {
    id: "ingenieria",
    title: "Ingeniería y Tecnología",
    desc: "Ingenierías, Sistemas, Tecnología",
    icon: Cpu,
    color: "from-amber-500 to-orange-600",
    tint: "bg-amber-50",
  },
  {
    id: "eco-admin",
    title: "Ciencias Económico-Administrativas",
    desc: "Administración, Economía, Negocios",
    icon: TrendingUp,
    color: "from-teal-500 to-emerald-600",
    tint: "bg-teal-50",
  },
  {
    id: "educ-deportes",
    title: "Educación y Deportes",
    desc: "Pedagogía y deportes",
    icon: Trophy,
    color: "from-purple-500 to-indigo-600",
    tint: "bg-purple-50",
  },
  {
    id: "agropecuarias",
    title: "Agropecuarias",
    desc: "Agronomía, Veterinaria, Zootecnia",
    icon: Sprout,
    color: "from-lime-500 to-green-600",
    tint: "bg-lime-50",
  },
  {
    id: "turismo",
    title: "Turismo",
    desc: "Gestión turística y hotelería",
    icon: Map,
    color: "from-sky-500 to-blue-600",
    tint: "bg-sky-50",
  },
  {
    id: "unam",
    title: "Núcleo UNAM / IPN",
    desc: "Materias esenciales ingreso",
    icon: Landmark,
    color: "from-yellow-500 to-amber-500",
    tint: "bg-yellow-50",
  },
  {
    id: "naval",
    title: "Militar, Naval y Náutica Mercante",
    desc: "Preparación fuerzas e instituciones navales",
    icon: Ship,
    color: "from-slate-500 to-slate-700",
    tint: "bg-slate-50",
  },
  {
    id: "psicometrico",
    title: "Transversal: Análisis Psicométrico",
    desc: "Exámenes psicométricos y aptitud",
    icon: BrainCircuit,
    color: "from-violet-500 to-purple-600",
    tint: "bg-violet-50",
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
      header={{ title: 'Módulos específicos', subtitle: 'Selecciona un módulo para visualizar y/o crear un simulador.', backTo: '/asesor/simuladores' }}
      buildAccessLink={(item) => ({ pathname: '/asesor/simuladores/area', search: `?area=${encodeURIComponent(item.title)}` })}
      getAreaKey={(item) => item.title}
    />
  );
}
