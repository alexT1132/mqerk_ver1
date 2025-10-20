import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoBlanco from "../../assets/MQerK_logo.png";
import Cookies from "js-cookie";

export default function Topbar({
  title = "Asesores en Ciencias y Tecnología",
  settingsPath = "/administrador_configuraciones",
  loginPath = "/",
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  // Cerrar menú al hacer click fuera o con Esc
  useEffect(() => {
    const onDocClick = (e) => {
      if (!open) return;
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        btnRef.current && !btnRef.current.contains(e.target)
      ) setOpen(false);
    };
    const onEsc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const goSettings = () => { setOpen(false); navigate(settingsPath); };

  const doLogout = () => {
    setOpen(false);
    try { 
      Cookies.remove("access_token", "refresh_token", "rtoken_administrador", 'token_administrador');  
      localStorage.clear(); 
    } catch {}
    navigate(loginPath, { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 h-14 md:h-16 w-full border-b border-white/15">
      <div className="relative flex h-full items-center bg-gradient-to-r from-indigo-700 via-violet-700 to-fuchsia-700 text-white px-3 md:px-4">
        {/* Izquierda: volver + logo */}
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={() => navigate("/administrador")}
            aria-label="Regresar"
            className="p-2 rounded hover:bg-white/10"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <img src={LogoBlanco} alt="Logo" className="hidden md:block h-14 w-auto object-contain" />
        </div>

        {/* Centro: título */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-16">
          <h1 className="truncate text-sm md:text-base font-medium tracking-tight">
            {title}
          </h1>
        </div>

        {/* Derecha: avatar + menú minimal */}
        <div className="ml-auto relative">
          <button
            ref={btnRef}
            aria-label="Usuario"
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen(v => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 hover:bg-white/10"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
              <path strokeWidth="1.8" d="M12 12a4 4 0 100-8 4 4 0 000 8z" />
              <path strokeWidth="1.8" d="M4 20a8 8 0 1116 0" />
            </svg>
          </button>

          {open && (
            <div
              ref={menuRef}
              role="menu"
              className="absolute right-0 mt-2 w-44 rounded-lg bg-white/95 text-slate-800 border border-slate-200 backdrop-blur-sm"
            >
              <button
                role="menuitem"
                onClick={goSettings}
                className="w-full px-3 py-2 text-sm text-left hover:bg-slate-100"
              >
                Configuraciones
              </button>
              <div className="h-px bg-slate-200" />
              <button
                role="menuitem"
                onClick={doLogout}
                className="w-full px-3 py-2 text-sm text-left hover:bg-slate-100"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
