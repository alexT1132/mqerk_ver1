import { useEffect, useState } from "react";
import Logo from "../../assets/MQerk_logo.png";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false); // menú móvil
  const [eventsOpen, setEventsOpen] = useState(false); // dropdown desktop
  const [eventsOpenMobile, setEventsOpenMobile] = useState(false); // dropdown móvil

  // Cerrar menús con ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        setEventsOpen(false);
        setEventsOpenMobile(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[#3c26cc] text-white border-b border-white">
      <nav className="mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo a la izquierda */}
          <a href="#" className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded-xl">
            <img src={Logo} alt="Logo" className="h-15 w-20 rounded-full" />
          </a>

          {/* Menú + CTA a la derecha (desktop) */}
          <div className="hidden md:flex items-center gap-8">
            <ul className="flex items-center gap-8">
              <li>
                <a href="#inicio" className="nav-link">Inicio</a>
              </li>
              <li>
                <a href="#acerca" className="nav-link">Acerca de</a>
              </li>
              <li>
                <a href="#cursos" className="nav-link">Cursos</a>
              </li>
              <li className="relative">
                <button
                  className="nav-link inline-flex items-center gap-1"
                  aria-haspopup="menu"
                  aria-expanded={eventsOpen}
                  onClick={() => setEventsOpen((v) => !v)}
                >
                  Eventos
                  <svg className={`h-4 w-4 transition-transform ${eventsOpen ? "rotate-180" : "rotate-0"}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* Dropdown desktop */}
                {eventsOpen && (
                  <div
                    role="menu"
                    className="absolute left-0 mt-3 min-w-48 rounded-2xl bg-white/95 text-gray-900 shadow-lg ring-1 ring-black/5 backdrop-blur supports-[backdrop-filter]:bg-white/80"
                    onMouseLeave={() => setEventsOpen(false)}
                  >
                    <ul className="py-2 text-sm">
                      <DropdownItem href="#eventos/calendario" label="Calendario" />
                      <DropdownItem href="#eventos/proximos" label="Próximos eventos" />
                      <DropdownItem href="#eventos/pasados" label="Eventos pasados" />
                    </ul>
                  </div>
                )}
              </li>
              <li>
                <a href="#blog" className="nav-link">Blog</a>
              </li>
            </ul>

            <Link
              to='/login'
              className="inline-flex items-center gap-2 rounded-2xl border border-white/70 px-4 py-2 text-sm font-semibold hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <UserIcon />
              Iniciar sesión
            </Link>
          </div>

          {/* Hamburguesa (solo móvil) a la derecha */}
          <button
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            onClick={() => setOpen((v) => !v)}
            aria-label="Abrir menú"
            aria-expanded={open}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {/* Panel móvil */}
      <div
        className={`md:hidden overflow-hidden transition-[max-height] duration-300 ease-in-out ${open ? "max-h-96" : "max-h-0"}`}
      >
        <div className="px-4 pb-4">
          <MobileLink href="#inicio">Inicio</MobileLink>
          <MobileLink href="#acerca">Acerca de</MobileLink>
          <MobileLink href="#cursos">Cursos</MobileLink>

          {/* Dropdown móvil */}
          <div className="border-t border-white/15 my-2" />
          <button
            className="w-full text-left py-2.5 font-medium inline-flex items-center justify-between"
            onClick={() => setEventsOpenMobile((v) => !v)}
            aria-expanded={eventsOpenMobile}
          >
            <span>Eventos</span>
            <svg className={`h-4 w-4 transition-transform ${eventsOpenMobile ? "rotate-180" : "rotate-0"}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
            </svg>
          </button>
          <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${eventsOpenMobile ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
            <div className="overflow-hidden">
              <MobileSubLink href="#eventos/calendario">Calendario</MobileSubLink>
              <MobileSubLink href="#eventos/proximos">Próximos eventos</MobileSubLink>
              <MobileSubLink href="#eventos/pasados">Eventos pasados</MobileSubLink>
            </div>
          </div>

          <div className="border-t border-white/15 my-2" />
          <a
          href="#login"
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/70 px-4 py-2 text-sm font-semibold hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
          <UserIcon />
          Iniciar sesión
          </a>
        </div>
      </div>

      {/* Estilos utilitarios de enlaces */}
      <style>{`
        .nav-link { @apply text-sm font-medium tracking-wide hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded-xl px-1; }
      `}</style>
    </header>
  );
}

function DropdownItem({ href, label }) {
  return (
    <li>
      <a
        href={href}
        role="menuitem"
        className="block px-4 py-2.5 hover:bg-gray-50 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        {label}
      </a>
    </li>
  );
}

function MobileLink({ href, children }) {
  return (
    <a href={href} className="block py-2.5 text-base font-medium">
      {children}
    </a>
  );
}

function MobileSubLink({ href, children }) {
  return (
    <a href={href} className="block py-2 pl-3 text-sm opacity-90">
      {children}
    </a>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function UserIcon() {
return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4 shrink-0" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 14a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}