import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

/**
 * NavbarBase - Componente base parametrizado para todas las barras de navegación
 */
const NavbarBase = ({
  variant = "landing",
  userRole = null,
  logo = null,
  title = "",
  menuItems = [],
  userMenuItems = [],
  onLogout = null,
  showSearch = false,
  showNotifications = false,
  showUserMenu = false,
  className = "",
  bgColor = null,
  textColor = null,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const dropdownRef = useRef(null);
  const location = useLocation();

  // Efecto para detectar scroll
  useEffect(() => {
    if (variant === "landing") {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 10);
      };
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [variant]);

  // Cerrar menús al cambiar de ruta
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location]);

  // Cerrar dropdown al hacer click fuera
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
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Determinar estilos basados en variant
  const getStyles = () => {
    const baseStyles = {
      landing: {
        bg: bgColor || "#3c26cc",
        text: textColor || "white",
        scrolledBg: "bg-[#3c26cc]/90 backdrop-blur-md",
        defaultBg: "bg-[#3c26cc]",
      },
      login: {
        bg: bgColor || "#3818c3",
        text: textColor || "white",
        scrolledBg: "bg-[#3818c3]",
        defaultBg: "bg-[#3818c3]",
      },
      dashboard: {
        bg: bgColor || "bg-white",
        text: textColor || "gray-800",
        scrolledBg: "bg-white shadow-md",
        defaultBg: "bg-white",
      },
      simple: {
        bg: bgColor || "transparent",
        text: textColor || "gray-800",
        scrolledBg: "bg-white/90 backdrop-blur-md shadow-sm",
        defaultBg: "transparent",
      },
    };

    const style = baseStyles[variant] || baseStyles.landing;
    
    return {
      header: `sticky top-0 z-50 transition-all duration-500 ${
        isScrolled ? style.scrolledBg : style.defaultBg
      } ${className}`,
      textColor: style.text,
    };
  };

  const styles = getStyles();

  // Renderizar logo
  const renderLogo = () => {
    if (!logo) {
      return (
        <Link to="/" className="flex items-center gap-3 active:scale-95 transition-transform">
          <div className="relative group">
            <div className="absolute -inset-1 bg-white/20 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
            <div className="relative h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              MQ
            </div>
          </div>
        </Link>
      );
    }

    if (typeof logo === "string") {
      return (
        <Link to="/" className="flex items-center gap-3 active:scale-95 transition-transform">
          <img src={logo} alt="Logo" className="h-12 w-auto object-contain" />
        </Link>
      );
    }

    return logo;
  };

  // Renderizar título
  const renderTitle = () => {
    if (!title || variant !== "login") return null;
    
    return (
      <h1 className={`text-${styles.textColor} text-center flex-1 text-3xl font-semibold hidden md:block`}>
        {title}
      </h1>
    );
  };

  // Renderizar items del menú desktop
  const renderDesktopMenu = () => {
    if (menuItems.length === 0) return null;

    return (
      <div className="hidden md:flex items-center gap-8">
        <ul className="flex items-center gap-6">
          {menuItems.map((item, index) => {
            if (item.type === "dropdown") {
              return (
                <li key={index} className="relative" ref={dropdownRef}>
                  <button
                    className={`group inline-flex items-center gap-1.5 text-sm font-semibold px-1 py-2 transition-all duration-300 ${
                      dropdownOpen ? `text-${styles.textColor}` : `text-${styles.textColor}/80 hover:text-${styles.textColor}`
                    }`}
                    onClick={() => setDropdownOpen((v) => !v)}
                  >
                    {item.label}
                    <ChevronIcon isOpen={dropdownOpen} />
                  </button>
                  
                  {dropdownOpen && item.children && (
                    <div className="absolute left-1/2 -translate-x-1/2 mt-4 w-56 origin-top rounded-2xl bg-white/80 backdrop-blur-xl text-gray-900 shadow-lg border border-white/40 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300">
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/80 backdrop-blur-xl rotate-45 border-t border-l border-white/40" />
                      <ul className="relative py-3 space-y-1">
                        {item.children.map((child, childIndex) => (
                          <li key={childIndex} className="px-2 group">
                            {child.isExternal ? (
                              <a href={child.to} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-purple-50 text-gray-800 hover:text-purple-600 transition-all">
                                {child.icon && <span className="text-gray-400">{child.icon}</span>}
                                <span className="font-semibold">{child.label}</span>
                                <span className="ml-auto text-xs opacity-50">↗</span>
                              </a>
                            ) : (
                              <Link to={child.to} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-purple-50 text-gray-800 hover:text-purple-600 transition-all">
                                {child.icon && <span className="text-gray-400">{child.icon}</span>}
                                <span className="font-semibold">{child.label}</span>
                              </Link>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            }

            return (
              <li key={index}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `relative text-sm font-semibold tracking-wide transition-all duration-300 px-1 py-2 group ${
                      isActive ? `text-${styles.textColor}` : `text-${styles.textColor}/80 hover:text-${styles.textColor}`
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item.label}
                      <span
                        className={`absolute bottom-0 left-0 w-full h-0.5 bg-current transform transition-transform duration-300 origin-left ${
                          isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                        }`}
                      />
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  // Renderizar acciones de usuario
  const renderUserActions = () => {
    if (variant === "landing") {
      return (
        <Link
          to="/login"
          className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-white/30 bg-white/10 backdrop-blur-md px-6 py-2.5 text-sm font-bold text-white shadow-xl transition-all hover:bg-white hover:text-purple-700 hover:shadow-white/20 active:scale-95"
        >
          <UserIcon className="relative group-hover:scale-110 transition-transform" />
          <span className="relative">Ingresar</span>
        </Link>
      );
    }

    if (showUserMenu && userRole) {
      return (
        <div className="flex items-center gap-4">
          {showNotifications && (
            <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
              <BellIcon />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          )}
          
          <div className="relative">
            <button
              className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                {userRole.charAt(0).toUpperCase()}
              </div>
              <ChevronIcon isOpen={dropdownOpen} />
            </button>
            
            {dropdownOpen && userMenuItems.length > 0 && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                {userMenuItems.map((item, index) => (
                  <React.Fragment key={index}>
                    {item.type === "divider" ? (
                      <div className="border-t border-gray-200 my-1"></div>
                    ) : item.type === "logout" ? (
                      <button
                        onClick={() => {
                          if (onLogout) onLogout();
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        {item.label}
                      </button>
                    ) : (
                      <Link
                        to={item.to}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        {item.label}
                      </Link>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  // Renderizar menú móvil
  const renderMobileMenu = () => {
    if (menuItems.length === 0) return null;

    return (
      <div
        className={`md:hidden absolute top-full left-0 w-full overflow-hidden transition-all duration-500 ease-in-out ${
          variant === "landing" || variant === "login" 
            ? "bg-[#3c26cc]/95 backdrop-blur-xl border-t border-white/10" 
            : "bg-white border-t border-gray-200"
        } shadow-2xl ${mobileMenuOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="px-6 py-8 space-y-2">
          {menuItems.map((item, index) => {
            if (item.type === "dropdown") {
              return (
                <div key={index} className="py-2">
                  <button
                    className="w-full text-left py-4 px-4 rounded-2xl font-bold flex items-center justify-between bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors"
                    onClick={() => setDropdownOpen((v) => !v)}
                  >
                    <span className="flex items-center gap-3">
                      <GridIcon />
                      {item.label}
                    </span>
                    <ChevronIcon isOpen={dropdownOpen} />
                  </button>
                  
                  <div className={`grid transition-all duration-500 ${dropdownOpen ? "grid-rows-[1fr] mt-2" : "grid-rows-[0fr]"}`}>
                    <div className="overflow-hidden space-y-1">
                      {item.children?.map((child, childIndex) => (
                        child.isExternal ? (
                          <a
                            key={childIndex}
                            href={child.to}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center py-3.5 px-8 text-white/70 hover:text-white font-medium transition-colors"
                          >
                            <span className="mr-2 opacity-30">•</span>
                            {child.label}
                            <span className="ml-2 text-xs opacity-50">↗</span>
                          </a>
                        ) : (
                          <Link
                            key={childIndex}
                            to={child.to}
                            className="flex items-center py-3.5 px-8 text-white/70 hover:text-white font-medium transition-colors"
                          >
                            <span className="mr-2 opacity-30">•</span>
                            {child.label}
                          </Link>
                        )
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <NavLink
                key={index}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center w-full py-4 px-4 rounded-2xl text-lg font-bold transition-all ${
                    isActive && !item.to.includes('#')
                      ? "bg-white text-purple-700 shadow-lg"
                      : "text-white/90 hover:bg-white/10"
                  }`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            );
          })}
          
          {variant === "landing" && (
            <div className="pt-8">
              <Link
                to="/login"
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white px-6 py-4 text-lg font-black shadow-xl hover:bg-white hover:text-purple-700 active:scale-[0.98] transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                <UserIcon className="w-5 h-5" />
                Iniciar sesión
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <header className={styles.header}>
      <nav className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          {renderLogo()}
          
          {/* Título */}
          {renderTitle()}
          
          {/* Menú Desktop */}
          {renderDesktopMenu()}
          
          {/* Acciones de usuario */}
          <div className="flex items-center gap-4">
            {renderUserActions()}
            
            {/* Botón Hamburguesa Móvil */}
            {menuItems.length > 0 && (
              <button
                className="md:hidden relative group inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 transition-all active:scale-90"
                onClick={() => setMobileMenuOpen((v) => !v)}
                aria-label="Abrir menú"
              >
                <div className="flex flex-col gap-1.5 items-center justify-center w-6">
                  <span className={`block h-0.5 w-6 bg-current transition-all duration-300 ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
                  <span className={`block h-0.5 w-6 bg-current transition-all duration-300 ${mobileMenuOpen ? "opacity-0" : ""}`} />
                  <span className={`block h-0.5 w-6 bg-current transition-all duration-300 ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
                </div>
              </button>
            )}
          </div>
        </div>
        
        {/* Menú Móvil */}
        {renderMobileMenu()}
        
        {/* Children personalizados */}
        {children && (
          <div className="mt-4">
            {children}
          </div>
        )}
      </nav>
    </header>
  );
};

// Componentes de iconos
const ChevronIcon = ({ isOpen }) => (
  <svg 
    className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} 
    viewBox="0 0 20 20" 
    fill="currentColor"
  >
    <path 
      fillRule="evenodd" 
      d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" 
      clipRule="evenodd" 
    />
  </svg>
);

const UserIcon = ({ className = "h-5 w-5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

const BellIcon = ({ className = "h-5 w-5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
);

const GridIcon = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
    />
  </svg>
);

export default NavbarBase;
