import React, { useEffect, useState } from "react";

export default function FloatingWhatsapp({
  phone,
  message = "¡Hola! Me interesa obtener más información.",
  position = "br",
  showAfter = 0,
  tooltip = "¿Dudas? Escríbenos",
  className = "",
  pulse = true,
  zIndex = 50,
  offset = "lg",
  tooltipOnHover = true,
}) {
  const [visible, setVisible] = useState(showAfter === 0);

  useEffect(() => {
    if (showAfter === 0) return;
    const onScroll = () => setVisible(window.scrollY >= showAfter);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [showAfter]);

  // Offsets (un poco más adentro de la pantalla)
  const offsets = {
    sm: "right-4 md:right-6",
    md: "right-6 md:right-8",
    lg: "right-10 md:right-14",      
    xl: "right-14 md:right-20",
  };
  const x = offsets[offset] ?? offset; 

  const corner = {
    br: `${x} bottom-5 md:bottom-8`,
    bl: `left-10 md:left-14 bottom-5 md:bottom-8`,
    tr: `${x} top-5 md:top-8`,
    tl: `left-10 md:left-14 top-5 md:top-8`,
  }[position];

  if (!phone) return null;
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <div
      className={`fixed ${corner} z-[${zIndex}] transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Tooltip pill con flecha; aparece en hover para desktop */}
      {tooltip && (
        <span
          className={[
            "absolute -top-3 right-[calc(100%+10px)]", // a la izquierda del botón para que no se corte
            "hidden md:flex items-center gap-2",
            "px-3 py-1 rounded-full bg-neutral-900/90 text-white text-xs shadow-lg",
            "backdrop-blur-sm border border-white/10",
            tooltipOnHover ? "group-hover:flex" : "flex",
            "after:content-[''] after:absolute after:top-1/2 after:-translate-y-1/2",
            "after:-right-1.5 after:border-8 after:border-transparent after:border-l-neutral-900/90",
          ].join(" ")}
        >
          {tooltip}
        </span>
      )}

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Abrir chat de WhatsApp"
        className={[
          "group relative inline-flex items-center justify-center",
          "w-14 h-14 md:w-16 md:h-16 rounded-full",
          // Fondo con gradiente y ring limpio
          "bg-gradient-to-br from-[#25D366] to-[#16a34a]",
          "ring-1 ring-white/45 shadow-[0_10px_22px_rgba(37,211,102,0.35)] hover:shadow-[0_14px_28px_rgba(37,211,102,0.45)]",
          "transition-transform duration-200 ease-out hover:-translate-y-0.5 active:scale-95",
          pulse ? "animate-[pulse_2.2s_ease-in-out_infinite]" : "",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
          className,
        ].join(" ")}
      >
        {/* Brillo sutil + sombreado inferior */}
        <span className="pointer-events-none absolute inset-0 rounded-full overflow-hidden">
          <span className="absolute -top-1 left-1/4 w-1/2 h-1/3 rounded-full bg-white/25 blur-md opacity-60" />
          <span className="absolute bottom-0 inset-x-0 h-1/3 bg-black/10" />
        </span>

        {/* Anillo interior suave para “premium feel” */}
        <span className="absolute inset-[3px] rounded-full ring-1 ring-white/40" />

        {/* Ícono WhatsApp sobre círculo blanco (más contraste) */}
        <span className="relative flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full bg-white shadow-sm">
          <svg
            aria-hidden="true"
            viewBox="0 0 256 256"
            className="w-5.5 h-5.5 md:w-6 md:h-6"
          >
            <path
              fill="#25D366"
              fillRule="evenodd"
              d="M187.2 68.9A60.6 60.6 0 0 0 128.1 48c-33.2.3-60.2 27.5-60.2 60.7 0 10.7 2.8 21.2 8.1 30.5l-8.7 31.7 32.4-8.5c9 4.8 19 7.4 29.2 7.4h.1c33.3 0 60.6-27.1 60.9-60.4a60.6 60.6 0 0 0-2.7-20.5zm-59.2 94.8h-.1c-9.5 0-18.9-2.5-27.1-7.2l-1.9-1.1-19.3 5 5.2-18.9-1.2-1.9a46.9 46.9 0 0 1-7.2-24.6c0-26 21.1-47.2 47.1-47.3 12.6-.1 24.5 4.8 33.4 13.7a47.1 47.1 0 0 1 13.9 33.3c-.2 26-21.4 47.1-47.7 47.1zm27.8-35.5c-1.5-.8-8.8-4.7-10.2-5.2-1.4-.5-2.4-.8-3.5.8-1 1.5-4 5.2-4.9 6.3-.9 1-1.8 1.2-3.3.4-1.5-.8-6.4-2.3-12.3-7.6-4.5-4-7.6-9-8.5-10.5-.9-1.5-.1-2.3.7-3.1.7-.7 1.8-1.9 2.7-2.9.9-1 .1-2.1-.1-2.9-.2-.8-3-7.3-4.1-10.1-1.1-2.7-2.2-2.3-3.3-2.4l-2.8-.1c-1 0-2.6.4-3.9 1.9-1.3 1.5-5.1 4.9-5.1 12 0 7.1 5.2 14 5.9 14.9.7.9 10.2 15.4 24.6 21 .3.1.6.3.9.4 2.4 1 4.8 1.8 7.2 2.4 3 0 6 .1 8.8-.3 2-.3 6.3-2.6 7.2-5.1.9-2.5.9-4.7.6-5.2-.3-.5-1.2-.9-2.7-1.7z"
            />
          </svg>
        </span>

        <span className="sr-only">WhatsApp</span>
      </a>
    </div>
  );
}
