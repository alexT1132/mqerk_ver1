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
  CheckSquare,     // para "Asistencias"
  FileText,        // para "Documentación"
  Send,            // para "Chat"
} from "lucide-react";

export const NAV_ITEMS = [
  { key: "inicio", label: "Inicio", icon: Home, href: "/asesor/dashboard" },
  { key: "mi-perfil", label: "Mi perfil", icon: User, href: "/asesor/perfil" },
  { key: "mis-cursos", label: "Mis cursos", icon: BookOpen, href: "/asesor/cursos" },
  { key: "asesorias", label: "Asesorías", icon: MessageSquare, href: "/asesor/asesorias" },
  { key: "chat", label: "Chat", icon: Send, href: "/asesor/chat" },
  { key: "simuladores", label: "Simuladores", icon: Joystick, href: "/asesor/simuladores" },
  { key: "actividades", label: "Actividades", icon: ListTodo, href: "/asesor/actividades" },
  { key: "feedback", label: "Feedback", icon: MessageCircle, href: "/asesor/feedback" },
  { key: "documentacion", label: "Documentación", icon: FileText, href: "/asesor/documentacion" },
  { key: "calendario", label: "Calendario", icon: Calendar, href: "/asesor/agenda" },
  { key: "asistencias", label: "Asistencias", icon: CheckSquare, href: "/asesor/registro-asistencia" },
  { key: "reportes", label: "Reportes", icon: BarChart3, href: "/asesor/reportes" },
  { key: "recursos-educativos", label: "Recursos educativos", icon: GraduationCap, href: "/asesor/recursos_educativos" },
  { key: "mis-pagos", label: "Mis pagos", icon: CreditCard, href: "/asesor/mis-pagos" },
  { key: "configuracion", label: "Configuración", icon: Settings, href: "/asesor/configuraciones" },
];

export const LOGOUT = { key: "logout", label: "Cerrar sesión / Salir", icon: LogOut };
