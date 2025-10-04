import Logo from "../assets/MQerk_logo.png";

export default function FooterNeo({
  brand = "MQerkAcademy",
  tagline = "MQerk Academy",
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
    terms: { href: "/terminos", label: "Términos y condiciones" },
    privacy: { href: "/privacidad", label: "Política de privacidad" },
  },
  socials = {
    facebook: "https://facebook.com/",
    instagram: "https://instagram.com/",
    youtube: "https://youtube.com/",
    tiktok: "https://tiktok.com/",
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
              <Social href={socials.facebook} label="Facebook"><IconFacebook/></Social>
              <Social href={socials.instagram} label="Instagram" variant="outline"><IconInstagram/></Social>
              <Social href={socials.youtube} label="YouTube"><IconYoutube/></Social>
              <Social href={socials.tiktok} label="TikTok"><IconTiktok/></Social>
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
              <li><a href="mailto:mqerkacademycienytec@gmail.com" className="footer-link">mqerkacademycienytec@gmail.com</a></li>
              <li><a href="tel:+520000000000" className="footer-link">+(52) 287 151 5760</a></li>
              <li><span className="text-sm text-neutral-500 dark:text-neutral-400">Tuxtepec, Oax.</span></li>
            </ul>
          </div>
        </div>

        {/* Barra inferior */}
        <div className="mt-10 flex flex-col-reverse items-start gap-4 border-t border-neutral-200 pt-6 sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800">
          <p className="text-sm">© {year} {brand}. Todos los derechos reservados.</p>
          <ul className="flex items-center gap-5 text-sm">
            <li><a href={legal.terms.href} className="footer-link">{legal.terms.label}</a></li>
            <li className="h-4 w-px bg-neutral-300 dark:bg-neutral-700" />
            <li><a href={legal.privacy.href} className="footer-link">{legal.privacy.label}</a></li>
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
    <a href={href} aria-label={label} className={`${base}`}>{children}</a>
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