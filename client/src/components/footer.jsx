import Logo from "../assets/MQerK_logo.png";
import { Link } from "react-router-dom";

export default function Footer({
  brand = "MQerKAcademy",
  tagline = "Formando líderes en ciencia y tecnología.",
  logoSrc = Logo,
  year = new Date().getFullYear(),
  links = {
    academia: [
      { href: "/acerca_de", label: "Acerca de" },
      { href: "/cursos", label: "Cursos" },
      { href: "/#cursos", label: "Eventos" },
      { href: "/blog", label: "Blog" },
    ],
    recursos: [
      { href: "#", label: "Soporte" },
      { href: "#", label: "FAQ" },
      { href: "#", label: "Guía Padres" },
      { href: "#", label: "Comunidad" },
    ],
  },
  legal = {
    terms: { href: "/terminos_y_condiciones", label: "Términos" },
    privacy: { href: "/politicas_de_privacidad", label: "Privacidad" },
  },
}) {
  return (
    <footer className="bg-[#3c26cc] text-white relative overflow-hidden font-sans border-t border-white/10">

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        .animate-shimmer {
          animation: shimmer 4s linear infinite;
        }
      `}</style>

      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-[10%] -right-[5%] w-[300px] h-[300px] rounded-full bg-white blur-[80px]" />
        <div className="absolute -bottom-[10%] -left-[5%] w-[250px] h-[250px] rounded-full bg-blue-500 blur-[80px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-8">

        {/* --- CAMBIO CLAVE AQUÍ --- */}
        {/* Usamos grid-cols-2 desde móvil (por defecto) para ahorrar espacio vertical */}
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-8">

          {/* 1. MARCA Y REDES (Ocupa 2 columnas en móvil para centrarlo, 1 en desktop) */}
          <div className="col-span-2 lg:col-span-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4">
            <Link
              to="/"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2 group w-max"
            >
              <div className="bg-white/10 p-1.5 rounded-lg backdrop-blur-sm transition-transform group-hover:scale-105">
                <img
                  src={logoSrc}
                  alt={brand}
                  className="h-8 w-auto object-contain"
                />
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-gray-400 via-white to-gray-400 bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer">
                {brand}
              </span>
            </Link>
            <p className="text-xs text-gray-300 max-w-xs font-light mx-auto lg:mx-0">
              {tagline}
            </p>

            {/* Redes Sociales */}
            <div className="flex gap-3 pt-2 justify-center lg:justify-start">
              <SocialIcon href="https://facebook.com/MQerKAcademy" path="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
              <SocialIcon href="https://instagram.com/MQerKAcademy">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </SocialIcon>
              <SocialIcon href="https://youtube.com/@mqerkacademy">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
              </SocialIcon>
              <SocialIcon href="https://tiktok.com/@mqerkacademy_oficial">
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
              </SocialIcon>
            </div>
          </div>

          {/* 2. ACADEMIA (Columna izquierda en móvil) */}
          <div className="col-span-1">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 opacity-90 border-b border-white/20 pb-1 w-max">Academia</h3>
            <ul className="space-y-2">
              {links.academia.map((link, i) => (
                <FooterLink key={i} to={link.href}>{link.label}</FooterLink>
              ))}
            </ul>
          </div>

          {/* 3. RECURSOS (Columna derecha en móvil: alineada a la derecha para equilibrio) */}
          <div className="col-span-1 flex flex-col items-end lg:items-start group">
            <div className="w-fit">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 opacity-90 border-b border-white/20 pb-1 w-max">Recursos</h3>
              <ul className="space-y-2">
                {links.recursos.map((link, i) => (
                  <FooterLink key={i} to={link.href}>{link.label}</FooterLink>
                ))}
              </ul>
            </div>
          </div>

          {/* 4. CONTACTO (Ocupa 2 columnas en móvil por la longitud del email) */}
          <div className="col-span-2 lg:col-span-1 border-t border-white/10 lg:border-none pt-6 lg:pt-0">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 opacity-90 lg:block hidden">Contacto</h3>
            {/* Versión móvil centrada, Desktop alineada izquierda */}
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 opacity-90 block lg:hidden text-center">Contacto</h3>

            <ul className="space-y-3 flex flex-col items-center lg:items-start">
              <li className="w-full">
                <a href="mailto:mqerkacademycienytec@gmail.com" className="flex items-center lg:items-start gap-3 group text-sm text-gray-300 hover:text-white transition-colors justify-center lg:justify-start">
                  <svg className="w-5 h-5 text-white/70 group-hover:text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  {/* break-all asegura que el email largo no rompa el diseño */}
                  <span className="break-all text-center lg:text-left">mqerkacademycienytec@gmail.com</span>
                </a>
              </li>
              <li>
                <a href="tel:+522871515760" className="flex items-center gap-3 group text-sm text-gray-300 hover:text-white transition-colors">
                  <svg className="w-5 h-5 text-white/70 group-hover:text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  <span>+(52) 287 151 5760</span>
                </a>
              </li>
              <li className="flex items-center lg:items-start gap-3 text-sm text-gray-300">
                <svg className="w-5 h-5 text-white/70 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span>Tuxtepec, Oaxaca, México.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* BARRA INFERIOR */}
        <div className="mt-8 border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p className="text-center">© {year} {brand}.</p>
          <div className="flex gap-6">
            <Link to={legal.privacy.href} className="hover:text-white transition-colors">Privacidad</Link>
            <Link to={legal.terms.href} className="hover:text-white transition-colors">Términos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ href, path, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="h-8 w-8 flex items-center justify-center rounded-full bg-white/5 text-white/80 hover:bg-white hover:text-[#3c26cc] hover:scale-110 transition-all duration-300 ring-1 ring-white/10 hover:ring-white"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        {path ? <path d={path} /> : children}
      </svg>
    </a>
  );
}

function FooterLink({ to, children }) {
  const isAnchor = to.startsWith("#") || to.includes("/#");
  const className = "text-sm text-gray-300 hover:text-white hover:pl-1 transition-all duration-200 block w-max";
  return (
    <li>
      {isAnchor ? <a href={to} className={className}>{children}</a> : <Link to={to} className={className}>{children}</Link>}
    </li>
  );
}