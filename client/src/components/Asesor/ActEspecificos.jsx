import ModulosEspecificos from "../common/ModulosEspecificos";
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

const MODULOS = [
  { title: "Ciencias Exactas", desc: "Matemáticas, Física, Química y afines", color: "from-sky-500 to-cyan-600", tint: "bg-sky-50", icon: Atom },
  { title: "Ciencias Sociales", desc: "Sociología, Psicología y más", color: "from-violet-500 to-fuchsia-600", tint: "bg-violet-50", icon: Users },
  { title: "Humanidades y Artes", desc: "Literatura, Historia, Filosofía", color: "from-rose-500 to-pink-600", tint: "bg-rose-50", icon: Feather },
  { title: "Ciencias Naturales y de la Salud", desc: "Biología, Medicina, Enfermería", color: "from-green-500 to-emerald-600", tint: "bg-green-50", icon: Dna },
  { title: "Ingeniería y Tecnología", desc: "Ingenierías, Sistemas, Tecnología", color: "from-amber-500 to-orange-600", tint: "bg-amber-50", icon: Cpu },
  { title: "Ciencias Económico-Administrativas", desc: "Administración, Economía, Negocios", color: "from-teal-500 to-emerald-600", tint: "bg-teal-50", icon: TrendingUp },
  { title: "Educación y Deportes", desc: "Pedagogía y deportes", color: "from-purple-500 to-indigo-600", tint: "bg-purple-50", icon: Trophy },
  { title: "Agropecuarias", desc: "Agronomía, Veterinaria, Zootecnia", color: "from-lime-500 to-green-600", tint: "bg-lime-50", icon: Sprout },
  { title: "Turismo", desc: "Gestión turística y hotelería", color: "from-sky-500 to-blue-600", tint: "bg-sky-50", icon: Map },
  { title: "Núcleo UNAM / IPN", desc: "Materias esenciales ingreso", color: "from-yellow-500 to-amber-500", tint: "bg-yellow-50", icon: Landmark },
  { title: "Militar, Naval y Náutica Mercante", desc: "Preparación fuerzas e instituciones navales", color: "from-slate-500 to-slate-700", tint: "bg-slate-50", icon: Ship },
  { title: "Transversal: Análisis Psicométrico", desc: "Exámenes psicométricos y aptitud", color: "from-violet-500 to-purple-600", tint: "bg-violet-50", icon: BrainCircuit },
];

export default function ActModulosEspecificos() {
  return (
    <ModulosEspecificos
      items={MODULOS}
      areaType="actividad"
      variant="sim"
      header={{ title: 'Módulos específicos', subtitle: 'Selecciona un módulo para gestionar actividades.', backTo: '/asesor/actividades' }}
      buildAccessLink={(item) => ({ pathname: '/asesor/actividades/modulo', state: { title: item.title } })}
      getAreaKey={(item) => item.title}
    />
  );
}
