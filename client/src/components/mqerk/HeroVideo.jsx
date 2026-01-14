export default function HeroVideo({
  mp4Src = "",
  webmSrc = "",
  posterSrc = "",
  headline = "Título principal",
  subheadline = "Subtítulo",
  highlight = "",
  ctaText = "Empezar",
  ctaHref = "#",
  className = "",
}) {
  return (
    <section className={`relative isolate ${className}`}>
      {/* Video de fondo */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <video
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={posterSrc || undefined}
        >
          {webmSrc && <source src={webmSrc} type="video/webm" />}
          {mp4Src && <source src={mp4Src} type="video/mp4" />}
        </video>
        {/* Overlays para legibilidad */}
        <div className="absolute inset-0" />
        <div className="pointer-events-none absolute inset-0" />
      </div>

      {/* Contenido centrado */}
      <div className="mx-auto flex min-h-[60svh] md:min-h-[72svh] lg:min-h-[82svh] max-w-6xl items-center justify-center px-4 text-center text-white">
        <div className="space-y-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]">
            {headline}
          </h1>
          {subheadline && (
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
              {subheadline}
            </p>
          )}
          {highlight && (
            <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-yellow-300">
              {highlight}
            </p>
          )}

          <div className="pt-2">
            <a
              href={ctaHref}
              className="inline-flex items-center justify-center rounded-full border border-white/70 px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold bg-[#3c24ba]/50 hover:bg-[#3c24ba]/90 backdrop-blur-sm transition shadow-[0_0_0_3px_rgba(255,255,255,0.15)_inset]"
            >
              {ctaText}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
