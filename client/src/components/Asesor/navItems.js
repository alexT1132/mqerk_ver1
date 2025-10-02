// src/components/navItems.js
import {
  Home,
  User,
  BookOpen,
  MessageSquare,
  Joystick,
  ClipboardList,   // para "Quizt"
  ListTodo,
  MessageCircle,   // para "Feedback"
  Mail,
  Calendar,
  BarChart3,
  GraduationCap,   // para "Recursos educativos"
  CreditCard,
  Settings,
  LogOut,
} from "lucide-react";

export const NAV_ITEMS = [
  { key: "inicio",               label: "Inicio",               icon: Home,          href: "/asesor_dashboard" },
  { key: "mi-perfil",            label: "Mi perfil",            icon: User,          href: "/asesor_perfil" },
  { key: "mis-cursos",           label: "Mis cursos",           icon: BookOpen,      href: "/asesor_cursos" },
  { key: "asesorias",            label: "Asesorías",            icon: MessageSquare, href: "/asesorias" },
  { key: "simuladores",          label: "Simuladores",          icon: Joystick,      href: "/asesor/simuladores" },
  { key: "quizt",                label: "Quizt",                icon: ClipboardList, href: "/quizt" },
  { key: "actividades",          label: "Actividades",          icon: ListTodo,      href: "/asesor/actividades" },
  { key: "feedback",             label: "Feedback",             icon: MessageCircle, href: "/asesor_feedback" },
  { key: "correo",               label: "Correo",               icon: Mail,          href: "/correo" },
  { key: "calendario",           label: "Calendario",           icon: Calendar,      href: "/asesor/agenda" },
  { key: "reportes",             label: "Reportes",             icon: BarChart3,     href: "/reportes" },
  { key: "recursos-educativos",  label: "Recursos educativos",  icon: GraduationCap, href: "/recursos-educativos" },
  { key: "mis-pagos",            label: "Mis pagos",            icon: CreditCard,    href: "/pagos" },
  { key: "configuracion",        label: "Configuración",        icon: Settings,      href: "/asesor_configuraciones" },
];

export const LOGOUT = { key: "logout", label: "Cerrar sesión", icon: LogOut };
