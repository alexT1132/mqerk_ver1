// src/components/Topbar.jsx
import { Menu, Bell, UserRound } from "lucide-react";
import { useIsMobile  } from "./useIsMobile.js";
import logo from '../../assets/MQerK_logo.png';

export default function Topbar({ onOpenMobileMenu }) {

    const isMobile = useIsMobile();

  return (
    <header className="sticky top-0 z-40 bg-violet-700 text-white">
      <div className="mx-auto w-[95%] flex items-center justify-between px-3 sm:px-6 h-16">
        {/* Izquierda */}
        <div className="flex items-center gap-3">
          {/* Hamburguesa (solo móvil) */}
          <button
            onClick={isMobile ? onOpenMobileMenu : undefined}
            className={[
                "-ml-1 rounded-md p-2 transition",
                "hover:bg-white/10",
                !isMobile && "opacity-100", // se ve pero no funciona
            ].join(" ")}
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo (oculto en móvil) */}
          <div className="hidden md:flex items-center gap-2">
            <img src={logo} alt="MQerKAcademy" className="w-15" />
          </div>
        </div>

        {/* Centro: título */}
        <h1 className="text-sm sm:text-base md:text-lg font-semibold text-center">
          Asesores Especializados en la Enseñanza de las Ciencias y Tecnología
        </h1>

        {/* Derecha */}
        <div className="flex items-center gap-3 md:gap-5">
          {/* Notificaciones (oculto en móvil) */}
          <button
            aria-label="Notificaciones"
            className="hidden md:flex relative rounded-full p-2 hover:bg-white/10"
          >
            <Bell className="h-5 w-5" />
          </button>

          {/* Perfil con estado en línea */}
          <button
            aria-label="Perfil"
            className="relative rounded-full p-2 hover:bg-white/10"
          >
            <span className="absolute inset-0 rounded-full ring-1 ring-white/20" />
            <UserRound className="h-5 w-5" />
            {/* Punto verde */}
            <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-violet-700" />
          </button>
        </div>
      </div>
    </header>
  );
}