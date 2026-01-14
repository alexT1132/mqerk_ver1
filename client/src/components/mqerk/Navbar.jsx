import { useEffect, useState, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import Logo from "../../assets/MQerK_logo.png";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const dropdownRef = useRef(null);
  const location = useLocation();

  // Cambiar el estilo del navbar al hacer scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cerrar menús al cambiar de ruta
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
    setMobileDropdownOpen(false);
  }, [location]);

  // Cerrar dropdown desktop al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cerrar con ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setDropdownOpen(false);
        setMobileDropdownOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const navLinkClass = ({ isActive }) =>
    `relative text-sm font-semibold tracking-wide transition-all duration-300 px-1 py-2 group hover:text-white ${isActive ? "text-white" : "text-white/80"
    }`;

  const underlineClass = (isActive) =>
    `absolute bottom-0 left-0 w-full h-0.5 bg-white transform transition-transform duration-300 origin-left ${isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
    }`;

  const linkClass = "relative text-sm font-semibold tracking-wide text-white/80 hover:text-white px-1 py-2 group transition-all duration-300";

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${isScrolled
        ? "bg-[#3c26cc]/90 backdrop-blur-md shadow-xl py-2"
        : "bg-[#3c26cc] py-4"
        } text-white border-b border-white/10`}
    >
      <nav className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link to="/#inicio" className="flex items-center gap-3 active:scale-95 transition-transform">
            <div className="relative group">
              <div className="absolute -inset-1 bg-white/20 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <img src={Logo} alt="Logo MQerK" className="relative h-12 w-auto object-contain drop-shadow-md" />
            </div>
          </Link>

          {/* Menú Desktop */}
          <div className="hidden md:flex items-center gap-10">
            <ul className="flex items-center gap-8">
              <li>
                <Link to="/#inicio" className={linkClass}>
                  Inicio
                  <span className={underlineClass(false)} />
                </Link>
              </li>

              <li>
                <NavLink to="/acerca_de" className={navLinkClass}>
                  {({ isActive }) => (
                    <>
                      Acerca de
                      <span className={underlineClass(isActive)} />
                    </>
                  )}
                </NavLink>
              </li>

              <li>
                <Link to="/#cursos" className={linkClass}>
                  Cursos
                  <span className={underlineClass(false)} />
                </Link>
              </li>

              {/* Dropdown Desktop */}
              <li className="relative" ref={dropdownRef}>
                <button
                  className={`group inline-flex items-center gap-1.5 text-sm font-semibold px-1 py-2 transition-all duration-300 ${dropdownOpen ? "text-white" : "text-white/80 hover:text-white"
                    }`}
                  aria-haspopup="menu"
                  aria-expanded={dropdownOpen}
                  onClick={() => setDropdownOpen((v) => !v)}
                >
                  Eventos
                  <ChevronIcon isOpen={dropdownOpen} />
                </button>

                {dropdownOpen && (
                  <div className="absolute left-1/2 -translate-x-1/2 mt-4 w-56 origin-top rounded-2xl bg-white/80 backdrop-blur-xl text-gray-900 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border border-white/40 ring-1 ring-black/5 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300">
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/80 backdrop-blur-xl rotate-45 border-t border-l border-white/40" />
                    <ul className="relative py-3 space-y-1">
                      <DropdownItem to="/talleres" label="Talleres" icon={<StarIcon />} />
                      <DropdownItem to="/bootcamps" label="Bootcamps" icon={<RocketIcon />} />
                      <DropdownItem to="/exporientas" label="Exporientas" icon={<MapIcon />} />
                      <DropdownItem to="/online" label="Online" icon={<GlobeIcon />} />
                      <DropdownItem
                        isExternal
                        to="https://open.spotify.com/"
                        label="Podcast"
                        icon={<MusicIcon />}
                      />
                    </ul>
                  </div>
                )}
              </li>

              <li>
                <NavLink to="/blog" className={navLinkClass}>
                  {({ isActive }) => (
                    <>
                      Blog
                      <span className={underlineClass(isActive)} />
                    </>
                  )}
                </NavLink>
              </li>
            </ul>

            <Link
              to='/login'
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-white/30 bg-white/10 backdrop-blur-md px-6 py-2.5 text-sm font-bold text-white shadow-xl transition-all hover:bg-white hover:text-[#3c26cc] hover:shadow-white/20 active:scale-95"
            >
              <UserIcon className="relative group-hover:scale-110 transition-transform" />
              <span className="relative">Ingresar</span>
            </Link>
          </div>

          {/* Botón Hamburguesa Móvil */}
          <button
            className="md:hidden relative group inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 transition-all active:scale-90"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Abrir menú"
          >
            <div className="flex flex-col gap-1.5 items-center justify-center w-6">
              <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${mobileMenuOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </div>
          </button>
        </div>
      </nav>

      {/* Menú Móvil */}
      <div
        className={`md:hidden absolute top-full left-0 w-full overflow-hidden transition-all duration-500 ease-in-out bg-[#3c26cc]/95 backdrop-blur-xl border-t border-white/10 shadow-2xl ${mobileMenuOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <div className="px-6 py-8 space-y-2">
          <MobileLink to="/#inicio">Inicio</MobileLink>
          <MobileLink to="/acerca_de">Acerca de</MobileLink>
          <MobileLink to="/#cursos">Cursos</MobileLink>

          <div className="py-2">
            <button
              className="w-full text-left py-4 px-4 rounded-2xl font-bold flex items-center justify-between bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors"
              onClick={() => setMobileDropdownOpen((v) => !v)}
            >
              <span className="flex items-center gap-3">
                <GridIcon />
                Eventos
              </span>
              <ChevronIcon isOpen={mobileDropdownOpen} />
            </button>

            <div className={`grid transition-all duration-500 ${mobileDropdownOpen ? "grid-rows-[1fr] mt-2" : "grid-rows-[0fr]"}`}>
              <div className="overflow-hidden space-y-1">
                <MobileSubLink to="/talleres">Talleres</MobileSubLink>
                <MobileSubLink to="/bootcamps">Bootcamps</MobileSubLink>
                <MobileSubLink to="/exporientas">Exporientas</MobileSubLink>
                <MobileSubLink to="/online">Online</MobileSubLink>
                <MobileSubLink isExternal to="https://open.spotify.com/">Podcast</MobileSubLink>
              </div>
            </div>
          </div>

          <MobileLink to="/blog">Blog</MobileLink>

          <div className="pt-8">
            <Link
              to="/login"
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white px-6 py-4 text-lg font-black shadow-xl hover:bg-white hover:text-[#3c26cc] active:scale-[0.98] transition-all"
            >
              <UserIcon className="w-5 h-5" />
              Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

// --- SUB-COMPONENTES ---

function DropdownItem({ to, label, isExternal, icon }) {
  const content = (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#3c26cc]/10 text-gray-800 hover:text-[#3c26cc] transition-all duration-200">
      <span className="text-gray-400 group-hover:text-[#3c26cc]/70 transition-colors">
        {icon}
      </span>
      <span className="font-semibold">{label}</span>
      {isExternal && <span className="ml-auto text-xs opacity-50">↗</span>}
    </div>
  );

  return (
    <li className="px-2 group">
      {isExternal ? (
        <a href={to} target="_blank" rel="noopener noreferrer">{content}</a>
      ) : (
        <Link to={to}>{content}</Link>
      )}
    </li>
  );
}

function MobileLink({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center w-full py-4 px-4 rounded-2xl text-lg font-bold transition-all ${isActive && !to.includes('#')
          ? "bg-white text-[#3c26cc] shadow-lg"
          : "text-white/90 hover:bg-white/10"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

function MobileSubLink({ to, children, isExternal }) {
  const content = (
    <div className="flex items-center py-3.5 px-8 text-white/70 hover:text-white font-medium transition-colors">
      <span className="mr-2 opacity-30">•</span>
      {children}
      {isExternal && <span className="ml-2 text-xs opacity-50">↗</span>}
    </div>
  );

  return isExternal ? (
    <a href={to} target="_blank" rel="noopener noreferrer">{content}</a>
  ) : (
    <Link to={to}>{content}</Link>
  );
}

// --- ICONOS ---
const ChevronIcon = ({ isOpen }) => (
  <svg className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
  </svg>
);

const UserIcon = ({ className = "h-5 w-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const StarIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;
const RocketIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.585 15.585a6.215 6.215 0 01-8.828 0 1.25 1.25 0 00-1.768 1.768 8.715 8.715 0 0012.364 0 1.25 1.25 0 00-1.768-1.768z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.585 8.415a6.215 6.215 0 010 8.828 1.25 1.25 0 001.768 1.768 8.715 8.715 0 000-12.364 1.25 1.25 0 00-1.768 1.768z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.415 8.415a6.215 6.215 0 018.828 0 1.25 1.25 0 001.768-1.768 8.715 8.715 0 00-12.364 0 1.25 1.25 0 001.768 1.768z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.415 15.585a6.215 6.215 0 010-8.828 1.25 1.25 0 00-1.768-1.768 8.715 8.715 0 000 12.364 1.25 1.25 0 001.768-1.768z" /></svg>;
const GlobeIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>;
const MapIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>;
const MusicIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>;
const GridIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
