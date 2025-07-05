// src/components/Layout.jsx
import React, { useState, useEffect } from 'react';

/**
 * Componente de Layout general - SOLO CON TAILWIND
 * ❌ Sin CSS personalizado
 * ✅ Solo clases de Tailwind
 */
export function Layout({ children, HeaderComponent, SideBarDesktopComponent, SideBarSmComponent }) {
  // Estado para controlar la apertura del menú móvil
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Estado para controlar la apertura del sidebar de escritorio
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(false);

  // Función para forzar el cierre del overlay si se queda trabado
  const forceCloseOverlay = () => {
    setIsDesktopSidebarOpen(false);
  };

  // Auto-cierre del overlay después de un tiempo si se queda trabado
  useEffect(() => {
    if (isDesktopSidebarOpen) {
      const timeout = setTimeout(() => {
        setIsDesktopSidebarOpen(false);
      }, 5000); // Forzar cierre después de 5 segundos
      return () => clearTimeout(timeout);
    }
  }, [isDesktopSidebarOpen]);

  // Estados y funciones para notificaciones
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "Pago de Juan Pérez revisado", isRead: false },
    { id: 2, message: "Pago de María García revisado", isRead: false },
    { id: 3, message: "Nuevo estudiante registrado", isRead: false },
    { id: 4, message: "Se ha agendado una asesoría", isRead: false },
    { id: 5, message: "Recordatorio: Informe mensual", isRead: false },
  ]);

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

  return (
    <div className="min-h-screen bg-white relative">
      {/* ✅ ELIMINADO TODO EL CSS - SOLO TAILWIND */}
      
      {/* Renderiza el HeaderComponent */}
      {HeaderComponent && (
        <HeaderComponent
          isNotificationsOpen={isNotificationsOpen}
          toggleNotifications={toggleNotifications}
          markAllAsRead={markAllAsRead}
          notifications={notifications}
          unreadCount={unreadCount}
          setIsNotificationsOpen={setIsNotificationsOpen}
          toggleMenu={toggleMenu}
        />
      )}

      {/* Renderiza el SideBarDesktopComponent para escritorio */}
      {SideBarDesktopComponent && (
        <div className="fixed left-0 top-0 h-full z-40 pt-20 hidden sm:block">
          <SideBarDesktopComponent
            setDesktopSidebarOpen={setIsDesktopSidebarOpen}
          />
        </div>
      )}

      {/* Overlay para el efecto de desenfoque en MÓVIL */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 sm:hidden transition-all duration-300 ease-in-out"
          onClick={closeMenu}
          aria-hidden="true"
          style={{
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)'
          }}
        ></div>
      )}

      {/* Overlay para el efecto de desenfoque en ESCRITORIO */}
      {isDesktopSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-[1px] z-30 hidden md:block transition-all duration-300 ease-in-out"
          onClick={forceCloseOverlay}
          aria-hidden="true"
          style={{
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)'
          }}
        ></div>
      )}

      {/* Renderiza el SideBarSmComponent para móvil */}
      {SideBarSmComponent && (
        <SideBarSmComponent isMenuOpen={isMenuOpen} closeMenu={closeMenu} />
      )}

      {/* Botón para abrir/cerrar el menú móvil (visible solo en pantallas pequeñas) */}
      <button
        onClick={toggleMenu}
        className="sm:hidden fixed bottom-4 right-4 w-10 h-10 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 z-50 flex items-center justify-center"
        aria-label="Abrir menú"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Contenido principal de la aplicación */}
      <main className="relative z-10 pt-4 pb-6 pl-5 pr-3 sm:px-6 lg:px-8 ml-0 sm:ml-20 transition-all duration-200">
        <div className="scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          {children}
        </div>
      </main>
    </div>
  );
}