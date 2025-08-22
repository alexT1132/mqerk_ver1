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
} from '../../data/mockData';

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

  const bgColor = `bg-gradient-to-br from-${color}-50 via-white to-${color}-100`;
  const borderColor = `border-${color}-200`;
  const bgIconColor = `bg-gradient-to-br from-${color}-100 to-${color}-200`;
  const shadowColor = `shadow-${color}-200/50`;

  return (
    <div className={`
      relative text-center 
      p-2 xs:p-3 sm:p-5 md:p-6 lg:p-7 xl:p-8
      ${bgColor} 
      rounded-lg xs:rounded-xl sm:rounded-2xl lg:rounded-3xl 
      border-2 ${borderColor} 
      flex flex-col items-center justify-center
      shadow-md xs:shadow-lg sm:shadow-xl lg:shadow-2xl ${shadowColor}
      backdrop-blur-sm
      transition-all duration-300 ease-in-out
      min-h-[88px] xs:min-h-[110px] sm:min-h-[140px] md:min-h-[150px] lg:min-h-[160px] xl:min-h-[180px]
      w-full
      group
    `}>
      
      <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-xl sm:rounded-2xl lg:rounded-3xl"></div>
      
      
      <div className={`
        relative z-10 
        w-7 h-7 xs:w-9 xs:h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 xl:w-18 xl:h-18
        ${bgIconColor} 
        rounded-full flex items-center justify-center mx-auto 
        mb-2 xs:mb-3 sm:mb-4 md:mb-5 lg:mb-6
        shadow-sm xs:shadow-md sm:shadow-lg lg:shadow-xl
        ring-1 xs:ring-2 ring-white/50
        transform transition-all duration-300
        group-hover:scale-105 xs:group-hover:scale-110 group-hover:shadow-lg xs:group-hover:shadow-xl
      `}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-full"></div>
        <div className="relative z-10">
          {icon} 
        </div>
      </div>
      
      
      <h3 className="relative z-10 font-bold text-gray-800 mb-1 xs:mb-2 sm:mb-3 text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl tracking-wide leading-tight group-hover:text-indigo-600">
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
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 px-3 py-4 xs:px-4 xs:py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-10 lg:py-12 xl:px-12 xl:py-16 text-white relative overflow-hidden">
     
      <div className="absolute top-0 right-0 w-16 h-16 xs:w-24 xs:h-24 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-64 lg:h-64 xl:w-80 xl:h-80 bg-white bg-opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
     
      <div className="absolute bottom-0 left-0 w-12 h-12 xs:w-20 xs:h-20 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 xl:w-64 xl:h-64 bg-white bg-opacity-5 rounded-full translate-y-1/2 -translate-x-1/2 animate-pulse animation-delay-1000"></div>

    
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 text-white/20 text-2xl animate-float-slow">✨</div>
        <div className="absolute top-3/4 right-1/4 text-white/20 text-xl animate-float-slow animation-delay-2000">⭐</div>
        <div className="absolute top-1/2 left-3/4 text-white/20 text-lg animate-float-slow animation-delay-3000">💫</div>
      </div>

      <div className="relative z-10 text-center">
      
  <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold mb-1 sm:mb-2 md:mb-3 lg:mb-4 leading-tight animate-slide-down">
          {greeting}
          <span className="block absolute left-1/2 -translate-x-1/2 bottom-0 w-2/3 h-0.5 bg-gradient-to-r from-indigo-500/80 to-purple-500/80 rounded-full origin-center scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></span>
        </h1>
        
       
  <h2 className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-light mb-1 sm:mb-3 md:mb-4 lg:mb-5 opacity-90 leading-tight animate-slide-up">
          Admin <span className="font-semibold text-yellow-200">{adminName}</span>
        </h2>
        
      
        <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl opacity-80 px-1 xs:px-2 sm:px-4 md:px-6 lg:px-8 leading-relaxed animate-fade-in-delayed">
          Bienvenido al panel administrativo de MQerKAcademy
        </p>

       
        {showWelcome && (
          <div className="mt-4 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 animate-welcome-banner">
            <span className="text-yellow-300 text-lg animate-bounce">🎉</span>
            <span className="text-sm font-medium">¡Que tengas un excelente día!</span>
            <span className="text-yellow-300 text-lg animate-bounce animation-delay-500">🚀</span>
          </div>
        )}
      </div>

      {/* Estilos adicionales para las nuevas animaciones */}
      <style>
        {`
          @keyframes floatSlow {
            0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
            50% { transform: translateY(-20px) rotate(180deg); opacity: 0.7; }
          }
          
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes fadeInDelayed {
            0% { opacity: 0; transform: scale(0.9); }
            70% { opacity: 0; transform: scale(0.9); }
            100% { opacity: 0.8; transform: scale(1); }
          }
          
          @keyframes welcomeBanner {
            0% { opacity: 0; transform: scale(0.8) translateY(20px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
          
          .animate-float-slow { animation: floatSlow 4s ease-in-out infinite; }
          .animate-slide-down { animation: slideDown 0.8s ease-out; }
          .animate-slide-up { animation: slideUp 0.8s ease-out 0.3s both; }
          .animate-fade-in-delayed { animation: fadeInDelayed 1.5s ease-out; }
          .animate-welcome-banner { animation: welcomeBanner 0.6s ease-out 1s both; }
          .animation-delay-1000 { animation-delay: 1s; }
          .animation-delay-2000 { animation-delay: 2s; }
          .animation-delay-3000 { animation-delay: 3s; }
          .animation-delay-500 { animation-delay: 0.5s; }
        `}
      </style>
    </div>
  );
});

/**
 * Componente NotificationsCard - Muestra resumen de notificaciones del admin
 * 
 * IMPORTANTE: Los datos NO vienen directo del backend, sino del hook useAdminNotifications()
 * Este hook maneja todo internamente, aquí solo mostramos lo que nos pasa
 * 
 * Si quieres cambiar la lógica de notificaciones, ve a:
 * - useAdminNotifications.js (donde está la lógica)
 * 
 * Este componente NO se toca para integrar backend, solo muestra datos
 */
const NotificationsCard = memo(({ notifications, hasUnread }) => {
  return (
    <InfoCard
      title="Notificaciones"
      color="orange"
      icon={
        <div className="relative">
          <svg className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5zm0-8h5l-5-5-5 5h5z" />
          </svg>
          {/* Indicador visual de notificaciones pendientes */}
          {hasUnread && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          )}
        </div>
      }
      content={
        <div className="space-y-1">
          {/* Contador de notificaciones sin leer */}
          <p className="text-xs text-gray-700">
            <span className="font-semibold">{notifications?.unreadCount || 0}</span> sin leer
          </p>
          {/* Contador de notificaciones del día */}
          <p className="text-xs text-gray-700">
            <span className="font-semibold">{notifications?.totalToday || 0}</span> hoy
          </p>
          {/* Preview de la notificación más reciente */}
          {notifications?.latest && (
            <p className="text-xs text-gray-500 truncate">
              {notifications.latest}
            </p>
          )}
        </div>
      }
    />
  );
});
const QuoteCard = memo(({ quote, author }) => {
  return (
    <div className="mt-4 xs:mt-6 sm:mt-8 md:mt-10 lg:mt-12 text-center">
      <div className="
        bg-gradient-to-br from-white via-gray-50 to-gray-100 
        rounded-xl xs:rounded-2xl sm:rounded-3xl lg:rounded-3xl 
        p-4 xs:p-6 sm:p-8 md:p-10 lg:p-12 xl:p-14
        shadow-lg xs:shadow-xl sm:shadow-2xl lg:shadow-2xl
        border-2 border-gray-200/50
        backdrop-blur-sm
        transform transition-all duration-300 ease-in-out
        hover:scale-[1.01] xs:hover:scale-[1.02] hover:shadow-xl xs:hover:shadow-2xl hover:shadow-gray-300/50
        relative overflow-hidden
        max-w-xs xs:max-w-sm sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto
      ">
       
        <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent rounded-xl xs:rounded-2xl sm:rounded-3xl"></div>
        
       
        <div className="relative z-10 mb-3 xs:mb-4 sm:mb-6">
          <svg className="w-6 h-6 xs:w-8 xs:h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-gray-400 mx-auto opacity-60" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
          </svg>
        </div>
        
        {/* Texto de la cita */}
        <p className="
          relative z-10 text-gray-700 
          text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl
          italic leading-relaxed xs:leading-relaxed sm:leading-loose
          font-medium tracking-wide
          mb-3 xs:mb-4 sm:mb-6 md:mb-8 lg:mb-10
          px-1 xs:px-2 sm:px-4 md:px-6 lg:px-8
        ">
          "{quote}"
        </p>
        
        {/* Autor de la cita */}
        <p className="
          relative z-10 text-gray-500 
          text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl
          font-semibold tracking-wider
          border-t border-gray-200 pt-3 xs:pt-4 sm:pt-6
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md mx-auto border border-red-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Error de Conexión</h2>
          <p className="text-gray-600 mb-6">No se pudieron cargar los datos del administrador: {adminError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen p-3 sm:p-6 md:p-8 lg:p-10 font-sans bg-gradient-to-br from-gray-50 via-white to-indigo-50">
      <div className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl shadow-xl hover:shadow-2xl transition-shadow duration-300 overflow-hidden w-full max-w-full sm:max-w-3xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto border-2 border-gray-200/80 hover:border-indigo-200/80">

        {/* Header con saludo y nombre (GreetingHeader solo muestra lo que le pasas) */}
        <GreetingHeader 
          greeting={getGreeting()} 
          adminName={name} 
        />

        {/* Tarjetas con info - los datos vienen de los contextos/hooks */}
        <div className="px-3 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 lg:px-10 lg:py-10 bg-white">
          <div className="grid grid-cols-1 min-[380px]:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-7 xl:gap-8 w-full max-w-full md:max-w-6xl mx-auto">

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
                <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 capitalize leading-tight font-medium px-1 xs:px-2">
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
                <p className="text-sm xs:text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-mono text-gray-700 font-bold tracking-wider">
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

// segun sho y chiat ya todo esta ready para el backend