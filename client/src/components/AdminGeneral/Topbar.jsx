import LogoBlanco from "../../assets/MQerK_logo.png"; // ajusta la ruta

export default function Topbar({
  title = "Asesores Especializados en la Enseñanza de las Ciencias y Tecnología",
}) {

  return (
    <header className="sticky top-0 z-50 h-14 md:h-16 w-full shadow-md">
      <div className="relative flex h-full items-center bg-gradient-to-r from-indigo-700 via-violet-700 to-fuchsia-700 text-white px-3 md:px-4">
        {/* IZQ: Flecha + logo */}
        <div className="flex items-center gap-2 md:gap-3">
          

          {/* Logo oculto en móvil */}
          <img
            src={LogoBlanco}
            alt="Logo"
            className="hidden md:block h-8 w-auto object-contain md:h-9"
          />
        </div>

        {/* Título centrado (NO bloquea clics) */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-16">
          <h1 className="truncate text-center text-[15px] font-semibold tracking-tight md:text-lg">
            {title}
          </h1>
        </div>

        {/* Avatar (derecha) */}
        <button
          aria-label="Usuario"
          className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/10 backdrop-blur-sm hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
            <path strokeWidth="1.8" d="M12 12a4 4 0 100-8 4 4 0 000 8z" />
            <path strokeWidth="1.8" d="M4 20a8 8 0 1116 0" />
          </svg>
        </button>
      </div>
    </header>
  );
}
