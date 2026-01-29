import Logo from "../assets/MQerK_logo.webp";

export default function FooterNeo({
  brand = "MQerKAcademy",
  tagline = "MQerKAcademy",
  logoSrc = Logo,
  year = new Date().getFullYear(),
  links = {
    academia: [
      { href: "#", label: "Acerca de" },
      { href: "#", label: "Cursos" },
      { href: "#", label: "Eventos" },
      { href: "#", label: "Blog" },
    ],
    recursos: [
      { href: "#", label: "Soporte" },
      { href: "#", label: "Preguntas frecuentes" },
      { href: "#", label: "Contacto" },
    ],
  },
  legal = {
    terms: { href: "/terminos_y_condiciones", label: "Términos y condiciones" },
    privacy: { href: "/politicas_de_privacidad", label: "Política de privacidad" },
  },
}) {
  return (
    <footer className="border-t border-neutral-200 bg-[#3c26cc] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Col 1 — Marca */}
          <div>
            <div className="flex items-center gap-3">
              {logoSrc && (
                <img
                  src={logoSrc}
                  alt={`${brand} logo`}
                  className="h-20 w-25 object-contain select-none"
                  loading="lazy"
                  decoding="async"
                />
              )}
              <div>
                <p className="text-xl font-extrabold text-[#3c26cc]">{brand}</p>
                <p className="text-sm text-white">{tagline}</p>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <Social 
                href='https://www.facebook.com/MQerKAcademy' 
                label="Facebook"
              >
                <IconFacebook/>
              </Social>
              <Social 
                href='https://www.instagram.com/MQerKAcademy' 
                label="Instagram" 
                variant="outline"
              >
                <IconInstagram/>
              </Social>
              <Social 
                href='https://www.youtube.com/@mqerkacademy' 
                label="YouTube"
              >
                <IconYoutube/>
              </Social>
              <Social 
                href='https://www.tiktok.com/@mqerkacademy_oficial?_r=1&_t=ZS-91NNGGqfLYC' 
                label="TikTok"
              >
                <IconTiktok/>
              </Social>
              <Social 
                href='https://open.spotify.com/user/mvn8ly2def6rlqnbgrck8p85h?si=rBP1ehWvQRqjLVivpqN4jA' 
                label="Spotify"
              >
                <IconSpotify/>
              </Social>
            </div>
          </div>

          {/* Col 2 — Academia */}
          <FooterGroup title="Academia">
            {links.academia.map((l, i) => (
              <li key={i}><a href={l.href} className="footer-link">{l.label}</a></li>
            ))}
          </FooterGroup>

          {/* Col 3 — Recursos */}
          <FooterGroup title="Recursos">
            {links.recursos.map((l, i) => (
              <li key={i}><a href={l.href} className="footer-link">{l.label}</a></li>
            ))}
          </FooterGroup>

          {/* Col 4 — Contacto simple */}
          <div>
            <h4 className="footer-title">Contacto</h4>
            <ul className="space-y-2">
              <li><a className="footer-link">mqerkacademycienytec@gmail.com</a></li>
              <li><a className="footer-link">+(52) 287 151 5760</a></li>
              <li><span className="text-sm text-neutral-500 dark:text-neutral-400">Tuxtepec, Oax.</span></li>
            </ul>
          </div>
        </div>

        {/* Barra inferior */}
        <div className="mt-10 flex flex-col-reverse items-start gap-4 border-t border-neutral-200 pt-6 sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800">
          <p className="text-sm">© {year} {brand}. Todos los derechos reservados.</p>
          <ul className="flex items-center gap-5 text-sm">
            <li><a target="_blank" rel="noopener noreferrer" href={legal.terms.href} className="footer-link">{legal.terms.label}</a></li>
            <li className="h-4 w-px bg-neutral-300 dark:bg-neutral-700" />
            <li><a target="_blank" rel="noopener noreferrer" href={legal.privacy.href} className="footer-link">
              {legal.privacy.label}</a></li>
          </ul>
        </div>
      </div>

      {/* utilidades locales */}
      <style>{`
        .footer-title{ @apply text-sm font-semibold tracking-wide text-neutral-900 dark:text-neutral-100; }
        .footer-link{ @apply text-sm text-neutral-700 hover:text-[#3c26cc] dark:text-neutral-300 dark:hover:text-white transition; }
      `}</style>
    </footer>
  );
}

function FooterGroup({ title, children }){
  return (
    <div>
      <h4 className="footer-title">{title}</h4>
      <ul className="mt-4 space-y-2">{children}</ul>
    </div>
  );
}

function Social({ href, label, children, variant = "solid" }){
  const base = "inline-flex h-10 w-10 items-center justify-center rounded-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3c26cc]/40";
  
  return (
    <a 
      href={href} 
      aria-label={label} 
      className={`${base}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}

/* ----------------------------- Íconos ----------------------------- */
function IconFacebook(){
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M13.5 21v-7h2.3l.4-2.8h-2.7v-1.8c0-.8.2-1.4 1.4-1.4h1.5V5.5c-.7-.1-1.5-.2-2.2-.2-2.2 0-3.7 1.3-3.7 3.8V11H8.2v2.8H10.5V21h3z" />
    </svg>
  );
}
function IconInstagram(){
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="5" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3.2" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  );
}
function IconYoutube(){
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M23 12s0-3.2-.4-4.6a3.2 3.2 0 0 0-2.2-2.2C18.9 4.8 12 4.8 12 4.8s-6.9 0-8.4.4A3.2 3.2 0 0 0 1.4 7.4C1 8.8 1 12 1 12s0 3.2.4 4.6c.3 1 .9 1.8 2.2 2.2 1.5.4 8.4.4 8.4.4s6.9 0 8.4-.4a3.2 3.2 0 0 0 2.2-2.2c.4-1.4.4-4.6.4-4.6ZM9.8 8.7l5.7 3.3-5.7 3.3V8.7z" />
    </svg>
  );
}
function IconTiktok(){
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M20 8.3a6.5 6.5 0 0 1-4-1.8v7.1a5.6 5.6 0 1 1-4.8-5.6v2.8a2.9 2.9 0 1 0 2.1 2.8V1.5H16a6.4 6.4 0 0 0 4 3.7V8.3Z" />
    </svg>
  );
}
function IconSpotify(){
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.73 14.52c-.15.23-.42.3-.66.15-1.82-1.11-4.11-1.36-6.81-.75-.26.06-.52-.1-.58-.36-.06-.26.1-.52.36-.58 2.96-.67 5.49-.38 7.52.87.24.14.31.42.17.67zm.94-2.09c-.19.29-.59.38-.88.19-2.08-1.28-5.25-1.65-7.72-.9-.31.09-.64-.09-.73-.4-.09-.31.09-.64.4-.73 2.83-.86 6.39-.44 8.74 1.02.29.18.38.58.19.87zm.08-2.18C14.04 11 8.78 10.76 5.68 11.58c-.37.1-.76-.12-.86-.49-.1-.37.12-.76.49-.86 3.56-1 9.38-.72 12.94.86.34.15.49.56.34.9-.15.35-.56.5-.9.35z" />
    </svg>
  );
}