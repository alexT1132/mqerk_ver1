import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';

// Hook personalizado para la hora actual (memoized)
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

// Hook personalizado para la cita diaria (memoized)
const useDailyQuote = (currentTime, quotes) => {
  // Memoiza la cita diaria para que solo se recalcule cuando la fecha o las citas cambien
  return useMemo(() => {
    // Calcula el día del año para obtener una cita diferente cada día
    const startOfYear = new Date(currentTime.getFullYear(), 0, 0);
    const diff = currentTime.getTime() - startOfYear.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    // Usa el módulo para ciclar a través de las citas
    const quoteIndex = dayOfYear % quotes.length;
    return quotes[quoteIndex];
  }, [currentTime.getDate(), currentTime.getMonth(), currentTime.getFullYear(), quotes]); // Dependencias para recalcular diariamente
};

// Componente para la tarjeta de información (memoized para evitar re-renders innecesarios)
const InfoCard = memo(({ title, icon, content, color }) => {
  // Clases dinámicas de Tailwind para colores de fondo, borde y texto/icono
  const bgColor = `bg-gradient-to-br from-${color}-50 to-${color}-100`;
  const borderColor = `border-${color}-100`;
  // const iconColor = `text-${color}-600`; // No se usa directamente, el color del icono está en el SVG o via parent
  const bgIconColor = `bg-${color}-100`;

  return (
    <div className={`text-center p-3 sm:p-4 lg:p-5 xl:p-6 ${bgColor} rounded-lg sm:rounded-xl lg:rounded-2xl border ${borderColor} flex flex-col items-center justify-center`}>
      {/* Contenedor del icono con fondo redondeado */}
      <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 ${bgIconColor} rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-4`}>
        {icon} {/* El icono se pasa como prop (un componente SVG) */}
      </div>
      {/* Título de la tarjeta */}
      <h3 className="font-semibold text-gray-800 mb-1 sm:mb-2 text-xs sm:text-sm lg:text-base xl:text-lg">{title}</h3>
      {/* Contenido de la tarjeta */}
      {content}
    </div>
  );
});

// Componente para el encabezado con el saludo (memoized para evitar re-renders innecesarios)
const GreetingHeader = memo(({ greeting }) => {
  return (
    <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12 xl:px-12 xl:py-16 text-white relative overflow-hidden">
      {/* Figuras decorativas de fondo para un efecto visual atractivo */}
      {/* Figura superior derecha: Ajustamos los valores de translate para que sean visibles */}
      <div className="absolute top-0 right-0 w-24 h-24 sm:w-40 sm:h-40 lg:w-64 lg:h-64 xl:w-80 xl:h-80 bg-white bg-opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      {/* Figura inferior izquierda: Ajustamos los valores de translate para que sean visibles */}
      <div className="absolute bottom-0 left-0 w-20 h-20 sm:w-32 sm:h-32 lg:w-48 lg:h-48 xl:w-64 xl:h-64 bg-white bg-opacity-5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

      <div className="relative z-10 text-center">
        {/* Saludo dinámico */}
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold mb-1 sm:mb-2 lg:mb-3">
          {greeting}
        </h1>
        {/* Nombre del administrador */}
        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-light mb-2 sm:mb-3 lg:mb-4 opacity-90">
          Admin <span className="font-semibold">Carlos Mendoza</span>
        </h2>
        {/* Mensaje de bienvenida adicional */}
        <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl opacity-80 px-2 sm:px-4 lg:px-6">
          Bienvenido al panel administrativo de MQerK Academy
        </p>
      </div>
    </div>
  );
});

// Componente para la tarjeta de la cita (memoized para evitar re-renders innecesarios)
const QuoteCard = memo(({ quote, author }) => {
  return (
    <div className="mt-4 sm:mt-6 lg:mt-8 text-center">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6">
        {/* Texto de la cita */}
        <p className="text-gray-700 text-xs sm:text-sm lg:text-base xl:text-lg italic leading-relaxed">
          "{quote}"
        </p>
        {/* Autor de la cita */}
        <p className="text-gray-500 text-xs sm:text-sm lg:text-base mt-1 sm:mt-2">- {author}</p>
      </div>
    </div>
  );
});

// Componente principal: Bienvenida_pago_Admin1
// Este componente se encarga de mostrar la interfaz de bienvenida para el administrador,
// incluyendo la fecha, hora, estado del sistema y una cita diaria.
// ESTE ES EL COMPONENTE QUE DEBE SER EXPORTADO DESDE BienvenidaAdmin.jsx
export function Bienvenida_pago_Admin1() {
  // Obtiene la hora actual usando el hook personalizado
  const currentTime = useCurrentTime();

  // Lista de citas educativas memoizadas para evitar re-creación en cada render
  const educationalQuotes = useMemo(() => [
    { quote: "La educación es el arma más poderosa que puedes usar para cambiar el mundo", author: "Nelson Mandela" },
    { quote: "El objetivo de la educación es la virtud y el deseo de convertirse en un buen ciudadano", author: "Platón" },
    { quote: "La educación no es preparación para la vida; la educación es la vida en sí misma", author: "John Dewey" },
    { quote: "Enseñar es aprender dos veces", author: "Joseph Joubert" },
    { quote: "La educación es el pasaporte hacia el futuro, el mañana pertenece a aquellos que se preparan para él en el día de hoy", author: "Malcolm X" },
    { quote: "El aprendizaje nunca agota la mente", author: "Leonardo da Vinci" },
    { quote: "La educación es la llave dorada que abre la puerta de la libertad", author: "George Washington Carver" },
    { quote: "Lo que esculpe al ser humano es su capacidad de aprender", author: "Anónimo" },
    { quote: "La inversión en conocimiento paga el mejor interés", author: "Benjamin Franklin" },
    { quote: "Educar no es llenar un recipiente, sino encender una hoguera", author: "William Butler Yeats" },
    { quote: "El conocimiento es poder", author: "Francis Bacon" },
    { quote: "La educación es el desarrollo en el hombre de toda la perfección de que su naturaleza es capaz", author: "Immanuel Kant" },
    { quote: "No hay nada más poderoso que una mente educada", author: "Anónimo" },
    { quote: "La educación es la base sobre la cual construimos nuestro futuro", author: "Christine Gregoire" },
    { quote: "Un maestro afecta la eternidad; nunca puede decir dónde termina su influencia", author: "Henry Adams" },
    { quote: "La educación es el gran igualador de las condiciones del hombre", author: "Horace Mann" },
    { quote: "Aprender sin pensar es inútil. Pensar sin aprender, peligroso", author: "Confucio" },
    { quote: "La sabiduría no es producto de la escolarización, sino de un intento a lo largo de toda la vida de adquirirla", author: "Albert Einstein" },
    { quote: "La educación es el movimiento de la oscuridad a la luz", author: "Allan Bloom" },
    { quote: "El propósito de la educación es reemplazar una mente vacía con una abierta", author: "Malcolm Forbes" }
  ], []); // Dependencia vacía para memoizar una vez

  // Obtiene la cita diaria usando el hook personalizado y la lista de citas
  const dailyQuote = useDailyQuote(currentTime, educationalQuotes);

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

  return (
    <div className="flex flex-col w-full h-full p-4 sm:p-6 lg:p-8 xl:p-10 font-sans">
      <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-lg sm:shadow-xl overflow-hidden max-w-7xl mx-auto w-full">

        {/* Encabezado con el saludo y el nombre del administrador */}
        <GreetingHeader greeting={getGreeting()} />

        {/* Sección de tarjetas de información */}
        <div className="px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6 xl:px-8 xl:py-8">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-6">

            {/* Tarjeta de Fecha */}
            <InfoCard
              title="Fecha"
              color="blue"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              content={
                <p className="text-xs sm:text-sm lg:text-base text-gray-600 capitalize leading-tight">
                  {formatDate(currentTime)}
                </p>
              }
            />

            {/* Tarjeta de Hora */}
            <InfoCard
              title="Hora"
              color="purple"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              content={
                <p className="text-sm sm:text-base lg:text-lg xl:text-xl font-mono text-gray-600">
                  {formatTime(currentTime)}
                </p>
              }
            />

            {/* Tarjeta de Estado del Sistema */}
            <InfoCard
              title="Estado"
              color="green"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              content={
                <div className="flex items-center justify-center gap-2">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-xs sm:text-sm lg:text-base text-gray-600">Sistema operativo</p>
                </div>
              }
            />
          </div>

          {/* Tarjeta de la Cita Diaria */}
          <QuoteCard quote={dailyQuote.quote} author={dailyQuote.author} />
        </div>
      </div>
    </div>
  );
}
