// src/components/Layout.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Layout principal de la aplicación
 * Maneja la estructura base con header, sidebar y contenido principal
 * Incluye gestión de notificaciones y navegación responsive
 */
export function Layout({ children, HeaderComponent, SideBarDesktopComponent, SideBarSmComponent, backgroundClassName = 'bg-white', contentClassName = '', sidebarProps = {} }) {
  // Control del menú móvil
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Control del sidebar en desktop
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(false);
  // Ruta actual
  const location = useLocation();
  const isCoursesRoute = location.pathname.startsWith('/alumno/cursos');
  // Ajuste fino: en Bienvenida queremos menos espacio superior bajo el header
  const isBienvenidaRoute = (
    location.pathname === '/administrativo/bienvenida' ||
    location.pathname === '/admin1/dashboard' ||
    location.pathname === '/admin1/inicio-admin' ||
    location.pathname === '/administrativo/inicio-admin'
  );

  // Cierre forzado del overlay para evitar que se quede abierto
  const forceCloseOverlay = () => {
    setIsDesktopSidebarOpen(false);
  };

  // Quitamos el auto-cierre extendido; el cierre será inmediato desde el sidebar
  useEffect(() => { }, [isDesktopSidebarOpen]);

  // Manejo de notificaciones
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  // TODO: Conectar con API del backend para obtener notificaciones reales
  const [notifications, setNotifications] = useState([]);

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
  };

  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Efecto para controlar el scroll del body cuando el menú móvil está abierto
  useEffect(() => {
    if (isMenuOpen && window.innerWidth < 768) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // Cerrar menú móvil automáticamente al ENTRAR en /alumno/cursos SOLO si no hay curso seleccionado
  // Si hay curso seleccionado, permitir que el menú se abra normalmente
  const prevCoursesRoute = React.useRef(isCoursesRoute);
  useEffect(() => {
    // Solo ejecutar cuando se ENTRÓ a la ruta (no cada vez que isMenuOpen cambia)
    if (isCoursesRoute && !prevCoursesRoute.current && isMenuOpen) {
      // Verificar si hay curso seleccionado
      try {
        const raw = localStorage.getItem('currentCourse');
        if (!raw || raw === 'null' || raw === 'undefined') {
          // No hay curso seleccionado, cerrar el menú solo al entrar
          setIsMenuOpen(false);
        }
        // Si hay curso seleccionado, no cerrar el menú
      } catch {
        // Error al leer, cerrar por seguridad
        setIsMenuOpen(false);
      }
    }
    prevCoursesRoute.current = isCoursesRoute;
  }, [isCoursesRoute]);

  // Determinar si realmente hay sidebar activo en esta pantalla
  const hasSidebar = Boolean(SideBarDesktopComponent) || Boolean(SideBarSmComponent);

  // Verificar si hay un curso seleccionado (para mostrar el botón flotante en /alumno/cursos cuando hay curso)
  const hasSelectedCourse = React.useMemo(() => {
    if (!isCoursesRoute) return true; // Si no es ruta de cursos, siempre mostrar si hay sidebar
    try {
      const raw = localStorage.getItem('currentCourse');
      if (!raw || raw === 'null' || raw === 'undefined') return false;
      const obj = JSON.parse(raw);
      return obj && typeof obj === 'object' && (obj.id || obj.title);
    } catch {
      return false;
    }
  }, [isCoursesRoute]);

  // Detectar si es ruta de bienvenida admin para aplicar fondo completo
  const isAdminBienvenidaRoute = (
    location.pathname === '/administrativo/bienvenida' ||
    location.pathname === '/administrativo/' ||
    location.pathname === '/administrativo' ||
    location.pathname === '/admin1/dashboard' ||
    location.pathname === '/admin1/inicio-admin' ||
    location.pathname === '/administrativo/inicio-admin'
  );

  return (
    <div className={`min-h-screen ${backgroundClassName} relative overflow-x-hidden ${isAdminBienvenidaRoute ? 'overflow-y-hidden' : ''}`}>
      {/* Header principal */}
      {HeaderComponent && (
        <HeaderComponent />
      )}

      {/* Sidebar para pantallas grandes */}
      {SideBarDesktopComponent && (
        <div className="fixed left-0 top-14 md:top-16 lg:top-20 bottom-0 z-40 hidden sm:block transition-all duration-300">
          <SideBarDesktopComponent {...sidebarProps} setDesktopSidebarOpen={setIsDesktopSidebarOpen} />
        </div>
      )}

      {/* Overlay con blur para móvil */}
      {hasSidebar && isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 sm:hidden transition-all duration-150 ease-out"
          onClick={closeMenu}
          aria-hidden="true"
          style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
        ></div>
      )}

      {/* Overlay con blur para escritorio */}
      {hasSidebar && isDesktopSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-[1px] z-30 hidden md:block transition-all duration-100 ease-out pointer-events-none"
          // El overlay de escritorio es solo visual; no captura clics para evitar interferir con el hover del sidebar
          aria-hidden="true"
          style={{ backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)' }}
        ></div>
      )}

      {/* Sidebar para móvil */}
      {SideBarSmComponent && <SideBarSmComponent {...sidebarProps} isMenuOpen={isMenuOpen} closeMenu={closeMenu} />}

      {/* Botón hamburguesa flotante (solo móvil) */}
      {/* Mostrar si hay sidebar Y (no es ruta de cursos O hay curso seleccionado) */}
      {hasSidebar && (!isCoursesRoute || hasSelectedCourse) && (
        <button
          onClick={toggleMenu}
          className="sm:hidden fixed bottom-4 right-4 w-10 h-10 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 z-50 flex items-center justify-center"
          aria-label="Abrir menú"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Contenido principal de la página */}
      <main
        className={
          `relative z-10 pt-14 ` +
          (contentClassName && contentClassName.includes('px-0')
            ? ''
            : 'px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 2xl:px-4') +
          (contentClassName && contentClassName.includes('pb-0')
            ? ''
            : ' pb-10') +
          (hasSidebar
            ? (' sm:ml-20 ' + (isDesktopSidebarOpen ? ' lg:ml-64' : ' lg:ml-20') + ' transition-none lg:transition-[margin] lg:duration-200')
            : '') +
          (contentClassName ? ` ${contentClassName}` : '') +
          (isAdminBienvenidaRoute ? ' p-0' : '')
        }
        style={{ minHeight: isAdminBienvenidaRoute ? 'calc(100vh - 56px)' : 'calc(100vh - 3.5rem)' }}
      >
        {children}
      </main>
    </div>
  );
}