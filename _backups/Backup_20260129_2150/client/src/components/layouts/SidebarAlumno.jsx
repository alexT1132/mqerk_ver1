import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useStudent } from "../../context/StudentContext.jsx";
import { DesktopSidebarBase } from "./SidebarBase.jsx";

// --- Iconos específicos para alumno ---
const svgColor = "#4F46E5";
const svgColorLogout = "#EA3323";
const xmlns = "http://www.w3.org/2000/svg";
const width = "20px";
const height = "20px";

const LogoInicio = (<svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>);
const LogoMisCursos = (<svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></svg>);
const LogoMiPerfil = (<svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>);
const LogoActividades = (<svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>);
const LogoSimulaciones = (<svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>);
const LogoRecursos = (<svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /><line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" /></svg>);
const LogoFeedback = (<svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>);
const LogoCalendario = (<svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>);
const LogoMisPagos = (<svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="22" y2="10" /></svg>);
const LogoAsistencia = (<svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const LogoConfigAlumno = (<svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1.51-1V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>);
const LogoCerrarSesionAlumno = (<svg xmlns={xmlns} height={height} viewBox="0 0 24 24" width={width} fill="none" stroke={svgColorLogout} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="17 16 22 12 17 8" /><line x1="22" y1="12" x2="10" y2="12" /></svg>);

// Menú principal de alumno
// Menú principal de alumno
const alumnoMenuItems = [
  { label: "Inicio", path: "/alumno/", icon: LogoInicio, sectionKey: "inicio" },
  { label: "Mis Cursos", path: "/alumno/cursos", icon: LogoMisCursos },
  { label: "Mi Perfil", path: "/alumno/mi-perfil", icon: LogoMiPerfil },
  { label: "Actividades", path: "/alumno/actividades", icon: LogoActividades },
  { label: "Simulaciones", path: "/alumno/simulaciones", icon: LogoSimulaciones },
  { label: "Recursos", path: "/alumno/recursos", icon: LogoRecursos },
  { label: "Feedback", path: "/alumno/feedback", icon: LogoFeedback },
  { label: "Asistencia", path: "/alumno/asistencia", icon: LogoAsistencia },
  { label: "Calendario", path: "/alumno/calendario", icon: LogoCalendario },
  { label: "Mis Pagos", path: "/alumno/mis-pagos", icon: LogoMisPagos },
];

// Items del fondo (configuración y logout)
const alumnoBottomItems = [
  { label: "Configuración", path: "/alumno/configuracion", icon: LogoConfigAlumno, isBottom: true },
  { label: "Cerrar Sesión", path: "/alumno/logout", icon: LogoCerrarSesionAlumno, isBottom: true },
];

// Combinar todos los items
const allAlumnoMenuItems = [...alumnoMenuItems, ...alumnoBottomItems];

// Componente Sidebar Desktop para alumno
export function SideBarDesktop_Alumno_comp({ setDesktopSidebarOpen }) {
  const { activeSection, setActiveSectionHandler } = useStudent();

  const handleSectionChange = (sectionKey) => {
    setActiveSectionHandler(sectionKey);
  };

  return (
    <DesktopSidebarBase
      menuItems={allAlumnoMenuItems}
      userRole="alumno"
      showPinnedToggle={true}
      showAutoCollapse={true}
      onSectionChange={handleSectionChange}
      activeSection={activeSection}
      logoutPath="/alumno/logout"
      topOffset="80px"
      heightOffset="80px"
      badgeConfig={{}}
    />
  );
}

// Componente Sidebar Mobile para alumno
export function SideBarSm_Alumno_comp({ isMenuOpen, closeMenu }) {
  const { activeSection, setActiveSectionHandler } = useStudent();
  const location = useLocation();

  const handleSectionChange = (sectionKey) => {
    setActiveSectionHandler(sectionKey);
    closeMenu();
  };

  // Determinar si un item está activo basándose en la ruta
  const isItemActive = (item) => {
    if (item.path === '/alumno/' && location.pathname === '/alumno/') return true;
    if (item.path !== '/alumno/' && location.pathname.startsWith(item.path)) return true;
    return false;
  };

  // Para móvil, usamos un overlay y sidebar simple
  return (
    <>
      {isMenuOpen && (
        <>
          <div
            className="sm:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={closeMenu}
            aria-hidden="true"
            style={{
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)'
            }}
          ></div>
          <aside className={`sm:hidden fixed top-[80px] left-0 w-64 h-[calc(100vh-80px)] bg-white/95 backdrop-blur-lg shadow-lg z-50 transform transition-all duration-300 ease-in-out overflow-hidden flex flex-col
              ${isMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-90'}`}
            style={{
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)'
            }}>
            <nav className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-visible no-scrollbar px-0 py-3">
                {[...alumnoMenuItems, ...alumnoBottomItems.filter(i => i.path !== '/alumno/logout')].map((item) => (
                  <div key={item.path} className="w-full mb-1 px-3">
                    <Link
                      to={item.path}
                      onClick={(e) => {
                        // NO prevenir default para permitir navegación SPA con Link
                        if (item.sectionKey) {
                          handleSectionChange(item.sectionKey);
                        }
                        closeMenu();
                      }}
                      className={`flex items-center justify-start pl-4 pr-3 gap-3 py-3 rounded-2xl w-full border-none transition-all duration-300
                        ${isItemActive(item) ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md' : 'text-gray-600 bg-transparent active:bg-indigo-50'}`}
                    >
                      <div className="flex-shrink-0">
                        {React.cloneElement(item.icon, {
                          stroke: isItemActive(item) ? "#ffffff" : "#3818c3",
                          fill: "none",
                          className: "w-6 h-6",
                          strokeWidth: 2,
                        })}
                      </div>
                      <span className="text-[15px] leading-normal font-medium ml-1 truncate">
                        {item.label}
                      </span>
                    </Link>
                  </div>
                ))}
              </div>
              <div className="flex-shrink-0 px-3 pt-2 pb-4 border-t border-gray-200/60 bg-white/50">
                {alumnoBottomItems.filter(i => i.path === '/alumno/logout').map((item) => (
                  <div key={item.path} className="w-full mb-1">
                    <Link
                      to={item.path}
                      onClick={() => closeMenu()}
                      className={`flex items-center justify-start pl-4 pr-3 gap-3 py-3 rounded-2xl w-full border-none transition-all duration-300
                        ${isItemActive(item) ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md' : item.path === '/alumno/logout' ? 'text-red-500 bg-transparent active:bg-red-50' : 'text-gray-600 bg-transparent active:bg-indigo-50'}`}
                    >
                      <div className="flex-shrink-0">
                        {React.cloneElement(item.icon, {
                          stroke: item.path === '/alumno/logout' ? "#EA3323" : (isItemActive(item) ? "#ffffff" : "#3818c3"),
                          fill: "none",
                          className: "w-6 h-6",
                          strokeWidth: 2,
                        })}
                      </div>
                      <span className={`text-[15px] leading-normal font-medium ml-1 truncate ${item.path === '/alumno/logout' ? 'text-red-500' : ''}`}>
                        {item.label}
                      </span>
                    </Link>
                  </div>
                ))}
              </div>
            </nav>
          </aside>
        </>
      )}
    </>
  );
}