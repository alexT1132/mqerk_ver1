import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';

// ============================================================================
// DATOS MOTIVACIONALES (FRONTEND ONLY)
// ============================================================================

// Frases motivadoras - Estas permanecen en el frontend
import { 
  MOCK_EDUCATIONAL_QUOTES
} from '../../data/mockData';

// ============================================================================
// DATOS ESTÁTICOS DEL ADMINISTRADOR (FRONTEND ONLY)
// ============================================================================

const ADMIN_DATA = {
  name: "Carlos Mendoza",
  role: "Administrador Principal"
};

// ============================================================================
// HOOKS PERSONALIZADOS
// ============================================================================

/**
 * Hook personalizado para la hora actual (memoized)
 * Actualiza la hora cada segundo
 */
const useCurrentTime = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Configura un temporizador para actualizar la hora cada segundo
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Limpia el temporizador cuando el componente se desmonta o el efecto se re-ejecuta
    return () => clearInterval(timer);
  }, []); // El array vacío asegura que el efecto se ejecute solo una vez al montar

  return currentTime;
};

/**
 * Hook personalizado para la cita diaria (memoized)
 * Las frases motivadoras permanecen en el frontend
 */
const useDailyQuote = (currentTime) => {
  // Memoiza la cita diaria para que solo se recalcule cuando la fecha cambie
  const dailyQuote = useMemo(() => {
    if (!MOCK_EDUCATIONAL_QUOTES.length) return null;
    
    // Calcula el día del año para obtener una cita diferente cada día
    const startOfYear = new Date(currentTime.getFullYear(), 0, 0);
    const diff = currentTime.getTime() - startOfYear.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    // Usa el módulo para ciclar a través de las citas
    const quoteIndex = dayOfYear % MOCK_EDUCATIONAL_QUOTES.length;
    return MOCK_EDUCATIONAL_QUOTES[quoteIndex];
  }, [currentTime.getDate(), currentTime.getMonth(), currentTime.getFullYear()]);

  return { dailyQuote };
};

// ============================================================================
// COMPONENTES DE UI
// ============================================================================

// Componente para la tarjeta de información (memoized para evitar re-renders innecesarios)
const InfoCard = memo(({ title, icon, content, color }) => {
  // Clases dinámicas de Tailwind para colores de fondo, borde y texto/icono
  const bgColor = `bg-gradient-to-br from-${color}-50 via-white to-${color}-100`;
  const borderColor = `border-${color}-200`;
  const bgIconColor = `bg-gradient-to-br from-${color}-100 to-${color}-200`;
  const shadowColor = `shadow-${color}-200/50`;

  return (
    <div className={`
      relative text-center 
      p-3 xs:p-4 sm:p-5 md:p-6 lg:p-7 xl:p-8
      ${bgColor} 
      rounded-lg xs:rounded-xl sm:rounded-2xl lg:rounded-3xl 
      border-2 ${borderColor} 
      flex flex-col items-center justify-center
      shadow-md xs:shadow-lg sm:shadow-xl lg:shadow-2xl ${shadowColor}
      backdrop-blur-sm
      transform transition-all duration-300 ease-in-out
      hover:scale-[1.02] xs:hover:scale-105 hover:shadow-xl xs:hover:shadow-2xl hover:shadow-${color}-300/60
      hover:-translate-y-0.5 xs:hover:-translate-y-1
      min-h-[100px] xs:min-h-[120px] sm:min-h-[140px] md:min-h-[150px] lg:min-h-[160px] xl:min-h-[180px]
      w-full
      group
    `}>
      {/* Efecto de brillo sutil */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-xl sm:rounded-2xl lg:rounded-3xl"></div>
      
      {/* Contenedor del icono con fondo redondeado y mejor profundidad */}
      <div className={`
        relative z-10 
        w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 xl:w-18 xl:h-18
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
          {icon} {/* El icono se pasa como prop (un componente SVG) */}
        </div>
      </div>
      
      {/* Título de la tarjeta */}
      <h3 className="relative z-10 font-bold text-gray-800 mb-1 xs:mb-2 sm:mb-3 text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl tracking-wide leading-tight">
        {title}
      </h3>
      
      {/* Contenido de la tarjeta */}
      <div className="relative z-10 w-full">
        {content}
      </div>
    </div>
  );
});

// Componente para el encabezado con el saludo (memoized para evitar re-renders innecesarios)
const GreetingHeader = memo(({ greeting, adminName }) => {
  return (
    <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 px-3 py-4 xs:px-4 xs:py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-10 lg:py-12 xl:px-12 xl:py-16 text-white relative overflow-hidden">
      {/* Figuras decorativas de fondo para un efecto visual atractivo */}
      {/* Figura superior derecha: Ajustamos los valores de translate para que sean visibles */}
      <div className="absolute top-0 right-0 w-16 h-16 xs:w-24 xs:h-24 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-64 lg:h-64 xl:w-80 xl:h-80 bg-white bg-opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      {/* Figura inferior izquierda: Ajustamos los valores de translate para que sean visibles */}
      <div className="absolute bottom-0 left-0 w-12 h-12 xs:w-20 xs:h-20 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 xl:w-64 xl:h-64 bg-white bg-opacity-5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

      <div className="relative z-10 text-center">
        {/* Saludo dinámico */}
        <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold mb-1 xs:mb-1 sm:mb-2 md:mb-3 lg:mb-4 leading-tight">
          {greeting}
        </h1>
        {/* Nombre del administrador */}
        <h2 className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-light mb-1 xs:mb-2 sm:mb-3 md:mb-4 lg:mb-5 opacity-90 leading-tight">
          Admin <span className="font-semibold">{adminName}</span>
        </h2>
        {/* Mensaje de bienvenida adicional */}
        <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl opacity-80 px-1 xs:px-2 sm:px-4 md:px-6 lg:px-8 leading-relaxed">
          Bienvenido al panel administrativo de MQerK Academy
        </p>
      </div>
    </div>
  );
});

// Componente para la tarjeta de la cita (memoized para evitar re-renders innecesarios)
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
        {/* Efecto de brillo sutil */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent rounded-xl xs:rounded-2xl sm:rounded-3xl"></div>
        
        {/* Icono de comillas decorativo */}
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
 * Componente principal: Bienvenida_pago_Admin1
 * Este componente se encarga de mostrar la interfaz de bienvenida para el administrador,
 * incluyendo la fecha, hora, estado del sistema y una cita diaria.
 * 
 * Las frases motivadoras permanecen en el frontend.
 * Los datos del administrador y sistema son estáticos (solo frontend).
 * 
 * ESTE ES EL COMPONENTE QUE DEBE SER EXPORTADO DESDE BienvenidaAdmin.jsx
 */
export function Bienvenida_pago_Admin1() {
  // ========================================
  // HOOKS Y ESTADO LOCAL
  // ========================================
  
  // Obtiene la hora actual usando el hook personalizado
  const currentTime = useCurrentTime();
  
  // Hook para la cita diaria (frases motivadoras)
  const { dailyQuote } = useDailyQuote(currentTime);

  // ========================================
  // FUNCIONES UTILITARIAS MEMOIZADAS
  // ========================================
  
  // Función memoizada para obtener el saludo (Buenos días, tardes, noches)
  const getGreeting = useCallback(() => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return "Buenos días";
    if (hour >= 12 && hour < 18) return "Buenas tardes";
    return "Buenas noches";
  }, [currentTime]); // Se recalcula si la hora cambia

  // Función memoizada para formatear la fecha
  const formatDate = useCallback((date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []); // Dependencia vacía para memoizar una vez

  // Función memoizada para formatear la hora
  const formatTime = useCallback((date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }, []); // Dependencia vacía para memoizar una vez

  // ========================================
  // RENDER DEL COMPONENTE
  // ========================================

  return (
    <div className="flex flex-col w-full h-full p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 font-sans min-h-screen ultra-small-padding">
      <div className="bg-white rounded-lg xs:rounded-xl sm:rounded-2xl md:rounded-3xl lg:rounded-3xl shadow-md xs:shadow-lg sm:shadow-xl overflow-hidden max-w-xs xs:max-w-sm sm:max-w-4xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto w-full landscape-compact">

        {/* Encabezado con el saludo y el nombre del administrador */}
        <GreetingHeader 
          greeting={getGreeting()} 
          adminName={ADMIN_DATA.name}
        />

        {/* Sección de tarjetas de información */}
        <div className="px-3 py-4 xs:px-4 xs:py-5 sm:px-6 sm:py-6 md:px-8 md:py-8 lg:px-10 lg:py-10 xl:px-12 xl:py-12 bg-gradient-to-br from-gray-50 to-gray-100 ultra-small-padding landscape-compact">
          <div className="grid grid-cols-1 gap-3 xs:gap-4 sm:grid-cols-2 sm:gap-5 md:gap-6 lg:gap-7 xl:gap-8 max-w-xs xs:max-w-sm sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto ultra-small-gap">

            {/* Tarjeta de Fecha */}
            <InfoCard
              title="Fecha"
              color="blue"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 xl:h-9 xl:w-9 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              content={
                <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 capitalize leading-tight font-medium px-1 xs:px-2">
                  {formatDate(currentTime)}
                </p>
              }
            />

            {/* Tarjeta de Hora */}
            <InfoCard
              title="Hora"
              color="purple"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 xl:h-9 xl:w-9 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              content={
                <p className="text-sm xs:text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-mono text-gray-700 font-bold tracking-wider">
                  {formatTime(currentTime)}
                </p>
              }
            />
          </div>

          {/* Tarjeta de la Cita Diaria (Frases motivadoras) */}
          {dailyQuote && (
            <QuoteCard quote={dailyQuote.quote} author={dailyQuote.author} />
          )}
        </div>
      </div>
    </div>
  );
}