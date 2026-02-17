import { Link } from "react-router-dom";
import { createPortal } from "react-dom";
import { XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline"; // Asegúrate de tenerlos
import Logo from "../../assets/MQerK_logo.png";

export default function MobileMenu({ isOpen, onClose }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-[#3c26cc] flex flex-col font-sans">

      {/* 1. CABECERA COMPACTA */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <Link to="/" onClick={onClose}>
          <img src={Logo} alt="MQerK" className="h-7 w-auto" /> {/* Logo un poco más pequeño */}
        </Link>
        <button
          onClick={onClose}
          className="p-1 rounded-full text-white/80 hover:bg-white/10 transition-colors"
        >
          <XMarkIcon className="h-7 w-7" />
        </button>
      </div>

      {/* 2. CONTENIDO (Scrollable si la pantalla es muy pequeña) */}
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col">

        {/* ENLACES DE NAVEGACIÓN */}
        <nav className="flex flex-col space-y-4">
          <MobileLink to="/" onClick={onClose}>Inicio</MobileLink>
          <MobileLink to="/acerca_de" onClick={onClose}>Acerca de</MobileLink>
          <MobileLink to="/cursos" onClick={onClose}>Cursos</MobileLink>

          {/* Dropdown Eventos simplificado (estilo acordeón) */}
          <div className="group">
            <button className="flex items-center justify-between w-full text-lg font-medium text-white/90 hover:text-white">
              <span>Eventos</span>
              <ChevronDownIcon className="h-4 w-4 text-white/70" />
            </button>
            {/* Aquí podrías poner el contenido del dropdown si lo necesitas, o hacerlo un link directo */}
          </div>
        </nav>

        {/* ESPACIADOR FLEXIBLE (Empuja lo siguiente hacia abajo si hay espacio) */}
        <div className="flex-1 min-h-[40px]"></div>

        {/* 3. ACCIONES (Blog y Login) */}
        <div className="flex flex-col gap-3 pb-4">
          {/* Botón Blog: Ahora es "Outline" para no saturar */}
          <Link
            to="/blog"
            onClick={onClose}
            className="w-full py-2.5 rounded-lg border border-white/30 text-center text-white font-medium hover:bg-white/10 transition-colors"
          >
            Blog
          </Link>

          {/* Botón Login: Sólido pero delgado */}
          <Link
            to="/login"
            onClick={onClose}
            className="w-full py-2.5 rounded-lg bg-white text-[#3c26cc] font-bold text-center shadow-md hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            Iniciar sesión
          </Link>
        </div>

        {/* Footer pequeño */}
        <p className="text-center text-xs text-white/40 font-light mt-2">
          © 2025 MQerK Academy
        </p>

      </div>
    </div>,
    document.getElementById('modal-root')
  );
}

// Componente auxiliar para estilos repetitivos
function MobileLink({ to, children, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="text-lg font-medium text-white/90 hover:text-white hover:translate-x-1 transition-all duration-200 block border-b border-white/5 pb-2"
    >
      {children}
    </Link>
  );
}