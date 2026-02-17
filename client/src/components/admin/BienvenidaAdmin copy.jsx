import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useAdminContext } from '../../context/AdminContext.jsx';
import { useAdminNotificationContext } from '../../context/AdminNotificationContext.jsx';
import LoadingOverlay from '../shared/LoadingOverlay.jsx';

// ============================================================================
// DATOS MOTIVACIONALES (SOLO FRONTEND)
// ============================================================================

// Frases motivadoras - Estos datos se quedan aquí en el frontend, no van al backend
// eso si,se tendra que borrar algunos datos mock y solo dejar las frases
import {
  MOCK_EDUCATIONAL_QUOTES
} from '../../data/mockData.js';

// ============================================================================
// DATOS DE RESPALDO (SOLO FRONTEND)
// ============================================================================

// Datos de respaldo por si falla la conexión o no llegan datos del contexto
const FALLBACK_ADMIN_DATA = {
  name: "Administrador",
  role: "Administrador Principal",
  email: "admin@mqerk.com",
  avatarUrl: null
};

// ============================================================================
// HOOKS PERSONALIZADOS
// ============================================================================

/**
 * Actualiza la hora cada segundo
 */
const useCurrentTime = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Configura un temporizador para actualizar la hora cada segundo
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);


    return () => clearInterval(timer);
  }, []);

  return currentTime;
};


const useDailyQuote = (currentTime) => {

  const dailyQuote = useMemo(() => {
    if (!MOCK_EDUCATIONAL_QUOTES.length) return null;

    // Calcula el día del año para obtener una cita diferente cada día
    const startOfYear = new Date(currentTime.getFullYear(), 0, 0);
    const diff = currentTime.getTime() - startOfYear.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const quoteIndex = dayOfYear % MOCK_EDUCATIONAL_QUOTES.length;
    return MOCK_EDUCATIONAL_QUOTES[quoteIndex];
  }, [currentTime.getDate(), currentTime.getMonth(), currentTime.getFullYear()]);

  return { dailyQuote };
};

// ============================================================================
// COMPONENTES DE UI
// ============================================================================


const InfoCard = memo(({ title, icon, content, color }) => {
  // Mapeo de colores para evitar problemas con Tailwind
  const colorMap = {
    blue: {
      bg: 'bg-gradient-to-br from-blue-50 via-white to-cyan-50',
      border: 'border-blue-200',
      iconBg: 'bg-gradient-to-br from-blue-100 to-cyan-200',
      shadow: 'shadow-blue-200/50',
      hover: 'hover:border-blue-300 hover:shadow-blue-300/60'
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-50 via-white to-violet-50',
      border: 'border-purple-200',
      iconBg: 'bg-gradient-to-br from-purple-100 to-violet-200',
      shadow: 'shadow-purple-200/50',
      hover: 'hover:border-purple-300 hover:shadow-purple-300/60'
    },
    orange: {
      bg: 'bg-gradient-to-br from-orange-50 via-white to-amber-50',
      border: 'border-orange-200',
      iconBg: 'bg-gradient-to-br from-orange-100 to-amber-200',
      shadow: 'shadow-orange-200/50',
      hover: 'hover:border-orange-300 hover:shadow-orange-300/60'
    }
  };

  const colors = colorMap[color] || colorMap.blue;

  return (
    <div className={`
      relative text-center 
      p-3 xs:p-3.5 sm:p-4 md:p-5 lg:p-6 xl:p-7
      ${colors.bg} 
      rounded-xl sm:rounded-2xl lg:rounded-3xl 
      border-2 ${colors.border} 
      flex flex-col items-center justify-center
      shadow-lg sm:shadow-xl lg:shadow-2xl ${colors.shadow}
      backdrop-blur-sm
      transition-all duration-300 ease-in-out
      min-h-[90px] xs:min-h-[100px] sm:min-h-[120px] md:min-h-[140px] lg:min-h-[160px] xl:min-h-[180px]
      w-full
      group
      active:scale-95 touch-manipulation
      hover:scale-[1.02] hover:-translate-y-1
      ${colors.hover}
      ring-2 ring-transparent group-hover:ring-opacity-50
    `}>

      <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent rounded-xl sm:rounded-2xl lg:rounded-3xl"></div>

      <div className={`
        relative z-10 
        w-9 h-9 xs:w-10 xs:h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 xl:w-18 xl:h-18
        ${colors.iconBg} 
        rounded-full flex items-center justify-center mx-auto 
        mb-2 xs:mb-3 sm:mb-4 md:mb-5
        shadow-lg sm:shadow-xl lg:shadow-2xl
        ring-2 ring-white/50
        transform transition-all duration-300
        group-active:scale-95
        group-hover:scale-110 group-hover:shadow-2xl group-hover:ring-4
      `}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-full"></div>
        <div className="relative z-10">
          {icon}
        </div>
      </div>

      <h3 className="relative z-10 font-extrabold text-gray-800 mb-1.5 xs:mb-2 sm:mb-3 md:mb-4 text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl tracking-wide leading-tight group-hover:text-indigo-700 transition-colors duration-300 px-1">
        {title}
      </h3>

      <div className="relative z-10 w-full">
        {content}
      </div>
    </div>
  );
});

// Componente para el encabezado con el saludo y el nombre del administrador
const GreetingHeader = memo(({ greeting, adminName }) => {
  const [showWelcome, setShowWelcome] = useState(false);
  const selectedVideo = useMemo(() => {
    const videos = [
      "/108366-680178196_small.mp4",
      "/173684-849839047_small.mp4"
    ];
    return videos[Math.floor(Math.random() * videos.length)];
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative overflow-hidden min-h-[45vh] sm:min-h-[50vh] lg:min-h-[55vh] flex items-center justify-center bg-gray-900">
      {/* Background Video - Optimized for low-end devices */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          key={selectedVideo}
          className="w-full h-full object-cover scale-105 will-change-transform"
        >
          <source src={selectedVideo} type="video/mp4" />
        </video>
        {/* Overlay Gradients - Increased darkness for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/70 via-purple-900/40 to-black/50 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-black/20"></div>

        {/* Subtle noise to hide video artifacts */}
        <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none"></div>
      </div>

      {/* Decorative Blur Circles - Reduced blur radius for performance */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[60px] animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-56 h-56 bg-purple-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-[60px] animate-pulse animation-delay-1000 pointer-events-none"></div>

      {/* Main Content */}
      <div className="relative z-20 text-center px-4 py-12 sm:py-16 md:py-20 max-w-5xl mx-auto">
        <div className="inline-block mb-4 sm:mb-6 animate-slide-down">
          <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white text-[9px] sm:text-xs font-black uppercase tracking-[0.25em] drop-shadow-md">
            Panel Administrativo v2.0
          </div>
        </div>

        <h1 className="font-black leading-tight animate-slide-down mb-2 xs:mb-3 sm:mb-4
          text-[clamp(1.75rem,7vw,4.5rem)]
          tracking-tighter
          text-white
          drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]
        ">
          {greeting}
        </h1>

        <h2 className="font-bold leading-tight animate-slide-up mb-4 xs:mb-5 
          text-[clamp(1.25rem,4vw,2.8rem)]
          text-white
          drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]
        ">
          Admin <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent font-black drop-shadow-sm">{adminName}</span>
        </h2>

        <p className="max-w-2xl mx-auto opacity-100 leading-relaxed animate-fade-in-delayed
          text-[clamp(.9rem,2.4vw,1.3rem)]
          text-white font-bold tracking-wide
          drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]
        ">
          Bienvenido al panel administrativo de MQerKAcademy
        </p>

        {showWelcome && (
          <div className="mt-8 xs:mt-10 sm:mt-12 inline-flex items-center gap-3 bg-white/70 backdrop-blur-2xl rounded-2xl px-6 py-4 animate-welcome-banner shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/50 ring-1 ring-white/20 group cursor-default transition-all duration-500 hover:bg-white/90">
            <div className="flex -space-x-2 mr-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-indigo-600 bg-white flex items-center justify-center text-xs shadow-sm shadow-indigo-200" style={{ animationDelay: `${i * 300}ms` }}>
                  🎉
                </div>
              ))}
            </div>
            <span className="font-black text-indigo-950 text-sm sm:text-base tracking-tight">¡Que tengas un excelente día!</span>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.8)]"></div>
          </div>
        )}
      </div>

      {/* Ultra-Smooth Bottom Fade (Ease-in gradient to prevent hard lines) */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
        <div className="h-20 bg-gradient-to-t from-gray-50/50 to-transparent"></div>
        <div className="h-20 bg-gradient-to-t from-gray-50 via-gray-50 to-gray-50/50"></div>
      </div>

      <style>
        {`
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes fadeInDelayed {
            0%, 50% { opacity: 0; }
            100% { opacity: 1; }
          }
          
          @keyframes welcomeBanner {
            0% { opacity: 0; transform: translateY(20px) scale(0.95); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
          
          .animate-slide-down { animation: slideDown 0.8s cubic-bezier(0.2, 0.8, 0.2, 1); }
          .animate-slide-up { animation: slideUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) 0.15s both; }
          .animate-fade-in-delayed { animation: fadeInDelayed 1.5s ease-out; }
          .animate-welcome-banner { animation: welcomeBanner 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.6s both; }
          .animation-delay-1000 { animation-delay: 1s; }
        `}
      </style>
    </div>
  );
});

const NotificationsCard = memo(({ notifications, hasUnread }) => {
  return (
    <InfoCard
      title="Notificaciones"
      color="orange"
      icon={
        <div className="relative">
          <svg className="h-5 w-5 xs:h-6 xs:w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-9 lg:w-9 xl:h-10 xl:w-10 text-orange-600 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          {/* Indicador visual de notificaciones pendientes */}
          {hasUnread && (
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 bg-gradient-to-br from-red-500 to-red-600 rounded-full animate-pulse ring-2 ring-white shadow-lg"></span>
          )}
        </div>
      }
      content={
        <div className="space-y-2">
          {/* Contador de notificaciones sin leer */}
          <p className="text-xs xs:text-sm sm:text-base text-gray-800 font-extrabold">
            <span className="text-orange-600">{notifications?.unreadCount || 0}</span> sin leer
          </p>
          {/* Contador de notificaciones del día */}
          <p className="text-xs xs:text-sm sm:text-base text-gray-800 font-extrabold">
            <span className="text-orange-600">{notifications?.totalToday || 0}</span> hoy
          </p>
          {/* Preview de la notificación más reciente */}
          {notifications?.latest && notifications.latest !== "No hay notificaciones" ? (
            <p className="text-xs xs:text-sm text-gray-600 truncate font-medium px-1">
              {notifications.latest}
            </p>
          ) : (
            <p className="text-xs xs:text-sm text-gray-400 italic">
              No hay notificaciones
            </p>
          )}
        </div>
      }
    />
  );
});
const QuoteCard = memo(({ quote, author }) => {
  return (
    <div className="mt-4 xs:mt-6 sm:mt-8 md:mt-10 lg:mt-12 text-center px-2 xs:px-3 sm:px-4">
      <div className="
        bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 
        rounded-xl sm:rounded-2xl lg:rounded-3xl 
        p-4 xs:p-5 sm:p-6 md:p-8 lg:p-10 xl:p-12
        shadow-xl sm:shadow-2xl
        border-2 border-indigo-200/50
        backdrop-blur-sm
        transform transition-all duration-300 ease-in-out
        active:scale-[0.98] touch-manipulation
        hover:scale-[1.01] hover:shadow-2xl hover:border-indigo-300/60
        relative overflow-hidden
        max-w-full xs:max-w-sm sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto
        ring-2 ring-indigo-100/50
      ">

        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100/20 via-purple-100/10 to-transparent rounded-2xl sm:rounded-3xl"></div>

        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-200/20 to-purple-200/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-purple-200/20 to-indigo-200/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl"></div>

        <div className="relative z-10 mb-3 xs:mb-4 sm:mb-5 md:mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full ring-2 ring-indigo-200/50 shadow-lg">
            <svg className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Texto de la cita */}
        <p className="
          relative z-10 text-gray-800 
          text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl
          italic leading-relaxed sm:leading-loose
          font-semibold tracking-wide
          mb-3 xs:mb-4 sm:mb-5 md:mb-6 lg:mb-8
          px-1 xs:px-2 sm:px-3 md:px-4 lg:px-6
          drop-shadow-sm
        ">
          "{quote}"
        </p>

        {/* Autor de la cita */}
        <p className="
          relative z-10 text-indigo-700 
          text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl
          font-extrabold tracking-wider
          border-t-2 border-indigo-200/50 pt-3 xs:pt-4 sm:pt-5
        ">
          — {author}
        </p>
      </div>
    </div>
  );
});

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Componente principal: BienvenidaAdmin (antes era Admin1 pero el jefe pidió cambio)
 * 
 * CÓMO FUNCIONA LA INTEGRACIÓN:
 * - Los datos NO vienen directo del backend a este componente
 * - Todo pasa por AdminContext.jsx (perfil del admin, datos generales)
 * - Las notificaciones vienen directamente del hook useAdminNotifications.js
 * - Este componente solo consume y muestra, no hace llamadas HTTP
 * 
 * SI QUIERES CAMBIAR ALGO DEL BACKEND:
 * - Ve a AdminContext.jsx para datos del admin y sistema
 * - Ve a useAdminNotifications.js para notificaciones
 * - NO toques este archivo, aquí solo se muestran cosas
 * 
 * Lo único que se queda en frontend:
 * - Frases motivadoras (MOCK_EDUCATIONAL_QUOTES)
 * - Hora y fecha (se calcula aquí mismo)
 * - Saludos (Buenos días/tardes/noches)
 */
function Bienvenida_Admin1() {
  // ========================================
  // HOOKS Y ESTADO LOCAL
  // ========================================

  // Hora actual usando hook personalizado (esto se queda en frontend)
  const currentTime = useCurrentTime();

  // Hook para la cita diaria (frases motivadoras - también frontend)
  const { dailyQuote } = useDailyQuote(currentTime);

  // Datos del admin vienen del contexto (AdminContext.jsx maneja el backend)
  const {
    adminData,
    isLoading: adminLoading,
    error: adminError
  } = useAdminContext();

  // Notificaciones: usa el contexto compartido del header para evitar doble polling
  const {
    notifications,
    unreadCount
  } = useAdminNotificationContext();

  // Datos del admin con respaldo (por si no llega nada del contexto)
  const name = adminData?.name || adminData?.fullName || FALLBACK_ADMIN_DATA.name;
  const role = adminData?.role || FALLBACK_ADMIN_DATA.role;
  const email = adminData?.email || FALLBACK_ADMIN_DATA.email;

  // ========================================
  // FUNCIONES UTILITARIAS (FRONTEND SOLAMENTE)
  // ========================================

  // Función para obtener el saludo según la hora (esto se queda aquí)
  const getGreeting = useCallback(() => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return "¡Buenos días";
    if (hour >= 12 && hour < 18) return "¡Buenas tardes";
    return "¡Buenas noches";
  }, [currentTime]);

  // Función para formatear la fecha (también se queda aquí)
  const formatDate = useCallback((date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  // Función para formatear la hora (también se queda aquí)
  const formatTime = useCallback((date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }, []);

  // ========================================
  // RENDER DEL COMPONENTE
  // ========================================

  // Pantalla de carga mientras AdminContext trae los datos
  // (puedes quitar esto si no quieres pantalla de carga)
  if (adminLoading) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
        <LoadingOverlay message="Cargando panel de administración..." />
      </div>
    );
  }

  // Si hay error cargando datos del AdminContext
  if (adminError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 text-center max-w-md mx-auto border-2 border-red-200 ring-2 ring-red-100/50">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 ring-2 ring-red-200/50 shadow-lg">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-red-700 mb-3 sm:mb-4">Error de Conexión</h2>
          <p className="text-gray-700 mb-6 sm:mb-8 text-sm sm:text-base font-medium">No se pudieron cargar los datos del administrador: {adminError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl sm:rounded-2xl hover:from-red-700 hover:to-rose-700 transition-all duration-200 font-extrabold shadow-lg hover:shadow-xl active:scale-95 ring-2 ring-red-200/50"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen font-sans bg-gradient-to-br from-gray-50 via-white to-indigo-50" style={{
      margin: 0,
      padding: 0,
      minHeight: '100vh',
      width: '100%'
    }}>
      <div className="w-full min-h-full">

        {/* Header con saludo y nombre (GreetingHeader solo muestra lo que le pasas) */}
        <GreetingHeader
          greeting={getGreeting()}
          adminName={name}
        />

        {/* Tarjetas con info - los datos vienen de los contextos/hooks */}
        <div className="px-3 py-4 xs:px-4 xs:py-5 sm:px-5 sm:py-6 md:px-6 md:py-8 lg:px-8 lg:py-10 xl:px-10 xl:py-12">
          <div className="grid grid-cols-1 min-[380px]:grid-cols-2 md:grid-cols-3 gap-4 xs:gap-5 sm:gap-6 md:gap-7 lg:gap-8 xl:gap-10 w-full max-w-full md:max-w-6xl mx-auto">

            {/* Tarjeta de Fecha (esto se queda en frontend) */}
            <InfoCard
              title="Fecha"
              color="blue"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 xl:h-9 xl:w-9 text-blue-600 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              content={
                <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl text-gray-800 capitalize leading-tight font-extrabold px-1 xs:px-2 drop-shadow-sm">
                  {formatDate(currentTime)}
                </p>
              }
            />

            {/* Tarjeta de Hora (esto también se queda en frontend) */}
            <InfoCard
              title="Hora"
              color="purple"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 xl:h-9 xl:w-9 text-purple-600 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              content={
                <p className="text-base xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-mono text-gray-800 font-extrabold tracking-wider drop-shadow-sm bg-gradient-to-br from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {formatTime(currentTime)}
                </p>
              }
            />
            {/* aunque tal vez la borre ya hay muchas tarjetas de notificaciones */}
            {/* Tarjeta de Notificaciones (datos vienen del hook useAdminNotifications directamente) */}
            <NotificationsCard
              notifications={{
                unreadCount: unreadCount,
                totalToday: notifications?.filter(n => {
                  const today = new Date().toDateString();
                  const ts = n?.timestamp ? new Date(n.timestamp) : null;
                  return ts && ts.toDateString() === today;
                }).length || 0,
                latest: notifications?.[0]?.message || "No hay notificaciones"
              }}
              hasUnread={unreadCount > 0}
            />
          </div>

          {/* Cita Diaria (frases motivadoras - se quedan en frontend) */}
          {dailyQuote && (
            <QuoteCard quote={dailyQuote.quote} author={dailyQuote.author} />
          )}
        </div>
      </div>
    </div>
  );
}

export default Bienvenida_Admin1;

